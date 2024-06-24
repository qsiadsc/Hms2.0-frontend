import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormControlName, Validators } from '@angular/forms';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Rx';
import { TranslateService, USE_DEFAULT_LANG } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { FeeGuideApi } from '../../fee-guide-module/fee-guide-api'
import { SearchCompanyComponent } from '../../common-module/shared-component/search-company/search-company.component'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { UftApi } from '../uft-api';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { timingSafeEqual } from 'crypto';
import { empty } from 'rxjs/observable/empty';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
declare var jsPDF: any;

@Component({
  selector: 'app-unit-financial-transaction',
  templateUrl: './unit-financial-transaction.component.html',
  styleUrls: ['./unit-financial-transaction.component.css'],
  providers: [ChangeDateFormatService, DatatableService, ToastrService]
})
export class UnitFinancialTransactionComponent implements OnInit {
  companyNameOrNo_ReqParam: any;
  transactionRefernece: any;
  transactionAmt: string;
  balance: string;
  coRefundChqRefNum: string;
  nativeTransactionDate: string;
  entrydate: any;
  paymentSave: boolean = false;
  reqParamArray: { key: string; value: any; }[];
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  myDateRangePickerOptions: IMyDrpOptions = {
    // other options...
    dateFormat: 'dd/mmm/yyyy',
  };

  transTypeDesc: any;
  selectedProvinceName: any;
  companyname: any;
  searchCoKey: any;
  searchCoId: any;
  active: any;
  inActive: any;
  transactionDateStart: any;
  transactionDateEnd: any;
  transctionType: any;
  transactionDescription: any;
  provinceName: any;
  uftEntryDateSearch: any;
  planId: any;
  divisionId: any;
  unitId: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  unitFinancialTransactionForm: FormGroup;
  addOTPform: FormGroup;
  generateRefundForm: FormGroup
  error: any
  columns = [];
  dateNameArray = {};
  showUnitFinTransList: boolean = false
  companyCoId;
  companyCoName;
  transcdkey;
  transactionTypeList;
  provinceList;
  public transactionTypeData: CompleterData;
  public provinceDataRemote: CompleterData;
  selectedProvinceKey;
  transType;
  ;
  public companyListData: RemoteData;
  modalHeading: String = "One Time Payment2";
  public isOpen: boolean = false;
  cashtranstype: any;
  currentBal: any;
  unitTransAmt: any;
  showAdjustPAP: boolean = false;
  showMisc: boolean;
  showWriteOff: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  addMode: boolean = true
  viewMode: boolean = false
  editMode: boolean = false
  buttonText: string = "Save"
  refundKey;
  uftData;
  compBalData;
  compRefundInfo;
  showLoader: boolean = false;
  coInfoKey;
  companyKey;
  unitFinancialTransKey;
  unitFinancialTranCd;
  unitFinancialTransctionType;
  unitFinancialCompanyName;
  unitFinancialTransAmount;
  unitFinancialTranCodeKey;
  public isDisable: boolean = false;
  transactionDate;
  todayDate;
  isDisableReversePap: boolean = false;
  uftTransRef;
  reff: boolean = false;
  isRefundForm: boolean = false;
  isWriteOffForm: boolean = false
  uftBalance;
  hiddenPopup: boolean = false;
  coKey
  showtableLoader: boolean;
  chequeRes;
  uftKey;
  coKeyReq;
  compName;
  companyName;
  transRef
  writeOff: boolean;
  reload: boolean = false;
  observableObj;
  check = true;
  currentUser
  getLowerSearch: boolean;
  uftRequest;
  loader;
  imagePath;
  docName;
  docType;
  uftByKeyResp: number;
  refundAmt;
  standardPapAmt;
  yearEndBalance;
  compEffDate; // To Get Effective Date on Select Inside the Popup 
  compMainEffDate; // To Get Effective Date of Selected Company from Grid
  balMinusResp;
  balZeroResp;
  refundPDS: boolean = false
  refundTransAmt;
  transCode;
  adjustedFlag;
  paymentListColumns = [];
  reverseFlag;
  firstStepResp;
  showPayeeLink: boolean = false;
  showPayeeInfo: boolean = false;
  refundDataRequest;
  transCodeKey;
  refundTransCdKey;
  uftArray = [{
    "searchUft": "F",
    "cretaePap": 'F',
    "refund": 'F',
    "payments": 'F',
    "adjustPap": 'F',
    "reversePap": 'F'
  }]
  provinceData = []
  dropdownSettings = {};
  provinceArray = []
  selectedItems = []
  transactionTypeDataList = []
  transactionTypeArray = []
  transelectedItems = []

