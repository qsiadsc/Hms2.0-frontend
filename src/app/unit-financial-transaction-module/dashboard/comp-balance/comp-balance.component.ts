import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UftApi } from '../../uft-api';
import { Observable } from 'rxjs/Rx';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { TranslateService } from '@ngx-translate/core';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';

@Component({
  selector: 'app-comp-balance',
  templateUrl: './comp-balance.component.html',
  styleUrls: ['../dashboard.component.css'],
  providers: []
})

export class CompBalanceComponent implements OnInit {
  searchButtonclicked: boolean = false;
  result: any;
  ObservableClaimsToBePaidObj: any;
  ObservableEnoughAmtAvlObj: any;
  coFlagArr: { 'id': string; 'name': string; }[];
  statusArr: { 'id': string; 'name': string; }[];
  todaydate: any;
  id = 0;
  case1: boolean = false;
  case2: boolean = false;
  case3: boolean = false;
  case4: boolean = false;
  case5: boolean = false;
  columns = [];
  ObservableDashboardObj;
  public compBalance: FormGroup;
  loaderPlaceHolder;
  docName;
  docType;
  firstDay: Date;
  lastDay: Date;
  startDate: string;
  endDate: string;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  showGraph: boolean = false;
  showtableLoader: boolean = false;
  oldRequest: any;
  graphStartDate: any;
  dateTime: string;
  showLastUpdated: boolean = false;
  public brokerData: RemoteData;
  companyDataRemote: RemoteData;
  brokerSearchedNo: any;
  brokerSearchedName: any;
  comapanySearchedName: string;
  comapanySearchedNo: string;
  CompbrokerNoName = null
  CompNoName = null
  totalCompanyBalanceAmt: any;
  totalPapAmt: any;
  totalPendingBalanceAmt: any;
  totalRemainingAmt: any;
  @Output() unpaidClaimReport = new EventEmitter();
  case6: boolean = true;
  hideExportButton: boolean;
  constructor(
    public dataTableService: DatatableService,
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private exDialog: ExDialog,
    private toastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
  ) {
    // to hide export button when table is empty.
    dataTableService.showGraph.subscribe(data => {
      if (data) {
        this.hideExportButton = true
      }
      else{
        this.hideExportButton = false
      }
    })
    dataTableService.compBalanceGraph.subscribe(data => {
      // log no 723
      this.compBalanceGraph(data);
    })
    //Show Total Counts Here    
    this.totalCompanyBalanceAmt = this.currentUserService.convertAmountToDecimalWithDoller(0);
    this.totalPapAmt = this.currentUserService.convertAmountToDecimalWithDoller(0);
    this.totalPendingBalanceAmt = this.currentUserService.convertAmountToDecimalWithDoller(0);
    this.totalRemainingAmt = this.currentUserService.convertAmountToDecimalWithDoller(0);

    dataTableService.totalSumCount.subscribe(data => {
      if (data) {
        this.totalCompanyBalanceAmt = data.totalCompanyBalanceAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.totalCompanyBalanceAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
        this.totalPapAmt = data.totalPapAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.totalPapAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
        this.totalPendingBalanceAmt = data.totalPendingBalanceAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.totalPendingBalanceAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
        this.totalRemainingAmt = data.totalRemainingAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.totalRemainingAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
      }
    })
    //Broker Predictive Search
    this.brokerData = completerService.remote(
      null,
      "brokerIdAndName",
      "brokerIdAndName"
    );
    this.brokerData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': this.currentUserService.token } });
    this.brokerData.urlFormater((term: any) => {
      return UftApi.getBrokerListForReferralTypeList + `/${term}`;
    });
    this.brokerData.dataField('result')
    this.companyDataRemote = completerService.remote(
      null,
      "coName,coId",
      "coNameAndId"
    );
    let businessTypeKey = Constants.quikcardBusnsTypeKey
    this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.companyDataRemote.urlFormater((term: any) => {
      return UftApi.getPredectiveCompany + '/' + businessTypeKey + `/${term}`;
    });
    this.companyDataRemote.dataField('result');
  }
  public barChartOptions: any = {
    responsive: true,
    hover: {
      onHover: function (e) {
        $("#compBalanceBarChart").css("cursor", e[0] ? "default" : "pointer");
      }
    },
  };

