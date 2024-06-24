import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompleterItem, CompleterData, CompleterService } from 'ng2-completer';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { FinanceApi } from '../finance-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { FinanceService } from '../finance.service';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { ToastrService } from 'ngx-toastr';
import { RequestOptions, Headers } from '@angular/http';
@Component({
  selector: 'app-payment-search',
  templateUrl: './payment-search.component.html',
  styleUrls: ['./payment-search.component.css'],
  providers: [ChangeDateFormatService, DatatableService]
})
export class PaymentSearchComponent implements OnInit {

  paymentSearch: FormGroup
  isOpen: boolean = false
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  public paymentSearchRadio: CompleterData
  selectedPaymentSearchRadioName: any;
  paymentSearchList = [
    { "key": "none", "value": "None" },
    { "key": "chequeNo", "value": "Payment Number" },
    { "key": "chequeRange", "value": "Payment Range Number" },
  ]
  cheqNo: boolean = false
  cheque: boolean = false
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public businessTypeData: CompleterData
  businessTypeList
  transPayee
  providerNo: boolean = false
  cardholderNo: boolean = false
  companyNo: boolean = false
  brokerNo: boolean = false
  public payeeData: CompleterData;
  payeeList = [
    { 'payeeTypeKey': 1, 'payeeTypeCd': "P", 'payeeTypeDesc': "Provider" },
    { 'payeeTypeKey': 2, 'payeeTypeCd': "CH", 'payeeTypeDesc': "Cardholder" },
    { 'payeeTypeKey': 3, 'payeeTypeCd': "O", 'payeeTypeDesc': "Other" },
    { 'payeeTypeKey': 4, 'payeeTypeCd': "C", 'payeeTypeDesc': "Company" },
    { 'payeeTypeKey': 5, 'payeeTypeCd': "B", 'payeeTypeDesc': "Broker" }
  ]
  public transactionStatusData: CompleterData
  transactionStatusList;
  public transactionTypeData: CompleterData
  transactionTypeList
  dateNameArray = {}
  getLowerSearch: boolean = false;
  transactionTypeValue: any;
  transactionStatusValue: any;
  payeeValue: any;
  showSearchTable: boolean = false;
  reqParam
  disciplineArr = []
  searchDiscilipineList: any;
  generateDate: any;
  issueDate: any;
  sbusType: any;
  payee: any;
  stransStatus: any;
  stransType: any;
  dueDate: any;
  clearDate: any;
  transNo: any;
  transNotext: any;
  transRange: any;
  transDate: any;
  payment: any;
  tableAction
  columns;
  chequeRefNo;
  providerCardNum;
  setDiscipline;
  ObservableObj;
  check = true
  showLoader: boolean = false
  selectedPaymentSearchRowData;
  isDisable: boolean = false
  hideSearch: boolean = false
  transactionParams: boolean = false
  disciplineValue;
  public discilipinData: CompleterData
  discilipinList;
  public payeeDataLower: CompleterData
  public transactionTypeDataLower: CompleterData
  public transactionStatusDataLower: CompleterData
  loader: string;
  imagePath;
  docName
  docType
  netPayableAmount;
  totalPaid;
  chequeRefNoStart
  chequeRefNoEnd
  paySumKey
  debitAmount;
  adminFee
  transStatusCd
  addPaymentForm: FormGroup
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false
  error: any;
  error1: any;
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  selectedFile;
  pdiscipline
  payeeType
  transStatusType
  eftKey
  btnType
  chequeNo
  paymentPopupHeading
  todayDate
  adjustmentBtn: boolean = false
  reIssueBtn: boolean = false
  showGrid: boolean = false
  paymentGridColumns = []
  transPayKey
  chequeNum
  columnFilterSearch: boolean = false;
  issueToDate: any
  chequeRefNoVal
  constructor(public completerService: CompleterService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private financeService: FinanceService,
    private translate: TranslateService,
    public currentUserService: CurrentUserService,
    private router: Router,
    private exDialog: ExDialog,
    private toastrService: ToastrService,
    private route: ActivatedRoute) {
      this.error = { isError: false, errorMessage: '' };
      this.error1 = { isError: false, errorMessage: '' };
     }

  ngOnInit() {
    this.paymentSearch = new FormGroup({
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
      'disciplinesChkWellness': new FormControl(''),
      'issueToDate': new FormControl(''),
      'companyNo': new FormControl(''),
      'brokerNo': new FormControl('')
    });

    this.paymentSearchRadio = this.completerService.local(
      this.paymentSearchList,
      "value",
      "value"
    );

    this.getBusinessType()
    this.getTransactionStatus()
    this.getTransactionType()
    this.dataTableInitialize()
    this.getDiscilipinList()
    this.getTransactionTypeLower()
    this.getTransactionStatusLower()

    // Get Cheque Refenece No. From View Icon Of Pending Electronic Payment Adjustment Tile(11-May-2022)
    setTimeout(() => {
      this.route.queryParams.subscribe(params => {
        let chqRefNo = params['chqRefNo']
        if (chqRefNo != undefined) {
          this.paymentSearch.patchValue({'TransName': 'Payment Number'})
          this.paymentSearch.patchValue({'chequeRefNo': chqRefNo})
          if (this.paymentSearch.value.TransName == 'Payment Number') {
            this.selectedPaymentSearchRadioName = 'chequeNo'
          }
          this.paymentOpt()
          this.searchPayment(this.paymentSearch)
        }
      })
    }, 1000);
    // Get Payee List(31-May-2022)
    this.payeeData = this.completerService.local(
      this.payeeList,
      "payeeTypeDesc",
      "payeeTypeDesc"
    );
    this.payeeDataLower = this.completerService.local(
      this.payeeList,
      "payeeTypeDesc",
      "payeeTypeDesc"
    ); 
    this.addPaymentForm = new FormGroup({
      'transactionDate': new FormControl('', [Validators.required]),
      'transactionAmt': new FormControl(''),
      'transactionDesc': new FormControl(''),
      'comment': new FormControl(''),
      'documentName': new FormControl('', [])
    })
    this.todayDate = this.changeDateFormatService.getToday();
    }

