import { Component, OnInit,Injectable, EventEmitter, HostListener,Output, Input } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'
import { Constants } from '../common-module/Constants';
import { ClaimService } from '../claim-module/claim.service';

@Component({
  selector: 'app-dashboard-tab',
  templateUrl: './dashboard-tab.component.html',
  styleUrls: ['./dashboard-tab.component.css']
})
export class DashboardTabComponent implements OnInit {
 quikcardTab: boolean = true;
 albertaTab: boolean = false;
 financeTab: boolean = false;
 dataManagementTab: boolean= false
 referToReviewTab: boolean= false
 disableDashboard: boolean= true
 currentUser:any
 dashBoardCheck = [{
  "quikcardDashboard": 'F',
  "albertaDashboard": 'F',
  "financeDashboard": "F",
  "dataManagementDashboard": "F",
  "uftContinuity": 'F',
  "compAndCardholderContinuity": 'F',
  "companyBalances": 'F',
  "pendingClaims": 'F',
  "payables": 'F',
  "reports": 'F'
}]
businessType
bothAccess
isQuikcard
isAlberta
uftTabsCheck: boolean = false
activeTabVal
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private currentUserService:CurrentUserService,
    private claimService : ClaimService
  ){ }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthArray()
        localStorage.setItem('isReload', '')
      })
    }else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthArray()
      })
    }
    let url = window.location.href
    if(url.indexOf("dataManagement") >= 0){
      this.quikcardTab = false
      this.albertaTab = false
      this.financeTab = false
      this.dataManagementTab=true
    }else{
      if (this.route.snapshot.url[0]) {
        if(this.route.snapshot.url[0].path == "dashboard") {
          this.quikcardTab = false
          this.albertaTab = false
          this.dataManagementTab=false
          this.financeTab = true
        }else if(this.route.snapshot.url[0].path == "alberta") {
          this.quikcardTab = false
          this.albertaTab = true
          this.financeTab = false
          this.dataManagementTab=false
        }else if(this.route.snapshot.url[0].path == "dashboard") {
          this.quikcardTab = true
          this.albertaTab = false
          this.financeTab = false
          this.dataManagementTab=false
        }
        this.albertaTab ? this.changeTheme('S') : this.changeTheme('Q')
      }
    }
  }

  getAuthArray() { 
    let checkArray = this.currentUserService.authChecks['UFD'].concat(this.currentUserService.authChecks['DDM']).concat(this.currentUserService.authChecks['DBC'])
    this.getAuthCheck(checkArray)    
  }

  getAuthCheck(claimChecks) {
    this.currentUserService.getLoginUserDeparment().then(val =>{
      this.currentUser = this.currentUserService.currentUser
      let userAuthCheck = []
      this.bothAccess = this.currentUser.businessType.bothAccess
      this.isQuikcard = this.currentUser.businessType.isQuikcard
      this.isAlberta = this.currentUser.businessType.isAlberta
  
      if (this.currentUser.isAdmin == 'T') {
        this.dashBoardCheck = [{
          "quikcardDashboard": 'T',
          "albertaDashboard": 'T',
          "financeDashboard": 'T',
          "dataManagementDashboard":"T",
          "uftContinuity": 'T',
          "compAndCardholderContinuity": 'T',
          "companyBalances": 'T',
          "pendingClaims": 'T',
          "payables": 'T',
          "reports": 'T'
        }]
      } else {
        for (var i = 0; i < claimChecks.length; i++) {
          userAuthCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
        }
        this.dashBoardCheck = [{
          "quikcardDashboard": userAuthCheck['DBC303'],
          "albertaDashboard": userAuthCheck['DBC303'],
          "financeDashboard": userAuthCheck['UFD289'],
          "dataManagementDashboard":userAuthCheck['DDM305'],
          "uftContinuity": userAuthCheck['UFD324'],
          "compAndCardholderContinuity": userAuthCheck['UFD325'],
          "companyBalances": userAuthCheck['UFD326'],
          "pendingClaims": userAuthCheck['UFD327'],
          "payables": userAuthCheck['UFD328'],
          "reports": userAuthCheck['UFD329']
        }]
      }    
      if(this.dashBoardCheck[0].uftContinuity  == 'T' || this.dashBoardCheck[0].compAndCardholderContinuity  == 'T' || this.dashBoardCheck[0].companyBalances == 'T' || this.dashBoardCheck[0].pendingClaims == 'T' || this.dashBoardCheck[0].payables == 'T' || this.dashBoardCheck[0].reports == 'T'){
        this.uftTabsCheck = true
      }else{
        this.uftTabsCheck = false
      }
      let activeTabVal
      if(this.dashBoardCheck[0].quikcardDashboard){
        this.activeTabVal = 'q'
      }else if(this.dashBoardCheck[0].albertaDashboard){
        this.activeTabVal = 'a'
      }else if(this.dashBoardCheck[0].financeDashboard){
        this.activeTabVal = 'f'
      }else if(this.dashBoardCheck[0].dataManagementDashboard){
        this.activeTabVal = 'dm'
      }
      return this.dashBoardCheck
    })
  }

  addActiveTab(value){   
    value == "q" ? this.quikcardTab = true : this.quikcardTab = false
    value == "a" ? this.albertaTab = true : this.albertaTab = false
    value == "f" ? this.financeTab = true : this.financeTab = false
    value == "dm" ? this.dataManagementTab = true : this.dataManagementTab = false
    value == "rtr" ? this.referToReviewTab = true : this.referToReviewTab = false

    this.albertaTab ? this.changeTheme('S') : this.changeTheme('Q')
    this.claimService.getApiEmitter.emit(this.financeTab); //emit value for getAllFiles api
  }

  changeTheme(businessTypeCd){
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
}
