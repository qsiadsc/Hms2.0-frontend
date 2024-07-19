import { Component, OnInit, ViewChild, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
/** For Common Date Picker */
import { BrokerApi } from '../../../company-module/broker-api';
import { DataManagementDashboardApi } from '../../../data-management-dashboard-module/data-management-dashboard-api';
import { IMyInputFocusBlur } from 'mydatepicker';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { FinanceApi } from '../../../finance-module/finance-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { FeeGuideApi } from '../../../fee-guide-module/fee-guide-api'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { createOfflineCompileUrlResolver } from '@angular/compiler';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FinanceService } from '../../../../app/finance-module/finance.service'
import { DropdownSettings } from 'angular2-multiselect-dropdown/multiselect.interface';
import { ReceivableAdjustmentsComponent } from '../receivable-adjustments/receivable-adjustments.component';
import { GenericTableComponent, GtConfig, GtOptions, GtRow, GtEvent, GtCustomComponent, GtInformation } from '@angular-generic-table/core';
import { UftApi } from '../../../unit-financial-transaction-module/uft-api';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';
import { IMyDrpOptions } from 'mydaterangepicker';
// Generic Table Interface Start
export interface RowData extends GtRow {
  checkbox?: string;
  checkBoxValue: boolean;
  covCatKey: number;
  covCoverageTimeFrameKey: any;
  adult: any;
  coverageTimeFrameKey: any;
  adultLab: any;
  dept: any;
  depTimeFrame: any;
  deptLab: any;
  payLab?: any;
  payClaim?: any;
  effectiveOn?: any;
  expiredOn?: any;
  checked?: boolean;
  ischecked: boolean;
  editMode: boolean;
  addPlanMode: any;
  coverageCategoryHist: any;
  isCovCatExpired: any;
}
// Generic Table Interface End
@Component({
  selector: 'app-uft-financepayble',
  templateUrl: './uft-financepayble.component.html',
  styleUrls: ['./uft-financepayble.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService, ToastrService, ReceivableAdjustmentsComponent]
})

export class UftFinancepaybleComponent implements OnInit {
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  filter_path: any;
  expired
  showPayable = false;
  showBroker = false;
  showCompany = false;
  brokerfieldArray = [];
  comapnyfieldArray = [];
  cashReceiptDisciplineValue: '';
  selectedBusinessTypeCdValue: any;
  checkingParamsErrMsg: any;
  checkingParamsErr: boolean = false;
  totalPayableClaimsErr: boolean = false;
  totalPayableClaimsLockErr: boolean = false;
  isCheckedDrug: boolean = true;
  exportingPaymentFiles: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  updateExportingPaymentFiles: { "id": number; "done": string; "step": string; "processing": string; "result": any; };
  planType: any;
  generatingReportsMsg: any;
  errorClaimLListMsg: any;
  totalClaims: any;
  totalEFTRecords: string;
  totalChequeRecords: string;
  exportEftResponseErr
  exportEftResponse
  searchDiscilipineList: any
  generateDate: any
  issueDate: any
  sbusType: any
  payee: any
  stransStatus: any
  stransType: any
  dueDate: any
  transNo: any
  clearDate: any
  showSearchTable: boolean = false;
  transNotext: boolean = false;
  transRange: boolean = false;
  transDate: boolean = false;
  cheqNo: boolean = false;
  cheque: boolean = false;
  payment: boolean = false;
  ObservableObj: any;
  recNotFounndSysParam: boolean = false
  //Date Picker Options
  public transactionSearch: FormGroup;
  columns;
  check = true;
  public isOpen: boolean = false;
  disciplineValue;
  selctedDropDownVal: any;
  deniedLineItem: any;
  planTypeValue: any;
  businessType: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  eligibilityHistorytableData: any = [];
  savedCardKey: any;
  eligibilityHistoryTableID: string;
  eligibilityHistorySaveUrl: string;
  eligibilityHistorytableKeys;
  selectPlaceHolder;
  eligibilityHistoryColumns;
  eligibilityHistorytableActions
  eligibilityHistoryTableHeading: string;
  apiRequestType: string;
  sum: number;
  showTable: boolean = false;
  recordLength: any;
  hasImage: boolean;
  filterColoumn: any[];
  SelectedAll: boolean = false;
  paymentType: any;
  step8ErrorMessage: any;
  ppaymentRunKey = [];
  showFirst: boolean = false;
  comapnyfieldArrayfieldArray: any[];
  bankData: any;
  brokerCalled: boolean = false;
  CoCalled: boolean = false;
  selectedAmount = [];
  payableSumKey: any = '';
  payableSumKeyArray: any = [];
  companySumKeyArray: any = [];
  brokerSumKeyArray: any = [];
  payeeTansectionArray: any = [];
  companyTansectionArray: any = [];
  brokerTansectionArray: any = [];
  finalTotal: string = '0';
  arrTotalAmount: any = [];
  amountTotal: any = 0;
  providerSelected: any = [];
  otherSelected: any = [];
  cardholderSelected: any = [];
  qb: boolean = false;
  fieldArraySecond: any = [];
  comapnyfieldArraySecond: any = [];
  brokerfieldArraySecond: any = [];
  showFirstSecond: boolean;
  showCompanySecond: boolean;
  showBrokerSecond: boolean;
  lastSelectedPaymentSumKey: any = 0;
  ppayableSumKeyArray: any = [];
  finalEexportEftResponse: any;
  dropdownSettings: any;
  transDropdownSettings: any;
  payeeTypeArray: any = [];
  dropdownSetting: {
    singleSelection: boolean; text: string; enableCheckAll: boolean;
    badgeShowLimit: boolean; enableSearchFilter: boolean; classes: string; disabled: boolean;
  };
  payeeMethodArray: any = [];
  paymentFile: string;
  adscPaymentRunKey: any;
  isFirstPart: boolean;
  refernceCd: any = [];
  amountNegTotal: any = 0;
  transTypeArray: any = [];
  reciveClaim: any = [];
  rangeStartDate: any;
  rangeEndDate: any;
  userGroupData: any;
  firstDay: Date;
  constantDate: { beginDate: { date: { year: any; month: any; day: any; }; }; endDate: { date: { year: number; month: number; day: number; }; }; };
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  };
  transactionStatusList;
  public transactionStatusData: CompleterData
  public transactionStatusDataLower: CompleterData
  transactionStatusKey;
  dateNameArray = {}
  transacStatus;
  payeeList;
  public payeeData: CompleterData;
  public payeeDataLower: CompleterData;
  transPayee;
  transactionTypeList;
  public transactionTypeData: CompleterData
  public transactionTypeDataLower: CompleterData
  transType;
  businessTypeList;
  public businessTypeData: CompleterData
  transBusiness;
  public TransactionSearchRadio: CompleterData;
  disciplineArr = []
  reqParam
  selectedPlanType
  hideFields: boolean = false;
  subTotal = 0;
  total: number = 0;
  hiddenPaymentSumPopupBtn: boolean = true
  //Generate Payment Process variables
  generatingReportsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  generatingChequeRecordsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  generatingEftRecordsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  apiResponse: number;
  generatingPayableArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  errorClaimListArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  totalPayableClaimsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  showUpdateItemArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  checkingParamsArr: any;
  update: any;
  chequeNum: any;
  eftFileNo: any;
  paymentGenerateForm: FormGroup;
  paymentSumForm: FormGroup;
  staleChequeForm: FormGroup;
  cancelAndReissueForm: FormGroup;
  cashReceiptForm: FormGroup;
  error: any
  observableObj;
  paramData;
  exportPdfFilePathUrl: string;
  companyRefundExportPdfFilePathUrl: string;
  step1ErrorMessage
  step5ErrorMessage
  step3ErrorMessage
  step4ErrorMessage
  step2ErrorMessage
  step7ErrorMessage
  step6ErrorMessage
  step5_1ErrorMessage
  step6_1ErrorMessage
  payableTotalsResponse
  fieldArray: any = [];
  paymentSumKey;
  generatePaymentButton = false
  manualPaymentSumKey
  isDisableGPRun: boolean = false;
  financialAdminInfoResponse
  brokerPrintingChequeResponse
  generatingReportsResponseStatus
  brokerChequeListResponse
  brokerEftPaymentSummaryResponse
  selectedTransSearchRadioName;
  transactionTypeValue
  transactionStatusValue
  payeeValue
  diciplinePopupArr = []
  providerNo: boolean = false;
  cardholderNo: boolean = false;
  discilipinList;
  public discilipinData: CompleterData
  currentUser: any;
  showLoader: boolean = false
  tableAction
  isDisable: boolean = false
  selectedTransSearchRowData
  orgName
  orgNo
  orgDesc
  orgRecCenter
  bankNo
  branchNo
  accNo
  totalEftRecordsResponse
  defalutDir
  todayDate;
  eftDueDate
  pdfName
  loader: string;
  imagePath;
  pdfUrl
  paymentRunKey
  docName
  asOfDateValue
  docType
  totalChequeRecordsResponse
  getLowerSearch: boolean;
  reqParamPlan;
  transactionParams
  hideSearch: boolean = false
  disciplineClaimCheque
  diciplineDataArray = []
  transStartAmt;
  transEndAmt;
  transStartDate;
  transEndDate;
  exportFilePath
  brokerPaymentSummaryReportResponse
  totalCoEftRecordsResponse
  chequeRefNo;
  chequeRefNoStart;
  chequeRefNoEnd;
  paySumKey;
  providerCardNum;
  setDiscipline;
  payeetype;
  dtElements: QueryList<any>;
  selectedRecord: any = [];
  selectedItems = [];
  selectedItem = [];
  rulesDropDown = [];
  paymentMethod = [];
  tarnsTypes = [];
  observablePayableReportObj;
  payableReportColumns = []
  Payeetype = [
    { 'id': 'all', 'itemName': "All" },
    { 'id': 'broker', 'itemName': "Brokers" },
    { 'id': 'cardholder', 'itemName': "Cardholders" },
    { 'id': 'company', 'itemName': "Companies" },
    { 'id': 'provider', 'itemName': "Providers" }
  ];
  filter_Payeetype = [
    { 'id': 'B', 'itemName': "Broker" },
    { 'id': 'C', 'itemName': "Cardholder" },
    { 'id': 'CR', 'itemName': "Company" },
    { 'id': 'D', 'itemName': "Provider" },
    { 'id': 'O', 'itemName': "Other" } 
  ];

  tempTransTypes = [
    { 'id': 'CP', 'itemName': "Claim Payment" }, 
    { 'id': 'BP', 'itemName': "Broker Payment" },
    { 'id': 'CR', 'itemName': "Company Refund" }
  ];

  payOptions = [
    { 'val': '1', 'name': "Pay All" },
    { 'val': '2', 'name': "Pay Select" },
  ]
  dataArray = [];
  data = [];
  error1: any;
  today = this.changeDateFormatService.getPrevWeek().fromDate;
  lastDayDate = this.changeDateFormatService.getPrevWeek().toDate;
  filter_referenceInfo;
  filter_payeeNumber;
  filter_paymentMethod;
  filter_transactionAmount;
  filter_payeeName;
  filter_payeeType: any = "null";
  filter_createdOn;
  filter_transactionType;
  filter_transaction;
  issuePayment = 0;
  recordRecived = 0;
  printingELStatementMsg:any
  provCardPrintingELStatementMsg
  companyPrintingELStatementMsg
  brokerPrintingELStatementMsg
  myDateRangePickerOptions: IMyDrpOptions = {
    // other options...
    dateFormat: 'dd/mmm/yyyy',
  };
  public model: any = {
    beginDate: this.today.date,
    endDate: this.lastDayDate.date
  };
  @ViewChild(GenericTableComponent)
  public myTable: GenericTableComponent<any, any>;
  public options: GtOptions = {
    rowSelection: false,
  };
  public configObject: GtConfig<RowData>;
  hmsPayRptKey;
  companyRefundFilePath
  printingElPaymentStatementResponse: any
  filter_payeeNumber1
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private domSanitizer: DomSanitizer,
    private completerService: CompleterService,
    private hmsDataService: HmsDataServiceService,
    public currentUserService: CurrentUserService,
    private ToastrService: ToastrService,
    private router: Router,
    private FinanceService: FinanceService,
    private receivableAdjustmentsComponent: ReceivableAdjustmentsComponent
  ) {
    this.model = { 'beginDate': this.changeDateFormatService.getMonthBackDate().fromDate.date, 'endDate': this.changeDateFormatService.getMonthBackDate().toDate.date };
    this.constantDate = { 'beginDate': this.changeDateFormatService.getMonthBackDate().fromDate, 'endDate': this.changeDateFormatService.getMonthBackDate().toDate };
    this.amountTotal = this.currentUserService.convertAmountToDecimalWithDoller(this.amountTotal);
    this.amountNegTotal = this.currentUserService.convertAmountToDecimalWithDoller(this.amountNegTotal);
    this.error = { isError: false, errorMessage: '' };
    this.currentUser = this.currentUserService.currentUser
    this.showLoader = true
    let self = this;
    this.todayDate = this.changeDateFormatService.getPrevWeek().toDate;
    this.lastDayDate = this.changeDateFormatService.getPrevWeek().fromDate
    this.dataTableService.emitAmount.subscribe((val) => {
      this.amountTotal = self.currentUserService.convertAmountToDecimalWithDoller(val.amountTotal);
      this.amountNegTotal = self.currentUserService.convertAmountToDecimalWithDoller(val.amountNegTotal);
    })
  }
  runRecordRecive(e) {
    // if (this.reciveClaim.length == 0) {
    //   this.ToastrService.error(this.translate.instant('uft.toaster.noRecordsSelected'))
    // }
    var url = UftApi.generateAdjReceipt;
    var paramData = {
      "recInd": "T",
      "payableTransactionKeys": this.reciveClaim,
      "planType": this.paymentGenerateForm.value.planType
    }
    if (this.reciveClaim.length == 0) {
      this.ToastrService.error(this.translate.instant('uft.toaster.noRecordsSelected'))
    }
    this.hmsDataService.postApi(url, paramData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.filterSearch()
        this.ToastrService.success(this.translate.instant('uft.toaster.recordReceiptGenerated'));
      } else {
        this.ToastrService.error(this.translate.instant('uft.toaster.somethingWentWrongPleaseTryAgain'));
      }
    })
  }

  onDateRangeChanged(e) {
    if (e.beginEpoc == 0 && e.endEpoc == 0) {
      this.rangeStartDate = ' ';
      this.rangeEndDate = ' ';
    } else {
      this.rangeStartDate = this.changeDateFormatService.convertDateObjectToString({ date: e.beginDate });
      this.rangeEndDate = this.changeDateFormatService.convertDateObjectToString({ date: e.endDate });
    }
  }
  checkSelectedAll() {
    this.showLoader = true;
    let cheked = true;
    let self = this;
    $('#ListTable .listTableCheck').each(function (i) {
      if (!$(this).prop('checked')) {
        cheked = false;
      }
    });
    if (cheked) {
      if (!$('.selectAll').prop('checked')) {
        $('.selectAll').prop("checked", true);
        self.Checked()
      }
    }
    this.showLoader = false;
  }

  unChecked() {
    if (this.payOptions.length == 1) {
      this.payOptions = [
        {
          'val': '1', 'name': "Pay All"
        },
        { 'val': '2', 'name': "Pay Select" },
      ]
      this.transactionSearch.patchValue({
        "paySelection": "2"
      })
    }
    if ($('.selectAll').prop('checked')) {
      $('.selectAll').prop("checked", false);
    }
  }

  Checked() {
    this.payOptions = [
      {
        'val': '1', 'name': "Pay All"
      }
    ]
    this.transactionSearch.patchValue({
      "paySelection": "1"
    })
  }

  onChangepayeeType(value) {
    this.finalTotal = '$0.00'
    this.total = 0;
    this.fieldArray = []
    this.brokerfieldArray = [];
    this.comapnyfieldArray = [];
    this.SelectedAll = false;
    this.paymentSumForm.patchValue({ "paymentSumNo": "" });
    this.resetListingFilter()
    this.transactionSearch.reset();
    if (value == 'broker') {
      this.showBroker = true;
      this.showPayable = false;
      this.showCompany = false;
      this.showFirst = false;
      this.broker(value);
    } else if (value == 'cardholder') {
      this.showBroker = false;
      this.showPayable = true;
      this.showCompany = false;
      this.showFirst = true;
      this.submitPaymentGenerateForm(this.paymentGenerateForm)
    }
    else if (value == 'companie') {
      this.showBroker = false;
      this.showPayable = false;
      this.showCompany = true;
      this.showFirst = false;
      this.CompanyRefundSteps();
    } else if (value == 'provider') {
      this.showBroker = false;
      this.showPayable = true;
      this.showCompany = false;
      this.showFirst = true;
      this.submitPaymentGenerateForm(this.paymentGenerateForm)
    } else if (value == 'all') {
      if (this.paymentGenerateForm.value.planType == "S") {
        this.showBroker = false;
        this.showPayable = true;
        this.showCompany = false;
        this.SelectedAll = true;
        this.showFirst = true;
      } else {
        this.showBroker = true;
        this.showPayable = true;
        this.showCompany = true;
        this.SelectedAll = true;
        this.showFirst = true;
      }
      this.submitPaymentGenerateForm(this.paymentGenerateForm)
    }
  }
  /**
    * Filter Comapany Saerch List
    * @param tableId 
    */
  filterListSearch(tableId: string) {
    this.getLowerSearch = true
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable("ListTable", obj);
    var dateParams = [3];
    var url = FinanceApi.payableTransactions;
    this.finalTotal = '$0.00';
    this.total = 0;
    $('.scroll-ListTable').scrollTop(0);
    this.dataTableService.jqueryDataTableReload("ListTable", url, this.reqParam);
    this.payableSumKeyArray = []; this.companySumKeyArray.length = []; this.brokerSumKeyArray.length = [];
    this.refernceCd =[];
    this.changeFilterDateFormat({ reason: 2, value: this.changeDateFormatService.convertDateObjectToString(this.todayDate) }, 'filter_createdOn')
  }

  filterSearch() {
    this.transactionSearch.reset()
    this.transactionSearch.patchValue({ 'paymentType': '' })
    this.transactionSearch.patchValue({ 'paySelection': '' })
    this.transactionSearch.patchValue({ 'payBanktype': '' })
    $('.scroll-ListTable').scrollTop(0)
    this.getLowerSearch = true
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable("ListTable", obj);
    var dateParams = []
    var url = FinanceApi.payableTransactions;
    this.finalTotal = '$0.00';
    this.total = 0;
    this.payableSumKeyArray = []; this.companySumKeyArray.length = []; this.brokerSumKeyArray.length = [];
    this.refernceCd =[];
    params.push({
      "key": "ppayeeType", "value": this.payeeTypeArray
    });
    params.push({
      "key": "ppaymentMethod", "value": this.payeeMethodArray
    });
    params.push({
      "key": "ptransactionType", "value": this.transTypeArray
    });
    if (this.rangeStartDate != ' ') {
      params.push({
        "key": "trxnStartDate", "value": this.rangeStartDate || this.changeDateFormatService.convertDateObjectToString(this.constantDate.beginDate)
      });
    }
    if (this.rangeEndDate != ' ') {
      params.push({
        "key": "trxnEndDate", "value": this.rangeEndDate || this.changeDateFormatService.convertDateObjectToString(this.constantDate.endDate)
      });

      params.push({"key": "planTypeCd", "value": this.paymentGenerateForm.value.planType})
    }
    this.resetList()
    $('.scroll-ListTable').scrollTop(0);
    this.dataTableService.jqueryDataTableReload("ListTable", url, params, dateParams)
  }
  /**
  * Reset Comapany List Filter
  */
  resetListingFilter() {
    this.transactionSearch.reset()
    this.transactionSearch.patchValue({ 'paymentType': '' })
    this.transactionSearch.patchValue({ 'paySelection': '' })
    this.transactionSearch.patchValue({ 'payBanktype': '' })
    var date = new Date();
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.model = { 'beginDate': this.changeDateFormatService.getMonthBackDate().fromDate.date, 'endDate': this.changeDateFormatService.getMonthBackDate().toDate.date};
    this.selectedItems = [];
    this.dataTableService.resetTableSearch();
    this.filterListSearch("ListTable")
    $('#ListTable .icon-mydpremove').trigger('click');
    this.filter_transactionType = [];
    this.transTypeArray = [];
    this.selectedItem = [];
    this.payeeMethodArray =[]
    this.payeeTypeArray = []
  }
  /**
  * filter the search on press enter
  * @param event 
  * @param tableId 
  */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.filterListSearch(tableId);
    }
  }

  broker(event = null) {
    // Generate Broker Payment 
    if (this.paymentGenerateForm.valid) {
      if (this.brokerfieldArray == []) {
        let fieldArr = {
          "id": 1,
          "done": "0",
          "step": "1",
          "processing": "Retrieving all the pending broker payments to as of ",
          "result": "Processing"
        }
        this.brokerfieldArray.push(fieldArr)
      } else {
        this.brokerfieldArray =
          [{
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Retrieving all the pending broker payments to as of ",
            "result": "Done"
          }]
      }
      this.step1RetrieveAllPending().then(res => {
        if (this.apiResponse == 1) {
          this.update = {
            "id": 1,
            "done": "1",
            "step": "1",
            "ocessing": "Retrieving all the pending broker payments to as of ",
            "result": "Done"
          }
          this.showBRUpdatedItem(this.update);
          this.checkingParamsArr = {
            "id": 2,
            "done": "0",
            "step": "2",
            "processing": "Generating Broker Payment Payable Data",
            "result": "Processing"
          }
          this.brokerfieldArray.push(this.checkingParamsArr)
        } else {
          this.ToastrService.error(this.step1ErrorMessage);
        }
      })
    }
    else {
      this.ToastrService.error(this.translate.instant('uft.toaster.pleaseSelectCorporateType'));
      this.validateAllFormFields(this.paymentGenerateForm)
    }
  }


  step1RetrieveAllPending() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.retrieveAllPending;
      var paramData = {
        "planTypeCd": "Q",
        "originatorRoleCd": "C"
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
        }
      })
      this.BrokerPaymentSteps();
    })
    return promise;
  }
  BrokerPaymentSteps() {
    this.step2BrokerPayable().then(res => {
      if (this.apiResponse == 1) {
        this.update = {
          "id": 2,
          "done": "1",
          "step": "2",
          "processing": "Generating Broker Payment Payable Data",
          "result": this.payableTotalsResponse
        }
        this.showBRUpdatedItem(this.update)
        if (this.paymentGenerateForm.value.planType == 'Q' && this.paymentGenerateForm.value.payeetype == 'all') {
            this.CompanyRefundSteps();
        }
      } else {
        this.ToastrService.error(this.step2ErrorMessage);
      }
    })
  }
  step1_1BrokerPendingData() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerPendingData;
      this.asOfDateValue = this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.asOfDate)
      this.todayDate = this.changeDateFormatService.getToday();
      var paramData = {
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(data.result.brokerPeningFile);
          let fileURL = this.pdfUrl.changingThisBreaksApplicationSecurity
          let fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1, fileURL.length) || fileURL;
          this.pdfName = fileName
          this.apiResponse = 1;
          resolve();
        } else {
          this.step1ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }

  step2BrokerPayable() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerPayable;
      var paramData = {
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "minChequeAmt": 50
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.paymentRunKey = data.result.paymentRunKey
          this.payableTotalsResponse = 'Total Broker Payable: ' + data.result.payableTotals
          this.apiResponse = 1;
          resolve();
        } else {
          this.step2ErrorMessage = data.hmsMessage.messageShort
          this.payableTotalsResponse = 'Total Broker Payable: ' + 0
          this.apiResponse = 1;
          resolve();
        }
      },(error)=> {
          this.payableTotalsResponse = 'Total Broker Payable: ' + 0
          this.apiResponse = 1
          resolve();
      });
      if (this.paymentGenerateForm.value.planType == 'Q' && this.paymentGenerateForm.value.payeetype == 'all') {
      } else {
        this.showTable = true;
        setTimeout(() => {
          this.getBrokersList();
        }, 200);
      }
    })
    return promise;
  }
  step3GeneratingEft() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generatingEft;
      var paramData = {
        "payableTransactionKeys": this.brokerTansectionArray,
        "spaymentRunKey": this.arrayString(this.brokerSumKeyArray),
        "payableSumKey": this.payableSumKey,
        "eftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
      }
      let planType = this.paymentGenerateForm.value.planType || "Q"
      if (planType == "Q") {
        paramData = Object.assign(paramData, {
          "ppayableTransaction": this.arrayString(this.brokerTansectionArray),
        });
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalEftRecordsResponse = 'Total EFT Records: ' + data.result.eftTotal;
          this.payableSumKey = data.result.payableSumKey
          this.ppayableSumKeyArray.push(data.result.payableSumKey)
          this.apiResponse = 1;
          resolve();
        } else {
          this.step3ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 1;
          this.totalEftRecordsResponse = 'Total EFT Records: 0';
          resolve();
        }
      },(error) => {
        this.totalEftRecordsResponse = 'Total EFT Records: 0';
        this.apiResponse = 1;
        resolve();
      })
    })
    return promise;
  }
  step4GeneratingChequeCo() {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.CoRefundChq;
      var paramData = {
        "payableTransactionKeys": this.companyTansectionArray,
        "spaymentRunKey": this.arrayString(this.companySumKeyArray),
        "payableSumKey": this.payableSumKey,
        "paymentRunKey": this.paymentRunKey || this.lastSelectedPaymentSumKey,
        "coEftDueDt": this.changeDateFormatService.convertDateObjectToString(this.todayDate),
      }
      let planType = this.paymentGenerateForm.value.planType || "Q"
      if (planType == "Q") {
        paramData = Object.assign(paramData, {
          "ppayableTransaction": this.arrayString(this.companyTansectionArray),
        });
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalChequeRecordsResponse = 'Total Cheque Records: ' + data.result.chequeTotal;
          this.payableSumKey = data.result.payableSumKey;
          this.ppayableSumKeyArray.push(data.result.payableSumKey)
          this.apiResponse = 1;
          resolve();
        } else {
          this.step4ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 1
          this.totalChequeRecordsResponse = 'Total Cheque Records: ' + 0;
          resolve();
        }
      }, (error) => {
        this.apiResponse = 1
        this.totalChequeRecordsResponse = 'Total Cheque Records: ' + 0;
        resolve();
      })
    })
    this.chequePrintCompany() // New step added to show cheque print file url in Grid steps as discussed with Arun sir
    return promise;
  }
  step4GeneratingCheque() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generatingCheque;
      var paramData = {
        "payableTransactionKeys": this.brokerTansectionArray,
        "spaymentRunKey": this.arrayString(this.brokerSumKeyArray),
        "payableSumKey": this.payableSumKey,
      }
      let planType = this.paymentGenerateForm.value.planType || "Q"
      if (planType == "Q") {
        paramData = Object.assign(paramData, {
          "ppayableTransaction": this.arrayString(this.brokerTansectionArray),
        });
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalChequeRecordsResponse = 'Total Cheque Records: ' + data.result.chequeTotal;
          this.payableSumKey = data.result.payableSumKey
          this.ppayableSumKeyArray.push(data.result.payableSumKey)
          this.apiResponse = 1;
          resolve();
        } else {
          this.step4ErrorMessage = data.hmsMessage.messageShort
          this.totalChequeRecordsResponse = 'Total Cheque Records: 0';
          this.apiResponse = 1;
          resolve();
        }
      },(error) => {
        this.totalChequeRecordsResponse = 'Total Cheque Records: 0';
        this.apiResponse = 1;
        resolve();
      })
    })
    return promise;
  }

  step5ExportEft() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.exportEft;
      var paramData = {
        'payableTransactionKeys': this.brokerTansectionArray,
        "brokerPaySumKey": this.payableSumKey,
        "originatorRoleCd": "C"
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && (data.hmsMessage.messageShort == 'RECORDS_GET_SUCCESSFULLY' || data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY')) {
          this.exportEftResponse = 'Exporting EFT File';
          if (data.result.exportFilePath) {
            this.exportFilePath = data.result.exportFilePath
          } else {
            this.exportFilePath = ''
          }
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.exportEftResponse = 'Record Not Found';
          this.apiResponse = 1;
          resolve();
        } else {
          this.step5ErrorMessage = data.hmsMessage.messageShort
          this.exportEftResponse = 'Record Not Found';
          this.apiResponse = 1;
          resolve();
        }
      },(error) => {
        this.exportEftResponse = 'Record Not Found';
        this.apiResponse = 1;
        resolve();
      })
    })
    return promise;
  }
  step5_1BrokerEftPaymentSummary() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerEftPaymentSummary;
      var paramData = {
        "spaymentRunKey": this.arrayString(this.brokerSumKeyArray),
        "payableSumKey": this.payableSumKey,
        "payableTransactionKeys": this.brokerTansectionArray,
        "brokerPaySumKey": this.paymentRunKey || this.lastSelectedPaymentSumKey,
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && (data.hmsMessage.messageShort == 'RECORDS_GET_SUCCESSFULLY' || data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY')) {
          if (data.result.filePath) {
            this.brokerEftPaymentSummaryResponse = '<p>' + data.result.filePath + '</p><p>' + this.exportFilePath;
          } else {
            this.brokerEftPaymentSummaryResponse = '<p>' + this.exportFilePath + '</p>';
          }
          this.apiResponse = 2;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.brokerEftPaymentSummaryResponse = 'EFT Not Generated ';
          this.apiResponse = 2;
          resolve();
        } else {
          this.step5_1ErrorMessage = data.hmsMessage.messageShort
          this.brokerEftPaymentSummaryResponse = 'EFT Not Generated ';
          this.apiResponse = 2;
          resolve();
        }
      },(error) => {
        this.brokerEftPaymentSummaryResponse = 'EFT Not Generated ';
        this.apiResponse = 2;
        resolve();
      })
    })
    this.getBrokerReports();
    return promise;
  }

  step6BrokerPrintingCheques() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerPrintingCheques;
      var paramData = {
        "eftBrokerSumKey": this.payableSumKey
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.brokerPrintingChequeResponse = ''
          this.apiResponse = 1;
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.brokerPrintingChequeResponse = '';
          this.apiResponse = 1;
        } else {
          this.brokerPrintingChequeResponse = ''
          this.apiResponse = 1;
          this.step6ErrorMessage = data.hmsMessage.messageShort
        }
        this.step6_1BrokerChequeList().then(res => {
          resolve();
        });
      },(error) => {
        this.apiResponse = 1
        this.step6_1BrokerChequeList().then(res => {
          resolve();
        });
      })
    })
    return promise;
  }

  step7BrokerPaymentSummaryReport() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerPaymentSummaryReport;
      var paramData = {
        "brokerPaySumKey": this.paymentRunKey || this.lastSelectedPaymentSumKey,
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.brokerPaymentSummaryReportResponse = '<a href="' + data.result.filePath + '">' + data.result.filePath + '</a>'
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.brokerPaymentSummaryReportResponse = 'File Not Generated';
          this.apiResponse = 1;
          resolve();
        } else {
          this.brokerPaymentSummaryReportResponse = 'File Not Generated'
          this.apiResponse = 1;
          this.step7ErrorMessage = data.hmsMessage.messageShort
          resolve();
        }
      },(error) => {
        this.brokerPaymentSummaryReportResponse = 'File Not Generated'
        this.apiResponse = 1;
        resolve();
      })
    })
    return promise;
  }

  step6_1BrokerChequeList() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerChequeList;
      var paramData = {
        "payableSumKey": this.payableSumKey,
        "brokerPaySumKey": this.paymentRunKey || this.lastSelectedPaymentSumKey,
        "asOfDate": this.asOfDateValue
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          let filePath = data.result.filePath;
          if (filePath != 'FILE_NOT_GENERATED') {
            filePath = '<a href="' + data.result.filePath + '">' + data.result.filePath + '</a>'
          }
          let brokerPrintChequeFilePath = data.result.brokerPrintChequeFilePath;
          if (brokerPrintChequeFilePath != 'FILE_NOT_GENERATED') {
            brokerPrintChequeFilePath = '<a href="' + data.result.brokerPrintChequeFilePath + '">' + data.result.brokerPrintChequeFilePath + '</a>'
          }
          let brokerPayableChequeFilePath = data.result.brokerPayableChequeFilePath;
          if (brokerPayableChequeFilePath != 'FILE_NOT_GENERATED') {
            brokerPayableChequeFilePath = '<a href="' + data.result.brokerPayableChequeFilePath + '">' + data.result.brokerPayableChequeFilePath + '</a>'
          }
          this.brokerChequeListResponse = '<p>' + filePath + '</p><p>' + brokerPrintChequeFilePath + '</p><p>' + brokerPayableChequeFilePath + '</p>';
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.brokerChequeListResponse = 'File Not Generated';
          this.apiResponse = 1;
          resolve();
        } else {
          this.brokerChequeListResponse = 'File Not Generated'
          this.apiResponse = 1;
          this.step6_1ErrorMessage = data.hmsMessage.messageShort
          resolve();
        }
        this.getBrokerReports();
      },(error) => {
          this.brokerChequeListResponse = 'File Not Generated'
          this.apiResponse = 1;
          resolve();
      })
    })
    return promise;
  }
  selectUnSelectAllCategory(type, event) {
  }
  attachedClaimStatusChange(event) {
    this.showFirst = false;
    this.showFirstSecond = false
    this.businessType = event.target.value;
    this.diciplinePopupArr = ["D", "V", "DR", "H", "HS", "W"]
    this.tarnsTypes = [];
    this.resetListingFilter();
    this.receivableAdjustmentsComponent.getNegativeTransactionList(this.businessType);
    this.receivableAdjustmentsComponent.getReceiptsList(this.businessType);

    if (this.businessType == 'Q') {
      // this.adscSelected =true
      this.payeeTypeArray = [];
      this.rulesDropDown = [];
      this.fieldArray = [];
      this.brokerfieldArray = [];
      this.comapnyfieldArray = [];
      $('.tableGrid').show()
      this.hideFields = false
      this.Payeetype = [
        { 'id': 'all', 'itemName': "All" },
        { 'id': 'broker', 'itemName': "Brokers" },
        { 'id': 'cardholder', 'itemName': "Cardholders" },
        { 'id': 'companie', 'itemName': "Companies" },
        { 'id': 'provider', 'itemName': "Providers" }
      ];

      for (let k = 0; k < this.filter_Payeetype.length; k++) {
        this.rulesDropDown.push({ 'id': this.filter_Payeetype[k].id, 'itemName': this.filter_Payeetype[k].itemName });
      };
      for (let i = 0; i < this.tempTransTypes.length; i++) {
        this.tarnsTypes.push({ 'id': this.tempTransTypes[i].id, 'itemName': this.tempTransTypes[i].itemName });
      };

    } else {
      //-----------------adding changes by taking refrences from QSI PAYABLE (Loveleen)------------------
      this.payeeTypeArray = [];
      this.fieldArray = [];
      this.rulesDropDown = [];
      this.brokerfieldArray = [];
      this.comapnyfieldArray = [];
      $('.tableGrid').show()
      this.hideFields = false;

      this.showBroker = false;
      this.showCompany = false;
      this.diciplinePopupArr = ["D"] 
      this.paymentGenerateForm.patchValue({ 'payeetype': 'all' })
      // $('.tableGrid').hide()   
      // this.hideFields = true   
      this.Payeetype = [
        { 'id': 'all', 'itemName': "All (Cardholders,Providers)" },
      ];
      
      this.rulesDropDown.push({'id': 'C', 'itemName': 'Cardholder'}, {'id': 'D', 'itemName': 'Provider'});
      this.tarnsTypes.push({ 'id': 'CP', 'itemName': 'Claim Payment' });
    }
  }

  /**
    * Select unselect bebefits category
    * @param row 
    * @param event 
    */
  selectUnSelectCategory(row, event) {
    let self = this
    if (event.target.checked) {
    }
  }
  /**
    * Call When Coverage Category Row Clicked
    * @param row 
    * @param event 
    */
  selectedRow(row, event) {
  }
  /**
   * Return Benefit category table inputbox html
   * @param fieldValue 
   * @param fieldName 
   */

  ngOnInit() {
    this.selectedItem = [];
    this.payeeMethodArray =[];
    this.selectedItems = [];
    this.diciplinePopupArr = ["D", "V", "DR", "H", "HS", "W"]
    this.getSumAmount();
    this.getSystemParameter('');
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

    this.transactionSearch = new FormGroup({
      "paymentType": new FormControl('', [Validators.required]),
      'payeetype': new FormControl(''),
      'paySelection': new FormControl('', [Validators.required]),
      'payBanktype': new FormControl('', [Validators.required]),
    });

    this.paymentGenerateForm = new FormGroup({
      'payeetype': new FormControl(''),
      'paymentType': new FormControl(''),
      'disciplinePopupChk': new FormControl(''),
      'vision': new FormControl(''),
      'health': new FormControl(''),
      'drug': new FormControl(''),
      'supplement': new FormControl(''),
      'wellness': new FormControl(''),
      'planType': new FormControl(''),
      'effectiveOn': new FormControl(''),
      'confirmationNo': new FormControl(''),
      'companyNo': new FormControl(''),
      'cardholder': new FormControl(''),
      'provider': new FormControl(''),
    })
    this.paymentGenerateForm.patchValue({ 'planType': 'Q' });
    this.getBankTypes()
    this.paymentSumForm = new FormGroup({
      'paymentSumNo': new FormControl('', [Validators.required, CustomValidators.onlyNumbers]),
    })
    this.staleChequeForm = new FormGroup({
      'dateAsOf': new FormControl('', [Validators.required]),
      'businessTypeKey': new FormControl('', [Validators.required])
    })
    this.cancelAndReissueForm = new FormGroup({
      'CancelAndReissuePaymentKey': new FormControl('', [Validators.required]),
    })
    this.cashReceiptForm = new FormGroup({
      'discipline': new FormControl(''),
      'confirmId': new FormControl('', [Validators.required, CustomValidators.onlyNumbers]),
    })
    this.dataTableInitialize();
    this.getTransactionStatus();
    this.getTransactionStatusLower();
    this.getPayee();
    this.getPayeeLower();
    this.getTransactionType();
    this.getTransactionTypeLower();
    this.getBusinessType();
    this.getDiscilipinList();
    this.getBrokersList();
    var self = this
    $(document).on('keydown', '#transactionSearchList .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', 'View');
    })
    $(document).on('keydown', '#ListTable .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    });
    this.paymentGenerateForm.patchValue({
      "payeetype": "all"
    })
    this.dropdownSettings = {
      singleSelection: false,
      text: "Payee Type",
      enableCheckAll: false,
      badgeShowLimit: true,
      enableSearchFilter: false,
      classes: "myclass notInCaps custom-class",
      disabled: false,
    };
    this.transDropdownSettings = {
      singleSelection: false,
      text: "Transaction Type",
      enableCheckAll: false,
      badgeShowLimit: true,
      enableSearchFilter: false,
      classes: "myclass transType notInCaps custom-class",
      disabled: false,
    };
    this.dropdownSetting = {
      singleSelection: false,
      text: "Payment Method",
      enableCheckAll: false,
      badgeShowLimit: true,
      enableSearchFilter: false,
      classes: "myclass notInCaps custom-class",
      disabled: false,
    };
    for (let k = 0; k < this.filter_Payeetype.length; k++) {
      this.rulesDropDown.push({ 'id': this.filter_Payeetype[k].id, 'itemName': this.filter_Payeetype[k].itemName });
    };
    let tempArray = ['Paper', 'Electronic'];
    for (let i = 0; i < tempArray.length; i++) {
      this.paymentMethod.push({ 'id': tempArray[i], 'itemName': tempArray[i] });
    };
    
    // let tempTransTypes = ['Claim Payment', 'Broker Payment'];

    for (let i = 0; i < this.tempTransTypes.length; i++) {
      this.tarnsTypes.push({ 'id': this.tempTransTypes[i].id, 'itemName': this.tempTransTypes[i].itemName });
    };
    $(document).on('click', '#ListTable .listTableCheck', function (event) {
      self.fieldArraySecond = [];
      self.comapnyfieldArraySecond = [];
      self.brokerfieldArraySecond = [];
      self.showFirstSecond = false;
      self.showBrokerSecond = false;
      self.showCompanySecond = false;
      self.showLoader = true
      var rowData = $(this).data('val');
      if ($(this).prop("checked") == true) {
        if (rowData.recInd == 'F') {
          self.refernceCd.push(rowData.referenceCd)
          if (rowData.payeeType == "Cardholder") {
            self.cardholderSelected.push("1")
            self.payeeTansectionArray.push(rowData.payabletransactionKey);
            self.payableSumKeyArray.push(rowData.paymentSumKey);
          } else if (rowData.payeeType == "Company") {
            self.companyTansectionArray.push(rowData.payabletransactionKey);
            self.companySumKeyArray.push(rowData.paymentSumKey);
          } else if (rowData.payeeType == "Broker") {
            self.brokerTansectionArray.push(rowData.payabletransactionKey);
            self.brokerSumKeyArray.push(rowData.paymentSumKey);
          } else if (rowData.payeeType == "Provider") {
            self.providerSelected.push("1")
            self.payeeTansectionArray.push(rowData.payabletransactionKey);
            self.payableSumKeyArray.push(rowData.paymentSumKey);
          } else {
            self.otherSelected.push("1")
            self.payeeTansectionArray.push(rowData.payabletransactionKey);
            self.payableSumKeyArray.push(rowData.paymentSumKey);
          }
          self.checkSelectedAll();
          self.total = self.total + (rowData.transactionAmount * 1);
          self.finalTotal = self.currentUserService.convertAmountToDecimalWithDoller(self.total);
          self.lastSelectedPaymentSumKey = rowData.paymentSumKey;
          self.issuePayment = self.issuePayment + 1
        } else {
          /* To Issue Payment for negative transactions */
          self.refernceCd.push(rowData.referenceCd)
          if (rowData.payeeType == "Cardholder") {
            self.cardholderSelected.push("1")
            self.payeeTansectionArray.push(rowData.payabletransactionKey);
            self.payableSumKeyArray.push(rowData.paymentSumKey);
          } else if (rowData.payeeType == "Company") {
            self.companyTansectionArray.push(rowData.payabletransactionKey);
            self.companySumKeyArray.push(rowData.paymentSumKey);
          } else if (rowData.payeeType == "Broker") {
            self.brokerTansectionArray.push(rowData.payabletransactionKey);
            self.brokerSumKeyArray.push(rowData.paymentSumKey);
          } else if (rowData.payeeType == "Provider") {
            self.providerSelected.push("1")
            self.payeeTansectionArray.push(rowData.payabletransactionKey);
            self.payableSumKeyArray.push(rowData.paymentSumKey);
          } else {
            self.otherSelected.push("1")
            self.payeeTansectionArray.push(rowData.payabletransactionKey);
            self.payableSumKeyArray.push(rowData.paymentSumKey);
          }
          self.checkSelectedAll();
          self.lastSelectedPaymentSumKey = rowData.paymentSumKey;
          self.total = self.total + (rowData.transactionAmount * 1);
          self.finalTotal = self.currentUserService.convertAmountToDecimalWithDoller(self.total);
          self.reciveClaim.push(rowData.payabletransactionKey);
          self.recordRecived = self.recordRecived + 1;
        }
      }

      else if ($(this).prop("checked") == false) {
        if (rowData.recInd == 'F') {
          let checkKey = rowData.paymentSumKey;
          let i = self.refernceCd.indexOf(rowData.referenceCd);
          if (i !== -1) self.refernceCd.splice(i, 1);
          if (rowData.payeeType == "Cardholder") {
            self.cardholderSelected.pop()
            let index = self.payableSumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.payableSumKeyArray.splice(index, 1);
            let payInd = self.payeeTansectionArray.indexOf(rowData.payabletransactionKey)
            if (payInd !== -1) self.payeeTansectionArray.splice(payInd, 1);
          } else if (rowData.payeeType == "Company") {
            let index = self.companySumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.companySumKeyArray.splice(index, 1);
            let coInd = self.companyTansectionArray.indexOf(rowData.payabletransactionKey)
            if (coInd !== -1) self.companyTansectionArray.splice(coInd, 1);
          } else if (rowData.payeeType == "Broker") {
            let index = self.brokerSumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.brokerSumKeyArray.splice(index, 1);
            let brInd = self.brokerTansectionArray.indexOf(rowData.payabletransactionKey)
            if (brInd !== -1) self.brokerTansectionArray.splice(brInd, 1);
          } else if (rowData.payeeType == "Provider") {
            self.providerSelected.pop()
            let index = self.payableSumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.payableSumKeyArray.splice(index, 1);
            let payInd = self.payeeTansectionArray.indexOf(rowData.payabletransactionKey)
            if (payInd !== -1) self.payeeTansectionArray.splice(payInd, 1);
          } else {
            // otherSelected
            self.otherSelected.pop()
            let index = self.payableSumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.payableSumKeyArray.splice(index, 1);
            let payInd = self.payeeTansectionArray.indexOf(rowData.payabletransactionKey)
            if (payInd !== -1) self.payeeTansectionArray.splice(payInd, 1);
          }
          self.total = self.total - (rowData.transactionAmount * 1);
          self.finalTotal = self.currentUserService.convertAmountToDecimalWithDoller(self.total);
          self.unChecked();
          self.issuePayment = self.issuePayment - 1
        } else {
          /* To Isuse Payment button functionality for negative transactions */
          let i = self.refernceCd.indexOf(rowData.referenceCd);
          if (i !== -1) self.refernceCd.splice(i, 1);
          if (rowData.payeeType == "Cardholder") {
            self.cardholderSelected.pop()
            let index = self.payableSumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.payableSumKeyArray.splice(index, 1);
            let payInd = self.payeeTansectionArray.indexOf(rowData.payabletransactionKey);
            if (payInd !== -1) self.payeeTansectionArray.splice(payInd, 1);
          } else if (rowData.payeeType == "Company") {
            let index = self.companySumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.companySumKeyArray.splice(index, 1);
            let coInd = self.companyTansectionArray.indexOf(rowData.payabletransactionKey)
            if (coInd !== -1) self.companyTansectionArray.splice(coInd, 1);
          } else if (rowData.payeeType == "Broker") {
            let index = self.brokerSumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.brokerSumKeyArray.splice(index, 1);
            let brInd = self.brokerTansectionArray.indexOf(rowData.payabletransactionKey)
            if (brInd !== -1) self.brokerTansectionArray.splice(brInd, 1);
          } else if (rowData.payeeType == "Provider") {
            self.providerSelected.pop()
            let index = self.payableSumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.payableSumKeyArray.splice(index, 1);
            let payInd = self.payeeTansectionArray.indexOf(rowData.payabletransactionKey);
            if (payInd !== -1) self.payeeTansectionArray.splice(payInd, 1);
          } else {
            self.otherSelected.pop()
            let index = self.payableSumKeyArray.indexOf(rowData.paymentSumKey);
            if (index !== -1) self.payableSumKeyArray.splice(index, 1);
            let payInd = self.payeeTansectionArray.indexOf(rowData.payabletransactionKey);
            if (payInd !== -1) self.payeeTansectionArray.splice(payInd, 1);
          }
          self.unChecked();
          self.total = self.total - (rowData.transactionAmount * 1);
          self.finalTotal = self.currentUserService.convertAmountToDecimalWithDoller(self.total);
          let index = self.reciveClaim.indexOf(rowData.payabletransactionKey);
          if (index !== -1) self.reciveClaim.splice(index, 1);
          self.recordRecived = self.recordRecived - 1;
        }
      }
      let holder = {}
      self.showLoader = false
    });
    $(document).on('click', '.selectAll', function (event) {
      self.showLoader = true
      let checked = $(this).prop('checked');
      $('#ListTable .listTableCheck').each(function (i) {
        if (checked) {
          self.Checked();
          if (!$(this).prop('checked')) {
            $(this).trigger('click');
          }
        } else {
          self.unChecked();
          if ($(this).prop('checked')) {
            $(this).trigger('click');
          }
        }
        self.showLoader = false
      });
      self.showLoader = false
    })
    $(document).on('change', 'select', function () {
      let name = $(this).attr('name');
      if (name == 'ListTable_length') {
        checkall()
      }
      self.showLoader = false
    });
    function checkall() {
      if ($('.selectAll').prop("checked")) {
        setTimeout(() => {
          $('#ListTable .listTableCheck').each(function (i) {
            $(this).trigger('click');
          });
        }, 1500);
      }
    }
    this.dataTableInitializePayableReportList();
  }

  dataTableInitializePayableReportList() {
    this.observablePayableReportObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.payableReportColumns = [
          { title: 'Name', data: 'paramName' },
          { title: 'Type', data: 'paramType' },
          { title: 'Issued Date', data: 'paramIssuedDate' },
          { title: 'Action', data: 'hmsPayRptKey' },
        ]
        this.observablePayableReportObj.unsubscribe();
        this.getPayableReportList()
      }
    });
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#ListTables .download-ico', function () {
      let filePath = $(this).data('id');
      if (filePath != undefined) {
        window.open(filePath, '_blank');
      }
    });

    $(document).on('click', '#payableReportList .download-ico', function () {
      let hmsRptKey = $(this).data('id');
      self.hmsPayRptKey = hmsRptKey
      self.getGeneratePayableRptZip(self.hmsPayRptKey)
    })
  }

  eventListener($event: GtEvent) {
    if ($event.name === 'gt-row-clicked') {
      if ($event.value.row.ischecked) {
      }
    }
  }
  // refer review-claim.component
  onSelectFocus(e) {
    if (this.payableSumKeyArray.length <= 0 && this.companySumKeyArray.length <= 0 && this.brokerSumKeyArray.length <= 0) {
      this.transactionSearch.patchValue({ 'paymentType': '' })
      this.ToastrService.error(this.translate.instant('uft.toaster.errorNoTransectionIsSelected'))
      return false
    } else {
      this.transactionSearch.patchValue({
        'paymentType': "E"
      })
    }
  }
  paySelectionFocus(e) {
    let self = this;
    if ($('.selectAll').prop('checked')) {
      this.transactionSearch.patchValue({
        "paySelection": "1"
      })
    } else {
      if (this.payableSumKeyArray.length <= 0 && this.companySumKeyArray.length <= 0 && this.brokerSumKeyArray.length <= 0) {
        this.transactionSearch.patchValue({ 'paymentType': '' })
        this.transactionSearch.patchValue({ 'paySelection': '' })
        this.ToastrService.error(this.translate.instant('uft.toaster.errorNoTransectionIsSelected'))
        return false
      } else {
        this.transactionSearch.patchValue({
          "paySelection": "2"
        })
      }
    }
  }

  bankChange(e) {
  }
  onDeSelectDropDown(item) {
    const index = this.payeeTypeArray.indexOf(item.id);
    if (index > -1) {
      this.payeeTypeArray.splice(index, 1);
    }
  }
  onDeSelectDropDown2(item) {
    const index = this.payeeMethodArray.indexOf(item.id);
    if (index > -1) {
      this.payeeMethodArray.splice(index, 1);
    }
  }
  onDeSelectDropDown3(item) {
    const index = this.transTypeArray.indexOf(item.itemName);
    if (index > -1) {
      this.transTypeArray.splice(index, 1);
    }
  }
  onSelectDropDown(item: any) {
    this.selctedDropDownVal = item.id
    this.payeeTypeArray.push(item.id);
  }
  onSelectDropDown2(item: any) {
    this.payeeMethodArray.push(item.id);
  }
  onSelectDropDown3(item: any) {
    this.transTypeArray.push(item.itemName);
  }
  onChangePlanType(e) {
    this.selectedPlanType = e;
    if (this.selectedPlanType == 'S') {
      this.hideFields = true
      for (var i = 0; i < this.diciplinePopupArr.length; i++) {
        if (this.diciplinePopupArr[i] == 'DR') {
          this.diciplinePopupArr.splice(i, 1);
        }
      }
    } else if (this.selectedPlanType == 'Q') {
      this.hideFields = false;
      this.disciplineArr.push('DR')
    }
  }

  dataTableInitialize() {
    // Get the Translation of Dental Service List using Observable 
    this.ObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.check) {
        if ('feeGuide.dentalService.serviceId' == this.translate.instant('feeGuide.dentalService.serviceId')) {
        } else {
          this.columns = [
            { title: this.translate.instant('finance.transactionSearch.discipline'), data: 'discipline' },
            { title: this.translate.instant('finance.transactionSearch.transNo'), data: 'paymentKey' },
            { title: this.translate.instant('finance.transactionSearch.issuedDate'), data: 'issueDate' },
            { title: this.translate.instant('finance.transactionSearch.chequeRefNo'), data: 'chequeRefNo' },
            { title: this.translate.instant('finance.transactionSearch.transStatusCode'), data: 'tranStatCd' },
            { title: this.translate.instant('finance.transactionSearch.debitAmount'), data: 'debitAmount' },
            { title: this.translate.instant('finance.transactionSearch.adminFee'), data: 'adminFee' },
            { title: this.translate.instant('finance.transactionSearch.generatedDate'), data: 'generatedDate' },
            { title: this.translate.instant('finance.transactionSearch.tranStatus'), data: 'transStatus' },
            { title: this.translate.instant('finance.transactionSearch.clearSeq'), data: 'clearSeq' },
            { title: this.translate.instant('finance.transactionSearch.cancelledDate'), data: 'cancelDate' },
            { title: this.translate.instant('finance.transactionSearch.tranType'), data: 'transType' },
            { title: this.translate.instant('finance.transactionSearch.businessType'), data: 'sbusType' },
            { title: this.translate.instant('finance.transactionSearch.processDate'), data: 'processDate' },
            { title: this.translate.instant('finance.transactionSearch.payee'), data: 'payee' },
            { title: this.translate.instant('finance.transactionSearch.action'), data: 'paymentKey' }
          ];
          this.check = false
          if (this.currentUserService.transactionQueryParams) {
            this.showLoader = false
            this.transactionParams = this.currentUserService.transactionQueryParams
            this.hideSearch = this.transactionParams.fromClaim
            this.transactionSearchClaimCheque()
          } else {
            this.showLoader = false
            this.hideSearch = true
          }
          this.ObservableObj.unsubscribe();
          if (this.FinanceService.companySearchedData && this.FinanceService.isBackCompanySearch) {
            this.transactionSearch.patchValue(this.FinanceService.companySearchedData)
            if (this.transactionSearch.value.disciplinesChkDental) {
              this.disciplineArr.push("D")
            }
            if (this.transactionSearch.value.disciplinesChkVision) {
              this.disciplineArr.push("V")
            }
            if (this.transactionSearch.value.disciplinesChkDrug) {
              this.disciplineArr.push("DR")
            }
            if (this.transactionSearch.value.disciplinesChkHealth) {
              this.disciplineArr.push("H")
            }
            if (this.transactionSearch.value.disciplinesChkSupplement) {
              this.disciplineArr.push("HS")
            }
            this.transactionSearch.value.TransName
            if (this.transactionSearch.value.TransName == 'Transaction Number') {
              this.selectedTransSearchRadioName = 'transactionNo'
            } else if (this.transactionSearch.value.TransName == 'Transaction Range') {
              this.selectedTransSearchRadioName = 'transactionRange'
            } else if (this.transactionSearch.value.TransName == 'Transaction Date Range') {
              this.selectedTransSearchRadioName = 'transactionDateRange'
            } else if (this.transactionSearch.value.TransName == 'Cheque Number') {
              this.selectedTransSearchRadioName = 'chequeNo'
            } else if (this.transactionSearch.value.TransName == 'Cheque Range') {
              this.selectedTransSearchRadioName = 'chequeRange'
            } else if (this.transactionSearch.value.TransName == 'Cheque Range') {
              this.selectedTransSearchRadioName = 'paymentRun'
            }
            this.transOpt()
            this.transPayee = this.transactionSearch.value.payee
            if (this.transPayee == 'Provider') {
              this.providerNo = true;
              this.cardholderNo = false;
            } else if (this.transPayee == 'Cardholder') {
              this.providerNo = false;
              this.cardholderNo = true;
            } else {
              this.providerNo = false;
              this.cardholderNo = false;
            }
            this.FinanceService.isBackCompanySearch = false
          } else {
            this.FinanceService.companySearchedData = ''
            this.FinanceService.searchedCompanyName = ''
            this.FinanceService.searchedCompanyId = ''
          }
        }
      }
    });
    var self = this
    $(document).on('click', '#transactionSearchList .view-ico', function () {
      var selectedDiscipline = $(this).data('pdiscipline')
      var selectedPaymentKey = $(this).data('id')
      self.FinanceService.isBackCompanySearch = true;
      self.router.navigate(['/finance/transaction-search/transactionDetails/'], { queryParams: { 'discipline': selectedDiscipline, 'paymentKey': selectedPaymentKey, } });
    })
    $(document).on('click', '#transactionSearchList a', function () {
      self.isDisable = false
      $('#transactionSearchList td').removeClass('highlightedRow');
    })
    $(document).on('click', '#transactionSearchList tr', function () {
      self.selectedTransSearchRowData = self.dataTableService.selectedRowTransSearch
      self.isDisable = true
    })
  }

  /* Get Transation Status List for Predictive Search */
  getTransactionStatus() {
    var url = FinanceApi.getTransactionStatusUrl
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionStatusList = data.result;
        this.transactionStatusData = this.completerService.local(
          this.transactionStatusList,
          "tranStatusDescription",
          "tranStatusDescription"
        );
      }
    })
  };

  getTransactionStatusLower() {
    var url = FinanceApi.getTransactionStatusUrl
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionStatusList = data.result;
        this.transactionStatusDataLower = this.completerService.local(
          this.transactionStatusList,
          "tranStatusDescription",
          "tranStatusDescription"
        );
      }
    })
  };

  onSelectedTransactionStatus(selected: CompleterItem) {
    if (selected) {
      this.transacStatus = selected.originalObject.tranStatusDescription;
    }
    else {
      this.transacStatus = ''
    }
  }

  /* Get Payee List for Predictive Search*/
  getPayee() {
    var url = FinanceApi.getPayeeTypesUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payeeList = data.result;
        this.payeeData = this.completerService.local(
          this.payeeList,
          "payeeTypeDesc",
          "payeeTypeDesc"
        );
      }
    })
  }

  getPayeeLower() {
    var url = FinanceApi.getPayeeTypesUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payeeList = data.result;
        this.payeeDataLower = this.completerService.local(
          this.payeeList,
          "payeeTypeDesc",
          "payeeTypeDesc"
        );
      }
    })
  }

  onSelectedPayee(selected: CompleterItem) {
    if (selected) {
      this.transPayee = selected.originalObject.payeeTypeDesc
      if (this.transPayee == 'Provider') {
        this.providerNo = true;
        this.cardholderNo = false;
      } else if (this.transPayee == 'Cardholder') {
        this.providerNo = false;
        this.cardholderNo = true;
      } else {
        this.providerNo = false;
        this.cardholderNo = false;
      }
    }
  }

  onBlurPayeeDropdown() {
    this.transPayee = "";
    this.providerNo = false;
    this.cardholderNo = false;
  }

  /* Get Transaction Type List for Predictive Search */
  getTransactionType() {
    var url = FinanceApi.getTransactionTypeUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionTypeList = data.result;
        this.transactionTypeData = this.completerService.local(
          this.transactionTypeList,
          "tranTypeDescription",
          "tranTypeDescription"
        );
      }
    })
  }

  onSelect(e) {
  }
  getTransactionTypeLower() {
    var url = FinanceApi.getTransactionTypeUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionTypeList = data.result;
        this.transactionTypeDataLower = this.completerService.local(
          this.transactionTypeList,
          "tranTypeDescription",
          "tranTypeDescription"
        );
      }
    })
  }

  onSelectedTransactionType(selected: CompleterItem) {
    if (selected) {
      this.transType = selected.originalObject.tranTypeDescription
    }
  }

  /*  Get Business Type List for Predictive Search */
  getBusinessType() {
    var url = FinanceApi.getBusinessTypeUrl
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.businessTypeList = data.result;
        this.businessTypeData = this.completerService.local(
          this.businessTypeList,
          "businessTypeDesc",
          "businessTypeDesc"
        )
      }
    })
  }

  onSelectedBusinessType(selected: CompleterItem) {
    if (selected) {
      this.transBusiness = selected.originalObject.businessTypeDesc
    }
    else {
      this.transBusiness = ""
    }
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && event.value == null && event.value == '') {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.paymentGenerateForm.patchValue(datePickerValue);
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
    }
    if (event.reason == 2) {
      if (datePickerValue) {
        if (formName == 'paymentGenerateForm') {
          this.paymentGenerateForm.patchValue(datePickerValue);
          var todayDate = this.changeDateFormatService.getToday();
          this.paymentGenerateForm.patchValue(datePickerValue);
          if (todayDate && this.paymentGenerateForm.value.effectiveOn) {
            var errorVal = this.changeDateFormatService.compareTwoDates(todayDate.date, this.paymentGenerateForm.value.effectiveOn.date);
            if (errorVal.isError == true) {
              this.paymentGenerateForm.controls.effectiveOn.setErrors({
                "paymentGenerateEffDateNotValid": true
              });
              return;
            }
          }
        } else if (formName == 'staleChequeForm') {
          this.staleChequeForm.patchValue(datePickerValue);
        }
      }
    }
    if (this.paymentGenerateForm.value.effectiveOn && this.paymentGenerateForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.paymentGenerateForm.value.effectiveOn.date, this.paymentGenerateForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.paymentGenerateForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
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

  transOpt() {
    if (this.selectedTransSearchRadioName == 'transactionNo') {
      this.transNotext = true;
      this.transRange = false;
      this.transDate = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'transactionRange') {
      this.transRange = true;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'transactionDateRange') {
      this.transDate = true
      this.transRange = false;
      this.transNotext = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'chequeNo') {
      this.cheqNo = true;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'chequeRange') {
      this.cheque = true;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'paymentRun') {
      this.payment = true;
      this.cheque = false;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
    }
    else {
      this.payment = false;
      this.cheque = false;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
    }
  }

  payeeConditionalChk() {
    if (this.transPayee == 'Provider') {
      this.transNotext = true;
      this.transRange = false;
    }
    else if (this.transPayee == 'Cardholder') {
      this.transRange = true;
      this.transNotext = false;
    }
    else {
      this.transRange = false;
      this.transNotext = false;
    }
  }

  clearSearchTransaction() {
    this.transactionSearch.reset();
    this.transactionSearch.controls['businessType'].clearValidators();
    this.transactionSearch.controls['businessType'].updateValueAndValidity()
    this.payment = false;
    this.cheque = false;
    this.transRange = false;
    this.transNotext = false;
    this.transDate = false;
    this.cheqNo = false;
    this.disciplineArr = [];
    this.transStartAmt = ''
    this.transEndAmt = ''
    this.transStartDate = ''
    this.transEndDate = ''
    this.chequeRefNoStart = ''
    this.chequeRefNoEnd = ''
    this.paySumKey = ''
    this.dueDate = ''
    this.clearDate = ''
    this.providerCardNum = ''
    this.showSearchTable = false;
  }

  disciplinePopupValueChange(evt, value) {
    if (evt.target.checked) {
      this.diciplinePopupArr.push(evt.target.value);
    } else {
      for (var i = 0; i < this.diciplinePopupArr.length; i++) {
        if (this.diciplinePopupArr[i] == evt.target.value) {
          this.diciplinePopupArr.splice(i, 1);
        }
      }
    }
  }

  // Method for Footer Datepicker
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
  CompanyRefundSteps() {
    if (this.paymentGenerateForm.valid) {
      if (this.comapnyfieldArray == []) {
        let fieldArr = {
          "id": 1,
          "done": "0",
          "step": "1",
          "processing": "Generating Company Refund Payable Data ",
          "result": "Processing"
        }
        this.comapnyfieldArray.push(fieldArr)
      } else {
        this.comapnyfieldArray =
          [{
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Generating Company Refund Payable Data",
            "result": "Done"
          }]
      }
      this.step1CoRefundPayable().then(res => {
        if (this.apiResponse == 1) {
          this.update = {
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Generating Company Refund Payable Data",
            "result": this.payableTotalsResponse
          }
          this.showCoUpdatedItem(this.update);
          let generatingCoEftRecordsArr = {
            "id": 2,
            "done": "0",
            "step": "2",
            "processing": "Generating EFT",
            "result": "Processing"
          }
          this.showCoUpdatedItem(this.update);
        } else {
          this.ToastrService.error(this.step1ErrorMessage);
        }
      })
    }
    else {
      this.ToastrService.error(this.translate.instant('uft.toaster.pleaseSelectCorporateType'));
      this.validateAllFormFields(this.paymentGenerateForm)
    }
  }
  GeneratingCoEft() {
    this.step2GeneratingCoEft().then(res => {
      if (this.apiResponse == 1) {
        this.update = {
          "id": 2,
          "done": "1",
          "step": "2",
          "processing": "Generating Company Refund EFT (Company Payments)",
          "result": this.totalCoEftRecordsResponse
        }
        let generatingCoEftRecordsArr = {
          "id": 3,
          "done": "0",
          "step": "3",
          "processing": "Exporting EFT File (Company Payments)",
          "result": "Processing"
        }
        this.showUpdatedItemSecond(this.update);
        this.fieldArraySecond.push(generatingCoEftRecordsArr);
      }
      else {
        this.ToastrService.error(this.step1ErrorMessage);
      }
      this.companyReport();
    })
  }

  GeneratingEftBroker() {
    this.step3GeneratingEft().then(res => {
      if (this.apiResponse == 1) {
        this.update = {
          "id": 3,
          "done": "1",
          "step": "3",
          "processing": "Generating EFT (Broker Payments)",
          "result": this.totalEftRecordsResponse
        }
        this.showUpdatedItemSecond(this.update);
        this.step5ExportEft().then(res => {
          if (this.apiResponse == 1) {
            this.step5_1BrokerEftPaymentSummary().then(res => {
            if (this.apiResponse == 2) {
            this.update = {
              "id": 5,
              "done": "1",
              "step": "5",
              "processing": "Exporting EFT File (Broker Payments) ",
              "result": this.brokerEftPaymentSummaryResponse
            }
            this.showUpdatedItemSecond(this.update)
            this.FinalReportExporting().then(res => {
              if (this.apiResponse == 1) {
                this.getBrokerPrintingElStatement().then(res => {
                  let updateExportingPaymentFiles = {
                    "id": 15,
                    "done": "1",
                    "step": "15",
                    "processing": "Exporting Final Payment Report Files",
                    "result": this.finalEexportEftResponse +' '+this.brokerPrintingELStatementMsg
                  }
                  this.showUpdatedItemSecond(updateExportingPaymentFiles);
                  this.resetArray()
                })
              }
            });
          }
          });
          } else {
            this.ToastrService.error(this.step5ErrorMessage);
          }
        })
      } else {
        this.ToastrService.error(this.step3ErrorMessage);
      }
    })
  }
  step1CoRefundPayable() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generateCoRefundPayable;
      var paramData = {
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "coRefundTotalAmt": 50,
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.paymentRunKey = data.result.paymentRunKey
          this.payableTotalsResponse = 'Total Company Payable: ' + data.result.payableTotals
          this.apiResponse = 1;
          resolve();
        } else {
          this.step1ErrorMessage = data.hmsMessage.messageShort
          this.payableTotalsResponse = 'Total Company Payable: ' + 0
          this.apiResponse = 1;
          resolve();
        }
      },(error) => {
        this.payableTotalsResponse = 'Total Company Payable: ' + 0
        this.apiResponse = 1;
        resolve();
      })
      this.showTable = true;
      setTimeout(() => {
        this.getBrokersList();
      }, 200);
    })
    return promise;
  }

  step2GeneratingCoEft() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generatingCoRefundEft;
      var paramData = {
        "payableTransactionKeys": this.companyTansectionArray,
        "spaymentRunKey": this.arrayString(this.companySumKeyArray),
        "payableSumKey": this.payableSumKey,
        "paymentRunKey": this.paymentRunKey || this.lastSelectedPaymentSumKey,
        "coEftDueDt": this.changeDateFormatService.convertDateObjectToString(this.todayDate),
      }
      let planType = this.paymentGenerateForm.value.planType || "Q"
      if (planType == "Q") {
        paramData = Object.assign(paramData, {
          "ppayableTransaction": this.arrayString(this.companyTansectionArray),
        });
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalCoEftRecordsResponse = 'Total EFT Records: ' + data.result.coEftTotalAmt;
          this.payableSumKey = data.result.payableSumKey;
          this.ppayableSumKeyArray.push(data.result.payableSumKey)
          this.apiResponse = 1;
          resolve();
        } else {
          this.step2ErrorMessage = data.hmsMessage.messageShort
          this.totalCoEftRecordsResponse = 'Total EFT Records: ' + 0;
          this.apiResponse = 1//0;
          resolve();
        }
      }, (error) => {
        this.totalCoEftRecordsResponse = 'Total EFT Records: ' + 0;
        this.apiResponse = 1//0;
        resolve();
      })
    })
    return promise;
  }

  Step3exportCoRefundEft() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.exportCoRefundEft;
      var paramData = {
        "coRefundPaySumKey": this.paymentRunKey || this.lastSelectedPaymentSumKey,
        "coEftDueDt": this.changeDateFormatService.convertDateObjectToString(this.todayDate),
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalChequeRecordsResponse = data.result.exportFilePath
          if (data.result.exportFilePath != 'FILE_NOT_GENERATED') {
            this.totalChequeRecordsResponse = '<a href="' + data.result.exportFilePath + '">' + data.result.exportFilePath + '</a>'
          }
          this.exportPdfFilePathUrl = data.result.exportPdfFilePath;
          if (data.result.exportPdfFilePath != 'FILE_NOT_GENERATED') {
            this.exportPdfFilePathUrl = '<a href="' + data.result.exportPdfFilePath + '">' + data.result.exportPdfFilePath + '</a>'
          }
          this.companyRefundExportPdfFilePathUrl = data.result.companyRefundPayableFilePath
          if (data.result.companyRefundPayableFilePath != 'FILE_NOT_GENERATED') {
            this.companyRefundExportPdfFilePathUrl = '<a href="' + data.result.companyRefundPayableFilePath + '">' + data.result.companyRefundPayableFilePath + '</a>'
          } else {
            this.step3ErrorMessage = data.hmsMessage.messageShort
            this.apiResponse = 1//0;
            this.totalChequeRecordsResponse = '<p>' + 'File Not Generated' + '</p>';
          }
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.totalChequeRecordsResponse = data.hmsMessage.messageShort
          this.apiResponse = 2;
          resolve();
        } else {
          this.step3ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 1//0;
          this.totalChequeRecordsResponse = '<p>' + 'File Not Generated' + '</p>';
          resolve();
        }
      }, (error) => {
        this.apiResponse = 1
        this.totalChequeRecordsResponse = '<p>' + 'File Not Generated' + '</p>';
        resolve();
      })
    })
    return promise;
  }

  //Generate Payment Popup table Value update
  showUpdatedItem(newItem) {
    let updateItem = this.fieldArray.find(this.findIndexToUpdate, newItem.id);
    let index = this.fieldArray.indexOf(updateItem);
    if (index == -1) {
      this.fieldArray.push(newItem)
    } else {
      this.fieldArray[index] = newItem;
    }
  }
  showUpdatedItemSecond(newItem) {
    if (this.showFirstSecond != true) {
      this.showFirstSecond = true
    }
    let updateItem = this.fieldArraySecond.find(this.findIndexToUpdate, newItem.id);
    let index = this.fieldArraySecond.indexOf(updateItem);
    if (index == -1) {
      this.fieldArraySecond.push(newItem)
    } else {
      if (newItem.id == 15) {
        this.fieldArraySecond.splice(index, 1);
        this.fieldArraySecond.push(newItem)
      } else {
        this.fieldArraySecond[index] = newItem;
      }
    }

  }
  showCoUpdatedItem(newItem) {
    let updateItem = this.comapnyfieldArray.find(this.findIndexToUpdate, newItem.id);
    let index = this.comapnyfieldArray.indexOf(updateItem);
    if (index == -1) {
      this.comapnyfieldArray.push(newItem)
    } else {
      this.comapnyfieldArray[index] = newItem;
    }
  }
  showCoUpdatedItemSecond(newItem) {
    let updateItem = this.comapnyfieldArraySecond.find(this.findIndexToUpdate, newItem.id);
    let index = this.comapnyfieldArraySecond.indexOf(updateItem);
    if (index == -1) {
      this.comapnyfieldArraySecond.push(newItem)
    } else {
      this.comapnyfieldArraySecond[index] = newItem;
    }
  }
  showBRUpdatedItem(newItem) {
    let updateItem = this.brokerfieldArray.find(this.findIndexToUpdate, newItem.id);
    let index = this.brokerfieldArray.indexOf(updateItem);
    if (index == -1) {
      this.brokerfieldArray.push(newItem)
    } else {
      this.brokerfieldArray[index] = newItem;
    }
  }
  showBRUpdatedItemSecond(newItem) {
    let updateItem = this.brokerfieldArraySecond.find(this.findIndexToUpdate, newItem.id);
    let index = this.brokerfieldArraySecond.indexOf(updateItem);
    if (index == -1) {
      this.brokerfieldArraySecond.push(newItem)
    } else {
      this.brokerfieldArraySecond[index] = newItem;
    }
  }
  findIndexToUpdate(newItem) {
    return newItem.id === this;
  }

  /** Submit the Generate Payment Process Form*/
  submitPaymentGenerateForm(paymentGenerateForm) {
    if (this.paymentGenerateForm.valid) {
      this.generatePaymentButton = true;
      if (this.fieldArray == []) {
        let fieldArr = {
          "id": 1,
          "done": "0",
          "step": "1",
          "processing": "Get System Parameters",
          "result": "Processing"
        }
        this.fieldArray.push(fieldArr)
      } else {
        this.fieldArray =
          [{
            "id": 1,
            "done": "0",
            "step": "1",
            "processing": "Get System Parameters",
            "result": "Processing"
          }]
      }
      this.getSystemParameter(this.paymentGenerateForm.value.planType).then(res => {
        if (this.recNotFounndSysParam == false) {
          this.update = {
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Get System Parameters",
            "result": "EFT File#: '" + this.eftFileNo + "'; Last Cheque#: " + this.chequeNum
          }
          this.showUpdatedItem(this.update);
          if (this.eftFileNo) {
            this.exDialog.openMessage(this.translate.instant('finance.toaster.eftNo') + this.eftFileNo).subscribe((eftFileNo) => {
              if (!eftFileNo) {
                this.checkingParamsArr = {
                  "id": 2,
                  "done": "0",
                  "step": "2",
                  "processing": "Checking Params",
                  "result": "Processing"
                }
                this.fieldArray.push(this.checkingParamsArr)
                this.checkingParams(this.paramData).then(res => {
                  if (this.checkingParamsErr) {
                    this.ToastrService.error(this.checkingParamsErrMsg);
                    this.generatePaymentButton = false
                    this.fieldArray = []
                    this.checkingParamsErr = false
                  } else {
                    this.update = {
                      "id": 2,
                      "done": "1",
                      "step": "2",
                      "processing": "Checking Params",
                      "result": "EFT File#: '" + this.eftFileNo + "' is valid!"
                    }
                    this.totalPayableClaimsArr = {
                      "id": 3,
                      "done": "0",
                      "step": "3",
                      "processing": "Total Payable Claims",
                      "result": "Processing"
                    }
                    this.showUpdatedItem(this.update);
                    this.fieldArray.push(this.totalPayableClaimsArr);
                    this.totalPayableClaims(this.paymentGenerateForm.value).then(res => {
                      if (this.totalPayableClaimsLockErr) {
                        this.exDialog.openConfirm(this.translate.instant('uft.toaster.claimScreenIsLockedBySomeone')).subscribe((value) => {
                          if (value) {
                            this.fieldArray = []
                            this.totalPayableClaimsLockErr = false;
                          }
                        })
                      } else {
                        if (this.totalPayableClaimsErr) {
                          this.ToastrService.error(this.translate.instant('finance.toaster.SORRY_YOU_CANNOT_RUN_PAYMENT_ON_THIS_DATABASE'));
                          this.generatePaymentButton = false
                          this.fieldArray = []
                          this.totalPayableClaimsErr = false
                        } else {
                          this.update = {
                            "id": 3,
                            "done": "1",
                            "step": "3",
                            "processing": "Total Payable Claims",
                            "result": this.totalClaims
                          }
                          this.showUpdatedItem(this.update);
                          if (this.totalClaims == 0) {
                            this.exDialog.openConfirm(this.translate.instant('finance.toaster.genPayableAlreadyDoneToContinue')).subscribe((value) => {
                              if (value) {
                                $("#paymentSumKeyButton").trigger('click');
                              }
                            })
                          } else {
                            this.isFirstPart = true;
                            this.gpSteps();
                          }
                        }
                      }
                    });
                  }
                })
              } else {
                this.resetGeneratePaymentFormWithoutClose();
              }
            });
          }
        } else {
          this.fieldArray = []
          this.ToastrService.error(this.translate.instant('finance.toaster.noRecordGenPayment'));
        }
      })
    } else {
      this.ToastrService.error(this.translate.instant('uft.toaster.pleaseSelectCorporateType'));
      this.validateAllFormFields(this.paymentGenerateForm)
    }
  }

  gpSteps() {
    if (this.totalClaims == 0) {
      this.generatingPayableArr = {
        "id": 4,
        "done": "0",
        "step": "4",
        "processing": "Generating Payable",
        "result": ""
      }
    } else {
      this.generatingPayableArr = {
        "id": 4,
        "done": "0",
        "step": "4",
        "processing": "Generating Payable",
        "result": "Processing"
      }
    }
    this.fieldArray.push(this.generatingPayableArr);
    this.generatingPayable(this.paymentGenerateForm.value).then(res => {
      if (this.totalClaims == 0) {
        this.update = {
          "id": 4,
          "done": "1",
          "step": "4",
          "processing": "Generating Payable",
          "result": ""
        }
      } else {
        this.update = {
          "id": 4,
          "done": "1",
          "step": "4",
          "processing": "Generating Payable",
          "result": "The Payment Run # is " + this.paymentSumKey
        }
      }
      this.errorClaimListArr = {
        "id": 5,
        "done": "0",
        "step": "5",
        "processing": "Error Claims List",
        "result": "Processing"
      }
      this.showUpdatedItem(this.update);
      this.fieldArray.push(this.errorClaimListArr);
      this.errorClaimsList(this.paymentGenerateForm.value).then(res => {
        this.update = {
          "id": 5,
          "done": "1",
          "step": "5",
          "processing": "Error Claims List",
          "result": this.errorClaimLListMsg
        }
        this.generatingEftRecordsArr = {
          "id": 6,
          "done": "0",
          "step": "6",
          "processing": "Generating EFT Records",
          "result": "Processing"
        }
        this.showUpdatedItem(this.update);
        if (this.paymentGenerateForm.value.payeetype != 'all') {
          this.showTable = true
        } else if (this.paymentGenerateForm.value.payeetype == 'all' && this.paymentGenerateForm.value.planType == 'Q') {
          this.showTable = true
        }
        setTimeout(() => {
          if (this.paymentGenerateForm.value.payeetype == 'all' && this.paymentGenerateForm.value.planType == 'S') {
            this.fieldArray.push(this.generatingEftRecordsArr);
            this.comapnyCardholderStep6AllOrAdsc()
          }
          else {
            if (this.paymentGenerateForm.value.planType == 'Q' && this.paymentGenerateForm.value.payeetype == 'all') {
                this.broker();
            } else {
              this.getBrokersList();
            }
          }
        }, 300);
      })
    });
  }
  changeFilterDateFormat(event, frmControlName) {
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
  comapnyCardholderStep6QbCheque() {
    this.showFirst = true;
    this.showPayable = true;
    this.generatingChequeRecords(this.paymentGenerateForm.value).then(res => {
      this.update = {
        "id": 7,
        "done": "1",
        "step": "7",
        "processing": "Generating Cheque Records (Claim Payments)",
        "result": "Total Cheque Records: " + this.totalChequeRecords
      }
      this.generatingReportsArr = {
        "id": 8,
        "done": "0",
        "step": "8",
        "processing": "Exporting EFT File and Statement (Claim Payments)",
        "result": "Processing"
      }
      this.showUpdatedItemSecond(this.update);
      this.generatingReportsArr = {
        "id": 9,
        "done": "0",
        "step": "9",
        "processing": "Printing Cheques (Claim Payments)",
        "result": "Processing"
      }
      this.fieldArraySecond.push(this.generatingReportsArr);
      this.finacialAdminInfoSearch(this.paymentGenerateForm.value).then(res => {
        this.update = {
          "id": 9,
          "done": "1",
          "step": "9",
          "processing": "Printing Cheques (Claim Payments)",
          "result": this.financialAdminInfoResponse
        }
        this.generatingReportsArr = {
          "id": 10,
          "done": "0",
          "step": "10",
          "processing": "Generating Reports (Claim Payments)",
          "result": "Processing"
        }
        this.showUpdatedItemSecond(this.update);
        this.fieldArraySecond.push(this.generatingReportsArr);
        if (this.planType == 'S') {
          this.exportingPaymentFiles = {
            "id": 11,
            "done": "0",
            "step": "11",
            "processing": "Exporting Payment Files (Claim Payments)",
            "result": "Processing"
          } 
          this.fieldArraySecond.push(this.exportingPaymentFiles);
        }
        this.getReports()
      });
    })
  }
  getReports() {
    this.generatingReports(this.paymentGenerateForm.value).then(res => {
      if (this.apiResponse == 1) {
        if (this.transactionSearch.value.paymentType == 'E') {
          this.getPrintingELPaymentCommonSteps()
        } else if(this.transactionSearch.value.paymentType == 'C') {
          this.getPrintingChqPaymentCommonSteps()
        }
      }
    });
  }
  
  onBankSelection() {
  }
  comapnyCardholderStep6QbEft() {
    this.generatingEftRecords(this.paymentGenerateForm.value).then(res => {
      this.update = {
        "id": 6,
        "done": "1",
        "step": "6",
        "processing": "Generating EFT Records (Claim Payments)",
        "result": "Total EFT Records: " + this.totalEFTRecords
      }
      this.generatingReportsArr = {
        "id": 8,
        "done": "0",
        "step": "8",
        "processing": "Exporting EFT File and Statement (Claim Payments)",
        "result": "Processing"
      }
      this.showUpdatedItemSecond(this.update);
      this.fieldArraySecond.push(this.generatingReportsArr);
      this.exportingEftFile(this.paymentGenerateForm.value).then(res => {
        this.update = {
          "id": 8,
          "done": "1",
          "step": "8",
          "processing": "Exporting EFT File and Statement (Claim Payments)",
          "result": this.exportEftResponse
        }
        this.generatingReportsArr = {
          "id": 9,
          "done": "0",
          "step": "9",
          "processing": "Printing Cheques (Claim Payments)",
          "result": "Processing"
        }
        this.showUpdatedItemSecond(this.update);
        this.exportingPaymentFiles = {
          "id": 11,
          "done": "0",
          "step": "11",
          "processing": "Exporting Payment Files (Claim Payments)",
          "result": "Processing"
        }
        this.showUpdatedItemSecond(this.update);
        this.fieldArraySecond.push(this.exportingPaymentFiles);
        this.getReports();
      });
    })
  }

  comapnyCardholderStep6AllOrAdsc() {
    let ppaymentRunKey = {
      "planType": this.paymentGenerateForm.value.planType || "Q",
      "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
    }
    if (this.paymentGenerateForm.value.planType = "S") {
      let ar = [];
      ar.push(this.paymentSumKey || this.lastSelectedPaymentSumKey)
      ppaymentRunKey = Object.assign(ppaymentRunKey, {
        "paymentRunKey": this.arrayString(ar),
      });
    }
    var url = FinanceApi.PayableSummary
    this.generatingEftRecords(this.paymentGenerateForm.value).then(res => {
      this.update = {
        "id": 6,
        "done": "1",
        "step": "6",
        "processing": "Generating EFT Records",
        "result": "Total EFT Records: " + this.totalEFTRecords
      }
      this.generatingChequeRecordsArr = {
        "id": 7,
        "done": "0",
        "step": "7",
        "processing": "Generating Cheque Records",
        "result": "Processing"
      }
      if (this.paymentGenerateForm.value.planType == "Q") {
        this.getBrokersList()
        this.resetForms();
      }
      this.showUpdatedItem(this.update);
      this.fieldArray.push(this.generatingChequeRecordsArr);
      this.generatingChequeRecords(this.paymentGenerateForm.value).then(res => {
        this.update = {
          "id": 7,
          "done": "1",
          "step": "7",
          "processing": "Generating Cheque Records",
          "result": "Total Cheque Records: " + this.totalChequeRecords
        }
        this.generatingReportsArr = {
          "id": 8,
          "done": "0",
          "step": "8",
          "processing": "Exporting EFT File and Statement",
          "result": "Processing"
        }
        this.showUpdatedItem(this.update);
        this.fieldArray.push(this.generatingReportsArr);
        this.exportingEftFile(this.paymentGenerateForm.value).then(res => {
          this.update = {
            "id": 8,
            "done": "1",
            "step": "8",
            "processing": "Exporting EFT File and Statement",
            "result": this.exportEftResponse
          }
          this.generatingReportsArr = {
            "id": 9,
            "done": "0",
            "step": "9",
            "processing": "Printing Cheques",
            "result": "Processing"
          }
          this.showUpdatedItem(this.update);
          this.fieldArray.push(this.generatingReportsArr);
          this.finacialAdminInfoSearch(this.paymentGenerateForm.value).then(res => {
            this.update = {
              "id": 9,
              "done": "1",
              "step": "9",
              "processing": "Printing Cheques",
              "result": this.financialAdminInfoResponse
            }
            this.showUpdatedItem(this.update);
            if (this.planType == 'S') {
              this.exportingPaymentFiles = {
                "id": 11,
                "done": "0",
                "step": "11",
                "processing": "Exporting Payment Files",
                "result": "Processing"
              }
              this.showUpdatedItem(this.update);
            }
            if(this.transactionSearch.value.paymentType != null){
              this.getReports()
            }
          });
        });
      });
    })
  }
  submitPaymentSumForm(paymentSumForm) {
    if (this.paymentSumForm.valid) {
      $("#closePaymentSumForm").trigger('click');
      this.paymentSumKey = paymentSumForm.value.paymentSumNo;
      this.isFirstPart = true;
      this.gpSteps();
    } else {
      this.validateAllFormFields(this.paymentSumForm)
    }
  }
  //Generate Payment 1st Step API
  getSystemParameter(planType) {
    this.planType = planType
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.getSystemParameter;
      this.paramData = {
        "planType": planType || 'Q'
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.paramData = Object.assign(this.paramData, {
            "pcheckParams": 1,
            "eftFileNo": data.result.eftFileNo,
          });
          this.eftFileNo = data.result.eftFileNo
          this.chequeNum = data.result.chequeNum
          this.apiResponse = 1;
          this.recNotFounndSysParam = false;      //to stop displying no record found data msg
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.recNotFounndSysParam = true
          this.apiResponse = 1;
          resolve();
        } else {
          this.apiResponse = 0;
          if (planType != '') {
            this.reinitializeProcess().then(res => {
              resolve();
            })
          }
        }
      })
    })
    return promise;
  }

  //Generate Payment 2nd Step API
  checkingParams(paramData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.checkingParams;
      this.paramData = Object.assign(this.paramData, {
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
      });
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.eftFileNo = data.result.eftFileNo
          this.orgName = data.result.poriginatorName
          this.orgNo = data.result.poriginatorNo
          this.orgDesc = data.result.poriginatorDesc
          this.orgRecCenter = data.result.preceiverCenter
          this.bankNo = data.result.pbankNo
          this.branchNo = data.result.pbranchNo
          this.accNo = data.result.paccountNo
          this.defalutDir = data.result.pdefaultDir
          this.planType = data.result.planType
          this.eftDueDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "EFT_DUE_DATE_FOR_PLAN_TYPE_QUIKCARD_ALREADY_EXIST") {
          this.apiResponse = 1;
          this.checkingParamsErr = true;
          this.checkingParamsErrMsg = this.translate.instant('finance.toaster.EFT_DUE_DATE_FOR_PLAN_TYPE_QUIKCARD_ALREADY_EXIST');
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "EFT_DUE_DATE_FOR_PLAN_TYPE_ALBERTA_ALREADY_EXIST") {
          this.apiResponse = 1;
          this.checkingParamsErr = true;
          this.checkingParamsErrMsg = this.translate.instant('finance.toaster.EFT_DUE_DATE_FOR_PLAN_TYPE_ALBERTA_ALREADY_EXIST');
          resolve();
        } else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 3rd Step API
  totalPayableClaims(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.totalPayableClaims;
      let totalPayableClaimsParams = {
        'dental': 1,
        'vision': (this.paymentGenerateForm.value.planType == "S") ? 0 : 1,
        'health': (this.paymentGenerateForm.value.planType == "S") ? 0 : 1,
        'drug': (this.paymentGenerateForm.value.planType == "S") ? 0 : 1,
        'hsa': (this.paymentGenerateForm.value.planType == "S") ? 0 : 1,
        'wellness': (this.paymentGenerateForm.value.planType == "S") ? 0 : 1, // Wellness param added as discussed with Arun sir
        'planType': formData.planType
      }
      this.paramData = Object.assign({
        'pdental': '1',
        'pvision': "1",
        'phealth': "1",
        'pdrug': "1",
        'phsa': "1",
      })
      this.hmsDataService.postApi(url, totalPayableClaimsParams).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 1;
          this.totalClaims = data.result.totalClaims
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "Generate Payable process is already done. Do you want to continue to generate EFT") {
          this.apiResponse = 1;
          this.totalClaims = data.result.totalClaims
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "SORRY_YOU_CANNOT_RUN_PAYMENT_ON_THIS_DATABASE") {
          this.apiResponse = 1;
          this.totalPayableClaimsErr = true;
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "CLAIM_SCREEN_IS_LOCKED_BY_SOMEONE") {
          this.apiResponse = 0;
          this.totalPayableClaimsLockErr = true;
          resolve();
        }
        else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 4th Step API
  generatingPayable(formData) {
    let promise = new Promise((resolve, reject) => {
      if (this.totalClaims == 0) {
        resolve();
      } else {
        var url = FinanceApi.generatingPayable;
        let param = {
          'dental': 1,
          'planType': formData.planType,
          "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
          "eftFileNo": this.eftFileNo
        }
        if (!this.hideFields) {
          if (this.paymentGenerateForm.value.payeetype == 'all') {
            param = Object.assign(param, {
              "cardHolderKey": 1,
              "providerKey": 1,
            })
          } else if (this.paymentGenerateForm.value.payeetype == 'cardholder') {
            param = Object.assign(param, {
              "cardHolderKey": 1,
              "providerKey": 0,
            })
          } else if (this.paymentGenerateForm.value.payeetype == 'provider') {
            param = Object.assign(param, {
              "cardHolderKey": 0,
              "providerKey": 1,

            })
          }
          param = Object.assign(param, {
            "otherKey": 1,
            "pcoId": (formData.companyNo) ? formData.companyNo : '',
            "pconfirmId": (formData.confirmationNo) ? formData.confirmationNo : '',
            'vision': 1,
            'health': 1,
            'drug': 1,
            'hsa': 1,
            'wellness': 1 //wellness param added as discussed with Arun sir
          })
          if (this.otherSelected.length > 0) {
            param = Object.assign(param, {
              "otherKey": 1,
            })
          }
        } else if (this.paymentGenerateForm.value.payeetype == 'cardholder') {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            "providerKey": 0,
            'vision': 0,
            'health': 0,
            'drug': 0,
            'hsa': 0,
            'wellness': 0,
            "pcoId": "",
            "pconfirmId": ""
          })
        } else if (this.paymentGenerateForm.value.payeetype == 'provider') {
          param = Object.assign(param, {
            "cardHolderKey": 0,
            "providerKey": 1,
            'vision': 0,
            'health': 0,
            'drug': 0,
            'hsa': 0,
            'wellness': 0,
            "pcoId": "",
            "pconfirmId": ""
          })
        } else if (this.paymentGenerateForm.value.payeetype == 'all') {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            "providerKey": 1,
          })
        } else if (this.cardholderSelected.length > 1) {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            'vision': 0,
            'health': 0,
            'drug': 0,
            'hsa': 0,
            'wellness': 0,
            "pcoId": "",
            "pconfirmId": ""
          })
        }
        else if (this.providerSelected.length > 1) {
          param = Object.assign(param, {
            "providerKey": 1,
            'vision': 0,
            'health': 0,
            'drug': 0,
            'hsa': 0,
            'wellness': 0,
            "pcoId": "",
            "pconfirmId": ""
          })
        }
        param = Object.assign(param, {
          'vision': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'health': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'drug': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'hsa': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'wellness': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1, // wellness param added as discussed with Arun sir
          "pcoId": "",
          "pconfirmId": ""
        })
        if (!this.isFirstPart) {
          if (this.cardholderSelected.length > 0) {
            param = Object.assign(param, {
              "cardHolderKey": 1,
            })
          } else {
            param = Object.assign(param, {
              "cardHolderKey": 0,
            })
          }
          if (this.providerSelected.length > 0) {
            param = Object.assign(param, {
              "providerKey": 1,
            })
          } else {
            param = Object.assign(param, {
              "providerKey": 0,
            })
          }
        }
        this.hmsDataService.postApi(url, param).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            if (data.result.paymentRunKey) {
              this.paymentSumKey = +data.result.paymentRunKey
            } else {
              this.paymentSumKey = +data.result.payableSumKey
            }
            this.apiResponse = 1;
            resolve();
          } else {
            this.apiResponse = 0;
            this.reinitializeProcess().then(res => {
              resolve();
            })
          }
        })
      }
    })
    return promise;
  }

  //Generate Payment 5th Step API
  errorClaimsList(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.errorClaimsList;
      let param = {
        "paymentSumKey": this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "planType": formData.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Need to be change
          this.apiResponse = 1;
          this.errorClaimLListMsg = 'Error Claims List Report are generated.'
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 1;
          this.errorClaimLListMsg = 'Error Claims List Report are not generated.'
          resolve();
        }
        else {
          this.apiResponse = 0;
          this.errorClaimLListMsg = 'Error Claims List Report are not generated.'
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      },(error) => {
        this.errorClaimLListMsg = 'Error Claims List Report are not generated.'
        resolve();
      })
    })
    return promise;
  }

  //Generate Payment 6th Step API
  generatingEftRecords(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.generatingEftRecords;
      let paymentRunKey = this.lastSelectedPaymentSumKey;
      if (formData.planType == "S") {
        paymentRunKey = this.adscPaymentRunKey
      }
      let param = {
        'dental': 1,
        "planType": formData.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "eftFileNo": this.eftFileNo,
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "paymentRunKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
        "payableSumKey": this.payableSumKey, // from summary api 
        "payableTransactionKeys": this.payeeTansectionArray,
      }
      if (!this.hideFields) {
        if (this.paymentGenerateForm.value.payeetype == 'all') {
          param = Object.assign(param, {
            "cardHolderKey": 1, 
            "providerKey": 1,
          })
        } else if (this.paymentGenerateForm.value.payeetype == 'cardholder') {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            "providerKey": 0,
          })
        } else if (this.paymentGenerateForm.value.payeetype == 'provider') {
          param = Object.assign(param, {
            "cardHolderKey": 0,
            "providerKey": 1,
          })
        }
        param = Object.assign(param, {
          "otherKey": 0,
          'vision': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'health': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'drug': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'hsa': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'wellness': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1
        })
      } else {
        if (this.paymentGenerateForm.value.payeetype == 'all') {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            "providerKey": 1,
          })
        } else if (this.paymentGenerateForm.value.payeetype == 'cardholder') {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            "providerKey": 0,
          })
        } else if (this.paymentGenerateForm.value.payeetype == 'provider') {
          param = Object.assign(param, {
            "cardHolderKey": 0,
            "providerKey": 1,
          })
        }
      }
      if (this.cardholderSelected.length > 0) {
        param = Object.assign(param, {
          "cardHolderKey": 1,
        })
      } else {
        param = Object.assign(param, {
          "cardHolderKey": 0,
        })
      }
      if (this.providerSelected.length > 0) {
        param = Object.assign(param, {
          "providerKey": 1,
        })
      } else {
        param = Object.assign(param, {
          "providerKey": 0,
        })
      }
      if (this.otherSelected.length > 0) {
        param = Object.assign(param, {
          "otherKey": 1,
          "providerKey": 1,
          "cardHolderKey": 1,
        })
      }
      if (formData.planType == "Q") {
        param = Object.assign(param, {
          "ppayableTransaction": this.arrayString(this.payeeTansectionArray),
        });
      }
      // return;
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Needs to be change
          this.apiResponse = 1;
          this.totalEFTRecords = data.result.ptotalEftRecord;
          this.payableSumKey = data.result.payableSumKey;
          this.ppayableSumKeyArray.push(data.result.payableSumKey);
          resolve();
        } else {
          this.totalEFTRecords = '0';
          this.apiResponse = 0;
          if (this.paymentGenerateForm.value.planType == 'S') {
            this.reinitializeProcess().then(res => {
              resolve();
            })
          } else {
            resolve();
          }
        }
      }, (error) => {
        this.totalEFTRecords = '0'
        resolve();
      })
    })
    return promise;
  }

  //Generate Payment 7th Step API
  generatingChequeRecords(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.generatingChequeRecords;
      let param = {
        'dental': 1,
        "planType": formData.planType,
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "paymentRunKey": +this.paymentSumKey,
        "payableSumKey": this.payableSumKey, //summary key
        "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
        "payableTransactionKeys": this.payeeTansectionArray
      }
      if (!this.hideFields) {
        if (this.paymentGenerateForm.value.payeetype = 'all') {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            "providerKey": 1,
          })
        } else if (this.paymentGenerateForm.value.payeetype == 'cardholder') {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            "providerKey": 0,
          })
        } else if (this.paymentGenerateForm.value.payeetype == 'provider') {
          param = Object.assign(param, {
            "cardHolderKey": 0,
            "providerKey": 1,
          })
        }
        param = Object.assign(param, {
          "otherKey": 0,
          'vision': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'health': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'drug': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'hsa': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1,
          'wellness': (this.paymentGenerateForm.value.planType == 'S') ? 0 : 1
        })
        if (this.otherSelected.length > 0) {
          param = Object.assign(param, {
            "otherKey": 1,
          })
        }
      } else if (this.paymentGenerateForm.value.payeetype == 'cardholder') {
        param = Object.assign(param, {
          "cardHolderKey": 1,
          "providerKey": 0,
        })
      } else if (this.paymentGenerateForm.value.payeetype == 'provider') {
        param = Object.assign(param, {
          "cardHolderKey": 0,
          "providerKey": 1,
        })
      } else if (this.paymentGenerateForm.value.payeetype = 'all') {
        param = Object.assign(param, {
          "cardHolderKey": 1, 
          "providerKey": 1,
        })
      }
      if (formData.planType == "Q") {
        param = Object.assign(param, {
          "ppayableTransaction": this.arrayString(this.payeeTansectionArray),
        });
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Needs to be change
          this.apiResponse = 1;
          this.totalChequeRecords = data.result.totalChequeRecords;
          this.payableSumKey = data.result.payableSumKey;
          this.ppayableSumKeyArray.push(data.result.payableSumKey);
          resolve();
        } else {
          this.apiResponse = 0;
          this.totalChequeRecords = '0'
          if (this.paymentGenerateForm.value.planType == 'S') {
            this.reinitializeProcess().then(res => {
              resolve();
            })
          } else {
            resolve();
          }
        }
      }, (error) => {
        this.totalChequeRecords = '0'
        resolve()
      })
    })
    return promise;
  }

  //Generate Payment 8th Step API
  exportingEftFile(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.exportingEftFile;
      let param = {
        "payableSumKey": this.payableSumKey,
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "eftSumDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "disciplines": this.diciplinePopupArr,
        "eftFileNo": this.eftFileNo,
        "poriginatorName": this.orgName,
        "poriginatorNo": this.orgNo,
        "poriginatorDesc": this.orgDesc,
        "preceiverCenter": this.orgRecCenter,
        "pbankNo": this.bankNo,
        "pbranchNo": this.branchNo,
        "paccountNo": this.accNo,
        "pdefaultDir": this.defalutDir,
        "planType": this.planType || this.paymentGenerateForm.value.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if (data.hmsMessage.messageShort == 'FILE_NOT_GENERATED') {
            this.exportEftResponse = 'File Not Generated'
          } else {
            let eftFile = data.result.eftFile;
            let eftSummaryFilePath = data.result.eftSummaryFilePath;
            let eftStatementFilePath = data.result.eftStatementFilePath;
            if (eftFile != 'FILE_NOT_GENERATED') {
              eftFile = '<a href="' + eftFile + '">' + eftFile + '</a>'
            }
            if (eftSummaryFilePath != 'FILE_NOT_GENERATED') {
              eftSummaryFilePath = '<a href="' + eftSummaryFilePath + '">' + eftSummaryFilePath + '</a>'
            }
            if (eftStatementFilePath != 'FILE_NOT_GENERATED') {
              eftStatementFilePath = '<a href="' + eftStatementFilePath + '">' + eftStatementFilePath + '</a>'
            }
            this.exportEftResponse = '<p>' + eftFile + '</p><p>' + eftSummaryFilePath + '</p><p>' + eftStatementFilePath + '</p>'
          }
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.exportEftResponse = data.hmsMessage.messageShort
          this.apiResponse = 1;
          resolve();
        } else {
          this.exportEftResponse = data.hmsMessage.messageShort
          this.apiResponse = 0;
          if (this.paymentGenerateForm.value.planType == 'S') {
            this.reinitializeProcess().then(res => {
              resolve();
            })
          } else {
            resolve();
          }
        }
      })
    })
    return promise;
  }

  //Generatefinal report to be used at end 
  FinalReportExporting() {
    let updateExportingPaymentFiles = {
      "id": 15,
      "done": "1",
      "step": "15",
      "processing": "Exporting Final Payment Report Files",
      "result": "Processing"
    }
    this.showUpdatedItemSecond(updateExportingPaymentFiles);
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.exportingPayableEftFile;
      let unique = Array.from(new Set(this.ppayableSumKeyArray));
      let param = {
        "ppayableSumKey": unique,
        "payableSumKey": this.payableSumKey,
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "eftSumDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "disciplines": this.diciplinePopupArr,
        "eftFileNo": this.eftFileNo,
        "poriginatorName": this.orgName,
        "poriginatorNo": this.orgNo,
        "poriginatorDesc": this.orgDesc,
        "preceiverCenter": this.orgRecCenter,
        "pbankNo": this.bankNo,
        "pbranchNo": this.branchNo,
        "paccountNo": this.accNo,
        "pdefaultDir": this.defalutDir,
        "planType": this.planType || this.paymentGenerateForm.value.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        this.resetForms(); // ok
        if (data.code == 200 && data.status == "OK") {
          if (data.hmsMessage.messageShort == 'FILE_NOT_GENERATED') {
            this.finalEexportEftResponse = 'File Not Generated'
          } else {
            let eftFile = data.result.eftFile || "";
            let eftSummaryFilePath = data.result.eftSummaryFilePath || ""
            let eftStatementFilePath = data.result.eftStatementFilePath || ""
            if (eftFile != 'FILE_NOT_GENERATED') {
              eftFile = '<a href="' + eftFile + '">' + eftFile + '</a>'
            }
            if (eftSummaryFilePath != 'FILE_NOT_GENERATED') {
              eftSummaryFilePath = '<a href="' + eftSummaryFilePath + '">' + eftSummaryFilePath + '</a>'
            }
            if (eftStatementFilePath != 'FILE_NOT_GENERATED') {
              eftStatementFilePath = '<a href="' + eftStatementFilePath + '">' + eftStatementFilePath + '</a>'
            }
            this.finalEexportEftResponse = '<p>' + eftFile + '</p><p>' + eftSummaryFilePath + '</p><p>' + eftStatementFilePath + '</p>'
          }
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.finalEexportEftResponse = data.hmsMessage.messageShort
          this.apiResponse = 1;
          resolve();
        } else {
          this.finalEexportEftResponse = data.hmsMessage.messageShort
          this.apiResponse = 1;
          resolve();
        }
      }, (error) => {
        this.finalEexportEftResponse = 'File Not Generated'
        this.apiResponse = 1;
        resolve()
      })
    })
    this.selectedItems = [];
    this.selectedItem = [];
    this.payeeMethodArray =[];
    this.payeeTypeArray = []
    return promise;
  }

  resetArray() {
    this.resetList()
    this.getSystemParameter('');
  }
  //Generate Payment 9th Step API
  finacialAdminInfoSearch(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.finacialAdminInfoSearch;
      //privider d       
      let param
      if (formData.planType == "Q") {
        param = {
          "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
          "planType": formData.planType,
          "payeeCds": ['D', 'C', 'O'],
          "disciplines": this.diciplinePopupArr,
          "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
          "transTypeCd": 'A',
          "tranStatusCds": ['A'],
          "ppaymentRunKey": this.arrayUnique(this.payableSumKeyArray),
          "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
          "ppayReference": this.arrayUnique(this.refernceCd),
        };
      } else {
        param = {
          "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
          "planType": formData.planType,
          "payeeCds": ['D', 'C', 'O'],
          "disciplines": this.diciplinePopupArr,
          "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
          "transTypeCd": 'A',
          "tranStatusCds": ['A'],
          "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
        };
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Needs to be change
          if (data.result.printChequeFilePath == 'FILE_NOT_GENERATED') {
            this.financialAdminInfoResponse = "File Not Generated";
          } else {
            this.financialAdminInfoResponse = '<a href="' + data.result.printChequeFilePath + '">' + data.result.printChequeFilePath + '</a>'
          }
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 1;
          this.financialAdminInfoResponse = "File Not Generated";
          resolve();
        } else {
          this.apiResponse = 0;
          this.financialAdminInfoResponse = "File Not Generated";
          if (this.paymentGenerateForm.value.planType == 'S') {
            this.reinitializeProcess().then(res => {
              resolve();
            })
          } else {
            resolve();
          }
        }
      },(error) => {
        this.financialAdminInfoResponse = "File Not Generated";
        resolve();
      })
    })
    return promise;
  }

  //Generate Payment 10th Step API
  generatingReports(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.generatingReports;
      let param = {
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "businessTypeDesc": formData.planType,
        "planType": formData.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "disciplines": this.diciplinePopupArr
      }
      if (formData.planType == "Q") {
        Object.assign(param, { "ppaymentRunKey": this.arrayUnique(this.payableSumKeyArray) });
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Needs to be change
          this.apiResponse = 1;
          this.generatingReportsResponseStatus = true
          let filePath = data.result.filePath;
          if (data.result.filePath != 'FILE_NOT_GENERATED') {
            filePath = '<a href="' + data.result.filePath + '">' + data.result.filePath + '</a>'
          }
          let payableFilePath = data.result.payableFilePath
          if (data.result.payableFilePath != 'FILE_NOT_GENERATED') {
            payableFilePath = '<a href="' + data.result.payableFilePath + '">' + data.result.payableFilePath + '</a>'
          }
          let transactionListFilePath = data.result.transactionListFilePath
          if (data.result.transactionListFilePath != 'FILE_NOT_GENERATED') {
            transactionListFilePath = '<a href="' + data.result.transactionListFilePath + '">' + data.result.transactionListFilePath + '</a>'
          }
          let paymentSummaryFilePath = data.result.paymentSummaryFilePath
          if (data.result.paymentSummaryFilePath != 'FILE_NOT_GENERATED') {
            paymentSummaryFilePath = '<a href="' + data.result.paymentSummaryFilePath + '">' + data.result.paymentSummaryFilePath + '</a>'
          }
          let prvdrNoEftFilePath = data.result.prvdrNoEftFilePath
          if (data.result.prvdrNoEftFilePath != 'FILE_NOT_GENERATED') {
            prvdrNoEftFilePath = '<a href="' + data.result.prvdrNoEftFilePath + '">' + data.result.prvdrNoEftFilePath + '</a>'
          }
          let patientChequeListFilePath = data.result.patientChequeListFilePath
          if (data.result.patientChequeListFilePath != 'FILE_NOT_GENERATED') {
            patientChequeListFilePath = '<a href="' + data.result.patientChequeListFilePath + '">' + data.result.patientChequeListFilePath + '</a>'
          }
          let providerChequeListFilePath = data.result.providerChequeListFilePath
          if (data.result.providerChequeListFilePath != 'FILE_NOT_GENERATED') {
            providerChequeListFilePath = '<a href="' + data.result.providerChequeListFilePath + '">' + data.result.providerChequeListFilePath + '</a>'
          }
          let providerPatChequeListFilePath = data.result.providerPatChequeListFilePath
          if (data.result.providerPatChequeListFilePath != 'FILE_NOT_GENERATED') {
            providerPatChequeListFilePath = '<a href="' + data.result.providerPatChequeListFilePath + '">' + data.result.providerPatChequeListFilePath + '</a>'
          }
          this.generatingReportsMsg = '<p>' + filePath + '</p>' + payableFilePath + '</p><p>' + transactionListFilePath + '</p><p>' + paymentSummaryFilePath + '</p><p>' + prvdrNoEftFilePath + '</p><p>' + patientChequeListFilePath + '</p><p>' + providerChequeListFilePath + '</p><p>' + providerPatChequeListFilePath + '</p><p>' + 'QC Payment Reports are generated.'
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 1;
          this.generatingReportsResponseStatus = false
          this.generatingReportsMsg = "QC Payment Reports are not generated."
          resolve();
        } else {
          this.apiResponse = 1;
          this.generatingReportsMsg = "QC Payment Reports are not generated."
          this.generatingReportsResponseStatus = false
          if (this.paymentGenerateForm.value.planType == 'S') {
            this.reinitializeProcess().then(res => {
              resolve();
            })
          } else {
            resolve();
          }
        }
      },(error) => {
        this.apiResponse = 1
        this.generatingReportsMsg = "QC Payment Reports are not generated."
        resolve()
      })
    })
    return promise;
  }

  // If error in generate payment then start process again
  reinitializeProcess() {
    let promise = new Promise((resolve, reject) => {
      if (this.apiResponse == 0) {
        this.exDialog.openConfirm(this.translate.instant('finance.toaster.clickToReintiatePaymentProcess')).subscribe((valueDeletePlan) => {
          if (valueDeletePlan) {
            this.fieldArray = [];
            this.comapnyfieldArray = [];
            this.brokerfieldArray = [];
            this.submitPaymentGenerateForm(this.paymentGenerateForm);
          } else {
            this.showFirst = false
            this.generatePaymentButton = false
            this.fieldArray = []
          }
        })
      } else {
        resolve();
      }
    })
    return promise
  }

  GeneratingCoChq() {
    this.step4GeneratingChequeCo().then(res => {
      if (this.apiResponse == 1) {
        this.update = {
          "id": 4,
          "done": "1",
          "step": "4",
          "processing": "Generating Cheque (Company Payments)",
          "result": this.totalChequeRecordsResponse
        }
        let generatingEftRecordsArr = {
          "id": 5,
          "done": "1",
          "step": "5",
          "processing": "Comapny Print Cheque (Company Payments)",
          "result": "Done"
        }
        this.showUpdatedItemSecond(this.update);
        this.fieldArraySecond.push(generatingEftRecordsArr);
      }
      else {
        this.ToastrService.error(this.step4ErrorMessage);
      }
    })
  }

  printCheque() {
    let promise = new Promise((resolve, reject) => {
      var params = {
        "payableTransactionKeys": this.companyTansectionArray,
        "spaymentRunKey": this.arrayString(this.companySumKeyArray),
        "payableSumKey": this.payableSumKey,
        "coRefundTransDtStart": "",
        "coRefundTransDtEnd": "",
        "surplus": '',
        "eft": "",
        "accClosure": "",
        "coId": "",
        "coName": "",
        "coRefundTransDt": "",
        "tranCd": "",
        "coRefundTotalAmt": "",
        "coRefundPaySumKey": this.paymentRunKey || this.lastSelectedPaymentSumKey,
        "isPrint": 'T',
        "length": this.dataTableService.pageLength,
        "start": 0
      }
      var url = UftApi.companyRefundPaymentsChqUrl
      this.hmsDataService.postApi(url, params).subscribe(data => {
        if (data.code == 200) {
          this.showLoader = false
          let filePath = data.result.companyRefundFilePath
          if (filePath != '') {
            filePath = '<a href="' + filePath + '">' + filePath + '</a>'
            this.companyRefundFilePath = '<p>' + 'File Generated Successfully' + '</p><p>' + filePath +  '</p>';
          } else {
            this.companyRefundFilePath = '<p>' + 'File Not Generated' + '</p>';
          }
          this.apiResponse = 3
          resolve()
        } else {
          this.companyRefundFilePath = '<p>' + 'File Not Generated' + '</p>';
          this.apiResponse = 3
          this.showLoader = false
          this.ToastrService.error(this.translate.instant('uft.toaster.chequeCantPrint'))
          resolve()
        }
      }, (error) => {
        this.companyRefundFilePath = '<p>' + 'File Not Generated' + '</p>';
        this.apiResponse = 3
        this.showLoader = false
        resolve()
      })

    })
    // calling broker after company
    if (this.brokerSumKeyArray.length > 0) {
      this.brokerSecondHalf(false);
      return;
    } else {
      this.resetArray();
      this.resetForms();
    }
    return promise;
  }

  resetGeneratePaymentForm() {
    this.paymentGenerateForm.reset();
    this.paymentSumForm.reset();
    this.hideFields = false;
    this.recNotFounndSysParam = false
    this.fieldArray = [];
    this.manualPaymentSumKey = ''
    this.totalClaims = '';
    $("#closeGeneratePaymentForm").trigger('click');
    this.generatePaymentButton = false
    this.diciplinePopupArr = []
    this.paymentGenerateForm.controls['drug'].setValue("true");
  }

  resetGeneratePaymentFormWithoutClose() {
    this.fieldArray = []
    this.generatePaymentButton = false
  }

  resetPaymentSumForm() {
    $("#closePaymentSumForm").trigger('click');
  }

  //In 9th step Generate Payment required shorcode in request
  convertPayeeValueIntoCode() {
    if (this.payeeValue == 'Provider') {
      return 'D'
    } else if (this.payeeValue == 'Cardholder') {
      return 'C'
    } else if (this.payeeValue == 'Other') {
      return 'O'
    }
  }

  //In 9th step Generate Payment required shorcode in request
  convertTransactionTypeIntoCode() {
    if (this.transactionTypeValue == 'Cash Receipt') {
      return 'A'
    } else if (this.transactionTypeValue == 'Claim Payment') {
      return 'P'
    } else if (this.transactionTypeValue == 'Cheque Reversal') {
      return 'R'
    }
  }

  //In 9th step Generate Payment required shorcode in request
  convertTransactionStatusIntoCode() {
    if (this.transactionStatusValue == 'Issued') {
      return 'A'
    } else if (this.transactionStatusValue == 'Stopped') {
      return 'S'
    } else if (this.transactionStatusValue == 'Pending') {
      return 'P'
    } else if (this.transactionStatusValue == 'Cashed') {
      return 'H'
    } else if (this.transactionStatusValue == 'Cancelled') {
      return 'C'
    } else if (this.transactionStatusValue == 'Stale-dated') {
      return 'T'
    }
  }

  //Default Patch Plan Type Quikcard value in Generate Payment Popup
  patchPlanType() {
    this.paymentGenerateForm.patchValue({
      "planType": 'Q'
    })
    if (this.diciplinePopupArr.includes('DR')) {
      //do nothing
    } else {
      this.diciplinePopupArr.push('DR')
    }
  }

  /**
 * Get Discilipins List
 */
  getDiscilipinList() {
    this.hmsDataService.getApi(FinanceApi.getDisciplineUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.discilipinList = data.result;
        this.discilipinData = this.completerService.local(
          this.discilipinList,
          "disciplineName",
          "disciplineName"
        )
      }
    })
  }

  onSelectedDiscipline(selected: CompleterItem) {
    if (selected) {
      this.disciplineValue = selected.originalObject.disciplineCd;
    }
    else {
      this.disciplineValue = ''
    }
  }

  onChangepaymentType(newValue, valuePay) {
    this.paymentType = newValue; // E or C
    this.transactionSearch.patchValue({ 'paySelection': '' });
    this.transactionSearch.patchValue({ 'payBanktype': '' });
    if (this.payableSumKeyArray.length <= 0 && this.companySumKeyArray.length <= 0 && this.brokerSumKeyArray.length <= 0) {
      this.transactionSearch.patchValue({ 'paymentType': '' })
      this.ToastrService.error(this.translate.instant('uft.toaster.errorNoTransectionIsSelected'))
      return false
    }

  }
  BrokerChq() {
    this.step4GeneratingCheque().then(res => {
      if (this.apiResponse == 1) {
        this.GeneratingChqBroker()
        this.update = {
          "id": 4,
          "done": "1",
          "step": "4",
          "processing": "Generating Cheque (Broker Payments)",
          "result": this.totalChequeRecordsResponse
        }
        this.showUpdatedItemSecond(this.update);
      } else {
        this.ToastrService.error(this.step4ErrorMessage);
      }
    })
  }
  GeneratingChqBroker() {
    this.step6BrokerPrintingCheques().then(res => {
      if (this.apiResponse == 1) {
          this.update = {
            "id": 6,
            "done": "1",
            "step": "6",
            "processing": "Broker Cheque List (Broker Payments)",
            "result": this.brokerChequeListResponse
          }
          // this.showBRUpdatedItem(this.update);
          this.showUpdatedItemSecond(this.update)
      } else {
        this.ToastrService.error(this.step6ErrorMessage);
      }
    })
  }

  getBrokerReports() {
    this.step7BrokerPaymentSummaryReport().then(res => {
      if (this.apiResponse) {
        this.update = {
          "id": 7,
          "done": "1",
          "step": "7",
          "processing": "Broker Payment Summary Report (Broker Payments)",
          "result": this.brokerPaymentSummaryReportResponse
        }
        this.showUpdatedItemSecond(this.update);
        let generatingEftRecordsArr = {
          "id": 7,
          "done": "1",
          "step": "7",
          "processing": "Generating Reports (Broker Payments)",
          "result": "Payment Generated Successfully"
        }
        // Exporting Final Payment Report Files
        this.fieldArraySecond.push(generatingEftRecordsArr);
      } else {
        this.ToastrService.error(this.step7ErrorMessage);
      }
    });
  }

  staleChequePopup() {
    //Predictive Company Search Upper
    this.businessTypeData = this.completerService.local(
      this.currentUser.businessType,
      "businessTypeDesc",
      "businessTypeDesc"
    );
  }

  resetStaleChequeForm() {
    this.staleChequeForm.reset();
    this.selectedBusinessTypeCdValue = ''
  }

  resetGenerateStaleChequeForm() {
    $("#closeStaleChequeForm").trigger('click');
  }

  onBusinessTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedBusinessTypeCdValue = selected.originalObject.businessTypeCd;
    }
    else {
      this.selectedBusinessTypeCdValue = '';
    }
  }

  generateStaleCheque(staleChequeForm) {
    if (this.staleChequeForm.valid) {
      this.showLoader = true;
      var url = FinanceApi.generateStaleCheque;
      this.paramData = {
        "planType": this.selectedBusinessTypeCdValue,
        "dateAsOf": this.changeDateFormatService.convertDateObjectToString(this.staleChequeForm.value.dateAsOf)
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.hmsMessage.messageShort == "SUCCESS") {
          this.showLoader = false;
          this.ToastrService.success(this.translate.instant('uft.toaster.staleChequeGeneratedSuccess'));
          $("#closeStaleChequeForm").trigger('click');
        } else if (data.code == 400 && data.hmsMessage.messageShort == "STALE_CHEQUE_ALREADY_GENERATED_WITH_PROVIDED_DATE") {
          this.showLoader = false;
          this.ToastrService.error(this.translate.instant('uft.toaster.staleChequeAlreadyGeneratedWithProvidedDate'))
        } else {
          this.showLoader = false;
          this.ToastrService.error(this.translate.instant('uft.toaster.somethingWentWrong'));
        }
      });
    } else {
      this.validateAllFormFields(this.staleChequeForm)
    }
  }

  cancelCheque() {
    this.exDialog.openConfirm(this.translate.instant('uft.toaster.aboutToCancelEFTPaymentForTrans') + this.selectedTransSearchRowData.paymentKey + ' . ' + this.translate.instant('uft.toaster.ok')).subscribe((value) => {
      if (value) {
        this.showLoader = true;
        var url = FinanceApi.cancelChequeApi;
        {
          var paramData = {
            "discipline": this.selectedTransSearchRowData.pdiscipline,
            "paymentKey": this.selectedTransSearchRowData.paymentKey,
            "canceled": "T",
            "issued": "F"
          }
          this.hmsDataService.postApi(url, paramData).subscribe(data => {
            this.showLoader = false
            if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == "CHEQUE_CANCELLED_SUCCESSFULLY") {
              this.ToastrService.success(this.translate.instant('uft.toaster.chequeCancelledSuccess'));
            } else {
              this.ToastrService.error(data.hmsMessage.messageShort);
            }
          });
        }
      }
    })
  }

  stopAndReissueCheque() {
    this.exDialog.openConfirm(this.translate.instant('uft.toaster.aboutToCancelEFTPaymentForTrans') + this.selectedTransSearchRowData.paymentKey + ' . ' + this.translate.instant('uft.toaster.ok')).subscribe((value) => {
      if (value) {
        this.showLoader = true;
        var url = FinanceApi.stopAndCancelApi;
        {
          var paramData = {
            "discipline": this.selectedTransSearchRowData.pdiscipline,
            "paymentKey": this.selectedTransSearchRowData.paymentKey,
            "canceled": "T",
            "issued": "F"
          }
          this.hmsDataService.postApi(url, paramData).subscribe(data => {
            this.showLoader = false
            if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == "CHEQUE_STOP_SUCCESSFULLY") {
              this.ToastrService.success(this.translate.instant('uft.toaster.chequeStoppedSuccess'));
            } else {
              this.ToastrService.error(data.hmsMessage.messageShort);
            }
          });
        }
      }
    })
  }

  submitCancelAndReissueForm(cancelAndReissueForm) {
    if (this.cancelAndReissueForm.valid) {
      var paymentKey = cancelAndReissueForm.value.CancelAndReissuePaymentKey
      $("#closeCancelAndReissueForm").trigger('click');
      this.cancelAndReissueChequeProcess(paymentKey);
    } else {
      this.validateAllFormFields(this.cancelAndReissueForm)
    }
  }

  resetCancelAndReissueForm() {
    this.cancelAndReissueForm.reset();
    $("#closeCancelAndReissueForm").trigger('click');
  }

  cancelAndReissueChequeProcess(paymentKey) {
    this.exDialog.openConfirm(this.translate.instant('uft.toaster.aboutToCancelEFTPaymentForTrans') + paymentKey + ' . ' + this.translate.instant('uft.toaster.ok')).subscribe((value) => {
      if (value) {
        this.showLoader = true;
        var url = FinanceApi.cancelAndReissueChequeApi;
        {
          var paramData = {
            "paymentKey": paymentKey,
            "canceled": "T",
            "issued": "F"
          }
          this.hmsDataService.postApi(url, paramData).subscribe(data => {
            this.showLoader = false
            if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == "CHEQUE_CANCELLED_SUCCESSFULLY") {
              this.ToastrService.success(this.translate.instant('uft.toaster.chequeCancelledSuccess'));
            } else {
              this.ToastrService.error(data.hmsMessage.messageShort);
            }
          });
        }
      }
    })
  }

  cashReceiptPopup() {
    this.cashReceiptForm.controls['discipline'].setValue('D')
  }

  submitCashReceiptForm() {
    if (this.cashReceiptForm.valid) {
      this.showLoader = true;
      var url = FinanceApi.cashReceipt;
      this.paramData = {
        "discipline": (this.cashReceiptForm.value.discipline) ? this.cashReceiptForm.value.discipline : this.cashReceiptDisciplineValue,
        "confirmId": this.cashReceiptForm.value.confirmId
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.showLoader = false
          this.ToastrService.success(this.translate.instant('uft.toaster.cashReceiptReceivedSuccess'));
          $("#cashReceiptForm").trigger('click');
        } else {
          this.showLoader = false
          this.ToastrService.error(data.hmsMessage.messageShort);
        }
      });
    } else {
      this.validateAllFormFields(this.cashReceiptForm)
    }
  }

  resetCashReceiptForm() {
    this.cashReceiptForm.reset();
    $("#closeCashReceiptForm").trigger('click');
  }

  exportTransactionSearchList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    if (this.getLowerSearch) {
      var params = this.dataTableService.getFooterParams("transactionSearchList")
      var discipline
      var disciplineAr
      if (params[0].value) {
        discipline = params[0].value
        disciplineAr = this.disciplineConversion(discipline)
      } else {
        disciplineAr = []
      }
      this.reqParamPlan = {
        "start": 0, "length": this.dataTableService.totalRecords, 'disciplineList': disciplineAr, 'paymentKey': params[1].value, 'issueDate': params[2].value, 'chequeRefNo': params[3].value, 'tranStatCd': params[4].value, 'debitAmount': params[5].value, 'adminFee': params[6].value, 'generatedDate': params[7].value, 'stransStatus': params[8].value, 'clearSeq': params[9].value, 'cancelDate': params[10].value, 'stransType': params[11].value, 'sbusType': params[12].value, 'processDate': params[13].value, 'payee': params[14].value, 'paramApplication': paramApp
      }
    }
    else {
      if (this.providerNo) {
        var cardId = (this.transactionSearch.value.providerNo != null) ? this.transactionSearch.value.providerNo : ''
      } else if (this.cardholderNo) {
        var cardId = (this.transactionSearch.value.cardholderNo != null) ? this.transactionSearch.value.cardholderNo : ''
      } else {
        cardId = ''
      }
      this.reqParamPlan = {
        "start": 0, "length": this.dataTableService.totalRecords, 'paymentKey': this.transactionSearch.value.transNo, 'stransType': this.transactionSearch.value.transactionType, 'stransStatus': this.transactionSearch.value.transactionStatus, 'sbusType': (this.transactionSearch.value.businessType != null) ? this.transactionSearch.value.businessType : '', 'payee': this.transactionSearch.value.payee, 'generatedDate': (this.transactionSearch.value.generationDate == '' || this.transactionSearch.value.generationDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.generationDate),
        'issueDate': (this.transactionSearch.value.issueDate == '' || this.transactionSearch.value.issueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.issueDate), 'discipline': '', 'debitAmount': '', 'adminFee': '', 'transAmount': '', 'clearSeq': '', 'tranStatCd': '', 'cancelDate': '', 'processDate': '', 'transactionStartAmount': this.transactionSearch.value.transStartAmt,
        'transactionEndAmount': this.transactionSearch.value.transEndAmt, 'transStartDate': this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transStartDate), 'transEndDate': this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transEndDate), 'chequeRefNoStart': this.transactionSearch.value.chequeRefNoStart, 'chequeRefNoEnd': this.transactionSearch.value.chequeRefNoEnd, 'chequeRefNo': this.transactionSearch.value.chequeRefNo, 'paymentSumKey': this.transactionSearch.value.paymentSumKey, 'disciplineList': this.disciplineArr, 'providerCardId': cardId, 'clearDate': (this.transactionSearch.value.clearDate == '' || this.transactionSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.clearDate),
        'paramApplication': paramApp
      }
    }
    var transactionSearchURL = FinanceApi.transactionSearchFilterDataReportUrl;
    if (this.dataTableService.totalRecords > 500) {
      this.exDialog.openConfirm(this.translate.instant('uft.toaster.itWillTakeSomeTimeDoYouWantToContinue')).subscribe((value) => {
        if (value) {
          this.exportFile(transactionSearchURL, this.reqParamPlan)
        }
      });
    } else {
      this.exportFile(transactionSearchURL, this.reqParamPlan)
    }
  }

  exportFile(URL, reqParamPlan) {
    this.showLoader = false
    this.loader = "Loading File....."
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loader = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loader = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          a.download = "Transaction-List" + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
      }
    })
  }

  //Pay Selection
  onChangepaySelection(value) {
    if (value == 1) {
      this.payOptions = [{ 'val': '1', 'name': "Pay All" }];
      this.transactionSearch.patchValue({
        "paySelection": "1"
      })
      if (!$('.selectAll').prop('checked')) {
        $('.selectAll').trigger('click')
      }
    }
  }
  //Pay Bank Type
  getBankTypes() {
    var url = UftApi.retrieveBankAccount;
    var paramData = {
      "planTypeCd": this.paymentGenerateForm.value.planType || "Q",
      "originatorRoleCd": "C"
    }
    this.hmsDataService.postApi(url, paramData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.bankData = data.result.data;
      }
      this.transactionSearch.patchValue({ 'payBanktype': '' })
    })
  }

  onChangepayeeBank(bankData) {
    if (this.payableSumKeyArray.length <= 0 && this.companySumKeyArray.length <= 0 && this.brokerSumKeyArray.length <= 0) {
      this.transactionSearch.patchValue({ 'payBanktype': '' })
      this.ToastrService.error(this.translate.instant('uft.toaster.errorNoTransectionIsSelected'))
      return false
    }
    if (this.transactionSearch.valid) {
      if (bankData) {
        bankData = this.bankData[bankData]
        this.orgName = bankData.oname
        this.orgNo = bankData.onum
        this.orgDesc = bankData.poriginatorDesc
        this.orgRecCenter = bankData.preceiverCenter
        this.bankNo = bankData.obankNum
        this.branchNo = bankData.obranchNum
        this.accNo = bankData.oacctNum
        this.defalutDir = bankData.pdefaultDir
      }
    } else {
      this.validateAllFormFields(this.transactionSearch)
    }
  }

  onChangepayeeBankType(bankData) {
    if (this.payableSumKeyArray.length <= 0 && this.companySumKeyArray.length <= 0 && this.brokerSumKeyArray.length <= 0) {
      this.transactionSearch.patchValue({ 'payBanktype': '' })
      this.ToastrService.error(this.translate.instant('uft.toaster.errorNoTransectionIsSelected'))
      return false
    }
    if (this.transactionSearch.valid) {
      // ..herej
      this.exDialog.openConfirm(this.translate.instant('uft.toaster.areYouSureYouWantToRunIssuePayment')).subscribe((value) => {
        if (value) {
          let seletedPayee = this.paymentGenerateForm.value.payeetype;
          if (this.payableSumKeyArray.length > 0) {
            this.payableSecondHalf(false);
            return;
          }
          else if (this.companySumKeyArray.length > 0) {
            this.comapanySecondHalf(false);
            return;
          }
          else if (this.brokerSumKeyArray.length > 0) {
            this.brokerSecondHalf(false);
            return;
          }
        }
      })
    } else {
      this.validateAllFormFields(this.transactionSearch)
    }
  }

  payBanktypeFocus(e) {
    if (this.payableSumKeyArray.length <= 0 && this.companySumKeyArray.length <= 0 && this.brokerSumKeyArray.length <= 0) {
      this.transactionSearch.patchValue({ 'paymentType': '' })
      this.transactionSearch.patchValue({ 'paySelection': '' })
      this.ToastrService.error(this.translate.instant('uft.toaster.errorNoTransectionIsSelected'));
      return false
    } else {
      if (this.bankData.length > 0) {
        this.transactionSearch.patchValue({
          "payBanktype": 0
        });
        let bankData = this.bankData[0]
        this.orgName = bankData.oname
        this.orgNo = bankData.onum
        this.orgDesc = bankData.poriginatorDesc
        this.orgRecCenter = bankData.preceiverCenter
        this.bankNo = bankData.obankNum
        this.branchNo = bankData.obranchNum
        this.accNo = bankData.oacctNum
        this.defalutDir = bankData.pdefaultDir
      }
    }
  }

  payableSecondHalf(selected) {
    this.showFirstSecond = true
    if (this.paymentGenerateForm.value.planType == 'Q') {
      if (this.transactionSearch.value.paymentType == 'E') {
        this.comapnyCardholderStep6QbEft();
      } else if (this.transactionSearch.value.paymentType == 'C') {
        this.comapnyCardholderStep6QbCheque()
      }
    } else {
      // this.comapnyCardholderStep6AllOrAdsc()
      if (this.transactionSearch.value.paymentType == 'E') {
        this.comapnyCardholderStep6QbEft();
      } else if (this.transactionSearch.value.paymentType == 'C') {
        this.comapnyCardholderStep6QbCheque()
      }
    }
  }
  comapanySecondHalf(selected) {
    this.showFirstSecond = true;
    if (this.paymentGenerateForm.value.payeetype != 'all') {
      if (this.transactionSearch.value.paymentType == 'E') {
        this.GeneratingCoEft() // company eft
      } else if (this.transactionSearch.value.paymentType == 'C') {
        this.GeneratingCoChq(); // companyCheque
      }
    } else {
      /* GeneratingCoEft() method commented as per existing code and new checks applied as per checks as discussed with Arun sir*/ 
      if (this.transactionSearch.value.paymentType == 'E') {
        this.GeneratingCoEft() // company eft
      } else if (this.transactionSearch.value.paymentType == 'C') {
        this.GeneratingCoChq(); // companyCheque
      }
    }
  }
  brokerSecondHalf(selected) {
    this.showFirstSecond = true;
    if (this.paymentGenerateForm.value.payeetype != 'all') {
      if (this.transactionSearch.value.paymentType == 'E') {
        this.GeneratingEftBroker() // broker eft
      } else if (this.transactionSearch.value.paymentType == 'C') {
        this.BrokerChq() // broker chq
      } 
    } else {
      /* GeneratingEftBroker() method commented as per existing code and new checks applied as per checks as discussed with Arun sir*/ 
      if (this.transactionSearch.value.paymentType == 'E') {
        this.GeneratingEftBroker() // broker eft
      } else if (this.transactionSearch.value.paymentType == 'C') {
        this.BrokerChq() // broker chq
      } 
    }
  }
  transactionSearchClaimCheque() {
    this.showSearchTable = true;
    let reqParam = [
      { 'key': 'disciplineList', 'value': [this.transactionParams.discipline] },
      { 'key': 'generatedDate', 'value': '' },
      { 'key': 'issueDate', 'value': '' },
      { 'key': 'sbusType', 'value': this.transactionParams.businessType },
      { 'key': 'payee', 'value': this.transactionParams.payee },
      { 'key': 'stransStatus', 'value': '' },
      { 'key': 'stransType', 'value': '' },
      { 'key': 'dueDate', 'value': '' },
      { 'key': 'clearDate', 'value': '' },
      { 'key': 'claimKey', 'value': (this.transactionParams.claimKey) ? this.transactionParams.claimKey : '' },
    ]
    this.tableAction = [
      { 'name': 'edit', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye' },
    ]
    var URL = FinanceApi.getTransactionSearchFilterData;
    var tableId = "transactionSearchList"
    if (!$.fn.dataTable.isDataTable('#transactionSearchList')) {
      this.dataTableService.jqueryDataTableTransSearch(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, this.tableAction, 15, [2, 7, 10, 13], '', [5, 6])
    } else {
      this.finalTotal = '$0.00';
      this.total = 0;
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
    }
  }

  ngOnDestroy() {
    if (this.FinanceService.isBackCompanySearch == false) {
      this.FinanceService.companySearchedData = ''
      this.FinanceService.searchedCompanyName = ''
      this.FinanceService.searchedCompanyId = ''
    }
  }

  disciplineConversion(value) {
    let disciplineClaimCheque = []
    if (value == 'Dental') {
      disciplineClaimCheque = ["D"]
    } else if (value == 'Vision') {
      disciplineClaimCheque = ["V"]
    } else if (value == 'Health') {
      disciplineClaimCheque = ["H"]
    } else if (value == 'Drug') {
      disciplineClaimCheque = ["DR"]
    } else if (value == 'Supplemental') {
      disciplineClaimCheque = ["HS"]
    }
    return disciplineClaimCheque
  }

  resetTableSearch() {
    $(".inputSearch").each(function () {
      $(this).val('')
      if ($(this).data('type') == "date") {
        $(this).val('')
        var id = $(this).data('updateId')
        var val = $(this).find("input").val('')
      } else if ($(this).data('type') == 'select') {
        $(this).prop('selectedIndex', 0);
      }
      if ($(this).data('type') == "select") {
        var val = $(this).find("select").val(null)
      }
    });
  }

  getBrokersList() {
    this.reqParam = [{ key: 'trxnStartDate', value: this.changeDateFormatService.convertDateObjectToString(this.constantDate.beginDate) }, { key: 'trxnEndDate', value: this.changeDateFormatService.convertDateObjectToString(this.constantDate.endDate) },
    { key: 'searchType', value: "1" },
    { key: 'payeeNumber', value: "" },
    { key: 'referenceInfo', value: "" },
    { key: 'payeeType', value: null },
    { key: 'ppayeeType', value: [] },
    { key: 'ppaymentMethod', value: [] },
    { key: 'ptransactionType', value: [] }
    ];
    this.columns = [
      { title: "Select", data: 'payabletransactionKey' },
      { title: 'Transaction', data: 'transaction' },
      { title: 'Transaction Type', data: 'transactionType' },
      { title: 'Transaction Created On', data: 'transactionCreatedOn' },
      { title: 'Payee Type', data: 'payeeType' },
      { title: 'Payee Name', data: 'payeeName' },
      { title: 'Payee Number', data: 'payeeNumber' },
      { title: 'Transaction Amount', data: 'transactionAmount' },
      { title: 'Payment Method', data: 'paymentMethod' },
      { title: 'Transaction Number', data: 'referenceCd' }
    ]
    this.finalTotal = '$0.00';
    this.total = 0;
    var url = FinanceApi.payableTransactions;
    if (!$.fn.dataTable.isDataTable('#ListTable')) {
      this.dataTableService.jqueryDataTable('ListTable', url, 'full_numbers', this.columns, 10, true, true, 'lt', 'irp', undefined, [3, 'desc'], '', this.reqParam, '', [0], [3], [], [7], [1, 2, 4, 5, 6, 8]);
    } else {
      this.finalTotal = '$0.00'
      this.total = 0;
      $('.scroll-ListTable').scrollTop(0);
      this.dataTableService.jqueryDataTableReload("ListTable", url, this.reqParam)
    }
    this.changeFilterDateFormat({ reason: 2, value: this.changeDateFormatService.convertDateObjectToString(this.todayDate) }, 'filter_createdOn')
    this.getLowerSearch = true;
  }
  getSumAmount() {
    $(".listTableCheck").each(function () {
      var rowData = $(this).data('val');
    })
  }

  exportList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    this.recordLength = this.dataTableService.totalRecords;
    if (this.getLowerSearch == true) {
      var params = this.dataTableService.getFooterParams("ListTable");
      params.push({ "key": "ppaymentMethod", value: this.payeeMethodArray });
      params.push({ "key": "ptransactionType", value: this.transTypeArray });
      params.push({ "key": "ppayeeType", value: this.payeeTypeArray });
      params.push({ "key": "start", value: 0 });
      params.push({ "key": "length", value: this.recordLength });
      // Added paramApplication param by
      params.push({ "key": "paramApplication", value: "HMS" })
      if (this.rangeStartDate != ' ') {
        params.push({
          "key": "trxnStartDate", "value": this.rangeStartDate || this.changeDateFormatService.convertDateObjectToString(this.constantDate.beginDate)
        });
      }
      if (this.rangeEndDate != ' ') {
        params.push({
          "key": "trxnEndDate", "value": this.rangeEndDate || this.changeDateFormatService.convertDateObjectToString(this.constantDate.endDate)
        });
      }
      var object = params.reduce(
        (obj, item) => Object.assign(obj, { [item.key]: item.value }), {});
      var reqParamPlan =
        { "start": 0, "length": this.recordLength }
    }
    else {
      var reqParamPlan =
        { "start": 0, "length": this.recordLength }
    }
    var URL = FinanceApi.payableTransactionsExcel;
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFileExcel(URL, object)
          } else {
            this.exportFileExcel(URL, object)
          }
        }
      });
    } else {
      this.exportFileExcel(URL, object)
    }
  }
  exportFileExcel(URL, reqParamPlan) {
    let fileName = "Financial-payable-List";
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.showLoader = true
    this.hmsDataService.postApi(URL, reqParamPlan).subscribe(data => {
      this.showLoader = false
      if (data.code == 200 && data.status == "OK") {
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
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
      } else {
      }
    })
  }

  companyReport() {
    this.Step3exportCoRefundEft().then(res => {
      if (this.apiResponse == 1) {
        this.getCompanyPrintingELStatement().then(res => {
          this.update = {
            "id": 3,
            "done": "1",
            "step": "3",
            "processing": "Exporting EFT File (Company Payments) ",
            "result": this.totalChequeRecordsResponse
          }
          this.showUpdatedItemSecond(this.update);
          let generatingCoEftRecordsArr = {
            "id": 4,
            "done": "1",
            "step": "4",
            "processing": "Generating Report (Company Payments)",
            "result": "<p><a href='" + this.exportPdfFilePathUrl + "'>" + this.exportPdfFilePathUrl + "</a></p><p><a href='" + this.companyRefundExportPdfFilePathUrl + "'>" + this.companyRefundExportPdfFilePathUrl + "</a></p><p>" + this.companyPrintingELStatementMsg +"</p>"
          }
          this.fieldArraySecond.push(generatingCoEftRecordsArr);
          if (this.brokerSumKeyArray.length > 0) {
            this.brokerSecondHalf(false);
            return;
          } else {
            // laststep
            this.FinalReportExporting().then(res => {
              let updateExportingPaymentFiles = {
                "id": 15,
                "done": "1",
                "step": "15",
                "processing": "Exporting Final Payment Report Files ",
                "result": this.finalEexportEftResponse
              }
              this.showUpdatedItemSecond(updateExportingPaymentFiles);
              if (this.brokerSumKeyArray.length == 0) {
                this.resetArray()
              } else {
                this.getBrokersList()
              }
            });
          }
        })
      } else if (this.apiResponse == 2) {
        this.update = {
          "id": 3,
          "done": "1",
          "step": "3",
          "processing": "Exporting EFT File (Company Payments) ",
          "result": this.totalChequeRecordsResponse
        }
        this.showUpdatedItemSecond(this.update);
        if (this.brokerSumKeyArray.length > 0) {
          this.brokerSecondHalf(false);
          return;
        } else {
          this.FinalReportExporting().then(res => {
            let updateExportingPaymentFiles = {
              "id": 15,
              "done": "1",
              "step": "15",
              "processing": "Exporting Final Payment Report Files ",
              "result": this.finalEexportEftResponse
            }
            this.showUpdatedItemSecond(updateExportingPaymentFiles);
            if (this.brokerSumKeyArray.length == 0) {
              this.resetArray()
            } else {
              this.getBrokersList()
            }
          });
        }
      } else {
        this.ToastrService.error(this.step3ErrorMessage);
        this.resetArray()
        this.resetForms();
      }
    })
  }

  arrayString(a) {
    var unique = a.filter(function (itm, i, a) {
      return i == a.indexOf(itm);
    });
    return '[' + unique.toString() + ']';
  }
  arrayUnique(a) {
    var unique = a.filter(function (itm, i, a) {
      return i == a.indexOf(itm);
    });
    return unique.toString().split(",");
  }
  resetForms(selected = 'Q') {
    let fixVAl = this.paymentGenerateForm.value.planType;
    if (fixVAl == "Q") {
      selected = "Q"
      $('.tableGrid').show();
    } else {
      selected = "S"
    }
    this.paymentGenerateForm.reset();
    this.transactionSearch.reset();
    this.paymentGenerateForm.patchValue({ 'planType': selected })
    var date = new Date();
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.model = { 'beginDate': this.changeDateFormatService.getMonthBackDate().fromDate.date, 'endDate': this.changeDateFormatService.getMonthBackDate().toDate.date};
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable("ListTable", obj)
    var dateParams = [3]
    var url = FinanceApi.payableTransactions;
    this.finalTotal = '$0.00';
    this.total = 0;
    $('.scroll-ListTable').scrollTop(0);
    if (this.reqParam.filter(e => e.transactionCreatedOn != '').length > 0) {
      /* vendors contains the element we're looking for */
      this.changeFilterDateFormat({ reason: 2, value: this.changeDateFormatService.convertDateObjectToString(this.todayDate) }, 'filter_createdOn')
    }
    this.dataTableService.jqueryDataTableReload("ListTable", url, this.reqParam)
  }

  payableReports() {
    this.getPayableReportList()
  }

  searchEligibilityFiles() {
    this.userGroupData = this.completerService.local(
      [{ "typeKey": 1, "typeName": "Payment Run" }, { "typeKey": 2, "typeName": "Issue Paymen" }],
      "typeName",
      "typeName"
    );
    let reqParam = [
      { 'key': 'govtEligCatKey', 'value': 1 },
      { 'key': 'startDate', 'value': '08/12/2018' },
      { 'key': 'endDate', 'value': '08/12/2020' }
    ];
    let columns = [
      { title: 'File Type', data: 'fileName' },
      { title: 'Path', data: 'fileType' },
      { title: 'Date', data: 'fileGenerationDate' },
      { title: 'Action', data: 'url' }
    ]
    var url = DataManagementDashboardApi.searchGovEligFilesUrl
    var tableActions = [
      { 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': '' },
    ];
    if (!$.fn.dataTable.isDataTable('#ListTables')) {
      this.dataTableService.jqueryDataTableSearchClaim("ListTables", url, 'full_numbers', columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 3, '', '', [1, 2], [3]);
      setTimeout(() => {
        this.dataTableService.jqueryDataTableReload("ListTables", url, reqParam)
      }, 200);
    } else {
      this.dataTableService.jqueryDataTableReload("ListTables", url, reqParam)
    }
  }

  getPayableReportList() {
    var reqParam = [
      { 'key': 'paramName', 'value': '' },
      { 'key': 'paramType', 'value': '' },
      { 'key': 'paramIssuedDate', 'value': '' },
      { 'key': 'paramModule', 'value': '' }
    ]
    var url = UftApi.getPayableRptUrl
    var tableId = "payableReportList"
    var tableActions = [
      { 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': '' },
    ];
    if (!$.fn.dataTable.isDataTable('#payableReportList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.payableReportColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, [3], [2], '', '', [1, 2, 3], '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  getGeneratePayableRptZip(hmsPayRptKey) {
    let reqRpt = {
      'hmsPayRptKey': hmsPayRptKey
    }
    this.hmsDataService.postApi(UftApi.generatePayableRptZipUrl, reqRpt).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result.base64Zipfile != "" && data.result.base64Zipfile != undefined) {
          let fileName = "payableReport.zip"
          var filePath = data.result.base64Zipfile
          // application/zip
          var blob = this.hmsDataService.b64toBlob(filePath, "application/zip");
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = fileName;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      }
    })
  }

  searchPayableReport(tableId: string) {
    var params = this.dataTableService.getFooterParams("payableReportList")
    var dateParams = [2]
    var URL = UftApi.getPayableRptUrl
    this.dataTableService.jqueryDataTableReload("payableReportList", URL, params, dateParams)
  }

  resetPayableReport() {
    this.dataTableService.resetTableSearch();
    this.searchPayableReport("payableReportList")
    $('#payableReportList .icon-mydpremove').trigger('click');
  }
  onInputFocusBlur(event: IMyInputFocusBlur): void {
    if (event.reason == 2 && (!event.value || event.value != '')) {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.model = {
          beginDate: obj.date,
          endDate: obj.date
        };
        this.rangeStartDate = this.changeDateFormatService.convertDateObjectToString({ date: obj.date });
        this.rangeEndDate = this.changeDateFormatService.convertDateObjectToString({ date: obj.date });
      }
    }
  }

  // To stop new window functionality for company cheque print in case of Payment type C
  chequePrintCompany() {
    this.printCheque().then(res => {
      if (this.apiResponse == 3) {
        this.update = {
          "id": 6,
          "done": "1",
          "step": "6",
          "processing": "Cheque Printing",
          "result": this.companyRefundFilePath
        }
        this.showUpdatedItemSecond(this.update)
      } else {
        this.ToastrService.error(this.translate.instant('uft.toaster.chequeCantPrint'));
      }
    })
  }

  getSecondStepAPICallingForGeneratingReports(formData) {
    // 2nd API calling
    let promise = new Promise((resolve, reject) => {
      let reqParam = {
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "planType": formData.planType,
        "payeeCds": ['D', 'C', 'O'],
        "disciplines": this.diciplinePopupArr,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "transTypeCd": 'A',
        "tranStatusCds": ['A','D'],
        "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
        "ppayReference": this.arrayUnique(this.refernceCd)
      }
      if (formData.planType == "Q") {
        Object.assign(reqParam, { "ppaymentRunKey": this.arrayUnique(this.payableSumKeyArray) });
      }
      this.hmsDataService.postApi(UftApi.printingELStatementUrl, reqParam).subscribe(data => {
        let filePath = ""
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 2;
          if (data.result.filePath != undefined) {
            if (data.result.filePath != 'FILE_NOT_GENERATED') {
              filePath = '<a href="' + data.result.filePath + '">' + data.result.filePath + '</a>'
            }
          } else if (data.result.printChequeFilePath != undefined) {
            if (data.result.printChequeFilePath != "FILE_NOT_GENERATED") {
              filePath = '<a href="' + data.result.printChequeFilePath + '">' + data.result.printChequeFilePath + '</a>'
            }
          }
          if (filePath != "") {
            this.printingELStatementMsg = '<p>' + filePath + '</p>' + '<p>' + 'EOB statements are generated.'
          } else {
            this.printingELStatementMsg = "EOB statements are not generated."
          }
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 2;
          this.printingELStatementMsg = "EOB statements are not generated."
          resolve();
        } else {
          this.apiResponse = 2;
          this.printingELStatementMsg = "EOB statements are not generated."
          resolve()
        }
      }, (error) => {
        this.apiResponse = 2;
        this.printingELStatementMsg = "EOB statements are not generated."
        resolve()
      })
    })
    return promise
  }

  getThirdStepAPICallingGeneratingReports(formData) {
    // 3rd API calling
    let promise = new Promise((resolve, reject) => {
      let newReqParam = {
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "planType": formData.planType,
        "payeeCds": ['D', 'C', 'O'],
        "disciplines": this.diciplinePopupArr,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "transTypeCd": 'A',
        "tranStatusCds": ['A','D'],
        "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
        "ppayReference": this.arrayUnique(this.refernceCd)
      }
      if (formData.planType == "Q") {
        Object.assign(newReqParam, { "ppaymentRunKey": this.arrayUnique(this.payableSumKeyArray) });
      }
      this.hmsDataService.postApi(UftApi.printingChqPaymentStatementUrl, newReqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 3;
          let filePath = ""
          if (data.result.filePath != undefined) {
            if (data.result.filePath != 'FILE_NOT_GENERATED') {
              filePath = '<a href="' + data.result.filePath + '">' + data.result.filePath + '</a>'
            }
          } else if (data.result.printChequeFilePath != undefined) {
            if (data.result.printChequeFilePath != "FILE_NOT_GENERATED") {
              filePath = '<a href="' + data.result.printChequeFilePath + '">' + data.result.printChequeFilePath + '</a>'
            }
          }
          if (filePath != "") {
            this.provCardPrintingELStatementMsg = '<p>' + filePath + '</p>' + '<p>' + 'EOB statements are generated.'
          } else {
            this.provCardPrintingELStatementMsg = "File Not Generated"
          }
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 3;
          this.provCardPrintingELStatementMsg = "File Not Generated"
          resolve();
        } else {
          this.apiResponse = 3;
          this.provCardPrintingELStatementMsg = "File Not Generated"
          resolve()
        }
      }, (error) => {
        this.apiResponse = 3;
        this.provCardPrintingELStatementMsg = "File Not Generated"
        resolve()
      })
      })
    return promise
  }

  getCompanyPrintingELStatement() {
    // 2nd API call to generate file and need to change API name when ready from backend
    let promise = new Promise((resolve, reject) => {
      let newReqParam = {
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "payeeCds": ['D', 'C', 'O'],
        "disciplines": this.diciplinePopupArr,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "transTypeCd": 'A',
        "tranStatusCds": ['A','D'],
        "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
        "ppayReference": this.arrayUnique(this.refernceCd)
      }
      this.hmsDataService.postApi(UftApi.printingELStatementUrl, newReqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 1;
          let filePath = "";
          if (data.result.filePath != undefined) {
            if (data.result.filePath != 'FILE_NOT_GENERATED') {
              filePath = '<a href="' + data.result.filePath + '">' + data.result.filePath + '</a>'
            }
          }
          if (filePath != "") {
            this.companyPrintingELStatementMsg = '<p>' + filePath + '</p>' + '<p>' + 'EOB statements are generated.'
          } else {
            this.companyPrintingELStatementMsg = '<p>' + 'File Not Generated' + '</p>';
          }
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 1;
          this.companyPrintingELStatementMsg = '<p>' + 'File Not Generated' + '</p>';
          resolve();
        } else {
          this.apiResponse = 1;
          this.companyPrintingELStatementMsg = '<p>' + 'File Not Generated' + '</p>';
          resolve()
        }
      }, (error) => {
        this.apiResponse = 1;
        this.companyPrintingELStatementMsg = '<p>' + 'File Not Generated' + '</p>';
        resolve()
      })
    })
    return promise
  }

  getBrokerPrintingElStatement() {
    // 2nd API call in case of broker to generate file and API need to update here when provided by backend
    let promise = new Promise((resolve, reject) => {
      let unique = Array.from(new Set(this.ppayableSumKeyArray));
      let newReqParam = {
        "ppayableSumKey": unique,
        "payableSumKey": this.payableSumKey,
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "eftSumDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "disciplines": this.diciplinePopupArr,
        "eftFileNo": this.eftFileNo,
        "poriginatorName": this.orgName,
        "poriginatorNo": this.orgNo,
        "poriginatorDesc": this.orgDesc,
        "preceiverCenter": this.orgRecCenter,
        "pbankNo": this.bankNo,
        "pbranchNo": this.branchNo,
        "paccountNo": this.accNo,
        "pdefaultDir": this.defalutDir,
        "planType": this.planType || this.paymentGenerateForm.value.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "spaymentRunKey": this.arrayString(this.brokerSumKeyArray)
      }
      this.hmsDataService.postApi(UftApi.generatingBkReportsUrl, newReqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 1;
          let filePath = ""
          if (data.result.transactionListFilePath != undefined) {
            if (data.result.transactionListFilePath != 'FILE_NOT_GENERATED') {
              filePath = '<a href="' + data.result.transactionListFilePath + '">' + data.result.transactionListFilePath + '</a>'
            }
          }
          if (filePath != "") {
            this.brokerPrintingELStatementMsg = '<p>' + filePath + '</p>' + '<p>' + 'Payment statements are generated.'
          } else {
            this.brokerPrintingELStatementMsg = "File Not Generated"
          }
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 1;
          this.brokerPrintingELStatementMsg = 'File Not Generated';
          resolve();
        } else {
          this.apiResponse = 1;
          this.brokerPrintingELStatementMsg = 'File Not Generated';
          resolve()
        }
      }, (error) => {
        this.apiResponse = 1;
        this.brokerPrintingELStatementMsg = 'File Not Generated';
        resolve()
      })
    })
    return promise
  }

  /* Get printingElPaymentStatement API*/ 
  printingElPaymentStatementReport() {
    let promise = new Promise((resolve, reject) => {
      let unique = Array.from(new Set(this.ppayableSumKeyArray));
      let reqParam = {
        "ppayableSumKey": unique,
        "payableSumKey": this.payableSumKey,
        "paymentSumKey": +this.paymentSumKey || this.lastSelectedPaymentSumKey,
        "eftSumDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "disciplines": this.diciplinePopupArr,
        "eftFileNo": this.eftFileNo,
        "poriginatorName": this.orgName,
        "poriginatorNo": this.orgNo,
        "poriginatorDesc": this.orgDesc,
        "preceiverCenter": this.orgRecCenter,
        "pbankNo": this.bankNo,
        "pbranchNo": this.branchNo,
        "paccountNo": this.accNo,
        "pdefaultDir": this.defalutDir,
        "planType": this.planType || this.paymentGenerateForm.value.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
        "payeeCds": ['D', 'C', 'O'],
        "transTypeCd": 'A',
        "tranStatusCds": ['A','D'],
        "spaymentRunKey": this.arrayString(this.payableSumKeyArray),
        "ppayReference": this.arrayUnique(this.refernceCd)
      }
      this.hmsDataService.postApi(UftApi.printingELPaymentStatementUrl, reqParam).subscribe(data => {
        this.resetForms(); // ok
        if (data.code == 200 && data.status == "OK") {
          if (data.hmsMessage.messageShort == 'FILE_NOT_GENERATED') {
            this.printingElPaymentStatementResponse = 'File Not Generated'
          } else {
            let eftFile = data.result.eftFile || "";
            let eftSummaryFilePath = data.result.eftSummaryFilePath || ""
            let eftStatementFilePath = data.result.eftStatementFilePath || ""
            let printChequeFilePath = data.result.printChequeFilePath || ""
            if (eftFile != 'FILE_NOT_GENERATED') {
              eftFile = '<a href="' + eftFile + '">' + eftFile + '</a>'
            }
            if (eftSummaryFilePath != 'FILE_NOT_GENERATED') {
              eftSummaryFilePath = '<a href="' + eftSummaryFilePath + '">' + eftSummaryFilePath + '</a>'
            }
            if (eftStatementFilePath != 'FILE_NOT_GENERATED') {
              eftStatementFilePath = '<a href="' + eftStatementFilePath + '">' + eftStatementFilePath + '</a>'
            }
            if (printChequeFilePath != 'FILE_NOT_GENERATED') {
              printChequeFilePath = '<a href="' + printChequeFilePath + '">' + printChequeFilePath + '</a>'
            }
            this.printingElPaymentStatementResponse = '<p>' + eftFile + '</p><p>' + eftSummaryFilePath + '</p><p>' + eftStatementFilePath + '</p><p>' + printChequeFilePath + '</p>'
          }
          this.apiResponse = 5;
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.printingElPaymentStatementResponse = data.hmsMessage.messageShort
          this.apiResponse = 5;
          resolve();
        } else {
          this.printingElPaymentStatementResponse = data.hmsMessage.messageShort
          this.apiResponse = 5;
          resolve();
        }
      }, (error) => {
        this.printingElPaymentStatementResponse = 'File Not Generated'
        this.apiResponse = 5;
        resolve()
      })
    })
    return promise;
  }

  resetList() {
    this.cardholderSelected = [];
    this.payeeTansectionArray = [];
    this.payableSumKeyArray = [];
    this.companyTansectionArray = [];
    this.companySumKeyArray = [];
    this.brokerTansectionArray = [];
    this.brokerSumKeyArray = [];
    this.providerSelected = [];
    this.lastSelectedPaymentSumKey = [];
    this.ppayableSumKeyArray = [];
    this.refernceCd=[];
  }

  /* To call common steps in both Payment Type(electronic and cheque) */ 
  getPrintingELPaymentCommonSteps() {
    this.getSecondStepAPICallingForGeneratingReports(this.paymentGenerateForm.value).then(res => {
      // if (this.apiResponse == 2) {
        // this.getThirdStepAPICallingGeneratingReports(this.paymentGenerateForm.value).then(res => {
          this.update = {
            "id": 10,
            "done": "1",
            "step": "10",
            "processing": "Generating Reports (Claim Payments)",
            "result": this.generatingReportsMsg +' '+this.printingELStatementMsg
          }
        this.showUpdatedItemSecond(this.update);
        if (this.fieldArray.length == 0) {
          this.showFirst = false
        }
        if (this.transactionSearch.value.paymentType == 'E') {
          if (this.planType == 'S') {
            this.updateExportingPaymentFiles = {
              "id": 11,
              "done": "1",
              "step": "11",
              "processing": "Exporting Payment Files (Claim Payments)",
              "result": this.exportEftResponse
            }
            this.showUpdatedItemSecond(this.updateExportingPaymentFiles);
          } else {
            this.updateExportingPaymentFiles = {
              "id": 11,
              "done": "1",
              "step": "11",
              "processing": "Exporting Payment Files (Claim Payments)",
              "result": this.exportEftResponse || ''
            }
            this.showUpdatedItemSecond(this.updateExportingPaymentFiles);
          }
        }
        if (this.companySumKeyArray.length > 0) {
          this.comapanySecondHalf(false);
          return;
        } else if (this.brokerSumKeyArray.length > 0) {
          this.brokerSecondHalf(false);
          return;
        } else {
          if (this.transactionSearch.value.paymentType != 'E') {
            this.resetForms();
            this.resetArray();
            this.selectedItems = [];
            this.payeeTypeArray = [];
            this.selectedItem = [];
            this.payeeMethodArray =[];
            return false
          } else {
            this.FinalReportExporting().then(res => {
              if (this.payableSumKeyArray.length > 0) {
                if (this.apiResponse == 1) {
                  this.printingElPaymentStatementReport().then(dat => {
                    let updateExportingPaymentFiles = {
                      "id": 15,
                      "done": "1",
                      "step": "15",
                      "processing": "Exporting Final Payment Report Files",
                      "result": this.finalEexportEftResponse+' '+this.printingElPaymentStatementResponse
                    }
                    this.ToastrService.success(this.translate.instant('uft.toaster.paymentGenerateSuccess'))
                    this.showUpdatedItemSecond(updateExportingPaymentFiles);
                    this.resetArray();
                    this.selectedItems = [];
                    this.payeeTypeArray = [];
                    this.selectedItem = [];
                    this.payeeMethodArray =[];
                  })
                }
              } else {
                let updateExportingPaymentFiles = {
                  "id": 15,
                  "done": "1",
                  "step": "15",
                  "processing": "Exporting Final Payment Report Files",
                  "result": this.finalEexportEftResponse
                }
                this.ToastrService.success(this.translate.instant('uft.toaster.paymentGenerateSuccess'))
                this.showUpdatedItemSecond(updateExportingPaymentFiles);
                this.resetArray();
                this.selectedItems = [];
                this.payeeTypeArray = [];
                this.selectedItem = [];
                this.payeeMethodArray =[];
              }
            });
          }
        }
        if (this.paymentGenerateForm.value.planType == 'Q') {
          this.qb = true;
        }
        this.generatePaymentButton = true;
        // })
      // }
    })
  }

  getPrintingChqPaymentCommonSteps(){
    // this.getSecondStepAPICallingForGeneratingReports(this.paymentGenerateForm.value).then(res => {
      // if (this.apiResponse == 2) {
        this.getThirdStepAPICallingGeneratingReports(this.paymentGenerateForm.value).then(res => {
          this.update = {
            "id": 10,
            "done": "1",
            "step": "10",
            "processing": "Generating Reports (Claim Payments)",
            "result": this.generatingReportsMsg +' '+this.provCardPrintingELStatementMsg
          }
        this.showUpdatedItemSecond(this.update);
        if (this.fieldArray.length == 0) {
          this.showFirst = false
        }
        if (this.transactionSearch.value.paymentType == 'E') {
          if (this.planType == 'S') {
            this.updateExportingPaymentFiles = {
              "id": 11,
              "done": "1",
              "step": "11",
              "processing": "Exporting Payment Files (Claim Payments)",
              "result": this.exportEftResponse
            }
            this.showUpdatedItemSecond(this.updateExportingPaymentFiles);
          } else {
            this.updateExportingPaymentFiles = {
              "id": 11,
              "done": "1",
              "step": "11",
              "processing": "Exporting Payment Files (Claim Payments)",
              "result": this.exportEftResponse || ''
            }
            this.showUpdatedItemSecond(this.updateExportingPaymentFiles);
          }
        }
        if (this.companySumKeyArray.length > 0) {
          this.comapanySecondHalf(false);
          return;
        } else if (this.brokerSumKeyArray.length > 0) {
          this.brokerSecondHalf(false);
          return;
        } else {
          if (this.transactionSearch.value.paymentType != 'E') {
            this.resetForms();
            this.resetArray();
            this.selectedItems = [];
            this.payeeTypeArray = [];
            this.selectedItem = [];
            this.payeeMethodArray =[];
            return false
          } else {
            this.FinalReportExporting().then(res => {
              if (this.payableSumKeyArray.length > 0) {
                if (this.apiResponse == 1) {
                  this.printingElPaymentStatementReport().then(dat => {
                    let updateExportingPaymentFiles = {
                      "id": 15,
                      "done": "1",
                      "step": "15",
                      "processing": "Exporting Final Payment Report Files",
                      "result": this.finalEexportEftResponse+' '+this.printingElPaymentStatementResponse
                    }
                    this.ToastrService.success(this.translate.instant('uft.toaster.paymentGenerateSuccess'))
                    this.showUpdatedItemSecond(updateExportingPaymentFiles);
                    this.resetArray();
                    this.selectedItems = [];
                    this.payeeTypeArray = [];
                    this.selectedItem = [];
                    this.payeeMethodArray =[];
                  })
                }
              } else {
                let updateExportingPaymentFiles = {
                  "id": 15,
                  "done": "1",
                  "step": "15",
                  "processing": "Exporting Final Payment Report Files",
                  "result": this.finalEexportEftResponse
                }
                this.ToastrService.success(this.translate.instant('uft.toaster.paymentGenerateSuccess'))
                this.showUpdatedItemSecond(updateExportingPaymentFiles);
                this.resetArray();
                this.selectedItems = [];
                this.payeeTypeArray = [];
                this.selectedItem = [];
                this.payeeMethodArray =[];
              }
            });
          }
        }
        if (this.paymentGenerateForm.value.planType == 'Q') {
          this.qb = true;
        }
        this.generatePaymentButton = true;
        })
      // }
    // })
  }

}