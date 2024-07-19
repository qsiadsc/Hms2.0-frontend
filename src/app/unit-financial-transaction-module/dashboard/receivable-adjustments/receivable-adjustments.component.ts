import { Component, OnInit, ViewChild } from '@angular/core';
import { UftApi } from '../../uft-api';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { Constants } from '../../../common-module/Constants';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { UftFinancepaybleComponent } from '../uft-financepayble/uft-financepayble.component';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { RequestOptions, Headers } from '@angular/http';

@Component({
  selector: 'app-receivable-adjustments',
  templateUrl: './receivable-adjustments.component.html',
  styleUrls: ['./receivable-adjustments.component.css']
})
export class ReceivableAdjustmentsComponent implements OnInit {

  observableNegativeTransaction
  negativeTransactionColumns = []
  receiptListColumns = []
  isNegativeTransactionSearch: boolean = false
  adjRequestForm: FormGroup;
  cashAdjForm: FormGroup;
  observableCashAdjObj;
  cashAdjColumns = []
  resultValue: any;
  confirmBtnEnable: boolean = true;
  showList: boolean = false;
  payeeNameCAL: any;
  cdCAL: any;
  transAmtCAL: any;
  payeeNoCAL: any;
  claimNumberCAL: any;
  claimKeyCAL: any;
  payeeCAL: any;
  tableListA = []
  tableListB = []
  showLoader: boolean = false
  receiptListSelected: any = [] 
  negativeListSelected: any = []
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  isReceiptsSearch : boolean = false
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false
  error: any;
  error1: any;
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  selectedFile;
  planType;
  receiptTransList = []
  negativeTransList = []
  constructor(private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private toastrService: ToastrService,
    private hmsDataService: HmsDataServiceService,
    // private uftFinancepaybleComponent: UftFinancepaybleComponent,
    private exDialog: ExDialog,
    public currentUserService: CurrentUserService) {
      this.error = { isError: false, errorMessage: '' };
      this.error1 = { isError: false, errorMessage: '' };
    }

  ngOnInit() {
    this.dataTableInitializeNegativeTransactionList()
    let self = this
    $(document).on('click', 'table#cashAdjList tbody tr', function () {
      if (!$(this).find('td.dataTables_empty').length) {
        self.confirmBtnEnable = false
        self.payeeNameCAL = self.dataTableService.CALpayeeName
        self.claimKeyCAL = self.dataTableService.CALclaimKey
        self.claimNumberCAL = self.dataTableService.CALclaimNumber
        self.transAmtCAL = self.dataTableService.CALtransAmt
        self.payeeNoCAL = self.dataTableService.CALpayeeNo
        self.payeeCAL = self.dataTableService.CALpayee
      }
    })

    this.adjRequestForm = new FormGroup({
      payee: new FormControl('', [Validators.required]),
      claimNum: new FormControl('', [Validators.required]),
      adjRequestComment: new FormControl('', Validators.maxLength(1000)),
      adjRequestDocumentName: new FormControl('')
    })
    this.cashAdjForm = new FormGroup({
      payee: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      claimNum: new FormControl(''),
      cashAdjComment: new FormControl('', Validators.maxLength(1000)),
      cashAdjDocumentName: new FormControl('')
    })
  }

