import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CommonDatePickerOptions } from '../../../common-module/Constants';

import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { PlanApi } from '../plan-api';
import { PlanService } from '../plan.service';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormCanDeactivate } from '../../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fee-guide',
  templateUrl: './fee-guide.component.html',
  styleUrls: ['./fee-guide.component.css'],
  providers: [DatatableService, ChangeDateFormatService, HmsDataServiceService, ExDialog, ToastrService]
})
export class FeeGuideComponent extends FormCanDeactivate implements OnInit {
  @ViewChild("focusFreeGuideEl") trgFocusFreeGuideEl: ElementRef;
  @ViewChild("focusAddScheduleEl") trgFocusAddScheduleEl: ElementRef;
  @ViewChild("focusEditScheduleEl") trgFocusEditScheduleEl: ElementRef;
  @ViewChild("focusAddProvinceEl") trgFocusAddProvinceEl: ElementRef;
  @ViewChild("focusEditProvinceEl") trgFocusEditProvinceEl: ElementRef;

  feeGuideObj: any = {};
  @Output() feeGuideData = new EventEmitter();
  @Output() selectedScheduleEmit = new EventEmitter();
  @Output() selectedProvinceEmit = new EventEmitter();
  @Input() FormGroup: FormGroup; //Intitialize form
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerPlaceholder = "dd/mmm/yyyy";

  public planInfo = [];
  public feeGuideInfo = [];

  planType;
  companyPlanKey;
  companyDivisionKey;

  feeGuideFormDataVal = {
    'scheduleKey': new FormControl(null),
    'provinceName': new FormControl(null),
    'feeGuideDt': new FormControl(''),
    'PayOnProviderAddress': new FormControl('')
  }

  dateNameArray = {};

  public isOpen: boolean = false;
  expired: boolean;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  public ScheduleList = [];
  public ProvinceList = [];

  /** Schedule Inline Data table  */
  public ScheduleAddMode = false; /** We will set its value true at the time of Adding new record. */
  public ScheduleEditMode = false; /** We will set its value true at the time of edit record. */

  public selectedSchedule = {}; /** For selected record object */

  public ScheduleDataList = [];

  /** For Schedule New Row */
  new_dental_fee_schedule: FormControl;
  new_schedule_effective_date: FormControl;
  new_schedule_expiry_date: FormControl;

  /** For Schedule Update Row */
  old_dental_fee_schedule: FormControl;
  old_schedule_effective_date: FormControl;
  old_schedule_expiry_date: FormControl;

  /* To Show date related errors */
  NewScheduleExpiryDateNotValid;
  NewScheduleEffectiveDateNotValid;
  OldScheduleExpiryDateNotValid;
  OldScheduleEffectiveDateNotValid;

  /* Schedule Inline Data table  */

  /** Province Inline Data table  */
  public ProvinceAddMode = false; /** We will set its value true at the time of Adding new record. */
  public ProvinceEditMode = false; /** We will set its value true at the time of edit record. */

  public selectedProvince = {}; /** For selected record object */

  public ProvinceDataList = [];

  /** For New Row */
  new_province: FormControl;
  new_province_effective_date: FormControl;
  new_province_expiry_date: FormControl;

  /** For Update Row */
  old_province: FormControl;
  old_province_effective_date: FormControl;
  old_province_expiry_date: FormControl;

  NewProvinceExpiryDateNotValid;
  NewProvinceEffectiveDateNotValid;
  oldProvinceExpiryDateNotValid;
  oldProvinceEffectiveDateNotValid;
  editMode: boolean;
  /** Province Inline Data table  */

