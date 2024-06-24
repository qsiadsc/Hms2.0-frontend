import { Component, OnInit, Output, EventEmitter, Input, ElementRef, ViewChild, QueryList, ViewChildren, TemplateRef } from '@angular/core';
import { PlanService } from '../plan.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { PlanApi } from '../plan-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { IMyInputFocusBlur } from 'mydatepicker';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { DialogService, ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { TranslateService } from '@ngx-translate/core';
import { DropdownSettings } from 'angular2-multiselect-dropdown/multiselect.interface';
import { FormCanDeactivate } from '../../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css'],
  providers: [HmsDataServiceService, DatatableService, ChangeDateFormatService, ToastrService, TranslateService]
})

export class RulesComponent extends FormCanDeactivate implements OnInit {
  firstTab: any;
  editRowruleDesc: any;
  editRowruleKey: any;
  editRowCovDesc: any;
  editRowCovKey: any;
  isUpdateRule: boolean = false;
  planType: any;
  rulesEffectiveDate: any;
  rulesInfo: any;
  error: { isError: boolean; errorMessage: string; };
  companyPlanKey: any;
  selectedCovCatValue: any;
  selectedItems: any;
  selectAll: any;
  unselectAll: any;

  rows = []
  columns1 = [
    { prop: 'coverageKey' },
    { prop: 'covDesc' },
    { prop: 'ruleDesc' },
    { prop: 'effectiveOn' },
    { prop: 'expireOn' },
  ];

  // Rule Pagination ngx-datatable
  @Input() footerHeight: number;
  @Input() rowCount: number;
  @Input() pageSize: number;
  @Input() offset: number;
  @Input() pagerLeftArrowIcon: string;
  @Input() pagerRightArrowIcon: string;
  @Input() pagerPreviousIcon: string;
  @Input() pagerNextIcon: string;
  @Input() totalMessage: string;
  @Input() footerTemplate: TemplateRef<any>;
  @Input() selectedCount: number = 0;
  @Input() selectedMessage: string | boolean = false;
  @Output() page: EventEmitter<any> = new EventEmitter();
  deleteButtonObservableObj: any;
  get isVisible(): boolean {
    return (this.rowCount / this.pageSize) > 1;
  }
  get curPage(): number {
    return this.offset + 1;
  }

