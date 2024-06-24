import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { FinanceApi } from '../../finance-module/finance-api'
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { FeeGuideApi } from '../../fee-guide-module/fee-guide-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { AdminApi } from '../admin-api';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-admin-info',
  templateUrl: './admin-info.component.html',
  styleUrls: ['./admin-info.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})

export class AdminInfoComponent implements OnInit {
  expired=false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  columns = [];
  dateNameArray = {};
  addAdminInfo: FormGroup;
  error: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions
  addMode: boolean = true;
  viewMode: boolean = false;
  editMode: boolean = false;
  buttonText: string;;
  adminInfoKey;
  adminDelKey;
  businessTypeList;
  reload: boolean = false;
  bussTypeKey;
  bussTypeDesc;
  observableObj;
  check = true;
  bussType;
  showLoader: boolean = false;
  adminInfoArray = [{
    "addAdminRate": 'F',
    "saveAdminRate": 'F',
    "editAdminRate": 'F',
    "deleteAdminRate": 'F'
  }]
  currentUser: any;
  public businessTypeData: CompleterData
  public isOpen: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  constructor(private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService
  ) {
    this.error = { error: false, errorMessage: '' }
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['ART']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['ART']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
      })
    }
    this.buttonText = this.translate.instant('button.save')
    this.addAdminInfo = new FormGroup({
      'planType': new FormControl('', [Validators.required]),
      'accPrefix': new FormControl('', [Validators.required]),
      'adminRate': new FormControl('', [Validators.required, CustomValidators.digitWithDecimal]),
      'chequeNumber': new FormControl('', [Validators.required]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl(''),
    })
    this.getBusinessType();
  }

  dataTableInitialize() {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('admin.adminRate.planType') == 'admin.adminRate.planType') {
        } else {
          this.columns = [
            { title: this.translate.instant('admin.adminRate.planType'), data: 'businessTypeDesc' },
            { title: this.translate.instant('admin.adminRate.admRate'), data: 'serviceProvAdminFeeRate' },
            { title: this.translate.instant('admin.adminRate.chequeAccount'), data: 'chequeAcctPrefix' },
            { title: this.translate.instant('admin.adminRate.chequeNo'), data: 'chequeNum' },
            { title: this.translate.instant('admin.adminRate.effDate'), data: 'effectiveOn' },
            { title: this.translate.instant('admin.adminRate.exDate'), data: 'expiredOn' },
            { title: this.translate.instant('admin.adminRate.action'), data: 'financialAdminInfoKey' }
          ]
          this.getAdminInfoList();
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#adminInfoList .edit-ico', function () {
      var id = $(this).data('id')
      self.adminInfoKey = id
      self.editAdminInfo(self.adminInfoKey)
    })
    $(document).on('keydown', '#adminInfoList .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
    $(document).on('click', '#adminInfoList .del-ico', function () {
      var id = $(this).data('id');
      self.adminDelKey = id
      self.deleteAdminInfo(self.adminDelKey)
    })
    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', 'Edit');
    })
  }

  getBusinessType() {
    var url = AdminApi.getBusinessTypeUrl
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.businessTypeList = data.result;
        this.businessTypeData = this.completerService.local(
          this.businessTypeList,
          "businessTypeDesc",
          "businessTypeDesc"
        );
      }
    })
  }

  onSelectedBusinessType(selected: CompleterItem) {
    if (selected) {
      this.bussTypeKey = selected.originalObject.businessTypeKey.toString();
      this.bussTypeDesc = selected.originalObject.businessTypeDesc
    }
  }

  enableAddMode() {
    this.addAdminInfo.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    this.buttonText = this.translate.instant('button.save')
  }

  enableViewMode() {
    this.addAdminInfo.disable();
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false
  }

  enableEditMode() {
    this.addAdminInfo.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.buttonText = this.translate.instant('button.update');
  }

  getAdminInfoList() {
    var reqParam = []
    var url = AdminApi.adminInfoSearchUrl;
    var tableId = "adminInfoList"
    if (!$.fn.dataTable.isDataTable('#adminInfoList')) {
      var tableActions = [
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': this.adminInfoArray[0].editAdminRate },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': this.adminInfoArray[0].deleteAdminRate },
      ]
      this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 6, [4, 5], "AddNewAdminInfo", '', '', '', '', '', [1, 2, 3, 4, 5, 6])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  submitAdminInfo() {
    let adminInfo = {
      "businessTypeKey": this.bussTypeKey,
      "chequeAcctPrefix": this.addAdminInfo.value.accPrefix,
      "serviceProvAdminFeeRate": this.addAdminInfo.value.adminRate,
      "chequeNum": this.addAdminInfo.value.chequeNumber,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addAdminInfo.value.effectiveOn),
      "expiredOn": this.addAdminInfo.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addAdminInfo.value.expiredOn) : "",
    }
    if (this.addMode) {
      if (this.addAdminInfo.valid) {
        var url = AdminApi.addUpdateFinacialAdminInfoUrl
        this.hmsDataService.postApi(url, adminInfo).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('admin.toaster.adminRateSave'))
            this.reload = true;
            $("#closeAdminInfoForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIRE_PREVIOUS_RECORD_BEFORE_ADDING_NEW_RECORD") {
            this.toastrService.error(this.translate.instant('admin.toaster.expirePreviosRecord'))
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
            this.toastrService.error(this.translate.instant('admin.toaster.effectiveDateShouldBeGreater'))
          }
        })
      } else {
        this.validateAllFormFields(this.addAdminInfo)
      }
    }
    if (this.editMode) {
      adminInfo["financialAdminInfoKey"] = this.adminInfoKey
      if (this.addAdminInfo.valid) {
        var url = AdminApi.addUpdateFinacialAdminInfoUrl
        this.hmsDataService.postApi(url, adminInfo).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('admin.toaster.adminRateUpdate'))
            this.reload = true;
            $("#closeAdminInfoForm").trigger('click');
          }
        })
      } else {
        this.validateAllFormFields(this.addAdminInfo)
      }
    }
  }

  /**
   * View the Detail & edit the Record on the basis of Key
   * @param id 
   */
  editAdminInfo(id) {
    this.showLoader = true;
    this.enableEditMode();
    var url = AdminApi.getFinacialAdminInfoUrl
    var adminInfoId = { "financialAdminInfoKey": id }
    this.hmsDataService.postApi(url, adminInfoId).subscribe(data => {
      if (data.code == 200 && data.status) {
        this.showLoader = false
        this.bussTypeKey = data.result.businessTypeKey
        this.addAdminInfo.patchValue({
          'planType': data.result.businessTypeDesc,
          'accPrefix': data.result.chequeAcctPrefix,
          'adminRate': data.result.serviceProvAdminFeeRate,
          'chequeNumber': data.result.chequeNum,
          'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
        });
      }
    })
  }

  deleteAdminInfo(id) {
    this.exDialog.openConfirm(this.translate.instant('admin.toaster.deleteConfirmation')).subscribe((value) => {
      if (value) {
        let RequestData = {
          "financialAdminInfoKey": id
        }
        this.hmsDataService.postApi(AdminApi.deleteFinacialAdminInfoUrl, RequestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('admin.toaster.adminRecordDelete'))
            this.getAdminInfoList();
          }
        })
      }
    });
  }

  searchAdminInfo(tableId: string) {
    var params = this.dataTableService.getFooterParams("adminInfoList")
    var selectedTypeKey = this.bussTypeKey
    var dateParams = [4, 5]
    var URL = AdminApi.adminInfoSearchUrl;
    this.dataTableService.jqueryDataTableReload("adminInfoList", URL, params, dateParams)
  }

  resetAdminInfoSearch() {
    this.dataTableService.resetTableSearch();
    this.searchAdminInfo("adminInfoList")
    $('#adminInfoList .icon-mydpremove').trigger('click');
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.addAdminInfo.patchValue(datePickerValue);
    
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
      this.addAdminInfo.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    else if (event.reason == 2 && currentDate == false && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        var ControlName = frmControlName;
        var datePickerValue = new Array();
        datePickerValue[ControlName] = obj;
        this.addAdminInfo.patchValue(datePickerValue);
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  
    if (this.addAdminInfo.value.effectiveOn && this.addAdminInfo.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addAdminInfo.value.effectiveOn.date, this.addAdminInfo.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addAdminInfo.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }

  /**
   * Method for Footer Datepicker
   * @param event 
   * @param frmControlName 
   */
  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
        this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
      }
    }
    else if(event.reason == 1 && event.value != null && event.value != '')
    {
    this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  resetAdminInfoForm() {
    this.addAdminInfo.reset();
    if (this.reload) {
      this.getAdminInfoList();
    }
  }

  /**
   * Method for validate the Form fields
   * @param formGroup 
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
   * filter the search on press enter
   * @param event 
   * @param tableId 
   */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchAdminInfo(tableId);
    }
  }

  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.adminInfoArray = [{
        "addAdminRate": 'T',
        "saveAdminRate": 'T',
        "editAdminRate": 'T',
        "deleteAdminRate": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.adminInfoArray = [{
        "addAdminRate": authCheck['ART315'],
        "saveAdminRate": authCheck['ART316'],
        "editAdminRate": authCheck['ART317'],
        "deleteAdminRate": authCheck['ART318'],
      }]
    }
    return this.adminInfoArray
  }

  focusNextEle(event,id){
    $('#'+id).focus(); 
  }
  
}