import { Component, OnInit, Input, ViewChildren, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; 
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { ToastrService } from 'ngx-toastr'; 
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { TranslateService, FakeMissingTranslationHandler } from '@ngx-translate/core';
import { FeeGuideApi } from '../fee-guide-api';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/ex-dialog.service';
@Component({
  selector: 'app-health-service',
  templateUrl: './health-service.component.html',
  styleUrls: ['./health-service.component.css']
})

export class HealthServiceComponent implements OnInit {
  expired: boolean;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  healthServiceSearchForm: FormGroup;
  addHealthServiceForm: FormGroup;

  dropdownSettings = {};
  parentServiceId: any;
  coverageCategory: any;
  procCheck = true;
  page;
  error: any;
  addMode: boolean = true;
  viewMode: boolean
  editMode: boolean
  rowId: any;
  serviceId;
  procedureCodeColumns;
  procObservableObj;
  showSearchTable: boolean = false;
  showtableLoader: boolean = false;
  ServiceList =[];
  serviceKey: any;
  public parentServiceDataRemote: RemoteData;
  public coverageCategoryDataRemote: RemoteData;
  healthParentServiceId: any;
  covCatId: any;
  currentUser
  healthServiceCheck = [{
    "searchHealthService": 'F',
    "viewHealthService": 'F',
    "addHealthService": 'F',
  }]
  childServiceKey: any;
  thirdChildServiceKey: any;
  fourthChildServiceKey: number;
  fifthChildServiceKey: number;
  sixthChildServiceKey: number;
  seventhChildServiceKey: number;
  showRightArrow: boolean = true;
  showRightChildArrow: boolean = true;
  showRightThirdChildArrow: boolean = true;
  showRightFourthChildArrow: boolean = true;
  showRightFifthChildArrow: boolean = true;
  showRightSixthChildArrow: boolean = true;
  showRightSeventhChildArrow: boolean = true;
  procLongDesc: FormControl;
  procShortDesc: FormControl;
  newProcId: FormControl;
  addProcMode:boolean = false;
  selectedProc = {};
  editProcMode;
  procList = [];
  
  constructor(
    private renderer: Renderer2,
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private routerAct: ActivatedRoute,
    private router: Router,
    private currentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private completerService: CompleterService,
    private exDialog: ExDialog, ) {
    this.error = { isError: false, errorMessage: '' };
    this.parentServiceDataRemote = completerService.remote(
      null,
      "healthParentServiceDesc,healthServiceId",
      "mergedDescription"
    );
    this.parentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.parentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getHealthParentServiceList + `/${term}`;
    });
    this.parentServiceDataRemote.dataField('result');

    this.coverageCategoryDataRemote = completerService.remote(
      null,
      "hlthCovCatDescription",
      "hlthCovCatDescription"
    );
    this.coverageCategoryDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.coverageCategoryDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getHealthCovCategory + `/${term}`;
    });
    this.coverageCategoryDataRemote.dataField('result');
    /** Proc ID Inline Data table new row for Dental  */
    this.newProcId = new FormControl('', [Validators.required,Validators.minLength(3), Validators.maxLength(5)]);
    this.procShortDesc = new FormControl('', [Validators.maxLength(70), CustomValidators.notEmpty]);
    this.procLongDesc = new FormControl('', CustomValidators.notEmpty)
  }

  ngOnInit() {
    this.renderer.selectRootElement('#fghs_searchId').focus();
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let DentalServiceArray = this.currentUserService.authChecks['HSR']
        this.getAuthCheck(DentalServiceArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let DentalServiceArray = this.currentUserService.authChecks['HSR']
        this.getAuthCheck(DentalServiceArray)
        this.dataTableInitialize();
      })
    }

    this.healthServiceSearchForm = new FormGroup({
      'searchId': new FormControl(),
      'searchEffectiveOn': new FormControl()
    });

    this.addHealthServiceForm = new FormGroup({
      'coverageCategory': new FormControl('', Validators.required),
      'parentServiceId': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'serviceId': new FormControl('', [Validators.required, CustomValidators.onlyNumbers]),
      'descriptionLong': new FormControl('', [Validators.maxLength(1800)]),
      'descriptionShort': new FormControl('', [Validators.required, Validators.maxLength(70)]),
      'effectiveOn': new FormControl('', Validators.required),
      'expiredOn': new FormControl('')
    })
    this.dropdownSettings = Constants.angular2Multiselect;
  }

  getAuthCheck(healthServiceArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.healthServiceCheck = [{
        "searchHealthService": 'T',
        "viewHealthService": 'T',
        "addHealthService": 'T',
      }]
    } else {
      for (var i = 0; i < healthServiceArray.length; i++) {
        userAuthCheck[healthServiceArray[i].actionObjectDataTag] = healthServiceArray[i].actionAccess
      }

      this.healthServiceCheck = [{
        "searchHealthService": userAuthCheck['HSR268'],
        "viewHealthService": userAuthCheck['HSR270'],
        "addHealthService": userAuthCheck['SHS269'],
      }]
    }
    return this.healthServiceCheck
  }

  dataTableInitialize() {//Procedure Code List
    this.procObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.procCheck) {
        if ('feeGuide.dentalService.procId' == this.translate.instant('feeGuide.dentalService.procId')) {
        } else {
          this.procedureCodeColumns = [
            { title: this.translate.instant('feeGuide.dentalService.procId'), data: 'healthProcedureId' },
            { title: this.translate.instant('feeGuide.dentalService.shortDescription'), data: 'healthProcedureDesc' },
          ]
          this.procCheck = false;
          this.procObservableObj.unsubscribe();
        }
      }
    })
  }

  /** Methos for Upper Form Datepicker */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      if (formName == 'addHealthServiceForm') {
        this.addHealthServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'healthServiceSearchForm') {
        this.healthServiceSearchForm.patchValue(datePickerValue);
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
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
      if (formName == 'addHealthServiceForm') {
        this.addHealthServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'healthServiceSearchForm') {
        this.healthServiceSearchForm.patchValue(datePickerValue);
      }
    }
    if (this.addHealthServiceForm.value.effectiveOn && this.addHealthServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addHealthServiceForm.value.effectiveOn.date, this.addHealthServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addHealthServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

   //View the Health Service on click of View Icon
   viewHealthServiceByKey(healthServiceObject) {
    this.serviceId = healthServiceObject.serviceKey;
    let requestedData = {
      "healthServiceKey": healthServiceObject.serviceKey
    }
    this.hmsDataService.post(FeeGuideApi.getHealthService, requestedData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.covCatId = data.result.hlthCovCatKey
        this.healthParentServiceId = data.result.healthParentServiceId
        this.addHealthServiceForm.patchValue({
          'coverageCategory': data.result.hlthCovCatDescription,
          'parentServiceId': data.result.healthParentServiceDesc,
          'serviceId': data.result.healthServiceId,
          'descriptionLong': data.result.healthServiceLongDesc,
          'descriptionShort': data.result.healthServiceDesc,
          'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
        })
        this.procedureCodeList(healthServiceObject.serviceKey);
        this.healthProcList(healthServiceObject.serviceKey)
      }
    });
    this.enableViewMode();
  }

  //For Save & Update Health Service
  submitHealthServiceForm(addHealthServiceForm) {
    if (this.addHealthServiceForm.valid) {
      let serviceData = {
        "healthServiceDesc": this.addHealthServiceForm.value.descriptionShort,
        "healthServiceId": this.addHealthServiceForm.value.serviceId,
        "healthParentServiceId": this.healthParentServiceId,
        "healthServiceLongDesc": this.addHealthServiceForm.value.descriptionLong,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addHealthServiceForm.value.effectiveOn),
        "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addHealthServiceForm.value.expiredOn),
        "hlthCovCatKey": this.covCatId,
      }
      if (this.addMode) {
        serviceData["procedureDto"] = this.procList
        this.hmsDataService.postApi(FeeGuideApi.saveHealthService, serviceData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('Health Service Saved Successfully!!'));
            this.hmsDataService.OpenCloseModal('closeHealthServiceForm');
            this.searchProcedureCode()
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == "HEALTH_SERVICE_ID_ALREADY_EXIST") {
            this.toastrService.error(this.translate.instant('Health Service ID Already Exist!!'));
          }
          else {
            this.toastrService.error(this.translate.instant('Health Service Failed!!'));
          }
        });
      }
      if (this.editMode) {
        serviceData["healthServiceKey"] = this.serviceKey
        var url = FeeGuideApi.updateHealthService;
        this.hmsDataService.postApi(url, serviceData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastrService.success(this.translate.instant('Health Service Updated Successfully!!'));
            this.hmsDataService.OpenCloseModal('closeHealthServiceForm');
          }
          else {
            this.toastrService.error(this.translate.instant('Health Service Not Updated!!'));
          }
        });
      }
    }
    else {
      this.validateAllFormFields(this.addHealthServiceForm)
    }
  }

  procedureCodeList(id) {
    var reqParam = [
      { 'key': 'healthServiceKey', 'value': id },
    ]
    var Url = FeeGuideApi.getHealthAttachedProcedureCodeList
    var tableId = "healthProcedureCodeList"
    if (!$.fn.dataTable.isDataTable('#healthProcedureCodeList')) {
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.procedureCodeColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined,null,null,null,[1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    return false;
  }

  healthProcList(key){
    let reqParam = {
      "healthServiceKey": key
    }
    this.hmsDataService.postApi(FeeGuideApi.getHealthAttachedProcedureCodeList, reqParam).subscribe(data => {
      if(data.code == 200 && data.status == "OK"){
        this.procList = data.result.data
      }
    })
  }

  enableAddMode() {
    this.addHealthServiceForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    var self = this;
    setTimeout(function () {
        self.renderer.selectRootElement('#healthCoverageCategory').focus();
    }, 1000);
  }

  //For enable View Mode
  enableViewMode() {
    this.addHealthServiceForm.disable();
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
    this.procedureCodeList(this.serviceId);
  }

  enableEditMode() {
    this.addHealthServiceForm.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
  }

  //For validate the Form fields
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

  resetSearchForm() {
    this.healthServiceSearchForm.reset();
    this.showSearchTable = false;
  }

  clearAddHealthServiceForm() {
    this.addHealthServiceForm.reset();
    var self = this;
    setTimeout(function () {
        self.renderer.selectRootElement('#fghs_searchId').focus();
    }, 1000);
    this.resetNewProcRow()
  }

  //Angular2-multiselect Dropdown for Select the values  
  onSelect(selected: CompleterItem, type) {
    if (selected && type == 'parentServiceId') {
      this.healthParentServiceId = selected.originalObject.healthServiceId
    }
    if (selected && type == 'coverageCategory') {
      this.covCatId = selected.originalObject.hlthCovCatKey
    }
  }

  searchProcedureCode() {
    this.page = 1
    this.ServiceList = []
    this.showSearchTable = true
    this.showtableLoader = true
    let serviceData = {
      "serviceId": this.healthServiceSearchForm.value.searchId,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.healthServiceSearchForm.value.searchEffectiveOn),
      "disciplineKey": "3",
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalServiceSearch, serviceData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.ServiceList = data.result
        this.showtableLoader = false
      }
      else {
        this.ServiceList = []
        this.showtableLoader = false
      }
    })
  }

  changeIcon(service) {
    if (this.showRightArrow) {
      this.showRightArrow = false
      this.serviceKey = service.serviceKey
    } else {
      this.showRightArrow = true
      this.serviceKey = 0
    }

  }
  changeIconSecondChild(service1) {
    if (this.showRightChildArrow) {
      this.showRightChildArrow = false
      this.childServiceKey = service1.serviceKey
    } else {
      this.showRightChildArrow = true
      this.childServiceKey = 0
    }
  }
  changeIconThirdChild(service2) {
    if (this.showRightThirdChildArrow) {
      this.showRightThirdChildArrow = false
      this.thirdChildServiceKey = service2.serviceKey
    } else {
      this.showRightThirdChildArrow = true
      this.thirdChildServiceKey = 0
    }
  }
  changeIconFourthChild(service3) {
    if (this.showRightFourthChildArrow) {
      this.showRightFourthChildArrow = false
      this.fourthChildServiceKey = service3.serviceKey
    } else {
      this.showRightFourthChildArrow = true
      this.fourthChildServiceKey = 0
    }
  }
  changeIconFifthChild(dentalService4){
    if(this.showRightFifthChildArrow) {
      this.showRightFifthChildArrow = false
      this.fifthChildServiceKey = dentalService4.serviceKey
    } else {
      this.showRightFifthChildArrow = true
      this.fifthChildServiceKey = 0
    }
  }
   changeIconsixthChild(dentalService5){
    if (this.showRightSixthChildArrow) {
      this.showRightSixthChildArrow = false
      this.sixthChildServiceKey = dentalService5.serviceKey
    } else {
      this.showRightSixthChildArrow = true
      this.sixthChildServiceKey = 0
    }
  }
  changeIconSeventhChild(dentalService6){
    if (this.showRightSeventhChildArrow) {
      this.showRightSeventhChildArrow = false
      this.seventhChildServiceKey = dentalService6.serviceKey
    } else {
      this.showRightSeventhChildArrow = true
      this.seventhChildServiceKey = 0
    }
  }
  
  focusNextEle(event,id){
    $('#'+id).focus(); 
  } 

  /* INLINE HEALTH PROC TABLE FUNCTIONALITY START HERE */
  enableAddProc() {
    this.addProcMode = true;
    this.selectedProc = {};
    this.editProcMode = false;
  }

  validateProcId(event) {
    if (this.newProcId.valid) {
      this.hmsDataService.getApi(FeeGuideApi.checkHealthProcCodeUrl + '/' + this.newProcId.value).subscribe(data =>{
        if(data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST"){
          this.newProcId.setErrors({
            "alreadyExist": true
          })
        } else{
          this.newProcId.updateValueAndValidity()
        }
      })
    }
  }

  isNumberKey(event) {
    return (event.ctrlKey || event.altKey
        || (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false)
        || (95 < event.keyCode && event.keyCode < 106)
        || (event.keyCode == 8) || (event.keyCode == 9)
        || (event.keyCode > 34 && event.keyCode < 40)
        || (event.keyCode == 46))
  }

   /** Add new Mask from Mask list */
   addNewProc(newRecord) {
    this.newProcId.markAsTouched();
    if (this.newProcId.invalid) {
      return;
    }
    var newProcData = {
      healthProcedureId: this.newProcId.value,
      healthProcedureDesc: this.procShortDesc.value,
      healthProcedureLongDesc: this.procLongDesc.value
    }
    this.procList.unshift(newProcData);
    this.resetNewProcRow();  
  }

  resetNewProcRow() {
    this.addProcMode = false;
    this.newProcId.reset();
    this.procShortDesc.reset();
    this.procLongDesc.reset();
  }

  /** Edit Unit */
  enableEditProc(rowData, rowIndex): void {
    this.resetNewProcRow();
    this.editProcMode = true;
    let copy = Object.assign({}, rowData);
    this.selectedProc = copy;
    this.selectedProc['rowIndex'] = rowIndex;
    this.selectedProc['healthProcedureId'] = rowData.healthProcedureId;
    this.selectedProc['healthProcedureDesc'] = rowData.healthProcedureDesc;
    this.selectedProc['healthProcedureLongDesc'] = rowData.healthProcedureLongDesc;
  }

  /** Update Unit */
  updateProc(index) {
    if (this.newProcId.invalid) {
      return;
    }
    let procKey = this.procList[index].healthProcedureKey
    var rowData = {
      healthProcedureId: this.newProcId.value,
      healthProcedureDesc: this.procShortDesc.value,
      healthProcedureLongDesc: this.procLongDesc.value
    }
    let copy = Object.assign({}, rowData);
    if (this.addMode) {
      this.procList[index] = copy;
    } else if (this.editMode) {
      rowData["healthProcedureKey"] = procKey;
      rowData["healthServiceKey"] = this.serviceId;
      this.hmsDataService.postApi(FeeGuideApi.updateHealthProcCode, rowData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.healthProcList(data.result.healthServiceKey)
          this.toastrService.success(this.translate.instant('feeGuide.toaster.healthProcCodeUpdateSuccess'))
        } else if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
          this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'))
        } else if (data.code == 400 && data.status === "BAD_REQUEST") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'));
        } else if (data.code == 400 && data.status === "BAD_REQ") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.healthProcCodeNotUpdated'))
        } else {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.healthProcCodeNotUpdated'))
        }
      });
    }
    this.resetProcInfo();
  }

  /** reset Unit form */
  resetProcInfo() {
    this.newProcId.reset();
    this.procShortDesc.reset()
    this.procLongDesc.reset()
    this.selectedProc = {};
    this.editProcMode = false;
  }

  deleteProd(index) {
    this.exDialog.openConfirm(this.translate.instant('rules.addEditViewRule.deleteConfirmation')).subscribe((value) => {
      if (value) {
        this.procList.splice(index, 1);
      }
    });
  }
  /* INLINE HEALTH PROC TABLE FUNCTIONALITY END HERE */
}