  public barChartLabels: string[] = ['Balance >= 3x Monthly PAP', 'Balance > 0 and < 3x Monthly PAP', 'Balance = 0', 'Balance < 0 and > Credit Limit', 'Balance < Credit Limit']
  public barChartType: string = 'pie';
  public barChartLegend: boolean = false;
  public barChartData: any[]
  public barChartColors = [{}];

  ngOnInit() {
    this.compBalance = new FormGroup({
      status: new FormControl('', [Validators.required]),
      coFlag: new FormControl(''),
      date: new FormControl('', [Validators.required])
    })
    this.compBalance.patchValue({ 'coFlag': 'All' });
    this.compBalance.patchValue({ 'status': 'All' });
    var date = new Date();
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
    this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
    this.todaydate = this.changeDateFormatService.getToday();
    this.compBalance.patchValue({ 'date': this.todaydate });
    this.getStatus();
    this.getCoFlagValue();
    var self = this
    setTimeout(function () {
      self.dataTableInitialize();
    }, 500);

    $(document).unbind();
    $(document).on('click', 'table#uftDashboard_bar1 tbody tr td:nth-child(4)', function (e) {
      let companyBalanceSelectedRowData = self.currentUserService.companyBalanceSelectedRowData;
      if (!$(event.target).hasClass("dataTables_empty")) {
        self.unpaidClaimReportFunction(companyBalanceSelectedRowData);
      }
    })
    $(document).on('click', 'table#uftDashboard_bar1 tbody tr td:not(:nth-child(4))', function (e) {
      let companyBalanceSelectedRowData = self.currentUserService.companyBalanceSelectedRowData;
      if (!$(event.target).hasClass("dataTables_empty")) {       
        window.open('/company/view/' + companyBalanceSelectedRowData.coKey, '_blank');
      }
    })
    $('#compBalanceBarChart').css('pointer-events', ' none')
  }

  unpaidClaimReportFunction(data) {
    this.unpaidClaimReport.next({ 'selectedRow': data, 'companyBalanceData': this.compBalance });
  }

  getStatus() {
    this.statusArr = [
      { 'id': 'A', 'name': 'Active' },
      { 'id': 'T', 'name': 'Terminated' },
      { 'id': 'All', 'name': 'All' }]
  }

  getCoFlagValue() {
    this.coFlagArr = [
      { 'id': 'S', 'name': 'Surplus' },
      { 'id': 'D', 'name': 'Deficit' },
      { 'id': 'All', 'name': 'All' }]
  }

