import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { UftApi } from '../../uft-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CompleterService, CompleterData } from 'ng2-completer';
import { TranslateService } from '@ngx-translate/core';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FinanceApi } from '../../../finance-module/finance-api';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CardApi } from '../../../card-module/card-api';
import { CompanyApi } from '../../../company-module/company-api';
import { BrokerApi } from '../../../company-module/broker-api';
import { ServiceProviderApi } from '../../../service-provider-module/service-provider-api';
import { ClaimService } from '../../../claim-module/claim.service';
import { ClaimApi } from '../../../claim-module/claim-api';
import { RequestOptions, Headers } from '@angular/http';
declare var jsPDF: any;

@Component({
  selector: 'app-pending-electronic-adjustment',
  templateUrl: './pending-electronic-adjustment.component.html',
  styleUrls: ['./pending-electronic-adjustment.component.css'],
  providers: [ClaimService]
})
export class PendingElectronicAdjustmentComponent implements OnInit {

  myDatePickerfilterOptions = CommonDatePickerOptions.myDatePickerFilterOptions;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  dateNameArray = {};
  observablePendingEcsAdjustedObj
  pendingElectronicAdjustmentColumns = []
  isSearch: boolean = false
  bankAccountDetailForm:FormGroup
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  blobUrl;
  showPageLoader: boolean = false;
  public payeeData: CompleterData
  // Payee Type List
  payeeList = [
    {'payeeTypeKey': 1, 'payeeTypeCd': "CH", 'payeeTypeDesc': "Cardholder"},
    {'payeeTypeKey': 2, 'payeeTypeCd': "C", 'payeeTypeDesc': "Company"},
    {'payeeTypeKey': 3, 'payeeTypeCd': "P", 'payeeTypeDesc': "Provider"},
    {'payeeTypeKey': 4, 'payeeTypeCd': "B", 'payeeTypeDesc': "Broker"},
  ]
  payee
  isOpen: boolean = false
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  bankDetailData = []
  buttonText:string;
  expired;
  editMode: boolean = false
  editBankKey = 0
  albertaBsnsType: boolean = false
  cardKey =  3994396 //- (CardId:8331001001)
  payeeType = "";
  companyKey = 32804
  isPayeeCardholder: boolean = false
  isPayeeProvider: boolean = false
  isPayeeCompany: boolean = false
  isPayeeBroker: boolean = false
  isPayeeOther: boolean = false
  commonKey;
  brokerId = "";
  clientDetail
  discKey;
  pdiscipline
  transNo
  bussinessType
  payTransKey
  chequeRefNo
  eftKey
  getForApi: boolean = true //declair for api
  getValue: boolean = false
  constructor(public dataTableService: DatatableService,
    public translate: TranslateService,
    private completerService: CompleterService,
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public currentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private claimService: ClaimService) {
    }

  ngOnInit() {
     // emit value for stop getPendingElectronicPayAdj api in finance dashboard
    this.dataTableService.showPendingAdEmitter.subscribe(value =>{
    this.getForApi = value;
      if (this.getForApi) {
        this.getValue = true;
        // To resolve issue of Data Management Dashboard tile
        this.dataTableInitializePendingElectronicAdjustment()
      //end
      }
    })
    this.bankAccountDetailForm = new FormGroup({
      'bankNumber': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(12), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'bankName': new FormControl('', [Validators.required, Validators.maxLength(60), CustomValidators.alphaNumericHyphen, CustomValidators.notEmpty]),
      'branch': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'account': new FormControl('', [Validators.required, Validators.minLength(7), Validators.maxLength(20), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl(''),
      'bankType': new FormControl('')
    });
    this.dtOptions['bankAccountDetailList'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]], }
    this.dtTrigger['bankAccountDetailList'] = new Subject();
    this.buttonText = 'Save' 
    this.payeeData = this.completerService.local(
      this.payeeList,
      "payeeTypeDesc",
      "payeeTypeDesc"
    );
  }

