import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { FeeGuideApi } from '../fee-guide-api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ServiceProviderApi } from '../../service-provider-module/service-provider-api';
import { Alert } from 'selenium-webdriver';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
@Component({
  selector: 'app-procedure-code',
  templateUrl: './procedure-code.component.html',
  styleUrls: ['./procedure-code.component.css'],
  providers: [ChangeDateFormatService]
})

export class ProcedureCodeComponent implements OnInit {
  serviceIdL: string;
  shortDescL: string;
  surfaceID: any;
  searchMouthID: any;
  searchProcDesc: any;
  procId: any;
  unitCount: any;
  mouthSiteKeyvalue: any;
  mouMouthSiteKeyvalue: any;
  selectedServiceKey: any;
  selectedProcDesc: any;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  procDentalService: any[];
  arrayOfMouthID = []
  mouthID: any;
  mouthSiteId: any;
  selectedMouthID: any
  selectedMouMouthID: any
  ObservableClaimObj;
  addProcCodeDetails;
  dentalService1;
  procDesc;
  scheduleSelected;
  public filterProcedureCode: FormGroup;
  provinceSelected;
  isChecked;
  dentalServiceSelected;
  scheduleColumn;
  ProvinceColumn;
  getDetails;
  buttonText;
  dentalService;
  updateProcedureCodeData;
  arrPredictiveFeeGuideList: any;
  itemStart = 0;
  serviceStart = 0;
  columns = [];
  scheduleItems = [];
  provinceCodes = [];
  mouthDetails = [];
  columnScheduleItems = [];
  columnProvinceItems = [];
  dentalServiceArray = [];
  dentalServiceItems = [];
  dropdownSettings = {};
  dateNameArray = {}
  addDentalProcedureForm: FormGroup;
  viewMode: boolean = false;
  addMode: boolean = true;
  editMode: boolean = false;
  showSearchTable: boolean = false;
  checkBan: boolean = true;
  public predictiveFeeGuideData: CompleterData;
  public procedureCodeData: CompleterData;
  public MouthSiteData: CompleterData;
  public dentalProcDataRemote: RemoteData;
  public dentalProcDescRemote: RemoteData;
  selectedPredictiveValue: any;
  addDentalFormGroup: FormGroup;
  arrProcedureCodeList: any;
  columnService
  rowId
  dentalServiceKey
  currentUser
  cityHeaderTemplate = `
    <div class="form-row">
      <div class="row min-ht-sf mouthID">
        <div class="col-md-6 col-xs-20">Mouth ID</div>
        <div class="col-md-6 col-xs-20">Mouth Site ID</div>
       </div>
      </div>`;

  renderProcId(data: any): string {
    const html = `
        <div id="mouthId" class="mouthIDform-row">
          <div class="row min-ht-sf">
            <div class="col-md-6">${data.id}</div>
            <div class="col-md-6">${data.itemName}</div>
           </div>
          </div>`;

    return html;
  }
  procedureCodesChecks = [{
    "search": 'F',
    "addNewProcedureCode": 'F',
    "viewProcedureCode": 'F',
    "editProcedureCode": 'F',
  }]

