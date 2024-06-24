import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { FeeGuideApi } from '../fee-guide-api';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { setTimeout } from 'timers';
@Component({
  selector: 'app-add-dental-service',
  templateUrl: './add-dental-service.component.html',
  styleUrls: ['./add-dental-service.component.css']
})

export class AddDentalServiceComponent implements OnInit {
  dentalServiceList = [];
  showtableLoader: boolean;
  dentalParentServiceKey: any;
  dentalParentServiceId: any;
  covCatId: any;
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
  expired: boolean;
  procLongDesc: FormControl;
  procShortDesc: FormControl;
  newProcId: FormControl;
  addProcMode: boolean = false;
  selectedProc = {};
  editProcMode;
  procList = [];
  ruleSearchBtn: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  selectedParentId: any;
  parentServiceIdList: any;
  feeGuideServiceKey: string;
  currentUser: any;
  error: any;
  covCategoryList = [];
  coverageCategory: any
  tableActions: { 'name': string; 'class': string; 'icon_class': string; 'title': string; }[];
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  dentalServiceId: any;
  serviceId;
  parentServiceId: any;
  dentalData: any;
  addDentalServiceForm: FormGroup;
  dentalServiceSearchForm: FormGroup;
  columns;
  ObservableObj;
  procObservableObj;
  check = true;
  procCheck = true;
  addMode: boolean = true;
  reloadTable = false
  viewMode: boolean = false
  editMode: boolean = false
  parentServiceIdStart = 0;
  RequestedData = {};
  parentServiceIdArray = [];
  parentServiceIdItems = [];
  covCategoryArray = [];
  covCategoryItems = [];
  dropdownSettings = {};
  dateNameArray = [];
  procedureCodeColumns;
  dentalServiceKey: number;
  serviceKey
  dentalServiceCheck = [{
    "addNewDentalService": 'F',
    "viewNewDentalService": 'F',
    "editNewDentalService": 'F',
  }]
  showSearchTable: boolean = false
  public dentalParentServiceDataRemote: RemoteData;
  public coverageCategoryDataRemote: RemoteData;

