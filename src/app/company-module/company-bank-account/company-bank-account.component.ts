import { Component, OnInit, Input } from '@angular/core';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Rx';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { IMyInputFocusBlur } from 'mydatepicker';
import { CompanyService } from '../company.service';
import { CompanyApi } from '../company-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { CommonApi } from '../../common-module/common-api';

@Component({
  selector: 'app-company-bank-account',
  templateUrl: './company-bank-account.component.html',
  styleUrls: ['./company-bank-account.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService]
})

export class CompanyBankAccountComponent implements OnInit {
  bankEffectiveDate: any;
  @ViewChild("CompanyBankAccountName") trgCompanyBankAccountName: ElementRef;
  error: { isError: boolean; errorMessage: string; };
  previousBankEffectiveDate: any;
  ObservableBankAccountObj;
  checkBankAccount = true
  bank_account_columns = [];
  public bankAccountsForm: FormGroup; // change private to public for production-errors
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  dateMask = CustomValidators.dateMask;
  @Input() companyId: any;
  @Input() mainCompanyArray: any;
  coBankAccountKey: any;
  companyBankAccountKey: any;
  saveButton: boolean = false;
  buttonText
  noReqParams;
  isDisableEffectiveOn: boolean = false;
  expired: boolean;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastr: ToastrService,
    private exDialog: ExDialog,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    const that = this;
    var self = this
    this.bankAccountsForm = new FormGroup({
      'bank': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(12), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'bankName': new FormControl('', [Validators.required, Validators.maxLength(60),CustomValidators.notEmpty, CustomValidators.alphaNumericHyphen]), // log 781 bank name issue
      'branch': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'account': new FormControl('', [Validators.required, Validators.minLength(7), Validators.maxLength(20), CustomValidators.alphaNumeric, CustomValidators.validBankNo, CustomValidators.notEmpty]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl('')
    });

    this.ObservableBankAccountObj = Observable.interval(1000).subscribe(x => {
      if (this.checkBankAccount = true) {
        if ('company.company-bank-account.bank-no' == this.translate.instant('company.company-bank-account.bank-no')) {
        }
        else {
          this.buttonText = this.translate.instant('button.save');
          this.bank_account_columns = [
            {
              title: this.translate.instant('company.company-bank-account.bank-no'),
              data: 'coBankNum'
            },
            {
              title: this.translate.instant('company.company-bank-account.branch-no.'),
              data: 'coBankBranchNum'
            },
            {
              title: this.translate.instant('company.company-bank-account.bank-name'),
              data: 'coBankName'
            },
            {
              title: this.translate.instant('company.company-bank-account.account-no.'),
              data: 'coBankAccountNum'
            },
            {
              title: this.translate.instant('company.company-bank-account.effective-date'),
              data: 'effectiveOn'
            },
            {
              title: this.translate.instant('company.company-bank-account.expiry-date'),
              data: 'expiredOn'
            },
            {
              title: this.translate.instant('company.company-bank-account.action'),
              data: 'coBankAccountKey'
            }
          ]
          this.checkBankAccount = false;
          this.ObservableBankAccountObj.unsubscribe();
        }
      }
    });
  }

  ngAfterViewInit(): void {
  }

  /**
   * Patch Value To Edit Bank Account Form
   * @param bankKey 
   * @param rowData 
   */
  editBankAccount(bankKey, rowData) {
    this.coBankAccountKey = bankKey;
    this.bankAccountsForm.patchValue({
      'bank': rowData[0],
      'branch': rowData[1],
      'bankName': rowData[2],
      'account': rowData[3],
    });
    if (rowData[4]) {
      var dateArray = this.changeDateFormatService.convertStringDateToObject(rowData[4]);
      this.bankEffectiveDate = dateArray;
      this.bankAccountsForm.patchValue({
        effectiveOn: {
          date: {
            year: dateArray.date.year,
            month: dateArray.date.month,
            day: dateArray.date.day
          }
        }
      });
    }
    if (rowData[5]) {
      var dateArray = this.changeDateFormatService.convertStringDateToObject(rowData[5]);
      this.bankAccountsForm.patchValue({
        expiredOn: {
          date: {
            year: dateArray.date.year,
            month: dateArray.date.month,
            day: dateArray.date.day
          }
        }
      });
    }
    this.bankAccountsForm.controls['bank'].disable();
    this.bankAccountsForm.controls['bankName'].disable();
    this.bankAccountsForm.controls['branch'].disable();
    this.bankAccountsForm.controls['account'].disable();
    if (rowData[4]) {
      this.bankAccountsForm.controls['effectiveOn'].disable();
      this.isDisableEffectiveOn = false;
    } else {
      this.isDisableEffectiveOn = true;
    }
    this.buttonText = this.translate.instant('button.update');
  }

  /**
   * Reset bank account form
   */
  resetForm() {
    this.bankAccountsForm.reset();
  }

  /**
   * Submit Bank Account Details
   * @param bankAccountsForm 
   */
  onSubmit(bankAccountsForm) {
    if (this.coBankAccountKey) {
      this.bankAccountsForm
      let bankData;
      if (this.isDisableEffectiveOn) {
        bankData = {
          "companyKey": this.companyId,
          "coBankAccountKey": this.coBankAccountKey,
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(bankAccountsForm.value.expiredOn),
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(bankAccountsForm.value.effectiveOn),
        }
      } else {
        bankData = {
          "companyKey": this.companyId,
          "coBankAccountKey": this.coBankAccountKey,
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(bankAccountsForm.value.expiredOn),
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.bankEffectiveDate),
        }
      }
      var URL = CompanyApi.saveCompanyBankAccountUrl;
      this.hmsDataServiceService.post(URL, bankData).subscribe(data => {
        if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_EFFECTIVEON') {
          this.toastr.error(this.translate.instant('company.toaster.expiryDateGreaterThanEffective'));
          return false;
        } else if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_NOW_DATE') {
          this.toastr.error(this.translate.instant('company.toaster.expiryDateGreaterThanCurrent'));
          return false;
        } else if (data.code == 400 && data.message == 'COMPANY_BANK_ACCOUNT_ALREADY_EXIST') {
          this.toastr.error(this.translate.instant('company.toaster.companyBankAccAlreadyExists'));
          return false;
        } else if (data.code == 400 && data.message == 'EXPIREDON_REQIURED') {
          this.toastr.error(this.translate.instant('company.toaster.expiryDateRequired'));
          return false;
        } else if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_THAN_CREATED_ON') {
          this.toastr.error(this.translate.instant('company.toaster.expiryDateGreaterThanCreatedOn'));
          return false;
        }
        if (data.code == 200 && data.status == 'OK') {
          this.toastr.success(this.translate.instant('company.toaster.bankDetailsUpdated'));
          var company_bank_account_history_url = CompanyApi.getCompanyBankAccountHistoryUrl;
          var companyBankAccountTableId = "company-bank-account-history"
          var reqParam = [{ 'key': 'coKey', 'value': this.companyId }]
          this.dataTableService.jqueryDataTableReload(companyBankAccountTableId, company_bank_account_history_url, reqParam);
          this.bankAccountsForm.reset();
          this.bankAccountsForm.enable();
          this.coBankAccountKey = '';
          this.buttonText = this.translate.instant('button.save');
        }
      });
    } else {
      if (this.bankAccountsForm.valid) {
        let companyId = { companyKey: this.companyId };
        var URL = CompanyApi.validateCompanyBankExpiredOnUrl;
        this.hmsDataServiceService.postApi(URL, companyId).subscribe(data => {
          if (data.code == 400 && data.hmsShortMessage == "PREVIOUS_ACCOUNT_ACTIVE") {
            this.exDialog.openConfirm(this.translate.instant('company.exDialog.previousBankAcc')).subscribe((value) => {
              if (value) {
                this.saveBankDetails(bankAccountsForm);
              } else {
                return;
              }
            });
          } else if (data.code == 400 && data.hmsShortMessage == "PREVIOUS_ACCOUNT_EXPIRED") {
            this.saveBankDetails(bankAccountsForm);
          }
        });
        var company_bank_account_history_url = CompanyApi.getCompanyBankAccountHistoryUrl;
        var bankParams = { "draw": 1, "columns": [{ "data": "coBankNum", "name": "", "searchable": true, "orderable": false, "search": { "value": "", "regex": false } }, { "data": "coBankName", "name": "", "searchable": true, "orderable": false, "search": { "value": "", "regex": false } }, { "data": "coBankBranchNum", "name": "", "searchable": true, "orderable": false, "search": { "value": "", "regex": false } }, { "data": "coBankAccountNum", "name": "", "searchable": true, "orderable": false, "search": { "value": "", "regex": false } }, { "data": "effectiveOn", "name": "", "searchable": true, "orderable": false, "search": { "value": "", "regex": false } }, { "data": "expiredOn", "name": "", "searchable": true, "orderable": false, "search": { "value": "", "regex": false } }, { "data": "coBankAccountKey", "name": "", "searchable": false, "orderable": false, "search": { "value": "", "regex": false } }], "order": [], "start": 0, "length": 5, "search": { "value": "", "regex": false }, "coKey": this.companyId }
        this.hmsDataServiceService.postApi(company_bank_account_history_url, bankParams).subscribe(data => {
          if (data.result) {
            this.previousBankEffectiveDate = this.changeDateFormatService.convertStringDateToObject(data.result.data[0].effectiveOn);
          }
        })
      }
      else {
        this.validateAllFormFields(this.bankAccountsForm);
      }
    }
    // Any API call logic via services goes here
  }

  /**
   * Save Bank Account Details
   * @param bankAccountsForm 
   */
  saveBankDetails(bankAccountsForm) {
    let bankData = {
      "companyKey": this.companyId,
      "coBankAccountNum": bankAccountsForm.value.account,
      "coBankBranchNum": bankAccountsForm.value.branch,
      "coBankNum": bankAccountsForm.value.bank,
      "coBankName": bankAccountsForm.value.bankName,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(bankAccountsForm.value.effectiveOn),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(bankAccountsForm.value.expiredOn),
    }
    var URL = CompanyApi.saveCompanyBankAccountUrl;
    this.hmsDataServiceService.post(URL, bankData).subscribe(data => {
      if (data.code == 400 && data.message == 'DATE_SHOULD_BE_GREATER_NOW_DATE') {
        this.toastr.error(this.translate.instant('company.toaster.expiryDateGreaterThanCurrent'));
        return false;
      } else if (data.code == 400 && data.message == 'EXPIREDON_SHOULD_BE_GREATER_EFFECTIVEON') {
        this.toastr.error(this.translate.instant('company.toaster.expiryDateGreaterThanEffective'));
        return false;
      } else if (data.code == 400 && data.message == 'COMPANY_BANK_ACCOUNT_ALREADY_EXIST') {
        this.toastr.error(this.translate.instant('company.toaster.companyBankAccAlreadyExists'));
        return false;
      } else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
        this.toastr.error(this.translate.instant('company.toaster.effectiveDateGreaterThanOldEffective'));
        return false;
      } else if (data.code == 400 && data.message == 'EFFECTIVEON_REQUIRED_FOR_PREVIOUS_ACCOUNT') {
        this.toastr.error(this.translate.instant('company.toaster.effectiveOnRequiredForPreviousAcount'));
        return false;
      }
      if (data.code == 200 && data.status == 'OK') {
        this.toastr.success(this.translate.instant('company.toaster.bankDetailsAdded'));
        var company_bank_account_history_url = CompanyApi.getCompanyBankAccountHistoryUrl;
        var companyBankAccountTableId = "company-bank-account-history"
        var reqParam = [{ 'key': 'coKey', 'value': this.companyId }]
        this.dataTableService.jqueryDataTableReload(companyBankAccountTableId, company_bank_account_history_url, reqParam);
        this.bankAccountsForm.reset();
      }
    });
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

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    var datePickerValue = new Array();
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
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }

    if (event.reason == 2) {
      if (formName == 'bankAccountsForm') {
        this.bankAccountsForm.patchValue(datePickerValue);
        if (this.previousBankEffectiveDate && this.bankAccountsForm.value.effectiveOn) {
          this.error = this.changeDateFormatService.compareTwoDates(this.previousBankEffectiveDate.date, this.bankAccountsForm.value.effectiveOn.date);
          if (this.error.isError == true) {
            this.bankAccountsForm.controls['effectiveOn'].setErrors({
              "bankPreviousEffDateError": true
            });
          }
        }
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  /**
   * Reset Bank Account Form
   */
  resetBankForm() {
    this.bankAccountsForm.reset();
  }

  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(() => {
      self[el].nativeElement.focus();
    }, 200);
  }

  setCompanyBankAccountFocus() {
    this.bankAccountsForm.enable();
    this.buttonText = this.translate.instant('button.save');
    let tableActions = [
      { 'name': 'view', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'showAction': this.mainCompanyArray[0].editCompanyBankAccount },
    ]
    this.setElementFocus('trgCompanyBankAccountName');
    var company_bank_account_history_url = CompanyApi.getCompanyBankAccountHistoryUrl;
    var companyBankAccountTableId = "company-bank-account-history"
    var reqParam = [{ 'key': 'coKey', 'value': this.companyId }]
    if (!$.fn.dataTable.isDataTable('#company-bank-account-history')) {
      this.dataTableService.jqueryDataTable(companyBankAccountTableId, company_bank_account_history_url, 'full_numbers', this.bank_account_columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 6, [4, 5], '', [1, 2, 3, 6])
    } else {
      this.dataTableService.jqueryDataTableReload(companyBankAccountTableId, company_bank_account_history_url, reqParam);
    }
  }

  /**
   * Get the Bank Name form Api
   * @author Balwinder
   */
  bankFields(event, event1) {
    var url = CommonApi.getBankDetailsUrl
    var bank = event.value
    var branch = event1.value
    let ReqData = {
      "bankNum": bank,
      "branchNum": branch
    }
    if (bank && branch != "") {
      this.hmsDataServiceService.postApi(url, ReqData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.bankAccountsForm.patchValue({
            'bankName': (data.result[0].bankName).trim()
          })
        } else {
          this.bankAccountsForm.patchValue({
            'bankName': ''
          })
        }
      })
    }
  }

}
