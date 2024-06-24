import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { CardApi } from '../card-api';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-card-holder-expense-history-popup',
  templateUrl: './card-holder-expense-history-popup.component.html',
  styleUrls: ['./card-holder-expense-history-popup.component.css'],
  providers: [ChangeDateFormatService, HmsDataServiceService, TranslateService]
})

export class CardHolderExpenseHistoryPopupComponent implements OnInit {
  expenseAdjustmentMode: boolean = false;
  @ViewChildren(DataTableDirective)

  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];

  @Input() cardHolderKey: string;
  CardHolderPopUpExpenseAdjustmentFormGroup: FormGroup;
  chExpenseAdjustmentKey: string = '';
  arrRoleList;
  error: any;
  expenseSubmitButtonText: string;
  adjustmentHistorytableData = [];
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;

  constructor(private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private datatableService: DatatableService,
    private toastrService: ToastrService,
    private translate: TranslateService) {
    this.error = { isError: false, errorMessage: '' };
    this.CardHolderPopUpExpenseAdjustmentFormGroup = new FormGroup({
      adjustmentAmount: new FormControl('', [Validators.required]),
      effective_date: new FormControl('', [Validators.required])
    });
    this.expenseSubmitButtonText = "Save"
  }

  cardholderAdjustmentAssignedVal = {
    adjustmentAmount: ['', Validators.required],
    effective_date: ['', Validators.required]
  }

  ngOnInit() {
    this.getAdjustmentHistory();
    this.dtOptions['ExpenseAdjustmentHistory'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
    this.dtTrigger['ExpenseAdjustmentHistory'] = new Subject();
  }

  reloadTable(tableID) {
    this.datatableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  ngAfterViewInit(): void {
    this.dtTrigger['ExpenseAdjustmentHistory'].next()
  }

  getAdjustmentHistory1() {
    let requestedData = {
      "cardholderKey": this.cardHolderKey
    }
    this.hmsDataService.postApi(CardApi.getExpenseAdjustmentsByCardHolderKeyUrl, requestedData).subscribe(data => {
      this.adjustmentHistorytableData = [];
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.adjustmentHistorytableData = data.result;
      }
    })
  }

  SaveCHAdjustmentHistory() {
    if (this.CardHolderPopUpExpenseAdjustmentFormGroup.valid) {
      var effectiveDate = this.changeDateFormatService.convertDateObjectToString(this.CardHolderPopUpExpenseAdjustmentFormGroup.value.effective_date)
      var requestedData;
      var apiUrl = CardApi.addExpenseAdjustmentUrl;
      if (this.chExpenseAdjustmentKey) {
        requestedData =
        {
          "adjustmentAmount": this.CardHolderPopUpExpenseAdjustmentFormGroup.value.adjustmentAmount,
          "cardholderKey": this.cardHolderKey,
          "chExpenseAdjustmentKey": this.chExpenseAdjustmentKey
        }
        apiUrl = CardApi.updateExpenseAdjustmentUrl;
      }
      else {
        requestedData =
        {
          "effectiveDate": effectiveDate,
          "adjustmentAmount": this.CardHolderPopUpExpenseAdjustmentFormGroup.value.adjustmentAmount,
          "cardholderKey": this.cardHolderKey,
          "chExpenseAdjustmentKey": this.chExpenseAdjustmentKey
        }
      }
      this.hmsDataService.postApi(apiUrl, requestedData).subscribe(data => {
        if (data.hmsMessage.messageShort == 'ADJUSTMENT_EXPENSE_SAVED_SUCCESSFULLY' || data.hmsMessage.messageShort == 'ADJUSTMENT_EXPENSE_UPDATED') {
          this.reloadTable('ExpenseAdjustmentHistory')
          this.expenseSubmitButtonText = "Save"
          this.chExpenseAdjustmentKey = '';
          this.getAdjustmentHistory();
          this.toastrService.success(this.translate.instant('card.toaster.record-save'));
          this.CardHolderPopUpExpenseAdjustmentFormGroup.reset();
          this.CardHolderPopUpExpenseAdjustmentFormGroup.controls['effective_date'].enable();
          this.CardHolderPopUpExpenseAdjustmentFormGroup.patchValue({ 'description': '' })
        } else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
          this.toastrService.error(this.translate.instant('card.toaster.bank-date-err'));
        } else {
          this.toastrService.error(this.translate.instant('card.toaster.record-notsave'));
        }

      });
    }
    else {
      this.validateAllFormFields(this.CardHolderPopUpExpenseAdjustmentFormGroup)
    }
  }

  getAdjustmentHistory() {
    let requestedData = {
      "cardholderKey": this.cardHolderKey
    }
    this.hmsDataService.postApi(CardApi.getExpenseAdjustmentsByCardHolderKeyUrl, requestedData).subscribe(
      res => {
        this.reloadTable('ExpenseAdjustmentHistory')
        this.adjustmentHistorytableData = [];
        if (res.hmsMessage.messageShort != 'RECORD_NOT_FOUND') {
          this.adjustmentHistorytableData = res.result;
        }
        this.CardHolderPopUpExpenseAdjustmentFormGroup.reset();
      });
  }

  setExpenseHistoryForm(data) {
    let cardholderAdjustmentAssignedVal = {
      adjustmentAmount: data.adjustmentAmount,
      effective_date: this.changeDateFormatService.convertStringDateToObject(data.effectiveDate),
    }
    this.expenseAdjustmentMode = true;
    this.CardHolderPopUpExpenseAdjustmentFormGroup.controls['effective_date'].disable();
    this.CardHolderPopUpExpenseAdjustmentFormGroup.patchValue(cardholderAdjustmentAssignedVal);
    this.chExpenseAdjustmentKey = data.chExpenseAdjustmentKey,
      this.expenseSubmitButtonText = "Update"
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

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      if (formName == 'CardHolderPopUpExpenseAdjustmentFormGroup') {
        this.CardHolderPopUpExpenseAdjustmentFormGroup.patchValue(datePickerValue);
      }
    }
    else if (event.reason == 2 && event.value != null && event.value != '') {
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
      if (formName == 'CardHolderPopUpExpenseAdjustmentFormGroup') {
        this.CardHolderPopUpExpenseAdjustmentFormGroup.patchValue(datePickerValue);
      }
    }
  }

  onlyDecimalNumberKey(event) {
    let e = event;
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode == 65 && e.ctrlKey === true) ||
      // Allow: Ctrl+C
      (e.keyCode == 67 && e.ctrlKey === true) ||
      // Allow: Ctrl+X
      (e.keyCode == 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  }
}