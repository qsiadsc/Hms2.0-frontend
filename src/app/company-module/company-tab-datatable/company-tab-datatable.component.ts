import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Rx';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { IMyInputFocusBlur } from 'mydatepicker';
import { CompanyService } from '../company.service';
import { CompanyBankAccountComponent } from '../company-bank-account/company-bank-account.component'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompanyApi } from '../company-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { Constants } from '../../common-module/Constants'
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PlanApi } from './../plan/plan-api';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';

@Component({
  selector: 'app-company-tab-datatable',
  templateUrl: './company-tab-datatable.component.html',
  styleUrls: ['./company-tab-datatable.component.css'],
  providers: [ChangeDateFormatService, DatatableService, ToastrService, TranslateService]
})
export class CompanyTabDatatableComponent implements OnInit {
  expired = false;
  mainCompanyArrayUpdated: any;
  terminateDivision: any;
  showTable: boolean = false;
  planTableActions: any
  rowDivisionKey: any;
  cardSearch: boolean
  brokerSearh: boolean
  contactSearch: boolean
  planSearch: boolean = true
  //FocusVariable
  planListExist: boolean;
  showLoader: boolean;
  checkFocus;
  ObservableObj;
  ObservablePlanObj;
  ObservableContactObj;
  ObservableCardHolderObj;
  loaderPlaceHolder;
  docType;
  hasImage: boolean;
  imagePath;
  blobUrl;
  docName;
  checkPlan = true
  checkContact = true
  checkBroker = true
  checkCardHolder = true
  checkBrokerFocus;
  ObservableBrokerObj;

  openModalPop = false;
  phoneMask = CustomValidators.phoneMaskV1;
  editMode;
  addMode;
  viewMode;
  companyKey;
  titleName;
  brokerNameList = [];
  editLinkBrokerData;
  companyLinkBrokerData;
  editAddContactData;
  disabledBrokerId;
  disabledEffectiveDate;
  companyJson1;

  coContactKey;
  linkBrokerKey;
  coContactKeyDelete;
  linkBrokerKeyDelete;
  conpany_broker_url;
  reqParam;
  conpany_contact_url;
  planKey;
  divisionkey;
  companyPlanKeyDelete;
  company_plan_url;
  reqParamPlan;
  dateNameArray = {};
  noData //flag to check broker dropdown is empty or not
  alberta: boolean = false;
  error: any;
  plan_columns = [];
  company_contact_columns = [];
  company_broker_columns = [];
  companyCardColumns = [];
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerfilterOptions = CommonDatePickerOptions.myDatePickerFilterOptions;
  recordLength;
  yrTypeKey;

  @Input() addContact: FormGroup;
  @Input() linkBrokerForm: FormGroup;
  planSuspendedForm: FormGroup;
  @Input() companyId = '';
  @ViewChild("contactTitles") trgFocusContactTitlesEl: ElementRef;
  @ViewChild("brokerName") trgFocusBrokerNameEl: ElementRef;
  @ViewChild("commissionRateID") trgFocusCommissionRate: ElementRef;

  setGeneralInfo
  /**suspend Plan Variables */
  ObservableSuspendedCompanyObj: any;
  suspendedHistorytableData: any;
  suspendDisableDate: any;
  resumeTrue: boolean = false;
  checkSuspendedPlan = true
  planSuspendId: number;
  uniquePlanKey

  /**Terminate Plan Variables */
  isPlanTerminated: string;
  terminateForm: FormGroup;
  FormGroup: FormGroup;
  brokerForm: FormGroup //intailize Form
  terminationCategoryList = [];
  observableTerminationObj;
  observableDivisionTerminationObj;
  checkPlanTermination = true;
  termination_columns = [];
  terminationList = []
  uniqueDivisionKey;
  planTerminationDate: any;
  isValid: any;
  terminateButton: boolean;
  terminatePlanErrorMessages = [
    "DATE_SHOULD_BE_GREATER_NOW_DATE",
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
    "CLAIM_PAYMENT_MAX_MUST_BE_GREATER_THAN_EFFECTIVE_ON",
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
    "EFFECTIVEON_REQUIRED_FOR_PREVIOUS_ACCOUNT"
  ]

  /**Terminate Plan Division Variables */
  isPlanDivisionTerminated: string;
  terminateDivisionForm: FormGroup;
  terminationDivisionCategoryList = [];
  observableTerminatioDivisionObj;
  checkPlanDivisionTermination = true;
  termination_division_columns = [];
  terminationDivisionList = [];
  planDivisionTerminationDate: any;
  isValidDivision: any;
  terminateDivisionButton: boolean;
  contactTitleData: any;
  selectedContactTitle: any;

  contactLanguageList = [
    { "key": "1", "value": "English" },
    { "key": "2", "value": "French" },
    { "key": "3", "value": "Spanish" },
  ]

  planStatusList = [
    { "key": "F", "value": "Active" },
    { "key": "T", "value": "Suspended" },
    { "key": "terminated", "value": "Terminated" },
  ]

  public contactLanguageData: CompleterData;
  public brokerNameData: CompleterData;
  public cardHolderGenderData: CompleterData;
  public cardHolderRoleData: CompleterData;
  public cardHolderCardTypeData: CompleterData;
  public cardHolderStatusData: CompleterData;
  public planStatusData: CompleterData;
  selectedContactLanguage: any;
  selectedBrokerName: any;
  cardHolderGenderList: any[];
  cardHolderRoleList: { 'key': string; 'value': string; }[];
  cardHolderCardTypeList: { 'key': string; 'value': string; }[];
  cardHolderStatusList: { 'key': string; 'value': string; }[];
  selectedGenderKey: any;
  @Input() mainCompanyArray;
  updatePlanDataTableActions: any
  companyArray: any

  public isOpen: boolean = false;
  yrTypeDesc: any;
  selectedPlanStatusKey: any;
  selectedPlanStatusValue: any;
  ObservableRefundObj
  check = true
  noDataVal: boolean = false;
  linkBrokerDisable: boolean;
  observableObj: any;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  showPlanTable = new EventEmitter
  showPlanTableData = new EventEmitter
  filtersLoaded: Promise<boolean>;
  companyAuthChecks: any
  terminatePlanDataTable
  deletePlanDataTable
  viewPlanDataTable
  selectedPlanArray;
  companyCardholder: FormGroup;
  uftCallPlan: string
  showLinkLoader: boolean = false
  constructor(
    private companyService: CompanyService,
    private changeDateFormatService: ChangeDateFormatService,
    private currentUserService: CurrentUserService,
    private dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private exDialog: ExDialog,
    private ToastrService: ToastrService,
    private translate: TranslateService,
    private completerService: CompleterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.error = { isError: false, errorMessage: '' };

    companyService.getbussinessType.subscribe(businessType => {
      if (businessType == 1) {
        this.alberta = true
      } else if (businessType == 2) {
        this.alberta = false
      }
    });
    // general feedback 9 march action column icon's are not visible on refreshing company page 
    this.companyService.authCheckFilled.subscribe(right => {
    setTimeout(() => {
      if(this.mainCompanyArray[0].viewCompanyContact!="T"){
        $('#company-contact .view-ico').each(function() {
            $(this).hide();
      });
      }
      if(this.mainCompanyArray[0].deleteCompanyContact!="T"){
        $('#company-contact .del-ico').each(function() {
            $(this).hide();
      });
      }
    }, 3000);
    })
  }

