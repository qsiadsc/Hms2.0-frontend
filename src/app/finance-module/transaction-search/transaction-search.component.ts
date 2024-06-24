import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
/** For Common Date Picker */
import { IMyInputFocusBlur } from 'mydatepicker';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { FinanceApi } from '../finance-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { FeeGuideApi } from '../../fee-guide-module/fee-guide-api'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { createOfflineCompileUrlResolver } from '@angular/compiler';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FinanceService } from '../finance.service'

@Component({
  selector: 'app-transaction-search',
  templateUrl: './transaction-search.component.html',
  styleUrls: ['./transaction-search.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService, ToastrService]
})
export class TransactionSearchComponent implements OnInit {
  cashReceiptDisciplineValue: '';
  selectedBusinessTypeCdValue: any;
  checkingParamsErrMsg: any;
  checkingParamsErr: boolean = false;
  totalPayableClaimsErr: boolean = false;
  totalPayableClaimsLockErr: boolean = false;
  isCheckedDrug: boolean = true;
  exportingPaymentFiles: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  updateExportingPaymentFiles: { "id": number; "done": string; "step": string; "processing": string; "result": any; };
  planType: any;
  generatingReportsMsg: any;
  errorClaimLListMsg: any;
  totalClaims: any;
  totalEFTRecords: string;
  totalChequeRecords: string;
  exportEftResponseErr
  exportEftResponse
  searchDiscilipineList: any
  generateDate: any
  issueDate: any
  sbusType: any
  payee: any
  stransStatus: any
  stransType: any
  dueDate: any
  transNo: any
  clearDate: any
  showSearchTable: boolean = false;
  transNotext: boolean = false;
  transRange: boolean = false;
  transDate: boolean = false;
  cheqNo: boolean = false;
  cheque: boolean = false;
  payment: boolean = false;
  ObservableObj: any;
  recNotFounndSysParam: boolean = false
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public transactionSearch: FormGroup;
  columns;
  check = true;
  public isOpen: boolean = false;
  disciplineValue;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  transactionStatusList;
  public transactionStatusData: CompleterData
  public transactionStatusDataLower: CompleterData
  transactionStatusKey;
  dateNameArray = {}
  transacStatus;
  payeeList;
  public payeeData: CompleterData;
  public payeeDataLower: CompleterData;
  transPayee;
  transactionTypeList;
  public transactionTypeData: CompleterData
  public transactionTypeDataLower: CompleterData
  transType;
  businessTypeList;
  public businessTypeData: CompleterData
  transBusiness;
  public TransactionSearchRadio: CompleterData;
  disciplineArr = []
  reqParam
  selectedPlanType
  hideFields: boolean = false;
  hiddenPaymentSumPopupBtn: boolean = false
  transStatusCd: any
  debitAmount: any
  //Generate Payment Process variables
  generatingReportsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  generatingChequeRecordsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  generatingEftRecordsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  apiResponse: number;
  generatingPayableArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  errorClaimListArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  totalPayableClaimsArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  showUpdateItemArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  checkingParamsArr: any;
  update: any;
  chequeNum: any;
  eftFileNo: any;
  paymentGenerateForm: FormGroup;
  paymentSumForm: FormGroup;
  staleChequeForm: FormGroup;
  cancelAndReissueForm: FormGroup;
  cashReceiptForm: FormGroup;
  error: any
  observableObj;
  paramData;
  fieldArray: any;
  paymentSumKey;
  generatePaymentButton = false
  manualPaymentSumKey
  isDisableGPRun: boolean = false;
  financialAdminInfoResponse
  generatingReportsResponseStatus
  TransactionSearchList = [
    { "key": "none", "value": "None" },
    { "key": "transactionNo", "value": "Transaction Number" },
    { "key": "transactionDateRange", "value": "Transaction Date Range" },
    { "key": "chequeNo", "value": "Cheque Number" },
  ]
  selectedTransSearchRadioName;
  transactionTypeValue
  transactionStatusValue
  payeeValue
  diciplinePopupArr = []
  providerNo: boolean = false;
  cardholderNo: boolean = false;
  discilipinList;
  public discilipinData: CompleterData
  currentUser: any;
  showLoader: boolean = false
  tableAction
  isDisable: boolean = false
  selectedTransSearchRowData
  orgName
  orgNo
  orgDesc
  orgRecCenter
  bankNo
  branchNo
  accNo
  defalutDir
  sPlanType
  eftDueDate
  loader: string;
  imagePath;
  docName
  docType
  getLowerSearch: boolean;
  reqParamPlan;
  transactionParams
  hideSearch: boolean = false
  disciplineClaimCheque
  diciplineDataArray = []
  transStartAmt;
  transEndAmt;
  transStartDate;
  transEndDate;
  chequeRefNo;
  chequeRefNoStart;
  chequeRefNoEnd;
  paySumKey;
  providerCardNum;
  setDiscipline;
  totalPaid
  netPayableAmount
  adminFee;
  transNumber
  discCode
  disc
  isFromPaymentScreen: boolean = false
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private completerService: CompleterService,
    private hmsDataService: HmsDataServiceService,
    public currentUserService: CurrentUserService,
    private ToastrService: ToastrService,
    private router: Router,
    private FinanceService: FinanceService,
    private route: ActivatedRoute
  ) {
    this.currentUser = this.currentUserService.currentUser
    this.showLoader = true
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
      })
    }

    this.transactionSearch = new FormGroup({
      'disciplinesChkDental': new FormControl(''),
      'disciplinesChkVision': new FormControl(''),
      'disciplinesChkHealth': new FormControl(''),
      'disciplinesChkDrug': new FormControl(''),
      'disciplinesChkSupplement': new FormControl(''),
      'transNo': new FormControl('', CustomValidators.onlyNumbers),
      'transStartDate': new FormControl(''),
      'transEndDate': new FormControl(''),
      'transStartAmt': new FormControl(''),
      'transEndAmt': new FormControl(''),
      'chequeRefNo': new FormControl(''),
      'chequeRefNoStart': new FormControl(''),
      'chequeRefNoEnd': new FormControl(''),
      'paymentSumKey': new FormControl(''),
      'STO': new FormControl(''),
      'generationDate': new FormControl(''),
      'issueDate': new FormControl(''),
      'eftDueDate': new FormControl(''),
      'clearDate': new FormControl(''),
      'businessType': new FormControl(''),
      'payee': new FormControl(''),
      'providerNo': new FormControl(''),
      'cardholderNo': new FormControl(''),
      'transactionStatus': new FormControl(''),
      'transactionType': new FormControl(''),
      'TransName': new FormControl(''),
      'disciplinesChkWellness': new FormControl('')
    });

    this.paymentGenerateForm = new FormGroup({
      'dental': new FormControl(''),
      'disciplinePopupChk': new FormControl(''),
      'vision': new FormControl(''),
      'health': new FormControl(''),
      'drug': new FormControl(''),
      'supplement': new FormControl(''),
      'wellness': new FormControl(''),
      'planType': new FormControl('', [Validators.required]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'confirmationNo': new FormControl('', [CustomValidators.onlyNumbers]),
      'companyNo': new FormControl(''),
      'cardholder': new FormControl(''),
      'provider': new FormControl(''),
    })

    this.paymentSumForm = new FormGroup({
      'paymentSumNo': new FormControl('', [Validators.required, CustomValidators.onlyNumbers]),
    })

    this.staleChequeForm = new FormGroup({
      'dateAsOf': new FormControl('', [Validators.required]),
      'businessTypeKey': new FormControl('', [Validators.required])
    })

    this.cancelAndReissueForm = new FormGroup({
      'CancelAndReissuePaymentKey': new FormControl('', [Validators.required]),
    })

    this.cashReceiptForm = new FormGroup({
      'discipline': new FormControl(''),
      'confirmId': new FormControl('', [Validators.required, CustomValidators.onlyNumbers]),
    })

    this.dataTableInitialize();
    this.getTransactionStatus();
    this.getTransactionStatusLower();
    this.getPayee();
    this.getPayeeLower();
    this.getTransactionType();
    this.getTransactionTypeLower();
    this.getBusinessType();
    this.getDiscilipinList();

    this.TransactionSearchRadio = this.completerService.local(
      this.TransactionSearchList,
      "value",
      "value"
    );
    this.diciplinePopupArr.push('DR')
    var self = this
    $(document).on('keydown', '#transactionSearchList .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })

    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', 'View');
    })

    // Log #1137: As per Client Feedback(23-Nov-2021)
    setTimeout(() => {
      this.route.queryParams.subscribe(params => {
        if (params) {
          this.transNumber = params['transNo']
          this.discCode = params['discCd']
          this.disc = params['discp']
          if (this.transNumber != undefined) {
            this.isFromPaymentScreen = true
          } else {
            this.isFromPaymentScreen = false
          }
        }
        if (this.isFromPaymentScreen) {
          if (this.discCode == "D") {
            this.transactionSearch.patchValue({ 'disciplinesChkDental': true })
          } else if (this.discCode == "V") {
            this.transactionSearch.patchValue({ 'disciplinesChkVision': true })
          } else if (this.discCode == "H") {
            this.transactionSearch.patchValue({ 'disciplinesChkHealth': true })
          } else if (this.discCode == "DR") {
            this.transactionSearch.patchValue({ 'disciplinesChkDrug': true })
          } else if (this.discCode == "HS") {
            this.transactionSearch.patchValue({ 'disciplinesChkSupplement': true })
          } else if (this.discCode == "W") {
            this.transactionSearch.patchValue({ 'disciplinesChkWellness': true })
          }
          this.transactionSearch.patchValue({ 'TransName': 'Transaction Number' })
          this.transactionSearch.patchValue({ 'transNo': this.transNumber})
          this.getTransactionSearchScreenVal()
        }
      })
    }, 1000);
  }

  dataTableInitialize() {
    // Get the Translation of Dental Service List using Observable 
    this.ObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.check) {
        if ('feeGuide.dentalService.serviceId' == this.translate.instant('feeGuide.dentalService.serviceId')) {
        } else {
          this.columns = [
            { title: this.translate.instant('finance.transactionSearch.discipline'), data: 'discipline' },
            { title: this.translate.instant('finance.transactionSearch.transNo'), data: 'paymentKey' },
            { title: this.translate.instant('finance.transactionSearch.issuedDate'), data: 'issueDate' },
            { title: this.translate.instant('finance.transactionSearch.chequeRefNo'), data: 'chequeRefNo' },
            { title: this.translate.instant('finance.transactionSearch.transStatusCode'), data: 'tranStatCd' },
            { title: this.translate.instant('finance.transactionSearch.debitAmount'), data: 'debitAmount' },
            { title: this.translate.instant('finance.transactionSearch.adminFee'), data: 'adminFee' },
            { title: this.translate.instant('finance.transactionSearch.generatedDate'), data: 'generatedDate' },
            { title: this.translate.instant('finance.transactionSearch.tranStatus'), data: 'transStatus' },
            { title: this.translate.instant('finance.transactionSearch.clearSeq'), data: 'clearSeq' },
            { title: this.translate.instant('finance.transactionSearch.cancelledDate'), data: 'cancelDate' },
            { title: this.translate.instant('finance.transactionSearch.tranType'), data: 'transType' },
            { title: this.translate.instant('finance.transactionSearch.businessType'), data: 'sbusType' },
            { title: this.translate.instant('finance.transactionSearch.processDate'), data: 'processDate' },
            { title: this.translate.instant('finance.transactionSearch.payee'), data: 'payee' },
            // Log #1137: Total Paid and Net Payable Amount columns added
            { title: this.translate.instant('finance.paymentSearch.totalPaid'), data: 'transAmount' },
            { title: this.translate.instant('finance.paymentSearch.netPayableAmount'), data: 'netPayableAmount'},
            { title: this.translate.instant('finance.transactionSearch.action'), data: 'paymentKey' }
          ];
          this.check = false
          if (this.currentUserService.transactionQueryParams) {
            this.showLoader = false
            this.transactionParams = this.currentUserService.transactionQueryParams
            this.hideSearch = this.transactionParams.fromClaim
            this.transactionSearchClaimCheque()
          } else {
            this.showLoader = false
            this.hideSearch = true
          }
          this.ObservableObj.unsubscribe();

          if (this.FinanceService.companySearchedData && this.FinanceService.isBackCompanySearch) {
            this.transactionSearch.patchValue(this.FinanceService.companySearchedData)
            if (this.transactionSearch.value.disciplinesChkDental) {
              this.disciplineArr.push("D")
            }
            if (this.transactionSearch.value.disciplinesChkVision) {
              this.disciplineArr.push("V")
            }
            if (this.transactionSearch.value.disciplinesChkDrug) {
              this.disciplineArr.push("DR")
            }
            if (this.transactionSearch.value.disciplinesChkHealth) {
              this.disciplineArr.push("H")
            }
            if (this.transactionSearch.value.disciplinesChkSupplement) {
              this.disciplineArr.push("HS")
            }
            if (this.transactionSearch.value.disciplinesChkWellness) {
              this.disciplineArr.push("W")
            }

            this.transactionSearch.value.TransName
            if (this.transactionSearch.value.TransName == 'Transaction Number') {
              this.selectedTransSearchRadioName = 'transactionNo'
            } else if (this.transactionSearch.value.TransName == 'Transaction Range') {
              this.selectedTransSearchRadioName = 'transactionRange'
            } else if (this.transactionSearch.value.TransName == 'Transaction Date Range') {
              this.selectedTransSearchRadioName = 'transactionDateRange'
            } else if (this.transactionSearch.value.TransName == 'Cheque Number') {
              this.selectedTransSearchRadioName = 'chequeNo'
            } else if (this.transactionSearch.value.TransName == 'Cheque Range') {
              this.selectedTransSearchRadioName = 'chequeRange'
            } else if (this.transactionSearch.value.TransName == 'Cheque Range') {
              this.selectedTransSearchRadioName = 'paymentRun'
            }
            this.transOpt()
            this.transPayee = this.transactionSearch.value.payee
            if (this.transPayee == 'Provider') {
              this.providerNo = true;
              this.cardholderNo = false;
            } else if (this.transPayee == 'Cardholder') {
              this.providerNo = false;
              this.cardholderNo = true;
            } else {
              this.providerNo = false;
              this.cardholderNo = false;
            }
            this.FinanceService.isBackCompanySearch = false
            this.searchTransaction(this.transactionSearch)
          } else {   
            this.FinanceService.companySearchedData = ''
            this.FinanceService.searchedCompanyName = ''
            this.FinanceService.searchedCompanyId = ''
          }
        }
      }
    });

    var self = this
    $(document).on('click', '#transactionSearchList .view-ico', function () {
      var selectedDiscipline = $(this).data('pdiscipline')
      var selectedPaymentKey = $(this).data('id')
      self.FinanceService.isBackCompanySearch = true;
      self.router.navigate(['/finance/transaction-search/transactionDetails/'], { queryParams: { 'discipline': selectedDiscipline, 'paymentKey': selectedPaymentKey, } });
    })

    $(document).on('click', '#transactionSearchList a', function () {
      self.isDisable = false
      $('#transactionSearchList td').removeClass('highlightedRow');
    })

    $(document).on('click', '#transactionSearchList tr', function () {
      self.selectedTransSearchRowData = self.dataTableService.selectedRowTransSearch
      self.isDisable = true
    })
  }

  /* Get Transation Status List for Predictive Search */
  getTransactionStatus() {
    var url = FinanceApi.getTransactionStatusUrl
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionStatusList = data.result;
        this.transactionStatusData = this.completerService.local(
          this.transactionStatusList,
          "tranStatusDescription",
          "tranStatusDescription"
        );
      }
    })
  };

  getTransactionStatusLower() {
    var url = FinanceApi.getTransactionStatusUrl
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionStatusList = data.result;
        this.transactionStatusDataLower = this.completerService.local(
          this.transactionStatusList,
          "tranStatusDescription",
          "tranStatusDescription"
        );
      }
    })
  };

  onSelectedTransactionStatus(selected: CompleterItem) {
    if (selected) {
      this.transacStatus = selected.originalObject.tranStatusDescription;
    }
    else {
      this.transacStatus = ''
    }
  }

  /* Get Payee List for Predictive Search*/
  getPayee() {
    var url = FinanceApi.getPayeeTypesUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payeeList = data.result;
        this.payeeData = this.completerService.local(
          this.payeeList,
          "payeeTypeDesc",
          "payeeTypeDesc"
        );
      }
    })
  }

  getPayeeLower() {
    var url = FinanceApi.getPayeeTypesUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payeeList = data.result;
        this.payeeDataLower = this.completerService.local(
          this.payeeList,
          "payeeTypeDesc",
          "payeeTypeDesc"
        );
      }
    })
  }

  onSelectedPayee(selected: CompleterItem) {
    if (selected) {
      this.transPayee = selected.originalObject.payeeTypeDesc
      if (this.transPayee == 'Provider') {
        this.providerNo = true;
        this.cardholderNo = false;
      } else if (this.transPayee == 'Cardholder') {
        this.providerNo = false;
        this.cardholderNo = true;
      } else {
        this.providerNo = false;
        this.cardholderNo = false;
      }
    }
  }

  onBlurPayeeDropdown() {
    this.transPayee = "";
    this.providerNo = false;
    this.cardholderNo = false;
  }

  /* Get Transaction Type List for Predictive Search */
  getTransactionType() {
    var url = FinanceApi.getTransactionTypeUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionTypeList = data.result;
        this.transactionTypeData = this.completerService.local(
          this.transactionTypeList,
          "tranTypeDescription",
          "tranTypeDescription"
        );
      }
    })
  }

  getTransactionTypeLower() {
    var url = FinanceApi.getTransactionTypeUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionTypeList = data.result;
        this.transactionTypeDataLower = this.completerService.local(
          this.transactionTypeList,
          "tranTypeDescription",
          "tranTypeDescription"
        );
      }
    })
  }

  onSelectedTransactionType(selected: CompleterItem) {
    if (selected) {
      this.transType = selected.originalObject.tranTypeDescription
    }
  }

  /*  Get Business Type List for Predictive Search */
  getBusinessType() {
    var url = FinanceApi.getBusinessTypeUrl
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.businessTypeList = data.result;
        this.businessTypeData = this.completerService.local(
          this.businessTypeList,
          "businessTypeDesc",
          "businessTypeDesc"
        )
      }
    })
  }

  onSelectedBusinessType(selected: CompleterItem) {
    if (selected) {
      this.transBusiness = selected.originalObject.businessTypeDesc
    }
    else {
      this.transBusiness = ""
    }
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && event.value == null && event.value == '') {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.transactionSearch.patchValue(datePickerValue);
      this.paymentGenerateForm.patchValue(datePickerValue);
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
    }
    if (event.reason == 2) {
      if (datePickerValue) {
        if (formName == 'paymentGenerateForm') {
          this.paymentGenerateForm.patchValue(datePickerValue);
          var todayDate = this.changeDateFormatService.getToday();
          this.paymentGenerateForm.patchValue(datePickerValue);
          if (todayDate && this.paymentGenerateForm.value.effectiveOn) {
            var errorVal = this.changeDateFormatService.compareTwoDates(todayDate.date, this.paymentGenerateForm.value.effectiveOn.date);
            if (errorVal.isError == true) {
              this.paymentGenerateForm.controls.effectiveOn.setErrors({
                "paymentGenerateEffDateNotValid": true
              });
              return;
            }
          }
        } else if (formName == 'transactionSearch') {
          this.transactionSearch.patchValue(datePickerValue);
          if (this.transactionSearch.value.transStartDate && this.transactionSearch.value.transEndDate) {
            var errorVal = this.changeDateFormatService.compareTwoDates(this.transactionSearch.value.transStartDate.date, this.transactionSearch.value.transEndDate.date);
            if (errorVal.isError == true) {
              this.transactionSearch.controls.transEndDate.setErrors({
                "transactionToDateCantLess": true
              });
              return;
            }
          }
        } else if (formName == 'staleChequeForm') {
          this.staleChequeForm.patchValue(datePickerValue);
        }
      }
    }
    if (this.paymentGenerateForm.value.effectiveOn && this.paymentGenerateForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.paymentGenerateForm.value.effectiveOn.date, this.paymentGenerateForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.paymentGenerateForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
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

  searchTransaction(transactionSearch) {
    this.getLowerSearch = false
    this.transStatusCd = ''
    this.debitAmount = ''
    this.totalPaid = ''
    this.netPayableAmount = ''
    this.adminFee = ''
    if (transactionSearch.valid) {
      this.transactionTypeValue = transactionSearch.value.transactionType
      this.transactionStatusValue = transactionSearch.value.transactionStatus
      this.payeeValue = this.transactionSearch.value.payee
      this.showSearchTable = true;
      this.reqParam = [
        { 'key': 'disciplineList', 'value': this.disciplineArr },
        { 'key': 'generatedDate', 'value': (transactionSearch.value.generationDate == '' || transactionSearch.value.generationDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.generationDate) },
        { 'key': 'issueDate', 'value': (transactionSearch.value.issueDate == '' || transactionSearch.value.issueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(transactionSearch.value.issueDate) },
        { 'key': 'sbusType', 'value': (transactionSearch.value.businessType != null) ? transactionSearch.value.businessType : '' },
        { 'key': 'payee', 'value': transactionSearch.value.payee },
        { 'key': 'stransStatus', 'value': transactionSearch.value.transactionStatus },
        { 'key': 'stransType', 'value': transactionSearch.value.transactionType },
        { 'key': 'dueDate', 'value': (transactionSearch.value.eftDueDate == '' || transactionSearch.value.eftDueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(transactionSearch.value.eftDueDate) },
        { 'key': 'clearDate', 'value': (transactionSearch.value.clearDate == '' || transactionSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(transactionSearch.value.clearDate) },
      ]
      this.searchDiscilipineList = this.disciplineArr;
      this.generateDate = (transactionSearch.value.generationDate == '' || transactionSearch.value.generationDate == null) ? '' : this.transactionSearch.value.generationDate;
      this.issueDate = (transactionSearch.value.issueDate == '' || transactionSearch.value.issueDate == null) ? '' : (transactionSearch.value.issueDate);
      this.sbusType = (transactionSearch.value.businessType != null) ? transactionSearch.value.businessType : '';
      this.payee = transactionSearch.value.payee;
      this.stransStatus = transactionSearch.value.transactionStatus;
      this.stransType = transactionSearch.value.transactionType;
      this.dueDate = (transactionSearch.value.eftDueDate == '' || transactionSearch.value.eftDueDate == null) ? '' : transactionSearch.value.eftDueDate;
      this.clearDate = (transactionSearch.value.clearDate == '' || transactionSearch.value.clearDate == null) ? '' : transactionSearch.value.clearDate
      this.transNo = transactionSearch.value.transNo
      if (this.issueDate) {
        this.dateNameArray['issueDate'] = {
          year: this.issueDate.date.year,
          month: this.issueDate.date.month,
          day: this.issueDate.date.day
        }
      } else {
        this.dateNameArray['issueDate'] = ''
      }
      if (this.dateNameArray['issueDate'] == '') {
        this.dateNameArray['issueDate'] = []
      }
      if (this.generateDate) {
        this.dateNameArray['generatedDate'] = {
          year: this.generateDate.date.year,
          month: this.generateDate.date.month,
          day: this.generateDate.date.day
        }
      } else {
        this.dateNameArray['generatedDate'] = ''
      }
      if (this.dateNameArray['generatedDate'] == '') {
        this.dateNameArray['generatedDate'] = []
      }
      this.dateNameArray['cancelDate'] = ''
      if (this.dateNameArray['cancelDate'] == '') {
        this.dateNameArray['cancelDate'] = []
      }
      this.dateNameArray['processDate'] = ''
      if (this.dateNameArray['processDate'] == '') {
        this.dateNameArray['processDate'] = []
      }
      if (this.transNotext) {
        this.reqParam.push({
          "key": "paymentKey",
          "value": this.transactionSearch.value.transNo
        })
      }
      if (this.transRange) {
        this.reqParam.push({
          "key": "transactionStartAmount",
          "value": this.transactionSearch.value.transStartAmt
        },
          {
            "key": "transactionEndAmount",
            "value": this.transactionSearch.value.transEndAmt
          })
      }
      if (this.transDate) {
        this.reqParam.push({
          "key": "transStartDate",
          "value": this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transStartDate),
        },
          {
            "key": "transEndDate",
            "value": this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transEndDate)
          })
      }
      if (this.cheqNo) {
        this.reqParam.push({
          "key": "chequeRefNo",
          "value": this.transactionSearch.value.chequeRefNo
        })
      }
      if (this.cheque) {
        this.reqParam.push(
          {
            "key": "chequeRefNoStart",
            "value": this.transactionSearch.value.chequeRefNoStart
          },
          {
            "key": "chequeRefNoEnd",
            "value": this.transactionSearch.value.chequeRefNoEnd
          })
      }
      if (this.payment) {
        this.reqParam.push({
          "key": "paymentSumKey",
          "value": this.transactionSearch.value.paymentSumKey
        })
      }
      if (this.providerNo) {
        this.reqParam.push({ "key": "providerCardId", "value": (this.transactionSearch.value.providerNo != null) ? this.transactionSearch.value.providerNo : '' })
      } else if (this.cardholderNo) {
        this.reqParam.push({ "key": "providerCardId", "value": (this.transactionSearch.value.cardholderNo != null) ? this.transactionSearch.value.cardholderNo : '' })
      } else {
        this.reqParam.push({ "key": "providerCardId", "value": '' })
      }

      this.tableAction = [
        { 'name': 'edit', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye' },
      ]
      var URL = FinanceApi.getTransactionSearchFilterData;
      var tableId = "transactionSearchList"
      if (!$.fn.dataTable.isDataTable('#transactionSearchList')) {
        this.dataTableService.jqueryDataTableTransSearch(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reqParam, this.tableAction, 17, [2, 7, 10, 13], '', [5, 6, 15, 16], [1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, URL, this.reqParam)
      }
      this.FinanceService.getCompanySearchData(this.transactionSearch.value, this.disciplineArr)
    } else {
      this.validateAllFormFields(this.transactionSearch)
    }

    this.generateDate = (transactionSearch.value.generationDate == '' || transactionSearch.value.generationDate == null) ? '' : this.transactionSearch.value.generationDate;
    this.issueDate = (transactionSearch.value.issueDate == '' || transactionSearch.value.issueDate == null) ? '' : (transactionSearch.value.issueDate);
    this.sbusType = (transactionSearch.value.businessType != null) ? transactionSearch.value.businessType : '';
    this.payee = transactionSearch.value.payee;
    this.stransStatus = transactionSearch.value.transactionStatus;
    this.stransType = transactionSearch.value.transactionType;
    this.dueDate = (transactionSearch.value.eftDueDate == '' || transactionSearch.value.eftDueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(transactionSearch.value.eftDueDate);
    this.clearDate = (transactionSearch.value.clearDate == '' || transactionSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(transactionSearch.value.clearDate)
    this.transNo = this.transactionSearch.value.transNo;
    this.transStartAmt = (this.transactionSearch.value.transStartAmt) != null ? (this.transactionSearch.value.transStartAmt) : ''
    this.transEndAmt = (this.transactionSearch.value.transEndAmt) != null ? (this.transactionSearch.value.transEndAmt) : ''
    this.transStartDate = (this.transactionSearch.value.transStartDate) != null ? this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transStartDate) : ''
    this.transEndDate = (this.transactionSearch.value.transEndDate) != null ? this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transEndDate) : ''
    this.chequeRefNo = this.transactionSearch.value.chequeRefNo
    this.chequeRefNoStart = this.transactionSearch.value.chequeRefNoStart
    this.chequeRefNoEnd = this.transactionSearch.value.chequeRefNoEnd
    this.paySumKey = this.transactionSearch.value.paymentSumKey
    if (this.providerNo) {
      this.providerCardNum = (this.transactionSearch.value.providerNo != null) ? this.transactionSearch.value.providerNo : ''
    } else if (this.cardholderNo) {
      this.providerCardNum = (this.transactionSearch.value.cardholderNo != null) ? this.transactionSearch.value.cardholderNo : ''
    } else {
      this.providerCardNum = ''
    }

    if (this.issueDate) {
      this.dateNameArray['issueDate'] = {
        year: this.issueDate.date.year,
        month: this.issueDate.date.month,
        day: this.issueDate.date.day
      }
    }
    if (this.generateDate) {
      this.dateNameArray['generatedDate'] = {
        year: this.generateDate.date.year,
        month: this.generateDate.date.month,
        day: this.generateDate.date.day
      }
    }
    if (this.disciplineArr.length == 1) {
      if (this.disciplineArr[0] == 'V') {
        this.setDiscipline = 'Vision'
      } if (this.disciplineArr[0] == 'D') {
        this.setDiscipline = 'Dental'
      } if (this.disciplineArr[0] == 'H') {
        this.setDiscipline = 'Health'
      } if (this.disciplineArr[0] == 'DR') {
        this.setDiscipline = 'Drug'
      } if (this.disciplineArr[0] == 'HS') {
        this.setDiscipline = 'Supplemental'
      } if (this.disciplineArr[0] == 'W') {
        this.setDiscipline =  'Wellness'
      }
    } else {
      this.setDiscipline = ''
    }
    this.searchDiscilipineList = this.setDiscipline
  }

  transOpt() {
    if (this.selectedTransSearchRadioName == 'transactionNo') {
      this.transNotext = true;
      this.transRange = false;
      this.transDate = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'transactionRange') {
      this.transRange = true;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'transactionDateRange') {
      this.transDate = true
      this.transRange = false;
      this.transNotext = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'chequeNo') {
      this.cheqNo = true;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'chequeRange') {
      this.cheque = true;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
      this.payment = false;
    }
    else if (this.selectedTransSearchRadioName == 'paymentRun') {
      this.payment = true;
      this.cheque = false;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
    }
    else {
      this.payment = false;
      this.cheque = false;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
    }
  }

  payeeConditionalChk() {
    if (this.transPayee == 'Provider') {
      this.transNotext = true;
      this.transRange = false;
    }
    else if (this.transPayee == 'Cardholder') {
      this.transRange = true;
      this.transNotext = false;
    }
    else {
      this.transRange = false;
      this.transNotext = false;
    }
  }

  clearSearchTransaction() {
    this.transactionSearch.reset();
    this.transactionSearch.controls['businessType'].clearValidators();
    this.transactionSearch.controls['businessType'].updateValueAndValidity()
    this.payment = false;
    this.cheque = false;
    this.transRange = false;
    this.transNotext = false;
    this.transDate = false;
    this.cheqNo = false;
    this.disciplineArr = [];
    this.transStartAmt = ''
    this.transEndAmt = ''
    this.transStartDate = ''
    this.transEndDate = ''
    this.chequeRefNoStart = ''
    this.chequeRefNoEnd = ''
    this.paySumKey = ''
    this.dueDate = ''
    this.clearDate = ''
    this.providerCardNum = ''
    this.totalPaid = ''
    this.netPayableAmount = ''
    this.showSearchTable = false;
  }

  disciplineChange(evt) {
    if (this.transactionSearch.value.disciplinesChkDental || this.transactionSearch.value.disciplinesChkVision || this.transactionSearch.value.disciplinesChkHealth || this.transactionSearch.value.disciplinesChkDrug || this.transactionSearch.value.disciplinesChkSupplement || this.transactionSearch.value.disciplinesChkWellness) {
      if (this.disciplineArr.includes(evt.target.value)) {
        //do nothing
        for (var i = 0; i < this.disciplineArr.length; i++) {
          if (this.disciplineArr[i] == evt.target.value) {
            this.disciplineArr.splice(i, 1);
          }
        }
      } else {
        this.disciplineArr.push(evt.target.value);
      }
    } else {
      for (var i = 0; i < this.disciplineArr.length; i++) {
        if (this.disciplineArr[i] == evt.target.value) {
          this.disciplineArr.splice(i, 1);
        }
      }
    }
  }

  disciplinePopupValueChange(evt, value) {
    if (evt.target.checked) {
      this.diciplinePopupArr.push(evt.target.value);
    } else {
      for (var i = 0; i < this.diciplinePopupArr.length; i++) {
        if (this.diciplinePopupArr[i] == evt.target.value) {
          this.diciplinePopupArr.splice(i, 1);
        }
      }
    }
  }

  /* Search the Footer List After Search Icon*/
  searchTransactionList(tableId: string) {
    this.getLowerSearch = true
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParams(tableId)
    if (params[0].key == 'disciplineList') {
      if (this.disciplineValue) {
        params[0].value = [this.disciplineValue]
      } else {
        params[0].value = this.disciplineArr
      }
    }
    params[18] = { key: 'transactionStartAmount', value: this.transStartAmt }
    params[19] = { key: 'transactionEndAmount', value: this.transEndAmt }
    params[20] = { key: 'transStartDate', value: this.transStartDate }
    params[21] = { key: 'transEndDate', value: this.transEndDate }
    params[22] = { key: 'chequeRefNoStart', value: this.chequeRefNoStart }
    params[23] = { key: 'chequeRefNoEnd', value: this.chequeRefNoEnd }
    params[24] = { key: 'paymentSumKey', value: this.paySumKey }
    params[25] = { key: 'dueDate', value: this.dueDate }
    params[26] = { key: 'clearDate', value: this.clearDate }
    params[27] = { key: 'providerCardId', value: this.providerCardNum }
    var dateParams = [2, 7, 10, 13]
    var URL = FinanceApi.getTransactionSearchFilterData;
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }

  /**
   * Reset Transaction Search Info Footer Filters
   */
  resetTransactionListSearch() {
    this.dataTableService.resetTableSearch();
    this.searchTransactionList("transactionSearchList")
    $('#transactionSearchList .icon-mydpremove').trigger('click');
  }

  // Method for Footer Datepicker
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

  //Generate Payment Popup table Value update
  showUpdatedItem(newItem) {
    let updateItem = this.fieldArray.find(this.findIndexToUpdate, newItem.id);
    let index = this.fieldArray.indexOf(updateItem);
    this.fieldArray[index] = newItem;
  }

  findIndexToUpdate(newItem) {
    return newItem.id === this;
  }

  /** Submit the Generate Payment Process Form*/
  submitPaymentGenerateForm(paymentGenerateForm) {
    if (this.paymentGenerateForm.valid) {
      this.generatePaymentButton = true;
      if (this.fieldArray == []) {
        let fieldArr = {
          "id": 1,
          "done": "0",
          "step": "1",
          "processing": "Get System Parameters",
          "result": "Processing"
        }
        this.fieldArray.push(fieldArr)
      } else {
        this.fieldArray =
          [{
            "id": 1,
            "done": "0",
            "step": "1",
            "processing": "Get System Parameters",
            "result": "Processing"
          }]
      }
      this.getSystemParameter(this.paymentGenerateForm.value.planType).then(res => {
        if (this.recNotFounndSysParam == false) {
          this.update = {
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Get System Parameters",
            "result": "EFT File#: '" + this.eftFileNo + "'; Last Cheque#: " + this.chequeNum
          }
          this.showUpdatedItem(this.update);
          if (this.eftFileNo) {
            this.exDialog.openMessage(this.translate.instant('finance.toaster.eftNo') + this.eftFileNo).subscribe((eftFileNo) => {
              if (!eftFileNo) {
                this.checkingParamsArr = {
                  "id": 2,
                  "done": "0",
                  "step": "2",
                  "processing": "Checking Params",
                  "result": "Processing"
                }
                this.fieldArray.push(this.checkingParamsArr)
                this.checkingParams(this.paramData).then(res => {
                  if (this.checkingParamsErr) {
                    this.ToastrService.error(this.checkingParamsErrMsg);
                    this.generatePaymentButton = false
                    this.fieldArray = []
                    this.checkingParamsErr = false
                  } else {
                    this.update = {
                      "id": 2,
                      "done": "1",
                      "step": "2",
                      "processing": "Checking Params",
                      "result": "EFT File#: '" + this.eftFileNo + "' is valid!"
                    }
                    this.totalPayableClaimsArr = {
                      "id": 3,
                      "done": "0",
                      "step": "3",
                      "processing": "Total Payable Claims",
                      "result": "Processing"
                    }
                    this.showUpdatedItem(this.update);
                    this.fieldArray.push(this.totalPayableClaimsArr);
                    this.totalPayableClaims(this.paymentGenerateForm.value).then(res => {
                      if (this.totalPayableClaimsLockErr) {
                        this.exDialog.openConfirm('Claim screen is locked by someone').subscribe((value) => {
                          if (value) {
                            this.fieldArray = []
                            this.totalPayableClaimsLockErr = false;
                          }
                        })
                      } else {
                        if (this.totalPayableClaimsErr) {
                          this.ToastrService.error(this.translate.instant('finance.toaster.SORRY_YOU_CANNOT_RUN_PAYMENT_ON_THIS_DATABASE'));
                          this.generatePaymentButton = false
                          this.fieldArray = []
                          this.totalPayableClaimsErr = false
                        } else {
                          this.update = {
                            "id": 3,
                            "done": "1",
                            "step": "3",
                            "processing": "Total Payable Claims",
                            "result": this.totalClaims
                          }
                          this.showUpdatedItem(this.update);
                          if (this.totalClaims == 0) {
                            this.exDialog.openConfirm(this.translate.instant('finance.toaster.genPayableAlreadyDoneToContinue')).subscribe((value) => {
                              if (value) {
                                $("#paymentSumKeyButton").trigger('click');
                              }
                            })
                          } else {
                            this.gpSteps();
                          }
                        }
                      }
                    });
                  }
                })
              } else {
                this.resetGeneratePaymentFormWithoutClose();
              }
            });
          }
        } else {
          this.fieldArray = []
          this.ToastrService.error(this.translate.instant('finance.toaster.noRecordGenPayment'));
        }
      })
    } else {
      this.validateAllFormFields(this.paymentGenerateForm)
    }
  }

  gpSteps() {
    if (this.totalClaims == 0) {
      this.generatingPayableArr = {
        "id": 4,
        "done": "0",
        "step": "4",
        "processing": "Generating Payable",
        "result": ""
      }
    } else {
      this.generatingPayableArr = {
        "id": 4,
        "done": "0",
        "step": "4",
        "processing": "Generating Payable",
        "result": "Processing"
      }
    }
    this.fieldArray.push(this.generatingPayableArr);
    this.generatingPayable(this.paymentGenerateForm.value).then(res => {
      if (this.totalClaims == 0) {
        this.update = {
          "id": 4,
          "done": "1",
          "step": "4",
          "processing": "Generating Payable",
          "result": ""
        }
      } else {
        this.update = {
          "id": 4,
          "done": "1",
          "step": "4",
          "processing": "Generating Payable",
          "result": "The Payment Run # is " + this.paymentSumKey
        }
      }

      this.errorClaimListArr = {
        "id": 5,
        "done": "0",
        "step": "5",
        "processing": "Error Claims List",
        "result": "Processing"
      }
      this.showUpdatedItem(this.update);
      this.fieldArray.push(this.errorClaimListArr);
      this.errorClaimsList(this.paymentGenerateForm.value).then(res => {
        this.update = {
          "id": 5,
          "done": "1",
          "step": "5",
          "processing": "Error Claims List",
          "result": this.errorClaimLListMsg
        }
        this.generatingEftRecordsArr = {
          "id": 6,
          "done": "0",
          "step": "6",
          "processing": "Generating EFT Records",
          "result": "Processing"
        }
        this.showUpdatedItem(this.update);
        this.fieldArray.push(this.generatingEftRecordsArr);
        this.generatingEftRecords(this.paymentGenerateForm.value).then(res => {
          this.update = {
            "id": 6,
            "done": "1",
            "step": "6",
            "processing": "Generating EFT Records",
            "result": "Total EFT Records: " + this.totalEFTRecords
          }
          this.generatingChequeRecordsArr = {
            "id": 7,
            "done": "0",
            "step": "7",
            "processing": "Generating Cheque Records",
            "result": "Processing"
          }
          this.showUpdatedItem(this.update);
          this.fieldArray.push(this.generatingChequeRecordsArr);
          this.generatingChequeRecords(this.paymentGenerateForm.value).then(res => {
            this.update = {
              "id": 7,
              "done": "1",
              "step": "7",
              "processing": "Generating Cheque Records",
              "result": "Total Cheque Records: " + this.totalChequeRecords
            }
            this.generatingReportsArr = {
              "id": 8,
              "done": "0",
              "step": "8",
              "processing": "Exporting EFT File and Statement",
              "result": "Processing"
            }
            this.showUpdatedItem(this.update);
            this.fieldArray.push(this.generatingReportsArr);
            this.exportingEftFile(this.paymentGenerateForm.value).then(res => {
              this.update = {
                "id": 8,
                "done": "1",
                "step": "8",
                "processing": "Exporting EFT File and Statement",
                "result": this.exportEftResponse
              }
              this.generatingReportsArr = {
                "id": 9,
                "done": "0",
                "step": "9",
                "processing": "Printing Cheques",
                "result": "Processing"
              }
              this.showUpdatedItem(this.update);
              this.fieldArray.push(this.generatingReportsArr);
              this.finacialAdminInfoSearch(this.paymentGenerateForm.value).then(res => {
                this.update = {
                  "id": 9,
                  "done": "1",
                  "step": "9",
                  "processing": "Printing Cheques",
                  "result": this.financialAdminInfoResponse
                }
                this.generatingReportsArr = {
                  "id": 10,
                  "done": "0",
                  "step": "10",
                  "processing": "Generating Reports",
                  "result": "Processing"
                }
                this.showUpdatedItem(this.update);
                this.fieldArray.push(this.generatingReportsArr);
                if (this.planType == 'S') {
                  this.exportingPaymentFiles = {
                    "id": 11,
                    "done": "0",
                    "step": "11",
                    "processing": "Exporting Payment Files",
                    "result": "Processing"
                  }
                  this.fieldArray.push(this.exportingPaymentFiles);
                }
                this.generatingReports(this.paymentGenerateForm.value).then(res => {
                  this.update = {
                    "id": 10,
                    "done": "1",
                    "step": "10",
                    "processing": "Generating Reports",
                    "result": this.generatingReportsMsg
                  }
                  this.showUpdatedItem(this.update);

                  if (this.planType == 'S') {
                    this.updateExportingPaymentFiles = {
                      "id": 11,
                      "done": "1",
                      "step": "11",
                      "processing": "Exporting Payment Files",
                      "result": this.generatingReportsMsg
                    }
                    this.showUpdatedItem(this.updateExportingPaymentFiles);
                  }

                  if (this.generatingReportsResponseStatus) {
                    this.ToastrService.success(this.translate.instant('finance.toaster.paymentGenSuccess'));
                  } else {
                    this.ToastrService.error(this.translate.instant('finance.toaster.errorPaymentGenerated'));
                  }
                  this.generatePaymentButton = true;
                });
              });
            });
          });
        })
      })
    });
  }

  submitPaymentSumForm(paymentSumForm) {
    if (this.paymentSumForm.valid) {
      $("#closePaymentSumForm").trigger('click');
      this.paymentSumKey = paymentSumForm.value.paymentSumNo
      this.gpSteps();
    } else {
      this.validateAllFormFields(this.paymentSumForm)
    }
  }
  //Generate Payment 1st Step API
  getSystemParameter(planType) {
    this.planType = planType
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.getSystemParameter;
      this.paramData = {
        "planType": planType
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.paramData = Object.assign(this.paramData, {
            "pcheckParams": 1,
            "eftFileNo": data.result.eftFileNo,
          });
          this.eftFileNo = data.result.eftFileNo
          this.chequeNum = data.result.chequeNum
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.recNotFounndSysParam = true
          this.apiResponse = 1;
          resolve();
        } else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 2nd Step API
  checkingParams(paramData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.checkingParams;
      this.paramData = Object.assign(this.paramData, {
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.effectiveOn)
      });
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.eftFileNo = data.result.eftFileNo
          this.orgName = data.result.poriginatorName
          this.orgNo = data.result.poriginatorNo
          this.orgDesc = data.result.poriginatorDesc
          this.orgRecCenter = data.result.preceiverCenter
          this.bankNo = data.result.pbankNo
          this.branchNo = data.result.pbranchNo
          this.accNo = data.result.paccountNo
          this.defalutDir = data.result.pdefaultDir
          this.sPlanType = data.result.planType
          this.eftDueDate = data.result.peftDueDate
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "EFT_DUE_DATE_FOR_PLAN_TYPE_QUIKCARD_ALREADY_EXIST") {
          this.apiResponse = 1;
          this.checkingParamsErr = true;
          this.checkingParamsErrMsg = this.translate.instant('finance.toaster.EFT_DUE_DATE_FOR_PLAN_TYPE_QUIKCARD_ALREADY_EXIST');
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "EFT_DUE_DATE_FOR_PLAN_TYPE_ALBERTA_ALREADY_EXIST") {
          this.apiResponse = 1;
          this.checkingParamsErr = true;
          this.checkingParamsErrMsg = this.translate.instant('finance.toaster.EFT_DUE_DATE_FOR_PLAN_TYPE_ALBERTA_ALREADY_EXIST');
          resolve();
        } else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 3rd Step API
  totalPayableClaims(formData) {
    this.showLoader = true;
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.totalPayableClaims;
      let totalPayableClaimsParams = {
        'dental': (this.paymentGenerateForm.value.dental == true) ? 1 : 0,
        'vision': (this.paymentGenerateForm.value.vision == true) ? 1 : 0,
        'health': (this.paymentGenerateForm.value.health == true) ? 1 : 0,
        'drug': 1,
        'hsa': (this.paymentGenerateForm.value.supplement == true) ? 1 : 0,
        'planType': formData.planType
      }
      this.paramData = Object.assign({
        'pdental': '1',
        'pvision': "1",
        'phealth': "1",
        'pdrug': "1",
        'phsa': "1",
      })

      this.hmsDataService.postApi(url, totalPayableClaimsParams).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 1;
          this.totalClaims = data.result.totalClaims
          this.showLoader = false;
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "Generate Payable process is already done. Do you want to continue to generate EFT") {
          this.apiResponse = 1;
          this.totalClaims = data.result.totalClaims;
          this.showLoader = false;
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "SORRY_YOU_CANNOT_RUN_PAYMENT_ON_THIS_DATABASE") {
          this.apiResponse = 1;
          this.totalPayableClaimsErr = true;
          this.showLoader = false;
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "CLAIM_SCREEN_IS_LOCKED_BY_SOMEONE") {
          this.apiResponse = 0;
          this.totalPayableClaimsLockErr = true;
          this.showLoader = false;
          resolve();
        }
        else {
          this.showLoader = false;
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 4th Step API
  generatingPayable(formData) {
    let promise = new Promise((resolve, reject) => {
      if (this.totalClaims == 0) {
        resolve();
      } else {
        var url = FinanceApi.generatingPayable;
        let param = {
          'dental': (this.paymentGenerateForm.value.dental == true) ? 1 : 0,
          'planType': formData.planType,
          "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.effectiveOn),
          "eftFileNo": this.eftFileNo
        }
        if (!this.hideFields) {
          param = Object.assign(param, {
            "cardHolderKey": 1,
            "providerKey": 1,
            "otherKey": 1,
            "pcoId": (formData.companyNo) ? formData.companyNo : '',
            "pconfirmId": (formData.confirmationNo) ? formData.confirmationNo : '',
            'vision': (this.paymentGenerateForm.value.vision == true) ? 1 : 0,
            'health': (this.paymentGenerateForm.value.health == true) ? 1 : 0,
            'drug': 1,
            'hsa': (this.paymentGenerateForm.value.supplement == true) ? 1 : 0,
          })
        } else {
          param = Object.assign(param, {
            'vision': 0,
            'health': 0,
            'drug': 0,
            'hsa': 0,
          })
        }

        this.hmsDataService.postApi(url, param).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.paymentSumKey = +data.result.paymentRunKey
            this.apiResponse = 1;
            resolve();
          } else {
            this.apiResponse = 0;
            this.reinitializeProcess().then(res => {
              resolve();
            })
          }
        })
      }
    })
    return promise;
  }

  //Generate Payment 5th Step API
  errorClaimsList(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.errorClaimsList;
      let param = {
        "paymentSumKey": this.paymentSumKey,
        "planType": formData.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.effectiveOn)
      }

      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Need to be change
          this.apiResponse = 1;
          this.errorClaimLListMsg = 'Error Claims List Report are generated.'
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 1;
          this.errorClaimLListMsg = 'Error Claims List Report are not generated.'
          resolve();
        }
        else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 6th Step API
  generatingEftRecords(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.generatingEftRecords;

      let param = {
        'dental': (this.paymentGenerateForm.value.dental == true) ? 1 : 0,
        "planType": formData.planType,
        "peftDueDate": this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.effectiveOn),
        "eftFileNo": this.eftFileNo,
        "paymentSumKey": +this.paymentSumKey
      }
      if (!this.hideFields) {
        param = Object.assign(param, {
          "cardHolderKey": 1,
          "providerKey": 1,
          "otherKey": 1,
          'vision': (this.paymentGenerateForm.value.vision == true) ? 1 : 0,
          'health': (this.paymentGenerateForm.value.health == true) ? 1 : 0,
          'drug': 1,
          'hsa': (this.paymentGenerateForm.value.supplement == true) ? 1 : 0,
        })
      } else {
        param = Object.assign(param, {
          'vision': 0,
          'health': 0,
          'drug': 0,
          'hsa': 0,
        })
      }

      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Needs to be change
          this.apiResponse = 1;
          this.totalEFTRecords = data.result.ptotalEftRecord
          resolve();
        } else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 7th Step API
  generatingChequeRecords(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.generatingChequeRecords;
      let param = {
        'dental': (this.paymentGenerateForm.value.dental == true) ? 1 : 0,
        "planType": formData.planType,
        "paymentSumKey": +this.paymentSumKey
      }
      if (!this.hideFields) {
        param = Object.assign(param, {
          "cardHolderKey": 1,
          "providerKey": 1,
          "otherKey": 1,
          'vision': (this.paymentGenerateForm.value.vision == true) ? 1 : 0,
          'health': (this.paymentGenerateForm.value.health == true) ? 1 : 0,
          'drug': 1,
          'hsa': (this.paymentGenerateForm.value.supplement == true) ? 1 : 0,
        })
      } else {
        param = Object.assign(param, {
          'vision': 0,
          'health': 0,
          'drug': 0,
          'hsa': 0,
        })
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Needs to be change
          this.apiResponse = 1;
          this.totalChequeRecords = data.result.totalChequeRecords
          resolve();
        } else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 8th Step API
  exportingEftFile(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.exportingEftFile;
      let param = {
        "paymentSumKey": +this.paymentSumKey,
        "eftSumDueDate": this.changeDateFormatService.convertDateObjectToString(this.paymentGenerateForm.value.effectiveOn),
        "disciplines": this.diciplinePopupArr,
        "eftFileNo": this.eftFileNo,
        "poriginatorName": this.orgName,
        "poriginatorNo": this.orgNo,
        "poriginatorDesc": this.orgDesc,
        "preceiverCenter": this.orgRecCenter,
        "pbankNo": this.bankNo,
        "pbranchNo": this.branchNo,
        "paccountNo": this.accNo,
        "pdefaultDir": this.defalutDir,
        "planType": this.sPlanType,
        "peftDueDate": this.eftDueDate
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if (data.hmsMessage.messageShort == 'FILE_NOT_GENERATED') {
            this.exportEftResponse = 'File Not Generated'
          } else {
            this.exportEftResponse = '<p>' + data.result.eftFile + '</p><p>' + data.result.eftSummaryFilePath + '</p><p>' + data.result.eftStatementFilePath + '</p>'
          }
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.exportEftResponse = data.hmsMessage.messageShort
          this.apiResponse = 1;
          resolve();
        } else {
          this.exportEftResponse = data.hmsMessage.messageShort
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 9th Step API
  finacialAdminInfoSearch(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.finacialAdminInfoSearch;
      let param = {
        "paymentSumKey": +this.paymentSumKey,
        "planType": formData.planType,
        "payeeCds": ['D'],
        "disciplines": this.diciplinePopupArr,
        "peftDueDate": this.eftDueDate,
        "transTypeCd": 'A',
        "tranStatusCds": ['A']
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Needs to be change
          this.financialAdminInfoResponse = data.result.printChequeFilePath
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 1;
          resolve();
        } else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  //Generate Payment 10th Step API
  generatingReports(formData) {
    let promise = new Promise((resolve, reject) => {
      var url = FinanceApi.generatingReports;
      let param = {
        "paymentSumKey": +this.paymentSumKey,
        "businessTypeDesc": formData.planType,
        "planType": formData.planType,
        "peftDueDate": this.eftDueDate,
        "disciplines": this.diciplinePopupArr
      }
      this.hmsDataService.postApi(url, param).subscribe(data => {
        if (data.code == 200 && data.status == "OK") { //Needs to be change
          this.apiResponse = 1;
          this.generatingReportsResponseStatus = true
          this.generatingReportsMsg = '<p>' + data.result.payableFilePath + '</p><p>' + data.result.transactionListFilePath + '</p><p>' + data.result.paymentSummaryFilePath + '</p><p>' + data.result.prvdrNoEftFilePath + '</p><p>' + data.result.patientChequeListFilePath + '</p><p>' + data.result.providerChequeListFilePath + '</p><p>' + data.result.providerPatChequeListFilePath + '</p><p>' + 'QC Payment Reports are generated.'
          resolve();
        } else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.apiResponse = 1;
          this.generatingReportsResponseStatus = false
          this.generatingReportsMsg = "QC Payment Reports are not generated."
          resolve();
        } else {
          this.apiResponse = 0;
          this.generatingReportsResponseStatus = false
          this.reinitializeProcess().then(res => {
            resolve();
          })
        }
      })
    })
    return promise;
  }

  // If error in generate payment then start process again
  reinitializeProcess() {
    let promise = new Promise((resolve, reject) => {
      if (this.apiResponse == 0) {
        this.exDialog.openConfirm(this.translate.instant('finance.toaster.clickToReintiatePaymentProcess')).subscribe((valueDeletePlan) => {
          if (valueDeletePlan) {
            this.fieldArray = []
            this.submitPaymentGenerateForm(this.paymentGenerateForm);
          } else {
            this.generatePaymentButton = false
            this.fieldArray = []
          }
        })
      } else {
        resolve();
      }
    })
    return promise
  }

  resetGeneratePaymentForm() {
    this.paymentGenerateForm.reset();
    this.paymentSumForm.reset();
    this.hideFields = false;
    this.recNotFounndSysParam = false
    this.fieldArray = [];
    this.manualPaymentSumKey = ''
    this.totalClaims = '';
    $("#closeGeneratePaymentForm").trigger('click');
    this.generatePaymentButton = false
    this.diciplinePopupArr = []
    this.paymentGenerateForm.controls['drug'].setValue("true");
  }

  resetGeneratePaymentFormWithoutClose() {
    this.fieldArray = []
    this.generatePaymentButton = false
  }

  resetPaymentSumForm() {
    $("#closePaymentSumForm").trigger('click');
  }
  //On select Transaction Search option
  onTransactionSearchRadioSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedTransSearchRadioName = selected.originalObject.key
      this.transactionSearch.controls['transNo'].reset();
      this.transactionSearch.controls['transStartDate'].reset();
      this.transactionSearch.controls['transEndDate'].reset();
      this.transactionSearch.controls['transStartAmt'].reset();
      this.transactionSearch.controls['transEndAmt'].reset();
      this.transactionSearch.controls['chequeRefNo'].reset();
      this.transactionSearch.controls['chequeRefNoStart'].reset();
      this.transactionSearch.controls['chequeRefNoEnd'].reset();
      this.transactionSearch.controls['paymentSumKey'].reset();
      this.transOpt();
      if (this.transRange || this.transDate) {
        this.transactionSearch.controls['businessType'].setValidators([Validators.required]);
        this.transactionSearch.controls['businessType'].updateValueAndValidity()
      } else {
        this.transactionSearch.controls['businessType'].clearValidators();
        this.transactionSearch.controls['businessType'].updateValueAndValidity()
      }
    }
  }

  //In 9th step Generate Payment required shorcode in request
  convertPayeeValueIntoCode() {
    if (this.payeeValue == 'Provider') {
      return 'D'
    } else if (this.payeeValue == 'Cardholder') {
      return 'C'
    } else if (this.payeeValue == 'Other') {
      return 'O'
    }
  }

  //In 9th step Generate Payment required shorcode in request
  convertTransactionTypeIntoCode() {
    if (this.transactionTypeValue == 'Cash Receipt') {
      return 'A'
    } else if (this.transactionTypeValue == 'Claim Payment') {
      return 'P'
    } else if (this.transactionTypeValue == 'Cheque Reversal') {
      return 'R'
    }
  }

  //In 9th step Generate Payment required shorcode in request
  convertTransactionStatusIntoCode() {
    if (this.transactionStatusValue == 'Issued') {
      return 'A'
    } else if (this.transactionStatusValue == 'Stopped') {
      return 'S'
    } else if (this.transactionStatusValue == 'Pending') {
      return 'P'
    } else if (this.transactionStatusValue == 'Cashed') {
      return 'H'
    } else if (this.transactionStatusValue == 'Cancelled') {
      return 'C'
    } else if (this.transactionStatusValue == 'Stale-dated') {
      return 'T'
    }
  }

  //Default Patch Plan Type Quikcard value in Generate Payment Popup
  patchPlanType() {
    this.paymentGenerateForm.patchValue({
      "planType": 'Q'
    })
    if (this.diciplinePopupArr.includes('DR')) {
      //do nothing
    } else {
      this.diciplinePopupArr.push('DR')
    }
  }

  /**
 * Get Discilipins List
 */
  getDiscilipinList() {
    this.hmsDataService.getApi(FinanceApi.getDisciplineUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.discilipinList = data.result;
        this.discilipinData = this.completerService.local(
          this.discilipinList,
          "disciplineName",
          "disciplineName"
        )
      }
    })
  }

  onSelectedDiscipline(selected: CompleterItem) {
    if (selected) {
      this.disciplineValue = selected.originalObject.disciplineCd;
    }
    else {
      this.disciplineValue = ''
    }
  }

  onChangePlanType(newValue) {
    this.selectedPlanType = newValue;
    if (this.selectedPlanType == 'S') {
      this.hideFields = true
      for (var i = 0; i < this.diciplinePopupArr.length; i++) {
        if (this.diciplinePopupArr[i] == 'DR') {
          this.diciplinePopupArr.splice(i, 1);
        }
      }
    } else if (this.selectedPlanType == 'Q') {
      this.hideFields = false;
      this.disciplineArr.push('DR')
    }
  }

  /* Filter Search on every Column in Grid*/

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchTransactionList(tableId);
    }
  }

  staleChequePopup() {
    //Predictive Company Search Upper
    this.businessTypeData = this.completerService.local(
      this.currentUser.businessType,
      "businessTypeDesc",
      "businessTypeDesc"
    );
  }

  resetStaleChequeForm() {
    this.staleChequeForm.reset();
    this.selectedBusinessTypeCdValue = ''
  }

  resetGenerateStaleChequeForm() {
    $("#closeStaleChequeForm").trigger('click');
  }

  onBusinessTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedBusinessTypeCdValue = selected.originalObject.businessTypeCd;
    }
    else {
      this.selectedBusinessTypeCdValue = '';
    }
  }

  generateStaleCheque(staleChequeForm) {
    if (this.staleChequeForm.valid) {
      this.showLoader = true;
      var url = FinanceApi.generateStaleCheque;
      this.paramData = {
        "planType": this.selectedBusinessTypeCdValue,
        "dateAsOf": this.changeDateFormatService.convertDateObjectToString(this.staleChequeForm.value.dateAsOf)
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.hmsMessage.messageShort == "SUCCESS") {
          this.showLoader = false;
          this.ToastrService.success('Stale Cheque Generated Successfully!');
          $("#closeStaleChequeForm").trigger('click');
        } else if (data.code == 400 && data.hmsMessage.messageShort == "STALE_CHEQUE_ALREADY_GENERATED_WITH_PROVIDED_DATE") {
          this.showLoader = false;
          this.ToastrService.error('Stale Cheque Already Generated with provided date!')
        } else {
          this.showLoader = false;
          this.ToastrService.error('Something went wrong');
        }
      });
    } else {
      this.validateAllFormFields(this.staleChequeForm)
    }
  }

  cancelCheque() {
    this.exDialog.openConfirm('About to cancel EFT payment for Trans # ' + this.selectedTransSearchRowData.paymentKey + ' . Ok?').subscribe((value) => {
      if (value) {
        this.showLoader = true;
        var url = FinanceApi.cancelChequeApi;
        {
          var paramData = {
            "discipline": this.selectedTransSearchRowData.pdiscipline,
            "paymentKey": this.selectedTransSearchRowData.paymentKey,
            "canceled": "T",
            "issued": "F"
          }
          this.hmsDataService.postApi(url, paramData).subscribe(data => {
            this.showLoader = false
            if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == "CHEQUE_CANCELLED_SUCCESSFULLY") {
              this.ToastrService.success('Cheque Cancelled successfully!');
            } else {
              this.ToastrService.error(data.hmsMessage.messageShort);
            }
          });
        }
      }
    })
  }

  stopAndReissueCheque() {
    this.exDialog.openConfirm('About to cancel EFT payment for Trans # ' + this.selectedTransSearchRowData.paymentKey + ' . Ok?').subscribe((value) => {
      if (value) {
        this.showLoader = true;
        var url = FinanceApi.stopAndCancelApi;
        {
          var paramData = {
            "discipline": this.selectedTransSearchRowData.pdiscipline,
            "paymentKey": this.selectedTransSearchRowData.paymentKey,
            "canceled": "T",
            "issued": "F"
          }
          this.hmsDataService.postApi(url, paramData).subscribe(data => {
            this.showLoader = false
            if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == "CHEQUE_STOP_SUCCESSFULLY") {
              this.ToastrService.success('Cheque Stopped Successfully!');
            } else {
              this.ToastrService.error(data.hmsMessage.messageShort);
            }
          });
        }
      }
    })
  }

  submitCancelAndReissueForm(cancelAndReissueForm) {
    if (this.cancelAndReissueForm.valid) {
      var paymentKey = cancelAndReissueForm.value.CancelAndReissuePaymentKey
      $("#closeCancelAndReissueForm").trigger('click');
      this.cancelAndReissueChequeProcess(paymentKey);
    } else {
      this.validateAllFormFields(this.cancelAndReissueForm)
    }
  }

  resetCancelAndReissueForm() {
    this.cancelAndReissueForm.reset();
    $("#closeCancelAndReissueForm").trigger('click');
  }

  cancelAndReissueChequeProcess(paymentKey) {
    this.exDialog.openConfirm('About to cancel EFT payment for Trans # ' + paymentKey + ' . Ok?').subscribe((value) => {
      if (value) {
        this.showLoader = true;
        var url = FinanceApi.cancelAndReissueChequeApi;
        {
          var paramData = {
            "paymentKey": paymentKey,
            "canceled": "T",
            "issued": "F"
          }
          this.hmsDataService.postApi(url, paramData).subscribe(data => {
            this.showLoader = false
            if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == "CHEQUE_CANCELLED_SUCCESSFULLY") {
              this.ToastrService.success('Cheque  Cancelled Successfully!');
            } else {
              this.ToastrService.error(data.hmsMessage.messageShort);
            }
          });
        }
      }
    })
  }

  cashReceiptPopup() {
    this.cashReceiptForm.controls['discipline'].setValue('D')
  }

  submitCashReceiptForm() {
    if (this.cashReceiptForm.valid) {
      this.showLoader = true;
      var url = FinanceApi.cashReceipt;
      this.paramData = {
        "discipline": (this.cashReceiptForm.value.discipline) ? this.cashReceiptForm.value.discipline : this.cashReceiptDisciplineValue,
        "confirmId": this.cashReceiptForm.value.confirmId
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.showLoader = false
          this.ToastrService.success('Cash Receipt Received Successfully');
          $("#cashReceiptForm").trigger('click');
        } else {
          this.showLoader = false
          this.ToastrService.error(data.hmsMessage.messageShort);
        }
      });
    } else {
      this.validateAllFormFields(this.cashReceiptForm)
    }
  }

  resetCashReceiptForm() {
    this.cashReceiptForm.reset();
    $("#closeCashReceiptForm").trigger('click');
  }

  cashReceiptDisciplineChange(event) {
    this.cashReceiptDisciplineValue = event.target.value
  }

  exportTransactionSearchList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    if (this.getLowerSearch) {
      var params = this.dataTableService.getFooterParams("transactionSearchList")
      var discipline
      var disciplineAr
      if (params[0].value) {
        discipline = params[0].value
        disciplineAr = this.disciplineConversion(discipline)
      } else {
        disciplineAr = []
      }
      // Added as per #1137
      if (this.providerNo) {
        var cardId = (this.transactionSearch.value.providerNo != null) ? this.transactionSearch.value.providerNo : ''
      } else if (this.cardholderNo) {
        var cardId = (this.transactionSearch.value.cardholderNo != null) ? this.transactionSearch.value.cardholderNo : ''
      } else {
        cardId = ''
      }
      this.reqParamPlan = {
        "start": 0, "length": this.dataTableService.totalRecords, 'disciplineList': disciplineAr, 'paymentKey': params[1].value, 'issueDate': params[2].value, 
        'chequeRefNo': params[3].value, 'tranStatCd': params[4].value, 'debitAmount': params[5].value, 'adminFee': params[6].value, 'generatedDate': params[7].value, 
        'stransStatus': params[8].value, 'clearSeq': params[9].value, 'cancelDate': params[10].value, 'stransType': params[11].value, 'sbusType': params[12].value, 
        'processDate': params[13].value, 'payee': params[14].value, 'paramApplication': paramApp,
        'transAmount': params[16].value, 'netPayableAmount': params[17].value, 'providerCardId': cardId, 'transStartDate': this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transStartDate),
        'transEndDate': this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transEndDate), 'chequeRefNoStart': this.transactionSearch.value.chequeRefNoStart, 
        'chequeRefNoEnd': this.transactionSearch.value.chequeRefNoEnd, 'paymentSumKey': this.transactionSearch.value.paymentSumKey, 
        'clearDate': (this.transactionSearch.value.clearDate == '' || this.transactionSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.clearDate),
        'transactionStartAmount': this.transactionSearch.value.transStartAmt != null ? this.transactionSearch.value.transStartAmt : '', 
        'transactionEndAmount': this.transactionSearch.value.transEndAmt != null ? this.transactionSearch.value.transEndAmt : '',
        'dueDate': (this.transactionSearch.value.eftDueDate == '' || this.transactionSearch.value.eftDueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.eftDueDate)
      }
    }
    else {
      if (this.providerNo) {
        var cardId = (this.transactionSearch.value.providerNo != null) ? this.transactionSearch.value.providerNo : ''
      } else if (this.cardholderNo) {
        var cardId = (this.transactionSearch.value.cardholderNo != null) ? this.transactionSearch.value.cardholderNo : ''
      } else {
        cardId = ''
      }
      this.reqParamPlan = {
        "start": 0, "length": this.dataTableService.totalRecords, 'paymentKey': this.transactionSearch.value.transNo, 'stransType': this.transactionSearch.value.transactionType, 'stransStatus': this.transactionSearch.value.transactionStatus, 'sbusType': (this.transactionSearch.value.businessType != null) ? this.transactionSearch.value.businessType : '', 'payee': this.transactionSearch.value.payee, 'generatedDate': (this.transactionSearch.value.generationDate == '' || this.transactionSearch.value.generationDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.generationDate),
        'issueDate': (this.transactionSearch.value.issueDate == '' || this.transactionSearch.value.issueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.issueDate), 'discipline': '', 'debitAmount': '', 'adminFee': '', 'transAmount': '', 'clearSeq': '', 'tranStatCd': '', 'cancelDate': '', 'processDate': '', 'transactionStartAmount': this.transactionSearch.value.transStartAmt,
        'transactionEndAmount': this.transactionSearch.value.transEndAmt, 'transStartDate': this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transStartDate), 'transEndDate': this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.transEndDate), 'chequeRefNoStart': this.transactionSearch.value.chequeRefNoStart, 'chequeRefNoEnd': this.transactionSearch.value.chequeRefNoEnd, 'chequeRefNo': this.transactionSearch.value.chequeRefNo, 'paymentSumKey': this.transactionSearch.value.paymentSumKey, 'disciplineList': this.disciplineArr, 'providerCardId': cardId, 'clearDate': (this.transactionSearch.value.clearDate == '' || this.transactionSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.transactionSearch.value.clearDate),
        'paramApplication': paramApp
      }
    }
    var transactionSearchURL = FinanceApi.transactionSearchFilterDataReportUrl;
    if (this.dataTableService.totalRecords > 500) {
      this.exDialog.openConfirm("It will take some time.Do you want to continue?").subscribe((value) => {
        if (value) {
          this.exportFile(transactionSearchURL, this.reqParamPlan)
        }
      });
    } else {
      this.exportFile(transactionSearchURL, this.reqParamPlan)
    }
  }

  exportFile(URL, reqParamPlan) {
    this.showLoader = false
    this.loader = "Loading File....."
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, reqParamPlan).subscribe(data => {
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
          a.download = "Transaction-List" + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      }
    })
  }

  transactionSearchClaimCheque() {
    this.showSearchTable = true;
    let reqParam = [
      { 'key': 'disciplineList', 'value': [this.transactionParams.discipline] },
      { 'key': 'generatedDate', 'value': '' },
      { 'key': 'issueDate', 'value': '' },
      { 'key': 'sbusType', 'value': this.transactionParams.businessType },
      { 'key': 'payee', 'value': this.transactionParams.payee },
      { 'key': 'stransStatus', 'value': '' },
      { 'key': 'stransType', 'value': '' },
      { 'key': 'dueDate', 'value': '' },
      { 'key': 'clearDate', 'value': '' },
      { 'key': 'claimKey', 'value': (this.transactionParams.claimKey) ? this.transactionParams.claimKey : '' },
    ]

    this.tableAction = [
      { 'name': 'edit', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye' },
    ]
    var URL = FinanceApi.getTransactionSearchFilterData;
    var tableId = "transactionSearchList"
    if (!$.fn.dataTable.isDataTable('#transactionSearchList')) {
      this.dataTableService.jqueryDataTableTransSearch(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, this.tableAction, 15, [2, 7, 10, 13], '', [5, 6])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
    }
  }

  ngOnDestroy() {
    if (this.FinanceService.isBackCompanySearch == false) {
      this.FinanceService.companySearchedData = ''
      this.FinanceService.searchedCompanyName = ''
      this.FinanceService.searchedCompanyId = ''
    }
  }

  disciplineConversion(value) {
    let disciplineClaimCheque = []
    if (value == 'Dental') {
      disciplineClaimCheque = ["D"]
    } else if (value == 'Vision') {
      disciplineClaimCheque = ["V"]
    } else if (value == 'Health') {
      disciplineClaimCheque = ["H"]
    } else if (value == 'Drug') {
      disciplineClaimCheque = ["DR"]
    } else if (value == 'Supplemental') {
      disciplineClaimCheque = ["HS"]
    }
    return disciplineClaimCheque
  }

  // Log #1137: Client Feedback
  getTransactionSearchScreenVal() {
    if (this.transactionSearch.value.disciplinesChkDental) {
      this.disciplineArr.push("D")
    }
    if (this.transactionSearch.value.disciplinesChkVision) {
      this.disciplineArr.push("V")
    }
    if (this.transactionSearch.value.disciplinesChkDrug) {
      this.disciplineArr.push("DR")
    }
    if (this.transactionSearch.value.disciplinesChkHealth) {
      this.disciplineArr.push("H")
    }
    if (this.transactionSearch.value.disciplinesChkSupplement) {
      this.disciplineArr.push("HS")
    }
    if (this.transactionSearch.value.disciplinesChkWellness) {
      this.disciplineArr.push("W")
    }
    this.transactionSearch.value.TransName
    if (this.transactionSearch.value.TransName == 'Transaction Number') {
      this.selectedTransSearchRadioName = 'transactionNo'
    } else if (this.transactionSearch.value.TransName == 'Transaction Range') {
      this.selectedTransSearchRadioName = 'transactionRange'
    } else if (this.transactionSearch.value.TransName == 'Transaction Date Range') {
      this.selectedTransSearchRadioName = 'transactionDateRange'
    } else if (this.transactionSearch.value.TransName == 'Cheque Number') {
      this.selectedTransSearchRadioName = 'chequeNo'
    } else if (this.transactionSearch.value.TransName == 'Cheque Range') {
      this.selectedTransSearchRadioName = 'chequeRange'
    } else if (this.transactionSearch.value.TransName == 'Cheque Range') {
      this.selectedTransSearchRadioName = 'paymentRun'
    }
    this.transOpt()
    this.transPayee = this.transactionSearch.value.payee
    if (this.transPayee == 'Provider') {
      this.providerNo = true;
      this.cardholderNo = false;
    } else if (this.transPayee == 'Cardholder') {
      this.providerNo = false;
      this.cardholderNo = true;
    } else {
      this.providerNo = false;
      this.cardholderNo = false;
    }
    this.searchTransaction(this.transactionSearch)
  }
}