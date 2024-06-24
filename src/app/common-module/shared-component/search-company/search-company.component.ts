import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DatatableService } from '../../shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Rx';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HmsDataServiceService } from '../../shared-services/hms-data-api/hms-data-service.service'
import { CommonApi } from '../../common-api'
import { CardServiceService } from '../../../card-module/card-service.service'
import { CompanyService } from '../../../company-module/company.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormCanDeactivate } from '../../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CompanyApi } from '../../../company-module/company-api'
import { CurrentUserService } from '../../shared-services/hms-data-api/current-user.service'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';

@Component({
  selector: 'app-search-company',
  templateUrl: './search-company.component.html',
  styleUrls: ['./search-company.component.css'],
  providers: [DatatableService] //declare service used in the components
})

export class SearchCompanyComponent extends FormCanDeactivate implements OnInit {
  coNameAndId: any;
  currentUser: any;
  dpValueSelected: boolean = false;
  objSelect: any;
  toSend: any;
  selecteCoKey: any;
  selecteCoName: any;
  totalRecords
  selecteCoID: any;
  companyName5; any;
  @ViewChild('FormGroup')
  @ViewChildren(DataTableDirective)
  dtElem: QueryList<any>;
  datatableElements: DataTableDirective;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  searchCompanyOptions = []
  requestParams
  showCompanyRes: boolean;
  FormGroup: FormGroup;
  coId;
  companyField: boolean = false
  uftCompanySearch: boolean = false
  viewMode: boolean = false;
  companyDetailsByCoKey: any;
  serchCompanyNotFound: boolean = false;
  showPredectiveSearch: boolean = false;
  closePredctiveSearch: boolean = false
  editMode: boolean = false;
  activeIndex: number = 0;
  selectedCompany = '';
  setSelectedCompany = false;
  searchCompanyError = false;
  companyCard: boolean = false
  sendSearchReq: boolean = false
  currentRequest = null
  @Output() coIdEvent = new EventEmitter();// To get coIdEvent in Card-module General Information
  @Output() checkCompanyField = new EventEmitter();
  @Output() getCompanyName = new EventEmitter();
  @Output() getCompanyNameVal = new EventEmitter();
  @Output() keydownEvent = new EventEmitter();

  /* Columns for company datatable */
  columns = [{ title: "Company No.", data: 'coID' },
  { title: "Company Name", data: 'coName' },
  { title: "City", data: 'cityName' },
  { title: "Province", data: 'provinceName' },
  { title: "Business Type", data: 'businessTypeDesc' }
    , { title: "Status", data: 'status' }
  ]
  citiesList = [];
  provinceList = []
  businessTypeList = []
  token
  public companyDataRemote: RemoteData;
  public cityDataRemote: RemoteData;
  public cityDataRemoteLower: RemoteData;
  public provinceDataRemote: RemoteData;
  public provinceDataRemoteLower: RemoteData;
  cityName;
  cityNameLower;
  provinceNameLower;
  public isOpen: boolean = false;
  searchCardData: boolean = false;
  searchCompanyData: boolean = false;
  companyCokey;
  bussType: string = '';
  isAlberta;
  isQuikcard;
  isBothAccess;

