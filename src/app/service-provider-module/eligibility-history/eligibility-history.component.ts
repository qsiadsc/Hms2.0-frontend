import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi } from '../../card-module/card-api'
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ServiceProviderApi } from '../service-provider-api';
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { Subject } from 'rxjs/Rx';
import { Constants } from '../../common-module/Constants'
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { ServiceProviderService } from '../serviceProvider.service';
import { THIS_EXPR } from '../../../../node_modules/@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-eligibility-history',
  templateUrl: './eligibility-history.component.html',
  styleUrls: ['./eligibility-history.component.css'],
  providers: [ChangeDateFormatService, TranslateService]
})

export class EligibilityHistoryComponent implements OnInit {
  arrTopupMax;
  arrSplDiscType;
  addMode: boolean = false;
  editMode: boolean = false;
  viewMode: boolean = false;
  selectedRowId = '';
  arrData = [];
  suspendedInd;
  suspendedIndAddValue;
  suspendedIndAddValue1;
  requestedData = [];
  arrNewRow = {
    "effectiveOn": "",
    "expiredOn": "",
    "idx": "",
    "suspendedInd": false,
    "checkDate": false
  }

  updateEffectiveRow = []
  updateExpiredRow = []
  selectedDisciplineKey;
  /* New Empty Record array */
  newRecordValidate: boolean = false;

