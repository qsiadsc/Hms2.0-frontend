import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { CommonApi } from '../../common-module/common-api';
import { FinanceApi } from '../../finance-module/finance-api';
import { DataManagementDashboardApi } from '../data-management-dashboard-api';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-card-print-request',
  templateUrl: './card-print-request.component.html',
  styleUrls: ['./card-print-request.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})
export class CardPrintRequestComponent implements OnInit {

  columns = [];
  phyColumns = [];
  showPageLoader: boolean = false;

  dateNameArray = {}
  cardKey: Number;
  cardholderDetails;
  searchedCardDetail = []
  dataManagement: boolean = false
  key: Number
  imgUrl;
  cardId;
  cardName;
  cardholderName: string;
  planKey: Number;
  coKey: Number;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions
  cardNum: any;
  observableObj;
  check:boolean = true

  constructor(private dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private exDialog: ExDialog) { }

  ngOnInit() {
    this.dataManagement ? this.imgUrl = location.origin + '/assets/images/alberta-logo.png' : this.imgUrl = location.origin + '/assets/images/logo.png'

    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('dataManagementDashboard.cardPrintRequests.cardNo') == 'dataManagementDashboard.cardPrintRequests.cardNo') {
        } else {
          this.phyColumns = [
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.cardNo'), data: 'cardNum' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.lastName'), data: 'personLastName' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.firstName'), data: 'personFirstName' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.companyNameNo'), data: 'companyName' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.planNameNo'), data: 'plansName' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.role'), data: 'chRoleDesc' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.status'), data: 'active' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.printedOn'), data: 'printedOn' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.actions'), data: 'cardKey' },
          ];
      
          this.columns = [
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.cardNo'), data: 'cardNum' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.lastName'), data: 'personLastName' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.firstName'), data: 'personFirstName' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.companyNameNo'), data: 'companyName' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.planNameNo'), data: 'plansName' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.role'), data: 'chRoleDesc' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.status'), data: 'active' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.printedOn'), data: 'printedOn' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.createdSince'), data: 'cdCreatedOn' },
            { title: this.translate.instant('dataManagementDashboard.cardPrintRequests.actions'), data: 'cardKey' },
          ]
          this.getCardPrintRequestList();
          this.getPhyCardPrintRequestList();
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#cardPrintRequestList .print-ico', function () {
      var id = $(this).data('id')
      self.key = id;
      self.cardNum = $(this).data('card')
      self.getPrintCard(self.key)
    })
    $(document).on('click', '#phyCardPrintRequestList .print-ico', function () {
      var id = $(this).data('id')
      self.key = id;
      self.cardNum = $(this).data('card')

      self.getPrintCard(self.key)
    })

    // Log #1156: Delete Icon click functionality
    $(document).on('click', '#cardPrintRequestList .del-ico', function () {
      var id = $(this).data('id')
      self.deleteCardPrintRequest(id)
    })

    $(document).on('click', '#phyCardPrintRequestList .del-ico', function() {
      var key = $(this).data('id')
      self.deletePhysicalCardRequest(key)
    })
  }

  getCardPrintRequestList() {
    var reqParam = [
      { 'key': 'cardNum', 'value': '' },
      { 'key': 'cdCreatedOn', 'value': '' },
      { 'key': 'createdBy', 'value': '' },
      { 'key': 'personFirstName', 'value': '' },
      { 'key': 'personLastName', 'value': '' }
    ]
    var Url = DataManagementDashboardApi.getCardNotPrintedListUrl;
    var tableId = "cardPrintRequestList"
    if (!$.fn.dataTable.isDataTable('#cardPrintRequestList')) {
      var tableActions = [
        { 'name': 'print', 'class': 'table-action-btn print-ico', 'icon_class': 'fa fa-print', 'title': '', 'showAction': '' },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': this.translate.instant('common.delete'), 'showAction': ''}
      ]
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 9, [7, 8], '', '', [1, 2, 3, 4, 5, 6, 7, 8, 9])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    return false;
  }
  getPhyCardPrintRequestList() {
    var reqParam = [
      { 'key': 'cardNum', 'value': '' },
      { 'key': 'cdCreatedOn', 'value': "" },
      { 'key': 'createdBy', 'value': '' }
    ]
    var Url = DataManagementDashboardApi.phyGetCardNotPrintedListUrl;
    var tableId = "phyCardPrintRequestList"
    if (!$.fn.dataTable.isDataTable('#phyCardPrintRequestList')) {
      var tableActions = [
        { 'name': 'print', 'class': 'table-action-btn print-ico', 'icon_class': 'fa fa-print', 'title': '', 'showAction': '' },
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': this.translate.instant('common.delete'), 'showAction': ''}
      ]
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.phyColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 8, [7], '', '', [1, 2, 3, 4, 5, 6, 7, 8])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }

    return false;
  }
  searchCardPrintRequest(tableId: string) {
    var params = this.dataTableService.getFooterParams("cardPrintRequestList")
    var URL = DataManagementDashboardApi.getCardNotPrintedListUrl;
    var dateParams = [7,8]
    this.dataTableService.jqueryDataTableReload("cardPrintRequestList", URL, params, dateParams)
  }
  phySearchCardPrintRequest(tableId: string) {
    var params = this.dataTableService.getFooterParams("phyCardPrintRequestList")
    var URL = DataManagementDashboardApi.phyGetCardNotPrintedListUrl;
    this.dataTableService.jqueryDataTableReload("phyCardPrintRequestList", URL, params, '')
  }
  resetCardPrintRequestSearch() {
    this.dataTableService.resetTableSearch();
    this.searchCardPrintRequest("cardPrintRequestList")
    $('#cardPrintRequestList .icon-mydpremove').trigger('click');
  }

  phyResetCardPrintRequestSearch() {
    this.dataTableService.resetTableSearch();
    this.phySearchCardPrintRequest("phyCardPrintRequestList")
    $('#phyCardPrintRequestList .icon-mydpremove').trigger('click');
  }

  /* Method for Footer Datepicker */
  changeDateFormat1(event, frmControlName) {
    
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  getPrintCard(id) {
    this.showPageLoader = true
    let selectedKey = id
    var url = DataManagementDashboardApi.saveCardDetailForPrintChequeUrl
    this.dataTableService.cardPrintRequestData
    
    let cardholderName = this.dataTableService.cardPrintRequestData.personFirstName + ' ' + this.dataTableService.cardPrintRequestData.personLastName
    let requestData = {
      "cardholderName": cardholderName,
      "cardholderKey": this.dataTableService.cardPrintRequestData.cardholderKey,
      "cardKey": this.dataTableService.cardPrintRequestData.cardKey,
      "coKey": this.dataTableService.cardPrintRequestData.coKey,
      "plansKey": this.dataTableService.cardPrintRequestData.plansKey,
      "personGenderCd": this.dataTableService.cardPrintRequestData.personGenderCd
    }
    this.hmsDataService.postApi(url, requestData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {

        this.cardKey = data.result.cardKey
        this.coKey = data.result.coKey
        this.planKey = data.result.plansKey
        this.cardholderName = data.result.cardholderName
        if (selectedKey.length > 1) {
          this.showPageLoader = false

          this.toastrService.error(this.translate.instant('dataManagementDashboard.toaster.pleaseSelectOneCardHolder'))
        }
        else {
          var delay = 1000;
          var self = this;
          setTimeout(function () {
            let printContents, popupWin;
            printContents = document.getElementById('PrintCard').innerHTML;
            popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
            popupWin.document.open();
            popupWin.document.write(`
                <html>
                <head>
                <style>
                //........Customized style.......
                </style>
                </head>
                <body onload="window.print();window.close()">${printContents}</body>
                </html>`
            );
            popupWin.document.close();
            self.showPageLoader = false;
            self.getCardPrintRequestList();
            self.getPhyCardPrintRequestList();
            $('html, body').animate({
              scrollTop: $("#cardPrintRequestList_processing").offset().top - 200
            }, 2000);
            $('html, body').animate({
              scrollTop: $("#phyCardPrintRequestList_processing").offset().top - 200
            }, 2000);
          }, delay);
        }
      } else {
        this.showPageLoader = false

        this.toastrService.error(this.translate.instant('dataManagementDashboard.toaster.cardDetailsNotSaved'))
      }
    })
  }

  scrool() {
    $("#cardPrintRequestList_processing").css({ "display": 'block' })
    $('html, body').animate({
      scrollTop: $("#cardPrintRequestList_processing").offset().top - 200
    }, 2000);
  }

  // Log #1156: Delete functionality of Card Print Request
  deleteCardPrintRequest(id) {
    this.exDialog.openConfirm(this.translate.instant('dataManagementDashboard.toaster.deleteConfirmation')).subscribe((value) => {
      if (value) {
        let cardholderName = this.dataTableService.cardPrintRequestData.personFirstName + ' ' + this.dataTableService.cardPrintRequestData.personLastName
        let requestData = {
          "cardholderName": cardholderName,
          "cardholderKey": this.dataTableService.cardPrintRequestData.cardholderKey,
          "cardKey": this.dataTableService.cardPrintRequestData.cardKey,
          "coKey": this.dataTableService.cardPrintRequestData.coKey,
          "plansKey": this.dataTableService.cardPrintRequestData.plansKey,
          "personGenderCd": this.dataTableService.cardPrintRequestData.personGenderCd,
          "cardRequest": 'CPR'
        }
        this.hmsDataService.postApi(DataManagementDashboardApi.saveCardDetailForPrintChequeUrl, requestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('dataManagementDashboard.toaster.cardPrintRequestSuccess'))
            this.getCardPrintRequestList();
          } else {
            this.toastrService.error(this.translate.instant('dataManagementDashboard.toaster.cardPrintNotDeleted'))
          }
        })
      }
    });
  }

  // Log #1156: Delete functionality of Physical Card Request
  deletePhysicalCardRequest(key) {
    this.exDialog.openConfirm(this.translate.instant('dataManagementDashboard.toaster.deleteConfirmation')).subscribe((value) => {
      if (value) {
        let cardholderName = this.dataTableService.cardPrintRequestData.personFirstName + ' ' + this.dataTableService.cardPrintRequestData.personLastName
        let requestData = {
          "cardholderName": cardholderName,
          "cardholderKey": this.dataTableService.cardPrintRequestData.cardholderKey,
          "cardKey": this.dataTableService.cardPrintRequestData.cardKey,
          "coKey": this.dataTableService.cardPrintRequestData.coKey,
          "plansKey": this.dataTableService.cardPrintRequestData.plansKey,
          "personGenderCd": this.dataTableService.cardPrintRequestData.personGenderCd,
          "cardRequest": 'PCR'
        }
        this.hmsDataService.postApi(DataManagementDashboardApi.saveCardDetailForPrintChequeUrl, requestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('dataManagementDashboard.toaster.physicalCardRequestSuccess'))
            this.getPhyCardPrintRequestList();
          } else {
            this.toastrService.error(this.translate.instant('dataManagementDashboard.toaster.physicalCardNotDeleted'))
          }
        })
      }
    });
  }

}