  ngOnInit(): void {
    $("input[type='text']").attr("autocomplete", "off");
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;

    // Add/Edit Broker Form Validations
    this.brokerForm = new FormGroup({
      'broker_id': new FormControl('', []),
      'broker_name': new FormControl('', []),
      'gts_registration': new FormControl(''),
      'address1': new FormControl('', []),
      'address2': new FormControl('', []),
      'postalCode': new FormControl('', []),
      'city': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'province': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'country': new FormControl('', []),
      'email': new FormControl('', []),
      'phone_no': new FormControl('', []),
      'extension': new FormControl('', []),
      'fax_no': new FormControl(''),
      'effective_date': new FormControl(''),
      'brokerSuspensionInd': new FormControl(''),
      'optoutCompanyEmailInd': new FormControl(''),
      'brokerMultiCommAgrInd': new FormControl(''),
      'broker_termination_date': new FormControl(''), // Derfault disable Only for view purpose
      'broker_termination_reason': new FormControl('') // Derfault disable Only for view purpose
    });


    this.addContact = new FormGroup({
      'firstName': new FormControl('', [Validators.required, CustomValidators.combinationAlphabets, CustomValidators.notEmpty]),
      'fax': new FormControl('', [CustomValidators.notEmpty]),
      'phone': new FormControl('', []),
      'extension': new FormControl('', [Validators.minLength(3), Validators.maxLength(5), CustomValidators.onlyNumbers]),
      'lastName': new FormControl('', [Validators.required, CustomValidators.combinationAlphabets, CustomValidators.notEmpty]),
      'language': new FormControl('', [Validators.required]),
      'email': new FormControl('', [Validators.maxLength(50), CustomValidators.vaildEmail]),
      'address1': new FormControl('', [Validators.maxLength(50), CustomValidators.alphaNumericWithSpecialChar, CustomValidators.notEmpty]),
      'address2': new FormControl('', [Validators.maxLength(50), CustomValidators.alphaNumericWithSpecialChar, CustomValidators.notEmpty]),
      'postalCode': new FormControl('', [Validators.maxLength(7), CustomValidators.notEmpty]),
      'city': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'province': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'country': new FormControl('', [Validators.maxLength(60), CustomValidators.onlyAlphabets, CustomValidators.notEmpty]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl(''),
      'mailingAddress': new FormControl(''),
      'mainContact': new FormControl(''),
    })

    this.linkBrokerForm = new FormGroup({
      'commissionRate': new FormControl('', [Validators.required, CustomValidators.number, CustomValidators.digitWithDecimalCommRate]),
      'effectiveDate': new FormControl('', [Validators.required]),
      'expiredDate': new FormControl(''),
      'mainContact': new FormControl(''),
      'noMail': new FormControl(''),
      'brokerId': new FormControl('', [Validators.required])
    })

    /**Terminate Form */
    this.terminateForm = new FormGroup({
      'terminateDate': new FormControl('', [Validators.required]),
      'resumeDate': new FormControl('', []),
    })

    /**Terminate Plan Division Form */
    this.terminateDivisionForm = new FormGroup({
      'terminateDivisionDate': new FormControl('', [Validators.required]),
      'resumeDate': new FormControl('', []),
    })

    this.companyCardholder = new FormGroup({
      'cardHolderRole': new FormControl(),
      'status': new FormControl(),
    });


    //************************Start Data Tables (Company Contact, Company Plan, Link Broker and Card)************************
    /* Set Data in Json Format for datatable columns */

    this.ObservableContactObj = Observable.interval(800).subscribe(x => {
      if (this.checkContact = true) {
        if ('common.last-name' == this.translate.instant('common.last-name')) {
        } else {
          this.company_contact_columns = [
            { title: this.translate.instant('common.last-name'), data: 'coContactLastName' },
            { title: this.translate.instant('common.first-name'), data: 'coContactFirstName' },
            { title: this.translate.instant('common.city'), data: 'cityName' },
            { title: this.translate.instant('common.province'), data: 'provinceName' },
            { title: this.translate.instant('common.country'), data: 'countryName' },
            { title: this.translate.instant('common.phone'), data: 'coContactPhoneNum' },
            { title: this.translate.instant('common.email'), data: 'coContactEmailAdd' },
            { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
            { title: this.translate.instant('common.expirydate'), data: 'expiredOn' },
            { title: this.translate.instant('common.webUserId'), data: 'webUserId' },
            { title: this.translate.instant('common.action'), data: 'coContactKey' }
          ]
          this.checkContact = false;
          this.ObservableContactObj.unsubscribe();

        }
      }
    });

    this.ObservableBrokerObj = Observable.interval(800).subscribe(x => {
      if (this.checkBroker = true) {
        if ('company.company-tab-datatable.broker-datatables.broker-id' == this.translate.instant('company.company-tab-datatable.broker-datatables.broker-id')) {
        }
        else {
          this.company_broker_columns = [
            { title: this.translate.instant('company.company-tab-datatable.broker-datatables.broker-name-id'), data: 'brokerIdAndName' }, //
            { title: this.translate.instant('company.company-tab-datatable.broker-datatables.broker-phone-no'), data: 'brokerPhone' }, //
            { title: this.translate.instant('company.company-tab-datatable.broker-datatables.commission-rate'), data: 'brokerCoCommisionRate' },
            { title: this.translate.instant('company.company-tab-datatable.broker-datatables.email-address'), data: 'brokerEmail' },
            { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
            { title: this.translate.instant('common.expirydate'), data: 'expiredOn' },
            { title: this.translate.instant('common.isPrimary'), data: 'primaryBrokerInd' }, //optOutBrokerMailInd
            { title: this.translate.instant('common.action'), data: 'brokerCoAssgnKey' }
          ]
          this.checkBroker = false;
          this.ObservableBrokerObj.unsubscribe();
        }
      }
    });

    this.ObservableCardHolderObj = Observable.interval(800).subscribe(x => {
      if (this.checkCardHolder = true) {
        if ('company.company-tab-datatable.card-holder-datatables.card-id' == this.translate.instant('company.company-tab-datatable.card-holder-datatables.card-id')) {
        }
        else {
          this.companyCardColumns = [
            { title: this.translate.instant('company.company-tab-datatable.card-holder-datatables.card-id'), data: 'cardId' },
            { title: this.translate.instant('common.last-name'), data: 'lastName' },
            { title: this.translate.instant('common.first-name'), data: 'firstName' },
            { title: this.translate.instant('common.gender'), data: 'gender' },
            { title: this.translate.instant('common.date-of-birth'), data: 'dob' },
            { title: this.translate.instant('common.termination-date'), data: 'terminateDate' },
            { title: this.translate.instant('common.email-address'), data: 'email' },
            { title: this.translate.instant('common.role'), data: 'cardHolderRole' },
            { title: this.translate.instant('card.general-information.card-type'), data: 'cardHolderType' },
            { title: this.translate.instant('company.company-tab-datatable.plan-datatables.status'), data: 'status' },
          ]
          this.checkCardHolder = false;
          this.ObservableCardHolderObj.unsubscribe();
        }
      }
    });

    var self = this
    var contactTableId = "company-contact"
    var linkBrokerTableId = "company-broker"

    this.conpany_contact_url = CompanyApi.companyContactList;
    this.conpany_broker_url = CompanyApi.CompanyLinkBrokerList;
    this.company_plan_url = CompanyApi.getComopanyPlanListUrl;
    var cardListUrl = CompanyApi.getCardSearchByTypeFilter

    this.reqParam = [
      { 'key': 'coKey', 'value': this.companyId },
      { 'key': 'cardHolderRole', 'value': 'Primary' },
      { 'key': 'cardId', 'value': '' },
      { 'key': 'cardType', 'value': '' },
      { 'key': 'dob', 'value': '' },
      { 'key': 'terminateDate', 'value': '' },
      { 'key': 'email', 'value': '' },
      { 'key': 'firstName', 'value': '' },
      { 'key': 'gender', 'value': '' },
      { 'key': 'lastName', 'value': '' },
      { 'key': 'status', 'value': 'Active' }
    ]

    this.reqParamPlan = [
      { 'key': 'coKey', 'value': this.companyId },
      { 'key': 'planId', 'value': '' },
      { 'key': 'divisionName', 'value': '' },
      { 'key': 'divisionSuspendInd', 'value': '' },
      { 'key': 'effectiveOn', 'value': '' }
    ]

    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'showAction': 'F' },
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': 'F' }
    ]

    if (this.editMode) {
      this.companyKey = this.companyId;
    }

    //************************End Data Tables (Company Contact, Company Plan, Link Broker and Card)************************

    this.planSuspendedForm = new FormGroup({
      suspendOn: new FormControl('', Validators.required),
      resumeOn: new FormControl(''),
      suspendPlanComment: new FormControl(''),
      planKey: new FormControl(''),
    });
  
    this.getMainCompanyArray().then(res => {
      this.updatePlanDataTableActions = this.mainCompanyArrayUpdated
      this.CheckPlanExistInCompany(this.companyId).then(res => {
        this.planTableActions = [
          { 'name': 'units', 'class': 'table-action-btn unit-ico', 'icon_class': 'glyphicon glyphicon-th', 'showAction': 'T' },
          { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'showAction': this.updatePlanDataTableActions[0].viewDivision },
          { 'name': 'terminate', 'class': 'table-action-btn ter-ico', 'icon_class': 'fa fa-minus', 'showAction': this.updatePlanDataTableActions[0].terminateDivision }
        ]
        var URL = CompanyApi.getCompanyPlanUrl;
        let planKey = {
          "coKey": this.companyId,
          "plansKey": this.uniquePlanKey,
          "divisionKey": this.uniqueDivisionKey
        };
        this.hmsDataServiceService.post(URL, planKey).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.isPlanTerminated = data.result.planInfoJson.planStatus
          }
        });

        /** Plan Suspend History */

        var suspendPlanTableActions = [
          { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-edit', 'showAction': this.mainCompanyArray[0].editSuspensPlan },
        ]
        // save suspend Save
        var suspend_plan_url = CompanyApi.planSuspendList;
        var suspendTableID = "suspendTableID";
        var reqParamSuspentPlan = [{ 'key': 'plansKey', 'value': this.uniquePlanKey }]

        this.ObservableSuspendedCompanyObj = Observable.interval(1000).subscribe(x => {
          if (this.checkSuspendedPlan = true) {
            if ('company.company-tab-datatable.suspend-plan-history.plan-suspend-date' == this.translate.instant('company.company-tab-datatable.suspend-plan-history.plan-suspend-date')) {
            }
            else {
              var suspended_plan_columns = [
                { title: this.translate.instant('company.company-tab-datatable.suspend-plan-history.plan-suspend-date'), data: 'suspendedOn' },
                { title: this.translate.instant('company.company-tab-datatable.suspend-plan-history.plan-resume-date'), data: 'resumedOn' },
                { title: this.translate.instant('company.company-tab-datatable.suspend-plan-history.plan-comment'), data: 'planSuspendHistCom' },
                { title: this.translate.instant('common.action'), data: 'planSuspendHistKey' }
              ];
              var dateCols = ['suspendedOn', 'resumedOn']
              if (!$.fn.dataTable.isDataTable('#suspendTableID')) {
                this.dataTableService.jqueryDataTable(suspendTableID, suspend_plan_url, 'full_numbers', suspended_plan_columns, 5, true, false, 'lt', 'irp', undefined, [0, 'asc'], '', reqParamSuspentPlan, suspendPlanTableActions, 3, [0, 1])
              }
              this.checkSuspendedPlan = false;
              this.ObservableSuspendedCompanyObj.unsubscribe();
            }
          }
        });

        /**Terminate Plan Start */
        var termination_history_url = CompanyApi.getTerminatePlanListUrl;
        var planTerminateTableId = "termination-plan-history";
        var reqPlanTerminateParam = [{ 'key': 'plansKey', 'value': this.uniquePlanKey }]

        //Table Termination
        this.observableTerminationObj = Observable.interval(1000).subscribe(x => {
          if (this.checkPlanTermination = true) {
            if ('company.company-terminate.termination-reason' == this.translate.instant('company.company-terminate.termination-reason')) {
            }
            else {
              this.termination_columns = [
                { title: this.translate.instant('company.company-terminate.termination-date'), data: 'planTerminateDate' },
                { title: this.translate.instant('company.company-terminate.reactivation-date'), data: 'planRestartOn' }]
              this.checkPlanTermination = false
              this.observableTerminationObj.unsubscribe();
            }
          }
        });
        /**Terminate Plan End */
        
              this.plan_columns = [
                { title: this.translate.instant('company.company-tab-datatable.plan-datatables.division-name'), data: 'divisionName' },
                { title: this.translate.instant('company.company-tab-datatable.plan-datatables.division-no.'), data: 'divisionId' },
                { title: this.translate.instant('company.company-tab-datatable.plan-datatables.status'), data: 'divisionSuspendInd' },
                { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
                { title: this.translate.instant('common.action'), data: 'plansKey' }
              ]
              if (!$.fn.dataTable.isDataTable('#plan-datatable')) {
                this.dataTableService.jqueryDataTablePlan('plan-datatable', this.company_plan_url, 'full_numbers',
                  this.plan_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reqParamPlan, this.planTableActions, 4, 2, [3], '', '', [1, 2, 3, 4])
              }

              if (this.updatePlanDataTableActions[0].viewDivision == 'T') {

                $(document).on('click', '#plan-datatable .view-ico', function () {
                  var planId = $(this).data('id');
                  var divisionId = $(this).data('divisionkey');
                  self.selectedPlanArray = self.dataTableService.selectedPlanRowData;
                  self.planKey = planId
                  self.divisionkey = divisionId
                  self.ViewPlanPage()
                })
              }
           this.setPlanYearType();
      });
    })
  

    var namePrefixURL = CompanyApi.namePrefixURL;
    this.hmsDataServiceService.getApi(namePrefixURL).subscribe(data => {
      if (data.code == 200) {
        this.titleName = data.result;
        //Predictive Company Search Upper
        this.contactTitleData = this.completerService.local(
          this.titleName,
          "personNamePrefixDesc",
          "personNamePrefixDesc"
        );
      }
    });

    /**Filter Grid On press enter plan-datatable, company-contact, company-broker, companySearchCardTable */
    $(document).on('keydown', '#plan-datatable .btnpickerenabled, #company-contact .btnpickerenabled, #company-broker .btnpickerenabled,#companySearchCardTable .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })

    setTimeout(() => {
      this.resetTableSearch('company-contact');
    }, 2000);

    /* Adding Call-In Dashboard's Plan Details button functionality */
    this.route.queryParams.subscribe(params => {
      this.uftCallPlan = params.uftCall
      if (this.uftCallPlan == "true") {
        $('#planTabClick').trigger('click');
        setTimeout(() => {
          $('#contactTab').removeClass("active");
          $('#planTab').addClass("active")
        }, 1000);
      }
    })

  }

  ngAfterViewInit() {
    //Predictive Company Search Upper
    this.contactLanguageData = this.completerService.local(
      this.contactLanguageList,
      "value",
      "value"
    );

    //Predictive Company Search Upper
    this.planStatusData = this.completerService.local(
      this.planStatusList,
      "value",
      "value"
    );

    this.cardHolderGenderList = [
      { 'key': 'M', 'value': 'Male' },
      { 'key': 'F', 'value': 'Female' },
      { 'key': 'O', 'value': 'Other' },
    ]

    //Predictive Company Search Upper
    this.cardHolderGenderData = this.completerService.local(
      this.cardHolderGenderList,
      "value",
      "value"
    );

    this.cardHolderRoleList = [
      { 'key': 'Dependent', 'value': 'Dependent' },
      { 'key': 'Primary', 'value': 'Primary' },
      { 'key': 'Spouse', 'value': 'Spouse' },
    ]

    //Predictive Company Search Upper
    this.cardHolderRoleData = this.completerService.local(
      this.cardHolderRoleList,
      "value",
      "value"
    );

    this.cardHolderCardTypeList = [
      { 'key': 'FAMILY', 'value': 'Family' },
      { 'key': 'SINGLE', 'value': 'Single' },
    ]

    //Predictive Company Search Upper
    this.cardHolderCardTypeData = this.completerService.local(
      this.cardHolderCardTypeList,
      "value",
      "value"
    );

    this.cardHolderStatusList = [
      { 'key': 'all', 'value': 'All' },
      { 'key': 'active', 'value': 'Active' },
      { 'key': 'inactive', 'value': 'Inactive' },
    ]

    //Predictive Company Search Upper
    this.cardHolderStatusData = this.completerService.local(
      this.cardHolderStatusList,
      "value",
      "value"
    );
  }

  onLanguageSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedContactLanguage = (selected.originalObject.key).toString();
    }
    else {
      this.selectedContactLanguage = '';
    }
  }

  onTitleSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedContactTitle = (selected.originalObject.personNamePrefixKey).toString();
    }
    else {
      this.selectedContactTitle = '';
    }
  }

  /**
   * Select the plan status option
   * @param selected 
   */
  onPlanStatusSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedPlanStatusKey = (selected.originalObject.key).toString();
      this.selectedPlanStatusValue = (selected.originalObject.value).toString();
    }
    else {
      this.selectedPlanStatusKey = '';
      this.selectedPlanStatusValue = '';
    }
  }

  /**
   * Function to check plan exist in company
   * or not if yes then show add division button
   * else show add plan button
   */
  CheckPlanExistInCompany(coKey) {
    let promise = new Promise((resolve, reject) => {
      let planDataJson = {
        "coKey": coKey
      }

      var URL = CompanyApi.getComopanyPlanListUrl;
      this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          if (data.result.data.length > 0) {
            this.uniquePlanKey = data.result.data[0].plansKey
            this.uniqueDivisionKey = data.result.data[0].divisionKey
            this.checkPlanTerminate();
            this.planListExist = true;
            resolve();
          } else {
            this.planListExist = false;
          }
        } else {
          if (!$.fn.dataTable.isDataTable('#termination-division-history')) {
            this.ObservablePlanObj = Observable.interval(1000).subscribe(x => {
              if (this.checkPlan = true) {
                if ('company.company-tab-datatable.plan-datatables.plan-id' == this.translate.instant('company.company-tab-datatable.plan-datatables.plan-id')) {
                } else {
                  var planTableActions = [
                    { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'showAction': this.updatePlanDataTableActions[0].viewDivision },
                    { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': this.updatePlanDataTableActions[0].deleteDivision },
                    { 'name': 'terminate', 'class': 'table-action-btn ter-ico', 'icon_class': 'fa fa-minus', 'showAction': this.updatePlanDataTableActions[0].terminateDivision }
                  ]
                  this.plan_columns = [
                    { title: this.translate.instant('company.company-tab-datatable.plan-datatables.division-name'), data: 'divisionName' },
                    { title: this.translate.instant('company.company-tab-datatable.plan-datatables.division-no.'), data: 'divisionId' },
                    { title: this.translate.instant('company.company-tab-datatable.plan-datatables.status'), data: 'divisionSuspendInd' },
                    { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
                    { title: this.translate.instant('common.action'), data: 'plansKey' }
                  ]
                  this.dataTableService.jqueryDataTablePlan('plan-datatable', this.company_plan_url, 'full_numbers',
                    this.plan_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reqParamPlan, planTableActions, 4, 3, [4], '', '', [1, 2, 3, 4])   // No of Entries count is appearing blank in Plan Tab fixed By Abhay (point no -90)
                  this.checkPlan = false;
                  this.ObservablePlanObj.unsubscribe();
                }
              }
              var planTableActions = [
                { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'showAction': this.updatePlanDataTableActions[0].viewDivision },
                { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': this.updatePlanDataTableActions[0].deleteDivision },
                { 'name': 'terminate', 'class': 'table-action-btn ter-ico', 'icon_class': 'fa fa-minus', 'showAction': this.updatePlanDataTableActions[0].terminateDivision }
              ]
              this.setPlanYearType();
            });
          } else {
            var planTableActions = [
              { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'showAction': this.updatePlanDataTableActions[0].viewDivision },
              { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': this.updatePlanDataTableActions[0].deleteDivision },
              { 'name': 'terminate', 'class': 'table-action-btn ter-ico', 'icon_class': 'fa fa-minus', 'showAction': this.updatePlanDataTableActions[0].terminateDivision }
            ]
            this.dataTableService.jqueryDataTableReload('plan-datatable', this.company_plan_url, planTableActions)
          }
        }
      });
    });
    return promise;
  }

  checkPlanTerminate() {
    var URL = CompanyApi.getPlanStatusUrl;
    let planKey = { "plansKey": this.uniquePlanKey };
    this.hmsDataServiceService.post(URL, planKey).subscribe(data => {
      if (data.code == 200 && data.status === "OK" && data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        this.isPlanTerminated = data.result.planStatus
      }
    });
  }

  checkDivisionTerminate() {
    var URL = CompanyApi.getDivisionStatusUrl;
    let divisionKey = { "divisionKey": this.rowDivisionKey };
    this.hmsDataServiceService.post(URL, divisionKey).subscribe(data => {
      if (data.code == 200 && data.status === "OK" && data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        this.isPlanDivisionTerminated = data.result.divisionStatus
      }
    });
  }

  /**
   * Function to check plan exist in company
   * or not if yes then show add division button
   * else show add plan button
   */
  getPlanKey(coKey) {
    let planDataJson = {
      "coKey": coKey
    }
    var URL = CompanyApi.getComopanyPlanListUrl;
    this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        if (data.result.data.length > 0) {
          return this.uniquePlanKey = data.result.data[0].plansKey
        }
      }
    });
  }

  /**
   * 
   * @param formGroup 
   */
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

  /**
   * Delete Company Plan
   * @param coPlanId 
   */
  deleteCompanyPlan(coPlanId) {
    this.selectedPlanArray = this.dataTableService.selectedPlanRowData;
    var str = ''
    if (this.selectedPlanArray != undefined) {
      if (this.selectedPlanArray['divisionSuspendInd'] == 'T') {
        if (this.selectedPlanArray['divisionStatus'] == 'Terminated') {
          str = 'Terminated'
        } else {
          str = 'Suspended'
        }
      } else {
        if (this.selectedPlanArray['divisionStatus'] == 'Terminated') {
          str = 'Terminated'
        } else {
          str = 'Active'
        }
      }
    }

    if (str == 'Terminated') {
      this.ToastrService.error(this.translate.instant('company.toaster.divisionTerminatedSoUnableToDeleteDivision'))
    } else {

      const companyContactDeleteData = {
        "plansKey": coPlanId,
        "coKey": this.companyId,
        "divisionKey": this.divisionkey
      }
      let deleteCompanyPlanUrl = CompanyApi.deleteCompanyPlan;
      let companyPlanDeleteJson = Object.assign(companyContactDeleteData);
      this.exDialog.openConfirm(this.translate.instant('company.exDialog.confirmDelete')).subscribe((valueDeletePlan) => {
        if (valueDeletePlan) {
          this.hmsDataServiceService.post(deleteCompanyPlanUrl, companyPlanDeleteJson).subscribe(data => {
            if (data.code == 200) {
              this.ToastrService.success(this.translate.instant('company.toaster.planDeleted'))
              this.dataTableService.jqueryDataTableReload("plan-datatable", this.company_plan_url, this.reqParam);
            }
          });
        } else {
          return false
        }
      });
    }
  }

  //******Company Contact Add/Update/Delete(Start)******
  /**
   * Used to Add/Update Comapny Conatact
   * @param addContactvalues 
   */
  addUpdateCompanyContact(addContactvalues) {
    if (this.addContact.valid) {
      let companyData = {
        "coKey": this.companyId,
        "coPersonNamePrefixKey": this.selectedContactTitle,
        "coContactEmailAdd": addContactvalues.value.email,
        "coContactFaxNum": addContactvalues.value.fax,
        "coContactFirstName": addContactvalues.value.firstName,
        "coContactLastName": addContactvalues.value.lastName,
        "coContactL1Add": addContactvalues.value.address1,
        "coContactL2Add": addContactvalues.value.address2,
        "coContactPhoneNum": addContactvalues.value.phone,
        "coContactExtension": addContactvalues.value.extension,
        "expiredOn": (addContactvalues.value.expiredOn) ? this.changeDateFormatService.convertDateObjectToString(addContactvalues.value.expiredOn) : '',
        "effectiveOn": (addContactvalues.value.effectiveOn) ? this.changeDateFormatService.convertDateObjectToString(addContactvalues.value.effectiveOn) : '',
        "cityName": (addContactvalues.value.city) ? addContactvalues.value.city : '',
        "provinceName": (addContactvalues.value.province) ? addContactvalues.value.province : '',
        "countryName": (addContactvalues.value.country) ? addContactvalues.value.country : '',
        "postalCode": (addContactvalues.value.postalCode) ? addContactvalues.value.postalCode : '',
        "updatedOn": this.changeDateFormatService.convertDateObjectToString(addContactvalues.value.expiredOn),
        "languageKey": this.selectedContactLanguage,
        "mainContactInd": (addContactvalues.value.mainContact) ? 'T' : 'F',
        "mailContactInd": (addContactvalues.value.mailingAddress) ? 'T' : 'F',
      }

      if (this.editMode) {
        companyData['coContactKey'] = this.coContactKey;
      }

      let companyJson = Object.assign(companyData);
      if (this.editMode && companyJson.expiredOn != '' && companyJson.mainContactInd == 'T') {
        this.exDialog.openConfirm(this.translate.instant('company.company-tab-datatable.contact-datatables.primaryContactConfirmation')).subscribe((value) => {
          if (value) {
            this.addOrUpdateCompanyContact(companyJson);
          } else {
            return false;
          }
        })
      } else {
        this.addOrUpdateCompanyContact(companyJson);
      }
    }
    else {
      this.validateAllFormFields(this.addContact);
      //Get focus on Invalid field
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  addOrUpdateCompanyContact(companyJson) {
    var URL = CompanyApi.addCompanyContact;
    var contactDataTableURL = CompanyApi.companyContactList;
    var contactDataTableReqParam = [{ 'key': 'coKey', 'value': this.companyId }]
    this.hmsDataServiceService.postApi(URL, companyJson).subscribe(data => {
      if (data.code == 200 && data.status == "OK" && (data.hmsMessage.messageShort == "COMPANY_CONATCT_ADDED_OR_UPDATED_SUCCESSFULLY")) {
        this.hmsDataServiceService.OpenCloseModal("btnCloseCompanyAddContact");
        this.addContact.reset();
        if (this.addMode) {
          this.ToastrService.success(this.translate.instant('company.toaster.company_contact_added'))
        } else if (this.editMode) {
          this.ToastrService.success(this.translate.instant('company.toaster.company_contact_updated'))
        }
        this.dataTableService.jqueryDataTableReload("company-contact", contactDataTableURL, contactDataTableReqParam)
      } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.message == 'EFFECTIVE_DATE_SHOULD_BE_GREATER_THAN_COMPANY_EFFECTIVE_DATE') {
        this.ToastrService.error(this.translate.instant('company.toaster.effectiveDateGreaterThanCompanyEffective'));
      }
    });
    this.addContact.reset()  // Contacts are adding multiple times when click on Save button issues
  }

  /**
   * Used To Delete Company Contact
   * @param coContactId 
   */
  deleteAddContact(coContactId) {
    const companyContactDeleteData = [{
      "coContactKey": coContactId
    }]

    let deleteContactContactUrl = CompanyApi.deleteCompanyContact;
    let companyContactDeleteJson = Object.assign(companyContactDeleteData);

    this.exDialog.openConfirm(this.translate.instant('company.exDialog.confirmDelete')).subscribe((value) => {
      if (value) {
        this.hmsDataServiceService.postApi(deleteContactContactUrl, companyContactDeleteJson).subscribe(data => {
          if (data.code == 200) {
            this.ToastrService.success(this.translate.instant('company.toaster.company_contact_deleted'))
            this.dataTableService.jqueryDataTableReload("company-contact", this.conpany_contact_url, this.reqParam);
          }
        });
      }
    });
  }

  /**
   * Used To Edit Company Contact
   * @param id 
   */
  editAddContact(id) {
    $("#CompanyAddContact").toggle();
    this.addMode = false
    this.viewMode = true
    this.editMode = false
    this.addContact.disable();
    this.error = { isError: false, errorMessage: '' };

    const companyContactData = {
      "coContactKey": id
    }
    let getAddContactUrl = CompanyApi.getCompanyContactByContactKey;
    let companyContactJson = Object.assign(companyContactData);
    this.hmsDataServiceService.postApi(getAddContactUrl, companyContactJson).subscribe(data => {
      switch (data.code) {
        case 404:
          this.ToastrService.success(this.translate.instant('company.toaster.badRequest'));
          break;
        case 500:
          this.ToastrService.success(this.translate.instant('company.toaster.internalServerError'));
          break;
        case 200:
          this.editAddContactData = data.result
          const companyContactData = {
            'firstName': this.editAddContactData.coContactFirstName,
            'fax': (this.editAddContactData.coContactFaxNum) ? this.editAddContactData.coContactFaxNum.trim() : '',
            'phone': (this.editAddContactData.coContactPhoneNum) ? this.editAddContactData.coContactPhoneNum.trim() : '',
            'extension': this.editAddContactData.coContactExtension != null ? this.editAddContactData.coContactExtension : '',
            'lastName': this.editAddContactData.coContactLastName,
            'language': this.editAddContactData.languageDesc,
            'email': this.editAddContactData.coContactEmailAdd,
            'address1': this.editAddContactData.coContactL1Add,
            'address2': this.editAddContactData.coContactL2Add,
            'postalCode': this.editAddContactData.postalCode,
            'city': this.editAddContactData.cityName,
            'province': this.editAddContactData.provinceName,
            'country': this.editAddContactData.countryName,
            'effectiveOn': this.changeDateFormatService.convertStringDateToObject(this.editAddContactData.effectiveOn),
            'expiredOn': this.changeDateFormatService.convertStringDateToObject(this.editAddContactData.expiredOn),
            'mailingAddress': (this.editAddContactData.mailContactInd == 'T') ? true : false,
            'mainContact': (this.editAddContactData.mainContactInd == 'T') ? true : false,
          }
          this.selectedContactLanguage = this.editAddContactData.languageKey
          this.selectedContactTitle = (this.editAddContactData.coPersonNamePrefixKey).toString();
          this.addContact.setValue(companyContactData);
          break;
      }
    });
  }


  editCompanyAddContact() {
    this.setElementFocus('trgFocusContactTitlesEl');
    this.addMode = false
    this.viewMode = false
    this.editMode = true
    this.addContact.enable();
  }
  //************************Company Contact Add/Update/Delete(End)************************

  //************************Link Broker Add/Update/Delete(Start)************************
  /**
   * Used To Add/ Update Company Broker
   * @param linkBrokerForm 
   */
  addUpdateCompanyLinkBroker(linkBrokerForm) {
    this.showLinkLoader = true
    if (this.linkBrokerForm.valid) {
      let linkBrokerData = {
        "coKey": this.companyId,
        "createdBy": "tesd",
        "effectiveBy": "test",
        "expiredBy": "test",
        "expiredOn": (linkBrokerForm.value.expiredDate) ? this.changeDateFormatService.convertDateObjectToString(linkBrokerForm.value.expiredDate) : '',
        "primaryBrokerInd": (linkBrokerForm.value.mainContact) ? 'T' : '',//optOutBrokerMailInd
        "optOutCompanyEmailInd": linkBrokerForm.value.noMail ? 'T' : '',
        "brokerCoCommisionRate": linkBrokerForm.value.commissionRate,
        "optOutBrokerMailInd": ''
      }

      if (this.addMode) {

        linkBrokerData["effectiveOn"] = (linkBrokerForm.value.effectiveDate) ? this.changeDateFormatService.convertDateObjectToString(linkBrokerForm.value.effectiveDate) : '';
        linkBrokerData["brokerKey"] = this.selectedBrokerName;
      } else if (this.editMode) {
        linkBrokerData["effectiveOn"] = this.changeDateFormatService.convertDateObjectToString(this.disabledEffectiveDate);
        linkBrokerData["brokerKey"] = this.disabledBrokerId;
        linkBrokerData["brokerCoAssgnKey"] = this.linkBrokerKey;
      }

      this.companyJson1 = Object.assign(linkBrokerData);
      var URL = CompanyApi.addCompanyLinkBroker;
      this.hmsDataServiceService.postApi(URL, this.companyJson1).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && (data.hmsShortMessage == "RECORD_UPDATED_SUCCESSFULLY" || data.hmsShortMessage == "RECORD_SAVE_SUCCESSFULLY")) {
          this.showLinkLoader = false
          this.hmsDataServiceService.OpenCloseModal("btnCloseCompanyLinkBroker");
          this.linkBrokerForm.reset();
          if (this.addMode) {
            this.ToastrService.success(this.translate.instant('company.toaster.broker_linked'))
          } else if (this.editMode) {
            this.ToastrService.success(this.translate.instant('company.toaster.broker_updated'))
          }
          this.dataTableService.jqueryDataTableReload("company-broker", this.conpany_broker_url, this.reqParam);
          this.addMode = true;
          this.viewMode = false;
          this.editMode = false; // mantis issue 0179404
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == "EFFECTIVE DATE_SHOULD_BE_GREATER_BROKER_HISTORY_EFFECTIVE DATE") {
          this.showLinkLoader = false
          this.ToastrService.error(this.translate.instant('company.toaster.effectiveDateGreaterThanBroker'));
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == "EFFECTIVE_DATE_SHOULD_BE_LESS_THAN_COMPANY_TERMINATED_DATE") {
          this.showLinkLoader = false
          this.ToastrService.error(this.translate.instant('company.toaster.effectiveDateLessThanCompanyTerminate'));
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'EFFECTIVE_DATE_SHOULD_BE_GREATER_THAN_COMPANY_EFFECTIVE_DATE') {
          this.showLinkLoader = false
          this.ToastrService.error(this.translate.instant('company.toaster.effectiveDateGreaterThanCompanyEffective'));
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == "EFFECTIVEON_SHOULD_BE_GREATER_BROKER_HISTORY_EFFECTIVEON") {
          this.showLinkLoader = false
          this.ToastrService.error(this.translate.instant('company.toaster.effectiveOnShouldBeGreaterThanBrokerHistoryEffectiveOn'))
        } else {
          this.showLinkLoader = false
          this.ToastrService.error(this.translate.instant('company.toaster.brokerNotLinked'))
        }
      });
    }
    else {
      this.showLinkLoader = false
      this.validateAllFormFields(this.linkBrokerForm);
      //Get focus on Invalid field
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  /**
   * Used To Delete broker
   * @param id 
   */
  deleteLinkBroker(id) {
    const linkBrokerDeleteData = {
      "brokerCoAssgnKey": this.linkBrokerKeyDelete
    }
    let deleteLinkBrokertUrl = CompanyApi.deleteLinkBroker;
    let linkBrokerDeleteJson = Object.assign(linkBrokerDeleteData);
    this.exDialog.openConfirm(this.translate.instant('company.exDialog.confirmDelete')).subscribe((value) => {
      if (value) {
        this.hmsDataServiceService.postApi(deleteLinkBrokertUrl, linkBrokerDeleteJson).subscribe(data => {
          if (data.code == 200) {
            this.ToastrService.success(this.translate.instant('company.toaster.broker_deleted'));
            this.dataTableService.jqueryDataTableReload("company-broker", this.conpany_broker_url, this.reqParam);
          }
        });
      }
    });
  }

  /**
   * User To Delete Link Broker
   * @param linkBrokerId 
   */
  editLinkBroker(linkBrokerId) {
    this.addMode = false
    this.viewMode = true
    this.editMode = false
    this.linkBrokerForm.disable();
    this.error = { isError: false, errorMessage: '' };
    let getLinkBrokerUrl = CompanyApi.CompanyLinkBrokerEdit + '/' + linkBrokerId;
    //Get data From Service
    this.hmsDataServiceService.getApi(getLinkBrokerUrl).subscribe(data => {
      if (data.code == 302 && data.hmsShortMessage == "RECORD_GET_SUCCESSFULLY") {
        this.findBrokerById(data.result.brokerKey);
        const editLinkBrokerData = data.result
        this.disabledBrokerId = editLinkBrokerData.brokerKey;
        this.disabledEffectiveDate = this.changeDateFormatService.convertStringDateToObject(editLinkBrokerData.effectiveOn)

        //Create JSON to set data in Link Broker Form In Edit and Update Mode
        this.companyLinkBrokerData = {
          "commissionRate": editLinkBrokerData.brokerCoCommisionRate,
          "effectiveDate": this.changeDateFormatService.convertStringDateToObject(editLinkBrokerData.effectiveOn),
          "expiredDate": this.changeDateFormatService.convertStringDateToObject(editLinkBrokerData.expiredOn),
          "brokerId": editLinkBrokerData.brokerName,
          'mainContact': (editLinkBrokerData.primaryBrokerInd == 'T') ? true : false,//optOutBrokerMailInd
          'noMail': (editLinkBrokerData.optOutCompanyEmailInd == 'T') ? true : false
        }
        //Set values in Form
        this.linkBrokerForm.setValue(this.companyLinkBrokerData);
      }
    });
  }

  editCompanyLinkBroker() {
    this.addMode = false
    this.viewMode = false
    this.editMode = true
    this.linkBrokerForm.controls['commissionRate'].enable();
    this.linkBrokerForm.controls['expiredDate'].enable();
    this.linkBrokerForm.controls['mainContact'].enable();
    this.linkBrokerForm.controls['noMail'].enable();
    // Below one changed focus to Commission rate because broker name disabled in edit mode as per discussed. (18-01-2024) Prabhat 
    this.setElementFocus('trgFocusCommissionRate');
    //---------- Focus-----------
  }
  //************************Link Broker Add/Update/Delete(End)************************  

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
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
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }

    if (event.reason == 2) {
      if (formName == 'addContact') {
        if (datePickerValue) {
          this.addContact.patchValue(datePickerValue);
        }
        if (this.addContact.value.effectiveOn && this.addContact.value.expiredOn) {
          this.error = this.changeDateFormatService.compareTwoDates(this.addContact.value.effectiveOn.date, this.addContact.value.expiredOn.date);
          if (this.error.isError == true) {
            this.addContact.controls['expiredOn'].setErrors({
            });
          }
        }
        // Set Date Picker Value to Form Control Element
      } else if (formName == 'linkBrokerForm') {
        if (datePickerValue) {
          this.linkBrokerForm.patchValue(datePickerValue);
        }
        if (this.linkBrokerForm.value.effectiveDate && this.linkBrokerForm.value.expiredDate) {
          this.error = this.changeDateFormatService.compareTwoDates(this.linkBrokerForm.value.effectiveDate.date, this.linkBrokerForm.value.expiredDate.date);
        }
        if (this.disabledEffectiveDate && this.linkBrokerForm.value.expiredDate) {
          this.error = this.changeDateFormatService.compareTwoDates(this.disabledEffectiveDate.date, this.linkBrokerForm.value.expiredDate.date);
        }
      } else if (formName == 'terminateForm') {
        this.terminateForm.patchValue(datePickerValue);
      } else if (formName == 'terminateDivisionForm') {
        this.terminateDivisionForm.patchValue(datePickerValue);
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  checkValue(event: any) {
    if (event.target.checked == true) {
      //Show the address field validations here
      // Issue No. #629 
      if (this.addContact.value.address1 == null || this.addContact.value.address1 == "") {
        this.addContact.controls['address1'].setErrors({
          "required": true
        });
      }
      if (this.addContact.value.postalCode == null || this.addContact.value.postalCode == "") {
        this.addContact.controls['postalCode'].setErrors({
          "required": true
        });
      }
      if (this.addContact.value.city == null || this.addContact.value.city == "") {
        this.addContact.controls['city'].setErrors({
          "required": true
        });
      }
      if (this.addContact.value.province == null || this.addContact.value.province == "") {
        this.addContact.controls['province'].setErrors({
          "required": true
        });
      }
      if (this.addContact.value.country == null || this.addContact.value.country == "") {
        this.addContact.controls['country'].setErrors({
          "required": true
        });
      }
    } else {
      this.addContact.controls['address1'].setErrors(null);
      this.addContact.controls['postalCode'].setErrors(null);
      this.addContact.controls['city'].setErrors(null);
      this.addContact.controls['province'].setErrors(null);
      this.addContact.controls['country'].setErrors(null);

    }
  }

  /**
   * Function used to true addMode
   * Reset form values on add Contact and Link Broker Buttons
   * If edit/view Link Broker or contact from process not complete and user clicks on Add contact/add Link broker then enable form fileds
   * @author: Deepika
   */

  enableAddMode() {
    this.addMode = true
    this.viewMode = false
    this.editMode = false
    this.linkBrokerForm.reset();
    this.addContact.reset();
    this.linkBrokerForm.enable();
    this.addContact.enable();
    this.error = { isError: false, errorMessage: '' };
    this.openModalPop = true;
    this.setAutoCompleterFocus('trgFocusContactTitlesEl');
    /*Set Default Business Type*/
    this.contactLanguageList.forEach(element => {
      if (element.key == '1') {
        this.selectedContactLanguage = element.key;
        this.addContact.patchValue({ language: element.value })
      }
    });
    //---------- Focus-----------
  }

  enableAddModeBrokerLink() {
    // Task 542 Link broker button disabled once it clicked until pop up closes again
    this.linkBrokerDisable = true
    this.addMode = true
    this.viewMode = false
    this.editMode = false
    this.linkBrokerForm.reset();
    this.addContact.reset();
    this.linkBrokerForm.enable();
    this.addContact.enable();
    this.error = { isError: false, errorMessage: '' };
    var brokerNameListURL = CompanyApi.BrokerNameList;
    var coKeyJson = { "coKey": this.companyId }
    this.hmsDataServiceService.postApi(brokerNameListURL, coKeyJson).subscribe(data => {
      switch (data.code) {
        case 200:
          $('#companyLinkBrokerPopup').trigger('click');
          this.setAutoCompleterFocus('trgFocusBrokerNameEl');
          //---------- Focus----------- 
          this.brokerNameList = data.result;
          //Predictive Company Search Upper
          this.brokerNameData = this.completerService.local(
            this.brokerNameList,
            "brokerName",
            "brokerName"
          );
          this.noData = false;
          break;
        case 404:
          this.noData = true;
          this.exDialog.openMessage(this.translate.instant('company.exDialog.noBrokerLink'));
      }
    });
  }

  onBrokerNameSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedBrokerName = (selected.originalObject.brokerKey).toString();
    }
    else {
      this.selectedBrokerName = '';
    }
  }

  enableAddModeCardLink() {
    this.addMode = true
    this.viewMode = false
    this.editMode = false
  }

  /**
   * 
   * @param event 
   */
  isContactPostalcodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CompanyApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL = CompanyApi.isCompanyCityProvinceCountryValidUrl;
      this.hmsDataServiceService.postApi(URL, postalNumber).subscribe(data => {
        switch (data.code) {
          case 404:
            this.addContact.controls['postalCode'].setErrors({
              "postalcodeNotFound": true
            });
            this.addContact.patchValue({
              'city': '',
              'country': '',
              'province': ''
            });
            break;
          case 302:
            this.addContact.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            $('.focusEffectiveDate .selection').focus();
            break;
        }
      });
    }
  }

  isContactPostalVerifyValid(event, fieldName) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (fieldName) {
        case 'city':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.addContact.get('country').value,
            provinceName: this.addContact.get('province').value,
            postalCd: this.addContact.get('postalCode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'country':
          fieldParameter = {
            cityName: this.addContact.get('city').value,
            countryName: event.target.value,
            provinceName: this.addContact.get('province').value,
            postalCd: this.addContact.get('postalCode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'province':
          fieldParameter = {
            cityName: this.addContact.get('city').value,
            countryName: this.addContact.get('country').value,
            provinceName: event.target.value,
            postalCd: this.addContact.get('postalCode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CompanyApi.isCompanyCityProvinceCountryValidUrl;
      this.hmsDataServiceService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.addContact.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.addContact.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  ViewPlanPage() {
    this.router.navigate(['/company/plan/view/'], { queryParams: { 'companyId': this.companyId, 'planId': this.planKey, 'divisonId': this.divisionkey } });
  }

  onGenderSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedGenderKey = selected.originalObject.key.toString();
    }
  }

  filterCompanyPlanSearch() {
    this.dataTableService.planExists.subscribe(value => {
      this.noDataVal = false;
    })
    var params = this.dataTableService.getFooterParams("plan-datatable")
    if (params[2].value != "" && (params[2].value == "Active" || this.selectedPlanStatusValue == 'Active')) {
      params[2].value = "F"
    }
    else if (params[2].value != "" && (params[2].value == "Suspended" || this.selectedPlanStatusValue == "Suspended")) {
      params[2].value = "T"
    }
    else if (params[2].value != "" && (params[2].value == "Terminated" || this.selectedPlanStatusValue == "Terminated")) {
      params[2].value = "terminated"
    }
    var companyJson = { "key": "coKey", "value": this.companyId }
    params[4] = companyJson
    var dateParams = [3];
    var URL = CompanyApi.getComopanyPlanListUrl;
    this.noDataVal = false;
    this.dataTableService.jqueryDataTableReload("plan-datatable", URL, params, dateParams)
  }

  filterCompanyContactSearch() {
    var getCompanyConatctListUrl = CompanyApi.companyContactList;
    //  general feedback company contact icon not visible after page refersh handled using jquery 
    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'showAction': "T" }, 
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': "T" }
    ]
    var dateParams = [7, 8];
    if (!$.fn.dataTable.isDataTable('#company-contact')) {
      this.dataTableService.jqueryDataTable('company-contact', getCompanyConatctListUrl,
        'full_numbers', this.company_contact_columns, 5, true, true, 'lt', 'irp', undefined,
        [0, 'asc'], '', this.reqParam, tableActions, [10], [7, 8], '', '',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null, null, null, [10], '')
    } else {
      var params = this.dataTableService.getFooterParams("company-contact")
      var companyID = { "key": "coKey", "value": this.companyId }
      params[9] = companyID
      this.dataTableService.jqueryDatatableDestroy("company-contact")
      this.dataTableService.jqueryDataTable('company-contact', getCompanyConatctListUrl,
        'full_numbers', this.company_contact_columns, 5, true, true, 'lt', 'irp', undefined,
        [0, 'asc'], '', params, tableActions, [10], [7, 8], '', '',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null, null, null, [10], '')
    }
  }
  setCompany(coId) {

  }
  filterCompanyLinkBrokerSearch() {
    var getBrokerListURL = CompanyApi.CompanyLinkBrokerList;
    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'showAction': this.mainCompanyArray[0].viewLinkedBroker },
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': this.mainCompanyArray[0].deleteLinkedBroker }
    ]
    if (!$.fn.dataTable.isDataTable('#company-broker')) {
      this.dataTableService.jqueryDataTable('company-broker', getBrokerListURL, 'full_numbers', this.company_broker_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reqParam, tableActions, 7, [4, 5], '', '', [1, 2, 3, 4, 5, 6, 7])
    } else {
      var params = this.dataTableService.getFooterParams("company-broker")
      var companyID = { "key": "coKey", "value": this.companyId }
      params[6] = companyID
      params = Object.assign(params, companyID);
      var dateParams = [4, 5];
      this.dataTableService.jqueryDataTableReload("company-broker", getBrokerListURL, params, dateParams)
    }
  }

  /**
   * Filter Card Search
   */
  filterCardSearch(cardSearchTabClick) {
    this.cardSearch = true
    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye' },
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash' }
    ]
    var getCradHolderListUrl = CompanyApi.getCardSearchByTypeFilter;
    if (!$.fn.dataTable.isDataTable('#companySearchCardTable')) {
      this.dataTableService.jqueryDataTable("companySearchCardTable", getCradHolderListUrl, 'full_numbers', this.companyCardColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reqParam, tableActions, undefined, [4, 5], '', '', [1, 2, 3, 4, 5, 6, 7, 8, 9])
    } else {
      var params = this.dataTableService.getFooterParams("companySearchCardTable")
      if (params[3].value != "" && params[3].value == "Other") {
        params[3].value = ""
      }
      if (params[9].value == 'All' || params[9].value == 'all') {
        params[9].value = ''
      }
      var companyID = { "key": "coKey", "value": this.companyId }
      params[10] = companyID
      var dateParams = [4, 5];

      if (cardSearchTabClick) {
        var cardHolderRole = { "key": "cardHolderRole", "value": 'Primary' }
        var cardStatus = { "key": "status", "value": 'Active' }
        params[7] = cardHolderRole
        params[9] = cardStatus
      }
      this.dataTableService.jqueryDataTableReload("companySearchCardTable", getCradHolderListUrl, params, dateParams)
    }
  }

  /**
   * Reset Conatct,broker Plan, CardHolder table Search
   * @param val 
   */
  resetTableSearch(val) {
    this.companyCardholder.patchValue({ cardHolderRole: '', status: '' })
    this.dataTableService.resetTableSearch();
    if (val == "company-contact") {
      this.cardSearch = false
      this.brokerSearh = false
      this.planSearch = false
      this.contactSearch = true
      $('#company-contact .icon-mydpremove').trigger('click');
      this.filterCompanyContactSearch();
    }

    if (val == "company-broker") {
      this.cardSearch = false
      this.brokerSearh = true
      this.planSearch = false
      this.contactSearch = false
      $('#company-broker .icon-mydpremove').trigger('click');
      this.filterCompanyLinkBrokerSearch();
    }

    if (val == "plan-datatable") {
      this.noDataVal = true;
      // to resolve issue where plan tab did not show anything if clicked immediately
      // setTimeout(() => { 
      this.cardSearch = false
      this.brokerSearh = false
      this.planSearch = true
      this.contactSearch = false
      $('#plan-datatable .icon-mydpremove').trigger('click');
      this.filterCompanyPlanSearch();
      // },2000);
    }

    if (val == "companySearchCardTable") {
      this.cardSearch = true
      this.brokerSearh = false
      this.planSearch = false
      this.contactSearch = false
      this.companyCardholder.patchValue({ cardHolderRole: 'Primary', status: 'Active' })
      $('#companySearchCardTable .icon-mydpremove').trigger('click');
      this.filterCardSearch(true);
    }
  }

  changeFilterDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      this.dateNameArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
      // Condition applied to avoid console error of undefined due to unable to read date because object used to be null. (18-01-2024) Prabhat
      if (obj != null) {
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      }
    }
    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }

  }


  /**Suspend Plan Start */
  submitSuspendedPlan() {
    this.changeDateFormatService.convertDateObjectToString(this.planSuspendedForm.value.suspendOn);
    this.changeDateFormatService.convertDateObjectToString(this.planSuspendedForm.value.resumeOn);
    var obj = {};
    obj['plansKey'] = this.uniquePlanKey;
    obj['resumeOn'] = this.changeDateFormatService.convertDateObjectToString(this.planSuspendedForm.value.resumeOn);
    obj['suspendOn'] = this.changeDateFormatService.convertDateObjectToString(this.planSuspendedForm.value.suspendOn);
    obj['planSuspendHistCom'] = (this.planSuspendedForm.value.suspendOn) ? this.planSuspendedForm.value.suspendPlanComment : '';

    if (this.planSuspendedForm.valid) {
      this.planSuspendedForm.patchValue({ check: true });
      this.hmsDataServiceService.postApi(CompanyApi.savePlanSuspendUrl, obj).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && data.hmsShortMessage == "RECORD_SAVE_SUCCESSFULLY") {
          this.ToastrService.success(this.translate.instant('company.toaster.plan_suspended'));
          var suspend_company_url = CompanyApi.planSuspendList;
          var suspendTableID = "suspend_plan";
          var reqParam = [{ 'key': 'plansKey', 'value': this.uniquePlanKey }]
          this.dataTableService.jqueryDataTableReload(suspendTableID, suspend_company_url, reqParam);
          this.planSuspendedForm.reset();
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'DATE_SHOULD_BE_GREATER_NOW_DATE') {
          this.ToastrService.error(this.translate.instant('company.toaster.suspensionDateLessThanCurrent'));
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'PLAN_SUSPEND_DATE_SHOULD_BE_GREATER_THAN_PLAN_EFFECTIVE_DATE') {
          this.ToastrService.error(this.translate.instant('company.toaster.planSusGreaterThanEffectiveDate'));
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'COMPANY_ALREADY_SUSPENDED') {
          this.ToastrService.error(this.translate.instant('company.toaster.companyAlreadySuspended'));
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'SUSPEND_DATE_MUST_GREATER_THAN_PREVIOUS_RESUME_DATE') {
          this.ToastrService.error(this.translate.instant('company.toaster.planSusGreaterThanPrevResumeDate'));
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'THE_RESUME_DATE_MUST_BE_TURNED_ON_BEFORE_NEW_SUSPENDED_DATE_CAN_BE_ADDED') {
          this.ToastrService.error(this.translate.instant('company.toaster.planResumeMustTurnedBeforeNewSusDate'));
        }
      });
    } else {
      this.planSuspendedForm.patchValue({ check: false });
      this.validateAllFormFields(this.planSuspendedForm);
    }
  }

  resetplanSuspendedForm() {
    this.planSuspendedForm.reset();
    var self = this
    this.planSuspendedForm.controls['suspendOn'].enable();
    this.resumeTrue = false
    var suspend_company_url = CompanyApi.planSuspendList;
    var suspendTableID = "suspend_plan";
    var reqParam = [{ 'key': 'plansKey', 'value': this.uniquePlanKey }]
    var suspendPlanTableActions = [
      { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-edit', 'showAction': this.mainCompanyArray[0].editSuspensPlan },
    ]
    var suspended_plan_columns = [
      { title: this.translate.instant('company.company-tab-datatable.suspend-plan-history.plan-suspend-date'), data: 'suspendedOn' },
      { title: this.translate.instant('company.company-tab-datatable.suspend-plan-history.plan-resume-date'), data: 'resumedOn' },
      { title: this.translate.instant('company.company-tab-datatable.suspend-plan-history.plan-comment'), data: 'planSuspendHistCom' },
      { title: this.translate.instant('common.action'), data: 'planSuspendHistKey' }
    ];
    if (!$.fn.dataTable.isDataTable('#suspendTableID')) {
      this.dataTableService.jqueryDataTable(suspendTableID, suspend_company_url, 'full_numbers', suspended_plan_columns, 5, true, false, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, suspendPlanTableActions, 3, [0, 1], '', '', [1, 2, 3])
    } else {
      this.dataTableService.jqueryDataTableReload(suspendTableID, suspend_company_url, reqParam);
    }

    /** Plan Suspend History End */
  }

  setSuspendedValues() {
    this.resumeTrue = true;
    let requiredInfo = {
      "planSuspendHistKey": this.planSuspendId

    }
    this.hmsDataServiceService.postApi(CompanyApi.planSuspendDetail, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.suspendedHistorytableData = data.result
        var suspDate = this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.suspendedOn)
        var resmDate = this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.resumedOn)

        this.suspendDisableDate = this.suspendedHistorytableData.suspendedOn;
        var currentDateCheck = this.changeDateFormatService.getToday();
        if (this.suspendedHistorytableData.resumedOn) {
          this.planSuspendedForm.setValue({
            suspendOn: this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.suspendedOn),
            suspendPlanComment: this.suspendedHistorytableData.planSuspendHistCom,
            resumeOn: this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.resumedOn),
            planKey: this.uniquePlanKey
          });
        } else {
          this.planSuspendedForm.patchValue({ 'suspendPlanComment': this.suspendedHistorytableData.planSuspendHistCom });
          this.error = this.changeDateFormatService.compareTwoDates(currentDateCheck, suspDate.date);
          if (this.error.isError == false) {
            // GET THE MONTH AND YEAR OF THE SELECTED DATE.
            var month = suspDate.date.month;
            var year = suspDate.date.year;
            var newResumeDate = new Date(year, month, 1);
            var dateValue = this.changeDateFormatService.convertStringDateToObject(this.convert(newResumeDate));
            this.planSuspendedForm.patchValue({
              resumeOn: {
                date: {
                  year: dateValue.date.year,
                  month: dateValue.date.month,
                  day: dateValue.date.day
                }
              },
              suspendOn: this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.suspendedOn)
            });
          } else {
            var month = currentDateCheck.date.month;
            var year = currentDateCheck.date.year;
            var newResumeDate = new Date(year, month, 1);
            var dateValue = this.changeDateFormatService.convertStringDateToObject(this.convert(newResumeDate));
            this.planSuspendedForm.patchValue({
              resumeOn: {
                date: {
                  year: dateValue.date.year,
                  month: dateValue.date.month,
                  day: dateValue.date.day
                }
              },
              suspendOn: this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.suspendedOn)
            });
          }
        }
      } else {
        this.suspendedHistorytableData = []
      }
      error => {
      }
    })
    this.planSuspendedForm.controls['suspendOn'].disable();
  }

  updateResumePlan() {
    if (this.planSuspendedForm.value.resumeOn) {
      let requiredInfo = {
        "planSuspendHistKey": this.planSuspendId,
        "resumeOn": this.changeDateFormatService.convertDateObjectToString(this.planSuspendedForm.value.resumeOn),
        "planSuspendHistCom": this.planSuspendedForm.value.suspendPlanComment
      }
      this.hmsDataServiceService.postApi(CompanyApi.resumeSuspendPlan, requiredInfo).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && data.hmsShortMessage == "RECORD_UPDATED_SUCCESSFULLY") {
          this.ToastrService.success(this.translate.instant('company.toaster.plan_resumed'));
          this.suspendedHistorytableData = data.result
          var suspend_company_url = CompanyApi.planSuspendList;
          var suspendTableID = "suspend_plan";
          var reqParam = [{ 'key': 'plansKey', 'value': this.uniquePlanKey }]
          this.dataTableService.jqueryDataTableReload(suspendTableID, suspend_company_url, reqParam);

          this.planSuspendedForm.controls['suspendOn'].enable();
          this.planSuspendedForm.reset();
          this.resumeTrue = false

        } else {
          this.suspendedHistorytableData = []
        }
        error => {
        }
      })
    } else {
      this.ToastrService.error(this.translate.instant('company.toaster.fillResumeDate'));
    }
  }

  convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("/");
  }

  changeDateFormat2(event, frmControlName, formName, currentDate = false) {
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
      if (formName == 'planSuspendedForm') {
        this.planSuspendedForm.patchValue(datePickerValue);
        if (this.planSuspendedForm.value.suspendOn) {
          var dt = new Date(this.planSuspendedForm.value.suspendOn.date);

          // GET THE MONTH AND YEAR OF THE SELECTED DATE.
          var month = this.planSuspendedForm.value.suspendOn.date.month,
            year = this.planSuspendedForm.value.suspendOn.date.year;

          // GET THE FIRST AND LAST DATE OF THE MONTH.
          var suspendLastDate = new Date(year, month, 0);
          var suspendLastDateValue = this.changeDateFormatService.convertStringDateToObject(this.convert(suspendLastDate));
          var suspendLastDateValueForSuspended = this.changeDateFormatService.convertStringDateToObject(this.convert(suspendLastDate));

          this.planSuspendedForm.patchValue({
            suspendOn: {
              date: {
                year: suspendLastDateValue.date.year,
                month: suspendLastDateValue.date.month,
                day: suspendLastDateValue.date.day
              }
            }
          });
        }

        if (this.planSuspendedForm.value.resumeOn) {

          var dt = new Date(this.planSuspendedForm.value.resumeOn.date);

          // GET THE MONTH AND YEAR OF THE SELECTED DATE.
          var month = this.planSuspendedForm.value.resumeOn.date.month,
            year = this.planSuspendedForm.value.resumeOn.date.year;

          var now = new Date();
          var thisMonth = now.getMonth();

          // GET THE FIRST AND LAST DATE OF THE MONTH.
          var resumeFirstDate = new Date(year, month - 1, 1);
          if (resumeFirstDate > suspendLastDate) {
          } else {
          }
          var dateValueResumed = this.changeDateFormatService.convertStringDateToObject(this.convert(resumeFirstDate));
          //this.companySuspendedForm.controls['suspendOn'].reset();
          /**
           * Check if suspended date is greater than resume date
           * if greater than increment suspended date and put in resume date
           */
          if (suspendLastDate > resumeFirstDate) {

            var updatedDateForResumeFromSuspended = suspendLastDate;
            //add a day to the date
            updatedDateForResumeFromSuspended.setDate(updatedDateForResumeFromSuspended.getDate() + 1);
            var updatedDateForResumeFromSuspendedValue = this.changeDateFormatService.convertStringDateToObject(this.convert(updatedDateForResumeFromSuspended));
            this.planSuspendedForm.patchValue({
              resumeOn: {
                date: {
                  year: updatedDateForResumeFromSuspendedValue.date.year,
                  month: updatedDateForResumeFromSuspendedValue.date.month,
                  day: updatedDateForResumeFromSuspendedValue.date.day
                }
              }
            });
          }
          else if (dateValueResumed.date.month == thisMonth + 1) {
            this.planSuspendedForm.patchValue({
              resumeOn: {
                date: {
                  year: dateValueResumed.date.year,
                  month: dateValueResumed.date.month + 1,
                  day: dateValueResumed.date.day
                }
              }
            });
          } else {
            this.planSuspendedForm.patchValue({
              resumeOn: {
                date: {
                  year: dateValueResumed.date.year,
                  month: dateValueResumed.date.month,
                  day: dateValueResumed.date.day
                }
              }
            });
          }

          var suspendDate = this.changeDateFormatService.convertStringDateToObject(this.suspendDisableDate)
          if (suspendDate && this.planSuspendedForm.value.resumeOn) {
            this.error = this.changeDateFormatService.compareTwoDates(suspendDate.date, this.planSuspendedForm.value.resumeOn.date);
            if (this.error.isError == true) {
              this.planSuspendedForm.controls.resumeOn.setErrors({
                "suspensionDateNotValid": true
              });
            }
          }
        }
      }
    }
  }

  reset() {
    this.dataTableService.jqueryDataTableReload('plan-datatable', this.company_plan_url, this.reqParam)// After terminate Plan reload list of plans to update the status of divisions
    if (this.planSuspendedForm.invalid) {
      this.planSuspendedForm.reset(this.planSuspendedForm);
    }
    else {
      this.planSuspendedForm.value;
    }
  }
  /**Suspend Plan End */

  /** Terminate Plan Start */
  submitPlanTerminateForm(terminateForm) {
    if (this.terminateForm.valid) {
      let terminationData = {
        "coKey": this.companyId,
        "plansKey": this.uniquePlanKey,
        "terminatedOn": this.changeDateFormatService.convertDateObjectToString(terminateForm.value.terminateDate),
      }
      this.hmsDataServiceService.post(CompanyApi.saveTerminatePlanUrl, terminationData).subscribe(data => {

        this.terminatePlanErrorMessages.forEach(element => {
          if (data.code == 400 && element == data.hmsShortMessage) {
            this.ToastrService.error(this.translate.instant('company.plan.toaster.' + element));
            return false;
          }
        });

        if (data.code == 400 && data.hmsShortMessage == 'PLAN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_EFFECTIVE_ON') {
          this.ToastrService.error(this.translate.instant('company.plan.toaster.PLAN_TERMINATION_MUST_BE_GREATER_THAN_OR_EQUAL_TO_EFFECTIVE_ON'));
        }

        if (data.code == 200 && data.status == 'OK' && data.hmsShortMessage == 'PLAN_TERMINATED_SUCCESSFULLY') {
          var URL = CompanyApi.getPlanStatusUrl;
          let planKey = { "plansKey": this.uniquePlanKey };
          this.hmsDataServiceService.post(URL, planKey).subscribe(data => {
            if (data.code == 200 && data.status === "OK") {
              this.ToastrService.success(this.translate.instant('company.toaster.plan_terminated'));
              var reqParam = [{ 'key': 'plansKey', 'value': this.uniquePlanKey }]
              this.dataTableService.jqueryDataTableReload('termination-plan-history', CompanyApi.getTerminatePlanListUrl, reqParam);


              if (data.result.planStatus == 'Terminated') {
                this.isPlanTerminated = data.result.planStatus;
                this.planTerminationDate = (data.result.terminatedOn)
              }

              if (data.result.planStatus == 'Active') {
                this.resetPlanTerminateForm()
              }
            }
          })
        }
      });
    }
    else {
      this.validateAllFormFields(this.terminateForm);
    }
  }

  resetPlanTerminateForm() {
    this.dataTableService.jqueryDataTableReload('plan-datatable', this.company_plan_url, this.reqParam)// After terminate Plan reload list of plans to update the status of divisions
    this.isTerminatePlan()
    var URL = CompanyApi.getPlanStatusUrl;
    let planKey = { "plansKey": this.uniquePlanKey };
    this.hmsDataServiceService.post(URL, planKey).subscribe(data => {
      if (data.code == 200 && data.status === "OK" && data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        if (data.result.terminatedOn != '') {
          this.isPlanTerminated = data.result.planStatus
          this.planTerminationDate = (data.result.terminatedOn)
          var dateValue = this.changeDateFormatService.convertStringDateToObject(data.result.terminatedOn);
          this.terminateForm.patchValue({
            terminateDate: {
              date: {
                year: dateValue.date.year,
                month: dateValue.date.month,
                day: dateValue.date.day
              }
            }
          });
          this.terminateForm.controls['terminateDate'].disable();
        } else {
          this.terminateForm.controls['terminateDate'].enable();
          this.terminateForm.reset();
        }
      }
    });
  }

  /* Get List of TerminationCategory */
  getPlanTerminationList() {
    var URL = CompanyApi.getTerminationCategoryUrl;
    this.hmsDataServiceService.get(URL).subscribe(data => {
      this.terminationCategoryList = data.result;
    });
  }

  planTerminationListHistory() {
    this.resetPlanTerminateForm();
    var getTerminatePlanListUrl = CompanyApi.getTerminatePlanListUrl;
    var terminationTableId = 'termination-plan-history';
    var reqParam = [{ 'key': 'plansKey', 'value': this.uniquePlanKey }]
    var URL = CompanyApi.getTerminationCategoryUrl;
    this.hmsDataServiceService.get(URL).subscribe(data => {
      this.terminationCategoryList = data.result;
    });
    if (!$.fn.dataTable.isDataTable('#termination-plan-history')) {
      this.dataTableService.jqueryDataTable(terminationTableId, getTerminatePlanListUrl, 'full_numbers', this.termination_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [0, 1])
    } else {
      this.dataTableService.jqueryDataTableReload(terminationTableId, getTerminatePlanListUrl, reqParam);
      this.resetPlanTerminateForm()
    }
  }

  reactiveCompanyPlan() {
    let planId = {
      "plansKey": this.uniquePlanKey,
      "coKey": this.companyId,
      "terminatedOn": this.planTerminationDate
    };
    this.hmsDataServiceService.postApi(CompanyApi.planReactivateUrl, planId).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.ToastrService.success(this.translate.instant('company.toaster.plan_reactivated'));
        this.isValid = false
        var reqParam = [{ 'key': 'plansKey', 'value': this.uniquePlanKey }]
        this.dataTableService.jqueryDataTableReload('termination-plan-history', CompanyApi.getTerminatePlanListUrl, reqParam);
        this.isPlanTerminated = 'Active';
        this.terminateForm.controls['terminateDate'].enable();
        this.terminateForm.reset();
      } else {
      }
      error => {
      }
    })
  }

  isTerminatePlan() {
    var URL = CompanyApi.getPlanStatusUrl;
    let planKey = { "plansKey": this.uniquePlanKey };
    this.hmsDataServiceService.post(URL, planKey).subscribe(data => {
      if (data.code == 200 && data.status === "OK" && data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        if (data.result.terminatedOn != '') {
          this.isValid = true
        } else {
          this.isValid = false
        }
      }
    })
    return this.isValid;
  }
  /** Terminate Plan Star */


  /**
  * Get company plan data for edit & patch with form fields
  */
  setPlanYearType() {
    let planDataParams = {
      "coKey": this.companyId,
      "plansKey": this.uniquePlanKey,
      "divisionKey": this.uniqueDivisionKey
    };
    setTimeout(() => {
    this.hmsDataServiceService.postApi(PlanApi.getCompanyPlanUrl, planDataParams).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.yrTypeKey = data.result.planInfoJson['yrTypeKey'];
        this.yrTypeDesc = data.result.planInfoJson['yrTypeDesc'];
      }

      });
     }, 600);
  }

  /**Terminate Division Start */
  terminatePlanDivision() {
    if (this.dataTableService.selectedPlanRowData != undefined) {
      if (this.dataTableService.selectedPlanRowData['planTerminateInd'] == 'T') {
        this.ToastrService.error('Plan is terminated, so unable to reactivate Division.')
      } else {
        $('#DivisionTerminateBtn').trigger('click');
        this.checkDivisionTerminate();
        this.resetPlanDivisionTerminateForm();
        this.getDivisionTerminateHistory();
      }
    }
  }

  getDivisionTerminateHistory() {
    var division_termination_history_url = CompanyApi.getTerminatePlanDivisionListUrl;
    var divisionTerminateTableId = "termination-division-history"
    var reqDivisionTerminateParam = [{ 'key': 'divisionKey', 'value': this.rowDivisionKey }]
    if (!$.fn.dataTable.isDataTable('#termination-division-history')) {
      var dateCols = ['divisionTerminateDate', 'divRestartOn'];
      this.termination_columns = [
        { title: this.translate.instant('company.company-terminate.termination-date'), data: 'divisionTerminateDate' },
        { title: this.translate.instant('company.company-terminate.reactivation-date'), data: 'divRestartOn' }]
      this.dataTableService.jqueryDataTable(divisionTerminateTableId, division_termination_history_url, 'full_numbers', this.termination_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqDivisionTerminateParam, '', undefined, [0], '', '', [1], [1])
      this.checkPlanDivisionTermination = false
    }
    else {
      this.dataTableService.jqueryDataTableReload(divisionTerminateTableId, division_termination_history_url, reqDivisionTerminateParam)
    }
  }

  submitPlanDivisionTerminateForm(terminateDivisionForm) {
    if (this.terminateDivisionForm.valid) {
      let terminationDivisionData = {
        "plansKey": this.uniquePlanKey,
        "divisionKey": this.rowDivisionKey,
        "terminatedOn": this.changeDateFormatService.convertDateObjectToString(terminateDivisionForm.value.terminateDivisionDate)
      }
      this.hmsDataServiceService.post(CompanyApi.saveTerminateAndReactivatePlanDivisionUrl, terminationDivisionData).subscribe(data => {
        if (data.code == 400 && data.hmsShortMessage == 'DATE_SHOULD_BE_GREATER_NOW_DATE') {
          this.ToastrService.error(this.translate.instant('company.toaster.dateGreaterThanCurrent'));
          return false;
        } else if (data.code == 400 && data.message == 'DIVISION_TERMINATION_DATE_SHOULD_BE_GREATER_THAN_DIVISION_EFFECTIVE_DATE') {
          this.ToastrService.error(this.translate.instant('company.toaster.division_terminate_greater_than_division_effective'));
          return false;
        } else if (data.code == 400 && data.message == 'DIVISION_TERMINATION_MUST_BE_GRATER_THAN_SCHEDULE_EFFECTIVE_ON') {
          this.ToastrService.error(this.translate.instant('company.toaster.DIVISION_TERMINATION_MUST_BE_GRATER_THAN_SCHEDULE_EFFECTIVE_ON'));
          return false;
        }

        if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == 'TERMINATED_SUCCESSFULLY') {
          var URL = CompanyApi.getDivisionStatusUrl;
          let divisionKey = { "divisionKey": this.rowDivisionKey };
          this.hmsDataServiceService.post(URL, divisionKey).subscribe(data => {
            if (data.code == 200 && data.status === "OK") {
              this.ToastrService.success(this.translate.instant('company.toaster.division_terminated'));
              this.getDivisionTerminateHistory();
              this.terminateDivisionForm.reset();
              if (data.result.divisionStatus == 'Terminated') {
                this.isPlanDivisionTerminated = data.result.divisionStatus;
              }

              if (data.result.divisionStatus == 'Active') {
                this.resetPlanDivisionTerminateForm()
              }
            }
          })
        }
      });
    }
    else {
      this.validateAllFormFields(this.terminateDivisionForm);
    }
  }

  resetPlanDivisionTerminateForm() {
    var URL = CompanyApi.getDivisionStatusUrl;
    let planKey = { "divisionKey": this.rowDivisionKey };
    this.hmsDataServiceService.post(URL, planKey).subscribe(data => {
      if (data.code == 200 && data.status === "OK" && data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        if (data.result.terminatedOn != '') {
          this.isValidDivision = true
          this.isPlanDivisionTerminated = data.result.divisionStatus
          this.planDivisionTerminationDate = (data.result.terminatedOn)
          var dateValue = this.changeDateFormatService.convertStringDateToObject(data.result.terminatedOn);
          this.terminateDivisionForm.patchValue({
            terminateDivisionDate: {
              date: {
                year: dateValue.date.year,
                month: dateValue.date.month,
                day: dateValue.date.day
              }
            }
          });
          this.terminateDivisionForm.controls['terminateDivisionDate'].disable();
        } else {
          this.isValidDivision = false
          this.terminateDivisionForm.controls['terminateDivisionDate'].enable();
          this.terminateDivisionForm.reset();
        }
      } else {
        this.terminateDivisionForm.controls['terminateDivisionDate'].enable();
        this.terminateDivisionForm.reset();
      }
    });
  }

  reactiveCompanyPlanDivision() {
    let divisionId = {
      "plansKey": this.uniquePlanKey,
      "divisionKey": this.rowDivisionKey,
      "reactivateDivison": 'Y'
    };
    this.hmsDataServiceService.postApi(CompanyApi.saveTerminateAndReactivatePlanDivisionUrl, divisionId).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.ToastrService.success(this.translate.instant('company.toaster.division_reactivated'));
        this.isValidDivision = false
        this.getDivisionTerminateHistory();
        this.isPlanDivisionTerminated = 'Active';
      } else {
      }
      error => {
      }
    })
    this.terminateDivisionForm.controls['terminateDivisionDate'].enable();
    this.terminateDivisionForm.reset();
  }

  /** Terminate Division End */

  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(() => {
      self[el].nativeElement.focus();
    }, 200);
  }

  setAutoCompleterFocus(el) {
    var self = this
    setTimeout(() => {
      self[el] && self[el].focus();
    }, 200);
  }

  getMainCompanyArray() {
    let promise = new Promise((resolve, reject) => {
      this.companyService.authCheckFilled.subscribe(data => {
        this.mainCompanyArrayUpdated = data
        resolve();
      });
    })
    return promise;
  }

  /**
   * Filter Grid On press enter plan-datatable, company-contact, company-broker, companySearchCardTable
   * @param event 
   * @param tableId 
   */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      if (tableId == 'plan-datatable') {
        this.filterCompanyPlanSearch();
      } else if (tableId == 'company-contact') {
        this.filterCompanyContactSearch();
      } else if (tableId == 'company-broker') {
        this.filterCompanyLinkBrokerSearch();
      } else if (tableId == 'companySearchCardTable') {
        this.filterCardSearch(false);
      }
    }
  }

  /**
   * Get Broker Details By Broker Id
   */
  findBrokerById(brokerId: any) {
    this.brokerForm.disable();
    this.hmsDataServiceService.get(CompanyApi.getBrokerByKeyUrl + "/" + brokerId).subscribe(data => {
      if (data.code == 302 && data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
        this.brokerForm.patchValue({
          'broker_name': data.result.brokerName,
          'broker_id': data.result.brokerId,
          'gts_registration': data.result.brokerGstRegNum,
          'address1': data.result.brokerAddress1,
          'address2': data.result.brokerAddress2,
          'postalCode': data.result.brokerPostalCode,
          'city': data.result.brokerCity,
          'province': data.result.brokerProvince,
          'country': data.result.brokerCountry,
          'email': data.result.brokerEmail,
          'phone_no': data.result.brokerPhone,
          'extension': data.result.brokerPhoneExtn != "" ? data.result.brokerPhoneExtn.trim() : '',
          'fax_no': data.result.brokerFax,
          'effective_date': this.changeDateFormatService.convertStringDateToObject(data.result.brokerEffectiveOn),
          'broker_termination_date': this.changeDateFormatService.convertStringDateToObject(data.result.brokerExpiredOn),
          "brokerSuspensionInd": data.result.brokerSuspensionInd == 'T' ? true : false,
          "optoutCompanyEmailInd": data.result.brokerOptoutComEmailInd == 'T' ? true : false,
          "brokerMultiCommAgrInd": data.result.brokerMultiCommAgrInd == 'T' ? true : false,
        });
      }
      // Task 545 Cross button in view mode of broker section in company has been removed
      this.observableObj = Observable.interval().subscribe(x => {
        // Class added to correct calendar field position in broker view of company.
        $("#brokerEffectiveDate div div div button:nth-child(2)").addClass("effectiveDateCalendar")
        $('.mydpicon').removeClass('icon-mydpremove')
        this.observableObj.unsubscribe();
      })
      /** Execite If Broker terminate */
    });
  }

  exportPlanList() {
    var params = this.dataTableService.getFooterParams("plan-datatable")
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    this.recordLength = this.dataTableService.totalRecords
    let reqParamPlan =
    {
      'coKey': this.companyId,
      'divisionName': params[0].value,
      'divisionId': params[1].value,
      'plansSuspendInd': params[2].value,
      'effectiveOn': params[3].value,
      'length': this.recordLength,
      'paramApplication': paramApp
    }
    var URL = CompanyApi.exportCompanyPlanListUrl;
    var fileName = "Plan-List"
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFile(URL, reqParamPlan, fileName)
          } else {
            this.exportFile(URL, reqParamPlan, fileName)
          }
        }
      });
    } else {
      this.exportFile(URL, reqParamPlan, fileName)
    }
  }

  exportCardHolderList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    var params = this.dataTableService.getFooterParams("companySearchCardTable")
    this.recordLength = this.dataTableService.totalRecords
    let reqParamPlan = { "start": 0, "length": this.recordLength, 'coKey': this.companyId, 'cardHolderRole': params[7].value, 'cardId': params[0].value, 'cardType': params[8].value, 'dob': params[4].value, 'terminateDate': params[5].value, 'email': params[6].value, 'firstName': params[2].value, 'gender': params[3].value, 'lastName': params[1].value, 'paramApplication': paramApp, 'status': params[9].value }
    var URL = CompanyApi.exportCardSearchByTypeFilterUrl;
    var fileName = "CardHolder-List "
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFile(URL, reqParamPlan, fileName)
          } else {
            this.exportFile(URL, reqParamPlan, fileName)
          }
        }
      });
    } else {
      this.exportFile(URL, reqParamPlan, fileName)
    }

  }


  exportBrokerList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    var params = this.dataTableService.getFooterParams("company-broker")
    this.recordLength = this.dataTableService.totalRecords
    let reqParamPlan = { "start": 0, "length": this.recordLength, "coKey": this.companyId, "brokerIdAndName": params[0].value, "brokerPhone": params[1].value, "brokerCoComissionRate": params[2].value, "brokerEmail": params[3].value, "effectiveOn": params[4].value, "expiredOn": params[5].value, 'paramApplication': paramApp }
    var URL = CompanyApi.exportBrokerCompanyAssociationlistByCoKeyUrl;
    var fileName = "Broker-List"
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFile(URL, reqParamPlan, fileName)
          } else {
            this.exportFile(URL, reqParamPlan, fileName)
          }
        }
      });
    } else {
      this.exportFile(URL, reqParamPlan, fileName)
    }

  }

  exportCompanyContactList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    var params = this.dataTableService.getFooterParams("company-contact")
    this.recordLength = this.dataTableService.totalRecords
    let reqParamPlan = { "start": 0, "length": this.recordLength, "coKey": this.companyId, "cityName": params[2].value, "provinceName": params[3].value, "countryName": params[4].value, "phone": params[5].value, "effectiveOn": params[7].value, "expiredOn": params[8].value, "email": params[6].value, "firstName": params[1].value, "lastName": params[0].value, 'paramApplication': paramApp }
    var URL = CompanyApi.exportCompanyContactListUrl;
    var fileName = "CompanyContact-List"
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFile(URL, reqParamPlan, fileName)
          } else {
            this.exportFile(URL, reqParamPlan, fileName)
          }
        }
      });
    } else {
      this.exportFile(URL, reqParamPlan, fileName)
    }
  }

  exportFile(URL, reqParamPlan, fileName) {

    this.showLoader = false
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""

    this.hmsDataServiceService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loaderPlaceHolder = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loaderPlaceHolder = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataServiceService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          a.download = fileName + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
      }
    })
  }

}