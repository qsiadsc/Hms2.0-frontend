import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { Observable } from 'rxjs/Rx';
import { FeeGuideApi } from '../fee-guide-api';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-health-proc-code',
  templateUrl: './health-proc-code.component.html',
  styleUrls: ['./health-proc-code.component.css']
})

export class HealthProcCodeComponent implements OnInit {
  healthServiceIdL: string;
  shortDescL: string;
  healthProcedureLongDescL: any;
  healthProcedureUseSurfaceIL: any;
  healthProcedureUnitCountL: any;
  healthProcIdL: any;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public showLoader: boolean = false;
  showSearchTable: boolean = false;
  selectedProcDesc: any;
  ObservableClaimObj: any;
  public checkBan: boolean = true;
  viewMode: boolean = false;
  addMode: boolean = true;
  editMode: boolean = false;
  public columns: { title: any; data: string; }[];
  public healthProcCode: FormGroup;
  public addHealthProcCodeForm: FormGroup;
  public healthProcDataRemote: RemoteData;
  public procDescRemote: RemoteData;
  healthServiceKey: any;
  rowId: any;
  getDetails: any;
  buttonText: string = "Save";
  healthProcCodeCheck = [{
    "searchHealthProcCode": 'F',
    "editHealthProcCode": 'F',
    "viewHealthProcCode": 'F',
    "addHealthProcCode": 'F',
  }]
  currentUser: any;

