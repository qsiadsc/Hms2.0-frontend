import { Component, EventEmitter, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UftApi } from '../../uft-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { AdminApi } from '../../../admin-rate-module/admin-api';
import { CompleterService, CompleterItem } from 'ng2-completer';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DashboardComponent } from '../dashboard.component';
import { CompanyApi } from '../../../company-module/company-api';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { UftContinutyComponentCallin } from "../uft-continuty-call-in/uft-continuty-call-in.component";
import { UftContinutyComponent } from "../uft-continuty/uft-continuty.component";
import { Subject } from 'rxjs';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { CommonApi } from '../../../common-module/common-api';
import { FinanceReportCallInComponent } from '../finance-report-call-in/finance-report-call-in.component';
import { CardServiceService } from '../../../card-module/card-service.service';
import { promise } from 'protractor';
import { BankReconcilationComponent } from "../bank-reconcilation/bank-reconcilation.component";

@Component({
  selector: 'app-finance-call',
  templateUrl: './finance-call.component.html',
  styleUrls: ['./finance-call.component.css'],
  providers: [HmsDataServiceService, DashboardComponent, ChangeDateFormatService]
})
export class FinanceCallComponent implements OnInit {
  @ViewChild(UftContinutyComponentCallin) uftContinutyCalliinComponentObject;
  @ViewChild(FinanceReportCallInComponent) financeReportObject;
  @ViewChild(UftContinutyComponent) uftContinutyComponentObject;
  @ViewChild(BankReconcilationComponent) bankReconcilationComponentObject;
  @Output() emitPendingClaimHit: EventEmitter<any> = new EventEmitter<any>();
  myDatePickerfilterOptions = CommonDatePickerOptions.myDatePickerFilterOptions;
  public financeCallForm: FormGroup;
  public adminCompanyFeeForm: FormGroup;
  showPrimaryContactList: boolean = true
  observablePrimaryContactObj;
  primaryContactColumns = []
  showUftDetails: boolean = true
  observableUftDetailsObj;
  uftDetailsColumns = []
  showAdministrationFees: boolean = true
  observableAdministrationFeesObj;
  administrationFeesColumns = []
  showBankingInformation: boolean = true
  observableBankingInformationObj;
  bankingInformationColumns = []
  showPendingClaims: boolean = true
  observablependingClaimsObj;
  pendingClaimsColumns = []
  companyListData;
  companyDataRemote;
  coId: any;
  compName: any
  mergedDesc: any
  bank_account_columns = [];
  companyId;
  showReport = false;
  showUft = false
  getForApi : boolean = false; // decrair for api
  getApiVal : boolean = false;
  mainCompanyArray = [{
    "searchCompany": 'F',
    "addCompany": 'F',
    "viewCompany": 'F',
    "editCompany": 'F',
    "creditLimit": 'F',
    "companyBankAccount": 'F',
    "terminateCompany": 'F',
    "reactivateCompany": 'F',
    "addPlan": 'F',
    "suspendPlan": 'F',
    "terminatePlan": 'F',
    "addDivision": 'F',
    "viewDivision": 'F',
    "deleteDivision": 'F',
    "terminateDivision": 'F',
    "companyComments": 'F',
    "addCompanyComments": 'F',
    "editCreditLimit": 'F',
    "saveUpdateCreditLimit": 'F',
    "saveCompanyBankAccount": 'F',
    "editCompanyBankAccount": 'F',
    "editSuspensPlan": 'F',
    "viewPlan": 'F',
    "addPlanComments": 'F',
    "addTerminateCoverage": 'F',
    "companyContact": 'F',
    "linkBroker": 'F',
    "deleteLinkedBroker": 'F',
    "addCompanyContact": 'F',
    "viewCompanyContact": 'F',
    "deleteCompanyContact": 'F',
    "addLinkedBroker": 'F',
    "viewLinkedBroker": 'F',
    "saveCompany": 'F',
    "suspendCompany": 'F',
    "editSuspendCompany": 'F',
    "saveSuspendCompany": 'F',
    "terminateCompPopupBtn": 'F'
  }]
  dateNameArray = {};
  expired = false
  cokey;
  primaryContactReqParam;
  phoneMask = CustomValidators.phoneMaskV1;
  showHideReportComp: boolean;
  checkPapComment = true
  papSuspendColumnsTable = []
  ObservablePAPAmountObj;
  buttonText;
  showPapComments: boolean = false
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  currentUser: any
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  planKey;
  planCommentsColumns = []
  observablePlanCommentsObj;
  checkPlanComments
  observableNotificationGeneratedClaimsObj
  notificationGeneratedClaimsColumns = []
  aboutToExpireColumns = []
  observableAboutToExpireClaimsObj
  observableAdjudicatedClaimsObj
  adjudicatedClaimsColumns = []
  observablePendingPaperworkClaimsObj
  pendingPaperworkColumns = []
  constructor(public dataTableService: DatatableService,
    public translate: TranslateService,
    private completerService: CompleterService,
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public currentUserService: CurrentUserService,
    private dashboardComponent: DashboardComponent,
    public cardService: CardServiceService, ) {
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
    let self = this
    this.dataTableService.showReortsEmitter.subscribe(function(val){
      if(val){
        self.showReport = false;
      }else{
        self.showReport = true;
      }
    })
  }

