import { Component, OnInit, HostListener, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SearchCompanyComponent } from '../../common-module/shared-component/search-company/search-company.component'
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi } from '../card-api'
import { Router, ActivatedRoute } from '@angular/router';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { CardServiceService } from '../card-service.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { ToastrService } from 'ngx-toastr';
import { CompleterData, CompleterService } from 'ng2-completer';

import { Subscription } from 'rxjs';
@Component({
  selector: 'app-search-card-holder',
  templateUrl: './search-card-holder.component.html',
  styleUrls: ['./search-card-holder.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, DatatableService, TranslateService]
})

export class SearchCardHolderComponent implements OnInit {
  @ViewChild(SearchCompanyComponent) searchCompanyComponent
  genderL: string;
  roleL: string;
  status: any;
  dob: any;
  cardId: any;
  phoneNumber: string;
  email: any;
  role: any;
  SearchCompanyId: string;
  SearchCompanyName: string;
  SearchPlanName: string;
  effectivedate: any;
  expiredOn: any;
  lastName: any;
  firstName: any;
  bType: any;
  FormCompanyName: string;
  currentUserbusinessType: any;
  searchCardHolderForm: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  phoneMask = CustomValidators.phoneMask;
  companyName: string; //Company name return by perdictive search
  companyId: string; //Selected company Id return by perdictive search
  business_type_options: boolean = false;
  showSearchTable: boolean = false
  dateNameArray = {}
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  cardKey;
  docType;
  resetCompanyName: boolean = false
  Alberta: boolean = false
  businessType = ""
  check = true
  getLowerSearch: boolean
  observeObj
  columns = [];
  companyNameText = ""
  userAuthCheck = [{
    "searchCardholders": 'F',
    "viewCard": 'F',
    "addCard": 'F',
  }]
  showLoader: boolean = false
  isAdmin: string;
  currentUser: any;
  showBothBussinesType: boolean = false
  isQuikcard: boolean = false
  haveBothAcess: boolean = false
  expired: boolean = true;
  //Added for log 904
  public arrRoleTypeData: CompleterData
  arrRoleList: any[];
  falseOrTrue: boolean;
  cardHolderKey;
  unitKey;
  uftCompId;
  uftCompName;
  uftCall: boolean;
  uftMergedDesc;
  details: Subscription;

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private fb: FormBuilder,
    private router: Router,
    public cardService: CardServiceService,
    public dataTableService: DatatableService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private toastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private renderer: Renderer2,
    private completerService: CompleterService) {
    this.getCardHolderRoleList();//Added for log 904
  }
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  ngOnInit() {
    this.showLoader = true
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.currentUserbusinessType = this.currentUserService.userBusinnesType
        this.showLoader = false
        this.getAuthCheck(this.currentUserService.authChecks['SCH'])
        this.dataTableInitialize()
        this.getUftCall()
        localStorage.setItem('isReload', '')
      })
    } else if (this.route.queryParams) {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.currentUserbusinessType = this.currentUserService.userBusinnesType
        this.showLoader = false
        this.getAuthCheck(this.currentUserService.authChecks['SCH'])
        this.dataTableInitialize()
        this.getUftCall()
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUser = this.currentUserService.currentUser
      this.showLoader = false
      this.getAuthCheck(this.currentUserService.authChecks['SCH'])
      this.dataTableInitialize()
      this.getUftCall()
    }
    this.searchCardHolderForm = this.fb.group({
      businessType: [''],
      firstName: ['', [CustomValidators.onlyAlphabetsAllowed]],
      lastName: ['', [CustomValidators.onlyAlphabetAllowed]],
      searchCardHolderCompanyName: [''],
      dob: [''],
      email: ['', [CustomValidators.vaildEmail]],
      phone: [''],
      role: [''],
      status: [''],
      cardId: ['', [CustomValidators.onlyNumberAllowed]],
      effectivedate: [''],
      expiredOn: ['']
    })
    var obj = this.searchCardHolderForm.value
    obj['companyName'] = ""
    obj['companyId'] = ""
    obj['lastName'] = ""
    var self = this
    var tableId = "company-list"
    var url = CardApi.getCardSearchByFilter
    var reqParam = []
    var tableActions = []

    $(document).on('keydown', '#search-card-table .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })

    $(document).ready(function () {
      $('.mydpicon').click(function () {
        $('.selector').css("margin-left", "-108px");
      })
    })

    $(document).on('click', '#search-card-table > tbody > tr', function () {   //To resolve calendar icon navigation issue
      if (!$(this).find('td.dataTables_empty').length) {
        var data = self.currentUserService.cardSelectedRowData; //Issue no.646
        var cardKey = data.cardKey;
        self.cardKey = cardKey;
        self.cardService.showBackSearchBtn = true
        self.cardService.isBackCardSearch = true
        var cardHolderKey = data.cardHolderId;
        self.cardHolderKey = cardHolderKey;
        var unitKey = data.unitKey;
        self.unitKey = unitKey;
        self.ViewCardPage();
      }
    });
    this.renderer.selectRootElement('#sch_cardId').focus();
    this.renderer.selectRootElement('#sch_cardId_header').focus();

    this.details = this.route.queryParams.subscribe(params => {
      if (params.coId != undefined) {
        this.uftCompId = params.coId
        this.uftCompName = params.compName
        this.uftMergedDesc = params.mergedDesc
        this.uftCall = true;
      }
    })
    //(HMS point no - 594)
    $(document).on('click', '.btnpicker', function () {
      $('#sch_employmentDate .mydp .selector').addClass('bottom-calender')
    })
  }

  ViewCardPage() {
    this.router.navigate(['/card/view', this.cardKey], { queryParams: { 'cardHolderKey': this.cardHolderKey, 'unitKey': this.unitKey } })
  }

  dataTableInitialize() {
    this.observeObj = Observable.interval(1000).subscribe(value => {
      if (this.check = true) {
        if ('common.card-id' == this.translate.instant('common.card-id')) {
        } else {
          this.columns = [
            { title: this.translate.instant('common.card-id'), data: 'cardId' },
            { title: this.translate.instant('common.last-name'), data: 'lastName' },
            { title: this.translate.instant('common.first-name'), data: 'firstName' },
            { title: this.translate.instant('common.gender'), data: 'gender' },
            { title: this.translate.instant('common.date-of-birth'), data: 'dob' },
            { title: this.translate.instant('common.email-address'), data: 'email' },
            { title: this.translate.instant('common.phone'), data: 'phone' },
            { title: this.translate.instant('common.role'), data: 'cardHolderRole' },
            { title: this.translate.instant('common.company-name'), data: 'companyNameAndNumber' },
            { title: this.translate.instant('card.card-eligibility.effectivedate'), data: 'effectiveOn' },
            { title: this.translate.instant('card.card-eligibility.expirydate'), data: 'expiredOn' },
            { title: this.translate.instant('company.plan.plan-name&no'), data: 'planName' },
          ];
          this.check = false;
          this.observeObj.unsubscribe();
          if (this.cardService.searchData && this.cardService.isBackCardSearch) {
            this.searchCardHolderForm.patchValue(this.cardService.searchData.value)
            this.companyNameText = this.cardService.searchedCardCompanyName
            this.cardService.isBackCardSearch = false
            this.submitSearchCardHolder(this.searchCardHolderForm)
          }
        }
      }
    });
  }

  getUserBussinesType() {
    this.showBothBussinesType = this.currentUserbusinessType.bothAccess
    if (this.currentUserbusinessType.bothAccess) {
      this.haveBothAcess = true
      this.searchCardHolderForm.patchValue({ 'businessType': this.currentUserService.bothAcessdefaultBussinesType.businessTypeCd })
    }
    if (this.currentUserbusinessType.isQuikcard) {
      this.isQuikcard = true
      this.searchCardHolderForm.patchValue({ 'businessType': this.currentUserbusinessType[0].businessTypeCd })
    } if (this.currentUserbusinessType.isAlberta) {
      this.Alberta = true
      this.searchCardHolderForm.patchValue({ 'businessType': this.currentUserbusinessType[0].businessTypeCd })
    }
    this.searchCardHolderForm.patchValue({ 'status': "" })
  }

  onSearch(id: string) { }

  companyFieldVal(event) {
    this.companyNameText = event
  }

  getAuthCheck(claimChecks) {
    let authCheck = []
    //localStorage.getItem('isAdmin')
    if (this.currentUser.isAdmin == 'T') {
      this.userAuthCheck = [{
        "searchCardholders": 'T',
        "viewCard": 'T',
        "addCard": 'T',
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.userAuthCheck = [{
        "searchCardholders": authCheck['SCH48'],
        "viewCard": authCheck['SCH50'],
        "addCard": authCheck['SCH49'],
      }]
    }
    this.getUserBussinesType()
    return this.userAuthCheck
  }

  submitSearchCardHolder(searchCardHolderForm) {
    if (this.searchCardHolderForm.valid) {
      this.getLowerSearch = false
      var companyName = []
      let companyCoId = '';
      let formCompanyName = '';
      if (this.companyNameText) {
        if (this.companyNameText.includes(' / ')) {
          companyName = this.companyNameText.toString().split(' / ')
          if (companyName.length > 0) {
            companyCoId = companyName[1]
            formCompanyName = companyName[0]
          }
        } else {
          formCompanyName = this.companyNameText
        }
      }
      var phoneNumber = ''
      if (this.searchCardHolderForm.value.phone != null && this.searchCardHolderForm.value.phone != undefined && this.searchCardHolderForm.value.phone != "") {
        var numb = this.searchCardHolderForm.value.phone.match(/\d/g);
        phoneNumber = numb.join("");
      } else {
        phoneNumber = ""
      }
      let hasValue = false
      if ((this.searchCardHolderForm.value.firstName == "" || this.searchCardHolderForm.value.firstName == null) && (this.searchCardHolderForm.value.lastName == "" || this.searchCardHolderForm.value.lastName == null) && formCompanyName == '' && phoneNumber == '' &&
        (this.searchCardHolderForm.value.email == "" || this.searchCardHolderForm.value.email == null) && (this.searchCardHolderForm.value.cardId == "" || this.searchCardHolderForm.value.cardId == null) && (this.searchCardHolderForm.value.dob == "" || this.searchCardHolderForm.value.dob == null) &&
        (this.searchCardHolderForm.value.role == "" || this.searchCardHolderForm.value.role == null) &&
        (this.searchCardHolderForm.value.effectivedate == "" || this.searchCardHolderForm.value.effectivedate == null) &&
        (this.searchCardHolderForm.value.expiredOn == "" || this.searchCardHolderForm.value.expiredOn == null) &&
        (this.searchCardHolderForm.value.status == "" || this.searchCardHolderForm.value.status == null)) {
        hasValue = true
      }
      if (hasValue) {
        this.toastrService.error('Please Select Atleast One Filter!!')
      } else {
        this.showSearchTable = true
        var reqParam = [
          { 'key': 'businessType', 'value': this.searchCardHolderForm.value.businessType },
          { 'key': 'firstName', 'value': this.searchCardHolderForm.value.firstName },
          { 'key': 'lastName', 'value': this.searchCardHolderForm.value.lastName },
          { 'key': 'companyName', 'value': formCompanyName },
          { 'key': 'companyId', 'value': companyCoId },
          { 'key': 'email', 'value': this.searchCardHolderForm.value.email },
          { 'key': 'phone', 'value': phoneNumber },
          { 'key': 'cardHolderRole', 'value': this.searchCardHolderForm.value.role },
          { 'key': 'cardId', 'value': (this.searchCardHolderForm.value.cardId == undefined) ? '' : this.searchCardHolderForm.value.cardId.trim() },
          { 'key': 'dob', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchCardHolderForm.value.dob) },
          { 'key': 'status', 'value': this.searchCardHolderForm.value.status },
          { 'key': 'effectiveOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchCardHolderForm.value.effectiveOn) },
          { 'key': 'expiredOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchCardHolderForm.value.expiredOn) },
        ]
        this.bType = this.searchCardHolderForm.value.businessType;
        this.genderL = ''
        this.roleL = ''
        this.firstName = this.searchCardHolderForm.value.firstName;
        this.lastName = this.searchCardHolderForm.value.lastName
        this.SearchCompanyName = formCompanyName
        this.SearchCompanyId = companyCoId
        this.email = this.searchCardHolderForm.value.email
        this.phoneNumber = phoneNumber
        this.cardId = (this.searchCardHolderForm.value.cardId == undefined) ? '' : this.searchCardHolderForm.value.cardId.trim()
        this.dob = this.searchCardHolderForm.value.dob
        this.effectivedate = this.changeDateFormatService.convertDateObjectToString(this.searchCardHolderForm.value.effectivedate)
        this.expiredOn = this.changeDateFormatService.convertDateObjectToString(this.searchCardHolderForm.value.expiredOn)
        if (this.searchCardHolderForm.value.status == '') {
          this.status = 'all'
        }
        else {
          this.status = this.searchCardHolderForm.value.status
        }
        if (this.searchCardHolderForm.value.dob) {
          this.dateNameArray["dob"] = {
            year: this.dob.date.year,
            month: this.dob.date.month,
            day: this.dob.date.day
          };
        }
        else {
          this.dateNameArray["dob"] = ''
        }
        this.dateNameArray["effectivedate"] = ''
        this.dateNameArray["expirydate"] = ''
        if (this.dateNameArray["effectivedate"] == '') {
          this.dateNameArray["effectivedate"] = []
        }
        if (this.dateNameArray["expirydate"] == '') {
          this.dateNameArray["expirydate"] = []
        }
        this.SearchPlanName = ''
        var url = CardApi.getCardSearchByFilter
        var tableActions = [];

        if (!$.fn.dataTable.isDataTable('#search-card-table')) {
          var dateCols = ['dob'];
          this.dataTableService.jqueryDataTable("search-card-table", url, 'full_numbers', this.columns, 25, true, true, 'lt', 'irp',
            undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [4, 9, 10], this.userAuthCheck[0].viewCard, '', [1, 2, 3, 4, 5, 6, 7, 8, 11]);
        } else {
          this.dataTableService.jqueryDataTableReload("search-card-table", url, reqParam)
        }
        this.cardService.getCardSearchData(this.searchCardHolderForm, this.companyNameText)
        $(window).scrollTop(0);
        return false;
      }
    } else {
      this.validateAllFormFields(this.searchCardHolderForm);
    }
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

  resetSearchCardHolder(searchCardHolderForm) {
    this.firstName = '';
    this.lastName = ''
    this.SearchCompanyName = ''
    this.SearchPlanName = ''
    this.SearchCompanyId = ''
    this.email = ''
    this.phoneNumber = ''
    this.cardId = ''
    this.dob = ''
    this.status = ''
    this.effectivedate = ''
    this.expiredOn = ''
    this.searchCardHolderForm.reset();
    this.companyNameText = '';
    this.FormCompanyName = '';
    this.cardService.resetCompanyName.emit(true)
    this.resetTableSearch();
    this.showSearchTable = false;
    this.getUserBussinesType();
    this.dataTableService.clearResultsTable();  // Log #1226 
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.searchCardHolderForm.patchValue(datePickerValue);
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
      this.searchCardHolderForm.patchValue(datePickerValue);
    }
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
        this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      }
    }
    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  getCompanyName(event) {
    var companyValues = event.split(' / ')
    this.companyName = companyValues[0]
    this.companyId = companyValues[2]
  }

  getCardListByGridFilteration(tableId: string) {
    this.getLowerSearch = true
    var appendBussineType = { 'key': 'businessType', 'value': this.searchCardHolderForm.controls['businessType'].value }
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendBussineType)
    var url = CardApi.getCardSearchByFilter
    var dateParams = [4, 9, 10];
    params[12] = { key: 'companyId', value: this.SearchCompanyId };
    params.push({ 'key': 'status', 'value': this.searchCardHolderForm.value.status })
    this.dataTableService.jqueryDataTableReload("search-card-table", url, params, dateParams)
  }

  resetTableSearch() {
    this.dataTableService.resetTableSearch();
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getCardListByGridFilteration(tableId);
    }
  }

  exportSearchCardHolderList() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    var companyName = []
    var phoneNumber = ""
    var companyCoId = ''
    var reqParamPlan = {}
    if (this.getLowerSearch == true) {
      var params = this.dataTableService.getFooterParams("search-card-table")
      var companyCoId = ''
      let formCompanyName
      if (this.companyNameText) {
        if (this.companyNameText.includes(' / ')) {
          companyName = this.companyNameText.toString().split(' / ')
          if (companyName.length > 0) {
            companyCoId = companyName[1]
            formCompanyName = companyName[0]
          }
        } else {
          formCompanyName = this.companyNameText
        }
      }
      if (this.searchCardHolderForm.value.phone != null && this.searchCardHolderForm.value.phone != undefined && this.searchCardHolderForm.value.phone != "") {
        phoneNumber = this.searchCardHolderForm.value.phone.replace(/[^0-9 ]/g, "")
      } else {
        phoneNumber = ""
      }
      reqParamPlan = {
        "start": 0,
        "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
        "cardId": params[0].value,
        "lastName": params[1].value,
        "firstName": params[2].value,
        "gender": params[3].value,
        "dob": params[4].value,
        "email": params[5].value,
        "phone": params[6].value,
        "cardHolderRole": params[7].value,
        "companyName": params[8].value,
        "effectiveOn": params[9].value,
        "expiredOn": params[10].value,
        "planName": params[11].value,
        "status": this.searchCardHolderForm.value.status,
        'paramApplication': paramApp
      }
    }
    else {
      reqParamPlan =
        { "start": 0, "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords, "cardId": "", "lastName": "", "firstName": "", "gender": "", "dob": "", "email": "", "phone": "", "companyName": "", "status": 'Active', 'paramApplication': paramApp }
    }

    var companyURL = CardApi.exportCardSearchByTypeFilterUrl;
    this.showLoader = false
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    var fileName = "Card-List "
    this.docName = ""
    this.docType = ""

    if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
      this.exDialog.openConfirm("Max 50K records are allowed to download. Do you want to continue?").subscribe((value) => {
        if (value) {
          this.exportFile(companyURL, reqParamPlan, fileName)
        }
      });
    }
    else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
      this.exDialog.openConfirm("It will take some time.Do you want to continue?").subscribe((value) => {
        if (value) {
          this.exportFile(companyURL, reqParamPlan, fileName)
        }
      });
    } else {
      this.exportFile(companyURL, reqParamPlan, fileName)
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
      } else { }
    })
  }

  ngOnDestroy() {
    if (this.cardService.isBackCardSearch == false) {
      this.cardService.searchedCardCompanyName = ''
      this.companyName = ''
      this.searchCardHolderForm.reset();
    }
    else if (this.details) {
      this.details.unsubscribe();
    }
  }

  onKeyPressEvent(event) {
    if (event.keyCode == 13) {
      this.submitSearchCardHolder(this.searchCardHolderForm);
    }
  }

  // Added for log 904
  getCardHolderRoleList() {
    this.hmsDataServiceService.getApi(CardApi.getCardHolderRoleListUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrRoleList = data.result;
        this.arrRoleTypeData = this.completerService.local(
          this.arrRoleList,
          "chRoleDesc",
          "chRoleDesc"
        );

      }
    })
  }

  //Addded for log 904
  roleAutoSearch(event) {
    let val = event.key.toLowerCase();
    let charCode = event.keyCode;
    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode == 8) {

      if (this.falseOrTrue) {
        if (val == 'backspace') {

          val = event.target.value.toLowerCase().slice(0, -1);
        } else {
          val = event.target.value.toLowerCase() + val;
        }
      } else {
        if (val == 'backspace') {
          val = null
        }
        this.falseOrTrue = true;
      }
      let tepArray = this.arrRoleList;
      let result = tepArray.filter(obj => {
        return obj.chRoleDesc.toLowerCase().indexOf(val) === 0;
      })
      if (val) {

        this.arrRoleTypeData = this.completerService.local(
          result,
          "chRoleDesc",
          "chRoleDesc"
        );
      } else {
        this.arrRoleTypeData = this.completerService.local(
          this.arrRoleList,
          "chRoleDesc",
          "chRoleDesc"
        );
      }
    }
  }

  getUftCall() {
    if (this.uftCall) {
      setTimeout(() => {
        this.companyFieldVal(this.uftMergedDesc)
        this.searchCompanyComponent.FormGroup.patchValue({
          'searchCompany': this.uftMergedDesc
        })
        this.submitSearchCardHolder(this.searchCardHolderForm)
      }, 1000);
    }
  }
}