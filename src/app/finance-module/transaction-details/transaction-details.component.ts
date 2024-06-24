import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormControlName, Validators } from '@angular/forms';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { FeeGuideApi } from '../../fee-guide-module/fee-guide-api'
import { FinanceApi } from '../finance-api';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { FinanceService } from '../finance.service'
import { ClaimService } from '../../claim-module/claim.service';


@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.css'],
  providers: [ChangeDateFormatService, DatatableService, ClaimService]
})
export class TransactionDetailsComponent implements OnInit {
  backToSearchClicked: boolean = false;
  companySearchBtn: boolean = false

  reqParamClaimAttach
  selectedPlanTypeValue: any;
  planTypeListData;
  planTypeList: { 'key': string; 'value': string; }[];
  viewtransMode: boolean;
  planKeyValue: any;
  payeecd: any;
  disciplines: any;
  transactionDiscipline: any;
  paymentKey: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  transactionDetailsForm: FormGroup;
  unattachedClaimsForm: FormGroup;
  columns = [];
  unattachedColumns = [];
  error: any;
  input = '<input id="selectAll" type="checkbox">';
  observableObj;
  check = true
  transactionKey: any
  transactionId: any
  transactionData: any
  isDisable: boolean = false
  isUnattachedClaim: boolean = false
  public cardHolderGenderData: CompleterData;
  selectedRowData
  public isOpen: boolean = false;
  addNameLabel: string;
  claimKey: any;
  cardId: any;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  currentUser
  constructor(private dataTableService: DatatableService,
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
    private hmsDataService: HmsDataServiceService,
    private claimService: ClaimService) {
    this.error = { isError: false, errorMessage: '' }
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
    this.transactionDetailsForm = new FormGroup({
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

    this.unattachedClaimsForm = new FormGroup({
      'dental': new FormControl(''),
      'vision': new FormControl(''),
      'health': new FormControl(''),
      'drug': new FormControl(''),
      'supplement': new FormControl(''),
      'provider': new FormControl(''),
      'cardholder': new FormControl(''),
      'other': new FormControl(''),
      'planType': new FormControl(''),
      'confirmation': new FormControl(''),
      'company': new FormControl(''),
    })

    if (this.FinanceService.isBackCompanySearch) {
      this.companySearchBtn = this.FinanceService.isBackCompanySearch
    }
    else {
      this.companySearchBtn = false
    }

    this.route.queryParams.subscribe((params: Params) => {
      if (params['paymentKey'] && params['discipline']) {
        this.transactionDiscipline = params['discipline'];
        this.paymentKey = params['paymentKey'];
        this.viewTransactionDetails(this.transactionDiscipline, this.paymentKey);
        this.dataTableIntailize(this.transactionDiscipline, this.paymentKey)
      } else {
        let transactionDiscipline = params['disc']
        let paymentKey = params['dcp']
        this.viewTransactionDetails(transactionDiscipline, paymentKey);
        this.dataTableIntailize(transactionDiscipline, paymentKey)
      }
    });
    let self = this
    $(document).on('click', '#claimsAttachedToTransactionList a', function () {
      self.isDisable = false
      $('#claimsAttachedToTransactionList td').removeClass('highlightedRow');  //Comment this for Issue:469
    })
    $(document).on('click', '#claimsAttachedToTransactionList tr', function () {
      self.selectedRowData = self.dataTableService.selectedRowClaimsattachedToTrans
      if (self.dataTableService.selectedRowClaimsattachedToTrans.claimStatus == 'Pending') {
        self.isDisable = true
      } else {
        self.isDisable = false
      }
    })
  }

  ngAfterViewInit() { 
    var self = this
    $(document).on('click', '#claimsAttachedToTransactionList .view-ico', function () {
      let discipline = $(this).data('discipline')
      let claimKey = $(this).data('id')
      let disciplineKey = self.claimService.getDiscKey(discipline)
      setTimeout(() => {
        self._router.navigate(["/claim/view/" + claimKey + "/type/" + disciplineKey]);
      }, 500);
    })
    
    $(document).on('mouseover', '#claimsAttachedToTransactionList .view-ico', function () {
      $(this).attr('title', 'View');
    })
  }

  dataTableIntailize(transactionDiscipline, paymentKey) {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check == true) {
        if (this.translate.instant('finance.transactionDetails.discipline') == 'finance.transactionDetails.discipline') {
        } else {
          this.columns = [
            { title: this.translate.instant('finance.transactionDetails.confirmNo'), data: 'confirmId' },
            { title: this.translate.instant('finance.transactionDetails.cardID'), data: 'cardId' },
            { title: this.translate.instant('finance.transactionDetails.receivedDate'), data: 'receiveDate' },
            { title: this.translate.instant('finance.transactionDetails.cardholder'), data: 'cardHolder' },
            { title: this.translate.instant('finance.transactionDetails.totalPaid'), data: 'totalPaid' },
            { title: this.translate.instant('finance.transactionDetails.provider'), data: 'provider' },
            { title: this.translate.instant('finance.transactionDetails.providerName'), data: 'providerName' },
            { title: this.translate.instant('finance.transactionDetails.billingAddress'), data: 'billingAddress' },
            { title: this.translate.instant('finance.transactionDetails.claimStatus'), data: 'claimStatus' },
            { title: this.translate.instant('finance.transactionDetails.operatorID'), data: 'operatorId' },
            { title: this.translate.instant('common.action'), data: 'claimKey' }
          ]
          this.getclaimsAttachedToTransactionList(transactionDiscipline, paymentKey)
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
  }
  resetTableSearch(val) {
    if (val == 'unAttachedClaims') {
      switch (this.disciplines) {
        case 'Dental':
          this.unattachedClaimsForm.controls['dental'].setValue(true)
          break;
        case 'Vision':
          this.unattachedClaimsForm.controls['vision'].setValue(true)
          break;
        case 'Drug':
          this.unattachedClaimsForm.controls['drug'].setValue(true)
          break;
        case 'HSA':
          this.unattachedClaimsForm.controls['supplement'].setValue(true)
          break;
        case 'Health':
          this.unattachedClaimsForm.controls['health'].setValue(true)
          break;
      }

      switch (this.payeecd) {
        case 'D':
          this.unattachedClaimsForm.controls['provider'].setValue(true)
          break;
        case 'C':
          this.unattachedClaimsForm.controls['cardholder'].setValue(true)
          break;
        case 'O':
          this.unattachedClaimsForm.controls['other'].setValue(true)
          break;
      }
      this.isUnattachedClaim = false
      this.unattachedClaimsForm.disable();
      this.unattachedClaimsForm.controls['planType'].enable();
      this.unattachedClaimsForm.controls['confirmation'].enable();
      this.unattachedClaimsForm.controls['company'].enable();

      this.planTypeList = [
        { 'key': 'M', 'value': 'Male' },
        { 'key': 'F', 'value': 'Female' },
        { 'key': 'O', 'value': 'Other' },
      ]
      this.planTypeListData = this.completerService.local(
        this.currentUser.businessType,
        "businessTypeDesc",
        "businessTypeDesc"
      );
    }

  }
  // Method for Get the claims Attached Transaction List in Grid
  getclaimsAttachedToTransactionList(pdiscipline, paymentKey) {
    let chequeClaim = [
      { 'key': 'pdiscipline', 'value': pdiscipline },
      { 'key': 'paymentKey', 'value': paymentKey },
    ];
    var Url = FinanceApi.getPaymentDetailBasedOnPaymentKey
    var tableId = "claimsAttachedToTransactionList"
    let tableAction = [{ 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' }]
    if (!$.fn.dataTable.isDataTable('#claimsAttachedToTransactionList')) {
      this.dataTableService.jqueryDataTableclaimsAttachedToTransaction(tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', '', [0, 'asc'], '', chequeClaim, tableAction, [10], [2], '', [4],[1,2,3,5,6,7,8,9])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, chequeClaim)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  viewTransactionDetails(transactionDiscipline, paymentKey) {
    this.viewtransMode = true;
    this.transactionDetailsForm.disable();
    let transactionDataJson = {
      "paymentKey": paymentKey,
      "pdiscipline": transactionDiscipline,
    }
    this.transactionData = this.routerAct.params.subscribe(params => {
      var URL = FinanceApi.getTransactionDetailBasedOnPaymentKeyUrl;
      this.hmsDataService.post(URL, transactionDataJson).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.disciplines = data.result.discipline;
          this.payeecd = data.result.payeeTypeCd;
          if (data.result.payeTypeDesc == "Cardholder") {
            this.addNameLabel = "Name"
          } else if (data.result.payeTypeDesc == "Provider") {
            this.addNameLabel = "Address"
          } else {
            this.addNameLabel = "Other Payee Name"
          }
          this.planKeyValue = data.result.sbusType;
          this.transactionDetailsForm.patchValue({
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

  // Methos for Upper Form Datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.transactionDetailsForm.patchValue(datePickerValue);
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
      this.transactionDetailsForm.patchValue(datePickerValue);
    }
  }

  unattachedClaimsSearch(filterSearch) {
    this.isUnattachedClaim = true
    var reqParam = [
      { 'key': 'disciplines', 'value': [this.disciplines] },
      { 'key': 'payeeCds', 'value': [this.payeecd] },
      { 'key': 'planType', 'value': (this.selectedPlanTypeValue ? this.selectedPlanTypeValue : '') },
      { 'key': 'coId', 'value': filterSearch.value.company },
      { 'key': 'confirmId', 'value': filterSearch.value.confirmation }
    ]

    var unattachedColumns = [
      { title: this.translate.instant('finance.transactionDetails.discipline'), data: 'discipline' },
      { title: this.translate.instant('finance.transactionDetails.confirmNo'), data: 'confirmId' },
      { title: this.translate.instant('finance.transactionDetails.cardID'), data: 'cardKey' },
      { title: this.translate.instant('finance.transactionDetails.receivedDate'), data: 'receiveDate' },
      { title: this.translate.instant('finance.transactionDetails.cardholder'), data: 'cardholderKey' },
      { title: this.translate.instant('finance.transactionDetails.totalPaid'), data: 'claimTotal' },
      { title: this.translate.instant('finance.transactionDetails.claimStatus'), data: 'claimStatus' },
      { title: this.translate.instant('finance.transactionDetails.operatorID'), data: 'operatorId' }
    ]

    var URL = FinanceApi.getAttachedClaims;
    var tableId = "unattachedClaimsList"
    if (!$.fn.dataTable.isDataTable('#unattachedClaimsList')) {
      this.dataTableService.jqueryDataTable(tableId, URL, 'full_numbers', unattachedColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3], '', [5],[1,2,3,4,6,7])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
    }
  }

  onPlanTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedPlanTypeValue = selected.originalObject.businessTypeKey;
    }
    else {
      this.selectedPlanTypeValue = '';
    }
  }

  detachClaim() {
    let URL = FinanceApi.detachClaim
    let data = this.selectedRowData
    let str
    switch (data.discipline) {
      case "Dental":
        str = 'D'
        break;
      case "Vision":
        str = "V"
        break;
      case "Health":
        str = "H"
        break;
      case "Drug":
        str = "DR"
        break;
      case "Supplement":
        str = "HS"
        break;
    }
    let detachClaimRequest = {
      "discipline": str,
      "claimKey": data.claimKey,
      "paymentKey": data.paymentKey
    }

    this.hmsDataService.post(URL, detachClaimRequest).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.toastrService.success(this.translate.instant('finance.toaster.claimDetachSuccess'));
      } else {
        this.toastrService.error(this.translate.instant('finance.toaster.somethingWentWrong'));
      }
    });
  }

  transactionIssue() {
    let URL = FinanceApi.attachClaim
    let data = this.selectedRowData
    let str
    switch (data.discipline) {
      case "Dental":
        str = 'D'
        break;
      case "Vision":
        str = "V"
        break;
      case "Health":
        str = "H"
        break;
      case "Drug":
        str = "DR"
        break;
      case "Supplement":
        str = "HS"
        break;
    }
    let detachClaimRequest = {
      "discipline": str,
      "paymentKey": data.paymentKey
    }
    this.hmsDataService.post(URL, detachClaimRequest).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.toastrService.success(this.translate.instant('finance.toaster.transIssuedSuccess'));
      } else {
        this.toastrService.error(this.translate.instant('finance.toaster.somethingWentWrong'));
      }
    });
  }

  attachClaim() {
    let URL = FinanceApi.attachClaim
    let data = this.selectedRowData
    let str
    switch (data.discipline) {
      case "Dental":
        str = 'D'
        break;
      case "Vision":
        str = "V"
        break;
      case "Health":
        str = "H"
        break;
      case "Drug":
        str = "DR"
        break;
      case "Supplement":
        str = "HS"
        break;
    }
    let detachClaimRequest = {
      "discipline": str,
      "claimKey": data.claimKey,
      "paymentKey": data.paymentKey
    }

    this.hmsDataService.post(URL, detachClaimRequest).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.toastrService.success(this.translate.instant('finance.toaster.claimAttachSuccess'));
      } else {
        this.toastrService.error(this.translate.instant('finance.toaster.somethingWentWrong'));
      }
    });
  }

  unattacheClaimTransactionIssue() {

  }

  detachUnattachedClaim() {

  }

  attachUnattacheClaim() {

  }

  /**
   * Serach Company List on press enter
   * @param event 
   */
  onKeyPress(event) {
    if (event.keyCode == 13) {
      this.unattachedClaimsSearch(this.unattachedClaimsForm);
    }
  }

  resetUnattachedClaimsForm() {
    this.unattachedClaimsForm.controls['planType'].reset();
    this.unattachedClaimsForm.controls['confirmation'].reset();
    this.unattachedClaimsForm.controls['company'].reset();
  }

  backToSearch() {
    this.backToSearchClicked = true
    this._router.navigate(['/finance/transaction-search']);
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
}
