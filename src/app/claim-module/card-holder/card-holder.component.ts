import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChange, QueryList } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CommonDatePickerOptions } from '../../common-module/Constants'; // import common date format
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ClaimApi } from './../claim-api';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { Constants } from '../../common-module/Constants';
import { ClaimService } from '../claim.service';
import { CardApi } from '../../card-module/card-api';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { MyDatePicker } from 'mydatepicker';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { CardServiceService } from '../../card-module/card-service.service';
import { timingSafeEqual } from 'crypto';
import { Subject, Subscription } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ViewChildren } from '@angular/core';
@Component({
  selector: 'app-card-holder',
  templateUrl: './card-holder.component.html',
  styleUrls: ['./card-holder.component.css'],
  providers: [ChangeDateFormatService, TranslateService]
})
export class CardHolderComponent implements OnInit, OnChanges {
  commentTextClient: any;
  cardHolderCommentFlag: any;
  commentFlag: any;
  commentText: any;
  cardHolderValue: any;
  isLowIncome: any;
  patientPert: any;
  @Input() cardHolderInputKey;
  @Input() ClaimCardHolderFormGroup: FormGroup;
  @Input() reviewer: boolean;
  @Input() viewMode;
  @Input() addMode
  @Input() editModeClaim
  @Input() recieveDateTitle
  @Output() cardHolderdBusinessType = new EventEmitter<any>();
  @Input() resetForm: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;//datepicker Options