  ngOnInit() {
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
    this.financeCallForm = new FormGroup({
      groupNameNum: new FormControl('', Validators.required)
    })
    this.adminCompanyFeeForm = new FormGroup({
      'company': new FormControl('', []),
      'gracePeriod': new FormControl('60', []),
      'websiteAddress': new FormControl('', []),
      'companyName': new FormControl('', []),
      'effectiveOn': new FormControl('', []),
      'address1': new FormControl('', []),
      'address2': new FormControl('', []),
      'postalCode': new FormControl('', []),
      'phone': new FormControl('', []),
      'extension': new FormControl('', []),
      'city': new FormControl('', []),
      'province': new FormControl('', []),
      'country': new FormControl('', []),
      'fax': new FormControl(''),
      'businessTypeKey': new FormControl(null, []),
      'terminationDate': new FormControl('', []),
      'terminationCategory': new FormControl('', []),
      'check': new FormControl(''),
      'coBankInfoInd': new FormControl(''),
      'autoGeneratedNumber': new FormControl(''),
      'adminrate': new FormControl('', []),
      'standardpapamount': new FormControl('', []),
      'adjustedpapamount': new FormControl(null, []),
      'adjustedpapenddate': new FormControl(null, []),
      'papSuspended': new FormControl('', []),
      'exemptGst': new FormControl('', []),
    })
    this.getPredictiveCompanySearchData(this.completerService)
    // emit value for stop companyContactList api in finance dashboard
    // this.dataTableService.showReortsEmitter.subscribe(value =>{
      this.dataTableService.companyContactEmitter.subscribe(value =>{     // freeze screen(uft and bank reconciliation tile) issues are resolved
      this.getForApi = value;
      if(this.getForApi == false)
      {
        this.getApiVal = true;
        this.getForApi = true;
        this.dataTableInitializePrimaryContact();
      }
    })
    //end
    this.dataTableInitializeUftDetails();
    this.dataTableInitializeBankingInformationList();
    this.ObservablePAPAmountObj = Observable.interval(1000).subscribe(x => {
      if (this.checkPapComment = true) {
        if ('company.company-credit-limit.credit-limit-multiplier' == this.translate.instant('company.company-credit-limit.credit-limit-multiplier')) {
        }
        else {
          this.buttonText = this.translate.instant('common.save')
          this.papSuspendColumnsTable = [
            { title: this.translate.instant('common.date'), data: 'createdOn' },
            { title: this.translate.instant('common.userName'), data: 'username' },
            { title: this.translate.instant('common.department'), data: 'department' },
            { title: this.translate.instant('company.company-credit-limit.comments'), data: 'commentTxt' },
          ]
          this.checkPapComment = false;
          this.ObservablePAPAmountObj.unsubscribe();
        }
      }
    });

    this.observablePlanCommentsObj = Observable.interval(1000).subscribe(x => {
      if (this.checkPlanComments = true) {
        if ('company.company-credit-limit.credit-limit-multiplier' == this.translate.instant('company.company-credit-limit.credit-limit-multiplier')) {
        }
        else {
          this.planCommentsColumns = [
            { title: this.translate.instant('common.date'), data: 'createdOn' },
            { title: this.translate.instant('common.userName'), data: 'username' },
            { title: this.translate.instant('common.department'), data: 'department' },
            { title: this.translate.instant('common.comments'), data: 'commentTxt' },
            { title: this.translate.instant('common.expiryDate'), data: 'expiredOn' },
            { title: this.translate.instant('common.importance'), data: 'commentImportance' }, //Importance
          ]
          this.checkPlanComments = false;
          this.observablePlanCommentsObj.unsubscribe();
        }
      }
    });
    this.adminCompanyFeeForm.disable()
    this.dtOptions['PapComment'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
    this.dtTrigger['PapComment'] = new Subject();
    this.dtOptions['planComments'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
    this.dtTrigger['planComments'] = new Subject();
  }

  ngAfterViewInit(): void {
    this.getPAPComments()
    this.dataTableInitializePendingClaimsList()
    this.dataTableInitializeNotificationGeneratedClaimsList()
    this.dataTableInitializeAboutToExpireClaimsList()
    this.dataTableInitializeAdjudicatedClaimsList()
    this.dataTableInitializePendingPaperworkClaimsList()
  }

  getPredictiveCompanySearchData(completerService) {
    this.companyDataRemote = completerService.remote(
      null,
      "coName,coId",
      "mergedDescription"
    );
    this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.companyDataRemote.urlFormater((term: any) => {
      return UftApi.getPredictiveCompanyList + '/0' + `/${term}`;
    });
    this.companyDataRemote.dataField('result');
  }

  dataTableInitializePrimaryContact() {
    this.observablePrimaryContactObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.primaryContactColumns = [
          { title: this.translate.instant('common.first-name'), data: 'coContactFirstName' },
          { title: this.translate.instant('common.last-name'), data: 'coContactLastName' },
          { title: this.translate.instant('common.city'), data: 'cityName' },
          { title: this.translate.instant('common.province'), data: 'provinceName' },
          { title: this.translate.instant('common.country'), data: 'countryName' },
          { title: this.translate.instant('common.phone'), data: 'coContactPhoneNum' },
          { title: this.translate.instant('common.email'), data: 'coContactEmailAdd' },
          { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
          { title: this.translate.instant('common.expirydate'), data: 'expiredOn' },
          { title: this.translate.instant('common.webUserId'), data: 'webUserId' }]
        if(this.getForApi){
        this.getPrimaryContactList('')
        }
        this.observablePrimaryContactObj.unsubscribe();
      }
    });
  }

