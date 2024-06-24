import { Component, Input, Output, EventEmitter, ComponentFactoryResolver } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants'; 
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; 
import { CardServiceService } from '../card-service.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi } from '../card-api';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { Subject, Subscription } from 'rxjs/Rx';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; 
import { ToastrService } from 'ngx-toastr'; 
import { Observable } from 'rxjs/Rx';
import { CommonApi } from '../../common-module/common-api';
import { reduce } from 'rxjs/operators';

@Component({
  selector: 'card-bank-acc',
  templateUrl: './card-bank-acc.component.html',
  styleUrls: ['./card-bank-acc.component.css'],
  providers: [ChangeDateFormatService, DatatableService, HmsDataServiceService, CurrentUserService, TranslateService]
})

export class CardBankAccComponent {
  disableBtn: boolean;
  cardStatusValue: any;
  cardBankCreatedOnValue: any;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  public cardBankAccountPopup: FormGroup; 
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  @Input() currentUser: any
  @Input() cardbankacc: FormGroup; 
  @Input() bnkAccEditMode: boolean;
  @Input() bnkAccViewMode: boolean;
  @Input() bnkAddMode: boolean
  @Input() userAuthCheck: any
  @Input() expCheck;
  @Output() emitOnSave: EventEmitter<any> = new EventEmitter<any>();
  savedCardKey; 
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  private placeholder: string = this.translate.instant('card.placeholder');
  checkBankAcc = true
  observableObj;
  buttonText: string;
  accountHistoryTableID
  accountHistorytableActions
  accountHistoryColumns
  accountHistorytableData
  accountHistorytableKeys
  accountHistoryTableHeading
  saveUrl
  savedCardNumber;
  savedBankAccKey;
  dateNameArray = {}
  bussinesCD;
  editUniqueKey = 0;
  error: any; 
  disableValue: boolean = false 
  historyEditMode: boolean = false 
  albertaBsnsType: boolean = false 
  bussinesType: any;
  disableExpDate: boolean = false;
  expired;
  cardExpiry: Subscription;
  cardStatusSub: Subscription;
  bankCreated: Subscription;
  busCd: Subscription;
  busType: Subscription;
  accDisable: Subscription;
  accHistory: Subscription;
  prefLang: Subscription;
  idx:any
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    public cardService: CardServiceService,
    private hmsDataServiceService: HmsDataServiceService,
    public currentUserService: CurrentUserService,
    public datatableService: DatatableService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private translate: TranslateService
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.prefLang = cardService.getPrefferedLanguage.subscribe((value) => {
      this.savedCardNumber = value.cardNumber
      this.savedCardKey = value.cardKery
      this.savedBankAccKey = value.cardBankAcctKey
      if (this.savedBankAccKey == undefined || this.savedBankAccKey == "" || this.savedBankAccKey == null) {
        this.disableExpDate = true
      } else {
        this.disableExpDate = false
      }
    });

    this.accHistory = cardService.bankAccountHistory.subscribe((value) => {
      this.reloadTable('bank-history')
    })

    this.accDisable = cardService.setBankAccDisable.subscribe((value) => {
      this.disableValue = value
    })

    this.busType = cardService.getbusinesType.subscribe((value) => {
      this.removeValidation(value, "cardbankacc", false)
      this.bussinesType = value
    })
    
    this.bankAccountHistoryDetails()

    this.busCd = cardService.getbusinessCd.subscribe((value) => {
      this.removeValidation(value, "mainForm", false)
      this.bussinesCD = value
    })