  dataTableInitialize() {
    this.ObservableDashboardObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: '', data: 'coCategoryColorCode' },
          { title: this.translate.instant('uft.dashboard.company-balance.companyNameNum'), data: 'coNameAndId' },
          { title: this.translate.instant('uft.dashboard.company-balance.primaryBrokerNumName'), data: 'brokerName' },
          { title: this.translate.instant('uft.dashboard.company-balance.companyBalanceAmt'), data: 'coClosingBalance' },
          { title: this.translate.instant('uft.dashboard.company-balance.pendingClaimsAmt'), data: 'pendingClaimAmt' },
          { title: this.translate.instant('uft.dashboard.company-balance.remainingBalanceAmt'), data: 'coRemainingBalAmt' },
          { title: this.translate.instant('uft.dashboard.company-balance.creditLimitAmount'), data: 'creditLimitAmount' },
          { title: this.translate.instant('uft.dashboard.company-balance.monthlyPapAmount'), data: 'monthlyPap' },
          { title: this.translate.instant('uft.dashboard.company-balance.creditLimitMultiplier'), data: 'creditLimitMultiplier' },
        ]
        this.ObservableDashboardObj.unsubscribe();
        this.balanceAmountPie('');
      }
    });
  }

  compBalanceGraph(data) {
    if (data) {
      this.showGraph = false;
      setTimeout(() => {
        $('#compBalanceBarChart').css('pointer-events', ' all');
        this.barChartLabels = ['Balance >= 3x Monthly PAP', 'Balance > 0 and < 3x Monthly PAP', 'Balance = 0', 'Balance < 0 and > Credit Limit', 'Balance < Credit Limit']
        this.barChartData = [{
          data: [data.coBalanceGteMonthlyPap, data.coBalanceLteMonthlyPap, data.coBalanceZero, data.coBalanceGtCreditLimit, data.coBalanceLtCreditLimit],
          backgroundColor: ['#09bb2f', '#0484b4', '#ddd', '#D36726', '#bb0919']
        }];
        this.showtableLoader = false;
        this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
        this.showLastUpdated = true;
        this.showGraph = true;
      }, 400);

    } else {
      this.showGraph = false;
      setTimeout(() => {
        // log no 723
        $('#compBalanceBarChart').css('pointer-events', ' none')
        this.barChartLabels = ['No Data Avalible']
        this.barChartData = [{
          data: [0.1],
          backgroundColor: ['#808080']
        }];
        this.showtableLoader = false
        this.dateTime = this.changeDateFormatService.getCurrentTimestamp(new Date())
        this.showLastUpdated = true;
        // to hide export button when table is empty.
        if (!this.hideExportButton) {
          this.showGraph = true;
        }
        else{
          this.showGraph = false
        }
      }, 400);
    }
  }

  //bar graph click  events
  public chartClicked(e: any): void {
    this.dataTableService.resetTableSearch()
    this.searchButtonclicked = false
    this.reset();
    if (e.active[0]) {
      if (e.active[0]._index == 0) {
        this.case1 = true;
        this.case2 = false;
        this.case3 = false;
        this.case4 = false;
        this.case5 = false;
        this.case6 = false;
        this.balanceAmountPie(1);
      }
      else if (e.active[0]._index == 1) {
        this.case2 = true;
        this.case1 = false;
        this.case3 = false;
        this.case4 = false;
        this.case5 = false;
        this.case6 = false;
        this.balanceAmountPie(2);
      }
      else if (e.active[0]._index == 2) {
        this.case3 = true;
        this.case1 = false;
        this.case2 = false;
        this.case4 = false;
        this.case5 = false;
        this.case6 = false;
        this.balanceAmountPie(3);
      } else if (e.active[0]._index == 3) {
        this.case1 = false;
        this.case2 = false;
        this.case3 = false;
        this.case4 = true;
        this.case5 = false;
        this.case6 = false;
        this.balanceAmountPie(4);
      } else if (e.active[0]._index == 4) {
        this.case1 = false;
        this.case2 = false;
        this.case3 = false;
        this.case4 = false;
        this.case5 = true;
        this.case6 = false;
        this.balanceAmountPie(5);
      }
    }
  }

  //bar graph Hover events
  public chartHovered(e: any): void {
  }

  compBalancesSearch() {
    if (this.compBalance.valid) {
      this.searchButtonclicked = true;
      if (this.case1) {
        this.balanceAmountPie(1)
      }
      else if (this.case2) {
        this.balanceAmountPie(2)
      }
      else if (this.case3) {
        this.balanceAmountPie(3)
      }
      else if (this.case4) {
        this.balanceAmountPie(4)
      }
      else if (this.case5) {
        this.balanceAmountPie(5)
      }
      else {
        this.balanceAmountPie("")
      }
    }
    else {
      this.validateAllFormFields(this.compBalance)
    }
  }

  balanceAmountPie(compamnyBalanceGraph) {
    let reqParam = [
      { 'key': 'status', 'value': 'All' },
      { 'key': 'coFlag', 'value': 'All' },
      { 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compBalance.value.date) },
      { 'key': 'startDate', 'value': "01/01/1990" },
      { 'key': 'companyBalanceGraphParam', 'value': compamnyBalanceGraph },
    ]

    let eligibilityHistorytableActions = [
      { 'name': 'cdEligibilityKey', 'val': '', 'class': '', 'type': 'colors', 'uniqueness': false }
    ]
    if (this.searchButtonclicked == true) {
      this.showGraph = false
      this.showtableLoader = true
    } else { }
    var tableId = "uftDashboard_bar1"
    if ($.fn.dataTable.isDataTable('#uftDashboard_bar1')) {
      var table = $('#uftDashboard_bar1').DataTable();
      table.destroy();
    }
    if (!$.fn.dataTable.isDataTable('#uftDashboard_bar1')) {
      this.dataTableService.jqueryDataTable(tableId, UftApi.getCompanyBalanceFilterUrlNew, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', "AddNewFee", 9, [3, 4, 5, 6, 7], [2, 4, 6], '', [1], [0, 2, 3, 4, 5, 6, 7, 8], null, null, "color") // passing columns(6,7) to get amount format
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, UftApi.getCompanyBalanceFilterUrlNew, reqParam)
    }
    return false;
  }

  amtAvlApproach() {
    let reqParam = [
      { 'key': 'status', 'value': 'All' },
      { 'key': 'coFlag', 'value': 'All' },
      { 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compBalance.value.date) },
      { 'key': 'startDate', 'value': "01/01/1990" },
      { 'key': 'companyBalanceGraphParam', 'value': 1 }
    ]
    if (this.searchButtonclicked == true) {
      this.showGraph = false
      this.showtableLoader = true
    } else { }
    var tableId = "uftDashboard_bar1"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_bar1')) {
      this.dataTableService.jqueryDataTable(tableId, UftApi.getCompanyBalanceFilterUrlNew, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', "AddNewFee", 9, [3, 4, 5], [2, 4, 6], '', [1], [0, 2, 3, 4, 5, 6, 7, 8])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, UftApi.getCompanyBalanceFilterUrlNew, reqParam)
    }
    return false;
  }

  enoughAmtAvl() {
    var reqParam = [
      { 'key': 'status', 'value': 'All' },
      { 'key': 'coFlag', 'value': 'All' },
      { 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compBalance.value.date) },
      { 'key': 'startDate', 'value': "01/01/1990" },
      { 'key': 'companyBalanceGraphParam', 'value': 'Enough Amount' }
    ]
    if (this.searchButtonclicked == true) {
      this.showGraph = false
      this.showtableLoader = true
    } else { }
    var tableId = "uftDashboard_bar1"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_bar1')) {
      this.dataTableService.jqueryDataTable(tableId, UftApi.getCompanyBalanceFilterUrlNew, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', "AddNewFee", 8, [3, 4, 5], [2, 4, 6], '', [1], [0, 2, 3, 4, 5, 6, 7, 8])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, UftApi.getCompanyBalanceFilterUrlNew, reqParam)
    }
    return false;
  }

  claimsToBePaid() {
    var reqParam = [
      { 'key': 'status', 'value': 'All' },
      { 'key': 'coFlag', 'value': 'All' },
      { 'key': 'startDate', 'value': "01/01/1990" },
      { 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compBalance.value.date) },
      { 'key': 'companyBalanceGraphParam', 'value': 'To Be Paid Amount' }
    ]
    if (this.searchButtonclicked == true) {
      this.showGraph = false
      this.showtableLoader = true
    } else { }
    var tableId = "uftDashboard_bar1"
    if (!$.fn.dataTable.isDataTable('#uftDashboard_bar1')) {
      this.dataTableService.jqueryDataTable(tableId, UftApi.getCompanyBalanceFilterUrlNew, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', "AddNewFee", 8, [3, 4, 5], [2, 4, 6], '', [1], [0, 2, 3, 4, 5, 6, 7, 8])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, UftApi.getCompanyBalanceFilterUrlNew, reqParam)
    }
    return false;
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
      this.compBalance.patchValue(datePickerValue);
    }
  }

  /* to fire validation of all form fields together */
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

  exportCompanyBalanceFilteredData() {
    var params = this.dataTableService.getFooterParams("uftDashboard_bar1")
    var reqParam = {
      "start": 0,
      "length": this.dataTableService.totalRecords,
      "coClosingBalance": params[0].value,
      "pendingClaimAmt": params[1].value,
      "coRemainingBalAmt": params[3].value,
      "monthlyPap": params[2].value,
      "creditLimitMultiplier": params[4].value,
      "startDate": "01/01/1990",
      "status": this.compBalance.value.status,
      "coFlag": 'All',
    }
    if (this.case1) {
      reqParam["companyBalanceGraphParam"] = 1
    }
    if (this.case2) {
      reqParam["companyBalanceGraphParam"] = 2
    }
    if (this.case3) {
      reqParam["companyBalanceGraphParam"] = 3
    }
    if (this.case4) {
      reqParam["companyBalanceGraphParam"] = 4
    }
    if (this.case5) {
      reqParam["companyBalanceGraphParam"] = 5
    }
    if (this.case6) {
      reqParam["companyBalanceGraphParam"] = ''
    }

    if (this.comapanySearchedNo == '' || this.comapanySearchedNo == null) {
      reqParam["coNameAndId"] = this.CompNoName
    } else {
      reqParam["coId"] = this.comapanySearchedNo
    }
    if (this.brokerSearchedNo == '' || this.brokerSearchedNo == null) {
      reqParam["brokerName"] = this.CompbrokerNoName
    } else {
      reqParam["brokerName"] = this.brokerSearchedNo
    }
    var CompanyBalanceExcelFilterData = UftApi.getCompanyBalanceExcelFilterUrl;
    this.loaderPlaceHolder = this.translate.instant('uft.dashboard.company-balance.loadingFile')
    var fileName = "CompanyBalance-List "
    this.docName = ""
    this.docType = ""
    if (this.dataTableService.totalRecords > 500) {
      this.exDialog.openConfirm(this.translate.instant('uft.toaster.confirmation')).subscribe((value) => {
        if (value) {
          this.exportFile(CompanyBalanceExcelFilterData, reqParam, fileName)
        }
      });
    } else {
      this.exportFile(CompanyBalanceExcelFilterData, reqParam, fileName)
    }
  }

  exportFile(URL, reqParam, fileName) {
    this.loaderPlaceHolder = this.translate.instant('uft.dashboard.company-balance.loadingFile')
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, reqParam).subscribe(data => {
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
          a.download = fileName + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      }
      else {
      }
    })
  }

  legendBtnClick(type) {
    this.dataTableService.resetTableSearch()
    this.reset();
    if (type == 0) {
      this.case1 = true;
      this.case2 = false;
      this.case3 = false;
      this.case4 = false;
      this.case5 = false;
      this.case6 = false;
      this.balanceAmountPie(1);
    }
    else if (type == 1) {
      this.case1 = false;
      this.case2 = true;
      this.case3 = false;
      this.case4 = false;
      this.case5 = false;
      this.case6 = false;
      this.balanceAmountPie(2);
    }
    else if (type == 2) {
      this.case1 = false;
      this.case2 = false;
      this.case3 = true;
      this.case4 = false;
      this.case5 = false;
      this.case6 = false;
      this.balanceAmountPie(3);
    } else if (type == 3) {
      this.case1 = false;
      this.case2 = false;
      this.case3 = false;
      this.case4 = true;
      this.case5 = false;
      this.case6 = false;
      this.balanceAmountPie(4);
    } else if (type == 4) {

      this.case1 = false;
      this.case2 = false;
      this.case3 = false;
      this.case4 = false;
      this.case5 = true;
      this.case6 = false;
      this.balanceAmountPie(5);
    }
    else if (type == 5) {
      this.case1 = false;
      this.case2 = false;
      this.case3 = false;
      this.case4 = false;
      this.case5 = false;
      this.case6 = true;
      this.balanceAmountPie("");
    }
  }
  getSearchByGridFilteration(tableId: string) {
    let companyBalanceGraphParam;
    if (this.case1) {
      companyBalanceGraphParam = 1
    }
    if (this.case2) {
      companyBalanceGraphParam = 2
    }
    if (this.case3) {
      companyBalanceGraphParam = 3
    }
    if (this.case4) {
      companyBalanceGraphParam = 4
    }
    if (this.case5) {
      companyBalanceGraphParam = 5
    }
    if (this.case6) {
      companyBalanceGraphParam = ''
    }
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, {})
    params.push({ 'key': 'status', 'value': 'All' })
    params.push({ 'key': 'coFlag', 'value': 'All' })
    params.push({ 'key': 'companyBalanceGraphParam', 'value': companyBalanceGraphParam })
    params.push({ 'key': 'startDate', 'value': "01/01/1990" })
    params.push({ 'key': 'endDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.compBalance.value.date) })
    if (this.comapanySearchedNo == '' || this.comapanySearchedNo == null) {
      params.push({ 'key': 'coNameAndId', 'value': this.CompNoName })
    } else {
      params.push({ 'key': 'coId', 'value': this.comapanySearchedNo })
    }
    if (this.brokerSearchedNo == '' || this.brokerSearchedNo == null) {
      params.push({ 'key': 'brokerName', 'value': this.CompbrokerNoName })
    } else {
      params.push({ 'key': 'brokerName', 'value': this.brokerSearchedName })
    }
    var url = UftApi.getCompanyBalanceFilterUrlNew
    this.dataTableService.jqueryDataTableReload(tableId, url, params);
  }
  reset() {
    this.brokerSearchedNo = ''
    this.brokerSearchedName = ''
    this.comapanySearchedNo = ''
    this.comapanySearchedName = ''
    this.CompbrokerNoName = null
    this.CompNoName = null
  }
  resetTableSearch() {
    this.brokerSearchedNo = ''
    this.brokerSearchedName = ''
    this.comapanySearchedNo = ''
    this.comapanySearchedName = ''
    this.CompbrokerNoName = null
    this.CompNoName = null
    this.dataTableService.resetTableSearch()
    if (this.case1) {
      this.balanceAmountPie(1);
    }
    if (this.case2) {
      this.balanceAmountPie(2);
    }
    if (this.case3) {
      this.balanceAmountPie(3);
    }
    if (this.case4) {
      this.balanceAmountPie(4);
    }
    if (this.case5) {
      this.balanceAmountPie(5);
    }
    if (this.case6) {
      this.balanceAmountPie("");
    }

  }
  onBrokerSelected(selected: CompleterItem) {
    if (selected) {
      this.brokerSearchedNo = selected.originalObject.brokerId
      this.brokerSearchedName = selected.originalObject.brokerName
    } else {
      this.brokerSearchedNo = ''
      this.brokerSearchedName = ''
    }
  }

  onCompanySelected(selected: CompleterItem) {
    if (selected) {
      this.comapanySearchedNo = selected.originalObject.coId
      this.comapanySearchedName = selected.originalObject.coName
    } else {
      this.comapanySearchedNo = ''
      this.comapanySearchedName = ''
    }
  }
  ngAfterViewInit() {
  }
  chnagecontent() {
  }
}

