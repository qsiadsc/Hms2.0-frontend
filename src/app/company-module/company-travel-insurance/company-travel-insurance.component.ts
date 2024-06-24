import { Component, OnInit, Input,Output,EventEmitter  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { IMyInputFocusBlur } from 'mydatepicker';
import { CompanyService } from '../company.service';

@Component({
  selector: 'app-company-travel-insurance',
  templateUrl: './company-travel-insurance.component.html',
  styleUrls: ['./company-travel-insurance.component.css']
})
export class CompanyTravelInsuranceComponent implements OnInit {
  effectiveDateMandatory: boolean = false; // Set Travel Insurance effective date autofilled false;
  //Date Picker Options 
  @Input() travelFormEditMode: any;
  @Input() mainCompanyArray: any;
  checkboxValue;
  
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;

  @Input() travelInsuranceForm: FormGroup;

  addMode; //Enable true when user add a new company
  viewMode; //Enable true after a new company added
  editMode; //Enable true after viewMode when user clicks edit button
  benifitsDateNameArray = {}
  error: any;
  policyNum
  @Output() compareEffectiveOnDate = new EventEmitter(); // to compare the Effective Date and Termination Date with companyEfective date

  constructor( private companyService: CompanyService,
    private changeDateFormatService:ChangeDateFormatService,
    private _router: Router) {
      this.error = { isError: false, errorMessage: '' };

      companyService.getPolicyNumber.subscribe((value) => {
        this.policyNum = value
      })
     }
    
  travelInsuranceVal = {
    'enroll' : new FormControl(''),
    'effectiveDate' : new FormControl(''),
    'terminatedDate' : new FormControl(''),
    'policyNumber': new FormControl('', [Validators.maxLength(25), CustomValidators.onlyNumbers])
  }

  ngOnInit() {
    var self = this
    if(this._router.url.indexOf('view') !== -1){
      this.viewMode = true;
    }

    //Set Values of Form in view mode and disable all form fields
    if(this.viewMode){
      this.travelInsuranceForm.disable();
    }
  }

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    var datePickerValue = new Array();
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;      
      datePickerValue[ControlName] = validDate;
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
    }

    if (event.reason == 2) {
      if(datePickerValue){
        this.travelInsuranceForm.patchValue(datePickerValue);
      }
      if(formName == 'travelInsuranceForm'){
        if (this.travelInsuranceForm.value.effectiveDate && this.travelInsuranceForm.value.effectiveDate.date) {
          this.compareEffectiveOnDate.next(formName);
        }
        if(this.travelInsuranceForm.value.terminatedDate && this.travelInsuranceForm.value.terminatedDate.date){
          this.compareEffectiveOnDate.next(formName);
        }
      }
    }
  }

  /**
   * Make travel insurance Effective date mandatory 
   */
  travelInsuranceCheck(){
    var enroll = this.travelInsuranceForm.controls['enroll'].value;
    var effectiveDate = this.travelInsuranceForm.get('effectiveDate').value;
    var terminatedDate = this.travelInsuranceForm.get('terminatedDate').value;
    var polNumber = this.travelInsuranceForm.get('policyNumber').value
    if(enroll == true){
      this.effectiveDateMandatory = true;
      if(effectiveDate == null){
        this.travelInsuranceVal = {
          'enroll': new FormControl(enroll),
          'effectiveDate': new FormControl(null,[Validators.required]),
          'terminatedDate': new FormControl(null,[]),
          'policyNumber': new FormControl(null, [Validators.maxLength(25), CustomValidators.onlyNumbers])
        }
        this.validateAllFormFields(this.travelInsuranceForm);

        this.travelInsuranceForm.controls['effectiveDate'].setErrors({
            "travelEffectiveRequired": true
        });
      }
      if (polNumber == null || polNumber == "") {
        this.travelInsuranceForm.controls['policyNumber'].setErrors({
          "policyNumberIsRequired": true
        })
      }
      if (this.policyNum != undefined) {
        if (this.policyNum != "" && this.travelInsuranceForm.value.policyNumber) {
          if (this.policyNum != this.travelInsuranceForm.value.policyNumber) {
            this.travelInsuranceForm.controls['policyNumber'].setErrors({
              "cannotChangePolicyNumber": true
            })
          }
        }
      }
    }else{ 
      this.effectiveDateMandatory = false;
      this.travelInsuranceForm.controls['effectiveDate'].reset();
      this.travelInsuranceForm.controls['terminatedDate'].reset();
      this.travelInsuranceForm.controls['policyNumber'].reset()
    }
  }
  
  /**
   * Reset travel insurance effective date
   */
  resetTravelInsuranceEffDate(){
    this.travelInsuranceForm  = new FormGroup
    ({   
      enroll:new FormControl (''),
      effectiveDate:new FormControl (''),
      terminatedDate:new FormControl(''),
    });
  }  

  /**
   * Validate travel insurance form field
   * @param formGroup 
   */
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

  /**
   * patch effectiveDate and terminatedDate error after compare with company effective date
   * @param isTrue 
   * @param formCtrl 
   */
  patchCompanyEffectiveDateError(isTrue , formCtrl){
    if(formCtrl == 'effectiveDate'){
      if(isTrue){
        this.travelInsuranceForm.controls['effectiveDate'].setErrors({
          "effectiveDateNotValid": true
        });
      }else{
        this.travelInsuranceForm.controls['effectiveDate'].setErrors(null);
      }
    }else if(formCtrl == 'terminatedDate'){
      if(isTrue){
        this.travelInsuranceForm.controls['terminatedDate'].setErrors({
          // "terminatedDateNotValid": true
          "terminatedInsDateNotValid":true
        });
      }else{
        this.travelInsuranceForm.controls['terminatedDate'].setErrors(null);
      }
    }
  }

  // Log #1162: Travel Effective Date Check applied 
  patchTravelEffectiveDateError(isTrue , formCtrl){
    if(formCtrl == 'effectiveDate'){
      if (isTrue){
        this.travelInsuranceForm.controls['effectiveDate'].setErrors({
          "cannotChangeEffectiveDate": true
        });
      } else{
        this.travelInsuranceForm.controls['effectiveDate'].setErrors(null);
      }
    }
  }

}
