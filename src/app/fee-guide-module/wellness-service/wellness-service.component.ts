import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FeeGuideApi } from '../fee-guide-api';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';

@Component({
  selector: 'app-wellness-service',
  templateUrl: './wellness-service.component.html',
  styleUrls: ['./wellness-service.component.css']
})

export class WellnessServiceComponent implements OnInit {
  expired: boolean;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  page;
  error: any;
  serviceKey: any;
  dropdownSettings = {};
  covCategoryItems = [];
  covCategoryList = [];
  parentServiceIdItems = [];
  parentServiceIdArray = [];
  parentServiceIdStart = 0;
  ServiceList = [];
  parentServiceId = [];
  coverageCategory = [];
  addMode: boolean = true;
  viewMode: boolean;
  editMode: boolean;
  procObservableObj;
  showSearchTable: boolean = false;
  showtableLoader: boolean = false;
  procCheck: boolean = true;
  procedureCodeColumns = [];
  wellnessCovCatId: any;
  reloadTable: boolean = false;
  wellnessParentServiceId;
  addWellnessServiceForm: FormGroup;
  wellnessServiceSearchForm: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public covCategoryData: CompleterData
  public parentServiceData: CompleterData
  public covCategoryDataRemote: RemoteData
  public wellnessParentServiceDataRemote: RemoteData
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
  addProcMode: boolean = false;
  selectedProc = {};
  editProcMode;
  procList = [];
  currentUser: any
  wellnessServiceCheck = [{
    "searchWellnessService": 'F',
    "viewWellnessService": 'F',
    "addWellnessService": 'F',
  }]

