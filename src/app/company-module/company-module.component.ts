import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { CompanyService } from './company.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from './../common-module/shared-services/validators/custom-validator.directive';
import { FormCanDeactivate } from './../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CompanyFinancialDataComponent } from './company-financial-data/company-financial-data.component';
import { CompanyFormComponent } from './company-form/company-form.component';
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CompanyApi } from './company-api'
import { IMyInputFocusBlur } from 'mydatepicker';
import { DatatableService } from './../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { CommonDatePickerOptions } from './../common-module/Constants';
import { ChangeDateFormatService } from './../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CommentModelComponent } from './../common-module/shared-component/CommentsModal/comment-model/comment-model.component'; // Import comments json
import { CommentEditModelComponent } from './../common-module/shared-component/comment-edit-model/comment-edit-model.component';
import { Constants } from './../common-module/Constants';
import { Subject } from 'rxjs/Rx';
import { CardServiceService } from '../card-module/card-service.service';
import { CompanyTabDatatableComponent } from './company-tab-datatable/company-tab-datatable.component';
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CompanyTravelInsuranceComponent } from './company-travel-insurance/company-travel-insurance.component';
import { ExDialog } from "./../common-module/shared-component/ngx-dialog/dialog.module";
import { CompanyBankAccountComponent } from './company-bank-account/company-bank-account.component';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { TableBody } from 'primeng/primeng';
import { SalesDataComponent } from './sales-data/sales-data.component'
import { CompanyUploadDocumentComponent } from './company-upload-document/company-upload-document.component';
import { debug } from 'util';
import { RequestOptions, Headers, Http } from '@angular/http';
import jsPDF from 'jspdf';
import { BrokerApi } from './broker-api';
import { UftApi } from '../unit-financial-transaction-module/uft-api';
declare var jsPDF: any;

@Component({
  selector: 'app-company-module',
  templateUrl: './company-module.component.html',
  styleUrls: ['./company-module.component.css'],
  providers: [ChangeDateFormatService, DatatableService, CardServiceService, TranslateService]
})
export class CompanyModuleComponent extends FormCanDeactivate implements OnInit {
  showHideBankAccountButton: boolean = false
  currentUser: any;
  companyStatus: any;
  selectedReferralTypeKey: any;
  selectedReferralTypeCd: any;
  selectedReferralOtherName: any;
  planUnitsColumnsTable = [];
  planDivisionKey: any;
  expired: boolean;
  checkEFAPRate
  editEFAPMode: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  message: any;
  //Date Picker Options
  ObservableCreditAccountObj;
  ObservablePlanUnitAccountObj;
  checkCreditLimit = true
  creditLimitColumnsTable = [];

