import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup,FormControl, NgForm, Validators, FormControlName } from '@angular/forms'; 
import { CommonDatePickerOptions,Constants } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr'; 
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { FeeGuideApi } from '../../fee-guide-module/fee-guide-api'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { FinanceApi } from '../finance-api';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { uniq } from 'underscore';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 

@Component({
  selector: 'app-tax-rates',
  templateUrl: './tax-rates.component.html',
  styleUrls: ['./tax-rates.component.css'],
  providers:[ChangeDateFormatService,DatatableService,CurrentUserService]
})
export class TaxRatesComponent implements OnInit {
  expired = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload','T')
  }
  searchedProvinceKey: any;
  searchedTransactionCode: any;
  searchedTaxKey: any;
  selectedApplicableAdrs: any;
  currentUser: any;
  dentalData: any;
  taxRateId: { "taxRateDetailKey": any; };
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  taxRatesForm:FormGroup;
  error:any;
  dateNameArray={}
  columns=[];
  addMode:boolean=true;
  viewMode:boolean=false;
  editMode:boolean=false;
  buttonText:String;
  observableObj;
  check=true;
  cardholderNo:boolean = false;
  reload:boolean=false;
  public codeDataRemote: CompleterData;
  public taxNameDataRemote: CompleterData;
  public provinceDataRemote: CompleterData;
  public payeeData:CompleterData;
  providerNo:boolean = false;
  codeTypeList;
  taxNameList;
  provinceList;
  transPayee;
  payeeList;
  selectedTransactionCode
  selectedTaxNameKey
  selectedProvinceKey
  taxRateKey
  taxRateDetailKey;
  selectedTransactionCodeKey;
  showLoader: boolean = false;
  taxRateArray =  [{
    "searchTaxRate": 'F',
    "addTaxRate": 'F',
    "viewTaxRate": 'F',
    "editTaxRate": 'F',
    "deleteTaxRate": 'F'
  }]

  public isOpen: boolean = false;
  taxRateSearchForm: FormGroup;
  showSearchTable: boolean;
  showtableLoader: boolean;
  provinceArray: any[];
  showRightArrow: boolean = true;
  provinceKey: number;
  payeeTypeKey;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
 
  constructor(private toastrService:ToastrService,
    private translate:TranslateService,
    private exDialog:ExDialog,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private routerAct: ActivatedRoute,
    public currentUserService: CurrentUserService,
    private completerService: CompleterService
  ) {
    this.error={ isError:false, errorMessage:''}
   }

  ngOnInit() {
    this.showLoader = true;
    if(localStorage.getItem('isReload')=='T'){
      this.currentUserService.getUserAuthorization().then(res=>{
        this.currentUser = this.currentUserService.currentUser
        this.showLoader = false;
        let checkArray = this.currentUserService.authChecks['SCO'].concat(this.currentUserService.authChecks['VCO']).concat(this.currentUserService.authChecks['ACC']).concat(this.currentUserService.authChecks['ACO']).concat(this.currentUserService.authChecks['LBR']).concat(this.currentUserService.authChecks['ACL']).concat(this.currentUserService.authChecks['SPL']).concat(this.currentUserService.authChecks['COC']).concat(this.currentUserService.authChecks['TXR'])
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload','')
      })
    }else{
      this.currentUserService.getUserAuthorization().then(res=>{
        this.currentUser = this.currentUserService.currentUser
        this.showLoader = false;
        let checkArray = this.currentUserService.authChecks['SCO'].concat(this.currentUserService.authChecks['VCO']).concat(this.currentUserService.authChecks['ACC']).concat(this.currentUserService.authChecks['ACO']).concat(this.currentUserService.authChecks['LBR']).concat(this.currentUserService.authChecks['ACL']).concat(this.currentUserService.authChecks['SPL']).concat(this.currentUserService.authChecks['COC']).concat(this.currentUserService.authChecks['TXR'])
        this.getAuthCheck(checkArray)
      })
    }
    this.buttonText=this.translate.instant('button.save');

    this.taxRatesForm=new FormGroup({
      'taxTransactionCode':new FormControl('',Validators.required),
      'taxName': new FormControl('',Validators.required),
      'province': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'taxRate': new FormControl('', [Validators.required,CustomValidators.taxRateRange]),
      'effectiveOn': new FormControl('',Validators.required),
      'expiredOn':new FormControl(''),
      'payee': new FormControl(''),
      'applicableOnAdrs': new FormControl(''),
    })
    this.taxRateSearchForm = new FormGroup({
      'searchProvince':new FormControl(''),
      'searchTransactionCode': new FormControl(''),
      'searchTaxName': new FormControl(''),
      'searchTaxRate': new FormControl(''),
      'searchEffectiveOn': new FormControl(''),
      'searchExpiredOn':new FormControl(''),
    })
    this.getTaxTransactionCode();
    this.getTaxName();
    this.getProvinceList();
    this.getPayee();
    
  }

  /* Get Payee List for Predictive Search*/
  getPayee(){
    this.hmsDataService.getApi(FinanceApi.getApplicableAddrs).subscribe(data=>{
      if(data.code == 200 && data.status =="OK"){
        this.payeeList=data.result;
        this.payeeData=this.completerService.local(
          this.payeeList,
          "applicableAddressDescription",
          "applicableAddressDescription"
        );
      }
    })
  }

  /** Method of Save-Update the form*/
  submitTaxRatesForm(taxRatesForm){
    let taxRateData = {
      "taxTransactionCode": this.selectedTransactionCode,
      "taxKey": this.selectedTaxNameKey,
      "provinceKey": this.selectedProvinceKey,
      "taxRate": this.taxRatesForm.value.taxRate,
      "payeeTypeKey":this.payeeTypeKey,
      "effectiveOn": (this.taxRatesForm.value.effectiveDate !="" ? this.changeDateFormatService.convertDateObjectToString(this.taxRatesForm.value.effectiveOn): ''),
      "expiredOn": (this.taxRatesForm.value.expiredOn !="" ? this.changeDateFormatService.convertDateObjectToString(this.taxRatesForm.value.expiredOn) : ''),
      "appAddKey":this.payeeTypeKey,
      "tranCdKey":this.selectedTransactionCodeKey //this.selectedApplicableAdrs  // After commenting the applicable address
    }
    if(this.addMode){ 
      if(this.taxRatesForm.valid){
        var url=FinanceApi.addUpdateTaxRatesUrl;
          this.hmsDataService.postApi(url,taxRateData).subscribe(data=>{
            if(data.code == 200 && data.status == "OK"){
              this.toastrService.success(this.translate.instant('finance.toaster.addTaxRateSuccess'))
              $("#closeTaxRateForm").trigger('click');
              this.getTaxRateList();
            }
          }); 
      }else{
        this.validateAllFormFields(this.taxRatesForm)
      }
    }else if(this.viewMode){
      this.enableEditMode();
    }else if(this.editMode){
      if(this.taxRatesForm.valid){
        var url=FinanceApi.addUpdateTaxRatesUrl;
        taxRateData['taxRateDetailKey'] = this.taxRateDetailKey
          this.hmsDataService.postApi(url,taxRateData).subscribe(data=>{
            if(data.code == 200 && data.status == "OK"){
              this.toastrService.success(this.translate.instant('finance.toaster.updateTaxRate'));
              $("#closeTaxRateForm").trigger('click');
              this.getTaxRateList();
            }
          }); 
        this.taxRatesForm.reset();
      }else{
        this.validateAllFormFields(this.taxRatesForm)
      }
    }  
  }

  enableAddMode(){    
    this.taxRatesForm.enable();
    this.addMode=true;
    this.viewMode=false;
    this.editMode=false;
    this.buttonText=this.translate.instant('button.save');
  }

  enableViewMode(){
    this.taxRatesForm.disable();
    this.addMode=false;
    this.viewMode=true;
    this.editMode=false;
    this.buttonText=this.translate.instant('button.edit')
  }

  enableEditMode(){
    this.taxRatesForm.enable();
    this.addMode=false;
    this.viewMode=false;
    this.editMode=true;
    this.buttonText=this.translate.instant('button.update')
  }

  /** Method for View the Tax Rates on click of Edit Icon*/
  viewTaxRatesByKey(taxRateObject){
    this.showLoader = true;
    this.enableViewMode();
    this.taxRateDetailKey =taxRateObject.taxRateDetailKey
    this.dentalData = this.routerAct.params.subscribe(params => {
      this.taxRateId = { "taxRateDetailKey": this.taxRateDetailKey, };
      var URL = FinanceApi.getTaxRateUrl;
      this.hmsDataService.post(URL, this.taxRateId).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.showLoader = false;
          this.taxRateDetailKey=data.result.taxRateDetailKey
          this.selectedTransactionCode = data.result.taxTransactionCode
          this.selectedProvinceKey = data.result.provinceKey
          this.selectedTaxNameKey = data.result.taxKey
          this.payeeTypeKey=data.result.appAddKey
          this.selectedTransactionCodeKey = data.result.tranCdKey
          this.taxRatesForm.patchValue({
            'applicableOnAdrs':data.result.mergedDescriptionTaxRate,
            'taxTransactionCode': data.result.mergedDescriptionTaxRateTransactionCode,//taxTransactionCode,//mergedDescriptionTaxRate
            'taxName': data.result.taxMasterDescription,
            'province':data.result.provinceName,
            'taxRate': data.result.taxRate,
            'payee':data.result.mergedDescriptionAppAdd,
            'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
            'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
          })
        }
      });
    });
    this.enableViewMode();
  }


  /* Delete Tax Rates Method*/
  deleteTaxRates(finTaxRatesKey){
    var action="Delete";
    this.exDialog.openConfirm((this.translate.instant(this.translate.instant('finance.toaster.confirm'))) +' '+action +' '+(this.translate.instant('card.exDialog.record')))
    .subscribe((value) => {
      if(value)
      {
        var requestedData={
          "taxRateDetailKey":finTaxRatesKey,
        }
        this.hmsDataService.postApi(FinanceApi.deleteTaxRateUrl,requestedData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastrService.success(this.translate.instant('finance.toaster.deleteTaxRate'));
            this.getTaxRateList();
            this.taxRatesForm.reset()
          } 
        });
      }
    });
  }


  /* Methos for Upper Form Datepicker */ 
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.taxRatesForm.patchValue(datePickerValue);
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
      this.taxRatesForm.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    if (this.taxRatesForm.value.effectiveOn && this.taxRatesForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.taxRatesForm.value.effectiveOn.date, this.taxRatesForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.taxRatesForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }


  /* Method for Footer Datepicker */
  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
     else if (event.reason == 1 && event.value != null && event.value != ''){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
     }
  }


  /* Search For Tax Rates Grid*/
  taxRatesListFilter(tableId: string) {
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId,appendExtraParam)
    var selectedProvince = this.selectedProvinceKey
    var selectedTaxName = this.selectedTaxNameKey
    if(!this.selectedProvinceKey){
      selectedProvince = ""
    }
    if(!this.selectedTaxNameKey){
      selectedTaxName = ""
    }
    var scheduleParam = {'key':'provinceKey','value':selectedProvince}
    params.push(scheduleParam)
    var provinceParam = {'key':'taxKey','value':selectedTaxName}
    params.push(provinceParam)
    var dateParams = [4,5];
    var URL = FinanceApi.taxRateSearchUrl;    
    this.dataTableService.jqueryDataTableReload(tableId,URL, params,dateParams) 
  }


  /* Reset the Tax Rates List */
  resetTaxRatesListFilter() {
    this.selectedProvinceKey = "";
    this.selectedTaxNameKey= "";
    this.dataTableService.resetTableSearch();
    this.taxRatesListFilter("finTaxRatesList");
    $('#finTaxRatesList .icon-mydpremove').trigger('click');
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


  resetTaxRateForm(){
    this.taxRatesForm.reset();
  }

  getTaxTransactionCode(){
    var URL = FinanceApi.getPredectiveTransactionCode;
    this.hmsDataService.get(URL).subscribe(data => {
      if(data.code == 200) {
        this.codeTypeList = data.result;
        this.codeDataRemote = this.completerService.local(
          this.codeTypeList,
          "mergedDescription",
          "mergedDescription"
        ); 
      }
    })
  }

  onTransactionCodeSelected(selected: CompleterItem) {
    if(selected) {
      this.selectedTransactionCode = selected.originalObject.tranCd;
      this.selectedTransactionCodeKey = selected.originalObject.tranCdKey
    }
    else {
      this.selectedTransactionCode = '';
      this.selectedTransactionCodeKey = '';
    }
  }
  
  onApplicableOnAdrsSelected(selected: CompleterItem) {
    if(selected) {
      this.selectedApplicableAdrs = selected.originalObject.tranCdKey;
    }
    else {
      this.selectedApplicableAdrs = '';
    }
  }
  getTaxName(){
    var URL = FinanceApi.getTaxMasterUrl;
    this.hmsDataService.get(URL).subscribe(data => {
      if(data.code == 200) {
        this.taxNameList = data.result;
        this.taxNameDataRemote = this.completerService.local(
          this.taxNameList,
          "taxMasterDescription",
          "taxMasterDescription"
        ); 
      }
    })  
  }

  onTaxNameSelected(selected: CompleterItem) {
    if(selected) {
      this.selectedTaxNameKey = (selected.originalObject.taxKey).toString();
    }
    else {
      this.selectedTaxNameKey = '';
    }
  }

  getProvinceList(){
    var URL = FinanceApi.getPredectiveProvinceCode;
    this.hmsDataService.get(URL).subscribe(data => {
      if(data.code == 200) {
        this.provinceList = data.result;
        this.provinceDataRemote = this.completerService.local(
          this.provinceList,
          "provinceName",
          "provinceName"
        ); 
      }
    })
  }

  onProvinceSelected(selected: CompleterItem) {
    if(selected) {
      this.selectedProvinceKey = (selected.originalObject.provinceKey).toString();
    }
    else {
      this.selectedProvinceKey = '';
    }
  }
  onSearchProvince(selected: CompleterItem){
    selected ? this.searchedProvinceKey = (selected.originalObject.provinceKey).toString() : this.searchedProvinceKey = '' ;
  }
  onSearchTransactionCode(selected: CompleterItem){
    selected ? this.searchedTransactionCode = selected.originalObject.tranCd : this.searchedProvinceKey = '';
  }
  onSearchTaxKey(selected: CompleterItem){
    selected ? this.searchedTaxKey = (selected.originalObject.taxKey).toString() : this.searchedProvinceKey = '';
  }
    
  getTaxRateList() {
    this.provinceArray = []
    this.showSearchTable = true
    this.showtableLoader = true
    let serviceData = {
      "provinceKey": this.searchedProvinceKey,
      "taxTransactionCode": this.searchedTransactionCode ,
      "taxKey": this.searchedTaxKey,
      "taxRate": this.taxRateSearchForm.value.searchTaxRate,
      "effectiveOn": (this.taxRateSearchForm.value.searchEffectiveOn != "" ? this.changeDateFormatService.convertDateObjectToString(this.taxRateSearchForm.value.searchEffectiveOn) :''),
      "expiredOn": (this.taxRateSearchForm.value.searchExpiredOn != "" ? this.changeDateFormatService.convertDateObjectToString(this.taxRateSearchForm.value.searchExpiredOn) : ''),
      "draw": 1,
      "length": 500,
      "start": 0
    }
    this.hmsDataService.postApi(FinanceApi.taxRateSearchUrl, serviceData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let taxRateData =  data.result.data
        let provinceData = []
        taxRateData.map(item => {
          return {
            provinceName: item.provinceName,
            provinceKey: item.provinceKey
          }
        }).forEach(item => provinceData.push(item));
        provinceData = this.hmsDataService.removeDuplicatesKeys(provinceData, 'provinceKey')
        this.provinceArray = []
        if (provinceData.length > 0) {
          for (var i = 0; i < provinceData.length; i++) {
            let rayy = taxRateData.filter(val => val.provinceKey == provinceData[i].provinceKey).map(data => data)
            var obj = {
              "provinceKey": provinceData[i].provinceKey,
              "provinceName": provinceData[i].provinceName,
              "child": rayy
            }
            this.provinceArray.push(obj);
          }
        }
        this.showtableLoader = false
      }
      else {
        this.provinceArray = []
        this.showtableLoader = false
      }
    })
  }

  changeIcon(selectedProvinceArray) {
    if (this.showRightArrow) {
      this.showRightArrow = false
      this.provinceKey = selectedProvinceArray.provinceKey
    } else {
      this.showRightArrow = true
      this.provinceKey = 0
    }
  }
 
  resetTaxRateSearch(){
    this.taxRateSearchForm.reset();
    this.searchedProvinceKey="",
    this.searchedTransactionCode="",
    this.searchedTaxKey=""
    // Below 2 to clear table data,close table on clear button.
    $("#taxRateList").dataTable.defaults
    this.showSearchTable = false
  }

  onSelectedPayee(selected:CompleterItem){
    if(selected){
      this.payeeTypeKey=selected.originalObject.appAddKey.toString();
    }
  }

  getAuthCheck(taxRateChecks){
    let authCheck = []
    if(this.currentUser.isAdmin == 'T'){
      this.taxRateArray = [{
        "searchTaxRate": 'T',
        "addTaxRate": 'T',
        "viewTaxRate": 'T',
        "editTaxRate": 'T',
        "deleteTaxRate": 'T'        
      }]
    }else{
      for(var i= 0; i < taxRateChecks.length; i++ ){
        authCheck[taxRateChecks[i].actionObjectDataTag] = taxRateChecks[i].actionAccess
      }
      this.taxRateArray = [{
        "searchTaxRate": authCheck['TXR279'],
        "addTaxRate": authCheck['TXR278'],
        "viewTaxRate": authCheck['TXR280'],
        "editTaxRate": authCheck['VTR282'],
        "deleteTaxRate": authCheck['TXR281']
      }]
    }
    return this.taxRateArray
  }

}