  ngAfterViewInit(): void {
    var self = this;
    $(document).on('click', '#pendingElectronicAdjustmentList .bank-ico', function (e) {
      e.preventDefault()
      var id = $(this).data('id')
      var tablerow = $(this).closest("tr")
      let payeeType = $(this).data('payee')
      let commonKey = $(this).data('pelpkey')
      let discipline = $(this).data('discipline')
      self.commonKey = commonKey
      self.payeeType = payeeType
      setTimeout(() => {
        if(!$(this).data("hasBDClicked")) {
          $(this).data("hasBDClicked", true);
          if (self.payeeType == "Cardholder") {
            self.isPayeeCardholder = true
            self.isPayeeProvider = false
            self.isPayeeCompany = false
            self.isPayeeBroker = false
            self.isPayeeOther = false
            self.getCardBankDetailsList()
            self.getBankPopup()
          } else if (self.payeeType == "Provider") {
            self.isPayeeCardholder = false
            self.isPayeeProvider = true
            self.isPayeeCompany = false
            self.isPayeeBroker = false
            self.isPayeeOther = false
            self.discKey = self.claimService.getDiscKey(discipline)
            self.getBanId(self.discKey)
          } else if (self.payeeType == "Company") {
            self.isPayeeCardholder = false
            self.isPayeeProvider = false
            self.isPayeeCompany = true
            self.isPayeeBroker = false
            self.isPayeeOther = false
            self.getCompanyBankDetailList()
            self.getBankPopup()
          } else if (self.payeeType == "Broker") {
            self.isPayeeCardholder = false
            self.isPayeeProvider = false
            self.isPayeeCompany = false
            self.isPayeeBroker = true
            self.isPayeeOther = false
            self.getBrokerBankDetailList()
            self.findBrokerByKey(self.commonKey)
            self.getBankPopup()
          } else {
            self.isPayeeCardholder = false
            self.isPayeeProvider = false
            self.isPayeeCompany = false
            self.isPayeeBroker = false
            self.isPayeeOther = true
          }
        }
      });
      $(this).data("hasBDClicked", false);
    })

    $(document).on('click', '#pendingElectronicAdjustmentList .view-ico', function() {
      let chqRefNo = $(this).data('id')
      window.open('/finance/payment-search?chqRefNo=' + chqRefNo, '_blank')
    })

    $(document).on('click', '#pendingElectronicAdjustmentList .download-ico', function() {
      let filePath = $(this).data('filepath')
      if (filePath != undefined && filePath != "") {
        window.open(filePath, '_blank');
      }
    })

    this.dtTrigger['bankAccountDetailList'].next()

    // Confirm Payment Icon functionality
    $(document).on('click', '#pendingElectronicAdjustmentList .confirmPay-ico', function (e) {
      e.preventDefault()
      var id = $(this).data('id')
      var tablerow = $(this).closest("tr")
      let payeeType = $(this).data('payee')
      let commonKey = $(this).data('pelpkey')
      let discipline = $(this).data('discipline')
      let pdiscipline = $(this).data('pdiscipline')
      let chequeRefNo = $(this).data('chequerefno')
      let bussinessType = $(this).data('businesstype')
      let payTransKey = $(this).data('paytranskey')
      let transNo = $(this).data('transno')
      let eftKey = $(this).data('eftkey')
      self.commonKey = commonKey
      self.payeeType = payeeType
      self.pdiscipline =  pdiscipline
      self.transNo = transNo
      self.bussinessType =  bussinessType
      self.payTransKey = payTransKey
      self.chequeRefNo = chequeRefNo
      self.eftKey = eftKey
      if (self.payeeType == "Cardholder") {
        self.getCardholderBankDetailForConfirmPayment()
      } else if (self.payeeType == "Provider") {
        self.discKey = self.claimService.getDiscKey(discipline)
        self.getServiceProviderBankDetailForConfirmPayment(self.discKey)
      } else if (self.payeeType == "Company") {
        self.getCompanyBankDetailForConfirmPayment()
      } else if (self.payeeType == "Broker") {
        self.getBrokerBankDetailForConfirmPayment()
      }
    })
  }

