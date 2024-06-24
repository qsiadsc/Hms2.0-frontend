import { Component, OnInit, Input, QueryList, ViewChildren, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CommonApi } from '../../common-api'
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CompanyService } from '../../../company-module/company.service';
import { CompanyApi } from '../../../company-module/company-api'
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { CompleterService, CompleterItem } from 'ng2-completer';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { debug } from 'console';

@Component({
  selector: 'app-comment-edit-model',
  templateUrl: './comment-edit-model.component.html',
  styleUrls: ['./comment-edit-model.component.css'],
  providers: [DatatableService]
})
export class CommentEditModelComponent implements OnInit {
  currentUser: any;
  userGroupData: any;
  selectedGroupkey: any;
  @ViewChild("focusEditCommentEl") trgFocusEditCommentEl: ElementRef;
  @Input() commentForm: FormGroup;
  @Input() commentsParams: any;
  @Input() newCommentJson = [];
  @Input() getCommentJson = [];
  @Input() commentColumns = [];
  @Input() enableAddButton: any;
  comments = [];
  commentsWithImp = [];
  commentsWithoutImp = [];
  mergedComments = [];
  commentjson: any;
  newCommentData: any;
  firstComment;
  hideCommentButton
  showCommentForm: boolean = true;
  commentFormEditMode;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOldFilterOptions;
  expired: boolean;

  // Below 7 lines are for File Select field in comments.
  selectedFile;
  error: any;
  error1: any
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false

  constructor(
    private dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastr: ToastrService,
    private companyService: CompanyService,
    public currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private changeDateFormatService: ChangeDateFormatService,

  ) { 
    this.commentForm = new FormGroup({
      commentTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]),
      isImportant: new FormControl(''),
      userGroupKey: new FormControl('', [Validators.required]),
      expiry_date : new FormControl(''),
      // Below one is for File Select field in comments.
      brokerCommentsDocumentName: new FormControl('')
    });
    // Below 2 lines are to set errors false by default in File Select field of Comments.
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }

  ngOnInit() {
 
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        if (this.currentUserService.currentUser.userGroup && this.currentUserService.currentUser.userGroup.length > 0) {
          this.userGroupData = this.completerService.local(
            this.currentUserService.currentUser.userGroup,
            "userGroupName",
            "userGroupName"
          );
          localStorage.setItem('isReload', '')
        }
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        if (this.currentUserService.currentUser.userGroup && this.currentUserService.currentUser.userGroup.length > 0) {
          this.userGroupData = this.completerService.local(
            this.currentUserService.currentUser.userGroup,
            "userGroupName",
            "userGroupName"
          );
        }
      })
    }
    var self = this
    var tableId = "comments"
    if (this.commentsParams.requestMode == 'post') {
      var url = CommonApi.getCommentList + this.commentsParams.getCommentsListUrl;
    } else {
      var url = CommonApi.getCommentList + this.commentsParams.getCommentsListUrl + '/' + this.commentsParams.coKey;
    }
    var reqParam = [this.getCommentJson]
    var tableActions = []
    var dateCols = ['createdOn'];
    this.dataTableService.jqueryDataTableComment(tableId, url, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 5,[0],[5],[1, 2, 3], '', [4])
  }
// This Function is used to convert entered value to date format.
  // For Reference https://www.npmjs.com/package/angular4-datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.commentForm.patchValue(datePickerValue);
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
      this.commentForm.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
   
      if(!this.expired && obj ){
    self[formName].controls[frmControlName].setErrors({
      "dateNotValid": true
    });  
   }
    }
 
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);      
     }

  }
  updateComment(commentForm) {
    if (this.commentForm.valid) {
      var commentData = {};
      commentData[this.newCommentJson[0]] = this.commentsParams.coKey;
      commentData[this.newCommentJson[1]] = this.commentForm.value.commentTxt;
      commentData[this.newCommentJson[2]] = (this.commentForm.value.isImportant == '' || this.commentForm.value.isImportant == null) ? 'N' : 'Y';
      // Below line written to send file data also.
      // Below line commented for now because of backend work pending and does not expect file data in json.
      let date = this.changeDateFormatService.convertDateObjectToString(this.commentForm.value.expiry_date)
      commentData['expiredOn'] = date;
      commentData['userId'] = localStorage.getItem('id')
      commentData['userGroupKey'] = this.selectedGroupkey
      var updateCommentUrl = CommonApi.updateComment + this.commentsParams.addCommentUrl;
      this.hmsDataServiceService.postApi(updateCommentUrl, commentData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (commentData[this.newCommentJson[2]] == 'Y') {
            let commentObjForDetailPage = { 'firstComment': commentData[this.newCommentJson[1]], 'showCommentButton': 'Y' };
            this.companyService.showCommentFlag.emit(commentObjForDetailPage)
          }
          if (this.commentsParams.requestMode == 'post') {
            var getCommentList = CommonApi.getCommentList + this.commentsParams.getCommentsListUrl;
            var reqParam = [this.getCommentJson]
            this.dataTableService.jqueryDataTableReload("comments", getCommentList, reqParam)
            this.toastr.success('Comment Added Successfully!');
            this.commentForm.reset();
          } else {
            var getCommentList = CommonApi.getCommentList + this.commentsParams.getCommentsListUrl + '/' + this.commentsParams.coKey;
            this.hmsDataServiceService.get(getCommentList).subscribe(data => {
              this.toastr.success('Comment Added Successfully!');
            });
          }
        }
        this.commentForm.reset();
        this.showRemoveBtn = false;
      });
    } else {
      this.validateAllFormFields(this.commentForm);
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

  resetCommentForm() {
    this.commentForm.reset();
  }

  reloadImportantCommentList(coKey, type) {
    var tableId = "comments"
    var reqParam = [{ 'key': 'coKey', 'value': coKey }]
    var tableActions = []
    if (type == 'importantComment') {
      this.showCommentForm = false
      var URL = CompanyApi.getImportantCompanyCommentListUrl;
      var dateCols = ['createdOn'];
      if (!$.fn.dataTable.isDataTable('#comments')) {
        this.dataTableService.jqueryDataTableComment(tableId, URL, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, [0])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
      }
    } else {
      var URL = CompanyApi.getCompanyCommentListUrl;
      if (!$.fn.dataTable.isDataTable('#comments')) {
        this.dataTableService.jqueryDataTableComment(tableId, URL, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, [0])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
      }
      this.showCommentForm = true
    }
    $('#commentTextArea').focus();

  }

  setCommentModalFocus() {
    // Set focus on first input field
    this.setElementFocus('trgFocusEditCommentEl');
  }

  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(() => {
      self[el].nativeElement.focus();
    }, 200);
  }

  onSelect(selected: CompleterItem, type) {
    if (selected) {
      this.selectedGroupkey = selected.originalObject.userGroupKey
    }
  }

  // Below method is for File Select field with errors on conditions.
  fileUploadBroker(event) {
    this.commentForm.value.brokerCommentsDocumentName = ""
    this.selectedFile = event.target.files[0]
    let fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.error1 = { isError: true, errorMessage: 'File size shuold not greater than 2 Mb!' };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.error1 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.commentForm.patchValue({ 'brokerCommentsDocumentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only pdf file type are allowed.' };
      this.showRemoveBtn = true;
    } else {
      this.error = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }    
  }

  // Below method is to clear the File Select field.
  removeBrokerCommentsFile() {
    this.commentForm.patchValue({ 'brokerCommentsDocumentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }
}
