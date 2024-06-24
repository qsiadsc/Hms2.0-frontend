import { Component, OnInit } from '@angular/core';
import { FormGroup,FormControl,FormControlName, Validators } from '@angular/forms'; 
import { CommonDatePickerOptions,Constants } from '../../common-module/Constants';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr'; 
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { FinanceApi } from '../finance-api';

@Component({
  selector: 'app-payment-generate',
  templateUrl: './payment-generate.component.html',
  styleUrls: ['./payment-generate.component.css'],
  providers: [ChangeDateFormatService,DatatableService]
})
export class PaymentGenerateComponent implements OnInit {
  generatingReportsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  generatingChequeRecordsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  generatingEftRecordsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  apiResponse: number;
  generatingPayableArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  errorClaimListArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  totalPayableClaimsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  showUpdateItemArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  checkingParamsArr: any;
  update: any;
  chequeNum: any;
  eftFileNo: any;
  myDatePickerOptions=CommonDatePickerOptions.myDatePickerOptions
  paymentGenerateForm:FormGroup;
  error:any
  columns;
  observableObj;
  check:boolean=true;
  paramData;
  fieldArray:any;
  paymentSumKey;
  generatePaymentButton=false

  constructor(private changeDateFormatService:ChangeDateFormatService,
    private dataTableService:DatatableService,
    private translate:TranslateService,
    private toaster:ToastrService,
    private exDialog: ExDialog,
    private hmsDataService:HmsDataServiceService) {
    this.error={ isError:false, errorMessage: ''}
   }

  ngOnInit() {
     this.paymentGenerateForm=new FormGroup({
      'dental':new FormControl(''),
      'vision':new FormControl(''),
      'health':new FormControl(''),
      'drug':new FormControl(''),
      'supplement':new FormControl(''),
      'wellness':new FormControl(''),
      'planType':new FormControl('',[Validators.required]),
      'effectiveOn':new FormControl('',[Validators.required]),
      'confirmationNo':new FormControl('',[Validators.required]),
    })     
  }

  showUpdatedItem(newItem){
    let updateItem = this.fieldArray.find(this.findIndexToUpdate, newItem.id);
    let index = this.fieldArray.indexOf(updateItem);
    this.fieldArray[index] = newItem;
  }

  findIndexToUpdate(newItem) { 
        return newItem.id === this;
  }