  keys: string[];
  coverageCatName: any;
  @Output() rulesData = new EventEmitter();
  FormGroup: FormGroup;
  tabName = [];
  tabTitle = [];
  tabKeys = [];
  benefits = [];
  benefitkey;
  selectedItem;
  coverageCategory = [];
  rulesList = false;
  coverageCategoryKeys;
  rulesDropDown = []
  arr = new Array();
  rulesObj: any = {};
  rulesObjArray: any = [];
  checkBenefitCat: boolean = false
  getRulesDataFromDB: any;
  dataTableColumnName: any;
  deletedItemsExist: boolean = false
  isEdit = false;
  isEditMode: boolean = false
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  dropdownSettings: any = {};
  public planInfo = [];
  dentalBenefitKey: any;
  showLoader: boolean = false;
  expired: boolean;
  // <!-- issue no 339 -->
  disableDelete: boolean = true;
  // <!-- issue no 339 -->
  itemsPerPageCount: number;
  tableOffset: number = 0;
  addObservableObj: any;
  currentPageNumber: String;
  totalRows: number;
  currPage: any;
  showZeroCount: boolean = false;
  pageFrom: any;
  pageTo: any;
  defaultSelectDropDown: number;
  constructor(
    private planService: PlanService,
    private hmsDataServiceService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private elm: ElementRef,
    private route: ActivatedRoute,
    private exDialog: ExDialog,
    private ToastrService: ToastrService,
    private translate: TranslateService,
    private completerService: CompleterService,
    private dialogService: DialogService
  ) {
    super();
    this.route.queryParams.subscribe((params: Params) => {
      this.companyPlanKey = params.planId;
      this.planType = params.planType
    });

    planService.planModuleData.subscribe((value) => {
      // issue no 339
      if (value.planInfoJson[0].isCompanyOld == "F") {
        // F ( disable delete) for old companies T for new  (enable delete)
        this.disableDelete = true;
      } else {
        this.disableDelete = false;
      }
      this.planInfo = value.planInfoJson[0];
      if (value.rulesHistInd) {
        if (value.rulesHistInd[0] != undefined) {
          if (value.rulesHistInd[0].dentalRuleHistInd == "Y" ||
            value.rulesHistInd[0].drugRuleHistInd == "Y" ||
            value.rulesHistInd[0].healthCareRuleHistInd == "Y" ||
            value.rulesHistInd[0].visionRuleHistInd == "Y") {
            this.isCoverageRuleHistoryExist = true;
          }
          else {
            this.isCoverageRuleHistoryExist = false;
          }
        }
      }

      this.rulesInfo = value.rulesJson[0]
      if (value.rulesJson) {
        this.rulesEffectiveDate = value.rulesJson.effectiveDate
      } else {
        this.rulesEffectiveDate = ''
      }

      this.benefits = [];
      this.benefits = value.benefitsJson;
      this.tabName = []
      this.tabTitle = []
      this.rulesDropDown = []

      this.setRuleEffDtAsPlanEffDt();

      if (this.benefits.length > 0) {
        var i;
        let benefitKeys = Object.keys(this.benefits[0]);
        for (this.benefitkey of benefitKeys) {
          if (this.benefitkey == 'dentalSlug') {
            this.tabName.push('dentalRule');
            this.tabTitle.push({ title: 'Dental', key: 'dentalRule', index: 0 });
            this.dentalBenefitKey = this.benefits[0].dentalSlug.benefitKey;
          } else if (this.benefitkey == 'visionSlug') {
            this.tabName.push('visionRule');
            this.tabTitle.push({ title: 'vision', key: 'visionRule', index: 1 });
          } else if (this.benefitkey == 'healthSlug') {
            this.tabName.push('healthCareRule');
            this.tabTitle.push({ title: 'health', key: 'healthCareRule', index: 2 });
          } else if (this.benefitkey == 'drugSlug') {
            this.tabName.push('drugRule');
            this.tabTitle.push({ title: 'drug', key: 'drugRule', index: 3 });
          } else if (this.benefitkey == 'supplementSlug') {
            this.tabName.push('supplementRule');
            this.tabTitle.push({ title: 'supplemental', key: 'supplementRule', index: 4 });
          } else if (this.benefitkey == 'wellnessSlug') {
            this.tabName.push('wellnessRule');
            this.tabTitle.push({ title: 'Wellness', key: 'wellnessRule', index: 5 });
          }
        }
        this.tabTitle.sort(function (obj1, obj2) {
          return obj1.index - obj2.index;
        });
      }

      if (this.tabTitle.length > 0) {
        if (this.tabTitle[0].title) {
          this.isUpdateRule = false
          this.coverageCategory = [];
          this.getCoverageCategories(this.tabTitle[0].key)
          this.selectedItem = this.tabTitle[0].key
          if (this.selectedItem == "dentalRule") {
            this.dataTableColumnName = "Dental";
          } else if (this.selectedItem == "visionRule") {
            this.dataTableColumnName = "Vision";
          } else if (this.selectedItem == "healthCareRule") {
            this.dataTableColumnName = "Health";
          } else if (this.selectedItem == "drugRule") {
            this.dataTableColumnName = "Drug";
          } else if (this.selectedItem == "supplementRule") {
            this.dataTableColumnName = "Supplemental";
          } else if (this.selectedItem == "wellnessRule") {
            this.dataTableColumnName = "Wellness";
          }
        } else {
          this.getCoverageCategories('a')
        }
        this.firstTab = this.tabTitle[0].key
      }
      //Rule Tab Edit Mode Start
      if (this.companyPlanKey) {
        this.showLoader = true
        if (value.rulesJson[0].dentalRule && Object.keys(value.rulesJson[0].dentalRule).length > 0) {
          Object.assign(this.rulesObj, { "dentalRule": value.rulesJson[0].dentalRule });
          if (this.firstTab == 'dentalRule') {
            this.rows = this.rulesObj.dentalRule;
            this.deletedItemsExist = true
            this.isEdit = true
          }
        }
        if (value.rulesJson[0].visionRule && Object.keys(value.rulesJson[0].visionRule).length > 0) {
          Object.assign(this.rulesObj, { "visionRule": value.rulesJson[0].visionRule });
          if (this.firstTab == 'visionRule') {
            this.rows = this.rulesObj.visionRule;
            this.deletedItemsExist = true
            this.isEdit = true
          }
        }
        if (value.rulesJson[0].healthCareRule && Object.keys(value.rulesJson[0].healthCareRule).length > 0) {
          Object.assign(this.rulesObj, { "healthCareRule": value.rulesJson[0].healthCareRule });

          if (this.firstTab == 'healthCareRule') {
            this.rows = this.rulesObj.healthCareRule;
            this.deletedItemsExist = true
            this.isEdit = true
          }
        }
        if (value.rulesJson[0].drugRule && Object.keys(value.rulesJson[0].drugRule).length > 0) {
          Object.assign(this.rulesObj, { "drugRule": value.rulesJson[0].drugRule });
          if (this.firstTab == 'drugRule') {
            this.rows = this.rulesObj.drugRule;
            this.deletedItemsExist = true
            this.isEdit = true
          }
        }
        if (value.rulesJson[0].supplementRule && Object.keys(value.rulesJson[0].supplementRule).length > 0) {
          Object.assign(this.rulesObj, { "supplementRule": value.rulesJson[0].supplementRule });
          if (this.firstTab == 'supplementRule') {
            this.rows = this.rulesObj.supplementRule;
            this.deletedItemsExist = true
            this.isEdit = true
          }
        }
        if (value.rulesJson[0].wellnessRule && Object.keys(value.rulesJson[0].wellnessRule).length > 0) {
          Object.assign(this.rulesObj, { "wellnessRule": value.rulesJson[0].wellnessRule });
          if (this.firstTab == 'wellnessRule') {
            this.rows = this.rulesObj.wellnessRule;
            this.deletedItemsExist = true
            this.isEdit = true
          }
        }
        this.rows = [...this.rows]
        this.getRulesByBenefit(this.firstTab);
      } else {
        var dateValue = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
        this.FormGroup.patchValue({
          effectiveDate: {
            date: {
              year: dateValue.date.year,
              month: dateValue.date.month,
              day: dateValue.date.day
            }
          }
        });
      }
    });
    // To enable delete in copy division in any type of plan.
    this.planService.enableRulesDeleteButton.subscribe( value =>{
      if (value) {
        this.deleteButtonObservableObj = Observable.interval(3500).subscribe(x => {
          this.disableDelete = false
          this.deleteButtonObservableObj.unsubscribe();
        })        
      }else{
        this.disableDelete = true
      }
    })
  }

