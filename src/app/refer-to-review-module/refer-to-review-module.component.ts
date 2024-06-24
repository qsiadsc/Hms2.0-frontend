import { Router, ActivatedRoute, Params, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { Component, OnInit, ViewChild, Inject, ViewChildren, QueryList, ɵConsole, Input, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CardHolderComponent } from './../claim-module/card-holder/card-holder.component';
import { ClaimTypeComponent } from './../claim-module/claim-type/claim-type.component';
import { ServiceProvidersComponent } from './../claim-module/service-providers/service-providers.component'
import { PayToOtherComponent } from './../claim-module/pay-to-other/pay-to-other.component';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ToastrService } from 'ngx-toastr'; //add toster service
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ClaimApi } from '../claim-module/claim-api';
import { ReferToReviewApi } from './refer-to-review-api';
import { CustomValidators } from '../common-module/shared-services/validators/custom-validator.directive';
import { DatatableService } from '../common-module/shared-services/datatable.service'
import { Location, DatePipe } from '@angular/common';
import { ExDialog } from "../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { FormCanDeactivate } from './../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/Subject';
import { Constants, CommonDatePickerOptions } from '../common-module/Constants'
import { ExportClaimLetterComponent } from '../review-web-app/export-report/export-claim-letter/export-claim-letter.component'
import { drawDOM, exportPDF, DrawOptions, Group } from '@progress/kendo-drawing';
import { saveAs } from '@progress/kendo-file-saver';
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { Observable } from 'rxjs/Observable';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { GenericTableComponent, GtConfig, GtOptions, GtRow, GtEvent, GtCustomComponent } from '@angular-generic-table/core';
import { CommonApi } from '../common-module/common-api';
import { ReviewAppApi } from '../review-web-app/reviewApp-api';
import { ReviewAppService } from '../review-web-app/reviewApp.service';

/** Generic Table Interface Start */
export interface RowData extends GtRow {
  id: number;
  userId: number;
  userName: string;
  status: string;
  fileName: string;
  fileReference: string;
  claimType: string;
  claimSource: string;
  businessTypeDesc: string;
  action: string;
  srno: number;
  businessTypeCd: string;
  ReportName: string;
  columnShow: boolean;

}
/** Generic Table Interface End */

