import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { UftApi } from '../../uft-api';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { TranslateService } from '@ngx-translate/core';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { Http, ResponseContentType } from '@angular/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ClaimService } from '../../../claim-module/claim.service';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { debug } from 'util';
import { RemoteData, CompleterService, CompleterItem, CompleterData } from 'ng2-completer';
import { CardServiceService } from '../../../card-module/card-service.service';
import { ClaimApi } from '../../../claim-module/claim-api';
declare var jsPDF: any;

@Component({
  selector: 'app-pending-funds',
  templateUrl: './pending-funds.component.html',
  styleUrls: ['../dashboard.component.css']
})
@Injectable()
export class PendingFundsComponent implements OnInit {
  coName: string;
  compName: any;
  companyName: any;
  companyCoId: any;
  companyKey: any;
  aboutToExpire: string = 'F';
  observableObj;
  columns = [];
  dateNameArray = {}
  resetNotificationReqParam: { 'key': string; 'value': any; }[];
  mailOutKey: any;
  notificationColumns = [];
  notificationActionColumns = [];
  releaseClaimsColumns = [];
  releaseClaimsActionColumns = []
  claimAboutToExpireColumns = [];
  ObservablePendingFundsObj;
  ObservableResetNotificationObj;
  ObservableReleaseClaimsObj;
  ObservableReleaseActionListObj;
  ObservableNotificationActionListObj;
  ObservableClaimAboutToExpireObj;
  selectedRowCokey: any;
  showNotificationActionTable: boolean = false;
  uftSelectedRowClaimType;
  showReleaseActionTable: boolean = false; showLoader: boolean;
  mailMergeUrl: any;
  dateTime: string;
  showLastUpdated: boolean = false;
  reportPopUpTitle: any;
  reportID: number;
  showtableLoader: boolean = false;
  showPendingClaimList: boolean = false; //Enable true when we need to show PendingClaim list
  showReleaseClaimList: boolean = false; //Enable true when we need to show ReleaseClaim list
  showClaimAboutToExpireList: boolean = false; //Enable true when we need to show ClaimAboutToExpire list
  loaderText: string;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public companyListData: RemoteData;
  lastSelected: any = '';
  generateBothEbAbdOcl: boolean;
  lastStepEbAndocl: boolean;
  apiResponse: number = 0;
  EbErrorMessage: any;
  OclErrorMessage: string;
  result: any;
  apiResponse_step2: number;
  genrateMailmergeMailMergNo: any;
  genrateMailmergeMailMergresult: any;
  apiResponse_step3: number;
  claimStatusCd: string;
  showReleaseActionTable_Expire: boolean;
  fileName: string;
  lastSelectedclaimStatusCd: any;
  lastSelectedCokey: any;
  lastRequstReleseClaim: any;
  lastRequstEbOclClaim: any;
  arrClaimStatus = []
  public ClaimStatusList: CompleterData;
  claimStatus
  emptyList: number;
  EbOclEmptyList: number;
  emitPcHit: number = 1;
  oclCount: any;
  ebCount: any;
  pendingClaimsEB;
  pendingClaimsOCL;
  observableFinalNoticeObj
  finalListColumns = []
  observableExpireClaimObj
  expireListColumns = []
  claimStatusDesc
  expireClaimStatusDesc
  constructor(
    private translate: TranslateService,
    public dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private router: Router,
    private exDialog: ExDialog,
    private claimService: ClaimService,
    private http: Http,
    private changeDateFormatService: ChangeDateFormatService,
    private CurrentUserService: CurrentUserService,
    private completerService: CompleterService,
    public cardService: CardServiceService

  ) {
    cardService.emitPendingClaimHit.subscribe(value => {
      if (value) {
        if (value == 'true') {
          this.emitPcHit = 0 //to know if getEBOCLData API is called from CAllInDashboard Tab
        } else {
          this.emitPcHit = 1
        }
      }
    })
  }

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { position: 'right' },
    showDatasetLabels: true,
    hover: {
      onHover: function (e) {
        $("#pendingClaimBarChart").css("cursor", e[0] ? "default" : "pointer");
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

  public barChartLabels: string[] = ['New OCL Claims', 'New EB Claims', 'Notifications Generated', 'EB/OCL Claim About To Expire'];
  public barChartType: string = 'horizontalBar';
  public barChartLegend: boolean = false;
  public barChartData: any[];
  public barChartColors = [{}];

  ngOnInit() {
    this.barChartData = [];
    this.pendingClaimPieChart()
    this.getPendingClaimCount();
    this.dataTableInitialize();
    this.dataTableInitializeReleaseClaims();
    this.dataTableInitializeReleaseActionListClaims()
    this.dataTableInitializeNotificationActionList()
    this.dataTableInitializeClaimAboutToExpire();
    this.getClaimStatus();
    this.finalNoticeTableInititalization()
    this.expireTableInititalization()
    this.showNotificationActionTable = this.showNotificationActionTable ? false : this.showNotificationActionTable
    this.showReleaseActionTable = this.showReleaseActionTable ? false : this.showReleaseActionTable
    let self = this
    $(document).on('click', 'table#uftDashboard_notification tbody tr', function () {
      if (!$(this).find('td.dataTables_empty').length) {
        self.notificationActionList(self.dataTableService.uftSelectedRowCokey, self.dataTableService.uftSelectedRowType)
      }
    })
    $(document).on('click', 'table#uftDashboard_releaseClaims tbody tr', function () {
      if (!$(this).find('td.dataTables_empty').length) {
        self.releaseClaimsActionList(self.dataTableService.uftSelectedRowClaimType)
      }
    })
    $(document).on('click', 'table#uftDashboard_notificationAction .release-claim', function () {
      self.releaseClaims(self.dataTableService.uftSelectedData, 'uftDashboard_notificationAction')
    })
    $(document).on('click', 'table#uftDashboard_notificationAction .readjudicate-claim', function () {
      self.readjudicateClaim(self.dataTableService.uftSelectedData, 'uftDashboard_notificationAction')
    })
    $(document).on('click', 'table#uftDashboard_releaseClaimsAction .readjudicate-claim ', function () {
      self.readjudicateClaim(self.dataTableService.uftSelectedData, 'uftDashboard_releaseClaimsAction')
    })
    $(document).on('click', 'table#uftDashboard_releaseClaimsAction .release-claim', function () {
      self.releaseClaims(self.dataTableService.uftSelectedData, 'uftDashboard_releaseClaimsAction')
    })
    $(document).on('click', 'table#uftDashboard_releaseClaimsAction .del-ico', function () {
      self.deleteClaims(self.dataTableService.uftSelectedData, 'uftDashboard_releaseClaimsAction')
    })
    $(document).on('click', 'table#uftDashboard_releaseClaimsAction_Expire .release-claim', function () {
      self.releaseClaims(self.dataTableService.uftSelectedData, 'uftDashboard_releaseClaimsAction_Expire')
    })
    $(document).on('click', 'table#uftDashboard_releaseClaimsAction_Expire .del-ico', function () {
      self.deleteClaims(self.dataTableService.uftSelectedData, 'uftDashboard_releaseClaimsAction_Expire')
    })
    $(document).on('click', 'table#uftDashboard_releaseClaimsAction_Expire .readjudicate-claim ', function () {
      self.readjudicateClaim(self.dataTableService.uftSelectedData, 'uftDashboard_releaseClaimsAction_Expire')
    })
    $(document).on('click', 'table#uftDashboard_notificationAction tbody td', function () {
      if (!$(this).find('td.dataTables_empty').length) {
        if ($(this).index() == 4) {
          var targetUrl = "/claim/view/" + self.dataTableService.claimKey + "/type/" + self.dataTableService.disciplineKey;
          window.open(targetUrl, '_blank');
        }
        else {
        }
      }
    })
    $(document).on('click', 'table#uftDashboard_releaseClaimsAction tbody td', function () {
      if (!$(this).find('td.dataTables_empty').length) {
        if ($(this).index() == 4) {
          var targetUrl = "/claim/view/" + self.dataTableService.claimKey + "/type/" + self.dataTableService.disciplineKey;
          window.open(targetUrl, '_blank');
        }
        else {
        }
      }
    })
    this.getPredictiveCompanyList(this.completerService)
    $(document).on('click', 'table#uftDashboard_claimAboutToExpire tbody tr', function () {
      if (!$(this).find('td.dataTables_empty').length) {
        self.releaseClaimsActionList_Expire(self.dataTableService.uftSelectedRowClaimType)
      }
    })
    $(document).on('click', '#uftDashboard_releaseClaimsAction .ondemand-ico', function () {
      var id = $(this).data('id')
      self.toastrService.warning("This functionality to be implemented!!")
    })
    // #1145 - On Demand icon functionality added here
    $(document).on('click', '#uftDashboard_releaseClaimsAction_Expire .ondemandExp-ico', function () {
      var id = $(this).data('id')
      self.toastrService.warning("This functionality to be implemented!!")
    })
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#mailMergedFile .download-ico', function () {
      var selectedListRow = self.dataTableService.notificationListRowData
      if (selectedListRow.filePath != undefined) {
        window.open(selectedListRow.filePath, '_blank');
      }
    });
  }


