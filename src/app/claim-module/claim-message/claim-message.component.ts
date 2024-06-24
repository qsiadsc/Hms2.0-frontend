import { Component, OnInit, Input, QueryList, ViewChildren, EventEmitter, OnChanges, SimpleChange, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Constants } from '../../common-module/Constants'
import { ClaimApi } from '../claim-api'
import { ClaimService } from '../claim.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { debug } from 'util';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-claim-message',
  templateUrl: './claim-message.component.html',
  styleUrls: ['./claim-message.component.css'],
  providers: [DatatableService, DatePipe, TranslateService, ChangeDateFormatService]
})
export class ClaimMessageComponent implements OnInit, OnChanges {
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOldFilterOptions;
  claimCommmentKey: any;
  showAddUpdateBtn: boolean = false;
  disciplineKeyForComment: any;
  //businessType: any;
  showLoader: boolean;
  cardBusinessTypeKey: any;
  isUpdating = true
  @Input() customCommentForm: FormGroup;
  @Input() claimCommentForm: FormGroup;
  @Input() adjudicatedPercent;
  @Input() claimStatus;
  @Input() busKey;
  @Input() claimRefered;
  @Input() cardHolderKey;
  @Input() claimMsgEditMode: boolean; //set value edit value
  @Input() claimMsgViewMode: boolean; //set value View value
  @Input() claimMsgAddMode: boolean; //set value Add value
  @Input() reviewer: boolean;
  @Input() resetForm: any;
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  dropdownSettingsCustom = {}

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  comments = [];
  claimComment = [];
  commentsWithImp = [];
  claimCommentsWithImp = [];
  commentsWithoutImp = [];
  claimCommentsWithoutImp = [];
  mergedComments = [];
  commentjson: any;
  claimCommentjson: any;
  customComments = []
  multiSelectTexts = {                             //This property provide the texts which shown when items selected
    defaultTitle: 'Select',
  };
  viewMode: boolean = false
  optionsModel = [];
  disciplineKey;
  claimId;
  itemDropDown = new EventEmitter()
  systemMessage = []
  UreadMessage = 0
  customCommentsDropDown = []
  selectedCommentTxt = []
  commentdropdownSettings
  error: any;
  error1: any;
  error2: any
  error3: any;
  error4: any;
  customComentText
  currentUser: any;
  providerKey: any;
  allComments = []
  showCommentBussnsType: boolean = false;
  userGroupData: any;
  selcetdGroupkey: any;
  selcetdGroupName: any;
  expired: boolean;
  showCustomOption: boolean = false
  editClaimItemMsg: boolean = false
  claimItemComKey: any = ""
  lockClaimMsgStr: string
  isWebMobData: boolean = false
  webMobCommentData = []

