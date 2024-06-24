import { Component, OnInit, Output, Input, EventEmitter, HostListener, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { ServiceProviderApi } from '../../service-provider-module/service-provider-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Rx';
import { FeeGuideApi } from '../fee-guide-api';
import { TranslateService } from '@ngx-translate/core';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { FeeGuideService } from './../fee-guide.service'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-dental-fee-guide',
  templateUrl: './dental-fee-guide.component.html',
  styleUrls: ['./dental-fee-guide.component.css'],
  providers: [DatatableService, ChangeDateFormatService, FeeGuideService]

})

export class DentalFeeGuideComponent implements OnInit {
  searchedProvinceId: any;
  searchedscheduleSelectedId: any;
  feeGuideNameL: any;
  schedNameL = [];
  effectiveOnL: any;
  provinceNameL = [];
  existingDate: any;
  selectedYear: any;
  provinceCodesDataRemote: RemoteData;
  scheduleItemsDataRemote: RemoteData;
  showLoad: boolean;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  public filterFeeGuideSearch: FormGroup;
  showSearchTable1: boolean = false
  showEffDate;
  searchedProvinceName;
  searchedscheduleSelected
  selectedDentalSpec;
  selectedProvinceName;
  selectedEffectiveDate;
  dentFeeValue: any;
  selectedPredictiveValue: any;
  arrPredictiveFeeGuideList: any;
  arrProcedureCodeList: any;
  feeGuideNameRemoteData: RemoteData;
  showLoader = false;
  reloadTable = false

  @Output() selectedPredictiveKey = new EventEmitter();

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public predictiveFeeGuideData: CompleterData;
  public procedureCodeData: CompleterData;
  FormGroup: FormGroup;
  viewDentalFormGroup: FormGroup;
  addDentalFormGroup: FormGroup;
  ObservableClaimObj;
  checkBan: boolean = true
  columns = []
  yearList = [];
  dateNameArray = {}
  scheduleItems = []
  procedureCodeItems = []
  itemStart = 0
  feeGuideItemStart = 0
  procedureItemStart = 0
  selectedradioValue: boolean = true
  selectedradioValue1: boolean = false
  provinceCodes = []
  dropdownSettings = {}
  multiSelectDropdownSettings = {}
  checkModify: boolean = false
  editMode: boolean = false
  effectiveDate = [];
  schedule
  province
  columnSchedule
  columnProvince
  scheduleColumn
  dentFeeGuideName
  isChecked
  effectiveOn
  scheduleandFeeguideColumn
  ProvinceColumn
  columnScheduleItems = []
  scheduleandFeeguideItems = []
  columnProvinceItems = []
  currentUser: any;
  scheduleSelected
  provinceSelected
  procedureCodeSelected = []
  procedure_code
  dentFeeGuideSchedKey
  scheduleandFeeguide
  provinceName

  DentalFeeGuideList = [{
    "addNew": 'F',
    "dentalFeeGuideList": 'F',
    "viewProcCode": 'F'
  }]

  constructor(
    private router: Router,
    public dataTableService: DatatableService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private feeGuideService: FeeGuideService,
    private completerService: CompleterService,
    private toastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private renderer: Renderer2
  ) {// Predictive Search for FeeGuide ProvinceName    
    this.feeGuideNameRemoteData = this.completerService.remote(
      null,
      "dentFeeGuideName",
      "dentFeeGuideName"
    );
    this.feeGuideNameRemoteData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.feeGuideNameRemoteData.urlFormater((term: any) => {
      return FeeGuideApi.getPredictiveFeeGuideByNameUrl + `/${term}`;
    });
    this.feeGuideNameRemoteData.dataField('result');
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
  }

