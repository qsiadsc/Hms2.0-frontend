import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardApi } from '../../card-api';
import { CardServiceService } from '../../card-service.service';
import { CardHolderPopupComponent } from '../../card-holder-popup/card-holder-popup.component';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'card-holder-role-assigned',
  templateUrl: './card-holder-role-assigned.component.html',
  styleUrls: ['./card-holder-role-assigned.component.css'],
  providers: [ChangeDateFormatService]
})
export class CardHolderRoleAssignedComponent implements OnInit {

  @Input() CardHolderRoleAssignedFormGroup: FormGroup;
  @Input() chCardKey: string;
  @Input() ageObject: {
    "age1": 0,
    "age2": 0
  };
  @Input() cardHolderAge: string;
  @Input() cardHolderKey: string;
  @Input() chRoleAssignKey: string;
  @Input() alberta: string;
  @Input() isModify: boolean = false;
  @Input() addMode: boolean = false;
  @Input() viewMode: boolean = false;
  @Input() editMode: boolean = false;
  @ViewChild(CardHolderPopupComponent) cardHolderPopupComponent;

  arrRoleList;
  error: any;
  checkFocus
  ObservableObj
  cardEffDate
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  cardEffDateCardExp: any;
  expired: boolean;
  effDateSubs: Subscription;
  effectiveSubs: Subscription;

  constructor(private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastrService: ToastrService,
    public cardService: CardServiceService) {
    this.error = { isError: false, errorMessage: '' };
    this.GetCardHolderRoleList();

    this.effDateSubs = cardService.cardEffectiveDate.subscribe((value) => {
      this.cardEffDate = value
      this.CardHolderRoleAssignedFormGroup.patchValue({ 'effective_date': this.changeDateFormatService.convertStringDateToObject(this.cardEffDate) });
    });

    this.effectiveSubs = cardService.cardEffDate.subscribe((value) => {
      this.cardEffDateCardExp = value;
      this.checkExpiry(value)
    })
  }

  cardholderRoleAssignedVal = {
    description: ['', Validators.required],
    effective_date: ['', Validators.required],
    expiry_date: ['']
  }

  ngOnInit() { }

  RoleAssignedHistory() {
    this.hmsDataServiceService.OpenCloseModal('btnModalRoleAssignmentHistory');
  }

  GetCardHolderRoleList() {
    this.hmsDataServiceService.getApi(CardApi.getCardHolderRoleListUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrRoleList = data.result;
      }
    })
  }

  validateCardHolderRole(evt) {
    if (evt.target.value != 26) {
      $("#btnAddNewStudentHis").css("display", "none")
    } else {
      $("#btnAddNewStudentHis").css("display", "block")

    }
    var PrimaryCodeValue
    var DependantCodeValue
    for (var i = 0; i < this.arrRoleList.length; i++) {
      if (this.arrRoleList[i].chRoleCD == "P") {
        PrimaryCodeValue = this.arrRoleList[i].chRoleKey
      }
      else if (this.arrRoleList[i].chRoleCD == "D") {
        DependantCodeValue = this.arrRoleList[i].chRoleKey
      }
    }
    if (evt.target.value == PrimaryCodeValue) {
      var chCardKey = this.chCardKey;
      var cardHolderKey = this.cardHolderKey;
      var chRoleAssignKey = this.chRoleAssignKey;
      var roleKey = evt.target.value;

      if (this.addMode) {
        chRoleAssignKey = '0'
      }
      var requiredData = {
        "cardHolderKey": cardHolderKey, // Optional required if update Role Assignment
        "cardKey": chCardKey, // Mandatory
        "chRoleAssignKey": chRoleAssignKey,  // Mandatory
        "roleKey": roleKey
      }

      this.hmsDataServiceService.postApi(CardApi.checkCardHolderRoleUrl, requiredData).subscribe(data => {
        if (data.hmsMessage.messageShort == 'ROLE_ASSIGN_NOT_ALLOWED') {
          this.toastrService.warning('Primary Role already assigned to another Card Holder');
          this.CardHolderRoleAssignedFormGroup.patchValue({ 'description': '' });
        }
        else {
          $('#divStudentHistory').css("display", "none");
        }
      })
    }
    else if (evt.target.value == DependantCodeValue && !this.alberta) {
      $('#divStudentHistory').css("display", "block");
      if ($('#chkCompanyEmployee').is(':checked')) {
        this.toastrService.warning("Dependent Role can not be selected for Company Employee");
        this.CardHolderRoleAssignedFormGroup.patchValue({ 'description': '' });
      }
    }
    else {
      $('#divStudentHistory').css("display", "block");
    }
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.CardHolderRoleAssignedFormGroup.patchValue(datePickerValue);
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
      this.CardHolderRoleAssignedFormGroup.patchValue(datePickerValue);
    }

    if (this.CardHolderRoleAssignedFormGroup.value.effective_date && this.CardHolderRoleAssignedFormGroup.value.expiry_date) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardHolderRoleAssignedFormGroup.value.effective_date.date, this.CardHolderRoleAssignedFormGroup.value.expiry_date.date);
      if (this.error.isError == true) {
        this.CardHolderRoleAssignedFormGroup.controls['expiry_date'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    if (this.cardEffDateCardExp) {
      if (this.cardEffDateCardExp['expiry_date'] && this.CardHolderRoleAssignedFormGroup.value.expiry_date) {
        this.error = this.changeDateFormatService.compareTwoDates(this.CardHolderRoleAssignedFormGroup.value.expiry_date.date, this.cardEffDateCardExp['expiry_date'].date);
        if (this.error.isError == true) {
          this.CardHolderRoleAssignedFormGroup.controls['expiry_date'].setErrors({
            "cardholderExpiry": true
          });
        }
      }
    }
    if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  checkExpiry(value) {
    if (value) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(value['expiry_date']);
    }
  }

  validateRoleByCardHolderDOB() {
    if (parseInt(this.cardHolderAge) > this.ageObject.age1 && parseInt(this.cardHolderAge) < this.ageObject.age2) {
      this.CardHolderRoleAssignedFormGroup.patchValue({ 'description': '' });
    }
  }

  ngOnDestroy() {
    if (this.effDateSubs) {
      this.effDateSubs.unsubscribe()
    }
    else if (this.effectiveSubs) {
      this.effectiveSubs.unsubscribe()
    }
  }
}