import { Component, OnInit, Input, Output, EventEmitter, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { IMyInputFocusBlur } from 'mydatepicker';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Router, ActivatedRoute } from '@angular/router';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CompanyApi } from '../company-api';
import { CompanyService } from '../company.service';


@Component({
  selector: 'app-sales-data',
  templateUrl: './sales-data.component.html',
  styleUrls: ['./sales-data.component.css'],
  providers: [ChangeDateFormatService]
})
export class SalesDataComponent implements OnInit {
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  @Input() salesDataForm: FormGroup;
  referralList
  brokerList
  staffMemberList 
  companyList

  public referralData: CompleterData;
  public brokerData: RemoteData;
  public staffMemberData: RemoteData;
  public companyData: RemoteData;
  public isOpen: boolean = false;
  viewMode;
  referralDropDownValue: any;
  referralDropDownValue1;
  @Input() salesDataFormEditMode: any;
  @Output() selectedReferralTypeKey = new EventEmitter();
  @Output() selectedReferralOtherName = new EventEmitter();
  @Output() selectedReferralTypeCd = new EventEmitter();

  //variable to enable or disable fields
  isOtherReferralSelected: boolean = false;
  isCompanyReferralSelected: boolean = false;
  isStaffMemberReferralSelected: boolean = false;
  isBrokerReferralSelected: boolean = false;
  
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  @Output() compareEffectiveOnDate = new EventEmitter(); // to compare the Sold Date with companyEfective date

  constructor(
    private changeDateFormatService:ChangeDateFormatService,
    private completerService: CompleterService,
    private _router: Router,
    private hmsDataServiceService: HmsDataServiceService,
    public companyService: CompanyService, // api request service
  ) { 

    //Broker Predictive Search
    this.brokerData = completerService.remote(
      null,
      "brokerName",
      "brokerName"
    ); 
    this.brokerData.requestOptions({headers: {'Content-Type':'application/json','Authorization':'bearer '+localStorage.getItem('currentUser')}});
    this.brokerData.urlFormater((term: any) => {
        return CompanyApi.getBrokerListForReferralTypeList+`/${term}`;
    });
    this.brokerData.dataField('result');  

    //Staff Member Predictive Search
    this.staffMemberData = completerService.remote(
      null,
      "username",
      "username"
    ); 
    this.staffMemberData.requestOptions({headers: {'Content-Type':'application/json','Authorization':'bearer '+localStorage.getItem('currentUser')}});
    this.staffMemberData.urlFormater((term: any) => {
        return CompanyApi.getUserStaffMemberList+`/${term}`;
    });
    this.staffMemberData.dataField('result'); 

    //Company Predictive Search
    this.companyData = completerService.remote(
      null,
      "coName",
      "coName"
    ); 
    this.companyData.requestOptions({headers: {'Content-Type':'application/json','Authorization':'bearer '+localStorage.getItem('currentUser')}});
    this.companyData.urlFormater((term: any) => {
        return CompanyApi.getCompanyListForReferralTypeList+`/${term}`;
    });
    this.companyData.dataField('result'); 

  }

  salesDataVal = {
    'soldDate': new FormControl(''),
    'referral': new FormControl(''),
    'broker': new FormControl(''),
    'staff_member': new FormControl(''),
    'company': new FormControl(''),
    'other': new FormControl('')
  }

  ngOnInit() {
    if(this._router.url.indexOf('view') !== -1){
      this.getSelectedReferralOtherVal().then(res => { 
        this.referralDropDownValue1 = this.referralDropDownValue
        this.viewMode = true;
        if(this.referralDropDownValue1 == 1){
          this.isBrokerReferralSelected = true
        }else if(this.referralDropDownValue1 == 2){
          this.isStaffMemberReferralSelected = true
        }else if(this.referralDropDownValue1 == 4){
          this.isCompanyReferralSelected = true
        }else if(this.referralDropDownValue1 == 6){
          this.isOtherReferralSelected = true
        }
      })
     }


  }

