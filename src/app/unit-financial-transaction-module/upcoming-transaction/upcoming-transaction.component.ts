import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { FormGroup, FormControl, FormControlName, Validators } from '@angular/forms';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { UftApi } from '../uft-api';
import { CompanyApi } from '../../company-module/company-api';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { FeeGuideApi } from '../../fee-guide-module/fee-guide-api'
import { CurrencyPipe } from '@angular/common';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: 'app-upcoming-transaction',
  templateUrl: './upcoming-transaction.component.html',
  styleUrls: ['./upcoming-transaction.component.css'],
  providers: [ChangeDateFormatService, DatatableService]
})
export class UpcomingTransactionComponent implements OnInit {
  pdfName: JQuery<HTMLElement>;
  generateEftBut: false;
  businessTypeData: any;
  transactionTypeList: any;
  monthList: any;
  monthData: any;
  planList: any;
  planData: any;
  public transactionTypeData: CompleterData;
  showUpcomingTransList: boolean = false;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  filterTransactionForm: FormGroup;
  addOTPform: FormGroup;
  generateEftform: FormGroup;
  error: any
  columns = [];
  businessTypeList = [];
  dateNameArray = {};
  companyListData;
  showLoader: boolean = false;
  public isOpen: boolean = false;
  otpData: any;
  currentBal: any;
  companyCoId: any;
  cashtranstype: any;
  firstDay: Date;
  planTypeValues;
  optList = []
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  observableObj;
  check = true;
  otpBankAccountsForm: FormGroup;
  //eft Process variables Start
  success: string;
  apiResponse: number;
  coPaySumKey: any;
  generatePapEftFileArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  exportPapFileDirectoryArr: { "id": number; "done": string; "step": string; "processing": string; "result": string; };
  fieldArray: any;
  paramData;
  update: any;
  errorAPI;
  formValue;
  generateCompanyPapFlag: boolean = false
  generateComPapApiError: string
  pdfUrl
  @Output() generateEFTButton = new EventEmitter();
  companyUpcomingErr
  generateEftResp;
  uftKey;
  paymentListColumns = []
  transCdKey;
  //eft Process variables End
  bankDetailsArr = [];
  showBankGrid: boolean = false;
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private translate: TranslateService,
    private dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private domSanitizer: DomSanitizer
  ) {
    this.error = { isError: false, errorMessage: '' }
    // Predictive Search for FeeGuide ProvinceName    
    this.companyListData = this.completerService.remote(
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

  ngOnInit() {
    this.filterTransactionForm = new FormGroup({
      'ut_month': new FormControl('', [Validators.required]),
      'planType': new FormControl('', [Validators.required]),
      'transactionType': new FormControl('')
    });
    this.addOTPform = new FormGroup({
      'otp_accTrans': new FormControl('', [Validators.required]),
      'otp_transactionType': new FormControl('', [Validators.required]),
      'otp_companyName': new FormControl('', [Validators.required]),
      'otp_transactionAmt': new FormControl('', [Validators.required]),
      'otp_transactionDesc': new FormControl('', [Validators.maxLength(80), CustomValidators.notEmpty]),
      'otp_transactionReference': new FormControl('', []),
      'otp_currentbalance': new FormControl(''),
    });
    this.generateEftform = new FormGroup({
      'entry_date': new FormControl('', [Validators.required])
    });
    this.otpBankAccountsForm = new FormGroup({
      'bankNumber': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'bankName': new FormControl('', [Validators.required, Validators.maxLength(60), CustomValidators.alphaNumeric, CustomValidators.notEmpty]),
      'branch': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'account': new FormControl('', [Validators.required, Validators.minLength(7), Validators.maxLength(20), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl('')
    });
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('uft.uftSearch.companyNameNo') == 'uft.uftSearch.companyNameNo') {
        }
        else {
          this.columns = [
            { title: this.translate.instant('uft.upcomingTransactionsSearch.companyNameNo'), data: 'mergedDesc' },// coId
            { title: this.translate.instant('uft.upcomingTransactionsSearch.papAmount'), data: 'coPapAmount' },
          ]
          this.getUpcomingTransactionList();
          this.check = false;
          this.observableObj.unsubscribe();
        }
      }
    })
    this.columns = []
    this.getTransactionType();
    this.getPlanTypeList();
    this.getMonthList();
    this.paymentListColumns = [
      { 'title': 'Company Name & No.', data: 'coIdCoName' },
      { 'title': 'Transaction Date', data: 'unitFinancialTransDt' },
      { 'title': 'Transaction Amount', data: 'unitFinancialTransAmt' },
      { 'title': 'Transaction Type', data: 'tranCd' },
      { 'title': 'Transaction Description', data: 'unitFinancialTransDesc' },
      { 'title': 'Current Balance', data: 'companyBalance' }
    ]
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

  submitOTP() {
    if (this.addOTPform.valid) {
      this.exDialog.openConfirm(this.translate.instant('company.exDialog.confirmOTPBankDetails')).subscribe((value) => {
        if (value) {
          this.saveOTP();
        } else {
          this.hmsDataService.OpenCloseModal('openOTPBankAccount')
        }
      });
    } else {
      this.validateAllFormFields(this.addOTPform)
    }
  }

  saveOTP() {
    this.showLoader = true
    var submitData = {
      "unitFinancialTransKey": '',
      "coKey": this.companyCoId,
      "tranCdKey": 93,
      "provinceName": null,
      "countryName": null,
      "unitFinancialTransRef": this.addOTPform.value.otp_transactionReference,
      "unitFinancialTransAmt": this.addOTPform.value.otp_transactionAmt,
      "unitFinancialTransDt": this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.otp_accTrans),
      "unitFinancialTransDesc": this.addOTPform.value.otp_transactionDesc,
    }
    this.addOTPform.value.otp_accTrans = this.changeDateFormatService.convertDateObjectToString(this.addOTPform.value.otp_accTrans);
    this.hmsDataService.postApi(UftApi.saveAndUpdateUnitFinancialTransactionUrl, submitData).subscribe(
      data => {
        if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
          var companyUrl = UftApi.getCompanyBalanceUrl + '/' + this.companyCoId
          this.getPaymentTypeList(data.result.coKey);
          this.toastrService.success(this.translate.instant('uft.toaster.otpSuccess'));
          this.showLoader = false
          this.showBankGrid = false
          this.addOTPform.controls['otp_companyName'].reset();
          this.addOTPform.controls['otp_transactionAmt'].reset();
          this.addOTPform.controls['otp_currentbalance'].reset();
          var todayDate = this.changeDateFormatService.getToday();
          var reqParam = [
            { 'key': 'startDate', 'value': this.changeDateFormatService.convertDateObjectToString(todayDate) }
          ]
          var Url = UftApi.getUpcomingTransactionBankAccountListUrl
          var tableId = "upcomingTransactionsList"
          this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
        }
      })
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    var datePickerValue = new Array();
    var validDate = this.changeDateFormatService.getToday();
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      datePickerValue[ControlName] = validDate;
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
      if (formName == 'filterTransactionForm') {
        this.filterTransactionForm.patchValue(datePickerValue);
      } else if (formName == 'addOTPform') {
        this.addOTPform.patchValue(datePickerValue);
      } else if (formName == 'generateEftform') {
        var todayDate = this.changeDateFormatService.getToday();
        this.generateEftform.patchValue(datePickerValue);
        if (todayDate && this.generateEftform.value.entry_date) {
          var errorVal = this.changeDateFormatService.compareTwoDates(todayDate.date, this.generateEftform.value.entry_date.date);
          if (errorVal.isError == true) {
            this.generateEftform.controls.entry_date.setErrors({
              "generateEffDateNotValid": true
            });
            return;
          }
        }
      } else if (formName == 'otpBankAccountsForm') {
        this.otpBankAccountsForm.patchValue(datePickerValue);
      }
    }
  }

  resetOTP() {
    this.hmsDataService.OpenCloseModal('closeOTP')
    this.optList = [];
    this.addOTPform.reset();
  }

  /**
   * Get upcomingTransList
   * @param filterTransactionForm 
   */
  upcomingTransListSearch(filterTransactionForm) {
    if (this.filterTransactionForm.valid) {
      if (filterTransactionForm.value.ut_month != null) {
        this.showUpcomingTransList = true;
        var today = new Date();
        var year = today.getFullYear();
        if (filterTransactionForm.value.ut_month != null) {
          var monthIndex = this.monthList.findIndex(x => x.month === filterTransactionForm.value.ut_month);
        } else {
          monthIndex = today.getMonth();
        }
        var transactionDate = '01/' + (monthIndex < 10 ? '0' : '') + (monthIndex + 1) + '/' + year;
        var todayDate = this.changeDateFormatService.getToday();
        var reqParam = [
          { 'key': 'businessTypeCd', 'value': this.planTypeValues },
          { 'key': 'transactionDate', 'value': this.changeDateFormatService.convertDateObjectToString(todayDate) }
        ]
        var Url = UftApi.upcomingTransactionsUrl
        var tableId = "upcomingTransactionsList"
        if (!$.fn.dataTable.isDataTable('#upcomingTransactionsList')) {
          this.dataTableService.jqueryDataTableForDentalSchedule(tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '')
        } else {
          this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
        }
        $('html, body').animate({
          scrollTop: $(document).height()
        }, 'slow');
        return false;
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.selectMonth'));
      }
    } else {
      this.validateAllFormFields(this.filterTransactionForm)
    }
  }

  // Upcoming Transaction List for updated Api
  getUpcomingTransactionList() {
    var todayDate = this.changeDateFormatService.getToday();
    var reqParam = [
      { 'key': 'startDate', 'value': this.changeDateFormatService.convertDateObjectToString(todayDate) }
    ]
    var Url = UftApi.getUpcomingTransactionBankAccountListUrl
    var tableId = "upcomingTransactionsList"
    if (!$.fn.dataTable.isDataTable('#upcomingTransactionsList')) {
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [1],[1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  /**
   * Reset upcomingTrans list form
   */
  clearTransListSearch() {
    this.filterTransactionForm.reset()
  }

  getTransactionType() {
    var url = UftApi.getTransactionTypeUrl;
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.transactionTypeList = data.result;
        this.transactionTypeData = this.completerService.local(
          this.transactionTypeList,
          "tranTypeDescription",
          "tranTypeDescription"
        )
      }
    })
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

  // Search Listing for Dental Schedule
  upcomingTransListFilter(tableId: string) {
    var params = this.dataTableService.getFooterParams("upcomingTransactionsList")
    var dateParams = [];
    var URL = FeeGuideApi.getDentalScheduleListUrl
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }

  // Reset Listing for Dental Schedule
  resetupcomingTransListFilter() {
    this.dataTableService.resetTableSearch();
    this.upcomingTransListFilter("upcomingTransactionsList");
    $('#upcomingTransactionsList .icon-mydpremove').trigger('click');
  }

  getPlanTypeList() {
    var URL = CompanyApi.getBusinessTypeUrl;
    this.hmsDataService.get(URL).subscribe(data => {
      if (data.code == 200) {
        this.businessTypeList = data.result;
        //Predictive Company Search Upper
        this.businessTypeData = this.completerService.local(
          this.businessTypeList,
          "businessTypeDesc",
          "businessTypeDesc"
        );
        /*Set Default Business Type*/
        data.result.forEach(element => {
          if (element.businessTypeCd == 'Q') {
            this.planTypeValues = element.businessTypeCd;
            this.filterTransactionForm.patchValue({ 'planType': element.businessTypeDesc })
          }
        });
      }
    });
  }

  addOTP() {
    for (var i = 0; i < this.transactionTypeList.length; i++) {
      if (this.transactionTypeList[i].tranCd == '93') {
        this.cashtranstype = this.transactionTypeList[i].mergedDescription
        this.transCdKey = this.transactionTypeList[i].tranCdKey
      }
    }
    this.addOTPform.patchValue({
      "otp_transactionType": this.cashtranstype,
      "otp_accTrans": this.changeDateFormatService.getToday(),
      "otp_transactionDesc": 'SINGLE'
    })
    this.getPaymentTypeList(this.companyCoId);
  }

  onCompanyNameSelected(selected: CompleterItem) {
    if (selected) {
      this.companyCoId = selected.originalObject.coKey
      var companyUrl = UftApi.getCompanyBalanceUrl + '/' + this.companyCoId
      this.hmsDataService.getApi(companyUrl).subscribe(data => {
        if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
          if (Number.isInteger(data.result)) {
            this.currentBal = data.result + '.00';
          } else {
            this.currentBal = data.result
          }
          this.addOTPform.patchValue({
            "otp_currentbalance": this.currentUserService.convertAmountToDecimalWithoutDoller(this.currentBal),
          })
        }
      })
      this.getPaymentTypeList(selected.originalObject.coKey)
      this.getBankDetails(this.companyCoId)
    }
  }

  /**
   * Show Active Bank Associated With Company
   * @param compKey
   * @date 06Aug2019
   */
  getBankDetails(compKey) {
    this.bankDetailsArr = [];
    var URL = CompanyApi.getCompanyActivebankAccountUrl;
    var reqParam = { 'coKey': compKey }
    this.hmsDataService.postApi(URL, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showBankGrid = true;
        this.bankDetailsArr.push({
          "coBankAccountNum": data.result.coBankAccountNum,
          "coBankBranchNum": data.result.coBankBranchNum,
          "coBankNum": data.result.coBankNum,
          "coBankName": data.result.coBankName,
          "expiredOn": data.result.expiredOn,
          "effectiveOn": data.result.effectiveOn
        });
      } else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.showBankGrid = false;
      }
    });
  }

  generateEftPopup() {
    this.setNextMonthFirstDate();
  }

  setNextMonthFirstDate() {
    var todayDate = this.changeDateFormatService.getToday();
    // GET THE MONTH AND YEAR OF COMPANY EFFECTIVE DATE.
    var month = todayDate.date.month,
      year = todayDate.date.year,
      day = todayDate.date.day;
    var eftFirstDate = new Date(year, month, 1);
    this.generateEftform.patchValue({
      'entry_date': this.changeDateFormatService.convertStringDateToObject(this.convert(eftFirstDate))
    });
  }

  convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("/");
  }

  generteEFTProcessClick() {
    if (this.generateEftform.valid) {
      this.generateEFTProcess(this.generateEftform.value).then(res => {
        if (this.success) {
          this.toastrService.success(this.success);
          this.setNextMonthFirstDate();
        } else if (this.generateComPapApiError) {
          this.toastrService.error(this.generateComPapApiError);
        }
      })
    } else {
      this.validateAllFormFields(this.generateEftform)
    }
  }

  resetGenerateEFTForm() {
    this.generateEftform.reset();
    $("#closeGenerateEFTForm").trigger('click');
    this.generateEftBut = false
    var todayDate = this.changeDateFormatService.getToday();
    var reqParam = [
      { 'key': 'startDate', 'value': this.changeDateFormatService.convertDateObjectToString(todayDate) }
    ]
    var Url = UftApi.getUpcomingTransactionBankAccountListUrl
    var tableId = "upcomingTransactionsList"
    this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    this.fieldArray = []
    this.success = ''
  }

  getGenerateEftButtonCheck(event) {
    this.generateEftBut = event
  }

  /**
   * get month list
   */
  getMonthList() {
    var currentDate = new Date();
    var monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    var monthIndex = currentDate.getMonth();
    let currentMonth = monthLabels[monthIndex];
    let nextMonth = monthLabels[monthIndex + 1];
    this.monthList = [
      { "month": currentMonth },
      { "month": nextMonth }
    ];
    this.monthData = this.completerService.local(
      this.monthList,
      "month",
      "month"
    )
    this.filterTransactionForm.patchValue({ 'ut_month': currentMonth });
  }

  onBlurPatchCurrentMonth(value) {
    if (value == '') {
      var today = new Date();
      var monthIndex = today.getMonth();
      this.filterTransactionForm.patchValue({ 'ut_month': this.monthList[0].month });
    }
  }

  onPlanTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.planTypeValues = selected.originalObject.businessTypeCd
    } else {
      this.planTypeValues = ''
    }
  }

  ngOnBlur() {
    if (this.addOTPform.value.otp_companyName == '') {
      this.addOTPform.patchValue({
        "otp_currentbalance": '',
      })
    }
  }

  /**
   * Submit Bank Account Details
   * @param otpBankAccountsForm 
   */
  onSubmitBankDetail(otpBankAccountsForm) {
    if (this.otpBankAccountsForm.valid) {
      this.hmsDataService.OpenCloseModal('openOTPBankAccount');
    }
    else {
      this.validateAllFormFields(this.otpBankAccountsForm);
    }
    // Any API call logic via services goes here
  }

  /**
   * Reset OPT bank account
   */
  resetOTPBankDetail() {
    this.otpBankAccountsForm.reset();
  }

  closeOTPBankPopup() {
    this.hmsDataService.OpenCloseModal('closeOTP')
    this.optList = [];
  }

  //EFT Process Functions Start
  showUpdatedItem(newItem) {
    let updateItem = this.fieldArray.find(this.findIndexToUpdate, newItem.id);
    let index = this.fieldArray.indexOf(updateItem);
    this.fieldArray[index] = newItem;
  }

  findIndexToUpdate(newItem) {
    return newItem.id === this;
  }

  generateEFTProcess(formValue) {
    this.formValue = formValue
    let promise = new Promise((resolve, reject) => {
      this.generateEFTButton.emit(true);
      if (this.fieldArray == []) {
        let fieldArr = {
          "id": 1,
          "done": "0",
          "step": "1",
          "processing": "Company Upcoming Transactions",
          "result": "Processing"
        }
        this.fieldArray.push(fieldArr)
      } else {
        this.fieldArray =
          [{
            "id": 1,
            "done": "0",
            "step": "1",
            "processing": "Company Upcoming Transactions",
            "result": "Processing"
          }]
      }
      this.companyUpcomingTransactions(formValue).then(res => {
        if (this.apiResponse) {
          this.update = {
            "id": 1,
            "done": "1",
            "step": "1",
            "processing": "Company Upcoming Transactions",
            "result": "Passed"
          }
          this.eftSteps();
        } else {
          if (this.companyUpcomingErr == 'Process stopped due to company having PAP, but not bank account, Please fix them.') {
            this.update = {
              "id": 1,
              "done": "1",
              "step": "1",
              "processing": "Company Upcoming Transactions",
              "result": this.companyUpcomingErr
            }
          } else {
            this.update = {
              "id": 1,
              "done": "1",
              "step": "1",
              "processing": "Company Upcoming Transactions",
              "result": this.companyUpcomingErr
            }
          }
        }
        this.showUpdatedItem(this.update);
      });
    });
    return promise;
  }

  eftSteps() {
    this.exportPapFileDirectoryArr = {
      "id": 2,
      "done": "0",
      "step": "2",
      "processing": "Generate Company Pap",
      "result": "Processing"
    }
    this.showUpdatedItem(this.update);
    this.fieldArray.push(this.exportPapFileDirectoryArr)
    this.generateCompanyPap(this.formValue).then(res => {
      if (!this.generateCompanyPapFlag) {
        this.update = {
          "id": 2,
          "done": "1",
          "step": "2",
          "processing": "Generate Company Pap",
          "result": "PAP data has been generated."
        }
        this.exportPapFileDirectoryArr = {
          "id": 3,
          "done": "0",
          "step": "3",
          "processing": "Export Pap File Directory",
          "result": "Processing"
        }
        this.showUpdatedItem(this.update);
        this.fieldArray.push(this.exportPapFileDirectoryArr)
        this.exportPapFileDirectory().then(res => {
          this.update = {
            "id": 3,
            "done": "1",
            "step": "3",
            "processing": "Export Pap File Directory",
            "result": "PAP File Exported."
          }
          this.generatePapEftFileArr = {
            "id": 4,
            "done": "0",
            "step": "4",
            "processing": "Generate Pap Eft File",
            "result": "Processing"
          }
          this.showUpdatedItem(this.update);
          this.fieldArray.push(this.generatePapEftFileArr);
          this.generatePapEftFile().then(res => {
            this.update = {
              "id": 4,
              "done": "1",
              "step": "4",
              "processing": "Generate Pap Eft File",
              "result": "PAP File generated: " + this.generateEftResp
            }
            this.showUpdatedItem(this.update);
            this.generateEFTButton.emit(true);
            this.success = this.translate.instant('uft.toaster.eftSuccess')
          });
        });
      } else {
        this.update = {
          "id": 2,
          "done": "1",
          "step": "2",
          "processing": "Generate Company Pap",
          "result": "Company PAP has been generated for this month"
        }
        this.showUpdatedItem(this.update);
        this.generateComPapApiError = this.translate.instant('uft.toaster.companyPapGenForMonth');
      }
    });
  }

  /* 1st step of EFT*/
  companyUpcomingTransactions(formValue) {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.companyUpcomingTransactions;
      this.paramData = {
        "transactionDate": this.changeDateFormatService.convertDateObjectToString(formValue.entry_date)
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 1;
          resolve();
        } else if (data.code == 400 && data.hmsMessage.messageShort == 'Process stopped due to company having PAP, but not bank account, Please fix them.') {
          this.apiResponse = 0;
          this.companyUpcomingErr = data.hmsMessage.messageShort
          // for resolved point no 420 
          this.pdfUrl =  this.domSanitizer.bypassSecurityTrustResourceUrl(data.result.filePath);
          let fileURL =  this.pdfUrl.changingThisBreaksApplicationSecurity
          let fileName =  fileURL.substring(fileURL.lastIndexOf('/') + 1, fileURL.length) || fileURL;
          this.pdfName =  fileName
          var windowObjectReference; 
          var params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000' 
          windowObjectReference = window.open(fileURL, "CNN_WindowName", params); 
          windowObjectReference.focus(); 
          $('#openEftPdfPopup').trigger('click')
          resolve();
        }
        else {
          this.apiResponse = 0;
          this.companyUpcomingErr = data.hmsMessage.messageShort
          this.reinitializeProcess().then(res => {
            this.generateEFTProcess(this.formValue);
          })
        }
      })
    })
    return promise;
  }

  /* 2nd step of EFT*/
  generateCompanyPap(formValue) {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generateCompanyPap;
      this.paramData = {
        "paymentDate": this.changeDateFormatService.convertDateObjectToString(formValue.entry_date)
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.coPaySumKey = data.result.paymentSumKey;
          this.apiResponse = 1;
          this.generateCompanyPapFlag = false;
          resolve();
        } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.message == 'COMPANY_PAP_HAS_BEEN_GENERATED_FOR_THIS_MONTH') {
          this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.COMPANY_PAP_HAS_BEEN_GENERATED_FOR_THIS_MONTH'));
          this.generateCompanyPapFlag = true;
          resolve();
        }
        else {
          this.apiResponse = 0;
          this.generateCompanyPapFlag = false;
          this.reinitializeProcess().then(res => {
            this.generateEFTProcess(this.formValue);
          })
        }
      })
    })
    return promise;
  }

  /* 3rd step of EFT*/
  exportPapFileDirectory() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.exportPapFileDirectory;
      this.paramData = {
        "coPaySumKey": this.coPaySumKey
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 1;
          resolve();
        } else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            this.generateEFTProcess(this.formValue);
          })
        }
      })
    })
    return promise;
  }

  /* 4th step of EFT */
  generatePapEftFile() {
    let promise = new Promise((resolve, reject) => {
      var url = UftApi.generatePapEftFile;
      this.paramData = {
        "coPaySumKey": this.coPaySumKey
      }
      this.hmsDataService.postApi(url, this.paramData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.apiResponse = 1;
          this.generateEftResp = data.result.generatePapEftTextFilePath
          resolve();
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.apiResponse = 1;
          this.generateEftResp = data.hmsMessage.messageShort
          resolve();
        } else {
          this.apiResponse = 0;
          this.reinitializeProcess().then(res => {
            this.generateEFTProcess(this.formValue);
          })
        }
      })
    })
    return promise;
  }

  reinitializeProcess() {
    let promise = new Promise((resolve, reject) => {
      if (this.apiResponse == 0) {
        this.exDialog.openConfirm(this.translate.instant('uft.toaster.reinitiateGenPayment')).subscribe((valueDeletePlan) => {
          if (valueDeletePlan) {
            this.fieldArray = []
            resolve();
          } else {
            this.fieldArray = []
            this.generateEFTButton.emit(true);
          }
        })
      } else {
        resolve();
      }
    })
    return promise
  }

  closeEftPdfPopup() {
    if (this.companyUpcomingErr == 'Process stopped due to company having PAP, but not bank account, Please fix them.') {
      this.update = {
        "id": 1,
        "done": "1",
        "step": "1",
        "processing": "Company Upcoming Transactions",
        "result": this.companyUpcomingErr
      }
      this.toastrService.error(this.translate.instant('uft.upcomingTransactionsSearch.toaster.processStopNotHavingBankAccount'));
    } else {
      this.eftSteps();
    }
  }
  //EFT Process Functions End
  /*Decimal Method for Transaction Amount Field */
  addDecimal(event, controlName) {
    if (event.target.value) {
      if (event.target.value.indexOf(".") == -1) {
        this.addOTPform.controls[controlName].patchValue(event.target.value + '.00');
      }
    }
  }

  /* Get the details of transactions using unitFinancialTransactionByKey api */
  getPaymentTypeList(key) {
    var currentDate = this.changeDateFormatService.getToday()
    var reqParam = [
      { 'key': 'coKey', 'value': (key) != null ? key : '' },
      { 'key': 'unitFinancialTransKey', 'value': (this.uftKey) != null ? this.uftKey : '' },
      { 'key': 'unitFinancialTransDt', 'value': this.changeDateFormatService.convertDateObjectToString(currentDate) },
      { 'key': 'tranCdKey', 'value': (this.transCdKey) != null ? this.transCdKey : '' }
    ]
    var url = UftApi.getUnitFinacialTransactionsByKeyUrl;
    var tableId = "dailyPapList"
    if (!$.fn.dataTable.isDataTable('#dailyPapList')) {
      var tableActions = [
      ]
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.paymentListColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, '', [1], '', [2, 5], [1, 3, 4], '')
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

}
