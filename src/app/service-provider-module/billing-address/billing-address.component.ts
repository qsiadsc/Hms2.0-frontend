import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommonApi } from '../../common-module/common-api';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { TranslateService } from '@ngx-translate/core';
import { ServiceProviderApi } from '../service-provider-api';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { Subject } from 'rxjs/Rx';//Import Component For Add Card Holder Form Pop Up
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { Constants } from '../../common-module/Constants'
import { ServiceProviderService } from '../serviceProvider.service';
import { GlobalApprovalComponent } from '../global-approval/global-approval.component';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'

@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.component.html',
  styleUrls: ['./billing-address.component.css'],
  moduleId: module.id.toString(),
  providers: [ChangeDateFormatService, TranslateService]
})

export class BillingAddressComponent implements OnInit {
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  requestData = [];
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  ServiceProviderBillingAddressFormGroup: FormGroup;

  phoneMask = CustomValidators.phoneMask; // add phone format to phone field
  languages;
  arrBillAddrList = [];

  @Input() providerKey: string;
  @Input() disciplineKey: any;
  @Input() serviceProviderChecks: any;
  @Input() serviceProviderEditMode: boolean; //set value edit value
  @Input() serviceProviderViewMode: boolean; //set value View value
  @Input() serviceProviderAddMode: boolean; //set value Add value
  expired;
  provBillAddKey;
  banId;
  id;
  error: any;
  provBillingAddressKey;
  provBillAddDebitType;
  viewMode: boolean = false;
  hasValues: boolean = false;
  showLoader: boolean = false;
  provBillAddDebitAmt;
  selectedDisciplineKey;
  enableViewMode
  addModeKey
  @ViewChildren(DataTableDirective)
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  disableAddBtn: boolean = false;
  sbButtonPermission: boolean = false;
  // To show processing.
  noData: boolean = true;
  constructor(
    private currentUserService: CurrentUserService,
    private fb: FormBuilder,
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private dataTableService: DatatableService,
    private serviceProviderService: ServiceProviderService,
    private exDialog: ExDialog
  ) {
    this.serviceProviderService.reloadBillingTable.subscribe(data => {
      if (data) {
        this.GetBillAddList(data)
      }
    })
    serviceProviderService.selectedDisciplineKey.subscribe((value) => {
      this.selectedDisciplineKey = value
    })
  }