  isCoverageRuleHistoryExist = false;

  coverage_rule_columns = [
    { title: "Coverage Rule", data: 'ruleDesc' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expireOn' }
  ]

  dataToggle: string
  coverageRuleDataTarget: string
  coverageRuleId: string
  coverageRuleTitle: string
  coverageRuleClass: string

  ngOnInit() {
    this.dataToggle = "modal"
    this.coverageRuleDataTarget = "#coverageRuleHistory"
    this.coverageRuleId = "coverage_rule_history"
    this.coverageRuleTitle = "Coverage Rule History"
    this.coverageRuleClass = "history-ico"

    this.FormGroup = new FormGroup({
      'coverageCat': new FormControl(''),
      'effectiveDate': new FormControl('', [Validators.required]),
      'expiryDate': new FormControl(''),
      'rules': new FormControl('')
    });

    if (this.planType == 'editPlan') {
      this.isEditMode = true;
    }

    $(document).on('mouseover', '.del-ico', function () {
      $(this).attr('title', 'Delete');
    })

    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', 'Edit');
    })
    
    this.defaultSelectDropDown = 5
    this.itemsPerPageCount = 5    
    // Task 99 for pagination in rules section of plan in company, works when clicked on any page number
    var self = this
    this.planService.rulesTabClicked.subscribe(val => {
      this.paginationCount(1)
      this.addObservableObj = Observable.interval(1000).subscribe(val => {
        $(document).ready(function() {         
          $('#rulesTable .visible .datatable-footer .datatable-footer-inner .datatable-pager ul.pager li').click(function(e) {
            self.tableOffset = +this.attributes[2].value.replace(/[^0-9]/g, "")-1
            self.paginationCount(this.attributes[2].value.replace(/[^0-9]/g, ""))
          });         
        });
      });
    })
    
    // Task 99 for pagination in rules section of plan in company, works when single entry is deleted
    this.dialogService.deleteConfirmed.subscribe(val =>{
      this.paginationCount(this.currPage)
      if (this.pageFrom - this.pageTo == 1) {
        var pageAfterDeletion = this.currPage - 1
        this.paginationCount(pageAfterDeletion)
        if (this.totalRows == 0) {
          this.showZeroCount = true
        }
      }
    })
    
    // Task 99 for previous button of pagination in rules section of plan in company
    $(document).on('click','#rulesTable .visible .datatable-footer .datatable-footer-inner .datatable-pager ul.pager li:nth-child(2)',function(e){
      self.paginationCount(+self.currPage-1)
    })
    
