import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../common-module/Constants';
import { Observable } from 'rxjs/Rx';
import { ReviewAppService } from '../reviewApp.service'
import { ReviewAppApi } from '../reviewApp-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ClaimApi } from '../../claim-module/claim-api';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { CommonApi } from '../../common-module/common-api';
import { ReferToReviewApi } from '../../refer-to-review-module/refer-to-review-api';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DatatableService, TranslateService, ChangeDateFormatService]
})
export class DashboardComponent implements OnInit {
  checkArray: any;
  role: string;
  startDate: string;
  endDate: string;
  firstDay: Date;
  showLoader: boolean = false;
  addBulatineBtn: boolean;
  deleteBulatineBtn: boolean;
  month: string;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  columns
  getVal: any;
  currentUser: any;
  businessTypeKey: any;
  ObservableClaimObj
  checkServiceProvider
  claimCountWithNewStatus
  businessTypeDesc: any;
  claimCountWithApprovedStatus
  claimCountWithDeniedStatus
  claimCountWithAdditionalInformationRequiredStatus
  claimCountPartialApprov
  claimCountWithBackToConsultant
  userId
  url;
  userRole = localStorage.getItem('role')
  authChecks = [{
    'newClaims': 'F',
    'approvedClaims': 'F',
    'deniedClaims': 'F',
    'additionalInformationRequired': 'F',
    'partialAproved': 'T'
  }]
  showBulletin: boolean = false;
  businessTypeCd: string;
  bulletinTxt: any;
  bulletinForm: FormGroup;
  categories = []
  lowIncomeCategoryList = []
  daspCategoryList = []
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private translate: TranslateService,
    private hmsDataService: HmsDataServiceService,
    private reviewAppService: ReviewAppService,
    private router: Router,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
  ) {
    currentUserService.loggedInUserVal.subscribe(val => {
      if (val) {
        this.currentUser = val
        this.getBusinessType()
        this.getDashboardCount()
        this.userId = val.userId;
      }
    })
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }
  getClaimListByGridFilteration(e){
  }
  ngOnInit() {
    this.showLoader = true
    this.getBtnPermission();
    this.bulletinForm = new FormGroup({
      bulletinTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty])
    });

    /* Set date to show the count(29-Mar-2023) */
    var date = new Date();
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth()) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
    this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
    this.url = localStorage.getItem('role') == "govOfficial" ? this.url = ReviewAppApi.getGovDashboardReviewList : this.url = ReviewAppApi.getDashboardReviewList
    
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth()) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
        this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        if ((localStorage.getItem('role') == 'govOfficial')) {
          this.checkArray = this.currentUserService.authChecks['RAD'].concat(this.currentUserService.authChecks['RCR'], this.currentUserService.authChecks['RTC'], this.currentUserService.authChecks['RDC'], this.currentUserService.authChecks['RAI'])
        }
        else {
          this.checkArray = this.currentUserService.authChecks['DAD'].concat(this.currentUserService.authChecks['DCR'], this.currentUserService.authChecks['DTC'], this.currentUserService.authChecks['DDC'], this.currentUserService.authChecks['DAI'])
        }
        this.getAuthCheck(this.checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUser = this.currentUserService.currentUser
      this.currentUserService.getUserAuthorization().then(res => {
        this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth()) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
        this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        if ((localStorage.getItem('role') == 'govOfficial')) {
          this.checkArray = this.currentUserService.authChecks['RAD'].concat(this.currentUserService.authChecks['RCR'], this.currentUserService.authChecks['RTC'], this.currentUserService.authChecks['RDC'], this.currentUserService.authChecks['RAI'])
        } else {
          this.checkArray = this.currentUserService.authChecks['DAD'].concat(this.currentUserService.authChecks['DCR'], this.currentUserService.authChecks['DTC'], this.currentUserService.authChecks['DDC'], this.currentUserService.authChecks['DAI'])
        }
        this.getAuthCheck(this.checkArray)
      });
    }
    var reqParam = [
      { 'key': 'disciplineKey', 'value': 1 },
      { 'key': 'userId', 'value': this.userId },]
    var tableActions = []
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if (this.checkServiceProvider = true) {
        if ('serviceProvider.search-table-column.effectiveDate' == this.translate.instant('serviceProvider.search-table-column.effectiveDate')) {
        } else {
          this.columns = [
            { title: this.translate.instant('reviewApp.dashboard.search-table-column.claim-no'), data: 'claimNumber' },
            { title: this.translate.instant('reviewApp.dashboard.search-table-column.claim-status'), data: 'reviewStatusDesc' },
            { title: this.translate.instant('reviewApp.dashboard.search-table-column.file-number'), data: 'fileNumber' },
            { title: this.translate.instant('reviewApp.dashboard.search-table-column.created-date'), data: 'createdOn' },
            { title: this.translate.instant('reviewApp.dashboard.search-table-column.claimant-name'), data: 'cardHolderName' },
          ]
          var dateCols = ['createdOn'];
          this.getClaimFileList("")
          this.checkServiceProvider = false;
          this.ObservableClaimObj.unsubscribe();
        }
      }
    });
    this.getCategoryList('LI')
  }

  getBusinessType() {
    var businessType = this.currentUserService.userBusinnesType
    if (businessType.bothAccess) {
      if (this.currentUserService.bothAcessdefaultBussinesType && this.currentUserService.bothAcessdefaultBussinesType.length != 0) {
        this.businessTypeDesc = this.currentUserService.bothAcessdefaultBussinesType.businessTypeDesc
        this.businessTypeCd = this.currentUserService.bothAcessdefaultBussinesType.businessTypeCd;
      } else {
        this.businessTypeDesc = businessType[0].businessTypeDesc;
        this.businessTypeCd = businessType[0].businessTypeCd;
      }
    } else {
      this.businessTypeDesc = businessType[0].businessTypeDesc;
      this.businessTypeCd = businessType[0].businessTypeCd;
    }
    this.getBulletin(this.businessTypeCd);
  }

  getAuthArray() {
  }

  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.authChecks = [{
        'newClaims': 'T',
        'approvedClaims': 'T',
        'deniedClaims': 'T',
        'additionalInformationRequired': 'T',
        'partialAproved': 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      if ((localStorage.getItem('role') == 'govOfficial')) {
        this.authChecks = [{
          'newClaims': authCheck['RAD219'],
          'approvedClaims': authCheck['RAD220'],
          'deniedClaims': authCheck['RAD221'],
          'additionalInformationRequired': authCheck['RAD222'],
          'partialAproved': 'T'
        }]
      }
      else {
        this.authChecks = [{
          'newClaims': authCheck['DAD290'],
          'approvedClaims': authCheck['DAD291'],
          'deniedClaims': authCheck['DAD292'],
          'additionalInformationRequired': authCheck['DAD293'],
          'partialAproved': 'T'
        }]
      }
    }
  }

  getDashboardCount() {
    let submitInfo = {
      "userId": this.currentUser.userId,
      "reviewer": localStorage.getItem('role') == 'govOfficial' ? '' : "doctor",
      "startDate": this.startDate, // Issue_no 763
      "endDate": this.endDate,   // Issue_no 763
    }
    this.hmsDataService.postApi(ReviewAppApi.getClaimCount, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.claimCountWithNewStatus = data.result.claimCountWithNewStatus
        this.claimCountWithApprovedStatus = data.result.claimCountWithApprovedStatus
        this.claimCountWithDeniedStatus = data.result.claimCountWithDeniedStatus
        this.claimCountWithAdditionalInformationRequiredStatus = data.result.claimCountWithAdditionalInformationRequiredStatus
        this.claimCountPartialApprov = data.result.claimCountWithPartialApprovedStatus
        this.claimCountWithBackToConsultant = data.result.claimCountWithBackToConsultant
        this.showLoader = false
      } else {
        this.claimCountWithNewStatus = 0
        this.claimCountWithApprovedStatus = 0
        this.claimCountWithDeniedStatus = 0
        this.claimCountWithAdditionalInformationRequiredStatus = 0
        this.claimCountPartialApprov = 0
        this.claimCountWithBackToConsultant = 0
        this.showLoader = false
      }
      this.month = this.changeDateFormatService.getCurrentMonth();
    })

  }
  getClaimInfo(status) {
    //Animation added as per conversation with Arun
    if (status == "REFER TO CONSULTANT" || status == "NEW") {
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');
      return
    }
    this.router.navigate(['reviewer/searchClaim/' + status])
  }

  /**
   * Function To Get Bulletin
   */
  getBulletin(businessTypeCd) {
    let bulletinData = {
      "businessType": 'S',// for issue number 764.  S is hardcoded acc to sid sir
      "dashboardCd": "DBA"
    }
    this.hmsDataService.postApi(ClaimApi.getBulletinUrl, bulletinData).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.bulletinTxt = data.result.bulletinTxt;
          this.bulletinForm.patchValue({
            "bulletinTxt": (data.result.bulletinTxt) ? data.result.bulletinTxt.trim() : ''
          });
          this.showBulletin = true;
        } else if (data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.bulletinTxt = '';
        }
      }
    });
  }

  /*
   *
   * Function For Submit Add Bulletin
   * for issue number 764
   */
  addBulatine() {
    if (this.bulletinForm.valid) {
      let bulletinData = {
        "bulletinTxt": this.bulletinForm.value.bulletinTxt,
        "dashboardCd": 'DBA',
        "businessType": 'S' // for issue number 764.  S is hardcoded acc to sid sir
      }
      this.hmsDataService.post(ClaimApi.saveBulletinUrl, bulletinData).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          if (data.hmsMessage.messageShort == 'RECORD_UPDATED_SUCCESSFULLY') {
            this.getBulletin(bulletinData.businessType);
            this.showBulletin = true;
            this.hmsDataService.OpenCloseModal('Bulletin');
            this.toastrService.success(this.translate.instant('Bulletin saved successfully'));
          }
        }
      });
    }
  }
  /**
   * Function To delete Bulletin
   * for issue number 764
   */
  deleteBulletin(businessTypeCd) {
    this.exDialog.openConfirm(this.translate.instant('admin.toaster.deleteConfirmationBulletin')).subscribe((value) => {
      if (value) {
        let bulletinData = {
          "businessType": 'S',// for issue number 764.  S is hardcoded acc to sid sir
          "dashboardCd": "DBA"
        }
        this.hmsDataService.postApi(ClaimApi.deleteBulletinUrl, bulletinData).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            if (data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
              this.toastrService.success(this.translate.instant('Bulletin deleted successfully'));
              this.bulletinTxt = ''
              this.bulletinForm.reset();
              this.showBulletin = false;
            }
          }
        });
      }
    });
  }

  /**
* Function For Reset Bulletin Form
*/
  resetBulletinForm() {
    this.bulletinForm.reset();
  }
  getBtnPermission() {
    this.addBulatineBtn = false;
    this.deleteBulatineBtn = false;
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
          if (data.result[i].menuName === "Doctor Review Bulletin") {
            for (var ii in data.result[i].actions) {
              if (data.result[i].actions[ii].actionName === 'Add Bulletin') {
                if (data.result[i].actions[ii].actionStatus === 'T') {
                  this.addBulatineBtn = true;
                }
              }
              if (data.result[i].actions[ii].actionName === "Delete Bulletin") {
                if (data.result[i].actions[ii].actionStatus === 'T') {
                  this.deleteBulatineBtn = true;
                }
              }
            }
          }
        }
      }
    });
  }

  /* Log #1010 */
  getCategoryList(tabType) {
    let requestParam = {
      'catCd': tabType
    }
    this.hmsDataService.postApi(ReferToReviewApi.getTreatmentCategoryUrl, requestParam).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.categories = data.result
      } else {
        this.categories = []
      }
    })
  }

  getListing(e) {
    let val = e.target.value;
    if (val != '') {
      this.getClaimFileList(val);
    }
  }

  getClaimFileList(category) {
    var reqParam = [
      { 'key': 'disciplineKey', 'value': 1 },
      { 'key': 'userId', 'value': this.userId },
      { 'key': 'treatmentCategory', 'value': category}
    ]
    var tableActions = []
    var dateCols = ['createdOn'];
    if (!$.fn.dataTable.isDataTable('#review-claim-table')) {
      this.dataTableService.jqueryDataTableSearchClaim("review-claim-table", this.url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, dateCols, '', [1, 2, 3, 4])
    } else {
      this.dataTableService.jqueryDataTableReload("review-claim-table", this.url, reqParam)
    }
  }

}