  public scheduleData: CompleterData;
  public provinceData: CompleterData;
  selectedScheduleKey: any;
  selectedGernalScheduleKey: any;
  selectedProvinceKey: any;
  selectedGernalProvinceKey: any;
  savedScheduleKey: any;
  savedProvinceKey: any;
  scheduleTableKey: any;
  scheduleTableDesc: any;
  selectedScheduleDesc: any;
  selectedGernalScheduleDesc: any;
  selectedProvinceDesc: any;
  selectedGernalProvinceDesc: any;
  provinceTableDesc: any;
  provinceTableKey: any;
  savedScheduleDesc: any;
  savedProvinceDesc: any;

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private planService: PlanService,
    private exDialog: ExDialog,
    private route: ActivatedRoute,
    private dataTableService: DatatableService,
    private completerService: CompleterService,
    private ToastrService: ToastrService,
  ) {
    super();

    /**
     * Get planType, companyPlanKey, companyDivisionKey on load page
     */
    this.route.queryParams.subscribe((params: Params) => {
      this.planType = params['planType'];
      this.companyPlanKey = params.planId;
      this.companyDivisionKey = params.divisionId;
    });

    this.getFeeGuideData();

    /** Fee Guide Inline Schedule Data table new row  */
    this.new_dental_fee_schedule = new FormControl(null, [Validators.required]);
    this.new_schedule_effective_date = new FormControl('', [Validators.required]);
    this.new_schedule_expiry_date = new FormControl('');

    /** For update row  */
    this.old_dental_fee_schedule = new FormControl(null, [Validators.required]);
    this.old_schedule_effective_date = new FormControl('', [Validators.required]);
    this.old_schedule_expiry_date = new FormControl('');
    /** Fee Guide Inline Data table  */

    /** Fee Guide Province Inline Data table new row  */
    this.new_province = new FormControl(null, [Validators.required]);
    this.new_province_effective_date = new FormControl('', [Validators.required]);
    this.new_province_expiry_date = new FormControl('');

    /** For update row  */
    this.old_province = new FormControl(null, [Validators.required]);
    this.old_province_effective_date = new FormControl('', [Validators.required]);
    this.old_province_expiry_date = new FormControl('');
    /** Fee Guide Inline Data table  */

  }

  isProvinceHistoryExist = false;
  isScheduleHistoryExist = false;
  addMode = true;

  province_columns = [
    { title: "Province", data: 'provinceName' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' }
  ]

  schedule_columns = [
    { title: "Schedule", data: 'dentFeeGuideSchedDesc' },
    { title: "Effective Date", data: 'effectiveOn' },
    { title: "Expiry Date", data: 'expiredOn' }
  ]

  dataToggle: string
  provinceDataTarget: string
  provinceId: string
  provinceClass: string
  provinceTitle: string

  scheduleDataTarget: string
  scheduleId: string
  scheduleClass: string
  scheduleTitle: string

  /**
   * Get Schedule and Province list
   */
  ngOnInit() {
    this.dataToggle = "modal"
    this.provinceDataTarget = "#provinceHistory"
    this.provinceId = "province_history"
    this.provinceClass = "history-ico"
    this.provinceTitle = "Province History"

    this.scheduleDataTarget = "#scheduleHistory"
    this.scheduleId = "schedule_history"
    this.scheduleClass = "history-ico"
    this.scheduleTitle = "Schedule History"

    this.getScheduleList();
    this.getProvince();
    // to resolved calendar isuue
    let self = this
    $(document).on('click','.btnpicker', function () {
        $('#new_province_effective_date .mydp .selector').addClass('bottom-calender')
    })
    $(document).on('click','.btnpicker', function () {
        $('#NewProvinceExpiryDate .mydp .selector').addClass('bottom-calender')
    })

  }

  /**
   * Get Schedule List
   */
  getScheduleList() {
    this.hmsDataServiceService.getApi(PlanApi.getFeeGuideScheduleListUrl).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        for (var i = 0; i < data.result.length; i++) {
          if (!data.result[i].scheduleName.startsWith('%')) {
            this.ScheduleList.push(data.result[i]);
          }
        }
        //Predictive Company Search Upper
        this.scheduleData = this.completerService.local(
          this.ScheduleList,
          "scheduleName",
          "scheduleName"
        );
      }
    });
  }

  /**
   * Select the Dental Fee Schedule
   * @param selected 
   */
  onScheduleSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedScheduleKey = (selected.originalObject.scheduleKey).toString();
      this.selectedScheduleDesc = selected.originalObject.scheduleName;
    }
    else {
      this.selectedScheduleKey = '';
    }
  }

  /**
   * Select the General Details Schedule
   * @param selected 
   */
  onGernalScheduleSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedGernalScheduleKey = (selected.originalObject.scheduleKey).toString();
      this.selectedGernalScheduleDesc = selected.originalObject.scheduleName;
    }
    else {
      this.selectedGernalScheduleKey = '';
    }
  }

  /**
   * Get Provience drop down list
   */
  getProvince() {
    this.hmsDataServiceService.getApi(PlanApi.getProvinceListUrl).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.ProvinceList = data.result;
        //Predictive Company Search Upper
        this.provinceData = this.completerService.local(
          this.ProvinceList,
          "provinceName",
          "provinceName"
        );
      }
    });
  }

  /**
   * Select the General Details Province
   * @param selected 
   */
  onGernalProvinceSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedGernalProvinceKey = (selected.originalObject.provinceKey).toString();
      this.selectedGernalProvinceDesc = (selected.originalObject.provinceName).toString();
    }
    else {
      this.selectedGernalProvinceKey = '';
    }
  }

  /**
   * Select the Dental Fee Province from drop down
   * @param selected 
   */
  onProvinceSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedProvinceKey = (selected.originalObject.provinceKey).toString();
      this.selectedProvinceDesc = (selected.originalObject.provinceName).toString();
    }
    else {
      this.selectedProvinceKey = '';
    }
  }

  /**
   * Get Province History List
   */
  getProvinceHistory() {
    var province_url = PlanApi.getProvinceHistory;
    var provinceTableId = "province";
    var reqParamProHist = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }]
    if (!$.fn.dataTable.isDataTable('#province')) {
      var dateCols = ['effectiveOn', 'expiredOn']
      this.dataTableService.jqueryDataTable(provinceTableId, province_url, 'full_numbers', this.province_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined, [1,2])
    } else {
      this.dataTableService.jqueryDataTableReload(provinceTableId, province_url, reqParamProHist)
    }
  }

  /**
   * Get Schedule History List
   */
  getScheduleHistory() {
    var schedule_url = PlanApi.getScheduleHistory;
    var scheduleTableId = "schedule";
    var reqParamProHist = [{ 'key': 'divisionKey', 'value': this.companyDivisionKey }]
    if (!$.fn.dataTable.isDataTable('#schedule')) {
      var dateCols = ['effectiveOn', 'expiredOn']
      this.dataTableService.jqueryDataTable(scheduleTableId, schedule_url, 'full_numbers', this.schedule_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParamProHist, '', undefined, [1,2])
    } else {
      this.dataTableService.jqueryDataTableReload(scheduleTableId, schedule_url, reqParamProHist)
    }
  }

  /**
   * Get Fee guide tab data
   */
  getFeeGuideData() {
    this.planService.planModuleData.subscribe((value) => {
      this.planInfo = value.planInfoJson[0];
      this.feeGuideInfo = value.feeGuideJson[0];

      if (value.planInfoJson[0].feeGuideProvinceHist == 'Y') {
        this.isProvinceHistoryExist = true;
      } else {
        this.isProvinceHistoryExist = false;
      }

      if (value.planInfoJson[0].feeGuideScheduleHist == 'Y') {
        this.isScheduleHistoryExist = true;
      } else {
        this.isScheduleHistoryExist = false;
      }

      if (value.feeGuideJson[0] != null) {
        // Patch Form values
        if (value.feeGuideJson[0].scheduleKey) {
          this.savedScheduleKey = value.feeGuideJson[0].scheduleKey;
          this.savedProvinceKey = value.feeGuideJson[0].provinceKey;
          this.savedScheduleDesc = value.feeGuideJson[0].scheduleName ? value.feeGuideJson[0].scheduleName : value.feeGuideJson[0].scheduleDesc;
          this.savedProvinceDesc = value.feeGuideJson[0].provinceName ? value.feeGuideJson[0].provinceName : value.feeGuideJson[0].provinceDesc;
          this.addMode = false;
          this.FormGroup.patchValue({ 'scheduleKey': this.savedScheduleDesc });
        }
        if (value.feeGuideJson[0].provinceKey) {
          this.addMode = false;
          this.FormGroup.patchValue({ 'provinceName': this.savedProvinceDesc });
        }

        if (value.feeGuideJson[0].feeGuideDt) {
          var dateArray = this.changeDateFormatService.convertStringDateToObject(value.feeGuideJson[0].feeGuideDt);
          this.FormGroup.patchValue({
            feeGuideDt: {
              date: {
                year: dateArray.date.year,
                month: dateArray.date.month,
                day: dateArray.date.day
              }
            }
          });
        }

        if (value.feeGuideJson[0].payOnProviderAddress) {
          this.FormGroup.patchValue({ 'PayOnProviderAddress': (value.feeGuideJson[0].payOnProviderAddress == 'T' ? true : false) });
        }

        // Patch Schedule Data
        if (value.feeGuideJson[0].schedule && Object.keys(value.feeGuideJson[0].schedule).length > 0) {
          this.ScheduleDataList = value.feeGuideJson[0].schedule;
        }

        // Patch Province Data
        if (value.feeGuideJson[0].province && Object.keys(value.feeGuideJson[0].province).length > 0) {
          this.ProvinceDataList = value.feeGuideJson[0].province;
        }
      }
    });
  }

  /**--------------- Fee Guide Inline Data table ------- */
  /** 
   * initialize new Schedule object 
   */
  enableAddSchedule() {
    this.selectedSchedule = {};
    this.ScheduleEditMode = false;
    this.ScheduleAddMode = true;
    this.setElementFocus('trgFocusAddScheduleEl');
  }

  /** Add new Schedule from Schedule list */
  addNewSchedule() {
    this.new_dental_fee_schedule.markAsTouched();
    this.new_schedule_effective_date.markAsTouched();
    this.new_schedule_expiry_date.markAsTouched();

    if (this.new_dental_fee_schedule.invalid || this.new_schedule_effective_date.invalid || this.new_schedule_expiry_date.invalid || this.NewScheduleExpiryDateNotValid == true || this.NewScheduleEffectiveDateNotValid == true) {
      return;
    }
    var rowData = {
      dentFeeGuideSchedKey: this.selectedScheduleKey,
      dentFeeGuideSchedDesc: this.selectedScheduleDesc,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.new_schedule_effective_date.value)
    }

    if (this.new_schedule_expiry_date.value != null && this.new_schedule_expiry_date.value != undefined && this.new_schedule_expiry_date.value != "" && this.new_schedule_expiry_date.value != '00/00/0') {
      rowData['expiredOn'] = this.new_schedule_expiry_date.value;
      rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.new_schedule_expiry_date.value)
    } else {
      rowData['expiredOn'] = "";
    }
    /* Expiry Date: color code check added */ 
    var check = this.checkExpiryDate(rowData['expiredOn'])
    rowData['checkDate'] = check

    this.ScheduleDataList.unshift(rowData);
    this.resetNewScheduleRow();
  }

  resetNewScheduleRow() {
    this.ScheduleAddMode = false;

    this.NewScheduleExpiryDateNotValid = false;
    this.NewScheduleEffectiveDateNotValid = false;
    this.dateNameArray['NewScheduleEffectiveDate'] = null
    this.dateNameArray['NewScheduleExpiryDate'] = null;

    this.new_dental_fee_schedule.reset();
    this.new_schedule_effective_date.reset();
    this.new_schedule_expiry_date.reset();
  }

  /** 
   * Enable Edit Schedule 
   */
  enableEditSchedule(rowData, rowIndex): void {
    this.selectedScheduleKey = null;
    this.selectedScheduleDesc = null;
    this.resetNewScheduleRow();

    this.ScheduleEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedSchedule = copy;
    this.scheduleTableKey = rowData.dentFeeGuideSchedKey;
    this.scheduleTableDesc = rowData.dentFeeGuideSchedDesc;

    this.old_dental_fee_schedule.patchValue(this.scheduleTableDesc);

    this.selectedSchedule['rowIndex'] = rowIndex;
    this.selectedSchedule['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
    this.setControlDate('OldScheduleEffectiveDate', this.selectedSchedule['effectiveOn'])

    if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
      this.selectedSchedule['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
      this.setControlDate('OldScheduleExpiryDate', this.selectedSchedule['expiredOn'])
    }
    this.setElementFocus('trgFocusEditScheduleEl');
  }

  /** 
   * Update Schedule 
   */
  updateSchedule(index) {
    this.old_dental_fee_schedule.markAsTouched();
    this.old_schedule_effective_date.markAsTouched();
    this.old_schedule_expiry_date.markAsTouched();

    if (this.old_dental_fee_schedule.invalid || this.old_schedule_effective_date.invalid || this.old_schedule_expiry_date.invalid || this.OldScheduleExpiryDateNotValid == true || this.OldScheduleEffectiveDateNotValid == true) {
      return;
    }

    var rowData = {
      dentFeeGuideSchedKey: this.selectedScheduleKey != null ? this.selectedScheduleKey : this.scheduleTableKey,
      dentFeeGuideSchedDesc: this.selectedScheduleDesc != null ? this.selectedScheduleDesc : this.scheduleTableDesc,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.old_schedule_effective_date.value)
    }

    if (this.old_schedule_expiry_date.value != null && this.old_schedule_expiry_date.value != undefined && this.old_schedule_expiry_date.value != "" && this.old_schedule_expiry_date.value != '00/00/0') {
      rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.old_schedule_expiry_date.value);
    } else {
      rowData['expiredOn'] = "";
    }
    /* Expiry Date: color code check added */ 
    var check = this.checkExpiryDate(rowData['expiredOn'])
    rowData['checkDate'] = check

    let copy = Object.assign({}, rowData);
    this.ScheduleDataList[index] = copy;
    this.resetScheduleInfo();
  }

  /** 
   * reset Schedule form 
   */
  resetScheduleInfo() {
    this.old_dental_fee_schedule.reset();
    this.old_schedule_effective_date.reset();
    this.old_schedule_expiry_date.reset();

    this.OldScheduleExpiryDateNotValid = false;
    this.OldScheduleEffectiveDateNotValid = false;
    this.dateNameArray['OldScheduleEffectiveDate'] = null
    this.dateNameArray['OldScheduleExpiryDate'] = null;

    this.selectedSchedule = {};
    this.ScheduleEditMode = false;
  }

  /**
   * Delete record from list
   */
  deleteSchedule(index) {
    this.exDialog.openConfirm('Are You Sure You Want to Delete ?').subscribe((value) => {
      if (value) {
        this.ScheduleDataList.splice(index, 1);
      }
    });
  }

  /** ----------- Schedule Inline table----------- */

  /**--------------- Fee Guide Province Inline Data table ------- */

  /** 
   * initialize new Schedule object 
   */
  enableAddProvince() {
    this.selectedProvince = {};
    this.ProvinceEditMode = false;

    this.ProvinceAddMode = true;
    this.setElementFocus('trgFocusAddProvinceEl');
  }

  /** 
  * Add new Schedule from Schedule list 
  */
  addNewProvince() {
    this.new_province.markAsTouched();
    this.new_province_effective_date.markAsTouched();
    this.new_province_expiry_date.markAsTouched();

    if (this.new_province.invalid || this.new_province_effective_date.invalid || this.new_province_expiry_date.invalid) {
      return;
    }

    var rowData = {
      provinceKey: this.selectedProvinceKey,
      provinceDesc: this.selectedProvinceDesc,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.new_province_effective_date.value)
    }

    if (this.new_province_expiry_date.value != null && this.new_province_expiry_date.value != undefined && this.new_province_expiry_date.value != "" && this.new_province_expiry_date.value != '00/00/0') {
      rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.new_province_expiry_date.value);
    } else {
      rowData['expiredOn'] = "";
    }
    /* Expiry Date: color code check added */ 
    var check = this.checkExpiryDate(rowData['expiredOn'])
    rowData['checkDate'] = check
    this.ProvinceDataList.unshift(rowData);

    this.resetNewProvinceRow();
  }

  resetNewProvinceRow() {
    this.ProvinceAddMode = false;

    this.dateNameArray['NewProvinceEffectiveDate'] = null;
    this.dateNameArray['NewProvinceExpiryDate'] = null;
    this.NewProvinceExpiryDateNotValid = false;
    this.NewProvinceEffectiveDateNotValid = false;

    this.new_province.reset();
    this.new_province_effective_date.reset();
    this.new_province_expiry_date.reset();
  }

  /** Edit Schedule */
  enableEditProvince(rowData, rowIndex): void {
    this.selectedProvinceKey = null;
    this.selectedProvinceDesc = null;
    this.resetNewProvinceRow();
    this.ProvinceEditMode = true;
    let copy = Object.assign({}, rowData)
    this.selectedProvince = copy;

    this.provinceTableKey = rowData.provinceKey;
    this.provinceTableDesc = rowData.provinceName ? rowData.provinceName : rowData.provinceDesc;

    this.old_province.patchValue(this.provinceTableDesc);

    this.selectedProvince['rowIndex'] = rowIndex;
    this.selectedProvince['effectiveOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.effectiveOn);
    this.setControlDate('OldProvinceEffectiveDate', this.selectedProvince['effectiveOn'])

    if (rowData.expiredOn != null && rowData.expiredOn != undefined && rowData.expiredOn != "") {
      this.selectedProvince['expiredOn'] = this.changeDateFormatService.convertStringDateToObject(rowData.expiredOn);
      this.setControlDate('OldProvinceExpiryDate', this.selectedProvince['expiredOn'])
    } else {
      this.selectedProvince['expiredOn'] = null;
    }

    this.setElementFocus('trgFocusEditProvinceEl');
  }

  /** Update Schedule */
  updateProvince(index) {
    this.old_province.markAsTouched();
    this.old_province_effective_date.markAsTouched();
    this.old_province_expiry_date.markAsTouched();

    if (this.old_province.invalid || this.old_province_effective_date.invalid || this.old_province_expiry_date.invalid) {
      return;
    }
    var rowData = {
      provinceKey: this.selectedProvinceKey != null ? this.selectedProvinceKey : this.provinceTableKey,
      provinceDesc: this.selectedProvinceDesc != null ? this.selectedProvinceDesc : this.provinceTableDesc,
      effectiveOn: this.changeDateFormatService.convertDateObjectToString(this.old_province_effective_date.value),
    }

    if (this.old_province_expiry_date.value != null && this.old_province_expiry_date.value != undefined && this.old_province_expiry_date.value != "" && this.old_province_expiry_date.value != '00/00/0') {
      rowData['expiredOn'] = this.changeDateFormatService.convertDateObjectToString(this.old_province_expiry_date.value);
    } else {
      rowData['expiredOn'] = "";
    }
    /* Expiry Date: color code check added */ 
    var check = this.checkExpiryDate(rowData['expiredOn'])
    rowData['checkDate'] = check
    let copy = Object.assign({}, rowData);
    this.ProvinceDataList[index] = copy;

    this.resetProvinceInfo();
  }

  /** reset Schedule form */
  resetProvinceInfo() {
    this.old_province.reset();
    this.old_province_effective_date.reset();
    this.old_province_expiry_date.reset();

    this.oldProvinceExpiryDateNotValid = false;
    this.oldProvinceEffectiveDateNotValid = false;

    this.dateNameArray['OldProvinceEffectiveDate'] = null;
    this.dateNameArray['OldProvinceExpiryDate'] = null;
    this.selectedProvince = {};
    this.ProvinceEditMode = false;
  }

  /**
   * Delete record from list
   */
  deleteProvince(index) {
    this.exDialog.openConfirm('Are You Sure You Want to Delete ?').subscribe((value) => {
      if (value) {
        this.ProvinceDataList.splice(index, 1);
      }
    });
  }

  /**
   * Validate New Province if already exist
   * @param NewProvince 
   */
  validateNewProvince(NewProvince) {
    if (this.new_province.valid) {
      for (var i in this.ProvinceDataList) {
        if (NewProvince == this.ProvinceDataList[i].provinceName) {
          if (this.ProvinceDataList[i].expiredOn == "") {
            this.new_province.setErrors({
              "alreadyExist": true
            });
            return;
          } else {
            var currentDate = this.changeDateFormatService.getToday();
            var expiryDt = this.changeDateFormatService.convertStringDateToObject(this.ProvinceDataList[i].expiredOn);
            var error = this.changeDateFormatService.compareTwoDates(expiryDt.date, currentDate.date);
            if (error.isError == true) {
              this.new_province.setErrors({
                "alreadyExist": true
              });
              return;
            }
          }
        }
      }
    }
  }

  /**
   * Validate Old Province if already exist
   * @param oldProvince 
   */
  validateOldProvince(oldProvince) {
    if (this.old_province.valid && oldProvince != this.selectedProvince['provinceName']) {

      for (var i in this.ProvinceDataList) {
        if (this.selectedProvince['provinceName'] == this.ProvinceDataList[i].provinceName) {

          if (this.ProvinceDataList[i].expiredOn == "" || this.ProvinceDataList[i].expiredOn == null || this.ProvinceDataList[i].expiredOn == undefined) {
            this.old_province.setErrors({
              "alreadyExist": true
            });
          } else {
            var currentDate = this.changeDateFormatService.getToday();
            var expiryDt = this.changeDateFormatService.convertStringDateToObject(this.ProvinceDataList[i].expiredOn);
            var error = this.changeDateFormatService.compareTwoDates(expiryDt.date, currentDate.date);

            if (error.isError == true) {
              this.old_province.setErrors({
                "alreadyExist": true
              });
            }
          }
        }
      }

    }
  }

  /** ----------- Schedule Inline table----------- */
  /**
 * @description : This Function is used to convert entered value to valid date format.
 * @params : "event" is datepicker value
 * @params : "frmControlName" is datepicker name/Form Control Name
 * @params : "formName" is form name
 * @params : "currentDate" is used to set current date. Send true in this param is want to set current date
 * For Reference : https://www.npmjs.com/package/angular4-datepicker
 * @return : None
 */
  changeDateFormat(event, frmControlName, formName, currentDate) {
    var error = { isError: false, errorMessage: '' };
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.getToday();
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);

      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    } 
    else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
    }

    if (event.reason == 2) {
      if (formName == 'FormGroup') {
        this.FormGroup.patchValue(this.setFormControlDate(frmControlName, obj));

        if (this.planInfo['effectiveOn'] && this.FormGroup.value.feeGuideDt) {
          var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
          error = this.changeDateFormatService.compareTwoDates(effectiveDt.date, this.FormGroup.value.feeGuideDt.date);
          if (error.isError == true) {
            self[formName].controls[frmControlName].setErrors({
              "feeGuideDateNotValid": true
            });
          }
        }
      }
    }

    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  changeFilterDateFormat(event, frmControlName, selDate, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.getToday();
      this.setControlDate(selDate, obj);
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
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    } 
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    
    }
    else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      this.NewScheduleExpiryDateNotValid = false;
      this.OldScheduleExpiryDateNotValid = false;
      this.NewProvinceExpiryDateNotValid = false;
      this.oldProvinceExpiryDateNotValid = false;
      return;
      /** Date if field not mandatory */
    }

    if (event.reason == 2) {
      this.validateExpiryDate(frmControlName, selDate);
    }
   

  }

  /**
   * Validate Expiry date should not be Greater than Effective date
   * @param frmControlName 
   * @param selDate 
   */
  validateExpiryDate(frmControlName, selDate) {
    var error = { isError: false, errorMessage: '' };
    /** Compare new schedule effective date with new schedule expiry date */
    if (frmControlName == 'new_schedule_effective_date' || frmControlName == 'new_schedule_expiry_date') {
      if (this.dateNameArray['NewScheduleEffectiveDate'] && this.dateNameArray['NewScheduleExpiryDate']) {
        error = this.changeDateFormatService.compareTwoDates(this.dateNameArray['NewScheduleEffectiveDate'], this.dateNameArray['NewScheduleExpiryDate']);
        this.setExpiryDateError(frmControlName, error);

        this.NewScheduleExpiryDateNotValid = false;
        if (error.isError == true) {
          this.NewScheduleExpiryDateNotValid = true;
        }

      }
    }

    /** Compare Plan effective date with new schedule effective date */
    if (this.new_schedule_effective_date || selDate == 'NewScheduleEffectiveDate') {

      var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
      error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.dateNameArray['NewScheduleEffectiveDate']);
      this.setEffectiveDateError(frmControlName, error);

      this.NewScheduleEffectiveDateNotValid = false;
      if (error.isError == true) {
        this.NewScheduleEffectiveDateNotValid = true;
      }

    }

    /** Compare old schedule effective date with old schedule expiry date */
    if (frmControlName == 'old_schedule_effective_date' || frmControlName == 'old_schedule_expiry_date') {

      if (this.dateNameArray['OldScheduleEffectiveDate'] && this.dateNameArray['OldScheduleExpiryDate']) {
        error = this.changeDateFormatService.compareTwoDates(this.dateNameArray['OldScheduleEffectiveDate'], this.dateNameArray['OldScheduleExpiryDate']);
        this.setExpiryDateError(frmControlName, error);

        this.OldScheduleExpiryDateNotValid = false;
        if (error.isError == true) {
          this.OldScheduleExpiryDateNotValid = true;
        }

      }
    }

    /** Compare Plan effective date with old schedule effective date */
    if (this.old_schedule_effective_date || selDate == 'OldScheduleEffectiveDate') {
      var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
      error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.dateNameArray['OldScheduleEffectiveDate']);
      this.setEffectiveDateError(frmControlName, error);
      this.OldScheduleEffectiveDateNotValid = false;
      if (error.isError == true) {
        this.OldScheduleEffectiveDateNotValid = true;
      }

    }

    /** ---------- Date check for Province Effective and Expiry Date ---------- */

    /** Compare new schedule effective date with new schedule expiry date */
    if (frmControlName == 'new_province_effective_date' || frmControlName == 'new_province_expiry_date') {
      if (this.dateNameArray['NewProvinceEffectiveDate'] && this.dateNameArray['NewProvinceExpiryDate']) {
        error = this.changeDateFormatService.compareTwoDates(this.dateNameArray['NewProvinceEffectiveDate'], this.dateNameArray['NewProvinceExpiryDate']);
        this.setExpiryDateError(frmControlName, error);

        this.NewProvinceExpiryDateNotValid = false;
        if (error.isError == true) {
          this.NewProvinceExpiryDateNotValid = true;
        }

      }
    }

    /** Compare Plan effective date with new schedule effective date */
    if (this.new_province_effective_date || selDate == 'NewProvinceEffectiveDate') {
      var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
      error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.dateNameArray['NewProvinceEffectiveDate']);
      this.setEffectiveDateError(frmControlName, error);

      this.NewProvinceEffectiveDateNotValid = false;
      if (error.isError == true) {
        this.NewProvinceEffectiveDateNotValid = true;
      }

    }

    /** Compare old schedule effective date with old schedule expiry date */
    if (frmControlName == 'old_province_effective_date' || frmControlName == 'old_province_expiry_date') {
      if (this.dateNameArray['OldProvinceEffectiveDate'] && this.dateNameArray['OldProvinceExpiryDate']) {
        error = this.changeDateFormatService.compareTwoDates(this.dateNameArray['OldProvinceEffectiveDate'], this.dateNameArray['OldProvinceExpiryDate']);
        this.setExpiryDateError(frmControlName, error);

        this.oldProvinceExpiryDateNotValid = false;
        if (error.isError == true) {
          this.oldProvinceExpiryDateNotValid = true;
        }

      }
    }

    /** Compare Plan effective date with old schedule effective date */
    if (this.old_province_effective_date || selDate == 'OldProvinceEffectiveDate') {
      var planEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planInfo['effectiveOn']);
      error = this.changeDateFormatService.compareTwoDates(planEffectiveDt.date, this.dateNameArray['OldProvinceEffectiveDate']);
      this.setEffectiveDateError(frmControlName, error);
      this.oldProvinceEffectiveDateNotValid = false;
      if (error.isError == true) {
        this.oldProvinceEffectiveDateNotValid = true;
      }

    }

  }

  /**
   * set expiry Date Error;
   */
  setExpiryDateError(frmControlName, errorFlag) {
    if (errorFlag.isError == true) {
      var self = this
      self[frmControlName].setErrors({ "ExpiryDateNotValid": true });
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

  /** 
   * Bind date with form control 
   */
  setFormControlDate(frmControlName, obj) {
    var ControlName = frmControlName;
    var datePickerValue = new Array();
    datePickerValue[ControlName] = obj;
    return datePickerValue;
  }

  /**
   * Trigger fee guide form data on change tab.
   */
  triggerFeeGuideData() {
    $('.company-tabs li:nth-child(5)').removeClass('active');
    $('.company-tabs [href*="plan-print"]').parent().addClass('active');
    $('.grid-inner #plan-guide').removeClass('active in');
    $('.grid-inner #plan-print').addClass('active in');

    let feeGuidFormData: any;
    if (this.FormGroup.value.scheduleKey && this.FormGroup.value.provinceName) {
      feeGuidFormData = {
        scheduleKey: this.selectedGernalScheduleKey ? this.selectedGernalScheduleKey : this.savedScheduleKey,
        scheduleDesc: this.selectedGernalScheduleDesc ? this.selectedGernalScheduleDesc : this.savedScheduleDesc,
        provinceKey: this.selectedGernalProvinceKey ? this.selectedGernalProvinceKey : this.savedProvinceKey,
        provinceDesc: this.selectedGernalProvinceDesc ? this.selectedGernalProvinceDesc : this.savedProvinceDesc,
        feeGuideDt: this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.feeGuideDt),
        payOnProviderAddress: this.FormGroup.value.PayOnProviderAddress == true ? 'T' : 'F'
      }
    } else {
      feeGuidFormData = {
        scheduleKey: '',
        scheduleDesc: '',
        provinceKey: '',
        provinceDesc: '',
        feeGuideDt: '',
        payOnProviderAddress: ''
      }
      if (this.FormGroup.value.scheduleKey != '') {
        Object.assign(feeGuidFormData, {
          'scheduleKey': this.selectedGernalScheduleKey ? this.selectedGernalScheduleKey : this.savedScheduleKey,
          'scheduleDesc': this.selectedGernalScheduleDesc ? this.selectedGernalScheduleDesc : this.savedScheduleDesc
        });
      } else {
        Object.assign(feeGuidFormData, {
          'scheduleKey': '',
          'scheduleDesc': ''
        });
      }
      if (this.FormGroup.value.provinceName != '') {
        Object.assign(feeGuidFormData, {
          'provinceKey': this.selectedGernalProvinceKey ? this.selectedGernalProvinceKey : this.savedProvinceKey,
          'provinceDesc': this.selectedGernalProvinceDesc ? this.selectedGernalProvinceDesc : this.savedProvinceDesc,
        });
      } else {
        Object.assign(feeGuidFormData, {
          'provinceKey': '',
          'provinceDesc': ''
        });
      }
      Object.assign(feeGuidFormData, {
        'feeGuideDt': this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.feeGuideDt),
        'payOnProviderAddress': this.FormGroup.value.PayOnProviderAddress == true ? 'T' : 'F'
      });
    }

    if (this.feeGuideInfo != null && this.feeGuideInfo.hasOwnProperty("plansDetailFeeGuideKey") && this.feeGuideInfo['plansDetailFeeGuideKey'] && this.planType != "copyDivision") {
      Object.assign(feeGuidFormData, {
        'plansDetailFeeGuideKey': this.feeGuideInfo['plansDetailFeeGuideKey']
      });
    }

    if (this.FormGroup.value.scheduleKey && this.FormGroup.value.provinceName) {
      if (this.planType == "editPlan") {
        this.editMode = true;
      }
    }
    this.feeGuideObj = feeGuidFormData;

    if (this.ScheduleDataList.length > 0) {
      this.feeGuideObj['schedule'] = this.ScheduleDataList
    }

    if (this.ProvinceDataList.length > 0) {
      this.feeGuideObj['province'] = this.ProvinceDataList;
    }

    this.feeGuideData.emit(this.feeGuideObj);
  }

  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(() => {
    }, 100);
  }

  /* Expiry Date color code check added */ 
  checkExpiryDate(date){
    if(date){
      var check = this.changeDateFormatService.isFutureDate(date)
      if (check) {
        return false // black color
      } else {
        return true // red color
      }
    }
  }

}
