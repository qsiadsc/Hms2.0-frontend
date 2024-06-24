import { Component, OnInit, ViewChild, ViewChildren, HostListener, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { GeneralInformationComponent } from './general-information/general-information.component'
import { CardEligibilityComponent } from './card-eligibility/card-eligibility.component'
import { CardHolderComponent } from './card-holder/card-holder.component'
import { CardAddressComponent } from './card-address/card-address.component'
import { CardBankAccComponent } from './card-bank-acc/card-bank-acc.component'
import { CardApi } from './card-api'
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'
import { Constants } from './../common-module/Constants'
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service';
import { CommentModelComponent } from './../common-module/shared-component/CommentsModal/comment-model/comment-model.component';
import { CommentModelComponentCardholder } from './../common-module/shared-component/CommentsModal/comment-model-cardholder/comment-model.component';
import { DatatableService } from './../common-module/shared-services/datatable.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CardServiceService } from './card-service.service';
import { ToastrService } from 'ngx-toastr';
import { FormCanDeactivate } from './../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { ExDialog } from "./../common-module/shared-component/ngx-dialog/dialog.module";
import { TrusteeInformationComponent } from './trustee-information/trustee-information.component';
import { CustomValidators } from '../common-module/shared-services/validators/custom-validator.directive';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { CommonModuleComponent } from '../common-module/common-module.component'
import { CompanyApi } from '../company-module/company-api';
import { CompleterService, CompleterItem } from 'ng2-completer';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { CommonDatePickerOptions } from '../common-module/Constants';
import { Subscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-card-module',
  templateUrl: './card-module.component.html',
  styleUrls: ['./card-module.component.css'],
  providers: [ChangeDateFormatService, DatatableService, DatePipe, TranslateService, CommonModuleComponent],

})
export class CardModuleComponent extends FormCanDeactivate implements OnInit {
  cardHolderData: any;
  addCardHolderData: any = [];
  cardType: any;
  cardEffDate: any;
  cardContactKey: any;
  disableBtn: boolean;
  disableUntilSave: boolean;
  datatableElement: any;
  selcetdGroupName: any;
  expCheck: boolean;
  comenttext = ""
  showAddUpdateBtn: boolean = false;
  @ViewChildren(DataTableDirective)
  dtElements: DataTableDirective;
  allComments = [];
  dtTrigger: Subject<any>[] = [];
  dtOptions: DataTables.Settings[] = [];
  cardActiveTerminatedStatus: string;
  showLoader: boolean;
  previewData = {};
  hasPrevieData: boolean = false;
  businessTypeData: any;
  cardCommentsWithImp = [];
  businessTypeList: any;
  showCommentBussnsType: boolean = false;
  userGroupData: any;
  selcetdGroupkey: any;
  @Output() currentUser: any;
  oldCardComment: any;
  showOldCommentTab: boolean = false;
  expired: boolean;
  editCommentmode: boolean;
  cardCoTxt: any;
  userGroupKey: any;
  editUserKey: any;
  expandBtn: boolean = false;
  companyCovKey: any;
  companyAddComment: boolean = true;
  companyEditComment: boolean = false;
  companyuserGroupData: any;
  selectedGroupkey: any;
  companyCommentColumns: { title: any; data: string; }[];
  cdCompanyCommentKey: any;
  reqCompanyComment: { 'key': string; 'value': any; }[];
  coNameId: string;
  coPlanSelected: string;
  showFlag: boolean = false;
  addMore: boolean = false;
  redirectComapny: any = false;
  cardHolderKeys: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;
  myDatePickerOldOptions = CommonDatePickerOptions.myDatePickerOldFilterOptions;
  hideTrustee: boolean = true;
  showGreenFlag: boolean;
  showRedFlag: boolean;
  comenttextRed: any;
  submitData: any
  cardContactValExpiredOn: string;
  cardContactValEffectiveOn: string;
  cardContactVal: any;
  cardBankAccVal: any;
  cardBankAccExpiredOn: any;
  cardBankAccEffectiveOn: any;
  unitKey: any;
  compCoKey: Subscription;
  savedKey: Subscription;
  prefLang: Subscription;
  cardHolderNameSub: Subscription;
  cardHolderDetails: Subscription;
  cardHolderAdd: Subscription;
  redirectComp: Subscription;
  lang: Subscription;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  @ViewChild('FormGroup')
  @ViewChild(GeneralInformationComponent) generalInformationComponent; // to acces variable of general information form
  @ViewChild(CardEligibilityComponent) cardEligibilityComponent; // to acces variable of general information form
  @ViewChild(CardAddressComponent) cardAddressComponent; // to acces variable of general information form
  @ViewChild(CardBankAccComponent) cardBankAccComponent; // to acces variable of card holder form
  @ViewChild(CommentModelComponent) commentFormData; // to acces variable of Comment from 
  @ViewChild(CommentModelComponentCardholder) commentFormDataCardholder; // to acces variable of Comment from 


  @ViewChild(TrusteeInformationComponent) trusteeInformationComponent; // to acces variable of Comment from 
  @ViewChild(CardHolderComponent) cardHolderMainComponent: CardHolderComponent; // to acces variable of Comment from 
  FormGroup: FormGroup //intailize Form
  commentForm: FormGroup; //intailize Edit Comment Form
  commentFormCombined: FormGroup; //intailize Edit Comment Form
  editCompanyCommentForm: FormGroup; //intailize Edit Company Comment Form
  commentApiUrl; // comment api url which url is needed
  addMode: boolean = true; //Enable true when user add a new card
  viewMode: boolean = false; //Enable true after a new card added
  editMode: boolean = false;
  addModeCardHolder: boolean = true;
  test: any; //Enable true after viewMode when user clicks edit button
  add;
  groupId;
  cert;
  cdCommentKey;
  observableObj;
  addObservableObj;
  viewObservableObj;
  check = true;
  addCheck = true;
  viewCheck = true;
  addCardText;
  searchCard;
  disciplineKey;
  cardHeading: string;
  cardCommentjson: any;
  addCrdHlderDetails: boolean = false // show add cardHolder section
  isCardHolder: boolean = false
  alberta: boolean = false
  cardContactDetailsObj;
  getDetailsCompanyCokey: number;
  companyCoKey; //company cokey value gets when user select company
  getSavedCardKey; //get saved card kEY value after card is saved
  savedCardkey: number //holds card key that will come when gets card details by cardId
  savedCardBankAcctKey: number //holds card Bank Acct key that will come when gets card details by cardId
  savedCardBaKey: number //holds card Ba key that will come when gets card details by cardId
  savedcardContactKey: number //holds card contact key that will come when gets card details by cardId
  savedcdEligibilityKey: number //holds card Eligibility key that will come when gets card details by cardId
  cardKey;
  unTerminateButton: boolean = false;
  terminateMessage;//show terminate message
  activateCardMessage;//show activated card message 
  companyStatus;//for terminate/Activate card 
  terminateButton: boolean = false;
  getSavedCardValue
  cardStatus
  cardCommentImportance: boolean = false;
  error: any
  getUserKeyId: any;
  cardComment = [];
  breadCrumbText: string;
  breadCrumbMain: string;
  commentList = [];
  commentText;
  importantComment;
  commentColumns = [];
  cardHolderName;
  menu: any
  isCommentTypeExistRed: boolean = false
  cardCommentList = [
    { title: this.translate.instant('common.date'), data: 'createdOn' },
    { title: this.translate.instant('common.username'), data: 'username' },
    { title: this.translate.instant('common.department'), data: 'department' },
    { title: this.translate.instant('common.comments'), data: 'cardCoTxt' },
    { title: this.translate.instant('common.importance'), data: 'commentImportance' }
  ];

  card_holderColumns = [{ title: this.translate.instant('common.date'), data: 'createdOn' },
  { title: this.translate.instant('common.username'), data: 'username' },
  { title: this.translate.instant('common.comments'), data: 'cardCoTxt' },
  { title: this.translate.instant('common.department'), data: 'department' },
  { title: 'Expiry Date', data: 'expiredOn' },

  { title: this.translate.instant('common.importance'), data: 'commentImportance' },
  { title: this.translate.instant('common.action'), data: 'cdCommentKey' }
  ]
  /* coloumns for company datatable */
  columns = [
    { title: "Company No.", data: 'coID' },
    { title: "Company Name", data: 'coName' },
    { title: "City", data: 'cityName' },
    { title: "Province", data: 'provinceName' },
    { title: "Business Type", data: 'businessTypeDesc' }
    , { title: "Status", data: 'status' }
  ]
  submitted: boolean;
  userAuthCheck = [{
    "addCard": 'F',
    "searchCardHolder": 'F',
    "viewCard": 'F',
    "editCard": 'F',
    "addOverRides": 'F',
    "addExtraBenefits": 'F',
    "planDetails": 'F',
    "bankAccHistory": 'F',
    "addCardHolder": 'F',
    "viewCardHolder": 'F',
    "editCardHolder": 'F',
    "deleteCardHolder": 'F',
    "intiateClaimCardHolder": 'F',
    "claimItemsCardHolder": 'F',
    "totalsCardHolder": 'F',
    "printCardHolder": 'F',
    "terminateCardHolder": 'F',
    "activateCardHolder": 'F',
    "addComments": 'F',
    "generatePassword": 'F',
    "addViewTrustee": 'F'
  }]

  username = localStorage.getItem('user')
  department = this.hmsDataServiceService.getUserDepartment();
  currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
  commentsCurrentDate = this.changeDateFormatService.changeDateByMonthName(this.datePipe.transform(new Date(), 'dd/MM/yyyy'));
  selectedFile;
  error1: any
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false