  constructor(
    private fb: FormBuilder,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private completerService: CompleterService,
    private translate: TranslateService,
    private currentUserService: CurrentUserService,
    private renderer: Renderer2
  ) {
    this.dentalProcDataRemote = completerService.remote(
      null,
      "dentalServiceId",
      "dentalServiceId"
    );
    this.dentalProcDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dentalProcDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getPredectiveDentalProcCode + `/${term}`;
    });
    this.dentalProcDataRemote.dataField('result');

    this.dentalProcDescRemote = completerService.remote(
      null,
      "dentalProcedureLongDesc",
      "dentalProcedureLongDesc"
    );
    this.dentalProcDescRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dentalProcDescRemote.urlFormater((term: any) => {
      return FeeGuideApi.predictiveDentalProcedureDescSearch + `/${term}`;
    });
    this.dentalProcDescRemote.dataField('result');
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let UsclsFeeGuideArray = this.currentUserService.authChecks['PCL']
        this.getAuthCheck(UsclsFeeGuideArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let UsclsFeeGuideArray = this.currentUserService.authChecks['PCL']
        this.getAuthCheck(UsclsFeeGuideArray)
        this.dataTableInitialize();
      })
    }

    this.filterProcedureCode = this.fb.group({
      procDentalService: [''],
      procUnitCount: [''],
      procSurface: [''],
      prodSurfaceId: [''],
      procId: [''],
      mouthId: [''],
      procDesc: ['']
    })

    this.addDentalProcedureForm = this.fb.group({
      dentalService: ['', Validators.required],
      procId: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      descLong: ['', CustomValidators.notEmpty],
      unitCount: ['', [Validators.maxLength(2), CustomValidators.notEmpty]],
      userSurface: [''],
      DescShort: ['', [Validators.maxLength(70), CustomValidators.notEmpty]],
      mouthId: [''],
      QCMouthId: [''],
      dentalProcedureKey: ['']
    })

    this.getMouthSiteList();
    this.updateSchedule();
    this.getProvince();
    this.getDentalServiceList();

    this.renderer.selectRootElement('#fgpc_procId').focus();
    this.dropdownSettings = Constants.angular2Multiselect;
    var self = this

    $(document).on("click", "table#fgpc_search_ProcedureCode .view-ico", function () {
      self.rowId = $(this).data('id')
      self.enableProcedureViewMode(self.rowId);
    })

    $(document).on("click", "table#fgpc_search_ProcedureCode .edit-ico", function () {
      self.rowId = $(this).data('id')
      self.enableEditView(self.rowId);
    })

    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', self.translate.instant('common.edit'));
    })

    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', self.translate.instant('common.view'));
    })

    $(document).on('keydown', '#fgpc_search_ProcedureCode .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
  }

  dataTableInitialize() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.serviceId'), data: 'dentalServiceId' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.proc-id'), data: 'dentalProcedureId' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.mouth-id'), data: 'mouthSiteDesc' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.mouth-side-id'), data: 'mouthSiteIdd' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-short'), data: 'dentalProcedureDesc' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-long'), data: 'dentalProcedureLongDesc' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.unit-count'), data: 'dentalProcedureUnitCount' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.userSurface'), data: 'dentalProcedureUseSurfaceI' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.qc-mouth-id'), data: 'mouMouthSiteDesc' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.qc-mouth-site-id'), data: 'qcMouthSiteIdd' },
          { title: this.translate.instant('common.action'), data: 'dentalProcedureKey' }]
        this.checkBan = false;
        this.ObservableClaimObj.unsubscribe();
        this.getFeeGuideList()
        this.getProvince()
      }
    });
  }

  ngAfterViewInit() {
    var self = this
    $(document).find("#loadOnScroll ul").on('scroll', function () {
      self.updateSchedule()
    })

    $(document).find("#serviceLoadOnScroll ul").on('scroll', function () {
      self.getDentalServiceList()
    })
  }

  getAuthCheck(procCodesArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.procedureCodesChecks = [{
        "search": 'T',
        "addNewProcedureCode": 'T',
        "viewProcedureCode": 'T',
        "editProcedureCode": 'T'
      }]
    } else {
      for (var i = 0; i < procCodesArray.length; i++) {
        userAuthCheck[procCodesArray[i].actionObjectDataTag] = procCodesArray[i].actionAccess
      }
      this.procedureCodesChecks = [{
        "search": userAuthCheck['PCL198'],
        "addNewProcedureCode": userAuthCheck['SFG201'],
        "viewProcedureCode": userAuthCheck['SFG199'],
        "editProcedureCode": userAuthCheck['SFG200'],
      }]
    }
    return this.procedureCodesChecks
  }

  onDentalServiceSelect(selected: CompleterItem) {
    if (selected) {
      this.selectedServiceKey = selected.originalObject.dentalServiceKey
    } else {

    }
  }

  onProcDescSelect(selected: CompleterItem) {
    if (selected) {
      this.selectedProcDesc = selected.originalObject.dentalProcedureDesc;
    } else {

    }
  }

  saveAddDentalProcedureDetails() {
    let RequestedData = {
      "dentalServiceKey": this.selectedServiceKey,
      "mouMouthSiteKey": this.mouMouthSiteKeyvalue,
      "mouthSiteKey": this.mouthSiteKeyvalue,
      "dentalProcedureUnitCount": this.addDentalProcedureForm.value.unitCount,
      "dentalProcedureLongDesc": this.addDentalProcedureForm.value.descLong,
      "dentalProcedureId": this.addDentalProcedureForm.value.procId,
      "dentalProcedureDesc": this.addDentalProcedureForm.value.DescShort,
      "dentalProcedureUseSurfaceI": this.addDentalProcedureForm.value.userSurface ? 'T' : 'F'
    }
    if (this.addMode) {
      if (this.addDentalProcedureForm.valid) {
        this.hmsDataService.postApi(FeeGuideApi.saveDentalProcedureCodeUrl, RequestedData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.addProcCodeDetails = data.result;
            this.toastrService.success(this.translate.instant('feeGuide.toaster.dentalprocCodeAddSuccess'));
            this.hmsDataService.OpenCloseModal('fgpc_addDentalProcedure_close');
            if (this.showSearchTable) {
              this.getProcCodeListByGridFilteration("fgpc_search_ProcedureCode")
            }

          } if (data.code == 400 && data.status === "BAD_REQ") {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.dentalProcCodeNotAdded'));
          }
          if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.dentalProcCodeAlreadyExist'))
          }
        });
      } else {
        this.validateAllFormFields(this.addDentalProcedureForm);
      }
    }

    if (this.editMode) {
      if (this.addDentalProcedureForm.valid) {
        RequestedData['dentalProcedureKey'] = this.rowId;
        this.hmsDataService.postApi(FeeGuideApi.updateDentalProcedureCodeUrl, RequestedData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.updateProcedureCodeData = data.result;
            this.getProcCodeListByGridFilteration("fgpc_search_ProcedureCode")
            this.toastrService.success(this.translate.instant('feeGuide.toaster.dentalProcCodeUpdateSuccess'));
            this.hmsDataService.OpenCloseModal('fgpc_addDentalProcedure_close');
          }
          else if (data.code == 400 && data.status === "BAD_REQ") {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.dentalProcCodeNotUpdated'));
          }
          else if (data.code == 400 && data.status === "BAD_REQUEST") {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'));
          }
        });
      }
      else {
        this.validateAllFormFields(this.addDentalProcedureForm);
      }
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

  getProcCodeListByGridFilteration(tableId: string) {
    this.showSearchTable = true
    var appendExtraParam = { 'key': 'dentalServiceKey', 'value': this.columnService }
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var url = FeeGuideApi.searchDentalProcedureByFilterUrl;
    params[6] = { key: 'dentalMouthId', value: this.searchMouthID };
    this.dataTableService.jqueryDataTableReload(tableId, url, params)
  }

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
    }
  }

  updateSchedule() {
    var RequestedData = {
      "start": this.itemStart,
      "length": 13
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalFeeGuideScheduleListUrl, RequestedData).subscribe(data => {
      for (var i = 0; i < data.result.length; i++) {
        this.scheduleItems.push({ 'id': data.result[i].dentFeeGuideSchedCd, 'itemName': data.result[i].dentFeeGuideSchedDesc })
        this.columnScheduleItems.push({ 'id': data.result[i].dentFeeGuideSchedCd, 'itemName': data.result[i].dentFeeGuideSchedDesc })
      }
    })
    this.itemStart = this.itemStart + 1
  }

  getProvince() {
    this.hmsDataService.getApi(FeeGuideApi.getProvinceListUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.provinceCodes.push({ 'id': data.result[i].provinceCd, 'itemName': data.result[i].provinceName })
          this.columnProvinceItems.push({ 'id': data.result[i].provinceCd, 'itemName': data.result[i].provinceName })
        }
      }
    })
  }

  onMouthIDSelected(selected: CompleterItem) {
    if (selected) {
      this.mouthSiteKeyvalue = (selected.originalObject.mouthSiteKey).toString();
    }
    else {
      this.mouthSiteKeyvalue = '';
    }
  }

  onQCMouthIDSelected(selected: CompleterItem) {
    if (selected) {
      this.mouMouthSiteKeyvalue = (selected.originalObject.mouthSiteKey).toString();
    }
    else {
      this.mouMouthSiteKeyvalue = '';
    }
  }

  onSelect(item: any, type) {
    if (type == 'schedule') {
      this.scheduleSelected = item.id
    }
    if (type == 'province') {
      this.provinceSelected = item.value
    }
    if (type == 'columnSchedule') {
      this.scheduleColumn = item.id
    }
    if (type == 'columnProvince') {
      this.ProvinceColumn = item.value
    }
    if (type == 'dentalService') {
      this.addDentalProcedureForm.controls[type].setValue(item.id);
    }
    if (type == 'dentalServiceKey') {
      this.columnService = item.id
    }
    if (type == 'procDentalService') {
      this.dentalServiceSelected = item.id
    }
  }

  onDeSelect(item: any, type) {
    if (type == 'schedule') {
      this.scheduleSelected = ''
    }
    if (type == 'province') {
      this.provinceSelected = ''
    }
    if (type == 'columnSchedule') {
      this.scheduleColumn = ''
    }
    if (type == 'columnProvince') {
      this.ProvinceColumn = ''
    }
    if (type == 'dentalService') {
      this.addDentalProcedureForm.controls[type].setValue('');
    }
    if (type == 'dentalServiceKey') {
      this.columnService = ''
    }
    if (type == 'procDentalService') {
      this.dentalServiceSelected = ''
    }
  }

  getDentalServiceList() {
    var RequestedData = {
      "start": this.serviceStart,
      "length": 13
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalServiceListUrl, RequestedData).subscribe(data => {
      {
        if (data.code == 200 && data.status === "OK") {
          this.dentalServiceArray = data.result.data;
          for (var i = 0; i < data.result.data.length; i++) {
            this.dentalServiceItems.push({ 'id': data.result.data[i].dentalServiceKey, 'itemName': data.result.data[i].dentalServiceDesc })
          }
        }
      }
    })
    this.serviceStart = this.serviceStart + 1
  }

  getFeeGuideList() {
    var hasSurfaceId;
    if (this.filterProcedureCode.value.prodSurfaceId == true) {
      hasSurfaceId = 'T'
    } else {
      hasSurfaceId = ''
    }
    var reqParam = [
      { 'key': 'dentalProcedureUnitCount', 'value': this.filterProcedureCode.value.procUnitCount },
      { 'key': 'dentalProcedureUseSurfaceI', 'value': hasSurfaceId },
      { 'key': 'dentalProcedureId', 'value': this.filterProcedureCode.value.procId },
      { 'key': 'dentalMouthId', 'value': this.filterProcedureCode.value.mouthId },
      { 'key': 'dentalProcedureLongDesc', 'value': this.filterProcedureCode.value.procDesc }
    ]
    this.unitCount = this.filterProcedureCode.value.procUnitCount
    this.procId = this.filterProcedureCode.value.procId
    this.searchProcDesc = this.filterProcedureCode.value.procDesc
    this.searchMouthID = this.filterProcedureCode.value.mouthId
    this.surfaceID = (hasSurfaceId) ? 'T' : 'F'
    var tableActions =
      [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.procedureCodesChecks[0].viewProcedureCode },
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': this.procedureCodesChecks[0].editProcedureCode }
      ];
    var url = FeeGuideApi.searchDentalProcedureByFilterUrl;
    var tableId = "fgpc_search_ProcedureCode"
    if (!$.fn.dataTable.isDataTable('#fgpc_search_ProcedureCode')) {
      this.dataTableService.jqueryDataTableForModal1(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 10, '', "AddNewFee", 6, 7, '', [2, 3, 4, 5, 6, 7, 8, 9, 10], 0, 1)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  editProcedure(rowId) {
    let submitData = {
      "dentalProcedureKey": rowId
    }
    let promise = new Promise((resolve, reject) => {
      this.hmsDataService.postApi(FeeGuideApi.getDentalProcedureCodeUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.getDetails = data.result;
          resolve()
        } else {
          resolve()
          return false;
        }
      });
    })
    return promise
  }

  fillProcedureCodeDetails(getDetails) {
    this.dentalService = [{ 'id': getDetails.dentalServiceKey, 'itemName': getDetails.dentalServiceDesc }]
    this.selectedServiceKey = getDetails.dentalServiceKey
    this.mouMouthSiteKeyvalue = getDetails.mouMouthSiteKey
    this.mouthSiteKeyvalue = getDetails.mouthSiteKey
    this.addDentalProcedureForm.patchValue({
      procId: getDetails.dentalProcedureId,
      descLong: getDetails.dentalProcedureLongDesc,
      unitCount: getDetails.dentalProcedureUnitCount,
      userSurface: (getDetails.dentalProcedureUseSurfaceI == 'T') ? true : false,
      DescShort: getDetails.dentalProcedureDesc,
      mouthId: getDetails.mouthSiteDesc,
      QCMouthId: getDetails.mouMouthSiteDesc,
      dentalService: getDetails.dentalServiceId
    });
  }

  enableProcedureViewMode(rowId) {
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
    this.editProcedure(rowId).then(res => {
      this.addDentalProcedureForm.disable();
      this.fillProcedureCodeDetails(this.getDetails);
    })
  }

  enableEditView(rowId) {
    setTimeout(() => {
      this.renderer.selectRootElement('#fgpc_add_dentalService').focus();
    }, 1000);
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.buttonText = "Update";
    this.itemStart = 0;
    this.columnScheduleItems = [];
    this.scheduleItems = [];
    this.editProcedure(rowId).then(res => {
      this.addDentalProcedureForm.enable();
      this.fillProcedureCodeDetails(this.getDetails);
    })
  }

  resetAddDentalProcedureForm() {
    this.addMode = true;
    this.editMode = false;
    this.viewMode = false;
    this.addDentalProcedureForm.reset();
    this.addDentalProcedureForm.enable();
    setTimeout(() => {
      this.renderer.selectRootElement('#fgpc_add_dentalService').focus();
    }, 1000);
    this.dentalService = [];
    this.addDentalProcedureForm.patchValue({ 'QCMouthId': '' })
    this.addDentalProcedureForm.patchValue({ 'mouthId': '' })
    this.serviceStart = 0;
    this.dentalServiceItems = [];
  }

  resetSearchForm() {
    this.dataTableService.resetTableSearch()
    this.showSearchTable = false;
    this.filterProcedureCode.reset();
    this.procDentalService = []
    this.dentalServiceSelected = ''
  }

  resetProcListingFilter() {
    this.dataTableService.resetTableSearch();
    this.dentalServiceKey = []
    this.columnService = ''
    this.searchProcedureCode();
  }

  searchProcedureCode() {
    this.serviceIdL = ''
    this.shortDescL = ''
    this.getFeeGuideList();
    this.showSearchTable = true
  }

  resetDentalProcedureOnClose() {
    this.addDentalProcedureForm.reset();
    this.dentalService = [];
    this.serviceStart = 0;
    this.dentalServiceItems = [];
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getProcCodeListByGridFilteration(tableId);
    }
  }

  getMouthIDValue(value) {
    if (value) {
      if (!value.key) {
        this.selectedMouthID = [{ 'id': value.id, 'itemName': value.itemName, 'key': this.mouthSiteKeyvalue }]
      }
      else {
        this.selectedMouthID = [{ 'id': value.id, 'itemName': value.itemName, 'key': value.key }]
        this.mouthSiteKeyvalue = (value.key)
      }
    } else {
      this.mouthSiteKeyvalue = ''
    }
  }

  getMouthSiteList() {
    this.hmsDataService.getApi(FeeGuideApi.getMouthSiteListUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.mouthDetails = data.result;
        this.MouthSiteData = this.completerService.local(
          this.mouthDetails,
          "mouthId",
          "mouthId"
        );
        this.arrayOfMouthID = []
        for (var i = 0; i < data.result.length; i++) {
          if (data.result[i].mouthSiteId == null) {
            this.mouthSiteId = ''
          }
          else {
            this.mouthSiteId = data.result[i].mouthSiteId
          }
          this.arrayOfMouthID.push({ 'id': data.result[i].mouthId, 'itemName': this.mouthSiteId, 'key': data.result[i].mouthSiteKey })
        }
        this.arrayOfMouthID = this.hmsDataService.removeDuplicates(this.arrayOfMouthID, 'id')
      }
      else {
      }
      error => {
      }
    })
  }

  getQCMouthIDSelected(value) {
    if (value) {
      if (!value.key) {
        this.selectedMouMouthID = [{ 'id': value.id, 'itemName': value.itemName, 'key': this.mouMouthSiteKeyvalue }]
      }
      else {
        this.selectedMouMouthID = [{ 'id': value.id, 'itemName': value.itemName, 'key': value.key }]
        this.mouMouthSiteKeyvalue = (value.key)
      }
    } else {
      this.mouMouthSiteKeyvalue = ''
    }
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  isNumberKey(event) {
    return (event.ctrlKey || event.altKey
      || (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false)
      || (95 < event.keyCode && event.keyCode < 106)
      || (event.keyCode == 8) || (event.keyCode == 9)
      || (event.keyCode > 34 && event.keyCode < 40)
      || (event.keyCode == 46))
  }

  isEnterKey(event) {
    this.searchProcedureCode();
  }

}