import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { CardApi } from '../card-api';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
@Component({
  selector: 'app-card-holder-history-popup',
  templateUrl: './card-holder-history-popup.component.html',
  styleUrls: ['./card-holder-history-popup.component.css'],
  providers: [ChangeDateFormatService, HmsDataServiceService, TranslateService]
})

export class CardHolderHistoryPopupComponent implements OnInit {
  showUpdateRoleBtn: boolean = false;
  @ViewChildren(DataTableDirective)
  @Input() chCardKey: string;
  dtElements: QueryList<any>;
  @Output() emitOnSave: EventEmitter<any> = new EventEmitter<any>();
  dtElement: DataTableDirective;
  checkRole = true;
  observObj;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  @Input() ageObject: {
    "age1": 0,
    "age2": 0
  };
  @Input() alberta: string;
  @Input() cardHolderKey: string;
  CardHolderPopUpRoleAssignedFormGroup: FormGroup;
  chRoleAssignKey: string = '';
  arrRoleList;
  error: any;
  roleSubmitButtonText: string;
  roleHistorytableData = [];
  PrimaryCodeValue;
  DependantCodeValue;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  disableForm: boolean = false;
  disableRoleHistroy: boolean;
  expired: boolean = false;

  constructor(private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private datatableService: DatatableService,
    private toastrService: ToastrService,
    private translate: TranslateService) {
    this.error = { isError: false, errorMessage: '' };
    this.CardHolderPopUpRoleAssignedFormGroup = new FormGroup({
      description: new FormControl('', [Validators.required]),
      effective_date: new FormControl('', [Validators.required]),
      expiry_date: new FormControl(''),
    });

    this.observObj = Observable.interval(1000).subscribe(value => {
      if (this.checkRole = true) {
        if ('card.button-save' == this.translate.instant('card.button-save')) {
        } else {
          this.roleSubmitButtonText = this.translate.instant('card.button-save');
          this.checkRole = false;
          this.observObj.unsubscribe();
        }
      }
    });
  }
  cardholderRoleAssignedVal = {
    description: ['', Validators.required],
    effective_date: ['', Validators.required],
    expiry_date: ['']
  }

  ngOnInit() {
    this.GetCardHolderRoleList();
    this.dtOptions['rolesAssignmentHistory'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
    this.dtTrigger['rolesAssignmentHistory'] = new Subject();
  }

  reloadTable(tableID) {
    this.datatableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  ngAfterViewInit(): void {
    this.dtTrigger['rolesAssignmentHistory'].next()
  }

  GetCardHolderRoleList() {
    this.hmsDataService.getApi(CardApi.getCardHolderRoleListUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrRoleList = data.result;
        for (var i = 0; i < this.arrRoleList.length; i++) {
          if (this.arrRoleList[i].chRoleCD == "P") {
            this.PrimaryCodeValue = this.arrRoleList[i].chRoleKey
          }
          else if (this.arrRoleList[i].chRoleCD == "D") {
            this.DependantCodeValue = this.arrRoleList[i].chRoleKey
          }
        }
      }
    })
  }

