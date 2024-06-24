import { Component, OnInit, ViewChild, NgModule } from '@angular/core';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service'
import { DataManagementDashboardApi } from '../data-management-dashboard-module/data-management-dashboard-api'
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service'
import { DatatableService } from '../common-module/shared-services/datatable.service'
import { DatePipe } from '@angular/common';
import { AppDataManagementReportListComponent } from './app-data-management-report-list/app-data-management-report-list.component';
import { QsiLoaderReportApi } from '../qsi-loader-report-module/qsi-loader-report-api';
import { Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { DataQsiLoaderComponent } from './data-qsi-loader/data-qsi-loader.component';
import { PendingElectronicAdjustmentComponent } from '../unit-financial-transaction-module/dashboard/pending-electronic-adjustment/pending-electronic-adjustment.component';
import { ClaimService } from '../claim-module/claim.service';
import { GroupsMissingInformationComponent } from './groups-missing-information/groups-missing-information.component';
import { DataManagementService } from './data-management.service';

@Component({
  selector: 'app-data-management-dashboard-module',
  templateUrl: './data-management-dashboard-module.component.html',
  styleUrls: ['./data-management-dashboard-module.component.css'],
  providers: [ChangeDateFormatService, DatatableService, DatePipe, PendingElectronicAdjustmentComponent, ClaimService, DataManagementService]
})

export class DataManagementDashboardModuleComponent implements OnInit {
  @ViewChild(AppDataManagementReportListComponent) financeReportObject;
  @ViewChild(DataQsiLoaderComponent) dataQsiLoaderObject;
  showServiceProviderComp: boolean = true
  showCardPrintRequestComp: boolean = false
  showEligibilityFileComp: boolean = false
  showCdaNetComp: boolean = false;
  showClaimSecureComp: boolean = false
  reportListShowHide: boolean = false;
  showElectronicPending: boolean = false;
  showSpcLoader: boolean = false
  showCprLoader: boolean = false
  showEfLoader: boolean = false
  showCNLoader: boolean = false
  showCSLoader: boolean = false
  showPEALoader: boolean = false
  providerTotalCount: Number
  cardPrintReqTotalCount;
  downloadFileCount;
  uplaodFileCount;
  errorADSC;
  errorQuikcard;
  currentMonth: string
  startDate: string;
  endDate: string;
  firstDay: Date
  acdq = "Not Loaded";
  cda = "Not Loaded";
  dac = "Not Loaded";
  reportsActiveClass: boolean = false
  LOAD_DAILY_FILE = "Not Loaded";
  qsi_drug = "Not Loaded";
  qsi_elig = "Not Generated";
  qsi_ex_ex = "Not Generated";
  incomeSupport;
  aahb
  learner
  achb
  senior
  phyPrintReqTotalCount: any = 0;
  showDataLoader: boolean = false
  observableObjForEnteredClaim;  // Log ticket #1222 
  observableObjCardPrintCounts;
  observableObjForEligibleFiles;
  observableObjForCdaNet;
  observableObjForSecureCount;
  observableObjForData;
  observableObjForElectronicAndMissingComp;
  getForApi: boolean = true 
  isSPResponse: boolean = true
  isCPResponse: boolean = true
  isEFResponse: boolean = true
  isCNResponse: boolean = true
  isCSResponse: boolean = true
  isDResponse: boolean = true
  @ViewChild(GroupsMissingInformationComponent) groupsMissingInformationComponent
  constructor(private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private datePipe: DatePipe,
    private translate: TranslateService,
    private pendingElectronicAdjustmentComponent: PendingElectronicAdjustmentComponent,
    public dataTableService: DatatableService,
    private claimService: ClaimService,
    private dataManageService: DataManagementService
  ) {
    this.dataTableService.getFilesStatusCdaNet.subscribe(data => {
      this.getCdaCounts();
    })
  }

  ngOnInit() {
    var date = new Date();
    var monthLabels = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    var monthIndex = date.getMonth()
    this.currentMonth = monthLabels[monthIndex];
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
    this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
    this.getServiceProvidersCount()
    // this.getCardPrintRequestCount()  // commented code should not be removed without any permission. discussed by arun sir. 
    // this.getEligibilityFileCount()
    this.getCdaCounts()
    this.getDataResult();
    this.getClaimSecureCount()
    this.pendingElectronicAdjustmentComponent.dataTableInitializePendingElectronicAdjustment()   // pending electronic adjustment tile header issues  are resolved.
    /**
    * Auto refresh the grids after 1 mins
    */

    if (this.isSPResponse) {
      this.observableObjForEnteredClaim = Observable.interval(1000 * 60).subscribe(x => {  // Log ticket #1222 
        this.getServiceProvidersCount();
        this.showSpcLoader = false
      });
    }
     // commented code should not be removed without any permission. discussed by arun sir.
    // if (this.isCPResponse) {
    //   this.observableObjCardPrintCounts = Observable.interval(1000 * 60).subscribe(x => {  // Log ticket #1222 
    //     this.getCardPrintRequestCount();
    //     this.showCprLoader = false
    //   });
    // }

    // if (this.isEFResponse) {
    //   this.observableObjForEligibleFiles = Observable.interval(1000 * 60).subscribe(x => {  // Log ticket #1222 
    //     this.getEligibilityFileCount();
    //     this.showEfLoader = false
    //   });
    // }

    if (this.isCNResponse) {
      this.observableObjForCdaNet = Observable.interval(1000 * 60).subscribe(x => {  // Log ticket #1222 
        this.getCdaCounts();
        this.showCNLoader = false
      });
    }

    if (this.isCSResponse) {
      this.observableObjForSecureCount = Observable.interval(1000 * 60).subscribe(x => {  // Log ticket #1222 
        this.getClaimSecureCount();
        this.showCSLoader = false
      });
    }

    if (this.isDResponse) {
      this.observableObjForData = Observable.interval(1000 * 60).subscribe(x => {  // Log ticket #1222 
        this.getDataResult();
        this.showDataLoader = false
      });
    }

    this.observableObjForElectronicAndMissingComp = Observable.interval(1000 * 60).subscribe(x => {  // Log ticket #1222 
      this.getPendingElectronicAdjustmentListData();
      this.getMissingCompanyListData();
    });

    // emit value for stop getCdaDataCount api in finance dashboard 
    this.claimService.getApiEmitter.subscribe(value => {
      this.getForApi = value;
    })
  }

  // Log #ticket 1222  APi calling stop any server issue and dashboard autorefresh api stop fuctionality to another dashboard
  ngOnDestroy() {
    this.observableObjForEnteredClaim.unsubscribe();
    // this.observableObjCardPrintCounts.unsubscribe();   // commented code should not be removed without any permission. discussed by arun sir.
    // this.observableObjForEligibleFiles.unsubscribe();
    this.observableObjForCdaNet.unsubscribe();
    this.observableObjForSecureCount.unsubscribe();
    this.observableObjForData.unsubscribe();
    this.observableObjForElectronicAndMissingComp.unsubscribe();
  }

  getServiceProvidersCount() {
    let promise = new Promise((resolve, reject) => {
      this.showSpcLoader = true
      var url = DataManagementDashboardApi.getServiceProviderWithoutBanTotalCountUrl
      if (this.getForApi) {
        this.hmsDataService.getApi(url).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.isSPResponse = true
            this.showSpcLoader = false
            this.providerTotalCount = data.result

            resolve();
          } else {
            this.isSPResponse = true
            this.showSpcLoader = false
            this.providerTotalCount = 0.00
            resolve();
          }
        }, (error) => {
          this.isSPResponse = false
          this.observableObjForEnteredClaim.unsubscribe()
          resolve();
        })

      }
    });
    return promise
  }

  getCardPrintRequestCount() {
    let promise = new Promise((resolve, reject) => {
      this.showCprLoader = true
      var url = DataManagementDashboardApi.getCardNotPrintedListTotalCountUrl
      let requestData = {
        'cardNum': '',
        'cdCreatedOn': '',
        'createdBy': '',
        'printCardTab': 'T' 
      }
      if (this.getForApi) {
        this.hmsDataService.postApi(url, requestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.isCPResponse = true
            this.showCprLoader = false
            this.cardPrintReqTotalCount = data.result != 0 ? data.result : 0
            this.phyPrintReqTotalCount = data.recordsTotal != 0 ? data.recordsTotal : 0
            resolve();
          } else {
            this.isCPResponse = true
            this.showCprLoader = false
            this.cardPrintReqTotalCount = 0
            resolve();
          }
        }, (error) => {
          this.isCPResponse = false
          this.observableObjCardPrintCounts.unsubscribe()
          resolve();
        })
      }
    });
    return promise
  }

  getEligibilityFileCount() {
    let promise = new Promise((resolve, reject) => {
      this.showEfLoader = true
      let currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
      var url = DataManagementDashboardApi.getEligFileCountUrl;
      let requestData = {
        "createdOn": currentDate
      }
      if (this.getForApi) {
        this.hmsDataService.postApi(url, requestData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.isEFResponse = true
            this.showEfLoader = false
            this.incomeSupport = data.result.incomeSupport
            this.learner = data.result.learner
            resolve();
            /* Eligibility Checks */
            if ((data.result.aahb == "Loaded" && data.result.ahbCob == "Not Loaded" && data.result.ahbCon == "Not Loaded")
              || (data.result.aahb == "Not Loaded" && data.result.ahbCob == "Loaded" && data.result.ahbCon == "Not Loaded")
              || (data.result.aahb == "Not Loaded" && data.result.ahbCob == "Not Loaded" && data.result.ahbCon == "Loaded")
              || (data.result.aahb == "Loaded" && data.result.ahbCob == "Loaded" && data.result.ahbCon == "Loaded")) {
              this.aahb = "Loaded"
            } else {
              this.aahb = "Not Loaded"
            }
            if ((data.result.achb == "Loaded" && data.result.achbCob == "Not Loaded")
              || (data.result.achb == "Not Loaded" && data.result.achbCob == "Loaded")
              || (data.result.achb == "Loaded" && data.result.achbCob == "Loaded")) {
              this.achb = "Loaded"
            } else {
              this.achb = "Not Loaded"
            }
            if ((data.result.senior == "Loaded" && data.result.seniorTrustee == "Not Loaded")
              || (data.result.senior == "Not Loaded" && data.result.seniorTrustee == "Loaded")
              || (data.result.senior == "Loaded" && data.result.seniorTrustee == "Loaded")) {
              this.senior = "Loaded"
            } else {
              this.senior = "Not Loaded"
            }
          } else {
            this.isEFResponse = true
            this.showEfLoader = false
            this.incomeSupport = "Not Loaded"
            this.aahb = "Not Loaded"
            this.learner = "Not Loaded"
            this.achb = "Not Loaded"
            this.senior = "Not Loaded"
            resolve();
          }
        }, (error) => {
          this.isEFResponse = false
          this.observableObjForEligibleFiles.unsubscribe()
          resolve();
        })
      }
    });
    return promise
  }

  getCdaNetCount() {
    this.errorADSC = 'Yes'
    this.errorQuikcard = 'No'
  }
  callReportWithReportIdDM(reportID) {
    this.financeReportObject.reportID = reportID;
    this.financeReportObject.openReportModal('', reportID, '', false, true);
  }
  getCdaCounts() {
    let promise = new Promise((resolve, reject) => {
      this.showCNLoader = true
      let currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
      var url = DataManagementDashboardApi.getCdaDataCountUrl;
      let data = {
        "createdOn": currentDate
      }
      if (this.getForApi) {
        this.hmsDataService.postApi(url, data).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.isCNResponse = true
            this.showCNLoader = false
            this.acdq = data.result.acdq || "Not Loaded"
            this.cda = data.result.cda || "Not Loaded"
            this.dac = data.result.dac || "Not Loaded"
            resolve();
          } else {
            this.isCNResponse = true
            this.showCNLoader = false
            this.acdq = "Not Loaded"
            this.cda = "Not Loaded"
            this.dac = "Not Loaded"
            resolve();
          }
        }, (error) => {
          this.isCNResponse = false
          this.observableObjForCdaNet.unsubscribe()
          resolve();
        })
      }
    });
    return promise
  }

  getClaimSecureCount() {   // Log ticket #1222  
    let promise = new Promise((resolve, reject) => {
      this.showCSLoader = true
      let currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
      var urlQsi = DataManagementDashboardApi.getQsiDataCountUrl;
      let data = {
        "createdOn": currentDate
      }
      if (this.getForApi) {
        this.hmsDataService.postApi(urlQsi, data).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.isCSResponse = true
            this.showCSLoader = false
            this.LOAD_DAILY_FILE = data.result.qsiLoadDailyFile || "Not Loaded"
            this.qsi_drug = data.result.qsiDailyPayment || "Not Loaded"
            this.qsi_elig = data.result.qsiEligibility || "Not Generated"
            this.qsi_ex_ex = data.result.qsiExportExpense || "Not Generated"
            resolve();
          }
          else {
            this.isCSResponse = true
            this.showCSLoader = false
            this.LOAD_DAILY_FILE = "Not Loaded"
            this.qsi_drug = "Not Loaded"
            this.qsi_elig = "Not Generated"
            this.qsi_ex_ex = "Not Generated"
            resolve();
          }
        }, (error) => {
          this.isCSResponse = false
          this.observableObjForSecureCount.unsubscribe()
          resolve();
        })
      }
    });
    return promise
  }

  changeTab(value) {
    value == "SP" ? this.showServiceProviderComp = true : this.showServiceProviderComp = false
    value == "CPR" ? this.showCardPrintRequestComp = true : this.showCardPrintRequestComp = false
    value == "EF" ? this.showEligibilityFileComp = true : this.showEligibilityFileComp = false
    value == "CN" ? this.showCdaNetComp = true : this.showCdaNetComp = false
    value == "CS" ? this.showClaimSecureComp = true : this.showClaimSecureComp = false
    value == "ADR" ? this.reportListShowHide = true : this.reportListShowHide = false
    value == "PEPA" ? this.showElectronicPending = true : this.showElectronicPending = false

    if (value == "ADR") {   // Report tiles api hitting issue
      this.dataManageService.showDataReportsList.emit(this.reportListShowHide);
    }
    // to resolve table header conflict in data management dashboard
    if (value == "PEPA") {
      this.dataTableService.showPendingAdEmitter.emit(this.showElectronicPending)
    }
  }

  getDataResult() {
    let promise = new Promise((resolve, reject) => {
      this.showDataLoader = true
      setTimeout(() => {
        var reqParam = {
          'startPos': 0,
          'pageSize': 5,
          'searchType': 'l',
          'fillterSearch': 'P'
        }
        if (this.getForApi) {
          this.hmsDataService.postApi(QsiLoaderReportApi.getQsiReportFiles, reqParam).subscribe(x => {
            if (x.code == 200) {
              this.isDResponse = true
              this.showDataLoader = false
              resolve();
            } else {
              this.isDResponse = true
              this.showDataLoader = false
              resolve();
            }
          }, (error) => {
            this.isDResponse = false
            this.observableObjForData.unsubscribe()
            resolve();
          })
        }
      }, 500);
    });
    return promise
  }

  getPendingElectronicAdjustmentListData() {
    if (this.getForApi) {
      this.pendingElectronicAdjustmentComponent.getPendingElectronicAdjustmentList()
    }
  }

  getMissingCompanyListData() {
    this.groupsMissingInformationComponent.getMissingCompanyList()
  }

}