  error: any;//error for datepicker 
  cardHolder = [];//array for cardHolder List
  cardHolderKey;// getting cardholder key from cardholder List
  personTwins;// for changing color of cardholder dropdown
  greyColor: boolean = true;
  check = true;
  pinkColor: boolean = false;
  companyName;
  savedCardkey: number;
  getSavedCardValue: any;
  bussinessType: string = ''; // set bussiness type to alberta or quick card 
  bussinessTypeCd: string = ''; // set bussiness type cd to alberta or quick card 
  alberta = Constants.albertaGov
  quikCard = Constants.quikcard
  cardId;
  disciplineType;
  observableObj;
  dobValid: boolean = false;
  dobNotValid: boolean = false;
  card_address
  companyCoKey;
  PlanKey;
  divisonKey;
  commentColumns = [];
  cardHoldercommentColumns = [];
  hasPlan: boolean = false
  disableCardHolderForm: boolean = false
  disableCardHolderAddressSch: boolean = false
  refDate: boolean = false
  disable;
  cardHolderClass
  cobValid: boolean = false
  cobNotValid: boolean = false
  cardTypeFamily: boolean = false
  IsReviewer: boolean = false
  cobIndicator
  dateObj
  personDOB
  commentList = [];
  claimItems = [] // declare array for #1283 
  editMode: boolean = false
  currentUser: any;
  observObj;
  checkCardholder = true;
  ConstantAlbertaCd = Constants.albertaBusinessTypeCd
  ConstantQuikcardCd = Constants.quikcardBusinessTypeCd
  @ViewChild('mydp') mydp: MyDatePicker;
  @ViewChild('recievedp') recievedp: MyDatePicker;
  isIntaiteClaim: boolean = false
  hasSchedule: boolean = false;
  cardCommentImportance: boolean = false;
  isDasp = 'F'
  provSpecAssgnKey: any
  cardholderMessage: string;
  cardCommentImportance_Grid: boolean;
  cardCommentImportant: any;
  cardKey: any;
  multipleCob: any;
  showLoader: boolean;
  addClaimMobileMode: boolean = false;
  mobileCardHolderKey: any;
  mobileCardHolderId: any;
  mobiledataCard: any;
  showFlag: boolean = false;
  cardCommentText
  isShowRedFlag: boolean = false
  isCommentTypeExistRed: boolean = false
  @ViewChild(DataTableDirective)
    // start code for #1283 
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {} 
  dtTrigger: Subject<any>[] = [];
  // end code for #1283 
   datatableElements: DataTableDirective;
  dtElement: DataTableDirective;
  dtOptionsFlagComment: DataTables.Settings = {};
  dtTriggerFlagComment: Subject<any> = new Subject();
  cardCommentList = []
  chPersonKey
  unitKey: any;
  claimDataSub: Subscription
  expired: boolean = false;
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private router: Router,
    private route: ActivatedRoute,
    private hmsDataServiceService: HmsDataServiceService,
    private toastrService: ToastrService,
    private claimService: ClaimService,
    private translate: TranslateService,
    private currentUserService: CurrentUserService,
    private cardService: CardServiceService,
    private dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,  //#1283 
  ) {
    this.error = { isError: false, errorMessage: '' };
    claimService.getDisciplineType.subscribe(value => {
      //To Update the Add NEw Button of Claim Item on Discipline Change
      this.disciplineType = value.toString()
    })
    currentUserService.loggedInUserVal.subscribe(res => {
      this.currentUser = res
    })
    claimService.setValforUnitDesc.subscribe(data => {
      if (data && this.addMode && this.ClaimCardHolderFormGroup.valid) {
        this.provSpecAssgnKey = data
        this.getDesignType(this.ClaimCardHolderFormGroup.value.cardHolder,
          this.changeDateFormatService.convertDateObjectToString(this.ClaimCardHolderFormGroup.value.receive_date)
          , 0, data)
      } else {
      }
    })
    claimService.getLoggedInBussinesType.subscribe(res => {
    })

    cardService.getPrefferedLanguage.subscribe((value) => {
      this.getSavedCardValue = value.cardKery
    })

    claimService.cardCommentsData.subscribe((value) => {
      if (value) {
        this.commentText = value.commentText
        this.commentFlag = value.commentFlag
        if (this.commentFlag == 'Y') {
          this.commentFlag = true
        }
        else {
          this.commentFlag = false
        }
      }
    })

    claimService.cardHolderCommentsData.subscribe((value) => {
      this.commentTextClient = value.commentText
      this.cardHolderCommentFlag = value.commentFlag
      if (this.cardHolderCommentFlag == 'Y') {
        this.cardHolderCommentFlag = true
      }
      else {
        this.cardHolderCommentFlag = false
      }
    })

    this.currentUser = this.currentUserService.currentUser;
    this.claimDataSub = this.claimService.mobilClaimData.subscribe(data => {
      this.addClaimMobileMode = true;
      this.mobileCardHolderKey = data.cardholderKey;
      this.mobileCardHolderId = data.cardNum;
      this.getCardHolderListByCardIdOrDOB();
      this.mobiledataCard = data

    })
  }
  // log 885
  date() {
    let date = this.ClaimCardHolderFormGroup.value.receive_date
    if (date == null) {
      // Localization issue is appearing on Claim Page in Card ID field (point no-185)
      this.toastrService.warning(this.translate.instant('card.toaster.add-receive-date-first'), '', {
        timeOut: 8000,
      })
      $('#receive_date .selection').focus()
      var elem = $('#receive_date .selection');
      setTimeout(function () {
        elem.toggleClass("focused", elem.is(":focus"));
      }, 0);
      this.ClaimCardHolderFormGroup.controls.cardId.setErrors(null)
      return false;
    } else {
      if (this.ClaimCardHolderFormGroup.value.cardId == '' || this.ClaimCardHolderFormGroup.value.cardId == null) {
        this.ClaimCardHolderFormGroup.controls.cardId.setErrors({ required: true })
      }
    }
  }
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "resetForm" && !changedProp.firstChange) {
        this.ClaimCardHolderFormGroup.patchValue({ 'cardHolder': '' })
        this.cardHolder = [];
        this.bussinessType = "";
        this.cobValid = false;
        this.cobNotValid = false;
        this.hasPlan = false;
        this.bussinessTypeCd = "";
        this.changeTheme("")
      }
    }
  }

  ClaimCardHolderVal = {
    receive_date: ['', [Validators.required]],
    cardId: ['', [Validators.required, Validators.maxLength(15), Validators.minLength(1)]],
    cardHolder: ['', [Validators.required]],
    address: ['', [Validators.required]],
    dob: ['', [Validators.required]],
    bussinesType: [''],
    scheduleType: ['']
  };
  commentsParams: any
  ngOnInit() {
    this.commentsParams = {
      getCommentsListUrl: "card-service/getCardCommentsByCardId",
      addCommentUrl: "card-service/saveCardComments",
      requestMode: 'post',
      coKey: this.getSavedCardValue,
    }
    this.route.queryParams.subscribe((params: Params) => {
      if (params['cardHolderKey'] && params['cardHolderKey'] != "") {
        this.cardHolderKey = params['cardHolderKey'];
        this.getCardHolderDetails(this.cardHolderKey);
        this.isIntaiteClaim = true
      } else {
        this.ClaimCardHolderFormGroup.reset()
        this.disableCardHolderForm = false
        this.hasPlan = false
        this.bussinessType = ""
        this.bussinessTypeCd = ""
        this.ClaimCardHolderFormGroup.patchValue({ 'cardHolder': '' })
        this.cardHolder = []
        this.cobValid = false
        this.cobNotValid = false
        this.isIntaiteClaim = false
        this.provSpecAssgnKey = ''
        this.hasSchedule = false
        this.patientPert = ''
        //add check to resolve cardholder and service provider data remove Issue in claim section
        if (this.claimService.isViewEnable ) {
          if(params['redirect'] == "cardholder"){
              this.claimService.cardHolderValueEmitter.emit(true);
          }
        }
      }
      if (params['cardId'] && params['cardId'] != "") {
        this.cardId = params['cardId']
      }
    });
    this.refDate = true
    var todaydate = this.changeDateFormatService.getToday();
    this.ClaimCardHolderFormGroup.patchValue({ 'status': 1 });

    var self = this
    var tableId = "cardComments"
    if (this.commentsParams.requestMode == 'post') {
      var url = CardApi.getCardCommentsByCardIdUrl;
    } else {
      var url = CardApi.getCardCommentsByCardIdUrl;
    }
    var userId = this.currentUserService.userType
    var reqParam = [{ 'key': 'cardKey', 'value': this.savedCardkey }, { 'key': 'userId', 'value': +userId }]

    var tableActions = [
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': 'T' }
    ]
    // this is used to get the translation of Comment Table  - START
    this.observableObj = Observable.interval(1000).subscribe(value => {
      if (this.check = true) {
        if ('common.date' == this.translate.instant('common.date')) {
        } else {
          this.commentColumns = [
            { title: this.translate.instant('common.date'), data: 'createdOn' },
            { title: this.translate.instant('common.username'), data: 'username' },
            { title: this.translate.instant('common.comments'), data: 'cardCoTxt' },
            { title: this.translate.instant('common.department'), data: 'department' },
            { title: this.translate.instant('common.importance'), data: 'commentImportance' },
            { title: this.translate.instant('common.action'), data: 'cdCommentKey' }
          ]
          var dateCols = ['createdOn'];
          this.dataTableService.jqueryDataTableComment(tableId, url, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 5, 4, dateCols, null, [1, 2, 3, 5])
          this.check = false;
          this.observableObj.unsubscribe();
          this.getCommentList()
        }
      }
    });

    this.observObj = Observable.interval(1000).subscribe(value => {
      if (this.checkCardholder = true) {
        if ('common.date' == this.translate.instant('common.date')) {
        } else {
          this.cardHoldercommentColumns = [
            { title: this.translate.instant('common.date'), data: 'createdOn' },
            { title: this.translate.instant('common.username'), data: 'username' },
            { title: this.translate.instant('common.department'), data: 'department' },
            { title: this.translate.instant('common.comments'), data: 'chComTxt' },
            { title: this.translate.instant('common.importance'), data: 'chComImportance' }
          ]
          this.checkCardholder = false;
          this.observObj.unsubscribe();
        }
      }
    });

    // Log #1008: Client new feedback
    // General feedback on Claimview Page popUp comments and on No data available massage issue are resolved 
    this.dtOptions['cardCommentsFlag'] = { dom: 'ltirp', pageLength: 5, "ordering": false, destroy: true, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
    this.dtTrigger['cardCommentsFlag'] = new Subject();
     //  add for claim history table (#1283)
     this.dtOptions['CardHolderClaimHistory'] = { dom: 'ltirp', pageLength: 25, "ordering": true, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],columnDefs: [{ 'type': 'date', 'targets': 3 }],order: [3, "desc"]}
     this.dtTrigger['CardHolderClaimHistory'] = new Subject();
    //  Table pagination added 
     this.dtOptions['COBHistory'] = { dom: 'ltirp', pageLength: 25, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
     this.dtTrigger['COBHistory'] = new Subject();
  }
  datatableElement(tableID) {
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
    });
  }
  // end
  getCardHolderDetails(cardHolderKey) {
    let submitData = {
      "cardHolderKey": +cardHolderKey,
    }
    this.hmsDataServiceService.post(ClaimApi.findCardHolderUrl, submitData).subscribe(data => {

      if (data.code == 200 && data.status === "OK") {
        let details = data.result;
        // Log #1008: New feedback as per client
        this.getCardComments(details.chCardKey, details.cardHolderKey)
        /** 481 */
        this.getCardCommentsImportant(details.chCardKey);
        /** 603 */
        // commented and below method is used used now for Log #1008
        this.getCardHolderPersonCommentsImportant(details.chPersonKey)
        this.claimService.claimCardholderObject.emit(details);
        this.sheduleSkipAddressPayee(details.coId, details.plnId, details.cardNum);

        if (!this.currentUser.businessType.bothAccess) {
          if (this.currentUser.businessType[0].businessTypeCd == data.result.bussinessTypeCd) {
            this.getCardHolderDetailsData(details)
          } else {
            this.toastrService.warning("You Only have permission to add " + data.result.bussinessType + " " + "Claims", '', {
              timeOut: 8000,
            })
          }
        } else {
          this.getCardHolderDetailsData(details)
        }
      }
    }, (error) => {
    })
  }
  getCardHolderDetailsData(details) {
    this.cardId = details.chCardKey
    this.ClaimCardHolderFormGroup.patchValue({
      'cardId': details.cardNum,
      'address': details.cardFullAddress,
      'dob': this.changeDateFormatService.convertStringDateToObject(details.personDtOfBirth),
    });

    let isAdsc = details.companyId == '02' ? true : false
    let isLowIncome = (details.companyId == '01' || details.companyId == '08') ? true : false
    this.isDasp = details.isDasp
    this.isLowIncome = isLowIncome
    let companyBelongTo = {
      'dasp': details.isDasp,
      'isAdsc': isAdsc,
      'isLowIncome': isLowIncome
    }
    this.claimService.isDasp.emit(companyBelongTo)
    this.claimService.hasCardHolder.emit(true)
    this.claimService.cardHolderKey.emit(details.cardHolderKey);
    if (details) {
      var businessTypeVal = details.coName;
      this.claimService.getCardHolderKey.emit(details.cardHolderKey)
      this.claimService.getBusinessTypeValue.emit(businessTypeVal)//emit business type value for service provider
      if (details.status === 'INACTIVE') {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.cardHolderNotActive'), '', {
          timeOut: 8000,
        })
      }
    }
    let submitData = {
      "cardNum": this.ClaimCardHolderFormGroup.value.cardId,
      "personDtOfBirth": details.personDtOfBirth
    }
    this.hmsDataServiceService.post(ClaimApi.getCardHolderListByCardIdForClaimUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data.result.object.length > 1) {
          this.cardTypeFamily = true
        }
        this.unitKey = data.result.unitKey
        this.cardHolder = data.result.object.filter(val => val.cardHolderKey == details.cardHolderKey)
        this.setCobIndicator(this.cardHolder, details.cardHolderKey)
        this.ClaimCardHolderFormGroup.patchValue({ 'cardHolder': details.cardHolderKey });
        this.getPlans(data.result)
        if (data.hmsMessage.messageShort == "CARD_NOT_ACTIVE") {
          this.toastrService.warning(this.translate.instant('claims.claims-toaster.card-is-not-active'), '', {
            timeOut: 8000,
          })
        }
      } else {
        this.cardHolder = []
      }
    }, (error) => {
    })
    this.bussinessType = details.bussinessType
    let val = 2
    if (this.bussinessType == 'Quikcard') {
      val = 1
    }
    this.claimService.claimBussinessKey.emit(val)

    this.bussinessTypeCd = details.bussinessTypeCd
    let crdDetails = {
      'bussinessType': details.bussinessType,
      'bussinessTypeCd': details.bussinessTypeCd,
      'cardKey': details.chCardKey,
    }
    this.claimService.getCardKey.emit(crdDetails)
    this.changeTheme(details.bussinessTypeCd)
    this.removeDOBValidation(details.bussinessTypeCd)
    this.disableCardHolderForm = true
    let span = document.getElementById('claimDOB');
    let row = span.getElementsByTagName('button')
    let arr = Array.prototype.slice.call(row)
    arr.forEach(element => {
      element.tabIndex = -1;
    });
    document.getElementById("cardId").tabIndex = -1;
    document.getElementById("claim_cardHolder").tabIndex = -1;
    document.getElementById('address').tabIndex = -1;

  }
  ngAfterViewInit() {
    this.dtTrigger['cardCommentsFlag'].next();
    setTimeout(() => {
      let icon = document.getElementById('cardId_icon');
      if (icon) {
        document.getElementById('cardId_icon').tabIndex = -1;
      } else {

      }
    }, 1000);
    this.dtTrigger['CardHolderClaimHistory'].next();  // for #1283
    this.dtTrigger['COBHistory'].next();               //   Table pagination added 
  }
  isNumberKey(event) {
    return (event.ctrlKey || event.altKey
      || (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false)
      || (95 < event.keyCode && event.keyCode < 106)
      || (event.keyCode == 8) || (event.keyCode == 9)
      || (event.keyCode > 34 && event.keyCode < 40)
      || (event.keyCode == 46))
  }

  getCardHolderListByCardIdOrDOB() {
    if(this.ClaimCardHolderFormGroup.value.cardId == ''){
      $('#cardId').removeClass('expired');
    }
    let routeParams
    this.route.queryParams.subscribe((params: Params) => {
      routeParams = params
    });

    if (this.addClaimMobileMode && routeParams) {
    }
    if (routeParams['cardHolderKey'] && routeParams['cardHolderKey'] != "" && routeParams['cardId'] && routeParams['cardId'] != "") {
      alert(routeParams['cardId'] + routeParams['cardHolderKey'])

    } else {
      if (this.ClaimCardHolderFormGroup.value.cardId) {
        if (this.ClaimCardHolderFormGroup.value.dob) {
          this.personDOB = this.changeDateFormatService.convertDateObjectToString(this.ClaimCardHolderFormGroup.value.dob)
        } else {
          this.personDOB = ''
          this.dobValid = false
        }

        let submitData = {
          "cardNum": this.ClaimCardHolderFormGroup.value.cardId,
          "personDtOfBirth": this.personDOB
        }
        this.hmsDataServiceService.post(ClaimApi.getCardHolderListByCardIdForClaimUrl, submitData).subscribe(data => {
          if (data.result) {
            /**For 481 Issue */
            this.commentFlag = true;
            this.cardHolderCommentFlag = true;
            this.getCardHolderCommentsImportant();
            /** For 481 Issue */
            let isAdsc = data.result.companyId == '02' ? true : false
            let isLowIncome = (data.result.companyId == '01' || data.result.companyId == '08') ? true : false
            this.isDasp = data.result.isDasp
            this.isLowIncome = isLowIncome
            let companyBelongTo = {
              'dasp': data.result.isDasp,
              'isAdsc': isAdsc,
              'isLowIncome': isLowIncome
            }
            this.claimService.isDasp.emit(companyBelongTo)

            // For issue 472

            if (data.result.bussinessTypeCd != undefined) {
              if (data.result.bussinessTypeCd == "Q") {
                this.cardHolderdBusinessType.emit(1);
                this.claimService.claimBussinessKey.emit(1);
              } else {
                this.cardHolderdBusinessType.emit(2);
                this.claimService.claimBussinessKey.emit(2);
                this.ClaimCardHolderFormGroup.patchValue({ 'cardId': ''})
                document.getElementById('cardId').focus();
              }
            }
            // Log #92: To fix COB message issue
            if (data.result.businessTypeCd != undefined) {
              if (data.result.businessTypeCd == "Q") {
                this.cardHolderdBusinessType.emit(1);
                this.claimService.claimBussinessKey.emit(1);
              } else {
                this.cardHolderdBusinessType.emit(2);
                this.claimService.claimBussinessKey.emit(2);
                this.ClaimCardHolderFormGroup.patchValue({ 'cardId': ''})
                document.getElementById('cardId').focus();
              }
            }

            // Log #1008: To fix Flag issue as per client new feedback
            if (data.result.object) {
              this.getCardComments(data.result.cardKey, data.result.object[0].cardHolderKey)
            }

            if (!this.currentUser.businessType.bothAccess) {
              if (data.code == 200 && data.status == "OK") {
                if (this.currentUser.businessType[0].businessTypeCd == data.result.bussinessTypeCd) {
                  this.getCardHolderListByCardIdData(data)
                } else {
                  this.toastrService.warning("You Only have permission to add " + this.currentUser.businessType[0].businessTypeDesc + " " + "Claims", '', {
                    timeOut: 8000,
                  })
                }
              } else if (data.code == 404 && data.status == "NOT_FOUND") {  // Log #1055
                if (data.result.businessTypeCd != "Q") {
                  this.getCardHolderListByCardIdData(data)
                }
              }
            } else {
              this.getCardHolderListByCardIdData(data)
            }
          } else {
            this.getCardHolderListByCardIdData(data)
            this.getCardComments(0,0)
          }
          if(data.result.companyId != undefined){
            this.sheduleSkipAddressPayee(data.result.companyId, data.result.plnId, this.ClaimCardHolderFormGroup.value.cardId);
          }
        }, (error) => {
        });
      } else {
        this.cardHolderReset()
        return false
      }
    }

  }
  sheduleSkipAddressPayee(coId, planId, cardNum) {
    let checkCardSubmitData = {
      "coId": coId,
      "planId": planId,
      "cardNum": cardNum
    }
    this.hmsDataServiceService.post(ClaimApi.checkADSCSchBDialyCard, checkCardSubmitData).subscribe(data => {
      if (data.code === 200 && data.result) {
        // log 885
        $('#payee').addClass('disableInput');
        this.disableCardHolderAddressSch = true;
        document.getElementById('address').tabIndex = -1
        document.getElementById('payee').tabIndex = -1
      } else {
        $('#payee').removeClass('disableInput');
        this.disableCardHolderAddressSch = false;
        document.getElementById('address').removeAttribute('tabindex');
        document.getElementById('payee').removeAttribute('tabindex');
      }
    }, (error) => {
    });
  }

  getCardHolderListByCardIdData(data) {
    if(data.result.personDtOfBirth != "" && this.bussinessType == 'Quikcard'){
      this.expired = false
    }
    if (data.code == 200 && data.status === "OK") {
      let details = data.result;
      if (data.result.object.length > 1) {
        this.cardTypeFamily = true
      }
      this.cardHolder = data.result.object
      this.bussinessType = details.bussinessType
      let val = 2
      if (this.bussinessType == 'Quikcard') {
        val = 1
      }
      this.claimService.claimBussinessKey.emit(val)
      this.bussinessTypeCd = details.bussinessTypeCd
      let crdDetails = {
        'bussinessType': details.bussinessType,
        'bussinessTypeCd': details.bussinessTypeCd,
        'cardKey': details.cardKey,
      }
      let isAdsc = details.companyId == '02' ? true : false
      this.isLowIncome = (details.companyId == '01' || details.companyId == '08') ? true : false
      this.isDasp = details.isDasp
      let companyBelongTo = {
        'dasp': details.isDasp,
        'isAdsc': isAdsc,
        'isLowIncome': this.isLowIncome
      }
      this.claimService.isDasp.emit(companyBelongTo)
        this.claimService.getCardKey.emit(crdDetails)
      this.getPlans(details)
      if (this.personDOB != '' && details.bussinessTypeCd == Constants.albertaBusinessTypeCd) {
        this.dobValid = true
        this.dobNotValid = false
      }
      this.removeDOBValidation(details.bussinessTypeCd)
      this.cardId = details.cardKey
      if (data.hmsMessage.messageShort == "CARD_HOLDER_NOT_ACTIVE") {
        let cardHolderStatus = this.cardHolder.filter(val => val.status === 'ACTIVE').map(data => data.status)
        if (cardHolderStatus) {

        } else {
          this.toastrService.warning(this.translate.instant('claims.claims-toaster.there-aren’t-any-cardholders'), '', {
            timeOut: 8000,
          })
        }
      }
      if (data.hmsMessage.messageShort == "CARD_NOT_ACTIVE") {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.card-is-not-active'), '', {
           timeOut: 8000
        })
      }
      if (this.cardHolder) {
        var businessTypeVal = this.cardHolder[0].coName;
        this.cardHolderKey = this.cardHolder[0].cardHolderKey
        if (this.addMode && this.provSpecAssgnKey != '') {
          this.getDesignType(this.cardHolderKey, this.changeDateFormatService.convertDateObjectToString(this.ClaimCardHolderFormGroup.value.receive_date), 0, this.provSpecAssgnKey)
        }
        this.claimService.getCardHolderKey.emit(this.cardHolder[0].cardHolderKey)
        this.claimService.getBusinessTypeValue.emit(businessTypeVal)//emit business type value for service provider
        this.card_address = this.cardHolder[0].cardFullAddress;
        this.ClaimCardHolderFormGroup.patchValue({
          'address': this.cardHolder[0].cardFullAddress,
          'bussinessType': this.cardHolder[0].bussinessType
        });

        if (this.cardHolder.length == 1) {
          this.ClaimCardHolderFormGroup.get('cardHolder').patchValue(this.cardHolder[0].cardHolderKey);
          this.claimService.hasCardHolder.emit(true)
          this.claimService.cardHolderKey.emit(this.cardHolder[0].cardHolderKey);
          this.setCobIndicator(this.cardHolder, this.cardHolder[0].cardHolderKey);

        }
        if (this.isLowIncome || this.isDasp == 'T') {
          document.getElementById('address').tabIndex = -1
        } else {
          document.getElementById('address').removeAttribute('tabindex');
        }

        this.lowIncomegetDesignType(this.cardHolder[0].cardHolderKey) // log 885
        if (this.addClaimMobileMode) {
          let self = this
          let selectedCardholder = this.cardHolder.filter(ch => ch.cardHolderKey == self.mobileCardHolderKey);
          if (selectedCardholder.length > 0) {
          self.ClaimCardHolderFormGroup.get('cardHolder').patchValue(selectedCardholder[0].cardHolderKey);
          self.ClaimCardHolderFormGroup.get('address').patchValue(selectedCardholder[0].cardFullAddress);
          self.ClaimCardHolderFormGroup.get('dob').patchValue(self.changeDateFormatService.convertStringDateToObject(selectedCardholder[0].personDtOfBirth));
          }
          this.claimService.mobilClaimItem.emit(this.mobiledataCard)
        }
      }

      //
    } else if (data.code == 404 && data.status === "NOT_FOUND" && data.hmsMessage.messageShort === "CARD_HOLDER_DOES_NOT_EXIST") {
      this.cardHolderReset()
      this.cardHolder = []
      this.bussinessType = data.result.businessType
      let val = 2
      if (this.bussinessType == 'Quikcard') {
        val = 1
      }
      this.claimService.claimBussinessKey.emit(val)
      this.bussinessTypeCd = data.result.bussinessTypeCd
      let crdDetails = {
        'bussinessType': data.result.businessType,
        'bussinessTypeCd': data.result.bussinessTypeCd,
        'cardKey': data.result.cardKey,
      }
      this.claimService.getCardKey.emit(crdDetails)
      this.changeTheme(data.result.bussinessTypeCd)
      this.removeDOBValidation(data.result.bussinessTypeCd)
      this.cardId = data.result.cardKey
      let details = data.result;
      this.getPlans(details)
      this.toastrService.error(this.translate.instant('claims.claims-toaster.card-holder'), '', {
        timeOut: 8000,
      })
    }
    else if (data.code == 400 && data.status === "BAD_REQUEST" && data.hmsMessage.messageShort === "CARD_DOES_NOT_EXIST") {
      this.cardHolderReset()
      this.cardHolder = []
      this.toastrService.error(this.translate.instant('claims.claims-toaster.card'), '', {
        timeOut: 8000,
      })

      this.ClaimCardHolderFormGroup.controls['cardId'].setErrors({
        "cardIdNotExist": true
      });
    }
    else if (data.hmsMessage.messageShort == "DOB_DOES_NOT_EXIST") {
      if (this.bussinessTypeCd == Constants.albertaBusinessTypeCd) {
        var personDtOfBirth = this.cardHolder[0]['personDtOfBirth']
        var personDOBObj = this.personDOB.split("/")

        var personDtOfBirthObj = personDtOfBirth.split("/")

        if (personDtOfBirthObj[2] != personDOBObj[2]) {
          this.toastrService.error("CardHolder DOB Year does not match with Entered DOB Year", '', {
            timeOut: 8000,
          })
          this.dobValid = false
          this.ClaimCardHolderFormGroup.get('dob').reset();

          $('#dop .selection').focus()
          var elem = $('#dop .selection');
          setTimeout(function () {
            elem.toggleClass("focused", elem.is(":focus"));
          }, 0);
        } else if (personDtOfBirthObj[0] != personDOBObj[0] && personDtOfBirthObj[1] != personDOBObj[1]) {

          this.toastrService.error("CardHolder DOB's Date or Month should match with Entered DOB", '', {
            timeOut: 8000,
          })
          this.ClaimCardHolderFormGroup.get('dob').reset();
        }
        else {
          this.dobNotValid = true
          this.dobValid = false
          this.toastrService.error(this.translate.instant('claims.claims-toaster.entered-dob'), '', {
            timeOut: 8000,
          })
        }

      }
      if (this.bussinessTypeCd == Constants.quikcardBusinessTypeCd) {
        this.cardHolder = []
        this.cobValid = false
        this.cobNotValid = false
        this.toastrService.error(this.translate.instant('claims.claims-toaster.entered-dob'), '', {
          timeOut: 8000,
        })
        this.ClaimCardHolderFormGroup.value.dob = null
        this.getCardHolderListByCardIdOrDOB()
      }
    }
  }

  lowIncomegetDesignType(cardholder) {
    let cardholderKey = cardholder || ''; let receivedOn = this.changeDateFormatService.convertDateObjectToString(this.ClaimCardHolderFormGroup.value.receive_date);
    let claimKey = 0; let provSpecAssgnKey = 0;
    let submitData = {
      "claimKey": claimKey,
      "receivedOn": receivedOn,
      "cardholderKey": cardholderKey,
      "provSpecAssgnKey": provSpecAssgnKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getDesignType, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result) {
        }
      } else {
      }
    }, (error) => {
    })
  }
  cardHolderReset() {
    this.ClaimCardHolderFormGroup.get('dob').reset();
    this.ClaimCardHolderFormGroup.get('address').patchValue('');
    this.ClaimCardHolderFormGroup.get('cardHolder').reset();
    $('#claim_cardHolder').removeClass('greyClass');
    this.dobValid = false
    this.bussinessType = "";
    this.bussinessTypeCd = ""
    this.cardHolder = [];
    this.hasPlan = false
    this.cobValid = false
    this.cobNotValid = false
    this.changeTheme(this.bussinessTypeCd)
    let crdDetails = {
      'bussinessType': "",
      'bussinessTypeCd': "",
      'cardKey': "",
    }
    this.claimService.getCardKey.emit(crdDetails)
    this.claimService.hasCardHolder.emit(false)
    this.claimService.isDasp.emit("")
    this.isDasp = 'F'
    this.isLowIncome = false
    this.provSpecAssgnKey = ''
    this.hasSchedule = false
    this.patientPert = ''
  }

  setClaimCardholderDOB(event) {
    let selectedcardHolderKey
    if (event.target) {
      this.claimService.hasCardHolder.emit(true)
      selectedcardHolderKey = event.target.value;
      this.lowIncomegetDesignType(selectedcardHolderKey) //885
      this.claimService.cardHolderKey.emit(selectedcardHolderKey);
      if (this.addMode && this.provSpecAssgnKey != '') {
        this.getDesignType(this.cardHolderKey, this.changeDateFormatService.convertDateObjectToString(this.ClaimCardHolderFormGroup.value.receive_date), 0, this.provSpecAssgnKey)
      }
    }
    this.getCardComments(this.cardHolder[0].chCardKey, selectedcardHolderKey)
    /* Get person Key for Cardholder field flag*/
    let result = this.cardHolder.filter(val => val.cardHolderKey == selectedcardHolderKey) 
    this.chPersonKey = result[0].chPersonKey
    this.getCardHolderPersonCommentsImportant(this.chPersonKey)
    this.setCobIndicator(this.cardHolder, selectedcardHolderKey)
    const selectEl = event.target;
    const val = selectEl.options[selectEl.selectedIndex].getAttribute('data-dob');
    if (this.bussinessTypeCd == Constants.quikcardBusinessTypeCd) {
      this.ClaimCardHolderFormGroup.patchValue({ 'dob': this.changeDateFormatService.convertStringDateToObject(val) })
    }
    this.getCrdHldrSelectClass(this.cardHolder, selectedcardHolderKey, this.changeDateFormatService.convertStringDateToObject(val), 'addMode')
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '') && frmControlName != "dob") {

      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.ClaimCardHolderFormGroup.patchValue(datePickerValue);
      if (this.isIntaiteClaim) {
        this.mydp.setFocusToInputBox();
        let span = document.getElementById('claimDOB');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      } else {
      }
      this.setdateVal(frmControlName, validDate)
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        $('#setFocus').attr("tabIndex", -1).focus(); // log 802 
        return;
      }

      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.ClaimCardHolderFormGroup.patchValue(datePickerValue);
      if (this.isIntaiteClaim) {
        this.mydp.setFocusToInputBox();
        let span = document.getElementById('claimDOB');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
      } else {

      }
      this.setdateVal(frmControlName, obj)
    } else {
      this.error.isError = false;
      this.error.errorMessage = "";
      if (frmControlName == 'receive_date') {
        this.claimService.getRecieveDate.emit(undefined)
        this.claimService.cardRecieveDate = undefined
      }
    }
    $(".btnpicker , .btnclear").attr("tabindex", '-1');
  }

  /**
   * This Function is used to convert entered value to date in a valid data format. and year should not greater than current month
   * @param event 
   * @param frmControlName 
   * @param formName 
   * @param currentDate 
   */
  changeDateFormatLessthanCurrentMonth(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '') && frmControlName != "dob") {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.ClaimCardHolderFormGroup.patchValue(datePickerValue);
      if (this.isIntaiteClaim || this.isLowIncome || this.isDasp == 'T') {
        let span = document.getElementById('claimDOB');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
        if ((this.isIntaiteClaim || this.isLowIncome || this.isDasp == 'T') && this.cardHolder.length == 1) {
          document.getElementById("claim_cardHolder").tabIndex = -1;
        }
        document.getElementById('address').tabIndex = -1;
        if (this.isLowIncome) {
          document.getElementById('csp_licenseNo').focus();
        } else {
          document.getElementById('payeeType').focus();
        }
      } else {
        let span = document.getElementById('claimDOB');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.removeAttribute('tabindex');
        });
        document.getElementById('claim_cardHolder').removeAttribute('tabindex');
        document.getElementById('address').removeAttribute('tabindex');
      }
      this.setdateVal(frmControlName, validDate)
    } else if (event.reason == 2 && event.value != null && event.value != '') {

      var obj = this.changeDateFormatService.changeDateFormatLessThanCurrentMonth(event);
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
      this.ClaimCardHolderFormGroup.patchValue(datePickerValue);
      if (this.isIntaiteClaim || this.isLowIncome || this.isDasp == 'T') {
        let span = document.getElementById('claimDOB');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
        if ((this.isIntaiteClaim || this.isLowIncome || this.isDasp == 'T') && this.cardHolder.length == 1) {
          document.getElementById("claim_cardHolder").tabIndex = -1;
        }
        document.getElementById('address').tabIndex = -1;
        if (this.isLowIncome) {
          // issue no 734
          document.getElementById('payee').focus();
        } else {
          document.getElementById('payeeType').focus();
        }
      } else {
        let span = document.getElementById('claimDOB');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.removeAttribute('tabindex');
        });
        document.getElementById('claim_cardHolder').removeAttribute('tabindex');
        document.getElementById('address').removeAttribute('tabindex');
      }
      this.setdateVal(frmControlName, obj)
    } else if (event.reason == 1 && event.value != null && event.value != '') {
      if (this.isIntaiteClaim || this.isLowIncome || this.isDasp == 'T') {

        let span = document.getElementById('claimDOB');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.tabIndex = -1;
        });
        if ((this.isIntaiteClaim || this.isLowIncome || this.isDasp == 'T') && this.cardHolder.length == 1) {
          document.getElementById("claim_cardHolder").tabIndex = -1;
        }
        document.getElementById('address').tabIndex = -1;
        if (this.isLowIncome) {
          // issue no 720
        } else {
          document.getElementById('payeeType').focus();
        }
      } else {
        let span = document.getElementById('claimDOB');
        let row = span.getElementsByTagName('button')
        let arr = Array.prototype.slice.call(row)
        arr.forEach(element => {
          element.removeAttribute('tabindex');
        });
        document.getElementById('claim_cardHolder').removeAttribute('tabindex');
        document.getElementById('address').removeAttribute('tabindex');
      }
    } else if (event.value == '') {
      document.getElementById('address').tabIndex = -1
      this.getCardHolderListByCardIdOrDOB()
    } else {
      this.error.isError = false;
      this.error.errorMessage = "";
    }
    $(".btnpicker , .btnclear").attr("tabindex", '-1');
  }

  /**
  * This function is used to change the Theme
  * When bussinessType is Alberta is selected then change theme
  */
  changeTheme(bussinessTypeCd) {
    if (bussinessTypeCd == Constants.albertaBusinessTypeCd) {
      let node = document.createElement('link');
      node.href = 'assets/css/common-alberta.css';
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    } else {
      $('link[href="assets/css/common-alberta.css"]').remove();
    }
  }

  /**
   * View Plan Details
   */
  viewPlanDetails() {
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view" && this.cardTypeFamily) {
        var claimId
        this.route.params.subscribe((params: Params) => {
          claimId = params['id']
        });
        window.open("/company/plan/view?companyId=" + this.companyCoKey + "&planId=" + this.PlanKey + "&divisonId=" + this.divisonKey + "&claimId=" + claimId)
      }
      else {
        window.open("/company/plan/view?companyId=" + this.companyCoKey + "&planId=" + this.PlanKey + "&divisonId=" + this.divisonKey)
      }
    } else {
      window.open("/company/plan/view?companyId=" + this.companyCoKey + "&planId=" + this.PlanKey + "&divisonId=" + this.divisonKey)
    }
  }

  /**
   * Get Cardholder list
   * @param cardId 
   * @param Dob 
   * @param cardholderKey 
   * @param cardKey 
   */
  getCardHolderList(cardId, Dob, cardholderKey, cardKey, provSpecAssgnKey, receivedOn, claimKey) {
    let submitData = {
      "cardNum": cardId,
      "personDtOfBirth": Dob
    }
    this.getDesignType(cardholderKey, receivedOn, claimKey, provSpecAssgnKey)
    this.hmsDataServiceService.post(ClaimApi.getCardHolderListByCardIdForClaimUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data.result.object.length > 1) {
          this.cardTypeFamily = true
        }
        this.unitKey = data.result.unitKey
        this.cardId = cardKey
        this.cardHolder = data.result.object
        // Log #1008: Get Flag Comment view mode
        if (data.result.object) {
          this.getCardComments(data.result.cardKey, data.result.object[0].cardHolderKey)
          this.getCardHolderPersonCommentsImportant(data.result.object[0].chPersonKey)
        }
        let isAdsc = data.result.companyId == '02' ? true : false
        let isLowIncome = (data.result.companyId == '01' || data.result.companyId == '08') ? true : false
        this.isDasp = data.result.isDasp
        this.isLowIncome = isLowIncome
        let companyBelongTo = {
          'dasp': data.result.isDasp,
          'isAdsc': isAdsc,
          'isLowIncome': isLowIncome
        }
        this.claimService.isDasp.emit(companyBelongTo)
        this.claimService.hasCardHolder.emit(true)
        this.claimService.cardHolderKey.emit(cardholderKey);
        if(Dob != ''){
          this.getCrdHldrSelectClass(this.cardHolder, cardholderKey, Dob, 'viewmode')
        }
        this.claimService.getCardHolderKey.emit(cardholderKey)
        let details = data.result;
        this.setCobIndicator(this.cardHolder, cardholderKey)
        this.getPlans(details)
        this.bussinessType = data.result.bussinessType
        let val = 2
        if (this.bussinessType == 'Quikcard') {
          val = 1
        }
        this.claimService.claimBussinessKey.emit(val)
        this.bussinessTypeCd = data.result.bussinessTypeCd
        this.changeTheme(this.bussinessTypeCd)
        this.removeDOBValidation(this.bussinessTypeCd)
        let crdDetails = {
          'bussinessType': this.bussinessType,
          'bussinessTypeCd': data.result.bussinessTypeCd,
          'cardKey': cardKey,
        }
        this.claimService.getCardKey.emit(crdDetails)
      } else if (data.code == 404 && data.status === "NOT_FOUND" && data.hmsMessage.messageShort == "DOB_DOES_NOT_EXIST") {
        if (data.result.businessType == Constants.albertaGov) {
          this.dobNotValid = true
          this.dobValid = false
          Dob = ''
          this.getCardHolderList(cardId, Dob, cardholderKey, cardKey, provSpecAssgnKey, receivedOn, claimKey)
        }
        if (this.bussinessTypeCd == Constants.quikcardBusinessTypeCd) {
          this.cardHolder = []
        }
      }
      else {
        this.cardHolder = []
      }
    }, (error) => {
    })

  }

  getCrdHldrSelectClass(cardHolder, selectedcardHolderKey, Dob, mode) {
    let cardHolderStatus
    cardHolderStatus = cardHolder.filter(val => val.cardHolderKey === parseInt(selectedcardHolderKey))
    if (cardHolderStatus[0].bussinessType == Constants.albertaGov && mode == 'viewmode') {
      if (cardHolderStatus[0].personDtOfBirth == Dob) {
        this.dobNotValid = false
        this.dobValid = true
      } else {
        this.dobNotValid = true
        this.dobValid = false
      }
      if (cardHolderStatus[0].status == 'INACTIVE'){
        $('#cardId').addClass('expired');
      }
    }
    if (cardHolderStatus[0].personNameTwinsFlag == 'T') {
      this.cardHolderClass = 'aquaClass'
    }
    if (cardHolderStatus[0].personTwinsFlag == 'TWINS') {
      this.cardHolderClass = 'pinkClass'
    }
    if (cardHolderStatus[0].status == 'INACTIVE' && cardHolderStatus[0].personTwinsFlag != 'TWINS' && cardHolderStatus[0].personNameTwinsFlag != 'T') {
      this.cardHolderClass = 'greyClass'
    }

    if (cardHolderStatus[0].personNameTwinsFlag != 'T' && cardHolderStatus[0].status != 'INACTIVE' && cardHolderStatus[0].personTwinsFlag != 'TWINS') {
      this.cardHolderClass = 'whiteClass'
    }

    if (cardHolderStatus[0].status == "INACTIVE" && mode == 'addMode') {
      this.toastrService.warning(this.translate.instant('claims.claims-toaster.selected-card'), '', {
        timeOut: 8000
      })

    }
    this.claimService.checkVisiontable.emit("check");
  }

  /**
   * Get Plans
   * @param details 
   */
  getPlans(details) {
    if (details.planKey && details.coKey && details.divisionKey) {
      this.PlanKey = details.planKey
      this.companyCoKey = details.coKey
      this.divisonKey = details.divisionKey
      this.hasPlan = true
    } else {
      this.hasPlan = false
    }
  }
  skipTab() {
    $('#payee').focus()
  }
  removeDOBValidation(bussinessTypeCd) {
    this.claimService.claimTypeBussinessType.emit(bussinessTypeCd);
    if (bussinessTypeCd == Constants.quikcardBusinessTypeCd) {
      this.ClaimCardHolderFormGroup.get('dob').clearValidators();
      this.ClaimCardHolderFormGroup.get('address').setValidators(Validators.required);
      this.ClaimCardHolderFormGroup.patchValue({ 'bussinesType': bussinessTypeCd })
    }
    if (bussinessTypeCd == Constants.albertaBusinessTypeCd) {
      this.ClaimCardHolderFormGroup.get('dob').setValidators(Validators.required);
      this.ClaimCardHolderFormGroup.get('address').clearValidators();
      this.ClaimCardHolderFormGroup.patchValue({ 'bussinesType': bussinessTypeCd })
    }
    this.ClaimCardHolderFormGroup.get('dob').updateValueAndValidity();
    this.ClaimCardHolderFormGroup.get('address').updateValueAndValidity()
  }

  setCobIndicator(cardHolder, cardHolderKey) {
    this.cardHolderKey = cardHolderKey;
    this.cobIndicator = cardHolder.filter(val => val.cardHolderKey == cardHolderKey).map(data => data.cobIndicator)
    this.multipleCob = cardHolder.filter(val => val.cardHolderKey == cardHolderKey).map(data => data.multipleCob)
    if (this.multipleCob.length && this.multipleCob.length > 0) {
      this.claimService.multipleCob.emit(this.multipleCob[0])
    }
    if (this.cobIndicator.length && this.cobIndicator.length > 0) {
      this.claimService.setCobVal(this.cobIndicator[0])
      this.claimService.getCOB.emit(this.cobIndicator[0])
    }
    if (this.cobIndicator[0] == 'T') {
      this.cobValid = true
      this.cobNotValid = false
    } else if (this.cobIndicator[0] == 'F') {
      this.cobNotValid = true
      this.cobValid = false
    } else {
      this.cobValid = false
      this.cobNotValid = false
    }
  }

  setdateVal(frmControlName, obj) {
    if (frmControlName == 'receive_date') {
      var dateInstring = this.changeDateFormatService.convertDateObjectToString(obj);
      var isFutureDate = this.changeDateFormatService.isFutureDateOrToday(dateInstring);
      if (isFutureDate) {
        this.error.isError = true;
        this.ClaimCardHolderFormGroup.controls['receive_date'].setErrors({
          "ReceiveDateFutureData": true
        });
        return
      } else {
        this.error.isError = false;
        this.error.errorMessage = "";
        this.claimService.getRecieveDate.emit(obj)
        this.claimService.cardRecieveDate = obj
      }
    }
    if (frmControlName == 'dob') {
      this.getCardHolderListByCardIdOrDOB()
    }
  }

  setClaimCardholderAddress(event) {
    this.removeDOBValidation(this.bussinessTypeCd)
  }

  /**
   * Enable disble the form on click edit button
   * @param mode 
   */
  enableEditMode(mode) {
    this.editMode = mode;
  }
  CobHistory() {
    this.hmsDataServiceService.OpenCloseModal('btnModalCOBHistory');
    this.dataTableService.reloadTableElem(this.dtElements, 'COBHistory', this.dtTrigger['COBHistory'], false)
  }
  emitOnSaveCOBHistory(data) {
    if (data) {

      if (data.check) {
        if (data.data.length > 1) {
          this.claimService.cob2eligible.emit(false)
        }
      } else {
        this.cobValid = true
        this.cobNotValid = false
        this.claimService.setCobVal('T')
        this.claimService.getCOB.emit('T');
      }

    } else {
      this.cobValid = false
      this.cobNotValid = true
      this.claimService.setCobVal('F')
      this.claimService.getCOB.emit('F')
    }
  }
  getDesignType(cardholderKey, receivedOn, claimKey = 0, provSpecAssgnKey = 0) {
    let submitData = {
      "claimKey": claimKey,
      "receivedOn": receivedOn,
      "cardholderKey": cardholderKey,
      "provSpecAssgnKey": provSpecAssgnKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getDesignType, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result) {
          this.hasSchedule = true
          this.patientPert = data.result
        }
      } else {
        this.hasSchedule = false
      }
    }, (error) => {
    })
  }

  getCommentList() {
    if (this.commentList && this.commentList.length > 0) {
      var tableId = "card-holder"
      var URL = CardApi.cardImportantComments;
      var userId = this.currentUser.userId
      var reqParam = [{ 'key': 'cardKey', 'value': this.cardId }, { 'key': 'userId', 'value': +userId }]
      var tableActions = []
      var dateCols = ['createdOn'];
      if (!$.fn.dataTable.isDataTable('#card-holder')) {
        this.dataTableService.jqueryDataTableComment(tableId, URL, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
      }
    }
  }

  getCardCommentListReload() {
    var tableId = "card-holder"
    var url = CardApi.cardImportantComments;
    var userId = this.currentUser.userId
    var reqParam = [{ 'key': 'cardKey', 'value': this.cardId }, { 'key': 'userId', 'value': +userId }]
    var tableActions = []
    var dateCols = ['createdOn'];
    if (!$.fn.dataTable.isDataTable('#card-holder')) {
      this.dataTableService.jqueryDataTableComment(tableId, url, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
  }

  getCardHolderCommentListReload() {
    var URL = CardApi.getCardHolderImportantCommentsUrl;
    var userId = this.currentUserService.currentUser.userId
    var reqParam = [{ 'key': 'cardHolderKey', 'value': this.cardHolderKey }, { 'key': 'userId', 'value': +userId }]
    var tableActions = []
    var tbl_ImportantComment = "CardHolder-Comment"
    if (!$.fn.dataTable.isDataTable('#CardHolder-Comment')) {
      var dateCols = ['createdOn']
      this.dataTableService.jqueryDataTableComment(tbl_ImportantComment, URL, 'full_numbers', this.cardHoldercommentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
    } else {
      this.dataTableService.jqueryDataTableReload(tbl_ImportantComment, URL, reqParam)
    }
  }

  /** 
   * 481 Issue
   */
  getCardCommentsImportant(cardKey) {
    var userId = this.currentUser.userId
    let submitData = { 'cardKey': +cardKey, 'userId': +userId, start: 0, length: 5 }
    this.hmsDataServiceService.postApi(CardApi.cardImportantComments, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result.data[0].commentImportance == 'Y') {
          this.cardCommentImportance_Grid = true
        } else {
          this.cardCommentImportance_Grid = false
        }
        if (data.result.data[0].cardCoTxt != "" && data.result.data[0].cardCoTxt != null) {
          this.commentText = data.result.data[0].cardCoTxt;
        }
      } else {
        this.cardCommentImportance_Grid = false
      }
    }, (error) => {
    })
  }

  /** 
   * 481 Issue
   */
  getCardHolderCommentsImportant() {
    var userId = this.currentUserService.currentUser.userId
    var submitData = { 'cardHolderKey': this.cardHolderKey, 'userId': +userId, start: 0, length: 5 }
    var URL = CardApi.getCardHolderImportantCommentsUrl;
    this.hmsDataServiceService.postApi(URL, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data.result.length > 0) {
          if (data.result.data[0].chComImportance == 'Y') {
            this.cardHolderCommentFlag = true
          } else {
            this.cardHolderCommentFlag = false
          }
          if (data.result.data[0].chComTxt != "" && data.result.data[0].chComTxt != null) {
            this.commentTextClient = data.result.data[0].chComTxt;
          }
        }
      } else {
        this.cardHolderCommentFlag = false
      }
    }, (error) => {
    });
  }

  // Log #1008: getCardComment API Integrated as per client feedback
  getCardComments(cardKey, cardHolderKey) {
    let request = {
      'cardKey': cardKey,
      'cardHolderKeys': [cardHolderKey]
    }    
    this.hmsDataServiceService.postApi(CardApi.getAllCardCommentsUrl, request).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let dataResult = data.result.data
        if (dataResult.length > 0) {
          if (dataResult[0].commentType != 'Service Provider Message') {
            this.showFlag = true
            if (dataResult[0].cardImportance == 'Y') {
              this.isShowRedFlag = true
              this.cardCommentText = dataResult[0].commentTxt || dataResult[0].commentText;
              this.cardCommentList = dataResult
            } else {
              this.isShowRedFlag = false
              this.cardCommentText = dataResult[0].commentTxt || dataResult[0].commentText;
              this.cardCommentList = dataResult
            }
            if (dataResult[0].commentType == 'TPA Message' || dataResult[0].commentType == 'Company Message' || dataResult[0].commentType == 'Plan Message' || dataResult[0].commentType == 'Division Message') {
              this.isCommentTypeExistRed = true
            } else if (dataResult[0].commentType == 'Service Provider Message' || dataResult[0].commentType == 'Cardholder Message' || dataResult[0].commentType == 'Card Message') {
              this.isCommentTypeExistRed = false
            } else {
              this.isCommentTypeExistRed = false
            }
          } else {
            this.showFlag = false
            this.cardCommentText = ''
            this.cardCommentList = []
          }
        } else {
          this.showFlag = false
          this.cardCommentText = ''
        }
      } else {
        this.showFlag = false
        this.cardCommentList = []
      }
      // General feedback on Claimview Page popUp comments and  on No data available massage issue are resolved 
      this.dataTableService.reloadTableElem(this.dtElements, 'cardCommentsFlag', this.dtTrigger['cardCommentsFlag'], false)
    }, (error) => {
    })          
  }

  // Log #1008: Comment Flag Popup Relaod functionality
  reloadTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTriggerFlagComment.next();
    });
  }

  // Log #1008: Cardholder Important Comment here 
  getCardHolderPersonCommentsImportant(personKey) {
    let submitData = { 'personKey': personKey, start: 0, length: 5 }
    this.hmsDataServiceService.postApi(CardApi.getCHPersonImportantCommentUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data.result.data.length > 0) {
          if (data.result.data[0].dispCommentInd == 'T') {
            this.cardHolderCommentFlag = true
          } else {
            this.cardHolderCommentFlag = false
          }
          if (data.result.data[0].personComTxt != "" && data.result.data[0].personComTxt != null) {
            this.commentTextClient = data.result.data[0].personComTxt;
          }
        }
      } else {
        this.cardHolderCommentFlag = false
      }
    }, (error) => {
    });
  }
  //  add method for claim history button(#1283)
  GetClaimItemsByIdCardHolderKey(cardHolderKey) {
    this.showLoader = true
    let submitData = {
      "cardholderKey": cardHolderKey
    }
    localStorage.setItem("cardholderKey",cardHolderKey)
    this.hmsDataService.postApi(CardApi.getClaimItemsByCardHolderKey, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showLoader = false
        this.claimItems = data.result;
        this.claimItems.map(r => {
          if (r.itemToothId == undefined || r.itemToothId == null) {
            r.itemToothId = -1
          }
        });
        var dateCols = ['itemServiceDt'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
      }
      else {
        this.claimItems = []
        this.showLoader = false
      }
      this.dataTableService.reloadTableElem(this.dtElements, 'CardHolderClaimHistory', this.dtTrigger['CardHolderClaimHistory'], false)
      error => { }
    })
  }

  openClaim(claimKey, disciplineKey, dcpKey,claimItem) {
    this.route.params.subscribe((params: Params) => {
      localStorage.setItem("_cardId", params.id)
    })
    this.claimService.isViewEnable = true
    this.hmsDataService.OpenCloseModal("btnCloseShowClaimItems");
    if (dcpKey > 0) {
      this.router.navigate(["/claim/view/" + claimKey + "/type/" + disciplineKey + "/dcp/" + dcpKey], { queryParams: { 'redirect': 'cardholder' } });
    } else {
      this.router.navigate(["/claim/view/" + claimKey + "/type/" + disciplineKey], { queryParams: { 'redirect': 'cardholder' } });
    }
  }

  ngOnDestroy() {
    if (this.claimDataSub) {
      this.claimDataSub.unsubscribe()
    }
  }
  
}