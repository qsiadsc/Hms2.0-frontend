import { Component, OnInit, Input, Output, EventEmitter, QueryList, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { CardApi } from '../card-api';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Subject, Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { ClaimService } from '../../claim-module/claim.service';
@Component({
  selector: 'app-card-holder-cobhistory-popup',
  templateUrl: './card-holder-cobhistory-popup.component.html',
  styleUrls: ['./card-holder-cobhistory-popup.component.css'],
  providers: [ChangeDateFormatService, HmsDataServiceService, TranslateService, ClaimService]
})

export class CardHolderCobhistoryPopupComponent implements OnInit {
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  @Input() cardHolderKey: string;
  @Input() alberta: boolean;
  @Output() emitOnSave: EventEmitter<any> = new EventEmitter<any>();
  CardHolderPopUpCOBFormGroup: FormGroup;
  chCobHistoryKey: string = '';
  arrCarrierList;
  error: any;
  checkCobHistory = true;
  observableCobObj;
  COBSubmitButtonText: string;
  cobHistorytableData = [];
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  isBenifitError: boolean = false;
  cardholderCobVal = {
    policy: "",
    effective_date: "",
    expiry_date: "",
    carrier: "",
    benefits: '',
    cobDental: '',
    cobDrug: '',
    cobHealth: '',
    cobHSA: '',
    cobVision: '',
    validated: false,
  }
  noData: boolean;
  albertaVal: boolean = false;
  constructor(private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private datatableService: DatatableService,
    private toastrService: ToastrService,
    private claimService: ClaimService,
    private translate: TranslateService) {
    this.error = { isError: false, errorMessage: '' };

    this.CardHolderPopUpCOBFormGroup = new FormGroup
      ({
        policy: new FormControl(''),
        effective_date: new FormControl('', Validators.required),
        expiry_date: new FormControl(''),
        carrier: new FormControl(null, Validators.required),
        benefits: new FormControl('', Validators.required),
        cobDental: new FormControl(''),
        cobDrug: new FormControl(''),
        cobHealth: new FormControl(''),
        cobHSA: new FormControl(''),
        cobVision: new FormControl(''),
        cobWellness: new FormControl('')
      });

    this.observableCobObj = Observable.interval(1000).subscribe(value => {
      if (this.checkCobHistory = true) {
        if ('card.button-save' == this.translate.instant('card.button-save')) {
        } else {
          this.COBSubmitButtonText = this.translate.instant('card.button-save');
          this.checkCobHistory = false;
          this.observableCobObj.unsubscribe();
        }
      }
    });
  }

  cardholderRoleAssignedVal = {
    policy: [''],
    effective_date: [''],
    expiry_date: [''],
    carrier: [null],
    cobDental: [''],
    cobDrug: [''],
    cobHealth: [''],
    cobHSA: [''],
    cobVision: [''],
    validated: false,
    benefits: [''],
  }

  ngOnInit() {
    this.GetCarrierList();
    this.dtOptions['COBHistory'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]], }
    this.dtTrigger['COBHistory'] = new Subject();
  }

  reloadTable(tableID) {
    this.datatableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  ngAfterViewInit(): void {
    this.dtTrigger['COBHistory'].next()
  }

  GetCarrierList() {
    this.hmsDataService.getApi(CardApi.getCarrierListUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrCarrierList = data.result;
      }
    })
  }

  SaveCHCOBHistory() {
    if (this.CardHolderPopUpCOBFormGroup.valid && this.CardHolderPopUpCOBFormGroup.value.benefits) {
      let cobDental;
      let cobHealth;
      let cobVision;
      let cobDrug;
      let cobHSA;
      let cobWellness;
      var cobExpiryOn = this.changeDateFormatService.convertDateObjectToString(this.CardHolderPopUpCOBFormGroup.value.expiry_date)
      var cobEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.CardHolderPopUpCOBFormGroup.value.effective_date)

      cobDental = this.CardHolderPopUpCOBFormGroup.value.cobDental;
      if (cobDental) {
        cobDental = 'T'
      }
      else {
        cobDental = 'F'
      }

      cobDrug = this.CardHolderPopUpCOBFormGroup.value.cobDrug;
      if (cobDrug) {
        cobDrug = 'T'
      }
      else {
        cobDrug = 'F'
      }

      cobVision = this.CardHolderPopUpCOBFormGroup.value.cobVision;
      if (cobVision) {
        cobVision = 'T'
      }
      else {
        cobVision = 'F'
      }

      cobHealth = this.CardHolderPopUpCOBFormGroup.value.cobHealth;
      if (cobHealth) {
        cobHealth = 'T'
      }
      else {
        cobHealth = 'F'
      }

      cobHSA = this.CardHolderPopUpCOBFormGroup.value.cobHSA;
      if (cobHSA) {
        cobHSA = 'T'
      }
      else {
        cobHSA = 'F'
      }

      cobWellness = this.CardHolderPopUpCOBFormGroup.value.cobWellness;
      if (cobWellness) {
        cobWellness = 'T'
      }
      else {
        cobWellness = 'F'
      }

      var requestedData = {
        "cardHolderKey": this.cardHolderKey,
        "chCobHistoryKey": this.chCobHistoryKey,
        "chOtherPlanKey": this.CardHolderPopUpCOBFormGroup.value.carrier,
        "cobExpiryOn": cobExpiryOn,
        "cobEffectiveOn": cobEffectiveOn,
        "cobPolicyNum": this.CardHolderPopUpCOBFormGroup.value.policy,
        "cobDental": cobDental,
        "cobDrug": cobDrug,
        "cobHealth": cobHealth,
        "cobHSA": cobHSA,
        "cobVision": cobVision,
        "cobWellness": cobWellness,
      }

      this.hmsDataService.postApi(CardApi.saveUpdateCardHolderCobHistoryUrl, requestedData).subscribe(data => {
        if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
          this.emitOnSave.emit(this.CardHolderPopUpCOBFormGroup.value);
          this.COBSubmitButtonText = this.translate.instant('card.button-save')
          this.chCobHistoryKey = '';
          this.getRoleHistory();
          this.toastrService.success(this.translate.instant('card.toaster.record-save'));
          this.isBenifitError = false;
          this.CardHolderPopUpCOBFormGroup.reset();
          this.CardHolderPopUpCOBFormGroup.patchValue({ 'description': '' })
        } else if (data.code == 400 && data.message == 'FIRST_EXPIRED_OLD_ONE_RECORD') {
          this.toastrService.error("Please Expire Previous Record First!")
        }
        else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
          this.toastrService.error("Effective date should be greater than previous Expiry date.!")
        } else {
          this.toastrService.error(this.translate.instant('card.toaster.record-notsave'));
        }
      });
    }
    else {
      if (!this.CardHolderPopUpCOBFormGroup.value.benefits) {
        this.isBenifitError = true
      }
      this.validateAllFormFields(this.CardHolderPopUpCOBFormGroup)
    }
  }

  getRoleHistory() {
    this.COBSubmitButtonText = this.translate.instant('card.button-save'); // Task 609
    let requestedData = {
      "cardHolderKey": this.cardHolderKey,
    }
    this.hmsDataService.postApi(CardApi.getCardHolderCobHistoryUrl, requestedData).subscribe(res => {
      this.cobHistorytableData = [];
      this.CardHolderPopUpCOBFormGroup.reset();
      var cobDental
      if (this.alberta == true) {
        cobDental = true
        this.CardHolderPopUpCOBFormGroup.patchValue({ 'benefits': true })
        this.albertaVal = true;
      }
      else {
        cobDental = false
        this.CardHolderPopUpCOBFormGroup.patchValue({ 'benefits': false })
        this.albertaVal = false;
      }
      this.CardHolderPopUpCOBFormGroup.patchValue({ 'cobDental': cobDental })
      this.isBenifitError = false;
      if (res.hmsMessage.messageShort != 'RECORD_NOT_FOUND') {
        this.cobHistorytableData = [];
        this.cobHistorytableData = res.result;
        this.emitOnSave.emit({ "check": "cob2edit", "data": res.result });
        var dateCols = ['cobEffectiveOn', 'cobExpiryOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, res.result);
        this.noData = false;
      }// Below condition is to show no data when record not found.
      else if (res.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
        this.noData = true;
      }
      this.datatableService.reloadTableElem(this.dtElements, 'COBHistory', this.dtTrigger['COBHistory'], false)
    });
  }

  setCOBHistoryForm(data) {
    let cobDental;
    let cobHealth;
    let cobVision;
    let cobDrug;
    let cobHSA;
    let cobWellness;

    cobDental = data.cobDental;
    if (cobDental == "T") {
      cobDental = true
    }
    else {
      cobDental = false
    }

    cobDrug = data.cobDrug;
    if (cobDrug == "T") {
      cobDrug = true
    }
    else {
      cobDrug = false
    }

    cobVision = data.cobVision;
    if (cobVision == "T") {
      cobVision = true
    }
    else {
      cobVision = false
    }

    cobHealth = data.cobHealth;
    if (cobHealth == "T") {
      cobHealth = true
    }
    else {
      cobHealth = false
    }

    cobHSA = data.cobHSA;
    if (cobHSA == "T") {
      cobHSA = true
    }
    else {
      cobHSA = false
    }

    cobWellness = data.cobWellness;
    if (cobWellness == "T") {
      cobWellness = true
    }
    else {
      cobWellness = false
    }

    let COBHistoryFormValue = {
      policy: data.cobPolicyNum,
      effective_date: this.changeDateFormatService.convertStringDateToObject(data.cobEffectiveOn),
      expiry_date: this.changeDateFormatService.convertStringDateToObject(data.cobExpiryOn),
      carrier: data.chOtherPlanKey,
      benefits: true,
      cobDental: cobDental,
      cobDrug: cobDrug,
      cobHealth: cobHealth,
      cobHSA: cobHSA,
      cobVision: cobVision,
      cobWellness: cobWellness,
      validated: true,
    }
    this.isBenifitError = false;
    this.CardHolderPopUpCOBFormGroup.patchValue(COBHistoryFormValue);
    this.chCobHistoryKey = data.chCobHistoryKey,
      this.COBSubmitButtonText = this.translate.instant('card.button-update')
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
      if (formName == 'CardHolderPopUpCOBFormGroup') {
        this.CardHolderPopUpCOBFormGroup.patchValue(datePickerValue);
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
      this.CardHolderPopUpCOBFormGroup.patchValue(datePickerValue);
    }
    if (this.CardHolderPopUpCOBFormGroup.value.effective_date && this.CardHolderPopUpCOBFormGroup.value.expiry_date) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardHolderPopUpCOBFormGroup.value.effective_date.date, this.CardHolderPopUpCOBFormGroup.value.expiry_date.date);
      if (this.error.isError == true) {
        this.CardHolderPopUpCOBFormGroup.controls['expiry_date'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }

  onKeyPress(event) {
    var policy = this.CardHolderPopUpCOBFormGroup.get('policy').value;
    var effective_date = this.CardHolderPopUpCOBFormGroup.get('effective_date').value;
    var expiry_date = this.CardHolderPopUpCOBFormGroup.get('expiry_date').value;
    var carrier = this.CardHolderPopUpCOBFormGroup.get('carrier').value;
    var cobDental = this.CardHolderPopUpCOBFormGroup.get('cobDental').value;
    var cobDrug = this.CardHolderPopUpCOBFormGroup.get('cobDrug').value;
    var cobHealth = this.CardHolderPopUpCOBFormGroup.get('cobHealth').value;
    var cobHSA = this.CardHolderPopUpCOBFormGroup.get('cobHSA').value;
    var cobVision = this.CardHolderPopUpCOBFormGroup.get('cobVision').value;
    var benefits = this.CardHolderPopUpCOBFormGroup.get('benefits').value;

    if (carrier) {
      if (cobDental || cobDrug || cobHealth || cobHSA || cobVision) {
        this.cardholderCobVal.benefits = 'true';
        this.CardHolderPopUpCOBFormGroup.patchValue({ 'benefits': true })
      }
      else {
        this.cardholderCobVal.benefits = 'false';
        this.CardHolderPopUpCOBFormGroup.patchValue({ 'benefits': false })
      }
    }
    else {
      this.reset();
    }
  }

  onBlur() {
    let errorMessage: object;
    var policy = this.CardHolderPopUpCOBFormGroup.get('policy').value;
    var effective_date = this.CardHolderPopUpCOBFormGroup.get('effective_date').value;
    var expiry_date = this.CardHolderPopUpCOBFormGroup.get('expiry_date').value;
    var carrier = this.CardHolderPopUpCOBFormGroup.get('carrier').value;
    var benefits = this.CardHolderPopUpCOBFormGroup.get('benefits').value;
    var cobDental = this.CardHolderPopUpCOBFormGroup.get('cobDental').value;
    var cobDrug = this.CardHolderPopUpCOBFormGroup.get('cobDrug').value;
    var cobHealth = this.CardHolderPopUpCOBFormGroup.get('cobHealth').value;
    var cobHSA = this.CardHolderPopUpCOBFormGroup.get('cobHSA').value;
    var cobVision = this.CardHolderPopUpCOBFormGroup.get('cobVision').value;

    if (carrier) {
      if ((effective_date != '') && (expiry_date != '') && (carrier != '')) {
        this.cardholderCobVal = {
          policy: policy,
          effective_date: effective_date,
          expiry_date: expiry_date,
          carrier: carrier,
          cobDental: cobDental,
          cobDrug: cobDrug,
          cobHealth: cobHealth,
          cobHSA: cobHSA,
          cobVision: cobVision,
          validated: true,
          benefits: benefits
        }
        if (benefits == false || benefits == '') {
          this.isBenifitError = true;
        }
      } else {
        this.cardholderCobVal = {
          policy: "",
          effective_date: "",
          expiry_date: "",
          carrier: "",
          benefits: '',
          cobDental: cobDental,
          cobDrug: cobDrug,
          cobHealth: cobHealth,
          cobHSA: cobHSA,
          cobVision: cobVision,
          validated: false
        }
        this.CardHolderPopUpCOBFormGroup = new FormGroup({
          policy: new FormControl(policy, [Validators.maxLength(15)]),
          effective_date: new FormControl(effective_date, [Validators.required]),
          expiry_date: new FormControl(expiry_date),
          carrier: new FormControl(carrier, [Validators.required]),
          benefits: new FormControl(benefits, [Validators.required]),
          cobDental: new FormControl(cobDental),
          cobDrug: new FormControl(cobDrug),
          cobHealth: new FormControl(cobHealth),
          cobHSA: new FormControl(cobHSA),
          cobVision: new FormControl(cobVision)
        });
        if (!benefits == true) {
          this.isBenifitError = true;
        }
        this.validateAllFormFields(this.CardHolderPopUpCOBFormGroup);
      }
    }
    else {
      this.cardholderCobVal = {
        policy: this.CardHolderPopUpCOBFormGroup.value.policy,
        effective_date: this.CardHolderPopUpCOBFormGroup.value.effective_date,
        expiry_date: this.CardHolderPopUpCOBFormGroup.value.expiry_date,
        carrier: this.CardHolderPopUpCOBFormGroup.value.carrier,
        benefits: this.CardHolderPopUpCOBFormGroup.value.benefits,
        cobDental: this.CardHolderPopUpCOBFormGroup.value.cobDental,
        cobDrug: this.CardHolderPopUpCOBFormGroup.value.cobDrug,
        cobHealth: this.CardHolderPopUpCOBFormGroup.value.cobHealth,
        cobHSA: this.CardHolderPopUpCOBFormGroup.value.cobHSA,
        cobVision: this.CardHolderPopUpCOBFormGroup.value.cobVision,
        validated: false
      }
      this.isBenifitError = false;
    }
  }

  reset() {
    this.isBenifitError = false;
    this.CardHolderPopUpCOBFormGroup = new FormGroup
      ({
        policy: new FormControl(''),
        effective_date: new FormControl(''),
        expiry_date: new FormControl(''),
        carrier: new FormControl(null),
        benefits: new FormControl(''),
        cobDental: new FormControl(''),
        cobDrug: new FormControl(''),
        cobHealth: new FormControl(''),
        cobHSA: new FormControl(''),
        cobVision: new FormControl('')
      });
  }

  benifitChange(evt) {
    var cobDental = this.CardHolderPopUpCOBFormGroup.get('cobDental').value;
    var cobDrug = this.CardHolderPopUpCOBFormGroup.get('cobDrug').value;
    var cobHealth = this.CardHolderPopUpCOBFormGroup.get('cobHealth').value;
    var cobHSA = this.CardHolderPopUpCOBFormGroup.get('cobHSA').value;
    var cobVision = this.CardHolderPopUpCOBFormGroup.get('cobVision').value;

    if (cobDental || cobDrug || cobHealth || cobHSA || cobVision) {
      this.CardHolderPopUpCOBFormGroup.patchValue({ 'benefits': true })
      this.isBenifitError = false;
    }
    else {
      this.isBenifitError = true;
      this.CardHolderPopUpCOBFormGroup.patchValue({ 'benefits': false })
    }
  }

  onlyNumberKey(event) {
    let e = event;
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode == 65 && e.ctrlKey === true) ||
      // Allow: Ctrl+C
      (e.keyCode == 67 && e.ctrlKey === true) ||
      // Allow: Ctrl+X
      (e.keyCode == 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  }
}