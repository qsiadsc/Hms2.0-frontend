import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { PlanApi } from '../plan-api';
import { PlanService } from '../plan.service';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { ToastrService } from 'ngx-toastr'; 
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';

@Component({
  selector: 'app-division-max',
  templateUrl: './division-max.component.html',
  styleUrls: ['./division-max.component.css'],
  providers:[HmsDataServiceService, ExDialog,ToastrService, ChangeDateFormatService] 
})
export class DivisionMaxComponent implements OnInit {
  showWellnessPert: boolean = false;
  divMaxKey = null;

  @ViewChild("focusAddDivisionMaxEl") trgFocusAddDivisionMaxEl: ElementRef;
  @ViewChild("focusEditDivisionMaxEl") trgFocusEditEditDivisionMaxEl: ElementRef;
  
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePlaceholder = CommonDatePickerOptions.myDatePlaceholder;

  planEditMode: boolean = false;
  businessType: string;
  planDivisionKey;
  public planInfo = [];
  public benefits:any={};
  /** Devision Inline Data table  */
  public DivisionMaxAddMode = false; /** We will set its value true at the time of Adding new record. */
  public DivisionMaxEditMode = false; /** We will set its value true at the time of edit record. */
  public selectedDivisionMax = {}; /** For selected record object */
  dateNameArray = {};
  public DivisionMaxList = []; 
  public MaximumTypeList = [];
  public MaximumPeriodTypeList = []; 
    
  /** For New Row */
  new_maximum_amount:FormControl;
  new_maximum_type:FormControl;
  new_maximum_period_type:FormControl;
  new_dental:FormControl;
  new_vision:FormControl;
  new_health:FormControl;
  new_drug:FormControl;
  new_supplement:FormControl;
  new_wellness:FormControl;
  new_wellness_percentage:FormControl;
  new_carry_forward_years:FormControl;
  new_effective_date:FormControl;
  new_expiry_date:FormControl;

  /** For Update Row */
  old_maximum_amount:FormControl;
  old_maximum_type:FormControl;
  old_maximum_period_type:FormControl;
  old_dental:FormControl;
  old_vision:FormControl;
  old_health:FormControl;
  old_drug:FormControl;
  old_supplement:FormControl;
  old_wellness:FormControl;
  old_wellness_percentage:FormControl;
  old_carry_forward_years:FormControl;
  old_effective_date:FormControl;
  old_expiry_date:FormControl;
  /** Devision Inline Data table  */

  /** To Show date related errors */
  NewDivisionMaxEffectiveDateNotValid;
  NewDivisionMaxExpiryDateNotValid;
  OldDivisionMaxEffectiveDateNotValid;
  OldDivisionMaxExpiryDateNotValid;
  /** ------------------- */

  dataToggle: string
  
  public isOpen: boolean = false;
  expired: boolean;
  getError: boolean = false;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  divisionMaxHistoryDataTarget: string
  divisionMaxHistoryId: string
  divisionMaxHistoryClass: string
  divisionMaxHistoryTitle: string