  dataTableInitializePendingElectronicAdjustment() {
    this.observablePendingEcsAdjustedObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        // coKey,coId,coName,gracePeriod,endOfGracePeriod,pendingFund,companyBalance,availFund
        this.pendingElectronicAdjustmentColumns = [
          { title: this.translate.instant('uft.dashboard.pendingElectronicAdjustment.paymentNumber'), data: 'chequeRefNo' },
          { title: this.translate.instant('uft.dashboard.pendingElectronicAdjustment.issuedDate'), data: 'issueDate' },
          { title: this.translate.instant('uft.dashboard.pendingElectronicAdjustment.transactionAmount'), data: 'transAmount' },
          // { title: this.translate.instant('uft.dashboard.pendingElectronicAdjustment.adminFee'), data: 'adminFee' },
          // { title: this.translate.instant('uft.dashboard.pendingElectronicAdjustment.debitAmount'), data: 'debitAmount' },
          { title: this.translate.instant('uft.dashboard.pendingElectronicAdjustment.payeeNumber'), data: 'payTo' },
          { title: this.translate.instant('uft.dashboard.pendingElectronicAdjustment.adjustmentDate'), data: 'cancelDate' },
          { title: this.translate.instant('uft.dashboard.pendingElectronicAdjustment.payee'), data: 'payee'},
          { title: this.translate.instant('uft.dashboard.terminationRefunds.action'), data: 'chequeRefNo' }
        ]
        if(this.getValue){
        this.getPendingElectronicAdjustmentList()
        }
        this.observablePendingEcsAdjustedObj.unsubscribe();
      }
    });
  }

  // Get Pending Electronic Adjustment List
  getPendingElectronicAdjustmentList() {
    let todaydate = this.changeDateFormatService.getToday();
    let pendingEcsPaymentAdjRequest = [
      { 'key': 'chequeRefNo', 'value': '' }, // -1, 19109
      { 'key': 'issueDate', 'value': '' },
      { 'key': 'transAmount', 'value': '' },
      // { 'key': 'adminFee', 'value': '' },  //  remove admin fee and debit amount column and add payee number column discuss by Arun sir
      // { 'key': 'debitAmount', 'value': '' },
      { 'key': 'payTo', 'value': '' },
      { 'key': 'adjustmentDate', 'value': '' },
    ]
    let tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': '' },
      { 'name': 'BD', 'class': 'table-action-btn green-btn bank-ico', 'title': this.translate.instant('Bank Details'), 'showAction': '' },
      { 'name': 'PA', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Payment Attachment', 'showAction': '' },
      { 'name': 'CP', 'class': 'table-action-btn green-btn confirmPay-ico', 'title': this.translate.instant('Confirm Payment'), 'showAction': '' },
    ]
    let url = UftApi.getPendingElectronicPayAdjUrl
    let tableId = "pendingElectronicAdjustmentList"
    if (!$.fn.dataTable.isDataTable('#pendingElectronicAdjustmentList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.pendingElectronicAdjustmentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', pendingEcsPaymentAdjRequest, tableActions, [6], [1, 4], '', [2], [1, 2, 3, 4,5, 6])
    } else {
      if (this.isSearch) {
        this.pendingEcsPaymentAdjustmentSearch()
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, pendingEcsPaymentAdjRequest)
      }
      this.getValue = false;
    }
    return false;
  }

  /* Pending Electronic Payment Adjustment Search functionality */
  pendingEcsPaymentAdjustmentSearch(tableId = null) {
    this.isSearch = true
    let pendingPaymentAdjustmentUrl = UftApi.getPendingElectronicPayAdjUrl;
    let dateParams = [1, 5];
    let pendingPaymentAdjustmentParam = this.dataTableService.getFooterParams("pendingElectronicAdjustmentList")
    this.dataTableService.jqueryDataTableReload("pendingElectronicAdjustmentList", pendingPaymentAdjustmentUrl, pendingPaymentAdjustmentParam, dateParams)
  }

  /* Pending Electronic Payment Adjustment Reset functionality */
  resetPendingEcsPaymentAdjustmentList(tableId) {
    this.dataTableService.resetTableSearch();
    this.pendingEcsPaymentAdjustmentSearch();
    this.isSearch = false
  }

  changeDateFormatFooter(event, frmControlName) {
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

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.bankAccountDetailForm.patchValue(datePickerValue)
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
      this.bankAccountDetailForm.patchValue(datePickerValue);
    }
    if (event.reason == 2) {
      if (formName == 'bankAccountDetailForm') {
        this.bankAccountDetailForm.patchValue(datePickerValue);
      }
    }
  }

  getBankPopup() {
    this.hmsDataService.OpenCloseModal('openPaymentBankAccount')
  }

  getBankName() {
    var url = UftApi.getBankDetailsUrl
    let reqData = {
      "bankNum": this.bankAccountDetailForm.value.bankNumber,
      "branchNum": this.bankAccountDetailForm.value.branch
    }
    if (this.bankAccountDetailForm.value.bankNumber && this.bankAccountDetailForm.value.branch) {
      this.hmsDataService.postApi(url, reqData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.bankAccountDetailForm.patchValue({
            'bankName': (data.result[0].bankName) ? (data.result[0].bankName).trim() : ''
          })
        } else {
          this.bankAccountDetailForm.patchValue({
            'bankName': ''
          })
        }
      })
    }
  }

  submitBankDetail(bankAccountDetailForm) {
    if (this.bankAccountDetailForm.valid) {
      let submitData = {}
      let uniqueKey
      if (this.editMode) {
        uniqueKey = this.editBankKey
      } else {
        uniqueKey = 0
      }
      if (this.payeeType == "Cardholder") {
        submitData = {
          "cardKey": this.commonKey,
          "cardBankAcctKey": uniqueKey,
          "cardBankNum": this.bankAccountDetailForm.value.bankNumber,
          "cardBankBranchNum": this.bankAccountDetailForm.value.branch,
          "cardBankAccountNum": this.bankAccountDetailForm.value.account,
          "bankName": this.bankAccountDetailForm.value.bankName,
          "cardBaEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.effectiveOn),
          "cardExpiredOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.expiredOn),
        }
      } else if (this.payeeType == "Provider") {
        submitData = {
          "provBillingAddressKey": this.clientDetail.provBillingAddressKey,
          "disciplineKey": this.clientDetail.disciplineKey,
          "banId": this.clientDetail.banId,
          "banClientName": this.clientDetail.banClientName,
          "effectiveOn": (this.clientDetail.effectiveOn != null && this.clientDetail.effectiveOn != undefined) ? this.clientDetail.effectiveOn : "",
          "expiredOn": (this.clientDetail.expiredOn != null && this.clientDetail.expiredOn != undefined) ? this.clientDetail.expiredOn : "",
          "banComm": this.clientDetail.banComm,
          "userId": +(this.currentUserService.currentUser.userId),
          "bankList": [{
            "provBankAcctKey": uniqueKey,
            "provBankAcctNum": this.bankAccountDetailForm.value.account,
            "provBankBranchNum": this.bankAccountDetailForm.value.branch,
            "provBankNum": this.bankAccountDetailForm.value.bankNumber,
            "bankName": this.bankAccountDetailForm.value.bankName,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.effectiveOn),
            "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.expiredOn),
          }]
        }
      } else if (this.payeeType == "Company") {
        submitData = {
          "companyKey": this.commonKey,
          "coBankAccountKey": uniqueKey != 0 ? uniqueKey : null,
          "coBankAccountNum":  this.bankAccountDetailForm.value.account,
          "coBankBranchNum": this.bankAccountDetailForm.value.branch,
          "coBankNum": this.bankAccountDetailForm.value.bankNumber,
          "coBankName": this.bankAccountDetailForm.value.bankName,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.effectiveOn),
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.expiredOn),
        }
        // return
      } else if (this.payeeType == "Broker") {
        if (this.editBankKey != 0) {
          submitData = {
            "brokerBankAccKey": this.editBankKey,
            "brokerId": this.brokerId,
            "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.expiredOn)
          }
        } else {
          submitData = {
            "brokerId": this.brokerId,
            "brokerBankName": this.bankAccountDetailForm.value.bankName,
            "brokerBankNum": this.bankAccountDetailForm.value.bankNumber,
            "brokerBankBranchNum": this.bankAccountDetailForm.value.branch,
            "brokerBankAccNum": this.bankAccountDetailForm.value.account,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.effectiveOn),
            "expiredOn": this.bankAccountDetailForm.value.expiredOn != "" ? this.changeDateFormatService.convertDateObjectToString(this.bankAccountDetailForm.value.expiredOn) : "",
          }
        }
      } else {
        this.toastrService.warning("Other Bank Functionality Has To Be Implemented!!")
        return
      }
      if (this.buttonText != "Update" && this.bankDetailData.length > 0) {
        this.exDialog.openConfirm(this.translate.instant('card.exDialog.save-newbankAcc')).subscribe((value) => {
          if (value) {
            this.saveBankAccount(submitData)
          }
        });
      } else {
        this.saveBankAccount(submitData)
      }
    } else {
      this.validateAllFormFields(this.bankAccountDetailForm);
    }
  }

  resetBankDetail() {
    this.bankAccountDetailForm.reset()
    this.buttonText = this.translate.instant('button.save')
    this.editMode = false
    this.bankDetailData = []
    this.reloadTable('bankAccountDetailList')
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  // Excel button functionality
  exportPendingElectronicPaymentAdjustmentList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    if (this.dataTableService.totalRecords != undefined) {
      var URL = UftApi.pendingELPayAdjRptUrl; //(02-Jun-2022)
      var reqParam
      if (this.isSearch) {
        var params = this.dataTableService.getFooterParams("pendingElectronicAdjustmentList")
        reqParam = {"start": 0, "length": this.dataTableService.totalRecords, "chequeRefNo": params[0].value, "issueDate": params[1].value, "transAmount": params[2].value, "payTo": params[3].value, "cancelDate": params[4].value, 'paramApplication': paramApp }
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
            this.exportFile(URL, reqParam);
          }
        });
      } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
        this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
          if (value) {
            this.exportFile(URL, reqParam);
          }
        });
      } else {
        this.exportFile(URL, reqParam);
      }
    } else {
      this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
    }
  }

  exportFile(URL, reqParamPlan) {
    this.showPageLoader = false
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
          var fileName = "Pending-Electronic-Payment-Adjustment"
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

  downloadPEPAReport() {
    this.showPageLoader = true;
    var reportTitle = 'Pending Electronic Payment Adjustment'
    var requestParam = {};
    if (this.isSearch) {
      var params = this.dataTableService.getFooterParams("pendingElectronicAdjustmentList")
      requestParam = {"start": 0, "length": this.dataTableService.totalRecords, "chequeRefNo": params[0].value, "issueDate": params[1].value, "transAmount": params[2].value, "payTo": params[3].value, "cancelDate": params[4].value }
    } else {
      requestParam = {
        'start': 0,
        'length': this.dataTableService.totalRecords
      }
    }
    /** End Narrow Search */
    var url = UftApi.getPendingElectronicPayAdjUrl;
    /** End Narrow Search */
    this.hmsDataService.postApi(url, requestParam).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        var doc = new jsPDF('p', 'pt', 'a3');
        var columns = [
          { title: 'Payment Number', dataKey: 'chequeRefNo' },
          { title: 'Issued Date', dataKey: 'issueDate' },
          { title: 'Transaction Amount', dataKey: 'transAmount' },
          // { title: 'Admin Fee', dataKey: 'adminFee' },  //  remove admin fee and debit amount column and add payee number column discuss by Arun sir
          // { title: 'Debit Amount', dataKey: 'debitAmount' },
          { title: 'Payee Number', dataKey: 'payTo' },
          { title: 'Adjustment Date', dataKey: 'cancelDate' }
        ];
        this.showPageLoader = false;
        var rows = data.result.data;
        /** Start */
        var head = [];
        var body = [];
        var total = 0;
        let claimPaymentsByCardholderArray = [];
        for (var i in rows) {
          body.push({
            "chequeRefNo": rows[i].chequeRefNo,
            "issueDate": rows[i].issueDate != null ? this.changeDateFormatService.changeDateByMonthName(rows[i].issueDate) : '', 
            "transAmount": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].transAmount),
            // "adminFee": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].adminFee),
            // "debitAmount": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].debitAmount),
            "payTo": rows[i].payTo,
            "cancelDate": rows[i].cancelDate != null ? this.changeDateFormatService.changeDateByMonthName(rows[i].cancelDate) : ''
          });
        }

        let date = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '');
        //Start Header
        var headerobject = [];
        headerobject.push({
          'gridHeader1': reportTitle,
          'text5Date': date
        });
        this.pdfHeader(doc, headerobject);
        //End Header 
        doc.autoTable(columns, body, {
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          columnStyles: {
            "chequeRefNo": { halign: 'left' },
            "issueDate": { halign: 'right' },
            "transAmount": { halign: 'right' },
            // "adminFee": { halign: 'right' },
            // "debitAmount": { halign: 'right' },
            "payTo": { halign: 'right' },   // alignment in right set for payee number
            "cancelDate": { halign: 'right' }
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

        this.pdfFooter(doc);
        doc.save(reportTitle.replace(/\s+/g, '_') + '.pdf');
      } else if (data.code == 404 && data.status == 'NOT_FOUND') {
        this.showPageLoader = false;
        this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    });
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

  pdfFooter(doc) {
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

  getCardBankDetailsList() {
    var self = this
    let requiredInfo = {
      "cardKey": this.commonKey
    }
    this.hmsDataService.postApi(CardApi.getCardBankAccountHistory, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.bankDetailData = []
        this.bankDetailData = data.result
        var dateCols = ['cardBaEffectiveOn', 'cardExpiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
        this.reloadTable('bankAccountDetailList')
      } else {
        this.bankDetailData = []
      }
    },(error) => {
      this.bankDetailData = []
    })
  }

  setBankAccountForm(dataRow) {
    this.editMode = true
    if (this.isPayeeCardholder) {
      if (dataRow.cardBankAcctKey) {
        this.editBankKey = dataRow.cardBankAcctKey
      } else {
        this.editBankKey = 0
      }
      let cardBankAccountDetails = {
        bankNumber: dataRow.cardBankNum,
        branch: dataRow.cardBankBranchNum,
        account: dataRow.cardBankAccountNum,
        bankName: dataRow.bankName,
        effectiveOn: this.changeDateFormatService.convertStringDateToObject(dataRow.cardBaEffectiveOn),
        expiredOn: this.changeDateFormatService.convertStringDateToObject(dataRow.cardExpiredOn)
      }
      this.bankAccountDetailForm.patchValue(cardBankAccountDetails);
      this.expired=this.changeDateFormatService.isFutureNonFormatDate(dataRow.cardExpiredOn);
    } else if (this.isPayeeCompany) {
      if (dataRow.coBankAccountKey) {
        this.editBankKey = dataRow.coBankAccountKey
      } else {
        this.editBankKey = 0
      }
      let companyBankAccountDetails = {
        bankNumber: dataRow.coBankNum,
        branch: dataRow.coBankBranchNum,
        account: dataRow.coBankAccountNum,
        bankName: dataRow.coBankName,
        effectiveOn: this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn),
        expiredOn: this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn)
      }
      this.bankAccountDetailForm.patchValue(companyBankAccountDetails);
      this.expired=this.changeDateFormatService.isFutureNonFormatDate(dataRow.expiredOn);
    } else if (this.isPayeeBroker) {
      if (dataRow.brokerBankAccountKey) {
        this.editBankKey = dataRow.brokerBankAccountKey
      } else {
        this.editBankKey = 0
      }
      let brokerBankAccountDetails = {
        bankNumber: dataRow.brokerBankNum,
        branch: dataRow.brokerBankBranchNum,
        account: dataRow.brokerBankAccNum,
        bankName: dataRow.brokerBankName,
        effectiveOn: dataRow.effectiveOn != "null" ? this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn) : "",
        expiredOn: dataRow.expiredOn != "null" ? this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn) : ""
      }
      this.bankAccountDetailForm.patchValue(brokerBankAccountDetails);
      this.expired=this.changeDateFormatService.isFutureNonFormatDate(dataRow.expiredOn);
    } else if (this.isPayeeProvider) {
      if (dataRow.provBankAcctKey) {
        this.editBankKey = dataRow.provBankAcctKey
      } else {
        this.editBankKey = 0
      }
      let providerBankAccountDetails = {
        bankNumber: dataRow.provBankNum,
        branch: dataRow.provBankBranchNum,
        account: dataRow.provBankAcctNum,
        bankName: dataRow.bankName,
        effectiveOn: dataRow.effectiveOn != "null" ? this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn) : "",
        expiredOn: dataRow.expiredOn != "null" ? this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn) : ""
      }
      this.bankAccountDetailForm.patchValue(providerBankAccountDetails);
      this.expired=this.changeDateFormatService.isFutureNonFormatDate(dataRow.expiredOn);
    }
    this.buttonText = this.translate.instant('button.update');
  }

  reloadTable(tableID) {
    this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
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

  removeValidation(value, formType, validateForm) {
    let formFields = []
    let formName
    if (formType == "cardBankAccountPopup") {
      formFields = ['bankNumber', 'branch', 'account', 'bankName', 'effectiveOn']
      formName = this.bankAccountDetailForm
    }
    if (validateForm && formType == "bankAccountDetailForm") {
      this.popValidation()
    } else {
      formFields.forEach(value => {
        formName.get(value).clearValidators()
      })
    }
    formFields.forEach(data => {
      formName.get(data).updateValueAndValidity();
    })
  }

  popValidation() {
    this.bankAccountDetailForm.get('bankNumber').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(12), Validators.minLength(3)]);
    this.bankAccountDetailForm.get('branch').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(10), Validators.minLength(5)]);
    this.bankAccountDetailForm.get('account').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(12), Validators.minLength(7)]);
    this.bankAccountDetailForm.get('bankName').setValidators([Validators.required, Validators.maxLength(60), CustomValidators.alphaNumericHyphen]);
    this.bankAccountDetailForm.get('effectiveOn').setValidators([Validators.required,]);
  }

  saveBankAccount(submitData) {
    if (this.isPayeeCardholder) {
      this.hmsDataService.putApi(CardApi.saveCardBankAccountUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.toastrService.success(this.translate.instant('card.toaster.bank-save'));
          this.getCardBankDetailsList()
          this.resetBankDetail()
          // this.hmsDataService.OpenCloseModal('closePaymentBnakAccountDetail')
        } else if (data.code == 400 && data.hmsMessage.messageShort == "FIRST_EXPIRED_OLD_ONE_RECORD") {
          this.toastrService.error("Please Expire Old Record First!!");
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "BANK_ACCOUNT_ALREADY_USED") {
          this.toastrService.error(this.translate.instant('card.toaster.bank-detail-use-err'));
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
          this.toastrService.error(this.translate.instant('card.toaster.bank-date-err'));
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIREDON") {
          this.toastrService.error(this.translate.instant('card.toaster.bank-date-err-expiry'));
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
          this.toastrService.error(this.translate.instant('card.toaster.bank-date-err-expiry'));
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVE_ON_CONNOT_BE_BEFORE_PREVIOUS_CREATED_ON") {
          this.toastrService.error("Expiry Date Should Be Greater Than Created On") //Today/Created(9_oct)
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "CARD_BANK_EXPIRED_ON_SHOULD_BE_GREATER_CARD_BANK_CREATED_DATE") {
          this.toastrService.error(this.translate.instant('card.toaster.bank-crd-effct'));
        }
      })
    } else if (this.isPayeeCompany) {
      this.hmsDataService.post(CompanyApi.saveCompanyBankAccountUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          this.toastrService.success(this.translate.instant('company.toaster.bankDetailsUpdated'));
          this.getCompanyBankDetailList()
          this.resetBankDetail()
          // this.hmsDataService.OpenCloseModal('closePaymentBnakAccountDetail')
        } else if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_EFFECTIVEON') {
          this.toastrService.error(this.translate.instant('company.toaster.expiryDateGreaterThanEffective'));
          return false;
        } else if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_NOW_DATE') {
          this.toastrService.error(this.translate.instant('company.toaster.expiryDateGreaterThanCurrent'));
          return false;
        } else if (data.code == 400 && data.message == 'COMPANY_BANK_ACCOUNT_ALREADY_EXIST') {
          this.toastrService.error(this.translate.instant('company.toaster.companyBankAccAlreadyExists'));
          return false;
        } else if (data.code == 400 && data.message == 'EXPIREDON_REQIURED') {
          this.toastrService.error(this.translate.instant('company.toaster.expiryDateRequired'));
          return false;
        } else if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_THAN_CREATED_ON') {
          this.toastrService.error(this.translate.instant('company.toaster.expiryDateGreaterThanCreatedOn'));
          return false;
        } else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
          this.toastrService.error(this.translate.instant('card.toaster.bank-date-err'));
        }
      });
    } else if (this.isPayeeBroker) {
      this.hmsDataService.post(BrokerApi.addbrokerBankAccountUrl, submitData).subscribe(data => {
        if (data.code == 200) {
          this.toastrService.success(this.translate.instant('company.toaster.bankAccDetailsSaved'));
          this.getBrokerBankDetailList()
          this.resetBankDetail()
          // this.hmsDataService.OpenCloseModal('closePaymentBnakAccountDetail')
        } else if (data.code == 400 && data.hmsShortMessage == "BROKER_BANK_ACCOUNT_ALREADY_EXIST") {
          this.toastrService.error(this.translate.instant('company.toaster.bankAccExist'));
        } else if (data.code == 400 && data.hmsShortMessage == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
          this.toastrService.error(this.translate.instant('company.toaster.effectiveDateGreaterThanPreviousEffective'));
        } else if (data.code == 400 && data.hmsShortMessage == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
          this.toastrService.error(this.translate.instant('company.toaster.expiryDateGreaterThanCurrent'));
          return;
        }
      });
    } else if (this.isPayeeProvider) {
      this.hmsDataService.postApi(ServiceProviderApi.saveAndUpdateServiceProviderBanUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.toastrService.success(this.translate.instant('company.toaster.bankAccDetailsSaved'));
          this.getProviderBankDetailList(data.result.banId, data.result.disciplineKey)
          this.resetBankDetail()
          // this.hmsDataService.OpenCloseModal('closePaymentBnakAccountDetail')
        } else if (data.code == 400 && data.message == 'BANK_EFFECTIVE_DATE_GREATER_OR_EQUAL_FROM_NOW_DATE') {
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-greater-than-today'));
        }
        else if (data.code == 400 && data.message == "BANK_ACCOUNT_ALREADY_USED") {
          this.toastrService.error(this.translate.instant('serviceProvider.toaster.bank-account'));
        }
        else if (data.code == 400 && data.message == 'BAN_NUMBER_ALREADY_ASSOCIATED') {
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.ban-number-association'));
        }
        else if (data.code == 400 && data.message == 'BAN_NUMBER_ALREADY_ASSOCIATED') {
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.ban-number-association'));
        }
        else if (data.code == 400 && data.message == 'BANK_EFFECTIVEON_SHOULD_BE_GREATER_BAN_EFFECTIVEON') {
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.ban-less-than-bank'));
        }
        else if (data.code == 400 && data.message == 'EXPIRED_ON_SHOULDBE_EQUAL_OR_GREATER_THAN_TO_CREATEDON_DATE') {
          this.toastrService.error(this.translate.instant('serviceProvider.toaster.ban-created-date'));
        } else {
          this.toastrService.error("Provider Bank Detail Not Saved!")
        }
        error => {
        }
      })
    }
  }

  getCompanyBankDetailList() {
    var self = this
    let requiredInfo = {
      "coKey": this.commonKey
    }
    this.hmsDataService.postApi(CompanyApi.getCompanyBankAccountHistoryUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.bankDetailData = []
        this.bankDetailData = data.result.data
        var dateCols = ['effectiveOn', 'expiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result.data);
        this.reloadTable('bankAccountDetailList')
      } else {
        this.bankDetailData = []
      }
    },(error) => {
      this.bankDetailData = []
    })
  }

  getBrokerBankDetailList() {
    let requiredInfo = {
      "brokerKey": this.commonKey
    }
    this.hmsDataService.postApi(BrokerApi.getBrokerBankAccountUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.bankDetailData = []
        this.bankDetailData = data.result.data
        var dateCols = ['effectiveOn', 'expiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result.data);
        this.reloadTable('bankAccountDetailList')
      } else {
        this.bankDetailData = []
      }
    },(error) => {
      this.bankDetailData = []
    })
  }

  findBrokerByKey(key: any) {
    this.hmsDataService.get(BrokerApi.getBrokerByKeyUrl + "/" + key).subscribe(data => {
      if (data.code == 302 && data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
        this.brokerId = data.result.brokerId
      } else {
        this.brokerId = ""
      }
    });
  }

  getBanId(discKey) {
    let req = {
      "provBillingAddressKey": this.commonKey, //24823,
      "disciplineKey": discKey
    }
    this.hmsDataService.postApi(ClaimApi.getBanUrl, req).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result.banId) {
          this.getBankPopup()
          this.getProviderBankDetailList(data.result.banId, discKey)
        }
      } else if (data.code == 400 && data.hmsMessage.messageShort == "NO_BAN_NUMBER_ASSOCIATED") {
        this.toastrService.error("No Ban Number Associated!")
      } else {
        this.toastrService.error("No Record Found!")
      }
    })
  }

  getProviderBankDetailList(banId, discKey) {
    let request = {
      "banId": banId,
      "disciplineKey": discKey
    }
    this.hmsDataService.postApi(ServiceProviderApi.getServiceProviderBanDetailUrl, request).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.bankDetailData = []
        this.bankDetailData = data.result.bankList
        this.clientDetail = data.result
        var dateCols = ['effectiveOn', 'expiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result.bankList);
        this.reloadTable('bankAccountDetailList')
      } else {
        this.bankDetailData = []
      }
    },(error) => { 
      this.bankDetailData = []
    })
  }

  // For test
  // Get Provider Bank Detail List for Confirm Payment
  getServiceProviderBankDetailForConfirmPayment(discKey) {
    let req = {
      "provBillingAddressKey": this.commonKey,
      "disciplineKey": discKey
    }
    this.hmsDataService.postApi(ClaimApi.getBanUrl, req).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result.banId) {
          let request = {
            "banId": data.result.banId,
            "disciplineKey": discKey
          }
          this.hmsDataService.postApi(ServiceProviderApi.getServiceProviderBanDetailUrl, request).subscribe(data => {
            if (data.code == 200 && data.status == "OK") {
              data.result.bankList
              let isFutureDate = this.changeDateFormatService.isFutureDate(data.result.bankList[0].expiredOn)
              if (isFutureDate) {
                this.savePaymentMethodCommon()
              } else {
                this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))                
              }
            } else {
              this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))
            }
            error => {
            }
          })
        }
      } else if (data.code == 400 && data.hmsMessage.messageShort == "NO_BAN_NUMBER_ASSOCIATED") {
        this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))
      }
    })
  }

  // Common Save Payment Method for All Payee Type
  savePaymentMethodCommon() {
    this.showPageLoader = true
    var requestData = new FormData()
    let header = new Headers({ 'Authorization': this.currentUserService.token });
    let options = new RequestOptions({ headers: header });
    requestData.append('pdiscipline', this.pdiscipline)
    requestData.append('transNo', this.transNo);
    requestData.append('payee', this.payeeType)
    requestData.append('sbusType', this.bussinessType)
    requestData.append('adjType', 'RP')
    requestData.append('transStatus', 'Cashed')
    requestData.append('eftAdjBankInd', 'T')
    //FinanceApi.reissuePaymentTransUrl removed in below and pendingELPayTrans API integrated
    this.hmsDataService.sendFormData(FinanceApi.pendingELPayTransUrl, requestData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showPageLoader = false
        this.toastrService.success("Payment" +" "+ this.translate.instant('uft.toaster.savedSuccess'));
        // Calling Broker API as per Payment Search screen
        if (this.payeeType == "Broker" || this.payeeType == "BROKER") {
          this.getBrokerReissuePaymentService()
        }
        this.getPendingElectronicAdjustmentList()
      } else if (data.code == 400 && data.status == "BAD_REQUEST") {
        this.showPageLoader = false
        this.toastrService.error("Payment" +" "+ this.translate.instant('uft.toaster.notSaved'))
      } else if (data.code == 400 && data.hmsMessage.messageShort == "RECORD_SAVE_FAILED") {
        this.showPageLoader = false
        this.toastrService.error("Payment" +" "+ this.translate.instant('uft.toaster.notSaved'))
      } else {
        this.showPageLoader = false
        this.toastrService.error("Payment" +" "+ this.translate.instant('uft.toaster.notSaved'))
      }
    });
  }

  // Get Cardholder Bank Detail List for Confirm Payment
  getCardholderBankDetailForConfirmPayment() {
    let request = {
      "cardKey": this.commonKey
    }
    this.hmsDataService.postApi(CardApi.getCardBankAccountHistory, request).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result && data.result.length > 0) {
          this.savePaymentMethodCommon()
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))           
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))
      }
      error => {
      }
    })
  }

  // Get Company Bank Detail List for Confirm Payment
  getCompanyBankDetailForConfirmPayment() {
    let reqInfo = {
      "coKey": this.commonKey
    }
    this.hmsDataService.postApi(CompanyApi.getCompanyBankAccountHistoryUrl, reqInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result.data && data.result.data.length > 0) {
          this.savePaymentMethodCommon()
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))           
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))
      }
      error => {
      }
    })
  }

  // Get Broker Bank Detail List for Confirm Payment
  getBrokerBankDetailForConfirmPayment() {
    let brokerReq = {
      "brokerKey": this.commonKey
    }
    this.hmsDataService.postApi(BrokerApi.getBrokerBankAccountUrl, brokerReq).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (data.result.data && data.result.data.length > 0) {
          this.savePaymentMethodCommon()
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))  
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.noBankInfoAvailToConfirmPayment'))
      }
      error => {
      }
    })
  }

  // brokerReissuePayment API integration in case of payeeType Broker
  getBrokerReissuePaymentService() {
    let request = {
      "transStatus": 'Cashed',
      "chequeRefNo": this.chequeRefNo,
      "eftKey": this.eftKey,
      "transNo": this.transNo
    }
    this.hmsDataService.postApi(FinanceApi.brokerReissuePaymentUrl, request).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
      } else if (data.code == 400 && data.status == "BAD_REQUEST") {
      } else {
      }
    })
  }

}
