import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { FeeGuideApi } from '../fee-guide-api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-wellness-proc-code',
  templateUrl: './wellness-proc-code.component.html',
  styleUrls: ['./wellness-proc-code.component.css']
})

export class WellnessProcCodeComponent implements OnInit {
  buttonText: string = "Save";
  rowId: any;
  hasSurfaceL: string;
  selectedProcDesc: any;
  getDetails: any;
  columns: { title: any; data: string; }[];
  ObservableClaimObj: any;
  addWellnessProcCodeForm: any;
  wellnessShortDescL: string;
  wellnessIdL: string;
  wellnessProcIdL: any;
  wellnessProcCode: any;
  wellnessServiceKey: any;
  wellnessProcedureLongDescL: any;
  wellnessProcedureUnitCountL: any;
  viewMode: boolean = false;
  addMode: boolean = true;
  editMode: boolean = false;
  showSearchTable: boolean = false;
  public checkBan: boolean = true;
  public showLoader: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  public wellnessProcDataRemote: RemoteData;
  public procDescRemote: RemoteData;
  currentUser: any
  wellnessProcCodeCheck = [{
    "searchWellnessProcCode": 'F',
    "editWellnessProcCode": 'F',
    "viewWellnessProcCode": 'F',
    "addWellnessProcCode": 'F',
  }]

