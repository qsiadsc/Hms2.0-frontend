import { Component, OnInit, ViewChild, Output, EventEmitter, Input, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { QueryList, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject, Subscription } from 'rxjs/Rx';
import { CardHolderGeneralInformationComponent } from './card-holder-general-information/card-holder-general-information.component';
import { CardHolderPopupGeneralInformationComponent } from '../card-holder-popup/card-holder-popup-general-information/card-holder-popup-general-information.component';
import { CardHolderRoleAssignedComponent } from './card-holder-role-assigned/card-holder-role-assigned.component';
import { CardHolderEligibilityComponent } from './card-holder-eligibility/card-holder-eligibility.component';
import { CardHolderCobComponent } from './card-holder-cob/card-holder-cob.component';
import { CardApi } from '../card-api'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommentModelComponent } from '../../common-module/shared-component/CommentsModal/comment-model/comment-model.component';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { CardServiceService } from '../../card-module/card-service.service';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ToastrService } from 'ngx-toastr';
import { CardHolderHistoryPopupComponent } from '../card-holder-history-popup/card-holder-history-popup.component';
import { CardHolderCobhistoryPopupComponent } from '../card-holder-cobhistory-popup/card-holder-cobhistory-popup.component';
import { CardHolderExpenseHistoryPopupComponent } from '../card-holder-expense-history-popup/card-holder-expense-history-popup.component';
import { CardHolderVoucherHistoryPopupComponent } from '../card-holder-voucher-history-popup/card-holder-voucher-history-popup.component';
import { Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../common-module/Constants';
import { DataTableDirective } from 'angular-datatables';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompleterService, CompleterItem } from 'ng2-completer';
import { DataManagementDashboardApi } from '../../data-management-dashboard-module/data-management-dashboard-api';
import { ClaimService } from '../../claim-module/claim.service';

@Component({
  selector: 'card-holder',
  templateUrl: './card-holder.component.html',
  styleUrls: ['./card-holder.component.css'],
  providers: [DatatableService, ChangeDateFormatService, HmsDataServiceService, ExDialog, TranslateService, ClaimService] //declare service used in the components
})

export class CardHolderComponent implements OnInit {
  [x: string]: any;
  openClaimList: any = false
  selectedPlan: any
  cardExpDate: any
  editCommentMode = false;
  coKey: number
  addCardholder = false;
  addCardholderArray: any = [];
  ChDateOfBirth: any[];
  dateOfBirth: any[];
  requestData: any;
  public plans = [];
  terminateCardForOneCH: boolean = true;
  cardTerminateOnReload: boolean;
  CHStatus: any;
  arrGenderList;
  selectedCHDateKeyList: any = [];
  getSavedCardKey: any;
  FormGroup: FormGroup;
  cardEffectiveOnDate: any;
  cardTerminationDate: string;
  cardTerminate: FormGroup;
  activateCardModal: boolean;
  lastCHTermDate: string;
  enableActivateBtn: boolean = false;
  enableTerminateBtn: boolean = false;
  disableActivatebtn: boolean;
  btntitle: string = 'Terminate';
  SelCardHolderStatus: any;
  arrayCounter: number = 0;
  reactiveCardHolder: boolean = false;
  cardholderError: boolean = false;
  selectedCardholderData = []
  undoCardHolderKey: any[];
  lastCardholderTerminationDate: any;
  cardHolderExpiryDate: any[];
  cardHolderEligibilityKey: any[];
  cardEligKey: any;
  showUndoCardHolderBtn: boolean = false;
  disableReActDate: boolean = false;
  cardExpiryDate: any = false
  termActTitle: string = 'Termination Date';
  activeCardholders: any;
  error: any;
  cardHolderKeysArray: any[];
  chElgKey: any;
  cardActiveStatus: any = 'Active';
  cardHolderLength: number;
  bussinessCd: any;
  coverageMaxYear: any = "null";
  noOfYearsCcMaxYear: any = "null";
  noOfYearsHsaMaxYear: any = "null";
  noOfYearsDivMaxYear: any = "null";
  noOfYearsCSYear: any = "null";
  editcardholderMode: boolean = false;
  prefLangSubs: Subscription;
  cardStatusSubs: Subscription;
  expirySubs: Subscription;
  effDateSubs: Subscription;
  expSubs: Subscription;
  eligKeySubs: Subscription;
  cardEffDateSubs: Subscription;
  preffLang: Subscription;
  public commentCompoenent = CommentModelComponent;
  selectedYear: any = null;
  @Input() cardHolderAddModeFormGroup: FormGroup;
  @Input() addMode: boolean = true;
  @Input() viewMode: boolean = false;
  @Input() editMode: boolean = false;
  @Input() cardViewMode: boolean = false
  @Input() cardAddMode
  @Input() userAuthCheck: any
  @Input() currentUser: any
  @Input() cardActiveTerminatedStatus: any
  @Output() emitOnSave: EventEmitter<any> = new EventEmitter<any>();
  @Output() cholderkeys = new EventEmitter();
  @Output() cardholderDetails = new EventEmitter<object>();
  arrRoleList;
  selcetdGroupkey: any;
  cardholderMainFormData: any
  cardholderMainForm: FormGroup;
  cardHodercommentForm: FormGroup;
  chRoleAssignKey: string;
  cardHolderAge: number;
  ageObject = {
    "age1": 0,
    "age2": 0
  };
  name;
  checkFocus
  ObservableObj
  cardholderCobVal;
  cardHolderKey: string;
  chCardKey: string;
  isModify: boolean = false;
  hasStudentDeleteIcon: boolean = true;
  cardHolderTerminate: FormGroup;
  cardHolderActivate: FormGroup;
  cardActivate: FormGroup;
  selectedCardHolderKey = [];
  studentSaveUrl;
  cardHolderData;
  requestedData: any;
  companyKey;
  deleteStudentHistoryUrl;
  CardHolderGeneralInfo;
  gernalInfoEditValue;
  alberta: boolean = false;//for extra parameters in alberta theme
  bussinessType: number;//for changing theme in case of alberta/Quikcard
  arrayObject;
  arrayObjectKey;
  claimData;
  hasCompanyFieldValue
  dateNameArray = []
  studentDateNameArray = []
  contactHistorytableData: any;
  hideClaims: boolean = true;
  selectedCardHolderLength;
  isConfirmationModalOpen;
  commentText;
  pendingClaimData;
  pendingClaimDatakeys;
  pendingClaimsData;
  noPendingClaimsData;
  noPendingClaimskeys;
  expiryError;
  showPendingClaimKeys = [];
  hasPendingValues: boolean = false;
  pendingClaimsName;
  arrCCMax = [];
  arrHSAMax = [];
  arrCovMax = [];
  arrDivMax = [];
  arrClaimSecureMax = [];
  cardCommentImportance: boolean = false;
  claimItems = []
  getCcMaxValue;
  getCovMaxValue;
  getHsaMaxValue;
  getDivMaxValue;
  getClaimSecureMaxValue;
  noRecordFound;
  PrimaryCodeValue;
  DependantCodeValue;
  imgUrl;
  cert;
  cardholderName;
  errorArray = []
  userGroupData: any;
  studentDateError: boolean = false
  showCommentBussnsType: boolean = false;
  disableSave: boolean = false
  cardholderKey;
  cardHolderName: string
  cardHolderKeyParam;
  unitKey: any = ''
  arrWellMax = []
  getWellMaxValue;
  noOfYearsWellMaxYear: any = "null"
  @ViewChild(CardHolderGeneralInformationComponent) generalInformationComponent; // to acces variable of card holder general information form
  @ViewChild(CardHolderRoleAssignedComponent) roleassignedComponent; // to acces variable of card holder role assigned form
  @ViewChild(CardHolderEligibilityComponent) eligibility; // to acces variable of card holder eligibility form
  @ViewChild(CardHolderCobComponent) cob; // to acces variable of card holder cob form
  @ViewChild(CommentModelComponent) commentFormData; // to acces variable of Comment from 

  @ViewChildren(CardHolderPopupGeneralInformationComponent) CardHolderPopupGeneralInfoFormGroup
  @ViewChildren(CardHolderHistoryPopupComponent) cardHolderHistoryPopupComponent
  @ViewChildren(CardHolderCobhistoryPopupComponent) cardHolderCobhistoryPopupComponent
  @ViewChildren(CardHolderExpenseHistoryPopupComponent) CardHolderExpenseHistoryPopupComponent
  @ViewChildren(CardHolderVoucherHistoryPopupComponent) CardHolderVoucherHistoryPopupComponent


  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {}
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;

  activateDate;
  isActivateModalOpen;
  modal
  commentsParams = {
    getCommentsListUrl: "card-service/getCardCommentsByCardId",
    addCommentUrl: "card-service/saveCardComments",
    requestMode: 'post',
  }
  commentColumns = [];
  checkCardholder = true
  observObj;
  cardEffDate;

  arrCardData = "{cardId: '58',first_name:'Tarun',last_name=''}"
  requestParams;
  allColumnAction: boolean = true;
  isShowCardHolderLIst = false;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerOldOptions = CommonDatePickerOptions.myDatePickerOldFilterOptions;

  editCardholderComment: boolean = false
  viewCardholderComment: boolean = false
  cardStatus: boolean = false
  searchedCards = []; // contains saved list of saved card holder
  public studentColumns = [{
    title: "School Name",
    data: 'schoolName'
  }, {
    title: "Start Date",
    data: 'startDate'
  }, {
    title: "End Date",
    data: 'endDate'
  }, {
    title: "Action",
    data: 'action'
  }]

  tableData = [];
  tableKeys;
  tableActions;

  tableID = "student-table"
  viewTime = false

  StudentTableHeading: string;
  companyCoKey;

  activeCardHolder = [];
  inActiveCardHolder = [];
  notTrminateCardHldr;
  planKey: Number
  showLoader = false;
  isAscending: boolean = true;
  cardCommentImportance_Grid: boolean;
  commentText_Grid: any;
  insideTermBtn: boolean = false
  checkPersonComment: boolean = true
  observablePersonComment;
  personComKey
  personKey
  showConfirmationBtn: boolean = false

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataTableService: DatatableService,
    private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private exDialog: ExDialog,
    private toastrService: ToastrService,
    private cardService: CardServiceService,
    private translate: TranslateService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private renderer: Renderer2,
    public claimservice: ClaimService,
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.cardHolderKey = '';

    this.prefLangSubs = cardService.getPrefferedLanguage.subscribe((value) => {
      this.gernalInfoEditValue = value
      this.bussinessCd = this.gernalInfoEditValue.businessTypeCd;
      this.companyId = this.gernalInfoEditValue.companyId; // companyId == 8(Case)
      this.changeTheme();
      if (this.bussinessCd == Constants.albertaBusinessTypeCd) {
        this.alberta = true
      }
    })

    this.cardStatusSubs = cardService.cardStatus.subscribe((value) => {
      if (value == 'ACTIVE' || value == 'Active') {
        this.cardStatus = true
      }
      else {
        this.cardStatus = false
      }
    })

    this.expirySubs = cardService.cardExpiryDate.subscribe((value) => {
      this.cardExpiryDate = value
    })

    this.effDateSubs = cardService.cardEffDate.subscribe((value) => {
      this.cardEffDate = value;
    })

    this.expSubs = cardService.cardExpDate.subscribe((value) => {
      this.cardExpDate = value;
    })

    this.eligKeySubs = cardService.cardEligKey.subscribe((value) => {
      this.cardEligKey = value
    })

    this.cardEffDateSubs = cardService.cardEffDate.subscribe((value) => {
      this.cardEffectiveOnDate = value
    })

    let self = this;
    $(document).on('click', '#CardholderComment .edit-ico', function () {
      var id = $(this).data('id');
      var key = $(this).data('key');
      var Imp = $(this).data('imp');
      var Dept = $(this).data('dept');
      var userId = $(this).data('user');
      var coKey = $(this).data('cokey');
      var expDate = $(this).data('expiredon');

      self.EditCardComments(id, key, Imp, Dept, userId, coKey, expDate);
    })
    $(document).on('click', '#CardholderComment .del-ico', function () {
      var coKey = $(this).data('cokey');
      self.deleteCardComments(coKey);

    })

    /* Edit Functionality of Person Comment section */
    $(document).on('click', '#cardholderPersonComment .edit-ico', function () {
      let id = $(this).data('id');
      let personKey = $(this).data('personkey');
      let personComKey = $(this).data('personcomkey');
      let personComTxt = $(this).data('personcomtxt');
      let impFlag = $(this).data('impflag');
      self.editPersonComments(id, personKey, personComKey, personComTxt, impFlag);
    })

    /* Delete Functionality of Person Comment section*/
    $(document).on('click', '#cardholderPersonComment .del-ico', function () {
      let personComkey = $(this).data('personcomkey');
      self.deletePersonComments(personComkey);
      personComkey.destroy();
    })

