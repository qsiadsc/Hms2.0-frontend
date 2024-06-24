// Using for card-holders-popup in card module expenciveAdjustment option
import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CardHolderPopupGeneralInformationComponent } from './card-holder-popup-general-information/card-holder-popup-general-information.component';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardApi } from '../card-api'
import { CardServiceService } from '../../card-module/card-service.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { QueryList, ViewChildren } from '@angular/core';
import { Subject, Subscription } from 'rxjs/Rx';
import { Constants } from '../../common-module/Constants';
import { DataTableDirective } from 'angular-datatables';
@Component({
  selector: 'app-card-holder-popup',
  templateUrl: './card-holder-popup.component.html',
  styleUrls: ['./card-holder-popup.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, TranslateService]
})
export class CardHolderPopupComponent implements OnInit {
  @Input() CardHolderGeneralInfo: any;
  @Input() cardHolderKey: string;
  @Input() companyKey: string;
  @Input() cardHolderData
  @Output() emitOnSave: EventEmitter<any> = new EventEmitter<any>();
  @Input() addMode: boolean = true; //Enable true when user add a new card
  @Input() viewMode: boolean = false; //Enable true after a new card added
  @Input() editMode: boolean = false; //Enable true after viewMode when user clicks edit button
  cardEffDate;
  arrayObject;
  arrayObjectKey;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];

  public plans = [];
  arrRoleList;
  hiddenParamName: string;
  rolehiddenParamName: string;
  apiRequestType: string;

  eligibilityDeleteIcon: boolean = false;
  eligibilityAllColumnAction: boolean = false;

  eligibilityHistoryTableID
  eligibilityHistorytableActions
  eligibilityHistoryColumns
  eligibilityHistorytableData
  eligibilityHistorytableKeys
  eligibilityHistoryTableHeading
  eligibilityHistorySaveUrl

  dateNameArray = []
  eligibilityArray = []
  expenseArray = []
  effDateSubs: Subscription;

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  @ViewChild(CardHolderPopupGeneralInformationComponent) cardHolderPopupGeneralInformationComponent; // to acces variable of card holder general information form

  constructor(private fb: FormBuilder,
    private dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    public cardService: CardServiceService,
    private toastrService: ToastrService,
    private changeDateFormatService: ChangeDateFormatService,
    private exDialog: ExDialog,
    private translate: TranslateService) {
    this.hiddenParamName = "cardholderKey";
    this.initiateEligibilityHistory();
    this.effDateSubs = cardService.cardEffectiveDate.subscribe((value) => {
      this.cardEffDate = value;
    })
  }

  ngOnInit() {
    var self = this;
    this.EligibilityHistoryGrid();
    this.dtOptions['cardholder-eligibility-history-table'] = Constants.dtOptionsConfig;
    this.dtTrigger['cardholder-eligibility-history-table'] = new Subject();
  }


  reloadTable(tableID) {
    this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  ngAfterViewInit(): void {
    this.dtTrigger['cardholder-eligibility-history-table'].next()
  }

  initiateEligibilityHistory() {
    this.eligibilityHistoryTableHeading = "Eligibility History"
    this.eligibilityHistorySaveUrl = CardApi.addUpdateHolderEligibilityHistoryUrl
    this.eligibilityHistoryColumns = [
      { title: "Ignore Plan Age", data: 'chIgnorePlanAge' },
      { title: "Effective Date", data: 'eligibilityEffectiveOn' },
      { title: "Expiry Date", data: 'eligibilityExpiryOn' },
      { title: "Action", data: 'action' }
    ]

    this.eligibilityHistorytableData = []

    this.eligibilityHistoryTableID = "cardholder-eligibility-history-table"

    this.eligibilityHistorytableKeys = [
      { 'column': 'chIgnorePlanAge', 'type': 'checkbox', 'name': 'chIgnorePlanAge', 'required': false },
      { 'column': 'eligibilityEffectiveOn', 'type': 'datepicker', 'name': 'eligibilityEffectiveOn', 'required': true },
      { 'column': 'eligibilityExpiryOn', 'type': 'datepicker', 'name': 'eligibilityExpiryOn', 'greater_than': 'eligibilityEffectiveOn', 'required': false },
      { 'column': 'action', 'type': 'action' }
    ]
    this.eligibilityHistorytableActions = [
      { 'name': 'edit', 'serverSide': false, 'val': '', 'class': 'edit_row table-action-btn edit-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-pencil' },
      { 'name': 'save', 'serverSide': false, 'val': '', 'class': 'save_row table-action-btn save-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-save' },
      { 'name': 'delete', 'serverSide': true, 'val': '', 'class': 'delete_row table-action-btn del-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-trash' },
      { 'name': 'chEligibilityKey', 'val': '', 'class': '', 'type': 'hidden', 'unique': true },
      { 'name': 'cardHolderKey', 'val': '', 'class': '', 'type': 'hidden' }
    ]
  }

  EligibilityHistoryGrid() {
    var self = this
    $(document).on('click', "#cardholder-eligibility-history-table .edit_row", function (e) {

      e.preventDefault()
      var dad = $(this).closest('tr');
      dad.find('label').hide();
      dad.find('.editableInput').show();
      $(this).hide();
      $(this).next('a.save_row').show();
    });

    $(document).on('click', "#cardholder-eligibility-history-table .save_row", function (e) {
      e.preventDefault()
      var addFilled = true
      var dad = $(this).closest('tr');
      var saveData = {}
      dad.find(".editableInput").each(function () {
        var elem;
        if ($(this).data('type') == "date") {
          var id = $(this).attr('id')
          elem = $("#" + id).find("input")
          var val = $("#" + id).find("input").val().toString()
          saveData[$(this).data('updateid')] = val
        }
        else {
          elem = $(this)
          var val = $(this).val().toString()
          saveData[$(this).attr('name')] = val
        }
        if ((val == "") && ($(this).hasClass('required'))) {
          addFilled = false
          $(elem).addClass("error_field")
        } else {
          $(this).removeClass("error_field")
          if ($(this).attr('type') == "checkbox") {
            if ($(this).is(":checked")) {
              $(this).prev('label').text("Yes")
            } else {
              $(this).prev('label').text("No")
            }
          } else {
            $(this).prev('label').text(val)
          }
        }
      })
      if (addFilled) {
        var rowData = {}
        self.updateEligibilityDateObj();
        dad.find(".editableInput").each(function () {
          var key = $(this).data('updateid');
          var val = '';
          if ($(this).data('type') == 'hidden') {
            val = $(this).val().toString()
          }
          else
            if ($(this).data('type') == "date") {
              var id = $(this).data('updateid')
              val = $(this).find("input").val().toString()
            }
            else {
              val = $(this).val().toString()
            }

          if ($(this).attr('type') == "checkbox") {
            if ($(this).is(':checked')) {
              val = 'T'
            } else {
              val = 'F'
            }
          }
          if (key != 'undefined' && key != undefined) {
            rowData[key] = val
          }
        })

        let chEligibilityKey = 0
        if (rowData['chEligibilityKey']) {
          chEligibilityKey = rowData['chEligibilityKey']
        }

        var requestedData = {
          "chEligibilityKey": chEligibilityKey,
          "cardHolderKey": self.cardHolderKey,
          "chIgnorePlanAge": rowData['chIgnorePlanAge'],
          "eligibilityExpiryOn": rowData['eligibilityExpiryOn'],
          "eligibilityEffectiveOn": rowData['eligibilityEffectiveOn'],
        }

        self.hmsDataService.postApi(CardApi.addUpdateHolderEligibilityHistoryUrl, requestedData).subscribe(data => {
          if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY') {
            self.emitOnSave.emit(requestedData);
            dad.find('label').show();
            dad.find('.editableInput').hide();
            $(this).hide()
            dad.find('a.save_row').hide();
            dad.find('a.delete_row').hide();
            dad.find('a.edit_row').show()

            self.toastrService.success(self.translate.instant('card.toaster.record-save'))
          }
          else if (data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OR_EQUAL_OLD_EFFECTIVEON') {
            self.toastrService.warning("Eligibility Effective Date Should Be Greater Than or Equal To Previous Effective Date!")
          }
          else if (data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
            self.toastrService.warning("Eligibility Effective Date Should Be Greater Than Previous Expiry Date!")
          }
          else if (data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
            self.toastrService.warning("Eligibility Effective Date Should Be Greater Than Previous Effective Date!")
          }
        }
        )
      }
    })

    $(document).on('click', "#cardholder-eligibility-history-table .delete_row", function (e) {
      self.exDialog.openConfirm(self.translate.instant('card.exDialog.delete-history')).subscribe((value) => {
        if (value) {
          var rowData = $(this).parents('tr')

          var rowId = []
          rowId = rowData.attr('id').split('_')
          self.eligibilityHistorytableData.splice(rowId[1], 1)
          rowData.remove()
          $("#cardholder-eligibility-history-table").find('tr.tableRow:first-child').find('td:last-child').find('a').removeClass('disabled')
        }
      })
    });
  }

  addEligibilityFieldValue() {
    var hasError = false
    $("#cardholder-eligibility-history-table .editableInput").each(function () {
      var elem;

      if ($(this).data('type') == "date") {
        var id = $(this).attr('id')
        elem = $("#" + id).find("input")
      } else {
        elem = $(this)
      }
      if (elem.val() == "" && $(this).hasClass('required')) {

        hasError = true
        $(elem).addClass("error_field")
        $(elem).show()
        $(elem).focus()
      }
    })
    $('#cardholder-eligibility-history-table .save_row').each(function () {
      if ($(this).is(':visible')) {
        hasError = true
      }
    })
    if (!hasError) {
      var tableid = 'cardholder-eligibility-history-table';
      var previousActions = $("#" + tableid).find('tr.tableRow:first-child').find('td:last-child');
      var newRow = {}
      newRow['effectiveDate'] = ""
      newRow['adjustmentAmount'] = ""
      newRow['action'] = ""
      var tableLength = $("#" + tableid).find('tr.tableRow').length
      this.eligibilityHistorytableData.unshift(
        newRow
      )
      this.eligibilityArray[tableid + 0 + 'eligibilityEffectiveOn'] = ''
      this.eligibilityArray[tableid + 0 + 'eligibilityExpiryOn'] = ''

      setTimeout(function () {
        var tableActions = $("#cardholder-eligibility-history-table tr.tableRow:first-child td:last-child");
        var str = "<div class='tb-actions tb-actions-right'>"
        str = str + "<a href='javascript:void(0)' class='edit_row table-action-btn edit-ico' >"
        str = str + "<i class='fa fa-pencil'></i>"
        str = str + "</a>"
        str = str + "<a href='javascript:void(0)' class='save_row table-action-btn save-ico' ><i class='fa fa-save'></i></a>"
        str = str + "</div>"

        tableActions.html(str)
        previousActions.find('a').addClass('disabled')

        tableActions.append("<a href='javascript:void(0)' class='delete_row table-action-btn del-ico' ><i class='fa fa-trash'><i></a>")
        tableActions.find(".edit_row").trigger('click')
        tableActions.find(".save_row").show()
      }, 100);
    }
  }

  updateEligibilityDateObj() {
    var self = this
    $("#cardholder-eligibility-history-table tr.tableRow").each(function () {
      $(this).find(".editableInput").each(function () {
        var key = $(this).data('updateid');
        var val = '';
        if ($(this).data('type') == "date") {
          var id = $(this).data('updateid')
          val = $(this).find("input").val().toString()
          self.eligibilityArray[$(this).attr("id")] = $(this).prev('label').text()
        }
      })
    })
  }

  changeDateFormatWithoutCompare(event, frmControlName, actionType) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);

      if (actionType == 'eligibility') {
        let inPutdateInString = this.changeDateFormatService.convertDateObjectToString(obj);
        var IsEffDateValid = this.changeDateFormatService.compareTwoDate(this.cardEffDate, inPutdateInString);
        if (IsEffDateValid) {
          this.eligibilityArray[frmControlName] = '';
          this.toastrService.warning("Card Holder Effective date can't be less then Card Effective date!");
        }
        else {
          this.eligibilityArray[frmControlName] = {
            year: obj.date.year,
            month: obj.date.month,
            day: obj.date.day
          };
        }
      }
      else {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  getEligibilityHistory() {
    let requestedData = {
      "cardHolderKey": this.cardHolderKey,
      "startPos": "0",
      "pageSize": "2500"
    }
    this.hmsDataService.postApi(CardApi.getCardHolderEligibilityListUrl, requestedData).subscribe(
      res => {
        var tableid = 'cardholder-eligibility-history-table';

        this.eligibilityHistorytableData = [];
        this.eligibilityHistorytableData = res.result;

        if (!this.eligibilityHistorytableData) {
          this.eligibilityHistorytableData = []
        }

        for (var j = 0; j < this.eligibilityHistorytableData.length; j++) {
          this.dateNameArray[tableid + j + 'eligibilityEffectiveOn'] = this.eligibilityHistorytableData[j]['eligibilityEffectiveOn']
          this.dateNameArray[tableid + j + 'eligibilityExpiryOn'] = this.eligibilityHistorytableData[j]['eligibilityExpiryOn']
        }
        this.reloadTable(tableid)
      }
    )
  }

  EligibilityDateExpenseFormat(event, frmControlName, dependId, greaterThan) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (greaterThan) {
      }
      this.eligibilityArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
      var dateObj = this.eligibilityArray[frmControlName]
      if (this.eligibilityArray[frmControlName].day > 10) {
        var dte = dateObj.day + '/' + dateObj.month + '/' + dateObj.year;
      } else {
        var dte = '0' + dateObj.day + '/' + dateObj.month + '/' + dateObj.year;
      }
      dte = dte.toString()
      dte = dte.replace('/', '-')
      dte = dte.replace('/', '-')
      var dependValue = $("#" + dependId).find('input').val().toString()

      dependValue = dependValue.replace('/', '-')
      dependValue = dependValue.replace('/', '-')

      if (dependValue > dte) {
        this.eligibilityArray[frmControlName] = []
        $("#" + frmControlName + " input").val('')
        $("#" + frmControlName).addClass('error_field')
      }
    }
  }

  ngOnDestroy() {
    if (this.effDateSubs) {
      this.effDateSubs.unsubscribe();
    }
  }
}