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
  selector: 'app-trustee-information',
  templateUrl: './trustee-information.component.html',
  styleUrls: ['./trustee-information.component.css'],
  providers: [ChangeDateFormatService, HmsDataServiceService, TranslateService]
})

export class TrusteeInformationComponent implements OnInit {
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];

  @Input() cardKey: string;
  @Input() userAuthCheck: any
  TrusteePopUpFormGroup: FormGroup;
  trusteeKey: string = '';
  arrCarrierList;
  error: any;
  TrusteeSubmitButtonText: string;
  TrusteeInfotableData = [];
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerOptionsDob = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;
  cardholderCobVal = {
    trusteeName: "",
    postalCd: "",
    cityName: "",
    provinceName: '',
    countryName: '',
    terminationDate: '',
    createdOn: ''
  }
  showLoader: boolean = false;
  expired: boolean
  constructor(private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private datatableService: DatatableService,
    private toastrService: ToastrService,
    private translate: TranslateService) {
    this.error = { isError: false, errorMessage: '' };
    this.TrusteePopUpFormGroup = new FormGroup
      ({
        trusteeName: new FormControl('', Validators.required),
        terminationDate: new FormControl(''),
        addLine1: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
        addLine2: new FormControl('', [Validators.minLength(5), Validators.maxLength(60)]),
        postalCd: new FormControl('', [Validators.required, Validators.maxLength(7)]),
        cityName: new FormControl('', Validators.required),
        provinceName: new FormControl('', Validators.required),
        countryName: new FormControl('', Validators.required),
        phnNo: new FormControl('', [Validators.required, Validators.maxLength(10)]),
        firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        dob: new FormControl(''),
        createdOn: new FormControl(''),
      });
    this.TrusteeSubmitButtonText = 'Save'
  }

  cardholderRoleAssignedVal = {
    trusteeName: [''],
    postalCd: [''],
    cityName: [''],
    provinceName: [''],
    countryName: [''],
    terminationDate: [''],
    createdOn: [''],
  }

  ngOnInit() {
    this.dtOptions['TrusteeInfo'] = { dom: 'tirp', pageLength: 5, "ordering": false }
    this.dtTrigger['TrusteeInfo'] = new Subject();
  }

  reloadTable(tableID) {
    this.datatableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  ngAfterViewInit(): void {
    this.dtTrigger['TrusteeInfo'].next()
  }

  SaveTrusteeInfo() {
    if (this.TrusteePopUpFormGroup.valid) {
      if (this.TrusteePopUpFormGroup.value.terminationDate) {
        var terminationDate = this.changeDateFormatService.convertDateObjectToString(this.TrusteePopUpFormGroup.value.terminationDate)

      }
      var trusteeKey = '0';
      if (this.trusteeKey) {
        trusteeKey = this.trusteeKey;
      }

      var cardKey = $('#hndChCardKey').val();
      if (this.cardKey) {
        cardKey = this.cardKey
      }
      var requestedData = {
        "trusteeKey": trusteeKey,
        "cardKey": cardKey,
        "terminationDate": terminationDate || '', //log 1022
        "trusteeName": this.TrusteePopUpFormGroup.value.trusteeName,
        "cityName": this.TrusteePopUpFormGroup.value.cityName,
        "provinceName": this.TrusteePopUpFormGroup.value.provinceName,
        "postalCd": this.TrusteePopUpFormGroup.value.postalCd,
        "countryName": this.TrusteePopUpFormGroup.value.countryName,
        "firstName": this.TrusteePopUpFormGroup.value.firstName,
        "lastName": this.TrusteePopUpFormGroup.value.lastName,
        "phn": this.TrusteePopUpFormGroup.value.phnNo,
        "address1": this.TrusteePopUpFormGroup.value.addLine1,
        "address2": this.TrusteePopUpFormGroup.value.addLine2,
        "dateOfBirth": this.changeDateFormatService.convertDateObjectToString(this.TrusteePopUpFormGroup.value.dob)
      }
      this.showLoader = true
      this.hmsDataService.postApi(CardApi.addOrUpdateTrusteeUrl, requestedData).subscribe(data => {
        this.showLoader = false

        if (data.code == 200 && data.status == "OK") {
          this.reloadTable('TrusteeInfo')
          this.TrusteeSubmitButtonText = this.translate.instant('card.button-save')
          this.trusteeKey = '';
          this.getTrusteeInfo();
          if (this.TrusteeSubmitButtonText == "update") {
            this.toastrService.success("Trustee Updated Successfully!!");
          } else {
            this.toastrService.success(this.translate.instant('card.toaster.record-save'));
          }
          this.TrusteePopUpFormGroup.reset();
        }
        else {
          this.toastrService.error(this.translate.instant('card.toaster.record-notsave'));
        }
      });
    } else {
      this.validateAllFormFields(this.TrusteePopUpFormGroup)
    }
  }

  getTrusteeInfo() {
    var cardKey = $('#hndChCardKey').val();
    this.trusteeKey = '0',
      this.TrusteeSubmitButtonText = "Save"
    if (this.cardKey) {
      cardKey = this.cardKey
    }
    let requestedData = {
      "cardKey": cardKey
    }
    this.hmsDataService.postApi(CardApi.getAllTrusteesUrl, requestedData).subscribe(
      res => {
        this.reloadTable('TrusteeInfo')
        this.TrusteeInfotableData = [];
        if (res.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.TrusteeInfotableData = res.result;
        }
        this.TrusteePopUpFormGroup.reset();
      });
  }

  setTrusteeInfoForm(data) {
    let COBHistoryFormValue = {
      trusteeName: data.trusteeName,
      terminationDate: this.changeDateFormatService.convertStringDateToObject(data.terminationDate),
      postalCd: data.postalCode,// log 1022 param (postalCd to postalCode)
      cityName: data.cityName,
      provinceName: data.provinceName,
      countryName: data.countryName,
      addLine1: data.address1,
      addLine2: data.address2,
      phnNo: data.phn,
      firstName: data.firstName,
      lastName: data.lastName,
      dob: this.changeDateFormatService.convertStringDateToObject(data.dateOfBirth),
      createdOn: data.createdOn,
    }
    this.TrusteePopUpFormGroup.patchValue(COBHistoryFormValue);
    this.trusteeKey = data.trusteeKey,
      this.TrusteeSubmitButtonText = this.translate.instant('card.button-update')
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
    var todayDate = this.changeDateFormatService.getToday();
    var TerminationDate = event.value
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = todayDate;
      TerminationDate = todayDate;
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
      this.TrusteePopUpFormGroup.patchValue(datePickerValue);
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      TerminationDate = obj;
      var strCreatedDate = this.changeDateFormatService.convertDateObjectToString(todayDate);
      var strTerminationDate = this.changeDateFormatService.convertDateObjectToString(TerminationDate);

      if (this.TrusteePopUpFormGroup.value.createdOn) {
        strCreatedDate = this.TrusteePopUpFormGroup.value.createdOn;
      }

      var result = this.changeDateFormatService.compareTwoDate(strTerminationDate, strCreatedDate);
      if (!result) {
        if (this.TrusteePopUpFormGroup.value.createdOn) {
          self[formName].controls[frmControlName].setErrors({
            "TrusteeTerminationDateVsCreatedDate": true
          });
        }
        else {
          self[formName].controls[frmControlName].setErrors({
            "TrusteeTerminationDateVsTodayDate": true
          });
        }
      }
    }
    else if (event.reason == 1 && event.value == '') {
      this.error.isError = false;
      this.error.errorMessage = '';
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

  isCompanyPostalcodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CardApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataService.postApi(URL, postalNumber).subscribe(data => {

        switch (data.code) {
          case 404:
            this.TrusteePopUpFormGroup.controls['postalCd'].setErrors(
              {
                "postalcodeNotFound": true
              });
            break;
          case 302:
            this.TrusteePopUpFormGroup.patchValue({
              'cityName': data.result.cityName,
              'countryName': data.result.countryName,
              'provinceName': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  isCompanyPostalVerifyValid(event, fieldName) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      let countryName = ''

      if (this.TrusteePopUpFormGroup.get('countryName').value) {
        countryName = this.TrusteePopUpFormGroup.get('countryName').value
      }

      let Province = ''
      if (this.TrusteePopUpFormGroup.get('provinceName').value) {
        Province = this.TrusteePopUpFormGroup.get('provinceName').value
      }

      let cityName = ''
      if (this.TrusteePopUpFormGroup.get('cityName').value) {
        cityName = this.TrusteePopUpFormGroup.get('cityName').value
      }

      let postalCd = ''
      if (this.TrusteePopUpFormGroup.get('postalCd').value) {
        postalCd = this.TrusteePopUpFormGroup.get('postalCd').value
      }
      switch (fieldName) {
        case 'cityName':
          fieldParameter = {
            cityName: event.target.value,
            countryName: countryName,
            provinceName: Province,
            postalCd: postalCd,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'countryName':
          fieldParameter = {
            cityName: cityName,
            countryName: event.target.value,
            provinceName: Province,
            postalCd: postalCd,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'provinceName':
          fieldParameter = {
            countryName: countryName,
            provinceName: event.target.value,
            cityName: cityName,
            postalCd: postalCd,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {

        switch (data.code) {
          case 404:
            this.TrusteePopUpFormGroup.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.TrusteePopUpFormGroup.patchValue({
              'cityName': data.result.cityName,
              'countryName': data.result.countryName,
              'Province': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  changeDateFormatDob(event, frmControlName, formName) {
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
      if (frmControlName == 'dob') {
        var dateInstring = this.changeDateFormatService.convertDateObjectToString(obj);
        var isFutureDate = this.changeDateFormatService.isFutureDate(dateInstring)
        if (isFutureDate) {
          this.error.isError = true;
          this.TrusteePopUpFormGroup.controls['dob'].setErrors({
            "cardHolderDob": true
          });
          return
        }
        else {
          this.error.isError = false;
          this.error.errorMessage = "";
        }
      }
      this.TrusteePopUpFormGroup.patchValue({ 'dob': obj });
      var age = this.changeDateFormatService.getAge(obj.date.year + '/' + obj.date.month + '/' + obj.date.day);
      return false;
    }
    else {
      this.error.isError = false;
      this.error.errorMessage = "";
      var datePickerValue = new Array();
      var obj = this.changeDateFormatService.changeDateFormat(event);
      datePickerValue[frmControlName] = obj;
      this.TrusteePopUpFormGroup.patchValue({ 'dob': obj });
      return false;
    }
  }
}