@Component({
  selector: 'app-refer-to-review-module',
  templateUrl: './refer-to-review-module.component.html',
  styleUrls: ['./refer-to-review-module.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})

export class ReferToReviewModuleComponent extends GtCustomComponent<RowData> implements OnInit {
  showListing: boolean = false;
  endDate: string;
  startDate: string;
  firstDay: Date;
  businessTypeKey: any;
  businessTypeCd: any;
  businessTypeDesc: any;
  role: string;
  userId: any;
  bulletinForm: FormGroup;
  columns = [];
  ReferToReviewBtn: boolean = false;
  observableObj;
  check = true;
  dateNameArray = {}
  showBulletin: boolean = true;
  bulletinTxt: any = "";
  public dateRangeData: CompleterData;
  public configObject: GtConfig<RowData>;
  submissionColumns = []
  consultantColumns = []
  reviewStatusArray = []
  commentColumns = [
  ];
  categories = []
  addBulatineBtn: boolean;
  deleteBulatineBtn: boolean;
  submissionObservableObj;
  submissionCheck = true
  consultantObservableObj;
  consultantCheck = true
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private router: Router,
    private route: ActivatedRoute,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private exDialog: ExDialog,
  ) {
    super();
  }

  ngOnInit() {
    let month = this.changeDateFormatService.getCurrentMonth();
    this.commentColumns = [
      { 'title': 'Referred for Review', 'data': '0', 'type': '', 'isMonthly': false },
      { 'title': 'Referred for Consultant Review', 'data': '0', 'type': 'DOC_NEW', 'isMonthly': false }, // log 757 status changed
      { 'title': 'Consultant Decisions', 'data': '0', 'type': 'ref_to_doc', 'isMonthly': false },
      { 'title': 'Re-reviewed to Consultant', 'data': '0', 'type': 'ref2', 'isMonthly': false },
      { 'title': 'Completed Reviews', 'data': '0', 'type': 'ref', 'isMonthly': false },
      { 'title': 'Referred for Review Monthly Total (' + month + ')', 'data': '0', 'type': '', 'isMonthly': true },
      { 'title': 'Referred for Consultant Review Monthly Total (' + month + ')', 'data': '0', 'type': 'DOC_NEW', 'isMonthly': true },
      { 'title': 'Consultant Decisions Monthly Total (' + month + ')', 'data': '0', 'type': 'ref_to_doc', 'isMonthly': true }, //log 757
      { 'title': 'Re-reviewed to Consultant Monthly Total (' + month + ')', 'data': '0', 'type': 'ref2', 'isMonthly': true },
      { 'title': 'Completed Reviews Monthly Total (' + month + ')', 'data': '0', 'type': 'ref', 'isMonthly': true },
    ];
    this.getCatList();
    this.getBtnPermission();
    var date = new Date();
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth()) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
        this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        this.bulletinForm = new FormGroup({
          bulletinTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty])
        });
        this.getCount();
        this.getBusinessType();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth()) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
        this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        this.bulletinForm = new FormGroup({
          bulletinTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty])
        });
        this.getCount();
        this.getBusinessType();
      });
    }
    this.getBulletin(this.businessTypeCd);
    this.bulletinForm = new FormGroup({
      bulletinTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty])
    });
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('admin.adminRate.planType') == 'admin.adminRate.planType') {
        } else {
          this.columns = [
            { title: 'Claim Number', data: 'claimNumber' },
            { title: "File Number", data: 'fileNumber' },
            { title: "Description", data: 'reviewStatusDesc' },
            { title: 'Created On', data: 'createdOn' },
            { title: "Card Holder Name", data: 'cardHolderName' },
            { title: "Coverage Category", data: 'covCatDesc' },
          ]
          this.getFilesList("");
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
    this.submissionObservableObj = Observable.interval(1000).subscribe(x => {
      if (this.submissionCheck) {
        if (this.translate.instant('admin.adminRate.planType') == 'admin.adminRate.planType') {
        } else {
          this.submissionColumns = [
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.claimNumber'), data: 'claimNumber' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.fileNumber'), data: 'fileNumber' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.description'), data: 'reviewStatusDesc' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.createdon'), data: 'createdOn' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.cardHolderName'), data: 'cardHolderName' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.coverage-category'), data: 'covCatDesc' },
          ]
          this.getSubmission('N')
          this.observableObj.unsubscribe();
          this.submissionCheck = false;
        }
      }
    })
    this.consultantObservableObj = Observable.interval(1000).subscribe(x => {
      if (this.consultantCheck) {
        if (this.translate.instant('admin.adminRate.planType') == 'admin.adminRate.planType') {
        } else {
          this.consultantColumns = [
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.claimNumber'), data: 'claimNumber' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.fileNumber'), data: 'fileNumber' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.description'), data: 'reviewStatusDesc' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.createdon'), data: 'createdOn' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.cardHolderName'), data: 'cardHolderName' },
            { title: this.translate.instant('reviewApp.dashboard.refer-table-column.coverage-category'), data: 'covCatDesc' },
          ]
          this.observableObj.unsubscribe();
          this.consultantCheck = false;
        }
      }
    })
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
          if (data.result[i].menuName === "Refer Review Bulletin") {
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
  /**
   * Function To Get Bulletin
   */
  getBulletin(businessTypeCd) {
    let bulletinData = {
      "businessType": 'S',// for issue number 764.  S is hardcoded acc to sid sir
      "dashboardCd": "RBA"
    }
    this.hmsDataService.postApi(ReferToReviewApi.getBulletinUrl, bulletinData).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.bulletinForm.patchValue({
            "bulletinTxt": (data.result.bulletinTxt) ? data.result.bulletinTxt.trim() : ''
          });
          this.bulletinTxt = data.result.bulletinTxt;
          this.showBulletin = true;
        } else if (data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
          this.bulletinTxt = '';
        }
      }
    });
  }

  getSubmission(type) {
    var reqParam = [
      { 'key': 'covCatCount', 'value': "F" },
      { 'key': 'covCatKey', 'value': '' },
      { 'key': 'reviewStatusCd', 'value': type }
    ]
    var tableId = "submissionTable"
    if (!$.fn.dataTable.isDataTable('#submissionTable')) {
      var tableActions = "";
      this.dataTableService.jqueryDataTable(tableId, ReferToReviewApi.reviewList, 'full_numbers', this.submissionColumns,
        5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [3], "", null, [1, 2, 3, 4, 5])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, ReferToReviewApi.reviewList, reqParam)
    }
  }

  getBackConsultant(type) {
    var reqParam = [
      { 'key': 'covCatCount', 'value': "F" },
      { 'key': 'covCatKey', 'value': '' },
      { 'key': 'reviewStatusCd', 'value': type }
    ]
    var tableId = "consultantTable"
    if (!$.fn.dataTable.isDataTable('#consultantTable')) {
      var tableActions = "";
      this.dataTableService.jqueryDataTable(tableId, ReferToReviewApi.reviewList, 'full_numbers', this.consultantColumns,
        5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [3], "", null, [1, 2, 3, 4, 5])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, ReferToReviewApi.reviewList, reqParam)
    }
  }

  getFilesList(e) {
    var date = new Date(); // log 757 may 2020
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth()) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay));
    let endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday());
    var reqParam = [
      { 'key': 'covCatCount', 'value': "F" },
      { 'key': 'covCatKey', 'value': e }
    ]
    var url = ReferToReviewApi.reviewList;
    var tableId = "categoryClameList"
    if (!$.fn.dataTable.isDataTable('#categoryClameList')) {
      var tableActions = "";
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [3], "AddNewAdminInfo", null, [1, 2, 3, 4, 5])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    return false;
  }

  getCatList() {
    this.hmsDataService.getApi(ReferToReviewApi.catList).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.categories = data.result
        }
      }
    });
  }
  getClaimInfo(status, isMonthly, data) {
    if (status == "") {
      if (data && data > 0) {
        $('html, body').animate({
          scrollTop: $(document).height()
        }, 'slow');
      }
      return
    }
    let month = "F"
    if (isMonthly) {
      month = "T"
    }
    localStorage.setItem("monthly", month)
    this.router.navigate(['reviewer/searchClaim/' + status])
  }

  getClaimListByGridFilteration(tableId: string) {
    var params = [{ "key": "refId", "value": "" }, { "key": "entryStartDate", "value": "" }, { "key": "serviceStartDate", "value": "08/01/2020" }, { "key": "payable", "value": "" }, { "key": "deductible", "value": "" }, { "key": "released", "value": null }, { "key": "claimType", "value": "D" }, { "key": "cardNumber", "value": "" }, { "key": "personLastName", "value": "" }, { "key": "personFirstName", "value": "" }, { "key": "payeeTypeName", "value": null }, { "key": "receivedDate", "value": "" }, { "key": "status", "value": "Pending" }, { "key": "claimCategory", "value": "ALL" }, { "key": "businessType", "value": "AB Gov." }, { "key": "isDashboard", "value": "F" }, { "key": "licenseNumber", "value": "" }, { "key": "procedureCode", "value": "" }, { "key": "releaseEndDate", "value": null }, { "key": "releaseStartDate", "value": null }, { "key": "operator", "value": "" }]
    Object.keys(params).forEach(indexKey => {
      if (params[indexKey].key === 'entryStartDate') {
        if (params[indexKey].value != '') {
          params.push({ 'key': 'entryEndDate', 'value': params[indexKey].value })
        } else {
          params[indexKey].value = this.changeDateFormatService.convertDateObjectToString(null);
          params.push({ 'key': 'entryEndDate', 'value': this.changeDateFormatService.convertDateObjectToString(null) })
        }
      }
      if (params[indexKey].key === 'serviceStartDate') {
        if (params[indexKey].value != '') {
          params.push({ 'key': 'serviceEndDate', 'value': params[indexKey].value })
        } else {
          params[indexKey].value = this.changeDateFormatService.convertDateObjectToString(null);
          params.push({ 'key': 'serviceEndDate', 'value': this.changeDateFormatService.convertDateObjectToString(null) })
        }
      }
    });
  }
  changeDateFormat1(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      this.dateNameArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
    }
  }

  currentMonth() {
    var month = this.changeDateFormatService.getCurrentMonth()
  }

  getCount() {
    let reqData = {
      "startDate": this.startDate,
      "endDate": this.endDate
    };
    var url = ReferToReviewApi.getCount;
    this.hmsDataService.postApi(url, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let resData = data.result;
        this.commentColumns[0].data = resData.noOfNewClaims; // log 757
        this.commentColumns[1].data = resData.referredForConsultantReview;
        this.commentColumns[2].data = resData.consultantDecisions;
        this.commentColumns[3].data = resData.reReviewedToConsultant;
        this.commentColumns[4].data = resData.completedReviews;
        this.commentColumns[5].data = resData.addedPerMonthRefToRev;
        this.commentColumns[6].data = resData.addedPerMonthrefToConsultant;
        this.commentColumns[7].data = resData.consultantDecisionsMonthly;
        this.commentColumns[8].data = resData.reReviewedToConsultantMonthly;
        this.commentColumns[9].data = resData.completedReviewsMonthly;
      }
    })
  }

  /*
   *
   * Function For Submit Add Bulletin
   */
  addBulatine() {
    if (this.bulletinForm.valid) {
      let bulletinData = {
        "bulletinTxt": this.bulletinForm.value.bulletinTxt,
        "dashboardCd": 'RBA',
        "businessType": 'S' // for issue number 764.  S is hardcoded acc to sid sir
      }
      this.hmsDataService.post(ReferToReviewApi.saveBulletinUrl, bulletinData).subscribe(data => {
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
   */
  deleteBulletin(businessTypeCd) {
    this.exDialog.openConfirm(this.translate.instant('admin.toaster.deleteConfirmationBulletin')).subscribe((value) => {
      if (value) {
        let bulletinData = {
          "businessType": 'S',// for issue number 764.  S is hardcoded acc to sid sir
          "dashboardCd": "RBA"
        }
        this.hmsDataService.postApi(ReferToReviewApi.deleteBulletinUrl, bulletinData).subscribe(data => {
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

  /* Get List of BusinessType */
  getBusinessType() {
    let promise = new Promise((resolve, reject) => {
      this.userId = this.currentUserService.currentUser.userId
      var businessType = this.currentUserService.userBusinnesType
      if (businessType.bothAccess) {
        if (this.route.snapshot.url[0]) {
          if (this.route.snapshot.url[0].path == "alberta") {
            this.role = 'ROLE_SUPER_ADMIN'
            let val = businessType.filter(value => value.businessTypeCd == Constants.albertaBusinessTypeCd).map(data => data)
            this.businessTypeDesc = val[0].businessTypeDesc;
            this.businessTypeCd = val[0].businessTypeCd;
            this.businessTypeKey = val[0].businessTypeKey;
            this.changeTheme(this.businessTypeCd)
          }
        } else {
          this.role = localStorage.getItem('roleLabel');
          if (this.currentUserService.bothAcessdefaultBussinesType && this.currentUserService.bothAcessdefaultBussinesType.length != 0) {
            this.businessTypeDesc = this.currentUserService.bothAcessdefaultBussinesType.businessTypeDesc
            this.businessTypeCd = this.currentUserService.bothAcessdefaultBussinesType.businessTypeCd;
            this.businessTypeKey = this.currentUserService.bothAcessdefaultBussinesType.businessTypeKey;
          } else {
            this.businessTypeDesc = businessType[0].businessTypeDesc;
            this.businessTypeCd = businessType[0].businessTypeCd;
            this.businessTypeKey = businessType[0].businessTypeKey;
          }
          this.changeTheme(this.businessTypeCd)
        }
      } else {
        this.businessTypeDesc = businessType[0].businessTypeDesc;
        this.businessTypeCd = businessType[0].businessTypeCd;
        this.businessTypeKey = businessType[0].businessTypeKey;
      }
      resolve();
    })
    this.getBulletin(this.businessTypeCd);
    return promise;

  }

  changeTheme(businessTypeCd) {
    let role = localStorage.getItem('role');
    if (businessTypeCd == Constants.albertaBusinessTypeCd || role == 'referReviwer') {
      let node = document.createElement('link');
      node.href = 'assets/css/common-alberta.css';
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    } else {
      $('link[href="assets/css/common-alberta.css"]').remove();
    }
  }
  /**
 * Function For Reset Bulletin Form
 */
  resetBulletinForm() {
    this.bulletinForm.reset();
  }
}
