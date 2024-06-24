import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { FilesApi } from '../files-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { CustomValidators } from "../../common-module/shared-services/validators/custom-validator.directive";
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})
export class FilesComponent implements OnInit {
  hideBtn: boolean = false;
  columns = [];
  error: any;
  observableObj;
  check = true;
  fileKey;
  fileHistKey;
  showLoader: boolean = false;
  fileConfigKey;

  public isOpen: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private currentUserService: CurrentUserService
  ) {
    this.error = { error: false, errorMessage: '' }
  }

  currentUser:any;
  filesArray =  [{
      "viewFile": 'F',
      "deleteFile": 'F',
      "downloadFile": 'F'
  }]
  
  ngOnInit() {
    /* Security Checks*/
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
  }
test(){
  alert( this.translate.instant('file.fileName'))
}
  dataTableInitialize() {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('admin.adminRate.planType') == 'admin.adminRate.planType') {
        } else {
          this.columns = [
            { title: this.translate.instant('file.fileName'), data: 'fileName' },
            { title: this.translate.instant('file.fileType'), data: 'fileType' },
            { title: this.translate.instant('file.fileDate'), data: 'fileDate' },
            { title: this.translate.instant('file.action'), data: 'fileConfigKey' }
          ]
          this.getFilesList();
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#filesList .history-ico', function () {
      $("#hiddenFileHistBut").trigger('click');
      var fileConfigKey = $(this).data('id');
      self.fileConfigKey = $(this).data('id');
      self.getFilesListHistory(fileConfigKey);
    });
    $(document).on('click', '#filesList .del-ico', function () {
      var id = $(this).data('id');
      self.fileKey = id
      self.deleteFile(id)
    });
    $(document).on('click', '#filesList .download-ico', function () {
      var selectedFileRow = self.dataTableService.filesSelectedRowData
      if (selectedFileRow.filePath && selectedFileRow.filePath != undefined) {
        window.open(selectedFileRow.filePath, '_blank');
      }
    });
    $(document).on('click', '#fileListHistory .del-ico', function () {
      var id = $(this).data('id');
      self.fileHistKey = id
      self.deleteHistFile(id)
    });
    $(document).on('click', '#fileListHistory .download-ico', function () {
      var selectedHistFileRow = self.dataTableService.histFilesSelectedRowData
      window.open(selectedHistFileRow.filePath, '_blank');
    });
  }

  deleteFile(id) {
    this.exDialog.openConfirm(this.translate.instant('file.deleteFile')).subscribe((value) => {
      if (value) {
        let RequestData = {
          "fileConfigKey": id
        }
        this.hmsDataService.postApi(FilesApi.deleteExcelBasedOnKey, RequestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('file.deletedSucessfuly'))
            this.getFilesList();
          }
        })
      }
    });
  }

  deleteHistFile(id) {
    this.exDialog.openConfirm(this.translate.instant('file.deleteFile')).subscribe((value) => {
      if (value) {
        let RequestData = {
          "hmsFileConfigHistoryKey": id
        }
        this.hmsDataService.postApi(FilesApi.deleteExcelHistoryBasedOnKey, RequestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('file.deletedSucessfuly'))
            this.getFilesListHistory(this.fileConfigKey);
          }
        })
      }
    });
  }

  getFilesList() {
    var reqParam = []
    var url = FilesApi.getExcelReportsList;
    var tableId = "filesList"
    if (!$.fn.dataTable.isDataTable('#filesList')) {
      var tableActions = [
        { 'name': 'history', 'class': 'table-action-btn history-ico', 'icon_class': 'fa fa-history', 'title': 'History', 'showAction': this.filesArray[0].viewFile },
        { 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': this.filesArray[0].downloadFile },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': this.filesArray[0].deleteFile },
      ]
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], null, reqParam, tableActions, 3, null, "AddNewAdminInfo", null, 1)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');

    return false;
  }

  getFilesListHistory(fileConfigKey) {
    var fileHistoryColumns = [
      { title: "File Name", data: 'fileName' },
      { title: "File Type", data: 'fileType' },
      { title: "File Date", data: 'fileDate' },
      { title: "Action", data: 'hmsFileConfigHistoryKey' }
    ]
    var reqParam = [
      { 'key': 'fileConfigKey', 'value': fileConfigKey }
    ]
    var url = FilesApi.getExcelReportsHistoryList;
    var tableId = "fileListHistory"
    if (!$.fn.dataTable.isDataTable('#fileListHistory')) {
      var tableActions = [
        { 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': '' },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
      ]
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', fileHistoryColumns, 5, true, true, 'lt', 'irp', undefined, [2, 'desc'], '', reqParam, tableActions, 3, '', "",[1,2])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');

    return false;
  }

  /* Get Auth Checks */
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

}