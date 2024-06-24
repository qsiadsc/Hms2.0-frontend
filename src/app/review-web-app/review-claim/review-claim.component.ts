import { Component, OnInit, Input, ViewChildren, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { TranslateService, FakeMissingTranslationHandler } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { ReviewAppApi } from '../reviewApp-api'
import { ReviewAppService } from '../reviewApp.service'
import { ExportClaimLetterComponent } from '../export-report/export-claim-letter/export-claim-letter.component'
import { ClaimApi } from '../../claim-module/claim-api';
import { drawDOM, exportPDF, DrawOptions, Group } from '@progress/kendo-drawing';
import { saveAs } from '@progress/kendo-file-saver';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { Subscription } from 'rxjs/Subscription';
import { ClaimService } from '../../claim-module/claim.service';
import { CompleterData, CompleterService, CompleterItem } from 'ng2-completer';
import { DropdownSettings } from 'angular2-multiselect-dropdown/multiselect.interface';

@Component({
  selector: 'app-review-claim',
  templateUrl: './review-claim.component.html',
  styleUrls: ['./review-claim.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, DatatableService, TranslateService]
})
export class ReviewClaimComponent implements OnInit {
  firstDay: Date;
  changedClainType: string;
  checkClaimType: any;
  selectedClaimTypeKey: any;
  isOpen: boolean;
  arrClaimTypeData: any;
  arrClaimType: any;
  oldClaimTypeRequest: Subscription;
  bsnsTypeCd: any;
  bsnsType: any;
  ltrContntLine4: string;
  daspContent: string;
  arr: any;
  customComentText: any;
  error: { isError: boolean; errorMessage: string; };
  selctedDropDownVal: any;
  reviewStatusArray = [];
  showMultiple: boolean;
  businessTypeCd: any;
  showPaperHeading: boolean = false;
  claimHeading: any;
  reviewclaimantFirstName;
  reviewFileNo;
  reviewSelectedClaimType;
  reviewGenerated;
  reviewclaimantLastName;
  referReviewStatus;
  reviewClaimNumber;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  ObservableClaimObj;
  checkClaim = true
  columns = [];
  FormGroup: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  dateNameArray = {}
  showSearchTable: boolean = false
  disableSearch: boolean = false
  setClaimTypeFocus: boolean
  editClaimType: any
  resetBulatine: any
  imgUrl;
  filters;
  doctorStatusList = []
  printClaimParams = []
  details = [];
  treatmentCategoryList;
  reReviewedList;
  reviewerList = false;
  sourceList;
  claimTypeList;
  reviewDropDown = [];
  DASPStatusList = []
  iTransStatusList = []
  dashboardReviewStatus = ""
  userId: any;
  reviewStatus
  claimId
  printDetails: any;
  providerDetails: any;
  providerTotals: any;
  serviceData: any;
  MessageData: any;
  patient: string;
  address: any;
  selectedItems = [];
  dropdownSettings: any = {};
  provider: any;
  providerAddress: any;
  providerLttrAdrs: any;
  ltrReference: any;
  ltrPatientName: any;
  ltrCrdNum: any;
  ltrDateOfBirth: any;
  currentUser: any;
  ltrDate: string;
  ltrContntLine1: string;
  ltrContntLine2: string;
  ltrContntLine3: string;
  CustomeMessageData: any;
  isFileContent: boolean = false;
  showLoader: boolean = false;
  openPrintLtr: boolean = false;
  subClaimType: Subscription;
  signImage = location.origin + '/assets/images/signature.jpg'
  authChecks = [{
    'claimSearch': 'F',
    'download': 'F',
    'printList': 'F',
  }]
  claimTypeVal: string = ''
  constructor(
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private reviewAppService: ReviewAppService,
    private route: ActivatedRoute,
    private router: Router,
    private currentUserService: CurrentUserService,
    private claimService: ClaimService,
    private completerService: CompleterService
  ) {
    this.subClaimType = claimService.getCardKey.subscribe(value => {
      this.bsnsType = value.bussinessType
      this.bsnsTypeCd = value.bussinessTypeCd
    })
  }
  //Pre-Authorized By Review
  ngOnInit() {
    // Added for Loader until menu items appears.
    this.FormGroup = this.fb.group({
      review: [null],
      generate: [null],
      reviewStatus: [null],
      claimType: [""],
      start_date: [''],
      end_date: [''],
      source: [null],
      DASPStatus: [null],
      iTransStatus: [null],
      fileNo: [],
      claimantFirstName: [],
      claimantLastName: [],
      claimNo: [],
      treatmentCategory: [null],
      reReviewed: [null],
      reviewer: [null],
    })
    this.showLoader = true 
    this.currentUserService.showLoading.subscribe(value=>{
      this.showLoader = false          
    })
    this.currentUserService.claimsClick.subscribe(value=>{
        this.showLoader = false
    }) // End
      if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.getAuthArray();
        this.afterAuth();
    this.getBusinessType()
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUser = this.currentUserService.currentUser;
      this.getAuthArray()
      this.afterAuth()
      this.getBusinessType()
    }
    this.showMultiple = localStorage.getItem('role') == 'reviewer' ? false : true
    this.getRulesByBenefit(); // claim dashboard data available error 4 may 2020
    this.getDASPStatus()
    this.getiTransStatus()
    this.dropdownSettings = this.multiSelectDropdownEnable();
    /**
    * @param columns for search table with translations
    * @function intailze empty datatable for search
    * 
    */
    this.imgUrl = location.origin + '/assets/images/alberta-logo-print.png';
    var claimKey
    var disciplineKey
    var reviewKey
    var reviewStatus
    var isApproved = false
    var self = this
    $(document).on('click', ".pdf-ico", function (e) {
      self.claimId = $(this).data('claimkey')
      self.reviewStatus = $(this).data('status')
      self.showLoader = true
      self.openPrintLtr = true
      self.fillDetailsForPrint()
    })

    $(document).on('click', 'table#searchReviewClaim tbody tr td:not(:last-child)', function () {
      var viewRow = $(this).parent('tr').find('td').find('a.pdf-ico')
      var claimKey = viewRow.data('claimkey')
      var discipline = viewRow.data('discipline')
      var reviewKey = viewRow.data('reviewkey')
      self.currentUserService.showReviewBackButton = true
      if(claimKey){                                                 //to resolved calendar issue(17/05/2023)
        if (self.router.url.includes('RR')) {
          self.router.navigate(["/claim/view/" + claimKey + "/type/" + discipline + "/reviewer/" + reviewKey], { queryParams :{'isDash': 'RR'}});
        } else {
          self.router.navigate(["/claim/view/" + claimKey + "/type/" + discipline + "/reviewer/" + reviewKey]);
        }
      }
    })

    $(document).on('keydown', '#searchReviewClaim .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
  }

  afterAuth() {
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if (this.checkClaim = true) {
        if ('reviewApp.claim-search-table.reviewStatus' == this.translate.instant('reviewApp.claim-search-table.reviewStatus')) {
        } else {
          this.columns = [
            { title: this.translate.instant('reviewApp.claim-search-table.reviewStatus'), data: 'reviewStatus' },
            { title: this.translate.instant('reviewApp.claim-search.generate'), data: 'generated' },
            { title: this.translate.instant('reviewApp.claim-search.source'), data: 'source' },
            { title: this.translate.instant('reviewApp.claim-search.treatmentCategory'), data: 'treatmentCategory' },
            { title: this.translate.instant('reviewApp.claim-search.refNo'), data: 'claimNumber' },
            { title: this.translate.instant('claims-history.claimtype'), data: 'claimType' },
            { title: this.translate.instant('reviewApp.claim-search.fileNo'), data: 'fileNumber' },
            { title: this.translate.instant('reviewApp.claim-search-table.createdDate'), data: 'createdDate' },
            { title: this.translate.instant('reviewApp.claim-search.claimantFirstName'), data: 'firstName' },
            { title: this.translate.instant('reviewApp.claim-search.claimantLastName'), data: 'lastName' },
            { title: this.translate.instant('reviewApp.claim-search.action'), data: 'claimKey' },
          ]
          this.route.params.subscribe((params: Params) => {
            this.reviewStatusArray = [];
            if (this.showMultiple) {
              if (params['type'] == 'DOC_NEW') {
                this.dashboardReviewStatus = params['type']
                this.FormGroup.patchValue({ 'reviewStatus': this.dashboardReviewStatus })
                this.reviewStatusArray = [];
                this.getClaimList()
              }
              else if (params['type'] == 'ref_to_doc') {
                this.dashboardReviewStatus = params['type']
                this.FormGroup.patchValue({ 'reviewStatus': this.dashboardReviewStatus })
                this.reviewStatusArray.push("ADDITIONAL INFORMATION");
                //UPDATE LIST FOR LOG 955 ON 20/07/2020
                this.reviewStatusArray.push("APPROVED");
                this.reviewStatusArray.push("DENIED");
                this.getClaimList()
              }
              else if (params['type'] == 'ref2') {
                this.dashboardReviewStatus = params['type']
                this.FormGroup.patchValue({ 'reviewStatus': this.dashboardReviewStatus })
                this.reviewStatusArray.push("REFER TO CONSULTANT");
                this.getClaimList()
              }
              else if (params['type'] == 'ref') {
                this.dashboardReviewStatus = params['type']
                this.FormGroup.patchValue({ 'reviewStatus': this.dashboardReviewStatus })
                this.reviewStatusArray.push("APPROVED", "DENIED", "PARTIALLY APPROVED");
                this.getClaimList()
              }
              else if (params['type'] == 'NEW') {
                this.dashboardReviewStatus = params['type']
                this.FormGroup.patchValue({ 'reviewStatus': this.dashboardReviewStatus })
                this.reviewStatusArray.push("REFER TO CONSULTANT");
                this.getClaimList()
              }
              else if (params['type'] == 'New') {
                this.dashboardReviewStatus = params['type']
                this.FormGroup.patchValue({ 'reviewStatus': this.dashboardReviewStatus })
                this.reviewStatusArray.push("APPROVED", "DENIED", "PARTIALLY APPROVED");
                this.getClaimList()
              }
            }
            // Check Status For Doctor 
            else {
              if (params['type']) {
                this.dashboardReviewStatus = params['type']
                this.FormGroup.patchValue({ 'reviewStatus': params['type'] })
                this.getClaimList()
              }
            }
            if (this.reviewAppService.reviewSearchData && this.currentUserService.isReviewBack) {
              this.FormGroup.patchValue(this.reviewAppService.reviewSearchData)
              this.currentUserService.isReviewBack = false
              if (this.reviewAppService.selectedReviewStatus != undefined && this.reviewAppService.selectedReviewStatus.length > 0) {
                this.reviewStatusArray = this.reviewAppService.selectedReviewStatus
              }
              if (this.reviewAppService.selectedClaimType != undefined && this.reviewAppService.selectedClaimType != "") {
                this.changedClainType = this.reviewAppService.selectedClaimType
              }
              this.getClaimList()
            }
          })
          this.checkClaim = false;
          this.ObservableClaimObj.unsubscribe();
        }
      }
    });
  }
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  getAuthArray() {
    this.userId = this.currentUser.userId;
    this.getDoctorStatus();
    let checkArray = this.currentUserService.authChecks['CSR']
    let searchCard = this.currentUserService.authChecks['RCL'].filter(val => val.actionObjectDataTag == 'RCL224').map(data => data)
    checkArray.push(searchCard[0])
    this.getAuthCheck(checkArray);
    this.GetClaimType()
  }
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.authChecks = [{
        'claimSearch': 'T',
        'download': 'T',
        'printList': 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.authChecks = [{
        'claimSearch': authCheck['RCL224'],
        'download': authCheck['CSR225'],
        'printList': authCheck['CSR226'],
      }]
    }
  }
  getDoctorStatus() {
    let role = localStorage.getItem('role')
    let sndReview = role == 'reviewer' ? "D" : "R"
    let url = ReviewAppApi.getDoctorStatus + '/' + sndReview
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.doctorStatusList = data.result
      } else {
        this.doctorStatusList = []
      }
    })
  }

  getClaimList() {
    this.showLoader = false
    this.printClaimParams = [];
    var date = new Date();
    if (this.disableSearch) {
      return;
    } else {
      let startDate = ""
      let endDate = ""
      if (localStorage.getItem('monthly') == "T") {
        this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth()) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
        endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
      }
      if (this.FormGroup.value.start_date) {
        startDate = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.start_date)
      }
      if (this.FormGroup.value.end_date) {
        endDate = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.end_date)
      }
      this.showSearchTable = true
      var reqParam = [
        { 'key': 'reviewed', 'value': this.FormGroup.value.review },
        { 'key': 'generated', 'value': this.FormGroup.value.generate },
        { 'key': 'reviewStatus', 'value': this.FormGroup.value.reviewStatus },
        { 'key': 'claimTypeCd', 'value': this.changedClainType || '' },
        { 'key': 'startDate', 'value': startDate },
        { 'key': 'endDate', 'value': endDate },
        { 'key': 'source', 'value': this.FormGroup.value.source },
        { 'key': 'DASPStatus', 'value': this.FormGroup.value.DASPStatus },
        { 'key': 'iTransStatus', 'value': this.FormGroup.value.iTransStatus },
        { 'key': 'fileNumber', 'value': this.FormGroup.value.fileNo },
        { 'key': 'firstName', 'value': this.FormGroup.value.claimantFirstName },
        { 'key': 'lastName', 'value': this.FormGroup.value.claimantLastName },
        { 'key': 'claimNumber', 'value': this.FormGroup.value.claimNo },
        { 'key': 'treatmentCategory', 'value': this.FormGroup.value.treatmentCategory },
        { 'key': 'reReviewed', 'value': this.FormGroup.value.reReviewed },
        { 'key': 'reviewer', 'value': localStorage.getItem('role') == 'referReviwer' ? 'REVIEWER' : "doctor" },
        { 'key': 'userId', 'value': this.currentUser.userId },
        { 'key': 'reviewStatusArray', 'value': this.reviewStatusArray }
      ]

      /*Grid Native Search fields to patches value*/
        this.reviewGenerated = this.FormGroup.value.generate 
        this.referReviewStatus = this.reviewStatusArray  
        this.reviewSelectedClaimType = this.FormGroup.value.claimType
        this.reviewClaimNumber = this.FormGroup.value.claimNo 
        this.reviewFileNo = this.FormGroup.value.fileNo 
        this.reviewclaimantFirstName = this.FormGroup.value.claimantFirstName 
        this.reviewclaimantLastName = this.FormGroup.value.claimantLastName 
      this.getRulesByBenefit(this.reviewStatusArray);
      this.printClaimParams = reqParam
      this.filters = true;
      var url = ReviewAppApi.getClaimList
      var params = []
      var tableActions = [
        { 'name': 'pdf', 'class': 'table-action-btn pdf-ico', 'icon_class': 'fa fa-download', 'title': 'PDF' }
      ]
        ;
      if (!$.fn.dataTable.isDataTable('#searchReviewClaim')) {
        var dateCols = ['createdDate'];
        this.dataTableService.jqueryDataTableSearchReviewClaim("searchReviewClaim", url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 10, [7], null, "printPreAuthLtr", [1, 2, 3, 4, 5, 6, 8, 9, 10])
      } else {
        this.dataTableService.jqueryDataTableReload("searchReviewClaim", url, reqParam)
      }
      this.reviewAppService.getReviewSearchData(this.FormGroup.value, this.reviewStatusArray, this.changedClainType)
      this.printClaimListing()
      $(window).scrollTop(0);         //this line added for stop scroling the page when open search is performed
      this.dateNameArray['createdDate'] = {}  // for cancel icon remove after search
      return false;
    }
  }
  onSelectedClaimType(e) {
    if (e) {
      this.changedClainType = e.originalObject.claimTypeCd
    } else {
      this.changedClainType = ''
    }
  }
  resetClaimSearch() {
    this.FormGroup.reset();
    this.selectedItems = [];
    this.changedClainType = ''
    this.reviewStatusArray = []
    $('.glyphicon-search').trigger('click');
    $('#searchReviewClaim .icon-mydpremove').trigger('click');
     this.showSearchTable = false // Search Results are not disappearing when click on Clear button in Refer Review Section (point no-281)
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.FormGroup.patchValue(datePickerValue);
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
      this.FormGroup.patchValue(datePickerValue);
    }
  }
  
  changeDateFormat1(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj != null) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  multiSelectDropdownEnable() {
    let dropdownSetting = {
      singleSelection: false,
      text: "Select Status",
      enableSearchFilter: false,
      classes: "myclass custom-class",
      disabled: false,
    };
    return dropdownSetting;
  }
  /**
   * Remove role on deselect role
   * @param item 
   * @param type 
   */

  onSelectDropDown(item: any) {
    this.reviewStatusArray.push(item.itemName)
  }

  onDeSelectDropDown(item, type) {
    if (type == 'reviewDropDown') {
      this.selctedDropDownVal = item.itemName
    }
    var uncheckItem = this.reviewStatusArray.indexOf(item)
    this.reviewStatusArray.splice(uncheckItem);
  }

  getRulesByBenefit(array = []) {
    this.selectedItems = []; // issue on search button 4 may 2020
    this.reviewDropDown = []
    let role = localStorage.getItem('role')
    let sndReview = role == 'reviewer' ? "D" : "R"
    let url = ReviewAppApi.getDoctorStatus + '/' + sndReview
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.reviewDropDown = []
        for (var i = 0; i < data.result.length; i++) {
          this.reviewDropDown.push({ 'id': data.result[i].dentalReviewStatusKey, 'itemName': data.result[i].claimReviewStatusDesc });
          array.indexOf(data.result[i].claimReviewStatusDesc) === -1 ? '' : this.selectedItems.push({ 'id': data.result[i].dentalReviewStatusKey, 'itemName': data.result[i].claimReviewStatusDesc });
        };
        this.route.params.subscribe((params: Params) => {
          if (params['type'] == 'DOC_NEW') {
            this.selectedItems = this.reviewDropDown.filter(function (val) {
              return val.itemName == 'REFER TO CONSULTANT';
            });
          }
        }
        )
      } else {
        this.reviewDropDown = []
        this.doctorStatusList = []
      }
    })
  }

  getClaimListByGridFilteration(tableId: string) {
    let arr = []
    var appendExtraParam = { 'key': 'claimTypeCd', 'value': this.claimTypeVal }
    let params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
    params.push({ 'key': 'source', 'value': '' })
    params.push({ 'key': 'treatmentCategory', 'value': '' })
    params.push({ 'key': 'reviewer', 'value': localStorage.getItem('role') == 'referReviwer' ? 'REVIEWER' : "doctor" })
    if (params[0].value != "") {
      arr = [params[0].value]
    }
    params.push({ 'key': 'reviewStatusArray', 'value': arr })
    var url = ReviewAppApi.getClaimList
    var dateParams = [5]
    this.dataTableService.jqueryDataTableReload("searchReviewClaim", url, params, dateParams)
    this.printClaimParams = params
    this.filters = false;
    this.printClaimListing()
  }

  resetTableSearch() {
    this.dataTableService.resetTableSearch()
    this.claimTypeVal = ''
    this.getClaimListByGridFilteration("searchReviewClaim")
    this.dateNameArray['createdDate'] = {}              // cancel icon remove after search
  }

  printClaimListing() {
    var items = this.printClaimParams;
    let submitData = {}
    if (this.filters == true) {
      submitData = {
        "reviewed": items[0].value,
        "generated": items[1].value,
        "reviewStatus": items[2].value,
        "claimType": items[3].value,
        "startDate": items[4].value,
        "endDate": items[5].value,
        "source": items[6].value,
        "DASPStatus": items[7].value,
        "iTransStatus": items[8].value,
        "fileNumber": items[9].value,
        "firstName": items[10].value,
        "lastName": items[11].value,
        "claimNumber": items[12].value,
        "treatmentCategory": items[13].value,
        "reReviewed": items[14].value,
        "reviewer": items[15].value,
        "userId": this.currentUser.userId,
      }
    }
    else {
      submitData = {
        "reviewStatus": items[0].value,
        "generated": items[1].value,
        "claimNumber": items[2].value,
        "claimType": items[3].value,
        "fileNumber": items[4].value,
        "createdDate": items[5].value,
        "firstName": items[6].value,
        "lastName": items[7].value,
        "source": items[8].value,
        "treatmentCategory": items[9].value,
        "userId": this.userId,
      }
    }
    this.hmsDataService.postApi(ReviewAppApi.printReviewUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.details = data.result;
      }
    });
  }

  print(element) {
    let printContents, popupWin;
    printContents = document.getElementById(element).innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
      <head>
      <style>
      //........Customized style.......
      </style>
      </head>
      <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
    return false
  }

  openModal(myModal) {
    myModal.open();
    this.fillDetailsForPrint()
  }

  closeModal(myModal) {
    myModal.close();
  }
  getDASPStatus() {
    this.DASPStatusList = [{ "DASPStatusDesc": "Complete" }, { "DASPStatusDesc": "New" }, { "DASPStatusDesc": "Pending Additional Info" }, { "DASPStatusDesc": "Pending Decision" }, { "DASPStatusDesc": "Pending Options" }, { "DASPStatusDesc": "Pending Review" }, { "DASPStatusDesc": "Pending Signature" }]
  }
  getiTransStatus() {
    this.iTransStatusList = [{ "iTransStatusDesc": "Administrative" }, { "iTransStatusDesc": "New" }, { "iTransStatusDesc": "Pending" }]
  }

  fillDetailsForPrint() {
    let submitData = {
      "disciplineKey": 1,
      "claimKey": this.claimId,
      "userId": this.currentUser.userId
    }
    this.hmsDataService.postApi(ClaimApi.DetailsForPrintUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showLoader = false
        this.printDetails = data.result;
        this.providerDetails = data.result;
        this.providerTotals = data.result;
        this.serviceData = data.result;
        this.MessageData = data.result;
        this.patient = data.result.name + '-' + data.result.cardNumber;
        this.address = data.result.cardFullAddress;
        this.provider = data.result.providerName;
        this.providerAddress = data.result.provBillingFullAddress;
        this.providerLttrAdrs = this.providerAddress.split(",");
        this.ltrReference = data.result.refId
        this.ltrPatientName = data.result.name
        this.ltrCrdNum = data.result.cardNumber
        this.ltrDateOfBirth = data.result.personDtOfBirth
        this.claimHeading = data.result.claimType
        if(this.claimHeading == 'Paper'){
          this.showPaperHeading = true
        }
        else{
          this.showPaperHeading = false
        }                                          //changed "paper" claimtype heading on
        this.providerDetails = [
          {
            'EntryDate': data.result.entryDate,
            'ClaimType': data.result.claimType,
            'Claimstatus': data.result.status,
            'Reference': data.result.refId,
            'RecievedDate': data.result.receivedOn,
            'Payee': data.result.payeeTypeName,
            'OperatorID': data.result.operator,
          }]
        this.providerTotals = [
          {
            'ClaimTotal': data.result.totalClaimedAmount,
            'AllowedTotal': data.result.totalAllowedAmount,
            'PaidCarrier': data.result.totalCarrierAmount,
            'NotCovered': data.result.totalNotCoveredAmount,
            'Deductible': data.result.totalDeductibleAmount,
            'TotalPayable': data.result.totalPayableAmount,
          }
        ]
        this.serviceData = data.result.items
        this.MessageData = data.result.itemMessages
        this.ltrDate = this.changeDateFormatService.formatDateLetter(data.result.lastReviewDate)
        this.daspContent = data.result.isDasp == "T" ? "DASP" : "Program" // add percent for dasp pending from API
        let dentalEx = data.result.isDasp == "T" ? "Dental Exceptions" : "The Review Committee"
        let terminate = data.result.isDasp == "T" ? "terminate." : "change or terminate."
        if (this.reviewStatus == "APPROVED") {
          this.ltrContntLine1 = dentalEx + "has reviewed the attached treatment plan on " + this.ltrDate + " for the above noted client.  This treatment plan has been approved."
          this.ltrContntLine2 = "This approval will be valid for one year from the date of this letter providing coverage does not " + terminate
          this.ltrContntLine3 = ""
        }
        if (this.reviewStatus == "PARTIALLY APPROVED") {
          this.ltrContntLine1 = dentalEx + " has reviewed the attached treatment plan on " + this.ltrDate + " for the above noted client. The approved items will be valid for one year from the date of the attached treatment plan providing coverage does not " + terminate
          this.ltrContntLine2 = data.result.reviewAdditonalInfo
          this.ltrContntLine4 = "The denied items have been denied for the following reason:"
          this.ltrContntLine3 = data.result.reviewExtrenalComment
        }
        if (this.reviewStatus == "DENIED") {
          this.ltrContntLine1 = dentalEx + "has reviewed the attached treatment plan on " + this.ltrDate + " for the above noted client.  This treatment plan has been denied for the following reason:"
          this.ltrContntLine2 = data.result.reviewAdditonalInfo
          this.ltrContntLine3 = data.result.reviewExtrenalComment
        }
        this.getSystemMessages();
      } else {
        this.showLoader = false
      }
    });

  }
  getSystemMessages() {
    var reqParam = {
      "discipline": 1,
      "claimKey": +this.claimId,//----Claim Id
    }
    this.hmsDataService.postApi(ClaimApi.getSystemMessages, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.CustomeMessageData = data.result
      } else {
        this.CustomeMessageData = []
      }
    })

  }
  exportLetter(element: HTMLElement, options?: DrawOptions) {
    this.isFileContent = true;
    drawDOM(element, options).then((group: Group) => {
      this.isFileContent = false;;
      return exportPDF(group);
    }).then((dataUri) => {
      saveAs(dataUri, 'Pre-Auth-Letter.pdf');
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

  // --------------------------  Refer to review dashboard
  GetClaimType() {
    let businessTypeCd = ""
    if (this.bsnsType) {
      businessTypeCd = this.bsnsTypeCd
    } else {
      if (this.currentUser.businessType.bothAccess) {
        businessTypeCd = ""
      } else {
        businessTypeCd = this.currentUser.businessType[0].businessTypeCd
      }
    }
    let submitInfo = {
      "businessTypeCd": businessTypeCd,
      "type": "R"
    }

    this.oldClaimTypeRequest = this.hmsDataService.postApi(ClaimApi.getClaimListByBsnsType, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.arrClaimType = data.result;
        this.arrClaimTypeData = this.completerService.local(
          this.arrClaimType,
          "claimTypeCd",
          "claimTypeDesc"
        );
      }
      else {
        this.arrClaimType = []
      }
    })
  }
  onSelectedClaimTypeFooter(selected) {
    if (selected) {
      this.claimTypeVal = selected.originalObject.claimTypeCd
    } else {
      this.claimTypeVal = ''
    }
  }

  getBusinessType() {
    let promise = new Promise((resolve, reject) => {
      this.userId = this.currentUserService.currentUser.userId
      var businessType = this.currentUserService.userBusinnesType
      if (businessType.bothAccess) {
        if (this.route.snapshot.url[0]) {
    let role = localStorage.getItem('role');
          if (this.route.snapshot.url[0].path == "alberta" || role =='referReviwer' ) {
            let val = businessType.filter(value => value.businessTypeCd == Constants.albertaBusinessTypeCd).map(data => data)
            this.businessTypeCd = val[0].businessTypeCd;
            this.changeTheme(this.businessTypeCd)
          }
        } else {
          if (this.currentUserService.bothAcessdefaultBussinesType && this.currentUserService.bothAcessdefaultBussinesType.length != 0) {
            this.businessTypeCd = this.currentUserService.bothAcessdefaultBussinesType.businessTypeCd;
          } else {
            this.businessTypeCd = businessType[0].businessTypeCd;
          }
          this.changeTheme(this.businessTypeCd)
        }
      } else {
        this.businessTypeCd = businessType[0].businessTypeCd;
      }
      resolve();
    })
    return promise;

  }

  changeTheme(businessTypeCd) {
    let role = localStorage.getItem('role');
    if (businessTypeCd == Constants.albertaBusinessTypeCd || role =='referReviwer' ) {
      let node = document.createElement('link');
      node.href = 'assets/css/common-alberta.css';
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    } else {
      $('link[href="assets/css/common-alberta.css"]').remove();
    }
  }
}
