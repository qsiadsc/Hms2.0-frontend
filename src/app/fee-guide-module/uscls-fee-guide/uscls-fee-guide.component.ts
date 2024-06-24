import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonApi } from '../../common-module/common-api';
import { HmsDataServiceService } from './../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { FeeGuideService } from './../fee-guide.service'
import { ToastrService } from 'ngx-toastr';
import { ServiceProviderApi } from '../../service-provider-module/service-provider-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { FeeGuideApi } from '../fee-guide-api';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { Observable } from 'rxjs';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';

@Component({
  selector: 'app-uscls-fee-guide',
  templateUrl: './uscls-fee-guide.component.html',
  styleUrls: ['./uscls-fee-guide.component.css'],
  providers: [DatatableService, ChangeDateFormatService, FeeGuideService, TranslateService]
})

export class UsclsFeeGuideComponent implements OnInit {
  yearFieldObservable: any;
  feeGuideAdded: boolean = false;
  datesList: any;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  columns = [];
  yearList: any;
  effectiveDate = [];
  feeGuideKey = [];
  updateColumnProcedures = [];
  columnProcedures = []
  banId;
  selectedYear;
  addProcMode;
  selectedEffectiveDate;
  procedureCodeData;
  parameter;
  selectedStatus;
  procedureStart = 0;
  procedureListStart = 0;
  procedureItemStart = 0;
  procedureCodeSelected = []
  procedureCodeItems = [];
  procCode
  dentalProcedureFeeKey
  patchedYear;
  observableObj;
  currentUser;
  check = true
  procedureCode;
  updateUsclsFeeGuideDetails;
  searchFeeGuideForm: FormGroup;
  addProcCode: FormGroup;
  newFeeGuide: FormGroup;
  updateFeeGuide: FormGroup;
  reloadTable = false;
  usclsAddMode: boolean = true;
  usclsViewMode: boolean = false;
  usclsEditMode: boolean = false;
  USCLSAddprocedureCodeViewMode: boolean = false;
  showSearchTable: boolean = true;
  currentYear = this.getCurrentYear();
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  arrItems = [{ id: '1', itemName: 'CovCat-1' }, { id: '2', itemName: 'CovCat-2' }, { id: '3', itemName: 'CovCat-3' }, { id: '4', itemName: 'CovCat-4' }]
  arrProcCodeItems = [{ id: '1', itemName: 'ProcCode-1' }, { id: '2', itemName: 'ProcCode-2' }, { id: '3', itemName: 'ProcCode-3' }, { id: '4', itemName: 'ProcCode-4' }]
  EffectiveDateData = [{ key: '9/9/2018', value: '9/9/2018' }, { key: '10/9/2018', value: '10/9/2018' }]
  dropdownSettings = {};
  multiSelectDropdownSettings = {}
  existingDate;
  yearList1
  UsclsFeeGuideList = [{
    "searchUsclsFeeGuide": 'F',
    "viewUsclsFeeGuide": 'F',
    "editUsclsFeeGuide": 'F',
    "deleteUsclsFeeGuide": 'F',
    "updateUsclsFeeGuide": 'F',
    "createUsclsFeeGuide": 'F',
    "procCodeUsclsFeeGuide": 'F',
  }]
  tableId = "searchUSclsFeeGuideTable";

