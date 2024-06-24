import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { IMyInputFocusBlur } from 'mydatepicker';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CompanyApi } from '../../../company-module/company-api';

@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.css'],
  providers: [ChangeDateFormatService]
})

export class BankAccountComponent implements OnInit {
  @Input() BankAccountFormGroup: FormGroup;
  data: any;
  saveUrl
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  bankAccountTableHeading = "List Of Bank Accounts"
  bankAccountColumns = [
    { title: "Bank #", data: 'bank' },
    { title: "Branch #", data: 'branch' },
    { title: "Account #", data: 'account' },
    { title: "Client Name", data: 'clientName' },
    { title: "Effective On", data: 'effective_on' },
    { title: "Expiry Date", data: 'expired_on' },
    { title: "Action", data: 'action' }]

  bankAccounttableData = [
    {
      'id': '1',
      'bank': 'PNB',
      'branch': 'kasauli',
      'account': 'Saving',
      'clientName': 'Sandeep Singh',
      'effective_on': '25/04/2018',
      'expired_on': '25/04/2018',
      'action': ''
    },
    {
      'id': '2',
      'bank': 'PNB',
      'branch': 'kasauli',
      'account': 'Saving',
      'clientName': 'Sandeep Singh',
      'effective_on': '25/04/2018',
      'expired_on': '25/04/2018',
      'action': ''
    },
    {
      'id': '3',
      'bank': 'PNB',
      'branch': 'kasauli',
      'account': 'Saving',
      'clientName': 'Sandeep Singh',
      'effective_on': '25/04/2018',
      'expired_on': '25/04/2018',
      'action': ''
    },
  ]

  bankAccountTableID = "account-history-table"
  viewTime = false
  bankAccounttableKeys = [
    { 'column': 'bank', 'type': 'text', 'name': 'bank', 'required': false },
    { 'column': 'branch', 'type': 'text', 'name': 'branch', 'required': false },
    { 'column': 'account', 'type': 'text', 'name': 'account', 'required': false },
    { 'column': 'clientName', 'type': 'text', 'name': 'clientName', 'required': false },
    { 'column': 'effective_on', 'type': 'datepicker', 'name': 'effective_on', 'required': true },
    { 'column': 'expired_on', 'type': 'datepicker', 'name': 'expired_on', 'required': true },
    { 'column': 'action', 'type': 'action' }
  ]
  bankAccounttableActions = [
    { 'name': 'edit', 'serverSide': true, 'val': '', 'class': 'edit_row table-action-btn edit-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-pencil' },
    { 'name': 'save', 'serverSide': true, 'val': '', 'class': 'save_row table-action-btn save-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-save' },
    { 'name': 'delete', 'serverSide': true, 'val': '', 'class': 'delete_row table-action-btn del-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-trash' },
    { 'name': 'coId', 'val': '', 'class': '', 'type': 'hidden' }
  ]

  constructor(
    private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService
  ) {

    this.BankAccountFormGroup = fb.group({
      'bank': [null, Validators.required],
      'branch': [null, Validators.required],
      'account': [null, Validators.required],
      'client_name': [null, Validators.required],
      'effective_date': [null, Validators.required],
      'expired_date': [null, Validators.required],
    });
  }

  ngOnInit() {
  }

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
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
      // Set Date Picker Value to Form Control Element
      this.BankAccountFormGroup.patchValue(datePickerValue);
      
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

  saveBankAccount(BankAccountFormGroup) {
    if (this.BankAccountFormGroup.valid) {
      let bankAccountJson = {
        "companyKey": "681",
        "companyBankAssignCom": "test",
        "coBankAccountNum": BankAccountFormGroup.account,
        "coBankBranchNum": BankAccountFormGroup.branch,
        "coBankNum": BankAccountFormGroup.bank,
        "createdBy": "test",
        "createdOn": "01-02-2018",
        "expiredBy": "test",
        "expiredOn": "01-08-2018",
        "updatedBy": "test",
        "updatedOn": "01-02-2018"
      }
      var URL = CompanyApi.addCompanyBankAccountUrl;
      this.hmsDataServiceService.postApi(URL, bankAccountJson).subscribe(data => {
      });
    }
    else {
      this.validateAllFormFields(this.BankAccountFormGroup);//Form Validations
    }
  }
}