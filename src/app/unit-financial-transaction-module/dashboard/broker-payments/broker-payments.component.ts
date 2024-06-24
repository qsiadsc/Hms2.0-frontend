import { Component, OnInit, ViewChildren, ElementRef, ViewChild } from '@angular/core';
import { UftApi } from '../../uft-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { ToastrService } from 'ngx-toastr';
import { MyDatePicker, IMyDpOptions } from 'mydatepicker';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: 'app-broker-payments',
  templateUrl: './broker-payments.component.html',
  styleUrls: ['../dashboard.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService]
})

export class BrokerPaymentsComponent implements OnInit {
  exportPdfFilePathUrl: string;
  showRefundCheckList: boolean;
  selecteCoID: any;
  selecteCoKey: any;
  selectedCompanyName: any;
  selectedCompany: any;
  public brokerPaymentForm: FormGroup;
  public claimSearchSubmit: FormGroup;
  public companyRefundForm: FormGroup;
  public companyDataRemote: RemoteData;
  public refundListForm: FormGroup;
  public generateBrokerPaymentForm: FormGroup;
  public companyRefundEftForm: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  @ViewChild('generateBrokerPaymentEftDueDate') generateBrokerPaymentEftDueDate: MyDatePicker;
  brokerPaymentColumns = [];
  columns = [];
  rowData: any;
  surplusRefundValue: any;
  closureValue: any;
  stopChequeBtn: boolean = false
  isPrint: string = 'F'
  brokerColumns = [];
  brokerValue: any
  currentUser: any
  claimValue: any
  selectedRefundPayKey: any;
  selectedChequeNum: any;
  claimColumns = []
  showBrokerPopUp: boolean = true
  showClaimPopUp: boolean = false
  dateNameArray = {};
  brokerTableId = "broker-payment-list"
  broker_payment_list_url = UftApi.getBrokerPaymentListUrl;
  brokerPayableGrid: boolean = false
  claimGrid: boolean = false
  companyRefundGrid: boolean = false
  public isOpen: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  showLoader: boolean;
  transactionStatusList;
  showRefundPopUp: boolean = false;
  transactionTypeList;
  public transactionStatusData: CompleterData
  public transactionTypeData: CompleterData
  observableObj
  check = true;
  error: any;
  fieldArray: any;
  generateBrokerPaymentButton
  update: any;
  checkingParamsArr
  payableTotalsResponse
  totalEftRecordsResponse
  totalCoEftRecordsResponse
  totalChequeRecordsResponse
  exportEftResponse
  brokerEftPaymentSummaryResponse
  brokerPrintingChequeResponse = ''
  brokerPaymentSummaryReportResponse
  brokerChequeListResponse
  paymentRunKey
  generateBrokerPaymentButtonDisable: boolean = false
  generateCompanyRefundButtonDisable: boolean = false
  apiResponse
  step1ErrorMessage
  step2ErrorMessage
  step3ErrorMessage
  step4ErrorMessage
  step5ErrorMessage
  step5_1ErrorMessage
  step6ErrorMessage
  step6_1ErrorMessage
  step7ErrorMessage
  pdfViewer: boolean = false
  pdfData
  asOfDateValue
  todayDate
  docUrl = ''
  docType
  pdfUrl
  pdfName
  exportFilePath

  constructor(private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private completerService: CompleterService,
    private exDialog: ExDialog,
    private dataTableService: DatatableService,
    private currentUserService: CurrentUserService,
    private domSanitizer: DomSanitizer) {
    this.error = { isError: false, errorMessage: '' };
  }

