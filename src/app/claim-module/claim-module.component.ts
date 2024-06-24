import { Component, OnInit, ViewChild, Inject, ViewChildren, QueryList, ɵConsole, Input, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { GeneralInformationComponent } from './general-information/general-information.component';
import { CardHolderComponent } from './../claim-module/card-holder/card-holder.component';
import { ClaimTypeComponent } from './../claim-module/claim-type/claim-type.component';
import { ServiceProvidersComponent } from './../claim-module/service-providers/service-providers.component'
import { PayToOtherComponent } from './../claim-module/pay-to-other/pay-to-other.component';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ToastrService } from 'ngx-toastr'; //add toster service
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ClaimApi } from '../claim-module/claim-api';
import { ClaimMessageComponent } from './claim-message/claim-message.component'
import { ClaimTotalComponent } from './claim-total/claim-total.component'
import { ClaimItemComponent } from './claim-item/claim-item.component';
import { CustomValidators } from '../common-module/shared-services/validators/custom-validator.directive';
import { ClaimService } from './claim.service';
import { DatatableService } from '../common-module/shared-services/datatable.service'
import { Location, DatePipe } from '@angular/common';
import { ExDialog } from "../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { FormCanDeactivate } from './../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { Constants, CommonDatePickerOptions } from '../common-module/Constants'
import { ReviewClaimComponent } from './review-claim/review-claim.component';
import { ExportClaimLetterComponent } from '../review-web-app/export-report/export-claim-letter/export-claim-letter.component'
import { drawDOM, exportPDF, DrawOptions, Group } from '@progress/kendo-drawing';
import { saveAs } from '@progress/kendo-file-saver';
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { ClaimItemDentalComponent } from './claim-item/claim-item-dental/claim-item-dental.component';
import { ClaimItemVisionComponent } from './claim-item/claim-item-vision/claim-item-vision.component';
import { Observable } from 'rxjs/Observable';
import { CardApi } from '../card-module/card-api';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DuplicateClaimItemComponent } from './duplicate-claim-item/duplicate-claim-item.component';
import { debug } from 'util';
import { EventEmitter } from 'events';
import { ReferToReviewApi } from '../refer-to-review-module/refer-to-review-api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-claim-module',
  templateUrl: './claim-module.component.html',
  styleUrls: ['./claim-module.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService, ExDialog, DatePipe]
})
export class ClaimModuleComponent extends FormCanDeactivate implements OnInit {
  allowEdit: boolean = true;
  disableReviewButon: boolean;
  refToReview: boolean = false;
  ReferToReviewBtn: boolean = false;
  referToName: any;
  showRevClaimItemBtn: boolean = false;
  showRevPreAuthTableObj: any;
  releaseBtnTxt: string;
  claimDataArr: any;
  supervisorKey: any;
  key: any;
  InitSearch: boolean = false;
  InitSearchClaimAdd: boolean = false;
  InitSearchClaimAddString: string = 'false';
  showProviderTotal: boolean = false;
  categories: any = [];
  initClaimUrl: any = "";
  queryParam: any;
  initiateClaim: boolean;
  cardHolderCommData(arg0: any): any {
    throw new Error("Method not implemented.");
  }
  CardCommData: any;
  cardCommentImportance: boolean = false;
  claimTypeCd: any;
  showPreAuthReview_columns = [];
  releasedValue: any;
  totalColumns: number;
  claimTypes: boolean = false;
  arrData: any;
  enableEditModeFromAddNewButton: any;
  dcKey: any;
  selectedClaimType: any;
  selectedPayeeType: any
  ltrContntLine4: string;
  @ViewChild('FormGroup')
  @ViewChild(GeneralInformationComponent) generalInformationComponent;
  @ViewChild(CardHolderComponent) cardHolderComponent: CardHolderComponent;
  @ViewChild(ServiceProvidersComponent) serviceProvidersComponent: ServiceProvidersComponent;
  @ViewChild(ClaimMessageComponent) claimMessageComponent;
  @ViewChild(ClaimTotalComponent) claimTotalComponent;
  @ViewChild(PayToOtherComponent) payToOtherComponent;
  @ViewChild(ClaimItemComponent) claimItemComponent;
  @ViewChild(ClaimItemDentalComponent) claimItemDentalComponent;
  @ViewChild(ClaimItemVisionComponent) claimItemVisionComponent
  @ViewChild(ExportClaimLetterComponent) exportClaimLetterComponent;
  claimCompanyId: any;
  claimReleased: any;
  providerId: any;
  referClaimGenralInfo: {
    claimType: any; entry_date: { date: { year: number; month: number; day: number; }; }; type: any; //claimTypeKey,
    operator: any; reference: any; userId: any; modified_date: any;
  };
  userList: any[];
  cardBusinessTypeKey: any;
  claimReferralInd: string;
  claimReferralAccess: string;
  claimRefered: boolean = false;
  systemMessageData = [];
  cobVal: any;
  disciplineCD: any;
  cardNumber: any;
  cardKey: any;
  dcpKey = 0;
  recieveDateTitle: boolean = false;
  @ViewChildren(DataTableDirective)
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  alberta;
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  FormGroup: FormGroup;
  datatableElements: DataTableDirective;
  ClaimCardHolderFormGroup;
  CH_RecievedDate: string
  addMode: boolean = true; //Enable true when user add a new claim
  viewMode: boolean = false; //Enable true after a new claim added
  editMode: boolean = false; //Enable true after viewMode when user clicks edit button
  cardHeading: string = "Add" //Heading name change on add/edit
  savedClaimData; //var to store saved data from API
  cardHolderKey;// getting cardholder key from cardholder List
  claimId;
  descipline_type;
  dentProvSpecAssgnKey;
  disciplineKey = 1;
  buttonText = "Save";//button text for Save/Edit/Update
  claimStatus: any = ""
  filePath;
  referClaim: FormGroup; //intailize rfer claim pop-up
  reverseClaimForm: FormGroup;
  reverseClaimItemForm: FormGroup;
  reverseClaimGeneralInformationFormGroup: FormGroup;
  patient; //PatientData on Print Screen
  address; //AddressData on Print Screen
  provider; //ProviderData on Print Screen
  providerAddress; //Provider Address on Print Screen
  selectedPayee: number
  providerDetails = []
  providerTotals = []
  serviceData = [];
  MessageData = [];
  printCovrage = [];
  printFormulas = [];
  CustomeMessageData;
  imgUrl;
  BusinessType;
  //Adjudicate Progress and message variables
  adjudicatedPercent
  adjudicatedStatus
  adjudicatedMessage
  hasClaimItems: boolean = false
  UserID;
  customComments = [];
  cardholderName;
  commentText;
  commentList = [];
  userType;
  PendingPaperWork;
  IgnoreExtraBenefit;
  claimCommentImportance: boolean = false;
  hasPreAuth: boolean = false;
  reviewKey;
  reviewer: boolean = false
  openReferClaimModal: boolean = false
  disableDctrBtn: boolean = false
  disableGovBtn: boolean = false
  disablSendDocbtn: boolean = false
  finalReviewStatus = ""
  selectedClaimTypeKey
  selectedPayeeTypeKey;
  isClaimReversed: boolean = false;
  commentColumns = [
    { 'title': 'Date', 'data': 'createdOn' },
    { 'title': 'User Name', 'data': 'username' },
    { 'title': 'Department', 'data': 'department' },
    { 'title': 'Comments', 'data': 'claimCoTxt' },
    { 'title': 'Importance', 'data': 'claimImportance' }
  ];
  claimCommentColumns = [
    { 'title': 'Date', 'data': 'createdOn' },
    { 'title': 'User Name', 'data': 'username' },
    { 'title': 'Department', 'data': 'department' },
    { 'title': 'Comments', 'data': 'claimCoTxt' },
    { 'title': 'Importance', 'data': 'claimImportance' }
  ]
  savedClaimKey
  savedDesciplineKey
  albertaCard: boolean = false
  reviewStatus
  printAuth: boolean = false
  showGovBtn: boolean = false
  submitted = false;
  disableSendReviewDoctr: boolean = false
  userRole = localStorage.getItem('role')
  applicationRole = localStorage.getItem('roleLabel')
  todayDate: string;
  providerLttrAdrs = []
  ltrReference
  ltrPatientName
  ltrCrdNum
  ltrDateOfBirth
  ltrContntLine1
  ltrContntLine2
  ltrContntLine3
  isFileContent: boolean = false;
  copyMode: boolean = false
  itemEditMode: boolean = false
  signImage
  ltrDate
  hasFileRef: boolean = false
  userAuthCheck: any;
  claimChecks = [{
    "save": 'F',
    "addClaim": 'F',
    "viewClaim": 'F',
    "search": 'F',
    "copyClaim": 'F',
    'editClaim': 'F',
    'adjudicateClaim': 'F',
    'deleteClaim': 'F',
    'printPreAuth': 'F',
    'printClaim': 'F',
    'referClaim': 'F',
    'sendToGovt': 'F',
    'sendToDoctor': 'F',
    'releaseClaim': 'F',
    'deleteClaimItem': 'F',
    'uploadRemoveFile': 'F',
    'ignoreextrabenefits': 'F',
    'pendingPaperWorks': 'F',
    'disciplineType': 'F',
    'claimType': 'F',
    'serviceProviderPayee': 'F',
    "addNewClaimItem": 'F',
    'viewFile': 'F',
    'searchCard': 'F',
    'addReview': 'F',
    'addOverides': 'F',
    'overides': {
      "N": 'F',
      "J": 'F',
      "D": 'F',
      "E": 'F',
      "I": 'F',
      "5": 'F',
      "R": 'F',
      "V": 'F',
      "2": 'F',
      "H": 'F',
      "0": 'F',
      "S": 'F',
      "P": 'F',
      "B": 'F',
      "G": 'F',
      "K": 'F',
      "M": 'F',
      "Q": 'F',
      "C": 'F',
      "F": 'F',
      "A": 'F',
      "L": 'F',
      "X": 'F'
    }
  }]
  daspContent: string;
  showLoader: boolean = false;
  cardBusinessType: any;
  currentUser: any;
  businessTypeDesc: any;
  businessTypeCd: any;
  ConstantAlbertaCd = Constants.albertaBusinessTypeCd
  ConstantQuikcardCd = Constants.quikcardBusinessTypeCd
  preAuthReverseClaim: boolean = false;
  reverseClaimItems: any;
  reverseClaimKey: any;
  selectedReverseClaimIndex;
  selectedRow: any;
  showEditLine: boolean = false;
  editedReversalClaim = [];
  reversCdEligibilityKey: any;
  reversChEligibilityKey: any;
  dcItemKey: any;
  reversedClaimItemKeys = [];
  reversClaimDisciplineKey: any;
  linkedReverseClaimKeys = [];
  savedReverseClaimKeys: any;
  isReverseClaim: boolean = false;
  reversedClaimStatus
  sendAdjudicate: boolean = false;
  claimItemDenatlMode: any;
  payeeTypeDesc
  showClaimData: any;
  observableShowClaimObj;
  observablePreAuthClaimObj;
  checkShowClaim: boolean = true;
  checkPreAuthClaim: boolean = true;
  showClaim_columns = [];
  recordLength;
  message;
  supervisorValue: any = '';
  referenceId;
  checkReferenceId: boolean = false;
  resetForm: number = 0;
  claimitemsWithDiscipline: any;
  trackStatusList: any[];
  refNumber;
  releaseInd: any;
  closeOrResetClaim: number = 0;
  isClaimDeleted = new EventEmitter
  lockedMessage: string
  showLockedMsg: boolean;
  isReversedInd: boolean = false
  showClaimHistoryTableObj = []
  checkClaimHistoryRefId: boolean = false
  claimHisRefId;
  claimHistoryRecordLength;
  claimHistoryMessage
  checkClaimHistoryRefIdSecond : boolean = false
  claimHisRefIdSecond
  showClaimHistoryTableObjSecond = []
  authorizedEb;
  claimItemValue : Subscription
  cSfK = 0
  isAdDash    
  constructor(private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private claimService: ClaimService,
    private dataTableService: DatatableService,
    private exDialog: ExDialog,
    private location: Location,
    private translate: TranslateService,
    private datePipe: DatePipe,
    private currentUserService: CurrentUserService,
    private _hotkeysService: HotkeysService,
    private ngbModal: NgbModal
  ) {
    super();
    claimService.getClaimItemsVission.subscribe(value => {
      if (value) {
        this.hasClaimItems = true
      } else {
        this.hasClaimItems = false
      }
      this.readjudicateClaim()
    })
    claimService.getClaimItems.subscribe(value => {
      if (value) {
        this.hasClaimItems = true
      } else {
        this.hasClaimItems = false
      }
      this.readjudicateClaim()
    })
    claimService.getClaimImpCmnt.subscribe(value => {
      if (value) {
        this.commentText = value.claimCoTxt;
        this.claimCommentImportance = true;
      }
    })

    claimService.getTotalsPendingPaperWorkCheckboxValue.subscribe(value => {
      this.PendingPaperWork = value;
    })
    
    claimService.getAuthorizedEbCheckboxValue.subscribe(value => {
      this.authorizedEb = value
    })

    claimService.getTotalsCheckboxValue.subscribe(value => {
      this.IgnoreExtraBenefit = value;
    })
    claimService.getclaimTypeCd.subscribe(value => {

      this.claimTypeCd = value
      this.showPreAuth(value)
    })
    claimService.disableSave.subscribe(value => {
      if (value) {
        this.itemEditMode = true
      } else {
        this.itemEditMode = false
      }
    })
    claimService.selectedClaimTypeKeyData.subscribe(value => {
      this.selectedClaimTypeKey = value
    })
    claimService.payToOther.subscribe(value => {
      this.selectedPayeeTypeKey = value
    })
    claimService.addNewButton.subscribe(value => {
      if (value == true) {
        this.enableEditModeFromAddNewButton = true
      }
      else {
        this.enableEditModeFromAddNewButton = false
      }
    })
    claimService.claimItemMode.subscribe(value => {
      // if  addnew item button issue occur after saving claim item using  tabing check here 
      this.claimItemDenatlMode = value;
    })
    claimService.getCOB.subscribe(value => {
      this.cobVal = value
    })
    /** For 465 Issue */
    if (this.claimService.isReverseClaimBtnClickedFromSearchClaimScreen) {
      this.showRevClaimItemBtn = true
    } else {
      this.showRevClaimItemBtn = false
    }

    /** 465 Issue */
    // disables send to doc btn if claim is sent for additional info  and enable if op add additoonal info
    claimService.calimSubmitted.subscribe(value => {
      this.disableDctrBtn = value
    })
    claimService.getDisciplineKey.subscribe(value => {
      this.disciplineKey = value
    })

    /*shortcut for reverse claim*/
    this._hotkeysService.add(new Hotkey('alt+v', (event: KeyboardEvent): boolean => {
      if (this.editMode) {
        this.hmsDataServiceService.OpenCloseModal('btnReverseClaim')
      }
      return false; // Prevent bubbling
    }));
    /*shortcut for release claim*/
    this._hotkeysService.add(new Hotkey('shift+r', (event: KeyboardEvent): boolean => {
      if (!this.editMode && !this.addMode && this.claimStatus == 'Adjudicated' && this.claimRefered == false) {
        this.releaseClaim()
      }
      return false; // Prevent bubbling
    }));

    /*shortcut for reIssue claim*/
    this._hotkeysService.add(new Hotkey('alt+o', (event: KeyboardEvent): boolean => {
      ///add functionality for reIssue Claim
      return false; // Prevent bubbling
    }));

    this.route.queryParams.subscribe(queryParam => {
      if (queryParam.iniClaim && queryParam.chCardKey && queryParam.cardHolderKey) {  
        localStorage.setItem("initClaimUrl", JSON.stringify(queryParam));
        this.queryParam = queryParam;
        this.initiateClaim = true;
      }
    })
    if (this.initClaimUrl == '') {
      this.initClaimUrl = localStorage.getItem('initClaimUrl');
      this.queryParam = JSON.parse(localStorage.getItem('initClaimUrl'));
    }
    this.claimService.mobilClaimData.subscribe(data => {
      let mobileData = {
        ClaimCardHolderFormGroup: {
          receive_date: this.changeDateFormatService.convertStringDateToObject(data.serviceDate),
          cardId: data.cardNum,
          cardHolder: data.cardholderKey,
        },
      }
      this.FormGroup.patchValue(mobileData)
      this.claimService.getDisciplineMobile.emit(data)
    })
    
  }

