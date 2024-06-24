import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CompanyApi } from '../../company-module/company-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../company-module/company.service';
import { RemoteData, CompleterService, CompleterData } from 'ng2-completer';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';


@Component({
  selector: 'app-groups-missing-information',
  templateUrl: './groups-missing-information.component.html',
  styleUrls: ['./groups-missing-information.component.css'],
  providers: [ChangeDateFormatService, CompanyService]

})
export class GroupsMissingInformationComponent implements OnInit {
  companyListColumns = []
  observableCompanyList;
  isSearch: boolean = false;
  dateNameArray = {};
  public filterCompany: FormGroup;
  getLowerSearch: boolean;
  getUppersearch: boolean;
  companyCoName;
  companyCoId;
  showCompanyList: boolean = false; //Enable true when we need to show company list
  selectedBusinessTypeValue: any;
  companyName: any;
  companyNumber: any;
  companyCity;
  companyProvince;
  companyStatus;
  businessTypeLower;
  columns = [];
  mainCompanyArray = [{
    "searchCompany": 'T',
    "addCompany": 'F',
    "viewCompany": 'F'
  }];
  public mgiCityDataRemote: RemoteData;
  public mgiProvinceDataRemote: RemoteData;
  public businessTypeData: CompleterData;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public isOpen: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  currentUser: any;
  showHideBusinessTypeDropDown: boolean = false;


  constructor(public translate: TranslateService,
    public dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService) { 


    //Predictive City Search Lower
    this.mgiCityDataRemote = completerService.remote(
      null,
      "cityName",
      "cityName"
    );
    this.mgiCityDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.mgiCityDataRemote.urlFormater((term: any) => {
      return CompanyApi.getCities + `/${term}`;
    });
    this.mgiCityDataRemote.dataField('result');


    //Predictive Province Search Lower
    this.mgiProvinceDataRemote = completerService.remote(
      null,
      "provinceName",
      "provinceName"
    );
    this.mgiProvinceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.mgiProvinceDataRemote.urlFormater((term: any) => {
      return CompanyApi.getProvince + `/${term}`;
    });
    this.mgiProvinceDataRemote.dataField('result');
    }


  ngOnInit() {
    this.filterCompany = new FormGroup({
      'companyName': new FormControl(),
      'companyCity': new FormControl(),
      'companyProvince': new FormControl(),
      'companyBusinessType': new FormControl(),
      'effectedDate': new FormControl(),
      'terminatedDate': new FormControl(),
      'companyStatus': new FormControl(),
    });
    this.currentUser = this.currentUserService.currentUser
    if (this.currentUser != undefined) {
      this.businessTypeData = this.completerService.local(
        this.currentUser.businessType,
        "businessTypeDesc",
        "businessTypeDesc"
      );
    }
    this.showComapnyListonMissingGroupInfoTile();
  }

  showComapnyListonMissingGroupInfoTile() {
    this.observableCompanyList = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.companyListColumns = [
          { title: this.translate.instant('company.company-search.company-no.'), data: 'coID' },
          { title: this.translate.instant('company.company-search.name'), data: 'coName' },
          { title: this.translate.instant('company.company-search.city-name'), data: 'cityName' },
          { title: this.translate.instant('company.company-search.province'), data: 'provinceName' },
          { title: this.translate.instant('company.company-search.effective-date'), data: 'effectiveOn' },
          { title: this.translate.instant('company.company-search.terminated-date'), data: 'coTerminatedOn' },
          { title: this.translate.instant('company.company-search.businessType'), data: 'businessTypeDesc' },
        ]
        this.getMissingCompanyList()
        this.observableCompanyList.unsubscribe();
      }
    });
  }

  getMissingCompanyList() {
    let missingCompReq = [
      { 'key': 'coId', 'value': '' },
      { 'key': 'coName', 'value': '' },
      { 'key': 'coTerminatedOn', 'value': '' },
      { 'key': 'businessTypeDesc', 'value': '' },
      { 'key': 'searchType', 'value': 'l'}
    ]
    let tableActions = [
    ]
    var url = CompanyApi.companySearchUrl;
    let tableId = "missingGroupInformationList"
    if (!$.fn.dataTable.isDataTable('#missingGroupInformationList')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.companyListColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', missingCompReq, tableActions, [], [4, 5], '', [], [1, 2, 3, 4, 6])
    } else {
      if (this.isSearch) {
        this.missingGroupInfoSearch()
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, missingCompReq)
      }
    }
    return false;
  }

  missingGroupInfoSearch(tableId = null) {
    this.isSearch = true
    var obj = { key: 'searchType', value: 'l' };
    let dateParams = [4, 5];
    var footerParam = this.dataTableService.getFooterParamsCompanySearchTable("missingGroupInformationList", obj)
    this.dataTableService.jqueryDataTableReload("missingGroupInformationList", CompanyApi.companySearchUrl, footerParam, dateParams)
  }

  /**
  * Change Date Picker For Date Picker
  * @param event 
  * @param frmControlName 
  */
  changeMissingFilterDateFormat(event, frmControlName) {
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
   * Filter Comapany Search List
   * @param tableId 
   */

    resetMissingGroupInfo() {
      this.dataTableService.resetTableSearch();
      this.missingGroupInfoSearch();
      this.isSearch = false
    }

}
