import { Component, OnInit, ViewChild, Output, EventEmitter, Renderer2 } from '@angular/core';
import { UftApi } from '../../uft-api';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Rx';
import { FinanceReportsComponent } from '../finance-reports/finance-reports.component';
import { CardServiceService } from '../../../card-module/card-service.service';
import { TranslateService, USE_DEFAULT_LANG } from '@ngx-translate/core';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { NgModule, LOCALE_ID } from '@angular/core';
import { MyDatePicker, IMyDpOptions } from 'mydatepicker';
import { GenericTableComponent, GtConfig, GtOptions, GtRow, GtEvent, GtCustomComponent } from '@angular-generic-table/core';
import { Row } from 'primeng/primeng';
declare var jsPDF: any; // Important
import { CompanyApi } from '../../../company-module/company-api';
import { RequestOptions, Http, Headers } from '@angular/http';
import { DomSanitizer } from "@angular/platform-browser";
import { BrowserStack } from 'protractor/built/driverProviders';

@Component({
  selector: 'app-uft-continuty',
  templateUrl: './uft-continuty.component.html',
  styleUrls: ['../dashboard.component.css'],
  providers: [ChangeDateFormatService, DatatableService]
})
export class UftContinutyComponent implements OnInit {
  pdfName: JQuery<HTMLElement>;
  /**Start Column Filters For Reverse Reports*/
  filterCompanyNameAndNo: any;
  filterUFTCode: any;
  filterTransactionAmt: any;
  filterTransactionDescription: any;
  /**End Column Filters For Reverse Reports*/
  company: string;
  transactionAmt: string;
  tranCd: string;
  entrydate: string;
  transactionDescription: string;
  showRemoveBtn: boolean = false;
  fundingTabType: any;
  transKeyForPdf: any;
  transCodeForPdf: any;
  tranCdKeyForPdf: any;
  UftKeyForPdf: any;
  amountb: boolean;
  amount: any;
  otpBankAccountsForm: FormGroup;
  bankDetails: FormGroup;
  private myTable: GenericTableComponent<any, any>;
  companyName: any;
  companyCoId: any;
  coId: any
  disabledTransationType: boolean = false;
  showReverseTable: boolean = false;
  showStopCheque: boolean = false;
  reverseTransHeading: string;
  transTypeCd: any
  addTransHeading: string;
  showHideReportComp: boolean = true;
  showGrid: boolean = false;
  showAddPayee: boolean = false;
  companyCoKey: any;
  dateNameArray = {};
  showPageLoader: boolean = false;
  refPDS: boolean = false;
  public uftContinuityData: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  error: any;
  businessType;
  fundingTotal;
  paymentRunTotal;
  adjustmentsTotal;
  public filterReverse: FormGroup;
  refundTotal;
  firstDay: Date;
  openingBalance: any = '0.00';
  closingBalance: any = '0.00';
  funding: any = '0.00';
  paymentRun: any = '0.00';
  adjustments: any = '0.00';
  refund: any = '0.00';
  fundingList: any;
  paymentRunList: any;
  refundingList: any;
  adjustmentList: any;
  oneTimeMessage = false;
  rowData: any
  selectedRefundPayKey: any
  selectedChequeNum: any
  stopChequeBtn: boolean = false
  companyNameText: any;
  addOTPform: FormGroup
  companyListData
  currentBal
  todayDate
  buttonText: string;
  addMode: boolean = true;
  viewMode: boolean = false;
  editMode: boolean = false;
  transactionTypeList;
  coKey
  transCodeKey;
  companyKey;
  uftKey;
  refundKey;
  uftData;
  transactionDate;
  uftTransRef;
  planType
  isOpen: boolean = false;
  fundingTotalAmount;
  refundTotalAmount;
  adjustmentTotalAmount;
  paymentRunTotalAmount;
  uftContinuityType;
  transCode;
  transType;
  monthPapAmt;
  dailyPapAmt;
  clientEftAmt;
  chequesAmt;
  reversalsAmt;
  claimsAmt;
  adminFeeAmt;
  brokerFeeAmt;
  gstAmt;
  brokerGstAmt;
  ontarioTaxAmt;
  quebecTaxAmt;
  newfoundlandAmt;
  saskatchewanAmt;
  refundChequesAmt;
  refundPdsAmt;
  miscAmt;
  adminFeesAmt;
  taxAdjustmentAmt;
  interCompanyTransfersAmt;
  writeOffsAmt;
  compKey = "";
  showTabListLoader: boolean = false
  fundingTab: boolean = false;
  refundTab: boolean = false;
  adjustmentTab: boolean = false
  checkSuccess: boolean = false;
  checkSuccessReverse: boolean = false;
  observableObj;
  check = true;
  columns = [];
  stopChequeColumns = []
  columns_dailyPAP = [];
  reverseBtn: boolean = false;
  selecteCoName
  selectedCoKey
  selecteCoID
  selecteCoName2
  selectedCoKey2
  selecteCoID2
  selecteCoName3
  selectedCoKey3
  selecteCoID3
  companyDataRemote;
  companyDataRemote2;
  companyDataRemoteMainUft;
  public dateRangeData: CompleterData;
  dateRangeList: any;
  selectedNameNo;
  selectedNameNo2;
  key;
  standardPapAmt;
  yearEndBalance;
  public transactionTypeData: CompleterData
  dateTime: string;
  showLastUpdated: boolean = false;
  isRefundForm: boolean = false
  showRefundBtn: boolean = false
  refundAmt;
  selectedDateRange: any;
  defaultMode: boolean = false;
  configData: any = [];
  dailyPAPDataSet: any = [];
  refundTransAmt;
  columns_new = [];
  adjustedFlag;
  firstStepResp;
  compNameMain: boolean = false
  showAddPayeeLink: boolean = false;
  bank_account_columns = [];
  companyBankArray: any = {};
  bankDetailsArr = [];
  showBankGrid: boolean = false;

  /* For uploading Pdf in ADD for Funding*/
  error1: any;
  error2: any;
  error3: any;
  selectedFileName
  selectedFile: any;
  fileSizeExceeds: boolean = false
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false
  loaderPlaceHolder;
  fundingPdfName: any;
  financePdfUrl;
  fundingSummarySelectedData;
  columnFilterSearch: boolean = false;
  /* For uploading Pdf in ADD for Funding ends---*/
  generateDailyPapPath
  generateDailyPapPathUrl;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  isRefundHeading: boolean = false
  @ViewChild(FinanceReportsComponent) financeReportsChild;
  @Output() hideMainLoader = new EventEmitter();
  @Output() uftParentComponent = new EventEmitter();
  @Output() uftSubTypeParentComponent = new EventEmitter();
  @Output() uftOpenClosingParentComponent = new EventEmitter();
  @ViewChild('mydp') mydp: MyDatePicker;
  @ViewChild('mydpToDate') mydpToDate: MyDatePicker;
  @ViewChild('mydpTransDate') mydpTransDate: MyDatePicker;

