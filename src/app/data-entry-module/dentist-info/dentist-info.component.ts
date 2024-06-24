import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommonApi } from '../../common-module/common-api';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { TranslateService } from '@ngx-translate/core';
import { DataEntryApi } from '../data-entry-api';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { Subject } from 'rxjs/Rx';//Import Component For Add Card Holder Form Pop Up
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { Constants } from '../../common-module/Constants'
import { DentistInfoService } from './dentist-info.service';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { DataEntryService } from '../data-entry.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { RequestOptions, Headers } from '@angular/http';
import { UftApi } from '../../unit-financial-transaction-module/uft-api';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';

@Component({
  selector: 'app-dentist-info',
  templateUrl: './dentist-info.component.html',
  styleUrls: ['./dentist-info.component.css'],
  moduleId: module.id.toString(),
  providers: [DatatableService, ChangeDateFormatService, TranslateService, DentistInfoService]
})

export class DentistInfoComponent implements OnInit {
  providerSpecialtyRemote: CompleterData;

  showClaimbtn: boolean = false;
  templateType: any;
  serviceProviderData: any;
  mt_postalCode: any;
  mt_addressLine1: any;
  mt_city: any;
  mt_addressLine2: any;
  mt_province: any;
  mt_country: any;
  mt_fax: any;
  mt_phone: any;
  mt_effectiveOn: any;
  mt_expiredOn: any;
  mt_addressLine3: any;
  mt_facilityNumber: any;
  mt_businessArrangementNumber: any;
  today: Date;
  showLoader: boolean;
  mt_providerLastName: any;
  mt_providerFirstName: any;
  allowedValue: any;
  selectedFile: any;
  selectedFileName: string;
  selectedProvider: any = [];
  selectedProviderListarrn: any;
  selectedOverrideReason: any[];
  public isOpen: boolean = false;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  //Date Picker Options
  providerList = [];

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  dentistAddressFormGroup: FormGroup;
  mailTemplatesFormGroup: FormGroup;
  importProviderFormGroup: FormGroup;
  arrAddrList = [];
  arrSpciality = [];
  providerListarr = []

