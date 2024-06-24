import { Component, OnInit, Input, ViewChildren, QueryList, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';
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
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, Params, RouteReuseStrategy } from '@angular/router';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { ToastrService } from 'ngx-toastr';
import { UftApi } from '../../../unit-financial-transaction-module/uft-api';
import { CardApi } from '../../../card-module/card-api'
import { CompanyApi } from '../../company-api';
import { TranslateService } from '@ngx-translate/core';

import { CommentModelComponent } from '../../../common-module/shared-component/CommentsModal/comment-model/comment-model.component'; // Import comments json
import { CommentEditModelComponent } from '../../../common-module/shared-component/comment-edit-model/comment-edit-model.component';
import { CompanyService } from '../../company.service';
import { Location } from '@angular/common';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { ETIMEDOUT } from 'constants';
import { debug } from 'console';
import { CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { FeeGuideApi } from "../../../fee-guide-module/fee-guide-api";
import { GtConfig, GtRow, GenericTableComponent } from '@angular-generic-table/core';
import { TreeNode } from '../../tree-table/treenode';

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
@Component({
  selector: 'app-plan-view',
  templateUrl: './plan-view.component.html',
  styleUrls: ['./plan-view.component.css'],
  providers: [DatatableService, ChangeDateFormatService, HmsDataServiceService, ExDialog, ToastrService, TranslateService],

})
export class PlanViewComponent implements OnInit {
  public plans = [];

  wellnessKeyExist: string;
  unlimitedPlan: string;
  alberta: boolean = false;
  isFeeGuideProvinceExist = false;
  isFeeGuideScheduleExist = false;
  businessType: any;
  type: any;
  datatableService: any;
  dropdownSettings: any
  @ViewChildren(DataTableDirective)

  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  myDatePickerPlaceholder;
  contactHistorytableData: any;
  getCovMax: any;
  getCovMaxxValue: boolean;
  getDivMaxValue: boolean;
  getCcMaxValue: boolean;
  getHsaMaxValue: boolean;
  getHsaMax: any;
  getDivMax: any;
  getCcMax: any;
  todaydate: { date: { year: number; month: number; day: number; }; };
  claimId: any;
  showTotalsSection: boolean;
  feeguideSection: boolean;
  showdivisionMaximumSection: boolean;
  supplementKeyExist: string;
  drugKeyExist: string;
  healthKeyExist: string;
  visionKeyExist: string;
  dentalKeyExist: string;
  covcatList = [];
  covCat = [];
  CovCatList = [];
  plan = [];
  
  serviceCode: FormControl;
  procCode: FormControl
  effective_date: FormControl;
  expiry_date: FormControl;
  planList = []
  TabKeysExist: boolean;
  isSelectedOneCategory: boolean;
  terminateCoverageCategory: any;
  benefitsList: any;
  benefitsJson: any;
  firstTab: any;
  finalArr = [];
  terminateCoverageKeys: any;
  terminateCoverage: any[];
  TabKeysDataEmpty: boolean = false;
  benefitsJsonKeys = [];
  dateNameArray: any = {};
  divisionNumber: any;
  planKeyUrlId: any;
  planNumber: any;
  combineMaximum: any;
  coverageCategoryAndMaximum: any;
  arrData = []
  isSuspendedHistoryExist = false;
  isDivCommHistoryExist = false;
  isPrpHistoryExist = false;
  isCarryForwardHistoryExist = false;
  isDedHistoryExist = false;
  isProvinceHistoryExist: boolean;
  AddInfo: FormGroup;
  @Input() PlanViewFormGroup: FormGroup; //Intitialize form 
  TerminateCategoryFormGroup: FormGroup; //Intitialize form 
  usclsFormGroup: FormGroup; //Intitialize form 
  usclsFormGroupStep2: FormGroup; //Intitialize form 

  @ViewChildren(DataTableDirective)
  @ViewChild(CommentModelComponent) commentFormData; // to acces variable of Comment from 
  @ViewChild(CommentEditModelComponent) commentEditFormData; // to acces variable of Comment from 

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  PlanInfoFormData: any;
  arrProratingList;
  arrDeductibleList;
  arrYearTypeList;
  coKey;
  plansKey
  divisionKey
  divisionUnique
  planUniqueId
  companyUniqueId
  plansKeyUrlId
  coKeyUrlId
  divisionKeyUrlId
  plan_eff_date
  company_eff_date
  commentObject = { 'comments': [] };
  firstComment
  hideCommentButton

  addMode: boolean = true;
  addItemMode: boolean = false;

  viewMode: boolean = false;
  editMode: boolean = false;

  public planMax = [];
  public CoverageList = [];
  public CoverageList1 = [];
  public planCoverageRulesList = [];
  public planCoverageCategoriesList = [];

  public CoverageListDental = [];
  public CoverageListVision = [];
  public CoverageListHealth = [];
  public CoverageListDrug = [];
  public CoverageListSupplement = [];
  public CoverageListWellness = [];
  public FeeguideSechedule = [];
  public FeeguideProvince = [];

  dataToggle: string
  provinceDataTarget: string
  provinceId: string
  provinceTitle: string

  scheduleDataTarget: string
  scheduleId: string
  scheduleTitle: string
  scheduleClass: string
  provinceClass: string

  divisionMaxHistoryDataTarget: string
  divisionMaxHistoryId: string
  divisionMaxHistoryTitle: string
  divisionMaxHistoryClass: string

  isDivisionDetailsHistoryExist = true;
  proratingTypeTarget: string;
  proratingTypeClass: string;
  proratingTypeId: string;
  proratingTypeTitle: string;
  familyDeductibleTypeTarget: string;
  familyDeductibleTypeClass: string;
  familyDeductibleTypeId: string;
  familyDeductibleTypeTitle: string;
  isDivMaxHistoryExist: boolean;
  mainPlanArray = [{
    "copyDivision": 'F',
    "planComments": 'F',
    "addPlanComment": 'F',
    "editPlan": 'F',
    "terminateCoverage": 'F',
    "addTerminateCoverage": 'F'
  }];
  planStatus: any;
  showLoader: boolean = false;
  planSection: boolean;
  divisionNumSection: boolean;
  companySection: boolean;            //#1276 issue solved
  divisionDetailSection: boolean;
  proratingSection: boolean;
  carryForwardSection: boolean;
  feeguideSceheduleData: boolean;
  feeguideProvinceData: boolean;
  feedGuideDetailSection: boolean = false;
  RulesSection: boolean = false;
  dentalCarryForwardFlag: boolean;
  visionCarryForwardFlag: boolean;
  healthCarryForwardFlag: boolean;
  suppliementCarryForwardFlag: boolean;
  wellnessCarryForwardFlag: boolean;
  cardholderId: any = null;
  DivisionCarryForwardFlag: boolean;
  procedureKey: any;
  public ProcedureParentServiceDataRemote: RemoteData;
  pparentKey
  parentKey
  procedureKey1: any;
  selectedCovCat: any[];
  filterCovCat: any[];
  companyDataRemote: any;
  currentUser: any;
  selectedCompany: any;
  selectedCompanyName: any;
  selecteCoKey: any;
  selecteCoID: any;
  selectedplan: any = [];
  businessTypeList: any = [];
  title: any;
  arrNewRow = {
    "effectiveOn": "",
    "expiredOn": "",
    "idx": "",
    "suspendedInd": false
  }
  selectedRowId: string;
  requestedData: any[];
  newRecordValidate: boolean;
  serviceProviderAddMode: any;
  providerKey: any;
  disciplineKey: any;
  updateEffectiveRow: any = [];
  updateExpiredRow: any;
  expired: boolean;
  parentServiceId
  addEditMode: boolean;
  selectedCombineMax: {};
  DentalCombineMaxEditMode: boolean;
  DentalCombineMaxAddMode: boolean;
  nullAddMode: boolean = false;
  dentalParentServiceDataRemote: RemoteData;
  ServiceId: any;
  serviceKey: any;
  shortDesc: any;
  covKey: any;
  futureDate: boolean;
  disciplineCoverageForm: FormGroup
  isDentalSlug: boolean = false
  isVisionSLug: boolean = false
  isHealthSlug: boolean = false
  isDrugSlug: boolean = false
  isSupplementalSlug: boolean = false
  isWellnessSlug: boolean = false
  discTitle
  discId
  dentalCovCatList = []
  public configObject: GtConfig<RowData>;
  @ViewChild(GenericTableComponent)
  public myTable: GenericTableComponent<any, any>;
  customTexts = {
    'loading': 'Loading...',
    'noData': 'No data available in table',
  };
  hideGoToPage: boolean = true;
  enableCovCatForCopyDivision: boolean = false;
  benefitObj: any = {};
  dentalCovrageCategoryID;
  timeFrameList
  dentalServiceList = []
  selectedDentalNode = []
  serviceLayerDentalBoolean: boolean = true;
  arrDataDental: TreeNode[];
  arrDataVision: TreeNode[];
  visionServiceList = []
  serviceLayerVisionBoolean: boolean = true
  selectedVisionNode = []
  serviceLayerArray: any
  visionCovCatList = []
  healthCovCatList = []
  selectedHealthNode = []
  arrDataHealth: TreeNode[]
  healthServiceList = []
  serviceLayerHealthBoolean: boolean = true
  drugCovCatList = []
  arrDataDrug: TreeNode[]
  drugServiceList = []
  serviceLayerDrugBoolean: boolean = true
  selectedDrugNode = []
  supplementCovCatList = []
  arrDataSupplement: TreeNode[]
  supplementServiceList = []
  serviceLayerSupplementBoolean: boolean = true
  selectedSupplementNode = []
  wellnessCovCatList = []
  arrDataWellness: TreeNode[]
  wellnessServiceList = []
  serviceLayerWellnessBoolean: boolean = true
  selectedWellnessNode = []
  FormGroup: FormGroup;
  rulesArray: any[];
  addCoverageData: { disciplineCoverageData: { planNum: any; divisionNum: any; divisionDescription: any; effDate: any; dependantAge1: any; dependantAge2: any; }; benefitsJson: any; coKey: any; coName: any; plansKey: any; plansName: any; };
  coKeyForAddCategoryPayload: any;
  coNameForAddCategoryPayload: any;
  plansKeyForAddCategoryPayload: any;
  plansNameForAddCategoryPayload: any;

  constructor(
    private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private exDialog: ExDialog,
    private route: ActivatedRoute,
    private ToastrService: ToastrService,
    private companyService: CompanyService,
    public cdRef: ChangeDetectorRef,
    private translate: TranslateService,

    private location: Location,
    public currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private router: Router) {

    this.serviceCode = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.number]);
    this.procCode = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.number]);
    this.effective_date = new FormControl('', [Validators.required]);
    this.expiry_date = new FormControl('', [Validators.required]);



    this.dentalParentServiceDataRemote = completerService.remote(
      null,
      "dentalServiceDesc,dentalServiceId",
      "mergedDescription"
    );
    this.dentalParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });


    this.dentalParentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getDentalPredectiveParentService + `/${term}`;
    });
    this.dentalParentServiceDataRemote.dataField('result');


    this.route.queryParams.subscribe((params: Params) => {
      this.companyPlanKey = params.planId;
      this.divisionKey = params.divisionId;
      this.cardholderId = params.cardholderId;
    });

    companyService.showCommentFlag.subscribe((value) => {
      this.firstComment = value.firstComment;
      this.hideCommentButton = value.showCommentButton;
    });
    this.ProcedureParentServiceDataRemote = completerService.remote(
      null,
      "key,cd",
      "cd"
    );
    this.ProcedureParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.ProcedureParentServiceDataRemote.urlFormater((term: any) => {
      return PlanApi.getPredictiveProcIdUrl + `/D` + `/${term}`
    });
    this.ProcedureParentServiceDataRemote.dataField('result');

    // Log #1185: Plan Amendments UI
    this.configObject = {
      settings: [
        { objectKey: 'checkbox', columnOrder: 0 },
        { objectKey: 'covCatDesc', columnOrder: 1 },
        { objectKey: 'adult', columnOrder: 2, visible: true },
        { objectKey: 'covCoverageTimeFrameKey', columnOrder: 3, visible: false },
        { objectKey: 'adultLab', columnOrder: 4, visible: true },
        { objectKey: 'dept', columnOrder: 5, visible: true },
        { objectKey: 'coverageTimeFrameKey', columnOrder: 6, visible: false },
        { objectKey: 'deptLab', columnOrder: 7, visible: true },
        { objectKey: 'payLab', columnOrder: 8, visible: true },
        { objectKey: 'payClaim', columnOrder: 9, visible: true }
      ],
      fields: [
        {
          name: 'Included', objectKey: 'checkbox',
          value: () => ''
        },
        {
          name: 'Coverage Category', objectKey: 'covCatDesc'
        },
        {
          name: 'Adult%', objectKey: 'adult'
        },
        {
          name: 'Adult Time Frame', objectKey: 'covCoverageTimeFrameKey'
        },
        {
          name: 'Adult Lab%', objectKey: 'adultLab'
        },
        {
          name: 'Dep%', objectKey: 'dept'
        },
        {
          name: 'Dep Time Frame', objectKey: 'coverageTimeFrameKey'
        },
        {
          name: 'Dep Lab%', objectKey: 'deptLab'
        },
        {
          name: 'Pay Lab', objectKey: 'payLab',
          value: () => { true }
        },
        {
          name: 'Pay Claim', objectKey: 'payClaim',
          value: () => { true }
        },
      ],
      data: []
    };
    this.serviceLayerArray = { "data": [] };
  }
  isScheduleHistoryExist: boolean;
  onSelectPro(selected: CompleterItem, type) {
    if (selected && type == 'parentKey') {
      this.procedureKey = selected.originalObject.key;

    }

  }
  onSelectPro1(selected: CompleterItem, type) {

    if (selected && type == 'parentKey') {
      this.procedureKey1 = selected.originalObject.key;

    }

  }


  // Method of angular2-multiselect Dropdown for Select the values  
  onSelect(selected: CompleterItem, type) {
    if (selected && type == 'parentServiceId') {
      this.ServiceId = selected.originalObject.dentalServiceId;
      this.serviceKey = selected.originalObject.dentalServiceKey;
      this.shortDesc = selected.originalObject.dentalServiceDesc;
    }

  }


  /*********** Start Dental Combine Max Inline table ***************/
  enableAddMode() {
    this.nullAddMode = true
    this.selectedCombineMax = {};
    this.DentalCombineMaxEditMode = false;
    this.DentalCombineMaxAddMode = true;
  }
  // LOG 652 



  addNewDentalCombineMax() {
    this.nullAddMode = true
    this.DentalCombineMaxAddMode = false;
    var rowData = {
      expiry_date: this.expiry_date.value.formatted,
      effective_date: this.effective_date.value.formatted,
      procCode: this.procCode.value,
      serviceCode: this.serviceCode.value,
    }
    this.CovCatList.push(rowData)

    this.resetFeilds();
  }
  resetFeilds() {
    this.expiry_date.reset();
    this.effective_date.reset();
    this.procCode.reset();
    this.serviceCode.reset();
  }
  enableEditDentalCombineMax(rowData, rowIndex) {
    this.DentalCombineMaxEditMode = true;

    let copy = Object.assign({}, rowData)
    this.selectedCombineMax = copy;
    this.selectedCombineMax['rowIndex'] = rowIndex;

    this.expiry_date.patchValue(rowData.expiry_date);
    this.effective_date.patchValue(rowData.effective_date);
    this.procCode.patchValue(rowData.procCode);
    this.serviceCode.patchValue(rowData.serviceCode);
  }
  resetNewCombineMaxRow() {
    this.DentalCombineMaxAddMode = false;
    this.nullAddMode = false

  }
  updateDentalCombineMax(index) {
    var rowData = {
      expiry_date: this.expiry_date.value.formatted,
      effective_date: this.effective_date.value.formatted,
      procCode: this.procCode.value,
      serviceCode: this.serviceCode.value,
    }
    let copy = Object.assign({}, rowData);
    this.selectedCombineMax['rowIndex'] = null
    this.CovCatList[index] = copy;
    this.resetFeilds();
    this.DentalCombineMaxEditMode = false;

  }
  deleteDentalCombineMax(index) {
    this.exDialog.openConfirm('Are you sure you want to delete?').subscribe((value) => {
      if (value) {
        this.CovCatList.splice(index, 1);
        if (this.CovCatList.length == 0) {
          this.nullAddMode = false;
        }
      }
    });
  }
  // log 652 
  getCovCatList() {
    var URL = PlanApi.getDentalCoverageCategoryList;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let arr = [];
        let covCategoryArray = []
        let removeDentalCovCategory = ["Endodontic", "Endoperio", "Exclusions", "Majorrestorative", "Periodontalscaling", "Periodontic", "Prosthodontic", "Scale", "Temporomandibular Joint"];
        for (var i in data.result) {
          let editIndex = removeDentalCovCategory.findIndex(x => x === data.result[i].covCatDesc);
          if (editIndex == -1) {
            covCategoryArray.push(data.result[i]);
          }
        }

        for (var ii = 0; ii < covCategoryArray.length; ii++) {
          arr.push({ 'id': covCategoryArray[ii].covCatKey, 'itemName': covCategoryArray[ii].covCatDesc })

        }
        this.covcatList = arr
      }
    });
  }


  /**
    * Get selected multi select list
    * @param item 
    */
  onSelectplanMultiDropDown(item: any, type) {
    this.selectedplan = [];

    for (var j = 0; j < this.plan.length; j++) {
      this.selectedplan.push({ 'id': this.plan[j]['id'], 'itemName': this.plan[j]['itemName'] })
    }
    this.usclsFormGroup.controls[type].setValue(this.selectedCovCat);
  }
  /**
   * Get selected multi select list
   * @param item 
   */
  onSelectMultiDropDown(item: any, type) {
    this.selectedCovCat = []
    for (var j = 0; j < this.covCat.length; j++) {
      this.selectedCovCat.push({ 'id': this.covCat[j]['id'], 'itemName': this.covCat[j]['itemName'] })
    }
    this.usclsFormGroup.controls[type].setValue(this.selectedCovCat);
  }


  onDeSelectplanAllMultiDropDown(event, type) {
    this.selectedplan = []
  }

  /**
* On select all multi select dropdown values
* @param items 
* @param type 
*/



  onSelectAllMultiDropDown(items: any, type) {
    this.selectedCovCat = []
    for (var j = 0; j < this.covCat.length; j++) {
      this.selectedCovCat.push({ 'id': this.covCat[j]['id'], 'itemName': this.covCat[j]['itemName'] })
    }
    this.usclsFormGroup.controls[type].setValue(this.selectedCovCat);
  }
  /**
 * Empty the dropdown value
 * @param items 
 * @param type 
 */
  onDeSelectAllMultiDropDown(items: any, type) {
    this.selectedCovCat = []
  }

  onDeSelectAllplanMultiDropDown(items: any, type) {
    this.selectedplan = []
  }

  onSelectAllplanMultiDropDown(items: any, type) {
    this.selectedCovCat = []
    for (var j = 0; j < this.plan.length; j++) {
      this.selectedplan.push({ 'id': this.plan[j]['id'], 'itemName': this.plan[j]['itemName'] })
    }
    this.usclsFormGroup.controls[type].setValue(this.selectedCovCat);
  }

  getPlanByCompanyCokey(value) {
    let requiredInfo = {
      "coKey": value
    }
    this.hmsDataServiceService.postApi(CardApi.getCompanyPlanUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let arr = []
        this.plans = data.result
        for (var ii = 0; ii < this.plans.length; ii++) {
          arr.push({ 'id': this.plans[ii].unitKey, 'itemName': this.plans[ii].plansName.replace('/null', '') })

        }
        this.planList = arr
      } else {
        this.plans = [];
        this.planList = []
      }
      error => {
      }
    })
  }


  onDeSelectplanMultiDropDown(item: any, type) {
    this.selectedplan = []
    if (this.plan.length > 0) {
      for (var j = 0; j < this.plan.length; j++) {
        this.selectedplan.push({ 'id': this.plan[j]['id'], 'itemName': this.plan[j]['itemName'] })
      }
    } else {
      this.usclsFormGroup.controls[type].setValue('')
    }
  }
  /**
* Remove multi select
* @param item 
* @param type 
*/

  onDeSelectMultiDropDown(item: any, type) {
    this.selectedCovCat = []
    if (this.covCat.length > 0) {
      for (var j = 0; j < this.covCat.length; j++) {
        this.selectedCovCat.push({ 'id': this.covCat[j]['id'], 'itemName': this.covCat[j]['itemName'] })
      }
    } else {
      this.usclsFormGroup.controls[type].setValue('')
    }
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {

        this.currentUser = this.currentUserService.currentUser
        this.getPredictiveCompanySearchData(this.completerService);

        let checkArray = this.currentUserService.authChecks['VPL'].concat(this.currentUserService.authChecks['APC'], this.currentUserService.authChecks['TCV'])
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser

        this.getPredictiveCompanySearchData(this.completerService);


        let checkArray = this.currentUserService.authChecks['VPL'].concat(this.currentUserService.authChecks['APC'], this.currentUserService.authChecks['TCV'])
        this.getAuthCheck(checkArray)
      })
    }
    this.getCovCatList();
    this.getBusinessType()
    this.provinceId = "plan-view-province"
    this.provinceTitle = "Fee Guide Province History"
    this.provinceClass = "history-ico"
    this.provinceDataTarget = "#provinceHistory"
    this.scheduleId = "plan-view-schedule"
    this.scheduleTitle = "Fee Guide Schedule History"
    this.scheduleClass = "history-ico"
    this.scheduleDataTarget = "#scheduleHistory"

    this.proratingTypeTarget = "#ProratingTypeHistory"
    this.proratingTypeClass = "history-ico"
    this.proratingTypeId = "prorating_history"
    this.proratingTypeTitle = "Prorating Type History"

    this.familyDeductibleTypeTarget = "#DeductableTypeHistory"
    this.familyDeductibleTypeClass = "history-ico"
    this.familyDeductibleTypeId = "family_deductable_history"
    this.familyDeductibleTypeTitle = "Family Deductible Type History"

    this.todaydate = this.changeDateFormatService.getToday();
    window.scrollTo(0, 0)

    this.TerminateCategoryFormGroup = new FormGroup({
      'termination_date': new FormControl('', [Validators.required]),
      'dental': new FormControl(''),
      'health': new FormControl(''),
      'drug': new FormControl(''),
      'vision': new FormControl(''),
      'supplemental': new FormControl(''),
      'wellness': new FormControl('')
    });
    this.AddInfo = new FormGroup({
      expiredOn: new FormControl('', [Validators.required]),
      effectiveOn: new FormControl(''),
      serviceCode: new FormControl(''),
      procCode: new FormControl(''),

    })
    this.usclsFormGroup = new FormGroup({
      'usclsEffectiveDate': new FormControl(''),
      'proc_code': new FormControl(''),
      'lookUpProc_code': new FormControl(''),
      'reviewInd': new FormControl(''),
      'qcInd': new FormControl(''),
      'searchCompanyy': new FormControl(''),
      'plan': new FormControl(''),
      'businessType': new FormControl(''),
      'covCat': new FormControl(''),

    });
    this.usclsFormGroupStep2 = new FormGroup({
      'usclsEffectiveDate': new FormControl('', [Validators.required]),
      'proc_code': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]),
      'lookUpProc_code': new FormControl(''),
      'approvalInd': new FormControl(''),
      'reviewInd': new FormControl(''),
      'qcInd': new FormControl('')

    });
    this.PlanViewFormGroup = new FormGroup({
      'company_id': new FormControl(''),
      'company_name': new FormControl(''),
      'effective_date': new FormControl(''),
      'business_type': new FormControl(''),
      'effective_date1': new FormControl(''),
      'expiry_date1': new FormControl(''),
      'typeof_year': new FormControl(''),
      'client_catg': new FormControl(''),
      'design_type': new FormControl(''),
      'extra_benefits': new FormControl(''),
      'effective_date2': new FormControl(''),
      'expiry_date2': new FormControl(''),
      'terminatedOn': new FormControl(''),
      'description': new FormControl(''),
      'family_deductible_type': new FormControl(''),
      'family_deductible': new FormControl(''),
      'single_deductible': new FormControl(''),
      'division_detail_effective_date': new FormControl(''),
      'division_detail_expiry_date': new FormControl(''),
      'prorating_type': new FormControl(''),
      'carry_forward': new FormControl(''), // division max carry forward
      'start_date': new FormControl(''),
      'start_dateCarry': new FormControl(''),
      'end_date': new FormControl(''),
      'end_dateCarry': new FormControl(''),
      'benefits': new FormControl(''),
      'effective_date3': new FormControl(''),
      'dependant_age1': new FormControl(''),
      'dependant_age2': new FormControl(''),
      'benefits2': new FormControl(''),
      'Effective_date4': new FormControl(''),
      'dependant_age11': new FormControl(''),
      'dependant_age22': new FormControl(''),
      'procedure_code': new FormControl(''),
      'plan_no': new FormControl(''),
      'division_no': new FormControl(''),
      'division_name': new FormControl(''),
      'schedule': new FormControl(''),
      'province': new FormControl(''),
      'fee_guide_date': new FormControl(''),
      'payOnProvidersAdd': new FormControl(''),
      'carryForwardYear': new FormControl(''),
      'carryForwardEffectiveOn': new FormControl(''),
      'carryForwardExpireOn': new FormControl(''),
      'visionCarryForwardYear': new FormControl(''),
      'visionCarryForwardEffectiveOn': new FormControl(''),
      'visionCarryForwardExpireOn': new FormControl(''),
      'healthCarryForwardYear': new FormControl(''),
      'healthCarryForwardEffectiveOn': new FormControl(''),
      'healthCarryForwardExpireOn': new FormControl(''),
      'supplimentCarryForwardYear': new FormControl(''),
      'supplimentCarryForwardEffectiveOn': new FormControl(''),
      'supplimentCarryForwardExpireOn': new FormControl(''),
    })
    this.route.queryParams.subscribe((params: Params) => {
      this.coKeyUrlId = params['companyId'];
      this.planKeyUrlId = params['planId'];
      this.divisionKeyUrlId = params['divisonId'];
      if (params['claimId']) {
        this.showTotalsSection = true;
        this.claimId = params['claimId']
        this.type = params['type']
        this.GetClaimDetails(this.claimId, this.type)
      } else {
        this.showTotalsSection = false;
      }
    });

    this.planCoverageRulesList = this.getplanCoverageRules();
    this.planCoverageCategoriesList = this.getplanCoverageCategories();
    this.GetCompanyPlan(this.coKeyUrlId, this.planKeyUrlId, this.divisionKeyUrlId);
    this.GetCompanyDetailByCompanyCoKey(this.coKeyUrlId);
    this.GetDivisionStatus(this.divisionKeyUrlId);

    this.dtOptions['ClaimTotalCOVMax'] = Constants.dtOptionsConfig
    this.dtTrigger['ClaimTotalCOVMax'] = new Subject();
    // Show rules in Plan View with expand option
    this.dtOptions['rulesTableNew'] = Constants.dtOptionsConfig
    this.dtTrigger['rulesTableNew'] = new Subject();
    this.dtOptions['SPGrdEligHistory'] = Constants.dtOptionsConfig
    this.dtTrigger['SPGrdEligHistory'] = new Subject();

    this.dataToggle = "modal"

    this.divisionMaxHistoryDataTarget = "#divisionMaximumHistoryDivMax"
    this.divisionMaxHistoryId = "division_maximum_history"
    this.divisionMaxHistoryTitle = "Division Max History"
    this.divisionMaxHistoryClass = "history-ico"

    // Log #1185 - Discipline Coverage 
    this.disciplineCoverageForm = new FormGroup({
      planNum: new FormControl(''),
      divisionNum: new FormControl(''),
      divisionDescription: new FormControl(''),
      effDate: new FormControl('', [Validators.required]),
      dependantAge1: new FormControl(''),
      dependantAge2: new FormControl('')
    });

    this.FormGroup = new FormGroup({
      'coverageCat': new FormControl(''),
      'effectiveDate': new FormControl('', [Validators.required]),
      'expiryDate': new FormControl(''),
      'rules': new FormControl('')
    });
    // Log #1185: Plan Amendments
    this.route.queryParams.subscribe((params: Params) => {
      if (params['planType'] == 'copyDivision') {
        this.enableCovCatForCopyDivision = true;
      }
    })

    this.getTimeFrameList()
  }

  /**
   * Call on select the company name in predictive search
   * @param selected 
   */
  onCompanyNameSelected(selected: CompleterItem) {
    this.planList = [];
    this.plan = []
    if (selected) {
      this.selectedCompany = selected.originalObject;
      this.selectedCompanyName = selected.originalObject.coName
      this.selecteCoKey = selected.originalObject.coKey
      this.selecteCoID = selected.originalObject.coId;
      this.getPlanByCompanyCokey(this.selecteCoKey)
    } else {
      this.selectedCompanyName = ""
      this.selecteCoKey = ''
      this.selecteCoID = ''
    }

  }
  getBusinessType() {
    var URL = CompanyApi.getBusinessTypeUrl;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        this.businessTypeList = data.result;

      }
    });
  }
  /**
* Call on blur the company name text box
* @param filterReport 
*/
  onCompanyNameBlur(filterReport) {
    if (filterReport.value.searchCompany) {
      if (filterReport.value.searchCompany.includes(' / ')) {
        var splitCompanyName = filterReport.value.searchCompany.toString().split(' / ')
        if (splitCompanyName.length > 0) {
          this.selectedCompanyName = splitCompanyName[0]
        }
      } else {
        this.selectedCompanyName = ''
      }
    } else {
      this.selectedCompany = ''
      this.selectedCompanyName = ''
      this.selecteCoKey = ''
      this.selecteCoID = ''
    }
  }
  getPredictiveCompanySearchData(completerService) {
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getAllPredectiveCompany + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getPredectiveCompany + '/' + businessTypeKey + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    }
  }
  ngAfterViewInit() {
    this.PlanViewFormGroup.disable();
    this.cdRef.detectChanges();
  }
  next() {
    if (this.usclsFormGroup.valid) {
      var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.PlanViewFormGroup.value.effective_date1
      );
      let error = this.changeDateFormatService.compareTwoDates(effectiveDt.date, this.usclsFormGroup.value.usclsEffectiveDate.date);
      if (error.isError == true) {
        this.usclsFormGroup.controls['usclsEffectiveDate'].setErrors({
          "rulesDateNotValid": true
        });
        return false
      } else {
        let excludeInd = 'F';
        let covServAssgnKey = '';

       
        let serviceData = {
          "covServAssgnKey": covServAssgnKey,// Should be NULL in case of ADD
          "covKey": this.covKey,
          "serviceId": this.ServiceId,
          "serviceKey": this.serviceKey,
          "excludeInd": excludeInd,
          "serviceDesc": this.shortDesc,
        }
        let URL = PlanApi.addServiceCov;
        this.showLoader = true;
        this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            if (this.addMode) {
              this.ToastrService.success(this.translate.instant('serviceCovered.added'));
              this.showLoader = false;
            } else {
              this.ToastrService.success(this.translate.instant('serviceCovered.updated'));
              this.showLoader = false;
            }

          }
          else {
            this.ToastrService.error(this.translate.instant('serviceCovered.error'));
            this.showLoader = false;
          }

        }, (e) => {
          this.showLoader = false;
        })
      }

    } else {
      this.validateAllFormFields(this.usclsFormGroup);//Form Validations
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }


  }

  back() {
    $('#step11').trigger('click');
    $('#step1').addClass('active')
    $('#step2').removeClass('active')
  }
  /**
  * @description : This Function is used to convert entered value to valid date format.
  * @params : "event" is datepicker value
  * @params : "frmControlName" is datepicker name/Form Control Name
  * For Reference : https://www.npmjs.com/package/angular4-datepicker
  * @return : None
  */
  changeDateFormat(event, frmControlName, formName, currentDate) {

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

    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
    }

    if (event.reason == 2) {
      this[formName].patchValue(datePickerValue);
    }
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
    if (frmControlName == 'termination_date' && event.value != null && event.value != '') {
      let futureDate = this.changeDateFormatService.compareTwoDate(this.changeDateFormatService.formatDate(event.value), this.PlanViewFormGroup.value.effective_date1)
      let input = this.changeDateFormatService.changeDateFormat(event);
      let formatDate = this.changeDateFormatService.convertDateObjectToString(input)
      let _i = this.changeDateFormatService.convertStringDateToObject(this.PlanViewFormGroup.value.effective_date1);
      let _f = this.changeDateFormatService.convertDateObjectToString(_i)
      this.futureDate = this.changeDateFormatService.compareTwoDate(_f, formatDate)
      // also termination date should not be before plan effective date 
      if (this.futureDate) {
        // Termination Date Can't Be Greater Than Company Effective Date
        this.TerminateCategoryFormGroup.controls['termination_date'].setErrors({ "termonateDatePlanEffectiveDate": true })
        return

      } else {
        this.TerminateCategoryFormGroup.controls['termination_date'].setErrors(null)
        return
      }
    }
  }

  schedule_columns = [
    { title: "Schedule", data: 'dentFeeGuideSchedDesc' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' }
  ]
  /**
   * get Schedule History
   */
  getScheduleHistory() {
    var schedule_url = PlanApi.getScheduleHistory;
    var scheduleTableId = "schedule";
    var reqParamProHist = [{ 'key': 'divisionKey', 'value': this.divisionKeyUrlId }]
    if (!$.fn.dataTable.isDataTable('#schedule')) {
      var dateCols = ['effectiveOn', 'expiredOn']
      this.dataTableService.jqueryDataTable(scheduleTableId, schedule_url, 'full_numbers', this.schedule_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined, dateCols)
    }
    else {
      this.dataTableService.jqueryDataTableReload(scheduleTableId, schedule_url, reqParamProHist)
    }
  }

  province_columns = [
    { title: "Province", data: 'provinceName' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' }
  ]
  /**
   * Get Provience History
   */
  getProvinceHistory() {
    var province_url = PlanApi.getProvinceHistory;
    var provinceTableId = "province";
    var reqParamProHist = [{ 'key': 'divisionKey', 'value': this.divisionKeyUrlId }]
    if (!$.fn.dataTable.isDataTable('#province')) {
      var dateCols = ['effectiveOn', 'expiredOn']
      this.dataTableService.jqueryDataTable(provinceTableId, province_url, 'full_numbers', this.province_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined, dateCols)
    }
    else {
      this.dataTableService.jqueryDataTableReload(provinceTableId, province_url, reqParamProHist)
    }
  }

  division_maximum_columns = [
    { title: "Amount", data: 'divMaxAmt' },
    { title: "Maximum Type", data: 'maxTypeKey' },
    { title: "Maximum Period Type", data: 'maxPeriodTypeKey' },
    { title: "Dental", data: 'visionInd' }, // changes required
    { title: "Vision", data: 'visionInd' },
    { title: "Health", data: 'healthInd' },
    { title: "drugSlug", data: 'drugInd' },
    { title: "Carry Forward Years", data: 'carryFrwdYrs' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' } // changes required
  ]
  /**
   * Get Division Maximum History 
   */
  getDivisionMaximumHistory() {
    var division_maximum_url = PlanApi.getDivisionMaximumHistory;
    var divisionMaximumTableId = "division_maximum_history";
    var reqParamDivMaxHist = [{ 'key': 'divisionKey', 'value': this.divisionKeyUrlId }]
    if (!$.fn.dataTable.isDataTable('#division_maximum_history')) {
      this.dataTableService.jqueryDataTable(divisionMaximumTableId, division_maximum_url, 'full_numbers', this.division_maximum_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamDivMaxHist, '', undefined)
    }
    else {
      this.dataTableService.jqueryDataTableReload(divisionMaximumTableId, division_maximum_url, reqParamDivMaxHist)
    }
  }

  /**
   * Get Claim
   * @param claimId
   * @param type
   */
  GetClaimDetails(claimId, type) {
    let submitType
    if (type == 1) {
      submitType = "dentalClaim"
    } else if (type == 2) {
      submitType = "healthClaim"
    } else if (type == 3) {
      submitType = "visionClaim"
    } else if (type == 4) {
      submitType = "drugClaim"
    } else if (type == 5) {
      submitType = "hsaClaim"
    }
    var submitData = {}
    submitData[submitType] = {
      "claimKey": claimId,
      "userId": localStorage.getItem('id')
    }
    var URL = PlanApi.getClaimDetailsUrl;
    this.hmsDataServiceService.postApi(URL, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        //Start API
        let requiredInfo = {
          "cardholderKey": data.result.cardholderKey,
          "refDate": this.changeDateFormatService.convertDateObjectToString(this.todaydate),
          "claimKey": data.result.dentalClaim.claimKey,
          "disciplineKey": data.result.dentalClaim.disciplineKey
        }
        this.hmsDataServiceService.postApi(PlanApi.getTotalForClaim, requiredInfo).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            let cardResult = this.contactHistorytableData = data.result
            this.getCcMax = cardResult.getCcMax
            this.getDivMax = this.contactHistorytableData = cardResult.getDivMax
            this.getHsaMax = cardResult.getHsaMax
            this.getHsaMaxValue = (cardResult.getHsaMax.length > 0) ? true : false;
            this.getCcMaxValue = (cardResult.getCcMax.length > 0) ? true : false;
            this.getDivMaxValue = (cardResult.getDivMax.length > 0) ? true : false;
            this.getCovMaxxValue = (cardResult.getCovMax.length > 0) ? true : false;
            this.getCovMax = cardResult.getCovMax
            if (!$.fn.dataTable.isDataTable('#ClaimTotalCOVMax')) {
              this.dtTrigger['ClaimTotalCOVMax'].next()
            } else {
              this.reloadTable('ClaimTotalCOVMax');
            }
          } else {
            this.getHsaMaxValue = false;
            this.getCcMaxValue = false;
            this.getDivMaxValue = false;
            this.getCovMaxxValue = false;
            this.getCcMax = []
            this.getDivMax = []
            this.getHsaMax = []
            this.getCovMax = []
          }
          error => {
          }
        })
        //End API
      } else {
      }
    })
  }

  reloadTable(tableID) {
    this.datatableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  /**
   * Get Company Plan
   * @param coKeyUrlId 
   * @param planKeyUrlId 
   * @param divisionKeyUrlId 
   */
  GetCompanyPlan(coKeyUrlId, planKeyUrlId, divisionKeyUrlId) {
    this.CoverageListDental = [];
    this.CoverageListVision = [];
    this.CoverageListHealth = [];
    this.CoverageListDrug = [];
    this.CoverageListSupplement = [];
    this.CoverageListWellness = [];
    this.benefitsJsonKeys = []
    this.finalArr = []
    let planDataJson = {
      "coKey": coKeyUrlId,
      "plansKey": planKeyUrlId,
      "divisionKey": divisionKeyUrlId
    }
    
    var URL = PlanApi.getPlanViewUrl;
    this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {

      // Below 4 parameters are for add descipline category save functionality.
      this.coKeyForAddCategoryPayload = data.result.planInfoJson.coKey
      this.coNameForAddCategoryPayload = data.result.planInfoJson.coName
      this.plansKeyForAddCategoryPayload = data.result.planInfoJson.plansKey
      this.plansNameForAddCategoryPayload = data.result.planInfoJson.plansName
      
      if (data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
        //  Show rules in Plan View with expand option
        this.rulesArray = []
        for (let i=0; i<data.result.rulesJson.dentalRule.length; i++){
          this.rulesArray[i] = data.result.rulesJson.dentalRule[i] 
        }
        if (!$.fn.dataTable.isDataTable('#rulesTableNew')) {
          this.dtTrigger['rulesTableNew'].next()
        } else {
          this.reloadTable('rulesTableNew')
        }

        /** Start Collapse Checks */
        if (data.result.planInfoJson.effectiveOn == "" && data.result.planInfoJson.yrTypeDesc == "" && data.result.planInfoJson.plansExtraBenefitInd != "T") {
          this.planSection = false
        } else {
          this.planSection = true
        }

        if (data.result.planInfoJson.effectiveOn == "") {
          this.divisionNumSection = true  
        } else {
          this.divisionNumSection = false 
        }

        // #1276 for company issue fixed
        if (data.result.planInfoJson == "") {
          this.companySection = true  
        } else {
          this.companySection = false 
        }

        if (data.result.planInfoJson.hasOwnProperty("deductTypeDesc")) {
          this.divisionDetailSection = true
        } else {
          this.divisionDetailSection = false
        }

        if (data.result.planInfoJson.hasOwnProperty("divisionFamilyDeductAmt")) {
          this.divisionDetailSection = true
        } else {
          this.divisionDetailSection = false
        }

        if (data.result.planInfoJson.hasOwnProperty("divisionSingleDeductAmt")) {
          this.divisionDetailSection = true
        } else {
          this.divisionDetailSection = false
        }

        if (data.result.planInfoJson.hasOwnProperty("deductibleEffectiveOn")) {
          this.divisionDetailSection = true
        } else {
          this.divisionDetailSection = false
        }

        if (data.result.planInfoJson.hasOwnProperty("deductibleExpiredOn")) {
          this.divisionDetailSection = true
        } else {
          this.divisionDetailSection = false
        }

        if (data.result.planInfoJson.proratingEffectiveOn == ""
          && data.result.planInfoJson.proratingExpiredOn == ""
        ) {
          this.proratingSection = false
        } else {
          this.proratingSection = true
        }
        if (data.result.divisionMaxJson.effectiveOn == ""
          && data.result.divisionMaxJson.expiredOn == ""
        ) {
          this.carryForwardSection = false
        } else {
          this.carryForwardSection = true
        }
       
        if (data.result.planInfoJson.hasOwnProperty("prorateTypeDesc")) {
          this.proratingSection = true
          if (data.result.divisionMaxJson != undefined && data.result.divisionMaxJson.length > 0) {
            var carrySection = data.result.divisionMaxJson[0].carryFrwdYrs;
          }
        } else {
          this.proratingSection = false
          if (data.result.divisionMaxJson != undefined && data.result.divisionMaxJson.length > 0) {
            var carrySection = data.result.divisionMaxJson[0].carryFrwdYrs;
          }
        }
        if (data.result.divisionMaxJson != undefined && data.result.divisionMaxJson.length > 0 && carrySection != 0) {
          if (data.result.divisionMaxJson.hasOwnProperty('carryFrwdYrs')) {
            this.carryForwardSection = true
          }
        } else {
          this.carryForwardSection = false
        }

        /**issue number 731 start 
         * variables are used below also
        */
        this.dentalCarryForwardFlag = false;
        if (data.result.benefitsJson.dentalSlug != undefined && data.result.benefitsJson.dentalSlug.benefitCarryFwd != undefined && data.result.benefitsJson.dentalSlug.benefitCarryFwd.length > 0) {
          var dentalCarryForwardCarryFrwdYrs = data.result.benefitsJson.dentalSlug.benefitCarryFwd[0].carryFrwdYrs;
          var dentalCarryForwardEffectiveOn = data.result.benefitsJson.dentalSlug.benefitCarryFwd[0].effectiveOn;
          var dentalCarryForwardExpiredOn = data.result.benefitsJson.dentalSlug.benefitCarryFwd[0].expiredOn;
          this.dentalCarryForwardFlag = true;
        }

        this.visionCarryForwardFlag = false;
        if (data.result.benefitsJson.visionSlug != undefined && data.result.benefitsJson.visionSlug.benefitCarryFwd != undefined && data.result.benefitsJson.visionSlug.benefitCarryFwd.length > 0) {
          var visionCarryForwardCarryFrwdYrs = data.result.benefitsJson.visionSlug.benefitCarryFwd[0].carryFrwdYrs;
          var visionCarryForwardEffectiveOn = data.result.benefitsJson.visionSlug.benefitCarryFwd[0].effectiveOn;
          var visionCarryForwardExpiredOn = data.result.benefitsJson.visionSlug.benefitCarryFwd[0].expiredOn;
          this.visionCarryForwardFlag = true;
        }

        this.healthCarryForwardFlag = false;
        if (data.result.benefitsJson.healthSlug != undefined && data.result.benefitsJson.healthSlug.benefitCarryFwd != undefined && data.result.benefitsJson.healthSlug.benefitCarryFwd.length > 0) {
          var healthCarryForwardCarryFrwdYrs = data.result.benefitsJson.healthSlug.benefitCarryFwd[0].carryFrwdYrs;
          var healthCarryForwardEffectiveOn = data.result.benefitsJson.healthSlug.benefitCarryFwd[0].effectiveOn;
          var healthCarryForwardExpiredOn = data.result.benefitsJson.healthSlug.benefitCarryFwd[0].expiredOn;
          this.healthCarryForwardFlag = true;
        }
        this.suppliementCarryForwardFlag = false;
        if (data.result.benefitsJson.supplementSlug != undefined && data.result.benefitsJson.supplementSlug.benefitCarryFwd != undefined && data.result.benefitsJson.supplementSlug.benefitCarryFwd.length > 0) {
          var supplimentCarryForwardCarryFrwdYrs = data.result.benefitsJson.supplementSlug.benefitCarryFwd[0].carryFrwdYrs;
          var supplimentCarryForwardEffectiveOn = data.result.benefitsJson.supplementSlug.benefitCarryFwd[0].effectiveOn;
          var supplimentCarryForwardExpiredOn = data.result.benefitsJson.supplementSlug.benefitCarryFwd[0].expiredOn;
          this.suppliementCarryForwardFlag = true;
        }
        this.wellnessCarryForwardFlag = false;

        if (data.result.benefitsJson.wellnessSlug != undefined && data.result.benefitsJson.wellnessSlug.benefitCarryFwd != undefined && data.result.benefitsJson.wellnessSlug.benefitCarryFwd.length > 0) {
          var supplimentCarryForwardCarryFrwdYrs = data.result.benefitsJson.wellnessSlug.benefitCarryFwd[0].carryFrwdYrs;
          var supplimentCarryForwardEffectiveOn = data.result.benefitsJson.wellnessSlug.benefitCarryFwd[0].effectiveOn;
          var supplimentCarryForwardExpiredOn = data.result.benefitsJson.wellnessSlug.benefitCarryFwd[0].expiredOn;
          this.wellnessCarryForwardFlag = true;
        }
        //Division Max Carry Forward
        this.DivisionCarryForwardFlag = false;
        if (data.result.divisionMaxJson != undefined && data.result.divisionMaxJson.length > 0) {
          var CarryFrwdyrsDivision = data.result.divisionMaxJson[0].carryFrwdYrs;
          var CarryFrwdyrsDivisionEffective = data.result.divisionMaxJson[0].effectiveOn;
          var CarryFrwdyrsDivisionExpired = data.result.divisionMaxJson[0].expiredOn;
          this.DivisionCarryForwardFlag = true;
        }

        // issue number 731 end

        let expDate = ''
        if (data.result.planInfoJson.deductibleExpiredOn) {
          expDate = this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.deductibleExpiredOn)
        }
        let startdateCarry = CarryFrwdyrsDivisionEffective ? (this.changeDateFormatService.changeDateByMonthName(CarryFrwdyrsDivisionEffective)) : '';
        let enddateCarry = CarryFrwdyrsDivisionExpired ? (this.changeDateFormatService.changeDateByMonthName(CarryFrwdyrsDivisionExpired)) : ''

        let dedDate = ''
        if (data.result.planInfoJson.deductibleEffectiveOn) {
          dedDate = this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.deductibleEffectiveOn)
        }

        this.PlanViewFormGroup.patchValue({
          'effective_date1': this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.effectiveOn),
          'expiry_date1': '',
          'typeof_year': data.result.planInfoJson.yrTypeDesc,
          'client_catg': '',
          'design_type': '',
          'extra_benefits': (data.result.planInfoJson.plansExtraBenefitInd == "T" ? true : false),
          'effective_date2': this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.effectiveOn),
          'expiry_date2': '',
          'description': '',
          'family_deductible_type': data.result.planInfoJson.deductTypeDesc,
          'family_deductible': this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.planInfoJson.divisionFamilyDeductAmt), //data.result.planInfoJson.divisionFamilyDeductAmt,
          'single_deductible': this.currentUserService.convertAmountToDecimalWithoutDoller(data.result.planInfoJson.divisionSingleDeductAmt), //data.result.planInfoJson.divisionSingleDeductAmt,
          'division_detail_effective_date': dedDate,
          'division_detail_expiry_date': expDate,
          'prorating_type': data.result.planInfoJson.prorateTypeDesc,
          'start_date': this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.proratingEffectiveOn) ? (this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.proratingEffectiveOn)) : '',
          'end_date': this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.proratingExpiredOn) ? (this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.proratingExpiredOn)) : "",

          'start_dateCarry': startdateCarry,
          'end_dateCarry': enddateCarry,
          'benefits': data.result.planInfoJson.benefitKey,
          'effective_date3': this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.effectiveOn),
          'dependant_age1': data.result.planInfoJson.divisionDependAge1Num,
          'dependant_age2': data.result.planInfoJson.divisionDependAge2Num,
          'benefits2': data.result.planInfoJson.benefitDesc,
          'Effective_date4': this.changeDateFormatService.changeDateByMonthName(data.result.coAdjustedPapEndDt),
          'procedure_code': data.result.coTerminClearDt,
          'plan_no': data.result.coTerminClearDt,
          'division_no': data.result.coTerminClearDt,
          'division_name': data.result.coTerminClearDt,
          'schedule': (data.result.feeGuideJson) ? (data.result.feeGuideJson.scheduleName) : '',
          'province': (data.result.feeGuideJson) ? (data.result.feeGuideJson.provinceName) : '',
          'fee_guide_date': (data.result.feeGuideJson) ? this.changeDateFormatService.changeDateByMonthName(data.result.feeGuideJson.feeGuideDt) : '',
          'payOnProvidersAdd': (data.result.feeGuideJson != null && data.result.feeGuideJson.payOnProviderAddress == 'T') ? true : false,

          'carry_forward': (CarryFrwdyrsDivision > 0) ? CarryFrwdyrsDivision : '',

          'carryForwardYear': (dentalCarryForwardCarryFrwdYrs != undefined) ? dentalCarryForwardCarryFrwdYrs : '',
          'carryForwardEffectiveOn': (dentalCarryForwardEffectiveOn != undefined) ? this.changeDateFormatService.changeDateByMonthName(dentalCarryForwardEffectiveOn) : '',                      // CHANGE DATE FORMAT BY MUKUL(09/03/2023) 
          'carryForwardExpireOn': (dentalCarryForwardExpiredOn != undefined) ? dentalCarryForwardExpiredOn : '',

          'visionCarryForwardYear': (visionCarryForwardCarryFrwdYrs != undefined) ? visionCarryForwardCarryFrwdYrs : '',
          'visionCarryForwardEffectiveOn': (visionCarryForwardEffectiveOn != undefined) ? this.changeDateFormatService.changeDateByMonthName(visionCarryForwardEffectiveOn) : '',
          'visionCarryForwardExpireOn': (visionCarryForwardExpiredOn != undefined) ? visionCarryForwardExpiredOn : '',

          'healthCarryForwardYear': (healthCarryForwardCarryFrwdYrs != undefined) ? healthCarryForwardCarryFrwdYrs : '',
          'healthCarryForwardEffectiveOn': (healthCarryForwardEffectiveOn != undefined) ? this.changeDateFormatService.changeDateByMonthName(healthCarryForwardEffectiveOn) : '',
          'healthCarryForwardExpireOn': (healthCarryForwardExpiredOn != undefined) ? healthCarryForwardExpiredOn : '',

          'supplimentCarryForwardYear': (supplimentCarryForwardCarryFrwdYrs != undefined) ? supplimentCarryForwardCarryFrwdYrs : '',
          'supplimentCarryForwardEffectiveOn': (supplimentCarryForwardEffectiveOn != undefined) ? this.changeDateFormatService.changeDateByMonthName(supplimentCarryForwardEffectiveOn) : '',
          'supplimentCarryForwardExpireOn': (supplimentCarryForwardExpiredOn != '') ? supplimentCarryForwardExpiredOn : '',
        });

        this.planNumber = data.result.planInfoJson.plansId;
        this.divisionNumber = data.result.planInfoJson.divisionId
        // Log #1185
        this.disciplineCoverageForm.patchValue({
          'planNum': data.result.planInfoJson.plansId,
          'divisionNum': data.result.planInfoJson.divisionId,
          'divisionDescription': data.result.planInfoJson.divisionName,
          'effDate': this.changeDateFormatService.changeDateByMonthName(data.result.planInfoJson.effectiveOn),
          'dependantAge1': data.result.planInfoJson.divisionDependAge1Num,
          'dependantAge2': data.result.planInfoJson.divisionDependAge2Num
        })
        if(data.result.rulesJson.dentalRule.length != 0){  // expand on disciplines section.
        this.FormGroup.patchValue({   // Show rules in Plan View with expand option
          'effectiveDate' : data.result.rulesJson.dentalRule[0].effectiveOn
        })
      }
        if (data.result.planInfoJson.feeGuideProvinceHist == "Y") {
          this.isProvinceHistoryExist = true;
        } else {
          this.isProvinceHistoryExist = false;
        }

        if (data.result.planInfoJson.feeGuideScheduleHist == "Y") {
          this.isScheduleHistoryExist = true;
        } else {
          this.isScheduleHistoryExist = false;
        }

        if (data.result.planInfoJson.prorateHistInd == "N") {
          this.isPrpHistoryExist = false;
        } else {
          this.isPrpHistoryExist = true;
        }

        if (data.result.planInfoJson.plansSuspendInd == "F") {
          this.isSuspendedHistoryExist = false;
        } else {
          this.isSuspendedHistoryExist = true;
        }

        if (data.result.planInfoJson.divisionMaxHistInd == "N") {
          this.isDivMaxHistoryExist = false;
        } else {
          this.isDivMaxHistoryExist = true;
        }

        if (data.result.planInfoJson.divisionCommentInd == "N") {
          this.isDivCommHistoryExist = false;
        } else {
          this.isDivCommHistoryExist = true;
        }
        if (data.result.planInfoJson.deductibleTypeHistInd == "N") {
          this.isDedHistoryExist = false;
        } else {
          this.isDedHistoryExist = true;
        }
        if (data.result.feeGuideJson != null && data.result.feeGuideJson.feeGuideDt == '') {
          this.feeguideSection = false;
        } else {
          this.feeguideSection = true;
          if (data.result.feeGuideJson != null && data.result.feeGuideJson.schedule != '') {
            this.isFeeGuideScheduleExist == true;
          } else {
            this.isFeeGuideScheduleExist == false;
          }
          if (data.result.feeGuideJson != null && data.result.feeGuideJson.province != '') {
            this.isFeeGuideProvinceExist == true;
          } else {
            this.isFeeGuideProvinceExist == false;
          }
        }
        if (data.result.divisionMaxJson.length == 0) {
          this.showdivisionMaximumSection = false;

        } else {
          this.showdivisionMaximumSection = true;
        }
      }
      this.planMax = data.result.divisionMaxJson; //Plan Division Max

      this.CoverageListDental = data.result.benefitsJson.dentalSlug.coverageCategory; //Dental
      this.CoverageListVision = data.result.benefitsJson.visionSlug.coverageCategory; //Vision
      this.CoverageListHealth = data.result.benefitsJson.healthSlug.coverageCategory; //Health
      this.CoverageListDrug = data.result.benefitsJson.drugSlug.coverageCategory; //Drug
      this.CoverageListSupplement = data.result.benefitsJson.supplementSlug.coverageCategory; //Supplemental
      this.CoverageListWellness = data.result.benefitsJson.wellnessSlug.coverageCategory; //Wellness
      let planCoverageList = [];
      if (this.CoverageListDental != undefined && this.CoverageListDental.length > 0) {
        this.CoverageListDental.sort(function (a, b) {
          var textA = a.covCatDesc.toUpperCase();
          var textB = b.covCatDesc.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      }
      if (this.CoverageListVision != undefined && this.CoverageListVision.length > 0) {
        this.CoverageListVision.sort(function (a, b) {
          var textA = a.covCatDesc.toUpperCase();
          var textB = b.covCatDesc.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      }
      if (this.CoverageListHealth != undefined && this.CoverageListHealth.length > 0) {
        this.CoverageListHealth.sort(function (a, b) {
          var textA = a.covCatDesc.toUpperCase();
          var textB = b.covCatDesc.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      }
      if (this.CoverageListDrug != undefined && this.CoverageListDrug.length > 0) {
        this.CoverageListDrug.sort(function (a, b) {
          var textA = a.covCatDesc.toUpperCase();
          var textB = b.covCatDesc.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      }
      if (this.CoverageListSupplement != undefined && this.CoverageListSupplement.length > 0) {
        this.CoverageListSupplement.sort(function (a, b) {
          var textA = a.covCatDesc.toUpperCase();
          var textB = b.covCatDesc.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      }
      if (this.CoverageListWellness != undefined && this.CoverageListWellness.length > 0) {
        this.CoverageListWellness.sort(function (a, b) {
          var textA = a.covCatDesc.toUpperCase();
          var textB = b.covCatDesc.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      }

      //Start
      for (var index in data.result.benefitsJson) {
        this.dentalKeyExist = (data.result.benefitsJson.dentalSlug && Object.keys(data.result.benefitsJson.dentalSlug).length > 0 && data.result.benefitsJson.dentalSlug.benefitKey != null) ? "T" : "F";
        this.visionKeyExist = (data.result.benefitsJson.visionSlug && Object.keys(data.result.benefitsJson.visionSlug).length > 0 && data.result.benefitsJson.visionSlug.benefitKey != null) ? "T" : "F";
        this.healthKeyExist = (data.result.benefitsJson.healthSlug && Object.keys(data.result.benefitsJson.healthSlug).length > 0 && data.result.benefitsJson.healthSlug.benefitKey != null) ? "T" : "F";
        this.drugKeyExist = (data.result.benefitsJson.drugSlug && Object.keys(data.result.benefitsJson.drugSlug).length > 0 && data.result.benefitsJson.drugSlug.benefitKey != null) ? "T" : "F";
        this.supplementKeyExist = (data.result.benefitsJson.supplementSlug && Object.keys(data.result.benefitsJson.supplementSlug).length > 0 && data.result.benefitsJson.supplementSlug.benefitKey != null) ? "T" : "F";
        this.wellnessKeyExist = (data.result.benefitsJson.wellnessSlug && Object.keys(data.result.benefitsJson.wellnessSlug).length > 0 && data.result.benefitsJson.wellnessSlug.benefitKey != null) ? "T" : "F";
      }
      //End
      if (data.result.divisionMaxJson.length == 0) {
        var unlimitedFlag = true;
        for (var index in data.result.benefitsJson) {
          if (this.dentalKeyExist == "T") {
            if (data.result.benefitsJson.dentalSlug.combineMaximum.length == 0) {
              unlimitedFlag = true;
            } else {
              unlimitedFlag = false;
            }
            if (unlimitedFlag == true) {
              for (let i in this.CoverageListDental) {
                if (this.CoverageListDental[i].adult < 100 || this.CoverageListDental[i].dept < 100 || this.CoverageListDental[i].adultLab < 100 || this.CoverageListDental[i].deptLab < 100 || this.CoverageListDental[i].coverageMax.length > 0) {
                  unlimitedFlag = false;
                }
              }
            }
          }

          if (unlimitedFlag == true && this.visionKeyExist == "T") {
            for (let i in this.CoverageListVision) {
              if (this.CoverageListVision[i].adult < 100 || this.CoverageListVision[i].dept < 100 || this.CoverageListVision[i].coverageMax.length > 0) {
                unlimitedFlag = false;
              }
            }
          }

          if (unlimitedFlag == true && this.healthKeyExist == "T") {
            for (let i in this.CoverageListHealth) {
              if (this.CoverageListHealth[i].adult < 100 || this.CoverageListHealth[i].dept < 100 || this.CoverageListHealth[i].coverageMax.length > 0) {
                unlimitedFlag = false;
              }
            }
          }

          if (unlimitedFlag == true && this.drugKeyExist == "T") {
            for (let i in this.CoverageListDrug) {
              if (this.CoverageListDrug[i].adult < 100 || this.CoverageListDrug[i].dept < 100 || this.CoverageListDrug[i].coverageMax.length > 0) {
                unlimitedFlag = false;
              }
            }
          }

          if (unlimitedFlag == true && this.wellnessKeyExist == "T") {
            for (let i in this.CoverageListWellness) {
              if (this.CoverageListWellness[i].adult < 100 || this.CoverageListWellness[i].dept < 100 || this.CoverageListWellness[i].coverageMax.length > 0) {
                unlimitedFlag = false;
              }
            }
          }
        }

        if (unlimitedFlag == true) {
          this.unlimitedPlan = 'Unlimited'
        } else {
          this.unlimitedPlan = ''
        }

      } else {
        this.unlimitedPlan = ''
      }

      this.benefitsList = data.result.benefitsJson;
      this.FeeguideSechedule = (data.result.feeGuideJson) ? (data.result.feeGuideJson.schedule) : ''; //Fee Guide Sehedule
      this.FeeguideProvince = (data.result.feeGuideJson) ? (data.result.feeGuideJson.province) : ''; //Fee Guide Sehedule

      // For Issue No. #614 resolved
      if (this.FeeguideSechedule.length > 0) {
        this.feeguideSceheduleData = true;
      } else {
        this.feeguideSceheduleData = false;
      }
      if (this.FeeguideProvince.length > 0) {
        this.feeguideProvinceData = true;
      } else {
        this.feeguideProvinceData = false;
      }


      //For Main Page Tabs

      for (var index in data.result.benefitsJson) {
        if (Object.keys(data.result.benefitsJson[index]).length > 0) {
          var res = index.replace("Slug", "");
          if (res === "supplement") {
            var res = "supplemental";
          }
          if ((data.result.benefitsJson[index] && Object.keys(data.result.benefitsJson[index]).length > 0 && data.result.benefitsJson[index].benefitKey != null)) {
            this.benefitsJsonKeys.push(res)
          }
          if (this.benefitsJsonKeys.length > 0) {
            for (let i in this.benefitsJsonKeys) {
              if (this.benefitsJsonKeys[i] == 'dental') {
                this.isDentalSlug = true
              }
              if (this.benefitsJsonKeys[i] == 'vision') {
                this.isVisionSLug = true
              }
              if (this.benefitsJsonKeys[i] == 'health') {
                this.isHealthSlug = true
              }
              if (this.benefitsJsonKeys[i] == 'drug') {
                this.isDrugSlug = true
              }
              if (this.benefitsJsonKeys[i] == 'supplemental') {
                this.isSupplementalSlug = true
              }
              if (this.benefitsJsonKeys[i] === 'wellness') {
                this.isWellnessSlug = true
              }
            }
          }
          this.TabKeysDataEmpty = true
        }
      }

      //For Popup Checkboxes      
      for (var index in data.result.benefitsJson) {
        if (Object.keys(data.result.benefitsJson[index]).length > 0) {
          var str = index;
          var res = str.replace("Slug", "");

          //For Coverage Key Multiple Values
          var coverageKey = data.result.benefitsJson[index].coverageCategory
          let coverageKeys = [];
          for (var i in coverageKey) {
            coverageKeys.push(coverageKey[i]['covKey']);
          }

          //For Discpline Key
          var disciplineKey = data.result.benefitsJson[index].disciplineKey;
          this.terminateCoverageKeys = {
            "coverageKey": coverageKeys,
            "disciplineKey": disciplineKey
          }
          this.finalArr.push(this.terminateCoverageKeys);
        }
      }
      //Start Example Array
      //End Example Array
      this.firstTab = this.benefitsJsonKeys[0];
    })
  }

  getplanCoverageRules() {
    return this.planCoverageRulesList = [
      {
        id: 1,
        ruleCd: "A_djsfhjk343",
        ruleDescription: "Chidprotocol",
        effectiveDate: "02/08/1987",
        expiryDate: "02/08/2099"

      },
      {
        id: 2,
        ruleCd: "10sd",
        ruleDescription: "admire description_5",
        effectiveDate: "18/12/1993",
        expiryDate: "18/12/1993"
      },
      {
        id: 3,
        ruleCd: "Z_d5001",
        ruleDescription: "ruledescription",
        effectiveDate: "18/12/1993",
        expiryDate: "18/12/1993"
      },
      {
        id: 4,
        ruleCd: "A_djsfhjk343",
        ruleDescription: "Chidprotocol",
        effectiveDate: "02/08/1987",
        expiryDate: "02/08/2099"
      }
    ];
  }

  /**
   * Get Plan Coverage Category
   */
  getplanCoverageCategories() {
    return this.planCoverageCategoriesList = [
      {
        id: 1,
        coverageCategory: "balpha",
        effectiveDate: "02/08/1907",
        expiryDate: "02/08/2099"

      },
      {
        id: 2,
        coverageCategory: "cthita",
        effectiveDate: "18/12/1953",
        expiryDate: "18/12/1993"
      },
      {
        id: 3,
        coverageCategory: "P_msrk123",
        effectiveDate: "18/12/1993",
        expiryDate: "18/12/1976"
      },
      {
        id: 4,
        coverageCategory: "A_djsfhjk343",
        effectiveDate: "02/08/1957",
        expiryDate: "02/08/2099"
      }
    ];
  }

  /**
   * get Company Plan
   */
  GetCompanyDetailByIdUrl(coKeyUrlId, planKeyUrlId, divisionKeyUrlId) {
    let planDataJson = {
      "coKey": coKeyUrlId,
      "plansKey": planKeyUrlId,
      "divisionKey": divisionKeyUrlId
    }
    var URL = PlanApi.getCompanyPlanUrl;
    this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
      if (data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
        if (data.result.comments.length > 0) {
          this.firstComment = data.result.comments[0].commentTxt;
          this.hideCommentButton = data.result.commentFlag;
        }
      }
    })
  }

  /**
   * Get Company Details By Company CoKey
   * @param coKey 
   */
  GetCompanyDetailByCompanyCoKey(coKey) {
    let planDataJson = {
      "coKey": coKey
    }
    var URL = PlanApi.getCompanyDetailByCompanyCoKeyUrl;
    this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.company_eff_date = data.result.effectiveOn //Global value set 
        this.businessType = data.result.businessTypeDesc;
        this.PlanViewFormGroup.patchValue({
          'company_id': data.result.coId,
          'company_name': data.result.coName,
          'effective_date': this.changeDateFormatService.changeDateByMonthName(data.result.effectiveOn),
          'business_type': data.result.businessTypeDesc
        });
      }
    });
  }

  changeFilterDateFormat(event, frmControlName, selDate, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      this.setControlDate(selDate, validDate);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      this.setControlDate(selDate, obj);
    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      return;
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
   * Reset Termination Category Form
   */
  resetForm() {
    this.TerminateCategoryFormGroup.reset();
  }

  /**
   * Terminated Category
   */
  terminateCategory() {
    
    if (!this.TerminateCategoryFormGroup.valid) {
      this.validateAllFormFields(this.TerminateCategoryFormGroup);
      return;
    }
    this.showLoader = true;
    let terminateCoverageCategory = [];
    if (this.TerminateCategoryFormGroup.value.dental && this.benefitsList.dentalSlug && Object.keys(this.benefitsList.dentalSlug).length > 0) {
      let benefitKey: any; let dentalCategory: any;
      dentalCategory = { disciplineKey: this.benefitsList.dentalSlug.disciplineKey, benefitKey: this.benefitsList.dentalSlug.benefitKey }
      terminateCoverageCategory.push(dentalCategory);
    }

    if (this.TerminateCategoryFormGroup.value.vision && this.benefitsList.visionSlug && Object.keys(this.benefitsList.visionSlug).length > 0) {
      let benefitKey: any; let visionCategory: any;
      visionCategory = { disciplineKey: this.benefitsList.visionSlug.disciplineKey, benefitKey: this.benefitsList.visionSlug.benefitKey }
      terminateCoverageCategory.push(visionCategory);
    }
    if (this.TerminateCategoryFormGroup.value.health && this.benefitsList.healthSlug && Object.keys(this.benefitsList.healthSlug).length > 0) {
      let benefitKey: any; let healthCategory: any;
      healthCategory = { disciplineKey: this.benefitsList.healthSlug.disciplineKey, benefitKey: this.benefitsList.healthSlug.benefitKey }
      terminateCoverageCategory.push(healthCategory);
    }
    if (this.TerminateCategoryFormGroup.value.drug && this.benefitsList.drugSlug && Object.keys(this.benefitsList.drugSlug).length > 0) {
      let benefitKey: any; let drugCategory: any;
      drugCategory = { disciplineKey: this.benefitsList.healthSlug.disciplineKey, benefitKey: this.benefitsList.healthSlug.benefitKey }
      terminateCoverageCategory.push(drugCategory);
    }
    if (this.TerminateCategoryFormGroup.value.supplemental && this.benefitsList.supplementSlug && Object.keys(this.benefitsList.supplementSlug).length > 0) {
      let benefitKey: any; let supplementCategory: any;
      supplementCategory = { disciplineKey: this.benefitsList.supplementSlug.disciplineKey, benefitKey: this.benefitsList.supplementSlug.benefitKey }
      terminateCoverageCategory.push(supplementCategory);
    }
    if (this.TerminateCategoryFormGroup.value.wellness && this.benefitsList.wellnessSlug && Object.keys(this.benefitsList.wellnessSlug).length > 0) {
      let benefitKey: any; let wellnessCategory: any;
      wellnessCategory = { disciplineKey: this.benefitsList.wellnessSlug.disciplineKey, benefitKey: this.benefitsList.wellnessSlug.benefitKey }
      terminateCoverageCategory.push(wellnessCategory);
    }

    var terminateData = {
      "terminateOn": this.changeDateFormatService.convertDateObjectToString(this.TerminateCategoryFormGroup.value.termination_date),
      "terminateCoverage": terminateCoverageCategory
    }

    if ((this.TerminateCategoryFormGroup.value.dental == true) || (this.TerminateCategoryFormGroup.value.vision == true) || (this.TerminateCategoryFormGroup.value.health == true) || (this.TerminateCategoryFormGroup.value.drug == true) || (this.TerminateCategoryFormGroup.value.supplemental == true) || (this.TerminateCategoryFormGroup.value.wellness == true)) {
      //do nothing
    } else {
      this.ToastrService.error('Please select atleast one coverage')
    }

    if (this.TerminateCategoryFormGroup.valid) {
      //Start Api
      this.hmsDataServiceService.postApi(PlanApi.terminateCoverage, terminateData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && data.hmsShortMessage == "RECORD_UPDATED_SUCCESSFULLY") {
          this.ToastrService.success('Coverage Terminated Successfully')
          $("#triggerCloseButton").trigger('click')
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == "TERMINATIONON_SHOULD_BE_GREATER_THAN_NOW_DATE") {
          this.ToastrService.error('Termination Date should be greater than the current date')
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == "TERMINATIONON_SHOULD_BE_GREATER_THAN_EFFECTIVEON") {
          this.ToastrService.error('Termination Date should be greater than the Plan Effective date')
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == "ALREADY_TERMINATED") {
          this.ToastrService.error('Already Terminated')
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsShortMessage == "CANNOT_TERMINATION_BENEFITS_RETROACTIVELY") {
          this.ToastrService.error('Cannot termination benefits retoactively')
        }
        this.getUpdatedCompanyPlan(this.coKeyUrlId, this.planKeyUrlId, this.divisionKeyUrlId).then(res => {
          this.showLoader = false;
        })
      })
      //End Api      
    } else {
      this.validateAllFormFields(this.TerminateCategoryFormGroup);
    }
   
  }

  companyPlanKey;

  deductable_type_columns = [
    { title: "Deductible Type", data: 'deductTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' }
  ]

  prorating_type_columns = [
    { title: "Prorating Type", data: 'prorateTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' }
  ]

  carry_forward_columns = [
    { title: "Carry Forward Year", data: 'prorateTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' }
  ]

  /**
   * Get Prorating Type History
   */
  getProratingTypeHistory() {
    var prorating_type_url = PlanApi.getProratingTypeHistory;
    var ProratingTypeTableId = "prorating_type";
    var reqParamProHist = [{ 'key': 'plansKey', 'value': this.companyPlanKey }]
    if (!$.fn.dataTable.isDataTable('#prorating_type')) {
      this.dataTableService.jqueryDataTable(ProratingTypeTableId, prorating_type_url, 'full_numbers', this.prorating_type_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined)
    }
    else {
      this.dataTableService.jqueryDataTableReload(ProratingTypeTableId, prorating_type_url, reqParamProHist)
    }
  }
  /**
   * Get Carry Forward History List
   */
  getCarryForwardHistory() {
    var carry_forward_url = PlanApi.getCarryForwardHistory;
    var carryForwardTableId = "carry_forward";
    var reqParamProHist = [{ 'key': 'plansKey', 'value': this.companyPlanKey }]
    if (!$.fn.dataTable.isDataTable('#carry_forward')) {
      this.dataTableService.jqueryDataTable(carryForwardTableId, carry_forward_url, 'full_numbers', this.carry_forward_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined)
    } else {
      this.dataTableService.jqueryDataTableReload(carryForwardTableId, carry_forward_url, reqParamProHist)
    }
  }

  checkboxGet(key) {
    return key;
  }

  /**
   * Get Deductable Type History
   */
  getDeductableTypeHistory() {
    var deductable_type_url = PlanApi.getDeductibleTypeHistory;
    var DeductableTypeTableId = "deductable_type";
    var reqParamDeductHist = [{ 'key': 'planKey', 'value': this.companyPlanKey }]
    if (!$.fn.dataTable.isDataTable('#deductable_type')) {
      this.dataTableService.jqueryDataTable(DeductableTypeTableId, deductable_type_url, 'full_numbers', this.deductable_type_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamDeductHist, '', undefined)
    }
    else {
      this.dataTableService.jqueryDataTableReload(DeductableTypeTableId, deductable_type_url, reqParamDeductHist)
    }
  }

  resetPlanCommentForm() {
    this.commentEditFormData.resetCommentForm();
    this.usclsFormGroup.reset();
    this.usclsFormGroupStep2.reset()
    this.plan = [];
    this.covCat = []
    this.CovCatList = []
    this.selectedCovCat = []
    // Below one is to hide remove button on pop up closing
    this.commentEditFormData.showRemoveBtn = false
  }
  AddNew() {
    this.selectedRowId = '';
    this.resetNewRecord();
    this.addItemMode = true;
    this.AddInfo.reset()


  }
  resetNewRecord() {
    this.addItemMode = false;
    this.arrNewRow = {
      "suspendedInd": false,
      "effectiveOn": "",
      "expiredOn": "",
      "idx": ""
    }
    this.selectedRowId = '';
  }
  DeleteInfo(dataRow) {

    var action = "cancel";
    if (dataRow && dataRow.provEligibilKey) {
      action = "Delete";
    }
    this.exDialog.openConfirm((this.translate
      .instant('card.exDialog.are-you-sure')) + ' ' + action + ' ' + (this.translate.instant('card.exDialog.record')))
      .subscribe((value) => {
        if (value) {
          this.resetNewRecord();
        }
      })
  }
  SaveInfo() {
    this.requestedData = [];
    this.newRecordValidate = true;
    this.resetNewRecord();
    if (this.AddInfo.valid) {
      this.arrData.push(
        {
          'effectiveOn': this.changeDateFormatService.convertDateObjectToString(this.AddInfo.value.effectiveOn),
          'expiredOn': this.changeDateFormatService.convertDateObjectToString(this.AddInfo.value.expiredOn),
          'serviceCode': this.AddInfo.value.serviceCode,
          'procCode': this.AddInfo.value.procCode

        }
      )
      this.AddInfo.reset()
    }
    this.addEditMode = false;
  }
  updateInfo() {

  }
  EditInfo(json, index) {
    this.addEditMode = true;
    this.AddInfo.patchValue(
      {
        'procCode': json.procCode,
        'expiredOn': this.changeDateFormatService.convertStringDateToObject(json.expiredOn),
        'effectiveOn': this.changeDateFormatService.convertStringDateToObject(json.effectiveOn),
        'serviceCode': json.procCode
      }

    )
    this.arrData.splice(index, 1);

  }
  validateFields(objRow: any) {
    if (objRow.effectiveOn != '') {
      return true;
    }
    else {
      return false;
    }
  }
  validateAllFields(arrNewRow: { effectiveOn: string; expiredOn: string; idx: string; suspendedInd: boolean; }) {
    throw new Error('Method not implemented.');
  }
  Add(title) {
    this.title = title;
    this.addMode = true;
  }
  /**
   * Get Division Status 
   * @param divisionKey
   */
  GetDivisionStatus(divisionKeyUrlId) {
    let postDataJson = { "divisionKey": this.divisionKeyUrlId }
    var URL = PlanApi.getDivisionStatusUrl;
    this.hmsDataServiceService.postApi(URL, postDataJson).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.planStatus = data.result.divisionStatus;
        this.PlanViewFormGroup.patchValue({
          'terminatedOn': this.changeDateFormatService.changeDateByMonthName(data.result.terminatedOn)
        });
      }
    });
  }

  /** Function For Jump to Previous Page */
  goBack() {
    this.location.back();
  }

  /**
   * Give User Access for the page buttons
   */
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.mainPlanArray = [{
        "copyDivision": 'T',
        "planComments": 'T',
        "addPlanComment": 'T',
        "editPlan": 'T',
        "terminateCoverage": 'T',
        "addTerminateCoverage": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.mainPlanArray = [{
        "copyDivision": authCheck['VPL98'],
        "planComments": authCheck['VPL99'],
        "addPlanComment": authCheck['APC100'],
        "editPlan": authCheck['VPL101'],
        "terminateCoverage": authCheck['VPL102'],
        "addTerminateCoverage": authCheck['TCO104']
      }]
    }
    return this.mainPlanArray
  }

  /**
   * Get Company Plan
   * @param coKeyUrlId 
   * @param planKeyUrlId 
   * @param divisionKeyUrlId 
   */
  getUpdatedCompanyPlan(coKeyUrlId, planKeyUrlId, divisionKeyUrlId) {
    let promise = new Promise((resolve, reject) => {
      this.CoverageListDental = [];
      this.CoverageListVision = [];
      this.CoverageListHealth = [];
      this.CoverageListDrug = [];
      this.CoverageListSupplement = [];
      this.CoverageListWellness = [];
      let planDataJson = {
        "coKey": coKeyUrlId,
        "plansKey": planKeyUrlId,
        "divisionKey": divisionKeyUrlId
      }
      var URL = PlanApi.getCompanyPlanUrl;
      this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
        if (data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
          this.CoverageListDental = data.result.benefitsJson.dentalSlug.coverageCategory; //Dental
          this.CoverageListVision = data.result.benefitsJson.visionSlug.coverageCategory; //Vision
          this.CoverageListHealth = data.result.benefitsJson.healthSlug.coverageCategory; //Health
          this.CoverageListDrug = data.result.benefitsJson.drugSlug.coverageCategory; //Drug
          this.CoverageListSupplement = data.result.benefitsJson.supplementSlug.coverageCategory; //Supplemental
          this.CoverageListWellness = data.result.benefitsJson.wellnessSlug.coverageCategory; //Wellness
          resolve();
        }
      });
    })
    return promise;
  }

  /**
   * Expired Benefits in Red Color
   * @param rowDate 
   */
  isExpired(rowDate) {
    if (rowDate) {
      let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
      return this.changeDateFormatService.isStartDateGreaterThanEndDate(todayDate, rowDate);
    }
  }

  getPlanFrequencies(covKey) {
    window.open('/company/plan/frequencies?covKey=' + covKey + '&disciplineKey=1' + '&coKey=' + this.coKeyUrlId + '&plansKey=' + this.planKeyUrlId + '&divisionKeyId=' + this.divisionKeyUrlId ,'_blank');
  }
  // issue number 338
  openFindProc(covKey) {
     window.open('/company/plan/findproc?covKey=' + covKey + '&disciplineKey=1&plansKey=' + this.planKeyUrlId + '&divisionKeyId=' + this.divisionKeyUrlId + '&coKey=' + this.coKeyUrlId, '_blank');
  }

  /* Log #821*/
  getVisionPlanCoverage(covKey) {
    window.open('/company/plan/vision-coverage?covKey=' + covKey + '&disciplineKey=2', '_blank');
  }

  /* Log #821(Health)*/
  getHealthPlanCoverage(covKey) {
    window.open('/company/plan/health-coverage?covKey=' + covKey + '&disciplineKey=3', '_blank');
  }
  submitUslcs() {
    if (this.usclsFormGroupStep2.valid) {
      var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.PlanViewFormGroup.value.effective_date1
      );
      let error = this.changeDateFormatService.compareTwoDates(effectiveDt.date, this.usclsFormGroupStep2.value.usclsEffectiveDate.date);
      if (error.isError == true) {
        this.usclsFormGroupStep2.controls['usclsEffectiveDate'].setErrors({
          "rulesDateNotValid": true
        });
        return false
      }
      var URL = PlanApi.usclsGuideProcCode;

      let CarryFrwdyrsDivisionEffective = this.usclsFormGroup.value.usclsEffectiveDate;
      let startdateCarry = CarryFrwdyrsDivisionEffective ? (this.changeDateFormatService.convertDateObjectToString(CarryFrwdyrsDivisionEffective)) : '';

      let planDataJson = {
        "procId": this.usclsFormGroup.value.proc_code,
        "procIdLookup": this.procedureKey,
        "EffectiveDate": startdateCarry,
        "hreInd": this.usclsFormGroup.value.reviewInd ? "T" : 'F',
        "qcInd": this.usclsFormGroup.value.qcInd ? "T" : 'F',
      }
      this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {

          var URL = PlanApi.usclsGuideServiceCode;
          let CarryFrwdyrsDivisionEffective = this.usclsFormGroupStep2.value.usclsEffectiveDate;
          let startdateCarry = CarryFrwdyrsDivisionEffective ? (this.changeDateFormatService.convertDateObjectToString(CarryFrwdyrsDivisionEffective)) : '';
          let DataJson = {
            "procId": this.usclsFormGroupStep2.value.proc_code,
            "procIdLookup": this.procedureKey,
            "EffectiveDate": startdateCarry,
            "hreInd": this.usclsFormGroupStep2.value.reviewInd ? "T" : 'F',
            "qcInd": this.usclsFormGroupStep2.value.qcInd ? "T" : 'F',
            "approvalInd": this.usclsFormGroupStep2.value.approvalInd ? "T" : 'F',
            "revInd": this.usclsFormGroupStep2.value.reviewInd ? "T" : 'F',

          }
          this.hmsDataServiceService.postApi(URL, DataJson).subscribe(data => {
            if (data.code == 200 && data.status == "OK") {
              this.ToastrService.success("Data Added Successfully")
              this.resetuslcForms()
            }
            else {
              this.ToastrService.error("Something Went Wrong Please Try Again");
              this.resetuslcForms()
            }
          })
        } else {
          this.ToastrService.error("Something Went Wrong Please Try Again");
          this.resetuslcForms()
        }
      })
    } else {
      this.validateAllFormFields(this.usclsFormGroupStep2)
    }
  }
  resetuslcForms() {
    $('#closeUslc').trigger('click');
    $('#step1').addClass('active')
    $('#step2').removeClass('active')

    this.usclsFormGroupStep2.reset();
    this.usclsFormGroup.reset();
  }

  sendModal() {
  }

  hideModal() {
  }

  addDecimal(event, controlName) {
    if (event.target.value) {
      if (event.target.value.indexOf(".") == -1) {
        this.PlanViewFormGroup.controls[controlName].patchValue(event.target.value + '.00');
      }
    }
  }

  // Log #1185: Plan Amendments
  getDiscipline(discType) {
    let apiUrl;
    if (discType == 'dental') {
      this.discTitle = 'Dental'
      this.discId = 1;
      Object.assign(this.benefitObj, { "dentalSlug": { 'disciplineKey': this.discId, "combineMaximum": [], "coverageCategory": [] } });
      apiUrl = PlanApi.getDentalCoverageCategoryList
      this.benefitCategoryListing(apiUrl, this.discId, 'addMode').then(res => {
        this.genericDataTableInit(this.dentalCovCatList, this.discId)
        if (this.hideGoToPage) {
          this.myTable.goToPage(1)
        }
        this.hideGoToPage = true;
      });
    } else if (discType == 'vision') {
      this.discTitle = 'Vision'
      this.discId = 2
      Object.assign(this.benefitObj, { "visionSlug": { 'disciplineKey': this.discId, "coverageCategory": [] } });
      apiUrl = PlanApi.getVisionCoverageAndServicesList
      this.benefitCategoryListing(apiUrl, this.discId, 'addMode').then(res => {
        this.genericDataTableInit(this.visionCovCatList, this.discId)
        if (this.hideGoToPage) {
          this.myTable.goToPage(1)
        }
        this.hideGoToPage = true;
      });
    } else if (discType == 'health') {
      this.discTitle = 'Health'
      this.discId = 3
      apiUrl = PlanApi.getHealthCoverageAndServicesList
      this.selectedHealthNode = [];
      Object.assign(this.benefitObj, { "healthSlug": { 'disciplineKey': this.discId, "coverageCategory": [] } });
      this.benefitCategoryListing(apiUrl, this.discId, 'addMode').then(res => {
        this.genericDataTableInit(this.healthCovCatList, this.discId)
        if (this.hideGoToPage) {
          this.myTable.goToPage(1)
        }
        this.hideGoToPage = true;
      });
    } else if (discType == 'drug') {
      this.discTitle = 'Drug'
      this.discId = 4
      apiUrl = PlanApi.getDrugCoverageAndServicesList
      Object.assign(this.benefitObj, { "drugSlug": { 'disciplineKey': this.discId, "coverageCategory": [] } });
      this.benefitCategoryListing(apiUrl, this.discId, 'addMode').then(res => {
        this.genericDataTableInit(this.drugCovCatList, this.discId)
        if (this.hideGoToPage) {
          this.myTable.goToPage(1)
        }
        this.hideGoToPage = true;
      });
    }
    else if (discType == 'supplemental') {
      this.discTitle = 'Supplemental'
      this.discId = 5
      apiUrl = PlanApi.getHSACoverageAndServicesList 
      Object.assign(this.benefitObj, { "supplementSlug": { 'disciplineKey': this.discId, "coverageCategory": [], "combineMaximum": [] } });
      this.benefitCategoryListing(apiUrl, this.discId, 'addMode').then(res => {
        this.genericDataTableInit(this.supplementCovCatList, this.discId)
        if (this.hideGoToPage) {
          this.myTable.goToPage(1)
        }
        this.hideGoToPage = true;
      });
    } else if (discType == 'wellness') {
      this.discTitle = 'Wellness'
      this.discId = 6
      apiUrl = PlanApi.getWellnessCoverageAndServicesList
      Object.assign(this.benefitObj, { "wellnessSlug": { 'disciplineKey': this.discId, "coverageCategory": [], "combineMaximum": [] } });
      this.benefitCategoryListing(apiUrl, this.discId, 'addMode').then(res => {
        this.genericDataTableInit(this.wellnessCovCatList, this.discId)
        if (this.hideGoToPage) {
          this.myTable.goToPage(1)
        }
        this.hideGoToPage = true;
      });
    }
  }

  eventListener(event) {
  }

  benefitCategoryListing(categoryApiUrl, discId, checkMode) {
    let serviceApiUrl: any; let benefitCategoryId: any; let covCategoryArray = [];
    let promise = new Promise((resolve, reject) => {
      this.hmsDataServiceService.getApi(categoryApiUrl).subscribe(data => {
        if (data.code == 200 && data.result.length > 0) {
          let dataArray = [];
          data.result.forEach(element => {
            element = Object.assign({ "ischecked": false, "editMode": false, 'addPlanMode': false, 'editPlanMode': false, 'covCatExpired': '' }, element);
            dataArray.push(element);
          });
          switch (discId) {
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
                this.dentalCovCatList = covCategoryArray;
              } else {
                this.dentalCovCatList = dataArray;
              }
              /**Remove Unwanted Dental Coverage Category */
              serviceApiUrl = PlanApi.getServicesByCovKeyDentalUrl;
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(this.discId, serviceApiUrl, benefitCategoryId);
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
                this.visionCovCatList = covCategoryArray;
              } else {
                this.visionCovCatList = dataArray;
              }
              /**Remove Unwanted Vision Coverage Category */
              serviceApiUrl = PlanApi.getServicesByCovKeyVisionUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": this.visionCovCatList[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(this.discId, serviceApiUrl, benefitCategoryId);
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
                this.healthCovCatList = covCategoryArray;
              } else {
                this.healthCovCatList = dataArray;
              }
              /**Remove Unwanted Health Coverage Category */
              serviceApiUrl = PlanApi.getServicesByCovKeyHealthUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(this.discId, serviceApiUrl, benefitCategoryId);
              }
              break;
            case 4:
              this.drugCovCatList = dataArray;
              serviceApiUrl = PlanApi.getServicesByCovKeyDrugUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(this.discId, serviceApiUrl, benefitCategoryId);
              }
              break;
            case 5:
              /* start */ 
              if (checkMode != 'editMode') { // temporary remove HSA categories
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
                this.supplementCovCatList = covCategoryArray;
              } 
              else {
                   /* ends */ 
                    this.supplementCovCatList = dataArray;
                  }
              serviceApiUrl = PlanApi.getServicesByCovKeyHsaUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(this.discId, serviceApiUrl, benefitCategoryId);
              }
              break;
            case 6:
              this.wellnessCovCatList = dataArray;
              serviceApiUrl = PlanApi.getServicesByCovKeyWellnessUrl
              if (checkMode == 'addMode') {
                benefitCategoryId = { "covCatKey": data.result[0].covCatKey, "isSelected": false };
                this.getBenifitsServices(this.discId, serviceApiUrl, benefitCategoryId);
              }
              break;
          }
          resolve();
        } else if (data.code == 400 && data.status == 'BAD_REQUEST') {
            this.ToastrService.error('Please select another benefit. Coverage Categories are not available for this benefit!');
        }
      });
    });
    return promise;
  }
  
  genericDataTableInit(dataArray, discId) {
    switch (discId) {
      case 1:
        var isCheckedPayLab = true;
        for (var i in dataArray) {
          if (dataArray[i].payLab == 'F') {
            var isCheckedPayLab = false;
            break;
          }
        }
        if (isCheckedPayLab) {
          $('#payLab_' + discId).prop('checked', true)
        } else {
          $('#payClaim_' + this.discId).prop('checked', false)
        }

        var isCheckedPayClaim = true;
        for (var i in dataArray) {
          if (dataArray[i].payClaim == 'F') {
            var isCheckedPayClaim = false;
            break;
          }
        }
        if (isCheckedPayClaim) {
          $('#payClaim_' + discId).prop('checked', true)
        } else {
          $('#payClaim_' + discId).prop('checked', false)
        }
        break;
      case 2:
        var isCheckedPayClaim = true;
        for (var i in dataArray) {
          if (dataArray[i].payClaim == 'F') {
            var isCheckedPayClaim = false;
            break;
          }
        }
        if (isCheckedPayClaim) {
          $('#payClaim_' + this.discId).prop('checked', true)
        } else {
          $('#payClaim_' + this.discId).prop('checked', false)
        }
        break;
      case 3:
        var isCheckedPayClaim = true;
        for (var i in dataArray) {
          if (dataArray[i].payClaim == 'F') {
            var isCheckedPayClaim = false;
            break;
          }
        }
        if (isCheckedPayClaim) {
          $('#payClaim_' + this.discId).prop('checked', true)
        } else {
          $('#payClaim_' + this.discId).prop('checked', false)
        }
        break;
      case 4:
      break;
      case 5:
      break;
      case 6:
        var isCheckedPayLab = true;
        for (var i in dataArray) {
          if (dataArray[i].payLab == 'F') {
            var isCheckedPayLab = false;
            break;
          }
        }
        if (isCheckedPayLab) {
          $('#payLab_' + this.discId).prop('checked', true)
        } else {
          $('#payClaim_' + this.discId).prop('checked', false)
        }

        var isCheckedPayClaim = true;
        for (var i in dataArray) {
          if (dataArray[i].payClaim == 'F') {
            var isCheckedPayClaim = false;
            break;
          }
        }
        if (isCheckedPayClaim) {
          $('#payClaim_' + this.discId).prop('checked', true)
        } else {
          $('#payClaim_' + this.discId).prop('checked', false)
        }
      break;
    }
    this.configObject.settings = this.genericSettingData()
    this.configObject.fields = [
      {
        name: 'Included', objectKey: 'checkbox',
        value: () => '',
        render: row => this.printCheckbox(row, 'mainCheckbox', discId),
        click: (row, col, event) => this.selectUnSelectCategory(row, event)
      },
      {
        name: 'Coverage Category', objectKey: 'covCatDesc',
      },
      {
        name: 'Adult%', objectKey: 'adult',
        render: row => this.printInputBox(row, 'adult'),
      },
      {
        name: 'Adult Time Frame', objectKey: 'covCoverageTimeFrameKey',
        render: row => this.printTimeFrameDropDown(row, 'covCoverageTimeFrameKey')
      },
      {
        name: 'Adult Lab%', objectKey: 'adultLab',
        render: row => this.printInputBox(row, 'adultLab'),
      },
      {
        name: 'Dep%', objectKey: 'dept',
        render: row => this.printInputBox(row, 'dept'),
      },
      {
        name: 'Dep Time Frame', objectKey: 'coverageTimeFrameKey',
        render: row => this.printTimeFrameDropDown(row, 'coverageTimeFrameKey')
      },
      {
        name: 'Dep Lab%', objectKey: 'deptLab',
        render: row => this.printInputBox(row, 'deptLab'),
      },
      {
        name: 'Pay Lab', objectKey: 'payLab',
        value: () => { true },
        render: row => this.printCheckbox(row, 'payLab', discId),
      },
      {
        name: 'Pay Claim', objectKey: 'payClaim',
        value: () => { true },
        render: row => this.printCheckbox(row, 'payClaim', discId),
      }
    ]
    this.configObject.data = dataArray
  }

  printCheckbox(fieldValue, fieldName, discId) {
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
        switch (discId) {
          case 1:
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
          case 2:
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
          case 3:
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
            case 4:
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
          case 5:
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
          case 6:
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

  // Log #1185::Plan Amendment
  selectUnSelectCategory(row, event) {
    let self = this
    if (event.target.checked) {
      this.showLoader = true; // Show Loader
      let serviceApiUrl: any; let benefitCategoryId: any;
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
      switch (this.discId) {
        case 1:
          this.benefitObj.dentalSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyDentalUrl;
          this.updateBenifitsServices('dentalSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.dentalServiceList);
          break;
        case 2:
          row.coverageTimeFrameKey = this.timeFrameList[0].coverageTimeframeKey;
          row.covCoverageTimeFrameKey = this.timeFrameList[0].coverageTimeframeKey;
          this.benefitObj.visionSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyVisionUrl
          this.updateBenifitsServices('visionSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.visionServiceList);
          break;
        case 3:
          this.benefitObj.healthSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyHealthUrl
          this.updateBenifitsServices('healthSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.healthServiceList);
          break;
        case 4:
          this.benefitObj.drugSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyDrugUrl
          this.updateBenifitsServices('drugSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.drugServiceList);
          break;
        case 5:
          this.benefitObj.supplementSlug.coverageCategory.push(row);
          serviceApiUrl = PlanApi.getServicesByCovKeyHsaUrl
          this.updateBenifitsServices('supplementSlug', row, serviceApiUrl, { "covCatKey": row.covCatKey, "isSelected": true }, this.supplementServiceList);
          break;
        case 6:
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
        $("#select_" + this.discId).prop("checked", true);
      }
    } else {
      $("#select_" + this.discId).prop("checked", false);
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
      this.myTable.updateRow(this.configObject.data[indexid[0]], this.configObject.data[indexid[0]]);
      // check for Editing 
      switch (this.discId) {
        case 1:
          let dentalSlugIndex = this.searchValueInArrayReturn(this.benefitObj.dentalSlug.coverageCategory, row.covCatKey);
          this.benefitObj.dentalSlug.coverageCategory.splice(dentalSlugIndex, 1);
          this.benefitObj.dentalSlug.coverageCategory = this.clearEmpties(this.benefitObj.dentalSlug.coverageCategory);
          this.arrDataDental = this.dentalServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataDental);
          break;
        case 2:
          let visionlSlugIndex = this.searchValueInArrayReturn(this.benefitObj.visionSlug.coverageCategory, row.covCatKey);
          this.benefitObj.visionSlug.coverageCategory.splice(visionlSlugIndex, 1);
          this.benefitObj.visionSlug.coverageCategory = this.clearEmpties(this.benefitObj.visionSlug.coverageCategory);
          this.arrDataVision = this.visionServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataVision);
          break;
        case 3:
          let healthSlugIndex = this.searchValueInArrayReturn(this.benefitObj.healthSlug.coverageCategory, row.covCatKey);
          this.benefitObj.healthSlug.coverageCategory.splice(healthSlugIndex, 1);
          this.benefitObj.healthSlug.coverageCategory = this.clearEmpties(this.benefitObj.healthSlug.coverageCategory);
          this.arrDataHealth = this.healthServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataHealth);
          break;
        case 4:
          let drugSlugIndex = this.searchValueInArrayReturn(this.benefitObj.drugSlug.coverageCategory, row.covCatKey);
          this.benefitObj.drugSlug.coverageCategory.splice(drugSlugIndex, 1);
          this.benefitObj.drugSlug.coverageCategory = this.clearEmpties(this.benefitObj.drugSlug.coverageCategory);
          this.arrDataDrug = this.drugServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataDrug);
          break;
        case 5:
          let supplementSlugIndex = this.searchValueInArrayReturn(this.benefitObj.supplementSlug.coverageCategory, row.covCatKey);
          this.benefitObj.supplementSlug.coverageCategory.splice(supplementSlugIndex, 1);
          this.benefitObj.supplementSlug.coverageCategory = this.clearEmpties(this.benefitObj.supplementSlug.coverageCategory);
          this.arrDataSupplement = this.supplementServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataSupplement);
          break;
        case 6:
          let wellnessSlugIndex = this.searchValueInArrayReturn(this.benefitObj.wellnessSlug.coverageCategory, row.covCatKey);
          this.benefitObj.wellnessSlug.coverageCategory.splice(wellnessSlugIndex, 1);
          this.benefitObj.wellnessSlug.coverageCategory = this.clearEmpties(this.benefitObj.wellnessSlug.coverageCategory);
          this.arrDataWellness = this.wellnessServiceList;
          this.removeDiciplineCategoryService(row.covCatKey, this.arrDataWellness);
          break;
      }
    }
  }

  getTimeFrameList() {
    this.hmsDataServiceService.getApi(PlanApi.getCoverageTimeFrameListUrl).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.timeFrameList = data.result;
      }
    })
  }

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
          this.ToastrService.error('Please select another coverage category. Services are not available for this category!');
        } else {
          this.showLoader = false; // Hide Loader

          // Supplement Check added for log 908 data can be empty
          if (!indexValue) {
            if (resultData.result.servicesData.length == 0) {
              $('#mainCheckbox_' + row.$$gtRowId).click();
              this.ToastrService.error('Please select another coverage category. Services are not available for this category!');
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
        this.ToastrService.error('Please select another coverage category. Services are not available for this category!');
      }
    })
  }

  savebenefitsServices() {
    switch (this.discId) {
      case 1:
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
      case 2:
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
      case 3:
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
      case 4:
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
      case 5:
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
      case 6:
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

  setNodeSelectedFirst(node, isSelected, slug) {
    let promise = new Promise((resolve, reject) => {
      this.setNodeSelected(node, isSelected, slug);
      resolve();
    }).then(res => {
      this.savebenefitsServices();
    });
  }

  setNodeSelected(node, isSelected, slug) {
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

  clearEmpties(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    return newArray;
  }

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

  searchValueInArrayReturn(benifitObject, arrayValue) {
    return benifitObject.findIndex(x => x.covCatKey === arrayValue);
  }

  genericSettingData() {
    let settingData = [];
    switch (this.discId) {
      case 1:
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
          { objectKey: 'payClaim', columnOrder: 9, visible: true }
        ];
        break;
      case 2:
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
          { objectKey: 'payClaim', columnOrder: 9, visible: true }
        ];
        break;
      case 3:
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
          { objectKey: 'payClaim', columnOrder: 9, visible: true }

        ];
        break;
      case 4:
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
          { objectKey: 'payClaim', columnOrder: 9, visible: true }

        ];
        break;
      case 5:
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
          { objectKey: 'payClaim', columnOrder: 9, visible: false }

        ];
        break;
      case 6:
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
          { objectKey: 'payClaim', columnOrder: 9, visible: true }
        ];
        break;
    }
    return settingData;
  }

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

  saveDiscCoverageCategories() {
    // Payload created for save functionality.
    this.addCoverageData = {
      "disciplineCoverageData":{
        'planNum': this.disciplineCoverageForm.value.planNum,
        'divisionNum': this.disciplineCoverageForm.value.divisionNum,
        'divisionDescription': this.disciplineCoverageForm.value.divisionDescription,
        'effDate': this.disciplineCoverageForm.value.effDate,
        'dependantAge1': this.disciplineCoverageForm.value.dependantAge1,
        'dependantAge2': this.disciplineCoverageForm.value.dependantAge2
      },
      "benefitsJson": [],
      "coKey": this.coKeyForAddCategoryPayload,
      "coName": this.coNameForAddCategoryPayload,
      "plansKey": this.plansKeyForAddCategoryPayload,
      "plansName": this.plansNameForAddCategoryPayload
    }
    
    // cases to send only descipline slug which is opened in pop up.
    switch (this.discId) {
      case 1:
        this.addCoverageData.benefitsJson = {"dentalSlug": this.benefitObj.dentalSlug}
        break;
      case 2:
        this.addCoverageData.benefitsJson = {"visionSlug": this.benefitObj.visionSlug}
        break;
      case 3:
        this.addCoverageData.benefitsJson = {"healthSlug": this.benefitObj.healthSlug}
        break;
      case 4:
        this.addCoverageData.benefitsJson = {"drugSlug": this.benefitObj.drugSlug}
        break;
      case 5:
        this.addCoverageData.benefitsJson = {"supplementSlug": this.benefitObj.supplementSlug}
        break;
      case 6:
        this.addCoverageData.benefitsJson = {"wellnessSlug": this.benefitObj.wellnessSlug}
        break;
    }
    
    let url = ''    

    this.hmsDataServiceService.postApi(url, this.addCoverageData).subscribe(data => {
      if (data.code == 200) {
        console.warn("Save Successfull");
      }
    })

  }

  //   Show rules in Plan View with expand option.
  openRulesPage(){      
   window.open("/rules/1", "_blank");
  }
}