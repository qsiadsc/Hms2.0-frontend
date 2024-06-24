import { Component, OnInit, QueryList, ViewChildren, ViewChild, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { RequestOptions, Http, Headers } from '@angular/http';
import { CompanyApi } from '../company-api';
import { Subject } from 'rxjs/Subject';
import { Constants } from '../../common-module/Constants'
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { debug } from 'util';

@Component({
  selector: 'app-company-upload-document',
  templateUrl: './company-upload-document.component.html',
  styleUrls: ['./company-upload-document.component.css'],
  providers: [DatatableService]
})
export class CompanyUploadDocumentComponent implements OnInit {
  pdfSrc: any;
  @Input() companyId: any;
  @Input() uploadDocEditMode: any;
  @Input() uploadDocAddMode: any;
  error: any;
  error1: any;
  error3: any;
  selectedFileName
  selectedFile: any;
  fileSizeExceeds: boolean = false
  allowedExtensions = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword", "image/jpg", "image/jpeg", "image/png"]
  allowedValue: boolean = false
  showLoader: boolean = false
  loaderPlaceHolder
  scannedDocumentList = []
  hasImage: boolean = false
  imagePath
  docType
  docName
  blobUrl
  filePath
  fileName
  company_upload_document_columns = [];
  ObservableComUploadDocObj
  checkCcomUploadDoc = true
  hidebtn: boolean = true;
  selectedCompnayUploadDocArray

  constructor(
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private datatableService: DatatableService,
    private currentUserService: CurrentUserService,
    private exDialog: ExDialog,
    private http: HttpClient
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };

    this.error3 = { isError: false, errorMessage: '' };

  }

  ngOnInit() { }

  onFileChanged(event) {
    this.selectedFileName = ""
    this.selectedFile = event.target.files[0]
    var fileSize = this.selectedFile.size;
    if (fileSize > 1048576) {
      this.error3 = { isError: true, errorMessage: 'File size shuold not greater than 1 Mb!' };
      this.fileSizeExceeds = true
    }
    else {
      this.error3 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.selectedFileName = this.selectedFile.name
    this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only jpeg, jpg, png, pdf and docx file types are allowed.' };
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getDocumentList()
    }, 1000);
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

  /**
   * Upload Documents on server
   * @param coKeyAfterSave 
   */
  onUpload(coKeyAfterSave = null) {
    let promise = new Promise((resolve, reject) => {
      if (this.allowedValue && !this.fileSizeExceeds) {
        this.showLoader = true
        this.loaderPlaceHolder = "Uploading File....."
        var formData = new FormData()
        let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
        let header = new Headers({ 'Authorization': this.currentUserService.token });
        let options = new RequestOptions({ headers: header });
        formData.append('docFile', this.selectedFile);
        if (coKeyAfterSave) {
          this.companyId = coKeyAfterSave
        }
        formData.append('coId', this.companyId);
        this.hmsDataService.sendFormData(CompanyApi.uploadDocuments, formData).subscribe(data => {
          if (data) {
            this.showLoader = false
            this.loaderPlaceHolder = "Please wait...."
            if (!coKeyAfterSave) {
              this.toastrService.success("Document Uploaded successfully")
            }
            this.removeExtension()
            this.selectedFileName = ""
            setTimeout(() => {
              this.getDocumentList()
              resolve();
            }, 1000);
          }
        })

      } else {
        return false
      }
    });
    return promise;

  }

  /**
   * Get Documents List
   */
  getDocumentList() {
    let columns = [
      { title: 'Document Name', data: 'coDocumentName' },
      { title: 'Uploaded By', data: 'updatedBy' },
      { title: 'Uploaded Time', data: 'updatedOn' },
      { title: 'Action', data: 'coDocumentKey' }
    ]
    var reqParam = [
      { 'key': 'coKey', 'value': this.companyId }
    ]
    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye' },
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash' }
    ]
    if (!$.fn.dataTable.isDataTable('#company-upload-doc')) {
      this.datatableService.jqueryDataTableCompanyDocument("company-upload-doc", CompanyApi.getDocumentList, 'full_numbers', columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 3, [2], '', [1, 2, 3])
    } else {
      this.datatableService.jqueryDataTableReload("company-upload-doc", CompanyApi.getDocumentList, reqParam)
    }

  }

  /**
   * View Document
   * @param companyScanDocKey 
   * @param coDocumentName 
   */
  viewDocuments(companyScanDocKey, coDocumentName) {
    this.showLoader = true
    this.loaderPlaceHolder = "Please wait...."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    var reqParam = {
      'coDocumentKey': companyScanDocKey,
      'coDocumentName': coDocumentName
    }
    this.hmsDataService.postApi(CompanyApi.getCompanyDocument, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showLoader = false
        this.loaderPlaceHolder = "Please wait...."
        this.filePath = data.result
        this.docName = this.filePath.substring(this.filePath.lastIndexOf('/') + 1, this.filePath.length) || this.filePath;
        this.fileName = this.docName.substring(this.docName.lastIndexOf('.') + 1, this.docName.length) || this.docName;
        this.docType = this.fileName
        let url = data.result
        if (this.fileName == "docx") {
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = url;
          a.download = this.docName;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        } else if (this.fileName == "jpeg" || this.fileName == "jpg" || this.fileName == "png") {
          $('#addUploadDocBtn').click();
        } else {
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = url;
          a.target = 'blank';
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
        this.toastrService.error(data.hmsMessage.messageShort)
        this.showLoader = false
        this.hasImage = false
      }
    })
  }

  /**
   * Delete document
   * @param coDocumentKey 
   * @param coDocumentName 
   */
  deleteDocuments(coDocumentKey, coDocumentName) {
    var reqParam = {
      "coDocumentKey": coDocumentKey,
      'coDocumentName': coDocumentName
    }
    this.exDialog.openConfirm("Are you Sure You Want To Delete? ").subscribe((value) => {
      if (value) {
        this.showLoader = true
        this.hmsDataService.postApi(CompanyApi.deleteCompanyDocument, reqParam).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.showLoader = false;
            this.toastrService.success("Document Deleted successfully")
            this.getDocumentList()
          }
        })
      } else {
        return
      }
    })
  }

  closeModal() {
  }
}
