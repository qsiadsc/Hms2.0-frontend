import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild, Inject, ViewChildren, HostListener, QueryList } from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { ServiceProviderApi } from '../../../service-provider-module/service-provider-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { ServiceProviderService } from '../../../service-provider-module/serviceProvider.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { FeeGuideApi } from '../../fee-guide-api';
import { find } from 'rxjs/operators';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { Schedule } from 'primeng/primeng';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { id } from '@swimlane/ngx-datatable/release/utils';
import { ValueTransformer } from '@angular/compiler/src/util';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { RequestOptions, Http, Headers } from '@angular/http';
import { MyDatePicker, IMyDpOptions } from 'mydatepicker';
import { debug } from 'util';
import { EventManager } from '@angular/platform-browser';
@Component({
  selector: 'app-view-dental-fee-guide',
  templateUrl: './view-dental-fee-guide.component.html',
  styleUrls: ['./view-dental-fee-guide.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})

export class ViewDentalFeeGuideComponent implements OnInit {
  arrNewRow: { "procedureCode": string; "dentalProcedureFeeAmt": number; "dentalProcedureLabFeeAmt": number; "effectiveOn": string; "expiredOn": string; "idx": string; };
  dateEffective: any;
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  blobUrl;
  procID = "";
  unsubSaveOldRequest: any;
  unsubOldRequest: any;
  DateObjectToString: boolean = true;
  singleProc: boolean = true;
  groupProc: boolean = false;
  firstRow: JQuery<HTMLElement>;
  totalProcCodesLength: any;
  currentPage: number;
  dentalProcedureId: any;
  defaultPageSize: number;
  preventNextRowEditMode: boolean = false;
  @ViewChild('procIDFocus') procIDFocus: ElementRef;
  addTableMode: boolean = false;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  selectedRowId = '';
  procedureCode: { 'id': any; 'itemName': any; }[];
  editProcCode: any;
  procedureCodeItems = [];
  groupProcedureCodeItems = [];
  amountItems = [];
  labFeeAmt: any;
  feeAmt: any;
  procedureItemStart = 0;
  showtableLoader: boolean;
  selectedPredictiveValue: any;
  procedureCodeSelected: any;
  procedureID: { 'id': any; 'itemName': any; }[] = [];
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  pageMode;
  procCodeMode;
  selectedFileName;
  selectedFile: any = "";
  viewMode: boolean = true
  addMode: boolean = true;
  editMode: boolean = false;
  showLoader: boolean = false;
  procIds: FormControl;
  searchDentalProcedure: FormGroup;
  ProcIdGridFormGroup: FormGroup;
  public procIdsData: RemoteData;
  procIdsList = [];
  RequestedData
  @ViewChild('FormGroup')
  @ViewChild('mydp') mydp: MyDatePicker;
  @ViewChild('mydp1') mydp1: MyDatePicker;
  error1: any
  buttonText = "Save";
  Modetxt = "Add";
  addDentalProc: FormGroup;
  viewDentalFormGroup: FormGroup;
  procIdGridSearch: FormGroup;
  FormGroup: FormGroup;
  formGroup: FormGroup;
  updateProcedureCodeForm: FormGroup;
  dateNameArray = {}
  ObservableClaimObj;
  checkBan: boolean = true
  columns = []
  submitted = false;
  error: any;
  disableAddBtn: boolean = false;
  disableSave = false;
  getDetails;
  providerKey;
  disciplineKey;
  currentUser;
  selectedName;
  savedServiceProviderData
  dentalServiceArray = [];
  serviceStart = 0;
  scheduleStart = 0
  editTableMode: boolean = false
  procedureStart = 0
  updateProcCodeDetails;
  addProcCodeDetails;
  allowedType;
  error3: any;
  updateProcedureCodeData;
  DentalCovCategoryDetails;
  dentalServiceItems = [];
  schedule
  province
  columnSchedule
  columnProvince
  scheduleColumn
  updateamountSelected
  delete: boolean = false
  ProvinceColumn
  procedureColumn
  columnScheduleItems = []
  columnProvinceItems = []
  FeeGuideId
  scheduleSelected
  provinceSelected
  dentalserviceData
  dentalService
  columnProcedures = []
  columnProcedure
  arrProcCodeItems = [{ id: '1', itemName: 'ProcCode-1' }, { id: '2', itemName: 'ProcCode-2' }, { id: '3', itemName: 'ProcCode-3' }, { id: '4', itemName: 'ProcCode-4' }]
  dropdownSettings = {};
  arrItems = [{ id: '1', itemName: 'ProcCode-1' }, { id: '2', itemName: 'ProcCode-2' }]
  dentalProcFeeKey
  viewModeProcedureCode: boolean = false
  updateprocedureCodeSelected: any;
  updateGroupprocedureCodeSelected: any;
  updateprocedure_code
  updateamount
  groupProcCode
  multiSelectDropdownSettings = {};
  DentalFeeGuideCheck = [{
    "addNewProc": 'F',
    "editFeeGuide": 'F',
    "updateFeeGuide": 'F',
    "viewProcCode": 'F',
    "editProcCode": 'F',
    "deleteProcCode": 'F'
  }]

  arrData = [];

  arrSearch = {
    "procId": "",
    "procFeeAmt": "",
    "procLabAmt": "",
    "effDate": "",
    "expDate": "",
    "procKey": ""
  }
  updateEffectiveRow = []
  updateExpiredRow = []
  selectedDentalProcedureKey: any;
  selectedDentalProcedureId: any;
  dtOptions: DataTables.Settings[] = [];
  searchFilter: boolean;
  dtTrigger: Subject<any>[] = [];
  @ViewChildren(DataTableDirective)
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;

  newRecordValidate: boolean = false;
  addNewRecord: boolean = false;

  provinceCodesDataRemote: RemoteData;
  scheduleItemsDataRemote: RemoteData;

  rowClick: boolean = false;
  oldRowData: any;
  oldRowIndx: any;
  editLabAmount: any;
  editEffective: any;
  editFeeAmount: any;
  editExpiredOn: any;
  editData: any
  indexCheck: boolean = false;
  firstRowData: any;
  expiredOn: FormControl;
  secondRowData: any;
  currentRowData: any;
  row_index: any;
  rowClickEditMode: boolean = false;
  dateFormate: boolean = true;
  procCodeListingEditMode: boolean = false;
  isSearchFilter: boolean = false

  constructor(
    private route: ActivatedRoute,
    private exDialog: ExDialog,
    private router: Router,
    private changeDateFormatService: ChangeDateFormatService,
    private fb: FormBuilder,
    private translate: TranslateService,
    public dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastrService: ToastrService,
    private serviceProviderService: ServiceProviderService,
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private renderer: Renderer2
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.provinceCodesDataRemote = completerService.remote(
      null,
      "provinceName",
      "provinceName"
    );
    this.provinceCodesDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.provinceCodesDataRemote.urlFormater((term: any) => {

      return FeeGuideApi.getPredectiveProvinceCode + `/${term}`;
    });
    this.provinceCodesDataRemote.dataField('result');
    this.scheduleItemsDataRemote = completerService.remote(
      null,
      "dentFeeGuideSchedDesc",
      "dentFeeGuideSchedDesc"
    );
    this.scheduleItemsDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.scheduleItemsDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getPredictiveDentalFeeGuideScheduleList + `/${term}`;
    });
    this.scheduleItemsDataRemote.dataField('result');

    this.procIds = new FormControl('')

    this.procIdsData = completerService.remote(
      null,
      "dentalProcedureId",
      "dentalProcedureId"
    );
    this.procIdsData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.procIdsData.urlFormater((term: any) => {
      this.procID = term
      return FeeGuideApi.getDentalProcedureListUrl + `/${term}`;
    });
    this.procIdsData.dataField('result');
  }

  ngOnInit() {
    this.showtableLoader = true;
    this.rowClick = false
    this.multiSelectDropdownSettings = Constants.multiSelectDropdown;
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let DentalFeeGuideArray = this.currentUserService.authChecks['PSF']
        this.getAuthCheck(DentalFeeGuideArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUser = this.currentUserService.currentUser;
      let DentalFeeGuideArray = this.currentUserService.authChecks['PSF']
      this.getAuthCheck(DentalFeeGuideArray)
    }

    this.addDentalProc = this.fb.group({
      procedureID: ['', Validators.required],
      procFeeAmount: [''],
      dentalProcLab: ['', Validators.required],
      dentalProcFee: ['', Validators.required],
      effectiveOn: ['', Validators.required],
      labFlat: [''],
      feeFlat: [''],
      expiredOn: [''],
    })

    this.FormGroup = this.fb.group({
      bussArrNo: [''],
      bankAccNo: [''],
      disciplineType: [null],
    })

    this.viewDentalFormGroup = this.fb.group({
      columnProvince: ['', Validators.required],
      columnSchedule: ['', Validators.required],
      feeGuideName: ['', [Validators.required, Validators.maxLength(50), CustomValidators.notEmpty]],
      effective_on: ['', Validators.required]
    })

    this.updateProcedureCodeForm = this.fb.group({
      updateprocedure_code: ['', Validators.required],
      feeFlat: ['', Validators.required],
      empty: ['', Validators.required],
      updateamount: ['', Validators.required],
      groupProcCode: [''],
      procCodeType: []
    })

    this.procIdGridSearch = this.fb.group({
      procFeeGuide: ['']
    })

    this.updateProcedureCodeForm.patchValue({ 'feeFlat': 'flat' })
    this.updateProcedureCodeForm.patchValue({ 'procCodeType': 'individual' })
    this.groupProc = false

    this.FeeGuideId = this.route.snapshot.url[1].path;
    this.fillViewDentalValues();
    this.getGroupProcCodes()

    /**
    * @param columns for search table with translations
    * @function intailze empty datatable for search
    * 
    */

    this.dtOptions['view-Dental-FeeGuide'] = Constants.viewDentalFeeGuideOptionsConfig
    this.dtTrigger['view-Dental-FeeGuide'] = new Subject();
    if (this.viewMode || this.editMode) {
      this.ViewProcIdDetails(false)
    }

    this.enableViewMode();
    this.pageMode = "View";
    this.updateSchedule();
    this.updateProcedure()
    this.dropdownSettings = Constants.angular2Multiselect
    var self = this
    var rowId
    rowId = 57543724
    var dentalProcFeeKey
    this.getFeeGuideProcedureCodeList()
    setTimeout(function () {
      var procId = <HTMLSelectElement>document.getElementById('dfg_edit');
      if (procId != null) {
        procId.focus();
      }
    }, 200);
    this.arrNewRow = {
      "procedureCode": "",
      "dentalProcedureFeeAmt": 0,
      "dentalProcedureLabFeeAmt": 0,
      "effectiveOn": this.viewDentalFormGroup.controls['effective_on'].value,
      "expiredOn": "",
      "idx": "",
    }
  }

  getAuthCheck(DentalFeeGuideArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.DentalFeeGuideCheck = [{
        "addNewProc": 'T',
        "editFeeGuide": 'T',
        "updateFeeGuide": 'T',
        "viewProcCode": 'T',
        "editProcCode": 'T',
        "deleteProcCode": 'T'
      }]
    } else {
      for (var i = 0; i < DentalFeeGuideArray.length; i++) {
        userAuthCheck[DentalFeeGuideArray[i].actionObjectDataTag] = DentalFeeGuideArray[i].actionAccess
      }
      this.DentalFeeGuideCheck = [{
        "addNewProc": userAuthCheck['LPS207'],
        "editFeeGuide": userAuthCheck['LPS208'],
        "updateFeeGuide": userAuthCheck['LPS209'],
        "viewProcCode": userAuthCheck['LPS204'],
        "editProcCode": userAuthCheck['LPS205'],
        "deleteProcCode": userAuthCheck['LPS206']
      }]
    }
    return this.DentalFeeGuideCheck
  }

  ngAfterViewInit() {
    var self = this
    $(document).find("#loadOnScroll ul").on('scroll', function () {
      self.updateSchedule()
    })
    $(document).find("#loadProcOnScroll ul").on('scroll', function () {
      self.updateProcedure()
    })
  }

  enableViewMode() {
    if (this.viewMode) {
      this.viewDentalFormGroup.disable();
    }
  }

  onRowClick(row_index) {
    this.dateFormate = false
    var rowData = this.arrData[row_index]
    if (this.addNewRecord) {
      if (this.arrNewRow.procedureCode < this.arrData[row_index].dentalProcedureKey) {
        row_index++
      }
      this.SaveInfo(0).then(row => {
        this.firstRowClickedData(rowData, row_index)
      })
    }
    else {
      if (this.firstRowData && row_index != this.oldRowIndx) {
        this.rowData(rowData, row_index)
      }
      else {
        this.dateFormate = false
        this.firstRowClickedData(rowData, row_index)
      }
    }
  }

  enableEditMode() {
    this.FormGroup.enable();
    var self = this;
    setTimeout(function () {
      self.renderer.selectRootElement('#DentalFeeGuideName').focus();
    }, 1000);
    this.pageMode = "Edit";
    this.viewDentalFormGroup.enable();
    this.viewDentalFormGroup.controls['effective_on'].disable()
    this.viewMode = false;
    this.addMode = false;
    this.editMode = true;
    this.buttonText = "Update";
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
  }

  changeDateFormatBanNumber(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.viewDentalFormGroup.patchValue(datePickerValue);
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
      this.viewDentalFormGroup.patchValue(datePickerValue);
    }
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

  saveServiceProviderData() {
    this.submitted = true;
    var userId = this.currentUser.userId

    if (this.FormGroup.valid) {
      this.disableAddBtn = true
      let submitData
      var action = "Saved"
      var apiUrl = ServiceProviderApi.saveServiceProviderUrl
      var providerID = '';

      submitData = {
        'FeeGuideName': this.FormGroup.value.viewDentalFormGroup.feeGuideName,
        'Schedule': this.FormGroup.value.viewDentalFormGroup.schedule,
        'Province': this.FormGroup.value.viewDentalFormGroup.province,
        'Effective On': this.FormGroup.value.viewDentalFormGroup.effective_on,
        'Action(Edit/Delete)': this.FormGroup.value.viewDentalFormGroup.action,
      }

      if (this.providerKey) {
        var action = "Updated"
        submitData['provKey'] = this.providerKey;
        submitData["disciplineKey"] = this.disciplineKey
      }

      this.hmsDataServiceService.postApi(apiUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.disableAddBtn = false;
          this.savedServiceProviderData = data.result;
          this.providerKey = this.savedServiceProviderData.provKey;
          this.serviceProviderService.saveUpdateProvider.emit(true);
          this.disciplineKey = this.savedServiceProviderData.disciplineKey
          this.toastrService.success(this.translate.instant('feeGuide.toaster.serviceProviderDetails') + action + this.translate.instant('feeGuide.toaster.success'));
          this.router.navigate(['/serviceProvider/view/' + this.providerKey + '/type/' + this.savedServiceProviderData.disciplineKey])
        } else if (data.code == 208) {
          this.toastrService.warning(data.hmsMessage.messageShort);
        } else {
          this.toastrService.error(this.translate.instant('serviceProvider.toaster.service-provider-not-added'))
          this.disableAddBtn = false
        }
        error => {

        }
      });
    }
    else {
      this.validateAllFormFields(this.FormGroup);
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  resetUpdateForm() {
    this.procedureItemStart = 0;
    this.updateprocedure_code = []
    this.updateamount = []
    this.updateProcedureCodeForm.reset();
    this.updateProcedureCodeForm.patchValue({ 'feeFlat': 'F' });
    this.procedureCodeItems = [];
    this.groupProc = false
    this.groupProcedureCodeItems = [];
    this.groupProcCode = [];
    this.amountItems = [];
  }

  onRadioButtonsChange() {
    var ControlName = this.updateProcedureCodeForm.controls.feeFlat.value
    if (ControlName && ControlName == 'percentage') {
      var value = this.updateProcedureCodeForm.controls.empty.value
      if (value > 100) {
        this.updateProcedureCodeForm.patchValue({ 'empty': '' })
      }
    }
  }

  feeType() {
    if (this.updateProcedureCodeForm.controls['feeFlat'].value == 'F') {
      this.updateProcedureCodeForm.controls['empty'].setValidators([Validators.required, CustomValidators.onlyTwoDigisAfterDecimal]);
      this.updateProcedureCodeForm.controls['empty'].updateValueAndValidity()
    }
    else if (this.updateProcedureCodeForm.controls['feeFlat'].value == 'P') {
      this.updateProcedureCodeForm.controls['empty'].setValidators([Validators.required, CustomValidators.percValue]);
      this.updateProcedureCodeForm.controls['empty'].updateValueAndValidity()
    }
  }

  procCodeType() {
    if (this.updateProcedureCodeForm.controls['procCodeType'].value == 'individual') {
      this.updateGroupprocedureCodeSelected = []
      this.updateProcedureCodeForm.controls['groupProcCode'].clearValidators();
      this.updateProcedureCodeForm.controls['groupProcCode'].updateValueAndValidity();
      this.updateProcedureCodeForm.controls['updateprocedure_code'].setValidators(Validators.required);
      this.updateProcedureCodeForm.controls['updateprocedure_code'].updateValueAndValidity()
      this.groupProcCode = []
      this.groupProc = false
      this.singleProc = true
    }
    else if (this.updateProcedureCodeForm.controls['procCodeType'].value == 'group') {
      this.updateprocedureCodeSelected = []
      this.updateprocedure_code = []
      this.updateProcedureCodeForm.controls['groupProcCode'].setValidators(Validators.required);
      this.updateProcedureCodeForm.controls['groupProcCode'].updateValueAndValidity();
      this.updateProcedureCodeForm.controls['updateprocedure_code'].clearValidators();
      this.updateProcedureCodeForm.controls['updateprocedure_code'].updateValueAndValidity();
      this.singleProc = false;
      this.groupProc = true;
    }
  }

  updateProcedureCodeDetails() {
    this.feeType()
    if (this.updateProcedureCodeForm.valid) {
      this.RequestedData = {
        'dentalProcedureKeys': this.updateprocedureCodeSelected,
        'feeFlat': this.updateProcedureCodeForm.value.feeFlat,
        'dentFeeGuideKey': +this.FeeGuideId,
        "labFlat": this.updateProcedureCodeForm.value.feeFlat,
        'serviceKeys': this.updateGroupprocedureCodeSelected
      }
      if (this.updateamountSelected.length > 1) {
        this.RequestedData['dentalProcedureLabFeeAmt'] = this.updateProcedureCodeForm.value.empty
        this.RequestedData['dentalProcedureFeeAmt'] = this.updateProcedureCodeForm.value.empty
      } else {
        if (this.updateamountSelected == 0) {
          this.RequestedData['dentalProcedureLabFeeAmt'] = this.updateProcedureCodeForm.value.empty

        } else {
          this.RequestedData['dentalProcedureFeeAmt'] = this.updateProcedureCodeForm.value.empty
        }
      }
      this.hmsDataService.postApi(FeeGuideApi.updateMultiProcedureCodeUrl, this.RequestedData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.updateProcCodeDetails = data.result;
          this.hmsDataService.OpenCloseModal('viewFeeguideClose')
          this.toastrService.success(this.translate.instant('feeGuide.toaster.updateDentalProcedureSuccess'));
          this.updateProcedureCodeForm.reset()
          this.disableSave = false
          this.ViewProcIdDetails(true).then(row => { //  QA feedback issue 177 fixed
            $('#view-Dental-FeeGuide tbody .tableRow').remove();
            this.resetNewRecord();
          });
        } if (data.code == 400 && data.status === "BAD_REQ") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.updateDentalProcedureFail'));
          this.disableSave = false
        }
      });
    } else {
      this.validateAllFormFields(this.updateProcedureCodeForm);
    }
  }

  fillViewDentalValues() {
    this.getProvince()
    var viewParam =
    {
      "dentFeeGuideKey": this.FeeGuideId,
    }
    this.hmsDataService.postApi(FeeGuideApi.getFeeGuideViewDetailsUrl, viewParam).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        let FeeGuideDetails = data.result
        this.provinceSelected = FeeGuideDetails.provinceKey
        this.scheduleSelected = FeeGuideDetails.dentFeeGuideSchedKey
        let submitData = {
          feeGuideName: FeeGuideDetails.dentFeeGuideName,
          effective_on: this.changeDateFormatService.convertStringDateToObject(FeeGuideDetails.effectiveOn),
          columnProvince: FeeGuideDetails.provinceName,
          columnSchedule: FeeGuideDetails.dentFeeGuideSchedName
        }
        this.viewDentalFormGroup.patchValue(submitData);
      }
    });
  }

  getProvince() {
    this.hmsDataService.getApi(FeeGuideApi.getProvinceListUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.columnProvinceItems.push({ 'id': data.result[i].provinceName, 'itemName': data.result[i].provinceName })
        }
      }
    })
  }

  getGroupProcCodes() {
    this.hmsDataService.getApi(FeeGuideApi.getDentalServicesUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.groupProcedureCodeItems.push({ 'id': data.result[i].serviceKey, 'itemName': data.result[i].parentDescription })
        }
      }
    })
  }

  updateSchedule() {
    var RequestedData = {
      "start": this.scheduleStart,
      "length": 13
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalFeeGuideScheduleListUrl, RequestedData).subscribe(data => {
      if (data.status != "NOT_FOUND") {
        for (var i = 0; i < data.result.length; i++) {
          this.columnScheduleItems.push({ 'id': data.result[i].dentFeeGuideSchedCd, 'itemName': data.result[i].dentFeeGuideSchedDesc })
        }
      }
    })
    this.scheduleStart = this.scheduleStart + 1
  }

  updateProcedure() {
    var RequestedData = {
      "start": this.procedureStart,
      "length": 13
    }
    this.procedureStart = this.procedureStart + 1
  }

  resetAddDentalProcedureForm() {
    this.addDentalProc.reset();
    this.addDentalProc.enable()
    this.viewModeProcedureCode = false
    this.procedureID = []
    this.addMode = true;
    this.procCodeMode = "Add Proc. Code";
    this.addDentalProc.patchValue({ 'feeFlat': 'F' });
    this.addDentalProc.patchValue({ 'labFlat': 'F' });
  }

  onSelect(item: any, type) {
    if (type == 'columnSchedule') {
      this.scheduleColumn = item.id
      this.viewDentalFormGroup.controls[type].setValue(item.id);
    }
    if (type == 'columnProvince') {
      this.ProvinceColumn = item.value
      this.viewDentalFormGroup.controls[type].setValue(item.id);
    }
    if (type == 'procedureID') {
      this.procedureColumn = item.id
      this.addDentalProc.controls[type].setValue(item.id);
    }
    if (type == 'updateprocedure_code') {
      this.updateprocedureCodeSelected = []
      for (var j = 0; j < this.updateprocedure_code.length; j++) {
        this.updateprocedureCodeSelected.push(this.updateprocedure_code[j]['id'])
      }
      this.updateProcedureCodeForm.controls[type].setValue(this.updateprocedureCodeSelected);
    }
    if (type == 'groupProcCode') {
      this.updateGroupprocedureCodeSelected = []
      for (var j = 0; j < this.groupProcCode.length; j++) {
        this.updateGroupprocedureCodeSelected.push(this.groupProcCode[j]['id'])
      }
      this.updateProcedureCodeForm.controls[type].setValue(this.updateGroupprocedureCodeSelected);
    }
    if (type == 'updateamount') {
      this.updateamountSelected = []
      for (var j = 0; j < this.updateamount.length; j++) {
        this.updateamountSelected.push(this.updateamount[j]['id'])
      }
      this.updateProcedureCodeForm.controls[type].setValue(this.updateamountSelected);
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
      this.viewDentalFormGroup.controls[type].setValue('');
    }
    if (type == 'columnProvince') {
      this.ProvinceColumn = ''
      this.viewDentalFormGroup.controls[type].setValue('');
    }
    if (type == 'procedureID') {
      this.procedureColumn = ''
    }
    if (type == 'updateprocedure_code') {
      this.updateprocedureCodeSelected = []
      if (this.updateprocedure_code.length > 0) {
        for (var j = 0; j < this.updateprocedure_code.length; j++) {
          this.updateprocedureCodeSelected.push(this.updateprocedure_code[j]['id'])
        }
      }
    }
    if (type == 'groupProcCode') {
      this.updateGroupprocedureCodeSelected = []
      if (this.updateGroupprocedureCodeSelected.length > 0) {
        for (var j = 0; j < this.groupProcCode.length; j++) {
          this.updateGroupprocedureCodeSelected.push(this.groupProcCode[j]['id'])
        }
      }
    }
  }

  feeAmountChanged() {
    this.checkModifyFee()
  }

  checkModifyFee() {
    if (this.addDentalProc.controls['feeFlat'].value == 'P') {
      this.addDentalProc.controls['dentalProcFee'].setValidators([CustomValidators.percValue, Validators.required]);
      this.addDentalProc.controls['dentalProcFee'].updateValueAndValidity()
    }
    else {
      this.addDentalProc.controls['dentalProcFee'].setValidators([Validators.required, CustomValidators.onlyTwoDigisAfterDecimal])
      this.addDentalProc.controls['dentalProcFee'].updateValueAndValidity()
    }
    if (this.addDentalProc.controls['labFlat'].value == 'P') {
      this.addDentalProc.controls['dentalProcLab'].setValidators([CustomValidators.percValue, Validators.required]);
      this.addDentalProc.controls['dentalProcLab'].updateValueAndValidity()
    }
    else {
      this.addDentalProc.controls['dentalProcLab'].setValidators([Validators.required, CustomValidators.onlyTwoDigisAfterDecimal])
      this.addDentalProc.controls['dentalProcLab'].updateValueAndValidity()
    }
  }

  onKeyPress(event) {
    this.checkModifyFee();
    if (event.type == 'onPressTab') {
      this.showLoader = true
      $('#setFocus').attr("tabIndex", -1).focus();
    }
  }

  triggerRuleDropDownWhenEff(event) {
    if (event.key == 'Tab' && !(event.shiftKey)) {
      $("#updateprocedureCodeScroll .c-btn").trigger('click');
    }
    else if (event.key == 'Tab' && event.shiftKey) {
      $("#dfg_procCode").focus();
    }
  }

  triggerRuleDropDownWhenEff1(event) {
    if (event.key == 'Enter') {
      $("#updateprocedureCodeScroll .c-btn").trigger('click');
      $("#updateprocedureCodeScroll .c-btn").focusout();
      $("#procedureCode1 .c-btn").trigger('click');
      $("#procedureCode1 .c-btn").focus();
    }
    else if (event.key == 'Tab' && event.shiftKey) {
      $("#updateprocedureCodeScroll .c-btn").trigger('click');
      $("#updateprocedureCodeScroll .c-btn").focusout();
      this.onIndividualRadioButtonChange()
    }
  }

  triggerRuleDropDownWhenEff2(event) {
    if (event.key == 'Enter') {
      $("#procedureCode1 .c-btn").trigger('click');
      $("#procedureCode1 .c-btn").focusout();
      $("#dfg_flat").focus();
    }
    else if (event.key == 'Tab' && event.shiftKey) {
      $("#procedureCode1 .c-btn").trigger('click');
      $("#procedureCode1 .c-btn").focusout();
      $("#updateprocedureCodeScroll .c-btn").trigger('click');
      $("#updateprocedureCodeScroll .c-btn").focus();
    }
  }

  onKeyPress1(event) {
    this.feeType();
  }

  resetDentalProcCodeForm() {
    this.addDentalProc.reset();
    this.addDentalProc.clearValidators();
    this.addDentalProc.controls['dentalProcLab'].setValidators([Validators.required, CustomValidators.onlyNumbers])
    this.addDentalProc.controls['dentalProcLab'].updateValueAndValidity();
    this.addDentalProc.controls['dentalProcFee'].setValidators([Validators.required, CustomValidators.onlyNumbers])
    this.addDentalProc.controls['dentalProcFee'].updateValueAndValidity()
    this.procedureStart = 0;
    this.columnProcedures = [];
    this.updateProcedure();
  }

  viewDentalFeeGuide(dentalProcFeeKey) {
    this.FeeGuideId = this.route.snapshot.url[1].path;
    if (this.viewMode) {
      this.addDentalProc.disable()
    }
    var viewParam =
    {
      "dentalProcedureFeeKey": dentalProcFeeKey
    }
    let promise = new Promise((resolve, reject) => {
      this.hmsDataService.postApi(FeeGuideApi.getFeeGuideProcedureCodeDetailsUrl, viewParam).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          let DentalFeeGuideDetails = data.result
          this.procedureID = [{ 'id': DentalFeeGuideDetails.dentalProcedureKey, 'itemName': DentalFeeGuideDetails.dentalProcedureId }]
          let submitData = {
            feeFlat: DentalFeeGuideDetails.feeFlat,
            dentalProcFee: DentalFeeGuideDetails.dentalProcedureFeeAmt,
            labFlat: DentalFeeGuideDetails.labFlat,
            dentalProcLab: DentalFeeGuideDetails.dentalProcedureLabFeeAmt,
            effectiveOn: this.changeDateFormatService.convertStringDateToObject(DentalFeeGuideDetails.effectiveOn),
            expiredOn: this.changeDateFormatService.convertStringDateToObject(DentalFeeGuideDetails.expiredOn),
            procedureID: DentalFeeGuideDetails.dentalProcedureKey
          }
          this.addDentalProc.patchValue(submitData);
          resolve();
        } else {
          resolve();
          return false;
        }
      });
    })
    return promise;
  }

  saveDentalProcCode(dentalProcFeeKey) {
    this.checkModifyFee()
    let promise = new Promise((resolve, reject) => {
      this.FeeGuideId = this.route.snapshot.url[1].path;
      if (this.addDentalProc.valid) {
        this.showLoader = true;
        if (this.addMode) {
          var viewParam =
          {
            "dentalProcedureFeeKey": null,
            "dentFeeGuideKey": +this.FeeGuideId,
            "dentalProcedureKey": +this.addDentalProc.value.procedureID,
            "dentalProcedureFeeAmt": +this.addDentalProc.value.dentalProcFee,
            "dentalProcedureLabFeeAmt": +this.addDentalProc.value.dentalProcLab,
            "feeFlat": this.addDentalProc.value.feeFlat,
            "labFlat": this.addDentalProc.value.labFlat,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalProc.value.effectiveOn),
            "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalProc.value.expiredOn)
          }
        }
        else {
          viewParam =
          {
            "dentalProcedureFeeKey": dentalProcFeeKey,
            "dentFeeGuideKey": +this.FeeGuideId,
            "dentalProcedureKey": +this.addDentalProc.value.procedureID,
            "dentalProcedureFeeAmt": this.addDentalProc.value.dentalProcFee,
            "dentalProcedureLabFeeAmt": this.addDentalProc.value.dentalProcLab,
            "feeFlat": this.addDentalProc.value.feeFlat,
            "labFlat": this.addDentalProc.value.labFlat,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalProc.value.effectiveOn),
            "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalProc.value.expiredOn)
          }
        }

        this.hmsDataService.postApi(FeeGuideApi.saveOrUpdateProcedureCodeFeeUrl, viewParam).subscribe(
          res => {
            if (res.hmsMessage.messageShort == 'RECORD_UPDATED_SUCCESSFULLY' || res.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
              this.showLoader = false;
              if (this.addMode) {
                this.searchFilter = false
                this.toastrService.success(this.translate.instant('feeGuide.toaster.procCodeAddSuccess'))
                this.hmsDataService.OpenCloseModal('viewModalClosebtn')
              }
              else {
                this.searchFilter = false
                this.toastrService.success(this.translate.instant('feeGuide.toaster.procCodeUpdateSuccess'))
                this.hmsDataService.OpenCloseModal('viewModalClosebtn')
              }
              resolve();
            }
            else if (res.hmsMessage.messageShort == 'FEE_GUIDE_AND_PROCEDURE_KEY_ALREADY_EXIST') {
              this.showLoader = false;
              this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeExist'))
              return false;
            }
          });
        this.showLoader = false;
      }
      else {
        this.validateAllFormFields(this.addDentalProc);
      }
    })
    return promise;
  }

  enableAddMode() {
    this.addMode = true
    this.editMode = false
    this.addDentalProc.enable()
    this.viewModeProcedureCode = false
  }

  enableProcCodeFormEdit() {
    this.procCodeMode = "Edit Proc. Code";   //provides heading for edit proc code modal
    this.Modetxt = "View";
    this.checkModifyFee();
  }

  resetTableSearch(tableId) {
    this.searchFilter = false
    this.arrData = [];
    this.arrSearch = {
      "procId": "",
      "procFeeAmt": "",
      "procLabAmt": "",
      "effDate": "",
      "expDate": "",
      "procKey": ""
    }
    this.searchProcIdGrid()
    this.isSearchFilter = false
  }

  updateDentalFeeGuide() {
    this.FeeGuideId = this.route.snapshot.url[1].path;
    this.viewDentalFormGroup.controls['effective_on'].disable()
    if (this.viewDentalFormGroup.valid) {
      var reqParam = {
        "dentFeeGuideKey": this.FeeGuideId,
        "countryName": "",
        "dentFeeGuideName": this.viewDentalFormGroup.value.feeGuideName,
        "dentFeeGuideSchedKey": this.scheduleSelected,
        "dentFeeGuideSchedName": this.viewDentalFormGroup.value.columnSchedule,
        "provinceName": this.viewDentalFormGroup.value.columnProvince,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.viewDentalFormGroup.value.effective_on),
        "expiredOn": ""
      }
      this.hmsDataService.postApi(FeeGuideApi.updateDentalFeeGuideUrl, reqParam).subscribe(
        res => {
          if (res.hmsMessage.messageShort == 'RECORD_UPDATED_SUCCESSFULLY') {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.feeGuideUpdateSuccess'))
            this.pageMode = "View"
            this.editMode = false
            this.viewMode = true
            this.viewDentalFormGroup.disable()
            this.addMode = true;
          }
          else if (res.hmsMessage.messageShort == 'FEE_GUIDE_AND_PROCEDURE_KEY_ALREADY_EXIST') {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeAlreadyExist'))
            return false;
          }
        });
    }
    else {
      this.validateAllFormFields(this.viewDentalFormGroup);
    }
    this.scheduleStart = 0;
    this.columnScheduleItems = [];
    this.updateSchedule();
  }

  updateFeeGuide() {
    this.updateProcedureCodeForm = this.fb.group({
      updateprocedure_code: ['', Validators.required],
      feeFlat: ['', Validators.required],
      empty: ['', Validators.required],
      updateamount: ['', Validators.required],
      groupProcCode: [''],
      procCodeType: []
    })
    $('#UpdateFee').on('shown.bs.modal', function () {
      $('#dfg_procCode').focus();
    })
    this.getFeeGuideProcedureCodeList()
    this.singleProc = true
    this.getGroupProcCodes()
    this.amountItems.push({ 'id': 0, 'itemName': 'Lab Amount' }, { 'id': 1, 'itemName': 'Fee Amount' })
    this.updateProcedureCodeForm.patchValue({ 'feeFlat': 'F' });
    this.updateProcedureCodeForm.patchValue({ 'procCodeType': 'individual' })
  }

  getFeeGuideProcedureCodeList() {
    var data = {
      "dentFeeGuideKey": +this.FeeGuideId,
      "start": this.procedureItemStart,
      "length": 13,
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalProcedureFeeListByFeeGuideKeyUrl, data).subscribe(data => {
      if (data.code == 200) {
        this.procedureCodeItems = []
        for (var i = 0; i < data.result.length; i++) {
          this.procedureCodeItems.push({ 'id': data.result[i].dentalProcedureKey, 'itemName': data.result[i].dentalProcedureId })
        }
      }
    })
    this.procedureItemStart = this.procedureItemStart + 1
  }


  onSelectAll(items: any, type) {
    if (type == 'updateprocedure_code') {
      this.updateprocedureCodeSelected = []
      for (var i = 0; i < this.updateprocedure_code.length; i++) {
        this.updateprocedureCodeSelected.push(this.updateprocedure_code[i]['id'])
      }
      this.updateProcedureCodeForm.controls[type].setValue(this.updateprocedureCodeSelected);
    }
    if (type == 'groupProcCode') {
      this.updateGroupprocedureCodeSelected = []
      for (var i = 0; i < this.groupProcCode.length; i++) {
        this.updateGroupprocedureCodeSelected.push(this.groupProcCode[i]['id'])
      }
      this.updateProcedureCodeForm.controls[type].setValue(this.updateGroupprocedureCodeSelected);
    }
    if (type == 'updateamount') {
      this.updateamountSelected = []
      for (var i = 0; i < this.updateamount.length; i++) {
        this.updateamountSelected.push(this.updateamount[i]['id'])
      }
      this.updateProcedureCodeForm.controls[type].setValue(this.updateamountSelected)
    }
  }

  onDeSelectAll(items: any, type) {
    this.updateprocedureCodeSelected = []
  }

  onPredictivefeeGuideSelected(selected: CompleterItem, type) {
    if (type == 'province') {
      if (selected) {
        this.provinceSelected = selected.originalObject.provinceKey;
      }
      else {
        this.provinceSelected = '';
      }
    }
    if (type == 'schedule') {
      if (selected) {
        this.scheduleSelected = selected.originalObject.dentFeeGuideSchedKey;
      }
      else {
        this.scheduleSelected = '';
      }
    }
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchProcIdGrid()
    }
  }

  AddNew() {
    this.addNewRecord = true;
    if (!this.editMode) {
      this.selectedRowId = '';
      this.resetNewRecord();
      this.addMode = true;
      this.addTableMode = true   //(HMS Issue No.223).
    }
    setTimeout(function () {
      var procId = <HTMLSelectElement>document.getElementById('procId');
      if (procId != null) {
        procId.focus();
      }
    }, 200);
  }

  resetNewRecord() {
    this.addMode = false;
    this.arrNewRow = {
      "procedureCode": "",
      "dentalProcedureFeeAmt": 0,
      "dentalProcedureLabFeeAmt": 0,
      "effectiveOn": this.viewDentalFormGroup.controls['effective_on'].value,
      "expiredOn": "",
      "idx": "",
    }
    this.procIds.reset();
    this.arrNewRow.procedureCode = '';
    this.selectedRowId = '';
    this.newRecordValidate = false;
    this.viewMode = true;
    this.editMode = false;
  }

  /**
 * Edit Grid Row Item  
 * @param idx 
 * @param dataRow 
 */
  EditInfo(dataRow, idx, focusOnProcId: boolean = true) {
    this.defaultPageSize = Constants.viewDentalFeeGuideOptionsConfig.pageLength
    this.currentPage = this.procedureItemStart
    var pageLeng = this.defaultPageSize - 1;
    let promise = new Promise((resolve, reject) => {
      if (this.procCodeListingEditMode != true) {
        this.procCodeListingEditMode = true
        this.rowClickEditMode = true
        this.editTableMode = true;
        this.addMode = false;
        this.rowClick = true;
        this.editProcCode = dataRow.dentalProcedureId
        this.editExpiredOn = this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn)
        this.editFeeAmount = dataRow.dentalProcedureFeeAmt
        this.editEffective = this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn)
        this.editLabAmount = dataRow.dentalProcedureLabFeeAmt
        this.editProcCode = dataRow.dentalProcedureId
        if (!this.editMode || !this.editTableMode) {
          this.addMode = false;
          this.viewMode = true
          if (this.addMode) {
            this.selectedRowId = idx
          } else {
            this.selectedRowId = idx
            this.arrData[idx].effectiveOn = this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn);
            this.arrData[idx].expiredOn = this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn);
            if (this.searchFilter) {
              this.selectedRowId = dataRow.dentalProcedureFeeKey
            }
            else {
              this.selectedRowId = dataRow.dentalProcedureFeeKey;
            }
          }
        }
        /* QA Feddback Point 180: on click of edit icon amount is getting zero issue fixed*/
        dataRow.dentalProcedureFeeAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(dataRow.dentalProcedureFeeAmt)
        dataRow.dentalProcedureLabFeeAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(dataRow.dentalProcedureLabFeeAmt)

        if (focusOnProcId == true) {
          setTimeout(function () {
            var txtDate = <HTMLInputElement>document.getElementById('procId' + idx);
            if (txtDate != null) {
              txtDate.focus();
            }
          }, 200);
        }
        resolve();
      }
    });
    return promise;
  }

  ChangeInputDateFormat(event, idx, type) {
    let inputDate = event;
    if (inputDate.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(inputDate);

      if (obj == null) {
        this.toastrService.warning("Invalid Date");
      }
      else {
        inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
        if (this.addMode) {
          let effectiveOn
          if (this.arrNewRow.effectiveOn) {
            effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn);
          }
          let expiredOn
          if (this.arrNewRow.expiredOn) {
            expiredOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn);
          }
          let effDate = this.arrSearch.effDate;
          if (type == 'effectiveOn') {
            effectiveOn = inputDate
          }
          else if (type == 'effDate') {
            effDate = inputDate
          }
          else {
            expiredOn = inputDate
          }
          if (effectiveOn && expiredOn) {

            var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
            if (isTrue) {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.expiry-date'));
              if (type == 'effectiveOn') {
                this.arrNewRow.effectiveOn = '';
              }
              else {
                this.arrNewRow.expiredOn = '';
              }
            }
            else {
              if (type == 'effectiveOn') {
                this.arrNewRow[type] = obj;
                let span = document.getElementById('claimDOB');
                let row = span.getElementsByTagName('button')
                let arr = Array.prototype.slice.call(row)
                arr.forEach(element => {
                  element.tabIndex = -1;
                });
              }
              else {
                this.arrNewRow[type] = obj;
                let span = document.getElementById('expiryField');
                let row = span.getElementsByTagName('button')
                let arr = Array.prototype.slice.call(row)
                arr.forEach(element => {
                  element.tabIndex = -1;
                });
              }
            }
          }
          else {
            if (type == 'effectiveOn') {
              this.arrNewRow[type] = obj;
              let span = document.getElementById('claimDOB');
              let row = span.getElementsByTagName('button')
              let arr = Array.prototype.slice.call(row)
              arr.forEach(element => {
                element.tabIndex = -1;
              });
            }
            else {
              this.arrNewRow[type] = obj;
              let span = document.getElementById('expiryField');
              let row = span.getElementsByTagName('button')
              let arr = Array.prototype.slice.call(row)
              arr.forEach(element => {
                element.tabIndex = -1;
              });
            }
          }
        }
        else {
          this.arrData[idx][type] = inputDate;
          let effectiveOn
          if (this.arrData[idx].effectiveOn.date) {
            effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrData[idx].effectiveOn);
          }
          else {
            effectiveOn = this.arrData[idx].effectiveOn;
          }
          let expiredOn
          if (expiredOn != '' && expiredOn != null && expiredOn != undefined) {
            if (this.arrData[idx].expiredOn.date) {
              expiredOn = this.changeDateFormatService.convertDateObjectToString(this.arrData[idx].expiredOn);
            }
            else {
              expiredOn = this.arrData[idx].expiredOn;
            }
          }

          if (effectiveOn && expiredOn) {
            var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
            if (isTrue) {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.expiry-date'));
              if (type == 'effectiveOn') {
                this.arrData[idx].effectiveOn = '';
                let span = document.getElementById('claimDOB' + idx);
                let row = span.getElementsByTagName('button')
                let arr = Array.prototype.slice.call(row)
                arr.forEach(element => {
                  element.tabIndex = -1;
                });
              }
              else {
                this.arrData[idx].expiredOn = '';
                let span = document.getElementById('expiryField' + idx);
                let row = span.getElementsByTagName('button')
                let arr = Array.prototype.slice.call(row)
                arr.forEach(element => {
                  element.tabIndex = -1;
                });
              }
            }
            else {
              if (type == 'effectiveOn') {
                this.arrData[idx].effectiveOn = obj;
              }
              else {
                this.arrData[idx].expiredOn = obj;
              }
            }
          }
          else {
            if (type == 'effectiveOn') {
              this.arrData[idx].effectiveOn = obj;
              let span = document.getElementById('claimDOB' + idx);
              let row = span.getElementsByTagName('button')
              let arr = Array.prototype.slice.call(row)
              arr.forEach(element => {
                element.tabIndex = -1;
              });
            }
            else {
              this.arrData[idx].expiredOn = obj;
              let span = document.getElementById('expiryField' + idx);
              let row = span.getElementsByTagName('button')
              let arr = Array.prototype.slice.call(row)
              arr.forEach(element => {
                element.tabIndex = -1;
              });
            }
          }
        }
      }
    }
    else {
      if (this.addMode != true) {
        if (type == 'effectiveOn') {
          this.arrData[idx].effectiveOn = '';
          let span = document.getElementById('claimDOB' + idx);
          let row = span.getElementsByTagName('button')
          let arr = Array.prototype.slice.call(row)
          arr.forEach(element => {
            element.tabIndex = -1;
          });
        }
        else {
          this.arrData[idx].expiredOn = '';
          let span = document.getElementById('expiryField' + idx);
          let row = span.getElementsByTagName('button')
          let arr = Array.prototype.slice.call(row)
          arr.forEach(element => {
            element.tabIndex = -1;
          });
        }
      }
    }
  }

  ValidateControls(evt, ctrlName) { }

  validateAllFields(objRow: any) {
    if (this.addNewRecord) {
      if (objRow.procedureCode != "" || objRow.procedureCode.length == 5) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      if (objRow.dentalProcedureId != "") {
        return true;
      }
      else {
        return false;
      }
    }
  }

  DeleteInfo(dataRow, idx) {
    var action = "cancel";
    if (dataRow && dataRow.procId) {
      action = "Delete";
    }

    this.exDialog.openConfirm("Are you sure you want to delete the record").subscribe((value) => {
      if (value) {
        this.delete = true
        this.showtableLoader = true;
        {
          var requestedData = {
            "dentalProcedureFeeKey": dataRow.dentalProcedureFeeKey,
          }
          this.hmsDataService.postApi(FeeGuideApi.deleteUsclsProcedureFeeWithLabIndUrl, requestedData).subscribe(data => {
            if (data.code == 202 && data.status === "ACCEPTED") {
              this.showtableLoader = true;
              this.toastrService.success(this.translate.instant('feeGuide.toaster.procCodeDeleteSuccess'));
              this.searchProcIdGrid();
            }
            else if (data.code == 400 && data.status === "BAD_REQ") {
              this.showtableLoader = false;
              this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeNotDeleted'));
            }
            else if (data.code == 400 && data.hmsMessage.messageShort == "CHILD_RECORD_FOUND") {
              this.showtableLoader = false;
              this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeNotDelAsAssWithProcCode'))
            }
            else {
              this.showtableLoader = false;
            }
          });
        }
      }
    })
  }

  ViewProcIdDetails(reload) {
    let promise = new Promise((resolve, reject) => {
      if ($.fn.dataTable.isDataTable('#view-Dental-FeeGuide')) {
        $('#view-Dental-FeeGuide').DataTable().destroy();
      }
      this.showtableLoader = true
      var requestedData = {
        "dentFeeGuideKey": +this.FeeGuideId,
        "start": this.procedureItemStart,
        "length": 13,
      }
      this.hmsDataServiceService.postApi(FeeGuideApi.getDentalProcedureFeeListByFeeGuideKeyUrl, requestedData).subscribe(data => {
        if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
          this.arrData = data.result;
          this.totalProcCodesLength = data.result.length;
          if (!$.fn.dataTable.isDataTable('#view-Dental-FeeGuide')) {
            if (this.isSearchFilter) {
              this.searchProcIdGrid()
            } else {
              this.dtTrigger['view-Dental-FeeGuide'].next()
              this.showtableLoader = false
            }
          } else {
            this.reloadTable('view-Dental-FeeGuide')
            this.showtableLoader = false
          }
          this.showtableLoader = false
          resolve();
        }
        else {
          this.showtableLoader = false
          resolve();
        }
      })
      this.defaultPageSize = Constants.viewDentalFeeGuideOptionsConfig.pageLength
      this.currentPage = this.procedureItemStart
      var pageLeng = this.defaultPageSize - 1;
    });
    return promise;
  }

  reloadTable(tableID) {
    let promise = new Promise((resolve, reject) => {
      this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false);
      resolve();
    });
    return promise;
  }

  searchProcIdGrid() {
    let promise = new Promise((resolve, reject) => {
      if ($.fn.dataTable.isDataTable('#view-Dental-FeeGuide')) {
        $('#view-Dental-FeeGuide').DataTable().destroy();
      }
      this.isSearchFilter = true
      this.searchFilter = true;
      this.addNewRecord = false;
      this.showtableLoader = true;
      this.searchFilter = true
      var requestedData = {
        "dentFeeGuideKey": +this.FeeGuideId,
        "dentalProcedureKey": this.arrSearch.procId,
        "dentalProcedureFeeAmt": this.arrSearch.procFeeAmt,
        "dentalProcedureLabFeeAmt": this.arrSearch.procLabAmt,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.arrSearch.effDate),
        "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.arrSearch.expDate),
        "start": 0,
        "length": 1000
      }
      this.hmsDataService.postApi(FeeGuideApi.searchProcedureFeeByColumnFilterUrl, requestedData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.arrData = data.result
          if (!$.fn.dataTable.isDataTable('#view-Dental-FeeGuide')) {
            this.dtTrigger['view-Dental-FeeGuide'].next()
            this.showtableLoader = false
          } else {
            this.reloadTable('view-Dental-FeeGuide').then(row => {
              resolve();
            })
          }

          if (this.delete) {
            this.showtableLoader = false;
            this.delete = false
          }
          else {
            this.showtableLoader = false;
          }
        } else {
          this.arrData = []
          this.showtableLoader = false;
          resolve();
        }
      });
    });
    return promise;
  }

  SaveInfo(id) {
    let promise = new Promise((resolve, reject) => {
      this.newRecordValidate = true;
      this.arrNewRow.procedureCode = this.procID
      if (this.validateAllFields(this.arrNewRow)) {
        this.showtableLoader = true
        var requestedData
        if ((this.arrNewRow.effectiveOn || this.arrNewRow.expiredOn) && this.DateObjectToString != false) {
          requestedData =
          {
            "dentalProcedureFeeKey": null,
            "dentFeeGuideKey": +this.FeeGuideId,
            "dentalProcedureId": this.procID,
            "dentalProcedureFeeAmt": this.arrNewRow.dentalProcedureFeeAmt != null ? this.arrNewRow.dentalProcedureFeeAmt : "",
            "dentalProcedureLabFeeAmt": this.arrNewRow.dentalProcedureLabFeeAmt != null ? this.arrNewRow.dentalProcedureLabFeeAmt : "",
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn),
            "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn)
          }
        } else {
          requestedData =
          {
            "dentalProcedureFeeKey": null,
            "dentFeeGuideKey": +this.FeeGuideId,
            "dentalProcedureId": this.procID,
            "dentalProcedureFeeAmt": this.arrNewRow.dentalProcedureFeeAmt != null ? this.arrNewRow.dentalProcedureFeeAmt : "",
            "dentalProcedureLabFeeAmt": this.arrNewRow.dentalProcedureLabFeeAmt != null ? this.arrNewRow.dentalProcedureLabFeeAmt : "",
            "effectiveOn": this.arrNewRow.effectiveOn,
            "expiredOn": this.arrNewRow.expiredOn
          }
        }
        if (this.unsubSaveOldRequest) {
          this.unsubSaveOldRequest.unsubscribe();
          this.unsubSaveOldRequest = null;
        }
        var unsubSaveOldRequest = this.hmsDataServiceService.postApi(FeeGuideApi.saveOrUpdateProcedureCodeFeeUrl, requestedData).subscribe(
          data => {
            if (data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
              this.searchFilter = false
              this.toastrService.success(this.translate.instant('feeGuide.toaster.procCodeAddSuccess'))
              this.addNewRecord = false;
              this.showtableLoader = false;
              this.dentalProcedureId = data.result.dentalProcedureId
              this.ViewProcIdDetails(true).then(row => {
                if (id == 1) {
                  this.AddNew();
                }
                this.preventNextRowEditMode = false;
                resolve();
              });
              this.procID = ''
            } else if (data.hmsMessage.messageShort == 'FEE_GUIDE_AND_PROCEDURE_KEY_ALREADY_EXIST') {
              this.showtableLoader = false;
              this.preventNextRowEditMode = true;
              this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeExist'))
              return false;
            } else if (data.hmsMessage.messageShort == 'PROCEDURE_CODE_DOESNOT_EXIST') {
              this.showtableLoader = false;
              this.preventNextRowEditMode = true;
              this.toastrService.error("Procedure Code Does Not Exist")
              return false;
            }
            else {
              resolve();
            }
            this.preventNextRowEditMode = false;
          });
        ;

      } else {
        return false;
      }
    });
    return promise;
  }

  UpdateInfo(dataRow, idx, id) {
    this.rowClickEditMode = false
    this.procCodeListingEditMode = false
    if (this.oldRowIndx) {
      this.oldRowIndx = undefined
    }
    if (this.rowClick) {
      this.rowClick = false
    }
    if (id == 1) {
      this.dateFormate = true
    }
    if (dataRow.effectiveOn) {
      if (dataRow.effectiveOn.date) {
        this.arrData[idx].effectiveOn = this.changeDateFormatService.convertDateObjectToString(dataRow.effectiveOn);
        this.row_index = idx
      }
      else {
        this.arrData[idx].effectiveOn = dataRow.effectiveOn
      }
      this.row_index = idx
    }

    if (dataRow.expiredOn) {
      if (dataRow.expiredOn != '' || dataRow.expiredOn != null || dataRow.expiredOn != undefined) {
        if (dataRow.expiredOn.date) {
          this.arrData[idx].expiredOn = this.changeDateFormatService.convertDateObjectToString(dataRow.expiredOn);
        }
        else {
          this.arrData[idx].expiredOn = dataRow.expiredOn;
        }
        this.row_index = idx
      }
    }
    let promise = new Promise((resolve, reject) => {
      if (dataRow.dentalProcedureId == '') {
        dataRow.dentalProcedureKey = ''
      }
      else if (this.selectedDentalProcedureKey) {
        dataRow.dentalProcedureKey = this.selectedDentalProcedureKey
      }
      else {
        dataRow.dentalProcedureKey = dataRow.dentalProcedureKey
      }
      if (this.validateAllFields(dataRow)) {
        if (this.selectedDentalProcedureKey) {
          this.selectedDentalProcedureKey = this.selectedDentalProcedureKey
        }
        else {
          this.selectedDentalProcedureKey = dataRow.dentalProcedureKey
        }
        var requestedData = {}
        if (this.unsubOldRequest) {
          this.unsubOldRequest.unsubscribe();
          this.unsubOldRequest = null;
        }
        if (!this.addMode) {
          requestedData =
          {
            "dentalProcedureFeeKey": dataRow.dentalProcedureFeeKey,
            "dentFeeGuideKey": +this.FeeGuideId,
            "dentalProcedureId": this.procID ? this.procID : dataRow.dentalProcedureId,
            "dentalProcedureFeeAmt": dataRow.dentalProcedureFeeAmt,
            "dentalProcedureLabFeeAmt": dataRow.dentalProcedureLabFeeAmt,
            "effectiveOn": this.arrData[idx].effectiveOn,
            "expiredOn": this.arrData[idx].expiredOn
          }
        }
        var unsubOldRequest = this.hmsDataServiceService.postApi(FeeGuideApi.saveOrUpdateProcedureCodeFeeUrl, requestedData).subscribe(
          data => {
            if (data.hmsMessage.messageShort == 'RECORD_UPDATED_SUCCESSFULLY' || data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
              if (this.addMode) {
                this.searchFilter = false
                this.editTableMode = false
                this.selectedDentalProcedureKey = ''
                this.toastrService.success(this.translate.instant('feeGuide.toaster.procCodeAddSuccess'))
                this.procID = ''
                this.selectedDentalProcedureId = ''
                this.selectedDentalProcedureKey = ''
              }
              else {
                this.searchFilter = false
                this.editTableMode = false
                this.selectedDentalProcedureKey = ''
                this.toastrService.success(this.translate.instant('feeGuide.toaster.procCodeUpdateSuccess'))
                this.ViewProcIdDetails(true).then(row => {
                  $('#view-Dental-FeeGuide tbody .tableRow').remove();
                  this.resetNewRecord();
                  resolve();
                });
              }
            }
            else if (data.hmsMessage.messageShort == 'FEE_GUIDE_AND_PROCEDURE_KEY_ALREADY_EXIST') {
              this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeExist'))
              this.editTableMode = true
              resolve();
            }
            else if (data.hmsMessage.messageShort == 'PROCEDURE_CODE_DOESNOT_EXIST') {
              this.showtableLoader = false;
              this.preventNextRowEditMode = true;
              this.toastrService.error("Procedure Code Does Not Exist")
              return false;
            }
          });
      } else {
        this.validateAllFields(dataRow)
      }
    });
    return promise;
  }

  public isOpen: boolean = false;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  onProcIdSelected(selected: CompleterItem) {
    if (selected) {
      if (this.addNewRecord) {
        this.arrNewRow.procedureCode = (selected.originalObject.dentalProcedureKey).toString()
      }
      else {
        this.selectedDentalProcedureKey = (selected.originalObject.dentalProcedureKey).toString();
        this.selectedDentalProcedureId = (selected.originalObject.dentalProcedureId).toString();
      }
      this.procID = selected.originalObject.dentalProcedureId
    }
  }

  onColumnProcIdSelected(selected: CompleterItem) {
    if (selected) {
      this.arrSearch.procId = (selected.originalObject.dentalProcedureKey).toString();
      this.arrSearch.procKey = (selected.originalObject.dentalProcedureId).toString();
    }
  }

  CancelInfo(idx, dataRow, cancelOnBlur) {
    this.oldRowIndx = undefined
    this.procCodeListingEditMode = false
    this.rowClickEditMode = false
    if (this.editTableMode && cancelOnBlur == 0) {
      this.editTableMode = false;
      this.arrData[idx]['dentalProcedureLabFeeAmt'] = this.editLabAmount;
      this.arrData[idx]['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.editEffective);
      this.arrData[idx]['dentalProcedureFeeAmt'] = this.editFeeAmount;
      this.arrData[idx]['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.editExpiredOn);
    }
    this.firstRowData = ''
    this.addMode = false;
    this.selectedRowId = ""
    var index
    if (cancelOnBlur == 0) {
      this.addNewRecord = false;
      this.procID = ''
    }
    else if (cancelOnBlur == 1) {
      this.dateFormate = false
      this.UpdateInfo(dataRow, idx, 0).then(row => {
        index = idx + 1
        var dataRowValue = this.arrData[index]
        if (dataRowValue) {
          this.EditInfo(dataRowValue, index, true)
        }
        this.editMode = false;
        var totalLength = this.arrData.length - 1
      });
    }
    else if (cancelOnBlur == 2) {
      this.dateFormate = false
      this.SaveInfo(0).then(row => {
        index = 0
        var dataRowValue = this.arrData[index]
        if (dataRowValue && this.preventNextRowEditMode != true) {
          if (this.arrData.length > 1) {
            if (this.dentalProcedureId != dataRowValue.dentalProcedureId) {
              index = 0
            }
            else {
              index = index + 1
              var dataRowValue = this.arrData[index]
            }
            this.EditInfo(dataRowValue, index, true)
          }
          else {
            $('#dfg_addnew').focus();
            $('#grid-heading').trigger('click');
          }
        }
      });

      if (this.preventNextRowEditMode == true) {
        return false
      }
      if (!this.arrNewRow.procedureCode && this.addNewRecord) {
        this.addNewRecord = false;
      }
      else {
        this.validateAllFields(this.arrNewRow)
      }
    }
    if (!this.addNewRecord && dataRow) {
      if (dataRow.dentalProcedureId == '') {
        this.arrData[idx]['dentalProcedureId'] = this.editProcCode
      }
      else if (dataRow.dentalProcedureId != this.editProcCode) {
        this.arrData[idx]['dentalProcedureId'] = this.editProcCode
      }
    }
    this.addTableMode = false
  }

  ChangeSearchDateFormat(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  onFileChanged(event) {
    this.allowedType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    this.selectedFile = event.target.files[0]

    if (this.selectedFile.type != this.allowedType) {
      this.toastrService.error("This file type can't be selected")
    }
    else {
      this.selectedName = this.selectedFile
      var formData = new FormData()
      this.showtableLoader = true
      formData.append('dentFeeGuideKey', this.FeeGuideId);
      formData.append('files', this.selectedName);
      this.hmsDataService.sendFormData(FeeGuideApi.importFeeguideDataUrl, formData).subscribe(data => {
        if (data.hmsMessage.messageShort == "RECORD_UPDATED_SUCCESSFULLY") {
          this.toastrService.success("Document Uploaded successfully")
          this.showtableLoader = false
          this.selectedName = ''
          this.ViewProcIdDetails(true);
        }
        else if (data.hmsMessage.messageShort == "INVALID_DATA") {
          this.showtableLoader = false
          const url = data.result;
          this.showLoader = false
          const a = document.createElement('a');
          a.href = url;
          a.download = 'fghfh_' + this.changeDateFormatService.getCurrentTimestamp(new Date());
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
          }, 0)
          this.toastrService.error("INVALID DATA")
        }
        else if (data.hmsMessage.messageShort == "EMPTY_FILE_CAN'T_BE_UPLOADED.") {
          this.toastrService.error("Empty File Can't Be Uploaded.")
          this.showtableLoader = false
        }
        else {
          this.toastrService.error("Document can't be Uploaded")
          this.showtableLoader = false
        }
      })
    }
  }
  
  /* enter key pressed inside input field for addMode*/
  onEnterSaveInfo(id) {
    this.SaveInfo(0).then(row => {
      this.AddNew();
    });
  }

  /* enter key pressed inside input field */
  OnEnterPress(idx, dataRow, updateOnEnter) {
    this.dateFormate = true
    this.UpdateInfo(dataRow, idx, 0).then(row => {
      this.AddNew();
    });
  }

  onUp(idx, dataRow, columnId) {
    if (this.addNewRecord == false) {
      /* prevent API multiple hits on first row (start)*/
      var self = this
      $(document).on('click', '#view-Dental-FeeGuide .view-dntal-tb td:not(:last-child)', function () {
        var table = $('#view-Dental-FeeGuide').DataTable();
        var tr = $(this).closest("tr");
        self.row_index = tr.index();
      })/* prevent API multiple hits on first row (ends)*/
      if (this.row_index != 0) { /* prevents arrow up functionality on first row */
        this.dateFormate = true;
        this.UpdateInfo(dataRow, idx, 1).then(row => {
          if (idx == 0) {
            var index = 0;
            this.EditInfo(this.arrData[0], 0, false)
          }
          else {
            var index = idx - 1;
            this.CancelInfo(idx, dataRow, 0)
          }
          var dataRowValue = this.arrData[index]
          this.EditInfo(dataRowValue, index, false).then(row => {
            setTimeout(() => {
              var txtPro = <HTMLInputElement>document.getElementById(columnId + index);
              if (txtPro != null) {
                if (columnId == 'effectiveOn') {
                  this.mydp.setFocusToInputBox(); /* sets focus on effective date input field inside date-picker */
                }
                else if (columnId == 'expiredOn') {
                  this.mydp1.setFocusToInputBox(); /* sets focus on expiry date input field inside date-picker(visible during runtime)*/
                }
                txtPro.focus();
              }
            }, 300);
          });
          this.editMode = false;
        });
      } else {
        return false;
      }
    }
  }

  onDown(idx, dataRow, columnId) {
    this.defaultPageSize = Constants.viewDentalFeeGuideOptionsConfig.pageLength /*count of total entries on single page*/
    var lastRowElement = this.defaultPageSize - 1;
    if (this.addNewRecord == false) {
      var self = this
      $(document).on('click', '#view-Dental-FeeGuide .view-dntal-tb td:not(:last-child)', function () {
        var table = $('#view-Dental-FeeGuide').DataTable();
        var tr = $(this).closest("tr");
        self.row_index = tr.index();
      })
    }
    if (this.row_index == 0) {
      this.row_index = 1//arrow down from first line
    }
    if (lastRowElement != this.row_index) {
      this.dateFormate = true;
      this.UpdateInfo(dataRow, idx, 1).then(row => {
        var claimItemTotalLength = this.arrData.length;
        var lastClaimItem = idx + 1;
        if (claimItemTotalLength == lastClaimItem) {
          this.EditInfo(this.arrData[idx], idx, false).then(row => {
            setTimeout(() => {
              var txtPro = <HTMLInputElement>document.getElementById(columnId + idx);
              if (txtPro != null) {
                if (columnId == 'effectiveOn') {
                  this.mydp.setFocusToInputBox();
                }
                else if (columnId == 'expiredOn') {
                  this.mydp1.setFocusToInputBox();
                }
                txtPro.focus();
              }
            }, 200);
          });
        } else {
          var index = parseInt(idx) + 1;
          var dataRowValue = this.arrData[index];
          this.oldRowIndx = index;
          this.EditInfo(dataRowValue, index, false).then(row => {
            setTimeout(() => {
              var txtPro = <HTMLInputElement>document.getElementById(columnId + index);
              if (txtPro != null) {
                if (columnId == 'effectiveOn') {
                  this.mydp.setFocusToInputBox();
                }
                else if (columnId == 'expiredOn') {
                  this.mydp1.setFocusToInputBox();
                }
                txtPro.focus();
              }
            }, 100);
          });
        }
        this.editMode = false;
      });
    } else {
      return false
    }
  }

  onDownAddMode(columnId) {
    var index = 0
    if (this.arrData.length > 0) {
      if (this.arrNewRow.effectiveOn) {
        this.arrNewRow.effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn);
        this.DateObjectToString = false
      }
      else if (this.arrNewRow.expiredOn) {
        this.arrNewRow.expiredOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn);
        this.DateObjectToString = false
      }
      this.newRecordValidate = true;
      if (this.validateAllFields(this.arrNewRow)) {
        this.SaveInfo(id).then(row => {
          if (this.preventNextRowEditMode == false) {
            this.EditInfo(this.arrData[index], index, false).then(row => {
              setTimeout(() => {
                var txtPro = <HTMLInputElement>document.getElementById(columnId + index);
                if (txtPro != null) {
                  if (columnId == 'effectiveOn') {
                    this.mydp.setFocusToInputBox();
                  }
                  else if (columnId == 'expiredOn') {
                    this.mydp1.setFocusToInputBox();
                  }
                  txtPro.focus();
                }
              }, 200);
            });
          }
          else {
            return false;
          }
        })
      }
    } else {
      return false;
    }
  }

  onUpAddMode(columnId) { }

  firstRowClickedData(data, index) {

    this.firstRowData = data
    if (this.dateFormate != false) {
      this.arrData[index].effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.firstRowData.effectiveOn);
      this.arrData[index].expiredOn = this.changeDateFormatService.convertDateObjectToString(this.firstRowData.expiredOn);
    }
    if (this.oldRowIndx != index) {
      this.indexCheck = true
    }
    else {
      this.indexCheck = false
    }
    this.oldRowIndx = index
    if (this.indexCheck) {
      this.EditInfo(this.firstRowData, this.oldRowIndx, true)
    }
  }

  rowData(data, index) {
    this.dateFormate = true;
    this.secondRowData = data;
    this.UpdateInfo(this.firstRowData, this.oldRowIndx, 0).then(row => {
      this.EditInfo(this.secondRowData, index, true)
      this.firstRowData = this.secondRowData
      this.oldRowIndx = index
      this.secondRowData = ''
    });
  }

  downloadFile() {
    this.hmsDataService.getApi(FeeGuideApi.findAllProcedurePathUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        const url = data.result;
        this.showLoader = false
        const a = document.createElement('a');
        a.download = 'Fee_Guide_Sample_' + this.changeDateFormatService.getCurrentTimestamp(new Date());
        a.href = url;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 0)
      } else {
        this.toastrService.error('Fee Guide Sample File Not Generated Successfully!!')
        this.showLoader = false
      }
    })
  }

  onBlur(event) {
    if (this.procID) {
      if (this.procID.length > 5) {
        this.toastrService.error("Procedure ID is greater than allowed length")
      }
    }
  }

  onIndividualRadioButtonChange() {
    setTimeout(function () {
      var procId2 = <HTMLSelectElement>document.getElementById('dfg_gProcCode');
      if (procId2 != null) {
        procId2.focus();
      }
    }, 200);
  }
  onFeeRadioButtonChange() {
    setTimeout(function () {
      var procId3 = <HTMLSelectElement>document.getElementById('dfg_perc');
      if (procId3 != null) {
        procId3.focus();
      }
    }, 200);
  }

  setElementFocus(e1) {
    var self = this
    setTimeout(() => {
      self[e1].nativeElement.focus();
    }, 200);
  }

  onBlur1(frmControlName, event) {
    if (frmControlName == 'updateprocedure_code') {
      let span = document.getElementById('procId');
      let row = span.getElementsByTagName('span')
      let arr = Array.prototype.slice.call(row)
      arr.forEach(element => {
        element.tabIndex = -1;
      });
    }
  }

  exportFeeguide() {
    var feeguideURL = FeeGuideApi.exportProcedureFeeListByFeeGuideKeyAndSearchKeywords;
    var dialogMsg;
    var requestedData = {
      "dentFeeGuideKey": +this.FeeGuideId,
      "dentalProcedureKey": this.arrSearch.procId,
      "dentalProcedureFeeAmt": this.arrSearch.procFeeAmt,
      "dentalProcedureLabFeeAmt": this.arrSearch.procLabAmt,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.arrSearch.effDate),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.arrSearch.expDate),
      "start": 0,
      "paramApplication": "HMS",
      "length": this.arrData.length
    }

    if (this.arrData.length > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.arrData.length > this.currentUserService.minLengthForExcel && this.arrData.length <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.arrData.length > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.arrData.length > this.currentUserService.maxLengthForExcel) {
            this.exportFile(feeguideURL, requestedData)
          } else {
            this.exportFile(feeguideURL, requestedData)
          }
        }
      });
    } else {
      this.exportFile(feeguideURL, requestedData)
    }
  }

  /**
   * Api call for export the company list
   * @param URL 
   * @param reqParamPlan 
   */
  exportFile(URL, reqParamPlan) {
    this.showLoader = false
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataServiceService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loaderPlaceHolder = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loaderPlaceHolder = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataServiceService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.getCurrentTimestamp(new Date())
          a.download = "feeGuide" + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else { }
    })
  }
}