  public proratingTypeData: CompleterData;
  @Output() divisionMaxData = new EventEmitter();
  divMaxMaximumTypeData: any;
  selectedDivMaximumTypeValue: string = null;
  selectedDivMaximumTypeDesc: string = null;
  selectedDivMaximumPeriodTypeValue: string = null;
  divMaxMaximumPeriodTypeData: any;
  divMaxmaximumTypeKey: any;
  divMaxmaximumTypeDesc: any;
  selectedDivMaximumPeriodTypeDesc: any;
  divMaxMaximumPeriodTypeKey: any;
  divMaxMaximumPeriodTypeDesc: any;
  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private planService:PlanService,
    private exDialog: ExDialog,
    private ToastrService: ToastrService,
    private changeDateFormatService:ChangeDateFormatService,
    private route: ActivatedRoute,
    private dataTableService: DatatableService,
    private completerService: CompleterService,
    ) {
    this.route.queryParams.subscribe((params: Params) => {
      this.companyPlanKey = params.planId;
      this.companyDivisionKey = params.divisionId;
      this.companyKey = params.companyId;
    });
    this.getDevisionMaxData();
    /** Devision Inline Data table new row  */
    this.new_maximum_amount = new FormControl('', [Validators.required, CustomValidators.numberWithDot]);
    this.new_maximum_type = new FormControl(null,[Validators.required]);
    this.new_maximum_period_type = new FormControl(null,[Validators.required]);
    this.new_dental = new FormControl('');
    this.new_vision = new FormControl('');
    this.new_health = new FormControl('');
    this.new_drug = new FormControl('');
    this.new_supplement = new FormControl('');
    this.new_wellness = new FormControl('');
    this.new_wellness_percentage = new FormControl('', [CustomValidators.percValue]);
    this.new_carry_forward_years = new FormControl('', [CustomValidators.CarryForwardYears]);
    this.new_effective_date = new FormControl('', [Validators.required]);
    this.new_expiry_date = new FormControl('');

    /** Devision Inline Data table update row  */
    this.old_maximum_amount = new FormControl('', [Validators.required, CustomValidators.numberWithDot]);
    this.old_maximum_type = new FormControl(null,[Validators.required]);
    this.old_maximum_period_type = new FormControl(null,[Validators.required]);
    this.old_dental = new FormControl('');
    this.old_vision = new FormControl('');
    this.old_health = new FormControl('');
    this.old_drug = new FormControl('');
    this.old_supplement = new FormControl('');
    this.old_wellness = new FormControl('');
    this.old_wellness_percentage = new FormControl('', [CustomValidators.percValue]);
    this.old_carry_forward_years = new FormControl('', [CustomValidators.CarryForwardYears]);
    this.old_effective_date = new FormControl('', [Validators.required]);
    this.old_expiry_date = new FormControl('');
    /** Devision Inline Data table  */
   }

  isCarryForwardHistoryExist = false;
  isProratingTypeHistoryExist = true;
  isDivisionMaximumHistoryExist = false;
  isDivisionDetailsHistoryExist = true;
  companyPlanKey;
  companyDivisionKey;
  companyKey;

  carry_forward_columns = [
    { title: "Carry Forward Year", data: 'prorateTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' }
  ]

  prorating_type_columns = [
    { title: "Prorating Type", data: 'prorateTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' }
  ]

  division_details_columns = [
    { title: "Division Details", data: 'prorateTypeDesc' },
    { title: "Effective Date", data: 'effectiveOn' }
  ]

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      if (params['planId'] && params['planType'] != "copyDivision") {
        this.planEditMode = true;
        this.planDivisionKey = params.divisionId;
      }else if(params['planId'] && params['planType'] == "copyDivision"){
        this.planEditMode = false;
      }
    });

    this.dataToggle = "modal"
    this.divisionMaxHistoryDataTarget = "#divisionMaximumHistoryDivMax"
    this.divisionMaxHistoryId = "division_maximum_history"
    this.divisionMaxHistoryClass = "history-ico"
    this.divisionMaxHistoryTitle = "Division Max History"
    this.getMaximumTypeList();
    this.getMaximumPeriodTypeList();
    // to resolved calendar Issue(HMS point no - 594)
    $(document).on('click','.btnpicker', function () {
      $('#NewDivisionMaxEffectiveOn .mydp .selector').addClass('bottom-calender')
    })
    $(document).on('click','.btnpicker', function () {
      $('#NewDivisionMaxExpiryDate .mydp .selector').addClass('bottom-calender')
    })
    // end
  }

  /** getting maximum type */
  getMaximumTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getMaximumTypeList).subscribe(data =>{
      if(data.code == 200 && data.status == 'OK') {
        this.MaximumTypeList = data.result;
          this.divMaxMaximumTypeData = this.completerService.local(
            this.MaximumTypeList,
            "maxTypeDesc",
            "maxTypeDesc"
          );
      }
    })
  }

  /** getting maximum period type */
  getMaximumPeriodTypeList() {
    this.hmsDataServiceService.getApi(PlanApi.getMaxPeriodTypeList).subscribe(data =>{
      if(data.code == 200 && data.status == 'OK'){
        this.MaximumPeriodTypeList = data.result;
          this.divMaxMaximumPeriodTypeData = this.completerService.local(
            this.MaximumPeriodTypeList,
            "maxPeriodTypeCd",
            "maxPeriodTypeCd"
          );
      }
    });
  }

  onDivMaxTypeSelected(selected: CompleterItem) {
    if(selected) {
      this.selectedDivMaximumTypeValue = selected.originalObject.maxTypeKey;
      this.selectedDivMaximumTypeDesc = selected.originalObject.maxTypeDesc;
    }
    else {
      this.selectedDivMaximumTypeValue = '';
      this.selectedDivMaximumTypeDesc = '';
    }
  }

  onDivMaxPeriodTypeSelected(selected: CompleterItem) {
    if(selected) {
      this.selectedDivMaximumPeriodTypeValue = selected.originalObject.maxPeriodTypeKey;
      this.selectedDivMaximumPeriodTypeDesc = selected.originalObject.maxPeriodTypeCd;
    }
    else {
      this.selectedDivMaximumPeriodTypeValue = '';
    }
  }

  GetCompanyDetailByCompanyCoKey(coKey) {
    let promise = new Promise((resolve, reject) => {
      let planDataJson = {
        "coKey": coKey
      }
      var URL = PlanApi.getCompanyDetailByCompanyCoKeyUrl;
      this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {      
        if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.businessType = data.result.businessTypeKey;
          resolve();
        }
      });      
    });   
    return promise;  
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
    }else {
      this.dataTableService.jqueryDataTableReload(carryForwardTableId, carry_forward_url, reqParamProHist)
    }
  }
  
  /**
   * get prorating history list
   */
  getProratingTypeHistory() {
    var prorating_type_url = PlanApi.getProratingTypeHistory;
    var ProratingTypeTableId = "prorating_type_div_max";
    var reqParamProHist = [{ 'key': 'plansKey', 'value': this.companyPlanKey }]
    if (!$.fn.dataTable.isDataTable('#prorating_type_div_max')) {
    this.dataTableService.jqueryDataTable(ProratingTypeTableId, prorating_type_url, 'full_numbers', this.prorating_type_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined)
    }else {
      this.dataTableService.jqueryDataTableReload(ProratingTypeTableId, prorating_type_url, reqParamProHist)
    }
  }
  
  /**
   * Get Division Max History List
   */
  getDivisionMaximumHistory() {
    this.GetCompanyDetailByCompanyCoKey(this.companyKey).then(res=>{
    let division_maximum_columns = [
      { title: "Maximum Amount", data: 'divMaxAmt' },
      { title: "Maximum Type", data: 'maxTypeDesc' },
      { title: "Maximum Period Type", data: 'maxPeriodTypeDesc' },
      { title: "Dental", data: 'dentalInd' }, // changes required     
      { title: "Carry Forward Years", data: 'carryFrwdYrs' },
      { title: "Effective Date", data: 'effectiveOn' },
      { title: "Expiry Date", data: 'expiredOn' } // changes required
      
    ]
    
    if(this.businessType == Constants.quikcardBusnsTypeKey){
      division_maximum_columns.splice(4,0,
        { title: "Vision", data: 'visionInd' },
        { title: "Health", data: 'healthInd' },
        { title: "Drug", data: 'drugInd' },
        { title: "Wellness", data: 'wellnessInd' }
      )
    }

    var division_maximum_url = PlanApi.getDivisionMaximumHistory;
    var divisionMaximumTableId = "division_max_history";
    var reqParamDivMaxHist = [{ 'key': 'divisionKey', 'value': this.planDivisionKey }]
      if (!$.fn.dataTable.isDataTable('#division_max_history')) {
        var dateCols = ['effectiveOn', 'expiredOn']
        this.dataTableService.jqueryDataTable(divisionMaximumTableId, division_maximum_url, 'full_numbers', division_maximum_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamDivMaxHist, '', undefined,dateCols)
      } else {
          this.dataTableService.jqueryDataTableReload(divisionMaximumTableId, division_maximum_url, reqParamDivMaxHist)
        }
    });
  }
  
  /**
   * get division details history
   */
  getDivisionDetailsHistory() {
    var division_details_url = PlanApi.getDivisionDetailsHistory;
    var DivisionDetailsTableId = "division_details";
    var reqParamProHist = [{ 'key': 'plansKey', 'value': this.companyPlanKey }]
    if (!$.fn.dataTable.isDataTable('#division_details')) {
    this.dataTableService.jqueryDataTable(DivisionDetailsTableId, division_details_url, 'full_numbers', this.division_details_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined)
    }else {
      this.dataTableService.jqueryDataTableReload(DivisionDetailsTableId, division_details_url, reqParamProHist)
    }
  }

  /**
   * Get Devision Max List
   */
  getDevisionMaxData() {
    this.planService.planModuleData.subscribe((value) =>{
      this.planInfo = value.planInfoJson[0];
      this.benefits = value.benefitsJson[0]; 
      this.DivisionMaxList = value.divisionMaxJson[0];
      if(value.planInfoJson[0].divisionMaxHistInd == "Y") {
        this.isDivisionMaximumHistoryExist = true
      }
      else {
        this.isDivisionMaximumHistoryExist = false
      }
    });  
  }

  /**Devision Inline Data table */

  /** enable New Devision */
  enableAddDivisionMax() {
    if (Object.keys(this.benefits).length == 0) {
      this.ToastrService.error("Please Select At Least One Benefits From Benefits Tab.");
      return;
    }
    /** initialize new Devision object */
    this.showWellnessPert = false;
    this.selectedDivisionMax = {};
    this.DivisionMaxEditMode = false;
    this.DivisionMaxAddMode = true;
    this.new_wellness.patchValue('');
    this.new_carry_forward_years.patchValue(0);
    this.new_carry_forward_years.enable();
    this.setElementFocus('trgFocusAddDivisionMaxEl');
  }

  selectedCategoriesForDivisionMax(){
    if(this.new_wellness.value == true && (this.new_dental.value == true || this.new_vision.value == true || this.new_health.value == true || this.new_drug.value == true )){
      this.showWellnessPert = true;
      if (this.planEditMode == true) {
        this.new_wellness_percentage.setValidators([CustomValidators.percValue]);
        this.new_wellness_percentage.updateValueAndValidity();
        return;
      }
    }
    else{
      this.showWellnessPert = false;
      this.new_wellness_percentage.clearValidators();
      this.new_wellness_percentage.updateValueAndValidity();
    }
    if(!this.new_wellness.value){
      this.new_wellness_percentage.patchValue("")
    }
  }

  selectedCategoriesForDivisionMaxEditMode(){
    if(this.old_wellness.value == true && (this.old_dental.value == true || this.old_vision.value == true || this.old_health.value == true || this.old_drug.value == true )){
      this.showWellnessPert = true;
      if (this.planEditMode == true) {
        this.old_wellness_percentage.patchValue("");
        this.old_wellness_percentage.setValidators([CustomValidators.percValue]);
        this.old_wellness_percentage.updateValueAndValidity();
        return;
      }
    }
    else{
      this.showWellnessPert = false;
      this.old_wellness_percentage.clearValidators();
      this.old_wellness_percentage.updateValueAndValidity();
    }
  }

  /** Add new Devision from Devision list */
  addNewDivisionMax() {
    // Task 559 Below condition added to show validation if any discipline selected along with wellness and percentage is not filled when its add mode in division maximum of plan section
    if (this.new_wellness.value && (this.new_dental.value == true || this.new_vision.value == true || this.new_health.value == true || this.new_drug.value == true)) {
      this.new_wellness_percentage.setValidators([CustomValidators.percValue]);
      this.new_wellness_percentage.updateValueAndValidity();
    }
    else{
      this.new_wellness_percentage.clearValidators();
      this.new_wellness_percentage.updateValueAndValidity();
    }
     // Check for plan edit mode
    if (this.planEditMode == true) {
      this.new_maximum_amount.markAsTouched();
      this.new_maximum_type.markAsTouched();
      this.new_maximum_period_type.markAsTouched();
      this.new_carry_forward_years.markAsTouched();
      this.new_effective_date.markAsTouched();
      this.new_expiry_date.markAsTouched();
      this.new_wellness_percentage.markAsTouched();

      if (this.new_maximum_amount.invalid 
      || this.new_maximum_type.invalid 
      || this.new_maximum_period_type.invalid 
      || this.new_carry_forward_years.invalid 
      || this.new_effective_date.invalid 
      || this.new_expiry_date.invalid
      || this.new_wellness_percentage.invalid) {
        if (this.showWellnessPert == true){
          this.new_wellness_percentage.invalid
        }
        return;
      }
    }else {
      this.new_maximum_amount.markAsTouched();
      this.new_maximum_type.markAsTouched();
      this.new_maximum_period_type.markAsTouched();
      this.new_carry_forward_years.markAsTouched();
      this.new_wellness_percentage.markAsTouched();

      if (this.new_maximum_amount.invalid 
        || this.new_maximum_type.invalid 
        || this.new_maximum_period_type.invalid 
        || this.new_carry_forward_years.invalid
        || this.new_wellness_percentage.invalid) {
          if (this.showWellnessPert == true){
            this.new_wellness_percentage.invalid
          }
        return;
      }
    }

    // Check for plan edit mode
    if (this.planEditMode == true) {
      this.new_effective_date.markAsTouched();
      this.new_expiry_date.markAsTouched();
      this.new_wellness_percentage.markAsTouched();

      if (this.new_effective_date.invalid || this.new_expiry_date.invalid) {
        return;
      }
    }
    var rowData = {
      divMaxAmt: this.new_maximum_amount.value,
      divMaxDesc: "NA", 
      maxTypeKey: this.selectedDivMaximumTypeValue,
      maxTypeDesc: this.selectedDivMaximumTypeDesc,
      maxPeriodTypeKey: this.selectedDivMaximumPeriodTypeValue,
      maxPeriodTypeDesc: this.selectedDivMaximumPeriodTypeDesc,
      dentalInd: this.new_dental.value ? "T" : "F",
      visionInd: this.new_vision.value ? "T" : "F",
      healthInd: this.new_health.value ? "T" : "F",
      drugInd: this.new_drug.value ? "T" : "F",
      // supplementInd: this.new_supplement.value ? "T" : "F",
      wellnessInd: this.new_wellness.value ? "T" : "F",
      wellnessPercentage: this.new_wellness_percentage.value,
      carryFrwdYrs: this.new_carry_forward_years.value
    }

    // Check for plan edit mode
    if (this.planEditMode == true) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.new_effective_date.value)
      if (this.new_expiry_date.value != null && this.new_expiry_date.value != undefined && this.new_expiry_date.value != "" && this.new_expiry_date.value !='00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.new_expiry_date.value)
      } else {
        rowData['expiredOn'] = "";
      }
    }

    this.DivisionMaxList.unshift(rowData);
    this.resetNewDivisionMaxRow();
    
  }

  resetNewDivisionMaxRow() {
    this.DivisionMaxAddMode = false;

    this.new_maximum_amount.reset();
    this.new_maximum_type.reset();
    this.new_maximum_period_type.reset();
    this.new_carry_forward_years.reset();
    this.new_dental.reset();
    this.new_vision.reset();
    this.new_health.reset();
    this.new_drug.reset();
    // this.new_supplement.reset();
    this.new_wellness_percentage.reset();

    // Check for plan edit mode
    if (this.planEditMode == true) {
      this.dateNameArray['NewDivisionMaxEffectiveDate'] = null
      this.dateNameArray['NewDivisionMaxExpiryDate'] = null;
      this.new_effective_date.reset();
      this.new_expiry_date.reset();
    }
  }

  /** Edit Devision */
  enableEditDivisionMax(rowData, rowIndex): void {
    if(rowData.wellnessInd=="T"){
      this.showWellnessPert=true;
    }else{
      this.showWellnessPert=false;
      this.old_wellness_percentage.patchValue("")
    }
    this.selectedDivMaximumTypeValue = null;
    this.selectedDivMaximumTypeDesc = null;
    this.selectedDivMaximumPeriodTypeValue = null;
    this.selectedDivMaximumPeriodTypeDesc = null;
    this.divMaxKey = rowData.divMaxKey;
    this.divMaxmaximumTypeKey = rowData.maxTypeKey;
    this.divMaxmaximumTypeDesc = rowData.maxTypeDesc;
    this.divMaxMaximumPeriodTypeKey = rowData.maxPeriodTypeKey;
    this.divMaxMaximumPeriodTypeDesc = rowData.maxPeriodTypeDesc;
    this.old_maximum_type.patchValue(rowData.maxTypeDesc);
    this.old_wellness_percentage.patchValue(rowData.wellnessPercentage);
    this.old_maximum_period_type.patchValue(rowData.maxPeriodTypeDesc);
    if (Object.keys(this.benefits).length == 0) {
      this.ToastrService.error("Please Select At Least One Benefits From Benefits Tab.");
      return;
    }
    this.resetNewDivisionMaxRow();

    this.DivisionMaxEditMode = true;

    let copy = Object.assign({}, rowData)

    this.selectedDivisionMax = copy;
    this.selectedDivisionMax['rowIndex'] = rowIndex;
    this.selectedDivisionMax['dentalInd'] = this.selectedDivisionMax['dentalInd'] == 'T' ? true : "";
    this.selectedDivisionMax['visionInd'] = this.selectedDivisionMax['visionInd'] == 'T' ? true : "";
    this.selectedDivisionMax['healthInd'] = this.selectedDivisionMax['healthInd'] == 'T' ? true : "";
    this.selectedDivisionMax['drugInd'] = this.selectedDivisionMax['drugInd'] == 'T' ? true : "";
    this.selectedDivisionMax['wellnessInd'] = this.selectedDivisionMax['wellnessInd'] == 'T' ? true : "";
    if (this.selectedDivisionMax['maxPeriodTypeKey'] == 91) {
      this.old_carry_forward_years.patchValue(null);
      this.old_carry_forward_years.disable();
    }

    // Check for plan edit mode
    if (this.planEditMode == true) {
      this.selectedDivisionMax['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);  
      if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
        this.selectedDivisionMax['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
      }
    }

    this.setElementFocus('trgFocusEditEditDivisionMaxEl');
  };

  oldWellnessPercentageValid(value){
    if(value > 100){
      this.getError = true;
    }
    else{
      this.getError = false;
    }
  }

  newWellnessPercentageValid(value){
    if(value > 100){
      this.getError = true;
    }
    else{
      this.getError = false;
    }
  }

  /** Update Devision */
  updateDivisionMax(index) {
    // Check for plan edit mode
    if (this.planEditMode == true) {
      this.old_maximum_amount.markAsTouched();
      this.old_maximum_type.markAsTouched();
      this.old_maximum_period_type.markAsTouched();
      this.old_carry_forward_years.markAsTouched();
      this.old_effective_date.markAsTouched();
      this.old_expiry_date.markAsTouched();
      this.old_wellness_percentage.markAsTouched();

      if (this.old_maximum_amount.invalid 
      || this.old_maximum_type.invalid 
      || this.old_maximum_period_type.invalid 
      || this.old_carry_forward_years.invalid
      ||this.old_effective_date.invalid 
      || this.old_expiry_date.invalid
      || this.old_wellness_percentage.invalid) {
        if (this.showWellnessPert == true){
          this.old_wellness_percentage.invalid
        } 
        return;
      }
    }else{
      this.old_maximum_amount.markAsTouched();
      this.old_maximum_type.markAsTouched();
      this.old_maximum_period_type.markAsTouched();
      this.old_carry_forward_years.markAsTouched();
      this.old_wellness_percentage.markAsTouched();

      if (this.old_maximum_amount.invalid 
        || this.old_maximum_type.invalid 
        || this.old_maximum_period_type.invalid 
        || this.old_carry_forward_years.invalid
        || this.old_wellness_percentage.invalid) {
          if (this.showWellnessPert == true){
            this.old_wellness_percentage.invalid
          }
        return;
      }
    }
    var rowData = {
      divMaxAmt: this.old_maximum_amount.value,
      divMaxDesc: "NA",
      divMaxKey: this.divMaxKey, 
      maxTypeKey: this.selectedDivMaximumTypeValue != null ? this.selectedDivMaximumTypeValue : this.divMaxmaximumTypeKey,
      maxTypeDesc: this.selectedDivMaximumTypeDesc != null ? this.selectedDivMaximumTypeDesc : this.divMaxmaximumTypeDesc,
      maxPeriodTypeKey: this.selectedDivMaximumPeriodTypeValue != null ? this.selectedDivMaximumPeriodTypeValue : this.divMaxMaximumPeriodTypeKey,
      maxPeriodTypeDesc: this.selectedDivMaximumPeriodTypeDesc != null ? this.selectedDivMaximumPeriodTypeDesc : this.divMaxMaximumPeriodTypeDesc,
      dentalInd: this.old_dental.value ? "T" : "F",
      visionInd: this.old_vision.value ? "T" : "F",
      healthInd: this.old_health.value ? "T" : "F",
      drugInd: this.old_drug.value ? "T" : "F",
      wellnessInd: this.old_wellness.value ? "T" : "F",
      wellnessPercentage: this.old_wellness_percentage.value,
      carryFrwdYrs: this.old_carry_forward_years.value
    }
    
    // Check for plan edit mode
    if (this.planEditMode == true) {
      rowData['effectiveOn'] = this.changeDateFormatService.convertDateObjectToString(this.old_effective_date.value)
      if (this.old_expiry_date.value != null && this.old_expiry_date.value != undefined && this.old_expiry_date.value != "" && this.old_expiry_date.value !='00/00/0') {
        rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.old_expiry_date.value);
      } else {
        rowData['expiredOn'] = "";
      }
    }

    let copy = Object.assign({}, rowData);
    this.DivisionMaxList[index] = copy;
    this.resetDivisionMaxInfo();
  }
  
  /** reset Devision form */
  resetDivisionMaxInfo() {
    this.old_maximum_amount.reset();
    this.old_maximum_type.reset();
    this.old_maximum_period_type.reset();
    this.old_carry_forward_years.reset();
    this.old_dental.reset();
    this.old_vision.reset();
    this.old_health.reset();
    this.old_drug.reset();
    this.old_wellness_percentage.reset();

    // Check for plan edit mode
    if (this.planEditMode == true) {
      this.old_effective_date.reset();
      this.old_expiry_date.reset();
  
      this.dateNameArray['OldDivisionMaxeEffectiveDate'] = null
      this.dateNameArray['OldDivisionMaxeExpiryDate'] = null;
    }

    this.selectedDivisionMax = {};
    this.DivisionMaxEditMode = false;
  }

  /**
   * Delete division record from list
   */
  deleteDivisionMax(index) {
    this.exDialog.openConfirm('Are You Sure You Want to Delete ?').subscribe((value) => {
      if (value) {
        this.DivisionMaxList.splice(index, 1);
      }
    });
  }

  setCarryForwardYear(row, periodTypeYear) {
      if (periodTypeYear != 91) {
        
        if (row == "addRow") {
          this.new_carry_forward_years.patchValue(0);
          this.new_carry_forward_years.enable();
        } else {
          if (this.old_carry_forward_years.value == "" || this.old_carry_forward_years.value == undefined || this.old_carry_forward_years.value == null) {
            this.old_carry_forward_years.patchValue(0);
          }
          this.old_carry_forward_years.enable();
        }
      } else {
        if (row == "addRow") {
          this.new_carry_forward_years.patchValue(null);
          this.new_carry_forward_years.disable();
        } else {
          this.old_carry_forward_years.patchValue(null);
          this.old_carry_forward_years.disable();
        }
      }
    
  }

  /** ----------- Division Max Inline table----------- */

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
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    } 
    
    else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null;
    }

    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }

    if (event.reason == 2) {
      if (frmControlName == 'new_effective_date') { 
        this.new_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.planInfo['effectiveOn'] && this.new_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
          var error =  this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.new_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.new_effective_date.value && this.new_expiry_date.value) {
          var error =  this.changeDateFormatService.compareTwoDates(this.new_effective_date.value.date, this.new_expiry_date.value.date);
          this.setExpiryDateError('new_expiry_date', error);
        }

      } else if (frmControlName == 'new_expiry_date') {
        this.new_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.new_effective_date.value && this.new_expiry_date.value) {
          var error =  this.changeDateFormatService.compareTwoDates(this.new_effective_date.value.date, this.new_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
        }

      } else if (frmControlName == 'old_effective_date') { 
        this.old_effective_date.patchValue(obj);
        /* This function is used to compare two dates */

        /** Compare Plan effective date with new effective date */
        if (this.planInfo['effectiveOn'] && this.old_effective_date.value) {
          var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
          var error =  this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.old_effective_date.value.date);
          this.setEffectiveDateError(frmControlName, error);
        }

        /* This function is used to compare effective date with expiry date */
        if (this.old_effective_date.value && this.old_expiry_date.value) {
          var error =  this.changeDateFormatService.compareTwoDates(this.old_effective_date.value.date, this.old_expiry_date.value.date);
          this.setExpiryDateError('old_expiry_date', error);
        }

      } else if (frmControlName == 'old_expiry_date') {
        this.old_expiry_date.patchValue(obj);

        /* This function is used to compare effective date with expiry date */
        if (this.old_effective_date.value && this.old_expiry_date.value) {
          var error =  this.changeDateFormatService.compareTwoDates(this.old_effective_date.value.date, this.old_expiry_date.value.date);
          this.setExpiryDateError(frmControlName, error);
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
      self[frmControlName].setErrors({"EffectiveDateNotValid": true});
    }
  }

  /**
  * set expriy Date Error;
  */
  setExpiryDateError(frmControlName, errorFlag) {
    var self = this;
    if (errorFlag.isError == true) {
      self[frmControlName].setErrors({"ExpiryDateNotValid": true});
    } else {
      self[frmControlName].setErrors();
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

  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(()=>{
    },100);
  }

  triggerDivisionMaxData() {
    $('.company-tabs li:nth-child(3)').removeClass('active');
    $('.company-tabs [href*="plan-rule"]').parent().addClass('active');
    $('.grid-inner #plan-Division').removeClass('active in');
    $('.grid-inner #plan-rule').addClass('active in');    

    this.divisionMaxData.emit(this.DivisionMaxList);
  }

  keyPress(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode( key );
    var val = theEvent.target.value + key
    if (val.length > 9 ) {
      theEvent.returnValue = true;
      if(theEvent.preventDefault) theEvent.preventDefault();
    }
  }

}
