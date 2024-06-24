import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; 
import { IMyInputFocusBlur } from 'mydatepicker';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardServiceService } from '../../card-service.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'card-holder-eligibility',
  templateUrl: './card-holder-eligibility.component.html',
  styleUrls: ['./card-holder-eligibility.component.css'],
  providers: [ChangeDateFormatService]
})

export class CardHolderEligibilityComponent implements OnInit {
  @Input() CardHolderEligibilityFormGroup: FormGroup;
  @Input() alberta: boolean;
  @Input() isModify: boolean = false;
  @Input() addMode: boolean = false; 
  @Input() viewMode: boolean = false; 
  @Input() editMode: boolean = false; 
  cardEffDate
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  error: any;
  disableEffDate: boolean = false
  expired: boolean;
  cardEffDateCardExp: any;
  cardEffDateSub: Subscription;
  cardEffDateSubs: Subscription;

  constructor(
    private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    public cardService: CardServiceService,
    private hmsDataServiceService: HmsDataServiceService) {
    this.error = { isError: false, errorMessage: '' };

    this.cardEffDateSubs = cardService.cardEffectiveDate.subscribe((value) => {
      if (value) {
        this.cardEffDate = value
        this.CardHolderEligibilityFormGroup.patchValue({ 'effective_date': this.changeDateFormatService.convertStringDateToObject(this.cardEffDate) });
        this.disableEffDate = true
      } else {
        this.disableEffDate = false
      }
    })

    this.cardEffDateSub = cardService.cardEffDate.subscribe((value) => {
      this.cardEffDateCardExp = value
      this.checkExpiry(value)
    })
  }

  cardholderEligibilityVal = {
    chEligibilityKey: [''],
    chIgnorePlanAge: [''],
    plan: [''],
    effective_date: ['', Validators.required],
    expiry_date: ['']
  }

  ngOnInit() {}

  resetClass(){
    let obj = this.CardHolderEligibilityFormGroup.value.expiry_date;
    if(obj){
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
  }
  
  getEligibilityHistory() {
    this.hmsDataServiceService.OpenCloseModal('btnEligibilityHistory');
  }

  GetVoucherHistory() {
    this.hmsDataServiceService.OpenCloseModal("btnModalVoucherHistory");
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
      this.CardHolderEligibilityFormGroup.patchValue(datePickerValue);
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
      this.CardHolderEligibilityFormGroup.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    if (frmControlName == 'effective_date') {
      let cardEffDate = this.changeDateFormatService.convertStringDateToObject(this.cardEffDate);
      if (cardEffDate.date && this.CardHolderEligibilityFormGroup.value.effective_date) {
        this.error = this.changeDateFormatService.compareTwoDates(cardEffDate.date, this.CardHolderEligibilityFormGroup.value.effective_date.date);
        if (this.error.isError == true) {
          this.CardHolderEligibilityFormGroup.controls['effective_date'].setErrors({
            "EffectiveDateNotValid": true
          });
          return;
        }
      }
    }

    if (this.CardHolderEligibilityFormGroup.value.effective_date && this.CardHolderEligibilityFormGroup.value.expiry_date) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardHolderEligibilityFormGroup.value.effective_date.date, this.CardHolderEligibilityFormGroup.value.expiry_date.date);
      if (this.error.isError == true) {
        this.CardHolderEligibilityFormGroup.controls['expiry_date'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }

    if(this.cardEffDateCardExp){
      if (this.cardEffDateCardExp['expiry_date'] && this.CardHolderEligibilityFormGroup.value.expiry_date) {
        this.error = this.changeDateFormatService.compareTwoDates( this.CardHolderEligibilityFormGroup.value.expiry_date.date,this.cardEffDateCardExp['expiry_date'].date);
        if (this.error.isError == true) {
          this.CardHolderEligibilityFormGroup.controls['expiry_date'].setErrors({
            "cardholderExpiry": true
          });
        }
      }
    }

    if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  checkExpiry(value){
    if(value){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(value['expiry_date']);
    }
  }

  ngOnDestroy(){
    if (this.cardEffDateSubs) {
      this.cardEffDateSubs.unsubscribe()
    }
    else if (this.cardEffDateSub) {
      this.cardEffDateSub.unsubscribe()
    }
  }
}