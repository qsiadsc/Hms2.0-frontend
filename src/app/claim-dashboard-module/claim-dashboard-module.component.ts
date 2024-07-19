import { Component, OnInit, Input, ViewChild, Output, Injectable, EventEmitter, HostListener, Renderer2, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service';
import { DatatableService } from './../common-module/shared-services/datatable.service'
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service'
import { GenericTableComponent, GtConfig, GtOptions, GtRow, GtEvent, GtCustomComponent } from '@angular-generic-table/core';
import { ClaimApi } from '../claim-module/claim-api';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../common-module/shared-component/ngx-dialog/dialog.module";
import { Constants, CommonDatePickerOptions } from '../common-module/Constants';
import { CustomValidators } from './../common-module/shared-services/validators/custom-validator.directive';
import { retry } from 'rxjs/operator/retry';
import { element } from 'protractor';
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UftApi } from '../unit-financial-transaction-module/uft-api';
import { empty } from 'rxjs/observable/empty';
declare var jsPDF: any;
import { CommonApi } from '../common-module/common-api';
import { CompleterService, CompleterItem } from 'ng2-completer';
import { ClaimService } from '../claim-module/claim.service';

/** Generic Table Interface Start */
export interface RowData extends GtRow {
  disciplineKey: any;
  claimKey: any;
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
  claimScannedFileKey: any
  claimTypeCat: string
  serviceDate: string
  commentTxt: string
}
/** Generic Table Interface End */

@Injectable()
export class ClaimDashboradService {
  public emitOnUnlockClaim = new EventEmitter()
  public emitAuthChecks = new EventEmitter()
  public emitUnlockADSCClaim = new EventEmitter()
  public emitClaimRowData = new EventEmitter()
  public emitDeleteClaim = new EventEmitter()
}

/** Discipline Column Component Start */

@Component({
  template: `
  <div class="plan-ct">
    <span class="history-ico">   
    <span class="dental-ico" title="Dental" *ngIf="disciplineIcon == 'Dental' && (bsnsKey == '364' || bsnsKey == '1585')"></span>
    <span class="dental-ico" title="Dental" *ngIf="disciplineIcon == 'Dental'"></span>
    <label title="Dental" *ngIf="disciplineIcon == 'Dental' && bsnsKey == '365'">DASP Claim</label>
    <span class="vision-ico" title="Vision" *ngIf="disciplineIcon == 'Vision'"></span>
    <span class="health-ico" title="Health" *ngIf="disciplineIcon == 'Health'"></span>
    <span class="drug-ico" title="Drug" *ngIf="disciplineIcon == 'Drug'"></span>
    <span class="supplement-ico" title="Supplement" *ngIf="disciplineIcon == 'Supplement'"></span>
    <span class="wellness-ico" title="Wellness" *ngIf="disciplineIcon == 'Wellness'"></span>
    </span> 
  </div>
  `,
  providers: [HmsDataServiceService],
})

export class DisciplineModuleComponent extends GtCustomComponent<RowData> implements OnInit {
  bsnsKey: string;
  columnStatus;
  userName;
  
  disciplineIcon;
  constructor(
    private router: Router,
    private hmsDataServiceService: HmsDataServiceService
  ) {
    super();
  }

  ngOnInit() {
    this.userName = this.row.userName;
    this.bsnsKey = localStorage.getItem('bsnsKey');
    if (this.row.claimType == "Dental" || this.row.disciplineKey == 1) {
      this.disciplineIcon = "Dental";
    } else if (this.row.claimType == "Vision" || this.row.disciplineKey == 2) {
      this.disciplineIcon = "Vision";
    } else if (this.row.claimType == "Health" || this.row.disciplineKey == 3) {
      this.disciplineIcon = "Health";
    }  else if (this.row.claimType == "Drug" || this.row.disciplineKey ==4) {
      this.disciplineIcon = "Drug";
    } else if (this.row.claimType == "Supplement" || this.row.claimType == "HSA" || this.row.disciplineKey ==5) {
      this.disciplineIcon = "Supplement";
    } else if (this.row.claimType == "Wellness" || this.row.disciplineKey ==6) {
      this.disciplineIcon = "Wellness";
    }
  }

}
/** Discipline Column Component End */

/** Status Column Component Start */
@Component({
  template: `  
  <div class="calender-field">   
    <span *ngIf="this.columnStatus=='Locked'">{{this.columnStatus}} By ({{this.userName}})</span>
    <span *ngIf="this.columnStatus=='New'">{{this.columnStatus}}</span>    
  </div>
  `,
  providers: [HmsDataServiceService],
})

export class StatusModuleComponent extends GtCustomComponent<RowData> implements OnInit {
  columnStatus;
  userName;
  constructor(
    private router: Router,
    private hmsDataServiceService: HmsDataServiceService,
    private claimDashboradService: ClaimDashboradService
  ) {
    super();
  }

  ngOnInit() {
    this.userName = this.row.userName;
    if (this.row.status == "L") {
      this.columnStatus = "Locked"
    } else if (this.row.status == "O") {
      this.columnStatus = "New"
    }   
  }

}
/** Status Column Component End */
/* Action Component For Quikcard Claims Start */
@Component({
  template: `  
  <div *ngIf="columnShow"> 
    <div *ngIf="currentUserData; then currentUserDataT else currentUserDataF "></div>
    <ng-template #currentUserDataT>
      <div class="calender-field"> 
      <a  href="javascript:void(0)" class='green-btn-add btn' (click)='addClaim()'>Add Claim</a>
      </div>
    </ng-template>

    <ng-template #currentUserDataF>
      <div class="calender-field">
      <a  href="javascript:void(0)" class='green-btn-add btn' (click)='addClaim()'>Add Claim</a>
      </div>
    </ng-template>  
  </div>
  `,
  providers: [HmsDataServiceService],
})

export class ActionModuleComponentMpc extends GtCustomComponent<RowData> implements OnInit {
  pdfFileName;
  claimType;
  userId;
  IsLocked: boolean = false;
  authChecks: any;
  userLogged;
  currenUser: any;
  currentUserData: boolean = false;
  columnShow: boolean = false;
  addBulatineBtn: boolean;
  deleteBulatineBtn: boolean;
  isCopy: any;
  claimKey: any;
  disciplineKey: any;
  isMobileRow: boolean;
  constructor(
    private router: Router,
    private hmsDataServiceService: HmsDataServiceService,
    private toastr: ToastrService,
    private exDialog: ExDialog,
    private claimDashboradService: ClaimDashboradService,
    private currentUserService: CurrentUserService,
  ) {
    super();
    this.claimDashboradService.emitAuthChecks.subscribe(val => {
      this.authChecks = val
    })
  }

  ngOnInit() {
    this.pdfFileName = this.row.fileName;
    this.claimType = this.row.claimType; // New Param Added
    this.claimKey = this.row.claimKey;
    this.disciplineKey = this.row.disciplineKey;
  
    if (localStorage.getItem('isReload') == 'T') {
    //  this.currentUserService.getUserAuthorization().then(res => {
        this.currenUser = this.currentUserService.currentUser
        this.userLogged = this.currenUser.username;
        this.userId = this.currenUser.userId;
        localStorage.setItem('isReload', '')
        this.columnShow = this.row.columnShow;
        //added for log 967
        if (this.row.userName && (this.row.userName.toUpperCase() == this.userLogged)) {
          this.currentUserData = true;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        } else {
          this.currentUserData = false;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        }  
    //  })      
    } else {
     // this.currentUserService.getUserAuthorization().then(res => {
        this.currenUser = this.currentUserService.currentUser
        this.userLogged = this.currenUser.username;
        this.userId = this.currenUser.userId;
        this.columnShow = this.row.columnShow;
        //Added for log 967
        if (this.row.userName && (this.row.userName.toUpperCase() == this.userLogged)) {
          this.currentUserData = true;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        } else {
          this.currentUserData = false;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        }
    //  })
    }
  }

  addClaim() {
    this.router.navigate(["/claim"], { queryParams: { 'mpc': 'Mpc' } });
    this.toastr.success('Claim adding screen ');
  }
  /**
   * Function for claim referre
   * @param pdfFilename
   */
  referreClaim(pdfFileName) {
  }
}
/** Action Component For Quikcard Claims End */
/* Action Component For Quikcard Claims Start */
@Component({
  template: `  
  <div *ngIf="columnShow"> 
    <div *ngIf="currentUserData; then currentUserDataT else currentUserDataF "></div>
    <ng-template #currentUserDataT>
      <div class="calender-field"> 
      <a *ngIf="isCopy && claimDashBoardCheck[0].copyClaim == 'T'" href="javascript:void(0)" class='green-btn-add btn' (click)='copyClaim()'>Copy Claim</a>

        <a *ngIf="IsLocked && claimDashBoardCheck[0].initiatedClaim == 'T'" href="javascript:void(0)" class='green-btn-add btn' (click)='initiateClaim()'>Initiate Claim</a>
        <a *ngIf="IsLocked && claimDashBoardCheck[0].unlockClaim == 'T'" href="javascript:void(0)" class='green-btn-add btn' (click)='unlockClaim()'>Unlock Claim</a> 
       <a *ngIf="IsLocked && claimScannedFileKey" id='quikcardComment' href="javascript:void(0)" class='green-btn-add btn' title='Comment' (click)='openCommentForm()'><i class="fa fa-comment comment-code"></i></a>
       <a *ngIf="claimScannedFileKey && claimDashBoardCheck[0].removeFile == 'T'" id="removeFileBtn" title="Remove File" class="delete_row table-action-btn del-ico" (click)="deleteClaimToRemoveFile()">
          <i class="fa fa-trash" style="color:white;"></i>
        </a>
      </div>
    </ng-template>

    <ng-template #currentUserDataF>
      <div class="calender-field">
        <a *ngIf="isCopy && claimDashBoardCheck[0].copyClaim == 'T'" href="javascript:void(0)" class='green-btn-add btn' (click)='copyClaim()'>Copy Claim</a>
        <a *ngIf="claimDashBoardCheck[0].initiatedClaim == 'T'" href="javascript:void(0)" class='green-btn-add btn' (click)='initiateClaim()'>Initiate Claim</a>
        <a *ngIf="IsLocked && claimDashBoardCheck[0].unlockClaim == 'T'" href="javascript:void(0)" class='green-btn-add btn' (click)='unlockClaim()'>Unlock Claim</a>
        <a *ngIf="claimScannedFileKey" id='quikcardComment' href="javascript:void(0)" class='green-btn-add btn' title='Comment' (click)='openCommentForm()'><i class="fa fa-comment comment-code"></i></a>
        <a *ngIf="claimScannedFileKey && claimDashBoardCheck[0].removeFile == 'T'" id="removeFileBtn" title="Remove File" class="delete_row table-action-btn del-ico" (click)="deleteClaimToRemoveFile()">
        <i class="fa fa-trash" style="color:white;"></i>
      </a>
      </div>
    </ng-template>  
  </div>
  `,
  providers: [HmsDataServiceService],
})

export class ActionModuleComponent extends GtCustomComponent<RowData> implements OnInit {
  pdfFileName;
  claimType;
  userId;
  IsLocked: boolean = false;
  authChecks: any;
  userLogged;
  currenUser: any;
  currentUserData: boolean = false;
  columnShow: boolean = false;
  addBulatineBtn: boolean;
  deleteBulatineBtn: boolean;
  isCopy: any;
  claimKey: any;
  disciplineKey: any;
  isMobileRow: boolean;
  claimSrc
  payeeName: any;
  claimScannedFileKey: any;
  claimDashBoardCheck = [{
    "CountByDiscipline": 'F',
    "claimsAddedMonth": 'F',
    "countByClaimStatus": "F",
    "miscellaneous": "F",
    'addBulletin': "F",
    'deleteBulletin': "F",
    'addUpdateBulletin': "F",
    'searchClaim': "F",
    'addClaim': 'F',
    'unlockClaim': 'F',
    'initiateClaim': 'F',
    'DASP': 'F',
    'lowIncome': 'F',
    'review': 'F',
    'daspReview': 'F',
    'quikcard': 'F',
    'initiatedClaim': 'F',
    'copyClaim': 'F',
    'removeFile': 'F'
  }]
  isAdmin: string;
  constructor(
    private router: Router,
    private hmsDataServiceService: HmsDataServiceService,
    private toastr: ToastrService,
    private exDialog: ExDialog,
    private claimDashboradService: ClaimDashboradService,
    private currentUserService: CurrentUserService,
    private translateService: TranslateService
  ) {
    super();
    this.claimDashboradService.emitAuthChecks.subscribe(val => {
      this.authChecks = val
    })
  }

  ngOnInit() {
    var numberOfApi = localStorage.getItem("numberOfApi");     
      if(numberOfApi == null){
      localStorage.setItem('numberOfApi', '1');
    this.getBtnPermission();
      }
    this.pdfFileName = this.row.fileName;
    this.claimType = this.row.claimType; // New Param Added
    this.claimKey = this.row.claimKey;
    this.disciplineKey = this.row.disciplineKey;
    this.claimSrc = this.row.claimSource
    this.claimScannedFileKey = this.row.claimScannedFileKey
      this.isMobileRow = true;
   
    if (localStorage.getItem('isReload') == 'T') {
    //  this.currentUserService.getUserAuthorization().then(res => {
        this.currenUser = this.currentUserService.currentUser
        if (this.currenUser.businessType.bothAccess) {
          this.isAdmin = 'T'
        }
        this.getAuthArray()
        this.userLogged = this.currenUser.username;
        this.userId = this.currenUser.userId;
        localStorage.setItem('isReload', '')
        this.columnShow = this.row.columnShow;
        //added for log 967
        if (this.row.userName && (this.row.userName.toUpperCase() == this.userLogged)) {

          this.currentUserData = true;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        } else {
          this.currentUserData = false;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        } 
    //  })     
    } else {
     // this.currentUserService.getUserAuthorization().then(res => {
        this.currenUser = this.currentUserService.currentUser
        if (this.currenUser.businessType.bothAccess) {
          this.isAdmin = 'T'
        }
        this.getAuthArray()
        this.userLogged = this.currenUser.username;
        this.userId = this.currenUser.userId;
        this.columnShow = this.row.columnShow;
        //Added for log 967
        if (this.row.userName && (this.row.userName.toUpperCase() == this.userLogged)) {

          this.currentUserData = true;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        } else {
          this.currentUserData = false;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        }  
    //  })   
    }
  }

  getAuthArray() {
    let checkArray = (this.currentUserService.authChecks['SCL']).concat(this.currentUserService.authChecks['DBC'])
    let addClaim = this.currentUserService.authChecks['VCD'].filter(val => val.actionObjectDataTag == 'VCD66').map(data => data)
    checkArray.push(addClaim[0])
    this.getAuthCheck(checkArray)
  }

