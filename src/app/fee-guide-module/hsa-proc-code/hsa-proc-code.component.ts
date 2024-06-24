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
  selector: 'app-hsa-proc-code',
  templateUrl: './hsa-proc-code.component.html',
  styleUrls: ['./hsa-proc-code.component.css']
})
export class HsaProcCodeComponent implements OnInit {
  hsaProcedureLongDescL: any;
  hsaProcIdL: any;
  hsaProcedureDescL: any;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  public showLoader: boolean = false
  public hsaProcCode: FormGroup;
  public addHsaProcCodeForm: FormGroup;
  public hsaProcDataRemote: RemoteData;
  public procDescRemote: RemoteData;
  public ObservableClaimObj: any;
  selectedProcDesc: any;
  public checkBan: boolean = true;
  public columns: { title: any; data: string; }[];
  showSearchTable: boolean = false;
  viewMode: boolean = false;
  addMode: boolean = true;
  editMode: boolean = false;
  rowId: any;
  buttonText: string = 'Save';
  getDetails: any;
  hsaServiceKey: any;
  hsaProcCodeCheck = [{
    "searchHsaProcCode": 'F',
    "editHsaProcCode": 'F',
    "viewHsaProcCode": 'F',
    "addHsaProcCode": 'F',
  }]
  currentUser: any;