  dataTableInitialize() {
    // Get the Translation of Dental Service List using Observable 
    this.ObservableObj = Observable.interval(1000).subscribe(value => {
      if (this.check) {
        if ('feeGuide.dentalService.serviceId' == this.translate.instant('feeGuide.dentalService.serviceId')) {
        } else {
          this.columns = [
            { title: this.translate.instant('finance.transactionSearch.tranType'), data: 'transType' },
            { title: this.translate.instant('finance.transactionSearch.issuedDate'), data: 'issueDate' },
            { title: this.translate.instant('Payment No.'), data: 'chequeRefNo' },
            { title: this.translate.instant('finance.transactionSearch.debitAmount'), data: 'debitAmount' },
            { title: this.translate.instant('finance.transactionSearch.adminFee'), data: 'adminFee' },
            { title: this.translate.instant('finance.transactionSearch.tranStatus'), data: 'transStatus' },
            { title: this.translate.instant('finance.transactionSearch.businessType'), data: 'sbusType' },
            { title: this.translate.instant('finance.transactionSearch.payee'), data: 'payee' },
            { title: this.translate.instant('finance.paymentSearch.totalPaid'), data: 'transAmount' },
            { title: this.translate.instant('finance.paymentSearch.netPayableAmount'), data: 'netPayableAmount'},
            { title: this.translate.instant('finance.transactionSearch.action'), data: 'chequeRefNo'}
          ];
          this.paymentGridColumns = [
            { title: this.translate.instant('Payment Number'), data: 'cheque'}, 
            { title: this.translate.instant('Issued Date'), data: 'issueDate' },
            { title: this.translate.instant('uft.uftSearch.transAmount'), data: 'transAmount' },
            { title: this.translate.instant('Admin Fee'), data: 'adminFee' },
            { title: this.translate.instant('Debit Amount'), data: 'debitAmount' },
            { title: this.translate.instant('Adjustment Date'), data: 'adjustmentDate' },
            { title: this.translate.instant('Transaction Status'), data: 'transStatus' }
          ]
          this.check = false
          if (this.currentUserService.transactionQueryParams) {
            this.showLoader = false
          } else {
            this.showLoader = false
            this.hideSearch = true
          }
          this.ObservableObj.unsubscribe();

          if (this.financeService.companySearchedData && this.financeService.isBackCompanySearch) {
            this.paymentSearch.patchValue(this.financeService.companySearchedData)
            if (this.paymentSearch.value.disciplinesChkDental) {
              this.disciplineArr.push("D")
            }
            if (this.paymentSearch.value.disciplinesChkVision) {
              this.disciplineArr.push("V")
            }
            if (this.paymentSearch.value.disciplinesChkDrug) {
              this.disciplineArr.push("DR")
            }
            if (this.paymentSearch.value.disciplinesChkHealth) {
              this.disciplineArr.push("H")
            }
            if (this.paymentSearch.value.disciplinesChkSupplement) {
              this.disciplineArr.push("HS")
            }
            if (this.paymentSearch.value.disciplinesChkWellness) {
              this.disciplineArr.push("W")
            }
            this.paymentSearch.value.TransName
            if (this.paymentSearch.value.TransName == 'Transaction Number') {
              this.selectedPaymentSearchRadioName = 'transactionNo'
            } else if (this.paymentSearch.value.TransName == 'Transaction Range') {
              this.selectedPaymentSearchRadioName = 'transactionRange'
            } else if (this.paymentSearch.value.TransName == 'Payment Date Range') {
              this.selectedPaymentSearchRadioName = 'transactionDateRange'
            } else if (this.paymentSearch.value.TransName == 'Payment Number') {
              this.selectedPaymentSearchRadioName = 'chequeNo'
            } else if (this.paymentSearch.value.TransName == 'Payment Range Number') {
              this.selectedPaymentSearchRadioName = 'chequeRange'
            } else if (this.paymentSearch.value.TransName == 'Cheque Range') {
              this.selectedPaymentSearchRadioName = 'paymentRun'
            }
            this.paymentOpt()
            this.transPayee = this.paymentSearch.value.payee
            if (this.transPayee == 'Provider') {
              this.providerNo = true;
              this.cardholderNo = false;
              this.companyNo = false
              this.brokerNo = false
            } else if (this.transPayee == 'Cardholder') {
              this.providerNo = false;
              this.cardholderNo = true;
              this.companyNo = false
              this.brokerNo = false
            } else if(this.transPayee == 'Company') {
              this.providerNo = false;
              this.cardholderNo = false;
              this.companyNo = true
              this.brokerNo = false
            } else if (this.transPayee == 'Broker') {
              this.providerNo = false;
              this.cardholderNo = false;
              this.companyNo = false
              this.brokerNo = true
            } else {
              this.providerNo = false;
              this.cardholderNo = false;
              this.companyNo = false
              this.brokerNo = false
            }
            this.financeService.isBackCompanySearch = false
            this.searchPayment(this.paymentSearch)
          } else {   
            this.financeService.companySearchedData = ''
            this.financeService.searchedCompanyName = ''
            this.financeService.searchedCompanyId = ''
          }
        }
      }
    });

    var self = this
    $(document).on('click', '#paymentSearchList .view-ico', function () {
      var selectedDiscipline = $(this).data('pdiscipline')
      var selectedPaymentKey = $(this).data('id')
      let transStatus = $(this).data('transstatus')
      let payee = $(this).data('payee')
      let issueDate = $(this).data('issuedate')
        self.financeService.isBackCompanySearch = true;
        self.router.navigate(['/finance/payment-search/paymentDetails/'], { queryParams: { 'discipline': selectedDiscipline, 'paymentKey': selectedPaymentKey, 'payee': payee, 'transStatus': transStatus, 'issueDate': issueDate, 'uniqueNum': self.providerCardNum } });
    })
    $(document).on('click', '#paymentSearchList a', function () {
      self.isDisable = false
      $('#paymentSearchList td').removeClass('highlightedRow');
    })
    $(document).on('click', '#paymentSearchList tr', function () {
      self.selectedPaymentSearchRowData = self.dataTableService.selectedRowPaymentSearch
      self.isDisable = true
    })
  }

  onPaymentDropdownSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedPaymentSearchRadioName = selected.originalObject.key
      this.paymentSearch.controls['transNo'].reset();
      this.paymentSearch.controls['transStartDate'].reset();
      this.paymentSearch.controls['transEndDate'].reset();
      this.paymentSearch.controls['transStartAmt'].reset();
      this.paymentSearch.controls['transEndAmt'].reset();
      this.paymentSearch.controls['chequeRefNo'].reset();
      this.paymentSearch.controls['chequeRefNoStart'].reset();
      this.paymentSearch.controls['chequeRefNoEnd'].reset();
      this.paymentSearch.controls['paymentSumKey'].reset();
      this.paymentOpt();
      if (this.transRange || this.transDate) {
        this.paymentSearch.controls['businessType'].setValidators([Validators.required]);
        this.paymentSearch.controls['businessType'].updateValueAndValidity()
      } else {
        this.paymentSearch.controls['businessType'].clearValidators();
        this.paymentSearch.controls['businessType'].updateValueAndValidity()
      }
    } else {
      this.cheqNo = false
    }
  }

  paymentOpt() {
    if (this.selectedPaymentSearchRadioName == 'transactionNo') {
      this.transNotext = true;
      this.transRange = false;
      this.transDate = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedPaymentSearchRadioName == 'transactionRange') {
      this.transRange = true;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedPaymentSearchRadioName == 'transactionDateRange') {
      this.transDate = true
      this.transRange = false;
      this.transNotext = false;
      this.cheqNo = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedPaymentSearchRadioName == 'chequeNo') {
      this.cheqNo = true;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheque = false;
      this.payment = false;
    }
    else if (this.selectedPaymentSearchRadioName == 'chequeRange') {
      this.cheque = true;
      this.transRange = false;
      this.transNotext = false;
      this.transDate = false;
      this.cheqNo = false;
      this.payment = false;
    }
    else if (this.selectedPaymentSearchRadioName == 'paymentRun') {
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

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && event.value == null && event.value == '') {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.paymentSearch.patchValue(datePickerValue);
      this.addPaymentForm.patchValue(datePickerValue)
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
      this.addPaymentForm.patchValue(datePickerValue)
    }
    if (event.reason == 2) {
      if (datePickerValue) {
        if (formName == 'paymentGenerateForm') {
        } else if (formName == 'paymentSearch') {
          this.paymentSearch.patchValue(datePickerValue);
          if (this.paymentSearch.value.transStartDate && this.paymentSearch.value.transEndDate) {
            var errorVal = this.changeDateFormatService.compareTwoDates(this.paymentSearch.value.transStartDate.date, this.paymentSearch.value.transEndDate.date);
            if (errorVal.isError == true) {
              this.paymentSearch.controls.transEndDate.setErrors({
                "transactionToDateCantLess": true
              });
              return;
            }
          }
        }
      }
    } 
    if (event.reason == 1 && event.value == '' && frmControlName == 'issueToDate' ) {
      this.paymentSearch.controls['issueDate'].clearValidators()
      this.paymentSearch.controls['issueDate'].updateValueAndValidity()
    }
    if (event.reason == 2 && event.value == '' && frmControlName == 'issueToDate' ) {
      this.paymentSearch.controls['issueDate'].clearValidators()
      this.paymentSearch.controls['issueDate'].updateValueAndValidity()
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

  onSelectedPayee(selected: CompleterItem) {
    if (selected) {
      this.transPayee = selected.originalObject.payeeTypeDesc
      if (this.transPayee == 'Provider') {
        this.providerNo = true;
        this.cardholderNo = false;
        this.companyNo = false
        this.brokerNo = false
      } else if (this.transPayee == 'Cardholder') {
        this.providerNo = false;
        this.cardholderNo = true;
        this.companyNo = false
        this.brokerNo = false
      } else if (this.transPayee == 'Company') {
        this.providerNo = false;
        this.cardholderNo = false;
        this.companyNo = true
        this.brokerNo = false
      } else if (this.transPayee == 'Broker') {
        this.providerNo = false;
        this.cardholderNo = false;
        this.companyNo = false
        this.brokerNo = true
      } else {
        this.providerNo = false;
        this.cardholderNo = false;
        this.companyNo = false
        this.brokerNo = false
      }
    } else {
      this.transPayee = "";
      this.providerNo = false;
      this.cardholderNo = false;
      this.companyNo = false
      this.brokerNo = false
    }
  }

  /* Get Transation Status List for Predictive Search */
  getTransactionStatus() {
    var url = FinanceApi.getTransactionStatusUrl
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionStatusList = data.result; // Enabled all transaction status value as discussed with Arun Sir(18-Apr-2022)
        this.transactionStatusData = this.completerService.local(
          this.transactionStatusList,
          "tranStatusDescription",
          "tranStatusDescription"
        );
      }
    })
  };

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

  searchPayment(paymentSearch) {
    this.setValidationOnIssueFromDate()
    this.getLowerSearch = false
    this.totalPaid = ''
    this.netPayableAmount = ''
    this.debitAmount = '';
    this.adminFee = ''
    this.transStatusCd = ''
    
    if (paymentSearch.valid) {
      this.transactionTypeValue = paymentSearch.value.transactionType
      this.transactionStatusValue = paymentSearch.value.transactionStatus
      this.payeeValue = this.paymentSearch.value.payee
      this.showSearchTable = true;
      this.reqParam = [
        { 'key': 'disciplineList', 'value': this.disciplineArr },
        { 'key': 'generatedDate', 'value': (paymentSearch.value.generationDate == '' || paymentSearch.value.generationDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.generationDate) },
        { 'key': 'issueStartDate', 'value': (paymentSearch.value.issueDate == '' || paymentSearch.value.issueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(paymentSearch.value.issueDate) },
        { 'key': 'sbusType', 'value': (paymentSearch.value.businessType != null) ? paymentSearch.value.businessType : '' },
        { 'key': 'payee', 'value': paymentSearch.value.payee },
        { 'key': 'stransStatus', 'value': paymentSearch.value.transactionStatus },
        { 'key': 'stransType', 'value': paymentSearch.value.transactionType },
        { 'key': 'dueDate', 'value': (paymentSearch.value.eftDueDate == '' || paymentSearch.value.eftDueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(paymentSearch.value.eftDueDate) },
        { 'key': 'clearDate', 'value': (paymentSearch.value.clearDate == '' || paymentSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(paymentSearch.value.clearDate) },
      ]
      if ((paymentSearch.value.issueDate != '' && paymentSearch.value.issueDate != null) && (paymentSearch.value.issueToDate == '' || paymentSearch.value.issueToDate == null)) {
        this.issueToDate = this.todayDate
        this.reqParam.push({
          "key": "issueEndDate",
          "value": this.changeDateFormatService.convertDateObjectToString(this.todayDate)
        })
      } else {
        this.issueToDate = (paymentSearch.value.issueToDate == '' || paymentSearch.value.issueToDate == null) ? '' : paymentSearch.value.issueToDate
        this.reqParam.push({
          "key": "issueEndDate",
          "value": (paymentSearch.value.issueToDate == '' || paymentSearch.value.issueToDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(paymentSearch.value.issueToDate)
        })
      }
      this.searchDiscilipineList = this.disciplineArr;
      this.generateDate = (paymentSearch.value.generationDate == '' || paymentSearch.value.generationDate == null) ? '' : this.paymentSearch.value.generationDate;
      this.issueDate = (paymentSearch.value.issueDate == '' || paymentSearch.value.issueDate == null) ? '' : (paymentSearch.value.issueDate);
      this.sbusType = (paymentSearch.value.businessType != null) ? paymentSearch.value.businessType : '';
      this.payee = paymentSearch.value.payee;
      this.stransStatus = paymentSearch.value.transactionStatus;
      this.stransType = paymentSearch.value.transactionType;
      this.dueDate = (paymentSearch.value.eftDueDate == '' || paymentSearch.value.eftDueDate == null) ? '' : paymentSearch.value.eftDueDate;
      this.clearDate = (paymentSearch.value.clearDate == '' || paymentSearch.value.clearDate == null) ? '' : paymentSearch.value.clearDate
      this.transNo = paymentSearch.value.transNo
      if (this.issueDate) {
        this.dateNameArray['issueStartDate'] = {
          year: this.issueDate.date.year,
          month: this.issueDate.date.month,
          day: this.issueDate.date.day
        }
      } else {
        this.dateNameArray['issueStartDate'] = ''
      }
      if (this.dateNameArray['issueStartDate'] == '') {
        this.dateNameArray['issueStartDate'] = []
      }
      if (this.issueToDate) {
        this.dateNameArray['issueEndDate'] = {
          year: this.issueToDate.date.year,
          month: this.issueToDate.date.month,
          day: this.issueToDate.date.day
        }
      } else {
        this.dateNameArray['issueEndDate'] = ''
      }
      if (this.dateNameArray['issueEndDate'] == '') {
        this.dateNameArray['issueEndDate'] = []
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
          "value": this.paymentSearch.value.transNo
        })
      }
      if (this.transRange) {
        this.reqParam.push({
          "key": "transactionStartAmount",
          "value": this.paymentSearch.value.transStartAmt
        },
          {
            "key": "transactionEndAmount",
            "value": this.paymentSearch.value.transEndAmt
          })
      }
      if (this.transDate) {
        this.reqParam.push({
          "key": "transStartDate",
          "value": this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.transStartDate),
        },
          {
            "key": "transEndDate",
            "value": this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.transEndDate)
          })
      }
      if (this.cheqNo) {
        this.reqParam.push({
          "key": "chequeRefNo",
          "value": this.paymentSearch.value.chequeRefNo
        })
      }
      if (this.cheque) {
        this.reqParam.push(
          {
            "key": "chequeRefNoStart",
            "value": this.paymentSearch.value.chequeRefNoStart
          },
          {
            "key": "chequeRefNoEnd",
            "value": this.paymentSearch.value.chequeRefNoEnd
          })
      }
      if (this.payment) {
        this.reqParam.push({
          "key": "paymentSumKey",
          "value": this.paymentSearch.value.paymentSumKey
        })
      }
      if (this.providerNo) {
        this.reqParam.push({ "key": "providerCardId", "value": (this.paymentSearch.value.providerNo != null) ? this.paymentSearch.value.providerNo : '' })
      } else if (this.cardholderNo) {
        this.reqParam.push({ "key": "providerCardId", "value": (this.paymentSearch.value.cardholderNo != null) ? this.paymentSearch.value.cardholderNo : '' })
      } else if (this.companyNo) {
        this.reqParam.push({ "key": "providerCardId", "value": (this.paymentSearch.value.companyNo != null) ? this.paymentSearch.value.companyNo : '' })
      } else if (this.brokerNo) {
        this.reqParam.push({ "key": "providerCardId", "value": (this.paymentSearch.value.brokerNo != null) ? this.paymentSearch.value.brokerNo : '' })
      } else {
        this.reqParam.push({ "key": "providerCardId", "value": '' })
      }

      this.tableAction = [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
        { 'name': 'RP', 'class': 'table-action-btn green-btn riPayment-ico', 'title': 'Reissue Payment' },
        { 'name': 'ADJ', 'class': 'table-action-btn green-btn adjust-ico', 'title': 'ADJ' }
      ]
      var URL = FinanceApi.getAdjPaymentSearchUrl;
      var tableId = "paymentSearchList"
      if (!$.fn.dataTable.isDataTable('#paymentSearchList')) {
        this.dataTableService.jqueryDataTableTransSearch(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reqParam, this.tableAction, 10, [1], '', [3, 4, 8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, URL, this.reqParam)
      }
      this.financeService.getCompanySearchData(this.paymentSearch.value, this.disciplineArr)
    } else {
      this.validateAllFormFields(this.paymentSearch)
    }

    this.generateDate = (paymentSearch.value.generationDate == '' || paymentSearch.value.generationDate == null) ? '' : this.paymentSearch.value.generationDate;
    this.issueDate = (paymentSearch.value.issueDate == '' || paymentSearch.value.issueDate == null) ? '' : (paymentSearch.value.issueDate);
    this.sbusType = (paymentSearch.value.businessType != null) ? paymentSearch.value.businessType : '';
    this.payee = paymentSearch.value.payee;
    this.stransStatus = paymentSearch.value.transactionStatus;
    this.stransType = paymentSearch.value.transactionType;
    this.dueDate = (paymentSearch.value.eftDueDate == '' || paymentSearch.value.eftDueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(paymentSearch.value.eftDueDate);
    this.clearDate = (paymentSearch.value.clearDate == '' || paymentSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(paymentSearch.value.clearDate)
    this.transNo = this.paymentSearch.value.transNo;
    this.chequeRefNo = this.paymentSearch.value.chequeRefNo
    this.chequeRefNoStart = this.paymentSearch.value.chequeRefNoStart
    this.chequeRefNoEnd = this.paymentSearch.value.chequeRefNoEnd
    this.paySumKey = this.paymentSearch.value.paymentSumKey
    if (this.providerNo) {
      this.providerCardNum = (this.paymentSearch.value.providerNo != null) ? this.paymentSearch.value.providerNo : ''
    } else if (this.cardholderNo) {
      this.providerCardNum = (this.paymentSearch.value.cardholderNo != null) ? this.paymentSearch.value.cardholderNo : ''
    } else if (this.companyNo) {
      this.providerCardNum = (this.paymentSearch.value.companyNo != null) ? this.paymentSearch.value.companyNo : ''
    } else if (this.brokerNo) {
      this.providerCardNum = (this.paymentSearch.value.brokerNo != null) ? this.paymentSearch.value.brokerNo : ''
    } else {
      this.providerCardNum = ''
    }
    if ((paymentSearch.value.issueDate != '' && paymentSearch.value.issueDate != null) && (paymentSearch.value.issueToDate == '' || paymentSearch.value.issueToDate == null)) {
      this.issueToDate = this.todayDate
    } else {
      this.issueToDate = (paymentSearch.value.issueToDate == '' || paymentSearch.value.issueToDate == null) ? '' : paymentSearch.value.issueToDate
    }
    if (this.issueDate) {
      this.dateNameArray['issueStartDate'] = {
        year: this.issueDate.date.year,
        month: this.issueDate.date.month,
        day: this.issueDate.date.day
      }
    }
    if (this.issueToDate) {
      this.dateNameArray['issueEndDate'] = {
        year: this.issueToDate.date.year,
        month: this.issueToDate.date.month,
        day: this.issueToDate.date.day
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
        this.setDiscipline = 'Wellness'
      }
    } else {
      this.setDiscipline = ''
    }
    this.searchDiscilipineList = this.setDiscipline
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

  clearSearchPayment() {
    this.paymentSearch.reset();
    this.paymentSearch.controls['businessType'].clearValidators();
    this.paymentSearch.controls['businessType'].updateValueAndValidity()
    this.payment = false;
    this.cheque = false;
    this.transRange = false;
    this.transNotext = false;
    this.transDate = false;
    this.cheqNo = false;
    this.disciplineArr = [];
    this.dueDate = ''
    this.clearDate = ''
    this.providerCardNum = ''
    this.showSearchTable = false;
    this.providerNo = false
    this.cardholderNo = false
    this.companyNo = false
    this.brokerNo = false
    this.payment = false;
    this.cheque = false;
    this.transRange = false;
    this.transNotext = false;
    this.transDate = false;
    this.cheqNo = false;
    this.disciplineArr = [];
    this.chequeRefNoStart = ''
    this.chequeRefNoEnd = ''
    this.paySumKey = ''
    this.dueDate = ''
    this.clearDate = ''
    this.providerCardNum = ''
    this.totalPaid = ''
    this.netPayableAmount = ''
    this.paymentSearch.controls['issueDate'].clearValidators()
    this.paymentSearch.controls['issueDate'].updateValueAndValidity()
  }

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
    params[11] = { key: 'chequeRefNoStart', value: this.chequeRefNoStart }
    params[12] = { key: 'chequeRefNoEnd', value: this.chequeRefNoEnd }
    params[13] = { key: 'paymentSumKey', value: this.paySumKey }
    params[14] = { key: 'dueDate', value: this.dueDate }
    params[15] = { key: 'clearDate', value: this.clearDate }
    params[16] = { key: 'providerCardId', value: this.providerCardNum }
    params[17] = { key: 'issueEndDate', value: this.changeDateFormatService.convertDateObjectToString(this.issueToDate)}
    params[18] = { key: 'disciplineList', value: this.disciplineArr }
    var dateParams = [1]
    var URL = FinanceApi.getAdjPaymentSearchUrl;
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }

  onSelectedDiscipline(selected: CompleterItem) {
    if (selected) {
      this.disciplineValue = selected.originalObject.disciplineCd;
    }
    else {
      this.disciplineValue = ''
    }
  }

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

  ngOnDestroy() {
    if (this.financeService.isBackCompanySearch == false) {
      this.financeService.companySearchedData = ''
      this.financeService.searchedCompanyName = ''
      this.financeService.searchedCompanyId = ''
    }
  }

  disciplineChange(evt) {
    if (this.paymentSearch.value.disciplinesChkDental || this.paymentSearch.value.disciplinesChkVision || this.paymentSearch.value.disciplinesChkHealth || this.paymentSearch.value.disciplinesChkDrug || this.paymentSearch.value.disciplinesChkSupplement || this.paymentSearch.value.disciplinesChkWellness) {
      if (this.disciplineArr.includes(evt.target.value)) {
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

  exportPaymentSearchList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    var reqParam;
    if (this.getLowerSearch) {
      var params = this.dataTableService.getFooterParams("paymentSearchList")
      if (this.providerNo) {
        var cardId = (this.paymentSearch.value.providerNo != null) ? this.paymentSearch.value.providerNo : ''
      } else if (this.cardholderNo) {
        var cardId = (this.paymentSearch.value.cardholderNo != null) ? this.paymentSearch.value.cardholderNo : ''
      } else if (this.companyNo) {
        var cardId = (this.paymentSearch.value.companyNo != null) ? this.paymentSearch.value.companyNo : ''
      } else if (this.brokerNo) {
        var cardId = (this.paymentSearch.value.brokerNo != null) ? this.paymentSearch.value.brokerNo : ''
      } else {
        cardId = ''
      }
      reqParam = {
        "start": 0, "length": this.dataTableService.totalRecords, 'disciplineList': this.disciplineArr, 'issueDate': params[1].value, 
        'chequeRefNo': params[2].value, 'debitAmount': params[3].value, 'adminFee': params[4].value, 
        'stransStatus': params[5].value, 'stransType': params[0].value, 'sbusType': params[6].value, 
        'payee': params[7].value, 'paramApplication': paramApp,
        'transAmount': params[9].value, 'netPayableAmount': params[10].value, 'providerCardId': cardId, 'transStartDate': this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.transStartDate),
        'transEndDate': this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.transEndDate), 'chequeRefNoStart': this.paymentSearch.value.chequeRefNoStart, 
        'chequeRefNoEnd': this.paymentSearch.value.chequeRefNoEnd, 'paymentSumKey': this.paymentSearch.value.paymentSumKey, 
        'clearDate': (this.paymentSearch.value.clearDate == '' || this.paymentSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.clearDate),
        'transactionStartAmount': this.paymentSearch.value.transStartAmt != null ? this.paymentSearch.value.transStartAmt : '', 
        'transactionEndAmount': this.paymentSearch.value.transEndAmt != null ? this.paymentSearch.value.transEndAmt : '',
        'dueDate': (this.paymentSearch.value.eftDueDate == '' || this.paymentSearch.value.eftDueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.eftDueDate)
      }
    }
    else {
      if (this.providerNo) {
        var cardId = (this.paymentSearch.value.providerNo != null) ? this.paymentSearch.value.providerNo : ''
      } else if (this.cardholderNo) {
        var cardId = (this.paymentSearch.value.cardholderNo != null) ? this.paymentSearch.value.cardholderNo : ''
      } else if (this.companyNo) {
        var cardId = (this.paymentSearch.value.companyNo != null) ? this.paymentSearch.value.companyNo : ''
      } else if (this.brokerNo) {
        var cardId = (this.paymentSearch.value.brokerNo != null) ? this.paymentSearch.value.brokerNo : ''
      } else {
        cardId = ''
      }
      reqParam = {
        "start": 0, "length": this.dataTableService.totalRecords, 'paymentKey': this.paymentSearch.value.transNo, 'stransType': this.paymentSearch.value.transactionType, 'stransStatus': this.paymentSearch.value.transactionStatus, 'sbusType': (this.paymentSearch.value.businessType != null) ? this.paymentSearch.value.businessType : '', 'payee': this.paymentSearch.value.payee, 'generatedDate': (this.paymentSearch.value.generationDate == '' || this.paymentSearch.value.generationDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.generationDate),
        'issueDate': (this.paymentSearch.value.issueDate == '' || this.paymentSearch.value.issueDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.issueDate), 'discipline': '', 'debitAmount': '', 'adminFee': '', 'transAmount': '', 'clearSeq': '', 'tranStatCd': '', 'cancelDate': '', 'processDate': '', 'transactionStartAmount': this.paymentSearch.value.transStartAmt,
        'transactionEndAmount': this.paymentSearch.value.transEndAmt, 'transStartDate': this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.transStartDate), 'transEndDate': this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.transEndDate), 'chequeRefNoStart': this.paymentSearch.value.chequeRefNoStart, 'chequeRefNoEnd': this.paymentSearch.value.chequeRefNoEnd, 'chequeRefNo': this.paymentSearch.value.chequeRefNo, 'paymentSumKey': this.paymentSearch.value.paymentSumKey, 'disciplineList': this.disciplineArr, 'providerCardId': cardId, 'clearDate': (this.paymentSearch.value.clearDate == '' || this.paymentSearch.value.clearDate == null) ? '' : this.changeDateFormatService.convertDateObjectToString(this.paymentSearch.value.clearDate),
        'paramApplication': paramApp
      }

    }
    var paymentSearchURL = FinanceApi.adjPaymentSearchReportUrl
    if (this.dataTableService.totalRecords > 500) {
      this.exDialog.openConfirm("It will take some time.Do you want to continue?").subscribe((value) => {
        if (value) {
          this.exportFile(paymentSearchURL, reqParam)
        }
      });
    } else {
      this.exportFile(paymentSearchURL, reqParam)
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
          a.download = "Payment-List" + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } 
    })
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

  ngAfterViewInit() {
    var self = this
        // Reissue Payment Icon functionality(19-Dec-2022)
    $(document).on('click', '#paymentSearchList .riPayment-ico', function () {
      let id = $(this).data('id')
      let discipline = $(this).data('discipline')
      let pdiscipline = $(this).data('pdiscipline')
      let payee = $(this).data('payee')
      let chequeRefNo = $(this).data('chequerefno')
      let transNo = $(this).data('paymentkey')
      let sbusType = $(this).data('sbustype')
      let transStatus = $(this).data('transstatus')
      let eftKey = $(this).data('eftkey')
      let transPayKey = $(this).data('transpaykey')
      let chequeNo = $(this).data('cheque')
      let issueDate = $(this).data('issuedate')
      self.transPayKey = transPayKey
      self.chequeNo = chequeNo,
      self.issueDate = issueDate
      self.pdiscipline = pdiscipline
      self.payeeType = payee
      self.chequeRefNoVal = chequeRefNo
      self.transNo = transNo
      self.sbusType = sbusType
      self.transStatusType = transStatus
      self.eftKey = eftKey
      if (transStatus == "Adjusted" || transStatus == "ADJUSTED") {
        self.toastrService.warning(self.translate.instant('Cheque Payment cannot be adjusted!'))
      } else if (self.transStatusType == "Issued" || self.transStatusType == "Cashed") {
        setTimeout(() => {
          if (!$(this).data("hasBeenClicked")) {
            $(this).data("hasBeenClicked", true)
            self.hmsDataService.OpenCloseModal('reIssuePaymentBtnHidden')
          }
        }, 500);
      } else {
        self.toastrService.error(self.translate.instant('Payment cannot be adjusted!'))
      }
      $(this).data("hasBeenClicked", false)
    })

    $(document).on('click', '#paymentSearchList .adjust-ico', function() {
      let id = $(this).data('id')
      let discipline = $(this).data('discipline')
      let pdiscipline = $(this).data('pdiscipline')
      let payee = $(this).data('payee')
      let chequeRefNo = $(this).data('chequerefno')
      let transNo = $(this).data('paymentkey')
      let sbusType = $(this).data('sbustype')
      let transStatus = $(this).data('transstatus')
      let eftKey = $(this).data('eftkey')
      let transPayKey = $(this).data('transpaykey')
      let chequeNo = $(this).data('cheque')
      let issueDate = $(this).data('issuedate')
      self.transPayKey = transPayKey
      self.chequeNo = chequeNo,
      self.issueDate = issueDate
      self.pdiscipline = pdiscipline
      self.payeeType = payee
      self.chequeRefNoVal = chequeRefNo
      self.transNo = transNo
      self.sbusType = sbusType
      self.transStatusType = transStatus
      self.eftKey = eftKey
      if (transStatus == "Adjusted" || transStatus == "ADJUSTED") {
        self.toastrService.warning(self.translate.instant('Cheque Payment cannot be adjusted!'))
      } else if (self.payeeType == "Broker" || self.payeeType == "Company") {
        self.toastrService.warning(self.translate.instant('Adjustment Payment cannot be adjusted!'))
      } else if (self.transStatusType == "Issued" || self.transStatusType == "Cashed") {
        setTimeout(() => {
          if (!$(this).data("adjHasBeenClicked")) {
            $(this).data("adjHasBeenClicked", true)
            self.hmsDataService.OpenCloseModal('adjtBtnHidden')
          }
        }, 500);
      } else {
        self.toastrService.error(self.translate.instant('Payment cannot be adjusted!'))
      }
      $(this).data("adjHasBeenClicked", false)
    })
  }

  onFileChanged(event) {
    this.addPaymentForm.value.documentName = ""
    this.selectedFile = event.target.files[0]
    let fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.error1 = { isError: true, errorMessage: 'File size shuold not greater than 2 Mb!' };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.error1 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.addPaymentForm.patchValue({ 'documentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only pdf file type are allowed.' };
      this.showRemoveBtn = true;
    } else {
      this.error = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }
  }

  removeExtension() {
    this.addPaymentForm.patchValue({ 'documentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }
  
  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  // Adjustments and Reissue button functionality(19-Dec-2022)
  openPaymentForm(type) {
    setTimeout(() => {
      switch (type) {
        case 'ADJ':
          this.btnType = 'ADJ'
          this.adjustmentBtn = true;
          this.reIssueBtn = false;
          this.paymentPopupHeading = 'Adjustments'
          this.showGridTable();
          break;
        case 'Reissue':
          this.showGridTable();
          this.btnType = 'Reissue'
          this.adjustmentBtn = false;
          this.reIssueBtn = true;
          this.paymentPopupHeading = 'Reissue Payment'
          break;
      }
    }, 1000);
    this.showGrid = false;
    this.addPaymentForm.reset();
    this.addPaymentForm.patchValue({
      'transactionDate': this.todayDate,
    })
    this.addPaymentForm.patchValue({
      'transactionDate': this.todayDate,
    })
  }

  submitPaymentForm(type) {
    if (this.addPaymentForm.valid) {
      if (this.error.isError == true || this.error1.isError == true) {       /* Selected File is not valid */
        return false;
      }
      if (this.addPaymentForm.value.documentName != "" && this.addPaymentForm.value.documentName != undefined && this.addPaymentForm.value.documentName != null) {
        this.selectedFile;
      } else {
        this.selectedFile = null
      }
      var formData = new FormData()
        let header = new Headers({ 'Authorization': this.currentUserService.token });
        let options = new RequestOptions({ headers: header });
        formData.append('pdiscipline', this.pdiscipline)
        formData.append('chequeRefNo', this.chequeRefNoVal);
        formData.append('transNo', '0');
        formData.append('cancelDate', this.changeDateFormatService.convertDateObjectToString(this.addPaymentForm.value.transactionDate));
        formData.append('comTxt', this.addPaymentForm.value.comment)
        formData.append('payee', this.payeeType)
        formData.append('sbusType', this.sbusType)
        if (this.selectedFile != null && this.selectedFile != undefined && this.selectedFile != "") {
          formData.append('file', this.selectedFile);
        }
        if (this.btnType == "Reissue") {
          formData.append('adjType', 'RP')
        } else {
          formData.append('adjType', 'ADJ')
        }
        if (this.payeeType == "Company") {
          formData.append('cheque', this.chequeNo)
        }
        if (this.payeeType == "Provider" || this.payeeType == "Cardholder" || this.payeeType == "Broker" || this.payeeType == "Company") {
          formData.append('providerCardId', this.providerCardNum)
        }
        // For Bank Cancel functionality(11-May-2022)
        var formDataCase = new FormData()
        formDataCase.append('pdiscipline', this.pdiscipline)
        formDataCase.append('chequeRefNo', this.chequeRefNoVal);
        formDataCase.append('transNo', '0');
        formDataCase.append('cancelDate', this.changeDateFormatService.convertDateObjectToString(this.addPaymentForm.value.transactionDate));
        formDataCase.append('comTxt', null)
        formDataCase.append('payee', this.payeeType)
        formDataCase.append('sbusType', this.sbusType)
        if (this.eftKey != null && this.eftKey != undefined && this.eftKey != "") {
          formData.append('eftKey', this.eftKey)
          formDataCase.append('eftKey', this.eftKey)
        } else {
          formData.append('eftKey', '0')
          formDataCase.append('eftKey', '0')
        }
        if (this.selectedFile != null && this.selectedFile != undefined && this.selectedFile != "") {
          formDataCase.append('file', this.selectedFile);
        }
        if (this.btnType == "Reissue") {
          formDataCase.append('adjType', 'RP')
        } else {
          formDataCase.append('adjType', 'ADJ')
        }
        if (this.payeeType == "Company") {
          formDataCase.append('cheque', this.chequeNo)
        }
        if (this.payeeType == "Provider" || this.payeeType == "Cardholder" || this.payeeType == "Broker" || this.payeeType == "Company") {
          formDataCase.append('providerCardId', this.providerCardNum)
        }
        let url = ''
        if (this.transStatusType == 'Issued') {
          if (type == "save") {
            var txt
            if(this.btnType == "Reissue"){
             txt =  "Reissue"
            }
            else{
             txt =  "Adjust"
            }
            this.exDialog.openConfirm(this.translate.instant('Are you sure you want to ' + txt + ' Payment?' )).subscribe((value) => {
                if (value) {
                  formData.append('transStatus','Issued')
                  formData.append('stransStatus','Issued')
                  this.savePaymentMethod(formData, type, this.btnType);
                }
              });
          } else {
            formData.append('transStatus','Issued')
            formData.append('stransStatus','Issued')
            this.savePaymentMethod(formData, type, '');
          }
        } else if (this.transStatusType == 'Cashed') {
            if (type == "save") {
              if (this.btnType == "Reissue") {
                this.exDialog.openConfirm(this.translate.instant('Has Banking Information been updated ? ')).subscribe((value) => {
                  if (value) {
                    formData.append('transStatus', 'Cashed')
                    formData.append('stransStatus', 'Cashed')
                    formData.append('eftAdjBankInd', 'T')
                    this.savePaymentMethod(formData, type, this.btnType);
                  } else {
                    formDataCase.append('transStatus', 'Cashed')
                    formDataCase.append('stransStatus', 'Cashed')
                    formDataCase.append('eftAdjBankInd', 'F')
                    this.savePaymentMethod(formDataCase, type, '', 'caseNo');
                  }
                });
              } else {
                formData.append('transStatus', 'Cashed')
                formData.append('stransStatus', 'Cashed')
                formData.append('eftAdjBankInd', 'T')
                this.savePaymentMethod(formData, type, this.btnType);
              }
            } else {
              formDataCase.append('transStatus', 'Cashed')
              formDataCase.append('stransStatus', 'Cashed')
              this.savePaymentMethod(formDataCase, type, '');
            }
        }
    } else {
      this.validateAllFormFields(this.addPaymentForm)
    }
  }

  savePaymentMethod(requestData, type, btnType, bankingConfirmation=null) {
    this.showLoader = true
    this.hmsDataService.sendFormData(FinanceApi.reissuePaymentTransUrl, requestData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showGrid = true;
        this.showLoader = false
        this.showRemoveBtn = false;
        if (type == "save") {
          if (btnType == 'Reissue') {
            this.toastrService.success(this.paymentPopupHeading +" "+ this.translate.instant('uft.toaster.savedSuccess'));
            if (this.payeeType == "Broker" || this.payeeType == "BROKER") {
              if (bankingConfirmation != 'caseNo') {
                this.getBrokerReissuePaymentService()
              }
            }
          } else {
            this.toastrService.success(this.translate.instant('uft.toaster.paymentAdjustedSuccess'))
          }
        }
        this.resetPaymentForm();
        this.addPaymentForm.patchValue({
          'transactionDate': this.todayDate,
        })
        this.removeExtension()
        setTimeout(() => {
        }, 500);
        //Start To show data tabel after click seacrh button  
        this.showGridTable()
        this.searchPayment(this.paymentSearch)
      } else if (data.code == 400 && data.status == "BAD_REQUEST") {
        this.showLoader = false
        if (type == "save") {
          this.toastrService.error(this.paymentPopupHeading +" "+ this.translate.instant('uft.toaster.notSaved'))
        }
      } else if (data.code == 400 && data.hmsMessage.messageShort == "RECORD_SAVE_FAILED") {
        this.showLoader = false
        if (type == "save") {
          this.toastrService.error(this.paymentPopupHeading +" "+ this.translate.instant('uft.toaster.notSaved'))
        }
      } else {
        this.showLoader = false
        if (type == "save") {
          this.toastrService.error(this.paymentPopupHeading +" "+ this.translate.instant('uft.toaster.notSaved'))
        }
      }
    });
  }

  getBrokerReissuePaymentService() {
    let request = {
      "transStatus": this.transStatusType,
      "chequeRefNo": this.chequeRefNoVal,
      "eftKey": this.eftKey,
      "transNo": 0
    }
  }

  showGridTable() {
    var reqParam = [
      { 'key': 'cheque', 'value': "" },
      { 'key': 'pdiscipline', 'value': "" },
      { 'key': 'transDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.todayDate) },
    ];
    let promise = new Promise((resolve, reject) => {
      this.showGrid = true;
      let tableId = "paymentReportGrid"
      if (!$.fn.dataTable.isDataTable('#paymentReportGrid')) {
        let tableActions = [];
        this.dataTableService.jqueryDataTable(tableId, FinanceApi.getReissuePaymentTransUrl, 'full_numbers', this.paymentGridColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [1,5], '', [2, 4], [3, 6])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, FinanceApi.getReissuePaymentTransUrl, reqParam)
      }
      resolve();
    });
    return promise;
  }

  resetPaymentForm() {
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.addPaymentForm.reset()
  }

  filterPaymentGridColumnSearch(tableId: string) {
    this.columnFilterSearch = true
    let dateParams = [1, 5];
    let reIssuePaymentParam = this.dataTableService.getFooterParams("paymentReportGrid")
    if (this.chequeNum != "" && this.chequeNum != undefined) {
      reIssuePaymentParam[0] = { key: 'cheque', value: this.chequeNum }
    } else {
      reIssuePaymentParam[0] = { key: 'cheque', value: "" }
    }
    reIssuePaymentParam[7] = { key: 'pdiscipline', value:  "" }
    reIssuePaymentParam[8] = { key: 'transDate', value: this.changeDateFormatService.convertDateObjectToString(this.todayDate)}
    this.dataTableService.jqueryDataTableReload("paymentReportGrid", FinanceApi.getReissuePaymentTransUrl, reIssuePaymentParam, dateParams)
  }

  resetPaymentGridColumnSearch(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.chequeNum = ""
    this.filterPaymentGridColumnSearch(tableId);
  }

  changeFilterDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      let validDate = this.changeDateFormatService.getToday();
      let ControlName = frmControlName;
      let datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      let obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  setValidationOnIssueFromDate() {
    if ((this.paymentSearch.value.issueToDate != null && this.paymentSearch.value.issueToDate != "") && (this.paymentSearch.value.issueDate == null || this.paymentSearch.value.issueDate == "")) {
      this.paymentSearch.controls['issueDate'].setValidators(Validators.required)
      this.paymentSearch.controls['issueDate'].updateValueAndValidity();
    }
    if ((this.paymentSearch.value.issueDate != '' && this.paymentSearch.value.issueDate != null) && (this.paymentSearch.value.issueToDate == '' || this.paymentSearch.value.issueToDate == null)) {
     this.paymentSearch.patchValue({
      'issueToDate' : this.todayDate
     }) 
    }
  }
  
}
