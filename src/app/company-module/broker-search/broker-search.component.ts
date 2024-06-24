import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { CompanyService } from '../company.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { Constants } from '../../common-module/Constants';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Observable';
import { BrokerApi } from './../broker-api';
import { CompanyApi } from './../company-api';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-broker-search',
  templateUrl: './broker-search.component.html',
  styleUrls: ['./broker-search.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService]
})

export class BrokerSearchComponent implements OnInit {
  currentUser: any;
  expired = false;
  brokerListTableVal: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  public searchBrokerForm: FormGroup; // change private to public for production build
  private brokerFilterForm: FormGroup;
  url;
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  blobUrl;
  getLowerSearch: boolean;
  getUpperSearch: boolean;
  brokerKey;
  reqParam;
  citiesList = [];
  provinceList = [];
  brokerList = [];
  ObservableObj
  showDatatable: boolean = true;
  checkvalue = true
  showBrokerList: boolean = false; //Enable true when we need to show broker list
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePlaceholder = CommonDatePickerOptions.myDatePlaceholder;
  error: any;
  dateNameArray = {};
  columns = []
  brokerNameId;
  brokerCity;
  brokerProvince;
  brokerEffDate;
  brokerExpDate;
  brokerStatus;
  //predictive Search
  public cityDataRemote: RemoteData;
  public cityDataRemoteLower: RemoteData;
  public provinceDataRemote: RemoteData;
  public provinceDataRemoteLower: RemoteData;
  recordLength;
  searchBrokerAuthCheck = [{
    "addBroker": 'F',
    "searchBroker": 'F',
    "viewBroker": 'F',
    "addCompany": 'F'
  }]
  tableId = "brokerListTable";

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private exDialog: ExDialog,
    private companyService: CompanyService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService
  ) {
    /* Used to Display Error With Element */
    this.error = { isError: false, errorMessage: '' };
    this.showDatatable = true;
    this.cityDataRemote = completerService.remote(
      null,
      "cityName",
      "cityName"
    );
    this.cityDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.cityDataRemote.urlFormater((term: any) => {
      return CompanyApi.getCities + `/${term}`;
    });
    this.cityDataRemote.dataField('result');
    //Predictive City Search Lower
    this.cityDataRemoteLower = completerService.remote(
      null,
      "cityName",
      "cityName"
    );
    this.cityDataRemoteLower.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.cityDataRemoteLower.urlFormater((term: any) => {
      return CompanyApi.getCities + `/${term}`;
    });
    this.cityDataRemoteLower.dataField('result');
    //Predictive Province Search
    this.provinceDataRemote = completerService.remote(
      null,
      "provinceName",
      "provinceName"
    );
    this.provinceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.provinceDataRemote.urlFormater((term: any) => {
      return CompanyApi.getProvince + `/${term}`;
    });
    this.provinceDataRemote.dataField('result');
    //Predictive Province Search
    this.provinceDataRemoteLower = completerService.remote(
      null,
      "provinceName",
      "provinceName"
    );
    this.provinceDataRemoteLower.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.provinceDataRemoteLower.urlFormater((term: any) => {
      return CompanyApi.getProvince + `/${term}`;
    });
    this.provinceDataRemoteLower.dataField('result');
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SBR'].concat(this.currentUserService.authChecks['BRO'], this.currentUserService.authChecks['ACO'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SBR'].concat(this.currentUserService.authChecks['BRO'], this.currentUserService.authChecks['ACO'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
      })
    }
    this.searchBrokerForm = new FormGroup({
      'broker_name_id': new FormControl(),
      'city': new FormControl(),
      'province': new FormControl(),
      'effected_date': new FormControl(),
      'expired_date': new FormControl(),
      'status': new FormControl(),
    });
    var self = this
    $(document).on('click', '#brokerListTable .view-ico', function () {
      var id = $(this).data('id')
      self.viewEditBroker(id)
    })
    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', 'View');
    })
    $('.searchInput').keypress(function (e) {
      if (e.which == 13) {//Enter key pressed
        $('#searchBtn').click();//Trigger search button click event
      }
    });
    $("input[type='text']").attr("autocomplete", "off");
    window.scrollTo(0, 0)
    //For Date Fields Filter Search On Enter
    $(document).on('keydown', '#brokerListTable .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
    $(document).on('click', '#brokerListTable > tbody > tr', function (e) {
      var data = self.currentUserService.brokerSelectedRowData
      var brokerKey = data.brokerKey;
      self.brokerKey = brokerKey
      self.currentUserService.isBrokerSearch = true;
      self.ViewBrokerPage()
    })
    // to resolve navigation Issue(HMS point no 536) in brokerListTable
    this.dataTableService.brokerListTableEmitter.subscribe((val) => {
      if(val == 200){
        this.brokerListTableVal = false;
      } else {
        this.brokerListTableVal = true;
      }
    })
  }

  ViewBrokerPage() {
    if (!this.brokerListTableVal) {
      this.router.navigate(['/company/broker/edit/' + this.brokerKey]);
      this.brokerListTableVal = false; 
    }
  }

  getBrokersList() {
    this.tableId = "brokerListTable"
    this.url = BrokerApi.brokerListUrl;
    this.reqParam = [
      { 'key': 'cityName', 'value': "" },
      { 'key': 'provinceName', 'value': "" },
      { 'key': 'brokerExpiredOn', 'value': "" },
      { 'key': 'brokerEffectiveOn', 'value': "" },
      { 'key': 'brokerName', 'value': "" },
      { 'key': 'brokerIdAndName', 'value': "" }
    ]
    this.ObservableObj = Observable.interval(.1000).subscribe(x => {
      if (this.checkvalue = true) {
        if ('company.search-broker.broker-id' == this.translate.instant('company.search-broker.broker-id')) {
        } else {
          this.columns = [
            { title: this.translate.instant('company.search-broker.broker-name-id'), data: 'brokerIdAndName' },
            { title: this.translate.instant('company.search-broker.city'), data: 'cityName' },
            { title: this.translate.instant('company.search-broker.province'), data: 'provinceName' },
            { title: this.translate.instant('company.search-broker.effected-on'), data: 'effectiveOn' },
            { title: this.translate.instant('company.search-broker.expired-on'), data: 'expiredOn' }
          ]
          this.checkvalue = false;
          this.ObservableObj.unsubscribe();
          if (this.companyService.brokerSearchedData && this.currentUserService.isBrokerSearch) {
            this.searchBrokerForm.patchValue(this.companyService.brokerSearchedData)
            this.currentUserService.isBrokerSearch = false
            this.searchBroker()
          }
        }
      }
    });
  }

  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.searchBrokerAuthCheck = [{
        "addBroker": 'T',
        "searchBroker": 'T',
        "viewBroker": 'T',
        "addCompany": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }

      this.searchBrokerAuthCheck = [{
        "addBroker": authCheck['BRO117'],
        "searchBroker": authCheck['SBR121'],
        "viewBroker": authCheck['SBR122'],
        "addCompany": authCheck['ACO113'],
      }]
    }
    this.getBrokersList();
    return this.searchBrokerAuthCheck
  }

  /**
   * Search Broker List
   * @param searchBrokerForm 
   */
  searchBroker() {
    this.getLowerSearch = false;
    this.getUpperSearch = true;
    this.showBrokerList = true;
    var brokerNameInputValue;
    var brokerIDInputValue;
    var cityNameInputValue;
    var provinceNameInputValue;
    var expiryDateInputValue;
    var EffectiveDateInputValue;
    var statusInputValue;
    var reqParam = [
      { 'key': 'brokerIdAndName', 'value': this.searchBrokerForm.value.broker_name_id },
      { 'key': 'cityName', 'value': this.searchBrokerForm.value.city },
      { 'key': 'provinceName', 'value': this.searchBrokerForm.value.province },
      { 'key': 'brokerEffectiveOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchBrokerForm.value.effected_date) },
      { 'key': 'brokerExpiredOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchBrokerForm.value.expired_date) },
      { 'key': 'status', 'value': this.searchBrokerForm.value.status }
    ]
    /*Grid Narrow Search Start Here*/
    this.brokerNameId = this.searchBrokerForm.value.broker_name_id
    this.brokerCity = this.searchBrokerForm.value.city
    this.brokerProvince = this.searchBrokerForm.value.province
    this.brokerStatus = this.searchBrokerForm.value.status
    this.brokerEffDate = this.searchBrokerForm.value.effected_date;
    this.brokerExpDate = this.searchBrokerForm.value.expired_date
    if (this.brokerEffDate) {
      this.dateNameArray['brokerEffectiveOn'] = {
        year: this.brokerEffDate.date.year,
        month: this.brokerEffDate.date.month,
        day: this.brokerEffDate.date.day
      }
    } else {
      this.dateNameArray['brokerEffectiveOn'] = ''
    }
    if (this.brokerExpDate) {
      this.dateNameArray['brokerExpiredOn'] = {
        year: this.brokerExpDate.date.year,
        month: this.brokerExpDate.date.month,
        day: this.brokerExpDate.date.day
      }
    } else {
      this.dateNameArray['brokerExpiredOn'] = ''
    }
    if (this.dateNameArray['brokerEffectiveOn'] == '') {
      this.dateNameArray['brokerEffectiveOn'] = []
    }
    if (this.dateNameArray['brokerExpiredOn'] == '') {
      this.dateNameArray['brokerExpiredOn'] = []
    }
    /*Grid Narrow Search Start Here*/
    var url = BrokerApi.brokerListUrl;
    if (!$.fn.dataTable.isDataTable('#brokerListTable')) {
      this.dataTableService.jqueryDataTable('brokerListTable', url, 'full_numbers', this.columns, 5, true, false, 'lt', 'irp', undefined, [1, 'asc'], '', reqParam, '', undefined, [3, 4], this.searchBrokerAuthCheck[0].viewBroker, '', [1, 2, 3, 4])
    } else {
      this.dataTableService.jqueryDataTableReload("brokerListTable", url, reqParam)
    }

    $(window).scrollTop(0);

    this.companyService.getBrokerSearchData(this.searchBrokerForm.value)
    return false;

  }

  /**
   * View Broker Details
   * @param id 
   */
  viewEditBroker(id) {
    this.router.navigate(['/company/broker/edit', id])
  }

  /**
   * This function is used to filter records from Broker List Datatable
   */
  filterBrokerSearch(tableId: string) {
    this.getLowerSearch = true;
    this.getUpperSearch = false;
    var params = this.dataTableService.getFooterParams("brokerListTable")
    params[5] = { key: 'status', value: this.brokerStatus }
    var dateParams = [3, 4];
    var URL = BrokerApi.brokerListUrl;
    this.dataTableService.jqueryDataTableReload("brokerListTable", URL, params, dateParams)
  }

  /**
   * Reset Filter colums
   */
  resetListingFilter(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterBrokerSearch(tableId)
    $('#brokerListTable .icon-mydpremove').trigger('click');
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.searchBrokerForm.patchValue(datePickerValue);
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
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    if (event.reason == 2) {
      if (datePickerValue) {
        this.searchBrokerForm.patchValue(datePickerValue);
      }
    }

    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);

    }

  }

  changeFilterDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
      if (obj != null) {
        this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      }
    }

    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  resetSearchBrokerForm() {
    this.searchBrokerForm.reset();
    this.showBrokerList = false;
  }

  getCities() {
    var api = Constants.baseUrl + "/company-service/getAllCities";
    this.hmsDataServiceService.get(api).subscribe(data => {
      this.citiesList = data.result;
    });
  }

  getProvince() {
    var api = Constants.baseUrl + "/company-service/getAllProvince";
    this.hmsDataServiceService.get(api).subscribe(data => {
      this.provinceList = data.result;
    });
  }

  /**
   * filter the search on press enter
   * @param event 
   * @param tableId 
   */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.filterBrokerSearch(tableId);
    }
  }

  exportBrokerList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    var fileName = "Broker-List"
    this.recordLength = this.dataTableService.totalRecords
    if (this.getLowerSearch == true) {
      var params = this.dataTableService.getFooterParams("brokerListTable")
      var reqParamPlan =
        { "start": 0, "length": this.recordLength, "brokerIdAndName": params[0].value, "cityName": params[1].value, "provinceName": params[2].value, "brokerEffectiveOn": params[3].value, "brokerExpiredOn": params[4].value, "status": this.searchBrokerForm.value.status, 'paramApplication': paramApp }
    }
    else {
      var reqParamPlan =
        { "start": 0, "length": this.recordLength, "brokerIdAndName": this.searchBrokerForm.value.broker_name_id, "cityName": this.searchBrokerForm.value.city, "provinceName": this.searchBrokerForm.value.province, "brokerEffectiveOn": this.searchBrokerForm.value.effected_date, 'paramApplication': paramApp, "brokerExpiredOn": this.searchBrokerForm.value.expired_date, "status": this.searchBrokerForm.value.status }
    }
    var URL = BrokerApi.exportBrokerListUrl;
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFile(URL, reqParamPlan, fileName)
          } else {
            this.exportFile(URL, reqParamPlan, fileName)
          }
        }
      });
    } else {
      this.exportFile(URL, reqParamPlan, fileName)
    }
  }

  exportFile(URL, reqParamPlan, fileName) {
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataServiceService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loaderPlaceHolder = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loaderPlaceHolder = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataServiceService.b64toBlob(imagePath, docType);
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
      } else {
      }
    })
  }

  onKeyPress(event) {
    if (event.keyCode == 13) {
      this.searchBroker();
    }

  }
}