  constructor(private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private toastrService: ToastrService,
    private renderer: Renderer2,
  ) {
    this.hsaProcDataRemote = completerService.remote(
      null,
      "hsaServiceId",
      "hsaServiceId"
    );
    this.hsaProcDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.hsaProcDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getPredectiveHsaProcCode + `/${term}`;
    });
    this.hsaProcDataRemote.dataField('result');

    this.procDescRemote = completerService.remote(
      null,
      "hsaProcedureLongDesc",
      "hsaProcedureLongDesc"
    );
    this.procDescRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.procDescRemote.urlFormater((term: any) => {
      return FeeGuideApi.predictiveHsaProcedureSearch + `/${term}`;
    });
    this.procDescRemote.dataField('result');
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let hsaProcCodeArray = this.currentUserService.authChecks['HSP']
        this.getAuthCheck(hsaProcCodeArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let hsaProcCodeArray = this.currentUserService.authChecks['HSP']
        this.getAuthCheck(hsaProcCodeArray)
        this.dataTableInitialize();
      })
    }

    this.hsaProcCode = this.fb.group({
      procId: [''],
      hsaProcDesc: ['']
    })
    this.addHsaProcCodeForm = this.fb.group({
      hsaService: ['', Validators.required],
      procId: ['', [Validators.required, Validators.maxLength(5)]],
      descLong: ['', CustomValidators.notEmpty],
      descShort: ['', [Validators.maxLength(70), CustomValidators.notEmpty]],
      hsaProcedureKey: ['']
    })
    this.renderer.selectRootElement('#hsa_procId').focus();
    var self = this
    $(document).on("click", "table#hsaProcedureCode .view-ico", function () {
      self.rowId = $(this).data('id')
      self.enableProcedureViewMode(self.rowId);
    })

    $(document).on("click", "table#hsaProcedureCode .edit-ico", function () {
      self.rowId = $(this).data('id')
      self.enableEditView(self.rowId);
    })

    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', self.translate.instant('common.edit'));
    })

    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', self.translate.instant('common.view'));
    })

    $(document).on('keydown', '#hsaProcedureCode .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
  }

  dataTableInitialize() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.proc-id'), data: 'hsaProcedureId' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-short'), data: 'hsaProcedureDesc' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-long'), data: 'hsaProcedureLongDesc' },
          { title: this.translate.instant('common.action'), data: 'hsaProcedureKey' }]
        this.checkBan = false;
        this.ObservableClaimObj.unsubscribe();
      }
    });
  }

  getHsaProc() {
    this.showSearchTable = true
    var hasSurfaceId;
    this.hsaProcedureDescL = ''
    var reqParam = [
      { 'key': 'hsaProcedureId', 'value': this.hsaProcCode.value.procId },
      { 'key': 'hsaProcedureLongDesc', 'value': this.hsaProcCode.value.hsaProcDesc }
    ]
    this.hsaProcIdL = this.hsaProcCode.value.procId
    this.hsaProcedureLongDescL = this.hsaProcCode.value.hsaProcDesc

    var tableActions =
      [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.hsaProcCodeCheck[0].viewHsaProcCode },
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': this.hsaProcCodeCheck[0].editHsaProcCode }
      ];
    var url = FeeGuideApi.searchHsaProcedureByFilter;
    var tableId = "hsaProcedureCode"
    if (!$.fn.dataTable.isDataTable('#hsaProcedureCode')) {
      this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 3, '', "addHSAProcCode", null, null, null, 0)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  resetVissionProc() {
    this.hsaProcCode.reset();
    this.showSearchTable = false
  }

  getProcCodeListByGridFilteration(tableId) {
    this.showSearchTable = true
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var url = FeeGuideApi.searchHsaProcedureByFilter;
    this.dataTableService.jqueryDataTableReload(tableId, url, params)
  }

  enableAddMode() {
    this.addHsaProcCodeForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    this.buttonText = 'Save'
    var self = this;
    setTimeout(function () {
      self.renderer.selectRootElement('#hsapc_service').focus();
    }, 1000);
  }

  enableProcedureViewMode(rowId) {
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
    this.editProcedure(rowId).then(res => {
      this.addHsaProcCodeForm.disable();
      this.fillProcedureCodeDetails(this.getDetails);
    })
  }

  enableEditView(rowId) {
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.buttonText = "Update";
    this.editProcedure(rowId).then(res => {
      this.addHsaProcCodeForm.enable();
      this.fillProcedureCodeDetails(this.getDetails);
    })
  }

  resetaddProCodeOnClose() {
    this.addHsaProcCodeForm.reset();
    this.renderer.selectRootElement('#hsa_procId').focus();
  }

  onSelect(selected: CompleterItem) {
    if (selected) {
      this.hsaServiceKey = selected.originalObject.hsaServiceKey
    } else {

    }
  }

  saveProcedureCode() {
    if (this.addHsaProcCodeForm.valid) {
      let RequestedData = {
        "hsaServiceKey": this.hsaServiceKey,
        "hsaProcedureId": this.addHsaProcCodeForm.value.procId,
        "hsaProcedureDesc": this.addHsaProcCodeForm.value.descShort,
        "hsaProcedureLongDesc": this.addHsaProcCodeForm.value.descLong,
      }
      let url = ""
      if (this.addMode) {
        url = FeeGuideApi.saveHsaProcCode
      }
      if (this.editMode) {
        url = FeeGuideApi.updateHsaProcCode
        RequestedData['hsaProcedureKey'] = this.rowId;
      }

      this.hmsDataService.postApi(url, RequestedData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addMode) {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.hsaProcCodeAddSuccess'))
            this.resetaddProCodeOnClose()
            this.hmsDataService.OpenCloseModal("vpca_close");
            if (this.showSearchTable) {
              this.getProcCodeListByGridFilteration('hsaProcedureCode')
            }
          }
          if (this.editMode) {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.hsaProcCodeUpdateSuccess'))
            this.resetaddProCodeOnClose()
            this.hmsDataService.OpenCloseModal("vpca_close");
            this.getProcCodeListByGridFilteration('hsaProcedureCode')
          }
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
          this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'))
        }
        else {
          if (this.addMode) {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.hsaProcCodeNotAdded'))
          }
          if (this.editMode) {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.hsaProcCodeNotUpdated'))
          }
          this.resetaddProCodeOnClose()
        }
      })
    } else {
      this.validateAllFormFields(this.addHsaProcCodeForm);
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

  editProcedure(rowId) {
    let submitData = {
      "hsaProcedureKey": rowId
    }
    let promise = new Promise((resolve, reject) => {
      this.hmsDataService.postApi(FeeGuideApi.getHsaProcedure, submitData).subscribe(data => {
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

  fillProcedureCodeDetails(getDetails) {
    this.addHsaProcCodeForm.patchValue({
      procId: getDetails.hsaProcedureId,
      descLong: getDetails.hsaProcedureLongDesc,
      descShort: getDetails.hsaProcedureDesc,
      hsaService: getDetails.hsaServiceId
    });
  }

  onProcDescSelect(selected: CompleterItem) {
    if (selected) {
      this.selectedProcDesc = selected.originalObject.hsaProcedureDesc;
    } else { }
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getProcCodeListByGridFilteration(tableId);
    }
  }

  getAuthCheck(hsaProcCodeArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.hsaProcCodeCheck = [{
        "searchHsaProcCode": 'T',
        "editHsaProcCode": 'T',
        "viewHsaProcCode": 'T',
        "addHsaProcCode": 'T',
      }]
    } else {
      for (var i = 0; i < hsaProcCodeArray.length; i++) {
        userAuthCheck[hsaProcCodeArray[i].actionObjectDataTag] = hsaProcCodeArray[i].actionAccess
      }
      this.hsaProcCodeCheck = [{
        "searchHsaProcCode": userAuthCheck['HSP271'],
        "editHsaProcCode": userAuthCheck['SHS272'],
        "viewHsaProcCode": userAuthCheck['HSP274'],
        "addHsaProcCode": userAuthCheck['SHS273'],
      }]
    }
    return this.hsaProcCodeCheck
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
      || (event.keyCode > 64 && event.keyCode < 91)
      || (event.keyCode == 46))
  }

  isEnterKey(event) {
    this.getHsaProc();
  }

}