  @Input() cardKey: string;
  @Input() providerKey: string;
  @Input() disciplineKey: string;
  @Input() serviceProviderEditMode: boolean; //set value edit value
  @Input() serviceProviderViewMode: boolean; //set value View value
  @Input() serviceProviderAddMode: boolean; //set value Add value
  @Input() serviceProviderChecks: any;

  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  @ViewChildren(DataTableDirective)
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;//datepicker Options
  expired: boolean;

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private dataTableService: DatatableService,
    private _hotkeysService: HotkeysService,
    private serviceProviderService: ServiceProviderService
  ) {
    serviceProviderService.selectedDisciplineKey.subscribe((value) => {
      {
        this.selectedDisciplineKey = value
      }
    })
    this._hotkeysService.add(new Hotkey('shift+e', (event: KeyboardEvent): boolean => {
      if (!this.serviceProviderViewMode) {
        this.AddNew()
      }
      return false; // Prevent bubbling
    }));
    this.serviceProviderService.saveUpdateProvider.subscribe(data => {
      if (data) {
        this.resetNewRecord();
      }
    })
  }

  ngOnInit() {
    if (!this.serviceProviderAddMode) {
      this.GetEligibilityBasedOnProvider(false)
    }
    this.dtOptions['SPGrdEligHistory'] = Constants.dtOptionsConfig
    this.dtTrigger['SPGrdEligHistory'] = new Subject();
  }

  GetEligibilityBasedOnProvider(reload) {
    var requestedData = {
      "provKey": this.providerKey,
      "disciplineKey": this.disciplineKey,
    }
    this.hmsDataServiceService.postApi(ServiceProviderApi.getServiceProviderEligibilityBasedOnProviderUrl, requestedData).subscribe(data => {
      if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
        this.arrData = data.result;
        for (var i = 0; i < this.arrData.length; i++) {
          this.arrData[i]['suspendedInd'] = this.arrData[i]['suspendedInd'] == 'T' ? true : false
          if(this.arrData[i].expiredOn){
            var check = this.checkExpiryDate(this.arrData[i].expiredOn)
            this.arrData[i]['checkDate'] = check
          }
        }
        if (!$.fn.dataTable.isDataTable('#SPGrdEligHistory')) {
          this.dtTrigger['SPGrdEligHistory'].next()

        } else {
          this.reloadTable('SPGrdEligHistory')
        }
      }
    })
  }

  reloadTable(tableID) {
    this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  AddNew() {
    if (!this.editMode) {
      this.selectedRowId = '';
      this.resetNewRecord();
      this.addMode = true;
      setTimeout(function () {
        var txtDate = <HTMLInputElement>document.getElementById('txtEffectiveOn');
        txtDate.focus();
      }, 100);
    }
  }

  SaveInfo() {
    this.requestedData = [];
    this.newRecordValidate = true;
    if (this.validateAllFields(this.arrNewRow)) {
      var requestedData;
      if (!this.serviceProviderAddMode) {
        requestedData = {
          "provKey": this.providerKey,
          "disciplineKey": +this.disciplineKey,
          "provEligibilityDto": {
            "provEligibilKey": 0,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn),
            "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn),
            "suspendedInd": this.arrNewRow.suspendedInd == false ? 'F' : 'T'
          }
        }
        this.hmsDataServiceService.postApi(ServiceProviderApi.saveOrUpdateServiceProviderEligibilityUrl, requestedData).subscribe(
          data => {
            if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this.toastrService.success(this.translate.instant('serviceProvider.toaster.record-saved'));
              this.GetEligibilityBasedOnProvider(true);
              this.resetNewRecord();
            }
            else if (data.code == 400 && data.message == "RECORD_ALREADY_EXIST") {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.eligibility-exist'));
            }
            else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
            }
            else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date'));
            }
          }
        )
      }
      else {
        if (this.arrNewRow.suspendedInd == true) {
          this.suspendedIndAddValue = 'T'
        }
        else {
          this.suspendedIndAddValue = 'F'
        }
        requestedData = {
          "provEligibilKey": 0,
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn),
          "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn),
          "suspendedInd": this.suspendedIndAddValue
        }
        this.arrNewRow.idx = (this.arrData.length).toString()
        this.requestedData.push(requestedData)
        if(requestedData.expiredOn){
          var check = this.checkExpiryDate(requestedData.expiredOn)
          this.arrNewRow.checkDate = check
        }
        this.arrData.push(this.arrNewRow)
        this.editMode = false;
        this.addMode = false;
        this.arrNewRow.effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn);
        this.arrNewRow.expiredOn = this.arrNewRow.expiredOn ? this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn) : ""

        setTimeout(() => {
          this.toastrService.success(this.translate.instant('serviceProvider.toaster.record-saved'));
        }, 500);
      }
    }
  }

  UpdateInfo(dataRow, idx) {
    if (this.validateAllFields(dataRow)) {
      var requestedData = {}
      if(dataRow.expiredOn){
        var check  = this.checkExpiryDate(dataRow.expiredOn)
        dataRow.checkDate = check
      }
      if (!this.serviceProviderAddMode) {
        requestedData = {
          "provKey": this.providerKey,
          "disciplineKey": this.disciplineKey,
          "provEligibilityDto": {
            "provEligibilKey": dataRow.provEligibilKey,
            "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.updateEffectiveRow[idx]),
            "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.updateExpiredRow[idx]),
            "suspendedInd": dataRow.suspendedInd ? 'T' : 'F'
          }
        }
        this.hmsDataServiceService.postApi(ServiceProviderApi.saveOrUpdateServiceProviderEligibilityUrl, requestedData).subscribe(
          data => {
            if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this.toastrService.success(this.translate.instant('card.toaster.record-update'));
              this.editMode = false;
              this.selectedRowId = '';
              this.GetEligibilityBasedOnProvider(true);
              this.resetNewRecord();
            } else if (data.code == 400 && data.message == "RECORD_ALREADY_EXIST") {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.eligibility-exist'));
            } else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON") {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
            } else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date'));
            }
          })
      } else {
        var updateData = {
          "provEligibilKey": 0,
          "effectiveOn": dataRow.effectiveOn,
          "expiredOn": dataRow.expiredOn,
          "suspendedInd": dataRow.suspendedInd,
          "idx": idx
        }
        requestedData[idx] = updateData
        this.editMode = false
        this.selectedRowId = '';
      }
    }
  }

  /**
  * Edit Grid Row Item 
  * @param idx 
  * @param dataRow 
  */
  EditInfo(dataRow, idx) {
    if (!this.editMode) {
      this.editMode = true;
      this.addMode = false;
      var effectiveOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn);
      var expiredOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn);
      this.updateEffectiveRow[idx] = effectiveOnObj
      this.updateExpiredRow[idx] = expiredOnObj
      if (this.serviceProviderAddMode) {
        this.selectedRowId = dataRow.idx
      } else {
        this.selectedRowId = dataRow.provEligibilKey;
      }
    }
  }

  validateAllFields(objRow: any) {
    if (objRow.effectiveOn != '') {
      return true;
    }
    else {
      return false;
    }
  }

  resetNewRecord() {
    this.addMode = false;
    this.arrNewRow = {
      "suspendedInd": false,
      "effectiveOn": "",
      "expiredOn": "",
      "idx": "",
      "checkDate": false
    }
    this.selectedRowId = '';
    this.newRecordValidate = false;
  }

  DeleteInfo(dataRow) {
    var action = "cancel";
    if (dataRow && dataRow.provEligibilKey) {
      action = "Delete";
    }
    this.exDialog.openConfirm((this.translate.instant('card.exDialog.are-you-sure')) + ' ' + action + ' ' + (this.translate.instant('card.exDialog.record')))
      .subscribe((value) => {
        if (value) {
          this.resetNewRecord();
        }
      })
  }

  /**
  * Cancel Operation
  */
  CancelInfo() {
    this.editMode = false;
    this.addMode = false;
    this.selectedRowId = ""
  }

  /**Change Input Date Format and Validate It should not be greater than Claim Recieved date and Future date*/
  ChangeInputDateFormat(event, idx, type) {
    let inputDate = event;
    if (inputDate.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(inputDate);
      if (obj == null) {
        this.toastrService.warning(this.translate.instant('card.toaster.invalid-date'));
      }
      else {
        inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
        if (this.addMode) {
          let effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn);
          let expiredOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn);
          if (type == 'effectiveOn') {
            effectiveOn = inputDate
          }
          else {
            expiredOn = inputDate
          }
          if (effectiveOn && expiredOn) {
            var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
            if (isTrue) {
              this.toastrService.warning(this.translate.instant('card.exDialog.expiry-date'));
              if (type == 'effectiveOn') {
                this.arrNewRow.effectiveOn = '';
              }
              else {
                this.arrNewRow.expiredOn = '';
              }
            }
            else {
              this.arrNewRow[type] = obj;
            }
          
          }
          else {
            this.arrNewRow[type] = obj;
          }
        }
        else {
          this.arrData[idx][type] = inputDate;
          let effectiveOn = this.arrData[idx].effectiveOn;
          let expiredOn = this.arrData[idx].expiredOn;
          if (effectiveOn && expiredOn) {
            var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn, expiredOn);
            if (isTrue) {
              this.toastrService.warning(this.translate.instant('card.exDialog.expiry-date'));
              if (type == 'effectiveOn') {
                this.updateEffectiveRow[idx] = '';
              }
              else {
                this.updateExpiredRow[idx] = '';
              }
            }
            else {
              if (type == 'effectiveOn') {
                this.updateEffectiveRow[idx] = obj;
              }
              else {
                this.updateExpiredRow[idx] = obj;
              }
            }
          }
          else {
            if (type == 'effectiveOn') {
              this.updateEffectiveRow[idx] = obj;
            }
            else {
              this.updateExpiredRow[idx] = obj;
            }
          }
        }
      }
    }
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    else if (event.reason == 1 && event.value != null && event.value != ''){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
     }
  }

  // For Log #0189350
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
