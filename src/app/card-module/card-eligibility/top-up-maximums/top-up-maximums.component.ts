import { Component, OnInit, Input } from '@angular/core';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi } from '../../card-api'
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';

@Component({
  selector: 'app-top-up-maximums',
  templateUrl: './top-up-maximums.component.html',
  styleUrls: ['./top-up-maximums.component.css'],
  providers: [ChangeDateFormatService, TranslateService]
})

export class TopUpMaximumsComponent implements OnInit {
  arrTopupMax;
  arrMaxPeriodType;
  addMode: boolean = false;
  editMode: boolean = false;
  viewMode: boolean = false;
  isMaximum: boolean = false;
  isOverrides: boolean = false;
  userId;
  selectedRowId = '';
  arrMaximumArray = [];
  maxPeriodTypeKey = [];
  maxPeriodTypeDesc = [];
  arrNewMaximumArray = {
    "hsaMaxPeriodTypeKey": "",
    "cardHsaMaxDesc": "",
    "cardHsaMaxAmt": "",
    "effectiveOn": "",
    "expiredOn": "",
    "checkDate": false
  }
  newRecordValidate: boolean = false;
  @Input() cardKey: string;
  @Input() disciplineKey: string;
  @Input() cardHolderdetails: any;
  @Input() cardHolderMaximum: boolean = false;
  showLoader = false;
  expiredCheck: boolean;

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private currentUserService: CurrentUserService) {
    this.userId = this.currentUserService.currentUser.userId
  }

  ngOnInit() {
    this.disciplineKey = $('#lbldisciplineKey').html()
    this.GetPeriodType();
  }

  GetPeriodType() {
    this.hmsDataServiceService.getApi(CardApi.getHsaMaxPeriodTypeUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        this.arrMaxPeriodType = data.result;
      }
    })
  }

  BindGridData() {
    this.arrMaximumArray = [];
    this.disciplineKey = $('#lbldisciplineKey').html();
    var requestedData: any;

    if (this.cardHolderMaximum) {
      this.isMaximum = true  //To show period type in Maximums   
      requestedData = {
        "cardHolderKey": this.cardHolderdetails.cardHolderKey,
      }

      this.hmsDataServiceService.postApi(CardApi.getTopupCardholderMax, requestedData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          for (var i = 0; i < data.result.length; i++) {
            data.result[i].cardHsaMaxKey = data.result[i].chHsaMaxKey;
            data.result[i].hsaMaxPeriodTypeKey = data.result[i].hsaMaxPeriodTypeDesc;
            data.result[i].cardHsaMaxAmt = data.result[i].chHsaMaxAmt;
            data.result[i].cardHsaMaxDesc = data.result[i].chHsaMaxDesc;
          }
          this.arrMaximumArray = data.result;
          error => { }
        }
      });
    } else {
      this.isOverrides = true; //To show period type in Overrides
      requestedData = {
        "cardKey": this.cardKey,
        "userId": this.userId
      }
      this.hmsDataServiceService.postApi(CardApi.getAllCardHsaMaxUrl, requestedData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.arrMaximumArray = data.result;
          for (var i = 0; i < this.arrMaximumArray.length; i++) {
            if (this.arrMaximumArray[i].expiredOn) {
              var check = this.checkExpiryDate(this.arrMaximumArray[i].expiredOn)
              this.arrMaximumArray[i]['checkDate'] = check
            }
          }
          error => { }
        }
      });
    }
  }

  AddNew() {
    if (!this.editMode) {
      this.selectedRowId = '';
      this.resetNewRecord();
      this.addMode = true;
    }
  }

  SaveInfo() {
    this.newRecordValidate = true;
    if (this.validateAllFields(this.arrNewMaximumArray)) {
      var requestedData;
      this.disciplineKey = $('#lbldisciplineKey').html();
      if (this.cardHolderMaximum) {
        this.showLoader = true;
        requestedData = {
          "maxKey": 0,
          "expiredOn": this.arrNewMaximumArray.expiredOn,
          "effectiveOn": this.arrNewMaximumArray.effectiveOn,
          "maxPeriodTypeKey": +this.arrNewMaximumArray.hsaMaxPeriodTypeKey,
          "cardHolderKey": +this.cardHolderdetails.cardHolderKey,
          "maxAmount": +this.arrNewMaximumArray.cardHsaMaxAmt,
          "maxDesc": this.arrNewMaximumArray.cardHsaMaxDesc,
          "unitKey": ''
        }
        this.hmsDataServiceService.postApi(CardApi.saveTopupCardholderMax, requestedData).subscribe(
          data => {
            this.showLoader = false;
            if (data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this.toastrService.success("Record Saved Successfully!");
              this.BindGridData();
              this.resetNewRecord();
            }
          }
        )
      } else {
        this.showLoader = true;
        requestedData = {
          "cardHsaMaxKey": 0,
          "expiredOn": this.arrNewMaximumArray.expiredOn,
          "effectiveOn": this.arrNewMaximumArray.effectiveOn,
          "hsaMaxPeriodTypeKey": +this.arrNewMaximumArray.hsaMaxPeriodTypeKey,
          "cardKey": +this.cardKey,
          "cardHsaMaxAmt": +this.arrNewMaximumArray.cardHsaMaxAmt,
          "cardHsaMaxDesc": this.arrNewMaximumArray.cardHsaMaxDesc,
          "disciplineKey": +$('#lbldisciplineKey').html(),
          "userId": this.userId
        }
        this.hmsDataServiceService.postApi(CardApi.addOrUpdateCardHsaMaxUrl, requestedData).subscribe(
          data => {
            this.showLoader = false;
            if (data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this.toastrService.success("Record Saved Successfully!");
              this.BindGridData();
              this.resetNewRecord();
            }
          }
        )
      }
    }
  }

  UpdateInfo(dataRow) {
    if (this.validateAllFields(dataRow)) {
      var requestedData;
      this.disciplineKey = $('#lbldisciplineKey').html();
      if (this.cardHolderMaximum) {
        this.showLoader = true;
        //To get maxPeriodTypeKey and save correct data in period type(Maximums)
        for (var i = 0; i < this.arrMaxPeriodType.length; i++) {
          this.maxPeriodTypeKey[i] = this.arrMaxPeriodType[i].hsaMaxPeriodTypeKey;
          this.maxPeriodTypeDesc[i] = this.arrMaxPeriodType[i].hsaMaxPeriodTypeDesc;
          if (dataRow.hsaMaxPeriodTypeKey == this.maxPeriodTypeDesc[i]) {
            var keyIndex = i;
          }
        }
        var mptkey = this.maxPeriodTypeKey[keyIndex]
        requestedData = {
          "maxKey": dataRow.cardHsaMaxKey,
          "expiredOn": dataRow.expiredOn,
          "effectiveOn": dataRow.effectiveOn,
          "maxPeriodTypeKey": +mptkey, //Set correct data in period type(Maximums)
          "cardHolderKey": +this.cardHolderdetails.cardHolderKey,
          "maxAmount": +dataRow.cardHsaMaxAmt,
          "maxDesc": dataRow.cardHsaMaxDesc,
          "unitKey": '',
        }
        this.hmsDataServiceService.postApi(CardApi.saveTopupCardholderMax, requestedData).subscribe(
          data => {
            this.showLoader = false;
            if (data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this.toastrService.success("Record Updated Successfully!");
              this.editMode = false;
              this.selectedRowId = '';
              this.BindGridData();
              this.resetNewRecord();
            }
          }
        )
      } else {
        this.showLoader = true;
        requestedData = {
          "cardHsaMaxKey": dataRow.cardHsaMaxKey,
          "expiredOn": dataRow.expiredOn,
          "effectiveOn": dataRow.effectiveOn,
          "hsaMaxPeriodTypeKey": +dataRow.hsaMaxPeriodTypeKey,
          "cardKey": +this.cardKey,
          "cardHsaMaxAmt": +dataRow.cardHsaMaxAmt,
          "cardHsaMaxDesc": dataRow.cardHsaMaxDesc,
          "disciplineKey": +$('#lbldisciplineKey').html(),
          "userId": this.userId
        }
        this.hmsDataServiceService.postApi(CardApi.addOrUpdateCardHsaMaxUrl, requestedData).subscribe(
          data => {
            this.showLoader = false;
            if (data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this.toastrService.success("Record Updated Successfully!");
              this.editMode = false;
              this.selectedRowId = '';
              this.BindGridData();
              this.resetNewRecord();
            }
          }
        )
      }
    }
  }

  EditInfo(dataRow) { //Logic for view by choose between both "td" Override and Maximum accordingly
    if (this.cardHolderMaximum) {
      this.isMaximum = true;
    }
    else {
      this.isOverrides = true
    }
    if (!this.editMode) {
      this.editMode = true;
      this.addMode = false;
      this.selectedRowId = dataRow.cardHsaMaxKey;
      dataRow.cardHsaMaxAmt = CustomValidators.ConvertAmountToDecimal(dataRow.cardHsaMaxAmt);
    }
  }

  validateAllFields(objRow: any) {
    if (objRow.hsaMaxPeriodTypeKey && objRow.cardHsaMaxDesc != '' && objRow.cardHsaMaxAmt != '' && objRow.effectiveOn != ''
      && objRow.expiredOn != '') {
      return true;
    }
    else {
      return false;
    }
  }

  GetTopupMax() {
    this.resetNewRecord();
    var requestedData = {
      "disciplineKey": +$('#lbldisciplineKey').html(),
      "userId": this.userId
    }
    this.hmsDataServiceService.postApi(CardApi.getAllCardHsaMaxUrl, requestedData).subscribe(data => {
      this.arrTopupMax = [];
      if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        this.arrTopupMax = data.result;
      }
    })
  }

  resetNewRecord() {
    this.addMode = false;
    this.arrNewMaximumArray = {
      "hsaMaxPeriodTypeKey": "",
      "cardHsaMaxDesc": "",
      "cardHsaMaxAmt": "",
      "effectiveOn": "",
      "expiredOn": "",
      "checkDate": false
    }
    this.selectedRowId = '';
    this.newRecordValidate = false;
  }

  CancelInfo() {
    this.editMode = false;
    this.addMode = false;
    this.selectedRowId = "";
    this.BindGridData();  //To fetch saved values instead of getting (edit-> cancelled)
  }

  DeleteInfo(dataRow) {
    var action = "cancel";
    if (dataRow && dataRow.cardHsaMaxKey) {
      action = "Delete";
    }
    this.exDialog.openConfirm((this.translate.instant('claims.exDialog.are-you-sure')) + action + (this.translate.instant('claims.exDialog.record')))
      .subscribe((value) => {
        if (value) {
          if (this.addMode) {
            this.resetNewRecord();
          }
          else {
            var requestedData;
            if (this.cardHolderMaximum) {
              requestedData = {
                "maxKey": dataRow.cardHsaMaxKey
              }
              this.hmsDataServiceService.postApi(CardApi.deleteCardHolderHsaMaximum, requestedData).subscribe(data => {
                if (data.hmsMessage.messageShort == "RECORD_DELETED_SUCCESSFULLY") {
                  this.toastrService.success("Record Deleted Successfully!");
                  this.BindGridData();
                }
              })
            } else {
              requestedData = {
                "cardHsaMaxKey": dataRow.cardHsaMaxKey,
                "userId": this.userId
              }
              this.hmsDataServiceService.postApi(CardApi.deleteCardHsaMaxUrl, requestedData).subscribe(data => {
                if (data.hmsMessage.messageShort == "RECORD_DELETED_SUCCESSFULLY") {
                  this.toastrService.success("Record Deleted Successfully!");
                  this.BindGridData();
                }
              })
            }
          }
        }
      })
  }

  ConvertAmountToDecimal(evt, dataRow) {
    if (this.addMode) {
      this.arrNewMaximumArray.cardHsaMaxAmt = CustomValidators.ConvertAmountToDecimal(evt.target.value);
    }
    else {
      dataRow.cardHsaMaxAmt = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
    }
  }


  ChangeInputDateFormat(event, idx, type) {
    let inputDate = event.target;
    if (inputDate.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(inputDate);

      if (obj == null) {
        this.toastrService.warning(this.translate.instant('card.toaster.invalid-date'));
      }
      else {
        inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
        if (this.addMode) {
          let effectiveOn = this.arrNewMaximumArray.effectiveOn;
          let expiredOn = this.arrNewMaximumArray.expiredOn;
          if (type == 'effectiveOn') {
            effectiveOn = inputDate
          }
          else {
            expiredOn = inputDate
            var check = this.checkExpiryDate(inputDate)
            this.arrNewMaximumArray.checkDate = check
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
              this.arrNewMaximumArray[type] = inputDate;
            }
          }
          else {
            this.arrNewMaximumArray[type] = inputDate;
          }
        }
        else {
          this.arrMaximumArray[idx][type] = inputDate;
          let effectiveOn = this.arrMaximumArray[idx].effectiveOn;
          let expiredOn = this.arrMaximumArray[idx].expiredOn;
          var check = this.checkExpiryDate(this.arrMaximumArray[idx].expiredOn)
          this.arrMaximumArray[idx]['checkDate'] = check
          if (effectiveOn && expiredOn) {
            var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
            if (isTrue) {
              this.toastrService.warning(this.translate.instant('card.toaster.effective-on-date'));
              if (type == 'effectiveOn') {
                this.arrMaximumArray[idx].effectiveOn = '';
              }
              else {
                this.arrMaximumArray[idx].expiredOn = '';
              }
            }
            else {
              this.arrMaximumArray[idx][type] = inputDate;
            }
          }
          else {
            this.arrMaximumArray[idx][type] = inputDate;
          }
        }
      }
    }
  }

  checkExpiryDate(date) {
    if (date) {
      var check = this.changeDateFormatService.isFutureDate(date)
      if (check) {
        return false // black color
      } else {
        return true // red color
      }
    }
  }
}