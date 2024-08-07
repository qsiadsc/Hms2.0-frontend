import { Component, OnInit, Input, ViewChildren, QueryList, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { IMyInputFocusBlur } from 'mydatepicker';
import { Constants } from '../../../common-module/Constants';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { PlanApi } from '../plan-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute, Params, NavigationStart, Event as NavigationEvent } from '@angular/router';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { ToastrService } from 'ngx-toastr';
import { PlanService } from '../plan.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { FormCanDeactivate } from '../../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { FinanceApi } from '../../../finance-module/finance-api';
import { ClaimApi } from '../../../claim-module/claim-api';
import { CompanyApi } from '../../company-api';
import { IfObservable } from 'rxjs/observable/IfObservable';

@Component({
  selector: 'app-plan-info',
  templateUrl: './plan-info.component.html',
  styleUrls: ['./plan-info.component.css'],
  providers: [DatatableService, ChangeDateFormatService, HmsDataServiceService, ExDialog, ToastrService, TranslateService]
})

export class PlanInfoComponent extends FormCanDeactivate implements OnInit {
  expired=false;
  isprorateTypeKeyExists: boolean;
  showDeductibleExpiry: boolean = true;
  showProratingExpiry: boolean = true;
  infoJsonEditModeData: any;
  isDivisionSuspended: boolean = false;
  user: string;
  division_comments: any;
  @ViewChild("focusAddUnitEl") trgFocusAddUnitEl: ElementRef;
  @ViewChild("focusEditUnitEl") trgFocusEditUnitEl: ElementRef;

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  coSuspendId;
  suspendedHistorytableData: any;
  suspended_plan_columns: { title: any; data: string; }[];
  ObservableSuspendedCompanyObj: any;
  divisionMaxHistInd: boolean;
  feeGuideProvinceHist: boolean;
  feeGuideScheduleHist: boolean;
  dentalRuleHistInd: any;
  setGeneralInfo;
  public yearTypeArray = [];
  public deductibleTypeArray = [];
  public proratingTypeArray = [];
  selectedYearType: any;
  selectedProratingType: any;
  selectedDeductibleType: any;
  isUpdating: false;
  yearTypeKey: any;
  yearTypeDesc: any;
  typeOfYear: any;
  type_of_year: any;
  deductibleType: any;
  deductTypeKey: any;
  deductTypeDesc: any;
  prorateTypeKey: any;
  prorateTypeDesc: any;
  isCopyMode: boolean = false;
  age1Val: any;
  age2Val: any;
  ageValue: boolean = false;
  deductibleTypeValue: any;
  proratingtypeValue: any;
  counterVal: boolean = true;
  divisionEmitVal: boolean = false;
  isRequiredEnable: boolean = false;
  forDeductRequired: boolean = false;
  effVal: boolean = false; //(HMS Issue - 568)
  observableObj: any;
  addObservableObj: any;
  divisionKeyUrlId(arg0: any, arg1: any, arg2: any): any {
    throw new Error("Method not implemented.");
  }
  planKeyUrlId(arg0: any, arg1: any, arg2: any): any {
    throw new Error("Method not implemented.");
  }
  hideButton: { 'hideSuspendedButton': any; 'hideAdjButton': any; 'hidePapButton': any; };
  resumeTrue: boolean = false;
  planId: any;
  isValid: any;
  InfoData: { 'planInfoData': any; 'unitsData': any; };
  @Output() planInfoData = new EventEmitter();
  @Output() selectedYearTypeKey = new EventEmitter();
  @Output() selectedProratingTypeKey = new EventEmitter();
  @Output() selectedDeductibleTypeKey = new EventEmitter();
  @Output() yearTypeToSave = new EventEmitter();
  @Input() FormGroup: FormGroup; //Intitialize form 
  planSuspendedForm: FormGroup;
  divisionSuspendedForm: FormGroup;
  @ViewChildren(DataTableDirective)
  error: { isError: boolean; errorMessage: string; };

  dateNameArray = {};
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  PlanInfoFormData: any;
  arrProratingList;
  arrDeductibleList;
  arrYearTypeList;
  coKey;
  plansKey
  divisionUnique
  planUniqueId
  companyUniqueId
  plansKeyUrlId
  coKeyUrlId
  plan_eff_date
  company_eff_date
  effective_date_proratingType
  effective_date_deductibleType

  companyNumber;
  // declair variable for (#1189)
  businessType;
  planInfoDisable : boolean = false;
  effectiveDateValue
  divisionDependAge1NumVal
  divisionDependAge2NumVal
  //end 
  companyName;
  planNumber;
  planKeyUrl;
  suspendDisableDate: any;
  checkSuspendedPlan = true
  planDivisionSuspendId

  hideSuspendedButton
  planYearTypeKey
  unChecked: string = 'assets/images/uncheck.jpg'
  checked: string = 'assets/images/checked.jpg'
  addMode: boolean = true;
  viewMode: boolean = false;
  editMode: boolean = false;

  companyPlanKey;
  companyDivisionKey;
  companyKey;

  isUnitCommentHistoryExist = false;
  isSuspendedHistoryExist = false;
  isDivCommHistoryExist = false;
  isPrpHistoryExist = false;
  isDedHistoryExist = false;
  isUnitCommentsHistoryExist = false;

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

  dataPlanInfo;

  isCompanyTravel;

  suspended_history_plan_columns = [
    { title: "Suspend Date", data: 'suspendedOn' },
    { title: "Resume Date", data: 'resumedOn' },
    { title: "Comment", data: 'divSuspendHistCom' }
  ]

  division_comments_plan_columns = [
    { title: "Date", data: 'effectiveOn' },
    { title: "User ID", data: 'userId' },
    { title: "Department", data: 'division' },
    { title: "Comment", data: 'divComTxt' }
  ]

  prorating_type_columns = [
    { title: "Prorating Type", data: 'prorateTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' }
  ]

  deductable_type_columns = [
    { title: "Deductible Type", data: 'deductTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' }
  ]

  unit_comments_columns = [
    { title: "Unit Comments", data: 'commentTxt' },
    { title: "Effective Date", data: 'createdOn' }
  ]

  public planYearTypeData: CompleterData;
  public proratingTypeData: CompleterData;
  public deductibleTypeData: CompleterData;

  public isOpen: boolean = false;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  showHideTypeOfYear: boolean = true;
  travelPolicyColumns = []
  ObservableObj;
  check = true
  divTravelEligibiltyList:any
  dtOptionsTravel: DataTables.Settings = {};
  dtTriggerTravel: Subject<any> = new Subject();
  dtElement: DataTableDirective;
  planNo
  divisionNo
  constructor(private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private exDialog: ExDialog,
    private route: ActivatedRoute,
    private ToastrService: ToastrService,
    private router: Router,
    private toastr: ToastrService,
    private planService: PlanService,
    private completerService: CompleterService,
    private translate: TranslateService,
    public currentUserService: CurrentUserService,
  ) {
    super();
    this.route.queryParams.subscribe((params: Params) => {
      this.companyPlanKey = params.planId;
      this.companyDivisionKey = params.divisionId;
      this.companyKey = params.companyId;

      // In case of edit or copy division only
      if (params['planId']) {
        this.getPlanData(params);
      }
    });

    this.GetProratingTypeList();
    this.GetDeductibleTypeList();
    this.GetYearTypeList();

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

    //For Plan
    planService.hideButtons.subscribe((value) => {
      this.hideSuspendedButton = value.hideSuspendedButton;
    });

  }

  planInfoFormDataVal = {
    'company_number': new FormControl('', [Validators.required, Validators.maxLength(9)]),
    'company_name': new FormControl('', [Validators.required, CustomValidators.notEmpty]),
    'plan_num': new FormControl('', [Validators.required, Validators.maxLength(10), CustomValidators.onlyNumbers, CustomValidators.notEmpty]),
    'effective_date': new FormControl('', [Validators.required]),
    'expiry_date': new FormControl(null),
    'division_num': new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.notEmpty]),
    'division_name': new FormControl('', [Validators.required, Validators.maxLength(80), CustomValidators.notEmpty]),
    'type_of_year': new FormControl('', [Validators.required]),
    'dependent_age_1': new FormControl('', [CustomValidators.onlyNumbers]),
    'dependent_age_2': new FormControl('', [CustomValidators.onlyNumbers]),
    // end
    'division_comment': new FormControl('', [Validators.maxLength(500), CustomValidators.notEmpty]),
    'prorating_type': new FormControl(null),
    'deductible_type': new FormControl(null),
    'single_debit_amount': new FormControl('', CustomValidators.deductibleAmountWithTwoDecimals),
    'family_debit_amount': new FormControl('', CustomValidators.deductibleAmountWithTwoDecimals),
    'no_claim': new FormControl(''),
    'extra_benefits': new FormControl(''),
    'flex_account': new FormControl(''),
    'default_wsa': new FormControl('',),
    'upper_wsa': new FormControl(''),
    'lower_wsa': new FormControl(''),
    'suspended_plan': new FormControl(''),
    'effective_date_proratingType': new FormControl(null),
    'expiry_date_proratingType': new FormControl(null),
    'effective_date_deductibleType': new FormControl(null),
    'expiry_date_deductibleType': new FormControl(null),
    'effective_date_division': new FormControl(null),
    'terminate_date_division': new FormControl(null),
    'effective_date_divisionDetails': new FormControl(null),
    'expiry_date_divisionDetails': new FormControl(null),
    'policyNumber': new FormControl(null), // Log #1162
    'travelEffectiveDate': new FormControl(null),
    'travelExpiryDate': new FormControl(null)
  }

  dataToggle: string

  proratingTypeDataTarget: string
  proratingTypeId: string
  proratingTypeClass: string
  proratingTypeTitle: string

  divisionCommentsDataTarget: string
  divisionCommentsId: string
  divisionCommentsClass: string
  divisionCommentsTitle: string

  suspendDivisionDataTarget: string
  suspendDivisionId: string
  suspendDivisionClass: string
  suspendDivisionTitle: string

  deductibleDataTarget: string
  deductibleId: string
  deductibleClass: string
  deductibleTitle: string

  unitCommentDataTarget: string
  unitCommentId: string
  unitCommentClass: string
  unitCommentTitle: string
  // Log #1162: changes as per new feedback
  editPolicyTravel: boolean = false
  divTravelEligibilityKey
  policyNum
  effectiveOn
  expiredOn
  travelPolEffectiveDate;
  travelPolExpiredDate

  ngOnInit() {
    this.FormGroup.controls.terminate_date_division.disable();
    this.dataToggle = "modal"
    this.proratingTypeDataTarget = "#ProratingTypeHistory"
    this.proratingTypeId = "prorating_history"
    this.proratingTypeClass = "history-ico"
    this.proratingTypeTitle = "Prorating Type History"

    this.divisionCommentsDataTarget = "#DivisionCommentsHistory"
    this.divisionCommentsId = "div_comment_history"
    this.divisionCommentsClass = "history-ico"
    this.divisionCommentsTitle = "Division Comments History"

    this.suspendDivisionDataTarget = "#PlanSuspendedHistory"
    this.suspendDivisionId = "suspend_division_history"
    this.suspendDivisionClass = "history-ico"
    this.suspendDivisionTitle = "Suspend Division History"

    this.deductibleDataTarget = "#DeductableTypeHistory"
    this.deductibleId = "deductable_history"
    this.deductibleClass = "history-ico"
    this.deductibleTitle = "Deductible Type History"

    this.unitCommentDataTarget = "#unitCommentsHistory"
    this.unitCommentId = "unit_comment_history"
    this.unitCommentClass = "history-ico"
    this.unitCommentTitle = "Unit Comment History"

    if (this.updates_comment.value == "") {
      this.isUnitCommentHistoryExist = false;
    }
    else {
      this.isUnitCommentHistoryExist = true;
    }

    this.user = (localStorage.getItem('user'));
    let planDataJson = {
      "coKey": this.companyKey
    }
    var URL = PlanApi.getCompanyDetailByCompanyCoKeyUrl;
    this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.isCompanyTravel = data.result.travelStatus
      }
    });
    var self = this;
    this.route.queryParams.subscribe((params: Params) => {
      /** Add Plan Case */
      var companyId = params['companyId'];
      var planKeyUrlId = params['planId'];
      this.planKeyUrl = params['planId'];
      var divisionKeyUrlId = params['divisionId'];
      this.GetCompanyDetailByCompanyCoKey(companyId).then(res => {
        if (!planKeyUrlId) {
          var companyDate = this.changeDateFormatService.convertStringDateToObject(this.company_eff_date);
          var dt = new Date(this.company_eff_date.date);

          // GET THE MONTH AND YEAR OF COMPANY EFFECTIVE DATE.
          var month = companyDate.date.month,
            year = companyDate.date.year,
            day = companyDate.date.day;
          if (day == 1) {
            var planEffectiveFirstDate = new Date(year, month, 1);
            this.FormGroup.patchValue({
              'effective_date': companyDate,
              'effective_date_proratingType': companyDate,
              'effective_date_deductibleType': companyDate
            });
          } else {
            var planEffectiveFirstDate = new Date(year, month, 1);
            this.FormGroup.patchValue({
              'effective_date': this.changeDateFormatService.convertStringDateToObject(this.convert(planEffectiveFirstDate)),
              'effective_date_proratingType': this.changeDateFormatService.convertStringDateToObject(this.convert(planEffectiveFirstDate)),
              'effective_date_deductibleType': this.changeDateFormatService.convertStringDateToObject(this.convert(planEffectiveFirstDate))
            });
          }

          this.FormGroup.controls['effective_date_proratingType'].disable();
          this.FormGroup.controls['effective_date_deductibleType'].disable();
        }
      });

      this.coKeyUrlId = companyId;
      /** Edit/Copy Division/Add Division Plan Case */
      if (params['planId']) {
        if (params['planType'] != "copyDivision") {
          this.showHideTypeOfYear = false
          this.editMode = true;
          this.addMode = false;
          this.viewMode = false;
        }
      }

      //Add Division Case
      if (params['planType'] == "addDivision") {
        this.yearTypeKey = params['yrTypeKey'];
        this.yearTypeDesc = params['yrTypeDesc'];
        this.FormGroup.patchValue({
          'type_of_year': this.yearTypeDesc
        });
        this.showHideTypeOfYear = false
        // this.FormGroup.controls['type_of_year'].disable();
        this.showProratingExpiry = false;
        this.showDeductibleExpiry = false;
      }

      if (params['planType'] == "copyDivision") {
        this.showHideTypeOfYear = false;
        this.isCopyMode = true;
      }
      else{
        this.isCopyMode = false;
      }

    });
    var todaydate = this.changeDateFormatService.getToday();
    this.FormGroup.patchValue({ 'effective_date': todaydate });

    /** Plan Suspend History */
    this.divisionSuspendedForm = new FormGroup({
      suspendOn: new FormControl('', Validators.required),
      resumeOn: new FormControl(''),
      suspendDivisionComment: new FormControl('', CustomValidators.notEmpty),
    });

    var suspendDivisionTableActions = [
      { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil' },
    ]
    // save suspend Save
    var suspend_division_url = PlanApi.planDivisionSuspendList;
    var suspendTableID = "suspend_division";
    var reqParam = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }]

    this.ObservableSuspendedCompanyObj = Observable.interval(1000).subscribe(x => {
      if (this.checkSuspendedPlan = true) {
        if ('company.company-form.suspend-date' == this.translate.instant('company.company-form.suspend-date')) {
        }
        else {
          this.suspended_plan_columns = [
            { title: this.translate.instant('company.company-form.suspend-date'), data: 'suspendedOn' },
            { title: this.translate.instant('company.company-form.resume-date'), data: 'resumedOn' },
            { title: this.translate.instant('company.company-tab-datatable.suspend-plan-history.plan-comment'), data: 'divSuspendHistCom' },
            { title: this.translate.instant('common.action'), data: 'divSuspendHistKey' }
          ];
          this.dataTableService.jqueryDataTable(suspendTableID, suspend_division_url, 'full_numbers', this.suspended_plan_columns, 5, true, false, 't',
            'irp', undefined, [1, 'asc'], '', reqParam, suspendDivisionTableActions, 3, [0, 1])

          this.checkSuspendedPlan = false;
          this.ObservableSuspendedCompanyObj.unsubscribe();
        }
      }
    });

    $(document).on('mouseover', '#prorating_history .history-ico', function () {
      $(this).attr('title', 'Prorating Type History');
    })

    $(document).on('mouseover', '#deductable_history .history-ico', function () {
      $(this).attr('title', 'Deductible History');
    })

    $(document).on('mouseover', '#div_comment_history .history-ico', function () {
      $(this).attr('title', 'Division Comments History');
    })

    $(document).on('mouseover', '#suspend_division_history .history-ico', function () {
      $(this).attr('title', 'Division Comments History');
    })

    $(document).on('mouseover', '#standard_pap_history .history-ico', function () {
      $(this).attr('title', 'Standard PAP Amount History');
    })

    $(document).on('mouseover', '#adjusted_pap_history .history-ico', function () {
      $(this).attr('title', 'Adjusted PAP Amount History');
    })

    $(document).on('mouseover', '#suspend_history .history-ico', function () {
      $(this).attr('title', 'Suspend History');
    })


    $(document).on('click', '#suspend_division .edit-ico', function () {
      var id = $(this).data('id')
      self.planDivisionSuspendId = id
      self.setSuspendedValues();
    })


    /** Plan Suspend History End */

    this.dtOptions['division_comments'] = Constants.dtOptionsConfig
    this.dtTrigger['division_comments'] = new Subject();

    if (this.isprorateTypeKeyExists == false) {
      this.FormGroup.controls['effective_date_proratingType'].disable();
      this.FormGroup.controls['expiry_date_proratingType'].disable();

    } else {
    }

    // Log #1162
    this.dtOptionsTravel = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]], }
    this.getDivTravelEligibilityList()
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

  /**
   * Get Company Detail By Company Key   
  */
  GetCompanyDetailByCompanyCoKey(coKey) {
    let promise = new Promise((resolve, reject) => {
      let planDataJson = {
        "coKey": coKey
      }
      var URL = PlanApi.getCompanyDetailByCompanyCoKeyUrl;
      this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
        if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.company_eff_date = data.result.effectiveOn //Global value set          
          this.FormGroup.patchValue({
            'company_number': data.result.coId,
            'company_name': data.result.coName,
          });
          this.companyNumber = data.result.coId
          this.companyName = data.result.coName
          this.planNumber = data.result.coId
          // save businessTypeKey value for add check on dependent_age_1 and dependent_age_2 fields (#1189)
          this.businessType = data.result.businessTypeKey
          if(this.businessType == 1){
            // Condition below was '==5' to company number length before, now changed.
            if(this.companyNumber.length <= 5)
            {
              this.planInfoDisable = false;
            } else {
              this.planInfoDisable = true;
            }
          }else{
            this.planInfoDisable = false;
            this.FormGroup.controls['plan_num'].setValidators([Validators.required, Validators.maxLength(10), CustomValidators.alphaNumericWithoutSpace, CustomValidators.notEmpty]);
            this.FormGroup.controls['plan_num'].updateValueAndValidity();
          }
          //end
          resolve();
        } else {
        }
      });
      this.FormGroup.controls.company_name.disable();
    });
    return promise;
  }

  getPlanData(params) {
    this.planService.planModuleData.subscribe((value) => {
      this.infoJsonEditModeData = value.planInfoJson[0]
      this.dentalRuleHistInd = value.rulesJson[0].dentalRuleHistInd
      this.feeGuideProvinceHist = value.planInfoJson[0].feeGuideProvinceHist
      this.feeGuideScheduleHist = value.planInfoJson[0].feeGuideScheduleHist
      this.feeGuideScheduleHist = value.planInfoJson[0].feeGuideScheduleHist
      this.divisionMaxHistInd = value.planInfoJson[0].divisionMaxHistInd

      if (this.dentalRuleHistInd == "Y") {
        this.dentalRuleHistInd = true
      } else {
        this.dentalRuleHistInd = false
      }
      if (value.planInfoJson[0].yrTypeDesc != undefined) {
        this.type_of_year = value.planInfoJson[0].yrTypeKey;
      }
      else if (value.planInfoJson[0].yearTypeData.yrTypeKey != undefined) {
        this.type_of_year = value.planInfoJson[0].yearTypeData.yrTypeKey;
      }

      if (value.planInfoJson[0].deductTypeDesc != undefined && value.planInfoJson[0].deductTypeDesc != null) {
        this.deductibleType = value.planInfoJson[0].deductTypeKey;
      }
      else {
        this.deductibleType = '';
      }
      // change for effective date (for age1 and age2) in Division Details Section
      setTimeout(() => {
        let requestJson = {
          "coKey": params.companyId
        }
        var URL = PlanApi.getCompanyDetailByCompanyCoKeyUrl;
        this.hmsDataServiceService.postApi(PlanApi.getCompanyDetailByCompanyCoKeyUrl, requestJson).subscribe(data => {
          if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          if (data.result.businessTypeKey == 2) {
            this.divisionDependAge1NumVal = value.planInfoJson[0].divisionDependAge1Num;
            this.divisionDependAge2NumVal = value.planInfoJson[0].divisionDependAge2Num;
            if (this.divisionDependAge1NumVal != null || this.divisionDependAge2NumVal != null){
              this.effectiveDateValue = this.changeDateFormatService.convertStringDateToObject(value.planInfoJson[0].effectiveOn);
            } else {
              this.effectiveDateValue = "";
            }
            if (this.age1Val == "" && this.age2Val == "" || this.age1Val == undefined && this.age2Val == "" || this.age1Val == "" && this.age2Val == undefined ) {
              this.effectiveDateValue = "";
            }
            else if ( this.age1Val == "" && this.age2Val == "" ) {
              this.ageValue = false;
            }
          } else {
            this.effectiveDateValue = this.changeDateFormatService.convertStringDateToObject(value.planInfoJson[0].effectiveOn);
          }
          
          // deductible type in preview section
          if(this.FormGroup.value.deductible_type == ""){
            this.counterVal = false
          }
          if(value.planInfoJson[0].deductTypeDesc){
            this.deductibleTypeValue = value.planInfoJson[0].deductTypeDesc
          }
          else{
            if(!value.planInfoJson[0].deductTypeDesc && this.deductTypeKey == null){
               if(this.counterVal){
                this.deductibleTypeValue = this.deductTypeDesc
               } else {
                this.deductibleTypeValue = null
               }
            } else if (this.deductTypeKey != null && this.deductibleTypeArray['deductTypeKey'] != null){
              this.deductibleTypeValue = this.deductTypeDesc
            }
            else{
              this.deductibleTypeValue = this.deductTypeDesc
            }
          }
         //end
         if(value.planInfoJson[0].prorateTypeDesc){
          this.proratingtypeValue = value.planInfoJson[0].prorateTypeDesc
        } else {
          if(this.FormGroup.value.prorating_type == ''){
            this.proratingtypeValue =  "";
          }
          else {
          this.proratingtypeValue = this.prorateTypeDesc
          }
        }

      this.FormGroup.patchValue({
        'type_of_year': value.planInfoJson[0].yrTypeDesc ? value.planInfoJson[0].yrTypeDesc : value.planInfoJson[0].yearTypeData.yrTypeDesc,
        'dependent_age_1': value.planInfoJson[0].divisionDependAge1Num,
        'dependent_age_2': value.planInfoJson[0].divisionDependAge2Num,
        'prorating_type' : this.proratingtypeValue,
        'deductible_type': this.deductibleTypeValue,
        'single_debit_amount': value.planInfoJson[0].divisionSingleDeductAmt,
        'family_debit_amount': value.planInfoJson[0].divisionFamilyDeductAmt,
        "no_claim": (value.planInfoJson[0].noClaimsecureInTotalInd == "T") ? true : false,
        "extra_benefits": (value.planInfoJson[0].plansExtraBenefitInd == "T") ? true : false,
        'effective_date_proratingType': this.changeDateFormatService.convertStringDateToObject(value.planInfoJson[0].proratingEffectiveOn),
        'expiry_date_proratingType': this.changeDateFormatService.convertStringDateToObject(value.planInfoJson[0].proratingExpiredOn),
        'effective_date_deductibleType': this.changeDateFormatService.convertStringDateToObject(value.planInfoJson[0].deductibleEffectiveOn),
        'expiry_date_deductibleType': this.changeDateFormatService.convertStringDateToObject(value.planInfoJson[0].deductibleExpiredOn),
        'effective_date_divisionDetails': this.effectiveDateValue
        });
          }
        });
      }, 100);

      let proratingTypeSelect = value.planInfoJson[0].prorateTypeKey ? value.planInfoJson[0].prorateTypeKey : null

      if (value.planInfoJson[0].effectiveOn) {
        var dateArray = this.changeDateFormatService.convertStringDateToObject(value.planInfoJson[0].effectiveOn);
        this.FormGroup.patchValue({
          effective_date: {
            date: {
              year: dateArray.date.year,
              month: dateArray.date.month,
              day: dateArray.date.day
            }
          }
        });
      }

      this.planYearTypeKey = value.planInfoJson[0].yrTypeKey;
      this.FormGroup.controls['type_of_year'].disable();
      if (value.planInfoJson[0].unit) {
        this.UnitList = value.planInfoJson[0].unit;
        this.UnitList = (this.UnitList || []).sort((a, b) => a.unitId < b.unitId ? -1 : 1)
      }
      // Log 1162: Get Plan No and Division No.
      this.planNo = value.planInfoJson[0].plansId
      this.divisionNo = value.planInfoJson[0].divisionId

      if (params['planType'] != "copyDivision") {
        this.FormGroup.patchValue({
          'division_num': value.planInfoJson[0].divisionId,
          'division_name': value.planInfoJson[0].divisionName,
          'division_comment': value.planInfoJson[0].divComtxt,
        });

        if (value.planInfoJson[0].deductibleTypeHistInd == "Y") {
          this.isDedHistoryExist = true;
        } else {
          this.isDedHistoryExist = false;
        }

        if (value.planInfoJson[0].prorateHistInd == "Y") {
          this.isPrpHistoryExist = true;
        } else {
          this.isPrpHistoryExist = false;
        }

        if (value.planInfoJson[0].divisionCommentInd == "Y") {
          this.isDivCommHistoryExist = true;
        } else {
          this.isDivCommHistoryExist = false;
        }

        if (value.planInfoJson[0].divisionSuspendHistInd == "Y") {
          this.isSuspendedHistoryExist = true;
        } else {
          this.isSuspendedHistoryExist = false;
        }

        if (value.planInfoJson[0].divisionSuspendInd == "T") {
          this.isDivisionSuspended = true
        } else {
          this.isDivisionSuspended = false
        }

        if (value.planInfoJson[0].prorateTypeKey != '') {
          this.isprorateTypeKeyExists = true
        } else {
          this.isprorateTypeKeyExists = false
        }
      }
      this.planService.selectedDivisionUpdateType.subscribe((val) => {
      this.divisionEmitVal = val;
    })
    if(!this.divisionEmitVal){
    setTimeout(() => {
      this.planService.selectedDivisionType.emit(false);
     }, 4000);
     }
    });
  }

  sendPlanInfoData($unitsData) {
    if (this.editPlanMode) {
      var InfoData = this.FormGroup.value;
      InfoData['unitData'] = this.UnitList;
      this.planInfoData.emit();
      $('.company-tabs li').removeClass('active');
      $('.company-tabs [href*="plan-benefits"]').parent().addClass('active');
      $('.grid-inner #plan-dash').removeClass('active in');
      $('.grid-inner #plan-benefits').addClass('active in');
    } else {
      var InfoData = this.FormGroup.value;
      InfoData['unitData'] = $unitsData;
      this.planInfoData.emit(InfoData);
    }
  }

  /**
   * Get Prorating Type List    
   */
  GetProratingTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getProratingTypeListUrl).subscribe(data => {
      if (data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
        this.arrProratingList = data.result;
        //Predictive Company Search Upper
        this.proratingTypeData = this.completerService.local(
          this.arrProratingList,
          "prorateTypeDesc",
          "prorateTypeDesc"
        );
      }
    })
  }

  onProratingTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedProratingType = (selected.originalObject.prorateTypeKey).toString();
      this.selectedProratingTypeKey.emit(this.selectedProratingType);
      this.isRequiredEnable =  true;
    }
    else {
     this.selectedProratingTypeKey.emit('');
      this.selectedProratingType = '';
      this.isRequiredEnable =  false;
    }
  }

  onBlurProratingType(event) {
  }

  /**
   * Get Deductible Type List   
   */
  GetDeductibleTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getDeductibleTypeListUrl).subscribe(data => {
      if (data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
        this.arrDeductibleList = data.result;
        //Predictive Company Search Upper
        this.deductibleTypeData = this.completerService.local(
          this.arrDeductibleList,
          "deductTypeDesc",
          "deductTypeDesc"
        );
      }
    })
  }

  onDeductibleTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedDeductibleType = (selected.originalObject.deductTypeKey).toString();
      this.selectedDeductibleTypeKey.emit(this.selectedDeductibleType);
      this.forDeductRequired = true;
    }
    else {
      this.selectedDeductibleType = '';
      this.forDeductRequired = false;
    }
  }

  /**
   * Get Year Type list  
   */
  GetYearTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getYearTypeListUrl).subscribe(data => {
      if (data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
        if (data.code == 200) {
          this.arrYearTypeList = data.result;
          //Predictive Company Search Upper
          this.planYearTypeData = this.completerService.local(
            this.arrYearTypeList,
            "yrTypeDesc",
            "yrTypeDesc"
          );
        }
      }
    })
  }

  onYearTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedYearType = (selected.originalObject.yrTypeKey).toString();
      this.selectedYearTypeKey.emit(this.selectedYearType);
    }
    else {
      this.selectedYearType = '';
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

  ProratingTypeChange() {
    var prorateType = this.FormGroup.controls['prorating_type'].value;
    var effective_date_proratingType = this.FormGroup.controls['effective_date_proratingType'].value;
    if (prorateType != 0 && effective_date_proratingType == null) {
      this.FormGroup.controls['effective_date_proratingType'].enable()
      this.FormGroup.controls['expiry_date_proratingType'].enable()
      this.FormGroup.controls['effective_date_proratingType'].setErrors({
        "ProratingEffectiveRequired": true
      });
    } else {
      this.FormGroup.controls['effective_date_proratingType'].setErrors(null);
    }
  }

  DeductibleTypeChange() {
    var deductType = this.FormGroup.controls['deductible_type'].value;
    var effective_date_deductibleType = this.FormGroup.controls['effective_date_deductibleType'].value;
    if (deductType != 0 && effective_date_deductibleType == null) {
      this.FormGroup.controls['effective_date_deductibleType'].setErrors({
        "DeductibleEffectiveRequired": true
      });
    } else {
      this.FormGroup.controls['effective_date_deductibleType'].setErrors(null);
    }
  }

  changeDateFormat(event, frmControlName, formName, currentDate) {
    // change for effective date
    if (frmControlName == "effective_date_divisionDetails"){
    if (this.businessType == 2) {
      if (this.age1Val == "" && this.age2Val == "" || this.age1Val == undefined && this.age2Val == "" || this.age1Val == "" && this.age2Val == undefined) {
        this.FormGroup.patchValue({ 'effective_date_divisionDetails': '' });
        currentDate = false;
      }
      else if (this.divisionDependAge1NumVal != null || this.divisionDependAge2NumVal !=null || this.age1Val != null || this.age2Val != null ) {
        currentDate = true;
      }
      else {
        currentDate = false;
      }
     }
    }
    //end
    // to resolve HMS point no - 568
    var self = this
    if(frmControlName == "travelEffectiveDate"){
    this.addObservableObj = Observable.interval(500).subscribe(val => {
      $(document).ready(function() {        
        $('#companyTravelEffectiveDate .mydp .selectiongroup .selbtngroup .btnclearenabled .icon-mydpremove').click(function(e) {
          self.effVal = true
        });        
      });
    });
   }
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      if ((frmControlName == "expiry_date_proratingType" && (event.value == null || event.value == ''))
      ||(frmControlName == "travelEffectiveDate" && (event.value == null || event.value == ''))
    ) {
      if(((this.FormGroup.value.effective_date_proratingType != null ? true : false && this.FormGroup.value.effective_date_proratingType.date != "") && (event.value == null || event.value == '') && frmControlName == "expiry_date_proratingType")
      ){  
          var validDate = this.changeDateFormatService.getToday();
        } else if(frmControlName == "travelEffectiveDate" && (event.value == null || event.value == '')){
        if(self.effVal){
          this.FormGroup.patchValue({
            'travelEffectiveDate': ""
          })
          self.effVal = false;
        } else {
            var validDate = this.changeDateFormatService.getToday();
        }
      }
    } else{
      if((this.FormGroup.value.effective_date_deductibleType == null 
        || this.FormGroup.value.effective_date_deductibleType == undefined 
        || this.FormGroup.value.effective_date_deductibleType.date == "") && (event.value == null || event.value == '')){
        var ControlName = frmControlName;
        var datePickerValue = new Array();
        datePickerValue[ControlName] = "";
      } 
      else {
        var validDate = this.changeDateFormatService.getToday();
      }
    }
    var ControlName = frmControlName;
    var datePickerValue = new Array();
    datePickerValue[ControlName] = validDate;
  } else if (event.reason == 1 && (event.value == "" || event.value == null)){
    if((frmControlName == "travelEffectiveDate" && (event.value == null || event.value == ''))
    ||(frmControlName == "expiry_date_proratingType" && (event.value == null || event.value == ''))
    ||(frmControlName == "expiry_date_deductibleType" && (event.value == null || event.value == ''))
    ){
      if(frmControlName == "travelEffectiveDate" && (event.value == null || event.value == '')){
      }
      else{
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      }
    }
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
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    } 
    else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      // Set Date Picker Value to Form Control Element
      this.FormGroup.patchValue(datePickerValue);
    }
    
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
     
    if (event.reason == 2) {
      if (formName == 'FormGroup') {
        this.FormGroup.patchValue(datePickerValue);
        if (this.company_eff_date && this.FormGroup.value.effective_date) {
          var company_eff_date = this.changeDateFormatService.convertStringDateToObject(this.company_eff_date);
          var errorVal = this.changeDateFormatService.compareTwoDates(company_eff_date.date, this.FormGroup.value.effective_date.date);
          if (errorVal.isError == true) {
            this.FormGroup.controls.effective_date.setErrors({
              "PlanEffDateNotValid": true
            });
            return;
          }
        }

        //Start If Prorating Type Selected Then Effective Date is Required
        var prorateType = this.FormGroup.controls['prorating_type'].value != undefined ? this.FormGroup.controls['prorating_type'].value : '';
        var effective_date_proratingType = this.FormGroup.controls['effective_date_proratingType'].value;
        if (prorateType != 0 && effective_date_proratingType == null) {
          this.FormGroup.controls['effective_date_proratingType'].statusChanges
          this.FormGroup.controls['effective_date_proratingType'].setErrors({
            "ProratingEffectiveRequired": true
          });
          $('html, body').animate({
            scrollTop: $(document).height()
          }, 'slow');
        } else {
          this.FormGroup.controls['effective_date_proratingType'].setErrors(null);
        }

        //Start If Deductible Type Selected Then Effective Date is Required
        var deductType = this.FormGroup.controls['deductible_type'].value;
        var effective_date_deductibleType = this.FormGroup.controls['effective_date_deductibleType'].value;
        if (deductType != undefined) {
          if (deductType != 0 && effective_date_deductibleType == null) {
            this.FormGroup.controls['effective_date_deductibleType'].setErrors({
              "DeductibleEffectiveRequired": true
            });
          } else {
            this.FormGroup.controls['effective_date_deductibleType'].setErrors(null);
          }
        }

        //Start Compare Prorating/Deductible Effective Date With Plan Effective Date               
        if (this.FormGroup.value.effective_date_proratingType && this.FormGroup.value.effective_date) {
          var errorVal = this.changeDateFormatService.compareTwoDates(this.FormGroup.value.effective_date.date, this.FormGroup.value.effective_date_proratingType.date);
          if (errorVal.isError == true) {
            this.FormGroup.controls.effective_date_proratingType.setErrors({
              "ProratingEffDateNotValid": true
            });
            return;
          }
        }
        if (this.FormGroup.value.effective_date_deductibleType && this.FormGroup.value.effective_date) {
          var errorVal = this.changeDateFormatService.compareTwoDates(this.FormGroup.value.effective_date.date, this.FormGroup.value.effective_date_deductibleType.date);
          if (errorVal.isError == true) {
            this.FormGroup.controls.effective_date_deductibleType.setErrors({
              "DeductibleEffDateNotValid": true
            });
            return;
          }
        }
        //End 
      }
    }

    // Log #1162: Travel Date checks
    if(this.editPolicyTravel) {
      if (this.FormGroup.value.travelEffectiveDate && this.travelPolEffectiveDate) {
        var isErrors = this.changeDateFormatService.compareBeforeAndAfterDate(this.FormGroup.value.travelEffectiveDate.date, this.changeDateFormatService.convertStringDateToObject(this.travelPolEffectiveDate).date);
        if (isErrors.isError == true) {
          this.FormGroup.controls.travelEffectiveDate.setErrors({
            "cannotChangeEffectiveDate": true
          });
          return;
        }
      }
      if (this.FormGroup.value.travelExpiryDate && this.travelPolExpiredDate) {
        var isExpiryError = this.changeDateFormatService.compareBeforeAndAfterDate(this.FormGroup.value.travelExpiryDate.date, this.changeDateFormatService.convertStringDateToObject(this.travelPolExpiredDate).date);
        if (isExpiryError.isError == true) {
          this.FormGroup.controls.travelExpiryDate.setErrors({
            "cannotChangeExpiryDate": true
          });
          return;
        }
      }
    }
   
    
  }

  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      // Set Date Picker Value to Form Control Element
      this.divisionSuspendedForm.patchValue(datePickerValue);
    }
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
      if (formName == 'divisionSuspendedForm') {
        this.divisionSuspendedForm.patchValue(datePickerValue);
        if (this.divisionSuspendedForm.value.suspendOn) {
          var dt = new Date(this.divisionSuspendedForm.value.suspendOn.date);

          // GET THE MONTH AND YEAR OF THE SELECTED DATE.
          var month = this.divisionSuspendedForm.value.suspendOn.date.month,
            year = this.divisionSuspendedForm.value.suspendOn.date.year;

          // GET THE FIRST AND LAST DATE OF THE MONTH.
          var suspendLastDate = new Date(year, month, 0);
          var suspendLastDateValue = this.changeDateFormatService.convertStringDateToObject(this.convert(suspendLastDate));
          var suspendLastDateValueForSuspended = this.changeDateFormatService.convertStringDateToObject(this.convert(suspendLastDate));
          this.divisionSuspendedForm.patchValue({
            suspendOn: {
              date: {
                year: suspendLastDateValue.date.year,
                month: suspendLastDateValue.date.month,
                day: suspendLastDateValue.date.day
              }
            }
          });
        }

        if (this.divisionSuspendedForm.value.resumeOn) {

          var dt = new Date(this.divisionSuspendedForm.value.resumeOn.date);

          // GET THE MONTH AND YEAR OF THE SELECTED DATE.
          var month = this.divisionSuspendedForm.value.resumeOn.date.month,
            year = this.divisionSuspendedForm.value.resumeOn.date.year;

          var now = new Date();
          var thisMonth = now.getMonth();

          // GET THE FIRST AND LAST DATE OF THE MONTH.
          var resumeFirstDate = new Date(year, month - 1, 1);
          if (resumeFirstDate > suspendLastDate) {
          } else {
          }
          var dateValueResumed = this.changeDateFormatService.convertStringDateToObject(this.convert(resumeFirstDate));
          /**
           * Check if suspended date is greater than resume date
           * if greater than increment suspended date and put in resume date
           */
          if (suspendLastDate > resumeFirstDate) {

            var updatedDateForResumeFromSuspended = suspendLastDate;
            //add a day to the date
            updatedDateForResumeFromSuspended.setDate(updatedDateForResumeFromSuspended.getDate() + 1);
            var updatedDateForResumeFromSuspendedValue = this.changeDateFormatService.convertStringDateToObject(this.convert(updatedDateForResumeFromSuspended));
            this.divisionSuspendedForm.patchValue({
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
            this.divisionSuspendedForm.patchValue({
              resumeOn: {
                date: {
                  year: dateValueResumed.date.year,
                  month: dateValueResumed.date.month + 1,
                  day: dateValueResumed.date.day
                }
              }
            });
          } else {
            this.divisionSuspendedForm.patchValue({
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
          if (suspendDate && this.divisionSuspendedForm.value.resumeOn) {
            this.error = this.changeDateFormatService.compareTwoDates(suspendDate.date, this.divisionSuspendedForm.value.resumeOn.date);
            if (this.error.isError == true) {
              this.divisionSuspendedForm.controls.resumeOn.setErrors({
                "suspensionDateNotValid": true
              });
            }
          }
        }
      }
    }
  }

  convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("/");
  }

  /**
   * Following function return date string in Date Object Format
   * @param strDate : date will accepted as a string format.
   */
  convertStringDateToObject(strDate: string) {
    var objDate = strDate.split('-');
    return {
      date: {
        year: parseInt(objDate[2]),
        month: parseInt(objDate[1]),
        day: parseInt(objDate[0])
      }
    };
  }

  /**
   * Check Plan No. Exist or Not
   */
  isPlanValid(event) {
    if (event.target.value) {
      let plansId = { plansId: event.target.value };
      var URL = PlanApi.isPlanValidUrl;
      if (this.businessType == 2) { 
      } else {
        this.hmsDataServiceService.postApi(URL, plansId).subscribe(data => {
          if (data.hmsShortMessage == "PLANID_ALREADY_EXIST") {
            this.FormGroup.controls['plan_num'].setErrors({
              "planAlreadyExist": true
            });
          }
        });
      }
    }
  }

  /**
   * Validate the dependent age1 and age2.
   * @param age1 
   * @param age2 
   */
  isdependentAgeValid(age1, age2) {
    this.age1Val= age1.value;
    this.age2Val= age2.value; 
    if (this.isCompanyTravel == '' || this.isCompanyTravel == 'F') {
      // change for remove validation on dependent_age_1 field in plan section(#1189)
      if(this.businessType == 1){
      this.FormGroup.controls['dependent_age_1'].setValidators(
        [CustomValidators.age1RangeNonTravelCompany]
      );
      this.FormGroup.controls['dependent_age_1'].setValidators([Validators.required]);  //(#1189)
      }
      this.FormGroup.controls['dependent_age_1'].updateValueAndValidity()
    }
    else {
      this.FormGroup.controls['dependent_age_1'].setValidators(
        [CustomValidators.age1RangeTravelCompany]
      );
      this.FormGroup.controls['dependent_age_1'].updateValueAndValidity()
    }

    if (age2.value != '') {
      if (age1.value > age2.value) {
        this.FormGroup.controls['dependent_age_1'].setErrors({
          "age1NotGreaterThanAge2": true
        });
      } else {
        this.FormGroup.controls['dependent_age_2'].updateValueAndValidity()
      }
    }
    else{
      this.FormGroup.controls['dependent_age_2'].updateValueAndValidity()
    }
    if(this.businessType == 2){
      if(age1.value == "" && age2.value == "" || age1.value == undefined && age2.value == "" || age1.value == "" && age2.value == undefined  || age1.value == "" && age2.value != undefined || age1.value == undefined && age2.value != "" || age1.value != "" && age2.value == undefined || age1.value == "" && age2.value == "" || age1.value != "" && age2.value == "" ){
        this.ageValue = false;
        this.FormGroup.patchValue({ 'effective_date_divisionDetails': '' });
      } else{
        this.ageValue = true;
      }
      if(age1.value == undefined && age2.value == undefined){
        this.ageValue = false;
      }
    }
  }

  /**
   * Age 2 Should be Less Than Equal To Age 1
   */
  isAgeValid(age2, age1) {
    this.age1Val= age1.value;
    this.age2Val= age2.value; 
    if (this.isCompanyTravel == '' || this.isCompanyTravel == 'F') {
       // change for remove validation on dependent_age_2 field in plan section(#1189)
       if(this.businessType == 1){
      this.FormGroup.controls['dependent_age_2'].setValidators(
        [CustomValidators.age2RangeNonTravelCompany]
      );
      this.FormGroup.controls['dependent_age_2'].setValidators([Validators.required]); //(#1189)
       }
      this.FormGroup.controls['dependent_age_2'].updateValueAndValidity()
    }
    else {
      this.FormGroup.controls['dependent_age_2'].setValidators(
        [CustomValidators.age2RangeTravelCompany]
      );
      this.FormGroup.controls['dependent_age_2'].updateValueAndValidity()
    }

    if (age2.value < age1.value) {
      this.FormGroup.controls['dependent_age_2'].setErrors({
        "ageCompare": true
      });
    } else {
      this.FormGroup.controls['dependent_age_2'].updateValueAndValidity()
      this.FormGroup.controls['dependent_age_1'].updateValueAndValidity()
    }
    if(this.businessType == 2){
    if(age1.value == "" && age2.value == "" || age1.value == undefined && age2.value == "" || age1.value == "" && age2.value == undefined || age1.value == undefined && age2.value != "" || age1.value == "" && age2.value != "" || age1.value != "" && age2.value == undefined ){
      this.ageValue = false;
      this.FormGroup.patchValue({ 'effective_date_divisionDetails': '' });
    }else{
      this.ageValue = true;
    }
    if(age1.value == undefined && age2.value == undefined){
      this.ageValue = false;
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
    this.new_effective_date.markAsTouched();
    this.new_unit_id.markAsTouched();
    this.new_description.markAsTouched();
    

    if (this.new_unit_id.invalid || this.new_description.invalid || this.new_effective_date.invalid) {
      return;
    }

    var newUnitData = {
      unitKey: 0, // As requested by backend team because they have unitkey field Long Type
      unitId: this.new_unit_id.value,
      unitDesc: this.new_description.value,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.new_effective_date.value),
      terminatedOn: null
    }

    this.UnitList.unshift(newUnitData);
    this.resetNewUnitRow();
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
      terminatedOn: null
    }

    let copy = Object.assign({}, rowData);
    this.UnitList[index] = copy;
    this.resetUnitInfo();
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
        this.UnitList.splice(index, 1);
      }
    });
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

  /** 
   * Bind date with control 
   */
  setControlDate(frmControlName, obj) {
    this.dateNameArray[frmControlName] = {
      year: obj.date.year,
      month: obj.date.month,
      day: obj.date.day
    };
  }

  isValidForm() {
    if (this.FormGroup.valid) {
      return true;
    } else {
      return false;
    }
  }

  resetDivisionSuspendedForm() {
    this.divisionSuspendedForm.reset();
    this.divisionSuspendedForm.controls['suspendOn'].enable();
    this.resumeTrue = false
    var suspend_company_url = PlanApi.planDivisionSuspendList;
    var suspendTableID = "suspend_division";
    var reqParam = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }]
    this.dataTableService.jqueryDataTableReload(suspendTableID, suspend_company_url, reqParam);
  }

  getDivisionSuspendHistory() {
    var suspendedTableId = "suspended_division"
    var suspended_plan_url = PlanApi.planDivisionSuspendList;
    var reqParamSus = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }]
    if (!$.fn.dataTable.isDataTable('#suspended_division')) {
      var dateCols = ['suspendedOn', 'resumedOn']
      this.dataTableService.jqueryDataTable(suspendedTableId, suspended_plan_url, 'full_numbers', this.suspended_history_plan_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamSus, '', undefined, [0, 1]);
    }
    else {
      this.dataTableService.jqueryDataTableReload(suspendedTableId, suspended_plan_url, reqParamSus)
    }
  }

  submitSuspendedHold() {
    if (this.divisionSuspendedForm.valid) {
    } else {
      this.validateAllFormFields(this.divisionSuspendedForm);
    }
  }

  submitSuspended() {
    this.changeDateFormatService.convertDateObjectToString(this.divisionSuspendedForm.value.suspendOn);
    this.changeDateFormatService.convertDateObjectToString(this.divisionSuspendedForm.value.resumeOn);
    var obj = {};
    obj['divisionKey'] = this.companyDivisionKey;
    obj['resumeOn'] = this.changeDateFormatService.convertDateObjectToString(this.divisionSuspendedForm.value.resumeOn);
    obj['suspendOn'] = this.changeDateFormatService.convertDateObjectToString(this.divisionSuspendedForm.value.suspendOn);
    obj['divSuspendHistCom'] = (this.divisionSuspendedForm.value.suspendDivisionComment) ? this.divisionSuspendedForm.value.suspendDivisionComment : '';

    if (this.divisionSuspendedForm.valid) {
      this.divisionSuspendedForm.patchValue({ check: true });
      var suspendDateInstring = this.changeDateFormatService.convertDateObjectToString(this.divisionSuspendedForm.value.suspendOn);
      var isSuspendFutureDate = this.changeDateFormatService.isFutureDate(suspendDateInstring)
      if (this.divisionSuspendedForm.value.resumeOn) {
        var resumedDateInstring = this.changeDateFormatService.convertDateObjectToString(this.divisionSuspendedForm.value.resumeOn);
        var isresumedFutureDate = this.changeDateFormatService.isFutureDate(resumedDateInstring)
      }

      this.hmsDataServiceService.postApi(PlanApi.savePlanDivisionSuspendUrl,
        obj).subscribe(data => {
          if (data.code == 200 && data.status == "OK" && data.hmsShortMessage == "RECORD_SAVE_SUCCESSFULLY") {
            var suspend_company_url = PlanApi.planDivisionSuspendList;
            var suspendTableID = "suspend_division";
            var reqParam = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }]
            this.dataTableService.jqueryDataTableReload(suspendTableID, suspend_company_url, reqParam);
            this.toastr.success(this.translate.instant('Division Suspended Successfully'));
            this.divisionSuspendedForm.reset();
            this.isSuspendedHistoryExist = true

            if (isSuspendFutureDate) {
              this.isDivisionSuspended = false
            } else {
              if (this.divisionSuspendedForm.value.resumeOn) {
                if (isresumedFutureDate) {
                  this.isDivisionSuspended = true
                } else {
                  this.isDivisionSuspended = false
                }
              } else {
                this.isDivisionSuspended = true
              }
            }
            $("#closeSuspendedhistory").trigger('click')
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'RESUME_DATE_SHOULD_BE_GREATER_NOW_DATE') {
            this.toastr.error(this.translate.instant('company.plan.toaster.resumeNotLessThanCurrent'));
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'DIVISION_SUSPEND_DATE_SHOULD_BE_GREATER_THAN_DIVISION_EFFECTIVE_DATE') {
            this.toastr.error(this.translate.instant('company.plan.toaster.divisionSusGreaterThanDivisionEffective'));
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'COMPANY_ALREADY_SUSPENDED') {
            this.toastr.error(this.translate.instant('company.plan.toaster.companyAlreadySuspended'));
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'THE_RESUME_DATE_MUST_BE_TURNED_ON_BEFORE_NEW_SUSPENDED_DATE_CAN_BE_ADDED') {
            this.toastr.error(this.translate.instant('company.plan.toaster.ResumeMustTurnedOnBeforeDivisionSusDate'));
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'SUSPEND_DATE_MUST_GREATER_THAN_PREVIOUS_RESUME_DATE') {
            this.toastr.error(this.translate.instant('company.plan.toaster.susGreaterThanPreviousResumeDate'));
          }
        });
    } else {
      this.divisionSuspendedForm.patchValue({ check: false });
      this.validateAllFormFields(this.divisionSuspendedForm);
    }
  }

  getDivisionComments() {
    var division_comments_plan_url = PlanApi.getDivisionCommentHistory;
    var divisionCommentsTableId = "division_comments"
    var reqParamSus = { 'divisionKey': this.companyDivisionKey }
    this.hmsDataServiceService.postApi(division_comments_plan_url, reqParamSus).subscribe(data => {
      if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        this.division_comments = data.result.data
      }

    });
  }

  getDivisionCommentsHistory() {
    var divisionCommentsHistoryUrl = PlanApi.getDivisionCommentHistory;
    var divisionCommentsHistoryTableId = "division_comments";
    var reqParams = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }];

    if (!$.fn.dataTable.isDataTable('#division_comments')) {
      var dateCols = ['effectiveOn']
      this.dataTableService.jqueryDataTable(divisionCommentsHistoryTableId, divisionCommentsHistoryUrl, 'full_numbers', this.division_comments_plan_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParams, '', undefined, [0],'','',[1,2,3])
    }
    else {
      this.dataTableService.jqueryDataTableReload(divisionCommentsHistoryTableId, divisionCommentsHistoryUrl, reqParams)
    }
  }

  getProratingTypeHistory() {
    var prorating_type_url = PlanApi.getProratingTypeHistory;
    var ProratingTypeTableId = "prorating_type";
    var reqParamProHist = [{ 'key': 'plansKey', 'value': this.companyPlanKey }]
    if (!$.fn.dataTable.isDataTable('#prorating_type')) {
      var dateCols = ['effectiveOn', 'expiredOn']
      this.dataTableService.jqueryDataTable(ProratingTypeTableId, prorating_type_url, 'full_numbers', this.prorating_type_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined, dateCols)
    }
    else {
      this.dataTableService.jqueryDataTableReload(ProratingTypeTableId, prorating_type_url, reqParamProHist)
    }
  }

  getDeductableTypeHistory() {
    var deductable_type_url = PlanApi.getDeductibleTypeHistory;
    var DeductableTypeTableId = "deductable_type";
    var reqParamDeductHist = [{ 'key': 'plansKey', 'value': this.companyPlanKey }]
    if (!$.fn.dataTable.isDataTable('#deductable_type')) {
      this.dataTableService.jqueryDataTable(DeductableTypeTableId, deductable_type_url, 'full_numbers', this.deductable_type_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamDeductHist, '', undefined, [1,2],'','',[1,2])
    }
    else {
      this.dataTableService.jqueryDataTableReload(DeductableTypeTableId, deductable_type_url, reqParamDeductHist)
    }
  }

  getUnitCommentsHistory(rowData) {
    let copy = Object.assign({}, rowData);
    let unitKey = copy.unitKey;
    var unit_comments_url = PlanApi.getUnitCommentsHistory;
    var unitCommentsTableId = "unit_comments_history";
    var reqParamUnitCommentsHist = [{ 'key': 'unitKey', 'value': unitKey }]
    if (!$.fn.dataTable.isDataTable('#unit_comments_history')) {
      var dateCols = ['createdOn']
      this.dataTableService.jqueryDataTable(unitCommentsTableId, unit_comments_url, 'full_numbers', this.unit_comments_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamUnitCommentsHist, '', undefined, dateCols)
    }
    else {
      this.dataTableService.jqueryDataTableReload(unitCommentsTableId, unit_comments_url, reqParamUnitCommentsHist)
    }
  }

  setSuspendedValues() {
    this.resumeTrue = true;
    let requiredInfo = {
      "divSuspendHistKey": this.planDivisionSuspendId
    }
    this.hmsDataServiceService.postApi(PlanApi.planDivisionSuspendDetail, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.suspendedHistorytableData = data.result
        var suspDate = this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.suspendedOn)
        var resmDate = this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.resumedOn)

        this.suspendDisableDate = this.suspendedHistorytableData.suspendedOn;
        var currentDateCheck = this.changeDateFormatService.getToday();

        if (this.suspendedHistorytableData.resumedOn) {
          this.divisionSuspendedForm.setValue({
            suspendOn: this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.suspendedOn),
            resumeOn: this.changeDateFormatService.convertStringDateToObject(this.suspendedHistorytableData.resumedOn),
            suspendDivisionComment: this.suspendedHistorytableData.divSuspendHistCom,
          });
        } else {
          this.error = this.changeDateFormatService.compareTwoDates(currentDateCheck, suspDate.date);
          if (this.error.isError == false) {
            // GET THE MONTH AND YEAR OF THE SELECTED DATE.
            var month = suspDate.date.month;
            var year = suspDate.date.year;
            var newResumeDate = new Date(year, month, 1);
            var dateValue = this.changeDateFormatService.convertStringDateToObject(this.convert(newResumeDate));
            this.divisionSuspendedForm.patchValue({
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
            this.divisionSuspendedForm.patchValue({
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
    this.divisionSuspendedForm.controls['suspendOn'].disable();
  }

  updateResume() {
    if (this.divisionSuspendedForm.value.resumeOn) {
      let requiredInfo = {
        "divisionKey": this.companyDivisionKey,
        "divSuspendHistKey": this.planDivisionSuspendId,
        "resumedOn": this.changeDateFormatService.convertDateObjectToString(this.divisionSuspendedForm.value.resumeOn),
        "divSuspendHistCom": this.divisionSuspendedForm.value.suspendDivisionComment
      }
      var resumedDateString = this.changeDateFormatService.convertDateObjectToString(this.divisionSuspendedForm.value.resumeOn);
      var resumedDate = this.changeDateFormatService.isFutureDate(resumedDateString)
      var suspendDate = this.changeDateFormatService.isFutureDate(this.suspendDisableDate)
      this.hmsDataServiceService.postApi(PlanApi.resumeSuspendPlanDivision, requiredInfo).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && data.hmsShortMessage == "RECORD_UPDATED_SUCCESSFULLY") {
          this.toastr.success(this.translate.instant('company.plan.toaster.division_resumed'));
          this.suspendedHistorytableData = data.result
          var suspend_company_url = PlanApi.planDivisionSuspendList;
          var suspendTableID = "suspend_division";
          var reqParam = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }]
          this.dataTableService.jqueryDataTableReload(suspendTableID, suspend_company_url, reqParam);
          if (resumedDate) {
            if (suspendDate) {
              this.isDivisionSuspended = false
            } else {
              this.isDivisionSuspended = true
            }
          } else {
            this.isDivisionSuspended = false
          }
          this.divisionSuspendedForm.controls['suspendOn'].enable();
          this.divisionSuspendedForm.reset();
          this.resumeTrue = false
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == 'RESUME_DATE_SHOULD_BE_GREATER_NOW_DATE') {
          this.toastr.error(this.translate.instant('company.plan.toaster.resumeNotLessThanCurrent'));
        }


        error => {
        }
      })
    } else {
      this.toastr.error(this.translate.instant('company.toaster.fillResumeDate'));
    }
  }

  resetPlanSuspForm() {
    if (this.divisionSuspendedForm.invalid) {
      this.divisionSuspendedForm.reset(this.divisionSuspendedForm);
    }
    else {
      this.divisionSuspendedForm.value;
    }
  }

  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(() => {
    }, 100);
  }

  triggerPlanInfo() {
    for (let i = 0; i < this.arrDeductibleList.length; i++) {
      if (this.arrDeductibleList[i].deductTypeDesc == this.FormGroup.value.deductible_type) {
        this.deductibleTypeArray = this.arrDeductibleList[i]
      }
    }
    for (let i = 0; i < this.arrProratingList.length; i++) {
      if (this.arrProratingList[i].prorateTypeDesc == this.FormGroup.value.prorating_type) {
        this.proratingTypeArray = this.arrProratingList[i]
      }
    }
    if (this.deductibleTypeArray['deductTypeKey'] != undefined && this.selectedDeductibleType == this.deductibleTypeArray['deductTypeKey']) {
      this.deductTypeKey = this.deductibleTypeArray['deductTypeKey'];
    } else {
      this.deductTypeKey = null;
    }

    if (this.deductibleTypeArray['deductTypeDesc'] != undefined) {
      this.deductTypeDesc = this.deductibleTypeArray['deductTypeDesc'];
    }

    if (this.proratingTypeArray['prorateTypeKey'] != undefined) {
      this.prorateTypeKey = this.proratingTypeArray['prorateTypeKey'];
    }

    if (this.proratingTypeArray['prorateTypeDesc'] != undefined) {
      this.prorateTypeDesc = this.proratingTypeArray['prorateTypeDesc'];
    }

    if (this.yearTypeKey != undefined) {
      this.typeOfYear = this.yearTypeKey;
    }
    else if (this.selectedYearType != undefined) {
      this.typeOfYear = this.selectedYearType
    }
    else {
      this.typeOfYear = this.type_of_year
    }

    for (let i = 0; i < this.arrYearTypeList.length; i++) {
      if (this.arrYearTypeList[i].yrTypeKey == this.typeOfYear) {
        this.yearTypeArray = this.arrYearTypeList[i]
      }
    }
    this.yearTypeToSave.emit(this.typeOfYear);
    var planInfo = {
      "coKey": this.coKeyUrlId, //Cokey unique key from url
      "plansId": this.planNumber,
      "plansName": "Plan1",
      "plansSuspendInd": (this.FormGroup.value.suspended_plan == true) ? "T" : "F",
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.effective_date),
      "terminatedOn": "",
      "divisionId": this.FormGroup.value.division_num, //Unique key
      "divisionName": this.FormGroup.value.division_name,
      "divisionSuspendInd": "T",
      "divComtxt": this.FormGroup.value.division_comment,
      "yrTypeKey": this.typeOfYear,
      "deductTypeKey": this.selectedDeductibleType ? this.selectedDeductibleType : this.deductTypeKey,
      "divisionFamilyDeductAmt": this.FormGroup.value.family_debit_amount,
      "divisionSingleDeductAmt": this.FormGroup.value.single_debit_amount,
      "divisionDependAge1Num": this.FormGroup.value.dependent_age_1,
      "divisionDependAge2Num": this.FormGroup.value.dependent_age_2,
      "prorateTypeKey": this.selectedProratingType ? this.selectedProratingType : '',
      "noClaimsecureInTotalInd": (this.FormGroup.value.no_claim == true) ? "T" : "F",
      "plansExtraBenefitInd": (this.FormGroup.value.extra_benefits == true) ? "T" : "F",
      "proratingEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.effective_date_proratingType),
      "deductibleEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.effective_date_deductibleType),
      "proratingExpiredOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.expiry_date_proratingType),
      "deductibleExpiredOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.expiry_date_deductibleType),
      "effectiveOn_division": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.effective_date_division),
      "terminatedOn_division": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.terminate_date_division),
      "effectiveOn_divisionDetails": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.effective_date_divisionDetails),
      "expiredOn_divisionDetails": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.expiry_date_divisionDetails),
      'divisionMaxHistInd': this.divisionMaxHistInd,
      'feeGuideProvinceHist': this.feeGuideProvinceHist,
      'feeGuideScheduleHist': this.feeGuideScheduleHist,
      'dentalRuleHistInd': this.dentalRuleHistInd
    }

    var InfoData = planInfo;
    if (this.editMode) {
      InfoData['divisionSuspendHistInd'] = this.infoJsonEditModeData.divisionSuspendHistInd,
        InfoData['deductibleTypeHistInd'] = this.infoJsonEditModeData.deductibleTypeHistInd,
        InfoData['prorateHistInd'] = this.infoJsonEditModeData.prorateHistInd,
        InfoData['divisionCommentInd'] = this.infoJsonEditModeData.divisionCommentInd
      if (this.isDivisionSuspended == true) {
        InfoData["divisionSuspendInd"] = "T"
      } else {
        InfoData["divisionSuspendInd"] = "F"
      }
    } else {
      InfoData["divisionSuspendInd"] = "F"
    }

    InfoData['yearTypeData'] = this.yearTypeArray;
    InfoData['proratingTypeArray'] = this.proratingTypeArray;
    InfoData['deductibleTypeArray'] = this.deductibleTypeArray;
    InfoData['unitData'] = this.UnitList;
    this.planInfoData.emit(InfoData);
    this.planService.selectedDeductibleTypeVal.emit(this.FormGroup.value.deductible_type);
    this.planService.proratingTypeVal.emit(this.FormGroup.value.prorating_type);
  }

  canDeactivate() {
    if (!this.isUpdating && this.FormGroup.dirty) {
      this.isUpdating = false;
      confirm('Discard changes for Person?');
    }
    return true;
  }

  /**
   * Update the unit list on change count dropdown
   * @param number 
   */
  onPageChange(number: number) {
    this.tableItemsPerPage = number;
  }

  addDecimal(event, controlName) {
    if (event.target.value) {
      if (event.target.value.indexOf(".") == -1) {
        this.FormGroup.controls[controlName].patchValue(event.target.value + '.00');
      }
    }
  }

  // Log #1162: Travel Policy Section
  dataTableTravelPolicyInitialize(){
    var tableId = "travel_policy"
    var URL = CompanyApi.getDivTravelEligibilityUrl
    var reqParam = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }]
    var travelPolicyActions = [
      { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': this.translate.instant('common.edit'), 'showAction': '' }
    ]
    this.ObservableObj = Observable.interval(.1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('finance.transactionCode.code') == 'finance.transactionCode.code') {
        } else {
          this.travelPolicyColumns = [
            { title: this.translate.instant('company.plan.plan-info.effective-date'), data: 'effectiveOn' },
            { title: this.translate.instant('company.plan.plan-info.expiry-date'), data: 'expiredOn' },
            { title: this.translate.instant('common.action'), data: 'divTravelEligibilityKey' }
          ];
          var tableId = "travel_policy"
          if (!$.fn.dataTable.isDataTable('#travel_policy')) {
            this.dataTableService.jqueryDataTableForModal(tableId, URL, 'full_numbers', this.travelPolicyColumns, 5, true, true, 'lt', 'irp',
             undefined, [0, 'asc'], '', reqParam, travelPolicyActions, 2, [1], "AddTransactionCode", '', '', '', [1,2], '', [1,2], '', '', '', '', [0])
          }
          this.check = false
          this.ObservableObj.unsubscribe();
        }
      }
    });
  }

  getDivTravelEligibilityList() {
    this.FormGroup.controls.travelEffectiveDate.reset()
    this.FormGroup.controls.travelExpiryDate.reset()
    let requestData = {
      "divisionKey": this.companyDivisionKey
    }
    this.hmsDataServiceService.postApi(CompanyApi.getDivTravelEligibilityUrl, requestData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.divTravelEligibiltyList = data.result
        var dateCols = ['effectiveOn', 'expiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
        this.reloadTable('travel_policy')
      } else {
        this.divTravelEligibiltyList = []
      }
      error => {
      }
    })
  }

  reloadTable(tableID) {
    this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTriggerTravel, false)
  }

  ngAfterViewInit() {
    var self = this
    this.dtTriggerTravel.next();
  }

  submitTravelPolicy(FormGroup, tableId, mode) {
    this.FormGroup.controls.travelEffectiveDate.setValidators(Validators.required)
    this.FormGroup.controls.travelEffectiveDate.updateValueAndValidity()
    let requestData
      if (this.editPolicyTravel) {
        requestData = {
          "divisionKey": this.companyDivisionKey,
          "divTravelEligibilityKey": this.divTravelEligibilityKey,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.travelEffectiveDate),
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.travelExpiryDate)
        }
      } else {
        requestData = {
          "divisionKey": this.companyDivisionKey,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.travelEffectiveDate),
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.travelExpiryDate)
        }
      }
      if (this.FormGroup.controls.travelEffectiveDate.valid && this.FormGroup.controls.travelExpiryDate.valid) {
        this.hmsDataServiceService.postApi(CompanyApi.addUpdateDivTravelEligibilityUrl, requestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            if (data.hmsMessage.messageShort == "DIVISION_TRAVEL_ELIGIBILITY_ADDED_SUCCESSFULLY") {
              this.toastr.success(this.translate.instant('company.plan.toaster.policyDetailSavedSuccess'))
            } else if (data.hmsMessage.messageShort == "DIVISION_TRAVEL_ELIGIBILITY_UPDATED_SUCCESSFULLY") {
              this.toastr.success(this.translate.instant('company.plan.toaster.policyDetailUpdatedSuccess'))
            }
            this.divTravelEligibilityKey = ""
            this.getDivTravelEligibilityList()
            this.editPolicyTravel = false
            this.FormGroup.controls.policyNumber.reset()
            this.FormGroup.controls.travelEffectiveDate.reset()
            this.FormGroup.controls.travelExpiryDate.reset()
            this.FormGroup.controls.travelEffectiveDate.clearValidators()
            this.FormGroup.controls.travelEffectiveDate.updateValueAndValidity()
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == "Overlap records found in Division Travel Eligibility table for Plan-Div") {
            this.toastr.error("Overlap records found in Division Travel Eligibility table for "+this.planNo+" - "+this.divisionNo)
          } else if (data.code == 400 && data.hmsMessage.messageShort == "DIVISION_KEY_REQUIRED") {
            this.toastr.error("Division no. is required.")
          } else if (data.code == 400 && data.hmsMessage.messageShort == "Cannot change effective date.") {
            this.toastr.error("Cannot change effective date.")
          } else if (data.code == 400 && data.hmsMessage.messageShort == "Cannot change expiry date.") {
            this.toastr.error("Cannot change expiry date.")
          } else if (data.code == 400 && data.hmsMessage.messageShort == "Cannot change policy no.") {
            this.toastr.error("Cannot change policy no.")
          } else if (data.code == 500 && data.hmsMessage.messageShort == "SOMETHING_WENT_WRONG") {
            this.toastr.error("Something went wrong!")
          } else {
            this.toastr.error(this.translate.instant('company.plan.toaster.policyDetailNotSaved'))
          }
        })
      } else {
        this.FormGroup.controls.travelEffectiveDate.markAsTouched({ onlySelf: true })
      }
  }

  // #1124: New Feedback Edit functionality
  getTravelPolicyData(dataRow) {
    this.editPolicyTravel = true
    this.divTravelEligibilityKey = dataRow.divTravelEligibilityKey
    dataRow.divisionKey
      this.FormGroup.patchValue({
        'travelEffectiveDate': this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn),
        'travelExpiryDate': this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn)
      })       
      this.travelPolEffectiveDate = dataRow.effectiveOn
      this.travelPolExpiredDate = dataRow.expiredOn
  }

  deleteTravelPolicy(dataRow) {
    let divTravelEligibilityKey = dataRow.divTravelEligibilityKey
    this.exDialog.openConfirm(this.translate.instant('company.plan.toaster.deleteConfirmation')).subscribe((value) => {
      if (value) {
        this.hmsDataServiceService.deleteApi(CompanyApi.deleteDivTravelEligibilityUrl + '/' + divTravelEligibilityKey).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastr.success(this.translate.instant('company.plan.toaster.travelDeleteuccess'))
            this.getDivTravelEligibilityList();
          } else {
            this.toastr.error('ompany.plan.toaster.travelNotDeleted')
          }
        })
      }
    });
  }

  onFlexAccountCheckboxChange(): void {
    if (this.FormGroup.get('flex_account').value) {
      // Apply validators
      this.FormGroup.controls['default_wsa'].setValidators([Validators.required,CustomValidators.onlyNumbers,CustomValidators.percValue]);
      this.FormGroup.controls['upper_wsa'].setValidators([Validators.required,CustomValidators.onlyNumbers,CustomValidators.percValue]);
      this.FormGroup.controls['lower_wsa'].setValidators([Validators.required,CustomValidators.onlyNumbers,CustomValidators.percValue]);
  
      // Ensure validators are applied and values are updated
      this.FormGroup.controls['default_wsa'].updateValueAndValidity();
      this.FormGroup.controls['upper_wsa'].updateValueAndValidity();
      this.FormGroup.controls['lower_wsa'].updateValueAndValidity();
  
    } else {
      // Clear validators and reset controls
      this.FormGroup.controls['default_wsa'].clearValidators();
      this.FormGroup.controls['default_wsa'].updateValueAndValidity();
      this.FormGroup.controls['default_wsa'].reset()

      console.log(this.FormGroup.controls['default_wsa'].valid);
  
      this.FormGroup.controls['upper_wsa'].clearValidators();
      this.FormGroup.controls['upper_wsa'].updateValueAndValidity();
      this.FormGroup.controls['upper_wsa'].reset()
  
      this.FormGroup.controls['lower_wsa'].clearValidators();
      this.FormGroup.controls['lower_wsa'].updateValueAndValidity();
      this.FormGroup.controls['lower_wsa'].reset()
  }
}

}