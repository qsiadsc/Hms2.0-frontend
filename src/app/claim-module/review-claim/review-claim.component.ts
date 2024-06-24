import { Component, OnInit, Input, QueryList, ViewChildren, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { RequestOptions, Http, Headers } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Constants } from '../../common-module/Constants'
import { ClaimApi } from '../claim-api'
import { ClaimService } from '../claim.service';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CommonApi } from '../../common-module/common-api'
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";

@Component({
  selector: 'app-review-claim',
  templateUrl: './review-claim.component.html',
  styleUrls: ['./review-claim.component.css'],
  providers: [ExDialog, TranslateService]
})
export class ReviewClaimComponent implements OnInit {
  hideForOp: boolean =false;
  saveBtn: boolean;
  enaableSendForReview: boolean  = false;
  refToReviewer: boolean = false;

  @Input() reviewKey
  @Input() reviewStatus
  @Input() showAddReview
  @Output() onSaveReview: EventEmitter<any> = new EventEmitter<any>();
  @Input() claimAuthChecks
  @Input() viewMode: boolean;
  @Input() disableDctrBtn: boolean;
  @Input() disablSendDocbtn :boolean;
  @Input() disableReviewButon :boolean;
  reviewClaim: FormGroup;
  error: any;
  error1: any;
  error2: any;
  error3: any;
  disableIC:boolean=false
  disableCC:boolean=false
  externalCommentError: any;
  selectedFile: any;
  selectedFileName
  scannedDocumentList = []
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  userRole
  allowedValue: boolean = false
  showDeniedLineItem: boolean = false
  allowedExtensions = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword", "image/jpg", "image/jpeg", "image/png"]
  claimId;
  disciplineKey;
  reviewClaimList = []
  doctorStatusList = []
  partialApprovedType = []
  deniedType = []
  additionalInfoAndSubType = []
  showAdditonalInfo: boolean = false
  showdropDown: boolean = false
  hasImage: boolean = false
  additonalInfoList = []
  selectedItems = [];
  dropdownSettings = {};
  checkedList = []
  additionalInfo = []
  additionalInfoSubType = []
  selectedRadioBtn
  selectedcheckbox
  selctedDropDownVal
  statusCd = []
  dentRevStatusAddInfoType = []
  imagePath
  docType
  docName
  blobUrl
  showLoader: boolean = false
  fileUploadProgress = 0
  fileSizeExceeds: boolean = false
  showLineItem: boolean = false
  loaderPlaceHolder
  lineItemDropDown = []
  lineItemSettings
  selectedLineItem = []
  commentList = { 'externalComments': '', 'detailKey': '' }
  editComment: boolean = false
  consltantComment
  detailKey
  claimItem
  claimItemReview
 