  constructor(
    private fb: FormBuilder,
    private completerService: CompleterService,
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private hmsDataService: HmsDataServiceService,
    public dataTableService: DatatableService,
    private route: ActivatedRoute,
    private routerAct: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    private exDialog: ExDialog,
  ) {
    this.error = { isError: false, errorMessage: '' };

    /* Get the detail for Wellness Covearge Category*/
    this.covCategoryDataRemote = completerService.remote(
      null,
      "wellCovCatDescription",
      "wellCovCatDescription"
    );
    this.covCategoryDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.covCategoryDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.searchWellnessCovCategoryUrl + `/${term}`;
    });
    this.covCategoryDataRemote.dataField('result');

    /* Get the detail for Wellness Parent Service Id */
    this.wellnessParentServiceDataRemote = completerService.remote(
      null,
      "wellnessServiceDesc,wellnessServiceId",
      "mergedDescription"
    );
    this.wellnessParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.wellnessParentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getWellnessParentServiceUrl + `/${term}`;
    });
    this.wellnessParentServiceDataRemote.dataField('result');

    /** Proc ID Inline Data table new row  */
    this.newProcId = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(5)]);
    this.procShortDesc = new FormControl('', [Validators.maxLength(70), CustomValidators.notEmpty]);
    this.procLongDesc = new FormControl('', CustomValidators.notEmpty)
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser=this.currentUserService.currentUser;
        let WellnessServiceArray = this.currentUserService.authChecks['WSR']        
        this.getAuthCheck(WellnessServiceArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
      this.currentUser=this.currentUserService.currentUser;
      let WellnessServiceArray = this.currentUserService.authChecks['WSR']
      this.getAuthCheck(WellnessServiceArray)
      this.dataTableInitialize();
      })
    }

    this.wellnessServiceSearchForm = new FormGroup({
      'searchId': new FormControl(),
      'searchEffectiveOn': new FormControl()
    });

    this.addWellnessServiceForm = new FormGroup({
      'coverageCategory': new FormControl('', Validators.required),
      'parentServiceId': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'serviceId': new FormControl('', [Validators.required, CustomValidators.onlyNumbers]),
      'descriptionLong': new FormControl('', [Validators.maxLength(1800)]),
      'descriptionShort': new FormControl('', [Validators.required, Validators.maxLength(70)]),
      'effectiveOn': new FormControl('', Validators.required),
      'expiredOn': new FormControl('')
    })

    this.dataTableInitialize();
    this.dropdownSettings = Constants.angular2Multiselect;
    this.renderer.selectRootElement('#fgws_searchId').focus();
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#wellnessServiceList .view-ico', function () {
      var id = $(this).data('id');
      self.serviceKey = id
    })
    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', 'View');
    })
  }

  dataTableInitialize() {
    this.procObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.procCheck) {
        if ('feeGuide.dentalService.procId' == this.translate.instant('feeGuide.dentalService.procId')) {
        } else {
          this.procedureCodeColumns = [
            { title: this.translate.instant('feeGuide.dentalService.procId'), data: 'wellnessProcedureId' },
            { title: this.translate.instant('feeGuide.dentalService.shortDescription'), data: 'wellnessProcedureDesc' },
          ]
          this.procCheck = false;
          this.procObservableObj.unsubscribe();
        }
      }
    })
  }

  // Methos for Upper Form Datepicker
  changeDateFormatAddForm(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      if (formName == 'wellnessServiceSearchForm') {
        this.wellnessServiceSearchForm.patchValue(datePickerValue);
      }
      else {
        this.addWellnessServiceForm.patchValue(datePickerValue);
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
      if (formName == 'wellnessServiceSearchForm') {
        this.wellnessServiceSearchForm.patchValue(datePickerValue);
      }
      else {
        this.addWellnessServiceForm.patchValue(datePickerValue);
      }
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    if (formName == 'addWellnessServiceForm') {
      if (this.addWellnessServiceForm.value.effectiveOn && this.addWellnessServiceForm.value.expiredOn) {
        this.error = this.changeDateFormatService.compareTwoDates(this.addWellnessServiceForm.value.effectiveOn.date, this.addWellnessServiceForm.value.expiredOn.date);
        if (this.error.isError == true) {
          this.addWellnessServiceForm.controls['expiredOn'].setErrors({
            "ExpiryDateNotValid": true
          });
        }
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  // Method of angular2-multiselect Dropdown for Select the values  
  onSelect(selected: CompleterItem, type) {
    if (selected && type == "parentServiceId") {
      this.wellnessParentServiceId = selected.originalObject.wellnessServiceId
    }
    if (selected && type == 'coverageCategory') {
      this.wellnessCovCatId = selected.originalObject.wellCovCatKey
    }
  }

  // Method for View the Wellness Service on click of View Icon
  viewWellnessServiceByKey(wellnessServiceObject) {
    this.serviceKey = wellnessServiceObject.serviceKey
    let requestedData = {
      "wellnessServiceKey": wellnessServiceObject.serviceKey
    }
    this.hmsDataService.post(FeeGuideApi.getWellnessServiceUrl, requestedData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.coverageCategory = [{ 'id': data.result.wellCovCatKey, 'itemName': data.result.wellCovCatDescription }]
        this.parentServiceId = [{ 'id': data.result.wellnessParentServiceId, 'itemName': data.result.wellnessParentServiceDesc }]
        this.wellnessParentServiceId = data.result.wellnessParentServiceId
        this.wellnessCovCatId = data.result.wellCovCatKey

        this.addWellnessServiceForm.patchValue({
          'coverageCategory': data.result.wellCovCatDescription,
          'parentServiceId': data.result.wellnessParentServiceDesc,
          'serviceId': data.result.wellnessServiceId,
          'descriptionLong': data.result.wellnessServiceLongDesc,
          'descriptionShort': data.result.wellnessServiceDesc,
          'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
        })
        this.procedureCodeList(wellnessServiceObject.serviceKey);
        this.wellnessProcList(wellnessServiceObject.serviceKey)
      }
    });
    this.enableViewMode();
  }

  // Method for Save & Update Wellness Service
  submitWellnessServiceForm(addWellnessServiceForm) {
    let serviceData = {
      "wellnessServiceDesc": this.addWellnessServiceForm.value.descriptionShort,
      "wellnessServiceId": this.addWellnessServiceForm.value.serviceId,
      "wellnessParentServiceId": this.wellnessParentServiceId,
      "wellnessServiceLongDesc": this.addWellnessServiceForm.value.descriptionLong,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addWellnessServiceForm.value.effectiveOn),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addWellnessServiceForm.value.expiredOn),
      "wellCovCatKey": this.wellnessCovCatId,
    }

    if (this.addMode) {
      serviceData["procedureDto"] = this.procList
      if (this.addWellnessServiceForm.valid) {
        var url = FeeGuideApi.saveWellnessServiceUrl;
        this.hmsDataService.postApi(url, serviceData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('Wellness Service Saved Successfully!!'));
            this.searchProcedureCode()
            this.hmsDataService.OpenCloseModal('closeWellnessServiceForm');
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == "WELLNESS_SERVICE_ID_ALREADY_EXIST") {
            this.toastrService.error(this.translate.instant('Wellness Service ID Already Exist!!'));
          }
          else {
            this.toastrService.error(this.translate.instant('Wellness Service Failed!!'));
          }
        });
      }
      else {
        this.validateAllFormFields(this.addWellnessServiceForm)
      }
    }
    if (this.editMode) {
      if (this.addWellnessServiceForm.valid) {
        serviceData["wellnessServiceKey"] = this.serviceKey
        this.hmsDataService.postApi(FeeGuideApi.updateWellnessServiceUrl, serviceData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastrService.success(this.translate.instant('Wellness Service Updated Successfully!!'));
            this.reloadTable = true;
            $("#closeWellnessServiceForm").trigger('click');
          }
          else {
            this.toastrService.error(this.translate.instant('Wellness Service Not Updated!!'));
          }
        });
      }
      else {
        this.validateAllFormFields(this.addWellnessServiceForm)
      }
    }
  }

  wellnessProcList(key) {
    let reqParam = {
      "wellnessServiceKey": key
    }
    this.hmsDataService.postApi(FeeGuideApi.getAttachedWellnessProcedureCodeListUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.procList = data.result.data
      }
    })
  }

  procedureCodeList(id) {
    var reqParam = [
      { 'key': 'wellnessServiceKey', 'value': id },
    ]
    var Url = FeeGuideApi.getAttachedWellnessProcedureCodeListUrl
    var tableId = "wellnessProcCodeList"
    if (!$.fn.dataTable.isDataTable('#wellnessProcCodeList')) {
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.procedureCodeColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, null, null, null, [1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    return false;
  }

  enableAddMode() {
    this.addWellnessServiceForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
  }

  // Method for enable View Mode
  enableViewMode() {
    this.addWellnessServiceForm.disable();
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
  }

  enableEditMode() {
    this.addWellnessServiceForm.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
  }

  resetSearchForm() {
    this.wellnessServiceSearchForm.reset();
    this.showSearchTable = false;
  }

  clearAddWellnessServiceForm() {
    this.addWellnessServiceForm.reset();
    this.enableAddMode();
    this.renderer.selectRootElement('#fgws_searchId').focus();
    this.resetNewProcRow()
  }

  // Method of angular2-multiselect Dropdown for DeSelect the values  
  onDeSelect(item: any, type) {
    if (type == 'parentServiceId') {
      this.addWellnessServiceForm.controls[type].setValue('');
    }
    if (type == 'coverageCategory') {
      this.addWellnessServiceForm.controls[type].setValue('');
    }
  }

  searchProcedureCode() {
    this.page = 1;
    this.ServiceList = []
    this.showSearchTable = true
    this.showtableLoader = true
    let serviceData = {
      "serviceId": this.wellnessServiceSearchForm.value.searchId,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.wellnessServiceSearchForm.value.searchEffectiveOn),
      "disciplineKey": "6",
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

  getServiceChild(dentalService) {
    this.serviceKey = dentalService.serviceKey
  }

  changeIcon(dentalService) {
    if (this.showRightArrow) {
      this.showRightArrow = false
      this.serviceKey = dentalService.serviceKey
    } else {
      this.showRightArrow = true
      this.serviceKey = 0
    }

  }
  changeIconSecondChild(dentalService1) {
    if (this.showRightChildArrow) {
      this.showRightChildArrow = false
      this.childServiceKey = dentalService1.serviceKey
    } else {
      this.showRightChildArrow = true
      this.childServiceKey = 0
    }
  }
  changeIconThirdChild(dentalService2) {
    if (this.showRightThirdChildArrow) {
      this.showRightThirdChildArrow = false
      this.thirdChildServiceKey = dentalService2.serviceKey
    } else {
      this.showRightThirdChildArrow = true
      this.thirdChildServiceKey = 0
    }
  }
  changeIconFourthChild(dentalService3) {
    if (this.showRightFourthChildArrow) {
      this.showRightFourthChildArrow = false
      this.fourthChildServiceKey = dentalService3.serviceKey
    } else {
      this.showRightFourthChildArrow = true
      this.fourthChildServiceKey = 0
    }
  }
  changeIconFifthChild(dentalService4) {
    if (this.showRightFifthChildArrow) {
      this.showRightFifthChildArrow = false
      this.fifthChildServiceKey = dentalService4.serviceKey
    } else {
      this.showRightFifthChildArrow = true
      this.fifthChildServiceKey = 0
    }
  }
  changeIconsixthChild(dentalService5) {
    if (this.showRightSixthChildArrow) {
      this.showRightSixthChildArrow = false
      this.sixthChildServiceKey = dentalService5.serviceKey
    } else {
      this.showRightSixthChildArrow = true
      this.sixthChildServiceKey = 0
    }
  }
  changeIconSeventhChild(dentalService6) {
    if (this.showRightSeventhChildArrow) {
      this.showRightSeventhChildArrow = false
      this.seventhChildServiceKey = dentalService6.serviceKey
    } else {
      this.showRightSeventhChildArrow = true
      this.seventhChildServiceKey = 0
    }
  }

  // Method for validate the Form fields
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

  addNewProcCodeClick(buttonName) {
    this.hmsDataService.OpenCloseModalForOverride(buttonName);
    var self = this;
    setTimeout(function () {
      self.renderer.selectRootElement('#coverageCategoryID').focus();
    }, 1000);
  }
  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  // INLINE WELLNESS PROC TABLE FUNCTIONALITY START
  enableAddProc() {
    this.addProcMode = true;
    this.selectedProc = {};
    this.editProcMode = false;
  }

  validateProcId(event) {
    if (this.newProcId.valid) {
      this.hmsDataService.getApi(FeeGuideApi.checkWellnessProcCodeUrl + '/' + this.newProcId.value).subscribe(data => {
        if(data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST"){
          this.newProcId.setErrors({
            "alreadyExist": true
          })
        } else {
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
      wellnessProcedureId: this.newProcId.value,
      wellnessProcedureDesc: this.procShortDesc.value,
      wellnessProcedureLongDesc: this.procLongDesc.value
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
    this.selectedProc['wellnessProcedureId'] = rowData.wellnessProcedureId;
    this.selectedProc['wellnessProcedureDesc'] = rowData.wellnessProcedureDesc;
    this.selectedProc['wellnessProcedureLongDesc'] = rowData.wellnessProcedureLongDesc;
  }

  /** Update Unit */
  updateProc(index) {
    if (this.newProcId.invalid) {
      return;
    }
    let procKey = this.procList[index].wellnessProcedureKey
    var rowData = {
      wellnessProcedureId: this.newProcId.value,
      wellnessProcedureDesc: this.procShortDesc.value,
      wellnessProcedureLongDesc: this.procLongDesc.value
    }
    let copy = Object.assign({}, rowData);
    if (this.addMode) {
      this.procList[index] = copy;
    } else if (this.editMode) {
      rowData["wellnessProcedureKey"] = procKey
      rowData["wellnessServiceKey"] = this.serviceKey
      this.hmsDataService.postApi(FeeGuideApi.updateWellnessProcCode, rowData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.wellnessProcList(data.result.wellnessServiceKey)
          this.toastrService.success(this.translate.instant('feeGuide.toaster.wellnessProcCodeUpdateSuccess'))
        } else if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
          this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'))
        } else if (data.code == 400 && data.status === "BAD_REQUEST") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'));
        } else {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.wellnessProcCodeNotUpdated'))
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
  // INLINE WELLNESS PROC TABLE FUNCTIONALITY END

  getAuthCheck(wellnessServiceArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.wellnessServiceCheck = [{
        "searchWellnessService": 'T',
        "viewWellnessService": 'T',
        "addWellnessService": 'T',
      }]
    } else {
      for (var i = 0; i < wellnessServiceArray.length; i++) {
        userAuthCheck[wellnessServiceArray[i].actionObjectDataTag] = wellnessServiceArray[i].actionAccess
      }
      this.wellnessServiceCheck = [{
        "searchWellnessService": userAuthCheck['VWL408'],
        "viewWellnessService": userAuthCheck['SWV407'],
        "addWellnessService": userAuthCheck['SWV406']
      }]
    }
    return this.wellnessServiceCheck
  }

}