  constructor(
    private fb: FormBuilder,
    private hmsDataServiceService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private changeDateFormatService: ChangeDateFormatService,
    private cardService: CardServiceService,
    private toastrService: ToastrService,
    private dataTableService: DatatableService,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private completerService: CompleterService,
  ) {
    super();
    this.compCoKey = cardService.getCompanyCoKey.subscribe((value) => {
      this.companyCoKey = value;
    });

    this.savedKey = cardService.setSavedCardKey.subscribe((value) => {
      this.getSavedCardKey = value
    })

    this.prefLang = cardService.getPrefferedLanguage.subscribe((value) => {
      this.getSavedCardValue = value.cardKery
    })

    this.cardHolderNameSub = cardService.getCardHolderNameForPrint.subscribe((value) => {
      this.cardHolderName = value
    })

    this.cardHolderDetails = cardService.cardholderSaveDetails.subscribe((value) => {
      this.cardHolderData = value
    })

    this.cardHolderAdd = cardService.cardholderAddDetails.subscribe((value) => {
      this.addCardHolderData = value
    })

    this.redirectComp = this.cardService.redirectCompany.subscribe((value) => {
      this.redirectComapny = value
    })

    this.lang = cardService.getPrefferedLanguage.subscribe((value) => {
      if (value.companyId == '08') {
        this.hideTrustee = false;
      }
    })

    dataTableService.CompanycommentsHasData.subscribe((data) => {
      if (data == 0) {
        this.showFlag = false
        return
      }
      let show = false;
      let truearrays = []

      if (data.length > 0) {
        this.showFlag = true;
        // Log #1008
        if (data[0].cardImportance == 'Y') {
          this.showRedFlag = true
          this.comenttext = data[0].commentTxt || data[0].commentText;
        } else {
          this.showRedFlag = false
          this.comenttext = data[0].commentTxt || data[0].commentText;
        }

        if (data[0].commentType == 'TPA Message' || data[0].commentType == 'Company Message' || data[0].commentType == 'Plan Message' || data[0].commentType == 'Division Message') {
          this.isCommentTypeExistRed = true
        } else if (data[0].commentType == 'Service Provider Message' || data[0].commentType == 'Cardholder Message' || data[0].commentType == 'Card Message') {
          this.isCommentTypeExistRed = false
        } else {
          this.isCommentTypeExistRed = false
        }
      } else {
        this.showFlag = false;
      }
    })
    dataTableService.cardCommentImportance.subscribe((value) => {
      this.cardCommentImportance = value;
    })
    this.error = { isError: false, errorMessage: '' };
    // Below 2 lines are to set errors false by default in File Select field of Comments
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };

  }
  commentsParams = {
    getCommentsListUrl: "card-service/getCardCommentsByCardId",
    getAllCardCommentsUrl: "card-service/getCardComment",
    addCommentUrl: "card-service/saveCardComments",
    requestMode: 'post',
    coKey: this.getSavedCardValue,
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.commentForm.patchValue(datePickerValue);
      this.commentFormCombined.patchValue(datePickerValue);
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
      this.commentFormCombined.patchValue(datePickerValue);

      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);

      if (!this.expired && obj) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  ngOnInit() {
    this.showLoader = true
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        var self = this
        setTimeout(function () {
          self.getAuthArray()
          self.showLoader = false
        }, 100)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        var self = this
        setTimeout(function () {
          self.getAuthArray()
          self.showLoader = false
        }, 100)
      })
    }
    this.addObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.addCheck = true) {
        if (this.addMode) {
          if ('card.text-add' == this.translate.instant('card.text-add')) {
          }
          else {
            this.cardHeading = this.translate.instant('card.text-add')
            this.breadCrumbText = this.translate.instant('card.text-add-new-card');
            this.breadCrumbMain = this.translate.instant('card.card');
            this.addCheck = false;
            this.addObservableObj.unsubscribe();
          }
        } else {
          this.addCheck = false;
          this.addObservableObj.unsubscribe();
        }
      }
    });

    $("input[type='text']").attr("autocomplete", "off");

    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.addMode = false;
        this.viewMode = true;
        this.editMode = false;
        this.FormGroup = this.fb.group({
          CardGeneralInformationFormGroup: this.fb.group(this.generalInformationComponent.cardGeneralInformationVal),
          CardEligibilityFormGroup: this.fb.group(this.cardEligibilityComponent.CardEligibilityVal),
          cardaddress: this.fb.group(this.cardAddressComponent.cardAddressVal),
          cardbankacc: this.fb.group(this.cardBankAccComponent.cardBankAccVal),
        })
      } else {
        this.FormGroup = this.fb.group({
          CardGeneralInformationFormGroup: this.fb.group(this.generalInformationComponent.cardGeneralInformationVal),
          CardEligibilityFormGroup: this.fb.group(this.cardEligibilityComponent.CardEligibilityVal),
          cardaddress: this.fb.group(this.cardAddressComponent.cardAddressVal),
          cardbankacc: this.fb.group(this.cardBankAccComponent.cardBankAccVal),
          cardHolderAddModeFormGroup: this.fb.group(this.cardHolderMainComponent.cardHolderAddModeFormGroupVal)
        })
      }
    } else {
      this.FormGroup = this.fb.group({
        CardGeneralInformationFormGroup: this.fb.group(this.generalInformationComponent.cardGeneralInformationVal),
        CardEligibilityFormGroup: this.fb.group(this.cardEligibilityComponent.CardEligibilityVal),
        cardaddress: this.fb.group(this.cardAddressComponent.cardAddressVal),
        cardbankacc: this.fb.group(this.cardBankAccComponent.cardBankAccVal),
        cardHolderAddModeFormGroup: this.fb.group(this.cardHolderMainComponent.cardHolderAddModeFormGroupVal)
      })
    }

    this.commentForm = new FormGroup({
      commentTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]),
      isImportant: new FormControl(''),
      cardCommentGroupKey: new FormControl(''),
      expiry_date: new FormControl('')

    });
    this.commentFormCombined = new FormGroup({
      commentTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]),
      isImportant: new FormControl(''),
      cardCommentGroupKey: new FormControl(''),
      expiry_date: new FormControl(''),
      cardholderCommentsDocumentName: new FormControl('')
    });

    this.editCompanyCommentForm = new FormGroup({
      commentTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]),
      isImportant: new FormControl(''),
      companyCommentGroupKey: new FormControl('', [Validators.required])
    });
    window.scrollTo(0, 0)

    this.route.queryParams.subscribe(params => {
      if (params.coId) {

        this.breadCrumbMain = this.translate.instant('card.text-company');
      }
    })

    this.dtOptions['getAllCardComments'] = Constants.dtOptionsConfig
    this.dtTrigger['getAllCardComments'] = new Subject();

    this.currentUserService.loggedInUserVal.subscribe(val => {
      if (val) {
        this.currentUser = val
        if (this.currentUser.userGroup && this.currentUser.userGroup.length > 0) {
          this.companyuserGroupData = this.completerService.local(
            this.currentUserService.currentUser.userGroup,
            "userGroupName",
            "userGroupName"
          );
        }
      }
    })
  }

  ngAfterViewInit() {
    this.dtTrigger['getAllCardComments'].next();
    //Delete Internal Card Comments
    var self = this;
    $(document).on('click', '#cardComments .del-ico', function () {
      var id = $(this).data('id');
      self.cdCommentKey = id
      self.deleteInternalCardComments(self.cdCommentKey)
    });

    $(document).on('click', '#cardComments .edit-ico', function () {
      var id = $(this).data('id');
      var key = $(this).data('key');
      var Imp = $(this).data('imp');
      var Dept = $(this).data('dept');
      var userId = $(this).data('user');
      var expdate = $(this).data('expiredon');
      self.expired = self.changeDateFormatService.isFutureFormatedDate(expdate);

      self.EditCardComments(id, key, Imp, Dept, userId, JSON.stringify(userId), expdate);

    })

    $(document).on('click', '#cardCommentsCombined .del-ico', function () {
      var id = $(this).data('id');
      self.cdCommentKey = id
      self.deleteInternalCardCommentsCombined(self.cdCommentKey)
      self.cdCommentKey.destroy();
    });

    $(document).on('click', '#cardCommentsCombined .edit-ico', function () {
      var id = $(this).data('id');
      var key = $(this).data('key');
      var Imp = $(this).data('imp');
      var Dept = $(this).data('dept');
      var userId = $(this).data('user');
      var expdate = $(this).data('expiredon');
      self.expired = self.changeDateFormatService.isFutureFormatedDate(expdate);

      self.EditCardCommentsCombined(id, key, Imp, Dept, userId, JSON.stringify(userId), expdate);

    })
    // --1116
    $(document).on('click', '#companyComments .edit-ico', function () {
      var id = $(this).data('id');
      var key = $(this).data('key');
      var Imp = $(this).data('imp');
      var Dept = $(this).data('dept');
      var userId = $(this).data('user');
      self.EditCompanyComments(id, key, Imp, Dept, userId, JSON.stringify(userId));

    });
    $(document).on('click', '#companyComments .del-ico', function () {
      var id = $(this).data('id');
      self.cdCommentKey = id
      self.deleteCompanyComments(self.cdCommentKey)
    });

    $(document).on('click', '.expand-ico', function () {
      var id = $(this).data('id');
      var key = $(this).data('key');
      $(this).closest('tr').find('.show-read-more').html(key);
      $(this).css("cursor", 'not-allowed');
      $(this).find('.fa-expand').css("cursor", 'not-allowed');
      return true;
    });
  }

  reloadTable(tableId) {
    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  getUserBussinesType() {
    if (this.currentUser.businessType.bothAccess || this.currentUser.isAdmin == 'T') {
      this.showCommentBussnsType = true
      this.userGroupData = this.completerService.local(
        this.currentUser.userGroup,
        "userGroupName",
        "userGroupName"
      );
      this.commentForm.get('cardCommentGroupKey').setValidators([Validators.required])
      this.commentFormCombined.get('cardCommentGroupKey').setValidators([Validators.required])
    } else {
      this.showCommentBussnsType = false
      this.commentForm.get('cardCommentGroupKey').clearValidators()
      this.commentFormCombined.get('cardCommentGroupKey').clearValidators()
    }
    this.commentForm.get('cardCommentGroupKey').updateValueAndValidity()
    this.commentFormCombined.get('cardCommentGroupKey').updateValueAndValidity()
  }

  getAuthArray() {
    let checkArray = this.currentUserService.authChecks['ANC'].concat(this.currentUserService.authChecks['VCD'])
    let viewVal = this.currentUserService.authChecks['SCH'].filter(val => val.actionObjectDataTag == 'SCH50').map(data => data)
    let searchVal = this.currentUserService.authChecks['SCH'].filter(val => val.actionObjectDataTag == 'SCH48').map(data => data)
    checkArray.push(viewVal[0])
    checkArray.push(searchVal[0])
    this.getAuthCheck(checkArray)
  }

  getAuthCheck(claimChecks) {
    this.currentUser = this.currentUserService.currentUser
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.userAuthCheck = [{
        "addCard": 'T',
        "searchCardHolder": 'T',
        "viewCard": 'T',
        "editCard": 'T',
        "addOverRides": 'T',
        "addExtraBenefits": 'T',
        "planDetails": 'T',
        "bankAccHistory": 'T',
        "addCardHolder": 'T',
        "viewCardHolder": 'T',
        "editCardHolder": 'T',
        "deleteCardHolder": 'T',
        "intiateClaimCardHolder": 'T',
        "claimItemsCardHolder": 'T',
        "totalsCardHolder": 'T',
        "printCardHolder": 'T',
        "terminateCardHolder": 'T',
        "activateCardHolder": 'T',
        "addComments": 'T',
        "generatePassword": 'T',
        "addViewTrustee": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.userAuthCheck = [{
        "addCard": authCheck['ANC52'],
        "searchCardHolder": authCheck['SCH48'],
        "viewCard": authCheck['SCH50'],
        "editCard": authCheck['VCD73'],
        "addOverRides": authCheck[''],
        "addExtraBenefits": authCheck[''],
        "planDetails": authCheck[''],
        "bankAccHistory": authCheck['VCD72'],
        "addCardHolder": authCheck['VCD60'],
        "viewCardHolder": authCheck['VCD61'],
        "editCardHolder": authCheck['VCD62'],
        "deleteCardHolder": authCheck['VCD63'],
        "intiateClaimCardHolder": authCheck['VCD67'],
        "claimItemsCardHolder": authCheck['VCD65'],
        "totalsCardHolder": authCheck['VCD64'],
        "printCardHolder": authCheck['VCD67'],
        "terminateCardHolder": authCheck['VCD68'],
        "activateCardHolder": authCheck['VCD69'],
        "addComments": authCheck['ANC51'],
        "generatePassword": authCheck['VCD71'],
        "addViewTrustee": authCheck['VCD70']
      }]
    }
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.enableViewMode();
      }
    }
    this.getUserBussinesType()
    return this.userAuthCheck
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

  primaryExists(arr) {
    let primarykey = 24;
    return arr.some(function (el) {

      return el.chRoleKey === primarykey;
    });
  }

  openModel(modal) {
    this.hmsDataServiceService.OpenCloseModal2(modal);
  }

  submitCardForm(myFormGroupForm, isCardHolder, isSave) {
    this.submitted = true;
    this.disableUntilSave = true;
    let formFields = ['cca_email', 'cca_effectivedate', 'cca_line', 'cca_line2', 'cca_postalcode', 'cca_city',
      'cca_province', 'cca_country', 'cca_fax', 'cca_phone']
    let hasValue = false
    formFields.forEach(value => {
      if ((this.FormGroup.controls.cardaddress.get(value).value) && this.FormGroup.controls.cardaddress.get(value).value != "") {
        hasValue = true
      }
    })

    let cardAdress = false
    if (this.FormGroup.value.CardGeneralInformationFormGroup.program == Constants.albertaGov && hasValue) {
      this.cardAddressComponent.removeValidation(Constants.albertaBusinessTypeCd, "mainForm", true)
      cardAdress = true
    } else if (this.FormGroup.value.CardGeneralInformationFormGroup.program == Constants.albertaGov && !hasValue) {
      this.cardAddressComponent.removeValidation(Constants.albertaBusinessTypeCd, "mainForm", false)
      cardAdress = false
    } else {
      this.cardAddressComponent.removeValidation(Constants.quikcardBusinessTypeCd, "mainForm", false)
      cardAdress = false
    }

    if (this.FormGroup.valid) {
      this.showLoader = true;
      if (this.addCardHolderData.length == 0) {
        let hasValue = false;
        this.submitted = false;
        this.disableUntilSave = false;
        this.toastrService.error(this.translate.instant('card.toaster.primary-required'));
        this.showLoader = false;
        return;
      }
      if ((!this.primaryExists(this.addCardHolderData)) && (this.FormGroup.value.CardGeneralInformationFormGroup.program != Constants.albertaGov)) {
        let hasValue = false;
        this.submitted = false;
        this.disableUntilSave = false;
        this.toastrService.error(this.translate.instant('card.toaster.primary-required'));
        this.showLoader = false;
        return;

      }

      const result = this.addCardHolderData.filter(i => i.chRoleKey == 24).length;

      if (result != 1 && (this.FormGroup.value.CardGeneralInformationFormGroup.program != Constants.albertaGov)) {
        let hasValue = false;
        this.submitted = false;
        this.disableUntilSave = false;
        this.toastrService.error(this.translate.instant('card.toaster.primary-exists'));
        this.showLoader = false;
        return;
      }
      // log 753 
      this.showLoader = false;
      this.addMoreCardholder(isSave).then(row => {
        if (this.addMore) {
          $('#btnOpenCardHolderAdd').trigger("click");
          this.submitted = false;
          this.disableUntilSave = false;
          this.showLoader = false;
          return;
        } else {
          var cardHolderAdminCm = [];
          var cardHolderAdminCmImportance = [];
          if (this.commentFormDataCardholder && this.commentFormDataCardholder.commentjson) {
            for (var i = 0; i < this.commentFormDataCardholder.commentjson.length; i++) {
              var commentImportance
              var userId = this.currentUser.userId
              if (this.commentFormDataCardholder.commentjson[i].commentImportance) {
                commentImportance = 'Y'
              } else {
                commentImportance = 'N'
              }
              cardHolderAdminCm.push({
                'userId': +userId, 'cardCoTxt': this.commentFormDataCardholder.commentjson[i].commentTxt,
                'commentImportance': this.commentFormDataCardholder.commentjson[i].commentImportance,
                'userGroupKey': this.commentFormDataCardholder.commentjson[i].userGroupKey,
                'expiredOn': this.commentFormDataCardholder.commentjson[i].expiredOn
              });
            }
          }
          this.cardContactVal
          if (!cardAdress && this.FormGroup.value.CardGeneralInformationFormGroup.program == Constants.albertaGov) {
            this.cardContactVal = null
          } else {
            if (!isSave) {
              this.cardContactValExpiredOn = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardaddress.cca_expirydate) ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardaddress.cca_expirydate)) : '',
                this.cardContactValEffectiveOn = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardaddress.cca_effectivedate))
            }
            else {
              this.cardContactValExpiredOn = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardaddress.cca_expirydate),
                this.cardContactValEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardaddress.cca_effectivedate)
            }
            this.cardContactVal = {
              "cardContactLine1MailAdd": this.FormGroup.value.cardaddress.cca_line,
              "cardContactLine2MailAdd": this.FormGroup.value.cardaddress.cca_line2,
              "cardContactPhoneNum": this.FormGroup.value.cardaddress.cca_phone ? this.FormGroup.value.cardaddress.cca_phone.replace(/[^0-9]/g, "") : '',
              "cardContactFaxNum": this.FormGroup.value.cardaddress.cca_fax.replace(/[^0-9 ]/g, ""),
              "cardContactEmailAdd": this.FormGroup.value.cardaddress.cca_email,
              "postalCD": this.FormGroup.value.cardaddress.cca_postalcode,
              "countryName": this.FormGroup.value.cardaddress.cca_country,
              "provinceName": this.FormGroup.value.cardaddress.cca_province,
              "cityName": this.FormGroup.value.cardaddress.cca_city,
              "expiredOn": this.cardContactValExpiredOn,
              "effectiveOn": this.cardContactValEffectiveOn,
              "cardContactExtension": this.FormGroup.value.cardaddress.cca_extension
            }
          }
          this.cardBankAccVal
          if (!isSave) {
            this.cardBankAccExpiredOn = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.expdate) ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.expdate)) : '',
              this.cardBankAccEffectiveOn = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.effdate))
          } else {
            this.cardBankAccExpiredOn = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.expdate),
              this.cardBankAccEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.effdate)
          }
          this.cardBankAccVal = {
            "cardBankNum": this.FormGroup.value.cardbankacc.bank,
            "cardBankBranchNum": this.FormGroup.value.cardbankacc.branch,
            "cardBankAccountNum": this.FormGroup.value.cardbankacc.account,
            "cardExpiredOn": this.cardBankAccExpiredOn,
            "cardBaEffectiveOn": this.cardBankAccEffectiveOn,
            "cardBaClientName": this.FormGroup.value.cardbankacc.client
          }
          if (this.cardBankAccVal.cardBankNum == '') {
            this.cardBankAccVal = null

          }
          // New field Employee number sent with save API
          this.submitData = {
            "coKey": +this.companyCoKey,
            "cardNum": this.FormGroup.value.CardGeneralInformationFormGroup.card_id,
            "employeeNumber": this.FormGroup.value.CardGeneralInformationFormGroup.employeeIdFormControl,
            "cardEmploymentDate": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardGeneralInformationFormGroup.employment_date),
            "languageKey": this.FormGroup.value.CardGeneralInformationFormGroup.prefered_language,
            "cardContact": this.cardContactVal,
            "cardBankAccount": this.cardBankAccVal,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardGeneralInformationFormGroup.card_effective_date),
            "cardPayToName": this.FormGroup.value.CardGeneralInformationFormGroup.payTo,
            "cardEligibility": {
              "unitKey": this.FormGroup.value.CardEligibilityFormGroup.plan,
              "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardEligibilityFormGroup.effective_date),
              "expireOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardEligibilityFormGroup.expiry_date)
            },
            "cardCommentsDtoList": cardHolderAdminCm
          }
          if (!isSave) {
            this.submitData = {
              "coKey": +this.companyCoKey,
              "cardNum": this.FormGroup.value.CardGeneralInformationFormGroup.card_id,
              "cardEmploymentDate": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardGeneralInformationFormGroup.employment_date) ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardGeneralInformationFormGroup.employment_date)) : '',
              "languageKey": this.FormGroup.value.CardGeneralInformationFormGroup.prefered_language,
              "cardContact": this.cardContactVal,
              "cardBankAccount": this.cardBankAccVal,
              "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardGeneralInformationFormGroup.card_effective_date),
              "cardPayToName": this.FormGroup.value.CardGeneralInformationFormGroup.payTo,
              "cardEligibility": {
                "unitKey": this.FormGroup.value.CardEligibilityFormGroup.plan,
                "effectiveOn": this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardEligibilityFormGroup.effective_date)),
                "expireOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardEligibilityFormGroup.expiry_date) ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardEligibilityFormGroup.expiry_date)) : ''
              },
              "cardCommentsDtoList": cardHolderAdminCm
            }
          }

          if (!isSave) {
            this.showLoader = false;
            this.hasPrevieData = true
            this.previewData = this.submitData;
            let hasValue = false;
            this.submitted = false;
            this.disableUntilSave = false;
            this.coNameId = localStorage.getItem("coNameId");
            this.coPlanSelected = localStorage.getItem("coPlanSelected")
            this.hmsDataServiceService.OpenCloseModalForOverride("cardHolderPrevie")
            return;
          }

          this.hmsDataServiceService.post(CardApi.saveCardUrl, this.submitData).subscribe(data => {

            if (data.code == 200 && data.status === "OK") {
              this.unitKey = data.result.cardEligibility.unitKey
              this.savedCardkey = data.result.cardKey;
              this.disableUntilSave = false;
              if (data.hmsMessage.messageShort == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
                this.toastrService.success("Effective date should be greater than previous Effective date.")
              }
              else {
                this.toastrService.success(this.translate.instant('card.toaster.card-add'));
              }
              if (this.addMode) {
                this.saveCardHolder();
                setTimeout(function () {
                  this.cardHolderMainComponent.getCardHolderList();
                }, 2000)
              }
              if (!this.addMode) {
                this.router.navigate(['/card/view', this.savedCardkey])
              }
              this.showLoader = false;

              this.cardService.setSavedCardKey.emit(this.savedCardkey)
            } else {
              this.showLoader = false;
              if (data.hmsMessage.messageShort == "CARD_NUMBER_ALREADY_USED") {
                this.toastrService.error(this.translate.instant('card.toaster.cardid-used'));
              } else if (data.hmsMessage.messageShort == "BANK_ACCOUNT_ALREADY_USED") {
                this.toastrService.error(this.translate.instant('card.toaster.bank-detail-used'));
              } else if (data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_PLAN_EFFECTIVEON") {
                this.toastrService.error(this.translate.instant('card.toaster.card-effective-greater'));
              } else if (data.hmsMessage.messageShort == "CARD_EFFECTIVE_ON_CANNOT_BE_GREATER_THAN_ELIGIBILITY_EFFECTIVE_ON") {
                this.toastrService.error('Card Effective On Cannot Be Greater Than Eligibility Effective On')
              } else if (data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
                this.toastrService.error('Card Eligibilty date should be greater than previous Expired date.')
              }
              // Error toaster added if response is 404 & message is as per in condition.
              else if (data.hmsMessage.messageShort == "EMPLOYEE_CARD_NUMBER_NOT_FOUND") {
                this.toastrService.error("Employee card number not found.");
              }
              else {
                this.toastrService.error(this.translate.instant('card.toaster.card-detail-notadd'));
              }
              this.disableUntilSave = false;
            }
            error => { }
          })
        }
      })
    } else {
      $("#cardContactAddress").attr("aria-expanded", "true");
      $("#cardaddressAccording").addClass("in");
      this.showLoader = false;
      this.validateAllFormFields(this.FormGroup);
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
      this.disableUntilSave = false;
    }
  }
  // log 753 
  addMoreCardholder(isSave) {
    let promise = new Promise((resolve, reject) => {
      if (!isSave) {
        this.addMore = false;
        resolve();
      } else {
        if (this.addMode) {
          this.exDialog.openConfirm(this.translate.instant('card.exDialog.addMore-cardHolders')
          ).subscribe((value) => {
            if (value) {

              this.addMore = true;
              resolve()
              return
            } else {
              this.addMore = false;
              this.showLoader = true;
              resolve()
            }
          })
        } else {
          this.addMore = false;
          resolve()
        }
      }
    })
    return promise;
  }

  previewCard(myFormGroupForm, isCardHolder) { }

  enableViewMode() {
    this.breadCrumbText
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false;
    this.terminateButton = false;
    this.unTerminateButton = false;
    this.cardHeading

    this.viewObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.viewCheck = true) {
        if (this.viewMode) {
          if ('card.text-view' == this.translate.instant('card.text-view')) {
          } else {
            this.cardHeading = this.translate.instant('card.text-view');
            this.breadCrumbText = this.translate.instant('card.text-view-card');
            this.breadCrumbMain = this.translate.instant('card.card');
            this.viewCheck = false;
            this.viewObservableObj.unsubscribe();
          }
        }
      }
    });
    this.FormGroup.disable();
    this.cardService.setBankAccDisable.emit(true)
    this.fillCardDetails()
  }

  fillCardDetails() {
    var cardKEY
    this.route.params.subscribe(params => {
      cardKEY = +params['id'];

    });
    /* #547*/
    var cardHolderKey;
    var unitKey
    this.route.queryParams.subscribe(queryParam => {
      cardHolderKey = queryParam['cardHolderKey']
      unitKey = queryParam['unitKey']
    })
    let submitData = {
      "cardKey": cardKEY,
      "cardHolderKey": cardHolderKey,
      "unitKey": unitKey
    }
    this.hmsDataServiceService.postApi(CardApi.getCardDetails, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        // To emit the value of Employee id from API to field.
        this.cardService.employeeNumber.emit(data.result.employeeNumber)
        if (data.result.businessTypeCd == Constants.quikcardBusinessTypeCd) {
          this.alberta = false;
        }
        else {
          this.alberta = true;
        }
        if (data.result.cardEligibility.expireOn) {
          this.expCheck = this.changeDateFormatService.isFutureDate(data.result.cardEligibility.expireOn);
          this.cardService.cardExpiry.emit(this.expCheck)
        }

        let editData =
        {
          CardGeneralInformationFormGroup: {
            company_name: 'seasia',
            program: data.result.businessType,
            card_id: data.result.cardNum,
            employment_date: this.changeDateFormatService.convertStringDateToObject(data.result.cardEmploymentDate),
            prefered_language: data.result.languageName,
            payTo: data.result.cardPayToName
          },
          cardaddress:
          {
            cca_line: data.result.cardContact.cardContactLine1MailAdd,
            cca_line2: data.result.cardContact.cardContactLine2MailAdd,
            cca_postalcode: data.result.cardContact.postalCD,
            cca_city: data.result.cardContact.cityName,
            cca_province: data.result.cardContact.provinceName,
            cca_country: data.result.cardContact.countryName,
            cca_fax: data.result.cardContact.cardContactFaxNum ? data.result.cardContact.cardContactFaxNum.trim() : '',
            cca_phone: data.result.cardContact.cardContactPhoneNum ? data.result.cardContact.cardContactPhoneNum.trim() : '',
            cca_extension: data.result.cardContact.cardContactExtension,
            cca_email: data.result.cardContact.cardContactEmailAdd,
            cca_effectivedate: this.changeDateFormatService.convertStringDateToObject(data.result.cardContact.effectiveOn),
            cca_expirydate: this.changeDateFormatService.convertStringDateToObject(data.result.cardContact.expiredOn),
            cca_webUserId: data.result.webUserId
          },
          CardEligibilityFormGroup: {
            plan: data.result.cardEligibility.unitKey,
            effective_date: this.changeDateFormatService.convertStringDateToObject(data.result.cardEligibility.effectiveOn),
            expiry_date: this.changeDateFormatService.convertStringDateToObject(data.result.cardEligibility.expireOn),
          },
          cardbankacc: {
            bank: data.result.cardBankAccount.cardBankNum,
            branch: data.result.cardBankAccount.cardBankBranchNum,
            account: data.result.cardBankAccount.cardBankAccountNum,
            client: data.result.cardBankAccount.bankName,
            effdate: this.changeDateFormatService.convertStringDateToObject(data.result.cardBankAccount.cardBaEffectiveOn),
            expdate: this.changeDateFormatService.convertStringDateToObject(data.result.cardBankAccount.cardExpiredOn),
          }
        }

        this.cardContactKey = data.result.cardContact.cardContactKey
        this.cardType = data.result.businessTypeKey
        this.cardEffDate = data.result.effectiveOn
        this.FormGroup.patchValue(editData);
        this.cardService.cardEffectiveOn.emit(data.result.effectiveOn)
        this.cardService.cardCreatedOn.emit(data.result.createdOn)
        this.cardService.cardBankCreatedOn.emit(data.result.cardBankAccount.createdOn)
        let formFields = ['cca_email', 'cca_effectivedate', 'cca_line', 'cca_line2', 'cca_postalcode', 'cca_city',
          'cca_province', 'cca_country', 'cca_fax', 'cca_phone']
        let hasValue = false
        formFields.forEach(value => {
          if ((this.FormGroup.controls.cardaddress.get(value).value) && this.FormGroup.controls.cardaddress.get(value).value != "") {
            hasValue = true
          }
        })

        let cardAdress = false
        if (this.FormGroup.value.CardGeneralInformationFormGroup.program == Constants.albertaGov && hasValue) {
          this.cardAddressComponent.removeValidation(Constants.albertaBusinessTypeCd, "mainForm", true)
          cardAdress = true
        } else if (this.FormGroup.value.CardGeneralInformationFormGroup.program == Constants.albertaGov && !hasValue) {
          this.cardAddressComponent.removeValidation(Constants.albertaBusinessTypeCd, "mainForm", false)
          cardAdress = false
        } else {
          this.cardAddressComponent.removeValidation(Constants.quikcardBusinessTypeCd, "mainForm", false)
          cardAdress = false
        }
        this.savedCardkey = data.result.cardKey
        this.groupId = data.result.coKey
        this.cert = data.result.cardNum
        this.savedCardBankAcctKey = data.result.cardBankAccount.cardBankAcctKey
        this.savedCardBaKey = data.result.cardBankAccount.cardBaKey
        this.savedcardContactKey = data.result.cardContact.cardContactKey
        this.savedcdEligibilityKey = data.result.cardEligibility.cdEligibilityKey
        this.getDetailsCompanyCokey = data.result.coKey
        this.cardStatus = data.result.status
        if (this.cardStatus == 'Inactive' || this.cardStatus == 'INACTIVE') {
          this.disableBtn = true
        }
        else {
          this.disableBtn = false
        }
        if (data.result.commentFlag == 'Y') {
          this.cardCommentImportance = true
        } else {
          this.cardCommentImportance = false;
        }
        if (data.result.commentText != "" && data.result.commentText != null) {
          this.commentText = data.result.commentText
          this.commentList = data.result.cardCommentsDtoList

        }
        this.companyCovKey = data.result.coKey;

        let editgeneralFormValue = {
          'savedCompanyStatus': data.result.coStatus,
          'businessType': data.result.businessType,
          'businessTypeKey': data.result.businessTypeKey,
          'languageKey': data.result.languageKey,
          'companyCoKey': data.result.coKey,
          'coName': data.result.coName,
          'unitKey': data.result.cardEligibility.unitKey,
          'cardNumber': data.result.cardNum,
          'cardKery': data.result.cardKey,
          'companyId': data.result.companyId,
          'cardType': data.result.cardType,
          'cardContactBaKey': data.result.cardBankAccount.cardBaKey,
          'cardBankAcctKey': data.result.cardBankAccount.cardBankAcctKey,
          'commentFlag': data.result.commentFlag,
          'divisonKey': data.result.divisonKey,
          'PlanKey': data.result.planKey,
          'CardEffectiveDate': data.result.cardEligibility.effectiveOn,
          'businessTypeCd': data.result.businessTypeCd,
        }
        if (data.result.cardComment) {
          this.oldCardComment = data.result.cardComment
          this.showOldCommentTab = true
        }

        this.cardService.cardStatus.emit(this.cardStatus)
        this.cardService.cardExpiryDate.emit(data.result.cardEligibility.expireOn);

        this.cardService.cardExpDate.emit({ 'expiry_date': this.changeDateFormatService.convertStringDateToObject(data.result.cardEligibility.expireOn) });

        this.cardService.cardEffDate.emit(data.result.cardEligibility.effectiveOn)
        this.cardService.cardEligKey.emit(this.savedcdEligibilityKey)
        this.companyStatus = data.result.coStatus;
        this.cardService.getPrefferedLanguage.emit(editgeneralFormValue);
        this.cardService.setOptionForPlan(data.result.cardEligibility.unitKey);
        var self = this
        var tableId = "cardCommentsCombined"
        if (this.commentsParams.requestMode == 'post') {
          var url = CardApi.getAllCardCommentsUrl;

        } else {
          var url = CardApi.getCardCommentsByCardIdUrl;
          var url = CardApi.getAllCardCommentsUrl;
        }
        let cKey: any = []
        let chKey
        if (this.cardHolderKeys.length >= 0) {
          this.route.queryParams.subscribe(queryParam => {
            chKey = queryParam['cardHolderKey']
          })
          let index = this.cardHolderKeys.findIndex(x => x == +chKey)
          if (index == -1) {
            cKey = [this.cardHolderKeys[0]]
          } else {
            cKey = [this.cardHolderKeys[index]]
          }
        }
        var userId = this.currentUserService.userType
        var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }, { 'key': 'cardHolderKeys', 'value': cKey }]

        var tableActions = [
          { 'name': 'edit', 'class': 'edit_row table-action-btn edit-ico ', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': 'T' },
          { 'name': 'delete', 'class': 'table-action-btn del-ico ', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': 'T' },
          { 'name': 'expand', 'class': ' expand_row table-action-btn expand-ico ', 'icon_class': 'fa fa-expand', 'title': 'Expand', 'showAction': 'T' },
        ]

        this.observableObj = Observable.interval(1000).subscribe(value => {
          if (this.check = true) {
            if ('common.date' == this.translate.instant('common.date')) {
            } else {
              this.commentColumns = [
                { title: this.translate.instant('common.date'), data: 'createdOn' },
                { title: this.translate.instant('common.username'), data: 'userName' },
                { title: this.translate.instant('common.comments'), data: 'commentText' },
                { title: this.translate.instant('common.department'), data: 'userGroupName' },
                { title: 'Expiry Date', data: 'expiredOn' },

                { title: this.translate.instant('common.importance'), data: 'cardImportance' },
                { title: this.translate.instant('common.action'), data: 'cardComKey' }
              ]
              var dateCols = ['createdOn', 'expiredOn'];

              if (!$.fn.dataTable.isDataTable('#' + tableId)) {
                this.dataTableService.jqueryDataTableComment(tableId, url, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 6, 5, dateCols, null, [1, 3, 4], 2)
              } else {
                this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
              }
              this.check = false;
              this.observableObj.unsubscribe();
              setTimeout(() => {
                this.getCommentList()
              }, 300);
            }
          }
        });

      } else { }
      error => { }
    });
  }

  getlang(KEY) {
    switch (KEY) {
      case 1:
        return "English";
      case 2:
        return "French";
      case 3:
        return "Spanish";
      default:
        return "English"
    }
  }

  custData(date) {
    switch (date) {
      case 23:
        return "Primary";
      case 24:
        return "Primary";
      case 25:
        return "Spouse";
      case 26:
        return "Dependent"
    }
  }

  custDate(date) {
    let formated = "--"
    if (date && date != '') {
      formated = this.changeDateFormatService.changeDateByMonthName(date);
    }
    return formated
  }

  getCompanyComment() {
    var tableId = 'companyComments';
    var url = CardApi.getAllCardCommentsUrl;
    this.route.queryParams.subscribe(params => {
      if (params.cardHolderKey) {
        this.cardHolderKeys = [params.cardHolderKey]
      }
    })
    this.reqCompanyComment = [{ 'key': 'cardHolderKeys', 'value': this.cardHolderKeys }];
    this.companyCommentColumns = [
      { title: 'Date', data: 'createdOn' },
      { title: 'User Name', data: 'userName' },
      { title: 'Department', data: 'userGroupName' },
      { title: 'Type', data: 'commentType' },
      { title: 'Comments', data: 'commentText' },
      { title: 'Importance', data: 'cardImportance' },
      { title: this.translate.instant('common.action'), data: 'cardComKey' }
    ];
    var tableActions = [
      { 'name': 'edit', 'class': 'edit_row table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': 'T' },
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': 'T' },
    ]
    var dateCols = ['createdOn'];
    if (!$.fn.dataTable.isDataTable('#' + tableId)) { //Issue_no 724
      this.dataTableService.jqueryDataTableComment(tableId, url, 'full_numbers', this.companyCommentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reqCompanyComment, tableActions, 6, 5, dateCols, [2], [1, 2, 3, 6])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, this.reqCompanyComment)
    }
  }

  getPlans(event) { }

  updateView(event) {
    this.fillCardDetails()
  }

  enableEditMode() {
    this.FormGroup.enable();
    this.breadCrumbText = this.translate.instant('card.text-edit-card');
    this.viewMode = false;
    this.addMode = false;
    this.editMode = true;
    this.cardHeading = this.translate.instant('card.text-edit');
    this.cardService.setBankAccDisable.emit(true)
    this.cardService.setEditModeForCompany.emit(true)
    this.terminateButton = true;
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
  }

  updateCardData(FormGroup) {
    this.submitted = true;
    let formFields = ['cca_email', 'cca_effectivedate', 'cca_line', 'cca_line2', 'cca_postalcode', 'cca_city',
      'cca_province', 'cca_country', 'cca_fax', 'cca_phone']
    let hasValue = false;
    formFields.forEach(value => {
      if ((this.FormGroup.controls.cardaddress.get(value).value) && this.FormGroup.controls.cardaddress.get(value).value != "") {
        hasValue = true;
      }
    })
    let cardAdress = false
    if (this.FormGroup.value.CardGeneralInformationFormGroup.program == Constants.albertaGov && hasValue) {
      this.cardAddressComponent.removeValidation(Constants.quikcardBusinessTypeCd, "mainForm", true)
      cardAdress = true
    } else {
      this.cardAddressComponent.removeValidation(Constants.albertaBusinessTypeCd, "mainForm", false)
      cardAdress = false
    }

    if (this.FormGroup.valid) {
      var companyValue
      if (this.companyCoKey) {
        companyValue = this.companyCoKey
      } else {
        companyValue = this.getDetailsCompanyCokey
      }
      let cardContactVal
      if (!cardAdress && this.FormGroup.value.CardGeneralInformationFormGroup.program == Constants.albertaGov) {
        cardContactVal = null
      } else {
        cardContactVal = {
          "cardContactLine1MailAdd": this.FormGroup.value.cardaddress.cca_line,
          "cardContactLine2MailAdd": this.FormGroup.value.cardaddress.cca_line2,
          "cardContactPhoneNum": this.FormGroup.value.cardaddress.cca_phone ? this.FormGroup.value.cardaddress.cca_phone.replace(/[^0-9]/g, "") : '',
          "cardContactFaxNum": this.FormGroup.value.cardaddress.cca_fax.replace(/[^0-9 ]/g, ""),
          "cardContactEmailAdd": this.FormGroup.value.cardaddress.cca_email,
          "postalCD": this.FormGroup.value.cardaddress.cca_postalcode,
          "countryName": this.FormGroup.value.cardaddress.cca_country,
          "provinceName": this.FormGroup.value.cardaddress.cca_province,
          "cityName": this.FormGroup.value.cardaddress.cca_city,
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardaddress.cca_expirydate),
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardaddress.cca_effectivedate),
          "cardContactExtension": this.FormGroup.value.cardaddress.cca_extension,
          "cardContactKey": this.cardContactKey
        }
      }
      // employee id added to payload in update of cardholder.
      let updateData =
      {
        "coKey": +companyValue,
        "languageKey": this.FormGroup.value.CardGeneralInformationFormGroup.prefered_language,
        "cardKey": this.savedCardkey,
        "cardNum": this.FormGroup.value.CardGeneralInformationFormGroup.card_id,
        "employeeNumber": this.FormGroup.value.CardGeneralInformationFormGroup.employeeIdFormControl,
        "cardEmploymentDate": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardGeneralInformationFormGroup.employment_date),
        "cardPayToName": this.FormGroup.value.CardGeneralInformationFormGroup.payTo,
        "cardEligibility": {
          "unitKey": this.FormGroup.value.CardEligibilityFormGroup.plan,
          "cdEligibilityKey": this.savedcdEligibilityKey,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardEligibilityFormGroup.effective_date),
          "expireOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.CardEligibilityFormGroup.expiry_date),
        }
      }

      if (this.FormGroup.value.cardbankacc.bank) {
        updateData['cardBankAccount'] = {
          "cardBankAcctKey": this.savedCardBankAcctKey,
          "cardBankNum": this.FormGroup.value.cardbankacc.bank,
          "cardBankBranchNum": this.FormGroup.value.cardbankacc.branch,
          "cardBankAccountNum": this.FormGroup.value.cardbankacc.account,
          "cardExpiredOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.expdate),
          "cardBaKey": this.savedCardBaKey,
          "cardBaEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.effdate),
          "bankName": this.FormGroup.value.cardbankacc.client
        }
      } else {
        updateData['cardBankAccount'] = null
      }

      if (this.FormGroup.value.cardaddress.cca_line) {
        updateData['cardContact'] = cardContactVal
      } else {
        updateData['cardContact'] = null
      }
      this.hmsDataServiceService.post(CardApi.updateCardDetailsUrl, updateData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.savedCardkey = data.result.cardKey;
          this.FormGroup.disable();
          this.cardService.setSavedCardKey.emit(this.savedCardkey)
          this.toastrService.success(this.translate.instant('card.toaster.card-update'));
          this.FormGroup.reset()
          this.showAddUpdateBtn = false;
          this.ngOnInit();

        } else {
          if (data.hmsMessage.messageShort == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
            this.toastrService.error("Effective date should be greater than previous Effective date.")
          } else if (data.hmsMessage.messageShort == "BANK_ACCOUNT_ALREADY_USED") {
            this.toastrService.error(this.translate.instant('card.toaster.bank-detail-used'));
          } else if (data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_PLAN_EFFECTIVEON") {
            this.toastrService.error(this.translate.instant('card.toaster.card-effective-greater'));
          } else if (data.hmsMessage.messageShort == "CARD_EFFECTIVE_ON_CANNOT_BE_GREATER_THAN_ELIGIBILITY_EFFECTIVE_ON") {
            this.toastrService.error('Card Effective On Cannot Be Greater Than Eligibility Effective On')
          } else if (data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
            this.toastrService.error('Effective date should be greater than previous Expired date.')
          }
          else if (data.hmsMessage.messageShort == "EXPIRED_OLD_CARD_ELIGIBILITY") {
            this.toastrService.error('Please expired old card eligibility.')
          } else if (data.hmsMessage.messageShort == "CARD_EXPIRED_ON_SHOULDBE_GREATER_THAN_TO_OLD_EXPIRY_DATE") {
            this.toastrService.error(this.translate.instant('card.toaster.card-expired-on-greater-than-to-old-expiry-date'));
          }
          // Error toaster added if response is 404 & message is as per in condition.
          else if (data.hmsMessage.messageShort == "EMPLOYEE_CARD_NUMBER_NOT_FOUND") {
            this.toastrService.error("Employee card number not found.");
          }
          else {
            this.toastrService.error(this.translate.instant('card.toaster.card-detail-notupdate'));
          }
        }
        error => { }
      })
    } else {
      this.validateAllFormFields(this.FormGroup);
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  onSelect(selected: CompleterItem, type) {
    if (selected) {
      this.selcetdGroupkey = selected.originalObject.userGroupKey
    }
  }

  addComment(commentForm, mode, x) {
    if (this.commentForm.valid) {
      var updateCommentUrl = CardApi.saveCardCommentsUrl;
      var commentImportance
      if (this.commentForm.value.isImportant) {
        commentImportance = 'Y'
      } else {
        commentImportance = 'N'
      }
      if (commentImportance == 'Y') {
        this.cardCommentImportance = true
      }
      let userGroup = ""
      if (this.showCommentBussnsType) {
        userGroup = this.selcetdGroupkey
      } else {
        userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
      }
      var userId = this.currentUser.userId
      this.userGroupKey = userGroup;
      let expDate = this.changeDateFormatService.convertDateObjectToString(this.commentForm.value.expiry_date)
      let commentData = {
        userId: +userId,
        "cardKey": this.savedCardkey,
        "cardCoTxt": this.commentForm.value.commentTxt,
        "commentImportance": commentImportance,
        "userGroupKey": userGroup,
        "expiredOn": expDate || ''
      }

      this.hmsDataServiceService.post(updateCommentUrl, commentData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {

          if (commentImportance == 'Y') {
            this.commentText = this.commentForm.value.commentTxt;
          }
          var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }]
          this.dataTableService.jqueryDataTableReload("cardComments", CardApi.getCardCommentsByCardIdUrl, reqParam)
          this.toastrService.success(this.translate.instant('card.toaster.comment-add'));
          this.commentForm.reset();
        } else { }
      });
    } else {
      this.validateAllFormFields(this.commentForm);
    }
  }

  addCommentCombined(commentFormCombined, mode, x) {        //1116
    if (this.commentFormCombined.valid) {
      var updateCommentUrl = CardApi.saveCardCommentsUrl;
      var commentImportance
      if (this.commentFormCombined.value.isImportant) {
        commentImportance = 'Y'
      } else {
        commentImportance = 'N'
      }
      if (commentImportance == 'Y') {
        this.cardCommentImportance = true
      }
      let userGroup = ""
      if (this.showCommentBussnsType) {
        userGroup = this.selcetdGroupkey
      } else {
        userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
      }
      var userId = this.currentUser.userId
      this.userGroupKey = userGroup;
      let expDate = this.changeDateFormatService.convertDateObjectToString(this.commentFormCombined.value.expiry_date)
      let commentData = {
        userId: +userId,
        "cardKey": this.savedCardkey,
        "cardCoTxt": this.commentFormCombined.value.commentTxt,
        "commentImportance": commentImportance,
        "userGroupKey": userGroup,
        "expiredOn": expDate || ''
      }

      this.hmsDataServiceService.post(updateCommentUrl, commentData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if (commentImportance == 'Y') {
            this.commentText = this.commentFormCombined.value.commentTxt;
          }
          let cKey: any = []
          let chKey
          if (this.cardHolderKeys.length >= 0) {
            this.route.queryParams.subscribe(queryParam => {
              chKey = queryParam['cardHolderKey']
            })
            let index = this.cardHolderKeys.findIndex(x => x == +chKey)
            if (index == -1) {
              cKey = [this.cardHolderKeys[0]]
            } else {
              cKey = [this.cardHolderKeys[index]]
            }
          }
          var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }, { 'key': 'cardHolderKeys', 'value': cKey }]
          this.dataTableService.jqueryDataTableReload("cardCommentsCombined", CardApi.getAllCardCommentsUrl, reqParam)
          this.toastrService.success(this.translate.instant('card.toaster.comment-add'));
          this.commentFormCombined.reset();
        } else { }
      });
    } else {
      this.validateAllFormFields(this.commentFormCombined);
    }
    this.showRemoveBtn = false;
  }

  unTerminateCard() {
    let submitData = {
      "cardKey": this.savedCardkey
    }
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.activate-card')).subscribe((value) => {
      if (value) {
        this.hmsDataServiceService.post(CardApi.activateCardUrl, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.activateCardMessage = data.hmsMessage.messageShort;
            this.toastrService.success(this.translate.instant('card.toaster.card-activate'));
            this.terminateButton = true
            var delay = 1000;
            setTimeout(function () { window.location.reload() }, delay);
          } else { }
          error => { }
        })
      }
    });
  }

  TrusteeInfo() {
    this.hmsDataServiceService.OpenCloseModal("btnModalTrusteeInfo");
  }

  getCommentList() {
    if (this.commentList && this.commentList.length > 0) {
      var tableId = "card-holder"
      var URL = CardApi.cardImportantComments;
      var userId = this.currentUser.userId
      var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }]
      var tableActions = []
      var dateCols = ['createdOn'];
      if (!$.fn.dataTable.isDataTable('#card-holder')) {
        this.dataTableService.jqueryDataTableComment(tableId, URL, 'full_numbers', this.card_holderColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
      }
    }
  }

  getCardCommentListReload() {
    var tableId = "card-holder"
    var url = CardApi.cardImportantComments;
    var userId = this.currentUser.userId;
    var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }]
    var tableActions = []
    var dateCols = ['createdOn'];
    if (!$.fn.dataTable.isDataTable('#card-holder')) {
      this.dataTableService.jqueryDataTableComment(tableId, url, 'full_numbers', this.card_holderColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
  }

  canDeactivate() {
    if (!this.submitted && this.FormGroup.dirty) {
      if (confirm(this.translate.instant("common.pageChangeConfirmation"))) {
        if (this.currentUserService.newTabRouterLink != undefined && this.currentUserService.newTabRouterLink != '' && this.router.url != this.currentUserService.newTabRouterLink) {
          window.open(this.currentUserService.newTabRouterLink);
          this.currentUserService.setRouterLink('');
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  getBusinessType() {
    var URL = CompanyApi.getBusinessTypeUrl;
    this.hmsDataServiceService.get(URL).subscribe(data => {
      if (data.code == 200) {
        this.businessTypeList = data.result;
        this.businessTypeData = this.completerService.local(
          this.businessTypeList,
          "businessTypeDesc",
          "businessTypeDesc"
        );
      }
    });
  }

  getAllComments(event) {
    this.allComments = []
    this.cardHolderKeys = event
    var reqParam = {
      "cardHolderKeys": event
    }
  }

  deleteCard() {
    this.exDialog.openConfirm("Are you sure you want to delete this Card").subscribe((value) => {
      if (value) {
        var reqParam = {
          "cardKey": this.savedCardkey
        }
        this.hmsDataServiceService.postApi(CardApi.deleteCardUrl, reqParam).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success("Card Deleted SuccessFully !!")
            this.router.navigate(["/card/"])

          } else {
            this.toastrService.error("Unable To Delete Card!!")
          }
        })
      } else {}
    })
  }

  deleteInternalCardComments(id) {
    let RequestData = {
      "cdCommentKey": id
    }
    this.hmsDataServiceService.postApi(CardApi.deleteCardCommentsUrl, RequestData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.toastrService.success('Comment Deleted Successfully');
        this.showAddUpdateBtn = false;
        this.commentForm.reset()
        this.getCommentList();
        var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +this.currentUser.userId }]
        this.dataTableService.jqueryDataTableReload("cardComments", CardApi.getCardCommentsByCardIdUrl, reqParam)
      }
    })
  }

  deleteInternalCardCommentsCombined(id) {
    let RequestData = {
      "cdCommentKey": id
    }
    // log #1199
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.deleteConfirmation')).subscribe((value) => {
      if (value) {
      this.hmsDataServiceService.postApi(CardApi.deleteCardCommentsUrl, RequestData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.toastrService.success('Comment Deleted Successfully');
          this.showAddUpdateBtn = false;
          this.commentFormCombined.reset();
          let cKey: any = []
          let chKey
          if (this.cardHolderKeys.length >= 0) {
            this.route.queryParams.subscribe(queryParam => {
              chKey = queryParam['cardHolderKey']
            })
            let index = this.cardHolderKeys.findIndex(x => x == +chKey)
            if (index == -1) {
              cKey = [this.cardHolderKeys[0]]
            } else {
              cKey = [this.cardHolderKeys[index]]
            }
          }
          var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +this.currentUser.userId }, { 'key': 'cardHolderKeys', 'value': cKey }]
          this.dataTableService.jqueryDataTableReload("cardCommentsCombined", CardApi.getAllCardCommentsUrl, reqParam)
        }
      })
    }
    })
  }

  deleteCompanyComments(id) {
    let RequestData = {
      "key": id
    }
    var url = CompanyApi.addCompanyComment + "/" + id;
    this.hmsDataServiceService.delete(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.toastrService.success('Comment Deleted Successfully')
        this.dataTableService.jqueryDataTableReload('companyComments', CompanyApi.getCompanyCommentListUrl, this.reqCompanyComment)
      }
    })
  }

  onCompanySelect(selected: CompleterItem, type) {
    if (selected) {
      this.selectedGroupkey = selected.originalObject.userGroupKey;
    }
  }

  addCompanyComment() {
    if (this.editCompanyCommentForm.valid) {
      if (this.editCompanyCommentForm.value.commentTxt) {
        var id = localStorage.getItem('id')
        var username = localStorage.getItem('user')
        let obj = {
          key: this.companyCovKey,
          commentTxt: this.editCompanyCommentForm.value.commentTxt,
          commentImportance: (this.editCompanyCommentForm.value.isImportant == '' || this.editCompanyCommentForm.value.isImportant == null) ? "N" : "Y",
          expiredOn: "12/12/2025",
          userId: id,
          userGroupKey: this.selectedGroupkey
        };
        var url = CompanyApi.addCompanyComment;
        this.hmsDataServiceService.post(url, obj).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {

            this.editCompanyCommentForm.reset();
            this.dataTableService.jqueryDataTableReload('companyComments', CompanyApi.getCompanyCommentListUrl, this.reqCompanyComment)
          }
        });
        this.getCompanyComment();
      }
    } else {
      this.validateAllFormFields(this.editCompanyCommentForm);
    }
  }

  EditCardComments(id, cardCoTxt, flag, department, userGroup, userKey, expdate) {
    this.editUserKey = userKey;
    this.addMode = false;
    this.editCommentmode = true;

    let cardCommentFormValue = {
      commentTxt: cardCoTxt,
      isImportant: flag == 'N' ? false : true,
      cardCommentGroupKey: department,
      expiry_date: this.changeDateFormatService.convertStringDateToObject(expdate)
    }
    this.commentForm.patchValue(cardCommentFormValue);
    this.showAddUpdateBtn = true;
    this.cdCommentKey = id;

  }
  // -----1116
  EditCardCommentsCombined(id, cardCoTxt, flag, department, userGroup, userKey, expdate) {
    this.editUserKey = userKey;
    this.addMode = false;
    this.editCommentmode = true;

    let cardCommentFormValue = {
      commentTxt: cardCoTxt,
      isImportant: flag == 'N' ? false : true,
      cardCommentGroupKey: department,
      expiry_date: this.changeDateFormatService.convertStringDateToObject(expdate)
    }
    this.commentFormCombined.patchValue(cardCommentFormValue);
    this.showAddUpdateBtn = true;
    this.cdCommentKey = id;

  }
  // ------------1116 /* issue number 724 */
  EditCompanyComments(id, cardCoTxt, flag, department, userGroup, userKey) {
    this.companyAddComment = false;
    this.companyEditComment = true;

    let cardCommentFormValue = {
      commentTxt: cardCoTxt,
      isImportant: flag == 'N' ? false : true,
      companyCommentGroupKey: department
    }
    this.editCompanyCommentForm.patchValue(cardCommentFormValue);
    this.showAddUpdateBtn = true;
    this.cdCompanyCommentKey = id;
  }

  UpdateCompanyComment() {
    if (this.editCompanyCommentForm.valid) {
      if (this.editCompanyCommentForm.value.commentTxt) {

        var id = localStorage.getItem('id')
        var username = localStorage.getItem('user');
        let obj = {
          "key": this.companyCovKey,
          "commentKey": this.cdCompanyCommentKey,
          "commentTxt": this.editCompanyCommentForm.value.commentTxt,
          "expiredOn": "15/12/2025",
          "createdOn": this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
          "commentImportance": (this.editCompanyCommentForm.value.isImportant == '' || this.editCompanyCommentForm.value.isImportant == null) ? "N" : "Y",
          "username": username,
          "department": this.editCompanyCommentForm.value.companyCommentGroupKey
        }

        var url = CompanyApi.addCompanyComment;
        this.hmsDataServiceService.put(url, obj).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {

            this.editCompanyCommentForm.reset();
            this.dataTableService.jqueryDataTableReload('companyComments', CompanyApi.getCompanyCommentListUrl, this.reqCompanyComment);
            this.companyAddComment = true;
            this.companyEditComment = false;
          }
        });
      }
    } else {
      this.validateAllFormFields(this.editCompanyCommentForm);
    }
  }
  //Issue_no 727 
  UpdateCardComment(commentForm, tableId, mode) {
    if (this.commentForm.valid) {
      var updateCommentUrl = CardApi.updateCardCommentsUrl;
      var commentImportance
      if (this.commentForm.value.isImportant) {
        commentImportance = 'Y'
      } else {
        commentImportance = 'N'
      }
      if (commentImportance == 'Y') {
        this.cardCommentImportance = true
      }
      let userGroup = ""
      if (this.showCommentBussnsType) {
        userGroup = this.selcetdGroupkey
      } else {
        userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
      }
      var userId = this.currentUser.userId
      let expDate = this.changeDateFormatService.convertDateObjectToString(this.commentForm.value.expiry_date)

      let commentData = {
        userId: +userId,
        cardKey: this.savedCardkey,
        cardCoTxt: this.commentForm.value.commentTxt,
        commentImportance: commentImportance,
        userGroupKey: this.editUserKey,
        cdCommentKey: this.cdCommentKey,
        "expiredOn": expDate || ''
      }

      this.hmsDataServiceService.post(updateCommentUrl, commentData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.comenttext = this.commentForm.value.commentTxt;
          if (commentImportance == 'Y') {
            this.commentText = this.commentForm.value.commentTxt;
          } else { }
          var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }]
          this.dataTableService.jqueryDataTableReload("cardComments", CardApi.getCardCommentsByCardIdUrl, reqParam)
          this.toastrService.success(this.translate.instant('card.toaster.comment-Updated'));
          this.showAddUpdateBtn = false;
          this.commentForm.reset();
        }
        this.reloadTable(tableId);
        this.commentForm.reset();
      });
    } else {
      this.validateAllFormFields(this.commentForm);
    }
  }
  // ?---1116
  UpdateCardCommentCombined(commentFormCombined, tableId, mode) {
    if (this.commentFormCombined.valid) {
      var updateCommentUrl = CardApi.updateCardCommentsUrl;
      var commentImportance
      if (this.commentFormCombined.value.isImportant) {
        commentImportance = 'Y'
      } else {
        commentImportance = 'N'
      }
      if (commentImportance == 'Y') {
        this.cardCommentImportance = true
      }
      let userGroup = "";
      if (this.showCommentBussnsType) {
        userGroup = this.selcetdGroupkey
      } else {
        userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
      }
      var userId = this.currentUser.userId
      let expDate = this.changeDateFormatService.convertDateObjectToString(this.commentFormCombined.value.expiry_date)

      let commentData = {
        userId: +userId,
        cardKey: this.savedCardkey,
        cardCoTxt: this.commentFormCombined.value.commentTxt,
        commentImportance: commentImportance,
        userGroupKey: userGroup,
        cdCommentKey: this.cdCommentKey,
        "expiredOn": expDate || ''
      }

      this.hmsDataServiceService.post(updateCommentUrl, commentData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.comenttext = this.commentFormCombined.value.commentTxt;
          if (commentImportance == 'Y') {
            this.commentText = this.commentFormCombined.value.commentTxt;
          } else {
          }
          let cKey: any = []
          let chKey
          if (this.cardHolderKeys.length >= 0) {
            this.route.queryParams.subscribe(queryParam => {
              chKey = queryParam['cardHolderKey']
            })
            let index = this.cardHolderKeys.findIndex(x => x == +chKey)
            if (index == -1) {
              cKey = [this.cardHolderKeys[0]]
            } else {
              cKey = [this.cardHolderKeys[index]]
            }
          }
          var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }, { 'key': 'cardHolderKeys', 'value': cKey }]
          this.dataTableService.jqueryDataTableReload("cardCommentsCombined", CardApi.getAllCardCommentsUrl, reqParam)
          this.toastrService.success(this.translate.instant('card.toaster.comment-Updated'));
          this.showAddUpdateBtn = false;
          this.commentFormCombined.reset();

        }
        this.reloadTable(tableId)
        this.commentFormCombined.reset();
      });

    } else {
      this.validateAllFormFields(this.commentFormCombined);
    }
  }

  saveCardHolder() {
    this.showLoader = true;
    /** REMOVE OR ADD BANK FORM VALIDATION CONDITIONALY */
    let bankformFields = ['bank', 'branch', 'account', 'client', 'effdate', 'expdate']
    let bankFormhasValue = false
    bankformFields.forEach(data => {
      if ((this.FormGroup.controls.cardbankacc.get(data).value) && this.FormGroup.controls.cardbankacc.get(data).value != "") {
        bankFormhasValue = true
      }
    })
    let bankAcc = false
    if (bankFormhasValue) {
      this.cardBankAccComponent.removeValidation(Constants.albertaBusinessTypeCd, "cardbankacc", true)
      bankAcc = true
    } else if (!bankFormhasValue) {
      this.cardBankAccComponent.removeValidation(Constants.albertaBusinessTypeCd, "cardbankacc", false)
      bankAcc = false
    } else {
      this.cardBankAccComponent.removeValidation(Constants.quikcardBusinessTypeCd, "cardbankacc", false)
      bankAcc = false
    }
    let cardBankAccVal
    if (!bankAcc) {
      cardBankAccVal = null
    } else {
      cardBankAccVal = {
        "cardBankNum": this.FormGroup.value.cardbankacc.bank,
        "cardBankBranchNum": this.FormGroup.value.cardbankacc.branch,
        "cardBankAccountNum": this.FormGroup.value.cardbankacc.account,
        "cardExpiredOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.expdate),
        "cardBaEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.cardbankacc.effdate),
        "bankName": this.FormGroup.value.cardbankacc.client
      }
    }

    this.addCardHolderData.map(data => {
      data.userId = this.currentUser.userId,
        data.coKey = +this.companyCoKey,
        data.cardBankAccount = cardBankAccVal,
        data.chCardKey = this.savedCardkey
    })

    this.hmsDataServiceService.putApi(CardApi.saveCardholderUrl, this.addCardHolderData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
        if (this.redirectComapny) {
          this.router.navigate(['/card/view', this.savedCardkey], { queryParams: { "companyId": this.companyCoKey, "unitKey": this.unitKey } })
        } else {
          this.router.navigate(['/card/view', this.savedCardkey], { queryParams: { "unitKey": this.unitKey } })
        }
        this.showLoader = false;
      }
      else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
        this.toastrService.warning("Effective Date Should Be Greater Than Previous Expiry Date!")
      }
      else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
        this.toastrService.warning("Effective Date Should Be Greater Than Previous Effective Date!")
      }
      else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OR_EQUAL_OLD_EFFECTIVEON') {
        this.toastrService.warning("Effective Date Should Be Greater Than or equal to Previous Effective Date!")
      }
      else if (data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OR_EQUAL_OLD_EFFECTIVEON') {
        this.toastrService.warning("Eligibility Effective Date Should Be Greater Than or Equal To Previous Effective Date!")
      }
      else if (data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
        this.toastrService.warning("Eligibility Effective Date Should Be Greater Than Previous Expiry Date!")
      }
      else if (data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
        this.toastrService.warning("Eligibility Effective Date Should Be Greater Than Previous Effective Date!")
      }
      else if (data.code == 400 && data.message == 'ROLE_EFFECTIVEON_SHOULD_BE_GREATER_OR_EQUAL_OLD_EFFECTIVEON') {
        this.toastrService.warning("Role Effective Date Should Be Greater Than or Equal To Previous Effective Date!")
      }
      else if (data.code == 400 && data.message == 'ROLE_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
        this.toastrService.warning("Role Effective Date Should Be Greater Than Previous Expiry Date!")
      }
      else if (data.code == 400 && data.message == 'ROLE_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
        this.toastrService.warning("Role Effective Date Should Be Greater Than Previous Effective Date!")
      }
    });
  }


  clickOverrideMaximun(cardholderObj) {
    this.cardEligibilityComponent.overrideMaximumCardholder(cardholderObj);
  }

  expandAll() {
    $('.collapse-heading').each(function () {
      if ($(this).find("h3").attr("aria-expanded") != "true") {
        $(this).click()
      }
    });
    this.expandBtn = true;

    if (this.editMode || this.viewMode) {
      if ($('#datachk3').attr("aria-expanded") != "true") {
        $('#datachk3').click();
      }
      if ($('#datachk2').attr("aria-expanded") != "true") {
        $('#datachk2').click();
      }
    }
  }
  collapseAll() {
    $('.collapse-heading').each(function () {
      if ($(this).find("h3").attr("aria-expanded") == "true") {
        $(this).click()
      }
    })
    if (this.editMode || this.viewMode) {
      if ($('#datachk3').attr("aria-expanded") == "true") {
        $('#datachk3').click();
      }
      if ($('#datachk2').attr("aria-expanded") == "true") {
        $('#datachk2').click();
      }
    }

    this.expandBtn = false;
  }

  //#1199 To open popup which contains table of all comments history. Further code to show data will be added after backend work.
  getAllCommentsHistory() {
    var cardKEY
    this.route.params.subscribe(params => {
      cardKEY = +params['id'];
    });
    var cardHolderKey;
    var unitKey
    this.route.queryParams.subscribe(queryParam => {
      cardHolderKey = queryParam['cardHolderKey']
      unitKey = queryParam['unitKey']
    })
    let submitData = {
      "cardKey": cardKEY,
      "cardHolderKey": cardHolderKey,
      "unitKey": unitKey
    }
    this.hmsDataServiceService.postApi(CardApi.getCardDetails, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        var tableId = "allCommentsHistory"
        if (this.commentsParams.requestMode == 'post') {
          var url = CardApi.getAllCardCommentsUrl;
        }
        else {
          var url = CardApi.getCardCommentsByCardIdUrl;
          var url = CardApi.getAllCardCommentsUrl;
        }
        let cKey: any = []
        let chKey
        if (this.cardHolderKeys.length >= 0) {
          this.route.queryParams.subscribe(queryParam => {
            chKey = queryParam['cardHolderKey']
          })
          let index = this.cardHolderKeys.findIndex(x => x == +chKey)
          if (index == -1) {
            cKey = [this.cardHolderKeys[0]]
          } else {
            cKey = [this.cardHolderKeys[index]]
          }
        }
        var userId = this.currentUserService.userType
        var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }, { 'key': 'cardHolderKeys', 'value': cKey }]
        this.observableObj = Observable.interval(1000).subscribe(value => {
          if (this.check = true) {
            if ('common.date' == this.translate.instant('common.date')) {
            }
            else {
              this.commentColumns = [
                { title: this.translate.instant('common.date'), data: 'createdOn' },
                { title: this.translate.instant('common.username'), data: 'userName' },
                { title: this.translate.instant('common.comments'), data: 'commentText' },
                { title: this.translate.instant('common.department'), data: 'userGroupName' },
                { title: this.translate.instant('common.expiryDate'), data: 'expiredOn' },
                { title: this.translate.instant('common.importance'), data: 'cardImportance' }
              ]
              var dateCols = ['createdOn', 'expiredOn'];
              if (!$.fn.dataTable.isDataTable('#' + tableId)) {
                this.dataTableService.jqueryDataTableComment(tableId, url, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, "", undefined, 5, dateCols, null, [1, 3, 4], 2)
              }
              else {
                this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
              }
              this.observableObj.unsubscribe();
            }
          }
        });
      }
    });
  }

  // For File Select field with errors on conditions.
  cardCommentsFileUpload(event) {
    this.commentFormCombined.value.cardholderCommentsDocumentName = ""
    this.selectedFile = event.target.files[0]
    let fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.error1 = { isError: true, errorMessage: this.translate.instant('common.fileSizeError') };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.error1 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.commentFormCombined.patchValue({ 'cardholderCommentsDocumentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: this.translate.instant('common.fileTypeError') };
      this.showRemoveBtn = true;
    } else {
      this.error = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }
  }

  // To clear the File Select field. (03-01-2023) by Prabhat
  removeCardCommentsFile() {
    this.commentFormCombined.patchValue({ 'cardholderCommentsDocumentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }

  ngOnDestroy() {
    if (this.compCoKey) {
      this.compCoKey.unsubscribe()
    }
    else if (this.savedKey) {
      this.savedKey.unsubscribe()
    }
    else if (this.prefLang) {
      this.prefLang.unsubscribe()
    }
    else if (this.cardHolderNameSub) {
      this.cardHolderNameSub.unsubscribe()
    }
    else if (this.cardHolderDetails) {
      this.cardHolderDetails.unsubscribe()
    }
    else if (this.cardHolderAdd) {
      this.cardHolderAdd.unsubscribe()
    }
    else if (this.redirectComp) {
      this.redirectComp.unsubscribe()
    }
    else if (this.lang) {
      this.lang.unsubscribe()
    }
  }
}