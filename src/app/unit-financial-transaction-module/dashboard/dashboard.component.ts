import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { UftApi } from '../uft-api';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData of loggedIn User
import { UftContinutyComponent } from "./uft-continuty/uft-continuty.component";
import { UftContinutyComponentCallin } from "./uft-continuty-call-in/uft-continuty-call-in.component";
import { BankReconcilationComponent } from "./bank-reconcilation/bank-reconcilation.component";
import { CompCardHolderContinutyComponent } from "./comp-card-holder-continuty/comp-card-holder-continuty.component";
import { CompBalanceComponent } from "./comp-balance/comp-balance.component";
import { PendingFundsComponent } from "./pending-funds/pending-funds.component";
import { BrokerPaymentsComponent } from "./broker-payments/broker-payments.component";
import { FinanceReportsComponent } from './finance-reports/finance-reports.component';
import { Observable } from 'rxjs/Observable';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { FinanceService } from '../../finance-module/finance.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [ChangeDateFormatService]
})
export class DashboardComponent implements OnInit {
  opUncChqAmt: any = 0;
  clUncChqAmt: any = 0;
  dataSet: any;
  showSpanLoaderBank: boolean;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  showHideUftsComp: boolean = true;
  showHideCccComp: boolean = false;
  showHideCBalancesComp: boolean = false;
  showHidePendingFundsComp: boolean = false;
  showHideBrokerPaymentComp: boolean = false;
  @ViewChild(UftContinutyComponent) uftContinutyComponentObject;
  @ViewChild(UftContinutyComponentCallin) uftContinutyCalliinComponentObject;
  @ViewChild(BankReconcilationComponent) bankReconcilationComponentObject;
  @ViewChild(CompCardHolderContinutyComponent) compCardHolderContinutyComponentObject;
  @ViewChild(CompBalanceComponent) compBalanceComponentObject;
  @ViewChild(PendingFundsComponent) pendingFundsComponentObject;
  @ViewChild(BrokerPaymentsComponent) brokerPaymentsComponentObject;
  @ViewChild(FinanceReportsComponent) financeReportObject;
  showHideReportComp: boolean = false;
  showHideTerminationComp: boolean = false; 
  showHidePendingAdjComp: boolean = false; 
  currentUser: any;
  claimBalance: any;
  brokerBalance: any;
  refundBalance: any;
  currentMonth: string;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  pendingFundTab: boolean = false;
  brokerTab: boolean = false;
  compCardTab: boolean = false;
  compBalanceTab: boolean = false;
  financeReportsTab: boolean = false;
  ufTab: boolean = true;
  openingBalance = 0.0
  closingBalance = 0.0
  totalCardHolders = 0
  countOfCompanies = 0
  totalCompanies = 0
  activeCompanies = 0
  inActiveCompanies = 0
  gracePeriod = 0
  pendingClaimsEB = 0
  pendingClaimsOCL = 0
  toBePaid = 0.0
  firstDay: Date;
  lastDay: Date;
  startDate: string;
  endDate: string;
  showSpanLoader: boolean = false;
  showSpanLoader1: boolean = false;
  showSpanLoader2: boolean = false;
  showSpanLoader3: boolean = false;
  showSpanLoader4: boolean = false;
  isAdmin: string;
  showPageLoader: boolean = false;
  uftTabTimeStamp: any;
  companyAndCardHolderTime: any;
  companyBalanceTimestamp: any;
  pendingClaimTimestamp: any;
  payableTimestamp: any;
  uftDashboardArray = [{
    "uftContinuity": 'F',
    "compAndCardholderContinuity": 'F',
    "companyBalances": 'F',
    "pendingClaims": 'F',
    "payables": 'F',
    "reports": 'F'
  }]
  uftContinuityActiveClass: boolean = false
  bankReconcilationActiveClass: boolean = false
  compAndCardholderContinuityActiveClass: boolean = false
  companyBalancesActiveClass: boolean = false
  pendingClaimsActiveClass: boolean = false
  payablesActiveClass: boolean = false
  reportsActiveClass: boolean = false
  dashboardHeading: boolean = false
  financeCallActiveClass: boolean = false
  terminationRefundsActiveClass: boolean = false
  pendingElectronicPaymentAdjustmentActiveClass: boolean = false

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    public dataTableService: DatatableService,
    private financeService: FinanceService
  ) {
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['UFD']
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['UFD']
        this.getAuthCheck(checkArray)
      })
    }
    var date = new Date();
    this.isAdmin = this.currentUserService.isSuperAdmin;
    this.showPageLoader = true
    var monthLabels = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    var monthIndex = date.getMonth()
    this.currentMonth = monthLabels[monthIndex];
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
    this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
    /**
     * Changed F to T for Log #859
     */
    this.getBankTotals("T")
    this.getUftConectivityCount('T')
    this.getCompanyAndCardHolderCount('T')
    this.getCompanyBalanceCounts('T')  /*commenting comp bal tab*/
    this.getPendingClaimCount('T')
    this.allPayableCounts('T');
    /**
     * Auto refresh the grids after 15 mins
     */
  }

  ngAfterViewInit(): void {
    setTimeout(function () {
    }, 1000);
  }

  changeTab(value) {
    value == "uft" ? this.showHideUftsComp = true : this.showHideUftsComp = false
    value == "cb" ? this.showHideCBalancesComp = true : this.showHideCBalancesComp = false
    value == "ccc" ? this.showHideCccComp = true : this.showHideCccComp = false
    value == "bp" ? this.showHideBrokerPaymentComp = true : this.showHideBrokerPaymentComp = false
    value == "pf" ? this.showHidePendingFundsComp = true : this.showHidePendingFundsComp = false
    value == "fR" ? this.showHideReportComp = true : this.showHideReportComp = false
    value == "TR" ? this.showHideTerminationComp = true : this.showHideTerminationComp = false
    value == "PEA" ? this.showHidePendingAdjComp = true : this.showHidePendingAdjComp = false

    // if(value == "call"){
    //   this.dataTableService.showReortsEmitter.emit(false)
    // }

    if(value == "uft" || value == "bankReconcilation"){       
      this.dataTableService.showReortsEmitter.emit(true)
    }
    if(value == "call"){
      this.dataTableService.companyContactEmitter.emit(false)    // freeze screen(uft and bank reconciliation tile) issues are resolved
    }
    // emit the value
    if (value == "TR") {
      this.financeService.showTerminationEmitter.emit(this.showHideTerminationComp)
    }
    if (value == "PEA") {
      this.dataTableService.showPendingAdEmitter.emit(this.showHidePendingAdjComp)
    }
    if (value == "fR") {
      this.financeService.showReportsEmitter.emit(this.showHideReportComp)
    }
//end
    //This check is used to set "Select" as a placeholder for EFT Available dropdown under Broker tab
    if (this.showHideBrokerPaymentComp) {
      this.brokerPaymentsComponentObject.brokerScreen();
    }
    if (this.showHideCccComp) {
      setTimeout(() => {
        var txtPro = <HTMLInputElement>document.getElementById('uft_dashboardEffDate');
        txtPro.focus();
      }, 300);
    }
    if (this.showHideCBalancesComp) {
      this.compBalanceComponentObject.compBalanceGraph(this.dataTableService.graphData)
    }
  }

  getCompanyBalanceCounts(type) {
    this.showSpanLoader2 = true
    let submitData = {
      "companyBalanceTab": type,
      "startDate": this.startDate,
      "endDate": this.endDate
    }
    this.hmsDataService.postApi(UftApi.getCompanyCountNew, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showSpanLoader2 = false
        this.totalCompanies = data.result.totalCompaniesCount
        this.activeCompanies = data.result.activeCompaniesCount
        this.inActiveCompanies = data.result.inActiveCompaniesCount
        this.gracePeriod = data.result.gracePeriodCompaniesCount
        this.companyBalanceTimestamp = "Last Updated:" + this.changeDateFormatService.getCurrentTimestamp(new Date(data.result.updatedOnTime))
      } else {
        this.showSpanLoader2 = false
        this.totalCompanies = 0
        this.activeCompanies = 0
        this.inActiveCompanies = 0
        this.gracePeriod = 0
        this.companyBalanceTimestamp = ''
      }
    })
  }

  getPendingClaimCount(type) {
    this.showSpanLoader3 = true
    let submitData = {
      "pendingClaimTab": type
    }
    this.hmsDataService.postApi(UftApi.getPendingClaimCount, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showSpanLoader3 = false
        this.pendingClaimsEB = data.result.pfPendingClaimExtraBenefitCount
        this.pendingClaimsOCL = data.result.pfPendingClaimOverCreditLimitCount
        this.pendingClaimTimestamp = "Last Updated:" + this.changeDateFormatService.getCurrentTimestamp(new Date(data.result.updatedOnTime))
      } else {
        this.showSpanLoader3 = false
        this.pendingClaimsEB = 0
        this.pendingClaimsOCL = 0
        this.pendingClaimTimestamp = ''
      }
    })
  }

  getCompanyAndCardHolderCount(type) {
    this.showSpanLoader1 = true
    let submitData = {
      'compAndCardTab': type,
      'rangeBetween': "ED",
      "startDate": this.startDate,
      "endDate": this.endDate,
      "businessType": "Q"
    }
    this.hmsDataService.postApi(UftApi.getCompanyAndCardHolderCount, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showSpanLoader1 = false
        this.currentUser = this.currentUserService.currentUser
        if (this.currentUser.businessType.bothAccess) {
          this.isAdmin = 'T'
        }
        this.companyAndCardHolderTime = "Last Updated:" + this.changeDateFormatService.getCurrentTimestamp(new Date(data.result.updatedOnTime))
        this.totalCardHolders = data.result.cardHolderCountForDependent
        this.countOfCompanies = data.result.companyCount
      } else {
        this.showSpanLoader1 = false
        this.currentUser = this.currentUserService.currentUser
        if (this.currentUser.businessType.bothAccess) {
          this.isAdmin = 'T'
        }
        this.companyAndCardHolderTime = ''
        this.totalCardHolders = 0
        this.countOfCompanies = 0
      }
    })
  }
  getCompCardDtaOnLoad() {
    this.compCardHolderContinutyComponentObject.getMainTableData('init', 'T')
  }

  getUftConectivityCount(type) {
    this.showSpanLoader = true
    let submitData = {
      "uftTab": type,
      "startDate": this.startDate,
      "endDate": this.endDate,
      "coId": ''
    }
    try {
      this.hmsDataService.postApi(UftApi.getOpeningClosingBalanceAmtUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.openingBalance = data.result.data[1].coOpeningBalance != 0 ? data.result.data[1].coOpeningBalance : 0
          this.closingBalance = data.result.data[0].coClosingBalance != 0 ? data.result.data[0].coClosingBalance : 0;
          if (type == 'F') {
            this.uftContinutyComponentObject.openingBalance = this.currentUserService.convertAmountToDecimalWithDoller(this.openingBalance);
            this.uftContinutyComponentObject.closingBalance = this.currentUserService.convertAmountToDecimalWithDoller(this.closingBalance);
          }
          this.showSpanLoader = false
          this.showPageLoader = false
          this.uftTabTimeStamp = "Last Updated:" + this.changeDateFormatService.getCurrentTimestamp(new Date(data.result.updatedOnTime))
        } else {
          this.openingBalance = 0
          this.closingBalance = 0
          this.showSpanLoader = false
          this.showPageLoader = false
          this.uftTabTimeStamp = ''
        }
      })
    } catch (error) {
      this.openingBalance = 0
      this.closingBalance = 0
      this.showSpanLoader = false
      this.showPageLoader = false
      this.uftTabTimeStamp = ''
    }
  }
  getBankTotals(type) {
    this.showSpanLoaderBank = true;
    let dayBefore = this.changeDateFormatService.getYesterday();
    let submitData = {
      "startDate": this.startDate,
      "endDate": this.endDate,
      "chqClrDate": this.changeDateFormatService.convertDateObjectToString(dayBefore.toDate),
    }
    try {
      this.hmsDataService.postApi(UftApi.getBankReconciliationUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.dataSet = data.result;
          this.opUncChqAmt = data.result.opUncChqAmt != 0 ? Math.abs(data.result.opUncChqAmt) : 0
          this.clUncChqAmt = data.result.clUncChqAmt != 0 ? Math.abs(data.result.clUncChqAmt) : 0;
          this.showSpanLoaderBank = false
          this.showPageLoader = false
        } else {
          this.opUncChqAmt = 0
          this.clUncChqAmt = 0
          this.showSpanLoaderBank = false
          this.showPageLoader = false
          this.uftTabTimeStamp = ''
        }
      })
    } catch (error) {
      this.opUncChqAmt = 0
      this.clUncChqAmt = 0
      this.showSpanLoaderBank = false
      this.showPageLoader = false
      this.uftTabTimeStamp = ''
    }
  }

  allPayableCounts(type) {
    this.showSpanLoader4 = true
    this.toBePaid = 0
    let submitData = {
      "payablesTab": type,
      "endDate": this.endDate,
      "startDate": this.startDate
    }
    this.hmsDataService.postApi(UftApi.getPayablesTabCountUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort === "RECORD_GET_SUCCESSFULLY") {
        this.brokerBalance = data.result.brokerTotal != 0 ? data.result.brokerTotal.toFixed(2) : 0
        this.claimBalance = data.result.claimTotal != 0 ? data.result.claimTotal.toFixed(2) : 0
        this.refundBalance = data.result.companyRefundTotal != 0 ? data.result.companyRefundTotal.toFixed(2) : 0
        this.showSpanLoader4 = false
        this.payableTimestamp = "Last Updated:" + this.changeDateFormatService.getCurrentTimestamp(new Date(data.result.updatedOnTime))
      } else {
        this.brokerBalance = 0;
        this.claimBalance = 0;
        this.refundBalance = 0
        this.showSpanLoader4 = false
        this.payableTimestamp = ''
      }
    })
  }

  getOpningBalanceVal() {
    let submitData = {
      "startDate": this.startDate,
      "endDate": this.endDate
    }
    this.hmsDataService.postApi(UftApi.getTotalOpeningBalanceAmountUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort === "RECORD_GET_SUCCESSFULLY") {
        this.openingBalance = data.result != 0 ? data.result.toFixed(2) : 0
      } else {
        this.openingBalance = 0.00;
        this.showPageLoader = false
      }
    })
  }

  hideLoader(event) {
  }

  /**
   * Call Funding,Payment Run, Refund, Adjustments, Reports from UFT Continuity tab
   * @param type 
   */
  uftContinuityReport(type) {
    if (this.uftContinutyComponentObject.compNameMain == false) {
      this.uftContinutyComponentObject.companyNameText = '';
    }
    this.uftContinutyComponentObject.disabledTransationType = false;
    var url = UftApi.getListOfTransactionsByCokeyUrl
    if (type == "FUNDING") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        'transCode': [
          { id: "90", itemName: 90 },
          { id: "91", itemName: 91 },
          { id: "92", itemName: 92 },
          { id: "93", itemName: 93 },
          { id: "94", itemName: 94 }
        ],
        'transAmtType': 'All'
      }
      this.financeReportObject.selectedTransactionType = [
        { id: "90", itemName: 90 },
        { id: "91", itemName: 91 },
        { id: "92", itemName: 92 },
        { id: "93", itemName: 93 },
        { id: "94", itemName: 94 }
      ];
      this.financeReportObject.reportID = -114;
      this.financeReportObject.openReportModal(uftReqData, -114, 'Funding Summary', this.uftContinutyComponentObject.disabledTransationType, true, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyComponentObject.uftContinuityType = type
    }
    if (type == "BANKFUNDING") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": "",
        "endDate": this.bankReconcilationComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.bankReconcilationComponentObject.uftContinuityData.value.toDate) : "",
        "chqNumber": '',
        "chqAmt": '',
        "clrDate": '',
        'businessTypeCd': this.bankReconcilationComponentObject.bTypeSelected || '',
        'issueDate': "",
        'chqPayee': '',
        'rptCategory': 'CC',
        'tranStatusList': ['H']
      }
      this.financeReportObject.reportID = -124;
      this.financeReportObject.openReportModal(uftReqData, -124, 'OLD CHEQUES CLEARED', this.bankReconcilationComponentObject.disabledTransationType, true, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -124)
      }, 500);
      this.bankReconcilationComponentObject.uftContinuityType = type
    }
    if (type == "NEWBANKFUNDING") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate":"",
        "endDate": this.bankReconcilationComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.bankReconcilationComponentObject.uftContinuityData.value.toDate) : "",
        "chqNumber": '',
        "chqAmt": '',
        "clrDate": '',
        'businessTypeCd': this.bankReconcilationComponentObject.bTypeSelected || '',
        'issueDate': "",
        'chqPayee': '',
        'rptCategory': 'CI',
        'tranStatusList': ['A'],
      }
      this.financeReportObject.reportID = -125;
      this.financeReportObject.openReportModal(uftReqData, -125, 'NEW CHEQUES ISSUED', this.bankReconcilationComponentObject.disabledTransationType, true, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -125)
      }, 500);
      this.bankReconcilationComponentObject.uftContinuityType = type
    }
    if (type == "ADJUSTBANKFUNDING") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": "",
        "endDate": this.bankReconcilationComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.bankReconcilationComponentObject.uftContinuityData.value.toDate) : "",
        "chqNumber": '',
        "chqAmt": '',
        "clrDate": '',
        'businessTypeCd': this.bankReconcilationComponentObject.bTypeSelected || '',
        'issueDate': "",
        'chqPayee': '',
        'rptCategory': 'CA',
        'tranStatusList': ["S", "C", "A"],
      }
      this.financeReportObject.reportID = -126;
      this.financeReportObject.openReportModal(uftReqData, -126, 'CHEQUES ADJUSTED', this.bankReconcilationComponentObject.disabledTransationType, true, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -126)
      }, 500);
      this.bankReconcilationComponentObject.uftContinuityType = type
    }
    if (type == "OPENINGCLOSING") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate":  "",
        "endDate": this.bankReconcilationComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.bankReconcilationComponentObject.uftContinuityData.value.toDate) : "",
        "chqNumber": '',
        "chqAmt": '',
        "clrDate": '',
        'businessTypeCd': this.bankReconcilationComponentObject.bTypeSelected || '',
        'issueDate': "",
        'chqPayee': '',
        'rptCategory': 'OP',
        'tranStatusList': ["A"]
      }
      this.financeReportObject.reportID = -127;
      this.financeReportObject.openReportModal(uftReqData, -127, 'Opening Uncleared Cheques Amount', this.bankReconcilationComponentObject.disabledTransationType, true, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -127)
      }, 500);
      this.bankReconcilationComponentObject.uftContinuityType = type
    }
    if (type == "UNCLEAREDCLOSING") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": "",
        "endDate": this.bankReconcilationComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.bankReconcilationComponentObject.uftContinuityData.value.toDate) : "",
        "chqNumber": '',
        "chqAmt": '',
        "clrDate": '',
        'businessTypeCd': this.bankReconcilationComponentObject.bTypeSelected || '',
        'issueDate': "",
        'chqPayee': '',
        'rptCategory': 'CL',
        'tranStatusList': ['A']
      }
      this.financeReportObject.reportID = -128;
      this.financeReportObject.openReportModal(uftReqData, -128, 'CLOSING UNCLEARED CHEQUES AMOUNT', this.bankReconcilationComponentObject.disabledTransationType, true, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -128)
      }, 500);
      this.uftContinutyComponentObject.uftContinuityType = type
    }
    if (type == "REFUND") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        'transCode': [
          { id: "80", itemName: 80 },
          { id: "81", itemName: 81 },
        ],
        'transAmtType': 'All'
      }
      this.financeReportObject.selectedTransactionType = [
        { id: "80", itemName: 80 },
        { id: "81", itemName: 81 },
      ];
      this.financeReportObject.reportID = -114;
      this.financeReportObject.openReportModal(uftReqData, -114, 'Refund Summary', this.uftContinutyComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyComponentObject.uftContinuityType = type
    }
    if (type == "ADJUSTMENT") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        'transCode': [
          { id: "70", itemName: 70 },
          { id: "71", itemName: 71 },
          { id: "72", itemName: 72 },
          { id: "73", itemName: 73 },
          { id: "99", itemName: 99 }
        ],
        'transAmtType': 'All'
      }
      this.financeReportObject.selectedTransactionType = [
        { id: "70", itemName: 70 },
        { id: "71", itemName: 71 },
        { id: "72", itemName: 72 },
        { id: "73", itemName: 73 },
        { id: "99", itemName: 99 }
      ];
      this.financeReportObject.reportID = -114;
      this.financeReportObject.openReportModal(uftReqData, -114, 'Adjustments Summary', this.uftContinutyComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyComponentObject.uftContinuityType = type
    }
    if (type == "CLAIMS_PAYMENT_RUN") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.toDate) : ""
      }
      this.financeReportObject.reportID = -104;
      this.financeReportObject.openReportModal(uftReqData, -104, 'Claims Payment Run Summary', this.uftContinutyComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -104)
      }, 500);
      this.uftContinutyComponentObject.uftContinuityType = type
    }
    if (type == "PAYMENT_RUN") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        'transCode': [
          { id: "10", itemName: 10 },
          { id: "20", itemName: 20 },
          { id: "21", itemName: 21 },
          { id: "30", itemName: 30 },
          { id: "31", itemName: 31 },
          { id: "45", itemName: 41 },
          { id: "42", itemName: 42 },
          { id: "43", itemName: 43 },
          { id: "48", itemName: 48 },
        ],
        'transAmtType': 'All'
      }
      this.financeReportObject.selectedTransactionType = [
        { id: "10", itemName: 10 },
        { id: "20", itemName: 20 },
        { id: "21", itemName: 21 },
        { id: "30", itemName: 30 },
        { id: "31", itemName: 31 },
        { id: "45", itemName: 41 },
        { id: "42", itemName: 42 },
        { id: "43", itemName: 43 },
        { id: "48", itemName: 48 },
      ];
      this.financeReportObject.reportID = -114;
      this.financeReportObject.openReportModal(uftReqData, -114, 'Payment Run Summary', this.uftContinutyComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyComponentObject.uftContinuityType = type
    } else if (type == 'AllUFTCODEDATA') {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        'transCode': [
          { id: '90', itemName: 90 },
          { id: '91', itemName: 91 },
          { id: '92', itemName: 92 },
          { id: '93', itemName: 93 },
          { id: '94', itemName: 94 },
          { id: '80', itemName: 80 },
          { id: '81', itemName: 81 },
          { id: '70', itemName: 70 },
          { id: '71', itemName: 71 },
          { id: '72', itemName: 72 },
          { id: '73', itemName: 73 },
          { id: '99', itemName: 99 },
          { id: '10', itemName: 10 },
          { id: '20', itemName: 20 },
          { id: '21', itemName: 21 },
          { id: '30', itemName: 30 },
          { id: '31', itemName: 31 },
          { id: '41', itemName: 41 },
          { id: '42', itemName: 42 },
          { id: '43', itemName: 43 },
          { id: '48', itemName: 48 },
        ],
        'transAmtType': 'All'
      }
      this.financeReportObject.selectedTransactionType = [
        { id: '90', itemName: 90 },
        { id: '91', itemName: 91 },
        { id: '92', itemName: 92 },
        { id: '93', itemName: 93 },
        { id: '94', itemName: 94 },
        { id: '80', itemName: 80 },
        { id: '81', itemName: 81 },
        { id: '70', itemName: 70 },
        { id: '71', itemName: 71 },
        { id: '72', itemName: 72 },
        { id: '73', itemName: 73 },
        { id: '99', itemName: 99 },
        { id: '10', itemName: 10 },
        { id: '20', itemName: 20 },
        { id: '21', itemName: 21 },
        { id: '30', itemName: 30 },
        { id: '31', itemName: 31 },
        { id: '41', itemName: 41 },
        { id: '42', itemName: 42 },
        { id: '43', itemName: 43 },
        { id: '48', itemName: 48 },
      ];
      this.financeReportObject.reportID = -114;
      this.financeReportObject.openReportModal(uftReqData, -114, 'UFT Report', this.uftContinutyComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyComponentObject.uftContinuityType = type
    }
  }

  /**
   * Call Funding,Payment Run, Refund, Adjustments, Sub Reports from UFT Continuity tab
   * @param transactionType 
   */
  uftContinuitySubTypeReport(transactionType) {
    if (this.uftContinutyComponentObject.compNameMain == false) {
      this.uftContinutyComponentObject.companyNameText = '';
    }
    this.uftContinutyComponentObject.showHideReportComp = true; let tranCode: any; let tableHeading;
    let isShowHideTransIsPositiveNegative = false;
    switch (parseInt(transactionType.transactionCode)) {
      case 90:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Monthly PAP Report';
        isShowHideTransIsPositiveNegative = true;
        break;
      case 93:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Daily PAP Report';
        isShowHideTransIsPositiveNegative = true;
        break;
      case 94:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Client EFT Report';
        isShowHideTransIsPositiveNegative = true;
        break;
      case 91:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Cheques Report';
        isShowHideTransIsPositiveNegative = true;
        break;
      case 92:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Reversals Report';
        isShowHideTransIsPositiveNegative = true;
        break;
      case 10:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Claims Report';
        break;
      case 20:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Admin Fees Report';
        break;
      case 21:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Broker Fees Report';
        break;
      case 30:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'GST Report';
        break;
      case 31:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Broker GST Report';
        break;
      case 41:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Ontario Tax Report';
        break;
      case 42:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Quebec Tax Report';
        break;
      case 43:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Newfoundland Tax Report';
        break;
      case 48:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Saskatchewan Tax Report';
        break;
      case 80:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Refund Cheques Report';
        break;
      case 81:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Refund PDS Report';
        break;
      case 70:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Miscellaneous Report';
        break;
      case 71:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Admin Fees Report';
        break;
      case 72:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Tax adjustments Report';
        break;
      case 73:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Intercompany Transfers Report';
        break;
      case 99:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = 'Write offs Report';
        break;
    }
    let uftReqData = {
      "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
      "endDate": this.uftContinutyComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.toDate) : "",
      "coKey": this.uftContinutyComponentObject.compKey,
      "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
      "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
      'transCode': tranCode,
      'transAmtType': 'All'
    }
    this.financeReportObject.reportID = -114;
    this.financeReportObject.selectedTransactionType = tranCode;
    this.uftContinutyComponentObject.disabledTransationType = true;
    this.financeReportObject.openReportModal(uftReqData, -114, tableHeading, this.uftContinutyComponentObject.disabledTransationType, isShowHideTransIsPositiveNegative);
    setTimeout(() => {
      this.financeReportObject.callReportGridApi(uftReqData, -114)
    }, 500);
  }
  /**
   * Call unpaid claim Reports from Company Balance tab
   * @param type 
   */
  unpaidClaimReport(type) {
    this.showHideReportComp = true;
    let uftCompReqData = {
      'startDate': "01/01/1990",
      'endDate': this.changeDateFormatService.convertDateObjectToString(type.companyBalanceData.value.date),
      'compNameAndNo': type.selectedRow.coId,
      'companyCoId': type.selectedRow.coId,
      'claimStatus': '',
      'status': '',
    }
    this.financeReportObject.reportID = -59;
    this.financeReportObject.openReportModal(uftCompReqData, -59, '', true, false);
  }

  /**
   * Call opening and closing balance Reports from UFT Continuity tab
   * @param type 
   */
  openingClosingBalance(type) {
    this.showHideReportComp = true;
    let tableHeading = 'Company Balance';
    let uftReqData = {};
    let reportId = -8;
    if (type.type == open) {
      uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "companyCoId": this.uftContinutyComponentObject.companyCoId != undefined ? this.uftContinutyComponentObject.companyCoId : '',
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        "isDashboard": 'T',
        'type': type.type,
        'companyStatus': '',
        'coFlag': ''
      }
    } else if (type.type == 'bank') {
      reportId = 18;
      uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "companyCoId": this.uftContinutyComponentObject.companyCoId != undefined ? this.uftContinutyComponentObject.companyCoId : '',
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        "isDashboard": 'T',
        'type': type.type,
        'companyStatus': '',
        'coFlag': ''
      }
    }
    else if (type.type == 'bankClose') {
      reportId = 18;
      uftReqData = {
        "startDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.fromDate) : "",
        "companyCoId": this.uftContinutyComponentObject.companyCoId != undefined ? this.uftContinutyComponentObject.companyCoId : '',
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        "isDashboard": 'T',
        'type': type.type,
        'companyStatus': '',
        'coFlag': ''
      }
    }
    else {
      uftReqData = {
        "startDate": "01/07/1890",
        "endDate": this.uftContinutyComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyComponentObject.uftContinuityData.value.toDate) : "",
        "companyCoId": this.uftContinutyComponentObject.companyCoId != undefined ? this.uftContinutyComponentObject.companyCoId : '',
        "companyNameAndNo": this.uftContinutyComponentObject.companyNameText != undefined ? this.uftContinutyComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyComponentObject.companyName != undefined ? this.uftContinutyComponentObject.companyName : '',
        "isDashboard": 'T',
        'type': type.type,
        'companyStatus': '',
        'coFlag': ''
      }
    }
    this.uftContinutyComponentObject.disabledTransationType = true;
    this.financeReportObject.uftOpeningBalance = type.openingBalance;
    this.financeReportObject.uftClosingBalance = type.closingBalance;
    this.financeReportObject.openReportModal(uftReqData, reportId, tableHeading, this.uftContinutyComponentObject.disabledTransationType, false);
  }

  callReportWithReportId(reportID) {
    this.financeReportObject.reportID = reportID;
    this.financeReportObject.openReportModal('', reportID, '', false, true);
  }

  getAuthCheck(uftDashboardChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.uftDashboardArray = [{
        "uftContinuity": 'T',
        "compAndCardholderContinuity": 'T',
        "companyBalances": 'T',
        "pendingClaims": 'T',
        "payables": 'T',
        "reports": 'T'
      }]
      this.uftContinuityActiveClass = true
    } else {
      for (var i = 0; i < uftDashboardChecks.length; i++) {
        authCheck[uftDashboardChecks[i].actionObjectDataTag] = uftDashboardChecks[i].actionAccess
      }
      this.uftDashboardArray = [{
        "uftContinuity": authCheck['UFD324'],
        "compAndCardholderContinuity": authCheck['UFD325'],
        "companyBalances": authCheck['UFD326'],
        "payables": authCheck['UFD327'],
        "pendingClaims": authCheck['UFD328'],
        "reports": authCheck['UFD329']
      }]
      if (authCheck['UFD324'] == 'T') {
        this.uftContinuityActiveClass = true
      } else if (authCheck['UFD325'] == 'T') {
        this.compAndCardholderContinuityActiveClass = true
      } else if (authCheck['UFD326'] == 'T') {
        this.companyBalancesActiveClass = true
      } else if (authCheck['UFD327'] == 'T') {
        this.pendingClaimsActiveClass = true
      } else if (authCheck['UFD328'] == 'T') {
        this.payablesActiveClass = true
      } else if (authCheck['UFD329'] == 'T') {
        this.reportsActiveClass = true
      }
    }
    this.dashboardHeading = true
    return this.uftDashboardArray
  }

  /**
   * Auto refresh the page after 15 mins to get the latest data
   */
  autoRefreshPage() {
    this.getBankTotals("T")
    this.getUftConectivityCount('T')
    this.getCompanyAndCardHolderCount('T')
    this.getPendingClaimCount('T')
    this.allPayableCounts('T');
    if (this.showHideUftsComp) {
      this.uftContinutyComponentObject.ngOnInit();
    } else if (this.showHideCccComp) {
      this.compCardHolderContinutyComponentObject.ngOnInit();
    } else if (this.showHideCBalancesComp) {
      this.compBalanceComponentObject.ngOnInit();
    } else if (this.showHidePendingFundsComp) {
      this.pendingFundsComponentObject.ngOnInit();
    }
  }

}