  /** Submit the Form*/
  submitPaymentGenerateForm(paymentGenerateForm){
    if(this.paymentGenerateForm.valid){
      this.generatePaymentButton = true;
      if(this.fieldArray == []){
        let fieldArr = {
          "id":1,
          "done":"0",
          "step":"1",
          "processing":"Get System Parameter",
          "result":"Processing"
        }
        this.fieldArray.push(fieldArr)
      }else{
        this.fieldArray = 
          [{
            "id":1,
            "done":"0",
            "step":"1",
            "processing":"Get System Parameter",
            "result":"Processing"
          }]
      }
      this.getSystemParameter(this.paymentGenerateForm.value.planType).then(res => {
        this.update=  {
          "id":1,
          "done":"1",
          "step":"1",
          "processing":"Get System Parameter",
          "result":"Done"
        }
        this.checkingParamsArr={
          "id":2,
          "done":"0",
          "step":"2",
          "processing":"Checking Params",
          "result":"Processing"
        }
        this.showUpdatedItem(this.update);        
        this.fieldArray.push(this.checkingParamsArr)
        this.checkingParams(this.paramData).then(res => {    
          this.update=  {
            "id":2,
            "done":"1",
            "step":"2",
            "processing":"Checking Params",
            "result":"Done"
          }
          this.totalPayableClaimsArr={
            "id":3,
            "done":"0",
            "step":"3",
            "processing":"Total Payable Claims",
            "result":"Processing"
          }
          this.showUpdatedItem(this.update); 
          this.fieldArray.push(this.totalPayableClaimsArr);
          this.totalPayableClaims(this.paymentGenerateForm.value).then(res => {
            this.update=  {
              "id":3,
              "done":"1",
              "step":"3",
              "processing":"Total Payable Claims",
              "result":"Done"
            }
            this.generatingPayableArr={
              "id":4,
              "done":"0",
              "step":"4",
              "processing":"Generating Payable",
              "result":"Processing"
            }
            this.showUpdatedItem(this.update); 
            this.fieldArray.push(this.generatingPayableArr);
            this.generatingPayable(this.paymentGenerateForm.value).then(res => {
              this.update=  {
                "id":4,
                "done":"1",
                "step":"4",
                "processing":"Generating Payable",
                "result":"Done"
              }
              this.errorClaimListArr={
                "id":5,
                "done":"0",
                "step":"5",
                "processing":"Error Claims List",
                "result":"Processing"
              }
              this.showUpdatedItem(this.update); 
              this.fieldArray.push(this.errorClaimListArr);             
              this.errorClaimsList(this.paymentGenerateForm.value).then(res => {
                  this.update=  {
                    "id":5,
                    "done":"1",
                    "step":"5",
                    "processing":"Error Claims List",
                    "result":"Done"
                  }
                  this.generatingEftRecordsArr={
                    "id":6,
                    "done":"0",
                    "step":"6",
                    "processing":"Generating Eft Records",
                    "result":"Processing"
                  }
                  this.showUpdatedItem(this.update); 
                  this.fieldArray.push(this.generatingEftRecordsArr);                             
                  this.generatingEftRecords(this.paymentGenerateForm.value).then(res=>{
                    this.update=  {
                      "id":6,
                      "done":"1",
                      "step":"6",
                      "processing":"Generating Eft Records",
                      "result":"Done"
                    }
                    this.generatingChequeRecordsArr={
                      "id":7,
                      "done":"0",
                      "step":"7",
                      "processing":"Generating Cheque Records",
                      "result":"Processing"
                    }
                     this.showUpdatedItem(this.update); 
                   this.fieldArray.push(this.generatingChequeRecordsArr);
                  this.generatingChequeRecords(this.paymentGenerateForm.value).then(res=>{
                    this.update=  {
                      "id":7,
                      "done":"1",
                      "step":"7",
                      "processing":"Generating Cheque Records",
                      "result":"Done"
                    }
                    this.generatingReportsArr={
                      "id":8,
                      "done":"0",
                      "step":"8",
                      "processing":"Exporting EFT File",
                      "result":"Processing"
                    }
                     this.showUpdatedItem(this.update); 
                   this.fieldArray.push(this.generatingReportsArr);
                    this.exportingEftFile(this.paymentGenerateForm.value).then(res=>{
                      this.update=  {
                        "id":8,
                        "done":"1",
                        "step":"8",
                        "processing":"Exporting EFT File",
                        "result":"Done"
                      }
                      this.generatingReportsArr={
                        "id":10,
                        "done":"0",
                        "step":"10",
                        "processing":"Generating Reports",
                        "result":"Processing"
                      }
                       this.showUpdatedItem(this.update); 
                     this.fieldArray.push(this.generatingReportsArr);
                      this.generatingReports(this.paymentGenerateForm.value).then(res=>{
                        this.update=  {
                          "id":10,
                          "done":"1",
                          "step":"10",
                          "processing":"Generating Reports",
                          "result":"Done"
                        }
                       
                         this.showUpdatedItem(this.update); 
                      });
                    });
                  });
               })
              })  
            });
          });
        })
      })
    }else{
      this.validateAllFormFields(this.paymentGenerateForm)
    }
  }
  