  // Below 7 lines are for File Select field in comments. 
  selectedFile;
  fileError: any;
  fileError1: any;
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false
  claimMessagesSub: Subscription
  constructor(
    private dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private datePipe: DatePipe,
    private claimService: ClaimService,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private exDialog: ExDialog
  ) {
    currentUserService.loggedInUserVal.subscribe(val => {
      this.currentUser = val
      this.getUserBussinesType()
    })
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };
    this.itemDropDown.subscribe(value => {
      this.dropdownList = value
      var userId = ''
      if (this.currentUser) {
        userId = this.currentUser.userId
      } else {
        userId = this.currentUserService.currentUser.userId
      }

      var reqParam = {
        "discipline": +this.disciplineKey,
        "claimKey": +this.claimId,
        "userId": +userId,
        "cliamLineItem": this.dropdownList,
      }

      this.hmsDataService.postApi(ClaimApi.getClaimItemMessage, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.customComments = data.result
          if (!this.reviewer) {
            this.UreadMessage = data.recordsTotal
          }
          this.reloadTable("custom-comments")
        }
      }, (error) => {
      })

    })

    claimService.emitOnSaveClaimItem.subscribe(value => {

      if (value == 'true') {
        this.getClaimItemList();
      }
    })
    this.claimService.claimBussinessKey.subscribe(key => {
      this.customCommentsDropDown = [] // Log #1124: To remove duplicacy of comment list
      this.getCommentsDropDown(key)
    })

    /* Lock Processor Functionality*/
    claimService.getLockedMessage.subscribe(val => {
      this.lockClaimMsgStr = val
    }) 
     this.claimMessagesSub = claimService.mobilClaimItem.subscribe(data => {
      this.claimCommentForm.patchValue({"claimCoTxt":data.claimComment});
      if(data.claimComment){
        $("#claim-comments-tab").addClass("active");
        $("#sys-comments-tab").removeClass("active");
        $("#claim-system").removeClass("active");
        $("#claim-comments").addClass("active");
      }
      // Quikcard Dashboard > Initiate Claim - Default comments shown as discussed with Arun sir
      if (data) {
        if (this.route.snapshot.queryParams.isAdDash == 'true') {
          if (data.claimComment && data.claimComment != undefined &&  data.claimComment != '') {
            this.getClentComments()
          }
        } else {
          this.getClentComments()
        }
      } else {
        this.isWebMobData = false
      }
      this.getUserBussinesType()
    })
    // Below 2 lines are to set errors false by default in File Select field of Comments.
    this.error4 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }

  showComment: boolean = true;

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "resetForm" && !changedProp.firstChange) {
        document.getElementById('system_comment').click();
        this.claimCommentsWithImp = [];
        this.claimCommentsWithoutImp = [];
        this.claimComment = [];
        this.claimCommentjson = [];

        this.showComment = false;
        this.showAddUpdateBtn = false;
        this.claimCommentForm.get('claimImportance').reset();
        this.claimCommentForm.reset();
        this.dtTrigger['claim-comments'].unsubscribe();
        setTimeout(() => {
          this.showComment = true;
          this.dtOptions['claim-comments'] = Constants.dtOptionsConfig
          this.dtTrigger['claim-comments'] = new Subject();
          setTimeout(() => {
            this.dtTrigger['claim-comments'].next();
          }, 2000);
        }, 1000);

      }
    }

  }

  ngOnInit() {
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.viewMode = true;
        this.getClaimItemList()
        this.route.params.subscribe((params: Params) => {
          this.disciplineKey = params['type']
          this.claimId = params['id']
          this.claimService.getCardHolderKeyComment.subscribe(value => {
            if (value) {
              this.cardHolderKey = value;
              this.GetClaimComments(this.disciplineKey, this.claimId, "ClaimComment");
            }
          })

          this.getSystemMessages()
        })
      }

    }
    this.customCommentForm = new FormGroup({
      customcommentTxt: new FormControl(''),
      isImportant: new FormControl(''),
      comntClaimItem: new FormControl(''),
      customText: new FormControl('',[Validators.maxLength(500), CustomValidators.notEmpty])
    });
    this.claimCommentForm = new FormGroup({
      claimCoTxt: new FormControl('', [Validators.maxLength(500), CustomValidators.notEmpty]),
      claimImportance: new FormControl(''),
      expiryDateIC: new FormControl(''),
      claimCommentGroupKey: new FormControl(''),
      // Below one is for File Select field in comments. 
      claimsCommentsDocumentName: new FormControl('')
    });

    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Line Items",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      badgeShowLimit: true,
      enableSearchFilter: true,
      classes: "myclass custom-class"
    };
    this.dropdownSettingsCustom = {
      singleSelection: true,
      text: "Select Comment",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      badgeShowLimit: true,
      enableSearchFilter: true,
      classes: "myclass custom-class",
      noDataLabel: "No Record Found",
    }
    this.commentdropdownSettings = Constants.angular2Multiselect
    this.dtOptions['claim-system-message'] = Constants.dtOptionsConfig
    this.dtTrigger['claim-system-message'] = new Subject();
    this.dtOptions['claim-comments'] = Constants.dtOptionsConfig
    this.dtTrigger['claim-comments'] = new Subject();
    this.dtOptions['custom-comments'] = Constants.dtOptionsConfig
    this.dtTrigger['custom-comments'] = new Subject();
    this.dtOptions['custom-comments'] = Constants.dtOptionsConfig
    this.dtTrigger['custom-comments'] = new Subject();
    this.dtOptions['getAllComments'] = Constants.dtOptionsConfig
    this.dtTrigger['getAllComments'] = new Subject();

    var url = ClaimApi.getClaimItemMessageUrl
    var reqParam = []
    var tableActions = []
    if (this.currentUserService.currentUser) {
      this.currentUser = this.currentUserService.currentUser
      this.getUserBussinesType()
    }
  }
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    $(".selectiongroup input").removeClass('c_expiryDateColorRedError');
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.claimCommentForm.patchValue(datePickerValue);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        $(".selectiongroup input").addClass('c_expiryDateColorRedError');
        return;
      }
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.claimCommentForm.patchValue(datePickerValue);
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);

      if (!this.expired && obj) {
        self[formName].controls[frmControlName].setErrors({
          "prevoiusDateNotValid": true
        });
        $(".selectiongroup input").addClass('c_expiryDateColorRedError');
      }
    }

    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);

    }

  }
  getUserBussinesType() {
    if (this.currentUser.businessType.bothAccess) {
      this.showCommentBussnsType = true
      if (this.isWebMobData) {
        this.userGroupData = this.completerService.local(
          this.webMobCommentData,
          "userGroupName",
          "userGroupName"
        );
      } else {
        this.userGroupData = this.completerService.local(
          this.currentUser.userGroup,
          "userGroupName",
          "userGroupName"
        );
      }
      this.claimCommentForm.get('claimCommentGroupKey').setValidators([Validators.required])
    } else if (this.currentUser.userGroup.length > 1) {
      this.showCommentBussnsType = true
      if (this.isWebMobData) {
        this.userGroupData = this.completerService.local(
          this.webMobCommentData,
          "userGroupName",
          "userGroupName"
        );
      } else {
        this.userGroupData = this.completerService.local(
          this.currentUser.userGroup,
          "userGroupName",
          "userGroupName"
        );
      }
      this.claimCommentForm.get('claimCommentGroupKey').setValidators([Validators.required])
    } else {
      this.showCommentBussnsType = false
      if (this.isWebMobData) {
        this.userGroupData = this.completerService.local(
          this.webMobCommentData,
          "userGroupName",
          "userGroupName"
        );
      }
      this.claimCommentForm.get('claimCommentGroupKey').clearValidators()
    }
    this.claimCommentForm.get('claimCommentGroupKey').updateValueAndValidity()
  }
  GetClaimComments(disciplineKey, claimId, CommentType) {
    var userId = localStorage.getItem('id')

    if (CommentType == 'ClaimComment') {
      var reqParam = {
        "cardholderKey": this.cardHolderKey,
        "claimKey": +claimId,
        "providerKey": -1
      }
      this.hmsDataService.postApi(ClaimApi.getAllComments, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if ($.fn.dataTable.isDataTable('#claim-comments')) {
            var table = $('#claim-comments').DataTable();
            table.destroy();
          }

          // Log #1008: As per client new feedback
          let commentList = data.result.data
          let claimCommentList = commentList.filter( function (e) {
            switch (e.commentType) {
              case 'TPA Message':
                break;
              case 'Company Message':
                break;
              case 'Plan Message':
                break
              case 'Division Message':
                break
              case 'Service Provider Message':
                break
              case 'Cardholder Message':
                break;
              case 'Card Message':
                break
              default:
                return claimCommentList = e
            }
           })
           this.claimComment = claimCommentList
          if (this.isUpdating) {
            this.reloadTable("claim-comments");
          }
        }
        else if (data.code == 404 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.claimComment = [];
          this.reloadTable("claim-comments")
        }
      }, (error) => {
      })
    }
    else if (CommentType == 'CustomComment') {
      var reqParam1 = {
        "discipline": +disciplineKey,
        "claimKey": +claimId,
        "userId": +userId
      }
      this.hmsDataService.postApi(ClaimApi.getClaimItemMessage, reqParam1).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.customComments = data.result
          this.reloadTable("custom-comments")
        }
      }, (error) => {
      })
    }
    this.showLoader = false

  }

  ngAfterViewInit(): void {
    this.dtTrigger['custom-comments'].next()
    this.dtTrigger['claim-comments'].next()
    this.dtTrigger['claim-system-message'].next()
    this.dtTrigger['getAllComments'].next()
  }

  reloadTable(tableId) {
    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  resetComment(commentForm) {
    commentForm.reset();
    this.comments = [];
    this.commentjson = [];
    this.commentsWithImp = [];
    this.commentsWithoutImp = [];
    this.mergedComments = [];
  }

  onclaimItemSelect(event) {
    if (this.customCommentForm.value.comntClaimItem) {
      this.customCommentForm.value.comntClaimItem.filter(Number)
    }

  }
  onSelectDropDown(item) {
    this.customComentText = item.id
    // Log #1124: For Custom Option
    if(this.customComentText == 'Custom - Rejection reason'){
      this.showCustomOption = true
      this.customCommentForm.controls['customText'].setValidators([Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]);
      this.customCommentForm.controls['customText'].updateValueAndValidity();
    }else{
      this.showCustomOption = false
      this.customCommentForm.controls['customText'].clearValidators()
      this.customCommentForm.controls['customText'].updateValueAndValidity();
    }
    this.error = { isError: false, errorMessage: '' };
  }

  // Log #1125
  onDeSelectDropDown(item, type) {
    this.showCustomOption = false
  }

  onSelectItemList(item) {
    this.error1 = { isError: false, errorMessage: '' };
  }
  addCustomComment(customCommentForm, tableId, mode) {
    if (this.lockClaimMsgStr != "" && this.lockClaimMsgStr != undefined) {
      this.toastrService.error(this.lockClaimMsgStr)
      return
    }
    if (this.selectedCommentTxt.length == 0) {
      this.error = { isError: true, errorMessage: 'This Field Is Required' };
      return false
    } else {
      if (this.customCommentForm.valid) {
        var type
        var claimId
        var submitData = {}
        this.route.params.subscribe((params: Params) => {
          claimId = params['id']
          type = params['type']
        });
        let submitType = this.claimService.getSubmitParam(type)
        let claimItemList
        if (this.selectedItems.length == 0) {
          this.customCommentForm.controls['customText'].setValidators([Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]);
          this.customCommentForm.controls['customText'].updateValueAndValidity();
          this.error1 = { isError: true, errorMessage: 'This Field Is Required' };
          return false;
        }
        var selectedClaimIds = [];
        for (var i = 0; i < this.selectedItems.length; i++) {
          selectedClaimIds.push(this.selectedItems[i].id);
        }
        // Log #1124: Custom Message
        if (this.showCustomOption) {
          this.customComentText = this.customCommentForm.value.customText.trim()
        }
        if (this.editClaimItemMsg) {
          if (this.selectedItems.length > 1 ) {
            this.toastrService.error("You Cannot Update More Than One Item At A Time!")
            return
          }
        }
        this.showLoader = true
        var userId = this.currentUser.userId
      
        if (this.editClaimItemMsg) {
          submitData['action'] = ""
          submitData[submitType] = {
            "claimKey": +claimId,
            "userId": +userId,
            "cliamLineItem": this.selectedItems,
            "itemMessages": [{
              "itemKeys": selectedClaimIds,
              "claimItemCoTxt": this.customComentText,
              "claimItemComKey": this.claimItemComKey
            }]
          }
        } else {
          submitData['action'] = "add"
          submitData[submitType] = {
            "claimKey": +claimId,
            "userId": +userId,
            "cliamLineItem": this.selectedItems,
            "itemMessages": [{
              "itemKeys": selectedClaimIds,
              "claimItemCoTxt": this.customComentText,
            }]
          }
        }

        this.hmsDataService.postApi(ClaimApi.saveCustomComment, submitData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.showLoader = false
            this.claimCommentForm.get('claimCoTxt').clearValidators();
            this.claimCommentForm.get('claimCoTxt').updateValueAndValidity();
            this.claimCommentForm.get('claimCommentGroupKey').clearValidators();
            this.claimCommentForm.get('claimCommentGroupKey').updateValueAndValidity();
            var url = ClaimApi.getClaimItemMessage
            var self = this
            var tableId = "custom-comments-edit"
            var userId = this.currentUser.userId
            this.claimItemComKey = ""
            var reqParam = {
              "discipline": +this.disciplineKey,
              "claimKey": +this.claimId,
              "userId": +userId,
              "cliamLineItem": this.dropdownList,
            }
            this.hmsDataService.postApi(ClaimApi.getClaimItemMessage, reqParam).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                this.selectedCommentTxt = []

                this.customComments = data.result
                this.error = { isError: false, errorMessage: '' };
                if (!this.reviewer) {
                  this.UreadMessage = data.recordsTotal
                }
                this.reloadTable("custom-comments")
              }
            })
            this.selectedItems = [];
            this.showCustomOption = false
            if (this.editClaimItemMsg) {
              this.toastrService.success(this.translate.instant('claims.claims-toaster.EOBMessageUpdatedSucces'))
            } else {
              this.toastrService.success(this.translate.instant('claims.claims-toaster.EOBMessageAddedSucces'))
            }
            this.editClaimItemMsg = false

            this.customCommentForm.value.claimItemCoTxt = '';
            this.customCommentForm.reset();
          } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == "EOB_MESSAGE_CANNOT_BE_DUPLICATED") {
            this.showLoader = false
            this.toastrService.error(this.translate.instant('claims.claims-toaster.EOBMessageCannotBeDuplicate'))
          } else {
            this.showLoader = false
            this.toastrService.error(this.translate.instant('claims.claims-toaster.EOBMessageNotAdded'))
          }
        }, (error) => {
        })
      } else {
        this.validateAllFormFields(this.customCommentForm);
      }
    }
  }

  addClaimComment(claimCommentForm, tableId, mode) {
    if(claimCommentForm.value.claimCoTxt == "" || claimCommentForm.value.claimCoTxt == undefined){
      this.claimCommentForm.controls['claimCoTxt'].setValidators(Validators.required);
      this.claimCommentForm.controls['claimCoTxt'].updateValueAndValidity();
    }
    // Else part written to clear the validation in case where department section hidden in some users accessibility.
    else{
      this.claimCommentForm.get('claimCommentGroupKey').clearValidators();
      this.claimCommentForm.get('claimCommentGroupKey').updateValueAndValidity();
    }
    if((claimCommentForm.value.claimCommentGroupKey == "" || claimCommentForm.value.claimCommentGroupKey == undefined) && this.showCommentBussnsType ){
      this.claimCommentForm.controls['claimCommentGroupKey'].setValidators(Validators.required);
      this.claimCommentForm.controls['claimCommentGroupKey'].updateValueAndValidity();
    }
    
    if (this.lockClaimMsgStr != "" && this.lockClaimMsgStr != undefined) {
      this.toastrService.error(this.lockClaimMsgStr)
      return
    }
    if (this.claimCommentForm.valid) {
      if (this.claimCommentForm.value.claimCoTxt) {
        if (this.claimComment != null) {
          this.claimComment = this.claimComment;
        } else {
          this.claimComment = [];
        }

        let userGroup = ""
        let userGroupName = "";
        if (this.showCommentBussnsType) {
          userGroup = this.selcetdGroupkey
          userGroupName = this.selcetdGroupName
        } else {
          userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
          userGroupName = this.currentUserService.currentUser.userGroup[0].userGroupName
          // userGroupName = this.currentUserService.currentUser.userGroup[5].userGroupName
        }

        var userId = this.currentUser.userId
        var username = this.currentUser.username
        let currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
        let obj = {
          userId: +userId,
          department: userGroupName,
          createdOn: currentDate,
          username: username,
          claimCoTxt: claimCommentForm.value.claimCoTxt,
          expiredOn: this.changeDateFormatService.convertDateObjectToString(claimCommentForm.value.expiryDateIC),
          userGroupKey: userGroup,
          claimComKey: '',
          claimImportance: (claimCommentForm.value.claimImportance == '' || claimCommentForm.value.claimImportance == null) ? "N" : "Y"

        };

        if (claimCommentForm.value.claimImportance) {
          this.claimCommentsWithImp.push(obj);
          this.claimCommentsWithImp.reverse();
        } else {
          this.claimCommentsWithoutImp.push(obj);
          this.claimCommentsWithoutImp.reverse();
        }
        this.claimComment = this.claimCommentsWithImp.concat(this.claimCommentsWithoutImp);
        this.claimCommentjson = this.claimComment;
        if (mode == 'editMode') {
          obj['discipline'] = +this.disciplineKey,
            obj['claimKey'] = +this.claimId,
            this.hmsDataService.postApi(ClaimApi.saveClaimComment, obj).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                this.error = { isError: false, errorMessage: '' };
                this.error1 = { isError: false, errorMessage: '' };
                this.GetClaimComments(this.disciplineKey, this.claimId, "ClaimComment");
                this.toastrService.success(this.translate.instant('claims.claims-toaster.comment'));    
              }
            }, (error) => {
            })
        }
        this.reloadTable(tableId)
        this.claimCommentForm.get('claimImportance').reset();
        this.claimCommentForm.reset();
      }
    } else {
      this.validateAllFormFields(this.claimCommentForm);
    }
    this.showRemoveBtn = false;
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

  resetSavecustomCommentForm() {
    this.customCommentForm.reset();
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
            var claimItem = data.result[submitType].items
            var lineNo

            for (var i = 0; i < claimItem.length; i++) {
              lineNo = i + 1;
              var toothNo
              if (claimItem[i].itemToothId) {
                toothNo = ' / ' + claimItem[i].itemToothId
              } else {
                toothNo = ''
              }
              claimItemDropDown.push({ 'id': claimItem[i].itemKey, 'itemName': "Line Item-" + lineNo + ' / ' + claimItem[i].itemProcedureCd + toothNo });
            }
            this.dropdownList = claimItemDropDown
            this.itemDropDown.emit(this.dropdownList)
          } else {
            this.dropdownList = []
          }
        }, (error) => {
        });
      }
    }
  }

  getSystemMessages() {
    if (this.disciplineKey && this.claimId) {
      var reqParam = {
        "discipline": +this.disciplineKey,
        "claimKey": +this.claimId,
      }
      this.hmsDataService.postApi(ClaimApi.getSystemMessages, reqParam).subscribe(data => {
        this.systemMessage = []
        if (data.code == 200 && data.status == "OK") {
          this.systemMessage = data.result
          this.reloadTable("claim-system-message")
        } else {
          this.systemMessage = []
          this.reloadTable("claim-system-message") // show no data available massage in System massage table (task 250)
        }
      }, (error) => {
      })
    }
  }

  markComentUnread() {
    let claimItemComKey = this.customComments.filter(val => val.markAsRead == 'N').map(data => data.claimItemComKey)
    let submitInfo = {
      "discipline": +this.disciplineKey,
      "claimItemMessageKeys": claimItemComKey
    }
    this.hmsDataService.postApi(ClaimApi.setCustomCommet, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.UreadMessage = 0
      } else {
      }
    }, (error) => {
    })
  }

  // Issue_NO 396 Abhishek
  getCommentsDropDown(key) {
    let businessTypeKey = key;
    this.hmsDataService.getApi(ClaimApi.getCustomClaimComment + '/' + businessTypeKey).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.customCommentsDropDown = []
        for (var i = 0; i < data.result.length; i++) {
          // Log #1124: Dropdown Issue
          this.customCommentsDropDown.push({ 'id': data.result[i].claimRejectionReasonDesc, 'itemName': data.result[i].claimRejectionReasonDesc })
        }
      } else {
        this.customCommentsDropDown = []
      }
    }, (error) => {
    })
  }
  getAllCommentsData(cardholderKey, providerKey) {
    this.cardHolderKey = cardholderKey
    this.providerKey = providerKey
    this.getAllComments()
  }
  getAllComments() {
    this.allComments = []
    var reqParam = {
      "cardholderKey": this.cardHolderKey,
      "claimKey": +this.claimId,
      "providerKey": -1
    }
    this.hmsDataService.postApi(ClaimApi.getAllComments, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.allComments = data.result.data
        this.reloadTable("getAllComments")
      } else {
        this.allComments = []
      }
    }, (error) => {
    })
  }
  onSelect(selected: CompleterItem, type) {
    if (selected) {
      this.selcetdGroupName = selected.originalObject.userGroupName
      this.selcetdGroupkey = selected.originalObject.userGroupKey
    }
  }

  DeleteClaimComments(id, i, flag, commentText) {
    if (this.lockClaimMsgStr != "" && this.lockClaimMsgStr != undefined) {
      this.toastrService.error(this.lockClaimMsgStr)
      return
    }
    var reqParam = {
      "discipline": +this.disciplineKey,
      "claimComKey": +id,
    }
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete') + '' + this.translate.instant('card.exDialog.ques')).subscribe((value) => {
      if (value) {
        if (this.claimMsgAddMode) {
          this.claimComment.splice(i, 1);
          if (flag == "N") {
            var index = this.claimCommentsWithoutImp.map(function (o) { return o.attr1; }).indexOf(commentText);
            this.claimCommentsWithoutImp.splice(index, 1);

          } else if (flag == "Y") {
            var index = this.claimCommentsWithImp.map(function (o) { return o.attr1; }).indexOf(commentText);
            this.claimCommentsWithImp.splice(index, 1);

          }
        } else {

          this.hmsDataService.postApi(ClaimApi.deleteClaimCommentByClaimCommentIdUrl, reqParam).subscribe(data => {
            if (data.code == 200 && data.status == "OK") {
              this.GetClaimComments(this.disciplineKey, this.claimId, "ClaimComment")
            }
          }, (error) => {
          });

        }
      }
    });


  }

  EditClaimComments(id, flag, department, commentText, expiryDate, i) {
    if (this.lockClaimMsgStr != "" && this.lockClaimMsgStr != undefined) {
      this.toastrService.error(this.lockClaimMsgStr)
      return
    }
    let claimCommentFormValue = {
      claimCoTxt: commentText,
      claimImportance: flag == 'N' ? false : true,
      claimCommentGroupKey: department,
      expiryDateIC: this.changeDateFormatService.convertStringDateToObject(expiryDate)
    }
    this.claimCommentForm.patchValue(claimCommentFormValue);
    this.showAddUpdateBtn = true;
    this.claimCommmentKey = id;
    this.claimComment.splice(i, 1);
    if (flag == "N") {
      var index = this.claimCommentsWithoutImp.map(function (o) { return o.attr1; }).indexOf(commentText);
      this.claimCommentsWithoutImp.splice(index, 1);

    } else if (flag == "Y") {
      var index = this.claimCommentsWithImp.map(function (o) { return o.attr1; }).indexOf(commentText);
      this.claimCommentsWithImp.splice(index, 1);

    }

  }

  UpdateClaimComment(claimCommentForm, tableId, mode) {
    this.showLoader = true
    if (this.claimCommentForm.valid) {
      $(tableId).DataTable().clear().destroy();

      if (this.claimCommentForm.value.claimCoTxt) {
        if (this.claimComment != null) {
          this.claimComment = this.claimComment;
        } else {
          this.claimComment = [];
        }
        let userGroup = ""
        let userGroupName = ""
        if (this.showCommentBussnsType) {
          userGroup = this.selcetdGroupkey
          userGroupName = this.selcetdGroupName
        } else {
          userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
          userGroupName = this.currentUserService.currentUser.userGroup[0].userGroupName
        }
        var userId = this.currentUser.userId
        var username = this.currentUser.username
        let currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
        let expDate = this.changeDateFormatService.convertDateObjectToString(claimCommentForm.value.expiryDateIC)
        let obj = {
          userId: +userId,
          department: userGroupName,
          createdOn: currentDate,
          username: username,
          claimCoTxt: claimCommentForm.value.claimCoTxt,
          userGroupKey: userGroup,
          claimComKey: this.claimCommmentKey,
          claimImportance: (claimCommentForm.value.claimImportance == '' || claimCommentForm.value.claimImportance == null) ? "N" : "Y",
          expiredOn: expDate
        };

        if (claimCommentForm.value.claimImportance) {
          this.claimCommentsWithImp.push(obj);
          this.claimCommentsWithImp.reverse();
        } else {
          this.claimCommentsWithoutImp.push(obj);
          this.claimCommentsWithoutImp.reverse();
        }
        this.claimComment = this.claimCommentsWithImp.concat(this.claimCommentsWithoutImp);
        this.claimCommentjson = this.claimComment;
        if (mode == 'editMode') {
          obj['discipline'] = +this.disciplineKey,
            obj['claimKey'] = +this.claimId,
            this.hmsDataService.postApi(ClaimApi.saveClaimComment, obj).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                this.error = { isError: false, errorMessage: '' };
                this.error1 = { isError: false, errorMessage: '' };
                this.toastrService.success(this.translate.instant('claims.claims-toaster.commentUpdate'));
                this.showAddUpdateBtn = false;
                this.isUpdating = false;
                this.GetClaimComments(this.disciplineKey, this.claimId, "ClaimComment");
              }
            }, (error) => {
            })
        } else {
          this.showLoader = false
        }
        this.showAddUpdateBtn = false
        this.claimCommentForm.get('claimImportance').reset();
        this.claimCommentForm.reset();
      }

    } else {
      this.validateAllFormFields(this.claimCommentForm);
    }
  }

  // #1124: New Feedback Edit functionality 
  getCustomClaimItemData(rowData){
    if (this.lockClaimMsgStr != "" && this.lockClaimMsgStr != undefined) {
      this.toastrService.error(this.lockClaimMsgStr)
      return
    }
    this.editClaimItemMsg = true
    this.claimItemComKey = rowData.claimItemComKey
    this.selectedItems = [{ "id": rowData.itemKey, "itemName": rowData.itemName }];
    if(this.customCommentsDropDown) {
      let index = this.customCommentsDropDown.findIndex(x => x.itemName.trim() == rowData.claimItemCoTxt.trim())  // #1124: QA Point 4: feedback fixed
      if (index == -1 ) {
          this.showCustomOption = true
          this.selectedCommentTxt = [{ "id": 'Custom - Rejection reason', "itemName": 'Custom - Rejection reason' }];
          this.customCommentForm.patchValue({ 'customText': rowData.claimItemCoTxt.trim() })
          this.customCommentForm.controls['customText'].setValidators([Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]);
          this.customCommentForm.controls['customText'].updateValueAndValidity();
      } else {
          this.showCustomOption = false
          this.selectedCommentTxt = [{ "id": rowData.claimItemCoTxt, "itemName": rowData.claimItemCoTxt }];
          this.customComentText = rowData.claimItemCoTxt
          this.customCommentForm.patchValue({ 'customText': '' })
          this.customCommentForm.controls['customText'].clearValidators()
          this.customCommentForm.controls['customText'].updateValueAndValidity();        
      }
    }
  }
  
  // #1124: New Feedback Delete Functionality 
  deleteClaimItemCustomComment(key) {
    if (this.lockClaimMsgStr != "" && this.lockClaimMsgStr != undefined) {
      this.toastrService.error(this.lockClaimMsgStr)
      return
    }
    let discType
    this.route.params.subscribe((params: Params) => {
      discType = params['type']
    });
    let disciplineCd = this.claimService.getDisciplineCode(discType)
    this.exDialog.openConfirm(this.translate.instant('claims.claims-toaster.deleteConfirmation')).subscribe((value) => {
      if (value) {
        let requestData = {
          "claimItemComKey": key,
          "disciplineCd": disciplineCd
        }
        // #1124: New Feedback : API Integration
        this.hmsDataService.postApi(ClaimApi.deleteClaimItemMessageUrl, requestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == "DELETED") {
            this.selectedItems = []
            this.selectedCommentTxt = []
            this.customCommentForm.reset()
            this.editClaimItemMsg = false
            this.showCustomOption = false
            this.toastrService.success(this.translate.instant('claims.claims-toaster.EOBMessageDeletedSucces'))
            this.getClaimItemMessageList();
          } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == "ITEM_MESSAGE_NOT_FOUND") {
            this.toastrService.error(this.translate.instant('claims.claims-toaster.EOBMessageNotFound'))
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == "BAD_REQUEST") {
            this.toastrService.error(this.translate.instant('claims.claims-toaster.EOBMessageNotDeleted'))
          } else {
            this.toastrService.error(this.translate.instant('claims.claims-toaster.EOBMessageNotDeleted'))
          }
        }, (error) => {
      
        })
      }
    });
  }

  getClaimItemMessageList(){
    let userId = this.currentUser.userId
    var reqParam = {
      "discipline": +this.disciplineKey,
      "claimKey": +this.claimId,
      "userId": +userId,
      "cliamLineItem": this.dropdownList,
    }
    this.hmsDataService.postApi(ClaimApi.getClaimItemMessage, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.customComments = data.result
        if (!this.reviewer) {
          this.UreadMessage = data.recordsTotal
        }
        this.reloadTable("custom-comments")
      } else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.customComments = []
        this.reloadTable("custom-comments")
      }
    }, (error) => {
      
    })
  }

  // Below method is for File Select field with errors on conditions.
  claimCommentsFileUpload(event) {
    this.claimCommentForm.value.claimsCommentsDocumentName = ""
    this.selectedFile = event.target.files[0]
    let fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.error3 = { isError: true, errorMessage: this.translate.instant('common.fileSizeError') };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.error3 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.claimCommentForm.patchValue({ 'claimsCommentsDocumentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.error4 = { isError: true, errorMessage: this.translate.instant('common.fileTypeError') };
      this.showRemoveBtn = true;
    } else {
      this.error4 = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }    
  }

  // Below method is to clear the File Select field.
  removeClaimCommentsFile() {
    this.claimCommentForm.patchValue({ 'claimsCommentsDocumentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error4 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }
  // add by mukul for remove valadations on change of focus
  removeInternalValidations(){
  this.claimCommentForm.get('claimCoTxt').clearValidators();
  this.claimCommentForm.get('claimCoTxt').updateValueAndValidity();
  this.claimCommentForm.get('claimCommentGroupKey').clearValidators();
  this.claimCommentForm.get('claimCommentGroupKey').updateValueAndValidity();
  }
  removeEobValidations(){
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.customCommentForm.get('customText').clearValidators();
    this.customCommentForm.get('customText').updateValueAndValidity();
  }
  claimCoTxtValidations(){
    if(this.claimCommentForm.value.claimCoTxt == "" || this.claimCommentForm.value.claimCoTxt == undefined){
      this.claimCommentForm.controls['claimCoTxt'].setValidators(Validators.required);
      this.claimCommentForm.controls['claimCoTxt'].updateValueAndValidity();
    }
  }
  claimCommentGroupValidations(){
    if(this.claimCommentForm.value.claimCommentGroupKey == "" || this.claimCommentForm.value.claimCommentGroupKey == undefined){
      this.claimCommentForm.controls['claimCommentGroupKey'].setValidators(Validators.required);
      this.claimCommentForm.controls['claimCommentGroupKey'].updateValueAndValidity();
    }
  }
  customTextValidaton(){
    this.customCommentForm.controls['customText'].setValidators([Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]);
    this.customCommentForm.controls['customText'].updateValueAndValidity();
  }

  getClentComments() {
    this.isWebMobData = true;
    this.claimCommentForm.patchValue({"claimCommentGroupKey": "CLIENT_COMMENTS"})
    this.selcetdGroupkey = 370
    this.selcetdGroupName = "CLIENT_COMMENTS"
    let clientData = [{userGroupKey: 370, userGroupName: "CLIENT_COMMENTS"}]
    this.webMobCommentData = clientData.concat(this.currentUser.userGroup)
  }

  ngOnDestroy() {
    if (this.claimMessagesSub) {
      this.claimMessagesSub.unsubscribe()
    }
  }

}
