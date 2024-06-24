import { Component, OnInit, Input, HostListener, QueryList } from '@angular/core';
import { FormGroup, FormControl, FormArray, NgForm, Validators } from '@angular/forms'; // Importing Reactive Form related classes.
import { Subject } from 'rxjs/Rx';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi } from '../../../card-module/card-api';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ServiceProviderApi } from '../../service-provider-api';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { ServiceProviderService } from '../../serviceProvider.service';
import { CommonApi } from '../../../common-module/common-api';

@Component({
  selector: 'app-ban-bank-account',
  templateUrl: './ban-bank-account.component.html',
  styleUrls: ['./ban-bank-account.component.css'],
  providers: [DatatableService]
})

export class BanBankAccountComponent implements OnInit {
  reqParam: { 'key': string; 'value': any; }[];
  url: string;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  arrTopupMax;
  arrMaxPeriodType;
  searchBanDetails;
  columns;
  currentUserId: any;
  currentUser: any;
  addMode: boolean = false;
  editMode: boolean = false;
  viewMode: boolean = false;
  disableAddNew: boolean = false;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  selectedRowId = '';
  arrBankList = [];
  hideExistingContainer: boolean = true
  dtElements: QueryList<any>;
  dtTrigger: Subject<any>[] = [];
  buttonText = 'Save'
  @Input() provBillAddKey: string;
  @Input() disciplineKey: string;
  @Input() banId: string;
  @Input() serviceProviderEditMode: boolean; //set value edit value
  @Input() serviceProviderViewMode: boolean; //set value View value
  @Input() serviceProviderAddMode: boolean; //set value Add value
  @Input() returnId: boolean; //set value Add value
  @Input() cardKey: string;
  @Input() providerKey: string;
  @Input() searchBanChecks: any;
  @Input() serviceProviderChecks: any;

  public BANSetupFormGroup: FormGroup; //change private to public for production-build
  public ExistingBanForm: FormGroup; //change private to public for production-build
  //searchBanDetails;
  //columns;

  banBankAccountChecks = [{
    "useExistingBan": 'F',
    "addNewBankAccount": 'F',
    "saveSetupBan": 'F',
    "searchExistingBan": 'F',
  }]

  arrNewMaximumArray = {
    "provBankNum": "",
    "provBankBranchNum": "",
    "provBankAcctNum": "",
    "effectiveOn": "",
    "expiredOn": "",
    "provBankName":""
  }

  /* New Empty Record array */
  newRecordValidate: boolean = false;
  showBankAccount;
  banDetails;
  error: any;
  disableAddBtn: boolean = false;
  disableBanId: boolean = false;
  
