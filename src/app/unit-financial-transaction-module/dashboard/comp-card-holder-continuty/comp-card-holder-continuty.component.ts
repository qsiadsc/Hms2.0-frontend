import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { UftApi } from '../../uft-api';
import { TranslateService } from '@ngx-translate/core';
import { MyDatePicker, IMyDpOptions } from 'mydatepicker';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
@Component({
  selector: 'app-comp-card-holder-continuty',
  templateUrl: './comp-card-holder-continuty.component.html',
  styleUrls: ['../dashboard.component.css']
})
export class CompCardHolderContinutyComponent implements OnInit {
  showPrimaryColors: boolean = false;
  showColors: boolean = false;
  typeForExcel: any;
  countOfCompanies: any = 0;
  totalCardHoldersDependent: any = 0;
  totalCardHoldersPrimary: any = 0;
  DependentCardholderColumns = [];
  primaryCardholderColumns = [];
  totalCompaniesColumns = [];
  error: any;
  firstDay: Date;
  totalCompaniesTab: boolean = true;
  primaryCardholderTab: boolean = true;
  dependentCardholderTab: boolean = true;
  columns = [];
  provinceList;
  ObservableObjDeptCard;
  ObservableDashboardObj;
  ObservableObjComp;
  ObservableObjPrimaryCard;
  selectedProvinceKey;
  selectedReferralOtherName;
  checkBan: boolean = true;
  showSearchTable: boolean = true;
  public isOpen: boolean = false;
  check: boolean;
  mainTableData: any;
  oldRequest = null
  showtableLoader: boolean = false;
  enableEffectiveDate: boolean = false;
  enableSoldDate: boolean = false;
  showCompanyTable: boolean = false;
  showPrimaryTable: boolean = false;
  showDependentTable: boolean = false;
  fromDateLabel: string;
  toDateLabel: string;
  dateTime: string;
  showLastUpdated: boolean = false;
  loaderPlaceHolder;
  docName;
  docType;
  selectedBusnsType: any;
  public company;
  public brokerName;
  public provinceName;
  public primaryCardholder;
  public dependentCardholder;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  public compCardholderData: FormGroup;
  public filterCompany: FormGroup;
  public brokerData: RemoteData;
  public provinceDataRemote: CompleterData;
  public businessTypeData: CompleterData;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  @Output() getCompTabData = new EventEmitter();
  @ViewChild('mydp') mydp: MyDatePicker;
  @ViewChild('mydpToDate') mydpToDate: MyDatePicker;
  uftCompanySearch: boolean = false;
  uftPrimaryCardholder: boolean = false;
  pcCompany
  pcCardholderName
  pcCountDependent
  dcCompany
  dcCardholderName
  dcCountDependent
  uftDependentCardholder: boolean = false
  constructor(
    private completerService: CompleterService,
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private translate: TranslateService,
    public currentUserService: CurrentUserService,
    private exDialog: ExDialog
  ) {
    this.error = { isError: false, errorMessage: '' };
    //Broker Predictive Search
    this.brokerData = completerService.remote(
      null,
      "brokerIdAndName",
      "brokerIdAndName"
    );
    this.brokerData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': this.currentUserService.token } });
    this.brokerData.urlFormater((term: any) => {
      return UftApi.getBrokerListForReferralTypeList + `/${term}`;
    });
    this.brokerData.dataField('result');
  }

  ngOnInit() {
    this.compCardholderData = new FormGroup({
      date: new FormControl(''),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      broker: new FormControl(''),
      provinceKey: new FormControl(''),
      cardCompBusinessType: new FormControl('')
    })
    this.filterCompany = new FormGroup({
      'company ': new FormControl(),
      'brokerName': new FormControl(),
      'provinceName': new FormControl(),
      'primaryCardholder': new FormControl(),
      'dependentCardholder': new FormControl(),
    });
    this.compCardholderData.patchValue({ date: 'ED' });
    this.enableDateField()
    var date = new Date();
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.compCardholderData.patchValue({ 'fromDate': this.changeDateFormatService.formatDateObject(this.firstDay), 'toDate': this.changeDateFormatService.getToday() });
    this.getProvinceList();
    this.getMainTableData('init', 'F')
    this.getBussinesType()
  }
  getBussinesType(): any {
    this.hmsDataService.getApi(UftApi.getBusinessTypeUrl).subscribe(data => {
      this.businessTypeData = this.completerService.local(
        data.result,
        "businessTypeDesc",
        "businessTypeDesc"
      );
    });
  }

