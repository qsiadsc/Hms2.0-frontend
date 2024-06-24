import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { FormGroup, FormControl } from '@angular/forms';
import { FinanceApi } from '../../finance-module/finance-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DataEntryApi } from '../data-entry-api';
import { RequestOptions, Headers, Http } from '@angular/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-batch-balance-report',
  templateUrl: './batch-balance-report.component.html',
  styleUrls: ['./batch-balance-report.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})
export class BatchBalanceReportComponent implements OnInit {

  ObservableObj: any;
  columns = [];
  authCheck = [{
    'batchBalanceView': 'F'
  }]
  public batchBalanceReportForm: FormGroup;
  showBatchBalanceReportList: boolean = false;
  tableId: string
  selectedFileName;
  selectedFile: any
  allowedValue: boolean = false
  allowedExtensions = ["text/plain"]
  error: any
  error3: any
  showLoader: boolean = false
  fileSizeExceeds: boolean = false
  placeholderLoader

  constructor(private currentUserService: CurrentUserService,
    private hmsDataService: HmsDataServiceService,
    public dataTableService: DatatableService,
    private translate: TranslateService,
    private toastrService: ToastrService) {
    this.error = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' }
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['BTB']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize()
        localStorage.setItem('isReload', '')
      })
    } else {
      let checkArray = this.currentUserService.authChecks['BTB']
      this.getAuthCheck(checkArray)
      this.dataTableInitialize()
    }

    this.batchBalanceReportForm = new FormGroup({
      'batchBalanceFileName': new FormControl('')
    })

  }

  getAuthCheck(batchBalanceCheck) {
    let authCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.authCheck = [{
        'batchBalanceView': 'T'
      }]
    } else {
      for (var i = 0; i < batchBalanceCheck.length; i++) {
        authCheck[batchBalanceCheck[i].actionObjectDataTag] = batchBalanceCheck[i].actionAccess
      }
      this.authCheck = [{
        'batchBalanceView': authCheck['BTB398']
      }]
    }
  }

  dataTableInitialize() {
    this.ObservableObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: 'Number', data: 'originatorNum' },
          { title: 'Number 2', data: 'originatorBankNum' },
          { title: 'Branch Number', data: 'originatorBranchNum' },
          { title: 'Account Num', data: 'originatorAcctNum' },
          { title: 'File Name', data: 'originatorName' },
        ]
        this.ObservableObj.unsubscribe();
        this.searchBatchBalance();
      }
    });
  }

  searchBatchBalance() {
    this.showBatchBalanceReportList = true;
    var reqParam = [
      { 'key': 'originatorNum', 'value': this.batchBalanceReportForm.value.batchBalanceFileName }
    ]
    var Url = FinanceApi.searchOriginatorUrl;
    this.tableId = "batchBalanceReportList"
    if (!$.fn.dataTable.isDataTable('#batchBalanceReportList')) {
      this.dataTableService.jqueryDataTable(this.tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', '', [1, 2], '', '', [1, 2, 3, 4])
    } else {
      this.dataTableService.jqueryDataTableReload(this.tableId, Url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  /* Log #970 Batch Balance Report */
  onFileChanged(event) {
    this.selectedFileName = ""
    this.selectedFile = event.target.files[0]
    this.selectedFileName = this.selectedFile.name
    this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'You Can Only Upload .txt Files' };
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  uploadBatchBalanceFile() {
    if (this.allowedValue && !this.fileSizeExceeds) {
      this.showLoader = true
      this.placeholderLoader = "Uploading File....."
      var userId = localStorage.getItem('id')
      var formData = new FormData()
      let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
      let header = new Headers({ 'Authorization': this.currentUserService.token });
      let options = new RequestOptions({ headers: header });
      formData.append('file', this.selectedFile);
      this.hmsDataService.sendFormData(DataEntryApi.importBatchBalanceUrl, formData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.showLoader = false
          this.placeholderLoader = ""
          this.toastrService.success("Batch Balance File Uploaded Successfully")
          this.removeExtension()
          this.selectedFileName = ""
        } else {
          this.showLoader = false
          this.placeholderLoader = ""
          this.toastrService.error("Batch Balance file not uploaded!!")
          this.removeExtension()
          this.selectedFileName = ""
        }
      })
    } else {
      return false
    }
  }

  removeExtension() {
    this.selectedFileName = ""
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }

}
