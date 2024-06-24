import { Component, OnInit, HostListener} from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { RequestOptions, Http, Headers } from '@angular/http';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../common-module/Constants'
import { DataEntryApi } from '../data-entry-api';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { ToastrService } from 'ngx-toastr'; //add toster service


@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css']
})
export class ReportingComponent implements OnInit {
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload','T')
  }
  error: any;
  error1: any;
  error2: any;
  error3: any;
  selectedFile: any;
  selectedFileName
  scannedDocumentList = []
  allowedValue: boolean = false
  allowedExtensions = ["text/plain"]
  fileUploadProgress = 0
  fileSizeExceeds: boolean = false
  showLineItem: boolean = false
  loaderPlaceHolder
  lineItemDropDown = []
  lineItemSettings
  selectedLineItem = []
  showLoader: boolean = false
  
  authCheck = [{
    'selectFile':'F',
    'Upload':'F',
    'Remove':'F',
    'paymentView':'F'
  }]
  constructor(
    private currentUserService: CurrentUserService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private translate: TranslateService
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }
  
  ngOnInit() {
    if(localStorage.getItem('isReload')=='T'){
      this.currentUserService.getUserAuthorization().then(res=>{
        let checkArray = this.currentUserService.authChecks['PTD'] 
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload','')
      })
    }else{
      let checkArray = this.currentUserService.authChecks['PTD']
      this.getAuthCheck(checkArray)
    }
  }
  getAuthCheck(claimChecks){
    let authCheck = []
    if(localStorage.getItem('isAdmin') == 'T'){
      this.authCheck = [{
        'selectFile':'T',
        'Upload':'T',
        'Remove':'T',
        'paymentView':'T'
      }]
    }else{
      for(var i= 0; i < claimChecks.length; i++ ){
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.authCheck = [{
        'selectFile':authCheck['IMP252'],
        'Upload':authCheck['IMP253'],
        'Remove':authCheck['IMP254'],
        'paymentView':authCheck['PTD397']
        
      }]
    }
  }
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
  
  removeExtension() {
    this.selectedFileName = ""
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }
  
  onUpload() {
    if (this.allowedValue && !this.fileSizeExceeds) {
      this.showLoader = true
      this.loaderPlaceHolder = "Uploading File....."
      var userId = localStorage.getItem('id')
      var formData = new FormData()
      let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
      let header = new Headers({ 'Authorization': this.currentUserService.token });
      let options = new RequestOptions({ headers: header });
      formData.append('file', this.selectedFile);
      this.hmsDataService.sendFormData(DataEntryApi.uploadReportingFile, formData).subscribe(data => {
        this.showLoader = false
        this.loaderPlaceHolder = ""
        this.toastrService.success("Payment Document Uploaded Successfully")
        this.removeExtension()
        this.selectedFileName = ""
      })
    } else {
      return false
    }
  }
  
}