  dataTableInitialize() {
    this.ObservableObjComp = Observable.interval(1000).subscribe(value => {
      if ('common.card-id' == this.translate.instant('common.card-id')) {
      } else {
        this.totalCompaniesColumns = [
          { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.companyNumName'), data: 'coNameAndNum' },
          { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.primaryBrokerName'), data: 'brokerName' }]
        this.ObservableObjComp.unsubscribe();
      }
    });
  }

  dataTableInitializePrimaryCardholder() {
    this.ObservableObjPrimaryCard = Observable.interval(1000).subscribe(value => {
      if ('common.card-id' == this.translate.instant('common.card-id')) {
      } else {
        this.primaryCardholderColumns = [
          { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.companyNumName'), data: 'companyNameAndId' },
          { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.cardholderName'), data: 'personFirstName' },
          { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.countDependent'), data: 'countDependent' }]
        this.ObservableObjPrimaryCard.unsubscribe();
      }
    });
  }

  dataTableInitializeDependentCardholder() {
    this.ObservableObjDeptCard = Observable.interval(1000).subscribe(value => {
      if ('common.card-id' == this.translate.instant('common.card-id')) {
      } else {
        this.DependentCardholderColumns = [
          { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.companyNumName'), data: 'companyNameAndId' },
          { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.cardholderName'), data: 'personFirstName' },
          { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.countDependent'), data: 'countDependent' }]
        this.ObservableObjDeptCard.unsubscribe();
      }
    });
  }

  getMainTableData(type, refresh): any {
    document.getElementById('uft_dashboardEffDate').focus
    if (this.compCardholderData.valid) {
      if (refresh != 'T') {
        this.showtableLoader = true
        this.showCompanyTable = false
        this.showPrimaryTable = false
        this.showDependentTable = false
      }
      if (this.oldRequest) {
        this.oldRequest.unsubscribe();
        this.oldRequest = null;
      }
      let searchData = {
        'rangeBetween': this.compCardholderData.value.date,
        'startDate': this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate),
        'endDate': this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate),
        'brokerName': this.compCardholderData.value.broker,
        'provinceName': this.compCardholderData.value.provinceKey,
        'businessType': 'Q'
      }
      let initData = {
        'rangeBetween': 'ED',
        'startDate': this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay)),
        'endDate': this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        'brokerName': '',
        'provinceName': '',
        'businessType': 'Q'
      }
      let submitInfo = refresh == 'T' ? initData : searchData
      this.oldRequest = this.hmsDataService.postApi(UftApi.getCompanyAndCardHolderContinuity, submitInfo).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (refresh == 'T') {
            let compTabData = {
              'countOfCompanies': data.result.addedDuringDateRange.countOfCompanies,
              'totalCardHolders': data.result.addedDuringDateRange.countOfCardHoldersDependents
            }
            this.getCompTabData.emit(compTabData)
          } else {
            this.mainTableData = data.result
            this.showtableLoader = false
            this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
            this.showLastUpdated = true;
            if (type == 'init') {
              let compTabData = {
                'countOfCompanies': data.result.addedDuringDateRange.countOfCompanies,
                'totalCardHolders': data.result.addedDuringDateRange.countOfCardHoldersDependents
              }
              this.getCompTabData.emit(compTabData)
            }
          }
        } else {
          this.mainTableData = []
          this.showtableLoader = false
          this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
          this.showLastUpdated = true;
        }
      })
    } else {
      if (this.oldRequest) {
        this.oldRequest.unsubscribe();
        this.oldRequest = null;
      }
      this.showCompanyTable = false
      this.showPrimaryTable = false
      this.showDependentTable = false
      this.showtableLoader = false
      this.mainTableData = []
      this.validateAllFormFields(this.compCardholderData);
    }
  }
  getProvinceList() {
    var URL = UftApi.getPredectiveProvinceCode;
    this.hmsDataService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
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
    if (selected) {
      this.selectedProvinceKey = (selected.originalObject.provinceKey).toString();
    }
    else {
      this.selectedProvinceKey = '';
    }
  }

  onBrokerSelected(selected: CompleterItem) {
    if (selected) {
    }
  }

  onBusinessSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedBusnsType = (selected.originalObject.businessTypeCd)
    }
    else {
      this.selectedBusnsType = '';
    }
  }

  totalCompaniesList(type) {
    this.typeForExcel = type
    this.showCompanyTable = true
    this.totalCompaniesColumns = [
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.companyNumName'), data: 'companyNameAndId' },
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.brokerNoName'), data: 'brokerNameAndId' },
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.provinceName'), data: 'provinceName' },
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.countOfPrimaryCardholders'), data: 'primaryCardholders' },
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.countOfCardholdersIncludingDependents'), data: 'cardholdersWithDependents' }]
    var reqParam = [
      { 'key': 'rangeBetween', 'value': this.compCardholderData.value.date },
      { 'key': 'startDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate) },
      { 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate) },
      { 'key': 'brokerName', 'value': this.compCardholderData.value.broker },
      { 'key': 'type', 'value': type },
      { 'key': 'provinceName', 'value': this.compCardholderData.value.provinceKey },
      { 'key': 'businessType', 'value': 'Q' },
    ]
    var tableActions = [];
    var url = UftApi.getCompanyBalanceContinuity;
    var tableId = "uftDashboard_totalCompany"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_totalCompany')) {
      this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.totalCompaniesColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, '', [], "", '', '', '', [1, 2, 3, 4], '', '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
  }

  primaryCardholderList(type) {
    this.typeForExcel = type
    this.showPrimaryTable = true
    let primaryCardholderColumns = [
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.companyNumName'), data: 'companyNameAndId' },
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.cardholderName'), data: 'personFirstName' },
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.countDependent'), data: 'countDependent' }]
    var reqParam = [
      { 'key': 'rangeBetween', 'value': this.compCardholderData.value.date },
      { 'key': 'startDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate) },
      { 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate) },
      { 'key': 'brokerName', 'value': this.compCardholderData.value.broker },
      { 'key': 'type', 'value': type },
      { 'key': 'provinceName', 'value': this.compCardholderData.value.provinceKey },
      { 'key': 'businessType', 'value': 'Q' },
      { 'key': 'category', 'value': "primary" }
    ]
    var tableActions = [];
    if (type == 'CTC') {
      this.showPrimaryColors = true
    }
    else {
      this.showPrimaryColors = false
    }
    var url = UftApi.getCardHolderBalanceContinuity; ///
    var tableId = "uftDashboard_primaryCardholder"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_primaryCardholder')) {
      this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', primaryCardholderColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, '', '', "", '', '', '', [1, 2], '', '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  dependentCardholderList(type) {
    this.typeForExcel = type
    this.showDependentTable = true
    let DependentCardholderColumns = [
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.companyNumName'), data: 'companyNameAndId' },
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.cardholderName'), data: 'personFirstName' },
      { title: this.translate.instant('uft.dashboard.comp-cardholder-continuity.countDependent'), data: 'countDependent' }]
    var reqParam = [
      { 'key': 'rangeBetween', 'value': this.compCardholderData.value.date },
      { 'key': 'startDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate) },
      { 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate) },
      { 'key': 'brokerName', 'value': this.compCardholderData.value.broker },
      { 'key': 'type', 'value': type },
      { 'key': 'provinceName', 'value': this.compCardholderData.value.provinceKey },
      { 'key': 'businessType', 'value': 'Q' },
      { 'key': 'category', 'value': "dependent" }
    ]
    if (type == 'CTC') {
      this.showColors = true
    }
    else {
      this.showColors = false
    }
    var tableActions = [];
    var url = UftApi.getCardHolderBalanceContinuity;
    var tableId = "uftDashboard_dependentCardholder"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_dependentCardholder')) {
      this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', DependentCardholderColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, '', '', "", '', '', '', [1, 2], '', '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      if (frmControlName == 'fromDate') {
        let span = document.getElementById('comp_cardFromDate');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'toDate') {
        let span = document.getElementById('comp_cardToDate');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      }
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.compCardholderData.patchValue(datePickerValue);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      if (frmControlName == 'fromDate') {
        let span = document.getElementById('comp_cardFromDate');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'toDate') {
        let span = document.getElementById('comp_cardToDate');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      }
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.compCardholderData.patchValue(datePickerValue);
    }

    if (event.reason == 1 && event.value != null && event.value != '') {
      if (frmControlName == 'fromDate') {
        let span = document.getElementById('comp_cardFromDate');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'toDate') {
        let span1 = document.getElementById('comp_cardToDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
    }

    if (this.compCardholderData.value.fromDate && this.compCardholderData.value.toDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.compCardholderData.value.fromDate.date, this.compCardholderData.value.toDate.date);
      if (this.error.isError == true) {
        this.compCardholderData.controls['toDate'].setErrors({
          "ToDateNotValid": true
        });
      }
    }
  }
  resetCompCardholderSearch() {
    this.compCardholderData.reset()
    this.selectedBusnsType = '';
    this.compCardholderData.patchValue({ 'fromDate': this.changeDateFormatService.formatDateObject(this.firstDay), 'toDate': this.changeDateFormatService.getToday(), 'date': 'ED' });
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
  enableDateField() {
    if (this.compCardholderData.value.date == 'ED') {
      this.fromDateLabel = 'Company Effective Date'
      this.toDateLabel = 'Company Termination Date'
    } else {
      this.fromDateLabel = 'Company Sold Date'
      this.toDateLabel = 'Company Termination Notification Date'
    }
  }

  exportCardholderContinuityData(category) {
    var reqParam = {
      "start": 0,
      "length": this.dataTableService.totalRecords,
      "rangeBetween": this.compCardholderData.value.date,
      "startDate": this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate),
      "endDate": this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate),
      "brokerName": this.compCardholderData.value.broker,
      "type": this.typeForExcel,
      "provinceName": this.compCardholderData.value.provinceKey,
      "category": category,
      'businessType': 'Q'
    }
    var CardholderContinuityData = UftApi.getCardholderContinuityExcelUrl;
    this.loaderPlaceHolder = this.translate.instant('uft.dashboard.comp-cardholder-continuity.loadingFile')
    var fileName
    if (category == 'dependent') {
      fileName = "Dependent CardHolders-List"
    }
    else {
      fileName = "Primary CardHolders-List"
    }
    this.docName = ""
    this.docType = ""
    if (this.dataTableService.totalRecords > 500) {
      this.exDialog.openConfirm(this.translate.instant('uft.toaster.confirmation')).subscribe((value) => {
        if (value) {
          this.exportFile(CardholderContinuityData, reqParam, fileName)
        }
      });
    } else {
      this.exportFile(CardholderContinuityData, reqParam, fileName)
    }
  }

  exportCompanyContinuityData() {
    var reqParam = {
      "start": 0,
      "length": this.dataTableService.totalRecords,
      "rangeBetween": this.compCardholderData.value.date,
      "startDate": this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate),
      "endDate": this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate),
      "brokerName": this.compCardholderData.value.broker,
      "type": this.typeForExcel,
      "provinceName": this.compCardholderData.value.provinceKey,
      'businessType': 'Q'
    }
    if(this.uftCompanySearch) {
      reqParam = Object.assign(reqParam, { 'company': this.company }),
      reqParam = Object.assign(reqParam, { 'brokerName': (this.brokerName && this.brokerName != "") ? this.brokerName : this.compCardholderData.value.broker }),
      reqParam = Object.assign(reqParam, { 'provinceName': (this.provinceName && this.provinceName != "") ? this.provinceName : this.compCardholderData.value.provinceKey }),
      reqParam = Object.assign(reqParam, { 'primaryCardholder': this.primaryCardholder }),
      reqParam = Object.assign(reqParam, { 'dependentCardholder': this.dependentCardholder })
    }
    var CompanyContinuityExcelFilterData = UftApi.getCompanyContinuityExcelUrl;
    this.loaderPlaceHolder = this.translate.instant('uft.dashboard.comp-cardholder-continuity.loadingFile')
    var fileName = "Companies-List"
    this.docName = ""
    this.docType = ""
    if (this.dataTableService.totalRecords > 500) {
      this.exDialog.openConfirm(this.translate.instant('uft.toaster.confirmation')).subscribe((value) => {
        if (value) {
          this.exportFile(CompanyContinuityExcelFilterData, reqParam, fileName)
        }
      });
    } else {
       this.exportFile(CompanyContinuityExcelFilterData, reqParam, fileName)
    }
  }

  exportFile(URL, reqParam, fileName) {
    this.loaderPlaceHolder = this.translate.instant('uft.dashboard.comp-cardholder-continuity.loadingFile')
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loaderPlaceHolder = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loaderPlaceHolder = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          a.download = fileName + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      }
      else {
      }
    })
  }

  forFocusChange(radioId) {
    if (radioId == "uft_dashboardSoldDate") {
      setTimeout(function () {
        var soldDate = <HTMLSelectElement>document.getElementById('uft_dashboardFromDate');
        if (soldDate != null) {
          soldDate.focus();
        }
      }, 200);
    } else {
      setTimeout(function () {
        var dp = <HTMLSelectElement>document.getElementById('uft_dashboardSoldDate');
        if (dp != null) {
          dp.focus();
        }
      }, 200);
    }
  }

  /**
   * Grid Column Filter Search
   * For List of Companies
   * @param tableId 
   */
  filterListOfCompaniesSearch(tableId: string) {
    this.uftCompanySearch = true;
    var URL = UftApi.getCompanyBalanceContinuity;
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    params.push({ key: 'businessType', value: 'Q' })
    params.push({ key: 'type', value: this.typeForExcel })
    params.push({ key: 'rangeBetween', value: this.compCardholderData.value.date })
    params.push({ key: 'startDate', value: this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate) })
    params.push({ key: 'endDate', value: this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate) })
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  /**
   * Reset Grid Column Filters
   * For List of Companies
   * @param tableId 
   */
  resetListOfCompanyiesFilter(tableId: string) {
    this.uftCompanySearch = false
    this.dataTableService.resetTableSearch();
    this.company = ""
    this.brokerName = ""
    this.provinceName = ""
    this.primaryCardholder = ""
    this.dependentCardholder = ""
    this.filterListOfCompaniesSearch(tableId);
  }

  /**
   * Grid Column Filter Search
   * For List of Primary Cardholders
   * @param tableId 
   */
  filterListOfPrimaryCardHolderSearch(tableId: string) {
    this.uftPrimaryCardholder = true ;
    var URL = UftApi.getCardHolderBalanceContinuity
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    params.push({ key: 'rangeBetween', value: this.compCardholderData.value.date })
    params.push({ key: 'startDate', value: this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate) })
    params.push({ key: 'endDate', value: this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate) })
    params.push({ key: 'brokerName', value: '' })
    params.push({ key: 'type', value: this.typeForExcel })
    params.push({ key: 'provinceName', value: '' })
    params.push({ key: 'businessType', value: 'Q' })
    params.push({ key: 'category', value: 'primary' })
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  /**
   * Reset Grid Column Filters
   * For List of Primary Cardholders
   * @param tableId 
   */
  resetPrimaryCardHolderFilter(tableId: string) {
    this.uftPrimaryCardholder = false
    this.dataTableService.resetTableSearch();
    this.filterListOfPrimaryCardHolderSearch(tableId);
  }

  /**
   * Grid Column Filter Search
   * For List of Dependent Cardholders
   * @param tableId 
   */
  filterListOfDependentCardHolderSearch(tableId: string) {
    this.uftDependentCardholder = true
    var URL = UftApi.getCardHolderBalanceContinuity;
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    params.push({ key: 'rangeBetween', value: this.compCardholderData.value.date })
    params.push({ key: 'startDate', value: this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.fromDate) })
    params.push({ key: 'endDate', value: this.changeDateFormatService.convertDateObjectToString(this.compCardholderData.value.toDate) })
    params.push({ key: 'brokerName', value: '' })
    params.push({ key: 'type', value: this.typeForExcel })
    params.push({ key: 'provinceName', value: '' })
    params.push({ key: 'businessType', value: 'Q' })
    params.push({ key: 'category', value: 'dependent' })
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  /**
   * Reset Grid Column Filters
   * For List of Dependent Cardholders
   * @param tableId 
   */
  resetDependentCardHolderFilter(tableId: string) {
    this.uftDependentCardholder = false
    this.dataTableService.resetTableSearch();
    this.filterListOfDependentCardHolderSearch(tableId);
  }
}
