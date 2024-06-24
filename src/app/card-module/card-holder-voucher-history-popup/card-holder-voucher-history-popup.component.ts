import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { CardApi } from '../card-api';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { Subject, Subscription } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { CardServiceService } from '../../card-module/card-service.service';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
@Component({
  selector: 'app-card-holder-voucher-history-popup',
  templateUrl: './card-holder-voucher-history-popup.component.html',
  styleUrls: ['./card-holder-voucher-history-popup.component.css'],
  providers: [ChangeDateFormatService, HmsDataServiceService, TranslateService]
})

export class CardHolderVoucherHistoryPopupComponent implements OnInit {
  @Input() cardHolderKey: string;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  CardHolderPopUpVoucherFormGroup: FormGroup;
  cardholderVoucherKey: string = '';
  arrCarrierList;
  error: any;
  VoucherSubmitButtonText: string;
  VoucherHistorytableData = [];
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  cardholderCobVal = {
    voucherNo: "",
    districtOffice: "",
    licenseNo: "",
    effectiveOn: '',
    expiredOn: '',
  }
  chElgKey: any;
  chElgEffectiveOn: any;
  chElgKeySub: Subscription;
  chElgEff: Subscription;

  constructor(private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private datatableService: DatatableService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private cardService: CardServiceService) {
    this.error = { isError: false, errorMessage: '' };

    this.chElgKeySub = this.cardService.getChEligibilityKey.subscribe(value => {
      this.chElgKey = value
    })

    this.chElgEff = this.cardService.getChEligibilityEffective.subscribe(data => {
      this.chElgEffectiveOn = data
    })

    this.CardHolderPopUpVoucherFormGroup = new FormGroup
      ({
        voucherNo: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(12), CustomValidators.alphaNumeric]),
        districtOffice: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(6), CustomValidators.alphaNumeric]),
        licenseNo: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20), CustomValidators.alphaNumeric]),
        effectiveOn: new FormControl('', Validators.required),
        expiredOn: new FormControl('', Validators.required),

      });
    this.VoucherSubmitButtonText = "Save";
  }

  cardholderRoleAssignedVal = {
    voucherNo: ['', CustomValidators.onlyNumbers],
    districtOffice: [''],
    licenseNo: ['', CustomValidators.onlyNumbers],
    effectiveOn: [''],
    expiredOn: [''],
  }

  ngOnInit() {
    this.dtOptions['VoucherHistory'] = Constants.dtOptionsConfig
    this.dtTrigger['VoucherHistory'] = new Subject();
  }

  reloadTable(tableId) {
    this.datatableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  ngAfterViewInit(): void {
    this.dtTrigger['VoucherHistory'].next()
  }

  SaveCHVoucherHistory() {
    if (this.CardHolderPopUpVoucherFormGroup.valid) {
      var voucherExpiryOn = this.changeDateFormatService.convertDateObjectToString(this.CardHolderPopUpVoucherFormGroup.value.expiredOn)
      var voucherEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.CardHolderPopUpVoucherFormGroup.value.effectiveOn)
      var requestedData = {
        "cardholderKey": this.cardHolderKey,
        "voucherNo": this.CardHolderPopUpVoucherFormGroup.value.voucherNo,
        "districtOffice": this.CardHolderPopUpVoucherFormGroup.value.districtOffice,
        "licenseNo": this.CardHolderPopUpVoucherFormGroup.value.licenseNo,
        "effectiveOn": voucherEffectiveOn,
        "expiredOn": voucherExpiryOn,
        "cardholderVoucherKey": this.cardholderVoucherKey,
        "chEligibilityKey": this.chElgKey
      }
      this.hmsDataService.postApi(CardApi.addOrUpdateVoucherUrl, requestedData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.VoucherSubmitButtonText = "Save";
          this.cardholderVoucherKey = '';
          this.getVoucherHistory();
          this.toastrService.success(this.translate.instant('card.toaster.record-save'));
          this.CardHolderPopUpVoucherFormGroup.reset();
        } else if (data.code == 400 && data.message == 'LICENSE_NOT_EXIST') {
          this.toastrService.error(this.translate.instant('card.toaster.invalid-vaoucher-license'));
        } else if (data.code == 400 && data.message == 'EXPIRY_DATE_VOUCHER_CANNOT_LATER_THAN_CARDHOLDER_ELIGIBILITY') {
          this.toastrService.error(this.translate.instant('card.toaster.voucher-expiry-not-greater'));
        } else {
          this.toastrService.error(this.translate.instant('card.toaster.record-notsave'));
        }
      });
    }
    else {
      this.validateAllFormFields(this.CardHolderPopUpVoucherFormGroup)
    }
  }

  getVoucherHistory() {
    let requestedData = {
      "chEligibilityKey": this.chElgKey
    }
    this.hmsDataService.postApi(CardApi.getVoucherListUrl, requestedData).subscribe(res => {
      this.VoucherHistorytableData = [];
      if (res.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.VoucherHistorytableData = res.result;
        this.reloadTable("VoucherHistory")
        this.CardHolderPopUpVoucherFormGroup.reset();
      } else {
        this.VoucherHistorytableData = [];
      }
    });
  }

  setVoucherHistoryForm(data) {
    let COBHistoryFormValue = {
      voucherNo: data.voucherNo,
      licenseNo: data.licenseNo,
      districtOffice: data.districtOffice,
      effectiveOn: this.changeDateFormatService.convertStringDateToObject(data.effectiveOn),
      expiredOn: this.changeDateFormatService.convertStringDateToObject(data.expiredOn),
    }
    this.CardHolderPopUpVoucherFormGroup.patchValue(COBHistoryFormValue);
    this.cardholderVoucherKey = data.cardholderVouchertKey,
      this.VoucherSubmitButtonText = this.translate.instant('card.button-update');
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
      if (formName == 'CardHolderPopUpVoucherFormGroup') {
        this.CardHolderPopUpVoucherFormGroup.patchValue(datePickerValue);
      }

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
      this.CardHolderPopUpVoucherFormGroup.patchValue(datePickerValue);
    }
    else if (event.reason == 1 && event.value == '') {
      this.error.isError = false;
      this.error.errorMessage = '';
    }
    if (frmControlName == "effectiveOn") {
      if (this.CardHolderPopUpVoucherFormGroup.value.effectiveOn && this.chElgEffectiveOn) {
        this.error = this.changeDateFormatService.compareTwoDates(this.chElgEffectiveOn.date, this.CardHolderPopUpVoucherFormGroup.value.effectiveOn.date);
        if (this.error.isError == true) {
          this.CardHolderPopUpVoucherFormGroup.controls['effectiveOn'].setErrors({
            "voucherEffectiveOn": true
          });
        }
      }
    }
    if (this.CardHolderPopUpVoucherFormGroup.value.effectiveOn && this.CardHolderPopUpVoucherFormGroup.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardHolderPopUpVoucherFormGroup.value.effectiveOn.date, this.CardHolderPopUpVoucherFormGroup.value.expiredOn.date);
      if (this.error.isError == true) {
        this.CardHolderPopUpVoucherFormGroup.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }

  onlyNumberKey(event) {
    let e = event;
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
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
  resetVoucher() {
    this.CardHolderPopUpVoucherFormGroup.reset()
  }

  ngOnDestroy() {
    if (this.chElgKeySub) {
      this.chElgKeySub.unsubscribe();
    }
    else if (this.chElgEff) {
      this.chElgEff.unsubscribe();
    }
  }
}