  addMode: boolean = true; //Enable true when user add a new card
  viewMode: boolean = false; //Enable true after a new card added
  editMode: boolean = false; //Enable true after viewMode when user clicks edit button
  @Input() providerKey: string;
  @Input() disciplineKey: any;
  phoneMask = CustomValidators.phoneMask; // add phone format to phone field
  buttonText = "Save";
  FormGroup: FormGroup
  serviceProviderHeading: string;//Heading name change on add/edit
  breadCrumbText: string;
  provAddressKey;
  businessArrangementNumber;
  error: any;
  provBillingaddressLine1Key;
  hasValues: boolean = false;
  enableViewMode: boolean = false;
  @ViewChildren(DataTableDirective)
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  disableAddBtn: boolean = false;
  addressEditMode: boolean = false;
  editIdx
  authCheck = [{
    'addNewDentistAddress': 'F',
    'saveDentist': 'F',
    'editDentist': 'F',
    'editDentistAddress': 'F',
    "search": 'F',
  }]
  allowedExtensions = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  mailTemplateType = ["AHC2096 Request Form", "AHC Annual Letter", "AHC Receipt"]
  selectedProvFile
  allowedProvValue: any
  provError: any
  provError1: any
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  allowedExtension = ["application/pdf"]
  constructor(
    private fb: FormBuilder,
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private dataTableService: DatatableService,
    private dentistInfoService: DentistInfoService,
    private exDialog: ExDialog,
    private router: Router,
    private route: ActivatedRoute,
    private dataEntryService: DataEntryService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,

  ) {
    this.provError = { isError: false, errorMessage: '' };
    this.provError1 = { isError: false, errorMessage: '' };
  }
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  ngOnInit() {
    this.getSkillCode()
    this.getProviderList();
    this.getbckBtn()
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthArray()
        localStorage.setItem('isReload', '')
      })
    } else {
      this.getAuthArray()
    }
    this.breadCrumbText = "ADD Provider";
    this.dtOptions['dI_AddrInfo'] = Constants.dtOptionsConfig
    this.dtTrigger['dI_AddrInfo'] = new Subject();
    this.FormGroup = new FormGroup({
      "providerLastName": new FormControl('', [Validators.required, Validators.maxLength(50)]),
      "providerFirstName": new FormControl('', [Validators.required, Validators.maxLength(50)]),
      "providerAlertMessage": new FormControl(''),
      "providerUli": new FormControl('', [Validators.required]),
      "licenseNo": new FormControl(''),
      "providerSpecialty": new FormControl(''),
      'comment': new FormControl(''),
      'documentName': new FormControl('', [])
    });

    this.dentistAddressFormGroup = new FormGroup
      ({
        businessArrangementNumber: new FormControl('', Validators.required),
        postalCode: new FormControl('', [Validators.required, Validators.maxLength(7)]),
        city: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        province: new FormControl('', Validators.required),
        addressLine1: new FormControl('', Validators.required),
        phone: new FormControl('', [CustomValidators.phoneMaskLength]),
        extension: new FormControl('', [Validators.minLength(3), Validators.maxLength(5), CustomValidators.onlyNumbers]),
        effectiveOn: new FormControl('', Validators.required),
        expiredOn: new FormControl(''),
        facilityNumber: new FormControl(''),
      });


    this.mailTemplatesFormGroup = new FormGroup
      ({
        templateType: new FormControl('', Validators.required)
      });


    this.importProviderFormGroup = new FormGroup
      ({
        file: new FormControl('', Validators.required),
        selectedFileName: new FormControl('')
      });

    this.getproviderSpecialtyList();

    if (this.route.snapshot.url[1]) {
      if (this.route.snapshot.url[1].path == "view") {
        this.EnableViewMode();
      }
    }
    this.error = { isError: false, errorMessage: '' };

  }

  editStatusValue(feild = null) {
  }
  /* get Skill Code list Api */
  getSkillCode() {
    let url = DataEntryApi.getProviderSpecialityList
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        let tempArray = [];
        for (var i = 0; i < data.result.length; i++) {
          tempArray.push({ 'id': data.result[i], 'itemName': data.result[i] })
        }
        this.providerSpecialtyRemote = this.completerService.local(
          tempArray,
          "id",
          "itemName"
        );
      } else {
        let tempArray = []
        this.providerSpecialtyRemote = this.completerService.local(
          tempArray,
          "id",
          "itemName"
        );
      }
    });
  }

  onSelectFeeModifier(item: any, value) {
    let val;
    if (item != null) {
      val = item.title || item.id;
    }
    else {
      val = ""
    }
  }

  /* Get ProviderList Type List for Predictive Search */
  getProviderList() {
    var URL = UftApi.getCardholderNameForClaimPayment;
    this.hmsDataService.getApi(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let arr = [];
        for (var i = 0; i < data.result.length; i++) {
          arr.push({ 'id': data.result[i].cardholderKey, 'itemName': data.result[i].cardholderName })

        }
        this.providerList = arr
      }
    });
  }
  importServiceProviders() {
    this.hmsDataService.OpenCloseModal('fileUplaodpopup');
  }

  /**
    * Get selected multi select list
    * @param item 
    */
  onSelectMultiDropDown(item: any, type) {
    this.selectedOverrideReason = []
    for (var j = 0; j < this.providerListarr.length; j++) {
      this.selectedProviderListarrn.push({ 'id': this.providerList[j]['id'], 'itemName': this.providerList[j]['itemName'] })
    }
    if (type == 'providerListarr') {
      this.FormGroup.controls[type].setValue(this.selectedProviderListarrn);
    }
  }


  getAuthArray() {
    let checkArray = this.currentUserService.authChecks['APR']
    let searchVal = this.currentUserService.authChecks['DPR'].filter(val => val.actionObjectDataTag == 'DPR250').map(data => data)
    checkArray.push(searchVal[0])
    this.getAuthCheck(checkArray)
  }
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.authCheck = [{
        'addNewDentistAddress': 'T',
        'saveDentist': 'T',
        'editDentist': 'T',
        'editDentistAddress': 'T',
        'search': 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }

      this.authCheck = [{
        'addNewDentistAddress': authCheck['APR245'],
        'saveDentist': authCheck['APR246'],
        'editDentist': authCheck['APR256'],
        'editDentistAddress': authCheck['APR247'],
        'search': authCheck['DPR250'],
      }]
    }
  }
  ngAfterViewInit() {
    this.dtTrigger['dI_AddrInfo'].next()
  }


  EnableViewMode() {
    this.route.params.subscribe((params: Params) => {
      this.providerKey = params['id']
      this.GetAddList(true);
    });

    this.buttonText = "Edit";
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false;
    this.serviceProviderHeading = "View"

    this.FormGroup.disable();

    this.breadCrumbText = "VIEW SERVICE PROVIDER"// View Card;
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false;
    this.FormGroup.disable();
  }

  enableEditMode() {
    this.FormGroup.enable();
    this.breadCrumbText = "EDIT SERVICE PROVIDER";
    this.serviceProviderHeading = "Edit";
    this.viewMode = false;
    this.addMode = false;
    this.editMode = true;
    this.buttonText = "Update";
    this.FormGroup.get('providerUli').disable()
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
  }



  GetAddList(reload) {
    let requestedData = {
      "provKey": this.providerKey
    }

    this.hmsDataService.postApi(DataEntryApi.getProviderDetails, requestedData).subscribe(
      res => {
        this.arrAddrList = [];
        if (res.code == 200 && res.result) {
          this.arrAddrList = res.result.providerAddress;
          let data = res.result;

          this.FormGroup.patchValue({
            "licenseNo": data.licenseNo,
            "providerFirstName": data.providerFirstName,
            "providerLastName": data.providerLastName,
            "providerUli": data.providerUli,
            "providerAlertMessage": data.providerAlertMessage,
            "provideraddressLine1": this.arrAddrList,
            "providerSpecialty": data.providerSpecialty
          })
          //Start
          this.mt_providerFirstName = data.providerFirstName;
          this.mt_providerLastName = data.providerLastName;
          //End
          if (reload) {
            this.reloadTable('dI_AddrInfo')
          } else {
            this.dtTrigger['dI_AddrInfo'].next()
          }
        }
      });
  }


  ValidateProviderUli() {
    let requestedData = {
      "providerUli": +this.FormGroup.controls.providerUli.value
    }
    this.hmsDataService.postApi(DataEntryApi.ValidateUli, requestedData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.FormGroup.controls['providerUli'].setErrors({
          "providerUliExist": true
        });

      } if (data.code == 404 && data.status === "NOT_FOUND") {
        this.FormGroup.controls['providerUli'].setErrors(null);
      }
    });
  }

  fillProviderDetails(provId) {
    let requestedData = {
      "provKey": provId
    }
    this.hmsDataService.postApi(DataEntryApi.getProviderDetails, requestedData).subscribe(
      res => {
        this.arrAddrList = [];
        if (res.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.arrAddrList = res.result;
          this.viewMode = true;
        }
      });
  }

  getproviderSpecialtyList() {
    this.arrSpciality = [
      {
        'id': 1,
        'name': 'spl 1'
      },
      {
        'id': 2,
        'name': 'spl 2'
      },
      {
        'id': 3,
        'name': 'spl 3'
      }
    ]
  }


  reloadTable(tableID) {
    this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }


  SaveDentistInfoData() {
    if (this.FormGroup.valid) {
      if (this.arrAddrList.length == 0) {
        this.toastrService.warning('Please Add Provider Address!');
        return false;
      }
      let provideraddressLine1 = this.arrAddrList
      let ReauestedData = {
        "licenseNo": this.FormGroup.controls.licenseNo.value,
        "providerFirstName": this.FormGroup.controls.providerFirstName.value,
        "providerLastName": this.FormGroup.controls.providerLastName.value,
        "providerUli": +this.FormGroup.controls.providerUli.value,
        "providerSpecialty": this.FormGroup.controls.providerSpecialty.value,
        "providerAlertMessage": this.FormGroup.controls.providerAlertMessage.value,
        "providerAddress": provideraddressLine1
      }
      this.hmsDataService.postApi(DataEntryApi.saveProvider, ReauestedData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
          var action = 'Saved';
          this.disableAddBtn = false
          this.toastrService.success("Provider " + action + " Successfully!");
          this.router.navigate(['/dataEntry/dentist/view/' + data.result.providerKey])
          this.dentistAddressFormGroup.reset();
        }
        else if (data.code == 400 && data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
          this.toastrService.warning("Effective Date Should Be Greater Than Previous Expiry Date!")
          this.disableAddBtn = false
        }
      })
    }
    else {
      this.validateAllFormFields(this.FormGroup);
    }
  }

  UpdateDentistInfo() {
    if (this.FormGroup.valid) {
      let ReauestedData = {
        "provKey": +this.providerKey,
        "licenseNo": this.FormGroup.controls.licenseNo.value,
        "providerFirstName": this.FormGroup.controls.providerFirstName.value,
        "providerLastName": this.FormGroup.controls.providerLastName.value,
        "providerUli": +this.FormGroup.controls.providerUli.value,
        "providerSpecialty": this.FormGroup.controls.providerSpecialty.value,
        "providerAlertMessage": this.FormGroup.controls.providerAlertMessage.value,
        "providerAddress": []
      }
      this.hmsDataService.postApi(DataEntryApi.saveProvider, ReauestedData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
          var action = 'Updated';
          this.disableAddBtn = false
          this.viewMode = true;
          this.addMode = false;
          this.editMode = false;
          this.toastrService.success("Provider " + action + " Successfully!");
          this.EnableViewMode();
        }
      })
    }
    else {
      this.validateAllFormFields(this.FormGroup);
    }
  }

  /**
  * Save Update Billing addressLine1
  */
  SaveUpdateaddress(myModal) {
    if (this.dentistAddressFormGroup.valid) {
      this.disableAddBtn = true
      var effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.dentistAddressFormGroup.value.effectiveOn)
      var expiredOn = this.changeDateFormatService.convertDateObjectToString(this.dentistAddressFormGroup.value.expiredOn)


      if (this.addMode) {
        var RequestedData = {
          "businessArrangementNumber": this.dentistAddressFormGroup.value.businessArrangementNumber,
          "facilityNumber": this.dentistAddressFormGroup.value.facilityNumber,
          "postalCode": this.dentistAddressFormGroup.value.postalCode,
          "addressLine1": this.dentistAddressFormGroup.value.addressLine1,
          "city": this.dentistAddressFormGroup.value.city,
          "province": this.dentistAddressFormGroup.value.province,
          "country": this.dentistAddressFormGroup.value.country,
          "phone": this.dentistAddressFormGroup.value.phone ? this.dentistAddressFormGroup.value.phone.replace(/[^0-9 ]/g, "") : "",
          "extension": this.dentistAddressFormGroup.value.extension,
          "effectiveOn": effectiveOn,
          "expiredOn": expiredOn,
        }
        var action = '';
        if (this.editIdx || this.editIdx == 0) {
          action = "Updated"
          this.arrAddrList[this.editIdx] = RequestedData
        } else {
          this.arrAddrList.push(RequestedData)
          action = 'Saved'
        }

        this.disableAddBtn = false
        this.toastrService.success("Provider Address " + action + " Successfully!")
        this.provAddressKey = 0;
        this.reloadTable('dI_AddrInfo')
        this.dentistAddressFormGroup.reset();
        myModal.close();

      }
      else {
        let RequestedData = {
          "provKey": +this.providerKey,
          "providerAddress": [
            {
              "businessArrangementNumber": this.dentistAddressFormGroup.value.businessArrangementNumber,
              "facilityNumber": this.dentistAddressFormGroup.value.facilityNumber,
              "postalCode": this.dentistAddressFormGroup.value.postalCode,
              "addressLine1": this.dentistAddressFormGroup.value.addressLine1,
              "city": this.dentistAddressFormGroup.value.city,
              "province": this.dentistAddressFormGroup.value.province,
              "country": this.dentistAddressFormGroup.value.country,
              "phone": this.dentistAddressFormGroup.value.phone ? this.dentistAddressFormGroup.value.phone.replace(/[^0-9 ]/g, "") : "",
              "effectiveOn": effectiveOn,
              "expiredOn": expiredOn,
            }
          ]
        }

        let ApiName = DataEntryApi.saveProviderAddress;

        if (this.provAddressKey) {
          ApiName = DataEntryApi.editProviderAddress;
          Object.assign(RequestedData, { "provAddressKey": this.provAddressKey })
        }

        this.hmsDataService.postApi(ApiName, RequestedData).subscribe(data => {
          if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
            var action = 'Saved';
            if (this.provAddressKey) {
              action = "Updated"
            }
            this.disableAddBtn = false
            this.toastrService.success("Provider Address " + action + " Successfully!")
            this.provAddressKey = 0;
            this.GetAddList(true);
            this.dentistAddressFormGroup.reset();
            myModal.close();
          }
        })
      }
    } else {
      this.validateAllFormFields(this.dentistAddressFormGroup);
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
            this.dentistAddressFormGroup.controls['postalCode'].setErrors(
              {
                "postalcodeNotFound": true
              });
            break;
          case 302:
            this.dentistAddressFormGroup.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            $('#dentist_Addrr1').focus();
            break;
        }
      });
    }
  }


  ViewEditAddress(dataRow: any, actionType: string, myModal, idx) {
    this.editIdx = idx
    if (actionType == "View") {
      this.enableViewMode = true
    } else {
      this.enableViewMode = false
      this.addressEditMode = true
    }
    myModal.open();
    this.provAddressKey = dataRow.providerAddressKey;
    this.dentistAddressFormGroup.patchValue(
      {
        "businessArrangementNumber": dataRow.businessArrangementNumber,
        "provAddressKey": dataRow.providerAddressKey,
        "postalCode": dataRow.postalCode,
        "city": dataRow.city,
        "phone": dataRow.phone,
        "extension": dataRow.extension,
        "country": dataRow.country,
        "province": dataRow.province,
        "addressLine1": dataRow.addressLine1,
        "effectiveOn": this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn),
        "expiredOn": this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn),
        "facilityNumber": dataRow.facilityNumber,
      }
    )

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
      let country = ''

      if (this.dentistAddressFormGroup.get('country').value) {
        country = this.dentistAddressFormGroup.get('country').value
      }

      let Province = ''
      if (this.dentistAddressFormGroup.get('province').value) {
        Province = this.dentistAddressFormGroup.get('province').value
      }

      let city = ''
      if (this.dentistAddressFormGroup.get('city').value) {
        city = this.dentistAddressFormGroup.get('city').value
      }

      let postalCode = ''
      if (this.dentistAddressFormGroup.get('postalCode').value) {
        postalCode = this.dentistAddressFormGroup.get('postalCode').value
      }
      switch (fieldName) {
        case 'city':
          fieldParameter = {
            city: event.target.value,
            country: country,
            province: Province,
            postalCd: postalCode,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'country':
          fieldParameter = {
            city: city,
            country: event.target.value,
            province: Province,
            postalCd: postalCode,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'province':
          fieldParameter = {
            country: country,
            province: event.target.value,
            city: city,
            postalCd: postalCode,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CommonApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {

        switch (data.code) {
          case 404:
            this.dentistAddressFormGroup.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.dentistAddressFormGroup.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'Province': data.result.provinceName
            });

            break;
        }

      });
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
      this.dentistAddressFormGroup.patchValue(datePickerValue);
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
      this.dentistAddressFormGroup.patchValue(datePickerValue);
    }
    if (this.dentistAddressFormGroup.value.effectiveOn && this.dentistAddressFormGroup.value.effectiveOn.date && this.dentistAddressFormGroup.value.expiredOn && this.dentistAddressFormGroup.value.expiredOn.date) {
      this.error = this.changeDateFormatService.compareTwoDates(this.dentistAddressFormGroup.value.effectiveOn.date, this.dentistAddressFormGroup.value.expiredOn.date);
      if (this.error.isError == true) {
        this.dentistAddressFormGroup.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }

  openModal(mymodal, provBillingaddressLine1Key: string) {
    this.enableViewMode = false;
    mymodal.open();
    if (provBillingaddressLine1Key != '') {
      this.provBillingaddressLine1Key = provBillingaddressLine1Key;
      setTimeout(() => {
        this.dentistInfoService.getProvBillingAddressKey.emit(provBillingaddressLine1Key)
      }, 100);
    }
    this.provAddressKey = 0;
    this.editIdx = null
    this.dentistAddressFormGroup.reset();
  }

  closeModal(mymodal) {
    //
    if (this.dentistAddressFormGroup.touched) {
      this.exDialog.openConfirm("Changes you made may not be saved. Are you sure you want to leave?")
        .subscribe((value) => {

          if (value) {
            this.GetAddList(true);
            mymodal.close();
            document.getElementById('sp_save').focus()
          } else {

          }
        })
      setTimeout(() => {
        document.getElementById('confirmPopupButton').focus()
      }, 300);

    } else {
      mymodal.close();
    }
  }


  GetBanDetail(dataRow: any, myModal) {
    this.provAddressKey = dataRow.provAddressKey;
    this.businessArrangementNumber = dataRow.businessArrangementNumber;
    let billingInfo = {
      'businessArrangementNumber': this.businessArrangementNumber,
      'provAddressKey': this.provAddressKey,
    }
    this.dentistInfoService.getTestKey.emit(billingInfo)
    myModal.open();
  }
  backToSearch() {
    this.dataEntryService.isBackProviderSearch = true
  }

  getbckBtn() {
    if (this.dataEntryService.showClaimBckBtn) {
      this.showClaimbtn = true
      this.dataEntryService.showClaimBckBtn = false
    }
    else {
      this.showClaimbtn = false
    }
  }

  /**
   * Open Mail Merge Template 
   */
  mailMerge(dataRow: any, actionType: string, myModal, idx) {
    this.hmsDataService.OpenCloseModal('mailTemplatesFormPopUp');
    this.serviceProviderData = dataRow;
  }

  resetMailTemplateForm() {
    this.mailTemplatesFormGroup.reset();
  }

  resetImportProvider() {
    this.importProviderFormGroup.reset();
  }

  uploadFile() {
    if (this.importProviderFormGroup.valid) {
      if (this.allowedValue) {
        this.showLoader = true
        var formData = new FormData()
        let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
        let header = new Headers({ 'Authorization': this.currentUserService.token });
        let options = new RequestOptions({ headers: header });
        formData.append('file ', this.selectedFile);
        var URL = DataEntryApi.importProvidersData;
        try {
          this.hmsDataService.sendFormData(URL, formData).subscribe(data => {
            this.showLoader = false;
            if (data.code == 200) {

              this.toastrService.success("Provider Details Updated Successfully");
              this.importProviderFormGroup.patchValue({
                'selectedFileName': ""
              })
              this.importProviderFormGroup.reset();
              this.selectedFileName = "";
            } else if (data.code == 400 && data.hmsMessage.messageShort == "EMPTY_FILE_CAN'T_BE_UPLOADED.") {
              this.toastrService.error("Empty File Can't Be Uploaded");
            } else if (data.code == 400 && data.hmsMessage.messageShort == "INVALID_DATA") {
              this.toastrService.error("Invalid Data");
            } else if (data.code == 500 && data.hmsMessage.messageShort == "RECORD_UPDATE_FAILED") {
              this.toastrService.error("Record Update Failed");
            } else {

              this.toastrService.error("Failed To Update Provider Details");
            }
          }, error => {
            this.showLoader = false;
            this.toastrService.error("Failed To Update Provider Details");
            this.importProviderFormGroup.patchValue({
              'selectedFileName': ""
            })
            this.importProviderFormGroup.reset();
          })
        } catch (error) {
          this.showLoader = false
        }

      } else {
        this.showLoader = false
        return false
      }
    } else {
      this.showLoader = false
      this.validateAllFormFields(this.importProviderFormGroup);

    }

  }
  onFileChanged(event) {
    this.selectedFileName = ""
    if (event.target.files.length == 0) {
      this.error = { isError: false, errorMessage: '' };
      return false
    }
    this.selectedFile = event.target.files[0]

    this.importProviderFormGroup.patchValue({
      'selectedFileName': this.selectedFile.name
    })
    this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only xlsx file types are allowed.' };
      this.toastrService.error("Only xlsx file types are allowed.");

    } else {
      this.error = { isError: false, errorMessage: '' };
      this.uploadFile()
    }

  }


  proceedTemplate() {
    if (this.mailTemplatesFormGroup.valid) {
      this.showLoader = true;
      this.templateType = this.mailTemplatesFormGroup.value.templateType;
      //Service Provider Data Fetch Here       
      this.today = new Date();
      this.mt_providerFirstName = this.mt_providerFirstName;
      this.mt_providerLastName = this.mt_providerLastName;
      this.mt_postalCode = this.serviceProviderData.postalCode;
      this.mt_addressLine1 = this.serviceProviderData.addressLine1;
      this.mt_addressLine2 = this.serviceProviderData.addressLine2;
      this.mt_city = this.serviceProviderData.city;
      this.mt_province = this.serviceProviderData.province;
      this.mt_country = this.serviceProviderData.country;
      this.mt_phone = this.serviceProviderData.phone;
      this.mt_fax = this.serviceProviderData.fax;
      this.mt_effectiveOn = this.serviceProviderData.effectiveOn;
      this.mt_expiredOn = this.serviceProviderData.expiredOn;
      this.mt_addressLine3 = this.serviceProviderData.addressLine3;
      this.mt_facilityNumber = this.serviceProviderData.facilityNumber;
      this.mt_businessArrangementNumber = this.serviceProviderData.businessArrangementNumber;
      switch (this.templateType) {
        case "AHC2096 Request Form":
          setTimeout(() => { this.downloadFile('exportContent1', 'AHC2096 Request Form'); }, 2000)
          break;

        case "AHC Annual Letter":
          setTimeout(() => { this.downloadFile('exportContent3', 'AHC Annual Letter'); }, 2000)
          break

        case "AHC Receipt":
          setTimeout(() => { this.downloadFile('exportContent2', 'AHC Receipt'); }, 2000);
          break

        default:
          break;
      }
    } else {
      this.validateAllFormFields(this.mailTemplatesFormGroup);
    }
  }

  /**
   * Function to export HTML to Word document
   * @param element(Table Id) 
   * @param filename 
   */
  downloadFile(element, filename = '') {
    this.showLoader = false;
    var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    var postHtml = "</body></html>";
    var html = preHtml + document.getElementById(element).innerHTML + postHtml;
    var blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    // Specify link url
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    // Specify file name
    filename = filename ? filename + '.doc' : 'document.doc';
    // Create download link element
    var downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // Create a link to the file
      downloadLink.href = url;
      // Setting the file name
      downloadLink.download = filename;
      //triggering the function
      downloadLink.click();
    }
    document.body.removeChild(downloadLink);
  }

  //Log #1314
  onProvFileChanged(event) {
    this.FormGroup.value.documentName = ""
    this.selectedProvFile = event.target.files[0]
    let fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.provError1 = { isError: true, errorMessage: 'File size shuold not greater than 2 Mb!' };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.provError1 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.FormGroup.patchValue({ 'documentName': event.target.files[0].name });
    this.allowedProvValue = this.allowedExtension.includes(event.target.files[0].type)
    if (!this.allowedProvValue) {
      this.provError = { isError: true, errorMessage: 'Only pdf file type are allowed.' };
      this.showRemoveBtn = true;
    } else {
      this.provError = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }
  }

  removeExtension() {
    this.FormGroup.patchValue({ 'documentName': '' });
    this.showRemoveBtn = false;
    this.selectedProvFile = ""
    this.allowedProvValue = false
    this.fileSizeExceeds = false
    this.provError = { isError: false, errorMessage: '' };
    this.provError1 = { isError: false, errorMessage: '' };
  }

}