import { Component, OnInit, HostListener, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { FeeGuideApi } from '../fee-guide-api';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
@Component({
  selector: 'app-hsa-service',
  templateUrl: './hsa-service.component.html',
  styleUrls: ['./hsa-service.component.css']
})

export class HsaServiceComponent implements OnInit {
  expired: boolean;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  hsaServiceSearchForm: FormGroup;
  addHsaServiceForm: FormGroup;
  dropdownSettings = {};
  page;
  error: any;
  addMode: boolean = true;
  viewMode: boolean
  editMode: boolean
  parentServiceId: any
  coverageCategory: any;
  public parentServiceDataRemote: RemoteData;
  public coverageCategoryDataRemote: RemoteData;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  showSearchTable: boolean = false;
  showtableLoader: boolean;
  hsaServiceList = [];
  serviceKey: any;
  hsaParentServiceId: any;
  covCatId: any;
  procObservableObj;
  procCheck = true;
  procedureCodeColumns = [];
  serviceId;
  hsaServiceId
  currentUser
  hsaServiceCheck = [{
    "searchHsaService": 'F',
    "addHsaService": 'F',
    "viewHsaService": 'F',
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
  addProcMode: boolean = false;
  selectedProc = {};
  editProcMode;
  procList = [];

  constructor(
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
    private renderer: Renderer2,
    private exDialog: ExDialog
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.parentServiceDataRemote = completerService.remote(
      null,
      "hsaServiceId,hsaServiceDesc",
      "mergedDescription"
    );
    this.parentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.parentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getHSAParentServiceList + `/${term}`;
    });
    this.parentServiceDataRemote.dataField('result');

    this.coverageCategoryDataRemote = completerService.remote(
      null,
      "hsaCovCatDescription",
      "hsaCovCatDescription"
    );
    this.coverageCategoryDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.coverageCategoryDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getPredictiveHsaCovCategoryUrl + `/${term}`;
    });
    this.coverageCategoryDataRemote.dataField('result');

    /** Proc ID Inline Data table new row for Dental  */
    this.newProcId = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(5)]);
    this.procShortDesc = new FormControl('', [Validators.maxLength(70), CustomValidators.notEmpty]);
    this.procLongDesc = new FormControl('', CustomValidators.notEmpty)
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let hsaServiceArray = this.currentUserService.authChecks['HSS']
        this.getAuthCheck(hsaServiceArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let hsaServiceArray = this.currentUserService.authChecks['HSS']
        this.getAuthCheck(hsaServiceArray)
        this.dataTableInitialize();
      })
    }
    this.hsaServiceSearchForm = new FormGroup({
      'searchId': new FormControl(),
      'searchEffectiveOn': new FormControl()
    });

    this.addHsaServiceForm = new FormGroup({
      'coverageCategory': new FormControl('', Validators.required),
      'parentServiceId': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'serviceId': new FormControl('', [Validators.required]),
      'descriptionLong': new FormControl('', [Validators.maxLength(1800)]),
      'descriptionShort': new FormControl('', [Validators.required, Validators.maxLength(70)]),
      'effectiveOn': new FormControl('', Validators.required),
      'expiredOn': new FormControl('')
    })

    this.dropdownSettings = Constants.angular2Multiselect;
    this.renderer.selectRootElement('#fghsas_searchId').focus();
  }


  dataTableInitialize() {
    this.procObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.procCheck) {
        if ('feeGuide.dentalService.procId' == this.translate.instant('feeGuide.dentalService.procId')) {
        } else {
          this.procedureCodeColumns = [
            { title: this.translate.instant('feeGuide.dentalService.procId'), data: 'hsaProcedureId' },
            { title: this.translate.instant('feeGuide.dentalService.shortDescription'), data: 'hsaProcedureDesc' },
          ]
          this.procCheck = false;
          this.procObservableObj.unsubscribe();
        }
      }
    })
  }

  ngAfterViewInit() {
    var self = this;
  }

  onSelect(selected: CompleterItem, type) {
    if (selected && type == 'parentServiceId') {
      this.hsaParentServiceId = selected.originalObject.hsaServiceId
    }
    if (selected && type == 'coverageCategory') {
      this.covCatId = selected.originalObject.hsaCovCatKey
    }
  }

  //For enable add Mode
  enableAddMode() {
    this.addHsaServiceForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
  }

  //For enable View Mode
  enableViewMode() {
    this.addHsaServiceForm.disable();
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
  }

  //For enable Edit Mode
  enableEditMode() {
    this.addHsaServiceForm.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
  }

  // Method for Save & Update Hsa Service
  submitHsaServiceForm(addHsaServiceForm) {
    let serviceData = {
      "hsaServiceDesc": this.addHsaServiceForm.value.descriptionShort,
      "hsaServiceId": this.addHsaServiceForm.value.serviceId,
      "hsaParentServiceId": this.hsaParentServiceId,
      "hsaServiceLongDesc": this.addHsaServiceForm.value.descriptionLong,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addHsaServiceForm.value.effectiveOn),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addHsaServiceForm.value.expiredOn),
      "hsaCovCatKey": this.covCatId,
    }
    var url = ''

    if (this.addHsaServiceForm.valid) {
      if (this.addMode) {
        serviceData["procedureDto"] = this.procList
        url = FeeGuideApi.saveHsaServiceUrl;
      }
      if (this.editMode) {
        url = FeeGuideApi.updateHsaServiceUrl;
        serviceData["hsaServiceKey"] = this.serviceId
      }
      this.hmsDataService.postApi(url, serviceData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addMode) {
            this.toastrService.success(this.translate.instant('HSA Service Saved Successfully!!'))
            this.hmsDataService.OpenCloseModal('closeHsaServiceForm');
            this.searchProcedureCode()
            this.enableViewMode();
          }
          if (this.editMode) {
            this.toastrService.success(this.translate.instant('HSA Service Updated Successfully!!'));
            this.enableViewMode();
            this.hmsDataService.OpenCloseModal('closeHsaServiceForm');
            this.searchProcedureCode()
          }
        } else if (data.code == 400 && data.hmsMessage.messageShort == "HSA_SERVICE_ID_ALREADY_EXIST") {
          this.toastrService.warning(this.translate.instant('HSA Service ID Already Exist!!'))
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "HSA_PARENT_SERVICE_ID_NOT_FOUND") {
          this.toastrService.warning(this.translate.instant('HSA Parent Service ID Not Found!!'))
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "HSA_COVERGAE_CATEGORY_NOT_FOUND") {
          this.toastrService.warning(this.translate.instant('HSA Coverage Category Not Found!!'))
        }
        else {
          if (this.addMode) {
            this.toastrService.error(this.translate.instant('HSA Service Not Added!!'))
          }
          if (this.editMode) {
            this.toastrService.error(this.translate.instant('HSA Service Not Updated!!'))
          }
        }
      })
    } else {
      this.validateAllFormFields(this.addHsaServiceForm)
    }
  }

  //For View the HSA Service on click of View Icon
  viewHsaServiceByKey(hsaServiceObject) {
    this.serviceId = hsaServiceObject.serviceKey
    let hsaServiceId = { "hsaServiceKey": hsaServiceObject.serviceKey, "hsaParentServiceId": hsaServiceObject.parentId };
    this.hmsDataService.postApi(FeeGuideApi.getHsaServiceUrl, hsaServiceId).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.covCatId = data.result.hsaCovCatKey
        this.hsaParentServiceId = data.result.hsaParentServiceId
        this.addHsaServiceForm.patchValue({
          'coverageCategory': data.result.hsaCovCatDescription,
          'parentServiceId': data.result.hsaParentServiceDesc,
          'serviceId': data.result.hsaServiceId,
          'descriptionLong': data.result.hsaServiceLongDesc,
          'descriptionShort': data.result.hsaServiceDesc,
          'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
        })
        this.procedureCodeList(hsaServiceObject.serviceKey);
        this.hsaProcList(hsaServiceObject.serviceKey)
      }
    });
    this.enableViewMode();
  }

  hsaProcList(key) {
    let reqParam = {
      "hsaServiceKey": key
    }
    this.hmsDataService.postApi(FeeGuideApi.getHsaAttachedProcedureCodeListUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.procList = data.result.data
      }
    })
  }

  procedureCodeList(id) {
    var reqParam = [
      { 'key': 'hsaServiceKey', 'value': id },
    ]
    var Url = FeeGuideApi.getHsaAttachedProcedureCodeListUrl
    var tableId = "hsaProcCodeList"
    if (!$.fn.dataTable.isDataTable('#hsaProcCodeList')) {
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.procedureCodeColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, null, null, null, [1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    return false;
  }

  searchProcedureCode() {
    this.page = 1;
    this.hsaServiceList = []
    this.showSearchTable = true
    this.showtableLoader = true
    let serviceData = {
      "serviceId": this.hsaServiceSearchForm.value.searchId,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.hsaServiceSearchForm.value.searchEffectiveOn),
      "disciplineKey": "5",
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalServiceSearch, serviceData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.hsaServiceList = data.result
        this.showtableLoader = false
      }
      else {
        this.hsaServiceList = []
        this.showtableLoader = false
      }
    })
  }

  getServiceChild(dentalService) {
    this.serviceKey = dentalService.serviceKey
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      if (formName == 'hsaServiceSearchForm') {
        this.hsaServiceSearchForm.patchValue(datePickerValue);
      }
      if (formName == 'addHsaServiceForm') {
        this.addHsaServiceForm.patchValue(datePickerValue);
      }
      this.hsaServiceSearchForm.patchValue(datePickerValue);
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
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      if (formName == 'hsaServiceSearchForm') {
        this.hsaServiceSearchForm.patchValue(datePickerValue);
      }
      if (formName == 'addHsaServiceForm') {
        this.addHsaServiceForm.patchValue(datePickerValue);
      }
    }
    if (this.addHsaServiceForm.value.effectiveOn && this.addHsaServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addHsaServiceForm.value.effectiveOn.date, this.addHsaServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addHsaServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
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
    this.hsaServiceSearchForm.reset();
    this.showSearchTable = false;
  }

  clearAddHsaServiceForm() {
    this.addHsaServiceForm.reset();
    var self = this;
    setTimeout(function () {
      self.renderer.selectRootElement('#fghsas_searchId').focus();
      self.enableAddMode();
    }, 1000);
    this.resetNewProcRow();
  }

  getAuthCheck(hsaServiceArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.hsaServiceCheck = [{
        "searchHsaService": 'T',
        "addHsaService": 'T',
        "viewHsaService": 'T',
      }]
    } else {
      for (var i = 0; i < hsaServiceArray.length; i++) {
        userAuthCheck[hsaServiceArray[i].actionObjectDataTag] = hsaServiceArray[i].actionAccess
      }

      this.hsaServiceCheck = [{
        "searchHsaService": userAuthCheck['HSS275'],
        "addHsaService": userAuthCheck['SHS276'],
        "viewHsaService": userAuthCheck['HSS277'],
      }]
    }
    return this.hsaServiceCheck
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

  addModalHsaService() {
    var self = this;
    this.addMode = true;
    this.editMode = false;
    this.viewMode = false;
    this.procList = []
    setTimeout(function () {
      self.renderer.selectRootElement('#hsaCoverageCategory').focus();
    }, 1000);
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  /* INLINE HSA PROC TABLE FUNCTIONALITY START HERE */
  enableAddProc() {
    this.addProcMode = true;
    this.selectedProc = {};
    this.editProcMode = false;
  }

  validateProcId(event) {
    if (this.newProcId.valid) {
      this.hmsDataService.getApi(FeeGuideApi.checkHsaProcCodeUrl + '/' + this.newProcId.value).subscribe(data => {
        if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
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
      hsaProcedureId: this.newProcId.value,
      hsaProcedureDesc: this.procShortDesc.value,
      hsaProcedureLongDesc: this.procLongDesc.value
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
    this.selectedProc['hsaProcedureId'] = rowData.hsaProcedureId;
    this.selectedProc['hsaProcedureDesc'] = rowData.hsaProcedureDesc;
    this.selectedProc['hsaProcedureLongDesc'] = rowData.hsaProcedureLongDesc;
  }

  /** Update Unit */
  updateProc(index) {
    if (this.newProcId.invalid) {
      return;
    }
    let procKey = this.procList[index].hsaProcedureKey
    var rowData = {
      hsaProcedureId: this.newProcId.value,
      hsaProcedureDesc: this.procShortDesc.value,
      hsaProcedureLongDesc: this.procLongDesc.value
    }
    let copy = Object.assign({}, rowData);

    if (this.addMode) {
      this.procList[index] = copy;
    } else if (this.editMode) {
      rowData["hsaProcedureKey"] = procKey
      rowData["hsaServiceKey"] = this.serviceId
      // API call
      this.hmsDataService.postApi(FeeGuideApi.updateHsaProcCode, rowData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.hsaProcList(data.result.hsaServiceKey)
          this.toastrService.success(this.translate.instant('feeGuide.toaster.hsaProcCodeUpdateSuccess'))
        } else if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
          this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'))
        } else if (data.code == 400 && data.status === "BAD_REQUEST") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'));
        } else {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.hsaProcCodeNotUpdated'))
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
  /* INLINE HSA PROC TABLE FUNCTIONALITY END HERE */
}