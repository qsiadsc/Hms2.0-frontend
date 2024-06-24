import { Component, OnInit, Input, ViewChildren, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ServiceProviderApi } from '../service-provider-api';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../common-module/Constants';
import { Observable } from 'rxjs/Rx';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ServiceProviderService } from '../serviceProvider.service'
@Component({
  selector: 'app-search-service-provider',
  templateUrl: './search-service-provider.component.html',
  styleUrls: ['./search-service-provider.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, DatatableService, TranslateService]
})

export class SearchServiceProviderComponent implements OnInit {
  statusL: string;
  firstName: any;
  lastName: any;
  postalCode: any;
  licenseNumber: any;
  speciality: any;
  disciplineKey: any;
  selectedPostalCodeCd: any;
  showLoader: boolean = false;
  showSearchButton: boolean = false;
  addObservable: any;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  searchServiceProviderForm: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  claimType = [];//array for claim type List
  postalCodeList = [];
  selectedItems = [];
  dropdownSettings = {};
  showServiceProviderSearchTable: boolean = false
  checkServiceProvider: boolean = true
  hasDiscipline: boolean = false
  columns = []
  ObservableClaimObj;
  specialityList = [];
  currentUser: any;
  dateNameArray = {}
  specialityListForGrid = []
  selectedGridItems = []
  postalCodeVal
  ACTIVE;
  INACTIVE;
  selectedDiscipline

  serviceProviderChecks = [{
    "addNewServiceProvider": 'F',
    "searchSP": 'F',
    "viewNewServiceProvider": 'F',
  }]
  public postalCodeDataRemote: RemoteData;
  public postalCodeDataRemoteLower: RemoteData;

  constructor(
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private serviceProviderService: ServiceProviderService,
    private renderer: Renderer2
  ) {
    //Predictive Province Search Upper
    this.postalCodeDataRemote = completerService.remote(
      null,
      "postalCd",
      "postalCd"
    );
    this.postalCodeDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.postalCodeDataRemote.urlFormater((term: any) => {
      return ServiceProviderApi.getPostalCodeForSearch + `/${term}`;
    });
    this.postalCodeDataRemote.dataField('result');

    //Predictive Province Search Lower
    this.postalCodeDataRemoteLower = completerService.remote(
      null,
      "postalCd",
      "postalCd"
    );
    this.postalCodeDataRemoteLower.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.postalCodeDataRemoteLower.urlFormater((term: any) => {
      return ServiceProviderApi.getPostalCodeForSearch + `/${term}`;
    });
    this.postalCodeDataRemoteLower.dataField('result');
  }

  ngOnInit() {
    // Task 585 resolved where search doesn work in search service provider if click on search immidiatly when page opens.
    this.currentUserService.showLoading.subscribe(value => {
      this.addObservable = Observable.interval(1000).subscribe(value => {
        this.showSearchButton = true
        this.addObservable.unsubscribe();
      });
    })
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SPP']
        checkArray.push(this.currentUserService.authChecks['SRC'][0])
        this.getAuthCheck(checkArray)
        this.getDisciplineList()
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser.userId
        this.getAuthCheck(this.currentUserService.authChecks['SPP'])
        this.getDisciplineList()
        this.dataTableInitialize();
      })
    }

    this.searchServiceProviderForm = this.fb.group({
      lastName: [''],
      firstName: [''],
      speciality: [null],
      LicenseNo: [''],
      disciplineType: [null],
      postalCode: [''],
      postalCodeCD: ['']
    })

    this.dropdownSettings = Constants.angular2Multiselect
    var self = this
    $(document).on("keypress", ".openSearchSelect", function (e) {
      if (e.keyCode == 13) {
        setTimeout(() => {
          $(this).find(".c-btn").trigger('click')
        }, 200);
      }
    })

    /**
     * @param columns for search table with translations
     * @function intailze empty datatable for search
     * 
     */
    var url = ServiceProviderApi.getServiceProviderSearchByFilter
    var reqParam = []

    $(document).on('keydown', '#search-serviceProvider-table .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
    this.renderer.selectRootElement('#sps_LicenseNo').focus();
  }

  dataTableInitialize() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if (this.checkServiceProvider = true) {
        if ('serviceProvider.search-table-column.effectiveDate' == this.translate.instant('serviceProvider.search-table-column.effectiveDate')) {
        } else {
          this.columns = [
            { title: this.translate.instant('serviceProvider.search-table-column.last-name'), data: 'lastName' },
            { title: this.translate.instant('serviceProvider.search-table-column.first-name'), data: 'firstName' },
            { title: this.translate.instant('serviceProvider.serviceProvider-search.discipline'), data: 'discipline' },
            { title: this.translate.instant('serviceProvider.serviceProvider-search.speciality'), data: 'speciality' },
            { title: this.translate.instant('serviceProvider.serviceProvider-search.licenseNo'), data: 'licenseNumber' },
            { title: this.translate.instant('serviceProvider.serviceProvider-search.postal-code'), data: 'postalCode' },
            { title: this.translate.instant('serviceProvider.search-table-column.effectiveDate'), data: 'effectiveDate' },
            { title: this.translate.instant('serviceProvider.search-table-column.status'), data: 'status' },
          ]
          this.checkServiceProvider = false;
          this.ObservableClaimObj.unsubscribe();
          if (this.serviceProviderService.searchedProviderData && this.serviceProviderService.isBackProviderSearch) {
            this.searchServiceProviderForm.patchValue(this.serviceProviderService.searchedProviderData)
            this.selectedPostalCodeCd = this.serviceProviderService.searchedpostalCodeCd
            this.serviceProviderService.isBackProviderSearch = false
            this.getServiceProviderList()
          }
        }
      }
    });
  }

  getAuthCheck(checkArray) {
    let userAuthCheck = []
    this.currentUser = this.currentUserService.currentUser
    if (this.currentUserService.currentUser.isAdmin == 'T') {
      this.serviceProviderChecks = [{
        "addNewServiceProvider": 'T',
        "searchSP": 'T',
        "viewNewServiceProvider": 'T'
      }]
    } else {
      for (var i = 0; i < checkArray.length; i++) {
        userAuthCheck[checkArray[i].actionObjectDataTag] = checkArray[i].actionAccess
      }
      this.serviceProviderChecks = [{
        "addNewServiceProvider": userAuthCheck['SPP166'],
        "searchSP": userAuthCheck['SPP167'],
        "viewNewServiceProvider": userAuthCheck['SRC168']
      }]
    }
    return this.serviceProviderChecks
  }

  /**
   * get discipline type list filter by userId
   */
  getDisciplineList() {
    var userId = this.currentUser.userId
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      businessTypeKey = 0
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
    }
    let requiredInfo = {
      "cardKey": 0,
      "userId": +userId,
      "businessTypeKey": businessTypeKey
    }
    this.hmsDataService.postApi(ServiceProviderApi.getDisciplineList, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.claimType = data.result
        if (this.currentUser.businessType.isAlberta) {  /* Issue: 548*/
          this.searchServiceProviderForm.patchValue({ 'disciplineType': 1 });
          this.getDisciplineType();
        } else {
          this.searchServiceProviderForm.patchValue({ 'disciplineType': 0 });
          this.getDisciplineType();
        }
      } else {
      }
    })
  }

  getDisciplineType() {
    if (this.searchServiceProviderForm.value.disciplineType != null) {
      this.hasDiscipline = true
      this.getSpeciality(this.searchServiceProviderForm.value.disciplineType)
    }
    else if (this.searchServiceProviderForm.value.disciplineType == null) {
      this.hasDiscipline = true
      this.searchServiceProviderForm.value.disciplineType = 0 //for "ALL"
      this.getSpeciality(this.searchServiceProviderForm.value.disciplineType)
    }
    else {
      this.hasDiscipline = false
    }
  }

  /**
   * get postal code related to service provider
   */

  onSelectPostalCode(selected: CompleterItem, type) {
    if (type == 'searchFilter' && selected && selected.originalObject != undefined && selected.originalObject != null) {
      this.searchServiceProviderForm.patchValue({ 'postalCodeCD': selected.originalObject.postalCd })
      this.selectedPostalCodeCd = selected.originalObject.postalCd
    } else {
      this.selectedPostalCodeCd = ''
    }
    if (type == 'gridFilteration') {
      this.postalCodeVal = selected.originalObject.postalCd
    }
  }

  keydownEventAction(event) {
    if (event.keyCode == 13) {
      this.getServiceProviderList();
    }
  }

  onDeSelectPostalCode() {
    this.postalCodeVal = ''
  }

  /**
   * get speciality by discipline key
   */
  getSpeciality(value) {
    let submitInfo = {};
    submitInfo = {
      "disciplineKey": +value
    }
    this.hmsDataService.postApi(ServiceProviderApi.getSpeciality, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.specialityList = data.result
      } else {
        this.specialityList = []
      }
    })
  }

  getSpecialityForGridFilteration(event) {
    let disciplineKey
    if (this.selectedDiscipline) {
      disciplineKey = this.selectedDiscipline
    }
    else if (event && event.target) {
      disciplineKey = +event.target.value
      this.selectedDiscipline = ""
    } else {
      disciplineKey = 0
    }
    let submitInfo = {
      "disciplineKey": disciplineKey
    }
    this.hmsDataService.postApi(ServiceProviderApi.getSpeciality, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.specialityListForGrid = data.result
      } else {
        this.specialityListForGrid = []
      }
    })
  }

  /**
   * relaod search datatable 
   * get search result
   */
  getServiceProviderList() {
    if (this.searchServiceProviderForm.valid) {
      this.showServiceProviderSearchTable = true

    if(this.searchServiceProviderForm.value.disciplineType == null){
      this.searchServiceProviderForm.value.disciplineType = 0
    }
      var reqParam = [
        { 'key': 'disciplineKey', 'value': this.searchServiceProviderForm.value.disciplineType },
        { 'key': 'speciality', 'value': this.searchServiceProviderForm.value.speciality },
        { 'key': 'licenseNumber', 'value': this.searchServiceProviderForm.value.LicenseNo },
        { 'key': 'postalCode', 'value': this.searchServiceProviderForm.value.postalCode },
        { 'key': 'lastName', 'value': this.searchServiceProviderForm.value.lastName },
        { 'key': 'firstName', 'value': this.searchServiceProviderForm.value.firstName },
      ]
      this.statusL = ''
      if (this.dateNameArray["effectiveDate"]) {
        this.dateNameArray["effectiveDate"] = []
      }
      this.disciplineKey = this.searchServiceProviderForm.value.disciplineType
      this.speciality = this.searchServiceProviderForm.value.speciality
      this.licenseNumber = this.searchServiceProviderForm.value.LicenseNo
      this.postalCode = this.selectedPostalCodeCd
      this.lastName = this.searchServiceProviderForm.value.lastName
      this.firstName = this.searchServiceProviderForm.value.firstName
      var url = ServiceProviderApi.getServiceProviderSearchByFilter
      var tableActions = []
      this.dataTableService.resetTableServiceProviderForStatus() // Log #0189348
      if (!$.fn.dataTable.isDataTable('#search-serviceProvider-table')) {
        this.dataTableService.jqueryDataTableSearchClaim("search-serviceProvider-table", url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, '', '', [1, 2, 3, 4, 5, 7], 6)
      } else {
        this.dataTableService.jqueryDataTableReload("search-serviceProvider-table", url, reqParam)
      }
      this.selectedDiscipline = this.searchServiceProviderForm.value.disciplineType
      this.getSpecialityForGridFilteration(this.selectedDiscipline)
      this.serviceProviderService.getSearchedData(this.searchServiceProviderForm.value, this.selectedPostalCodeCd)
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');
      return false;
    } else {
      this.validateAllFormFields(this.searchServiceProviderForm);
    }
  }

  resetFormSearch() {
    this.searchServiceProviderForm.reset()
    this.selectedPostalCodeCd = ''
    this.showServiceProviderSearchTable = false
    this.selectedItems = [];
    this.hasDiscipline = true
    if (this.currentUser.businessType.isAlberta) /* Issue: 548*/ {
      this.searchServiceProviderForm.patchValue({ 'disciplineType': 1 });
    }
    else {
      this.searchServiceProviderForm.patchValue({ 'disciplineType': 0 });
    }
    this.selectedDiscipline = ""
    this.lastName = ''
    this.firstName = ''
    this.speciality = ''
    this.licenseNumber = ''
    this.postalCode = ''
    this.getSpeciality(this.searchServiceProviderForm.value.disciplineType) // fix QA issue
  }

  /**
   * 
   * @param tableId  "search-serviceProvider-table" 
   * get service provider grid filteration
   */
  getServiceProviderListByGridFilteration(tableId) {
    var appendExtraParam = { 'key': 'postalCode', 'value': this.postalCodeVal }
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    var postalCodeParam = { 'key': 'postalCode', 'value': this.postalCodeVal }
    params.push(postalCodeParam)
    var url = ServiceProviderApi.getServiceProviderByColumnFilter
    var dateParams = [6]
    this.dataTableService.jqueryDataTableReload(tableId, url, params, dateParams)
  }

  resetTableSearch() {
    this.dataTableService.resetTableSearch()
    this.postalCodeVal = ''
    this.getServiceProviderListByGridFilteration("search-serviceProvider-table")
    this.specialityListForGrid = []
    this.selectedGridItems = [];
    $('#search-serviceProvider-table .icon-mydpremove').trigger('click');
  }

  changeDateFormat1(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  emptyPayToAddress(evt) // Add method for solving production-build errors
  { }

  public isOpen: boolean = false;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  /**
 * filter the search on press enter
 * @param event 
 * @param tableId 
 */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getServiceProviderListByGridFilteration(tableId);
    }
  }

  /**
  * Method for validate the Form fields
  * @param formGroup 
  */
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

}
