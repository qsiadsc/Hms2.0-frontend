import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { RequestOptions, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { DataManagementDashboardApi } from '../data-management-dashboard-api'
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { debug } from 'util';
import { trigger } from '@angular/core/src/animation/dsl';
import { DomSanitizer } from "@angular/platform-browser";
import { QsiLoaderReportApi } from './../../qsi-loader-report-module/qsi-loader-report-api';
import { CommonDatePickerOptions } from '../../common-module/Constants';

@Component({
  selector: 'app-claim-secure',
  templateUrl: './claim-secure.component.html',
  styleUrls: ['./claim-secure.component.css'],
  providers: [DatatableService, ChangeDateFormatService, ToastrService]
})
export class ClaimSecureComponent implements OnInit {
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  qsiFormClaimSecure: FormGroup;
  selectedName: any;
  selectedFile: any;
  allowedType: string;
  fileType: any;
  columns = [];
  tableActions;
  expired:any
  ObservableClaimObj: any;
  showLoader: boolean = false;
  checkServiceProvider: boolean = true
  imagePath: any;
  fileTypeKey: any;
  showLoadingText: boolean = false;
  showSeachFilesListing: boolean = false;
  claimSecureForm: FormGroup;
  msg = [];
  docName;
  showLoadDailyMsgs: boolean = false;
  showLoadDailyMsgsLoad: boolean = false;

  filePath: any;
  fileName: any;
  preMsg: any[];
  ShowPdf: boolean;
  pdffile: any;
  preShowLoadDailyMsgs: boolean;
  showExpenseFiles: boolean;
  posFile: any;
  negFile: any;
  shouldProcessUnProcessedData: boolean;
  fileTypeColumns = [];
  ObservableFileTypeObj: any;
  dataArray = [{
    "viewData": 'F',
  }];
  currentUser: any;
  dateNameArray = {};
  constructor(private dataTableService: DatatableService,
    private exDialog: ExDialog,
    private changeDateFormatService: ChangeDateFormatService,
    private ToastrService: ToastrService,
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private domSanitizer: DomSanitizer,

  ) { }

  ngOnInit() {
    this.claimSecureForm = new FormGroup({
      fileType: new FormControl('', [Validators.required])
    })
    this.qsiFormClaimSecure = new FormGroup({
      'fileType': new FormControl(),
      'unprocessedType': new FormControl()
    });
    this.qsiFormClaimSecure.patchValue({ 'fileType': 'P', 'unprocessedType': 'all' });
    this.dataTableInitialize();
    this.getFileTypeList();
    var self = this
    $(document).on('click', '#search-claimSearchFiles-table .download-ico', function () {
      var selectedFileRow = self.dataTableService.filesSelectedRowData
      if (selectedFileRow.downloadPath && selectedFileRow.downloadPath != undefined) {
        window.open(selectedFileRow.downloadPath, '_blank');
      }
    });
    setTimeout(() => {
      this.searchClaimFiles();

    }, 500);
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DTA']
        this.getAuthCheck(checkArray)
        this.dataTableInitializeFileType();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DTA']
        this.getAuthCheck(checkArray)
        this.dataTableInitializeFileType();
      })
    }
  }
  onChangeFileType(event) {
    this.qsiFormClaimSecure.get("unprocessedType").setValue("all");
    $("#unprocessform").trigger("reset");
    this.shouldProcessUnProcessedData = true;
    this.fileTypeList();
  }
  filterFileTypeListClaimSecure(tableId: string) {
    var params = this.dataTableService.getFooterParams("file_type_datatable_claim_secure")
    var dateParams = [2, 3]
    var URL = QsiLoaderReportApi.getQsiReportFiles;
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' },
    { 'key': 'fillterSearch', 'value': this.qsiFormClaimSecure.get("fileType").value }]
    for (var i = 0; i < reqParam.length; i++) {
      params.push(reqParam[i])
    }

    this.dataTableService.jqueryDataTableReload("file_type_datatable_claim_secure", URL, params, dateParams)
  }

  resetListingFilter() {
    this.dataTableService.resetTableSearch();
    this.filterFileTypeListClaimSecure("file_type_datatable_claim_secure")
    $('#file_type_datatable_claim_secure .icon-mydpremove').trigger('click');
  }
  fileTypeList() {

    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' },
    { 'key': 'fillterSearch', 'value': this.qsiFormClaimSecure.get("fileType").value }]
    var url = QsiLoaderReportApi.getQsiReportFiles;
    var tableId = "file_type_datatable_claim_secure"
    if (!$.fn.dataTable.isDataTable('#file_type_datatable_claim_secure')) {

      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.fileTypeColumns, 25, true, true, 'lt', 'irp',
        undefined, [0, 'asc'], '',
        reqParam, "", '', [2, 3], this.dataArray[0].viewData, '', [1, 2, 3], '', '', '', '')
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam);
    }
  }

  dataTableInitializeFileType() {
    this.ObservableFileTypeObj = Observable.interval(1000).subscribe(x => {

      this.fileTypeColumns = [
        { title: "File Id", data: 'fileId' },
        { title: "File Name", data: 'fileName' },
        { title: 'Processed Date', data: 'processedDate' },

        { title: 'Paid Date', data: 'paidDate' }
      ]
      this.ObservableFileTypeObj.unsubscribe();
      this.fileTypeList();

    });
  }
  getAuthCheck(dataChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.dataArray = [{
        "viewData": 'T'
      }]
    } else {
      for (var i = 0; i < dataChecks.length; i++) {
        authCheck[dataChecks[i].actionObjectDataTag] = dataChecks[i].actionAccess
      }
      this.dataArray = [{
        "viewData": authCheck['DAT395']
      }]
    }
    return this.dataArray
  }
  /**
   * Change Date Picker For Date Picker
   * @param event 
   * @param frmControlName 
   */
  changeDateFormat1(event, frmControlName) {
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
    else if (event.reason == 1 && event.value != null && event.value != '') {
    }

  }


  getFileTypeList() {
    this.hmsDataService.getApi(DataManagementDashboardApi.getClaimSecureMasterDataUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.fileType = data.result;
      }
    }, (e) => {

    })
  }

  exportElig() {
    this.showExpenseFiles = false
    this.filePath = undefined;
    this.preMsg = [];
    this.preShowLoadDailyMsgs = false;
    this.msg = [];
    this.exDialog.openConfirm('Do you want to continue Export Eligible?').subscribe((value) => {
      if (value) {
        this.showLoader = true
        this.showLoadDailyMsgs = true
        this.showLoadDailyMsgsLoad = false

        this.msg.push('Please wait while system generates Eligible export data...')

        var url = DataManagementDashboardApi.exportQSIEligFileInsLogfile
        this.hmsDataService.getApi(url).subscribe(data => {
          this.showLoader = false
          if (data.code == 200 && data.status == "OK") {
            this.msg.push(data.hmsMessage.messageShort);
            if (data.result) {
              this.filePath = data.result.filePath
            }
          } else if (data.code == 400) {
            this.ToastrService.error(data.hmsMessage.messageShort);
          } else if (data.code == 404) {
            this.msg.push(data.hmsMessage.messageShort)
          }
        }, (e) => {
          this.showLoader = false
        })
      }
    });
  }

  loadDailyFile() {
    this.filePath = undefined
    this.msg = [];
    this.exDialog.openConfirm('Do you want to continue Loading Payments File?').subscribe((value) => {
      if (value) {
        this.showLoader = true
        var url = DataManagementDashboardApi.getQsiLoadDailyFile
        this.hmsDataService.getApi(url).subscribe(data => {
          this.showLoader = false
          if (data.code == 200 && data.status == "OK") {
            this.showLoader = false
            this.imagePath = data.result
          } else if (data.code == 400) {
            this.ToastrService.error(data.hmsMessage.messageShort);
          } else if (data.code == 404) {
            this.msg.push(data.hmsMessage.messageShort)
          }
        }, (e) => {
          this.showLoader = false
        })
      }
    });
  }

  getReport(myModal) {
    this.showExpenseFiles = false;
    this.preMsg = [];
    this.preShowLoadDailyMsgs = true;
    this.pdffile = '';
    this.ShowPdf = false;
    this.showLoader = true
    this.preMsg.push('Checking if any unloaded error claim exists or not...')
    var url = DataManagementDashboardApi.getCsQsiLoadDrugReport
    
    this.hmsDataService.getApi(url).subscribe(data => {
      this.showLoader = false
      if (data.code == 200) {
        this.ShowPdf = true;
        this.pdffile = data.result;
        $('#lPfile').trigger('click')
      } else {
        this.preMsg.push('Something went wrong !!')
      }
    }, (e) => {
      this.showLoader = false
    })
  }
  loadPaymentFile(myModal) {
    this.filePath = undefined
    this.msg = [];
    this.showLoadDailyMsgsLoad = false
    
    this.showLoader = true
    this.showLoadDailyMsgs = true;
    var url = DataManagementDashboardApi.getCsQsiLoadPaymentFile
    this.hmsDataService.getApi(url).subscribe(data => {
      this.showLoader = false
      if (data.code == 200 && data.status == "OK") {
        this.msg.push('File Generated Successfully...');
        var imagePath = data.result
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = imagePath;
        a.target = 'blank';
        this.msg.push('<a href="' + imagePath + '" target="blank">' + imagePath + '</a>') //File Path Print

        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(imagePath);
          document.body.removeChild(a);
        }, 0)
        this.showLoader = false
        this.exDialog.openConfirm('You have unfixed data. Do you process payment file?').subscribe((value) => {
          if (value) {
            $('#hidePaymentLoadFile').trigger('click')
          }
        })
      } else if (data.code == 400) {
        $('#hidePaymentLoadFile').trigger('click')
        this.ToastrService.error(data.hmsMessage.messageShort);
      } else if (data.code == 404) {
        $('#hidePaymentLoadFile').trigger('click')
        this.msg.push(data.hmsMessage.messageShort)
      }
    }, (e) => {
      this.showLoader = false
    })
  }

  exportExpense() {
    this.preMsg = [];
    this.preShowLoadDailyMsgs = false;
    this.showExpenseFiles = false
    this.filePath = undefined
    this.msg = [];
    let expenseData = {
      "currentDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
    }
    this.exDialog.openConfirm('Do you want to export expense file?').subscribe((value) => {
      if (value) {
        this.showExpenseFiles = false;
        this.showLoader = true
        this.showLoadDailyMsgs = true;
        this.showLoadDailyMsgsLoad = false;

        this.msg.push('Please wait while system generates expense export data...')
        var URL = DataManagementDashboardApi.exportQSIExpense;
        this.hmsDataService.post(URL, expenseData).subscribe(data => {
          this.showLoader = false
          if (data.code == 200 && data.status == "OK") {
            this.msg.push(data.hmsMessage.messageShort)
            this.showExpenseFiles = true;
            this.posFile = data.result.fullPathPositiveExpense;
            this.negFile = data.result.fullPathNegativeExpense;

          } else if (data.code == 400) {
            this.ToastrService.error(data.hmsMessage.messageShort);
            this.msg.push(data.hmsMessage.messageShort)
          } else if (data.code == 404) {
            this.msg.push(data.hmsMessage.messageShort)
          }
        }, (e) => {
          this.showLoader = false
        });
      }
    });
  }


  dailyPayment() {
    this.preMsg = [];
    this.preShowLoadDailyMsgs = false;
    this.showExpenseFiles = false
    this.filePath = undefined
    this.msg = [];
    let expenseData = {
      
    }
    this.exDialog.openConfirm('Do you want to run Daily Payment file?').subscribe((value) => {
      if (value) {
        this.showExpenseFiles = false;
        this.showLoader = true
        this.showLoadDailyMsgs = true;
        this.showLoadDailyMsgsLoad = false;
        this.msg.push('Please wait while system generates Daily Payment file data...');
        var URL = DataManagementDashboardApi.generateDailyTransaction;
        this.hmsDataService.post(URL, expenseData).subscribe(data => {
       
          this.showLoader = false
          if (data.code == 200 && data.status == "OK") {
            this.msg.push('Daily Payment Process Completed')
            this.showExpenseFiles = true;
            // getCsQsiDailyPaymentFile API 
            this.hmsDataService.getApi(DataManagementDashboardApi.getCsQsiDailyPaymentFileUrl).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                this.msg.push(data.result)
              } else {
                this.msg.push('Daily Payment File Report Not Generated!')
              }
            })
          }
          else if (data.code == 500 ) {
            this.msg.push(data.hmsMessage.messageShort) 
          }
          else if (data.code == 400) {
            this.ToastrService.error(data.hmsMessage.messageShort);
            this.msg.push(data.hmsMessage.messageShort) 
          } else if (data.code == 404) {
            this.msg.push(data.hmsMessage.messageShort)
          }
        }, (e) => {
          this.showLoader = false
        });
      }
    });
  }

  Close() {
    this.msg.push('Closed')
  }

  closeModal(myModal) {
    myModal.close();
  }

  onPaymentFileChanged(event) {
    this.filePath = undefined
    this.allowedType = "text/plain"
    this.selectedFile = event.target.files[0]
    var formData = new FormData()
    let header = new Headers({ 'Authorization': this.currentUserService.token });
    let options = new RequestOptions({ headers: header });
    this.msg.push('Please wait while system loading payment file ...')
    this.msg.push('Loading Payment file ' + this.selectedFile.name + '...');
    this.showLoader = true

    formData.append('files', this.selectedFile);
    if (this.allowedType == this.selectedFile.type) {
      let data;
      data = {
        "code": 200,
        "status": "BAD_REQUEST",
        "result": {
          "errorLog": "Line #81- ORA-01841: (full) year must be between -4713 and +9999, and not be 0\nORA-06512: at \"HMS.PKG_CS_QSI_LOADER_UTILS\", line 1823\nORA-06512: at line 1\n",
          "errorLogName": "Errors occurs while Loading Daily Data.",
          "errorLineNumber": 81
        },
        "hmsMessage": {
          "messageShort": "Errors occurs while Loading Daily Data."
        },
        "recordsTotal": 0,
        "recordsFiltered": 0,
        "totalClosingBal": 0.0
      }
      this.showLoader = false
      if (data.code == 200 && data.status == "OK") {
        this.showLoader = false
        this.showLoadDailyMsgs = true;
        this.showLoadDailyMsgsLoad = false;
        this.msg.push(data.hmsMessage.messageShort)
        this.fileName = data.result.fileName;
        this.ToastrService.success(data.hmsMessage.messageShort);
      }
      else if (data.code == 200 && data.status == "BAD_REQUEST") {
        this.showLoader = false
        this.showLoadDailyMsgs = true;
        this.showLoadDailyMsgsLoad = false;
        this.msg.push(data.result.errorLog);
        this.msg.push(data.result.errorLogName);
        this.ToastrService.warning(data.hmsMessage.messageShort);
      }
      else if (data.hmsMessage.messageShort == "INVALID_DATA") {
        this.filePath = undefined
        this.showLoader = false
        const url = data.result;
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fghfh_' + this.changeDateFormatService.getCurrentTimestamp(new Date());
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 0)
        this.ToastrService.error("INVALID DATA")
      } else if (data.code == 404 && data.status == "NOT_FOUND" && data.code == 400) {
        this.showLoader = false;
        this.filePath = undefined
        this.msg.push("Record Not Found")
      }
      else if (data.code == 400 && data.status == "BAD_REQUEST") {
        this.filePath = undefined
        this.showLoader = false
        this.showLoadDailyMsgs = false;
        this.showLoadDailyMsgsLoad = true;
        this.msg.push(data.hmsMessage.messageShort)
        this.ToastrService.error(data.hmsMessage.messageShort)
      }
      
    }
    else {
      this.filePath = undefined
      this.showLoader = false
      this.msg.push("Only Text Files Are Allowed")
      this.ToastrService.error("Only Text Files Are Allowed")
    }
  }

  onFileChanged(event) {
    this.showExpenseFiles = false
    this.preMsg = [];
    this.preShowLoadDailyMsgs = false;
    this.filePath = undefined
    this.msg = [];
    this.allowedType = "text/plain"
    this.selectedFile = event.target.files[0]
    var formData = new FormData()
    let header = new Headers({ 'Authorization': this.currentUserService.token });
    let options = new RequestOptions({ headers: header });
    this.showLoader = true;
    this.msg.push('Loading Daily Files ...');
    formData.append('files', this.selectedFile);
    if (this.allowedType == this.selectedFile.type) {

      this.hmsDataService.sendFormData(DataManagementDashboardApi.getQsiLoadDailyFile, formData).subscribe(data => {
        this.showLoader = false
        if (data.code == 200 && data.status == "OK") {
          this.showLoader = false
          this.showLoadDailyMsgs = true;
          this.showLoadDailyMsgsLoad = false;
          this.msg.push(data.hmsMessage.messageShort)
          this.filePath = data.result.filePath;
          this.fileName = data.result.fileName;
          this.ToastrService.success(data.hmsMessage.messageShort);
        }
        else if (data.code == 200 && data.status == "BAD_REQUEST") {
          this.showLoader = false
          this.showLoadDailyMsgs = true;
          this.showLoadDailyMsgsLoad = false;
          this.msg.push(data.result.errorLog);
          this.msg.push(data.result.errorLogName);
          this.ToastrService.warning(data.hmsMessage.messageShort);
        }
        else if (data.hmsMessage.messageShort == "INVALID_DATA") {
          this.filePath = undefined
          this.showLoader = false
          const url = data.result;
          const a = document.createElement('a');
          a.href = url;
          a.download = 'fghfh_' + this.changeDateFormatService.getCurrentTimestamp(new Date());
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
          }, 0)
          this.ToastrService.error("INVALID DATA")
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.code == 400) {
          this.showLoader = false;
          this.filePath = undefined
          this.msg.push("Record Not Found")
        }
        else if (data.code == 400 && data.status == "BAD_REQUEST") {
          this.filePath = undefined

          this.showLoader = false
          this.showLoadDailyMsgs = false;
          this.showLoadDailyMsgsLoad = true;
          this.msg.push(data.hmsMessage.messageShort)
          this.ToastrService.error(data.hmsMessage.messageShort)
        }
      }, (e) => {
        this.showLoader = false
      })
    }
    else {
      this.filePath = undefined
      this.showLoader = false
      this.ToastrService.error("Only Text Files Are Allowed")
    }
  }
  dataTableInitialize() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if (this.checkServiceProvider = true) {
        if ('serviceProvider.search-table-column.effectiveDate' == this.translate.instant('serviceProvider.search-table-column.effectiveDate')) {
        } else {
          this.columns = [
            { title: 'File Name', data: 'fileName' },
            { title: 'File Type', data: 'fileType' },
            { title: 'File Path', data: 'filePath' },
            { title: 'Actions', data: 'downloadPath' }
          ]
          this.checkServiceProvider = false;
          this.ObservableClaimObj.unsubscribe();
        }
      }
    });
  }

  searchClaimFiles() {
    this.showSeachFilesListing = true;
    setTimeout(() => {
      let reqParam = [
        { 'key': 'fileType', 'value': this.claimSecureForm.value.fileType || '' },
      ]
      var url = DataManagementDashboardApi.getClaimSecureFileTypeListUrl

      this.tableActions = [
        { 'name': 'pdf', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'PDF' },
        { 'name': 'coId', 'val': '', 'class': '', 'type': 'hidden' }
      ]
      if (!$.fn.dataTable.isDataTable('#search-claimSearchFiles-table')) {
        this.dataTableService.jqueryDataTableSearchClaim("search-claimSearchFiles-table", url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', null, [0, 'asc'], '', reqParam, this.tableActions, [3], '', '', [1, 2, 3])
      } else {
        this.dataTableService.jqueryDataTableReload("search-claimSearchFiles-table", url, reqParam)
      }
    }, 500);
  }

  onFileTypeChange(event) {
    if (event.target.value) {
      this.showLoadingText = true;
      this.fileTypeKey = event.target.value;
    } else {
      this.showLoadingText = false;
    }
  }
}