  getAuthCheck(claimChecks) {
    let userAuthCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.claimDashBoardCheck = [{
        "CountByDiscipline": 'T',
        "claimsAddedMonth": 'T',
        "countByClaimStatus": 'T',
        "miscellaneous": 'T',
        'addBulletin': 'T',
        'deleteBulletin': 'T',
        'addUpdateBulletin': 'T',
        'unlockClaim': 'T',
        'searchClaim': 'T',
        'initiateClaim': 'T',
        'addClaim': 'T',
        'DASP': 'T',
        'lowIncome': 'T',
        'review': 'T',
        'daspReview': 'T',
        'quikcard': 'T',
        'initiatedClaim': 'T',
        'copyClaim': 'T',
        'removeFile': 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        userAuthCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.claimDashBoardCheck = [{
        "CountByDiscipline": userAuthCheck['DBD20'],
        "claimsAddedMonth": userAuthCheck['DBD21'],
        "countByClaimStatus": userAuthCheck['DBD22'],
        "miscellaneous": userAuthCheck['DBD23'],
        'addBulletin': userAuthCheck['ABL24'],
        'deleteBulletin': userAuthCheck['DBL300'],
        'addUpdateBulletin': userAuthCheck['ABL25'],
        'unlockClaim': userAuthCheck['DBD26'],
        'searchClaim': userAuthCheck['SCL27'],
        'initiateClaim': userAuthCheck['VCD66'],
        'addClaim': userAuthCheck['SCL28'],
        'DASP': userAuthCheck['DBC331'],
        'lowIncome': userAuthCheck['DBC332'],
        'review': userAuthCheck['DBC333'],
        'daspReview': userAuthCheck['DBC334'],
        'quikcard': userAuthCheck['DBC335'],
        'initiatedClaim': userAuthCheck['DBD411'],
        'copyClaim': userAuthCheck['DBD410'],
        'removeFile': userAuthCheck['DBD409']
      }]
    }
    this.claimDashboradService.emitAuthChecks.emit(this.claimDashBoardCheck)
    return this.claimDashBoardCheck
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
    this.hmsDataServiceService.postApi(CommonApi.getMenuActionsByRoleKey, submitData).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {

        for (var i in data.result) {
          if (data.result[i].menuName === "Claim Dashboard") {
            for (var ii in data.result[i].actions) {
              if (data.result[i].actions[ii].actionName === 'Add Bulletin') {
                if (data.result[i].actions[ii].actionStatus === 'T') {
                  this.addBulatineBtn = true;
                }
              }

              if (data.result[i].actions[ii].actionName === "Delete Bulletin") {
                if (data.result[i].actions[ii] === 'T') {
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
   * Function for claim unlock
   * @param pdfFileName
   */
  unlockClaim() {
    var submitData = {}
    submitData = {
      "fileReference": this.pdfFileName.replace('.pdf', '')
    }
    this.hmsDataServiceService.postApi(ClaimApi.unlockFile, submitData).subscribe(data => {
      if (data.code == 200) {
        this.toastr.success(this.translateService.instant('common.claimUnlockedSuccess'));
        this.claimDashboradService.emitOnUnlockClaim.emit("unlocked");
        this.router.navigate(['/claimDashboard/']);
      } else {
        this.toastr.error(this.translateService.instant('common.errorInUnlockClaimProcess'))
      }
    },(error) => {
      this.toastr.error(this.translateService.instant('common.errorInUnlockClaimProcess'))
    });
  }

  deleteClaimToRemoveFile(){
    this.exDialog.openConfirm(this.translateService.instant('user.addEditViewUsers.areUSureDelete')).subscribe((valueDeleteFile) => {
      if (valueDeleteFile) {
        var submitData = {
          "claimScannedFileKey": this.claimScannedFileKey,
          "claimKey": this.row.claimKey
        }
        this.hmsDataServiceService.postApi(ClaimApi.deleteClaim, submitData).subscribe(data => {
          if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
             this.toastr.success(this.translateService.instant('claims.claims-toaster.record-deleted-successfully'));
             this.claimDashboradService.emitDeleteClaim.emit("deleteClaim");
             this.router.navigate(['/claimDashboard']);
             //this.claimScannedFileKey = ''
          } 
          if (data.code == 404 && data.status == 'RECORD_NOT_FOUND') {
            this.toastr.error(this.translateService.instant('common.record-not-found'))
          } 
          else if (data.code == 400 && data.status == 'MISSING_CLAIM_NUMBER and MISSING_SCANNED_NUMBER') {
            this.toastr.error(this.translateService.instant('common.claimAndScannedNumberMissing'))
          }
        });
      } else {
        return false
      }
    });
  }

  /**
   * Function for claim initiate
   * @param pdfFilename
   */
  initiateClaim(pdfFileName) {
    // For Quikcard Dashboard
    var submitData = {}
    submitData = {
      "fileName": this.pdfFileName,
      "businessTypeCd": this.row.businessTypeCd,
      "userId": this.userId,
      "claimType": this.claimType
    }
    let serviceDate = (this.row.serviceDate != undefined && this.row.serviceDate != null && this.row.serviceDate != '') ? this.row.serviceDate : ''
    let discKey = (this.row.disciplineKey != undefined) ? this.row.disciplineKey : 1
    if (this.row.claimKey != undefined) {
      if (this.row.status == 'O' || this.row.status == 'N') {
        this.hmsDataServiceService.postApi(ClaimApi.getFileStatus, submitData).subscribe(data => {})
      }
      this.router.navigate(['/claim/view/' + this.row.claimKey + '/type/' + this.row.disciplineKey], { queryParams: 
      { "claimScannedFileKey": this.row.claimScannedFileKey, "isAdDash": this.currentUserService.isAdscDashboard, "isDiscKey": discKey }})
    } else {
      this.hmsDataServiceService.postApi(ClaimApi.getFileStatus, submitData).subscribe(data => {
        if (data.code == 200 && data.hmsMessage.messageShort == 'FILE_IS_FREE') {
          let cSfK = 0;
          if (data.result.claimScannedFileKey) {
            cSfK = data.result.claimScannedFileKey
          }
          this.router.navigate(['/claim/'], { queryParams: { 'fileReference': this.pdfFileName.replace('.pdf', ''), "claimScannedFileKey": cSfK, "claimcategory": this.isMobileRow, "claimCat": this.claimSrc, "isAdDash": this.currentUserService.isAdscDashboard, "isDiscKey": discKey, "isServiceDate": serviceDate } });        
        } else {
          this.toastr.error('File is opened by another user');
        }
      });
    }
   
  }
  copyClaim() {
    var submitData = {}
    submitData = {
      "fileName": this.pdfFileName,
      "businessTypeCd": this.row.businessTypeCd,
      "userId": this.userId,
      "claimType": this.claimType
    }
    this.hmsDataServiceService.postApi(ClaimApi.getFileStatus, submitData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == 'FILE_IS_FREE') {
        let cSfK = 0;
        if (data.result.claimScannedFileKey) {
          cSfK = data.result.claimScannedFileKey
        }
        if (cSfK != 0) {
          this.hmsDataServiceService.getApi(ClaimApi.copyClaim + '/' + cSfK).subscribe(data => {

            this.toastr.success('Claim Copied Successfully ');
             $('#getQuikCardClaim').trigger('click')
          })
        }
      } else {
        this.toastr.error('File is opened by another user');
      }
    });
  }
  /**
   * Function for claim referre
   * @param pdfFilename
   */
  referreClaim(pdfFileName) {
  }

  openCommentForm() {
    let rowData = {
      'commentTxt': this.row.commentTxt,
      'claimScannedFileKey': this.row.claimScannedFileKey
    }
    this.claimDashboradService.emitClaimRowData.emit(rowData)
    setTimeout(() => {
      this.hmsDataServiceService.OpenCloseModal('dashboardCommentModal');
    }, 1000);
  }
}
/** Action Component For Quikcard Claims End */
/** Action Component For Govt. Claims Start */
@Component({
  template: ` 
  <div *ngIf="columnShow"> 
    <div *ngIf="currentUserData; then currentUserDataT else currentUserDataF "></div>
    <ng-template #currentUserDataT>
      <div class="calender-field">
      <a *ngIf="isCopy && claimDashBoardCheck[0].copyClaim == 'T'" href="javascript:void(0)" class='red-btn rbtn' (click)='copyClaim()'>Copy Claim</a>

         <!--check button color from green-btn-add to red-btn as pr Arun sir on 13/08/2020-->
        <a *ngIf="IsLocked && claimDashBoardCheck[0].initiatedClaim == 'T'" href="javascript:void(0)" class='red-btn rbtn' (click)='initiateClaim()'>Initiate Claim</a>
        <a *ngIf="IsLocked && claimDashBoardCheck[0].unlockClaim == 'T'" href="javascript:void(0)" class='red-btn rbtn' (click)='unlockClaim()'>Unlock Claim</a> 
        <a *ngIf="IsLocked && claimScannedFileKey" id='adscComment' href="javascript:void(0)" class='red-btn rbtn' title='Comment' (click)='openCommentForm()'><i class="fa fa-comment comment-code"></i></a>
        <a *ngIf="IsLocked && claimScannedFileKey && claimDashBoardCheck[0].removeFile == 'T'" id="removeFileBtn" title="Remove File" class="delete_row table-action-btn del-ico" (click)="deleteClaimToRemoveFile()">
          <i class="fa fa-trash"></i>
        </a>
      </div>
    </ng-template>

    <ng-template #currentUserDataF>
      <div class="calender-field">
      <a *ngIf="isCopy && claimDashBoardCheck[0].copyClaim == 'T'" href="javascript:void(0)" class='red-btn rbtn' (click)='copyClaim()'>Copy Claim</a>
      <a *ngIf="claimDashBoardCheck[0].initiatedClaim == 'T'" href="javascript:void(0)" class='red-btn rbtn' (click)='initiateClaim()'>Initiate Claim</a>
      <a *ngIf="IsLocked && claimDashBoardCheck[0].unlockClaim == 'T'" href="javascript:void(0)" class='red-btn rbtn' (click)='unlockClaim()'>Unlock Claim</a>
      <a *ngIf="claimScannedFileKey" id='adscComment' href="javascript:void(0)" class='red-btn rbtn' title='Comment' (click)='openCommentForm()'><i class="fa fa-comment comment-code"></i></a>
      <a *ngIf="claimScannedFileKey && claimDashBoardCheck[0].removeFile == 'T'" id="removeFileBtn" title="Remove File" class="delete_row table-action-btn del-ico" (click)="deleteClaimToRemoveFile()">
          <i class="fa fa-trash"></i>
      </a>
    
      </div>
    </ng-template> 
  </div>
  `,
})
export class ActionModule2Component extends GtCustomComponent<RowData> implements OnInit {
  pdfFileName;
  claimType;
  status;
  userId;
  userLogged;
  IsLocked: boolean = false;
  authChecks: any
  currenUser: any;
  currentUserData: boolean = false;
  columnShow: boolean = false;
  claimKey: any;
  disciplineKey: any;
  isCopy: boolean;
  claimSrc
  claimScannedFileKey ;
  claimDashBoardCheck = [{
    "CountByDiscipline": 'F',
    "claimsAddedMonth": 'F',
    "countByClaimStatus": "F",
    "miscellaneous": "F",
    'addBulletin': "F",
    'deleteBulletin': "F",
    'addUpdateBulletin': "F",
    'searchClaim': "F",
    'addClaim': 'F',
    'unlockClaim': 'F',
    'initiateClaim': 'F',
    'DASP': 'F',
    'lowIncome': 'F',
    'review': 'F',
    'daspReview': 'F',
    'quikcard': 'F',
    'initiatedClaim': 'F',
    'copyClaim': 'F',
    'removeFile': 'F'
  }]
  isAdmin: string;
  constructor(
    private router: Router,
    private hmsDataServiceService: HmsDataServiceService,
    private toastr: ToastrService,
    private claimDashboradService: ClaimDashboradService,
    private currentUserService: CurrentUserService,
    private translateService: TranslateService,
    private exDialog: ExDialog
  ) {
    super();
    claimDashboradService.emitAuthChecks.subscribe(val => {
      this.authChecks = val
    })
  }

  ngOnInit() {
    this.pdfFileName = this.row.fileName;
    this.claimType = this.row.claimType;
    this.claimKey = this.row.claimKey;
    this.disciplineKey = this.row.disciplineKey;
    this.claimSrc = this.row.claimSource
    this.claimScannedFileKey = this.row.claimScannedFileKey
     console.log("----->>>",this.row.claimScannedFileKey)

    if (localStorage.getItem('isReload') == 'T') {
    //  this.currentUserService.getUserAuthorization().then(res => {
        this.currenUser = this.currentUserService.currentUser
        this.userLogged = this.currenUser.username;
        this.userId = this.currenUser.userId;
        localStorage.setItem('isReload', '')
        this.columnShow = this.row.columnShow;
        if (this.currenUser.businessType.bothAccess) {
          this.isAdmin = 'T'
        }
        this.getAuthArray()
        //Added for log 967
        if (this.row.userName && (this.row.userName.toUpperCase() == this.userLogged)) {
          this.currentUserData = true;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        } else {
          this.currentUserData = false;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        }
    //  })
    } else {
     // this.currentUserService.getUserAuthorization().then(res => {
        this.currenUser = this.currentUserService.currentUser
        if (this.currenUser.businessType.bothAccess) {
          this.isAdmin = 'T'
        }
        this.getAuthArray()
        this.userLogged = this.currenUser.username;
        this.userId = this.currenUser.userId;
        this.columnShow = this.row.columnShow;
        //Added for log 967
        if (this.row.userName && (this.row.userName.toUpperCase() == this.userLogged)) {
          this.currentUserData = true;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        } else {
          this.currentUserData = false;
          if (this.row.status == "O") {
            this.IsLocked = false;
          } else if (this.row.status == "L") {
            this.IsLocked = true;
          }
          if (this.row.claimKey && this.row.claimKey != null) {
            this.isCopy = true
          } else {
            this.isCopy = false
          }
        }
     // })
    }

  }
 
  getAuthArray() {
    let checkArray = (this.currentUserService.authChecks['SCL']).concat(this.currentUserService.authChecks['DBC'])
    let addClaim = this.currentUserService.authChecks['VCD'].filter(val => val.actionObjectDataTag == 'VCD66').map(data => data)
    checkArray.push(addClaim[0])
    this.getAuthCheck(checkArray)
  }

  getAuthCheck(claimChecks) {
    let userAuthCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.claimDashBoardCheck = [{
        "CountByDiscipline": 'T',
        "claimsAddedMonth": 'T',
        "countByClaimStatus": 'T',
        "miscellaneous": 'T',
        'addBulletin': 'T',
        'deleteBulletin': 'T',
        'addUpdateBulletin': 'T',
        'unlockClaim': 'T',
        'searchClaim': 'T',
        'initiateClaim': 'T',
        'addClaim': 'T',
        'DASP': 'T',
        'lowIncome': 'T',
        'review': 'T',
        'daspReview': 'T',
        'quikcard': 'T',
        'initiatedClaim': 'T',
        'copyClaim': 'T',
        'removeFile': 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        userAuthCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.claimDashBoardCheck = [{
        "CountByDiscipline": userAuthCheck['DBD20'],
        "claimsAddedMonth": userAuthCheck['DBD21'],
        "countByClaimStatus": userAuthCheck['DBD22'],
        "miscellaneous": userAuthCheck['DBD23'],
        'addBulletin': userAuthCheck['ABL24'],
        'deleteBulletin': userAuthCheck['DBL300'],
        'addUpdateBulletin': userAuthCheck['ABL25'],
        'unlockClaim': userAuthCheck['DBD26'],
        'searchClaim': userAuthCheck['SCL27'],
        'initiateClaim': userAuthCheck['VCD66'],
        'addClaim': userAuthCheck['SCL28'],
        'DASP': userAuthCheck['DBC331'],
        'lowIncome': userAuthCheck['DBC332'],
        'review': userAuthCheck['DBC333'],
        'daspReview': userAuthCheck['DBC334'],
        'quikcard': userAuthCheck['DBC335'],
        'initiatedClaim': userAuthCheck['DBD411'],
        'copyClaim': userAuthCheck['DBD410'],
        'removeFile': userAuthCheck['DBD409']
      }]
    }
    this.claimDashboradService.emitAuthChecks.emit(this.claimDashBoardCheck)
    return this.claimDashBoardCheck
  }

  /**
   * Function For Initiate Claim (Govt. ADSC)
   * @param
   */
  initiateClaim() {
    
    var submitData = {
      "fileName": this.pdfFileName,
      "businessTypeCd": this.row.businessTypeCd,
      "userId": this.userId,
      "claimType": this.claimType
    }
    let serviceDate = (this.row.serviceDate != undefined && this.row.serviceDate != null && this.row.serviceDate != '') ? this.row.serviceDate : ''
    let discKey = (this.row.disciplineKey != undefined) ? this.row.disciplineKey : 1
    if (this.row.claimKey != undefined) {
      if (this.row.status == 'O' || this.row.status == 'N') {
        this.hmsDataServiceService.postApi(ClaimApi.getFileStatus, submitData).subscribe(data => {})
      }
      this.router.navigate(['/claim/view/' + this.row.claimKey + '/type/' + this.row.disciplineKey], { queryParams: 
      { "claimScannedFileKey": this.row.claimScannedFileKey, "isAdDash": this.currentUserService.isAdscDashboard, "isDiscKey": discKey }})     
    } else {
      this.hmsDataServiceService.postApi(ClaimApi.getFileStatus, submitData).subscribe(data => {
        if (data.code == 200 && data.hmsMessage.messageShort == 'FILE_IS_FREE') {
          let cSfK = 0;
          if (data.result.claimScannedFileKey) {
            cSfK = data.result.claimScannedFileKey    
          }        
          this.router.navigate(['/claim/'], {     
            queryParams: { 'fileReference': this.pdfFileName.replace('.pdf', ''), "claimScannedFileKey": cSfK, "claimcategory": true, "claimCat": this.claimSrc, "isAdDash": this.currentUserService.isAdscDashboard, "isDiscKey": discKey, "isServiceDate": serviceDate }  
          });          
        } else {  
          this.toastr.error('File is opened by another user');
        } 
      }); 
    }   
  }

  deleteClaimToRemoveFile(){
    this.exDialog.openConfirm(this.translateService.instant('user.addEditViewUsers.areUSureDelete')).subscribe((valueDeleteFile) => {
      if (valueDeleteFile) {
        var submitData = {
          "claimScannedFileKey": this.claimScannedFileKey,
          "claimKey": this.claimKey
        }
        this.hmsDataServiceService.postApi(ClaimApi.deleteClaim, submitData).subscribe(data => {
          if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
             this.toastr.success(this.translateService.instant('claims.claims-toaster.record-deleted-successfully'));
             this.claimDashboradService.emitDeleteClaim.emit("deleteClaim");
             this.router.navigate(['/claimDashboard']);
             //this.claimScannedFileKey = ''
          } 
          if (data.code == 404 && data.status == 'RECORD_NOT_FOUND') {
            this.toastr.error(this.translateService.instant('common.record-not-found'))
          } 
          else if (data.code == 400 && data.status == 'MISSING_CLAIM_NUMBER and MISSING_SCANNED_NUMBER') {
            this.toastr.error(this.translateService.instant('common.claimAndScannedNumberMissing'))
          }
        });
      } else {
        return false
      }
    });
  }

  copyClaim() {
    var submitData = {}
    submitData = {
      "fileName": this.pdfFileName,
      "businessTypeCd": this.row.businessTypeCd,
      "userId": this.userId,
      "claimType": this.claimType
    }
    this.hmsDataServiceService.postApi(ClaimApi.getFileStatus, submitData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == 'FILE_IS_FREE') {
        let cSfK = 0;
        if (data.result.claimScannedFileKey) {
          cSfK = data.result.claimScannedFileKey
        }
        if (cSfK != 0) {
          this.hmsDataServiceService.getApi(ClaimApi.copyClaim + '/' + cSfK).subscribe(data => {
            this.toastr.success('Claim Copied Successfully ');
            $('#getGovClaim').trigger('click')
          })
        }        
      } else {
        this.toastr.error('File is opened by another user');
      }
    });
  }
  /**
   * Function For Unlock Claim (Govt. ADSC)
   * @param pdfFileName
   */
  unlockClaim(pdfFileName) {
    var submitData = {}
    submitData = {
      "fileReference": this.pdfFileName.replace('.pdf', '')
    }
    this.hmsDataServiceService.postApi(ClaimApi.unlockFile, submitData).subscribe(data => {
      if (data.code == 200) {
        this.toastr.success(this.translateService.instant('common.claimUnlockedSuccess'));
        this.claimDashboradService.emitUnlockADSCClaim.emit("unlockedADSC");
        this.router.navigate(['/claimDashboard/alberta']);
      } else {
        this.toastr.error(this.translateService.instant('common.errorInUnlockClaimProcess'))
      }
    }, (error) => {
      this.toastr.error(this.translateService.instant('common.errorInUnlockClaimProcess'))
    });
  }

  openCommentForm() {
    let rowData = {
      'commentTxt': this.row.commentTxt,
      'claimScannedFileKey': this.row.claimScannedFileKey
    }
    this.claimDashboradService.emitClaimRowData.emit(rowData)
    if (this.row.commentTxt != '' && this.row.commentTxt != null && this.row.commentTxt != undefined) {
      setTimeout(() => {
        this.hmsDataServiceService.OpenCloseModal('viewDbCommentsPopup');
      }, 1000);
    } else {
      this.hmsDataServiceService.OpenCloseModal('dashboardCommentModal');
    }
  }

}
/** Action Component For Govt. Claims End */

@Component({
  selector: 'app-claim-dashboard-module',
  templateUrl: './claim-dashboard-module.component.html',
  styleUrls: ['./claim-dashboard-module.component.css'],
  providers: [ChangeDateFormatService, TranslateService, DatatableService, ClaimService],
  entryComponents: [ActionModuleComponent, ActionModuleComponentMpc, ActionModule2Component, DisciplineModuleComponent, StatusModuleComponent]
})

export class ClaimDashboardModuleComponent implements OnInit, OnDestroy {
  isSearch: boolean = false;
  payeeName;
  payeeType
  bussType: string = "";
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  businessTypeKey: any;
  businessTypeDesc: string;
  currenUser: any;
  @ViewChild(DashboardTabComponent) dashboardTabComponent;
  loginUserIdAb: string;
  loginUserIdQuikCard: string;
  role: string;
  bsnsKey: string;
  tabBsnsType: any;
  albertaTab: boolean = false;
  quikcardTab: boolean = true;
  financeTab: boolean = false;
  isAdmin: string;
  businessTypeCd: string;
  userId: any;
  referedClaimCount = 0
  arrClaimType: any;
  referClaimMessage: string;
  dashboardHeading: string;
  observable;
  check = true
  //Reports tab
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  reportsListColumns = [];
  ObservableReportsListObj;
  reportListTabShowHide: boolean = false;
  reportID: Number;
  error: { isError: boolean; errorMessage: string; };
  reportPopUpTitle: any;
  tableId: string;
  showFilterFields = [];
  filterColoumn = [];
  overrideReasonList = [];
  overrideReason = []
  reportCheckForCard = [];
  reportCheck = [];
  filterOverrideReason = [];
  showReportList: boolean = false; //Enable true when we need to show report list in the popup
  showHideReportGrid: boolean = false
  isAlberta: any;
  GridFilter26_confirmationNumber;
  GridFilter26_cardNumber;
  GridFilter26_cardholderName;
  GridFilter26_procCd;
  GridFilter26_cardNum
  GridFilter26_confirmationNum
  GridFilter26_procDesc;
  GridFilter26_amountSubmitted;
  GridFilter26_amountPaid;
  GridFilter26_amountNotPaid;
  GridFilter26_serviceDate;
  payeeData = [];
  dataArrayadscLI: any[];
  dataArrayadscDasp: any[];
  key: any;
  claimDataArr: any;
  openReferClaimModal: boolean = false
  disableDctrBtn: boolean = false
  disableGovBtn: boolean = false
  disablSendDocbtn: boolean = false
  routedClaimKey: any;
  lastMonth: any;
  onDashboardClick: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  miscellaneousArray: any;
  claimStatusArray: any;
  disciplineArray: any;
  disciplineCountHsa: any;
  disciplineCountWellness: any;
  disciplineCountDrug: any;
  disciplineCountVision: any;
  disciplineCountHealth: any;
  disciplineCountDental: any;
  claimStatusReleasedCount: any;
  claimStatusNewCount: any;
  showBulletin: boolean = false;
  showLoader: boolean = false;
  bulletinTxt: any;
  bulletinForm: FormGroup;
  currentMonth: string;
  currentDate = new Date();
  dataArray = [];
  dataArray3 = [];
  ShowTabs: boolean = false;
  ShowGrid: boolean = false;
  ShowTraceyGrid: boolean = false;
  user: string;
  reportData;
  observableObj;
  observableObjForEnteredClaim;
  observableObjForEnteredClaims;
  files: any;
  private filterRules: FormGroup;
   showRulesList: boolean = false;
  checkvalue: boolean = true;
  columns = [];
  rulesMask;
  rulesRuleDescription;
  rulesScript;
  disciplineKey;
  rulesRoute;
  ruleName;
  columnFilterSearch: boolean = false;
  showBarGraph: boolean = false;
  showPieGraph: boolean = false;
  showLineGraph: boolean = false;
  claimTypePreAuthCount;
  claimTypePaperCount;
  selectedOverrideReason = [];
  claimTypePhoneInCount;
  claimStatusPendingCount;
  claimStatusAdjudicatedCount;
  claimStatusPaidCount;
  monthsArray = [];
  preAuthTxt = "";
  miscellaneousPendingItransClaims: any;
  miscellaneousPhoneNotReleased: any;
  miscellaneousSuspendedAccount: any;
  showPageLoader: boolean = false;
  
  claimDashBoardCheck = [{
    "CountByDiscipline": 'F',
    "claimsAddedMonth": 'F',
    "countByClaimStatus": "F",
    "miscellaneous": "F",
    'addBulletin': "F",
    'deleteBulletin': "F",
    'addUpdateBulletin': "F",
    'searchClaim': "F",
    'addClaim': 'F',
    'unlockClaim': 'F',
    'initiateClaim': 'F',
    'DASP': 'F',
    'lowIncome': 'F',
    'review': 'F',
    'daspReview': 'F',
    'quikcard': 'F',
    'initiatedClaim': 'F',
    'copyClaim': 'F',
    'removeFile': 'F'
  }]
  dateNameArray = {}
  currentTab
  referClaim: FormGroup; //intailize rfer claim pop-up
  /** Start Generic Table Variables */
  public data: Array<RowData> = [];
  public configObject: GtConfig<RowData>;
  public configObject2: GtConfig<RowData>;
  public configObject3: GtConfig<RowData>;  /* Issue:1213-point:10--Low income & dasp list differentiated for ADSC start*/
  public configObjectMpc: GtConfig<RowData>;
  public configObjectReport: GtConfig<RowData>;
  /** End Generic Table Variables */
  showClaimDashboardFields = [];
  customTexts = {
    'loading': 'Loading...',
    'noData': 'No data available in table',

  };
  public claimDashboardReport: FormGroup; // change private to public for production-errors
  operatorData: any
  getForApi : boolean = false;  //declare for getAllFiles api's hits by mukul 
  disciplineType: number
  isOpen: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  isADSCDashboard: boolean = false
  @ViewChild(GenericTableComponent)
  public myTable: GenericTableComponent<any, any>;
  commentText
  commentForm: FormGroup
  dashboardCommentText = ''
  claimRowData = {'commentTxt': '','claimScannedFileKey': ''}
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastr: ToastrService,
    private claimDashboradService: ClaimDashboradService,
    private currentUserService: CurrentUserService,
    private exDialog: ExDialog,
    private changeDateFormatService: ChangeDateFormatService,
    private renderer: Renderer2,
    private completerService: CompleterService,
    private claimService : ClaimService
  ) {
    claimDashboradService.emitOnUnlockClaim.subscribe((value) => {
      this.bsnsKey = localStorage.getItem('bsnsKey');
      if (this.role == 'ROLE_ADMIN' || this.bsnsKey != Constants.albertaUserId) {
        this.getQuikCardClaim();
      } else {
        this.getGovClaim();
      }
    });

    claimDashboradService.emitUnlockADSCClaim.subscribe((dat) => {
      if (dat) {
        this.getGovClaim();
      }
    })
    claimDashboradService.emitDeleteClaim.subscribe((data) => {
      if (data) {
        if(this.businessTypeDesc == 'Quikcard'){
          this.getQuikCardClaim();
        }
        else{
          this.getGovClaim();
        }
      }
    })

    this.currentUserService.dashboardType.subscribe((data) => {
      if (data) {
        this.getDashboardClaimData(data)
      }
    })

    // To get row data for #1426
    claimDashboradService.emitClaimRowData.subscribe(rowData => {
      if (rowData) {
        this.dashboardCommentText = rowData.commentTxt
        this.claimRowData = rowData
        if (rowData.commentTxt) {
          this.commentForm.patchValue({ 'commentTxt' : rowData.commentTxt })
        }
      }
    })

    /** Start Detect Route Changes & Stop API Call */
    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator       
      }
      if (event instanceof NavigationEnd) {
        // Hide loading indicator         
        if (event.url != "/claimDashboard") {
          if (this.observableObj) {
            this.observableObj.unsubscribe(); // For Stop API
          }
        }
      }
      if (event instanceof NavigationError) {
        // Hide loading indicator
        // Present error to user
      }
    });
    /** End Detect Route Changes & Stop API Call */

