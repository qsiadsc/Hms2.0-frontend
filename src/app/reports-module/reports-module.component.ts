import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { CommonDatePickerOptions } from './../common-module/Constants';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReportApi } from './report-api';
import { TranslateService } from '@ngx-translate/core';
import { DatatableService } from './../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from './../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from './../common-module/shared-services/hms-data-api/current-user.service';
import { ChangeDateFormatService } from './../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Constants } from './../common-module/Constants';
import { ExDialog } from './../common-module/shared-component/ngx-dialog/dialog.module';
import { GenericTableComponent, GtConfig, GtOptions, GtRow, GtEvent, GtCustomComponent } from '@angular-generic-table/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
declare var jsPDF: any;
import { debug } from 'util';

/** Generic Table Interface Start */
export interface RowData extends GtRow {
  id: number;
  ReportName: string;
}

@Component({
  selector: 'app-reports-module',
  templateUrl: './reports-module.component.html',
  styleUrls: ['./reports-module.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService]
})
export class ReportsModuleComponent implements OnInit {
  tableId: string;
  reportID: any;
  reportListShowHide: boolean;
  ObservableReportListObj;
  reportListColumns = [];
  public reportFormGroup: FormGroup; // change private to public for production-errors
  showPageLoader: boolean = false;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  showReportFilterFields = [];
  reportPopUpTitle: string = 'Reports';
  showHideNoDataFound: boolean = false;
  showReportList: boolean = false; //Enable true when we need to show report list in the popup
  showHideFilter: boolean = true;
  error: { isError: boolean; errorMessage: string; };
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  public data: Array<RowData> = [];
  public configObjectReport: GtConfig<RowData>;

  constructor(
    private translate: TranslateService,
    public dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private router: Router,
    private currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private exDialog: ExDialog
  ) {
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
        'ReportName': 'Client Age Group By Postcode And Service Report',
      },
      {
        'id': 2,
        'ReportName': 'Claim And Claimant Count',
      },
      {
        'id': 3,
        'ReportName': 'Claim By Month Cat Report',
      },
      {
        'id': 4,
        'ReportName': 'COB Savings Report',
      },
      {
        'id': 5,
        'ReportName': 'Demographic Stat Report',
      },
      {
        'id': 6,
        'ReportName': 'Procedure Rank Report',
      },
      {
        'id': 8,
        'ReportName': 'Denture Replacement Report',
      },
      {
        'id': 9,
        'ReportName': 'Exception Report',
      },
      {
        'id': 10,
        'ReportName': 'Preauth By Review And DASP Exception Report',
      },
      {
        'id': 11,
        'ReportName': 'Preauth By Review DASP Report',
      },
      {
        'id': 12,
        'ReportName': 'Preauth By Review Other Report',
      }
      ]
    };
  }

  ngOnInit() {
    this.reportFormGroup = new FormGroup({
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
    });
    this.showReportFilterFields = [
      { "startDate": true },
      { "endDate": true },
    ]
  }

  /**
 * 
 * @param $event Row Click Reports Grid
 */
  onClickReportRow($event: GtEvent) {
    if ($event.name === 'gt-row-clicked') {
      if ($event.value.row.id) {
        this.reportID = $event.value.row.id;
        this.reportPopUpTitle = $event.value.row.ReportName;
        this.openReportReportPopupWithReportId($event.value.row);
      }
    }
  }

  /**
  * open report popup
  * @param reportRowData 
  */
  openReportReportPopupWithReportId(reportRowData) {
    this.hmsDataService.OpenCloseModal('reportListPopUp');
    this.showHideFilter = true;
    this.showReportList = false;
    this.showHideNoDataFound = false;
    switch (this.reportID) {
      case 1: //ClientAgeGroupByPostcodeAndService   
        this.tableId = 'ClientAgeGroupByPostcodeAndService';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 2: //ClaimAndClainantCount
        this.tableId = 'ClaimAndClainantCount';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 3: //ClaimByMonthCat
        this.tableId = 'ClaimByMonthCat';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 4: //COBSavings
        this.tableId = 'COBSavings';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 5: //DemographicStat
        this.tableId = 'DemographicStat';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 6: //ProcedureRank
        this.tableId = 'ProcedureRank';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 7: //Exception
        this.tableId = 'Exception';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 8: //DentureReplacement
        this.tableId = 'DentureReplacement';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 9: //ExceptionReport
        this.tableId = 'ExceptionReport';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 10: //PreauthByReviewAndDASPException
        this.tableId = 'PreauthByReviewAndDASPException';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 11: //PreauthByReviewDASP 
        this.tableId = 'PreauthByReviewDASP';
        this.showReportFilterFields = [
          { "startDate": true },
          { "endDate": true }
        ];
        break;
      case 12: //PreauthByReviewOther
        this.tableId = 'PreauthByReviewOther';
        this.showReportFilterFields = [
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

  /**
   * Submit Reports form
   */
  onSubmitReport(reportData) {
    if (this.reportFormGroup.valid) {
      this.showReportList = true;
      switch (this.reportID) {
        case 1: //ClientAgeGroupByPostcodeAndService
          this.reportListColumns = [
            { title: this.translate.instant('report.ts.postalCode'), data: 'postalCode' },
            { title: this.translate.instant('report.ts.serviceDate'), data: 'serviceDate' },
            { title:  this.translate.instant('report.ts.clientAgeGroup'), data: 'clientAgeGroup' },
            { title:  this.translate.instant('report.ts.clientCount'), data: 'achbClientCount' }
          ];
          var reqParam = [
            { 'key': 'fromDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'toDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
            { 'key': 'programType', 'value': 'AAHB' }
          ];
          var url = ReportApi.getClientAgeGroupByProviderPostCodeReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [1], '', '', [1, 2, 3], '', [0], [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 2: //ClaimAndClainantCount
          this.reportListColumns = [
            { title:  this.translate.instant('report.ts.claimsStatus'), data: 'claimStatus' },
            { title: this.translate.instant('report.ts.claimCount'), data: 'claimCount' },
            { title: this.translate.instant('report.ts.claimantCount'), data: 'claimantCount' },
            { title: this.translate.instant('report.ts.totalPaid'), data: 'totalPaid' }
          ];
          var reqParam = [
            { 'key': 'fromDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'toDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
          ];
          var url = ReportApi.getAdscClaimsAndCountReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [1], '', '', [1, 2, 3], '', [0], [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 3: //ClaimByMonthCat
          this.reportListColumns = [
            { title:  this.translate.instant('report.ts.yearMonth'), data: 'yearMonth' },
            { title: this.translate.instant('report.ts.category') , data: 'category' },
            { title:  this.translate.instant('report.ts.claimCount'), data: 'claimCount' },
            { title:  this.translate.instant('report.ts.claimantCount'), data: 'claimantCount' }
          ];
          var reqParam = [
            { 'key': 'fromDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'toDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
          ];
          var url = ReportApi.getClaimByMonthAndCategoryReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3], '', [0], [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 4: //COBSavings
          this.reportListColumns = [
            { title: this.translate.instant('report.ts.monthYear'), data: 'monthYear' },
            { title: this.translate.instant('report.ts.programType'), data: 'programType' },
            { title: this.translate.instant('report.ts.claimCount'), data: 'claimCount' },
            { title: this.translate.instant('report.ts.claimantCount'), data: 'claimantCount' },
            { title: this.translate.instant('report.ts.paidAmount') , data: 'paidAmount' },
            { title: this.translate.instant('report.ts.codSavings'), data: 'cobSaving' }
          ];
          var reqParam = [
            { 'key': 'fromDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'toDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
          ];
          var url = ReportApi.getAdscCobSavingReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [4], [1, 2, 3, 4, 5], '', [0], [1, 2, 3, 4, 5])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 5: //DemographicStat
          this.reportListColumns = [
            { title:  this.translate.instant('report.ts.gender') , data: 'gender' },
            { title:   this.translate.instant('report.ts.sectionCoverage') , data: 'sectionCoverage' },
            { title:  this.translate.instant('report.ts.clientCount') , data: 'clientCount' },
            { title:  this.translate.instant('report.ts.claimantCount'), data: 'claimantCount' },
            { title:  this.translate.instant('report.ts.claimCount') , data: 'claimCount' },
            { title:  this.translate.instant('report.ts.totalAllowed') , data: 'totalAllowed' },
            { title:  this.translate.instant('report.ts.totalPaid') , data: 'totalPaid' }
          ];
          var reqParam = [
            { 'key': 'fromDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'toDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
          ];
          var url = ReportApi.getDemographicStatisticsReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3, 4, 5, 6,], '', [0], [1, 2, 3, 4, 5, 6])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 6: //ProcedureRank
          this.reportListColumns = [
            { title:  this.translate.instant('report.ts.typeOfService') , data: 'typeOfService' },
            { title:  this.translate.instant('report.ts.procCode') , data: 'proCode' },
            { title:  this.translate.instant('report.ts.codeDescription') , data: 'codeDescription' },
            { title:  this.translate.instant('report.ts.claimCount') , data: 'claimCount' },
            { title: this.translate.instant('report.ts.claimantCount') , data: 'claimantCount' },
            { title:  this.translate.instant('report.ts.totalAllowed'), data: 'totalAllowed' },
            { title:  this.translate.instant('report.ts.coPayment') , data: 'coPayment' },
            { title:  this.translate.instant('report.ts.COB') , data: 'cob' },
            { title:  this.translate.instant('report.ts.totalPaid'), data: 'totalPaid' },
          ];
          var reqParam = [
            { 'key': 'fromDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'toDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
          ];
          var url = ReportApi.getProcedureRankReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3, 4, 5, 6, 7, 8])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 7: //Exception
          this.reportListColumns = [
            { title: this.translate.instant('report.ts.PHN'), data: 'divisionName' },
            { title: this.translate.instant('report.ts.lastName'), data: 'totalClaims' },
            { title: this.translate.instant('report.ts.firstName'), data: 'totalEmployee' },
            { title: this.translate.instant('report.ts.DOB'), data: 'avgClaimCard' },
            { title: this.translate.instant('report.ts.section'), data: 'averageSingle' },
            { title: this.translate.instant('report.ts.postalCode'), data: 'averageFamily' },
            { title: this.translate.instant('report.ts.errorMessage'), data: 'averageFamily' },
            { title: this.translate.instant('report.ts.revision'), data: 'averageFamily' }
          ];
          var reqParam = [
            { 'key': 'startDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'endDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
          ];
          var url = ReportApi.daspExceptionReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3, 4, 5, 6, 7])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 8: //DentureReplacement
          this.reportListColumns = [
            { title:this.translate.instant('report.ts.programType') , data: 'programType' },
            { title:this.translate.instant('report.ts.cardNo') , data: 'cardNo' },
            { title:this.translate.instant('report.ts.clientName') , data: 'cardHolderName' },
            { title:this.translate.instant('report.ts.patientName') , data: 'patientName' },
            { title:this.translate.instant('report.ts.providerName') , data: 'providerName' },
            { title:this.translate.instant('report.ts.serviceDate') , data: 'serviceDate' },
            { title:this.translate.instant('report.ts.procID'), data: 'procCode' },
            { title:this.translate.instant('report.ts.toothId') , data: 'toothCode' },
            { title:this.translate.instant('report.ts.amoutPaid') , data: 'amountPaid' },
            { title:this.translate.instant('report.ts.overrideReason') , data: 'overrideReason' },
            { title:this.translate.instant('report.ts.verificationNo') , data: 'verificationNo' }
          ];
          var reqParamDentureReplacement = [
            { 'key': 'startDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'endDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
            { 'key': 'dasp', 'value': 1 },
          ];
          var url = ReportApi.daspDentureReplacementReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParamDentureReplacement, '', undefined, [5], '', [8], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParamDentureReplacement)
          }
          break;
        case 9: //ExceptionReport
          this.reportListColumns = [
            { title: this.translate.instant('report.ts.programType') , data: 'programType' },
            { title: this.translate.instant('report.ts.cardNo') , data: 'cardNo' },
            { title: this.translate.instant('report.ts.clientName') , data: 'cardHolderName' },
            { title: this.translate.instant('report.ts.patientName') , data: 'patientName' },
            { title: this.translate.instant('report.ts.providerName') , data: 'providerName' },
            { title: this.translate.instant('report.ts.serviceDate') , data: 'serviceDate' },
            { title: this.translate.instant('report.ts.procID') , data: 'procCode' },
            { title: this.translate.instant('report.ts.toothId') , data: 'toothCode' },
            { title:  this.translate.instant('report.ts.amoutPaid'), data: 'amountPaid' },
            { title: this.translate.instant('report.ts.overrideReason') , data: 'overrideReason' },
            { title: this.translate.instant('report.ts.verificationNo') , data: 'verificationNo' }
          ];
          var reqParam = [
            { 'key': 'startDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'endDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
          ];
          var url = ReportApi.daspExceptionReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [5], '', [8], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 10: //PreauthByReviewAndDASPException 
          this.reportListColumns = [
            { title: this.translate.instant('report.ts.program') , data: 'programType' },
            { title: this.translate.instant('report.ts.procID') , data: 'dcItemmProcedureCd' },
            { title: this.translate.instant('report.ts.description') , data: 'dentalProcedureDesc' },
            { title: this.translate.instant('report.ts.usageCount') , data: 'usageCount' },
            { title: this.translate.instant('report.ts.reviewed') , data: 'reviewed' },
            { title: this.translate.instant('report.ts.approved') , data: 'approved' },
            { title: this.translate.instant('report.ts.rejected') , data: 'rejected' }
          ];
          var reqParam = [
            { 'key': 'startDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'endDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
          ];
          var url = ReportApi.preauthByReviewAndDaspExceptionReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3, 4, 5, 6])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 11: //PreauthByReviewDASP
          this.reportListColumns = [
            { title:  this.translate.instant('report.ts.program'), data: 'programType' },
            { title: this.translate.instant('report.ts.procID'), data: 'dcItemmProcedureCd' },
            { title: this.translate.instant('report.ts.description'), data: 'dentalProcedureDesc' },
            { title: this.translate.instant('report.ts.usageCount'), data: 'usageCount' },
            { title: this.translate.instant('report.ts.reviewed'), data: 'reviewed' },
            { title: this.translate.instant('report.ts.approved'), data: 'approved' },
            { title: this.translate.instant('report.ts.rejected'), data: 'rejected' }
          ];
          var reqParam = [
            { 'key': 'startDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'endDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
            { 'key': 'dasp', 'value': 'T' },
          ];
          var url = ReportApi.preauthByReviewReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3, 4, 5, 6])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 12: //PreauthByReviewOther
          this.reportListColumns = [
            { title:  this.translate.instant('report.ts.program'), data: 'programType' },
            { title: this.translate.instant('report.ts.procID'), data: 'dcItemmProcedureCd' },
            { title: this.translate.instant('report.ts.description'), data: 'dentalProcedureDesc' },
            { title: this.translate.instant('report.ts.usageCount'), data: 'usageCount' },
            { title: this.translate.instant('report.ts.reviewed'), data: 'reviewed' },
            { title: this.translate.instant('report.ts.approved'), data: 'approved' },
            { title: this.translate.instant('report.ts.rejected'), data: 'rejected' }
          ];
          var reqParam = [
            { 'key': 'startDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'endDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
            { 'key': 'dasp', 'value': 'F' },
          ];
          var url = ReportApi.preauthByReviewReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3, 4, 5, 6])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        default:
          this.callReportGridApi(reportData.value, this.reportID);
          break;
      }
    } else {
      this.validateAllFormFields(this.reportFormGroup)
    }
  }

  /**
   * Call Reports Api And Create Grid
   * @param reportData 
   * @param reportID 
   */
  callReportGridApi(reportData, reportID) {
    this.showReportList = true;
    let promise = new Promise((resolve, reject) => {
      switch (reportID) {
        case 1: //ClientAgeGroupByPostcodeAndService
          this.reportListColumns = [
            { title: this.translate.instant('report.ts.divisionName') , data: 'divisionName' },
            { title: this.translate.instant('report.ts.totalClaims') , data: 'totalClaims' },
            { title: this.translate.instant('report.ts.totalEmployee') , data: 'totalEmployee' },
            { title: this.translate.instant('report.ts.average') , data: 'avgClaimCard' },
            { title: this.translate.instant('report.ts.averageSingle') , data: 'averageSingle' },
            { title: this.translate.instant('report.ts.averageFamily') , data: 'averageFamily' }
          ];
          var reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
          ];
          var url = ReportApi.divisionUtilizationReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2, 3, 4, 5])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
      }
      resolve();
    });
    return promise;
  }

  /**
   * Download pdf of the report
   */
  dowloadPDFReport() {
    let transCodeArray = [];
    let requestParam = {};
    switch (this.reportID) {
      case 1: //ClientAgeGroupByPostcodeAndService
        var url = ReportApi.getClientAgeGroupByProviderPostCodeReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'fromDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'toDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          'programType': 'AAHB',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            let endDate = this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('report.ts.postalCode') , dataKey: 'postalCode' },
              { title: this.translate.instant('report.ts.serviceDate') , dataKey: 'serviceDate' },
              { title: this.translate.instant('report.ts.clientAgeGroup') , dataKey: 'clientAgeGroup' },
              { title: this.translate.instant('report.ts.clientCount') , dataKey: 'achbClientCount' }
            ];
            this.showPageLoader = false;
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
                "postalCode": { halign: 'left' },
                "serviceDate": { halign: 'right' },
                "clientAgeGroup": { halign: 'right' },
                "achbClientCount": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 2: //ClaimAndClainantCount
        var url = ReportApi.getAdscClaimsAndCountReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'fromDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'toDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            let endDate = this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('report.ts.claimsStatus') , dataKey: 'claimStatus' },
              { title: this.translate.instant('report.ts.clientCount') , dataKey: 'claimCount' },
              { title: this.translate.instant('report.ts.claimantCount') , dataKey: 'claimantCount' },
              { title: this.translate.instant('report.ts.totalPaid') , dataKey: 'totalPaid' }
            ];
            this.showPageLoader = false;
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
                "claimStatus": { halign: 'left' },
                "claimCount": { halign: 'right' },
                "claimantCount": { halign: 'right' },
                "totalPaid": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 3: //ClaimByMonthCat
        var url = ReportApi.getClaimByMonthAndCategoryReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'fromDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'toDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            let endDate = this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate)) : '';

            var columns = [
              { title: this.translate.instant('report.ts.yearMonth'), dataKey: 'yearMonth' },
              { title: this.translate.instant('report.ts.category') , dataKey: 'category' },
              { title: this.translate.instant('report.ts.claimCount') , dataKey: 'claimCount' },
              { title: this.translate.instant('report.ts.claimantCount') , dataKey: 'claimantCount' }
            ];
            this.showPageLoader = false;
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
                "yearMonth": { halign: 'left' },
                "category": { halign: 'right' },
                "claimCount": { halign: 'right' },
                "claimantCount": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 4: //COBSavings
        var url = ReportApi.getAdscCobSavingReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'fromDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'toDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            let endDate = this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('report.ts.monthYear') , dataKey: 'monthYear' },
              { title: this.translate.instant('report.ts.programType') ,  dataKey: 'programType' },
              { title: this.translate.instant('report.ts.claimCount') , dataKey: 'claimCount' },
              { title: this.translate.instant('report.ts.claimantCount') , dataKey: 'claimantCount' },
              { title: this.translate.instant('report.ts.paidAmount') , dataKey: 'paidAmount' },
              { title: this.translate.instant('report.ts.codSavings')  , dataKey: 'cobSaving' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].paidAmount = data.result.data[i].paidAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].paidAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
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
                "monthYear": { halign: 'left' },
                "programType": { halign: 'right' },
                "claimCount": { halign: 'right' },
                "claimantCount": { halign: 'right' },
                "paidAmount": { halign: 'right' },
                "cobSaving": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 5: //DemographicStat
        var url = ReportApi.getDemographicStatisticsReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'fromDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'toDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            let endDate = this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate)) : '';
            var columns = [
              { title:this.translate.instant('report.ts.gender') , dataKey: 'gender' },
              { title: this.translate.instant('report.ts.sectionCoverage') , dataKey: 'sectionCoverage' },
              { title:  this.translate.instant('report.ts.clientCount') , dataKey: 'clientCount' },
              { title: this.translate.instant('report.ts.claimantCount') , dataKey: 'claimantCount' },
              { title: this.translate.instant('report.ts.claimCount') , dataKey: 'claimCount' },
              { title: this.translate.instant('report.ts.totalAllowed') , dataKey: 'totalAllowed' },
              { title: this.translate.instant('report.ts.totalPaid') , dataKey: 'totalPaid' }
            ];
            this.showPageLoader = false;
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
                "gender": { halign: 'left' },
                "sectionCoverage": { halign: 'right' },
                "clientCount": { halign: 'right' },
                "claimantCount": { halign: 'right' },
                "claimCount": { halign: 'right' },
                "totalAllowed": { halign: 'right' },
                "totalPaid": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 6: //ProcedureRank
        var url = ReportApi.getProcedureRankReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'fromDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'toDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            let endDate = this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('report.ts.typeOfService') , dataKey: 'typeOfService' },
              { title: this.translate.instant('report.ts.procCode')  , dataKey: 'proCode' },
              { title: this.translate.instant('report.ts.codeDescription') , dataKey: 'codeDescription' },
              { title: this.translate.instant('report.ts.claimCount')  , dataKey: 'claimCount' },
              { title: this.translate.instant('report.ts.claimantCount'), dataKey: 'claimantCount' },
              { title: this.translate.instant('report.ts.totalAllowed')  , dataKey: 'totalAllowed' },
              { title: this.translate.instant('report.ts.coPayment') , dataKey: 'coPayment' },
              { title: this.translate.instant('report.ts.COB') , dataKey: 'cob' },
              { title: this.translate.instant('report.ts.totalPaid') , dataKey: 'totalPaid' }
            ];
            this.showPageLoader = false;
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
                "typeOfService": { halign: 'left' },
                "proCode": { halign: 'right' },
                "codeDescription": { halign: 'right' },
                "claimCount": { halign: 'right' },
                "claimantCount": { halign: 'right' },
                "totalAllowed": { halign: 'right' },
                "coPayment": { halign: 'right' },
                "cob": { halign: 'right' },
                "totalPaid": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 7: //Exception
        var url = ReportApi.divisionUtilizationReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'startDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'endDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            var columns = [
              { title: this.translate.instant('report.ts.PHN') , dataKey: 'divisionName' },
              { title: this.translate.instant('report.ts.lastName') , dataKey: 'totalClaims' },
              { title: this.translate.instant('report.ts.firstName') , dataKey: 'totalEmployee' },
              { title: this.translate.instant('report.ts.dob') , dataKey: 'avgClaimCard' },
              { title: this.translate.instant('report.ts.section') , dataKey: 'averageSingle' },
              { title: this.translate.instant('report.ts.postalCode') , dataKey: 'averageFamily' },
              { title: this.translate.instant('report.ts.errorMessage') , dataKey: 'averageFamily1' },
              { title: this.translate.instant('report.ts.revision') , dataKey: 'averageFamily2' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate
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
                "divisionName": { halign: 'left' },
                "totalClaims": { halign: 'right' },
                "totalEmployee": { halign: 'right' },
                "avgClaimCard": { halign: 'right' },
                "averageSingle": { halign: 'right' },
                "averageFamily": { halign: 'right' },
                "averageFamily1": { halign: 'right' },
                "averageFamily2": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 8: //DentureReplacement
        var url = ReportApi.daspDentureReplacementReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'startDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'endDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          'dasp': 1,
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            var columns = [
              { title: this.translate.instant('report.ts.programType') , dataKey: 'programType' },
              { title: this.translate.instant('report.ts.cardNo') , dataKey: 'cardNo' },
              { title: this.translate.instant('report.ts.clientName') , dataKey: 'cardHolderName' },
              { title: this.translate.instant('report.ts.patientName') , dataKey: 'patientName' },
              { title: this.translate.instant('report.ts.providerName') , dataKey: 'providerName' },
              { title: this.translate.instant('report.ts.serviceDate')  , dataKey: 'serviceDate' },
              { title: this.translate.instant('report.ts.procID') , dataKey: 'procCode' },
              { title: this.translate.instant('report.ts.toothId') , dataKey: 'toothCode' },
              { title: this.translate.instant('report.ts.amoutPaid') , dataKey: 'amountPaid' },
              { title: this.translate.instant('report.ts.overrideReason') , dataKey: 'overrideReason' },
              { title: this.translate.instant('report.ts.verificationNo'), dataKey: 'verificationNo' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].serviceDate = data.result.data[i].serviceDate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].serviceDate) : ''
              data.result.data[i].amountPaid = data.result.data[i].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].amountPaid) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate
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
                "programType": { halign: 'left' },
                "cardNo": { halign: 'right' },
                "cardHolderName": { halign: 'right' },
                "patientName": { halign: 'right' },
                "providerName": { halign: 'right' },
                "serviceDate": { halign: 'right' },
                "procCode": { halign: 'right' },
                "toothCode": { halign: 'right' },
                "amountPaid": { halign: 'right' },
                "overrideReason": { halign: 'right' },
                "verificationNo": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 9: //ExceptionReport
        var url = ReportApi.daspExceptionReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'startDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'endDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            var columns = [
              { title: this.translate.instant('report.ts.programType') , dataKey: 'programType' },
              { title: this.translate.instant('report.ts.cardNo') , dataKey: 'cardNo' },
              { title: this.translate.instant('report.ts.clientName') , dataKey: 'cardHolderName' },
              { title: this.translate.instant('report.ts.patientName') , dataKey: 'patientName' },
              { title: this.translate.instant('report.ts.providerName') , dataKey: 'providerName' },
              { title: this.translate.instant('report.ts.serviceDate')  , dataKey: 'serviceDate' },
              { title: this.translate.instant('report.ts.procID') , dataKey: 'procCode' },
              { title: this.translate.instant('report.ts.toothId') , dataKey: 'toothCode' },
              { title: this.translate.instant('report.ts.amoutPaid') , dataKey: 'amountPaid' },
              { title: this.translate.instant('report.ts.overrideReason') , dataKey: 'overrideReason' },
              { title: this.translate.instant('report.ts.verificationNo'), dataKey: 'verificationNo' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].serviceDate = data.result.data[i].serviceDate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].serviceDate) : ''
              data.result.data[i].amountPaid = data.result.data[i].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].amountPaid) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate
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
                "programType": { halign: 'left' },
                "cardNo": { halign: 'right' },
                "cardHolderName": { halign: 'right' },
                "patientName": { halign: 'right' },
                "providerName": { halign: 'right' },
                "serviceDate": { halign: 'right' },
                "procCode": { halign: 'right' },
                "toothCode": { halign: 'right' },
                "amountPaid": { halign: 'right' },
                "overrideReason": { halign: 'right' },
                "verificationNo": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 10: //PreauthByReviewAndDASPException
        var url = ReportApi.preauthByReviewAndDaspExceptionReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'startDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'endDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          "dasp": "T",
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            var columns = [
              { title:  this.translate.instant('report.ts.program') , dataKey: 'programType' },
              { title:  this.translate.instant('report.ts.procID') , dataKey: 'dcItemmProcedureCd' },
              { title:  this.translate.instant('report.ts.description') , dataKey: 'dentalProcedureDesc' },
              { title:  this.translate.instant('report.ts.usageCount') , dataKey: 'usageCount' },
              { title:  this.translate.instant('report.ts.reviewed') , dataKey: 'reviewed' },
              { title:  this.translate.instant('report.ts.approved') , dataKey: 'approved' },
              { title:  this.translate.instant('report.ts.rejected') , dataKey: 'rejected' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate
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
                "programType": { halign: 'left' },
                "dcItemmProcedureCd": { halign: 'right' },
                "dentalProcedureDesc": { halign: 'right' },
                "usageCount": { halign: 'right' },
                "reviewed": { halign: 'right' },
                "approved": { halign: 'right' },
                "rejected": { halign: 'right' },
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 11: //PreauthByReviewDASP
        var url = ReportApi.preauthByReviewReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'startDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'endDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          'dasp': 'T',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            var columns = [
              { title:  this.translate.instant('report.ts.program') , dataKey: 'programType' },
              { title:  this.translate.instant('report.ts.procID') , dataKey: 'dcItemmProcedureCd' },
              { title:  this.translate.instant('report.ts.description') , dataKey: 'dentalProcedureDesc' },
              { title:  this.translate.instant('report.ts.usageCount') , dataKey: 'usageCount' },
              { title:  this.translate.instant('report.ts.reviewed') , dataKey: 'reviewed' },
              { title:  this.translate.instant('report.ts.approved') , dataKey: 'approved' },
              { title:  this.translate.instant('report.ts.rejected') , dataKey: 'rejected' }
               ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate
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
                "programType": { halign: 'left' },
                "dcItemmProcedureCd": { halign: 'right' },
                "dentalProcedureDesc": { halign: 'right' },
                "usageCount": { halign: 'right' },
                "reviewed": { halign: 'right' },
                "approved": { halign: 'right' },
                "rejected": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
      case 12: //PreauthByReviewOther
        var url = ReportApi.preauthByReviewReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'startDate': this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
          'endDate': this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
          'dasp': 'F',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate)) : '';
            var columns = [
              { title:  this.translate.instant('report.ts.program') , dataKey: 'programType' },
              { title:  this.translate.instant('report.ts.procID') , dataKey: 'dcItemmProcedureCd' },
              { title:  this.translate.instant('report.ts.description') , dataKey: 'dentalProcedureDesc' },
              { title:  this.translate.instant('report.ts.usageCount') , dataKey: 'usageCount' },
              { title:  this.translate.instant('report.ts.reviewed') , dataKey: 'reviewed' },
              { title:  this.translate.instant('report.ts.approved') , dataKey: 'approved' },
              { title:  this.translate.instant('report.ts.rejected') , dataKey: 'rejected' }
              
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate
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
                "programType": { halign: 'left' },
                "dcItemmProcedureCd": { halign: 'right' },
                "dentalProcedureDesc": { halign: 'right' },
                "usageCount": { halign: 'right' },
                "reviewed": { halign: 'right' },
                "approved": { halign: 'right' },
                "rejected": { halign: 'right' }
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
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('report.recordNotFound'));
          }
        });
        break;
    }
  }

  /**
   * export the report list excel
   */
  exportReportListExcel() {
    switch (this.reportID) {
      case 1: //ClientAgeGroupByPostcodeAndService
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.getClientAgeGroupByProviderPostCodeReportExcelUrl;
          var reqParamClientAgeGroupByPostcodeAndService = {
            "fromDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "toDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            'programType': 'AAHB',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "start": "0",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamClientAgeGroupByPostcodeAndService);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamClientAgeGroupByPostcodeAndService);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamClientAgeGroupByPostcodeAndService);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 2: //ClaimAndClainantCount
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.getAdscClaimsAndCountReporExcelUrl;
          var reqParamClaimAndClainantCount = {
            "fromDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "toDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": 0,
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamClaimAndClainantCount);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamClaimAndClainantCount);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamClaimAndClainantCount);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 3: //ClaimByMonthCat
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.getClaimByMonthAndCategoryReportExcelUrl;
          var reqParamClaimByMonthCat = {
            "fromDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "toDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": '0',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamClaimByMonthCat);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamClaimByMonthCat);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamClaimByMonthCat);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 4: //COBSavings
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.getAdscCobSavingReportExcelUrl;
          var reqParamCOBSavings = {
            "fromDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "toDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": '0',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamCOBSavings);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamCOBSavings);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamCOBSavings);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 5: //DemographicStat
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.getDemographicStatisticsReportExcelUrl;
          var reqParamDemographicStat = {
            "fromDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "toDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": '0',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamDemographicStat);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamDemographicStat);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamDemographicStat);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 6: //ProcedureRank
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.getProcedureRankReportExcelUrl;
          var reqParamProcedureRank = {
            "fromDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "toDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": '0',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamProcedureRank);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamProcedureRank);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamProcedureRank);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 7: //Exception
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.divisionUtilizationReportExcelUrl;
          var reqParamException = {
            "startDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "endDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": '0',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamException);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamException);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamException);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 8: //DentureReplacement
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.divisionUtilizationReportExcelUrl;
          var reqParamDentureReplacement = {
            "startDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "endDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": '0',
            "dasp": 1,
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "excel": "T",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamDentureReplacement);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamDentureReplacement);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamDentureReplacement);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 9: //ExceptionReport
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.daspExceptionExcelUrl;
          var reqParamExceptionReport = {
            "startDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "endDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": '0',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "excel": "T",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamExceptionReport);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamExceptionReport);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamExceptionReport);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 10: //PreauthByReviewAndDASPException
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.preauthByReviewAndDaspExceptionReportExcelUrl;
          var reqParamPreauthByReviewAndDASPException = {
            "startDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "endDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "start": '0',
            "dasp": "T",
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamPreauthByReviewAndDASPException);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamPreauthByReviewAndDASPException);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamPreauthByReviewAndDASPException);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 11: //PreauthByReviewDASP
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.preauthByReviewReportExcelUrl;
          var reqParamPreauthByReviewDASP = {
            "startDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "endDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "dasp": 'T',
            "start": '0',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "excel": "T",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamPreauthByReviewDASP);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamPreauthByReviewDASP);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamPreauthByReviewDASP);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
      case 12: //PreauthByReviewOther
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ReportApi.preauthByReviewReportExcelUrl;
          var reqParamPreauthByReviewOther = {
            "startDate": this.reportFormGroup.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.startDate) : '',
            "endDate": this.reportFormGroup.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportFormGroup.value.endDate) : '',
            "dasp": 'F',
            "start": '0',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "excel": "T",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamPreauthByReviewOther);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportExcelFile(URL, reqParamPreauthByReviewOther);
              }
            });
          } else {
            this.exportExcelFile(URL, reqParamPreauthByReviewOther);
          }
        } else {
          this.toastrService.error(this.translate.instant('report.recordNotFound'));
        }
        break;
    }
  }

  /**
   * Export excel for reports
   * @param URL 
   * @param reqParamPlan 
   */
  exportExcelFile(URL, reqParamPlan) {
    this.showPageLoader = false
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loaderPlaceHolder = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loaderPlaceHolder = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          a.download = this.reportPopUpTitle.replace(/\s+/g, '_');
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
        this.toastrService.error(this.translate.instant('report.recordNotFound'));
      }
    })
  }

  /**
 * Create The Quikcard Header
 * @param doc 
 * @param headerobject 
 */
  pdfHeader(doc, headerobject) {
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEQ4M0Q4NjE1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEQ4M0Q4NjA1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTU1MzkwMUYzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTU1MzkwMjAzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4x0Cf0AAAW60lEQVR42uxd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';
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
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

  /**
   * Create Alberta Header
   */
  pdfHeaderADSC(doc, headerobject) {
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAArCAYAAADxEf1ZAAAVWklEQVR4nO2deZhU1ZnGf7V1dXVXN83WDYiAthsgggqoiBshxGjUcYmOu4yjjk4y40SjODETM5pxizGLEcboaNx3jSbucWVRowIqIJsNAsrWtL0vteWP91zvrVtrd5c0OPU+Tz3d59a95557zrd/37nl4bqnKKIAaBnAaQf8iWsnP8aGlgH5XNEPOBZ4EajPemL/dpYtGsbT90yksn97AQZbRF/A29cD+MagtIVHPzmSRVt2o39pCwk8ua4YAvwWGJHrxGjUy8qPhuDzxwsx0iL6CEVmKxT8XSRa+/PAyqlUBtrxkpMxosAXQCTTCYmEh8qqdtasHMyyhbtQWpbx1CJ2AhSZrZAINfJs3UTe21xLVbCt1935/HHicQ8L540iHvfi98cKMMgi+gpFZisk/BHizYN4cOVU+pW0EU/kNCUzIpHwUFHZwaqlNdQtq6aiqp1EL/orou9RZLZCI9TMcyun8GH9SKpDTT3uxtJqixeMIh734PUmCjjIIvoCRWYrNPyddLX2Z87SaYQDHcQS3Z/iRALKw52s/HgIn60aSEW/dhJFXtvpUWS2QiPhgbImXl5xOO9t2Z2aUGM+kckkeL0Qifj48J1dicc9dPPyInZQFJnt60CgnWh7JbOXTCfk78RD99RSebiDuk8GU7e8mrJw19c0yCK2N3YkZiu0/B4OHACMB4YCwQL0WQmMAQ4EdiXTmBNeCNfz6upDeHvjnlSHmvIOlnh9CdrbAyycP4oEaX21KqDEdSwA1AB+0y4BBmYc3/ZFf2AftA4HAoP6YAxhNB99inyYrRb4GPgQ+FUP7jEO+AhYYvrJ9FkCzAPuQ5UVPWGO6cCDwCLT5/uO/5cAzwPnI4LNF5XAD4G3HGN9z9Hn/cCMlKv8XdBRwd3Lj6LM34Hfm19COh734PfHiXT58HoTbl/NB3wC/NR12VjgTWCUaR8EPAKU53XT3KgC9qZnzPsQ8Brwf2htVwG/LMCY+gH75nnuBcC9Bbhnr+DPfQrnosUEMc4w4B+7cY+B5D8pAFOAs4DliKgey+OaocAdwPcyfD/AfGqBo4GfA9cCdwPZ7LQzgOtJX+VRaT6jgTOBv6BF/QKQ7xau56+f7c9bG0czYeAatnZU5KTWUFkXny6rpmFrOSXBlCT2DKTBTieZ4YJmjAHTLgN2AVpy3C5fTAduRdq8uxiLBNJNiN6mI8KvR3PbU0wBniM/AVCF6LZPkUuz+RHhO3EaMLEb9+ip07E38CjwnznOqwHeID2jZXKWdgHmAD/I0u91wAPkUU5lcCwwFydBeqPQ1o8Hlx9GyB/JiyqCpVE2behHY305gUBKEnsW8BTQCHzXcTwGNMFXZSsRYBMy2y5Ams6N04CzEWNa2AOZe0cggToM0cjBQAWyCmrMubXARUgYD87ySG1AHbAFCaL7gNnAha7zvoMsiOGOY3sC+wFTgYuB3c3xABKaceAc7DkfBsw04xzi6KeTwgmeHiOXZjsa2C3N8XOQKdUTbADuRBNl0V8MaYn90KQ78QtgITIB0+EOtChO/N6cvxQIIQI5GEnVPYBW4HXgTxn6PA/4ievYOiSRX0PEvj9wAmIyC7sjZpiMRfilTbxcN4m5e8xnYvVqtnZUZLilkABC5V34/DF3Ens34HDE/FcCl5F5ThqQNfEsMnXnAFcjTRJCxc8Bc7v/Bg4D1gP/bPqehzTSK4gh90d+z4XIXB2GBNx8c/xXZh7ezvBIbpdgPppjC/eaMSxD632Sufe5aB3eRrRyu5mDhcA0JAguNu0AMu3fRfT0G+A4tF47ROIkF7P9U4bj3wd+jCRGd/ERcE2W76chf8PpSM9BhOwW9fsBxzvaHcApyKRzYima9OsRU7eh2sR0GIiY1YlXgROR9rDwHvAHRID/6zh+ICKSuwHwRYl1hGmOhPB7s5dbBUpiNGwpZ/niYYTKUwyC85C2Wge8gBij0jUmCwnzHGcjE+6HyAy8GbgCze0Yc+4bwG3AP6BgRisSeGHk83Ug4TgKOAQJkX2Bo5BPbM3FfyBtmQ+6sAXtyWacPtP3DcjvrkZad5MZT5MZ6++ACUgoPG7GBLJWpiNGBngSFXqPg9yFqtsD2czIoUgypMMQNEk9QSjH968i6eVU+yNIF4SAb7nas0llNDeayMxoIHPUaVqtB44hPVGDNOsNrmOXYxFTwgO+KAFvNGdE0utN0NXhp6khhM+XQh9nYQuBPyOfxzLx3R33Qz7v444xRhGTjTb//xxptcFIwIGE2QLEcJuAT83xBCJYS0N8jEzV3yFNFEBmYr7wY9PeOCS0ZwE3mrZllsaAD7Dn/hFsBRElmYk2AJuBW5BQHULmNesTZGO280jWfLeiSJgFt81dSCxDUSwnjkhznnvj2BsFuPdUV/tecmvwa5GQsDCGVNM2J+IxD6HyLkpDESWzbYxGmv04FDB6DEn+U6xLzV9LdXqQ9nCmAuJovX3AVmzGuQNpFsx37rQCyAz0OPr7KTLD2xHTdZJqdSQ9mqs9iuQ9fI1mPJ3ITD3DHA+RbIJWIk1rPZMTM5GmtZ49hr2jwpNjfNsFmcxIPzJTLLQBP0IPepU5dgQigmVf09jmIufeQj6Bil0KcN9aV3tBHte0IS071YyhHSsq6YlDJEh7tASfJ7s1EwhGWbNyCK3NQXz+JDfjUmAjMvcGoHX4BK1FFfLRys04rPGMRUz/LvK5AojANyGivSbNEDLRQxyZlRbx/giZyVeY9qFkDpJ4SRZWYXO95W/Wm2dwRiZ95m82K8hHcmrjPOAZ0zfITz/U/B8k2VrpE2TSbEdhR35ADjXIfHHi3IKPyMZ6V7smzTlrXO3LkfnbG7gXZWs3rp2LTJ1ngGZIQCREeXkDoyq30BbNnjosKY3y6SfVNDWE8NsbRSuRFXEL0rK/Rj7sTxHBXYfmIYYCPkPNmL1mHDcijf80IvpbEBG+hMzfOPK/QRHHdEnnN5EP+BzSqP9uxnQr0nDTyRztC5qxPoACNl+asV5pvr8D5d42mGdZj3w2EDM5x1OBzdR/Q6bkKygaeR1KwdyEXImLsLXgAmASioTmtY3+60AmSeYOjFgJwQXAamzpfx7wM3oWKMmFRlc7nWR6Hts8AkXsPkIBi6eRdtlElg2aaeD253pRL+WBjgq+v9/zTK5exSdfDsup3dJ4dUHgEuCPaU6fgYIacURMZwKliHC/iwTUCYiwrYKEOlTRcSWwF/CvKOEM0pyVae6zFuW1TkDrcC/SOlYEcjawMsMjXYL8sHIkHF5AgSVrXjtRpc+PUbBjNmJAUPQx7OjrUewo+Oco6nuy6ftl8/ynAisQY1mm6kvI5J6InYvc7vCkeQfJICRdLDH8ObKxLYK9HjmzFk5GkZ9MmIJCyRbeAI7MY2wHkRxKnkeqPwVapJsy9NGConefoedYhBZ7RZb7zsU2PzrRs2/MY7ypiAapKPuSh2fcSk2okeZIklVUiwTC6SjgQFm4k5UfD+UvD04gVBbBU9xW841COjPybJKd0odI1gzuio5M6YHthZtRgCIdwsiv/A5yoH+DfJ3HUdI8FxL0xrFur+TE3d9hdP8NbkZLi462EvYe/zm1YzbT3FiKx1Nktm8S0jHbTFf7QVf7A5IT2seS7N/1Bf4LBWweQhosGzxIG79ObobrHbMlPIT8XQS8KQnqtIjFtBwHHvYpZeEuIpF8qumK2FngZrZJyL628B5iLjfud7XdJV2FgNu5yUWtVsh4XxR9OxFF6/6A7Hk3Ew5B1R7Z+vWR7DN0D6FmnqqbTF3zYMoDHbnPN4OJdPmIxTxFzfYNg5vZ3LmzWzJcdyewzdE+i8Jv5/C52vn234B8s6dRtO1CFEgYg4I5ToxGTn+m+5TQm3RCoJ3NG/fk0dWHMDy8jWiOXduBkiitzUEWvLIX0YjP/YKfqags6UPzmUX3di/kiwdILVXrLWahFNEyZMrvrJiI5n58Ty52rn4YO0lqIY4iVuMdn3GIAJ2h+T1JreboLapd7W1pz8ofjahiYrbr+LddbTeT9yIZmoCSNh5c+i0+rB9JVUn2N275fHFaW4I0bisjGIo4Tc9JKLBUhyJ0L6Io36Sejy0j1qFKjELhAVSt8hCyiM5Bub+dAZdip0VA+dNV2CmFbsHpFJxJqqR8CDGc8zyrdMctpi9GOY9CwZ3E3lSgfp9AY7Xg3nrhzqvtRv7EcRhigABwH3g+p7SZbY01LN02nGNHvk9LpDTjxYmEB58vTkkwSltLUoHEZYgJTnIcu4pUeEk2vz10vwh3Vu5T8sZEZNofiV3dcw8S1KeTWiXkRD5j91G4ypASUtM8x6JUys2mvYTkNcgHX62Jk2H+JcOJbi/dgx7SbdYdT2H3DB3tai8vUL/ucbvzau580ZQ8+7wf+Y23IPNVvl7cB4EOyvydPXr5j0E9MJJkrRvFHrsXabx15txzzPG9UJL9SSREliNf9TaSCxIuQYlyUBrF2nrkR0n0zeb627DpYRZ2RYrbPLcw1oxpvuPYBiTALOYbgEz+ZpSSsbYDlWAXJW9Gls0YlIp5CKVw6oDFJAe6DkCplBZkAVgK5CiUH3zBfPe0OX4yKgr4ENWCnmqOj0drPxnl90BpsTnYdD4IFXo0oWL3/c3x7wEPm/uvRcG4amv1x6NKaidWo/zUugyflSRLFT92TVs25FOB7d66Apm3k3QXp7raq1ztua72TOwd0JlwD7IMLPyV7Lm8tPB4EsSiXjo7Au7XIfwaFfpGUVDnCpI1/43m/scjrX0XIroO7OediQijHRGJ0y/7CSpeBgWWLPP0VlQtMhNV5+yOtM1piMFOQmt1DXaZlBOdKG3kLkhYgx2wehIls2eieZuLGLATJd4PR/vTfosYcjjaa9eB0k6t2LRRCbyDmO08tG5W9dNwlNZ6EwkTy1o5BAXRTkDJ/UeQkFqDgoOLsP3MoYg5rTzOq2jnyUzT37tIIA40c7TAjHFX4ClLSjlrEEHEcwGSLpkCE+2Iue5zHLuA3FveszFbfzSxv3AdfwtVhrixP1qQGmSa3GXOTWdahJE55n7WR1ztPyOJae3jq0CTej7apuNEGfA/2JrEwo1f/eeNQVeI1kgQf47qkUiXn6pBrey57xcsfnsk4cqvXIOVSKpfiKKt5yP/cwYinmORZluDhORq4N8QU7aa8xtQuRSoMOFdM/4K5B9fbb6rx07in4uI0NpJcY/5e5Xp6yPEfM8iQna/NiOB6CcTDQ1CmmwKCv48jkq/TsEu47LcE2vskxHTnYM0ygoUeKlCQmIL9psE3kN5VYvZ16P1cuJy87fG3P9SFDhbYe4fJLkoY7O5/wC0Jgeb+zyBhN0xSCguwq4/vQy4y4+I0CmVQVLEaaZkwv2oJm2kae+F7PPXs1wzAS1aApk/lg9YgybSXZvXierc3BhJalriLEQA75Bc9VGDzFL3tv45aFLc9zsHMa2F3RDDvYQtESsQIY5yXX83SjWY3sLU1qxiv0FraezKXgsbi3npV97FoCHNRCPuOA1bSSaU15BE3hv5GmegXQFeVL70N0RkncjvcGIxIsKzkEZbghjUgqVWQ8gMcqMLBZZeR/5pENVhumEVR7gDCgHzKUUM4PTH12JHgBtI3SZTgsrwLP9qAzb9lJlns9CGmK8KadgNacY4C9FXM3reCnNfSN11YM1LHNHpUpJTSnXITI+Q7P/5gUY/UovOwMhC88kXjyPOtXAB2ZltIPkXMG9BRJRuZ0ED8i+ucB0fR3KuMBOeJDlQ4sRcJKUeQJNvYQbp99VZeAJ3RU1nmLHVdew38DM+3rZr1trIkmCU+s1hPnp3BGXhpHLTQcjPcBLt69jzXopMzVtdXU4nvd9tjdWauxtd31maKI7Mr8Wu7/sjTePW6G6sRYKqFjE0iHi3IfP2BSQAB2MT7UgzNki/5acTaWLLBRqImGCLuZdz7csREzagOXDXRY5DWn4KMvmGIgaypGIZ9k4KsOfFi4TfPq6x74oEQRXJ8RCfdZE7p/Io3YM7onQGydtUevKWrDhyjCeQOcLZhEzIqWjR8sV6c12uza/PInv+pTz6/BLNY3LqJOGF0ma+PXwxm9srcxYhl4U7+WDuKD5fU0VJaZJRcRMiptPRRs8fIBPlTvP988jCmIbqOu9B5mYjWvgUNYk2ftaaj/PNUwOxd1j8EWms45AQeRbRzNXIbDwRmYG3kb6w4Q1kCSxAVsBxSHBGkaUQQ3vQHke7/29Hr614FDHHIFKZ7UvzTHehMryHkVbaZvraBVkXp6AgyErk8lSTajV9iZhmEoqcWrlLqzxxFTLRp5t2AjFXhbnfYiSQTzLjGYx8RPe9SoFqvxngekTgLST7YPngfbRw47G3uzu1wWq09aOczNX3ASR91iLJ8jb575ObhyrcD0Ch94ORhHNq6y1IWy9A20TcOwoyYQla0KlIox2KbeJEzfcvImZPrlDxxKGpmkl7zeOYkQvz+oHEaMTHkOGNlJTGSMQ8zkLkG7AjjhvRol6P/TKky1Bw4D6k/Vah+YwhczLdrowGVOfa6Pr+A2QOgXzEoLmvVbEP8nPHmuPNiGjvyfBYhyOhcDuisUVII1q/6ngMYrbbzdinI7+xEtGWe63CKHA3HO1cTyCmB63zVOzXIS7HDtVvxX6Ng4V1KI/2S+SLRZELYm0X+hkS+L9H5vpWJDwsSTgDWUi3ozmchmi8zXWvLcDb6ar+iygEYn7oKuOOY27iiKHLWN86AG9y+VVK1b/HmyBc2ckz9x7Ikvd3of/gVhLxlNiCO5eWDT3Js3UX2+MeTpyOkuT7UNh3i2Sb14I84470RuRvDjxxaBvAIbXvcOSwJXzR1t/NaGkRj3lJJDxMmLKGkmCMSFc6669bBLY9mGB7F3CWIUGV/TVl3Ue2eS3IMxaZ7etANIjH38ElY14hlvARz7Os0+NJ0NxYyojarewzYQMtTcVtNmmwFJltuSLlOxyKzFZoeBLQ1o+pe8zn4CEr+Lx1QLd+WMNDgnjcy4RD1hIsjRKNptVu/5+xAL2ar7WvB9JdFJmt0IgF8JW2cMHo1+mMBvDmiECmQ0tTKcNGNbDP+A3uGskidmIUma3QaK9g2u7vcnDNCrZ0pHudR254PAniMS/jJq+jrDxCPLYj/BhNEb1FkdkKibgPSps5c6+36Ir7e+VVt7eWMKK2ntoxG2ltzrxToIidB0VmKxQ8CWgZwBEjFnP4sKXU5/7FGi+KrKVdg3hc5VvjDlqHz/yElKeo4HZqFJmtUIgEKa/cwkVjX6EtGiQazzm1cZT8TOvUeTzQ1lLCsBHbmHzUKmJRX9Gc3Mnxd3WQ2G3qIQNuAAAAAElFTkSuQmCC';
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report ') {
        doc.text(headerobject[0].text5Date, 1000, 90, null, null, 'right');
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

  /**
   * Create Pdf Footer
   * @param doc 
   * @param reportId 
   */
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

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.reportFormGroup.patchValue(datePickerValue);
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
      this.reportFormGroup.patchValue(datePickerValue);
    }
    if (this.reportFormGroup.value.startDate && this.reportFormGroup.value.endDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.reportFormGroup.value.startDate.date, this.reportFormGroup.value.endDate.date);
      if (this.error.isError == true) {
        this.reportFormGroup.controls['endDate'].setErrors({
          "ToDateNotValid": true
        });
      }
    }
  }

  /* Method for validate the Form fields */
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

  /**
   * Reset the Report Form
   */
  resetReportForm() {
    this.reportFormGroup.reset();
  }

}
