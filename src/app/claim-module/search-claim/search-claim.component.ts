import { Component, OnInit, Input, ViewChildren, ViewChild, Output, ElementRef, EventEmitter, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { ClaimApi } from '../claim-api';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { ClaimService } from '../claim.service';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CommonApi } from '../../common-module/common-api';
import { ClaimModuleComponent } from '../claim-module.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-search-claim',
  templateUrl: './search-claim.component.html',
  styleUrls: ['./search-claim.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, DatatableService, TranslateService]
})
export class SearchClaimComponent implements OnInit {
  filterSearch: boolean = false;
  payableL: any;
  footerentryDate: any;
  deductibleL: any;
  isReversedL: any;
  licenseL: any;
  lastNameL: any;
  firstNameL: any;
  businessTypeL: any;
  isDashboardL: any;
  monthNumL: any;
  service_to_dateL: string;
  service_from_dateL: string;
  release_to_dateL: string;
  release_from_dateL: any;
  entry_to_dateL: string;
  entry_from_dateL: any;
  operatorIDL: any;
  claimStatusL: any;
  claimTypeL: any;
  procedureCodeL: any;
  cardHolderL: any;
  releasedL: string;
  claimNoL: any;
  cardNoL: any;
  refNoL: any;
  refNoLPayee: any;
  dTypeL: any;
  ObservableClaimObj;
  checkClaim = true
  columns = [];
  error: any;
  referenceNumData: any;
  isOpen: boolean = false;
  referenceNum: any;
  discTypeSelected: number;
  operatorIdData: any;
  preAuthReview: boolean;
  paramsVal: Params;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }  
  searchClaimForm: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  claimType = [];//array for claim type List
  businessTypeList = [];
  arrClaimStatus = [];
  arrClaimType = []
  dateNameArray = {}
  showSearchTable: boolean = false
  payeeData = [];
  payeeType;
  disableSearch: boolean = false
  showDashboardSearch = new EventEmitter
  isReverseClaimBtnClickedFromSearchClaimScreen = new EventEmitter
  searchClaimChecks = [{
    "search": 'F',
    "addNewClaim": 'F',
    "viewClaim": "F"
  }]
  showLoader: boolean = false;
  disableBsnsType: boolean = false;
  showReviewSpan: boolean = false;
  reviewer: boolean = false;
  currentUser: any;
  reverseClaimMessage: any;
  isQuikCard: boolean = false;
  showPreAuthorizedByReview: boolean = false;
  refNumDataRemote: any;
  checkUserPermission = false;
  reverseDisciplineKey: any = "";
  cardholderKey
  personDtOfBirth
  claimKey;
  UserID
  claimDataArr
  disciplineKey
  adjudicatedMessage;
  adjudicatedStatus
  reIsssueClaimKey;
  refId
  existingRefId
  constructor(
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService,
    private claimService: ClaimService,
    private _hotkeysService: HotkeysService,
    private toastrService: ToastrService,
    private router: Router,
    private completerService: CompleterService,
    private renderer: Renderer2
  ) {
    this.error = { isError: false, errorMessage: '' };
    this._hotkeysService.add(new Hotkey('ctrl+i', (event: KeyboardEvent): boolean => {
      this.getClaimList()
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('alt+v', (event: KeyboardEvent): boolean => {
      this.reverseClaim()
      return false; // Prevent bubbling
    }));
    /*shortcut for reIssue claim*/
    this._hotkeysService.add(new Hotkey('alt+o', (event: KeyboardEvent): boolean => {
      ///add functionality for reIssue Claim
      return false; // Prevent bubbling
    }));
  }

  ngOnInit() {
    this.getLockProcessor()
    this.discTypeSelected = 0;
    this.getPredictiveRefNumSearchData(this.completerService)
    this.getPredictiveOperatorIDSearchData(this.completerService)
    this.showLoader = true
   
    this.searchClaimForm = this.fb.group({
      disciplineType: [''],
  
      referenceno: [''],
      cheque: [''],
      claimno: [''],
 
      cardno: ['', Validators.maxLength(16)],
      released: [''],
      unReleased: [''],
      cardHolder: [''],
      license: [''],
      plan: [''],
      businessType: [null],
      procedureCode: [''],
      claimType: [null],
      claimStatus: [null],
      operatorID: [''],
      service_from_date: [null],
      service_to_date: [null],
      entry_from_date: [null],
      entry_to_date: [null],
      release_from_date: [''],
      release_to_date: [''],
      monthNum: [''],
      isDashboard: ['F'],
      firstName: [''],
      lastName: [''],
      isReversed: [''],
      csType: [null],
      isMisc: ['F']
    })
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthCheck(this.currentUserService.authChecks['SCL'])
        localStorage.setItem('isReload', '')
        this.belowInitFunction();
      })
    } else if (this.route.queryParams) {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthCheck(this.currentUserService.authChecks['SCL'])
        this.belowInitFunction();
      })
    }
    else {
      this.getAuthCheck(this.currentUserService.authChecks['SCL'])
      this.belowInitFunction();
    }
    // add by mukul to resolved calendar Issue(HMS point no - 594)
    $(document).on('click','.btnpicker', function () {
      $('#ce_entryFromDate .mydp .selector').addClass('bottom-calender')
    })
     $(document).on('click','.btnpicker', function () {
       $('#ce_entryToDate .mydp .selector').addClass('bottom-calender')
    })
    $(document).on('click','.btnpicker', function () {
      $('#ce_serviceFromDate .mydp .selector').addClass('bottom-calender')
    })
    $(document).on('click','.btnpicker', function () {
      $('#ce_serviceToDate .mydp .selector').addClass('bottom-calender')
    })
    $(document).on('click','.btnpicker', function () {
      $('#ce_releaseFromDate .mydp .selector').addClass('bottom-calender')
    })
    $(document).on('click','.btnpicker', function () {
      $('#ce_releaseToDate .mydp .selector').addClass('bottom-calender')
    })
    // end
  }

  belowInitFunction() {
    var self = this
    var url = ClaimApi.getClaimSearchByFilter
    var reqParam = []
    var tableActions = []
    
    this.columns = [
      { title: 'Reference No.', data: 'refId' },
      { title: 'Entry Date', data: 'entryDate' },
      { title: 'Service Date', data: 'serviceDate' },
      { title: 'Payable', data: 'payable' },
      { title: 'Deductible', data: 'deductible' },
      { title: 'Released', data: 'released' },
      { title: 'Claim Type', data: 'claimType' },
      { title: "Card ID", data: 'cardNumber' },
      { title: "Last Name", data: 'personLastName' },
      { title: "First Name", data: 'personFirstName' },
      { title: "Payee", data: 'payeeTypeName' },
      { title: "Received", data: 'receivedOn' },
      { title: "Status", data: 'status' },//new row
      { title: "Action", data: 'refId'}
    ]

    if (this.currentUserService.userBusinnesType) {
      var self = this;

      if (this.currentUserService.userBusinnesType.isQuikcard == true) {
        self.checkUserPermission = true;
        setTimeout(() => {
          $('#csc_claim').focus();
        }, 1000);
      }
      else if (this.currentUserService.userBusinnesType.isAlberta == true) {
        self.checkUserPermission = false;
        setTimeout(() => {
          $('#csc_refNo').focus();
        }, 1000);
      }
      else if (this.currentUserService.userBusinnesType.bothAccess == true) {
        self.checkUserPermission = true;
        setTimeout(() => {
          $('#csc_claim').focus();
        }, 1000);
      }
    }

    $(document).on('keydown', '#search-claim-table .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
    $(document).on('click', 'table#search-claim-table tbody tr', function () {
      self.showSearchBtn()
    })
    if (this.route.snapshot.url[4]) {
      if (this.route.snapshot.url[4].path == 'reviewer') {
        this.reviewer = true
      } else {
        this.reviewer = false
      }
    }
  }

  showSearchBtn(): any {
    this.claimService.showViewBackBtn('T')
  }

  ngAfterViewInit() {
    var self = this  
      $(document).on('click', 'table#search-claim-table > tbody > tr > td:not(:last-child)', function () {    //Added by mukul to resolve calendar icon navigation issue(30/05/2023)
      if (!$(this).find('td.dataTables_empty').length) {
        var indexCell = $(this).index()
        if ($(this).index() == 13) {
        } else {
          if (self.dataTableService.claimKey != undefined) {
            if (self.dataTableService.dcpKey != 0) {
              self.router.navigate(["/claim/view/" + self.dataTableService.claimKey + "/type/" + self.dataTableService.disciplineKey + "/dcp/" + self.dataTableService.dcpKey], { queryParams: { 'searched': "T" } });
            } else {
              self.router.navigate(["/claim/view/" + self.dataTableService.claimKey + "/type/" + self.dataTableService.disciplineKey], { queryParams: { 'searched': "T" } });
            }
          }
        }
      }
    })

    $(document).on('click', '#search-claim-table .reverse-ico', function (event) {
      event.preventDefault()
      let refId = $(this).data('id')
      let disciplineKey = $(this).data('disciplinekey')
      let businessTypeCd = $(this).data('businesstypecd')
      let personDate = $(this).data('persondate')
      setTimeout(() => {
        if (!$(this).data("hasReverseClaimClicked")) {
          $(this).data("hasReverseClaimClicked", true)
          self.reverseAndReissueClaimCommon(refId, disciplineKey, businessTypeCd, personDate, "Reverse", '')
        }
      });
      $(this).data("hasReverseClaimClicked", false)
    });

    // Reissue Claim Icon Functionality
    $(document).on('click', '#search-claim-table .reissue-ico', function(e) {
      e.preventDefault()
      let refId = $(this).data('id')
      let disciplineKey = $(this).data('disciplinekey')
      let businessTypeCd = $(this).data('businesstypecd')
      let personDate = $(this).data('persondate')
      let reissueClaimKey = $(this).data('claimkey')
      setTimeout(() => {
        if (!$(this).data("hasReissueClaimClicked")) {
          $(this).data("hasReissueClaimClicked", true)
          self.reverseAndReissueClaimCommon(refId, disciplineKey, businessTypeCd, personDate, "Reissue", reissueClaimKey)
        }
      });
      $(this).data("hasReissueClaimClicked", false)     
    })	
  }

  getAuthCheck(claimChecks) {
    let promise = new Promise((resolve, reject) => {
      let userAuthCheck = []
      if (localStorage.getItem('isAdmin') == 'T') {
        this.searchClaimChecks = [{
          "search": 'T',
          "addNewClaim": 'T',
          "viewClaim": 'T'
        }]
      } else {
        for (var i = 0; i < claimChecks.length; i++) {
          userAuthCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
        }
        this.searchClaimChecks = [{
          "search": userAuthCheck['SCL27'],
          "addNewClaim": userAuthCheck['SCL28'],
          "viewClaim": userAuthCheck['SCL29']
        }]
      }
      this.currentUser = this.currentUserService.currentUser
      this.UserID = this.currentUser.userId
      this.getBusinessType()
      this.getDisciplineList();
      this.getPermission();
      this.getClaimStatus()
      this.getPayeeList()
      this.showLoader = false
      this.searchClaimChecks
      resolve();
    })
    return promise;
  }
  getPermission() {
    let userType = JSON.parse(localStorage.getItem('type'))
    let userTypeArray = []
    userType.forEach(element => {
      userTypeArray.push(element.userTypeKey);
    });
    let submitData = {
      "userTypeKeyList": userTypeArray
    }
    this.hmsDataService.postApi(CommonApi.getMenuActionsByRoleKey, submitData).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        for (var i in data.result) {
          if (data.result[i].menuName === "Pre-Authorized By Review") {
            let x;
            if (data.result[i].actionAccess) {
              this.preAuthReview = true;
              this.getClaimType()
              return;
            } else {
              this.preAuthReview = false;
              this.getClaimType()
              return;
            }
          }
        }
        this.getClaimType()
        return
      }
    }, (error) => {      
    })
  }
  getClaimList() {
    this.showPreAuthorizedByReview = (this.searchClaimForm.value.businessType == "AB Gov.") ? true : false;
    if (this.searchClaimForm.value.isDashboard == 'T') {
      if (this.searchClaimForm.value.isMisc == 'T') {   // set six months date format only on misc. section 
        var date = new Date();
        let firstDay = new Date(date.getFullYear(), date.getMonth()-6,date.getDate()); 
        this.searchClaimForm.patchValue({ 'entry_from_date': this.changeDateFormatService.formatDateObject(firstDay), 'entry_to_date': this.changeDateFormatService.formatDateObject(date) });
      } else {
        var date = new Date();
        let firstDay = this.changeDateFormatService.getToday().date.day <= 4 ? new Date(date.getFullYear(), date.getMonth() - 1, 1) : new Date(date.getFullYear(), date.getMonth(), 1);        
        this.searchClaimForm.patchValue({ 'entry_from_date': this.changeDateFormatService.formatDateObject(firstDay), 'entry_to_date': this.changeDateFormatService.formatDateObject(date) });
      }
    }
   
    this.searchClaimForm.get('referenceno').clearValidators();
    this.searchClaimForm.get('referenceno').updateValueAndValidity();
    this.setValidators();
    if (this.searchClaimForm.valid) {
      if (this.disableSearch) {
        return;
      } else {
        var service_from_date = this.searchClaimForm.value.service_from_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.service_from_date) : "";
        var entry_from_date = this.searchClaimForm.value.entry_from_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.entry_from_date) : "";
        var release_from_date = this.searchClaimForm.value.release_from_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.release_from_date) : "";
        var service_to_date = this.searchClaimForm.value.service_to_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.service_to_date) : "";
        var entry_to_date = this.searchClaimForm.value.entry_to_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.entry_to_date) : "";
        var release_to_date = this.searchClaimForm.value.release_to_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.release_to_date) : "";
        this.showSearchTable = true
        let releasedValue = ''
        if (this.searchClaimForm.value.released == true && (this.searchClaimForm.value.unReleased == false || this.searchClaimForm.value.unReleased == null)) {
          releasedValue = 'T'
        } else if (this.searchClaimForm.value.unReleased == true && (this.searchClaimForm.value.released == false || this.searchClaimForm.value.released == null)) {
          releasedValue = 'F'
        } else {
          releasedValue = ''
        }
        let claimAttachedCheck
      
        let businessType
        if (this.searchClaimForm.value.businessType) {
          businessType = this.searchClaimForm.value.businessType
        } else {
          businessType = ""
        }
        let claimType
        if (this.searchClaimForm.value.claimType) {
          claimType = this.searchClaimForm.value.claimType
        } else {
          claimType = ""
        }
        let claimStatus
        if (this.searchClaimForm.value.claimStatus) {
          claimStatus = this.searchClaimForm.value.claimStatus
        } else {
          claimStatus = ""
        }
        if (this.searchClaimForm.value.disciplineType == "SUPPLEMENTAL") {
          this.searchClaimForm.value.disciplineType = "HSA";
        } else {
          this.searchClaimForm.value.disciplineType = this.searchClaimForm.value.disciplineType
        }
      
        var reqParam = [
          { 'key': 'claimCategory', 'value': this.searchClaimForm.value.disciplineType },
          { 'key': 'refId', 'value': this.searchClaimForm.value.referenceno },
          { 'key': 'cardNumber', 'value': this.searchClaimForm.value.cardno },
          { 'key': 'claimNo', 'value': this.searchClaimForm.value.claimno },
          { 'key': 'released', 'value': releasedValue },
          { 'key': 'name', 'value': this.searchClaimForm.value.cardHolder },
          { 'key': 'procedureCode', 'value': this.searchClaimForm.value.procedureCode },
          { 'key': 'claimType', 'value': claimType },
          { 'key': 'status', 'value': claimStatus },
          { 'key': 'operator', 'value': this.searchClaimForm.value.operatorID },
          { 'key': 'entryStartDate', 'value': entry_from_date },
          { 'key': 'entryEndDate', 'value': entry_to_date },
          { 'key': 'releaseStartDate', 'value': release_from_date },
          { 'key': 'releaseEndDate', 'value': release_to_date },
          { 'key': 'serviceStartDate', 'value': service_from_date },
          { 'key': 'serviceEndDate', 'value': service_to_date },
          { 'key': 'monthNum', 'value': this.searchClaimForm.value.monthNum },
          { 'key': 'isDashboard', 'value': this.searchClaimForm.value.isDashboard },
          { 'key': 'businessType', 'value': this.searchClaimForm.value.businessType },
          { 'key': 'personFirstName', 'value': this.searchClaimForm.value.firstName },
          { 'key': 'personLastName', 'value': this.searchClaimForm.value.lastName },
          { 'key': 'licenseNumber', 'value': this.searchClaimForm.value.license },
          { 'key': 'isReversed', 'value': this.searchClaimForm.value.isReversed },
          // Below one added to send plan no in parameter.
          { 'key': 'planId', 'value': this.searchClaimForm.value.plan },
          { 'key': 'csType', 'value': this.searchClaimForm.value.csType}
        ]

        this.dTypeL = this.searchClaimForm.value.disciplineType
        this.refNoL = this.searchClaimForm.value.referenceno
        this.refNoLPayee = this.searchClaimForm.value.payee
        this.cardNoL = this.searchClaimForm.value.cardno
        this.claimNoL = this.searchClaimForm.value.claimno
        this.releasedL = releasedValue
        this.cardHolderL = this.searchClaimForm.value.cardHolder
        this.procedureCodeL = this.searchClaimForm.value.procedureCode
        this.claimTypeL = claimType
        this.claimStatusL = claimStatus
        this.payableL = ''
        this.footerentryDate = ''
        this.deductibleL = ''
        this.operatorIDL = this.searchClaimForm.value.operatorID
        this.entry_from_dateL = this.searchClaimForm.value.entry_from_date
        this.entry_to_dateL = entry_to_date
        this.release_from_dateL = this.searchClaimForm.value.release_from_date
        this.release_to_dateL = release_to_date
        this.service_from_dateL = service_from_date
        this.service_to_dateL = service_to_date
        this.monthNumL = this.searchClaimForm.value.monthNum
        this.isDashboardL = this.searchClaimForm.value.isDashboard
        this.businessTypeL = this.searchClaimForm.value.businessType
        this.firstNameL = this.searchClaimForm.value.firstName
        this.lastNameL = this.searchClaimForm.value.lastName
        this.licenseL = this.searchClaimForm.value.license
        this.isReversedL = this.searchClaimForm.value.isReversed
        if (this.searchClaimForm.value.entry_from_date) {
          if (!this.searchClaimForm.value.entry_to_date) {
            this.dateNameArray["entryDate"] = {
              year: this.entry_from_dateL.date.year,
              month: this.entry_from_dateL.date.month,
              day: this.entry_from_dateL.date.day
            };
          } else {
            this.dateNameArray["entryDate"] = ''
          }
        }
        else {
          this.dateNameArray["entryDate"] = ''
        }

        //Service Start Date
        if (this.searchClaimForm.value.service_from_date) {
          if (!this.searchClaimForm.value.service_end_date) {
            this.dateNameArray["serviceStartDate"] = {
              year: this.service_from_dateL,
              month: this.service_from_dateL,
              day: this.service_from_dateL
            };
          } else {
            this.dateNameArray["serviceStartDate"] = ''
          }
        }
        else {
          this.dateNameArray["serviceStartDate"] = ''
        }
        //End Date
        if (this.dateNameArray["entryDate"] == '') {
          this.dateNameArray["entryDate"] = []
        }
        if (this.dateNameArray["serviceStartDate"] == '') {
          this.dateNameArray["serviceStartDate"] = []
        }

        if (!this.filterSearch) {
          this.dateNameArray["receivedDate"] = {}
        }
        else {
          this.filterSearch = false
          this.dateNameArray["receivedDate"] = ''
        }
        if (this.dateNameArray["receivedDate"] == '') {
          this.dateNameArray["receivedDate"] = []
        }

        var url = ClaimApi.getClaimSearchByFilter
        var tableActions = [
          { 'name': 'RC', 'class': 'table-action-btn green-btn reverse-ico', 'icon_class': 'fa fa-eye', 'title': this.translate.instant('button.reverseClaim'), 'showAction': '' },
          { 'name': 'RI', 'class': 'table-action-btn green-btn reissue-ico', 'title': this.translate.instant('button.reissueClaim'), 'showAction': '' }
        ]
        if (!$.fn.dataTable.isDataTable('#search-claim-table')) {
         

          this.dataTableService.jqueryDataTableSearchClaim("search-claim-table", url, 'full_numbers', this.columns, 25, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, [13], '', this.searchClaimChecks[0].viewClaim, [3, 4, 5, 6, 7, 8, 9, 12, 13], [1, 2, 11])
        } else {
          this.dataTableService.jqueryDataTableReload("search-claim-table", url, reqParam)
        }
        $('html, body').animate({
          scrollTop: $(document).height()
        }, 'slow');
        this.claimService.getClaimSearchData(this.searchClaimForm.value)
       // supplemental is missing in Discipline Field when we navigate to Search claim page via clicking on Back to search button(point no-214)
        if (this.searchClaimForm.value.disciplineType == "HSA") {
          this.searchClaimForm.value.disciplineType = "SUPPLEMENTAL";
        } else {
          this.searchClaimForm.value.disciplineType = this.searchClaimForm.value.disciplineType
        }
        return false;
      }
    }
    else {
      this.validateAllFormFields(this.searchClaimForm);
    }
  
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.searchClaimForm.patchValue(datePickerValue);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        this.disableSearch = true
        return;
      } else {
        this.disableSearch = false
      }
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.searchClaimForm.patchValue(datePickerValue);
    }
    if (frmControlName == 'entry_from_date' || frmControlName == 'entry_to_date') {
      if (this.searchClaimForm.value.entry_from_date && this.searchClaimForm.value.entry_to_date) {
        this.error = this.changeDateFormatService.compareTwoDates(this.searchClaimForm.value.entry_from_date.date, this.searchClaimForm.value.entry_to_date.date);
        if (this.error.isError == true) {
          this.searchClaimForm.controls['entry_to_date'].setErrors({
            "ToDateNotValid": true
          });
        }
      }
    }
    if (frmControlName == 'service_from_date' || frmControlName == 'service_to_date') {
      if (this.searchClaimForm.value.service_from_date && this.searchClaimForm.value.service_to_date) {
        this.error = this.changeDateFormatService.compareTwoDates(this.searchClaimForm.value.service_from_date.date, this.searchClaimForm.value.service_to_date.date);
        if (this.error.isError == true) {
          this.searchClaimForm.controls['service_to_date'].setErrors({
            "ToDateNotValid": true
          });
        }
      }
    }
    if (frmControlName == 'release_from_date' || frmControlName == 'release_to_date') {
      if (this.searchClaimForm.value.release_from_date && this.searchClaimForm.value.release_to_date) {
        this.error = this.changeDateFormatService.compareTwoDates(this.searchClaimForm.value.release_from_date.date, this.searchClaimForm.value.release_to_date.date);
        if (this.error.isError == true) {
          this.searchClaimForm.controls['release_to_date'].setErrors({
            "ToDateNotValid": true
          });
        }
      }
    }
    this.clearAllValidator()
  }

  setValidators() {
    if (this.searchClaimForm.value.entry_from_date != null && this.searchClaimForm.value.entry_to_date == null) {
      this.searchClaimForm.get('entry_to_date').setValidators(Validators.required);
      this.searchClaimForm.get('entry_to_date').updateValueAndValidity();

      this.searchClaimForm.get('entry_from_date').clearValidators()
      this.searchClaimForm.get('entry_from_date').updateValueAndValidity();

      this.searchClaimForm.get('service_from_date').clearValidators();
      this.searchClaimForm.get('service_from_date').updateValueAndValidity();
      this.searchClaimForm.get('service_to_date').clearValidators();
      this.searchClaimForm.get('service_to_date').updateValueAndValidity();
    }
    else if (this.searchClaimForm.value.entry_to_date != null && this.searchClaimForm.value.entry_from_date == null) {
      this.searchClaimForm.get('entry_from_date').setValidators(Validators.required)
      this.searchClaimForm.get('entry_from_date').updateValueAndValidity();

      this.searchClaimForm.get('entry_to_date').clearValidators();
      this.searchClaimForm.get('entry_to_date').updateValueAndValidity();

      this.searchClaimForm.get('service_from_date').clearValidators();
      this.searchClaimForm.get('service_from_date').updateValueAndValidity();
      this.searchClaimForm.get('service_to_date').clearValidators();
      this.searchClaimForm.get('service_to_date').updateValueAndValidity();
    }
    else if (this.searchClaimForm.value.service_from_date != null && this.searchClaimForm.value.service_to_date == null) {
      this.searchClaimForm.get('service_to_date').setValidators(Validators.required);
      this.searchClaimForm.get('service_to_date').updateValueAndValidity();

      this.searchClaimForm.get('entry_from_date').clearValidators()
      this.searchClaimForm.get('entry_from_date').updateValueAndValidity();
      this.searchClaimForm.get('entry_to_date').clearValidators();
      this.searchClaimForm.get('entry_to_date').updateValueAndValidity();

      this.searchClaimForm.get('service_from_date').clearValidators();
      this.searchClaimForm.get('service_from_date').updateValueAndValidity();

    }
    else if (this.searchClaimForm.value.service_to_date != null && this.searchClaimForm.value.service_from_date == null) {
      this.searchClaimForm.get('service_from_date').setValidators(Validators.required);
      this.searchClaimForm.get('service_from_date').updateValueAndValidity();

      this.searchClaimForm.get('entry_from_date').clearValidators()
      this.searchClaimForm.get('entry_from_date').updateValueAndValidity();
      this.searchClaimForm.get('entry_to_date').clearValidators();
      this.searchClaimForm.get('entry_to_date').updateValueAndValidity();

      this.searchClaimForm.get('service_to_date').clearValidators();
      this.searchClaimForm.get('service_to_date').updateValueAndValidity();
    } else {
      this.searchClaimForm.get('entry_from_date').clearValidators()
      this.searchClaimForm.get('entry_from_date').updateValueAndValidity();
      this.searchClaimForm.get('entry_to_date').clearValidators();
      this.searchClaimForm.get('entry_to_date').updateValueAndValidity();

      this.searchClaimForm.get('service_from_date').clearValidators();
      this.searchClaimForm.get('service_from_date').updateValueAndValidity();
      this.searchClaimForm.get('service_to_date').clearValidators();
      this.searchClaimForm.get('service_to_date').updateValueAndValidity();
    }

  }


  resetClaimSearch(searchClaimForm) {
    this.searchClaimForm.reset()
    this.dTypeL = ''
    this.refNoL = ''
    this.refNoLPayee = ''
    this.cardNoL = ''
    this.claimNoL = ''
    this.releasedL = ''
    this.cardHolderL = ''
    this.procedureCodeL = ''
    this.claimTypeL = ''
    this.claimStatusL = ''
    this.payableL = ''
    this.footerentryDate = ''
    this.deductibleL = ''
    this.operatorIDL = ''
    this.entry_from_dateL = ''
    this.entry_to_dateL = ''
    this.release_from_dateL = ''
    this.release_to_dateL = ''
    this.service_from_dateL = ''
    this.service_to_dateL = ''
    this.monthNumL = ''
    this.isDashboardL = ''
    this.businessTypeL = ''
    this.firstNameL = ''
    this.lastNameL = ''
    this.licenseL = ''
    this.isReversedL = ''
    if (this.currentUser.businessType[0].businessTypeDesc == 'AB Gov.') {
      this.searchClaimForm.patchValue({ 'disciplineType': "DENTAL" });
    }
    else {
      this.searchClaimForm.patchValue({ 'disciplineType': "ALL" })
    }
    this.showSearchTable = false
    this.searchClaimForm.patchValue({ 'isDashboard': 'F' })
    this.patchBusinesType()

    var appendExtraParam = { 'key': 'clearTo', 'value': 'Y' }
    var params = this.dataTableService.getFooterParamsSearchTable("search-claim-table", appendExtraParam)

    
  }

  /**
@return:this.claimType array of claim type based on userID(change id user belongs to alberta Gov) 
        and cardkey(if cardholder intiate claims) 
* 
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
    this.hmsDataService.postApi(ClaimApi.getDisciplineList, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.claimType = data.result
        if (this.currentUser.businessType.isAlberta) {
          this.searchClaimForm.patchValue({ 'disciplineType': "DENTAL" });
        } else {          
          this.searchClaimForm.patchValue({ 'disciplineType': 'ALL' });
        }
        this.showDashboardSearch.emit(true)
        this.patchValueIfDashboard()
      } else {
      }
    }, (error) => {
    })

  }
  /* Get List of BusinessType */
  getBusinessType() {
    var URL = ClaimApi.getBusinessTypeUrl;
    this.hmsDataService.getApi(URL).subscribe(data => {
      this.businessTypeList = data.result;
    },(error) => {
     
    });
  }
  getClaimType() {
    let businessTypeCd = ""
    if (this.currentUser.businessType.bothAccess) {
      businessTypeCd = ""
    } else {
      businessTypeCd = this.currentUser.businessType[0].businessTypeCd
    }
    let submitInfo = {
      "businessTypeCd": businessTypeCd
    }

    this.hmsDataService.postApi(ClaimApi.getClaimListByBsnsType, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (!this.preAuthReview) {
          let x = data.result;
          x = x.filter(function (obj) {           
            return obj.claimTypeCd !== 'V';
          });
          this.arrClaimType = x;
        } else {
          this.arrClaimType = data.result;
        }
      } else {
        this.arrClaimType = []
      }

    }, (error) => {     
    })

  }
  getClaimStatus() {
    var URL = ClaimApi.getClaimStatusList;
    this.hmsDataService.getApi(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        // Open Project Issue 605

        if (this.currentUserService.userBusinnesType) {
          if (this.currentUserService.userBusinnesType.isQuikcard == true) {
            this.arrClaimStatus = data.result;
          }
          else if (this.currentUserService.userBusinnesType.isAlberta == true) {
            this.arrClaimStatus = data.result.filter(function (value, index, arr) {
              return (value.claimStatusCd != 'B');
            });
            this.arrClaimStatus = this.arrClaimStatus.filter(function (value, index, arr) {
              return (value.claimStatusCd != 'C');
            });
          }
          else if (this.currentUserService.userBusinnesType.bothAccess == true) {
            this.arrClaimStatus = data.result;
          }
        } else {
          this.arrClaimStatus = data.result;
        }
      } else {
        this.arrClaimStatus = []
      }
    }, (error) => {
     
    });
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

  getClaimListByGridFilteration(tableId: string) {

    this.filterSearch = true
    this.footerentryDate;
    var appendExtraParam = { 'key': 'claimCategory', 'value': this.searchClaimForm.get('disciplineType').value }
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)

    params.push({ 'key': 'businessType', 'value': this.searchClaimForm.controls['businessType'].value })
    params.push({ 'key': 'isDashboard', 'value': this.searchClaimForm.value.isDashboard })
    params.push({ 'key': 'licenseNumber', 'value': this.searchClaimForm.value.license })
   
    params.push({ 'key': 'procedureCode', 'value': this.searchClaimForm.value.procedureCode })
    params.push({ 'key': 'releaseEndDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.release_to_date) })
    params.push({ 'key': 'releaseStartDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.release_from_date) })
    params.push({ 'key': 'operator', 'value': this.searchClaimForm.value.operatorID })
    Object.keys(params).forEach(indexKey => {
      if (params[indexKey].key === 'entryStartDate') {
        if (params[indexKey].value != '') {
          params.push({ 'key': 'entryEndDate', 'value': params[indexKey].value })
        } else {
          params[indexKey].value = this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.entry_from_date);
          params.push({ 'key': 'entryEndDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.entry_to_date) })
        }
      }
if(this.searchClaimForm.value.entry_to_date){
  params.push({ 'key': 'entryEndDate', 'value':  this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.entry_to_date) })
}
if(this.searchClaimForm.value.entry_from_date){
  params.push({ 'key': 'entryStartDate', 'value':  this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.entry_from_date) })

}

      if (params[indexKey].key === 'serviceStartDate') {
        if (params[indexKey].value != '') {
          params.push({ 'key': 'serviceEndDate', 'value': params[indexKey].value })
        } else {
          params[indexKey].value = this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.service_from_date);
          params.push({ 'key': 'serviceEndDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.service_to_date) })
        }
      }
    });
    var dateParams = [1, 2, 11]
    var url = ClaimApi.getClaimSearchByFilter
    this.dataTableService.jqueryDataTableReload("search-claim-table", url, params, dateParams)
    
  }
  resetTableSearch() {
    this.dataTableService.resetTableSearch()
    this.searchClaimForm.patchValue({ 'isDashboard': 'F' })
    this.patchBusinesType()
    this.patchValueIfDashboard()
    this.getClaimListByGridFilteration("search-claim-table")
  }

  getPayeeList() {
    this.hmsDataService.getApi(ClaimApi.getPayeeTypesUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payeeData = data.result;
      } else {
        this.payeeData = []
      }
    }, (error) => {      
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
      this.getClaimListByGridFilteration(tableId);
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

  patchBusinesType() {
    if (!this.currentUser.businessType.bothAccess) {
      this.searchClaimForm.patchValue({ 'businessType': this.currentUser.businessType[0].businessTypeDesc })
      this.isQuikCard = this.currentUser.businessType[0].businessTypeKey == Constants.quikcardBusnsTypeKey ? true : false
      this.disableBsnsType = true
    } else {
      this.searchClaimForm.patchValue({ 'businessType': this.currentUserService.bothAcessdefaultBussinesType.businessTypeDesc })
      this.disableBsnsType = false
    }
  }
  patchValueIfDashboard() {
    if (this.claimService.claimSearchedData && this.claimService.isBackClaimSearch) {
      this.searchClaimForm.patchValue(this.claimService.claimSearchedData)
      this.claimService.isBackClaimSearch = false
      this.getClaimList()
      this.changeTheme()
    } else {
      this.patchBusinesType()
      this.route.queryParams.subscribe((params) => {
        this.paramsVal = params;
        if (params['monthNum'] || params['discipline'] || params['status'] || params['type'] || params['referenceno'] || params['businessType']) {
          if (params['monthNum']) {
            let currentDate = new Date()
            let currentMonth = currentDate.getMonth() + 1
            if (params['monthNum'] == currentMonth.toString()) {
              var currentFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              this.searchClaimForm.patchValue({ 'entry_to_date': this.changeDateFormatService.formatDateObject(currentDate) })
              this.searchClaimForm.patchValue({ 'entry_from_date': this.changeDateFormatService.formatDateObject(currentFirstDay) })
            } else {
              let year = +params['monthNum'] > currentMonth ? currentDate.getFullYear() - 1 : currentDate.getFullYear()
              var firstDay = new Date(year, +params['monthNum'] - 1, 1);
              var lastDay = new Date(year, +params['monthNum'], 0);
              this.searchClaimForm.patchValue({ 'entry_to_date': this.changeDateFormatService.formatDateObject(lastDay) })
              this.searchClaimForm.patchValue({ 'entry_from_date': this.changeDateFormatService.formatDateObject(firstDay) })
            }
          } 
          else if (params['discipline']) {
            this.searchClaimForm.patchValue({ 'disciplineType': params['discipline'] })
          } else if (params['status']) {
            if (params['status'] == "Released") {
              this.searchClaimForm.patchValue({ 'released': true })
            } else {
              this.searchClaimForm.patchValue({ 'claimStatus': params['status'] })
              if (params['status'] == "Adjudicated") {
                this.searchClaimForm.patchValue({ 'unReleased': true })
              }
              // #1266 Below one added to see the Adjudicated or approved claims but not released on dashboards of quikcard and ADSC."
              else {
                this.searchClaimForm.patchValue({ 'claimStatus': params['status'] })
                if (params['status'] == "Adjudicated Approved") {
                  this.searchClaimForm.patchValue({ 'unReleased': true })
                  this.searchClaimForm.patchValue({ 'claimStatus': 'Adjudicated' })
                }
              }
            }
          } else if (params['type']) {
            if (params['type'] == 'I') {
              this.searchClaimForm.patchValue({ 'claimStatus': 'Pending' })
              this.searchClaimForm.patchValue({ 'operatorID': 'ITRANS' })
            } else if (params['type'] == 'D') {
              this.searchClaimForm.patchValue({ 'claimStatus': 'Pending' })
              this.searchClaimForm.patchValue({ 'claimType': 'D' })
            } else if (params['type'] == 'UN') {
              this.searchClaimForm.patchValue({ 'unReleased': true })
              this.searchClaimForm.patchValue({ 'released': false })
              this.searchClaimForm.patchValue({ 'claimStatus': 'Adjudicated' })
              this.searchClaimForm.patchValue({ 'claimType': 'D' })
            } else {
              this.searchClaimForm.patchValue({ 'unReleased': true })
              this.searchClaimForm.patchValue({ 'released': false })
              this.searchClaimForm.patchValue({ 'claimType': params['type'] })
            }
          }
          else if (params['referenceno'] || params['businessType']){
            this.searchClaimForm.patchValue({ 'referenceno': params['referenceno'] })
            params['businessType'] == "Q" ? this.searchClaimForm.patchValue({ 'businessType': Constants.quikcard }) :
            this.searchClaimForm.patchValue({ 'businessType': Constants.albertaGov })
          }
          this.searchClaimForm.patchValue({ 'isDashboard': (params['monthNum'] || params['referenceno']) ? 'F' : 'T' })
          this.searchClaimForm.patchValue({ 'isReversed': params['monthNum'] ? 'F' : '' })
          this.searchClaimForm.patchValue({ 'monthNum': params['monthNum'] ? '' : this.changeDateFormatService.getToday().date['month'] })
          params['isGov'] == "T" ? this.searchClaimForm.patchValue({ 'businessType': Constants.albertaGov }) :
            this.searchClaimForm.patchValue({ 'businessType': Constants.quikcard })
          if (params['isGov'] == "T") {
            this.searchClaimForm.patchValue({ 'disciplineType': 'DENTAL' })
          }
          if (params['status'] == "Adjudicated") {
            this.searchClaimForm.patchValue({ 'csType': 'adj' })
          } else if (params['status'] == "Adjudicated Approved") {
            this.searchClaimForm.patchValue({ 'csType': 'adjAprv' })
          }
          if (params['isMisc'] == 'T') {     // set six months date format only on misc. section 
            this.searchClaimForm.patchValue({'isMisc': 'T'})
          }
          this.getClaimList()
        }
      });
    }
  }

  changeTheme() {
    if (this.currentUser.businessType.isAlberta || this.reviewer) {
      //Dynamically add stylesheet in Head Section
      let node = document.createElement('link');
      node.href = 'assets/css/common-alberta.css';
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    } else {
      $('link[href="assets/css/common-alberta.css"]').remove();
    }
  }

  reverseClaim() {
    //465 issue
    this.claimService.isReverseClaimBtnClickedFromSearchClaimScreen = true
    if (this.searchClaimForm.value.referenceno && (this.searchClaimForm.value.referenceno != "" || this.searchClaimForm.value.referenceno != null || this.searchClaimForm.value.referenceno != undefined)) {
      this.showLoader = true
      this.searchClaimForm.get('referenceno').clearValidators();
      this.searchClaimForm.get('referenceno').updateValueAndValidity();
      var reqParam = {
        "claimReferenceNumber": +this.searchClaimForm.value.referenceno
      }
      this.hmsDataService.postApi(ClaimApi.getReverseClaim, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.searchClaimForm.patchValue({ 'businessType': "", 'claimno': data.result.claimNumber, 'referenceno': '' })
         
          /* Log #986 */
          this.getClaimDisciplineKey().then(res => {
            if (this.reverseDisciplineKey != "" && this.reverseDisciplineKey != "undefined") {
              this.router.navigate(["/claim/view/" + data.result.claimNumber + "/type/" + this.reverseDisciplineKey]);
              this.showSearchBtn()
              this.showLoader = false
            }
          });
        } else if (data.code == 400 && data.status == "BAD_REQUEST") {
          this.showLoader = false
          this.searchClaimForm.controls['referenceno'].setErrors({
            "referenceNotValid": true
          });
        } else if (data.code == 404 && data.status == "NOT_FOUND") {
          this.showLoader = false
          this.reverseClaimMessage = data.hmsMessage.messageShort
          this.hmsDataService.OpenCloseModal("showReverseClaimMsg")
        }
      },(error) => {      
      })
    } else {      
      this.searchClaimForm.get('referenceno').setValidators(Validators.required);
      this.searchClaimForm.get('referenceno').updateValueAndValidity();
      this.validateAllFormFields(this.searchClaimForm)
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }
  closeModal() {
    this.reverseClaimMessage = ""
  }

  onCheckCheque() {
    this.router.navigate(['/finance/transaction-search'])
    let params = {
      'businessType': this.searchClaimForm.value.businessType,
      'discipline': this.searchClaimForm.value.disciplineType,
      'fromClaim': false
    }
    this.currentUserService.transactionQueryParams = params

  }

  clearAllValidator() {
    this.searchClaimForm.get('entry_from_date').clearValidators()
    this.searchClaimForm.get('entry_from_date').updateValueAndValidity();
    this.searchClaimForm.get('entry_to_date').clearValidators();
    this.searchClaimForm.get('entry_to_date').updateValueAndValidity();

    this.searchClaimForm.get('service_from_date').clearValidators();
    this.searchClaimForm.get('service_from_date').updateValueAndValidity();
    this.searchClaimForm.get('service_to_date').clearValidators();
    this.searchClaimForm.get('service_to_date').updateValueAndValidity();
  }

  /**
   * On Change Field
   * Discipline Type
   * @param event 
   */
  onChangeDiscType(event) {
    if (event.target.value && event.target.value != undefined) {
      switch (event.target.value) {
        case "DENTAL":
          this.discTypeSelected = 1;
          break;
        case "VISION":
          this.discTypeSelected = 2;
          break;
        case "HEALTH":
          this.discTypeSelected = 3;
          break;
        case "DRUG":
          this.discTypeSelected = 4;
          break;
        case "SUPPLEMENTAL":
          this.discTypeSelected = 5;
          break;
        case "WELLNESS":
          this.discTypeSelected = 6;
          break;
        case "ALL":
          this.discTypeSelected = 0;
          break;
        default:
          this.discTypeSelected = 0;
          break;
      }
    }
  }

  /**
   * On Selected Predictive Search Reference Number
   * 23 Aug 2019
   */
  onReferenceNumSelected(selected: CompleterItem) {
    if (selected) {
      this.referenceNum = selected.originalObject
    }
  }

  /**
   * Get Predictive Search Reference Number
   * 23 Aug 2019
   */
  getPredictiveRefNumSearchData(completerService) {
    this.referenceNumData = completerService.remote(
      null,
    );
    this.referenceNumData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.referenceNumData.urlFormater((term: any) => {
      return ClaimApi.predictiveSearchForReferenceIdUrl + `/${this.discTypeSelected}` + `/${term}`;
    });
    this.referenceNumData.dataField('result');
  }

  /**
   * On Selected Predictive Search Operator ID
   * 26 Aug 2019
   */
  onOperatorIDSelected(selected: CompleterItem) {
    if (selected) {
      this.referenceNum = selected.originalObject
    }
  }

  /**
   * Get Predictive Search Operator ID
   * 26 Aug 2019
   */
  getPredictiveOperatorIDSearchData(completerService) {
    this.operatorIdData = completerService.remote(
      null,
    );
    this.operatorIdData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.operatorIdData.urlFormater((term: any) => {
      return ClaimApi.predictiveSearchForOperatorIdUrl + `/${this.discTypeSelected}` + `/${term}`;
    });
    this.operatorIdData.dataField('result');
  }

  isNumberKey(event) {
    return (event.ctrlKey || event.altKey
      || (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false)
      || (95 < event.keyCode && event.keyCode < 106)
      || (event.keyCode == 8) || (event.keyCode == 9)
      || (event.keyCode > 34 && event.keyCode < 40)
      || (event.keyCode == 46))
  }

  /* Log #986 */
  getClaimDisciplineKey() {
    let promise = new Promise((resolve, reject) => {
      this.showPreAuthorizedByReview = (this.searchClaimForm.value.businessType == "AB Gov.") ? true : false;
      if (this.searchClaimForm.value.isDashboard == 'T') {
        var date = new Date();
        let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        this.searchClaimForm.patchValue({ 'entry_from_date': this.changeDateFormatService.formatDateObject(firstDay), 'entry_to_date': this.changeDateFormatService.getToday() });
      }
      var service_from_date = this.searchClaimForm.value.service_from_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.service_from_date) : "";
      var entry_from_date = this.searchClaimForm.value.entry_from_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.entry_from_date) : "";
      var release_from_date = this.searchClaimForm.value.release_from_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.release_from_date) : "";
      var service_to_date = this.searchClaimForm.value.service_to_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.service_to_date) : "";
      var entry_to_date = this.searchClaimForm.value.entry_to_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.entry_to_date) : "";
      var release_to_date = this.searchClaimForm.value.release_to_date ? this.changeDateFormatService.convertDateObjectToString(this.searchClaimForm.value.release_to_date) : "";
      this.showSearchTable = true
      let releasedValue = ''
      if (this.searchClaimForm.value.released == true && (this.searchClaimForm.value.unReleased == false || this.searchClaimForm.value.unReleased == null)) {
        releasedValue = 'T'
      } else if (this.searchClaimForm.value.unReleased == true && (this.searchClaimForm.value.released == false || this.searchClaimForm.value.released == null)) {
        releasedValue = 'F'
      } else {
        releasedValue = ''
      }
      let claimAttachedCheck
      let businessType
      if (this.searchClaimForm.value.businessType) {
        businessType = this.searchClaimForm.value.businessType
      } else {
        businessType = ""
      }
      let claimType
      if (this.searchClaimForm.value.claimType) {
        claimType = this.searchClaimForm.value.claimType
      } else {
        claimType = ""
      }
      let claimStatus
      if (this.searchClaimForm.value.claimStatus) {
        claimStatus = this.searchClaimForm.value.claimStatus
      } else {
        claimStatus = ""
      }
      if (this.searchClaimForm.value.disciplineType == "SUPPLEMENTAL") {
        this.searchClaimForm.value.disciplineType = "HSA";
      } else {
        this.searchClaimForm.value.disciplineType = this.searchClaimForm.value.disciplineType
      }

      var reqParam = {
        'claimCategory': this.searchClaimForm.value.disciplineType,
        'refId': this.searchClaimForm.value.referenceno,
        'cardNumber': this.searchClaimForm.value.cardno,
        'released': releasedValue,
        'claimNo': this.searchClaimForm.value.claimno,
        'name': this.searchClaimForm.value.cardHolder,
        'procedureCode': this.searchClaimForm.value.procedureCode,
        'claimType': claimType,
        'status': claimStatus,
        'operator': this.searchClaimForm.value.operatorID,
        'entryStartDate': entry_from_date,
        'entryEndDate': entry_to_date,
        'releaseStartDate': release_from_date,
        'releaseEndDate': release_to_date,
        'serviceStartDate': service_from_date,
        'serviceEndDate': service_to_date,
        'monthNum': this.searchClaimForm.value.monthNum,
        'isDashboard': this.searchClaimForm.value.isDashboard,
        'businessType': this.searchClaimForm.value.businessType,
        'personFirstName': this.searchClaimForm.value.firstName,
        'personLastName': this.searchClaimForm.value.lastName,
        'licenseNumber': this.searchClaimForm.value.license,
        'isReversed': this.searchClaimForm.value.isReversed,
        "start": 0,
        "length": 5,
        "draw": 1,
      }

      this.dTypeL = this.searchClaimForm.value.disciplineType
      this.refNoL = this.searchClaimForm.value.referenceno
      this.refNoLPayee = this.searchClaimForm.value.payee
      this.cardNoL = this.searchClaimForm.value.cardno
      this.claimNoL = this.searchClaimForm.value.claimno
      this.releasedL = releasedValue
      this.cardHolderL = this.searchClaimForm.value.cardHolder
      this.procedureCodeL = this.searchClaimForm.value.procedureCode
      this.claimTypeL = claimType
      this.claimStatusL = claimStatus
      this.payableL = ''
      this.footerentryDate = ''
      this.deductibleL = ''
      this.operatorIDL = this.searchClaimForm.value.operatorID
      this.entry_from_dateL = this.searchClaimForm.value.entry_from_date
      this.entry_to_dateL = entry_to_date
      this.release_from_dateL = this.searchClaimForm.value.release_from_date
      this.release_to_dateL = release_to_date
      this.service_from_dateL = service_from_date
      this.service_to_dateL = service_to_date
      this.monthNumL = this.searchClaimForm.value.monthNum
      this.isDashboardL = this.searchClaimForm.value.isDashboard
      this.businessTypeL = this.searchClaimForm.value.businessType
      this.firstNameL = this.searchClaimForm.value.firstName
      this.lastNameL = this.searchClaimForm.value.lastName
      this.licenseL = this.searchClaimForm.value.license
      this.isReversedL = this.searchClaimForm.value.isReversed
      if (this.searchClaimForm.value.entry_from_date) {
        if (!this.searchClaimForm.value.entry_to_date) {
          this.dateNameArray["entryDate"] = {
            year: this.entry_from_dateL.date.year,
            month: this.entry_from_dateL.date.month,
            day: this.entry_from_dateL.date.day
          };
        } else {
          this.dateNameArray["entryDate"] = ''
        }
      }
      else {
        this.dateNameArray["entryDate"] = ''
      }

      //Service Start Date
      if (this.searchClaimForm.value.service_from_date) {
        if (!this.searchClaimForm.value.service_end_date) {
          this.dateNameArray["serviceStartDate"] = {
            year: this.service_from_dateL,
            month: this.service_from_dateL,
            day: this.service_from_dateL
          };
        } else {
          this.dateNameArray["serviceStartDate"] = ''
        }
      }
      else {
        this.dateNameArray["serviceStartDate"] = ''
      }
      //End Date

      if (!this.filterSearch) {
        this.dateNameArray["receivedDate"] = {}
      }
      else {
        this.filterSearch = false
      }

      var url = ClaimApi.getClaimSearchByFilter
      this.hmsDataService.postApi(ClaimApi.getClaimSearchByFilter, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.reverseDisciplineKey = data.result.data[0].disciplineKey
          resolve();
        } else {
          this.reverseDisciplineKey = "";
          resolve();
        }
      }, (error) => {
        
      })
    });
    return promise
  }

  getLockProcessor() {
  }

  

  /* Common method with different flow of Reverse and Reissue claim */
  reverseAndReissueClaimCommon(refId, disciplineKey, businessTypeCd, personDate, iconType, reissueClaimKey) {
    
    this.existingRefId = refId
    this.disciplineKey = disciplineKey
    this.claimService.isReverseClaimBtnClickedFromSearchClaimScreen = true
    this.showLoader = true
    var reqParam = {
      "claimReferenceNumber": +refId
    }
    this.hmsDataService.postApi(ClaimApi.getReverseClaim, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.claimKey = data.result.claimNumber
        this.reIsssueClaimKey = data.result.claimNumber
        this.searchClaimForm.patchValue({ 'businessType': "", 'claimno': data.result.claimNumber, 'referenceno': '' })        
        this.showSearchBtn()
        this.showLoader = false
       
        // Now we have to Adjudicate and release claim process in case of Reverse and Reissue for new entry as discussed with Arun sir 
        this.getClaimDetail(this.claimKey, this.disciplineKey).then(res => {
          if ((this.cardholderKey != "" && this.cardholderKey != undefined) || (this.personDtOfBirth != "" && this.personDtOfBirth != undefined)) {
            let submitType = ""
            submitType = this.claimService.getSubmitParam(this.disciplineKey)
            let submitInfo = {
              "businessTypeCd": businessTypeCd,
              "cardholderKey": this.cardholderKey,
              "dtOfBirth": this.personDtOfBirth//this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ClaimCardHolderFormGroup.dob)
            }
            submitInfo[submitType] = {
              "claimKey": this.claimKey,
            }
            this.claimAdjudication(submitInfo, iconType)
          }
        })
      } else if (data.code == 400 && data.status == "BAD_REQUEST") {
        this.showLoader = false
        this.toastrService.error(this.translate.instant('claims.claims-toaster.claimNotReversed'))
      } else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.showLoader = false
        this.reverseClaimMessage = data.hmsMessage.messageShort
        this.hmsDataService.OpenCloseModal("showReverseClaimMsg")
      } else {
        this.showLoader = false
        this.toastrService.error(this.translate.instant('claims.claims-toaster.claimNotReversed'))
      }
    },(error) => {
    })
  } 

  getClaimDetail(claimKey, disciplineKey) {
    let promise = new Promise((resolve, reject) => {
    var submitData = {}
    let submitType = this.claimService.getSubmitParam(disciplineKey)
    submitData[submitType] = {
      "claimKey": claimKey,
      "userId": localStorage.getItem('id')
    }
    this.hmsDataService.postApi(ClaimApi.getClaimDetailsUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.claimDataArr = data.result
        this.cardholderKey = data.result.cardholderKey
        this.personDtOfBirth = data.result[submitType].personDtOfBirth
        this.refId = data.result[submitType].refId
        resolve()
      } else {
        this.cardholderKey = ""
        this.personDtOfBirth = ""
        resolve()
      }
    })
    })
    return promise
  }

  claimAdjudication(submitInfo, iconType) {
    $('.dataTables_processing').show();
    this.hmsDataService.postApi(ClaimApi.adjudicateClaim, submitInfo).subscribe(data => {
      $('.dataTables_processing').hide();
      if (data.code == 200 && data.status === "OK") {
        
        // Release Claim Functionality
        this.releaseClaim(iconType)
      } else if (data.code == 400 && data.status === "BAD_REQUEST") {
        this.getAdjudicateStatus(data.hmsMessage.messageShort, data.result)
      } else if (data.code == 404 && data.status === "NOT_FOUND") {
        this.getAdjudicateStatus(data.hmsMessage.messageShort, data.result)
      } else if (data.code == 403 && data.status === "FORBIDDEN") {
        this.getAdjudicateStatus(data.hmsMessage.messageShort, data.result)
      } else {
        this.getAdjudicateStatus(data.hmsMessage.messageShort, data.result)
      }
      
    });
  }

  getAdjudicateStatus(status, message) {
    this.adjudicatedStatus = status
    if (this.adjudicatedStatus == "CLAIM_IS_AJUDICATED") {
    
    } else if (this.adjudicatedStatus == "CANNOT_ADJUDICATE_PAID_CLAIM") {
      this.adjudicatedMessage = "Paid Claim Cannot be Adjudicated"
      this.toastrService.error(this.adjudicatedMessage)
    } else if (this.adjudicatedStatus == "CLAIM_NOT_FOUND") {
      this.adjudicatedMessage = "Claim Not Found"
      this.toastrService.error(this.adjudicatedMessage)
    } else if (this.adjudicatedStatus == "CLAIM_IS_NOT_RELEASED") {
      this.adjudicatedMessage = message
      this.toastrService.error(this.adjudicatedMessage)
    } else if (this.adjudicatedStatus == "CLAIM_IS_NOT_AJUDICATED") {
      if (message) {
        this.adjudicatedMessage = message
        this.toastrService.error(this.adjudicatedMessage)
      } else {
        this.adjudicatedMessage = "Claim Is Not Adjudicated For Some Reason!!"
        this.toastrService.error(this.adjudicatedMessage)
      }
    } else if (this.adjudicatedStatus == "DOB_DOES_NOT_EXIST") {
      this.adjudicatedMessage = "Claim is now adjudicated and rejected because CardHolder Entered DOB doesn't Exist in system"
      this.toastrService.error(this.adjudicatedMessage)
    } else {
      this.adjudicatedMessage = "Claim is now adjudicated and rejected because Based on Client's eligibility the service is payable at 0 percent of the allowed amount"
      this.toastrService.error(this.adjudicatedMessage)
    }
  }

  /* Release Claim Process After Above Adjudicate  */
  releaseClaim(iconType) {
    var submitType = ""
    submitType = this.claimService.getSubmitParam(this.disciplineKey)
    if (this.claimDataArr && this.claimDataArr !== undefined) {
      if (this.claimDataArr[submitType].bussinessType == 'Quikcard' && this.claimDataArr[submitType].pendingPaperWork == 'T') {
        this.toastrService.error("Pending paperwork claims cannot be released")
        return
      }
      if (this.claimDataArr.claimStatusCd === "X" && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Can only release APPROVED claims.")
      } 
    
      else if ((this.claimDataArr.claimStatusCd === "C" || this.claimDataArr.claimStatusCd === "P") && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Cannot release a PENDING FUNDS - OVER CREDIT LIMIT claim.")
      }
      if ((this.claimDataArr.claimTypeCd === "A" || this.claimDataArr.claimTypeCd === "U" || this.claimDataArr.claimTypeCd === "V") && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Cannot release this Pre-Authorized claims.");
      } else if (this.claimDataArr.claimTypeCd === "E" && this.claimDataArr.releaseInd === "T") {
        this.toastrService.error("Cannot release an Eligibility Enquiry claim.");
      }
    } else {
      this.toastrService.error("No Data Found!!");
    }
    var submitData = {}
    //For Dental Case
    if (submitType == "dentalClaim") {
      submitData = {
        "claimKey": +this.claimKey,
        "discipline": +this.disciplineKey,
        "userId": +this.UserID,
        "dentalClaim": {
          "claimStatusCd": this.claimDataArr.dentalClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.dentalClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.dentalClaim.claimTypeCd
      }
    } else if (submitType == "visionClaim") {
      submitData = {
        "claimKey": +this.claimKey,
        "discipline": +this.disciplineKey,
        "userId": +this.UserID,
        "visionClaim": {
          "claimStatusCd": this.claimDataArr.visionClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.visionClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.visionClaim.claimTypeCd
      }
    } else if (submitType == "healthClaim") {
      submitData = {
        "claimKey": +this.claimKey,
        "discipline": +this.disciplineKey,
        "userId": +this.UserID,
        "healthClaim": {
          "claimStatusCd": this.claimDataArr.healthClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.healthClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.healthClaim.claimTypeCd
      }
    } else if (submitType == "drugClaim") {
      submitData = {
        "claimKey": +this.claimKey,
        "discipline": +this.disciplineKey,
        "userId": +this.UserID,
        "drugClaim": {
          "claimStatusCd": this.claimDataArr.drugClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.drugClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.drugClaim.claimTypeCd
      }
    } else if (submitType == "hsaClaim") {
      submitData = {
        "claimKey": +this.claimKey,
        "discipline": +this.disciplineKey,
        "userId": +this.UserID,
        "hsaClaim": {
          "claimStatusCd": this.claimDataArr.hsaClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.hsaClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.hsaClaim.claimTypeCd
      }
    } else if (submitType == "wellnessClaim") {
      submitData = {
        "claimKey": +this.claimKey,
        "discipline": +this.disciplineKey,
        "userId": +this.UserID,
        "wellnessClaim": {
          "claimStatusCd": this.claimDataArr.wellnessClaim.claimStatusCd,
          "releaseInd": this.claimDataArr.wellnessClaim.releaseInd
        },
        "claimTypeCd": this.claimDataArr.wellnessClaim.claimTypeCd
      }
    } else {
      submitData = {
        "claimKey": +this.claimKey,
        "discipline": +this.disciplineKey,
        "userId": +this.UserID
      }
    }
    let is_from_cardholder = '';
    let is_from_searched = '';
    this.hmsDataService.postApi(ClaimApi.releaseClaim, submitData).subscribe(data => {

      if (data.code == 200 && data.status === "OK" && data.hmsMessage.messageShort == "CLAIM_IS_RELEASED") {
        if (iconType == "Reissue") {
          
          this.saveAndUpdateAdjClaimRequestAPI(this.existingRefId)
          // New API integrated as discussed with Arun sir
          this.getReissueClaim(this.refId, this.disciplineKey)
        } else {
          this.saveAndUpdateAdjClaimRequestAPI(this.existingRefId)
          this.router.navigate(["/claim/view/" + this.claimKey + "/type/" + this.disciplineKey]);
        }
        this.showLoader = false;
      } else if (data.code == 400 && data.status === "BAD_REQUEST" && data.hmsMessage.messageShort == "CLAIM_IS_NOT_RELEASED") {
        this.showLoader = false;
        this.toastrService.error(data.result)
      } else if (data.code == 404 && data.status === "NOT_FOUND" && data.hmsMessage.messageShort == "A Claim must have a Transaction before it can have a Status of Approved.") {
        this.showLoader = false;
        this.toastrService.error("A Claim must have a Transaction before it can have a Status of Approved.")
      } else if (data.code == 404 && data.status === "NOT_FOUND" && data.hmsMessage.messageShort == "This Transaction is already Approved.") {
        this.showLoader = false;
        this.toastrService.error("This Transaction is already Approved.")
      } else if (data.code == 404 && data.status === "NOT_FOUND" && data.hmsMessage.messageShort == "Cannot release this Pre-Authorized claims.") {
        this.showLoader = false;
        this.toastrService.error(data.hmsMessage.messageShort)
      } else {
        this.showLoader = false;
        this.toastrService.error(data.hmsMessage.messageShort)
      }
    });
    /** End Release Claim Process After Above Adjudicate */
  }

  testing(refId, disciplineKey, businessTypeCd, personDate, type, reissueClaimKey) {
    this.adjudicatedMessage = "Claim is now adjudicated and rejected because Based on Client's eligibility the service is payable at 0 percent of the allowed amount"
    this.toastrService.error(this.adjudicatedMessage)    
  }

  getReissueClaim(refId, discKey) {
    let request = {
      'claimReferenceNumber': refId
    }
    this.hmsDataService.postApi(ClaimApi.getReissueClaimUrl, request).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.router.navigate(["/claim/view/" + data.result.claimNumber + "/type/" + discKey]);
      } else if (data.code == 400 &&  data.hmsMessage.messageShort == "CANNOT_REISSUE_UNRELEASED_CLAIM") {
        this.toastrService.error("Cannot reissue un-released claim")
      } else if (data.code == 400 &&  data.hmsMessage.messageShort == "CANNOT_REISSUE_CLAIM_THAT_HAS_NO_CLAIM_ITEM") {
        this.toastrService.error("Cannot reissue claim that has no claim item")
      } else if (data.code == 400 &&  data.hmsMessage.messageShort == "REISSUE_OF_CLAIM_IS_NOT_SUPPORTED") {
        this.toastrService.error("Reissue of claim is not supported")
      } else if (data.code == 400 && data.hmsMessage.messageShort == "CANNOT_REVERSE_UNPAID_CLAIM_WHICH_IS_NOT_CREATED_BY_ITRANS") {
        this.toastrService.error("Cannot reissue unpaid claim which is not created by ITRANS")
      } else if (data.code == 404 && data.hmsMessage.messageShort == "CANNOT_REVERSE_UNPAID_CLAIM_WHICH_IS_NOT_CREATED_BY_ITRANS") {
        this.toastrService.error("Cannot reissue unpaid claim which is not created by ITRANS")
      } else {
        this.toastrService.error("Cannot reissue a claim!")
      }
    })
  }

  // Calling saveAndUpdateAdjClaimRequest API after Reissue and Reverse Success
  saveAndUpdateAdjClaimRequestAPI(claimRefNo) {
    let request = {
      "claimNumber": claimRefNo
    }
    this.hmsDataService.postApi(ClaimApi.saveAndUpdateAdjClaimRequestUrl, request).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == "RECORD_UPDATED_SUCCESSFULLY") {    
      } else if (data.code == 400 && data.hmsMessage.messageShort == "RECORD_UPDATE_FAILED") {    
      } else {   
      }
    })
  }
 
}