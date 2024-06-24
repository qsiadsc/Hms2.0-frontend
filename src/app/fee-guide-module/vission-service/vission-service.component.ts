import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
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
import { CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';

@Component({
  selector: 'app-vission-service',
  templateUrl: './vission-service.component.html',
  styleUrls: ['./vission-service.component.css']
})

export class VissionServiceComponent implements OnInit {
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

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  visionServiceSearchForm: FormGroup;
  addVisionServiceForm: FormGroup;
  visionServiceKey;
  dropdownSettings = {};
  covCategoryItems = [];
  covCategoryList = [];
  parentServiceId = [];
  coverageCategory = [];
  parentServiceIdItems = [];
  parentServiceIdArray = [];
  parentServiceIdStart = 0;
  reloadTable = false;
  dentalData: any;
  error: any;
  addMode: boolean = true;
  viewMode: boolean
  editMode: boolean
  page;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  showSearchTable: boolean = false;
  showtableLoader: boolean = false;
  ServiceList = [];
  serviceKey: any;
  visionServiceId: { "dentalServiceKey": any; "dentalParentServiceId": any; };
  public covCategoryData: CompleterData
  visionCovCatId;
  parentServiceIdList = [];
  public parentServiceData: CompleterData
  visionParentServiceId;
  public visionParentServiceDataRemote: RemoteData
  public covCategoryDataRemote: RemoteData
  procObservableObj;
  procCheck: boolean = true
  procedureCodeColumns = [];
  currentUser
  visionServiceCheck = [{
    "searchVisionService": 'F',
    "viewVisionService": 'F',
    "addVisionService": 'F',
  }]
  /* New Proc Id */
  newProcId: FormControl;
  procShortDesc: FormControl;
  procLongDesc: FormControl;

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
    private exDialog: ExDialog,
  ) {
    this.error = { isError: false, errorMessage: '' };

    /* Get the detail for Vision Covearge Category*/
    this.covCategoryDataRemote = completerService.remote(
      null,
      "visCovCatDescription",
      "visCovCatDescription"
    );
    this.covCategoryDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.covCategoryDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.searchVisionCovCategoryUrl + `/${term}`;
    });
    this.covCategoryDataRemote.dataField('result');


    /* Get the detail for Vision Parent Service Id */
    this.visionParentServiceDataRemote = completerService.remote(
      null,
      "visionServiceDesc,visionServiceId",
      "mergedDescription"
    );
    this.visionParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.visionParentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getVisionParentServiceUrl + `/${term}`;
    });
    this.visionParentServiceDataRemote.dataField('result');

    /** Proc ID Inline Data table new row  */
    this.newProcId = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(5)]);
    this.procShortDesc = new FormControl('', [Validators.maxLength(70), CustomValidators.notEmpty]);
    this.procLongDesc = new FormControl('', CustomValidators.notEmpty)
  }

  /* Dental Proc Code */
  addProcMode: boolean = false;
  selectedProc = {};
  editProcMode;
  procList = [];

  ngOnInit() {
    this.renderer.selectRootElement('#fgvs_searchId').focus();
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let VisionServiceArray = this.currentUserService.authChecks['VSR']
        this.getAuthCheck(VisionServiceArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let VisionServiceArray = this.currentUserService.authChecks['VSR']
        this.getAuthCheck(VisionServiceArray)
        this.dataTableInitialize();
      })
    }
    this.visionServiceSearchForm = new FormGroup({
      'searchId': new FormControl(),
      'searchEffectiveOn': new FormControl()
    });

    this.addVisionServiceForm = new FormGroup({
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

  dataTableInitialize() {
    this.procObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.procCheck) {
        if ('feeGuide.dentalService.procId' == this.translate.instant('feeGuide.dentalService.procId')) {
        } else {
          this.procedureCodeColumns = [
            { title: this.translate.instant('feeGuide.dentalService.procId'), data: 'visionProcedureId' },
            { title: this.translate.instant('feeGuide.dentalService.shortDescription'), data: 'visionProcedureDesc' },
          ]

          this.procCheck = false;
          this.procObservableObj.unsubscribe();
        }
      }
    })
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#visionServiceList .view-ico', function () {
      var id = $(this).data('id');
      self.serviceKey = id
    })
    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', 'View');
    })
  }

  // Method for Save & Update Vision Service
  submitVisionServiceForm(addVisionServiceForm) {
    let serviceData = {
      "visionServiceDesc": this.addVisionServiceForm.value.descriptionShort,
      "visionServiceId": this.addVisionServiceForm.value.serviceId,
      "visionParentServiceId": this.visionParentServiceId,
      "visionServiceLongDesc": this.addVisionServiceForm.value.descriptionLong,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addVisionServiceForm.value.effectiveOn),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addVisionServiceForm.value.expiredOn),
      "visCovCatKey": this.visionCovCatId,
    }

    if (this.addMode) {
      serviceData["procedureDto"] = this.procList
      if (this.addVisionServiceForm.valid) {
        var url = FeeGuideApi.saveVisionServiceUrl;
        this.hmsDataService.postApi(url, serviceData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('Vision Service Saved Successfully!!'));
            this.searchProcedureCode()
            this.hmsDataService.OpenCloseModal('closeVisionServiceForm');
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == "VISION_SERVICE_ID_ALREADY_EXIST") {
            this.toastrService.error(this.translate.instant('Vision Service ID Already Exist!!'));
          }
          else {
            this.toastrService.error(this.translate.instant('Vision Service Failed!!'));
          }
        });
      }
      else {
        this.validateAllFormFields(this.addVisionServiceForm)
      }
    }
    if (this.editMode) {
      if (this.addVisionServiceForm.valid) {
        serviceData["visionServiceKey"] = this.serviceKey
        this.hmsDataService.postApi(FeeGuideApi.updateVisionServiceUrl, serviceData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastrService.success(this.translate.instant('Vision Service Updated Successfully!!'));
            this.reloadTable = true;
            $("#closeDentalServiceForm").trigger('click');
          }
          else {
            this.toastrService.error(this.translate.instant('Vision Service Not Updated!!'));
          }
        });
      }
      else {
        this.validateAllFormFields(this.addVisionServiceForm)
      }
    }
  }

  // Method for View the Vision Service on click of View Icon
  viewVisionServiceByKey(visionServiceObject) {
    this.serviceKey = visionServiceObject.serviceKey;
    let requestedData = {
      "visionServiceKey": visionServiceObject.serviceKey
    }
    this.hmsDataService.post(FeeGuideApi.getVisionServiceUrl, requestedData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.coverageCategory = [{ 'id': data.result.visCovCatKey, 'itemName': data.result.visCovCatDescription }]
        this.parentServiceId = [{ 'id': data.result.visionParentServiceId, 'itemName': data.result.visionParentServiceDesc }]
        this.visionCovCatId = data.result.visCovCatKey
        this.visionParentServiceId = data.result.visionParentServiceId
        this.addVisionServiceForm.patchValue({
          'coverageCategory': data.result.visCovCatDescription,
          'parentServiceId': data.result.visionParentServiceDesc,
          'serviceId': data.result.visionServiceId,
          'descriptionLong': data.result.visionServiceLongDesc,
          'descriptionShort': data.result.visionServiceDesc,
          'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
        })
        this.procedureCodeList(visionServiceObject.serviceKey);
        this.visionProcList(visionServiceObject.serviceKey)
      }
    });
    this.enableViewMode();
  }

  visionProcList(key) {
    let reqParam = {
      "visionServiceKey": key
    }
    this.hmsDataService.postApi(FeeGuideApi.getAttachedVisionProcedureCodeListUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.procList = data.result.data
      }
    })
  }

  procedureCodeList(id) {
    var reqParam = [
      { 'key': 'visionServiceKey', 'value': id },
    ]
    var Url = FeeGuideApi.getAttachedVisionProcedureCodeListUrl
    var tableId = "visionProcCodeList"
    if (!$.fn.dataTable.isDataTable('#visionProcCodeList')) {
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.procedureCodeColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, null, null, null, [1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    return false;
  }

  enableAddMode() {
    this.addVisionServiceForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
  }

  // Method for enable View Mode
  enableViewMode() {
    this.addVisionServiceForm.disable();
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
  }

  enableEditMode() {
    this.addVisionServiceForm.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
  }

  /** Methos for Upper Form Datepicker */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.visionServiceSearchForm.patchValue(datePickerValue);
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
      this.visionServiceSearchForm.patchValue(datePickerValue);
    }
  }

  // Methos for Upper Form Datepicker
  changeDateFormatAddForm(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.addVisionServiceForm.patchValue(datePickerValue);
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
      this.addVisionServiceForm.patchValue(datePickerValue);
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    if (this.addVisionServiceForm.value.effectiveOn && this.addVisionServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addVisionServiceForm.value.effectiveOn.date, this.addVisionServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addVisionServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
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

  resetSearchForm() {
    this.visionServiceSearchForm.reset();
    this.showSearchTable = false;
  }

  clearAddVisionServiceForm() {

    this.addVisionServiceForm.reset();
    var self = this;
    setTimeout(function () {
      self.renderer.selectRootElement('#fgvs_searchId').focus();
    }, 1000);

    this.resetNewProcRow()
  }

  // Method of angular2-multiselect Dropdown for Select the values  
  onSelect(selected: CompleterItem, type) {
    if (selected && type == "parentServiceId") {
      this.visionParentServiceId = selected.originalObject.visionServiceId
    }
    if (selected && type == 'coverageCategory') {
      this.visionCovCatId = selected.originalObject.visCovCatKey
    }
  }

  // Method of angular2-multiselect Dropdown for DeSelect the values  
  onDeSelect(item: any, type) {
    if (type == 'parentServiceId') {
      this.addVisionServiceForm.controls[type].setValue('');
    }
    if (type == 'coverageCategory') {
      this.addVisionServiceForm.controls[type].setValue('');
    }
  }

  searchProcedureCode() {
    this.page = 1;
    this.ServiceList = []
    this.showSearchTable = true
    this.showtableLoader = true
    let serviceData = {
      "serviceId": this.visionServiceSearchForm.value.searchId,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.visionServiceSearchForm.value.searchEffectiveOn),
      "disciplineKey": "2",
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

  getAuthCheck(visionServiceArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.visionServiceCheck = [{
        "searchVisionService": 'T',
        "viewVisionService": 'T',
        "addVisionService": 'T'
      }]
    } else {
      for (var i = 0; i < visionServiceArray.length; i++) {
        userAuthCheck[visionServiceArray[i].actionObjectDataTag] = visionServiceArray[i].actionAccess
      }
      this.visionServiceCheck = [{
        "searchVisionService": userAuthCheck['VSR261'],
        "viewVisionService": userAuthCheck['VSR263'],
        "addVisionService": userAuthCheck['SVS262']
      }]
    }
    return this.visionServiceCheck
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

  addNewProcCodeClick(buttonName) {
    var self = this;
    setTimeout(function () {
      self.renderer.selectRootElement('#coverageCategoryID').focus();
    }, 1000);
    this.procList = [];
    this.viewMode = false
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  // INLINE VISION PROC TABLE FUNCTIONALITY START
  enableAddProc() {
    this.addProcMode = true;
    this.selectedProc = {};
    this.editProcMode = false;
  }

  validateProcId(event) {
    if (this.newProcId.valid) {
      this.hmsDataService.getApi(FeeGuideApi.checkVisionProcCodeUrl + '/' + this.newProcId.value).subscribe(data => {
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

  // /** Add new Mask from Mask list */
  addNewProc(newRecord) {
    this.newProcId.markAsTouched();
    if (this.newProcId.invalid) {
      return;
    }
    var newProcData = {
      visionProcedureId: this.newProcId.value,
      visionProcedureDesc: this.procShortDesc.value,
      visionProcedureLongDesc: this.procLongDesc.value
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

  // /** Edit Unit */
  enableEditProc(rowData, rowIndex): void {
    this.resetNewProcRow();
    this.editProcMode = true;
    let copy = Object.assign({}, rowData);
    this.selectedProc = copy;
    this.selectedProc['rowIndex'] = rowIndex;
    this.selectedProc['procId'] = rowData.procId;
    this.selectedProc['procShortDesc'] = rowData.procShortDesc;
    this.selectedProc['procLongDesc'] = rowData.procLongDesc;
  }

  // /** Update Unit */
  updateProc(index) {
    if (this.newProcId.invalid) {
      return;
    }
    let procKey = this.procList[index].visionProcedureKey
    var rowData = {
      visionProcedureId: this.newProcId.value,
      visionProcedureDesc: this.procShortDesc.value,
      visionProcedureLongDesc: this.procLongDesc.value
    }
    let copy = Object.assign({}, rowData);
    if (this.addMode) {
      this.procList[index] = copy;
    } else if (this.editMode) {
      rowData["visionProcedureKey"] = procKey
      rowData["visionServiceKey"] = this.serviceKey
      this.hmsDataService.postApi(FeeGuideApi.updateVisionProcCode, rowData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.visionProcList(data.result.visionServiceKey)
          this.toastrService.success(this.translate.instant('feeGuide.toaster.visionProcCodeUpdateSuccess'))
        } else if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
          this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'))
        } else if (data.code == 400 && data.status === "BAD_REQUEST") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'));
        } else if (data.code == 400 && data.status === "BAD_REQ") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.dentalProcCodeNotUpdated'));
        } else {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.visionProcCodeNotUpdated'))
        }
      });
    }
    this.resetProcInfo();
  }

  // /** reset Unit form */
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
  // INLINE VISION PROC TABLE FUNCTIONALITY END
}
