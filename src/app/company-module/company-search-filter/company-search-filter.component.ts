import { Component, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
/** For Common Date Picker */
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { TranslateService } from '@ngx-translate/core';

/** For Services */
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CompanyApi } from '../company-api'
import { CompanyService } from '../company.service'
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';

import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { SearchCompanyComponent } from '../../common-module/shared-component/search-company/search-company.component'
import { CardServiceService } from '../../card-module/card-service.service';
import { Observable } from 'rxjs/Observable';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { HttpClient } from "@angular/common/http";
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { debug } from 'util';

@ViewChild('openCloseExample')

@Component({
  selector: 'app-company-search-filter',
  templateUrl: './company-search-filter.component.html',
  styleUrls: ['./company-search-filter.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService]
})

export class CompanySearchFilterComponent implements OnInit {
  companyName: any;
  companyNumber: any;
  showHideBusinessTypeDropDown: boolean = false;
  currentUser: any;
  showLoader: boolean = false;
  companyListTableVal: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  showCompanyList: boolean = false; //Enable true when we need to show company list
  public filterCompany: FormGroup;
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  blobUrl;
  columns = [];
  citiesList = [];
  provinceList = [];
  businessTypeList = [];
  companyCoId;
  companyCoName;
  ObservableObj;
  getLowerSearch: boolean
  getUppersearch: boolean
  businessTypeLower;
  dateNameArray = {};
  checkvalue: boolean = true;
  error: any;
  recordLength;
  companyStatusList = ["Active", "Inactive", "Suspended", "Grace Period"]; // Log #1171: Grace period option added as per ticket
  public isOpen: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  actionColNo
  mainCompanyArray = [{
    "searchCompany": 'T',
    "addCompany": 'F',
    "viewCompany": 'F'
  }]
  public companyDataRemote: RemoteData;
  public cityDataRemote: RemoteData;
  public cityDataRemoteLower: RemoteData;
  public provinceDataRemote: RemoteData;
  public provinceDataRemoteLower: RemoteData;
  public businessTypeData: CompleterData;
  selectedBusinessTypeValue: any;
  selectedComapnyStatusValue: any;
  cokey
  companyCity
  companyProvince
  companyStatus

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private router: Router,
    private route: ActivatedRoute,
    private exDialog: ExDialog,
    private cardService: CardServiceService,
    private translate: TranslateService,
    private completerService: CompleterService,
    private http: HttpClient,
    private currentUserService: CurrentUserService,
    private companyService: CompanyService) {
    this.error = { isError: false, errorMessage: '' };

    //Predictive Company Search Upper
    this.companyDataRemote = completerService.remote(
      null,
      "coName",
      "coNameAndId"
    );
    this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.companyDataRemote.urlFormater((term: any) => {
      return CompanyApi.getPredectiveCompany + `/${term}`;
    });

    this.companyDataRemote.dataField('result');

    //Predictive City Search Upper
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

    //Predictive Province Search Upper
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

    //Predictive Province Search Lower
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
    this.showLoader = true;
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.showLoader = false;
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['SCO'].concat(this.currentUserService.authChecks['VCO'])
        this.getAuthCheck(checkArray).then(res => {
          this.companySearchDataTableInitialize();
        });
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.showLoader = false;
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['SCO'].concat(this.currentUserService.authChecks['VCO'])
        this.getAuthCheck(checkArray).then(res => {
          this.companySearchDataTableInitialize();
        });
      })
    }

    this.filterCompany = new FormGroup({
      'companyName': new FormControl(),
      'companyCity': new FormControl(),
      'companyProvince': new FormControl(),
      'companyBusinessType': new FormControl(),
      'effectedDate': new FormControl(),
      'terminatedDate': new FormControl(),
      'companyStatus': new FormControl(),
    });

    var self = this
    $(document).on('mouseover', '#company-list .view-ico', function () {
      $(this).attr('title', 'View');
    })

    $(document).on('click', '#company-list > tbody > tr', function (e) {
      var data = self.currentUserService.companySelectedRowData
      var cokey = data.coKey;
      self.cokey = cokey
      self.currentUserService.isCompanySearch = true;
      self.companyService.isBackCompanySearch = true;
      self.ViewCompanyPage()
    })

    $(document).on('keydown', '#company-list .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })

    // to resolve navigation Issue(HMS point no 536) in company-list Table
    this.dataTableService.companyListTableEmitter.subscribe((val) => {
      if(val == 200){
        this.companyListTableVal = false;
      } else {
        this.companyListTableVal = true;
      }
    })
  }

  ngAfterViewInit() {
    this.currentUserService.getUserRoleId().then(res => {
      this.currentUser = this.currentUserService.currentUser;
      this.showHideBusinessTypeDropDown = this.currentUserService.userBusinnesType.bothAccess;
      this.getBusinessType(); // get list of all Business Type
    })
  }

  ngOnDestroy() {
    if (this.companyService.isBackCompanySearch == false) {
      this.companyService.companySearchedData = ''
      this.companyService.searchedCompanyName = ''
      this.companyService.searchedCompanyId = ''
      this.companyCoName = ''
      this.companyCoId = ''
      this.filterCompany.reset();
    }
  }

  ViewCompanyPage() {
    if(!this.companyListTableVal){
      this.router.navigate(['/company/view/' + this.cokey]);
    }
  }

  /**
   * Initialize the company datatable on init
   */
  companySearchDataTableInitialize() {
    var self = this
    var tableId = "company-list"
    var URL = CompanyApi.companySearchUrl;
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }, { 'key': 'searchType', 'value': 'l' }]
    this.ObservableObj = Observable.interval(.1000).subscribe(x => {
      if (this.checkvalue = true) {
        if ('company.company-search.businessType' == this.translate.instant('company.company-search.businessType')) {
        } else {
          this.columns = [
            { title: this.translate.instant('company.company-search.company-no.'), data: 'coID' },
            { title: this.translate.instant('company.company-search.name'), data: 'coName' },
            { title: this.translate.instant('company.company-search.city-name'), data: 'cityName' },
            { title: this.translate.instant('company.company-search.province'), data: 'provinceName' },
            { title: this.translate.instant('company.company-search.effective-date'), data: 'effectiveOn' },
            { title: this.translate.instant('company.company-search.terminated-date'), data: 'coTerminatedOn' },
            { title: this.translate.instant('company.company-search.businessType'), data: 'businessTypeDesc' },
          ];
          var dateCols = ['effectiveOn', 'coTerminatedOn'];
          this.checkvalue = false;
          this.ObservableObj.unsubscribe();
          if (this.companyService.companySearchedData && this.companyService.isBackCompanySearch) {
            this.filterCompany.patchValue(this.companyService.companySearchedData)
            this.companyCoName = this.companyService.searchedCompanyName
            this.companyCoId = this.companyService.searchedCompanyId
            this.companyService.isBackCompanySearch = false
            this.onSubmit(this.filterCompany)
          } else {

            this.filterCompany.reset();
            this.filterCompany.controls['companyName'].setValue('')
            this.companyCoName = ''
            this.companyService.companySearchedData = ''
            this.companyService.searchedCompanyName = ''
            this.companyService.searchedCompanyId = ''
            this.companyCoId = ''
          }
        }
      }
      this.route.queryParams.subscribe((params) => {
        if (params['type'] == 'U') {
          this.onSubmit(this.filterCompany);
        }
      });
    });
  }

  /**
   * Serach Company List on press enter
   * @param event 
   */
  onKeyPressEvent(event) {
    if (event.keyCode == 13) {
      this.onSubmit(this.filterCompany);
    }
  }

  /**
   * Search Comapny List
   */
  search() {
    var params = this.dataTableService.getFooterParams("example")
    var URL = CompanyApi.getAllCompanyByPaginationUrl;
    this.dataTableService.jqueryDataTableReload("company-list", URL, params)
  }

  /* Get List of cities */
  getCities() {
    var URL = CompanyApi.getAllCityUrl;
    this.hmsDataServiceService.get(URL).subscribe(data => {
      this.citiesList = data.result;
    });
  }

  /* Get List of Province */
  getProvince() {
    var URL = CompanyApi.getAllProvinceUrl;
    this.hmsDataServiceService.get(URL).subscribe(data => {
      this.provinceList = data.result;
    });
  }

  /* Get List of BusinessType */
  getBusinessType() {
    this.showHideBusinessTypeDropDown = this.currentUserService.userBusinnesType.bothAccess;
    var businessType = this.currentUserService.userBusinnesType.bothAccess
    if (businessType) {
      this.selectedBusinessTypeValue = '' //Default Business type empty for the both access
    }
    if (this.currentUserService.userBusinnesType.isQuikcard) {
      this.selectedBusinessTypeValue = this.currentUserService.userBusinnesType[0].businessTypeDesc;
    } if (this.currentUserService.userBusinnesType.isAlberta) {
      this.selectedBusinessTypeValue = this.currentUserService.userBusinnesType[0].businessTypeDesc;
    }

    //Predictive Company Search Upper
    this.businessTypeData = this.completerService.local(
      this.currentUser.businessType,
      "businessTypeDesc",
      "businessTypeDesc"
    );
  }

  onBusinessTypeSelected(selected: CompleterItem) {
  }

  onCompanyStatusSelected(selected: CompleterItem) {
  }

  getCompanyName(event) {
    var companyValues = event.split(' / ')
    if (companyValues[2]) {
      this.companyCoId = companyValues[2]
    } else {
      this.companyCoId = companyValues[1]
    }

    this.companyCoName = companyValues[0]
  }

  /**
   * Call On Submit Company Serach Form
   * @param filterCompany 
   */
  onSubmit(filterCompany) {
    this.getUppersearch = true;
    this.getLowerSearch = false;
    if (this.companyCoName != undefined && this.companyCoName != '') {
      var regex = /^[0-9]+$/;
      if (this.companyCoName.match(regex)) {
        this.companyCoId = this.companyCoName;
        this.companyCoName = '';
      }
    }
    this.showCompanyList = true;

    if (filterCompany.value.companyBusinessType == undefined || filterCompany.value.companyBusinessType == null) {
      filterCompany.value.companyBusinessType = this.selectedBusinessTypeValue;
    }
    var reqParam = [
      { 'key': 'coId', 'value': this.companyCoId },
      { 'key': 'coName', 'value': this.companyCoName },
      { 'key': 'provinceName', 'value': filterCompany.value.companyProvince },
      { 'key': 'cityName', 'value': filterCompany.value.companyCity },
      { 'key': 'effectiveOn', 'value': filterCompany.value.effectedDate != null ? this.changeDateFormatService.convertDateObjectToString(filterCompany.value.effectedDate) : '' },
      { 'key': 'coTerminatedOn', 'value': filterCompany.value.terminatedDate != null ? this.changeDateFormatService.convertDateObjectToString(filterCompany.value.terminatedDate) : '' },
      { 'key': 'status', 'value': (filterCompany.value.companyStatus == 'Grace Period' ? 'GracePeriod' : filterCompany.value.companyStatus) },
      { 'key': 'businessTypeDesc', 'value': filterCompany.value.companyBusinessType },
    ]
    this.route.queryParams.subscribe((params) => {
      if (params['type'] == 'U') {
        reqParam.push({ 'key': 'isDashboard', 'value': 'T' }, { 'key': 'status', 'value': "Suspended" }, );
      }
    });
    /**
     * Start Narrow Search Start
     */
    this.companyNumber = this.companyCoId;
    this.companyName = this.companyCoName;
    this.companyCity = filterCompany.value.companyCity
    this.companyProvince = filterCompany.value.companyProvince
    this.businessTypeLower = filterCompany.value.companyBusinessType
    this.companyStatus = (filterCompany.value.companyStatus == 'Grace Period' ? 'GracePeriod' : filterCompany.value.companyStatus)
    if (filterCompany.value.effectedDate) {
      this.dateNameArray["effectiveOn"] = {
        year: filterCompany.value.effectedDate.date.year,
        month: filterCompany.value.effectedDate.date.month,
        day: filterCompany.value.effectedDate.date.day
      };
    }
    else {
      this.dateNameArray["effectiveOn"] = ''
    }
    if (filterCompany.value.terminatedDate) {
      this.dateNameArray["terminatedOn"] = {
        year: filterCompany.value.terminatedDate.date.year,
        month: filterCompany.value.terminatedDate.date.month,
        day: filterCompany.value.terminatedDate.date.day
      };
    } else {
      this.dateNameArray["terminatedOn"] = ''
    }
    if (this.dateNameArray["effectiveOn"] == '') {
      this.dateNameArray["effectiveOn"] = []
    }
    if (this.dateNameArray["terminatedOn"] == '') {
      this.dateNameArray["terminatedOn"] = []
    }
    /**
     * End Narrow Search Start
     */


    var obj = { key: 'searchType', value: 'u' };
    reqParam.push(obj);
    var URL = CompanyApi.companySearchUrl;
    var params = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }]
    var tableId = "company-list"
    if (!$.fn.dataTable.isDataTable('#company-list')) {
      this.dataTableService.companySearchDataTable(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [4, 5], this.mainCompanyArray[0].viewCompany, [], [1, 2, 3, 4, 5, 6])

    } else {
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
    }
    $(window).scrollTop(0);
    this.companyService.getCompanySearchData(this.filterCompany.value, this.companyCoName, this.companyCoId)
    return false;
  }

  /**
   * Filter Comapany Saerch List
   * @param tableId 
   */
  filterCompanySearch(tableId: string) {
    this.getUppersearch = false
    this.getLowerSearch = true
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable("company-list", obj)
    if (params[6].value == '') {
      params[6].value = this.selectedBusinessTypeValue;
    }
    params[8] = { key: 'status', value: this.companyStatus };
    var dateParams = [4, 5]
    var URL = CompanyApi.companySearchUrl;
    this.dataTableService.jqueryDataTableReload("company-list", URL, params, dateParams)
  }

  /**
   * Change Date Format For Date Picker
   * @param event 
   * @param frmControlName 
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && event.value != null && event.value != '') {
      // Set Date Picker Value
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
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
    }
    if (event.reason == 2) {
      this.filterCompany.patchValue(datePickerValue);
    }
  }
  /**
   * Change Date Picker For Date Picker
   * @param event 
   * @param frmControlName 
   */
  changeFilterDateFormat(event, frmControlName) {
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

  /**
   * Reset Comapny Serach Form
   */
  resetSearchForm() {
    this.filterCompany.reset();
    this.companyCoId = '';
    this.companyCoName = ''
    this.cardService.resetCompanyName.emit(true)
    this.showCompanyList = false;
  }

  /**
   * Reset Comapany List Filter
   */
  resetListingFilter() {
    this.dataTableService.resetTableSearch();
    this.filterCompanySearch("company-list")
    $('#company-list .icon-mydpremove').trigger('click');
  }

  getAuthCheck(claimChecks) {
    let promise = new Promise((resolve, reject) => {
      let authCheck = []
      if (this.currentUser.isAdmin == 'T') {
        this.mainCompanyArray = [{
          "searchCompany": 'T',
          "addCompany": 'T',
          "viewCompany": 'T'
        }]
        resolve();
      } else {
        for (var i = 0; i < claimChecks.length; i++) {
          authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
        }
        this.mainCompanyArray = [{
          "searchCompany": authCheck['SCO75'],
          "addCompany": authCheck['SCO76'],
          "viewCompany": authCheck['SCO77']
        }]
        resolve();
      }

    });
    return promise;
  }

  /**
 * filter the search on press enter
 * @param event 
 * @param tableId 
 */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.filterCompanySearch(tableId);
    }
  }

  /**
   * Call on click export company list
   */
  exportCompanyList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    this.recordLength = this.dataTableService.totalRecords
    if (this.getLowerSearch == true) {
      var params = this.dataTableService.getFooterParams("company-list")
      var reqParamPlan =
        {
          "start": 0, "length": this.recordLength, 'coId': params[0].value, 'coName': params[1].value, 'provinceName': params[3].value, 'cityName': params[2].value, 'effectiveOn': params[4].value, 'coTerminatedOn': params[5].value,
          'businessTypeDesc': params[6].value, searchType: 'l', 'paramApplication': paramApp
        }
    }
    else {
      reqParamPlan =
        { "start": 0, "length": this.recordLength, 'coId': this.companyCoId, 'coName': this.companyCoName, 'provinceName': this.filterCompany.value.companyProvince, 'cityName': this.filterCompany.value.companyCity, 'effectiveOn': this.filterCompany.value.effectedDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterCompany.value.effectedDate) : '', 'coTerminatedOn': this.filterCompany.value.terminatedDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterCompany.value.terminatedDate) : '', 'businessTypeDesc': this.filterCompany.value.companyBusinessType, searchType: 'u', 'paramApplication': paramApp }
    }
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    var companyURL = CompanyApi.exportCompanySearchUrl;
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFile(companyURL, reqParamPlan)
          } else {
            this.exportFile(companyURL, reqParamPlan)
          }
        }
      });
    } else {
      this.exportFile(companyURL, reqParamPlan)
    }
  }

  /**
   * Api call for export the company list
   * @param URL 
   * @param reqParamPlan 
   */
  exportFile(URL, reqParamPlan) {
    this.showLoader = false
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
          a.download = "Company-excel" + todayDate;
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

}


