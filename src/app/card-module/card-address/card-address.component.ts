import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; 
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardApi } from '../card-api';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { CardServiceService } from '../card-service.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; 
import { ToastrService } from 'ngx-toastr'; 
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Subject } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
@Component({
  selector: 'card-address',
  templateUrl: './card-address.component.html',
  styleUrls: ['./card-address.component.css'],
  providers: [ChangeDateFormatService, DatatableService, CurrentUserService, TranslateService]
})

export class CardAddressComponent implements OnInit {
  todayDate: string;
  disableBtn: boolean;
  cardStatusValue: any;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @Input() cardaddress: FormGroup; 
  @Input() adrsEditMode: boolean
  @Input() adrsViewMode: boolean
  @Output() emitOnSave: EventEmitter<any> = new EventEmitter<any>();
  @Input() currentUser: any
  @Input() userAuthCheck: any
  public cardaddressHistory: FormGroup; // change private to public 
  phoneMask = CustomValidators.phoneMask; 
  contactHistoryDeleteIcon: boolean = true;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  contactHistorytableData
  contactHistoryTableID
  viewTime
  contactHistorytableKeys
  contactHistorytableActions
  contactHistoryColumns
  contactHistoryTableHeading
  allColumnAction: boolean
  checkAddContact = true
  observableObj;
  savedCardNumber; // get card number when getting card details by card id
  savedCardKey; // get card key when getting card details by card id
  buttonText
  getCardContactHistorySaveUrl;
  cardContactSaveUrl;
  apiRequestType;
  dateNameArray = []
  error: any;
  savedCardContactBaKey;
  editUniqueKey = 0;
  addEditText
  albertaBsnsType: boolean = false
  bussinesType
  userId;
  bussinesCD;
  cardAddressVal = { 
    cca_line: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
    cca_line2: ['', [Validators.minLength(5), Validators.maxLength(60)]],
    cca_postalcode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(7)]],
    cca_city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]],
    cca_province: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]],
    cca_country: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    cca_fax: ['', [CustomValidators.phoneMaskLength]],
    cca_phone: ['', [CustomValidators.phoneMaskLength]],
    cca_email: ['', [Validators.minLength(4), Validators.maxLength(50)]],
    cca_effectivedate: ['', [Validators.required]],
    cca_expirydate: [''],
    cca_webUserId: [''],
    cca_extension: ['', [CustomValidators.onlyNumbers, Validators.minLength(3), Validators.maxLength(5)]],
  }
  expired: boolean=false;
  prefLang: Subscription;
  busCd: Subscription;
  cardStatusSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService, 
    private hmsDataServiceService: HmsDataServiceService,
    public cardService: CardServiceService, 
    public currentUserService: CurrentUserService,
    private toastrService: ToastrService,
    public datatableService: DatatableService,
    private router: Router,
    private translate: TranslateService
  ) {
      this.error = { isError: false, errorMessage: '' };  //Used to Display Error With Element
      this.prefLang = cardService.getPrefferedLanguage.subscribe((value) => {
        this.savedCardNumber = value.cardNumber
        this.savedCardKey = value.cardKery
        this.savedCardContactBaKey = value.cardContactBaKey
        this.cardaddressHistory.patchValue({ cardContactKey: this.savedCardContactBaKey })
        this.cardaddressHistory.patchValue({ cardKey: this.savedCardKey })
    });
    
    this.busCd = cardService.getbusinessCd.subscribe((value) => {
      this.removeValidation(value, "mainForm", false)
      this.bussinesCD = value
    })

    this.cardStatusSub = cardService.cardStatus.subscribe((value) => {
      this.cardStatusValue = value
      if (this.cardStatusValue == 'Inactive') {
        this.disableBtn = true
      }
      else {
        this.disableBtn = false
      }
    })
  }

  ngOnInit() {
    this.observableObj = Observable.interval(1000).subscribe(value => {
      if (this.checkAddContact = true) {
        if ('card.button-save' == this.translate.instant('card.button-save')) {
        } else {
          this.buttonText = this.translate.instant('card.button-save');
          this.addEditText = this.translate.instant('card.text-add');
          this.checkAddContact = false;
          this.observableObj.unsubscribe();
        }
      }
    });

    this.todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
    this.dtOptions = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]], }

    this.cardaddressHistory = new FormGroup({
      cardContactLine1MailAdd: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
      cardContactLine2MailAdd: new FormControl('', [Validators.minLength(5), Validators.maxLength(60)]),
      cardContactPhoneNum: new FormControl('', [CustomValidators.phoneMaskLength]),
      cardContactFaxNum: new FormControl('', [CustomValidators.phoneMaskLength]),
      cardContactEmailAdd: new FormControl('', [CustomValidators.vaildEmail, Validators.minLength(4), Validators.maxLength(50)]),
      postalCD: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(7)]),
      countryName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
      provinceName: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60)]),
      cityName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]),
      expiredOn: new FormControl(''),
      effectiveOn: new FormControl('', [Validators.required]),
      cardContactExtension: new FormControl('', [CustomValidators.onlyNumbers, Validators.minLength(3), Validators.maxLength(5)]),
    });
    $(document).on('click','.btnpicker', function () {
      $('#cca_effectivedate .mydp .selector').addClass('bottom-calender')
    })
    $(document).on('click','.btnpicker', function () {
      $('#cca_expirydate .mydp .selector').addClass('bottom-calender')
    })
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }
  
  checkValForAlb() {
    if (this.currentUser.businessType.bothAccess) {
      if (this.bussinesCD == Constants.albertaBusinessTypeCd) {
        this.removeValidation(this.bussinesCD, "mainForm", false)
      }
    }
    else {
      this.removeValidation(this.currentUser.businessType[0].businessTypeCd, "mainForm", false)
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

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.cardaddress.patchValue(datePickerValue);
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
      this.cardaddress.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    if (this.cardaddress.value.cca_effectivedate && this.cardaddress.value.cca_expirydate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.cardaddress.value.cca_effectivedate.date, this.cardaddress.value.cca_expirydate.date);
      if (this.error.isError == true) {
        this.cardaddress.controls['cca_expirydate'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  reloadTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  cardContactHistoryDetails() {
    this.removeValidation(this.bussinesCD, "cardAdrsHistory", false)
    this.cardaddressHistory.reset();
    let requiredInfo = {
      "cardKey": this.savedCardKey
    }
    this.hmsDataServiceService.postApi(CardApi.getCardContactHistory, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.contactHistorytableData = data.result
        var dateCols = ['effectiveOn', 'expiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
        this.reloadTable()
      } else {
        this.contactHistorytableData = []
      }
      error => {}
    })
  }

  isCompanyPostalcodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CardApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataServiceService.postApi(URL, postalNumber).subscribe(data => {
        switch (data.code) {
          case 404:
            this.cardaddress.controls['cca_postalcode'].setErrors(
              {
                "postalcodeNotFound": true
              });
            break;
          case 302:
            this.cardaddress.patchValue({
              'cca_city': data.result.cityName,
              'cca_country': data.result.countryName,
              'cca_province': data.result.provinceName
            });
            $('#cca_extension').focus();
            break;
        }
      });
    }
  }

  isCompanyPostalVerifyValid(event, fieldName) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (fieldName) {
        case 'cca_city':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.cardaddress.get('cca_country').value,
            provinceName: this.cardaddress.get('cca_province').value,
            postalCd: this.cardaddress.get('cca_postalcode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'cca_country':
          fieldParameter = {
            cityName: this.cardaddress.get('cca_city').value,
            countryName: event.target.value,
            provinceName: this.cardaddress.get('cca_province').value,
            postalCd: this.cardaddress.get('cca_postalcode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'cca_province':
          fieldParameter = {
            cityName: this.cardaddress.get('cca_city').value,
            countryName: this.cardaddress.get('cca_country').value,
            provinceName: event.target.value,
            postalCd: this.cardaddress.get('cca_postalcode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataServiceService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.cardaddress.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.cardaddress.patchValue({
              'cca_city': data.result.cityName,
              'cca_country': data.result.countryName,
              'cca_province': data.result.provinceName
            });
          break;
        }
      });
    }
  }

  changeDateFormatHistory(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.cardaddressHistory.patchValue(datePickerValue);
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
      this.cardaddressHistory.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    if (this.cardaddressHistory.value.effectiveOn && this.cardaddressHistory.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.cardaddressHistory.value.effectiveOn.date, this.cardaddressHistory.value.expiredOn.date);
      if (this.error.isError == true) {
        this.cardaddressHistory.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  updateCardContactHistory() {
    let formFields = ['cardContactLine1MailAdd', 'cardContactLine2MailAdd', 'cardContactPhoneNum', 'cardContactFaxNum', 'cardContactExtension', 'cardContactEmailAdd', 'postalCD',
      'countryName', 'provinceName', 'cityName', 'expiredOn', 'effectiveOn']
    let hasValue = false
    formFields.forEach(value => {
      if ((this.cardaddressHistory.get(value).value) && this.cardaddressHistory.get(value).value != "") {
        hasValue = true
      }
    })
    let cardContacHistory = false
    if (this.bussinesCD == Constants.albertaBusinessTypeCd && hasValue) {
      this.removeValidation(Constants.albertaBusinessTypeCd, "cardAdrsHistory", true)
      cardContacHistory = true
    } else if (this.bussinesCD == Constants.albertaBusinessTypeCd && !hasValue) {
      this.removeValidation(Constants.albertaBusinessTypeCd, "cardAdrsHistory", false)
      cardContacHistory = false
    } else {
      this.removeValidation(Constants.quikcardBusinessTypeCd, "cardAdrsHistory", false)
      cardContacHistory = false
    }
    if (this.cardaddressHistory.valid) {
      let submitData
      if (!cardContacHistory && this.bussinesCD == Constants.albertaBusinessTypeCd) {
        this.resetCardContactHistory()
        return
      } else {
        submitData = {
          "cardContactLine1MailAdd": this.cardaddressHistory.value.cardContactLine1MailAdd,
          "cardContactLine2MailAdd": this.cardaddressHistory.value.cardContactLine2MailAdd,
          "cardContactPhoneNum": this.cardaddressHistory.value.cardContactPhoneNum ? this.cardaddressHistory.value.cardContactPhoneNum.replace(/[^0-9 ]/g, "").trim() : '',
          "cardContactFaxNum": this.cardaddressHistory.value.cardContactFaxNum ? this.cardaddressHistory.value.cardContactFaxNum.replace(/[^0-9 ]/g, "").trim() : '',
          "cardContactEmailAdd": this.cardaddressHistory.value.cardContactEmailAdd,
          "postalCD": this.cardaddressHistory.value.postalCD,
          "countryName": this.cardaddressHistory.value.countryName,
          "provinceName": this.cardaddressHistory.value.provinceName,
          "cityName": this.cardaddressHistory.value.cityName,
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.cardaddressHistory.value.expiredOn),
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.cardaddressHistory.value.effectiveOn),
          "cardKey": this.savedCardKey,
          "cardContactKey": this.buttonText == "Update" ? this.editUniqueKey : 0,
          "cardContactExtension": this.cardaddressHistory.value.cardContactExtension
        }

        this.hmsDataServiceService.putApi(CardApi.saveCardContactUrl, submitData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.cardContactHistoryDetails()
            this.toastrService.success(this.translate.instant('card.toaster.contact-save'));
            this.cardaddressHistory.reset();
            this.emitOnSave.emit("saved");
            this.buttonText = this.translate.instant('card.button-save');
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == "FIRST_EXPIRED_OLD_ONE_RECORD") {
            this.toastrService.error("Please Expire Old Request First");
          } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
            this.toastrService.error("Effective Date Should Be Greater Than Old Expired On");
          }})
      }
    } else {
      this.validateAllFormFields(this.cardaddressHistory);
    }
  }

  resetCardContactHistory() {
    this.cardaddressHistory.reset();
    this.buttonText = this.translate.instant('card.button-save');
  }

  isCompanyPostalcodeHistoryValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CardApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataServiceService.postApi(URL, postalNumber).subscribe(data => {
        switch (data.code) {
          case 404:
            this.cardaddressHistory.controls['postalCD'].setErrors(
              {
                "postalcodeNotFound": true
              });
            break;
          case 302:
            this.cardaddressHistory.patchValue({
              'cityName': data.result.cityName,
              'countryName': data.result.countryName,
              'provinceName': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  isCompanyPostalVerifyHistoryValid(event, fieldName) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (fieldName) {
        case 'cityName':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.cardaddressHistory.get('countryName').value,
            provinceName: this.cardaddressHistory.get('provinceName').value,
            postalCd: this.cardaddressHistory.get('postalCD').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'countryName':
          fieldParameter = {
            cityName: this.cardaddressHistory.get('cityName').value,
            countryName: event.target.value,
            provinceName: this.cardaddressHistory.get('provinceName').value,
            postalCd: this.cardaddressHistory.get('postalCD').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'provinceName':
          fieldParameter = {
            cityName: this.cardaddressHistory.get('cityName').value,
            countryName: this.cardaddressHistory.get('countryName').value,
            provinceName: event.target.value,
            postalCd: this.cardaddressHistory.get('postalCD').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataServiceService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.cardaddressHistory.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.cardaddressHistory.patchValue({
              'cityName': data.result.cityName,
              'countryName': data.result.countryName,
              'provinceName': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  changeButtonText() {
    this.buttonText = this.translate.instant('card.button-update');
  }

  setCardAddressForm(dataRow) {
    if (dataRow.cardContactKey) {
      this.editUniqueKey = dataRow.cardContactKey
    } else {
      this.editUniqueKey = 0
    }
    let cardaddress = {
        cardContactLine1MailAdd: dataRow.cardContactLine1MailAdd,
        cardContactLine2MailAdd: dataRow.cardContactLine2MailAdd,
        cardContactPhoneNum: dataRow.cardContactPhoneNum ? dataRow.cardContactPhoneNum.trim() : '',
        cardContactFaxNum: dataRow.cardContactFaxNum ? dataRow.cardContactFaxNum.trim() : '',
        cardContactEmailAdd: dataRow.cardContactEmailAdd,
        postalCD: dataRow.postalCD,
        countryName: dataRow.countryName,
        provinceName: dataRow.provinceName,
        cityName: dataRow.cityName,
        expiredOn: this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn),
        effectiveOn: this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn),
        cardKey: dataRow.cardKey,
        cardContactKey: dataRow.cardContactKey,
        cardContactExtension: dataRow.cardContactExtension
      }
    this.cardaddressHistory.patchValue(cardaddress);
    this.buttonText = this.translate.instant('card.button-update');
    this.addEditText = this.translate.instant('card.text-edit');
  }

  removeValidation(value, formType, validateForm) {
    let formFields = []
    let formName
    if (formType == "mainForm") {
      formFields = ['cca_line', 'cca_email', 'cca_effectivedate', 'cca_line2', 'cca_postalcode', 'cca_city',
        'cca_province', 'cca_country', 'cca_fax', 'cca_phone']
      formName = this.cardaddress
    } if (formType == "cardAdrsHistory") {
      formFields = ['cardContactLine1MailAdd', 'cardContactLine2MailAdd', 'cardContactPhoneNum', 'cardContactFaxNum', 'cardContactEmailAdd', 'postalCD',
        'countryName', 'provinceName', 'cityName', 'expiredOn', 'effectiveOn']
      formName = this.cardaddressHistory
    }
    if (value == Constants.albertaBusinessTypeCd) {
      if (validateForm && formType == "mainForm") {
        this.cardaddress.get('cca_line').setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(60)]);
        this.cardaddress.get('cca_line2').setValidators([Validators.minLength(5), Validators.maxLength(60)]);
        this.cardaddress.get('cca_postalcode').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(7)]);
        this.cardaddress.get('cca_city').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(60)]);
        this.cardaddress.get('cca_province').setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(60)]);
        this.cardaddress.get('cca_country').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(15)]);
      } else if (validateForm && formType == "cardAdrsHistory") {
        this.cardaddressHistory.get('cardContactLine1MailAdd').setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(60)]);
        this.cardaddressHistory.get('cardContactLine2MailAdd').setValidators([Validators.minLength(5), Validators.maxLength(60)]);
        this.cardaddressHistory.get('postalCD').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(7)]);
        this.cardaddressHistory.get('cityName').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(60)]);
        this.cardaddressHistory.get('provinceName').setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(60)]);
        this.cardaddressHistory.get('countryName').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(15)]);
      } else {
        this.albertaBsnsType = true
        formFields.forEach(value => {
          formName.get(value).clearValidators()
        })
      }
    } if (value == Constants.quikcardBusinessTypeCd) {
      this.albertaBsnsType = false
      if (formType == "mainForm") {
        this.cardaddress.get('cca_email').setValidators([CustomValidators.vaildEmail, Validators.minLength(4), Validators.maxLength(50)]);
        this.cardaddress.get('cca_effectivedate').setValidators(Validators.required);
        this.cardaddress.get('cca_line').setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(60)]);
        this.cardaddress.get('cca_line2').setValidators([Validators.minLength(5), Validators.maxLength(60)]);
        this.cardaddress.get('cca_postalcode').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(7)]);
        this.cardaddress.get('cca_city').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(60)]);
        this.cardaddress.get('cca_province').setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(60)]);
        this.cardaddress.get('cca_country').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(15)]);
      }
      if (formType == "cardAdrsHistory") {
        this.cardaddressHistory.get('cardContactEmailAdd').setValidators([CustomValidators.vaildEmail, Validators.minLength(4), Validators.maxLength(50)]);
        this.cardaddressHistory.get('effectiveOn').setValidators(Validators.required);
        this.cardaddressHistory.get('cardContactLine1MailAdd').setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(60)]);
        this.cardaddressHistory.get('cardContactLine2MailAdd').setValidators([Validators.minLength(5), Validators.maxLength(60)]);
        this.cardaddressHistory.get('postalCD').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(7)]);
        this.cardaddressHistory.get('cityName').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(60)]);
        this.cardaddressHistory.get('provinceName').setValidators([Validators.required, Validators.minLength(4), Validators.maxLength(60)]);
        this.cardaddressHistory.get('countryName').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(15)]);
      }
    }
    formFields.forEach(data => {
      formName.get(data).updateValueAndValidity();
    })
  }

  /**
 * Convert Date Formate i.e (01/Jan/2018) to (01/01/2018)
 * @param dateString 
 */
  changeCovCatDateFormat(dateString) {
    if (dateString.match(/[a-z]/i)) {
      let covDate;
      let monthByNameLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var monthString = dateString.split('/')
      var monthName = monthString[1];
      var monthKey = monthByNameLabel.indexOf(monthName);
      if (monthKey != -1) {
        return covDate = monthString[0] + '/' + ('0' + (monthKey + 1)).slice(-2) + '/' + monthString[2];
      }
    }
    return
  }

  isExpired(rowDate) {
    if(rowDate){
      return this.changeDateFormatService.isStartDateGreaterThanEndDate(this.todayDate, this.changeCovCatDateFormat(rowDate));
    }
  }

  ngOnDestroy() {
    if (this.prefLang) {
      this.prefLang.unsubscribe()
    }
    else if (this.busCd) {
      this.busCd.unsubscribe()
    }
    else if (this.cardStatusSub) {
      this.cardStatusSub.unsubscribe()
    }
  }

}