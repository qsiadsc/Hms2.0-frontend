import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CompleterService } from 'ng2-completer';
import { FinanceService } from '../finance.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { FinanceApi } from '../finance-api';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { Observable } from 'rxjs/Observable';
import { UftApi } from '../../unit-financial-transaction-module/uft-api';
import { RequestOptions, Headers } from '@angular/http';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})
export class PaymentDetailsComponent implements OnInit {

  paymentDetailsForm: FormGroup
  currentUser;
  addNameLabel: string;
  transactionDiscipline: any;
  paymentKey: any;
  disciplines
  payeecd
  paymentData: any
  paymentViewMode: boolean
  planKeyValue: any
  isBackToSearch: boolean = false
  backToSearchClicked: boolean = false
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  check: boolean = true
  observableObj;
  columns = [];
  addMode: boolean = false
  viewMode: boolean = false
  editMode: boolean = false
  addPaymentForm: FormGroup
  showGrid: boolean = false
  todayDate
  paymentGridColumns = []
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false
  error: any;
  error1: any;
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  selectedFile;
  adjustmentBtn: boolean = false
  reIssueBtn: boolean = false
  paymentPopupHeading
  dateNameArray = {};
  columnFilterSearch: boolean = false;
  showLoader: boolean = false
  chequeNum = ''
  transStatus = ""
  isFieldShow: boolean = false
  bussType = ""
  payee = ""
  pdiscipline
  payeeType
  chequeRefNo
  transNo
  sbusType
  transStatusType
  isRPIcon = false
  eftKey;
  isDisableBtn = true;
  transPayKey
  btnType
  isDisableAdjBtn = true
  cheque
  isTransStatusValid = true
  issueDate
  uniqueNum
  constructor(
    private dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private _router: Router,
    private routerAct: ActivatedRoute,
    private completerService: CompleterService,
    public currentUserService: CurrentUserService,
    public FinanceService: FinanceService,
    private hmsDataService: HmsDataServiceService
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
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
    this.paymentDetailsForm = new FormGroup({
      'discipline': new FormControl('', []),
      'transactionNo': new FormControl('', [Validators.required]),
      'generatedDate': new FormControl('', [Validators.required]),
      'issuedDate': new FormControl('', []),
      'transactionType': new FormControl('', [Validators.required]),
      'transactionStatus': new FormControl('', [Validators.required]),
      'transactionAmount': new FormControl('', [Validators.required]),
      'adminFee': new FormControl('', []),
      'debitAmount': new FormControl('', [Validators.required]),
      'payee': new FormControl('', [Validators.required]),
      'name': new FormControl('', Validators.required),
      'planType': new FormControl('', [Validators.required]),
      'clearDate': new FormControl(''),
      'chequeNo': new FormControl('', [Validators.required]),
      'eftFileNo': new FormControl('', []),
      'eftRecordNo': new FormControl('', [])
    })

    if (this.FinanceService.isBackCompanySearch) {
      this.isBackToSearch = this.FinanceService.isBackCompanySearch
    }
    else {
      this.isBackToSearch = false
    }

    this.route.queryParams.subscribe((params: Params) => {
      if (params['paymentKey'] || params['discipline'] || params['issueDate']) {
        this.transactionDiscipline = params['discipline'];
        this.paymentKey = params['paymentKey'];
        let payee = params['payee']
        let transStatus = params['transStatus']
        let issueDate = params['issueDate']
        let uniqueNum = params['uniqueNum']
        this.uniqueNum = uniqueNum
        this.viewTransactionDetails(this.transactionDiscipline, this.paymentKey, payee, transStatus, issueDate, uniqueNum);
        this.dataTableIntailize(this.transactionDiscipline, this.paymentKey, payee, transStatus, issueDate, uniqueNum)
      } else {
        let transactionDiscipline = params['disc']
        let paymentKey = params['dcp']
        let payee = params['payee']
        let transStatus = params['transStatus']
        let issueDate = params['issueDate']
        let uniqueNum = params['uniqueNum']
        this.uniqueNum = uniqueNum
        this.viewTransactionDetails(transactionDiscipline, paymentKey, payee, transStatus, issueDate, uniqueNum);
        this.dataTableIntailize(transactionDiscipline, paymentKey, payee, transStatus, issueDate, uniqueNum)
      }
    });

    this.addPaymentForm = new FormGroup({
      'transactionDate': new FormControl('', [Validators.required]),
      'transactionAmt': new FormControl(''),
      'transactionDesc': new FormControl(''),
      'comment': new FormControl(''),
      'documentName': new FormControl('', [])
    })
    this.todayDate = this.changeDateFormatService.getToday();
  }