  ngOnInit() {
    this.brokerPaymentForm = new FormGroup({
      lessThan: new FormControl(null),
      moreThan: new FormControl(null),
      check: new FormControl(null),
      eftAvail: new FormControl(null)
    })
    this.claimSearchSubmit = new FormGroup({
      toDate: new FormControl(null),
      fromDate: new FormControl(null),
      claimEftAvail: new FormControl(null)
    })
    this.companyRefundForm = new FormGroup({
      fromDate: new FormControl(null),
      toDate: new FormControl(null),
      surplusRefund: new FormControl(null),
      refundEftAvail: new FormControl(null),
      closure: new FormControl(null)
    })
    this.refundListForm = new FormGroup({
      coId: new FormControl(null),
      coName: new FormControl(null),
      coRefundTransDt: new FormControl(null),
      tranCd: new FormControl(null),
      coRefundTotalAmt: new FormControl(null),
      coRefundChqRefNum: new FormControl(null)
    })
    this.generateBrokerPaymentForm = new FormGroup({
      eftDueDate: new FormControl(null, [Validators.required]),
      asOfDate: new FormControl(null, [Validators.required]),
      chequeAmount: new FormControl(null, [Validators.required])
    })
    this.companyRefundEftForm = new FormGroup({
      eftDueDate: new FormControl(null, [Validators.required]),
      asOfDate: new FormControl(null, [Validators.required]),
      chequeAmount: new FormControl(null, [Validators.required])
    })
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('admin.adminRate.planType') == 'admin.adminRate.planType') {
        } else {
          this.columns = [
            { title: "Company No", data: 'coId' },
            { title: "Company Name", data: 'coName' },
            { title: "Transaction Date", data: 'coRefundTransDt' },
            { title: "Transaction Code", data: 'tranCd' },
            { title: "Amount", data: 'coRefundTotalAmt' },
            { title: "Cheque Reference Number", data: 'coRefundChqRefNum' }
          ]
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('uft.uftSearch.companyNameNo') == 'uft.uftSearch.companyNameNo') {
        }
        else {
          this.brokerColumns = [
            { title: "Broker Name", data: 'brokerName' },
            { title: "License #", data: 'brokerId' },
            { title: "Total Amount", data: 'bptPaidAmt' },
            { title: "Cheque Number", data: 'bptChequeNum' }
          ]
          this.check = false;
          this.observableObj.unsubscribe();
        }
      }
    })
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('uft.uftSearch.companyNameNo') == 'uft.uftSearch.companyNameNo') {
        }
        else {
          this.claimColumns = [
            { title: "Company Id", data: 'companyNo' },
            { title: "Company Name", data: 'coName' },
            { title: "Discipline", data: 'discipline' },
            { title: "Card Number", data: 'cardNum' },
            { title: "Patient", data: 'patient' },
            { title: "Confirm ID", data: 'confirmId' },
            { title: "Paid Cost", data: 'paidCost' },
            { title: "Claim Status", data: 'claimStatus' },
            { title: "Adjudicate Date", data: 'adjudicateDt' },
            { title: "Payee", data: 'payee' }
          ]
          this.check = false;
          this.observableObj.unsubscribe();
        }

      }
    })
    this.brokerScreen();
    this.getBrokerPaymentList();;
    var self = this
    $(document).on('click', '#brokerPayableList tr', function () {
      if (self.dataTableService.payablebrokerSelectedRowData != undefined) {
        self.rowData = self.dataTableService.payablebrokerSelectedRowData
      }
    })
    $(document).on('click', '#refundList tr', function () {
      if (self.dataTableService.refundSelectedRowData != undefined) {
        self.rowData = self.dataTableService.refundSelectedRowData
        self.selectedRefundPayKey = self.rowData.coRefundPayKey
        self.selectedChequeNum = self.rowData.coRefundChequeNum
        self.stopChequeBtn = true
      }
    })
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.getPredictiveCompanySearchData(this.completerService);
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.getPredictiveCompanySearchData(this.completerService);
      })
    }
  }

  /* get Broker Payment list Api */
  getBrokerPaymentList() {
    var reqParam = [
      { 'key': 'amtValue', 'value': '' }
    ]
    var tableActions = [];
    if (!$.fn.dataTable.isDataTable('#broker-payment-list')) {
      this.dataTableService.jqueryDataTable(this.brokerTableId, this.broker_payment_list_url, 'full_numbers', this.brokerPaymentColumns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, undefined, [1])
    } else {
      this.dataTableService.jqueryDataTableReload(this.brokerTableId, this.broker_payment_list_url, reqParam);
    }
    error => {
    }
  }

  onSubmitBrokerPayment(brokerPaymentForm) {
    if (this.brokerPaymentForm.valid) {
      let brokerPaymentData = {
        "status": '',
        "fromDate": '',
      }
      error => {
      }
    } else {
      this.validateAllFormFields(this.brokerPaymentForm);
    }
  }

  /**
 * Validate Company Bank Account Form
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

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    var datePickerValue = new Array();
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      datePickerValue[ControlName] = validDate;
      this.brokerPaymentForm.patchValue(datePickerValue);
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
      if (formName == 'brokerPaymentForm') {
        this.brokerPaymentForm.patchValue(datePickerValue);
      } else if (formName == 'companyRefundForm') {
        this.companyRefundForm.patchValue(datePickerValue);
        if (this.companyRefundForm.value.fromDate && this.companyRefundForm.value.toDate) {
          this.error = this.changeDateFormatService.compareTwoDates(this.companyRefundForm.value.fromDate.date, this.companyRefundForm.value.toDate.date);
          if (this.error.isError == true) {
            this.companyRefundForm.controls['toDate'].setErrors({
              "ToDateNotValid": true
            });
          }
        }
      } else if (formName == 'generateBrokerPaymentForm') {
        this.generateBrokerPaymentForm.patchValue(datePickerValue);
      } else if (formName == 'companyRefundEftForm') {
        this.companyRefundEftForm.patchValue(datePickerValue);
      } else if (formName == 'claimSearchSubmit') {
        this.claimSearchSubmit.patchValue(datePickerValue);
        if (this.claimSearchSubmit.value.fromDate && this.claimSearchSubmit.value.toDate) {
          this.error = this.changeDateFormatService.compareTwoDates(this.claimSearchSubmit.value.fromDate.date, this.claimSearchSubmit.value.toDate.date);
          if (this.error.isError == true) {
            this.claimSearchSubmit.controls['toDate'].setErrors({
              "ToDateNotValid": true
            });
          }
        }
      }
    }
  }

  /* Get Transation Status List for Predictive Search */
  getTransactionStatus() {
    var url = UftApi.getTransactionStatusUrl
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

  /* Get Transaction Type List for Predictive Search */
  getTransactionType() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.getTransactionType;
      this.hmsDataService.getApi(url).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.transactionTypeList = data.result;
          resolve();
        }
      })
    });
    return promise;
  }

  companyRefundPopup() {
    this.getTransactionStatus();
    this.getTransactionType().then(res => {
      this.transactionTypeData = this.completerService.local(
        this.transactionTypeList,
        "tranTypeDescription",
        "tranTypeDescription"
      );
    });
  }

  submitCompanyRefundForm() {
    if (this.companyRefundForm.valid) {
    } else {
      this.validateAllFormFields(this.companyRefundForm)
    }
  }

  resetCompanyRefundForm() {
    this.companyRefundForm.reset();
    $("#closeCompanyRefundForm").trigger('click');
  }

  generateBrokerPaymentPopup() {
    this.generateBrokerPaymentButtonDisable = false;
    var self = this
    setTimeout(() => {
      self.generateBrokerPaymentEftDueDate.setFocusToInputBox();
    }, 100);
    this.generateBrokerPaymentForm.patchValue({
      'chequeAmount': 50
    })
  }

  refundScreen() {
    this.resetBrokerListFilter();
    this.resetClaimListFilter();
    this.claimSearchSubmit.reset();
    this.brokerPaymentForm.reset();
    this.stopChequeBtn = false
    this.showBrokerPopUp = false
    this.showClaimPopUp = false
    this.showRefundPopUp = true;
    this.brokerPayableGrid = false
    this.claimGrid = false
    this.companyRefundGrid = false
    this.getTransactionType().then(res => {
      this.transactionTypeData = this.completerService.local(
        this.transactionTypeList,
        "tranTypeDescription",
        "tranTypeDescription"
      );
    });
    this.getTransactionStatus()
  }
  brokerScreen() {
    this.resetRefundListFilter();
    this.resetClaimListFilter();
    this.claimSearchSubmit.reset();
    this.companyRefundForm.reset();
    this.showBrokerPopUp = true
    this.stopChequeBtn = false
    this.showClaimPopUp = false
    this.showRefundPopUp = false
    this.brokerPayableGrid = false
    this.claimGrid = false
    this.companyRefundGrid = false
    this.getTransactionType().then(res => {
      this.transactionTypeData = this.completerService.local(
        this.transactionTypeList,
        "tranTypeDescription",
        "tranTypeDescription"
      );
    });
    this.getTransactionStatus()
  }

  searchRefund() {
    if (this.companyRefundForm.value.surplusRefund == 'closure') {
      this.closureValue = 'T'
      this.surplusRefundValue = 'F'
    }
    else if (this.companyRefundForm.value.surplusRefund == 'surplusRefund') {
      this.closureValue = 'F'
      this.surplusRefundValue = 'T'
    }
    else {
      this.closureValue = 'F'
      this.surplusRefundValue = 'F'
    }
    this.stopChequeBtn = false
    let columns = [
      { title: this.translate.instant('uft.dashboard.brokerPayments.companyNo'), data: 'coId' },
      { title: this.translate.instant('uft.dashboard.brokerPayments.companyName'), data: 'coName' },
      { title: this.translate.instant('uft.dashboard.brokerPayments.transactionDate'), data: 'coRefundTransDt' },
      { title: this.translate.instant('uft.dashboard.brokerPayments.transactionCode'), data: 'tranCd' },
      { title: this.translate.instant('uft.dashboard.brokerPayments.amount'), data: 'coRefundTotalAmt' },
      { title: this.translate.instant('uft.dashboard.brokerPayments.chequeReferenceNum'), data: 'coRefundChqRefNum' }
    ]
    var companyRefundValue = [
      { 'key': 'coRefundTransDtStart', 'value': this.changeDateFormatService.convertDateObjectToString(this.companyRefundForm.controls['fromDate'].value) },
      { 'key': 'coRefundTransDtEnd', 'value': this.changeDateFormatService.convertDateObjectToString(this.companyRefundForm.controls['toDate'].value) },
      { 'key': 'surplus', 'value': this.surplusRefundValue },
      { 'key': 'eft', 'value': this.companyRefundForm.value.refundEftAvail },
      { 'key': 'isPrint', 'value': this.isPrint },
      { 'key': 'accClosure', 'value': this.closureValue },
    ]
    var url = UftApi.companyRefundPaymentsChqUrl
    if (this.companyRefundForm.valid) {
      var tableId = "refundList"
      this.companyRefundGrid = true
      if (!$.fn.dataTable.isDataTable('#refundList')) {
        this.dataTableService.jqueryDataTablePayables(tableId, url, 'full_numbers', columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', companyRefundValue, '', undefined, 2, '', 4, [1, 2, 3, 5])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, companyRefundValue)
      }
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');
    } else {
      this.validateAllFormFields(this.companyRefundForm)
    }
  }

  searchBroker() {
    this.showClaimPopUp = false
    this.showBrokerPopUp = true
    this.brokerPayableGrid = true
    let brokerColumns = [
      { title: this.translate.instant('uft.dashboard.brokerPayments.brokerName'), data: 'brokerName' },
      { title: this.translate.instant('uft.dashboard.brokerPayments.brokerID'), data: 'brokerId' },
      { title: this.translate.instant('uft.dashboard.brokerPayments.totalAmount'), data: 'totalComm' }    
    ]
    this.brokerValue = [
      { 'key': 'lessThan', 'value': (this.brokerPaymentForm.value.lessThan) ? 'T' : 'F' },
      { 'key': 'greaterThan', 'value': (this.brokerPaymentForm.value.moreThan) ? 'T' : 'F' },
      { 'key': 'eft', 'value': this.brokerPaymentForm.value.eftAvail }
    ]
    if (this.brokerPaymentForm.valid) {
      var url = UftApi.payablesBroker
      var tableId = "brokerPayableList"
      if (!$.fn.dataTable.isDataTable('#brokerPayableList')) {
        this.dataTableService.jqueryDataTableUFT(tableId, url, 'full_numbers', brokerColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.brokerValue, '', undefined, [], '', [2], [1])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, this.brokerValue)
      }
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');

    } else {
      this.validateAllFormFields(this.brokerPaymentForm)
    }
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

  claimScreen() {
    this.resetBrokerListFilter();
    this.resetRefundListFilter();
    this.brokerPaymentForm.reset();
    this.companyRefundForm.reset();
    this.showBrokerPopUp = false
    this.showRefundPopUp = false
    this.showClaimPopUp = true
    this.stopChequeBtn = false
    this.brokerPayableGrid = false
    this.claimGrid = false
    this.companyRefundGrid = false
  }

  searchClaim() {
    let searchClaimColumns = [
      { title: "Company Name & No.", data: 'companyName' },
      { title: "Transaction Date", data: 'transDate' },
      { title: "Payee Type", data: 'payee' },
      { title: "Province", data: 'provinceName' },
      { title: "Transaction Reference", data: 'transactionRefNo' },
      { title: "Transaction Amount Balance", data: 'transAmount' },
      { title: "Claim No.", data: 'claimKey' },
    ]
    var reqParam = [
      {
        "key": "transStartDate",
        "value": this.changeDateFormatService.convertDateObjectToString(this.claimSearchSubmit.value.fromDate),
      },
      {
        "key": "transEndDate",
        "value": this.changeDateFormatService.convertDateObjectToString(this.claimSearchSubmit.value.toDate)
      },
      { 'key': 'eft', 'value': this.claimSearchSubmit.value.claimEftAvail }
    ]
    if (this.claimSearchSubmit.valid) {
      this.claimGrid = true
      var tableActions = [];
      var url = UftApi.getTransactionSearchFilterData;
      var tableId = "claimList"
      if (!$.fn.dataTable.isDataTable('#claimList')) {
        this.dataTableService.jqueryDataTablePayables(tableId, url, 'full_numbers', searchClaimColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, '', '', '', 5, [2, 3, 4, 6], 1)
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
    }
    else {
      this.validateAllFormFields(this.claimSearchSubmit)
    }
  }

  stopCheque() {
    var url = UftApi.companyStopChequeUrl;
    var stopChequeReq
    var action = "cancel";
    this.exDialog.openConfirm(this.translate.instant('uft.toaster.stopChequeConfirm') + this.selectedChequeNum)
      .subscribe((value) => {
        if (value) {
          this.stopChequeBtn = false;
          stopChequeReq = { "coRefundPayKey": this.selectedRefundPayKey }
          this.hmsDataService.postApi(url, stopChequeReq).subscribe(data => {
            if (data.code == 200) {
              this.toastrService.success(this.translate.instant('uft.toaster.chequeStopSuccess'))
            } else if (data.code == 400 && data.hmsMessage.messageShort == "CHEQUE_MUST_HAVE_AN_ISSUED_STATUS") {
              this.toastrService.error(this.translate.instant('uft.toaster.chequeIssueStatusError'))
            }
          })
        } else {
        }
      })
  }
  // Generate Broker Payment 
  submitGenerateBrokerPaymentForm() {
    if (this.generateBrokerPaymentForm.valid) {
      this.generateBrokerPaymentButtonDisable = true;
      if (this.fieldArray == []) {
        let fieldArr = {
          "id": 1,
          "done": "0",
          "step": "1",
          "processing": "Retrieving all the pending broker payments to as of ",
          "result": "Processing"
        }
        this.fieldArray.push(fieldArr)
      } else {
        this.fieldArray =
          [{
            "id": 1,
            "done": "0",
            "step": "1",
            "processing": "Retrieving all the pending broker payments to as of ",
            "result": "Processing"
          }]
      }
      this.step1RetrieveAllPending().then(res => {
        if (this.apiResponse == 1) {
          this.update = {
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Retrieving all the pending broker payments to as of ",
            "result": "Done"
          }
          this.showUpdatedItem(this.update);
          this.checkingParamsArr = {
            "id": 2,
            "done": "0",
            "step": "2",
            "processing": "Generating Broker Payment Payable Data",
            "result": "Processing"
          }
          this.fieldArray.push(this.checkingParamsArr)
        } else {
          this.toastrService.error(this.step1ErrorMessage);
        }
      })
    } else {
      this.validateAllFormFields(this.generateBrokerPaymentForm)
    }
  }

  BrokerPaymentSteps() {
    this.step2BrokerPayable().then(res => {
      if (this.apiResponse == 1) {
        this.update = {
          "id": 2,
          "done": "1",
          "step": "2",
          "processing": "Generating Broker Payment Payable Data",
          "result": this.payableTotalsResponse
        }
        let generatingEftRecordsArr = {
          "id": 3,
          "done": "0",
          "step": "3",
          "processing": "Generating EFT",
          "result": "Processing"
        }
        this.showUpdatedItem(this.update);
        this.fieldArray.push(generatingEftRecordsArr);
        this.step3GeneratingEft().then(res => {
          if (this.apiResponse == 1) {
            this.update = {
              "id": 3,
              "done": "1",
              "step": "3",
              "processing": "Generating EFT",
              "result": this.totalEftRecordsResponse
            }
            generatingEftRecordsArr = {
              "id": 4,
              "done": "0",
              "step": "4",
              "processing": "Generating Cheque",
              "result": "Processing"
            }
            this.showUpdatedItem(this.update);
            this.fieldArray.push(generatingEftRecordsArr);
            this.step4GeneratingCheque().then(res => {
              if (this.apiResponse == 1) {
                this.update = {
                  "id": 4,
                  "done": "1",
                  "step": "4",
                  "processing": "Generating Cheque",
                  "result": this.totalChequeRecordsResponse
                }
                generatingEftRecordsArr = {
                  "id": 5,
                  "done": "0",
                  "step": "5",
                  "processing": "Exporting EFT File",
                  "result": "Processing"
                }
                this.showUpdatedItem(this.update);
                this.fieldArray.push(generatingEftRecordsArr);
                this.step5ExportEft().then(res => {
                  if (this.apiResponse == 1) {
                    this.update = {
                      "id": 5,
                      "done": "1",
                      "step": "5",
                      "processing": "Exporting EFT File",
                      "result": this.exportEftResponse
                    }
                    this.showUpdatedItem(this.update)
                    this.step5_1BrokerEftPaymentSummary().then(res => {
                      this.update = {
                        "id": 5,
                        "done": "1",
                        "step": "5",
                        "processing": "Exporting EFT File",
                        "result": this.brokerEftPaymentSummaryResponse
                      }
                      generatingEftRecordsArr = {
                        "id": 6,
                        "done": "0",
                        "step": "6",
                        "processing": "Broker Printing Cheque",
                        "result": "Processing"
                      }
                      this.showUpdatedItem(this.update);
                      this.fieldArray.push(generatingEftRecordsArr);
                      this.step6BrokerPrintingCheques().then(res => {
                        if (this.apiResponse == 1) {
                          this.update = {
                            "id": 6,
                            "done": "1",
                            "step": "6",
                            "processing": "Broker Printing Cheque",
                            "result": this.brokerChequeListResponse
                          }
                          generatingEftRecordsArr = {
                            "id": 7,
                            "done": "0",
                            "step": "7",
                            "processing": "Broker Payment Summary Report",
                            "result": "Processing"
                          }
                          this.showUpdatedItem(this.update);
                          this.fieldArray.push(generatingEftRecordsArr);
                          this.step7BrokerPaymentSummaryReport().then(res => {
                            if (this.apiResponse) {
                              this.update = {
                                "id": 7,
                                "done": "1",
                                "step": "7",
                                "processing": "Broker Payment Summary Report",
                                "result": this.brokerPaymentSummaryReportResponse
                              }
                              this.showUpdatedItem(this.update);
                              this.toastrService.success(this.translate.instant('uft.toaster.paymentGenerateSuccess'))
                            } else {
                              this.toastrService.error(this.step7ErrorMessage);
                            }
                          });
                        } else {
                          this.toastrService.error(this.step6ErrorMessage);
                        }
                      })
                    });
                  } else {
                    this.toastrService.error(this.step5ErrorMessage);
                  }
                })
              } else {
                this.toastrService.error(this.step4ErrorMessage);
              }
            })
          } else {
            this.toastrService.error(this.step3ErrorMessage);
          }
        })
      } else {
        this.toastrService.error(this.step2ErrorMessage);
      }
    })
  }

  resetGenerateBrokerPaymentForm() {
    this.generateBrokerPaymentForm.reset();
    this.fieldArray = [];
    $("#closeGenerateBrokerPaymentForm").trigger('click');
  }

  resetCompanyEftForm() {
    this.companyRefundEftForm.reset();
    this.fieldArray = [];
    $("#closeEftPdfPopup").trigger('click');
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

  step1RetrieveAllPending() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.retrieveAllPending;
      var paramData = {
        "planTypeCd": "Q",
        "originatorRoleCd": "C"
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.step1_1BrokerPendingData().then(res => {
            $("#brokerPaymentPdfPopup").trigger('click');
            resolve();
          })
        } else {

        }
      })
    })
    return promise;
  }

  step1_1BrokerPendingData() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerPendingData;
      this.asOfDateValue = this.changeDateFormatService.convertDateObjectToString(this.generateBrokerPaymentForm.value.asOfDate)
      this.todayDate = this.changeDateFormatService.getToday();
      var paramData = {
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.generateBrokerPaymentForm.value.asOfDate),
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(data.result.brokerPeningFile);
          let fileURL = this.pdfUrl.changingThisBreaksApplicationSecurity
          let fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1, fileURL.length) || fileURL;
          this.pdfName = fileName
          this.apiResponse = 1;
          resolve();
        } else {
          this.generateBrokerPaymentButtonDisable = false
          this.step1ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }

  step2BrokerPayable() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerPayable;
      var paramData = {
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.generateBrokerPaymentForm.value.asOfDate),
        "minChequeAmt": this.generateBrokerPaymentForm.value.chequeAmount
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.paymentRunKey = data.result.paymentRunKey
          this.payableTotalsResponse = 'Total Broker Payable: ' + data.result.payableTotals
          this.apiResponse = 1;
          resolve();
        } else {
          this.step2ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }

  step3GeneratingEft() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generatingEft;
      var paramData = {
        "paymentRunKey": this.paymentRunKey,
        "eftDueDate": this.changeDateFormatService.convertDateObjectToString(this.generateBrokerPaymentForm.value.eftDueDate),
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalEftRecordsResponse = 'Total EFT Records: ' + data.result.eftTotal;
          this.apiResponse = 1;
          resolve();
        } else {
          this.step3ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }

  step4GeneratingCheque() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generatingCheque;
      var paramData = {
        "paymentRunKey": this.paymentRunKey
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalChequeRecordsResponse = 'Total Cheque Records: ' + data.result.chequeTotal
          this.apiResponse = 1;
          resolve();
        } else {
          this.step4ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }

  step5ExportEft() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.exportEft;
      var paramData = {
        "brokerPaySumKey": this.paymentRunKey,
        "originatorRoleCd": "C"
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && (data.hmsMessage.messageShort == 'RECORDS_GET_SUCCESSFULLY' || data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY')) {
          this.exportEftResponse = 'Exporting EFT File';
          if (data.result.exportFilePath) {
            this.exportFilePath = data.result.exportFilePath
          } else {
            this.exportFilePath = ''
          }
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.exportEftResponse = 'Record Not Found';
          this.apiResponse = 1;
          resolve();
        } else {
          this.step5ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }


  step5_1BrokerEftPaymentSummary() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerEftPaymentSummary;
      var paramData = {
        "brokerPaySumKey": this.paymentRunKey,
        "asOfDate": this.asOfDateValue
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && (data.hmsMessage.messageShort == 'RECORDS_GET_SUCCESSFULLY' || data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY')) {
          if (data.result.filePath) {
            this.brokerEftPaymentSummaryResponse = '<p>' + data.result.filePath + '</p><p>' + this.exportFilePath;
          } else {
            this.brokerEftPaymentSummaryResponse = '<p>' + this.exportFilePath + '</p>';
          }
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.brokerEftPaymentSummaryResponse = 'Export EFT Not Generated';
          this.apiResponse = 1;
          resolve();
        } else {
          this.step5_1ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }

  step6BrokerPrintingCheques() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerPrintingCheques;
      var paramData = {
        "eftBrokerSumKey": this.paymentRunKey
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.brokerPrintingChequeResponse = ''
          this.apiResponse = 1;
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.brokerPrintingChequeResponse = '';
          this.apiResponse = 1;
        } else {
          this.brokerPrintingChequeResponse = ''
          this.apiResponse = 0;
          this.step6ErrorMessage = data.hmsMessage.messageShort
        }
        this.step6_1BrokerChequeList().then(res => {
          resolve();
        });
      })
    })
    return promise;
  }

  step7BrokerPaymentSummaryReport() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerPaymentSummaryReport;
      var paramData = {
        "brokerPaySumKey": this.paymentRunKey,
        "asOfDate": this.asOfDateValue
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.brokerPaymentSummaryReportResponse = data.result.filePath
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.brokerPaymentSummaryReportResponse = '';
          this.apiResponse = 1;
          resolve();
        } else {
          this.brokerPaymentSummaryReportResponse = ''
          this.apiResponse = 0;
          this.step7ErrorMessage = data.hmsMessage.messageShort
          resolve();
        }
      })
    })
    return promise;
  }

  step6_1BrokerChequeList() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.brokerChequeList;
      var paramData = {
        "brokerPaySumKey": this.paymentRunKey,
        "asOfDate": this.asOfDateValue
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.brokerChequeListResponse = '<p>' + data.result.filePath + '</p><p>' + data.result.brokerPrintChequeFilePath + '</p>'
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.brokerChequeListResponse = '';
          this.apiResponse = 1;
          resolve();
        } else {
          this.brokerChequeListResponse = ''
          this.apiResponse = 0;
          this.step6_1ErrorMessage = data.hmsMessage.messageShort
          resolve();
        }
      })
    })
    return promise;
  }

  brokerPaymentPdfOpen(modal) {
    modal.open();
    this.pdfUrl = 'sdfsd'
  }

  resetRefundSearchForm() {
    this.companyRefundForm.reset();
    this.selectedRefundPayKey = ''
  }

  resetSearchClaim() {
    this.claimSearchSubmit.reset();
  }

  resetBrokerSearchForm() {
    this.brokerPaymentForm.reset();
  }

  claimListFilter(tableId) {
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var selectedCompany = { 'key': 'coId', 'value': this.selecteCoID }
    params.push(selectedCompany)
    var url = UftApi.getTransactionSearchFilterDataUrl
    this.dataTableService.jqueryDataTableReload(tableId, url, params)
  }

  brokerListFilter(tableId) {
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var url = UftApi.payablesBroker
    this.dataTableService.jqueryDataTableReload(tableId, url, params)
  }
  refundListFilter(tableId) {
    var appendExtraParam = { 'key': 'isPrint', 'value': 'F' }
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var url = UftApi.companyRefundPaymentsChqUrl
    this.dataTableService.jqueryDataTableReload(tableId, url, params)
  }

  resetBrokerListFilter() {
    this.dataTableService.resetTableSearch();
  }
  resetRefundListFilter() {
    this.dataTableService.resetTableSearch();
    this.refundListForm.reset()
  }
  resetClaimListFilter() {
    this.dataTableService.resetTableSearch();
  }

  printCheque() {
    if (this.companyRefundForm.value.surplusRefund == 'closure') {
      this.closureValue = 'T'
      this.surplusRefundValue = 'F'
    }
    else if (this.companyRefundForm.value.surplusRefund == 'surplusRefund') {
      this.closureValue = 'F'
      this.surplusRefundValue = 'T'
    }
    else {
      this.closureValue = 'F'
      this.surplusRefundValue = 'F'
    }
    this.showLoader = true
    var appendExtraParam = { 'key': 'isPrint', 'value': 'T' }
    var params = {
      "coRefundTransDtStart": this.changeDateFormatService.convertDateObjectToString(this.companyRefundForm.controls['fromDate'].value),
      "coRefundTransDtEnd": this.changeDateFormatService.convertDateObjectToString(this.companyRefundForm.controls['toDate'].value),
      "surplus": this.surplusRefundValue,
      "eft": this.companyRefundForm.value.refundEftAvail,
      "accClosure": this.closureValue,
      "coId": this.refundListForm.value.coId,
      "coName": this.refundListForm.value.coName,
      "coRefundTransDt": this.changeDateFormatService.convertDateObjectToString(this.refundListForm.value.coRefundTransDt),
      "tranCd": this.refundListForm.value.tranCd,
      "coRefundTotalAmt": this.refundListForm.value.coRefundTotalAmt,
      "isPrint": 'T',
      "length": this.dataTableService.pageLength,
      "start": 0
    }
    var url = UftApi.companyRefundPaymentsChqUrl
    this.hmsDataService.postApi(url, params).subscribe(data => {
      if (data.code == 200) {
        this.showLoader = false
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = data.result.companyRefundFilePath;
        a.target = 'blank';
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(data.result.companyRefundFilePath);
          document.body.removeChild(a);
        }, 0)
      } else {
        this.showLoader = false
        this.toastrService.error(this.translate.instant('uft.toaster.chequeCantPrint'))
      }
    })

  }

  getPredictiveCompanySearchData(completerService) {
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getAllPredectiveCompany + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getPredectiveCompany + '/' + businessTypeKey + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    }
  }

  onCompanyNameSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedCompany = selected.originalObject;
      this.selectedCompanyName = selected.originalObject.coName
      this.selecteCoKey = selected.originalObject.coKey
      this.selecteCoID = selected.originalObject.coId
    } else {
      this.selectedCompanyName = ""
      this.selecteCoKey = ''
      this.selecteCoID = ''
    }
  }

  openModal() {
    this.showRefundCheckList = false
  }
  companyRefundEftPopUp() {
    
    this.generateCompanyRefundButtonDisable = false;
    var self = this
    setTimeout(() => {
      self.generateBrokerPaymentEftDueDate.setFocusToInputBox();
    }, 100);

    this.generateBrokerPaymentForm.patchValue({
      'chequeAmount': 50
    })
  }

  CompanyRefundSteps() {
    if (this.companyRefundEftForm.valid) {
      this.generateCompanyRefundButtonDisable = true;
      if (this.fieldArray == []) {
        let fieldArr = {
          "id": 1,
          "done": "0",
          "step": "1",
          "processing": "Generating Company Refund Payable Data ",
          "result": "Processing"
        }
        this.fieldArray.push(fieldArr)
      } else {
        this.fieldArray =
          [{
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Generating Company Refund Payable Data",
            "result": "Processing"
          }]
      }
      this.step1CoRefundPayable().then(res => {
        if (this.apiResponse == 1) {
          this.update = {
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Generating Company Refund Payable Data",
            "result": this.payableTotalsResponse
          }
          let generatingCoEftRecordsArr = {
            "id": 2,
            "done": "0",
            "step": "2",
            "processing": "Generating EFT",
            "result": "Processing"
          }
          this.showUpdatedItem(this.update);
          this.fieldArray.push(generatingCoEftRecordsArr);
          this.step2GeneratingCoEft().then(res => {
            if (this.apiResponse == 1) {
              this.update = {
                "id": 2,
                "done": "1",
                "step": "2",
                "processing": "Generating Company Refund EFT",
                "result": this.totalCoEftRecordsResponse
              }
              generatingCoEftRecordsArr = {
                "id": 3,
                "done": "0",
                "step": "3",
                "processing": "Exporting EFT File",
                "result": "Processing"
              }
              this.showUpdatedItem(this.update);
              this.fieldArray.push(generatingCoEftRecordsArr);
              this.Step3exportCoRefundEft().then(res => {
                if (this.apiResponse == 1) {
                  this.update = {
                    "id": 3,
                    "done": "1",
                    "step": "3",
                    "processing": "Exporting EFT File",
                    "result": this.totalChequeRecordsResponse
                  }
                  this.showUpdatedItem(this.update);
                  generatingCoEftRecordsArr = {
                    "id": 4,
                    "done": "1",
                    "step": "4",
                    "processing": "Generating Report",
                    "result": this.exportPdfFilePathUrl
                  }
                  this.fieldArray.push(generatingCoEftRecordsArr);
                } else {
                  this.toastrService.error(this.step3ErrorMessage);
                }
              })
            } else {
              this.toastrService.error(this.step2ErrorMessage);
            }
          })
        } else {
          this.toastrService.error(this.step1ErrorMessage);
        }
      })
    }
    else {
      this.validateAllFormFields(this.companyRefundEftForm)
    }
  }

  step1CoRefundPayable() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generateCoRefundPayable;
      var paramData = {
        "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.companyRefundEftForm.value.asOfDate),
        "coRefundTotalAmt": this.companyRefundEftForm.value.chequeAmount
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.paymentRunKey = data.result.paymentRunKey
          this.payableTotalsResponse = 'Total Broker Payable: ' + data.result.payableTotals
          this.apiResponse = 1;
          resolve();
        } else {
          this.step1ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }

  step2GeneratingCoEft() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generatingCoRefundEft;
      var paramData = {
        "paymentRunKey": this.paymentRunKey,
        "coEftDueDt": this.changeDateFormatService.convertDateObjectToString(this.companyRefundEftForm.value.eftDueDate),
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalCoEftRecordsResponse = 'Total EFT Records: ' + data.result.coEftTotalAmt;
          this.apiResponse = 1;
          resolve();
        } else {
          this.step2ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }


  Step3exportCoRefundEft() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.exportCoRefundEft;
      var paramData = {
        "coRefundPaySumKey": this.paymentRunKey,
        "coEftDueDt": this.changeDateFormatService.convertDateObjectToString(this.companyRefundEftForm.value.eftDueDate),
      }
      this.hmsDataService.postApi(url, paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.totalChequeRecordsResponse = data.result.exportFilePath
          this.exportPdfFilePathUrl = data.result.exportPdfFilePath
          this.apiResponse = 1;
          resolve();
        } else {
          this.step3ErrorMessage = data.hmsMessage.messageShort
          this.apiResponse = 0;
          resolve();
        }
      })
    })
    return promise;
  }

}