  constructor(
    private fb: FormBuilder,
    private completerService: CompleterService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private hmsDataService: HmsDataServiceService,
    public dataTableService: DatatableService,
    private renderer: Renderer2,
    private currentUserService: CurrentUserService
  ) {
    this.wellnessProcDataRemote = completerService.remote(
      null,
      "wellnessServiceId",
      "wellnessServiceId"
    );
    this.wellnessProcDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.wellnessProcDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getPredectiveWellnessProcCode + `/${term}`;
    });
    this.wellnessProcDataRemote.dataField('result');

    this.procDescRemote = completerService.remote(
      null,
      "wellnessProcedureLongDesc",
      "wellnessProcedureLongDesc"
    );
    this.procDescRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.procDescRemote.urlFormater((term: any) => {
      return FeeGuideApi.predictiveWellnessProcedureSearch + `/${term}`;
    });
    this.procDescRemote.dataField('result');
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let wellnessProcCodeArray = this.currentUserService.authChecks['WPC']
        this.getAuthCheck(wellnessProcCodeArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let wellnessProcCodeArray = this.currentUserService.authChecks['WPC']
        this.getAuthCheck(wellnessProcCodeArray)
        this.dataTableInitialize();
      })
    }

    this.wellnessProcCode = this.fb.group({
      procId: [''],
      unitCount: ['', CustomValidators.onlyNumbers],
      useSurface: [''],
      wellnessProcDesc: ['']
    })
    this.addWellnessProcCodeForm = this.fb.group({
      wellnessService: ['', Validators.required],
      procId: ['', [Validators.required, Validators.maxLength(5)]],
      descLong: ['', CustomValidators.notEmpty],
      descShort: ['', [Validators.maxLength(70), CustomValidators.notEmpty]],
      wellnessProcedureKey: ['']
    })

    this.renderer.selectRootElement('#wpc_procId').focus();
    var self = this
    $(document).on("click", "table#wellnessProcedureCode .view-ico", function () {
      self.rowId = $(this).data('id')
      self.enableProcedureViewMode(self.rowId);
    })

    $(document).on("click", "table#wellnessProcedureCode .edit-ico", function () {
      self.rowId = $(this).data('id')
      self.enableEditView(self.rowId);
    })

    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', self.translate.instant('common.edit'));
    })

    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', self.translate.instant('common.view'));
    })

    $(document).on('keydown', '#dentalScheduleList .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })

    this.dataTableInitialize();
  }

  dataTableInitialize() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.serviceId'), data: 'wellnessServiceId' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.proc-id'), data: 'wellnessProcedureId' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-short'), data: 'wellnessProcedureDesc' },
          { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-long'), data: 'wellnessProcedureLongDesc' },
          { title: this.translate.instant('common.action'), data: 'wellnessProcedureKey' }]
        this.checkBan = false;
        this.ObservableClaimObj.unsubscribe();
      }
    });
  }

  onSelect(selected: CompleterItem) {
    if (selected) {
      this.wellnessServiceKey = selected.originalObject.wellnessServiceKey
    } else { }
  }

  onProcDescSelect(selected: CompleterItem) {
    if (selected) {
      this.selectedProcDesc = selected.originalObject.wellnessProcedureDesc;
    } else { }
  }

  getWellnessProc() {
    this.showSearchTable = true
    var hasSurfaceId;
    this.wellnessIdL = ''
    this.wellnessShortDescL = ''
    if (this.wellnessProcCode.value.useSurface && this.wellnessProcCode.value.useSurface == true) {
      hasSurfaceId = 'T'
    } else {
      hasSurfaceId = ''
    }
    var reqParam = [
      { 'key': 'wellnessProcedureId', 'value': this.wellnessProcCode.value.procId },
      { 'key': 'wellnessProcedureUnitCount', 'value': this.wellnessProcCode.value.unitCount },
      { 'key': 'wellnessProcedureUseSurfaceI', 'value': hasSurfaceId },
      { 'key': 'wellnessProcedureLongDesc', 'value': this.wellnessProcCode.value.wellnessProcDesc }
    ]
    this.wellnessProcIdL = this.wellnessProcCode.value.procId
    this.hasSurfaceL = hasSurfaceId ? 'T' : 'F'
    this.wellnessProcedureUnitCountL = this.wellnessProcCode.value.unitCount
    this.wellnessProcedureLongDescL = this.wellnessProcCode.value.wellnessProcDesc

    var tableActions =
      [
        {
          'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.wellnessProcCodeCheck[0].viewWellnessProcCode
        },
        {
          'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': this.wellnessProcCodeCheck[0].editWellnessProcCode
        }
      ];
    var url = FeeGuideApi.searchWellnessProcedureByFilter;
    var tableId = "wellnessProcedureCode"
    if (!$.fn.dataTable.isDataTable('#wellnessProcedureCode')) {
      this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4, null, "addWellnessProcCode", 3, null, null, [0, 1], [2, 3], '', [], [])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  saveProcedureCode() {
    if (this.addWellnessProcCodeForm.valid) {
      let wellnessProcedureUseSurfaceI = this.addWellnessProcCodeForm.value.useSurface ? 'T' : 'F'
      let RequestedData = {
        "wellnessServiceKey": this.wellnessServiceKey,
        "wellnessProcedureId": this.addWellnessProcCodeForm.value.procId,
        "wellnessProcedureDesc": this.addWellnessProcCodeForm.value.descShort,
        "wellnessProcedureUnitCount": '',
        "wellnessProcedureLongDesc": this.addWellnessProcCodeForm.value.descLong,
        "wellnessProcedureUseSurfaceI": ''
      }
      let url = ""
      let message = ""
      if (this.addMode) {
        url = FeeGuideApi.saveWellnessProcCode
      }
      if (this.editMode) {
        url = FeeGuideApi.updateWellnessProcCode
        RequestedData['wellnessProcedureKey'] = this.rowId;
      }
      this.hmsDataService.postApi(url, RequestedData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addMode) {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.wellnessprocCodeAddSuccess'))
            this.resetaddProCodeOnClose()
            this.hmsDataService.OpenCloseModal("wpca_close");
            if (this.showSearchTable) {
              this.getProcCodeListByGridFilteration('wellnessProcedureCode')
            }
          }
          if (this.editMode) {
            this.toastrService.success(this.translate.instant('feeGuide.toaster.wellnessProcCodeUpdateSuccess'))
            this.resetaddProCodeOnClose()
            this.hmsDataService.OpenCloseModal("wpca_close");
            this.getProcCodeListByGridFilteration('wellnessProcedureCode')
          }
        } else if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
          this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'))
        }
        else {
          if (this.addMode) {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.wellnessProcCodeNotAdded'))
          }
          if (this.editMode) {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.wellnessProcCodeNotUpdated'))
          }
          this.resetaddProCodeOnClose()
        }
      })
    } else {
      this.validateAllFormFields(this.addWellnessProcCodeForm);
    }
  }

  getProcCodeListByGridFilteration(tableId) {
    this.showSearchTable = true
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var url = FeeGuideApi.searchWellnessProcedureByFilter;
    this.dataTableService.jqueryDataTableReload(tableId, url, params)
  }

  fillProcedureCodeDetails(getDetails) {
    this.addWellnessProcCodeForm.patchValue({
      procId: getDetails.wellnessProcedureId,
      descLong: getDetails.wellnessProcedureLongDesc,
      descShort: getDetails.wellnessProcedureDesc,
      wellnessService: getDetails.wellnessServiceId
    });
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getProcCodeListByGridFilteration(tableId);
    }
  }

  enableAddMode() {
    this.addWellnessProcCodeForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    this.buttonText = "Save"

    var self = this;
    setTimeout(function () {
      self.renderer.selectRootElement('#wpca_wellnessService').focus();
    }, 1000);
  }

  enableProcedureViewMode(rowId) {
    this.addMode = false;
    this.viewMode = true;
    this.editMode = false;
    this.editProcedure(rowId).then(res => {
      this.addWellnessProcCodeForm.disable();
      this.fillProcedureCodeDetails(this.getDetails);
    })
  }

  enableEditView(rowId) {
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.buttonText = "Update";
    this.editProcedure(rowId).then(res => {
      this.addWellnessProcCodeForm.enable();
      this.fillProcedureCodeDetails(this.getDetails);
    })
  }

  editProcedure(rowId) {
    let submitData = {
      "wellnessProcedureKey": rowId
    }
    let promise = new Promise((resolve, reject) => {
      this.hmsDataService.postApi(FeeGuideApi.getWellnessProcedure, submitData).subscribe(data => {
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

  resetProcListingFilter() {
    this.dataTableService.resetTableSearch();
    this.getProcCodeListByGridFilteration("wellnessProcedureCode")
  }

  resetWellnessProc() {
    this.wellnessProcCode.reset();
    this.wellnessProcIdL = ''
    this.wellnessProcedureLongDescL = ''
    this.wellnessProcedureUnitCountL = ''
    this.hasSurfaceL = ''
    this.showSearchTable = false;
  }

  resetaddProCodeOnClose() {
    this.addWellnessProcCodeForm.reset();
    this.renderer.selectRootElement('#wpc_procId').focus();
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
    if (event) {
      $("#btnWellnessProc").trigger('click');
    }
  }

  getAuthCheck(wellnessProcCodeArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.wellnessProcCodeCheck = [{
        "searchWellnessProcCode": 'T',
        "editWellnessProcCode": 'T',
        "viewWellnessProcCode": 'T',
        "addWellnessProcCode": 'T',
      }]
    } else {
      for (var i = 0; i < wellnessProcCodeArray.length; i++) {
        userAuthCheck[wellnessProcCodeArray[i].actionObjectDataTag] = wellnessProcCodeArray[i].actionAccess
      }
      this.wellnessProcCodeCheck = [{
        "searchWellnessProcCode": userAuthCheck['WPC402'],
        "editWellnessProcCode": userAuthCheck['SWG404'],
        "viewWellnessProcCode": userAuthCheck['WFG403'],
        "addWellnessProcCode": userAuthCheck['AWP405'],
      }]
    }
    return this.wellnessProcCodeCheck
  }

}