    // Task 99 for next button of pagination in rules section of plan in company
    $(document).on('click','#rulesTable .visible .datatable-footer .datatable-footer-inner .datatable-pager ul.pager li:nth-last-child(2)',function(e){
      self.paginationCount(+self.currPage+1)
    }) 
       
  }

  getCoverageRuleHistory() {
    var coverage_rule_url = PlanApi.getCoverageRuleHistory;
    var coverageRuleTableId = "coverage_rule";
    var reqParamProHist = [{ 'key': 'benefitKey', 'value': this.dentalBenefitKey }]
    if (!$.fn.dataTable.isDataTable('#coverage_rule')) {
      var dateCols = ['effectiveOn', 'expireOn']
      this.dataTableService.jqueryDataTable(coverageRuleTableId, coverage_rule_url, 'full_numbers', this.coverage_rule_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined, dateCols)
    }
    else {
      this.dataTableService.jqueryDataTableReload(coverageRuleTableId, coverage_rule_url, reqParamProHist)
    }
  }

  triggerRuleData() {
    this.FormGroup.reset();
    this.FormGroup.controls['coverageCat'].enable();
    this.dropdownSettings = this.multiSelectDropdownEnable();
    $('.company-tabs li:nth-child(4)').removeClass('active');
    $('.company-tabs [href*="plan-guide"]').parent().addClass('active');
    $('.grid-inner #plan-rule').removeClass('active in');
    $('.grid-inner #plan-guide').addClass('active in');
    this.rulesData.emit(this.rulesObj);
  }

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    var error = { isError: false, errorMessage: '' };
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
      if (formName == 'FormGroup') {
        this.FormGroup.patchValue(datePickerValue);

        if (this.planInfo['effectiveOn'] && this.FormGroup.value.effectiveDate) {
          var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
          error = this.changeDateFormatService.compareTwoDates(effectiveDt.date, this.FormGroup.value.effectiveDate.date);
          if (error.isError == true) {
            this.FormGroup.controls['effectiveDate'].setErrors({
              "rulesDateNotValid": true
            });
          }
        }

        if (this.FormGroup.value.effectiveDate && this.FormGroup.value.expiryDate) {
          this.error = this.changeDateFormatService.compareTwoDates(this.FormGroup.value.effectiveDate.date, this.FormGroup.value.expiryDate.date);
          if (this.error.isError == true) {
            this.FormGroup.controls['expiryDate'].setErrors({
              "ExpiryDateNotValid": true
            });
          }
        }
      }
    }

    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }


  }

  tabClick(newValue) {
    let previousSelectedTab = this.selectedItem
    if (this.isUpdateRule) {
      setTimeout(() => {
        $('#' + previousSelectedTab + '-rule').addClass('active')
        $('#' + newValue + '-rule').removeClass('active')
        this.ToastrService.error('Please update last edited rule!')
        return false;
      }, 200);
    } else {
      this.showLoader = true
      this.selectedItem = newValue;
      this.rulesDropDown = []
      this.FormGroup.controls['rules'].reset();
      if (this.selectedItem == "dentalRule") {
        this.dataTableColumnName = "Dental";
      } else if (this.selectedItem == "visionRule") {
        this.dataTableColumnName = "Vision";
      } else if (this.selectedItem == "healthCareRule") {
        this.dataTableColumnName = "Health";
      } else if (this.selectedItem == "drugRule") {
        this.dataTableColumnName = "Drug";
      } else if (this.selectedItem == "supplementRule") {
        this.dataTableColumnName = "Supplemental";
      }
      this.getRulesByBenefit(newValue);
      this.getCoverageCategories(this.selectedItem)
      this.rows = []
      var keyExists = this.rulesObj.hasOwnProperty(this.selectedItem);
      if (keyExists) {
        if (this.rulesObj[this.selectedItem].length > 0) {
          this.rows = this.rulesObj[this.selectedItem]
          this.rows = [...this.rows]
        }
      }
    }
  }

  getCoverageCategories(val) {
    this.coverageCategory = [];
    if (val == 'dentalRule') {
      this.coverageCategory = this.benefits[0].dentalSlug.coverageCategory;
      if (this.coverageCategory) {
        if (this.coverageCategory.length > 0) {
          this.selectedCovCatValue = this.coverageCategory[0].covCatKey
          this.coverageCatName = this.coverageCategory[0].covCatDesc
          this.checkBenefitCat = true
        } else {
          this.checkBenefitCat = false
        }
      }
    } else if (val == 'drugRule') {
      this.coverageCategory = this.benefits[0].drugSlug.coverageCategory;
      if (this.coverageCategory) {
        if (this.coverageCategory.length > 0) {
          this.selectedCovCatValue = this.coverageCategory[0].covCatKey
          this.coverageCatName = this.coverageCategory[0].covCatDesc
          this.checkBenefitCat = true
          this.showLoader = false
        } else {
          this.checkBenefitCat = false
        }
      }
    } else if (val == 'visionRule') {
      this.coverageCategory = this.benefits[0].visionSlug.coverageCategory;
      if (this.coverageCategory) {
        if (this.coverageCategory.length > 0) {
          this.selectedCovCatValue = this.coverageCategory[0].covCatKey
          this.coverageCatName = this.coverageCategory[0].covCatDesc
          this.checkBenefitCat = true
          this.showLoader = false
        } else {
          this.checkBenefitCat = false
        }
      }
    } else if (val == 'healthCareRule') {
      this.coverageCategory = this.benefits[0].healthSlug.coverageCategory;
      if (this.coverageCategory) {
        if (this.coverageCategory.length > 0) {
          this.selectedCovCatValue = this.coverageCategory[0].covCatKey
          this.coverageCatName = this.coverageCategory[0].covCatDesc
          this.checkBenefitCat = true
          this.showLoader = false
        } else {
          this.checkBenefitCat = false
        }
      }
    } else if (val == 'supplementRule') {
      this.coverageCategory = this.benefits[0].supplementSlug.coverageCategory;
      if (this.coverageCategory) {
        if (this.coverageCategory.length > 0) {
          this.selectedCovCatValue = this.coverageCategory[0].covCatKey
          this.coverageCatName = this.coverageCategory[0].covCatDesc
          this.checkBenefitCat = true
          this.showLoader = false
        } else {
          this.checkBenefitCat = false
        }
      }
    } else if (val == 'wellnessRule') {
      this.coverageCategory = this.benefits[0].wellnessSlug.coverageCategory;
      if (this.coverageCategory) {
        if (this.coverageCategory.length > 0) {
          this.selectedCovCatValue = this.coverageCategory[0].covCatKey
          this.coverageCatName = this.coverageCategory[0].covCatDesc
          this.checkBenefitCat = true
          this.showLoader = false
        } else {
          this.checkBenefitCat = false
        }
      }
    } else {
      this.checkBenefitCat = false
    }
  }

  getRulesByBenefit(val) {

    this.rulesDropDown = []
    if (val == "dentalRule") {
      var getDentalRule = PlanApi.getDentalRules;
      this.hmsDataServiceService.getApi(getDentalRule).subscribe(data => {
        if (data) {
          if (data.code == 200) {
            this.rulesDropDown = []
            for (var i = 0; i < data.result.length; i++) {
              this.rulesDropDown.push({ 'id': data.result[i].ruleKey, 'itemName': data.result[i].ruleDesc });
              this.rulesList = true;
              this.arr[data.result[i].ruleKey] = data.result[i].ruleDesc;
            }
            this.showLoader = false;
          } else {
            this.rulesDropDown = [];
            this.rulesList = false;
            this.showLoader = false;
          }
        } else {
          this.rulesDropDown = [];
          this.rulesList = false;
          this.showLoader = false;
        }

      });
    }
    if (val == "visionRule") {
      var getVisionRule = PlanApi.getVisionRules;
      this.hmsDataServiceService.getApi(getVisionRule).subscribe(data => {
        if (data) {
          if (data.code == 200) {
            this.rulesDropDown = []
            for (var i = 0; i < data.result.length; i++) {
              this.rulesDropDown.push({ 'id': data.result[i].ruleKey, 'itemName': data.result[i].ruleDesc });
              this.rulesList = true;
              this.arr[data.result[i].ruleKey] = data.result[i].ruleDesc;
            }
            this.showLoader = false;
          } else {
            this.rulesDropDown = [];
            this.rulesList = false;
            this.showLoader = false;
          }
        } else {
          this.rulesDropDown = [];
          this.rulesList = false;
          this.showLoader = false;
        }
      });
    }
    if (val == "healthCareRule") {
      var getHealthRule = PlanApi.getHealthCareRules;
      this.hmsDataServiceService.getApi(getHealthRule).subscribe(data => {
        if (data) {
          if (data.code == 200) {
            this.rulesDropDown = []
            for (var i = 0; i < data.result.length; i++) {
              this.rulesDropDown.push({ 'id': data.result[i].ruleKey, 'itemName': data.result[i].ruleDesc });
              this.rulesList = true;
              this.arr[data.result[i].ruleKey] = data.result[i].ruleDesc;
            }
            this.showLoader = false;
          } else {
            this.rulesDropDown = [];
            this.rulesList = false;
            this.showLoader = false;
          }
        } else {
          this.rulesDropDown = [];
          this.rulesList = false;
          this.showLoader = false;
        }
      });
    }
    if (val == "drugRule") {
      var getDrugRule = PlanApi.getDrugRules;
      this.hmsDataServiceService.getApi(getDrugRule).subscribe(data => {
        if (data) {
          if (data.code == 200) {
            this.rulesDropDown = []
            for (var i = 0; i < data.result.length; i++) {
              this.rulesDropDown.push({ 'id': data.result[i].ruleKey, 'itemName': data.result[i].ruleDesc });
              this.rulesList = true;
              this.arr[data.result[i].ruleKey] = data.result[i].ruleDesc;
            }
            this.showLoader = false;
          } else {
            this.rulesDropDown = [];
            this.rulesList = false;
            this.showLoader = false;
          }
        } else {
          this.rulesDropDown = [];
          this.rulesList = false;
          this.showLoader = false;
        }
      });
    }
    if (val == "supplementRule") {
      this.rulesDropDown = [];
      this.rulesList = false;
      this.showLoader = false;
    }
    if (val == "wellnessRule") {
      this.rulesDropDown = [];
      this.rulesList = false;
      this.showLoader = false;
    }
  }

  addRules(formVal) {
    if (this.FormGroup.valid) {
      var tab = this.selectedItem;
      this.rulesObjArray = [];
      if (this.selectedItems === undefined || this.selectedItems === null ) {
        return false;
      }
      var selectedRuleIds = [];
      for (var i = 0; i < this.selectedItems.length; i++) {
        selectedRuleIds.unshift(this.selectedItems[i].id);
      }

      selectedRuleIds.forEach(item => {
        var keyExists = this.rulesObj.hasOwnProperty(tab);
        if (keyExists) {
          var selectedKey = this.rulesObj[tab];
          var RuleIdFound = selectedKey.some(function (el) {
            var id = el.ruleKey === item
            var catId = el.coverageKey === parseInt(formVal.value.coverageCat)
            if (id && catId) {
              return true
            } else {
              return false;
            }
          });
        } else {
          RuleIdFound = false
        }

        if (!RuleIdFound) {
          if (this.rows.length > 0) {
            this.rulesObj[tab].unshift(
              {
                'coverageKey': parseInt(formVal.value.coverageCat),
                'covDesc': this.coverageCatName,
                'effectiveOn': this.changeDateFormatService.convertDateObjectToString(formVal.value.effectiveDate),
                'ruleDesc': this.arr[item],
                'ruleKey': item,
              });
            this.deletedItemsExist = true
          } else {
            this.rulesObjArray.unshift({
              'coverageKey': parseInt(formVal.value.coverageCat),
              'covDesc': this.coverageCatName,
              'effectiveOn': this.changeDateFormatService.convertDateObjectToString(formVal.value.effectiveDate),
              'ruleDesc': this.arr[item],
              'ruleKey': item,
              'isNew': true
            });
            Object.defineProperty(this.rulesObj, tab, {
              value: this.rulesObjArray,
              writable: true,
              enumerable: true,
              configurable: true
            });
            this.deletedItemsExist = true
          }

          this.rulesData.emit(this.rulesObj[tab]);
          this.rows = this.rulesObj[tab]
          this.rows = [...this.rows]
          this.keys = Object.keys(this.rulesObj)
        }
      });
      var dateValue = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
      this.FormGroup.patchValue({
        effectiveDate: {
          date: {
            year: dateValue.date.year,
            month: dateValue.date.month,
            day: dateValue.date.day
          }
        }
      });
      this.FormGroup.controls['rules'].reset();
      this.getCoverageCategories(tab);
    } else {
      this.validateAllFormFields(this.FormGroup);
      //Get focus on Invalid field
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
    // to show added rules checked already in dropdown
    this.showAddedRulesSelected()
    // Task 99 for pagination in rules section of plan in company, works when new rule(s) added
    this.paginationCount(1)
    this.showZeroCount = false
  }

  covCatChange(event) {
    const selectEl = event.target;
    const val1 = selectEl.options[selectEl.selectedIndex].getAttribute('data-coverageCatName');
    this.coverageCatName = val1
  }

  deleteRule(coverageKey, rulesId, rowIndex) {
    // to get index
    for(var i=0; i<this.rows.length; i++){
      if (rulesId == this.rows[i].ruleKey && coverageKey == this.rows[i].coverageKey) {
        rowIndex = i
      }
    }
    var tab = this.selectedItem
    if (coverageKey && rulesId) {
      this.exDialog.openConfirm('Are you sure you want to delete the rule?').subscribe((value) => {
        if (value) {
          
          this.rows.splice(rowIndex, 1);
          this.rows = [...this.rows]
          this.rulesObj[tab] = []
          // <!-- issue no 339 -->
          for (var i = 0; i < this.rows.length; i++) {
            this.rulesObj[tab].push(this.rows[i])
          }
          
          // <!-- issue no 339 -->
          this.selectedItems = [];
          this.isUpdateRule = false;
          // to avoid delete all button disappear if any 1 rule deleted
          if (this.rows.length == 0) {           
          this.deletedItemsExist = false;
          }
          this.dropdownSettings = this.multiSelectDropdownEnable();
            this.planService.planModuleData.subscribe((value) => {
              if (value.rulesJson[0].dentalRule && Object.keys(value.rulesJson[0].dentalRule).length > 0) {
                Object.assign(this.rulesObj, { "dentalRule": value.rulesJson[0].dentalRule });
                if (this.firstTab == 'dentalRule') {
                  this.deletedItemsExist = true
                }
              }
          });
        }
      });
    }
    // to show added rules checked already in dropdown
    this.showAddedRulesSelected()
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

  triggerEditRuleData() {
    let value = this.getRulesDataFromDB;
    this.rows = [];
  }

  deleteAllRules() {
    var tab = this.selectedItem
    if (tab) {
      this.exDialog.openConfirm('Are you sure you want to delete all Added Rules').subscribe((value) => {
        if (value) {
          this.rows = []
          this.rows = [...this.rows]
          this.rulesObj[tab] = []
          this.rulesData.emit(this.rulesObj);
          this.deletedItemsExist = false
          this.showAddedRulesSelected()
          // to set default (5) per page count in rules section of plan in company, works when all rules deleted
          this.defaultSelectDropDown = 5
          this.itemsPerPageCountChange(5)
        }
      })
      this.selectedItems = [];
      this.isUpdateRule = false;
      this.dropdownSettings = this.multiSelectDropdownEnable();
    }
  }

  editRule(row, rowIndex) {
    this.dropdownSettings = this.multiSelectDropdowndisable();
    this.isUpdateRule = true;
    this.editRowCovKey = row.coverageKey
    this.editRowCovDesc = row.covDesc
    this.editRowruleKey = row.ruleKey
    this.editRowruleDesc = row.ruleDesc
    this.selectedItems = [{
      "id": this.editRowruleKey,
      "itemName": this.editRowruleDesc
    }]

    this.FormGroup.patchValue({
      'coverageCat': row.coverageKey,
      'effectiveDate': this.changeDateFormatService.convertStringDateToObject(row.effectiveOn),
      'expiryDate': this.changeDateFormatService.convertStringDateToObject(row.expireOn)
    });
    this.FormGroup.controls['coverageCat'].disable();
    this.FormGroup.controls['rules'].disable();
  }

  updateRule(formVal) {
    let tab = this.selectedItem;
    let updateItem = this.rulesObj[tab].find(x => (x.coverageKey === this.editRowCovKey && x.ruleKey === this.editRowruleKey));
    let index = this.rulesObj[tab].indexOf(updateItem);
    // issue no 339 
    let data = {}
    if (this.rulesObj[tab][index].covRuleAssgnKey) {
      
      data = {
        'coverageKey': parseInt(this.editRowCovKey),
        'covDesc': this.editRowCovDesc,
        'effectiveOn': this.changeDateFormatService.convertDateObjectToString(formVal.value.effectiveDate),
        'expireOn': this.changeDateFormatService.convertDateObjectToString(formVal.value.expiryDate),
        'ruleDesc': this.editRowruleDesc,
        'ruleKey': this.editRowruleKey,
        'covRuleAssgnKey': this.rulesObj[tab][index].covRuleAssgnKey
      };
    } else {
      data = {
        'coverageKey': parseInt(this.editRowCovKey),
        'covDesc': this.editRowCovDesc,
        'effectiveOn': this.changeDateFormatService.convertDateObjectToString(formVal.value.effectiveDate),
        'expireOn': this.changeDateFormatService.convertDateObjectToString(formVal.value.expiryDate),
        'ruleDesc': this.editRowruleDesc,
        'ruleKey': this.editRowruleKey,
      };
    }
   
    // issue no 339 
    this.rulesObj[tab][index] = data;
    this.ToastrService.success(this.translate.instant('company.plan.toaster.ruleUpdated'))
    this.rows = this.rulesObj[tab]
    this.rows = [...this.rows]
    this.FormGroup.controls['coverageCat'].enable();
    this.FormGroup.controls['rules'].enable();
    this.isUpdateRule = false;
    this.dropdownSettings = this.multiSelectDropdownEnable();
    this.selectedItems = []
    this.setRuleEffDtAsPlanEffDt()
    // To show added rules selected.
    this.showAddedRulesSelected()
  }

  setRuleEffDtAsPlanEffDt() {
    var dateValue = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
    this.FormGroup.patchValue({
      effectiveDate: {
        date: {
          year: dateValue.date.year,
          month: dateValue.date.month,
          day: dateValue.date.day
        }
      }
    });
  }

  triggerRulesDropdownData() {
    this.getRulesByBenefit(this.firstTab);
  }

  multiSelectDropdownEnable() {
    let dropdownSetting = {
      singleSelection: false,
      text: "Select Rules",
      enableCheckAll: false,
      badgeShowLimit: true,
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: false,
    };
    // to show added rules checked already in dropdown
    this.showAddedRulesSelected()
    return dropdownSetting;
  }

  multiSelectDropdowndisable() {
    let dropdownSetting = {
      singleSelection: false,
      text: "Select Rules",
      enableCheckAll: false,
      badgeShowLimit: true,
      enableSearchFilter: true,
      classes: "myclass custom-class",
      disabled: true,
    };
    return dropdownSetting;
  }

  triggerRuleDropDownWhenEff(event, key) {
    if (event.reason == 2) {
      if (!this.isUpdateRule) {
        $("#rulesSelect-" + key + " .c-btn").trigger('click');
      }
    }
  }


  openRulesPage(val){
    if (val == "dentalRule") {
      window.open("/rules/1", "_blank");
    }
    if (val == 'drugRule') {
      window.open("/rules/4", "_blank");
    }
    if (val == 'visionRule') {
      window.open("/rules/2", "_blank");
    }
    if (val == 'healthCareRule') {
      window.open("/rules/3", "_blank");
    }
    if (val == 'supplementRule') {
      window.open("/rules/1", "_blank");
    }
    if (val == 'wellnessRule') {
      window.open("/rules/1", "_blank");
    }
  }

  onFooterPage(event, pageSize, totalRecord) {
    this.showPaginationCounting(event.page, pageSize, totalRecord)
  }

  showPaginationCounting(tableCurrentPage, tableItemsPerPage, totalRecord) {
    this.selectedMessage = true
    let pageFrom;
    let pageTo;
    if (tableCurrentPage == 1) {
      pageFrom = 1;
      pageTo = tableItemsPerPage;
    } else {
      pageFrom = (tableCurrentPage * tableItemsPerPage) - (tableItemsPerPage - 1)
      pageTo = (tableCurrentPage * tableItemsPerPage)
    }
    if (totalRecord < pageTo) {
      pageTo = totalRecord;
    }
    this.totalMessage = "Showing " + pageFrom + " to " + pageTo + " of " + totalRecord + " entries.";
  }

  // To show previously added rules selected already
  showAddedRulesSelected(){
    this.selectedItems = []
    if (this.rows.length>0) {
      for(var i=0; i<this.rows.length; i++){
        this.selectedItems.push({ 'id': this.rows[i].ruleKey, 'itemName': this.rows[i].ruleDesc });
      }
    }
  }
  
  // Task 99 this method used to go to page 1 whenever items per page changed
  itemsPerPageCountChange(value){
    this.tableOffset = 0
    this.itemsPerPageCount = +value
    this.paginationCount(1)
  }

  // Task 99 method for pagination in rules section of plan in company, this method counts and shows entries per page
  paginationCount(currentPage){
    this.currPage = currentPage   
    if (currentPage != "") {
      this.totalRows = this.rows.length
      this.selectedMessage = true
      this.pageFrom;
      this.pageTo;
      if (currentPage == 1) {
        this.pageFrom = 1;
        this.pageTo = this.itemsPerPageCount;
      } else {
        this.pageFrom = (currentPage * this.itemsPerPageCount) - (this.itemsPerPageCount - 1)
        this.pageTo = (currentPage * this.itemsPerPageCount)
      }
      if (this.totalRows < this.pageTo) {
        this.pageTo = this.totalRows;
      }
      // Task 99 Below condiiton added to show 0 items when no rule exist initially
      if (this.totalRows == 0) {
        this.pageFrom = 0
      }      
      this.totalMessage = "Showing " + this.pageFrom + " to " + this.pageTo + " of " + this.totalRows + " entries.";  
    }    
  }

}