  dataTableInitializeUftDetails() {
    this.observableUftDetailsObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.uftDetailsColumns = [
          { title: this.translate.instant('admin.adminRate.planType'), data: 'businessTypeDesc' },
          { title: this.translate.instant('admin.adminRate.admRate'), data: 'serviceProvAdminFeeRate' },
          { title: this.translate.instant('admin.adminRate.chequeAccount'), data: 'chequeAcctPrefix' },
          { title: this.translate.instant('admin.adminRate.chequeNo'), data: 'chequeNum' }]
        this.getUftDetails()
        this.observableUftDetailsObj.unsubscribe();
      }
    });
  }

  dataTableInitializeBankingInformationList() {
    this.observableBankingInformationObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.bankingInformationColumns = [
          { title: this.translate.instant('admin.adminRate.planType'), data: 'businessTypeDesc' },
          { title: this.translate.instant('admin.adminRate.admRate'), data: 'serviceProvAdminFeeRate' },
          { title: this.translate.instant('admin.adminRate.chequeAccount'), data: 'chequeAcctPrefix' },
          { title: this.translate.instant('admin.adminRate.chequeNo'), data: 'chequeNum' }]
        this.getBankingInformationList()
        this.observableBankingInformationObj.unsubscribe();
      }
    });
  }

  dataTableInitializePendingClaimsList() {
    this.observablependingClaimsObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.pendingClaimsColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
        ]
        this.getPendingClaimsList('-1')
        this.observablependingClaimsObj.unsubscribe();
      }
    });
  }

  getPrimaryContactList(key) {
    var reqParam = [
      { 'key': 'coKey', 'value': key },
      { 'key': 'cardHolderRole', 'value': 'Primary' },
      { 'key': 'cardId', 'value': '' },
      { 'key': 'cardType', 'value': '' },
      { 'key': 'dob', 'value': '' },
      { 'key': 'terminateDate', 'value': '' },
      { 'key': 'email', 'value': '' },
      { 'key': 'firstName', 'value': '' },
      { 'key': 'gender', 'value': '' },
      { 'key': 'lastName', 'value': '' },
      { 'key': 'status', 'value': 'Active' }
    ]
    var url = CompanyApi.companyContactList
    var tableId = "primaryContactList"
      if (!$.fn.dataTable.isDataTable('#primaryContactList')) {
        this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.primaryContactColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', '', [7, 8], '', [1, 2, 3, 4, 5, 6, 9], [1, 2, 3, 4, 5, 6], '', '')
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
        this.getForApi = false;
      }
    return false;
  }

  getUftDetails() {
    var reqParam = []
    var url = AdminApi.adminInfoSearchUrl;
    var tableId = "uftDetails"
    if (!$.fn.dataTable.isDataTable('#uftDetails')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.uftDetailsColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', '', '', '', [1, 2, 3], '', '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  getBankingInformationList() {
    var reqParam = []
    var url = AdminApi.adminInfoSearchUrl;
    var tableId = "bankingInformationList"
    if (!$.fn.dataTable.isDataTable('#bankingInformationList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.bankingInformationColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', '', '', '', [1, 2, 3], '', '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  getPendingClaimsList(companyType) {
    let pendingClaimRequest = [
      { 'key': 'claimStatusCd', 'value': '' },
      { 'key': 'company', 'value': companyType }
    ]
    var url = UftApi.pendingClaimsListUrl
    var tableId = "pendingClaimsList"
    this.cardService.emitPendingClaimHit.emit("true")
    if (!$.fn.dataTable.isDataTable('#pendingClaimsList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.pendingClaimsColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', pendingClaimRequest, '', '', '', '', [1, 2, 3, 4, 5], '', '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, pendingClaimRequest)
    }
    return false;
  }

  onCompanyNameSelected(selected: CompleterItem) {
    if (selected) {
      this.showUft = true;
    }
    else{
      this.showUft = false;
    }
    setTimeout(() => {
    this._onCompanyNameSelected2(selected)
    }, 300);
  }
  _onCompanyNameSelected2(selected: CompleterItem) {
   try {
    if (selected) {
    this.uftContinutyCalliinComponentObject.onCompanyNameSelected(selected)
      this.cokey = parseInt(selected.originalObject.coKey)
      this.coId = selected.originalObject.coId
      this.compName = selected.originalObject.coName
      this.mergedDesc = selected.originalObject.mergedDescription
    } else {
      this.cokey = ''
      this.coId = ''
      this.compName = ''
      this.mergedDesc = ''
    }
    this.setCompanyBankAccountFocus()
   } catch (error) {
   }
  }

  OnBlurCompany() {
    if (this.financeCallForm.value.groupNameNum != '' && this.compName != '') {
    } else {
    }
  }

  callList(id) {
  }

  searchAdminInfo(id) {
  }

  resetAdminInfoSearch(id) {
  }

  getCallReports() {
    this.dashboardComponent.changeTab('fR')
    $('#call').removeClass("active");
    $('#reports').addClass("active")
  }

  setCompanyBankAccountFocus() {
    let tableActions = [
      { 'name': 'view', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'showAction': this.mainCompanyArray[0].editCompanyBankAccount },
    ];
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
      },
      {
        title: this.translate.instant('company.company-bank-account.action'),
        data: 'coBankAccountKey'
      }
    ]
    var company_bank_account_history_url = CompanyApi.getCompanyBankAccountHistoryUrl;
    var companyBankAccountTableId = "company-bank-account-his"
    var reqParam = [{ 'key': 'coKey', 'value': this.cokey }];
    if (!$.fn.dataTable.isDataTable('#company-bank-account-his')) {
      this.dataTableService.jqueryDataTable(companyBankAccountTableId, company_bank_account_history_url, 'full_numbers', this.bank_account_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 6, [4, 5],'',[1, 2, 3, 6])
    } else {
      this.dataTableService.jqueryDataTableReload(companyBankAccountTableId, company_bank_account_history_url, reqParam);
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
        this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      }
    }
    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }


  /* Primary Contact List Search functionality by */
  primaryContactListSearch(tableId = null) {
    var getCompanyConatctListUrl = CompanyApi.companyContactList;
    var dateParams = [7, 8];
    var params = this.dataTableService.getFooterParams("primaryContactList")
    var compkey = { "key": "coKey", "value": this.cokey }
    var cardHolderRole = { 'key': 'cardHolderRole', 'value': 'Primary' }
    params.push(compkey)
    params.push(cardHolderRole)
    this.dataTableService.jqueryDataTableReload("primaryContactList", getCompanyConatctListUrl, params, dateParams)
  }

  /* Primary Contact List Reset functionality by */
  resetPrimaryContactList(tableId) {
    this.dataTableService.resetTableSearch();
    this.primaryContactListSearch();
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
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "companyCoId": this.uftContinutyCalliinComponentObject.companyCoId != undefined ? this.uftContinutyCalliinComponentObject.companyCoId : '',
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
        "isDashboard": 'T',
        'type': type.type,
        'companyStatus': '',
        'coFlag': ''
      }
    } else if (type.type == 'bank') {
      reportId = 18;
      uftReqData = {
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "companyCoId": this.uftContinutyCalliinComponentObject.companyCoId != undefined ? this.uftContinutyCalliinComponentObject.companyCoId : '',
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
        "isDashboard": 'T',
        'type': type.type,
        'companyStatus': '',
        'coFlag': ''
      }
    }
    else if (type.type == 'bankClose') {
      reportId = 18;
      uftReqData = {
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "companyCoId": this.uftContinutyCalliinComponentObject.companyCoId != undefined ? this.uftContinutyCalliinComponentObject.companyCoId : '',
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
        "isDashboard": 'T',
        'type': type.type,
        'companyStatus': '',
        'coFlag': ''
      }
    }
    else {
      uftReqData = {
        "startDate": "01/07/1890",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate) : "",
        "companyCoId": this.uftContinutyCalliinComponentObject.companyCoId != undefined ? this.uftContinutyCalliinComponentObject.companyCoId : '',
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
        "isDashboard": 'T',
        'type': type.type,
        'companyStatus': '',
        'coFlag': ''
      }
    }
    this.uftContinutyCalliinComponentObject.disabledTransationType = true;
    this.financeReportObject.uftOpeningBalance = type.openingBalance;
    this.financeReportObject.uftClosingBalance = type.closingBalance;
    this.financeReportObject.openReportModal(uftReqData, reportId, tableHeading, this.uftContinutyCalliinComponentObject.disabledTransationType, false);
  }
  changeDateFormat(event, frmControlName, formName, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
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
    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
    }
    if (event.reason == 2) {
      if (formName == 'companySetupForm') {
        this.adminCompanyFeeForm.patchValue(datePickerValue);
      }
    }
  }

  getPAPComments() {
    let papComment = {
      "coKey": this.cokey,
    }
    let promise = new Promise((resolve, reject) => {
      var url = CompanyApi.getcompanyPapCommentUrl;
      this.hmsDataService.postApi(url, papComment).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.showPapComments = true
        } else if (data.code == 404) {
          this.showPapComments = false
        } else {
          this.showPapComments = false
        }
      })
    });
    return promise;
  }

  papCommentHistory() {
    var PapCommentUrl = CompanyApi.getcompanyPapCommentUrl;
    var companyCreditlimitTableId = "PapComment"
    var reqParam = [
      { 'key': 'coKey', 'value': this.cokey },
    ]
    if (!$.fn.dataTable.isDataTable('#PapComment')) {
      this.dataTableService.jqueryDataTableComment('PapComment', CompanyApi.getcompanyPapCommentUrl, 'full_numbers', this.papSuspendColumnsTable, 5, true, true, 'lt', 'irp', undefined, [1, 'asc'], '', reqParam, '', '', '', 0, '', [1, 2, 3])
    }
    else {
      this.dataTableService.jqueryDataTableReload(companyCreditlimitTableId, PapCommentUrl, reqParam);
    }
  }

  /* Administration Fee/ Monthly Company Fee by */
  getAdminCompanyFeeSectionData(id) {
    let submitData = { coKey: id };
    this.hmsDataService.postApi(CompanyApi.getCompanyDetailByIdUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data.result.coAdminRate || data.result.coAdminRate == 0) {
          var coAdminRate = String(data.result.coAdminRate);
          if (coAdminRate && coAdminRate.indexOf(".") == -1) {
            data.result.coAdminRate = data.result.coAdminRate + '.00';
          }
        }
        this.adminCompanyFeeForm.patchValue({
          "company": (data.result.coId) ? data.result.coId.trim() : '',
          'gracePeriod': data.result.coTerminClearDt,
          'websiteAddress': data.result.coWebSiteAdd,
          'companyName': (data.result.coName) ? data.result.coName.trim() : '',
          'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'terminationDate': data.result.terminatedOn != undefined ?
            this.changeDateFormatService.convertStringDateToObject(data.result.terminatedOn) : '',
          'address1': (data.result.coL1MailAdd) ? data.result.coL1MailAdd.trim() : '',
          'address2': data.result.coL2MailAdd,
          'postalCode': (data.result.postalCd) ? data.result.postalCd.trim() : '',
          'phone': (data.result.coWorkPhoneNum) ? data.result.coWorkPhoneNum.trim() : '',
          'extension': data.result.extension != null ? data.result.extension.trim() : '',
          'city': (data.result.cityName) ? data.result.cityName.trim() : '',
          'province': (data.result.provinceName) ? data.result.provinceName.trim() : '',
          'country': (data.result.countryName) ? data.result.countryName.trim() : '',
          'fax': data.result.coFaxPhoneNum,
          'businessTypeKey': data.result.businessTypeDesc,
          'terminationCategory': data.result.termCatKey,
          'coBankInfoInd': data.result.coBankInfoInd == 'F' ? false : true,
          'adminrate': data.result.coAdminRate,
          'standardpapamount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.coStandardPapAmt),
          'adjustedpapamount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.coAdjustedPapAmt),
          'adjustedpapenddate': this.changeDateFormatService.convertStringDateToObject(data.result.coAdjustedPapEndDt),
          'exemptGst': data.result.coGstExemptInd == 'F' ? false : true,
          'papSuspended': data.result.coPapSuspendInd == 'F' ? false : true
        })
      } else {
        this.adminCompanyFeeForm.reset()
      }
    })
  }

  /* Cardholders Button functionality by */
  getCompanyCardholders() {
    if (this.financeCallForm.valid) {
      window.open('/card/searchCard?coId=' + this.coId + '&compName=' + this.compName + '&mergedDesc=' + this.mergedDesc, '_blank')
    } else {
      this.validateAllFormFields(this.financeCallForm)
    }
  }

  /* Plan Details button functionality by*/
  getPlanDetails() {
    if (this.financeCallForm.valid) {
      window.open('/company/view/' + this.cokey + '?uftCall=' + true, '_blank')
    } else {
      this.validateAllFormFields(this.financeCallForm)
    }
  }

  /* Plan Comments button functionality by*/
  getPlanComments() {
    if (this.financeCallForm.valid) {
      $('#planCommentsPopup').trigger('click')
      this.getPlanKey(this.cokey).then(res => {
        this.getPlanCommentsByPlanKey(this.planKey)
      })
    } else {
      this.validateAllFormFields(this.financeCallForm)
    }
  }

  getPlanKey(coKey) {
    let planJson = {
      "coKey": coKey
    }
    let promise = new Promise((resolve, reject) => {
      var URL = CompanyApi.getComopanyPlanListUrl;
      this.hmsDataService.postApi(URL, planJson).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          if (data.result.data.length > 0) {
            this.planKey = data.result.data[0].plansKey
            resolve()
          }
        } else {
          this.planKey = '';
          resolve()
        }
      });
    });
    return promise
  }

  getPlanCommentsByPlanKey(planKey) {
    var planCommentUrl = UftApi.planCommentListUrl;
    var planCommentsTableId = "planComments"
    var reqParam = [
      { 'key': 'plansKey', 'value': planKey },
    ]
    if (!$.fn.dataTable.isDataTable('#planComments')) {
      this.dataTableService.jqueryDataTableComment('planComments', planCommentUrl, 'full_numbers', this.planCommentsColumns, 5, true, true, 'lt', 'irp', undefined, [1, 'asc'], '', reqParam, '', '', '', 0, '', [1, 2, 3, 5], '', [4])
    }
    else {
      this.dataTableService.jqueryDataTableReload(planCommentsTableId, planCommentUrl, reqParam);
    }
  }

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
  reports(){
    this.showReport = true;
  }

   /**
   * Call Funding,Payment Run, Refund, Adjustments, Reports from UFT Continuity tab
   * @param type 
   */
  uftContinuityReport(type) {
    if (this.uftContinutyCalliinComponentObject.compNameMain == false) {
      this.uftContinutyCalliinComponentObject.companyNameText = '';
    }
    this.uftContinutyCalliinComponentObject.disabledTransationType = false;
    var url = UftApi.getListOfTransactionsByCokeyUrl
    if (type == "FUNDING") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyCalliinComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
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
      this.financeReportObject.openReportModal(uftReqData, -114, 'Funding Summary', this.uftContinutyCalliinComponentObject.disabledTransationType, true, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyCalliinComponentObject.uftContinuityType = type
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
      this.uftContinutyCalliinComponentObject.uftContinuityType = type
    }
    if (type == "REFUND") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyCalliinComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
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
      this.financeReportObject.openReportModal(uftReqData, -114, 'Refund Summary', this.uftContinutyCalliinComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyCalliinComponentObject.uftContinuityType = type
    }
    if (type == "ADJUSTMENT") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyCalliinComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
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
      this.financeReportObject.openReportModal(uftReqData, -114, 'Adjustments Summary', this.uftContinutyCalliinComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyCalliinComponentObject.uftContinuityType = type
    }
    if (type == "CLAIMS_PAYMENT_RUN") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate) : ""
      }
      this.financeReportObject.reportID = -104;
      this.financeReportObject.openReportModal(uftReqData, -104, 'Claims Payment Run Summary', this.uftContinutyCalliinComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -104)
      }, 500);
      this.uftContinutyCalliinComponentObject.uftContinuityType = type
    }
    if (type == "PAYMENT_RUN") {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyCalliinComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
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
      this.financeReportObject.openReportModal(uftReqData, -114, 'Payment Run Summary', this.uftContinutyCalliinComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyCalliinComponentObject.uftContinuityType = type
    } else if (type == 'AllUFTCODEDATA') {
      this.showHideReportComp = true;
      let uftReqData = {
        "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
        "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate) : "",
        "coKey": this.uftContinutyCalliinComponentObject.compKey,
        "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
        "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
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
      this.financeReportObject.openReportModal(uftReqData, -114, 'UFT Report', this.uftContinutyCalliinComponentObject.disabledTransationType, false);
      setTimeout(() => {
        this.financeReportObject.callReportGridApi(uftReqData, -114)
      }, 500);
      this.uftContinutyCalliinComponentObject.uftContinuityType = type
    }
  }

   /**
   * Call Funding,Payment Run, Refund, Adjustments, Sub Reports from UFT Continuity tab
   * @param transactionType 
   */
  uftContinuitySubTypeReport(transactionType) {
    if (this.uftContinutyCalliinComponentObject.compNameMain == false) {
      this.uftContinutyCalliinComponentObject.companyNameText = '';
    }
    this.uftContinutyCalliinComponentObject.showHideReportComp = true; let tranCode: any; let tableHeading;
    let isShowHideTransIsPositiveNegative = false;
    switch (parseInt(transactionType.transactionCode)) {
      case 90:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.monthlyPapReport');
        isShowHideTransIsPositiveNegative = true;
        break;
      case 93:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.dailyPapReport');
        isShowHideTransIsPositiveNegative = true;
        break;
      case 94:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.clientEftReport');
        isShowHideTransIsPositiveNegative = true;
        break;
      case 91:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.chequesReport');
        isShowHideTransIsPositiveNegative = true;
        break;
      case 92:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.reversalsReport');
        isShowHideTransIsPositiveNegative = true;
        break;
      case 10:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.claimsReport');
        break;
      case 20:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.adminFeesReport');
        break;
      case 21:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.brokerFeesReport');
        break;
      case 30:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.gstReport');
        break;
      case 31:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.brokerGSTReport');
        break;
      case 41:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.ontarioTaxReport');
        break;
      case 42:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.quebecTaxReport');
        break;
      case 43:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.newfoundlandTaxReport');
        break;
      case 48:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.saskatchewanTaxReport');
        break;
      case 80:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.refundChequesReport');
        break;
      case 81:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.refundPdsReport');
        break;
      case 70:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.miscellaneousReport');
        break;
      case 71:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.adminFeesReport');
        break;
      case 72:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.taxAdjustmentsReport');
        break;
      case 73:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.intercompanyTransfersReport');
        break;
      case 99:
        tranCode = [{ id: parseInt(transactionType.transactionCode), itemName: parseInt(transactionType.transactionCode) }]
        tableHeading = this.translate.instant('uft.dashboard.callIn.writeOffsReport');
        break;
    }

    let uftReqData = {
      "startDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.fromDate) : "",
      "endDate": this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate != null ? this.changeDateFormatService.convertDateObjectToString(this.uftContinutyCalliinComponentObject.uftContinuityData.value.toDate) : "",
      "coKey": this.uftContinutyCalliinComponentObject.compKey,
      "companyNameAndNo": this.uftContinutyCalliinComponentObject.companyNameText != undefined ? this.uftContinutyCalliinComponentObject.companyNameText : '',
      "compNameAndNo": this.uftContinutyCalliinComponentObject.companyName != undefined ? this.uftContinutyCalliinComponentObject.companyName : '',
      'transCode': tranCode,
      'transAmtType': 'All'
    }
    this.financeReportObject.reportID = -114;
    this.financeReportObject.selectedTransactionType = tranCode;
    this.uftContinutyCalliinComponentObject.disabledTransationType = true;
    this.financeReportObject.openReportModal(uftReqData, -114, tableHeading, this.uftContinutyCalliinComponentObject.disabledTransationType, isShowHideTransIsPositiveNegative);
    setTimeout(() => {
      this.financeReportObject.callReportGridApi(uftReqData, -114)
    }, 500);
  }

  /* Search Icon functionality By */ 
  searchFinCallDashboard(){
    if (this.financeCallForm.valid) {
      this.getPendingClaimsList(this.compName)
      this.getPrimaryContactList(this.cokey)
      this.getAdminCompanyFeeSectionData(this.cokey)
      this.getNotificationGeneratedClaimList(this.compName)
      this.getAboutToExpireClaimsList(this.compName)
      this.getAdjudicatedClaimList(this.compName)
      this.getPendingPaperworkClaimList(this.compName)
      this.uftContinutyCalliinComponentObject.showComapnyData(true)
    } else {
      this.uftContinutyCalliinComponentObject.showComapnyData(false)
      this.validateAllFormFields(this.financeCallForm)
    }
  }

  // Ticket #1287: Notification Generated Claims Section
  dataTableInitializeNotificationGeneratedClaimsList() {
    this.observableNotificationGeneratedClaimsObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.notificationGeneratedClaimsColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
          { title: "Claim Status", data: 'claimStatusDesc' }
        ]
        this.getNotificationGeneratedClaimList('-1')
        this.observableNotificationGeneratedClaimsObj.unsubscribe();
      }
    });
  }
  
  getNotificationGeneratedClaimList(companyType) {
    let pendingClaimRequest = [
      { 'key': 'claimStatusCd', 'value': '' },
      { 'key': 'company', 'value': companyType }
    ]
    var url = UftApi.releaseClaimsListUrl
    var tableId = "notificationGeneratedClaimsList"
    if (!$.fn.dataTable.isDataTable('#notificationGeneratedClaimsList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.notificationGeneratedClaimsColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', pendingClaimRequest, '', '', '', '', [1, 2, 3, 4, 5], [6], '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, pendingClaimRequest)
    }
    return false;
  }

  dataTableInitializeAboutToExpireClaimsList() {
    this.observableAboutToExpireClaimsObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.aboutToExpireColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), data: 'claimStatusDesc' }
        ]
        this.getAboutToExpireClaimsList('-1')
        this.observableAboutToExpireClaimsObj.unsubscribe();
      }
    });
  }

  getAboutToExpireClaimsList(company) {
    let aboutExpireClaimRequest = [{ 'key': 'company', 'value': company }]
    var url = UftApi.getAboutToExpirePfNotificationUrl;
    var tableId = "aboutToExpireClaimsList"
    if (!$.fn.dataTable.isDataTable('#aboutToExpireClaimsList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.aboutToExpireColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', aboutExpireClaimRequest, 10, '', '', '', [1, 2, 3, 4, 5], [6],'',  0)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, aboutExpireClaimRequest)
    }
    return false;
  }

  // Ticket #1287: Adjudicated Claims Section
  dataTableInitializeAdjudicatedClaimsList() {
    this.observableAdjudicatedClaimsObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.adjudicatedClaimsColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), data: 'claimStatusDesc' }
        ]
        this.getAdjudicatedClaimList('-1')
        this.observableAdjudicatedClaimsObj.unsubscribe();
      }
    });
  }
    
  getAdjudicatedClaimList(companyType) {
    let adjudicatedClaimRequest = [
      { 'key': 'claimStatusCd', 'value': '' },
      { 'key': 'company', 'value': companyType }
    ]
    var url = UftApi.releaseClaimsListUrl
    var tableId = "adjudicatedClaimsList"
    if (!$.fn.dataTable.isDataTable('#adjudicatedClaimsList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.adjudicatedClaimsColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', adjudicatedClaimRequest, '', '', '', '', [1, 2, 3, 4, 5], [6], '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, adjudicatedClaimRequest)
    }
    return false;
  }

  // Ticket #1287: Pending Paperwork Claims Section
  dataTableInitializePendingPaperworkClaimsList() {
    this.observablePendingPaperworkClaimsObj= Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.pendingPaperworkColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), data: 'claimStatusDesc' }
        ]
        this.getPendingPaperworkClaimList('-1')
        this.observablePendingPaperworkClaimsObj.unsubscribe();
      }
    });
  }
    
  getPendingPaperworkClaimList(companyType) {
    let pendingPaperworkClaimRequest = [
      { 'key': 'claimStatusCd', 'value': '' },
      { 'key': 'company', 'value': companyType }
    ]
    var url = UftApi.releaseClaimsListUrl
    var tableId = "pendingPaperworkClaimList"
    if (!$.fn.dataTable.isDataTable('#pendingPaperworkClaimList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.pendingPaperworkColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', pendingPaperworkClaimRequest, '', '', '', '', [1, 2, 3, 4, 5], [6], '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, pendingPaperworkClaimRequest)
    }
    return false;
  }

}
