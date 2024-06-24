import { Component, OnInit, Output, EventEmitter, ViewChild, Injector, Input, Type, ElementRef } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { PlanApi } from '../plan-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { TreeTableComponent } from '../../tree-table/tree-table.component';
import { GenericTableComponent, GtConfig, GtOptions, GtRow, GtEvent, GtCustomComponent } from '@angular-generic-table/core';

import { ToastrService } from 'ngx-toastr';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from './treenode';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HttpClient } from '@angular/common/http';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { Observable } from 'rxjs/Observable';
import { PlanService } from '../plan.service';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { collectExternalReferences } from '@angular/compiler';

// Generic Table Interface Start
export interface RowData extends GtRow {
  checkbox?: string;
  covCatKey: number;
  covCoverageTimeFrameKey: any;
  adult: any;
  coverageTimeFrameKey: any;
  adultLab: any;
  dept: any;
  depTimeFrame: any;
  deptLab: any;
  payLab?: any;
  payClaim?: any;
  effectiveOn?: any;
  expiredOn?: any;
  checked?: boolean;
  ischecked: boolean;
  editMode: boolean;
  addPlanMode: any;
  coverageCategoryHist: any;
  isCovCatExpired: any;
}
// Generic Table Interface End

/* Effective Date Component Start */
@Component({
  template: `
  <div *ngIf="row.editMode;" class="calender-field" [ngClass]="disableEffectivDate">
    <my-date-picker
    id="{{ids}}" 
    name="effectiveOn"
    [options]="myDatePickerOptions"
    [placeholder]="myDatePickerPlaceholder"
    [selDate]="dateNameArray[ids]"
    (inputFocusBlur)="changeDateFormat($event, ids, true)">
    </my-date-picker>
  </div>
                  
  <div *ngIf="!row.editMode" class="calender-field">
  {{row.effectiveOn | dateFormate }}
  </div>
  `,
  providers: [ChangeDateFormatService, ChangeDateFormatService, HmsDataServiceService, ExDialog, ToastrService],
})

export class EffectiveDateComponent extends GtCustomComponent<RowData> implements OnInit {

  disableEffectivDate: string;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerPlaceholder = "dd/mmm/yyyy";
  dateNameArray = {};
  ids;
  planEffectiveDate;


  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private completerService: CompleterService,
    private planService: PlanService
  ) {
    super();
  }

  ngOnInit() {
    this.planService.benefitCovCatInlineEffectiveDate;
    this.ids = "effectiveDate_" + this.row.$$gtRowId;
    if (this.row.effectiveOn) {
      this.setDatePickerValue(this.ids, this.row.effectiveOn);
    } else {
    }
    if (this.row.isCovCatExpired == 'T') {
      this.disableEffectivDate = 'disableInput'
    }
    
  }
 
  /**
   * 
   * @param event 
   * @param frmControlName 
   * @param currentDate 
   */
  changeDateFormat(event, frmControlName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.convertStringDateToObject(this.planService.benefitCovCatInlineEffectiveDate);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
    } else if (event.reason == 1 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
    } else if (event.reason == 1 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
    }
    if (event.reason == 2) {
      if (obj == null) {
        return false;
      }
      this.dateNameArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
    }

  }

  /**
   * Set Date Fiels value on blur the date input
   * @param frmControlName 
   * @param dateString 
   */
  setDatePickerValue(frmControlName, dateString) {
    var obj = this.changeDateFormatService.convertStringDateToObject(dateString);
    this.dateNameArray[frmControlName] = {
      year: obj.date.year,
      month: obj.date.month,
      day: obj.date.day
    };
  }
}
/* Effective Date Component Ends */

/* Expired Date Component Start */
@Component({
  template: `
  <div *ngIf="row.editMode;" class="calender-field">
    <my-date-picker
    id="{{ids}}" 
    name="expiredOn"
    [options]="myDatePickerOptions"
    [placeholder]="myDatePickerPlaceholder"
    [selDate]="dateNameArray[ids]"
    [ngClass]="expired  ? 'expired tableExpire' : 'notExpired tableExpire'"
    (inputFocusBlur)="changeDateFormat($event, ids)">
    </my-date-picker>
  </div>
  
  <div class="calender-field" *ngIf="!row.editMode">
  {{row.expiredOn | dateFormate }}
  </div>
  `,
  providers: [ChangeDateFormatService],
})

export class ExpiredDateComponent extends GtCustomComponent<RowData> implements OnInit {
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerPlaceholder = "dd/mmm/yyyy";
  dateNameArray = {};
  ids;
  expired: boolean;
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
  ) {
    super();
  }

  ngOnInit() {
    this.ids = "expiredDate_" + this.row.$$gtRowId;
    if (this.row.expiredOn) {
      this.setDatePickerValue(this.ids, this.row.expiredOn);
    }
    var self = this
  }

  /**
   * 
   * @param event 
   * @param frmControlName 
   * @param currentDate 
   */
  changeDateFormat(event, frmControlName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.getToday();
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
    }

    if (event.reason == 2) {
      if (obj == null) {
        return false;
      }
      this.dateNameArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  /**
   * Set Date Fiels value on blur the date input
   * @param frmControlName 
   * @param dateString 
   */
  setDatePickerValue(frmControlName, dateString) {
    var obj = this.changeDateFormatService.convertStringDateToObject(dateString);
    this.dateNameArray[frmControlName] = {
      year: obj.date.year,
      month: obj.date.month,
      day: obj.date.day
    };
  }

}
/* Effective Date Component Ends */

/* Benefits Component Start */
@Component({
  selector: 'app-benefits',
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.css'],
  providers: [ChangeDateFormatService, HmsDataServiceService, DatatableService, ExDialog, ChangeDateFormatService],
  entryComponents: [EffectiveDateComponent, ExpiredDateComponent]
})

export class BenefitsComponent implements OnInit {
  @Input() FormGroup: FormGroup; //Intitialize form 

  benefitsFormDataVal = {

    'dentalcarryForwardYear': new FormControl(''),
    'benefitKey': new FormControl(''),

    'dentaleffectiveOn': new FormControl(''),
    'dentalexpiredOn': new FormControl(''),
    'visioncarryForwardYear': new FormControl(''),
    'visionbenefitKey': new FormControl(''),

    'visioneffectiveOn': new FormControl(''),
    'visionexpiredOn': new FormControl(''),
    'healthcarryForwardYear': new FormControl(''),
    'healthbenefitKey': new FormControl(''),

    'healtheffectiveOn': new FormControl(''),
    'healthexpiredOn': new FormControl(''),
    'supplementalcarryForwardYear': new FormControl('', [Validators.min(1), Validators.max(2)]),
    'supplementalbenefitKey': new FormControl(''),

    'supplementaleffectiveOn': new FormControl(''),
    'supplementalexpiredOn': new FormControl(''),
    'wellnesscarryForwardYear': new FormControl('', [Validators.min(1), Validators.max(2)]),
    'wellnessbenefitKey': new FormControl(''),

    'wellnesseffectiveOn': new FormControl(''),
    'wellnessexpiredOn': new FormControl(''),
  };

  enableCovCatForCopyDivision: boolean = false;
  showCombineMaxHistoryIcon: boolean = false;
  showCombineMaxWellnessHistoryIcon: boolean = false;
  benefitKey
  wellnessBenefitKey;
  dentalCovKey;
  visionCovKey;
  drugCovKey;
  healthCovKey;

  supplementCovKey;
  wellnessCovKey;
  showCovMaxHistoryIcon: boolean = false;
  showExpiryDate: boolean = true;
  showEffectiveDate: boolean = true;
  showCovCatHistory: boolean = false;
  showEditButton: boolean = false;
  planEffectiveDate: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerPlaceholder = "dd/mmm/yyyy";
  hideCategoryEditButton: boolean = false;
  showLoader: boolean = false;
  companyBusinessTypeName: any;
  companyId: any;
  @ViewChild("focusAddCombineMaxEl") trgFocusAddCombineMaxEl: ElementRef;
  @ViewChild("focusEditCombineMaxEl") trgFocusEditCombineMaxEl: ElementRef;
  @ViewChild("focusAddCoverageMaxEl") trgFocusAddCoverageMaxEl: ElementRef;
  @ViewChild("focusEditCoverageMaxEl") trgFocusEditCoverageMaxEl: ElementRef;
  hideGoToPage: boolean = true;
  showBenefitLoader = false;
  businessType: string;
  arrData: TreeNode[];
  arrDataDental: TreeNode[];
  arrDataVision: TreeNode[];
  arrDataHealth: TreeNode[];
  arrDataDrug: TreeNode[];
  arrDataSupplement: TreeNode[];
  arrDataWellness: TreeNode[];
  selectedNode = [];

  selectedDentalNode = [];
  selectedDentalArray = []
  selectedVisionNode = [];
  selectedHealthNode = [];
  selectedDrugNode = [];
  selectedSupplementNode = [];
  selectedWellnessNode = [];

  selectedBenefitsList = [];
  timeFrameList: any;
  wellnessServiceList = [];
  supplementServiceList = [];
  drugServiceList = [];
  healthServiceList = [];
  visionServiceList = [];
  dentalServiceList = [];
  wellnessCoverageCategoryList = [];
  supplementCoverageCategoryList = [];
  drugCoverageCategoryList = [];
  currentBenefitId: number;
  categoryApiUrl: string;
  activeBenefit: string;
  dentalCoverageCategoryList = [];
  visionCoverageCategoryList = [];
  healthCoverageCategoryList = [];
  serviceLayerArray: any;
  serviceLayerBoolean: boolean = true;
  serviceLayerDentalBoolean: boolean = true;
  serviceLayerVisionBoolean: boolean = true;
  serviceLayerHealthBoolean: boolean = true;
  serviceLayerDrugBoolean: boolean = true;
  serviceLayerSupplementBoolean: boolean = true;
  serviceLayerWellnessBoolean: boolean = true;


  benefitsList: any;
  dental = false;
  vision = false;
  health = false;
  drug = false;
  supplement = false;
  wellness = false;
  benefitObj: any = {};
  checkBoxValue: boolean;
  showBenefitTabs: boolean = false;
  servicesDataArray: any;
  servicesDataArrayDental: any;
  servicesDataArrayVision: any;
  servicesDataArrayHealth: any;
  servicesDataArrayDrug: any;
  servicesDataArraySupplement: any;
  servicesDataArrayWellness: any;
  dateNameArray = {};

  //Start Generic Table Variables
  public data: Array<RowData> = [];
  public configObject: GtConfig<RowData>;
  public inlineEditState = true;
  public $inlineEdit: ReplaySubject<boolean> = new ReplaySubject(1);

  @ViewChild(GenericTableComponent)
  public myTable: GenericTableComponent<any, any>;
  public options: GtOptions = {
    rowSelection: false,
  };

  // End Generic Table Variables

  /************ Start Dental Combine Max Variables *****************/
  public DentalCombineMaxAddMode = false;
  public DentalCombineMaxEditMode = false;
  public selectedCombineMax = {};
  public DentalCombineMaxList = [];
  public MaximumTypeList = [];
  public MaximumPeriodTypeList = [];
  public HSAMaximumTypeList = [];
  public HSAMaximumPeriodTypeList = [];
  public CombineMaximumTypeList = [];

  /** For New Row */
  dental_new_combine_maximum_amount: FormControl;
  dental_new_combine_maximum_type: FormControl;
  dental_new_combine_maximum_period_type: FormControl;
  dental_new_combine_combine_maximum_type: FormControl;
  dental_new_combine_maximum_effective_date: FormControl;
  dental_new_combine_maximum_expiry_date: FormControl;

  /** For Update Row */
  dental_old_combine_maximum_benDentCovCatMaxKey: FormControl;
  dental_old_combine_maximum_amount: FormControl;
  dental_old_combine_maximum_type: FormControl;
  dental_old_combine_maximum_period_type: FormControl;
  dental_old_combine_combine_maximum_type: FormControl;
  dental_old_combine_maximum_effective_date: FormControl;
  dental_old_combine_maximum_expiry_date: FormControl;

  /************ End Dental Combine Max Variables *****************/

  /************ Start Wellness Combine Max Variables *****************/
  public WellnessCombineMaxAddMode = false;
  public WellnessCombineMaxEditMode = false;
  public selectedCombineMaxWellness = {};
  public WellnessCombineMaxList = [];

  /** For New Row */
  wellness_new_combine_maximum_expiry_date: FormControl;
  wellness_new_combine_maximum_effective_date: FormControl;
  wellness_new_combine_combine_maximum_type: FormControl;
  wellness_new_combine_maximum_period_type: FormControl;
  wellness_new_combine_maximum_type: FormControl;
  wellness_new_combine_maximum_amount: FormControl;

  /** For Update Row */
  wellness_old_combine_maximum_expiry_date: FormControl;
  wellness_old_combine_maximum_effective_date: FormControl;
  wellness_old_combine_combine_maximum_type: FormControl;
  wellness_old_combine_maximum_period_type: FormControl;
  wellness_old_combine_maximum_type: FormControl;
  wellness_old_combine_maximum_amount: FormControl;
  wellness_old_combine_maximum_benWellnessCovCatMaxKey: FormControl;

  /************ End Wellness Combine Max Variables *****************/

  /************ Start Dental Coverage Max Variables *****************/
  public DentalCoverageMaxAddMode = false;
  public DentalCoverageMaxEditMode = false;
  public selectedCoverageMax = {}; /** For selected record object */
  public DentalCoverageMaxList = [];
  /** For New Row */
  dental_new_coverage_maximum_amount: FormControl;
  dental_new_coverage_maximum_type: FormControl;
  dental_new_coverage_maximum_period_type: FormControl;
  dental_new_coverage_maximum_effective_date: FormControl;
  dental_new_coverage_maximum_expiry_date: FormControl;

  /** For Update Row */
  dental_old_covMaxKey: FormControl;
  dental_old_coverage_maximum_amount: FormControl;
  dental_old_coverage_maximum_type: FormControl;
  dental_old_coverage_maximum_period_type: FormControl;
  dental_old_coverage_maximum_effective_date: FormControl;
  dental_old_coverage_maximum_expiry_date: FormControl;

  /************ End Dental Coverage Max Variables *****************/

  /************ Start Vision Coverage Max Variables *****************/
  public VisionCoverageMaxAddMode = false;
  public VisionCoverageMaxEditMode = false;
  public selectedVCoverageMax = {}; 
  public VisionCoverageMaxList = [];
   /************ End Vision Coverage Max Variables *****************/

   /************ Start Health Coverage Max Variables *****************/
  public HealthCoverageMaxAddMode = false;
  public HealthCoverageMaxEditMode = false;
  public selectedHCoverageMax = {}; 
  public HealthCoverageMaxList = [];
   /************ End Health Coverage Max Variables *****************/

  /************ Start Wellness Coverage Max Variables *****************/
  public WellnessCoverageMaxAddMode = false;
  public WellnessCoverageMaxEditMode = false;
  public selectedWellnessCoverageMax = {}; /** For selected record object */
  public WellnessCoverageMaxList = [];

  /** For New Row */
  wellness_new_coverage_maximum_expiry_date: FormControl;
  wellness_new_coverage_maximum_effective_date: FormControl;
  wellness_new_coverage_maximum_period_type: FormControl;
  wellness_new_coverage_maximum_type: FormControl;
  wellness_new_coverage_maximum_amount: FormControl;

  /** For Update Row */
  wellness_old_coverage_maximum_expiry_date: FormControl;
  wellness_old_coverage_maximum_period_type: FormControl;
  wellness_old_coverage_maximum_effective_date: FormControl;
  wellness_old_coverage_maximum_type: FormControl;
  wellness_old_covMaxKey: FormControl;
  wellness_old_coverage_maximum_amount: FormControl;

  /************ End Wellness Coverage Max Variables *****************/

  /************ Start Supplement Coverage Max Variables *****************/
  public SupplementalCoverageMaxAddMode = false;
  public SupplementalCoverageMaxEditMode = false;
  public selectedSupplementalCoverageMax = {}; /** For selected record object */
  public SupplementalCoverageMaxList = [];
  /** For New Row */
  supplemental_new_coverage_maximum_amount: FormControl;
  supplemental_new_coverage_maximum_type: FormControl;
  supplemental_new_coverage_maximum_period_type: FormControl;
  supplemental_new_coverage_carry_frw_year: FormControl;

  supplemental_new_coverage_maximum_effective_date: FormControl;
  supplemental_new_coverage_maximum_expiry_date: FormControl;

  /** For Update Row */
  supplemental_old_covMaxKey: FormControl;
  supplemental_old_benefitCarryFrwdKey: FormControl;
  supplemental_old_coverage_maximum_amount: FormControl;
  supplemental_old_coverage_maximum_type: FormControl;
  supplemental_old_coverage_maximum_period_type: FormControl;
  supplemental_old_coverage_maximum_effective_date: FormControl;
  supplemental_old_coverage_maximum_expiry_date: FormControl;
  /************ End Dental Coverage Max Variables *****************/

  /************ Start Wellness Coverage Max Variables *****************/
  public wellnessCoverageMaxList = [];
  /************ End Wellness Coverage Max Variables *****************/

  getBenefitDataFromDB: any;
  dentalCovrageCategoryID = 0;
  @Output() benefitsData = new EventEmitter();
  editModeBenefit = true;
  addPlanMode: boolean = true;
  editPlanMode: boolean = false;
  terminateBenefitCategoryForm: FormGroup;
  selectedCategoryObjDental: any;
  selectedCategoryObjVision: any;
  selectedCategoryObjHealth: any;
  selectedCategoryObjDrug: any;
  selectedCategoryObjSupplement: any;
  selectedCategoryObjWellness: any;

  combine_maximum_columns = [
    { title: "Amount", data: 'maximumAmt' },
    { title: "Type", data: 'maximumTypeDesc' },
    { title: "Peroid Type", data: 'maximumPeriodTypeDesc' },
    { title: "Combine Maximum Type", data: 'combineMaximunTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' }
  ]

  coverage_category_columns = [
    { title: "Amount", data: 'maximumAmt' },
    { title: "Type", data: 'maximumTypeDesc' },
    { title: "Peroid Type", data: 'maximumPeriodTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' }
  ]

  public maximumTypeData: CompleterData;
  public maximumPeriodTypeData: CompleterData;
  public supplementMaximumTypeData: CompleterData;
  public supplementMaximumPeriodTypeData: CompleterData;
  public supplementCarryFwdyears: CompleterData;


  public dentalCombineMaxTypeData: CompleterData;
  public wellnessCombineMaxTypeData: CompleterData;
  selectedMaximumTypeKey: any;
  selectedMaximumTypeDesc: any;
  maximumTypeKeyRowData: any;
  maximumTypeDescRowData: any;
  selectedMaximumPeriodTypeKey: any;
  selectedMaximumPeriodTypeDesc: any;
  maximumPeriodTypeKeyRowData: any;
  maximumPeriodTypeDescRowData: any;
  selectedDentalCombineMaxTypeKey: any;
  selectedDentalCombineMaxTypeDesc: any;
  selectedWellnessCombineMaxTypeKey: any = "26";
  selectedWellnessCombineMaxTypeDesc: any;
  combineMaximumTypeKeyRowData: any;
  combineMaximumTypeDescRowData: any;
  selectedHsaMaximumTypeKey: any;
  selectedHsaMaximumTypeDesc: any;
  selectedHsaMaximumPeriodTypeKey: any;
  selectedCarryFrwdYear: any;