  constructor(
    private fb: FormBuilder,
    private hmsDataService: HmsDataServiceService,
    public dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private feeGuideService: FeeGuideService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private currentUserService: CurrentUserService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let UsclsFeeGuideArray = this.currentUserService.authChecks['UFG']
        this.getAuthCheck(UsclsFeeGuideArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let UsclsFeeGuideArray = this.currentUserService.authChecks['UFG']
        this.getAuthCheck(UsclsFeeGuideArray)
      })
    }

    this.searchFeeGuideForm = this.fb.group({
      year: ['', Validators.required],
      effectiveDate: ['', Validators.required],
    })

    this.updateFeeGuide = this.fb.group({
      procCode: ['', Validators.required],
      fee: ['', Validators.required],
      feeAmount: ['', Validators.required],
      lab: ['', Validators.required],
      labAmount: ['', Validators.required],
      effectiveDateUpdate: [''],
      yearUpdate: ['', Validators.required]
    })

    this.newFeeGuide = this.fb.group({
      year: ['', Validators.required],
      copyEffectiveDate: ['', Validators.required],
      createFeeGuideRadioButton: ['', Validators.required],
      neweffectiveDate: ['', Validators.required]
    })

    this.addProcCode = this.fb.group({
      year: ['', Validators.required],
      procedureCode: ['', Validators.required],
      amount: ['', [CustomValidators.number]],
      labInc: [''],
      addProcCodeEffectiveDate: ['', Validators.required],
      dentalProcedureFeeKey: ['']
    })

    this.getYearList();
    this.getYearList1();
    this.updateProcedure();

    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check = true) {
        if ('feeGuide.USCLSFeeGuide.procedureCode' == this.translate.instant('feeGuide.USCLSFeeGuide.procedureCode')) {
        } else {
          this.columns =
            [{ title: this.translate.instant('feeGuide.USCLSFeeGuide.procedureCode'), data: 'dentalProcedureId' },
            { title: this.translate.instant('feeGuide.USCLSFeeGuide.amount$'), data: 'dentalProcedureFeeAmt' },
            { title: this.translate.instant('feeGuide.USCLSFeeGuide.labInd'), data: 'labInd' },
            { title: this.translate.instant('common.action'), data: 'dentalProcedureFeeKey' }];
        }
        this.check = false;
        this.observableObj.unsubscribe();
      }
    })

    $(document).unbind();

    $(document).on('mouseover', '.del-ico', function () {
      $(this).attr('title', 'Delete');
    })

    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', 'Edit');
    })

    this.updateFeeGuide.patchValue({ 'fee': 'feeFlat' })
    this.updateFeeGuide.patchValue({ 'lab': 'labFlat' })

    this.newFeeGuide.patchValue({ 'year': this.currentYear.date.year.toString() });
    this.newFeeGuide.patchValue({ 'createFeeGuideRadioButton': 'copyPreviousFeeGuide' });

    var self = this
    setTimeout(function () {
      self.renderer.selectRootElement('#yeatID').focus();
    }, 1000);

    $(document).on("click", "table#searchUSclsFeeGuideTable .view-ico", function () {
      self.dentalProcedureFeeKey = $(this).data('id');
      self.enableUsclsViewMode(self.dentalProcedureFeeKey);
    })

    $(document).on("click", "table#searchUSclsFeeGuideTable .edit-ico", function () {
      self.dentalProcedureFeeKey = $(this).data('id');
      self.enableUsclsEditMode(self.dentalProcedureFeeKey);
    })

    $(document).on("click", "table#searchUSclsFeeGuideTable .del-ico", function () {
      self.dentalProcedureFeeKey = $(this).data('id');
      self.deleteUsclsProcedureCode(self.dentalProcedureFeeKey);
    })
    $(document).find("#fguscls_updateFeeGuide_proCode ul").on('scroll', function () {
      self.updateFeeGuideReset()
    })
  }

  ngAfterViewInit() {
    var self = this
    $(document).find("#loadServicesOnScroll ul").on('scroll', function () {
      self.updateProcedure()
    })
    this.dropdownSettings = Constants.angular2Multiselect;
    this.multiSelectDropdownSettings = Constants.multiSelectDropdown;
  }

  getAuthCheck(UsclsFeeGuideArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.UsclsFeeGuideList = [{
        "searchUsclsFeeGuide": 'T',
        "viewUsclsFeeGuide": 'T',
        "editUsclsFeeGuide": 'T',
        "deleteUsclsFeeGuide": 'T',
        "updateUsclsFeeGuide": 'T',
        "createUsclsFeeGuide": 'T',
        "procCodeUsclsFeeGuide": 'T'
      }]
    } else {
      for (var i = 0; i < UsclsFeeGuideArray.length; i++) {
        userAuthCheck[UsclsFeeGuideArray[i].actionObjectDataTag] = UsclsFeeGuideArray[i].actionAccess
      }
      this.UsclsFeeGuideList = [{
        "searchUsclsFeeGuide": userAuthCheck['UFG13'],
        "viewUsclsFeeGuide": userAuthCheck['SRH14'],
        "editUsclsFeeGuide": userAuthCheck['SRH15'],
        "deleteUsclsFeeGuide": userAuthCheck['SRH16'],
        "updateUsclsFeeGuide": userAuthCheck['SRH18'],
        "createUsclsFeeGuide": userAuthCheck['SRH19'],
        "procCodeUsclsFeeGuide": userAuthCheck['SRH17'],
      }]
    }
    return this.UsclsFeeGuideList
  }

  getYearList() {
    this.feeGuideService.getYearList().then(res => {
      this.yearList = this.feeGuideService.yearList
    })
  }

  getFeeGuideList() {
    this.searchFeeGuideForm.controls['year'].setValidators([Validators.required]);
    this.searchFeeGuideForm.controls['year'].updateValueAndValidity()
    this.searchFeeGuideForm.controls['effectiveDate'].setValidators([Validators.required]);
    this.searchFeeGuideForm.controls['effectiveDate'].updateValueAndValidity()

    if (this.searchFeeGuideForm.valid) {
      this.addProcCode.patchValue({ year: this.selectedYear })
      this.selectedEffectiveDate = this.searchFeeGuideForm.value.effectiveDate
      this.getSelectedFeeGuide(this.selectedEffectiveDate)
      this.showSearchTable = false
      var reqParam = [
        { 'key': 'year', 'value': this.searchFeeGuideForm.value.year },
        { 'key': 'effectiveOn', 'value': this.searchFeeGuideForm.value.effectiveDate }
      ]
      var tableActions = [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'showAction': this.UsclsFeeGuideList[0].viewUsclsFeeGuide },
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'showAction': this.UsclsFeeGuideList[0].editUsclsFeeGuide },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'showAction': this.UsclsFeeGuideList[0].deleteUsclsFeeGuide }
      ]
      var url = FeeGuideApi.searchUsclsFeeGuideProcedureFeeUrl;
      var tableId = "searchUSclsFeeGuideTable"
      if (!$.fn.dataTable.isDataTable('#searchUSclsFeeGuideTable')) {

        this.dataTableService.jqueryDataTableForUSCLS(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', 2, [0, 'asc'], '', reqParam, tableActions, 3, undefined, "addProc", '', [2], 1)
      } else {

        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');
    } else {
      this.validateAllFormFields(this.searchFeeGuideForm);
    }
  }

  resetSearchForm() {
    this.searchFeeGuideForm.patchValue({ year: "", effectiveDate: "" });
    this.searchFeeGuideForm.controls['year'].clearValidators();
    this.effectiveDate = [];
    this.searchFeeGuideForm.controls['year'].updateValueAndValidity()
    this.searchFeeGuideForm.controls['effectiveDate'].clearValidators();
    this.searchFeeGuideForm.controls['effectiveDate'].updateValueAndValidity()
    this.showSearchTable = true
    this.dataTableService.resetTableSearch();
  }


  onSelect(item: any, value) {
    if (value == 'procCode') {
      this.procedureCodeSelected = []
      for (var j = 0; j < this.procCode.length; j++) {
        this.procedureCodeSelected.push(+this.procCode[j]['id'])
      }
      this.updateFeeGuide.controls[value].setValue("valueselected");
    }
    if (value == 'procedureCode') {
      this.addProcCode.controls[value].setValue(item.id);
    }
  }

  onDeselect(item: any, value) {
    if (value == 'procCode') {
      this.procedureCodeSelected = []
      if (this.procedureCodeSelected.length > 0) {
        this.updateFeeGuide.controls[value].setValue("valueselected");
      } else {
        this.updateFeeGuide.controls[value].setValue("");
      }
    }
    if (value == 'procedureCode') {
      this.addProcCode.controls[value].setValue('');
    }
  }

  onRadioButtonsChange() {
    var ControlName = this.updateFeeGuide.controls.lab.value
    if (ControlName && ControlName == 'labPert') {
      var value = this.updateFeeGuide.controls.labAmount.value
      if (value > 100) {
        this.updateFeeGuide.patchValue({ 'labAmount': '' })
        this.toastrService.warning(this.translate.instant('feeGuide.toaster.labAmtCantGreater'))
      }
    }
  }

  onFeeRadioButtonsChange() {
    var ControlName = this.updateFeeGuide.controls.fee.value
    if (ControlName && ControlName == 'feePerc') {
      var value = this.updateFeeGuide.controls.feeAmount.value
      if (value > 100) {
        this.updateFeeGuide.patchValue({ 'feeAmount': '' })
        this.toastrService.warning(this.translate.instant('feeGuide.toaster.labAmtCantGreater'))
      }
    }
  }

  addUpdateProcCodeDetails() {
    if (this.addProcCode.valid) {
      var dentalProcedureFeeKey
      var msg
      var errorMsg
      if (this.usclsAddMode) {
        dentalProcedureFeeKey = ''
        msg = 'Uscls Procedure Code Added Successfully!';
        errorMsg = 'Uscls Procedure Code Not Added Successfully!';
      }
      else {
        dentalProcedureFeeKey = this.dentalProcedureFeeKey
        msg = 'Uscls Procedure Code Updated Successfully!';
        errorMsg = 'Uscls Procedure Code Not Updated Successfully!'
      }
      let submitData = {
        "dentalProcedureFeeKey": dentalProcedureFeeKey,
        "dentFeeGuideKey": +this.existingDate.dentFeeGuideKey,
        "dentalProcedureFeeAmt": this.addProcCode.value.amount,
        "dentalProcedureKey": +this.addProcCode.value.procedureCode,
        "effectiveOn": this.selectedEffectiveDate,
        "labInd": this.addProcCode.value.labInc == 'y' ? 'T' : ''
      }
      this.hmsDataService.postApi(FeeGuideApi.saveOrUpdateUsclsProcedureFeeWithLabIndUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.reloadTable = true;
          this.hmsDataService.OpenCloseModal('fguscls_addProCode_close');
          this.resetProcCode();
          this.toastrService.success(msg);
          this.getFeeGuideList();
        }
        else if (data.code == 400 && data.status === "BAD_REQ") {
          this.toastrService.error(errorMsg);
        }
        else if (data.code == 400 && data.status === "BAD_REQUEST") {
          this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeExistAlready'))
        }
      });
    }
    else {
      this.validateAllFormFields(this.addProcCode);
    }
  }

  getEffectiveDate(feeGuideKey) {
    this.selectedEffectiveDate = this.existingDate.effectiveOn;
  }

  getSelectedFeeGuide(feeGuideKey) {
    this.existingDate = this.effectiveDate.find(s => s.effectiveOn == feeGuideKey)
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

  resetProcCodeForm() {
    this.addProcCode.reset();
    this.usclsAddMode = true;
    this.usclsEditMode = false;
  }

  closeForm() {
    this.usclsEditMode = false;
  }

  updateFeeGuideDetails() {
    if (this.updateFeeGuide.valid) {
      var feeAmountRadioButtonValue
      var LabAmountRadioButtonValue
      if (this.updateFeeGuide.value.fee == 'feeFlat') {
        feeAmountRadioButtonValue = 'F';
      }
      else if (this.updateFeeGuide.value.fee == 'feePerc') {
        feeAmountRadioButtonValue = 'P';
      }
      if (this.updateFeeGuide.value.lab == 'labFlat') {
        LabAmountRadioButtonValue = 'F';
      }
      else if (this.updateFeeGuide.value.lab == 'labPert') {
        LabAmountRadioButtonValue = 'P';
      }
      let existingDate = this.getSelectedFeeGuide(this.selectedEffectiveDate)
      let submitData = {
        "dentFeeGuideKey": +this.existingDate.dentFeeGuideKey,
        "dentalProcedureKeys": this.procedureCodeSelected,
        "dentalProcedureFeeAmt": this.updateFeeGuide.value.feeAmount,
        "dentalProcedureLabFeeAmt": this.updateFeeGuide.value.labAmount,
        "feeFlat": feeAmountRadioButtonValue,
        "labFlat": LabAmountRadioButtonValue,
        "effectiveOn": this.selectedEffectiveDate,
        "expiredOn": ""
      }
      this.hmsDataService.postApi(FeeGuideApi.updateMultiProcedureCodeUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.updateUsclsFeeGuideDetails = data.result;
          this.getFeeGuideList()
          this.toastrService.success(this.translate.instant('feeGuide.toaster.usclsFeeGuideUpdateSuccess'));
          this.hmsDataService.OpenCloseModal('fguscls_updateFeeGuide_close');
          this.updateFeeGuide.reset();
          this.updateFeeGuide.patchValue({ 'fee': 'feeFlat' })
          this.updateFeeGuide.patchValue({ 'lab': 'labFlat' })
        } if (data.code == 400 && data.status === "BAD_REQ") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.usclsFeeGuideNotUpdated'));
        }
      });
    }
    else {
      this.validateAllFormFields(this.updateFeeGuide);
    }
  }

  resetUpdateForm() {
    this.updateFeeGuide.reset();
    this.procedureCodeSelected = []
    this.procCode = [];
    this.updateColumnProcedures = []
    this.updateFeeGuide.patchValue({ 'fee': 'feeFlat' })
    this.updateFeeGuide.patchValue({ 'lab': 'labFlat' })
  }

  getCurrentYear() {
    var date = new Date();
    return {
      date: {
        year: date.getFullYear()
      }
    };
  }

  getYearList1() {
    this.hmsDataService.getApi(FeeGuideApi.yearListUrl).subscribe(async data => {
      if (data.code == 200 && data.status === "OK") {
        this.yearList1 = data.result;
      }
    })
  }

  addFeeGuideDetails() {
    this.selectedYear = ''
    if (this.newFeeGuide.valid) {
      let feeGuideArray = [+this.newFeeGuide.value.copyEffectiveDate]
      var requestedData = {
        "feeGuide": feeGuideArray,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.newFeeGuide.value.neweffectiveDate),
      }
      this.hmsDataService.postApi(FeeGuideApi.saveUsclsFeeGuideUrl, requestedData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.toastrService.success(this.translate.instant('feeGuide.toaster.feeGuideAddSuccess'));
          this.hmsDataService.OpenCloseModal('fguscls_createNewFeeGuide_close');
          this.newFeeGuide.reset()
          this.newFeeGuide.controls['neweffectiveDate'].setValue("");
          this.newFeeGuide.controls['copyEffectiveDate'].setValue("");
          this.resetSearchForm();
          this.getYearList();
          this.feeGuideAdded = true;  // Task 386(To get if new entry added)
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "ANOTHER_FEE_GUIDE_WITH_SAME_EFFECCTICE_DATE_ALREADY_EXISTS") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideWithEffDateExist'))
        }
        else if (data.code == 400 && data.status === "BAD_REQ") {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.feeGuideNotAdded'));
        }
      });
    } else {
      this.validateAllFormFields(this.newFeeGuide);
    }
  }

  resetNewFeeGuideForm() {
    this.newFeeGuide.reset();
    this.newFeeGuide.patchValue({ 'createFeeGuideRadioButton': 'copyPreviousFeeGuide' });
    this.newFeeGuide.controls['neweffectiveDate'].setValue("");
    this.newFeeGuide.controls['copyEffectiveDate'].setValue("");
    // scenario :- Task 385 below 2 for Effective date field used to show wrong dates and validation when search fee guide and open create new and close pop-up, is now resolved.
    this.effectiveDate = this.datesList
    this.searchFeeGuideForm.controls['effectiveDate'].setValue(this.selectedEffectiveDate)
  }

  selectedYearList(yearValue) {
    if (event) {
      this.selectedYear = yearValue
    }
    this.feeGuideService.getDateList(yearValue).then(res => {
      this.effectiveDate = this.feeGuideService.effectiveDate
      if (this.effectiveDate.length == 1) {
        this.searchFeeGuideForm.controls['effectiveDate'].setValue(this.effectiveDate[0].effectiveOn);
      } else {
        this.searchFeeGuideForm.controls['effectiveDate'].setValue('');
      }
    })
  }

  selectedYearList1(event) {
    if (event) {
      this.selectedYear = event.target.value
    }
    this.feeGuideService.getDateList(this.selectedYear).then(res => {
      this.effectiveDate = this.feeGuideService.effectiveDate
      if (this.effectiveDate.length == 1) {
        this.searchFeeGuideForm.controls['effectiveDate'].setValue(this.effectiveDate[0].effectiveOn);
      } else {
        this.searchFeeGuideForm.controls['effectiveDate'].setValue('');
      }
    })
  }

  selectCategory() {
    if (this.newFeeGuide.controls['createFeeGuideRadioButton'].value == 'copyPreviousFeeGuide') {
      this.newFeeGuide.controls['year'].setValidators([Validators.required]);
      this.newFeeGuide.controls['year'].updateValueAndValidity()
      this.newFeeGuide.controls['copyEffectiveDate'].setValidators([Validators.required]);
      this.newFeeGuide.controls['copyEffectiveDate'].updateValueAndValidity()
    }
    else {
      this.newFeeGuide.controls['year'].clearValidators();
      this.newFeeGuide.controls['year'].updateValueAndValidity()
      this.newFeeGuide.controls['copyEffectiveDate'].clearValidators();
      this.newFeeGuide.controls['copyEffectiveDate'].updateValueAndValidity()
    }
  }

  addFeeGuide() {
    this.newFeeGuide.patchValue({ 'createFeeGuideRadioButton': 'copyPreviousFeeGuide' });
    this.newFeeGuide.patchValue({ 'year': this.currentYear.date.year.toString() });
    this.patchedYear = this.currentYear.date.year.toString();
    this.patchedYearListValue(this.patchedYear);
    // scenario :- Task 385 Effective date field used to show wrong dates and validation when search fee guide and open create new and close pop-up, is now resolved.
    this.datesList = this.effectiveDate
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.newFeeGuide.patchValue(datePickerValue);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      };
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.newFeeGuide.patchValue(datePickerValue);
    }
  }

  patchedYearListValue(patchedYear) {
    let promise = new Promise((resolve, reject) => {
      let submitData = {
        'effectiveOn': patchedYear
      }
      this.hmsDataService.postApi(FeeGuideApi.getUsclsFeeGuideList, submitData).subscribe(async data => {
        if (data.code == 200 && data.status === "OK") {
          this.effectiveDate = data.result
          if (this.effectiveDate.length == 1) {
            this.newFeeGuide.controls['effectiveDate'].setValue(this.effectiveDate[0].effectiveOn);
          }
          else {
            this.searchFeeGuideForm.controls['effectiveDate'].setValue('');
          }
          resolve();
          return this.effectiveDate
        } else {
          resolve();
          return this.effectiveDate = []
        }
      })
    })
    return promise;
  }

  selectedYearLists(patchedYear) {
    this.patchedYearListValue(patchedYear).then(res => {
      this.effectiveDate = this.feeGuideService.effectiveDate
      if (this.effectiveDate.length == 1) {
        this.searchFeeGuideForm.controls['effectiveDate'].setValue(this.effectiveDate[0].effectiveOn);
      } else {
        this.searchFeeGuideForm.controls['effectiveDate'].setValue('');
      }
    })
  }

  updateProcedure() {
    var RequestedData = {
      "start": this.procedureStart,
      "length": 13
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalProcedureListUrl, RequestedData).subscribe(data => {
      for (var i = 0; i < data.result.length; i++) {
        this.columnProcedures.push({ 'id': data.result[i].dentalProcedureKey, 'itemName': data.result[i].dentalProcedureId })
      }
    })
    this.procedureStart = this.procedureStart + 1
  }

  getFeeGuideProcedureCodeDetails(dentalProcedureFeeKey) {
    let RequestedData = {
      "dentalProcedureFeeKey": dentalProcedureFeeKey
    }
    this.hmsDataService.postApi(FeeGuideApi.getFeeGuideProcedureCodeDetailsUrl, RequestedData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.procedureCodeData = data.result;
        this.fillUsclsProcedureCodeDetails(this.procedureCodeData, dentalProcedureFeeKey)
      }
    });
  }

  enableUsclsViewMode(dentalProcedureFeeKey) {
    this.addProcCode.disable();
    this.usclsViewMode = true;
    this.usclsAddMode = false;
    this.USCLSAddprocedureCodeViewMode = true;
    this.addProcMode = "View Proc. Code";
    this.getFeeGuideProcedureCodeDetails(dentalProcedureFeeKey)
  }

  enableUsclsEditMode(dentalProcedureFeeKey) {
    this.addProcCode.enable();
    this.USCLSAddprocedureCodeViewMode = false;
    this.usclsAddMode = false;
    this.usclsEditMode = true;
    this.addProcMode = "Edit Proc. Code";
    this.getFeeGuideProcedureCodeDetails(dentalProcedureFeeKey);
  }

  fillUsclsProcedureCodeDetails(procedureCodeData, dentalProcedureFeeKey) {
    this.procedureCode = [{ 'id': procedureCodeData.dentalProcedureKey, 'itemName': procedureCodeData.dentalProcedureId }]
    this.addProcCode.patchValue({
      procedureCode: procedureCodeData.dentalProcedureKey,
      amount: procedureCodeData.dentalProcedureFeeAmt ? this.currentUserService.convertAmountToDecimalWithoutDoller(procedureCodeData.dentalProcedureFeeAmt) : this.currentUserService.convertAmountToDecimalWithoutDoller(0),
      labInc: procedureCodeData.labInd == 'F' ? 'n' : 'y',
      addProcCodeEffectiveDate: procedureCodeData.dentFeeGuideKey,
      dentalProcedureFeeKey: dentalProcedureFeeKey,
    });
    this.addProcCode.patchValue({
      'year': this.searchFeeGuideForm.value.year,
      'addProcCodeEffectiveDate': procedureCodeData.dentFeeGuideKey
    })
    this.addProcCode.controls['year'].disable()
    this.addProcCode.controls['addProcCodeEffectiveDate'].disable()
  }

  deleteUsclsProcedureCode(dentalProcedureFeeKey) {
    var action = "Delete";
    this.exDialog.openConfirm((this.translate.instant('card.exDialog.are-you-sure')) + ' ' + action + ' ' + (this.translate.instant('card.exDialog.record')))
      .subscribe((value) => {
        if (value) {
          var requestedData = {
            "dentalProcedureFeeKey": dentalProcedureFeeKey,
          }
          this.hmsDataService.postApi(FeeGuideApi.deleteUsclsProcedureFeeWithLabIndUrl, requestedData).subscribe(data => {
            if (data.code == 202 && data.status === "ACCEPTED") {
              this.toastrService.success(this.translate.instant('feeGuide.toaster.procCodeDeletedSuccess'));
              this.reloadTable = true;
              this.getUsclsFeeGuideByGridFilteration("searchUSclsFeeGuideTable")
            } if (data.code == 400 && data.status === "BAD_REQ") {
              this.toastrService.error(this.translate.instant('feeGuide.toaster.procCodeNotDelete'));
            }
          });
        }
      });
  }

  // Search Listing 
  getUsclsFeeGuideByGridFilteration(tableId: string) {
    var appendExtraParam = { 'key': 'year', 'value': this.searchFeeGuideForm.value.year }
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var URL = FeeGuideApi.searchUsclsFeeGuideProcedureFeeOnColumnUrl;    ///  will be use api 
    var effectiveDate = { 'key': 'effectiveOn', 'value': this.searchFeeGuideForm.value.effectiveDate }
    params.push(effectiveDate)
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  // Reset Listing 
  resetTableSearch() {
    this.dataTableService.resetTableSearch();
    this.getUsclsFeeGuideByGridFilteration("searchUSclsFeeGuideTable");
    $('#searchUSclsFeeGuideTable .icon-mydpremove').trigger('click');
  }

  resetProcCode() {
    this.addProcCode.reset();
    this.addProcCode.enable();
    this.addProcCode.controls['year'].disable()
    this.addProcCode.patchValue({ 'year': this.searchFeeGuideForm.value.year })
    let existingDate = this.getSelectedFeeGuide(this.selectedEffectiveDate)
    this.addProcMode = "Add Proc. Code"
    if (this.existingDate) {
      this.addProcCode.controls['addProcCodeEffectiveDate'].disable()
      this.addProcCode.patchValue({
        'addProcCodeEffectiveDate': this.existingDate.dentFeeGuideKey,
        "labInc": ""

      })
    } else {
      this.addProcCode.controls['addProcCodeEffectiveDate'].enable()
    }

    this.selectedEffectiveDate = this.searchFeeGuideForm.value.effectiveDate
    this.procedureCode = [];
    this.usclsAddMode = true;
    this.usclsEditMode = false;
    this.usclsViewMode = false;
    this.USCLSAddprocedureCodeViewMode = false
  }

  updateFeeGuideReset() {
    this.procedureListStart = 0;
    if (this.existingDate) {
      var RequestedData = {
        "start": this.procedureListStart,
        "length": 13,
        "dentFeeGuideKey": +this.existingDate.dentFeeGuideKey,
      }
      this.hmsDataService.postApi(FeeGuideApi.getDentalProcedureFeeListByFeeGuideKeyScrollUrl, RequestedData).subscribe(data => {

        if (data.code == 200 && data.status === "OK") {
          for (var i = 0; i < data.result.length; i++) {
            this.updateColumnProcedures.push({ 'id': data.result[i].dentalProcedureKey, 'itemName': data.result[i].dentalProcedureId })
          }
          this.updateFeeGuide.controls['yearUpdate'].disable()
          this.updateFeeGuide.patchValue({ 'yearUpdate': this.searchFeeGuideForm.value.year })
          this.updateFeeGuide.controls['effectiveDateUpdate'].disable()
          this.updateFeeGuide.patchValue({ 'effectiveDateUpdate': this.existingDate.dentFeeGuideKey })

        }
      })
      this.procedureListStart = this.procedureListStart + 1
    }
  }


  onSelectAll(items: any, type) {
    if (type == 'procCode') {
      this.procedureCodeSelected = []

      for (var i = 0; i < this.procCode.length; i++) {
        this.procedureCodeSelected.push(this.procCode[i]['id'])
      }
      this.updateFeeGuide.controls[type].setValue(this.procedureCodeSelected);
    }
  }

  onDeSelectAll(items: any, type) {
    this.procedureCodeSelected = []
  }

  onYearSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedYear = (selected.originalObject.year).toString();
      this.selectedYearList(this.selectedYear);
    }
    else {
      this.selectedYear = '';
    }
  }

  keyDownFunction(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getUsclsFeeGuideByGridFilteration(tableId);
    }
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  isNumberKey(event) {
    return (event.ctrlKey || event.altKey
      || (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false)
      || (95 < event.keyCode && event.keyCode < 106)
      || (event.keyCode == 8) || (event.keyCode == 9)
      || (event.keyCode > 34 && event.keyCode < 40)
      || (event.keyCode == 46)
      || (event.keyCode == 110))
  }

  addDecimal(event, controlName) {
    if (event.target.value) {
      if (event.target.value.indexOf(".") == -1) {
        this.addProcCode.controls[controlName].patchValue(event.target.value + '.00');
      }
    }
  }

  // Task 386 To bring newly added fee guide year appear in list in USCLS fee guide section
  searchFeeGuideYearOnFocus() {
    if (this.feeGuideAdded) {
      this.searchFeeGuideForm.controls.year.patchValue(" ")
      this.yearFieldObservable = Observable.interval(130).subscribe(x => {
        this.searchFeeGuideForm.controls.year.patchValue("")
        this.yearFieldObservable.unsubscribe()
      })
      this.feeGuideAdded = false
    }
  }

}