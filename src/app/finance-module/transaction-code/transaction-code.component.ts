import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
/** For Common Date Picker */
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { FinanceApi } from '../finance-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { FeeGuideApi } from '../../fee-guide-module/fee-guide-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-transaction-code',
  templateUrl: './transaction-code.component.html',
  styleUrls: ['./transaction-code.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService]
})

export class TransactionCodeComponent implements OnInit {
  expired=false;
  columns: { title: string; data: string; }[];
  ObservableObj: any;
  check = true
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public addTransactionCode: FormGroup;
  dateNameArray = {};
  error: any
  addMode: boolean = true;
  viewMode: boolean = false;
  editMode: boolean = false;
  transitCodeKey;
  transitCodeKeyDelete;
  isUpdateTransitCode: boolean = false;
  buttonText: string;
  public codeDataRemote: CompleterData;
  public isOpen: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  codeTypeList;
  currentUser:any;
  transactionCodeArray =  [{
      "addTransactionCode": 'F',
      "editTransactionCode": 'F'
  }]
  transactionCodeTableActions;
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService
  ) {
    this.error = { isError: false, errorMessage: '' }
    //Predictive Company Search Upper
    this.getPredectiveTransactionCode();
  }

  /**
   * Added by Ashwani on 03/07/2020
   */
  getPredectiveTransactionCode(){
    var URL = FinanceApi.getPredectiveTransactionCode;
    this.hmsDataService.get(URL).subscribe(data => {
      if (data.code == 200) {
        this.codeTypeList = data.result;
        this.codeDataRemote = this.completerService.local(
          this.codeTypeList,
          "tranCd",
          "tranCd"
        );
      }
    })
  }

  ngOnInit() {
    this.addTransactionCode = new FormGroup({
      'code': new FormControl('', [Validators.required, CustomValidators.rangeCode]),
      'description': new FormControl('', [Validators.required, Validators.maxLength(256)]),
      'effectiveOn': new FormControl('',[Validators.required]),
      'expiredOn': new FormControl('')
    });
    this.buttonText = this.translate.instant('button.save')
    /* Security Checks */
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['TXC']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['TXC']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
      })
    }
    var self = this
    $(document).on('mouseover', '#company-list .view-ico', function () {
      $(this).attr('title', 'View');
    })
    $(document).on('keydown', '#transaction-code-list .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#transaction-code-list .edit-ico', function () {
      var id = $(this).data('id')
      self.transitCodeKey = id
      self.editTransitCode(self.transitCodeKey)
    })
    //Delect Event of Transaction Code
    $(document).on('click', '#transaction-code-list .del-ico', function () {
      var transitCodeId = $(this).data('id');
      self.transitCodeKeyDelete = transitCodeId
      self.deleteTransitCode(transitCodeId)
    })
    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', 'Edit');
    })
  }

  dataTableInitialize(){
    var tableId = "transaction-code-list"
    var URL = FinanceApi.searchTransactionCodeUrl;
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' }]
    this.transactionCodeTableActions = [
      { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': this.transactionCodeArray[0].editTransactionCode }
    ]
    this.ObservableObj = Observable.interval(.1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('finance.transactionCode.code') == 'finance.transactionCode.code') {
        } else {
          this.columns = [
            { title: this.translate.instant('finance.transactionCode.code'), data: 'tranCd' },
            { title: this.translate.instant('finance.transactionCode.description'), data: 'tranDescription' },
            //added for log 923
            {title:this.translate.instant('finance.transactionCode.effective_date'), data: 'effectiveOn'},
            { title: this.translate.instant('finance.transactionCode.expiryDate'), data: 'expiredOn' },
            { title: this.translate.instant('finance.transactionCode.action'), data: 'tranCdKey' }
          ]
          var tableId = "transaction-code-list"
          if (!$.fn.dataTable.isDataTable('#transaction-code-list')) {
            this.dataTableService.jqueryDataTableForModal(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp',
             undefined, [0, 'asc'], '',
             reqParam, this.transactionCodeTableActions, 4, [2,3], "AddTransactionCode", '', '', '', [0,1,2,3], '', [2, 3])
          }
          this.check = false
          this.ObservableObj.unsubscribe();
        }
      }
    });
  }

  /**
  * Submit Transaction Code List on press enter
  * @param event 
  */
  onKeyPress(event) {
    if (event.keyCode == 13) {
      this.addUpdateTransitCode(this.addTransactionCode);
    }
  }

  enableAddMode() {
    this.addTransactionCode.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    this.buttonText = this.translate.instant('button.save')
  }

  enableViewMode() {
    this.addTransactionCode.reset();
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false
  }

  enableEditMode() {
    this.addTransactionCode.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.buttonText = this.translate.instant('button.update')
  }

  /**
  * Submit Transaction Code Form
  * @param addTransactionCode 
  */
  addUpdateTransitCode(addTransactionCode) {
    let transactionCodeData = {
      "tranCd": this.addTransactionCode.value.code,
      "tranDescription": this.addTransactionCode.value.description,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addTransactionCode.value.effectiveOn),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addTransactionCode.value.expiredOn)
    }
    if (this.addMode) {
      if (this.addTransactionCode.valid) {
        var url = FinanceApi.saveUpdateTransactionCodeUrl;
        this.hmsDataService.postApi(url, transactionCodeData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('finance.toaster.transCodeSuccess'))
            this.enableViewMode();
            this.transactionCodeListDataTable(addTransactionCode)
            $("#closeTransactionCodeForm").trigger('click');
            this.getPredectiveTransactionCode();
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == "TRANSACTION_CODE_ALREADY_EXIST") {
            this.toastrService.error(this.translate.instant('finance.toaster.transCodeAlreadyExist'))
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_THAN_CREATED_ON") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          }
          else {
            this.toastrService.error(this.translate.instant('finance.toaster.transCodeNotSaved'))
          }
        })
      } else {
        this.validateAllFormFields(this.addTransactionCode);
      }
    }
    if (this.editMode) {
      if (this.addTransactionCode.valid) {
        transactionCodeData["tranCdKey"] = this.transitCodeKey;
        var url = FinanceApi.saveUpdateTransactionCodeUrl
        this.hmsDataService.postApi(url, transactionCodeData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('finance.toaster.transCodeUpdateSuccess'))
            this.addTransactionCode.reset();
            this.buttonText = this.translate.instant('button.save')
            this.transactionCodeListDataTable(addTransactionCode)
            $("#closeTransactionCodeForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "TRANSACTION_CODE_ALREADY_EXIST") {
            this.toastrService.error(this.translate.instant('finance.toaster.transCodeAlreadyExist'))
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_THAN_CREATED_ON") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          }
        })
      } else {
        this.validateAllFormFields(this.addTransactionCode);
      }
    }
  }

  editTransitCode(id) {
    this.enableEditMode();
    var url = FinanceApi.getTransactionCodeUrl
    var transactionId = { "tranCdKey": id }
    this.hmsDataService.postApi(url, transactionId).subscribe(data => {
      if (data.code == 200 && data.status) {
        this.addTransactionCode.patchValue({
          'code': data.result.tranCd,
          'description': data.result.tranDescription,
          'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
        });
      }
    })
  }

  deleteTransitCode(transitCodeId) {
    this.exDialog.openConfirm(this.translate.instant('finance.toaster.deleteTransCodeConfirm')).subscribe((value) => {
    });
  }

  /**
   * Change Date Format For Date Picker
   * @param event 
   * @param frmControlName 
   */

  /* Methos for Upper Form Datepicker */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.addTransactionCode.patchValue(datePickerValue);
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
      this.addTransactionCode.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    if (this.addTransactionCode.value.effectiveOn && this.addTransactionCode.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addTransactionCode.value.effectiveOn.date, this.addTransactionCode.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addTransactionCode.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }
  /**
   * Change Date Picker For Date Picker
   * @param event 
   * @param frmControlName 
   */
  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
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
    else if(event.reason == 1 && event.value != null && event.value != ''){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
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

  transactionCodeListDataTable(addTransactionCode) {
    var reqParam = [
      { 'key': 'tranCd', 'value': '' },
      { 'key': 'tranDescription', 'value': '' },
      { 'key': 'expiredOn', 'value': addTransactionCode.value.effectiveOn != null ? this.changeDateFormatService.convertDateObjectToString(addTransactionCode.value.effectiveOn) : '', },
      { 'key': 'expiredOn', 'value': addTransactionCode.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(addTransactionCode.value.expiredOn) : '', }
    ]
    var URL = FinanceApi.searchTransactionCodeUrl;
    var tableId = "transaction-code-list"
    if (!$.fn.dataTable.isDataTable('#transaction-code-list')) {
      this.dataTableService.jqueryDataTableForModal(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, this.transactionCodeTableActions, 3, [2, 3], "AddTransactionCode")
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
    }
  }

  /**
   * Filter Transaction Code List
   * @param tableId 
   */
  filterTransactionCodeSearch(tableId: string) {
    var params = this.dataTableService.getFooterParams("transaction-code-list")
    var dateParams = [2, 3]
    var URL = FinanceApi.searchTransactionCodeUrl;
    this.dataTableService.jqueryDataTableReload("transaction-code-list", URL, params, dateParams)
  }

  /**
   * Reset Comapany List Filter
   */
  resetListingFilter() {
    this.dataTableService.resetTableSearch();
    this.filterTransactionCodeSearch("transaction-code-list")
    $('#transaction-code-list .icon-mydpremove').trigger('click');
  }

  resetTransactionCodeForm() {
    this.addTransactionCode.reset();
  }

  /**
 * filter the search on press enter
 * @param event 
 * @param tableId 
 */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.filterTransactionCodeSearch(tableId);
    }
  }

  focusNextEle(event,id){
    $('#'+id).focus(); 
  }

  /* Get Auth Checks for Transaction Code (14-Dec-2020) */
  getAuthCheck(tranCodeChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.transactionCodeArray = [{
        "addTransactionCode": 'T',
        "editTransactionCode": 'T'
      }]
    } else {
      for (var i = 0; i < tranCodeChecks.length; i++) {
        authCheck[tranCodeChecks[i].actionObjectDataTag] = tranCodeChecks[i].actionAccess
      }
      this.transactionCodeArray = [{
        "addTransactionCode": authCheck['TXC284'],
        "editTransactionCode": authCheck['TXC285']
      }]
    }
    return this.transactionCodeArray
  }
}
