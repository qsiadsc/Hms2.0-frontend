import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompanyService } from '../company.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { IMyDpOptions, IMyInputFocusBlur } from 'mydatepicker';
import { Constants } from '../../common-module/Constants';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { BrokerApi } from './../broker-api';
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { Router } from '@angular/router';

@Component({
  selector: 'app-broker-add',
  templateUrl: './broker-add.component.html',
  styleUrls: ['./broker-add.component.css'],
  providers: [CompanyService, ChangeDateFormatService]
})

export class BrokerAddComponent extends FormCanDeactivate implements OnInit {
  public addBrokerForm: FormGroup; // change private to public for production-build
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  phoneMask = CustomValidators.phoneMask; // add phone format to phone field  
  coId = '123';
  model
  submitted = false;
  FormGroup: any;
  mainCompanyArray = [{
    "addBroker": 'F',
    "searchBroker": 'F',
    "editBroker": 'F',
    "terminateBroker": 'F',
    "reactivateBroker": 'F',
    "brokerBankAccount": 'F',
    "updateBroker": 'F'
  }]
  expired: boolean;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private router: Router,
  ) {
    super();
  }

  ngOnInit() {
    // Add Broker Form Validations
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthCheck(this.currentUserService.authChecks['ANCL'])
        localStorage.setItem('isReload', '')
      })
      localStorage.setItem('isReload', '')
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthCheck(this.currentUserService.authChecks['ANCL'])
      })
      localStorage.setItem('isReload', '')
    }

    this.addBrokerForm = new FormGroup({
      'broker_name': new FormControl('', [Validators.required]),
      'broker_id': new FormControl('', Validators.required),
      'gts_registration': new FormControl(''),
      'address1': new FormControl('', Validators.required),
      'address2': new FormControl('', Validators.required),
      'postal_code': new FormControl('', [Validators.required, CustomValidators.vaildPoastalCode]),
      'city': new FormControl('', Validators.required),
      'province': new FormControl('', Validators.required),
      'country': new FormControl('', Validators.required),
      'email': new FormControl('', [Validators.required, CustomValidators.vaildEmail]),
      'phone_no': new FormControl('', [Validators.required, CustomValidators.vaildPhoneFormat]),
      'fax_no': new FormControl('', [Validators.required, CustomValidators.vaildfax]),
      'effective_date': new FormControl('', Validators.required),
    });
    $(document).ready(function () {
      document.getElementById("broker_name").focus();
    });
  }

  getAuthCheck(claimChecks) {
    let authCheck = []
    for (var i = 0; i < claimChecks.length; i++) {
      authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
    }
    this.mainCompanyArray = [{
      "addBroker": authCheck[''],
      "searchBroker": authCheck[''],
      "editBroker": authCheck[''],
      "terminateBroker": authCheck[''],
      "reactivateBroker": authCheck[''],
      "brokerBankAccount": authCheck[''],
      "updateBroker": authCheck[''],
    }]
    return this.mainCompanyArray
  }

  onSubmitaddBrokerForm(addBrokerForm) {
    this.submitted = true;
    if ((this.addBrokerForm.valid)) {

      let brokerData = {
        "brokerPostalCode": 1,
        "brokerCountry": 1,
        "brokerCity": 1,
        "brokerProvince": 1,
        "brokerPhone": this.addBrokerForm.value.phone_no,
        "brokerFax": this.addBrokerForm.value.fax_no,
        "brokerEmail": this.addBrokerForm.value.email,
        "brokerCreatedOn": "01/02/2018",
        "brokerUPdateOn": "01/02/2018",
        "brokerEffectiveOn": "01/02/2018",
        "brokerSuspensionInd": "T",
        "brokerContractDate": "01/02/2018",
        "brokerGstInd": "T",
        "brokerMultiCommAgrInd": "T",
        "brokerName": this.addBrokerForm.value.broker_name,
        "OptoutCompanyEmailInd": "T",
        "brokerId": this.addBrokerForm.value.broker_id,
        "brokerGstRegNUm": this.addBrokerForm.value.gts_registration,
        "brokerAddress1": this.addBrokerForm.value.address1,
        "brokerAddress2": this.addBrokerForm.value.address2
      };
      this.hmsDataServiceService.post(BrokerApi.addBrokerUrl, brokerData).subscribe(data => { })
    }
    else {
      this.validateAllFormFields(this.addBrokerForm);
    }
  }

  // Validating Forms on submit
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

  changeDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      // Set Date Picker Value
      datePickerValue[ControlName] = obj;
      this.addBrokerForm.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    else if((event.reason == 1 && event.value != null && event.value != '')){
    this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
  }
  
}

  canDeactivate() {
    if (!this.submitted && this.FormGroup.dirty) {
      if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
        if (this.currentUserService.newTabRouterLink != undefined && this.currentUserService.newTabRouterLink != '' && this.router.url != this.currentUserService.newTabRouterLink) {
          window.open(this.currentUserService.newTabRouterLink);
          this.currentUserService.setRouterLink('');
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

}
