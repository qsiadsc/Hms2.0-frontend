import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChange, OnChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { GeneralInformation } from './generalinformation';
import { ToastrService } from 'ngx-toastr';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi } from '../card-api';
import { CommonApi } from '../../common-module/common-api';
import { CardServiceService } from '../card-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../common-module/Constants'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';

@Component({
  selector: 'general-information-form',
  templateUrl: './general-information.component.html', // For this form, we’ll write our UI in a separate file
  styleUrls: ['./general-information.component.css'],
  providers: [ChangeDateFormatService, TranslateService]
})
// This class is used to save Card General Information Detail in Card Holder Form
export class GeneralInformationComponent implements OnInit, OnChanges {
  card_effective_date: any;
  showCardCreatedOnDate: boolean = false;
  cardCreatedOnDateValue: any;
  showCardEffDate: boolean;
  disableBtn: boolean;
  cardStatus: any;
  cardCreatedOnValue: any;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  private placeholder: string = this.translate.instant('card.placeholder');
  private selectUndefinedOptionValue: any;
  @Input() CardGeneralInformationFormGroup: FormGroup;
  @Input() grnlInfoEditMode: boolean;
  @Input() grnlInfoViewMode: boolean;
  @Input() grnlInfoAddMode: boolean;
  @Output() coKeyEvent: EventEmitter<string> = new EventEmitter(); // emit Cokey when change on company name
  @Input() userAuthCheck: any
  private GeneralInfo: GeneralInformation; //object  of Model class for this component 
  savedCardKey; // get card key when getting card details by card id
  languages
  defaultLanguage: string = this.translate.instant('card.english');
  companyCoKey: string;
  enableCardId: boolean;
  program: string;
  status: string;
  hasCompanyFieldValue;
  message;
  hasMsg = false;
  backToSearchClicked: boolean = false;
  showMsg = false;
  programValue;
  bussinessCd;
  bussinessType: number;
  gernalInfoEditValue;
  editStatus;
  editprogram;
  editCardType: string = this.translate.instant('card.single');
  viewStatus: boolean = false
  companyEditCoKey;
  savedCardNumber;

  getCardTypeHistorySaveUrl;
  CardTypeAddNew: boolean = true

  @Input() companyCovKey: any;  //#Log 870
  backToCompanyFlag: boolean = false;
  /* Card Type popUp Variable */
  accountHistoryTableID
  accountHistorytableActions
  accountHistoryColumns
  accountHistorytableData
  accountHistorytableKeys
  accountHistoryTableHeading
  allColumnAction
  error: any;
  commentFlag
  //validations call on parent component
  cardGeneralInformationVal = {
    cokey: [''],
    company_name: ['', [Validators.required]],
    program: [''],
    card_id: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
    employeeIdFormControl: ['', [CustomValidators.numericAndCharacters]],
    employment_date: [''],
    prefered_language: [''],
    card_effective_date: [''],
    payTo: ['', [Validators.maxLength(58)]]
  }