  // To get checkBox functionality of Receivable List(05-Aug-2022)
  ngAfterViewInit() {
    var self = this
    $(document).on('click', '#receiptsList .receiptsListCheck', function (event) {
      self.showLoader = true
      var rowData = $(this).data('val');
      if ($(this).prop("checked") == true) {
        if (rowData.claimKey != '') {
          self.receiptListSelected.push(rowData)
          self.checkSelectedAll();
        }
      } else if ($(this).prop("checked") == false) {
        if (rowData.claimKey != '') {
          let checkKey = rowData.paymentSumKey;
          let index = self.receiptListSelected.findIndex(x => x.claimKey == rowData.claimKey)
          if (index != -1) {
            self.receiptListSelected.splice(index, 1)
          }
          self.unChecked();
        }
      }
      self.showLoader = false
    });

    $(document).on('click', '.selectReceiptAll', function (event) {
      self.showLoader = true
      let checked = $(this).prop('checked');
      $('#receiptsList .receiptsListCheck').each(function (i) {
        if (checked) {
          self.Checked();
          if (!$(this).prop('checked')) {
            $(this).trigger('click');
          }
        } else {
          self.unChecked();
          if ($(this).prop('checked')) {
            $(this).trigger('click');
          }
        }
        self.showLoader = false
      });
      self.showLoader = false
    })

    $(document).on('change', 'select', function () {
      let name = $(this).attr('name');
      if (name == 'receiptsList_length') {
        checkall()
      }
      self.showLoader = false
    });

    function checkall() {
      if ($('.selectReceiptAll').prop("checked")) {
        setTimeout(() => {
          $('#receiptsList .receiptsListCheck').each(function (i) {
            $(this).trigger('click');
          });
        }, 1000);
      }
    }

    // Negative Transaction List Table functionality
    $(document).on('click', '#negativeTransactionList .negativeListCheck', function (event) {
      self.showLoader = true
      var rowNegData = $(this).data('val');
      if ($(this).prop("checked") == true) {
        if (rowNegData.payableTransactionKey != '') {
          self.negativeListSelected.push(rowNegData)
          self.checkSelectedAllNegTrans();
        }
      } else if ($(this).prop("checked") == false) {
        if (rowNegData.payableTransactionKey != '') {
          let index = self.negativeListSelected.findIndex(x => x.payableTransactionKey == rowNegData.payableTransactionKey)
          if (index != -1) {
            self.negativeListSelected.splice(index, 1)
          }
          self.unCheckedNegTrans();
        }
      }
      self.showLoader = false
    });

    $(document).on('click', '.selectNegativeAll', function (event) {
      self.showLoader = true
      let checked = $(this).prop('checked');
      $('#negativeTransactionList .negativeListCheck').each(function (i) {
        if (checked) {
          self.checkedNegTrans();
          if (!$(this).prop('checked')) {
            $(this).trigger('click');
          }
        } else {
          self.unCheckedNegTrans();
          if ($(this).prop('checked')) {
            $(this).trigger('click');
          }
        }
        self.showLoader = false
      });
      self.showLoader = false
    })

    $(document).on('change', 'select', function () {
      let name = $(this).attr('name');
      if (name == 'negativeTransactionList_length') {
        checkAllNegativeList()
      }
      self.showLoader = false
    });

    function checkAllNegativeList() {
      if ($('.selectNegativeAll').prop("checked")) {
        setTimeout(() => {
          $('#negativeTransactionList .negativeListCheck').each(function (i) {
            $(this).trigger('click');
          });
        }, 1000);
      }
    }
  }

