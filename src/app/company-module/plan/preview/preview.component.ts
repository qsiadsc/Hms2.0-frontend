import { Component, OnInit } from '@angular/core';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { PlanApi } from '../plan-api';
import { PlanService } from '../plan.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Constants } from '../../../common-module/Constants';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {

  planPrintData; 
  
  /* Plan Layout Structure Section */

  // Plan Section
  yrTypeKey: any;
  yrTypeDesc: any;
  plansId: any;
  effectiveOn: any;

  // Division Section
  divisionId: any;
  divisionName: any;
  effectiveOn_division: any;

  // Division Details Section
  divisionDependAge1Num: any;
  divisionDependAge2Num: any;
  extraBenefits: any;
  effectiveOnDivisionDetails: any;

  // Prorating Section
  prorateTypeKey: any;
  proratingTypeDesc: any;
  proratingEffectiveOn: any;
  proratingExpiredOn: any;

  // Deductible Section
  deductTypeKey;
  plansFamilyDeductAmt;
  plansSingleDeductAmt;
  deductibleTypeDesc: any;
  deductibleEffectiveOn: any;
  deductibleExpiredOn: any;

  HSAMaximumTypeList: any;
  HSAMaximumPeriodTypeList: any;
  expiredOnDivisionDetails: any;
  coKey: any;
  planKey: any;
  divisionKey: any;
  businessType: any;

  // Unit section
  unitDataArray = []

  // Benefits Section  
  benefitsArray = [];

  // Division Top Up Maximum section
  divTopUpMaxDataArray = []

  // Division Maximum section
  divMaxDataArray = []

  // Dental Care section
  dentalCareDataArray = []
  dentalCombineMaxDataArray = []
  dentalCovMaxDataArray = []

  // Vision Care section
  visionCareDataArray = []

  // Health Care section
  healthCareDataArray = []

  // Drug Care section
  drugCareDataArray = []

  // Supplemental Care section
  supplimentCareDataArray = []

  // Wellness Care section
  wellnessCareDataArray = []
  wellnessCombineMaxDataArray = []
  wellnessCovMaxDataArray = []

  MaximumPeriodTypeList = [];
  MaximumTypeList = [];
  CoverageTimeFrameList = [];
  CombineMaximumTypeList = [];
  benefits = [];
  tabName=[]
  tabTitle=[]

  // Is Data checks
  printPlanMode: boolean;
  isDentalData: boolean;
  isDentalCoverageCategoriesData: boolean;
  isWellnessCoverageCategoriesData: boolean;
  isDentalCombineMaxData: boolean;
  isVisionData: boolean;
  isHealthData: boolean;
  isDrugData: boolean;
  isSupplementData: boolean;
  isWellnessCombineMaxData: boolean;
  isWellnessData: boolean;
  isPlanNo: boolean;
  isdivisionNo: boolean;
  isdivisionName: boolean;
  isEffectiveOn: boolean;
  isYearType: boolean;
  isExtraBenefits: boolean;
  isPlansDependAge1Num: boolean;
  isPlansDependAge2Num: boolean;
  isProrateTypeKey: boolean;
  isDeductTypeKey: boolean;
  isPlansFamilyDeductAmt: boolean;
  isPlansSingleDeductAmt: boolean;
  isDivisonMaxData: boolean;
  isDivisonTopUpMaxData: boolean;
  isBenefitsData: boolean;
  isUnitData: boolean; 
  isPlanInfoJson: boolean;
  isSupplementCoverageData:boolean;
  supplementCoverageDataArray: any;
  isDivisionEffectiveOn: boolean;
  isEffectiveOnDivisionDetails: boolean;
  isProratingEffectiveOn: boolean;
  isDeductibleEffectiveOn: boolean;
  isPlanSection: boolean;
  isDivisionSection: boolean;
  isDivisionDetailsSection: boolean;
  isProratingSection: boolean;
  isDeductibleSection: boolean;
  isExpiredOnDivisionDetails: boolean;
  isExpiredOnProratingType: boolean;
  isExpiredOnDeductibleType: boolean;
  selectedDeductibleTypeValue: any;
  triggerVal: boolean = true;
  proratingTypeValue: any;

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private planService:PlanService,
    private route: ActivatedRoute,
  ) {
    this.getDevisionMaxData();
    planService.planModuleData.subscribe((value) =>{
      this.planPrintData = value;
      this.planPrintOpen();
    });
    this.planService.selectedDeductibleTypeVal.subscribe((value) => {
      if(value == "" || value == undefined){
        this.selectedDeductibleTypeValue = "";
      } else {
        this.selectedDeductibleTypeValue = value;
      }
    })

    this.planService.proratingTypeVal.subscribe((value) => {
      this.proratingTypeValue = value;
    })
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      this.coKey = params['companyId'];
      this.planKey = params['planId'];
      this.divisionKey = params['divisonId'];
      this.GetCompanyDetailByCompanyCoKey(this.coKey);
    });
  }

  GetCompanyDetailByCompanyCoKey(coKey) {
    let planDataJson = {
      "coKey": coKey
    }
    var URL = PlanApi.getCompanyDetailByCompanyCoKeyUrl;
    this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {      
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.businessType = data.result.businessTypeDesc;
      }
    });
  }
  
  /** getting Division Max List */
  public DivisionMaxList = [];
  getDevisionMaxData() {
    this.planService.planModuleData.subscribe((value) =>{
      this.benefits = value.benefitsJson[0]; 
      this.DivisionMaxList = value.divisionMaxJson[0];
    });  
  }

  /** getting maximum period type */
  getMaximumPeriodTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getMaxPeriodTypeList).subscribe(data =>{
      if(data.code == 200 && data.status == 'OK'){
        this.MaximumPeriodTypeList = data.result;             
      }
    });
  }
  
  /**
   * Get Supplement Maximum Type List
   */
  getSupplementMaximumTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getHsaMaxTypeList).subscribe(data =>{
      if(data.code == 200 && data.status == 'OK'){
        this.HSAMaximumTypeList = data.result;                 
      }
    })
  } 

  /**
   * Get Maximum Period Type List
   */
  getSupplementMaximumPeriodTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getHsaMaxPeriodTypeList).subscribe(data =>{
      if(data.code == 200 && data.status == 'OK'){
        this.HSAMaximumPeriodTypeList = data.result;                 
      }
    })
  }

  /** getting maximum type */
  getMaximumTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getMaximumTypeList).subscribe(data =>{
      if(data.code == 200 && data.status == 'OK') {
        this.MaximumTypeList = data.result;
      }
    })
  }

  /** getting Combine Maximum Type List */
  getCombineMaximumTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getBenefitDentCovCatList).subscribe(data =>{
      if(data.code == 200 && data.status == 'OK'){
        this.CombineMaximumTypeList = data.result;
      }
    })
  }

  /** getting maximum type */
  getCoverageTimeFrameList() {
    this.hmsDataServiceService.getApi(PlanApi.getCoverageTimeFrameListUrl).subscribe(data =>{
      if(data.code == 200 && data.status == 'OK') {
        this.CoverageTimeFrameList = data.result;
      }
    })
  }

  /** getting data from various tabs to preview */
  planPrintOpen() {
    if(this.planPrintData != undefined && this.planPrintData != "") {
      this.getMaximumPeriodTypeList();
      this.getMaximumTypeList();
      this.getCoverageTimeFrameList();
      this.getCombineMaximumTypeList();
      this.getSupplementMaximumTypeList();
      this.getSupplementMaximumPeriodTypeList();
      this.printPlanMode = true;
      
      if(this.planPrintData.planInfoJson[0] != undefined && this.planPrintData.planInfoJson[0] != "") {
        this.isPlanInfoJson = true;

        /* PLAN INFO SECTION START */
        if(this.planPrintData.planInfoJson[0].plansId != "" || this.planPrintData.planInfoJson[0].effectiveOn != "") {
          this.isPlanSection = true
        }
        else {
          this.isPlanSection = false
        }
        
        if(this.planPrintData.planInfoJson[0].plansId != undefined && this.planPrintData.planInfoJson[0].plansId != "") {
          this.isPlanNo = true;
          this.plansId = this.planPrintData.planInfoJson[0].plansId;
        }
        else {
          this.isPlanNo = false;
        }
        if(this.planPrintData.planInfoJson[0].effectiveOn != undefined && this.planPrintData.planInfoJson[0].effectiveOn != "") {
          this.effectiveOn = this.planPrintData.planInfoJson[0].effectiveOn;
          this.isEffectiveOn = true;
        }
        else {
          this.isEffectiveOn = false;
        }
  
        if(this.planPrintData.planInfoJson[0].yearTypeData != undefined && this.planPrintData.planInfoJson[0].yearTypeData != "") {
          this.yrTypeDesc = this.planPrintData.planInfoJson[0].yearTypeData.yrTypeDesc;
          this.isYearType = true;
        }
        else {
          this.isYearType = false;
        }
        /* PLAN INFO SECTION END */

        /* DIVISION SECTION START */
        if(this.planPrintData.planInfoJson[0].divisionId != "" || this.planPrintData.planInfoJson[0].divisionName != "" || this.planPrintData.planInfoJson[0].effectiveOn_division != null) {
          this.isDivisionSection = true
        }
        else {
          this.isDivisionSection = false
        }
        if(this.planPrintData.planInfoJson[0].divisionId != undefined && this.planPrintData.planInfoJson[0].divisionId != "") {
          this.divisionId = this.planPrintData.planInfoJson[0].divisionId;
          this.isdivisionNo = true;
        }
        else {
          this.isdivisionNo = false;
        }
        
        if(this.planPrintData.planInfoJson[0].divisionName != undefined && this.planPrintData.planInfoJson[0].divisionName != "") {
          this.divisionName = this.planPrintData.planInfoJson[0].divisionName;
          this.isdivisionName = true;
        }
        else {
          this.isdivisionName = false;
        }

        if(this.planPrintData.planInfoJson[0].effectiveOn_division != undefined && this.planPrintData.planInfoJson[0].effectiveOn_division != "") {
          this.effectiveOn_division = this.planPrintData.planInfoJson[0].effectiveOn_division;
          this.isDivisionEffectiveOn = true;
        }
        else {
          this.isDivisionEffectiveOn = false;
        }
        /* DIVISION SECTION END */

        /* DIVISION DETAILS SECTION START */
        if(this.planPrintData.planInfoJson[0].divisionDependAge1Num != "" || this.planPrintData.planInfoJson[0].divisionDependAge2Num != "" || this.planPrintData.planInfoJson[0].effectiveOn_divisionDetails != null) {
          this.isDivisionDetailsSection = true
        }
        else {
          this.isDivisionDetailsSection = false
        }
        
        if(this.planPrintData.planInfoJson[0].divisionDependAge1Num != undefined && this.planPrintData.planInfoJson[0].divisionDependAge1Num != "") {
          this.divisionDependAge1Num = this.planPrintData.planInfoJson[0].divisionDependAge1Num;
          this.isPlansDependAge1Num = true;
        }
        else {
          this.isPlansDependAge1Num = false;
        }
        
        if(this.planPrintData.planInfoJson[0].divisionDependAge2Num != undefined && this.planPrintData.planInfoJson[0].divisionDependAge2Num != "") {
          this.divisionDependAge2Num = this.planPrintData.planInfoJson[0].divisionDependAge2Num;
          this.isPlansDependAge2Num = true;
        }
        else {
          this.isPlansDependAge2Num = false;
        } 

        if(this.planPrintData.planInfoJson[0].plansExtraBenefitInd != undefined) {
          if(this.planPrintData.planInfoJson[0].plansExtraBenefitInd != "") {
            if(this.planPrintData.planInfoJson[0].plansExtraBenefitInd == "T") {
              this.extraBenefits = "Yes"
              this.isExtraBenefits = true
            }
            else {
              this.extraBenefits = "No"
              this.isExtraBenefits = false
            }
          }
          else {
            this.extraBenefits = "No"
            this.isExtraBenefits = false
          }
        }
        else {
          this.isExtraBenefits = false;
        }

        if(this.planPrintData.planInfoJson[0].effectiveOn_divisionDetails != undefined && this.planPrintData.planInfoJson[0].effectiveOn_divisionDetails != "") {
          this.effectiveOnDivisionDetails = this.planPrintData.planInfoJson[0].effectiveOn_divisionDetails;
          this.isEffectiveOnDivisionDetails = true;
        }
        else {
          this.isEffectiveOnDivisionDetails = false;
        }

        if(this.planPrintData.planInfoJson[0].expiredOn_divisionDetails != undefined && this.planPrintData.planInfoJson[0].expiredOn_divisionDetails != "") {
          this.expiredOnDivisionDetails = this.planPrintData.planInfoJson[0].expiredOn_divisionDetails;
          this.isExpiredOnDivisionDetails = true;
        }
        else {
          this.isExpiredOnDivisionDetails = false;
        }
        /* DIVISION DETAILS SECTION END */

        /* PRORATING SECTION START */
       
        // Condition for prorating section show/hidden in preview
        if((this.planPrintData.planInfoJson[0].prorateTypeKey && this.planPrintData.planInfoJson[0].prorateTypeKey != null) || this.planPrintData.planInfoJson[0].proratingEffectiveOn != null) {
          this.isProratingSection = true
        }
        else {
          this.isProratingSection = false
        }
        
        if(this.planPrintData.planInfoJson[0].proratingTypeArray != undefined && this.planPrintData.planInfoJson[0].proratingTypeArray != "" && this.proratingTypeValue != "") {
          this.proratingTypeDesc = this.planPrintData.planInfoJson[0].proratingTypeArray.prorateTypeDesc;
          this.isProrateTypeKey = true;
        }
        else {
          this.isProrateTypeKey = false;
        }

        if(this.planPrintData.planInfoJson[0].proratingEffectiveOn != undefined && this.planPrintData.planInfoJson[0].proratingEffectiveOn != "") {
          this.proratingEffectiveOn = this.planPrintData.planInfoJson[0].proratingEffectiveOn;
          this.isProratingEffectiveOn = true;
        }
        else {
          this.isProratingEffectiveOn = false;
        }

        if(this.planPrintData.planInfoJson[0].proratingExpiredOn != undefined && this.planPrintData.planInfoJson[0].proratingExpiredOn != "") {
          this.proratingExpiredOn = this.planPrintData.planInfoJson[0].proratingExpiredOn;
          this.isExpiredOnProratingType = true;
        }
        else {
          this.isExpiredOnProratingType = false;
        }
        /* PRORATING SECTION END */

        /* DEDUCTIBLE SECTION START */
        if(this.planPrintData.planInfoJson[0].divisionFamilyDeductAmt == undefined){
          this.planPrintData.planInfoJson[0].divisionFamilyDeductAmt = "";
        }
        if(this.planPrintData.planInfoJson[0].divisionSingleDeductAmt == undefined){
          this.planPrintData.planInfoJson[0].divisionSingleDeductAmt = "";
        }
        if(this.planPrintData.planInfoJson[0].deductTypeKey != null || this.planPrintData.planInfoJson[0].divisionFamilyDeductAmt != "" || this.planPrintData.planInfoJson[0].divisionSingleDeductAmt != "" || this.planPrintData.planInfoJson[0].deductibleEffectiveOn != null) {
          this.isDeductibleSection = true
        }
        else {
          this.isDeductibleSection = false
        }
        // set DEDUCTIBLE SECTION in preview
        if(this.planPrintData.planInfoJson[0].deductibleTypeArray != undefined && this.planPrintData.planInfoJson[0].deductibleTypeArray != "" && this.triggerVal) {
          this.selectedDeductibleTypeValue = this.planPrintData.planInfoJson[0].deductibleTypeArray.deductTypeKey;
          this.triggerVal = false;
        }
        if(this.planPrintData.planInfoJson[0].deductibleTypeArray != undefined && this.planPrintData.planInfoJson[0].deductibleTypeArray != "" && this.selectedDeductibleTypeValue != "" ) {
          this.deductibleTypeDesc = this.planPrintData.planInfoJson[0].deductibleTypeArray.deductTypeDesc;
          this.isDeductTypeKey = true;
        }
        else {
          this.isDeductTypeKey = false;
        }
        
        if(this.planPrintData.planInfoJson[0].divisionFamilyDeductAmt != undefined && this.planPrintData.planInfoJson[0].divisionFamilyDeductAmt != "") {
          this.plansFamilyDeductAmt = this.planPrintData.planInfoJson[0].divisionFamilyDeductAmt;
          this.isPlansFamilyDeductAmt = true;
        }
        else {
          this.isPlansFamilyDeductAmt = false;
        }
        
        if(this.planPrintData.planInfoJson[0].divisionSingleDeductAmt != undefined && this.planPrintData.planInfoJson[0].divisionSingleDeductAmt != "") {
          this.plansSingleDeductAmt = this.planPrintData.planInfoJson[0].divisionSingleDeductAmt;
          this.isPlansSingleDeductAmt = true;
        }
        else {
          this.isPlansSingleDeductAmt = false;
        }

        if(this.planPrintData.planInfoJson[0].deductibleEffectiveOn != undefined && this.planPrintData.planInfoJson[0].deductibleEffectiveOn != "") {
          this.deductibleEffectiveOn = this.planPrintData.planInfoJson[0].deductibleEffectiveOn;
          this.isDeductibleEffectiveOn = true;
        }
        else {
          this.isDeductibleEffectiveOn = false;
        }

        if(this.planPrintData.planInfoJson[0].deductibleExpiredOn != undefined && this.planPrintData.planInfoJson[0].deductibleExpiredOn != "") {
          this.deductibleExpiredOn = this.planPrintData.planInfoJson[0].deductibleExpiredOn;
          this.isExpiredOnDeductibleType = true;
        }
        else {
          this.isExpiredOnDeductibleType = false;
        }
        /* DEDUCTIBLE SECTION END */
      }
  
      // Getting Unit Data
      if(this.planPrintData.planInfoJson[0].unitData != undefined && this.planPrintData.planInfoJson[0].unitData != "") {
        this.unitDataArray = this.planPrintData.planInfoJson[0].unitData
        this.isUnitData = true;
      }
      else {
        this.isUnitData = false;
      }
  
      // Getting Division Maximum Data
      if(this.planPrintData.divisionMaxJson[0] != undefined && this.planPrintData.divisionMaxJson[0] != "") {
        if(this.planPrintData.divisionMaxJson[0][0] == undefined) {
          this.isDivisonMaxData = false;
        }
        else {
          this.isDivisonMaxData = true;
          this.divMaxDataArray = this.planPrintData.divisionMaxJson[0];
        }
      }
      else {
        this.isDivisonMaxData = false;
      }

      if(this.businessType == Constants.albertaBusnsTypeKey) {
      // Getting Dental Data
      if(this.planPrintData.benefitsJson[0].dentalSlug != undefined) {
        if(this.planPrintData.benefitsJson[0].dentalSlug.combineMaximum != undefined && this.planPrintData.benefitsJson[0].dentalSlug.combineMaximum.length != 0) {
          this.isDentalCombineMaxData = true;
          this.dentalCombineMaxDataArray = this.planPrintData.benefitsJson[0].dentalSlug.combineMaximum;
        }
        else {
          this.isDentalCombineMaxData = false;
        }
        if(this.planPrintData.benefitsJson[0].dentalSlug.coverageCategory != undefined && this.planPrintData.benefitsJson[0].dentalSlug.coverageCategory.length != 0) {
          this.isDentalData = true;
          this.isDentalCoverageCategoriesData = true;
          this.dentalCareDataArray = this.planPrintData.benefitsJson[0].dentalSlug.coverageCategory;
        }
        else {
          this.isDentalData = false;
          this.isDentalCoverageCategoriesData = false;
        }
      }
      }
      else {
      // Getting Dental Data
      if(this.planPrintData.benefitsJson[0].dentalSlug != undefined) {
        if(this.planPrintData.benefitsJson[0].dentalSlug.combineMaximum != undefined && this.planPrintData.benefitsJson[0].dentalSlug.combineMaximum.length != 0) {
          this.isDentalCombineMaxData = true;
          this.dentalCombineMaxDataArray = this.planPrintData.benefitsJson[0].dentalSlug.combineMaximum;
        }
        else {
          this.isDentalCombineMaxData = false;
        }
        if(this.planPrintData.benefitsJson[0].dentalSlug.coverageCategory != undefined && this.planPrintData.benefitsJson[0].dentalSlug.coverageCategory.length != 0) {
          this.isDentalData = true;
          this.isDentalCoverageCategoriesData = true;
          this.dentalCareDataArray = this.planPrintData.benefitsJson[0].dentalSlug.coverageCategory;
        }
        else {
          this.isDentalData = false;
          this.isDentalCoverageCategoriesData = false;
        }
      }
      else {
        this.isDentalData = false;
      }

      // Getting Vision data
      if(this.planPrintData.benefitsJson[0].visionSlug != undefined && this.planPrintData.benefitsJson[0].visionSlug.coverageCategory != "") {
        this.visionCareDataArray = this.planPrintData.benefitsJson[0].visionSlug.coverageCategory;
        this.isVisionData = true;
      }
      else {
        this.isVisionData = false;
      }

      // Getting Health Data
      if(this.planPrintData.benefitsJson[0].healthSlug != undefined && this.planPrintData.benefitsJson[0].healthSlug.coverageCategory != "") {
        this.healthCareDataArray = this.planPrintData.benefitsJson[0].healthSlug.coverageCategory;
        this.isHealthData = true;
      }
      else {
        this.isHealthData = false;
      }

      // Getting Drug Data
      if(this.planPrintData.benefitsJson[0].drugSlug != undefined && this.planPrintData.benefitsJson[0].drugSlug.coverageCategory != "") {
        this.drugCareDataArray = this.planPrintData.benefitsJson[0].drugSlug.coverageCategory;
        this.isDrugData = true;
      }
      else {
        this.isDrugData = false;
      }

      // Getting Supplement Data
      if(this.planPrintData.benefitsJson[0].supplementSlug != undefined && this.planPrintData.benefitsJson[0].supplementSlug.coverageCategory != "") {
        this.supplimentCareDataArray = this.planPrintData.benefitsJson[0].supplementSlug.coverageCategory;
        this.isSupplementData = true;

        if(this.planPrintData.benefitsJson[0].supplementSlug.combineMaximum != undefined && this.planPrintData.benefitsJson[0].supplementSlug.combineMaximum != "") {
          this.supplementCoverageDataArray = this.planPrintData.benefitsJson[0].supplementSlug.combineMaximum;
          this.isSupplementCoverageData = true;
        }
        else {
          this.isSupplementCoverageData = false;
        }
      }
      else {
        this.isSupplementData = false;
        this.isSupplementCoverageData = false;
      }

      
      // Getting Wellness Data
      if(this.planPrintData.benefitsJson[0].wellnessSlug != undefined) {
        if(this.planPrintData.benefitsJson[0].wellnessSlug.combineMaximum != undefined && this.planPrintData.benefitsJson[0].wellnessSlug.combineMaximum.length != 0) {
          this.isWellnessCombineMaxData = true;
          this.wellnessCombineMaxDataArray = this.planPrintData.benefitsJson[0].wellnessSlug.combineMaximum;
        }
        else {
          this.isWellnessCombineMaxData = false;
        }
        if(this.planPrintData.benefitsJson[0].wellnessSlug.coverageCategory != undefined && this.planPrintData.benefitsJson[0].wellnessSlug.coverageCategory.length != 0) {
          this.isWellnessData = true;
          this.isWellnessCoverageCategoriesData = true;
          this.wellnessCareDataArray = this.planPrintData.benefitsJson[0].wellnessSlug.coverageCategory;
        }
        else {
          this.isWellnessData = false;
          this.isWellnessCoverageCategoriesData = false;
        }
      }
      else {
        this.isWellnessData = false;
      }
    }
    }
  }
}