  SaveCHRoleHistory() {
    if (this.CardHolderPopUpRoleAssignedFormGroup.valid) {
      var roleExpiryOn = this.changeDateFormatService.convertDateObjectToString(this.CardHolderPopUpRoleAssignedFormGroup.value.expiry_date)
      var roleEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.CardHolderPopUpRoleAssignedFormGroup.value.effective_date)

      if (this.CardHolderPopUpRoleAssignedFormGroup.value.description == this.DependantCodeValue) {
        var ignorePlanAge = $('#cch_eligibilityIgnorePlan').is(':checked')
        var cardHolderAge = $('#lblCardHolderAge').html();
        if (($('#chkCompanyEmployee').is(':checked')) && !this.alberta) {
          this.toastrService.warning("Dependent Role can not be selected for Company Employee");
          this.CardHolderPopUpRoleAssignedFormGroup.patchValue({ 'description': '' });
        }
        if (!this.alberta && !ignorePlanAge) {
          var studentHistoryCount = $('#lblStudentHistory').html();
          if (parseInt(studentHistoryCount) > 0 && parseInt(cardHolderAge) >= this.ageObject.age2) {
            this.toastrService.warning("For Dependant CardHolder, Age should be less than " + this.ageObject.age2 + " years!")
            return false;
          }
          else if (parseInt(studentHistoryCount) == 0 && parseInt(cardHolderAge) >= this.ageObject.age1) {
            this.toastrService.warning("For Dependant CardHolder, Age should be less than " + this.ageObject.age1 + " years!")
            return false;
          }
        }
      }
      var businessTypeCd;
      if (this.alberta) {
        businessTypeCd = 'S'
      }
      else {
        businessTypeCd = 'Q'
      }
      var requestedData = {
        "cardHolderKey": this.cardHolderKey,
        "chRoleKey": this.CardHolderPopUpRoleAssignedFormGroup.value.description,
        "roleExpiryOn": roleExpiryOn,
        "roleEffectiveOn": roleEffectiveOn,
        "chRoleAssignKey": this.chRoleAssignKey,
        "businessTypeCd": businessTypeCd
      }

      this.hmsDataService.postApi(CardApi.saveUpdateCardHolderRoleAssignmentUrl, requestedData).subscribe(data => {
        if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
          this.emitOnSave.emit(this.CardHolderPopUpRoleAssignedFormGroup.value);
          this.roleSubmitButtonText = this.translate.instant('card.button-save');
          this.disableForm = false
          this.chRoleAssignKey = '';
          this.getRoleHistory();
          if (this.alberta) {
            this.toastrService.success("Record Updated Successfully !")
            this.showUpdateRoleBtn = false;
          }
          else {
            this.toastrService.success(this.translate.instant('card.toaster.record-save'));
          }
          this.CardHolderPopUpRoleAssignedFormGroup.reset();
          this.CardHolderPopUpRoleAssignedFormGroup.patchValue({ 'description': '' })
        } else if (data.code == 400 && data.message == 'FIRST_EXPIRED_OLD_ONE_RECORD') {
          this.toastrService.error("Please Expire Previous Record First!")
        }
        else if (data.code == 400 && data.message == 'ROLE_EFFECTIVEON_SHOULD_BE_GREATER_OR_EQUAL_OLD_EFFECTIVEON') {
          this.toastrService.error("Role Effective Date Should Be Greater Than or Equal To Previous Effective Date!")
        }
        else if (data.code == 400 && data.message == 'ROLE_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
          this.toastrService.error("Role Effective Date Should Be Greater Than Previous Expiry Date!")
        }
        else if (data.code == 400 && data.message == 'ROLE_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
          this.toastrService.error("Role Effective Date Should Be Greater Than Previous Effective Date!")
        }
        else {
          this.toastrService.error(this.translate.instant('card.toaster.record-notsave'));
        }
      });
    }
    else {
      this.validateAllFormFields(this.CardHolderPopUpRoleAssignedFormGroup)
    }
  }

  getRoleHistory() {
    let requestedData = {
      "cardHolderKey": this.cardHolderKey,
      "startPos": "0",
      "pageSize": "25"
    }
    this.hmsDataService.postApi(CardApi.getCardHolderRoleAssignHisorytUrl, requestedData).subscribe(
      res => {
        this.roleHistorytableData = [];
        if (res.hmsMessage.messageShort != 'RECORD_NOT_FOUND') {
          this.roleHistorytableData = res.result;
          var dateCols = ['roleEffectiveOn', 'roleExpiryOn'];
          this.changeDateFormatService.dateFormatListShow(dateCols, res.result);

          this.CardHolderPopUpRoleAssignedFormGroup.reset();
          this.CardHolderPopUpRoleAssignedFormGroup.patchValue({ 'description': '' })
        }
      });
  }

  setRoleHistoryForm(data) {
    this.showUpdateRoleBtn = true
    this.disableRoleHistroy = false;
    let RoleHistoryFormValue = {
      description: data.chRoleKey,
      effective_date: this.changeDateFormatService.convertStringDateToObject(data.roleEffectiveOn),
      expiry_date: this.changeDateFormatService.convertStringDateToObject(data.roleExpiryOn)
    }
    this.CardHolderPopUpRoleAssignedFormGroup.patchValue(RoleHistoryFormValue);
    this.disableForm = true
    this.chRoleAssignKey = data.chRoleAssignKey
    this.roleSubmitButtonText = this.translate.instant('card.button-update');
  }

  validateCardHolderRole(evt) {
    var primaryCodeValue;
    var dependantCodeValue;
    for (var i = 0; i < this.arrRoleList.length; i++) {
      if (this.arrRoleList[i].chRoleCD == "P") {
        primaryCodeValue = this.arrRoleList[i].chRoleKey
      }
      else if (this.arrRoleList[i].chRoleCD == "D") {
        dependantCodeValue = this.arrRoleList[i].chRoleKey
      }
    }

    if (evt.target.value == primaryCodeValue) {
      var chCardKey = $('#hndChCardKey').val();
      var cardHolderKey = this.cardHolderKey;
      var chRoleAssignKey = $('#hndChRoleAssignKey').val();;
      var roleKey = evt.target.value;
      var requiredData = {
        "cardHolderKey": cardHolderKey, // Optional required if update Role Assignment
        "cardKey": chCardKey, // Mandatory
        "chRoleAssignKey": chRoleAssignKey,  // Mandatory
        "roleKey": roleKey
      }

      this.hmsDataService.postApi(CardApi.checkCardHolderRoleUrl, requiredData).subscribe(data => {
        if (data.hmsMessage.messageShort == 'ROLE_ASSIGN_NOT_ALLOWED') {
          alert('Primary Role already assigned to another Card Holder');
          this.CardHolderPopUpRoleAssignedFormGroup.patchValue({ 'description': '' });
        }
      })
    }
    else if (evt.target.value == dependantCodeValue && !this.alberta) {
      if ($('#chkCompanyEmployee').is(':checked')) {
        this.toastrService.warning("Dependent Role can not be selected for Company Employee");
        this.CardHolderPopUpRoleAssignedFormGroup.patchValue({ 'description': '' });
      }

      var ignorePlanAge = $('#cch_eligibilityIgnorePlan').is(':checked')
      var cardHolderAge = $('#lblCardHolderAge').html();
      if (!this.alberta && !ignorePlanAge) {

        var studentHistoryCount = $('#lblStudentHistory').html();
        if (parseInt(studentHistoryCount) > 0 && parseInt(cardHolderAge) >= this.ageObject.age2) {
          this.toastrService.warning("For Dependant CardHolder, Age should be less than " + this.ageObject.age2 + " years!")
          return false;
        }
        else if (parseInt(studentHistoryCount) == 0 && parseInt(cardHolderAge) >= this.ageObject.age1) {
          this.toastrService.warning("For Dependant CardHolder, Age should be less than " + this.ageObject.age1 + " years!")
          return false;
        }
      }
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      if (formName == 'CardHolderPopUpRoleAssignedFormGroup') {
        this.CardHolderPopUpRoleAssignedFormGroup.patchValue(datePickerValue);
      }

    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      if (formName == 'CardHolderPopUpRoleAssignedFormGroup') {
        this.CardHolderPopUpRoleAssignedFormGroup.patchValue(datePickerValue);
      }
    }
    if (formName == 'CardHolderPopUpRoleAssignedFormGroup') {
      if (this.CardHolderPopUpRoleAssignedFormGroup.value.effective_date && this.CardHolderPopUpRoleAssignedFormGroup.value.expiry_date) {
        this.error = this.changeDateFormatService.compareTwoDates(this.CardHolderPopUpRoleAssignedFormGroup.value.effective_date.date, this.CardHolderPopUpRoleAssignedFormGroup.value.expiry_date.date);
        if (this.error.isError == true) {
          this.CardHolderPopUpRoleAssignedFormGroup.controls['expiry_date'].setErrors({
            "ExpiryDateNotValid": true
          });
        }
      }
      if (frmControlName == 'effective_date') {
        var CardHolderEffectiveDate = $('#dtCardHolderEffectiveDate').find("input").val();
        if (CardHolderEffectiveDate && this.CardHolderPopUpRoleAssignedFormGroup.value.effective_date) {
          let inPutdateInString = this.changeDateFormatService.convertDateObjectToString(obj);
          if (event.reason == 1) {
            inPutdateInString = event.value;
          }
          else {
            inPutdateInString = this.changeDateFormatService.convertDateObjectToString(obj);
          }

          var IsEffDateValid = this.changeDateFormatService.compareTwoDate(CardHolderEffectiveDate, inPutdateInString);
          if (IsEffDateValid) {
            this.CardHolderPopUpRoleAssignedFormGroup.patchValue({ 'effective_date': '' });
            this.toastrService.warning("Role Assigned Effective date can't be less then Card Holder Effective date!");
          }
        }
      }
      else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
        this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);

      }
    }
  }

  roleHistoryModal() {
    this.showUpdateRoleBtn = false;
    if (this.alberta) {
      this.disableRoleHistroy = true;
    }
    else {
      this.disableRoleHistroy = false;
    }
  }
}