  ngOnInit() {
    // To show processing.
    this.noData = true
    this.dtOptions['spba_BillingAddrInfo'] = Constants.dtOptionsConfig
    this.dtTrigger['spba_BillingAddrInfo'] = new Subject();
    this.ServiceProviderBillingAddressFormGroup = new FormGroup
      ({
        provBillAddKey: new FormControl(''),
        bussAddrr: new FormControl(''),
        payeeName: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(60)])),
        postalCode: new FormControl('', [Validators.required, Validators.maxLength(7)]),
        cityName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
        countryName: new FormControl('', Validators.required),
        provinceName: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
        provBillAddL1MailAdd: new FormControl('', Validators.required),
        provBillAddL2MailAdd: new FormControl(''),
        provBillAddPhoneNum: new FormControl('', [CustomValidators.phoneMaskLength]),
        extension: new FormControl('', [Validators.minLength(3), Validators.maxLength(5), CustomValidators.onlyNumbers]),
        provBillAddFaxNum: new FormControl('', [CustomValidators.phoneMaskLength]),
        provBillAddEmail: new FormControl('', [CustomValidators.vaildEmail]),
        // for validation of web user id.
        webUserId: new FormControl('', [Validators.minLength(3), Validators.maxLength(100)]),
        effectiveOn: new FormControl('', Validators.required),
        expiredOn: new FormControl(''),
        provBillAddEftInd: new FormControl(''),
        provAddQsiEftInd: new FormControl(''),
        provAddPaperEftInd:new FormControl(''),
        provBillAddDebitAmt: new FormControl('', Validators.maxLength(10)),
        cda: new FormControl('', Validators.maxLength(4)),
        provBillAddCom: new FormControl('', Validators.maxLength(500)),
        provBillAddDebitType: new FormControl(''),
        languageKey: new FormControl(''),
        languageName: new FormControl(''),
      });
    this.getAllLanguage();
    if (!this.serviceProviderAddMode) {
      this.GetBillAddList(false);
    }
    this.getBtnPermission();
  }

  /* get language list Api */
  getAllLanguage() {
    this.hmsDataService.getApi(CommonApi.getLanguageList).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.languages = data.result;
        this.ServiceProviderBillingAddressFormGroup.patchValue({ languageKey: 1 })
      } else {
        this.languages = []
      }
      error => {
      }
    })
  }

  GetBillAddList(reload) {
    let requestedData = {
      "disciplineKey": this.disciplineKey,
      "provKey": this.providerKey
    }
    this.hmsDataService.postApi(ServiceProviderApi.getServiceProviderBillAddListUrl, requestedData).subscribe(
      res => {
        this.arrBillAddrList = [];
        if (res.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.arrBillAddrList = res.result;
          this.banId = this.arrBillAddrList[0].banId;
          this.ServiceProviderBillingAddressFormGroup.patchValue({
            'bussAddrr': this.banId,
          });
          this.viewMode = true;;
          if (reload) {
            this.reloadTable('spba_BillingAddrInfo')
          } else {
            this.dtTrigger['spba_BillingAddrInfo'].next()
          }
        }
      });
  }

  SaveProviderApproval(datarow: any) {
    var userId = this.currentUserService.currentUser.userId
    let requestedData = {
      "disciplineKey": this.disciplineKey,
      "userId": userId,
      "provApprKey": 0,
      "procMask": "123",
      "provBillingAddressKey": datarow.provBillAddKey,
      "effectiveOn": datarow.effectiveOn,
      "expiredOn": datarow.expiredOn
    }
    this.hmsDataService.postApi(ServiceProviderApi.saveProviderApprovalUrl, requestedData).subscribe(
      res => {
        if (res.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
          this.toastrService.success(this.translate.instant('serviceProvider.toaster.approval'))
          this.reloadTable('spba_BillingAddrInfo')
        }
      });
  }

  reloadTable(tableID) {
    this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  /**
  * Save Update Billing Address
  */
  SaveUpdateBillingAddress(myModal) {
    var billingReqData = [];
    if (this.ServiceProviderBillingAddressFormGroup.valid) {
      var effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.ServiceProviderBillingAddressFormGroup.value.effectiveOn)
      var expiredOn = this.changeDateFormatService.convertDateObjectToString(this.ServiceProviderBillingAddressFormGroup.value.expiredOn)
      var provBillAddEftInd = this.ServiceProviderBillingAddressFormGroup.value.provBillAddEftInd;
      var debitAmtType = this.ServiceProviderBillingAddressFormGroup.value.provBillAddDebitType;
      if (this.ServiceProviderBillingAddressFormGroup.value.provBillAddDebitType == 'isPerc' && this.ServiceProviderBillingAddressFormGroup.value.provBillAddDebitAmt > 100) {
        this.ServiceProviderBillingAddressFormGroup.controls['provBillAddDebitAmt'].setErrors(
          {
            "percentageGreater": true
          });
        return false;
      }
      if (provBillAddEftInd) {
        provBillAddEftInd = 'T'
      }
      else {
        provBillAddEftInd = 'F'
      }
      var provAddQsiEftInd = this.ServiceProviderBillingAddressFormGroup.value.provAddQsiEftInd;
      if (provAddQsiEftInd) {
        provAddQsiEftInd = 'T'
      }
      else {
        provAddQsiEftInd = 'F'
      }
      // Add Paper EFt checkbox which logged as #728(19-Feb-2020)
      var provAddPaperEftInd = this.ServiceProviderBillingAddressFormGroup.value.provAddPaperEftInd;
      if(provAddPaperEftInd){
        provAddPaperEftInd = 'T'
      }else{
        provAddPaperEftInd = 'F'
      }
      if (debitAmtType == 'fixed') {
        debitAmtType = 'F'
      }
      else if (debitAmtType == 'isPerc') {
        debitAmtType = 'P'
      }
      else {
        debitAmtType = ""
      }
      var langDesc = this.languages.filter(val => val.languageKey == this.ServiceProviderBillingAddressFormGroup.value.languageKey).map(data => data.languageDesc)
      var RequestedData
      if (!this.serviceProviderAddMode) {
        RequestedData = {
          "disciplineKey": this.disciplineKey,
          "addressDto": {
            "provBillAddKey": this.provBillAddKey,
            "provKey": this.providerKey,
            "payeeName": this.ServiceProviderBillingAddressFormGroup.value.payeeName,
            "postalCode": this.ServiceProviderBillingAddressFormGroup.value.postalCode,
            "provBillAddL1MailAdd": this.ServiceProviderBillingAddressFormGroup.value.provBillAddL1MailAdd,
            "provBillAddL2MailAdd": this.ServiceProviderBillingAddressFormGroup.value.provBillAddL2MailAdd,
            "provBillAddPhoneNum": this.ServiceProviderBillingAddressFormGroup.value.provBillAddPhoneNum ? this.ServiceProviderBillingAddressFormGroup.value.provBillAddPhoneNum.replace(/[^0-9 ]/g, "") : "",
            "provBillAddPhoneExtn": this.ServiceProviderBillingAddressFormGroup.value.extension,
            "provBillAddFaxNum": this.ServiceProviderBillingAddressFormGroup.value.provBillAddFaxNum ? this.ServiceProviderBillingAddressFormGroup.value.provBillAddFaxNum.replace(/[^0-9 ]/g, "") : "",
            "provBillAddEmail": this.ServiceProviderBillingAddressFormGroup.value.provBillAddEmail,
            "webUserId" : this.ServiceProviderBillingAddressFormGroup.value.webUserId,
            "effectiveOn": effectiveOn,
            "expiredOn": expiredOn,
            "provBillAddEftInd": provBillAddEftInd,
            "provAddQsiEftInd": provAddQsiEftInd,
            "provAddPaperEftInd":provAddPaperEftInd,
            "provBillAddDebitAmt": +this.ServiceProviderBillingAddressFormGroup.value.provBillAddDebitAmt,
            "provBillAddDebitType": debitAmtType,
            "languageKey": this.ServiceProviderBillingAddressFormGroup.value.languageKey,
            "provBillAddCom": this.ServiceProviderBillingAddressFormGroup.value.provBillAddCom,
            "provBillAddCdaNum": this.ServiceProviderBillingAddressFormGroup.value.cda
          }
        }
        this.hmsDataService.postApi(ServiceProviderApi.saveServiceProviderBillAddUrl, RequestedData).subscribe(data => {
          if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
            var action = 'Saved';
            if (this.provBillAddKey) {
              action = "Updated"
            }
            this.disableAddBtn = false
            this.toastrService.success("Billing Address " + action + " Successfully!")
            this.GetBillAddList(true);
            this.ServiceProviderBillingAddressFormGroup.reset();
             myModal.close();
          }
          else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
            this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'))
            this.disableAddBtn = false
          }
          else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
            this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date-greater-previous'))
            this.disableAddBtn = false
          }
        })
      }
      else {
        RequestedData = {
          "provBillAddKey": this.provBillAddKey,
          "provKey": this.providerKey,
          "payeeName": this.ServiceProviderBillingAddressFormGroup.value.payeeName,
          "postalCode": this.ServiceProviderBillingAddressFormGroup.value.postalCode,
          "cityName": this.ServiceProviderBillingAddressFormGroup.value.cityName,
          "provinceName": this.ServiceProviderBillingAddressFormGroup.value.provinceName,
          "countryName": this.ServiceProviderBillingAddressFormGroup.value.countryName,
          "provBillAddL1MailAdd": this.ServiceProviderBillingAddressFormGroup.value.provBillAddL1MailAdd,
          "provBillAddL2MailAdd": this.ServiceProviderBillingAddressFormGroup.value.provBillAddL2MailAdd,
          "provBillAddPhoneNum": this.ServiceProviderBillingAddressFormGroup.value.provBillAddPhoneNum ? this.ServiceProviderBillingAddressFormGroup.value.provBillAddPhoneNum.replace(/[^0-9 ]/g, "") : "",
          "provBillAddPhoneExtn": this.ServiceProviderBillingAddressFormGroup.value.extension,
          "provBillAddFaxNum": this.ServiceProviderBillingAddressFormGroup.value.provBillAddFaxNum ? this.ServiceProviderBillingAddressFormGroup.value.provBillAddFaxNum.replace(/[^0-9 ]/g, "") : "",
          "provBillAddEmail": this.ServiceProviderBillingAddressFormGroup.value.provBillAddEmail,
          "webUserId" : this.ServiceProviderBillingAddressFormGroup.value.webUserId,
          "effectiveOn": effectiveOn,
          "expiredOn": expiredOn,
          "provBillAddEftInd": provBillAddEftInd,
          "provAddQsiEftInd": provAddQsiEftInd,
          "provAddPaperEftInd":provAddPaperEftInd,
          "provBillAddDebitAmt": +this.ServiceProviderBillingAddressFormGroup.value.provBillAddDebitAmt,
          "provBillAddDebitType": debitAmtType,
          "languageKey": this.ServiceProviderBillingAddressFormGroup.value.languageKey,
          "languageName": langDesc.toString(),
          "provBillAddCom": this.ServiceProviderBillingAddressFormGroup.value.provBillAddCom,
          "provBillAddCdaNum": this.ServiceProviderBillingAddressFormGroup.value.cda,
          "checkDate":false
        }
        this.ServiceProviderBillingAddressFormGroup.value.effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.ServiceProviderBillingAddressFormGroup.value.effectiveOn);
        this.ServiceProviderBillingAddressFormGroup.value.expiredOn = this.ServiceProviderBillingAddressFormGroup.value.expiredOn ? this.changeDateFormatService.convertDateObjectToString(this.ServiceProviderBillingAddressFormGroup.value.expiredOn) : ""
        var billingData = RequestedData
        var check;
        if (this.addModeKey) {
          for (var i in this.arrBillAddrList) {
            if (this.arrBillAddrList[i].addModeKey == this.addModeKey) {
              billingData.addModeKey = this.addModeKey
              // To check expiredOn date color
              if(billingData.expiredOn){
                check = this.checkExpiryDate(billingData.expiredOn)
                billingData.checkDate = check
              }
              this.arrBillAddrList[i] = billingData;
            }
          }
        } else {
          billingData.addModeKey = this.arrBillAddrList.length + 1
          // To check expiredOn date color
          if(billingData.expiredOn){
            check = this.checkExpiryDate(billingData.expiredOn)
            billingData.checkDate = check
          }
          this.arrBillAddrList.push(billingData)
        }
        this.addModeKey = ''
         myModal.close();
        this.ServiceProviderBillingAddressFormGroup.reset();
        this.toastrService.success(this.translate.instant('serviceProvider.toaster.billingAddressSaveSuccess'));
      }
    } else {
      this.validateAllFormFields(this.ServiceProviderBillingAddressFormGroup);
    }
  }

  /* to fire validation of all form fields together */
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

  /**
  * Validate PostalCode
  * @param event 
  */
  isCompanyPostalcodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CommonApi.isCompanyPostalcodeValidUrl;
      this.hmsDataService.postApi(URL, postalNumber).subscribe(data => {
        switch (data.code) {
          case 404:
            this.ServiceProviderBillingAddressFormGroup.controls['postalCode'].setErrors(
              {
                "postalcodeNotFound": true
              });
            break;
          case 302:
            this.ServiceProviderBillingAddressFormGroup.patchValue({
              'cityName': data.result.cityName,
              'countryName': data.result.countryName,
              'provinceName': data.result.provinceName
            });
            $('#spba_Addrr1').focus();
            break;
        }
      });
    }
  }

  ViewEditBillingAddress(dataRow: any, actionType: string, myModal) {
    myModal.open();
    let provBillAddEftInd;
    let provAddQsiEftInd;
    let provAddPaperEftInd;
    let provBillAddDebitType;

    if (dataRow.provBillAddEftInd == 'T') {
      provBillAddEftInd = true;
      provAddQsiEftInd = false;
      provAddPaperEftInd = false;
      this.ChangeBillAddEft('provBillAddEftInd');
    }
    if (dataRow.provAddQsiEftInd == 'T') {
      provAddQsiEftInd = true;
      provBillAddEftInd = false;
      provAddPaperEftInd = false;
      this.ChangeBillAddEft('provAddQsiEftInd');
    }
    if(dataRow.provAddPaperEftInd == 'T'){
      provAddPaperEftInd = true;
      provAddQsiEftInd = false;
      provBillAddEftInd = false;
      this.ChangeBillAddEft('provAddPaperEftInd');
    }
    if (dataRow.provAddQsiEftInd == 'T' && dataRow.provBillAddEftInd == 'T' ) {
      provBillAddEftInd = true;
      provAddQsiEftInd = true;
      provAddPaperEftInd = false;
      this.ChangeBillAddEft('QsiAndAddEft',);
    }
    if ( dataRow.provBillAddEftInd == 'T' && dataRow.provAddPaperEftInd =='T') {
      provBillAddEftInd = false;
      provAddQsiEftInd = true;
      provAddPaperEftInd = true;
      this.ChangeBillAddEft('BillAndPaperEft');
    }
    if (dataRow.provAddQsiEftInd == 'T' && dataRow.provAddPaperEftInd =='T') {
      provBillAddEftInd = true;
      provAddQsiEftInd = false;
      provAddPaperEftInd = true;  
      this.ChangeBillAddEft('QsiAndPaperEft');
    }
    if (dataRow.provAddQsiEftInd == 'T' && dataRow.provBillAddEftInd == 'T' && dataRow.provAddPaperEftInd =='T') {
      provBillAddEftInd = true;
      provAddQsiEftInd = true;
      provAddPaperEftInd = true;
      this.ChangeBillAddEft('provAddBothEftInd');
    }
    if (dataRow.provBillAddDebitType == 'F') {
      provBillAddDebitType = "fixed"
    }
    else if (dataRow.provBillAddDebitType == 'P') {
      provBillAddDebitType = "isPerc"
    }
    else {
      provBillAddDebitType = ""
    }
    this.provBillAddKey = dataRow.provBillAddKey;
    if (this.serviceProviderAddMode) {
      this.addModeKey = dataRow.addModeKey
    }
    this.ServiceProviderBillingAddressFormGroup.patchValue(
      {
        "bussAddrr": dataRow.banId,
        "provBillAddKey": dataRow.provBillAddKey,
        "provKey": dataRow.provKey,
        "payeeName": dataRow.payeeName,
        "postalCode": dataRow.postalCode,
        "cityName": dataRow.cityName,
        "countryName": dataRow.countryName,
        "provinceName": dataRow.provinceName,
        "provBillAddL1MailAdd": dataRow.provBillAddL1MailAdd,
        "provBillAddL2MailAdd": dataRow.provBillAddL2MailAdd,
        "provBillAddPhoneNum": dataRow.provBillAddPhoneNum,
        "extension": dataRow.provBillAddPhoneExtn.replace(/\s/g, ""), // Replace added to remove whitespaces from value coming in API response.
        "provBillAddFaxNum": dataRow.provBillAddFaxNum,
        "provBillAddEmail": dataRow.provBillAddEmail,
        "webUserId" : dataRow.webUserId,
        "effectiveOn": this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn),
        "expiredOn": this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn),
        "provBillAddEftInd": provBillAddEftInd,
        "provAddQsiEftInd": provAddQsiEftInd,
        "provAddPaperEftInd":provAddPaperEftInd,
        "provBillAddDebitAmt": CustomValidators.ConvertAmountToDecimal(dataRow.provBillAddDebitAmt),
        "languageKey": dataRow.languageKey,
        "provBillAddCom": dataRow.provBillAddCom,
        "provBillAddDebitType": provBillAddDebitType,
        "cda": dataRow.provBillAddCdaNum,
      }
    )
    if (actionType == "View") {
      this.enableViewMode = true
    } else {
      this.enableViewMode = false
    }
  }

  /**
  * Varify Postal Code and Fill Country/State/City
  * @param event 
  * @param fieldName 
  */
  isCompanyPostalVerifyValid(event, fieldName) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      let countryName = ''
      if (this.ServiceProviderBillingAddressFormGroup.get('countryName').value) {
        countryName = this.ServiceProviderBillingAddressFormGroup.get('countryName').value
      }
      let Province = ''
      if (this.ServiceProviderBillingAddressFormGroup.get('provinceName').value) {
        Province = this.ServiceProviderBillingAddressFormGroup.get('provinceName').value
      }
      let cityName = ''
      if (this.ServiceProviderBillingAddressFormGroup.get('cityName').value) {
        cityName = this.ServiceProviderBillingAddressFormGroup.get('cityName').value
      }
      let postalCode = ''
      if (this.ServiceProviderBillingAddressFormGroup.get('postalCode').value) {
        postalCode = this.ServiceProviderBillingAddressFormGroup.get('postalCode').value
      }
      switch (fieldName) {
        case 'cityName':
          fieldParameter = {
            cityName: event.target.value,
            countryName: countryName,
            provinceName: Province,
            postalCd: postalCode,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'countryName':
          fieldParameter = {
            cityName: cityName,
            countryName: event.target.value,
            provinceName: Province,
            postalCd: postalCode,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'provinceName':
          fieldParameter = {
            countryName: countryName,
            provinceName: event.target.value,
            cityName: cityName,
            postalCd: postalCode,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CommonApi.isCompanyCityProvinceCountryValidUrl;
      this.hmsDataService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.ServiceProviderBillingAddressFormGroup.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.ServiceProviderBillingAddressFormGroup.patchValue({
              'cityName': data.result.cityName,
              'countryName': data.result.countryName,
              'Province': data.result.provinceName
            });
            break;
        }
      });
    }

  }

  /**
  * Convert Amount to Decimal
  * @param evt 
  */
  ConvertAmountToDecimal(evt, frmControlName) {
    var retAmount = CustomValidators.ConvertAmountToDecimal(evt.target.value);
    if (evt.target.value > 100) {
    }
    else {
      this.ServiceProviderBillingAddressFormGroup.patchValue({ "provBillAddDebitAmt": retAmount })
    }
  }

  /**
  * change Date Format
  * @param event 
  * @param frmControlName 
  * @param formName 
  */

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.ServiceProviderBillingAddressFormGroup.patchValue(datePickerValue);
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
      this.ServiceProviderBillingAddressFormGroup.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    if (this.ServiceProviderBillingAddressFormGroup.value.effectiveOn && this.ServiceProviderBillingAddressFormGroup.value.effectiveOn.date && this.ServiceProviderBillingAddressFormGroup.value.expiredOn && this.ServiceProviderBillingAddressFormGroup.value.expiredOn.date) {
      this.error = this.changeDateFormatService.compareTwoDates(this.ServiceProviderBillingAddressFormGroup.value.effectiveOn.date, this.ServiceProviderBillingAddressFormGroup.value.expiredOn.date);
      if (this.error.isError == true) {
        this.ServiceProviderBillingAddressFormGroup.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  openGlobalApproval(mymodal, provBillingAddressKey: string) {  // Multiple calendars are opening at same time(point no-104).
    this.enableViewMode = false;
    if (provBillingAddressKey != '') {
      this.provBillingAddressKey = provBillingAddressKey;
      setTimeout(() => {
        this.serviceProviderService.getProvBillingAddressKey.emit(provBillingAddressKey)
      }, 100);
    }
    this.provBillAddKey = 0;
    this.ServiceProviderBillingAddressFormGroup.reset();
    this.ServiceProviderBillingAddressFormGroup.patchValue({ 'languageKey': 1 });
    this.ServiceProviderBillingAddressFormGroup.patchValue(
      {
        provBillAddEftInd: false,
        provAddQsiEftInd: false,
        provAddPaperEftInd:false
      }
    )
   
  }

  openModal(mymodal, provBillingAddressKey: string) {
     mymodal.open();
    this.enableViewMode = false;
    if (provBillingAddressKey != '') {
      this.provBillingAddressKey = provBillingAddressKey;
      setTimeout(() => {
        this.serviceProviderService.getProvBillingAddressKey.emit(provBillingAddressKey)
      }, 100);
    }
    this.provBillAddKey = 0;
    this.ServiceProviderBillingAddressFormGroup.reset();
    this.ServiceProviderBillingAddressFormGroup.patchValue({ 'languageKey': 1 });
    this.ServiceProviderBillingAddressFormGroup.patchValue(
      {
        provBillAddEftInd: false,
        provAddQsiEftInd: false,
        provAddPaperEftInd:false
      }
    )
  }

  closeModal(mymodal) {
    if (this.ServiceProviderBillingAddressFormGroup.touched) {
      this.exDialog.openConfirm(this.translate.instant('serviceProvider.toaster.modal-message'))
        .subscribe((value) => {
          if (value) {
             mymodal.close();
          } else {
          }
        })
    } else {
       mymodal.close();
    }
  }

  GetBanDetail(dataRow: any, myModal) {
    this.provBillAddKey = dataRow.provBillAddKey;
    this.banId = dataRow.banId;
    let billingInfo = {
      'banId': this.banId,
      'provBillAddKey': this.provBillAddKey,
    }
    this.serviceProviderService.getTestKey.emit(billingInfo)
    this.serviceProviderService.openSBPopup.emit(true)
  }

  onPercChange(type) {
    if (type == 'isPerc') {
      var DebitAmt = this.ServiceProviderBillingAddressFormGroup.controls.provBillAddDebitAmt.value;
      if (DebitAmt > 100) {
        this.ServiceProviderBillingAddressFormGroup.patchValue({ 'provBillAddDebitAmt': parseFloat('0').toFixed(2) });
      }
    }
    if (type == 'fixed') {
      this.ServiceProviderBillingAddressFormGroup.controls['provBillAddDebitAmt'].setErrors({ percentageGreater: null })
      this.ServiceProviderBillingAddressFormGroup.controls['provBillAddDebitAmt'].updateValueAndValidity();
    }
  }
  checkPercentageValue() {
    var provBillAddDebitAmt = this.ServiceProviderBillingAddressFormGroup.controls.provBillAddDebitAmt.value;
    if (provBillAddDebitAmt > 100) {
      this.ServiceProviderBillingAddressFormGroup.patchValue({ 'provBillAddDebitAmt': '' });
    }
  }

  ChangeBillAddEft(formControlName) {
    if (formControlName == 'provBillAddEftInd') {
      this.ServiceProviderBillingAddressFormGroup.patchValue(
        {
          provBillAddEftInd: "true",
          provAddQsiEftInd: false,
          provAddPaperEftInd: false
        }
      )
    }
    else if (formControlName == 'provAddQsiEftInd') {
      this.ServiceProviderBillingAddressFormGroup.patchValue(
        {
          provBillAddEftInd: false,
          provAddQsiEftInd: "true",
          provAddPaperEftInd: false
        }
      )
    }else if(formControlName == 'provAddPaperEftInd'){
      this.ServiceProviderBillingAddressFormGroup.patchValue({
        provBillAddEftInd: false,
        provAddQsiEftInd: false,
        provAddPaperEftInd: "true"
      })
    }
    // QsiAndPaperEft BillAndPaperEft   QsiAndAddEft
    else if(formControlName == 'QsiAndPaperEft'){
      this.ServiceProviderBillingAddressFormGroup.patchValue({
        provBillAddEftInd: false,
        provAddQsiEftInd: "true",
        provAddPaperEftInd: "true"
      })
    }
    else if(formControlName == 'BillAndPaperEft'){
      this.ServiceProviderBillingAddressFormGroup.patchValue({
        provBillAddEftInd: "true",
        provAddQsiEftInd: false,
        provAddPaperEftInd: "true"
      })
    }
    else if(formControlName == 'QsiAndAddEft'){
      this.ServiceProviderBillingAddressFormGroup.patchValue({
        provBillAddEftInd: "true",
        provAddQsiEftInd: "true",
        provAddPaperEftInd: false
      })
    }
    else if (formControlName == 'provAddBothEftInd') {
      this.ServiceProviderBillingAddressFormGroup.patchValue(
        {
          provBillAddEftInd: "true",
          provAddQsiEftInd: "true",
          provAddPaperEftInd: "true"
        }
      )
    }
  }
    
    DeleteInfo(dataRow){
     this.exDialog.openConfirm('Please Confirm Delete Provider Billing Address ?').subscribe((value) => {
      if(value)
         {
          this.showLoader = true;
             var requestedData;
               requestedData={
                "disciplineKey": this.disciplineKey,
                "addressDto": {
                  "provBillAddKey":dataRow.provBillAddKey,
                 }
                }
              this.hmsDataService.postApi(ServiceProviderApi.deleteServiceProviderBillAdd,requestedData).subscribe(data=>
               {
                  if(data.code == 200 && data.hmsMessage.messageShort == "RECORD_DELETED_SUCCESSFULLY")
                  {
                     this.toastrService.success(this.translate.instant('card.toaster.record-delete'));
                     this.GetBillAddList(true);
                     this.showLoader=false
                  }
                  else if (data.code == 400 && data.status === "BAD_REQUEST") {
                    this.toastrService.error(this.translate.instant('Error Record Not Found'))
                      this.showLoader = false;
                    }
                    else if (data.code == 208 && data.status === "ALREADY_REPORTED") {
                      this.toastrService.error(this.translate.instant('Provider Is Linked With Claim'))
                        this.showLoader = false;
                      }
                })
              } 
            })
    }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  getBtnPermission(){
    this.sbButtonPermission=false;
    let userType = JSON.parse(localStorage.getItem('type'))
        let userTypeArray = []
        userType.forEach(element => {
          userTypeArray.push(element.userTypeKey);
        });
        let submitData = {
          "userTypeKeyList": userTypeArray
        }
        this.hmsDataService.postApi(CommonApi.getMenuActionsByRoleKey, submitData).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            for(var i in data.result){
              if(data.result[i].menuName === "Search Ban"){
                for(var ii in data.result[i].actions){
                  if(data.result[i].actions[ii].actionName === "Search Ban "){
                    if(data.result[i].actions[ii].actionAccess === 'T'){
                      this.sbButtonPermission=true;
                      // To show processing.
                      this.noData = false
                    }
                  }
                }
              }
            }
          }
        });
  }

  checkExpiryDate(date){
    if(date){
      var check = this.changeDateFormatService.isFutureDate(date)
      if (check) {
        return false // black color
      } else {
        return true // red color
      }
    }
  }

}