    this.preffLang = cardService.getPrefferedLanguage.subscribe((value) => {
      this.getPlanByCompanyCokey(value.companyCoKey)
    })
  }

  getPlanByCompanyCokey(value) {
    let requiredInfo = {
      "coKey": value
    }
    this.hmsDataService.postApi(CardApi.getCompanyPlanUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.plans = data.result

      } else {
        this.plans = []
      }
      error => { }
    })
  }

  deleteCardComments(coKey) {
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete-comment')).subscribe((value) => {
      if (value) {
        let submitData = {
          "chComKey": coKey
        }
        this.hmsDataService.postApi(CardApi.deleteCardHolderComment, submitData).subscribe(data => {
          var userId = this.currentUserService.currentUser.userId
          var reqParam = [{ 'key': 'cardHolderKey', 'value': this.cardHolderKey }, { 'key': 'userId', 'value': +userId }]
          this.dataTableService.jqueryDataTableReload("CardholderComment", CardApi.getCardHolderComments, reqParam)
          this.toastrService.success(this.translate.instant('card.toaster.comment-delete'));
          this.cardHodercommentForm.reset();
          this.cardHolderFlag(this.cardHolderKey)
        })
      } else { }
    })
  }

  EditCardComments(id, key, Imp, Dept, userId, coKey, expiredon) {
    this.coKey = coKey;
    this.editCommentMode = true;
    this.expired = this.changeDateFormatService.isFutureFormatedDate(expiredon);

    if (Imp != 'Y') {
      this.cardHodercommentForm.patchValue({
        commentTxt: key,
        isImportant: "",
        cardCommentGroupKey: Dept,
        expiry_date: this.changeDateFormatService.convertStringDateToObject(expiredon)

      })
    } else {
      this.cardHodercommentForm.patchValue({
        commentTxt: key,
        isImportant: Imp,
        cardCommentGroupKey: Dept,
        expiry_date: this.changeDateFormatService.convertStringDateToObject(expiredon)
      })
    }
  }

  cardHolderAddModeFormGroupVal = {
    last_name: new FormControl(''),
    first_name: new FormControl(''),
    gender: new FormControl(''),
    date_of_birth: new FormControl('')
  }

  compareDate(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.cardActivate.patchValue(datePickerValue);
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
      this.cardActivate.patchValue(datePickerValue);
    }
    let cardExpiryDate = this.changeDateFormatService.convertStringDateToObject(this.cardExpiryDate)
    if (this.cardActivate.value.cardActivateDate && cardExpiryDate) {
      this.error = this.changeDateFormatService.compareTwoCardDates(cardExpiryDate.date, this.cardActivate.value.cardActivateDate.date);
      if (this.error.isError == true) {
        this.cardActivate.controls['cardActivateDate'].setErrors({
          "CardTerDate": true
        });
      }
    }
  }
  custDate(data) {
    switch (data) {
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
  custData(date) {
    if (date != "") {
      return this.changeDateFormatService.formatDate(date)

    }
  }

  GetCardHolderRoleList() {
    this.hmsDataService.getApi(CardApi.getCardHolderRoleListUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrRoleList = data.result;

        for (var i = 0; i < this.arrRoleList.length; i++) {
          if (this.arrRoleList[i].chRoleCD == "P") {
            this.PrimaryCodeValue = this.arrRoleList[i].chRoleKey
          }
          else if (this.arrRoleList[i].chRoleCD == "D") {
            this.DependantCodeValue = this.arrRoleList[i].chRoleKey
          }
        }
      }
    })
  }

  getCompanyPlanInfo() {
    let submitData = {
      "coKey": this.companyCoKey
    }
    this.hmsDataService.postApi(CardApi.getCompanyPlanUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.ageObject.age1 = data.result[0].age1;
        this.ageObject.age2 = data.result[0].age2;
      }
    });
  }

  ngOnInit(): void {
    this.alberta ? this.imgUrl = location.origin + '/assets/images/alberta-logo.png' : this.imgUrl = location.origin + '/assets/images/logo.png'
    this.observObj = Observable.interval(1000).subscribe(value => {
      if (this.checkCardholder = true) {
        if ('common.date' == this.translate.instant('common.date')) {
        } else {
          this.commentColumns = [
            { title: this.translate.instant('common.date'), data: 'createdOn' },
            { title: this.translate.instant('common.username'), data: 'username' },
            { title: this.translate.instant('common.department'), data: 'department' },
            { title: this.translate.instant('common.comments'), data: 'chComTxt' },
            { title: this.translate.instant('common.importance'), data: 'chComImportance' },
            { title: "Expiry Date", data: 'expiredOn' }, // replace with expiredOn
            { title: this.translate.instant('common.action'), data: 'chComImportance' }
          ]
          this.checkCardholder = false;
          this.observObj.unsubscribe();
        }
      }
    });
    /* Person comment table columns for person comment section*/
    this.observablePersonComment = Observable.interval(1000).subscribe(value => {
      if (this.checkPersonComment = true) {
        if ('common.date' == this.translate.instant('common.date')) {
        } else {
          this.personCommentColumns = [
            { title: this.translate.instant('common.date'), data: 'createdOn' },
            { title: this.translate.instant('common.comments'), data: 'personComTxt' },
            { title: this.translate.instant('common.importance'), data: 'dispCommentInd' },
            { title: this.translate.instant('common.action'), data: 'personComKey' }
          ]
          this.checkPersonComment = false;
          this.observablePersonComment.unsubscribe();
        }
      }
    });

    this.dtOptions['ClaimTotalCOVMax'] = Constants.dtOptionsConfig
    this.dtOptions['SearchedCards'] = Constants.dtOptionsConfig
    this.dtOptions['claimItemsTable'] = Constants.dtOptionsSortingConfigClaimHistory
    this.dtTrigger['claimItemsTable'] = new Subject();
    this.dtTrigger['SearchedCards'] = new Subject();
    this.dtTrigger['ClaimTotalCOVMax'] = new Subject();
    this.cardContactHistoryDetails();
    this.getCardHolderList()
    this.GetCardHolderRoleList()
    this.getCardDetails()
    this.getCardStatus()
    this.GetGenderList()

    this.cardHodercommentForm = new FormGroup({
      commentTxt: new FormControl('', [Validators.required, Validators.maxLength(500)]),
      isImportant: new FormControl(''),
      cardCommentGroupKey: new FormControl(''),
      expiry_date: new FormControl('')

    });

    this.deleteStudentHistoryUrl = CardApi.deleteStudentHistoryUrl
    this.cardholderMainForm = this.fb.group({
      CardHolderGeneralInformationFormGroup: this.fb.group(this.generalInformationComponent.cardholderGeneralInformationVal),
      CardHolderRoleAssignedFormGroup: this.fb.group(this.roleassignedComponent.cardholderRoleAssignedVal),
      CardHolderEligibilityFormGroup: this.fb.group(this.eligibility.cardholderEligibilityVal),
      CardHolderCobFormGroup: this.fb.group(this.cob.cardholderCobVal)
    })
    this.cardHolderTerminate = this.fb.group({
      terminateDate: ['', [Validators.required]]
    })

    this.cardTerminate = this.fb.group({
      terminateCardDate: ['', [Validators.required]]
    })

    this.cardHolderActivate = this.fb.group({
      activateDate: ['', [Validators.required]]
    })

    this.cardActivate = this.fb.group({
      cardActivateDate: ['', [Validators.required]],
      expirydate: ['', [Validators.required]],
      effectivedate: [''],
      plan: ['', [Validators.required]],

    })

    this.getCardHolderKey();

    var self = this
    $(document).on('click', "#student-table .edit_row", function (e) {
      self.disableSave = true
      e.preventDefault()
      var dad = $(this).closest('tr');
      dad.find('label').hide();
      dad.find('.editableInput').show();
      $(this).hide();
      $(this).next('a.save_row').show();
    });

    $(document).on('click', "#student-table .save_row", function (e) {
      e.preventDefault()
      self.errorArray = []
      var addFilled = true
      var dad = $(this).closest('tr');
      var saveData = {}
      dad.find(".editableInput").each(function () {
        var elem
        var dadId = dad.attr('id')
        var dadArray = dadId.split('_')
        if ($(this).data('type') == "date") {
          var id = $(this).attr('id')
          elem = $("#" + id).find("input")
          var val = $("#" + id).find("input").val().toString()
          saveData[$(this).data('updateid')] = val
        }
        else {
          elem = $(this)
          var val = $(this).val().toString()
          saveData[$(this).attr('name')] = val
        }

        if ((val == "") && ($(this).hasClass('required') || $(this).hasClass('error_field'))) {
          addFilled = false
          $(this).addClass("error_field")
          self.errorArray.push($(this).data('errortext'))
        } else {
          $(this).removeClass("error_field")
          if ($(this).attr('type') == "checkbox") {
            if ($(this).is(":checked")) {
              $(this).prev('label').text("Yes")
            } else {
              $(this).prev('label').text("No")
            }
          } else if ($(this).data('type') == "select") {
            $(this).prev('label').text($(this).find('option:selected').text())
          } else {
            $(this).prev('label').text(val)
          }
        }
      })
      if (self.studentDateError) {
        self.errorArray.push("End Date Should be Greater than Start Date")
      }
      if (addFilled) {
        var rowData = {}
        self.errorArray = []
        dad.find(".editableInput").each(function () {
          var key = $(this).data('updateid');
          var val = '';
          if ($(this).data('type') == 'hidden') {
            ;
            val = $(this).find("input").val().toString()
          }
          else
            if ($(this).data('type') == "date") {
              var id = $(this).data('updateid')
              val = $(this).find("input").val().toString();
              val = self.changeDateFormatService.formatDate(val);
            } else {
              val = $(this).val().toString();
            }
          if (key != 'undefined' && key != undefined) {
            rowData[key] = val
          }
        })
        var rowId = []
        var selectedRow = $(this).parents('tr')
        var tableid = 'student-table';
        rowId = selectedRow.attr('id').split('_');
        self.tableData[rowId[1]] = rowData

        if (!self.addMode && self.requestedData && self.requestedData[0].chPersonKey) {
          var requestedData = {
            "cardHolderKey": self.requestedData[0].cardHolderKey,
            "chPersonKey": self.requestedData[0].chPersonKey,
            "personStudentHistoryDto": [rowData]

          }
          self.hmsDataService.postApi(CardApi.addUpdateCardHolderPersonStudentHistoryUrl, requestedData).subscribe(data => {
            self.tableData = data.result
            dad.find('label').show();
            dad.find('.editableInput').hide();
            $(this).hide()
            dad.find('a.save_row').hide()
            dad.find('a.edit_row').show()
            self.toastrService.success(self.translate.instant('card.toaster.record-save'));
          }
          )
        }
        else {
          dad.find('label').show();
          dad.find('.editableInput').hide();
          $(this).hide()
          dad.find('a.save_row').hide()
          dad.find('a.edit_row').show()
          self.toastrService.success(self.translate.instant('card.toaster.record-save'));
        }
        self.disableSave = false
      }
    })

    $(document).on('click', "#student-table .delete_row", function (e) {
      self.exDialog.openConfirm(self.translate.instant('card.exDialog.delete-studenthistory')).subscribe((value) => {
        if (value) {
          var rowData = $(this).parents('tr')
          var rowId = []
          var tableid = 'student-table';
          rowId = rowData.attr('id').split('_');
          CardApi.deleteStudentHistoryUrl
          self.tableData.splice(rowId[1], 1)

          setTimeout(() => {
            var dateCols = ['startDate', 'endDate'];
            self.changeDateFormatService.dateFormatListShow(dateCols, self.tableData);
            for (var j = 0; j < self.tableData.length; j++) {
              self.studentDateNameArray[tableid + j + 'startDate'] = self.tableData[j]['startDate']
              self.studentDateNameArray[tableid + j + 'endDate'] = self.tableData[j]['endDate']
            }
          }, 500);

          var schollKey = $('#student-table' + rowId[1] + 'schoolKey').val()

          var requestedData = {
            "schoolKey": schollKey
          }

          self.hmsDataService.postApi(CardApi.deleteCardHolderPersonStudentHistoryUrl, requestedData).subscribe(data => {
            if (data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
              self.toastrService.success(self.translate.instant('card.toaster.record-delete'))
            }
          })

          rowData.remove()
          $("#student-table").find('tr.tableRow:first-child').find('td:last-child').find('a').removeClass('disabled')
          self.errorArray = []
          self.disableSave = false
        }
      })
    })
    if (this.route.snapshot.url[0]) {
      this.addCardholder = false;
    } else {
      this.addCardholder = true;
    }

    this.route.queryParams.subscribe(params => {
      if (params["activecard"] && params["activecard"] == "T") {
        this.openClaimList = true;
      }
    })
  }

  datatableElement(tableID) {
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => { });
  }

  changeTheme() {
    if (this.bussinessCd == Constants.albertaBusinessTypeCd) {
      this.alberta = true;
    } else { }
  }

  getPlanValue(event) {
    if (event.target.value) {
      this.selectedPlan = this.plans.filter(plan => plan.unitKey == event.target.value);
    }
  }

  initializeStudentHistory() {
    this.StudentTableHeading = "Student History"
    this.studentSaveUrl = CardApi.addUpdateStudentHistoryUrl;

    this.tableKeys = [
      { 'column': 'schoolName', 'type': 'text', 'name': 'schoolName', 'required': true },
      { 'column': 'startDate', 'type': 'datepicker', 'name': 'startDate', 'required': true },
      { 'column': 'endDate', 'type': 'datepicker', 'name': 'endDate', 'greater_than': 'startDate', 'required': false },
      { 'column': 'action', 'type': 'action' }
    ]
    this.tableActions = [
      { 'name': 'edit', 'val': '', 'class': 'edit_row table-action-btn edit-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-pencil' },
      { 'name': 'save', 'val': '', 'class': 'save_row table-action-btn save-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-save' },
      { 'name': 'delete', 'val': '', 'class': 'delete_row table-action-btn del-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-trash' },
      { 'name': 'schoolKey', 'val': '', 'class': '', 'type': 'hidden' }
    ]

    let requiredObject = {
      cardholderVoucherDtoList: []
    };
    this.arrayObject = requiredObject;
  }

  ngAfterViewInit(): void {
    this.dtTrigger['SearchedCards'].next()
    this.dtTrigger['claimItemsTable'].next();
    this.route.params.subscribe((params: Params) => {
      this.chCardKey = params['id'];
    });
    let submitData = {
      "cardId": this.chCardKey
    }
  }

  setCardHolderCobVal($eve) {
    this.cardholderCobVal = $eve // This function Reloads the Datatable by Table Id
  }

  addCardHolderInfo(mycardInformationForm) {
    this.editcardholderMode = false;
    this.cardholderMainForm.patchValue({
      CardHolderGeneralInformationFormGroup: {
        'card_id': 1001 // temp value which is over writted while submission
      }
    });

    if (this.cardholderMainForm.valid) {
      try {
        this.showLoader = true
        var studentData = this.dataTableService.inlineTableData(this.tableID);
        var objDOB = mycardInformationForm.value.CardHolderGeneralInformationFormGroup.date_of_birth;
        let cardHolderAge = this.changeDateFormatService.getAge(objDOB.date.year + '/' + objDOB.date.month + '/' + objDOB.date.day);
        let persondob = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderGeneralInformationFormGroup.date_of_birth)
        let roleExpiryOn = '';
        if (mycardInformationForm.value.CardHolderRoleAssignedFormGroup.expiry_date) {
          roleExpiryOn = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderRoleAssignedFormGroup.expiry_date)
        }

        let roleEffectiveOn = '';
        if (mycardInformationForm.value.CardHolderRoleAssignedFormGroup.effective_date) {
          roleEffectiveOn = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderRoleAssignedFormGroup.effective_date)
        }

        let eligibilityExpiryOn = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderEligibilityFormGroup.expiry_date)
        let eligibilityEffectiveOn = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderEligibilityFormGroup.effective_date)

        var isTrue = this.changeDateFormatService.compareTwoDate(eligibilityEffectiveOn, roleEffectiveOn);
        if (!this.alberta) {
          if (isTrue) {
            this.toastrService.warning("Role assigned Effective date can not be less than CardHolder's Effective date.");
            this.showLoader = false
            return;
          }
        }

        let cobExpiryOn = '';
        let cobEffectiveOn = '';
        let chOtherPlanKey = '';
        let cobPolicyNum = '';
        let cobDental;
        let cobHealth;
        let cobVision;
        let cobDrug;
        let cobHSA;
        if (this.cardholderCobVal && !this.cardholderCobVal.validated && (this.cardholderCobVal.benefits == false || this.cardholderCobVal.benefits == '')) {
          this.showLoader = false
          return false;
        }
        if (this.cardholderCobVal && this.cardholderCobVal.validated && this.cardholderCobVal.benefits) {
          cobExpiryOn = this.changeDateFormatService.convertDateObjectToString(this.cardholderCobVal.expiry_date)
          cobEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.cardholderCobVal.effective_date)
          chOtherPlanKey = this.cardholderCobVal.carrier;
          cobPolicyNum = this.cardholderCobVal.policy;
          cobDental = this.cardholderCobVal.cobDental;
          cobVision = this.cardholderCobVal.cobVision;
          cobHealth = this.cardholderCobVal.cobHealth;
          cobDrug = this.cardholderCobVal.cobDrug;
          cobHSA = this.cardholderCobVal.cobHSA;
          cobDental = this.cardholderCobVal.cobDental;
          if (this.cardholderCobVal && this.cardholderCobVal.carrier && !cobDental && !cobVision && !cobHealth && !cobDrug && !cobDental) {
            this.toastrService.warning('Please select COB Coordination of benefits');
            this.showLoader = false
            return false;
          }
          if (cobDental) {
            cobDental = 'T'
          }
          else {
            cobDental = 'F'
          }

          cobDrug = this.cardholderCobVal.cobDrug;
          if (cobDrug) {
            cobDrug = 'T'
          }
          else {
            cobDrug = 'F'
          }

          cobVision = this.cardholderCobVal.cobVision;
          if (cobVision) {
            cobVision = 'T'
          }
          else {
            cobVision = 'F'
          }

          cobHealth = this.cardholderCobVal.cobHealth;
          if (cobHealth) {
            cobHealth = 'T'
          }
          else {
            cobHealth = 'F'
          }

          cobHSA = this.cardholderCobVal.cobHSA;
          if (cobHSA) {
            cobHSA = 'T'
          }
          else {
            cobHSA = 'F'
          }
        }
        else {
          cobDental = 'F',
            cobDrug = 'F',
            cobVision = 'F',
            cobHealth = 'F',
            cobHSA = 'F'
        }

        var cardHolderCommentDtos = [];
        let userGroup = ""
        if (this.showCommentBussnsType) {
          userGroup = this.selcetdGroupkey
        } else {
          userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
        }
        if (this.commentFormData && this.commentFormData.commentjson) {
          for (var i = 0; i < this.commentFormData.commentjson.length; i++) {
            let chComImportance;
            if (this.commentFormData.commentjson[i].commentImportance == "Y") {
              chComImportance = "Y"
            }
            else {
              chComImportance = "N"
            }
            let expiredOn = this.commentFormData.commentjson[i].expiredOn

            var userId = this.currentUserService.currentUser.userId
            cardHolderCommentDtos.push({ userId: +userId, 'chComTxt': this.commentFormData.commentjson[i].commentTxt, 'chComImportance': chComImportance, 'userGroupKey': userGroup, 'expiredOn': expiredOn });
          }
        }

        let personEmployeeInd = mycardInformationForm.value.CardHolderGeneralInformationFormGroup.company_employee;
        if (personEmployeeInd) {
          personEmployeeInd = 'T'
        }
        else {
          personEmployeeInd = 'F'
        }

        var chIgnorePlanAge = mycardInformationForm.value.CardHolderEligibilityFormGroup.chIgnorePlanAge;
        if (chIgnorePlanAge) {
          chIgnorePlanAge = 'T'
        }
        else {
          chIgnorePlanAge = 'F'
        }

        let chRoleKey = "";

        if (mycardInformationForm.value.CardHolderRoleAssignedFormGroup.description) {
          chRoleKey = mycardInformationForm.value.CardHolderRoleAssignedFormGroup.description
        }

        if (chRoleKey == this.PrimaryCodeValue || (studentData && studentData.length > 0 && studentData[0].schoolName == '')) {
          studentData = [];
        }

        let apiUrl;
        let requestedData;
        var userId = this.currentUserService.currentUser.userId
        this.showLoader = true;
        apiUrl = CardApi.saveCardholderUrl;
        // HMS Point No:- 618 Checks added
        if (this.cob.cardholderCobVal.cobDental == true) {
          var cobDentalVal = "T"
        } else {
          cobDentalVal = "F"
        }
        if (this.cob.cardholderCobVal.cobDrug == true) {
          var cobDrugVal = "T"
        } else {
          cobDrugVal = "F"
        }
        if (this.cob.cardholderCobVal.cobHealth == true) {
          var cobHealthVal = "T"
        } else {
          cobHealthVal = "F"
        }
        if (this.cob.cardholderCobVal.cobHSA == true) {
          var cobHSAVal = "T"
        } else {
          cobHSAVal = "F"
        }
        if (this.cob.cardholderCobVal.cobVision == true) {
          var cobVisionVal = "T"
        } else {
          cobVisionVal = "F"
        }

        requestedData = {
          "rkey": Date.now(),
          "userId": userId,
          "coKey": +this.companyCoKey,
          "personFirstName": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.first_name,
          "personLastName": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.last_name,
          "personDtOfBirth": persondob,
          "personGenderCD": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.gender,
          "chCardKey": parseInt(this.chCardKey),
          "personEmployeeInd": personEmployeeInd,
          "sinNumber": "",
          "chRoleKey": +mycardInformationForm.value.CardHolderRoleAssignedFormGroup.description,
          "roleExpiryOn": roleExpiryOn,
          "roleEffectiveOn": roleEffectiveOn,
          "chIgnorePlanAge": chIgnorePlanAge,
          "eligibilityExpiryOn": eligibilityExpiryOn,
          "eligibilityEffectiveOn": eligibilityEffectiveOn,
          "chOtherPlanKey": this.cob.CardHolderCobFormGroup.value.carrier,
          "cobExpiryOn": this.changeDateFormatService.convertDateObjectToString(this.cob.CardHolderCobFormGroup.value.expiry_date),
          "cobEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.cob.CardHolderCobFormGroup.value.effective_date),
          "cobPolicyNum": this.cob.CardHolderCobFormGroup.value.policy,
          "cardHolderCommentDtos": cardHolderCommentDtos,
          "personStudentHistoryDto": studentData,
          "cobDental": cobDentalVal,
          "cobDrug": cobDrugVal,
          "cobHealth": cobHealthVal,
          "cobHSA": cobHSAVal,
          "cobVision": cobVisionVal,
          "cdEligibilityOn": eligibilityEffectiveOn,
        }
        // Task 599 Below boolean and for loop added to apply check if prime role already assigned then show toaster.
        // ('Primary Role already assigned to another Card Holder') Toaster are only shown in primary duplicate role only.
        this.duplicateRoleKey = false
        for (var i = 0; i < this.addCardholderArray.length; i++) {
          if (this.addCardholderArray[i].chRoleKey == 24 && this.addCardholderArray[i].chRoleKey == +mycardInformationForm.value.CardHolderRoleAssignedFormGroup.description) {
            this.toastrService.warning('Primary Role already assigned to another Card Holder');
            this.duplicateRoleKey = true
            this.showLoader = false
          }
        }
        // Task 599 save functionality surrounded by check so that only save if there is no duplicate prime role.
        if (!this.duplicateRoleKey) {
          this.addCardholderArray.push(requestedData);
          this.cardService.cardholderAddDetails.emit(this.addCardholderArray)
          this.showLoader = false;
          this.resetvalues();
          this.toastrService.success("Data Saved  Sucessfully");
          return true;
        }
      } catch (e) {
        this.showLoader = false;
      }
    } else {
      this.showLoader = false;
      this.validateAllFormFields(this.cardholderMainForm);
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  resetvalues() {
    this.cardholderMainForm.reset();
    this.tableData = [];
    this.cardService.resetComments.emit(true)
    this.cob.CardHolderCobFormGroup.reset();

    if (this.commentFormData && this.commentFormData.commentForm) {
      this.commentFormData.commentForm.reset();
    }
    this.eligibility.CardHolderEligibilityFormGroup.reset();

    if (this.cardExpDate) {
      if (this.cardExpDate['expiry_date']) {
        this.cardholderMainForm.patchValue({
          CardHolderRoleAssignedFormGroup: {
            'expiry_date': this.cardExpDate['expiry_date'],
          },
          CardHolderEligibilityFormGroup: {
            'expiry_date': this.cardExpDate['expiry_date'],
          },
        })
      }
    }

    if (this.cardEffDate) {
      if (this.cardEffDate['effective_date']) {
        this.cardholderMainForm.patchValue({
          CardHolderRoleAssignedFormGroup: {
            'effective_date': this.cardEffDate['effective_date'],
          },
          CardHolderEligibilityFormGroup: {
            'effective_date': this.cardEffDate['effective_date'],
          },
        })
      }
    }
  }

  deleteCardholder(data) {
    this.addCardholderArray = this.addCardholderArray.filter(cardHolder => cardHolder.rkey != data.rkey);
    // Task 600 Below one to resolve task where even if we delete newly added cardholder while creating new card and save whole card, it still save deleted one.
    this.cardService.cardholderAddDetails.emit(this.addCardholderArray)
  }

  editCardholder(data) {
    if (!this.editcardholderMode) {
      this.editcardholderMode = true;
      this.addCardholderArray = this.addCardholderArray.filter(cardHolder => cardHolder.rkey != data.rkey);
      this.patchValues(data);
    } else {
      this.toastrService.error("Please Save The Last Edited Cardholder Role!");
      return;
    }
  }

  patchValues(data) {
    this.cardService.updateComments.emit(data);
    this.companyKey = data.coKey;
    this.chCardKey = data.chCardKey;
    this.companyCoKey = data.coKey;
    this.CHStatus = data.status == 'INACTIVE' ? true : false;
    this.chRoleAssignKey = data.chRoleAssignKey;
    if (data.commentFlag == 'Y') {
      this.cardCommentImportance = true
    }
    else {
      this.cardCommentImportance = false
    }

    var personDtOfBirth = this.changeDateFormatService.convertStringDateToObject(data.personDtOfBirth)
    var roleExpiryOn = this.changeDateFormatService.convertStringDateToObject(data.roleExpiryOn)
    var roleEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.roleEffectiveOn)
    var eligibilityExpiryOn = this.changeDateFormatService.convertStringDateToObject(data.eligibilityExpiryOn)
    var eligibilityEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.eligibilityEffectiveOn)
    var cobExpiryOn;
    var cobEffectiveOn;

    if (data.cobExpiryOn) {
      cobExpiryOn = this.changeDateFormatService.convertStringDateToObject(data.cobExpiryOn)
    }
    if (data.cobEffectiveOn) {
      cobEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.cobEffectiveOn)
    }

    cobEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.cobEffectiveOn)
    var personEmployeeInd = data.personEmployeeInd;

    if (personEmployeeInd == 'T') {
      personEmployeeInd = true;
    }
    else {
      personEmployeeInd = false;
    }

    let cobDental;
    let cobHealth;
    let cobVision;
    let cobDrug;
    let cobHSA;

    cobDental = data.cobDental;
    if (cobDental == "T") {
      cobDental = true
    }
    else {
      cobDental = false
    }
    cobDrug = data.cobDrug;
    if (cobDrug == "T") {
      cobDrug = true
    }
    else {
      cobDrug = false
    }
    cobVision = data.cobVision;
    if (cobVision == "T") {
      cobVision = true
    }
    else {
      cobVision = false
    }

    cobHealth = data.cobHealth;
    if (cobHealth == "T") {
      cobHealth = true
    }
    else {
      cobHealth = false
    }

    cobHSA = data.cobHSA;
    if (cobHSA == "T") {
      cobHSA = true
    }
    else {
      cobHSA = false
    }

    var chIgnorePlanAge = data.chIgnorePlanAge;
    if (chIgnorePlanAge == "T") {
      chIgnorePlanAge = true
    }
    else {
      chIgnorePlanAge = false
    }
    this.tableData = data.personStudentHistoryDto;
    var dateCols = ['startDate', 'endDate'];
    this.changeDateFormatService.dateFormatListShow(dateCols, data.personStudentHistoryDto);

    if (data.chRoleKey == this.PrimaryCodeValue) {
      $('#divStudentHistory').css("display", "none");
      this.tableData = [];
    }
    else {
      if (!this.alberta) {
        $('#divStudentHistory').css("display", "block");
      }
    }
    this.cardHolderAge = this.changeDateFormatService.getAge(personDtOfBirth.date.year + '/' + personDtOfBirth.date.month + '/' + personDtOfBirth.date.day)
    var cardHolderAge = this.changeDateFormatService.getAge(personDtOfBirth.date.year + '/' + personDtOfBirth.date.month + '/' + personDtOfBirth.date.day)
    $('#lblCardHolderAge').html(cardHolderAge.toString())
    setTimeout(() => {
      this.cob.CardHolderCobFormGroup.patchValue(
        {
          'policy': data.cobPolicyNum,
          'effective_date': cobEffectiveOn,
          'expiry_date': cobExpiryOn,
          'carrier': data.chOtherPlanKey,
          'benefits': true,
          'validated': true,
          'cobDental': cobDental,
          'cobHealth': cobHealth,
          'cobVision': cobVision,
          'cobDrug': cobDrug,
          'cobHSA': cobHSA
        }
      )
      this.cardholderMainForm.patchValue(
        {
          CardHolderGeneralInformationFormGroup: {
            'card_id': data.cardNum,
            'first_name': data.personFirstName,
            'last_name': data.personLastName,
            'gender': data.personGenderCD,
            'date_of_birth': personDtOfBirth,
            'sin': data.sinNumber,
            'company_employee': personEmployeeInd,
          },
          CardHolderPopupGeneralInfoFormGroup: {
            'card_id': data.cardNum,
            'first_name': data.personFirstName,
            'last_name': data.personLastName,
            'gender': data.personGenderCD,
            'date_of_birth': personDtOfBirth,
            'sin': data.sinNumber,
          },
          CardHolderRoleAssignedFormGroup: {
            'description': data.chRoleKey,
            'effective_date': roleEffectiveOn,
            'expiry_date': roleExpiryOn,
          },
          CardHolderEligibilityFormGroup: {
            'chIgnorePlanAge': chIgnorePlanAge,
            'plan': data.chEligibilityKey,
            'effective_date': eligibilityEffectiveOn,
            'expiry_date': eligibilityExpiryOn,
            'chEligibilityKey': data.chEligibilityKey
          },
        });
    })
  }

  SaveUpdateCardHolderInfo(mycardInformationForm) {
    if (this.cardholderMainForm.valid) {
      var studentData = this.dataTableService.inlineTableData(this.tableID);
      var objDOB = mycardInformationForm.value.CardHolderGeneralInformationFormGroup.date_of_birth;
      let cardHolderAge = this.changeDateFormatService.getAge(objDOB.date.year + '/' + objDOB.date.month + '/' + objDOB.date.day);
      let persondob = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderGeneralInformationFormGroup.date_of_birth)
      let roleExpiryOn = '';
      if (mycardInformationForm.value.CardHolderRoleAssignedFormGroup.expiry_date) {
        roleExpiryOn = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderRoleAssignedFormGroup.expiry_date)
      }

      let roleEffectiveOn = '';
      if (mycardInformationForm.value.CardHolderRoleAssignedFormGroup.effective_date) {
        roleEffectiveOn = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderRoleAssignedFormGroup.effective_date)
      }

      let eligibilityExpiryOn = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderEligibilityFormGroup.expiry_date)
      let eligibilityEffectiveOn = this.changeDateFormatService.convertDateObjectToString(mycardInformationForm.value.CardHolderEligibilityFormGroup.effective_date)

      var isTrue = this.changeDateFormatService.compareTwoDate(eligibilityEffectiveOn, roleEffectiveOn);
      if (!this.alberta) {
        if (isTrue) {
          this.toastrService.warning("Role assigned Effective date can not be less than CardHolder's Effective date.");
          return;
        }
      }

      let cobExpiryOn = '';
      let cobEffectiveOn = '';
      let chOtherPlanKey = '';
      let cobPolicyNum = '';
      let cobDental;
      let cobHealth;
      let cobVision;
      let cobDrug;
      let cobHSA;
      if (this.cardholderCobVal && !this.cardholderCobVal.validated && (this.cardholderCobVal.benefits == false || this.cardholderCobVal.benefits == '')) {
        return false;
      }
      if (this.cardholderCobVal && this.cardholderCobVal.validated && this.cardholderCobVal.benefits) {
        cobExpiryOn = this.changeDateFormatService.convertDateObjectToString(this.cardholderCobVal.expiry_date)
        cobEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.cardholderCobVal.effective_date)
        chOtherPlanKey = this.cardholderCobVal.carrier;
        cobPolicyNum = this.cardholderCobVal.policy;
        cobDental = this.cardholderCobVal.cobDental;
        cobVision = this.cardholderCobVal.cobVision;
        cobHealth = this.cardholderCobVal.cobHealth;
        cobDrug = this.cardholderCobVal.cobDrug;
        cobHSA = this.cardholderCobVal.cobHSA;
        cobDental = this.cardholderCobVal.cobDental;
        if (this.cardholderCobVal && this.cardholderCobVal.carrier && !cobDental && !cobVision && !cobHealth && !cobDrug && !cobDental) {
          this.toastrService.warning('Please select COB Coordination of benefits');
          return false;
        }
        if (cobDental) {
          cobDental = 'T'
        }
        else {
          cobDental = 'F'
        }

        cobDrug = this.cardholderCobVal.cobDrug;
        if (cobDrug) {
          cobDrug = 'T'
        }
        else {
          cobDrug = 'F'
        }

        cobVision = this.cardholderCobVal.cobVision;
        if (cobVision) {
          cobVision = 'T'
        }
        else {
          cobVision = 'F'
        }

        cobHealth = this.cardholderCobVal.cobHealth;
        if (cobHealth) {
          cobHealth = 'T'
        }
        else {
          cobHealth = 'F'
        }

        cobHSA = this.cardholderCobVal.cobHSA;
        if (cobHSA) {
          cobHSA = 'T'
        }
        else {
          cobHSA = 'F'
        }
      }
      else {
        cobDental = 'F',
          cobDrug = 'F',
          cobVision = 'F',
          cobHealth = 'F',
          cobHSA = 'F'
      }

      var cardHolderCommentDtos = [];
      let userGroup = ""
      if (this.showCommentBussnsType) {
        userGroup = this.selcetdGroupkey
      } else {
        userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
      }
      if (this.commentFormData && this.commentFormData.commentjson) {
        for (var i = 0; i < this.commentFormData.commentjson.length; i++) {
          let chComImportance;
          if (this.commentFormData.commentjson[i].commentImportance == "Y") {
            chComImportance = "Y"
          }
          else {
            chComImportance = "N"
          }
          let expiredOn = this.commentFormData.commentjson[i].expiredOn
          var userId = this.currentUserService.currentUser.userId
          cardHolderCommentDtos.push({ userId: +userId, 'chComTxt': this.commentFormData.commentjson[i].commentTxt, 'chComImportance': chComImportance, 'userGroupKey': userGroup, 'expiredOn': expiredOn });
        }
      }

      let personEmployeeInd = mycardInformationForm.value.CardHolderGeneralInformationFormGroup.company_employee;
      if (personEmployeeInd) {
        personEmployeeInd = 'T'
      }
      else {
        personEmployeeInd = 'F'
      }

      var chIgnorePlanAge = mycardInformationForm.value.CardHolderEligibilityFormGroup.chIgnorePlanAge;
      if (chIgnorePlanAge) {
        chIgnorePlanAge = 'T'
      }
      else {
        chIgnorePlanAge = 'F'
      }

      let chRoleKey = "";

      if (mycardInformationForm.value.CardHolderRoleAssignedFormGroup.description) {
        chRoleKey = mycardInformationForm.value.CardHolderRoleAssignedFormGroup.description
      }

      if (chRoleKey == this.PrimaryCodeValue || (studentData && studentData.length > 0 && studentData[0].schoolName == '')) {
        studentData = [];
      }
      if (!this.alberta && chRoleKey == this.DependantCodeValue && chIgnorePlanAge == 'F') {
        if (studentData.length > 0 && cardHolderAge >= this.ageObject.age2) {
          this.toastrService.warning("For Dependant CardHolder, Age should be less than " + this.ageObject.age2 + " years!")
          return false;
        }
        else if (studentData.length == 0 && cardHolderAge >= this.ageObject.age1) {
          this.toastrService.warning("For Dependant CardHolder, Age should be less than " + this.ageObject.age1 + " years!")
          return false;
        }
      }

      let apiUrl;
      let requestedData;
      var userId = this.currentUserService.currentUser.userId
      if (this.isModify) {
        this.showLoader = true;
        apiUrl = CardApi.updateCardholderUrl;
        requestedData =
        {
          "userId": userId,
          "cardHolderKey": +this.cardHolderKey,
          "coKey": +this.companyCoKey,
          "personFirstName": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.first_name,
          "personLastName": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.last_name,
          "personDtOfBirth": persondob,
          "personGenderCD": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.gender,
          "chCardKey": parseInt(this.chCardKey),
          "sinNumber": "",
          "personEmployeeInd": personEmployeeInd,
          "chRoleKey": +chRoleKey,
          "roleExpiryOn": roleExpiryOn,
          "roleEffectiveOn": roleEffectiveOn,
          "chIgnorePlanAge": chIgnorePlanAge,
          "eligibilityExpiryOn": eligibilityExpiryOn,
          "eligibilityEffectiveOn": eligibilityEffectiveOn,
          "chOtherPlanKey": +chOtherPlanKey,
          "cobExpiryOn": cobExpiryOn,
          "cobEffectiveOn": cobEffectiveOn,
          "cobPolicyNum": cobPolicyNum,
          "cardHolderCommentDtos": cardHolderCommentDtos,
          "personStudentHistoryDto": [],
          "cobDental": cobDental,
          "cobDrug": cobDrug,
          "cobHealth": cobHealth,
          "cobHSA": cobHSA,
          "cobVision": cobVision,
          "chEligibilityKey": +mycardInformationForm.value.CardHolderEligibilityFormGroup.chEligibilityKey
        }
        this.hmsDataService.postApi(apiUrl, requestedData).subscribe(data => {
          this.showLoader = false;
          if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
            this.toastrService.success(this.translate.instant('card.toaster.record-update'))
            this.getCardHolderList()
            this.hmsDataService.OpenCloseModal("btnCloseCardHolder");
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
        },
          (err) => {
            this.hmsDataService.OpenCloseModal("btnCloseCardHolder");
            this.reset()
          })
      }
      else {
        this.showLoader = true;
        apiUrl = CardApi.saveCardholderUrl;

        requestedData = {
          "userId": userId,
          "coKey": +this.companyCoKey,
          "personFirstName": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.first_name,
          "personLastName": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.last_name,
          "personDtOfBirth": persondob,
          "personGenderCD": mycardInformationForm.value.CardHolderGeneralInformationFormGroup.gender,
          "chCardKey": parseInt(this.chCardKey),
          "personEmployeeInd": personEmployeeInd,
          "sinNumber": "",
          "chRoleKey": +mycardInformationForm.value.CardHolderRoleAssignedFormGroup.description,
          "roleExpiryOn": roleExpiryOn,
          "roleEffectiveOn": roleEffectiveOn,
          "chIgnorePlanAge": chIgnorePlanAge,
          "eligibilityExpiryOn": eligibilityExpiryOn,
          "eligibilityEffectiveOn": eligibilityEffectiveOn,
          "chOtherPlanKey": +chOtherPlanKey,
          "cobExpiryOn": cobExpiryOn,
          "cobEffectiveOn": cobEffectiveOn,
          "cobPolicyNum": cobPolicyNum,
          "cardHolderCommentDtos": cardHolderCommentDtos,
          "personStudentHistoryDto": studentData,
          "cobDental": cobDental,
          "cobDrug": cobDrug,
          "cobHealth": cobHealth,
          "cobHSA": cobHSA,
          "cobVision": cobVision,
          "cdEligibilityOn": eligibilityEffectiveOn
        }

        this.hmsDataService.putApi(apiUrl, [requestedData]).subscribe(data => {
          if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
            this.toastrService.success(this.translate.instant('card.toaster.record-save'));
            this.emitOnSave.emit("saved");
            this.getCardHolderList()
            this.hmsDataService.OpenCloseModal("btnCloseCardHolder");
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
        },
          (err) => {
            this.hmsDataService.OpenCloseModal("btnCloseCardHolder");
            this.reset()
          })
      }
    } else {
      this.validateAllFormFields(this.cardholderMainForm);
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  public findInvalidControls(formGroup: FormGroup) {
    const invalid = [];
    const controls = formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    if (invalid.length > 0) {
      return false;
    }
    else {
      return true;
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

  OpenCardHolder() {
    this.initializeStudentHistory();
    this.cardholderMainForm.reset();
    this.cardholderCobVal = {};
    this.getCardHolderKey();
  }

  OpenNewCardHolder() {
    this.isModify = false;
    this.viewMode = false;
    this.addMode = true;
    this.editMode = false;
    this.tableData = [];
    this.cardholderCobVal = {};
    this.cardHolderKey = '';
    this.cardCommentImportance = false
    this.cob.CardHolderCobFormGroup.reset();
    if (!this.alberta) {
      $('#divStudentHistory').css("display", "block");
    }

    this.hmsDataService.OpenCloseModal("btnResetComment");
    this.cardholderMainForm.enable();
    this.initializeStudentHistory();
    this.cardholderMainForm.reset();
    this.checkFocus = true;
    if (jQuery("#cardHolderAddNew").hasClass("fade")) {
      this.ObservableObj = Observable.interval(1000).subscribe(x => {

        if (this.checkFocus) {

          let vm = this;
          jQuery("#txtLastName").focus(function () {

            vm.checkFocus = false;
            vm.ObservableObj.unsubscribe();
          });
          document.getElementById('txtLastName').focus();
        } else { }
      });
    }

    if (this.cardExpDate) {
      this.cardholderMainForm.patchValue({
        CardHolderEligibilityFormGroup: {
          'expiry_date': this.cardExpDate['expiry_date']
        }
      });

      this.cardholderMainForm.patchValue({
        CardHolderRoleAssignedFormGroup: {
          'expiry_date': this.cardExpDate['expiry_date']
        }
      });
      this.eligibility.resetClass();
    }
    if (this.cardEffDate) {
      this.cardholderMainForm.patchValue({
        CardHolderEligibilityFormGroup: {
          'effective_date': this.cardEffDate['effective_date']
        }
      });

      this.cardholderMainForm.patchValue({
        CardHolderRoleAssignedFormGroup: {
          'effective_date': this.cardEffDate['effective_date']
        }
      });
    }

    this.getCardHolderKey();
    this.enableActivateBtn = false
    this.enableTerminateBtn = false
  }

  getCardHolderKey() {
    this.route.params.subscribe((params: Params) => {
      this.chCardKey = params['id'];
      this.route.queryParams.subscribe(queryParam => {
        this.cardHolderKeyParam = queryParam['cardHolderKey']
        this.unitKey = queryParam['unitKey']
      })
      if (this.chCardKey != '' && this.chCardKey != undefined) {
        let submitData = {
          "cardKey": this.chCardKey,
          "cardHolderKey": this.cardHolderKeyParam,
          "unitKey": this.unitKey
        }

        this.hmsDataService.postApi(CardApi.getCardDetails, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            if (data.result.businessTypeCd == Constants.albertaBusinessTypeCd) {
              this.alberta = true
            }
            else {
              this.alberta = false;
            }
            this.companyCoKey = data.result.coKey;
            this.cert = data.result.cardNum;

            this.getCompanyPlanInfo();
            this.cardholderMainForm.patchValue({
              CardHolderGeneralInformationFormGroup: {
                'card_id': data.result.cardNum
              }
            });
            this.cardEffDate = data.result.cardEligibility.effectiveOn;
            this.cardExpiryDate = data.result.cardEligibility.expireOn;
            this.cardService.cardEffectiveDate.emit(this.cardEffDate)
          }
        })
      }
    })
  }

  DeleteCardHolderById(Id) {
    this.showLoader = true;
    let requestedData = {
      "cardKey": +this.chCardKey
    }
    this.claimData = [];
    this.hmsDataService.postApi(CardApi.getClaimsByCardholderKey, requestedData).subscribe(data => {
      let claimResult = this.claimData;
      if (data.code == 200 && data.status == "OK") {
        this.claimData = claimResult = data.result;
        if (claimResult.length > 0) {
          this.showLoader = false;
          this.hmsDataService.OpenCloseModal('PendingClaimsBtn');
          this.toastrService.warning(this.translate.instant('card.toaster.cant-delete-record'));
        } else {
          this.showLoader = false;
          this.DeleteCardHolder(Id, claimResult);
        }
      } else {
        this.showLoader = false;
        this.DeleteCardHolder(Id, claimResult);
      }
      error => {
      }
    });
  }

  DeleteCardHolder(Id, claimResult) {
    let requestedData = {
      "cardHolderKey": Id
    }
    var actionType = ''
    if (this.alberta) {
      actionType = this.translate.instant('card.clients');
    }
    else {
      actionType = this.translate.instant('card.cardholders');
    }
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete') + actionType + this.translate.instant('card.exDialog.ques')).subscribe((value) => {
      if (value) {
        this.hmsDataService.postApi(CardApi.deleteCardHolderById, requestedData).subscribe(response => {
          if (response.hmsMessage.messageShort == "CARDHOLDER_DELETED_SUCCESSFULLY") {
            this.toastrService.success(this.translate.instant('card.toaster.record-delete'))
            this.getCardHolderList();
            this.getCardStatus()  // HMS Issue point no.670
          }
        }, (error) => { });
      }
    })
  }

  GetCardHolderById(idx: number, id, actionType: string, personKey) {
    this.errorArray = []
    this.personKey = personKey
    this.cardHodercommentForm.reset();
    if (actionType == 'edit') {
      this.addMode = false;
      this.viewMode = false;
      this.editMode = true;
      this.editCardholderComment = true
      this.viewCardholderComment = false
      this.cardholderMainForm.enable();
    }
    else if (actionType == 'view') {
      this.addMode = false;
      this.viewMode = true;
      this.editMode = false;
      this.viewCardholderComment = true
      this.editCardholderComment = false
      this.cardholderMainForm.disable();
    } else {
      this.addMode = false;
      this.viewMode = true;
      this.editMode = false;
    }
    this.cardHolderKey = id;
    let requestedData = {
      "cardHolderKey": id
    }

    this.hmsDataService.postApi(CardApi.getCardHolderdetailById, requestedData).subscribe(response => {
      if (response.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.showLoader = true;
        this.hmsDataService.OpenCloseModal("btnOpenCardHolder");
        this.isModify = true;
        let data = response.result;
        this.companyKey = data.coKey;
        this.chCardKey = data.chCardKey;
        this.companyCoKey = data.coKey;
        this.CHStatus = data.status == 'INACTIVE' ? true : false;
        this.chRoleAssignKey = data.chRoleAssignKey;
        this.getCompanyPlanInfo();
        if (data.commentFlag == 'Y') {
          this.cardCommentImportance = true
        }
        else {
          this.cardCommentImportance = false
        }

        var personDtOfBirth = this.changeDateFormatService.convertStringDateToObject(data.personDtOfBirth)
        var roleExpiryOn = this.changeDateFormatService.convertStringDateToObject(data.roleExpiryOn)
        var roleEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.roleEffectiveOn)
        var eligibilityExpiryOn = this.changeDateFormatService.convertStringDateToObject(data.eligibilityExpiryOn)
        var eligibilityEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.eligibilityEffectiveOn)
        var cobExpiryOn;
        var cobEffectiveOn;
        if (data.cobExpiryOn) {
          cobExpiryOn = this.changeDateFormatService.convertStringDateToObject(data.cobExpiryOn)
        }
        if (data.cobEffectiveOn) {
          cobEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.cobEffectiveOn)
        }

        cobEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.cobEffectiveOn)
        var personEmployeeInd = data.personEmployeeInd;
        if (personEmployeeInd == 'T') {
          personEmployeeInd = true;
        }
        else {
          personEmployeeInd = false;
        }
        let cobDental;
        let cobHealth;
        let cobVision;
        let cobDrug;
        let cobHSA;

        cobDental = data.cobDental;
        if (cobDental == "T") {
          cobDental = true
        }
        else {
          cobDental = false
        }

        cobDrug = data.cobDrug;
        if (cobDrug == "T") {
          cobDrug = true
        }
        else {
          cobDrug = false
        }

        cobVision = data.cobVision;
        if (cobVision == "T") {
          cobVision = true
        }
        else {
          cobVision = false
        }

        cobHealth = data.cobHealth;
        if (cobHealth == "T") {
          cobHealth = true
        }
        else {
          cobHealth = false
        }

        cobHSA = data.cobHSA;
        if (cobHSA == "T") {
          cobHSA = true
        }
        else {
          cobHSA = false
        }

        var chIgnorePlanAge = data.chIgnorePlanAge;
        if (chIgnorePlanAge == "T") {
          chIgnorePlanAge = true
        }
        else {
          chIgnorePlanAge = false
        }

        this.tableData = data.personStudentHistoryDto;

        var dateCols = ['startDate', 'endDate'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.personStudentHistoryDto);

        if (data.chRoleKey == this.PrimaryCodeValue) {
          $('#divStudentHistory').css("display", "none");
          this.tableData = [];
        }
        else {
          if (!this.alberta) {
            $('#divStudentHistory').css("display", "block");
          }
        }
        this.cardHolderAge = this.changeDateFormatService.getAge(personDtOfBirth.date.year + '/' + personDtOfBirth.date.month + '/' + personDtOfBirth.date.day)
        var cardHolderAge = this.changeDateFormatService.getAge(personDtOfBirth.date.year + '/' + personDtOfBirth.date.month + '/' + personDtOfBirth.date.day)
        $('#lblCardHolderAge').html(cardHolderAge.toString())
        setTimeout(() => {
          this.cardholderMainForm.patchValue(
            {
              CardHolderGeneralInformationFormGroup: {
                'card_id': data.cardNum,
                'first_name': data.personFirstName,
                'last_name': data.personLastName,
                'gender': data.personGenderCD,
                'date_of_birth': personDtOfBirth,
                'sin': data.sinNumber,
                'company_employee': personEmployeeInd,
              },
              CardHolderPopupGeneralInfoFormGroup: {
                'card_id': data.cardNum,
                'first_name': data.personFirstName,
                'last_name': data.personLastName,
                'gender': data.personGenderCD,
                'date_of_birth': personDtOfBirth,
                'sin': data.sinNumber,
              },
              CardHolderRoleAssignedFormGroup: {
                'description': data.chRoleKey,
                'effective_date': roleEffectiveOn,
                'expiry_date': roleExpiryOn,
              },
              CardHolderCobFormGroup: {
                'policy': data.cobPolicyNum,
                'effective_date': cobEffectiveOn,
                'expiry_date': cobExpiryOn,
                'carrier': data.chOtherPlanKey,
                'benefits': true,
                'validated': true,
                'cobDental': cobDental,
                'cobHealth': cobHealth,
                'cobVision': cobVision,
                'cobDrug': cobDrug,
                'cobHSA': cobHSA
              },

              CardHolderEligibilityFormGroup: {
                'chIgnorePlanAge': chIgnorePlanAge,
                'plan': data.chEligibilityKey,
                'effective_date': eligibilityEffectiveOn,
                'expiry_date': eligibilityExpiryOn,
                'chEligibilityKey': data.chEligibilityKey
              },
            });
          this.cardService.getChEligibilityEffective.emit(eligibilityEffectiveOn)
          this.cardService.getChEligibilityKey.emit(data.chEligibilityKey)

          this.cardholderCobVal = {
            policy: data.cobPolicyNum,
            effective_date: cobEffectiveOn,
            expiry_date: cobExpiryOn,
            carrier: data.chOtherPlanKey,
            cobDental: cobDental,
            cobVision: cobVision,
            cobHealth: cobHealth,
            cobDrug: cobDrug,
            cobHSA: cobHSA,
            benefits: true,
            validated: true
          }
          // To patch the values of COB form while fixing Log #1197
          this.cob.CardHolderCobFormGroup.patchValue(
            {
              'policy': data.cobPolicyNum,
              'effective_date': cobEffectiveOn,
              'expiry_date': cobExpiryOn,
              'carrier': data.chOtherPlanKey,
              'benefits': true,
              'validated': true,
              'cobDental': cobDental,
              'cobHealth': cobHealth,
              'cobVision': cobVision,
              'cobDrug': cobDrug,
              'cobHSA': cobHSA
            }
          )
          this.showLoader = false;
        }, 1000);

        var objGeneralInfo = {
          'card_id': data.cardNum,
          'first_name': data.personFirstName,
          'last_name': data.personLastName,
          'gender': data.personGenderCD,
          'date_of_birth': personDtOfBirth,
          'sin': data.sinNumber,
        }
        this.cardService.getCardHolderGeneralInfo.emit(objGeneralInfo);
        this.requestedData = [{
          'chPersonKey': data.chPersonKey,
          'cardHolderKey': data.cardHolderKey,
        }];

        var tableid = 'student-table';
        for (var j = 0; j < this.tableData.length; j++) {
          this.studentDateNameArray[tableid + j + 'startDate'] = this.tableData[j]['startDate']
          this.studentDateNameArray[tableid + j + 'endDate'] = this.tableData[j]['endDate']
        }
        var self = this
        var tableId
        var userId = this.currentUserService.currentUser.userId
        var reqParam = [{ 'key': 'cardHolderKey', 'value': this.cardHolderKey }, { 'key': 'userId', 'value': +userId }]

        var tableActions = [{ 'name': 'edit', 'title': 'Edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil' }, { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': 'T' }]
        if (this.commentsParams.requestMode == 'post') {
          var url = CardApi.getCardHolderComments;
        } else {
          var url = CardApi.getCardHolderComments;
        }
        /* Datatable for Person comments section */
        let reqParamPersonComment = [{ 'key': 'personKey', 'value': this.personKey }];
        let tableActionsPersonComment = [{ 'name': 'edit', 'title': 'Edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil' }, { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': 'T' }]
        if (!$.fn.dataTable.isDataTable('#cardholderPersonComment')) {
          this.dataTableService.jqueryDataTableComment('cardholderPersonComment', CardApi.getCHPersonCommentUrl, 'full_numbers', this.personCommentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParamPersonComment, tableActionsPersonComment, 3, 2, [0], null, [1, 3])
        } else {
          this.dataTableService.jqueryDataTableReload('cardholderPersonComment', CardApi.getCHPersonCommentUrl, reqParamPersonComment)
        }

        if (data.commentText != "" && data.commentText != null) {
          this.commentText = data.commentText;
          var tbl_ImportantComment = "CH-Important-Comment"
          if (!$.fn.dataTable.isDataTable('#CH-Important-Comment')) {
            var dateCols = ['createdOn']
            this.dataTableService.jqueryDataTableComment(tbl_ImportantComment, url, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
          } else {
            this.dataTableService.jqueryDataTableReload(tbl_ImportantComment, url, reqParam)
          }
        }
      } else if (response.message == 'hms-cardholder-service under maintenance') {
        this.toastrService.warning(this.translate.instant('card.toaster.warn-service'));
      }

      let vm = this;
      jQuery("#txtLastName").focus(function () {
        vm.checkFocus = false;
        vm.ObservableObj.unsubscribe();
      });
      document.getElementById('txtLastName').focus();
    })
    this.getUserBussinesType();
  }

  cardHolderFlag(id) {
    let requestedData = {
      "cardHolderKey": id
    }

    this.hmsDataService.postApi(CardApi.getCardHolderdetailById, requestedData).subscribe(response => {
      if (response.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        let data = response.result;
        if (data.commentFlag == 'Y') {
          this.cardCommentImportance = true
        }
        else {
          this.cardCommentImportance = false
        }
      }
    })
  }

  GetAdjustmentHistory() {
    this.hmsDataService.OpenCloseModal("btnExpenseAdjustmentHistory");
  }

  GetTotalForCardHolder(cardHolderKey) {
    this.showLoader = true;
    this.savedCardHolderKey = cardHolderKey; //HMS Issue No.646
    var noOfYearsDivMaxVal = this.noOfYearsDivMaxYear;
    var noOfYearsCovMaxVal = this.coverageMaxYear;
    var noOfYearsCcMaxVal = this.noOfYearsCcMaxYear;
    var noOfYearsHsaMaxVal = this.noOfYearsHsaMaxYear;
    var noOfYearsCSVal = this.noOfYearsCSYear;
    var noOfYearsWellMaxVal = this.noOfYearsWellMaxYear;
    if (this.totalsPopupClosed) {
      noOfYearsDivMaxVal = noOfYearsCovMaxVal = noOfYearsCcMaxVal = noOfYearsHsaMaxVal = noOfYearsCSVal = noOfYearsWellMaxVal = 1
    }
    this.showLoader = true;
    this.savedCardHolderKey = cardHolderKey;
    var requestedData = {
      'cardholderKey': cardHolderKey,
      'refDate': this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
      'noOfYearsCovMax': noOfYearsCovMaxVal,
      'noOfYearsCcMax': noOfYearsCcMaxVal,
      'noOfYearsHsaMax': noOfYearsHsaMaxVal,
      'noOfYearsDivMax': noOfYearsDivMaxVal,
      'noOfYearsCS': noOfYearsCSVal,
      'noOfYearsWellMax': noOfYearsWellMaxVal,
    };

    this.hmsDataService.postApi(CardApi.getTotalForCardHolderUrl, requestedData).subscribe(data => {
      this.showLoader = false;
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrCCMax = (data.result.getCcMax != undefined && data.result.getCcMax != null) ? data.result.getCcMax : [];
        this.arrCovMax = (data.result.getCovMax != undefined && data.result.getCovMax != null) ? data.result.getCovMax : [];
        this.arrHSAMax = (data.result.getHsaMax != undefined && data.result.getHsaMax != null) ? data.result.getHsaMax : [];
        this.arrDivMax = (data.result.getDivMax != undefined && data.result.getDivMax != null) ? data.result.getDivMax : [];
        this.arrClaimSecureMax = (data.result.getClaimSecureMax != undefined && data.result.getClaimSecureMax != null) ? data.result.getClaimSecureMax : [];
        this.arrWellMax = (data.result.getWellMax != undefined && data.result.getWellMax != null) ? data.result.getWellMax : []

        this.getCcMaxValue = (data.result.getCcMax && data.result.getCcMax.length > 0) ? true : false;
        this.getCovMaxValue = (data.result.getCovMax && data.result.getCovMax.length > 0) ? true : false;
        this.getHsaMaxValue = (data.result.getHsaMax && data.result.getHsaMax.length > 0) ? true : false;
        this.getDivMaxValue = ((data.result.getHsaMax && data.result.getHsaMax.length <= 0) && (data.result.getDivMax && data.result.getDivMax.length > 0)) ? true : false;
        this.getClaimSecureMaxValue = (data.result.getClaimSecureMax != undefined && data.result.getClaimSecureMax != null && data.result.getClaimSecureMax.length > 0) ? true : false //(data.result.getClaimSecureMax && data.result.getClaimSecureMax.length > 0) ? true : false;
        this.getWellMaxValue = (data.result.getWellMax && data.result.getWellMax.length > 0) ? true : false;
        // for issue number 517 start
        if (this.selectedYear === null) {
          this.hmsDataService.OpenCloseModal('ModalCCMaxTotalBtn');
          this.coverageMaxYear = 'null';
          this.noOfYearsCcMaxYear = 'null';
          this.noOfYearsHsaMaxYear = 'null';
          this.noOfYearsDivMaxYear = 'null';
          this.noOfYearsCSYear = 'null';
          this.noOfYearsWellMaxYear = 'null'
        }
        this.selectedYear = null;
        if (!$.fn.dataTable.isDataTable('#ClaimTotalCOVMax')) {
          this.dtTrigger['ClaimTotalCOVMax'].next()
        } else {
          this.reloadTable('ClaimTotalCOVMax');
        }

        var dateCols = ['periodStart', 'periodEnd'];
        this.changeDateFormatService.dateFormatListShow(dateCols, this.arrCCMax);
        this.changeDateFormatService.dateFormatListShow(dateCols, this.arrCovMax);
        this.changeDateFormatService.dateFormatListShow(dateCols, this.arrHSAMax);
        this.changeDateFormatService.dateFormatListShow(dateCols, this.arrDivMax);
        this.changeDateFormatService.dateFormatListShow(dateCols, this.arrClaimSecureMax);
        this.changeDateFormatService.dateFormatListShow(dateCols, this.arrWellMax)
      } else {
        this.getCcMaxValue = false;
        this.getCovMaxValue = false;
        this.getHsaMaxValue = false;
        this.getDivMaxValue = false;
        this.getClaimSecureMaxValue = false;
        this.getWellMaxValue = false
        this.noRecordFound = true;
        this.toastrService.warning(this.translate.instant('card.toaster.record-not-found'))
      }
    })
  }

  onChangeYear(event, type) {
    this.totalsPopupClosed = false // Task 646 boolean added on click of list for check so that whenever year dropdpwn changes, its value sent further for result
    if (event.target.value.length > 0) {
      this.selectedYear = event.target.value;
      if (type === "coverageMax") {
        this.coverageMaxYear = event.target.value;
      }
      if (type === "noOfYearsCcMax") {
        this.noOfYearsCcMaxYear = event.target.value;
      }
      if (type === "noOfYearsHsaMax") {
        this.noOfYearsHsaMaxYear = event.target.value;
      }
      if (type === "noOfYearsDivMax") {
        this.noOfYearsDivMaxYear = event.target.value;
      }
      if (type === "noOfYearsCS") {
        this.noOfYearsCSYear = event.target.value;
      }
      if (type === "noOfYearsWellMax") {
        this.noOfYearsWellMaxYear = event.target.value
      }
      this.GetTotalForCardHolder(this.savedCardHolderKey);
    }
  }

  reset() {
    if (this.editcardholderMode) {
      this.toastrService.error("Please Save The Last Edited Cardholder Role!");
      return;
    }
    this.hmsDataService.OpenCloseModal('btnCloseCardHolder');
    this.getCardHolderList();
    this.tableData = [];
    this.cardholderMainForm.reset();
    this.cob.CardHolderCobFormGroup.reset();
    if (this.commentFormData && this.commentFormData.commentForm) {
      this.commentFormData.commentForm.reset();
    }
    this.eligibility.CardHolderEligibilityFormGroup.reset();

    if (this.cardExpDate) {
      if (this.cardExpDate['expiry_date']) {
        this.cardholderMainForm.patchValue({
          CardHolderRoleAssignedFormGroup: {
            'expiry_date': this.cardExpDate['expiry_date'],
          },
          CardHolderEligibilityFormGroup: {
            'expiry_date': this.cardExpDate['expiry_date'],
          },
        })
      }
    }
    if (this.cardEffDate) {
      if (this.cardEffDate['effective_date']) {
        this.cardholderMainForm.patchValue({
          CardHolderRoleAssignedFormGroup: {
            'effective_date': this.cardEffDate['effective_date'],
          },
          CardHolderEligibilityFormGroup: {
            'effective_date': this.cardEffDate['effective_date'],
          },
        })
      }
    }
    this.editCommentMode = false;
  }

  getCardHolderList() {
    this.route.params.subscribe((params: Params) => {
      this.chCardKey = params['id'];
    });
    let submitData = {
      "cardId": this.chCardKey
    }
    this.hmsDataService.postApi(CardApi.getCardHolderListByCardId, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {

        if (!$.fn.dataTable.isDataTable('#SearchedCards')) {
        } else {
          this.searchedCards = data.result.object;
          this.activeCardholders = this.searchedCards.filter(val => val.status === "ACTIVE").map(data => data)
          this.cardHolderKeysArray = this.searchedCards.map(({ cardHolderKey }) => cardHolderKey);
          this.cholderkeys.emit(this.cardHolderKeysArray);
          var dateCols = ['personDtOfBirth'];
          this.changeDateFormatService.dateFormatListShow(dateCols, data.result.object);
          if (this.activeCardholders.length == 0) {
            this.cardTerminationDate = this.lastCHTermDate
          }
          if (this.activeCardholders.length <= 1 && this.terminateCardForOneCH == true) {
            this.terminateCardAfterCardholder();
          }
          if (this.searchedCards.length != 0) {
            if (this.searchedCards.length == 1) {
              this.cardService.familyType.emit("Single")
            } else {
              this.cardService.familyType.emit("Family")
            }
          }
          this.isShowCardHolderLIst = true;
          if (this.searchedCards.length > 0 && this.openClaimList) {
            let opencard = localStorage.getItem("cardholderKey");
            if (opencard != '') {
              opencard = '#' + opencard + 'button';
              setTimeout(() => {
                $(opencard).trigger('click');
                localStorage.setItem("cardholderKey", "");
              }, 400);
            }
          }
        }
      }
      else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.searchedCards = []
      }
      error => { }
    });
  }

  reloadTable(tableId) {
    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }
  ViewCardHolderData(idx) {
    this.cardholderMainForm.disable();
  }

  editCardHolder(idx, cardHolderKey) {}

  deleteCardHolder(idx, cardHolderKey) {}

  changeDateFormat(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this;
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;

      // Set Date Picker Value to Form Control Element
      if (frmControlName == 'activateDate') {
        this.cardHolderActivate.patchValue(datePickerValue);
      }
      if (frmControlName == 'expiry_date') {
        /* To pick the expry date val for cardholderCommentForm start*/
        this.cardHodercommentForm.patchValue(datePickerValue);
        this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
        if (!this.expired && obj) {
          self[formName].controls[frmControlName].setErrors({
            "dateNotValid": true
          });
        }

        if (event.reason == 1 && (event.value != null && event.value != '')) {
          this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);

        } else {
          this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
        }
      }
      if (frmControlName == 'cardActivateDate') {
        this.cardActivate.patchValue(datePickerValue);
      }
      if (frmControlName == 'terminateDate') {
        this.cardHolderTerminate.patchValue(datePickerValue);
      }
      if (frmControlName == 'terminateCardDate') {
        this.cardTerminate.patchValue(datePickerValue);
      }
      if (frmControlName == 'date_of_birth') {
        this.cardHolderAddModeFormGroup.patchValue(datePickerValue);
        this.cardholderDataForSave(datePickerValue);
      }
      if (frmControlName == 'terminateCardDate') {
        this.cardTerminate.patchValue(datePickerValue);
        if (this.cardTerminate.value.terminateCardDate && this.cardEffectiveOnDate) {
          this.error = this.changeDateFormatService.compareTwoDates(this.cardEffectiveOnDate.date, this.cardTerminate.value.terminateCardDate.date);
          if (this.error.isError == true) {
            this.cardTerminate.controls['terminateCardDate'].setErrors({
              "terminateGreater": true
            });
          }
        }
      }

      if (frmControlName == 'terminateDate') {
        if (this.cardHolderTerminate.value.terminateDate && this.cardEffectiveOnDate) {
          this.error = this.changeDateFormatService.compareTwoDates(this.cardEffectiveOnDate.date, this.cardHolderTerminate.value.terminateDate.date);
          if (this.error.isError == true) {
            this.cardHolderTerminate.controls['terminateDate'].setErrors({
              "terminateGreater": true
            });
          }
        }
      }
    }
  }

  termianteCardHolder() {
    let submitData;
    let ApiUrl;
    var actionType = '';
    this.lastCHTermDate = this.changeDateFormatService.convertDateObjectToString(this.cardHolderTerminate.value.terminateDate)
    submitData = {
      'date': this.changeDateFormatService.convertDateObjectToString(this.cardHolderTerminate.value.terminateDate),
      'cardHolderKey': this.noPendingClaimsData
    }
    ApiUrl = CardApi.terminateCardHolder

    if (this.cardHolderTerminate.valid) {
      if (this.alberta) {
        actionType = this.translate.instant('card.clients');
      }
      else if (this.searchedCards.length == this.selectedCardHolderKey.length) {
        actionType = 'Card';
      }
      else {
        actionType = this.translate.instant('card.cardholders');
      }
      this.exDialog.openConfirm(this.translate.instant('card.exDialog.terminate') + actionType + this.translate.instant('card.exDialog.ques')).subscribe((value) => {
        if (value) {
          this.hmsDataService.postApi(ApiUrl, submitData).subscribe((data) => {
            if (data.code == 200 && data.status == "OK") {
              if (data.result && data.result.length && data.result.terminatedFailed.length) {
                var str = ""
                for (var i = 0; i < data.result.terminatedFailed.length; i++) {
                  var str = str + data.result.terminatedFailed[i].name + ","
                }
                var firstChar = str.slice(0, -1);
                if (firstChar == ',') {
                  str = str.slice(1);
                }
                var lastChar = str.slice(-1);
                if (lastChar == ',') {
                  str = str.slice(0, -1);
                }
                this.toastrService.warning(this.translate.instant('card.toaster.cant-terminate') + str + this.translate.instant('card.toaster.termination-date'))
              } else {
                var actionType = this.translate.instant('card.cardholders');
                if (this.alberta) {
                  actionType = this.translate.instant('card.clients');
                }
                this.toastrService.success("" + actionType + this.translate.instant('card.toaster.terminate-success'))
              }
              this.cardHolderTerminate.reset();
              this.selectedCardHolderKey = [];
              this.hmsDataService.OpenCloseModal("terminateCloseButton");
              this.enableActivateBtn = false
              this.enableTerminateBtn = false
              this.selectedCardholderData = [];
              this.activeCardHolder = [];
              this.inActiveCardHolder = [];
              this.getCardHolderList();
              this.getCardStatus();
            }
            else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == 'TERMINATE_DATE_MUST_BE_GREATER_THAN_BANK_ACCOUNT_CREATED_DATE') {
              this.toastrService.error("Termination Date Should Be Greater Than Bank Account Created Date")
            } else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == 'TERMINATE_DATE_MUST_BE_GREATER_THAT_CARD_EFFECTIVE_DATE') {
              this.toastrService.error("Termination Date Must Be Greater Than Card Effective Date")
            }
            else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == 'CARDHOLDER_HAS_PAID_CLAIMS_AFTER_TERMINATION_DATE') {
              this.toastrService.error("CardHolder Has Pending Claims After Termination Date")
            }
            else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == 'CARD_BANK_ASSIGNMENT_CANNOT_BE_DELETED') {
              this.toastrService.error("Card Bank Assigment Cannot Be Deleted")
            }
            else { }
            error => {
              this.getCardHolderList();
              this.getCardStatus();
              this.cardHolderTerminate.reset()
            }
          })
        } else {
          this.cardHolderTerminate.reset()
          this.disableReActDate = false;
          this.termActTitle = 'Termination Date';
          this.hmsDataService.OpenCloseModal('terminateCardBtn');
          this.getCardHolderList();
          this.getCardStatus();
        }
      })
    }
    else {
      this.validateAllFormFields(this.cardHolderTerminate);
    }
  }

  terminateCardAfterCardholder() {
    if (this.activeCardholders.length == 0) {
      var submitData = {
        "cardKey": this.chCardKey,
        "cardTerminateDate": this.cardTerminationDate,
        "cdEligibilityKey": this.cardEligKey,
        "chEligibilityKey": "",
        "cardHolderKey": ""
      }
      var ApiUrl = CardApi.terminateCard
      this.hmsDataService.postApi(ApiUrl, submitData).subscribe((data) => {
        if (data.code == 200 && data.status == "OK") {
          this.toastrService.success("Card Terminated Successfully!")
          this.fillCardDetails();
          this.ngOnInit();
        }
        else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "TERMINATE_DATE_MUST_BE_GREATER_THAN_BANK_ACCOUNT_CREATED_DATE") {
          this.toastrService.error("Card Termination Failed!!! Termination Date Must Be Greater Than Bank Account Created Date")
        }
        this.getCardStatus();
        error => {}
      });
    }
  }

  terminateCardForSingleCH() {
    if (this.cardTerminate.valid) {
      if (this.activeCardholders.length <= 1 && this.cardTerminate.value.terminateCardDate) {
        var submitData = {
          "cardKey": this.chCardKey,
          "cardTerminateDate": this.changeDateFormatService.convertDateObjectToString(this.cardTerminate.value.terminateCardDate),
          "cdEligibilityKey": this.cardEligKey,
          "chEligibilityKey": "",
          "cardHolderKey": ""
        }
        var ApiUrl = CardApi.terminateCard
        let requestedData = {
          "cardKey": +this.chCardKey,
          "serviceDate": this.changeDateFormatService.convertDateObjectToString(this.cardTerminate.value.terminateCardDate),
        }
        if (this.alberta) {
          this.getTerminateCardAPICommon(ApiUrl, submitData)
        } else {
          this.hmsDataService.postApi(CardApi.getClaimsByCardholderKey, requestedData).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              this.showConfirmationBtn = true
              this.claimData = data.result;
              this.hmsDataService.OpenCloseModal('PendingClaimsBtn');
              this.toastrService.warning("Cannot Terminate As Card Has Some Pending Claims!!", '', {
                timeOut: 4000,
              })
            } else {
              this.showConfirmationBtn = false;
              this.getTerminateCardAPICommon(ApiUrl, submitData);
            }
          })
        }
      }
    }
    else {
      this.validateAllFormFields(this.cardTerminate);
    }
  }

  undoCardTerminate() {
    var submitData = {
      "cardKey": this.chCardKey,
      "cardTerminateDate": this.cardHolderTerminate.value.terminateDate != null ? this.changeDateFormatService.convertDateObjectToString(this.cardHolderTerminate.value.terminateDate) : "",// this.cardExpiryDate, // Log #1086
      "cdEligibilityKey": this.cardEligKey,
      "chEligibilityKey": "",
      "cardHolderKey": ""
    }
    var ApiUrl = CardApi.terminateCard
    this.hmsDataService.postApi(ApiUrl, submitData).subscribe((data) => {
      if (data.code == 200 && data.status == "OK") {
        this.showUndoCardHolderBtn = true;
        this.toastrService.success("Card Reactivated Successfully")
        this.hmsDataService.OpenCloseModal("terminateCloseButton");
        this.enableActivateBtn = false
        this.enableTerminateBtn = false
        this.selectedCardholderData = [];
        this.activeCardHolder = [];
        this.inActiveCardHolder = [];
        this.getCardStatus();
        this.getCardHolderList();
        this.emitOnSave.emit("saved");
        this.ngOnInit();
      } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == "TERMINATE_DATE_MUST_BE_GREATER_THAN_BANK_ACCOUNT_CREATED_DATE") {
        this.toastrService.error("Terminate Date Must Be Greater Than Bank Account Created Date!")
      }
      else if (data.code == 400 && data.status == "BAD_REQUEST") {
        this.toastrService.error("Associated With Claim")
      }
      error => {}
    });
  }

  getCardStatus() {
    if (+this.chCardKey > 0) {
      var submitData = {
        'cardKey': this.chCardKey
      }
      this.hmsDataService.postApi(CardApi.getCardStatus, submitData).subscribe((data) => {
        if (data.code == 200 && data.status == "OK") {
          this.cardActiveStatus = data.result.status;
          this.cardService.cardStatus.emit(this.cardActiveStatus)
        }
      })
    }
  }

  chdetails() {
    var submitData = {
      "cardholders": [
        {
          'cardholderKey': this.selectedCardholderData[this.arrayCounter].undoCardHolderKey,
          'undoDate': this.selectedCardholderData[this.arrayCounter].cardHolderExpiryDate,
        }
      ]
    }
    this.hmsDataService.postApi(CardApi.undoCardholdersUrl, submitData).subscribe((data) => {
      if (data.code == 200 && data.status == "OK") {
        this.toastrService.success("CardHolders Reactivated Successfully")
        if (this.selectedCardholderData.length != this.arrayCounter + 1) {
          if (this.arrayCounter <= this.selectedCardholderData.length) {
            this.arrayCounter = this.arrayCounter + 1
            this.chdetails()
          }
        }
        this.getCardHolderList();
        this.activeCardHolder = [];
        this.inActiveCardHolder = [];
      }
      else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "PLEASE_ADD_CARD_EFFECTIVE_ON") {
        this.toastrService.error("Enter Card Effective Date Before Undo CardHolder")
      }
      else if (data.code == 400 && data.hmsMessage && data.hmsMessage.messageShort == "TERMINATE_DATE_MUST_BE_GREATER_THAN_BANK_ACCOUNT_CREATED_DATE") {
        this.toastrService.error("Cannot Re-active On Same Day When Bank Account Is Created")
      }
      else if (data.code == 400 && data.hmsMessage && data.hmsMessage.messageShort == "TERMINATE_DATE_MUST_BE_GREATER_THAT_CARD_EFFECTIVE_DATE") {
        this.toastrService.error("Undo Cardholder Date Should be Greater Than Card Effective Date")
      }
      else {
        this.toastrService.error("Cannot Re-active" + ' ' + this.selectedCardholderData[this.arrayCounter].cardHolderFullName)
      }
    });
  }

  activateCardHolder() {
    let submitData;
    let ApiUrl;
    if (this.cardHolderActivate.valid) {
      submitData = {
        'date': this.changeDateFormatService.formatDate($("#activateDate").find('input').val()),
        'cardHolderKey': this.selectedCardHolderKey
      }
      ApiUrl = CardApi.activateCardHolderUrl;
      var actionType = this.translate.instant('card.cardholders');
      if (this.alberta) {
        actionType = this.translate.instant('card.clients');
      }
      this.exDialog.openConfirm(this.translate.instant('card.exDialog.activate') + actionType + this.translate.instant('card.exDialog.ques')).subscribe((value) => {
        if (value) {
          this.hmsDataService.postApi(ApiUrl, submitData).subscribe((data) => {

            if (data.code == 200 && data.status == "OK") {
              if (data.result.activatedFailed.length) {

                var str = ""
                for (var i = 0; i < data.result.activatedFailed.length; i++) {
                  var str = str + data.result.activatedFailed[i].name + ","
                }
                var firstChar = str.slice(0, -1);
                if (firstChar == ',') {
                  str = str.slice(1);
                }
                var lastChar = str.slice(-1);
                if (lastChar == ',') {
                  str = str.slice(0, -1);
                }
                this.toastrService.warning(this.translate.instant('card.toaster.cant-activate') + str + this.translate.instant('card.toaster.activation-date'))
              }
              this.cardHolderActivate.reset();
              this.selectedCardHolderKey = []
              this.activeCardHolder = [];
              this.inActiveCardHolder = [];
              this.hmsDataService.OpenCloseModal("activateCardHolderButton");
              this.getCardHolderList();
            } else if (data.code == 400 && data.hmsMessage.messageShort == "CARD_INACTIVE") {
              this.toastrService.warning(this.translate.instant('card.toaster.warn-card-inactive'))
              this.cardHolderActivate.reset();
              this.selectedCardHolderKey = []
              this.activeCardHolder = [];
              this.inActiveCardHolder = [];
              this.hmsDataService.OpenCloseModal("activateCardHolderButton");
              this.getCardHolderList();
            }
            else if (data.code == 400 && data.hmsMessage.messageShort == "CARD_REACTIVATE_DATE_SHOULD_BE_SAME_AS_TERMINATION_DATE") {
              this.toastrService.warning("Card Reactivate Date Should Be Same As Card Terminate Date")
              this.cardHolderActivate.reset();
              this.selectedCardHolderKey = []
              this.activeCardHolder = [];
              this.inActiveCardHolder = [];
              this.hmsDataService.OpenCloseModal("activateCardHolderButton");
              this.getCardHolderList();
            }
            else if (data.code == 200 && data.hmsMessage && data.hmsMessage.messageShort == "CARD_REACTIVATED_SUCCESSFULLY") {
              this.toastrService.success("Card Activated Successfully")
              this.cardHolderActivate.reset();
              this.selectedCardHolderKey = []
              this.activeCardHolder = [];
              this.inActiveCardHolder = [];
              this.hmsDataService.OpenCloseModal("activateCardHolderButton");
              this.getCardHolderList();
            }
            else {
              this.hmsDataService.OpenCloseModal("activateCardHolderButton");
            }
            error => { }
          })
        }
      })
    }
    else {
      this.validateAllFormFields(this.cardHolderActivate);
    }
  }

  activateCard() {
    let submitData;
    let ApiUrl;
    if (!this.alberta) {
      this.cardActivate.controls['expirydate'].setErrors(null);
    }
    if (this.cardActivate.valid) {
      submitData = {
        "cardKey": +this.chCardKey,
        "activationDate": this.changeDateFormatService.convertDateObjectToString(this.cardActivate.value.cardActivateDate),
        "expirydate": this.changeDateFormatService.convertDateObjectToString(this.cardActivate.value.expirydate),
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.cardActivate.value.effectivedate),
        "cardHolderKeys": this.inActiveCardHolder,
        "unitKey": this.cardActivate.value.plan,
      }
      ApiUrl = CardApi.reActivateCardUrl;
      this.exDialog.openConfirm("Are You Sure You Want To Activate Card?").subscribe((value) => {
        if (value) {
          this.hmsDataService.postApi(ApiUrl, submitData).subscribe((data) => {
            if (data.code == 200 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "CARD_ACTIVATED_SUCCESSFULLY") {
              this.toastrService.success("Card Reactivated Successfully")
              this.hmsDataService.OpenCloseModal("btnResetActivateCard");
              this.getCardStatus();
              this.getCardHolderList();
              this.emitOnSave.emit("saved");
              this.inActiveCardHolder = [];
              this.activeCardHolder = [];
            }
            else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "REACTIVATE_DATE_MUST_BE_GREATER_THAN_EFFECTIVE_DATE") {
              this.toastrService.error("Reactivation Date Must Be Greater Than Effective Date")
            }
            else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "REACTIVATE_DATE_MUST_BE_GREATER_THAN_EXPIRE_DATE") {
              this.toastrService.error("Reactivation Date Must Be Greater Than Expiry Date")
            }
            else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == 'PLEASE_ADD_CARD_EFFECTIVE_ON') {
              this.toastrService.error("Please Add Card Effective Date")
            }
          })
        }
      });
    } else {
      this.validateAllFormFields(this.cardActivate);
    }
  }

  closeModal() {
    this.isConfirmationModalOpen = false;
  }

  resetForm(value) {
    if (value == "activateCardHolder") {
      this.cardHolderActivate.reset();
    }
    if (value == "termianteCardHolder" && !this.insideTermBtn) {
      this.cardHolderTerminate.reset();

      var el = document.getElementsByClassName('cardHolderCheck');

      for (var i = 0; i < el.length; i++) {
        let element: HTMLElement = document.getElementsByClassName('activeCardHolder')[0] as HTMLElement;
        if (element != undefined) {
          element.click();
        }
      }
      this.enableActivateBtn = false
      this.enableTerminateBtn = false
      this.selectedCardholderData = [];
      this.activeCardHolder = [];
      this.inActiveCardHolder = [];
    } else if (value == "termianteCardHolder" && this.insideTermBtn) {
      this.hasPendingValues = false
      this.insideTermBtn = false
    }
    if (value == "activateCard") {
      this.cardActivate.reset();
    }
    if (value == "termianteCard") {
      this.cardTerminate.reset();
    }
    this.showConfirmationBtn = false
  }

  updateComment(commentForm, type) {
    if (this.cardHodercommentForm.valid) {
      var updateCommentUrl = CardApi.addUpdateCardHolderSingleComments;
      var commentImportance
      if (this.cardHodercommentForm.value.isImportant) {
        this.cardCommentImportance = true;
        commentImportance = 'Y'
      } else {
        commentImportance = 'N'
      }
      let userGroup = ""
      if (this.showCommentBussnsType) {
        userGroup = this.selcetdGroupkey
      } else {
        userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
      }
      var userId = this.currentUserService.currentUser.userId
      let commentData = {}
      let expdate = this.changeDateFormatService.convertDateObjectToString(this.cardHodercommentForm.value.expiry_date)

      if (this.editCommentMode) {
        this.editCommentMode = false;
        commentData = {
          userId: +userId,
          "cardHolderKey": this.cardHolderKey,
          "chComTxt": this.cardHodercommentForm.value.commentTxt,
          "chComImportance": commentImportance,
          "userGroupKey": userGroup,
          "chComKey": this.coKey,
          'expiredOn': expdate
        }
      } else {
        commentData = {
          userId: +userId,
          "cardHolderKey": this.cardHolderKey,
          "chComTxt": this.cardHodercommentForm.value.commentTxt,
          "chComImportance": commentImportance,
          "userGroupKey": userGroup,
          'expiredOn': expdate

        }
      }
      this.hmsDataService.postApi(updateCommentUrl, commentData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.cardHodercommentForm.value.isImportant) {
            this.commentText = this.cardHodercommentForm.value.commentTxt;
          }
          var userId = this.currentUserService.currentUser.userId
          var reqParam = [{ 'key': 'cardHolderKey', 'value': this.cardHolderKey }, { 'key': 'userId', 'value': +userId }]
          this.dataTableService.jqueryDataTableReload("CardholderComment", CardApi.getCardHolderComments, reqParam)
          if (type == 'update') {
            this.toastrService.success(this.translate.instant('card.toaster.comment-Updated'));
          } else {
            this.toastrService.success(this.translate.instant('card.toaster.comment-add'));
          }

          this.cardHodercommentForm.reset();
          this.cardHolderFlag(this.cardHolderKey)
        }
      });
    } else {
      this.validateAllFormFields(this.cardHodercommentForm);
    }
  }

  cancelComment(data) {
    this.exDialog.openConfirm('Are You Sure To Cancel Edit Comment?').subscribe((value) => {
      if (value) {
        this.editCommentMode = false;
        this.cardHodercommentForm.reset();
      }
    })
  }

  onSelect(selected: CompleterItem, type) {
    if (selected) {
      this.selcetdGroupkey = selected.originalObject.userGroupKey
    }
  }

  addFieldValue() {
    var hasError = false
    this.disableSave = true
    $('#student-table .save_row').each(function () {
      if ($(this).is(':visible')) {
        hasError = true
      }
    })

    if (!hasError) {
      var tableid = 'student-table';
      var previousActions = $("#" + tableid).find('tr.tableRow:first-child').find('td:last-child');
      var newRow = {}
      newRow['schoolName'] = ""
      newRow['startDate'] = ""
      newRow['endDate'] = ""
      newRow['action'] = ""

      var tableLength = $("#" + tableid).find('tr.tableRow').length

      this.tableData.unshift(
        newRow
      )
      this.tableData[0]['startDate'] = ''
      this.tableData[0]['endDate'] = ''
      var dateCols = ['startDate', 'endDate'];
      this.changeDateFormatService.dateFormatListShow(dateCols, this.tableData);
      for (var j = 0; j < this.tableData.length; j++) {
        this.studentDateNameArray[tableid + j + 'startDate'] = this.tableData[j]['startDate']
        this.studentDateNameArray[tableid + j + 'endDate'] = this.tableData[j]['endDate']
      }
      setTimeout(function () {
        var tableActions = $("#student-table tr.tableRow:first-child td:last-child");
        var str = "<div class='tb-actions tb-actions-right'>"
        str = str + "<a href='javascript:void(0)' class='delete_row table-action-btn del-ico'>"
        str = str + "<i class='fa fa-trash'></i>"
        str = str + "</a>"
        str = str + "<a href='javascript:void(0)' class='edit_row table-action-btn edit-ico' >"
        str = str + "<i class='fa fa-pencil'></i>"
        str = str + "</a>"
        str = str + "<a href='javascript:void(0)' class='save_row table-action-btn save-ico' ><i class='fa fa-save'></i></a>"
        str = str + "</div>"

        tableActions.html(str)
        tableActions.find(".edit_row").trigger('click')
        tableActions.find(".save_row").show()
      }, 100);
    }
  }

  changeDateFormat1(event, frmControlName, actionType) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);

      if (actionType == 'student') {
        this.studentDateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
      else {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  studentDateFormat(event, frmControlName, dependId, greaterThan) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (greaterThan) {
      }
      this.studentDateNameArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
      var dateObj = this.studentDateNameArray[frmControlName]
      if (this.studentDateNameArray[frmControlName].day > 10) {
        var dte = dateObj.day + '/' + dateObj.month + '/' + dateObj.year;
      } else {
        var dte = '0' + dateObj.day + '/' + dateObj.month + '/' + dateObj.year;
      }
      dte = dte.toString()
      dte = dte.replace('/', '-')
      dte = dte.replace('/', '-')
      var dependValue = $("#" + dependId).find('input').val().toString()

      dependValue = dependValue.replace('/', '-')
      dependValue = dependValue.replace('/', '-')


      if (dependValue > dte) {
        $("#" + frmControlName).addClass('error_field')
        this.studentDateError = true
      } else {
        this.studentDateError = false
      }

    }
  }

  changeDateFormatWithoutCompare(event, frmControlName, actionType) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);

      if (actionType == 'student') {
        this.studentDateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
      else {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  changeDateMethod($event) {
    let cardHoldersKeys = this.selectedCardHolderKey;
  }

  getterminateCardHolderKey(type, check) {
    this.showLoader = true
    this.claimData = []
    let cardHoldersKeys = this.selectedCardHolderKey;
    let noClaimsKey = [];
    this.pendingClaimsData = [];
    this.noPendingClaimsData = [];
    let requestedData = {
      "cardKey": +this.chCardKey,
      "serviceDate": this.changeDateFormatService.convertDateObjectToString(this.cardHolderTerminate.value.terminateDate),
    }
    this.hmsDataService.postApi(CardApi.getClaimsByCardholderKey, requestedData).subscribe(data => {
      let cardholderKey = this.selectedCardHolderKey;
      if (data.code == 200 && data.status == "OK") {

        if (type == "card") {
          this.hmsDataService.OpenCloseModal('checkCrdClaim');
        } else {
          this.disableReActDate = false;
          this.termActTitle = 'Termination Date';
          this.hmsDataService.OpenCloseModal('terminateCardBtn');
        }

        this.showLoader = false
        let Cl_data = this.pendingClaimsData = data.result
        $(Cl_data).each(function (key, dat) {
          noClaimsKey.push(Cl_data[key].cardholderKey);
        });
        this.pendingClaimDatakeys = noClaimsKey;

        var str = ""
        let chKey = [];
        for (var i = 0; i < Cl_data.length; i++) {
          if ($.inArray(Cl_data[i].cardholderKey, chKey) === -1) {
            var str = str + Cl_data[i].personFirstName + ' ' + Cl_data[i].personLastName + ","
            chKey.push(Cl_data[i].cardholderKey)
          }
        }
        var firstChar = str.slice(0, -1);
        if (firstChar == ',') {
          str = str.slice(1);
        }
        var lastChar = str.slice(-1);
        if (lastChar == ',') {
          str = str.slice(0, -1);
        }
        this.pendingClaimsName = str;
        if (!this.alberta) {
          if (check != 'mainCard') {
            this.claimData = data.result;
            this.hasPendingValues = true
            this.hmsDataService.OpenCloseModal('PendingClaimsBtn');
            this.toastrService.warning("Cannot Terminate As Card Has Some Pending Claims!!")
          }
        }
      }
      else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.showLoader = false
        if (type == "card") {
          this.hmsDataService.OpenCloseModal('checkCrdClaim');
        } else {
          this.disableReActDate = false;
          this.termActTitle = 'Termination Date';
          this.hmsDataService.OpenCloseModal('terminateCardBtn');
        }

        let noClaimsdata = this.matchClaimArray(cardHoldersKeys, this.pendingClaimDatakeys)
        let claimsData = this.pendingClaimDatakeys;
        this.noPendingClaimsData = noClaimsdata;
        this.hasPendingValues = false;
        this.hideClaims = (this.pendingClaimsData && this.pendingClaimsData.length > 0) ? true : false;
        this.termianteCardHolder()
      } else {
        this.showLoader = false
      }
    });
  }
  // log 1048
  openTerminationModel(type, param) {
    if (type == "card") {
      this.hmsDataService.OpenCloseModal('checkCrdClaim');
    } else {
      this.disableReActDate = false;
      this.termActTitle = 'Termination Date';
      this.hmsDataService.OpenCloseModal('terminateCardBtn');
      // Log #1083
      if (param == 'insideBtn') {
        this.insideTermBtn = true
        $('#closePendingClaimsForm').trigger('click')
      }
    }
  }

  matchClaimArray(cardHoldersKeys, pendingData) {
    let pendingCarhHoldersKeys = pendingData;
    let noClaimsdata = [];
    $(cardHoldersKeys).each(function (key, value) {
      var index = $.inArray(value, pendingCarhHoldersKeys);
      if (index == -1) {
        noClaimsdata.push(value);
      }
    })
    return noClaimsdata;
  }

  noMatchClaimArray(cardHoldersKeys, pendingData) {
    let pendingCarhHoldersKeys = pendingData;
    let noClaimsdata = [];
    $(cardHoldersKeys).each(function (key, value) {
      var index = $.inArray(value, pendingCarhHoldersKeys);
      if (index == -1) { }
      else {
        noClaimsdata.push(value);
      }
    })
    return noClaimsdata;
  }

  removeDuplicateUsingFilter(arr) {
    let unique_array = arr.filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    });
    return unique_array
  }

  EditCardHolder() {
    this.cardholderMainForm.enable();
    this.viewMode = false;
    this.editMode = true;
    this.addMode = false;

  }

  editStudentHistory(idx: string, id: string) { }

  openActivatedCardHolderPopup() {    //AS PER ARUN SIR CARD ACTIVATION WILL AUTOMATICALLY ACTIVATE CARDHOLDERS ALSO/
    this.isActivateModalOpen = true;
  }

  openActivatedCardPopup() {
    let effectiveDate = this.eligibility.CardHolderEligibilityFormGroup.value.effective_date;
    if (effectiveDate) {
      this.cardActivate.patchValue({ "effectivedate": effectiveDate })
    }
    this.activateCardModal = true;
  }

  openUndoCardTerminate() {
    this.termActTitle = 'Reactivation Date';
    this.cardHolderTerminate.patchValue({ terminateDate: this.changeDateFormatService.convertStringDateToObject(this.cardExpiryDate) })
    this.disableReActDate = true;
    this.hmsDataService.OpenCloseModal('terminateCardBtn');
  }

  fillCardDetails() {
    var cardKEY
    this.route.params.subscribe(params => {
      cardKEY = +params['id']; // (+) converts string 'id' to a number
    });

    var cardHolderKey;  /* #547 */
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
    this.hmsDataService.postApi(CardApi.getCardDetails, submitData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        this.cardExpiryDate = data.result.cardEligibility.expireOn;
        this.cardEffectiveOnDate = data.result.cardEligibility.effectiveOn;
      }
    });
    this.FormGroup.patchValue(
      {
        CardEligibilityFormGroup: {
          'expiry_date': this.cardExpiryDate
        }
      }
    )
  }

  onCardHolderSelect(cardHolderInfo, evt) {
    this.selectedCardholderData = [];
    this.selectedCHDateKeyList = []
    this.getCardDetails();

    if (evt.target.checked) {
      document.getElementById(evt.target.id).classList.add("activeCardHolder");
      if (cardHolderInfo.status == 'ACTIVE' || cardHolderInfo.status == 'Active') {
        if (this.activeCardHolder.indexOf(cardHolderInfo.cardHolderKey) == -1) {
          this.activeCardHolder.push(cardHolderInfo.cardHolderKey)
        }
      }
      else if (cardHolderInfo.status == 'INACTIVE' || cardHolderInfo.status == 'Inactive' || cardHolderInfo.status == 'InActive') {
        if (this.inActiveCardHolder.indexOf(cardHolderInfo.cardHolderKey) == -1) {
          this.inActiveCardHolder.push(cardHolderInfo.cardHolderKey)

        }
      }
    }
    else {
      document.getElementById(evt.target.id).classList.remove("activeCardHolder");
      if (this.activeCardHolder.indexOf(cardHolderInfo.cardHolderKey) > -1) {
        var idx = this.activeCardHolder.indexOf(cardHolderInfo.cardHolderKey);
        this.activeCardHolder.splice(idx, 1)
      }
      else {
        if (this.inActiveCardHolder.indexOf(cardHolderInfo.cardHolderKey) > -1) {
          var idx = this.inActiveCardHolder.indexOf(cardHolderInfo.cardHolderKey);
          this.inActiveCardHolder.splice(idx, 1)
        }
      }
    }
    if (this.activeCardHolder.length > 0 && this.inActiveCardHolder.length == 0 && this.cardStatus) {
      this.enableTerminateBtn = true
    }
    else if (this.activeCardHolder.length == 0 && this.inActiveCardHolder.length > 0 && this.cardStatus) {
      this.enableActivateBtn = true
    }
    else if (this.activeCardHolder.length > 0 && this.inActiveCardHolder.length > 0 && this.cardStatus) {
      this.enableActivateBtn = false
      this.enableTerminateBtn = false
    } else {
      this.enableActivateBtn = false
      this.enableTerminateBtn = false
    }
    this.selectedCardHolderKey = this.activeCardHolder.concat(this.inActiveCardHolder)
    this.selectedCardHolderKey.forEach(element => {
      let filteredData = this.searchedCards.filter(val => val.cardHolderKey === element).map(data => data)
      if (filteredData) {
        var obj = {};
        var selectedCHDateKey = {}
        obj["undoCardHolderKey"] = filteredData[0].cardHolderKey

        obj["cardHolderExpiryDate"] = filteredData[0].eligibilityExpiryOn
        obj["cardHolderEligibilityKey"] = filteredData[0].chEligibilityKey;
        obj["cardHolderFullName"] = filteredData[0].personFirstName + ' ' + filteredData[0].personLastName

        selectedCHDateKey["cardholderKey"] = filteredData[0].cardHolderKey;
        selectedCHDateKey["undoDate"] = filteredData[0].eligibilityExpiryOn;
        this.selectedCardholderData.push(obj)
        this.arrayCounter = 0;
      }
    });
  }

  updateDateObj() {
    var self = this
    $("#student-table tr.tableRow").each(function () {
      $(this).find(".editableInput").each(function () {
        var key = $(this).data('updateid');
        var val = '';
        if ($(this).data('type') == "date") {
          var id = $(this).data('updateid')
          val = $(this).find("input").val().toString()
          self.studentDateNameArray[$(this).attr("id")] = $(this).prev('label').text()
        }
      })
    })
  }

  getCardDetails() {
    this.route.queryParams.subscribe(queryParam => {
      this.cardHolderKeyParam = queryParam['cardHolderKey']
      this.unitKey = queryParam['unitKey']
    })
    let submitData = {
      "cardKey": this.chCardKey,
      "cardHolderKey": this.cardHolderKeyParam,
      "unitKey": this.unitKey
    }
    this.hmsDataService.postApi(CardApi.getCardDetails, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.planKey = data.result.planKey
        this.alberta = data.result.businessTypeCd == Constants.albertaBusinessTypeCd ? true : false
        this.cardStatus = data.result.status == 'INACTIVE' ? false : true
        this.cardEffectiveOnDate = this.changeDateFormatService.convertStringDateToObject(data.result.cardEligibility.effectiveOn);
        if (data.result.commentFlag == 'Y') {
          this.cardCommentImportance = true; //For 603 Issue Flag Icon
        }
        else {
          this.cardCommentImportance = false
        }
      }
    })
  }

  emitOnSaveRole(data) {
    this.cardholderMainForm.patchValue(
      {
        CardHolderRoleAssignedFormGroup: {
          'description': data.description,
          'effective_date': data.effective_date,
          'expiry_date': data.expiry_date,
        }
      })
  }

  emitOnSaveEligibilityHistory(data) {
    var chIgnorePlanAge = false; //HMS Issue no.608
    if (data.chIgnorePlanAge == 'T') {
      chIgnorePlanAge = true
    }
    else {
      chIgnorePlanAge = false
    }
    var effective_date = this.changeDateFormatService.convertStringDateToObject(data.eligibilityEffectiveOn);
    var expiry_date = this.changeDateFormatService.convertStringDateToObject(data.eligibilityExpiryOn);
    this.cardholderMainForm.patchValue(
      {
        CardHolderEligibilityFormGroup: {
          'chEligibilityKey': data.chEligibilityKey,
          'chIgnorePlanAge': chIgnorePlanAge,
          'plan': data.chEligibilityKey,
          'effective_date': effective_date,
          'expiry_date': expiry_date
        },
      })
  }

  emitOnSaveCOBHistory(data) {
    if (data.carrier != undefined || data.effective_date != undefined) {
      this.cardholderMainForm.patchValue(
        {
          CardHolderCobFormGroup: {
            'policy': data.policy,
            'effective_date': data.effective_date,
            'expiry_date': data.expiry_date,
            'carrier': data.carrier,
            'benefits': true,
            'validated': true,
            'cobDental': data.cobDental,
            'cobHealth': data.cobHealth,
            'cobVision': data.cobVision,
            'cobDrug': data.cobDrug,
            'cobHSA': data.cobHSA
          }
        })
    }
  }
  getCadHolderAge($event) {
    this.cardHolderAge = $event
  }

  GetClaimItemsByIdCardHolderKey(cardHolderKey) {
    this.cardService.emitBusinessKey.emit(this.bussinessCd)
    window.open('/card/claim/' + cardHolderKey + '/' + this.bussinessCd);
  }

  getClaimCommentListReload() {
    var URL = CardApi.getCardHolderImportantCommentsUrl;
    var userId = this.currentUserService.currentUser.userId
    var reqParam = [{ 'key': 'cardHolderKey', 'value': this.cardHolderKey }, { 'key': 'userId', 'value': +userId }]
    var tableActions = []
    var tbl_ImportantComment = "CH-Important-Comment"
    if (!$.fn.dataTable.isDataTable('#CH-Important-Comment')) {
      var dateCols = ['createdOn']
      this.dataTableService.jqueryDataTableComment(tbl_ImportantComment, URL, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
    } else {

      this.dataTableService.jqueryDataTableReload(tbl_ImportantComment, URL, reqParam)
    }
  }

  cardContactHistoryDetails() {
    this.contactHistorytableData = [{
      "max_type": 1,
      "period_type": 2002,
      "afwd_amt": 1500,
      "prorated_max": 1800,
      "cfed_expense": 5000,
      "preauth_amt": "Preauth Amt.",
      "expense_adj": "Expense Adj.",
      "paid_to_date": "Paid To Date",
      "amt_avail": "Amount Avail",
      "year_type": "Year Type",
      "period_start": "Period Start",
      "period_end": "Period End",
      "dental": "F",
      "vision": "T",
      "health": "T",
      "drug": "F"
    },
    {
      "max_type": 2,
      "period_type": 2002,
      "afwd_amt": 2000,
      "prorated_max": 2200,
      "cfed_expense": 6000,
      "preauth_amt": "Preauth Amt.",
      "expense_adj": "Expense Adj.",
      "paid_to_date": "Paid To Date",
      "amt_avail": "Amount Avail",
      "year_type": "Year Type",
      "period_start": "Period Start",
      "period_end": "Period End",
      "dental": "T",
      "vision": "F",
      "health": "T",
      "drug": "F"
    },
    {
      "max_type": 3,
      "period_type": 2003,
      "afwd_amt": 300,
      "prorated_max": 2300,
      "cfed_expense": 7000,
      "preauth_amt": "Preauth Amt.",
      "expense_adj": "Expense Adj.",
      "paid_to_date": "Paid To Date",
      "amt_avail": "Amount Avail",
      "year_type": "Year Type",
      "period_start": "Period Start",
      "period_end": "Period End",
      "dental": "Yes",
      "vision": "Yes",
      "health": "No",
      "drug": "No"
    }];

  }

  openClaim(claimKey, disciplineKey, dcpKey, claimItem) {
    this.route.params.subscribe((params: Params) => {
      localStorage.setItem("_cardId", params.id)
    })
    this.hmsDataService.OpenCloseModal("btnCloseShowClaimItems");

    if (dcpKey > 0) {
      this.router.navigate(["/claim/view/" + claimKey + "/type/" + disciplineKey + "/dcp/" + dcpKey], { queryParams: { 'redirect': 'cardholder' } });
    } else {
      this.router.navigate(["/claim/view/" + claimKey + "/type/" + disciplineKey], { queryParams: { 'redirect': 'cardholder' } });
    }
  }

  printCard() {
    var printCardUrl = DataManagementDashboardApi.saveCardDetailForPrintChequeUrl;
    let primaryCardHolder = this.searchedCards.filter(val => val.chRoleCd === 'P').map(data => data);
    if (primaryCardHolder.length > 0) {
      this.cardholderName = primaryCardHolder[0].personFirstName + ' ' + primaryCardHolder[0].personLastName
      let cardholderKey = primaryCardHolder[0].cardHolderKey
      let cardKey = primaryCardHolder[0].cardKey
      let coKey = primaryCardHolder[0].coKey
      let personGenderCd = primaryCardHolder[0].personGenderCD
      let printRequestData = {
        "cardholderName": this.cardholderName,
        "cardholderKey": cardholderKey,
        "cardKey": cardKey,
        "coKey": coKey,
        "plansKey": this.planKey,
        "personGenderCd": personGenderCd
      }
      this.hmsDataService.postApi(printCardUrl, printRequestData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.cardHolderName = data.result.cardholderName
          this.companyCoKey = data.result.coKey
          if (this.selectedCardHolderKey.length > 1) {
            this.toastrService.error("Please Select One CardHolder")
          }
          else {
            var delay = 1000;
            setTimeout(function () {
              let printContents, popupWin;
              printContents = document.getElementById('PrintCard').innerHTML;
              popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
              popupWin.document.open();
              popupWin.document.write(`
                    <html>
                    <head>
                    <style>
                    //........Customized style.......
                    </style>
                    </head>
                    <body onload="window.print();window.close()">${printContents}</body>
                    </html>`
              );
              document.getElementById("PrintCard").focus();
            }, delay);
          }
        } else {
          this.toastrService.error("Card Detail is Not Saved!")
        }
      });
    } else {
      this.toastrService.error("Card Detail is Not Saved!")
    }
  }

  getUserBussinesType() {
    var userId = this.currentUserService.currentUser.userId
    if (this.currentUser.businessType.bothAccess || this.currentUser.isAdmin == 'T') {
      this.showCommentBussnsType = true
      this.userGroupData = this.completerService.local(
        this.currentUser.userGroup,
        "userGroupName",
        "userGroupName"
      );
      this.cardHodercommentForm.get('cardCommentGroupKey').setValidators([Validators.required])
    }
    else {
      this.showCommentBussnsType = false
      this.cardHodercommentForm.get('cardCommentGroupKey').clearValidators()
    }
    this.cardHodercommentForm.get('cardCommentGroupKey').updateValueAndValidity()
  }
  sortClaimItemDate(type) {
    if (type == 'a') {
      this.claimItems.sort((a, b) => new Date(b.itemServiceDt).getTime() - new Date(a.itemServiceDt).getTime());
      this.isAscending = this.isAscending ? false : true
    } else {
      this.claimItems.reverse()
      this.isAscending = this.isAscending ? false : true
    }
  }
  formatDate = function (date) {
    var dateOut = new Date(date);
    dateOut.setMonth(dateOut.getMonth() - 1);
    return dateOut;
  };

  GetGenderList() {
    this.hmsDataService.getApi(CardApi.getAllGenderDetailsUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrGenderList = data.result;
      }
    })
  }

  cardholderDataForSave(ChDateOfBirth) {
    this.requestData = {
      "last_name": this.cardHolderAddModeFormGroup.value.last_name,
      "first_name": this.cardHolderAddModeFormGroup.value.first_name,
      "gender": this.cardHolderAddModeFormGroup.value.gender,
      "date_of_birth": ChDateOfBirth
    }
    this.cardService.cardholderSaveDetails.emit(this.requestData)
  }

  showMaximumOverride(cardholderObj) {
    this.cardholderDetails.next(cardholderObj);
  }

  /* Person Cardholder Comments Add/Update functionality */
  addUpdatePersonComment(commentForm, type) {
    this.cardHodercommentForm.controls['cardCommentGroupKey'].clearValidators()
    this.cardHodercommentForm.controls['cardCommentGroupKey'].updateValueAndValidity()
    if (this.cardHodercommentForm.valid) {
      let personCommentUrl = CardApi.addUpdateCHPersonCommentUrl;
      let commentImportance
      if (this.cardHodercommentForm.value.isImportant) {
        this.cardCommentImportance = true;
        commentImportance = 'T'
      } else {
        commentImportance = 'F'
      }
      let userGroup = ""
      if (this.showCommentBussnsType) {
        userGroup = this.selcetdGroupkey
      } else {
        userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
      }
      var userId = this.currentUserService.currentUser.userId
      let personCommentData = {}
      let expdate = this.changeDateFormatService.convertDateObjectToString(this.cardHodercommentForm.value.expiry_date);
      if (this.editCommentMode) {
        this.editCommentMode = false;
        personCommentData = {
          userId: +userId,
          "personComKey": this.personComKey,
          "personKey": this.personKey,
          "personComTxt": this.cardHodercommentForm.value.commentTxt,
          "dispCommentInd": commentImportance,
        }
      } else {
        personCommentData = {
          userId: +userId,
          "personKey": this.personKey, //15311
          "personComTxt": this.cardHodercommentForm.value.commentTxt,
          "dispCommentInd": commentImportance,
        }
      }
      this.hmsDataService.postApi(personCommentUrl, personCommentData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.cardHodercommentForm.value.isImportant) {
            this.commentText = this.cardHodercommentForm.value.commentTxt;
          }
          let userId = this.currentUserService.currentUser.userId
          let reqParamPerson = [{ 'key': 'personKey', 'value': this.personKey }]
          this.dataTableService.jqueryDataTableReload("cardholderPersonComment", CardApi.getCHPersonCommentUrl, reqParamPerson)
          if (type == 'update') {
            this.toastrService.success(this.translate.instant('card.toaster.comment-Updated'));
          } else {
            this.toastrService.success(this.translate.instant('card.toaster.comment-add'));
          }
          this.cardHodercommentForm.reset();
          this.cardHolderFlag(this.cardHolderKey)
        }
      });
    } else {
      this.validateAllFormFields(this.cardHodercommentForm);
    }
  }

  /* Edit Functionality of Person Comment Section*/
  editPersonComments(id, personKey, personComKey, personComTxt, impFlag) {
    this.personComKey = personComKey;
    this.personKey = personKey
    this.editCommentMode = true;
    if (impFlag != 'T') {
      this.cardHodercommentForm.patchValue({
        commentTxt: personComTxt,
        isImportant: "",
      })
    } else {
      this.cardHodercommentForm.patchValue({
        commentTxt: personComTxt,
        isImportant: impFlag,
      })
    }
  }

  deletePersonComments(personComkey) {
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.deleteConfirmation')).subscribe((value) => {
      if (value) {
        let submitData = {
          "personComKey": personComkey
        }
        this.hmsDataService.postApi(CardApi.deleteCHPersonCommentUrl, submitData).subscribe(data => {
          if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == "PERSON_COMMENT_DELETED_SUCCESSFULLY") {
            var userId = this.currentUserService.currentUser.userId
            var reqParam = [{ 'key': 'personKey', 'value': this.personKey }]
            this.dataTableService.jqueryDataTableReload("cardholderPersonComment", CardApi.getCHPersonCommentUrl, reqParam);
            this.toastrService.success(this.translate.instant('Person Comment Deleted Successfully !'));
            this.cardHodercommentForm.reset();
            this.cardHolderFlag(this.cardHolderKey)
          }
        })
      } else { }
    })
  }

  // To call Terminate card API
  getTerminateCardAPICommon(ApiUrl, submitData) {
    this.hmsDataService.postApi(ApiUrl, submitData).subscribe((data) => {
      if (data.code == 200 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "CARD_TERMINATED_SUCCESSFULLY") {
        this.hmsDataService.OpenCloseModal("btnCloseCardTerminate");
        this.toastrService.success("Card Terminated Successfully!")
        this.getCardStatus();
        this.terminateCardForOneCH = false
        this.emitOnSave.emit("saved");
        this.ngOnInit();
      }
      else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == 'TERMINATE_DATE_MUST_BE_GREATER_THAN_BANK_ACCOUNT_CREATED_DATE') {
        this.toastrService.error("Termination Date Should Be Greater Than Bank Account Created Date")
      }
      else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == 'CARDHOLDER_HAS_PAID_CLAIMS_AFTER_TERMINATION_DATE') {
        this.toastrService.error("CardHolder Has Pending Claims After Termination Date")
      }
      else if (data.code == 400 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == 'CARD_BANK_ASSIGNMENT_CANNOT_BE_DELETED') {
        this.toastrService.error("Card Bank Assigment Cannot Be Deleted")
      }
      else {
        this.toastrService.error("Card Termination Failed")
      }
      error => {
      }
    });
  }

  // To confirm Terminate Process
  terminateConfirmation() {
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.terminate') + 'Card' + this.translate.instant('card.exDialog.ques')).subscribe((value) => {
      if (value) {
        let reqData = {
          "cardKey": this.chCardKey,
          "cardTerminateDate": this.changeDateFormatService.convertDateObjectToString(this.cardTerminate.value.terminateCardDate),
          "cdEligibilityKey": this.cardEligKey,
          "chEligibilityKey": "",
          "cardHolderKey": ""
        }
        this.getTerminateCardAPICommon(CardApi.terminateCard, reqData)
      }
    })
  }

  // Task 646 method added on click of close to get a boolean for chcek so that whenever open totals again, year dropdpwn does not hold previous value. 
  totalsPopupClose() {
    this.totalsPopupClosed = true
  }

  ngOnDestroy() {
    if (this.prefLangSubs) {
      this.prefLangSubs.unsubscribe()
    }
    else if (this.cardStatusSubs) {
      this.cardStatusSubs.unsubscribe()
    }
    else if (this.expirySubs) {
      this.expirySubs.unsubscribe()
    }
    else if (this.effDateSubs) {
      this.effDateSubs.unsubscribe()
    }
    else if (this.expSubs) {
      this.expSubs.unsubscribe()
    }
    else if (this.eligKeySubs) {
      this.eligKeySubs.unsubscribe()
    }
    else if (this.cardEffDateSubs) {
      this.cardEffDateSubs.unsubscribe()
    }
    else if (this.preffLang) {
      this.preffLang.unsubscribe()
    }
  }
}