  ngAfterViewInit() {
    var ReferralTypeURL = CompanyApi.getReferralTypeList;
    var getBrokerListForReferralTypeListURL = CompanyApi.getBrokerListForReferralTypeList;
    this.hmsDataServiceService.getApi(ReferralTypeURL).subscribe(data => {
      if(data.code == 200) {
        this.referralList = data.result;
        this.referralData = this.completerService.local(
          this.referralList,
          "referralTypeDesc",
          "referralTypeDesc"
        );
      }
    });

    
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && event.value != null && event.value != '') {     
      // Set Date Picker Value
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
    }else if (event.reason == 2 && event.value != null && event.value != '') {
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
        this.salesDataForm.patchValue(datePickerValue);
      }
      if(formName == 'salesDataForm'){
        if (this.salesDataForm.value.soldDate && this.salesDataForm.value.soldDate.date) {
          this.compareEffectiveOnDate.next(formName)
        }
      }
    }
  }
  
  onReferralSelected(selected: CompleterItem){
    if(selected) {
      if(selected.originalObject.referralTypeCd == 'BR'){
        this.salesDataForm.controls['broker'].setValidators(
          [Validators.required]
        );
        this.salesDataForm.controls['broker'].updateValueAndValidity()
        this.validateAllFormFields(this.salesDataForm);
        this.isBrokerReferralSelected = true
      }else{
        this.isBrokerReferralSelected = false
        this.salesDataForm.controls['broker'].clearValidators();
        this.salesDataForm.controls['broker'].updateValueAndValidity()
      }
        
      if(selected.originalObject.referralTypeCd == 'SM'){
        this.salesDataForm.controls['staff_member'].setValidators(
          [Validators.required]
        );
        this.salesDataForm.controls['staff_member'].updateValueAndValidity()
        this.validateAllFormFields(this.salesDataForm);
        this.isStaffMemberReferralSelected = true
      }else{
        this.isStaffMemberReferralSelected = false
        this.salesDataForm.controls['staff_member'].clearValidators();
        this.salesDataForm.controls['staff_member'].updateValueAndValidity()
      }
      
      if(selected.originalObject.referralTypeCd == 'EC'){
        
        this.salesDataForm.controls['company'].setValidators(
          [Validators.required]
        );
        this.salesDataForm.controls['company'].updateValueAndValidity()
        this.validateAllFormFields(this.salesDataForm);
        this.isCompanyReferralSelected = true
      }else{
        this.isCompanyReferralSelected = false
        this.salesDataForm.controls['company'].clearValidators();
        this.salesDataForm.controls['company'].updateValueAndValidity()
      }

      if(selected.originalObject.referralTypeCd == 'OT'){
        
        this.salesDataForm.controls['other'].setValidators(
          [Validators.required]
        );
        this.salesDataForm.controls['other'].updateValueAndValidity()
        this.validateAllFormFields(this.salesDataForm);
        this.isOtherReferralSelected = true
      }else{
        this.isOtherReferralSelected = false
        this.salesDataForm.controls['other'].clearValidators();
        this.salesDataForm.controls['other'].updateValueAndValidity()
      }
      this.selectedReferralTypeKey.emit(selected.originalObject.referralTypekey);
      this.selectedReferralTypeCd.emit(selected.originalObject.referralTypeCd);
    }
    else {
    }
  }

  onReferralBrokerSelected(selected: CompleterItem){
    if(selected) {
      this.selectedReferralOtherName.emit(selected.originalObject.brokerName);
    }
  }

  onReferralStaffMemberSelected(selected: CompleterItem){
    if(selected) {
      this.selectedReferralOtherName.emit(selected.originalObject.username);
    }
  }

  onReferralCompanySelected(selected: CompleterItem){
    if(selected) {
      this.selectedReferralOtherName.emit(selected.originalObject.coName);
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

  getSelectedReferralOtherVal() {
    let promise = new Promise((resolve, reject) => {
      this.companyService.selectedReferralOtherVal.subscribe(data => {
        this.referralDropDownValue = data
        resolve();
      });
    })
    return promise;
  }

  /**
   * patch sold Date error after compare with company effective date
   * @param isTrue 
   */
 
}