  constructor(private dataTableService: DatatableService,
    private translate: TranslateService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastrService: ToastrService,
    private changeDateFormatService: ChangeDateFormatService,
    private exDialog: ExDialog,
    private _router: Router,
    private router: Router,
    private routerAct: ActivatedRoute,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService,
    private renderer: Renderer2
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.dentalParentServiceDataRemote = completerService.remote(
      null,
      "dentalServiceDesc,dentalServiceId",
      "mergedDescription"
    );
    this.dentalParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dentalParentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getDentalPredectiveParentService + `/${term}`;
    });
    this.dentalParentServiceDataRemote.dataField('result');

    this.coverageCategoryDataRemote = completerService.remote(
      null,
      "dentCovCatDescription",
      "dentCovCatDescription"
    );
    this.coverageCategoryDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.coverageCategoryDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getDentalPredectiveCovCat + `/${term}`;
    });
    this.coverageCategoryDataRemote.dataField('result');
    /** Proc ID Inline Data table new row for Dental  */
    this.newProcId = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(5)]);
    this.procShortDesc = new FormControl('', [Validators.maxLength(70), CustomValidators.notEmpty]);
    this.procLongDesc = new FormControl('', CustomValidators.notEmpty)
  }

  ngOnInit() {
    this.renderer.selectRootElement('#dss_searchId').focus();
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let DentalServiceArray = this.currentUserService.authChecks['SRV']
        this.getAuthCheck(DentalServiceArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let DentalServiceArray = this.currentUserService.authChecks['SRV']
        this.getAuthCheck(DentalServiceArray)
        this.dataTableInitialize();
      })
    }

    this.addDentalServiceForm = new FormGroup({
      'coverageCategory': new FormControl('', Validators.required),
      'parentServiceId': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'serviceId': new FormControl('', [Validators.required, CustomValidators.onlyNumbers]),
      'descriptionLong': new FormControl('', [Validators.maxLength(1800), CustomValidators.notEmpty]),
      'descriptionShort': new FormControl('', [Validators.required, Validators.maxLength(70), CustomValidators.notEmpty]),
      'effectiveOn': new FormControl('', Validators.required),
      'expiredOn': new FormControl('')
    })
    this.dentalServiceSearchForm = new FormGroup({
      'searchId': new FormControl(),
      'searchEffectiveOn': new FormControl()
    });
    this.dropdownSettings = Constants.angular2Multiselect;
  }

  getAuthCheck(DentalServiceArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.dentalServiceCheck = [{
        "addNewDentalService": 'T',
        "viewNewDentalService": 'T',
        "editNewDentalService": 'T',
      }]
    } else {
      for (var i = 0; i < DentalServiceArray.length; i++) {
        userAuthCheck[DentalServiceArray[i].actionObjectDataTag] = DentalServiceArray[i].actionAccess
      }

      this.dentalServiceCheck = [{
        "addNewDentalService": userAuthCheck['SRV210'],
        "viewNewDentalService": userAuthCheck['SRV211'],
        "editNewDentalService": userAuthCheck['VDT212'],
      }]
    }
    return this.dentalServiceCheck
  }

  dataTableInitialize() { //Procedure Code List
    this.procObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.procCheck) {
        if ('feeGuide.dentalService.procId' == this.translate.instant('feeGuide.dentalService.procId')) {
        } else {
          this.procedureCodeColumns = [
            { title: this.translate.instant('feeGuide.dentalService.procId'), data: 'dentalProcedureId' },
            { title: this.translate.instant('feeGuide.dentalService.shortDescription'), data: 'dentalProcedureDesc' },
          ]

          this.procCheck = false;
          this.procObservableObj.unsubscribe();
        }
      }
    })
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#dentalFeeGuideList .view-ico', function () {
      var id = $(this).data('id');
      var parentService = $(this).data('parentService')
      self.serviceId = id
    })
    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', 'View');
    })
  }

  enableAddMode() {
    var self = this;
    setTimeout(() => {
      self.renderer.selectRootElement('#dentalCoverageCategory').focus();
    }, 1000)
    this.addDentalServiceForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    this.procList = [];
  }

  enableViewMode() {
    this.addDentalServiceForm.disable();
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
  }

  enableEditMode() {
    this.addDentalServiceForm.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
  }

  // Method for Save & Update Dental Service
  submitDentalServiceForm(addDentalServiceForm) {
    let serviceData = {
      "dentCovCatKey": this.covCatId,
      "dentalParentServiceId": this.dentalParentServiceId,
      "dentalServiceId": this.addDentalServiceForm.value.serviceId,
      "dentalServiceLongDesc": this.addDentalServiceForm.value.descriptionLong,
      "dentalServiceDesc": this.addDentalServiceForm.value.descriptionShort,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalServiceForm.value.effectiveOn),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalServiceForm.value.expiredOn),
    }

    if (this.addMode) {
      serviceData["procedureDto"] = this.procList
      if (this.addDentalServiceForm.valid) {
        var url = FeeGuideApi.saveDentalServiceUrl;
        this.hmsDataServiceService.postApi(url, serviceData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.saveDentalServiceSuccess'));
            this.getDentalServiceSearch()
            this.enableViewMode();
            $("#closeDentalServiceForm").trigger('click');
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == "DENTAL_SERVICE_ID_ALREADY_EXIST") {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.serviceIdExist'));
          }
          else {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.failDentalService'));
          }
        });
      }
      else {
        this.validateAllFormFields(this.addDentalServiceForm)
      }
    }
    if (this.editMode) {
      if (this.addDentalServiceForm.valid) {
        serviceData["dentalServiceKey"] = this.serviceId
        var url = FeeGuideApi.updateDentalServiceUrl;
        this.hmsDataServiceService.postApi(url, serviceData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.updateDentalServiceSuccess'));
            this.enableViewMode();
            $("#closeDentalServiceForm").trigger('click');
            window.location.reload();
          }
          else {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.failUpdateDentalService'));
          }
        });
      }
      else {
        this.validateAllFormFields(this.addDentalServiceForm)
      }
    }
  }

  // Method for View the Dental Service on click of View Icon
  viewDentalServiceByKey(dentalServiceObject) {
    this.serviceId = dentalServiceObject.serviceKey
    this.dentalData = this.routerAct.params.subscribe(params => {
      let dentalServiceId = { "dentalServiceKey": dentalServiceObject.serviceKey, "dentalParentServiceId": dentalServiceObject.parentId };
      this.hmsDataServiceService.post(FeeGuideApi.getDentalServiceUrl, dentalServiceId).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.covCatId = data.result.dentCovCatKey
          this.dentalParentServiceId = data.result.dentalServiceId
          this.addDentalServiceForm.patchValue({
            'coverageCategory': data.result.dentCovCatDescription,
            'parentServiceId': data.result.dentalParentServiceDesc,
            'serviceId': data.result.dentalServiceId,
            'descriptionLong': data.result.dentalServiceLongDesc,
            'descriptionShort': data.result.dentalServiceDesc,
            'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
            'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
          })
          this.procedureCodeList(dentalServiceObject.serviceKey);
          this.dentalProcList(dentalServiceObject.serviceKey)
        }
      });
    });
    this.enableViewMode();
  }

  // Method for Get Attached Procedure Code List
  procedureCodeList(id) {
    var reqParam = [
      { 'key': 'dentalServiceKey', 'value': id },
    ]
    var Url = FeeGuideApi.getAttachedProcedureCodeListUrl
    var tableId = "procedureCodeList";
    if (!$.fn.dataTable.isDataTable('#procedureCodeList')) {
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.procedureCodeColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, null, null, null, [1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam);
    }
    return false;
  }

  dentalProcList(key) {
    let reqParam = {
      "dentalServiceKey": key
    }
    this.hmsDataServiceService.postApi(FeeGuideApi.getAttachedProcedureCodeListUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.procList = data.result.data
      }
    })
  }

  // Methos for Upper Form Datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      if (formName == 'dentalServiceSearchForm') {
        this.dentalServiceSearchForm.patchValue(datePickerValue);
      }
      if (formName == 'addDentalServiceForm') {
        this.addDentalServiceForm.patchValue(datePickerValue);
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
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      if (formName == 'dentalServiceSearchForm') {
        this.dentalServiceSearchForm.patchValue(datePickerValue);
      }
      if (formName == 'addDentalServiceForm') {
        this.addDentalServiceForm.patchValue(datePickerValue);
      }
    }
    if (this.addDentalServiceForm.value.effectiveOn && this.addDentalServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addDentalServiceForm.value.effectiveOn.date, this.addDentalServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addDentalServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  // Method for Reset the Dental Service Form
  resetDentalServiceForm() {
    this.addDentalServiceForm.reset();
    this.resetNewProcRow()
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

  // Method of angular2-multiselect Dropdown for Select the values  
  onSelect(selected: CompleterItem, type) {
    if (selected && type == 'parentServiceId') {
      this.dentalParentServiceId = selected.originalObject.dentalServiceId
    }
    if (selected && type == 'coverageCategory') {
      this.covCatId = selected.originalObject.dentCovCatKey
    }
  }

  getDentalServiceSearch() {
    this.dentalServiceList = []
    this.showSearchTable = true
    this.showtableLoader = true
    let serviceData = {
      "serviceId": this.dentalServiceSearchForm.value.searchId,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.dentalServiceSearchForm.value.searchEffectiveOn),
      "disciplineKey": "1",
    }
    this.hmsDataServiceService.postApi(FeeGuideApi.getDentalServiceSearch, serviceData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.dentalServiceList = data.result
        this.showtableLoader = false
      }
      else {
        this.dentalServiceList = []
        this.showtableLoader = false
      }
    })
  }

  resetdentalServiceSearch() {
    this.dentalServiceSearchForm.reset()
    this.showSearchTable = false
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
  focusNextEle(event, id) {
    $('#' + id).focus();
  }


  /* INLINE DENTAL PROC TABLE FUNCTIONALITY START HERE */
  enableAddProc() {
    this.addProcMode = true;
    this.selectedProc = {};
    this.editProcMode = false;
  }

  validateProcId(event) {
    if (this.newProcId.valid) {
      this.hmsDataServiceService.getApi(FeeGuideApi.checkDentalProcCodeUrl + '/' + this.newProcId.value).subscribe(data => {
        if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
          this.newProcId.setErrors({
            "alreadyExist": true
          });
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

  //  /** Add new Mask from Mask list */
  addNewProc(newRecord) {
    this.newProcId.markAsTouched();
    if (this.newProcId.invalid) {
      return;
    }
    var newProcData = {
      dentalProcedureId: this.newProcId.value,
      dentalProcedureDesc: this.procShortDesc.value,
      dentalProcedureLongDesc: this.procLongDesc.value
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

  //Edit Unit 
  enableEditProc(rowData, rowIndex): void {
    this.resetNewProcRow();
    this.editProcMode = true;
    let copy = Object.assign({}, rowData);
    this.selectedProc = copy;
    this.selectedProc['rowIndex'] = rowIndex;
    this.selectedProc['dentalProcedureId'] = rowData.dentalProcedureId;
    this.selectedProc['dentalProcedureDesc'] = rowData.dentalProcedureDesc;
    this.selectedProc['dentalProcedureLongDesc'] = rowData.dentalProcedureLongDesc;
  }

  /* Update Unit */
  updateProc(index) {
    if (this.newProcId.invalid) {
      return;
    }
    let procKey = this.procList[index].dentalProcedureKey
    var rowData = {
      dentalProcedureId: this.newProcId.value,
      dentalProcedureDesc: this.procShortDesc.value,
      dentalProcedureLongDesc: this.procLongDesc.value
    }
    let copy = Object.assign({}, rowData);
    if (this.addMode) {
      this.procList[index] = copy;
    } else if (this.editMode) {
      rowData["dentalProcedureKey"] = procKey
      rowData["dentalServiceKey"] = this.serviceId

      this.hmsDataServiceService.postApi(FeeGuideApi.updateDentalProcedureCodeUrl, rowData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.dentalProcList(data.result.dentalServiceKey)
          this.toastrService.success(this.translate.instant('feeGuide.toaster.dentalProcCodeUpdateSuccess'));
        }
        else if (data.code == 400 && data.status === "BAD_REQ") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.dentalProcCodeNotUpdated'));
        }
        else if (data.code == 400 && data.status === "BAD_REQUEST") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'));
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
  /* INLINE DENTAL PROC TABLE FUNCTIONALITY END HERE */
}