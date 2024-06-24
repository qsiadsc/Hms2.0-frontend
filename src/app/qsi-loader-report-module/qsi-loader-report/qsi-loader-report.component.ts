import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { QsiLoaderReportApi } from '../qsi-loader-report-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-qsi-loader-report',
  templateUrl: './qsi-loader-report.component.html',
  styleUrls: ['./qsi-loader-report.component.css']
})
export class QsiLoaderReportComponent implements OnInit, OnDestroy {
  qsiForm: FormGroup;
  ObservableFileTypeObj;
  ObservableUnprocessedDataObj;
  fileTypeColumns = [];
  unProcessedDataColumns = [];
  dateNameArray = {};
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  expired
  tranStatusChange
  resetSearchForm
  filterFiletypeSearch
  shouldShowButtons = false;
  shouldProcessUnProcessedData = true;
  sub: Subscription;
  selectFileData: any;
  currentUser: any;
  dataArray = [{
    "viewData": 'F',
  }]
  unProcessedArray: any = [{
    'firstName': '',
    'lastName': '',
    'paidAmount': '',
    'sin': '',
    'paidDate': '',
    'policy': '',
    'group': '',
    'dispensedDate': '',
    'adjudicationDate': '',
    'fileId': '',
    'divisionNumber': '',
    'submittedGross': '',
    'din': '',
    'quantity': '',
    'wrongSin': '',
    'wrongFirstName': '',
    'wrongLastName': '',
    'correctedChCd': '',
    'unitNo': '',
    'relationshipCode': '',
    'pharmacyId': '',
    'itemCd': '',
    'csTransCd': '',
    'cdRejected': '',
    'wrongPharmacyId': '',
    'notEligPatient': '',
    'wrongUnitOrDivision': '',
    'orgClaimCdNotFound': '',
    'itemHasBeenReverted': '',
    'wrongPolicyNo': '',
    'dob': '',
    'csQsiDrugDailyClaimCd': '',
    'calDispensingFeePaid': '',
    'duplcateClaim': ''
  }]
  changedArray: any = [];
  selectedRow;
  showDataQsiLoader: boolean = false

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private toastrService: ToastrService,
    public dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private currentUserService: CurrentUserService,
    private translate: TranslateService,

  ) {
    this.sub = dataTableService.fileTypeRequestLoaded.subscribe(data => {
      if (this.shouldProcessUnProcessedData) {
        this.selectFileData = data;
        this.unprocessedDataList();
        this.shouldProcessUnProcessedData = false;
        setTimeout(() => {
          $('html, body').animate({
            scrollTop: $(document).height()
          }, 'slow');
        }
          , 1000);
      }
    });
  }

  ngOnInit() {
    this.qsiForm = new FormGroup({
      'fileType': new FormControl(),
      'unprocessedType': new FormControl()
    });
    this.qsiForm.patchValue({ 'fileType': 'P', 'unprocessedType': 'all' });

    /* Data Security Checks */
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DTA']
        this.getAuthCheck(checkArray)
        this.dataTableInitializeFileType();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DTA']
        this.getAuthCheck(checkArray)
        this.dataTableInitializeFileType();
      })
    }
    this.dataTableInitializeUnprocessedData();
    this.eventListener();
    // Task 580 Below one is to show full calendar
    $(document).on('click', '#paidDate', function () {
        $('.caltable').addClass('addLeftMarginToCalendar')
        $('.header').addClass('addLeftMarginToCalendar')
    })
  }

  ngAfterViewInit() {
    var self = this
    $(document).on('click', '#unprocessed_data_datatable .edit-ico', function () {
      var id = $(this).data('id')
      var tablerow = $(this).closest("tr")
      self.getRowDataOnClickIcon(self.dataTableService.unprocessedSelectedRowData, id, tablerow);
    })
    $(document).on('click', '#unprocessed_data_datatable .save-ico', function () {
      var id = $(this).data('id')
      self.updateUnProcessedData(id);
    })
    // Editable fields validation
    $(document).on('blur', '.policyClass', function (e) {
      let id = e.target.id;
      let dataRow = self.selectedRow
      let indexArray = id.split('_');
      let index = indexArray[1];
      let newPolicy = $(this).val().toString();
      var pattern = new RegExp('^[0-9 A-Z \-]+$');
      let isNumeric = pattern.test(newPolicy);
      dataRow.index = index
      if (isNumeric) {
        $(this).removeClass("error_field")
        let dat = self.changedArray.filter(obj => {
          if (obj.index == index) {
            obj.policy = newPolicy;
            return obj;
          }
        })
      } else {
        $(this).addClass("error_field")
        self.toastrService.error(self.translate.instant('qsi-loader-report.ts.enterValidNumber'))
      }
    })
    $(document).on('blur', '.divisionClass', function (e) {
      let id = e.target.id;
      let dataRow = self.selectedRow
      let indexArray = id.split('_');
      let index = indexArray[1];
      let newDivisionNumber = $(this).val().toString();
      var pattern = new RegExp('^[0-9]+$');
      let isNumeric = pattern.test(newDivisionNumber);
      dataRow.index = index
      if (isNumeric) {
        $(this).removeClass("error_field")
        let dat = self.changedArray.filter(obj => {
          if (obj.index == index) {
            obj.divisionNumber = newDivisionNumber;
            return obj;
          }
        })
      } else {
        $(this).addClass("error_field")
        self.toastrService.error(self.translate.instant('qsi-loader-report.ts.enterValidDivision'))
      }
    })
    $(document).on('blur', '.unitClass', function (e) {
      let id = e.target.id;
      let dataRow = self.selectedRow
      let indexArray = id.split('_');
      let index = indexArray[1];
      let newUnitNo = $(this).val().toString();
      var pattern = new RegExp('^[0-9]+$');
      let isNumeric = pattern.test(newUnitNo);
      dataRow.index = index
      if (isNumeric) {
        $(this).removeClass("error_field")
        let dat = self.changedArray.filter(obj => {
          if (obj.index == index) {
            obj.unitNo = newUnitNo;
            return obj;
          }
        })
      } else {
        $(this).addClass("error_field")
        self.toastrService.error(self.translate.instant('qsi-loader-report.ts.enterValidUnit'))
      }
    })
    $(document).on('blur', '.dobDate', function (e) {
      let dob_date;
      let dataRow = self.selectedRow
      let id = e.target.id;
      let indexArray = id.split('_');
      let index = indexArray[1];
      let data_id = '#dob_' + index
      let date_val = $(data_id).val();
      if (date_val != "" && date_val != undefined) {
        var obj = self.changeDateFormatService.changeDateFormatLessThanCurrentMonth(e.target);
        let date = self.changeDateFormatService.changeDateByMonthName(self.changeDateFormatService.convertDateObjectToString(obj))
        $(this).val(date);
        if (obj) {
          dob_date = self.changeDateFormatService.convertDateObjectToString(obj)
        } else {
          $(this).addClass("error_field")
          self.toastrService.error(self.translate.instant('qsi-loader-report.ts.enterValidDate'))
        }
      }
      dataRow.index = index;
      let dat = self.changedArray.filter(obj => {
        if (obj.index == index) {
          obj.dob = dob_date;
          return obj;
        }
      })
      if (dat.length == 0) {
        self.changedArray.push(self.selectedRow);
      }
    })
    $(document).on('blur', '.firstNameClass', function (e) {
      let id = e.target.id;
      let dataRow = self.selectedRow
      let indexArray = id.split('_');
      let index = indexArray[1];
      let newFirstName = $(this).val().toString();
      var pattern = new RegExp(/^[a-zA-Z\s]([\-a-zA-Z\s])+$/)
      let isValid = pattern.test(newFirstName);
      dataRow.index = index
      if (isValid) {
        $(this).removeClass("error_field")
        let dat = self.changedArray.filter(obj => {
          if (obj.index == index) {
            obj.firstName = newFirstName;
            return obj;
          }
        })
      } else {
        $(this).addClass("error_field")
        var errrMsg = "(Only A-Z, - Are Allowed)"
        self.toastrService.error(self.translate.instant('qsi-loader-report.ts.enterValidName') +' '+errrMsg)
      }
    })
    $(document).on('blur', '.lastNameClass', function (e) {
      let id = e.target.id;
      let dataRow = self.selectedRow
      let indexArray = id.split('_');
      let index = indexArray[1];
      let newLastName = $(this).val().toString();
      var pattern = new RegExp(/^[a-zA-Z\s]([\-a-zA-Z\s])+$/)
      let isNumeric = pattern.test(newLastName);
      dataRow.index = index
      if (isNumeric) {
        $(this).removeClass("error_field")
        let dat = self.changedArray.filter(obj => {
          if (obj.index == index) {
            obj.lastName = newLastName;
            return obj;
          }
        })
      } else {
        $(this).addClass("error_field")
        var errrMsg = "(Only A-Z, - Are Allowed)"
        self.toastrService.error(self.translate.instant('qsi-loader-report.ts.enterValidName') +' '+errrMsg)
      }
    })
  }

  eventListener() {
    let me = this;
    $('table#file_type_datatable').on('page.dt', function () {
      var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' },
      { 'key': 'fillterSearch', 'value': me.qsiForm.get("fileType").value }]
      me.dataTableService.reqParam = reqParam;
    })
    $('table#unprocessed_data_datatable').on('page.dt', function () {
      let reqType;
      if (me.selectFileData.fileName.startsWith("QC_UC")) {
        reqType = "P"
      } else {
        reqType = "D";
      }
      var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' },
      { 'key': 'fillterSearch', 'value': me.qsiForm.get("unprocessedType").value }, { 'key': 'fileId', 'value': me.selectFileData.fileId },
      { 'key': 'type', 'value': reqType }]
      me.dataTableService.reqParam = reqParam;
    })

    $(document).on('dblclick', 'table#unprocessed_data_datatable tbody tr', function () {
      if (!$(this).find('td.dataTables_empty').length) {
        me.showDataQsiLoader = true
        if (me.selectFileData.fileName.startsWith("QC_UC")) {
          me.showDataQsiLoader = false
          return;
        }
        const submitData = {
          fileId: me.dataTableService.unprocessedDataRow.fileId,
          qsiDrugClaimKey: me.dataTableService.unprocessedDataRow.csQsiDrugDailyClaimCd
        }
        var qsiLoadUrl;
        for (var i = 0; i < me.dataTableService.reqParam.length; i++) {
          if (me.dataTableService.reqParam[i].value == 'D') {
            qsiLoadUrl = QsiLoaderReportApi.loadQSIDailyClaimToHlClaimUrl
          } else if (me.dataTableService.reqParam[i].value == 'P') {
            qsiLoadUrl = QsiLoaderReportApi.loadRevQSIDailyClaimToHLClaim
          }
        }
        me.hmsDataServiceService.postApi(qsiLoadUrl, submitData).subscribe(data => {
          me.unprocessedDataList();
          if (data.code == 200 && data.status === "OK") {
            me.showDataQsiLoader = false
            me.toastrService.success(data.hmsMessage.messageShort)
          } else {
            me.showDataQsiLoader = false
            me.toastrService.error(me.translate.instant('qsi-loader-report.ts.tryAgain'));
          }
        });
      }
    })

      $(document).on('click', 'table#file_type_datatable > tbody > tr', function () {  //to resolve calendar icon navigation issue(31/05/2023)
      if (!$(this).find('td.dataTables_empty').length) {
        me.selectFileData = me.dataTableService.fileTypeDataRow;
        $("#unprocessform").trigger("reset");
        me.unprocessedDataList();
        $('html, body').animate({
          scrollTop: $(document).height()
        }, 'slow');
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onChangeFileType(event) {
    this.qsiForm.get("unprocessedType").setValue("all");
    $("#unprocessform").trigger("reset");
    this.shouldProcessUnProcessedData = true;
    this.fileTypeList();
  }

  dataTableInitializeUnprocessedData() {
    this.ObservableUnprocessedDataObj = Observable.interval(1000).subscribe(x => {
      this.unProcessedDataColumns = [
        { title: this.translate.instant('qsi-loader-report.ts.table.sin'), data: 'sin' },
        { title: this.translate.instant('qsi-loader-report.ts.table.firstName'), data: 'firstName' },
        { title: this.translate.instant('qsi-loader-report.ts.table.lastName'), data: 'lastName' },
        { title: this.translate.instant('qsi-loader-report.ts.table.paidAmount'), data: 'paidAmount' },
        { title: this.translate.instant('qsi-loader-report.ts.table.paidDate'), data: 'paidDate' },
        { title: this.translate.instant('qsi-loader-report.ts.table.policy'), data: 'policy' },
        { title: this.translate.instant('qsi-loader-report.ts.table.group'), data: 'group' },
        { title: this.translate.instant('qsi-loader-report.ts.table.dispensedDate'), data: 'dispensedDate' },
        { title: this.translate.instant('qsi-loader-report.ts.table.adjudicationDate'), data: 'adjudicationDate' },
        { title: this.translate.instant('qsi-loader-report.ts.table.dob'), data: 'dob' },
        { title: this.translate.instant('qsi-loader-report.ts.table.wrongFirstName'), data: 'wrongFirstName' },
        { title: this.translate.instant('qsi-loader-report.ts.table.wrongLastName'), data: 'wrongLastName' },
        { title: this.translate.instant('qsi-loader-report.ts.table.wrongPharacyId'), data: 'wrongPharmacyId' },
        { title: this.translate.instant('qsi-loader-report.ts.table.wrongPolicyNo'), data: 'wrongPolicyNo' },
        { title: this.translate.instant('qsi-loader-report.ts.table.wrongSin'), data: 'wrongSin' },
        { title: this.translate.instant('qsi-loader-report.ts.table.wrongUnitDiv'), data: 'wrongUnitOrDivision' },
        { title: this.translate.instant('qsi-loader-report.ts.table.notEligPatent'), data: 'notEligPatient' },
        { title: this.translate.instant('qsi-loader-report.ts.table.wrongFileName'), data: 'orgClaimCdNotFound' },
        { title: this.translate.instant('qsi-loader-report.ts.table.itemReverted'), data: 'itemHasBeenReverted' },
        //to be change
        { title: this.translate.instant('qsi-loader-report.ts.table.divisionNumber'), data: 'divisionNumber' },
        { title: this.translate.instant('qsi-loader-report.ts.table.cdReject'), data: 'cdRejected' },
        { title: this.translate.instant('qsi-loader-report.ts.table.correctedCd'), data: 'correctedChCd' },
        { title: this.translate.instant('qsi-loader-report.ts.table.cSQsiIDrug'), data: 'csQsiDrugDailyClaimCd' },
        { title: this.translate.instant('qsi-loader-report.ts.table.transCd'), data: 'csTransCd' },
        { title: this.translate.instant('qsi-loader-report.ts.table.fileId'), data: 'fileId' },
        { title: this.translate.instant('qsi-loader-report.ts.table.din'), data: 'din' },
        { title: this.translate.instant('qsi-loader-report.ts.table.pharmacyId'), data: 'pharmacyId' },
        { title: this.translate.instant('qsi-loader-report.ts.table.quantity'), data: 'quantity' },
        { title: this.translate.instant('qsi-loader-report.ts.table.relationshipCode'), data: 'relationshipCode' },
        { title: this.translate.instant('qsi-loader-report.ts.table.unitNo'), data: 'unitNo' },
        { title: this.translate.instant('qsi-loader-report.ts.table.submittedGross'), data: 'submittedGross' },
        { title: this.translate.instant('qsi-loader-report.ts.table.calDispensingFeePaid'), data: 'calDispensingFeePaid' },
        { title: this.translate.instant('qsi-loader-report.ts.table.duplcateClaim'), data: 'duplcateClaim' },
        { title: this.translate.instant('qsi-loader-report.ts.table.action'), data: 'csQsiDrugDailyClaimCd' }
      ]
      this.ObservableUnprocessedDataObj.unsubscribe();
    });
  }

  unprocessedDataList() {
    let reqType;
    if (this.selectFileData.fileName.startsWith("QC_UC")) {
      reqType = "P"
    } else {
      reqType = "D";
    }
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' },
    { 'key': 'fillterSearch', 'value': this.qsiForm.get("unprocessedType").value }, { 'key': 'fileId', 'value': this.selectFileData.fileId },
    { 'key': 'type', 'value': reqType }]
    var url = QsiLoaderReportApi.getQsiUnprocessedData;
    var tableId = "unprocessed_data_datatable"
    var tableActions = [
      { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'title': 'Edit', 'icon_class': 'fa fa-edit', 'showAction': '' },
    ]
    if (!$.fn.dataTable.isDataTable('#unprocessed_data_datatable')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.unProcessedDataColumns, 25, true, true, 'lt', 'irp', undefined, [0, 'asc'], '',
        reqParam, tableActions, 33, [4, 7, 8, 9], "", [3, 30, 31], [1, 2, 3, 5, 6, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam);
    }
  }

  unProcessDataFilter() {
    this.unprocessedDataList();
  }

  dataTableInitializeFileType() {
    this.ObservableFileTypeObj = Observable.interval(1000).subscribe(x => {
      this.fileTypeColumns = [
        { title: "File Id", data: 'fileId' },
        { title: "File Name", data: 'fileName' },
        { title: 'Processed Date', data: 'processedDate' },
        { title: 'Paid Date', data: 'paidDate' }
      ]
      this.ObservableFileTypeObj.unsubscribe();
      this.fileTypeList();
    });
  }

  fileTypeList() {
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' },
    { 'key': 'fillterSearch', 'value': this.qsiForm.get("fileType").value }]
    var url = QsiLoaderReportApi.getQsiReportFiles;
    var tableId = "file_type_datatable"
    if (!$.fn.dataTable.isDataTable('#file_type_datatable')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.fileTypeColumns, 25, true, true, 'lt', 'irp',
        undefined, [0, 'asc'], '',
        reqParam, "", '', [1, 2, 3], this.dataArray[0].viewData, '', '', '', [0, 1, 2, 3], '', [1, 2, 3])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam);
    }
  }

  /**
  * Change Date Picker For Date Picker
  * @param event 
  * @param frmControlName 
  */
  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
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

  filterFileTypeList(tableId: string) {
    var params = this.dataTableService.getFooterParams("file_type_datatable")
    var dateParams = [2, 3]
    var URL = QsiLoaderReportApi.getQsiReportFiles;
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' },
    { 'key': 'fillterSearch', 'value': this.qsiForm.get("fileType").value }]
    for (var i = 0; i < reqParam.length; i++) {
      params.push(reqParam[i])
    }
    this.dataTableService.jqueryDataTableReload("file_type_datatable", URL, params, dateParams)
  }

  resetListingFilter() { 
    // To clear cross icon also when reset button clicked.
    $(".btnclear").remove()
    this.dataTableService.resetTableSearch();
    this.filterFileTypeList("file_type_datatable")
    $('#file_type_datatable .icon-mydpremove').trigger('click');
  }

  unprocessedSearch(tableId: string) {
    var params = this.dataTableService.getFooterParams(tableId)
    var dateParams = [4, 7, 8, 9]
    var URL = QsiLoaderReportApi.getQsiUnprocessedData;
    let reqType;
    if (this.selectFileData.fileName.startsWith("QC_UC")) {
      reqType = "P"
    } else {
      reqType = "D";
    }
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' },
    { 'key': 'fillterSearch', 'value': this.qsiForm.get("unprocessedType").value }, { 'key': 'fileId', 'value': this.selectFileData.fileId },
    { 'key': 'type', 'value': reqType }]
    for (var i = 0; i < reqParam.length; i++) {
      params.push(reqParam[i])
    }
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }

  resetUnprocessedListingFilter() {
    this.dataTableService.resetTableSearch();
    this.unprocessedSearch("unprocessed_data_datatable")
    $('#unprocessed_data_datatable .icon-mydpremove').trigger('click');
  }

  /* Get Auth Checks for Data(08-Oct-2020) */
  getAuthCheck(dataChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.dataArray = [{
        "viewData": 'T'
      }]
    } else {
      for (var i = 0; i < dataChecks.length; i++) {
        authCheck[dataChecks[i].actionObjectDataTag] = dataChecks[i].actionAccess
      }
      this.dataArray = [{
        "viewData": authCheck['DAT395']
      }]
    }
    return this.dataArray
  }

  getRowDataOnClickIcon(selectedRowData, id, tablerow) {
    this.selectedRow = selectedRowData
    var id = id
    let indexArray = id + '_';
    let index = indexArray[1];
    var row = tablerow

    var firstName_ = row.find("td:nth-child(2)").text();
    var td2 = "<input id='firstName_" + index + "' class='fm-txt form-control amount_right_grid firstNameClass' maxlength='20' type='text' placeholder='First Name' name='firstName' value= '" + firstName_ + "' />"
    row.find("td:nth-child(2)").html(td2)

    var lastName_ = row.find("td:nth-child(3)").text();
    var td3 = "<input id='lastName_" + index + "' class='fm-txt form-control amount_right_grid lastNameClass' maxlength='20' type='text' placeholder='Last Name' name='lastName' value= '" + lastName_ + "' />"
    row.find("td:nth-child(3)").html(td3)

    var policy_ = row.find("td:nth-child(6)").text();
    var td6 = "<input id='policy_" + index + "' class='fm-txt form-control amount_right_grid policyClass' maxlength='14' type='text' placeholder='Policy' name='policy' value= '" + policy_ + "' />"
    row.find("td:nth-child(6)").html(td6)

    var dob_ = row.find("td:nth-child(10)").text();
    var td10 = "<input id='dob_" + index + "' class='fm-txt form-control amount_right_grid dobDate' type='text' placeholder='DOB' name='dob' value= '" + dob_ + "' />"
    row.find("td:nth-child(10)").html(td10)

    var divisionNumber_ = row.find("td:nth-child(20)").text();
    var td20 = "<input id='divisionNumber_" + index + "' class='fm-txt form-control amount_right_grid divisionClass' maxlength='10' type='text' placeholder='Division Number' name='divisionNumber' value= '" + divisionNumber_ + "' />"
    row.find("td:nth-child(20)").html(td20)

    var unitNo_ = row.find("td:nth-child(30)").text();
    var td30 = "<input id='unitNo_" + index + "' class='fm-txt form-control amount_right_grid unitClass' maxlength='5' type='text' placeholder='Unit No.' name='unitNo' value= '" + unitNo_ + "' />"
    row.find("td:nth-child(30)").html(td30)

    let action = row.find("td:nth-child(34)").html();
    let actionchange = "<a title='Save' class='table-action-btn save-ico' href='javascript:void(0)'  data-id='" + id + "'><i class='fa fa-save'></i></a>"
    row.find("td:nth-child(34)").html(actionchange)
    this.changedArray.push(this.selectedRow)
  }

  /* Update Unprocessed Data*/
  updateUnProcessedData(id) {
    this.showDataQsiLoader = true
    if ($('#unprocessed_data_datatable').find('.error_field').length !== 0) {
      this.showDataQsiLoader = false
      this.toastrService.error(this.translate.instant('qsi-loader-report.ts.validValues'));
      return false;
    }
    let new_obj = []
    var request;
    new_obj = this.changedArray.map(function (json) {
      let x = {
        "firstName": json.firstName,
        "lastName": json.lastName || '',
        "policyNumber": json.policy || '',
        "dob": json.dob || '',
        "divisionNumber": json.divisionNumber || '',
        "unitNo": json.unitNo || '',
        "csQsiDrugDailyClaimCd": json.csQsiDrugDailyClaimCd || '',
      };
      request = x
      return x;
    });
    var reqData = new_obj
    this.hmsDataServiceService.postApi(QsiLoaderReportApi.updateQsiDrugDailyClaimUrl, request).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showDataQsiLoader = false
        this.toastrService.success(this.translate.instant('qsi-loader-report.ts.updatedSuccess'))
      } else if (data.code == 400) {
        this.showDataQsiLoader = false
        this.toastrService.error(this.translate.instant('qsi-loader-report.ts.notUpdated'))
      } else if (data.code == 404) {
        this.showDataQsiLoader = false
        this.toastrService.error(this.translate.instant('qsi-loader-report.ts.notUpdated'))
      } else {
        this.showDataQsiLoader = false
        this.toastrService.error(this.translate.instant('qsi-loader-report.ts.notUpdated'))
      }
      this.unprocessedDataList();
    })
  }

}