  selectedHsaMaximumPeriodTypeDesc: any;
  expired: boolean;
  dentalCarryForwardFlag: boolean = false;
  visionCarryForwardFlag: boolean = false;
  healthCarryForwardFlag: boolean = false;
  supplementCarryForwardFlag: boolean = false;
  wellnessSCarryForwardFlag: boolean = false;
  editMode: boolean;
  showcarryerror: boolean = false;
  dentalShowcarryerror: boolean = false;
  healthShowcarryerror: boolean = false;
  visionShowcarryerror: boolean = false;
  dentalArray = [];
  dentalLoder: boolean = false;
  visionLoder: boolean = false;
  healthLoder: boolean = false;
  supplementLoder: boolean = false;
  drugLoder: boolean = false;
  wellnessLoder: boolean = false;

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private toastr: ToastrService,
    private exDialog: ExDialog,
    private planService: PlanService,
    private router: Router,
    private route: ActivatedRoute,
    private completerService: CompleterService,
    private changeDateFormatService: ChangeDateFormatService
  ) {

    this.serviceLayerArray = { "data": [] };
    this.$inlineEdit.next(this.inlineEditState);
    /** Dental Combine Max Inline Data table new row start  */
    // Changed custom validation to correct scenario of showing "numbers only" validation
    this.dental_new_combine_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.numbersOnlyValidator]);
    this.dental_new_combine_maximum_type = new FormControl(null, [Validators.required]);
    this.dental_new_combine_maximum_period_type = new FormControl(null, [Validators.required]);
    this.dental_new_combine_combine_maximum_type = new FormControl(null, [Validators.required]);
    this.dental_new_combine_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.dental_new_combine_maximum_expiry_date = new FormControl('', []);

    /** Dental Combine Max Inline Data table update row  */
    this.dental_old_combine_maximum_benDentCovCatMaxKey = new FormControl('', []);
    // Changed custom validation to correct scenario of showing "numbers only" validation
    this.dental_old_combine_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.numbersOnlyValidator]);
    this.dental_old_combine_maximum_type = new FormControl(null, [Validators.required]);
    this.dental_old_combine_maximum_period_type = new FormControl(null, [Validators.required]);
    this.dental_old_combine_combine_maximum_type = new FormControl(null, [Validators.required]);
    this.dental_old_combine_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.dental_old_combine_maximum_expiry_date = new FormControl('', []);

    /** Dental Coverage AMx Inline Data table new row  */
    // Changed custom validation to correct scenario of showing "numbers only" validation
    this.dental_new_coverage_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.numbersOnlyValidator]);
    this.dental_new_coverage_maximum_type = new FormControl(null, [Validators.required]);
    this.dental_new_coverage_maximum_period_type = new FormControl(null, [Validators.required]);
    this.dental_new_coverage_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.dental_new_coverage_maximum_expiry_date = new FormControl('', []);

    /** Dental Coverage Inline Data table update row  */
    this.dental_old_covMaxKey = new FormControl('', []);
        // Changed custom validation to correct scenario of showing "numbers only" validation
    this.dental_old_coverage_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.numbersOnlyValidator]);
    this.dental_old_coverage_maximum_type = new FormControl('', [Validators.required]);
    this.dental_old_coverage_maximum_period_type = new FormControl('', [Validators.required]);
    this.dental_old_coverage_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.dental_old_coverage_maximum_expiry_date = new FormControl('', []);
    /** Dental Coverage  Inline Data table End  */

    /** Supplement Coverage AMx Inline Data table new row  */
        // Changed custom validation to correct scenario of showing "numbers only" validation
    this.supplemental_new_coverage_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.numbersOnlyValidator]);
    this.supplemental_new_coverage_maximum_type = new FormControl(null, [Validators.required]);
    this.supplemental_new_coverage_maximum_period_type = new FormControl(null, [Validators.required]);
    this.supplemental_new_coverage_carry_frw_year = new FormControl(null, [CustomValidators.CarryForwardYears]);
    this.supplemental_new_coverage_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.supplemental_new_coverage_maximum_expiry_date = new FormControl('', []);

    /** Supplement Coverage Inline Data table update row  */
    this.supplemental_old_covMaxKey = new FormControl('', []);
    this.supplemental_old_benefitCarryFrwdKey = new FormControl('', []);

        // Changed custom validation to correct scenario of showing "numbers only" validation
    this.supplemental_old_coverage_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.numbersOnlyValidator]);
    this.supplemental_old_coverage_maximum_type = new FormControl('', [Validators.required]);
    this.supplemental_old_coverage_maximum_period_type = new FormControl('', [Validators.required]);
    this.supplemental_old_coverage_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.supplemental_old_coverage_maximum_expiry_date = new FormControl('', []);
    /** Supplement Inline Data table End */

    /** Wellness Combine Max Inline Data table new row start  */
        // Changed custom validation to correct scenario of showing "numbers only" validation
    this.wellness_new_combine_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.numbersOnlyValidator]);
    this.wellness_new_combine_maximum_type = new FormControl(null, [Validators.required]);
    this.wellness_new_combine_maximum_period_type = new FormControl(null, [Validators.required]);
    this.wellness_new_combine_combine_maximum_type = new FormControl(null);
    this.wellness_new_combine_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.wellness_new_combine_maximum_expiry_date = new FormControl('', []);

    /** Wellness Combine Max Inline Data table update row  */
    this.wellness_old_combine_maximum_benWellnessCovCatMaxKey = new FormControl('', []);
        // Changed custom validation to correct scenario of showing "numbers only" validation
    this.wellness_old_combine_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.numbersOnlyValidator]);
    this.wellness_old_combine_maximum_type = new FormControl(null, [Validators.required]);
    this.wellness_old_combine_maximum_period_type = new FormControl(null, [Validators.required]);
    this.wellness_old_combine_combine_maximum_type = new FormControl(null, [Validators.required]);
    this.wellness_old_combine_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.wellness_old_combine_maximum_expiry_date = new FormControl('', []);

    /** Wellness Coverage Max Inline Data table new row  */
    this.wellness_new_coverage_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.number]);
    this.wellness_new_coverage_maximum_type = new FormControl(null, [Validators.required]);
    this.wellness_new_coverage_maximum_period_type = new FormControl(null, [Validators.required]);
    this.wellness_new_coverage_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.wellness_new_coverage_maximum_expiry_date = new FormControl('', []);

    /** Wellness Coverage Inline Data table update row  */
    this.wellness_old_covMaxKey = new FormControl('', []);
    this.wellness_old_coverage_maximum_amount = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.number]);
    this.wellness_old_coverage_maximum_type = new FormControl('', [Validators.required]);
    this.wellness_old_coverage_maximum_period_type = new FormControl('', [Validators.required]);
    this.wellness_old_coverage_maximum_effective_date = new FormControl(null, [Validators.required]);
    this.wellness_old_coverage_maximum_expiry_date = new FormControl('', []);
    /** Wellness Coverage  Inline Data table End  */

    this.planService.planModuleData.subscribe((value) => {
      this.getBenefitDataFromDB = value;
      this.planService.benefitCovCatInlineEffectiveDate = value.planInfoJson[0].effectiveOn;
      this.planEffectiveDate = value.planInfoJson[0].effectiveOn;
      if (value.benefitsJson[0].dentalSlug && Object.keys(value.benefitsJson[0].dentalSlug).length > 0 && value.benefitsJson[0].dentalSlug.benefitKey != null) {
        Object.assign(this.benefitObj, { "dentalSlug": value.benefitsJson[0].dentalSlug });
        if (this.editModeBenefit && this.editPlanMode) {
          if (this.benefitObj.dentalSlug.combineMaxHistInd == 'Y') {
            this.showCombineMaxHistoryIcon = true;
          }
          this.benefitKey = this.benefitObj.dentalSlug.benefitKey;
          this.getEditServiceList(this.benefitObj.dentalSlug.disciplineKey, this.benefitObj.dentalSlug.coverageCategory, "dentalSlug");
        }
      }
      if (value.benefitsJson[0].visionSlug && Object.keys(value.benefitsJson[0].visionSlug).length > 0 && value.benefitsJson[0].visionSlug.benefitKey != null) {
        Object.assign(this.benefitObj, { "visionSlug": value.benefitsJson[0].visionSlug });
        if (this.editModeBenefit && this.editPlanMode) {
          this.getEditServiceList(this.benefitObj.visionSlug.disciplineKey, this.benefitObj.visionSlug.coverageCategory, "visionSlug");
        }
      }
      if (value.benefitsJson[0].healthSlug && Object.keys(value.benefitsJson[0].healthSlug).length > 0 && value.benefitsJson[0].healthSlug.benefitKey != null) {
        Object.assign(this.benefitObj, { "healthSlug": value.benefitsJson[0].healthSlug });
        if (this.editModeBenefit && this.editPlanMode) {
          this.getEditServiceList(this.benefitObj.healthSlug.disciplineKey, this.benefitObj.healthSlug.coverageCategory, "healthSlug");
        }
      }
      if (value.benefitsJson[0].drugSlug && Object.keys(value.benefitsJson[0].drugSlug).length > 0 && value.benefitsJson[0].drugSlug.benefitKey != null) {
        Object.assign(this.benefitObj, { "drugSlug": value.benefitsJson[0].drugSlug });
        if (this.editModeBenefit && this.editPlanMode) {
          this.getEditServiceList(this.benefitObj.drugSlug.disciplineKey, this.benefitObj.drugSlug.coverageCategory, "drugSlug");
        }
      }
      if (value.benefitsJson[0].supplementSlug && Object.keys(value.benefitsJson[0].supplementSlug).length > 0 && value.benefitsJson[0].supplementSlug.benefitKey != null) {
        Object.assign(this.benefitObj, { "supplementSlug": value.benefitsJson[0].supplementSlug });
        if (this.editModeBenefit && this.editPlanMode) {
          this.getEditServiceList(this.benefitObj.supplementSlug.disciplineKey, this.benefitObj.supplementSlug.coverageCategory, "supplementSlug");
        }
      }
      if (value.benefitsJson[0].wellnessSlug && Object.keys(value.benefitsJson[0].wellnessSlug).length > 0 && value.benefitsJson[0].wellnessSlug.benefitKey != null) {
        Object.assign(this.benefitObj, { "wellnessSlug": value.benefitsJson[0].wellnessSlug });
        if (this.editModeBenefit && this.editPlanMode) {
          if (this.benefitObj.wellnessSlug.combineMaxHistInd == 'Y') {
            this.showCombineMaxWellnessHistoryIcon = true;
          }
          this.wellnessBenefitKey = this.benefitObj.wellnessSlug.benefitKey;
          this.getEditServiceList(this.benefitObj.wellnessSlug.disciplineKey, this.benefitObj.wellnessSlug.coverageCategory, "wellnessSlug");
        }
      }
    });
  }

  planJsonObject;
  jsonObject;

  ngOnInit() {
    this.businessType = this.hmsDataServiceService.getUserType();
    this.route.queryParams.subscribe((params: Params) => {
      this.companyId = params['companyId'];
      if (params['planType'] == 'editPlan') {
        this.addPlanMode = false;
        this.editPlanMode = true;
        this.showLoader = true;
      }
      if (params['planType'] == 'copyDivision') {
        this.enableCovCatForCopyDivision = true;
        this.showLoader = true;
      }
    })
    this.getBenefits().then(res => {
    });


    this.getMaximumTypeList();
    this.getMaximumPeriodTypeList();
    this.getSupplementMaximumTypeList();
    this.getSupplementMaximumPeriodTypeList();
    this.getCombineMaximumTypeList();
    this.getAllDentalCoverageMaxList();
    this.getTimeFrameList();
   
    this.configObject = {
      settings: [],
      fields: [],
      data: []
    };
    // save suspend Save
    var self = this
    this.terminateBenefitCategoryForm = new FormGroup({
      'effectiveDate': new FormControl('', [Validators.required]),
      'expiryDate': new FormControl('', [Validators.required]),
    });

    // issue number 731 start
    this.planService.planCarryForwardData.subscribe((value) => {

      for (var jsonData in value) {
        if (jsonData === 'dentalSlug' && value[jsonData] != undefined && value[jsonData].benefitCarryFwd != undefined) {
          if (value[jsonData].benefitCarryFwd.length > 0) {
            if (value[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
              this.dentalCarryForwardFlag = true;

            }
          }

        }

        if (jsonData === 'visionSlug' && value[jsonData] != undefined && value[jsonData].benefitCarryFwd != undefined) {
          if (value[jsonData].benefitCarryFwd.length > 0) {
            if (value[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
              this.visionCarryForwardFlag = true;
            }
          }
        }

        if (jsonData === 'healthSlug' && value[jsonData] != undefined && value[jsonData].benefitCarryFwd != undefined) {
          if (value[jsonData].benefitCarryFwd.length > 0) {
            if (value[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
              this.healthCarryForwardFlag = true;
            }
          }
        }

        if (jsonData === 'supplementSlug' && value[jsonData] != undefined && value[jsonData].benefitCarryFwd != undefined) {
          if (value[jsonData].benefitCarryFwd.length > 0) {
            if (value[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
              this.supplementCarryForwardFlag = true;
            }
          }
        }

        if (jsonData === 'wellnessSSlug' && value[jsonData] != undefined && value[jsonData].benefitCarryFwd != undefined) {
          if (value[jsonData].benefitCarryFwd.length > 0) {
            if (value[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
              this.wellnessSCarryForwardFlag = true;
            }
          }
        }
      }
    })

    this.selectedBenefitsList = []
    this.getCaryFrwdYear();
  }

  /**
   * Show Selected coverage category
   * @param $event
   */
  eventListener($event: GtEvent) {
    if ($event.name === 'gt-row-clicked') {
      this.showCoverageMaxHistory($event.value.row);
      if ($event.value.row.ischecked) {
        switch (this.activeBenefit) {

          case 'dentalSlug':
            if (this.searchValueInArray(this.benefitObj.dentalSlug.coverageCategory, $event.value.row.covCatKey)) {
              this.dentalCovrageCategoryID = $event.value.row.covCatKey;
              this.dentalCovKey = $event.value.row.covKey;
              this.getAllDentalCoverageMaxList();
            }
            break;
          case 'visionSlug':
            if (this.searchValueInArray(this.benefitObj.visionSlug.coverageCategory, $event.value.row.covCatKey)) {
              this.dentalCovrageCategoryID = $event.value.row.covCatKey;
              this.visionCovKey = $event.value.row.covKey;
              this.getAllDentalCoverageMaxList();
            }
            break;
          case 'healthSlug':
            if (this.searchValueInArray(this.benefitObj.healthSlug.coverageCategory, $event.value.row.covCatKey)) {
              this.dentalCovrageCategoryID = $event.value.row.covCatKey;
              this.healthCovKey = $event.value.row.covKey;
              this.getAllDentalCoverageMaxList();
            }
            break;
          case 'drugSlug':
            if (this.searchValueInArray(this.benefitObj.drugSlug.coverageCategory, $event.value.row.covCatKey)) {
              this.dentalCovrageCategoryID = $event.value.row.covCatKey;
              this.drugCovKey = $event.value.row.covKey;
              this.getAllDentalCoverageMaxList();
            }
            break;
          case 'supplementSlug':
            if (this.searchValueInArray(this.benefitObj.supplementSlug.coverageCategory, $event.value.row.covCatKey)) {
              this.dentalCovrageCategoryID = $event.value.row.covCatKey;
              this.supplementCovKey = $event.value.row.covKey;
              this.getAllDentalCoverageMaxList();
            }
            break;
          case 'wellnessSlug':
            if (this.searchValueInArray(this.benefitObj.wellnessSlug.coverageCategory, $event.value.row.covCatKey)) {
              this.dentalCovrageCategoryID = $event.value.row.covCatKey;
              this.wellnessCovKey = $event.value.row.covKey;
              this.getAllDentalCoverageMaxList();
            }
            break;
        }
        if (this.myTable.selectedRows.length > 0) {
          for (var i in this.myTable.selectedRows) {
            this.myTable.selectedRows[i].$$gtRowClass = '';
          }
        }
        this.myTable.selectedRows.push($event.value.row);
        $event.value.row.$$gtRowClass = 'hactive-row';
      } else {
        $event.value.row.$$gtRowClass = '';
      }
    } else if ($event.name === 'gt-info') {
        if ($event.value.visibleRecords != "") {
          let covCatKey;
          let covKey;
          let checkIndex = $event.value.visibleRecords.findIndex(x => x.ischecked === true);
          if(checkIndex != -1) {
            covCatKey = $event.value.visibleRecords[checkIndex].covCatKey
            covKey = $event.value.visibleRecords[checkIndex].covKey
          }
          if (covCatKey != undefined) {
            switch (this.activeBenefit) {
              case 'dentalSlug':
                if (this.searchValueInArray(this.benefitObj.dentalSlug.coverageCategory, covCatKey)) {
                  this.dentalCovrageCategoryID = covCatKey;
                  this.dentalCovKey = covKey;
                  this.getAllDentalCoverageMaxList();
                }
                break;
              case 'visionSlug':
                if (this.searchValueInArray(this.benefitObj.visionSlug.coverageCategory, covCatKey)) {
                  this.dentalCovrageCategoryID = covCatKey;
                  this.visionCovKey = covKey;
                  this.getAllDentalCoverageMaxList();
                }
                break;
              case 'healthSlug':
                if (this.searchValueInArray(this.benefitObj.healthSlug.coverageCategory, covCatKey)) {
                  this.dentalCovrageCategoryID = covCatKey;
                  this.healthCovKey = covKey;
                  this.getAllDentalCoverageMaxList();
                }
                break;
              case 'drugSlug':
                if (this.searchValueInArray(this.benefitObj.drugSlug.coverageCategory, covCatKey)) {
                  this.dentalCovrageCategoryID = covCatKey;
                  this.drugCovKey = covKey;
                  this.getAllDentalCoverageMaxList();
                }
                break;
              case 'supplementSlug':
                if (this.searchValueInArray(this.benefitObj.supplementSlug.coverageCategory, covCatKey)) {
                  this.dentalCovrageCategoryID = covCatKey;
                  this.supplementCovKey = covKey;
                  this.getAllDentalCoverageMaxList();
                }
                break;
              case 'wellnessSlug':
                if (this.searchValueInArray(this.benefitObj.wellnessSlug.coverageCategory, covCatKey)) {
                  this.dentalCovrageCategoryID = covCatKey;
                  this.wellnessCovKey = covKey;
                  this.getAllDentalCoverageMaxList();
                }
                break;
            }
          } 
        }
    }
  }

  /**
   * Get Benefit List
   */
  getBenefits() {
    let companyData = {
      "coKey": this.companyId
    }
    var URL = PlanApi.getCompanyDetailByCompanyCoKeyUrl;

    let promise = new Promise((resolve, reject) => {
      this.hmsDataServiceService.postApi(URL, companyData).subscribe(data => {
        if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.companyBusinessTypeName = data.result.businessTypeDesc //Global value set 
          this.hmsDataServiceService.getApi(PlanApi.getDisciplineUrl).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              let myArray = data.result
              if (this.companyBusinessTypeName == 'AB Gov.') {
                this.benefitsList = myArray.slice(0, -5); // Show Only Dental benefit for AB Gov.
              } else {
                this.benefitsList = myArray;
              }
              resolve();
            }
          })
        }
      });
    });
    return promise;
  }

  onMaximumTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedMaximumTypeKey = (selected.originalObject.maxTypeKey).toString();
      this.selectedMaximumTypeDesc = (selected.originalObject.maxTypeDesc).toString();
    }
  }

  onMaximumPeriodTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedMaximumPeriodTypeKey = (selected.originalObject.maxPeriodTypeKey).toString();
      this.selectedMaximumPeriodTypeDesc = (selected.originalObject.maxPeriodTypeCd).toString();
    }
  }

  onSupplementMaximumTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedHsaMaximumTypeKey = (selected.originalObject.hsaMaxTypeKey).toString();
      this.selectedHsaMaximumTypeDesc = (selected.originalObject.hsaMaxTypeDesc).toString();
    }
  }

  onSplementMaximumPeriodTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedHsaMaximumPeriodTypeKey = (selected.originalObject.hsaMaxPeriodTypeKey).toString();
      this.selectedHsaMaximumPeriodTypeDesc = (selected.originalObject.hsaMaxPeriodTypeDesc).toString();
    }
  }
  onSplementCarryFrwdYear(selected: CompleterItem) {
    if (selected) {
      this.selectedCarryFrwdYear = selected.originalObject.value
    }
  }

  onDentalCombineMaxTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedDentalCombineMaxTypeKey = (selected.originalObject.key).toString();
      this.selectedDentalCombineMaxTypeDesc = (selected.originalObject.desc).toString();
    }
  }

  onWellnessCombineMaxTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedWellnessCombineMaxTypeKey = (selected.originalObject.key).toString();
      this.selectedWellnessCombineMaxTypeDesc = (selected.originalObject.desc).toString();

    }
  }
  public isOpen: boolean = false;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  /**
   * Get Maximum Type List
   */
  getMaximumTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getMaximumTypeList).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.MaximumTypeList = data.result;
        //Predictive Company Search Upper
        this.maximumTypeData = this.completerService.local(
          this.MaximumTypeList,
          "maxTypeDesc",
          "maxTypeDesc"
        );
      }
    })
  }

  /**
   * Get Supplement Maximum Type List
   */
  getSupplementMaximumTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getHsaMaxTypeList).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.HSAMaximumTypeList = data.result;
        //Predictive Company Search Upper
        this.supplementMaximumTypeData = this.completerService.local(
          this.HSAMaximumTypeList,
          "hsaMaxTypeDesc",
          "hsaMaxTypeDesc"
        );
      }
    })
  }

  /**
   * Get Maximum Period Type List
   */
  getMaximumPeriodTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getMaxPeriodTypeList).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.MaximumPeriodTypeList = data.result;
        //Predictive Company Search Upper
        this.maximumPeriodTypeData = this.completerService.local(
          this.MaximumPeriodTypeList,
          "maxPeriodTypeCd",
          "maxPeriodTypeCd"
        );
      }
    })
  }

  /**
   * Get Maximum Period Type List
   */
  getCaryFrwdYear() {
    this.supplementCarryFwdyears = this.completerService.local(
      [{ "value": 0 }, { "value": 1 }, { "value": 2 }],
      "value",
      "value"
    );
  }
  getSupplementMaximumPeriodTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getHsaMaxPeriodTypeList).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.HSAMaximumPeriodTypeList = data.result;
        //Predictive Company Search Upper
        this.supplementMaximumPeriodTypeData = this.completerService.local(
          this.HSAMaximumPeriodTypeList,
          "hsaMaxPeriodTypeDesc",
          "hsaMaxPeriodTypeDesc"
        );
      }
    })
  }

  /**
   * Get Combine maximum List
   */
  getCombineMaximumTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getBenefitDentCovCatList).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.CombineMaximumTypeList = data.result;
        //Predictive Company Search Upper
        this.dentalCombineMaxTypeData = this.completerService.local(
          this.CombineMaximumTypeList,
          "desc",
          "desc"
        );
      }
    })
  }

  /**
   * Get TimeFrame DropDowm List
   */
  getTimeFrameList() {
    this.hmsDataServiceService.getApi(PlanApi.getCoverageTimeFrameListUrl).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.timeFrameList = data.result;
      }
    })
  }

  /**
   * Remove Active Row Class of bebefit category on change benefit.
   */
  removeActiveClassOnChangeBebefit() {
    if (this.myTable != undefined) {
      for (var n in this.myTable.selectedRows) {
        this.myTable.selectedRows[n].$$gtRowClass = '';
      }
    }
  }

  /**
   * Select/Unselect Benefits type
   * @param categoryId 
   * @param isChecked 
   * @param categoryName 
   */
  selectCategory(categoryId: number, isChecked, categoryName) {
    var index = this.selectedBenefitsList.findIndex(p => p.name == categoryName);
    this.showCovMaxHistoryIcon = false;
    this.removeActiveClassOnChangeBebefit()
    this.resetNewDentalCoverageMaxRow()
    this.resetNewVisionCoverageMaxRow()
    this.resetNewHealthCoverageMaxRow()
    this.resetNewSupplementalCoverageMaxRow()
    this.resetNewWellnessCoverageMaxRow()
    let ApiUrl: any;
    switch (categoryId) {
      case 1:
        if (isChecked) {
          if (index == -1) {
            this.selectedBenefitsList.push({ id: categoryId, name: categoryName });

          }
          this.currentBenefitId = categoryId;
          ApiUrl = PlanApi.getDentalCoverageCategoryList
          this.activeBenefit = 'dentalSlug';
          Object.assign(this.benefitObj, { "dentalSlug": { 'disciplineKey': categoryId, "combineMaximum": [], "coverageCategory": [] } });
          this.benefitCategoryListing(ApiUrl, categoryId, 'addMode').then(res => {
            this.genericDataTableInit(this.dentalCoverageCategoryList)
            if (this.hideGoToPage) {
              this.myTable.goToPage(1)
            }
            this.hideGoToPage = true;
            this.dentalCovrageCategoryID = 0;
            this.getAllDentalCoverageMaxList(); // get dental coveragemax
          });
        } else {
          this.currentBenefitId = categoryId;
          this.DentalCombineMaxList = [];
          this.removeBebefitList(categoryId);
          this.arrDataDental = [];
          delete this.benefitObj['dentalSlug'];
        }
        break;
      case 2:
        if (isChecked) {
          this.selectedBenefitsList.push({ id: categoryId, name: categoryName });
          this.currentBenefitId = categoryId;
          ApiUrl = PlanApi.getVisionCoverageAndServicesList
          this.activeBenefit = 'visionSlug';
          Object.assign(this.benefitObj, { "visionSlug": { 'disciplineKey': categoryId, "coverageCategory": [] } });
          this.benefitCategoryListing(ApiUrl, categoryId, 'addMode').then(res => {
            this.genericDataTableInit(this.visionCoverageCategoryList)
            if (this.hideGoToPage) {
              this.myTable.goToPage(1)
            }
            this.hideGoToPage = true;
            this.dentalCovrageCategoryID = 0;
            this.getAllDentalCoverageMaxList(); // get dental coveragemax
          });
        } else {
          this.currentBenefitId = categoryId;
          this.removeBebefitList(categoryId);
          this.arrDataVision = [];
          delete this.benefitObj['visionSlug'];
        }
        break;
      case 3:
        if (isChecked) {
          this.selectedBenefitsList.push({ id: categoryId, name: categoryName });
          this.currentBenefitId = categoryId;
          ApiUrl = PlanApi.getHealthCoverageAndServicesList
          this.activeBenefit = 'healthSlug';
          this.selectedHealthNode = [];
          Object.assign(this.benefitObj, { "healthSlug": { 'disciplineKey': categoryId, "coverageCategory": [] } });
          this.benefitCategoryListing(ApiUrl, categoryId, 'addMode').then(res => {
            this.genericDataTableInit(this.healthCoverageCategoryList)
            if (this.hideGoToPage) {
              this.myTable.goToPage(1)
            }
            this.hideGoToPage = true;
            this.dentalCovrageCategoryID = 0;
            this.getAllDentalCoverageMaxList(); // get dental coveragemax
          });
        } else {
          this.currentBenefitId = categoryId;
          this.removeBebefitList(categoryId);
          this.arrDataHealth = [];
          delete this.benefitObj['healthSlug'];
        }
        break;
      case 4:
        if (isChecked) {
          this.selectedBenefitsList.push({ id: categoryId, name: categoryName });
          this.currentBenefitId = categoryId;
          ApiUrl = PlanApi.getDrugCoverageAndServicesList
          this.activeBenefit = 'drugSlug';
          Object.assign(this.benefitObj, { "drugSlug": { 'disciplineKey': categoryId, "coverageCategory": [] } });
          this.benefitCategoryListing(ApiUrl, categoryId, 'addMode').then(res => {
            this.genericDataTableInit(this.drugCoverageCategoryList)
            if (this.hideGoToPage) {
              this.myTable.goToPage(1)
            }
            this.hideGoToPage = true;
            this.dentalCovrageCategoryID = 0;
            this.getAllDentalCoverageMaxList(); // get dental coveragemax
          });
        } else {
          this.currentBenefitId = categoryId;
          this.removeBebefitList(categoryId);
          this.arrDataDrug = [];
          delete this.benefitObj['drugSlug'];
        }
        break;
      case 5:
        if (isChecked) {
          this.selectedBenefitsList.push({ id: categoryId, name: categoryName });
          this.currentBenefitId = categoryId;
          ApiUrl = PlanApi.getHSACoverageAndServicesList  // Need to update
          this.activeBenefit = 'supplementSlug';
          Object.assign(this.benefitObj, { "supplementSlug": { 'disciplineKey': categoryId, "coverageCategory": [], "combineMaximum": [] } });
          this.benefitCategoryListing(ApiUrl, categoryId, 'addMode').then(res => {
            this.genericDataTableInit(this.supplementCoverageCategoryList) // Need to update
            if (this.hideGoToPage) {
              this.myTable.goToPage(1)
            }
            this.hideGoToPage = true;
            this.dentalCovrageCategoryID = 0;
            this.getAllDentalCoverageMaxList(); // get dental coveragemax
          });
        } else {
          this.currentBenefitId = categoryId;
          this.removeBebefitList(categoryId);
          this.SupplementalCoverageMaxList = [];
          delete this.benefitObj['supplementSlug'];
        }
        break;
      case 6:
        if (isChecked) {
          this.selectedBenefitsList.push({ id: categoryId, name: categoryName });
          this.currentBenefitId = categoryId;
          ApiUrl = PlanApi.getWellnessCoverageAndServicesList  // Need to update
          this.activeBenefit = 'wellnessSlug';
          Object.assign(this.benefitObj, { "wellnessSlug": { 'disciplineKey': categoryId, "coverageCategory": [], "combineMaximum": [] } });
          this.benefitCategoryListing(ApiUrl, categoryId, 'addMode').then(res => {
            this.genericDataTableInit(this.wellnessCoverageCategoryList) // Need to update
            if (this.hideGoToPage) {
              this.myTable.goToPage(1)
            }
            this.hideGoToPage = true;
            this.dentalCovrageCategoryID = 0;
            this.getAllDentalCoverageMaxList(); // get dental coveragemax
          });
        } else {
          this.currentBenefitId = categoryId;
          this.WellnessCombineMaxList = [];
          this.removeBebefitList(categoryId);
          this.wellnessCoverageMaxList = []
          delete this.benefitObj['wellnessSlug'];
          this.arrDataWellness = [];
        }
    }
    this.selectedBenefitsList.sort(function (a, b) {
      return a.id - b.id
    });
    this.benefitsData.emit(this.benefitObj);
  }

  /**
   * Get Benefits category listing on click benefit
   * @param categoryApiUrl 
   * @param categoryID 
   * @param checkMode 
   */
  benefitCategoryListing(categoryApiUrl, categoryID, checkMode) {
    let serviceApiUrl: any; let benefitCategoryId: any; let covCategoryArray = [];
    let promise = new Promise((resolve, reject) => {
      this.hmsDataServiceService.getApi(categoryApiUrl).subscribe(data => {
        if (data.code == 200 && data.result.length > 0) {
          let dataArray = [];
          data.result.forEach(element => {
            element = Object.assign({ "ischecked": false, "editMode": false, 'addPlanMode': this.addPlanMode, 'editPlanMode': this.editPlanMode, 'covCatExpired': '' }, element);
            dataArray.push(element);
          });
          switch (categoryID) {
            case 1:
              /**Remove Unwanted Dental Coverage Category */
              if (checkMode != 'editMode') {
                let removeDentalCovCategory = ["Endodontic", "Endoperio", "Exclusions", "Majorrestorative", "Periodontalscaling", "Periodontic", "Prosthodontic", "Scale", "Temporomandibular Joint"];
                for (var i in dataArray) {
                  let editIndex = removeDentalCovCategory.findIndex(x => x === dataArray[i].covCatDesc);
                  if (editIndex == -1) {
                    covCategoryArray.push(dataArray[i]);
                  }
                }
                this.dentalCoverageCategoryList = covCategoryArray;
              } else {
                this.dentalCoverageCategoryList = dataArray;
              }
              /**Remove Unwanted Dental Coverage Category */
              serviceApiUrl = PlanApi.getServicesByCovKeyDentalUrl;
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(categoryID, serviceApiUrl, benefitCategoryId);
              }

              break;
            case 2:
              /**Remove Unwanted Vision Coverage Category */
              if (checkMode != 'editMode') {
                let removeVisionCovCategory = ["Clinical Need", "Exclusions", "Optical Supplements", "Referrals"];
                for (var i in dataArray) {
                  let editIndex = removeVisionCovCategory.findIndex(x => x === dataArray[i].covCatDesc);
                  if (editIndex == -1) {
                    covCategoryArray.push(dataArray[i]);
                  }
                }
                this.visionCoverageCategoryList = covCategoryArray;
              } else {
                this.visionCoverageCategoryList = dataArray;
              }
              
              serviceApiUrl = PlanApi.getServicesByCovKeyVisionUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(categoryID, serviceApiUrl, benefitCategoryId);
              }
              break;
            case 3:
              /**Remove Unwanted Health Coverage Category */
              if (checkMode != 'editMode') {
                let removeHealthCovCategory = ["Exclusions"];
                for (var i in dataArray) {
                  let editIndex = removeHealthCovCategory.findIndex(x => x === dataArray[i].covCatDesc);
                  if (editIndex == -1) {
                    covCategoryArray.push(dataArray[i]);
                  }
                }
                this.healthCoverageCategoryList = covCategoryArray;
              } else {
                this.healthCoverageCategoryList = dataArray;
              }
              
              serviceApiUrl = PlanApi.getServicesByCovKeyHealthUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(categoryID, serviceApiUrl, benefitCategoryId);
              }
              break;
            case 4:
              this.drugCoverageCategoryList = dataArray;
              serviceApiUrl = PlanApi.getServicesByCovKeyDrugUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(categoryID, serviceApiUrl, benefitCategoryId);
              }
              break;
            case 5:
              /* start */ 
              if (checkMode != 'editMode') {  // temporary remove HSA categories
                let removeHSACovCategory = ["Air Filters/Air Purifiers","Allergy Tests","Alternative Health Practitoner",
                   "Alternative Wellness Services","Annual Memberships, such as golf","Athletic Apparel","Cholesterol and Hypertension Screening",
                   "Durable Fitness Equipment","Ergonomic Office - Work from Home","First Aid and CPR Training","Fitness Club membership",
                   "Health and Wellness app fees","Health Assessments","Juicers","Maternity Services","Nutrition Programs","Personal Trainers",
                   "Registration Fee Fitness","Smoking Cessation Programs","Specialized Sports Equipment","Sports Fees","Sports Team Fee","Stress Management",
                   "Vitamins and Supplements","Wearable Devices","Weight Mangement Programs","Office Chairs - Work from Home"];
                for (var i in dataArray) {
                  let editIndex = removeHSACovCategory.findIndex(x => x === dataArray[i].covCatDesc);
                  if (editIndex == -1) {
                    covCategoryArray.push(dataArray[i]);
                  }
                }
                this.supplementCoverageCategoryList = covCategoryArray;
              } 
              else {
                 /* ends */ 
                 this.supplementCoverageCategoryList = dataArray;
                }
              serviceApiUrl = PlanApi.getServicesByCovKeyHsaUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(categoryID, serviceApiUrl, benefitCategoryId);
              }
              break;
            case 6:
              this.wellnessCoverageCategoryList = dataArray;
              serviceApiUrl = PlanApi.getServicesByCovKeyWellnessUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(categoryID, serviceApiUrl, benefitCategoryId);
              }
              break;
          }
          resolve();
        } else if (data.code == 400 && data.status == 'BAD_REQUEST') {
          if (categoryID == 4) {
            this.toastr.error('Please select another benefit. Coverage Categories are not available for this benefit!');
            $('input[name=Drug]').click();
          }
        }
      });
    });
    return promise;
  }

  /**
   * Create Benefit category table
   * @param dataArray 
   */
  genericDataTableInit(dataArray) {

    switch (this.activeBenefit) {
      case 'dentalSlug':
        var isCheckedPayLab = true;
        for (var i in dataArray) {
          if (dataArray[i].payLab == 'F') {
            var isCheckedPayLab = false;
            break;
          }
        }
        if (isCheckedPayLab) {
          $('#payLab_' + this.currentBenefitId).prop('checked', true)
        } else {
          $('#payClaim_' + this.currentBenefitId).prop('checked', false)
        }

        var isCheckedPayClaim = true;
        for (var i in dataArray) {
          if (dataArray[i].payClaim == 'F') {
            var isCheckedPayClaim = false;
            break;
          }
        }
        if (isCheckedPayClaim) {
          $('#payClaim_' + this.currentBenefitId).prop('checked', true)
        } else {
          $('#payClaim_' + this.currentBenefitId).prop('checked', false)
        }
        break;
      case 'visionSlug':
        var isCheckedPayClaim = true;
        for (var i in dataArray) {
          if (dataArray[i].payClaim == 'F') {
            var isCheckedPayClaim = false;
            break;
          }
        }
        if (isCheckedPayClaim) {
          $('#payClaim_' + this.currentBenefitId).prop('checked', true)
        } else {
          $('#payClaim_' + this.currentBenefitId).prop('checked', false)
        }
        break;
      case 'healthSlug':
        var isCheckedPayClaim = true;
        for (var i in dataArray) {
          if (dataArray[i].payClaim == 'F') {
            var isCheckedPayClaim = false;
            break;
          }
        }
        if (isCheckedPayClaim) {
          $('#payClaim_' + this.currentBenefitId).prop('checked', true)
        } else {
          $('#payClaim_' + this.currentBenefitId).prop('checked', false)
        }
        break;
      case 'drugSlug':
        break;
      case 'supplementSlug':
        break;
      case 'wellnessSlug':
        var isCheckedPayLab = true;
        for (var i in dataArray) {
          if (dataArray[i].payLab == 'F') {
            var isCheckedPayLab = false;
            break;
          }
        }
        if (isCheckedPayLab) {
          $('#payLab_' + this.currentBenefitId).prop('checked', true)
        } else {
          $('#payClaim_' + this.currentBenefitId).prop('checked', false)
        }

        var isCheckedPayClaim = true;
        for (var i in dataArray) {
          if (dataArray[i].payClaim == 'F') {
            var isCheckedPayClaim = false;
            break;
          }
        }
        if (isCheckedPayClaim) {
          $('#payClaim_' + this.currentBenefitId).prop('checked', true)
        } else {
          $('#payClaim_' + this.currentBenefitId).prop('checked', false)
        }
        break;
    }

    this.configObject = {
      settings: this.genericSettingData(),
      fields: [
        {
          name: 'Included', objectKey: 'checkbox',
          value: () => '',
          render: row => this.printCheckbox(row, 'mainCheckbox'),
          click: (row, col, event) => this.selectUnSelectCategory(row, event)
        },
        {
          name: 'Coverage Category', objectKey: 'covCatDesc',
          click: (row, col, event) => this.selectedRow(row, event)
        },
        {
          name: 'Adult%', objectKey: 'adult',
          render: row => this.printInputBox(row, 'adult'),
          click: (row, col, event) => this.selectedRow(row, event)
        },
        {
          name: 'Adult Time Frame', objectKey: 'covCoverageTimeFrameKey',
          render: row => this.printTimeFrameDropDown(row, 'covCoverageTimeFrameKey')
        },
        {
          name: 'Adult Lab%', objectKey: 'adultLab',
          render: row => this.printInputBox(row, 'adultLab'),
          click: (row, col, event) => this.selectedRow(row, event)
        },
        {
          name: 'Dep%', objectKey: 'dept',
          render: row => this.printInputBox(row, 'dept'),
          click: (row, col, event) => this.selectedRow(row, event)
        },
        {
          name: 'Dep Time Frame', objectKey: 'coverageTimeFrameKey',
          render: row => this.printTimeFrameDropDown(row, 'coverageTimeFrameKey')
        },
        {
          name: 'Dep Lab%', objectKey: 'deptLab',
          render: row => this.printInputBox(row, 'deptLab'),
          click: (row, col, event) => this.selectedRow(row, event)
        },
        {
          name: 'Pay Lab', objectKey: 'payLab',
          value: () => { true },
          render: row => this.printCheckbox(row, 'payLab'),
          click: (row, col, event) => this.editPayClaimLab(row, 'payLab', event)
        },
        {
          name: 'Pay Claim', objectKey: 'payClaim',
          value: () => { true },
          render: row => this.printCheckbox(row, 'payClaim'),
          click: (row, col, event) => this.editPayClaimLab(row, 'payClaim', event)
        },
        {
          name: 'Effective Date', objectKey: 'effectiveOn',
          columnComponent: { type: EffectiveDateComponent }
        },
        {
          name: 'Expiry Date', objectKey: 'expiredOn',
          columnComponent: { type: ExpiredDateComponent }
        },
        {
          name: 'Action', objectKey: 'editMode',
          value: () => { true },
          render: row => this.printActioncolumn(row, 'editMode'),
          click: (row, col, event) => this.categoryEdit(row, 'editMode', event)
        },
        {
          name: 'History', objectKey: 'coverageMaxHist',
          render: row => this.printCovCatHistorycolumn(row),
          click: (row, col, event) => this.covCategoryHistory(row, 'editMode', event)
        },
      ],
      data: dataArray
    };
  }

  /**
   * Show/Hide Benefits Category fields
   */
  genericSettingData() {
    if (this.addPlanMode) {
      this.dentalCarryForwardFlag = true;
      this.visionCarryForwardFlag = true;
      this.healthCarryForwardFlag = true;
      // this.showEffectiveDate = false;
      this.showEffectiveDate = true
      this.showExpiryDate = false;
    } else if (this.editPlanMode) {
      this.showEditButton = true;
      var showCovCatHis = 'N';
      if (showCovCatHis == 'Y') {
        this.showCovCatHistory = true;
      }
    }
    let settingData = [];
    switch (this.activeBenefit) {
      case 'dentalSlug':
        settingData = [
          { objectKey: 'checkbox', columnOrder: 0 },
          { objectKey: 'covCatDesc', columnOrder: 1 },
          { objectKey: 'adult', columnOrder: 2, visible: true },
          { objectKey: 'covCoverageTimeFrameKey', columnOrder: 3, visible: false },
          { objectKey: 'adultLab', columnOrder: 4, visible: true },
          { objectKey: 'dept', columnOrder: 5, visible: true },
          { objectKey: 'coverageTimeFrameKey', columnOrder: 6, visible: false },
          { objectKey: 'deptLab', columnOrder: 7, visible: true },
          { objectKey: 'payLab', columnOrder: 8, visible: true },
          { objectKey: 'payClaim', columnOrder: 9, visible: true },
          { objectKey: 'effectiveOn', columnOrder: 10, visible: this.showEffectiveDate },
          { objectKey: 'expiredOn', columnOrder: 11, visible: this.showExpiryDate },
          { objectKey: 'editMode', columnOrder: 12, visible: true },
          { objectKey: 'coverageMaxHist', columnOrder: 13, visible: this.showCovCatHistory }
        ];
        break;
      case 'visionSlug':
        settingData = [
          { objectKey: 'checkbox', columnOrder: 0 },
          { objectKey: 'covCatDesc', columnOrder: 1 },
          { objectKey: 'adult', columnOrder: 2, visible: true },
          { objectKey: 'covCoverageTimeFrameKey', columnOrder: 3, visible: true },
          { objectKey: 'adultLab', columnOrder: 4, visible: false },
          { objectKey: 'dept', columnOrder: 5, visible: true },
          { objectKey: 'coverageTimeFrameKey', columnOrder: 6, visible: true },
          { objectKey: 'deptLab', columnOrder: 7, visible: false },
          { objectKey: 'payLab', columnOrder: 8, visible: false },
          { objectKey: 'payClaim', columnOrder: 9, visible: true },
          { objectKey: 'effectiveOn', columnOrder: 10, visible: this.showEffectiveDate },
          { objectKey: 'expiredOn', columnOrder: 11, visible: this.showExpiryDate },
          { objectKey: 'editMode', columnOrder: 12, visible: true },
        ];
        break;
      case 'healthSlug':
        settingData = [
          { objectKey: 'checkbox', columnOrder: 0 },
          { objectKey: 'covCatDesc', columnOrder: 1 },
          { objectKey: 'adult', columnOrder: 2, visible: true },
          { objectKey: 'covCoverageTimeFrameKey', columnOrder: 3, visible: false },
          { objectKey: 'adultLab', columnOrder: 4, visible: false },
          { objectKey: 'dept', columnOrder: 5, visible: true },
          { objectKey: 'coverageTimeFrameKey', columnOrder: 6, visible: false },
          { objectKey: 'deptLab', columnOrder: 7, visible: false },
          { objectKey: 'payLab', columnOrder: 8, visible: false },
          { objectKey: 'payClaim', columnOrder: 9, visible: true },
          { objectKey: 'effectiveOn', columnOrder: 10, visible: this.showEffectiveDate },
          { objectKey: 'expiredOn', columnOrder: 11, visible: this.showExpiryDate },
          { objectKey: 'editMode', columnOrder: 12, visible: true },

        ];
        break;
      case 'drugSlug':
        settingData = [
          { objectKey: 'checkbox', columnOrder: 0 },
          { objectKey: 'covCatDesc', columnOrder: 1 },
          { objectKey: 'adult', columnOrder: 2, visible: true },
          { objectKey: 'covCoverageTimeFrameKey', columnOrder: 3, visible: false },
          { objectKey: 'adultLab', columnOrder: 4, visible: false },
          { objectKey: 'dept', columnOrder: 5, visible: true },
          { objectKey: 'coverageTimeFrameKey', columnOrder: 6, visible: false },
          { objectKey: 'deptLab', columnOrder: 7, visible: false },
          { objectKey: 'payLab', columnOrder: 8, visible: false },
          { objectKey: 'payClaim', columnOrder: 9, visible: true },
          { objectKey: 'effectiveOn', columnOrder: 10, visible: this.showEffectiveDate },
          { objectKey: 'expiredOn', columnOrder: 11, visible: this.showExpiryDate },
          { objectKey: 'editMode', columnOrder: 12, visible: true },

        ];
        break;
      case 'supplementSlug':
        settingData = [
          { objectKey: 'checkbox', columnOrder: 0 },
          { objectKey: 'covCatDesc', columnOrder: 1 },
          { objectKey: 'adult', columnOrder: 2, visible: false },
          { objectKey: 'covCoverageTimeFrameKey', columnOrder: 3, visible: false },
          { objectKey: 'adultLab', columnOrder: 4, visible: false },
          { objectKey: 'dept', columnOrder: 5, visible: false },
          { objectKey: 'coverageTimeFrameKey', columnOrder: 6, visible: false },
          { objectKey: 'deptLab', columnOrder: 7, visible: false },
          { objectKey: 'payLab', columnOrder: 8, visible: false },
          { objectKey: 'payClaim', columnOrder: 9, visible: false },
          { objectKey: 'effectiveOn', columnOrder: 10, visible: this.showEffectiveDate },
          { objectKey: 'expiredOn', columnOrder: 11, visible: this.showExpiryDate },
          // { objectKey: 'editMode', columnOrder: 12, visible: this.showEditButton },
          { objectKey: 'editMode', columnOrder: 12, visible: true } 

        ];
        break;
      case 'wellnessSlug':
        settingData = [
          { objectKey: 'checkbox', columnOrder: 0 },
          { objectKey: 'covCatDesc', columnOrder: 1 },
          { objectKey: 'adult', columnOrder: 2, visible: true },
          { objectKey: 'covCoverageTimeFrameKey', columnOrder: 3, visible: false },
          { objectKey: 'adultLab', columnOrder: 4, visible: false },
          { objectKey: 'dept', columnOrder: 5, visible: false },
          { objectKey: 'coverageTimeFrameKey', columnOrder: 6, visible: false },
          { objectKey: 'deptLab', columnOrder: 7, visible: false },
          { objectKey: 'payLab', columnOrder: 8, visible: false },
          { objectKey: 'payClaim', columnOrder: 9, visible: true },
          { objectKey: 'effectiveOn', columnOrder: 10, visible: this.showEffectiveDate },
          { objectKey: 'expiredOn', columnOrder: 11, visible: this.showExpiryDate },
          { objectKey: 'editMode', columnOrder: 12, visible: true },
          { objectKey: 'coverageMaxHist', columnOrder: 13, visible: this.showCovCatHistory }
        ];
        break;
    }
    return settingData;
  }

  /**
   * Return Benefit category table checkbox html
   * @param fieldValue 
   * @param fieldName 
   */
  printCheckbox(fieldValue, fieldName) {
    let checkboxHTML; var disabledInput;
    if (fieldValue.editMode) {
      if (!this.enableCovCatForCopyDivision) {
        if (fieldValue.isCovCatExpired == 'T') {
          disabledInput = 'disableInput';
        } else {
          disabledInput = '';
        }
      } else {
        disabledInput = '';
      }
    }
    switch (fieldName) {
      case 'payLab':
        if (fieldValue.editMode) {
          if (fieldValue.payLab == 'T') {
            checkboxHTML = '<input class="' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" type="checkbox" name="payLab" checked>';
          } else {
            checkboxHTML = '<input class="' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" type="checkbox" name="payLab" value="F">';
          }
        } else {
          if (fieldValue.payLab == 'T') {
            checkboxHTML = '<input class="' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" type="checkbox" name="payLab" disabled checked>';
          } else {
            checkboxHTML = '<input class="' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" type="checkbox" name="payLab" disabled >';
          }
        }
        break;
      case 'payClaim':
        if (fieldValue.editMode) {
          if (fieldValue.payClaim == 'T') {
            checkboxHTML = '<input class="' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" type="checkbox" name="payClaim" checked>';
          } else {
            checkboxHTML = '<input class="' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" type="checkbox" name="payClaim" value="F">';
          }
        } else {
          if (fieldValue.payClaim == 'T') {
            checkboxHTML = '<input class="' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" type="checkbox" name="payClaim" disabled checked>';
          } else {
            checkboxHTML = '<input class="' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" type="checkbox" name="payClaim" disabled >';
          }
        }
        break;
      case 'mainCheckbox':
        switch (this.activeBenefit) {
          case 'dentalSlug':
            if (this.searchValueInArray(this.benefitObj.dentalSlug.coverageCategory, fieldValue.covCatKey)) {
              if (!this.enableCovCatForCopyDivision) {

                if (fieldValue.isExist) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked disabled>';
                }
                else if (fieldValue.isExist == null && fieldValue.ischecked) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
                }
                else if (fieldValue.isExist == null && !fieldValue.ischecked) {

                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '">';
                }
                
              } else {
                checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
              }
            } else {
              checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '" class="clickMainCheckBox">';

            }
            break;
          case 'visionSlug':
            if (this.searchValueInArray(this.benefitObj.visionSlug.coverageCategory, fieldValue.covCatKey)) {
              if (!this.enableCovCatForCopyDivision) {
                if (fieldValue.isExist) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked disabled>';
                }
                
                else if (fieldValue.isExist == null && fieldValue.ischecked) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
                }
                else if (fieldValue.isExist == null && !fieldValue.ischecked) {

                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '">';
                }
              } else {
                checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
              }
            } else {
              checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '" >';
            }
            break;
          case 'healthSlug':
            if (this.searchValueInArray(this.benefitObj.healthSlug.coverageCategory, fieldValue.covCatKey)) {
              if (!this.enableCovCatForCopyDivision) {
                if (fieldValue.isExist) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked disabled>';
                } else if (fieldValue.isExist == null) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
                }
              } else {
                checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
              }
            } else {
              checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '" >';
            }
            break;
          case 'drugSlug':
            if (this.searchValueInArray(this.benefitObj.drugSlug.coverageCategory, fieldValue.covCatKey)) {
              if (!this.enableCovCatForCopyDivision) {
                if (fieldValue.isExist) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked disabled>';
                }
                else if (fieldValue.isExist == null && fieldValue.ischecked) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
                }
                else if (fieldValue.isExist == null && !fieldValue.ischecked) {

                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '">';
                }
                
              } else {
                checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
              }
            } else {
              checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '" >';
            }
            break;
          case 'supplementSlug':
            if (this.searchValueInArray(this.benefitObj.supplementSlug.coverageCategory, fieldValue.covCatKey)) {
              if (!this.enableCovCatForCopyDivision) {

                if (fieldValue.isExist) {


                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked disabled>';
                } else if (fieldValue.isExist == null && fieldValue.ischecked) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
                }
                else if (fieldValue.isExist == null && !fieldValue.ischecked) {

                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '">';
                }
              } else {
                checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
              }
            } else {
              checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '" >';
            }
            break;
          case 'wellnessSlug':
            if (this.searchValueInArray(this.benefitObj.wellnessSlug.coverageCategory, fieldValue.covCatKey)) {
              if (!this.enableCovCatForCopyDivision) {
                if (fieldValue.isExist) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked disabled>';
                }
                
                else if (fieldValue.isExist == null && fieldValue.ischecked) {
                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
                }
                else if (fieldValue.isExist == null && !fieldValue.ischecked) {

                  checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '">';
                }
              } else {
                checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '"  checked>';
              }
            } else {
              checkboxHTML = '<input type="checkbox" id="mainCheckbox_' + fieldValue.$$gtRowId + '" name="mainCheckbox_' + fieldValue.$$gtRowId + '" >';
            }
            break;
        }
        break;
    }
    return checkboxHTML;
  }

  /**
   * Return Benefit category table inputbox html
   * @param fieldValue 
   * @param fieldName 
   */
  printInputBox(fieldValue, fieldName) {
    if (fieldValue.ischecked && fieldValue.editMode) {
      if (!this.enableCovCatForCopyDivision) {
        if (fieldValue.isCovCatExpired == 'T') {
          return '<input class="fm-txt form-control disableInput" type="number" min="0" max="100" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" value="' + fieldValue[fieldName] + '">';
        } else {
          return '<input class="fm-txt form-control ' + fieldValue.expiredBy + '" type="number" min="0" max="100" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" value="' + fieldValue[fieldName] + '">';
        }
      } else {
        return '<input class="fm-txt form-control ' + fieldValue.expiredBy + '" type="number" min="0" max="100" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" value="' + fieldValue[fieldName] + '">';
      }
    } else {
      return fieldValue[fieldName];
    }
  }

  /**
   * Return Benefit category table dropDown html
   * @param fieldValue 
   * @param fieldName 
   */
  printTimeFrameDropDown(fieldValue, fieldName) {
    let selectHTML: any; var disabledInput;
    let selectedValue = '';
    if (fieldValue.editMode) {
      if (!this.enableCovCatForCopyDivision) {
        if (fieldValue.isCovCatExpired == 'T') {
          disabledInput = 'disableInput';
        } else {
          disabledInput = '';
        }
      } else {
        disabledInput = '';
      }
    }
    for (var i in this.timeFrameList) {
      if (fieldValue[fieldName] > 0 && this.timeFrameList[i].coverageTimeframeKey === fieldValue[fieldName]) {
        selectedValue = this.timeFrameList[i].coverageTimeframeDescription;
        selectHTML += "<option selected value='" + this.timeFrameList[i].coverageTimeframeKey + "'>" + this.timeFrameList[i].coverageTimeframeDescription + "</option>";
      } else {
        selectHTML += "<option value='" + this.timeFrameList[i].coverageTimeframeKey + "'>" + this.timeFrameList[i].coverageTimeframeDescription + "</option>";
      }
    }
    if (fieldValue.editMode) {
      return '<select class="fm-txt form-control ' + disabledInput + '" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" name="' + fieldName + '">"' + selectHTML + '"</select>';
    } else {
      if (fieldValue[fieldName] > 0) {
        return selectedValue;
      } else {
        return '<select disabled class="fm-txt form-control" id="' + fieldName + '_' + fieldValue.$$gtRowId + '" name="' + fieldName + '">"' + selectHTML + '"</select>';;
      }

    }
  }

  /**
   * Return Benefit category table Action Column html
   * @param fieldValue 
   * @param fieldName 
   */
  printActioncolumn(fieldValue, fieldName) {
    let inputBoxField;
    if (fieldValue.ischecked) {
      if (fieldValue.editMode) {
        inputBoxField = "<button type='button' class='table-action-btn save-ico actionButton' title='Save' id='save'><i class='fa fa-floppy-o' aria-hidden='true'></i></button>";
      } else {
        inputBoxField = "<button type='button' class='table-action-btn edit-ico actionButton' title='Edit' id='edit'><i class='fa fa-pencil' aria-hidden='true'></i></button>";
      }
    } else {
      inputBoxField = '';
    }
    return inputBoxField;
  }

  /**
   * Update PayClaim And PayLab columns value in the benefit category listing 
   * @param rowID 
   * @param fieldName 
   * @param event 
   */
  editPayClaimLab(rowID, fieldName, event) {
    let indexid = rowID.$$gtRowId.split("_");
    this.currentBenefitId
    if (rowID.editMode) {
      switch (fieldName) {
        case 'payLab':
          if (event.target.checked) {
            this.configObject.data[indexid[0]].payLab = 'T';
            var isCheckedPayLab = true;
            for (var i in this.configObject.data) {
              if (this.configObject.data[i].payLab == 'F') {
                var isCheckedPayLab = false;
                break;
              }
            }
            if (isCheckedPayLab) {
              $('#' + fieldName + '_' + this.currentBenefitId).prop('checked', true)
            } else {
              $('#' + fieldName + '_' + this.currentBenefitId).prop('checked', false)
            }
          } else {
            this.configObject.data[indexid[0]].payLab = 'F';
            $('#' + fieldName + '_' + this.currentBenefitId).prop('checked', false)
          }
          break;
        case 'payClaim':
          if (event.target.checked) {
            this.configObject.data[indexid[0]].payClaim = 'T';
            var isCheckedPayClaim = true;
            for (var i in this.configObject.data) {
              if (this.configObject.data[i].payClaim == 'F') {
                var isCheckedPayClaim = false;
                break;
              }
            }
            if (isCheckedPayClaim) {
              $('#' + fieldName + '_' + this.currentBenefitId).prop('checked', true)
            } else {
              $('#' + fieldName + '_' + this.currentBenefitId).prop('checked', false)
            }
          } else {
            this.configObject.data[indexid[0]].payClaim = 'F';
            $('#' + fieldName + '_' + this.currentBenefitId).prop('checked', false)
          }
          break;
      }
    }
  }

  /**
   * Convert Date Formate
   * @param dateString 
   */
  

  // Log #1164
  changeCovCatDateFormat(dateString) {
    if (dateString.match(/[a-z]/i)) {
      let covDate;
      /* Issue:1164 changes*/
      var monthString = dateString.split('/')
      var monthName = monthString[1];
      monthName = monthName.toLowerCase();
      // alphabet letters found
      let monthByNameLabel = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      var monthKey = monthByNameLabel.indexOf(monthName);
      if (monthKey != -1) {
        return covDate = monthString[0] + '/' + ('0' + (monthKey + 1)).slice(-2) + '/' + monthString[2];
      }
    }
    return
  }
  
  /**
   * Update the benefits category values in inline editing.
   * @param fieldValue 
   * @param fieldName 
   * @param event 
   */
  categoryEdit(fieldValue, fieldName, event) {
    this.editMode = true;
    switch (this.activeBenefit) {
      case 'dentalSlug':
        if (this.selectedCategoryObjDental != undefined) {
          if (this.selectedCategoryObjDental.isSelected) {
            if (fieldValue.covCatKey != this.selectedCategoryObjDental.covCatKey) {
              this.toastr.error('Please Save Last Edited Coverage Category!');
              return false
            }
          }
        }
        break
      case 'visionSlug':
        if (this.selectedCategoryObjVision != undefined) {
          if (this.selectedCategoryObjVision.isSelected) {
            if (fieldValue.covCatKey != this.selectedCategoryObjVision.covCatKey) {
              this.toastr.error('Please Save Last Edited Coverage Category!');
              return false
            }
          }
        }
        break
      case 'healthSlug':
        if (this.selectedCategoryObjHealth != undefined) {
          if (this.selectedCategoryObjHealth.isSelected) {
            if (fieldValue.covCatKey != this.selectedCategoryObjHealth.covCatKey) {
              this.toastr.error('Please Save Last Edited Coverage Category!');
              return false
            }
          }
        }
        break
      case 'drugSlug':
        if (this.selectedCategoryObjDrug != undefined) {
          if (this.selectedCategoryObjDrug.isSelected) {
            if (fieldValue.covCatKey != this.selectedCategoryObjDrug.covCatKey) {
              this.toastr.error('Please Save Last Edited Coverage Category!');
              return false
            }
          }
        }
        break
      case 'supplementSlug':
        if (this.selectedCategoryObjSupplement != undefined) {
          if (this.selectedCategoryObjSupplement.isSelected) {
            if (fieldValue.covCatKey != this.selectedCategoryObjSupplement.covCatKey) {
              this.toastr.error('Please Save Last Edited Coverage Category!');
              return false
            }
          }
        }
        break
      case 'wellnessSlug':
        if (this.selectedCategoryObjWellness != undefined) {
          if (this.selectedCategoryObjWellness.isSelected) {
            if (fieldValue.covCatKey != this.selectedCategoryObjWellness.covCatKey) {
              this.toastr.error('Please Save Last Edited Coverage Category!');
              return false
            }
          }
        }
        break
    }

    let indexid = fieldValue.$$gtRowId.split("_");
    var columnFieldValueAdult: any; let columnFieldValueAdultLab: any;
    let columnFieldValueDep: any; let columnFieldValueDepLab: any; let colsArray: any; let columnFieldValuecovCoverageTimeFrameKey: any; let columnFieldValuecoverageTimeFrameKey: any;
    let columnFieldValuePayLab: any; let columnFieldValuePayClaim: any; let columnFieldValueEffectiveDate: any; let columnFieldValueExpiredDate: any; let dateArray: any;
    if (fieldValue.editMode) {

      switch (this.activeBenefit) {
        case 'dentalSlug':
          columnFieldValueAdult = $('#adult_' + fieldValue.$$gtRowId).val();
          columnFieldValueAdultLab = $('#adultLab_' + fieldValue.$$gtRowId).val();
          columnFieldValueDep = $('#dept_' + fieldValue.$$gtRowId).val();
          columnFieldValueDepLab = $('#deptLab_' + fieldValue.$$gtRowId).val();
          columnFieldValuePayLab = $('#payLab_' + fieldValue.$$gtRowId).val();
          columnFieldValuePayClaim = $('#payClaim_' + fieldValue.$$gtRowId).val();
          columnFieldValueEffectiveDate = $('#effectiveDate_' + fieldValue.$$gtRowId).find('input').val();
          columnFieldValueExpiredDate = $('#expiredDate_' + fieldValue.$$gtRowId).find('input').val();


          colsArray = [columnFieldValueAdult, columnFieldValueAdultLab, columnFieldValueDep, columnFieldValueDepLab];
          for (var i in colsArray) {
            if (!this.checkCategoryValidation(colsArray[i])) {
              return false;
            }
          }

          this.configObject.data[indexid[0]].adult = parseInt(columnFieldValueAdult);
          this.configObject.data[indexid[0]].adultLab = parseInt(columnFieldValueAdultLab);
          this.configObject.data[indexid[0]].dept = parseInt(columnFieldValueDep);
          this.configObject.data[indexid[0]].deptLab = parseInt(columnFieldValueDepLab);
          this.configObject.data[indexid[0]].effectiveOn = columnFieldValueEffectiveDate != undefined ? this.changeCovCatDateFormat(columnFieldValueEffectiveDate) : '';
          this.configObject.data[indexid[0]].expiredOn = columnFieldValueExpiredDate != undefined ? this.changeCovCatDateFormat(columnFieldValueExpiredDate) : '';
          this.selectedCategoryObjDental = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: false };
          break;
        case 'visionSlug':
          columnFieldValueAdult = $('#adult_' + fieldValue.$$gtRowId).val();
          columnFieldValueDep = $('#dept_' + fieldValue.$$gtRowId).val();
          columnFieldValuecovCoverageTimeFrameKey = $('#covCoverageTimeFrameKey_' + fieldValue.$$gtRowId).val();
          columnFieldValuecoverageTimeFrameKey = $('#coverageTimeFrameKey_' + fieldValue.$$gtRowId).val();
          columnFieldValuePayClaim = $('#payClaim_' + fieldValue.$$gtRowId).val();
          columnFieldValueEffectiveDate = $('#effectiveDate_' + fieldValue.$$gtRowId).find('input').val();
          columnFieldValueExpiredDate = $('#expiredDate_' + fieldValue.$$gtRowId).find('input').val();
          colsArray = [columnFieldValueAdult, columnFieldValueDep];
          for (var i in colsArray) {
            if (!this.checkCategoryValidation(colsArray[i])) {
              return false;
            }
          }

          if (!this.checkCategoryDateValidation(columnFieldValueEffectiveDate, columnFieldValueExpiredDate)) {
            return false;
          }
          this.configObject.data[indexid[0]].adult = parseInt(columnFieldValueAdult);
          this.configObject.data[indexid[0]].dept = parseInt(columnFieldValueDep);
          this.configObject.data[indexid[0]].covCoverageTimeFrameKey = parseInt(columnFieldValuecovCoverageTimeFrameKey);
          this.configObject.data[indexid[0]].coverageTimeFrameKey = parseInt(columnFieldValuecoverageTimeFrameKey);
          this.configObject.data[indexid[0]].effectiveOn = columnFieldValueEffectiveDate != undefined ? this.changeCovCatDateFormat(columnFieldValueEffectiveDate) : '';
          this.configObject.data[indexid[0]].expiredOn = columnFieldValueExpiredDate != undefined ? this.changeCovCatDateFormat(columnFieldValueExpiredDate) : '';
          this.selectedCategoryObjVision = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: false };
          break;
        case 'healthSlug':
          columnFieldValueAdult = $('#adult_' + fieldValue.$$gtRowId).val();
          columnFieldValueDep = $('#dept_' + fieldValue.$$gtRowId).val();
          columnFieldValuePayClaim = $('#payClaim_' + fieldValue.$$gtRowId).val();
          columnFieldValueEffectiveDate = $('#effectiveDate_' + fieldValue.$$gtRowId).find('input').val();
          columnFieldValueExpiredDate = $('#expiredDate_' + fieldValue.$$gtRowId).find('input').val();
          colsArray = [columnFieldValueAdult, columnFieldValueDep];
          for (var i in colsArray) {
            if (!this.checkCategoryValidation(colsArray[i])) {
              return false;
            }
          }

          if (!this.checkCategoryDateValidation(columnFieldValueEffectiveDate, columnFieldValueExpiredDate)) {
            return false;
          }
          this.configObject.data[indexid[0]].adult = parseInt(columnFieldValueAdult);
          this.configObject.data[indexid[0]].dept = parseInt(columnFieldValueDep);
          this.configObject.data[indexid[0]].effectiveOn = columnFieldValueEffectiveDate != undefined ? this.changeCovCatDateFormat(columnFieldValueEffectiveDate) : '';
          this.configObject.data[indexid[0]].expiredOn = columnFieldValueExpiredDate != undefined ? this.changeCovCatDateFormat(columnFieldValueExpiredDate) : '';
          this.selectedCategoryObjHealth = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: false };
          break;
        case 'drugSlug':
          columnFieldValueAdult = $('#adult_' + fieldValue.$$gtRowId).val();
          columnFieldValueDep = $('#dept_' + fieldValue.$$gtRowId).val();
          columnFieldValuePayClaim = $('#payClaim_' + fieldValue.$$gtRowId).val();
          columnFieldValueEffectiveDate = $('#effectiveDate_' + fieldValue.$$gtRowId).find('input').val();
          columnFieldValueExpiredDate = $('#expiredDate_' + fieldValue.$$gtRowId).find('input').val();
          colsArray = [columnFieldValueAdult, columnFieldValueDep];
          for (var i in colsArray) {
            if (!this.checkCategoryValidation(colsArray[i])) {
              return false;
            }
          }

          if (!this.checkCategoryDateValidation(columnFieldValueEffectiveDate, columnFieldValueExpiredDate)) {
            return false;
          }
          this.configObject.data[indexid[0]].adult = parseInt(columnFieldValueAdult);
          this.configObject.data[indexid[0]].dept = parseInt(columnFieldValueDep);
          this.configObject.data[indexid[0]].effectiveOn = columnFieldValueEffectiveDate != undefined ? this.changeCovCatDateFormat(columnFieldValueEffectiveDate) : '';
          this.configObject.data[indexid[0]].expiredOn = columnFieldValueExpiredDate != undefined ? this.changeCovCatDateFormat(columnFieldValueExpiredDate) : '';
          this.selectedCategoryObjDrug = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: false };
          break;
        case 'supplementSlug':
          columnFieldValueEffectiveDate = $('#effectiveDate_' + fieldValue.$$gtRowId).find('input').val();
          columnFieldValueExpiredDate = $('#expiredDate_' + fieldValue.$$gtRowId).find('input').val();

          if (!this.checkCategoryDateValidation(columnFieldValueEffectiveDate, columnFieldValueExpiredDate)) {
            return false;
          }
          this.configObject.data[indexid[0]].effectiveOn = columnFieldValueEffectiveDate != undefined ? this.changeCovCatDateFormat(columnFieldValueEffectiveDate) : '';
          this.configObject.data[indexid[0]].expiredOn = columnFieldValueExpiredDate != undefined ? this.changeCovCatDateFormat(columnFieldValueExpiredDate) : '';
          this.selectedCategoryObjSupplement = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: false };
          break;
        case 'wellnessSlug':
          columnFieldValueAdult = $('#adult_' + fieldValue.$$gtRowId).val();
          columnFieldValuePayClaim = $('#payClaim_' + fieldValue.$$gtRowId).val();
          columnFieldValueEffectiveDate = $('#effectiveDate_' + fieldValue.$$gtRowId).find('input').val();
          columnFieldValueExpiredDate = $('#expiredDate_' + fieldValue.$$gtRowId).find('input').val();

          colsArray = [columnFieldValueAdult,
          ];
          for (var i in colsArray) {
            if (!this.checkCategoryValidation(colsArray[i])) {
              return false;
            }
          }

          if (!this.checkCategoryDateValidation(columnFieldValueEffectiveDate, columnFieldValueExpiredDate)) {
            return false;
          }
          this.configObject.data[indexid[0]].adult = parseInt(columnFieldValueAdult);
          this.configObject.data[indexid[0]].effectiveOn = columnFieldValueEffectiveDate != undefined ? this.changeCovCatDateFormat(columnFieldValueEffectiveDate) : '';
          this.configObject.data[indexid[0]].expiredOn = columnFieldValueExpiredDate != undefined ? this.changeCovCatDateFormat(columnFieldValueExpiredDate) : '';
          this.selectedCategoryObjWellness = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: false };
          break;
      }
      this.myTable.data.exportData[indexid[0]].editMode = false;
      this.editMode = false
      this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);
    } else {
      switch (this.activeBenefit) {
        case 'dentalSlug':
          this.selectedCategoryObjDental = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: true };
          break;
        case 'visionSlug':
          this.selectedCategoryObjVision = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: true };
          break;
        case 'healthSlug':
          this.selectedCategoryObjHealth = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: true };
          break;
        case 'drugSlug':
          this.selectedCategoryObjDrug = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: true };
          break;
        case 'supplementSlug':
          this.selectedCategoryObjSupplement = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: true };
          break;
        case 'wellnessSlug':
          this.selectedCategoryObjWellness = { covCatKey: this.configObject.data[indexid[0]].covCatKey, isSelected: true };
          break;
      }
      this.configObject.data[indexid[0]].editMode = true;
      this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);
    }
  }

  /**
   * Check Validations of benefits category values in inline editing.
   * @param columnFieldValue 
   */
  checkCategoryValidation(columnFieldValue) {
    if (!columnFieldValue) {
      $(".alert-danger").show();
      $(".showError").html("Value should be between 0 - 100");
      return false;
    } else {
      if (columnFieldValue < 0 || columnFieldValue > 100) {
        $(".alert-danger").show();
        $(".showError").html("Value should be between 0 - 100");
        return false;
      } else {
        $(".alert-danger").hide();
        $(".showError").html("");
        return true;
      }
    }
  }

  /**
   * This function is used to compare two dates.
   * @param columnFieldValue 
   */
  checkCategoryDateValidation(effectiveDate, expiryDate) {
    var dateObj = new Array();
    // Verify Effective date is Valid or Not
    if (effectiveDate) {
      dateObj['value'] = effectiveDate;
      var obj = this.changeDateFormatService.changeDateFormat(dateObj);
      if (obj == null) {
        $(".alert-danger").show();
        $(".showError").html("Please Enter Valid Date Effective Date.");
        return false;
      }
    } else if (effectiveDate == "") {
      $(".alert-danger").show();
      $(".showError").html("Effective Date is required.");
      return false;
    }

    // Verify expiry date is Valid or Not
    if (expiryDate) {
      dateObj['value'] = expiryDate;
      var obj = this.changeDateFormatService.changeDateFormat(dateObj);
      if (obj == null) {
        $(".alert-danger").show();
        $(".showError").html("Please Enter Valid Date Expiry Date.");
        return false;
      }
    }

    var categoryEffectiveDate = this.changeDateFormatService.convertStringDateToObject(effectiveDate);

    /** Compare Plan effective date with new effective date */
    if (this.planEffectiveDate && effectiveDate) {
      var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planEffectiveDate);

      var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, categoryEffectiveDate.date);
      if (error.isError == true) {
        $(".alert-danger").show();
        $(".showError").html("Effective Date Can't Be Less Than Plan Effective Date.");
        return false;
      }
    }

    /* This is used to compare effective date with expiry date */
    if (effectiveDate && expiryDate) {
      var categoryExpiryDate = this.changeDateFormatService.convertStringDateToObject(expiryDate);
      var error = this.changeDateFormatService.compareTwoDates(categoryEffectiveDate.date, categoryExpiryDate.date);
      if (error.isError == true) {
        $(".alert-danger").show();
        $(".showError").html("Expiry Date Should Be Greater Than Effective Date.");
        return false;
      }
    }
    $(".alert-danger").hide();
    $(".showError").html("");
    return true;
  }

  /**
   * Return Benefit category history table Action Column html
   * @param fieldValue 
   * @param fieldName 
   */
  printCovCatHistorycolumn(fieldValue) {
    let inputBoxField;
    if (fieldValue.ischecked) {
      if (fieldValue.coverageMaxHist == 'Y') {
        inputBoxField = `<a title="Coverage Maximum Category History" href="javascript:;" class="history-ico" alt="History">
              <i class="fa fa-history" aria-hidden="true"></i>
            </a>`;
      }
    } else {
      inputBoxField = '';
    }
    return inputBoxField;
  }

  /**
   * get coverage category history.
   * @param fieldValue 
   * @param fieldName 
   * @param event 
   */
  covCategoryHistory(fieldValue, fieldName, event) {
    // console.log('In covCategoryHistory');
  }


  /**
   * Get bebefits services list
   * @param categoryID 
   * @param serviceApiUrl 
   * @param benefitCategoryId 
   */
  getBenifitsServices(categoryID, serviceApiUrl, benefitCategoryId) {
    this.showLoader = true;
    this.hmsDataServiceService.postApi(serviceApiUrl, benefitCategoryId).subscribe(data => {
      this.serviceLayerArray.data = [];
      if (data.code == 200 && data.status == 'OK') {
        this.showLoader = false;
        if (data.result.length == 0) {
          switch (categoryID) {
            case 1:
              this.arrDataDental = [];
              break;
            case 2:
              this.arrDataVision = [];
              break;
            case 3:
              this.arrDataHealth = [];
              break;
            case 4:
              this.arrDataDrug = [];
              break;
            case 5:
              this.arrDataSupplement = [];
              break;
            case 6:
              this.arrDataWellness = [];
              break;
          }
        } else {
          data.result.servicesData.forEach(element => {
            this.serviceLayerArray.data.push(element);
          });
          switch (categoryID) {
            case 1:
              this.dentalServiceList = this.serviceLayerArray.data;
              this.arrDataDental = this.dentalServiceList;
              this.serviceLayerDentalBoolean = false;
              break;
            case 2:
              this.visionServiceList = this.serviceLayerArray.data;
              this.arrDataVision = this.visionServiceList
              this.serviceLayerVisionBoolean = false;
              break;
            case 3:
              this.healthServiceList = this.serviceLayerArray.data;
              this.arrDataHealth = this.healthServiceList;
              this.serviceLayerHealthBoolean = false;
              break;
            case 4:
              this.drugServiceList = this.serviceLayerArray.data;
              this.arrDataDrug = this.drugServiceList;
              this.serviceLayerDrugBoolean = false;
              break;
            case 5:
              this.supplementServiceList = this.serviceLayerArray.data;
              this.arrDataSupplement = this.supplementServiceList;
              this.serviceLayerSupplementBoolean = false;
              break;
            case 6:
              this.wellnessServiceList = this.serviceLayerArray.data;
              this.arrDataWellness = this.wellnessServiceList;
              this.serviceLayerWellnessBoolean = false;
              break;
          }
        }
      } else {

        this.showLoader = false;
        switch (categoryID) {
          case 1:
            this.arrDataDental = [];
            break;
          case 2:
            this.arrDataVision = [];
            break;
          case 3:
            this.arrDataHealth = [];
            break;
          case 4:
            this.arrDataDrug = [];
            break;
          case 5:
            this.arrDataSupplement = [];
            break;
          case 6:
            this.arrDataWellness = [];
            break;
        }
      }
    })
  }

  /**
   * Select unselect bebefits category
   * @param row 
   * @param event 
   */
  selectUnSelectCategory(row, event) {
    let self = this
    this.showCoverageMaxHistory(row);
    if (event.target.checked) {

      this.showLoader = true; 

      let serviceApiUrl: any; let benefitCategoryId: any;
      this.DentalCoverageMaxList = [];
      this.VisionCoverageMaxList = [];
      this.HealthCoverageMaxList = [];
      let coverageCat = {};
      row['coverageMax'] = []
      row['servicesData'] = []
      row['data'] = []
      // check for Editing 
      let indexid = row.$$gtRowId.split("_");
      this.configObject.data[indexid[0]].ischecked = true;
      this.configObject.data[indexid[0]].editMode = false;
      this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);

      // check for Editing          
      switch (this.activeBenefit) {
        case 'dentalSlug':
          this.benefitObj.dentalSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyDentalUrl;

          this.updateBenifitsServices('dentalSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.dentalServiceList);
          break;
        case 'visionSlug':
          row.coverageTimeFrameKey = this.timeFrameList[0].coverageTimeframeKey;
          row.covCoverageTimeFrameKey = this.timeFrameList[0].coverageTimeframeKey;

          this.benefitObj.visionSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyVisionUrl


          this.updateBenifitsServices('visionSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.visionServiceList);

          break;
        case 'healthSlug':
          this.benefitObj.healthSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyHealthUrl
          this.updateBenifitsServices('healthSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.healthServiceList);
          break;
        case 'drugSlug':
          this.benefitObj.drugSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyDrugUrl
          this.updateBenifitsServices('drugSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.drugServiceList);

          break;
        case 'supplementSlug':
          this.benefitObj.supplementSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyHsaUrl
          this.updateBenifitsServices('supplementSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.supplementServiceList);

          break;
        case 'wellnessSlug':
          this.benefitObj.wellnessSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyWellnessUrl
          this.updateBenifitsServices('wellnessSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.wellnessServiceList);
          break;
      }
      this.dentalCovrageCategoryID = row.covCatKey;
      let checkProp = true;
      this.configObject.data.map(function (row) {
        if (row.ischecked != true) {
          checkProp = false;
        }
      })
      if (checkProp) {
        $("#select_" + this.currentBenefitId).prop("checked", true);
      }
    } else {
      $("#select_" + this.currentBenefitId).prop("checked", false);
      // not able to add coverage maximum error 
      let lastChecked = 0;
      this.configObject.data.map(function (row) {
        if (row.ischecked == true) {
          lastChecked = row.covCatKey;
        }
      })
      this.dentalCovrageCategoryID = lastChecked;

      // check for Editing 

      let indexid = row.$$gtRowId.split("_");
      this.configObject.data[indexid[0]].ischecked = false;
      this.myTable.data.exportData[indexid[0]].editMode = false;
      this.configObject.data[indexid[0]].editMode = false;
      this.selectedCategoryObjDental = undefined
      this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);
      // check for Editing 
      switch (this.activeBenefit) {
        case 'dentalSlug':
          this.selectedCategoryObjDental = undefined
          let dentalSlugIndex = this.searchValueInArrayReturn(this.benefitObj.dentalSlug.coverageCategory, row.covCatKey);
          this.getAllDentalCoverageMaxList();
          this.benefitObj.dentalSlug.coverageCategory.splice(dentalSlugIndex, 1);
          this.benefitObj.dentalSlug.coverageCategory = this.clearEmpties(this.benefitObj.dentalSlug.coverageCategory);
          this.arrDataDental = this.dentalServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataDental);

          break;
        case 'visionSlug':
          this.selectedCategoryObjVision = undefined
          let visionlSlugIndex = this.searchValueInArrayReturn(this.benefitObj.visionSlug.coverageCategory, row.covCatKey);
          this.getAllDentalCoverageMaxList();
          this.benefitObj.visionSlug.coverageCategory.splice(visionlSlugIndex, 1);
          this.benefitObj.visionSlug.coverageCategory = this.clearEmpties(this.benefitObj.visionSlug.coverageCategory);
          this.arrDataVision = this.visionServiceList;

          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataVision);
          break;
        case 'healthSlug':
          this.selectedCategoryObjHealth = undefined

          let healthSlugIndex = this.searchValueInArrayReturn(this.benefitObj.healthSlug.coverageCategory, row.covCatKey);
          this.getAllDentalCoverageMaxList();
          this.benefitObj.healthSlug.coverageCategory.splice(healthSlugIndex, 1);
          this.benefitObj.healthSlug.coverageCategory = this.clearEmpties(this.benefitObj.healthSlug.coverageCategory);
          this.arrDataHealth = this.healthServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataHealth);

          break;
        case 'drugSlug':
          this.selectedCategoryObjDrug = undefined

          let drugSlugIndex = this.searchValueInArrayReturn(this.benefitObj.drugSlug.coverageCategory, row.covCatKey);
          this.getAllDentalCoverageMaxList();
          this.benefitObj.drugSlug.coverageCategory.splice(drugSlugIndex, 1);
          this.benefitObj.drugSlug.coverageCategory = this.clearEmpties(this.benefitObj.drugSlug.coverageCategory);
          this.arrDataDrug = this.drugServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataDrug);
          break;
        case 'supplementSlug':
          this.selectedCategoryObjSupplement = undefined

          let supplementSlugIndex = this.searchValueInArrayReturn(this.benefitObj.supplementSlug.coverageCategory, row.covCatKey);
          this.getAllDentalCoverageMaxList();
          this.benefitObj.supplementSlug.coverageCategory.splice(supplementSlugIndex, 1);
          this.benefitObj.supplementSlug.coverageCategory = this.clearEmpties(this.benefitObj.supplementSlug.coverageCategory);
          if (this.benefitObj.supplementSlug.coverageCategory.length == 0) {
            this.SupplementalCoverageMaxList = [];
          }
          this.arrDataSupplement = this.supplementServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataSupplement);
          break;
        case 'wellnessSlug':
          this.selectedCategoryObjWellness = undefined

          let wellnessSlugIndex = this.searchValueInArrayReturn(this.benefitObj.wellnessSlug.coverageCategory, row.covCatKey);
          this.getAllDentalCoverageMaxList();
          this.benefitObj.wellnessSlug.coverageCategory.splice(wellnessSlugIndex, 1);
          this.benefitObj.wellnessSlug.coverageCategory = this.clearEmpties(this.benefitObj.wellnessSlug.coverageCategory);
          if (this.benefitObj.wellnessSlug.coverageCategory.length == 0) {
            this.wellnessCoverageMaxList = []
          }
          this.arrDataWellness = this.wellnessServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataWellness);
          break;
      }
    }
  }

  selectUnSelectAllCategory(fieldName, event) {

    // this.onCheckMainCheckbox(event);  //SelectAll issue resolved in Plan

    // if (!event.target.checked) {
    //     if (this.activeBenefit === "dentalSlug") {
    //         this.dentalServiceList.length = 0;
    //     }
    // }
    let self = this;
    self.configObject.data.map(function (row: any) {
      setTimeout(function () {
        if (event.target.checked) {
          if ($('#' + fieldName + '_' + row.$$gtRowId).length > 0) {
            if (!$('#' + fieldName + '_' + row.$$gtRowId).prop('checked')) {
              $('#' + fieldName + '_' + row.$$gtRowId).click()
            }
          }
          else {
            self.alterCheckBox(row)
          }
        } else {
          if ($('#' + fieldName + '_' + row.$$gtRowId).length > 0) {
            if ($('#' + fieldName + '_' + row.$$gtRowId).prop('checked')) {
              $('#' + fieldName + '_' + row.$$gtRowId).click()
            }
          } else {
            self.markunchecked(row)
          }
          if (self.activeBenefit == "dentalSlug") {
            self.dentalServiceList.length = 0
          }
        }
      }, 500);
    });
  }

  markunchecked(row) {
    this.dentalCovrageCategoryID = 0;
    // check for Editing 
    let indexid = row.$$gtRowId.split("_");
    this.configObject.data[indexid[0]].ischecked = false;
    this.myTable.data.exportData[indexid[0]].editMode = false;
    this.configObject.data[indexid[0]].editMode = false;
    this.selectedCategoryObjDental = undefined
    this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);
    // check for Editing 
    switch (this.activeBenefit) {
      case 'dentalSlug':
        this.selectedCategoryObjDental = undefined
        let dentalSlugIndex = this.searchValueInArrayReturn(this.benefitObj.dentalSlug.coverageCategory, row.covCatKey);
        this.getAllDentalCoverageMaxList();
        this.benefitObj.dentalSlug.coverageCategory.splice(dentalSlugIndex, 1);
        this.benefitObj.dentalSlug.coverageCategory = this.clearEmpties(this.benefitObj.dentalSlug.coverageCategory);
        this.arrDataDental = this.dentalServiceList;
        this.removeDiciplineCategoryService(row.covCatKey, this.arrDataDental);
        break;
      case 'visionSlug':
        this.selectedCategoryObjVision = undefined
        let visionlSlugIndex = this.searchValueInArrayReturn(this.benefitObj.visionSlug.coverageCategory, row.covCatKey);
        this.getAllDentalCoverageMaxList();
        this.benefitObj.visionSlug.coverageCategory.splice(visionlSlugIndex, 1);
        this.benefitObj.visionSlug.coverageCategory = this.clearEmpties(this.benefitObj.visionSlug.coverageCategory);
        this.arrDataVision = this.visionServiceList;
        this.removeDiciplineCategoryService(row.covCatKey, this.arrDataVision);
        break;
      case 'healthSlug':
        this.selectedCategoryObjHealth = undefined

        let healthSlugIndex = this.searchValueInArrayReturn(this.benefitObj.healthSlug.coverageCategory, row.covCatKey);
        this.getAllDentalCoverageMaxList();
        this.benefitObj.healthSlug.coverageCategory.splice(healthSlugIndex, 1);
        this.benefitObj.healthSlug.coverageCategory = this.clearEmpties(this.benefitObj.healthSlug.coverageCategory);
        this.arrDataHealth = this.healthServiceList;
        this.removeDiciplineCategoryService(row.covCatKey, this.arrDataHealth);

        break;
      case 'drugSlug':
        this.selectedCategoryObjDrug = undefined

        let drugSlugIndex = this.searchValueInArrayReturn(this.benefitObj.drugSlug.coverageCategory, row.covCatKey);
        this.getAllDentalCoverageMaxList();
        this.benefitObj.drugSlug.coverageCategory.splice(drugSlugIndex, 1);
        this.benefitObj.drugSlug.coverageCategory = this.clearEmpties(this.benefitObj.drugSlug.coverageCategory);
        this.arrDataDrug = this.drugServiceList;
        this.removeDiciplineCategoryService(row.covCatKey, this.arrDataDrug);
        break;
      case 'supplementSlug':
        this.selectedCategoryObjSupplement = undefined

        let supplementSlugIndex = this.searchValueInArrayReturn(this.benefitObj.supplementSlug.coverageCategory, row.covCatKey);
        this.getAllDentalCoverageMaxList();
        this.benefitObj.supplementSlug.coverageCategory.splice(supplementSlugIndex, 1);
        this.benefitObj.supplementSlug.coverageCategory = this.clearEmpties(this.benefitObj.supplementSlug.coverageCategory);
        if (this.benefitObj.supplementSlug.coverageCategory.length == 0) {
          this.SupplementalCoverageMaxList = [];
        }
        this.arrDataSupplement = this.supplementServiceList;
        this.removeDiciplineCategoryService(row.covCatKey, this.arrDataSupplement);
        break;
      case 'wellnessSlug':
        this.selectedCategoryObjWellness = undefined

        let wellnessSlugIndex = this.searchValueInArrayReturn(this.benefitObj.wellnessSlug.coverageCategory, row.covCatKey);
        this.getAllDentalCoverageMaxList();
        this.benefitObj.wellnessSlug.coverageCategory.splice(wellnessSlugIndex, 1);
        this.benefitObj.wellnessSlug.coverageCategory = this.clearEmpties(this.benefitObj.wellnessSlug.coverageCategory);
        if (this.benefitObj.wellnessSlug.coverageCategory.length == 0) {
          this.wellnessCoverageMaxList = []
        }
        this.arrDataWellness = this.wellnessServiceList;
        this.removeDiciplineCategoryService(row.covCatKey, this.arrDataWellness);
        break;
    }
  }
  alterCheckBox(row) {
    let serviceApiUrl: any; let benefitCategoryId: any;
    this.DentalCoverageMaxList = [];
    this.VisionCoverageMaxList = [];
    this.HealthCoverageMaxList = [];
    let coverageCat = {};
    row['coverageMax'] = []
    row['servicesData'] = []
    row['data'] = []
    // check for Editing 
    let indexid = row.$$gtRowId.split("_");
    this.configObject.data[indexid[0]].ischecked = true;
    this.configObject.data[indexid[0]].editMode = false;
    this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);

    // check for Editing          
    switch (this.activeBenefit) {
      case 'dentalSlug':
        this.benefitObj.dentalSlug.coverageCategory.push(row);
        serviceApiUrl = PlanApi.getServicesByCovKeyDentalUrl;

        this.updateBenifitsServices('dentalSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.dentalServiceList);
        break;
      case 'visionSlug':
        row.coverageTimeFrameKey = this.timeFrameList[0].coverageTimeframeKey;
        row.covCoverageTimeFrameKey = this.timeFrameList[0].coverageTimeframeKey;

        this.benefitObj.visionSlug.coverageCategory.push(row);
        serviceApiUrl = PlanApi.getServicesByCovKeyVisionUrl


        this.updateBenifitsServices('visionSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.visionServiceList);

        break;
      case 'healthSlug':
        this.benefitObj.healthSlug.coverageCategory.push(row);
        serviceApiUrl = PlanApi.getServicesByCovKeyHealthUrl
        this.updateBenifitsServices('healthSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.healthServiceList);
        break;
      case 'drugSlug':
        this.benefitObj.drugSlug.coverageCategory.push(row);
        serviceApiUrl = PlanApi.getServicesByCovKeyDrugUrl
        this.updateBenifitsServices('drugSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.drugServiceList);

        break;
      case 'supplementSlug':
        this.benefitObj.supplementSlug.coverageCategory.push(row);
        serviceApiUrl = PlanApi.getServicesByCovKeyHsaUrl
        this.updateBenifitsServices('supplementSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.supplementServiceList);

        break;
      case 'wellnessSlug':
        this.benefitObj.wellnessSlug.coverageCategory.push(row);
        serviceApiUrl = PlanApi.getServicesByCovKeyWellnessUrl
        this.updateBenifitsServices('wellnessSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.wellnessServiceList);
        break;
    }
    this.dentalCovrageCategoryID = row.covCatKey;
    let checkProp = true;
    this.configObject.data.map(function (row) {
      if (row.ischecked != true) {
        checkProp = false;
      }
    })
  }


  /**
   * Update Benefits services on select unselect bebefits category
   * @param benefitType 
   * @param serviceApiUrl 
   * @param benefitCategoryId 
   * @param oldServiceList 
   */
  updateBenifitsServices(benefitType, row, serviceApiUrl, benefitCategoryId, oldServiceList) {
    let  examptValues = ["supplementSlug", "wellnessSlug"];

    this.hmsDataServiceService.postApi(serviceApiUrl, benefitCategoryId).subscribe(resultData => {
      if (resultData.code == 200 && resultData.status == 'OK') {
        let indexValue = examptValues.includes(benefitType)
        if (resultData.result.length == 0 && !indexValue) {
          let indexid = row.$$gtRowId.split("_");
          this.configObject.data[indexid[0]].ischecked = false;
          this.configObject.data[indexid[0]].editMode = false;
          this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);

          this.showLoader = false; // Hide Loader
          $('#mainCheckbox_' + row.$$gtRowId).click();
          this.toastr.error('Please select another coverage category. Services are not available for this category!');
        } else {
          this.showLoader = false; // Hide Loader

          // Supplement Check added for log 908 data can be empty
          if (!indexValue) {
            if (resultData.result.servicesData.length == 0) {
              $('#mainCheckbox_' + row.$$gtRowId).click();
              this.toastr.error('Please select another coverage category. Services are not available for this category!');
              return false
            }
          }

          switch (benefitType) {
            case 'dentalSlug':
              if (!this.serviceLayerDentalBoolean) {
                oldServiceList = [];
                this.serviceLayerDentalBoolean = true;
              }
              this.dentalServiceList = oldServiceList;
              for (var n in resultData.result.servicesData) {
                if (resultData.result.servicesData[n].data.level == 0) {
                  this.selectedDentalNode.push(resultData.result.servicesData[n].data);
                  if (resultData.result.servicesData[n].children.length > 0) {
                    for (var k in resultData.result.servicesData[n].children) {
                      this.selectedDentalNode.push(resultData.result.servicesData[n].children[k].data);
                      if (resultData.result.servicesData[n].children[k].children.length > 0) {
                        for (var j in resultData.result.servicesData[n].children[k].children) {
                          this.selectedDentalNode.push(resultData.result.servicesData[n].children[k].children[j].data);

                          /**New Code Level 4,5 */
                          if (resultData.result.servicesData[n].children[k].children[j].children.length > 0) {
                            for (var m in resultData.result.servicesData[n].children[k].children[j].children) {
                              this.selectedDentalNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].data);

                              if (resultData.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                for (var s in resultData.result.servicesData[n].children[k].children[j].children[m].children) {
                                  this.selectedDentalNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                }
                              }
                            }
                          }
                          /**New Code Level 4,5 */
                        }
                      }
                    }
                  }
                }
                this.dentalServiceList.push(resultData.result.servicesData[n]);
              }
              this.arrDataDental = this.dentalServiceList;
              this.savebenefitsServices();
              break;
            case 'visionSlug':
              if (!this.serviceLayerVisionBoolean) {
                oldServiceList = [];
                this.serviceLayerVisionBoolean = true;
              }
              this.visionServiceList = oldServiceList;
              for (var n in resultData.result.servicesData) {
                if (resultData.result.servicesData[n].data.level == 0) {
                  this.selectedVisionNode.push(resultData.result.servicesData[n].data);
                  if (resultData.result.servicesData[n].children.length > 0) {
                    for (var k in resultData.result.servicesData[n].children) {
                      this.selectedVisionNode.push(resultData.result.servicesData[n].children[k].data);
                      if (resultData.result.servicesData[n].children[k].children.length > 0) {
                        for (var j in resultData.result.servicesData[n].children[k].children) {
                          this.selectedVisionNode.push(resultData.result.servicesData[n].children[k].children[j].data);
                          /**New Code Level 4,5 */
                          if (resultData.result.servicesData[n].children[k].children[j].children.length > 0) {
                            for (var m in resultData.result.servicesData[n].children[k].children[j].children) {
                              this.selectedVisionNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].data);

                              if (resultData.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                for (var s in resultData.result.servicesData[n].children[k].children[j].children[m].children) {
                                  this.selectedVisionNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                }
                              }
                            }
                          }
                          /**New Code Level 4,5 */
                        }
                      }
                    }
                  }
                }
                this.visionServiceList.push(resultData.result.servicesData[n]);
              }
              this.arrDataVision = this.visionServiceList
              this.savebenefitsServices();
              break;
            case 'healthSlug':
              if (!this.serviceLayerHealthBoolean) {
                oldServiceList = [];
                this.serviceLayerHealthBoolean = true;
              }
              this.healthServiceList = oldServiceList;
              for (var n in resultData.result.servicesData) {
                if (resultData.result.servicesData[n].data.level == 0) {
                  this.selectedHealthNode.push(resultData.result.servicesData[n].data);
                  if (resultData.result.servicesData[n].children.length > 0) {
                    for (var k in resultData.result.servicesData[n].children) {
                      this.selectedHealthNode.push(resultData.result.servicesData[n].children[k].data);
                      if (resultData.result.servicesData[n].children[k].children.length > 0) {
                        for (var j in resultData.result.servicesData[n].children[k].children) {
                          this.selectedHealthNode.push(resultData.result.servicesData[n].children[k].children[j].data);
                          /**New Code Level 4,5 */
                          if (resultData.result.servicesData[n].children[k].children[j].children.length > 0) {
                            for (var m in resultData.result.servicesData[n].children[k].children[j].children) {
                              this.selectedHealthNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].data);

                              if (resultData.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                for (var s in resultData.result.servicesData[n].children[k].children[j].children[m].children) {
                                  this.selectedHealthNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                }
                              }
                            }
                          }
                          /**New Code Level 4,5 */
                        }
                      }
                    }
                  }
                }
                this.healthServiceList.push(resultData.result.servicesData[n]);
              }
              this.arrDataHealth = this.healthServiceList;
              this.savebenefitsServices();
              break;
            case 'drugSlug':
              if (!this.serviceLayerDrugBoolean) {
                oldServiceList = [];
                this.serviceLayerDrugBoolean = true;
              }
              this.drugServiceList = oldServiceList;
              for (var n in resultData.result.servicesData) {
                if (resultData.result.servicesData[n].data.level == 0) {
                  this.selectedDrugNode.push(resultData.result.servicesData[n].data);
                  if (resultData.result.servicesData[n].children.length > 0) {
                    for (var k in resultData.result.servicesData[n].children) {
                      this.selectedDrugNode.push(resultData.result.servicesData[n].children[k].data);
                      if (resultData.result.servicesData[n].children[k].children.length > 0) {
                        for (var j in resultData.result.servicesData[n].children[k].children) {
                          this.selectedDrugNode.push(resultData.result.servicesData[n].children[k].children[j].data);
                          /**New Code Level 4,5 */
                          if (resultData.result.servicesData[n].children[k].children[j].children.length > 0) {
                            for (var m in resultData.result.servicesData[n].children[k].children[j].children) {
                              this.selectedDrugNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].data);

                              if (resultData.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                for (var s in resultData.result.servicesData[n].children[k].children[j].children[m].children) {
                                  this.selectedDrugNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                }
                              }
                            }
                          }
                          /**New Code Level 4,5 */
                        }
                      }
                    }
                  }
                }
                this.drugServiceList.push(resultData.result.servicesData[n]);
              }
              this.arrDataDrug = this.drugServiceList;
              this.savebenefitsServices();
              break;
            case 'supplementSlug':
              if (!this.serviceLayerSupplementBoolean) {
                oldServiceList = [];
                this.serviceLayerSupplementBoolean = true;
              }
              this.supplementServiceList = oldServiceList;
              for (var n in resultData.result.servicesData) {
                if (resultData.result.servicesData[n].data.level == 0) {
                  this.selectedSupplementNode.push(resultData.result.servicesData[n].data);
                  if (resultData.result.servicesData[n].children.length > 0) {
                    for (var k in resultData.result.servicesData[n].children) {
                      this.selectedSupplementNode.push(resultData.result.servicesData[n].children[k].data);
                      if (resultData.result.servicesData[n].children[k].children.length > 0) {
                        for (var j in resultData.result.servicesData[n].children[k].children) {
                          this.selectedSupplementNode.push(resultData.result.servicesData[n].children[k].children[j].data);
                          /**New Code Level 4,5 */
                          if (resultData.result.servicesData[n].children[k].children[j].children.length > 0) {
                            for (var m in resultData.result.servicesData[n].children[k].children[j].children) {
                              this.selectedSupplementNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].data);

                              if (resultData.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                for (var s in resultData.result.servicesData[n].children[k].children[j].children[m].children) {
                                  this.selectedSupplementNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                }
                              }
                            }
                          }
                          /**New Code Level 4,5 */
                        }
                      }
                    }
                  }
                }
                this.supplementServiceList.push(resultData.result.servicesData[n]);
              }
              this.arrDataSupplement = this.supplementServiceList;
              this.savebenefitsServices();
              break;
            case 'wellnessSlug':
              if (!this.serviceLayerWellnessBoolean) {
                oldServiceList = [];
                this.serviceLayerWellnessBoolean = true;
              }
              this.wellnessServiceList = oldServiceList;
              for (var n in resultData.result.servicesData) {
                if (resultData.result.servicesData[n].data.level == 0) {
                  this.selectedWellnessNode.push(resultData.result.servicesData[n].data);
                  if (resultData.result.servicesData[n].children.length > 0) {
                    for (var k in resultData.result.servicesData[n].children) {
                      this.selectedWellnessNode.push(resultData.result.servicesData[n].children[k].data);
                      if (resultData.result.servicesData[n].children[k].children.length > 0) {
                        for (var j in resultData.result.servicesData[n].children[k].children) {
                          this.selectedWellnessNode.push(resultData.result.servicesData[n].children[k].children[j].data);
                          /**New Code Level 4,5 */
                          if (resultData.result.servicesData[n].children[k].children[j].children.length > 0) {
                            for (var m in resultData.result.servicesData[n].children[k].children[j].children) {
                              this.selectedWellnessNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].data);

                              if (resultData.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                for (var s in resultData.result.servicesData[n].children[k].children[j].children[m].children) {
                                  this.selectedWellnessNode.push(resultData.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                }
                              }
                            }
                          }
                          /**New Code Level 4,5 */
                        }
                      }
                    }
                  }
                }
                this.wellnessServiceList.push(resultData.result.servicesData[n]);
              }
              this.arrDataWellness = this.wellnessServiceList;
              this.savebenefitsServices();
              break;
          }
        }

      } else if (resultData.code == 400 && resultData.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
        let indexid = row.$$gtRowId.split("_");
        this.configObject.data[indexid[0]].ischecked = false;
        this.configObject.data[indexid[0]].editMode = false;
        this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);

        this.showLoader = false; // Hide Loader
        $('#mainCheckbox_' + row.$$gtRowId).click();
        this.toastr.error('Please select another coverage category. Services are not available for this category!');
      }
    })
  }

  /**
   * Remove benefit category services
   * @param categoryID 
   * @param ServiceList 
   */
  removeDiciplineCategoryService(categoryID, ServiceList) {
    var removeIndex: any = [];
    for (var i in ServiceList) {
      if (ServiceList[i].data.covCatKey == categoryID) {
        removeIndex.push(i);
      }
    }
    if (removeIndex.length > 0) {
      ServiceList.splice(removeIndex[0], removeIndex.length);
    }
  }

  /**
   * Remove selected Benefits from benefit object
   * @param categoryId 
   */
  removeBebefitList(categoryId) {
    for (let i in this.selectedBenefitsList) {
      if (this.selectedBenefitsList[i].id == categoryId) {
        this.selectedBenefitsList.splice(parseInt(i), 1);
        this.selectedBenefitsList.sort((function (a, b) {
          return a.id - b.id
        }));
      }
    }
    if (this.selectedBenefitsList.length > 0) {
      this.currentBenefitId = this.selectedBenefitsList[0].id;
      if (this.currentBenefitId == 1) {
        this.activeBenefit = 'dentalSlug';
        this.dentalCovrageCategoryID = 0;
        this.getAllDentalCoverageMaxList();
        this.genericDataTableInit(this.dentalCoverageCategoryList)
      } else if (this.currentBenefitId == 2) {
        this.activeBenefit = 'visionSlug';
        this.dentalCovrageCategoryID = 0;
        this.getAllDentalCoverageMaxList();
        this.genericDataTableInit(this.visionCoverageCategoryList)
      } else if (this.currentBenefitId == 3) {
        this.activeBenefit = 'healthSlug';
        this.dentalCovrageCategoryID = 0;
        this.getAllDentalCoverageMaxList();
        this.genericDataTableInit(this.healthCoverageCategoryList)
      } else if (this.currentBenefitId == 4) {
        this.activeBenefit = 'drugSlug';
        this.dentalCovrageCategoryID = 0;
        this.getAllDentalCoverageMaxList();
        this.genericDataTableInit(this.drugCoverageCategoryList)
      } else if (this.currentBenefitId == 5) {
        this.activeBenefit = 'supplementSlug';
        this.dentalCovrageCategoryID = 0;
        this.getAllDentalCoverageMaxList();
        this.genericDataTableInit(this.supplementCoverageCategoryList)
      } else if (this.currentBenefitId == 6) {
        this.activeBenefit = 'wellnessSlug';
        this.dentalCovrageCategoryID = 0;
        this.getAllDentalCoverageMaxList();
        this.genericDataTableInit(this.wellnessCoverageCategoryList)
      }
    }
  }

  /**
   * Call When Coverage Category Row Clicked
   * @param row 
   * @param event 
   */
  selectedRow(row, event) {
    switch (this.activeBenefit) {
      case 'dentalSlug':
        if (this.searchValueInArray(this.benefitObj.dentalSlug.coverageCategory, row.covCatKey)) {
          this.dentalCovrageCategoryID = row.covCatKey;
          this.getAllDentalCoverageMaxList();
        }
        break;
      case 'visionSlug':
        if (this.searchValueInArray(this.benefitObj.visionSlug.coverageCategory, row.covCatKey)) {
          this.dentalCovrageCategoryID = row.covCatKey;
          this.getAllDentalCoverageMaxList();
        }
        break;
      case 'healthSlug':
        if (this.searchValueInArray(this.benefitObj.healthSlug.coverageCategory, row.covCatKey)) {
          this.dentalCovrageCategoryID = row.covCatKey;
          this.getAllDentalCoverageMaxList();
        }
        break;
      case 'drugSlug':
        if (this.searchValueInArray(this.benefitObj.drugSlug.coverageCategory, row.covCatKey)) {
          this.dentalCovrageCategoryID = row.covCatKey;
          this.getAllDentalCoverageMaxList();
        }
        break;
      case 'supplementSlug':
        if (this.searchValueInArray(this.benefitObj.supplementSlug.coverageCategory, row.covCatKey)) {
          this.dentalCovrageCategoryID = row.covCatKey;
          this.getAllDentalCoverageMaxList();
        }
        break;
      case 'wellnessSlug':
        if (this.searchValueInArray(this.benefitObj.wellnessSlug.coverageCategory, row.covCatKey)) {
          this.dentalCovrageCategoryID = row.covCatKey;
          this.getAllDentalCoverageMaxList();
        }
        break;
    }
  }

  /**
   * show / hide coverage maximum history icon 
   * @param row 
   */
  showCoverageMaxHistory(row) {
    if (this.editPlanMode) {
      if (row.coverageMaxHist != null) {
        if (row.coverageMaxHist == 'Y') {
          this.showCovMaxHistoryIcon = true;
        } else if (row.coverageMaxHist == 'N') {
          this.showCovMaxHistoryIcon = false;
        }
      } else {
        this.showCovMaxHistoryIcon = false;
      }
    }
  }

  /**
   * Serach Value In Array
   * @param benifitObject 
   * @param arrayValue 
   */
  searchValueInArray(benifitObject, arrayValue) {
    let obj = benifitObject.find(x => {
      if (x != undefined && x.covCatKey === arrayValue) {
        return true;
      } else {
        return false;
      }
    });
    return obj;
  }

  /**
   * Get Coverage Max List for Selected Coverage Category
   */
  getAllDentalCoverageMaxList() {
    if (this.dentalCovrageCategoryID > 0) {
      switch (this.activeBenefit) {

        case 'dentalSlug':
          let dentalIndexId = this.searchValueInArrayReturn(this.benefitObj.dentalSlug.coverageCategory, this.dentalCovrageCategoryID);
          this.DentalCoverageMaxList = this.benefitObj.dentalSlug.coverageCategory[dentalIndexId].coverageMax;
          var dateCols = ['effectiveOn', 'expiredOn'];

          break;
        case 'visionSlug':
          let visionIndexId = this.searchValueInArrayReturn(this.benefitObj.visionSlug.coverageCategory, this.dentalCovrageCategoryID);
          this.VisionCoverageMaxList = this.benefitObj.visionSlug.coverageCategory[visionIndexId].coverageMax;
          break;
        case 'healthSlug':
          let healthIndexId = this.searchValueInArrayReturn(this.benefitObj.healthSlug.coverageCategory, this.dentalCovrageCategoryID);
          this.HealthCoverageMaxList = this.benefitObj.healthSlug.coverageCategory[healthIndexId].coverageMax;
          break;
        case 'drugSlug':
          let drugIndexId = this.searchValueInArrayReturn(this.benefitObj.drugSlug.coverageCategory, this.dentalCovrageCategoryID);
          this.DentalCoverageMaxList = this.benefitObj.drugSlug.coverageCategory[drugIndexId].coverageMax;
          break;
        case 'supplementSlug':
          let supplementIndexId = this.searchValueInArrayReturn(this.benefitObj.supplementSlug.coverageCategory, this.dentalCovrageCategoryID);
          this.DentalCoverageMaxList = this.benefitObj.supplementSlug.coverageCategory[supplementIndexId].coverageMax;
          break;
        case 'wellnessSlug':
          let wellnessIndexId = this.searchValueInArrayReturn(this.benefitObj.wellnessSlug.coverageCategory, this.dentalCovrageCategoryID);
          this.DentalCoverageMaxList = this.benefitObj.wellnessSlug.coverageCategory[wellnessIndexId].coverageMax;
          var dateCols = ['effectiveOn', 'expiredOn'];
          break;
      }
    } else {
      this.DentalCoverageMaxList = [];
      this.VisionCoverageMaxList = [];
      this.HealthCoverageMaxList = [];
    }

  }

  /**
   * Show Hide Benefits tabs
   * @param tabId 
   */
  showHideTabs(tabId: number) {
    this.showCovMaxHistoryIcon = false;
    this.currentBenefitId = tabId;
    this.removeActiveClassOnChangeBebefit();
    if (tabId == 1) {
      this.activeBenefit = 'dentalSlug';
      this.dentalCovrageCategoryID = 0;
      this.getAllDentalCoverageMaxList(); // get dental coveragemax
      this.genericDataTableInit(this.dentalCoverageCategoryList) // update dental categoryList
      if (this.hideGoToPage) {
        this.myTable.goToPage(1)
      }
      this.hideGoToPage = true;
    } else if (tabId == 2) {
      this.activeBenefit = 'visionSlug';
      this.dentalCovrageCategoryID = 0;
      this.getAllDentalCoverageMaxList(); // get vision coveragemax
      this.genericDataTableInit(this.visionCoverageCategoryList) // update vision categoryList
      if (this.hideGoToPage) {
        this.myTable.goToPage(1)
      }
      this.hideGoToPage = true;
      this.arrData = this.visionServiceList; // update vision ServiceList
    } else if (tabId == 3) {
      this.activeBenefit = 'healthSlug';
      this.dentalCovrageCategoryID = 0;
      this.getAllDentalCoverageMaxList(); // get health coveragemax
      this.genericDataTableInit(this.healthCoverageCategoryList) // update health categoryList
      if (this.hideGoToPage) {
        this.myTable.goToPage(1)
      }
      this.hideGoToPage = true;
      this.arrDataHealth = this.healthServiceList; // update health ServiceList
    } else if (tabId == 4) {
      this.activeBenefit = 'drugSlug';
      this.dentalCovrageCategoryID = 0;
      this.getAllDentalCoverageMaxList(); // get drug coveragemax
      this.genericDataTableInit(this.drugCoverageCategoryList) // update drug categoryList
      if (this.hideGoToPage) {
        this.myTable.goToPage(1)
      }
      this.hideGoToPage = true;
      this.arrDataDrug = this.drugServiceList; // update drug ServiceList
    } else if (tabId == 5) {
      this.activeBenefit = 'supplementSlug';
      this.dentalCovrageCategoryID = 0;
      this.getAllDentalCoverageMaxList(); // get supplement coveragemax
      this.genericDataTableInit(this.supplementCoverageCategoryList) // update supplement categoryList
      if (this.hideGoToPage) {
        this.myTable.goToPage(1)
      }
      this.hideGoToPage = true;
      this.arrDataSupplement = this.supplementServiceList; // update supplement ServiceList
    } else if (tabId == 6) {
      this.activeBenefit = 'wellnessSlug';
      this.dentalCovrageCategoryID = 0;
      this.getAllDentalCoverageMaxList(); // get wellness coveragemax
      this.genericDataTableInit(this.wellnessCoverageCategoryList) // update wellness categoryList
      if (this.hideGoToPage) {
        this.myTable.goToPage(1)
      }
      //this.myTable.goToPage(1)
      this.hideGoToPage = true;
      this.arrDataWellness = this.wellnessServiceList; // update wellness ServiceList
    }
  }

  /**
   * Serach Value In Array
   * @param benifitObject 
   * @param arrayValue 
   */
  searchValueInArrayReturn(benifitObject, arrayValue) {
    return benifitObject.findIndex(x => x.covCatKey === arrayValue);
  }

  clearEmpties(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    return newArray;
  }

  /**
   * Set Node Selection. We push Selected Node in selectedNode array.
   * @param node - Current Selected Node
   * @param isSelected  - Current Selected Node Selected or Unselected
   */
  setNodeSelectedFirst(node, isSelected, slug) {
    let promise = new Promise((resolve, reject) => {
      this.setNodeSelected(node, isSelected, slug);
      resolve();
    }).then(res => {
      this.savebenefitsServices();
    });

  }

  /**
   * Select Benefit Services
   * @param node 
   * @param isSelected 
   * @param slug 
   */
  setNodeSelected(node, isSelected, slug) {
    if (this.editPlanMode) {
      this.selectedDentalNode = this.selectedDentalArray
    }
    if (isSelected) {
      switch (slug) {
        case 'dental':
          if (!this.searchInServiceArray(this.selectedDentalNode, node.data.serviceKey, node.data.covCatKey)) {
            node.data.included = 'T';
            node.data.isPartial = true;
            this.selectedDentalNode.push(node.data);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = true;
              node.children[i].data.included = 'T';
              node.children[i].data.isPartial = true;
              if (!this.searchInServiceArray(this.selectedDentalNode, node.data.serviceKey, node.data.covCatKey)) {
                this.selectedDentalNode.push(node.children[i].data);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;
        case 'vision':
          if (!this.searchInServiceArray(this.selectedVisionNode, node.data.serviceKey, node.data.covCatKey)) {
            node.data.included = 'T';
            node.data.isPartial = true;
            this.selectedVisionNode.push(node.data);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = true;
              node.children[i].data.included = 'T';
              node.children[i].data.isPartial = true;
              if (!this.searchInServiceArray(this.selectedVisionNode, node.data.serviceKey, node.data.covCatKey)) {
                this.selectedVisionNode.push(node.children[i].data);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;
        case 'health':
          if (!this.searchInServiceArray(this.selectedHealthNode, node.data.serviceKey, node.data.covCatKey)) {
            node.data.included = 'T';
            node.data.isPartial = true;
            this.selectedHealthNode.push(node.data);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = true;
              node.children[i].data.included = 'T';
              node.children[i].data.isPartial = true;
              if (!this.searchInServiceArray(this.selectedHealthNode, node.data.serviceKey, node.data.covCatKey)) {
                this.selectedHealthNode.push(node.children[i].data);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;
        case 'drug':
          if (!this.searchInServiceArray(this.selectedDrugNode, node.data.serviceKey, node.data.covCatKey)) {
            node.data.included = 'T';
            node.data.isPartial = true;
            this.selectedDrugNode.push(node.data);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = true;
              node.children[i].data.included = 'T';
              node.children[i].data.isPartial = true;
              if (!this.searchInServiceArray(this.selectedDrugNode, node.data.serviceKey, node.data.covCatKey)) {
                this.selectedDrugNode.push(node.children[i].data);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;
        case 'supplement':
          if (!this.searchInServiceArray(this.selectedSupplementNode, node.data.serviceKey, node.data.covCatKey)) {
            node.data.included = 'T';
            node.data.isPartial = true;
            this.selectedSupplementNode.push(node.data);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = true;
              node.children[i].data.included = 'T';
              node.children[i].data.isPartial = true;
              if (!this.searchInServiceArray(this.selectedSupplementNode, node.data.serviceKey, node.data.covCatKey)) {
                this.selectedSupplementNode.push(node.children[i].data);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;
        case 'wellness':
          if (!this.searchInServiceArray(this.selectedWellnessNode, node.data.serviceKey, node.data.covCatKey)) {
            node.data.included = 'T';
            node.data.isPartial = true;
            this.selectedWellnessNode.push(node.data);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = true;
              node.children[i].data.included = 'T';
              node.children[i].data.isPartial = true;
              if (!this.searchInServiceArray(this.selectedWellnessNode, node.data.serviceKey, node.data.covCatKey)) {
                this.selectedWellnessNode.push(node.children[i].data);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;
      }
    } else {
      switch (slug) {
        case 'dental':
          if (this.searchInServiceArray(this.selectedDentalNode, node.data.serviceKey, node.data.covCatKey)) {
            var idx = this.selectedDentalNode.findIndex(x => x.serviceKey === node.data.serviceKey && x.covCatKey === node.data.covCatKey);
            node.data.included = 'F';
            node.data.isPartial = false;
            this.selectedDentalNode.splice(idx, 1);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = false;
              node.children[i].data.included = 'F';
              node.children[i].data.isPartial = false;
              if (this.searchInServiceArray(this.selectedDentalNode, node.children[i].data)) {
                var idx = this.selectedDentalNode.findIndex(x => x.serviceKey === node.children[i].data);
                this.selectedDentalNode.splice(idx, 1);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;

        case 'vision':
          if (this.searchInServiceArray(this.selectedVisionNode, node.data.serviceKey, node.data.covCatKey)) {
            var idx = this.selectedVisionNode.findIndex(x => x.serviceKey === node.data.serviceKey && x.covCatKey === node.data.covCatKey);
            node.data.included = 'F';
            node.data.isPartial = false;
            this.selectedVisionNode.splice(idx, 1);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = false;
              node.children[i].data.included = 'F';
              node.children[i].data.isPartial = false;
              if (this.searchInServiceArray(this.selectedVisionNode, node.children[i].data)) {
                var idx = this.selectedVisionNode.findIndex(x => x.serviceKey === node.children[i].data);
                this.selectedVisionNode.splice(idx, 1);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;

        case 'health':
          if (this.searchInServiceArray(this.selectedHealthNode, node.data.serviceKey, node.data.covCatKey)) {
            var idx = this.selectedHealthNode.findIndex(x => x.serviceKey === node.data.serviceKey && x.covCatKey === node.data.covCatKey);
            node.data.included = 'F';
            node.data.isPartial = false;
            this.selectedHealthNode.splice(idx, 1);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = false;
              node.children[i].data.included = 'F';
              node.children[i].data.isPartial = false;
              if (this.searchInServiceArray(this.selectedHealthNode, node.children[i].data)) {
                var idx = this.selectedHealthNode.findIndex(x => x.serviceKey === node.children[i].data);
                this.selectedHealthNode.splice(idx, 1);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }

          break;
        case 'drug':
          if (this.searchInServiceArray(this.selectedDrugNode, node.data.serviceKey, node.data.covCatKey)) {
            var idx = this.selectedDrugNode.findIndex(x => x.serviceKey === node.data.serviceKey && x.covCatKey === node.data.covCatKey);
            node.data.included = 'F';
            node.data.isPartial = false;
            this.selectedDrugNode.splice(idx, 1);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = false;
              node.children[i].data.included = 'F';
              node.children[i].data.isPartial = false;
              if (this.searchInServiceArray(this.selectedDrugNode, node.children[i].data)) {
                var idx = this.selectedDrugNode.findIndex(x => x.serviceKey === node.children[i].data);
                this.selectedDrugNode.splice(idx, 1);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;

        case 'supplement':
          if (this.searchInServiceArray(this.selectedSupplementNode, node.data.serviceKey, node.data.covCatKey)) {
            var idx = this.selectedSupplementNode.findIndex(x => x.serviceKey === node.data.serviceKey && x.covCatKey === node.data.covCatKey);
            node.data.included = 'F';
            node.data.isPartial = false;
            this.selectedSupplementNode.splice(idx, 1);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = false;
              node.children[i].data.included = 'F';
              node.children[i].data.isPartial = false;
              if (this.searchInServiceArray(this.selectedSupplementNode, node.children[i].data)) {
                var idx = this.selectedSupplementNode.findIndex(x => x.serviceKey === node.children[i].data);
                this.selectedSupplementNode.splice(idx, 1);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;

        case 'wellness':
          if (this.searchInServiceArray(this.selectedWellnessNode, node.data.serviceKey, node.data.covCatKey)) {
            var idx = this.selectedWellnessNode.findIndex(x => x.serviceKey === node.data.serviceKey && x.covCatKey === node.data.covCatKey);
            node.data.included = 'F';
            node.data.isPartial = false;
            this.selectedWellnessNode.splice(idx, 1);
          }
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              node.children[i].data.isSelected = false;
              node.children[i].data.included = 'F';
              node.children[i].data.isPartial = false;
              if (this.searchInServiceArray(this.selectedWellnessNode, node.children[i].data)) {
                var idx = this.selectedWellnessNode.findIndex(x => x.serviceKey === node.children[i].data);
                this.selectedWellnessNode.splice(idx, 1);
              }
              this.setNodeSelected(node.children[i], isSelected, slug);
            }
          }
          break;
      }
    }
  }

  /**
   * Add Benefit Services to benefit category
   */
  savebenefitsServices() {
    switch (this.activeBenefit) {
      case 'dentalSlug':
        if (this.editPlanMode) {
          this.selectedDentalNode = this.selectedDentalArray
        }
        for (var k in this.benefitObj.dentalSlug.coverageCategory) {
          this.benefitObj.dentalSlug.coverageCategory[k].data = [];
        }
        if (this.selectedDentalNode.length > 0) {
          for (var n in this.selectedDentalNode) {
            let nodeCatKey = this.selectedDentalNode[n].covCatKey;
            for (var k in this.benefitObj.dentalSlug.coverageCategory) {
              if (nodeCatKey == this.benefitObj.dentalSlug.coverageCategory[k].covCatKey) {
                this.benefitObj.dentalSlug.coverageCategory[k].data.push(this.selectedDentalNode[n]);
              }
            }
          }
        }
        break;
      case 'visionSlug':
        for (var k in this.benefitObj.visionSlug.coverageCategory) {
          this.benefitObj.visionSlug.coverageCategory[k].data = [];
        }
        if (this.selectedVisionNode.length > 0) {
          for (var n in this.selectedVisionNode) {
            let nodeCatKey = this.selectedVisionNode[n].covCatKey;
            for (var k in this.benefitObj.visionSlug.coverageCategory) {
              if (nodeCatKey == this.benefitObj.visionSlug.coverageCategory[k].covCatKey) {
                this.benefitObj.visionSlug.coverageCategory[k].data.push(this.selectedVisionNode[n]);
              }
            }
          }
        }
        break;
      case 'healthSlug':
        for (var k in this.benefitObj.healthSlug.coverageCategory) {
          this.benefitObj.healthSlug.coverageCategory[k].data = [];
        }
        if (this.selectedHealthNode.length > 0) {
          for (var n in this.selectedHealthNode) {
            let nodeCatKey = this.selectedHealthNode[n].covCatKey;
            for (var k in this.benefitObj.healthSlug.coverageCategory) {
              if (nodeCatKey == this.benefitObj.healthSlug.coverageCategory[k].covCatKey) {
                this.benefitObj.healthSlug.coverageCategory[k].data.push(this.selectedHealthNode[n]);
              }
            }
          }
        }
        break;
      case 'drugSlug':
        for (var k in this.benefitObj.drugSlug.coverageCategory) {
          this.benefitObj.drugSlug.coverageCategory[k].data = [];
        }
        if (this.selectedDrugNode.length > 0) {
          for (var n in this.selectedDrugNode) {
            let nodeCatKey = this.selectedDrugNode[n].covCatKey;
            for (var k in this.benefitObj.drugSlug.coverageCategory) {
              if (nodeCatKey == this.benefitObj.drugSlug.coverageCategory[k].covCatKey) {
                this.benefitObj.drugSlug.coverageCategory[k].data.push(this.selectedDrugNode[n]);
              }
            }
          }
        }
        break;
      case 'supplementSlug':
        for (var k in this.benefitObj.supplementSlug.coverageCategory) {
          this.benefitObj.supplementSlug.coverageCategory[k].data = [];
        }
        if (this.selectedSupplementNode.length > 0) {
          for (var n in this.selectedSupplementNode) {
            let nodeCatKey = this.selectedSupplementNode[n].covCatKey;
            for (var k in this.benefitObj.supplementSlug.coverageCategory) {
              if (nodeCatKey == this.benefitObj.supplementSlug.coverageCategory[k].covCatKey) {
                this.benefitObj.supplementSlug.coverageCategory[k].data.push(this.selectedSupplementNode[n]);
              }
            }
          }
        }
        break;
      case 'wellnessSlug':
        for (var k in this.benefitObj.wellnessSlug.coverageCategory) {
          this.benefitObj.wellnessSlug.coverageCategory[k].data = [];
        }
        if (this.selectedWellnessNode.length > 0) {
          for (var n in this.selectedWellnessNode) {
            let nodeCatKey = this.selectedWellnessNode[n].covCatKey;
            for (var k in this.benefitObj.wellnessSlug.coverageCategory) {
              if (nodeCatKey == this.benefitObj.wellnessSlug.coverageCategory[k].covCatKey) {
                this.benefitObj.wellnessSlug.coverageCategory[k].data.push(this.selectedWellnessNode[n]);
              }
            }
          }
        }
        break;
    }
  }

  /**
   * Create/Update get benefits tab object On Change tabs
   */
  triggerBenefitsData() {
    $('.company-tabs li:nth-child(2)').removeClass('active');
    $('.company-tabs [href*="plan-Division"]').parent().addClass('active');
    $('.grid-inner #plan-benefits').removeClass('active in');
    $('.grid-inner #plan-Division').addClass('active in');
    // Log #1312: expiredOn Update issue fixed
    if (this.benefitObj.dentalSlug != undefined && this.benefitObj.dentalSlug != null) {
      if (this.benefitObj.dentalSlug.coverageCategory != undefined && this.benefitObj.dentalSlug.coverageCategory != null) {
        for (let d in this.benefitObj.dentalSlug.coverageCategory) {
          if (this.benefitObj.dentalSlug.coverageCategory[d].expiredOn == undefined) {
            this.benefitObj.dentalSlug.coverageCategory[d].expiredOn = ""
          }        
        }
      }
    }
    if (this.benefitObj.visionSlug != undefined && this.benefitObj.visionSlug != null) {
      if (this.benefitObj.visionSlug.coverageCategory != undefined && this.benefitObj.visionSlug.coverageCategory != null) {
        for (let v in this.benefitObj.visionSlug.coverageCategory) {
          if (this.benefitObj.visionSlug.coverageCategory[v].expiredOn == undefined) {
            this.benefitObj.visionSlug.coverageCategory[v].expiredOn = ""
          }
        }
      }
    }
    if (this.benefitObj.healthSlug != undefined && this.benefitObj.healthSlug != null) {
      if (this.benefitObj.healthSlug.coverageCategory != undefined && this.benefitObj.healthSlug.coverageCategory != null) {
        for ( let h in this.benefitObj.healthSlug.coverageCategory) {
          if (this.benefitObj.healthSlug.coverageCategory[h].expiredOn == undefined) {
            this.benefitObj.healthSlug.coverageCategory[h].expiredOn = ""
          }
        }
      }
    }
    if (this.benefitObj.supplementSlug != undefined && this.benefitObj.supplementSlug != null) {
      if (this.benefitObj.supplementSlug.coverageCategory != undefined && this.benefitObj.supplementSlug.coverageCategory != null) {
        for (let i in this.benefitObj.supplementSlug.coverageCategory) {
          if (this.benefitObj.supplementSlug.coverageCategory[i].expiredOn == undefined) {
            this.benefitObj.supplementSlug.coverageCategory[i].expiredOn = ""
          }
        }
      }
    }
    if (this.benefitObj.wellnessSlug != undefined && this.benefitObj.wellnessSlug != null) {
      if (this.benefitObj.wellnessSlug.coverageCategory != undefined && this.benefitObj.wellnessSlug.coverageCategory != null) {
        for (let i in this.benefitObj.wellnessSlug.coverageCategory) {
          if (this.benefitObj.wellnessSlug.coverageCategory[i].expiredOn == undefined) {
            this.benefitObj.wellnessSlug.coverageCategory[i].expiredOn = ""
          }
        }
      }
    }
    this.benefitsData.emit(this.benefitObj);
  }

  /**
   * This function is trigger to get benefits tab object while editing plan
   */
  triggerEditBenefitsData() {
    if (this.editModeBenefit) {
      this.getBenefitsData();
    }
    this.editModeBenefit = false;
    //get benefits tab object while editing plan
  }

  /**
   * Return benefits tab object while editing plan
   */
  getBenefitsData() {
    this.showLoader = true;
    this.getBenefits().then(res => {
      this.showLoader = false;
      this.selectedBenefitsList = [];
      let value = this.getBenefitDataFromDB; let ApiUrl;
      var result = [];
      if (value != undefined) {
      let obj = value.benefitsJson[0]
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          result.push(prop);
        }
      }
      this.dentalLoder = result.includes("dentalSlug");
      this.visionLoder = result.includes("visionSlug");
      this.healthLoder = result.includes("healthSlug");
      this.supplementLoder = result.includes("supplementSlug");
      this.drugLoder = result.includes("drugSlug");
      this.wellnessLoder = result.includes("wellnessSlug");

      if (value.benefitsJson[0].dentalSlug && Object.keys(value.benefitsJson[0].dentalSlug).length > 0 && value.benefitsJson[0].dentalSlug.benefitKey != null) {
        if (value.benefitsJson[0].dentalSlug.combineMaximum.length > 0) {
          this.DentalCombineMaxList = value.benefitsJson[0].dentalSlug.combineMaximum;
        }
        this.benefitsList[0]['checked'] = "true";
        let dentalArray = [];
        value.benefitsJson[0].dentalSlug.coverageCategory.forEach(element => {
          element = Object.assign({ "ischecked": true, "editMode": false }, element);
          dentalArray.push(element);
        });
        value.benefitsJson[0].dentalSlug.coverageCategory = dentalArray;
        Object.assign(this.benefitObj, { "dentalSlug": value.benefitsJson[0].dentalSlug });
        // Dental Coverage Max List
        let covCatList = []
        if (value.benefitsJson[0].dentalSlug.coverageCategory.length > 0) { 
          for (let i in value.benefitsJson[0].dentalSlug.coverageCategory) {
            covCatList = value.benefitsJson[0].dentalSlug.coverageCategory[i].coverageMax
          }
        }
        this.DentalCoverageMaxList =  covCatList
        this.getBenefitCategoryList(PlanApi.getDentalCoverageCategoryList, this.benefitsList[0].disciplineDesc, value.benefitsJson[0].dentalSlug.disciplineKey, 'dentalSlug');

      }
      // Vision 
      if (this.companyBusinessTypeName != 'AB Gov.') {
        if (value.benefitsJson[0].visionSlug && Object.keys(value.benefitsJson[0].visionSlug).length > 0 && value.benefitsJson[0].visionSlug.benefitKey != null) {
          this.benefitsList[1]['checked'] = "true";
          let visionArray = [];
          value.benefitsJson[0].visionSlug.coverageCategory.forEach(element => {
            element = Object.assign({ "ischecked": true, "editMode": false }, element);
            visionArray.push(element);
          });
          value.benefitsJson[0].visionSlug.coverageCategory = visionArray;
          Object.assign(this.benefitObj, { "visionSlug": value.benefitsJson[0].visionSlug });
          // Vision Coverage Max List
          let covCatList = []
          if (value.benefitsJson[0].visionSlug.coverageCategory.length > 0) { 
          for (let i in value.benefitsJson[0].visionSlug.coverageCategory) {
          covCatList = value.benefitsJson[0].visionSlug.coverageCategory[i].coverageMax
          }
          }
          this.VisionCoverageMaxList =  covCatList
          this.getBenefitCategoryList(PlanApi.getVisionCoverageAndServicesList, this.benefitsList[1].disciplineDesc, value.benefitsJson[0].visionSlug.disciplineKey, 'visionSlug');
        }
        // Health
        if (value.benefitsJson[0].healthSlug && Object.keys(value.benefitsJson[0].healthSlug).length > 0 && value.benefitsJson[0].healthSlug.benefitKey != null) {
          this.benefitsList[2]['checked'] = "true";
          let healthArray = [];
          value.benefitsJson[0].healthSlug.coverageCategory.forEach(element => {
            element = Object.assign({ "ischecked": true, "editMode": false }, element);
            healthArray.push(element);
          });
          value.benefitsJson[0].healthSlug.coverageCategory = healthArray;
          Object.assign(this.benefitObj, { "healthSlug": value.benefitsJson[0].healthSlug });
          // Health Coverage Max List
          let covCatList = []
          if (value.benefitsJson[0].healthSlug.coverageCategory.length > 0) { 
          for (let i in value.benefitsJson[0].healthSlug.coverageCategory) {
          covCatList = value.benefitsJson[0].healthSlug.coverageCategory[i].coverageMax
          }
          }
          this.HealthCoverageMaxList =  covCatList    
          this.getBenefitCategoryList(PlanApi.getHealthCoverageAndServicesList, this.benefitsList[2].disciplineDesc, value.benefitsJson[0].healthSlug.disciplineKey, 'healthSlug');

        }

        // Drug
        if (value.benefitsJson[0].drugSlug && Object.keys(value.benefitsJson[0].drugSlug).length > 0 && value.benefitsJson[0].drugSlug.benefitKey != null) {
          this.benefitsList[3]['checked'] = "true";
          let drugArray = [];
          value.benefitsJson[0].drugSlug.coverageCategory.forEach(element => {
            element = Object.assign({ "ischecked": true, "editMode": false }, element);
            drugArray.push(element);
          });
          value.benefitsJson[0].drugSlug.coverageCategory = drugArray;
          Object.assign(this.benefitObj, { "drugSlug": value.benefitsJson[0].drugSlug });
          // Drug Coverage Max List
          let drugCovCatList = []
          if (value.benefitsJson[0].drugSlug.coverageCategory.length > 0) { 
            for (let i in value.benefitsJson[0].drugSlug.coverageCategory) {
              drugCovCatList = value.benefitsJson[0].drugSlug.coverageCategory[i].coverageMax
            }
          }
          this.DentalCoverageMaxList =  drugCovCatList
          this.getBenefitCategoryList(PlanApi.getDrugCoverageAndServicesList, this.benefitsList[3].disciplineDesc, value.benefitsJson[0].drugSlug.disciplineKey, 'drugSlug');
        }

        // Supplement
        if (value.benefitsJson[0].supplementSlug && Object.keys(value.benefitsJson[0].supplementSlug).length > 0 && value.benefitsJson[0].supplementSlug.benefitKey != null) {
          this.benefitsList[4]['checked'] = "true";
          let supplementArray = [];
          value.benefitsJson[0].supplementSlug.coverageCategory.forEach(element => {
            element = Object.assign({ "ischecked": true, "editMode": false }, element);
            supplementArray.push(element);
          });
          value.benefitsJson[0].supplementSlug.coverageCategory = supplementArray;
          Object.assign(this.benefitObj, { "supplementSlug": value.benefitsJson[0].supplementSlug });
          if (value.benefitsJson[0].supplementSlug.combineMaximum.length > 0) {
            this.SupplementalCoverageMaxList = value.benefitsJson[0].supplementSlug.combineMaximum;
          }
          this.getBenefitCategoryList(PlanApi.getHSACoverageAndServicesList, this.benefitsList[4].disciplineDesc, value.benefitsJson[0].supplementSlug.disciplineKey, 'supplementSlug');
        }
        

        if (value.benefitsJson[0].wellnessSlug && Object.keys(value.benefitsJson[0].wellnessSlug).length > 0 && value.benefitsJson[0].wellnessSlug.benefitKey != null) {
          if (value.benefitsJson[0].wellnessSlug.combineMaximum.length > 0) {
            this.WellnessCombineMaxList = value.benefitsJson[0].wellnessSlug.combineMaximum;
          }
          this.benefitsList[5]['checked'] = "true";
          let wellnessArray = [];

          value.benefitsJson[0].wellnessSlug.coverageCategory.forEach(element => {
            element = Object.assign({ "ischecked": true, "editMode": false }, element);
            wellnessArray.push(element);
          });
          value.benefitsJson[0].wellnessSlug.coverageCategory = wellnessArray;
          Object.assign(this.benefitObj, { "wellnessSlug": value.benefitsJson[0].wellnessSlug });
          if (value.benefitsJson[0].wellnessSlug.combineMaximum.length > 0) {
            this.wellnessCoverageMaxList = value.benefitsJson[0].wellnessSlug.combineMaximum
          }
          this.getBenefitCategoryList(PlanApi.getWellnessCoverageAndServicesList, this.benefitsList[5].disciplineDesc, value.benefitsJson[0].wellnessSlug.disciplineKey, 'wellnessSlug');

        }
      }
      this.currentBenefitId = this.selectedBenefitsList[0].id;
      }
    });
  }

  /**
   * 
   * @param ApiUrl 
   * @param fieldName 
   * @param disciplineKey 
   * @param slug 
   */
  searchInServiceArray(benifitObject, serviceKey, covCatKey=null) {
    let obj: boolean = false;
    if (benifitObject.length > 0) {
      obj = benifitObject.find(x => {
        if (x != undefined && x.serviceKey == serviceKey && x.covCatKey == covCatKey) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      obj = false;
    }
    return obj;
  }

  /**
   * Get Benefit Services list while edit plan
   * @param disciplineKey 
   * @param coverageCategory 
   * @param slug 
   */
  getEditServiceList(disciplineKey, coverageCategory, slug) {
    this.servicesDataArrayDental = Object.assign({ 'data': [] });
    this.servicesDataArrayVision = Object.assign({ 'data': [] });
    this.servicesDataArrayHealth = Object.assign({ 'data': [] });
    this.servicesDataArrayDrug = Object.assign({ 'data': [] });
    this.servicesDataArraySupplement = Object.assign({ 'data': [] });
    this.servicesDataArrayWellness = Object.assign({ 'data': [] });
    let i: any = 0;
    let lengthCount: number = coverageCategory.length;
    let catIndexArray = [];
    this.selectedDentalArray = []
    let covCatArrList = []
    let promise = new Promise(async (resolve, reject) => {
      for (var catArray in coverageCategory) {
        await this.hmsDataServiceService.postApi(PlanApi.getPlanServicesListUrl, { "covKey": coverageCategory[catArray].covKey, "covCatKey": coverageCategory[catArray].covCatKey, "disciplineKey": disciplineKey }).subscribe(data => {
          catIndexArray.push(coverageCategory[i].covCatKey);
          if (data.code == 200 && data.status == 'OK') {

            if (data.result.servicesData && data.result.servicesData.length > 0) {     // UpdateCode
              switch (slug) {
                case 'dentalSlug':
                  if (parseInt(catArray) == 0) {
                    this.servicesDataArrayDental = Object.assign({ 'data': [] });
                  }

                  for (var dd in data.result.servicesData) {
                    this.servicesDataArrayDental.data.push(data.result.servicesData[dd]);
                  }
                  let temp_array = []
                  for (var n in data.result.servicesData) {
                    this.selectedDentalNode = []

                    if (data.result.servicesData[n].data.level == 0) {
                      if ((data.result.servicesData[n].data.isSelected || data.result.servicesData[n].data.isPartial) && !this.searchInServiceArray(temp_array, data.result.servicesData[n].data.serviceKey, data.result.servicesData[n].data.covCatKey)) {
                        temp_array.push(data.result.servicesData[n].data);
                      }
                      if (data.result.servicesData[n].children.length > 0) {
                        for (var k in data.result.servicesData[n].children) {
                          if ((data.result.servicesData[n].children[k].data.isSelected || data.result.servicesData[n].children[k].data.isPartial) && !this.searchInServiceArray(temp_array, data.result.servicesData[n].children[k].data.serviceKey, data.result.servicesData[n].children[k].data.covCatKey)) {
                            temp_array.push(data.result.servicesData[n].children[k].data);
                          }
                          if (data.result.servicesData[n].children[k].children.length > 0) {
                            for (var j in data.result.servicesData[n].children[k].children) {
                              if ((data.result.servicesData[n].children[k].children[j].data.isSelected || data.result.servicesData[n].children[k].children[j].data.isPartial) && !this.searchInServiceArray(temp_array, data.result.servicesData[n].children[k].children[j].data.serviceKey, data.result.servicesData[n].children[k].children[j].data.covCatKey)) {
                                temp_array.push(data.result.servicesData[n].children[k].children[j].data);
                              }
                              /**New Code Level 4,5 */
                              if (data.result.servicesData[n].children[k].children[j].children.length > 0) {
                                for (var m in data.result.servicesData[n].children[k].children[j].children) {
                                  if ((data.result.servicesData[n].children[k].children[j].children[m].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].data.isPartial) && !this.searchInServiceArray(temp_array, data.result.servicesData[n].children[k].children[j].children[m].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].data.covCatKey)) {
                                    temp_array.push(data.result.servicesData[n].children[k].children[j].children[m].data);
                                  }

                                  if (data.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                    for (var s in data.result.servicesData[n].children[k].children[j].children[m].children) {
                                      if ((data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isPartial) && !this.searchInServiceArray(temp_array, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.covCatKey)) {
                                        temp_array.push(data.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                      }
                                    }
                                  }
                                }
                              }
                              /**New Code Level 4,5 */
                            }
                          }
                        }
                      }
                    }

                  }
                  if (temp_array.length > 0) {
                    // over coming null issue 
                    let index = i
                    this.dentalArray.push(temp_array);
                    var pos = this.benefitObj.dentalSlug.coverageCategory.findIndex(p => p.covCatKey == temp_array[0].covCatKey)
                    if (Object.assign(this.benefitObj.dentalSlug.coverageCategory[pos], { 'data': temp_array })) {
                      covCatArrList = temp_array
                    }
                    this.dentalLoder = false

                  } else {
                  }
                  for (let n in covCatArrList) {
                    this.selectedDentalArray.push(covCatArrList[n])
                  }
                  // dental slug data array is null issue fixed

                  break;
                case 'visionSlug':
                  if (parseInt(catArray) == 0) {
                    this.servicesDataArrayVision = Object.assign({ 'data': [] });
                  }
                  for (var dd in data.result.servicesData) {
                    this.servicesDataArrayVision.data.push(data.result.servicesData[dd]);
                  }
                  for (var n in data.result.servicesData) {
                    if (data.result.servicesData[n].data.level == 0) {
                      if (data.result.servicesData[n].data.isSelected && !this.searchInServiceArray(this.selectedVisionNode, data.result.servicesData[n].data.serviceKey, data.result.servicesData[n].data.covCatKey)) {
                        this.selectedVisionNode.push(data.result.servicesData[n].data);
                      }
                      if (data.result.servicesData[n].children.length > 0) {
                        for (var k in data.result.servicesData[n].children) {
                          if (data.result.servicesData[n].children[k].data.isSelected && !this.searchInServiceArray(this.selectedVisionNode, data.result.servicesData[n].children[k].data.serviceKey, data.result.servicesData[n].children[k].data.covCatKey)) {
                            this.selectedVisionNode.push(data.result.servicesData[n].children[k].data);
                          }
                          if (data.result.servicesData[n].children[k].children.length > 0) {
                            for (var j in data.result.servicesData[n].children[k].children) {
                              if (data.result.servicesData[n].children[k].children[j].data.isSelected && !this.searchInServiceArray(this.selectedVisionNode, data.result.servicesData[n].children[k].children[j].data.serviceKey, data.result.servicesData[n].children[k].children[j].data.covCatKey)) {
                                this.selectedVisionNode.push(data.result.servicesData[n].children[k].children[j].data);
                              }

                              /**New Code Level 4,5 */
                              if (data.result.servicesData[n].children[k].children[j].children.length > 0) {
                                for (var m in data.result.servicesData[n].children[k].children[j].children) {
                                  if ((data.result.servicesData[n].children[k].children[j].children[m].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].data.isPartial) && !this.searchInServiceArray(this.selectedVisionNode, data.result.servicesData[n].children[k].children[j].children[m].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].data.covCatKey)) {
                                    this.selectedVisionNode.push(data.result.servicesData[n].children[k].children[j].children[m].data);
                                  }
                                  if (data.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                    for (var s in data.result.servicesData[n].children[k].children[j].children[m].children) {
                                      if ((data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isPartial) && !this.searchInServiceArray(this.selectedVisionNode, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.covCatKey)) {
                                        this.selectedVisionNode.push(data.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                      }
                                    }
                                  }
                                }
                              }
                              /**New Code Level 4,5 */
                            }
                          }
                        }
                      }
                    }
                  }
                  break;
                case 'healthSlug':
                  if (parseInt(catArray) == 0) {
                    this.servicesDataArrayHealth = Object.assign({ 'data': [] });
                  }
                  for (var dd in data.result.servicesData) {
                    this.servicesDataArrayHealth.data.push(data.result.servicesData[dd]);
                  }
                  for (var n in data.result.servicesData) {
                    if (data.result.servicesData[n].data.level == 0) {
                      if (data.result.servicesData[n].data.isSelected && !this.searchInServiceArray(this.selectedHealthNode, data.result.servicesData[n].data.serviceKey, data.result.servicesData[n].data.covCatKey)) {
                        this.selectedHealthNode.push(data.result.servicesData[n].data);
                      }
                      if (data.result.servicesData[n].children.length > 0) {
                        for (var k in data.result.servicesData[n].children) {
                          if (data.result.servicesData[n].children[k].data.isSelected && !this.searchInServiceArray(this.selectedHealthNode, data.result.servicesData[n].children[k].data.serviceKey, data.result.servicesData[n].children[k].data.covCatKey)) {
                            this.selectedHealthNode.push(data.result.servicesData[n].children[k].data);
                          }
                          if (data.result.servicesData[n].children[k].children.length > 0) {
                            for (var j in data.result.servicesData[n].children[k].children) {
                              if (data.result.servicesData[n].children[k].children[j].data.isSelected && !this.searchInServiceArray(this.selectedHealthNode, data.result.servicesData[n].children[k].children[j].data.serviceKey, data.result.servicesData[n].children[k].children[j].data.covCatKey)) {
                                this.selectedHealthNode.push(data.result.servicesData[n].children[k].children[j].data);
                              }
                              /**New Code Level 4,5 */
                              if (data.result.servicesData[n].children[k].children[j].children.length > 0) {
                                for (var m in data.result.servicesData[n].children[k].children[j].children) {
                                  if ((data.result.servicesData[n].children[k].children[j].children[m].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].data.isPartial) && !this.searchInServiceArray(this.selectedHealthNode, data.result.servicesData[n].children[k].children[j].children[m].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].data.covCatKey)) {
                                    this.selectedHealthNode.push(data.result.servicesData[n].children[k].children[j].children[m].data);
                                  }
                                  if (data.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                    for (var s in data.result.servicesData[n].children[k].children[j].children[m].children) {
                                      if ((data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isPartial) && !this.searchInServiceArray(this.selectedHealthNode, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.covCatKey)) {
                                        this.selectedHealthNode.push(data.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                      }
                                    }
                                  }
                                }
                              }
                              /**New Code Level 4,5 */
                            }
                          }
                        }
                      }
                    }
                  }
                  break;

                case 'drugSlug':
                  if (parseInt(catArray) == 0) {
                    this.servicesDataArrayDrug = Object.assign({ 'data': [] });
                  }
                  for (var dd in data.result.servicesData) {
                    this.servicesDataArrayDrug.data.push(data.result.servicesData[dd]);
                  }
                  for (var n in data.result.servicesData) {
                    if (data.result.servicesData[n].data.level == 0) {
                      if (data.result.servicesData[n].data.isSelected && !this.searchInServiceArray(this.selectedDrugNode, data.result.servicesData[n].data.serviceKey, data.result.servicesData[n].data.covCatKey)) {
                        this.selectedDrugNode.push(data.result.servicesData[n].data);
                      }
                      if (data.result.servicesData[n].children.length > 0) {
                        for (var k in data.result.servicesData[n].children) {
                          if (data.result.servicesData[n].children[k].data.isSelected && !this.searchInServiceArray(this.selectedDrugNode, data.result.servicesData[n].children[k].data.serviceKey, data.result.servicesData[n].children[k].data.covCatKey)) {
                            this.selectedDrugNode.push(data.result.servicesData[n].children[k].data);
                          }
                          if (data.result.servicesData[n].children[k].children.length > 0) {
                            for (var j in data.result.servicesData[n].children[k].children) {

                              if (data.result.servicesData[n].children[k].children[j].data.isSelected && !this.searchInServiceArray(this.selectedDrugNode, data.result.servicesData[n].children[k].children[j].data.serviceKey, data.result.servicesData[n].children[k].children[j].data.covCatKey)) {
                                this.selectedDrugNode.push(data.result.servicesData[n].children[k].children[j].data);
                              }
                              /**New Code Level 4,5 */
                              if (data.result.servicesData[n].children[k].children[j].children.length > 0) {
                                for (var m in data.result.servicesData[n].children[k].children[j].children) {
                                  if ((data.result.servicesData[n].children[k].children[j].children[m].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].data.isPartial) && !this.searchInServiceArray(this.selectedDrugNode, data.result.servicesData[n].children[k].children[j].children[m].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].data.covCatKey)) {
                                    this.selectedDrugNode.push(data.result.servicesData[n].children[k].children[j].children[m].data);
                                  }
                                  if (data.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                    for (var s in data.result.servicesData[n].children[k].children[j].children[m].children) {
                                      if ((data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isPartial) && !this.searchInServiceArray(this.selectedDrugNode, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.covCatKey)) {
                                        this.selectedDrugNode.push(data.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                      }
                                    }
                                  }
                                }
                              }
                              /**New Code Level 4,5 */
                            }
                          }
                        }
                      }
                    }
                  }
                  break;
                case 'supplementSlug':
                  if (parseInt(catArray) == 0) {
                    this.servicesDataArraySupplement = Object.assign({ 'data': [] });
                  }
                  for (var dd in data.result.servicesData) {
                    this.servicesDataArraySupplement.data.push(data.result.servicesData[dd]);
                  }
                  for (var n in data.result.servicesData) {
                    if (data.result.servicesData[n].data.level == 0) {
                      if (data.result.servicesData[n].data.isSelected && !this.searchInServiceArray(this.selectedSupplementNode, data.result.servicesData[n].data.serviceKey, data.result.servicesData[n].data.covCatKey)) {
                        this.selectedSupplementNode.push(data.result.servicesData[n].data);
                      }
                      if (data.result.servicesData[n].children.length > 0) {
                        for (var k in data.result.servicesData[n].children) {
                          if (data.result.servicesData[n].children[k].data.isSelected && !this.searchInServiceArray(this.selectedSupplementNode, data.result.servicesData[n].children[k].data.serviceKey, data.result.servicesData[n].children[k].data.covCatKey)) {
                            this.selectedSupplementNode.push(data.result.servicesData[n].children[k].data);
                          }
                          if (data.result.servicesData[n].children[k].children.length > 0) {
                            for (var j in data.result.servicesData[n].children[k].children) {
                              if (data.result.servicesData[n].children[k].children[j].data.isSelected && !this.searchInServiceArray(this.selectedSupplementNode, data.result.servicesData[n].children[k].children[j].data.serviceKey, data.result.servicesData[n].children[k].children[j].data.covCatKey)) {
                                this.selectedSupplementNode.push(data.result.servicesData[n].children[k].children[j].data);
                              }
                              /**New Code Level 4,5 */
                              if (data.result.servicesData[n].children[k].children[j].children.length > 0) {
                                for (var m in data.result.servicesData[n].children[k].children[j].children) {
                                  if ((data.result.servicesData[n].children[k].children[j].children[m].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].data.isPartial) && !this.searchInServiceArray(this.selectedSupplementNode, data.result.servicesData[n].children[k].children[j].children[m].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].data.covCatKey)) {
                                    this.selectedSupplementNode.push(data.result.servicesData[n].children[k].children[j].children[m].data);
                                  }
                                  if (data.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                    for (var s in data.result.servicesData[n].children[k].children[j].children[m].children) {
                                      if ((data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isPartial) && !this.searchInServiceArray(this.selectedSupplementNode, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.covCatKey)) {
                                        this.selectedSupplementNode.push(data.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                      }
                                    }
                                  }
                                }
                              }
                              /**New Code Level 4,5 */
                            }
                          }
                        }
                      }
                    }
                  }
                  break;
                case 'wellnessSlug':

                  if (parseInt(catArray) == 0) {
                    this.servicesDataArrayWellness = Object.assign({ 'data': [] });
                  }
                  for (var dd in data.result.servicesData) {
                    this.servicesDataArrayWellness.data.push(data.result.servicesData[dd]);
                  }
                  for (var n in data.result.servicesData) {
                    if (data.result.servicesData[n].data.level == 0) {
                      if (data.result.servicesData[n].data.isSelected && !this.searchInServiceArray(this.selectedWellnessNode, data.result.servicesData[n].data.serviceKey, data.result.servicesData[n].data.covCatKey)) {
                        this.selectedWellnessNode.push(data.result.servicesData[n].data);
                      }
                      if (data.result.servicesData[n].children.length > 0) {
                        for (var k in data.result.servicesData[n].children) {
                          if (data.result.servicesData[n].children[k].data.isSelected && !this.searchInServiceArray(this.selectedWellnessNode, data.result.servicesData[n].children[k].data.serviceKey, data.result.servicesData[n].children[k].data.covCatKey)) {
                            this.selectedWellnessNode.push(data.result.servicesData[n].children[k].data);
                          }
                          if (data.result.servicesData[n].children[k].children.length > 0) {
                            for (var j in data.result.servicesData[n].children[k].children) {
                              if (data.result.servicesData[n].children[k].children[j].data.isSelected && !this.searchInServiceArray(this.selectedWellnessNode, data.result.servicesData[n].children[k].children[j].data.serviceKey, data.result.servicesData[n].children[k].children[j].data.covCatKey)) {
                                this.selectedWellnessNode.push(data.result.servicesData[n].children[k].children[j].data);
                              }
                              /**New Code Level 4,5 */
                              if (data.result.servicesData[n].children[k].children[j].children.length > 0) {
                                for (var m in data.result.servicesData[n].children[k].children[j].children) {
                                  if ((data.result.servicesData[n].children[k].children[j].children[m].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].data.isPartial) && !this.searchInServiceArray(this.selectedWellnessNode, data.result.servicesData[n].children[k].children[j].children[m].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].data.covCatKey)) {
                                    this.selectedWellnessNode.push(data.result.servicesData[n].children[k].children[j].children[m].data);
                                  }
                                  if (data.result.servicesData[n].children[k].children[j].children[m].children.length > 0) {
                                    for (var s in data.result.servicesData[n].children[k].children[j].children[m].children) {
                                      if ((data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isSelected || data.result.servicesData[n].children[k].children[j].children[m].children[s].data.isPartial) && !this.searchInServiceArray(this.selectedWellnessNode, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.serviceKey, data.result.servicesData[n].children[k].children[j].children[m].children[s].data.covCatKey)) {
                                        this.selectedWellnessNode.push(data.result.servicesData[n].children[k].children[j].children[m].children[s].data);
                                      }
                                    }
                                  }
                                }
                              }
                              /**New Code Level 4,5 */
                            }
                          }
                        }
                      }
                    }
                  }
                  break;
              }
             
            } else {
              //Added for log 908 
              this.planService.loader.emit(false)
            }

            if (slug) {
              switch (slug) {
                case 'dentalSlug':
                  if (this.selectedDentalNode.length > 0) {
                    Object.assign(this.benefitObj.dentalSlug.coverageCategory[catArray], { 'data': this.selectedDentalNode });
                  }

                  break;
                case 'visionSlug':
                  Object.assign(this.benefitObj.visionSlug.coverageCategory[i], { 'data': this.selectedVisionNode });
                  break;
                case 'healthSlug':
                  Object.assign(this.benefitObj.healthSlug.coverageCategory[i], { 'data': this.selectedHealthNode });
                  break;
                case 'drugSlug':
                  Object.assign(this.benefitObj.drugSlug.coverageCategory[i], { 'data': this.selectedDrugNode });
                  break;
                case 'supplementSlug':
                  Object.assign(this.benefitObj.supplementSlug.coverageCategory[i], { 'data': this.selectedSupplementNode });
                  break;
                case 'wellnessSlug':
                  Object.assign(this.benefitObj.wellnessSlug.coverageCategory[i], { 'data': this.selectedWellnessNode });
                  break;
              }
              if (parseInt(i) == (lengthCount - 1)) {

                resolve();
              }
              i++;
            }
          }
        });

      }
    });
    return promise;
  }

  /**
   * Get Benefit Category List
   * @param ApiUrl 
   * @param fieldName 
   * @param disciplineKey 
   * @param slug 
   */
  getBenefitCategoryList(ApiUrl, fieldName, disciplineKey, slug) {

    let servicArray = [];
    let servicelayerarray: any;
    this.selectedBenefitsList.push({ id: disciplineKey, name: fieldName, slug: slug });
    this.currentBenefitId = this.selectedBenefitsList[0].id;
    this.activeBenefit = this.selectedBenefitsList[0].slug;

    this.benefitCategoryListing(ApiUrl, disciplineKey, 'editMode').then(res => {
      switch (slug) {
        case 'dentalSlug':

          this.updateCategoryValue(this.dentalCoverageCategoryList, this.benefitObj.dentalSlug.coverageCategory, slug).then(res => {
            this.editTimePrintGenericTable();
          });
          this.serviceLayerDentalBoolean = true;
          this.getEditServiceList(disciplineKey, this.benefitObj.dentalSlug.coverageCategory, slug).then(res => {
            this.dentalServiceList = this.servicesDataArrayDental.data;
            this.arrDataDental = this.dentalServiceList;
          });
          break;

        case 'visionSlug':
          this.updateCategoryValue(this.visionCoverageCategoryList, this.benefitObj.visionSlug.coverageCategory, slug).then(res => {
            this.editTimePrintGenericTable();
          });
          this.serviceLayerVisionBoolean = true;
          this.getEditServiceList(disciplineKey, this.benefitObj.visionSlug.coverageCategory, slug).then(res => {
            this.visionServiceList = this.servicesDataArrayVision.data;
            this.arrDataVision = this.visionServiceList;
          });
          break;
        case 'healthSlug':
          this.updateCategoryValue(this.healthCoverageCategoryList, this.benefitObj.healthSlug.coverageCategory, slug).then(res => {
            this.editTimePrintGenericTable();
          });
          this.serviceLayerHealthBoolean = true;
          this.getEditServiceList(disciplineKey, this.benefitObj.healthSlug.coverageCategory, slug).then(res => {
            this.healthServiceList = this.servicesDataArrayHealth.data;
            this.arrDataHealth = this.healthServiceList;
          });
          break;
        case 'drugSlug':
          this.updateCategoryValue(this.drugCoverageCategoryList, this.benefitObj.drugSlug.coverageCategory, slug).then(res => {
            this.editTimePrintGenericTable();
          });
          this.serviceLayerDrugBoolean = true;

          this.getEditServiceList(disciplineKey, this.benefitObj.drugSlug.coverageCategory, slug).then(res => {
            this.drugServiceList = this.servicesDataArrayDrug.data;
            this.arrDataDrug = this.drugServiceList;
          });
          break;
        case 'supplementSlug':
          this.updateCategoryValue(this.supplementCoverageCategoryList, this.benefitObj.supplementSlug.coverageCategory, slug).then(res => {
            this.editTimePrintGenericTable();
          });
          this.serviceLayerSupplementBoolean = true;
          this.getEditServiceList(disciplineKey, this.benefitObj.supplementSlug.coverageCategory, slug).then(res => {
            this.supplementServiceList = this.servicesDataArraySupplement.data;
            this.arrDataSupplement = this.supplementServiceList;

          });
          break;
        case 'wellnessSlug':

          this.updateCategoryValue(this.wellnessCoverageCategoryList, this.benefitObj.wellnessSlug.coverageCategory, slug).then(res => {
            this.editTimePrintGenericTable();
          });
          this.serviceLayerWellnessBoolean = true;

          this.getEditServiceList(disciplineKey, this.benefitObj.wellnessSlug.coverageCategory, slug).then(res => {
            this.wellnessServiceList = this.servicesDataArrayWellness.data;
            this.arrDataWellness = this.wellnessServiceList;

          });
          break;
      }

    });

  }

  /**
   * Show Benefits Category Table while edit plan
   */
  editTimePrintGenericTable() {
    if (this.activeBenefit) {
      switch (this.activeBenefit) {
        case 'dentalSlug':
          if (this.dentalCoverageCategoryList.length > 0) {
            this.genericDataTableInit(this.dentalCoverageCategoryList);
          }
          break;
        case 'visionSlug':
          if (this.visionCoverageCategoryList.length > 0) {
            this.genericDataTableInit(this.visionCoverageCategoryList);
          }
          break;
        case 'healthSlug':
          if (this.healthCoverageCategoryList.length > 0) {
            this.genericDataTableInit(this.healthCoverageCategoryList);
          }
          break;
        case 'drugSlug':
          if (this.drugCoverageCategoryList.length > 0) {
            this.genericDataTableInit(this.drugCoverageCategoryList);
          }

          break;
        case 'supplementSlug':
          if (this.supplementCoverageCategoryList.length > 0) {
            this.genericDataTableInit(this.supplementCoverageCategoryList);
          }

          break;
        case 'wellnessSlug':
          if (this.wellnessCoverageCategoryList.length > 0) {
            this.genericDataTableInit(this.wellnessCoverageCategoryList);
          }
          break;
      }
    }
  }

  /**
   * Map Category value while edit plan
   * @param originalArray 
   * @param EditArray 
   * @param slug 
   */
  updateCategoryValue(originalArray, EditArray, slug) {
    let updatedArray = []; let covCategoryArray = [];
    let promise = new Promise((resolve, reject) => {
      for (var i in originalArray) {
        let editIndex = EditArray.findIndex(x => x.covCatKey === originalArray[i].covCatKey);
        if (editIndex >= 0) {
          updatedArray.push(EditArray[editIndex]);
        } else {
          updatedArray.push(originalArray[i]);
        }
      }
      switch (slug) {
        case 'dentalSlug':
          let removeDentalCovCategory = ["Endodontic", "Endoperio", "Exclusions", "Majorrestorative", "Periodontalscaling", "Periodontic", "Prosthodontic", "Scale", "Temporomandibular Joint"];
          for (var i in updatedArray) {
            this.enableCovCatForCopyDivision;
            let editIndex = removeDentalCovCategory.findIndex(x => x === updatedArray[i].covCatDesc);
            if (editIndex == -1) {
              covCategoryArray.push(updatedArray[i]);
            }
          }
          this.dentalCoverageCategoryList = covCategoryArray;
          break;
        case 'visionSlug':
          let removeVisionCovCategory = ["Clinical Need", "Exclusions", "Optical Supplements", "Referrals"];
          for (var i in updatedArray) {
            this.enableCovCatForCopyDivision;
            let editIndex = removeVisionCovCategory.findIndex(x => x === updatedArray[i].covCatDesc);
            if (editIndex == -1) {
              covCategoryArray.push(updatedArray[i]);
            }
          }
          this.visionCoverageCategoryList = covCategoryArray;
          break;
        case 'healthSlug':
          let removeHealthCovCategory = ["Exclusions"];
          for (var i in updatedArray) {
            this.enableCovCatForCopyDivision;
            let editIndex = removeHealthCovCategory.findIndex(x => x === updatedArray[i].covCatDesc);
            if (editIndex == -1) {
              covCategoryArray.push(updatedArray[i]);
            }
          }
          this.healthCoverageCategoryList = covCategoryArray;
          break;
        case 'drugSlug':
          this.drugCoverageCategoryList = updatedArray;
          break;
        case 'supplementSlug':
          this.supplementCoverageCategoryList = updatedArray;
          break;
        case 'wellnessSlug':
          this.wellnessCoverageCategoryList = updatedArray;
          break;
      }
      resolve();
    });

    this.showLoader = false;
    return promise;
  }

  /*********** Start Dental Combine Max Inline table ***************/
  enableAddDentalCombineMax() {
    this.selectedCombineMax = {};
    this.DentalCombineMaxEditMode = false;
    this.DentalCombineMaxAddMode = true;
    this.setElementFocus('trgFocusAddCombineMaxEl');
  }

  addNewDentalCombineMax(newRecord) {
    if (this.editPlanMode) {
      this.dental_new_combine_maximum_amount.markAsTouched();
      this.dental_new_combine_maximum_type.markAsTouched();
      this.dental_new_combine_maximum_period_type.markAsTouched();
      this.dental_new_combine_combine_maximum_type.markAsTouched();
      this.dental_new_combine_maximum_effective_date.markAsTouched();
      this.dental_new_combine_maximum_expiry_date.markAsTouched();

      if (this.dental_new_combine_maximum_amount.invalid ||
        this.dental_new_combine_maximum_type.invalid ||
        this.dental_new_combine_maximum_period_type.invalid ||
        this.dental_new_combine_combine_maximum_type.invalid ||
        this.dental_new_combine_maximum_effective_date.invalid ||
        this.dental_new_combine_maximum_expiry_date.invalid) {
        return;
      }
    } else {
      this.dental_new_combine_maximum_amount.markAsTouched();
      this.dental_new_combine_maximum_type.markAsTouched();
      this.dental_new_combine_maximum_period_type.markAsTouched();
      this.dental_new_combine_combine_maximum_type.markAsTouched();

      if (this.dental_new_combine_maximum_amount.invalid ||
        this.dental_new_combine_maximum_type.invalid ||
        this.dental_new_combine_maximum_period_type.invalid ||
        this.dental_new_combine_combine_maximum_type.invalid) {
        return;
      }
    }

    var rowData = {
      maximumAmt: this.dental_new_combine_maximum_amount.value,
      maximumTypeKey: this.selectedMaximumTypeKey,
      maximumTypeDesc: this.selectedMaximumTypeDesc,
      maximumPeroidKey: this.selectedMaximumPeriodTypeKey,
      maximumPeroidDesc: this.selectedMaximumPeriodTypeDesc,
      combineMaximunTypeKey: this.selectedDentalCombineMaxTypeKey,
      combineMaximunTypeDesc: this.selectedDentalCombineMaxTypeDesc

    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.dental_new_combine_maximum_effective_date.value)
      if (this.dental_new_combine_maximum_expiry_date.value != null && this.dental_new_combine_maximum_expiry_date.value != undefined && this.dental_new_combine_maximum_expiry_date.value != "" && this.dental_new_combine_maximum_expiry_date.value != '00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.dental_new_combine_maximum_expiry_date.value)
      } else {
        rowData['expiredOn'] = "";
      }
    }
    this.DentalCombineMaxList.unshift(rowData);
    this.benefitObj.dentalSlug.combineMaximum = this.DentalCombineMaxList;
    this.resetNewCombineMaxRow();
  }

  resetNewCombineMaxRow() {
    this.DentalCombineMaxAddMode = false;
    this.dental_new_combine_maximum_amount.reset();
    this.dental_new_combine_maximum_type.reset();
    this.dental_new_combine_maximum_period_type.reset();
    this.dental_new_combine_combine_maximum_type.reset();
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dateNameArray['NewCombineMaximumEffectiveDate'] = null
      this.dateNameArray['NewCombineMaximumExpiryDate'] = null;
      this.dental_new_combine_maximum_effective_date.reset();
      this.dental_new_combine_maximum_expiry_date.reset();
    }
  }

  onKeyPress(event, formControl) {
    let carry = this.FormGroup.get(formControl).value;
    if (formControl == 'dentalcarryForwardYear')
      if (carry > 2) {

        this.dentalShowcarryerror = true;

      } else {
        this.dentalShowcarryerror = false
      }
    else if (formControl == 'healthcarryForwardYear') {

      if (carry > 2) {

        this.healthShowcarryerror = true;
      } else {
        this.healthShowcarryerror = false
      }
    }
    else if (formControl == 'visioncarryForwardYear') {

      if (carry > 2) {

        this.visionShowcarryerror = true;
      } else {
        this.visionShowcarryerror = false
      }
    }

    else {
      this.showcarryerror = false;
    }
    this.planService.carryforwarderror.emit([this.dentalShowcarryerror, this.visionShowcarryerror, this.healthShowcarryerror]);

  }
  enableEditDentalCombineMax(rowData, rowIndex): void {
    this.selectedMaximumTypeKey = null;
    this.selectedMaximumTypeDesc = null;
    this.selectedMaximumPeriodTypeKey = null;
    this.selectedMaximumPeriodTypeDesc = null;
    this.selectedDentalCombineMaxTypeKey = null;
    this.selectedDentalCombineMaxTypeDesc = null;

    this.resetNewCombineMaxRow();
    this.DentalCombineMaxEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedCombineMax = copy;
    this.selectedCombineMax['rowIndex'] = rowIndex;
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.maximumTypeKeyRowData = rowData.maximumTypeKey;
      this.maximumTypeDescRowData = rowData.maximumTypeDesc;
      this.maximumPeriodTypeKeyRowData = rowData.maximumPeroidKey;
      this.maximumPeriodTypeDescRowData = rowData.maximumPeroidDesc ? rowData.maximumPeroidDesc : rowData.maximumPeriodTypeDesc;
      this.combineMaximumTypeKeyRowData = rowData.combineMaximunTypeKey;
      this.combineMaximumTypeDescRowData = rowData.combineMaximunTypeDesc;

      this.dental_old_combine_maximum_type.patchValue(this.maximumTypeDescRowData);
      this.dental_old_combine_maximum_period_type.patchValue(this.maximumPeriodTypeDescRowData);
      this.dental_old_combine_combine_maximum_type.patchValue(this.combineMaximumTypeDescRowData);

      this.selectedCombineMax['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
      this.setControlDate('OldCombineMaximumEffectiveDate', this.selectedCombineMax['effectiveOn'])
      if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
        this.selectedCombineMax['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
        this.setControlDate('OldCombineMaximumExpiryDate', this.selectedCombineMax['expiredOn'])
      } else {
        this.selectedCombineMax['expiredOn'] = null;
      }
    }
    this.setElementFocus('trgFocusEditCombineMaxEl');
  };

  updateDentalCombineMax(index) {
    if (this.editPlanMode) {
      this.dental_old_combine_maximum_amount.markAsTouched();
      this.dental_old_combine_maximum_type.markAsTouched();
      this.dental_old_combine_maximum_period_type.markAsTouched();
      this.dental_old_combine_combine_maximum_type.markAsTouched();
      this.dental_old_combine_maximum_effective_date.markAsTouched();
      this.dental_old_combine_maximum_expiry_date.markAsTouched();

      if (this.dental_old_combine_maximum_amount.invalid || this.dental_old_combine_maximum_type.invalid || this.dental_old_combine_maximum_period_type.invalid || this.dental_old_combine_combine_maximum_type.invalid) {
        return;
      }
    } else {
      this.dental_old_combine_maximum_amount.markAsTouched();
      this.dental_old_combine_maximum_type.markAsTouched();
      this.dental_old_combine_maximum_period_type.markAsTouched();
      this.dental_old_combine_combine_maximum_type.markAsTouched();

      if (this.dental_old_combine_maximum_amount.invalid || this.dental_old_combine_maximum_type.invalid || this.dental_old_combine_maximum_period_type.invalid || this.dental_old_combine_combine_maximum_type.invalid) {
        return;
      }
    }


    var rowData = {
      benDentCovCatMaxKey: this.dental_old_combine_maximum_benDentCovCatMaxKey.value,
      maximumAmt: this.dental_old_combine_maximum_amount.value,
      maximumTypeKey: this.selectedMaximumTypeKey != null ? this.selectedMaximumTypeKey : this.maximumTypeKeyRowData,
      maximumTypeDesc: this.selectedMaximumTypeDesc != null ? this.selectedMaximumTypeDesc : this.maximumTypeDescRowData,
      maximumPeroidKey: this.selectedMaximumPeriodTypeKey != null ? this.selectedMaximumPeriodTypeKey : this.maximumPeriodTypeKeyRowData,
      maximumPeroidDesc: this.selectedMaximumPeriodTypeDesc != null ? this.selectedMaximumPeriodTypeDesc : this.maximumPeriodTypeDescRowData,
      combineMaximunTypeKey: this.selectedDentalCombineMaxTypeKey != null ? this.selectedDentalCombineMaxTypeKey : this.combineMaximumTypeKeyRowData,
      combineMaximunTypeDesc: this.selectedDentalCombineMaxTypeDesc != null ? this.selectedDentalCombineMaxTypeDesc : this.combineMaximumTypeDescRowData
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.dental_old_combine_maximum_effective_date.value)
      if (this.dental_old_combine_maximum_expiry_date.value != null && this.dental_old_combine_maximum_expiry_date.value != undefined && this.dental_old_combine_maximum_expiry_date.value != "" && this.dental_old_combine_maximum_expiry_date.value != '00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.dental_old_combine_maximum_expiry_date.value);
      } else {
        rowData['expiredOn'] = "";
      }
    }

    let copy = Object.assign({}, rowData);
    this.DentalCombineMaxList[index] = copy;
    this.benefitObj.dentalSlug.combineMaximum = this.DentalCombineMaxList;
    this.resetDentalCombineMaxInfo();
  }

  resetDentalCombineMaxInfo() {
    this.dental_old_combine_maximum_amount.reset();
    this.dental_old_combine_maximum_type.reset();
    this.dental_old_combine_maximum_period_type.reset();
    this.dental_old_combine_combine_maximum_type.reset();
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dental_old_combine_maximum_effective_date.reset();
      this.dental_old_combine_maximum_expiry_date.reset();

      this.dateNameArray['OldCombineMaximumEffectiveDate'] = null
      this.dateNameArray['OldCombineMaximumExpiryDate'] = null;
    }

    this.selectedCombineMax = {};
    this.DentalCombineMaxEditMode = false;
  }

  deleteDentalCombineMax(index) {
    this.exDialog.openConfirm('Are you sure you want to delete?').subscribe((value) => {
      if (value) {
        this.DentalCombineMaxList.splice(index, 1);
      }
    });
  }
  /*********** End Dental Combine Max Inline table ***************/

  /*********** Start Wellness Combine Max Inline table ***************/
  enableAddWellnessCombineMax() {
    this.selectedCombineMaxWellness = {};
    this.WellnessCombineMaxEditMode = false;
    this.WellnessCombineMaxAddMode = true;
  }

  addNewWellnessCombineMax(newRecord) {
    if (this.editPlanMode) {
      this.wellness_new_combine_maximum_amount.markAsTouched();
      this.wellness_new_combine_maximum_type.markAsTouched();
      this.wellness_new_combine_maximum_period_type.markAsTouched();
      this.wellness_new_combine_combine_maximum_type.markAsTouched();
      this.wellness_new_combine_maximum_effective_date.markAsTouched();
      this.wellness_new_combine_maximum_expiry_date.markAsTouched();

      if (this.wellness_new_combine_maximum_amount.invalid ||
        this.wellness_new_combine_maximum_type.invalid ||
        this.wellness_new_combine_maximum_period_type.invalid ||
        this.wellness_new_combine_combine_maximum_type.invalid ||
        this.wellness_new_combine_maximum_effective_date.invalid ||
        this.wellness_new_combine_maximum_expiry_date.invalid) {
        return;
      }
    } else {
      this.wellness_new_combine_maximum_amount.markAsTouched();
      this.wellness_new_combine_maximum_type.markAsTouched();
      this.wellness_new_combine_maximum_period_type.markAsTouched();
      this.wellness_new_combine_combine_maximum_type.markAsTouched();

      if (this.wellness_new_combine_maximum_amount.invalid ||
        this.wellness_new_combine_maximum_type.invalid ||
        this.wellness_new_combine_maximum_period_type.invalid ||
        this.wellness_new_combine_combine_maximum_type.invalid) {
        return;
      }
    }


    var rowData = {
      maximumAmt: this.wellness_new_combine_maximum_amount.value,
      maximumTypeKey: this.selectedMaximumTypeKey,
      maximumTypeDesc: this.selectedMaximumTypeDesc,
      maximumPeroidKey: this.selectedMaximumPeriodTypeKey,
      maximumPeroidDesc: this.selectedMaximumPeriodTypeDesc,
      combineMaximunTypeKey: this.selectedWellnessCombineMaxTypeKey,
      combineMaximunTypeDesc: this.selectedWellnessCombineMaxTypeDesc
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.wellness_new_combine_maximum_effective_date.value)
      if (this.wellness_new_combine_maximum_expiry_date.value != null && this.wellness_new_combine_maximum_expiry_date.value != undefined && this.wellness_new_combine_maximum_expiry_date.value != "" && this.wellness_new_combine_maximum_expiry_date.value != '00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.wellness_new_combine_maximum_expiry_date.value)
      } else {
        rowData['expiredOn'] = "";
      }
    }

    this.WellnessCombineMaxList.unshift(rowData);
    this.benefitObj.wellnessSlug.combineMaximum = this.WellnessCombineMaxList;
    this.resetNewCombineMaxWellnessRow();
  }

  resetNewCombineMaxWellnessRow() {
    this.WellnessCombineMaxAddMode = false;
    this.wellness_new_combine_maximum_amount.reset();
    this.wellness_new_combine_maximum_type.reset();
    this.wellness_new_combine_maximum_period_type.reset();
    this.wellness_new_combine_combine_maximum_type.reset();
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dateNameArray['NewCombineMaximumEffectiveDate'] = null
      this.dateNameArray['NewCombineMaximumExpiryDate'] = null;
      this.wellness_new_combine_maximum_effective_date.reset();
      this.wellness_new_combine_maximum_expiry_date.reset();
    }
  }

  enableEditWellnessCombineMax(rowData, rowIndex): void {
    this.selectedMaximumTypeKey = null;
    this.selectedMaximumTypeDesc = null;
    this.selectedMaximumPeriodTypeKey = null;
    this.selectedMaximumPeriodTypeDesc = null;
    this.selectedWellnessCombineMaxTypeKey = null;
    this.selectedWellnessCombineMaxTypeDesc = null;

    this.resetNewCombineMaxWellnessRow();
    this.WellnessCombineMaxEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedCombineMax = copy;
    this.selectedCombineMax['rowIndex'] = rowIndex;
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.maximumTypeKeyRowData = rowData.maximumTypeKey;
      this.maximumTypeDescRowData = rowData.maximumTypeDesc;
      this.maximumPeriodTypeKeyRowData = rowData.maximumPeroidKey;
      this.maximumPeriodTypeDescRowData = rowData.maximumPeroidDesc ? rowData.maximumPeroidDesc : rowData.maximumPeriodTypeDesc;
      this.combineMaximumTypeKeyRowData = rowData.combineMaximunTypeKey;
      this.combineMaximumTypeDescRowData = rowData.combineMaximunTypeDesc;

      this.wellness_old_combine_maximum_type.patchValue(this.maximumTypeDescRowData);
      this.wellness_old_combine_maximum_period_type.patchValue(this.maximumPeriodTypeDescRowData);
      this.wellness_old_combine_combine_maximum_type.patchValue(this.combineMaximumTypeDescRowData);

      this.selectedCombineMax['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
      this.setControlDate('OldCombineMaximumEffectiveDate', this.selectedCombineMax['effectiveOn'])
      if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
        this.selectedCombineMax['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
        this.setControlDate('OldCombineMaximumExpiryDate', this.selectedCombineMax['expiredOn'])
      } else {
        this.selectedCombineMax['expiredOn'] = null;
      }
    }
    this.setElementFocus('trgFocusEditCombineMaxEl');
  };

  updateWellnessCombineMax(index) {
    if (this.editPlanMode) {
      this.wellness_old_combine_maximum_amount.markAsTouched();
      this.wellness_old_combine_maximum_type.markAsTouched();
      this.wellness_old_combine_maximum_period_type.markAsTouched();
      this.wellness_old_combine_combine_maximum_type.markAsTouched();
      this.wellness_old_combine_maximum_effective_date.markAsTouched();
      this.wellness_old_combine_maximum_expiry_date.markAsTouched();

      if (this.wellness_old_combine_maximum_amount.invalid ||
        this.wellness_old_combine_maximum_type.invalid ||
        this.wellness_old_combine_maximum_period_type.invalid ||
        this.wellness_old_combine_combine_maximum_type.invalid) {
        return;
      }
    } else {
      this.wellness_old_combine_maximum_amount.markAsTouched();
      this.wellness_old_combine_maximum_type.markAsTouched();
      this.wellness_old_combine_maximum_period_type.markAsTouched();
      this.wellness_old_combine_combine_maximum_type.markAsTouched();

      if (this.wellness_old_combine_maximum_amount.invalid ||
        this.wellness_old_combine_maximum_type.invalid ||
        this.wellness_old_combine_maximum_period_type.invalid ||
        this.wellness_old_combine_combine_maximum_type.invalid) {
        return;
      }
    }


    var rowData = {
      benDentCovCatMaxKey: this.wellness_old_combine_maximum_benWellnessCovCatMaxKey.value,
      maximumAmt: this.wellness_old_combine_maximum_amount.value,
      maximumTypeKey: this.selectedMaximumTypeKey != null ? this.selectedMaximumTypeKey : this.maximumTypeKeyRowData,
      maximumTypeDesc: this.selectedMaximumTypeDesc != null ? this.selectedMaximumTypeDesc : this.maximumTypeDescRowData,
      maximumPeroidKey: this.selectedMaximumPeriodTypeKey != null ? this.selectedMaximumPeriodTypeKey : this.maximumPeriodTypeKeyRowData,
      maximumPeroidDesc: this.selectedMaximumPeriodTypeDesc != null ? this.selectedMaximumPeriodTypeDesc : this.maximumPeriodTypeDescRowData,
      combineMaximunTypeKey: this.selectedWellnessCombineMaxTypeKey != null ? this.selectedWellnessCombineMaxTypeKey : this.combineMaximumTypeKeyRowData,
      combineMaximunTypeDesc: this.selectedWellnessCombineMaxTypeDesc != null ? this.selectedWellnessCombineMaxTypeDesc : this.combineMaximumTypeDescRowData
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.wellness_old_combine_maximum_effective_date.value)
      if (this.wellness_old_combine_maximum_expiry_date.value != null && this.wellness_old_combine_maximum_expiry_date.value != undefined && this.wellness_old_combine_maximum_expiry_date.value != "" && this.wellness_old_combine_maximum_expiry_date.value != '00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.wellness_old_combine_maximum_expiry_date.value);
      } else {
        rowData['expiredOn'] = "";
      }
    }

    let copy = Object.assign({}, rowData);
    this.WellnessCombineMaxList[index] = copy;
    this.benefitObj.wellnessSlug.combineMaximum = this.WellnessCombineMaxList;
    this.resetWellnessCombineMaxInfo();
  }

  resetWellnessCombineMaxInfo() {
    this.wellness_old_combine_maximum_amount.reset();
    this.wellness_old_combine_maximum_type.reset();
    this.wellness_old_combine_maximum_period_type.reset();
    this.wellness_old_combine_combine_maximum_type.reset();
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.wellness_old_combine_maximum_effective_date.reset();
      this.wellness_old_combine_maximum_expiry_date.reset();

      this.dateNameArray['OldCombineMaximumEffectiveDate'] = null
      this.dateNameArray['OldCombineMaximumExpiryDate'] = null;
    }

    this.selectedCombineMax = {};
    this.WellnessCombineMaxEditMode = false;
  }

  deleteWellnessCombineMax(index) {
    this.exDialog.openConfirm('Are you sure you want to delete?').subscribe((value) => {
      if (value) {
        this.WellnessCombineMaxList.splice(index, 1);
      }
    });
  }
  /*********** End Wellness Combine Max Inline table ***************/

  /*********** Start Dental Coverage Max Inline table ***************/

  enableAddDentalCoverageMax() {
    this.selectedCoverageMax = {};
    this.DentalCoverageMaxEditMode = false;
    this.DentalCoverageMaxAddMode = true;
    this.setElementFocus('trgFocusAddCoverageMaxEl');
  }

  enableAddVisionCoverageMax() {
    this.selectedVCoverageMax = {};
    this.VisionCoverageMaxEditMode = false;
    this.VisionCoverageMaxAddMode = true;
    this.setElementFocus('trgFocusAddCoverageMaxEl');
  }

  enableAddHealthCoverageMax() {
    this.selectedHCoverageMax = {};
    this.HealthCoverageMaxEditMode = false;
    this.HealthCoverageMaxAddMode = true;
    this.setElementFocus('trgFocusAddCoverageMaxEl');
  }

  addNewDentalCoverageMax() {

    if (this.editPlanMode) {
      this.dental_new_coverage_maximum_amount.markAsTouched();
      this.dental_new_coverage_maximum_type.markAsTouched();
      this.dental_new_coverage_maximum_period_type.markAsTouched();
      this.dental_new_coverage_maximum_effective_date.markAsTouched();
      this.dental_new_coverage_maximum_expiry_date.markAsTouched();

      if (this.dental_new_coverage_maximum_amount.invalid || this.dental_new_coverage_maximum_type.invalid || this.dental_new_coverage_maximum_period_type.invalid || this.dental_new_coverage_maximum_effective_date.invalid || this.dental_new_coverage_maximum_expiry_date.invalid) {
        return;
      }
    } else {
      this.dental_new_coverage_maximum_amount.markAsTouched();
      this.dental_new_coverage_maximum_type.markAsTouched();
      this.dental_new_coverage_maximum_period_type.markAsTouched();

      if (this.dental_new_coverage_maximum_amount.invalid || this.dental_new_coverage_maximum_type.invalid || this.dental_new_coverage_maximum_period_type.invalid) {
        return;
      }
    }
    switch (this.activeBenefit) {
      case 'dentalSlug':
        if (this.benefitObj.dentalSlug.coverageCategory == '' || this.dentalCovrageCategoryID == 0) {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewDentalCoverageMaxRow();
          return false;
        }
        let dentalSlugIndex = this.searchValueInArrayReturn(this.benefitObj.dentalSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.dentalSlug.coverageCategory[dentalSlugIndex].coverageMax = this.DentalCoverageMaxList;
        break;
      case 'visionSlug':
        if (this.benefitObj.visionSlug.coverageCategory == '' || this.dentalCovrageCategoryID == 0) {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewVisionCoverageMaxRow();
          return false;
        }
        let visionSlugIndex = this.searchValueInArrayReturn(this.benefitObj.visionSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.visionSlug.coverageCategory[visionSlugIndex].coverageMax = this.VisionCoverageMaxList;
        break;
      case 'healthSlug':
        if (this.benefitObj.healthSlug.coverageCategory == '' || this.dentalCovrageCategoryID == 0) {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewHealthCoverageMaxRow();
          return false;
        }
        let healthSlugIndex = this.searchValueInArrayReturn(this.benefitObj.healthSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.healthSlug.coverageCategory[healthSlugIndex].coverageMax = this.HealthCoverageMaxList;
        break;
      case 'drugSlug':
        if (this.benefitObj.drugSlug.coverageCategory == '' || this.dentalCovrageCategoryID == 0) {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewDentalCoverageMaxRow();
          return false;
        }
        let drugSlugIndex = this.searchValueInArrayReturn(this.benefitObj.drugSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.drugSlug.coverageCategory[drugSlugIndex].coverageMax = this.DentalCoverageMaxList;
        break;
      case 'supplementSlug':
        if (this.benefitObj.supplementSlug.coverageCategory == '' || this.dentalCovrageCategoryID == 0) {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewDentalCoverageMaxRow();
          return false;
        }
        let supplementSlugIndex = this.searchValueInArrayReturn(this.benefitObj.supplementSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.supplementSlug.coverageCategory[supplementSlugIndex].coverageMax = this.DentalCoverageMaxList;
        break;
      case 'wellnessSlug':
        if (this.benefitObj.wellnessSlug.coverageCategory == '' || this.dentalCovrageCategoryID == 0) {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewDentalCoverageMaxRow();
          return false;
        }
        let wellnessSlugIndex = this.searchValueInArrayReturn(this.benefitObj.wellnessSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.wellnessSlug.coverageCategory[wellnessSlugIndex].coverageMax = this.DentalCoverageMaxList;
        break;
    }

    var rowData = {
      maximumAmt: this.dental_new_coverage_maximum_amount.value,
      maximumTypeKey: this.selectedMaximumTypeKey,
      maximumTypeDesc: this.selectedMaximumTypeDesc,
      maximumPeroidKey: this.selectedMaximumPeriodTypeKey,
      maximumPeroidDesc: this.selectedMaximumPeriodTypeDesc,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.dental_new_coverage_maximum_effective_date.value),
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.dental_new_coverage_maximum_effective_date.value)
      if (this.dental_new_coverage_maximum_expiry_date.value != null && this.dental_new_coverage_maximum_expiry_date.value != undefined && this.dental_new_coverage_maximum_expiry_date.value != "" && this.dental_new_coverage_maximum_expiry_date.value != '00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.dental_new_coverage_maximum_expiry_date.value);
      } else {
        rowData['expiredOn'] = "";
      }
    }

    this.DentalCoverageMaxList.unshift(rowData);
    this.VisionCoverageMaxList.unshift(rowData);
    this.HealthCoverageMaxList.unshift(rowData);
    this.resetNewDentalCoverageMaxRow();
    this.resetNewVisionCoverageMaxRow();
    this.resetNewHealthCoverageMaxRow();
  }

  resetNewDentalCoverageMaxRow() {
    this.DentalCoverageMaxAddMode = false;
    this.dental_new_coverage_maximum_amount.reset();
    this.dental_new_coverage_maximum_type.reset();
    this.dental_new_coverage_maximum_period_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dateNameArray['NewCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['NewCoverageMaximumExpiryDate'] = null;
      this.dental_new_coverage_maximum_effective_date.reset();
      this.dental_new_coverage_maximum_expiry_date.reset();
    }
  }

  resetNewVisionCoverageMaxRow() {
    this.VisionCoverageMaxAddMode = false;
    this.dental_new_coverage_maximum_amount.reset();
    this.dental_new_coverage_maximum_type.reset();
    this.dental_new_coverage_maximum_period_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dateNameArray['NewCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['NewCoverageMaximumExpiryDate'] = null;
      this.dental_new_coverage_maximum_effective_date.reset();
      this.dental_new_coverage_maximum_expiry_date.reset();
    }
  }

  resetNewHealthCoverageMaxRow() {
    this.HealthCoverageMaxAddMode = false;
    this.dental_new_coverage_maximum_amount.reset();
    this.dental_new_coverage_maximum_type.reset();
    this.dental_new_coverage_maximum_period_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dateNameArray['NewCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['NewCoverageMaximumExpiryDate'] = null;
      this.dental_new_coverage_maximum_effective_date.reset();
      this.dental_new_coverage_maximum_expiry_date.reset();
    }
  }

  enableEditDentalCoverageMax(rowData, rowIndex): void {
    this.selectedMaximumTypeKey = null;
    this.selectedMaximumTypeDesc = null;
    this.selectedMaximumPeriodTypeKey = null;
    this.selectedMaximumPeriodTypeDesc = null;

    this.resetNewDentalCoverageMaxRow();
    this.DentalCoverageMaxEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedCoverageMax = copy;
    this.selectedCoverageMax['rowIndex'] = rowIndex;

    this.maximumTypeKeyRowData = rowData.maximumTypeKey;
    this.maximumTypeDescRowData = rowData.maximumTypeDesc;
    this.maximumPeriodTypeKeyRowData = rowData.maximumPeroidKey;
    this.maximumPeriodTypeDescRowData = rowData.maximumPeroidDesc ? rowData.maximumPeroidDesc : rowData.maximumPeriodTypeDesc;

    this.dental_old_coverage_maximum_type.patchValue(this.maximumTypeDescRowData);
    this.dental_old_coverage_maximum_period_type.patchValue(this.maximumPeriodTypeDescRowData);

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.selectedCoverageMax['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
      this.setControlDate('OldCoverageMaximumEffectiveDate', this.selectedCoverageMax['effectiveOn'])
      if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
        this.selectedCoverageMax['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
        this.setControlDate('OldCoverageMaximumExpiryDate', this.selectedCoverageMax['expiredOn'])
      } else {
        this.selectedCoverageMax['expiredOn'] = null;
      }
    }

    this.setElementFocus('trgFocusEditCoverageMaxEl');
  };

  enableEditVisionCoverageMax(rowData, rowIndex): void {
    this.selectedMaximumTypeKey = null;
    this.selectedMaximumTypeDesc = null;
    this.selectedMaximumPeriodTypeKey = null;
    this.selectedMaximumPeriodTypeDesc = null;

    this.resetNewVisionCoverageMaxRow();
    this.VisionCoverageMaxEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedVCoverageMax = copy;
    this.selectedVCoverageMax['rowIndex'] = rowIndex;

    this.maximumTypeKeyRowData = rowData.maximumTypeKey;
    this.maximumTypeDescRowData = rowData.maximumTypeDesc;
    this.maximumPeriodTypeKeyRowData = rowData.maximumPeroidKey;
    this.maximumPeriodTypeDescRowData = rowData.maximumPeroidDesc ? rowData.maximumPeroidDesc : rowData.maximumPeriodTypeDesc;

    this.dental_old_coverage_maximum_type.patchValue(this.maximumTypeDescRowData);
    this.dental_old_coverage_maximum_period_type.patchValue(this.maximumPeriodTypeDescRowData);

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.selectedVCoverageMax['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
      this.setControlDate('OldCoverageMaximumEffectiveDate', this.selectedVCoverageMax['effectiveOn'])
      if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
        this.selectedVCoverageMax['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
        this.setControlDate('OldCoverageMaximumExpiryDate', this.selectedVCoverageMax['expiredOn'])
      } else {
        this.selectedVCoverageMax['expiredOn'] = null;
      }
    }

    this.setElementFocus('trgFocusEditCoverageMaxEl');
  };

  enableEditHealthCoverageMax(rowData, rowIndex): void {
    this.selectedMaximumTypeKey = null;
    this.selectedMaximumTypeDesc = null;
    this.selectedMaximumPeriodTypeKey = null;
    this.selectedMaximumPeriodTypeDesc = null;

    this.resetNewHealthCoverageMaxRow();
    this.HealthCoverageMaxEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedHCoverageMax = copy;
    this.selectedHCoverageMax['rowIndex'] = rowIndex;

    this.maximumTypeKeyRowData = rowData.maximumTypeKey;
    this.maximumTypeDescRowData = rowData.maximumTypeDesc;
    this.maximumPeriodTypeKeyRowData = rowData.maximumPeroidKey;
    this.maximumPeriodTypeDescRowData = rowData.maximumPeroidDesc ? rowData.maximumPeroidDesc : rowData.maximumPeriodTypeDesc;

    this.dental_old_coverage_maximum_type.patchValue(this.maximumTypeDescRowData);
    this.dental_old_coverage_maximum_period_type.patchValue(this.maximumPeriodTypeDescRowData);

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.selectedHCoverageMax['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
      this.setControlDate('OldCoverageMaximumEffectiveDate', this.selectedHCoverageMax['effectiveOn'])
      if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
        this.selectedHCoverageMax['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
        this.setControlDate('OldCoverageMaximumExpiryDate', this.selectedHCoverageMax['expiredOn'])
      } else {
        this.selectedHCoverageMax['expiredOn'] = null;
      }
    }

    this.setElementFocus('trgFocusEditCoverageMaxEl');
  };

  updateDentalCoverageMax(index) {
    this.dental_old_coverage_maximum_amount.markAsTouched();
    this.dental_old_coverage_maximum_type.markAsTouched();
    this.dental_old_coverage_maximum_period_type.markAsTouched();

    if (this.dental_old_coverage_maximum_amount.invalid || this.dental_old_coverage_maximum_type.invalid || this.dental_old_coverage_maximum_period_type.invalid) {
      return;
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dental_old_coverage_maximum_effective_date.markAsTouched();
      this.dental_old_coverage_maximum_expiry_date.markAsTouched();

      if (this.dental_old_coverage_maximum_effective_date.invalid || this.dental_old_coverage_maximum_expiry_date.invalid) {
        return;
      }
    }

    var rowData = {
      covMaxKey: this.dental_old_covMaxKey.value,
      maximumAmt: this.dental_old_coverage_maximum_amount.value,
      maximumTypeKey: this.selectedMaximumTypeKey != null ? this.selectedMaximumTypeKey : this.maximumTypeKeyRowData,
      maximumTypeDesc: this.selectedMaximumTypeDesc != null ? this.selectedMaximumTypeDesc : this.maximumTypeDescRowData,
      maximumPeroidKey: this.selectedMaximumPeriodTypeKey != null ? this.selectedMaximumPeriodTypeKey : this.maximumPeriodTypeKeyRowData,
      maximumPeroidDesc: this.selectedMaximumPeriodTypeDesc != null ? this.selectedMaximumPeriodTypeDesc : this.maximumPeriodTypeDescRowData,
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.dental_old_coverage_maximum_effective_date.value)
      if (this.dental_old_coverage_maximum_expiry_date.value != null && this.dental_old_coverage_maximum_expiry_date.value != undefined && this.dental_old_coverage_maximum_expiry_date.value != "" && this.dental_old_coverage_maximum_expiry_date.value != '00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.dental_old_coverage_maximum_expiry_date.value);
      } else {
        rowData['expiredOn'] = "";
      }
    }

    let copy = Object.assign({}, rowData);
    this.DentalCoverageMaxList[index] = copy;
    this.VisionCoverageMaxList[index] = copy;
    this.HealthCoverageMaxList[index] = copy;

    switch (this.activeBenefit) {
      case 'dentalSlug':
        if (this.benefitObj.dentalSlug.coverageCategory == '') {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewDentalCoverageMaxRow();
          return false;
        }
        let dentalSlugIndex = this.searchValueInArrayReturn(this.benefitObj.dentalSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.dentalSlug.coverageCategory[dentalSlugIndex].coverageMax = this.DentalCoverageMaxList;
        break;
      case 'visionSlug':
        if (this.benefitObj.visionSlug.coverageCategory == '') {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewVisionCoverageMaxRow();
          return false;
        }
        let visionSlugIndex = this.searchValueInArrayReturn(this.benefitObj.visionSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.visionSlug.coverageCategory[visionSlugIndex].coverageMax = this.VisionCoverageMaxList;
        break;
      case 'healthSlug':
        if (this.benefitObj.healthSlug.coverageCategory == '') {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewHealthCoverageMaxRow();
          return false;
        }
        let healthSlugIndex = this.searchValueInArrayReturn(this.benefitObj.healthSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.healthSlug.coverageCategory[healthSlugIndex].coverageMax = this.HealthCoverageMaxList;
        break;
      case 'drugSlug':
        if (this.benefitObj.drugSlug.coverageCategory == '') {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewDentalCoverageMaxRow();
          return false;
        }
        let drugSlugIndex = this.searchValueInArrayReturn(this.benefitObj.drugSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.drugSlug.coverageCategory[drugSlugIndex].coverageMax = this.DentalCoverageMaxList;
        break;
      case 'supplementSlug':
        if (this.benefitObj.supplementSlug.coverageCategory == '') {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewDentalCoverageMaxRow();
          return false;
        }
        let supplementSlugIndex = this.searchValueInArrayReturn(this.benefitObj.supplementSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.supplementSlug.coverageCategory[supplementSlugIndex].coverageMax = this.DentalCoverageMaxList;
        break;
      case 'wellnessSlug':
        if (this.benefitObj.wellnessSlug.coverageCategory == '') {
          this.toastr.error('Please Select Coverage Category!');
          this.resetNewDentalCoverageMaxRow();
          return false;
        }
        let wellnessSlugIndex = this.searchValueInArrayReturn(this.benefitObj.wellnessSlug.coverageCategory, this.dentalCovrageCategoryID);
        this.benefitObj.wellnessSlug.coverageCategory[wellnessSlugIndex].coverageMax = this.DentalCoverageMaxList;
        break;
    }
    this.resetDentalCoverageMaxInfo();
    this.resetVisionCoverageMaxInfo();
    this.resetHealthCoverageMaxInfo();
  }

  resetDentalCoverageMaxInfo() {
    this.dental_old_coverage_maximum_amount.reset();
    this.dental_old_coverage_maximum_type.reset();
    this.dental_old_coverage_maximum_period_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dental_old_coverage_maximum_effective_date.reset();
      this.dental_old_coverage_maximum_expiry_date.reset();

      this.dateNameArray['OldCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['OldCoverageMaximumExpiryDate'] = null;
    }

    this.selectedCoverageMax = {};
    this.DentalCoverageMaxEditMode = false;
  }

  resetVisionCoverageMaxInfo() {
    this.dental_old_coverage_maximum_amount.reset();
    this.dental_old_coverage_maximum_type.reset();
    this.dental_old_coverage_maximum_period_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dental_old_coverage_maximum_effective_date.reset();
      this.dental_old_coverage_maximum_expiry_date.reset();

      this.dateNameArray['OldCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['OldCoverageMaximumExpiryDate'] = null;
    }

    this.selectedVCoverageMax = {};
    this.VisionCoverageMaxEditMode = false;
  }

  resetHealthCoverageMaxInfo() {
    this.dental_old_coverage_maximum_amount.reset();
    this.dental_old_coverage_maximum_type.reset();
    this.dental_old_coverage_maximum_period_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dental_old_coverage_maximum_effective_date.reset();
      this.dental_old_coverage_maximum_expiry_date.reset();

      this.dateNameArray['OldCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['OldCoverageMaximumExpiryDate'] = null;
    }

    this.selectedHCoverageMax = {};
    this.HealthCoverageMaxEditMode = false;
  }

  deleteCoverageMax(index) {
    this.exDialog.openConfirm('Are you sure you want to delete?').subscribe((value) => {
      if (value) {
        switch (this.activeBenefit) {
          case 'dentalSlug':
          this.DentalCoverageMaxList.splice(index, 1);
          break
          case 'visionSlug':
          this.VisionCoverageMaxList.splice(index, 1);
          break
          case 'healthSlug':
          this.HealthCoverageMaxList.splice(index, 1);
          break
          default:
          this.DentalCoverageMaxList.splice(index, 1);
          break
        }
      }
    });
  }
  /*********** End Dental Coverage Max Inline table ***************/


  /*********** Start Supplemental Coverage Max Inline table ***************/

  enableAddSupplementalCoverageMax() {
    this.selectedSupplementalCoverageMax = {};
    this.SupplementalCoverageMaxEditMode = false;
    this.SupplementalCoverageMaxAddMode = true;
    this.setElementFocus('trgFocusAddCoverageMaxEl');
  }

  enableAddWellnessCoverageMax() {
    this.selectedWellnessCoverageMax  = {};
    this.WellnessCoverageMaxEditMode = false;
    this.WellnessCoverageMaxAddMode  = true;
    this.setElementFocus('trgFocusAddCoverageMaxEl');
  }

  addNewSupplementalCoverageMax() {
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.supplemental_new_coverage_maximum_amount.markAsTouched();
      this.supplemental_new_coverage_maximum_type.markAsTouched();
      this.supplemental_new_coverage_maximum_period_type.markAsTouched();
      this.supplemental_new_coverage_maximum_effective_date.markAsTouched();
      this.supplemental_new_coverage_maximum_expiry_date.markAsTouched();
      this.supplemental_new_coverage_carry_frw_year.markAsTouched()
      if (this.supplemental_new_coverage_maximum_amount.invalid || this.supplemental_new_coverage_maximum_type.invalid || this.supplemental_new_coverage_maximum_period_type.invalid || this.supplemental_new_coverage_maximum_effective_date.invalid || this.supplemental_new_coverage_maximum_expiry_date.invalid ||
        this.supplemental_new_coverage_carry_frw_year.invalid) {
        return;
      }
    } else {
      this.supplemental_new_coverage_maximum_amount.markAsTouched();
      this.supplemental_new_coverage_maximum_type.markAsTouched();
      this.supplemental_new_coverage_maximum_period_type.markAsTouched();
      this.supplemental_new_coverage_carry_frw_year.markAsTouched();

      if (this.supplemental_new_coverage_maximum_amount.invalid || this.supplemental_new_coverage_maximum_type.invalid || this.supplemental_new_coverage_maximum_period_type.invalid ||
        this.supplemental_new_coverage_carry_frw_year.invalid) {
        return;
      }
    }
    switch (this.activeBenefit) {
      case 'supplementSlug':
        if (this.benefitObj.supplementSlug.coverageCategory == '' || this.benefitObj.supplementSlug.coverageCategory.length == 0) {
          this.toastr.error('Please Select At Least One Coverage Category!');
          this.resetNewSupplementalCoverageMaxRow();
          return false;
        }
    
    break
    case 'wellnessSlug':
      if (this.benefitObj.wellnessSlug.coverageCategory == '' || this.benefitObj.wellnessSlug.coverageCategory.length == 0) {
        this.toastr.error('Please Select At Least One Coverage Category!');
        this.resetNewWellnessCoverageMaxRow();
        return false;
      }
    break
    }
  
    var rowData = {
      maximumAmt: this.supplemental_new_coverage_maximum_amount.value,
      maximumTypeKey: this.selectedHsaMaximumTypeKey,
      maximumTypeDesc: this.selectedHsaMaximumTypeDesc,
      maximumPeroidKey: this.selectedHsaMaximumPeriodTypeKey,
      maximumPeroidDesc: this.selectedHsaMaximumPeriodTypeDesc,
      carryFrwdYrs: this.supplemental_new_coverage_carry_frw_year.value, 
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.supplemental_new_coverage_maximum_effective_date.value)
      if (this.supplemental_new_coverage_maximum_expiry_date.value != null && this.supplemental_new_coverage_maximum_expiry_date.value != undefined && this.supplemental_new_coverage_maximum_expiry_date.value != "" && this.supplemental_new_coverage_maximum_expiry_date.value != '00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.supplemental_new_coverage_maximum_expiry_date.value)
      } else {
        rowData['expiredOn'] = "";
      }
    }
    if (this.activeBenefit == 'supplementSlug') {
      this.SupplementalCoverageMaxList.unshift(rowData)
    } else if (this.activeBenefit == 'wellnessSlug') {
      this.wellnessCoverageMaxList.unshift(rowData)
    }
    switch (this.activeBenefit) {
      case 'supplementSlug':
        this.benefitObj.supplementSlug.combineMaximum = this.SupplementalCoverageMaxList;
      break
      case 'wellnessSlug':
        this.benefitObj.wellnessSlug.combineMaximum = this.wellnessCoverageMaxList
      break
    }

    this.resetNewWellnessCoverageMaxRow();
    this.resetNewSupplementalCoverageMaxRow();
  }

  resetNewSupplementalCoverageMaxRow() {
    this.SupplementalCoverageMaxAddMode = false;
    this.supplemental_new_coverage_maximum_amount.reset();
    this.supplemental_new_coverage_maximum_type.reset();
    this.supplemental_new_coverage_maximum_period_type.reset();
    this.supplemental_new_coverage_carry_frw_year.reset()
    this.supplemental_new_coverage_maximum_type.reset();
    this.supplemental_new_coverage_maximum_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dateNameArray['NewSupplementalCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['NewSupplementalCoverageMaximumExpiryDate'] = null;
      this.supplemental_new_coverage_maximum_effective_date.reset();
      this.supplemental_new_coverage_maximum_expiry_date.reset();
    }
  }

  resetNewWellnessCoverageMaxRow() {
    this.WellnessCoverageMaxAddMode = false;
    this.supplemental_new_coverage_maximum_amount.reset();
    this.supplemental_new_coverage_maximum_type.reset();
    this.supplemental_new_coverage_maximum_period_type.reset();
    this.supplemental_new_coverage_carry_frw_year.reset()
    this.supplemental_new_coverage_maximum_type.reset();
    this.supplemental_new_coverage_maximum_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.dateNameArray['NewSupplementalCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['NewSupplementalCoverageMaximumExpiryDate'] = null;
      this.supplemental_new_coverage_maximum_effective_date.reset();
      this.supplemental_new_coverage_maximum_expiry_date.reset();
    }
  }

  enableEditSupplementalCoverageMax(rowData, rowIndex): void {
    this.selectedHsaMaximumTypeKey = null;
    this.selectedHsaMaximumTypeDesc = null;
    this.selectedHsaMaximumPeriodTypeKey = null;
    this.selectedHsaMaximumPeriodTypeDesc = null;
    this.selectedCarryFrwdYear = null,
    this.resetNewSupplementalCoverageMaxRow();
    this.SupplementalCoverageMaxEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedSupplementalCoverageMax = copy;
    this.selectedSupplementalCoverageMax['rowIndex'] = rowIndex;
    this.maximumTypeKeyRowData = rowData.maximumTypeKey;
    this.maximumTypeDescRowData = rowData.maximumTypeDesc;
    this.maximumPeriodTypeKeyRowData = rowData.maximumPeroidKey;
    this.maximumPeriodTypeDescRowData = rowData.maximumPeroidDesc ? rowData.maximumPeroidDesc : rowData.maximumPeriodTypeDesc;

    this.supplemental_old_coverage_maximum_type.patchValue(this.maximumTypeDescRowData);
    this.supplemental_old_coverage_maximum_period_type.patchValue(this.maximumPeriodTypeDescRowData);
    this.supplemental_new_coverage_carry_frw_year.patchValue(rowData.carryFrwdYrs);
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.selectedSupplementalCoverageMax['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
      if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
        this.selectedSupplementalCoverageMax['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
      } else {
        this.selectedSupplementalCoverageMax['expiredOn'] = null;
      }
    }

    this.setElementFocus('trgFocusEditCoverageMaxEl');
  };

  enableEditWellnessCoverageMax(rowData, rowIndex): void {
    //Below switch case added for 'Type' input value in editable mode of Coverage Maximum Table under Wellness
    switch (rowData.maximumTypeKey) {
      case 1:
         rowData.maximumTypeDesc = 'Single'
         break
      case 2:
        rowData.maximumTypeDesc = 'Family';
        break
      case 3:
        rowData.maximumTypeDesc= 'Couple';
        break
      case 4:
        rowData.maximumTypeDesc = 'Person';
        break
    }
    this.selectedHsaMaximumTypeKey = null;
    this.selectedHsaMaximumTypeDesc = null;
    this.selectedHsaMaximumPeriodTypeKey = null;
    this.selectedHsaMaximumPeriodTypeDesc = null;
    this.selectedCarryFrwdYear = null,
    this.resetNewWellnessCoverageMaxRow();
    this.WellnessCoverageMaxEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedWellnessCoverageMax = copy;
    this.selectedWellnessCoverageMax['rowIndex'] = rowIndex;
    this.maximumTypeKeyRowData = rowData.maximumTypeKey;
    this.maximumTypeDescRowData = rowData.maximumTypeDesc;
    this.maximumPeriodTypeKeyRowData = rowData.maximumPeroidKey;
    this.maximumPeriodTypeDescRowData = rowData.maximumPeroidDesc ? rowData.maximumPeroidDesc : rowData.maximumPeriodTypeDesc;

    this.supplemental_old_coverage_maximum_type.patchValue(this.maximumTypeDescRowData);
    this.supplemental_old_coverage_maximum_period_type.patchValue(this.maximumPeriodTypeDescRowData);
    this.supplemental_new_coverage_carry_frw_year.patchValue(rowData.carryFrwdYrs);
    // Check for plan edit mode
    if (this.editPlanMode) {
      this.selectedWellnessCoverageMax['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
      if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
        this.selectedWellnessCoverageMax['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
      } else {
        this.selectedWellnessCoverageMax['expiredOn'] = null;
      }
    }

    this.setElementFocus('trgFocusEditCoverageMaxEl');
  };

  updateSupplementalCoverageMax(index) {
    this.supplemental_old_coverage_maximum_amount.markAsTouched();
    this.supplemental_old_coverage_maximum_type.markAsTouched();
    this.supplemental_old_coverage_maximum_period_type.markAsTouched();

    if (this.supplemental_old_coverage_maximum_amount.invalid || this.supplemental_old_coverage_maximum_type.invalid || this.supplemental_old_coverage_maximum_period_type.invalid) {
      return;
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.supplemental_old_coverage_maximum_effective_date.markAsTouched();
      this.supplemental_old_coverage_maximum_expiry_date.markAsTouched();

      if (this.supplemental_old_coverage_maximum_effective_date.invalid || this.supplemental_old_coverage_maximum_expiry_date.invalid) {
        return;
      }
    }


    // Wellness check added to resolve issue of duplicate in wellness and supplemental discipline
    switch (this.activeBenefit) {
      case 'supplementSlug':
        if (this.benefitObj.supplementSlug.coverageCategory == '' || this.benefitObj.supplementSlug.coverageCategory.length == 0) {
          this.toastr.error('Please Select At Least One Coverage Category!');
          this.resetNewSupplementalCoverageMaxRow();
          return false;
        }
      break
      case 'wellnessSlug':
        if (this.benefitObj.wellnessSlug.coverageCategory == '' || this.benefitObj.wellnessSlug.coverageCategory.length == 0) {
          this.toastr.error('Please Select At Least One Coverage Category!');
          this.resetNewWellnessCoverageMaxRow();
          return false;
        }
      break
    } 
    var rowData = {
      covMaxKey: this.supplemental_old_covMaxKey.value,
      maximumAmt: this.supplemental_old_coverage_maximum_amount.value,
      benefitCarryFrwdKey: this.supplemental_old_benefitCarryFrwdKey.value,
      maximumTypeKey: this.selectedHsaMaximumTypeKey != null ? this.selectedHsaMaximumTypeKey : this.maximumTypeKeyRowData,
      maximumTypeDesc: this.selectedHsaMaximumTypeDesc != null ? this.selectedHsaMaximumTypeDesc : this.maximumTypeDescRowData,
      maximumPeroidKey: this.selectedHsaMaximumPeriodTypeKey != null ? this.selectedHsaMaximumPeriodTypeKey : this.maximumPeriodTypeKeyRowData,
      carryFrwdYrs: this.supplemental_new_coverage_carry_frw_year.value != null ? this.supplemental_new_coverage_carry_frw_year.value : this.supplemental_new_coverage_carry_frw_year.value,

      maximumPeroidDesc: this.selectedHsaMaximumPeriodTypeDesc != null ? this.selectedHsaMaximumPeriodTypeDesc : this.maximumPeriodTypeDescRowData,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.supplemental_old_coverage_maximum_effective_date.value)
    }

    // Check for plan edit mode
    if (this.editPlanMode) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.supplemental_old_coverage_maximum_effective_date.value)
      if (this.supplemental_old_coverage_maximum_expiry_date.value != null && this.supplemental_old_coverage_maximum_expiry_date.value != undefined && this.supplemental_old_coverage_maximum_expiry_date.value != "" && this.supplemental_old_coverage_maximum_expiry_date.value != '00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.supplemental_old_coverage_maximum_expiry_date.value);
      } else {
        rowData['expiredOn'] = "";
      }
    }
   

    let supplmentalRowDataCopy
    let wellnessRowDataCopy
    if (this.activeBenefit == 'supplementSlug') {
      supplmentalRowDataCopy = Object.assign({}, rowData);
    } else if (this.activeBenefit == 'wellnessSlug') {
      wellnessRowDataCopy = Object.assign({}, rowData);
    }
    switch (this.activeBenefit) {
      case 'supplementSlug':
        this.SupplementalCoverageMaxList[index] = supplmentalRowDataCopy;
        this.benefitObj.supplementSlug.combineMaximum = this.SupplementalCoverageMaxList;
      break
      case 'wellnessSlug':
        this.wellnessCoverageMaxList[index] = wellnessRowDataCopy;
        this.benefitObj.wellnessSlug.combineMaximum = this.wellnessCoverageMaxList;
      break
    }

    this.resetSupplementalCoverageMaxInfo();
    this.resetWellnessCoverageMaxInfo();
  }

  resetSupplementalCoverageMaxInfo() {
    this.supplemental_old_coverage_maximum_amount.reset();
    this.supplemental_old_coverage_maximum_type.reset();
    this.supplemental_old_coverage_maximum_period_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.supplemental_old_coverage_maximum_effective_date.reset();
      this.supplemental_old_coverage_maximum_expiry_date.reset();

      this.dateNameArray['OldSupplementalCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['OldSupplementalCoverageMaximumExpiryDate'] = null;
    }

    this.selectedSupplementalCoverageMax = {};
    this.SupplementalCoverageMaxEditMode = false;
  }

  resetWellnessCoverageMaxInfo() {
    this.supplemental_old_coverage_maximum_amount.reset();
    this.supplemental_old_coverage_maximum_type.reset();
    this.supplemental_old_coverage_maximum_period_type.reset();

    // Check for plan edit mode
    if (this.editPlanMode) {
      this.supplemental_old_coverage_maximum_effective_date.reset();
      this.supplemental_old_coverage_maximum_expiry_date.reset();

      this.dateNameArray['OldSupplementalCoverageMaximumEffectiveDate'] = null
      this.dateNameArray['OldSupplementalCoverageMaximumExpiryDate'] = null;
    }

    this.selectedWellnessCoverageMax  = {};
    this.WellnessCoverageMaxEditMode = false;
  }

  deleteSupplementalCoverageMax(index) {
    this.exDialog.openConfirm('Are you sure you want to delete?').subscribe((value) => {
      if (value) {
        switch (this.activeBenefit) {
          case 'supplementSlug':
          this.SupplementalCoverageMaxList.splice(index, 1);
          break
          case 'wellnessSlug':
            this.wellnessCoverageMaxList.splice(index, 1);
          break
        }
      }
    });
  }
  /*********** End Dental Coverage Max Inline table ***************/

  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(() => {
    }, 100);
  }

  resetTerminateBenefitCategoryForm() {
    this.terminateBenefitCategoryForm.reset();
  }

  /**
   * Validate the Form Fields
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
   * Create Date On blur
   * @param event 
   * @param frmControlName 
   * @param formName 
   * @param currentDate 
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
    }
    if (event.reason == 2) {
      if (formName == 'terminateBenefitCategoryForm') {
        this.terminateBenefitCategoryForm.patchValue(datePickerValue);
      }
    }
  }

  /**
   * 
   * @param event 
   * @param frmControlName 
   * @param selDate 
   * @param currentDate 
   */
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
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null;
    }

    if (event.reason == 2) {

      if (frmControlName == 'dental_new_combine_maximum_effective_date') {
        this.dental_new_combine_maximum_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn'] && this.dental_new_combine_maximum_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn']);
          var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.dental_new_combine_maximum_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.dental_new_combine_maximum_effective_date.value && this.dental_new_combine_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.dental_new_combine_maximum_effective_date.value.date, this.dental_new_combine_maximum_expiry_date.value.date);
          this.setExpiryDateError('dental_new_combine_maximum_expiry_date', error);
        }

      } else if (frmControlName == 'dental_new_combine_maximum_expiry_date') {
        this.dental_new_combine_maximum_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.dental_new_combine_maximum_effective_date.value && this.dental_new_combine_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.dental_new_combine_maximum_effective_date.value.date, this.dental_new_combine_maximum_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }

      } else if (frmControlName == 'dental_old_combine_maximum_effective_date') {
        this.dental_old_combine_maximum_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn'] && this.dental_old_combine_maximum_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn']);
          var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.dental_old_combine_maximum_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.dental_old_combine_maximum_effective_date.value && this.dental_old_combine_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.dental_old_combine_maximum_effective_date.value.date, this.dental_old_combine_maximum_expiry_date.value.date);
          this.setExpiryDateError('dental_old_combine_maximum_expiry_date', error);
        }

      } else if (frmControlName == 'dental_old_combine_maximum_expiry_date') {
        this.dental_old_combine_maximum_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.dental_old_combine_maximum_effective_date.value && this.dental_old_combine_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.dental_old_combine_maximum_effective_date.value.date, this.dental_old_combine_maximum_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }
      }
      else if (frmControlName == 'supplemental_new_coverage_maximum_effective_date') {
        this.supplemental_new_coverage_maximum_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn'] && this.supplemental_new_coverage_maximum_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn']);
          var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.supplemental_new_coverage_maximum_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.supplemental_new_coverage_maximum_effective_date.value && this.supplemental_new_coverage_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.supplemental_new_coverage_maximum_effective_date.value.date, this.supplemental_new_coverage_maximum_expiry_date.value.date);
          this.setExpiryDateError('supplemental_new_coverage_maximum_expiry_date', error);
        }

      } else if (frmControlName == 'supplemental_new_coverage_maximum_expiry_date') {
        this.supplemental_new_coverage_maximum_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.supplemental_new_coverage_maximum_effective_date.value && this.supplemental_new_coverage_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.supplemental_new_coverage_maximum_effective_date.value.date, this.supplemental_new_coverage_maximum_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }

      } else if (frmControlName == 'supplemental_old_coverage_maximum_effective_date') {
        this.supplemental_old_coverage_maximum_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn'] && this.supplemental_old_coverage_maximum_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn']);
          var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.supplemental_old_coverage_maximum_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.supplemental_old_coverage_maximum_effective_date.value && this.supplemental_old_coverage_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.supplemental_old_coverage_maximum_effective_date.value.date, this.supplemental_old_coverage_maximum_expiry_date.value.date);
          this.setExpiryDateError('supplemental_old_coverage_maximum_expiry_date', error);
        }

      } else if (frmControlName == 'supplemental_old_coverage_maximum_expiry_date') {
        this.supplemental_old_coverage_maximum_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.supplemental_old_coverage_maximum_effective_date.value && this.supplemental_old_coverage_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.supplemental_old_coverage_maximum_effective_date.value.date, this.supplemental_old_coverage_maximum_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }

        /* ---------Validation For Dental Coverage Max ---------------*/

      } else if (frmControlName == 'dental_new_coverage_maximum_effective_date') {
        this.dental_new_coverage_maximum_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn'] && this.dental_new_coverage_maximum_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn']);
          var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.dental_new_coverage_maximum_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.dental_new_coverage_maximum_effective_date.value && this.dental_new_coverage_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.dental_new_coverage_maximum_effective_date.value.date, this.dental_new_coverage_maximum_expiry_date.value.date);
          this.setExpiryDateError('dental_new_coverage_maximum_expiry_date', error);
        }

      } else if (frmControlName == 'dental_new_coverage_maximum_expiry_date') {
        this.dental_new_coverage_maximum_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.dental_new_coverage_maximum_effective_date.value && this.dental_new_coverage_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.dental_new_coverage_maximum_effective_date.value.date, this.dental_new_coverage_maximum_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }

      } else if (frmControlName == 'dental_old_coverage_maximum_effective_date') {
        this.dental_old_coverage_maximum_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn'] && this.dental_old_coverage_maximum_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn']);
          var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.dental_old_coverage_maximum_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.dental_old_coverage_maximum_effective_date.value && this.dental_old_coverage_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.dental_old_coverage_maximum_effective_date.value.date, this.dental_old_coverage_maximum_expiry_date.value.date);
          this.setExpiryDateError('dental_old_coverage_maximum_expiry_date', error);
        }

      } else if (frmControlName == 'dental_old_coverage_maximum_expiry_date') {
        this.dental_old_coverage_maximum_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.dental_old_coverage_maximum_effective_date.value && this.dental_old_coverage_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.dental_old_coverage_maximum_effective_date.value.date, this.dental_old_coverage_maximum_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }
      }



      if (frmControlName == 'wellness_new_combine_maximum_effective_date') {
        this.wellness_new_combine_maximum_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn'] && this.wellness_new_combine_maximum_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn']);
          var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.wellness_new_combine_maximum_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.wellness_new_combine_maximum_effective_date.value && this.wellness_new_combine_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.wellness_new_combine_maximum_effective_date.value.date, this.wellness_new_combine_maximum_expiry_date.value.date);
          this.setExpiryDateError('wellness_new_combine_maximum_expiry_date', error);
        }

      } else if (frmControlName == 'wellness_new_combine_maximum_expiry_date') {
        this.wellness_new_combine_maximum_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.wellness_new_combine_maximum_effective_date.value && this.wellness_new_combine_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.wellness_new_combine_maximum_effective_date.value.date, this.wellness_new_combine_maximum_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }

      } else if (frmControlName == 'wellness_old_combine_maximum_effective_date') {
        this.wellness_old_combine_maximum_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn'] && this.wellness_old_combine_maximum_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.getBenefitDataFromDB.planInfoJson[0]['effectiveOn']);
          var error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.wellness_old_combine_maximum_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.wellness_old_combine_maximum_effective_date.value && this.wellness_old_combine_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.wellness_old_combine_maximum_effective_date.value.date, this.wellness_old_combine_maximum_expiry_date.value.date);
          this.setExpiryDateError('wellness_old_combine_maximum_expiry_date', error);
        }

      } else if (frmControlName == 'wellness_old_combine_maximum_expiry_date') {
        this.wellness_old_combine_maximum_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.wellness_old_combine_maximum_effective_date.value && this.wellness_old_combine_maximum_expiry_date.value) {
          var error = this.changeDateFormatService.compareTwoDates(this.wellness_old_combine_maximum_effective_date.value.date, this.wellness_old_combine_maximum_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }
      }
      else {
        return false;
      }
    }

    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
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
  * set expriy Date Error;
  */
  setExpiryDateError(frmControlName, errorFlag) {
    var self = this;
    if (errorFlag.isError == true) {
      self[frmControlName].setErrors({ "ExpiryDateNotValid": true });
    } else {
      self[frmControlName].setErrors();
    }
  }

  /** 
   * Bind date with control 
   */
  setControlDate(frmControlName, obj) {
    if (obj == null) {
      return false;
    }
    this.dateNameArray[frmControlName] = {
      year: obj.date.year,
      month: obj.date.month,
      day: obj.date.day
    };
  }

  /**
   * Show Coverage Maximum History
   */
  coverageMaximumHistory() {
    let reqParam = [];
    switch (this.activeBenefit) {
      case 'dentalSlug':
        var coverage_category_url = PlanApi.getDentalCoverageMaxHistUrl;
        reqParam = [{ 'key': 'dentCovKey', 'value': this.dentalCovKey }];
        break;
      case 'visionSlug':
        var coverage_category_url = PlanApi.getVisionCoverageMaxHistUrl;
        reqParam = [{ 'key': 'visCovKey', 'value': this.visionCovKey }];
        break;
      case 'healthSlug':
        var coverage_category_url = PlanApi.getHealthCovMaxMaxHistUrl;
        reqParam = [{ 'key': 'hlthCovKey', 'value': this.healthCovKey }]
        break;
      case 'drugSlug':
        var coverage_category_url = PlanApi.getDrugCovMaxHistUrl;
        reqParam = [{ 'key': 'drugCovKey', 'value': this.drugCovKey }]
        break;
      case 'supplementSlug':
        var coverage_category_url = PlanApi.getSupplementalCovMaxHistUrl;
        reqParam = [{ 'key': 'divisionKey', 'value': this.supplementCovKey }]
        break;
      case 'wellnessSlug':
        var coverage_category_url = PlanApi.getWellnessCovMaxHistUrl;
        reqParam = [{ 'key': 'wellnessCovKey', 'value': this.wellnessCovKey }]
        break;
    }
    var coverageCategoryTableId = "coverage_category_history"

    if (!$.fn.dataTable.isDataTable('#coverage_category_history')) {
      var dateCols = ['effectiveOn', 'expiredOn']
      this.dataTableService.jqueryDataTable(coverageCategoryTableId, coverage_category_url, 'full_numbers', this.coverage_category_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, dateCols)
    }
    else {
      this.dataTableService.jqueryDataTableReload(coverageCategoryTableId, coverage_category_url, reqParam)
    }
  }

  /**
   * Show Combine Maximum History
   */
  combineMaximumHistory() {
    let reqParam = [];
    var combine_maximum_url = PlanApi.getDentalCombineMaxHistUrl;
    reqParam = [{ 'key': 'benefitKey', 'value': this.benefitKey }];
    var combineMaximumTableId = "combine_maximum_history"
    if (!$.fn.dataTable.isDataTable('#combine_maximum_history')) {
      var dateCols = ['effectiveOn', 'expiredOn']
      this.dataTableService.jqueryDataTable(combineMaximumTableId, combine_maximum_url, 'full_numbers', this.combine_maximum_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, dateCols)
    }
    else {
      this.dataTableService.jqueryDataTableReload(combineMaximumTableId, combine_maximum_url, reqParam)
    }
  }

  combineMaximumHistoryWellness() {
    let reqParam = [];
    var combine_maximum_url = PlanApi.getWellnessCombineMaxHistUrl;
    reqParam = [{ 'key': 'benefitKey', 'value': this.wellnessBenefitKey }];
    var combineMaximumTableId = "combine_maximum_history"
    if (!$.fn.dataTable.isDataTable('#combine_maximum_history')) {
      var dateCols = ['effectiveOn', 'expiredOn']
      this.dataTableService.jqueryDataTable(combineMaximumTableId, combine_maximum_url, 'full_numbers', this.combine_maximum_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, dateCols)
    }
    else {
      this.dataTableService.jqueryDataTableReload(combineMaximumTableId, combine_maximum_url, reqParam)
    }
  }

  onCheckMainCheckbox(event) {
    if (event.target.checked) {
      for (var i in this.configObject.data) {
        if (this.configObject.data[i].ischecked == false) {
          this.selectUnSelectCategory(this.configObject.data[i], event);
          this.configObject.data[i].$$gtRowClass = '';
          $('#mainCheckbox_' + this.configObject.data[i].$$gtRowId).prop('checked', true)
        }
      }
      this.genericDataTableInit(this.configObject.data)
      this.dentalCovrageCategoryID = 0;
    } else {
      for (var i in this.configObject.data) {
        this.selectUnSelectCategory(this.configObject.data[i], event);
        this.configObject.data[i].$$gtRowClass = '';
        $('#mainCheckbox_' + this.configObject.data[i].$$gtRowId).prop('checked', false)
      }
      this.genericDataTableInit(this.configObject.data)
    }
  }

  /**
  * Update PayClaim And PayLab columns value in the benefit category listing on select All
  * @param rowID 
  * @param fieldName 
  * @param event 
  */
  selectAllPayClaimPayLab(fieldName, event) {

    switch (fieldName) {
      case 'payClaim':
        if (event.target.checked) {
          for (var i in this.configObject.data) {
            if (this.configObject.data[i].ischecked) {
              this.configObject.data[i].payClaim = 'T';
              $('#' + fieldName + '_' + this.configObject.data[i].$$gtRowId).prop('checked', true)
            }
          }
        } else {
          for (var i in this.configObject.data) {
            this.configObject.data[i].payClaim = 'F';
            $('#' + fieldName + '_' + this.configObject.data[i].$$gtRowId).prop('checked', false)
          }
        }
        break;
      case 'payLab':
        if (event.target.checked) {
          for (var i in this.configObject.data) {
            if (this.configObject.data[i].ischecked) {
              this.configObject.data[i].payLab = 'T';
              $('#' + fieldName + '_' + this.configObject.data[i].$$gtRowId).prop('checked', true)
            }
          }
        } else {
          for (var i in this.configObject.data) {
            this.configObject.data[i].payLab = 'F';
            $('#' + fieldName + '_' + this.configObject.data[i].$$gtRowId).prop('checked', false)
          }
        }
        break;
    }
    this.benefitObj
  }

}
/* Benefits Component Ends */