  getSystemParameter(planType){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.getSystemParameter;
      this.paramData = {
        "planType": planType 
      }
      this.hmsDataService.postApi(url,this.paramData).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){
          this.paramData = Object.assign(this.paramData,{
            "pcheckParams":0, //need TBD
            "eftFileNo":data.result.eftFileNo,           
          });
          resolve();         
        }
      })
    })
    return promise;
  }

  checkingParams(paramData){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.checkingParams;
      this.paramData = Object.assign(this.paramData,{
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.effectiveOn)
      });
      this.hmsDataService.postApi(url,this.paramData).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){
          this.eftFileNo = data.result.eftFileNo
          resolve();         
        }
      })
    })
    return promise;
  }

  totalPayableClaims(formData){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.totalPayableClaims;
      let totalPayableClaimsParams = {
        'dental': (this.paymentGenerateForm.value.dental == true)?1:0,
        'vision':(this.paymentGenerateForm.value.vision == true)?1:0,
        'health':(this.paymentGenerateForm.value.health == true)?1:0,
        'drug':(this.paymentGenerateForm.value.drug == true)?1:0,
        'hsa':(this.paymentGenerateForm.value.supplement == true)?1:0,
        'planType': formData.planType
      }
      this.paramData = Object.assign({
        'pdental': '1',
        'pvision':"1",
        'phealth':"1",
        'pdrug':"1",
        'phsa':"1",
      })
      
      this.hmsDataService.postApi(url,totalPayableClaimsParams).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){
          resolve();         
        }
      })
    })
    return promise;
  }

  generatingPayable(formData){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.generatingPayable;
      let param = {
        'dental': (this.paymentGenerateForm.value.dental == true)?1:0,
        'vision':(this.paymentGenerateForm.value.vision == true)?1:0,
        'health':(this.paymentGenerateForm.value.health == true)?1:0,
        'drug':(this.paymentGenerateForm.value.drug == true)?1:0,
        'hsa':(this.paymentGenerateForm.value.supplement == true)?1:0,
        "cardHolder": 0,
        "provider": 0,
        "other": 0,
        'planType': formData.planType,
        "pcoId": '',
        "pconfirmId": '', 
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.effectiveOn),
        "eftFileNo": this.eftFileNo
      }
     
      this.hmsDataService.postApi(url,param).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){
          this.paymentSumKey = +data.result.paymentRunKey
          resolve();         
        }
      })
    })
    return promise;    
  }

  errorClaimsList(formData){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.errorClaimsList;
      let param = {
        "paymentSumKey": this.paymentSumKey
      }
      this.hmsDataService.postApi(url,param).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){ //Need to be change
          this.apiResponse = 1;
          resolve();    
        }else if(data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND"){
          this.apiResponse = 1;
          resolve();    
        }
        else{
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {  
          })
          resolve();
        }
      })
    })
    return promise;    
  }

  generatingEftRecords(formData){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.generatingEftRecords;
      let param = {
        'dental': (this.paymentGenerateForm.value.dental == true)?1:0,
        'vision':(this.paymentGenerateForm.value.vision == true)?1:0,
        'health':(this.paymentGenerateForm.value.health == true)?1:0,
        'drug':(this.paymentGenerateForm.value.drug == true)?1:0,
        'hsa':(this.paymentGenerateForm.value.supplement == true)?1:0,
        "cardHolder": 0,
        "provider": 0,
        "planType": formData.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.effectiveOn),
        "eftFileNo": this.eftFileNo,
        "paymentSumKey": +this.paymentSumKey
      }
      this.hmsDataService.postApi(url,param).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){ //Needs to be change
          resolve();         
        }
      })
    })
    return promise;    
  }

  generatingChequeRecords(formData){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.generatingChequeRecords;
      let param = {
        'dental': (this.paymentGenerateForm.value.dental == true)?1:0,
        'vision':(this.paymentGenerateForm.value.vision == true)?1:0,
        'health':(this.paymentGenerateForm.value.health == true)?1:0,
        'drug':(this.paymentGenerateForm.value.drug == true)?1:0,
        'hsa':(this.paymentGenerateForm.value.supplement == true)?1:0,
        "cardHolderKey": 0,
        "providerKey": 0,
        "otherKey":0,
        "planType": formData.planType,
        "paymentSumKey": +this.paymentSumKey
      }
      this.hmsDataService.postApi(url,param).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){ //Needs to be change
          resolve();         
        }
      })
    })
    return promise;    
  }

  exportingEftFile(formData){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.exportingEftFile;
      let param = {
        "paymentSumKey": +this.paymentSumKey
      }
      this.hmsDataService.postApi(url,param).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){ //Needs to be change
          resolve();         
        }else if(data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND"){
          this.apiResponse = 1;
          resolve();    
        }else{
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {  
          })
          resolve();
        }
      })
    })
    return promise;    
  }

  generatingReports(formData){
    let promise = new Promise((resolve, reject) => {
      var url=FinanceApi.generatingReports;
      let param = {
        "paymentSumKey": +this.paymentSumKey
      }
      this.hmsDataService.postApi(url,param).subscribe(data=>{
        if(data.code == 200 && data.status == "OK"){ //Needs to be change
          resolve();         
        }else if(data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND"){
          this.apiResponse = 1;
          resolve();    
        }else{
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {  
          })
          resolve();
        }
      })
    })
    return promise;    
  }

  reinitializeProcess(){
    let promise = new Promise((resolve, reject) => {
    if(this.apiResponse == 0){
      this.exDialog.openConfirm(this.translate.instant('finance.toaster.clickToReintiatePaymentProcess')).subscribe((valueDeletePlan) => {
        if(valueDeletePlan){
          this.fieldArray = []
          resolve();
          this.submitPaymentGenerateForm(this.paymentGenerateForm);          
        }else{
          this.generatePaymentButton = false
          this.fieldArray = []
        }
      })
    }else{
      resolve();
    }
  })
  return promise
  }
  // Methos for Upper Form Datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.paymentGenerateForm.patchValue(datePickerValue);
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
      this.paymentGenerateForm.patchValue(datePickerValue);
    }
    if (this.paymentGenerateForm.value.effectiveOn && this.paymentGenerateForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.paymentGenerateForm.value.effectiveOn.date, this.paymentGenerateForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.paymentGenerateForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }


  /* Method for validate the Form fields */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

}