  dataTableInitialize() {
    this.ObservablePendingFundsObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.notificationColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          // issue no 709 start
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          // issue no 709 end
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
        ]
        this.ObservablePendingFundsObj.unsubscribe();
        this.notificationList('C')
      }
    });
  }

  dataTableInitializeNotificationActionList() {
    this.ObservableNotificationActionListObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.notificationActionColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.action'), data: 'claimKey' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.discipline'), data: 'discipline' },
          { title: this.translate.instant('uft.dashboard.pending-funds.cardholderName'), data: 'cardHolderFullName' },
          { title: this.translate.instant('uft.dashboard.pending-funds.referenceNo'), data: 'dcConfirmId' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimEntryDate'), data: 'claimEntryDate' },
          { title: this.translate.instant('uft.dashboard.pending-funds.payeeType'), data: 'payeeType' },
          // Log #1250 replaced OCL with paidAmount
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.ebAmount'), data: 'ebAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), data: 'claimStatusDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.NotificationDate'), data: 'notificationDate' }
        ]
        this.ObservableNotificationActionListObj.unsubscribe();
      }
    });
  }

  dataTableInitializeReleaseClaims() {
    this.ObservableReleaseClaimsObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.releaseClaimsColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          // issue no 411 start
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          // issue no 411 end
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
          { title: "Claim Status", data: 'claimStatusDesc' } // claimStatusDesc General Feedback: claimStatusCd param added as per Arun Sir by Anisha(02-Dec-2021)
        ]
        this.ObservableReleaseClaimsObj.unsubscribe();
      }
    });
  }
  dataTableInitializeMailMergeListing() {
    this.ObservableResetNotificationObj = Observable.interval(100).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'companyNameAndNo' },
          { title: this.translate.instant('uft.dashboard.pending-funds.fileName'), data: 'fileName' },
          { title: this.translate.instant('uft.dashboard.pending-funds.action'), data: 'filePath' }
        ]
        this.ObservableResetNotificationObj.unsubscribe();
        this.resendNotification()
      }
    });
  }

  dataTableInitializeReleaseActionListClaims() {
    this.ObservableReleaseActionListObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.releaseClaimsActionColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.action'), data: 'claimKey' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.discipline'), data: 'discipline' },
          { title: this.translate.instant('uft.dashboard.pending-funds.cardholderName'), data: 'cardHolderFullName' },
          { title: this.translate.instant('uft.dashboard.pending-funds.referenceNo'), data: 'dcConfirmId' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimEntryDate'), data: 'claimEntryDate' },
          { title: this.translate.instant('uft.dashboard.pending-funds.payeeType'), data: 'payeeType' },
          // Log #1250 replaced OCL with paidAmount
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.ebAmount'), data: 'ebAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), data: 'claimStatusDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.NotificationDate'), data: 'notificationDate' }
        ]
        this.ObservableReleaseActionListObj.unsubscribe();
      }
    });
  }

  dataTableInitializeClaimAboutToExpire() {
    this.ObservableClaimAboutToExpireObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.claimAboutToExpireColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          // issue no 411 start
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          // issue no 411 end
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), data: 'claimStatusDesc' }
        ]
        this.ObservableClaimAboutToExpireObj.unsubscribe();
      }
    });
  }

  getClaimStatus() {
    this.arrClaimStatus = [
      { 'claimStatusDesc': 'EB', 'claimStatusCd': "B" },
      { 'claimStatusDesc': 'OCL', 'claimStatusCd': "C" },
      { 'claimStatusDesc': 'EB & OCL', 'claimStatusCd': "" }
    ];
    this.ClaimStatusList = this.completerService.local(
      this.arrClaimStatus,
      "claimStatusDesc,claimStatusCd"
    );
  }

  notificationList(type) {
    this.lastSelected = type;
    this.showPendingClaimList = true;
    this.showNotificationActionTable = false;
    this.showReleaseClaimList = false;
    this.showReleaseActionTable = false;
    this.showReleaseActionTable_Expire = false
    this.showClaimAboutToExpireList = false;
    this.dataTableService.resetTableSearch();
    if (type == 'B') {
      var claimRequest;
      claimRequest = [
        { 'key': 'claimStatusCd', 'value': 'B' }
      ]
    } else if (type == 'C') {
      if (this.pendingClaimsOCL == 0) {    // if bar chart has 0 OCL claims,then patch 'B' in request
        claimRequest = [
          { 'key': 'claimStatusCd', 'value': 'B' }
        ]
      }
      else {
        claimRequest = [
          { 'key': 'claimStatusCd', 'value': 'C' }  // patch 'C' by default whenever screen opens(show all OCL records)
        ]
      }
    }
    var url = UftApi.pendingClaimsListUrl;
    var tableId = "uftDashboard_notification"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_notification')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.notificationColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', claimRequest, '', '', '', '', [1, 2, 3, 4, 5], '', '', [0], null, null)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, claimRequest)
    }
    return false;
  }

  getPendingClaimCount() {
    let submitData = {
      "pendingClaimTab": 'T'
    }
    this.hmsDataService.postApi(UftApi.getPendingClaimCount, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.pendingClaimsEB = data.result.pfPendingClaimExtraBenefitCount
        this.pendingClaimsOCL = data.result.pfPendingClaimOverCreditLimitCount
      } else {
        this.pendingClaimsEB = 0
        this.pendingClaimsOCL = 0
      }
    })
  }

  notificationActionList(coKey, claimStatusCd) {
    this.showNotificationActionTable = true
    this.lastSelectedCokey = coKey;
    this.lastSelectedclaimStatusCd = claimStatusCd;
    this.dataTableService.resetTableSearch();
    var reqParamNotActionList = [{ 'key': 'coKey', 'value': coKey }, { 'key': 'claimStatusCd', 'value': claimStatusCd }]
    var url = UftApi.pendingClaimsActionListUrl;
    var tableActions =
      [
        { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'Release Claim', 'showAction': 'T' }]
    var tableId = "uftDashboard_notificationAction"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_notificationAction')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.notificationActionColumns, 5, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParamNotActionList, tableActions, 0, [5], 5, [7, 8], [2, 3, 4, 5, 6], '', '', [2, 3, 4, 5, 6], [9], [1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParamNotActionList)
    }
    return false;
  }

  releaseClaimsList() {
    this.showPendingClaimList = false;
    this.showNotificationActionTable = false;
    this.showReleaseClaimList = true;
    this.showReleaseActionTable = false;
    this.showReleaseActionTable_Expire = false
    this.showClaimAboutToExpireList = false;
    var reqParamRelClaimList = []
    var url = UftApi.releaseClaimsListUrl;
    var tableId = "uftDashboard_releaseClaims"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_releaseClaims')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.releaseClaimsColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParamRelClaimList, '', '', '', '', [1, 2, 3, 4, 5], [6], '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParamRelClaimList)
    }
    return false;
  }
  old_releaseClaimsActionList_Expire(data) {
    this.showReleaseActionTable_Expire = true
    var reqParam = []
    reqParam.push({ 'key': 'coKey', 'value': data.coKey })
    reqParam.push({ 'key': 'availFund', 'value': data.availFund })
    reqParam.push({ 'key': 'companyBalance', 'value': data.companyBalance })
    reqParam.push({ 'key': 'coId', 'value': data.coId })
    reqParam.push({ 'key': 'coName', 'value': data.coName })
    //comments for log 860
    reqParam.push({ 'key': 'oclAmt', 'value': data.oclAmt })
    reqParam.push({ 'key': 'paidAmt', 'value': data.paidAmt })
    reqParam.push({ 'key': 'creditLimitMultiplier', 'value': data.creditLimitMultiplier })
    reqParam.push({ 'key': 'claimStatusCd', 'value': data.claimStatusCd })
    reqParam.push({ 'key': 'coDesc', 'value': data.coDesc })
    reqParam.push({ 'key': 'pendingClaim', 'value': data.pendingClaim })
    var url = UftApi.releaseClaimsActionListUrl;
    var tableId = "uftDashboard_releaseClaimsAction_Expire"
    var tableActions
    if (data.claimStatusCd == 'C') {
      tableActions =
        [
          { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'Release Claim', 'showAction': 'T' },
        ];
    }
    else {
      tableActions =
        [
          { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'EB Approved', 'showAction': 'T' },
          { 'name': 'edit', 'class': 'table-action-btn edit-ico readjudicate-claim', 'icon_class': 'fa fa-hand-o-up', 'title': 'EB Denied', 'showAction': 'T' }//show readjudication to both ocl/eb(anil sir 25-03)
        ];
    }
    if (!$.fn.dataTable.isDataTable('#uftDashboard_releaseClaimsAction_Expire')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.releaseClaimsActionColumns, 5, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, tableActions, [0], [5, 10], [1, 2, 3, 4, 5, 6, 9], [7, 8], '', '', '', [2, 3, 4, 5, 6], [9], [1])
    } else {
      this.dataTableService.jqueryDatatableDestroy('uftDashboard_releaseClaimsAction_Expire')
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.releaseClaimsActionColumns, 5, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, tableActions, [0], [5, 10], [1, 2, 3, 4, 5, 6, 9], [7, 8], '', '', '', [2, 3, 4, 5, 6], [9], [1])
    }
    return false;
  }
  releaseClaimsActionList_Expire(data = null) {
    this.showReleaseActionTable_Expire = true
    this.expireClaimStatusDesc = data.claimStatusCd
    if (data) {
      this.lastSelectedCokey = data.coKey;
      this.lastSelectedclaimStatusCd = data.claimStatusCd;
    } else {
      data = { 'coKey': this.lastSelectedCokey, 'claimStatusCd': this.lastSelectedclaimStatusCd }
    }
    var reqParam = []
    reqParam.push({ 'key': 'coKey', 'value': data.coKey })
    reqParam.push({ 'key': 'availFund', 'value': data.availFund })
    reqParam.push({ 'key': 'companyBalance', 'value': data.companyBalance })
    reqParam.push({ 'key': 'coId', 'value': data.coId })
    reqParam.push({ 'key': 'coName', 'value': data.coName })
    reqParam.push({ 'key': 'oclAmt', 'value': data.oclAmt })
    reqParam.push({ 'key': 'paidAmt', 'value': "" }) /*Issue:1250-prabhat due to that Action table entries not coming*/
    reqParam.push({ 'key': 'creditLimitMultiplier', 'value': data.creditLimitMultiplier })
    reqParam.push({ 'key': 'claimStatusCd', 'value': data.claimStatusCd })
    reqParam.push({ 'key': 'coDesc', 'value': data.coDesc })
    reqParam.push({ 'key': 'pendingClaim', 'value': data.pendingClaim })
    this.lastRequstEbOclClaim = reqParam
    this.dataTableService.resetTableSearch();
    var url = UftApi.releaseAteClaimOclExbByCoKeyUrl;
    var tableActions
    if (data.claimStatusCd == 'C') {
      tableActions =
        [
          { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'Release Claim', 'showAction': 'T' },
          { 'name': 'delete', 'class': 'table-action-btn del-ico ', 'icon_class': 'fa fa-trash', 'title': 'Delete Claim', 'showAction': 'T' }
        ]
    } else {
      tableActions =
        [
          { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'EB Approved', 'showAction': 'T' },
          { 'name': 'edit', 'class': 'table-action-btn edit-ico readjudicate-claim', 'icon_class': 'fa fa-hand-o-up', 'title': 'EB Denied', 'showAction': 'T' },
          { 'name': 'OD', 'class': 'table-action-btn green-btn ondemandExp-ico', 'title': 'On Demand', 'showAction': 'T' }
        ];
    }
    var tableId = "uftDashboard_releaseClaimsAction_Expire"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_releaseClaimsAction_Expire')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.notificationActionColumns, 5, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, tableActions, 0, [5, 10], 5, [7, 8], [2, 3, 4, 5, 6], '', '', [1, 2, 3, 4, 5, 6, 9], [], [])
    } else {
      this.dataTableService.jqueryDatatableDestroy('uftDashboard_releaseClaimsAction_Expire')
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.notificationActionColumns, 5, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, tableActions, 0, [5, 10], 5, [7, 8], [2, 3, 4, 5, 6], '', '', [1, 2, 3, 4, 5, 6, 9], [], [])
    }
    return false;
  }

  releaseClaimsActionList(data = null) {
    this.showReleaseActionTable = true
    this.showReleaseActionTable_Expire = false
    var reqParam = []
    reqParam.push({ 'key': 'coKey', 'value': data.coKey })
    reqParam.push({ 'key': 'availFund', 'value': data.availFund })
    reqParam.push({ 'key': 'companyBalance', 'value': data.companyBalance })
    reqParam.push({ 'key': 'coId', 'value': data.coId })
    reqParam.push({ 'key': 'coName', 'value': data.coName })
    //comments for log 860
    reqParam.push({ 'key': 'oclAmt', 'value': data.oclAmt })
    reqParam.push({ 'key': 'paidAmt', 'value': "" }) //empty value patched as list was not opening on testhms for some entries as per Arun Sir
    reqParam.push({ 'key': 'creditLimitMultiplier', 'value': data.creditLimitMultiplier })
    reqParam.push({ 'key': 'claimStatusCd', 'value': data.claimStatusCd })
    reqParam.push({ 'key': 'coDesc', 'value': data.coDesc })
    reqParam.push({ 'key': 'pendingClaim', 'value': data.pendingClaim })
    this.lastRequstReleseClaim = reqParam
    var url = UftApi.releaseClaimsActionListUrl;
    var tableId = "uftDashboard_releaseClaimsAction"
    var tableActions
    this.claimStatusDesc = data.claimStatusCd
    if (data.claimStatusCd == 'C') {
      tableActions =
        [
          { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'Release Claim', 'showAction': 'T' },
          { 'name': 'delete', 'class': 'table-action-btn del-ico ', 'icon_class': 'fa fa-trash', 'title': 'Delete Claim', 'showAction': 'T' }
        ];
    }
    else {
      tableActions =
        [
          { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'EB Approved', 'showAction': 'T' },
          { 'name': 'edit', 'class': 'table-action-btn edit-ico readjudicate-claim', 'icon_class': 'fa fa-hand-o-up', 'title': 'EB Denied', 'showAction': 'T' },//show readjudication to both ocl/eb(anil sir 25-03)
          { 'name': 'OD', 'class': 'table-action-btn green-btn ondemand-ico', 'title': 'On Demand', 'showAction': 'T' },
        ];
    }
    if (!$.fn.dataTable.isDataTable('#uftDashboard_releaseClaimsAction')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.releaseClaimsActionColumns, 5, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, tableActions, [0], [5, 10], [1, 2, 3, 4, 5, 6, 9], [7, 8], '', '', '', [1, 2, 3, 4, 5, 6, 9], [], [])
    } else {
      this.dataTableService.jqueryDatatableDestroy('uftDashboard_releaseClaimsAction')
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.releaseClaimsActionColumns, 5, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, tableActions, [0], [5, 10], [1, 2, 3, 4, 5, 6, 9], [7, 8], '', '', '', [1, 2, 3, 4, 5, 6, 9], [], [])
    }
    return false;
  }

  claimAboutToExpireList() {
    this.showPendingClaimList = false;
    this.showNotificationActionTable = false;
    this.showReleaseClaimList = false;
    this.showReleaseActionTable = false;
    this.showReleaseActionTable_Expire = false;
    this.showClaimAboutToExpireList = true;
    this.claimStatus = null
    var reqParam = []
    var url = UftApi.getAboutToExpirePfNotificationUrl;
    var tableId = "uftDashboard_claimAboutToExpire"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_claimAboutToExpire')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.claimAboutToExpireColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', '', '', [1, 2, 3, 4, 5], [6], '', 0)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  readjudicateClaim(dataRow, tableId): any {
    /**Commented on 22Aug2019(Issue No. 430) */
    let url = UftApi.reAdjudicateDashboardClaimUrl
    let submitInfo = {};
    switch (dataRow.disciplineKey) {
      case 1:
        submitInfo = {
          "dentalClaim": {
            "claimKey": dataRow.claimKey,
          }
        }
        break;
      case 2:
        submitInfo = {
          "visionClaim": {
            "claimKey": dataRow.claimKey,
          }
        }
        break;
      case 3:
        submitInfo = {
          "healthClaim": {
            "claimKey": dataRow.claimKey,
          }
        }
        break;
      case 4:
        submitInfo = {
          "drugClaim": {
            "claimKey": dataRow.claimKey,
          }
        }
        break;
      case 5:
        submitInfo = {
          "hsaClaim": {
            "claimKey": dataRow.claimKey,
          }
        }
        break;
      case 6:
        submitInfo = {
          "wellnessClaim": {
            "claimKey": dataRow.claimKey,
          }
        }
        break;
    }
    this.hmsDataService.postApi(url, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.toastrService.success(this.translate.instant('uft.toaster.claimAdjudicatedSuccess'))
        this.showLoader = false
        this.loaderText = ""
        /* Both API's call */
        this.getResultForEbAndOclClaim(dataRow, tableId)
        var reqParam = [{ 'key': 'coKey', 'value': dataRow.coKey },]
        var tableActions
        if (dataRow.claimStatusCd == 'C') {
          tableActions =
            [
              { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'Release Claim', 'showAction': 'T' },
            ];
        }
        else {
          tableActions =
            [
              { 'name': 'view', 'class': 'table-action-btn release-claim', 'icon_class': 'fa fa-paper-plane-o', 'title': 'EB Approved', 'showAction': 'T' },
              { 'name': 'edit', 'class': 'table-action-btn edit-ico readjudicate-claim', 'icon_class': 'fa fa-hand-o-up', 'title': 'EB Denied', 'showAction': 'T' }//show readjudication to both ocl/eb(anil sir 25-03)
            ];
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.claimNotAdjudicated'))
        this.showLoader = false
        this.loaderText = ""
      }
    }, (error) => {
      this.toastrService.error(this.translate.instant('uft.toaster.claimNotAdjudicated'))
      this.showLoader = false
      this.loaderText = ""
    })
  }

  // General Feedback  17 feb 2021
  newGetMailMerged(claimStatusCode = null) {
    this.claimStatusCd = claimStatusCode;
    this.EbOclEmptyList = this.dataTableService.totalRecords_notification
    if (this.EbOclEmptyList == 0 || this.EbOclEmptyList == undefined) {
      this.emptyList = 0;
    } else {
      this.emptyList = 1;
    }
    if (this.emitPcHit == 0 && this.EbOclEmptyList == 0) {
      this.emptyList = 0;
    }
    if (this.emitPcHit == 0 && this.EbOclEmptyList != 0) {
      this.emptyList = 1;
    }
    this.step1_getMailMerged(this.claimStatusCd)
  }

  showError() {
    let Error
    if (this.EbErrorMessage) {
      Error = this.EbErrorMessage
    }
    if (this.OclErrorMessage) {
      Error = this.OclErrorMessage
    }
    if (this.EbErrorMessage && this.OclErrorMessage) {
      Error = this.EbErrorMessage + " - " + this.OclErrorMessage
    }
    if (Error) {
      this.toastrService.error(Error)
    } else {
    }
  }


  step1_getMailMerged(claimStatusCd) {
    this.loaderText = this.translate.instant('uft.dashboard.pending-funds.mailMergeFileGenerationProgress')
    let url = claimStatusCd == 'B' ? UftApi.generateEXBMailMerge : UftApi.generateOCLMailMerge
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data.result.result != 0) {
          this.result = data.result.result;
          this.apiResponse = 1;
          this.step2_generateMailMerge(this.result)
        }
        else if (data.result.result == 0) {
          this.result = 0;
          this.apiResponse = 0;
          this.step2_generateMailMerge(this.result)
        }
      } else {
        if (claimStatusCd == "B") {
          this.EbErrorMessage = this.translate.instant('uft.toaster.mailMergeFail') + " (EB)"
          this.OclErrorMessage = this.translate.instant('uft.toaster.mailMergeFail') + " (OCl)"
        }
        if (this.claimStatusCd == "B") {
          this.newGetMailMerged("C")
        } else {
          this.notificationList(this.lastSelected);
          this.showError()
        }
      }
    })
  }

  step2_generateMailMerge(mailMergNo): any {
    let promise = new Promise((resolve, reject) => {
      this.showLoader = true;
      let url;
      let submitInfo;
      if (mailMergNo != 0) {
        url = this.claimStatusCd == 'B' ? UftApi.getMailMergeEbData : UftApi.getMailMergeOclData
        submitInfo = {
          'result': mailMergNo
        }

        this.hmsDataService.postApi(url, submitInfo).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.apiResponse = 1;
            this.showLoader = false;
            this.loaderText = ""
            this.genrateMailmergeMailMergNo = mailMergNo
            this.genrateMailmergeMailMergresult = data.result
            this.step3_generateMailMergeLetter(this.genrateMailmergeMailMergresult, this.genrateMailmergeMailMergNo)
            resolve();
          } else {   // 1eb,0ocl error toaster part
            this.showLoader = false
            this.loaderText = "";
            this.apiResponse = 0;
            if (this.claimStatusCd == "B") {  // 1ocl,0eb error toaster part
              this.EbErrorMessage = this.translate.instant('uft.toaster.mailMergeError') + " (EB)"
              this.newGetMailMerged("C")
            } else {
              this.OclErrorMessage = this.translate.instant('uft.toaster.mailMergeError') + " (OCl)"
            }
            this.notificationList(this.lastSelected);
            this.showError()
            resolve();
          }
        })
      }
      else {
        this.showLoader = false
        this.loaderText = "";
        if (this.claimStatusCd == "B" && this.emptyList == 1) {
          this.EbErrorMessage = this.translate.instant('uft.toaster.mailMergeError') + " (EB)"
        }
        if (this.claimStatusCd == "C" && this.emptyList == 1) {
          this.OclErrorMessage = this.translate.instant('uft.toaster.mailMergeError') + " (OCl)"
        }
        else if (this.emptyList == 0) {
          this.EbErrorMessage = this.translate.instant('uft.toaster.mailMergeError') + " (EB)"
          this.OclErrorMessage = this.translate.instant('uft.toaster.mailMergeError') + " (OCl)"
          this.notificationList(this.lastSelected);
        }
        if (this.claimStatusCd == "B") {
          this.newGetMailMerged("C")
          this.apiResponse = 1
        }
        this.showError()
        resolve();
        //}
      }
    });
    return promise;
  }

  step3_generateMailMergeLetter(mailMergeDataurl, mailMergNo) {
    let letterTypeToster = this.claimStatusCd == 'B' ? "EB letter" : "OCL letter"
    this.showLoader = true
    this.loaderText = letterTypeToster + " In-progress........"
    let url = this.claimStatusCd == 'B' ? UftApi.getMailMergeEbLetterData : UftApi.getMailMergeOclLetterData
    let submitInfo = {
      'result': mailMergNo
    }
    this.hmsDataService.postApi(url, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.apiResponse = 1
        this.showLoader = false
        this.resetPendingClaimsCompanyList('uftDashboard_notification')
        let letterType = this.claimStatusCd == 'B' ? "EB letter" : "OCL letter"
        const a = document.createElement('a');
        a.href = data.result;
        a.target = '_blank'
        let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        a.download = 'Mail_Merge_' + letterType.split(' ').join('_') + todayDate;
        a.click();
        this.exDialog.openMessage(letterType + " " + this.translate.instant('uft.toaster.hasBeenExportedat') + " " + data.result).subscribe((val) => {
          if (this.claimStatusCd == 'B') {
            this.newGetMailMerged("C")
            this.emptyList = 1 // 1eb,0ocl
          } else {
            this.EbOclEmptyList = this.dataTableService.totalRecords_notification
          }
          this.notificationList(this.lastSelected);
        })
      } else {
        this.apiResponse = 0
        this.showLoader = false
        this.loaderText = "";
        if (this.claimStatusCd == "B") {
          this.newGetMailMerged("C")
        } else {
          this.showError()
        }
        this.notificationList(this.lastSelected);
      }
    })
  }

  releaseClaims(data, tableId): any {
    this.exDialog.openConfirm(this.translate.instant('uft.toaster.releaseClaimConfirmation')).subscribe((value) => {
      if (value) {
        this.adjudicateClaim(data, tableId)
      }
    });
  }

  deleteClaims(rowdata, tableId): any {
    var submitData = {}
    var selectedCokey = rowdata.coKey
    var selectedclaimStatusCd = rowdata.claimStatusCd
    let submitType = this.claimService.getSubmitParam(rowdata.disciplineKey)
    submitData[submitType] = {
      "claimKey": rowdata.claimKey
    }
    this.exDialog.openConfirm("Are you Sure You Want To Delete Claim ?").subscribe((value) => {
      if (value) {
        this.hmsDataService.postApi(ClaimApi.deleteClaimUrl, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastrService.success("Record Deleted Successfully!")
            if (tableId == "uftDashboard_releaseClaimsAction_Expire") {
              this.releaseClaimsActionList_Expire({ 'coKey': selectedCokey, 'claimStatusCd': selectedclaimStatusCd })
            }
            else if (tableId == "uftDashboard_releaseClaimsAction") {
              this.releaseClaimsActionList(rowdata)
            }
          }
          else if (data.code == 400 && data.status === "BAD_REQUEST") {
            this.toastrService.error("Record Cannot Be Deleted!")
          }
          else if (data.code == 500) {
            this.toastrService.error("Record Cannot Be Deleted!")
          }
        });
      }
    })
  }

  pendingClaimPieChart(): any {
    this.showtableLoader = true
    this.hmsDataService.getApi(UftApi.pendingClaimPieChart).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.barChartData = [{
          data: [data.result.oclClaimCount, data.result.exbClaimCount, data.result.totalNotificationCount, data.result.expiredNotificationCount],
          backgroundColor: ['#00BAB5', '#88724c', '#D36726', '#3B3B3B']
        }];
        this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
        this.showLastUpdated = true;
        this.showtableLoader = false
      } else {
        this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
        this.showLastUpdated = true;
        this.showtableLoader = false
      }
    })
  }

  //pie chart click  events
  public barClicked(e: any): void {
  }
  //pie chart Hover  events
  public barHovered(e: any): void {
  }

  openPdfAfterRelease(claimStatusCd) {
    let url = claimStatusCd == 'B' ? UftApi.getVPfClaimsEBReleased : UftApi.getVPfClaimsOclReleased
    this.hmsDataService.getApi(url).subscribe(data => {
      this.showLoader = true; // Fix loader issue
      if (data.code == 200 && data.status === "OK") {
        this.reportID = 1; //Static for now,but need to be changed       
        var doc = new jsPDF('p', 'pt', 'a3');
        this.showLoader = false;
        for (var i in data.result.data) {
          data.result.data[i].coName =  data.result.data[i].coId + '-' + data.result.data[i].coName;
        }
        var OclColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), dataKey: 'coIdAndName' },
          { title: this.translate.instant('uft.dashboard.pending-funds.discipline'), dataKey: 'discipline' },
          { title: this.translate.instant('uft.dashboard.pending-funds.cardNo'), dataKey: 'cardNum' },
          { title: this.translate.instant('uft.dashboard.pending-funds.referenceNo'), dataKey: 'dcConfirmId' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), dataKey: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.oclAmount'), dataKey: 'overCreditLimitAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.releaseDate'), dataKey: 'releasedOn' },
        ];
        var exbColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), dataKey: 'coIdAndName' },
          { title: this.translate.instant('uft.dashboard.pending-funds.discipline'), dataKey: 'discipline' },
          { title: this.translate.instant('uft.dashboard.pending-funds.cardNo'), dataKey: 'cardNum' },
          { title: this.translate.instant('uft.dashboard.pending-funds.referenceNo'), dataKey: 'dcConfirmId' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), dataKey: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.ebAmount'), dataKey: 'ebAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.releaseDate'), dataKey: 'releasedOn' },
        ];
        var rows = data.result;
        //Start Header            
        var headerobject = [];
        let headerHeading = claimStatusCd == 'B' ? "List Of Released Extra Benefit Pending Fund Claim" : "List Of Released Over Credit Limit Pending Fund Claim"
        headerobject.push({
          'gridHeader1': headerHeading
        });
        this.pdfHeader(doc, headerobject);
        //End Header 
        let columns = claimStatusCd == 'B' ? exbColumns : OclColumns
        doc.autoTable(columns, rows, {
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [215, 214, 213],
            lineWidth: 1,
          },
          columnStyles: {
            'Company No & Name': { halign: 'left' },
            'Discipline': { halign: 'right' },
            'Card No': { halign: 'right' },
            'Reference No.': { halign: 'right' },
            'Paid Amount': { halign: 'right' },
            'E/B Amount': { halign: 'right' },
            'Release Date': { halign: 'right' },
          },
          didParseCell: function (data) {
            if (data.section == 'head' && data.column.index != 0) {
              data.cell.styles.halign = 'right';
            }
          },
          startY: 100,
          startX: 40,
          theme: 'grid',
        });
        for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
          doc.setPage(i); // Switch to the current page
          this.pdfFooter(doc, this.reportID);
        }
        let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        doc.save(headerHeading.split(' ').join('_') + '_' + todayDate + '.pdf');
        //End PDF
        // general feed back dec- 31-2020
        // claim has been relese click ok - do you want to genrate mail merge letter ? ->yes
        // then api - > getGenerateOCLMailMerge
        this.test(claimStatusCd)
      } else {
        this.showLoader = false;
      }
    })
  }
  test(claimStatusCd) {
    this.exDialog.openMessage(this.translate.instant('uft.toaster.claimHasBeenReleased')).subscribe((val) => {
    })
  }
  pdfHeader(doc, headerobject) {
    // var imageData = 'data:image/png;base64,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';
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEQ4M0Q4NjE1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEQ4M0Q4NjA1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTU1MzkwMUYzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTU1MzkwMjAzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4x0Cf0AAAW60lEQVR42uxdCXhUVbKu21u6O52d7AmLhIR9FRSVRRjcFUERFxQHR0UddVzQ5xNFcRtcRsdRUcYRxhnBBR3EHRVQQEBE9ggJECAh+96d3tLd91XVud3pTtJJd0h83/P1+b7zJbl9l3NP/eevv6pOgyTLMkRapHmbxvvLnn6jIrPRzU1Sfq5XN8NKtR2OS26VCiBNA1Iu/hyEPQfPycNT+mBPwm5QLmnG7sTuwd4TK5buWYZ9GfblRw8ebQuISOuZWad2sVsH4z0aWKt2evZJrtIayVNaJ8kb7XgGdoMbIB3B0Q/7GATLaPw5EoGS64epnmgEwjOxG7G/6gOx12WEyBCp2G/CPhW76f+BTb0rlH66sKPt0Iai27BbsDdhNyu/W5TfG5Reh72Wjqnx/CiQXC68XRP2RknGE2WokDxwROWGMvxZjo85iT/xM+QUuR9eN0oL0mS8djyCZCj+re2BdzyCDJHTFUCMxf4e9n6RtR9yIwBZFZDUE0BwyZdiL0IDl6hAKkFjn8DfixFxdQ6Qm6sREASOIskNBdgLESwIGpUV5IFoqck6kM7DaybgPRK7aYzVCIjkcAFBF+xQaCbSur8Ri5SjkU+gsfei28jHn/kIkoJGkBvKFGDsUbnggORCgMgZTpCnInvMQsqYKgna72rLR0AMCRcQ92J/IWK3X72VIXsUIEC2otj7ES21oxY8JUcRHDsQHDtUzXBMcuegL7sa3dH1aqE7wm1rEBAzwhWV50Zs87/S0pEl0pENJjnF340mkA6M8Wi/HufRftMA+u0HVK7D36uan9yubn6hEjyz0KXcjawxOoxn7AqIjEJgCALNXuyDukemeYAeKZF+piAs0rrccPYOIQA+xZ8fou7Y+q3aCZ+rnFKx5L4R3cmDWhHSdtZmI0O8Hw4gMrAfxB5zKiDw2OziJUxGkHRalE8u8FiaWMOrDBh+q6SIhU8tobQV3cbyGpBXrVc7LR+pHYYTkvs+PUgPqIPbjkTvaATE3nAAMQX7t13GgtUGKqMeYqdNgviLz4fokcNAFRPNx62790Hdx59Dw5cbQHZ7QKWPAohkTk+pofGLEASv14DntdUaBwFjsA3kl/HY1HZOL8Weh4CwhAOI27C/Fn5WRga3uQlizhkHGY8ugOgxI/lww9cbwJ5/CHR9siHh8ouFY1z/PRQ/+Dg4i08ieIwRUHQPYxxFxnhqv+R66xWtDfZJrseQmxe14uGt2M/yz1SGAojXFFCEBwZ0B73mzoaspxeCKkoPruoaOHbbfWj8TewmZJcLEmddBn2XvQSSWg32w0fhyOx50FxWBVKULmLRbmoGkD63gHzH6xrbsU/UjmsQJP9QtaTIKXV9qz8gQlF1w8POxpgtkHLzHOj9wpMMBtnphGN3LIDGb74HdWwsqONiQZOYAHVryF18w9foc06D7OcXi2RthCG6raG7uAgd8ZYFLuO0G92GVQ6QZ8uiTgJKsNBaqHbYosNKRqExiRniLpwCmU8u9B2ueusdaFi3EdTxcX7n4smSCgHRIk9iz52I105lfRFp3ddcGBjYQV47z6WfcY1b/4kV5HuVjwrCBURf7GkhewqHE3RZ6dD7ucXsBngwNTVQ+cYKUBvbJtMkjQYcRSfwQo/vWNJ1V6IyUkVYopsbzrAe2eEdBMX4cbLmVQTIZ3i4OFxADAw5eUW6oLkZMh+5H7TpLRiqXb0WnMdLONRsAwiVCtnAyiGotxlHjwBtRipqDHfEit3ccEYNOgxN57gM0cjP/4V/V3i6AIgQw0srxE6dCAkzL23BCArHuo8+CyoSZUIRMYlfDkITFwf6AacxuCKt+xsyQ94wj/q2aZ6o/VRQ07aNTjpsoe2a8cjMAKn3zA84bN2zD2wHDqKwjAp6ndoUja4jcFi6tDT0Ip6I9XqgKbX8OXc0G166QtK5pFZbLjpiCPosLyQ82G0QM2k8mMadHnC8ccNmkaGUgmQh0ejqhPi2D46O5CJ62HXE6JGbc2QN9JdVITNEL+xZoaUdZEi65orAY6gBzOs3gaQNvqeDWECb3KvdaCXSerQdRZbAEECGcEQlsUN8p2BAQRjVJxtiJp4dcNx5ohjsBUfQXeg6TGBpM9sGMR5nRD/0cNsV7ANNJ4AIIdR0QPTYkaCODayfNO3aC+4GM6hM0cHTFho1GAb0b0tpdfUcgbTrNvzdT8DnUvCklveacO7X2s3hZ7LbDd5SLYfVHbhCkWeR2l0EwSdE6vq54bX8rgBiaKjuwnTG6W2OW3/aDR1u8cdJI62g69enlRtxg7Ok1JfHoGiDXIskqTBa0YqJUO5Lx4mhJK1auCaPLAxHOxf5GkmEu5ICLv/PEHDiM+V+dC+XCH/9Q2RyfR6bjceqTU4CyRAFniY7uGrrQLY7hN5pDww0/iDCWHbjGFziM4lyLsoYKKMr6Q3KuyvjpffHn7xAqEstIT4VBNVGg3gWgRXvIxO7Kn93UAI41BVAjAhFsqpw8qIwTGyNbNvBAk48Bb0UB6xNTQZdVkZgVq2qGt3NSbyFB9LunQ+msWOEwfAlncXFULLwGfAg8+j6ZkHWUw+jQUzIUnaoeHkZitgtkLn4QVFIo8hHq4Hm6mooXvA4slUD11X0xEj0mYbqJ0eg5JElIKPwVfdKgH5v/IWBZd6yDcqfe40nXZOUACm3zYWEKy4FTXycAJLBAPZDh6H67Xehfs0XLWyA9yXjnfbPV6Bpxy68xys4vmg/8W2HlPlzIe78qTx3PD8aidP7lJ21/LgTKv66DDwWK2iSEyF7yaOgjosX46XFQJggwOAYHOiSG7/eCDWr/oOheizXhageRC7Y/N1WiDtvMlT9YyWeq26tyWi7XmFHkUR7jYofnW6mpdWsijWBLjM90Ki1tZyBJIMEvRaRbBg8AMPOwM3b9oOFvPooVK1evgonJAZMZ42D5rIyKH3iBc6GEvKdpRVQu/oTNHA/KMOJt+7ez5Nf8/b7oI6P5WvcjY1Quvh5XNFWnhi6H+kd+sz2SwGUv7CUx+FBw2c8fC/o83I4q1rzrw/AQ65w3CjI/XQlpD9wFzR8ug6OXn87FM6YCycfeRoMQwdByi03CDfiNTg+J+6CcyF28gQwDMpt840Keqfa9z5GoDnBNH4ssoQTSh9/Hg24BaJPHwWpt/8BEmdews921zVA1Zv/BtOZp+N4x0L9J19C2dMvQeXSt8B+5BjETZsC2c8uZtA4T5ZyRri5vBKiRw+FxNmX8bwEcSvFCijCYgiKLtJDyT9QSlrjX6PARgNz1zcKmuuAIYwjh7U53vjdD2wkWavDVd0o9khgq3lvDTJEKRfG6EVp8gn5lq07wLxpm1i9+LezrMKHc7rGll8ImsR4dhPNlVVIyWLPRc3K1SJtjhdlP/soGvEcKLjkWl75RM3RY4ZD/3eWMfgKZ1wP5u+3sXsgN9S0cw8CYiACt57DatJP7IaMeki961YxsUmJALQgfNvDvIsF9ZFOUHnNu/+Bhi/Xg2XbDjBNHA/GIYNBjYxE1zAoeAORDM3ImtXvrGaQ0EtXr3gPsv68kAGUdM2VUPn6Cn4XYpnGbzbx/e0HDgkGcrdxWwUiFREeIChDGUINWiSkWrsGZ1k5T5TKaAgaXZChY84+o41ANW/YjEZAo7ma0RXlQlTfPlw9dRQeFXsl/Hx19KjhnPji5yv+MwpXRtRpfTBScYIdWUBtMvq0iD63P2gSEphtHMdOML1noxuJPXcCFE6fg5NaDOoYExuy94tPMfhO3PPfCLgfuTrrbXSc9AaN1QtYAmjSdVeAIVeIZE2vRPH+lJZXAMFuMj0FDHm5PAfEhnQvlUGPrlfcx5Z/iDUEaRcS63St/VAh35+SeLwYbGqoQ3ZMuWUuJ/WicvpC/cfrcOzR+F7FQkuRa9Oo2wvhd0MnyacuRxj0NJrU1uKRNrr4U2l7oaqubzYYhgRu0zRv3sZUrkKEe/AcWoX0Yg70jc0VVeIFvdoFDaEfnMur1QtIon66hq63o4ZxUA1FyYPwBI8Rssi67xek2XLIfmYhxEw4Ewovv54nkrb3sWGvnYnubCBnWms/WIs+OjCCIgNW/f1fqJMKeTXSu2pQcCZddTmu1rcUhkhiA/pnXNlNDszhqi/RPI2Pj6H7IW1j3XcAzBu3CJCh4QnwHLH9tItdpRdYNA9ui0Uc82aKFXFKcyEWqTpsQdkRIIaHiAceFKnjAA1RU9dhyORBdR4zYXzgisdWtWKlQLcSPkafLnZZNf28JyDjyQZISQY1agY7Mocv+UWsMWKoYvR8UUb3TqJK8rkoy+atkLloAcROQWaYORcpuRbdgYHplcJkb5KNCnMeq73dzcDNFTVirPRYpHbSE9a9B6Bh3Xe+bCuH4h45oLZjGDZYSevvB8fR46BNS2Yd4Dh+Ao7/8UF8TwePWY3azHfu3nxf1CXicg8yXTyKW70ixGtEhbjzRmHUwXABQTMY0g5r0gjk51w1gRqFwrGgcTKFUDoNxF9yXsBhyw/bwPztZkGzOIm0D9M3Ibv3BdyP6N84NA9c9Q1I/xViNZAbQvVvVLbqWXfubrmGwrOEOF6J1BKuvAzSF9wlQkoKHSnMpFAOga3P6499AIOuafvOoKGboGOJxxLVvy+KySlQ8dpyX+WWBCRrCz8fTiKbxKNI3JVA1pMPQe5nq9j/F1x8NbqGI8w+nOzLzoSofn25aMhuxC/j60Fg0TNJKHujstb1oCCtHPuxcAGBqg2yQ2IIKl8jIGhAoSZgPMgohsF5qOBHBxi4bMnfhJuhScYX1makoa9Fw6CWsO3/BVR+E0LnG5AJyJXISlaTjKtJSeJKKYe9+w6CSnEldA9d7yyc5CwWlryiKJRCtxB33iRwKxtyaKL1GB3wRGOkJMDWcf2PmCv1jnm8+8u2P58jJBKE7DYQhN69HvRupBfomV6Qp9x6I+qdfviccnSzZWIxkKAkvYPukLcWHikS2wr9IzZiQoU9Ldt/Qraq7MhF+LfjIL6LGhYgSBUlh1w9w0kk+gu4aaypw8xm4uzLfSKKXcWbb6N+2O4ToSwA0afSinfgSnJgdOE/IfTy0SOHcqzfksBCoA0awFv0nMUlfB0oIPI4XcgogxQ9UgQlC5/mnAAXbOZcJe6hJKe0KeLV3fUigpA6+HoAsYthSB4kzZnN4eGAD1ewSPWOVZuW0qKlaNX364MhehpHTxQZ0fh5BU6ZyHkH8J4re3xMYt21l1mixV0KtoubOlm4tQ/WhJO13NfpGg8iKEP+Bo2E4SFtj/MXT6S0A3yejx0cHAUkzZ7RktFE4Vb2/KsBeoLuZRorVoADY26Pucnnx5k90lNBh6udcg9eSieG8LkY1A8Uokk+vyq3uBJkG7quccMm/tuEkY5x5BDfqvYCQGXA8SA7dJRtpbGk3TNf7CRHtiL36cTV6jGLXe28UUi5nla9cdggzpra8g8yyCncpKbr0xvZMIfZU0Rg5C4HKYDYF1Dt86CYjL9wKu9aN2/6gcNM/l5LDwMi5EbFK6K/hi++9h0zjhrBYZf/TigyGPnojIf+hNQp8hZE3yykmmwBEQTXOAbnKQK1JkBNu1E3EMNQ2GhHUealdFqVJu+qQoP7fDfnSgzCGIqYI6PUrvpQYRstisiZzEqkiUQeg1Z3KkShm5FtjlYRUrMvnR07+SzWG8duuZezoSfufpg7RQ8i9Exq2fxD38gdPdwHWGKjJk7ve3jxmM4Y47s3AZ5cC7ELAVilU6IoXBi67AzIePg+cNXVQclDT+DikcNhiIKuAGJkWGUSpdBzctESrnDyZKamQK951zI1ksZwN5rZj2c+ugASLr9EAUMlFM27E0O3w63yFSKH76X7aAQXpakpF0H3SLjyUkiZ/3so/+sb+FyNEpeLnIdhiPDPli3bfWGYu6mJQ0L9wAHMAhTCUa7BvGk7h6YsMmdeKoyPk2vZ8iOnuQloaffdjkpexyCkd6AxkJjTZaczSFP/NB8qly7naIbyFCKq8PD1nK8gDaEsBJojoxJGWjZtZWa1/VIIzSWlfCxm0lm+d4nCkJwiKEfRMY5cSOMQ+xhHD4WcD5azYC36/Z1ChOr1oVrK0lmE0V5iipZpTrilM0okURbx8LW3QJ8Xn4TosWMg/f472Yc2rtuABukFiVdNx1UwVoSRO3bCifsXgT2/QKSu21QZJaj/+AuInXQOr8CBG9Zyckab0ovFYTGuDPK/dC2r/Bx0Q9fM8O3ljD5jNFJ4ETOPEbVGMoKT6gXsIlDM1mOYSS6lBv1v5iMPIEBiIPvZx+D43Q+hEY7DyceXQO/nn+CaQ966D6Hhq2/xOW5mGdrveXLRn1F7zIKYs8+E6hWrRDKLikk6HaeuOW1NRj7rDJyLUdCMURjVGgwDxXEDhr9NO/YwQ1r37mf3F4PvGn/JNDCv3wzJN9/gW1jZTy3k++rxHeldLNt28kJiMHAlOeSNRKT8Kzq1Zasv6qQpKIoLu6DK6LZx2EQvn4g6gRMrkipAL9S++xHUvLumJZPpBwZaabG/m8BizbzxB878Jc6azhPmpfuqt/4Nlq07cQUZfbok6eoZrLppBRNFk0+teOkNrpqmzL+RdQsxFTEKUXTFX5aCq9ECOgRsyu3zWAuQUauWvc15Dfo7ZuJ4FIuzwDh8KL+Tq7oaGr/bCtXLVzJLJEy/kMUe+f3Kv73Jz6bIKPWPNzHVE1CpttKEBnQhY8RfNA3PMYtVh0AmZiGGiPvdRP6aIygpcRpz0pXTkRWa2J2x20GjU86CdqCRm2Fq5xR8WBb6CvsF7VYxi3YFBcRE7N+dSqGdjEoUS8amyhspa5pQyjQ6jxcj9VlZQEqtEykUbiFI+i59Fo2+Eidnr1h1qA3IwDTJXL9AP68y6AOASPQtRKHM7CIpoKAKKUUTIjT1fqYSQMSfQgtYffUGEpLenAYnwmQPG5V3hyPYyfhM0QR+u03kVNRifN5kGl0nIgvlnlS3oOspqvGCXxJj4BS1b+wgzsX35YSa96sJ3gVFz0I3yhuOurYX4lnsD3YGiNYuI7fLSKDJwBcxjBgM8Ui1FHpShED+3LKlgCefcu1Mr+2l0BBElO0jF0GpZd+LK3sCvNm/9hNdWlC3s82fFTvVRdrb5CuLdG/raqvXaD7Q0WpnYNIzWpJUba5TwBmsftPu+UHGru5gU9EptF9COak1IAZ39WluXL3Jf7gOheMDAWEQGbNpx89Q+9En/FW+5pPlYq1Szl2trFKHHYXdRZC95DHUB4tFIccLnGA7j36t9tv5NywOdwUQI7oEBvTPCdPPh+xnFrWTp9CCCcUVdUqzNn7/A5ix2zG6IDWu5s0d0xFMN7DAqsFwUB1thEjr1tbQ0aaYYKKSeJX22p0WlqcgQRYfC3lfrQZdRnroF1J4hi6GjY8MQPWQw1fMFWGoQR8xYfe2A8pid3emIfz5MBPEvxYTnohEEZV803UMBqJ+KsRYf97D+fnOqNhb33ccOw5H5twC1gOHuKgVad3ejgYDQ0cug1KDYVuDtABV7irfWA41Kz/k73FyISc2htOv8RdMxVByEuiyMttNZdd/SlvDXuTiDuuGyBd0eqLtCfVEzalGGETvte+v5dCOhaJWw+EUxeXmDVtYSGpTe3FSxTAoj2N1cjOUAKLkkm3/QRG6mSLf1urBdqgrgBjW1aeRcGz9DS0ChaSEYPRPC1ERpuGrjYFgwjDOF5FEsNBTjWa2oCuAGNlTI/IHR6T96o3+SeUjITO+3+99I3P3m2wUbtZ2BRD1kbn7TbaXw3HI/oB4MTJ3v7n2HPZ3wrnAX0PQf6JBOeKbQWyhi3wp//9mo8IP1S2WYl8Ttt6L/J9bkRbMZURapMH/CDAAWoSs47LJ+xgAAAAASUVORK5CYII=';
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report') {
        doc.text(headerobject[0].text5Date, 1100, 90, null, null, 'right');
      } else {
        doc.text(headerobject[0].text5Date, 800, 90, null, null, 'right');
      }
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.setTextColor('#009BDB');
    doc.text(headerobject[0].gridHeader1, 250, 90);
    return true;
  }

  // pdfFooter(doc, reportId) {
  //   const pageSize = doc.internal.pageSize;
  //   const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
  //   const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
  //   var imageData = 'data:image/png;base64,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';
  //   doc.addImage(imageData, 'JPEG', 0 , pageHeight - 100);
  // }

  pdfFooter(doc, reportId) {
    //Start Footer      
    doc.setFontSize(8);
    //Left Line1
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('T', 40, doc.autoTable.previous.finalY + 40);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('1-800-232-1997 | 780-426-7526', 50, doc.autoTable.previous.finalY + 40);
    //Left Line2
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('F', 40, doc.autoTable.previous.finalY + 50);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('780-426-7581', 50, doc.autoTable.previous.finalY + 50);
    //Left Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('E', 40, doc.autoTable.previous.finalY + 60);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('claims@quikcard.com', 50, doc.autoTable.previous.finalY + 60);
    //Right Line1
    doc.text('#200, 17010 - 103 Avenue', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 40, null, null, 'right');
    //Right Line2
    doc.text('Edmonton, AB T5S 1K7', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 50, null, null, 'right');
    //Right Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('quikcard.com', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 60, null, null, 'right');
  }

  legendBtnClick(type) {
    if (type == 'newOCLClaims') {
      this.notificationList('C');
    } else if (type == 'newEBClaims') {
      this.notificationList('B');
    } else if (type == 'notificationsGenerated') {
      this.releaseClaimsList();
    } else if (type == 'eBOCLClaimAboutToExpire') {
      this.claimAboutToExpireList();
    }
  }

  aboutToExp() {
    this.aboutToExpire = 'T'
    this.resendNotification()
  }

  resendNotification() {
    var reqParam = []
    reqParam.push({ 'key': 'aboutToExpire', 'value': this.aboutToExpire })
    reqParam.push({ 'key': 'companyNameAndNo', 'value': this.coName })
    var url = UftApi.getMailMergedFileCreationListing;
    var tableId = "mailMergedFile"
    if (!$.fn.dataTable.isDataTable('#mailMergedFile')) {
      var tableActions = [{ 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': '' },]
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, [2], '', '', '', '')
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  closeModal() {
    this.aboutToExpire = 'F'
    this.coName = ''
  }

  //bar graph click  events
  public chartClicked(e: any): void {
    if (e.active[0]) {
      if (e.active[0]._index == 0) {
        this.legendBtnClick('newOCLClaims');
      } else if (e.active[0]._index == 1) {
        this.legendBtnClick('newEBClaims');
      } else if (e.active[0]._index == 2) {
        this.legendBtnClick('notificationsGenerated');
      } else if (e.active[0]._index == 3) {
        this.legendBtnClick('eBOCLClaimAboutToExpire');
      }
    }
  }

  //bar graph Hover events
  public chartHovered(e: any): void {
  }

  /**
   * Grid1 Column Filter For
   * Pending Claims Company List
   * @param tableId
   * 
   */
  filterPendingClaimsCompanyList(tableId: string) {
    var URL = UftApi.pendingClaimsListUrl;
    var obj = { key: 'searchType', value: 'l' };
    var paramPC = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    paramPC[0].value = paramPC[0].value == "" ? "" : paramPC[0].value;
    paramPC[1].value = paramPC[1].value == "" ? null : paramPC[1].value;
    paramPC[2].value = paramPC[2].value == "" ? null : paramPC[2].value;
    paramPC[3].value = paramPC[3].value == "" ? null : paramPC[3].value;
    paramPC[4].value = paramPC[4].value == "" ? null : paramPC[4].value;
    paramPC[5].value = paramPC[5].value == "" ? null : paramPC[5].value;
    if (this.lastSelected == 'B' && tableId == 'uftDashboard_notification') {
      paramPC[6].key = 'claimStatusCd'
      paramPC[6].value = 'B'
    } else if (this.lastSelected == 'C' && tableId == 'uftDashboard_notification') {
      paramPC[6].key = 'claimStatusCd'
      paramPC[6].value = 'C'
    }
    this.dataTableService.jqueryDataTableReload(tableId, URL, paramPC)
    this.emitPcHit = 1
  }

  /**
   * Grid2 Column Filter For
   * Release Claims Company List
   * @param tableId
   * 
   */
  filterReleaseClaimsCompanyList(tableId: string) {
    var URL = UftApi.releaseClaimsListUrl;
    var obj = { key: 'searchType', value: 'l' };
    var paramsCompList = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    paramsCompList[0].value = paramsCompList[0].value == "" ? "" : paramsCompList[0].value;
    paramsCompList[1].value = paramsCompList[1].value == "" ? null : paramsCompList[1].value;
    paramsCompList[2].value = paramsCompList[2].value == "" ? null : paramsCompList[2].value;
    paramsCompList[3].value = paramsCompList[3].value == "" ? null : paramsCompList[3].value;
    paramsCompList[4].value = paramsCompList[4].value == "" ? null : paramsCompList[4].value;
    paramsCompList[5].value = paramsCompList[5].value == "" ? null : paramsCompList[5].value;
    this.dataTableService.jqueryDataTableReload(tableId, URL, paramsCompList)
  }

  /**
   * Grid3 Column Filter For
   * Claim About To Expire List
   * @param tableId
   * 
   */
  filterClaimAboutToExpireList(tableId: string) {
    var URL = UftApi.getAboutToExpirePfNotificationUrl;
    var obj = { key: 'searchType', value: 'l' };
    var paramsAbtExp = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    paramsAbtExp[0].value = paramsAbtExp[0].value == "" ? "" : paramsAbtExp[0].value;
    paramsAbtExp[1].value = paramsAbtExp[1].value == "" ? null : paramsAbtExp[1].value;
    paramsAbtExp[2].value = paramsAbtExp[2].value == "" ? null : paramsAbtExp[2].value;
    paramsAbtExp[3].value = paramsAbtExp[3].value == "" ? null : paramsAbtExp[3].value;
    paramsAbtExp[4].value = paramsAbtExp[4].value == "" ? null : paramsAbtExp[4].value;
    paramsAbtExp[5].value = paramsAbtExp[5].value == "" ? null : paramsAbtExp[5].value;
    this.dataTableService.jqueryDataTableReload(tableId, URL, paramsAbtExp)
  }

  /**
   * Grid 1
   * Pending Claims Company List
   * @param tableId 
   */
  resetPendingClaimsCompanyList(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.EbOclEmptyList = this.dataTableService.totalRecords_notification;
  }

  /**
   * Grid 2
   * Release Claims Company List
   * @param tableId 
   */
  resetReleaseClaimsCompanyList(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterReleaseClaimsCompanyList(tableId);
  }

  /**
   * Grid 3
   * Claim About To Expire List
   * @param tableId 
   */
  resetClaimAboutToExpireList(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterClaimAboutToExpireList(tableId);
  }

  /**
   * Column Filters For
   * Pending Claims List
   * @param tableId
   * 
   */
  filterPendingClaimsList(tableId: string) {
    var URL = UftApi.pendingClaimsActionListUrl;
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    // added code to resolved pdf/excel issues in pending claims
    params.push({ 'key': 'coKey', 'value': this.lastSelectedCokey });
    params.push({ 'key': 'claimStatusCd', 'value': this.lastSelectedclaimStatusCd });
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  /**
   * Reset Function
   * Pending Claims List
   * @param tableId 
   */
  resetPendingClaimsList(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterPendingClaimsList(tableId);
  }

  /**
   * Column Filters For
   * Release Claims Action List
   * @param tableId
   * 
   */
  filterReleaseClaimsActionList(tableId: string) {
    var URL = UftApi.releaseClaimsActionListUrl;
    if (tableId == 'uftDashboard_releaseClaimsAction_Expire') {
      URL = UftApi.releaseAteClaimOclExbByCoKeyUrl;
    }
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    if (this.lastSelectedCokey != null || this.lastSelectedCokey != '' || this.lastSelectedclaimStatusCd == null || this.lastSelectedclaimStatusCd != '') {
      params.push({ key: 'coKey', value: this.lastSelectedCokey }, { key: 'claimStatusCd', value: this.lastSelectedclaimStatusCd })
    }
    // pdf/excel issue in Notifications Generated Section
    if (tableId == "uftDashboard_releaseClaimsAction") {
      if (this.lastRequstReleseClaim[0].value != null || this.lastRequstReleseClaim[0].value != '' || this.lastRequstReleseClaim[8].value == null || this.lastRequstReleseClaim[8].value != '') {
        params.push({ key: 'coKey', value: this.lastRequstReleseClaim[0].value }, { key: 'claimStatusCd', value: this.lastRequstReleseClaim[8].value })
      }
    }
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  /**
   * Reset Function
   * Release Claims Action List
   * @param tableId 
   */
  resetReleaseClaimsActionList(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterReleaseClaimsActionList(tableId);
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

  getPredictiveCompanyList(completerService) {
    this.companyListData = completerService.remote(
      null,
      "coName",
      "coName"
    );
    this.companyListData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': this.CurrentUserService.token } });
    this.companyListData.urlFormater((term: any) => {
      return UftApi.searchCompanyListForPendingNotificationUrl + `/${term}`;
    });
    this.companyListData.dataField('result.data');
  }

  onCompanyNameSelectedSearch(selected: CompleterItem) {
    if (selected) {
      this.companyKey = selected.originalObject.coKey.toString();
      this.companyCoId = selected.originalObject.coId
      this.companyName = selected.originalObject.companyname
      this.compName = selected.originalObject.mergedDescription
    }
    else {
      this.companyCoId = ''
      this.companyKey = ''
    }
  }

  searchResendNotification() {
    this.resendNotification();
  }

  resetResendNotification() {
    this.coName = '';
    this.dataTableInitializeMailMergeListing();
  }

  dowloadPDFReport(table, type = null) {
    let transCodeArray = [];
    let requestParam = {};
    this.showLoader = true;
    let isRcal = 1;
    let headerHeading
    var url
    let length
    if (table == 'uftDashboard_notification') {
      headerHeading = this.lastSelected == 'B' ? "Pending Claims Company List EB " : "Pending Claims Company List OCL ";
      length = this.dataTableService.totalRecords_notification;
      url = UftApi.pendingClaimsListUrl;
    } else if (table == 'uftDashboard_releaseClaims') {
      headerHeading = "Release Claims Company List (Notification Generated) ";
      length = this.dataTableService.totalRecords_releaseClaims;
      url = UftApi.releaseClaimsListUrl;
      isRcal = 4
    } else if (table == 'uftDashboard_claimAboutToExpire') {
      headerHeading = "EB/OCL Claim About To Expire ";
      length = this.dataTableService.totalRecords_claimAboutToExpire;
      url = UftApi.getAboutToExpirePfNotificationUrl;
    } else if (table == 'uftDashboard_notificationAction') {
      headerHeading = "Pending Claims List ";
      length = this.dataTableService.totalRecords_notificationAction;
      url = UftApi.pendingClaimsActionListUrl;
      isRcal = 2
    }
    else if (table == 'uftDashboard_releaseClaimsAction') {
      headerHeading = "Release Claims Action List ";
      length = this.dataTableService.totalRecords_releaseClaimsAtion;
      url = UftApi.releaseClaimsActionListUrl;

      isRcal = 3
    } else if (table == 'uftDashboard_releaseClaimsAction_Expire') {
      headerHeading = "Release Claims Action List ";
      length = this.dataTableService.totalRecords_notificationAction_Expire;
      url = UftApi.releaseAteClaimOclExbByCoKeyUrl;
      isRcal = 2
    }
    var obj = { key: '', value: '' };
    var paramsRCActExp = this.dataTableService.getFooterParamsCompanySearchTable(table, obj);
    paramsRCActExp[0].value = paramsRCActExp[0].value == "" ? "" : paramsRCActExp[0].value;
    paramsRCActExp[1].value = paramsRCActExp[1].value == "" ? null : paramsRCActExp[1].value;
    paramsRCActExp[2].value = paramsRCActExp[2].value == "" ? null : paramsRCActExp[2].value;
    paramsRCActExp[3].value = paramsRCActExp[3].value == "" ? null : paramsRCActExp[3].value;
    paramsRCActExp[4].value = paramsRCActExp[4].value == "" ? null : paramsRCActExp[4].value;
    paramsRCActExp[5].value = paramsRCActExp[5].value == "" ? null : paramsRCActExp[5].value;
    if (isRcal == 2) {
      paramsRCActExp[6].value = paramsRCActExp[6].value == "" ? null : paramsRCActExp[6].value;
      paramsRCActExp[7].value = paramsRCActExp[7].value == "" ? null : paramsRCActExp[7].value;
    }
    requestParam = {
      'start': 0,
      'length': length
    }
    if (isRcal == 2) {
      requestParam['coKey'] = this.lastSelectedCokey;
      requestParam['claimStatusCd'] = this.lastSelectedclaimStatusCd;
    } else if (isRcal == 3) {
      paramsRCActExp = this.lastRequstReleseClaim
    }
    else if (isRcal == 4) {
      if (this.claimStatusCd == undefined) {
        this.claimStatusCd = ""
      }
      requestParam['claimStatusCd'] = this.claimStatusCd;
    }
    if (this.lastSelected == 'B' && table == 'uftDashboard_notification') {
      requestParam['claimStatusCd'] = 'B'
    } else if (this.lastSelected == 'C' && table == 'uftDashboard_notification') {
      requestParam['claimStatusCd'] = 'C'
    }
    /** Start Narrow Search */
    if (paramsRCActExp.length > 0) {
      for (let i = 0; i < paramsRCActExp.length; i++) {
        const element: any = paramsRCActExp[i];
        if (element.value) {
          requestParam[element.key] = element.value;
        }
      }
    }
    // 
    /** End Narrow Search */
    this.hmsDataService.postApi(url, requestParam).subscribe(data => {
      this.showLoader = true;
      if (data.code == 200 && data.status == 'OK') {
        var doc = new jsPDF('p', 'pt', 'a3');
        this.showLoader = false;
        
        for (var i in data.result.data) {
          data.result.data[i].coName =  data.result.data[i].coId + '-' + data.result.data[i].coName;
        }

        var OclColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), dataKey: 'coName' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), dataKey: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), dataKey: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), dataKey: 'pendingFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), dataKey: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), dataKey: 'availFund' }
        ];
        var releseColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), dataKey: 'coName' },
          { title: this.translate.instant('uft.dashboard.pending-funds.discipline'), dataKey: 'discipline' },
          { title: this.translate.instant('uft.dashboard.pending-funds.cardNo'), dataKey: 'cardNum' },
          { title: this.translate.instant('uft.dashboard.pending-funds.referenceNo'), dataKey: 'dcConfirmId' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimEntryDate'), dataKey: 'claimEntryDate' },
          { title: this.translate.instant('uft.dashboard.pending-funds.payeeType'), dataKey: 'payeeType' },
          { title: this.translate.instant('uft.dashboard.pending-funds.oclAmount'), dataKey: 'overCreditLimitAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.ebAmount'), dataKey: 'ebAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), dataKey: 'claimStatusDesc' },
        ];
        if (isRcal == 2) {
          var ebOclreleseColumns = [
            { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), dataKey: 'coName' },
            { title: this.translate.instant('uft.dashboard.pending-funds.discipline'), dataKey: 'discipline' },
            { title: this.translate.instant('uft.dashboard.pending-funds.cardholderName'), dataKey: 'cardHolderFullName' },
            { title: this.translate.instant('uft.dashboard.pending-funds.referenceNo'), dataKey: 'dcConfirmId' },
            { title: this.translate.instant('uft.dashboard.pending-funds.claimEntryDate'), dataKey: 'claimEntryDate' },
            { title: this.translate.instant('uft.dashboard.pending-funds.payeeType'), dataKey: 'payeeType' },
            // Column name changed from OCL to Paid amount for PDF in below one.
            { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), dataKey: 'paidAmt' },
            { title: this.translate.instant('uft.dashboard.pending-funds.ebAmount'), dataKey: 'ebAmt' },
            { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), dataKey: 'claimStatusDesc' },
            { title: this.translate.instant('uft.dashboard.pending-funds.NotificationDate'), dataKey: 'notificationDate' }
          ];
        }
        // Below condition added for all columns of release claims action list in notification generated of finance dashboard.
        if (isRcal == 3) {
          var releaseClaimActionList = [
            { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), dataKey: 'coName' },
            { title: this.translate.instant('uft.dashboard.pending-funds.discipline'), dataKey: 'discipline' },
            { title: this.translate.instant('uft.dashboard.pending-funds.cardNo'), dataKey: 'cardNum' },
            { title: this.translate.instant('uft.dashboard.pending-funds.referenceNo'), dataKey: 'dcConfirmId' },
            { title: this.translate.instant('uft.dashboard.pending-funds.claimEntryDate'), dataKey: 'claimEntryDate' },
            { title: this.translate.instant('uft.dashboard.pending-funds.payeeType'), dataKey: 'payeeType' },
            { title: this.translate.instant('uft.dashboard.pending-funds.oclAmount'), dataKey: 'overCreditLimitAmt' },
            { title: this.translate.instant('uft.dashboard.pending-funds.ebAmount'), dataKey: 'ebAmt' },
            { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), dataKey: 'claimStatusDesc' },
            { title: this.translate.instant('uft.dashboard.pending-funds.NotificationDate'), dataKey: 'notificationDate' }
          ];
        }
        if (isRcal == 4) {
          var NotificationColumns = [
            { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), dataKey: 'coName' },
            { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), dataKey: 'companyBalance' },
            { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), dataKey: 'paidAmt' },
            { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), dataKey: 'pendingFund' },
            { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), dataKey: 'creditLimitMultiplier' },
            { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), dataKey: 'availFund' },
            { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), dataKey: 'claimStatusDesc' },
          ];
        }
        var rows = data.result.data;
        //Start Header            
        var headerobject = [];
        headerobject.push({
          'gridHeader1': headerHeading
        });
        this.pdfHeader(doc, headerobject);
        //End Header 
        let columns
        if (isRcal == 1) {
          columns = OclColumns
        }
        else if (isRcal == 4) {
          columns = NotificationColumns
        }
        // To load columns list
        else if (isRcal == 3) {
          columns = releaseClaimActionList
        }
        else if (isRcal == 2) {
          columns = ebOclreleseColumns
        }
        else {
          columns = releseColumns
        }
        doc.autoTable(columns, rows, {
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [215, 214, 213],
            lineWidth: 1,
          },
          columnStyles: {
            'Company No & Name': { halign: 'left' },
            'Discipline': { halign: 'left' },
            'Card No': { halign: 'left' },
            'Reference No.': { halign: 'left' },
            'Paid Amount': { halign: 'left' },
            'E/B Amount': { halign: 'left' },
            'Release Date': { halign: 'left' },
            'Claim Status': { halign: 'left' },
          },
          didParseCell: function (data) {
            if (data.section == 'head' && data.column.index != 0) {
            }
          },
          startY: 100,
          startX: 40,
          theme: 'grid',
        });
       
        for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
          doc.setPage(i); // Switch to the current page
          this.pdfFooter(doc, this.reportID);
        }

        let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        doc.save(headerHeading.split(' ').join('_') + '_' + todayDate + '.pdf');
      }
      this.showLoader = false;
    })
  }
  pushToArray(arr, obj) {
    const index = arr.findIndex((e) => e.key === obj.key);
    if (index === -1) {
      arr.push(obj);
    } else {
      arr[index] = obj;
    }
    return arr;
  }

  exportReportList(table) {
    var transCodeArray = [];
    switch (table) {
      case 'uftDashboard_notification':
        if (this.dataTableService.totalRecords_notification != undefined) {
          var URL = UftApi.pendingClaimsCoListExcelUrl;
          this.fileName = "Pending Claims Company List OCL "
          var obj = { key: 'searchType', value: 'l' };
          var paramsPCListOCL = this.dataTableService.getFooterParamsCompanySearchTable(table, obj);
          paramsPCListOCL[0].value = paramsPCListOCL[0].value == "" ? "" : paramsPCListOCL[0].value;
          paramsPCListOCL[1].value = paramsPCListOCL[1].value == "" ? null : paramsPCListOCL[1].value;
          paramsPCListOCL[2].value = paramsPCListOCL[2].value == "" ? null : paramsPCListOCL[2].value;
          paramsPCListOCL[3].value = paramsPCListOCL[3].value == "" ? null : paramsPCListOCL[3].value;
          paramsPCListOCL[4].value = paramsPCListOCL[4].value == "" ? null : paramsPCListOCL[4].value;
          paramsPCListOCL[5].value = paramsPCListOCL[5].value == "" ? null : paramsPCListOCL[5].value;
          let requestParam = {
            'start': 0,
            'length': this.dataTableService.totalRecords_notification
          };
          /** End Narrow Search */
          if (this.lastSelected == 'B') {
            requestParam['claimStatusCd'] = 'B';
            this.fileName = "Pending Claims Company List EB "
          } else if (this.lastSelected == 'C') {
            requestParam['claimStatusCd'] = 'C';
          }
          if (paramsPCListOCL.length > 0) {
            for (let i = 0; i < paramsPCListOCL.length; i++) {
              const element: any = paramsPCListOCL[i];
              requestParam[element.key] = element.value;
            }
            if (this.dataTableService.totalRecords_notification > this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else if (this.dataTableService.totalRecords_notification > this.CurrentUserService.minLengthForExcel && this.dataTableService.totalRecords_notification <= this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else {
              this.exportFile(URL, requestParam);
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        }
        break;

      case 'uftDashboard_releaseClaims':
        this.fileName = "Release Claims Company List (Notification Generated)";
        if (this.dataTableService.totalRecords_releaseClaims != undefined) {
          var URL = UftApi.notificationGenExcel;
          var obj = { key: 'searchType', value: 'l' };
          var paramsNotGen = this.dataTableService.getFooterParamsCompanySearchTable(table, obj);
          paramsNotGen[0].value = paramsNotGen[0].value == "" ? "" : paramsNotGen[0].value;
          paramsNotGen[1].value = paramsNotGen[1].value == "" ? null : paramsNotGen[1].value;
          paramsNotGen[2].value = paramsNotGen[2].value == "" ? null : paramsNotGen[2].value;
          paramsNotGen[3].value = paramsNotGen[3].value == "" ? null : paramsNotGen[3].value;
          paramsNotGen[4].value = paramsNotGen[4].value == "" ? null : paramsNotGen[4].value;
          paramsNotGen[5].value = paramsNotGen[5].value == "" ? null : paramsNotGen[5].value;
          paramsNotGen[6].value = paramsNotGen[6].value == "" ? null : paramsNotGen[6].value;
          /** End Narrow Search */
          let requestParam = {
            'start': 0,
            'length': this.dataTableService.totalRecords_releaseClaims
          };
          if (paramsNotGen.length > 0) {
            for (let i = 0; i < paramsNotGen.length; i++) {
              const element: any = paramsNotGen[i];
              requestParam[element.key] = element.value;
            }
            if (this.dataTableService.totalRecords_releaseClaims > this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else if (this.dataTableService.totalRecords_releaseClaims > this.CurrentUserService.minLengthForExcel && this.dataTableService.totalRecords_releaseClaims <= this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else {
              this.exportFile(URL, requestParam);
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
          break;
        }
      case 'uftDashboard_claimAboutToExpire':
        this.fileName = "EB/OCL Claim About To Expire "
        if (this.dataTableService.totalRecords_claimAboutToExpire != undefined) {
          var URL = UftApi.PfAboutToExpExcel;
          var obj = { key: 'searchType', value: '1' };
          var paramsAbtToExp = this.dataTableService.getFooterParamsCompanySearchTable(table, obj);
          paramsAbtToExp[0].value = paramsAbtToExp[0].value == "" ? "" : paramsAbtToExp[0].value;
          paramsAbtToExp[1].value = paramsAbtToExp[1].value == "" ? null : paramsAbtToExp[1].value;
          paramsAbtToExp[2].value = paramsAbtToExp[2].value == "" ? null : paramsAbtToExp[2].value;
          paramsAbtToExp[3].value = paramsAbtToExp[3].value == "" ? null : paramsAbtToExp[3].value;
          paramsAbtToExp[4].value = paramsAbtToExp[4].value == "" ? null : paramsAbtToExp[4].value;
          paramsAbtToExp[5].value = paramsAbtToExp[5].value == "" ? null : paramsAbtToExp[5].value;
          /** End Narrow Search */
          let requestParam = {
            'start': 0,
            'length': this.dataTableService.totalRecords_claimAboutToExpire
          };
          if (paramsAbtToExp.length > 0) {
            for (let i = 0; i < paramsAbtToExp.length; i++) {
              const element: any = paramsAbtToExp[i];
              if (element.value) {
                requestParam[element.key] = element.value;
              }
            }
            if (this.dataTableService.totalRecords_claimAboutToExpire > this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else if (this.dataTableService.totalRecords_claimAboutToExpire > this.CurrentUserService.minLengthForExcel && this.dataTableService.totalRecords_claimAboutToExpire <= this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else {
              this.exportFile(URL, requestParam);
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
          break;
        }
      case 'uftDashboard_notificationAction':
        this.fileName = "Pending Claims List "
        if (this.dataTableService.totalRecords_notificationAction != undefined) {
          var URL = UftApi.pendingClaimsListExcel;
          var obj = { key: '', value: '' };
          var paramsNotAction = this.dataTableService.getFooterParamsCompanySearchTable(table, obj);
          paramsNotAction[0].value = paramsNotAction[0].value == "" ? "" : paramsNotAction[0].value;
          paramsNotAction[1].value = paramsNotAction[1].value == "" ? null : paramsNotAction[1].value;
          paramsNotAction[2].value = paramsNotAction[2].value == "" ? null : paramsNotAction[2].value;
          paramsNotAction[3].value = paramsNotAction[3].value == "" ? null : paramsNotAction[3].value;
          paramsNotAction[4].value = paramsNotAction[4].value == "" ? null : paramsNotAction[4].value;
          paramsNotAction[5].value = paramsNotAction[5].value == "" ? null : paramsNotAction[5].value;
          paramsNotAction[6].value = paramsNotAction[6].value == "" ? null : paramsNotAction[6].value;
          paramsNotAction[7].value = paramsNotAction[7].value == "" ? null : paramsNotAction[7].value;
          paramsNotAction[8].value = paramsNotAction[8].value == "" ? null : paramsNotAction[8].value;
          /** End Narrow Search */
          let requestParam = {
            'start': 0,
            'length': this.dataTableService.totalRecords_notificationAction,
            'coKey': this.lastSelectedCokey,
            'claimStatusCd': this.lastSelectedclaimStatusCd,
          };
          if (paramsNotAction.length > 0) {
            for (let i = 0; i < paramsNotAction.length; i++) {
              const element: any = paramsNotAction[i];
              if (element.value) {
                requestParam[element.key] = element.value;
              }
            }
            if (this.dataTableService.totalRecords_notificationAction > this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else if (this.dataTableService.totalRecords_notificationAction > this.CurrentUserService.minLengthForExcel && this.dataTableService.totalRecords_notificationAction <= this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else {
              this.exportFile(URL, requestParam);
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
          break;

        }
      case 'uftDashboard_releaseClaimsAction':
        this.fileName = "Release Claims Action List "

        if (this.dataTableService.totalRecords_releaseClaimsAtion != undefined) {
          var URL = UftApi.releasePfClaimsActionExcelUrl;
          var obj = { key: '', value: '' };
          let params = this.lastRequstReleseClaim
          let requestParam = {
            'start': 0,
            'length': this.dataTableService.totalRecords_releaseClaimsAtion
          };
          if (params.length > 0) {
            for (let i = 0; i < params.length; i++) {
              const element: any = params[i];
              if (element.value) {
                requestParam[element.key] = element.value;
              }
            }
            if (this.dataTableService.totalRecords_releaseClaimsAtion > this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else if (this.dataTableService.totalRecords_releaseClaimsAtion > this.CurrentUserService.minLengthForExcel && this.dataTableService.totalRecords_releaseClaimsAtion <= this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else {
              this.exportFile(URL, requestParam);
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
          break;
        }
      case 'uftDashboard_releaseClaimsAction_Expire':
        if (this.dataTableService.totalRecords_notificationAction_Expire != undefined) {
          var URL = UftApi.releasePfClaimsActionAtExpExcelUrl;
          this.fileName = "Pending Claims Company List EB/OCL Claim About To Expire "
          var obj = { key: 'searchType', value: 'l' };
          let params = this.lastRequstEbOclClaim;
          let requestParam = {
            'start': 0,
            'length': this.dataTableService.totalRecords_notificationAction_Expire,
            'coKey': this.lastSelectedCokey
          };
          /** End Narrow Search */
          if (this.lastSelected == 'B') {
            requestParam['claimStatusCd'] = 'B';
          } else if (this.lastSelected == 'C') {
            requestParam['claimStatusCd'] = 'C';
          }
          if (params.length > 0) {
            for (let i = 0; i < params.length; i++) {
              const element: any = params[i];
              requestParam[element.key] = element.value;
            }
            if (this.dataTableService.totalRecords_notificationAction_Expire > this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else if (this.dataTableService.totalRecords_notificationAction_Expire > this.CurrentUserService.minLengthForExcel && this.dataTableService.totalRecords_notificationAction_Expire <= this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else {
              this.exportFile(URL, requestParam);
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        }
        break;
    }
  }

  /**
   * Export excel for reports
   * @param URL 
   * @param reqParamPlan 
   */
  exportFile(URL, reqParamPlan) {
    this.showLoader = true
    this.hmsDataService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showLoader = false;
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
          this.reportPopUpTitle = this.fileName
          a.download = this.reportPopUpTitle.replace(/\s+/g, '_');
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
        this.showLoader = false;
        this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    })
  }

  adjudicateClaim(rowData, tableId) {
    var type = rowData.disciplineKey
    let submitType = ""
    submitType = this.claimService.getSubmitParam(type)
    let submitInfo = {
      "businessTypeCd": rowData.businessTypeCd,
      "cardholderKey": rowData.cardHolderKey,
      "dtOfBirth": rowData.cardHolderDOB,
    }
    submitInfo[submitType] = {
      "claimKey": rowData.claimKey,
    }
    if (rowData.claimStatusCd == 'B') {
      this.hmsDataService.postApi(ClaimApi.ebApprovedClaimsUrl, submitInfo).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.toastrService.success(this.translate.instant('uft.toaster.claimAdjudicatedSuccess'))
          this.getResultForEbAndOclClaim(rowData, tableId)
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == 'CLAIM_IS_NOT_AJUDICATED') {
          if (data.result) {
            this.toastrService.error(data.result)
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.claimNotAdjudicated'))
          }
        } else if (data.code == 400 && data.hmsMessage.messageShort == 'CLAIM_IS_NOT_RELEASED') {
          if (data.result) {
            this.toastrService.error(data.result)
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.claimNotAdjudicated'))
          }
        } else if (data.code == 400 && data.hmsMessage.messageShort == 'CLAIM_NOT_FOUND') {
          this.toastrService.error('Claim Not Found')
        } else if (data.code == 400 && data.hmsMessage.messageShort == 'DOB_DOES_NOT_EXIST') {
          this.toastrService.error("Claim is now adjudicated and rejected because CardHolder Entered DOB doesn't Exist in system")
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.claimNotAdjudicated'))
        }
      }, (error) => {
        this.toastrService.error(this.translate.instant('uft.toaster.claimNotAdjudicated'))
      })
    } else {
      this.hmsDataService.postApi(ClaimApi.adjudicateClaim, submitInfo).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.toastrService.success(this.translate.instant('uft.toaster.claimAdjudicatedSuccess'))
        }
        this.getResultForEbAndOclClaim(rowData, tableId)
      }, (error) => {
        this.getResultForEbAndOclClaim(rowData, tableId)
      })
    }
  }

  getSubmitParam(disciplineType) {
    if (disciplineType) {
      switch (disciplineType.toString()) {
        case '1':
          return "dentalClaim"
        case '2':
          return "visionClaim"
        case '3':
          return "healthClaim"
        case '4':
          return "drugClaim"
        case '5':
          return "hsaClaim"
        case '6':
          return "wellnessClaim"
      }
    }
  }

  getResultForEbAndOclClaim(dataRow, tableId) {
    var selectedCokey = dataRow.coKey
    var selectedclaimStatusCd = dataRow.claimStatusCd
    let url = dataRow.claimStatusCd == 'B' ? UftApi.releaseClaimsEb : UftApi.releaseClaimsOcl
    let releaseClaimsOclSubmitInfo = {
      "pdiscipline": dataRow.pdiscipline,
      "claimKey": dataRow.claimKey
    }
    let releaseClaimsEbSubmitInfo = {
      "pdiscipline": dataRow.pdiscipline,
      "claimKey": dataRow.claimKey,
      "mailOutKey": this.dataTableService.mailOutKey
    }
    let claimStatusCd = dataRow.claimStatusCd
    let submitInfo = dataRow.claimStatusCd == 'B' ? releaseClaimsEbSubmitInfo : releaseClaimsOclSubmitInfo
    this.hmsDataService.postApi(url, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (tableId == "uftDashboard_releaseClaimsAction") {
          this.releaseClaimsActionList(dataRow)
        }
        if (tableId == "uftDashboard_notificationAction") {
          this.notificationActionList(selectedCokey, selectedclaimStatusCd)
        }
        if (tableId == "uftDashboard_releaseClaimsAction_Expire") {
          this.releaseClaimsActionList_Expire({ 'coKey': selectedCokey, 'claimStatusCd': selectedclaimStatusCd })
        }
        if (claimStatusCd == 'B') {
          this.toastrService.success(this.translate.instant('uft.toaster.claimReleasedSuccess'))
          if (tableId == "uftDashboard_notificationAction") {
            this.openPdfAfterRelease(claimStatusCd)
          }
        } else {
          if (claimStatusCd == 'C') {
            this.toastrService.success(this.translate.instant('uft.toaster.claimReleasedSuccess'))
            if (tableId == "uftDashboard_notificationAction") {
              this.openPdfAfterRelease(claimStatusCd)
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.claimNotReleased'))
          }
        }
      } else if (data.code == 400 && data.status === "BAD_REQUEST") {
        this.toastrService.error(data.hmsMessage.messageShort)
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.claimNotReleased'))
      }
    }, (error) => {
      this.toastrService.error(this.translate.instant('uft.toaster.claimNotReleased'))
    })
  }

  /* #1145 - Final Notice Columns Initialization(20-Jun-2023) */
  finalNoticeTableInititalization() {
    this.observableFinalNoticeObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.finalListColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
          { title: "Claim Status", data: 'claimStatusDesc' }
        ]
        this.observableFinalNoticeObj.unsubscribe();
      }
    });
  }

  finalNoticeList() {
    var reqParam = []
    var tableId = "finalNoticeList"
    var url = UftApi.pfOclExbFnCmpyUrl;
    if (!$.fn.dataTable.isDataTable('#finalNoticeList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.finalListColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', '', '', '', [1, 2, 3, 4, 5], [6], '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  filterFinalNoticeList(tableId: string) {
    var URL = UftApi.pfOclExbFnCmpyUrl;
    var obj = { key: 'searchType', value: 'l' };
    var noticeListParams = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    noticeListParams[0].value = noticeListParams[0].value == "" ? "" : noticeListParams[0].value;
    noticeListParams[1].value = noticeListParams[1].value == "" ? null : noticeListParams[1].value;
    noticeListParams[2].value = noticeListParams[2].value == "" ? null : noticeListParams[2].value;
    noticeListParams[3].value = noticeListParams[3].value == "" ? null : noticeListParams[3].value;
    noticeListParams[4].value = noticeListParams[4].value == "" ? null : noticeListParams[4].value;
    noticeListParams[5].value = noticeListParams[5].value == "" ? null : noticeListParams[5].value;
    this.dataTableService.jqueryDataTableReload(tableId, URL, noticeListParams)
  }

  resetFinalNoticeList(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterFinalNoticeList(tableId);
  }

  /* #1145 - Expire button Columns Initialization(20-Jun-2023) */
  expireTableInititalization() {
    this.observableExpireClaimObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.expireListColumns = [
          { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), data: 'coDesc' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), data: 'companyBalance' },
          { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), data: 'paidAmt' },
          { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), data: 'pendingFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), data: 'creditLimitMultiplier' },
          { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), data: 'availFund' },
          { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), data: 'claimStatusDesc' }
        ]
        this.observableExpireClaimObj.unsubscribe();
      }
    });
  }

  expireClaimList() {
    var reqParam = []
    var url = UftApi.getAboutToExpirePfNotificationUrl;
    var tableId = "expireClaimList"
    if (!$.fn.dataTable.isDataTable('#expireClaimList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.expireListColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', '', '', [1, 2, 3, 4, 5], [6], '', 0)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
  }

  filterExpireClaimList(tableId: string) {
    var URL = UftApi.getAboutToExpirePfNotificationUrl;
    var obj = { key: 'searchType', value: 'l' };
    var paramsAbtExp = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj)
    paramsAbtExp[0].value = paramsAbtExp[0].value == "" ? "" : paramsAbtExp[0].value;
    paramsAbtExp[1].value = paramsAbtExp[1].value == "" ? null : paramsAbtExp[1].value;
    paramsAbtExp[2].value = paramsAbtExp[2].value == "" ? null : paramsAbtExp[2].value;
    paramsAbtExp[3].value = paramsAbtExp[3].value == "" ? null : paramsAbtExp[3].value;
    paramsAbtExp[4].value = paramsAbtExp[4].value == "" ? null : paramsAbtExp[4].value;
    paramsAbtExp[5].value = paramsAbtExp[5].value == "" ? null : paramsAbtExp[5].value;
    this.dataTableService.jqueryDataTableReload(tableId, URL, paramsAbtExp)
  }

  resetExpireClaimList(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterExpireClaimList(tableId);
  }

  onDemandList(tableId) {
    this.toastrService.warning('This functionality to be implemented!!')
  }

  /* #1145 -  Final Notice and Expire button export functionality for PDF */
  downloadFinalNoticeAndExpirePdfReport(tableId, type = null) {
    let reqParamPdf = {};
    this.showLoader = true;
    let isRcal = 0;
    let headerHeading
    var url
    let length
    if (tableId == 'finalNoticeList') {
      isRcal = 1
      headerHeading = "Final Notice List (Notification Generated) ";
      length = this.dataTableService.totalRecords_FinalNoticeList;
      url = UftApi.pfOclExbFnCmpyUrl;
    } else if (tableId == 'expireClaimList') {
      isRcal = 2
      headerHeading = "EB/OCL Claim About To Expire List ";
      length = this.dataTableService.totalRecords_expireClaimList;
      url = UftApi.getAboutToExpirePfNotificationUrl;
    }
    var obj = { key: '', value: '' };
    var pdfReportParams = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj);
    pdfReportParams[0].value = pdfReportParams[0].value == "" ? "" : pdfReportParams[0].value;
    pdfReportParams[1].value = pdfReportParams[1].value == "" ? null : pdfReportParams[1].value;
    pdfReportParams[2].value = pdfReportParams[2].value == "" ? null : pdfReportParams[2].value;
    pdfReportParams[3].value = pdfReportParams[3].value == "" ? null : pdfReportParams[3].value;
    pdfReportParams[4].value = pdfReportParams[4].value == "" ? null : pdfReportParams[4].value;
    pdfReportParams[5].value = pdfReportParams[5].value == "" ? null : pdfReportParams[5].value;
    reqParamPdf = {
      'start': 0,
      'length': length
    }
    if (isRcal == 1 || isRcal == 2) {
      if (this.claimStatus == undefined || this.claimStatus == null) {
        this.claimStatus = ""
      }
      reqParamPdf['claimStatusCd'] = this.claimStatus;
    }
    if (this.claimStatus == 'B' && (tableId == 'finalNoticeList' || tableId == 'expireClaimList')) {
      reqParamPdf['claimStatusCd'] = 'B'
    } else if (this.claimStatus == 'C' && (tableId == 'finalNoticeList' || tableId == 'expireClaimList')) {
      reqParamPdf['claimStatusCd'] = 'C'
    }
    if (pdfReportParams.length > 0) {
      for (let i = 0; i < pdfReportParams.length; i++) {
        const element: any = pdfReportParams[i];
        if (element.value) {
          reqParamPdf[element.key] = element.value;
        }
      }
    }
    this.hmsDataService.postApi(url, reqParamPdf).subscribe(data => {
      this.showLoader = true;
      if (data.code == 200 && data.status == 'OK') {
        var doc = new jsPDF('p', 'pt', 'a3');
        this.showLoader = false;
        if (isRcal == 1 || isRcal == 2) {
          var finalNoticeColumns = [
            { title: this.translate.instant('uft.dashboard.pending-funds.companyNoName'), dataKey: 'coName' },
            { title: this.translate.instant('uft.dashboard.pending-funds.companyBalanceAmount'), dataKey: 'companyBalance' },
            { title: this.translate.instant('uft.dashboard.pending-funds.paidAmount'), dataKey: 'paidAmt' },
            { title: this.translate.instant('uft.dashboard.pending-funds.pendingClaimsAmount'), dataKey: 'pendingFund' },
            { title: this.translate.instant('uft.dashboard.pending-funds.companyCreditLimit'), dataKey: 'creditLimitMultiplier' },
            { title: this.translate.instant('uft.dashboard.pending-funds.availableBalance'), dataKey: 'availFund' },
            { title: this.translate.instant('uft.dashboard.pending-funds.claimStatus'), dataKey: 'claimStatusDesc' },
          ];
        }
        var rows = data.result.data;
        var headerobject = [];
        headerobject.push({
          'gridHeader1': headerHeading
        });
        this.pdfHeader(doc, headerobject);
        let columns
        if (isRcal == 1 || isRcal == 2) {
          columns = finalNoticeColumns
        }
        doc.autoTable(columns, rows, {
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [215, 214, 213],
            lineWidth: 1,
          },
          columnStyles: {
            'coName': { halign: 'left' },
            'companyBalance': { halign: 'right' },
            'paidAmt': { halign: 'right' },
            'pendingFund': { halign: 'right' },
            'creditLimitMultiplier': { halign: 'right' },
            'availFund': { halign: 'right' },
            'claimStatusDesc': { halign: 'right' }
          },
          didParseCell: function (data) {
            if (data.section == 'head' && data.column.index != 0) {
            }
          },
          startY: 100,
          startX: 40,
          theme: 'grid',
        });
        for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
          doc.setPage(i); // Switch to the current page
          this.pdfFooter(doc, this.reportID);
        }
        let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        doc.save(headerHeading.split(' ').join('_') + '_' + todayDate + '.pdf');
      }
      this.showLoader = false;
    })
  }

  /* #1145 -  Final Notice Export functionality for PDF */
  exportFinalNoticeAndExpireExcel(tableId) {
    switch (tableId) {
      case 'finalNoticeList':
        this.fileName = "Final Notice List (Notification Generated)";
        if (this.dataTableService.totalRecords_FinalNoticeList != undefined) {
          var URL = UftApi.notificationGenFnExcelUrl;
          var obj = { key: 'searchType', value: 'l' };
          var excelParams = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj);
          excelParams[0].value = excelParams[0].value == "" ? "" : excelParams[0].value;
          excelParams[1].value = excelParams[1].value == "" ? null : excelParams[1].value;
          excelParams[2].value = excelParams[2].value == "" ? null : excelParams[2].value;
          excelParams[3].value = excelParams[3].value == "" ? null : excelParams[3].value;
          excelParams[4].value = excelParams[4].value == "" ? null : excelParams[4].value;
          excelParams[5].value = excelParams[5].value == "" ? null : excelParams[5].value;
          excelParams[6].value = excelParams[6].value == "" ? null : excelParams[6].value;
          /** End Narrow Search */
          let requestParam = {
            'start': 0,
            'length': this.dataTableService.totalRecords_FinalNoticeList
          };
          if (excelParams.length > 0) {
            for (let i = 0; i < excelParams.length; i++) {
              const element: any = excelParams[i];
              requestParam[element.key] = element.value;
            }
            if (this.dataTableService.totalRecords_FinalNoticeList > this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else if (this.dataTableService.totalRecords_FinalNoticeList > this.CurrentUserService.minLengthForExcel && this.dataTableService.totalRecords_FinalNoticeList <= this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else {
              this.exportFile(URL, requestParam);
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        }
        break;
      case 'expireClaimList':
        this.fileName = "EB/OCL Claim About To Expire List "
        if (this.dataTableService.totalRecords_expireClaimList != undefined) {
          var URL = UftApi.PfAboutToExpExcel;
          var obj = { key: 'searchType', value: '1' };
          var paramsAbtToExp = this.dataTableService.getFooterParamsCompanySearchTable(tableId, obj);
          paramsAbtToExp[0].value = paramsAbtToExp[0].value == "" ? "" : paramsAbtToExp[0].value;
          paramsAbtToExp[1].value = paramsAbtToExp[1].value == "" ? null : paramsAbtToExp[1].value;
          paramsAbtToExp[2].value = paramsAbtToExp[2].value == "" ? null : paramsAbtToExp[2].value;
          paramsAbtToExp[3].value = paramsAbtToExp[3].value == "" ? null : paramsAbtToExp[3].value;
          paramsAbtToExp[4].value = paramsAbtToExp[4].value == "" ? null : paramsAbtToExp[4].value;
          paramsAbtToExp[5].value = paramsAbtToExp[5].value == "" ? null : paramsAbtToExp[5].value;
          let requestParam = {
            'start': 0,
            'length': this.dataTableService.totalRecords_expireClaimList
          };
          if (paramsAbtToExp.length > 0) {
            for (let i = 0; i < paramsAbtToExp.length; i++) {
              const element: any = paramsAbtToExp[i];
              if (element.value) {
                requestParam[element.key] = element.value;
              }
            }
            if (this.dataTableService.totalRecords_expireClaimList > this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else if (this.dataTableService.totalRecords_expireClaimList > this.CurrentUserService.minLengthForExcel && this.dataTableService.totalRecords_expireClaimList <= this.CurrentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam);
                }
              });
            } else {
              this.exportFile(URL, requestParam);
            }
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        }
        break;
    }
  }

}