  // for File Select field in comments
  selectedFile;
  error1: any
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false
  updateEffectiveDate = []
  updateExpiredDate = []
  effectiveOnObj
  expiredOnObj
  provBankNum = ""
  provBankBranchNum = ""
  provBankAcctNum = ""
  provBankName = ""
  constructor(
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    public dataTableService: DatatableService,
    private serviceProviderService: ServiceProviderService,
    private currentUserService: CurrentUserService
  ) {
    this.error = { isError: false, errorMessage: '' };
    serviceProviderService.getDisciplineKey.subscribe(disciplineKey => {
      this.disciplineKey = disciplineKey
    })
    serviceProviderService.openSBPopup.subscribe(value => {
      if (value) {
        this.hideExistingContainer = true
      }
    })
    serviceProviderService.getTestKey.subscribe(billingInfo => {
      this.arrBankList = [];
      this.selectedRowId = '';
      if (billingInfo.fromSearchBan) {
        this.provBillAddKey = billingInfo.provBillAddKey;
      }
      if (billingInfo.banId == '') {
        this.AddNew();
        this.BANSetupFormGroup.enable();
        this.BANSetupFormGroup.reset();
        this.arrBankList = [];
        this.disableAddNew = true;
        this.disableBanId = false
      }
      else {
        this.disableBanId = true
        this.addMode = false;
        var requestedData = {
          "banId": billingInfo.banId,
          "disciplineKey": this.disciplineKey,
        }
        //Set disciplineKey 1 when data searched with "All" because only Dental is set on All type.
        if (requestedData.disciplineKey == "0" || requestedData.disciplineKey == null) {
          requestedData.disciplineKey = "1"
        }        
        this.hmsDataService.postApi(ServiceProviderApi.getServiceProviderBanDetailUrl, requestedData).subscribe(res => {
          if (res.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
            let data = res.result;
            this.BANSetupFormGroup.patchValue(
              {
                'ban': data.banId,
                "clientName": data.banClientName,
                "banEffectiveDate": this.changeDateFormatService.convertStringDateToObject(data.effectiveOn),
                "expdate": this.changeDateFormatService.convertStringDateToObject(data.expiredOn),
                "comments": data.banComm,
              })
            this.arrBankList = data.bankList;
            this.disableAddNew = false;
            this.addMode = false;
          }
        })
      }
    })
        // to set errors false by default in File Select field of Comments.
        this.error = { isError: false, errorMessage: '' };
        this.error1 = { isError: false, errorMessage: '' };
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['BBA'].concat(this.currentUserService.authChecks['EBN'])
        checkArray.push()
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['BBA'].concat(this.currentUserService.authChecks['EBN'])
        checkArray.push()
        this.getAuthCheck(checkArray)
      })
    }

    this.showBankAccount = "false";
    this.BANSetupFormGroup = new FormGroup({
      ban: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(7)])),
      clientName: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(60)])),
      banEffectiveDate: new FormControl('', Validators.required),
      expdate: new FormControl(''),
      comments: new FormControl('', Validators.maxLength(500)),
      // for File Select field in comments
      BANsetupCommentsDocumentName: new FormControl('')
    });

    if (this.banId) {
      this.AddNew();
    }
    this.ExistingBanForm = new FormGroup({
      banId: new FormControl(''),
      account: new FormControl(''),
    });
    var self = this
    $("body").on("click", ".selectedBan", function () {
      var banid = $(this).data('banid')
      self.patchBanId(banid)
      self.hideExistingContainer = true
    })
    this.currentUserService.getUserRoleId().then(val => {
      this.currentUser = this.currentUserService.currentUser
    })
  }

  reloadTable(tableId) {
    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  getAuthCheck(checkArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.banBankAccountChecks = [{
        "useExistingBan": 'T',
        "addNewBankAccount": 'T',
        "saveSetupBan": 'T',
        "searchExistingBan": 'T'
      }]
    } else {
      for (var i = 0; i < checkArray.length; i++) {
        userAuthCheck[checkArray[i].actionObjectDataTag] = checkArray[i].actionAccess
      }
      this.banBankAccountChecks = [{
        "useExistingBan": userAuthCheck['BBA183'],
        "addNewBankAccount": userAuthCheck['BBA184'],
        "saveSetupBan": userAuthCheck['BBA185'],
        "searchExistingBan": userAuthCheck['EBN186'],
      }]
    }
    return this.banBankAccountChecks
  }

  patchBanId(banid) {
    this.fillBanSetupDetails(banid)
  }

  BindGridData() {
    this.GetTopupMax();
    this.arrBankList = [];
    var requestedData = {
      "disciplineKey": this.disciplineKey,
      "banId": this.banId
    }
    this.hmsDataService.postApi(ServiceProviderApi.getBankHistoryForBanUrl, requestedData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.arrBankList = data.result;
        error => {

        }
      }
    });
  }

  AddNew() {
    if (this.arrBankList.length > 0 && this.arrBankList[0].expiredOn == '') {
      this.exDialog.openConfirm(this.translate.instant('card.exDialog.add-newbankAcc')).subscribe((value) => {
        if (value) {
          this.resetNewRecord();
          this.addMode = true;
          this.disableAddNew = true;
          this.selectedRowId = this.arrBankList[0].provBankAcctKey;
        }
      })
    }
    else {
      this.resetNewRecord();
      this.addMode = true;
      this.disableAddNew = true;
    }
  }

  SaveInfo() {
    this.newRecordValidate = true;
    var userId = this.currentUser.userId
    if (this.validateAllFields(this.arrNewMaximumArray)) {
      var requestedData = {
        "disciplineKey": this.disciplineKey,
        "banId": this.banId,
        "effectiveOn": this.arrNewMaximumArray.effectiveOn,
        "expiredOn": this.arrNewMaximumArray.expiredOn,
        "provBankAcctNum": this.arrNewMaximumArray.provBankAcctNum,
        "provBankBranchNum": this.arrNewMaximumArray.provBankBranchNum,
        "provBankNum": this.arrNewMaximumArray.provBankNum,
        "userId": +userId,
      }
      this.hmsDataService.postApi(ServiceProviderApi.saveServiceProviderBankAccountDetailsUrl, requestedData).subscribe(
        data => {
          if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
            this.toastrService.success(this.translate.instant('serviceProvider.toaster.record-saved'));
            this.BindGridData();
            this.resetNewRecord();
          }
          else if (data.code == 400 && data.message == "BANK_EFFECTIVE_DATE_GREATER_OR_EQUAL_FROM_NOW_DATE") {
            this.toastrService.error(this.translate.instant('serviceProvider.toaster.effective-date-today'));
          }
          else if (data.code == 400 && data.message == "DATE_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('serviceProvider.toaster.today-date'));
          }
          else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
            this.toastrService.error(this.translate.instant('serviceProvider.toaster.effective-date'));
          }
          else if (data.code == 404 && data.message == "RECORD_NOT_FOUND") {
            this.toastrService.error(this.translate.instant('serviceProvider.toaster.record-not-found'));
          }
          else if (data.code == 404 && data.hmsMessage.messageShort == "BILLING_ADDRESS_NOT_FOUND") {
            this.toastrService.error(this.translate.instant('serviceProvider.toaster.billing-address-not-found'));
          }
        }
      )
    }
  }

  validateAllFields(objRow: any) {
    if (this.addMode) {
      if ((objRow.provBankNum != '' && objRow.provBankNum.length >= 3) && (objRow.provBankBranchNum != ''
        && objRow.provBankBranchNum.length >= 5) && (objRow.provBankAcctNum != '' && objRow.provBankAcctNum.length >= 7) && objRow.effectiveOn != '') {
        if (this.selectedRowId != '' && this.arrBankList[0].expiredOn == '') {
          return false;
        }
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return true;
    }
  }

  GetTopupMax() {
    this.resetNewRecord();
    var requestedData = {
      "disciplineKey": +$('#lbldisciplineKey').html()
    }
    this.hmsDataService.postApi(CardApi.getAllCardHsaMaxUrl, requestedData).subscribe(data => {
      this.arrTopupMax = [];
      if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        this.arrTopupMax = data.result;
      }
    })
  }

  resetNewRecord() {
    this.addMode = false;
    this.arrNewMaximumArray = {
      "provBankNum": "",
      "provBankBranchNum": "",
      "provBankAcctNum": "",
      "effectiveOn": "",
      "expiredOn": "",
      "provBankName":""
    }
    this.selectedRowId = '';
    this.newRecordValidate = false;
  }

  ChangeInputDateFormat(event, idx, type, isEditLastRow) {
    let inputDate = event;
    if (!this.editMode) {
      if (inputDate.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(inputDate);
        if (obj == null) {
          this.toastrService.warning(this.translate.instant('card.toaster.invalid-date'));
        }
        else {
          inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
          if (this.addMode && !isEditLastRow) {
            let effectiveOn = this.arrNewMaximumArray.effectiveOn;
            let expiredOn = this.arrNewMaximumArray.expiredOn;
            let oldExpiredOn;
            if (this.selectedRowId != '') {
              oldExpiredOn = this.changeDateFormatService.convertDateObjectToString(this.arrBankList[0].expiredOn)
            }
            if (type == 'effectiveOn') {
              effectiveOn = inputDate
            }
            else {
              expiredOn = inputDate
            }
            if (effectiveOn && expiredOn) {
              var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
              if (isTrue) {
                this.toastrService.warning(this.translate.instant('card.toaster.effective-on'));
                if (type == 'effectiveOn') {
                  this.arrNewMaximumArray.effectiveOn = '';
                }
                else {
                  this.arrNewMaximumArray.expiredOn = '';
                }
              }
              else {
                this.arrNewMaximumArray[type] = obj;
              }
            }
            else {
              this.arrNewMaximumArray[type] = obj;
            }
            if (effectiveOn && oldExpiredOn) {
              var isTrue = this.changeDateFormatService.compareTwoDate(oldExpiredOn, effectiveOn);
              if (isTrue) {
                this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-greater-than-expiry'));
                this.arrNewMaximumArray.effectiveOn = '';
              }
            }
          }
          else {
            this.arrBankList[idx][type] = inputDate;
            let effectiveOn = this.arrBankList[idx].effectiveOn;
            let expiredOn = this.arrBankList[idx].expiredOn;
            let NewEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewMaximumArray.effectiveOn);
            if (this.arrBankList[0].effectiveOn && expiredOn) {
              var isGreaterthanCreatedDate = this.changeDateFormatService.isStartDateGreaterThanEndDate(this.arrBankList[0].effectiveOn, expiredOn);
              if (isGreaterthanCreatedDate) {
                this.toastrService.warning(this.translate.instant('serviceProvider.toaster.expiry-date'));
                this.arrBankList[idx].expiredOn = '';
                return false;
              }
            }
  
            if (effectiveOn && expiredOn) {
              var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
              if (isTrue) {
                this.toastrService.warning(this.translate.instant('card.toaster.expiry-on-date'));
                if (type == 'effectiveOn') {
                  this.arrBankList[idx].effectiveOn = '';
                }
                else {
                  this.arrBankList[idx].expiredOn = '';
                }
              }
              else {
                this.arrBankList[idx][type] = obj;
              }
            }
            else {
              this.arrBankList[idx][type] = obj;
            }
            if (expiredOn && NewEffectiveOn) {
              var isTrue = this.changeDateFormatService.compareTwoDate(expiredOn, NewEffectiveOn);
              if (isTrue) {
                this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-greater-than-expiry'));
                this.arrBankList[idx].expiredOn = '';
              }
            }
          }
        }
      }
    } else {
      if (inputDate.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(inputDate);
        if (obj == null) {
          this.toastrService.warning(this.translate.instant('card.toaster.invalid-date'));
        }
        else {
          inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
          this.arrBankList[idx][type] = inputDate;
          let effectiveOn = this.arrBankList[idx].effectiveOn;
          let expiredOn = this.arrBankList[idx].expiredOn;
          let NewEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewMaximumArray.effectiveOn);
          if (this.arrBankList[0].effectiveOn && expiredOn) {
            var isGreaterthanCreatedDate = this.changeDateFormatService.isStartDateGreaterThanEndDate(this.arrBankList[0].effectiveOn, expiredOn);
            if (isGreaterthanCreatedDate) {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.expiry-date'));
              this.arrBankList[idx].expiredOn = '';
              this.updateExpiredDate[idx] = '';
              return false;
            }
          }
          if (effectiveOn && expiredOn) {
            var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
            if (isTrue) {
              this.toastrService.warning(this.translate.instant('card.toaster.expiry-on-date'));
              if (type == 'effectiveOn') {
                this.updateEffectiveDate[idx] = '';
              } else {
                this.updateExpiredDate[idx] = '';
              }
            } else {
              if (type == 'effectiveOn') {
                this.updateEffectiveDate[idx] = obj;
              } else {
                this.updateExpiredDate[idx] = obj;
              }
            }
          } else {
            if (type == 'effectiveOn') {
              this.updateEffectiveDate[idx] = obj;
            } else {
              this.updateExpiredDate[idx] = obj;
            }
          }
        }
      }
    }
  }

  saveBanData() {
    var userId = this.currentUser.userId
    this.newRecordValidate = true;
    if (this.BANSetupFormGroup.valid && this.validateAllFields(this.arrNewMaximumArray)) {
      this.disableAddBtn = true
      var action = "Saved";
      var BanNo = this.BANSetupFormGroup.value.ban;
      if (this.arrBankList.length > 0) {
        action = "Updated";
        BanNo = BanNo;
      }
      let reqBody = {
        "provBillingAddressKey": this.provBillAddKey,
        "disciplineKey": this.disciplineKey,
        "banId": BanNo,
        "banClientName": this.BANSetupFormGroup.value.clientName,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.BANSetupFormGroup.value.banEffectiveDate),
        "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.BANSetupFormGroup.value.expdate),
        "banComm": this.BANSetupFormGroup.value.comments,
        "userId": +userId,
        "bankList": [
          {
            "provBankAcctKey": 0,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.arrNewMaximumArray.effectiveOn),
            "expiredOn": this.arrNewMaximumArray.expiredOn,
            "provBankAcctNum": this.arrNewMaximumArray.provBankAcctNum,
            "provBankBranchNum": this.arrNewMaximumArray.provBankBranchNum,
            "provBankNum": this.arrNewMaximumArray.provBankNum,
          }]
      }
      if (this.addMode) {
        if (this.selectedRowId != '') {
          reqBody.bankList.push(
            {
              "provBankAcctKey": this.arrBankList[0].provBankAcctKey,
              "effectiveOn": this.arrBankList[0].effectiveOn,
              "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.arrBankList[0].expiredOn),
              "provBankAcctNum": this.arrBankList[0].provBankAcctNum,
              "provBankBranchNum": this.arrBankList[0].provBankBranchNum,
              "provBankNum": this.arrBankList[0].provBankNum,
            }
          )
        }
      }
      else {
        reqBody.bankList = [{
          "provBankAcctKey": this.arrBankList[0].provBankAcctKey,
          "effectiveOn": this.arrBankList[0].effectiveOn,
          "expiredOn": this.arrBankList[0].expiredOn,
          "provBankAcctNum": this.arrBankList[0].provBankAcctNum,
          "provBankBranchNum": this.arrBankList[0].provBankBranchNum,
          "provBankNum": this.arrBankList[0].provBankNum,
        }];
      }
      this.hmsDataService.postApi(ServiceProviderApi.saveAndUpdateServiceProviderBanUrl, reqBody).subscribe(data => {
        this.newRecordValidate = false;
        if (data.code == 200 && data.status === "OK") {
          this.disableAddBtn = false
          this.banDetails = data.result;
          this.banId = data.result;
          this.editMode = true;
          this.toastrService.success('BAN Setup ' + action + '  Successfully!')
          this.showBankAccount = "true";
          this.disableAddNew = false;
          this.CloseModal();
          if (this.returnId) {
            this.serviceProviderService.getBanId.emit(this.banId)
          }
        } else if (data.code == 400 && data.message == 'BANK_EFFECTIVE_DATE_GREATER_OR_EQUAL_FROM_NOW_DATE') {
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-greater-than-today'));
          this.arrNewMaximumArray.effectiveOn = '';
          this.disableAddBtn = false
        }
        else if (data.code == 400 && data.message == "BANK_ACCOUNT_ALREADY_USED") {
          this.toastrService.error(this.translate.instant('serviceProvider.toaster.bank-account'));
          this.disableAddBtn = false
        }
        else if (data.code == 400 && data.message == 'BAN_NUMBER_ALREADY_ASSOCIATED') {
          this.disableAddBtn = false
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.ban-number-association'));
        }
        else if (data.code == 400 && data.message == 'BAN_NUMBER_ALREADY_ASSOCIATED') {
          this.disableAddBtn = false
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.ban-number-association'));
        }
        else if (data.code == 400 && data.message == 'BANK_EFFECTIVEON_SHOULD_BE_GREATER_BAN_EFFECTIVEON') {
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.ban-less-than-bank'));
          this.arrNewMaximumArray.effectiveOn = '';
          this.disableAddBtn = false
        }
        else if (data.code == 400 && data.message == 'EXPIRED_ON_SHOULDBE_EQUAL_OR_GREATER_THAN_TO_CREATEDON_DATE') {
          this.disableAddBtn = false
          this.toastrService.error(this.translate.instant('serviceProvider.toaster.ban-created-date'));
        }
        error => {
        }
        this.serviceProviderService.reloadBillingTable.emit(true)
      })
      this.disableAddBtn = false
    }
    else {
      this.validateAllFormFields(this.BANSetupFormGroup);//Form Validations
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
    this.showRemoveBtn = false;
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

  // Here we are auto generating Ban Number from api.
  getAutoGeneratedBanNo() {
    this.resetBANSetupForm();
    let submitData = {
      "disciplineKey": this.disciplineKey
    }
    this.hmsDataService.postApi(ServiceProviderApi.autoGenerateBanNumberUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.BANSetupFormGroup.patchValue({ ban: data.result });
      }
    });
  }

  changeDateFormatBanNumber(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.BANSetupFormGroup.patchValue(datePickerValue);
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
      this.BANSetupFormGroup.patchValue(datePickerValue);
    }
    if (this.BANSetupFormGroup.value.banEffectiveDate && this.BANSetupFormGroup.value.banEffectiveDate.date && this.BANSetupFormGroup.value.expdate && this.BANSetupFormGroup.value.expdate.date) {
      this.error = this.changeDateFormatService.compareTwoDates(this.BANSetupFormGroup.value.banEffectiveDate.date, this.BANSetupFormGroup.value.expdate.date);
      if (this.error.isError == true) {
        this.BANSetupFormGroup.controls['expdate'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }

  SearchBan() {
    if ($.fn.dataTable.isDataTable('#search-existing-ban')) {
      document.getElementById('searchBanBankdetails').style.display = "block";
    }
    this.url = ServiceProviderApi.searchBanDetailByDiscplineKeyUrl
    this.reqParam = [
      { 'key': 'disciplineKey', 'value': this.disciplineKey },
      { 'key': 'banId', 'value': this.ExistingBanForm.value.banId },
      { 'key': 'provBankAcctNum', 'value': this.ExistingBanForm.value.account },
    ]
    var tableActions = []
    this.columns = [
      { title: 'Buss Arr. No.', data: 'banId' },
      { title: 'Action', data: 'banId' },
    ]
    var tableId = "search-existing-ban"

    if (!$.fn.dataTable.isDataTable('#search-existing-ban')) {
      this.dataTableService.jqueryDataTableBan(tableId, this.url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', this.reqParam, tableActions, 1)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, this.url, this.reqParam)
    }
    var submitMode = {
      "start": 0,
      "length": 5,
      "disciplineKey": this.disciplineKey,
      "banId": this.ExistingBanForm.value.banId,
      "provBankAcctNum": this.ExistingBanForm.value.account
    }
    this.hmsDataService.postApi(ServiceProviderApi.searchBanDetailByDiscplineKeyUrl, submitMode).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.searchBanDetails = data.result.data;
      } else {
      }
      error => {
      }
    })
  }

  CloseModal() {
    this.hmsDataService.OpenCloseModal('btnCloseBanModal');
    this.BANSetupFormGroup.reset();
    // to make file field reset when close button clicked in BAN comments.
    this.removeBANsetupCommentsFile();
    this.selectedRowId = ''
    this.addMode = false
    this.disableAddNew = false
    this.editMode = false
    this.buttonText = 'Save'
    this.arrBankList = []
    this.arrNewMaximumArray = {
      "provBankNum": '',
      "provBankBranchNum": '',
      "provBankAcctNum": '',
      "effectiveOn": '',
      "expiredOn": '',
      "provBankName": ''
    }
  }

  CloseExisting() {
    this.hideExistingContainer = true
  }

  ValidateControls(evt, ctrlName,bankNum, branchNum) {
    if (evt.target.value != '') {
      if (ctrlName == 'Account' && evt.target.value.length < 7) {
        this.toastrService.warning(ctrlName + ' Should have 7 character!');
      }
      else if (ctrlName == 'Bank Number' && evt.target.value.length < 3) {
        this.toastrService.warning(ctrlName + ' Should have 3 character!');
      }
      else if (ctrlName == 'Branch Number' && evt.target.value.length < 5) {
        this.toastrService.warning(ctrlName + ' Should have 5 character!');
      }
    }
    if(bankNum && branchNum !=""){
      this.bankFields(bankNum, branchNum);
    }
  }

  openModel(myModal) {
    if ($.fn.dataTable.isDataTable('#search-existing-ban')) {
      document.getElementById('searchBanBankdetails').style.display = "none";
    }
    this.hideExistingContainer = false
    this.ExistingBanForm.reset();
  }

  fillBanDetailsOnBlur() {
    this.patchBanId(this.BANSetupFormGroup.value.ban)
    this.fillBanSetupDetails(this.BANSetupFormGroup.value.ban)
  }

  fillBanSetupDetails(banid) {
    let reqBody = {
      "disciplineKey": this.disciplineKey,
      "provKey": this.providerKey,
      "banId": banid
    }
    this.hmsDataService.postApi(ServiceProviderApi.checkForExistingBanAssociationUrl, reqBody).subscribe(data => {
      if (data.code == 400 && data.hmsMessage.messageShort === "BAN_NUMBER_ALREADY_ASSOCIATED") {
        this.toastrService.warning(this.translate.instant('serviceProvider.toaster.ban-number-association'));
      }
      else if (data.code == 404 && data.hmsMessage.messageShort === "NO_BILLING_ADDRESS_FOUND_FOR_PROVIDER") {
        this.resetBANSetupForm();
      }
      else {
        var requestedData = {
          "banId": banid,
          "disciplineKey": this.disciplineKey,
        }
        this.hmsDataService.postApi(ServiceProviderApi.getServiceProviderBanDetailUrl, requestedData).subscribe(res => {
          if (res.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
            let data = res.result;
            this.editMode = true;
            this.addMode = false;
            this.BANSetupFormGroup.patchValue(
              {
                'ban': data.banId,
                "clientName": data.banClientName,
                "banEffectiveDate": this.changeDateFormatService.convertStringDateToObject(data.effectiveOn),
                "expdate": this.changeDateFormatService.convertStringDateToObject(data.expiredOn),
                "comments": data.banComm,
              })
            this.arrBankList = data.bankList;
            this.disableAddNew = false;
          }
        })
      }
    })
  }

  resetBANSetupForm() {
    this.BANSetupFormGroup.controls.clientName.reset();
    this.BANSetupFormGroup.controls.banEffectiveDate.reset();
    this.BANSetupFormGroup.controls.expdate.reset();
    this.BANSetupFormGroup.controls.comments.reset();
    this.arrBankList = [];
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  /*Get the Bank Name Api added for issue #717*/
  bankFields(event, event1) {
    var url = CommonApi.getBankDetailsUrl
    var bank = event
    var branch = event1
    let ReqData = {
      "bankNum": bank,
      "branchNum": branch
    }
    if (bank && branch != "") {
      this.hmsDataService.postApi(url, ReqData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.arrNewMaximumArray.provBankName = (data.result[0].bankName).trim() 
        } else {
          this.arrNewMaximumArray.provBankName = ''
        }
      })
    }
  }

  // for File Select field with errors on conditions
  BANsetupCommentsFileUpload(event) {
    this.BANSetupFormGroup.value.BANsetupCommentsDocumentName = ""
    this.selectedFile = event.target.files[0]
    let fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.error1 = { isError: true, errorMessage: this.translate.instant('common.fileSizeError') };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.error1 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.BANSetupFormGroup.patchValue({ 'BANsetupCommentsDocumentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: this.translate.instant('common.fileTypeError') };
      this.showRemoveBtn = true;
    } else {
      this.error = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }    
  }

  // to clear the File Select field
  removeBANsetupCommentsFile() {
    this.BANSetupFormGroup.patchValue({ 'BANsetupCommentsDocumentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }

  cancelInfo(dataRow, idx) {
    if (this.editMode){
      if (idx != undefined) {
        this.arrBankList[idx].effectiveOn = this.effectiveOnObj
        this.arrBankList[idx].expiredOn = this.expiredOnObj
        this.arrBankList[idx].provBankNum = this.provBankNum
        this.arrBankList[idx].provBankBranchNum = this.provBankBranchNum
        this.arrBankList[idx].provBankAcctNum = this.provBankAcctNum
        this.arrBankList[idx].bankName = this.provBankName
      }
    } else if (this.addMode) {
      this.arrNewMaximumArray = {
        "provBankNum": "",
        "provBankBranchNum": "",
        "provBankAcctNum": "",
        "effectiveOn": "",
        "expiredOn": "",
        "provBankName":""
      }
    }
    if (idx == undefined) {
      this.arrBankList[0].expiredOn = this.arrNewMaximumArray.expiredOn
    }
    this.selectedRowId = ''
    this.addMode = false
    this.disableAddNew = false
    this.editMode = false
    this.buttonText = 'Save'
  }

  editInfo(dataRow, idx) {
    this.buttonText = 'Update'
    this.disableAddNew = true
    this.editMode = true
    this.selectedRowId = dataRow.provBankAcctKey
    this.provBankNum = dataRow.provBankNum
    this.provBankBranchNum = dataRow.provBankBranchNum
    this.provBankAcctNum = dataRow.provBankAcctNum
    this.provBankName = dataRow.bankName
    this.effectiveOnObj = dataRow.effectiveOn
    this.expiredOnObj = dataRow.expiredOn
    let effectiveOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn);
    let expiredOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn);
    this.updateEffectiveDate[idx] = effectiveOnObj
    this.updateExpiredDate[idx] = expiredOnObj
  }

}