  userId
  isReviewer = false
  reviewGovClaimList = []
  reviewRefRevClaimList = []
  deniedLineItem = ""
  lineItemDenied = ""
  showReviewDiv: boolean = false
  disableReviewButton: boolean = false;
  currentUser: any;
  removePA: boolean =false;
  showRemoveButton: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private claimService: ClaimService,
    private translate: TranslateService,
    private datatableService: DatatableService,
    private currentUserService: CurrentUserService,
    private exDialog: ExDialog,
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
    this.externalCommentError = { isError: false, errorMessage: '' };
    claimService.emitOnSaveClaimItem.subscribe(value => {
      if (value == 'true') {
        this.getClaimItemList();
      }
    })
    claimService.getClaimItemsReview.subscribe(value => {
      if (value) {
        this.claimItemReview = value
      }
    })
    currentUserService.loggedInUserVal.subscribe(res => {
      if (res) {
        this.currentUser = res
        this.userId = this.currentUser.userId
      }
    })
  }

  ngOnInit() {
    this.userRole = localStorage.getItem('role');
    this.getClaimItemList()
    if(this.userRole==""){
      this.showReviewDiv=true
      this.hideForOp=true
    }
    this.dropdownSettings = Constants.angular2Multiselect
    this.lineItemSettings = Constants.multiselect
  
    this.dtOptions['scanClaimDocument'] = Constants.dtOptionsConfig
    this.dtTrigger['scanClaimDocument'] = new Subject();
    this.dtOptions['reviewClaim'] = Constants.dtOptionsConfig
    this.dtTrigger['reviewClaim'] = new Subject();
    this.dtOptions['consultantComments'] = Constants.dtOptionsConfig
    this.dtTrigger['consultantComments'] = new Subject();
    this.dtOptions['reviewGovClaim'] = Constants.dtOptionsConfig
    this.dtTrigger['reviewGovClaim'] = new Subject();
    this.route.params.subscribe((params: Params) => {
      this.claimId = params['id']
      this.disciplineKey = params['type']
      this.getDocumentList();
      this.getReviewClaimList();
      this.getDoctorStatus()
    });
    this.reviewClaim = new FormGroup({
      reviewstatus: new FormControl(null),
      internalComment: new FormControl(''),
      externalComment: new FormControl(''),
      additionalSubTypeKey: new FormControl(''),
    });
    let role = localStorage.getItem('role');
    this.userRole = role;
    if ((role == 'reviewer') || (role == 'govOfficial')) {
      this.isReviewer = true
    } else {
      this.isReviewer = false;
      if (role = "referReviwer") {
        this.refToReviewer = true
      }
    }
    if(role == 'reviewer'){
      this.disableIC =true
    }else{
      this.disableIC = false
    }
    if(role == 'referReviwer'){
      this.disableCC =true
    }else{
      this.disableCC = false
    }
    this.userId = this.currentUserService.currentUser.userId
  }

  ngAfterViewInit(): void {
    this.dtTrigger['scanClaimDocument'].next()
    this.dtTrigger['reviewClaim'].next()
    this.dtTrigger['consultantComments'].next()
    this.dtTrigger['reviewGovClaim'].next()
  }

  reloadTable(tableId) {
    this.datatableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  onFileChanged(event) {
    this.selectedFileName = ""
    this.selectedFile = event.target.files[0]
    var fileSize = this.selectedFile.size;
    if (fileSize > 1048576) {
      this.error3 = { isError: true, errorMessage: this.translate.instant('claims.review-claim.toaster.file-size-exced') };
      this.fileSizeExceeds = true
    }
    else {
      this.error3 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.selectedFileName = this.selectedFile.name
    this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: this.translate.instant('claims.review-claim.toaster.file-type-not-allowed') };
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
    // Below condition is for remove button show/hide function.
    if (this.selectedFile.name != undefined || this.selectedFile.name != null || this.selectedFile.name != "") {
      this.showRemoveButton = true
    }
    else{
      this.showRemoveButton = false
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
    this.showRemoveButton = false
  }
  onUpload() {
    if (this.allowedValue && !this.fileSizeExceeds) {
      this.showLoader = true
      this.loaderPlaceHolder = "Uploading File....."
      
      var formData = new FormData()
      let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
      let header = new Headers({ 'Authorization': this.currentUserService.token });
      let options = new RequestOptions({ headers: header });

      formData.append('file', this.selectedFile);
      formData.append('disciplineKey', this.disciplineKey);
      formData.append('claimKey', this.claimId);
      formData.append('docType', this.selectedFile.type);
      formData.append('userId', this.userId);
      
      this.hmsDataService.sendFormData(ClaimApi.uploadDocuments, formData).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          this.showLoader = false
          this.loaderPlaceHolder = ""
          this.toastrService.success("Document Uploaded successfully")
          this.removeExtension()
          this.selectedFileName = ""
          this.getDocumentList();
          this.enaableSendForReview = true;
          this.claimService.AIAdded.emit(false)
        } 
        // Added to show error if not uploaded successfully as per discussed. 
        else {
          this.showLoader = false
          this.loaderPlaceHolder = ""
          this.toastrService.error("Document Not Uploaded!")
          this.removeExtension()
          this.selectedFileName = ""
          this.getDocumentList();
          this.enaableSendForReview = true;
          this.claimService.AIAdded.emit(false)
        }
      })

    } else {
      return false
    }
    this.showRemoveButton = false
  }

  getDocumentList() {
    let isDoc ="F"
    if(localStorage.getItem("role") == "reviewer"){
      isDoc= "T"
    }
    var reqParam = {
      "disciplineKey": this.disciplineKey,
      "claimKey": this.claimId,
      "forDoc": isDoc
    }

    this.hmsDataService.postApi(ClaimApi.getDocumentList, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.scannedDocumentList = data.result
        this.reloadTable("scanClaimDocument")
      } else {
        this.scannedDocumentList = []
        this.reloadTable("scanClaimDocument")
      }
    })
  }

  viewDocuments(disciplineKey, claimScanDocKey, myModal) {
    this.showLoader = true
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    var reqParam = {
      "disciplineKey": disciplineKey,
      "claimScanDocKey": claimScanDocKey
    }
    this.hmsDataService.postApi(ClaimApi.getClaimReviewDocument, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showLoader = false
        this.loaderPlaceHolder = ""
        this.docName = data.result.docName
        let fileName = this.docName.substring(this.docName.lastIndexOf('.') + 1, this.docName.length) || this.docName;
        this.docType = data.result.docType
        this.imagePath = data.result.file
        if (fileName == "docx" || fileName == "docx") {
          var blob = this.hmsDataService.b64toBlob(this.imagePath, this.docType);
          this.blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = this.docName;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        } else {
          myModal.open();
        }
      } else {
        this.hasImage = false
      }
    })
  }
  closeModal(myModal) {
    this.hasImage = false
    myModal.close();
    // to show updated table after pop up closed. 
    this.ngOnInit()
    // Below one added to close edit mode when popup closed.
    this.editComment = false
  }

  deleteDocuments(disciplineKey, claimScanDocKey) {
    ;
    var reqParam = {
      "disciplineKey": disciplineKey,
      "claimScanDocKey": claimScanDocKey
    }
    this.exDialog.openConfirm("Are you Sure You Want To Delete? ").subscribe((value) => {
      if (value) {
        this.hmsDataService.postApi(ClaimApi.deleteClaimReviewDocument, reqParam).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success("Document Deleted successfully")
            this.getDocumentList()
          } else {

          }
        })
      } else {
        return
      }
    })
  }
  getReviewClaimList() {
    var reqParam = {
      "disciplineKey": this.disciplineKey,
      "claimKey": this.claimId,
      "userId": this.userId,
      "reviwerType": this.userRole == 'reviewer' ? "D" : "R"
    }
    this.hmsDataService.postApi(ClaimApi.getReviewClaimList, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.reviewClaimList = data.result.data[0].DoctorReviewList
        this.reviewRefRevClaimList = data.result.data[0].ReferReviewList;
        this.reloadTable("reviewGovClaim")    
      } else {
        this.reviewClaimList = []
        this.reviewRefRevClaimList = []
        this.reloadTable("reviewGovClaim")
      }
    })
  }
  deleteReview(detailKey) {
    var reqParam = {
      "detailKey": detailKey,
      // Missing reviewere type added to Api for deletion.
      "reviwerType": this.userRole == 'reviewer' ? "D" : "R"
    }
    this.exDialog.openConfirm("Are you Sure You Want To Delete? ").subscribe((value) => {
      if (value) {
        this.hmsDataService.postApi(ClaimApi.deleteClaimReview, reqParam).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success("Review Details Deleted Successfully")
            this.getReviewClaimList()
          } else {
            this.toastrService.success("Review Details Not Deleted!!")
          }
        })
      }
    })

  }
  getDoctorStatus() {
    let role = localStorage.getItem('role')
    let sndReview;
    if (role == 'referReviwer') {
      sndReview = "R"
    } else {
      sndReview = role == 'reviewer' ? "D" : "G"
    }

    let url = ClaimApi.getDoctorStatus + '/' + sndReview
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.doctorStatusList = data.result
        this.doctorStatusList = this.doctorStatusList.filter(function( obj ) {
          return obj.claimReviewStatusCd !== 'C' ;
        }); 
        this.doctorStatusList = this.doctorStatusList.filter(function( obj ) {
          return obj.claimReviewStatusCd !== 'R' ;
        }); 
        if(this.removePA){
          this.doctorStatusList = this.doctorStatusList.filter(function( obj ) {
            return obj.claimReviewStatusCd !== "PA";
          }); 
        }
      } else {
        this.doctorStatusList = []
      }
    })
  }
  getAdditionalInfo(event) {
    this.selectedItems = []
    this.selectedLineItem = []
    if (localStorage.getItem('role') == 'reviewer' || localStorage.getItem('role') == 'referReviwer') {
      if (event.target) {
        this.statusCd = this.doctorStatusList.filter(val => val.dentalReviewStatusKey == event.target.value).map(data => data.claimReviewStatusCd)

        if (this.statusCd[0] == "D") {
          this.showdropDown = true
          this.showAdditonalInfo = false
          this.showLineItem = false
          this.getDeniedType()
          this.claimService.calimSubmitted.emit(true)
          this.disableReviewButton=true;
        }
        else if (this.statusCd[0] == "PA") {
          this.showdropDown = true
          this.showLineItem = true
          this.showAdditonalInfo = false
          this.getPartialApprovedType()
          this.getClaimItemList();
          this.claimService.calimSubmitted.emit(true)
        }
        else if (this.statusCd[0] == "AI") {
          this.showAdditonalInfo = true
          this.showdropDown = false
          this.showLineItem = false
          this.getAdditionalInfoAndSubType();
          this.claimService.calimSubmitted.emit(true)

        }else if(this.statusCd[0] == "A"){
          this.disableReviewButton=true;
          this.showAdditonalInfo = false
          this.showdropDown = false
          this.showLineItem = false
          this.statusCd[0] = ""
          this.claimService.calimSubmitted.emit(true)
        }
        else {
          this.showAdditonalInfo = false
          this.showdropDown = false
          this.showLineItem = false
          this.statusCd[0] = ""
        }
      }
    } else {
      return
    }


  }
  getPartialApprovedType() {
    this.additonalInfoList = []
    this.hmsDataService.getApi(ClaimApi.getPartialApprovedType).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.additonalInfoList.push({ 'id': data.result[i].parAppKey, 'itemName': data.result[i].parAppDesc })
        }
      } else {
        this.additonalInfoList = []
      }
    })
  }
  getDeniedType() {
    this.additonalInfoList = []
    this.hmsDataService.getApi(ClaimApi.getDeniedType).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.additonalInfoList.push({ 'id': data.result[i].deniedTypeKey, 'itemName': data.result[i].deniedTypeDesc })
        }
      } else {
        this.additonalInfoList = [];
      }
    })
  }
  getAdditionalInfoAndSubType() {
    this.hmsDataService.getApi(ClaimApi.getAdditionalInfoAndSubType).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.additionalInfo = data.result.dentRevStatusAddInfoType
        this.additionalInfoSubType = data.result.dentRevStatusAddSubType
      } else {
        this.additionalInfo = []
        this.additionalInfoSubType = []
      }
    })
  }
  onSelectDropDown(item: any) {
    this.selctedDropDownVal = item.id
  }

  onDeSelectDropDown(item, type) {
    if (type == 'additionalInfo') {
      this.selctedDropDownVal = item.id
    }
    if (type == 'deniedLineItem') {
      this.deniedLineItem = item.id
    }
  }

  onCheckboxChange(option, event) {
    if (event.target.checked) {
      this.checkedList.push(option.additionalInfoKey);
    } else {
      for (var i = 0; i < this.additionalInfo.length; i++) {
        if (this.checkedList[i] == option.additionalInfoKey) {
          this.checkedList.splice(i, 1);
        }
      }
    }
    this.dentRevStatusAddInfoType = [];
    for (var i = 0; i < this.checkedList.length; i++) {
      var obj = {};
      obj["additionalInfoKey"] = this.checkedList[i];
      this.dentRevStatusAddInfoType.push(obj);
    }
  }

  onSelectLineItem(item: any) {
    this.deniedLineItem = item.id
  }

  saveReview() {
    if (this.reviewClaim.valid) {
      // let applicationRoleName = this.currentUserService.getApplicationNameByRoleKey(parseInt(localStorage.getItem('applicationRoleKey')))
      let applicationRoleName = this.currentUserService.getApplicationNameByRoleKey(parseInt(this.currentUserService.applicationRoleKey))
      this.disableReviewButton = true
      let statusDeniedTypeKey
      let StatusParAppTypeKey
      if (this.showdropDown == true) {
        if (this.selctedDropDownVal == "") {
          this.error1 = { isError: true, errorMessage: 'Please select Additional Info' };
          return false
        } else {
          if (this.statusCd[0] == "D") {
            statusDeniedTypeKey = this.selctedDropDownVal
            StatusParAppTypeKey = ""
          }
          if (this.statusCd[0] == "PA") {
            statusDeniedTypeKey = ""
            StatusParAppTypeKey = this.selctedDropDownVal
          }
        }
      }
      if (this.showAdditonalInfo == true) {
        if (this.dentRevStatusAddInfoType.length == 0) {
          this.error2 = { isError: true, errorMessage: 'Please select Additional Info' };
          return false
        }
      }
      let claimItemList = [];
      let lineItems = ""
      for (var i = 0; i < this.selectedLineItem.length; i++) {
        let obj = {}
        obj["claimItemId"] = this.selectedLineItem[i].id
        obj["status"] = "T"
        lineItems = lineItems + ',' + this.selectedLineItem[i].itemName
        claimItemList.push(obj);
      }
      lineItems = lineItems ? lineItems.substring(1) : ""
      let role = localStorage.getItem('role');
      let sender = ""
      if (role == "reviewer") {
        // Doctor
        sender = "D";
      } else if (role == "referReviwer") {
        // referReviwer 
        sender = "R";
      }
      var reqParam = {
        "reviewKey": this.reviewKey,
        "reviewStatusKey": (this.reviewClaim.value.reviewstatus != null && this.reviewClaim.value.reviewstatus != undefined) ? this.reviewClaim.value.reviewstatus : '1',
        "revStatusDeniedTypeKey": statusDeniedTypeKey,
        "revStatusParAppTypeKey": StatusParAppTypeKey,
        "revStatusAddInfoType": this.dentRevStatusAddInfoType,
        "revStatusAddSubTypeKey": this.reviewClaim.value.additionalSubTypeKey,
        "externalComments": this.reviewClaim.value.externalComment,
        "internalComments": this.reviewClaim.value.internalComment,
        "claimItemList": claimItemList,
        "dcrLineItemText": lineItems,
        "userId": this.userId,
        "reviewType": applicationRoleName,
        "reviewerType": sender,
        "dentalClaim": {
          "claimKey": this.claimId
        }
      }
      this.hmsDataService.postApi(ClaimApi.updateReferToReviewStatus, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          
          this.toastrService.success("Review Added successfully")
          this.disableReviewButton = false
          this.onSaveReview.emit(true)
          this.getReviewClaimList()
          this.reviewClaim.reset()
          this.selctedDropDownVal = ""
          this.selectedItems = []
          this.selectedLineItem = []
          this.showAdditonalInfo = false
          this.showdropDown = false
          this.showLineItem = false
          this.checkedList = []
          this.dentRevStatusAddInfoType = []
          this.error1 = { isError: false, errorMessage: '' };
          this.error2 = { isError: false, errorMessage: '' };
          this.additonalInfoList = []
          this.claimService.calimSubmitted.emit(true);
          if(this.userRole=="reviewer"){
            this.claimService.calimSubmitted.emit(false);
          }          
        } else {
          this.toastrService.error("Review not added successfully")
        }
      })
    } else {
      this.validateAllFormFields(this.reviewClaim);
    }
  }

  /* to fire validation of all form fields together */
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


  getClaimItemList() {
    var type
    var claimId
    var submitData = {}
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.route.params.subscribe((params: Params) => {
          claimId = params['id']
          type = params['type']
        });

        let submitType = this.claimService.getSubmitParam(type)
        submitData[submitType] = {
          "claimKey": +claimId,
        }
        this.hmsDataService.postApi(ClaimApi.getClaimItemByClaimKeyUrl, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            var claimItemDropDown = []
            this.claimItem = data.result[submitType].items
            var lineNo
            for (var i = 0; i < this.claimItem.length; i++) {
              if (this.claimItem[i].itemReviewInd == 'T') {
                lineNo = i + 1;
                claimItemDropDown.push({ 'id': this.claimItem[i].itemKey, 'itemName': "Line Item-" + lineNo + ' / ' + this.claimItem[i].itemProcedureCd });
              }
            }
            this.lineItemDropDown = claimItemDropDown;
            if(this.lineItemDropDown.length<=1){
              this.removePA=true;
            }else{
              this.removePA=false;
            }
       
          } else {
            this.lineItemDropDown = []
          }
        });
      }
    }
  }
  getConsultantClaim(reviewKey, modal, ) {
    // OP?D?R
    let   reviewFor = '';
    if (this.userRole == "") {
      reviewFor = 'OP';
    }else if(this.userRole == "reviewer"){
      reviewFor = 'D';
    }else if(this.userRole== "referReviwer"){
      reviewFor = 'R';
    }
    let submitInfo = {
      'detailKey': reviewKey,
      'reviwerType' :reviewFor
    }
    this.hmsDataService.postApi(ClaimApi.getConsltantComment, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.commentList = data.result
        data.result.dcrLineItemText != "" ? this.lineItemDenied = data.result.dcrLineItemText : this.lineItemDenied = "No Line Items Denied"
        data.result.reviewStatusDesc == "PARTIALLY APPROVED" ? this.showDeniedLineItem = true : this.showDeniedLineItem = false
        modal.open();
      } else {
        this.commentList = { 'externalComments': '', 'detailKey': '' }
      }
    })

  }
  editConsultantClaim(commentKey, cmntText) {
    this.editComment = true
    this.consltantComment = cmntText
    this.detailKey = commentKey
  }

  updateConsultantClaim(modal) {
    if (this.consltantComment == "" || this.consltantComment == null || this.consltantComment == undefined) {
      this.externalCommentError = { isError: true, errorMessage: 'This Field Is Required!' };
    } else {
      let submitInfo = {
        'detailKey': this.detailKey,
        'externalComments': this.consltantComment,
        "reviwerType": this.userRole == 'reviewer' ? "D" : "R"    // add for point no 266
      }
      this.externalCommentError = { isError: false, errorMessage: '' };
      this.hmsDataService.postApi(ClaimApi.updateConsltantComment, submitInfo).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.toastrService.success("Comment updated successfully")
          this.getConsultantClaim(this.detailKey, modal)
          this.clearConsultantClaim()
        } else {
          this.toastrService.error("Comment not updated!")                //change error msg 
        }
      })
    }
  }
  clearConsultantClaim() {
    // Below one commented to prevent edit form close on clear button.
    this.consltantComment = ""
    this.detailKey = ""
  }
}