  isDisableReversePap: boolean = false;
  unitFinancialTransKey;
  unitFinancialTranCd;
  unitFinancialTransctionType;
  unitFinancialTransAmount;
  unitFinancialCompanyName;
  reverseReqParam;
  showOpeningBalanceLoader: boolean = false;
  showClosingBalanceLoader: boolean = false;
  showOpeningClosingBalLoader: boolean = false;
  showBalanceLoader: boolean = false;
  currentUser: any
  checkCompKey: boolean = false;
  company2enable: boolean = false;
  companyFieldLabel1
  companyFieldLabel2
  compEffDate;
  compEffDateMainUft;
  chequeRes;
  transRef;
  uftByKeyResp;
  otpDataRequest;
  isMiscType: boolean = false;
  showGraph: boolean = false;
  showtableLoader: boolean = false;
  fileName;
  reverseAmount;
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private completerService: CompleterService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private dataTableService: DatatableService,
    private exDialog: ExDialog,
    private cardService: CardServiceService,
    private currentUserService: CurrentUserService,
    private render: Renderer2,
    private domSanitizer: DomSanitizer
  ) {
    this.error2 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
    this.companyListData = this.completerService.remote(
      null,
      "coName,coId",
      "mergedDescription"
    );
    this.companyListData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + this.hmsDataService.currentUser } });
    this.companyListData.urlFormater((term: any) => {
      return UftApi.getPredictiveCompanyListUrl + `/${term}`;
    });
    this.companyListData.dataField('result');
  }

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { position: 'right' },
    showDatasetLabels: true,
    hover: {
      onHover: function (e) {
        $("#compBalanceBarChart").css("cursor", e[0] ? "default" : "pointer");
      }
    },
    scales: {
      xAxes: [{ barPercentage: 0.5, categoryPercentage: 1.0, }],
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  public barChartLabels: string[] = []
  public barChartType: string = 'bar';
  public barChartLegend: boolean = false;
  public barChartData: any[]
  public barChartColors = [{}];
  //fix for issue no 749 in whole file replace(",", "")

  ngOnInit() {
    setTimeout(function () {
      $('#compName').focus()
    }, 300);
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
      })
    }
    let self = this
    $(document).on('click', '#unitFinancialTransactionList1 tr', function () {
      if (self.dataTableService.selectedReverseChequeRowData != undefined) {
        self.rowData = self.dataTableService.selectedReverseChequeRowData
        self.selectedRefundPayKey = self.rowData.coRefundPayKey
        self.selectedChequeNum = self.rowData.coRefundChequeNum
        self.stopChequeBtn = true
      }
    })
    this.uftContinuityData = new FormGroup({
      fromDate: new FormControl(''),
      toDate: new FormControl(''),
      compName: new FormControl(''),
      dateRange: new FormControl('Custom')
    })
    this.filterReverse = new FormGroup({
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      searchCompany: new FormControl('')
    })
    this.addOTPform = new FormGroup({
      'companyNameNo': new FormControl('', [Validators.required]),
      'companyNameNo2': new FormControl('', []),
      'transactionDate': new FormControl('', [Validators.required]),
      'transactionAmt': new FormControl('', [Validators.required]),
      'transactionType': new FormControl('', []),
      'transactionDesc': new FormControl('', [Validators.maxLength(80), CustomValidators.notEmpty]),
      'transactionRef': new FormControl('', []),
      'currentBalance': new FormControl('', []),
      'companyEffectiveOn': new FormControl('', []),
      'yearEndDate': new FormControl('', []),
      'yearEndBalance': new FormControl('', []),
      'standardPapAmount': new FormControl('', []),
      'refundAmount': new FormControl('', []),
      'entryDate': new FormControl('', []),
      'name': new FormControl('', []),
      'address': new FormControl('', []),
      'payeeName': new FormControl('', []),
      'payeeAddress': new FormControl('', []),
      'payeeAddress2': new FormControl('', []),
      'payeePostalCode': new FormControl('', []),
      'payeeCity': new FormControl('', []),
      'payeeProvince': new FormControl('', []),
      'payeeCountry': new FormControl('', []),
      'documentName': new FormControl('')
    })
    this.otpBankAccountsForm = new FormGroup({
      'bankNumber': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'bankName': new FormControl('', [Validators.required, Validators.maxLength(60), CustomValidators.alphaNumeric, CustomValidators.notEmpty]),
      'branch': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'account': new FormControl('', [Validators.required, Validators.minLength(7), Validators.maxLength(20), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl(''),
      'bankType': new FormControl('')
    });
    this.bankDetails = new FormGroup({
      'effectiveOn': new FormControl('', Validators.required)
    });
    this.getTransactionType()
    var date = new Date();
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.uftContinuityData.patchValue({ 'fromDate': this.changeDateFormatService.formatDateObject(this.firstDay), 'toDate': this.changeDateFormatService.getToday() });
    this.filterReverse.patchValue({ 'startDate': this.changeDateFormatService.formatDateObject(this.firstDay), 'endDate': this.changeDateFormatService.getToday() });
    this.searchUftData('');
    this.fundingTotal = '2,800';
    this.paymentRunTotal = '31,855';
    this.refundTotal = '6,000';
    this.adjustmentsTotal = '3,150';
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('uft.uftSearch.companyNameNo') == 'uft.uftSearch.companyNameNo') {
        }
        else {
          this.stopChequeColumns = [
            { title: this.translate.instant('uft.dashboard.uft-continuity.companyID'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.status'), data: 'tranStatDesc' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.processDate'), data: 'coRefundProcessDt' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.totalAmount'), data: 'coRefundTotalAmt' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.transactionDate'), data: 'coRefundTransDt' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.issueDate'), data: 'coRefundIssueDt' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.cancelDate'), data: 'coRefundCancelDt' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.clearDate'), data: 'coRefundClearDt' },
            { title: this.translate.instant('uft.dashboard.uft-continuity.chequeNumber'), data: 'coRefundChequeNum' },
          ]
          this.columns = [
            { title: this.translate.instant('uft.uftSearch.companyNameNo'), data: 'companyname' },
            { title: this.translate.instant('uft.uftSearch.transactionDate'), data: 'transactionDate' },
            { title: this.translate.instant('uft.uftSearch.uftCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.uftSearch.transAmount'), data: 'transactionAmt' },
            { title: this.translate.instant('uft.uftSearch.transDescription'), data: 'transactionDescription' },
            { title: this.translate.instant('uft.uftSearch.entryDate'), data: 'entrydate' },
          ]
          this.columns_new = [
            { title: this.translate.instant('uft.uftSearch.companyNameNo'), data: 'coIdCoName' },
            { title: this.translate.instant('uft.uftSearch.transactionDate'), data: 'unitFinancialTransDt' },
            { title: this.translate.instant('uft.uftSearch.transAmount'), data: 'unitFinancialTransAmt' },
            //Commented 18 July,2019 After Discussion With Backend
            { title: this.translate.instant('uft.uftSearch.uftCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.uftSearch.transDescription'), data: 'unitFinancialTransDesc' },
            { title: this.translate.instant('uft.uftSearch.currentBalance'), data: 'companyBalance' }
          ]
          //Bank columns
          this.bank_account_columns = [
            {
              title: this.translate.instant('company.company-bank-account.bank-no'),
              data: 'coBankNum'
            },
            {
              title: this.translate.instant('company.company-bank-account.branch-no.'),
              data: 'coBankBranchNum'
            },
            {
              title: this.translate.instant('company.company-bank-account.bank-name'),
              data: 'coBankName'
            },
            {
              title: this.translate.instant('company.company-bank-account.account-no.'),
              data: 'coBankAccountNum'
            },
            {
              title: this.translate.instant('company.company-bank-account.effective-date'),
              data: 'effectiveOn'
            },
            {
              title: this.translate.instant('company.company-bank-account.expiry-date'),
              data: 'expiredOn'
            }
          ]
          this.check = false;
          this.observableObj.unsubscribe();
        }
      }
    })

    /** Issue(677) - Code Shifted From Here to Function ngAfterViewInit( */

    $("#uftc .fn-tabs .panel-title a").attr("aria-expanded", "false");
    $("#Funding, #prun, #Refund, #Adjustments").removeClass("in");
    this.getPredictiveCompanySearchData(this.completerService);
    this.getPredictiveCompanySearchData2(this.completerService);
    this.getPredictiveCompanySearchDataMainUft(this.completerService)
    this.getDateRangeList('default');
    this.todayDate = this.changeDateFormatService.getToday();
    this.uftBarGraphData();
    this.getOpeningClosingBalance();
  }

  getDateRangeList(type, effDate = null) {
    let promise = new Promise((resolve, reject) => {
      if (type == 'default') {
        this.defaultMode = true;
        this.dateRangeList = [
          { dateRangeKey: 'Last Year', dateRangeValue: "Last Year" },
          { dateRangeKey: 'Last Month', dateRangeValue: "Last Month" },
          { dateRangeKey: 'Last Week', dateRangeValue: "Last Week" },
          { dateRangeKey: 'This Year', dateRangeValue: "This Year" }, // Log #1168: Options added 
          { dateRangeKey: 'This Month', dateRangeValue: "This Month" },
          { dateRangeKey: 'This Week', dateRangeValue: "This Week" },
          { dateRangeKey: 'Yesterday', dateRangeValue: "Yesterday" },
          { dateRangeKey: 'Today', dateRangeValue: "Today" },
          { dateRangeKey: 'Custom', dateRangeValue: "Custom" }
        ]
      } else {
        this.defaultMode = false;
        this.dateRangeList = [];
        var date = new Date();
        if (new Date() <= new Date(effDate)) {
          this.dateRangeList = [
            { dateRangeKey: 'Last Year', dateRangeValue: "Last Year" },
            { dateRangeKey: 'Last Month', dateRangeValue: "Last Month" },
            { dateRangeKey: 'Last Week', dateRangeValue: "Last Week" },
            { dateRangeKey: 'This Year', dateRangeValue: "This Year" }, // Log #1168: Options added 
            { dateRangeKey: 'This Month', dateRangeValue: "This Month" },
            { dateRangeKey: 'This Week', dateRangeValue: "This Week" },
            { dateRangeKey: 'Yesterday', dateRangeValue: "Yesterday" },
            { dateRangeKey: 'Today', dateRangeValue: "Today" },
            { dateRangeKey: 'Custom', dateRangeValue: "Custom" }
          ]
        } else {
          if (new Date(effDate).getFullYear() < new Date().getFullYear() && (this.date_diff_indays(new Date(effDate), new Date()) > 365)) {
            this.dateRangeList = [];
            this.dateRangeList = [
              { dateRangeKey: 'Last Contract Year', dateRangeValue: "Last Contract Year" },
              { dateRangeKey: 'This Contract Year', dateRangeValue: "This Contract Year" },
              { dateRangeKey: 'Last Year', dateRangeValue: "Last Year" },
              { dateRangeKey: 'Last Month', dateRangeValue: "Last Month" },
              { dateRangeKey: 'Last Week', dateRangeValue: "Last Week" },
              { dateRangeKey: 'This Year', dateRangeValue: "This Year" }, // Log #1168: Options added 
              { dateRangeKey: 'This Month', dateRangeValue: "This Month" },
              { dateRangeKey: 'This Week', dateRangeValue: "This Week" },
              { dateRangeKey: 'Yesterday', dateRangeValue: "Yesterday" },
              { dateRangeKey: 'Today', dateRangeValue: "Today" },
              { dateRangeKey: 'Custom', dateRangeValue: "Custom" }
            ]
          } else {
            this.dateRangeList = [];
            this.dateRangeList = [
              { dateRangeKey: 'This Contract Year', dateRangeValue: "This Contract Year" },
              { dateRangeKey: 'Last Year', dateRangeValue: "Last Year" },
              { dateRangeKey: 'Last Month', dateRangeValue: "Last Month" },
              { dateRangeKey: 'Last Week', dateRangeValue: "Last Week" },
              { dateRangeKey: 'This Year', dateRangeValue: "This Year" }, // Log #1168: Options added 
              { dateRangeKey: 'This Month', dateRangeValue: "This Month" },
              { dateRangeKey: 'This Week', dateRangeValue: "This Week" },
              { dateRangeKey: 'Yesterday', dateRangeValue: "Yesterday" },
              { dateRangeKey: 'Today', dateRangeValue: "Today" },
              { dateRangeKey: 'Custom', dateRangeValue: "Custom" }
            ]
          }
        }
      }
      this.dateRangeData = this.completerService.local(
        this.dateRangeList,
        null,
        "dateRangeValue"
      );
      if (this.selectedDateRange == 'Current Contract Year') {
        this.uftContinuityData.patchValue({
          "dateRange": 'Custom'
        })
      }
      resolve();
    });
    return promise;
  }
  date_diff_indays(date1, date2) {
    var dt1 = new Date(date1);
    var dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
  }

  ngAfterViewInit(): void {
    setTimeout(function () {
      this.showHideReportComp = false;
    }, 500);
    /** Start */
    let self = this
    $(document).on('click', '#unitFinancialTransactionList_PDS tr', function () {
      if (self.dataTableService.uftSelectedRowData != undefined) {
        if ((self.dataTableService.uftSelectedRowData.tranCd == 90 || self.dataTableService.uftSelectedRowData.tranCd == 91
          || self.dataTableService.uftSelectedRowData.tranCd == 93 || self.dataTableService.uftSelectedRowData.tranCd == 94
          || self.dataTableService.uftSelectedRowData.tranCd == 80 || self.dataTableService.uftSelectedRowData.tranCd == 81) && self.dataTableService.uftSelectedRowData.reverseStatus == 'F') {
          self.isDisableReversePap = true
        } else {
          self.isDisableReversePap = false
        }
        self.unitFinancialTransAmount = self.dataTableService.uftSelectedRowData.transactionAmt;
        self.unitFinancialTransKey = self.dataTableService.uftSelectedRowData.unitFinancialTransKey;
        self.unitFinancialTranCd = self.dataTableService.uftSelectedRowData.tranCd;
        self.unitFinancialTransctionType = self.dataTableService.uftSelectedRowData.transctionType;
        self.unitFinancialCompanyName = self.dataTableService.uftSelectedRowData.companyname;
        self.adjustedFlag = self.dataTableService.uftSelectedRowData.adjusted;
        self.coKey = self.dataTableService.uftSelectedRowData.coKey;
        self.transCodeKey = self.dataTableService.uftSelectedRowData.tranCodeKey;
      }
    })
    /** End */
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.uftContinuityData.patchValue(datePickerValue);
      this.addOTPform.patchValue(datePickerValue)
      if (frmControlName == 'fromDate') {
        let span = document.getElementById('uft_dashboardFromDate');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'toDate') {
        let span1 = document.getElementById('uft_dashboardToDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'transactionDate') {
        let span1 = document.getElementById('otp_accTrans');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
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
      this.uftContinuityData.patchValue(datePickerValue);
      if (frmControlName == 'fromDate') {
        let span = document.getElementById('uft_dashboardFromDate');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'toDate') {
        let span1 = document.getElementById('uft_dashboardToDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'transactionDate') {
        let span1 = document.getElementById('otp_accTrans');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
      this.filterReverse.patchValue(datePickerValue);
      this.addOTPform.patchValue(datePickerValue);
    }
    if (event.reason == 2) {
      if (formName == 'otpBankAccountsForm') {
        this.otpBankAccountsForm.patchValue(datePickerValue);
      }
    }
    if (event.reason == 1 && event.value != null && event.value != '') {
      if (frmControlName == 'fromDate') {
        let span = document.getElementById('uft_dashboardFromDate');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'toDate') {
        let span1 = document.getElementById('uft_dashboardToDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'transactionDate') {
        let span1 = document.getElementById('otp_accTrans');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
    }
    if (this.uftContinuityData.value.fromDate && this.uftContinuityData.value.toDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.uftContinuityData.value.fromDate.date, this.uftContinuityData.value.toDate.date);
      if (this.error.isError == true) {
        this.uftContinuityData.controls['toDate'].setErrors({
          "ToDateNotValid": true
        });
      }
    }
    if (this.addOTPform.value.transactionDate && this.compEffDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.compEffDate.date, this.addOTPform.value.transactionDate.date);
      if (this.error.isError == true) {
        this.addOTPform.controls['transactionDate'].setErrors({
          "transactionEffDateCheck": true
        });
      }
    }
    if (this.compEffDateMainUft && this.addOTPform.value.transactionDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.compEffDateMainUft.date, this.addOTPform.value.transactionDate.date);
      if (this.error.isError == true) {
        this.addOTPform.controls['transactionDate'].setErrors({
          "transactionEffDateCheck": true
        });
      }
    }
    if (this.filterReverse.value.startDate && this.filterReverse.value.endDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.filterReverse.value.startDate.date, this.filterReverse.value.endDate.date);
      if (this.error.isError == true) {
        this.filterReverse.controls['endDate'].setErrors({
          "EndDateNotValid": true
        });
      }
    }
    if ((this.filterReverse.value.startDate && this.filterReverse.value.endDate == null) || (this.filterReverse.value.startDate == null && this.filterReverse.value.endDate) || (this.filterReverse.value.startDate == null && this.filterReverse.value.endDate == null)) {
      this.error = true;
      if (this.filterReverse.value.endDate == null && this.filterReverse.value.startDate) {
        this.filterReverse.controls['endDate'].setErrors({
          "required": true
        });
      }
      else if (this.filterReverse.value.endDate && this.filterReverse.value.startDate == null) {
        this.filterReverse.controls['startDate'].setErrors({
          "required": true
        });
      }
      else {
        this.filterReverse.controls['startDate'].setValidators(null);
        this.filterReverse.controls['endDate'].setValidators(null);
        this.filterReverse.controls['startDate'].updateValueAndValidity();
        this.filterReverse.controls['endDate'].updateValueAndValidity();
      }
    }
  }



  companyFieldVal(event) {
    this.companyNameText = event
    if (this.companyNameText) {
      this.compNameMain = true
      if (this.companyNameText.includes(' / ')) {
        var companyName = this.companyNameText.toString().split(' / ')
        if (companyName.length > 0) {
          this.companyName = companyName[0]
          this.companyCoId = companyName[1]
        }
      } else {
        this.companyName = this.companyNameText
        this.companyCoId = ''
      }
    } else {
      this.companyName = ''
      this.companyCoId = ''
      this.compNameMain = false
    }
  }

  receiveCoId(event) {
    if (event) {
      this.compKey = event
      this.checkCompKey = true
      var companyUrl = UftApi.getCompanyBalanceUrl + '/' + this.compKey
      this.hmsDataService.getApi(companyUrl).subscribe(data => {
        if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
          if (Number.isInteger(data.result)) {
            this.currentBal = data.result + '.00'
          } else {
            this.currentBal = data.result
          }
          this.addOTPform.patchValue({
            "currentBalance": this.currentBal,
            "companyNameNo": this.compKey
          })
        }
      })
    } else {
      this.currentBal = ''
      this.compKey = ""
      this.checkCompKey = false;
      this.addOTPform.patchValue({
        "currentBalance": "",
        "companyNameNo": "",
      })
    }
  }

  searchUftData(type) { //192
    $("#uftc .fn-tabs .panel-title a").attr("aria-expanded", "false");
    $("#Funding, #prun, #Refund, #Adjustments").removeClass("in");

    /*Get UFT Continuity Search Api */
    this.showBalanceLoader = true;
    var reqData = {
      "fromDate": this.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate) : "",
      "toDate": this.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate) : "",
      "coKey": this.compKey,
      "type": type     //192                                                                 
    }
    var url = UftApi.getTotalAmountForUtfContinuityUrlNew    //new api url
    this.hmsDataService.postApi(url, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showBalanceLoader = false;
        this.fundingTotalAmount = this.currentUserService.convertAmountToDecimalWithDoller(data.result.funding.fundingTotalAmount)
        this.refundTotalAmount = this.currentUserService.convertAmountToDecimalWithDoller(Math.abs(data.result.refund.refundTotalAmount))
        this.adjustmentTotalAmount = this.currentUserService.convertAmountToDecimalWithDoller(Math.abs(data.result.adjustment.adjustmentTotalAmount))
        if (data.result.adjustment.adjustmentTotalAmount < 0) {
          this.amountb = true
        }
        else {
          this.amountb = false
        }
        this.paymentRunTotalAmount = this.currentUserService.convertAmountToDecimalWithDoller(Math.abs(data.result.payment.paymentRunTotalAmount))
        this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
        this.showLastUpdated = true;
        if (type == 'Funding') {
          this.getFundingTabData(data.result.funding.fundingTransactionAmountDto)
        } else if (type == 'Refund') {
          this.getRefundingList(data.result.refund.refundTransactionAmountDto)
        } else if (type == 'Adjustment') {
          this.getAdjustMnetList(data.result.adjustment.adjustmentTransactionAmountDto)
        } else {
          this.getFundingTabData(data.result.funding.fundingTransactionAmountDto)
          this.getPaymentRunList(data.result.payment.paymentRunTransactionAmountDto)
          this.getRefundingList(data.result.refund.refundTransactionAmountDto)
          this.getAdjustMnetList(data.result.adjustment.adjustmentTransactionAmountDto)
        }
      } else {
        this.showBalanceLoader = false;
        this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
        this.showLastUpdated = true;
        this.getFundingTabData(undefined)
        this.getPaymentRunList(undefined)
        this.getRefundingList(undefined)
        this.getAdjustMnetList(undefined)
      }
    })

  }

  getUftData(type) {
    this.getOpeningClosingBalance();
    this.searchUftData(type); //192
    this.uftBarGraphData();
  }

  resetSearchForm() {
  }

  //OTP SCREEN START HERE
  /** Add OTP Data in Funding Start Here */

  enableAddMode() {
    this.addOTPform.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
  }

  addOtpForm(type, tabType) {
    setTimeout(() => {
      switch (tabType) {
        case 'FUNDING':
          this.showNewGrid(this.compKey, [+type.transactionCode]);
          break;
        case 'REFUND':
          this.showNewGrid(this.compKey, [80, 81]);
          break;
        case 'ADJUSTMENT':
          this.showNewGrid(this.compKey, [+type.transactionCode]);
          break;
      }
    }, 1000);
    this.fundingTabType = tabType
    this.showGrid = false;
    this.dailyPAPDataSet = [];
    this.uftKey = ""
    this.addOTPform.reset();
    this.addOTPform.patchValue({
      'transactionDate': this.todayDate,
    })
    this.enableAddMode()
    if (type) {
      if (type.data) {
        this.planType = type.data
        var addTransHeadingData = type.data.split(' (')
        this.reverseTransHeading = addTransHeadingData[0]
      } else {
        this.addTransHeading = ''
      }
      if (type.transactionCode) {
        this.transType = type.transactionCode
      }
    } else {
      this.planType = ""
    }
    if (tabType == 'REFUND') {
      this.isRefundHeading = true
      this.isRefundForm = true
      this.showRefundBtn = true
      this.transType = '80'
      this.refundFlowApi();
    } else {
      this.isRefundHeading = false
      this.isRefundForm = false
      this.showRefundBtn = false
      this.addOTPform.controls.transactionType.disable();
    }
    if (this.planType == 'Intercompany Transfers (73)') {
      this.company2enable = true
      this.addOTPform.controls['companyNameNo2'].setValidators(Validators.required);
      this.addOTPform.controls['companyNameNo2'].updateValueAndValidity();
      this.companyFieldLabel1 = this.translate.instant('uft.dashboard.uft-continuity.compNameNoFrom')
      this.companyFieldLabel2 = this.translate.instant('uft.dashboard.uft-continuity.compNameNoTo')
      this.getPredictiveCompanySearchData2(this.completerService)
    } else {
      this.companyFieldLabel1 = this.translate.instant('uft.dashboard.uft-continuity.compNameNo')
      this.company2enable = false
      this.addOTPform.controls['companyNameNo2'].clearValidators();
      this.addOTPform.controls['companyNameNo2'].updateValueAndValidity();
    }
    if (this.planType == 'Miscellaneous (70)') {
      this.isMiscType = true;
      this.addOTPform.patchValue({
        'entryDate': this.todayDate,
      })
    } else {
      this.isMiscType = false;
    }
    if (this.isRefundForm) {
      this.addOTPform.patchValue({
        'transactionType': '80',
      })
    } else {
      this.addOTPform.patchValue({
        'transactionType': this.planType,
      })
    }
    if (this.compKey) {
      this.addOTPform.patchValue({
        'companyNameNo': this.companyNameText
      })
      if (this.checkCompKey) {
        this.getViewOfCompCurrentBal(this.compKey).then(res => {
          this.addOTPform.patchValue({
            "currentBalance": this.currentBal
          })
        })
        if (this.planType == "Refund PDS (81)" || this.planType == 'Intercompany Transfers (73)' || this.transType == '80' || this.transType == '81') {
          if (parseFloat(this.currentBal) < 0) {
            this.toastrService.warning(this.translate.instant('uft.toaster.compWithNegativeBal'))
          }
          if (parseFloat(this.currentBal) == 0 || parseFloat(this.currentBal) == 0.00) {
            this.toastrService.warning(this.translate.instant('uft.toaster.compWithZeroBal'))
          }
        }
        this.addOTPform.controls.companyNameNo.disable();
      } else {
        this.addOTPform.controls.companyNameNo.enable();
      }
      setTimeout(() => {
        document.getElementById('otp_TransAmt').focus();
      }, 400);
    } else {
      this.compKey = ""
      this.addOTPform.patchValue({
        'transactionDate': this.todayDate,
      })
      setTimeout(() => {
        document.getElementById('companyNameNo').focus();
      }, 400);
    }
    this.addOTPform.controls.currentBalance.disable();
    if (tabType == "FUNDING") {
      this.fundingTab = true;
      this.refundTab = false;
      this.adjustmentTab = false;
      this.addOTPform.controls['transactionAmt'].setValidators([Validators.required]);
      this.addOTPform.controls['transactionAmt'].updateValueAndValidity();
    } else if (tabType == "REFUND") {
      this.fundingTab = false;
      this.refundTab = true;
      this.adjustmentTab = false
      this.addOTPform.controls['transactionAmt'].setValidators([Validators.required]);
      this.addOTPform.controls['transactionAmt'].updateValueAndValidity();
    } else if (tabType == "ADJUSTMENT") {
      this.fundingTab = false;
      this.refundTab = false;
      this.adjustmentTab = true;
      this.addOTPform.controls['transactionAmt'].setValidators([Validators.required])
      this.addOTPform.controls['transactionAmt'].updateValueAndValidity();
    }
  }

  /**
  * Function to show grid on click
  * of add button
  */
  showNewGrid(companyId = null, transType = null) {
    var reqParam = [];
    reqParam = [
      { 'key': 'unitFinancialTransKey', 'value': "" },
      { 'key': 'transCodeList', 'value': transType },
      { 'key': 'coKey', 'value': companyId },
      { 'key': 'unitFinancialTransDt', 'value': this.changeDateFormatService.convertDateObjectToString(this.todayDate) },
    ];
    let promise = new Promise((resolve, reject) => {
      this.showGrid = true;
      var url = UftApi.getUnitFinacialTransactionsByKeyUrl;
      var tableId = "unitFinancialTransactionListReportGrid"
      if (!$.fn.dataTable.isDataTable('#unitFinancialTransactionListReportGrid')) {
        var tableActions = [
          { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': '' },
          { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
        ];
        this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns_new, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [1], '', [2, 5], null, '', [0], [1, 2, 3, 4, 5])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
      resolve();
    });
    return promise;
  }

  OnBlurCompany2(event) {
    this.getPredictiveCompanySearchData(this.completerService);
  }

  getTransactionType() {
    var url = UftApi.getTransactionTypeUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionTypeList = data.result;
        this.transactionTypeData = this.completerService.local(
          this.transactionTypeList,
          "mergedDescription",
          "mergedDescription"
        )
      }
    })
  }

  submitOTPForm() {
    if (this.addOTPform.valid) {
        if (this.transType == '93') {
        this.getCompanyActivebankAccount().then(res => {
          if (Object.getOwnPropertyNames(this.companyBankArray).length > 0) {
            this.exDialog.openConfirm(this.translate.instant('company.exDialog.confirmOTPBankDetails')).subscribe((value) => {
              if (value) {
                this.submitOTP();
              } else {
                this.oneTimeMessage = true;
                this.submitOTP();
                this.hmsDataService.OpenCloseModal('openOTPBankAccount')
                this.otpBankAccountsForm.patchValue({
                  'bankType': "oneTimeAcc",
                })
              }
            });
          } else {
            this.hmsDataService.OpenCloseModal('noActiveBank-btn')
          }
        });
      } else if (this.transType == '80' || this.transType == '81') {
        this.hmsDataService.OpenCloseModal('paymentBankConfirmation')
      } else {
        this.submitOTP();
      }
    } else {
      this.validateAllFormFields(this.addOTPform)
    }
  }

  openBankForm() {
    this.hmsDataService.OpenCloseModal("btnCloseNoActiveBankModal");
    this.oneTimeMessage = true;
    this.submitOTP();
    this.hmsDataService.OpenCloseModal('openOTPBankAccount')
    this.otpBankAccountsForm.patchValue({
      'bankType': "oneTimeAcc",
    })
  }

  getCompanyActivebankAccount() {
    let promise = new Promise((resolve, reject) => {
      let reqData = {};
      if (this.compKey) {
        reqData = { "coKey": this.compKey }
      } else {
        reqData = { "coKey": this.selectedCoKey }
      }
      this.hmsDataService.postApi(CompanyApi.getCompanyActivebankAccountUrl, reqData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.companyBankArray = data.result;
          resolve();
        } else {
          this.companyBankArray = {};
          resolve();
        }
      });
    });
    return promise;
  }

  submitOTP() {
    if (this.addOTPform.valid) {
      if (this.error2.isError == true || this.error3.isError == true) {       /* Selected File is not valid */
        return false;
      }
      if (this.compKey) {
        this.key = this.compKey
      }
      else {
        this.key = this.selectedCoKey
      }
      if (this.isRefundForm) {
        if (!this.transRef) {
          this.transRef = this.addOTPform.value.transactionRef
        }
        if (!this.yearEndBalance) {
          this.yearEndBalance = this.addOTPform.value.yearEndBalance
        }
        if (!this.standardPapAmt) {
          this.standardPapAmt = this.addOTPform.value.standardPapAmount
        }
        if (!this.showAddPayee) {
          this.otpDataRequest = {
            "unitFinancialTransKey": "",
            "coKey": this.key,
            "tranCdKey": this.transType,
            "provinceName": "",
            "countryName": "",
            "unitFinancialTransAmt": +this.addOTPform.value.transactionAmt.replace(",", ""),
            "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.transactionDate),//transactionDate,
            "unitFinancialTransDesc": this.addOTPform.value.transactionDesc,
            "unitFinancialTransRef": this.transRef,  
            "coPaySumKey": 0,
            "coRefundPayKey": 0,
            "divisionKey": 0,
            "eftCoPayKey": 0,
            "payReconDetailKey": 0,
            "paymentSumKey": 0,
            "plansKey": 0,
            "unitKey": 0,
            "unitFinTranOpenBalAmt": this.yearEndBalance,
            "unitFinTransCloseBalAmt": this.standardPapAmt,
            "unitFinancialDispCd": "",
            "createdOn": this.changeDateFormatService.convertDateObjectToString(this.todayDate)
          }
        } else {
          this.otpDataRequest = {
            "unitFinancialTransKey": "",
            "coKey": this.key,
            "tranCdKey": this.transType,
            "unitFinancialTransAmt": +this.addOTPform.value.transactionAmt.replace(",", ""),
            "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.transactionDate),
            "unitFinancialTransDesc": this.addOTPform.value.transactionDesc,
            "unitFinancialTransRef": this.transRef,
            "coPaySumKey": 0,
            "coRefundPayKey": 0,
            "divisionKey": 0,
            "eftCoPayKey": 0,
            "payReconDetailKey": 0,
            "paymentSumKey": 0,
            "plansKey": 0,
            "unitKey": 0,
            "unitFinTranOpenBalAmt": this.yearEndBalance,
            "unitFinTransCloseBalAmt": this.standardPapAmt,
            "unitFinancialDispCd": "",
            "createdOn": this.changeDateFormatService.convertDateObjectToString(this.todayDate),
            "payeeInd": "T",
            "payeeName": (this.addOTPform.value.payeeName) != null ? (this.addOTPform.value.payeeName) : '',
            "postalCd": (this.addOTPform.value.payeePostalCode) != null ? (this.addOTPform.value.payeePostalCode) : '',
            "cityName": (this.addOTPform.value.payeeCity) != null ? (this.addOTPform.value.payeeCity) : '',
            "provinceName": (this.addOTPform.value.payeeProvince) != null ? (this.addOTPform.value.payeeProvince) : '',
            "countryName": (this.addOTPform.value.payeeCountry) != null ? (this.addOTPform.value.payeeCountry) : '',
            "mailAddressLine1": (this.addOTPform.value.payeeAddress) != null ? (this.addOTPform.value.payeeAddress) : '',
            "mailAddressLine2": (this.addOTPform.value.payeeAddress2) != null ? (this.addOTPform.value.payeeAddress2) : ''
          }
        }
      } else {
        this.otpDataRequest = {
          "unitFinancialTransKey": "",
          "coKey": this.key,
          "tranCdKey": this.transType,
          "provinceName": "",
          "countryName": "",
          "unitFinancialTransAmt": +this.addOTPform.value.transactionAmt.replace(",", ""),
          "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.transactionDate),
          "unitFinancialTransDesc": this.addOTPform.value.transactionDesc,
          "unitFinancialTransRef": this.addOTPform.value.transactionRef,
          "coPaySumKey": 0,
          "coRefundPayKey": 0,
          "divisionKey": 0,
          "eftCoPayKey": 0,
          "payReconDetailKey": 0,
          "paymentSumKey": 0,
          "plansKey": 0,
          "unitKey": 0,
          "unitFinTranOpenBalAmt": '',
          "unitFinTransCloseBalAmt": '',
          "unitFinancialDispCd": "",
          "createdOn": ''
        }
        if (this.planType == 'Miscellaneous (70)') {
          this.otpDataRequest['createdOn'] = this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.entryDate)
        }
      }
      if (this.planType == 'Intercompany Transfers (73)') {
        this.otpDataRequest['ictCoKey'] = (this.selectedCoKey2) ? this.selectedCoKey2 : null
      } else {
        this.otpDataRequest['ictCoKey'] = null
      }
      var url = UftApi.saveAndUpdateUnitFinancialTransactionUrl;
      this.showPageLoader = true
      this.hmsDataService.postApi(url, this.otpDataRequest).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.showGrid = true;
          this.showPageLoader = false
          this.checkSuccess = true;
          this.coKey = data.result.coKey
          this.uftKey = data.result.unitFinancialTransKey
          this.transCodeForPdf = data.result.tranCdKey
          this.showRemoveBtn = false;
          for (var i = 0; i < this.transactionTypeList.length; i++) {
            if (this.transactionTypeList[i].tranCd == this.transCodeForPdf) {
              this.transKeyForPdf = this.transactionTypeList[i].tranCdKey
            }
          }
          if (this.fundingTabType == 'FUNDING' || this.fundingTabType == 'ADJUSTMENT' || this.fundingTabType == 'REFUND') {
            if (this.addOTPform.value.documentName != "" && this.addOTPform.value.documentName != undefined && this.addOTPform.value.documentName != null) {
              this.onSubmitUploadReportPdf();
            }
          }
          if (this.planType == "Intercompany Transfers (73)") {
            this.toastrService.success(this.translate.instant('uft.toaster.IntercompanyTransferSuccess'));
            this.addOTPform.reset();
            this.showBankGrid = false;
            this.addOTPform.patchValue({
              'transactionDate': this.todayDate,
            })
            this.addOTPform.patchValue({
              'transactionType': this.planType,
            })
          } else {
            if (!this.oneTimeMessage) {
              this.toastrService.success(this.reverseTransHeading + this.translate.instant('uft.toaster.savedSuccess'));
            }
            this.resetOtpForm();
            this.addOTPform.patchValue({
              'transactionDate': this.todayDate,
            })
            this.addOTPform.controls.companyNameNo.enable();
            if (!this.isRefundForm) {
              this.addOTPform.patchValue({
                'transactionType': this.planType,
              })
            }
          }
          setTimeout(() => {
            document.getElementById('companyNameNo').focus();
          }, 500);
          //Start To show data tabel after click seacrh button  
          var localChanges = [];
          localChanges.push({
            coKey: this.coKey,
            tranCdKey: this.transType,
            unitFinancialTransAmt: data.result.unitFinancialTransAmt,
            unitFinancialTransDt: data.result.unitFinancialTransDt,
            unitFinancialTransDesc: (data.result.unitFinancialTransDesc == null) ? '' : data.result.unitFinancialTransDesc,
            unitFinancialTransRef: (data.result.unitFinancialTransRef == null) ? '' : data.result.unitFinancialTransRef,
            paymentSumKey: this.currentBal,
          });
          if (this.transType == "80" || this.transType == "81") {
            this.showNewGrid(this.coKey, [80, 81]);
          } else {
            this.showNewGrid(this.coKey, [+this.transType])
          }
          //End To show data tabel after click seacrh button
          this.reCalOfOpenClosingBal(this.coKey)
          if (this.fundingTab) {
            this.totalAmtUftContinuityOfTab('Funding')
          } else if (this.refundTab) {
            this.totalAmtUftContinuityOfTab('Refund')
          } else if (this.adjustmentTab) {
            this.totalAmtUftContinuityOfTab('Adjustment')
          } else {
            this.totalAmtUftContinuityOfTab('')
          }
          this.getAmountBasedOnTab();
          setTimeout(() => {
            this.getOpeningClosingBalance()
          }, 5000);

        } else if (data.code == 400 && data.status == "BAD_REQUEST") {
          this.showPageLoader = false
          if (this.planType == "Intercompany Transfers (73)") {
            this.toastrService.error(this.translate.instant('uft.toaster.IntercompanyTransferFailed'))
          }
          else {
            this.toastrService.error(this.reverseTransHeading +' '+ this.translate.instant('uft.toaster.notSaved'))
          }
        } else {
          this.showPageLoader = false
          if (this.planType == "Intercompany Transfers (73)") {
            this.toastrService.error(this.translate.instant('uft.toaster.IntercompanyTransferFailed'))
          } else {
            this.toastrService.error(this.reverseTransHeading +' '+ this.translate.instant('uft.toaster.notSaved'))
          }
        }
      });    
    } else {
      this.validateAllFormFields(this.addOTPform)
    }
  }

  reCalOfOpenClosingBal(key) {
    let reqData = { "coKey": key }
    this.hmsDataService.postApi(UftApi.reCalcOpenClosBalCompanyUrl, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
      }
    });
  }

  getAmountBasedOnTab() {
    if (this.checkSuccess) {
      if (this.fundingTab) {
        this.totalAmtUftContinuityOfTab('Funding')
      } else if (this.refundTab) {
        this.totalAmtUftContinuityOfTab('Refund')
      } else if (this.adjustmentTab) {
        this.totalAmtUftContinuityOfTab('Adjustment')
      } else {
        this.totalAmtUftContinuityOfTab('')
      }
    }
  }

  resetOtpForm() {
    this.showAddPayee = false;
    this.showBankGrid = false;
    this.addOTPform.reset();
    this.selectedCoKey = '';
    this.selectedCoKey2 = '';
    this.company2enable = false
    this.refPDS = false
    /* For PDF File */
    this.selectedFileName = ""
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
    /* For PDF File Ends--*/
  }

  resetReverseForm() {
    $('#closeReversePopup').trigger('click');
    this.totalAmtUftContinuityOfTab('');
    this.selectedCoKey3 = ''
    this.selecteCoName3 = ''
    this.selecteCoID3 = ''
    this.filterReverse.reset();
    this.filterReverse.patchValue({ 'startDate': this.changeDateFormatService.formatDateObject(this.firstDay), 'endDate': this.changeDateFormatService.getToday() });
    this.isDisableReversePap = false;
    this.unitFinancialTransKey = ''
    this.showReverseTable = false
    this.showStopCheque = false
    this.dataTableService.resetTableSearch();
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

  /* Get UFT Continuity Type List for Report Button */
  uftContinuityReport(type) {
    this.uftParentComponent.next(type)
    setTimeout(() => {
      document.getElementById('startDate').focus();
    }, 400);
  }

  /** Get Report to reconcile the Claims payments  */
  uftContinuityReportClaimPayments(type) {
    this.uftParentComponent.next(type)
  }

  /* Get UFT Continuity Type List for Report Button */
  uftContinuitySubTypeReport(transactionType) {
    this.uftSubTypeParentComponent.next(transactionType)
  }

  reverseForm(type, tabType) {
    setTimeout(() => {
      document.getElementById('searchCompany').focus();
    }, 400);
    if (type) {
      if (type.transactionCode) {
        this.transType = type.transactionCode
      } else {
        this.transType = ' '
      }
      if (type.data) {
        var reverseTransHeadingData = type.data.split(' (')
        this.reverseTransHeading = reverseTransHeadingData[0]
      } else {
        this.reverseTransHeading = ''
      }
    } else {
      this.transType = ""
    }
    var companyValues
    var companyName
    var companyId
    var companyNameText
    if (this.compNameMain) {
      if (this.companyNameText) {
        companyValues = this.companyNameText.split(' / ')
        companyName = companyValues[0]
        companyId = companyValues[1]
        companyNameText = companyId + ' - ' + companyName
      } else {
        companyName = ''
        companyId = ''
        companyNameText = ''
      }
    } else {
      companyName = ''
    }
    this.filterReverse.patchValue
      ({
        searchCompany: (companyName) != '' ? companyName : '',
      })
    this.onSubmitReverse(this.filterReverse)
    if (tabType == "FUNDING") {
      this.fundingTab = true;
      this.refundTab = false;
      this.adjustmentTab = false
    } else if (tabType == "REFUND") {
      this.fundingTab = false;
      this.refundTab = true;
      this.adjustmentTab = false
    }
    if (this.transType == 80) {
      this.refundPaymentsTable()
    }
    else {
      this.filterReverse.patchValue({ 'startDate': this.uftContinuityData.value.fromDate, 'endDate': this.uftContinuityData.value.toDate });
      this.reverseReqParam = [
        { 'key': 'companyname', 'value': companyNameText },
        { 'key': 'coKey', 'value': this.compKey },
        { 'key': 'coId', 'value': companyId },
        { 'key': 'transactionDateStart', 'value': this.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate) : "" },
        { 'key': 'transactionDateEnd', 'value': this.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate) : "" },
        { 'key': 'transctionType', 'value': this.transType },
      ]
      var url = UftApi.unitFinancialTransactionSearch;
      var tableId = "unitFinancialTransactionList_PDS";
      /* Patch Grid Column Filters */
      if (companyName) {
        this.filterCompanyNameAndNo = companyName + ' / ' + companyId;
      }
      this.filterUFTCode = this.transType
      /* Patch Grid column filters */
      if (!$.fn.dataTable.isDataTable('#unitFinancialTransactionList_PDS')) {
        var tableActions = [
          { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': '' },
          { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
        ]
        this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reverseReqParam, tableActions, undefined, [1, 5], '', [3], [], [], [0], [1, 2, 3, 4, 5])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, this.reverseReqParam)
      }
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
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

  /**
  * Send reversal pap request
  */
  reversePap() {
    this.addOTPform.controls.transactionDesc.patchValue("Payment Reversal") // set datault(Payment Reversal) value in transcation description lebels.
    if (this.unitFinancialTransKey) {
       this.reverseAmount = this.currentUserService.convertAmountToDecimalWithDoller(this.unitFinancialTransAmount)
       this.company = this.unitFinancialCompanyName;
      if (this.adjustedFlag == 'T') {
        this.toastrService.error(this.translate.instant('uft.toaster.transReversed'))
      } else {
        this.hmsDataService.OpenCloseModal('fundingReverseModalCB')
       }
    } else {
      this.toastrService.info(this.translate.instant('uft.toaster.plsSelectAtleastOneUftFrmList'))
    }
  }

  /* Get UFT Continuity Type List for Report Button */
  openingClosingBalance(type) {
    this.uftOpenClosingParentComponent.next({ 'type': type, 'openingBalance': this.openingBalance, 'closingBalance': this.closingBalance });
  }

  getOpeningBalance() {
    this.showOpeningBalanceLoader = true;
    let submitData = {
      "startDate": this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate),
      "endDate": this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate),
      'coId': this.companyName != undefined ? this.companyName : ''
    }
    this.hmsDataService.postApi(UftApi.getTotalOpeningBalanceAmountUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort === "RECORD_GET_SUCCESSFULLY") {
        this.showOpeningBalanceLoader = false;
        this.openingBalance = this.currentUserService.convertAmountToDecimalWithDoller(data.result != '' ? data.result : 0);
      } else {
        this.showOpeningBalanceLoader = false;
        this.openingBalance = this.currentUserService.convertAmountToDecimalWithDoller(0);
      }
    })
  }

  getClosingBalance() {
    this.showClosingBalanceLoader = true;
    let submitData = {
      "startDate": this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate),
      "endDate": this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate),
      'compNameAndNo': this.companyName != undefined ? this.companyName : ''

    }
    this.hmsDataService.postApi(UftApi.getOpeningBalanceUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showClosingBalanceLoader = false
        this.closingBalance = this.currentUserService.convertAmountToDecimalWithDoller(data.totalClosingBal);
        this.hideMainLoader.emit(true)
      } else {
        this.showClosingBalanceLoader = false
        this.closingBalance = this.currentUserService.convertAmountToDecimalWithDoller(0)
        this.hideMainLoader.emit(true)
      }
    })
  }

  /* To Get The Opening & Closing Balance */
  getOpeningClosingBalance() {
    this.showOpeningClosingBalLoader = true;
    let submitData = {
      "startDate": this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate),
      "endDate": this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate),
      'coId': this.compKey != '' ? this.compKey : ''
    }
    this.hmsDataService.postApi(UftApi.getOpeningClosingBalanceAmtUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort === "RECORD_GET_SUCCESSFULLY") {
        this.showOpeningClosingBalLoader = false;
        this.openingBalance = this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[1].coOpeningBalance != '' ? data.result.data[1].coOpeningBalance : 0);
        this.closingBalance = this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[0].coClosingBalance != '' ? data.result.data[0].coClosingBalance : 0);
      } else {
        this.showOpeningClosingBalLoader = false;
        this.openingBalance = this.currentUserService.convertAmountToDecimalWithDoller(0);
        this.closingBalance = this.currentUserService.convertAmountToDecimalWithDoller(0);
      }
    })
  }

  reverseAmtBasedOnTab() {
    if (this.checkSuccessReverse) {
      if (this.fundingTab) {
        this.searchUftData('Funding')
      } else if (this.refundTab) {
        this.searchUftData('Refund')
      } else if (this.adjustmentTab) {
        this.searchUftData('Adjustment')
      } else {
        this.searchUftData('')
      }
    }
  }

  //SELECT COMPANY NAME AND NUMBER FOR ADD POPUP

  getPredictiveCompanySearchData(completerService) {
    this.companyDataRemote = completerService.remote(
      null,
      "coName,coId",
      "mergedDescription"
    );
    this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    if (this.planType == "Intercompany Transfers (73)") {
      if (this.selectedCoKey2) {
        this.companyDataRemote.urlFormater((term: any) => {
          return UftApi.getPredictiveCompanyList + '/' + this.selectedCoKey2 + `/${term}`;
        });
        this.companyDataRemote.dataField('result');
      } else {
        this.companyDataRemote.urlFormater((term: any) => {
          return UftApi.getPredictiveCompanyList + '/0' + `/${term}`;
        });
        this.companyDataRemote.dataField('result');
      }
    } else {
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getPredictiveCompanyList + '/0' + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    }
  }

  OnBlurCompany1() {
    if (this.addOTPform.value.companyNameNo == '') {
      this.addOTPform.patchValue({
        "currentBalance": '',
      });
    }
  }

  onCompanyNameSelected(selected: CompleterItem) {
    if (selected) {
      this.selecteCoName = selected.originalObject.coName
      this.selectedCoKey = selected.originalObject.coKey
      this.selecteCoID = selected.originalObject.coId
      this.selectedNameNo = selected.originalObject.mergedDescription
      this.companyNameText = selected.originalObject.mergedDescription
      var effDate = selected.originalObject.effectiveOn
      if (this.transType == "80" || this.transType == "81") {
        this.showNewGrid(selected.originalObject.coKey, [80, 81]);
      } else {
        this.showNewGrid(selected.originalObject.coKey, [+this.transType])
      }
      if (effDate) {
        var myDate = this.changeDateFormatService.formatDate(effDate)
        this.compEffDate = this.changeDateFormatService.convertStringDateToObject(myDate)
      } else {
        this.compEffDate = ''
      }
      this.getViewOfCompCurrentBal(this.selectedCoKey).then(res => {
        this.addOTPform.patchValue({
          "currentBalance": this.currentBal
        })
        if (this.transType == '80' || this.transType == '81') {
          this.getViewOfCompanyRefundInfo(this.selectedCoKey);
          this.getBankAccountStatus(this.selectedCoKey)
        }
      })

      this.getPredictiveCompanySearchData2(this.completerService)
      this.getBankDetails(this.selectedCoKey)
    } else {
      this.currentBal = ''
      this.selecteCoName = ""
      this.selectedCoKey = ''
      this.selecteCoID = ''
      this.compEffDate = ''
      this.getPredictiveCompanySearchData2(this.completerService)
    }
  }

  /**
  * Show Active Bank Associated With Company
  * @param compKey
  * @date 06Aug2019
  */
  getBankDetails(compKey) {
    this.bankDetailsArr = [];
    var URL = CompanyApi.getCompanyActivebankAccountUrl;
    var reqParam = { 'coKey': compKey }
    this.hmsDataService.postApi(URL, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showBankGrid = true;
        this.bankDetailsArr.push({
          "coBankAccountNum": data.result.coBankAccountNum,
          "coBankBranchNum": data.result.coBankBranchNum,
          "coBankNum": data.result.coBankNum,
          "coBankName": data.result.coBankName,
          "expiredOn": data.result.expiredOn,
          "effectiveOn": data.result.effectiveOn
        });
      } else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.showBankGrid = false;
      }
    });
  }

  //SELECT COMPANY NAME AND NUMBER FOR ADD POPUP
  getPredictiveCompanySearchData2(completerService) {
    this.companyDataRemote2 = completerService.remote(
      null,
      "coName,coId",
      "mergedDescription"
    );
    this.companyDataRemote2.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    if (this.planType == "Intercompany Transfers (73)") {

      if (this.selectedCoKey) {
        this.companyDataRemote2.urlFormater((term: any) => {
          return UftApi.getPredictiveCompanyList + '/' + this.selectedCoKey + `/${term}`;
        });
        this.companyDataRemote2.dataField('result');
      } else {
        if (this.compKey) {
          this.companyDataRemote2.urlFormater((term: any) => {
            return UftApi.getPredictiveCompanyList + '/' + this.compKey + `/${term}`;
          });
          this.companyDataRemote2.dataField('result');
        } else {
          this.companyDataRemote2.urlFormater((term: any) => {
            return UftApi.getPredictiveCompanyList + '/0' + `/${term}`;
          });
          this.companyDataRemote2.dataField('result');
        }
      }

    } else {
      this.companyDataRemote2.urlFormater((term: any) => {
        return UftApi.getPredictiveCompanyList + '/0' + `/${term}`;
      });
      this.companyDataRemote2.dataField('result');
    }
  }

  onCompanyName2Selected(selected: CompleterItem) {
    if (selected) {
      this.selecteCoName2 = selected.originalObject.coName
      this.selectedCoKey2 = selected.originalObject.coKey
      this.selecteCoID2 = selected.originalObject.coId
      this.selectedNameNo2 = selected.originalObject.mergedDescription
      this.getPredictiveCompanySearchData(this.completerService)
    } else {
      this.selecteCoName2 = ""
      this.selectedCoKey2 = ''
      this.selecteCoID2 = ''
      this.getPredictiveCompanySearchData(this.completerService)
    }
  }
  onCompanyNameReverseSelected(selected: CompleterItem) {
    if (selected) {
      this.selecteCoName3 = selected.originalObject.coName
      this.selectedCoKey3 = selected.originalObject.coKey
      this.selecteCoID3 = selected.originalObject.coId
      this.getPredictiveCompanySearchData(this.completerService)
    } else {
      this.selecteCoName3 = ""
      this.selectedCoKey3 = ''
      this.selecteCoID3 = ''
      this.getPredictiveCompanySearchData(this.completerService)
    }
  }

  /*Get Total Amount For UFT Continuity Api */
  totalAmtUftContinuityOfTab(type) {
    this.showBalanceLoader = true;
    var reqData = {
      "fromDate": this.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate) : "",
      "toDate": this.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate) : "",
      "coKey": this.compKey,
      "type": type
    }
    var url = UftApi.getTotalAmountForUtfContinuityUrlNew
    this.hmsDataService.postApi(url, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showBalanceLoader = false;
        this.fundingTotalAmount = this.currentUserService.convertAmountToDecimalWithDoller(data.result.funding.fundingTotalAmount)
        this.refundTotalAmount = this.currentUserService.convertAmountToDecimalWithDoller(Math.abs(data.result.refund.refundTotalAmount))
        this.adjustmentTotalAmount = this.currentUserService.convertAmountToDecimalWithDoller(Math.abs(data.result.adjustment.adjustmentTotalAmount))
        if (data.result.adjustment.adjustmentTotalAmount < 0) {
          this.amountb = true
        }
        else {
          this.amountb = false
        }
        this.amount = data.result.adjustment.adjustmentTotalAmount
        this.paymentRunTotalAmount = this.currentUserService.convertAmountToDecimalWithDoller(Math.abs(data.result.payment.paymentRunTotalAmount))
        this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
        this.showLastUpdated = true;
        if (type == 'Funding') {
          this.getFundingTabData(data.result.funding.fundingTransactionAmountDto)
        } else if (type == 'Refund') {
          this.getRefundingList(data.result.refund.refundTransactionAmountDto)
        } else if (type == 'Adjustment') {
          this.getAdjustMnetList(data.result.adjustment.adjustmentTransactionAmountDto)
        } else {
          this.getFundingTabData(data.result.funding.fundingTransactionAmountDto)
          this.getPaymentRunList(data.result.payment.paymentRunTransactionAmountDto)
          this.getRefundingList(data.result.refund.refundTransactionAmountDto)
          this.getAdjustMnetList(data.result.adjustment.adjustmentTransactionAmountDto)
        }
      } else {
        this.showBalanceLoader = false;
        this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
        this.showLastUpdated = true;
        this.getFundingTabData(undefined)
        this.getPaymentRunList(undefined)
        this.getRefundingList(undefined)
        this.getAdjustMnetList(undefined)
      }
    })

  }

  addDecimal(event, controlName) {
    if (event.target.value) {
      if (event.target.value.indexOf(".") == -1) {
        this.addOTPform.controls[controlName].patchValue(event.target.value + '.00');
      }
      if (this.planType == "Intercompany Transfers (73)" || this.planType == "Refund PDS (81)") {
      }
      if (this.transType == '80' || this.transType == '81') {
        if (parseFloat(this.refundAmt) == 0) {
          if (event.target.value) {
            this.addOTPform.controls[controlName].setErrors({
              "zeroBalCheck": true
            })
          }
        }
        else {
          this.addOTPform.controls[controlName].updateValueAndValidity();
        }
      }
    }
  }

  getPredictiveCompanySearchDataMainUft(completerService) {
    this.companyDataRemoteMainUft = completerService.remote(
      null,
      "coName,coId",
      "mergedDescription"
    );
    this.companyDataRemoteMainUft.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.companyDataRemoteMainUft.urlFormater((term: any) => {
      return UftApi.getPredictiveCompanyList + '/0' + `/${term}`;
    });
    this.companyDataRemoteMainUft.dataField('result');
  }

  onCompanyNameSelectedMainUft(selected: CompleterItem) {
    this.getDateRangeList('default');
    if (selected) {
      this.patchDateRange('Custom');
      this.uftContinuityData.patchValue({
        "dateRange": 'Custom'
      })
      this.receiveCoId(selected.originalObject.coKey)
      this.companyFieldVal(selected.originalObject.mergedDescription)
      this.coId = selected.originalObject.coId
      var effDate = selected.originalObject.effectiveOn;
      //issue number 750
      this.getDateRangeList('onCompanySelected', effDate);
      if (effDate) {
        var myDate = this.changeDateFormatService.formatDate(effDate)
        this.compEffDateMainUft = this.changeDateFormatService.convertStringDateToObject(myDate)
      } else {
        this.compEffDateMainUft = ''
      }
    } else {
      this.receiveCoId('');
      this.companyFieldVal('')
      this.coId = ''
      this.compEffDateMainUft = ''
    }
  }

  OnBlurCompanyMainUft() {
    if (this.uftContinuityData.value.compName == '') {
      $('#dateRan').focus()
      this.getDateRangeList('default');
      var date = new Date();
      this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      this.compEffDateMainUft = ''
      this.addOTPform.patchValue({
        "currentBalance": ''
      })
    }
  }

  zeroPatchWithAmt(event, controlName) {
    if (this.isRefundForm) {
      if (event.target.value) {
        if (event.target.value.indexOf(".") == -1) {
          this.addOTPform.controls[controlName].patchValue(event.target.value + '.00');
        }
      }
    }
  }
  //START API'S FLOW HERE FOR REFUND SCENARIO

  /* 1st Get company Detail by Cokey */
  getCompanyDetailsByCokey(companyKey) {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.getCompanyDetailByCoKeyUrl;
      var coKeyReq = { "coKey": companyKey }
      this.hmsDataService.postApi(url, coKeyReq).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.companyKey = data.result.coKey
          this.companyNameText = data.result.mergedDescription
          this.firstStepResp = 1
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.companyNameText = ''
          this.firstStepResp = 0;
          resolve();
        }
      })
    })
    return promise;
  }

  /* 2nd Method for get the UFT Detail By uftKey*/
  getViewOfRefundByUftKey(uftKey) {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.getUnitFinacialTransactionsByKeyUrl;
      this.refundKey = {
        "unitFinancialTransKey": uftKey,
        "dataTable": "F"
      }
      this.hmsDataService.postApi(url, this.refundKey).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.uftByKeyResp = 1
          this.showPageLoader = false
          this.uftData = data.result;
          this.companyKey = this.uftData.coKey
          this.uftTransRef = this.uftData.unitFinancialTransRef
          this.transactionDate = data.result.unitFinancialTransDt
          this.addOTPform.patchValue({
            'transactionAmt': (this.uftData.unitFinancialTransAmt) ? this.currentUserService.convertAmountToDecimalWithoutDoller(Math.abs(this.uftData.unitFinancialTransAmt)) : '',
            'transactionDesc': (this.uftData.unitFinancialTransDesc) ? this.uftData.unitFinancialTransDesc : '',
            'transactionDate': (this.uftData.unitFinancialTransDt) ? this.uftData.unitFinancialTransDt : '',
            'transactionRef': (this.uftData.unitFinancialTransRef) ? this.uftData.unitFinancialTransRef : ''
          })
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.uftByKeyResp = 0;
          this.showPageLoader = false
          resolve();
        }
      })
    })
    return promise;
  }

  /* 3rd Method for getting the company current balance based on CoKey*/
  getViewOfCompCurrentBal(event) {
    let promise = new Promise((resolve, reject) => {
      var balUrl = UftApi.getCompanyBalanceUrl + '/' + event
      this.hmsDataService.getApi(balUrl).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if (Number.isInteger(data.result)) {
            this.currentBal = data.result + '.00'
          } else {
            this.currentBal = data.result
          }
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.currentBal = ""
          resolve();
        }

      })
    })
    return promise
  }

  /* 4th Method for get the Cheque No. by PlanType */
  getChequeNo() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.getChequeNumUrl;
      let planTypeReq = { "planType": "Q" }
      this.hmsDataService.postApi(url, planTypeReq).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.chequeRes = data.result;
          resolve();
        }
        else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.chequeRes = ""
        }
      })
    })
    return promise;
  }

  /* 5th Method for getting the response of First two methods*/
  getViewOfCompanyRefundInfo(type) {
    var infoUrl = UftApi.getCompanyRefundInfoByCoKeyUrl
    var coInfoKey = { "coKey": type }
    this.hmsDataService.postApi(infoUrl, coInfoKey).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (Number.isInteger(data.result.companyRefundAmount)) {
          this.refundAmt = data.result.companyRefundAmount + '.00'
          this.refundTransAmt = Math.abs(data.result.companyRefundAmount) + '.00'
        } else {
          this.refundAmt = data.result.companyRefundAmount
          this.refundTransAmt = Math.abs(data.result.companyRefundAmount)
        }
        if (data.result.standardpapamt != undefined) {
          if (Number.isInteger(data.result.standardpapamt)) {
            this.standardPapAmt = data.result.standardpapamt + '.00'
          } else {
            this.standardPapAmt = data.result.standardpapamt
          }
        } else {
          this.standardPapAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        }
        if (data.result.yearendbalance != undefined) {
          if (Number.isInteger(data.result.yearendbalance)) {
            this.yearEndBalance = data.result.yearendbalance + '.00'
          } else {
            this.yearEndBalance = data.result.yearendbalance
          }
        } else {
          this.yearEndBalance = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        }
        this.addOTPform.patchValue({
          'companyNameNo': (this.companyNameText) != '' ? this.companyNameText : '',
          'transactionRef': (this.chequeRes) != '' ? this.chequeRes : '',
          'currentBalance': (this.currentBal) != '' ? this.currentBal : '',
          'transactionAmt': this.currentUserService.convertAmountToDecimalWithoutDoller(this.refundTransAmt),
          'companyEffectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'yearEndDate': this.changeDateFormatService.convertStringDateToObject(data.result.yearenddt),
          'yearEndBalance': (data.result.yearendbalance) != undefined ? (Number.isInteger(Math.abs(data.result.yearendbalance)) ? Math.abs(data.result.yearendbalance) + '.00' : this.currentUserService.convertAmountToDecimalWithoutDoller(Math.abs(data.result.yearendbalance))) : this.currentUserService.convertAmountToDecimalWithoutDoller(0),
          'standardPapAmount': (data.result.standardpapamt) != undefined ? (Number.isInteger(data.result.standardpapamt) ? data.result.standardpapamt + '.00' : this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.standardpapamt)) : this.currentUserService.convertAmountToDecimalWithoutDoller(0),
          'refundAmount': this.refundAmt != undefined ? this.currentUserService.convertAmountToDecimalWithoutDoller(this.refundAmt) : this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        })
        if (parseFloat(this.refundAmt) < 0) {
          this.addOTPform.controls['transactionAmt'].setErrors({
            "transAmtNegativeCheck": true
          });
        }
      } else {
        this.refundAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        this.standardPapAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        this.yearEndBalance = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        this.refundTransAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        this.addOTPform.patchValue({
          'companyNameNo': (this.companyNameText) != '' ? this.companyNameText : '',
          'transactionRef': (this.chequeRes) != '' ? this.chequeRes : '',
          'currentBalance': (this.currentBal) != '' ? this.currentBal : '',
          'transactionAmt': this.currentUserService.convertAmountToDecimalWithoutDoller(this.refundTransAmt),//this.currentUserService.convertAmountToDecimalWithoutDoller(0),
          'yearEndBalance': this.currentUserService.convertAmountToDecimalWithoutDoller(this.yearEndBalance),//this.currentUserService.convertAmountToDecimalWithoutDoller(0),
          'standardPapAmount': this.currentUserService.convertAmountToDecimalWithoutDoller(this.standardPapAmt),//this.currentUserService.convertAmountToDecimalWithoutDoller(0),
          'refundAmount': this.currentUserService.convertAmountToDecimalWithoutDoller(this.refundAmt)//this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        })
      }
      if (this.uftData) {
      }
    })
  }

  onSubmitReverse(reverseData) {
    /** Start Patching Column Filters */
    /** End Patching Column Filters */
    if (this.filterReverse.valid) {
      if (this.filterReverse.value.startDate == null && this.filterReverse.value.endDate == null) {
        this.filterReverse.patchValue({ 'startDate': this.changeDateFormatService.formatDateObject(this.firstDay), 'endDate': this.changeDateFormatService.getToday() });
      }
      var companyValues
      var companyName
      var companyId
      var companyNameText
      if (this.companyNameText) {
        companyValues = this.companyNameText.split(' / ')
        companyName = companyValues[0]
        companyId = companyValues[1]
        companyNameText = companyId + ' - ' + companyName
      }
      if (this.companyName) {
        this.selecteCoName3 = this.companyName
      }
      if (this.coKey) {
        this.selectedCoKey3 = this.coKey
      }
      if (this.coId) {
        this.selecteCoID3 = this.coId
      }
      var tableActions = [
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': '' },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
      ]
      if (this.transType == 80) {
        this.refundPaymentsTable()
      } else {
        var tableId = "unitFinancialTransactionList_PDS";
        var url = UftApi.unitFinancialTransactionSearch;
        this.showReverseTable = true
        this.showStopCheque = false
        this.reverseReqParam = [
          { 'key': 'companyname', 'value': this.selecteCoName3 },
          { 'key': 'coKey', 'value': this.selectedCoKey3 },
          { 'key': 'coId', 'value': this.selecteCoID3 },
          { 'key': 'transactionDateStart', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterReverse.value.startDate) },
          { 'key': 'transactionDateEnd', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterReverse.value.endDate) },
          { 'key': 'transctionType', 'value': this.transType },
        ]

        /* Patch Grid Column Filters */
        if (this.selecteCoName3) {
          this.filterCompanyNameAndNo = this.selecteCoName3 + ' / ' + this.selecteCoID3;
        }
        this.filterUFTCode = this.transType
        /* Patch Grid column filters */

        if (!$.fn.dataTable.isDataTable('#unitFinancialTransactionList_PDS')) {
          this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reverseReqParam, tableActions, undefined, [1, 5], '', [3], '', '', '', [1, 2, 4, 5])
        } else {
          this.dataTableService.jqueryDataTableReload(tableId, url, this.reverseReqParam)
        }
      }
    }
    else {
      this.validateAllFormFields(this.filterReverse)
    }
  }

  resetReverse() {
    this.selectedCoKey3 = ''
    this.selecteCoName3 = ''
    this.selecteCoID3 = ''
    this.filterReverse.reset()
  }
  //END API'S FLOW HERE FOR REFUND SCENARIO

  getFundingTabData(data) {
    this.fundingList = [
      { 'data': 'Monthly PAP (90)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? data.monthlyPapAmt : 0), 'transactionCode': '90' },
      { 'data': 'Daily PAP (93)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? data.dailyPapAmt : 0), 'transactionCode': '93' },
      { 'data': 'Client EFT (94)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? data.clientEftAmt : 0), 'transactionCode': '94' },
      { 'data': 'Cheques (91)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? data.chequesAmt : 0), 'transactionCode': '91' },
      { 'data': 'Reversals (old 92)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? data.reversalsAmt : 0), 'transactionCode': '92' }]
  }

  getPaymentRunList(data) {
    this.paymentRunList = [
      { 'data': 'Claims (10)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.claimsAmt ? Math.abs(data.claimsAmt) : 0), 'transactionCode': '10' },
      { 'data': 'Admin Fees (20)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.adminFeeAmt ? Math.abs(data.adminFeeAmt) : 0), 'transactionCode': '20' },
      { 'data': 'Broker Fees (21)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.brokerFeesAmt ? Math.abs(data.brokerFeesAmt) : 0), 'transactionCode': '21' },
      { 'data': 'GST (30)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.gstAmt ? Math.abs(data.gstAmt) : 0), 'transactionCode': '30' },
      { 'data': 'Broker GST (31)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.brokerGstAmt ? Math.abs(data.brokerGstAmt) : 0), 'transactionCode': '31' },
      { 'data': 'Ontario Tax (41)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.ontarioAmt ? Math.abs(data.ontarioAmt) : 0), 'transactionCode': '41' },
      { 'data': 'Quebec Tax (42)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.quebecAmt ? Math.abs(data.quebecAmt) : 0), 'transactionCode': '42' },
      { 'data': 'Newfoundland Tax (43)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.newFondLandAmt ? Math.abs(data.newFondLandAmt) : 0), 'transactionCode': '43' },
      { 'data': 'Saskatchewan Tax (48)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.saskatchewanAmt ? Math.abs(data.saskatchewanAmt) : 0), 'transactionCode': '48' }
    ]
  }

  getRefundingList(data) {
    this.refundingList = [
      { 'data': 'Refund Cheques (80)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? Math.abs(data.refundChequeAmt) : 0), 'transactionCode': '80' },
      { 'data': 'Refund PDS (81)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? Math.abs(data.refundPdsAmt) : 0), 'transactionCode': '81' }]

  }

  getAdjustMnetList(data) {
    this.adjustmentList = [
      { 'data': 'Miscellaneous (70)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? (data.miscellaneousAmt) : 0), 'transactionCode': '70' },
      { 'data': 'Admin Fees (71)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? (data.adminAdjustmentAmt) : 0), 'transactionCode': '71' },
      { 'data': 'Tax adjustments (72)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? (data.taxAdjustmentAmt) : 0), 'transactionCode': '72' },
      { 'data': 'Intercompany Transfers (73)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? (data.interCompanyTransferAmt) : 0), 'transactionCode': '73' },
      { 'data': 'Write offs (99)', 'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(data ? (data.writeOffAmt) : 0), 'transactionCode': '99' }]
  }

  /**
  * Call On Select the Date Range from dropdown
  * @param selected 
  */
  onDateRangeSelected(selected: CompleterItem) {
    if (selected) {
      this.changeDateFormatService.getToday()
      this.selectedDateRange = selected.originalObject.dateRangeKey;
      this.patchDateRange(this.selectedDateRange);
    } else {
    }
  }

  patchDateRange(selectedDateRange) {
    switch (selectedDateRange) {
      case 'Last Contract Year': //Last Contract Year
        var lastContractYear = this.changeDateFormatService.getContractYear(this.compEffDateMainUft)
        this.uftContinuityData.patchValue({ 'fromDate': lastContractYear.fromDate, 'toDate': lastContractYear.toDate });
        break;
      case 'Last Year': //Last Year
        var lastYear = this.changeDateFormatService.getLastYear();
        this.uftContinuityData.patchValue({ 'fromDate': lastYear.fromDate, 'toDate': lastYear.toDate });
        break;
      case 'Last Month': //Last Month
        var lastMonth = this.changeDateFormatService.getLastMonth()
        this.uftContinuityData.patchValue({ 'fromDate': lastMonth.fromDate, 'toDate': lastMonth.toDate });
        break;
      case 'Last Week': //Last Week
        var lastWeek = this.changeDateFormatService.getLastWeek()
        this.uftContinuityData.patchValue({ 'fromDate': lastWeek.fromDate, 'toDate': lastWeek.toDate });
        break;
      case 'Yesterday': //Yesterday 
        var yesterdayDate = this.changeDateFormatService.getYesterday()
        this.uftContinuityData.patchValue({ 'fromDate': yesterdayDate.fromDate, 'toDate': yesterdayDate.toDate });
        break;
      case 'Today': //Today 
        var today = this.changeDateFormatService.getToday()
        this.uftContinuityData.patchValue({ 'fromDate': today, 'toDate': today });
        break;
      case 'Custom': //Custom
        var date = new Date();
        this.uftContinuityData.patchValue({ 'fromDate': this.changeDateFormatService.formatDateObject(this.firstDay), 'toDate': this.changeDateFormatService.getToday() });
        break;
        // Log #1168: New Options added below as per client new feedback(03-Dec-2021)
      case 'This Year': //This Year
        let thisYear = this.changeDateFormatService.getThisYear()
        this.uftContinuityData.patchValue({ 'fromDate': thisYear.fromDate, 'toDate': thisYear.toDate });
        break;
      case 'This Month': //This Month
        let thisMonth = this.changeDateFormatService.getThisMonth()
        this.uftContinuityData.patchValue({ 'fromDate': thisMonth.fromDate, 'toDate': thisMonth.toDate });
        break;
      case 'This Week': //This Week
        let thisWeek = this.changeDateFormatService.getThisWeek()
        this.uftContinuityData.patchValue({ 'fromDate': thisWeek.fromDate, 'toDate': thisWeek.toDate });
        break;
      case 'This Contract Year': //This Contract Year
        let thisContractYear = this.changeDateFormatService.getThisContractYear(this.compEffDateMainUft)
        this.uftContinuityData.patchValue({ 'fromDate': thisContractYear.fromDate, 'toDate': thisContractYear.toDate });
        break;
      default:
        break;
    }
  }

  onBlurDateRange() {
    setTimeout(() => {
      if (this.uftContinuityData.value.dateRange == '') {
        this.uftContinuityData.patchValue({
          "dateRange": 'Custom'
        })
        var date = new Date();
        this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      }
    }, 200);
  }

  addPayee() {
    this.showAddPayee = true; // Log #1247: changed as per client new requiremenet for payee section
    this.addOTPform.controls['payeeName'].setValidators([Validators.required]);
    this.addOTPform.controls['payeeName'].updateValueAndValidity();
    this.addOTPform.controls['payeeAddress'].setValidators([Validators.required]);
    this.addOTPform.controls['payeeAddress'].updateValueAndValidity();
    this.addOTPform.controls['payeePostalCode'].setValidators([Validators.required]);
    this.addOTPform.controls['payeePostalCode'].updateValueAndValidity();
    this.addOTPform.controls['payeeCity'].setValidators([Validators.required]);
    this.addOTPform.controls['payeeCity'].updateValueAndValidity();
    this.addOTPform.controls['payeeProvince'].setValidators([Validators.required]);
    this.addOTPform.controls['payeeProvince'].updateValueAndValidity();
    this.addOTPform.controls['payeeCountry'].setValidators([Validators.required]);
    this.addOTPform.controls['payeeCountry'].updateValueAndValidity();
  }

  radioSelected(value) {
    /*Refund Cheques End Code here */
    this.showAddPayee = false
    if (value == '80') {
      this.showAddPayeeLink = true;
      this.transType = value
      this.reverseTransHeading = "Refund Cheques"
      this.addOTPform.controls.entryDate.disable();
      this.addOTPform.controls.companyEffectiveOn.disable();
      this.addOTPform.controls.yearEndDate.disable();
      this.addOTPform.controls.yearEndBalance.disable();
      this.addOTPform.controls.standardPapAmount.disable();
      this.addOTPform.controls.refundAmount.disable();
    } else {
      if (value == "81") {
        this.showAddPayeeLink = false;
        this.transType = value
        this.reverseTransHeading = "Refund PDS"
        this.addOTPform.controls['payeeName'].clearValidators();
        this.addOTPform.controls['payeeName'].updateValueAndValidity();
        this.addOTPform.controls['payeeAddress'].clearValidators();
        this.addOTPform.controls['payeeAddress'].updateValueAndValidity();
        this.addOTPform.controls['payeePostalCode'].clearValidators();
        this.addOTPform.controls['payeePostalCode'].updateValueAndValidity();
        this.addOTPform.controls['payeeCity'].clearValidators();
        this.addOTPform.controls['payeeCity'].updateValueAndValidity();
        this.addOTPform.controls['payeeProvince'].clearValidators();
        this.addOTPform.controls['payeeProvince'].updateValueAndValidity();
        this.addOTPform.controls['payeeCountry'].clearValidators();
        this.addOTPform.controls['payeeCountry'].updateValueAndValidity();
      } else {
      }
    }
    /*Refund Cheques End Code here */
  }

  focusOnOpenBal() {
    $('#uft_opening_bal').focus()
  }

  createGrid(gridData, gridType) {
    let promise = new Promise((resolve, reject) => {
      switch (gridType) {
        case "dailyPAP":
          this.columns_dailyPAP = [
            { title: 'Company Name & No.', data: 'coKey' },
            { title: 'Transction Amount', data: 'unitFinancialTransAmt' },
            { title: 'Transction Date', data: 'unitFinancialTransDt' },
            { title: 'Transction Description', data: 'unitFinancialTransDesc' },
            { title: 'Transaction Reference', data: 'unitFinancialTransRef' },
            { title: 'Current Balance', data: 'paymentSumKey' },
          ];
          if (this.dailyPAPDataSet.length > 1) {
            this.dataTableService.jqueryDataTableClientSideReload('dailyPAPDataTable', gridData);
          } else if ($.fn.dataTable.isDataTable('#dailyPAPDataTable')) {
            this.dataTableService.jqueryDataTableClientSideClearReload('dailyPAPDataTable', gridData);
          } else {
            this.dataTableService.jqueryDataTableClientSide('dailyPAPDataTable', gridData, 'full_numbers', this.columns_dailyPAP, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reverseReqParam, [], undefined, [2], [], [1, 5], [2, 3, 4]);
          }
          break;
        default:
          break;
      }
      resolve();
    });
    return promise;
  }

  getBankAccountStatus(coKey) {
    var reqData = {
      "coKey": coKey
    }
    var url = UftApi.checkCompanyBankAccount
    this.hmsDataService.postApi(url, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result == true) {
          this.refPDS = true
        }
        else {
          this.refPDS = false
        }
      } else {
        this.refPDS = false
      }
    })
  }

  /**
  * Submit Bank Account Details
  * @param otpBankAccountsForm 
  */
  onSubmitBankDetail(otpBankAccountsForm) {
    if (this.otpBankAccountsForm.valid) {
      let bankData;
      var URL;
      if (this.otpBankAccountsForm.value.bankType == 'permanentBankAcc') {
        URL = UftApi.saveCompanyBankAccountUrl;
        bankData = {
          "companyKey": this.coKey,
          "coBankAccountNum": otpBankAccountsForm.value.account,
          "coBankBranchNum": otpBankAccountsForm.value.branch,
          "coBankNum": otpBankAccountsForm.value.bankNumber,
          "coBankName": otpBankAccountsForm.value.bankName,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(otpBankAccountsForm.value.effectiveOn),
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(otpBankAccountsForm.value.expiredOn)
        }
      }
      else {
        URL = UftApi.addOrUpdateUftCompanyBankAccountUrl;
        bankData = {
          "companyKey": this.coKey,
          "coBankAccountNum": otpBankAccountsForm.value.account,
          "coBankBranchNum": otpBankAccountsForm.value.branch,
          "coBankNum": otpBankAccountsForm.value.bankNumber,
          "coBankName": otpBankAccountsForm.value.bankName,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(otpBankAccountsForm.value.effectiveOn),
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(otpBankAccountsForm.value.expiredOn),
          "uftKey": this.uftKey
        }
      }
      this.hmsDataService.post(URL, bankData).subscribe(data => {
        if (data.code == 400 && data.message == 'DATE_SHOULD_BE_GREATER_NOW_DATE') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.expiryDateGreaterThanCurrent'));
          return false;
        } else if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_EFFECTIVEON') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.expiryDateGreaterThanEffective'));
          return false;
        } else if (data.code == 400 && data.message == 'EFFECTIVEON_REQUIRED_FOR_PREVIOUS_ACCOUNT') {
          this.hmsDataService.OpenCloseModal('openBankEffDateModal')
          return false;
        } else if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_NOW_DATE') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.EXPIREDON_SHOULD_BE_GREATER_NOW_DATE'));
          return false;
        } else if (data.code == 400 && data.message == 'COMPANY_ACCOUNT_NOT_FOUND') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.COMPANY_ACCOUNT_NOT_FOUND'));
          return false;
        } else if (data.code == 400 && data.message == 'COMPANY_BANK_ACCOUNT_ALREADY_EXIST') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.COMPANY_BANK_ACCOUNT_ALREADY_EXIST'));
          return false;
        } else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON'));
          return false;
        } else if (data.code == 400 && data.message == 'INVALID_BANK_DETAIL') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.INVALID_BANK_DETAIL'));
          return false;
        } else if (data.code == 404 && data.hmsMessage.messageShort == 'COMPANY_NOT_FOUND') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.companyNotFound'));
          return false;
        }
        if (data.code == 200 && data.status == 'OK') {
          this.toastrService.success(this.translate.instant('uft.upcomingTransactionsSearch.toaster.bankDetailsAdded'));
          this.otpBankAccountsForm.reset();
          this.hmsDataService.OpenCloseModal('openOTPBankAccount');
        }
      });
    }
    else {
      this.validateAllFormFields(this.otpBankAccountsForm);
    }
    // Any API call logic via services goes here
  }

  /**
  * Reset OPT bank account
  */
  resetOTPBankDetail() {
    this.otpBankAccountsForm.reset();
  }

  /**
  * Get UFT Graph Data
  */
  uftBarGraphData() {
    var URL = UftApi.getCoBalanceDashboardForGraphUrl;    //new api url
    let reqData;
    if (this.compKey) {
      reqData = {
        "startDate": this.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate) : "",
        "coKey": this.compKey
      }
    } else {
      reqData = {
        "startDate": this.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate) : ""
      }
    }
    this.showGraph = false
    this.showtableLoader = true
    this.hmsDataService.postApi(URL, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let dataArray = []; let barChartLabelsArray = []; let backgroundColorArray = []
        for (let i in data.result) {
          dataArray.push((data.result[i]['closingAmt']))
          barChartLabelsArray.push(this.changeDateFormatService.changeDateByMonthName(data.result[i]['transDate']))
          if (parseInt(i) === 0) {
            backgroundColorArray.push(('#00BAB5'))
          }
          else if (parseInt(i) % 2 === 0) {
            backgroundColorArray.push(('#00BAB5'))
          }
          else {
            backgroundColorArray.push(('#0484b4'))
          }
        }
        if (data) {
          this.barChartData = [{
            data: dataArray,
            backgroundColor: backgroundColorArray
          }];
          this.barChartLabels = barChartLabelsArray;
          this.showGraph = true
          this.showtableLoader = false
        }
      } else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.showGraph = false
        this.showtableLoader = false
      }
    })
  }

  /**
  * get bank name
  * @param event 
  * @param event1 
  */
  getBankName() {
    var url = UftApi.getBankDetailsUrl
    let reqData = {
      "bankNum": this.otpBankAccountsForm.value.bankNumber,
      "branchNum": this.otpBankAccountsForm.value.branch
    }
    if (this.otpBankAccountsForm.value.bankNumber && this.otpBankAccountsForm.value.branch) {
      this.hmsDataService.postApi(url, reqData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.otpBankAccountsForm.patchValue({
            'bankName': (data.result[0].bankName) ? (data.result[0].bankName).trim() : ''
          })
        } else {
          this.otpBankAccountsForm.patchValue({
            'bankName': ''
          })
        }
      })
    }
  }


  /* Get the Details Using Postal Code Api Which gives City,Province & Country Name */
  postalCodeValid(event) {
    if (event.target.value) {
      let postalCode = { postalCd: event.target.value };
      var url = UftApi.getPostalDetailUrl
      this.hmsDataService.post(url, postalCode).subscribe(data => {
        switch (data.code) {
          case 404:
            this.addOTPform.controls['payeePostalCode'].setErrors({
              "postalcodeNotFound": true
            });
            this.addOTPform.patchValue({
              'payeeCity': '',
              'payeeCountry': '',
              'payeeProvince': ''
            });
            break;
          case 302:
            this.addOTPform.patchValue({
              'payeeCity': data.result.cityName,
              'payeeCountry': data.result.countryName,
              'payeeProvince': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  /* Verify City, Province & Country With Postal Code Details */
  isPostalCodeVerifyValid(event, formControl) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (formControl) {
        case 'payeeCity':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.addOTPform.get('payeeCountry').value,
            provinceName: this.addOTPform.get('payeeProvince').value,
            postalCd: this.addOTPform.get('payeePostalCode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'payeeCountry':
          fieldParameter = {
            cityName: this.addOTPform.get('payeeCity').value,
            countryName: event.target.value,
            provinceName: this.addOTPform.get('payeeProvince').value,
            postalCd: this.addOTPform.get('payeePostalCode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'payeeProvince':
          fieldParameter = {
            cityName: this.addOTPform.get('payeeCity').value,
            countryName: this.addOTPform.get('payeeCountry').value,
            provinceName: event.target.value,
            postalCd: this.addOTPform.get('payeePostalCode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var verifyProvinceUrl = UftApi.verifyPostalDetailUrl;
      this.hmsDataService.post(verifyProvinceUrl, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.addOTPform.controls[formControl].setErrors(errorMessage);
            break;
          case 302:
            this.addOTPform.patchValue({
              'payeeCity': data.result.cityName,
              'payeeCountry': data.result.countryName,
              'payeeProvince': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  refundFlowApi() {
    if (this.compKey) {
      this.getCompanyDetailsByCokey(this.compKey).then(res => {
        if (this.firstStepResp == 1) {
          this.getViewOfCompCurrentBal(this.companyKey).then(res => {
            this.getViewOfCompanyRefundInfo(this.companyKey);
            this.showPageLoader = false;
          })
          this.getBankAccountStatus(this.companyKey)
        } else {
          this.showPageLoader = false;
        }
      })
    }
  }

  refundPaymentsTable() {
    var companyValues
    var companyName
    var companyId
    var companyNameText
    if (this.compNameMain) {
      if (this.companyNameText) {
        companyValues = this.companyNameText.split(' / ')
        companyName = companyValues[0]
        companyId = companyValues[1]
        companyNameText = companyId + ' - ' + companyName
      } else {
        companyName = ''
        companyId = ''
        companyNameText = ''
      }
    } else {
      companyName = ''
    }
    this.showStopCheque = true
    var url1 = UftApi.companyRefundPaymentsUrl;
    var tableId = "unitFinancialTransactionList1";
    var reqParam = [
      { 'key': 'coRefundChequeNum', 'value': '' },
      { 'key': 'coId', 'value': (this.selecteCoID3) ? this.selecteCoID3 : companyId },
      { 'key': 'coKey', 'value': (this.selectedCoKey3) ? this.selectedCoKey3 : this.compKey },
      { 'key': 'coRefundTransDtStart', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterReverse.value.startDate) },
      { 'key': 'coRefundTransDtEnd', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterReverse.value.endDate) },
      { 'key': 'tranStatDesc', 'value': '' },
      { 'key': 'tranTypeDesc', 'value': '' }
    ]
    if (!$.fn.dataTable.isDataTable('#unitFinancialTransactionList1')) {
      var tableActions1 = []
      this.dataTableService.jqueryDataTable(tableId, url1, 'full_numbers', this.stopChequeColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions1, undefined, [5, 6, 8], '', [4], [1, 2, 3, 7, 9], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url1, reqParam)
    }
  }

  closeModal() {
    this.rowData = ''
    this.selectedRefundPayKey = ''
    this.selectedChequeNum = ''
    this.stopChequeBtn = false
    this.selecteCoName3 = ''
    this.selectedCoKey3 = ''
    this.selecteCoID3 = ''
    this.showStopCheque = false
    this.dataTableService.resetTableSearch();
  }

  stopCheque() {
    var url = UftApi.companyStopChequeUrl;
    var stopChequeReq
    var action = "cancel";
    this.exDialog.openConfirm(this.translate.instant('uft.toaster.stopChequeConfirm') + this.selectedChequeNum + '?')
      .subscribe((value) => {
        if (value) {
          this.stopChequeBtn = false;
          stopChequeReq = { "coRefundPayKey": this.selectedRefundPayKey }
          this.hmsDataService.postApi(url, stopChequeReq).subscribe(data => {
            if (data.code == 200) {
              this.toastrService.success(this.translate.instant('uft.toaster.chequeStopSuccess'))
            } else if (data.code == 400 && data.hmsMessage.messageShort == "CHEQUE_MUST_HAVE_AN_ISSUED_STATUS") {
              this.toastrService.error(this.translate.instant('uft.toaster.chequeIssueStatusError'))
            }
          })
        } else {
        }
      })
  }

  clearData() {
    this.uftContinuityData.patchValue({
      "dateRange": 'Custom',
      'fromDate': this.changeDateFormatService.formatDateObject(this.firstDay),
      'toDate': this.changeDateFormatService.getToday()
    })
    this.uftContinuityData.controls['compName'].setValue('')
    this.getDateRangeList('default');
    this.selecteCoName = ''
    this.selectedCoKey = ''
    this.selecteCoID = ''
    this.compKey = ''
    this.selectedNameNo = ''
    this.companyNameText = ''
    var effDate = ''
    this.getUftData(''); // for issue number 742
  }

  /**
  * Trigger of select the upload file
  */
  onFileChanged(event) {
    this.addOTPform.value.documentName = ""
    this.selectedFile = event.target.files[0]
    var fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.error3 = { isError: true, errorMessage: 'File size shuold not greater than 2 Mb!' };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.error3 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.addOTPform.patchValue({ 'documentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.error2 = { isError: true, errorMessage: 'Only pdf file type are allowed.' };
      this.showRemoveBtn = true;
    } else {
      this.error2 = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }
  }

  /**
  * Upload Documents on server
  */
  onSubmitUploadReportPdf() {
    if (this.allowedValue && !this.fileSizeExceeds) {
      this.showPageLoader = true
      this.loaderPlaceHolder = "Uploading File....."
      var formData = new FormData()
      let fileName = this.addOTPform.value.documentName.substring(this.addOTPform.value.documentName.lastIndexOf('.') + 1, this.addOTPform.value.documentName.length) || this.addOTPform.value.documentName;
      let header = new Headers({ 'Authorization': this.currentUserService.token });
      let options = new RequestOptions({ headers: header });
      let compyKey;
      if(this.planType == "Intercompany Transfers (73)"){
        compyKey = this.selectedCoKey2
      }
      else if (this.compKey){
         compyKey = this.compKey
      }
      else{
        compyKey = this.selectedCoKey
      }
      if(this.adjustedFlag == 'F'){
         formData.append('file', this.selectedFile);
         formData.append('coKey', this.coKey);
         formData.append('tranCdKey', this.transCodeKey);
         formData.append('uftKey', this.unitFinancialTransKey);
      }else{
        formData.append('file', this.selectedFile);
        formData.append('coKey', compyKey);
        formData.append('tranCdKey', this.transKeyForPdf);
        formData.append('uftKey', this.uftKey);
      }
      this.hmsDataService.sendFormData(UftApi.financeAttachFileUrl, formData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.showPageLoader = false
          this.loaderPlaceHolder = this.translate.instant('common.pleaseWait')
          this.removeExtension()
          this.selectedFileName = ""
        } else if (data.code == 400 && data.hmsMessage.messageShort == "ONLY_PDF_FILE_SUPPORTED") {
          this.showPageLoader = false
          this.toastrService.error(this.translate.instant('uft.toaster.uploadPdfFile'))
        } else {
          this.showPageLoader = false
          this.loaderPlaceHolder = this.translate.instant('common.pleaseWait')
          this.toastrService.error(this.translate.instant('uft.toaster.errorOccurUploadDocument'))
        }
      })
    } else {
      return false
    }
  }

  /**
  * Remove the extension from documents
  */
  removeExtension() {
    this.addOTPform.patchValue({ 'documentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error2 = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }

  saveBankDetailsForm() {
    if (this.bankDetails.valid) {
      let bankData = {
        "coKey": this.coKey,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.bankDetails.value.effectiveOn)
      }
      this.hmsDataService.post(UftApi.addEffectiveDateCompanyBankAccountUrl, bankData).subscribe(data => {
        if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_UPDATED_SUCCESSFULLY") {
          this.toastrService.success(this.translate.instant('card.toaster.record-update'))
          $("#effDateClose").trigger('click');
          $("#saveOTPBnakAccountCloseUFT").trigger('click');
          this.getBankDetails(this.selectedCoKey);
        }
      });
    }
    else {
      this.validateAllFormFields(this.bankDetails);
    }
  }

  changeEffectiveDateFormat(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
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
      this.bankDetails.patchValue(datePickerValue);
    }
  }

  resetBankDetailsForm() {
    this.bankDetails.value.effectiveOn = '';
  }

  gridFilteration(tableId) {
    var reverseReqParam = [
      { 'key': 'companyname', 'value': this.selecteCoName3 },
      { 'key': 'coKey', 'value': this.selectedCoKey3 },
      { 'key': 'coId', 'value': this.selecteCoID3 },
      { 'key': 'transactionDateStart', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterReverse.value.startDate) },
      { 'key': 'transactionDateEnd', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterReverse.value.endDate) },
      { 'key': 'transctionType', 'value': this.transType },
      { 'key': 'transactionDate', 'value': this.transType },
      { 'key': 'transactionDescription', 'value': this.transType },
      { 'key': 'entrydate', 'value': this.transType },
      { 'key': 'transactionAmt', 'value': this.transType },
    ]
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, reverseReqParam)
    var url = UftApi.unitFinancialTransactionSearch
    var companyValues;

    if (params.length > 0) {
      for (var i = 0; i < params.length; i++) {
        switch (params[i].key) {
          case 'companyname':
            if (params[i].value) {
              companyValues = params[i].value.split(' / ')
              reverseReqParam[0].value = companyValues[0]
              reverseReqParam[2].value = companyValues[1]
              reverseReqParam[1].value = ''
            }
            break;
          case 'transactionDate':
            reverseReqParam[6].value = params[i].value
            break;
          case 'tranCd':
            reverseReqParam[5].value = params[i].value
            break;
          case 'transactionAmt':
            reverseReqParam[9].value = params[i].value
            break;
          case 'transactionDescription':
            reverseReqParam[7].value = params[i].value
            break;
          case 'entrydate':
            reverseReqParam[8].value = params[i].value
            break;
        }
      }
    }
    this.dataTableService.jqueryDataTableReload(tableId, url, reverseReqParam)
  }

  updateValueParamtoParam(param1, param2) {
  }

  resetRefundPdsGrid(tableId) {
    if (this.companyName) {
      this.selecteCoName3 = this.companyName
    }
    if (this.coKey) {
      this.selectedCoKey3 = this.coKey
    }
    if (this.coId) {
      this.selecteCoID3 = this.coId
    }
    var reverseReqParam = [
      { 'key': 'companyname', 'value': this.selecteCoName3 },
      { 'key': 'coKey', 'value': this.selectedCoKey3 },
      { 'key': 'coId', 'value': this.selecteCoID3 },
      { 'key': 'transactionDateStart', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterReverse.value.startDate) },
      { 'key': 'transactionDateEnd', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterReverse.value.endDate) },
      { 'key': 'transctionType', 'value': this.transType },
    ]
    var url = UftApi.unitFinancialTransactionSearch
    this.dataTableService.jqueryDataTableReload(tableId, url, reverseReqParam)
  }

  /**
   * Grid Column Filter Search
   * For Reverse Grid
   * @param tableId 
   */
  filterReverseGridSearch(tableId: string) {
    var URL = UftApi.companyRefundPaymentsUrl;
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  /**
   * Reset Grid Column Filters
   * For Reverse Grid
   * @param tableId 
   */
  resetReverseGridSearchFilter(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterReverseGridSearch(tableId);
  }

  /**
   * Change Date Picker For Date Picker
   * @param event 
   * @param frmControlName 
   */
  changeFilterDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
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

  /**
   * Common Function For All Reports
   * Grid Column Filter Search
   * @param tableId 
   */
  filterGridColumnSearchOLD(tableId: string) {
    switch (tableId) {
      case 'unitFinancialTransactionListReportGrid':
        var URL = UftApi.getUnitFinacialTransactionsByKeyFilterUrl;
        var obj = { key: 'searchType', value: 'l' };
        var params = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
        this.dataTableService.jqueryDataTableReload(tableId, URL, params)
        break;
      default:
        break
    }
  }
  /**
  * Common Function For Reset All Reports
  * Grid Column Filter Search
  * @param tableId 
  */
  resetGridColumnSearchFilter(tableId: string) {
    switch (tableId) {
      case 'unitFinancialTransactionListReportGrid':
        this.dataTableService.resetTableSearch();
        this.filterGridColumnSearch(tableId);
        break;
      default:
        break;
    }
  }
  /**
   * Common Function For All Reports
   * Grid Column Filter Search
   * @param tableId 
   */
  filterGridColumnSearch(tableId: string) {
    this.columnFilterSearch = true;
    var ele: HTMLElement = document.getElementById('-114-financeReport-search') as HTMLElement;
    if(ele != null){
      ele.click();
    }
  }
  
  callSubmitButton() {
    this.columnFilterSearch = false;
    var ele: HTMLElement = document.getElementById('-114-financeReport-search') as HTMLElement;
    ele.click();
  }
  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  /* Log #425 */
  getDailyPapBatch() {
    this.showPageLoader = true
    let reqParam = {
      "startDate": this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.fromDate),
      "endDate": this.changeDateFormatService.convertDateObjectToString(this.uftContinuityData.value.toDate),
      'coId': this.coId != '' ? this.coId : ''
    }
    this.hmsDataService.postApi(UftApi.generateDailyPapBatchUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result.encodeDailyPap != "" && data.result.encodeDailyPap != undefined) {
          this.fileName = data.result.fileName
          var filePath = data.result.encodeDailyPap
          var blob = this.hmsDataService.b64toBlob(filePath, "text/plain");
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = url;
          a.download = this.fileName;
          a.click();
          this.showPageLoader = false
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            a.remove()
        } else {
          this.showPageLoader = false
          this.toastrService.error(this.translate.instant('uft.toaster.fileNotGenerated'))
        }
      } else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.showPageLoader = false
        this.toastrService.error(this.translate.instant('uft.toaster.fileNotGenerated'))
      } else if (data.code == 400) {
        this.showPageLoader = false
        this.toastrService.error(this.translate.instant('uft.toaster.fileNotGenerated'))
      } else {
        this.showPageLoader = false
        this.toastrService.error(this.translate.instant('uft.toaster.fileNotGenerated'))
      }
    })
  }

  // Log #1247: on click of two buttons below method calls
  submitBankingInfoAndIssuePaperPayment(btnType) {
    if (btnType == 'bankingInfo') {
      this.transType = '81'
      this.reverseTransHeading = 'Issue Electronic Payment'
      this.getRefundSectionFlow()
    } else {
      this.transType = '80'
      this.reverseTransHeading = 'Issue Paper Payment'
      this.hmsDataService.OpenCloseModal("closeModalPaymentBankInfoBtn");
      this.exDialog.openConfirm(this.translate.instant('uft.dashboard.uft-continuity.samePayeeConfirmation')).subscribe((value) => {
        if (value) {
          this.showAddPayee = false
          this.submitOTP();
        } else {
          this.hmsDataService.OpenCloseModal("payeeConfirmation");
        }
      });
    }
  }
  
  // Log #1247: As per ticket requirement
  getRefundSectionFlow() {
    this.getCompanyActivebankAccount().then(res => {
      if (Object.getOwnPropertyNames(this.companyBankArray).length > 0) {
        this.exDialog.openConfirm(this.translate.instant('company.exDialog.confirmOTPBankDetails')).subscribe((value) => {
          if (value) {
            this.hmsDataService.OpenCloseModal("closeModalPaymentBankInfoBtn");
            this.submitOTP();
          } else {
            this.hmsDataService.OpenCloseModal("closeModalPaymentBankInfoBtn");
            this.oneTimeMessage = true;
            this.submitOTP();
            this.hmsDataService.OpenCloseModal('openOTPBankAccount')
            this.otpBankAccountsForm.patchValue({
              'bankType': "oneTimeAcc",
            })
          }
        });
      } else {
        this.hmsDataService.OpenCloseModal("closeModalPaymentBankInfoBtn");
        this.oneTimeMessage = true;
        this.submitOTP();
        this.hmsDataService.OpenCloseModal('openOTPBankAccount')
        this.otpBankAccountsForm.patchValue({
          'bankType': "oneTimeAcc",
        })
      }
    });
  }

  submitPayeeInfo(addOTPform) {
    this.addPayee()
    if (this.addOTPform.valid) {
      this.hmsDataService.OpenCloseModal('closePayeeInfoBtn')
      this.submitOTP()
    } else {
      this.validateAllFormFields(this.addOTPform)
    } 
  }
  // Log #1247 reference: Payee Info close button functionality
  closePayeeInfoPopup() {
    this.addOTPform.controls['payeeName'].clearValidators();
    this.addOTPform.controls['payeeName'].updateValueAndValidity();
    this.addOTPform.controls['payeeAddress'].clearValidators();
    this.addOTPform.controls['payeeAddress'].updateValueAndValidity();
    this.addOTPform.controls['payeePostalCode'].clearValidators();
    this.addOTPform.controls['payeePostalCode'].updateValueAndValidity();
    this.addOTPform.controls['payeeCity'].clearValidators();
    this.addOTPform.controls['payeeCity'].updateValueAndValidity();
    this.addOTPform.controls['payeeProvince'].clearValidators();
    this.addOTPform.controls['payeeProvince'].updateValueAndValidity();
    this.addOTPform.controls['payeeCountry'].clearValidators();
    this.addOTPform.controls['payeeCountry'].updateValueAndValidity();
  }

  //  save funding reverse method
  submitReversePAP(){
          let reversePapData = {
            "unitFinancialTransKey": this.unitFinancialTransKey,
            "tranCd": this.unitFinancialTranCd,
            "transctionType": this.unitFinancialTransctionType,
            "transactionDescription": (this.addOTPform.value.transactionDesc == "Payment Reversal"   || this.addOTPform.value.transactionDesc == "PAYMENT REVERSAL") ? '' : this.addOTPform.value.transactionDesc,
          }
          var reversePapURL = UftApi.reversePapUrl;
           this.hmsDataService.post(reversePapURL, reversePapData).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              this.toastrService.success(this.translate.instant('uft.toaster.reversePapSuccess'))
              var url = UftApi.unitFinancialTransactionSearch;
              var tableId = "unitFinancialTransactionList_PDS"
                  for (var i = 0; i < this.transactionTypeList.length; i++) {
                    if (this.transactionTypeList[i].tranCd == this.transCodeKey) {
                      this.transCodeKey = this.transactionTypeList[i].tranCdKey
                    }
                  }
              this.onSubmitUploadReportPdf();
              this.dataTableService.jqueryDataTableReload(tableId, url, this.reverseReqParam)
              this.checkSuccessReverse = true
              this.reverseAmtBasedOnTab();
            } else if (data.code == 400 && data.status == 'BAD_REQUEST') {
              this.toastrService.error(this.translate.instant('uft.toaster.notAuthForCreateReversePap'))
            } else {
              this.toastrService.error(this.translate.instant('uft.toaster.errorOccurCreateReversePap'))
            }
            $("#closefundingReverseModalCrossBtn").trigger("click")
            $('#unitFinancialTransactionList_PDS tbody tr td').removeClass('highlightedRow')
            this.unitFinancialTransKey = '';
            this.isDisableReversePap = false;
          });
        
  }

   //  close funding reverse method
  resetReversePAP(){
      $("#closefundingReverseModalCrossBtn").trigger("click")
      $('#unitFinancialTransactionList_PDS tbody tr td').removeClass('highlightedRow')
      this.unitFinancialTransKey = '';
       return '';
  }
}