  // Log #1137:: View Icon functionality
  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#claimsAttachedToPaymentList .view-ico', function () {
      let id = $(this).data('id')
      let discipline = $(this).data('discipline')
      let pdiscipline = $(this).data('pdiscipline')
      let payee = $(this).data('payee')
      let paramPass = {
        'transNo': id,
        'pdiscipline': pdiscipline
      }
      if (payee == "Company" || payee == "Broker") {
        self.toastrService.warning("No Transaction Available!!")
      } else {
        window.open('/finance/transaction-search?transNo=' + id + '&discCd=' + pdiscipline + '&discp=' + discipline, '_blank')
      }
    })

    $(document).on('click', '#claimsAttachedToPaymentList .adjust-ico', function() {
      let chequeRefNo = $(this).data('chequerefno')
      let transNo = $(this).data('paymentkey')
      let sbusType = $(this).data('sbustype')
      self.toastrService.warning("This functionality has to be implemented!")
    })

    $(document).on('click', '#claimsAttachedToPaymentList tbody td', function () {
      if (self.dataTableService.selectedRowReissuePaymentData != undefined && self.dataTableService.selectedRowReissuePaymentData != null) {
        self.isDisableBtn = false
        self.pdiscipline = self.dataTableService.selectedRowReissuePaymentData.pdiscipline
        self.payeeType = self.dataTableService.selectedRowReissuePaymentData.payee
        self.chequeRefNo = self.dataTableService.selectedRowReissuePaymentData.chequeRefNo
        self.transNo = self.dataTableService.selectedRowReissuePaymentData.paymentKey
        self.sbusType = self.dataTableService.selectedRowReissuePaymentData.sbusType
        self.transStatusType = self.dataTableService.selectedRowReissuePaymentData.transStatus
        self.eftKey = self.dataTableService.selectedRowReissuePaymentData.eftKey
        self.transPayKey = self.dataTableService.selectedRowReissuePaymentData.transPayKey
        self.cheque = self.dataTableService.selectedRowReissuePaymentData.cheque,
        self.issueDate = self.dataTableService.selectedRowReissuePaymentData.issueDate
        if (self.payeeType == "Broker" || self.payeeType == "Company") {
          self.isDisableAdjBtn = true
        } else {
          self.isDisableAdjBtn = false
        }
        if (self.transStatusType == "Issued" || self.transStatusType == "Cashed") {
          self.isTransStatusValid = false
        } else {
          self.isTransStatusValid = true
        }
        if (!$(this).find('td.dataTables_empty').length) {
          var indexCell = $(this).index()
          if ($(this).index() == 17) {
          } else {
          }
        }
      }
    })
  }

  // Methos for Upper Form Datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.paymentDetailsForm.patchValue(datePickerValue);
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
      this.paymentDetailsForm.patchValue(datePickerValue);
      this.addPaymentForm.patchValue(datePickerValue)
    }
  }

  viewTransactionDetails(transactionDiscipline, paymentKey, payee, transStatus, issueDate, uniqueNum) {
    this.paymentViewMode = true;
    this.paymentDetailsForm.disable();
    let paymentJson = {
      "cheque": paymentKey,
      "pdiscipline": transactionDiscipline,
      "payeTypeDesc": payee,
      "transStatus": transStatus,
      "issueDate": (issueDate != null && issueDate != undefined) ? issueDate : "",
      "providerCardId": (uniqueNum != null && uniqueNum != undefined) ? uniqueNum : "",
      "payee": payee
    }
    // To get field label to next of payee field
    if (payee == "Cardholder") {
      this.addNameLabel = "Name"
      this.isFieldShow = false
    } else if (payee == "Provider") {
      this.addNameLabel = "Address"
      this.isFieldShow = false
    } else if (payee == "Company") {
      this.addNameLabel = "Name"
      this.isFieldShow = true
    } else if (payee == "Broker") {
      this.addNameLabel = "Name"
      this.isFieldShow = true
    } else {
      this.addNameLabel = "Other Payee Name"
      this.isFieldShow = false
    }
    this.paymentData = this.routerAct.params.subscribe(params => {
      var URL = FinanceApi.getAdvanceAdjPaymentDetailUrl
      this.hmsDataService.post(URL, paymentJson).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.disciplines = data.result.discipline;
          this.payeecd = data.result.payeeTypeCd;
          if (data.result.payeTypeDesc == "Cardholder") {
            this.addNameLabel = "Name"
          } else if (data.result.payeTypeDesc == "Provider") {
            this.addNameLabel = "Address"
          } else if (data.result.payeTypeDesc == "Company") {
            this.addNameLabel = "Name"
          } else if (data.result.payeTypeDesc == "Broker") {
            this.addNameLabel = "Name"
          } else {
            this.addNameLabel = "Other Payee Name"
          }
          this.planKeyValue = data.result.sbusType;
          this.transStatus = data.result.transStatus
          this.bussType = data.result.sbusType
          this.payee = data.result.payeTypeDesc
          this.paymentDetailsForm.patchValue({
            'discipline': data.result.discipline,
            'transactionNo': data.result.paymentKey,
            'generatedDate': this.changeDateFormatService.convertStringDateToObject(data.result.generatedDate),
            'issuedDate': this.changeDateFormatService.convertStringDateToObject(data.result.issueDate),
            'transactionType': data.result.transType,
            'transactionStatus': data.result.transStatus,
            'transactionAmount': data.result.transAmount,
            'adminFee': data.result.adminFee,
            'debitAmount': data.result.debitAmount,
            'payee': data.result.payeTypeDesc,
            'name': data.result.fullName,
            'planType': data.result.sbusType,
            'clearDate': this.changeDateFormatService.convertStringDateToObject(data.result.clearDate),
            'chequeNo': data.result.cheque,
            'eftFileNo': data.result.eftfileNo,
            'eftRecordNo': data.result.eftrecNo
          })
        }
      });
    });
  }

  backToSearch() {
    this.backToSearchClicked = true
    this._router.navigate(['/finance/payment-search']);
  }

  ngOnDestroy() {
    if (this.backToSearchClicked) {
      this.FinanceService.isBackCompanySearch = true
    } else {
      this.FinanceService.isBackCompanySearch = false
      this.FinanceService.searchedCompanyName = ''
      this.FinanceService.searchedCompanyId = ''
    }
  }

  dataTableIntailize(transactionDiscipline, paymentKey, payee, transStatus, issueDate, uniqueNum) {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('finance.transactionDetails.discipline') == 'finance.transactionDetails.discipline') {
        } else {
          this.columns = [
            { title: this.translate.instant('finance.transactionSearch.discipline'), data: 'discipline' },
            { title: this.translate.instant('finance.transactionSearch.transNo'), data: 'paymentKey' },
            { title: this.translate.instant('finance.transactionSearch.issuedDate'), data: 'issueDate' },
            { title: this.translate.instant('Payment No.'), data: 'chequeRefNo' },
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
            { title: this.translate.instant('finance.paymentSearch.totalPaid'), data: 'transAmount' },
            { title: this.translate.instant('finance.paymentSearch.netPayableAmount'), data: 'netPayableAmount'},
            { title: this.translate.instant('finance.transactionSearch.action'), data: 'paymentKey' }
          ]

          this.paymentGridColumns = [
            { title: this.translate.instant('Payment Number'), data: 'cheque'}, 
            { title: this.translate.instant('Issued Date'), data: 'issueDate' },
            { title: this.translate.instant('uft.uftSearch.transAmount'), data: 'transAmount' },
            { title: this.translate.instant('Admin Fee'), data: 'adminFee' },
            { title: this.translate.instant('Debit Amount'), data: 'debitAmount' },
            { title: this.translate.instant('Adjustment Date'), data: 'adjustmentDate' },
            { title: this.translate.instant('Transaction Status'), data: 'transStatus' }
          ]
          setTimeout(() => {
            this.getclaimsAttachedToTransactionList(transactionDiscipline, paymentKey, payee, transStatus, issueDate, uniqueNum)
          }, 1000);
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
  }

  // Method for Get the claims Attached Payment List in Grid(04-Oct-2021)
  getclaimsAttachedToTransactionList(pdiscipline, paymentKey, payee, transStatus, issueDate, uniqueNum) {
    let chequeClaim = [
      { 'key': 'pdiscipline', 'value': pdiscipline },
      { 'key': 'chequeRefNo', 'value': paymentKey },
      { 'key': 'payee', 'value': payee },
      { 'key': 'stransStatus', 'value': transStatus },
      { 'key': 'issueDate', 'value': (issueDate != null && issueDate != "" ? issueDate : "") },
      { 'key': 'providerCardId', 'value': (uniqueNum != null && uniqueNum != undefined) ? uniqueNum : "" }
    ];
    var Url = FinanceApi.getAdvAdjPaymentSearchDetailUrl
    var tableId = "claimsAttachedToPaymentList"
    var tableAction = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
    ]
    if (!$.fn.dataTable.isDataTable('#claimsAttachedToPaymentList')) {
      this.dataTableService.jqueryDataTableclaimsAttachedToTransaction(tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', '', [0, 'asc'], '', chequeClaim, tableAction, 17, [2, 7, 10, 13], '', [5,6,15,16], [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, chequeClaim)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  // Adjustments and Reissue button functionality(15-Feb-2022)
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
          let requestData = {
            "pdiscipline": this.transactionDiscipline,
            "chequeRefNo": this.paymentKey,
            "transNo": this.paymentKey,
            "cancelDate": this.changeDateFormatService.convertDateObjectToString(this.todayDate)
          }
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
    this.enableAddMode()
    this.addPaymentForm.patchValue({
      'transactionDate': this.todayDate,
    })
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

  enableAddMode() {
    this.addPaymentForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
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

  resetPaymentForm() {
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.addPaymentForm.reset()
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

  focusNextEle(event, id) {
    $('#' + id).focus();
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
        formData.append('chequeRefNo', this.chequeRefNo);
        formData.append('transNo', this.transNo);
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
          formData.append('cheque', this.cheque)
        }
        // For Bank Cancel functionality(11-May-2022)
        var formDataCase = new FormData()
        formDataCase.append('pdiscipline', this.pdiscipline)
        formDataCase.append('chequeRefNo', this.chequeRefNo);
        formDataCase.append('transNo', this.transNo);
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
          formDataCase.append('cheque', this.cheque)
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
                  this.savePaymentMethod(formData, type, this.btnType);
                }
              });
          } else {
            formData.append('transStatus','Issued')
            this.savePaymentMethod(formData, type, '');
          }
        } else if (this.transStatusType == 'Cashed') {
            if (type == "save") {
              if (this.btnType == "Reissue") {
                this.exDialog.openConfirm(this.translate.instant('Has Banking Information been updated ? ')).subscribe((value) => {
                  if (value) {
                    formData.append('transStatus', 'Cashed')
                    formData.append('eftAdjBankInd', 'T')
                    this.savePaymentMethod(formData, type, this.btnType);
                  } else {
                    formDataCase.append('transStatus', 'Cashed')
                    formDataCase.append('eftAdjBankInd', 'F')
                    this.savePaymentMethod(formDataCase, type, '', 'caseNo');
                  }
                });
              } else {
                formData.append('transStatus', 'Cashed')
                formData.append('eftAdjBankInd', 'T')
                this.savePaymentMethod(formData, type, this.btnType);
              }
            } else {
              formDataCase.append('transStatus', 'Cashed')
              this.savePaymentMethod(formDataCase, type, '');
            }
        }
    } else {
      this.validateAllFormFields(this.addPaymentForm)
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
        this.getclaimsAttachedToTransactionList(this.pdiscipline, this.chequeRefNo, this.payeeType, this.transStatusType, this.issueDate, this.uniqueNum)
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

  adjProcess(transNo, bussType) {
      this.exDialog.openConfirm(this.translate.instant('uft.toaster.aboutToCancelEFTPaymentForTrans') + transNo + ' . ' + this.translate.instant('uft.toaster.ok')).subscribe((value) => {
      if (value) {
        this.showLoader = true;
        var url = ''
        var paramData = {
          "paymentKey": transNo,
          "canceled": "T",
          "issued": "F"
        }
        this.hmsDataService.postApi(url, paramData).subscribe(data => {
          this.showLoader = false
          if (data.code == 200 && data.status == 'OK' && data.hmsMessage.messageShort == "CHEQUE_CANCELLED_SUCCESSFULLY") {
            this.toastrService.success(this.translate.instant('uft.toaster.chequeCancelledSuccess'));
          } else {
            this.toastrService.error(data.hmsMessage.messageShort);
          }
        });
      }
    })
  }

  getReverseReissuePaymentService() {
    let request = {
      'sbusType': this.sbusType,
      'reissueInd': 'T',
      'transPayKey': this.transPayKey
    }
  }

  // Show Payment Method on basis of Transaction Status(10-Aug-2022)
  showPaymentStatus(type) {
    switch (type) {
      case 'Reissue':
        if (this.transStatusType == "Adjusted" || this.transStatusType == "ADJUSTED") {
          this.toastrService.warning(this.translate.instant('Cheque Payment cannot be adjusted!'))
        } else {
          this.hmsDataService.OpenCloseModal('reIssuePaymentBtnHidden')
        }
      break
      case 'ADJ':
        if (this.transStatusType == "Adjusted" || this.transStatusType == "ADJUSTED") {
          this.toastrService.warning(this.translate.instant('Cheque Payment cannot be adjusted!'))
        } else {
          this.hmsDataService.OpenCloseModal('adjtBtnHidden')
        }
      break
    }
  }

  // brokerReissuePayment API integration in case of payeeType Broker(20-Sep-2022)
  getBrokerReissuePaymentService() {
    let request = {
      "transStatus": this.transStatusType,
      "chequeRefNo": this.chequeRefNo,
      "eftKey": this.eftKey,
      "transNo": this.transNo
    }
  }

}