  disciplineIcons = []
  bussinesType: any;
  albertaBsnsType: boolean = false;
  showBackBtn: boolean = false;
  cardTypeViewMode: boolean = true
  selectedRowKey = ''
  updateEffectiveRow = []
  updateExpiredRow = []
  expired: boolean;
  effectiveOnObj
  expiredOnObj
  // Log #1290 Card type description for edit feature.
  cardTypeDescObj: any
  addMode: boolean;
  prefLang: Subscription;
  details: Subscription;
  getbussType: Subscription;
  familyType: Subscription;
  cardStatusSub: Subscription;
  cardCreatedOn: Subscription;
  cardEffOn: Subscription;
  // Log #1290 Add feature in card type.
  addNewCardTypeArray: any = {
    "cardTypeAssignKey": "",
    "cardKey": "",
    "cardNum": "",
    "cardTypeKey": "",
    "effectiveOn": "",
    "expiredOn": "",
    "cardTypeDesc": ""
  }
  employeeNumber: any;
  employeeNumberHasValue: boolean = false;

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "companyCovKey" && changedProp.currentValue) {
        this.companyCoKey = changedProp.currentValue;
      }
    }
  }

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    public cardService: CardServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private translate: TranslateService
  ) {
    this.error = { isError: false, errorMessage: '' };

    this.prefLang = cardService.getPrefferedLanguage.subscribe((value) => {
      this.gernalInfoEditValue = value
      if (this.route.snapshot.url[0]) {
        if (this.route.snapshot.url[0].path == "view") {
          this.viewStatus = true
          this.editStatus = this.gernalInfoEditValue.savedCompanyStatus
          this.editprogram = this.gernalInfoEditValue.businessType
          this.editCardType = this.gernalInfoEditValue.cardType
          this.bussinessType = this.gernalInfoEditValue.businessTypeKey
          this.CardGeneralInformationFormGroup.patchValue({ prefered_language: this.gernalInfoEditValue.languageKey })
          this.companyEditCoKey = this.gernalInfoEditValue.companyCoKey
          this.savedCardNumber = this.gernalInfoEditValue.cardNumber
          this.savedCardKey = value.cardKery
          this.commentFlag = value.commentFlag
          this.getCardDisciplineListByCardId()
          this.cardService.getbusinesType.emit(this.bussinessType)
        }
        if (this.editCardType == "") {
          this.editCardType = "SINGLE"
        } else {
          this.editCardType = this.gernalInfoEditValue.cardType;
        }
      }
    })
    //Added for log 870
    this.details = this.route.queryParams.subscribe(params => {
      if (params.companyId) {
        this.backToCompanyFlag = true;
        this.companyCoKey = params.companyId;
      }
      if (params.coRedirect && params.coRedirect == 'T') {
        this.backToCompanyFlag = true;
      }
      if (this.backToCompanyFlag) {
        this.cardService.redirectCompany.emit(true)
      }
    });

    this.getbussType = cardService.getbusinesType.subscribe((value) => {
      this.bussinesType = value
      if (this.bussinesType == 2) {
        this.showCardEffDate = false
      }
      else {
        this.showCardEffDate = true
      }
    })

    this.familyType = cardService.familyType.subscribe((value) => {
      if (value) {
        this.editCardType = value
      }
    })

    this.cardStatusSub = cardService.cardStatus.subscribe((value) => {
      this.cardStatus = value
      if (value == 'Inactive' || value == 'INACTIVE') {
        this.disableBtn = true
        this.cardStatus = 'Inactive'
      }
      else {
        this.disableBtn = false
        this.cardStatus = 'Active'
      }
    })

    this.cardCreatedOn = cardService.cardCreatedOn.subscribe((value) => {
      this.cardCreatedOnValue = value
    })

    this.cardEffOn = cardService.cardEffectiveOn.subscribe((value) => {
      if (value == '') {
        this.showCardCreatedOnDate = true; /*show cad effective date only when its empty from backend*/
        $('html, body').animate({
          scrollTop: $(".validation-errors:gI_cardEffectiveDate")
        }, 'slow');
      }
      else {
        this.showCardCreatedOnDate = false;
      }
    })
    this.cardService.employeeNumber.subscribe(val =>{
      if (val) {
        this.employeeNumberHasValue = true
        this.CardGeneralInformationFormGroup.patchValue({ employeeIdFormControl: val })
      }
      else {
        this.employeeNumberHasValue = false
      }
    })
  }

  ngOnInit() {
    this.enableCardId = true;
    this.getCardTypeParams()
    this.getAllLanguage()
    this.dtOptions = { dom: 'ltirp', pageLength: 5, order: [0, 'desc'], "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  reloadTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();   // Destroy the table first
      this.dtTrigger.next();  // Call the dtTrigger to rerender again
    });
  }

  getCompanySearchName(event) {
    this.CardGeneralInformationFormGroup.patchValue({ company_name: event })
  }

  receiveCoId(event) {
    if (event) {
      this.companyCoKey = event
    } else {
      this.companyCoKey = this.companyEditCoKey
    }
    this.CardGeneralInformationFormGroup.patchValue({ cokey: this.companyCoKey })
    this.cardService.getCompanyCoKey.emit(this.companyCoKey);
    let submitData = {
      "coKey": this.companyCoKey
    }
    this.hmsDataServiceService.post(CommonApi.getCompanyDetailByCompanyCoKey, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data.result.status == 'Inactive') {
          this.toastrService.warning(this.translate.instant('card.toaster.warn-cantadd-card-inactive-company'));
          this.cardService.resetCompanyName.emit(true)
          this.hasCompanyFieldValue = false
          this.program = ""
          this.status = ""
          this.CardGeneralInformationFormGroup.controls['card_id'].reset();
        } else {
          this.program = data.result.businessTypeDesc
          this.status = data.result.status;
          this.enableCardId = false;
        }
        this.bussinessCd = data.result.businessTypeCd
        this.cardService.getbusinessCd.emit(this.bussinessCd)
        this.bussinessType = data.result.businessTypeKey
        this.cardService.getbusinesType.emit(this.bussinessType)

        this.CardGeneralInformationFormGroup.patchValue({ program: data.result.businessTypeDesc });
      } else {
        this.CardGeneralInformationFormGroup.patchValue({ program: '' });
      }
      error => { }
    })
  }

  getAllLanguage() {
    this.hmsDataServiceService.getApi(CommonApi.getLanguageList).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.languages = data.result
        this.CardGeneralInformationFormGroup.patchValue({ prefered_language: 1 })
        if (this.cardService.showBackSearchBtn) {
          this.showBackBtn = true
          this.cardService.showBackSearchBtn = false
        } else {
          this.showBackBtn = false
        }
      } else {
        this.languages = []
      }
      error => { }
    })
  }

  setValueProgram(value) {
    this.hasCompanyFieldValue = value
    if (this.hasCompanyFieldValue == false) {
      if (!this.viewStatus) {
        this.CardGeneralInformationFormGroup.controls['card_id'].reset();
      }
      this.cardService.setCompanyChangeEvent.emit(this.hasCompanyFieldValue)
    }
  }

  getEmployeeCardID() {
    let requiredInfo = {
      "coKey": this.companyCoKey
    }
    this.hmsDataServiceService.post(CardApi.getAutogeneratedCardNumbersUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.CardGeneralInformationFormGroup.patchValue({ card_id: data.result });
      } else {

      }
      error => { }
    })
  }

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
      this.CardGeneralInformationFormGroup.patchValue(datePickerValue);
    }
    this.cardService.cardEffectiveOnDate.emit(event.value)
  }

  changeTheme() {
    if (this.hasCompanyFieldValue && this.bussinessCd == Constants.albertaBusinessTypeCd) {
      let node = document.createElement('link');  //Dynamically add stylesheet in Head Section
      node.href = 'assets/css/common-alberta.css';
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    } if (this.hasCompanyFieldValue == false) {
      $('link[href="assets/css/common-alberta.css"]').remove();
    }
  }

  cardIdExist(event) {
    let submitData = {
      "cardNum": this.CardGeneralInformationFormGroup.value.card_id
    }
    this.hmsDataServiceService.post(CardApi.checkCardDetailExistByCardIdUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (this.grnlInfoEditMode) {
          if (this.CardGeneralInformationFormGroup.value.card_id == this.savedCardNumber) { } //Condition added to check existence of CardID for edit mode
          else {
            this.CardGeneralInformationFormGroup.controls['card_id'].setErrors({
              "Card_ID_Already_Exist": true
            });
          }
        }
        else {
          this.CardGeneralInformationFormGroup.controls['card_id'].setErrors({
            "Card_ID_Already_Exist": true
          });
        }
        return;
      } else { }
      error => { }
    })
  }

  getCardTypeParams() {
    this.accountHistoryTableHeading = "Card Type"
    this.getCardTypeHistorySaveUrl = CardApi.getCardTypeHistory;
    this.CardTypeAddNew = false
    this.accountHistoryColumns = [
      { title: this.translate.instant('card.general-information.card-type'), data: 'cardTypeDesc' },
      { title: this.translate.instant('common.effective-on'), data: 'effectiveOn' },
      { title: this.translate.instant('common.expireddate'), data: 'expiredOn' }]

    this.accountHistorytableData = []
    this.accountHistoryTableID = "account-history-table"
    this.accountHistorytableKeys = [

      { 'column': 'cardTypeDesc', 'type': 'text', 'name': 'cardTypeDesc', 'required': false },
      { 'column': 'effectiveOn', 'type': 'datepicker', 'name': 'effectiveOn', 'required': true },
      { 'column': 'expiredOn', 'type': 'datepicker', 'name': 'expiredOn', 'required': true, 'greater_than': 'effectiveOn' }
    ]
    this.accountHistorytableActions = [
      { 'name': 'edit', 'serverSide': false, 'val': '', 'class': 'edit_row table-action-btn edit-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-pencil' },
      { 'name': 'save', 'serverSide': false, 'val': '', 'class': 'save_row table-action-btn save-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-save' },
      { 'name': 'delete', 'serverSide': true, 'val': '', 'class': 'delete_row table-action-btn del-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-trash' },
      { 'name': 'coId', 'val': '', 'class': '', 'type': 'hidden' }
    ]
    this.allColumnAction = false
  }

  getCardTypeHistoryDetails() {
    let requiredInfo = {
      "cardKey": this.savedCardKey
    }
    this.hmsDataServiceService.postApi(CardApi.getCardTypeHistory, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.accountHistorytableData = data.result
        var dateCols = ['effectiveOn', 'expiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
        this.reloadTable()
      } else {
        this.accountHistorytableData = []
      }
      error => { }
    })
  }

  showToasterMessage() {
    this.toastrService.success(this.translate.instant('card.toaster.password-resetlink'));
  }

  getCardDisciplineListByCardId() {
    let requiredInfo = {
      "cardKey": this.savedCardKey
    }
    this.hmsDataServiceService.postApi(CardApi.getCardDisciplineListByCardId, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.disciplineIcons = data.result
      } else {
        this.disciplineIcons = []
      }
      error => { }
    })
  }

  removeValidation(value) {
    if (value == Constants.albertaBusnsTypeKey) {
      this.albertaBsnsType = true
      this.CardGeneralInformationFormGroup.get('employment_date').clearValidators()
    } else {
      this.albertaBsnsType = false
      this.CardGeneralInformationFormGroup.get('employment_date').setValidators([Validators.required]);
    }
    this.CardGeneralInformationFormGroup.get('employment_date').updateValueAndValidity();
  }

  backToSearch() {
    this.router.navigate(['/card/searchCard'])
    this.backToSearchClicked = true
  }

  ngOnDestroy() {
    if (this.backToSearchClicked) {
      this.cardService.isBackCardSearch = true
    }
    else if (this.prefLang) {
      this.prefLang.unsubscribe();
    }
    else if (this.details) {
      this.details.unsubscribe();
    }
    else if (this.getbussType) {
      this.getbussType.unsubscribe();
    }
    else if (this.familyType) {
      this.familyType.unsubscribe();
    }
    else if (this.cardStatusSub) {
      this.cardStatusSub.unsubscribe();
    }
    else if (this.cardCreatedOn) {
      this.cardCreatedOn.unsubscribe();
    }
    else if (this.cardEffOn) {
      this.cardEffOn.unsubscribe();
    }
    else {
      this.cardService.isBackCardSearch = false
      this.cardService.searchedCardCompanyName = ''
    }
  }

  /*Card Type: Action Column added As Per Arun Sir*/
  editInfo(dataRow, idx) {
    this.addMode = false //Log #1290
    this.effectiveOnObj = dataRow.effectiveOn
    this.expiredOnObj = dataRow.expiredOn
    var effectiveOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn);
    var expiredOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn);
    this.updateEffectiveRow[idx] = effectiveOnObj
    this.updateExpiredRow[idx] = expiredOnObj
    this.selectedRowKey = dataRow.cardTypeAssignKey;
    this.cardTypeViewMode = false
    this.cardTypeDescObj = dataRow.cardTypeDesc   //Log #1290 
  }

  updateInfo(dataRow, idx) {
    if (dataRow.cardTypeDesc == "Single") {
      var updatedCardTypeKey = "23";     //Log #1290   
    }
    else {
      updatedCardTypeKey = "21"
    }
    let requestedData = {
      "cardTypeAssignKey": dataRow.cardTypeAssignKey,
      "cardKey": dataRow.cardKey,
      "cardNum": dataRow.cardNum,
      "cardTypeKey": updatedCardTypeKey,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.updateEffectiveRow[idx]),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.updateExpiredRow[idx]),
      "cardTypeDesc": dataRow.cardTypeDesc
    }
    this.hmsDataServiceService.postApi(CardApi.addOrUpdateCardTypeUrl, requestedData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_UPDATED_SUCCESSFULLY") {
        this.toastrService.success(this.translate.instant('card.toaster.record-update'));
        this.selectedRowKey = '';
        this.getCardTypeHistoryDetails()
        this.cardTypeViewMode = true
      } else if (data.code == 400 && data.message == "RECORD_ALREADY_EXIST") {
        this.toastrService.error(this.translate.instant('serviceProvider.toaster.eligibility-exist'));
      } else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
        this.toastrService.error(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
      } else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
        this.toastrService.error(this.translate.instant('serviceProvider.toaster.effective-date'));
      } else {
        this.toastrService.error(this.translate.instant('qsi-loader-report.ts.notUpdated'));
      }
    })
  }

  cancelInfo(dataRow, idx) {
    this.cardTypeViewMode = true
    this.selectedRowKey = ""
    if (idx != undefined && idx != '') {
      this.accountHistorytableData[idx].effectiveOn = this.effectiveOnObj
      this.accountHistorytableData[idx].expiredOn = this.expiredOnObj
      this.accountHistorytableData[idx].cardTypeDesc = this.cardTypeDescObj //Log #1290   
    }
    this.getCardTypeHistoryDetails(); //Log #1290   
    if (this.addMode) {
      this.addNewCardTypeArray = {
        "cardTypeAssignKey": "",
        "cardKey": "",
        "cardNum": "",
        "cardTypeKey": "",
        "effectiveOn": "",
        "expiredOn": "",
        "cardTypeDesc": ""
      }
      this.addMode = false
    }
  }

  // Log #1290 Below method added with changes(else part) to add validation and formatting of the input date fields of Add feature in Card type. 
  ChangeInputDateFormat(event, idx, type) {
    if (!this.addMode) {
      let inputDate = event;
      let effectiveOn
      let expiredOn

      if (inputDate.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(inputDate);
        if (obj == null) {
          this.toastrService.warning(this.translate.instant('card.toaster.invalid-date'));
        }
        else {
          inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
          this.accountHistorytableData[idx][type] = inputDate;

          if (type == 'expiredOn') {
            let effDate = (this.accountHistorytableData[idx].effectiveOn != null && this.accountHistorytableData[idx].effectiveOn != "") ? this.changeDateFormatService.convertStringDateToObject(this.accountHistorytableData[idx].effectiveOn) : '';
            effectiveOn = this.changeDateFormatService.convertDateObjectToString(effDate)
            expiredOn = inputDate;
          }
          if (type == 'effectiveOn') {
            effectiveOn = inputDate
            let expDate = (this.accountHistorytableData[idx].expiredOn != null && this.accountHistorytableData[idx].expiredOn != "") ? this.changeDateFormatService.convertStringDateToObject(this.accountHistorytableData[idx].expiredOn) : '';
            expiredOn = this.changeDateFormatService.convertDateObjectToString(expDate)
          }
          if (effectiveOn && expiredOn) {
            var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
            if (isTrue) {
              if (type == 'effectiveOn') {
                this.toastrService.warning(this.translate.instant('card.toaster.effectiveDateShouldBeLess'));
                this.updateEffectiveRow[idx] = '';

              } else {
                this.toastrService.warning(this.translate.instant('card.toaster.expiryDateShouldBeGreater'));
                this.updateExpiredRow[idx] = '';
              }
            } else {
              if (type == 'effectiveOn') {
                this.updateEffectiveRow[idx] = obj;
              } else {
                this.updateExpiredRow[idx] = obj;
              }
            }
          } else {
            if (type == 'effectiveOn') {
              this.updateEffectiveRow[idx] = obj;
            } else {
              this.updateExpiredRow[idx] = obj;
            }
          }
        }
      }
      if (event.reason == 2 && event.value != null && event.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(event);
        this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      }
      else if (event.reason == 1 && event.value != null && event.value != '') {
        this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
      }
    }
    else {
      let inputDate = event;
      let effectiveOn
      let expiredOn
      if (inputDate.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(inputDate);
        if (obj == null) {
          this.toastrService.warning(this.translate.instant('card.toaster.invalid-date'));
        }
        else {
          inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
          if (type == "effectiveOn") {
            this.addNewCardTypeArray.effectiveOn = inputDate;
          }
          if (type == "expiredOn") {
            this.addNewCardTypeArray.expiredOn = inputDate;
          }

          if (type == 'expiredOn') {
            expiredOn = inputDate;
            effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.addNewCardTypeArray.effectiveOn)
          }
          if (type == 'effectiveOn') {
            effectiveOn = inputDate
            expiredOn = this.changeDateFormatService.convertDateObjectToString(this.addNewCardTypeArray.expiredOn)
          }
          if (effectiveOn && expiredOn) {
            var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
            if (isTrue) {
              if (type == 'effectiveOn') {
                this.toastrService.warning(this.translate.instant('card.toaster.effectiveDateShouldBeLess'));
                this.addNewCardTypeArray.effectiveOn = '';
              }
              else {
                this.toastrService.warning(this.translate.instant('card.toaster.expiryDateShouldBeGreater'));
                this.addNewCardTypeArray.expiredOn = '';
              }
            }
            else {
              if (type == 'effectiveOn') {
                this.addNewCardTypeArray.effectiveOn = obj;
              }
              else {
                this.addNewCardTypeArray.expiredOn = obj;
              }
            }
          }
          else {
            if (type == 'effectiveOn') {
              this.addNewCardTypeArray.effectiveOn = obj;
            }
            else {
              this.addNewCardTypeArray.expiredOn = obj;
            }
          }
        }
      }
      if (event.reason == 2 && event.value != null && event.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(event);
        this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      }
      else if (event.reason == 1 && event.value != null && event.value != '') {
        this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
      }
    }
  }

  cardTypeCloseModal() {
    this.addMode = false;    //HMS Issue No.614 
    this.addNewCardTypeArray.cardTypeDesc = "";
    this.addNewCardTypeArray.effectiveOn = "";
    this.addNewCardTypeArray.expiredOn = "";
    this.cardTypeViewMode = true
    this.selectedRowKey = ""
  }

  // Log #1290 Added for Add feature in Card type
  addNewCardType() {
    this.getCardTypeHistoryDetails()
    this.selectedRowKey = '';
    this.addMode = true;
  }

  // Log #1290 Added to save the data of Add feature in Card type.
  saveInfo() {
    if (this.addNewCardTypeArray.cardTypeDesc == "SINGLE" || this.addNewCardTypeArray.cardTypeDesc == "Single") {
      this.addNewCardTypeArray.cardTypeKey = "23"
      this.addNewCardTypeArray.cardTypeDesc = "Single"
    }
    else if (this.addNewCardTypeArray.cardTypeDesc == "FAMILY" || this.addNewCardTypeArray.cardTypeDesc == "Family") {
      this.addNewCardTypeArray.cardTypeKey = "21"
      this.addNewCardTypeArray.cardTypeDesc = "Family"
    }
    let requestedData = {
      "cardTypeAssignKey": "",
      "cardKey": this.savedCardKey,
      "cardNum": this.savedCardNumber,
      "cardTypeKey": this.addNewCardTypeArray.cardTypeKey,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addNewCardTypeArray.effectiveOn),
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addNewCardTypeArray.expiredOn),
      "cardTypeDesc": this.addNewCardTypeArray.cardTypeDesc
    }

    this.hmsDataServiceService.postApi(CardApi.addOrUpdateCardTypeUrl, requestedData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_UPDATED_SUCCESSFULLY") {
        this.toastrService.success(this.translate.instant('card.toaster.record-update'));
        this.selectedRowKey = '';
        this.getCardTypeHistoryDetails()
        this.cardTypeViewMode = true
        this.addMode = false;  //HMS Issue No.614
        this.addNewCardTypeArray.cardTypeDesc = "";
        this.addNewCardTypeArray.effectiveOn = "";
        this.addNewCardTypeArray.expiredOn = "";
      } else if (data.code == 400 && data.message == "RECORD_ALREADY_EXIST") {
        this.toastrService.error(this.translate.instant('serviceProvider.toaster.eligibility-exist'));
      } else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
        this.toastrService.error(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
      } else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
        this.toastrService.error(this.translate.instant('serviceProvider.toaster.effective-date'));
      } else {
        this.toastrService.error("Record not updated!!")
      }
    })
  }

  // Below method is for auto generated employee id field in add mode.
  getEmployeeID() {
    let url = Constants.baseUrl + 'card-service/autoGenEmpNum'
    this.hmsDataServiceService.get(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.CardGeneralInformationFormGroup.patchValue({ employeeIdFormControl: data.result });
      }
    })
  }
  
}