  constructor(private dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private toastrService: ToastrService,
    private route: ActivatedRoute
  ) {
    this.error = { isError: false, errorMessage: '' }
    this.currentUserService.loggedInUserVal.subscribe(val => {
      if (val) {
        this.currentUser = val
        this.getPredictiveCompanySearchData(completerService);
      }
    })
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['SFT']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
       localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['SFT']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
      })
    }

    this.unitFinancialTransactionForm = new FormGroup({
      'companyNameOrNo': new FormControl(''),
      'comActive': new FormControl(''),
      'comInactive': new FormControl(''),
      'accTransDateFirst': new FormControl(''),
      'accTransDateFromSecond': new FormControl(''),
      'transactionType': new FormControl(''),
      'transactionRefDesc': new FormControl(''),
      'provinceName': new FormControl(''),
      'entryDate': new FormControl(''),
      'planNo': new FormControl(''),
      'divisionNo': new FormControl(''),
      'unitNo': new FormControl('')
    });

    this.addOTPform = new FormGroup({
      'payment_type': new FormControl(''),
      'otp_accTrans': new FormControl('', [Validators.required]),
      'otp_transactionType': new FormControl('', [Validators.required]),
      'otp_companyName': new FormControl('', [Validators.required]),
      'otp_transactionAmt': new FormControl('', [Validators.required]),
      'otp_transactionDesc': new FormControl('', [Validators.maxLength(80), CustomValidators.notEmpty]),
      'otp_transactionReference': new FormControl(''),
      'otp_currentbalance': new FormControl(''),
      'otp_entryDate': new FormControl('')
    });
    this.generateRefundForm = new FormGroup({
      'companyNameNo': new FormControl('', [Validators.required]),
      'accTransDate': new FormControl('', [Validators.required]),
      'transactionAmount': new FormControl('', [Validators.required]),
      'transactionType': new FormControl('', [Validators.required]),
      'transactionDesc': new FormControl('', [Validators.maxLength(80), CustomValidators.notEmpty]),
      'transactionRef': new FormControl('', [CustomValidators.notEmpty, Validators.maxLength(15), CustomValidators.onlyNumbers]),
      'currentBalance': new FormControl('', [Validators.required]),
      'entryDate': new FormControl('', [Validators.required]),
      'companyEffectiveOn': new FormControl('', [Validators.required]),
      'yearEndDate': new FormControl('', [Validators.required]),
      'yearEndBalance': new FormControl('', [Validators.required]),
      'standardPapAmount': new FormControl('', [Validators.required]),
      'refundAmount': new FormControl('', []),
      'name': new FormControl('', []),
      'address': new FormControl('', []),
      'address2': new FormControl('', []),
      'postalCode': new FormControl('', []),
      'city': new FormControl('', []),
      'province': new FormControl('', []),
      'country': new FormControl('', [])
    })
    this.getTransactionType();
    this.getProvinceList();
    this.getPredictiveCompanySearchData(this.completerService);
    let self = this
    $(document).on('click', '#unitFinancialTransactionList tr', function () {
      if (self.dataTableService.uftSelectedRowData != undefined) {
        self.isDisable = true
        if ((self.dataTableService.uftSelectedRowData.tranCd == 90 || self.dataTableService.uftSelectedRowData.tranCd == 91
          || self.dataTableService.uftSelectedRowData.tranCd == 93 || self.dataTableService.uftSelectedRowData.tranCd == 94
          || self.dataTableService.uftSelectedRowData.tranCd == 80 || self.dataTableService.uftSelectedRowData.tranCd == 81) && self.dataTableService.uftSelectedRowData.reverseStatus == 'F') {
          self.isDisableReversePap = true
        } else {
          self.isDisableReversePap = false
        }
        self.unitTransAmt = self.dataTableService.uftSelectedRowData.transactionAmt;
        self.unitFinancialTransKey = self.dataTableService.uftSelectedRowData.unitFinancialTransKey;
        self.unitFinancialTranCd = self.dataTableService.uftSelectedRowData.tranCd;
        self.unitFinancialTransctionType = self.dataTableService.uftSelectedRowData.transctionType;
        self.unitFinancialCompanyName = self.dataTableService.uftSelectedRowData.companyname;
        self.unitFinancialTransAmount = self.dataTableService.uftSelectedRowData.transactionAmt;
        self.unitFinancialTranCodeKey = self.dataTableService.uftSelectedRowData.tranCodeKey
        self.uftBalance = self.dataTableService.uftSelectedRowData.balance
        self.companyKey = self.dataTableService.uftSelectedRowData.coKey
        self.adjustedFlag = self.dataTableService.uftSelectedRowData.adjusted
        self.reverseFlag = self.dataTableService.uftSelectedRowData.reverseStatus
      }
    })
    $(document).on('click', '#unitFinancialTransactionList_paginate a', function () {
      self.isDisable = false
      self.isDisableReversePap = false
      $('#unitFinancialTransactionList td').removeClass('highlightedRow');
    })
  }
 
  ngAfterViewInit(){
    this.dropdownSettings= Constants.multiSelectBatchDropdown;
  }

  dataTableInitialize() {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('uft.uftSearch.companyNameNo') == 'uft.uftSearch.companyNameNo') {
        }
        else {
          this.columns = [
            { title: this.translate.instant('uft.uftSearch.companyNameNo'), data: 'companyname' },
            { title: this.translate.instant('uft.uftSearch.transactionDate'), data: 'transactionDate' },
            { title: this.translate.instant('uft.uftSearch.transactionType'), data: 'transctionType' },
            { title: this.translate.instant('uft.uftSearch.province'), data: 'provinceName' },
            { title: this.translate.instant('uft.uftSearch.transRef'), data: 'transactionRefernece' },//transactionRefernece
            { title: this.translate.instant('uft.uftSearch.transAmount'), data: 'transactionAmt' },
            { title: this.translate.instant('uft.uftSearch.balance'), data: 'balance' },
            { title: this.translate.instant('uft.uftSearch.transDescription'), data: 'transactionDescription' },
            { title: this.translate.instant('uft.uftSearch.refundChequeNo'), data: 'coRefundChqRefNum' },
            { title: this.translate.instant('uft.uftSearch.planNo'), data: 'planId' },
            { title: this.translate.instant('uft.uftSearch.divisionNo'), data: 'divisionId' },
            { title: this.translate.instant('uft.uftSearch.unitNo'), data: 'unitId' },
            { title: this.translate.instant('uft.uftSearch.entryDate'), data: 'entrydate' },
          ]
          this.check = false;
          this.observableObj.unsubscribe();
        }
      }
    })
  }

  /**
   * Search UFT List 
   */
  getUnitFinancialTransactionList() {
    this.showUnitFinTransList = true
    this.getLowerSearch = false;
    this.isDisable = false;
    $('#unitFinancialTransactionList td').removeClass('highlightedRow');
    this.isDisableReversePap = false;
    this.companyNameOrNo_ReqParam = this.companyCoId; //For PDF Export    
    var reqParam = [
      { 'key': 'companyname', 'value': this.unitFinancialTransactionForm.value.companyNameOrNo },
      { 'key': 'coKey', 'value': (this.companyKey) != undefined ? this.companyKey : '' },
      { 'key': 'coId', 'value': (this.companyCoId) != undefined ? this.companyCoId : '' },
      { 'key': 'active', 'value': (this.unitFinancialTransactionForm.value.comActive == true) ? 'T' : 'F' },
      { 'key': 'inActive', 'value': (this.unitFinancialTransactionForm.value.comInactive == true) ? 'T' : 'F' },
      { 'key': 'transactionDateStart', 'value': this.unitFinancialTransactionForm.value.accTransDateFirst != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFirst) : '' },
      { 'key': 'transactionDateEnd', 'value': this.unitFinancialTransactionForm.value.accTransDateFromSecond != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFromSecond) : '' },
      { 'key': 'transctionType', 'value': this.unitFinancialTransactionForm.value.transactionType },
      { 'key': 'transactionDescription', 'value': this.unitFinancialTransactionForm.value.transactionRefDesc },
      { 'key': 'provinceName', 'value': this.unitFinancialTransactionForm.value.provinceName },
      { 'key': 'entrydate', 'value': this.unitFinancialTransactionForm.value.entryDate != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.entryDate) : '', },
      { 'key': 'planId', 'value': this.unitFinancialTransactionForm.value.planNo },
      { 'key': 'divisionId', 'value': this.unitFinancialTransactionForm.value.divisionNo },
      { 'key': 'unitId', 'value': this.unitFinancialTransactionForm.value.unitNo }
    ]
    // Below one is to set correct values in reqParam for search if new entrie(s) added in Payments popup "search was wrong after new entries".
    if (!this.paymentSave) {
      this.reqParamArray = reqParam
    }
    else {
      reqParam = []
      reqParam = this.reqParamArray
    }
    var url = UftApi.unitFinancialTransactionSearch;
    var tableId = "unitFinancialTransactionList"
    if (!$.fn.dataTable.isDataTable('#unitFinancialTransactionList')) {
      var tableActions = [
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': '' },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
      ]
      this.dataTableService.jqueryDataTableUFT(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [1, 12], 'AddGenerateRefund', [5, 6], [1, 2, 3, 4, 7, 8, 9, 10, 11, 12])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    this.companyname = this.unitFinancialTransactionForm.value.companyNameOrNo;
    this.active = (this.unitFinancialTransactionForm.value.comActive == true) ? 'T' : 'F';
    this.inActive = (this.unitFinancialTransactionForm.value.comInactive == true) ? 'T' : 'F';
    this.transactionDateStart = this.unitFinancialTransactionForm.value.accTransDateFirst != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFirst) : '';
    this.transactionDateEnd = this.unitFinancialTransactionForm.value.accTransDateFromSecond != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFromSecond) : '';
    this.transctionType = this.unitFinancialTransactionForm.value.transactionType;
    this.transactionDescription = this.unitFinancialTransactionForm.value.transactionRefDesc;
    this.provinceName = this.unitFinancialTransactionForm.value.provinceName;
    this.entrydate = this.unitFinancialTransactionForm.value.entryDate != null ? (this.unitFinancialTransactionForm.value.entryDate) : '';
    this.planId = this.unitFinancialTransactionForm.value.planNo;
    this.divisionId = this.unitFinancialTransactionForm.value.divisionNo;
    this.unitId = this.unitFinancialTransactionForm.value.unitNo
    if (this.entrydate) {
      this.dateNameArray['entrydate'] = {
        year: this.entrydate.date.year,
        month: this.entrydate.date.month,
        day: this.entrydate.date.day
      }
    } else{
      this.dateNameArray["entrydate"] = ''
    }
    return false;
  }

  // Used for Reset the Form For Upper Search
  resetUnitFinTransForm() {
    this.showUnitFinTransList=false
    this.unitFinancialTransactionForm.reset();
    this.companyCoId = '';
    this.companyKey = ''
    this.transactionDateStart = '';
    this.transactionDateEnd = '';
    this.nativeTransactionDate = ''
  }

  adjustPAP() {
    var action = "cancel";
    if (this.adjustedFlag == 'T') {
      this.toastrService.error(this.translate.instant('uft.toaster.transAdjusted'))
    }
    else if (this.unitFinancialTransctionType == '11 - Treatment Expense - Stoploss Reversal') {
      this.toastrService.error(this.translate.instant('uft.toaster.treatmentExpense'));
    }
    else if (this.unitFinancialTransctionType == '20 - Variable Administration Fee') {
      this.toastrService.error(this.translate.instant('uft.toaster.variableAdminFee'));
    }
    else if (this.unitFinancialTransctionType == '70 - Miscellaneous Charges') {
      this.toastrService.error(this.translate.instant('uft.toaster.miscellaneousCharges'));
    }
    else if (this.unitFinancialTransctionType == '30 - GST') {
      this.toastrService.error(this.translate.instant('uft.toaster.gstAdjust'));
    }
    else if (this.unitFinancialTransctionType == '50 - Closing Balance') {
      this.toastrService.error(this.translate.instant('uft.toaster.closingBalance'));
    }
    else if (this.unitFinancialTransctionType == '10 - Treatment Expense') {
      this.toastrService.error(this.translate.instant('uft.toaster.treatmentExpenseTypeTen'));
    }
    else {
      if (this.unitFinancialTranCd == '80' || this.unitFinancialTranCd == '90' || this.unitFinancialTranCd == '91' || this.unitFinancialTranCd == '99') {
        this.exDialog.openConfirm(this.translate.instant('uft.toaster.adjustAmtConfirm') + ' ' + this.unitTransAmt + ' ' + this.translate.instant('uft.toaster.forCompany') + this.unitFinancialCompanyName + this.translate.instant('uft.toaster.ques'))
          .subscribe((value) => {
            if (value) {
              this.showLoader = true
              this.modalHeading = "Adjust PAP";
              this.showAdjustPAP = true;
              this.hmsDataService.OpenCloseModal('ufthidden');
              this.addOTP();
            }
            else {
              this.resetOTP();
            }
          })
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.transTypeNotAdjustable'));
      }
    }
  }


  miscCharges() {
    this.modalHeading = "Miscellaneous Charges";
    this.showMisc = true;
    this.unitFinancialTransKey = '';
    this.isDisable = false;
    $('table td').removeClass('highlightedRow');
    this.modalHeading = "Miscellaneous Charges"
    /* For Misc charges Code 70  */
    for (var i = 0; i < this.transactionTypeList.length; i++) {
      if (this.transactionTypeList[i].tranCd == '70') {
        this.cashtranstype = this.transactionTypeList[i].mergedDescription
        this.transCodeKey = this.transactionTypeList[i].tranCdKey
      }
    }
    this.addOTPform.patchValue({
      "otp_transactionType": this.cashtranstype,
      "otp_transactionDesc": 'MISC. CHARGES',
      "otp_entryDate": this.changeDateFormatService.getToday(),
    })
    this.addOTPform.controls['otp_transactionType'].disable();
    this.addOTPform.controls['otp_transactionAmt'].setValidators([CustomValidators.transAmountNegative])
    this.addOTPform.controls['otp_transactionAmt'].updateValueAndValidity();
    this.getPaymentTypeList(this.companyKey);
  }
  // Methos for Upper Form Datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.unitFinancialTransactionForm.patchValue(datePickerValue);
      this.generateRefundForm.patchValue(datePickerValue)
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
      this.unitFinancialTransactionForm.patchValue(datePickerValue);
      this.generateRefundForm.patchValue(datePickerValue)
      this.addOTPform.patchValue(datePickerValue);
    }
    if (this.unitFinancialTransactionForm.value.effectiveOn && this.unitFinancialTransactionForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.unitFinancialTransactionForm.value.effectiveOn.date, this.unitFinancialTransactionForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.unitFinancialTransactionForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    if (this.generateRefundForm.value.accTransDate && this.compEffDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.compEffDate.date, this.generateRefundForm.value.accTransDate.date);
      if (this.error.isError == true) {
        this.generateRefundForm.controls['accTransDate'].setErrors({
          "transactionEffDateCheck": true
        });
      }
    }
    if (this.generateRefundForm.value.accTransDate && this.compMainEffDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.compMainEffDate.date, this.generateRefundForm.value.accTransDate.date);
      if (this.error.isError == true) {
        this.generateRefundForm.controls['accTransDate'].setErrors({
          "transactionEffDateCheck": true
        });
      }
    }
  }

  /* Method for Footer Datepicker */
  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  /* Search For Tax Rates Grid Footer Search*/
  unitFinTransactionListFilter(tableId: string) {
    this.getLowerSearch = true
    this.isDisable = false;
    this.isDisableReversePap = false;
    $('#unitFinancialTransactionList td').removeClass('highlightedRow');
    var params = this.dataTableService.getFooterParamsUFTSearch("unitFinancialTransactionList");
    params[15] = { key: "coKey", value: (this.companyKey) != undefined ? this.companyKey : '' };
    params[16] = { key: "coId", value: (this.companyCoId) != undefined ? this.companyCoId : '' };
    params[17] = { key: "active", value: this.active };
    params[18] = { key: "inActive", value: this.inActive };
    if(!this.getLowerSearch){
      params[19] = { key: "transactionDateStart", value: this.transactionDateStart }
      params[20] = { key: "transactionDateEnd", value: this.transactionDateEnd }
    }
    params.push({ key: "provinceNameList", value: this.provinceArray})  // commented because of backend pending
    params.push({ key: "transctionTypeList", value: this.transactionTypeArray})
    var URL = UftApi.unitFinancialTransactionSearch;
    var dateParams = [1, 13];
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }

  /* Reset the Tax Rates List Footer Search */
  resetUnitFinTransactionListFilter() {
    this.isDisable = false;
    this.isDisableReversePap = false;
    $('#unitFinancialTransactionList td').removeClass('highlightedRow');
    this.dataTableService.resetTableSearch();
    this.unitFinTransactionListFilter("unitFinancialTransactionList");
    $('#unitFinancialTransactionList .icon-mydpremove').trigger('click');
    this.companyKey = ''
    this.companyCoId = ''
  }

  onTransactionTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.transcdkey = selected.originalObject.tranCd;
    }
  }

  onCompanyNameSelectedSearch(selected: CompleterItem) {
    if (selected) {
      this.companyKey = selected.originalObject.coKey.toString();
      this.companyCoId = selected.originalObject.coId
      this.companyName = selected.originalObject.companyname
      this.compName = selected.originalObject.mergedDescription
    }
    else {
      this.companyCoId = ''
      this.companyKey = ''
    }
  }

  onCompanyNameSelected(selected: CompleterItem) {
    if (selected) {
      this.companyKey = selected.originalObject.coKey.toString();
      this.companyCoId = selected.originalObject.coId
      this.companyName = selected.originalObject.companyname
      this.compName = selected.originalObject.mergedDescription
      var effDate = selected.originalObject.effectiveOn;
      if (effDate) {
        var myDate = this.changeDateFormatService.formatDate(effDate)
        this.compEffDate = this.changeDateFormatService.convertStringDateToObject(myDate)
      } else {
        this.compEffDate = ''
      }
      var companyUrl = UftApi.getCompanyBalanceUrl + '/' + this.companyCoId
      this.hmsDataService.getApi(companyUrl).subscribe(data => {
        if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
          if (Number.isInteger(data.result)) {
            this.currentBal = data.result + '.00';
          } else {
            this.currentBal = data.result;
          }
        }
      })
      //get the Current Balance here:
      var balUrl = UftApi.getCompanyBalanceUrl + '/' + this.companyKey
      this.hmsDataService.getApi(balUrl).subscribe(data => {
        if (Number.isInteger(data.result)) {
          this.compBalData = data.result + '.00';
        } else {
          this.compBalData = data.result;
        }
        this.generateRefundForm.patchValue({
          "currentBalance": this.compBalData
        })
        this.addOTPform.patchValue({
          "otp_currentbalance": this.compBalData
        })
      })
      if (this.isRefundForm) {
        this.getBankAccountStatus(this.companyKey);
        this.getViewOfCompanyRefundInfo(this.companyKey);
        this.getRefundTypeList(this.companyKey)
      } else {
        this.getPaymentTypeList(this.companyKey)
      }
    }
    else {
      this.companyCoId = ''
      this.companyKey = ''
      this.compEffDate = ''
    }
  }

  /**
   * Serach Company List on press enter
   * @param event 
   */
  onKeyPress(event) {
    if (event.keyCode == 13) {
    }
  }

  /* Get Transaction Type List for Predictive Search */
  getTransactionType() {
    var url = UftApi.getTransactionTypeUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionTypeList = data.result;
        this.transactionTypeData = this.completerService.local(
          this.transactionTypeList,
          "mergedDescription",
          "mergedDescription"
        )// For Log #925 multiselet transaction type dropdown
        for (let k = 0; k < this.transactionTypeList.length; k++) {
          this.transactionTypeDataList.push({ 'id': this.transactionTypeList[k].mergedDescription, 'itemName': this.transactionTypeList[k].mergedDescription });
        };
      }
    })
  }

  onSelectedTransactionType(selected: CompleterItem) {
    if (selected) {
      this.transType = selected.originalObject.tranTypeDescription
    }
  }

  /* Get Province List for Predictive Search */
  getProvinceList() {
    var URL = UftApi.getPredectiveProvinceCode;
    this.hmsDataService.get(URL).subscribe(data => {
      if (data.code == 200) {
        this.provinceList = data.result;
        this.provinceDataRemote = this.completerService.local(
          this.provinceList,
          "provinceName",
          "provinceName"
        );
        // For Log #925 multiselet province dropdown
        for (let k = 0; k < this.provinceList.length; k++) {
          this.provinceData.push({ 'id': this.provinceList[k].provinceName, 'itemName': this.provinceList[k].provinceName });
        };
      }
    })
  }

  onProvinceSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedProvinceKey = (selected.originalObject.provinceKey).toString();
      this.selectedProvinceName = (selected.originalObject.provinceName).toString();
    }
    else {
      this.selectedProvinceKey = '';
    }
  }

  addOTP() {
    this.modalHeading = "Adjust PAP"
    if (this.showAdjustPAP) {
      this.addOTPform.controls['otp_transactionDesc'].setValidators([Validators.required]);
      this.addOTPform.controls['otp_transactionDesc'].updateValueAndValidity();
      this.addOTPform.controls['otp_transactionReference'].setValidators([Validators.required]);
      this.addOTPform.controls['otp_transactionReference'].updateValueAndValidity()
    }
    if (this.unitFinancialTranCd == '80' || this.unitFinancialTranCd == '90' || this.unitFinancialTranCd == '91' || this.unitFinancialTranCd == '99') {
      for (var i = 0; i < this.transactionTypeList.length; i++) {
        if (this.transactionTypeList[i].tranCd == this.unitFinancialTranCd) {
          this.cashtranstype = this.transactionTypeList[i].mergedDescription
        }
      }
    }
    this.getViewOfCashPayments(this.unitFinancialTransKey).then(res => {
      this.getViewOfCompCurrentBal().then(res => {
        this.addOTPform.patchValue({
          "otp_companyName": this.unitFinancialCompanyName,
          "otp_transactionAmt": this.uftData['unitFinancialTransAmt'],
          "otp_transactionDesc": this.uftData['unitFinancialTransDesc'],
          "otp_transactionReference": this.uftData['unitFinancialTransRef'],
          "otp_accTrans": this.changeDateFormatService.convertStringDateToObject(this.uftData['unitFinancialTransDt']),
          "otp_transactionType": this.cashtranstype,
          "otp_entryDate": this.changeDateFormatService.getToday(),
          "otp_currentbalance": this.compBalData
        })
        this.showLoader = false
      })
    })
  }

  resetOTP() {
    this.addOTPform.reset();
    this.isWriteOffForm = false;
    this.showAdjustPAP = false;
    this.showMisc = false;
    this.showWriteOff = false
    this.unitFinancialTransKey = '';
    this.isDisable = false;
    this.isDisableReversePap = false;
    this.generateRefundForm.controls['currentBalance'].setValue('')
    this.companyKey = ''
    $('table td').removeClass('highlightedRow');
    // Below boolean is to check if new entry saved to perform main search correctly in background.
    this.paymentSave = false
  }

  cashPay() {
    this.addOTPform.controls['payment_type'].setValue('cash_payment');
    this.unitFinancialTransKey = '';
    this.isDisable = false;
    this.showMisc = false;
    this.showWriteOff = false
    $('table td').removeClass('highlightedRow');
    this.modalHeading = "One Time Payment1"
    /* For Cash payment 91 code*/
    for (var i = 0; i < this.transactionTypeList.length; i++) {
      if (this.transactionTypeList[i].tranCd == '91') {
        this.cashtranstype = this.transactionTypeList[i].mergedDescription
        this.transCodeKey = this.transactionTypeList[i].tranCdKey
      }
    }
    this.addOTPform.patchValue({
      "otp_transactionType": this.cashtranstype,
      "otp_transactionDesc": 'Single',
      "otp_accTrans": this.changeDateFormatService.getToday(),
    })
    this.addOTPform.controls['otp_transactionAmt'].updateValueAndValidity()
    this.addOTPform.controls['otp_transactionDesc'].clearValidators();
    this.addOTPform.controls['otp_transactionDesc'].updateValueAndValidity();
    this.addOTPform.controls['otp_transactionReference'].clearValidators();
    this.addOTPform.controls['otp_transactionReference'].updateValueAndValidity();
    this.getPaymentTypeList(this.companyKey);
  }

  /* Save OTP form */

  submitOTP() {
    if (this.addOTPform.valid) {
      this.showLoader = true;
      var submitData
      if (this.unitFinancialTransKey) {
        if (this.showAdjustPAP) {
          submitData = {
            "unitFinancialTransKey": this.unitFinancialTransKey,
            "transactionAmt": this.addOTPform.value.otp_transactionAmt,
            "transactionRefernece": this.addOTPform.value.otp_transactionReference,
            "transactionDescription": this.addOTPform.value.otp_transactionDesc,
          }
          this.hmsDataService.postApi(UftApi.adjustTransactionUrl, submitData).subscribe(
            data => {
              if (data.code == 200 && data.hmsMessage.messageShort == "SUCCESS") {
                this.showLoader = false;
                this.exDialog.openMessage('Done').subscribe((val) => {
                  if (!val) {
                    this.hmsDataService.OpenCloseModal('closeOTP')
                    this.showAdjustPAP = false;
                    this.unitFinTransactionListFilter('unitFinancialTransactionList')
                    this.companyKey = '';
                  }
                });
              }
            }
          )
        }
        else if (this.showMisc) {
          if (!this.transcdkey) {
            this.transcdkey = 70
          }
          if (!this.companyKey) {
            this.companyKey = this.uftData['coKey']
          }
          submitData = {
            "coKey": this.companyKey
          }
          this.hmsDataService.postApi(UftApi.reCalcOpenClosBalCompanyUrl, submitData).subscribe(
            data => {
              if (data.code == 200 && data.hmsMessage.messageShort == "SUCCESS") {
                submitData = {
                  "unitFinancialTransKey": this.unitFinancialTransKey,
                  "coKey": this.companyKey,
                  "tranCdKey": this.transcdkey,
                  "provinceName": null,
                  "countryName": null,
                  "unitFinancialTransAmt": this.addOTPform.value.otp_transactionAmt,
                  "unitFinancialTransRef": this.addOTPform.value.otp_transactionReference,
                  "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.otp_accTrans),
                  "unitFinancialTransDesc": this.addOTPform.value.otp_transactionDesc,
                  "unitFinTranOpenBalAmt": this.compBalData,
                  "writeOff": 'T',
                }
                this.hmsDataService.postApi(UftApi.saveAndUpdateUnitFinancialTransactionUrl, submitData).subscribe(
                  data => {
                    if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
                      this.toastrService.success(this.translate.instant('uft.toaster.miscellaneousChargedSuccess'));
                      this.unitFinancialTransKey = data.result.unitFinancialTransKey;
                      this.getPaymentTypeList(data.result.coKey);
                      this.addOTPform.controls['otp_companyName'].reset();
                      this.addOTPform.controls['otp_transactionAmt'].reset();
                      this.addOTPform.controls['otp_currentbalance'].reset();
                      this.addOTPform.controls['otp_transactionDesc'].setValue('MISC. CHARGES');
                      this.getViewOfCashPayments(this.unitFinancialTransKey).then(res => {
                        this.getViewOfCompCurrentBal().then(res => {
                        })
                      });
                      this.companyKey = '';
                      this.companyCoId = '';
                      this.showLoader = false;
                    }
                  }
                )
                this.showLoader = false;
              }
            }
          )
        }
      }
      else if (this.showMisc) {
        if (!this.transcdkey) {
          this.transcdkey = 70
        }
        if (!this.companyKey) {
          this.companyKey = this.uftData['coKey']
        }
        submitData = {
          "coKey": this.companyKey
        }
        this.hmsDataService.postApi(UftApi.reCalcOpenClosBalCompanyUrl, submitData).subscribe(
          data => {
            if (data.code == 200 && data.hmsMessage.messageShort == "SUCCESS") {
              submitData = {
                "unitFinancialTransKey": '',
                "coKey": this.companyKey,
                "tranCdKey": this.transcdkey,
                "provinceName": null,
                "countryName": null,
                "unitFinancialTransAmt": this.addOTPform.value.otp_transactionAmt,
                "unitFinancialTransRef": this.addOTPform.value.otp_transactionReference,
                "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.otp_accTrans),
                "unitFinancialTransDesc": this.addOTPform.value.otp_transactionDesc,
                "unitFinTranOpenBalAmt": this.compBalData,
                "writeOff": 'T',

              }
              this.hmsDataService.postApi(UftApi.saveAndUpdateUnitFinancialTransactionUrl, submitData).subscribe(
                data => {
                  if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
                    this.toastrService.success(this.translate.instant('uft.toaster.miscellaneousChargedSuccess'));
                    this.getPaymentTypeList(data.result.coKey);
                    this.addOTPform.controls['otp_companyName'].reset();
                    this.addOTPform.controls['otp_transactionAmt'].reset();
                    this.addOTPform.controls['otp_currentbalance'].reset();
                    this.addOTPform.controls['otp_transactionDesc'].setValue('MISC. CHARGES');
                    this.unitFinancialTransKey = data.result.unitFinancialTransKey;
                    this.getViewOfCashPayments(this.unitFinancialTransKey).then(res => {
                      this.getViewOfCompCurrentBal().then(res => {
                        this.showLoader = false
                      })
                    });
                    this.companyKey = '';
                    this.companyCoId = '';
                    if (this.showUnitFinTransList) {
                      this.paymentSave = true
                      this.getUnitFinancialTransactionList()
                    }
                  }
                }
              )
              this.showLoader = false;
            }
            this.showLoader = false;
          }
        )
      }
      else if (this.showWriteOff) {
        let writeOffDataRequest = {
          "unitFinancialTransKey": "",
          "coKey": this.companyKey,
          "tranCdKey": 99,
          "provinceName": "",
          "countryName": "",
          "unitFinancialTransAmt": this.addOTPform.value.otp_transactionAmt,
          "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.otp_accTrans),
          "unitFinancialTransDesc": this.addOTPform.value.otp_transactionDesc,
          "unitFinancialTransRef": this.addOTPform.value.otp_transactionReference,
          "coPaySumKey": 0,
          "coRefundPayKey": 0,
          "divisionKey": 0,
          "eftCoPayKey": 0,
          "payReconDetailKey": 0,
          "paymentSumKey": 0,
          "plansKey": 0,
          "unitKey": 0,
          "unitFinTranOpenBalAmt": this.compBalData,
          "unitFinTransCloseBalAmt": '',
          "unitFinancialDispCd": "",
          "writeOff": 'T',
          "createdOn": this.changeDateFormatService.convertDateObjectToString(this.todayDate)
        }
        var url = UftApi.saveAndUpdateUnitFinancialTransactionUrl
        /* Confirm Popup Start Here */
        var action = "cancel";
        this.showLoader = false;
        this.exDialog.openConfirm(this.translate.instant('uft.toaster.writeOffConfirmation'))
          .subscribe((value) => {
            if (value) {
              this.showWriteOff = true;
              this.hmsDataService.postApi(url, writeOffDataRequest).subscribe(data => {
                if (data.code == 200 && data.status == "OK") {
                  this.reload = true
                  this.coKey = data.result.coKey
                  this.uftKey = data.result.unitFinancialTransKey
                  this.addOTPform.controls['otp_companyName'].reset();
                  this.addOTPform.controls['otp_transactionAmt'].reset();
                  this.addOTPform.controls['otp_currentbalance'].reset();
                  this.addOTPform.controls['otp_transactionDesc'].setValue('Surplus / Other');
                  this.getPaymentTypeList(data.result.coKey);
                  this.toastrService.success(this.translate.instant('uft.toaster.writeOffSuccess'))
                  this.reCalOfOpenClosingBal(this.coKey)
                  this.getViewOfRefundByUftKey(this.uftKey).then(res => {
                    this.getViewOfCompCurrentBal().then(res => {
                    })
                  })
                  this.companyKey = '';
                  this.companyCoId = ''
                  if (this.showUnitFinTransList) {
                    this.paymentSave = true
                    this.getUnitFinancialTransactionList()
                  }
                }
                this.unitFinancialTransKey = ''
                this.isDisable = false;
                $('table td').removeClass('highlightedRow');
              })
            } else {
              this.addOTPform.reset();
            }
          })
      }
      else {
        submitData = {
          "unitFinancialTransKey": '',
          "coKey": +this.companyKey,
          "tranCdKey": 91,
          "provinceName": null,
          "writeOff": 'T',
          "countryName": null,
          "unitFinTranOpenBalAmt": this.compBalData,
          "unitFinancialTransAmt": this.addOTPform.value.otp_transactionAmt,
          "unitFinancialTransRef": this.addOTPform.value.otp_transactionReference,
          "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.otp_accTrans),
          "unitFinancialTransDesc": this.addOTPform.value.otp_transactionDesc,
        }
        this.hmsDataService.postApi(UftApi.saveAndUpdateUnitFinancialTransactionUrl, submitData).subscribe(
          data => {
            if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this.toastrService.success(this.translate.instant('uft.toaster.otpSuccess'));
              this.addOTPform.controls['otp_companyName'].reset();
              this.addOTPform.controls['otp_transactionAmt'].reset();
              this.addOTPform.controls['otp_currentbalance'].reset();
              this.addOTPform.controls['otp_transactionDesc'].setValue('Single');
              this.getPaymentTypeList(data.result.coKey);
              this.showAdjustPAP = false;
              this.companyKey = '';
              this.companyCoId = ''
              if (this.showUnitFinTransList) {
                // Below boolean and method is to perform correct main search in background.                            
                this.paymentSave = true
                this.getUnitFinancialTransactionList()
              }
              this.showLoader = false;
            }
          }
        )
      }
    }
    else {
      this.validateAllFormFields(this.addOTPform)
    }
  }

  /*   REFUND & WritOff SCREEN START HERE       */
  enableAddMode() {
    this.generateRefundForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    this.buttonText = "Save"
  }

  // Method for enable View Mode
  refundFinancialTransaction(type) {
    this.showWriteOff = true;
    this.showMisc = false
    this.showLoader = true;
    this.uftKey = ""
    this.generateRefundForm.enable();
    this.todayDate = this.changeDateFormatService.getToday();
    this.enableAddMode()
    var planType;
    if (type == "refundPopup") {
      if (this.refundPDS) {
        this.refundRadioSelected(81)
        this.generateRefundForm.patchValue({
          'transactionType': '81',
        })
      } else {
        this.refundRadioSelected(80)
        this.generateRefundForm.patchValue({
          'transactionType': '80',
        })
      }
      this.isRefundForm = true
      this.isWriteOffForm = false
      this.generateRefundForm.controls['companyEffectiveOn'].setValidators(Validators.required);
      this.generateRefundForm.controls['companyEffectiveOn'].updateValueAndValidity();
      this.generateRefundForm.controls['yearEndDate'].setValidators(Validators.required);
      this.generateRefundForm.controls['yearEndDate'].updateValueAndValidity();
      this.generateRefundForm.controls['yearEndBalance'].setValidators(Validators.required);
      this.generateRefundForm.controls['yearEndBalance'].updateValueAndValidity();
      this.generateRefundForm.controls['standardPapAmount'].setValidators(Validators.required);
      this.generateRefundForm.controls['standardPapAmount'].updateValueAndValidity();
      this.generateRefundForm.patchValue({
        'accTransDate': this.todayDate,
        'transactionDesc': 'Surplus / Other',
        'entryDate': this.todayDate,
        'transactionAmount': this.currentUserService.convertAmountToDecimalWithoutDoller(0),
        'yearEndBalance': this.currentUserService.convertAmountToDecimalWithoutDoller(0),
        'standardPapAmount': this.currentUserService.convertAmountToDecimalWithoutDoller(0),
        'refundAmount': this.currentUserService.convertAmountToDecimalWithoutDoller(0)
      })
      this.getCompanyDetailsByCokey(this.companyKey).then(res => {
        if (this.firstStepResp == 1) {
          this.getViewOfCompCurrentBal().then(res => {
            this.getViewOfCompanyRefundInfo(this.companyKey);
            this.showLoader = false;
          })
          this.getBankAccountStatus(this.companyKey)
        } else {
          this.showLoader = false;
        }
        this.generateRefundForm.controls.currentBalance.disable();
        this.generateRefundForm.controls.entryDate.disable();
        this.generateRefundForm.controls.companyEffectiveOn.disable();
        this.generateRefundForm.controls.yearEndDate.disable();
        this.generateRefundForm.controls.yearEndBalance.disable();
        this.generateRefundForm.controls.standardPapAmount.disable();
        this.generateRefundForm.controls.refundAmount.disable();
      })
      this.getRefundTypeList(this.companyKey)
    }
    if (type == "writeOffPopup") {
      planType = "99-Write-Off Plan Balance"
      for (var i = 0; i < this.transactionTypeList.length; i++) {
        if (this.transactionTypeList[i].tranCd == '99') {
          this.transCodeKey = this.transactionTypeList[i].tranCdKey
        }
      }
      this.isWriteOffForm = true
      this.isRefundForm = false
      this.generateRefundForm.controls['companyEffectiveOn'].clearValidators();
      this.generateRefundForm.controls['companyEffectiveOn'].updateValueAndValidity();
      this.generateRefundForm.controls['yearEndDate'].clearValidators();
      this.generateRefundForm.controls['yearEndDate'].updateValueAndValidity();
      this.generateRefundForm.controls['yearEndBalance'].clearValidators();
      this.generateRefundForm.controls['yearEndBalance'].updateValueAndValidity();
      this.generateRefundForm.controls['standardPapAmount'].clearValidators();
      this.generateRefundForm.controls['standardPapAmount'].updateValueAndValidity();
      this.showLoader = false;
      this.addOTPform.patchValue({
        'otp_accTrans': this.todayDate,
        'otp_transactionDesc': 'Surplus / Other',
        'otp_transactionType': planType,
        'otp_entryDate': this.todayDate,
      })
      this.addOTPform.controls.otp_currentbalance.disable();
      this.addOTPform.controls.otp_transactionType.disable();
      this.addOTPform.controls.otp_entryDate.disable();
      this.getPaymentTypeList(this.companyKey);
    }
    if (this.showWriteOff) {
      this.addOTPform.controls['otp_transactionAmt'].setValidators([CustomValidators.transAmountNegative])
      this.addOTPform.controls['otp_transactionAmt'].updateValueAndValidity();
    }
  }

  confirmWriteOffs(type) {
    if (this.uftBalance == 0) {
      var action = "cancel";
      this.exDialog.openConfirm("If Write-Off Amount does not bring the total  of all Transactions for the company balance to ZERO. Do you want to Continue ?")
        .subscribe((value) => {
          if (value) {
            this.showWriteOff = true;
            this.hmsDataService.OpenCloseModal('uftrcGenerateRefundBtn');
            this.refundFinancialTransaction(type);
          } else {
            this.resetWriteOffPopup();
          }
        })
    } else {
      this.hmsDataService.OpenCloseModal('uftrcGenerateRefundBtn');
      this.refundFinancialTransaction(type);
    }
  }

  enableEditMode() {
    this.generateRefundForm.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.buttonText = "Update"
  }

  /* Generate Refund Popup Submit*/
  submitRefundForm(generateRefundForm) {
    if (!this.transRef) {
      this.transRef = this.generateRefundForm.value.transactionRef
    }
    if (!this.yearEndBalance) {
      this.yearEndBalance = this.generateRefundForm.value.yearEndBalance
    }
    if (!this.standardPapAmt) {
      this.standardPapAmt = this.generateRefundForm.value.standardPapAmount
    }
    if (!this.showPayeeInfo) {
      this.refundDataRequest = {
        "unitFinancialTransKey": "",
        "coKey": this.companyKey,
        "tranCdKey": this.transCode,
        "provinceName": "",
        "countryName": "",
        "unitFinancialTransAmt": this.generateRefundForm.value.transactionAmount,
        "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.generateRefundForm.value.accTransDate),
        "unitFinancialTransDesc": this.generateRefundForm.value.transactionDesc,
        "unitFinancialTransRef": this.transRef,  
        "coPaySumKey": 0,
        "coRefundPayKey": 0,
        "divisionKey": 0,
        "eftCoPayKey": 0,
        "payReconDetailKey": 0,
        "paymentSumKey": 0,
        "plansKey": 0,
        "unitKey": 0,
        "unitFinTranOpenBalAmt": this.yearEndBalance,
        "unitFinTransCloseBalAmt": this.standardPapAmt,
        "unitFinancialDispCd": "",
        "createdOn": this.changeDateFormatService.convertDateObjectToString(this.todayDate)
      }
    }
    else {
      this.refundDataRequest = {
        "unitFinancialTransKey": "",
        "coKey": this.companyKey,
        "tranCdKey": this.transCode,
        "unitFinancialTransAmt": this.generateRefundForm.value.transactionAmount,
        "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.generateRefundForm.value.accTransDate),
        "unitFinancialTransDesc": this.generateRefundForm.value.transactionDesc,
        "unitFinancialTransRef": this.transRef,
        "coPaySumKey": 0,
        "coRefundPayKey": 0,
        "divisionKey": 0,
        "eftCoPayKey": 0,
        "payReconDetailKey": 0,
        "paymentSumKey": 0,
        "plansKey": 0,
        "unitKey": 0,
        "unitFinTranOpenBalAmt": this.yearEndBalance,
        "unitFinTransCloseBalAmt": this.standardPapAmt,
        "unitFinancialDispCd": "",
        "createdOn": this.changeDateFormatService.convertDateObjectToString(this.todayDate),
        "payeeInd": "T",
        "payeeName": (this.generateRefundForm.value.name) != null ? (this.generateRefundForm.value.name) : '',
        "postalCd": (this.generateRefundForm.value.postalCode) != null ? (this.generateRefundForm.value.postalCode) : '',
        "cityName": (this.generateRefundForm.value.city) != null ? (this.generateRefundForm.value.city) : '',
        "provinceName": (this.generateRefundForm.value.province) != null ? (this.generateRefundForm.value.province) : '',
        "countryName": (this.generateRefundForm.value.country) != null ? (this.generateRefundForm.value.country) : '',
        "mailAddressLine1": (this.generateRefundForm.value.address) != null ? (this.generateRefundForm.value.address) : '',
        "mailAddressLine2": (this.generateRefundForm.value.address2) != null ? (this.generateRefundForm.value.address2) : ''
      }
    }
    var url = UftApi.saveAndUpdateUnitFinancialTransactionUrl
    if (this.generateRefundForm.valid) {
      if (this.isRefundForm) {
        this.hmsDataService.postApi(url, this.refundDataRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.reload = true;
            this.coKey = data.result.coKey
            this.uftKey = data.result.unitFinancialTransKey
            this.toastrService.success(this.translate.instant('uft.toaster.refundSuccess'))
            this.getRefundTypeList(this.coKey)
            this.reCalOfOpenClosingBal(this.coKey)
            this.getViewOfRefundByUftKey(this.uftKey).then(res => {
              this.getViewOfCompCurrentBal().then(res => {
                this.generateRefundForm.patchValue({
                  "currentBalance": this.compBalData,
                  'accTransDate': this.changeDateFormatService.convertStringDateToObject(this.uftData.unitFinancialTransDt),//this.todayDate,//this.changeDateFormatService.convertStringDateToObject(this.uftData.unitFinancialTransDt),
                  'transactionDesc': this.uftData.unitFinancialTransDesc,//'Surplus / Other',
                })
              })
            })
            this.companyKey = ''
          } else if (data.code == 400 && data.status == "BAD_REQUEST") {
            this.toastrService.error(this.translate.instant('uft.toaster.recordSaveFail'))
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotSave'))
          }
          this.unitFinancialTransKey = ''
          this.isDisable = false;
          $('table td').removeClass('highlightedRow');
        })
      }
    } else {
      this.validateAllFormFields(this.generateRefundForm)
    }
  }

  isAmountDebit(event, controlName) {
    if (this.isRefundForm) {
      if (event.target.value) {
        if (event.target.value.indexOf(".") == -1) {
          this.generateRefundForm.controls[controlName].patchValue(event.target.value + '.00');
        }
        this.generateRefundForm.controls[controlName].setValidators([Validators.required])
        this.generateRefundForm.controls[controlName].updateValueAndValidity();
      }
    }
    if (event.target.value) {
      if (event.target.value.indexOf(".") == -1) {
        this.addOTPform.controls[controlName].patchValue(event.target.value + '.00');
      }
    }
    if (this.isWriteOffForm) {
      this.generateRefundForm.controls['transactionAmount'].setValidators([Validators.required, CustomValidators.transAmountNegative])
      this.generateRefundForm.controls['transactionAmount'].updateValueAndValidity();
    }
  }

  resetWriteOffPopup() {
    this.generateRefundForm.reset();
    this.showWriteOff = false;
    this.unitFinancialTransKey = '';
    this.isDisable = false;
    this.hmsDataService.OpenCloseModal('uftWriteOffsBtn')
    $('table td').removeClass('highlightedRow');
  }

  /* 1st Get company Detail by Cokey */
  getCompanyDetailsByCokey(companyKey) {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.getCompanyDetailByCoKeyUrl;
      this.coKeyReq = { "coKey": companyKey }
      this.hmsDataService.postApi(url, this.coKeyReq).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.firstStepResp = 1;
          this.companyKey = data.result.coKey
          this.compName = data.result.mergedDescription
          var effDate = data.result.effectiveOn
          if (effDate) {
            var myDate = this.changeDateFormatService.formatDate(effDate)
            this.compMainEffDate = this.changeDateFormatService.convertStringDateToObject(myDate)
          } else {
            this.compMainEffDate = ''
          }
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.compName = ''
          this.firstStepResp = 0
          resolve();
        }
      })
    })
    return promise;
  }

  /* 2nd Method for Call the get UFT By Key*/
  getViewOfRefundByUftKey(uftKey) {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.getUnitFinacialTransactionsByKeyUrl;
      this.refundKey = {
        "unitFinancialTransKey": uftKey,
        "dataTable": "F"
      }
      this.hmsDataService.postApi(url, this.refundKey).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.uftByKeyResp = 1
          this.showLoader = false
          this.uftData = data.result;
          this.companyKey = this.uftData.coKey
          this.uftTransRef = this.uftData.unitFinancialTransRef
          this.transactionDate = data.result.unitFinancialTransDt
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.uftByKeyResp = 0;
          this.showLoader = false
          resolve();
        }
      })
    })
    return promise;
  }

  /* 3rd Method for getting the company current balance based on CoKey*/
  getViewOfCompCurrentBal() {
    let promise = new Promise((resolve, reject) => {
      var balUrl = UftApi.getCompanyBalanceUrl + '/' + this.companyKey
      this.hmsDataService.getApi(balUrl).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if (Number.isInteger(data.result)) {
            this.compBalData = data.result + '.00';
          } else {
            this.compBalData = data.result;
          }
          if (parseFloat(this.compBalData) < 0) {
            this.balMinusResp = 1
          } else {
            this.balMinusResp = 0
          }
          if (parseFloat(this.compBalData) == 0 || parseFloat(this.compBalData) == 0.00) {
            this.balZeroResp = 1
          } else {
            this.balZeroResp = 0
          }
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.compBalData = ""
          resolve();
        }
      })
    })
    return promise
  }

  //  4th Method
  getChequeNo() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.getChequeNumUrl;
      let planTypeReq = { "planType": "Q" }
      this.hmsDataService.postApi(url, planTypeReq).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.chequeRes = data.result;
          resolve();
        }
        else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.chequeRes = ""
        }
      })
    })
    return promise;
  }

  /* 5th Method for getting the response of First two methods*/
  getViewOfCompanyRefundInfo(type) {
    var infoUrl = UftApi.getCompanyRefundInfoByCoKeyUrl
    this.coInfoKey = { "coKey": type }
    this.hmsDataService.postApi(infoUrl, this.coInfoKey).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (Number.isInteger(data.result.companyRefundAmount)) {
          this.refundAmt = data.result.companyRefundAmount + '.00'
          this.refundTransAmt = Math.abs(data.result.companyRefundAmount) + '.00'
        } else {
          this.refundAmt = data.result.companyRefundAmount
          this.refundTransAmt = Math.abs(data.result.companyRefundAmount)
        }
        if (data.result.standardpapamt != undefined) {
          if (Number.isInteger(data.result.standardpapamt)) {
            this.standardPapAmt = data.result.standardpapamt + '.00'
          } else {
            this.standardPapAmt = data.result.standardpapamt
          }
        } else {
          this.standardPapAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        }
        if (data.result.yearendbalance != undefined) {
          if (Number.isInteger(data.result.yearendbalance)) {
            this.yearEndBalance = data.result.yearendbalance + '.00'
          } else {
            this.yearEndBalance = data.result.yearendbalance
          }
        } else {
          this.yearEndBalance = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        } this.generateRefundForm.patchValue({
          'companyNameNo': (this.compName) != '' ? this.compName : '',
          'transactionRef': (this.chequeRes) != '' ? this.chequeRes : '',
          'currentBalance': (this.compBalData) != '' ? this.compBalData : '',
          'transactionAmount': this.refundTransAmt,
          'companyEffectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'yearEndDate': this.changeDateFormatService.convertStringDateToObject(data.result.yearenddt),
          'yearEndBalance': (data.result.yearendbalance) != undefined ? (Number.isInteger(data.result.yearendbalance) ? data.result.yearendbalance + '.00' : data.result.yearendbalance) : this.currentUserService.convertAmountToDecimalWithoutDoller(0),
          'standardPapAmount': (data.result.standardpapamt) != undefined ? (Number.isInteger(data.result.standardpapamt) ? data.result.standardpapamt + '.00' : data.result.standardpapamt) : this.currentUserService.convertAmountToDecimalWithoutDoller(0),
          'refundAmount': (this.refundAmt) != undefined ? this.refundAmt : this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        })
      }
      else {
        this.refundAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        this.standardPapAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        this.yearEndBalance = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        this.refundTransAmt = this.currentUserService.convertAmountToDecimalWithoutDoller(0)
        this.generateRefundForm.patchValue({
          'companyNameNo': (this.compName) != '' ? this.compName : '',
          'transactionRef': (this.chequeRes) != '' ? this.chequeRes : '',
          'currentBalance': (this.compBalData) != '' ? this.compBalData : '',
          'transactionAmount': this.refundTransAmt,
          'yearEndBalance': this.yearEndBalance,
          'standardPapAmount': this.standardPapAmt,
          'refundAmount': this.refundAmt
        })
      }
    })
  }

  /* 6th Method for open closing balance for company*/
  reCalOfOpenClosingBal(key) {
    let reqData = { "coKey": key }
    this.hmsDataService.postApi(UftApi.reCalcOpenClosBalCompanyUrl, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
      }
    });
  }

  resetGenerateRefundForm() {
    this.generateRefundForm.reset()
    this.isDisable = false;
    this.isDisableReversePap = false;
    this.unitFinancialTransKey = '';
    $('table td').removeClass('highlightedRow');
    this.generateRefundForm.reset();
    this.addOTPform.controls['otp_currentbalance'].setValue('');
    if (this.reload) {
      this.unitFinTransactionListFilter('unitFinancialTransactionList');
    }
    this.compBalData = ''
    this.refundPDS = false
  }

  /**
   * Send reversal pap request
   */
  reversePap() {
    if (this.unitFinancialTransKey) {
      if (this.adjustedFlag == 'T') {
        this.toastrService.error(this.translate.instant('uft.toaster.transReversed'))
      } else {
        this.exDialog.openConfirm(this.translate.instant(this.translate.instant('uft.toaster.reverseAmtConfirm') + " '" + this.unitFinancialTransAmount + "' " + this.translate.instant('uft.toaster.forCompany') + " '" + this.unitFinancialCompanyName + "' ")).subscribe((value) => {
          if (value) {
            let reversePapData = {
              "unitFinancialTransKey": this.unitFinancialTransKey,
              "tranCd": this.unitFinancialTranCd,
              "transctionType": this.unitFinancialTransctionType
            }
            var reversePapURL = UftApi.reversePapUrl;
            this.hmsDataService.post(reversePapURL, reversePapData).subscribe(data => {
              if (data.code == 200 && data.status == 'OK') {
                this.toastrService.success(this.translate.instant('uft.toaster.reversePapSuccess'))
                this.unitFinTransactionListFilter('unitFinancialTransactionList');
              } else if (data.code == 400 && data.status == 'BAD_REQUEST') {
                this.toastrService.success(this.translate.instant('uft.toaster.notAuthForCreateReversePap'))
              } else {
                this.toastrService.success(this.translate.instant('uft.toaster.errorOccurCreateReversePap'))
              }
              $('table td').removeClass('highlightedRow')
              this.unitFinancialTransKey = '';
              this.isDisableReversePap = false;
              this.isDisable = false;
            });
          } else {
            return '';
          }
        });
      }
    } else {
      this.toastrService.info(this.translate.instant('uft.toaster.plsSelectAtleastOneUftFrmList'))
    }
  }

  getViewOfCashPayments(unitFinancialTransKey) {
    // this.showLoader = false;
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.getUnitFinacialTransactionsByKeyUrl;
      this.refundKey = {
        "unitFinancialTransKey": unitFinancialTransKey,
        "dataTable": "F"
      }
      this.hmsDataService.postApi(url, this.refundKey).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.uftData = data.result;
          this.companyKey = data.result.coKey
          resolve();
        }
      })
    })
    return promise;
  }

  onSelectedCompany(selected: CompleterItem) {
    if (selected) {
      this.companyKey = selected.originalObject.coKey.toString();
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

  ngOnBlur() {
    if (this.addOTPform.value.otp_companyName == '') {
      this.addOTPform.patchValue({
        "otp_currentbalance": '',
      })
    }
    if (this.generateRefundForm.value.companyNameNo == '') {
      this.generateRefundForm.patchValue({
        "currentBalance": '',
        'transactionDesc': 'Surplus / Other',
        'transactionAmount': this.currentUserService.convertAmountToDecimalWithoutDoller(0),
        'yearEndBalance': this.currentUserService.convertAmountToDecimalWithoutDoller(0),
        'standardPapAmount': this.currentUserService.convertAmountToDecimalWithoutDoller(0),
        'refundAmount': this.currentUserService.convertAmountToDecimalWithoutDoller(0),
        'companyEffectiveOn': '',
        'yearEndDate': ''
      })
      this.generateRefundForm.controls['transactionAmount'].clearValidators();
      this.generateRefundForm.controls['transactionAmount'].updateValueAndValidity();
    }
  }

  radioSelected(value) {
    if (value == 'cash_payment') {
      this.addOTPform.controls.otp_transactionType.disable();
      this.resetOTP();
      this.cashPay();
    }
    else if (value == 'write_off') {
      this.addOTPform.controls.otp_transactionType.disable();
      this.resetOTP();
      this.modalHeading = "Write Off";
      this.addOTPform.controls['payment_type'].setValue('write_off');
      var type = 'writeOffPopup'
      this.refundFinancialTransaction(type)
    }
    else if (value == 'misc_charges') {
      this.transcdkey = ''
      this.resetOTP();
      this.addOTPform.controls.otp_transactionType.enable();
      this.addOTPform.controls['payment_type'].setValue('misc_charges');
      this.miscCharges();
    }
  }

  getPredictiveCompanySearchData(completerService) {
    this.companyListData = completerService.remote(
      null,
      "coName,coId",
      "mergedDescription"
    );
    this.companyListData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': this.currentUserService.token } });
    this.companyListData.urlFormater((term: any) => {
      return UftApi.getPredictiveCompanyListUrl + '/0' + `/${term}`;
    });
    this.companyListData.dataField('result');
  }

  exportUftSearchList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    if (this.getLowerSearch) {
      var params = this.dataTableService.getFooterParamsUFTSearch("unitFinancialTransactionList");
      this.uftRequest = {
        "start": 0,
        "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
        'companyname': params[0].value,
        'transactionDateStart': params[1].value,
        'transactionDateEnd': params[2].value,
        'transctionType': params[3].value,
        'provinceName': params[4].value,
        'transactionRefernece': params[5].value,
        'transactionAmt': params[6].value,
        'balance': params[7].value,
        'transactionDescription': params[8].value,
        'coRefundChqRefNum': params[9].value,
        'planId': params[10].value,
        'divisionId': params[11].value,
        'unitId': params[12].value,
        'entrydateStart': params[13].value,
        'entrydateEnd': params[14].value,
        'provinceNameList': this.provinceArray,
        'transctionTypeList': this.transactionTypeArray,
        'paramApplication': paramApp
      }
    }
    else {
      this.uftRequest = {
        "start": 0,
        "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
        'companyname': this.unitFinancialTransactionForm.value.companyNameOrNo,
        'coKey': this.companyKey,
        'coId': this.companyCoId,
        'transactionDateStart': this.unitFinancialTransactionForm.value.accTransDateFirst != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFirst) : '',
        'transactionDateEnd': this.unitFinancialTransactionForm.value.accTransDateFromSecond != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFromSecond) : '',
        'transctionType': this.unitFinancialTransactionForm.value.transactionType,
        'transactionDescription': this.unitFinancialTransactionForm.value.transactionRefDesc,
        'provinceName': this.unitFinancialTransactionForm.value.provinceName,
        'entrydate': this.unitFinancialTransactionForm.value.entryDate != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.entryDate) : '',
        'planId': this.unitFinancialTransactionForm.value.planNo,
        'divisionId': this.unitFinancialTransactionForm.value.divisionNo,
        'unitId': this.unitFinancialTransactionForm.value.unitNo,
        'active': (this.unitFinancialTransactionForm.value.comActive == true) ? 'T' : 'F',
        'inActive': (this.unitFinancialTransactionForm.value.comInactive == true) ? 'T' : 'F',
        'paramApplication': paramApp
      }
    }
    var transactionSearchURL = UftApi.exportExcelForUFTSearchUrl;
    if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
      this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
        if (value) {
          this.exportFile(transactionSearchURL, this.uftRequest);
        }
      });
    } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
      this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
        if (value) {
          this.exportFile(transactionSearchURL, this.uftRequest);
        }
      });
    } else {
      this.exportFile(transactionSearchURL, this.uftRequest);
    }
  }

  exportFile(URL, uftRequest) {
    this.showLoader = false
    this.loader = "Loading File....."
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, uftRequest).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loader = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loader = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          a.download = "UFT-List" + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
      }
    })
  }

  getAuthCheck(uftChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.uftArray = [{
        "searchUft": "T",
        "cretaePap": 'T',
        "refund": 'T',
        "payments": 'T',
        "adjustPap": 'T',
        "reversePap": 'T'
      }]
    } else {
      for (var i = 0; i < uftChecks.length; i++) {
        authCheck[uftChecks[i].actionObjectDataTag] = uftChecks[i].actionAccess
      }
      this.uftArray = [{
        "searchUft": authCheck['UFS288'],
        "cretaePap": authCheck['UFS319'],
        "refund": authCheck['UFS320'],
        "payments": authCheck['UFS321'],
        "adjustPap": authCheck['UFS322'],
        "reversePap": authCheck['UFS323']
      }]
    }
    return this.uftArray
  }

  zeroPatchWithAmt(event, controlName) {
    if (this.isRefundForm) {
      if (event.target.value) {
        if (event.target.value.indexOf(".") == -1) {
          this.generateRefundForm.controls[controlName].patchValue(event.target.value + '.00');
        }
      }
    }
  }

  exportUftSearchListPDF() {
    if (this.unitFinancialTransactionForm.value.companyNameOrNo) {
      var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
      if (this.getLowerSearch) {
        var params = this.dataTableService.getFooterParamsUFTSearch("unitFinancialTransactionList");
        this.uftRequest = {
          "start": 0,
          "length": this.dataTableService.totalRecords,
          'companyname': params[0].value,
          'transactionDateStart': params[1].value,
          'transactionDateEnd': params[2].value,
          'transctionType': params[3].value,
          'provinceName': params[4].value,
          'transactionRefernece': params[5].value,
          'transactionAmt': params[6].value,
          'balance': params[7].value,
          'transactionDescription': params[8].value,
          'coRefundChqRefNum': params[9].value,
          'planId': params[10].value,
          'divisionId': params[11].value,
          'unitId': params[12].value,
          'entrydateStart': params[13].value,
          'entrydateEnd': params[14].value,
          'provinceNameList': this.provinceArray,
          'transctionTypeList': this.transactionTypeArray,
          'paramApplication': paramApp
        }
      }
      else {
        this.uftRequest = {
          "start": 0, "length": this.dataTableService.totalRecords, 'companyname': this.unitFinancialTransactionForm.value.companyNameOrNo, 'coKey': this.companyKey, 'coId': this.companyCoId, 'transactionDateStart': this.unitFinancialTransactionForm.value.accTransDateFirst != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFirst) : '', 'transactionDateEnd': this.unitFinancialTransactionForm.value.accTransDateFromSecond != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFromSecond) : '',
          'transctionType': this.unitFinancialTransactionForm.value.transactionType,
          'transactionDescription': this.unitFinancialTransactionForm.value.transactionRefDesc, 'provinceName': this.unitFinancialTransactionForm.value.provinceName, 'entrydate': this.unitFinancialTransactionForm.value.entryDate != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.entryDate) : '',
          'planId': this.unitFinancialTransactionForm.value.planNo, 'divisionId': this.unitFinancialTransactionForm.value.divisionNo, 'unitId': this.unitFinancialTransactionForm.value.unitNo, 'active': (this.unitFinancialTransactionForm.value.comActive == true) ? 'T' : 'F', 'inActive': (this.unitFinancialTransactionForm.value.comInactive == true) ? 'T' : 'F',
          'paramApplication': paramApp
        }
      }
      //Start PDF
      var url = UftApi.unitFinancialTransactionSearch;
      this.showLoader = true
      this.hmsDataService.postApi(url, this.uftRequest).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          var doc = new jsPDF('p', 'pt', 'a3');
          var columns = [
            {
              "coId": 'Company#',
              "transactionDate": 'Transaction Date',
              "transctionType": "Transction Type",
              "provincecode": "Province",
              "transactionRefernece": "Transaction Ref.",
              "transactionAmt": 'Transaction Amount',
              "balance": 'Balance',
              "transactionDescription": "Transaction Description",
              "planId": "Plan No.",
              "divisionId": "Division No.",
              "unitId": "Unit No.",
              "entrydate": "Entry Date"
            }
          ];
          this.showLoader = false;
          let head = [];
          let body = [];
          let total = 0;
          for (var i in data.result.data) {
            body.push({
              "coId": { 'content': data.result.data[i].coId },
              "transactionDate": { 'content': data.result.data[i].transactionDate },
              "transctionType": { 'content': data.result.data[i].transctionType },
              "provincecode": { 'content': data.result.data[i].provincecode },
              "transactionRefernece": { 'content': data.result.data[i].transactionRefernece },
              "transactionAmt": { 'content': this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].transactionAmt) },
              "balance": { 'content': this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].balance) },
              "transactionDescription": { 'content': data.result.data[i].transactionDescription },
              "planId": { 'content': data.result.data[i].planId },
              "divisionId": { 'content': data.result.data[i].divisionId },
              "unitId": { 'content': data.result.data[i].unitId },
              "entrydate": { 'content': data.result.data[i].entrydate }
            });
            total = total + data.result.data[i].balance;
          }
          body.push({
            "transactionAmt": { 'content': 'Balance' },
            "balance": { 'content': this.currentUserService.convertAmountToDecimalWithDoller(total) }
          });
          //Start Header
          var headerobject = [];
          headerobject.push({
            'gridHeader1': this.unitFinancialTransactionForm.value.companyNameOrNo
          });
          this.pdfHeader(doc, headerobject)
          //End Header 
          doc.autoTable({
            head: columns,
            body: body,
            styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
            columnStyles: {
              "coId": { halign: 'left' },
              "transactionDate": { halign: 'right' },
              "transctionType": { halign: 'right' },
              "transAmt": { halign: 'right' },
              "planId": { halign: 'right' },
              "divisionId": { halign: 'right' },
              "unitId": { halign: 'right' },
              "provincecode": { halign: 'right' },
              "transactionRefernece": { halign: 'right' },
              "transactionAmt": { halign: 'right' },
              "balance": { halign: 'right' },
              "transactionDescription": { halign: 'right' },
              "entrydate": { halign: 'right' }
            },
            headStyles: {
              fillColor: [255, 255, 255],
              textColor: [0, 0, 0],
              lineColor: [215, 214, 213],
              lineWidth: 1,
            },
            didParseCell: function (data) {
              if (data.section == 'head' && data.column.index != 0) {
                data.cell.styles.halign = 'right';
              }
            },
            startY: 100,
            startX: 40,
            theme: 'grid',
          });
          this.pdfFooter(doc, 1);
          doc.save('Company Transaction List.pdf');
        } else if (data.code == 404 && data.status == 'NOT_FOUND') {
          this.showLoader = false
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        } else {
        }
      });
      //End PDF
    } else {
      this.toastrService.error(this.translate.instant('uft.toaster.pleaseFillCompNameAndNum'))
    }
  }

  exportUftSearchListPDF1() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    if (this.getLowerSearch) {
      this.toastrService.success(this.translate.instant('uft.toaster.lowerSearchFilter'));
      var params = this.dataTableService.getFooterParams("unitFinancialTransactionList");
      var uftRequest = {
        "start": 0,
        "length": this.dataTableService.totalRecords,
        'companyname': params[0].value,
        'transactionDate': params[1].value,
        'transctionType': params[2].value,
        'provinceName': params[3].value,
        'transactionRefernece': params[4].value,
        'transactionAmt': params[5].value,
        'balance': params[6].value,
        'transactionDescription': params[7].value,
        'coRefundChqRefNum': params[8].value,
        'planId': params[9].value,
        'divisionId': params[10].value,
        'unitId': params[11].value,
        'entrydate': params[12].value,
        'paramApplication': paramApp
      }
      //Start PDF
      var url = UftApi.unitFinancialTransactionSearch;
      this.showLoader = true
      this.hmsDataService.postApi(url, uftRequest).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          var doc = new jsPDF('p', 'pt', 'a3');
          var columns = [
            { title: 'Company#', dataKey: 'coId' },
            { title: 'Date', dataKey: 'transactionDate' },
            { title: 'Transction Type', dataKey: 'transctionType' },
            { title: 'Trans Amount', dataKey: 'transAmt' },
            { title: 'Plan#', dataKey: 'planId' },
            { title: 'Div#', dataKey: 'divisionId' },
            { title: 'Unit#', dataKey: 'unitId' },
            { title: 'Prov. Cd', dataKey: 'provincecode' },
            { title: 'Trans. Ref.', dataKey: 'transactionRefernece' },
            { title: 'Trans. Amt', dataKey: 'transactionAmt' },
            { title: 'Balance', dataKey: 'balance' },
            { title: 'Trans. Desc.', dataKey: 'transactionDescription' },
            { title: 'Entry Date', dataKey: 'entrydate' }
          ];
          this.showLoader = false;
          for (var i in data.result.data) {
            data.result.data[i].transactionAmt = data.result.data[i].transactionAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].transactionAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0);
            data.result.data[i].balance = data.result.data[i].balance != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].balance) : this.currentUserService.convertAmountToDecimalWithDoller(0);
            data.result.data[i].transactionDate = data.result.data[i].transactionDate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].transactionDate) : '';
            data.result.data[i].entrydate = data.result.data[i].entrydate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].entrydate) : ''
          }
          var rows = data.result.data;
          //Start Header
          var headerobject = [];
          headerobject.push({
            'gridHeader1': this.unitFinancialTransactionForm.value.companyNameOrNo
          });
          this.pdfHeader(doc, headerobject)
          //End Header 
          doc.autoTable(columns, rows, {
            styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
            columnStyles: {
              "coId": { halign: 'left' },
              "transactionDate": { halign: 'right' },
              "transctionType": { halign: 'right' },
              "transAmt": { halign: 'right' },
              "planId": { halign: 'right' },
              "divisionId": { halign: 'right' },
              "unitId": { halign: 'right' },
              "provincecode": { halign: 'right' },
              "transactionRefernece": { halign: 'right' },
              "transactionAmt": { halign: 'right' },
              "balance": { halign: 'right' },
              "transactionDescription": { halign: 'right' },
              "entrydate": { halign: 'right' }
            },
            headStyles: {
              fillColor: [255, 255, 255],
              textColor: [0, 0, 0],
              lineColor: [215, 214, 213],
              lineWidth: 1,
            },
            didParseCell: function (data) {
              if (data.section == 'head' && data.column.index != 0) {
                data.cell.styles.halign = 'right';
              }
            },
            startY: 100,
            startX: 40,
            theme: 'grid',
          });
          this.pdfFooter(doc, 1);
          doc.save('Company Transaction List.pdf');
        } else if (data.code == 404 && data.status == 'NOT_FOUND') {
          this.showLoader = false
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        } else {
        }
      });
      //End PDF
    } else {
      if (this.unitFinancialTransactionForm.value.companyNameOrNo) {
        var str = this.unitFinancialTransactionForm.value.companyNameOrNo;
        var n = str.search(this.companyNameOrNo_ReqParam);
        if (n == -1) {
          this.toastrService.error(this.translate.instant('uft.toaster.clickSearchBtn'));
          this.showLoader = false
        } else {
          //Start PDF
          var url = UftApi.unitFinancialTransactionSearch;
          this.showLoader = true
          var requestParam = {
            'active': this.unitFinancialTransactionForm.value.comActive == true ? 'T' : 'F',
            'companyname': this.unitFinancialTransactionForm.value.companyNameOrNo,
            'divisionId': this.unitFinancialTransactionForm.value.divisionNo,
            'entrydate': this.unitFinancialTransactionForm.value.entryDate != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.entryDate) : '',
            'inActive': this.unitFinancialTransactionForm.value.comInactive == true ? 'T' : 'F',
            'length': this.dataTableService.totalRecords,
            'planId': this.unitFinancialTransactionForm.value.planNo,
            'provinceName': this.unitFinancialTransactionForm.value.provinceName,
            'start': 0,
            'transactionDateEnd': this.unitFinancialTransactionForm.value.accTransDateFromSecond != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFromSecond) : '',
            'transactionDateStart': this.unitFinancialTransactionForm.value.accTransDateFirst != null ? this.changeDateFormatService.convertDateObjectToString(this.unitFinancialTransactionForm.value.accTransDateFirst) : '',
            'transactionDescription': this.unitFinancialTransactionForm.value.transactionRefDesc,
            'transctionType': this.unitFinancialTransactionForm.value.transactionType,
            'unitId': this.unitFinancialTransactionForm.value.unitNo
          }
          this.hmsDataService.postApi(url, requestParam).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              var doc = new jsPDF('p', 'pt', 'a3');
              var columns = [
                { title: 'Company#', dataKey: 'coId' },
                { title: 'Date', dataKey: 'transactionDate' },
                { title: 'Transction Type', dataKey: 'transctionType' },
                { title: 'Trans Amount', dataKey: 'transAmt' },
                { title: 'Plan#', dataKey: 'planId' },
                { title: 'Div#', dataKey: 'divisionId' },
                { title: 'Unit#', dataKey: 'unitId' },
                { title: 'Prov. Cd', dataKey: 'provincecode' },
                { title: 'Trans. Ref.', dataKey: 'transactionRefernece' },
                { title: 'Trans. Amt', dataKey: 'transactionAmt' },
                { title: 'Balance', dataKey: 'balance' },
                { title: 'Trans. Desc.', dataKey: 'transactionDescription' },
                { title: 'Entry Date', dataKey: 'entrydate' }
              ];
              this.showLoader = false;
              for (var i in data.result.data) {
                data.result.data[i].transactionAmt = data.result.data[i].transactionAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].transactionAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0);
                data.result.data[i].balance = data.result.data[i].balance != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].balance) : this.currentUserService.convertAmountToDecimalWithDoller(0);
                data.result.data[i].transactionDate = data.result.data[i].transactionDate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].transactionDate) : '';
                data.result.data[i].entrydate = data.result.data[i].entrydate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].entrydate) : ''
              }
              var rows = data.result.data;
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.unitFinancialTransactionForm.value.companyNameOrNo
              });
              this.pdfHeader(doc, headerobject)
              //End Header 
              doc.autoTable(columns, rows, {
                styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
                columnStyles: {
                  "coId": { halign: 'left' },
                  "transactionDate": { halign: 'right' },
                  "transctionType": { halign: 'right' },
                  "transAmt": { halign: 'right' },
                  "planId": { halign: 'right' },
                  "divisionId": { halign: 'right' },
                  "unitId": { halign: 'right' },
                  "provincecode": { halign: 'right' },
                  "transactionRefernece": { halign: 'right' },
                  "transactionAmt": { halign: 'right' },
                  "balance": { halign: 'right' },
                  "transactionDescription": { halign: 'right' },
                  "entrydate": { halign: 'right' }
                },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  lineColor: [215, 214, 213],
                  lineWidth: 1,
                },
                didParseCell: function (data) {
                  if (data.section == 'head' && data.column.index != 0) {
                    data.cell.styles.halign = 'right';
                  }
                },
                startY: 100,
                startX: 40,
                theme: 'grid',
              });
              this.pdfFooter(doc, 1);
              doc.save('Company Transaction List.pdf');
            } else if (data.code == 404 && data.status == 'NOT_FOUND') {
              this.showLoader = false
              this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
            } else {
            }
          });
          //End PDF
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.selectCompNameAndNum'))
      }
    }
  }

  pdfHeader(doc, headerobject) {
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEQ4M0Q4NjE1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEQ4M0Q4NjA1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTU1MzkwMUYzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTU1MzkwMjAzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4x0Cf0AAAW60lEQVR42uxd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';
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report') {
        doc.text(headerobject[0].text5Date, 1100, 90, null, null, 'right');
      } else {
        doc.text(headerobject[0].text5Date, 800, 90, null, null, 'right');
      }
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.setTextColor('#009BDB');
    doc.text(headerobject[0].gridHeader1, 40, 90);
    return true;
  }

  pdfFooter(doc, reportId) {
    if (reportId == 73) {
      doc.autoTable.previous.finalY = 290;
      doc.autoTable.previous.cursor.x = 800;
    }
    //Start Footer      
    doc.setFontSize(8);
    //Left Line1
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('T', 40, doc.autoTable.previous.finalY + 40);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('1-800-232-1997 | 780-426-7526', 50, doc.autoTable.previous.finalY + 40);
    //Left Line2
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('F', 40, doc.autoTable.previous.finalY + 50);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('780-426-7581', 50, doc.autoTable.previous.finalY + 50);
    //Left Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('E', 40, doc.autoTable.previous.finalY + 60);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('claims@quikcard.com', 50, doc.autoTable.previous.finalY + 60);
    //Right Line1
    doc.text('#200, 17010 - 103 Avenue', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 40, null, null, 'right');
    //Right Line2
    doc.text('Edmonton, AB T5S 1K7', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 50, null, null, 'right');
    //Right Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('quikcard.com', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 60, null, null, 'right');
  }

  /* Method for get Bank Details Api */
  getBankAccountStatus(coKey) {
    var reqData = {
      "coKey": coKey
    }
    var url = UftApi.checkCompanyBankAccount
    this.hmsDataService.postApi(url, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result == true) {
          this.refundPDS = true
          this.refundRadioSelected(81);
          this.generateRefundForm.patchValue({
            'transactionType': '81'
          })
        }
        else {
          this.refundPDS = false
          this.refundRadioSelected(80);
          this.generateRefundForm.patchValue({
            'transactionType': '80'
          })
        }
      } else {
        this.refundPDS = false
      }
    })
  }
  /* Refund radio button selection method start here */
  refundRadioSelected(value) {
    this.transCode = value
    this.showPayeeInfo = false
    if (this.transCode == '80') {
      this.showPayeeLink = true
    } else {
      this.showPayeeLink = false
      this.generateRefundForm.controls['name'].clearValidators();
      this.generateRefundForm.controls['name'].updateValueAndValidity();
      this.generateRefundForm.controls['address'].clearValidators();
      this.generateRefundForm.controls['address'].updateValueAndValidity();
      this.generateRefundForm.controls['postalCode'].clearValidators();
      this.generateRefundForm.controls['postalCode'].updateValueAndValidity();
      this.generateRefundForm.controls['city'].clearValidators();
      this.generateRefundForm.controls['city'].updateValueAndValidity();
      this.generateRefundForm.controls['province'].clearValidators();
      this.generateRefundForm.controls['province'].updateValueAndValidity();
      this.generateRefundForm.controls['country'].clearValidators();
      this.generateRefundForm.controls['country'].updateValueAndValidity();
    }
    for (var i = 0; i < this.transactionTypeList.length; i++) {
      if (this.transactionTypeList[i].tranCd == this.transCode) {
        this.refundTransCdKey = this.transactionTypeList[i].tranCdKey
      }
    }
  }
  /* Refund radio button selection method start here */

  /* On Select of payee showing payee info section Start here*/
  onClickPayee() {
    this.showPayeeInfo = !this.showPayeeInfo;
    this.generateRefundForm.controls['name'].setValidators([Validators.required]);
    this.generateRefundForm.controls['name'].updateValueAndValidity();
    this.generateRefundForm.controls['address'].setValidators([Validators.required]);
    this.generateRefundForm.controls['address'].updateValueAndValidity();
    this.generateRefundForm.controls['postalCode'].setValidators([Validators.required]);
    this.generateRefundForm.controls['postalCode'].updateValueAndValidity();
    this.generateRefundForm.controls['city'].setValidators([Validators.required]);
    this.generateRefundForm.controls['city'].updateValueAndValidity();
    this.generateRefundForm.controls['province'].setValidators([Validators.required]);
    this.generateRefundForm.controls['province'].updateValueAndValidity();
    this.generateRefundForm.controls['country'].setValidators([Validators.required]);
    this.generateRefundForm.controls['country'].updateValueAndValidity();
  }
  /* On Select of payee showing payee info section End here*/

  getPaymentTypeList(key) {
    this.paymentListColumns = [
      { 'title': this.translate.instant('uft.uftSearch.companyNameNo'), data: 'coIdCoName' },
      { 'title': this.translate.instant('uft.uftSearch.transactionDate'), data: 'unitFinancialTransDt' },
      { 'title': this.translate.instant('uft.uftSearch.transAmount'), data: 'unitFinancialTransAmt' },
      { 'title': this.translate.instant('uft.uftSearch.transactionType'), data: 'tranCd' },
      { 'title': this.translate.instant('uft.uftSearch.transDescription'), data: 'unitFinancialTransDesc' },
      { 'title': this.translate.instant('uft.uftSearch.currentBalance'), data: 'companyBalance' }
    ]
    var currentDate = this.changeDateFormatService.getToday()
    var reqParam = [
      { 'key': 'coKey', 'value': (key) != null ? key : '' },
      { 'key': 'unitFinancialTransKey', 'value': this.unitFinancialTransKey },
      { 'key': 'unitFinancialTransDt', 'value': this.changeDateFormatService.convertDateObjectToString(currentDate) },
      { 'key': 'tranCdKey', 'value': (this.transCodeKey) != null ? this.transCodeKey : '' }
    ]
    var url = UftApi.getUnitFinacialTransactionsByKeyUrl;
    var tableId = "paymentTypeList"
    if (!$.fn.dataTable.isDataTable('#paymentTypeList')) {
      var tableActions = [
      ]
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.paymentListColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, '', [1], '', [2, 5], [1, 3, 4], '')
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }
// In Search UFT when we click on refund button after clicking on any record the report grid table doesn’t show column headings.
  getRefundTypeList(key) {
    this.paymentListColumns = [
      { 'title': this.translate.instant('uft.uftSearch.companyNameNo'), data: 'coIdCoName' },
      { 'title': this.translate.instant('uft.uftSearch.transactionDate'), data: 'unitFinancialTransDt' },
      { 'title': this.translate.instant('uft.uftSearch.transAmount'), data: 'unitFinancialTransAmt' },
      { 'title': this.translate.instant('uft.uftSearch.transactionType'), data: 'tranCd' },
      { 'title': this.translate.instant('uft.uftSearch.transDescription'), data: 'unitFinancialTransDesc' },
      { 'title': this.translate.instant('uft.uftSearch.currentBalance'), data: 'companyBalance' }
    ]
    var currentDate = this.changeDateFormatService.getToday()
    var reqParam = [
      { 'key': 'coKey', 'value': (key) != null ? key : '' },
      { 'key': 'unitFinancialTransKey', 'value': (this.uftKey) != null ? this.uftKey : '' },
      { 'key': 'unitFinancialTransDt', 'value': this.changeDateFormatService.convertDateObjectToString(currentDate) },
      { 'key': 'tranCdKey', 'value': (this.refundTransCdKey) != null ? this.refundTransCdKey : '' }
    ]
    var url = UftApi.getUnitFinacialTransactionsByKeyUrl;
    var tableId = "refundTypeList"
    if (!$.fn.dataTable.isDataTable('#refundTypeList')) {
      var tableActions = [];
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.paymentListColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, '', [1], '', [2, 5], [1, 3, 4], '')
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  /* Get the Details Using Postal Code Api Which gives City,Province & Country Name */
  postalCodeValid(event) {
    if (event.target.value) {
      let postalCode = { postalCd: event.target.value };
      var url = UftApi.getPostalDetailUrl
      this.hmsDataService.post(url, postalCode).subscribe(data => {
        switch (data.code) {
          case 404:
            this.generateRefundForm.controls['postalCode'].setErrors({
              "postalcodeNotFound": true
            });
            this.generateRefundForm.patchValue({
              'city': '',
              'country': '',
              'province': ''
            });
            break;
          case 302:
            this.generateRefundForm.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  /* Verify City, Province & Country With Postal Code Details */
  isPostalCodeVerifyValid(event, formControl) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (formControl) {
        case 'city':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.generateRefundForm.get('country').value,
            provinceName: this.generateRefundForm.get('province').value,
            postalCd: this.generateRefundForm.get('postalCode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'country':
          fieldParameter = {
            cityName: this.generateRefundForm.get('city').value,
            countryName: event.target.value,
            provinceName: this.generateRefundForm.get('province').value,
            postalCd: this.generateRefundForm.get('postalCode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'province':
          fieldParameter = {
            cityName: this.generateRefundForm.get('city').value,
            countryName: this.generateRefundForm.get('country').value,
            provinceName: event.target.value,
            postalCd: this.generateRefundForm.get('postalCode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var verifyProvinceUrl = UftApi.verifyPostalDetailUrl;
      this.hmsDataService.post(verifyProvinceUrl, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.generateRefundForm.controls[formControl].setErrors(errorMessage);
            break;
          case 302:
            this.generateRefundForm.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            break;
        }
      });
    }
  }
  focusNextEle(event,id){
    $('#'+id).focus(); 
  }

  /* Log #925 new changes bu client (10-Nov-2020) */
  onSelectDropDown(item: any) {
    this.provinceArray.push(item.id);
  }

  onDeSelectDropDown(item) {
    const index = this.provinceArray.indexOf(item.id);
    if (index > -1) {
      this.provinceArray.splice(index, 1);
    }
  }

   onSelectTransactionTye(item: any) {
    this.transactionTypeArray.push(item.id);
  }

  onDeSelectTransactionType(item) {
    const index = this.transactionTypeArray.indexOf(item.id);
    if (index > -1) {
      this.transactionTypeArray.splice(index, 1);
    }
  }

  onDateRangeChanged(event: IMyDateRangeModel, frmControlName, frmControlName1) {
    let beginDate = event.beginDate
    let endDate = event.endDate
    if(frmControlName == 'entrydateStart' && frmControlName1 == 'entrydateEnd' && event.formatted != "") {
      this.error = this.changeDateFormatService.compareBeginEndDate(beginDate, endDate)
      if (this.error.isError == true) {
        this.toastrService.error(this.error.errorMessage)
      }
    }
    this.dateNameArray[frmControlName] = {
      year: event.beginDate.year,
      month: event.beginDate.month,
      day: event.beginDate.day
    };
    this.dateNameArray[frmControlName1] = {
      year: event.endDate.year,
      month: event.endDate.month,
      day: event.endDate.day
    };
    // event properties are: event.beginDate, event.endDate, event.formatted,
  }

  // Below method created to reset UFT native search fields.
  resetUftNativeSearch(){
    this.companyname = this.unitFinancialTransactionForm.value.companyNameOrNo;    
    this.nativeTransactionDate = ""
    this.transelectedItems = []
    this.selectedItems = []
    this.transactionRefernece = ""
    this.transactionAmt = ""
    this.balance = ""
    this.transactionDescription = this.unitFinancialTransactionForm.value.transactionRefDesc;    
    this.coRefundChqRefNum = ""
    this.planId = this.unitFinancialTransactionForm.value.planNo;    
    this.divisionId = this.unitFinancialTransactionForm.value.divisionNo;    
    this.unitId = this.unitFinancialTransactionForm.value.unitNo
    this.uftEntryDateSearch = "";    
    this.getUnitFinancialTransactionList()
  }
}
