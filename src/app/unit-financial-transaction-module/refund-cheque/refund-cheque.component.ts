import { Component, Input, OnInit } from '@angular/core';
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
import { FeeGuideApi } from '../../fee-guide-module/fee-guide-api';
import { CompleterData, CompleterService, CompleterItem } from 'ng2-completer';
import { UftApi } from '../uft-api';

@Component({
  selector: 'app-refund-cheque',
  templateUrl: './refund-cheque.component.html',
  styleUrls: ['./refund-cheque.component.css'],
  providers: [ChangeDateFormatService, DatatableService, HmsDataServiceService]
})
export class RefundChequeComponent implements OnInit {

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions
  refundChequeForm: FormGroup;
  generateRefundForm: FormGroup
  error: any;
  rowData: any;
  stopChequeBtn: boolean = false
  selectedChequeNum: any;
  selectedRefundPayKey: any;
  @Input() enableRefundButton: any;
  dateNameArray = {};
  showRefundCheckList: boolean = false;
  columns = [];
  public isOpen: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  transactionStatusList;
  transStatus;
  transactionTypeList;
  transType;
  companyListData;
  observableObj;

  public transactionTypeData: CompleterData;
  public transactionStatusData: CompleterData
  constructor(private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private translateService: TranslateService,
    private completerService: CompleterService,
    private hmsDataService: HmsDataServiceService
  ) {
    this.error = { isError: false, errorMessage: '' }
    // Predictive Search for FeeGuide ProvinceName    
    this.companyListData = this.completerService.remote(
      null,
      "coName",
      "coName"
    );
    this.companyListData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + this.hmsDataService.currentUser } });
    this.companyListData.urlFormater((term: any) => {
      return UftApi.getPredictiveCompanyListUrl + `/${term}`;
    });
    this.companyListData.dataField('result');
  }

  ngOnInit() {
    this.refundChequeForm = new FormGroup({
      'companyRefundCheque': new FormControl(''),
      'chequeNo': new FormControl(''),
      'companyNo': new FormControl(''),
      'accTransDateFrom': new FormControl(''),
      'accTransDateTo': new FormControl(''),
      'transStatus': new FormControl(''),
      'transType': new FormControl(''),
      '': new FormControl(''),
    })
    this.generateRefundForm = new FormGroup({
      'companyNameNo': new FormControl('', [Validators.required]),
      'accTransDate': new FormControl('', [Validators.required]),
      'transactionAmount': new FormControl('', [Validators.required]),
      'transactionType': new FormControl('', [Validators.required]),
      'transactionDesc': new FormControl('', [Validators.required]),
      'transactionRef': new FormControl('', [Validators.required]),
      'currentBalance': new FormControl('', [Validators.required]),
      'entryDate': new FormControl('', []),
      'companyEffectiveOn': new FormControl('', [Validators.required]),
      'yearEndDate': new FormControl('', [Validators.required]),
      'yearEndBalance': new FormControl('', [Validators.required]),
      'standardPapAmount': new FormControl('', [Validators.required]),
      'refundAmount': new FormControl('', []),
      '': new FormControl('', [])
    })
    var self = this
    $(document).on('click', '#refundChequeList tr', function () {
      if (self.dataTableService.selectedRefundChequeRowData != undefined) {
        self.rowData = self.dataTableService.selectedRefundChequeRowData
        self.selectedRefundPayKey = self.rowData.coRefundPayKey
        self.selectedChequeNum = self.rowData.coRefundChequeNum
        self.stopChequeBtn = true
      }
    })
    this.getTransactionStatus();
    this.getTransactionType();
    this.dataTableInitialization();
  }

  // Get localization object for datatable
  dataTableInitialization() {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: this.translate.instant('uft.refundCheque.companyID'), data: 'coId' },
          { title: this.translate.instant('uft.refundCheque.companyName'), data: 'coName' },
          { title: this.translate.instant('uft.refundCheque.status'), data: 'tranStatDesc' },
          { title: this.translate.instant('uft.refundCheque.type'), data: 'tranTypeDesc' },
          { title: this.translate.instant('uft.refundCheque.processDate'), data: 'coRefundProcessDt' },
          { title: this.translate.instant('uft.refundCheque.totalAmount'), data: 'coRefundTotalAmt' },
          { title: this.translate.instant('uft.refundCheque.transactionDate'), data: 'coRefundTransDt' },
          { title: this.translate.instant('uft.refundCheque.issueDate'), data: 'coRefundIssueDt' },
          { title: this.translate.instant('uft.refundCheque.cancelDate'), data: 'coRefundCancelDt' },
          { title: this.translate.instant('uft.refundCheque.clearDate'), data: 'coRefundClearDt' },
          { title: this.translate.instant('uft.refundCheque.chequeNumber'), data: 'coRefundChequeNum' },
          { title: this.translate.instant('uft.refundCheque.chequeMsg'), data: 'coRefundChqMsg' },
        ]
        this.observableObj.unsubscribe();
      }
    });
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
        )
      }
    })
  };

  onSelectedTransactionStatus(selected: CompleterItem) {
    if (selected) {
      this.transStatus = selected.originalObject.tranStatusDescription;
    }
    else {
      this.transStatus = ''
    }
  }

  getTransactionType() {
    var url = UftApi.getTransactionTypeUrl
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

  onSelectedTransactionType(selected: CompleterItem) {
    if (selected) {
      this.transType = selected.originalObject.tranTypeDescription
    }
    else {
      this.transType = ""
    }
  }

  getRefundChequeListBySearch() {
    this.showRefundCheckList = true
    var reqParam = [
      { 'key': 'coRefundChequeNum', 'value': this.refundChequeForm.value.chequeNo },
      { 'key': 'coId', 'value': this.refundChequeForm.value.companyNo },
      { 'key': 'coRefundProcessDtStart', 'value': this.refundChequeForm.value.accTransDateFrom },
      { 'key': 'coRefundProcessDtEnd', 'value': this.refundChequeForm.value.accTransDateTo },
      { 'key': 'tranStatDesc', 'value': this.refundChequeForm.value.transStatus },
      { 'key': 'tranTypeDesc', 'value': this.refundChequeForm.value.transType }
    ]
    var url = UftApi.companyRefundPaymentsUrl;
    var tableId = "refundChequeList"
    if (!$.fn.dataTable.isDataTable('#refundChequeList')) {
      var tableActions = [
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': '' },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
      ]
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [4, 6, 7, 9], '', [5], [1, 2, 3, 8, 11, 10])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  clearRefundCheque() {
    this.refundChequeForm.reset();
  }

  // Methos for Upper Form Datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.generateRefundForm.patchValue(datePickerValue);
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
      this.generateRefundForm.patchValue(datePickerValue);
      this.refundChequeForm.patchValue(datePickerValue);
    }
    if (event.reason == 2) {
      if (datePickerValue) {
        this.refundChequeForm.patchValue(datePickerValue);
        this.generateRefundForm.patchValue(datePickerValue);
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

  /* Search For Refund Cheque Grid Footer Search*/
  refundChequeListFilter(tableId: string) {
    var appendExtraParam = {
    }
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var dateParams = [3];
    var URL = UftApi.companyRefundPaymentsUrl;
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }

  /* Reset the Refund Cheque List Footer Search */
  resetRefundChequeListFilter() {
    this.dataTableService.resetTableSearch();
    this.refundChequeListFilter("refundChequeList");
    $('#refundChequeList .icon-mydpremove').trigger('click');
  }

  /* Generate Refund Popup Submit*/
  submitGenerateRefundForm(generateRefundForm) {
    if (this.generateRefundForm.valid) {
      this.toastrService.success(this.translate.instant('uft.toaster.refundGeneratedSuccess'))
    } else {
      this.validateAllFormFields(this.generateRefundForm)
    }
  }

  stopCheque() {
    var url = UftApi.companyStopChequeUrl;
    var stopChequeReq
    var action = "cancel";
    this.exDialog.openConfirm(this.translate.instant('uft.toaster.stopChequeConfirm') + this.selectedChequeNum + '?')
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

  resetGenerateRefundForm() {
    this.generateRefundForm.reset();
    this.rowData = ''
    this.selectedRefundPayKey = ''
    this.selectedChequeNum = ''
    this.stopChequeBtn = false
    this.showRefundCheckList = false
  }

  /* Method for validate the Form fields */
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

  closeModal() {
    this.rowData = ''
    this.selectedRefundPayKey = ''
    this.selectedChequeNum = ''
    this.stopChequeBtn = false
    this.showRefundCheckList = false
  }

}