    this.bankCreated = cardService.cardBankCreatedOn.subscribe((value) => {
      this.cardBankCreatedOnValue = value
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

    this.cardExpiry = this.cardService.cardExpiry.subscribe(expCheck=> {
      this.expired=expCheck
    })
  }

  cardBankAccVal = {
    bank: new FormControl(''),
    branch: new FormControl(''),
    account: new FormControl(''),
    client: new FormControl(''),
    effdate: new FormControl(''),
    expdate: new FormControl(''),
  }

  ngOnInit() {
    this.expired;
    this.observableObj = Observable.interval(1000).subscribe(value => {
      if (this.checkBankAcc = true) {
        if ('card.button-save' == this.translate.instant('card.button-save')) {
        } else {
          this.buttonText = this.translate.instant('card.button-save');
          this.checkBankAcc = false;
          this.observableObj.unsubscribe();
        }
      }
    });
    this.dtOptions['bank-history'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]], }
    this.dtTrigger['bank-history'] = new Subject();
    var self = this
    this.cardBankAccountPopup = new FormGroup({
      bankValue: new FormControl('', [Validators.required, CustomValidators.Alphanumric, Validators.maxLength(12), Validators.minLength(3)]),
      branchValue: new FormControl('', [Validators.required, CustomValidators.Alphanumric, Validators.maxLength(10), Validators.minLength(5)]),
      accountValue: new FormControl('', [Validators.required, CustomValidators.Alphanumric, Validators.maxLength(20), Validators.minLength(7)]),
      clientValue: new FormControl('', [Validators.maxLength(60), CustomValidators.notEmpty, CustomValidators.alphaNumericHyphen]),
      effdateValue: new FormControl('', [Validators.required]),
      expdateValue: new FormControl(''),
    });
    $(document).on('click','.btnpicker', function () { 
      $('#card-effdate .mydp .selector').addClass('bottom-calender')
    }) // To resolved calendar isuue in cardholder section
    $(document).on('click','.btnpicker', function () {
        $('#card-expdate .mydp .selector').addClass('bottom-calender')
    })

  }
  
  ngAfterViewInit(): void {
    this.dtTrigger['bank-history'].next()
    
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

  reloadTable(tableID) {
    this.datatableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.cardbankacc.patchValue(datePickerValue);
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
      this.cardbankacc.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
     else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
    if (this.cardbankacc.value.effdate && this.cardbankacc.value.expdate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.cardbankacc.value.effdate.date, this.cardbankacc.value.expdate.date);
      if (this.error.isError == true) {
        this.cardbankacc.controls['expdate'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
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

  bankAccountHistoryDetails() {
    var self = this
    let requiredInfo = {
      "cardKey": self.savedCardKey
    }
    this.hmsDataServiceService.postApi(CardApi.getCardBankAccountHistory, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.accountHistorytableData = data.result
        var dateCols = ['cardBaEffectiveOn', 'cardExpiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
        this.reloadTable('bank-history')
      } else {
        this.accountHistorytableData = []
      }
      error => {}
    })
  }

  changeDateFormatBankAccount(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.cardBankAccountPopup.patchValue(datePickerValue);
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
      this.cardBankAccountPopup.patchValue(datePickerValue);
     this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
    
    if (this.cardBankAccountPopup.value.effdateValue && this.cardBankAccountPopup.value.expdateValue) {
      this.error = this.changeDateFormatService.compareTwoDates(this.cardBankAccountPopup.value.effdateValue.date, this.cardBankAccountPopup.value.expdateValue.date);
      if (this.error.isError == true) {
        this.cardBankAccountPopup.controls['expdateValue'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }

  updateBankAccount() {
    if (this.cardBankAccountPopup.valid) {
      let formFields = ['bankValue', 'branchValue', 'accountValue', 'clientValue', 'effdateValue', 'expdateValue']
      let hasValue = false
      formFields.forEach(value => {
        if ((this.cardBankAccountPopup.get(value).value) && this.cardBankAccountPopup.get(value).value != "") {
          hasValue = true
        }
      })
      let cardBankAccount = false
      if (this.bussinesCD == Constants.albertaBusinessTypeCd && hasValue) {
        this.removeValidation(Constants.albertaBusinessTypeCd, "cardBankAccountPopup", true)
        cardBankAccount = true
      } else if (this.bussinesCD == Constants.albertaBusinessTypeCd && !hasValue) {
        this.removeValidation(Constants.albertaBusinessTypeCd, "cardBankAccountPopup", false)
        cardBankAccount = false
      } else {
        this.removeValidation(Constants.quikcardBusnsTypeKey, "cardBankAccountPopup", false)
        cardBankAccount = false
      }
      if (this.cardBankAccountPopup.valid) {
        let uniqueKey
        if (this.historyEditMode) {
          uniqueKey = this.editUniqueKey
        } else {
          uniqueKey = 0
        }
        if (!cardBankAccount && this.bussinesCD == Constants.albertaBusinessTypeCd) {
          this.resetCardbankAccHistory()
          return
        } else {
          let submitData = {
            "cardKey": this.savedCardKey,
            "cardBankAcctKey": uniqueKey,
            "cardBankNum": this.cardBankAccountPopup.value.bankValue,
            "cardBankBranchNum": this.cardBankAccountPopup.value.branchValue,
            "cardBankAccountNum": this.cardBankAccountPopup.value.accountValue,
            "bankName": this.cardBankAccountPopup.value.clientValue,
            "cardBaEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.cardBankAccountPopup.value.effdateValue),
            "cardExpiredOn": this.changeDateFormatService.convertDateObjectToString(this.cardBankAccountPopup.value.expdateValue),
          }
          if (this.buttonText != "Update" && this.accountHistorytableData.length > 0) {
            this.exDialog.openConfirm(this.translate.instant('card.exDialog.save-newbankAcc')).subscribe((value) => {
              if (value) {
                this.saveBankAccount(submitData)
              }
            });
          } else {
            this.saveBankAccount(submitData)
            // if(this.buttonText == "Save"){
            //   this.saveBankAccount(submitData)
            // }else{
            // submitData['cardBaKey'] = this.accountHistorytableData[this.idx].cardBaKey   // add cardBaKey parameter for update button
            //  this.saveBankAccount(submitData)
            // }
          }
        }
      } else {
        this.validateAllFormFields(this.cardBankAccountPopup);
      }
    } else {
      this.validateAllFormFields(this.cardBankAccountPopup);
    }
  }

  resetCardbankAccHistory() {
    this.cardBankAccountPopup.reset();
    this.buttonText = this.translate.instant('card.button-save');
    this.historyEditMode = false
  }

  saveBankAccount(submitData) {
    this.hmsDataServiceService.putApi(CardApi.saveCardBankAccountUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.bankAccountHistoryDetails()
        this.toastrService.success(this.translate.instant('card.toaster.bank-save'));
        this.resetCardbankAccHistory()
        this.emitOnSave.emit("saved");
      } else if (data.code == 400 && data.hmsMessage.messageShort == "BANK_ACCOUNT_ALREADY_USED") {    // these condition are added because bank account already used toaster are not show.
        this.toastrService.error("Bank Account Already Used!");
      }
      else if (data.code == 400 && data.hmsMessage.messageShort == "FIRST_EXPIRED_OLD_ONE_RECORD") {
        this.toastrService.error("Please Expire Old Record First!!");
      }
      else if (data.code == 400 && data.hmsMessage.messageShort == "BANK_ACCOUNT_ALREADY_USED") {
        this.toastrService.error(this.translate.instant('card.toaster.bank-detail-use-err'));
      }
      else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
        this.toastrService.error(this.translate.instant('card.toaster.bank-date-err'));
      }
      else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIREDON") {
        this.toastrService.error(this.translate.instant('card.toaster.bank-date-err-expiry'));
      }
      else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
        this.toastrService.error(this.translate.instant('card.toaster.bank-date-err-expiry'));
      }
      else if (data.code == 400 && data.hmsMessage.messageShort == "EFFECTIVE_ON_CONNOT_BE_BEFORE_PREVIOUS_CREATED_ON") {
        this.toastrService.error("Expiry Date Should Be Greater Than Created On") //Today/Created(9_oct)
      }
      else if (data.code == 400 && data.hmsMessage.messageShort == "CARD_BANK_EXPIRED_ON_SHOULD_BE_GREATER_CARD_BANK_CREATED_DATE") {
        this.toastrService.error(this.translate.instant('card.toaster.bank-crd-effct'));
      }
    })
  }

  changeButtonText() {
    this.buttonText = this.translate.instant('card.button-update');
  }

  setBankAccountForm(dataRow, i) {
    // this.idx = i
    this.historyEditMode = true
    if (dataRow.cardBankAcctKey) {
      this.editUniqueKey = dataRow.cardBankAcctKey
    } else {
      this.editUniqueKey = 0
    }
    let cardBankAccountDetails = {
      bankValue: dataRow.cardBankNum,
      branchValue: dataRow.cardBankBranchNum,
      accountValue: dataRow.cardBankAccountNum,
      clientValue: dataRow.bankName,
      effdateValue: this.changeDateFormatService.convertStringDateToObject(dataRow.cardBaEffectiveOn),
      expdateValue: this.changeDateFormatService.convertStringDateToObject(dataRow.cardExpiredOn)
    }
    this.cardBankAccountPopup.patchValue(cardBankAccountDetails);
    this.buttonText = this.translate.instant('card.button-update');
    this.expired=this.changeDateFormatService.isFutureNonFormatDate(dataRow.cardExpiredOn);
  }
  
  checkBankAccAlreadyExist() {
    var self = this
    if (this.cardbankacc.get('bank').value && this.cardbankacc.get('branch').value && this.cardbankacc.get('account').value) {
      let requiredInfo = {
        "cardBankNum": this.cardbankacc.get('bank').value,
        "cardBankBranchNum": this.cardbankacc.get('branch').value,
        "cardBankAccountNum": this.cardbankacc.get('account').value
      }
      this.hmsDataServiceService.putApi(CardApi.checkBankAccountNumber, requiredInfo).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
        } 
        else if (data.code == 400 && data.status == "BAD_REQUEST") {
          this.cardbankacc.controls['account'].setErrors({
            "cardBankAccountNumNumAlreadyUsed": true
          });
        } else {}
        error => {}
      })
    }
  }
  /**
   * 
   * @param value department Key whether quikcard or alberta
   * @param formType forname whether main form or pop form
   * @param validateForm true if user adds value in any field of bank form
   */
  removeValidation(value, formType, validateForm) {
    let formFields = []
    let formName
    if (formType == "cardbankacc") {
      formFields = ['bank', 'branch', 'account', 'client', 'effdate', 'expdate']
      formName = this.cardbankacc
    } if (formType == "cardBankAccountPopup") {
      formFields = ['bankValue', 'branchValue', 'accountValue', 'clientValue', 'effdateValue', 'expdateValue']
      formName = this.cardBankAccountPopup
    }
    if (validateForm && formType == "cardbankacc") {
      this.cardBankAccValidation()
    } else if (validateForm && formType == "cardBankAccountPopup") {
      this.popValidation()
    } else {
      this.albertaBsnsType = true
      formFields.forEach(value => {
        formName.get(value).clearValidators()
      })
    }
    formFields.forEach(data => {
      formName.get(data).updateValueAndValidity();
    })
  }
  
  cardBankAccValidation() {
    this.albertaBsnsType = false
    this.cardbankacc.get('bank').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(12), Validators.minLength(3)]);
    this.cardbankacc.get('branch').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(10), Validators.minLength(5)]);
    this.cardbankacc.get('account').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(20), Validators.minLength(7)]);
    this.cardbankacc.get('client').setValidators([Validators.required, Validators.maxLength(60), CustomValidators.notEmpty, CustomValidators.alphaNumericHyphen]);
    this.cardbankacc.get('effdate').setValidators([Validators.required]);
  }
  
  popValidation() {
    this.albertaBsnsType = false
    this.cardBankAccountPopup.get('bankValue').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(12), Validators.minLength(3)]);
    this.cardBankAccountPopup.get('branchValue').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(10), Validators.minLength(5)]);
    this.cardBankAccountPopup.get('accountValue').setValidators([Validators.required, CustomValidators.Alphanumric, Validators.maxLength(20), Validators.minLength(7)]);
    this.cardBankAccountPopup.get('clientValue').setValidators([Validators.required, Validators.maxLength(60), CustomValidators.notEmpty, CustomValidators.alphaNumericHyphen]);
    this.cardBankAccountPopup.get('effdateValue').setValidators([Validators.required,]);
  }

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
          this.cardbankacc.patchValue({
            'client': (data.result[0].bankName).trim()
          })
          this.cardBankAccountPopup.patchValue({
            'clientValue': (data.result[0].bankName).trim()
          })
        } else {
          this.cardbankacc.patchValue({
            'client': ''
          })
          this.cardBankAccountPopup.patchValue({
            'clientValue': ''
          })
        }
      })
    }
  }

  ngOnDestroy(){
    if (this.cardExpiry) {
      this.cardExpiry.unsubscribe()
    }
    else if (this.cardStatusSub) {
      this.cardStatusSub.unsubscribe()
    }
    else if (this.bankCreated) {
      this.bankCreated.unsubscribe()
    }
    else if (this.busCd) {
      this.busCd.unsubscribe()
    }
    else if (this.busType) {
      this.busType.unsubscribe()
    }
    else if (this.accDisable) {
      this.accDisable.unsubscribe()
    }
    else if (this.accHistory) {
      this.accHistory.unsubscribe()
    }
    else if (this.prefLang) {
      this.prefLang.unsubscribe()
    }
  }
}