    this.configObject = {
      settings: [
        {
          objectKey: 'fileReference',
          columnOrder: 1,
          sort: 'enable',
        },
        {
          objectKey: 'receivedDate', // Received Date added as per Ticket #1213 Point 11.
          columnOrder: 2,
          sort: 'asc'
        },
        {
          objectKey: 'dIcon',
          columnOrder: 3,
          sort: 'enable'
        },
        {
          objectKey: 'status',
          columnOrder: 4,
          sort: 'enable'
        },
        {
          objectKey: 'claimSource',
          columnOrder: 5,
          sort: 'enable'
        },
        {
          objectKey: 'action',
          columnOrder: 6,
          sort: 'disable'
        },
      ],
      fields: [
        {
          name: 'File Name',
          objectKey: 'fileReference',
          classNames: 'sortColm'
        },
        {
          name: 'Received Date',
          objectKey: 'receivedDate',
          classNames: 'sortColm'
        },
        {
          name: 'Discipline',
          objectKey: 'dIcon',
          columnComponent: { type: DisciplineModuleComponent },
          classNames: 'sortColm'
        },
        {
          name: 'Status',
          objectKey: 'status',
          columnComponent: { type: StatusModuleComponent },
          classNames: 'sortColm'
        },
        {
          name: 'Claim Source',
          objectKey: 'claimSource',
          stackedHeading: 'Custom heading',
          classNames: 'sortColm'
        },
        {
          name: 'Action',
          objectKey: 'action',
          columnComponent: { type: ActionModuleComponent },
          classNames: 'sortColm'
        }
      ],
      data: []
    };
    this.configObjectMpc = {
      settings: [
        {
          objectKey: 'fileReference',
          columnOrder: 1
        },
        {
          objectKey: 'dIcon',
          columnOrder: 2
        },
        {
          objectKey: 'status',
          columnOrder: 3
        },
        {
          objectKey: 'claimSource',
          columnOrder: 4
        },
        {
          objectKey: 'action',
          columnOrder: 5
        },
      ],
      fields: [
        {
          name: 'File Name',
          objectKey: 'fileReference'
        },
        {
          name: 'Discipline',
          objectKey: 'dIcon',
          columnComponent: { type: DisciplineModuleComponent }
        },
        {
          name: 'Status',
          objectKey: 'status',
          columnComponent: { type: StatusModuleComponent }
        },
        {
          name: 'Claim Source',
          objectKey: 'claimSource',
          stackedHeading: 'Custom heading'
        },
        {
          name: 'Action',
          objectKey: 'action',
          columnComponent: { type: ActionModuleComponentMpc }
        }
      ],
      data: []
    };
    this.configObject2 = {
      settings: [
        {
          objectKey: 'fileReference',
          columnOrder: 1,
          sort: 'enable'
        },
        {
          objectKey: 'receivedDate', // Received Date added as per Ticket #1213 Point 11.
          columnOrder: 2,
          sort: 'asc'
        },
        {
          objectKey: 'dIcon',
          columnOrder: 3,
          sort: 'enable'
        },
        {
          objectKey: 'claimTypeCat',
          columnOrder: 4,
          sort: 'enable'
        },
        {
          objectKey: 'status',
          columnOrder: 5,
          sort: 'enable'
        },
        {
          objectKey: 'claimSource',
          columnOrder: 6,
          sort: 'enable'
        },
        {
          objectKey: 'action',
          columnOrder: 7,
          sort: 'disable'
        },
      ],
      fields: [
        {
          name: 'File Name',
          objectKey: 'fileReference'
        },
        {
          name: 'Received Date',
          objectKey: 'receivedDate'
        },
        {
          name: 'Discipline',
          objectKey: 'dIcon',
          columnComponent: { type: DisciplineModuleComponent }
        },
        {
          name: 'Claim Type',
          objectKey: 'claimTypeCat'
        },
        {
          name: 'Status',
          objectKey: 'status',
          columnComponent: { type: StatusModuleComponent }
        },
        {
          name: 'Claim Source',
          objectKey: 'claimSource',
          stackedHeading: 'Custom heading'
        },
        {
          name: 'Action',
          objectKey: 'action',
          columnComponent: { type: ActionModule2Component }
        }
      ],
      data: []
    };
/* Issue:1213-point:10--Low income & dasp list differentiated for ADSC start*/
    this.configObject3 = {
      settings: [
        {
          objectKey: 'fileReference',
          columnOrder: 1,
          sort: 'asc'
        },
        {
          objectKey: 'dIcon',
          columnOrder: 2,
          sort: 'asc'
        },
        {
          objectKey: 'status',
          columnOrder: 3,
          sort: 'asc'
        },
        {
          objectKey: 'claimSource',
          columnOrder: 4,
          sort: 'asc'
        },
        {
          objectKey: 'action',
          columnOrder: 5,
          sort: 'disable'
        },
      ],
      fields: [
        {
          name: 'File Name',
          objectKey: 'fileReference'
        },
        {
          name: 'Claim Type',
          objectKey: 'dIcon',
          columnComponent: { type: DisciplineModuleComponent }
        },
        {
          name: 'Status',
          objectKey: 'status',
          columnComponent: { type: StatusModuleComponent }
        },
        {
          name: 'Claim Source',
          objectKey: 'claimSource',
          stackedHeading: 'Custom heading'
        },
        {
          name: 'Action',
          objectKey: 'action',
          columnComponent: { type: ActionModule2Component }
        }
      ],
      data: []
    };

    // To Get Dashbooard Url for Initiate claim from Dashboard
    if (this.route.snapshot.url.length) {
      if (this.route.snapshot.url[0].path == "alberta") {
        this.isADSCDashboard = true
      } else {
        this.isADSCDashboard = false
      }
    } else {
      this.isADSCDashboard = false
    }
    this.currentUserService.isAdscDashboard = this.isADSCDashboard