  constructor(
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private toastrService: ToastrService,
    private renderer: Renderer2
  ) {
    this.healthProcDataRemote = completerService.remote(
      null,
      "healthServiceId",
      "healthServiceId"
    );
    this.healthProcDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.healthProcDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getPredectiveHealthProcCode + `/${term}`;
    });
    this.healthProcDataRemote.dataField('result');

    this.procDescRemote = completerService.remote(
      null,
      "healthProcedureLongDesc",
      "healthProcedureLongDesc"
    );
    this.procDescRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.procDescRemote.urlFormater((term: any) => {
      return FeeGuideApi.predictiveHealthProcedureSearch + `/${term}`;
    });
    this.procDescRemote.dataField('result');
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let DentalServiceArray = this.currentUserService.authChecks['HPC']
        this.getAuthCheck(DentalServiceArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let DentalServiceArray = this.currentUserService.authChecks['HPC']
        this.getAuthCheck(DentalServiceArray)
        this.dataTableInitialize();
      })
    }

    this.healthProcCode = this.fb.group({
      procId: [''],
      healthProcDesc: ['']
    })

    this.addHealthProcCodeForm = this.fb.group({
      healthService: ['', Validators.required],
      procId: ['', [Validators.required, Validators.maxLength(5)]],
      descLong: ['', CustomValidators.notEmpty],
      descShort: ['', [Validators.maxLength(70), CustomValidators.notEmpty]],
      healthProcedureKey: ['']
    })

    this.renderer.selectRootElement('#hpca_procId').focus();
    var self = this
    $(document).on("click", "table#healthProcedureCode .view-ico", function () {
      self.rowId = $(this).data('id')
      self.enableProcedureViewMode(self.rowId);
    })

    $(document).on("click", "table#healthProcedureCode .edit-ico", function () {
      self.rowId = $(this).data('id')
      self.enableEditView(self.rowId);
    })

    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', self.translate.instant('common.edit'));
    })

    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', self.translate.instant('common.view'));
    })

    $(document).on('keydown', '#healthProcedureCode .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
  }

  dataTableInitialize() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.serviceId'), data: 'healthServiceId' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.proc-id'), data: 'healthProcedureId' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-short'), data: 'healthProcedureDesc' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-long'), data: 'healthProcedureLongDesc' },
          { title: this.translate.instant('common.action'), data: 'healthProcedureKey' }]
        this.checkBan = false;
        this.ObservableClaimObj.unsubscribe();
      }
    });
  }

  getHealthProc() {
    this.showSearchTable = true
    var hasSurfaceId;
    this.healthServiceIdL = ''
    this.shortDescL = ''
    if (this.healthProcCode.value.useSurface == true) {
      hasSurfaceId = 'T'
    } else {
      hasSurfaceId = ''
    }
    var reqParam = [
      { 'key': 'healthProcedureId', 'value': this.healthProcCode.value.procId },
      { 'key': 'healthProcedureUnitCount', 'value': this.healthProcCode.value.unitCount },
      { 'key': 'healthProcedureUseSurfaceI', 'value': hasSurfaceId },
      { 'key': 'healthProcedureLongDesc', 'value': this.healthProcCode.value.healthProcDesc }
    ]

    this.healthProcIdL = this.healthProcCode.value.procId
    this.healthProcedureUnitCountL = this.healthProcCode.value.unitCount
    this.healthProcedureUseSurfaceIL = (hasSurfaceId) ? "T" : "F"
    this.healthProcedureLongDescL = this.healthProcCode.value.healthProcDesc

    var tableActions =
      [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.healthProcCodeCheck[0].viewHealthProcCode },
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': this.healthProcCodeCheck[0].editHealthProcCode }
      ];
    var url = FeeGuideApi.searchHealthProcedureByFilter;
    var tableId = "healthProcedureCode"
    if (!$.fn.dataTable.isDataTable('#healthProcedureCode')) {
      this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4, null, "addHealthProcCode", null, null, null, [0, 1], [2, 3, 4], '', [0], [1, 2, 3, 4])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  enableAddMode() {
    this.addHealthProcCodeForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    this.buttonText = "Save"
    var self = this;
    setTimeout(function () {
      self.renderer.selectRootElement('#hpca_healthService').focus();
    }, 1000);
  }

  enableProcedureViewMode(rowId) {
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
    this.editProcedure(rowId).then(res => {
      this.addHealthProcCodeForm.disable();
      this.fillProcedureCodeDetails(this.getDetails);
    })
  }

  enableEditView(rowId) {
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.buttonText = "Update";
    this.editProcedure(rowId).then(res => {
      this.addHealthProcCodeForm.enable();
      this.fillProcedureCodeDetails(this.getDetails);
    })
  }

  onSelect(selected: CompleterItem) {
    if (selected) {
      this.healthServiceKey = selected.originalObject.healthServiceKey
    } else {

    }
  }

  saveProcedureCode() {
    if (this.addHealthProcCodeForm.valid) {
      let halthProcedureUseSurfaceI = this.addHealthProcCodeForm.value.useSurface ? 'T' : 'F'
      let RequestedData = {
        "healthServiceKey": this.healthServiceKey,
        "healthProcedureId": this.addHealthProcCodeForm.value.procId,
        "healthProcedureDesc": this.addHealthProcCodeForm.value.descShort,
        "healthProcedureUnitCount": this.addHealthProcCodeForm.value.unitCount,
        "healthProcedureLongDesc": this.addHealthProcCodeForm.value.descLong,
        "healthProcedureUseSurfaceI": halthProcedureUseSurfaceI
      }
      let url = ""
      let message = ""
      if (this.addMode) {
        url = FeeGuideApi.saveHealthProcCode
      }
      if (this.editMode) {
        url = FeeGuideApi.updateHealthProcCode
        RequestedData['healthProcedureKey'] = this.rowId;
      }
      this.hmsDataService.postApi(url, RequestedData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addMode) {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.healthProcCodeSuccess'))
            this.resetaddProCodeOnClose()
            this.hmsDataService.OpenCloseModal("hpca_close");
            if (this.showSearchTable) {
              this.getHealthProcCodeListByGridFilteration('healthProcedureCode')
            }
          }
          if (this.editMode) {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.healthProcCodeUpdateSuccess'))
            this.resetaddProCodeOnClose()
            this.hmsDataService.OpenCloseModal("hpca_close");
            this.getHealthProcCodeListByGridFilteration('healthProcedureCode')
          }
        } else if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
          this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'))
        }
        else {
          if (this.addMode) {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.healthProcCodeNotAdded'))
          }
          if (this.editMode) {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.healthProcCodeNotUpdated'))
          }
          this.resetaddProCodeOnClose()
        }
      })
    } else {
      this.validateAllFormFields(this.addHealthProcCodeForm);
    }
  }

  fillProcedureCodeDetails(getDetails) {
    this.addHealthProcCodeForm.patchValue({
      procId: getDetails.healthProcedureId,
      descLong: getDetails.healthProcedureLongDesc,
      descShort: getDetails.healthProcedureDesc,
      healthService: getDetails.healthServiceId
    });
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

  resetHealthProc() {
    this.healthProcCode.reset();
    this.healthProcedureLongDescL = ''
    this.healthProcedureUnitCountL = ''
    this.healthProcedureUseSurfaceIL = ''
    this.healthProcIdL = ''
    this.showSearchTable = false
  }

  resetaddProCodeOnClose() {
    this.addHealthProcCodeForm.reset();
    this.renderer.selectRootElement('#hpca_procId').focus();
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.healthProcCode.patchValue(datePickerValue);
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
      this.healthProcCode.patchValue(datePickerValue);
    }
  }

  getHealthProcCodeListByGridFilteration(tableId) {
    this.showSearchTable = true
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var url = FeeGuideApi.searchHealthProcedureByFilter;
    this.dataTableService.jqueryDataTableReload(tableId, url, params)
  }

  resetProcCode() {
    this.healthProcCode.reset();
    this.showSearchTable = false
  }

  editProcedure(rowId) {
    let submitData = {
      "healthProcedureKey": rowId
    }
    let promise = new Promise((resolve, reject) => {
      this.hmsDataService.postApi(FeeGuideApi.getHealthProcedure, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.getDetails = data.result;
          resolve()
        } else {
          resolve()
          return false;
        }
      });
    })
    return promise
  }

  resetHealthProcListingFilter() {
    this.dataTableService.resetTableSearch();
    this.getHealthProcCodeListByGridFilteration("healthProcedureCode")
  }

  onProcDescSelect(selected: CompleterItem) {
    if (selected) {
      this.selectedProcDesc = selected.originalObject.healthProcedureDesc;
    }
    else { }
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getHealthProcCodeListByGridFilteration(tableId);
    }
  }

  getAuthCheck(healthProcCodeArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.healthProcCodeCheck = [{
        "searchHealthProcCode": 'T',
        "editHealthProcCode": 'T',
        "viewHealthProcCode": 'T',
        "addHealthProcCode": 'T',
      }]
    } else {
      for (var i = 0; i < healthProcCodeArray.length; i++) {
        userAuthCheck[healthProcCodeArray[i].actionObjectDataTag] = healthProcCodeArray[i].actionAccess
      }
      this.healthProcCodeCheck = [{
        "searchHealthProcCode": userAuthCheck['HPC264'],
        "editHealthProcCode": userAuthCheck['SHP265'],
        "viewHealthProcCode": userAuthCheck['HPC267'],
        "addHealthProcCode": userAuthCheck['SHP266'],
      }]
    }
    return this.healthProcCodeCheck
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
      || (event.keyCode == 46))
  }

  isEnterKey(event) {
    this.getHealthProc();
  }
}