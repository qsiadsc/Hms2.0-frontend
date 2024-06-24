import { Component, OnInit, Input, QueryList, ViewChildren, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from '../../../../common-module/shared-services/validators/custom-validator.directive';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../../../common-module/shared-services/datatable.service'
import { HmsDataServiceService } from '../../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { DatePipe } from '@angular/common';
import { CurrentUserService } from '../../../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CardServiceService } from '../../../../card-module/card-service.service';
import { ChangeDateFormatService } from '../../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CommonDatePickerOptions } from '../../../../common-module/Constants'; // import common date format

@Component({
  selector: 'app-comment-model-cardholder',
  templateUrl: './comment-model.component.html',
  styleUrls: ['./comment-model.component.css'],
  providers: [DatatableService, DatePipe]
})

export class CommentModelComponentCardholder implements OnInit {
  currentUser: any;
  userGroupData: any;
  selectedGroupkey: any;
  @Input() commentForm: FormGroup;
  @Input() commentFormEditMode: any;
  @Input() commentsParams: any;
  @Input() enableAddButton: any;
  comments = [];
  commentsWithImp = [];
  commentsWithoutImp = [];
  comments1 = [];
  commentsWithImp1 = [];
  commentsWithoutImp1 = [];
  mergedComments = [];
  commentjson: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOldFilterOptions;//datepicker Options

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;

  @ViewChild("focusAddCommentEl") trgFocusAddCommentEl: ElementRef;
  expired: boolean;

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private datePipe: DatePipe,
    public currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private cardService: CardServiceService,

  ) {
    this.currentUserService.loggedInUserVal.subscribe(val => {
      if (val) {
        this.currentUser = val
        if (this.currentUser.userGroup && this.currentUser.userGroup.length > 0) {
          this.userGroupData = this.completerService.local(
            this.currentUserService.currentUser.userGroup,
            "userGroupName",
            "userGroupName"
          );
        }
      }
    })

  }
  commentAdd = true;
  commentEdit = false;

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
    this.commentForm = new FormGroup({
      commentTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]),
      isImportant: new FormControl(''),
      expiry_date: new FormControl(''),
      userGroupKey: new FormControl('', [Validators.required])
    });

    if (this.commentFormEditMode) {
    }


    this.dtOptions['comments'] = {
      // Below 4 lines changed to correct the pagination of comments in add mode.
      dom: 'ltirp', 
      "ordering": false, 
      pageLength: 5, 
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]], 
    };
    this.dtTrigger['comments'] = new Subject();
  }

 
  ngAfterViewInit(): void {
    this.dtTrigger['comments'].next()
  }
 

  reloadTable() {
    this.dataTableService.reloadTableElem(this.dtElements, "comments", this.dtTrigger['comments'], false);
  }
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
  resetComment(commentForm) {
    commentForm.reset();
    this.comments = [];
    this.commentjson = [];
    this.commentsWithImp = [];
    this.commentsWithoutImp = [];
    this.mergedComments = [];
    this.reloadTable();
  }

  addComment(commentForm) {
    if (this.commentForm.valid) {
      if (this.commentForm.value.commentTxt) {
        if (this.comments != null) {
          this.comments = this.comments;
        } else {
          this.comments = [];
        }
        var id = localStorage.getItem('id')
        var username = localStorage.getItem('user')
        var department = this.hmsDataServiceService.getUserDepartment()
        let currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');

        let obj = {
          userId: id,
          userGroupKey: this.selectedGroupkey,
          department: department,
          createdOn: currentDate,
          username: username,
          commentTxt: commentForm.value.commentTxt,
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(commentForm.value.expiry_date),
          commentImportance: (commentForm.value.isImportant == '' || commentForm.value.isImportant == null) ? "N" : "Y"
        };

        if (commentForm.value.isImportant) {
          this.commentsWithImp.push(obj);
          this.commentsWithImp.reverse();
        } else {
          this.commentsWithoutImp.push(obj);
          this.commentsWithoutImp.reverse();
        }
        this.comments = this.commentsWithImp.concat(this.commentsWithoutImp);
        this.commentjson = this.comments;

        // add by mukul to change date format in comments table
        let obj1 = {
          userId: id,
          userGroupKey: this.selectedGroupkey,
          department: department,
          createdOn: this.changeDateFormatService.changeDateByMonthName(currentDate),
          username: username,
          commentTxt: commentForm.value.commentTxt,
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(commentForm.value.expiry_date) ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(commentForm.value.expiry_date)) : '',

          commentImportance: (commentForm.value.isImportant == '' || commentForm.value.isImportant == null) ? "N" : "Y"
        };
        if (commentForm.value.isImportant) {
          this.commentsWithImp1.push(obj1);
          this.commentsWithImp1.reverse();
        } else {
          this.commentsWithoutImp1.push(obj1);
          this.commentsWithoutImp1.reverse();
        }
        this.comments1 = this.commentsWithImp1.concat(this.commentsWithoutImp1);
        // end
        this.commentForm.reset();
        this.reloadTable()
      }
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

  resetSaveCommentForm() {
    this.commentForm.reset();
  }

  setCommentModalFocus() {
    // Set focus on first input field
    this.setElementFocus('trgFocusAddCommentEl');
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

}