    //To Show Reports Tab Grid Data According to Quikcard & Alberta
    if (this.route.snapshot.url.length) {
      if (this.route.snapshot.url[0].path == "alberta") {
        this.bussType = "S"
        this.albertaTab = true
        this.disciplineType = 1
        this.observable = Observable.interval(500).subscribe(x => {
          if (this.check = true) {
            if ('header.setup' == this.translate.instant('header.setup')) {
            }
            else {
              this.dashboardHeading = this.translate.instant('header.adsc')
              this.check = false;
              this.observable.unsubscribe();
            }
          }
        });
        this.configObjectReport = {
          settings: [
            {
              objectKey: 'ReportName',
              columnOrder: 1
            }
          ],
          fields: [
            {
              name: 'Report Name',
              objectKey: 'ReportName'
            }
          ],
          data: [
            {
              'id': 1,
              'userId': 0,
              'userName': '',
              'status': '',
              'fileName': '',
              'fileReference': '',
              'claimType': '',
              'claimSource': '',
              'businessTypeDesc': '',
              'action': '',
              'srno': 0,
              'businessTypeCd': '',
              'ReportName': 'Daily Claim Processing',
              'columnShow': false,
              'claimKey': null,
              'disciplineKey': null,
              'claimScannedFileKey': null,
              'claimTypeCat': 'Paper',
              'serviceDate': '',
              'commentTxt':''
            },
            {
              'id': 2,
              'userId': 0,
              'userName': '',
              'status': '',
              'fileName': '',
              'fileReference': '',
              'claimType': '',
              'claimSource': '',
              'businessTypeDesc': '',
              'action': '',
              'srno': 0,
              'businessTypeCd': '',
              'ReportName': 'Govt Claims Volume Report',
              'columnShow': false,
              'claimKey': null,
              'disciplineKey': null,
              'claimScannedFileKey': null,
              'claimTypeCat': 'Paper',
              'serviceDate': '',
              'commentTxt': ''
            },
           
            {
              'id': 4,
              'userId': 0,
              'userName': '',
              'status': '',
              'fileName': '',
              'fileReference': '',
              'claimType': '',
              'claimSource': '',
              'businessTypeDesc': '',
              'action': '',
              'srno': 0,
              'businessTypeCd': '',
              'ReportName': 'DOB Mismatch Report',
              'columnShow': false,
              'claimKey': null,
              'disciplineKey': null,
              'claimScannedFileKey': null,
              'claimTypeCat': 'Paper',
              'serviceDate': '',
              'commentTxt': ''
            },
                       
            // Below array added to show Claim Payments by Cardholder in reports (ADSC) 
            {
              'id': 16,
              'userId': 0,
              'userName': '',
              'status': '',
              'fileName': '',
              'fileReference': '',
              'claimType': '',
              'claimSource': '',
              'businessTypeDesc': '',
              'action': '',
              'srno': 0,
              'businessTypeCd': '',
              'ReportName': 'Claim Payments by Cardholder',
              'columnShow': false,
              'claimKey': null,
              'disciplineKey': null,
              'claimScannedFileKey': null,
              'claimTypeCat': 'Paper',
              'serviceDate': '',
              'commentTxt': ''
            }
          ]
        };
      }
    } else {
      // used observable to get the translated object
      this.observable = Observable.interval(500).subscribe(x => {
        if (this.check = true) {
          if ('header.setup' == this.translate.instant('header.setup')) {
          }
          else {
            this.dashboardHeading = this.translate.instant('header.quikcard')
            this.check = false;
            this.observable.unsubscribe();
          }
        }
      });
      this.albertaTab = false
      this.disciplineType = 0
      this.configObjectReport = {
        settings: [
          {
            objectKey: 'ReportName',
            columnOrder: 1
          }
        ],
        fields: [
          {
            name: 'Report Name',
            objectKey: 'ReportName'
          }
        ],
        data: [
          {
            'id': 1,
            'userId': 0,
            'userName': '',
            'status': '',
            'fileName': '',
            'fileReference': '',
            'claimType': '',
            'claimSource': '',
            'businessTypeDesc': '',
            'action': '',
            'srno': 0,
            'businessTypeCd': '',
            'ReportName': 'Daily Claim Processing',
            'columnShow': false,
            'claimKey': null,
            'disciplineKey': null,
            'claimScannedFileKey': null,
            'claimTypeCat': 'Paper',
            'serviceDate': '',
            'commentTxt': ''
          },
       
          {
            'id': 3,
            'userId': 0,
            'userName': '',
            'status': '',
            'fileName': '',
            'fileReference': '',
            'claimType': '',
            'claimSource': '',
            'businessTypeDesc': '',
            'action': '',
            'srno': 0,
            'businessTypeCd': '',
            'ReportName': 'Quikcard Claims Volume Report',
            'columnShow': false,
            'claimKey': null,
            'disciplineKey': null,
            'claimScannedFileKey': null,
            'claimTypeCat': 'Paper',
            'serviceDate': '',
            'commentTxt': ''
          },
          {
            'id': 4,
            'userId': 0,
            'userName': '',
            'status': '',
            'fileName': '',
            'fileReference': '',
            'claimType': '',
            'claimSource': '',
            'businessTypeDesc': '',
            'action': '',
            'srno': 0,
            'businessTypeCd': '',
            'ReportName': 'DOB Mismatch Report',
            'columnShow': false,
            'disciplineKey': null,
            'claimKey': null,
            'claimScannedFileKey': null,
            'claimTypeCat': 'Paper',
            'serviceDate': '',
            'commentTxt': ''
          },

          {
            'id': 26,
            'userId': 0,
            'userName': '',
            'status': '',
            'fileName': '',
            'fileReference': '',
            'claimType': '',
            'claimSource': '',
            'businessTypeDesc': '',
            'action': '',
            'srno': 0,
            'businessTypeCd': '',
            'ReportName': 'Claim Payments by Cardholder',
            'columnShow': false,
            'claimKey': null,
            'disciplineKey': null,
            'claimScannedFileKey': null,
            'claimTypeCat': 'Paper',
            'serviceDate': '',
            'commentTxt': ''
          }
        ]
      };
    }
  }

  getActiveTab(event) {
    this.tabBsnsType = event
  }

  ngOnInit() {
    localStorage.setItem('numberOfApi', 'null');
    if (this.route.queryParams) {
      this.route.queryParams.subscribe(params => 
        {
          this.routedClaimKey = params.claimKey
        });
    }
    this.showPageLoader = true
    this.bsnsKey = localStorage.getItem('bsnsKey');
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currenUser = this.currentUserService.currentUser
        if (this.currenUser.businessType.bothAccess) {
          this.isAdmin = 'T'
        }
        this.getAuthArray()
        this.getBusinessType().then(res => {
          this.implementOninit();
        })
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currenUser = this.currentUserService.currentUser
        if (this.currenUser.businessType.bothAccess) {
          this.isAdmin = 'T'
        }
        this.getAuthArray()
        this.getBusinessType().then(res => {
          this.implementOninit();
        })
      })
    }
    this.bulletinForm = new FormGroup({
      bulletinTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty])
    });
    this.referClaim = new FormGroup({
      rfrClmUser: new FormControl('', [Validators.required]),
      rfrClaimCommentTxt: new FormControl('', [Validators.required, Validators.maxLength(512), CustomValidators.notEmpty]),
      rfrClaimImportant: new FormControl(''),
    });
    var self = this
    $(document).on('click', 'table#referClaimTable tbody tr td:not(:last-child)', function () {
      self.markReferClaimAsRead(self.dataTableService.claimReferalKey)
    })
    $(document).on('click', ".referClaimComment", function (e) {
      let claimReferralKey = $(this).data('id')
      $(this).addClass('disabled')
      setTimeout(() => {
        $(this).removeClass('disabled')

      }, 100);
      self.getReferClaimComment(claimReferralKey)
    })

    //added for log 982 
    $(document).on('click', ".deleteReferedCalim", function (e) {
      let claimReferralKey = $(this).data('id')
      self.deleteDomainInfo(claimReferralKey);

    })
   
     /**
     * Auto refresh the grids after 1 mins
     */
      this.observableObjForEnteredClaim = Observable.interval(5000 * 60).subscribe(x => {     
      this.autoRefreshClaimsToBeEnteredTab();
    });

    this.claimDashboardReport = new FormGroup({
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      'cardNumber': new FormControl('', [Validators.required]),
      'dropDown': new FormControl('', [Validators.required]),
      'reference': new FormControl(''), /* Log #999: Pending from backend  */
      'processor': new FormControl('')
    });

    this.showClaimDashboardFields = [
      { "startDate": true },
      { "endDate": true },
      { "dropDown": true }
    ]

    /**
     * Auto refresh the dashboard counts(Every 15 mins)
     */
    this.observableObjForEnteredClaims = Observable.interval(15000 * 60).subscribe(obj => {  
      this.disciplineArray = [];
      this.claimStatusArray = [];
      this.monthsArray = [];
      this.miscellaneousArray = [];
      this.implementOninit();
    });

    /* Get Predictive Operator API  */
    this.getPredictiveOperatorData(this.completerService)
    // emit value for stop getAllFiles api in finance dashboard 
      this.claimService.getApiEmitter.subscribe(value =>{
      this.getForApi = value;
    })
    this.commentForm = new FormGroup({
      commentTxt: new FormControl('', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]),
      isImportant: new FormControl('')
    });
  }

  ngAfterViewInit() {
    var self = this
    $(document).on('click', 'table#adjustmentReqTable tbody td', function () {
      if (!$(this).find('td.dataTables_empty').length) {
        var indexCell = $(this).index()
        if ($(this).index() == 4) {
        } else {
          window.open('/claim/searchClaim?referenceno=' + self.dataTableService.claimNumber + '&businessType=' + self.dataTableService.businessType);
        }
      }
    })

    $(document).on('click', '#adjustmentReqTable .download-ico', function() {
      let filePath = $(this).data('filepath')
      if (filePath != undefined && filePath != "") {
        window.open(filePath, '_blank');
      }
    })

    // Log #1299: comment icon functionality
    $(document).on('click', '#adjustmentReqTable .commentMsg', function (e) {
      let comText = $(this).data('comtext')
      if (comText != undefined && comText != "" && comText != "null") {
        self.commentText = comText
        setTimeout(() => {
          if (!$(this).data("hasMsgClicked")) {
            $(this).data("hasMsgClicked",true)
            self.hmsDataServiceService.OpenCloseModal('viewCpmmentsPopup')
          }
        }, 300);
      }
      $(this).data("hasMsgClicked",false)
    })
    // Delete functionality of dashboard > Quikcard dashboard > Adjustment requests.
    $(document).on('click', '#adjustmentReqTable .del-ico', function (e) {
      self.exDialog.openConfirm("Do you want to delete the adjustment request?").subscribe((value) => {        
        if (value) {
          let claimNumber = {'claimNumber' : self.dataTableService.claimNumber} 
          let url = Constants.baseUrl + 'financial-payable-service/delAdjClaimRequest' 
          self.hmsDataServiceService.postApi(url, claimNumber).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              if (data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
                self.toastr.success("Adjustment request deleted successfully.");
                self.getAdjustmentRequestData()
              }
            }
            if (data.code == 400) {
             self.toastr.warning("Record update failed!")
            }
          });
        }
      });
    })
  }

  deleteDomainInfo(id) {
    this.exDialog.openConfirm("Do you want to clear claim?").subscribe((value) => {
      this.exDialog.getDialogArray().forEach(element => {
        this.exDialog.clearAllDialogs(element);
      });
      if (value) {
        this.hmsDataServiceService.delete(ClaimApi.deleteReferedClaim + '/' + id).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastr.success("Claim removed successfully.");
            this.getReferClaimList();
          } else if (data.code == 404) {
            this.toastr.error(data.hmsMessage.messageShort);
          } else {
            this.toastr.error("Error. Please try again later.");
          }
        })
      }
    });
  }

  implementOninit() {
     this.currenUser
    var date = new Date();
    var monthLabels = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    var monthIndex = date.getMonth()
    if (monthIndex < 6) {
      var lastMonth = ((date.getMonth())+6);
    }
    else{
      var lastMonth = ((date.getMonth())-6);
    } 
    this.currentMonth = monthLabels[monthIndex]; 
     this.lastMonth = monthLabels[lastMonth];  // in previous six months 
    var businessType = ''

    this.role = ''
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "alberta") {
        this.role = 'ROLE_SUPER_ADMIN'
        businessType = 'AB Gov.'
      }
    } else {
      this.role = localStorage.getItem('roleLabel');
    }
    this.getBulletin(this.businessTypeCd);
    if (this.businessTypeDesc == 'Quikcard') {
      this.ShowTabs = true;
      this.ShowGrid = true;
      this.showPageLoader = false
      this.ShowTraceyGrid = false;
      this.getQuikCardClaim();
      this.getCountUnreadReferClaim()
      this.observableObj = Observable.interval(6000000).subscribe(value => {
        this.getQuikCardClaim();
      });
      this.preAuthTxt = "Drug"
      this.loginUserIdQuikCard = Constants.quikcardUserId;
    } else if (this.businessTypeDesc == 'AB Gov.') {
      this.ShowTabs = false;
      this.ShowGrid = false;
      this.ShowTraceyGrid = true;
      this.showPageLoader = false
      this.getGovClaim();
      this.getCountUnreadReferClaim()
      this.observableObj = Observable.interval(6000000).subscribe(value => {
        this.getGovClaim();
      });
      this.preAuthTxt = "Pre-Auth"
      this.loginUserIdAb = Constants.albertaUserId;
    }
    //Other Users Like Tracey
    else {
      this.ShowTabs = false;
      this.ShowGrid = false;
      this.ShowTraceyGrid = true;
      this.getGovClaim();
      this.observableObj = Observable.interval(6000000).subscribe(value => {
        this.getGovClaim();
      });
    }

    //Start Dashboard API

    this.showLoader = true;
    let submitData = {
      'businessType': this.businessTypeCd
    }
    this.hmsDataServiceService.postApi(ClaimApi.getDashboardCount, submitData).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == "Record_Found") {
        this.showLoader = false;
        this.showPageLoader = false
        //Count By Discipline        
        //For Melissa Type Users
        if (!data.result.disciplineCount) {
          if (this.businessTypeDesc == 'Quikcard') {
            this.disciplineArray = [
              { heading: "Dental", count: 0 },
              { heading: "Health", count: 0 },
              { heading: "Vision", count: 0 },
              { heading: "Drug", count: 0 },
              { heading: "Supplemental", count: 0 },
              { heading: "Wellness", count: 0 },
            ];
          } else {
            //For Tracey Type Users
            this.disciplineArray = [
              { heading: "Dental", count: 0 },
            ];
          }
        } else {
          if (this.businessTypeDesc == 'Quikcard') {
            this.disciplineArray = [
              { heading: "Dental", count: data.result.disciplineCount.dentalCount },
              { heading: "Health", count: data.result.disciplineCount.healthCount },
              { heading: "Vision", count: data.result.disciplineCount.visionCount },
              { heading: "Drug", count: data.result.disciplineCount.drugCount },
              { heading: "Supplemental", count: data.result.disciplineCount.hsaCount },
              { heading: "Wellness", count: data.result.disciplineCount.wellnessCount } // New param wellnessCount added for Wellness as per Arun sir
            ];
          } else {
            //For Tracey Type Users
            this.disciplineArray = [
              { heading: "Dental", count: data.result.disciplineCount.dentalCount },
            ];
          }
        }
        //Count By Claim Status
        if (!data.result.claimStatusCount) {
          this.claimStatusArray = [
            { heading: "New", count: 0 },
            { heading: "Adjudicated", count: 0 },
            { heading: "Released", count: 0 },
            { heading: "Paid", count: 0 },
            { heading: "Pending", count: 0 },
            // #1266 Below one added to see the Adjudicated or approved claims but not released on dashboards of quikcard and ADSC."
            { heading: "EB/OCL", count: 0 }
          ];
        } else {
          if (this.businessTypeDesc == 'Quikcard') {
          this.claimStatusArray = [
            { heading: "New", count: data.result.claimStatusCount.newCount },
            { heading: "Adjudicated", count: data.result.claimStatusCount.adjudicatedCount },
            { heading: "Released", count: data.result.claimStatusCount.releasedCount },
            { heading: "Paid", count: data.result.claimStatusCount.paidCount },
            { heading: "Pending", count: data.result.claimStatusCount.pendingCount },
            // #1266 Below one added to see the Adjudicated or approved claims but not released on dashboards of quikcard and ADSC."
            { heading: "EB/OCL", count: data.result.claimStatusCount.adjAprvdUnrlsCount }
          ];
        }else{
          this.claimStatusArray = [
            { heading: "New", count: data.result.claimStatusCount.newCount },
            { heading: "Adjudicated", count: data.result.claimStatusCount.adjudicatedCount },
            { heading: "Released", count: data.result.claimStatusCount.releasedCount },
            { heading: "Paid", count: data.result.claimStatusCount.paidCount },
            // #1266 Below one added to see the Adjudicated or approved claims but not released on dashboards of quikcard and ADSC."
          ];
        }
      }
        // Claims Added Per Month
        this.monthsArray = [];
        if (!data.result.monthCount) {
          var arr2 = this.getPrevMonthsFromCurrent();
          this.monthsArray = arr2;
        } else {
          var arr1 = data.result.monthCount;
          var arr2 = this.getPrevMonthsFromCurrent();
          var finalArray = [];
          for (let monthKey in arr2) {
            let oriMonthKey = arr1.findIndex(x => x.monthNum === arr2[monthKey]['monthNum']);
            if (oriMonthKey >= 0) {
              this.monthsArray.push({ "count": arr1[oriMonthKey]['count'], "month": arr1[oriMonthKey]['month'], 'monthNum': arr2[monthKey]['monthNum'] });
            } else {
              this.monthsArray.push({ "count": 0, "month": arr2[monthKey]['month'], 'monthNum': arr2[monthKey]['monthNum'] });
            }
          }
        }
        //Miscellaneous
        if (this.role == 'ROLE_ADMIN' || this.businessTypeDesc == 'Quikcard') {
          if (data.result.claimTypeCount.unreleasePaperClaim == undefined || data.result.claimTypeCount.unreleasePaperClaim == null || data.result.claimTypeCount.unreleasePaperClaim == "") {
            data.result.claimTypeCount.unreleasePaperClaim = 0
          }
          this.miscellaneousArray = [
            { heading: "Pending iTrans Claims", count: data.result.claimTypeCount.itransPending, status: 'iTrans' },
            { heading: "Pending Paper Claims", count: data.result.claimTypeCount.paperCount, status: 'Paper' },
            { heading: "Phone-ins not Released", count: data.result.claimTypeCount.phoneInCount, status: 'PhoneIn' },
            { heading: "Suspended Accounts", count: data.result.coSuspend, status: 'suspended' },
            { heading: "Unreleased Paper Claims", count: data.result.claimTypeCount.unreleasePaperClaim, status: 'Unreleased' }
          ];
        } else {
          this.miscellaneousArray = [
            { heading: "Pending iTrans Claims", count: data.result.claimTypeCount.itransPending, status: 'iTrans' },
            { heading: "Pending Paper Claims", count: data.result.claimTypeCount.pendingPaperClaimCount, status: 'Paper' },
            { heading: "Unreleased Paper Claims", count: data.result.claimTypeCount.unreleasePaperClaim, status: 'Unreleased' },
          ];
        }

      } else {
        //Count By Claim Type Box
        this.showLoader = false;
        this.showPageLoader = false
        this.disciplineArray = [];
        //Count By Claim Status Box
        this.claimStatusArray = [];
        // Claims Added Per Month
        this.monthsArray = [];
        //Miscellaneous
        this.miscellaneousArray = [];
      }
    });
    //End Dashboard API 
  }

  /**
   * get claim type array to use in Refer Claim Grid
   */
  getClaimType() {
    let submitInfo = {
      "businessTypeCd": this.businessTypeCd
    }
    this.hmsDataServiceService.postApi(ClaimApi.getClaimListByBsnsType, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.arrClaimType = data.result;
      } else {
        this.arrClaimType = []
      }
    })

  }

  viewCommentForm() {
    this.hmsDataServiceService.OpenCloseModal('viewDbCommentsPopup');
  }

  ediCommentForm(data) {
    this.commentForm.patchValue({ 'commentTxt': data })
  }
  /**
   * 
   * @param event get entered value in input
   * @param frmControlName input Name
   * @param formName if form then enter form name else empty
   */
  ChangeSearchDateFormat(event, frmControlName, formName) {
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

  /**
   * Get Refer Claim list to Current User
   */
  getReferClaimList() {
    this.getClaimType()
    let referColumns = [
      { title: this.translate.instant('dashboard.referenceNo'), data: 'claimReferenceNumber' },
      { title: this.translate.instant('dashboard.entryDate'), data: 'entryDate' },
      { title: this.translate.instant('dashboard.claimType'), data: 'claimTypeDesc' },
      { title: this.translate.instant('common.card-id'), data: 'cardNumber' },
      { title: this.translate.instant('common.last-name'), data: 'lastName' },
      { title: this.translate.instant('common.first-name'), data: 'firstName' },
      { title: this.translate.instant('dashboard.referredBy'), data: 'claimReferralName' },
      { title: this.translate.instant('dashboard.referredTo'), data: 'referToName' },
      { title: this.translate.instant('dashboard.supervisor'), data: 'supervisorName' },
      { title: this.translate.instant('dashboard.referredDate'), data: 'referedDate' },
      { title: this.translate.instant('common.action'), data: 'claimReferralKey' },
    ]
    var reqParam = [
      { 'key': 'userKey', 'value': this.userId },
      { 'key': 'businessTypeKey', 'value': this.businessTypeKey },
    ]
    var tableActions = [
      { 'name': 'referClaimComment', 'class': 'table-action-btn referClaimComment', 'icon_class': 'fa fa-comment', 'title': 'Refer Claim Comment', 'showAction': 'T' },
      //Added for log 982
      { 'name': 'deleteReferedCalim', 'class': 'table-action-btn deleteReferedCalim', 'icon_class': 'fa fa-paint-brush', 'title': 'Clear Refer Claim', 'showAction': 'T' }
    ]
    if (!$.fn.dataTable.isDataTable('#referClaimTable')) {
      this.dataTableService.jqueryDataTable("referClaimTable", ClaimApi.getReferClaimList, 'full_numbers', referColumns,
        5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 10, [1, 7], 'T', [], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    } else {
      this.dataTableService.jqueryDataTableReload("referClaimTable", ClaimApi.getReferClaimList, reqParam)
    }
  }

  /* Adjustment Request Tab */
  getAdjustmentRequestData() {
    debugger
    this.getPayeeList();
    let adjReqColumns = [
      { title: this.translate.instant('dashboard.claimNo'), data: 'claimNumber' },
      { title: this.translate.instant('dashboard.payeeName'), data: 'payeeName' },
      { title: this.translate.instant('uft.dashboard.pending-funds.payeeType'), data: 'payeeType' },
      { title: this.translate.instant('uft.dashboard.brokerPayments.amount'), data: 'totalPaid' },
      { title: this.translate.instant('common.action') , data: 'claimKey'}
    ]
    let bussType = ""
    if (this.albertaTab) {
      bussType = "S"
    } else {
      bussType = "Q"
    }
    var reqParam = [
      { 'key': 'businessType', 'value': bussType },
      { 'key': 'claimNumber', 'value': "" },
      { 'key': 'payeeName', 'value': "" },
      { 'key': 'payeeType', 'value': "" },
      { 'key': 'totalPaid', 'value': "" }
    ]
    // Delete button added in action column of adjustment request.
    var tableActions = [
      { 'name': 'commentMsg', 'class': 'table-action-btn commentMsg', 'icon_class': 'fa fa-comment', 'title': 'Comment', 'showAction': '' },
      { 'name': 'adjustmentRequestDeleteAction', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
      { 'name': 'attachment', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Attachment', 'showAction': '' },
    ]
    if (!$.fn.dataTable.isDataTable('#adjustmentReqTable')) {
      debugger
      this.dataTableService.jqueryDataTable("adjustmentReqTable", UftApi.getAdjustmentRequestUrl, 'full_numbers', adjReqColumns,
        5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, [4], [], 'T', [3], [1,2,3])
    } else {
      debugger
      this.dataTableService.jqueryDataTableReload("adjustmentReqTable", UftApi.getAdjustmentRequestUrl, reqParam)
    }
  }
  
    /* Get OverrideReason Type List for Predictive Search */
  getOverrideReason() {
    var URL = UftApi.getCardholderNameForClaimPayment + this.claimDashboardReport.value.cardNumber;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let arr = [];
        for (var i = 0; i < data.result.length; i++) {
          arr.push({ 'id': data.result[i].cardholderKey, 'itemName': data.result[i].cardholderName })
        }
        this.overrideReasonList = arr
      }
    });
  }
  /**
   * show the count on cliam referd to current user
   */
  getCountUnreadReferClaim() {
    let submitData = {
      "businessTypeKey": this.businessTypeKey,
      "userKey": this.userId
    }
    this.hmsDataServiceService.postApi(ClaimApi.getCountUnreadReferClaim, submitData).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.referedClaimCount = data.result.referedClaimCount
      } else { }
    });
  }

  /**
   * on click icon mark all claim as seen
   */
  markReferClaimAsRead(claimReferalKey) {
    let submitData = {
      "claimReferralKey": claimReferalKey,
    }
    this.hmsDataServiceService.postApi(ClaimApi.markReferClaimAsRead, submitData).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.referedClaimCount = 0
        this.router.navigate(["/claim/view/" + this.dataTableService.referClaimKey + "/type/" + this.dataTableService.referClaimDisciplinekey]);
      } else {
      }
    });
  }

  /**
   * Get Refer Claim list to Current User after Grid Filteration
   * @param tableId //id of table in html
   */
  getReferClaimListByGridFilteration(tableId: string) {
    var params = this.dataTableService.getFooterParamsSearchTable(tableId, {})
    params.push({ 'key': 'userKey', 'value': this.userId },
      { 'key': 'businessTypeKey', 'value': this.businessTypeKey })
    var dateParams = [1, 9]
    this.dataTableService.jqueryDataTableReload(tableId, ClaimApi.searchReferClaim, params, dateParams)
  }

  /**
   * Reset Grid Filteration
   */
  resetTableSearch() {
    this.dataTableService.resetTableSearch()
    this.getReferClaimListByGridFilteration("referClaimTable")
  }

  getReferClaimComment(claimReferralKey) {
    let submitInfo = {
      "claimReferralKey": claimReferralKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getReferClaimComment, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.referClaimMessage = data.result.referComment;
        if (this.referClaimMessage == '') {
          this.referClaimMessage = 'No Record Found'
        }
        setTimeout(() => {
          this.hmsDataServiceService.OpenCloseModal('viewReferClaim')
        }, 100);
      } else {
        this.referClaimMessage = 'No Record Found'
      }
    })
  }
  /**
   * export refer claim excel
   */
  exportExcel() {
    let submitData = {
      "businessTypeKey": this.businessTypeKey,
      "userKey": this.userId,
      "length": 100
    }
    this.hmsDataServiceService.postApi(ClaimApi.exportReferClaimExcelForUser, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        var blob = this.hmsDataServiceService.b64toBlob(imagePath, docType);
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        a.download = 'Refer_Claim_' + todayDate;
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 0)
        this.toastr.success("Refer Claim File Download Successfully")
      } else {
        this.toastr.success("Refer Claim File Not Downloaded!!")
      }
    })
  }


  getAuthArray() {
    let checkArray = (this.currentUserService.authChecks['SCL']).concat(this.currentUserService.authChecks['DBC'])
    let addClaim = this.currentUserService.authChecks['VCD'].filter(val => val.actionObjectDataTag == 'VCD66').map(data => data)
    checkArray.push(addClaim[0])
    this.getAuthCheck(checkArray)
  }

  getAuthCheck(claimChecks) {
    let userAuthCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.claimDashBoardCheck = [{
        "CountByDiscipline": 'T',
        "claimsAddedMonth": 'T',
        "countByClaimStatus": 'T',
        "miscellaneous": 'T',
        'addBulletin': 'T',
        'deleteBulletin': 'T',
        'addUpdateBulletin': 'T',
        'unlockClaim': 'T',
        'searchClaim': 'T',
        'initiateClaim': 'T',
        'addClaim': 'T',
        'DASP': 'T',
        'lowIncome': 'T',
        'review': 'T',
        'daspReview': 'T',
        'quikcard': 'T',
        'initiatedClaim': 'T',
        'copyClaim': 'T',
        'removeFile': 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        userAuthCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.claimDashBoardCheck = [{
        "CountByDiscipline": userAuthCheck['DBD20'],
        "claimsAddedMonth": userAuthCheck['DBD21'],
        "countByClaimStatus": userAuthCheck['DBD22'],
        "miscellaneous": userAuthCheck['DBD23'],
        'addBulletin': userAuthCheck['ABL24'],
        'deleteBulletin': userAuthCheck['DBL300'],
        'addUpdateBulletin': userAuthCheck['ABL25'],
        'unlockClaim': userAuthCheck['DBD26'],
        'searchClaim': userAuthCheck['SCL27'],
        'initiateClaim': userAuthCheck['VCD66'],
        'addClaim': userAuthCheck['SCL28'],
        'DASP': userAuthCheck['DBC331'],
        'lowIncome': userAuthCheck['DBC332'],
        'review': userAuthCheck['DBC333'],
        'daspReview': userAuthCheck['DBC334'],
        'quikcard': userAuthCheck['DBC335'],
        'initiatedClaim': userAuthCheck['DBD411'],
        'copyClaim': userAuthCheck['DBD410'],
        'removeFile': userAuthCheck['DBD409']
      }]
    }
    this.claimDashboradService.emitAuthChecks.emit(this.claimDashBoardCheck)
    return this.claimDashBoardCheck
  }

  ngOnDestroy() {
    this.observableObj.unsubscribe();
    this.observableObjForEnteredClaim.unsubscribe();
    this.observableObjForEnteredClaims.unsubscribe(); // dashboard api are show only dashboard section not for show all dashboard section
  }

  /**
   * Function To Get Last 5 Months From Current Month
   */
  getPrevMonthsFromCurrent() {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var i = 1;
    var monthNamesArr = [];
    do {
      if (month < 0) {
        month = 11;
        year--;
      }
      monthNamesArr.push({ "count": 0, "month": monthNames[month], "monthNum": "" + (+month + 1) + "" });
      month--;
      i++;
    } while (i <= 5);
    return monthNamesArr;
  }

  /**
   * Function To Get All PDF Files
   * Company:ADSC Govt.
  */
  getGovClaim() {
    this.getAllFiles('traceyTab').then(row => {
      if (this.dataArray3 != undefined) {
        let adscData = this.dataArray3.sort(function (a,b) {
          return a.receivedDate - b.receivedDate  // changed from fileReference to receivedDate as discussed(09-Jul-2024)
        })
       
        //  if(!this.onDashboardClick){        // Adsc dashboard unnecessary api stop functionality
          this.configObject2.data = adscData
        // }
        
        //Log#1255
        if (this.routedClaimKey != undefined) {
          for (var i in this.dataArray3) {
            if(this.dataArray3[i].claimKey != undefined || this.dataArray3[i].claimKey != null || this.dataArray3[i].claimKey != "") {
              if (this.routedClaimKey == this.dataArray3[i].claimKey ) {
                let sum, currentPage=1;
                let index: number = +i;
                do{
                    if(index > 10){
                      sum = index - 10;
                      index = sum;
                      currentPage++;
                    }
                  }
                while (sum>10); 
                this.myTable.goToPage(currentPage);
              }
              else{
              }  
            }else{
            }
          }
        }
      } else {
        this.configObject2.data = []
      }
      this.claimStatusNewCount = this.dataArray3.length
      this.isAlberta = 'T'
      if (this.currentUserService.dashboardTypeAdsc) {
        let currentPage = localStorage.getItem('currentPageDash')
        this.myTable.goToPage(+currentPage)
      }
    });
  }

  /**
   * Function To Get All PDF Files
   * Company:Quikcard.
  */
  getQuikCardClaim() {
    this.getAllFiles('melissaTab').then(row => {
      // For sorting API data
      let arrData = this.dataArray.sort( function (a, b) {
        return a.receivedDate - b.receivedDate  // changed from fileReference to receivedDate as discussed(09-Jul-2024)
      }); 

        // if(!this.onDashboardClick){         // quickard dashboard unnecessary api stop functionality
         this.configObject.data = arrData   
         this.configObjectMpc.data = this.dataArray;
         this.claimStatusNewCount = this.dataArray.length
        // }
         this.isAlberta = 'F'
    
      if (this.currentUserService.dashboardTypeQuikcard) {
        let currentPage = localStorage.getItem('currentPageDash')
        this.myTable.goToPage(+currentPage)
      }
      if (this.routedClaimKey != undefined && this.dataArray != undefined) {
        for (var i in this.dataArray) {
          if(this.dataArray[i].claimKey != undefined || this.dataArray[i].claimKey != null || this.dataArray[i].claimKey != "") {
            if (this.routedClaimKey == this.dataArray[i].claimKey ) {
              let sum, currentPage=1;
              let index: number = +i;
              do{
                  if(index > 10){
                    sum = index - 10;
                    index = sum;
                    currentPage++;
                  }
                }
              while (sum>10); 
              this.myTable.goToPage(currentPage);
            }
            else{
            }  
          }else{
          }
        }
      }
    });
  }

  /**
   * Function To Get All Claim PDF Files
   * Based on Quikcard Or Govt
   */
  getAllFiles(tab) {
    let promise = new Promise((resolve, reject) => {
      this.currentTab = tab

      if (tab == 'melissaTab') {
        this.dataArray = [];
        let arrList = []
        let paramData = {
          "businessTypeKey": this.businessTypeKey
        }
        if(!this.getForApi == true){
        this.hmsDataServiceService.postApi(ClaimApi.getClaimPdfFiles, paramData).subscribe(data => {
          if (data.code == 200 && data.result.length > 0) {

            let srno = 1;
            let columnShow = false;
            let counterColumn = 0;
            data.result.forEach(element => { 
                //Added for log 967
                /* Below code is commented due to Ticket #1213 point 4*/
                columnShow = true;
                counterColumn++;
              element = Object.assign({ "action": false, "srno": srno, "dIcon": false, "columnShow": columnShow }, element);
              arrList.push(element)
              let filteredList = arrList.filter(function (e) {
              return e.claimStatusKey != 9 && e.claimStatusKey != 11 && e.claimStatusKey != 13 && e.claimStatusKey != 14 && !(e.claimStatusKey == 12 && e.releaseInd == "T")
              });
              this.dataArray = filteredList
              srno++;

            });
            resolve();
          } else {
            this.dataArray = [];
            resolve();
          }
        });
      }
      } else if (tab == 'traceyTab') {
        this.dataArray3 = [];
        let adscList = []
        let claimTypeTraceyArr = []
        let adscLowIncomeList = [];
        let adscDaspList = [];
        if (this.claimDashBoardCheck[0].DASP == 'T') {
          claimTypeTraceyArr.push('DASP')
        }
        if (this.claimDashBoardCheck[0].lowIncome == 'T') {
          claimTypeTraceyArr.push('Low Income')
        }
        if (this.claimDashBoardCheck[0].review == 'T') {
          claimTypeTraceyArr.push('Review')
        }
        if (this.claimDashBoardCheck[0].daspReview == 'T') {
          claimTypeTraceyArr.push('DASP Review')
        }

        let paramData = {
          "businessTypeKey": this.businessTypeKey,
          "claimTypeArray": claimTypeTraceyArr
        }
        this.hmsDataServiceService.postApi(ClaimApi.getClaimPdfFiles, paramData).subscribe(data => {
          if (data.code == 200 && data.result.length > 0) {
            let srno = 1;
            let columnShow = false;
            let counterColumn = 0;
            data.result.forEach(element => {
                //Added for log 967
                /* Below code is commented due to Ticket #1213 point 4 */
                columnShow = true;
                counterColumn++;            
              element = Object.assign({ "action": false, "srno": srno, "dIcon": false, "columnShow": columnShow }, element);
              adscList.push(element)
              let adscFilteredList = adscList.filter(function (e) {
              return e.claimStatusKey != 9 && e.claimStatusKey != 11 && e.claimStatusKey != 13 && e.claimStatusKey != 14 && !(e.claimStatusKey == 12 && e.releaseInd == "T") && !(e.claimStatusKey == 12 && e.claimReferralInd == "T")
              });
              this.dataArray3 = adscFilteredList
              srno++;                          
            });
            resolve();
          } else {
            this.dataArray3 = [];
            resolve();
          }
        });
      }
    });
    return promise;
  }

  /**
   * Function To Get Claim By Claim Type
   * @param status
   */
  getClaimByClaimType(status) {
    let statusCode = ""
    if (status != '') {
      switch (status) {
        case 'iTrans':
          statusCode = "I"
          break;
        case 'Paper':
          statusCode = "D"
          break;
        case 'PhoneIn':
          statusCode = "P"
          break;
        case 'suspended':
          statusCode = "U"
          break;
        case 'Unreleased':
          statusCode = "UN"
          break;
      }
      if (statusCode == "U") {
        window.open(location.origin + '/company?type=' + statusCode, '_blank');
      } else if (statusCode == "I") {
        if (this.businessTypeCd == Constants.albertaBusinessTypeCd) {
          window.open(location.origin + '/iTransViewer?type=' + statusCode + '&isGov=T', '_blank');
        } else {
          window.open(location.origin + '/iTransViewer?type=' + statusCode + '&isGov=F', '_blank');
        }
      } else {
        if (this.businessTypeCd == Constants.albertaBusinessTypeCd) {
          window.open(location.origin + '/claim/searchClaim?type=' + statusCode + '&isGov=T'+ '&isMisc=T', '_blank');
        } else {
          window.open(location.origin + '/claim/searchClaim?type=' + statusCode + '&isGov=F'+ '&isMisc=T', '_blank');
        }
      }
    } else {
    }
  }

  /**
   * Function To Get Claim By Claim Status
   * @param status
   */
  getClaimByClaimStatus(status) {
    if (this.claimDashBoardCheck[0].searchClaim == 'T') {
      if (status == 'New') {
        $("#enterdClaimTab")[0].click()
        $('html, body').animate({
          scrollTop: $("#dashboard-tab").offset().top
        }, 'slow');
      } else {
        if (status == "EB/OCL") {
          status = "Adjudicated Approved"
        }
        if (this.businessTypeCd == Constants.albertaBusinessTypeCd) {
          window.open(location.origin + '/claim/searchClaim?status=' + status + '&isGov=T', '_blank');
        } else {
          window.open(location.origin + '/claim/searchClaim?status=' + status + '&isGov=F', '_blank')
        }
      }
    } else {
      this.toastr.warning("You Are Not Authorize To View Claims")
    }
  }

  /**
   * Function To Get Claim By Claim Discpline
   * @param status
   */
  getClaimByDiscipline(status) {
    if (this.claimDashBoardCheck[0].searchClaim == 'T') {
      if (this.businessTypeCd == Constants.albertaBusinessTypeCd) {
        window.open(location.origin + '/claim/searchClaim?discipline=' + status.toUpperCase() + '&isGov=T', '_blank');
      } else {
        window.open(location.origin + '/claim/searchClaim?discipline=' + status.toUpperCase() + '&isGov=F', '_blank');
      }
    } else {
      this.toastr.warning("You Are Not Authorize To View Claims")
    }
  }

  /**
   * Redirect to claim search screen
   * @param month 
   */
  getClaimByClaimMonth(month) {
    if (this.claimDashBoardCheck[0].searchClaim == 'T') {
      var monthNum = +month
      if (this.businessTypeCd == Constants.albertaBusinessTypeCd) {
        window.open(location.origin + '/claim/searchClaim?monthNum=' + monthNum + '&isGov=T', '_blank');
      } else {
        window.open(location.origin + '/claim/searchClaim?monthNum=' + monthNum + '&isGov=F', '_blank');
      }
    } else {
      this.toastr.warning("You Are Not Authorize To View Claims")
    }
  }

  /**
   * Function For Submit Add Bulletin
   */
  addBulatine() {
    if (this.bulletinForm.valid) {
      let bulletinData = {
        "bulletinTxt": this.bulletinForm.value.bulletinTxt,
        "businessType": (this.businessTypeDesc == 'Quikcard') ? 'Q' : 'S',
        "dashboardCd": (this.businessTypeDesc == 'Quikcard') ? 'CBQ' : 'CBA'
      }
      this.hmsDataServiceService.post(ClaimApi.saveBulletinUrl, bulletinData).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          if (data.hmsMessage.messageShort == 'RECORD_UPDATED_SUCCESSFULLY') {
            this.getBulletin(bulletinData.businessType);
            this.showBulletin = true;
            this.hmsDataServiceService.OpenCloseModal('Bulletin');
            this.toastr.success(this.translate.instant('Bulletin saved successfully'));
          }
        }
      });
    }
  }

  /**
   * Function To Get Bulletin
   */
  getBulletin(businessTypeCd) {
    let bulletinData = {
      "businessType": (this.businessTypeDesc == 'Quikcard') ? 'Q' : 'S',
      "dashboardCd": (this.businessTypeDesc == 'Quikcard') ? 'CBQ' : 'CBA'
    }
    this.hmsDataServiceService.postApi(ClaimApi.getBulletinUrl, bulletinData).subscribe(data => {
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

  /**
   * Function To delete Bulletin
   */
  deleteBulletin(businessTypeCd) {
    this.exDialog.openConfirm(this.translate.instant('admin.toaster.deleteConfirmationBulletin')).subscribe((value) => {
      if (value) {
        let bulletinData = {
          "businessType": (this.businessTypeDesc == 'Quikcard') ? 'Q' : 'S',
          "dashboardCd": (this.businessTypeDesc == 'Quikcard') ? 'CBQ' : 'CBA'
        }
        this.hmsDataServiceService.postApi(ClaimApi.deleteBulletinUrl, bulletinData).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            if (data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
              this.toastr.success(this.translate.instant('Bulletin deleted successfully'));
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
    return promise;

  }
  changeTheme(businessTypeCd) {
    if (businessTypeCd == Constants.albertaBusinessTypeCd) {
      let node = document.createElement('link');
      node.href = 'assets/css/common-alberta.css';
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    } else {
      $('link[href="assets/css/common-alberta.css"]').remove();
    }
  }

  resetBulatine(formData) {
    this.bulletinForm.reset();
  }

  /**
 * 
 * @param $event Row Click Reports Grid
 */
  eventListener($event: GtEvent) {
    if ($event.name === 'gt-row-clicked') {
      if ($event.value.row.id) {
        this.reportID = $event.value.row.id;
        this.openModalWithReportID($event.value.row);
      }
    }
  }

  /**
   * Open Report Model With Report Data
   */
  openModalWithReportID(selectedReportRow) {
    this.hmsDataServiceService.OpenCloseModal('claim_D_ReportsListPopUp');
    this.reportPopUpTitle = selectedReportRow.ReportName;
    this.showReportList = false;
    switch (selectedReportRow.id) {
      case 1: //Daily Claim Processing
        this.claimDashboardReport.controls.endDate.setErrors(null);
        this.claimDashboardReport.controls.cardNumber.setErrors(null);
        this.claimDashboardReport.controls.dropDown.setErrors(null);
        this.tableId = 'dailyClaimProcessing';
        this.showClaimDashboardFields = [
          { "startDate": true },
          { "endDate": false },
          { "dropDown": false }
        ];
        break;
      case 2: //Govt Claims Volume Report 
        this.claimDashboardReport.controls.cardNumber.setErrors(null);
        this.tableId = 'govtClaimsVolumeReport';
        this.showClaimDashboardFields = [
          { "startDate": true },
          { "endDate": true },
          { "dropDown": true }
        ];
        this.claimDashboardReport.controls['startDate'].enable();
        break;
      case 3: //Quikcard Claims Volume Report
        this.claimDashboardReport.controls.dropDown.setErrors(null);
        this.claimDashboardReport.controls.cardNumber.setErrors(null);
        this.tableId = 'quikCardClaimsVolumeReport';
        this.showClaimDashboardFields = [
          { "startDate": true },
          { "endDate": true },
          { "dropDown": false }
        ];
        this.claimDashboardReport.controls['startDate'].enable();
        break;
      case 4: //DOB Mismatch Report
        this.claimDashboardReport.controls.dropDown.setErrors(null);
        this.claimDashboardReport.controls.cardNumber.setErrors(null); // 11 may 2020
        this.tableId = 'dobMismatchReport';
        this.showClaimDashboardFields = [
          { "startDate": true },
          { "endDate": true },
          { "dropDown": false }
        ];
        this.claimDashboardReport.controls['startDate'].enable();
        break;
        // Following case added to show Claim Payments by Cardholder in (ADSC) separately (diff ID) from Quikcard -> 
      case 16:
        this.claimDashboardReport.controls.dropDown.setErrors(null);
        this.tableId = 'claimpaymentbycardholder';
        this.showClaimDashboardFields = [
          { "startDate": true },
          { "endDate": true },
          { "dropDown": false }
        ];
        this.claimDashboardReport.controls['startDate'].enable();
        break;
      case 26: //490  Report
        this.claimDashboardReport.controls.dropDown.setErrors(null);
        this.tableId = 'claimpaymentbycardholder';
        this.showClaimDashboardFields = [
          { "startDate": true },
          { "endDate": true },
          { "dropDown": false }
        ];
        this.claimDashboardReport.controls['startDate'].enable();
        break;
      default:
        break;
    }
  }
  /**
   * Submit Reports form
   * @param reportData 
   */
  onSubmitReport(reportData) {

    if (this.claimDashboardReport.valid) {
      this.showReportList = true;

      switch (this.reportID) {
        case 1: //Daily Claim Processing
          var reqParam = [
            { 'key': 'discipline', 'value': this.albertaTab ? 'Dental' : '' },
            { 'key': 'confirmId', 'value': reportData.value.reference != null ? reportData.value.reference : "" },
            { 'key': 'entryDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'entryBy', 'value': reportData.value.processor != null ? reportData.value.processor : "" },
            { 'key': 'adjudicateDate', 'value': '' },
            { 'key': 'adjudicateBy', 'value': '' },
            { 'key': 'updatedOn', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'updatedBy', 'value': '' },
            { 'key': 'excel', 'value': 'F' },
          ];
          this.reportsListColumns = [
            { title: this.translate.instant('dashboard.discipline'), data: 'discipline' },
            { title: this.translate.instant('dashboard.reference'), data: 'confirmId' },
            { title: this.translate.instant('dashboard.entryDate'), data: 'entryDate' },
            { title: this.translate.instant('dashboard.enteredBy'), data: 'entryBy' },
            { title: this.translate.instant('dashboard.adjudDate'), data: 'adjudicateDate' },
            { title: this.translate.instant('dashboard.adjudicatedBy'), data: 'adjudicateBy' },
            { title: this.translate.instant('dashboard.lastModified'), data: 'updatedOn' },
            { title: this.translate.instant('dashboard.modifiedBy'), data: 'updatedBy' }
          ]
          var url = ClaimApi.dailyClaimProcessingReport;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {

            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportsListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', [2, 4, 6], 7, '', [1, 2, 3, 4, 5, 6, 7])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 2: //Govt Claims Volume Report 
          var reqParam2 = [
            { 'key': 'fromDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'toDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
            { 'key': 'filterBy', 'value': reportData.value.dropDown != null ? reportData.value.dropDown : '' }
          ];
          this.reportsListColumns = [
            { title: this.translate.instant('dashboard.operatorId'), data: 'operatorId' },
            { title: this.translate.instant('dashboard.userFullName'), data: 'userFullName' },
            { title: this.translate.instant('dashboard.discipline'), data: 'discipline' },
            { title: this.translate.instant('dashboard.phoneIn'), data: 'phoneIn' },
            { title: this.translate.instant('dashboard.paper'), data: 'paper' },
            { title: this.translate.instant('dashboard.preAuthAuthIn'), data: 'preauthPhoneIn' },
            { title: this.translate.instant('dashboard.preAuthPaper'), data: 'preauthPaper' },
            { title: this.translate.instant('dashboard.hbrcPreAuth'), data: 'hbrcPreauth' },
            { title: this.translate.instant('dashboard.eligibility'), data: 'eligibilityInquiry' },
            { title: this.translate.instant('dashboard.totalEntered'), data: 'totalEntered' },
            { title: this.translate.instant('dashboard.totalReleased'), data: 'totalReleased' },
            { title: this.translate.instant('dashboard.day'), data: 'day' },
            { title: this.translate.instant('dashboard.fromDate'), data: 'fromDate' },
            { title: this.translate.instant('dashboard.toDate'), data: 'toDate' }
          ]
          var url = ClaimApi.allGovernmentClaims;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportsListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam2, 10, '', [12, 13], 7, '', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam2)
          }
          break;
        case 3: //Quikcard Claims Volume Report
          var reqParam3 = [
            { 'key': 'fromDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'toDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' }
          ];
          this.reportsListColumns = [
            { title: this.translate.instant('dashboard.operatorId'), data: 'operatorId' },
            { title: this.translate.instant('dashboard.userFullName'), data: 'userFullName' },
            { title: this.translate.instant('dashboard.discipline'), data: 'discipline' },
            { title: this.translate.instant('dashboard.phoneIn'), data: 'phoneIn' },
            { title: this.translate.instant('dashboard.paper'), data: 'paper' },
            { title: this.translate.instant('dashboard.preAuthAuthIn'), data: 'preauthPhoneIn' },
            { title: this.translate.instant('dashboard.'), data: 'preauthPaper' },
            { title: this.translate.instant('dashboard.preAuthPaper'), data: 'hbrcPreauth' },
            { title: this.translate.instant('dashboard.eligibility'), data: 'eligibilityInquiry' },
            { title: this.translate.instant('dashboard.totalEntered'), data: 'totalEntered' },
            { title: this.translate.instant('dashboard.totalReleased'), data: 'totalReleased' },
            { title: this.translate.instant('dashboard.day'), data: 'day' },
            { title: this.translate.instant('dashboard.fromDate'), data: 'fromDate' },
            { title: this.translate.instant('dashboard.toDate'), data: 'toDate' }
          ]
          var url = ClaimApi.allQuikardClaims;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportsListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam3, 10, '', [12, 13], 7, '', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam3)
          }
          break;
        case 4: //DOB Mismatch Report   
          var reqParam4 = [
            { 'key': 'serviceDateFrom', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'serviceDateTo', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' }
          ];
          this.reportsListColumns = [
            { title: this.translate.instant('dashboard.serviceDate'), data: 'serviceDate' },
            { title: this.translate.instant('dashboard.claimDOB'), data: 'claimDOB' },
            { title: this.translate.instant('dashboard.personDOB'), data: 'personDOB' },
            { title: this.translate.instant('dashboard.personName'), data: 'personName' },
            { title: this.translate.instant('dashboard.cardHolderKey'), data: 'cardholderKey' },
            { title: this.translate.instant('dashboard.cardNumber'), data: 'cardNumber' },
            { title: this.translate.instant('dashboard.companyID'), data: 'comapnyId' },
            { title: this.translate.instant('dashboard.companyName'), data: 'companyName' },
            { title: this.translate.instant('dashboard.claimReferenceNumber'), data: 'claimRefNumber' }
          ];
          var url = ClaimApi.getDOBMismatchReport;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.reportsListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam4, '', undefined, [1, 2], '', [], [1, 2, 3, 4, 5, 6, 7, 8])

          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam4)
          }
          break;
          // Following CASE added to make Claim Payments by Cardholder (ADSC Dashboard reports) functionality working and ready for new API 
        case 16:
          this.filterColoumn = [
            { title: this.translate.instant('dashboard.card'), data: 'cardNumber' },
            { title: this.translate.instant('dashboard.confNumber'), data: 'confirmationNumber' },
            { title: this.translate.instant('dashboard.clientName'), data: 'cardholderName' },
            { title: this.translate.instant('dashboard.serviceDate'), data: 'serviceDate' },
            { title: this.translate.instant('dashboard.procedureCode'), data: 'procCd' },
            { title: this.translate.instant('dashboard.procedureDescription'), data: 'procDesc' },
            { title: this.translate.instant('dashboard.amountSubmitted'), data: 'amountSubmitted' },
            { title: this.translate.instant('dashboard.amountPaid'), data: 'amountPaid' },
            { title: this.translate.instant('dashboard.amountNotPaid'), data: 'amountNotPaid' }
          ];

          var chkey = [];
          if (this.selectedOverrideReason.length > 0) {
            for (var j = 0; j < this.selectedOverrideReason.length; j++) {
              chkey.push(this.selectedOverrideReason[j]['id'])
            }
          }
          reqParam = [
            { 'key': 'startDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'endDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
            { 'key': 'cardNumber', 'value': reportData.value.cardNumber },
            { 'key': 'chkeys', 'value': chkey },
            { 'key': 'disciplineType', 'value': 'Dental'},
            { 'key': 'disciplineOrder', 'value': '1'}
          ];

          if (this.columnFilterSearch) {
            console.warn(reportData.value.cardNumber);
            
            let cardNum = reportData.value.cardNumber
            if (this.GridFilter26_cardNumber && this.GridFilter26_cardNumber != '') {
              cardNum = this.GridFilter26_cardNumber;
            } else {
              this.GridFilter26_cardNumber = reportData.cardNumber;
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': cardNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'confirmationNumber', 'value': this.GridFilter26_confirmationNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardholderName', 'value': this.GridFilter26_cardholderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'serviceDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'procCd', 'value': this.GridFilter26_procCd });
            reqParam = this.pushToArray(reqParam, { 'key': 'procDesc', 'value': this.GridFilter26_procDesc });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountSubmitted', 'value': this.GridFilter26_amountSubmitted });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountPaid', 'value': this.GridFilter26_amountPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountNotPaid', 'value': this.GridFilter26_amountNotPaid });
          }
      
          // Need to add the URL for claims by cardholder in ADSC reports.
          var url = UftApi.claimPaymentsByCardholder; // common API used which is used for quikcard reports

          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3], '', [6], [], '', [0], '', [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 26: // 490 report

          this.filterColoumn = [
            { title: this.translate.instant('dashboard.card'), data: 'cardNumber' },
            { title: this.translate.instant('dashboard.confNumber'), data: 'confirmationNumber' },
            { title: this.translate.instant('dashboard.clientName'), data: 'cardholderName' },
            { title: this.translate.instant('dashboard.serviceDate'), data: 'serviceDate' },
            { title: this.translate.instant('dashboard.procedureCode'), data: 'procCd' },
            { title: this.translate.instant('dashboard.procedureDescription'), data: 'procDesc' },
            { title: this.translate.instant('dashboard.amountSubmitted'), data: 'amountSubmitted' },
            { title: this.translate.instant('dashboard.amountPaid'), data: 'amountPaid' },
            { title: this.translate.instant('dashboard.amountNotPaid'), data: 'amountNotPaid' }
          ];

          var chkey = [];
          if (this.selectedOverrideReason.length > 0) {
            for (var j = 0; j < this.selectedOverrideReason.length; j++) {
              chkey.push(this.selectedOverrideReason[j]['id'])
            }
          }

          reqParam = [
            { 'key': 'startDate', 'value': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '' },
            { 'key': 'endDate', 'value': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '' },
            { 'key': 'cardNumber', 'value': reportData.value.cardNumber },
            { 'key': 'chkeys', 'value': chkey }
          ];

          if (this.columnFilterSearch) {
            let cardNum = reportData.value.cardNumber
            if (this.GridFilter26_cardNumber && this.GridFilter26_cardNumber != '') {
              cardNum = this.GridFilter26_cardNumber;
            } else {
              this.GridFilter26_cardNumber = reportData.cardNumber;
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': cardNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'confirmationNumber', 'value': this.GridFilter26_confirmationNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardholderName', 'value': this.GridFilter26_cardholderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'serviceDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'procCd', 'value': this.GridFilter26_procCd });
            reqParam = this.pushToArray(reqParam, { 'key': 'procDesc', 'value': this.GridFilter26_procDesc });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountSubmitted', 'value': this.GridFilter26_amountSubmitted });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountPaid', 'value': this.GridFilter26_amountPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountNotPaid', 'value': this.GridFilter26_amountNotPaid });
          }
          /** End Narrow Search */
          var url = UftApi.claimPaymentsByCardholder;

          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3], '', [6], [], '', [0], '', [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        default:
          break;
      }
    } else {
      this.validateAllFormFields(this.claimDashboardReport)
    }

  }

  /* Method for validate the Form fields */
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

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.claimDashboardReport.patchValue(datePickerValue);
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
      this.claimDashboardReport.patchValue(datePickerValue);
    }
    if (this.claimDashboardReport.value.startDate && this.claimDashboardReport.value.endDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.claimDashboardReport.value.startDate.date, this.claimDashboardReport.value.endDate.date);
      if (this.error.isError == true) {
        this.claimDashboardReport.controls['endDate'].setErrors({
          "ToDateNotValid": true
        });
      }
    }
  }

  resetReportForm() {
    this.claimDashboardReport.reset();
    this.overrideReason = [] // Log #1212
  }
  /**
 * Remove multi select
 * @param item 
 * @param type 
 */
  onDeSelectMultiDropDown(item: any, type) {
    if (type == 'overrideReason') {
      this.selectedOverrideReason = []
      if (this.overrideReason.length > 0) {
        for (var j = 0; j < this.overrideReason.length; j++) {
          this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
        }
      } else {
        this.claimDashboardReport.controls[type].setValue('')
      }
    }
  }

  filterGridColumnSearch(tableId: string) {
    this.columnFilterSearch = true;
    if (tableId == "mail_search_report") {
      var ele: HTMLElement = document.getElementById('fr_search') as HTMLElement;
    } else {
      var ele: HTMLElement = document.getElementById(this.reportID + '-dataManagementReport') as HTMLElement;
    }
    ele.click();
  }

  /**
 * Common Function For Reset All Reports
 * Grid Column Filter Search
 * @param tableId 
 */
  resetGridColumnSearchFilter(tableId: string) {
    this.columnFilterSearch = false;
    this.resetFilters()
    var ele: HTMLElement = document.getElementById(this.reportID + '-dataManagementReport') as HTMLElement;
    ele.click();
  }
  resetFilters() {
    this.GridFilter26_confirmationNum = '';
    this.GridFilter26_cardNum = '';
    this.GridFilter26_cardholderName = '';
    this.GridFilter26_cardNumber = '';
    this.GridFilter26_confirmationNumber = '';
    this.GridFilter26_serviceDate = '';
    this.GridFilter26_procCd = '';
    this.GridFilter26_amountSubmitted = '';
    this.GridFilter26_amountPaid = '';
    this.GridFilter26_amountNotPaid = '';
    this.GridFilter26_procDesc = '';
  }

  /**
   * Get selected multi select list
   * @param item 
   */
  onSelectMultiDropDown(item: any, type) {
    this.selectedOverrideReason = []
    for (var j = 0; j < this.overrideReason.length; j++) {
      this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
    }
    if (type == 'overrideReason') {
      this.claimDashboardReport.controls[type].setValue(this.selectedOverrideReason);
    } else {
      this.filterOverrideReason = this.selectedOverrideReason;
    }
  }
  /**
 * On select all multi select dropdown values
 * @param items 
 * @param type 
 */
  onSelectAllMultiDropDown(items: any, type) {
    if (type == 'overrideReason') {
      this.selectedOverrideReason = []
      for (var j = 0; j < this.overrideReason.length; j++) {
        this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
      }
      this.claimDashboardReport.controls[type].setValue(this.selectedOverrideReason);
    }
  }

  /**
  * Empty the dropdown value
  * @param items 
  * @param type 
  */
  onDeSelectAllMultiDropDown(items: any, type) {
    if (type == 'overrideReason') {
      this.selectedOverrideReason = []
    }
  }

  dowloadPDFReport() {
    var requestParam = {};
    switch (this.reportID) {
      case 1: //Daily Claim Processing  
        if (this.dataTableService.totalRecords != undefined) {
          var apiUrl = ClaimApi.dailyClaimProcessingReport;
          let requestData1 = {
            "discipline": this.albertaTab ? 'Dental' : "",
            "confirmId": this.claimDashboardReport.value.reference != null ? this.claimDashboardReport.value.reference : "",
            "entryDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "entryBy": this.claimDashboardReport.value.processor != null ? this.claimDashboardReport.value.processor : "",
            "adjudicateDate": "",
            "adjudicateBy": "",
            "updatedOn": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "updatedBy": "",
            "start": 0,
            "length": this.dataTableService.totalRecords,
            "excel": "F",  // “ T if Excel needed to be generated”
          };
          var doc = new jsPDF('p', 'pt', 'a3');
          this.showPageLoader = true;
          var columns = [
            { title: 'Discipline', dataKey: 'discipline' },
            { title: 'Reference #', dataKey: 'confirmId' },
            { title: 'Entry Date', dataKey: 'entryDate' },
            { title: 'Entered By', dataKey: 'entryBy' },
            { title: 'Adjud. Date', dataKey: 'adjudicateDate' },
            { title: 'Adjudicated By', dataKey: 'adjudicateBy' },
            { title: 'Last Modified', dataKey: 'updatedOn' },
            { title: 'Modified By', dataKey: 'updatedBy' }
          ];
          this.hmsDataServiceService.postApi(apiUrl, requestData1).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              this.showPageLoader = false;
              for (var i in data.result.data) {
                data.result.data[i].updatedOn = data.result.data[i].updatedOn != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].updatedOn) : '';
                data.result.data[i].modifiedBy = data.result.data[i].modifiedBy != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].modifiedBy) : '';
                data.result.data[i].adjudicateDate = data.result.data[i].adjudicateDate != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].adjudicateDate) : '';
                data.result.data[i].entryDate = data.result.data[i].entryDate != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].entryDate) : '';
              }
              var rows = data.result.data;
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.reportPopUpTitle
              });
              this.pdfHeader(doc, headerobject);
              //End Header    
              doc.autoTable(columns, rows, {
                styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  lineColor: [215, 214, 213],
                  lineWidth: 1,
                },
                columnStyles: {
                  "discipline": { halign: 'left' },
                  "confirmId": { halign: 'right' },
                  "updatedOn": { halign: 'right' },
                  "entryBy": { halign: 'right' },
                  "updatedBy": { halign: 'right' },
                  "adjudicateDate": { halign: 'right' },
                  "entryDate": { halign: 'right' },
                  "adjudicateBy": { halign: 'right' }
                },
                didParseCell: function (data) {
                  if (data.section == 'head' && data.column.index != 0) {
                    data.cell.styles.halign = 'right';
                  }
                },
                startY: 100,
                startX: 40,
                theme: 'grid',
              });
              this.pdfFooter(doc, this.reportID);
              doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
            } else if (data.code == 404 && data.status == 'NOT_FOUND') {
              this.showPageLoader = false;
              this.toastr.error(this.translate.instant('common.record-not-found'));
            }
          });
        } else {
          this.toastr.error(this.translate.instant('common.record-not-found'));
        }
        break;
      case 2: //Govt Claims Volume Report   
        if (this.dataTableService.totalRecords != undefined) {
          let requestData2 =
          {
            "fromDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "toDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
            "filterBy": this.claimDashboardReport.value.dropDown != null ? this.claimDashboardReport.value.dropDown : '',
            'length': this.dataTableService.totalRecords
          }
          var doc = new jsPDF('p', 'pt', 'a3');
          this.showPageLoader = true;
          var apiUrl = ClaimApi.allGovernmentClaims;
          var columns = [
            { title: 'Operator ID', dataKey: 'operatorId' },
            { title: 'User Full Name', dataKey: 'userFullName' },
            { title: 'Discipline', dataKey: 'discipline' },
            { title: 'Phone In', dataKey: 'phoneIn' },
            { title: 'Paper', dataKey: 'paper' },
            { title: 'PreAuthPhoneIn', dataKey: 'preauthPhoneIn' },
            { title: 'PreAuthPaper', dataKey: 'preauthPaper' },
            { title: 'HBRCPreAuth', dataKey: 'hbrcPreauth' },
            { title: 'Eligibility', dataKey: 'eligibilityInquiry' },
            { title: 'Total Entered', dataKey: 'totalEntered' },
            { title: 'Total Released', dataKey: 'totalReleased' },
            { title: 'Day', dataKey: 'day' },
            { title: 'From Date', dataKey: 'fromDate' },
            { title: 'To Date', dataKey: 'toDate' }
          ];
          this.hmsDataServiceService.postApi(apiUrl, requestData2).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              this.showPageLoader = false;
              for (var i in data.result.data) {
                data.result.data[i].fromDate = data.result.data[i].fromDate != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].fromDate) : '';
                data.result.data[i].toDate = data.result.data[i].toDate != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].toDate) : ''
              }
              var rows = data.result.data;
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.reportPopUpTitle
              });
              this.pdfHeader(doc, headerobject);
              //End Header    
              doc.autoTable(columns, rows, {
                styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  lineColor: [215, 214, 213],
                  lineWidth: 1,
                },
                columnStyles: {
                  "operatorId": { halign: 'left' },
                  "userFullName": { halign: 'right' },
                  "discipline": { halign: 'right' },
                  "phoneIn": { halign: 'right' },
                  "paper": { halign: 'right' },
                  "preauthPhoneIn": { halign: 'right' },
                  "preauthPaper": { halign: 'right' },
                  "hbrcPreauth": { halign: 'right' },
                  "eligibilityInquiry": { halign: 'right' },
                  "totalEntered": { halign: 'right' },
                  "totalReleased": { halign: 'right' },
                  "day": { halign: 'right' },
                  "fromDate": { halign: 'right' },
                  "toDate": { halign: 'right' }
                },
                didParseCell: function (data) {
                  if (data.section == 'head' && data.column.index != 0) {
                    data.cell.styles.halign = 'right';
                  }
                },
                startY: 100,
                startX: 40,
                theme: 'grid',
              });
              this.pdfFooter(doc, this.reportID);
              doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
            } else if (data.code == 404 && data.status == 'NOT_FOUND') {
              this.showPageLoader = false;
              this.toastr.error(this.translate.instant('common.record-not-found'));
            }
          });

        } else {
          this.toastr.error(this.translate.instant('common.record-not-found'));
        }

        break;
      case 3: //Quikcard Claims Volume Report
        if (this.dataTableService.totalRecords != undefined) {
          let requestData3 =
          {
            "fromDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "toDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
            "length": this.dataTableService.totalRecords
          }
          var doc = new jsPDF('p', 'pt', 'a3');
          this.showPageLoader = true;
          var apiUrl = ClaimApi.allQuikardClaims;
          var columns = [
            { title: 'Operator ID', dataKey: 'operatorId' },
            { title: 'User Full Name', dataKey: 'userFullName' },
            { title: 'Discipline', dataKey: 'discipline' },
            { title: 'Phone In', dataKey: 'phoneIn' },
            { title: 'Paper', dataKey: 'paper' },
            { title: 'PreAuthPhoneIn', dataKey: 'preauthPhoneIn' },
            { title: 'PreAuthPaper', dataKey: 'preauthPaper' },
            { title: 'HBRCPreAuth', dataKey: 'hbrcPreauth' },
            { title: 'Eligibility', dataKey: 'eligibilityInquiry' },
            { title: 'Total Entered', dataKey: 'totalEntered' },
            { title: 'Total Released', dataKey: 'totalReleased' },
            { title: 'Day', dataKey: 'day' },
            { title: 'From Date', dataKey: 'fromDate' },
            { title: 'To Date', dataKey: 'toDate' }
          ];
          this.hmsDataServiceService.postApi(apiUrl, requestData3).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              this.showPageLoader = false;
              for (var i in data.result.data) {
                data.result.data[i].fromDate = data.result.data[i].fromDate != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].fromDate) : '';
                data.result.data[i].toDate = data.result.data[i].toDate != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].toDate) : ''
              }
              var rows = data.result.data;
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.reportPopUpTitle
              });
              this.pdfHeader(doc, headerobject);
              //End Header    
              doc.autoTable(columns, rows, {
                styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  lineColor: [215, 214, 213],
                  lineWidth: 1,
                },
                columnStyles: {
                  "operatorId": { halign: 'left' },
                  "userFullName": { halign: 'right' },
                  "discipline": { halign: 'right' },
                  "phoneIn": { halign: 'right' },
                  "paper": { halign: 'right' },
                  "preauthPhoneIn": { halign: 'right' },
                  "preauthPaper": { halign: 'right' },
                  "hbrcPreauth": { halign: 'right' },
                  "eligibilityInquiry": { halign: 'right' },
                  "totalEntered": { halign: 'right' },
                  "totalReleased": { halign: 'right' },
                  "day": { halign: 'right' },
                  "fromDate": { halign: 'right' },
                  "toDate": { halign: 'right' }
                },
                didParseCell: function (data) {
                  if (data.section == 'head' && data.column.index != 0) {
                    data.cell.styles.halign = 'right';
                  }
                },
                startY: 100,
                startX: 40,
                theme: 'grid',
              });
              this.pdfFooter(doc, this.reportID);
              doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
            } else if (data.code == 404 && data.status == 'NOT_FOUND') {
              this.showPageLoader = false;
              this.toastr.error(this.translate.instant('common.record-not-found'));
            }
          });
        } else {
          this.toastr.error(this.translate.instant('common.record-not-found'));
        }
        break;
      case 4: //DOB Mismatch Report
        if (this.dataTableService.totalRecords != undefined) {
          var apiUrl = ClaimApi.getDOBMismatchReport;
          let requestData4 = {
            "serviceDateFrom": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "serviceDateTo": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
            "length": this.dataTableService.totalRecords
          };
          var doc = new jsPDF('p', 'pt', 'a3');
          this.showPageLoader = true;
          var columns = [
            { title: 'Service Date', dataKey: 'serviceDate' },
            { title: 'Claim DOB', dataKey: 'claimDOB' },
            { title: 'Person DOB', dataKey: 'personDOB' },
            { title: 'Person Name', dataKey: 'personName' },
            { title: 'Cardholder Key', dataKey: 'cardholderKey' },
            { title: 'Card Number', dataKey: 'cardNumber' },
            { title: 'Company Id', dataKey: 'comapnyId' },
            { title: 'Company Name', dataKey: 'companyName' },
            { title: 'Claim Reference Number', dataKey: 'claimRefNumber' }
          ];
          this.hmsDataServiceService.postApi(apiUrl, requestData4).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              this.showPageLoader = false;
              for (var i in data.result.data) {
                data.result.data[i].serviceDate = data.result.data[i].serviceDate != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].serviceDate) : '';
                data.result.data[i].claimDOB = data.result.data[i].claimDOB != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].claimDOB) : '';
                data.result.data[i].personDOB = data.result.data[i].personDOB != null ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].personDOB) : '';
              }
              var rows = data.result.data;
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.reportPopUpTitle
              });
              this.pdfHeader(doc, headerobject);
              //End Header    
              doc.autoTable(columns, rows, {
                styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  lineColor: [215, 214, 213],
                  lineWidth: 1,
                },
                columnStyles: {
                  "serviceDate": { halign: 'left' },
                  "claimDOB": { halign: 'right' },
                  "personDOB": { halign: 'right' },
                  "personName": { halign: 'right' },
                  "cardholderKey": { halign: 'right' },
                  "cardNumber": { halign: 'right' },
                  "comapnyId": { halign: 'right' },
                  "companyName": { halign: 'right' },
                  "claimRefNumber": { halign: 'right' }
                },
                didParseCell: function (data) {
                  if (data.section == 'head' && data.column.index != 0) {
                    data.cell.styles.halign = 'right';
                  }
                },
                startY: 100,
                startX: 40,
                theme: 'grid',
              });
              this.pdfFooter(doc, this.reportID);
              doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
            } else if (data.code == 404 && data.status == 'NOT_FOUND') {
              this.showPageLoader = false;
              this.toastr.error(this.translate.instant('common.record-not-found'));
            }
          });
        } else {
          this.toastr.error(this.translate.instant('common.record-not-found'));
        }
        break;
        // Following case added to show Claim Payments by Cardholder in (ADSC) separately (diff ID) from Quikcard -> 
        // Need to make changes when API for ADSC(separate) will be available
        case 16:
          var chkey = [];
          if (this.selectedOverrideReason.length > 0) {
            for (var j = 0; j < this.selectedOverrideReason.length; j++) {
              chkey.push(this.selectedOverrideReason[j]['id'])
            }
          }
  
          this.filterColoumn = [
            { title: 'Card#', data: 'cardNumber' },
            { title: 'Conf-Number', data: 'confirmationNumber' },
            { title: 'Client Name', data: 'cardholderName' },
            { title: 'Service Date', data: 'serviceDate' },
            { title: 'Procedure Code', data: 'procCd' },
            { title: 'Procedure Description ', data: 'procDesc' },
            { title: 'Amount Submitted', data: 'amountSubmitted' },
            { title: 'Amount Paid', data: 'amountPaid' },
            { title: 'Amount Not Paid', data: 'amountNotPaid' }
          ];
  
          this.showPageLoader = true;
            requestParam = {
            "startDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "endDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
            "cardNumber": this.claimDashboardReport.value.cardNumber,
            "chkeys": chkey,
            "disciplineType": 'Dental',
            "disciplineOrder": '1'  
          }
          if (this.columnFilterSearch) {
            let cardNum = this.claimDashboardReport.value.cardNumber;
            if (this.GridFilter26_cardNumber && this.GridFilter26_cardNumber != '') {
              cardNum = this.GridFilter26_cardNumber;
            } else {
              this.GridFilter26_cardNumber = this.claimDashboardReport.value.cardNumber;
            }
            requestParam = this.pushToArray(requestParam, { 'cardNumber': cardNum });
            requestParam = this.pushToArray(requestParam, { 'confirmationNumber': this.GridFilter26_confirmationNumber });
            requestParam = this.pushToArray(requestParam, { 'cardholderName': this.GridFilter26_cardholderName });
            requestParam = this.pushToArray(requestParam, { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
            requestParam = this.pushToArray(requestParam, { 'procCd': this.GridFilter26_procCd });
            requestParam = this.pushToArray(requestParam, { 'procDesc': this.GridFilter26_procDesc });
            requestParam = this.pushToArray(requestParam, { 'amountSubmitted': this.GridFilter26_amountSubmitted });
            requestParam = this.pushToArray(requestParam, { 'amountPaid': this.GridFilter26_amountPaid });
            requestParam = this.pushToArray(requestParam, { 'amountNotPaid': this.GridFilter26_amountNotPaid });
          }

          var url = UftApi.claimPaymentsByCardholder; // Used API which is used for quikcard dashboard
          // Need to add the URL for claims by cardholder in ADSC reports.
          
          this.hmsDataServiceService.postApi(url, requestParam).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              var doc = new jsPDF('p', 'pt', 'a3');
              var columns = [
                { title: 'Card#', dataKey: 'cardNumber' },
                { title: 'Conf-Number', dataKey: 'confirmationNumber' },
                { title: 'Client Name', dataKey: 'cardholderName' },
                { title: 'Service Date', dataKey: 'serviceDate' },
                { title: 'Procedure Code', dataKey: 'procCd' },
                { title: 'Procedure Description ', dataKey: 'procDesc' },
                { title: 'Amount Submitted', dataKey: 'amountSubmitted' },
                { title: 'Amount Paid', dataKey: 'amountPaid' },
                { title: 'Amount Not Paid', dataKey: 'amountNotPaid' }
              ];
  
              this.showPageLoader = false;
              var rows = data.result.data;
              var head = [];
              var body = [];
              var total = 0;
              let claimPaymentsByCardholderArray = [];
  
  
              for (var i in rows) {
                let checkMainIndex = claimPaymentsByCardholderArray.findIndex(x => x.cardNum == rows[i].cardNum)
                if (checkMainIndex == -1) {
                  claimPaymentsByCardholderArray.push({
                    "cardNumber": rows[i].cardNumber,
                    "cardNumArray": [
                      {
                        "confirmationNumber": rows[i].confirmationNumber,
                        "confNumArray": [
                          {
                            "confirmationNumber": rows[i].confirmationNumber,
                            "cardholderName": rows[i].cardholderName,
                            "serviceDate": rows[i].serviceDate,
                            "procCd": rows[i].procCd,
                            "procDesc": rows[i].procDesc,
                            "amountSubmitted": rows[i].amountSubmitted,
                            "amountPaid": rows[i].amountPaid,
                            "amountNotPaid": rows[i].amountNotPaid,
                          }
                        ]
                      }
                    ]
                  })
                } else {
                  let checkChildIndex = claimPaymentsByCardholderArray[checkMainIndex].cardNumArray.findIndex(x => x.confirmationNumber == rows[i].confirmationNumber);
                  if (checkChildIndex == -1) {
                    claimPaymentsByCardholderArray[checkMainIndex].cardNumArray.push({
                      "confirmationNumber": rows[i].confirmationNumber,
                      "confNumArray": [
                        {
                          "confirmationNumber": rows[i].confirmationNumber,
                          "cardholderName": rows[i].cardholderName,
                          "serviceDate": rows[i].serviceDate,
                          "procCd": rows[i].procCd,
                          "procDesc": rows[i].procDesc,
                          "amountSubmitted": rows[i].amountSubmitted,
                          "amountPaid": rows[i].amountPaid,
                          "amountNotPaid": rows[i].amountNotPaid,
                        }
                      ]
                    });
                  } else {
                    claimPaymentsByCardholderArray[checkMainIndex].cardNumArray[checkChildIndex].confNumArray.push({
                      "confirmationNumber": rows[i].confirmationNumber,
                      "cardholderName": rows[i].cardholderName,
                      "serviceDate": rows[i].serviceDate,
                      "procCd": rows[i].procCd,
                      "procDesc": rows[i].procDesc,
                      "amountSubmitted": rows[i].amountSubmitted,
                      "amountPaid": rows[i].amountPaid,
                      "amountNotPaid": rows[i].amountNotPaid,
                    });
                  }
                }
              }
              var body = [];
              var head = [];
              var amount_submitted_total = 0;
              var amount_paid_total = 0;
              var amount_notPaid_total = 0;
  
              var grand_amount_submitted_total = 0;
              var grand_amount_paid_total = 0;
              var grand_amount_notPaid_total = 0;
  
              for (var i in claimPaymentsByCardholderArray) {
                body.push({
                  "cardNumber": { 'content': claimPaymentsByCardholderArray[i].cardNumber, 'colSpan': 9 },
                  "confirmationNumber": "",
                  "cardholderName": "",
                  "serviceDate": "",
                  "procCd": "",
                  "procDesc": "",
                  "amountSubmitted": "",
                  "amountPaid": "",
                  "amountNotPaid": "",
                });
                if (claimPaymentsByCardholderArray[i].cardNumArray.length > 0) {
                  for (var k in claimPaymentsByCardholderArray[i].cardNumArray) {
                    if (claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray.length > 0) {
                      for (var j in claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray) {
                        if (j == '0') {
                          body.push({
                            "coId": ' ',
                            "confirmationNumber": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].confirmationNumber,
                            "cardholderName": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].cardholderName,
                            "serviceDate": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].serviceDate,
                            "procCd": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procCd,
                            "procDesc": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procDesc,
                            "amountSubmitted": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted) : '$ 0.0',
                            "amountPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid) : '$ 0.0',
                            "amountNotPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid) : '$ 0.0',
                          });
                        } else {
                          body.push({
                            "coId": ' ',
                            "confirmationNumber": ' ',
                            "cardholderName": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].cardholderName,
                            "serviceDate": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].serviceDate,
                            "procCd": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procCd,
                            "procDesc": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procDesc,
                            "amountSubmitted": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted) : '$ 0.0',
                            "amountPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid) : '$ 0.0',
                            "amountNotPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid) : '$ 0.0'
                          });
                        }
  
                        amount_submitted_total = amount_submitted_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted);
  
                        amount_paid_total = amount_paid_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid);
  
                        amount_notPaid_total = amount_notPaid_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid);
                      }
                    }
                  }
                }
                body.push({
                  "coId": '',
                  "confirmationNumber": { 'content': 'Total For: ' + claimPaymentsByCardholderArray[i].cardNumber, halign: 'right', 'colSpan': 5 },
                  "cardholderName": '',
                  "serviceDate": '',
                  "procCd": ' ',
                  "procDesc": ' ',
                  "amountSubmitted": { 'content': amount_submitted_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_submitted_total) : '$ 0.00', 'colSpan': 1 },
                  "amountPaid": { 'content': amount_paid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_paid_total) : '$ 0.00', 'colSpan': 1 },
                  "amountNotPaid": { 'content': amount_notPaid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_notPaid_total) : '$ 0.00', 'colSpan': 1 },
                });
                grand_amount_submitted_total = amount_submitted_total;
                grand_amount_paid_total = amount_paid_total;
                grand_amount_notPaid_total = amount_notPaid_total;
              }
  
              body.push({
                "coId": '',
                "confirmationNumber": { 'content': 'GRAND TOTAL', 'colSpan': 5, halign: 'right', styles: { fontStyle: 'bold', fontSize: 9 } },
                "cardholderName": '',
                "serviceDate": '',
                "procCd": '',
                "procDesc": '',
                "amountSubmitted": { 'content': grand_amount_submitted_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_submitted_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } },
  
                "amountPaid": { 'content': grand_amount_paid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_paid_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } },
  
                "amountNotPaid": { 'content': grand_amount_notPaid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_notPaid_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } }
              });
  
              var FromDate = this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate)) : '';
              var endDate = this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate)) : '';
              
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.reportPopUpTitle,
                'text5Date': FromDate + ' - ' + endDate
              });
              this.pdfHeader(doc, headerobject);
              //End Header 
              doc.autoTable(columns, body, {
                styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
  
                columnStyles: {
                  "cardNumber": { halign: 'left' },
                  "confirmationNumber": { halign: 'right' },
                  "cardholderName": { halign: 'right' },
                  "serviceDate": { halign: 'right' },
                  "procCd": { halign: 'right' },
                  "procDesc": { halign: 'right' },
                  "amountSubmitted": { halign: 'right' },
                  "amountPaid": { halign: 'right' },
                  "amountNotPaid": { halign: 'right' },
  
                },
                headStyles: {
                  fillColor: [255, 255, 255],
                  textColor: [0, 0, 0],
                  lineColor: [215, 214, 213],
                  lineWidth: 1,
                },
                didParseCell: function (data) {
                  if (data.section == 'head' && data.column.index != 0) {
                    data.cell.styles.halign = 'right';
                  }
                },
                startY: 100,
                startX: 40,
                theme: 'grid',
              });
  
              this.pdfFooter(doc, this.reportID);
              doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
  
            } else if (data.code == 404 && data.status == 'NOT_FOUND') {
              this.showPageLoader = false;
              this.toastr.error(this.translate.instant('uft.toaster.recordNotFound'));
            }
          });
  
        break;
      case 26:

        var chkey = [];
        if (this.selectedOverrideReason.length > 0) {
          for (var j = 0; j < this.selectedOverrideReason.length; j++) {
            chkey.push(this.selectedOverrideReason[j]['id'])
          }
        }

        this.filterColoumn = [
          { title: 'Card#', data: 'cardNumber' },
          { title: 'Conf-Number', data: 'confirmationNumber' },
          { title: 'Client Name', data: 'cardholderName' },
          { title: 'Service Date', data: 'serviceDate' },
          { title: 'Procedure Code', data: 'procCd' },
          { title: 'Procedure Description ', data: 'procDesc' },
          { title: 'Amount Submitted', data: 'amountSubmitted' },
          { title: 'Amount Paid', data: 'amountPaid' },
          { title: 'Amount Not Paid', data: 'amountNotPaid' }
        ];

        this.showPageLoader = true;
        requestParam = {
          "startDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
          "endDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
          "cardNumber": this.claimDashboardReport.value.cardNumber,
          "chkeys": chkey

        }
        if (this.columnFilterSearch) {
          let cardNum = this.claimDashboardReport.value.cardNumber;
          if (this.GridFilter26_cardNumber && this.GridFilter26_cardNumber != '') {
            cardNum = this.GridFilter26_cardNumber;
          } else {
            this.GridFilter26_cardNumber = this.claimDashboardReport.value.cardNumber;
          }
          requestParam = this.pushToArray(requestParam, { 'cardNumber': cardNum });
          requestParam = this.pushToArray(requestParam, { 'confirmationNumber': this.GridFilter26_confirmationNumber });
          requestParam = this.pushToArray(requestParam, { 'cardholderName': this.GridFilter26_cardholderName });
          requestParam = this.pushToArray(requestParam, { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
          requestParam = this.pushToArray(requestParam, { 'procCd': this.GridFilter26_procCd });
          requestParam = this.pushToArray(requestParam, { 'procDesc': this.GridFilter26_procDesc });
          requestParam = this.pushToArray(requestParam, { 'amountSubmitted': this.GridFilter26_amountSubmitted });
          requestParam = this.pushToArray(requestParam, { 'amountPaid': this.GridFilter26_amountPaid });
          requestParam = this.pushToArray(requestParam, { 'amountNotPaid': this.GridFilter26_amountNotPaid });
        }
        /** End Narrow Search */
        var url = UftApi.claimPaymentsByCardholder;
        /** End Narrow Search */
        this.hmsDataServiceService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: 'Card#', dataKey: 'cardNumber' },
              { title: 'Conf-Number', dataKey: 'confirmationNumber' },
              { title: 'Client Name', dataKey: 'cardholderName' },
              { title: 'Service Date', dataKey: 'serviceDate' },
              { title: 'Procedure Code', dataKey: 'procCd' },
              { title: 'Procedure Description ', dataKey: 'procDesc' },
              { title: 'Amount Submitted', dataKey: 'amountSubmitted' },
              { title: 'Amount Paid', dataKey: 'amountPaid' },
              { title: 'Amount Not Paid', dataKey: 'amountNotPaid' }
            ];

            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            let claimPaymentsByCardholderArray = [];


            for (var i in rows) {
              let checkMainIndex = claimPaymentsByCardholderArray.findIndex(x => x.cardNum == rows[i].cardNum)
              if (checkMainIndex == -1) {
                claimPaymentsByCardholderArray.push({
                  "cardNumber": rows[i].cardNumber,
                  "cardNumArray": [
                    {
                      "confirmationNumber": rows[i].confirmationNumber,
                      "confNumArray": [
                        {
                          "confirmationNumber": rows[i].confirmationNumber,
                          "cardholderName": rows[i].cardholderName,
                          "serviceDate": rows[i].serviceDate,
                          "procCd": rows[i].procCd,
                          "procDesc": rows[i].procDesc,
                          "amountSubmitted": rows[i].amountSubmitted,
                          "amountPaid": rows[i].amountPaid,
                          "amountNotPaid": rows[i].amountNotPaid,
                        }
                      ]
                    }
                  ]
                })
              } else {
                let checkChildIndex = claimPaymentsByCardholderArray[checkMainIndex].cardNumArray.findIndex(x => x.confirmationNumber == rows[i].confirmationNumber);
                if (checkChildIndex == -1) {
                  claimPaymentsByCardholderArray[checkMainIndex].cardNumArray.push({
                    "confirmationNumber": rows[i].confirmationNumber,
                    "confNumArray": [
                      {
                        "confirmationNumber": rows[i].confirmationNumber,
                        "cardholderName": rows[i].cardholderName,
                        "serviceDate": rows[i].serviceDate,
                        "procCd": rows[i].procCd,
                        "procDesc": rows[i].procDesc,
                        "amountSubmitted": rows[i].amountSubmitted,
                        "amountPaid": rows[i].amountPaid,
                        "amountNotPaid": rows[i].amountNotPaid,
                      }
                    ]
                  });
                } else {
                  claimPaymentsByCardholderArray[checkMainIndex].cardNumArray[checkChildIndex].confNumArray.push({
                    "confirmationNumber": rows[i].confirmationNumber,
                    "cardholderName": rows[i].cardholderName,
                    "serviceDate": rows[i].serviceDate,
                    "procCd": rows[i].procCd,
                    "procDesc": rows[i].procDesc,
                    "amountSubmitted": rows[i].amountSubmitted,
                    "amountPaid": rows[i].amountPaid,
                    "amountNotPaid": rows[i].amountNotPaid,
                  });
                }
              }
            }
            var body = [];
            var head = [];
            //Row For Total Amount Show
            var amount_submitted_total = 0;
            var amount_paid_total = 0;
            var amount_notPaid_total = 0;

            var grand_amount_submitted_total = 0;
            var grand_amount_paid_total = 0;
            var grand_amount_notPaid_total = 0;

            for (var i in claimPaymentsByCardholderArray) {
              body.push({
                "cardNumber": { 'content': claimPaymentsByCardholderArray[i].cardNumber, 'colSpan': 9 },
                "confirmationNumber": "",
                "cardholderName": "",
                "serviceDate": "",
                "procCd": "",
                "procDesc": "",
                "amountSubmitted": "",
                "amountPaid": "",
                "amountNotPaid": "",
              });
              if (claimPaymentsByCardholderArray[i].cardNumArray.length > 0) {
                for (var k in claimPaymentsByCardholderArray[i].cardNumArray) {
                  if (claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray.length > 0) {
                    for (var j in claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray) {
                      if (j == '0') {
                        body.push({
                          "coId": ' ',
                          "confirmationNumber": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].confirmationNumber,
                          "cardholderName": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].cardholderName,
                          "serviceDate": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].serviceDate,
                          "procCd": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procCd,
                          "procDesc": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procDesc,
                          "amountSubmitted": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted) : '$ 0.0',
                          "amountPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid) : '$ 0.0',
                          "amountNotPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid) : '$ 0.0',
                        });
                      } else {
                        body.push({
                          "coId": ' ',
                          "confirmationNumber": ' ',
                          "cardholderName": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].cardholderName,
                          "serviceDate": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].serviceDate,
                          "procCd": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procCd,
                          "procDesc": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procDesc,
                          "amountSubmitted": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted) : '$ 0.0',
                          "amountPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid) : '$ 0.0',
                          "amountNotPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid) : '$ 0.0'
                        });
                      }

                      amount_submitted_total = amount_submitted_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted);

                      amount_paid_total = amount_paid_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid);

                      amount_notPaid_total = amount_notPaid_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid);
                     
                    }
                  }
                }
              }
              body.push({
                "coId": '',
                "confirmationNumber": { 'content': 'Total For: ' + claimPaymentsByCardholderArray[i].cardNumber, halign: 'right', 'colSpan': 5 },
                "cardholderName": '',
                "serviceDate": '',
                "procCd": ' ',
                "procDesc": ' ',
                "amountSubmitted": { 'content': amount_submitted_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_submitted_total) : '$ 0.00', 'colSpan': 1 },
                "amountPaid": { 'content': amount_paid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_paid_total) : '$ 0.00', 'colSpan': 1 },
                "amountNotPaid": { 'content': amount_notPaid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_notPaid_total) : '$ 0.00', 'colSpan': 1 },
              });
              grand_amount_submitted_total = amount_submitted_total;
              grand_amount_paid_total = amount_paid_total;
              grand_amount_notPaid_total = amount_notPaid_total;
            }

            body.push({
              "coId": '',
              "confirmationNumber": { 'content': 'GRAND TOTAL', 'colSpan': 5, halign: 'right', styles: { fontStyle: 'bold', fontSize: 9 } },
              "cardholderName": '',
              "serviceDate": '',
              "procCd": '',
              "procDesc": '',
              "amountSubmitted": { 'content': grand_amount_submitted_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_submitted_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } },

              "amountPaid": { 'content': grand_amount_paid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_paid_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } },

              "amountNotPaid": { 'content': grand_amount_notPaid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_notPaid_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } }
            });

            /** Start Header Content */
            var FromDate = this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate)) : '';
            var endDate = this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate)) : '';
            /** End Header Content */

            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
           
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },

              columnStyles: {
                "cardNumber": { halign: 'left' },
                "confirmationNumber": { halign: 'right' },
                "cardholderName": { halign: 'right' },
                "serviceDate": { halign: 'right' },
                "procCd": { halign: 'right' },
                "procDesc": { halign: 'right' },
                "amountSubmitted": { halign: 'right' },
                "amountPaid": { halign: 'right' },
                "amountNotPaid": { halign: 'right' },
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });

            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');

          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastr.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
    }
  }

  pushToArray(arr, obj) {
    let checkArray = Array.isArray(arr);
    if (checkArray) {
      const index = arr.findIndex((e) => e.key === obj.key);
      if (index === -1) {
        arr.push(obj);
      } else {
        arr[index] = obj;
      }
    } else {
      arr = Object.assign(arr, obj)
    }
    return arr;
  }

  downloadEXCELReport() {

    switch (this.reportID) {
      case 1: //Daily Claim Processing    
        if (this.dataTableService.totalRecords != undefined) {
          var reqParamPlan = {
            "discipline": this.albertaTab ? 'Dental' : "",
            "confirmId": this.claimDashboardReport.value.reference != null ? this.claimDashboardReport.value.reference : "",
            "entryDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "entryBy": this.claimDashboardReport.value.processor != null ? this.claimDashboardReport.value.processor : "",
            "adjudicateDate": "",
            "adjudicateBy": "",
            "updatedOn": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "updatedBy": "",
            "start": 0,
            "length": this.dataTableService.totalRecords,
            "excel": "T",  // “ T if Excel needed to be generated”
          }
          var URL = ClaimApi.dailyClaimProcessingReport;
          if (this.dataTableService.totalRecords > 500) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan)
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan)
          }
        } else {
          this.toastr.error(this.translate.instant('common.record-not-found'));
        }
        break;
      case 2: //Govt Claims Volume Report  
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ClaimApi.allGovernmentClaimsExcel;
          var reqParamPlan2 = {
            "fromDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "toDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
            "filterBy": this.claimDashboardReport.value.dropDown != null ? this.claimDashboardReport.value.dropDown : '',
            "start": "0",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan2);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan2);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan2);
          }
        } else {
          this.toastr.error(this.translate.instant('common.record-not-found'));
        }
        break;
      case 3: //Quikcard Claims Volume Report 
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ClaimApi.allQuikardClaimsExcel;
          var reqParamPlan3 = {
            "fromDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "toDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
            "filterBy": this.claimDashboardReport.value.dropDown != null ? this.claimDashboardReport.value.dropDown : '',
            "start": "0",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan3);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan3);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan3);
          }
        } else {
          this.toastr.error(this.translate.instant('common.record-not-found'));
        }
        break;
      case 4: //DOB Mismatch Report
        if (this.dataTableService.totalRecords != undefined) {
          var URL = ClaimApi.getDOBMismatchReportExcel;
          var reqParamPlan4 = {
            "fromDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
            "toDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
            "start": "0",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan4);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan4);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan4);
          }
        } else {
          this.toastr.error(this.translate.instant('common.record-not-found'));
        }
        break;
        // Following case added to show Claim Payments by Cardholder in (ADSC) separately (diff ID) from Quikcard-> 
        // Need to make changes when API for ADSC(separate) will be available
      case 16:
        // Need to add the URL for claims by cardholder in ADSC reports.
        var URL = UftApi.claimPaymentsByCardholderReport; // Used same API which used for quikcard
        
        var chkey = [];
        if (this.selectedOverrideReason.length > 0) {
          for (var j = 0; j < this.selectedOverrideReason.length; j++) {
            chkey.push(this.selectedOverrideReason[j]['id'])
          }
        }

        var reqParam16 = {
          "start": 0,
          "length": this.dataTableService.totalRecords,
          "startDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
          "endDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
          "cardNumber": this.claimDashboardReport.value.cardNumber,
          "chkeys": chkey,
          "disciplineType": 'Dental',
          "disciplineOrder": '1'
        }

        if (this.columnFilterSearch) {
          reqParam16 = this.pushToArray(reqParam16, { 'cardNumber': this.GridFilter26_cardNumber });
          reqParam16 = this.pushToArray(reqParam16, { 'confirmationNumber': this.GridFilter26_confirmationNumber });
          reqParam16 = this.pushToArray(reqParam16, { 'cardholderName': this.GridFilter26_cardholderName });
          reqParam16 = this.pushToArray(reqParam16, { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
          reqParam16 = this.pushToArray(reqParam16, { 'procCd': this.GridFilter26_procCd });
          reqParam16 = this.pushToArray(reqParam16, { 'procDesc': this.GridFilter26_procDesc });
          reqParam16 = this.pushToArray(reqParam16, { 'amountSubmitted': this.GridFilter26_amountSubmitted });
          reqParam16 = this.pushToArray(reqParam16, { 'amountPaid': this.GridFilter26_amountPaid });
          reqParam16 = this.pushToArray(reqParam16, { 'amountNotPaid': this.GridFilter26_amountNotPaid });
        }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam16);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam16);
            }
          });
        } else {
          this.exportFile(URL, reqParam16);
        }
        break;
      case 26: // issue number 487 - Report(Cards by Company QSI.020) 
        var URL = UftApi.claimPaymentsByCardholderReport;


        var chkey = [];
        if (this.selectedOverrideReason.length > 0) {
          for (var j = 0; j < this.selectedOverrideReason.length; j++) {
            chkey.push(this.selectedOverrideReason[j]['id'])
          }
        }

        var reqParam26 = {
          "start": 0,
          "length": this.dataTableService.totalRecords,
          "startDate": this.claimDashboardReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.startDate) : '',
          "endDate": this.claimDashboardReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.claimDashboardReport.value.endDate) : '',
          "cardNumber": this.claimDashboardReport.value.cardNumber,
          "chkeys": chkey,
        }

        if (this.columnFilterSearch) {
          reqParam26 = this.pushToArray(reqParam26, { 'cardNumber': this.GridFilter26_cardNumber });
          reqParam26 = this.pushToArray(reqParam26, { 'confirmationNumber': this.GridFilter26_confirmationNumber });
          reqParam26 = this.pushToArray(reqParam26, { 'cardholderName': this.GridFilter26_cardholderName });
          reqParam26 = this.pushToArray(reqParam26, { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
          reqParam26 = this.pushToArray(reqParam26, { 'procCd': this.GridFilter26_procCd });
          reqParam26 = this.pushToArray(reqParam26, { 'procDesc': this.GridFilter26_procDesc });
          reqParam26 = this.pushToArray(reqParam26, { 'amountSubmitted': this.GridFilter26_amountSubmitted });
          reqParam26 = this.pushToArray(reqParam26, { 'amountPaid': this.GridFilter26_amountPaid });
          reqParam26 = this.pushToArray(reqParam26, { 'amountNotPaid': this.GridFilter26_amountNotPaid });
        }

        /** End Narrow Search */
        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam26);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam26);
            }
          });
        } else {
          this.exportFile(URL, reqParam26);
        }
        break;
    }
  }

  /**
   * Export excel for reports
   * @param URL 
   * @param reqParamPlan 
   */
  exportFile(URL, reqParamPlan) {
    this.showPageLoader = false
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
          a.download = this.reportPopUpTitle.replace(/\s+/g, '_');
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
        this.toastr.error(this.translate.instant('common.record-not-found'));
      }
    })
  }

  pdfHeader(doc, headerobject) {
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "alberta") {
        var imageData = 'data:image/png;base64,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';
      } else {
        var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEQ4M0Q4NjE1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEQ4M0Q4NjA1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTU1MzkwMUYzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTU1MzkwMjAzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4x0Cf0AAAW60lEQVR42uxd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';
      }
    } else {
      var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEQ4M0Q4NjE1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEQ4M0Q4NjA1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTU1MzkwMUYzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTU1MzkwMjAzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4x0Cf0AAAW60lEQVR42uxd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';
    }
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report') {
        doc.text(headerobject[0].text5Date, 1100, 90, null, null, 'right');
      } else {
        doc.text(headerobject[0].text5Date, 800, 90, null, null, 'right');
      }
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.setTextColor('#009BDB');
    doc.text(headerobject[0].gridHeader1, 40, 90);
    return true;
  }

  pdfFooter(doc, reportId) {
    if (reportId == 73) {
      doc.autoTable.previous.finalY = 290;
      doc.autoTable.previous.cursor.x = 800;
    }
    //Start Footer      
    doc.setFontSize(8);
    //Left Line1
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('T', 40, doc.autoTable.previous.finalY + 40);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('1-800-232-1997 | 780-426-7526', 50, doc.autoTable.previous.finalY + 40);

    //Left Line2
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('F', 40, doc.autoTable.previous.finalY + 50);

    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('780-426-7581', 50, doc.autoTable.previous.finalY + 50);

    //Left Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('E', 40, doc.autoTable.previous.finalY + 60);

    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('claims@quikcard.com', 50, doc.autoTable.previous.finalY + 60);

    //Right Line1
    doc.text('#200, 17010 - 103 Avenue', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 40, null, null, 'right');
    //Right Line2
    doc.text('Edmonton, AB T5S 1K7', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 50, null, null, 'right');
    //Right Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('quikcard.com', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 60, null, null, 'right');
  }

  /* Get Predictive Operator Type */
  getPredictiveOperatorData(completerService) {
    this.operatorData = completerService.remote(
      null,
    );
    this.operatorData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.operatorData.urlFormater((term: any) => {
      return ClaimApi.predictiveSearchForOperatorIdUrl + `/${this.disciplineType}` + `/${term}`;
    });
    this.operatorData.dataField('result');
  }

  onOperatorSelected(selected: CompleterItem) {
    if (selected) {
    }
  }

  // Get pagination of generic table to get back to Dashboard
  public getCurrentPagination = function($event) {
    switch($event.name) {
      case 'gt-info':
      if ($event.value.pageCurrent) {
        this.currentPage = $event.value.pageCurrent
        this.recordLength = $event.value.recordLength
      }
      break;
      case 'gt-row-clicked':
      localStorage.setItem('currentPageDash', JSON.stringify(this.currentPage))
      localStorage.setItem('recordLengthDash', JSON.stringify(this.recordLength))
      break;
      case 'gt-page-changed':
      localStorage.setItem('currentPageDash', JSON.stringify($event.value.pageCurrent))
      break;
    }
  };

  getDashboardClaimData(type) {
    if (type == 'Quik') {
      this.currentUserService.dashboardTypeQuikcard = true
    } else if (type == 'Adsc') {
      this.currentUserService.dashboardTypeAdsc = true
    }
  }

  getPayeeList() {
    this.hmsDataServiceService.getApi(ClaimApi.getPayeeTypesUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payeeData = data.result;
      } else {
        this.payeeData = []
      }
    });
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.getAdjRequestByGridFilteration(tableId);
    }
  }

  /**
   * Get AdjRequest list after Grid Filteration
   * @param tableId //id of table in html
   */
   getAdjRequestByGridFilteration(tableId: string) {
     this.isSearch = true
    var params = this.dataTableService.getFooterParams(tableId)
    var dateParams = []
    params.push({ 'key': 'businessType', 'value': this.albertaTab ? "S" : "Q" })
    this.dataTableService.jqueryDataTableReload(tableId, UftApi.getAdjustmentRequestUrl, params, dateParams)
  }

  /**
   * Reset Grid Filteration
   */
   resetAdjReqTableSearch() {
    this.dataTableService.resetTableSearch()
    this.getAdjRequestByGridFilteration("adjustmentReqTable")
    this.isSearch = false
  }

  downloadAdjustmentRequestPDFReport() {
    this.showPageLoader = true;
    var reportTitle = 'Adjustment Request'
    var requestParam = {};
    if (this.isSearch) {
      var params = this.dataTableService.getFooterParams("adjustmentReqTable")
      requestParam = {"start": 0, "length": this.dataTableService.totalRecords, "claimNumber": params[0].value, "payeeName": params[1].value, "payeeType": params[2].value, "totalPaid": params[3].value }
    } else {
      requestParam = {
        'start': 0,
        'length': this.dataTableService.totalRecords
      }
    }
    var url = UftApi.getAdjustmentRequestUrl;
    this.hmsDataServiceService.postApi(url, requestParam).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        var doc = new jsPDF('p', 'pt', 'a3');
        var columns = [
          { title: 'Claim Number', dataKey: 'claimNumber' },
          { title: 'Payee Name', dataKey: 'payeeName' },
          { title: 'Payee Type', dataKey: 'payeeType' },
          { title: 'Amount', dataKey: 'totalPaid' }
        ];
        this.showPageLoader = false;
        var rows = data.result.data;
        var head = [];
        var body = [];
        var total = 0;
        for (var i in rows) {
          body.push({
            "claimNumber": rows[i].claimNumber,
            "payeeName": rows[i].payeeName, 
            "payeeType": rows[i].payeeType,
            "totalPaid": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].totalPaid),
          });
        }

        let date = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '');
        //Start Header
        var headerobject = [];
        headerobject.push({
          'gridHeader1': reportTitle,
          'text5Date': date
        });
        this.pdfHeader(doc, headerobject);
        //End Header 
        doc.autoTable(columns, body, {
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          columnStyles: {
            "claimNumber": { halign: 'left' },
            "payeeName": { halign: 'right' },
            "payeeType": { halign: 'right' },
            "totalPaid": { halign: 'right' }
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [215, 214, 213],
            lineWidth: 1,
          },
          didParseCell: function (data) {
            if (data.section == 'head' && data.column.index != 0) {
              data.cell.styles.halign = 'right';
            }
          },
          startY: 100,
          startX: 40,
          theme: 'grid',
        });

        this.pdfFooter(doc,'');
        doc.save(reportTitle.replace(/\s+/g, '_') + '.pdf');

      } else if (data.code == 404 && data.status == 'NOT_FOUND') {
        this.showPageLoader = false;
        this.toastr.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    });
  }

  // Excel button functionality
  exportAdjustmentRequestList() {
    this.reportPopUpTitle = 'Adjustment Request'
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    if (this.dataTableService.totalRecords != undefined) {
      var URL = UftApi.generateAdjReqReportUrl;
      var reqParam
      if (this.isSearch) {
        var params = this.dataTableService.getFooterParams("adjustmentReqTable")
        reqParam = {"start": 0, "length": this.dataTableService.totalRecords, "claimNumber": params[0].value, "payeeName": params[1].value, "payeeType": params[2].value, "totalPaid": params[3].value, 'paramApplication': paramApp }
      } else {
        reqParam = {
          'paramApplication': paramApp,
          'start': 0,
          'length': this.dataTableService.totalRecords
        }
      }
      if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
        this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
          if (value) {
            this.exportFile(URL, reqParam);
          }
        });
      } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
        this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
          if (value) {
            this.exportFile(URL, reqParam);
          }
        });
      } else {
        this.exportFile(URL, reqParam);
      }
    } else {
      this.toastr.error(this.translate.instant('uft.toaster.recordNotFound'));
    }
  }

  autoRefreshClaimsToBeEnteredTab(){
    this.onDashboardClick = true     // Quickard/ Adsc dashboard unnecessary api stop functionality
    if(this.dashboardHeading == 'ADSC'){
      this.getGovClaim()
    }
    else if(this.dashboardHeading = "QUIKCARD"){
      this.getQuikCardClaim()
    }
  }

  quikcardEnteredClaim(){
  }

  reportsData(){
  }

  addDashboardCommment(commentForm, type) {
    if (this.claimRowData.claimScannedFileKey) {
      if (this.commentForm.valid) {
        let reqParam = {
          'commentTxt': this.commentForm.value.commentTxt,
          'claimScannedFileKey': this.claimRowData.claimScannedFileKey
        }
        this.hmsDataServiceService.postApi(ClaimApi.addDbCommentUrl, reqParam).subscribe(data=> {
          if (data.code == 200 && data.hmsMessage.messageShort == 'SAVE_COMMENTS_SUCCESSFULLY') {
            this.getDbFileComment()
            this.toastr.success(this.translate.instant('dashboard.commentSavedSuccess'))
            if (this.businessTypeCd == 'Q') {
              this.getQuikCardClaim()
            } else {
              this.getGovClaim()
            }
            // $("#closeCommentPopup").trigger('click')
          } else if (data.code == 400 && data.hmsMessage.messageShort == 'SAVE_COMMENTS_FAILED') {
            this.toastr.error(this.translate.instant('dashboard.commentNotSaved'))
          } else {
            this.toastr.error(this.translate.instant('dashboard.commentNotSaved'))
          }
        })
      } else {
        this.validateAllFormFields(this.commentForm)
      }
    }
  }

  resetCommentForm() {
    this.commentForm.reset()
  }

  viewDbFileComment() {
    if (this.dashboardCommentText != undefined && this.dashboardCommentText != "" && this.dashboardCommentText != "null") {
      setTimeout(() => {
        this.hmsDataServiceService.OpenCloseModal('viewDbCommentsPopup')
        this.getDbFileComment()
      }, 100);
    }
  }

  getDbFileComment() {
    let reqParam = {
      'claimScannedFileKey': this.claimRowData.claimScannedFileKey
    }
    this.hmsDataServiceService.postApi(ClaimApi.getDbFileCommentUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.dashboardCommentText = data.result.commentTxt
      } else if (data.code == 404 && data.hmsMessage.messageShort == 'RECORD_NOT_FOUND') {
        this.dashboardCommentText = ''
      } else {
        this.dashboardCommentText = ''
      }
    })
  }

}
