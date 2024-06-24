import { Component, OnInit, ViewChild, Output, EventEmitter, } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UftApi } from '../../uft-api';
import { TranslateService } from '@ngx-translate/core';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { ClaimService } from '../../../claim-module/claim.service';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Constants } from '../../../common-module/Constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
declare var jsPDF: any;
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { debug } from 'util';
import { FilesApi } from '../../../files-module/files-api';
import { FinanceService } from '../../../finance-module/finance.service';

@Component({
  selector: 'app-finance-report-list',
  templateUrl: './finance-report-list.component.html',
  styleUrls: ['./finance-report-list.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService]
})
export class FinanceReportListComponent implements OnInit {

  public isOpen: boolean = false;
  uftReqDataArray: any;
  payableReportColumns:any = [];
  hmsPayRptKey: any;
  showReportsSubscription: any;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  selectedCompanyStatus: any;
  companyStatusList: any;
  public companyStatusData: CompleterData;
  selectedUFT: any;
  uftList: any;
  public uftData: CompleterData;
  selectedBusinessTypeCd: any;
  businessTypeList: any;
  public businessTypeData: CompleterData;
  observablePayableReportObj;
  selectedProvinceKey: any;
  provinceList: any;
  public provinceData: CompleterData;
  selectedClaimStatusType = [];
  claimStatusList = [];
  claimStatus = []
  expired
  showPageLoader: boolean = false;
  public companyDataRemote: RemoteData;
  currentUser: any;
  showReportList: boolean = false; //Enable true when we need to show report list in the popup
  showHideFilter: boolean = true;
  showHideNoDataFound: boolean = false;
  reportsListColumns = [];
  ObservableReportsListObj;
  public filterReport: FormGroup; // change private to public for production-errors
  public createLetterForm: FormGroup; // change private to public for production-errors
  reportID: Number;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  showFilterFields = [];
  error: { isError: boolean; errorMessage: string; };
  filterColoumn = [];
  selecteCoID: any;
  companyNameText = '';
  transactionTypeList = [];
  reportPopUpTitle: string = 'Reports';
  reportListShowHide: boolean;
  dropdownSettings: {};
  selectedTransactionType = [];
  transactionType = []
  selectedReportRowData: any;
  selecteCoName: any;
  selecteCoKey: any;
  selectedCompany: any;
  tableId: string = 'fundingSummary';
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  selectedBrokerId: any;
  showHideReportGrid: boolean = false
  dateNameArray = {}
  getForApi : boolean = false // for api
  getReports : boolean = false
  @Output() openReportWithReportId = new EventEmitter();
  public brokerNameNoRemoteData: RemoteData;
  observableObj;
  check = true
  columns = []
  filesArray =  [{
    "viewFile": 'F',
    "deleteFile": 'F',
    "downloadFile": 'F'
  }]
  fileConfigKey;
  hiddenBtn: boolean = false;
  constructor(
    private translate: TranslateService,
    public dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private router: Router,
    private claimService: ClaimService,
    private currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private completerService: CompleterService,
    private exDialog: ExDialog,
    private financeService: FinanceService
  ) {
    this.dataTableInitializePayableReportList();
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
  
  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['FLL']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['FLL']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
      })
    }
    this.showReportsSubscription = this.financeService.showReportsEmitter.subscribe(val =>{
      this.getForApi = val;
      if (this.getForApi) {
        this.getReports = true;
        this.reportsListDataTableInitialize();
        }
      })
    //end
    var self = this
    $(document).on('click', '#reportsList > tbody > tr', function (e) {
      var selectedReportRow = self.dataTableService.reportsSelectedRowData
      self.selectedReportRowData = self.dataTableService.reportsSelectedRowData;
      self.openSelectedReportPopup(selectedReportRow);
    })
  }

 ngOnDestroy(){     
  // When we click on any section from Finance dashboard, and when we come to finance dashboard again, the tab report popup does not open
    this.showReportsSubscription.unsubscribe();
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
    $(document).on('click', '#bankFilesList .history-ico', function () {
      $("#hiddenFileHistBtn").trigger('click');
      var fileConfigKey = $(this).data('id');
      self.fileConfigKey = $(this).data('id');
      self.getBankFilesListHistory(fileConfigKey);
    });
    $(document).on('click', '#bankFilesList .del-ico', function () {
      var id = $(this).data('id');
      self.deleteBankFile(id)
    });
    $(document).on('click', '#bankFilesList .download-ico', function () {
      var selectedFileRow = self.dataTableService.filesSelectedRowData
      if (selectedFileRow.filePath && selectedFileRow.filePath != undefined) {
        window.open(selectedFileRow.filePath, '_blank');
      }
    });
    $(document).on('click', '#payableReportList_finance .download-ico', function () {
      let hmsRptKey = $(this).data('id');
      self.hmsPayRptKey = hmsRptKey
      self.getGeneratePayableRptZip(self.hmsPayRptKey)
    })
  }

  /**
  * Initialize the reports list columns and get the reports list 
  */
  reportsListDataTableInitialize() {
    this.reportListShowHide = true;
    this.ObservableReportsListObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.reportsListColumns = [
          { title: this.translate.instant('uft.dashboard.financeReports.reportName'), data: 'reportname' },
          { title: this.translate.instant('uft.dashboard.financeReports.reportNumber'), data: 'reportnumber' },
        ] //reportdesc
        this.ObservableReportsListObj.unsubscribe();
        if(this.getReports){
        this.getReportsList()
        }
      }
    });
  }

  /**
   * Get Reports List
   */
  getReportsList() {
    var reqParam = []
    var url = UftApi.reportList;
    var tableId = "reportsList"
    if (!$.fn.dataTable.isDataTable('#reportsList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.reportsListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', "", 7, '', [1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      this.getReports = false;
    }
    return false;
  }

  payableReports_finance(){
    this.getPayableReportList()
  }
  getPayableReportList() {
    var reqParam = [
      { 'key': 'paramName', 'value': '' },
      { 'key': 'paramType', 'value': '' },
      { 'key': 'paramIssuedDate', 'value': '' },
      { 'key': 'paramModule', 'value': '' }
    ]
    var url = UftApi.getPayableRptUrl
    var tableId = "payableReportList_finance"
    var tableActions = [
      { 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': '' },
    ];
    this.payableReportColumns = [
      { title: 'Name', data: 'paramName' },
      { title: 'Type', data: 'paramType' },
      { title: 'Issued Date', data: 'paramIssuedDate' },
      { title: 'Action', data: 'hmsPayRptKey' },
    ]
    if (!$.fn.dataTable.isDataTable('#payableReportList_finance')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.payableReportColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, [3], [2], '', '', [1, 2, 3], '', [0])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }
  /**
   * open report popup
   * @param selectedReportRow 
   */
  openSelectedReportPopup(selectedReportRow) {
    let formData = ''
    if (selectedReportRow != undefined) {
      this.reportID = selectedReportRow.reportid;
      if (this.reportID == 23) {
        this.reportID = -23;
      }
      this.callReportWithReportId(this.reportID)
    }
  }

  callReportWithReportId(reportID) {
    this.openReportWithReportId.next(reportID)
  }
  searchPayableReport(tableId: string) {
    var params = this.dataTableService.getFooterParams("payableReportList_finance")
    var dateParams = [2]
    var URL = UftApi.getPayableRptUrl
    this.dataTableService.jqueryDataTableReload("payableReportList_finance", URL, params, dateParams)
  }

  resetPayableReport() {
    this.dataTableService.resetTableSearch();
    this.searchPayableReport("payableReportList_finance")
    $('#payableReportList_finance .icon-mydpremove').trigger('click');
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

  getAuthCheck(fileChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.filesArray = [{
        "viewFile": 'T',
        "deleteFile": 'T',
        "downloadFile": 'T'
      }]
    } else {
      for (var i = 0; i < fileChecks.length; i++) {
        authCheck[fileChecks[i].actionObjectDataTag] = fileChecks[i].actionAccess
      }
      this.filesArray = [{
        "viewFile": authCheck['FLL369'],
        "deleteFile": authCheck['FLL370'],
        "downloadFile": authCheck['FLL371']
      }]
    }
    return this.filesArray
  }

  dataTableInitialize() {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('admin.adminRate.planType') == 'admin.adminRate.planType') {
        } else {
          this.columns = [
            { title: "File Name", data: 'fileName' },
            { title: "File Type", data: 'fileType' },
            { title: "Action", data: 'fileConfigKey' }
          ]
          this.getFilesList();
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
  }

  getFilesList() {
    var reqParam = [
      {'key':'fileType', 'value': "BANK_RECON_CHEQUE_REPORT"}
    ]
    var url = FilesApi.getExcelReportsList;
    var tableId = "bankFilesList"
    if (!$.fn.dataTable.isDataTable('#bankFilesList')) {
      var tableActions = [
        { 'name': 'history', 'class': 'table-action-btn history-ico', 'icon_class': 'fa fa-history', 'title': 'History', 'showAction': this.filesArray[0].viewFile },
        { 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': this.filesArray[0].downloadFile },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': this.filesArray[0].deleteFile },
      ]
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], null, reqParam, tableActions, 2, null, "AddNewAdminInfo", null, [1, 2])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  getBankFilesListHistory(fileConfigKey) {
    var fileHistoryColumns = [
      { title: "File Name", data: 'fileName' },
      { title: "File Type", data: 'fileType' },
      { title: "Action", data: 'hmsFileConfigHistoryKey' }
    ]
    var reqParam = [
      { 'key': 'fileConfigKey', 'value': fileConfigKey }
    ]
    var url = FilesApi.getExcelReportsHistoryList;
    var tableId = "bankFileHistoryList"
    if (!$.fn.dataTable.isDataTable('#bankFileHistoryList')) {
      var tableActions = [
        { 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': '' },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
      ]
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', fileHistoryColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 2,null, "", null, [1, 2])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  deleteBankFile(id) {
    this.exDialog.openConfirm("Are you sure you want to delete file?").subscribe((value) => {
      if (value) {
        let RequestData = {
          "fileConfigKey": id
        }
        this.hmsDataService.postApi(FilesApi.deleteExcelBasedOnKey, RequestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success("File Deleted Successfully!!")
            this.getFilesList();
          }
        })
      }
    });
  }
}