  ngOnInit() {
    this.showLoad = true; // To show loader until the menu appears
    this.ObservableClaimObj = Observable.interval(2000).subscribe(x => {
      this.currentUserService.showLoading.subscribe(val => {
        if (val) {
          this.showLoad = false
        }
      });
    })
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let DentalFeeGuideArray = this.currentUserService.authChecks['PSF']
        DentalFeeGuideArray.push()
        this.getAuthCheck(DentalFeeGuideArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let DentalFeeGuideArray = this.currentUserService.authChecks['PSF']
        DentalFeeGuideArray.push()
        this.getAuthCheck(DentalFeeGuideArray)
        this.dataTableInitialize();
      })
    }

    this.addDentalFormGroup = this.fb.group({
      Dental_feeGuide: [''],
      effectiveDate: [''],
      year: [''],
      sorp: [''],
      province: [''],
      schedule: [''],
      effectiveOn: ['', Validators.required],
      feeGuideName: ['', [Validators.required, Validators.maxLength(50), CustomValidators.onlyAlphabets, CustomValidators.notEmpty]],
      modifyFeeGuide: [''],
      procedure_code: [''],
      modifyFeeAmount: [''],
      modifyLabAmount: [''],
      modifyFee: [''],
      modifyLab: [''],
      scheduleandFeeguideControl: ['']
    })
    this.viewDentalFormGroup = this.fb.group({
      feeGuideName: [''],
      schedule: [''],
      province: [''],
      effective_on: ['']
    })

    this.FormGroup = this.fb.group({
      bussArrNo: [''],
      bankAccNo: [''],
      disciplineType: [null],
    })

    this.updateSchedule()
    this.addDentalFormGroup.patchValue({ 'Dental_feeGuide': 'blank' })
    this.radioSelected('blank')
    if (this.selectedradioValue) {
      this.addDentalFormGroup.controls['sorp'].disable()
    }
    this.getYearList();
    var self = this;

    setTimeout(() => {
      self.renderer.selectRootElement('#searchScheduleFeeGuide').focus();
    }, 1000);
    $(document).on('keydown', '#search-Dental-FeeGuide .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
    this.filterFeeGuideSearch = this.fb.group({
      feeGuideName: [''],
      scheduleName: [''],
      provinceSearch: [''],
      effectiveOn: [''],
    })
  }

  dataTableInitialize() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: this.translate.instant('feeGuide.dentalFeeGuide.fee-name'), data: 'dentFeeGuideName' },
          { title: this.translate.instant('feeGuide.dentalFeeGuide.schedule'), data: 'dentFeeGuideSchedName' },
          { title: this.translate.instant('feeGuide.dentalFeeGuide.province'), data: 'provinceName' },
          { title: this.translate.instant('feeGuide.dentalFeeGuide.effective-date'), data: 'effectiveOn' },
        ]
        this.checkBan = false;
        this.ObservableClaimObj.unsubscribe();
        this.getFeeGuideList()
        this.dropdownSettings = Constants.angular2Multiselect
        this.multiSelectDropdownSettings = Constants.multiSelectBatchDropdown;
        this.getProvince()
      }
    });
  }

  getAuthCheck(DentalFeeGuideArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.DentalFeeGuideList = [{
        "addNew": 'T',
        "dentalFeeGuideList": 'T',
        "viewProcCode": 'T'
      }]
    } else {
      for (var i = 0; i < DentalFeeGuideArray.length; i++) {
        userAuthCheck[DentalFeeGuideArray[i].actionObjectDataTag] = DentalFeeGuideArray[i].actionAccess
      }

      this.DentalFeeGuideList = [{
        "addNew": userAuthCheck['PSF203'],
        "dentalFeeGuideList": userAuthCheck['PSF202'],
        "viewProcCode": userAuthCheck['LPS204'],
      }]
    }
    return this.DentalFeeGuideList
  }

  // Get Procedure Code based on Effective Date 
  onChangeEffDate(event) {
    if (event) {
      this.selectedPredictiveValue = this.addDentalFormGroup.value.effectiveDate
      this.procedureItemStart = 0
      this.procedureCodeItems = []
      this.getFeeGuideProcedureCodeList()
    }
  }

  onPredictivefeeGuideSelected(selected: CompleterItem, type) {
    if (type == 'scheduleName') {
      if (selected) {
        this.searchedscheduleSelected = selected.originalObject.dentFeeGuideSchedDesc;
        this.searchedscheduleSelectedId = selected.originalObject.dentFeeGuideSchedKey
      }
      else {
        this.searchedscheduleSelected = '';
        this.searchedscheduleSelectedId = '';
      }
    }
    if (type == 'provinceSearch') {
      if (selected) {
        this.searchedProvinceName = selected.originalObject.provinceName
        this.searchedProvinceId = selected.originalObject.provinceKey
      }
      else {
        this.searchedProvinceName = '';
        this.searchedProvinceId = ''
      }
    }

    if (type == 'sorp') {
      this.scheduleandFeeguideItems = []
      if (selected) {
        this.feeGuideItemStart = 0
        this.scheduleandFeeguide = []
        this.scheduleandFeeguideItems = []
        this.selectedPredictiveValue = selected.originalObject.dentFeeGuideKey;
        this.selectedEffectiveDate = selected.originalObject.effectiveOn;
        this.selectedDentalSpec = selected.originalObject.dentFeeGuideSchedName;
        this.selectedProvinceName = selected.originalObject.provinceName
        this.getMergedScheduleName();
      }
      else {
        this.selectedPredictiveValue = '';
        this.selectedEffectiveDate = '';
        this.selectedDentalSpec = '';
      }
    }
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

  // Get Predictive Search ProcedureCode List on the basis of Key
  getFeeGuideProcedureCodeList() {
    var data = {
      "dentFeeGuideKey": this.selectedPredictiveValue,
      "start": this.procedureItemStart,
      "length": 5,
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalProcedureFeeListByFeeGuideKeyUrl, data).subscribe(data => {
      if (data.hmsMessage.messageShort != "RECORD_NOT_FOUND") {
        for (var i = 0; i < data.result.length; i++) {
          this.procedureCodeItems.push({ 'id': data.result[i].dentalProcedureFeeKey, 'itemName': data.result[i].dentalProcedureId })
        }
        this.procedureCodeSelected = []
        this.getProcedureCodeaccToFeeGuideKey();
      }
    })
    this.procedureItemStart = this.procedureItemStart + 1
  }

  ngAfterViewInit() {
    var self = this
    $(document).find("#loadOnScroll ul").on('scroll', function () {
      self.updateSchedule()
    })

    $(document).find("#loadOnScrollFeeGuide ul").on('scroll', function () {
      self.getMergedScheduleName()
    })

    $(document).find("#procedureCodeScroll ul").on('scroll', function () {
      self.getFeeGuideProcedureCodeList()
    })
  }

  changeDateFormat(event, frmControlName, formName, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.addDentalFormGroup.patchValue(datePickerValue);
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
      if (formName == 'addDentalFormGroup') {
        this.addDentalFormGroup.patchValue(datePickerValue);
      }
      else if (formName == 'filterFeeGuideSearch') {
        this.filterFeeGuideSearch.patchValue(datePickerValue);
      }
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

  getYearList() {
    this.feeGuideService.getYearList().then(res => {
      this.yearList = this.feeGuideService.yearList
    })
  }

  getFeeGuideList() {
    var reqParam = []
    var url = FeeGuideApi.getDentalFeeGuideListUrl
    var tableId = "search-Dental-FeeGuide"
    if (!$.fn.dataTable.isDataTable('#search-Dental-FeeGuide')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, 25, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, 3, this.DentalFeeGuideList[0].viewProcCode)
    } else {

      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');

    return false;
  }

  getDentalFeeGuideListByGridFilteration(tableId) {
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var url = FeeGuideApi.getDentalFeeGuideListUrl
    this.dataTableService.jqueryDataTableReload(tableId, url, params)
  }

  resetAddForm() {
    // #1224 Below 3 lines are to clear validations when form closed to correct validation working.
    this.addDentalFormGroup.controls['schedule'].clearValidators();
    this.addDentalFormGroup.controls['province'].clearValidators();
    this.addDentalFormGroup.controls['year'].clearValidators();

    this.effectiveDate = []
    this.scheduleandFeeguide = []
    this.selectedProvinceName = ''
    this.checkModify = false
    this.addDentalFormGroup.reset();
    this.selectedEffectiveDate = '';
    this.selectedradioValue1 = false
    this.scheduleandFeeguideItems = []
    this.scheduleandFeeguideColumn = ''
    this.selectedDentalSpec = '';
    this.selectedradioValue = false;
    this.addDentalFormGroup.clearValidators();
    this.addDentalFormGroup.controls['Dental_feeGuide'].setValue("");
    this.addDentalFormGroup.patchValue({ 'Dental_feeGuide': 'blank' });
    this.addDentalFormGroup.controls['year'].enable();
    this.addDentalFormGroup.controls['effectiveDate'].enable();
    this.addDentalFormGroup.controls['effectiveDate'].setValue('');
    this.addDentalFormGroup.controls['sorp'].disable();
    this.addDentalFormGroup.controls['year'].setValue("");

    this.addDentalFormGroup.controls['modifyLab'].setValue("");
    this.addDentalFormGroup.controls['modifyFee'].setValue("");
    this.procedure_code = [];
    this.procedureCodeItems = [];
    this.province = [];
    this.schedule = [];

    this.addDentalFormGroup.controls['modifyFee'].clearValidators();
    this.addDentalFormGroup.controls['modifyFee'].updateValueAndValidity();
    this.addDentalFormGroup.controls['modifyLab'].clearValidators();
    this.addDentalFormGroup.controls['modifyLab'].updateValueAndValidity();
    this.procedureCodeSelected = []
    this.addDentalFormGroup.controls['year'].setValue("");
    this.itemStart = 0;
    this.columnScheduleItems = []
    this.procedureItemStart = 0;
    this.updateSchedule();
  }

  saveDentalDetails() {
    // #1224 Below 4 lines are to validate fields when save button pressed to correct validation working.
    this.addDentalFormGroup.controls['schedule'].setValidators(Validators.required)
    this.addDentalFormGroup.controls['schedule'].updateValueAndValidity()
    this.addDentalFormGroup.controls['province'].setValidators(Validators.required)
    this.addDentalFormGroup.controls['province'].updateValueAndValidity()
    this.checkModifyMethod();
    this.updatingRequiredField();
    if (this.addDentalFormGroup.valid) {
      var requestedData
      this.showLoader = true
      if (this.addDentalFormGroup.value.Dental_feeGuide == 'feeguide') {
        var feeAmountRadioButtonValue
        var LabAmountRadioButtonValue
        if (this.addDentalFormGroup.value.modifyFeeAmount == 'Flat') {
          feeAmountRadioButtonValue = 'F';
        }
        else if (this.addDentalFormGroup.value.modifyFeeAmount == 'Percent') {
          feeAmountRadioButtonValue = 'P';
        }
        if (this.addDentalFormGroup.value.modifyLabAmount == 'Flat') {
          LabAmountRadioButtonValue = 'F';
        }
        else if (this.addDentalFormGroup.value.modifyLabAmount == 'Percent') {
          LabAmountRadioButtonValue = 'P';
        }
        if (this.checkModify) {
          requestedData =
          {
            "dentFeeGuideKey": +this.addDentalFormGroup.value.effectiveDate,
            "dentFeeGuideName": this.addDentalFormGroup.value.feeGuideName,
            "dentFeeGuideSchedKey": +this.scheduleSelected,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalFormGroup.value.effectiveOn),
            "provinceKey": +this.provinceSelected,
            "modifyProcedureFee": this.addDentalFormGroup.value.modifyFeeGuide ? 'T' : 'F',
            "dentalProcedureFeeKeys": this.procedureCodeSelected,
            "dentalProcedureFeeAmt": this.addDentalFormGroup.value.modifyFee,
            "dentalProcedureLabFeeAmt": this.addDentalFormGroup.value.modifyLab,
            "feeFlat": feeAmountRadioButtonValue,
            "labFlat": LabAmountRadioButtonValue
          }
        }
        else {
          requestedData =
          {
            "dentFeeGuideKey": +this.addDentalFormGroup.value.effectiveDate,
            "dentFeeGuideName": this.addDentalFormGroup.value.feeGuideName,
            "dentFeeGuideSchedKey": +this.scheduleSelected,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalFormGroup.value.effectiveOn),
            "provinceKey": +this.provinceSelected,
            "modifyProcedureFee": this.addDentalFormGroup.value.modifyFeeGuide ? 'T' : 'F',
          }
        }
        this.hmsDataService.postApi(FeeGuideApi.saveFeeGuideFromUsclsUrl, requestedData).subscribe(
          data => {
            if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this.showLoader = false;
              this.reloadTable = true;
              this.hmsDataService.OpenCloseModal('dfgm_reset')
              this.toastrService.success(this.translate.instant('feeGuide.toaster.feeGuideAddedSuccess'));
              this.hmsDataService.OpenCloseModal('dfgm_reset')
              this.router.navigate(["/feeGuide/view/" + data.result.dentFeeGuideKey])
            }
            else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
              this.showLoader = false
              this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideNotAdded'));
            }
            else if (data.code == 400 && data.hmsMessage.messageShort == "RECORD_SAVE_FAILED") {
              this.showLoader = false
              this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideNotAdd'));
            }
          }
        )
      }
      else if (this.addDentalFormGroup.value.Dental_feeGuide == 'blank') {
        requestedData =
        {
          "selectedFeeGuideKey": 0,
          "dentFeeGuideName": this.addDentalFormGroup.value.feeGuideName,
          "dentFeeGuideSchedKey": +this.scheduleSelected,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalFormGroup.value.effectiveOn),
          "provinceKey": +this.provinceSelected,
          "modifyProcedureFee": 'F',
        }
        this.hmsDataService.postApi(FeeGuideApi.saveDentalFeeGuideUrl, requestedData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.showLoader = false
            this.reloadTable = true;
            this.scheduleandFeeguideColumn = ''
            this.selectedPredictiveValue = ''
            var saveDentalDetails = data.result;
            this.hmsDataService.OpenCloseModal('dfgm_reset')
            this.toastrService.success(this.translate.instant('feeGuide.toaster.feeGuideAddSuccess'));
            this.router.navigate(["/feeGuide/view/" + data.result.dentFeeGuideKey])
          }
          else if (data.code == 404 && data.message == "RECORD_NOT_FOUND") {
            this.showLoader = false
            this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideNotAdded'));
          }
          else if (data.code == 400 && data.message == "RECORD_SAVE_FAILED") {
            this.showLoader = false
            this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideNotAdded'));
          }
          else {
            this.showLoader = false
            this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideNotAdded'));
          }
        }
        )
      }
      else {
        requestedData =
        {
          "selectedFeeGuideKey": this.scheduleandFeeguideColumn,//
          "modifyFeeGuideDto": {
            "dentalProcedureKeyList": this.procedureCodeSelected,
            "modifyFeeAmountType": this.addDentalFormGroup.value.modifyFeeAmount, //"Flat",
            "modifyFeeAmount": this.addDentalFormGroup.value.modifyFee,
            "modifyLabAmountType": this.addDentalFormGroup.value.modifyLabAmount, //"Percent",
            "modifyLabAmount": this.addDentalFormGroup.value.modifyLab
          },
          "dentFeeGuideName": this.addDentalFormGroup.value.feeGuideName,
          "dentFeeGuideSchedKey": this.scheduleSelected,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalFormGroup.value.effectiveOn),
          "provinceKey": this.provinceSelected,
        }
        this.hmsDataService.postApi(FeeGuideApi.saveDentalFeeGuideUrl, requestedData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.showLoader = false
            this.scheduleandFeeguideColumn = ''
            this.selectedProvinceName = ''
            this.reloadTable = true;
            this.router.navigate(["/feeGuide/view/" + data.result.dentFeeGuideKey])
            var saveDentalDetails = data.result;
            this.hmsDataService.OpenCloseModal('dfgm_reset')
            this.toastrService.success(this.translate.instant('feeGuide.toaster.feeGuideAddSuccess'));
          }
          else if (data.code == 404 && data.message == "RECORD_NOT_FOUND") {
            this.showLoader = false
            this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideNotAdded'));
          }
          else {
            this.showLoader = false
            this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideNotAdded'));
          }
        }
        )
      }
    }
    else {
      this.validateAllFormFields(this.addDentalFormGroup);
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

  //checks if the modify fee guide is checked.
  changeFeeGuide(event: any) {
    if (event == 'checked') {
      this.checkModify = true
      this.addDentalFormGroup.patchValue({ 'modifyFeeAmount': 'Flat' })
      this.addDentalFormGroup.patchValue({ 'modifyLabAmount': 'Flat' })
      this.procedureCodeSelected = []
      this.checkModifyMethod()
      this.procedureCodeSelected = []
      this.getProcedureCodeaccToFeeGuideKey()
    }
    else {
      this.checkModify = false
      this.checkModifyMethod()
    }
  }

  updateSchedule() {
    var RequestedData = {
      "start": this.itemStart,
      "length": 13
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalFeeGuideScheduleListUrl, RequestedData).subscribe(data => {
      if (data.status != "NOT_FOUND") {
        for (var i = 0; i < data.result.length; i++) {
          this.scheduleItems.push({ 'id': data.result[i].dentFeeGuideSchedKey, 'itemName': data.result[i].dentFeeGuideSchedDesc })
          this.columnScheduleItems.push({ 'id': data.result[i].dentFeeGuideSchedKey, 'itemName': data.result[i].dentFeeGuideSchedDesc })
        }
      }
    })
    this.itemStart = this.itemStart + 1
  }

  getProvince() {
    this.hmsDataService.getApi(FeeGuideApi.getProvinceListUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.provinceCodes.push({ 'id': data.result[i].provinceKey, 'itemName': data.result[i].provinceName })
          this.columnProvinceItems.push({ 'id': data.result[i].provinceKey, 'itemName': data.result[i].provinceName })
        }
      }
    })
  }

  checkModifyMethod() {
    if (this.checkModify) {
      this.addDentalFormGroup.controls['modifyFeeAmount'].setValidators(Validators.required);
      this.addDentalFormGroup.controls['modifyFeeAmount'].updateValueAndValidity()

      this.addDentalFormGroup.controls['modifyLabAmount'].setValidators(Validators.required);
      this.addDentalFormGroup.controls['modifyLabAmount'].updateValueAndValidity()
      this.checkModifyFee();
    }
    else {
      this.addDentalFormGroup.controls['modifyFeeAmount'].clearValidators();
      this.addDentalFormGroup.controls['modifyFeeAmount'].updateValueAndValidity()

      this.addDentalFormGroup.controls['modifyLabAmount'].clearValidators();
      this.addDentalFormGroup.controls['modifyLabAmount'].updateValueAndValidity()

      this.addDentalFormGroup.controls['modifyFee'].clearValidators();
      this.addDentalFormGroup.controls['modifyFee'].updateValueAndValidity()

      this.addDentalFormGroup.controls['modifyLab'].clearValidators();
      this.addDentalFormGroup.controls['modifyLab'].updateValueAndValidity()
      this.addDentalFormGroup.controls['modifyLab'].setValue("");
      this.addDentalFormGroup.controls['modifyFee'].setValue("");
      this.procedure_code = [];
      this.procedureCodeSelected = []
    }
  }

  radioSelected(value) {
    var self = this
    if (value == 'feeguide') {
      setTimeout(() => {
        this.renderer.selectRootElement('#dfgm_year').focus();
      }, 1000);
      this.procedureCodeItems = []
      this.procedure_code = []
      this.selectedPredictiveValue = ''
      this.effectiveDate = [];
      this.scheduleandFeeguideItems = []
      this.scheduleandFeeguide = []
      this.selectedradioValue = true
      this.selectedradioValue1 = false
      this.selectedEffectiveDate = '';
      this.selectedDentalSpec = '';
      this.addDentalFormGroup.controls['year'].setValue(this.yearList[0]);
    }
    else if (value == 'province') {
      setTimeout(() => {
        this.renderer.selectRootElement('#feeGuideProvince').focus();
      }, 1000);
      this.feeGuideItemStart = 0
      this.procedureCodeItems = []
      this.procedure_code = []
      this.selectedPredictiveValue = ''
      this.selectedradioValue = false
      this.selectedradioValue1 = false
    }
    else {
      this.procedureCodeItems = []
      this.procedure_code = []
      this.selectedPredictiveValue = ''
      this.scheduleandFeeguideItems = []
      this.scheduleandFeeguide = []
      this.selectedradioValue = false
      this.selectedradioValue1 = true
      this.addDentalFormGroup.controls['year'].disable();
      this.addDentalFormGroup.controls['effectiveDate'].disable()
      this.addDentalFormGroup.controls['sorp'].disable()
    }
    this.updatingRequiredField()
  }

  updatingRequiredField() {
    if (this.selectedradioValue == true && this.selectedradioValue1 == false) {
      this.addDentalFormGroup.controls['effectiveDate'].setValidators(Validators.required);
      this.addDentalFormGroup.controls['effectiveDate'].updateValueAndValidity()
      this.addDentalFormGroup.controls['sorp'].clearValidators();
      this.addDentalFormGroup.controls['sorp'].updateValueAndValidity()
      this.addDentalFormGroup.controls['sorp'].reset()
      this.addDentalFormGroup.controls['scheduleandFeeguideControl'].clearValidators();
      this.addDentalFormGroup.controls['scheduleandFeeguideControl'].updateValueAndValidity()
      this.addDentalFormGroup.controls['scheduleandFeeguideControl'].reset()
      this.addDentalFormGroup.controls['year'].enable();
      this.addDentalFormGroup.controls['effectiveDate'].enable()
      this.addDentalFormGroup.controls['sorp'].disable()
    }
    else if (this.selectedradioValue1 == false && this.selectedradioValue == false) {
      this.addDentalFormGroup.controls['sorp'].enable()
      this.addDentalFormGroup.controls['year'].disable();
      this.addDentalFormGroup.controls['effectiveDate'].disable()
      this.addDentalFormGroup.controls['effectiveDate'].reset()
      this.addDentalFormGroup.controls['effectiveDate'].setValue("")
      this.addDentalFormGroup.controls['year'].reset()
      this.addDentalFormGroup.controls['year'].setValue("")
      this.addDentalFormGroup.controls['scheduleandFeeguideControl'].setValidators(Validators.required);
      this.addDentalFormGroup.controls['scheduleandFeeguideControl'].updateValueAndValidity()
      this.addDentalFormGroup.controls['year'].clearValidators();
      this.addDentalFormGroup.controls['year'].updateValueAndValidity()
      this.addDentalFormGroup.controls['effectiveDate'].clearValidators();
      this.addDentalFormGroup.controls['effectiveDate'].updateValueAndValidity()
    }
    else {
      this.addDentalFormGroup.controls['year'].disable();
      this.addDentalFormGroup.controls['effectiveDate'].disable()
      this.addDentalFormGroup.controls['effectiveDate'].reset()
      this.addDentalFormGroup.controls['effectiveDate'].setValue("")
      this.addDentalFormGroup.controls['year'].reset()
      this.addDentalFormGroup.controls['year'].setValue("")
      this.addDentalFormGroup.controls['sorp'].clearValidators();
      this.addDentalFormGroup.controls['sorp'].updateValueAndValidity();
      this.addDentalFormGroup.controls['sorp'].reset();
      this.addDentalFormGroup.controls['scheduleandFeeguideControl'].clearValidators();
      this.addDentalFormGroup.controls['scheduleandFeeguideControl'].updateValueAndValidity()
      this.addDentalFormGroup.controls['scheduleandFeeguideControl'].reset()
    }
  }

  onSelect(item: any, type) {
    if (type == 'schedule') {
      this.scheduleSelected = item.id
      this.addDentalFormGroup.controls[type].setValue(item.id);
    }
    if (type == 'province') {

      this.provinceSelected = item.value
      this.addDentalFormGroup.controls[type].setValue(item.id);
    }
    if (type == 'columnSchedule') {
      this.scheduleColumn = item.itemName
    }
    if (type == 'scheduleandFeeguide') {
      this.procedure_code = [];
      this.procedureCodeItems = [];
      this.scheduleandFeeguideColumn = item.id
      this.selectedPredictiveValue = +this.scheduleandFeeguideColumn
      this.procedureItemStart = 0
      this.getFeeGuideProcedureCodeList()
      this.procedureCodeSelected = []
      this.getProcedureCodeaccToFeeGuideKey()
    }
    if (type == 'columnProvince') {
      this.ProvinceColumn = item.itemName
    }
    if (type == 'procedure_code') {
      this.procedureCodeSelected = []
      for (var j = 0; j < this.procedure_code.length; j++) {
        this.procedureCodeSelected.push(this.procedure_code[j]['id'])
      }
      this.addDentalFormGroup.controls[type].setValue(this.procedureCodeSelected);
    }
  }

  onDeSelect(item: any, type) {
    if (type == 'schedule') {
      this.scheduleSelected = ''
      this.addDentalFormGroup.controls[type].setValue('');
    }

    if (type == 'province') {
      this.provinceSelected = ''
      this.addDentalFormGroup.controls[type].setValue('');
    }
    if (type == 'columnSchedule') {
      this.scheduleColumn = ''
    }
    if (type == 'scheduleandFeeguide') {
      this.scheduleandFeeguideColumn = ''
      this.procedure_code = []

    }
    if (type == 'columnProvince') {
      this.ProvinceColumn = ''
    }
    if (type == 'procedure_code') {
      this.procedureCodeSelected = []
      if (this.procedure_code.length > 0) {
        for (var j = 0; j < this.procedure_code.length; j++) {
          this.procedureCodeSelected.push(this.procedure_code[j]['id'])
        }
      }
    }
  }

  onSelectAll(items: any, type) {
    if (type == 'procedure_code') {
      this.procedureCodeSelected = []
      for (var i = 0; i < this.procedure_code.length; i++) {
        this.procedureCodeSelected.push(this.procedure_code[i]['id'])
      }
      this.addDentalFormGroup.controls[type].setValue(this.procedureCodeSelected);
    }
  }

  onDeSelectAll(items: any, type) {
    this.procedureCodeSelected = []
  }

  checkModifyFee() {
    if (this.addDentalFormGroup.controls['modifyFeeAmount'].value == 'Percent') {
      this.addDentalFormGroup.controls['modifyFee'].setValidators([CustomValidators.percValue, Validators.required]);
      this.addDentalFormGroup.controls['modifyFee'].updateValueAndValidity()
    }
    else {
      this.addDentalFormGroup.controls['modifyFee'].setValidators([Validators.required, CustomValidators.onlyNumbers])
      this.addDentalFormGroup.controls['modifyFee'].updateValueAndValidity()
    }
    if (this.addDentalFormGroup.controls['modifyLabAmount'].value == 'Percent') {
      this.addDentalFormGroup.controls['modifyLab'].setValidators([CustomValidators.percValue, Validators.required]);
      this.addDentalFormGroup.controls['modifyLab'].updateValueAndValidity()
    }
    else {
      this.addDentalFormGroup.controls['modifyLab'].setValidators([Validators.required, CustomValidators.onlyNumbers])
      this.addDentalFormGroup.controls['modifyLab'].updateValueAndValidity()
    }
  }

  //Column Filter for Dental Fee Guide dataTable
  getFeeGuideListByGridFilteration(tableId) {
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var selectedSchedule = this.scheduleColumn
    var selectedProvince = this.ProvinceColumn
    if (!this.scheduleColumn) {
      selectedSchedule = ""
    } if (!this.ProvinceColumn) {
      selectedProvince = ""
    }
    var scheduleParam = { 'key': 'dentFeeGuideSchedName', 'value': selectedSchedule }
    params.push(scheduleParam)
    var provinceParam = { 'key': 'provinceName', 'value': selectedProvince }
    params.push(provinceParam)
    var dateParams = [1]
    var url = FeeGuideApi.getDentalFeeGuideListUrl
    this.dataTableService.jqueryDataTableReload(tableId, url, params, dateParams)
  }

  feeAmountChanged() {
    this.checkModifyFee();//calls method to set validations as per the radio button selected 
  }

  selectedYearList(year) {
    this.feeGuideService.yearListValue(year).then(res => {
      this.effectiveDate = this.feeGuideService.effectiveDate
      this.addDentalFormGroup.controls['effectiveDate'].setValue('');
    })
  }

  getSelectedFeeGuide(feeGuideKey) {
    this.existingDate = this.effectiveDate.find(s => s.effectiveOn == feeGuideKey)
  }

  resetTableSearch() {
    this.dentFeeGuideSchedKey = []
    this.provinceName = []
    this.scheduleColumn = ""
    this.ProvinceColumn = ""
    this.dataTableService.resetTableSearch();
    this.getFeeGuideListByGridFilteration('search-Dental-FeeGuide')
  }

  setDefaultValue() {
    var self = this
    setTimeout(() => {
      this.renderer.selectRootElement('#scheduleFeeGuide').focus();
    }, 1000);
    this.selectedradioValue = false;
    this.radioSelected('blank')
    this.effectiveDate = []
  }
  /**Reload Table After Save the Add New Popup */
  reloadFeeGuideListTable() {
    if (this.reloadTable) {
      this.getFeeGuideList();
    }
  }

  onYearSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedYear = (selected.originalObject.year).toString();
      this.selectedYearList(this.selectedYear);
    }
    else {
      this.selectedYear = '';
    }
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getFeeGuideListByGridFilteration(tableId);
    }
  }

  getMergedScheduleName() {
    var RequestedData = {
      "provinceName": this.selectedProvinceName,
      "start": this.feeGuideItemStart,
      "length": 5
    }
    this.hmsDataService.postApi(FeeGuideApi.getScheduleAndFeeGuideUrl, RequestedData).subscribe(data => {
      if (data.hmsMessage.messageShort != "RECORD_NOT_FOUND") {
        for (var i = 0; i < data.result.length; i++) {
          this.scheduleandFeeguideItems.push({ 'id': data.result[i].dentFeeGuideKey, 'itemName': data.result[i].combineName })
        }
      }
    })
    this.feeGuideItemStart = this.feeGuideItemStart + 1
  }

  getProcedureCodeaccToFeeGuideKey() {
    this.procedure_code = [];
    for (var i = 0; i < this.procedureCodeItems.length; i++) {
      this.procedure_code.push({ 'id': this.procedureCodeItems[i]['id'], 'itemName': this.procedureCodeItems[i]['itemName'] })
      for (var j = 0; j < this.procedure_code.length; j++) {
        this.procedureCodeSelected.push(this.procedure_code[j]['id'])
      }
    }
  }

  resetAddDentalProcedureForm() { }

  getSearchForm() {
    this.showSearchTable1 = true
    this.getFeeGuideSearchList()
  }

  getFeeGuideSearchList() {
    var reqParam = [
      { 'key': 'dentFeeGuideName', 'value': this.filterFeeGuideSearch.value.feeGuideName },
      { 'key': 'dentFeeGuideSchedName', 'value': this.searchedscheduleSelected },
      { 'key': 'effectiveOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterFeeGuideSearch.value.effectiveOn) },
      { 'key': 'provinceName', 'value': this.searchedProvinceName },
    ]
    this.feeGuideNameL = this.filterFeeGuideSearch.value.feeGuideName
    this.effectiveOn = this.filterFeeGuideSearch.value.effectiveOn
    this.schedNameL = []
    this.provinceNameL = []
    if (this.effectiveOn) {
      this.dateNameArray["effectiveOn"] = {
        year: this.effectiveOn.date.year,
        month: this.effectiveOn.date.month,
        day: this.effectiveOn.date.day
      };
    }

    var url = FeeGuideApi.getDentalFeeGuideListUrl
    var tableId = "search-Dental-FeeGuide"
    if (!$.fn.dataTable.isDataTable('#search-Dental-FeeGuide')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, 25, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, 3)
    } else {

      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');

    return false;
  }

  resetFeeGuideTable() {
    this.searchedProvinceName = ''
    this.searchedscheduleSelected = ''
    this.searchedscheduleSelectedId = ''
    this.searchedProvinceName = ''
    this.searchedProvinceId = ''
    this.filterFeeGuideSearch.reset()
    this.showSearchTable1 = false
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }
  
  //To correct validation in copy to(Schedule) when form just opened.
  onFocusCopyToSchedule() {
    this.addDentalFormGroup.controls['schedule'].setValidators(Validators.required)
    this.addDentalFormGroup.controls['schedule'].updateValueAndValidity()
  }
  //To correct validation in copy to(Province) when form just opened.
  onFocusCopyToProvince() {
    this.addDentalFormGroup.controls['province'].setValidators(Validators.required)
    this.addDentalFormGroup.controls['province'].updateValueAndValidity()
  }
  //To correct validation when form just opened focus on province of copy from.
  onBlurCopyFromProvince() {
    this.addDentalFormGroup.controls['sorp'].setValidators(Validators.required)
    this.addDentalFormGroup.controls['sorp'].updateValueAndValidity()
  }
  //To correct validation when open focus on year of copy from.
  onBlurCopyFromUSCLS() {
    this.addDentalFormGroup.controls['year'].setValidators(Validators.required)
    this.addDentalFormGroup.controls['year'].updateValueAndValidity()
  }
}