  ngOnInit() {
    if (this.route.snapshot.url.length != 0 && this.route.snapshot.url[0].path != undefined && this.route.snapshot.url[0].path != "") {
      if (this.route.snapshot.url[0].path == "view") {
        this.getFileViewPath(this.route.snapshot.url[1].path)
      }
    }
    if (this.userRole == "referReviwer") {
      this.refToReview = true;
    }

    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        $('html, body').animate({
          scrollTop: 0
        }, 'slow')
      }
    }
    this.showLoader = true
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.createAuthChecks()
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.createAuthChecks()
      })
    }
    $("input[type='text']").attr("autocomplete", "off");
    this.FormGroup = this.fb.group({
      ClaimGeneralInformationFormGroup: this.fb.group(this.generalInformationComponent.claimGeneralInformationVal),
      ClaimCardHolderFormGroup: this.fb.group(this.cardHolderComponent.ClaimCardHolderVal),
      ClaimServiceProvidersFormGroup: this.fb.group(this.serviceProvidersComponent.ClaimServiceProvidersFormGroupVal),
      ClaimPayToOtherFormGroup: this.fb.group(this.payToOtherComponent.ClaimPayToOtherFormGroupVal)
    })
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.enableViewMode();
        this.getClaimCommentList()
        this.route.params.subscribe((params: Params) => {
          if (this.route.snapshot.url[4]) {
            if (this.route.snapshot.url[4].path == 'reviewer') {
              this.reviewer = true
              this.reviewKey = params['reviewerKey']
              this.enableViewMode();
            } else {
              this.reviewer = false
            }
            if (this.route.snapshot.url[4].path == 'preAuth') {
              this.preAuthReverseClaim = true
              this.claimTypes = true
              this.enableViewMode();
            }
            else {
              this.preAuthReverseClaim = false
            }
            if (this.route.snapshot.url[4].path == 'preAuthReview') {
              this.claimTypes = false
              this.preAuthReverseClaim = true
            }
            else {
            }

            if (this.route.snapshot.url[4].path == 'dcp') {
              this.dcpKey = params['dcpKey']

            } else {
              this.dcpKey = 0
            }
          }
          if (this.route.snapshot.url[1].path) {
            this.claimId = this.route.snapshot.url[1].path;
          }
        })
      }
      if (this.route.snapshot.url[0].path == "copy") {
        this.route.params.subscribe((params: Params) => {          
          this.copyMode = true
          this.claimId = params['copyKey']          
          var type = localStorage.getItem('claimType') || 1 // or if we dont have type saved
          this.disciplineKey = +type;
          this.fillClaimDetails(this.claimId, type)        
        })
      }
    }
    this.referClaim = new FormGroup({
      rfrClmUser: new FormControl('', [Validators.required]),
      rfrClaimCommentTxt: new FormControl('', [Validators.required, Validators.maxLength(512), CustomValidators.notEmpty]),
      rfrClaimImportant: new FormControl(''),
      supervisorKey: new FormControl('0')
    });
    this.reverseClaimForm = new FormGroup({
      rvrseClmNo: new FormControl('', [Validators.required]),
    });
    this.reverseClaimItemForm = new FormGroup({
      approveReview: new FormControl(''),
      deductAmt: new FormControl(''),
      cobVal: new FormControl(''),
      toothId: new FormControl(''),
      toothSurfaceTxt: new FormControl(''),
      unitCount: new FormControl(''),
    });
    this.reverseClaimGeneralInformationFormGroup = new FormGroup({
      reverseClaimDiscipline: new FormControl(''),
      reverseClaimEntryDate: new FormControl(''),
      reverseClaimType: new FormControl(''),
      reverseClaimOperator: new FormControl(''),
      reverseClaimReference: new FormControl(''),
      reverseClaimUserId: new FormControl(''),
      reverseClaimModified_date: new FormControl('')
    });
    

    this.observableShowClaimObj = Observable.interval(2000).subscribe(x => {
      var reqParam = [] //6112347
      reqParam.push({ 'key': 'claimKey', 'value': this.claimId })
      var showClaimTableActions = []
      if (this.checkShowClaim = true) {
        if ('company.add-company-associated.company-#' == this.translate.instant('company.add-company-associated.company-#')) {
        } else {
          this.showClaim_columns = [
            { title: 'Reference No.', data: 'refId' },
            { title: 'Entry Date', data: 'entryDate' },
            { title: 'Released', data: 'released' },
            { title: 'Claim Type', data: 'claimType' },
            { title: "Card ID", data: 'cardNumber' },
            { title: "Last Name", data: 'personLastName' },
            { title: "First Name", data: 'personFirstName' },
            { title: "Payee", data: 'payeeTypeName' },
            { title: "Received", data: 'receivedOn' },
            { title: "Status", data: 'status' }]

          this.dataTableService.jqueryDataTableSearchClaim("show-claim-table", ClaimApi.showClaimModalDetailsUrl, 'full_numbers', this.showClaim_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, showClaimTableActions, undefined, '', '', [2, 3, 4, 5, 6, 7, 9], [1, 8])
          this.checkShowClaim = false
          this.observableShowClaimObj.unsubscribe();
        }
      }
    });

    this.observablePreAuthClaimObj = Observable.interval(2000).subscribe(x => {
      if (this.checkPreAuthClaim = true) {
        if ('company.add-company-associated.company-#' == this.translate.instant('company.add-company-associated.company-#')) {
        } else {
          this.showPreAuthReview_columns = [
            { title: 'Reference No.', data: 'refId' },
            { title: 'Entry Date', data: 'entryDate' },
            { title: 'Released', data: 'released' },
            { title: 'Claim Type', data: 'claimType' },
            { title: "Card ID", data: 'cardNumber' },
            { title: "Last Name", data: 'personLastName' },
            { title: "First Name", data: 'personFirstName' },
            { title: "Payee", data: 'payeeTypeName' },
            { title: "Received", data: 'receivedOn' },
            { title: "Status", data: 'status' }]
          var requestedParameter = []
          requestedParameter.push({ 'key': 'claimKey', 'value': this.claimId }) //6112347
          if (!$.fn.dataTable.isDataTable('#show-preAuthReview-claim-table')) {
            this.dataTableService.jqueryDataTable("show-preAuthReview-claim-table", ClaimApi.showPreAuthPaperClaimUrl, 'full_numbers', this.showPreAuthReview_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', requestedParameter, undefined, undefined, '', '', [], [], [], [0], [1, 2, 3, 4, 5, 6, 8, 7, 9])
          } else {
            this.dataTableService.jqueryDataTableReload('show-preAuthReview-claim-table', ClaimApi.showPreAuthPaperClaimUrl, requestedParameter)
          }
          this.checkPreAuthClaim = false
          this.observablePreAuthClaimObj.unsubscribe();
        }
      }
    });

    this.todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday());
    this.todayDate = this.changeDateFormatService.formatDateLetter(this.todayDate)
    this.signImage = location.origin + '/assets/images/signature.jpg'
   

    this._hotkeysService.add(new Hotkey('ctrl+l', (event: KeyboardEvent): boolean => { /* Hotkeys for Adjudication 'ctrl+j' */

      if (!this.addMode && this.itemEditMode == false) {
        this.viewModeAdjudicate(this.claimId, this.disciplineKey, 0)
      }
      else {
        this.adjudicateClaim()
      }
      return false; // Prevent bubbling
    }));


    /* Log #987  */
    this.getClaimItemList();
    this.getCatList()
    this.getReversedClaimInd();

      this.claimItemValue = this.claimService.cardHolderValueEmitter.subscribe(value => {
      if(value){
        this.enableViewMode()
      }
    })
  }

  getListing(e) {
  }

  PreAuthReviewClaimDatatable() {
    this.observablePreAuthClaimObj = Observable.interval(1000).subscribe(x => {
      if (this.checkShowClaim = true) {
        if ('company.company-terminate.termination-reason' == this.translate.instant('company.company-terminate.termination-reason')) {
        }
        else {
          this.showPreAuthReview_columns = [
            { title: 'Reference No.', data: 'refId' },
            { title: 'Entry Date', data: 'entryDate' },
            { title: 'Released', data: 'released' },
            { title: 'Claim Type', data: 'claimType' },
            { title: "Card ID", data: 'cardNumber' },
            { title: "Last Name", data: 'personLastName' },
            { title: "First Name", data: 'personFirstName' },
            { title: "Payee", data: 'payeeTypeName' },
            { title: "Received", data: 'receivedOn' },
            { title: "Status", data: 'status' }]
          this.checkShowClaim = false
          this.observablePreAuthClaimObj.unsubscribe();
        }
      }
    });
  }

  createAuthChecks() {
    if (this.currentUserService.authChecks && this.currentUserService.authChecks.length == 0 && this.currentUserService.authChecks['VCL'] == undefined) {
      this.currentUserService.getUserAuthorization().then(res => {
        this.createAuthChecks()
      })
    } else {
      let checkArray = this.currentUserService.authChecks['VCL'].concat(this.currentUserService.authChecks['NCL'])
        .concat(this.currentUserService.authChecks['SCL']).concat(this.currentUserService.authChecks['OVC'])
      checkArray.push(this.currentUserService.authChecks['ICL'][0])
      let searchCard = this.currentUserService.authChecks['SCH'].filter(val => val.actionObjectDataTag == 'SCH48').map(data => data)
      let addReview = this.currentUserService.authChecks['RAD'].filter(val => val.actionObjectDataTag == 'RAD223').map(data => data)
      checkArray.push(searchCard[0])
      checkArray.push(addReview[0])
      this.showLoader = false
      this.getAuthCheck(checkArray)
    }
    this.showLoader = false
  }

  getBusinessType() {
    var businessType = this.currentUserService.userBusinnesType
    if (businessType.bothAccess) {
      if (this.currentUserService.bothAcessdefaultBussinesType && this.currentUserService.bothAcessdefaultBussinesType.length != 0) {
        this.businessTypeDesc = this.currentUserService.bothAcessdefaultBussinesType.businessTypeDesc
        this.businessTypeCd = this.currentUserService.bothAcessdefaultBussinesType.businessTypeCd;
      } else {
        this.businessTypeDesc = businessType[0].businessTypeDesc;
        this.businessTypeCd = businessType[0].businessTypeCd;
      }
    } else {
      this.businessTypeDesc = businessType[0].businessTypeDesc;
      this.businessTypeCd = businessType[0].businessTypeCd;
    }
    this.claimService.getLoggedInBussinesType.emit(this.businessTypeCd)
  }

  getAuthCheck(claimChecks) {
    this.currentUser = this.currentUserService.currentUser
    this.UserID = this.currentUser.userId
    this.getBusinessType()
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.claimChecks = [{
        "save": 'T',
        "addClaim": 'T',
        "viewClaim": 'T',
        "search": 'T',
        "copyClaim": 'T',
        'editClaim': 'T',
        'adjudicateClaim': 'T',
        'deleteClaim': 'T',
        'printPreAuth': 'T',
        'printClaim': 'T',
        'referClaim': 'T',
        'sendToGovt': 'T',
        'sendToDoctor': 'T',
        'releaseClaim': 'T',
        'deleteClaimItem': 'T',
        'uploadRemoveFile': 'T',
        'ignoreextrabenefits': 'T',
        'pendingPaperWorks': 'T',
        'disciplineType': 'T',
        'claimType': 'T',
        'serviceProviderPayee': 'T',
        "addNewClaimItem": 'T',
        'viewFile': 'T',
        'searchCard': 'T',
        'addReview': 'T',
        'addOverides': 'T',
        'overides': {
          "N": 'T',
          "J": 'T',
          "D": 'T',
          "E": 'T',
          "I": 'T',
          "5": 'T',
          "R": 'T',
          "V": 'T',
          "2": 'T',
          "H": 'T',
          "0": 'T',
          "S": 'T',
          "P": 'T',
          "B": 'T',
          "G": 'T',
          "K": 'T',
          "M": 'T',
          "Q": 'T',
          "C": 'T',
          "F": 'T',
          "A": 'T',
          "L": 'T',
          "X": 'T'
        }
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        userAuthCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.claimChecks = [{
        "save": userAuthCheck['SCL28'],
        "addClaim": userAuthCheck['SCL28'],
        "viewClaim": userAuthCheck['SCL29'],
        "search": userAuthCheck['SCL27'],
        "copyClaim": userAuthCheck['VCL39'],
        'editClaim': userAuthCheck['VCL40'],
        'adjudicateClaim': userAuthCheck['NCL38'],
        'deleteClaim': userAuthCheck['VCL33'],
        'printPreAuth': userAuthCheck['VCL30'],
        'printClaim': userAuthCheck['VCL31'],
        'referClaim': userAuthCheck['VCL32'],
        'sendToGovt': userAuthCheck['VCL34'],
        'sendToDoctor': userAuthCheck['VCL35'],
        'releaseClaim': userAuthCheck['VCL36'],
        'deleteClaimItem': userAuthCheck['VCL41'],
        'uploadRemoveFile': userAuthCheck['VCL42'],
        'ignoreextrabenefits': userAuthCheck['NCL43'],
        'pendingPaperWorks': userAuthCheck['NCL44'],
        'disciplineType': userAuthCheck['NCL45'],
        'claimType': userAuthCheck['NCL46'],
        'serviceProviderPayee': userAuthCheck['NCL47'],
        "addNewClaimItem": userAuthCheck['NCL37'],
        'viewFile': userAuthCheck['ICL74'],
        'searchCard': userAuthCheck['SCH48'],
        'addReview': userAuthCheck['RAD223'],
        'addOverides': userAuthCheck['NCL304'],
        'overides': {
          "N": userAuthCheck['OVC347'],
          "J": userAuthCheck['OVC344'],
          "D": userAuthCheck['OVC339'],
          "E": userAuthCheck['OVC343'],
          "I": userAuthCheck['OVC349'],
          "5": userAuthCheck['OVC346'],
          "R": userAuthCheck['OVC348'],
          "V": userAuthCheck['OVC353'],
          "2": userAuthCheck['OVC345'],
          "H": userAuthCheck['OVC350'],
          "0": userAuthCheck['OVC341'],
          "S": userAuthCheck['OVC357'],
          "P": userAuthCheck['OVC358'],
          "B": userAuthCheck['OVC360'],
          "G": userAuthCheck['OVC366'],
          "K": userAuthCheck['OVC365'],
          "M": userAuthCheck['OVC363'],
          "Q": userAuthCheck['OVC364'],
          "C": userAuthCheck['OVC361'],
          "F": userAuthCheck['OVC362'],
          "A": userAuthCheck['OVC359'],
          "L": userAuthCheck['OVC340'],
          "X": userAuthCheck['OVC338']
        }
      }]
    }
    this.claimService.getOverideCheck.emit(this.claimChecks[0].overides)
    return this.claimChecks
  }

  ngAfterViewInit(): void {    
  }

  setProvSpecAssgnKey($event) {
    this.dentProvSpecAssgnKey = $event
    this.claimService.setValforUnitDesc.emit(this.dentProvSpecAssgnKey)
  }

  getDisciplineKey($event) {
    this.disciplineKey = $event
  }

  /* to fire validation of all form fields together */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {

      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        if (field == 'licenseNumber' && control.value == null) {
          control.setErrors({ "required": true })
        }
        if (field == 'postalCd' && !control.value) {
          control.setErrors({ "required": true })
        }
        if (field == 'payToAddress' && !control.value) {
          control.setErrors({ "required": true })
        }
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
  * Get Submit Param for Save Claim 
  */

  submitClaimForm(adjudicate) {
    
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    this.submitted = true;
    let recieveDate = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.receive_date);
  
    if (this.claimItemComponent != undefined || this.claimItemComponent != null || this.claimItemComponent != "") {
      if (this.claimItemComponent && this.claimItemComponent.claimItemRequest) {
        var IsInValid = false;

        for (var i = 0; i < this.claimItemComponent.claimItemRequest.length; i++) {
          this.claimItemComponent.claimItemRequest[i].itemServiceDt;          
          IsInValid = this.changeDateFormatService.compareTwoDate(this.claimItemComponent.claimItemRequest[i].itemServiceDt, recieveDate);
        }
        // log 1063
        let claimType = this.FormGroup.value.ClaimGeneralInformationFormGroup.type.toString().trim() || ""

        if (claimType == "Pre-Authorization - Paper") {
          IsInValid = false
        }
        if (IsInValid) {
          let allowAdjudicate = false;
          this.itemEditMode = false

          this.submitted = false;
          $('.dataTables_processing').hide();
          this.toastrService.error("Receive Date Cannot Be Less Than Claim Item Service Date")
          return false;
        }
      }
    }
    if (adjudicate == "withAdjudicate" && this.viewMode) {
      this.viewModeAdjudicate(dcKey, this.disciplineKey, 0);
      return;
    }
    if (this.route.snapshot.queryParams.claimcategory == 'true') {
      this.validateAllFormFields(this.FormGroup);
    }
    if (this.FormGroup.valid) {    
      var userId = this.UserID
      let descipline_type = this.FormGroup.value.ClaimGeneralInformationFormGroup.claimType
      if (!this.FormGroup.value.ClaimGeneralInformationFormGroup.claimType) {
        descipline_type = this.descipline_type
      }
      let submitData
      let submitType = this.claimService.getSubmitParam(descipline_type)
      var dcKey = '';
      var apiUrl = ClaimApi.saveClaimUrl
      var action = "Saved"

      if (this.claimId && !this.copyMode) {
        dcKey = this.claimId;
        apiUrl = ClaimApi.updateClaimUrl
        action = "updated"
      }
      var cardHolderAdminCm = [];
      if (this.claimMessageComponent != undefined || this.claimMessageComponent != null || this.claimMessageComponent != "") {
        if (this.claimMessageComponent && this.claimMessageComponent.claimCommentjson) {
          for (var i = 0; i < this.claimMessageComponent.claimCommentjson.length; i++) {
            var commentImportance
            if (this.claimMessageComponent.claimCommentjson[i].companyImportance) {
              commentImportance = 'Y'
            } else {
              commentImportance = 'N'
            }
            cardHolderAdminCm.push({
              'userId': +userId, 'claimCoTxt': this.claimMessageComponent.claimCommentjson[i].claimCoTxt,
              'claimImportance': this.claimMessageComponent.claimCommentjson[i].claimImportance,
              'userGroupKey': this.claimMessageComponent.claimCommentjson[i].userGroupKey,
              'expiredOn': this.claimMessageComponent.claimCommentjson[i].expiredOn,
            });
          }
        }
      } else {
        cardHolderAdminCm = [];
      }

      let claimItems
      if (this.claimItemComponent != undefined || this.claimItemComponent != null || this.claimItemComponent != "") {
        if (this.claimItemComponent && this.claimItemComponent.claimItemRequest) {
          claimItems = this.claimItemComponent.claimItemRequest
        }
      }
      submitData = {}
        ;
      let vall = $("#claimType").val();
      if (vall) {
        let val = this.generalInformationComponent.SelectedClaimType(vall)
      }
      submitData[submitType] = {
        "claimKey": +dcKey,
        "claimTypeKey": (+this.selectedClaimTypeKey ? +this.selectedClaimTypeKey : this.selectedClaimType),//this.FormGroup.value.ClaimGeneralInformationFormGroup.type,
        "provBillingAddressKey": this.FormGroup.value.ClaimServiceProvidersFormGroup.payToAddress,
        "cardholderKey": this.FormGroup.value.ClaimCardHolderFormGroup.cardHolder,
        "payeeTypeKey": (+this.selectedPayeeTypeKey ? +this.selectedPayeeTypeKey : this.selectedPayeeType),
        "receivedOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.receive_date),
        "provSpecAssgnKey": this.dentProvSpecAssgnKey,
        "userId": +userId,
        "comments": cardHolderAdminCm,
        'pendingPaperWork': this.PendingPaperWork == 'T' ? 'T' : 'F',
        'ignoreExtraBenefit': this.IgnoreExtraBenefit == 'T' ? 'T' : 'F',
        'payOtherName': this.FormGroup.value.ClaimPayToOtherFormGroup.payeeName,
        'payOtherL1MailAdd': this.FormGroup.value.ClaimPayToOtherFormGroup.addressLine1,
        'payOtherL2MailAdd': this.FormGroup.value.ClaimPayToOtherFormGroup.addressLine2,
        'postalCodeString': this.FormGroup.value.ClaimPayToOtherFormGroup.postalCode,
        'cityName': this.FormGroup.value.ClaimPayToOtherFormGroup.city,
        'provinceName': this.FormGroup.value.ClaimPayToOtherFormGroup.province,
        'countryName': this.FormGroup.value.ClaimPayToOtherFormGroup.country,
        'referenceNumber': this.FormGroup.value.ClaimGeneralInformationFormGroup.reference,
        'claimCategoryCd': this.FormGroup.value.ClaimGeneralInformationFormGroup.cat, // add claim category for(#1206) 
        'bussinessType': this.FormGroup.value.ClaimCardHolderFormGroup.bussinesType,
        'claimAuthEbInd': this.authorizedEb == 'T' ? 'T' : 'F',
      }
      /** Below code modified for issue 690 */
      claimItems.map(claimItem => {
        Object.assign(claimItem, { cdEligibilityKey: this.reversCdEligibilityKey || '' })
      }
      )

      if (this.addMode) {
        if (this.FormGroup.value.ClaimGeneralInformationFormGroup.type == "Eligibility Inquiry") {
          submitData[submitType]["items"] = claimItems;
        } else {
          if (claimItems.length < 1) {
            let allowAdjudicate = false;
            this.itemEditMode = false

            this.toastrService.error(this.translate.instant('Please Add Atleast One Claim Item!'));
            $('.dataTables_processing').hide();
            return false
          }
          submitData[submitType]["items"] = claimItems
        }
      }

      if (this.FormGroup.value.ClaimCardHolderFormGroup.bussinesType == Constants.albertaBusinessTypeCd) {
        submitData[submitType]["personDtOfBirth"] = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.dob)
      }
      if (this.addMode && this.FormGroup.value.ClaimGeneralInformationFormGroup.fileRefVal) {
        submitData[submitType]["fileReference"] = this.FormGroup.value.ClaimGeneralInformationFormGroup.fileRefVal
        this.hasFileRef = true
      }
      if (this.claimId && !this.copyMode) {
        submitData[submitType]["comments"] = []
      }
      this.route.queryParams.subscribe(params => {
        if (params['claimScannedFileKey'] && (params['claimScannedFileKey'] != 0)) {
          this.cSfK = +params['claimScannedFileKey']
          this.claimService.getClaimScannedFileKey = +params['claimScannedFileKey']
        }
        // Ticket #1210 
        if(params['isAdDash']){
          this.isAdDash = params['isAdDash']
          if(params['isAdDash'] == 'true'){
            this.claimService.isAdscDashboard = true 
          } else {
            this.claimService.isAdscDashboard = false 
          }       
        }
        // Ticket #1210 
      }) 
      
      this.hmsDataServiceService.postApi(apiUrl, submitData).subscribe(data => {
        $('.dataTables_processing').hide();
        let allowAdjudicate = false;
        this.itemEditMode = false
        if (data.code == 200 && data.status === "OK") {
          this.savedClaimData = data.result;
          this.claimStatus = data.result.status;
          let claimData = data.result[submitType]

          dcKey = claimData.claimKey
          this.claimService.binaryFileNameData.emit(dcKey)
          this.claimService.emitDisciplineKey.emit(this.disciplineKey)
          this.disciplineKey = claimData.disciplineKey
          this.InitSearchClaimAdd = true;
          this.InitSearchClaimAddString = "true";
          if (adjudicate != "withAdjudicate") {
            if ((this.addMode && this.FormGroup.value.ClaimGeneralInformationFormGroup.fileRefVal) && (this.cSfK != 0)) {
              this.updateScannedClaimFileProcessInitiated(submitType, dcKey, this.cSfK)
            }

            this.toastrService.success('Claim ' + action + '  Successfully!')
            //Added for log 819 
            let is_from_init = "F";
            this.route.queryParams.subscribe(params => {

              //Add for log 819  closing window when open from initialClaim from cardholder
              if (params['iniClaim']) {
                is_from_init = params['iniClaim'];
              }

            })
            if (is_from_init == 'T') {
              let url = "/card/view/" + this.queryParam.chCardKey + "?cardHolderKey=" + this.queryParam.cardHolderKey + "&unitKey=" + this.queryParam.unitKey;
              location.href = url
            } else if (is_from_init == 'F') {
              if (action == "Saved") {
                if (this.copyMode) {
                  this.router.navigate(['/claim/view/' + dcKey + '/type/' + this.disciplineKey], { queryParams: { saveClaim: this.InitSearchClaimAddString, isAdDash: this.isAdDash } })
                  this.enableViewMode();
                } else {
                  this.resetClaimForm();
                  if (this.isAdDash != '' && this.isAdDash != undefined) {
                    this.dashboardClaims()
                  } else {
                    this.router.navigate(['/claim']);
                  }
                }
              } else {
                if (this.isAdDash != '' && this.isAdDash != undefined) {
                  this.dashboardClaims()
                } else {
                  this.router.navigate(['/claim']);
                }
              }
            } else {
              this.router.navigate(['/claim/view/' + dcKey + '/type/' + this.disciplineKey], { queryParams: { saveClaim: this.InitSearchClaimAddString, isAdDash: this.isAdDash } })
              this.enableViewMode();
            }
           
          } else {
            this.viewModeAdjudicate(dcKey, this.disciplineKey, this.cSfK)
          }
          if(this.generalInformationComponent.selectedFileName){
            this.generalInformationComponent.fetchFileName();
          }
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "HSA_CLAIM_CANNOT_PAY_TO_PROVIDER") {
          this.toastrService.error("Cannot Pay Supplemental Claim To Proider")
        }
        else if (data.code == 400 && data.result == "Cannot pay a fake provider" && data.status == "BAD_REQUEST") {
          this.toastrService.error(data.result)
        }
        else if (data.code == 400 && data.status == "BAD_REQUEST" && adjudicate == "withAdjudicate") {
          this.toastrService.error(data.result || "Something went wrong please try again");

        } else if (data.code == 400 && data.result == "Can only release APPROVED claims" && data.status == "BAD_REQUEST") {

          this.toastrService.error(data.result)
        } else {
          let res = data.result || "Something went wrong please try again"
          this.addMode ? this.toastrService.error(res) : this.toastrService.error(res)

        }
        error => {
          this.addMode ? this.toastrService.error("Claim Details Are Not Added Successfully") : this.toastrService.error("Claim Details Are Not Updated Successfully")
        }
      });
    }
    else {
      this.itemEditMode = false
      $('.dataTables_processing').hide();
      this.validateAllFormFields(this.FormGroup);
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }

  }
  oldsubmitClaimForm(adjudicate) {
    this.submitted = true;
    let recieveDate = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.receive_date);
    if (this.claimItemComponent != undefined || this.claimItemComponent != null || this.claimItemComponent != "") {
      if (this.claimItemComponent && this.claimItemComponent.claimItemRequest) {
        var IsInValid = false;

        for (var i = 0; i < this.claimItemComponent.claimItemRequest.length; i++) {
          this.claimItemComponent.claimItemRequest[i].itemServiceDt;         
          IsInValid = this.changeDateFormatService.compareTwoDate(this.claimItemComponent.claimItemRequest[i].itemServiceDt, recieveDate);                   
        }
        if (IsInValid) {
          let allowAdjudicate = false;
          this.itemEditMode = false

          this.submitted = false;
          $('.dataTables_processing').hide();
          this.toastrService.error("Receive Date Cannot Be Less Than Claim Item Service Date")
          return false;
        }
      }
    }
    if (adjudicate == "withAdjudicate" && this.viewMode) {
      this.viewModeAdjudicate(dcKey, this.disciplineKey, 0);
      return;
    }
    if (this.FormGroup.valid) {
      var userId = this.UserID
      let descipline_type = this.FormGroup.value.ClaimGeneralInformationFormGroup.claimType
      if (!this.FormGroup.value.ClaimGeneralInformationFormGroup.claimType) {
        descipline_type = this.descipline_type
      }
      let submitData
      let submitType = this.claimService.getSubmitParam(descipline_type)
      var dcKey = '';
      var apiUrl = ClaimApi.saveClaimUrl
      var action = "Saved"

      if (this.claimId && !this.copyMode) {
        dcKey = this.claimId;
        apiUrl = ClaimApi.updateClaimUrl
        action = "updated"
      }
      var cardHolderAdminCm = [];
      if (this.claimMessageComponent != undefined || this.claimMessageComponent != null || this.claimMessageComponent != "") {
        if (this.claimMessageComponent && this.claimMessageComponent.claimCommentjson) {
          for (var i = 0; i < this.claimMessageComponent.claimCommentjson.length; i++) {
            var commentImportance
            if (this.claimMessageComponent.claimCommentjson[i].companyImportance) {
              commentImportance = 'Y'
            } else {
              commentImportance = 'N'
            }
            cardHolderAdminCm.push({
              'userId': +userId, 'claimCoTxt': this.claimMessageComponent.claimCommentjson[i].claimCoTxt,
              'claimImportance': this.claimMessageComponent.claimCommentjson[i].claimImportance,
              'userGroupKey': this.claimMessageComponent.claimCommentjson[i].userGroupKey
            });
          }
        }
      } else {
        cardHolderAdminCm = [];
      }

      let claimItems
      if (this.claimItemComponent != undefined || this.claimItemComponent != null || this.claimItemComponent != "") {
        if (this.claimItemComponent && this.claimItemComponent.claimItemRequest) {
          claimItems = this.claimItemComponent.claimItemRequest
        }
      }
      submitData = {}
      let vall = $("#claimType").val();
      if (vall) {
        let val = this.generalInformationComponent.SelectedClaimType(vall)
      }
      submitData[submitType] = {
        "claimKey": +dcKey,
        "claimTypeKey": (+this.selectedClaimTypeKey ? +this.selectedClaimTypeKey : this.selectedClaimType),//this.FormGroup.value.ClaimGeneralInformationFormGroup.type,
        "provBillingAddressKey": this.FormGroup.value.ClaimServiceProvidersFormGroup.payToAddress,
        "cardholderKey": this.FormGroup.value.ClaimCardHolderFormGroup.cardHolder,
        "payeeTypeKey": (+this.selectedPayeeTypeKey ? +this.selectedPayeeTypeKey : this.selectedPayeeType),
        "receivedOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.receive_date),
        "provSpecAssgnKey": this.dentProvSpecAssgnKey,
        "userId": +userId,
        "comments": cardHolderAdminCm,
        'pendingPaperWork': this.PendingPaperWork == 'T' ? 'T' : 'F',
        'ignoreExtraBenefit': this.IgnoreExtraBenefit == 'T' ? 'T' : 'F',
        'payOtherName': this.FormGroup.value.ClaimPayToOtherFormGroup.payeeName,
        'payOtherL1MailAdd': this.FormGroup.value.ClaimPayToOtherFormGroup.addressLine1,
        'payOtherL2MailAdd': this.FormGroup.value.ClaimPayToOtherFormGroup.addressLine2,
        'postalCodeString': this.FormGroup.value.ClaimPayToOtherFormGroup.postalCode,
        'cityName': this.FormGroup.value.ClaimPayToOtherFormGroup.city,
        'provinceName': this.FormGroup.value.ClaimPayToOtherFormGroup.province,
        'countryName': this.FormGroup.value.ClaimPayToOtherFormGroup.country,
        'referenceNumber': this.FormGroup.value.ClaimGeneralInformationFormGroup.reference,
        'bussinessType': this.FormGroup.value.ClaimCardHolderFormGroup.bussinesType,
        'claimAuthEbInd': this.authorizedEb == 'T' ? 'T' : 'F',
      }
      /** Below code modified for issue 690 */
      claimItems.map(claimItem => {
        Object.assign(claimItem, { cdEligibilityKey: this.reversCdEligibilityKey || '' })
      })

      if (this.addMode) {
        if (this.FormGroup.value.ClaimGeneralInformationFormGroup.type == "Eligibility Inquiry") {
          submitData[submitType]["items"] = claimItems;
        } else {
          if (claimItems.length < 1) {
            let allowAdjudicate = false;
            this.itemEditMode = false
            this.toastrService.error(this.translate.instant('Please Add Atleast One Claim Item!'));
            $('.dataTables_processing').hide();
            return false
          }
          submitData[submitType]["items"] = claimItems
        }
      }

      if (this.FormGroup.value.ClaimCardHolderFormGroup.bussinesType == Constants.albertaBusinessTypeCd) {
        submitData[submitType]["personDtOfBirth"] = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.dob)
      }
      if (this.addMode && this.FormGroup.value.ClaimGeneralInformationFormGroup.fileRefVal) {
        submitData[submitType]["fileReference"] = this.FormGroup.value.ClaimGeneralInformationFormGroup.fileRefVal
        this.hasFileRef = true
      }
      if (this.claimId && !this.copyMode) {
        submitData[submitType]["comments"] = []
      }
   
      this.hmsDataServiceService.postApi(apiUrl, submitData).subscribe(data => {
        $('.dataTables_processing').hide();
        let allowAdjudicate = false;
        this.itemEditMode = false

        if (data.code == 200 && data.status === "OK") {
          this.savedClaimData = data.result;
          this.claimStatus = data.result.status;
          let claimData = data.result[submitType]

          dcKey = claimData.claimKey
          this.disciplineKey = claimData.disciplineKey
          this.InitSearchClaimAdd = true;
          this.InitSearchClaimAddString = "true";

          if (adjudicate != "withAdjudicate") {

            this.toastrService.success('Claim ' + action + '  Successfully!')
            //Added for log 819 
            if (this.closeOrResetClaim == 1) {
              window.close();
            } else if (this.closeOrResetClaim == 2) {
              if (action == "Saved") {
                this.resetClaimForm();
              } else {
                this.router.navigate(['/claim']);
              }
            } else {
              this.router.navigate(['/claim/view/' + dcKey + '/type/' + this.disciplineKey], { queryParams: { saveClaim: this.InitSearchClaimAddString } })
              this.enableViewMode();
            }            
          } else {
            this.viewModeAdjudicate(dcKey, this.disciplineKey, 0)
          }
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "HSA_CLAIM_CANNOT_PAY_TO_PROVIDER") {
          this.toastrService.error("Cannot Pay Supplemental Claim To Proider")
        }
        else if (data.code == 400 && data.result == "Cannot pay a fake provider" && data.status == "BAD_REQUEST") {
          this.toastrService.error(data.result)
        }
        else if (data.code == 400 && data.status == "BAD_REQUEST" && adjudicate == "withAdjudicate") {       
        this.toastrService.error(data.result || "Something went wrong please try again");
        } else if (data.code == 400 && data.result == "Can only release APPROVED claims" && data.status == "BAD_REQUEST") {
          this.toastrService.error(data.result)
        } else {
          let res = data.result || "Something went wrong please try again"
          this.addMode ? this.toastrService.error(res) : this.toastrService.error(res)
        }
        error => {
          this.addMode ? this.toastrService.error("Claim Details Are Not Added Successfully") : this.toastrService.error("Claim Details Are Not Updated Successfully")
        }
      });

    }
    else {
      this.itemEditMode = false
      $('.dataTables_processing').hide();
      this.validateAllFormFields(this.FormGroup);
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
    
  }

  viewModeAdjudicate(dcKey, disciplineKey, cSfK) {
    this.itemEditMode = true
    this.sendAdjudicate = true
    this.adjudicatedPercent = 20
    var type = disciplineKey
    let submitType = ""
    submitType = this.claimService.getSubmitParam(type)
    let busnsTypeCD = this.FormGroup.value.ClaimCardHolderFormGroup.bussinesType
    let submitInfo = {
      "businessTypeCd": busnsTypeCD,
      "cardholderKey": this.FormGroup.value.ClaimCardHolderFormGroup.cardHolder,
      "dtOfBirth": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.dob)
    }
    let claimKey = dcKey ? dcKey : this.claimId

    submitInfo[submitType] = {
      "claimKey": claimKey,
    }
    this.savedClaimKey = claimKey
    this.sendClaimAdjudication(submitInfo, submitType, dcKey, cSfK)
    this.savedDesciplineKey = disciplineKey
  }

  sendClaimAdjudication(submitInfo, submitType, dcKey, cSfK) {
    $('.dataTables_processing').show();

    this.hmsDataServiceService.postApi(ClaimApi.adjudicateClaim, submitInfo).subscribe(data => {
      this.hmsDataServiceService.OpenCloseModal('adjudicate-btn')
      this.sendAdjudicate = false;
      this.itemEditMode = false
      $('.dataTables_processing').hide();
      if (data.code == 200 && data.status === "OK") {
        this.updateScannedClaimFileProcessInitiated(submitType, dcKey, cSfK)
        this.InitSearchClaimAddString = "true"
        this.getAjdudicateStatus(data.hmsMessage.messageShort, data.result);
        this.claimItemComponent.reloadClaimItems();
        this.getFileViewPath(this.savedClaimKey)
      } else if (data.code == 400 && data.status === "BAD_REQUEST") {
        this.updateScannedClaimFileProcessInitiated(submitType, dcKey, cSfK)
        this.adjudicatedPercent = 0
        this.getAjdudicateStatus(data.hmsMessage.messageShort, data.result)
      } else if (data.code == 404 && data.status === "NOT_FOUND") {
        this.adjudicatedPercent = 0
        this.getAjdudicateStatus(data.hmsMessage.messageShort, data.result)
      } else if (data.code == 403 && data.status === "FORBIDDEN") {
        this.adjudicatedPercent = 0
        this.getAjdudicateStatus(data.hmsMessage.messageShort, data.result)
      } else {
        this.adjudicatedPercent = 0
      }
      this.claimMessageComponent.getSystemMessages()
    });
  }

  getAjdudicateStatus(status, message) {
    this.adjudicatedStatus = status
    if (this.adjudicatedStatus == "CLAIM_IS_AJUDICATED") {
      this.adjudicatedPercent = 100
      this.adjudicatedMessage = "Claim is now adjudicated and approved."
    } else if (this.adjudicatedStatus == "CANNOT_ADJUDICATE_PAID_CLAIM") {
      this.adjudicatedMessage = "Paid Claim Cannot be Adjudicated"
    } else if (this.adjudicatedStatus == "CLAIM_NOT_FOUND") {
      this.adjudicatedMessage = "Claim Not Found"
    } else if (this.adjudicatedStatus == "CLAIM_IS_NOT_RELEASED") {
      this.adjudicatedMessage = message
    } else if (this.adjudicatedStatus == "CLAIM_IS_NOT_AJUDICATED") {
      if (message) {
        this.adjudicatedMessage = message
      } else {
        this.adjudicatedMessage = "Claim Is Not Adjudicated For Some Reason!!"
      }
    } else if (this.adjudicatedStatus == "DOB_DOES_NOT_EXIST") {
      this.adjudicatedMessage = "Claim is now adjudicated and rejected because CardHolder Entered DOB doesn't Exist in system"
    } else {
      this.adjudicatedMessage = "Claim is now adjudicated and rejected because <span> Based on Client's eligibility the service is payable at 0 percent of the allowed amount</span>"
    }
    setTimeout(() => {
      document.getElementById('btnCloseAdjudicateModal').focus();
    }, 400);

  }

  fillClaimDetails(claimId, type) {
    var submitData = {}
    let submitType = this.claimService.getSubmitParam(type)
    submitData[submitType] = {
      "claimKey": claimId,
      "userId": localStorage.getItem('id')
    }
    this.hmsDataServiceService.postApi(ClaimApi.getClaimDetailsUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.key = data.result[submitType].businessTypeKey;
        let sta = data.result[submitType].status;
        this.claimService.claimBussinessKey.emit(this.key)
        
        /** Start For 439 Issue */
        this.claimDataArr = data.result
        /** End For 439 Issue */

        this.serviceProvidersComponent.validlicenseNo = true
        this.cardBusinessType = data.result.bussinessType
        this.cardBusinessTypeKey = data.result.businessTypeKey
        let bussinessType = data.result.businessTypeKey
        if (bussinessType == Constants.albertaBusnsTypeKey) {
          this.albertaCard = true
        } else {
          this.albertaCard = false
        }
        this.claimCompanyId = data.result.companyId
        this.claimReferralInd = data.result.claimReferralInd
        this.claimReferralAccess = data.result.claimReferralAccess
        if (this.claimReferralAccess == "F" && this.claimReferralInd == 'T') {
          this.claimRefered = true
          this.referToName = data.result.referToName;
        } else {
          this.claimRefered = false
          this.referToName = "";
        }

        let claimData = data.result[submitType]
        this.selectedClaimType = claimData.claimTypeKey
        this.selectedPayeeType = claimData.payeeTypeKey
        if (data.result.commentFlag == 'Y') {
          this.claimCommentImportance = true
        } else {
          this.claimCommentImportance = false
        }
       
        // checks before 21 feb 
        if (data.result.commentText != "" && data.result.commentText != null) {
          this.commentText = data.result.commentText
          this.commentList = data.result.cardCommentsDtoList
        }

        this.reviewStatus = data.result.claimReviewStatusDesc

        if (this.reviewStatus == "APPROVED" || this.reviewStatus == "PARTIALLY APPROVED" || this.reviewStatus == "DENIED") {
          this.showGovBtn = true
        }
        data.result.claimReviewGovStatusDesc ? this.finalReviewStatus = data.result.claimReviewGovStatusDesc : this.finalReviewStatus = data.result.claimReviewStatusDesc
        this.finalReviewStatus == "SEND FOR GOV" ? this.finalReviewStatus = "SEND TO GOV" : this.finalReviewStatus = this.finalReviewStatus
        data.result.claimReviewDoctor == "T" ? this.disableDctrBtn = true : this.disableDctrBtn = false

        if (data.result.claimReviewDoctor == "T" || data.result.claimReviewByReviewer == "T") {
          this.disableDctrBtn = true
        }
        if (this.userRole == "referReviwer") {

          data.result.claimReviewDoctor == "F" ? this.disablSendDocbtn = false : this.disablSendDocbtn = true
        } else {
          data.result.claimReviewByReviewer == "F" ? this.disablSendDocbtn = false : this.disablSendDocbtn = true
        }
        data.result.claimReviewGov == "F" ? this.disableGovBtn = false : this.disableGovBtn = true // log 757 button disable in send for review as per discussion by backend (ashwani and arun sir)

        if (this.userRole == "referReviwer" && data.result.claimReviewStatusCd == 'AI' && (data.result.claimReviewByReviewer == "T" || data.result.claimReviewDoctor == "T")) {
          this.disablSendDocbtn = true;
        }

        if ((this.userRole == "reviewer" || this.userRole == "") && (data.result.claimReviewStatusCd == 'AI' || data.result.claimReviewStatusCd == 'A' || data.result.claimReviewStatusCd == 'D' || data.result.claimReviewStatusCd == 'PI') && data.result.claimReviewDoctor == "T") {
          this.disableDctrBtn = false
        }
        if ((data.result.claimReviewByReviewer == "F" && data.result.claimReviewDoctor == "T") && this.userRole == '') {
          this.disablSendDocbtn = false;
          this.disableDctrBtn = true;
        }
        if (this.userRole == 'referReviwer' && (data.result.claimReviewByReviewer == "T" && data.result.claimReviewDoctor == "F")) {
          this.disableDctrBtn = false;
          this.disablSendDocbtn = false
        }

        if (data.result.claimReviewByReviewer == "F" && data.result.claimReviewDoctor == "F") {

          if (this.userRole != "")
            this.disablSendDocbtn = true;
        }
        if ((data.result.claimReviewStatusCd == 'D' || data.result.claimReviewStatusCd == 'A') && this.userRole == '') {
          this.disableDctrBtn = true;
          this.disablSendDocbtn = true;
          this.disableReviewButon = true;
        }
        // checks before 21 feb

        this.PendingPaperWork = claimData.pendingPaperWork;
        this.IgnoreExtraBenefit = claimData.ignoreExtraBenefit
        this.authorizedEb = claimData.claimAuthEbInd
        this.cardKey = claimData.cardKey
        this.cardHolderComponent.getCardHolderList(claimData.cardNumber, claimData.personDtOfBirth, claimData.cardholderKey, claimData.cardKey, claimData.provSpecAssgnKey, claimData.receivedOn, claimData.claimKey)
        let item = {
          "licenseNo": claimData.licenseNumber,
          "disciplineKey": claimData.disciplineKey,
          "payToAddress": claimData.provBillingAddressKey,
          "postalCd": claimData.provPostalCode,
        }
        this.cardHolderKey = claimData.cardholderKey;
        this.claimService.getCardHolderKeyComment.emit(this.cardHolderKey);
        this.claimMessageComponent.getAllCommentsData(claimData.cardholderKey, claimData.provKey)
        this.getCardCommentsText(this.cardKey);
        this.getCardHolderCommentText(claimData.cardholderKey);
        this.serviceProvidersComponent.setValueForServiceProvider(item)
        this.claimStatus = claimData.status;
        this.claimService.claimStatus.emit(this.claimStatus)

        
        claimData.releaseInd == 'T' ? this.claimReleased = "Claim Released On:" + " " + this.changeDateFormatService.formatDatetoMonthName(claimData.releaseOn) : this.claimReleased = undefined
        /** 439 Issue */
        claimData.releaseInd == "T" ? this.releaseBtnTxt = "Unrelease" : this.releaseBtnTxt = "Release";
        /** End */
     
        //Added for 819
        this.releaseInd = claimData.releaseInd;

        this.CH_RecievedDate = claimData.receivedOn;
        this.showPreAuth(claimData.claimTypeCd)
        this.showPreAuthReview(claimData.claimTypeCd)
        this.disciplineCD = this.claimService.disciplineConversion(claimData.disciplineName)
        this.payeeTypeDesc = claimData.payeeTypeDesc
        this.cardNumber = claimData.cardNumber
        this.ltrDateOfBirth = claimData.personDtOfBirth
        if (claimData.claimTypeCd == "A" || claimData.claimTypeCd == "U") {
          this.claimTypes = true
          this.claimService.getclaimTypeCd.emit(claimData.claimTypeCd)
        }
        else if (claimData.claimTypeCd == "V") {
          this.claimTypes = true
          this.claimService.getclaimTypeCd.emit(claimData.claimTypeCd)
        }

        // filter checking clame type  for ReferToReview btn
        let validTypes = ["Paper"]
        let validType = false;
        let calmeTypeValid = validTypes.filter(val => val === claimData.claimType).map(data => data)
        if (calmeTypeValid.length) {
          validType = true;
        }

        // filter checking clame Status  for ReferToReview btn
        let validStatus = ["Pending"]
        let Status = false;
        let calmeStatusValid = validStatus.filter(val => val === claimData.status).map(data => data)
        if (calmeStatusValid.length) {
          Status = true;
        }

        // filter checking clame Bussiness Type  for ReferToReview btn
        let validBussinessType = ["AB Gov."]
        let BussinessTypeStatus = false;
        let BussinessTypeValid = validBussinessType.filter(val => val === data.result.bussinessType).map(data => data)
        if (BussinessTypeValid.length) {

          BussinessTypeStatus = true;
        }

        if (validType && Status && BussinessTypeStatus) {
          this.ReferToReviewBtn = true;
        }

        let editData = {
          ClaimCardHolderFormGroup: {
            receive_date: this.changeDateFormatService.convertStringDateToObject(claimData.receivedOn),
            cardId: claimData.cardNumber,
            cardHolder: claimData.cardholderKey,
            address: claimData.cardFullAddress,
            dob: this.changeDateFormatService.convertStringDateToObject(claimData.personDtOfBirth),
          },
          ClaimGeneralInformationFormGroup: {
            claimType: type,
            entry_date: this.changeDateFormatService.convertStringDateToObject(claimData.entryDate),
            type: claimData.claimType,//claimTypeKey,
            cat: claimData.claimCategoryCd, //add for #1206
            operator: claimData.operator,
            reference: claimData.refId,
            userId: claimData.modifiedByUser,
            modified_date: this.changeDateFormatService.formatDatetoMonthName(claimData.modifiedDate)
          },
          ClaimServiceProvidersFormGroup: {
            licenseNumber: claimData.licenseNumber,
            providerName: claimData.providerName,
            payToAddress: claimData.provBillingAddressKey, // TBD
            payee: claimData.payeeTypeKey,//payeeTypeKey,
            postalCd: claimData.provPostalCode
          },
          ClaimTotalFormGroup: {
            Claimed: CustomValidators.ConvertAmountToDecimal(claimData.totalClaimedAmount).toString(),
            Allowed: CustomValidators.ConvertAmountToDecimal(claimData.totalAllowedAmount).toString(),
            Carrier: CustomValidators.ConvertAmountToDecimal(claimData.totalCarrierAmount).toString(),
            NotCovered: CustomValidators.ConvertAmountToDecimal(claimData.totalNotCoveredAmount).toString(),
            Deductible: CustomValidators.ConvertAmountToDecimal(claimData.totalDeductibleAmount).toString(),
            Payable: CustomValidators.ConvertAmountToDecimal(claimData.totalPayableAmount).toString(),
            IgnoreExtraBenefits: claimData.ignoreExtraBenefit,
            PendingPaperWork: claimData.pendingPaperWork,
            ReferenceNumber: claimData.refId,
            authorizedEb: claimData.claimAuthEbInd
          },
          ClaimPayToOtherFormGroup: {
            payeeName: claimData.payOtherName,
            postalCode: claimData.postalCodeString,
            city: claimData.cityName,
            province: claimData.provinceName,
            country: claimData.countryName,
            addressLine1: claimData.payOtherL1MailAdd,
            addressLine2: claimData.payOtherL2MailAdd,
          }
        }
        if (claimData.payeeTypeKey == 3) {
          this.claimService.payToOther.emit(parseInt(claimData.payeeTypeKey))
        }
        this.FormGroup.patchValue(editData);

        this.reverseClaimGeneralInformationFormGroup.patchValue({
          reverseClaimDiscipline: claimData.disciplineName,
          reverseClaimEntryDate: claimData.entryDate,
          reverseClaimType: claimData.claimType,//claimTypeKey,
          reverseClaimOperator: claimData.operator,
          reverseClaimReference: claimData.refId,
          reverseClaimUserId: claimData.modifiedByUser,
          reverseClaimModified_date: claimData.modifiedDate
        })
        this.reverseClaimGeneralInformationFormGroup.disable()
        this.referClaimGenralInfo = editData.ClaimGeneralInformationFormGroup
        this.referClaimGenralInfo['entryDate'] = this.changeDateFormatService.formatDatetoMonthName(claimData.entryDate)
        this.claimService.getRecieveDate.emit(editData.ClaimCardHolderFormGroup.receive_date)
        this.claimService.getTotalsValues.emit(editData);
        this.descipline_type = type
        this.selectedPayee = claimData.payeeTypeKey
        let ModifiedData = {
          ClaimCardHolderFormGroup: {
            cardHolder: claimData.cardholderKey,
            dob: this.changeDateFormatService.convertStringDateToObject(claimData.personDtOfBirth),
          },
          ClaimServiceProvidersFormGroup: {
            licenseNumber: claimData.licenseNumber,
            providerName: claimData.providerName,
          }
        }
        this.FormGroup.patchValue(ModifiedData);
        if (claimData.licenseNumber && this.copyMode) {
          this.serviceProvidersComponent.getReferenceNumber()
        }
      }

      if (this.copyMode) {
        this.FormGroup.patchValue({
          ClaimGeneralInformationFormGroup: {
            'reference': "",
            'type': 'Paper' // numeric value 17 causing issue to client
          }
        });
      }

    })
    this.claimMessageComponent.getSystemMessages()
  }
  // add destroy value after subscribe
  ngOnDestroy(){
    if (this.claimItemValue) {
      this.claimItemValue.unsubscribe();
    } 
  }

  enableViewMode() {
    var claimId
    var type
    this.route.params.subscribe((params: Params) => {
      this.claimId = params['id']
      claimId = params['id']
      type = params['type']
      this.disciplineKey = type;
      this.fillClaimDetails(claimId, type)
    });
    this.buttonText = "Edit";
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false;
    this.cardHeading = "View"

    this.FormGroup.disable();
    this.claimService.updateButtonValueForTotals.emit(this.viewMode);
    if (this.enableEditModeFromAddNewButton == false) {
      this.enableEditModeFromAddNewButton = false;
    }
    else if (this.enableEditModeFromAddNewButton == true) {
      this.enableEditModeFromAddNewButton = true;
    }
  }

  enableEditMode(event) {
    // Log #1232: Stop getLockProcessor API calling when same claim comes in second time
    let key
    this.route.params.subscribe((params: Params) => {
      key = params['id']
    }); 
    // let prevLockProcessorKey = localStorage.getItem('lockProcessorKey')
    // if (prevLockProcessorKey != key ) {
    //   this.getLockProcessor() // Calling Lock Processor API in edit mode and removd from view mode
    // }
    // localStorage.setItem('lockProcessorKey', key)
    const processorKey = localStorage.getItem('lockProcessorKey')
    if (processorKey == null || processorKey == undefined) {
      if (this.claimService.claimKeyData > 0 ) {
        let id = this.claimService.claimKeyData.findIndex(x => x == key)
        if (id == -1) {
          this.claimService.getClaimKeyData(key)
          this.getLockProcessor()
        }
      } else {
        this.claimService.getClaimKeyData(key)
        this.getLockProcessor()
      }
      const stringifiedProcessorKey = JSON.stringify(this.claimService.claimKeyData)
      localStorage.setItem("lockProcessorKey",stringifiedProcessorKey)
    } else {
      const processorKeyParsed = JSON.parse(processorKey)
      if (processorKeyParsed.length > 0) {
        let index = processorKeyParsed.findIndex(x => x == key)
        if (index == -1) {
          processorKeyParsed.push(key)
          this.claimService.claimKeyData = processorKeyParsed
          this.getLockProcessor()
          const stringifiedProcessorKey = JSON.stringify(this.claimService.claimKeyData)
          localStorage.setItem("lockProcessorKey",stringifiedProcessorKey)
        }
      }
    }
    let attrId: any;
    attrId = event.target.attributes.class.value;
    if (this.claimStatus == 'Paid') {
      this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-canot'))
      return false
    }
    if (this.claimStatus == 'Reversed') {
      this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-canot'))
      return false
    }
    if (this.claimRefered == true) {
      this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-refer'))
      return false
    }
    if (this.disciplineKey == 1) {
      if (this.disablSendDocbtn && this.userRole != 'referReviwer') {
       
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-underreview'))
        return false
      }
      if (this.userRole != '') {
        if (this.disableDctrBtn || this.disablSendDocbtn) {       
          this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-underreview'))
          return false
        }
      }
      if (this.disableGovBtn && this.finalReviewStatus == "SEND TO GOV") {      
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-underreview'))
        return false
      }
    }

    if (attrId == 'btn green-btn btn-lg' || attrId == 'btn green-btn btn-lg ng-star-inserted') {
      if (this.claimStatus == 'Paid') {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-canot'))
        return false
      } else if (this.claimStatus == 'Reversed') {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-canot'))
        return false
      } else if (this.claimReferralAccess == "F" && this.claimReferralInd == 'T') {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-refer'))
        return false
      } else if (this.disablSendDocbtn && this.disciplineKey == 1) {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-underreview'))
        return false
      } else if (this.disableGovBtn && this.finalReviewStatus == "SEND TO GOV") {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-underreview'))
        return false
      } else {
        this.claimItemComponent.editClaimIteam();
      }
    }

    this.FormGroup.enable();
    this.buttonText = "Update";
    this.viewMode = false;
    this.addMode = false;
    this.editMode = true;
    this.cardHeading = "Edit"

    this.disableFormFields()
    this.serviceProvidersComponent.setValidatorsForPayee(this.selectedPayee)
    this.claimService.updateButtonValueForTotals.emit(this.viewMode);
    this.cardHolderComponent.enableEditMode(true);
    var self = this
    if (this.editMode == true && this.enableEditModeFromAddNewButton == true) {
      self.claimService.focusOutPaytoAddrEditMode.emit(true)
    } else {
      self.claimService.focusOutPaytoAddrEditMode.emit(false)
    }
    $(window).scroll(function () {
      if ($(window).scrollTop() + $(window).height() == $(document).height()) {
      }
    });

  }

  disableFormFields() {
    this.FormGroup.controls.ClaimGeneralInformationFormGroup.get('entry_date').disable()
    this.FormGroup.controls.ClaimGeneralInformationFormGroup.get('operator').disable()
    this.FormGroup.controls.ClaimGeneralInformationFormGroup.get('reference').disable()
    this.FormGroup.controls.ClaimGeneralInformationFormGroup.get('userId').disable()
    this.FormGroup.controls.ClaimGeneralInformationFormGroup.get('modified_date').disable()
    this.claimCompanyId == "01" ? this.FormGroup.controls.ClaimServiceProvidersFormGroup.get('payee').disable() :
      this.FormGroup.controls.ClaimServiceProvidersFormGroup.get('payee').enable()
    this.FormGroup.patchValue({
      ClaimGeneralInformationFormGroup: {
        'claimType': this.descipline_type
      }
    });
  
  }

  openReferClaim() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    this.openReferClaimModal = true
    this.getUserList()
    this.cardholderName = (this.cardHolderComponent.cardHolder && this.cardHolderComponent.cardHolder.length > 0) ? this.cardHolderComponent.cardHolder[0].personFirstName + ' ' + this.cardHolderComponent.cardHolder[0].personLastName + '-' + this.changeDateFormatService.formatDatetoMonthName(this.cardHolderComponent.cardHolder[0].personDtOfBirth) : '';
  }

  ReferSuccess() {
    if (this.referClaim.valid) {
      this.exDialog.openConfirm("Do you want to tag this claim for referral ?").subscribe((value) => {
        if (value) {
          var type
          var claimId
          this.route.params.subscribe((params: Params) => {
            claimId = params['id']
            type = params['type']
          });
          let submitData = {
            "claimKey": +claimId,
            "referTo": this.referClaim.value.rfrClmUser,
            "referBy": +this.UserID,
            "claimReferralInd": "T",
            "businessTypeKey": this.cardBusinessTypeKey,
            "disciplineKey": +type,
            "referComment": this.referClaim.value.rfrClaimCommentTxt,
            "supervisorKey": this.supervisorKey,
          }
          this.hmsDataServiceService.postApi(ClaimApi.referClaim, submitData).subscribe(data => {
            if (data.code == 200 && data.status == "OK") {
              this.toastrService.success(this.translate.instant('Claim Referred Successfully.'))
              this.hmsDataServiceService.OpenCloseModal('CloseReferClaim')
              this.referClaim.value.rfrClaimCommentTxt = '';
              this.referClaim.reset();
              this.enableViewMode()
              if (type == 1) {
                this.claimItemComponent.claimItemDentalComponent.CancelInfo(0, this.claimItemComponent.claimItemDentalComponent.arrClaimItems[0], 0)
              }
              else {
                this.claimItemComponent.claimItemVisionComponent.CancelInfo(0, this.claimItemComponent.claimItemVisionComponent.arrClaimItems[0], 0)
              }
            } else {
              this.toastrService.error('Claim Not Referred Successfully.')
            }
          })
        }
      })      
    } else {
      this.validateAllFormFields(this.referClaim);
    }
  }

  closeRefer() {
    this.referClaim.value.rfrClaimCommentTxt = '';
    this.referClaim.value.rfrClmUser.reset;
    this.referClaim.reset();
  }

  getUserList() {
    let submitInfo = {
      'businessTypeKey': this.cardBusinessTypeKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getUserList, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.userList = data.result
      } else {
        this.userList = []
      }
    })
  }

  print(formId): void {
    let printContents, popupWin, reff;
    reff = this.ltrReference
    printContents = document.getElementById(formId).innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <html>
    <head>
    <style>
      @page { size: auto;  margin: 2mm; }
    </style>
    </head>
    <body onload="window.print();window.close()">${printContents}</body>
    <footer>
      <p>Reference Number:${reff}</p>
    </footer>
    </html>`
    );
    popupWin.document.close();
  }

  fillDetailsForPrint() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    let submitData = {
      "disciplineKey": this.disciplineKey,
      "claimKey": this.claimId,
      "userId": this.UserID,  
      "receivedOn": this.CH_RecievedDate
    }
    this.hmsDataServiceService.postApi(ClaimApi.DetailsForPrintalberta, submitData).subscribe(data => {
      this.albertaCard ? this.imgUrl = location.origin + '/assets/images/alberta-logo-print.png' : this.imgUrl = location.origin + '/assets/images/quikcardImage6.png'
      if (data.code == 200 && data.status === "OK") {
        this.providerId = data.result.licenseNumber
        this.patient = data.result.name
        this.address = data.result.cardFullAddress;
        this.provider = data.result.providerName;
        this.providerAddress = data.result.provBillingFullAddress;
        this.providerLttrAdrs = this.providerAddress.split(",");
        this.ltrReference = data.result.refId
        this.ltrPatientName = data.result.name
        this.ltrCrdNum = this.cardNumber
        // log 681 array merge providerDetails & providerTotals
        this.providerDetails = [
          {
            'EntryDate': data.result.entryDate,
            'ClaimType': data.result.claimType,
            'Claimstatus': data.result.status,
            'Reference': data.result.refId,
            'RecievedDate': this.CH_RecievedDate,
            'Payee': data.result.payeeTypeName,
            'OperatorID': data.result.operator,
            'ClaimTotal': data.result.totalClaimedAmount,
            'AllowedTotal': data.result.totalAllowedAmount,
            'PaidCarrier': data.result.totalCarrierAmount,
            'NotCovered': data.result.totalNotCoveredAmount,
            'Deductible': data.result.totalDeductibleAmount,
            'TotalPayable': data.result.totalPayableAmount,
          }]
        this.providerTotals = [
          {
            'ClaimTotal': data.result.totalClaimedAmount,
            'AllowedTotal': data.result.totalAllowedAmount,
            'PaidCarrier': data.result.totalCarrierAmount,
            'NotCovered': data.result.totalNotCoveredAmount,
            'Deductible': data.result.totalDeductibleAmount,
            'TotalPayable': data.result.totalPayableAmount,
          }
        ]
        this.serviceData = data.result.items
        this.systemMessageData = data.result.systemMessage
        this.printCovrage = data.result.coverages
        this.printFormulas = data.result.formulas
        let isDasp = this.claimCompanyId == '08' ? "T" : "F"
        this.daspContent = isDasp == "T" ? "DASP" : "Program" // add percent for dasp pending from API
        let dentalEx = isDasp == "T" ? "Dental Exceptions" : "The Review Committee"
        let terminate = isDasp == "T" ? "terminate." : "change or terminate."
        if (this.reviewStatus == "APPROVED") {
          this.ltrContntLine1 = dentalEx + "has reviewed the attached treatment plan on " + this.ltrDate + " for the above noted client.  This treatment plan has been approved."
          this.ltrContntLine2 = "This approval will be valid for one year from the date of this letter providing coverage does not " + terminate
          this.ltrContntLine3 = ""
        }
        if (this.reviewStatus == "PARTIALLY APPROVED") {
          this.ltrContntLine1 = dentalEx + " has reviewed the attached treatment plan on " + this.ltrDate + " for the above noted client. The approved items will be valid for one year from the date of the attached treatment plan providing coverage does not " + terminate
          this.ltrContntLine2 = data.result.reviewAdditonalInfo
          this.ltrContntLine4 = "The denied items have been denied for the following reason:"
          this.ltrContntLine3 = data.result.reviewExtrenalComment
        }
        if (this.reviewStatus == "DENIED") {
          this.ltrContntLine1 = dentalEx + "has reviewed the attached treatment plan on " + this.ltrDate + " for the above noted client.  This treatment plan has been denied for the following reason:"
          this.ltrContntLine2 = data.result.reviewAdditonalInfo
          this.ltrContntLine3 = data.result.reviewExtrenalComment
        }
      }
    });
  }

  // Added Close button as per Log#819 
  test_closeClaim() {
    let is_from_cardholder = "F"
    this.route.queryParams.subscribe(params => {
      if (params['redirect'] == "cardholder") {
        let id = localStorage.getItem('_cardId');
        window.location.href = 'card/view/' + id + '?activecard=T';
      }
    })
  }

  closeClaim() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    let is_from_init = "F";
    let isSaved = false;
    let is_from_cardholder = "F"
    let is_from_searched = "F"
    let isFromDashboard = ''
    this.route.queryParams.subscribe(params => {
    
      if (this.viewMode) {
        isSaved = true
      }
      if (this.editMode) {
        isSaved = true
      }
      //Add for log 819  closing window when open from initialClaim from cardholder
      if (params['iniClaim']) {
        is_from_init = params['iniClaim'];
      }
      if (params['saveClaim']) {
        isSaved = params['saveClaim'];
      }
      if (params['redirect'] == "cardholder") {
        is_from_cardholder = "T"
      }
      if (params['searched'] == "T") {
        is_from_searched = "T"
      }
      // Close button functionality for Intiate Claim from Quikcard/ADSC dashboard as per Arun sir
      if (params['isAdDash']) {
        isFromDashboard = params['isAdDash']
      }
    })

    if (!isSaved) {
      this.exDialog.openConfirm({
        actionButtonLabel: "Yes",
        closeButtonLabel: "No",
        message: this.translate.instant('claims.claims-toaster.save-record'), closeByClickOutside: false
      }).subscribe((value) => {
        this.closeOrResetClaim = is_from_init == 'T' ? 1 : 2;
        if (!value) {

          if (is_from_init == 'T') {
            let url = "/card/view/" + this.queryParam.chCardKey + "?cardHolderKey=" + this.queryParam.cardHolderKey + "&unitKey=" + this.queryParam.unitKey;
            location.href = url

          }
          else if (is_from_cardholder == "T") {
            let id = localStorage.getItem('_cardId');
            window.location.href = 'card/view/' + id + '?activecard=T';
          } else if (is_from_searched == "T") {
            if (this.claimService.claimSearchedData) {
              this.claimService.isBackClaimSearch = true
            }
            this.router.navigate(['claim/searchClaim']);
          }
          else {
            if ((!this.claimId || this.claimId == 0)) {
              if (isFromDashboard != '') {
                if (isFromDashboard == 'true') {
                  this.currentUserService.dashboardType.emit('Adsc')
                  this.router.navigate(['/claimDashboard/alberta']);
                } else {
                  this.currentUserService.dashboardType.emit('Quik')
                  this.router.navigate(['/claimDashboard']);
                }
              } else {
                this.resetClaimForm();
              }
            } else {
              this.router.navigate(['/claim']);
            }

          }
        } else {
          if ((!this.claimId || this.claimId == 0)) {
            document.getElementById("btnSaveClaim").click();
          } else {
            if (!this.editMode) {
              if (is_from_init == 'T') {
                let url = "/card/view/" + this.queryParam.chCardKey + "?cardHolderKey=" + this.queryParam.cardHolderKey + "&unitKey=" + this.queryParam.unitKey;
                location.href = url
              } else if (is_from_cardholder == "T") {
                let id = localStorage.getItem('_cardId');                
                window.location.href = 'card/view/' + id + '?activecard=T';
              }
              else if (is_from_searched == "T") {
                if (this.claimService.claimSearchedData) {
                  this.claimService.isBackClaimSearch = true
                }
                this.router.navigate(['claim/searchClaim']);
              } else {
                this.router.navigate(['/claim']);
              }
            } else {
              document.getElementById("btnUpdateClaim").click();
            }
          }
        }
      });
    } else {
      if (is_from_init == 'T') {
        let url = "/card/view/" + this.queryParam.chCardKey + "?cardHolderKey=" + this.queryParam.cardHolderKey + "&unitKey=" + this.queryParam.unitKey;
        location.href = url
      }
      else if (is_from_cardholder == "T") {
        let id = localStorage.getItem('_cardId');
        window.location.href = 'card/view/' + id + '?activecard=T';
      } else if (is_from_searched == "T") {
        if (this.claimService.claimSearchedData) {
          this.claimService.isBackClaimSearch = true
        }
        this.router.navigate(['claim/searchClaim']);
      }
      else {
        // Close button should redirect to Dashboard Area when comes from Dashboard(As per Ticket #1213 reference)
        if (isFromDashboard != '') {
          if (isFromDashboard == 'true') {
            this.currentUserService.dashboardType.emit('Adsc')
            this.router.navigate(['/claimDashboard/alberta']);
          } else {
            this.currentUserService.dashboardType.emit('Quik')
            this.router.navigate(['/claimDashboard']);
          }
        } else {
          this.router.navigate(['/claim']);
        }
      }
    }
  }

  resetClaimForm() {
    this.FormGroup.reset();
    this.cardBusinessTypeKey = 1;
    this.resetForm = this.resetForm + 1;
    this.hasClaimItems = false;
    this.closeOrResetClaim = 0;
    this.FormGroup.patchValue({
      ClaimGeneralInformationFormGroup: {
        'cat': 'S'
      }
    })
    this.cardHolderComponent.patientPert = ''
    this.cardHolderComponent.showFlag = false
    this.cardHolderComponent.cardCommentText = ''
  }

  deleteClaim() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    var type
    this.route.params.subscribe((params: Params) => {
      type = params['type']
    })
    var submitData = {}
    let submitType = this.claimService.getSubmitParam(type)
    submitData[submitType] = {
      "claimKey": this.claimId
    }
    this.exDialog.openConfirm("Are you Sure You Want To Delete ? ").subscribe((value) => {
      if (value) {
        this.hmsDataServiceService.postApi(ClaimApi.deleteClaimUrl, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.InitSearch = false;
            this.toastrService.success("Record Deleted Successfully!")

            this.route.queryParams.subscribe(params => {
              //  log 817 
              let is_from_init = params['iniClaim'];
              let is_from_saveClaim = params['saveClaim']
              if (is_from_init == 'T') {
                let url = "/card/view/" + this.queryParam.chCardKey + "?cardHolderKey=" + this.queryParam.cardHolderKey + "&unitKey=" + this.queryParam.unitKey;
                location.href = url
              }
              else if (is_from_saveClaim == "true") { // 817 
                this.router.navigate(['/claim']);
                this.claimService.isClaimDeleted = true;
              }
              else {
                this.claimService.isBackClaimSearch = true
                this.router.navigate(['/claim/searchClaim']);
              }            
            })
          }
        });
      }
    })
  }

  //Make change in Method for log 833
  //Show Modal of duplicate list at time adjudiations
  //Adjudication process will start after continue button click on Modal
  adjudicateClaim() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    if (this.hasClaimItems) {
      let allowAdjudicate = true;
      if (!this.viewMode) {
        if (!this.FormGroup.controls.ClaimCardHolderFormGroup.valid) {
          allowAdjudicate = false;
        }
      }
      if (allowAdjudicate) { // log 683 invalid form data
        this.itemEditMode = true
        this.claimItemComponent.enableAdj().then(row => {
          //Add for log 833
          if (this.FormGroup.value.ClaimCardHolderFormGroup.bussinesType == 'Q') {
            let claimItems = [];
            if (this.disciplineKey == 1) {
              claimItems = this.claimItemComponent.claimItemDentalComponent.arrClaimItems;
            } else {
              claimItems = this.claimItemComponent.claimItemVisionComponent.arrClaimItems;
            }
            var claimItemRequest = [];
            for (let i = 0; i < claimItems.length; i++) {
              const data = {
                procCode: claimItems[i].pro,
                serviceDate: (claimItems[i].date + "").match(".*[a-zA-Z]+.*") ? this.changeDateFormatService.formatDate(claimItems[i].date) : claimItems[i].date
              }
              claimItemRequest.push(data);
            }
            let claimKey = this.claimId ? this.claimId : 0;
            if (this.copyMode) {
              claimKey = 0
            }
            const submitData = {
              disciplineKey: this.disciplineKey,
              cardholderkey: this.FormGroup.value.ClaimCardHolderFormGroup.cardHolder,
              claimKey: claimKey,
              claimItem: claimItemRequest
            }
            $('.dataTables_processing').show();
            this.submitClaimForm("withAdjudicate")
          } else {
            $('.dataTables_processing').show();
            this.submitClaimForm("withAdjudicate")
          }
        });
      } else {
        this.itemEditMode = false
        this.toastrService.warning("Please Enter Valid Data")
      }
    } else {
      this.toastrService.warning("Add Claim Items To Adjudicate Claim!!")
    }
  }

  closeAdjudicateClaim() {
    this.router.navigate(['/claim/view/' + this.savedClaimKey + '/type/' + this.savedDesciplineKey])
    this.hmsDataServiceService.OpenCloseModal("btnGetClaimItems");
  }

  getClaimItemList() {
    var type
    var claimId
    var submitData = {}
    this.route.params.subscribe((params: Params) => {
      claimId = params['id']
      type = params['type']
    });
    let submitType = this.claimService.getSubmitParam(type)
    if (submitType != undefined) {
      submitData[submitType] = {
        "claimKey": +claimId,
      }
      this.hmsDataServiceService.postApi(ClaimApi.getClaimItemByClaimKeyUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.hasClaimItems = true
          this.claimitemsWithDiscipline = data.result;
          if (data.result[submitType].items) {
            for (let i in data.result[submitType].items) {
              if (data.result[submitType].items[i].isReversed == 'T') {
                this.isReversedInd = true
              } else {
                this.isReversedInd = false
              }
            }
          }
        } else {
          this.hasClaimItems = false
        }
      });
    }
  }
  
  test_releaseClaim() {
    let is_from_cardholder = '';
    let is_from_searched = ''

    this.route.queryParams.subscribe(params => {
      //  log 818 
      if (params['redirect'] == "cardholder") {
        is_from_cardholder = "T"
      }
      if (params['searched'] == "T") {
        is_from_searched = "T"
      }
      let is_from_init = params['iniClaim'];
      if (is_from_init == 'T') {
        let url = "/card/view/" + this.queryParam.chCardKey + "?cardHolderKey=" + this.queryParam.cardHolderKey + "&unitKey=" + this.queryParam.unitKey;
        location.href = url
      } else if (is_from_cardholder == "T") {
        let id = localStorage.getItem('_cardId');
        window.location.href = 'card/view/' + id + '?activecard=T';
      } else if (is_from_searched == "T") {
        if (this.claimService.claimSearchedData) {
          this.claimService.isBackClaimSearch = true
        }
        this.router.navigate(['claim/searchClaim']);
      }
      else {
        this.router.navigate(['/claim']);
      }
    })
  }

  releaseClaim() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    var submitType = ""
    this.route.params.subscribe((params: Params) => {
      claimId = params['id']
      type = params['type']
    })
    submitType = this.claimService.getSubmitParam(type)
    if (this.claimDataArr && this.claimDataArr !== undefined) {
      // Log #1057: Pending paperwork checks
      if (this.claimDataArr[submitType].bussinessType == 'Quikcard' && this.claimDataArr[submitType].pendingPaperWork == 'T') {
        this.toastrService.error("Pending paperwork claims cannot be released")
        return
      }
      // Validate Claim Status
      if (this.claimDataArr.claimStatusCd === "X" && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Can only release APPROVED claims.")
      } else if (this.claimDataArr.claimStatusCd === "B" && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Cannot release a PENDING FUNDS - EXTRA BENEFIT claim")
      } else if ((this.claimDataArr.claimStatusCd === "C" || this.claimDataArr.claimStatusCd === "P") && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Cannot release a PENDING FUNDS - OVER CREDIT LIMIT claim.")
      }
      // Validate Claim Type Status
      if ((this.claimDataArr.claimTypeCd === "A" || this.claimDataArr.claimTypeCd === "U" || this.claimDataArr.claimTypeCd === "V") && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Cannot release this Pre-Authorized claims.");
      } else if (this.claimDataArr.claimTypeCd === "E" && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Cannot release an Eligibility Enquiry claim.");
      }
    } else {
      this.toastrService.error("No Data Found!!");
    }
    /** Start Release Claim Process After Above Checks(Below  Code is Old Code Placed Here) */
    var type
    var claimId
    var submitData = {}
    //For Dental Case
    if (submitType == "dentalClaim") {
      submitData = {
        "claimKey": +claimId,
        "discipline": +type,
        "userId": +this.UserID,
        "dentalClaim": {
          "claimStatusCd": this.claimDataArr.dentalClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.dentalClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.dentalClaim.claimTypeCd
      }
    } else if (submitType == "visionClaim") {
      submitData = {
        "claimKey": +claimId,
        "discipline": +type,
        "userId": +this.UserID,
        "visionClaim": {
          "claimStatusCd": this.claimDataArr.visionClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.visionClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.visionClaim.claimTypeCd
      }
    } else if (submitType == "healthClaim") {
      submitData = {
        "claimKey": +claimId,
        "discipline": +type,
        "userId": +this.UserID,
        "healthClaim": {
          "claimStatusCd": this.claimDataArr.healthClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.healthClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.healthClaim.claimTypeCd
      }
    } else if (submitType == "drugClaim") {
      submitData = {
        "claimKey": +claimId,
        "discipline": +type,
        "userId": +this.UserID,
        "drugClaim": {
          "claimStatusCd": this.claimDataArr.drugClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.drugClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.drugClaim.claimTypeCd
      }
    } else if (submitType == "hsaClaim") {
      submitData = {
        "claimKey": +claimId,
        "discipline": +type,
        "userId": +this.UserID,
        "hsaClaim": {
          "claimStatusCd": this.claimDataArr.hsaClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.hsaClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.hsaClaim.claimTypeCd
      }
    } else if (submitType == "wellnessClaim") {
      submitData = {
        "claimKey": +claimId,
        "discipline": +type,
        "userId": +this.UserID,
        "wellnessClaim": {
          "claimStatusCd": this.claimDataArr.wellnessClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.wellnessClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.wellnessClaim.claimTypeCd
      }
    } else {
      submitData = {
        "claimKey": +claimId,
        "discipline": +type,
        "userId": +this.UserID
      }
    }
    //For Dental Case
    let is_from_cardholder = '';
    let is_from_searched = '';
    this.hmsDataServiceService.postApi(ClaimApi.releaseClaim, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK" && data.hmsMessage.messageShort == "CLAIM_IS_RELEASED") {
        this.showLoader = false;
        // To get filePath below method called
        this.getFileViewPath(+claimId)
        this.toastrService.success("Claim Released Successfully.")
          this.route.queryParams.subscribe(params => {
            //  log 818 5 may 
            // Calling updateScannedClaimFile API process after released and unreleased claim if claim comes from Quikcard/ADSC Dashboard as discussed with Arun Sir 
            if (params['claimScannedFileKey'] && (params['claimScannedFileKey'] != 0)) {
              this.claimService.getClaimScannedFileKey = +params['claimScannedFileKey']
            }
            if (params['isAdDash']) {
              if (params['isAdDash'] == 'true') {
                this.claimService.isAdscDashboard = true 
              } else {
                this.claimService.isAdscDashboard = false 
              }       
            }
            if (this.claimService.getClaimScannedFileKey != 0) {
              let updateScannedClaimFileUrl = ClaimApi.updateScannedClaimFile
              let releaseFlag;
              if (this.claimDataArr[submitType].releaseInd == "F") {
                releaseFlag = "T"
              } else if (this.claimDataArr[submitType].releaseInd == "T") {
                releaseFlag = "F"
              }
              let updateScannedClaimData = {
                "claimScannedFileKey": this.claimService.getClaimScannedFileKey,
                "claimKey": +claimId,
                "disciplineKey": +type,
                "claimStatusKey": 12,
                "releaseInd": releaseFlag,
                "claimTypeKey": (+this.selectedClaimTypeKey ? +this.selectedClaimTypeKey : this.selectedClaimType)
              };
              this.hmsDataServiceService.postApi(updateScannedClaimFileUrl, updateScannedClaimData).subscribe(Sdata => {
              })
            }
            if (params['redirect'] == "cardholder") {
              is_from_cardholder = "T"
            }
            if (params['searched'] == "T") {
              is_from_searched = "T"
            }
            let is_from_init = params['iniClaim'];
            if (is_from_init == 'T') {
              let url = "/card/view/" + this.queryParam.chCardKey + "?cardHolderKey=" + this.queryParam.cardHolderKey + "&unitKey=" + this.queryParam.unitKey;
              location.href = url
            } else if (is_from_cardholder == "T") {
              let id = localStorage.getItem('_cardId');
              window.location.href = 'card/view/' + id + '?activecard=T';
            } else if (is_from_searched == "T") {
              if (this.claimService.claimSearchedData) {
                this.claimService.isBackClaimSearch = true
              }
              this.router.navigate(['claim/searchClaim']);
            }
               // Ticket #1210
             else if (this.claimService.getClaimScannedFileKey != 0){
                if(this.claimService.isAdscDashboard == true){
                this.claimService.getClaimScannedFileKey = 0
                this.router.navigate(['/claimDashboard/alberta'])
                } else if(this.claimService.isAdscDashboard == false){
                  this.claimService.getClaimScannedFileKey = 0
                  this.router.navigate(['/claimDashboard']);
                } else {
                  this.router.navigate(['/claim']);
                }
            }
              // Ticket #1210 
            else {
              this.router.navigate(['/claim']);
            }
          })
      } else if (data.code == 400 && data.status === "BAD_REQUEST" && data.hmsMessage.messageShort == "CLAIM_IS_NOT_RELEASED") {
        this.showLoader = false;
        this.toastrService.error(data.result)
      } else if (data.code == 404 && data.status === "NOT_FOUND" && data.hmsMessage.messageShort == "A Claim must have a Transaction before it can have a Status of Approved.") {
        this.showLoader = false;
        this.toastrService.error("A Claim must have a Transaction before it can have a Status of Approved.")
      } else if (data.code == 404 && data.status === "NOT_FOUND" && data.hmsMessage.messageShort == "This Transaction is already Approved.") {
        this.showLoader = false;
        this.toastrService.error("This Transaction is already Approved.")
      } else if (data.code == 404 && data.status === "NOT_FOUND" && data.hmsMessage.messageShort == "Cannot release this Pre-Authorized claims.") {
        this.toastrService.error(data.hmsMessage.messageShort)
        this.showLoader = false;
      } else {
        this.showLoader = false;
      }
    }, (error) => {
    });
    /** End Release Claim Process After Above Checks */
  }

  getSystemMessages() {
    var reqParam = {
      "discipline": +this.disciplineKey,
      "claimKey": +this.claimId,
    }
    this.hmsDataServiceService.postApi(ClaimApi.getSystemMessages, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.CustomeMessageData = data.result
      } else {
        this.CustomeMessageData = []
      }
    })
  }

  addRfrClaimComment() {
  }

  reloadTable(tableId) {
    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  closePrintModal(myModal) {
    myModal.close();
  }

  getClaimCommentList() {
    var tableId = "importantCommentsList"
    var URL = ClaimApi.claimImportantComments;
    var userId = this.UserID
    var reqParam = [
      { 'key': 'disciplineKey', 'value': this.disciplineKey },
      { 'key': 'userId', 'value': +userId },
      { 'key': 'claimKey', 'value': this.claimId }
    ]
    var tableActions = []
    var dateCols = ['createdOn'];
    this.dataTableService.jqueryDataTableComment(tableId, URL, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
  }

  getClaimCommentListReload() {
    var tableId = "importantCommentsList"
    var URL = ClaimApi.claimImportantComments;
    var userId = this.UserID
    var reqParam = [
      { 'key': 'disciplineKey', 'value': this.disciplineKey },
      { 'key': 'userId', 'value': +userId },
      { 'key': 'claimKey', 'value': this.claimId }
    ]
    var tableActions = []
    var dateCols = ['createdOn'];
    if (!$.fn.dataTable.isDataTable('#importantCommentsList')) {
      this.dataTableService.jqueryDataTableComment(tableId, URL, 'full_numbers', this.commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
    }
  }

  showPreAuth(claimTypeCd) {
  //--Log #1258 Log #1258 ADSC Claims Refer Review:Claim type changed to Pre-Authorized by Review to allow choose Send to Consultant
    if ((claimTypeCd == 'D' || claimTypeCd == 'A' || claimTypeCd == 'V') && this.disciplineKey == 1){
      this.hasPreAuth = true
    }
    else {
      this.hasPreAuth = false
    }
  }
  sendPreAuth(reviewFor) {
    if (reviewFor == "doctor") {
      this.disableDctrBtn = true
    } if (reviewFor == "gov") {
      this.disableGovBtn = true
    }
    var userId = this.UserID
    let sndReview
    reviewFor == "doctor" ? sndReview = "D" : sndReview = "G"
    let claimItems = this.claimItemComponent.claimItemDentalComponent.claimItemList
    var reqParam = {
      "disciplineKey": +this.disciplineKey,
      "claimKey": +this.claimId,
      'userId': +userId,
      "claimItemList": claimItems,
      "reviewFor": sndReview
    }
    this.hmsDataServiceService.postApi(ClaimApi.sendPreAuth, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        reviewFor == "doctor" ? this.toastrService.success("Claim Succesfully sent for review (Doctor)") :
          this.toastrService.success("Claim Succesfully sent for review (Gov. Official)")
        let claimId = ""
        let type = ""
        this.route.params.subscribe((params: Params) => {
          claimId = params['id']
          type = params['type']
          this.fillClaimDetails(claimId, type)

        });
      } else {
      }
    })
    reviewFor == "gov" ? this.disableSendReviewDoctr = true : this.disableSendReviewDoctr = false
  }

  getCatList() {
    this.categories = []
    if (this.claimId != undefined) {
      this.hmsDataServiceService.getApi(ReferToReviewApi.getRelatedCoverages + this.claimId).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
            for (let i = 0; i < data.result.length; i++) {
              this.categories.push({ 'dentCovCatKey': data.result[i], 'dentCovCatDesc': data.result[i] });
            }
          }
        }
      });
    }
  }

  SendRequestRefToDoc() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    this.sendRequest();
  }
  resetRefToDocForm() {    
  }
  sendRequest() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    //Check User Role     
    let role = localStorage.getItem('role');
    // Operator 
    var reviewFor;
    var userId = this.UserID;
    let sndReview;
    let claimItems = this.claimItemComponent.claimItemDentalComponent.claimItemList
    // return
    if (role == "") {
      // Operator Case
      sndReview = 'R';
      reviewFor = 'OP';
      var reqParam = {
        "disciplineKey": +this.disciplineKey,
        "claimKey": +this.claimId,
        'userId': +userId,
        "claimItemList": claimItems,
        "referFor": sndReview,
        "referedFrom": reviewFor,
        "dentalClaim": { "claimKey": +this.claimId }
      }
    } else if (role == "reviewer") {
      // Doctor
      sndReview = 'R';
      reviewFor = 'D';
      var reqParam = {
        "disciplineKey": +this.disciplineKey,
        "claimKey": +this.claimId,
        'userId': +userId,
        "claimItemList": claimItems,
        "referFor": sndReview,
        "referedFrom": reviewFor,
        "dentalClaim": { "claimKey": +this.claimId }
      }
    } else if (role == "referReviwer") {
      //Refer to Reviewer
      sndReview = 'D';
      reviewFor = 'R';
      var reqParam = {
        "disciplineKey": +this.disciplineKey,
        "claimKey": +this.claimId,
        'userId': +userId,
        "claimItemList": claimItems,
        "referFor": sndReview,
        "referedFrom": reviewFor,
        "dentalClaim": { "claimKey": +this.claimId }
      }
    }
    
    this.hmsDataServiceService.postApi(ClaimApi.ReferToReview, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
          //Log #1255: Claim redirected to Dashboard as per ticket description 
         // As per latest changes(30-03-2023) of LOG#1255-
        /* -start- applicationRole check added for Admin (referReviwer to direct on /reviewer & reviewer to direct on /referToReview) @as said by Arun sir*/ 
          if(this.applicationRole == 'ROLE_ADMIN'){
            if (role == ''){
            if (this.businessTypeCd == 'Q') {
              this.toastrService.success(this.translate.instant("claims.claims-toaster.claim-successfully-sent-for-review"))
              this.router.navigate(['/claimDashboard'], { queryParams: { 'claimKey': this.claimId } });
            }
            if (this.businessTypeCd == 'S') {
              this.toastrService.success(this.translate.instant("claims.claims-toaster.claim-successfully-sent-for-review"))
              this.router.navigate(['/claimDashboard/alberta'], { queryParams: { 'claimKey': this.claimId } });
            }
          }
            else if(role == "referReviwer"){
            this.toastrService.success(this.translate.instant("claims.claims-toaster.claim-successfully-sent-for-review"))
            this.router.navigate(['/reviewer']);
            localStorage.setItem('applicationRoleKey', '2')
            this.currentUserService.applicationRoleKey = 2
          }
            else if(role == "reviewer"){
            this.toastrService.success(this.translate.instant("claims.claims-toaster.claim-successfully-sent-for-review"))
            this.router.navigate(['/referToReview']);
            localStorage.setItem('applicationRoleKey', '5')
            this.currentUserService.applicationRoleKey = 5
          }
          }
          else{
            if (role == ''){
            if (this.businessTypeCd == 'Q') {
              this.toastrService.success(this.translate.instant("claims.claims-toaster.claim-successfully-sent-for-review"))
              this.router.navigate(['/claimDashboard'], { queryParams: { 'claimKey': this.claimId } });
            }
            if (this.businessTypeCd == 'S') {
              this.toastrService.success(this.translate.instant("claims.claims-toaster.claim-successfully-sent-for-review"))
              this.router.navigate(['/claimDashboard/alberta'], { queryParams: { 'claimKey': this.claimId } });
            }
          }
            else if(role == "referReviwer"){
            this.toastrService.success(this.translate.instant("claims.claims-toaster.claim-successfully-sent-for-review"))
            this.router.navigate(['/referToReview']);
            localStorage.setItem('applicationRoleKey', '2')
            this.currentUserService.applicationRoleKey = 2
          }
            else if(role == "reviewer"){
            this.toastrService.success(this.translate.instant("claims.claims-toaster.claim-successfully-sent-for-review"))
            this.router.navigate(['/reviewer']);
            localStorage.setItem('applicationRoleKey', '5')
            this.currentUserService.applicationRoleKey = 5
          }
          }
          /* -end- */
        let claimId = ""
        let type = ""
        this.route.params.subscribe((params: Params) => {
          claimId = params['id']
          type = params['type']
          this.fillClaimDetails(claimId, type);
        });
      } else {
        this.toastrService.error("Something Went Wrong");
      }
    })
  }

  closeModal() {
    this.adjudicatedPercent = 0
    // #log 818 5may start
    let init = "F"
    this.route.queryParams.subscribe(params => {
      init = params['iniClaim'];
      if(params['isAdDash']){
        this.isAdDash = params['isAdDash']
      }
    })
    this.router.navigate(['/claim/view/' + this.savedClaimKey + '/type/' + this.savedDesciplineKey], { queryParams: { iniClaim: init, saveClaim: this.InitSearchClaimAddString, isAdDash: this.isAdDash } })

    // #log 818 5may ends
    this.enableViewMode();
    document.getElementById('release-claim').focus();
    this.hmsDataServiceService.OpenCloseModal("btnGetClaimItems");
  }

  openModal(myModal) {
    myModal.open();
  }

  changeTheme(businessType) {
    if (businessType.isAlberta) {
      let node = document.createElement('link');
      node.href = 'assets/css/common-alberta.css';
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    } else {
      $('link[href="assets/css/common-alberta.css"]').remove();
    }
  }

  printPreAuthLtr(modal) {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    this.fillDetailsForPrint()
    modal.open()
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

  disableSendReviewBtn() {
    this.enableViewMode()
  }

  exportLetter(element: HTMLElement, options?: DrawOptions) {
    this.isFileContent = true;
    drawDOM(element, options).then((group: Group) => {
      this.isFileContent = false;;
      return exportPDF(group);
    }).then((dataUri) => {
      saveAs(dataUri, 'Pre-Auth-Letter.pdf');
    });
  }

  readjudicateClaim() {
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        if (this.route.snapshot.url[4]) {
          if (this.route.snapshot.url[4].path == 'readjudicate') {
            this.enableEditMode(0)
            $('html, body').animate({
              scrollTop: $("#adjudicateClaimBar")
            }, 'slow');
            var type = ""
            var claimId = ""
            this.route.params.subscribe((params: Params) => {
              claimId = params['id']
              type = params['type']
            })
            this.adjudicatedPercent = 20
            let submitType = ""
            submitType = this.claimService.getSubmitParam(type)
            let businessTypeCd = ""
            if (this.currentUser.businessType.bothAccess) {
              businessTypeCd = ""
            } else {
              businessTypeCd = this.currentUser.businessType[0].businessTypeCd
            }
            let submitInfo = {
              "businessTypeCd": businessTypeCd,
              "cardholderKey": this.FormGroup.value.ClaimCardHolderFormGroup.cardHolder,
              "dtOfBirth": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.dob)
            }
            submitInfo[submitType] = {
              "claimKey": this.claimId,
            }
            this.sendClaimAdjudication(submitInfo, submitType, 0, 0)
            this.savedClaimKey = claimId
            this.savedDesciplineKey = type
          } else {
          }
        }
      }
    }
  }

  reverseClaim() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    if (this.reverseClaimForm.valid) {
      this.route.params.subscribe((params: Params) => {
        this.reversClaimDisciplineKey = params['type']
      });
      var reqParam = {
        "claimReferenceNumber": +this.reverseClaimForm.value.rvrseClmNo,
        "disciplineKey": this.reversClaimDisciplineKey
      }
      this.hmsDataServiceService.postApi(ClaimApi.getClaimKeyByClaimReferenceNumber, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.hmsDataServiceService.OpenCloseModal('btnReverseCloseModal')
          this.hmsDataServiceService.OpenCloseModal('showReverseClaimItem')
          this.reverseClaimKey = data.result.claimKey
          this.getReverseClaimitems()
        } else {
          this.reverseClaimForm.controls['rvrseClmNo'].setErrors({
            "referenceNotValid": true
          });
        }
      })
    } else {
      this.validateAllFormFields(this.reverseClaimForm);
    }
  }

  getReverseClaimitems() {
    var reqParam = {}
    let submitType = this.claimService.getSubmitParam(this.reversClaimDisciplineKey);
    reqParam[submitType] = {
      "claimKey": +this.reverseClaimKey
    }

    this.hmsDataServiceService.postApi(ClaimApi.getClaimItemByClaimKeyUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.isReverseClaim = true
        if (data.result[submitType].items.length > 0) {
          for (var i = 0; i < data.result[submitType].items.length; i++) {
            data.result[submitType].items[i].isClaimed == 'T' ? data.result[submitType].items[i].isClaimed = true : data.result[submitType].items[i].isClaimed = false
            data.result[submitType].items[i].isReversed == 'T' ? data.result[submitType].items[i].isReversed = true : data.result[submitType].items[i].isReversed = false
            data.result[submitType].items[i].itemApprovedReviewInd == 'T' ? data.result[submitType].items[i].itemApprovedReviewInd = true : data.result[submitType].items[i].itemApprovedReviewInd = false
            data.result[submitType].items[i].selectedRow = false
          }
          this.reverseClaimItems = data.result[submitType].items
          this.getCardandCardholderKey()
        } else {
          this.reverseClaimItems = []
        }
      } else {
        this.reverseClaimItems = []
      }
    })
  }

  getCardandCardholderKey() {
    let submitData = {}
    let submitType = this.claimService.getSubmitParam(this.reversClaimDisciplineKey)
    submitData[submitType] = { "claimKey": +this.reverseClaimKey }
    this.hmsDataServiceService.postApi(ClaimApi.getClaimDetailsUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.claimStatus = data.result.status
        this.claimService.claimStatus.emit(this.claimStatus)
        this.reversedClaimStatus = data.result[submitType].claimType
        this.getCardEligibityKey(data.result.cardKey)
        this.getCardholderEligibityKey(data.result.cardholderKey)
      } else {
      }
    })
  }

  getCardEligibityKey(cardKey) {
    let submitData = {
      "cardKey": cardKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getCardLatestEligibilty, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.reversCdEligibilityKey = data.result.cdEligibilityKey
      } else {
        this.reversCdEligibilityKey = ''
      }
    })
  }

  getCardholderEligibityKey(cardHolderKey) {
    let submitData = {
      "cardHolderKey": cardHolderKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getCardHolderLatestEligibility, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.reversChEligibilityKey = data.result.chEligibilityKey
      } else {
        this.reversChEligibilityKey = ''
      }
    })
  }

  resetReverseClaim() {
    this.reverseClaimForm.reset()
  }

  resetReverseClaimItems() {
    this.reverseClaimItemForm.reset()
    this.reverseClaimItems = []
    this.selectedRow = ''
    this.reverseClaimKey = ''
    this.reversCdEligibilityKey = ''
    this.reversChEligibilityKey = ''
    this.isReverseClaim = false
    this.selectedReverseClaimIndex = ''
    this.reversClaimDisciplineKey = ''
    this.savedReverseClaimKeys = []
  }

  doubleClick(index, dataRow) {
    if (this.reverseClaimItems[index].selectedRow == true) {
      this.reverseClaimItems[index].selectedRow = false
      this.selectedReverseClaimIndex = undefined
      this.selectedRow = undefined
      return;
    }
  }

  getSelectedClaimReverse(index, dataRow) {
    if (dataRow.isClaimed == true || dataRow.isClaimed == 'T') {
      this.toastrService.warning('Cannot Reverse Claimed Claim Item')
    } else if (dataRow.isReversed == true || dataRow.isReversed == 'T') {
      this.toastrService.warning('Cannot Reverse Reversed Claim Item')
    } else if (dataRow.isPreAuth == true || dataRow.isPreAuth == 'T') {
      this.toastrService.warning('Cannot Reverse Pre-Auth Claim Item')
    } else {
      if (this.selectedReverseClaimIndex == index) {
        return
      } else {
        if (this.selectedRow) {
          this.reverseClaimItems[this.selectedReverseClaimIndex].itemToothId = this.reverseClaimItemForm.value.toothId
          this.reverseClaimItems[this.selectedReverseClaimIndex].itemToothSurfaceTxt = this.reverseClaimItemForm.value.toothSurfaceTxt
          this.reverseClaimItems[this.selectedReverseClaimIndex].itemUnitCount = this.reverseClaimItemForm.value.unitCount
          this.reverseClaimItems[this.selectedReverseClaimIndex].itemApprovedReviewInd = this.reverseClaimItemForm.value.approveReview
          this.reverseClaimItems[this.selectedReverseClaimIndex].itemDeductAmt = this.reverseClaimItemForm.value.deductAmt
          this.reverseClaimItems[this.selectedReverseClaimIndex].itemCarrierAmtTot = this.reverseClaimItemForm.value.cobVal
        }
        this.reverseClaimItems[index].selectedRow = true
        this.selectedReverseClaimIndex = index
        this.selectedRow = this.reverseClaimItems[index]
        this.reverseClaimItemForm.patchValue({
          'toothId': dataRow.itemToothId,
          'toothSurfaceTxt': dataRow.itemToothSurfaceTxt,
          'unitCount': dataRow.itemUnitCount,
          'approveReview': dataRow.itemApprovedReviewInd,
          'deductAmt': dataRow.itemDeductAmt,
          'cobVal': dataRow.itemCarrierAmtTot,
        })
      }
    }
  }

  saveReversalClaim() {
    if (this.reversedClaimStatus == 'Paid') {
      this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-canot'))
    } else {
      this.showLoader = true
      let dcItemDeductAmt: any
      let dcItemCarrierAmt: any
      if (this.reverseClaimItems.length > 0) {
        for (var i = 0; i < this.reverseClaimItems.length; i++) {
          if (this.reverseClaimItems[i].selectedRow) {
            this.reverseClaimItems[i].oldItemKey = this.reverseClaimItems[i].itemKey
            this.reverseClaimItems[i].itemKey = ''
            this.selectedReverseClaimIndex = undefined
            this.reverseClaimItems[i].itemToothId = this.reverseClaimItemForm.value.toothId ? +this.reverseClaimItemForm.value.toothId : ''
            this.reverseClaimItems[i].itemToothSurfaceTxt = this.reverseClaimItemForm.value.toothSurfaceTxt
            this.reverseClaimItems[i].itemUnitCount = +this.reverseClaimItemForm.value.unitCount
            this.reverseClaimItems[i].itemApprovedReviewInd = this.reverseClaimItemForm.value.approveReview == true ? 'T' : 'F'
            this.reverseClaimItems[i].isReversed = this.reverseClaimItems[i].isReversed == true ? 'T' : 'F'
            this.reverseClaimItems[i].isClaimed = this.reverseClaimItems[i].isClaimed == true ? 'T' : 'F'
            dcItemDeductAmt = CustomValidators.ConvertAmountToDecimal(this.reverseClaimItemForm.value.deductAmt)
            dcItemCarrierAmt = CustomValidators.ConvertAmountToDecimal(this.reverseClaimItemForm.value.cobVal)
            this.reverseClaimItems[i].itemDeductAmt = dcItemDeductAmt > 0 ? -Math.abs(dcItemDeductAmt) : Math.abs(dcItemDeductAmt);
            this.reverseClaimItems[i].itemCarrierAmtTot = dcItemCarrierAmt > 0 ? -Math.abs(dcItemCarrierAmt) : Math.abs(dcItemCarrierAmt);
            this.reverseClaimItems[i].itemFeeClaimAmt = this.reverseClaimItems[i].itemFeeClaimAmt > 0 ? -Math.abs(this.reverseClaimItems[i].itemFeeClaimAmt) : Math.abs(this.reverseClaimItems[i].itemFeeClaimAmt);
            this.reverseClaimItems[i].itemFeeEligAmt = this.reverseClaimItems[i].itemFeeEligAmt > 0 ? -Math.abs(this.reverseClaimItems[i].itemFeeEligAmt) : Math.abs(this.reverseClaimItems[i].itemFeeEligAmt);
            this.reverseClaimItems[i].itemFeeAllowAmt = this.reverseClaimItems[i].itemFeeAllowAmt > 0 ? -Math.abs(this.reverseClaimItems[i].itemFeeAllowAmt) : Math.abs(this.reverseClaimItems[i].itemFeeAllowAmt)
            this.reverseClaimItems[i].itemLabClaimAmt = this.reverseClaimItems[i].itemLabClaimAmt > 0 ? -Math.abs(this.reverseClaimItems[i].itemLabClaimAmt) : Math.abs(this.reverseClaimItems[i].itemLabClaimAmt)
            this.reverseClaimItems[i].itemLabEligAmt = this.reverseClaimItems[i].itemLabEligAmt > 0 ? -Math.abs(this.reverseClaimItems[i].itemLabEligAmt) : Math.abs(this.reverseClaimItems[i].itemLabEligAmt)
            this.reverseClaimItems[i].itemLabAllowAmt = this.reverseClaimItems[i].itemLabAllowAmt > 0 ? -Math.abs(this.reverseClaimItems[i].itemLabAllowAmt) : Math.abs(this.reverseClaimItems[i].itemLabAllowAmt)
            this.reverseClaimItems[i].itemFeePaidAmt = this.reverseClaimItems[i].itemFeePaidAmt > 0 ? -Math.abs(this.reverseClaimItems[i].itemFeePaidAmt) : Math.abs(this.reverseClaimItems[i].itemFeePaidAmt)
            this.reverseClaimItems[i].itemTotalPaidAmt = this.reverseClaimItems[i].itemTotalPaidAmt > 0 ? -Math.abs(this.reverseClaimItems[i].itemTotalPaidAmt) : Math.abs(this.reverseClaimItems[i].itemTotalPaidAmt)
            this.reverseClaimItems[i].userId = this.currentUser.userId
            this.reverseClaimItems[i].cardEligibilityKey = this.reversCdEligibilityKey,
              this.reverseClaimItems[i].chEligibilityKey = this.reversChEligibilityKey
            this.editedReversalClaim.push(this.reverseClaimItems[i])
          }
        }
        for (var i = 0; i < this.editedReversalClaim.length; i++) {
          if (this.editedReversalClaim[i].selectedRow == false) {
            this.editedReversalClaim.splice(i, 1);
          }
        }
        this.reversedClaimItemKeys = this.editedReversalClaim.map(a => a.oldItemKey);
      }
      if (this.editedReversalClaim.length > 0) {
        this.getPreAuthClaimItemForRevrsClaim()
        this.getReversalClaimItemForRevrsClaim()
        let submitData = {}
        let submitType = this.claimService.getSubmitParamClaimItemList(this.reversClaimDisciplineKey)
        submitData[submitType] = this.editedReversalClaim
        this.hmsDataServiceService.postApi(ClaimApi.saveReversalClaimItemByDiscipline, submitData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.savedReverseClaimKeys = data.result
            this.validateReverseClaimItem(this.savedReverseClaimKeys)
            this.showLoader = false
          } else {
            this.hmsDataServiceService.OpenCloseModal('btnReverseClaimItemCloseModal')
            this.showLoader = false
            this.toastrService.error("Claim Item Cannot Reversed")
          }
        })
      } else {
        this.showLoader = false;
        this.toastrService.error("Please Select Atleast One Claim");
      }
    }
  }

  getPreAuthClaimItemForRevrsClaim() {
    var reqParam = {
      "itemKeyList": this.reversedClaimItemKeys,
      "disciplineKey": this.reversClaimDisciplineKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getPreAuthClaimItem, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {

      } else {
      }
    })
  }

  getReversalClaimItemForRevrsClaim() {
    var reqParam = {
      "itemKeyList": this.reversedClaimItemKeys,
      "disciplineKey": this.reversClaimDisciplineKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getReversalClaimItem, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
      } else {
      }
    })
  }

  validateReverseClaimItem(itemKey) {
    let reverseClaimItems = itemKey.map(a => a.reverseItemKey);
    let submitData = {}
    let submitType = this.claimService.getParamClaimItem(this.reversClaimDisciplineKey)
    submitData[submitType] = {
      "itemKeyList": reverseClaimItems
    }
    this.hmsDataServiceService.postApi(ClaimApi.validateClaimItem, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let validatedKeys = []
        let notValidatedKeys = []
        if (data.result.length > 0) {
          for (var i = 0; i < data.result.length; i++) {
            if (data.result[i].message == 'RECORD_FOUND') {
              validatedKeys.push(data.result[i].itemKey)
            } else {
              notValidatedKeys.push(data.result[i].itemKey)
            }
          }
          let linkedReverseClaimKeys = []
          for (var i = 0; i < this.savedReverseClaimKeys.length; i++) {
            if (validatedKeys[i] == this.savedReverseClaimKeys[i].reverseItemKey) {
              linkedReverseClaimKeys.push(this.savedReverseClaimKeys[i])
            }
          }
          this.saveReversalClaimItemWithDenKey(linkedReverseClaimKeys)
        }
        if (notValidatedKeys.length == reverseClaimItems.length) {
          this.hmsDataServiceService.OpenCloseModal('btnReverseClaimItemCloseModal')
          this.showLoader = false
          this.toastrService.error("Claim Item Cannot Reversed")
        }
      } else {
        this.hmsDataServiceService.OpenCloseModal('btnReverseClaimItemCloseModal')
        this.showLoader = false
        this.toastrService.error("Claim Item Cannot Reversed")
      }
    })
  }

  saveReversalClaimItemWithDenKey(itemKey) {
    let submitData = {}
    let submitType = this.claimService.getSubmitParamClaimItem(this.reversClaimDisciplineKey)
    submitData[submitType] = itemKey
    this.hmsDataServiceService.postApi(ClaimApi.linkReverseItem, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.hmsDataServiceService.OpenCloseModal('btnReverseClaimItemCloseModal')
        this.showLoader = false
        this.toastrService.success("Claim Item Reversed Successfully")
        this.enableViewMode()
      } else {
        this.hmsDataServiceService.OpenCloseModal('btnReverseClaimItemCloseModal')
        this.showLoader = false
        this.toastrService.success("Claim Item Cannot Reversed Successfully!!")
      }
    })
  }

  onReferToReview() {
    var apiUrl = ClaimApi.ReferToReview
    let submitData = {}
    let descipline_type = this.FormGroup.value.ClaimGeneralInformationFormGroup.claimType;
    if (!this.FormGroup.value.ClaimGeneralInformationFormGroup.claimType) {
      descipline_type = this.descipline_type
    }
    let submitType = this.claimService.getSubmitParam(this.descipline_type)
    submitData["referFor"] = "R";
    submitData[submitType] = {
      "claimKey": this.claimId,
    };
    this.hmsDataServiceService.postApi(apiUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showLoader = false
        this.toastrService.success("Claim Item Refered To Reversed Successfully")
        this.enableViewMode()
      } else {
        this.showLoader = false
        this.toastrService.success("Claim Item Cannot Refered To Reversed Successfully!!")
      }
    })
  }
  onCheckCheque() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    if (this.claimStatus == 'Paid' && this.dcpKey != 0) {
      let params = {
        'businessType': this.cardBusinessType,
        'discipline': this.disciplineCD,
        'claimKey': this.claimId,
        'payee': this.payeeTypeDesc,
        'fromClaim': false,
        'claimAttachedCheck': 'T',
        'cardNumber': this.cardNumber
      }
      this.currentUserService.transactionQueryParams = params

      window.open('/finance/transaction-search/transactionDetails?disc=' + this.disciplineCD + '&dcp=' + this.dcpKey)
    } else {
      this.toastrService.warning('No Cheque Available for This Claim')
    }
  }

  // added for log 886
  showTrackClaim() {
    this.refNumber = this.generalInformationComponent.ClaimGeneralInformationFormGroup.get("reference").value;
    this.message = "";
    this.recordLength = 0;
    this.trackStatusList = [];
    this.hmsDataServiceService.postApi(ClaimApi.trackStatus, { claimKey: this.claimId }).subscribe(data => {
      if (data.code == 200 && data.result.length > 0) {
        this.recordLength = 1;
        this.trackStatusList = data.result;
      } else {
        this.message = "No Data Found";
      }
    });
  }

  showGridOrMsg() {
    if (this.lockedMessage != "" && this.lockedMessage != undefined) {
      this.toastrService.error(this.lockedMessage)
      return
    }
    this.recordLength = 0;
    this.showRevPreAuthTableObj = [];
    this.hmsDataServiceService.postApi(ClaimApi.getPreAuthReverseClaimUrl, { claimKey: this.claimId }).subscribe(data => {
      if (data.code == 200 && this.disciplineKey == 1) {
        this.hmsDataServiceService.postApi(ClaimApi.checkReverseAndPreAuthClaimStatusUrl, { originClaimKey: +data.result.originClaimKey, disciplineKey: this.disciplineKey }).subscribe(data => {
          if (data.code == 200 && data.result.data.length > 0) {
            this.recordLength = 1;
            this.showRevPreAuthTableObj = data.result.data;
            this.referenceId = data.result.refId
            this.checkReferenceId = true
          } else {
            this.message = "No Claim Found";
            this.referenceId = '';
            this.checkReferenceId = false
          }
        });
      } else {
        this.message = "No Claim Found";
        this.referenceId = '';
        this.checkReferenceId = false;
      }
    });
  }

  redirectToClaim(data) {
    this.hmsDataServiceService.OpenCloseModal("modalFooterCloseS");
    $('html, body').animate({
      scrollTop: $(".validation-errors:first-child")
    }, 'slow');
    this.router.navigated = false;
    window.location.href = '/claim/view/' + data.claimKey + '/type/' + this.disciplineKey;
  }

  resetShowClaimGrid() {
    this.reloadTable("show-claim-table")
  }

  showPreAuthReview(claimTypeCd) {
    if (claimTypeCd == 'V') {
      this.preAuthReverseClaim = false
      this.claimTypes = false
      this.reviewer = false
    }
  }

  showPreAuthReviewEmptyMsg() {
    this.recordLength = this.dataTableService.totalPreAuthClaimRecords;
    if (this.recordLength <= 0) {
      this.message = "No Claim Found"
    }
  }

  resetpreAuthReviewClaimGrid() {
    this.reloadTable("show-preAuthReview-claim-table")
  }

  getCardCommentsText(cardKey) {
    let submitData = {
      "cardKey": cardKey
    }
    this.hmsDataServiceService.postApi(CardApi.getCardDetails, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.CardCommData = data.result;
        if (data.result.commentFlag == 'Y') {
          this.cardCommentImportance = true
        }
        if (data.result.commentText != "" && data.result.commentText != null) {
          this.commentText = data.result.commentText
          this.commentList = data.result.cardCommentsDtoList
        }
        this.getCardEligibityKey(data.result.cardKey);
      }
      this.claimService.cardCommentsData.emit(this.CardCommData)
    });
  }

  getCardHolderCommentText(cardHolderValue) {
    let requestedData = {
      "cardHolderKey": cardHolderValue
    }
    this.hmsDataServiceService.postApi(CardApi.getCardHolderdetailById, requestedData).subscribe(response => {
      if (response.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.cardHolderCommData = response.result;
        if (response.commentText != "" && response.commentText != null) {
          this.commentText = response.commentText;
        }
        if (response.commentFlag == 'Y') {
          this.cardCommentImportance = true
        }
        else {
          this.cardCommentImportance = false
        }
      }
      this.claimService.cardHolderCommentsData.emit(this.cardHolderCommData)
    });
  }
  // issue number 537 start

  getSelectedUserId(value) {
    this.supervisorValue = '';
    this.supervisorKey = '';
    var url = CardApi.referClaimUsersSupervisor + '?userId=' + value;
    this.hmsDataServiceService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result.supervisorName.length > 0) {
          this.supervisorValue = data.result.supervisorName;
          this.supervisorKey = data.result.supervisorKey;
        }
      }
    })
  }
  // issue number 537 end

  //log #819
  cardHolderdBusinessType(key: any) {
    this.cardBusinessTypeKey = key;
  }

  /* Log #987 */
  getReversedClaimInd() {
    this.hmsDataServiceService.postApi(ClaimApi.getPreAuthReverseClaimUrl, { claimKey: this.claimId }).subscribe(data => {
      if (data.code == 200 && this.disciplineKey == 1) {
        this.hmsDataServiceService.postApi(ClaimApi.checkReverseAndPreAuthClaimStatusUrl, { originClaimKey: +data.result.originClaimKey, disciplineKey: this.disciplineKey }).subscribe(data => {
          if (data.code == 200 && data.result.data.length > 0) {
            let claimItemsData = data.result.data
            for (var i = 0; i < claimItemsData.length; i++) {
              if (claimItemsData[i].reversed == 'T') {
                this.isClaimReversed = true;
              } else {
                this.isClaimReversed = false;
              }
            }
          }
        });
      } else {
        this.isClaimReversed = false;
      }
    });
  }

  /* Lock Processor API Integration */
  getLockProcessor() {
    let discType;
    let key
    this.route.params.subscribe((params: Params) => {
      key = params['id']
      discType = params['type']
    });
    let disciplineCd = this.claimService.getDisciplineCode(discType)
    let request = {
      'claimKey': key,
      'disciplineCd': disciplineCd
    }
    this.hmsDataServiceService.postApi(ClaimApi.lockProcessorUrl, request).subscribe(data => {
      if (data) {
        if (data.code == 200 && data.status == "OK") {
          this.lockedMessage = ""
          this.claimService.getLockedMessage.emit(this.lockedMessage)
        } else if (data.code == 400 && data.result.errorLog == 'This record is being modified by another user.') {
          this.toastrService.error("This record is being modified by another user.")
          this.lockedMessage = "This record is being modified by another user."
          this.claimService.getLockedMessage.emit(this.lockedMessage)
        } else if (data.code == 400 && data.result.errorLog == 'Deadlock.') {
          this.toastrService.error("Deadlock.")
          this.lockedMessage = "Deadlock."
          this.claimService.getLockedMessage.emit(this.lockedMessage)
        } else if (data.code == 400 && data.result.errorLog == 'Parameter error.') {
          this.toastrService.error("Parameter error.")
          this.lockedMessage = "Parameter error."
          this.claimService.getLockedMessage.emit(this.lockedMessage)
        }
        else if (data.code == 400 && data.result.errorLog == 'Already own lock specified by id or lockhandle.') {
         
        }
        else if (data.code == 400 && data.result.errorLog == 'Illegal lock handle.') {
          this.toastrService.error("Illegal lock handle.")
          this.lockedMessage = "Illegal lock handle."
          this.claimService.getLockedMessage.emit(this.lockedMessage)
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.result.claimKey != undefined) {
          this.toastrService.error("This record is being modified by another user.")
          this.lockedMessage = "This record is being modified by another user."
          this.claimService.getLockedMessage.emit(this.lockedMessage)
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.result.claimKey == undefined) {
          this.claimService.getLockedMessage.emit(this.lockedMessage)
        } else {
        }
        if (this.lockedMessage != "" && this.lockedMessage != undefined) {
          this.showLockedMsg = true
        } else {
          this.showLockedMsg = false
        }
      }
    })
  }

  // Method to use same functionality of updateScannedClaimFile API
  updateScannedClaimFileProcessInitiated(submitType, dcKey, cSfK) {
    if ((this.addMode && this.FormGroup.value.ClaimGeneralInformationFormGroup.fileRefVal) && (cSfK != 0)) {
      let updateScannedClaimFileUrl = ClaimApi.updateScannedClaimFile // Earlier wrong API was used which is above as discussed with Arun sir
      let updateClaimSubmitData = {
        "claimScannedFileKey": cSfK,
        "claimKey": +dcKey,
        "disciplineKey": +this.disciplineKey
      };
      // Get Claim API call to get claimStatusKey which will use in updateScannedClaimFile API as per Arun sir
      let reqGetClaim = {}
      let claimStatusKey = ""
      reqGetClaim[submitType] = {
        "claimKey": dcKey,
        "userId": localStorage.getItem('id')
      }
      this.hmsDataServiceService.postApi(ClaimApi.getClaimDetailsUrl, reqGetClaim).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (data.result[submitType].claimStatusKey == 10 || data.result[submitType].claimStatusKey == 11 || data.result[submitType].claimStatusKey == 12 || data.result[submitType].claimStatusKey == 13 || data.result[submitType].claimStatusKey == 14) {
            claimStatusKey = data.result[submitType].claimStatusKey
          }
          updateClaimSubmitData['claimStatusKey'] = claimStatusKey
          updateClaimSubmitData['releaseInd'] = "F"
          updateClaimSubmitData['claimTypeKey'] = data.result[submitType].claimTypeKey
          this.hmsDataServiceService.postApi(updateScannedClaimFileUrl, updateClaimSubmitData).subscribe(Sdata => {
          })
        }
      })
    }
  }

  // Show Claim History Grid functionality
  showClaimHistoryGrid() {
    this.claimHistoryRecordLength = 0;
    this.showClaimHistoryTableObj = [];
    this.showClaimHistoryTableObjSecond = []
    this.hmsDataServiceService.postApi(ClaimApi.getReissueReverseClaimUrl, { claimKey: this.claimId }).subscribe(data => {
      if (data.code == 200 && data.status == "OK" && data.result.length > 0) {
        // Show Claim History Item Listing as per claim key shown here
        let type
        let submitData = {}
        this.route.params.subscribe((params: Params) => {
          type = params['type']
        });
        let submitType = this.claimService.getSubmitParam(type)
        for (let i = 0; i < data.result.length; i++ ) {
          if (i == 0) {
            submitData[submitType] = {
              "claimKey": data.result[i].originClaimKey,
            }
            this.hmsDataServiceService.postApi(ClaimApi.getClaimItemByClaimKeyUrl, submitData).subscribe(data => {
              if (data.code == 200 && data.status === "OK") {
              data.result;
              this.showClaimHistoryTableObj = data.result[submitType].items
              this.claimHistoryRecordLength = 1;
              this.claimHisRefId = data.result[submitType].items[i].refId//data.result.refId
              this.checkClaimHistoryRefId = true
              } else {
              this.checkClaimHistoryRefId = false
              }
            });
          }
          if (i == 1) {
            submitData[submitType] = {
              "claimKey": data.result[i].originClaimKey,
            }
            this.hmsDataServiceService.postApi(ClaimApi.getClaimItemByClaimKeyUrl, submitData).subscribe(data => {
              if (data.code == 200 && data.status === "OK") {
              data.result;
              this.showClaimHistoryTableObjSecond = data.result[submitType].items
              this.claimHistoryRecordLength = 1;
              this.claimHisRefIdSecond = data.result[submitType].items[i].refId//data.result.refId
              this.checkClaimHistoryRefIdSecond = true
              } else {
              this.checkClaimHistoryRefIdSecond = false
              }
            });
          }
        }
      } else {
        this.claimHistoryMessage = "No Claim Found";
        this.claimHisRefId = '';
        this.claimHisRefIdSecond = ''
      }
    });
  }

  resetShowClaimHistoryGrid() {
    this.showClaimHistoryTableObj = []
    this.showClaimHistoryTableObjSecond = []
  }

  claimRedirection(data) {
    this.hmsDataServiceService.OpenCloseModal("closeShowClaimHistoryModal");
    $('html, body').animate({
      scrollTop: $(".validation-errors:first-child")
    }, 'slow');
    this.router.navigated = false;
    window.location.href = '/claim/view/' + data.claimKey + '/type/' + this.disciplineKey;
  }

  // To View File getEnteredClaimFile API integrated
   getFileViewPath(claimKey) {
    let request = {
      "claimKey" : +claimKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getEnteredClaimFileUrl, request).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.filePath = data.result.filePath;
      } else {
        this.filePath = ""
      }
    })
   }
   
  dashboardClaims(){
    if (this.isAdDash != '' && this.isAdDash != undefined) {
      if (this.isAdDash == 'true') {
        this.currentUserService.dashboardType.emit('Adsc')
        this.router.navigate(['/claimDashboard/alberta']);
      } else {
        this.currentUserService.dashboardType.emit('Quik')
        this.router.navigate(['/claimDashboard']);
      }
    }
  }

}