  observableTerminationObj;
  checkTermination = true;
  termination_columns = [];
  showLoader: boolean = false;
  observableAkiraBenefitObj
  observableEFAPBenefitObj
  akiraBenefitColumns = []
  efapBenefitColumns = []
  checkAkiraBenefit = true
  buttonTextBenefit;
  buttonEFAPBenefit;
  compName;
  akiraBenefitTableAction = [
    { 'name': 'view', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'showAction': '' },
    { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': '' },
  ]
  efapBenefitTableAction = [
    { 'name': 'view', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'showAction': '' },
    { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': '' },
  ]
  terminateCompanyErrorMessages = [
    "TERMINATION_DATE_MUST_BE_GREATER_THAN_CARD_BANK_ACCOUNT_EFFECTIVE_ON",
    "COMPANY_TERMINATION_DATE_SHOULD_BE_GREATER_THAN_COMPANY_EFFECTIVE_DATE",
    "PLAN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_EFFECTIVE_ON",
    "DIVISON_TERMINATION_DATE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "PLAN_PRORATING_TERMINATION_DATE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENTAL_COMBINE_MAX_DATE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "PLANS_DETAIL_FEE_DATE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "BENIFIT_DATE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENTAL_COVERAGE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENTAL_COVERAGE_DETAIL_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENTAL_COVERAGE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENTAL_COVERAGE_SERVICE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_COV_SERV_ASSOC_ASSGN_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "VISION_COVERAGE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "VISION_COVERAGE_DETAIL_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "VISION_COVERAGE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "VISION_COVERAGE_SERVICE_AS_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_BA_SALARY_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_CLAIM_JUNCTION_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_CLAIM_PAYMENT_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_COV_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_COVERAGE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_COVERAGE_CATEGORY_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_COVERAGE_DETAIL_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_PRACTICE_TYPE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_PROV_BA_ASSGN_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_PROV_BANK_ACCOUNT_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_PROV_BILLING_ADDRES_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_PROV_ELIGIBILITY_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_PROV_SPECIAL_ASSGN_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_PROVIDER_SPECIALTY_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_SERVICE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_SERVICE_ASSGN_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HEALTH_SPECIALTY_TYPE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_BA_BILL_ASSGN_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_CLAIM_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_CLAIM_JUNCTION_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_CLAIM_PAYMENT_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_COV_DETAIL_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_COV_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_COVERAGE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_COVERAGE_CATEGORY_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_PRACTICE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_PROV_BANK_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_PROV_BILLING_ADDRESS_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_PROV_ELIGIBILTITY_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_PROV_SPECIALTY_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_PROV_SPECIALTY_TYPE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_SERVICE_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DIVISION_COMMENT_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DEDUCTIBLE_EFFECTIVE_MUST_BE_GREATER_PLAN_EFFECTIVE",
    "UNIT_COMMENT_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "BENEFIT_DENTAL_COV_CAT_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENTAL_COV_CATEGORY_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENT_COV_SERV_ASSOC_ASSGN_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENTAL_PROCEDURE_COV_ASSGN_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DENT_COV_RULE_ASSGN_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "VIS_COV_SERV_ASSOC_ASSGN_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "BENEFIT_VISION_COV_CAT_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "BENEFIT_HEALTH_COV_CAT_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HLTH_COVERAGE_SERVICE_ASSG_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "BENEFIT_HEALTH_COV_CAT_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "HLTH_COV_SERV_ASSOC_ASSGN_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "VISION_COVERAGE_RULE_ASSGN_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DRUG_COV_RULE_ASSGN_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DIVSION_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "DIVISION_CARRY_FORWARD_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "PLANS_DETAIL_FEE_GUIDE_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "PLAN_DENTAL_FEE_SCHEDULE_A_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "PLAN_PROV_ASSGN_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "EFFECTIVEON_REQUIRED_FOR_PREVIOUS_ACCOUNT",
    "COMPANY_BANK_ACCOUNT_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "COMPANY_BANK_ASSIGNMENT_EXPIRED_ON_MUST_BE_GREATER_THAN_OR_EQUALS_TO_EFFECTIVE_ON",
    "COMPANY_CONTACT_EXPIRED_ON_MUST_BE_GREATER_THAN_OR_EQUALS_TO_EFFECTIVE_ON",
    "COMPANY_COM_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
    "COMPANY_REACTIVATE_DATE_SHOULD_BE_AFTER_COMPANY_TERMINATION_DATE",
    "CANNOT_REACTIVATE_COMPANY_BEFORE_TERMINATION_DATE",
    "PRORATING_EFFECTIVE_ON_REQUIRED",
    "COMPANY_TERMINATE_DATE_MUST_BE_GREATER_THAN_BROKER_ASSIGNMENT_EFFECTIVE_ON",
    "TERMINATION_DATE_MUST_BE_GREATER_THAN_CARD_BANK_ACCOUNT_EFFECTIVE_ON"
  ];
  backToSearchClicked: boolean = false;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public addCreditLimitPopupForm: FormGroup;
  public addAkiraBenefitForm: FormGroup;

  public addEFAPBenefitForm: FormGroup;

  @ViewChildren(DataTableDirective)
  @ViewChild('FormGroup')
  @ViewChild(CompanyFinancialDataComponent) financialformData; // to acces Financial Data 
  @ViewChild(CompanyFormComponent) companyFormData; // to acces variable of Company Financial 
  @ViewChild(CommentModelComponent) commentFormData; // to acces variable of Comment from 
  @ViewChild(CommentEditModelComponent) commentEditFormData; // to acces variable of Comment from 
  @ViewChild(CompanyTabDatatableComponent) companyTabDatatable; // to acces variable of Company Tab Datatable Component from 
  @ViewChild(CompanyFinancialDataComponent) companyFinancialDatatable; // to acces variable of Company Tab Datatable Component from 
  @ViewChild(CompanyTravelInsuranceComponent) travelInsuranceData; // to acces Travel Insurance Data
  @ViewChild(SalesDataComponent) salesData; // to acces Travel Insurance Data
  @ViewChild(CompanyBankAccountComponent) companyBankAccountData;
  @ViewChild(CompanyUploadDocumentComponent) companyUploadDocument;
  @Input() addCreditLimitForm: FormGroup;
  @Input() terminateForm: FormGroup;
  @ViewChild("CompanycreditLimitMultiplier") trgCompanycreditLimitMultiplier: ElementRef;
  @ViewChild("benefitAdminRate") trgBenefitAdminRate: ElementRef;
  @Output() emitMainCompanyArray: EventEmitter<any> = new EventEmitter<any>();
  companyKey
  noReqParams;
  coKey;
  companyJson;
  gIInfo;
  setGeneralInfo;
  hideCommentButton
  firstComment


  private sub: any;
  addMode: boolean = true; //Enable true when user add a new card
  viewMode: boolean = false; //Enable true after a new card added
  editMode: boolean = false; //Enable true after viewMode when user clicks edit button
  hideButton: any;
  arrTerminationList: any;
  error: any;
  error1: any;
  error2: any;
  selectedFileName;
  selectedFile: any;
  companyData: any;
  terminationCategoryList = [];
  hiddenParamName: string;
  formDetails: Array<object>;
  titleAlert: string = 'This field is required';
  companyHeading: string = "Add New"
  dateNameArray = {}
  FormGroup: FormGroup;
  commentObject = { 'comments': [] };
  dtElements: QueryList<any>;
  datatableElements: DataTableDirective;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  id: number;
  isTerminated: string;
  terminationList = []
  alberta: boolean = false
  buttonText // = this.translate.instant('button.save'); 
  editUniqueKey = 0;
  showImportantCommentList: boolean = false // Show/Hide Important comment list heading
  addCreditLimitVal = { 'creditLimitMultiplier': [null, Validators.required] }
  companySearchBtn: boolean = false

  selectedBusinessTypeKey: any;
  terminationReasonData: any;
  selectedTerminationReason: any;

  public isOpen: boolean = false;
  submitted: boolean;
  standardPapAmt;
  adjustedPapAmt;
  coAkiraEnrolmentKey = 0;
  coEfapEnrolmentKey = 0;
  
  isPrimaryBrokerContact: boolean = false
  isCompanyPrimaryContact: boolean = false
  COMPANY_NAME: any;
  COMPANY_NUMBER: any;
  TERMINATION_DATE: any;
  BROKER_NAME: any;
  BROKER_ADDRESS_LINE: any;
  BROKER_CITY: any;
  BROKER_PROVINCE: any;
  BROKER_POSTAL_CODE: any;
  CURRENT_DATE: Date = new Date()
  COMPANY_ADDRESS_LINE = ''
  COMPANY_CITY = '' 
  COMPANY_PROVINCE = '' 
  COMPANY_POSTAL_CODE = ''
  COMPANY_PRIMARY_CONTACT_FIRST_NAME = ''
  COMPANY_PRIMARY_CONTACT_LAST_NAME = ''
  GRACE_PERIOD = ''
  BROKER_PRIMARY_CONTACT_FIRST_NAME = ''
  BROKER_PRIMARY_CONTACT_LAST_NAME = ''
  travelEffectiveDate
  policyNum
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  allowedExtensions = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword", "image/jpg", "image/jpeg", "image/png"]
  allowedValue: boolean = false
  fileSizeExceeds: boolean = false
  mainCompanyArray = [{
    "searchCompany": 'F',
    "addCompany": 'F',
    "viewCompany": 'F',
    "editCompany": 'F',
    "creditLimit": 'F',
    "companyBankAccount": 'F',
    "terminateCompany": 'F',
    "reactivateCompany": 'F',
    "addPlan": 'F',
    "suspendPlan": 'F',
    "terminatePlan": 'F',
    "addDivision": 'F',
    "viewDivision": 'F',
    "deleteDivision": 'F',
    "terminateDivision": 'F',
    "companyComments": 'F',
    "addCompanyComments": 'F',
    "editCreditLimit": 'F',
    "saveUpdateCreditLimit": 'F',
    "saveCompanyBankAccount": 'F',
    "editCompanyBankAccount": 'F',
    "editSuspensPlan": 'F',
    "viewPlan": 'F',
    "addPlanComments": 'F',
    "addTerminateCoverage": 'F',
    "companyContact": 'F',
    "linkBroker": 'F',
    "deleteLinkedBroker": 'F',
    "addCompanyContact": 'F',
    "viewCompanyContact": 'F',
    "deleteCompanyContact": 'F',
    "addLinkedBroker": 'F',
    "viewLinkedBroker": 'F',
    "saveCompany": 'F',
    "suspendCompany": 'F',
    "editSuspendCompany": 'F',
    "saveSuspendCompany": 'F',
    "terminateCompPopupBtn": 'F'
  }]
  tableActions
  compId
  tableActionsTerminationHist = [
    { 'name': 'view', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil' },
  ]
  referralDropdownVal: EventEmitter<any> = new EventEmitter<any>();
  viewPlanDataTable

  /** Unit Inline Data table  */
  public UnitAddMode = false; /** It is used to check record add mode is enable or not */
  public UnitEditMode = false; /** It is used to check record edit mode is enable or not */

  public selectedUnit = {}; /** For selected record object */

  public UnitList = [];
  editPlanMode: boolean = true;
  /** For New Row */
  new_unit_id: FormControl;
  new_description: FormControl;
  new_effective_date: FormControl;

  /** For Update Row */
  old_unitKey: FormControl;
  old_unit_id: FormControl;
  old_description: FormControl;
  old_effective_date: FormControl;
  updates_comment: FormControl;

  //initializing current page to one
  tableItemsPerPage = 5
  cPage: number = 1;

  /** To Show date related errors */
  NewEffectiveDateNotValid;
  OldEffectiveDateNotValid;
  /** Unit Inline Data table  */
  compUpdateObj;
  isTerminationDate:boolean = false
  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    public companyService: CompanyService,
    private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private router: ActivatedRoute,
    private _router: Router,
    private cardService: CardServiceService,
    public currentUserService: CurrentUserService,
    private toastr: ToastrService,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private completerService: CompleterService,
    public cdRef: ChangeDetectorRef
  ) {
    super();
    companyService.getbussinessType.subscribe(data => {
      if (data) {
        if (data == parseInt(Constants.albertaBusnsTypeKey)) {
          this.alberta = true
          delete this.financialformData.financialDataVal.adminrate;
          delete this.financialformData.financialDataVal.papSuspended;
        } else if (data == parseInt(Constants.quikcardBusnsTypeKey)) {
          this.alberta = false
        }
      }
    })
    companyService.showCommentFlag.subscribe((value) => {
      this.firstComment = value.firstComment;
      this.hideCommentButton = value.showCommentButton;
    });
    // New Unit Form Validations

    /** Unit Inline Data table new row  */
    this.new_unit_id = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.onlyNumbers]);
    this.new_description = new FormControl('', [Validators.required, Validators.maxLength(50)]);
    this.new_effective_date = new FormControl('', [Validators.required]);

    /** Unit Inline Data table update row  */
    this.old_unitKey = new FormControl('', []);
    this.old_unit_id = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.onlyNumbers]);
    this.old_description = new FormControl('', [Validators.required, Validators.maxLength(50)]);
    this.old_effective_date = new FormControl('', [Validators.required]);
    this.updates_comment = new FormControl('', [Validators.maxLength(500)]);
    /** Unit Inline Data table  */

    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };

  }

  ngOnInit() {
    this.showLoader = true;
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.showLoader = false;
        let checkArray = this.currentUserService.authChecks['SCO'].concat(this.currentUserService.authChecks['VCO']).concat(this.currentUserService.authChecks['ACC']).concat(this.currentUserService.authChecks['ACO']).concat(this.currentUserService.authChecks['LBR']).concat(this.currentUserService.authChecks['ACL']).concat(this.currentUserService.authChecks['SPL']).concat(this.currentUserService.authChecks['COC']).concat(this.currentUserService.authChecks['ABA']).concat(this.currentUserService.authChecks['TCO'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.showLoader = false;
        let checkArray = this.currentUserService.authChecks['SCO'].concat(this.currentUserService.authChecks['VCO']).concat(this.currentUserService.authChecks['ACC']).concat(this.currentUserService.authChecks['ACO']).concat(this.currentUserService.authChecks['LBR']).concat(this.currentUserService.authChecks['ACL']).concat(this.currentUserService.authChecks['SPL']).concat(this.currentUserService.authChecks['COC']).concat(this.currentUserService.authChecks['ABA']).concat(this.currentUserService.authChecks['TCO'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
      })
    }
    $("input[type='text']").attr("autocomplete", "off");

    var self = this
    if (this._router.url.indexOf('view') !== -1) {
      this.addMode = false;
      this.viewMode = true;
      this.editMode = false;
      this.sub = this.router.params.subscribe(params => {
        this.id = +params['id']; // (+) converts string 'id' to a number
        let companyId = { coKey: this.id };
        this.coKey = this.id;
        var URL = CompanyApi.getCompanyDetailByIdUrl;
        this.hmsDataServiceService.post(URL, companyId).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            // For termin checkbox added in company view page only
            this.companyService.companyViewTermin.emit(data.result.coTerminRfInd)
            this.compId = data.result.coId
            this.compName = (data.result.coName) ? data.result.coName.trim() : '';
            this.companyService.selectedReferralOtherVal.emit(data.result.referralTypeKey);
            if (data.result.comments.length > 0) {
              this.firstComment = data.result.comments[0].commentTxt;
              this.hideCommentButton = data.result.commentFlag;
            }
            this.hideButton = { 'hideSuspendedButton': data.result.coSuspendHistory, 'hideAdjButton': data.result.coAdjustedPapAmtHistory, 'hidePapButton': data.result.coStandardPapAmtHistory, 'hideAdminRateButton': data.result.adminRateHist };
            this.companyService.hideButtons.emit(this.hideButton)
            window.scrollTo(0, 0);
            this.companyData = data.result
            this.gIInfo = data.result
            this.companyService.setCompanyData.emit(this.companyData)
            this.isTerminated = data.result.status;
            this.companyService.setCompanyStatus(data.result.status)
            // Log #1171: terminatedOn check
            if (data.result.terminatedOn != undefined && data.result.terminatedOn != "") {
              this.isTerminationDate = true
            } else {
              this.isTerminationDate = false
            }
            /** Add Two decimal places to StandardPapAmt and AdjustedPapAmt */
            if (data.result.coAdminRate || data.result.coAdminRate == 0) {
              var coAdminRate = String(data.result.coAdminRate);
              if (coAdminRate && coAdminRate.indexOf(".") == -1) {
                data.result.coAdminRate = data.result.coAdminRate + '.00';
              }
            }

            if (Number.isInteger(data.result.coStandardPapAmt)) {
              this.standardPapAmt = data.result.coStandardPapAmt + '.00';
            } else {
              this.standardPapAmt = data.result.coStandardPapAmt;
            }

            if (Number.isInteger(data.result.coAdjustedPapAmt)) {
              this.adjustedPapAmt = data.result.coAdjustedPapAmt + '.00'
            } else {
              this.adjustedPapAmt = data.result.coAdjustedPapAmt
            }

            this.selectedReferralTypeKey = data.result.referralTypeKey
            /**Patch travelEffectiveOn date on bases of travelStatus */
            if (data.result.travelStatus == 'T' && data.result.travelEffectiveOn) {
              data.result.travelEffectiveOn = this.changeDateFormatService.convertStringDateToObject(data.result.travelEffectiveOn);
            } else {
              data.result.travelEffectiveOn = '';
            }
            if (data.result.coBankInfoInd == 'T') {
              this.showHideBankAccountButton = true;
            } else {
              this.showHideBankAccountButton = false;
            }
            this.companyStatus = data.result.status;
            if (data.result.coName != "" && data.result.coName != undefined) {
              $(document).on('mouseover', '#companyName', function () {
                var val = $(this).val().toString()
                if (val != "") {
                  $(this).attr('title', val);
                }
              })
            } else {
              $(document).on('mouseover', '#companyName', function () {
                $(this).removeAttr('title');
              })
            }

            this.FormGroup.patchValue({
              companySetupForm: {
                "company": (data.result.coId) ? data.result.coId.trim() : '',
                'gracePeriod': data.result.coTerminClearDt,
                'websiteAddress': data.result.coWebSiteAdd,
                'companyName': (data.result.coName) ? data.result.coName.trim() : '',
                'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
                'terminationDate': data.result.terminatedOn != undefined ?
                  this.changeDateFormatService.convertStringDateToObject(data.result.terminatedOn) : '',
                'address1': (data.result.coL1MailAdd) ? data.result.coL1MailAdd.trim() : '',
                'address2': data.result.coL2MailAdd,
                'postalCode': (data.result.postalCd) ? data.result.postalCd.trim() : '',
                'phone': (data.result.coWorkPhoneNum) ? data.result.coWorkPhoneNum.trim() : '',
                'extension': data.result.extension != null ? data.result.extension.trim() : '',
                'city': (data.result.cityName) ? data.result.cityName.trim() : '',
                'province': (data.result.provinceName) ? data.result.provinceName.trim() : '',
                'country': (data.result.countryName) ? data.result.countryName.trim() : '',
                'fax': data.result.coFaxPhoneNum,
                'businessTypeKey': data.result.businessTypeDesc,
                'terminationCategory': data.result.termCatKey,
                'coBankInfoInd': data.result.coBankInfoInd == 'F' ? false : true,
                'coPrintCardInd': data.result.coPrintCardInd == 'T' ? true : false
              },
              financialDataForm: {
                'adminrate': data.result.coAdminRate,
                'standardpapamount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.coStandardPapAmt),
                'adjustedpapamount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.coAdjustedPapAmt),
                'adjustedpapenddate': this.changeDateFormatService.convertStringDateToObject(data.result.coAdjustedPapEndDt),
                'exemptGst': data.result.coGstExemptInd == 'F' ? false : true,
                'papSuspended': data.result.coPapSuspendInd == 'F' ? false : true
              },
              travelInsuranceForm: {
                'enroll': (data.result.travelStatus == 'T') ? true : false,
                'effectiveDate': data.result.travelEffectiveOn,
                'terminatedDate': (data.result.travelTerminateOn) ?
                  this.changeDateFormatService.convertStringDateToObject(data.result.travelTerminateOn) : '',
                'policyNumber': data.result.policyNum // Log #1162: parameter will be changed when backend complete 
              },
              salesDataForm: {
                'soldDate': this.changeDateFormatService.convertStringDateToObject(data.result.soldDate),
                'referral': data.result.referralTypeDesc,
              }
            });
            if (data.result.referralTypeKey == 1) {
              this.FormGroup.patchValue({
                salesDataForm: {
                  'broker': data.result.referralOther
                }
              })
            } else if (data.result.referralTypeKey == 2) {
              this.FormGroup.patchValue({
                salesDataForm: {
                  'staff_member': data.result.referralOther
                }
              })
            } else if (data.result.referralTypeKey == 4) {
              this.FormGroup.patchValue({
                salesDataForm: {
                  'company': data.result.referralOther
                }
              })
            } else if (data.result.referralTypeKey == 6) {
              this.FormGroup.patchValue({
                salesDataForm: {
                  'other': data.result.referralOther
                }
              })
            }

            if (data.result.businessTypeKey == Constants.albertaBusnsTypeKey) {
              this.companyService.getbussinessType.emit(Constants.albertaBusnsTypeKey);
            }
            this.travelEffectiveDate = data.result.travelEffectiveOn
            if (data.result.policyNum) {
              this.policyNum = data.result.policyNum
            } else {
              this.policyNum = '';
            }
            this.companyService.getPolicyNumber.emit(this.policyNum)

          }
        });
        this.setGeneralInfo = { 'coKey': 100 };
      });
      if (this.companyService.isBackCompanySearch) {
        this.companySearchBtn = this.companyService.isBackCompanySearch
      }
      else {
        this.companySearchBtn = false
      }
      var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]

      ///Table Termination
      this.observableTerminationObj = Observable.interval(1000).subscribe(x => {
        if (this.checkTermination = true) {
          if ('company.company-terminate.termination-reason' == this.translate.instant('company.company-terminate.termination-reason')) {
          }
          else {
            this.termination_columns = [
              { title: this.translate.instant('company.company-terminate.termination-reason'), data: 'terminateReason' },
              { title: this.translate.instant('company.company-terminate.entry-date'), data: 'entryDate' },
              { title: this.translate.instant('company.company-terminate.termination-date'), data: 'terminateDate' },
              { title: this.translate.instant('company.company-terminate.reactivation-date'), data: 'coRestartOn' }]
            this.checkTermination = false
            this.observableTerminationObj.unsubscribe();
          }
        }
      });
    }

    this.FormGroup = this.fb.group({
      companySetupForm: this.fb.group(this.companyFormData.companyFormVal),
      financialDataForm: this.fb.group(this.financialformData.financialDataVal),
      travelInsuranceForm: this.fb.group(this.travelInsuranceData.travelInsuranceVal),
      salesDataForm: this.fb.group(this.salesData.salesDataVal),
    })

    this.addCreditLimitForm = new FormGroup({
      'creditLimitMultiplier': new FormControl('', [Validators.required]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl('', [Validators.required]),
    })

    this.terminateForm = new FormGroup({
      'entryDate': new FormControl(null, [Validators.required]),
      'terminateDate': new FormControl('', [Validators.required]),
      'terminationCategory': new FormControl('', [Validators.required]),
      'resumeDate': new FormControl('', []),
      'gracePeriod': new FormControl('60', [Validators.required, Validators.maxLength(3), CustomValidators.onlyNumbers, CustomValidators.range, CustomValidators.notEmpty]), // #1148: Grace Period Field added
      'fileName': new FormControl('')
    })

    this.addCreditLimitPopupForm = new FormGroup({
      creditLimitMultiplierValue: new FormControl('', [Validators.required, CustomValidators.creditLimitMultiplier, CustomValidators.notEmpty]),
      creditLimitComment: new FormControl('', []),
      effectiveOnPopup: new FormControl('', [Validators.required]),
      expiredOnPopup: new FormControl('', []),
    });

    /* Log #1061 */
    this.addAkiraBenefitForm = new FormGroup({
      companyName: new FormControl('', Validators.required),
      adminRate: new FormControl('', [Validators.required, Validators.maxLength(13), CustomValidators.number]),
      effectiveDate: new FormControl('', Validators.required),
      expiryDate: new FormControl('')
    })

    this.addEFAPBenefitForm = new FormGroup({
      efapCompanyName: new FormControl('', Validators.required),
      efapRate: new FormControl('', [Validators.required, Validators.maxLength(13), CustomValidators.number]),
      efapEffectiveDate: new FormControl('', Validators.required),
      efapExpiryDate: new FormControl('')
    })

    this.formDetails = [];

    var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]

    this.ObservableCreditAccountObj = Observable.interval(1000).subscribe(x => {
      if (this.checkCreditLimit = true) {
        if ('company.company-credit-limit.credit-limit-multiplier' == this.translate.instant('company.company-credit-limit.credit-limit-multiplier')) {
        }
        else {
          this.buttonText = this.translate.instant('button.save');
          this.creditLimitColumnsTable = [
            { title: this.translate.instant('company.company-credit-limit.credit-limit-multiplier'), data: 'coCreditLimitAmt' },
            { title: this.translate.instant('company.company-credit-limit.comments'), data: 'coCreditComment' },
            { title: this.translate.instant('company.company-credit-limit.effective-date'), data: 'effectiveOn' },
            { title: this.translate.instant('company.company-credit-limit.expiry-date'), data: 'expiredOn' },
            { title: this.translate.instant('common.action'), data: 'coCreditLimitKey' }]
          this.checkCreditLimit = false;
          this.ObservableCreditAccountObj.unsubscribe();
        }
      }

    });
    this.ObservablePlanUnitAccountObj = Observable.interval(1000).subscribe(x => {
      this.planUnitsColumnsTable = [
        { title: 'Unit Id', data: 'unitId' },
        { title: 'Unit Desc', data: 'unitDesc' },
        { title: 'Effective Date', data: 'effectiveOn' }
      ];

      this.ObservablePlanUnitAccountObj.unsubscribe();

    });

    /* Log #1061: Akira Benefit Functionality */
    this.observableAkiraBenefitObj = Observable.interval(1000).subscribe(x => {
      if (this.checkAkiraBenefit = true) {
        if ('company.company-credit-limit.credit-limit-multiplier' == this.translate.instant('company.company-credit-limit.credit-limit-multiplier')) {
        }
        else {
          this.buttonTextBenefit = this.translate.instant('button.save');
          this.akiraBenefitColumns = [
            { title: this.translate.instant('Admin Rate'), data: 'akiraRate' },
            { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
            { title: this.translate.instant('common.expirydate'), data: 'expiredOn' },
            { title: this.translate.instant('common.action'), data: 'coAkiraEnrolmentKey' }]
          this.checkAkiraBenefit = false;
          this.observableAkiraBenefitObj.unsubscribe();
        }
      }

    });

    /*  EFAP Benefit Functionality */
      this.observableEFAPBenefitObj = Observable.interval(1000).subscribe(x => {
        
            this.buttonEFAPBenefit = this.translate.instant('button.save');
            this.efapBenefitColumns = [
              { title: this.translate.instant('EFAP Rate'), data: 'efapRate' },
              { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
              { title: this.translate.instant('common.expirydate'), data: 'expiredOn' },
              { title: this.translate.instant('common.action'), data: 'coEfapEnrolmentKey' }]
            this.observableEFAPBenefitObj.unsubscribe();
        
      });

    this.getTerminationList();
  }

  getAuthCheck(companyChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.mainCompanyArray = [{
        "searchCompany": 'T',
        "addCompany": 'T',
        "viewCompany": 'T',
        "editCompany": 'T',
        "creditLimit": 'T',
        "companyBankAccount": 'T',
        "terminateCompany": 'T',
        "reactivateCompany": 'T',
        "addPlan": 'T',
        "suspendPlan": 'T',
        "terminatePlan": 'T',
        "addDivision": 'T',
        "viewDivision": 'T',
        "deleteDivision": 'T',
        "terminateDivision": 'T',
        "companyComments": 'T',
        "addCompanyComments": 'T',
        "editCreditLimit": 'T',
        "saveUpdateCreditLimit": 'T',
        "saveCompanyBankAccount": 'T',
        "editCompanyBankAccount": 'T',
        "editSuspensPlan": 'T',
        "viewPlan": 'T',
        "addPlanComments": 'T',
        "addTerminateCoverage": 'T',
        "companyContact": 'T',
        "linkBroker": 'T',
        "deleteLinkedBroker": 'T',
        "addCompanyContact": 'T',
        "viewCompanyContact": 'T',
        "deleteCompanyContact": 'T',
        "addLinkedBroker": 'T',
        "viewLinkedBroker": 'T',
        "saveCompany": 'T',
        "suspendCompany": 'T',
        "editSuspendCompany": 'T',
        "saveSuspendCompany": 'T',
        "terminateCompPopupBtn": "T"
      }]
    } else {
      for (var i = 0; i < companyChecks.length; i++) {
        authCheck[companyChecks[i].actionObjectDataTag] = companyChecks[i].actionAccess
      }
      this.mainCompanyArray = [{
        "searchCompany": authCheck['SCO75'],
        "addCompany": authCheck['SCO76'],
        "viewCompany": authCheck['SCO77'],
        "editCompany": authCheck['VCO78'],
        "creditLimit": authCheck['VCO79'],
        "companyBankAccount": authCheck['VCO80'],
        "terminateCompany": authCheck['VCO81'],
        "reactivateCompany": authCheck['VCO82'],
        "addPlan": authCheck['VCO83'],
        "suspendPlan": authCheck['VCO84'],
        "terminatePlan": authCheck['VCO85'],
        "addDivision": authCheck['VCO86'],
        "viewDivision": authCheck['VCO87'],
        "deleteDivision": authCheck['VCO88'],
        "terminateDivision": authCheck['VCO89'],
        "companyComments": authCheck['VCO90'],
        "addCompanyComments": authCheck['COC91'],
        "editCreditLimit": authCheck['ACL92'],
        "saveUpdateCreditLimit": authCheck['ACL93'],
        "saveCompanyBankAccount": authCheck['ABA94'],
        "editCompanyBankAccount": authCheck['TCO95'],
        "editSuspensPlan": authCheck['SPL96'],
        "viewPlan": authCheck['VCO97'],
        "addPlanComments": authCheck['APC100'],
        "addTerminateCoverage": authCheck['VCO104'],
        "companyContact": authCheck['VCO105'],
        "linkBroker": authCheck['VCO106'],
        "deleteLinkedBroker": authCheck['VCO107'],
        "addCompanyContact": authCheck['ACC108'],
        "viewCompanyContact": authCheck['ACC109'],
        "deleteCompanyContact": authCheck['ACC110'],
        "addLinkedBroker": authCheck['LBR111'],
        "viewLinkedBroker": authCheck['LBR112'],
        "saveCompany": authCheck['ACO113'],
        "suspendCompany": authCheck['VCO114'],
        "editSuspendCompany": authCheck['VCO115'],
        "saveSuspendCompany": authCheck['VCO116'],
        "terminateCompPopupBtn": authCheck['TCO330']
      }]
    }
    this.companyService.authCheckFilled.emit(this.mainCompanyArray)
    this.tableActions = [
      { 'name': 'view', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'showAction': this.mainCompanyArray[0].editCreditLimit },
    ]
    return this.mainCompanyArray
  }
  ngAfterViewInit(): void {
    var self = this;
    if (this.viewMode) {
      this.FormGroup.disable();
    }
    this.cdRef.detectChanges();

    //*********************Start Company Tab DataTable Componen Jquery********************//
    $(document).unbind();
    //Edit click Event of Company Contact
    $(document).on('click', '#company-contact .view-ico', function () {
      var id = $(this).data('id')
      self.companyTabDatatable.coContactKey = id
      document.getElementById("companyContactPopup").click();
      self.companyTabDatatable.editAddContact(id)
    })

    //Delect Event of Company Contact
    $(document).on('click', '#company-contact .del-ico', function () {
      var coContactId = $(this).data('id');
      self.companyTabDatatable.coContactKeyDelete = coContactId
      self.companyTabDatatable.deleteAddContact(coContactId)
    })

    //Delect Event of Link Broker
    $(document).on('click', '#company-broker .del-ico', function () {
      var id = $(this).data('id')
      self.companyTabDatatable.linkBrokerKeyDelete = id
      self.companyTabDatatable.deleteLinkBroker(id)
    })

    //Edit click Event of Link Broker Edit
    $(document).on('click', '#company-broker .view-ico', function () {
      var linkBrokerId = $(this).data('id')
      self.companyTabDatatable.linkBrokerKey = linkBrokerId
      document.getElementById("companyLinkBrokerPopup").click();
      self.companyTabDatatable.editLinkBroker(linkBrokerId)
    })

    $(document).on('click', '#plan-datatable .ter-ico', function () {
      var divisionId = $(this).data('divisionkey');
      self.companyTabDatatable.rowDivisionKey = divisionId
      self.companyTabDatatable.terminatePlanDivision();
    })

    // Show devision units
    $(document).on('click', '#plan-datatable .unit-ico', function () {
      var divisionId = $(this).data('divisionkey');
      self.companyTabDatatable.rowDivisionKey = divisionId
      self.planUnitsdatatable(divisionId);
    })

    //Delect Event of Link Broker     
    $(document).on('click', '#plan-datatable .del-ico', function () {
      var id = $(this).data('id')
      var divisionId = $(this).data('divisionkey');
      self.companyTabDatatable.companyPlanKeyDelete = id
      self.companyTabDatatable.divisionkey = divisionId
      self.companyTabDatatable.deleteCompanyPlan(id)
    })

    //Tool tips in data table buttons
    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', 'View');
    })

    $(document).on('mouseover', '.download-ico', function () {
      $(this).attr('title', 'Download');
    })

    $(document).on('mouseover', '.del-ico', function () {
      $(this).attr('title', 'Delete');
    })

    $(document).on('mouseover', '#company-broker .del-ico', function () {
      $(this).attr('title', 'Remove broker from this company');
    })

    $(document).on('mouseover', '.ter-ico', function () {
      $(this).attr('title', 'Terminate Division');
    })

    $(document).on('mouseover', '.unit-ico', function () {
      $(this).attr('title', 'Units');
    })

    $(document).on('mouseover', '.searchbtntooltip', function () {
      $(this).attr('title', 'Search');
    })

    $(document).on('mouseover', '.resetbtntooltip', function () {
      $(this).attr('title', 'Reset');
    })

    $(document).on('click', '#suspend_plan .edit-ico', function () {
      var id = $(this).data('id')
      self.companyTabDatatable.planSuspendId = id
      self.companyTabDatatable.setSuspendedValues();
    })

    $(document).on('click', '#plan-datatable tr td:not(:last-child)', function () {
      $(this).parent('tr').find('.view-ico').trigger('click')
    });

    //**************End Company Tab DataTable Component Jquery**************//

    //**************Start Company Bank Account Component Jquery**************//
    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', 'Edit');
    })

    $(document).on('click', '#company-bank-account-history .edit-ico', function () {
      var item = new Array();
      var $row = $(this).closest("tr"),       // Finds the closest row <tr> 
        $tds = $row.find("td");             // Finds all children <td> elements
      var i = 0;

      $.each($tds, function () {               // Visits every single <td> element      // Prints out the text within the <td>
        item[i] = $(this).text();
        i++;
      });
      var bankKey = $(this).data('id')
      self.companyBankAccountData.editBankAccount(bankKey, item);
    })

    //**************End Company Bank Account Component Jquery**************//

    //**************Start Company Form Component Jquery**************//
    $(document).on('click', '#suspend_company .edit-ico', function () {
      var id = $(this).data('id')
      self.companyFormData.coSuspendId = id
      self.companyFormData.setSuspendedValues();
    })
    //**************End Company Form Component Jquery**************//

    //**************Start Company Credit Limit Jquery**************//
    $(document).on('click', '#credit-limit .edit-ico', function () {
      var item = new Array();
      var $row = $(this).closest("tr"),
        // Finds the closest row <tr> 
        $tds = $row.find("td");
      // Finds all children <td> elements
      var i = 0;
      $.each($tds, function () {
        item[i] = $(this).text();
        i++;
      });
      var creditLimitKey = $(this).data('id')
      self.editCreditLimit(creditLimitKey, item);
    });
    //**************End Company Credit limit Jquery**************//

    //**************Start Company Upload Document Jquery**************//
    $(document).on('click', '#company-upload-doc .view-ico', function () {
      self.companyUploadDocument.selectedCompnayUploadDocArray = self.currentUserService.selectedCompanyUploadDocRowData;
      var companyDocUploadId = $(this).data('id');
      var coDocumentName = self.companyUploadDocument.selectedCompnayUploadDocArray['coDocumentName'];
      self.companyUploadDocument.viewDocuments(companyDocUploadId, coDocumentName)
    })
    $(document).on('click', '#company-upload-doc .download-ico', function () {
      self.companyUploadDocument.selectedCompnayUploadDocArray = self.currentUserService.selectedCompanyUploadDocRowData;
      var companyDocUploadId = $(this).data('id');
      var coDocumentName = self.companyUploadDocument.selectedCompnayUploadDocArray['coDocumentName'];
      self.companyUploadDocument.viewDocuments(companyDocUploadId, coDocumentName)
    })
    $(document).on('click', '#company-upload-doc .del-ico', function () {
      self.companyUploadDocument.selectedCompnayUploadDocArray = self.currentUserService.selectedCompanyUploadDocRowData;
      var companyDocUploadId = $(this).data('id');
      var coDocumentName = self.companyUploadDocument.selectedCompnayUploadDocArray['coDocumentName'];
      self.companyUploadDocument.deleteDocuments(companyDocUploadId, coDocumentName)
    })
    //**************End Company Upload Document Jquery**************//

    /* Log #1061: Edit/Delete Icon Functionality Start */
    $(document).on('click', '#akiraBenefitList .edit-ico', function () {
      var item = new Array();
      var $row = $(this).closest("tr"),
        // Finds the closest row <tr> 
        $tds = $row.find("td");
      // Finds all children <td> elements
      var i = 0;
      $.each($tds, function () {
        item[i] = $(this).text();
        i++;
      });
      var akiraBenefitKey = $(this).data('id')
      self.editAkiraBenefit(akiraBenefitKey, item);
    });

    $(document).on('click', '#akiraBenefitList .del-ico', function () {
      var key = $(this).data('id')
      self.deleteAkiraBenefit(key);
    });

    /* Log #1061: Edit/Delete Icon Functionality Ends */

    /* Edit/Delete Icon Functionality Start OF EFAP*/
    $(document).on('click', '#efapBenefitList .edit-ico', function () {
      var item = new Array();
      var $row = $(this).closest("tr"),
        $tds = $row.find("td");
      var i = 0;
      $.each($tds, function () {
        item[i] = $(this).text();
        i++;
      });
      var efapBenefitKey = $(this).data('id')
      self.editEFAPBenefit(efapBenefitKey, item);
    });

    $(document).on('click', '#efapBenefitList .del-ico', function () {
      var key = $(this).data('id')
      self.deleteEFAPBenefit(key);
    });
    /* Edit/Delete Icon Functionality Ends of EFAP */
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

  // This function Reloads the Datatable by Table Id
  reloadTable(tableId) {
    this.datatableElement(tableId)
  }

  datatableElement(tableID) {
    this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], true)
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    var datePickerValue = new Array();
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      datePickerValue[ControlName] = validDate;

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
    }
    if (event.reason == 2) {
      if (formName == 'addCreditLimitForm') {
        this.addCreditLimitForm.patchValue(datePickerValue);
      } else if (formName == 'terminateForm') {
        this.terminateForm.patchValue(datePickerValue);
      }
    }
  }

  checkforAdjustFilled(value) {
    const num = value;
    var reg = /^[0-9]\d{0,5}(\.\d{0,3})?%?$/
    var isValid = true
    if (reg.test(num) && num <= 999999.999) {
      isValid = true;
    } else {
      isValid = false;
    }
    return isValid;
  }

  /**
  * add/edit company
  * @returns {company data}
  */
  onSubmit(companyForm) {
    var autogenerateCheck = "F";
    if (companyForm.value.companySetupForm.autoGeneratedNumber === companyForm.value.companySetupForm.company) {
      autogenerateCheck = "T";
    }
    this.submitted = true;
    $(".collapse-heading h3").attr("aria-expanded", "true");
    $("#financialForm, #travelInsForm, #salesDateForm, #uploadsDateForm").addClass("in");
    // Task 491 Background on all accordion in add company is getting grey if not filled, resolved
    $('.collapse').addClass('forBlankWhiteSpace')
    if (this.FormGroup.valid) {
      let companyData = {
        "papSuspendComments": this.companyFinancialDatatable.papSuspendComments,
        "businessTypeKey": this.selectedBusinessTypeKey,
        "coAdjustedPapAmt": companyForm.value.financialDataForm.adjustedpapamount,
        "coAdjustedPapEndDt": this.changeDateFormatService.convertDateObjectToString(companyForm.value.financialDataForm.adjustedpapenddate), //financialDataForm.adjustedpapenddate
        "coAdminRate": companyForm.value.financialDataForm.adminrate,
        "coFaxPhoneNum": companyForm.value.companySetupForm.fax ? companyForm.value.companySetupForm.fax.replace(/[^0-9 ]/g, "") : '',
        "coId": companyForm.value.companySetupForm.company,
        "coL1MailAdd": companyForm.value.companySetupForm.address1,
        "coL2MailAdd": companyForm.value.companySetupForm.address2,
        "coName": companyForm.value.companySetupForm.companyName,
        "coStandardPapAmt": companyForm.value.financialDataForm.standardpapamount != '' ? companyForm.value.financialDataForm.standardpapamount : null,
        "coSuspendInd": "",
        "coWebSiteAdd": companyForm.value.companySetupForm.websiteAddress,
        "coWorkPhoneNum": companyForm.value.companySetupForm.phone.replace(/[^0-9 ]/g, ""),
        "extension": companyForm.value.companySetupForm.extension,
        "coPapSuspendInd": (companyForm.value.financialDataForm.papSuspended) ? 'T' : 'F',
        "coGstExemptInd": (companyForm.value.financialDataForm.exemptGst) ? 'T' : 'F',
        "postalCd": companyForm.value.companySetupForm.postalCode,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(companyForm.value.companySetupForm.effectiveOn),
        "countryName": companyForm.value.companySetupForm.country, //country
        "cityName": companyForm.value.companySetupForm.city, //city
        "provinceName": companyForm.value.companySetupForm.province, //province
        "termCatKey": this.selectedTerminationReason != '' ? this.selectedTerminationReason : '',
        "status": companyForm.value.companySetupForm.terminationCategory != '' ? companyForm.value.companySetupForm.terminationCategory : '',
        "travelStatus": (companyForm.value.travelInsuranceForm.enroll) ? 'T' : 'F',
        "travelEffectiveOn": (this.travelEffectiveDate != null && this.travelEffectiveDate != "")? this.changeDateFormatService.convertDateObjectToString(this.travelEffectiveDate) : companyForm.value.travelInsuranceForm.effectiveDate != null ? this.changeDateFormatService.convertDateObjectToString(companyForm.value.travelInsuranceForm.effectiveDate) : null,
        'travelTerminateOn': this.changeDateFormatService.convertDateObjectToString(companyForm.value.travelInsuranceForm.terminatedDate),
        "coTerminClearDt": companyForm.value.companySetupForm.gracePeriod,
        "soldDate": this.changeDateFormatService.convertDateObjectToString(companyForm.value.salesDataForm.soldDate),
        "referralTypeKey": this.selectedReferralTypeKey,
        "coBankInfoInd": (companyForm.value.companySetupForm.coBankInfoInd) ? 'T' : 'F',
        "autoGenerate": autogenerateCheck,
        "policyNum": (this.policyNum!= null && this.policyNum != "") ? this.policyNum : companyForm.value.travelInsuranceForm.policyNumber, // Log #1162: As per client feedback policy number field added
        "coPrintCardInd": (companyForm.value.companySetupForm.coPrintCardInd) ? 'T' : 'F'
      }
      if (this.selectedReferralTypeKey == 6) {
        this.companyJson = Object.assign(companyData, { "referralOther": companyForm.value.salesDataForm.other })
      } else if (this.selectedReferralTypeKey == 1 || this.selectedReferralTypeKey == 2 || this.selectedReferralTypeKey == 4) {
        this.companyJson = Object.assign(companyData, { "referralOther": this.selectedReferralOtherName })
      }

      if (this.addMode) {
        if (this.commentFormData.commentjson != undefined) {
          this.commentObject = {
            "comments": this.commentFormData.commentjson
          }
        }
        var URL = CompanyApi.addCompanyUrl;
        this.companyJson = Object.assign(companyData, this.commentObject);

      } else {
        let companyId = { "coKey": this.coKey };
        let terminatedOn = { "terminatedOn": companyForm.value.companySetupForm.terminationDate != '' ? this.changeDateFormatService.convertDateObjectToString(companyForm.value.companySetupForm.terminationDate) : null };
        var URL = CompanyApi.updateCompanyUrl;
        this.companyJson = Object.assign(companyData, this.commentObject);
        this.companyJson = Object.assign(this.companyJson, companyId);
        this.companyJson = Object.assign(this.companyJson, terminatedOn);
      }
      this.hmsDataServiceService.post(URL, this.companyJson).subscribe(data => {
        if (data.code == 404 && data.hmsMessage.messageShort == 'CITY_PROVINCE_COUNTRY_DOESNOT_MATCH') {
          this.toastr.error(this.translate.instant('company.toaster.enterValidPostalCode'));
          return false;
        }
        if (data.code == 200 && data.status === "OK") {
          var URL = CompanyApi.getCompanyDetailByIdUrl;
          let coKey = { 'coKey': data.result.coKey };
          this.hmsDataServiceService.post(URL, coKey).subscribe(data => {
            if (companyForm.value.companySetupForm.coBankInfoInd) {
              this.showHideBankAccountButton = true;
            } else {
              this.showHideBankAccountButton = false;
            }
            if (data.code == 200 && data.status === "OK") {
              if (this.addMode) {
                this.toastr.success(this.translate.instant('company.toaster.company_added'));
                if (this.companyUploadDocument.selectedFile) {
                  this.companyUploadDocument.onUpload(data.result.coKey).then(res => {
                    this.addMode = false;
                    this.viewMode = true;
                    this.editMode = false;
                    this.FormGroup.disable();
                    this.coKey = data.result.coKey;
                    this.showLoader = false;

                    this.companyService.isBackCompanySearch = false;
                    this._router.navigate(['/company/view', data.result.coKey]);
                  });
                } else {
                  this.addMode = false;
                  this.viewMode = true;
                  this.editMode = false;
                  this.FormGroup.disable();
                  this.coKey = data.result.coKey;
                  this.showLoader = false;

                  this.companyService.isBackCompanySearch = false;
                  this._router.navigate(['/company/view', data.result.coKey]);
                }
              } else {
                if (data.result.comments.length > 0) {
                  this.firstComment = data.result.comments[0].commentTxt;
                  this.hideCommentButton = data.result.commentFlag;
                }
                this.toastr.success(this.translate.instant('company.toaster.company_updated'));
                this.hideCommentButton = data.result.commentFlag;
                this.hideButton = { 'hideSuspendedButton': data.result.coSuspendHistory, 'hideAdjButton': data.result.coAdjustedPapAmtHistory, 'hidePapButton': data.result.coStandardPapAmtHistory, 'hideCommentButton': data.result.commentFlag, 'hideAdminRateButton': data.result.adminRateHist };
                // Task 658 Below one added to correct issue where company did not used to update status just after suspending and update
                this.companyService.setCompanyStatus(data.result.status)
                this.companyService.hideButtons.emit(this.hideButton)
                this.addMode = false;
                this.viewMode = true;
                this.editMode = false;
                this.FormGroup.disable();
                this.coKey = data.result.coKey;
                this.showLoader = false;
                this.companyService.isBackCompanySearch = false;
                if (Number.isInteger(data.result.coStandardPapAmt)) {
                  this.standardPapAmt = data.result.coStandardPapAmt + '.00'
                } else {
                  this.standardPapAmt = data.result.coStandardPapAmt
                }
                if (Number.isInteger(data.result.coAdjustedPapAmt)) {
                  this.adjustedPapAmt = data.result.coAdjustedPapAmt + '.00'
                } else {
                  this.adjustedPapAmt = data.result.coAdjustedPapAmt
                }
                this.FormGroup.patchValue({
                  financialDataForm: {
                    'standardpapamount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.coStandardPapAmt),
                    'adjustedpapamount': this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.coAdjustedPapAmt)
                  }
                })
                this._router.navigate(['/company/view', data.result.coKey]);
              }
            }
          })
        } else if (data.code == 400 && data.hmsMessage.messageShort == 'COMPANY_NUMBER_ALREADY_EXIST') {
          this.toastr.error(this.translate.instant('Company Number Already Exist'));
        }
      });
    } else {
      this.validateAllFormFields(this.FormGroup); //{7}
      let target;
      target = $('input[type=text].ng-invalid').first();
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow', () => {
          target.focus();
        });
      }

    }

    window.scrollTo(0, 0);
  }

  /**
  * enable the edit company mode.
  */
  editCompany() {
    this.viewMode = false;
    this.editMode = true;
    this.FormGroup.enable();
    this.FormGroup.patchValue({
      financialDataForm: {
        'standardpapamount': this.standardPapAmt,
        'adjustedpapamount': this.adjustedPapAmt
      }
    })
    window.scrollTo(0, 0);
  }

  /**
   * Reset company form after save/update
   * @param companyForm 
   */
  reset(companyForm) {
    this.FormGroup.markAsPristine();
  }

  /**
   * Terminate company
   * @param terminateForm 
   */
  submitTerminateForm(terminateForm) {
    if (this.terminateForm.valid) {
      let terminationData = {
        "coKey": this.coKey,
        "termCatKey": this.selectedTerminationReason,
        "entryDate": this.changeDateFormatService.convertDateObjectToString(terminateForm.value.entryDate),
        "terminateDate": this.changeDateFormatService.convertDateObjectToString(terminateForm.value.terminateDate),
        "coRestartOn": this.changeDateFormatService.convertDateObjectToString(terminateForm.value.resumeDate)
      }

      /* Log #1148: Grace Period */ 
      this.getCompanyScreenValues(this.FormGroup)
      this.compUpdateObj = Object.assign(this.compUpdateObj, { "coTerminClearDt": terminateForm.value.gracePeriod })
      this.compUpdateObj = Object.assign(this.compUpdateObj, { "coKey": this.coKey })

      this.hmsDataServiceService.post(CompanyApi.saveTerminateUrl, terminationData).subscribe(data => {
        this.terminateCompanyErrorMessages.forEach(element => {
          if (data.code == 400 && element == data.hmsShortMessage) {
            this.toastr.error(this.translate.instant('company.toaster.' + element));
            return false;
          }
        });
        if (data.code == 200 && data.status == 'OK') {
          /* Update Company's grace period as per Log #1148 */ 
          this.hmsDataServiceService.post(CompanyApi.updateCompanyUrl, this.compUpdateObj).subscribe(data => {
            if(data.code == 200 && data.status == "OK") {
              var URL = CompanyApi.getCompanyDetailByIdUrl;
              let coKey = { 'coKey': this.coKey };
              this.hmsDataServiceService.post(URL, coKey).subscribe(data => {
                if (data.code == 200 && data.status === "OK") {
                  this.toastr.success(this.translate.instant('company.toaster.company_terminated'));
                  var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
                  this.dataTableService.jqueryDataTableReload('termination-history', CompanyApi.getTerminateListUrl, reqParam);
                  this.terminateForm.reset();
                  if (data.result.status == 'Inactive' || data.result.status == 'GracePeriod') {
                    this.isTerminated = data.result.status;
                    this.companyService.setCompanyStatus(data.result.status)
                    this.FormGroup.patchValue({
                      companySetupForm: {
                        'terminationDate': data.result.terminatedOn != undefined ?
                          this.changeDateFormatService.convertStringDateToObject(data.result.terminatedOn) : '',
                        'terminationCategory': data.result.termCatKey,
                        'gracePeriod': data.result.coTerminClearDt, // Log #1148
                      }
                    })
                    // Log #1171: terminatedOn check
                    if (data.result.terminatedOn != undefined && data.result.terminatedOn != "") {
                      this.isTerminationDate = true
                    } else {
                      this.isTerminationDate = false
                    }
                  }
                  // Log #1151: Letters
                  this.COMPANY_NUMBER = data.result.coId
                  this.COMPANY_NAME = data.result.coName
                  this.GRACE_PERIOD = data.result.coTerminClearDt
                  this.COMPANY_ADDRESS_LINE = data.result.coL1MailAdd
                  this.COMPANY_CITY = data.result.cityName
                  this.COMPANY_PROVINCE = data.result.provinceName
                  this.COMPANY_POSTAL_CODE = data.result.postalCd
                  this.letterToBroker(data.result.coKey, data.result.terminatedOn)
                  this.letterToPlanAdmin(data.result.coKey, data.result.terminatedOn, data.result)
                  /* For Upload Document functionality as per Log #1148) */
                  if (this.selectedFile) {
                    this.uploadDoc(data.result.coKey).then(res => {
                    });
                  } 
                }
              })
            }
          })
          /* Update Company's grace period as per Log #1148 */ 
        }
      });
    }
    else {
      this.validateAllFormFields(this.terminateForm);
    }
  }

  /**
   * Reactivate company function
   */
  reactiveCompany() {
    let companyId = { "coKey": this.coKey };
    this.hmsDataServiceService.post(CompanyApi.companyReactivateUrl, companyId).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.toastr.success(this.translate.instant('company.toaster.company_reactivated'));
        var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
        this.dataTableService.jqueryDataTableReload('termination-history', CompanyApi.getTerminateListUrl, reqParam);
        this.companyService.setCompanyStatus('Active')
        this.isTerminated = 'Active';
      } else {
      }
      error => {
      }
    })
  }

  /**
   * Get Company Bank Account History List
   */
  bankAccountHistoryDetails() {
    this.companyBankAccountData.setCompanyBankAccountFocus();
  }

  changeDateFormat1(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      this.dateNameArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
    }
  }

  /**
   * Get Company Termination History List
   */
  terminationListHistory() {
    var getTerminateListUrl = CompanyApi.getTerminateListUrl;
    var terminationTableId = 'termination-history';
    var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]

    if (!$.fn.dataTable.isDataTable('#termination-history')) {
      this.dataTableService.jqueryDataTable(terminationTableId, getTerminateListUrl, 'full_numbers', this.termination_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParam, this.tableActionsTerminationHist, undefined, [1, 2, 3], '', '', [1, 2, 3])
    } else {
      this.dataTableService.jqueryDataTableReload(terminationTableId, getTerminateListUrl, reqParam);
    }
  }

  changeDateFormatCreditLimit(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.addCreditLimitPopupForm.patchValue(datePickerValue);
      this.addAkiraBenefitForm.patchValue(datePickerValue)
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
      this.addCreditLimitPopupForm.patchValue(datePickerValue);
      if(formName == "addEFAPBenefitForm"){
        this.addEFAPBenefitForm.patchValue(datePickerValue)
      }
      else{
        this.addAkiraBenefitForm.patchValue(datePickerValue)
      }
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }

    if (event.reason == 2) {
      if (this.addCreditLimitPopupForm.value.effectiveOnPopup != null && this.addCreditLimitPopupForm.value.expiredOnPopup != null) {
        if (this.addCreditLimitPopupForm.value.effectiveOnPopup.date && this.addCreditLimitPopupForm.value.expiredOnPopup.date) {
          this.error = this.changeDateFormatService.compareTwoDates(this.addCreditLimitPopupForm.value.effectiveOnPopup.date, this.addCreditLimitPopupForm.value.expiredOnPopup.date);
        }
      }
      if (this.addAkiraBenefitForm.value.effectiveDate != null && this.addAkiraBenefitForm.value.expiryDate != null) {
        if (this.addAkiraBenefitForm.value.effectiveDate.date && this.addAkiraBenefitForm.value.expiryDate.date) {
          this.error = this.changeDateFormatService.compareTwoDates(this.addAkiraBenefitForm.value.effectiveDate.date, this.addAkiraBenefitForm.value.expiryDate.date);
        }
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);

    }

  }

  /**
   * Save credit limit
   * @param addCreditLimitPopupForm 
   */
  saveCreditLimitDetails(addCreditLimitPopupForm) {
    let creditLimitData = {
      "coKey": this.coKey,
      "coCreditLimitAmt": this.addCreditLimitPopupForm.value.creditLimitMultiplierValue,
      "coCreditComment": this.addCreditLimitPopupForm.value.creditLimitComment,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addCreditLimitPopupForm.value.effectiveOnPopup),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addCreditLimitPopupForm.value.expiredOnPopup),
      "coCreditLimitKey": this.editUniqueKey
    }
    this.hmsDataServiceService.post(CompanyApi.saveCreditLimitUrl, creditLimitData).subscribe(data => {
      if (data.code == 400 && data.hmsShortMessage == 'DATE_SHOULD_BE_GREATER_NOW_DATE') {
        this.toastr.error(this.translate.instant('company.toaster.dateGreaterThanCurrent'));
        return false;
      } else if (data.code == 400 && data.hmsShortMessage == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIREDON') {
        this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanOldExpiry'));
        return false;
      } else if (data.code == 400 && data.hmsShortMessage == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
        this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanOldEffective'));
        return false;
      } else if (data.code == 400 && data.hmsShortMessage == 'REECORD_MUST_BE_TERMINATED_BEFORE_NEW_RECORD_CAN_BE_ADDED') {
        this.toastr.error(this.translate.instant('company.toaster.terminatePreviousCreditBeforeNew'));
        this.addCreditLimitPopupForm.reset();
        return false;
      } else if (data.code == 400 && data.hmsShortMessage == 'EXPIREDON_SHOULD_BE_GREATER_EFFECTIVEON') {
        this.toastr.error(this.translate.instant('company.toaster.expiryDateGreaterThanEffective'));
        return false;
      } else if (data.code == 400 && data.hmsShortMessage == 'EXPIREDON_REQIURED') {
        this.toastr.error(this.translate.instant('company.toaster.expiryDateReq'));
        return false;
      } else if (data.code == 400 && data.hmsShortMessage == 'EFFECTIVE_DATE_SHOULD_BE_GREATER_THAN_COMPANY_EFFECTIVE_DATE') {
        this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanCompanyEffective'));
        return false;
      } else if (data.code == 400 && data.hmsShortMessage == 'EFFECTIVE_DATE_CANNOT_BE_BEFORE_LAST_EXPIRY_DATE') {
        this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanLastExpityDate'));
        return false;
      }
      if (data.code == 200 && data.status == 'OK') {
        if (data.hmsShortMessage == 'RECORD_SAVE_SUCCESSFULLY') {
          this.toastr.success(this.translate.instant('company.toaster.creditLimitAdded'));
        } else if (data.hmsShortMessage == 'RECORD_UPDATED_SUCCESSFULLY') {
          this.toastr.success(this.translate.instant('company.toaster.creditLimitUpdated'));
          this.buttonText = this.translate.instant('button.save');
        }
        this.addCreditLimitPopupForm.patchValue({ 'creditLimitMultiplierValue': 3 });
        var credit_limit_history_url = CompanyApi.getCreditLimitUrl;
        var creditLimitTableId = "credit-limit"
        var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
        this.dataTableService.jqueryDataTableReload(creditLimitTableId, credit_limit_history_url, reqParam);
        this.addCreditLimitPopupForm.reset();
        this.editUniqueKey = 0;
      }
    });
  }

  /**
   * Patch Credit Limit value when user click on edit credit limit button
   * @param creditLimitKey 
   * @param dataRow 
   */
  editCreditLimit(creditLimitKey, dataRow) {
    if (creditLimitKey) {
      this.editUniqueKey = creditLimitKey
    } else {
      this.editUniqueKey = 0
    }
    let cardaddress = {
      creditLimitMultiplierValue: dataRow[0],
      creditLimitComment: dataRow[1],
      effectiveOnPopup: this.changeDateFormatService.convertStringDateToObject(dataRow[2]),
      expiredOnPopup: this.changeDateFormatService.convertStringDateToObject(dataRow[3])
    }
    this.addCreditLimitPopupForm.patchValue(cardaddress);
    this.buttonText = this.translate.instant('button.update');
  }

  /**
   * Update Credit Limit
   * @param addCreditLimitPopupForm 
   */
  updateCreditLimit(addCreditLimitPopupForm) {
    if (this.addCreditLimitPopupForm.valid) {
      if (addCreditLimitPopupForm.value.creditLimitMultiplierValue >= -5 && addCreditLimitPopupForm.value.creditLimitMultiplierValue <= 5) {
        if (this.editUniqueKey == 0) {
          let companyId = { coKey: this.coKey };
          var URL = CompanyApi.checkCreditLimitExpiredOnUrl;
          this.hmsDataServiceService.postApi(CompanyApi.checkCreditLimitExpiredOnUrl, companyId).subscribe(data => {
            if (data.code == 400 && data.hmsShortMessage == "PREVIOUS_CREDITLIMIT_ACTIVE") {
              this.saveCreditLimitDetails(addCreditLimitPopupForm);
            } else if (data.code == 400 && data.hmsShortMessage == "PREVIOUS_CREDITLIMIT_EXPIRED") {
              this.saveCreditLimitDetails(addCreditLimitPopupForm);
            }
          });
        } else {
          this.saveCreditLimitDetails(addCreditLimitPopupForm);
        }
      } else {
        this.toastr.error(this.translate.instant('company.toaster.creditMultiplier'));
      }
    } else {
      this.validateAllFormFields(this.addCreditLimitPopupForm);
    }
  }

  /**
   * Reset company credit limit popup form after save/update/close
   */
  resetCreditLimitForm() {
    this.addCreditLimitPopupForm.reset();
    this.buttonText = this.translate.instant('button.save');
  }

  /**
   * Reset company bank account popup form after save/update/close
   */
  resetBankAccForm() {
    this.companyBankAccountData.resetBankForm();
  }

  /**
   * Reset company comments popup form after save/update/close
   */
  resetCommentForm() {
    if (this.addMode) {
      this.commentFormData.resetSaveCommentForm();
    } else {
      this.commentEditFormData.resetCommentForm();
    }
    // Below line added to make file field reset when close button clicked in company comments
    // this.commentEditFormData.removeBrokerCommentsFile()
  }

  /**
  * Reset company termination popup form after save/update/close
  */
  resetTerminateForm() {
    this.terminateForm.reset();
    this.selectedFileName = "";
    this.terminateForm.patchValue({
      'gracePeriod': '60'
    })
  }

  /**
   * Get Company comments list
   */
  reloadCompanyCommentList(type) {
    if (this.editMode || this.viewMode) {
      this.commentEditFormData.setCommentModalFocus();
      var coKey = this.coKey;
      if (type == 'importantComment') {
        this.showImportantCommentList = true;
        this.commentEditFormData.reloadImportantCommentList(coKey, type);
      } else {
        this.showImportantCommentList = false;
        this.commentEditFormData.reloadImportantCommentList(coKey, type);
      }
    } else {
      this.commentFormData.setCommentModalFocus();
    }
  }


  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(() => {
    }, 200);
  }

  /**
   * Get Credi Limit History List
   */
  creditLimitHistory() {
    this.addCreditLimitPopupForm.patchValue({ 'creditLimitMultiplierValue': 1 });
    this.setElementFocus('trgCompanycreditLimitMultiplier');
    var creditLimitUrl = CompanyApi.getCreditLimitUrl;
    var companyCreditlimitTableId = "credit-limit"
    var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
    if (!$.fn.dataTable.isDataTable('#credit-limit')) {
      this.dataTableService.jqueryDataTable('credit-limit', CompanyApi.getCreditLimitUrl, 'full_numbers', this.creditLimitColumnsTable, 5, true, false, 't', 'irp', undefined, [1, 'asc'], '', reqParam, this.tableActions, 4, [2, 3], '', '', [1, 2, 3, 4])
    } else {
      this.dataTableService.jqueryDataTableReload(companyCreditlimitTableId, creditLimitUrl, reqParam);
    }

  }

  planUnitsdatatable(divisionKey) {
    this.planDivisionKey = divisionKey;
    var planUnitUrl = CompanyApi.getPlanUnitUrl;
    var companyCreditlimitTableId = "plan-units"
    var reqParam = { 'divisionKey': divisionKey }
    this.hmsDataServiceService.post(planUnitUrl, reqParam).subscribe(data => {

      this.UnitList = data.result;
      this.hmsDataServiceService.OpenCloseModal('DivisionUnitsBtn');
    });

  }

  businessTypeKeyHandler(event) {
    this.selectedBusinessTypeKey = event;
  }

  canDeactivate() {
    if (!this.submitted && this.FormGroup.dirty) {
      if (confirm(this.translate.instant("common.pageChangeConfirmation"))) {
        if (this.currentUserService.newTabRouterLink != undefined && this.currentUserService.newTabRouterLink != '' && this._router.url != this.currentUserService.newTabRouterLink) {
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

  getSelectedReferralKey(event) {
    this.selectedReferralTypeKey = event;
  }

  getSelectedReferralTypeCd(event) {
    this.selectedReferralTypeCd = event;
  }

  getSelectedOtherKey(event) {
    this.selectedReferralOtherName = event;
  }

  /* Get List of TerminationCategory */
  getTerminationList() {
    var URL = CompanyApi.getTerminationCategoryUrl;
    this.hmsDataServiceService.get(URL).subscribe(data => {
      if (data.code == 200) {
        for (var i = 0; i < data.result.length; i++) {
          if (data.result[i].termCatCd != 'R') {
            this.terminationCategoryList.push(data.result[i]);
          }
        }
        this.terminationReasonData = this.completerService.local(
          this.terminationCategoryList,
          "termCatDesc",
          "termCatDesc"
        );
      }
      else {
        this.terminationReasonData = "";
      }
    });
  }

  onTerminationReasonSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedTerminationReason = (selected.originalObject.termCatKey).toString();
    }
    else {
      this.selectedTerminationReason = '';
    }
  }

  backToSearch() {
    this.backToSearchClicked = true
    this._router.navigate(['/company']);
  }

  ngOnDestroy() {
    if (this.backToSearchClicked) {
      this.companyService.isBackCompanySearch = true
    } else {
      this.companyService.isBackCompanySearch = false
      this.companyService.searchedCompanyName = ''
      this.companyService.searchedCompanyId = ''
    }
  }

  /**
   * Compare the comapny effective date with other dates 
   * @param FormControlName 
   */
  compareDatesWithCompanyEffectiveDate(FormControlName) {
    if (FormControlName == 'companySetupForm' || FormControlName == 'financialDataForm') {
      if (this.companyFormData.companyFormVal.effectiveOn.value != null && this.financialformData.financialDataVal.adjustedpapenddate.value != null) {
        this.error = this.changeDateFormatService.compareTwoDates(this.companyFormData.companyFormVal.effectiveOn.value.date, this.financialformData.financialDataVal.adjustedpapenddate.value.date);
        this.financialformData.patchCompanyEffectiveDateError(this.error.isError);
      }
    }

    // if (FormControlName == 'companySetupForm' || FormControlName == 'travelInsuranceForm') {
    //   if (this.companyFormData.companyFormVal.effectiveOn.value != null && this.travelInsuranceData.travelInsuranceVal.terminatedDate.value) {
    //     this.error = this.changeDateFormatService.compareTwoDates(this.travelInsuranceData.travelInsuranceVal.terminatedDate.value.date, this.companyFormData.companyFormVal.effectiveOn.value.date);
    //     this.travelInsuranceData.patchCompanyEffectiveDateError(this.error.isError, 'terminatedDate');
    //   }
    // }

    if (FormControlName == 'companySetupForm' || FormControlName == 'travelInsuranceForm') {
      if (this.companyFormData.companyFormVal.effectiveOn.value != null && this.travelInsuranceData.travelInsuranceVal.terminatedDate.value) {
        this.error = this.changeDateFormatService.compareTwoDates(this.companyFormData.companyFormVal.effectiveOn.value.date,this.travelInsuranceData.travelInsuranceVal.terminatedDate.value.date);
        this.travelInsuranceData.patchCompanyEffectiveDateError(this.error.isError, 'terminatedDate');
      }
    }

    if (FormControlName == 'companySetupForm') {
      this.companyFormData.companyFormVal
      this.salesData.salesDataVal
      if (this.companyFormData.companyFormVal.effectiveOn.value != null) {
        this.error = this.changeDateFormatService.compareTwoDates(this.salesData.salesDataVal.soldDate.value.date, this.companyFormData.companyFormVal.effectiveOn.value.date);
      }
    }
    // Log #1162: Effective Date check
    if (FormControlName == 'travelInsuranceForm') {
      this.FormGroup.value.travelInsuranceForm.effectiveDate
      if (this.travelEffectiveDate != "" && this.travelEffectiveDate != undefined && this.FormGroup.value.travelInsuranceForm.effectiveDate) {
        let isErrorEffective = this.changeDateFormatService.compareBeforeAndAfterDate(this.FormGroup.value.travelInsuranceForm.effectiveDate.date, this.travelEffectiveDate.date);
        this.travelInsuranceData.patchTravelEffectiveDateError(isErrorEffective.isError, 'effectiveDate');
      }
    }

  }

  /**
   * initialize new Unit object
   */
  enableAddUnit() {
    this.UnitAddMode = true;
    this.selectedUnit = {};
    this.UnitEditMode = false;
    this.setElementFocus('trgFocusAddUnitEl');
  }

  /** Add new Unit from Unit list */
  addNewUnit(newRecord) {
    this.new_unit_id.markAsTouched();
    this.new_description.markAsTouched();
    this.new_effective_date.markAsTouched();

    if (this.new_unit_id.invalid || this.new_description.invalid || this.new_effective_date.invalid) {
      return;
    }

    var newUnitData = {
      unitKey: 0, // As requested by backend team because they have unitkey field Long Type
      unitId: this.new_unit_id.value,
      unitDesc: this.new_description.value,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.new_effective_date.value),
      divisionKey: this.planDivisionKey,
    }

    var planUnitUrl = CompanyApi.addUpdatePlanUnitUrl;
    this.hmsDataServiceService.post(planUnitUrl, newUnitData).subscribe(data => {
      if (data.code == '200' && data.hmsMessage.messageShort == 'UNIT_ADDED_OR_UPDATE_SUCCESSFULLY') {
        this.toastr.success('Unit Added Successfully');
        this.UnitList.unshift(newUnitData);
        this.resetNewUnitRow();
      } else {
        this.toastr.error('Internal Server Error');
        this.resetNewUnitRow();
      }

    });

  }

  validateNewUnitId(event) {
    if (this.new_unit_id.valid) {
      for (var i in this.UnitList) {
        if (event.target.value == this.UnitList[i].unitId) {
          this.new_unit_id.setErrors({
            "alreadyExist": true
          });
          return;
        }
      }
    }
  }

  validateOldUnitId(oldUID) {
    if (this.old_unit_id.valid && oldUID != this.selectedUnit['unitId']) {

      for (var i in this.UnitList) {

        if (this.selectedUnit['unitId'] == this.UnitList[i].unitId) {
          this.old_unit_id.setErrors({
            "alreadyExist": true
          });
          return;
        }
      }

    }
  }

  resetNewUnitRow() {
    this.UnitAddMode = false;
    this.dateNameArray['NewEffectiveDate'] = null;
    this.new_unit_id.reset();
    this.new_description.reset();
    this.new_effective_date.reset();
  }

  /** Edit Unit */
  enableEditUnit(rowData, rowIndex): void {
    this.resetNewUnitRow();
    this.UnitEditMode = true;
    let copy = Object.assign({}, rowData);
    this.selectedUnit = copy;
    this.selectedUnit['rowIndex'] = rowIndex;
    this.selectedUnit['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
    this.setElementFocus('trgFocusEditUnitEl');
  };

  /** Update Unit */
  updateUnit(index) {
    if (this.old_unit_id.invalid || this.old_description.invalid || this.old_effective_date.invalid) {
      return;
    }

    var rowData = {
      unitKey: this.old_unitKey.value,
      unitId: this.old_unit_id.value,
      unitDesc: this.old_description.value,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.old_effective_date.value),
      divisionKey: this.planDivisionKey
    }
    var planUnitUrl = CompanyApi.addUpdatePlanUnitUrl;
    this.hmsDataServiceService.post(planUnitUrl, rowData).subscribe(data => {
      if (data.code == '200' && data.hmsMessage.messageShort == 'UNIT_ADDED_OR_UPDATE_SUCCESSFULLY') {
        this.toastr.success('Unit Updated Successfully');
        let copy = Object.assign({}, rowData);
        this.UnitList[index] = copy;
        this.resetUnitInfo();
      } else {
        this.toastr.error('Internal Server Error');
        let copy = Object.assign({}, rowData);
        this.UnitList[index] = copy;
        this.resetUnitInfo();
      }
    });
  }

  /** reset Unit form */
  resetUnitInfo() {
    this.old_unit_id.reset();
    this.old_description.reset();
    this.old_effective_date.reset();
    this.dateNameArray['OldEffectiveOn'] = null;
    this.selectedUnit = {};
    this.UnitEditMode = false;
  }

  /**
   * Delete record from list
   */
  deleteUnit(index) {
    this.exDialog.openConfirm('Are You Sure You Want to Delete ?').subscribe((value) => {
      if (value) {
        var planUnitUrl = CompanyApi.deleteUnitPlanUnitUrl + '/' + this.UnitList[index].unitKey;
        this.hmsDataServiceService.getApi(planUnitUrl).subscribe(data => {
          this.UnitList.splice(index, 1);
        });

      }
    });
  }
  /**
   * Showing Unit Inline table pagination counter heading
   */
  showPaginationCounterHeading(tableCurrentPage, tableItemsPerPage, totalRecord) {
    var pageFrom;
    var pageTo;

    //Page showing from
    if (tableCurrentPage == 1) {
      pageFrom = 1;
    } else {
      pageFrom = tableCurrentPage + (tableItemsPerPage - 1);
    }
    //Page showing to
    if (tableCurrentPage == 1) {
      pageTo = tableItemsPerPage;
    } else {
      pageTo = pageFrom + tableItemsPerPage;
    }

    //Showing pageTo if pageTo greater then total
    if (totalRecord < pageTo) {
      pageTo = totalRecord;
    }

    return "Showing " + pageFrom + " to " + pageTo + " of " + totalRecord + " entries.";
  }
  changeFilterDateFormat(event, frmControlName, selDate, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.getToday();
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);

      var self = this
      if (obj == null) {
        self[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null;
    }

    if (event.reason == 2) {
      if (frmControlName == 'new_effective_date') {
        this.new_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        if (this.FormGroup.value.effective_date.date && this.new_effective_date) {
          var error = this.changeDateFormatService.compareTwoDates(this.FormGroup.value.effective_date.date, this.new_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

      } else if (frmControlName == 'old_effective_date') {
        this.old_effective_date.patchValue(obj);

        if (this.FormGroup.value.effective_date.date && this.old_effective_date) {
          var error = this.changeDateFormatService.compareTwoDates(this.FormGroup.value.effective_date.date, this.old_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }
      } else {
        return false;
      }
    }
  }
  /**
  * set plan effective Date Error;
  */
  setEffectiveDateError(frmControlName, errorFlag) {
    if (errorFlag.isError == true) {
      var self = this
      self[frmControlName].setErrors({ "EffectiveDateNotValid": true });
    }
  }
  onPageChange(number: number) {
    this.tableItemsPerPage = number;
  }

  addDecimal(event, controlName) {
    if (event.target.value) {
      if (event.target.value.indexOf(".") == -1) {
        this.addAkiraBenefitForm.controls[controlName].patchValue(event.target.value + '.00');
      }
    }
  }

  /* Log #1061 saveUpdateAkiraBenefit method  */
  submitAkiraBenefitForm(addAkiraBenefitForm) {
    if (this.addAkiraBenefitForm.valid) {
      let akiraBenefitData = {
        "coKey": this.coKey,
        "akiraRate": this.addAkiraBenefitForm.value.adminRate,
        "effectiveOn": this.addAkiraBenefitForm.value.effectiveDate != null ? this.changeDateFormatService.convertDateObjectToString(this.addAkiraBenefitForm.value.effectiveDate) : "",
        "expiredOn": this.addAkiraBenefitForm.value.expiryDate != null ? this.changeDateFormatService.convertDateObjectToString(this.addAkiraBenefitForm.value.expiryDate) : ""
      }
      if (this.coAkiraEnrolmentKey == 0) {
        akiraBenefitData
      } else {
        akiraBenefitData['coAkiraEnrolmentKey'] = this.coAkiraEnrolmentKey
      }
      this.hmsDataServiceService.post(CompanyApi.addCoAkiraEnrolmentUrl, akiraBenefitData).subscribe(data => {
        if (data.code == 400 && data.hmsShortMessage == 'DATE_SHOULD_BE_GREATER_NOW_DATE') {
          this.toastr.error(this.translate.instant('company.toaster.dateGreaterThanCurrent'));
          return false;
        } else if (data.code == 400 && data.hmsShortMessage == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIREDON') {
          this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanOldExpiry'));
          return false;
        } else if (data.code == 400 && data.hmsShortMessage == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
          this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanOldEffective'));
          return false;
        }
        if (data.code == 200 && data.status == 'OK') {
          if (data.hmsShortMessage == 'RECORD_SAVE_SUCCESSFULLY') {
            this.toastr.success(this.translate.instant('Akira Benefit Saved Successfully!'));
          } else if (data.hmsMessage.messageShort == 'AKIRA_BENEFIT_UPDATED_SUCCESSFULLY') {
            this.toastr.success(this.translate.instant('Akira Benefit Updated Successfully!'));
            this.buttonTextBenefit = this.translate.instant('button.save');
          }
          this.addAkiraBenefitForm.patchValue({ 'companyName': this.compName });
          var akiraBenefitTableId = "akiraBenefitList"
          var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
          this.dataTableService.jqueryDataTableReload(akiraBenefitTableId, CompanyApi.getCoAkiraEnrolmentListUrl, reqParam);
          this.addAkiraBenefitForm.reset();
          this.addAkiraBenefitForm.patchValue({ 'companyName': this.compName });
          this.coAkiraEnrolmentKey = 0;
        }
      });

    } else {
      this.validateAllFormFields(this.addAkiraBenefitForm);
    }
  }

  getAkiraBenefitList() {
    this.addAkiraBenefitForm.patchValue({ 'companyName': this.compName });
    this.setElementFocus('trgBenefitAdminRate');
    var akiraBenefitTableId = "akiraBenefitList"
    var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
    if (!$.fn.dataTable.isDataTable('#akiraBenefitList')) {
      this.dataTableService.jqueryDataTable('akiraBenefitList', CompanyApi.getCoAkiraEnrolmentListUrl, 'full_numbers', this.akiraBenefitColumns, 5, true, false, 't', 'irp', undefined, [1, 'asc'], '', reqParam, this.akiraBenefitTableAction, 3, [1, 2], '', [0], [1, 2, 3])
    } else {
      this.dataTableService.jqueryDataTableReload(akiraBenefitTableId, CompanyApi.getCoAkiraEnrolmentListUrl, reqParam);
    }
  }

  resetAkiraBenefitForm() {
    this.addAkiraBenefitForm.reset();
    this.buttonTextBenefit = this.translate.instant('button.save');
  }

  editAkiraBenefit(coAkiraEnrolmentKey, dataRow) {
    if (coAkiraEnrolmentKey) {
      this.coAkiraEnrolmentKey = coAkiraEnrolmentKey
    } else {
      this.coAkiraEnrolmentKey = 0
    }
    var adminRate = dataRow[0].replace("$", "");
    let benefit = {
      companyName: this.compName,
      adminRate: adminRate,
      effectiveDate: this.changeDateFormatService.convertStringDateToObject(dataRow[1]),
      expiryDate: this.changeDateFormatService.convertStringDateToObject(dataRow[2])
    }
    this.addAkiraBenefitForm.patchValue(benefit);
    this.buttonTextBenefit = this.translate.instant('button.update');
  }

  deleteAkiraBenefit(akiraBenefitKey) {
    this.exDialog.openConfirm(this.translate.instant('Are you sure that you want to delete?')).subscribe((value) => {
      if (value) {
        this.hmsDataServiceService.delete(CompanyApi.deleteCoAkiraEnrolmentUrl + '/' + akiraBenefitKey).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastr.success("Record Deleted Successfully")
            var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
            this.dataTableService.jqueryDataTableReload("akiraBenefitList", CompanyApi.getCoAkiraEnrolmentListUrl, reqParam);
          } else {
            this.toastr.error("Record Not Deleted !")
          }
        })
      }
    });
  }

  /* Log #1061 functionality Ends here*/

  // Log #1148: Company Form values to update company's grace period
  getCompanyScreenValues(companyForm) {
    var autogenerateCheck = "F";
    if (companyForm.value.companySetupForm.autoGeneratedNumber === companyForm.value.companySetupForm.company) {
      autogenerateCheck = "T";
    }
    this.compUpdateObj = {
      "papSuspendComments": this.companyFinancialDatatable.papSuspendComments,
      "businessTypeKey": this.selectedBusinessTypeKey,
      "coAdjustedPapAmt": this.adjustedPapAmt,
      "coAdjustedPapEndDt": this.changeDateFormatService.convertDateObjectToString(companyForm.value.financialDataForm.adjustedpapenddate), 
      "coAdminRate": companyForm.value.financialDataForm.adminrate,
      "coFaxPhoneNum": companyForm.value.companySetupForm.fax ? companyForm.value.companySetupForm.fax.replace(/[^0-9 ]/g, "") : '',
      "coId": companyForm.value.companySetupForm.company,
      "coL1MailAdd": companyForm.value.companySetupForm.address1,
      "coL2MailAdd": companyForm.value.companySetupForm.address2,
      "coName": companyForm.value.companySetupForm.companyName,
      "coStandardPapAmt": this.standardPapAmt,
      "coSuspendInd": "",
      "coWebSiteAdd": companyForm.value.companySetupForm.websiteAddress,
      "coWorkPhoneNum": companyForm.value.companySetupForm.phone.replace(/[^0-9 ]/g, ""),
      "extension": companyForm.value.companySetupForm.extension,
      "coPapSuspendInd": (companyForm.value.financialDataForm.papSuspended) ? 'T' : 'F',
      "coGstExemptInd": (companyForm.value.financialDataForm.exemptGst) ? 'T' : 'F',
      "postalCd": companyForm.value.companySetupForm.postalCode,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(companyForm.value.companySetupForm.effectiveOn),
      "countryName": companyForm.value.companySetupForm.country,
      "cityName": companyForm.value.companySetupForm.city,
      "provinceName": companyForm.value.companySetupForm.province,
      "travelStatus": (companyForm.value.travelInsuranceForm.enroll) ? 'T' : 'F',
      "travelEffectiveOn": companyForm.value.travelInsuranceForm.effectiveDate != null ? this.changeDateFormatService.convertDateObjectToString(companyForm.value.travelInsuranceForm.effectiveDate) : null,
      'travelTerminateOn': this.changeDateFormatService.convertDateObjectToString(companyForm.value.travelInsuranceForm.terminatedDate),
      "soldDate": this.changeDateFormatService.convertDateObjectToString(companyForm.value.salesDataForm.soldDate),
      "coBankInfoInd": (companyForm.value.companySetupForm.coBankInfoInd) ? 'T' : 'F',
      "autoGenerate": autogenerateCheck,
      "coPrintCardInd" : (companyForm.value.companySetupForm.coPrintCardInd) ? 'T' : 'F',
      "policyNum" :  (this.policyNum != "") ? companyForm.value.travelInsuranceForm.policyNumber : null 
    }
  }

  /* Log #1148: Document/File attached functionality */
  onFileChanged(event) {
    this.selectedFileName = ""
    this.selectedFile = event.target.files[0]
    var fileSize = this.selectedFile.size;
    if (fileSize > 1048576) {
      this.error1 = { isError: true, errorMessage: 'File size shuold not greater than 1 Mb!' };
      this.fileSizeExceeds = true
    }
    else {
      this.error1 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.selectedFileName = this.selectedFile.name
    this.terminateForm.patchValue({ 'fileName': this.selectedFileName})
    this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error2 = { isError: true, errorMessage: 'Only jpeg, jpg, png, pdf and docx file types are allowed.' };
    } else {
      this.error2 = { isError: false, errorMessage: '' };
    }
  } 

  removeExtension() {
    this.selectedFileName = ""
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };
    this.terminateForm.patchValue({ 'fileName': ''})
  }

  uploadDoc(coKey = null) {
    let promise = new Promise((resolve, reject) => {
      if (this.allowedValue && !this.fileSizeExceeds) {
        var formData = new FormData()
        let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
        let header = new Headers({ 'Authorization': this.currentUserService.token });
        let options = new RequestOptions({ headers: header });
        formData.append('docFile', this.selectedFile);
        formData.append('coId', coKey);
        this.hmsDataServiceService.sendFormData(CompanyApi.uploadDocuments, formData).subscribe(data => {
          if (data) {
            this.removeExtension()
            this.selectedFileName = ""
            setTimeout(() => {
              var reqParam = [{ 'key': 'coKey', 'value': coKey }]
              this.dataTableService.jqueryDataTableReload("company-upload-doc", CompanyApi.getDocumentList, reqParam)
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

  /* Log #1151: LETTER TO BROKER WHEN COMPANY TERMINATION LETTER RECEIVED */
    /* Broker Letter */
    letterToBroker(selectedCoKey, selectedTerminatedDate) {
      let brokerList = CompanyApi.CompanyLinkBrokerList
      this.TERMINATION_DATE = this.changeDateFormatService.changeDateByMonthName(selectedTerminatedDate)
      let reqParam = {
        'start': 0,
        'length': 25,
        'brokerIdAndName': "",
        'brokerPhone': "",
        'brokerCoComissionRate': "",
        'brokerEmail': "",
        'coKey': selectedCoKey //73 //2023 //32793 //32813,
      }
  
      var todayDate = this.changeDateFormatService.getToday();
        this.hmsDataServiceService.postApi(CompanyApi.CompanyLinkBrokerList, reqParam).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            let index = data.result.data.findIndex(x => x.primaryBrokerInd == "T") //optOutBrokerMailInd
            if (index == -1) {
              this.toastr.error(this.translate.instant('uft.toaster.thereIsNoPrimaryBrokerAttachedWithThisCompany'))
            } else {
              this.findBrokerByKey(data.result.data[index].brokerKey, selectedCoKey, selectedTerminatedDate).then(res => {
              })
            }
          } else {
            this.toastr.error(this.translate.instant('uft.toaster.thereIsNoBrokerAttachedWithThisCompany'))
          }
        })
    }

    findBrokerByKey(key, coKey, terminatedDate) {
      let promise = new Promise((resolve, reject) => {
        this.hmsDataServiceService.get(CompanyApi.getBrokerByKeyUrl + "/" + key).subscribe(data => {
          if (data.code == 302 && data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
            this.BROKER_NAME = data.result.brokerName
            this.BROKER_ADDRESS_LINE = data.result.brokerAddress1
            this.BROKER_CITY = data.result.brokerCity
            this.BROKER_PROVINCE = data.result.brokerProvince
            this.BROKER_POSTAL_CODE = data.result.brokerPostalCode
            this.getPrimaryBrokerContact(key).then(res => {
              if (this.isPrimaryBrokerContact) {
                // setTimeout(() => {
                //   this.downloadLetter('letterToBrokerContent', 'letterToBrokerContent')
                // }, 1000);
                this.getBrokerLetter(key, coKey, terminatedDate)
              } else {
                this.toastr.error(this.translate.instant('uft.toaster.thereIsNoBrokerPrimaryContact'))
              }
            })
            resolve()
          }
        })
      })
      return promise
    }

    getPrimaryBrokerContact(key) {
      let promise = new Promise((resolve, reject) => {
        let request = {
          'start': 0,
          'length': 25,
          'brokerKey': key
        }
        this.hmsDataServiceService.postApi(BrokerApi.brokerContactListUrl, request).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            let index = data.result.data.findIndex(x => x.brokerCompanyMainInd == "T")
            if (index == -1) {
              this.isPrimaryBrokerContact = false
            } else {
              this.BROKER_PRIMARY_CONTACT_FIRST_NAME = data.result.data[index].brokerContactFirstLastName
              this.BROKER_PRIMARY_CONTACT_LAST_NAME = data.result.data[index].brokerContactLastName
              this.isPrimaryBrokerContact = true
            }
            resolve()
          } else {
            this.isPrimaryBrokerContact = false
            this.toastr.error(this.translate.instant('uft.toaster.thereIsNoBrokerPrimaryContact'))
            resolve()
          }
        })
      })
      return promise
    }

  /* Log #1151: Letter To Plan Admin */ 
  letterToPlanAdmin(selectedCoKey, selectedTerminatedDate, dataRow) {
    this.TERMINATION_DATE = this.changeDateFormatService.changeDateByMonthName(selectedTerminatedDate)
    this.getPrimaryContactList(selectedCoKey).then(res => {
      if (this.isCompanyPrimaryContact) { 
          // setTimeout(() => {
          //   this.downloadLetter('planAdminLetterContent', 'planAdminLetterContent') // Log #1151: Letter to Plan Admin(2nd letter)
          // }, 2000);
          this.getPlanAdminLetter(selectedCoKey, selectedTerminatedDate, dataRow);
      } else {
        this.toastr.error(this.translate.instant('uft.toaster.thereIsNoCompanyPrimaryContact'))
      }
    })
  }

  getPrimaryContactList(key) {
    let promise = new Promise((resolve, reject) => {
      let request = {
        'coKey': key,
        'lastName': "",
        'firstName': "",
        'cityName': "",
        'provinceName': "",
        'countryName': "",
        'phone': "",
        'email': "",
        'effectiveOn': "",
        'expiredOn': "",
      }
      this.hmsDataServiceService.postApi(CompanyApi.companyContactList, request).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          let index = data.result.data.findIndex(x => x.mainContactInd == "T")
          if (index == -1) {
            this.isCompanyPrimaryContact = false
          } else {
            this.COMPANY_PRIMARY_CONTACT_FIRST_NAME = data.result.data[index].coContactFirstName
            this.COMPANY_PRIMARY_CONTACT_LAST_NAME = data.result.data[index].coContactLastName
            this.isCompanyPrimaryContact = true
          }
          resolve()
        } else {
          this.isCompanyPrimaryContact = false
          resolve()
        }
      })
    })
    return promise
  }

    downloadLetter(element, filename = '') {
      var html = document.getElementById(element).innerHTML;
      var doc = new jsPDF();
      var elementHandler = {
        '#ignorePDF': function (element, renderer) {
          return true;
        }
      };
      doc.fromHTML(
        html,
        15,
        15,
        {
          'width': 180, 'elementHandlers': elementHandler
        });
      doc.save(this.COMPANY_NAME + "_TERMINATION LETTER" + '.pdf');
    }

    getEFAPBenefitList() {
      this.addEFAPBenefitForm.patchValue({ 'efapCompanyName': this.compName });
      // this.setElementFocus('trgBenefitAdminRate');
      var efapBenefitTableId = "efapBenefitList"
      var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
      if (!$.fn.dataTable.isDataTable('#efapBenefitList')) {
        this.dataTableService.jqueryDataTable('efapBenefitList', CompanyApi.getCoEFAPBenefitListUrl, 'full_numbers', this.efapBenefitColumns, 5, true, false, 't', 'irp', undefined, [1, 'asc'], '', reqParam, this.efapBenefitTableAction, 3, [1, 2], '', [0], [1, 2, 3])
      } else {
        this.dataTableService.jqueryDataTableReload(efapBenefitTableId, CompanyApi.getCoEFAPBenefitListUrl, reqParam);
      }
    }

    submitEFAPBenefitForm(addEFAPBenefitForm){
      if (this.addEFAPBenefitForm.valid) {
        if(this.editEFAPMode){
          if(this.checkEFAPRate != this.addEFAPBenefitForm.value.efapRate){
            this.toastr.error(this.translate.instant('company.toaster.EFAPRateCannotBeChanged'));
            return false;
          }
        }
        let efapBenefitData = {
          "coKey": this.coKey,
          "efapRate": this.addEFAPBenefitForm.value.efapRate,
          "effectiveOn": this.addEFAPBenefitForm.value.efapEffectiveDate != null ? this.changeDateFormatService.convertDateObjectToString(this.addEFAPBenefitForm.value.efapEffectiveDate) : "",
          "expiredOn": this.addEFAPBenefitForm.value.efapExpiryDate != null ? this.changeDateFormatService.convertDateObjectToString(this.addEFAPBenefitForm.value.efapExpiryDate) : ""
        }
        if (this.coEfapEnrolmentKey == 0) {
          efapBenefitData
        } else {
          efapBenefitData['coEfapEnrolmentKey'] = this.coEfapEnrolmentKey
        }
        this.hmsDataServiceService.post(CompanyApi.addCoEFAPBenefitUrl, efapBenefitData).subscribe(data => {
          if (data.code == 400 && data.hmsShortMessage == 'DATE_SHOULD_BE_GREATER_NOW_DATE') {
            this.toastr.error(this.translate.instant('company.toaster.dateGreaterThanCurrent'));
            return false;
          } else if (data.code == 400 && data.hmsShortMessage == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIREDON') {
            this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanOldExpiry'));
            return false;
          } else if (data.code == 400 && data.hmsShortMessage == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
            this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanOldEffective'));
            return false;
          }
          if (data.code == 200 && data.status == 'OK') {
            if (data.hmsShortMessage == 'EFAP_BENEFIT_ADDED_SUCCESSFULLY') { 
              this.toastr.success(this.translate.instant('EFAP benefit added successfully!'));
            } else if (data.hmsMessage.messageShort == 'EFAP_BENEFIT_UPDATED_SUCCESSFULLY') {
              this.toastr.success(this.translate.instant('EFAP benefit updated successfully!'));
              this.buttonEFAPBenefit = this.translate.instant('button.save');
              this.editEFAPMode = false;
            }
            this.addEFAPBenefitForm.patchValue({ 'efapCompanyName': this.compName });
            var efapBenefitTableId = "efapBenefitList"
            var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
            this.dataTableService.jqueryDataTableReload(efapBenefitTableId, CompanyApi.getCoEFAPBenefitListUrl, reqParam);
            this.addEFAPBenefitForm.reset();
            this.addEFAPBenefitForm.patchValue({ 'efapCompanyName': this.compName });
            this.coAkiraEnrolmentKey = 0;
          }
        });
      } else {
        this.validateAllFormFields(this.addEFAPBenefitForm);
      }
    }
    resetEFAPBenefitForm(){
      this.addEFAPBenefitForm.reset();
      this.buttonEFAPBenefit = this.translate.instant('button.save');
    }

    deleteEFAPBenefit(efapBenefitKey) {
      this.exDialog.openConfirm(this.translate.instant('Are you sure that you want to delete?')).subscribe((value) => {
        if (value) {
          this.hmsDataServiceService.delete(CompanyApi.deleteCoEFAPBenefitUrl + '/' + efapBenefitKey).subscribe(data => {
            if (data.code == 200 && data.status == "OK") {
              this.toastr.success("Record Deleted Successfully")
              var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
              this.dataTableService.jqueryDataTableReload("efapBenefitList", CompanyApi.getCoEFAPBenefitListUrl, reqParam);
            } else {
              this.toastr.error("Record Not Deleted !")
            }
          })
        }
      });
    }

    editEFAPBenefit(coEfapEnrolmentKey, dataRow) {
      this.editEFAPMode = true;
      if (coEfapEnrolmentKey) {
        this.coEfapEnrolmentKey = coEfapEnrolmentKey
      } else {
        this.coEfapEnrolmentKey = 0
      }
      var efapRate = dataRow[0].replace("$", "");
      this.checkEFAPRate = efapRate;
      let benefit = {
        efapCompanyName: this.compName,
        efapRate: efapRate,
        efapEffectiveDate: this.changeDateFormatService.convertStringDateToObject(dataRow[1]),
        efapExpiryDate: this.changeDateFormatService.convertStringDateToObject(dataRow[2])
      }
      this.addEFAPBenefitForm.patchValue(benefit);
      this.buttonEFAPBenefit = this.translate.instant('button.update');
    }

    getPlanAdminLetter(coKey, termDate, selectedRowData) {
      let request = {
        "coKey" : selectedRowData.coKey,
        'gracePeriod': selectedRowData.coTerminClearDt,//GRACE_PERIOD
        'terminatedOn': termDate,
        'coContactFirstName': this.COMPANY_PRIMARY_CONTACT_FIRST_NAME, 
        'coContactLastName': this.COMPANY_PRIMARY_CONTACT_LAST_NAME 
      }
      this.hmsDataServiceService.postApi(CompanyApi.paCoTerminLetterUrl, request).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if (data.result != undefined && data.result != "") {
            window.open(data.result, '_blank');
          }
        } else if (data.code == 400 && data.hmsMessage.messageShort == 'COMPANY_NO_IS_MISSING') {
            this.toastr.error('Company No. Is Missing!!')
        } else {
          this.toastr.error(this.translate.instant('uft.toaster.letterNotGenerated'))
        }
      },(error) => {
        this.toastr.error(this.translate.instant('uft.toaster.letterNotGenerated'))
      })
    }

    getBrokerLetter(brokerKey, coKey, termDate) {
      let request = {
        'brokerKey': brokerKey,
        'coKey' : coKey,
        'terminatedOn': termDate,
        'brokerContactFirstLastName': this.BROKER_PRIMARY_CONTACT_FIRST_NAME, 
        'brokerContactLastName': this.BROKER_PRIMARY_CONTACT_LAST_NAME,
        'brokerContactFirstName': this.BROKER_PRIMARY_CONTACT_FIRST_NAME
      }
      this.hmsDataServiceService.postApi(CompanyApi.coBkTerminLetterUrl, request).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if (data.result != undefined && data.result != "") {
            window.open(data.result, '_blank');
          }
        } else if (data.code == 400 && data.hmsMessage.messageShort == 'COMPANY_NO_IS_MISSING') {
            this.toastr.error('Company No. Is Missing!!')
        } else if (data.code == 400 && data.hmsMessage.messageShort == 'BROKER_NO_IS_MISSING') {
          this.toastr.error('Broker No. Is Missing!!')
        } else {
          this.toastr.error(this.translate.instant('uft.toaster.letterNotGenerated'))
        }
      },(error) => {
        this.toastr.error(this.translate.instant('uft.toaster.letterNotGenerated'))
      })
    }
  
}
