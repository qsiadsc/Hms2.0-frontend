import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { ServiceProviderApi } from '../../service-provider-module/service-provider-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { FeeGuideApi } from '../fee-guide-api';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
@Component({
  selector: 'app-dental-schedule-list',
  templateUrl: './dental-schedule-list.component.html',
  styleUrls: ['./dental-schedule-list.component.css'],
  providers: [DatatableService]
})

export class DentalScheduleListComponent implements OnInit {
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  columns;
  observableObj;
  check: boolean = true;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  dateNameArray = [];
  currentUser;
  dentalSchdList = [{
    "addNewSchedule": 'F',
    "viewSchedule": 'F',
  }]

  constructor(private dataTableService: DatatableService,
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    private currentUserService: CurrentUserService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        let dentalScheduleArray = this.currentUserService.authChecks['DSH']
        dentalScheduleArray.push()
        this.getAuthCheck(dentalScheduleArray)
        this.dataTableInitialize();
        this.renderer.selectRootElement('#dentalScheduleDesc').focus();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let dentalScheduleArray = this.currentUserService.authChecks['DSH']
        dentalScheduleArray.push()
        this.getAuthCheck(dentalScheduleArray);
        this.dataTableInitialize();
        this.renderer.selectRootElement('#dentalScheduleDesc').focus();
      })
    }

    var self = this
    $(document).on('keydown', '#dentalScheduleList .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })

  }

  dataTableInitialize() {
    this.observableObj = Observable.interval(1000).subscribe(value => {
      if (this.check) {
        if ('feeGuide.dentalSchedule.scheduleDescription' == this.translate.instant('feeGuide.dentalSchedule.scheduleDescription')) {
        }
        else {
          this.columns = [
            { title: this.translate.instant('feeGuide.dentalSchedule.scheduleDescription'), data: 'dentFeeGuideSchedDesc' },
            { title: this.translate.instant('feeGuide.dentalSchedule.applyAdult'), data: 'dentFeeGuideAdultInd' },
            { title: this.translate.instant('feeGuide.dentalSchedule.applyChild'), data: 'dentFeeGuideChildInd' },
            { title: this.translate.instant('feeGuide.dentalSchedule.effectiveDate'), data: 'effectiveOn' }
          ]
          this.dentalScheduleList();
          this.check = false;
          this.observableObj.unsubscribe();
        }
      }
    })
  }

  getAuthCheck(dentalScheduleArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.dentalSchdList = [{
        "addNewSchedule": 'T',
        "viewSchedule": 'T',
      }]
    }
    else {
      for (var i = 0; i < dentalScheduleArray.length; i++) {
        userAuthCheck[dentalScheduleArray[i].actionObjectDataTag] = dentalScheduleArray[i].actionAccess
      }
      this.dentalSchdList = [{
        "addNewSchedule": userAuthCheck['DSH213'],
        "viewSchedule": userAuthCheck['DSH214']
      }]
    }
    return this.dentalScheduleList
  }

  // Method for Get the Dental Schedule List
  dentalScheduleList() {
    this.renderer.selectRootElement('#dentalScheduleDesc').focus();
    var reqParam = [
      { 'key': 'dentFeeGuideSchedDesc', 'value': '' },
      { 'key': 'dentFeeGuideAdultInd', 'value': '' },
      { 'key': 'dentFeeGuideChildInd', 'value': '' },
      { 'key': 'effectiveOn', 'value': '' }
    ]
    var Url = FeeGuideApi.getDentalScheduleListUrl
    var tableId = "dentalScheduleList"
    if (!$.fn.dataTable.isDataTable('#dentalScheduleList')) {
      this.dataTableService.jqueryDataTableForDentalSchedule(tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', [1, 2], [0, 'asc'], '', reqParam, '', undefined, 3, this.dentalSchdList[0].viewSchedule)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  // Method for Footer Datepicker
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

  // Search Listing for Dental Schedule
  dentalScheduleListFilter(tableId: string) {
    var params = this.dataTableService.getFooterParams("dentalScheduleList")
    var dateParams = [3];
    var URL = FeeGuideApi.getDentalScheduleListUrl
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }

  // Reset Listing for Dental Schedule
  resetDentalScheduleListFilter() {
    this.dataTableService.resetTableSearch();
    this.dentalScheduleListFilter("dentalScheduleList");
    $('#dentalScheduleList .icon-mydpremove').trigger('click');
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.dentalScheduleListFilter(tableId);
    }
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }
}