  dataTableInitializeNegativeTransactionList() {
    this.observableNegativeTransaction = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.negativeTransactionColumns = [
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.select'), data: 'payeeNumber' },
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.payeeNumber'), data: 'payeeNumber' },
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.payeeName'), data: 'payeeName' },
          // { title: this.translate.instant('uft.dashboard.receivableAdjustments.claimNo'), data: 'referenceCd' },
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.amount'), data: 'transactionAmount' },
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.transactionNumber'), data: 'transNumber'}
        ]
        this.receiptListColumns = [
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.select'), data: 'payNo' },
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.payeeNumber'), data: 'payNo' },
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.payeeName'), data: 'payeeName' },
          // { title: this.translate.instant('uft.dashboard.receivableAdjustments.claimNo'), data: 'claimNumber' },
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.amount'), data: 'transAmt' },
          { title: this.translate.instant('uft.dashboard.receivableAdjustments.transactionNumber'), data: 'transNumber'}
        ]
        this.getNegativeTransactionList(this.planType)
        this.getReceiptsList(this.planType)
        this.observableNegativeTransaction.unsubscribe();
      }
    });
  }

  getNegativeTransactionList(planType) {
    let todaydate = this.changeDateFormatService.getToday();
    // coKey,coId,coName,gracePeriod,endOfGracePeriod,pendingFund,companyBalance,availFund
    let bussType = ''
    if (planType == 'Q' || planType == undefined) {
      bussType = "Q"
    } else {
      bussType = "S"
    }
    let negativeTransactionRequest = [
      { 'key': 'payeeNumber', 'value': '' },
      { 'key': 'payeeName', 'value': '' },
      { 'key': 'referenceCd', 'value': '' },
      { 'key': 'transactionAmount', 'value': '' },
      { 'key': 'transNumber', 'value': '' },
      { 'key': 'businessTypeCd', 'value': bussType }
    ]
    let tableActions = []
    this.negativeListSelected = []
    this.tableListB = []
    this.negativeTransList = []
    let url = UftApi.negativeTransactionsUrl
    let tableId = "negativeTransactionList"
    if (!$.fn.dataTable.isDataTable('#negativeTransactionList')) {
      // this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.negativeTransactionColumns, 5, true, true, 'lt', 'irp', undefined, [1, 'asc'], '', negativeTransactionRequest, tableActions, [0], [], '', [4], [1, 2, 3, 5])
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.negativeTransactionColumns, 5, true, true, 'lt', 'irp', undefined, [1, 'asc'], '', negativeTransactionRequest, tableActions, [0], [], '', [3], [1, 2, 4])
    } else {
      $('.scroll-negativeTransactionList').scrollTop(0);
      if (this.isNegativeTransactionSearch) {
        this.searchNegativeTransactionList()
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, negativeTransactionRequest)
      }
    }
    return false;
  }

  /* Negative Transcations Search functionality by */
  searchNegativeTransactionList(tableId = null) {
    $('.selectNegativeAll').prop("checked", false)
    this.isNegativeTransactionSearch = true
    let negativeTransactionsListUrl = UftApi.negativeTransactionsUrl;
    let negativeTransactionParam = this.dataTableService.getFooterParams("negativeTransactionList")
    $('.scroll-negativeTransactionList').scrollTop(0);
    this.dataTableService.jqueryDataTableReload("negativeTransactionList", negativeTransactionsListUrl, negativeTransactionParam)
  }

  /* Negative Transactions Reset functionality by */
  resetNegativeTransactionList(tableId) {
    this.dataTableService.resetTableSearch();
    this.searchNegativeTransactionList();
    this.isNegativeTransactionSearch = false
    this.negativeListSelected = []
    $('.selectNegativeAll').prop("checked", false)
  }

  getReceiptsList(planType) {
    let todaydate = this.changeDateFormatService.getToday();
    // coKey,coId,coName,gracePeriod,endOfGracePeriod,pendingFund,companyBalance,availFund
    // payNo, payeeName, claimNumber, transAmt
    let bussType = ''
    if (planType == 'Q' || planType == undefined) {
      bussType = "Q"
    } else {
      bussType = "S"
    }
    let receiptsRequest = [
      { 'key': 'payNo', 'value': '' },
      { 'key': 'payeeName', 'value': '' },
      { 'key': 'claimNumber', 'value': '' },
      { 'key': 'transAmt', 'value': '' },
      { 'key': 'transNumber', 'value': '' },
      { 'key': 'businessTypeCd', 'value': bussType }
    ]
    let tableActions = []
    this.receiptListSelected = []
    this.tableListA = []
    this.receiptTransList = []
    let url = UftApi.getAdjReceiptUrl
    let tableId = "receiptsList"
    if (!$.fn.dataTable.isDataTable('#receiptsList')) {
      // this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.receiptListColumns, 5, true, true, 'lt', 'irp', undefined, [1, 'asc'], '', receiptsRequest, tableActions, [0], [], '', [4], [1, 2, 3, 5])
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.receiptListColumns, 5, true, true, 'lt', 'irp', undefined, [1, 'asc'], '', receiptsRequest, tableActions, [0], [], '', [3], [1, 2, 4])
    } else {
      $('.scroll-receiptsList').scrollTop(0);
      if (this.isReceiptsSearch) {
        this.searchReceiptsList()
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, receiptsRequest)
      }
    }
    return false;
  }

  /* Receipts Search functionality by */
  searchReceiptsList(tableId = null) {
    $('.selectReceiptAll').prop("checked", false)
    this.isReceiptsSearch = true
    let receiptsListUrl = UftApi.getAdjReceiptUrl;
    let receiptsListParam = this.dataTableService.getFooterParams("receiptsList")
    $('.scroll-receiptsList').scrollTop(0);
    this.dataTableService.jqueryDataTableReload("receiptsList", receiptsListUrl, receiptsListParam)
  }

  /* Receipts Reset functionality by */
  resetReceiptsList(tableId) {
    this.dataTableService.resetTableSearch();
    this.searchReceiptsList();
    this.isReceiptsSearch = false
    this.receiptListSelected = []
    $('.selectReceiptAll').prop("checked", false)
  }

  submitClearance() {
    if (this.receiptListSelected.length == 0 && this.negativeListSelected.length == 0 ) {
      this.toastrService.error("Please select at least one record from Receipts or Negative Transactions")
      return
    }
    let receiptArray = []
    let receiptTransArray = []
    if (this.receiptListSelected.length > 0) {
      for (let i = 0; i < this.receiptListSelected.length; i++) {
        receiptArray.push(this.receiptListSelected[i].payNo)
        receiptTransArray.push(this.receiptListSelected[i].transNumber)
      }
      this.tableListA = receiptArray
      this.receiptTransList = receiptTransArray
    } else {
    }
    let negativeArray = []
    let negativeTransArray = []
    if (this.negativeListSelected.length > 0) {
      for (let j = 0; j < this.negativeListSelected.length; j++) {
        negativeArray.push(this.negativeListSelected[j].payeeNumber)
        negativeTransArray.push(this.negativeListSelected[j].transNumber)
      }
      this.tableListB = negativeArray
      this.negativeTransList = negativeTransArray
    } else {
    }
    let request = {
      'ppayNoTblA': this.tableListA,
      'ppayNoTblB': this.tableListB,
      'ttransNoTblA': this.receiptTransList,
      'ttransNoTblB': this.negativeTransList
    }
    this.hmsDataService.postApi(UftApi.compareReceivableListUrl, request).subscribe(data => {
      this.getReceiptsList(this.planType)
      this.getNegativeTransactionList(this.planType)
      // this.uftFinancepaybleComponent.getBrokersList()
    })
    // clear button to reset checkbox and input fields.
    $('.selectNegativeAll').prop("checked", false)
    $('.selectReceiptAll').prop("checked", false)
     this.dataTableService.resetTableSearch();
  }

  dataTableInitializeCashAdjList() {
    this.observableCashAdjObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
         this.cashAdjColumns = [
           { title: this.translate.instant('uft.dashboard.cashAdjPopup.payeeNameNumber'), data: 'payee' },
           { title: this.translate.instant('uft.dashboard.receivableAdjustments.claimNo'), data: 'claimNumber' },
           { title: this.translate.instant('uft.dashboard.receivableAdjustments.amount'), data: 'claimAmt' }
           ]
        this.getCashAdjList()
        this.observableCashAdjObj.unsubscribe();
      }
    });
  }

  getCashAdjList() {
  let reqParam = [
      { 'key': 'payee', 'value': this.cashAdjForm.value.payee },
      { 'key': 'claimNumber', 'value': this.cashAdjForm.value.claimNum },
      { 'key': 'claimAmt', 'value': this.cashAdjForm.value.amount }
    ]
    let tableActions = []
    let url = UftApi.getAllAdjClaimData
    let tableId = "cashAdjList"
    if (!$.fn.dataTable.isDataTable('#cashAdjList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.cashAdjColumns, 5, true, true, 'lt', 'irp', undefined, [1, 'asc'], '', reqParam, tableActions, [], [], '', [], [])
    } 
       else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
    return false;
    }

    clearCashAdjForm(){
      this.selectedFile = ""
      this.allowedValue = false
      this.fileSizeExceeds = false
      this.error = { isError: false, errorMessage: '' };
      this.error1 = { isError: false, errorMessage: '' };
      this.cashAdjForm.reset();
      this.showList = false;            // Reference from #1299 Listing and Fields now gets disappeared when click on clear button
    }

  onSubmitadjReqForm(){
    if (this.adjRequestForm.valid) {
      let promise = new Promise((resolve, reject) => {
        var formData = new FormData()
        let header = new Headers({ 'Authorization': this.currentUserService.token });
        let options = new RequestOptions({ headers: header });
        formData.append('claimNumber', this.adjRequestForm.value.claimNum);
        formData.append('payee', this.adjRequestForm.value.payee)
        formData.append('comText', this.adjRequestForm.value.adjRequestComment)
        if (this.selectedFile != null && this.selectedFile != undefined && this.selectedFile != "") {
          formData.append('file', this.selectedFile);
        }
        this.hmsDataService.sendFormData(UftApi.generateAdjRequestUrl, formData).subscribe(data => {  
          if (data.code == 200 && data.status == "OK") {
            this.resultValue = data.result
            this.toastrService.success('Record Saved Successfully!');
            this.adjRequestForm.reset();
            resolve();
          } 
          else {
           this.toastrService.error('Record Cannot Be Saved');
            resolve();
          }
        });
      });
      return promise;
    } else {
      this.validateAllFormFields(this.adjRequestForm)
    }
  }

  closeAdjPopup()
  {
    this.adjRequestForm.patchValue({ 'adjRequestDocumentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
   this.adjRequestForm.reset();
  }

  closeCashAdjPopup(){
    this.cashAdjForm.patchValue({ 'cashAdjDocumentName': '' });
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.cashAdjForm.reset();
    this.showList = false;
    this.confirmBtnEnable = true
  }

  saveCashAdjData(){
    this.confirmBtnEnable = true
    if (this.cashAdjForm.valid) {
       this.showList = true
       this.dataTableInitializeCashAdjList()
    }else {
      this.validateAllFormFields(this.cashAdjForm)
    }
  }

  cashAdjSubmit(){
    let promise = new Promise((resolve, reject) => {
        var formData = new FormData()
        let header = new Headers({ 'Authorization': this.currentUserService.token });
        let options = new RequestOptions({ headers: header });
        formData.append('payNo', this.payeeNoCAL)
        formData.append('payeeName', this.payeeNameCAL);
        formData.append('claimAmt', this.cashAdjForm.value.amount);
        formData.append('claimNumber', this.claimNumberCAL);
        formData.append('claimKey', this.claimKeyCAL)
        formData.append('payee', this.payeeCAL)
        formData.append('comText', this.cashAdjForm.value.cashAdjComment)
        if (this.selectedFile != null && this.selectedFile != undefined && this.selectedFile != "") {
          formData.append('file', this.selectedFile);
        }
        this.hmsDataService.sendFormData(UftApi.generateCashAdjRequestUrl, formData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.toastrService.success('Record Saved Successfully!');
          this.dataTableInitializeCashAdjList()
          this.confirmBtnEnable = true
          resolve();
        } 
        else {
          this.toastrService.error('Record Cannot Be Saved');
          this.confirmBtnEnable = true
          resolve();
        }
      });
    });
    return promise;
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

    // Checkbox select all functionality here
    checkSelectedAll() {
      this.showLoader = true;
      let cheked = true;
      let self = this;
      $('#receiptsList .receiptsListCheck').each(function (i) {
        if (!$(this).prop('checked')) {
          cheked = false;
        }
      });
      if (cheked) {
        if (!$('.selectReceiptAll').prop('checked')) {
          $('.selectReceiptAll').prop("checked", true);
          self.Checked()
        }
      }
      this.showLoader = false;
    }
  
    unChecked() {
      if ($('.selectReceiptAll').prop('checked')) {
        $('.selectReceiptAll').prop("checked", false);
      }
    }
  
    Checked() {
    }

    // Checkbox select all functionality for Negative Transaction List
    checkSelectedAllNegTrans() {
      this.showLoader = true;
      let cheked = true;
      let self = this;
      $('#negativeTransactionList .negativeListCheck').each(function (i) {
        if (!$(this).prop('checked')) {
          cheked = false;
        }
      });
      if (cheked) {
        if (!$('.selectNegativeAll').prop('checked')) {
          $('.selectNegativeAll').prop("checked", true);
          self.checkedNegTrans()
        }
      }
      this.showLoader = false;
    }
  
    unCheckedNegTrans() {
      if ($('.selectNegativeAll').prop('checked')) {
        $('.selectNegativeAll').prop("checked", false);
      }
    }
  
    checkedNegTrans() {
    }

    // Receivable List - Receipts List Export functionality
    exportReceiptsList() {
      var fileName = "Receipts-List"
      var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
      if (this.dataTableService.totalRecords != undefined) {
        var URL = UftApi.receiptExcelUrl;
        var reqParam
        if (this.isReceiptsSearch) {
          var params = this.dataTableService.getFooterParams("receiptsList")
          reqParam = {"start": 0, "length": this.dataTableService.totalRecords, "payNo": params[0].value, "payeeName": params[1].value, "transAmt": params[2].value, "transNumber": params[3].value, 'paramApplication': paramApp }
        } else {
          reqParam = {
            'paramApplication': paramApp,
            'start': 0,
            'length': this.dataTableService.totalRecords
          }
        }
        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam, fileName);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam, fileName);
            }
          });
        } else {
          this.exportFile(URL, reqParam, fileName);
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    }

    // Receivable List - Negative Transaction List Export functionality
    exportNegativeTransactionList() {
      var fileName = "Negative-Transactions-List"
      var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
      if (this.dataTableService.totalRecords != undefined) {
        var URL = UftApi.negativeTransactionExcelUrl;
        var reqParam
        if (this.isNegativeTransactionSearch) {
          var params = this.dataTableService.getFooterParams("negativeTransactionList")
          reqParam = {"start": 0, "length": this.dataTableService.totalRecords, "payeeNumber": params[0].value, "payeeName": params[1].value, "transactionAmount": params[2].value, "transNumber": params[3].value, 'paramApplication': paramApp }
        } else {
          reqParam = {
            'paramApplication': paramApp,
            'start': 0,
            'length': this.dataTableService.totalRecords
          }
        }
        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam, fileName);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam, fileName);
            }
          });
        } else {
          this.exportFile(URL, reqParam, fileName);
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    }

  exportFile(URL, reqParamPlan, fileName) {
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loaderPlaceHolder = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loaderPlaceHolder = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          a.download = fileName + todayDate
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    })
  }

  onFileChanged(event) {
    this.cashAdjForm.value.cashAdjDocumentName = ""
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
    this.cashAdjForm.patchValue({ 'cashAdjDocumentName': event.target.files[0].name });
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
    this.cashAdjForm.patchValue({ 'cashAdjDocumentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }

  onFileChangedAdjReq(event) {
    this.adjRequestForm.value.adjRequestDocumentName = ""
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
    this.adjRequestForm.patchValue({ 'adjRequestDocumentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only pdf file type are allowed.' };
      this.showRemoveBtn = true;
    } else {
      this.error = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }
  }

  removeExtensionAdjReq() {
    this.adjRequestForm.patchValue({ 'adjRequestDocumentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }
}
