import { Component, OnInit } from '@angular/core';
import { GenericTableComponent, GtConfig, GtOptions, GtRow, GtEvent, GtCustomComponent } from '@angular-generic-table/core';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ReportApi } from '../../reports-module/report-api';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DataEntryApi } from '../data-entry-api';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { RequestOptions, Headers, Http } from '@angular/http';
declare var jsPDF: any;

export interface RowData extends GtRow {
  id: number;
  ReportName: string;
}
/* #927 Feedback AHC Reports */
@Component({
  selector: 'app-data-entry-report',
  templateUrl: './data-entry-report.component.html',
  styleUrls: ['./data-entry-report.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})
export class DataEntryReportComponent implements OnInit {

  reportID: any;
  reportPopUpTitle: string = 'Reports';
  showHideNoDataFound: boolean = false;
  showReportList: boolean = false;
  showHideFilter: boolean = true;
  tableId: string;
  showFilterFields = [];
  public configObjectReport: GtConfig<RowData>;
  public dataEntryReportFormGroup: FormGroup;
  dataEntryReportColumns = [];
  error: { isError: boolean; errorMessage: string; };
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  showLoader: boolean = false;
  operatorList: string = ""
  userList;
  checkboxValue;
  currentUser: any;
  reportsArray = [{
    "viewReport": 'F',
  }]
  constructor(private hmsDataService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private translate: TranslateService,
    private toastrService: ToastrService) {
    this.configObjectReport = {
      settings: [
        {
          objectKey: 'ReportName',
          columnOrder: 1
        }
      ],
      fields: [
        {
          name: 'Report Name',
          objectKey: 'ReportName'
        }
      ],
      data: [{
        'id': 1,
        'ReportName': 'Production Report',
      },
      {
        'id': 2,
        'ReportName': 'Submission Stats Report',
      },
      ]
    };
  }

  ngOnInit() {
    /* Security Checks*/
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['REP']
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['REP']
        this.getAuthCheck(checkArray)
      })
    }


    this.dataEntryReportFormGroup = new FormGroup({
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      'operator': new FormControl(''),
      'mailCheck': new FormControl(''),
      'emailReportTo': new FormControl('', CustomValidators.vaildEmail)
    });

    this.showFilterFields = [
      { "startDate": true },
      { "endDate": true },
      { "operator": true }
    ]

    this.getAhcUsersList();
  }

  onClickReportRow($event: GtEvent) {
    if ($event.name === 'gt-row-clicked') {
      if ($event.value.row.id) {
        this.reportID = $event.value.row.id;
        this.reportPopUpTitle = $event.value.row.ReportName;
        this.openReportReportPopupWithReportId($event.value.row);
      }
    }
  }

  openReportReportPopupWithReportId(reportRowData) {
    this.hmsDataService.OpenCloseModal('reportListPopUp');
    this.showHideFilter = true;
    this.showReportList = false;
    this.showHideNoDataFound = false;
    switch (this.reportID) {
      case 1: //productionReport   
        this.tableId = 'productionReport';
        this.showFilterFields = [
          { "startDate": true },
          { "endDate": true },
          { "operator": true }
        ];
        break;
      case 2: //submissionStatsReport
        this.tableId = 'submissionStatsReport';
        this.showFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
     
      default:
        this.reportPopUpTitle = '';
        this.showHideNoDataFound = true;
        this.showHideFilter = false;
        this.showReportList = false;
        break;
    }
  }

  onSubmitDataEntryReport(dataEntryReportFormGroup) {
    var reqParam = []
    if (this.dataEntryReportFormGroup.valid) {
      this.showReportList = true;
      switch (this.reportID) {
        case 1: //productionReport
          if (dataEntryReportFormGroup.value.operator != "" && dataEntryReportFormGroup.value.operator != null) {
            this.operatorList = dataEntryReportFormGroup.value.operator
          } else {
            this.operatorList = ""
          }
          this.dataEntryReportColumns = [
            { title: 'Operator', data: 'operator' },
            { title: 'Date', data: 'date' },
            { title: 'Claim Items', data: 'count' },
            { title: 'Claim Numbers', data: 'claimNumberCount'} // Log #1113: Client New Feedback
          ];
          reqParam = [
            { 'key': 'startDate', 'value': dataEntryReportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(dataEntryReportFormGroup.value.startDate) : '' },
            { 'key': 'endDate', 'value': dataEntryReportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(dataEntryReportFormGroup.value.endDate) : '' },
            { 'key': 'operators', 'value': this.operatorList }
          ];
          var url = DataEntryApi.getProductionReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.dataEntryReportColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [1], '', '', [1, 2, 3], '', '', [1, 2])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 2: //submissionStatsReport
          this.dataEntryReportColumns = [
            { title: 'Total Claim Item Numbers', data: 'claimItemCount'}, // Log #1115: Client Feedback 
            { title: 'Total Uniques Providers', data: 'providerCount' },
            { title: 'Total Claimed', data: 'totalClaimAmount' },
            { title: 'Total Paid', data: 'totalClaimPaid' }
          ];
          reqParam = [
            { 'key': 'startDate', 'value': dataEntryReportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(dataEntryReportFormGroup.value.startDate) : '' },
            { 'key': 'endDate', 'value': dataEntryReportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(dataEntryReportFormGroup.value.endDate) : '' }
          ];
          var url = DataEntryApi.getSubmissionReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.dataEntryReportColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [2], [1, 2, 3], '', '', [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        default:
          this.callReportGridApi(dataEntryReportFormGroup.value, this.reportID);
          break;
      }
    } else {
      this.validateAllFormFields(this.dataEntryReportFormGroup)
    }
  }

  callReportGridApi(reportData, reportID) {
    this.showReportList = true;
    let promise = new Promise((resolve, reject) => {
      switch (reportID) {
        case 1: //productionReport
          this.dataEntryReportColumns = [
            { title: 'Operator', data: 'operator' },
            { title: 'Date', data: 'date' },
            { title: 'Claim Items', data: 'count' },
            { title: 'Claim Numbers', data: 'claimNumberCount'} // Log #1113: Client New Feedback
          ];
          var reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
          ];
          var url = DataEntryApi.getProductionReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.dataEntryReportColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
      }
      resolve();
    });
    return promise;
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.dataEntryReportFormGroup.patchValue(datePickerValue);

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
      this.dataEntryReportFormGroup.patchValue(datePickerValue);

    }

    if (this.dataEntryReportFormGroup.value.startDate && this.dataEntryReportFormGroup.value.endDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.dataEntryReportFormGroup.value.startDate.date, this.dataEntryReportFormGroup.value.endDate.date);
      if (this.error.isError == true) {
        this.dataEntryReportFormGroup.controls['endDate'].setErrors({
          "ToDateNotValid": true
        });
      }
    }
  }

  resetReportForm() {
    this.dataEntryReportFormGroup.reset();
    this.operatorList = ""
  }

  dowloadPDFReport() {
    let requestParam = {};
    switch (this.reportID) {
      case 1: //productionReport
        if (this.dataTableService.totalRecords != undefined) {
          var url = DataEntryApi.getProductionReportUrl;
          this.showLoader = true;
          if (this.dataEntryReportFormGroup.value.operator != null && this.dataEntryReportFormGroup.value.operator != "undefined") {
            this.operatorList = this.dataEntryReportFormGroup.value.operator
          } else {
            this.operatorList = ""
          }
          requestParam = {
            'startDate': this.dataEntryReportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.dataEntryReportFormGroup.value.startDate) : '',
            'endDate': this.dataEntryReportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.dataEntryReportFormGroup.value.endDate) : '',
            'operators': this.operatorList,
            "start": 0,
            "length": this.dataTableService.totalRecords,
          }
          this.hmsDataService.postApi(url, requestParam).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              var doc = new jsPDF('p', 'pt', 'a3');
              let FromDate = this.dataEntryReportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.dataEntryReportFormGroup.value.startDate)) : '';
              let endDate = this.dataEntryReportFormGroup.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.dataEntryReportFormGroup.value.endDate)) : '';

              var columns = [
                { title: 'Operator', dataKey: 'operator' },
                { title: 'Date', dataKey: 'date' },
                { title: 'Claim Items', dataKey: 'count' },
                { title: 'Claim Numbers', dataKey: 'claimNumberCount' } // Log #1113: Client New Feedback
              ];
              this.showLoader = false;

              var rows = data.result.data;
              // Log #1114: Client New Feedback
              rows.push({
                "operator": '',
                "date": '',
                "count": "Total Claim Items :  " + data.result.totalCount,
                "claimNumberCount": "Total Claim Numbers :  " + data.result.totalClaimCount
              })
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.reportPopUpTitle,
                'text5Date': FromDate + ' - ' + endDate
              });
              this.pdfHeader(doc, headerobject);
              //End Header  
              doc.autoTable(columns, rows, {
                styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  lineColor: [215, 214, 213],
                  lineWidth: 1,
                },
                columnStyles: {
                  "operator": { halign: 'left' },
                  "date": { halign: 'right' },
                  "count": { halign: 'right' },
                  "claimNumberCount": { halign: 'right' } // Log #1113: Client New Feedback
                },
                didParseCell: function (data) {
                  if (data.section == 'head' && data.column.index != 0) {
                    data.cell.styles.halign = 'right';
                  }
                  let dat = data.cell
                  if (dat.text[0].indexOf('Total Claim Items') > -1) {
                    dat.styles.fontStyle = 'bold';
                  }
                  if (dat.text[0].indexOf('Total Claim Numbers') > -1) {
                    dat.styles.fontStyle = 'bold'
                  }
                },
                startY: 100,
                startX: 40,
                theme: 'grid',
              });
              //Start Footer
              this.pdfFooter(doc, this.reportID);
              //End Footer
              doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
              var base64pdf = btoa(doc.output());
              if (this.dataEntryReportFormGroup.value.mailCheck != false && (this.dataEntryReportFormGroup.value.emailReportTo != null && this.dataEntryReportFormGroup.value.emailReportTo != "")) {

                /* Form Data in Request */
                let formData = new FormData();
                let header = new Headers({ 'Authorization': this.currentUserService.token });
                let options = new RequestOptions({ headers: header });
                if (base64pdf) {
                  formData.append('file', base64pdf);
                  formData.append('email', this.dataEntryReportFormGroup.value.emailReportTo)
                  this.hmsDataService.sendFormData(DataEntryApi.sendReportMailUrl, formData).subscribe(data => {
                    if (data.code == 200 && data.status == "OK") {
                      this.toastrService.success("Email Sent Successfully")
                    } else {
                      this.toastrService.error("Email Not Sent!! ")
                    }
                  })
                }
              }
            } else if (data.code == 404 && data.status == 'NOT_FOUND') {
              this.showLoader = false;
              this.toastrService.error(this.translate.instant('report.recordNotFound'));
            }
          });
        } else {
          this.toastrService.error(this.translate.instant('common.record-not-found'));
        }
        break;
      case 2: //submissionStatsReport
        if (this.dataTableService.totalRecords != undefined) {
          var url = DataEntryApi.getSubmissionReportUrl;
          this.showLoader = true;
          requestParam = {
            'startDate': this.dataEntryReportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.dataEntryReportFormGroup.value.startDate) : '',
            'endDate': this.dataEntryReportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.dataEntryReportFormGroup.value.endDate) : '',
          }
          this.hmsDataService.postApi(url, requestParam).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              var doc = new jsPDF('p', 'pt', 'a3');
              let FromDate = this.dataEntryReportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.dataEntryReportFormGroup.value.startDate)) : '';
              let endDate = this.dataEntryReportFormGroup.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.dataEntryReportFormGroup.value.endDate)) : '';

              var columns = [
                { title: 'Total Claim Item Numbers', dataKey: 'claimItemCount' }, // Log #1115: Client Feedback
                { title: 'Total Uniques Providers', dataKey: 'providerCount' },
                { title: 'Total Claimed', dataKey: 'totalClaimAmount' },
                { title: 'Total Paid', dataKey: 'totalClaimPaid' }
              ];
              this.showLoader = false;
              for (var i in data.result.data) {
                data.result.data[i].totalPaid = data.result.data[i].totalPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].totalPaid) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              }
              var rows = data.result.data;
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.reportPopUpTitle,
                'text5Date': FromDate + ' - ' + endDate
              });
              this.pdfHeader(doc, headerobject);
              //End Header  
              doc.autoTable(columns, rows, {
                styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  lineColor: [215, 214, 213],
                  lineWidth: 1,
                },
                columnStyles: {
                  "claimItemCount": { halign: 'left' },
                  "providerCount": { halign: 'right' },
                  "totalClaimAmount": { halign: 'right' },
                  "totalClaimPaid": { halign: 'right' }
                },
                didParseCell: function (data) {
                  if (data.section == 'head' && data.column.index != 0) {
                    data.cell.styles.halign = 'right';
                  }
                },
                startY: 100,
                startX: 40,
                theme: 'grid',
              });
              //Start Footer
              this.pdfFooter(doc, this.reportID);
              //End Footer
              doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
            } else if (data.code == 404 && data.status == 'NOT_FOUND') {
              this.showLoader = false;
              this.toastrService.error(this.translate.instant('report.recordNotFound'));
            }
          });
        } else {
          this.toastrService.error(this.translate.instant('common.record-not-found'));
        }
        break;
    }
  }

  pdfHeader(doc, headerobject) {
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEQ4M0Q4NjE1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEQ4M0Q4NjA1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTU1MzkwMUYzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTU1MzkwMjAzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4x0Cf0AAAW60lEQVR42uxd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';
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report') {
        doc.text(headerobject[0].text5Date, 1100, 90, null, null, 'right');
      } else {
        doc.text(headerobject[0].text5Date, 800, 90, null, null, 'right');
      }
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.setTextColor('#009BDB');
    doc.text(headerobject[0].gridHeader1, 40, 90);
    return true;
  }

  pdfFooter(doc, reportId) {
    if (reportId == 73) {
      doc.autoTable.previous.finalY = 290;
      doc.autoTable.previous.cursor.x = 800;
    }
    //Start Footer      
    doc.setFontSize(8);
    //Left Line1
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('T', 40, doc.autoTable.previous.finalY + 40);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('1-800-232-1997 | 780-426-7526', 50, doc.autoTable.previous.finalY + 40);

    //Left Line2
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('F', 40, doc.autoTable.previous.finalY + 50);

    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('780-426-7581', 50, doc.autoTable.previous.finalY + 50);

    //Left Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('E', 40, doc.autoTable.previous.finalY + 60);

    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('claims@quikcard.com', 50, doc.autoTable.previous.finalY + 60);

    //Right Line1
    doc.text('#200, 17010 - 103 Avenue', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 40, null, null, 'right');
    //Right Line2
    doc.text('Edmonton, AB T5S 1K7', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 50, null, null, 'right');
    //Right Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('quikcard.com', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 60, null, null, 'right');
  }

  getAhcUsersList() {
    this.hmsDataService.getApi(DataEntryApi.getAhcUsersList).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data['result'] != undefined && data.result.length > 0) {
          this.userList = data.result
        }
      }
      else {
      }
    })
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /* Get Auth Checks for Reports */
  getAuthCheck(domainChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.reportsArray = [{
        "viewReport": 'T'
      }]
    } else {
      for (var i = 0; i < domainChecks.length; i++) {
        authCheck[domainChecks[i].actionObjectDataTag] = domainChecks[i].actionAccess
      }
      this.reportsArray = [{
        "viewReport": authCheck['REP396']
      }]
    }
    return this.reportsArray
  }

}
