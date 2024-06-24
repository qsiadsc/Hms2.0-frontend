import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DataManagementDashboardApi } from '../data-management-dashboard-api';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ToastrService } from 'ngx-toastr';
import { RequestOptions, Headers } from '@angular/http';

@Component({
  selector: 'app-eligibility-files',
  templateUrl: './eligibility-files.component.html',
  styleUrls: ['./eligibility-files.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, DatatableService, TranslateService]
})

export class EligibilityFilesComponent implements OnInit {
  currentUser: any;
  eligibilityFileForm: FormGroup;
  fileType: any;
  fileCategory: any;
  fileTypeKey: any;
  hasFileType: boolean = false
  ObservableClaimObj: any;
  columns = [];
  checkServiceProvider: boolean = true
  error: any;
  showSeachFilesListing: boolean = false;
  todaydate: any;
  dateNameArray: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions
  showLoadingText: boolean = false;
  /** Start For Gov Elig Files */
  public uploadGovEligFileFormGroup: FormGroup;
  serror: any;
  error1: any;
  error3: any;
  selectedFileName
  selectedFile: any;
  fileSizeExceeds: boolean = false
  allowedExtensions = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword", "image/jpg", "image/jpeg", "image/png", ""]
  allowedFileExtensions = ["text/plain", ""]
  allowedValue: boolean = false
  showLoader: boolean;
  loaderPlaceHolder: string;
  summaryColumns = [];
  checkSummaryList: boolean = true
  public fileSummaryFormGroup: FormGroup
  showSummaryList: boolean = false
  fileCategorysummaryPopup: any = [];
  fileCategorypopup: any = [];
  showLoadingText1: boolean = false;
  showLoadingText2: boolean = false;
  fileName;
  /** End For Gov Elig Files */
  constructor(
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private fb: FormBuilder,
    public dataTableService: DatatableService,
    private translate: TranslateService,
    private toastrService: ToastrService
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }

  ngOnInit() {
    this.eligibilityFileForm = new FormGroup({
      fileType: new FormControl('', [Validators.required]),
      fileCategory: new FormControl(''),
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required])
    })

    //Upload Gov Elig File Form
    this.uploadGovEligFileFormGroup = new FormGroup({
      fileType: new FormControl('', [Validators.required]),
      fileCategory: new FormControl(''),
      selectedFileName: new FormControl('', [Validators.required])
    })

    this.fileSummaryFormGroup = new FormGroup({
      fileType: new FormControl('', [Validators.required]),
      fileCategory: new FormControl(''),
    })

    this.getFileTypeList();
    this.dataTableInitialize();
    this.eligibilityFileForm.patchValue({ 'fileType': 3 });
    this.todaydate = this.changeDateFormatService.getToday();
    this.eligibilityFileForm.patchValue({ 'fromDate': this.todaydate });
    this.eligibilityFileForm.patchValue({ 'toDate': this.todaydate });
    this.getFileCatList('3', true, false);
    var self = this
    $(document).on('click', '#gov-elig-file-upload-doc .download-ico', function () {
      var selectedFileRow = self.dataTableService.filesSelectedRowData;
      if (selectedFileRow.url && selectedFileRow.url != undefined) {
        window.open(selectedFileRow.url, '_blank');
      }
    });
    // to resolved calendar Issue(HMS point no - 594)
    $(document).on('click','.btnpicker', function () {
      $('#fromDateEligibility .mydp .selector').addClass('bottom-calender')
    })
    $(document).on('click','.btnpicker', function () {
      $('#toDateEligibility .mydp .selector').addClass('bottom-calender')
    })
  }

  /*Eligibilty Summary Popup: Download icon implemented after removing url link */
  ngAfterViewInit() {
    var self = this
    $(document).on('click', '#summaryList .rptSummary-ico', function () {
      var selectedFileRow = self.dataTableService.filesSelectedRowData
      if (selectedFileRow.reportUrl && selectedFileRow.reportUrl != undefined) {
        window.open(selectedFileRow.reportUrl, '_blank');
      }
    })

    $(document).on('click', '#summaryList .errRpt-ico', function () {
      var selectedFileRow = self.dataTableService.filesSelectedRowData
      if (selectedFileRow.errReportUrl && selectedFileRow.errReportUrl != undefined) {
        window.open(selectedFileRow.errReportUrl, '_blank');
      }
    })

    $(document).on('click', '#summaryList .download-ico', function () {
      var selectedFileRow = self.dataTableService.filesSelectedRowData
      if (selectedFileRow.ctrlFileEncrption && selectedFileRow.ctrlFileEncrption != undefined) {
        self.fileName = selectedFileRow.paramCtrlFileName
        var filePath;
        if(selectedFileRow.ctrlFileEncrption != ""){
          filePath = selectedFileRow.ctrlFileEncrption
        }
        var blob = self.hmsDataService.b64toBlob(filePath, "text/plain");
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = self.fileName;
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 0)
      }
    });

  }


  getFileTypeList() {
    this.hmsDataService.getApi(DataManagementDashboardApi.getFileTypeListUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let list = []
        list.push(data.result[2])
        list.push(data.result[3])
        list.push(data.result[0])
        list.push(data.result[1])
        list.push(data.result[4])
        this.fileType = list
      }
    })
  }

  onFileTypeChange(event, popup, summaryPopup) {
    if (event.target.value) {
      this.showLoadingText = true;
      this.fileTypeKey = event.target.value;
      this.getFileCatList(event.target.value, popup, summaryPopup)
    } else {
      this.showLoadingText = false;
    }
  }

  onFileCategoryChange(event) {
    if (event.target.value) {
    }
  }

  getFileCatList(fileTypeKey, popup = true, summaryPopup) {
    let reqParam = {
      "fileTypeKey": fileTypeKey
    }

    if (popup) {
      this.showLoadingText = true;
      this.eligibilityFileForm.controls['fileCategory'].setValue('');
    } else if (summaryPopup) {
      this.showLoadingText2 = true;
      this.fileSummaryFormGroup.controls['fileCategory'].setValue('');
    } else {
      this.showLoadingText1 = true;
      this.uploadGovEligFileFormGroup.controls['fileCategory'].setValue('');
    }
    this.hmsDataService.postApi(DataManagementDashboardApi.getFileCatListByFileTypeKeyUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        // fileTypeKey check added as per ticket #1208
        if (fileTypeKey == 4) {
          let aahbList = []
          aahbList.push(data.result[1])
          aahbList.push(data.result[0])
          data.result = aahbList
        }
        if (popup) {
          this.showLoadingText = false;
          this.fileCategorypopup = data.result;
          this.eligibilityFileForm.controls['fileCategory'].setValue(data.result[0].govtEligCatKey);
        } else if (summaryPopup) {
          this.showLoadingText2 = false;
          this.fileCategorysummaryPopup = data.result;
          this.fileSummaryFormGroup.controls['fileCategory'].setValue(data.result[0].govtEligCatKey);
        } else {
          this.showLoadingText1 = false;
          this.fileCategory = data.result;

          this.uploadGovEligFileFormGroup.controls['fileCategory'].setValue(data.result[0].govtEligCatKey);
        }

        this.showLoadingText = false;
      }
    })
  }



  /**
   * 
   * @param event 
   * @param frmControlName 
   * @param formName 
   * @param currentDate 
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.eligibilityFileForm.patchValue(datePickerValue);
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
      this.eligibilityFileForm.patchValue(datePickerValue);
    }
    else if (event.reason == 2 && currentDate == false && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        var ControlName = frmControlName;
        var datePickerValue = new Array();
        datePickerValue[ControlName] = obj;
        this.eligibilityFileForm.patchValue(datePickerValue);
      }
    }
    if (this.eligibilityFileForm.value.fromDate && this.eligibilityFileForm.value.toDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.eligibilityFileForm.value.fromDate.date, this.eligibilityFileForm.value.toDate.date);
      if (this.error.isError == true) {
        this.eligibilityFileForm.controls['toDate'].setErrors({
          "ToDateNotValid": true
        });
      }
    }
  }

  dataTableInitialize() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if (this.checkServiceProvider = true) {
        if ('serviceProvider.search-table-column.effectiveDate' == this.translate.instant('serviceProvider.search-table-column.effectiveDate')) {
          //Nothing to do here
        } else {
          this.columns = [
            { title: 'File Name', data: 'fileName' },
            { title: 'File Type', data: 'fileType' },
            { title: 'File Version', data: 'fileVersion' },
            { title: 'File Generation Date', data: 'fileGenerationDate' },
            { title: 'File Processed On', data: 'createdOn' }
          ]
          this.checkServiceProvider = false;
          this.ObservableClaimObj.unsubscribe();
        }
      }
    });
  }

  searchEligibilityFiles() {
    
    if (this.eligibilityFileForm.valid) {
      this.showSeachFilesListing = true;
      setTimeout(() => {
        let reqParam = [
          { 'key': 'govtEligCatKey', 'value': this.eligibilityFileForm.value.fileCategory },
          { 'key': 'startDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.eligibilityFileForm.value.fromDate) },
          { 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.eligibilityFileForm.value.toDate) }
        ]
        var url = DataManagementDashboardApi.searchGovEligFilesUrl
        var tableActions = [];
        if (!$.fn.dataTable.isDataTable('#search-eligibilityFiles-table')) {
          this.dataTableService.jqueryDataTableSearchClaim("search-eligibilityFiles-table", url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, '', '', [1, 2], [3, 4]);
          setTimeout(() => {
            this.dataTableService.jqueryDataTableReload("search-eligibilityFiles-table", url, reqParam)

          }, 200);
        } else {
          this.dataTableService.jqueryDataTableReload("search-eligibilityFiles-table", url, reqParam)
        }
      }, 500);
    } else {
      this.toastrService.error("Please select the filter values");
    }
  }

  resetFormSearch() {
    this.eligibilityFileForm.reset()
  }

  /**
   * Upload Gov Elig File
   * 28 Aug 2019
   */
  fileUpload() {
    this.hmsDataService.OpenCloseModal('uploadGovEligFilesPopUp');
    this.uploadGovEligFileFormGroup.patchValue({ 'fileType': '3' })
    this.getFileCatList('3', false, false);

  }
  summery() {
    this.fileSummaryFormGroup.patchValue({ 'fileType': '3' });
    this.getFileCatList('3', false, true);

  }
  resetGovEligFileForm() {
    this.uploadGovEligFileFormGroup.reset();
    this.fileSummaryFormGroup.reset();
    this.removeExtension();
  }

  /**
   * Remove the extension from documents
   */
  removeExtension() {
    this.selectedFileName = ""
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }

  onFileChanged(event) {
    this.selectedFileName = ""
    this.selectedFile = event.target.files[0]
    var fileSize = this.selectedFile.size;
    if (fileSize > 1048576 * 50) {
      this.error3 = { isError: true, errorMessage: 'File size should not greater than 50 Mb!' };
      this.fileSizeExceeds = true
    }
    else {
      this.error3 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    if (this.selectedFile.type == "") {
      this.allowedValue == true;
    }
    this.uploadGovEligFileFormGroup.patchValue({
      'selectedFileName': this.selectedFile.name
    })

    this.allowedValue = this.allowedFileExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only txt and seq file types are allowed.' };
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  /**
   * Upload File on server
   * 28 Aug 2019
   */
  onSubmitUploadGovEligFileForm() {
    if (this.uploadGovEligFileFormGroup.valid) {
      this.showLoader = true;
      let promise = new Promise((resolve, reject) => {
        if (this.allowedValue && !this.fileSizeExceeds) {
          this.showLoader = true
          this.loaderPlaceHolder = "Uploading File....."
          var formData = new FormData()
          let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
          let header = new Headers({ 'Authorization': this.currentUserService.token });
          let options = new RequestOptions({ headers: header });
          formData.append('file', this.selectedFile);
          formData.append('govtEligCatKey', this.uploadGovEligFileFormGroup.value.fileCategory);
          this.hmsDataService.sendFormData(DataManagementDashboardApi.uploadGovEligFilesUrl, formData).subscribe(data => {
            if (data) {
              // File_Uploaded_successfully - add or conditions with file upload RECORD_PROCESS_SUCCESSFULLY
              if (data.code == 200 && (data.hmsMessage.messageShort == "File_Uploaded_successfully" || data.hmsMessage.messageShort == "RECORD_PROCESS_SUCCESSFULLY")) {
                this.toastrService.success("File Uploaded Successfully");
                this.showLoader = false;
                this.removeExtension()
                this.selectedFileName = ""
                this.uploadGovEligFileFormGroup.patchValue({
                  'selectedFileName': ""
                })
                setTimeout(() => {
                  this.getDocumentList()
                  resolve();
                }, 1000);
                // ONLY_PDF_FILE_SUPPORTED - replace with ONLY_SEQ_AND_TXT_FILE_SUPPORTED
              } else if (data.code == 400 && data.hmsMessage.messageShort == "ONLY_SEQ_AND_TXT_FILE_SUPPORTED") {
                this.showLoader = false;
                this.removeExtension()
                this.selectedFileName = ""
                this.toastrService.error("Only txt and seq file types are allowed.");
              } else if (data.code == 400 && data.hmsMessage.messageShort == "BAD_REQUEST") {
                this.showLoader = false;
                this.removeExtension()
                this.selectedFileName = ""
                this.toastrService.error(data.result);
              } else if (data.code == 404) {
                this.showLoader = false;
                this.removeExtension()
                this.selectedFileName = ""
                this.toastrService.error("File Not Found");
              } else {
                this.showLoader = false;
                this.removeExtension()
                this.selectedFileName = ""
                this.toastrService.error("File Selected does not match File Type Category");


              }
            } else {
              this.showLoader = false;
              this.removeExtension()
              this.selectedFileName = ""
            }
          })
        } else {
          this.showLoader = false;
          return false
        }
      });
      return promise;
    } else {
      this.validateAllFormFields(this.uploadGovEligFileFormGroup); 
    }
  }

  /**
   * Get Documents List
   */
  getDocumentList() {
    let columns = [
      { title: 'File Name', data: 'fileName' },
      { title: 'File Type', data: 'fileType' },
      { title: 'Created On', data: 'createdOn' },
      { title: 'Url', data: 'url' }
    ]
    let tableActions = [
      { 'name': 'pdf', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'PDF' },
      { 'name': 'coId', 'val': '', 'class': '', 'type': 'hidden' }
    ]
    var reqParam = [
      { 'key': 'govtEligCatKey', 'value': this.uploadGovEligFileFormGroup.value.fileCategory }
    ]
    if (!$.fn.dataTable.isDataTable('#gov-elig-file-upload-doc')) {
      this.dataTableService.jqueryDataTable("gov-elig-file-upload-doc", DataManagementDashboardApi.getGovEligFilesUrl, 'full_numbers', columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, [4], [2], '', [1, 2, 3])
    } else {
      this.dataTableService.jqueryDataTableReload("gov-elig-file-upload-doc", DataManagementDashboardApi.getGovEligFilesUrl, reqParam)
    }
  }

  searchFileSummaryList() {
    if (this.fileSummaryFormGroup.valid) {
      this.showSummaryList = true
      this.summaryColumns = [
        { title: 'File Name', data: 'fileName' },
        { title: 'File Type', data: 'fileType' },
        { title: 'File Generated On', data: 'createdOn' },
        { title: 'Summary Report', data: 'reportUrl' },
        { title: 'Error Report', data: 'errReportUrl' },
        { title: 'Eligibility Control File', data: 'ctrlFileUrl' }
      ]
      let reqParam = [
        { 'key': 'govtEligCatKey', 'value': this.fileSummaryFormGroup.value.fileCategory }
      ]
      var url = DataManagementDashboardApi.getGovEligFilesUrl
      var tableId = "summaryList"
      var tableActions = [
        { 'name': 'rptSummary', 'class': 'table-action-btn rptSummary-ico', 'icon_class': 'fa fa-download', 'title': 'Download Summary Report', 'showAction': '' },
      ]
      var tableActions1 = [
        { 'name': 'errorRpt', 'class': 'table-action-btn errRpt-ico', 'icon_class': 'fa fa-download', 'title': 'Download Error Report', 'showAction': '' },
      ]
      var tableActions2 = []
      var actionColumn2 = []
      if (this.fileSummaryFormGroup.value.fileCategory == 8) {
        tableActions2 = [
          { 'name': 'ctrlFile', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download Control File', 'showAction': '' },
        ]
        actionColumn2 = [5]
      }
      if (!$.fn.dataTable.isDataTable('#summaryList')) {
        this.dataTableService.jqueryDataTableForMultipleActions(tableId, url, 'full_numbers', this.summaryColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, tableActions1, tableActions2, [3], [4], actionColumn2, [2], "openSummaryPopUp", '', '', '', '', '', [1, 2, 5], null, null)
      } else {
        this.dataTableService.jqueryDatatableDestroy("summaryList")
        this.dataTableService.jqueryDataTableForMultipleActions(tableId, url, 'full_numbers', this.summaryColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, tableActions1, tableActions2, [3], [4], actionColumn2, [2], "openSummaryPopUp", '', '', '', '', '', [1, 2, 5], null, null)
      }
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');
      return false;
    } else {
      this.showSummaryList = false
      this.validateAllFormFields(this.fileSummaryFormGroup)
    }
  }

  resetFileSummary() {
    this.fileSummaryFormGroup.reset();
    this.showSummaryList = false
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


}