  constructor(
    private dataTableService: DatatableService, //call DataTable srevice to intailize datatable
    private hmsDataServiceService: HmsDataServiceService,
    private cardService: CardServiceService,
    private currentUserService: CurrentUserService,
    private route: ActivatedRoute,
    private completerService: CompleterService,
    private companyService: CompanyService,
    private router: Router,
  ) {
    super();
    this.token = currentUserService.token;
    var url = window.location.href
    if (url.indexOf("company") >= 0) {
      this.companyField = true
    } else {
      this.companyField = false
    }

    if (url.indexOf("unitFinancialTransaction") >= 0) {
      this.uftCompanySearch = true
    } else {
      this.uftCompanySearch = false
    }

    /* receive company and id from card module when card is in view mode */
    cardService.getPrefferedLanguage.subscribe((value) => {

      this.companyCokey = value.companyCoKey
      this.viewMode = true
      this.showPredectiveSearch = true
      this.editMode = true

      this.FormGroup.patchValue({ searchCompany: value.coName + ' / ' + value.companyId });
    })
    /* recieve edit mode true when csrd is in edit mode */
    cardService.setEditModeForCompany.subscribe((value) => {
      if (value) {
        this.editMode = true
        this.showPredectiveSearch = true
      }
    })
    cardService.resetCompanyName.subscribe((value) => {
      if (value) {
        this.FormGroup.reset();
        this.selecteCoName = undefined;
        this.coNameAndId = undefined
      }
    })
    this.currentUserService.loggedInUserVal.subscribe(val => {
      if (val) {
        this.currentUser = val
        this.isAlberta = this.currentUser.businessType.isAlberta // Log #0180358 resolved 
        this.isQuikcard = this.currentUser.businessType.isQuikcard
        this.isBothAccess = this.currentUser.businessType.bothAccess
        this.getPredictiveCompanySearchData(completerService);
      }
    })
    /* receive CoID from datatable service */
    this.coId = dataTableService.coId;
    dataTableService.coIdChange.subscribe((value) => {
      this.coId = value;
      this.coIdEvent.emit(this.coId)
    });

    dataTableService.coKeyChange.subscribe((value) => {
      let submitData = {
        "coKey": value
      }
      this.hmsDataServiceService.postApi(CommonApi.getCompanyDetailByCompanyCoKey, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.companyDetailsByCoKey = data.result
          this.getCompanyDetails(this.companyDetailsByCoKey.coName + ' / ' + this.companyDetailsByCoKey.coKey + ' / ' + this.companyDetailsByCoKey.coId)
          this.hmsDataServiceService.OpenCloseModal("closeSearchCompany")
          let hasValue = true
          this.getCompanyNameVal.emit(this.companyName5)
          this.checkCompanyField.emit(hasValue)
        } else {
          /* failure Message here-------------- */
        }
        error => {          
        }

      })
    });

    this.getCities(); // get list of all Cities
    this.getProvince(); // get list of all Province
    this.getBusinessType(); // get list of all Business Type

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
    //Predictive Company Search Upper
  }

  getPredictiveCompanySearchData(completerService) {
    
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        var t = term;
        let queryParam = t
        var newResult = t.substring(0, t.lastIndexOf("/"));
        if (newResult) {
          queryParam = newResult
        }
        return CompanyApi.getAllPredectiveCompany + `/${queryParam}`;
      });
      this.companyDataRemote.dataField('result');
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return CompanyApi.getPredectiveCompany + '/' + businessTypeKey + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    }
  }
  public invokeAutoSuggest(ev, event) {
    this.sendSearchReq = true
    if (38 === ev) {
      return this.prevActiveMatch();
    }
    if (40 === ev) {
      return this.nextActiveMatch();
    }
    if (13 === ev) {

      if (this.selectedCompany) {
        this.setSelectedCompany = true;
        this.getCompanyDetails(this.selectedCompany);
        this.searchCompanyError = false;
        this.selectedCompany = '';
      } else {
        this.selectedCompany = '';
        this.getCompanyDetails('');
        this.setSelectedCompany = false;
      }
    }
    if (9 === ev) {
      if (this.setSelectedCompany === false) {
        this.searchCompanyError = true;
      }
    }
  }

  onTabKey(e) {
    this.showPredectiveSearch = false;
    this.searchCompanyOptions = [];
    if (this.setSelectedCompany === false) {
      this.searchCompanyError = true;
    }
  }

  onBlurKey(e) {
    this.showPredectiveSearch = false;
    this.searchCompanyOptions = [];
    if (this.setSelectedCompany === false) {
      this.searchCompanyError = true;
    } else { }
  }


  public nextActiveMatch() {
    let company;
    this.activeIndex = this.activeIndex < this.searchCompanyOptions.length - 1 ? ++this.activeIndex : this.activeIndex;
    company = this.searchCompanyOptions[this.activeIndex];
    this.selectedCompany = company.coName + ' / ' + company.coKey + ' / ' + company.coId
  }

  public prevActiveMatch() {
    let company;
    this.activeIndex = this.activeIndex > 0 ? --this.activeIndex : 0;
    company = this.searchCompanyOptions[this.activeIndex];
    this.selectedCompany = company.coName + ' / ' + company.coKey + ' / ' + company.coId
  }

  ngOnInit(): void {
    setInterval(() => {
      if (this.sendSearchReq) {
        this.getCompanyByPredictiveSearch()
      }
    }, 1000);

    this.showCompanyRes = false
    this.FormGroup = new FormGroup({
      searchCompany: new FormControl(),
    })

    $(document).on('mouseover', '#searchCompany', function () {
      var val = $(this).val().toString()
      if (val != "") {
        $(this).attr('title', val);
      }
    })

    this.route.queryParams.subscribe(params => {
      if (params.companyId) {
        this.companyCard = true
        let submitInfo = {
          "coKey": params.companyId
        }
        this.hmsDataServiceService.postApi(CommonApi.getCompanyDetailByCompanyCoKey, submitInfo).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            var company = data.result;

            this.getCompanyDetails(company.coName + ' / ' + company.coKey + ' / ' + company.coId)
          }
          else {
          }
          error => {          
          }
        })
      }
    })
    let url = window.location.href
    if (this.cardService.searchedCardCompanyName && url.indexOf("searchCard") >= 0) {
      this.companyName5 = this.cardService.searchedCardCompanyName
      this.searchCardData = true
    }
    else if (this.companyService.searchedCompanyName && this.companyService.searchedCompanyId && url.indexOf("company") >= 0) {
      this.companyName5 = this.companyService.searchedCompanyName + ' / ' + this.companyService.searchedCompanyId
      this.searchCompanyData = true
    }
    else {
      this.searchCardData = false
      this.searchCompanyData = true
      this.companyName5 = ""
      this.FormGroup.reset()
    }
  }

  getAllCompanyList() {
    const that = this;
    var self = this
    var tableId = "company-search"
    var URL = CommonApi.companySearchUrl
    if (this.isQuikcard) {
      this.bussType = "Quikcard"
    } else if (this.isAlberta) {
      this.bussType = "AB Gov."
    } else if (this.isBothAccess) {
      this.bussType = "Quikcard"
    } else {
      this.bussType = ''
    }
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '2' },
    { 'key': 'searchType', 'value': 'l' }, { 'key': 'businessTypeDesc', 'value': this.bussType }]
    var tableActions = []


    if (!$.fn.dataTable.isDataTable('#' + tableId)) {
      this.dataTableService.jqueryDataTable(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, '', '', '', [1, 2, 3, 4, 5])
    } else {
      this.dataTableService.jqueryDataTableReload('company-search', URL, reqParam)
    }
    $(document).on('click', '#company-search .view-ico', function () {
      var id = $(this).data('id')
    })
  }

  callFromService() {
  }

  ngAfterViewInit(): void {
    var self = this;
    this.dataTableService.columnFilter(this.dtElem, "company-table")
  }

  getCompanyByPredictiveSearch() {
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
      this.currentRequest = null;
    }
    let value = false
    this.checkCompanyField.emit(value)
    this.showPredectiveSearch = true
    var self = this
    if (this.FormGroup.value.searchCompany == "") {
      this.searchCompanyOptions = []
      this.serchCompanyNotFound = false
      return false
    } else {
      let requiredInfo = {
        "coId": this.FormGroup.value.searchCompany
      }
      this.currentRequest = this.hmsDataServiceService.postApi(CommonApi.getCompanyWithPlansByCoIdOrCoName, requiredInfo).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.searchCompanyOptions = data.result.data
        } else if (data.code == 404 && data.status === "NOT_FOUND") {
          this.searchCompanyOptions = []
          this.serchCompanyNotFound = true
          if (!this.editMode) {
            let value = true
            this.checkCompanyField.emit(value)
          }
        }
        else {
          this.searchCompanyOptions = []
        }
        error => {         
        }
      })
    }
    this.sendSearchReq = false
  }

  closePredectiveSearch(eve) {
    var target = eve.explicitOriginalTarget || document.activeElement;
    this.serchCompanyNotFound = false
    this.showPredectiveSearch = true
    this.closePredctiveSearch = true
  }

  getCompanyDetails(companyNameWithId) {
    if (companyNameWithId === '') {
      let value = false;
      this.checkCompanyField.emit(value);
      this.coIdEvent.emit('')
      this.getCompanyName.emit('')
      this.FormGroup.patchValue({});
    } else {
      this.showPredectiveSearch = true
      this.serchCompanyNotFound = false
      this.searchCompanyOptions = []
      let value = true
      this.checkCompanyField.emit(value)
      if (companyNameWithId.includes('/')) {
        var companyValues = companyNameWithId.split(' / ')
        this.coIdEvent.emit(companyValues[1])
        this.getCompanyName.emit(companyNameWithId)

        if (this.searchCardData) {
          this.FormGroup.patchValue({ searchCompany: companyValues[0] + ' / ' + companyValues[1] });

          localStorage.setItem("coNameId", companyValues[0] + ' / ' + companyValues[1])
        } else {
          if (companyValues[2]) {
            this.FormGroup.patchValue({ searchCompany: companyValues[0] + ' / ' + companyValues[2] });
            localStorage.setItem("coNameId", companyValues[0] + ' / ' + companyValues[2])
          } else {
            if (companyValues[1]) {
              this.FormGroup.patchValue({ searchCompany: companyValues[0] + ' / ' + companyValues[1] });
              localStorage.setItem("coNameId", companyValues[0] + ' / ' + companyValues[1])
            }
            else {
              this.FormGroup.patchValue({ searchCompany: companyValues[0] });
              localStorage.setItem("coNameId", companyValues[0])
            }
          }
        }
      } else {
        var companyValues = companyNameWithId
        this.getCompanyName.emit(companyNameWithId);
        this.FormGroup.patchValue({ searchCompany: companyValues });
      }
      this.companyDetailsByCoKey = []
      this.selectedCompany = '';
      this.setSelectedCompany = true;
      this.searchCompanyError = false;
    }
  }

  /**
   * Get List of cities
   */
  getCities() {
    var URL = CompanyApi.getAllCityUrl;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      this.citiesList = data.result;
    });
  }

  /**
   * Get List of Province
   */
  getProvince() {
    var URL = CompanyApi.getAllProvinceUrl;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      this.provinceList = data.result;
    });
  }

  /**
   * Get List of BusinessType
   */
  getBusinessType() {
    var URL = CompanyApi.getBusinessTypeUrl;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      this.businessTypeList = data.result;
    });
  }

  /**
   * Filter Companies based on Column Search
   */
  getCompanyListByGridFilteration(tableId: string) {
    var appendExtraParam = { 'key': 'searchType', 'value': 'l' }
    let params = this.dataTableService.getFooterParamsCompanySearchTable(tableId, appendExtraParam)
    var url = CommonApi.companySearchUrl
    var tableActions = []
    if (!$.fn.dataTable.isDataTable('#' + tableId)) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', params, tableActions, undefined)
    } else {
      this.dataTableService.jqueryDataTableReload('company-search', url, params)
    }
  }

  resetCompanySearch() {
    this.dataTableService.resetTableSearch();
    this.getCompanyListByGridFilteration("company-search")
  }

  onCompanyNameSelected(selected: CompleterItem) {
    if (selected) {
      this.dpValueSelected = true;
      this.objSelect = selected.originalObject;
      this.coNameAndId = selected.originalObject.coNameAndId
      localStorage.setItem("coNameId", this.coNameAndId)
      this.selecteCoName = selected.originalObject.coName
      this.selecteCoKey = selected.originalObject.coKey
      this.selecteCoID = selected.originalObject.coId
      this.getCompanyDetails(this.selecteCoName + ' / ' + this.selecteCoKey + ' / ' + this.selecteCoID)
      this.getCompanyNameVal.emit(this.coNameAndId)
      var self = this;
      if (this.selecteCoName != undefined && this.selecteCoID != undefined && this.selecteCoName != '') {
        $(document).on('mouseover', '#searchCompany', function () {
          var val = $(this).val().toString()
          if (val != "") {
            $(this).attr('title', val);
          }

        })
      }
    } else {
      this.dpValueSelected = false;
      this.selecteCoName = ""
      this.getCompanyDetails(this.coNameAndId)
      this.getCompanyNameVal.emit(this.coNameAndId)
    }
  }

  closeModal() {
    this.dataTableService.resetTableSearch();
  }

  onBlurMethod() {
    
    var self = this
    if (this.dpValueSelected != true) {
      $(document).on('mouseover', '#searchCompany', function () {
        $(this).removeAttr('title');
      })
      this.toSend = this.companyName5;
      this.getCompanyDetails(this.toSend);
      this.getCompanyNameVal.emit(this.toSend)
    }
    else {
      if (this.selecteCoName) {
        this.getCompanyDetails(this.selecteCoName + ' / ' + this.selecteCoKey + ' / ' + this.selecteCoID)
        this.getCompanyNameVal.emit(this.coNameAndId)
      }
    }
  }

  redirectCompanyList() {
    this.router.navigate([]).then(result => { window.open('company/view/' + this.companyCokey, '_blank'); });

  }

  keydownEventAction(event) {
    if (event.keyCode == 13) {
      setTimeout(() => {
        this.keydownEvent.emit(event);
      }, 100);
    }
  }

}