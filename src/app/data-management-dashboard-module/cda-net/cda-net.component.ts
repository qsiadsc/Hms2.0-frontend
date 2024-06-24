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
import { DataManagementDashboardModuleComponent } from "../data-management-dashboard-module.component"
@Component({
  selector: 'app-cda-net',
  templateUrl: './cda-net.component.html',
  styleUrls: ['./cda-net.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, DatatableService, TranslateService]
})

export class CdaNetComponent implements OnInit {
 public uploadCDANetFileFormGroup: FormGroup;
  error: any;
  error1: any;
  ObservableClaimObj: any;
  error3: any;
  todaydate: any;
  fileTypeKey: any;
  showLoadingText: boolean = false;
  columns = [];
  selectedFileName

  selectedFile: any;
  checkServiceProvider: boolean = true
  showSeachFilesListing: boolean = false;
  fileSizeExceeds: boolean = false
  allowedExtensions = ["text/plain"];
  allowedValue: boolean = false;
  showLoader: boolean;
  loaderPlaceHolder: string;
  fileType: any;
  constructor(
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private fb: FormBuilder,
    public dataTableService: DatatableService,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private dashboard :DataManagementDashboardModuleComponent
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
    this.columns = [
      { title: 'File Name Category', data: 'cdadataFileNameCd' },
      { title: 'File Name', data: 'cdadataFileName' },
      { title: 'File Type', data: 'cdadataFileType' },
      { title: 'File Path', data: 'cdadataFilePath' },
      { title: 'Actions', data: 'cdadataFilePath' }
    ]
  }

  ngOnInit() {

    this.uploadCDANetFileFormGroup = new FormGroup({
      fileType: new FormControl('', [Validators.required]),
      selectedFileName: new FormControl('', [Validators.required])
    })
   
    this.searchEligibilityFiles();
    this.getHmsCdaDataList();

    var self = this
    $(document).on('click', '#cda-netList-table .download-ico', function () {
      var selectedFileRow = self.dataTableService.filesSelectedRowData;
      if (selectedFileRow.cdadataFilePath && selectedFileRow.cdadataFilePath != undefined) {
        window.open(selectedFileRow.cdadataFilePath, '_blank');
      }
    });
  }

  searchCdaNet() {
    alert('Coming Soon!!');
  }

  onFileChanged(event) {
    this.selectedFileName = ""
    this.selectedFile = event.target.files[0]
    var fileSize = this.selectedFile.size;
    if (fileSize > 1048576) {
      this.error3 = { isError: true, errorMessage: 'File size shuold not greater than 1 Mb!' };
      this.fileSizeExceeds = true
    } else {
      this.error3 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.uploadCDANetFileFormGroup.patchValue({
      'selectedFileName': this.selectedFile.name
    })
    this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only text file types are allowed.' };
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }


  getCdaFileList() {
    this.hmsDataService.getApi(DataManagementDashboardApi.getCdaDataListUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.fileType = data.result;
      }
    })
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

  //Issue_no 371 Abhishek
  searchEligibilityFiles() {
    setTimeout(() => {
      let reqParam = [
      ];
      var url = DataManagementDashboardApi.getCdaDataListUrl 
      var tableActions = [ { 'name': 'pdf', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'PDF' },
      { 'name': 'coId', 'val': '', 'class': '', 'type': 'hidden' }]
      if (!$.fn.dataTable.isDataTable('#cda-netList-table')) {
        this.dataTableService.jqueryDataTableSearchClaim("cda-netList-table", url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', null, [1, 'asc'], '', reqParam, tableActions, [4], '', '', [1, 2, 3, 4])
      } else {
        this.dataTableService.jqueryDataTableReload("cda-netList-table", url, reqParam)
      }
    }, 500);
  }

  /**
   * Upload Documents on server
   * @param coKeyAfterSave 
   */
  uploadFile() {
    
    if (this.uploadCDANetFileFormGroup.valid) {
      if (this.allowedValue && !this.fileSizeExceeds) {
        this.showLoader = true
        this.loaderPlaceHolder = "Uploading File....."
        var formData = new FormData()
        let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
        let header = new Headers({ 'Authorization': this.currentUserService.token });
        let options = new RequestOptions({ headers: header });
        formData.append('file ', this.selectedFile);
        formData.append('value', this.uploadCDANetFileFormGroup.value.fileType);
        var URL = DataManagementDashboardApi.uploadFileUrl;
        this.hmsDataService.sendFormData(URL, formData).subscribe(data => {
          if (data) {
            this.dashboard.getCdaCounts();
            this.showLoader = false
            this.loaderPlaceHolder = "Please wait...."
            this.toastrService.success("Document Uploaded successfully");
            this.uploadCDANetFileFormGroup.patchValue({
              'selectedFileName': ""
            })
            
            this.removeExtension()
            this.selectedFileName = "";
            this.searchEligibilityFiles();
            
          }
        })
        $("#openUploadGovCdaNetPopUp .close").trigger('click');
      } else {
        return false
      }
    } else {
      this.validateAllFormFields(this.uploadCDANetFileFormGroup);
      
    }

  }
  
  fileUploadCda(){
    this.hmsDataService.OpenCloseModal('uploadGovCdaNetPopUp');
  }
  resetGovCdaNetForm(){
   this.uploadCDANetFileFormGroup.reset();
  }
  getHmsCdaDataList() {
    this.hmsDataService.getApi(DataManagementDashboardApi.getHmsCdaDataListUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
    this.fileType = data.result.filter(function(x) { return x.cdadataTypeCd !=='P'});  //As per discussion by backend
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
      this.uploadCDANetFileFormGroup.patchValue(datePickerValue);
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
      this.uploadCDANetFileFormGroup.patchValue(datePickerValue);
    }
    else if (event.reason == 2 && currentDate == false && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        var ControlName = frmControlName;
        var datePickerValue = new Array();
        datePickerValue[ControlName] = obj;
        this.uploadCDANetFileFormGroup.patchValue(datePickerValue);
      }
    }
    if (this.uploadCDANetFileFormGroup.value.fromDate && this.uploadCDANetFileFormGroup.value.toDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.uploadCDANetFileFormGroup.value.fromDate.date, this.uploadCDANetFileFormGroup.value.toDate.date);
      if (this.error.isError == true) {
        this.uploadCDANetFileFormGroup.controls['toDate'].setErrors({
          "ToDateNotValid": true
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
  onFileTypeChange(event) {
    if (event.target.value) {
      this.showLoadingText = true;
      this.fileTypeKey = event.target.value;
    } else {
      this.showLoadingText = false;
    }
  }

}
