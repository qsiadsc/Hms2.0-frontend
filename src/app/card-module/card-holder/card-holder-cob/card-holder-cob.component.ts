import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AsyncValidator } from '@angular/forms';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { IMyInputFocusBlur } from 'mydatepicker';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardApi } from '../../card-api';
import { CardServiceService } from '../../../card-module/card-service.service';

@Component({
  selector: 'card-holder-cob',
  templateUrl: './card-holder-cob.component.html',
  styleUrls: ['./card-holder-cob.component.css'],
  providers: [ChangeDateFormatService, CardServiceService]
})
export class CardHolderCobComponent implements OnInit {
  @Input() CardHolderCobFormGroup: FormGroup;
  @Input() isModify: boolean = false;
  @Input() alberta: boolean;
  @Input() addMode: boolean = false;
  @Input() viewMode: boolean = false;
  @Input() editMode: boolean = false;
  @Output() cardholderCobEmittier = new EventEmitter();
  error: any;
  arrCarrierList: any;
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
  isBenifitError: boolean = false;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerOptionsOld = CommonDatePickerOptions.myDatePickerOldFilterOptions;
  expired: boolean;

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private cardService: CardServiceService) {
    this.isBenifitError = false;
    this.error = { isError: false, errorMessage: '' };
    this.GetCarrierList();

  }
  cardholderCobFormGroupVal = {
    policy: [''],
    effective_date: [''],
    expiry_date: [''],
    carrier: [''],
    cobDental: [''],
    cobDrug: [''],
    cobHealth: [''],
    cobHSA: [''],
    cobVision: [''],
    validated: false,
    benefits: [''],
  }

  ngOnInit() {
    this.isBenifitError = false;
  }

  GetCarrierList() {
    this.hmsDataServiceService.getApi(CardApi.getCarrierListUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrCarrierList = data.result;
        this.arrCarrierList.splice(0, 0, { "otherPlanKey": "", "otherPlanDesc": "Select" });
      }
    })
  }

  ResetForm() {
    this.CardHolderCobFormGroup.reset();
  }

  CobHistory() {
    this.hmsDataServiceService.OpenCloseModal('btnModalCOBHistory');
  }

  onKeyPress(event) {
    var policy = this.CardHolderCobFormGroup.get('policy').value;
    var effective_date = this.CardHolderCobFormGroup.get('effective_date').value;
    var expiry_date = this.CardHolderCobFormGroup.get('expiry_date').value;
    var carrier = this.CardHolderCobFormGroup.get('carrier').value;
    var cobDental = this.CardHolderCobFormGroup.get('cobDental').value;
    var cobDrug = this.CardHolderCobFormGroup.get('cobDrug').value;
    var cobHealth = this.CardHolderCobFormGroup.get('cobHealth').value;
    var cobHSA = this.CardHolderCobFormGroup.get('cobHSA').value;
    var cobVision = this.CardHolderCobFormGroup.get('cobVision').value;
    var benefits = this.CardHolderCobFormGroup.get('benefits').value;

    if (carrier) {
      if (cobDental || cobDrug || cobHealth || cobHSA || cobVision) {
        this.cardholderCobVal.benefits = 'true';
        this.isBenifitError = false;
        this.CardHolderCobFormGroup.patchValue({ 'benefits': true })
      }
      else {
        if (this.alberta) {
          this.CardHolderCobFormGroup.patchValue({
            'cobDental': true
          })
          this.cardholderCobVal.benefits = 'true';
          this.CardHolderCobFormGroup.patchValue({ 'benefits': true })
        }
        else {
          this.isBenifitError = true;
          this.cardholderCobVal.benefits = 'false';
          this.CardHolderCobFormGroup.patchValue({ 'benefits': false })
        }
      }
    }
    else {
      this.reset();
    }
  }

  onBlur() {
    let errorMessage: object;
    var policy = this.CardHolderCobFormGroup.get('policy').value;
    var effective_date = this.CardHolderCobFormGroup.get('effective_date').value;
    var expiry_date = this.CardHolderCobFormGroup.get('expiry_date').value;
    var carrier = this.CardHolderCobFormGroup.get('carrier').value;
    var benefits = this.CardHolderCobFormGroup.get('benefits').value;
    var cobDental = this.CardHolderCobFormGroup.get('cobDental').value;
    var cobDrug = this.CardHolderCobFormGroup.get('cobDrug').value;
    var cobHealth = this.CardHolderCobFormGroup.get('cobHealth').value;
    var cobHSA = this.CardHolderCobFormGroup.get('cobHSA').value;
    var cobVision = this.CardHolderCobFormGroup.get('cobVision').value;

    if (carrier) {
      if (effective_date && carrier != '' && benefits) {
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
        if (this.alberta) {
          this.isBenifitError = false;
        }
        else {
          if (benefits == false || benefits == '') {
            this.isBenifitError = true;
          }
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
        this.CardHolderCobFormGroup = new FormGroup({
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
        if (this.alberta) {
          this.isBenifitError = false;
        }
        else {
          if (!benefits == true) {
            this.isBenifitError = true;
          }
        }
        this.validateAllFormFields(this.CardHolderCobFormGroup);
      }
      this.cardholderCobEmittier.emit(this.cardholderCobVal)
    }
    else {
      this.cardholderCobVal = {
        policy: this.CardHolderCobFormGroup.value.policy,
        effective_date: this.CardHolderCobFormGroup.value.effective_date,
        expiry_date: this.CardHolderCobFormGroup.value.expiry_date,
        carrier: this.CardHolderCobFormGroup.value.carrier,
        benefits: this.CardHolderCobFormGroup.value.benefits,
        cobDental: this.CardHolderCobFormGroup.value.cobDental,
        cobDrug: this.CardHolderCobFormGroup.value.cobDrug,
        cobHealth: this.CardHolderCobFormGroup.value.cobHealth,
        cobHSA: this.CardHolderCobFormGroup.value.cobHSA,
        cobVision: this.CardHolderCobFormGroup.value.cobVision,
        validated: true
      }
      this.isBenifitError = false;
      this.cardholderCobEmittier.emit(this.cardholderCobVal)
      this.reset();
    }
    if (this.CardHolderCobFormGroup.valid) {
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf: false });
      }
    });
  }

  reset() {
    this.isBenifitError = false;
    this.CardHolderCobFormGroup = new FormGroup
      ({
        policy: new FormControl(''),
        effective_date: new FormControl(''),
        expiry_date: new FormControl(''),
        carrier: new FormControl(''),
        benefits: new FormControl(''),
        cobDental: new FormControl(''),
        cobDrug: new FormControl(''),
        cobHealth: new FormControl(''),
        cobHSA: new FormControl(''),
        cobVision: new FormControl('')
      });
  }

  /**
  * @description : This Function is used to convert entered value to valid date format.
  * @params : "event" is datepicker value
  * @params : "frmControlName" is datepicker name/Form Control Name
  * For Reference : https://www.npmjs.com/package/angular4-datepicker
  * @return : None
  */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.CardHolderCobFormGroup.patchValue(datePickerValue);
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
      this.CardHolderCobFormGroup.patchValue(datePickerValue);
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    if (this.CardHolderCobFormGroup.value.effective_date) {
      this.onBlur()
    }
    if (this.CardHolderCobFormGroup.value.effective_date && this.CardHolderCobFormGroup.value.expiry_date) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardHolderCobFormGroup.value.effective_date.date, this.CardHolderCobFormGroup.value.expiry_date.date);
      if (this.error.isError == true) {
        this.CardHolderCobFormGroup.controls['expiry_date'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
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
      return; // let it happen, don't do anything
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault(); // Ensure that it is a number and stop the keypress
    }
  }
}