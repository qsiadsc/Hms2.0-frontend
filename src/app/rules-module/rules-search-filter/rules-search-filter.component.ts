/*
Module Name    : Rules-Search                                
Module Purpose : Shows the Rules Search
Created date   : 28 June 2018
*/
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { SearchCompanyComponent } from '../../common-module/shared-component/search-company/search-company.component';
import { Observable } from 'rxjs/Observable';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { CompanyApi } from '../../company-module/company-api';
import { Constants } from '../../common-module/Constants';
import { RulesApi } from '../rules-api';
import { RulesService } from '../rules.service';
import { Router, ActivatedRoute, Params, NavigationEnd, NavigationError, NavigationStart, Event, NavigationExtras } from '@angular/router';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'

@Component({
  selector: 'app-rules-search-filter',
  templateUrl: './rules-search-filter.component.html',
  styleUrls: ['./rules-search-filter.component.css'],
  providers: [DatatableService, TranslateService, ChangeDateFormatService]
})
export class RulesSearchFilterComponent extends FormCanDeactivate implements OnInit {
  currentUser: any;
  currentUrl: string;
  backRuleTrue: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  FormGroup: FormGroup;
  columns = [];
  public filterRules: FormGroup; // change private to public for production build
  showRulesList: boolean = false;
  checkvalue: boolean = true;
  ObservableObj;
  rulesMask;
  rulesRuleDescription;
  rulesScript;
  disciplineKey;
  rulesRoute;
  ruleName;
  rulesAuthCheck = [{
    "addDentalRule": 'F',
    "addVisionRule": 'F',
    "addHealthRule": 'F',
    "addDrugRule": 'F',
    "searchDentalRule": 'F',
    "searchVisionRule": 'F',
    "searchHealthRule": 'F',
    "searchDrugRule": 'F',
    "viewDentalRule": 'F',
    "viewVisionRule": 'F',
    "viewHealthRule": 'F',
    "viewDrugRule": 'F'
  }]
  previousUrl
  constructor(private translate: TranslateService,
    private dataTableService: DatatableService,
    private route: ActivatedRoute,
    private router: Router,
    private currentUserService: CurrentUserService,
    private rulesService: RulesService,
    private hmsDataServiceService: HmsDataServiceService,
  ) {
    super();
    
    this.route.params.subscribe((params: Params) => {
      this.disciplineKey = params.id;
      this.rulesRoute = '/rules/add/' + this.disciplineKey;
      if (this.disciplineKey == 1) {
        this.ruleName = 'Dental Rules';
        this.showRulesList = false;
      } else if (this.disciplineKey == 2) {
        this.ruleName = 'Vision Rules';
        this.showRulesList = false;
      }
      else if (this.disciplineKey == 3) {
        this.ruleName = 'Health Rules';
        this.showRulesList = false;
      }
      else if (this.disciplineKey == 4) {
        this.ruleName = 'Drug Rules';
        this.showRulesList = false;
      }
    });

    router.events.subscribe((event: Event) => {
     if (event instanceof NavigationStart) {
      this.currentUrl = event.url
      if(this.rulesService.ruleBackToSerchBtn){
        this.backRuleTrue  = false
        }else{
          this.backRuleTrue  = true
        }
       // Show loading indicator      
     }
     if (event instanceof NavigationEnd) {
      this.previousUrl = event.url;      
       if(this.rulesService.ruleBackToSerchBtn){
        this.backRuleTrue  = false         
      }else{
        this.backRuleTrue  = true
       }
      // Hide loading indicator         
       if(this.currentUrl == this.previousUrl){
       }else{
       }
     }
   });
  }

  ngOnInit() {
    var self = this
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DTL'].concat(
          this.currentUserService.authChecks['VIS'],
          this.currentUserService.authChecks['HLT'],
          this.currentUserService.authChecks['DRG']
        );
        this.getAuthCheck(checkArray).then(res => {
          this.ruleDataTableRender()
        })
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DTL'].concat(
          this.currentUserService.authChecks['VIS'],
          this.currentUserService.authChecks['HLT'],
          this.currentUserService.authChecks['DRG']
        );
        this.getAuthCheck(checkArray).then(res => {
          this.ruleDataTableRender()
        })
      })
    }
    this.filterRules = new FormGroup({
      'rulesRadio': new FormControl(),
      'rulesMask': new FormControl(),
      'rulesRule': new FormControl(),
      'rulesRuleDescription': new FormControl(),
      'rulesScript': new FormControl()
    });
    if(this.backRuleTrue){
      this.filterRules.reset();
    }

    //Edit click Event of Rule View   
    $(document).on('click', '#rules-list .view-ico', function () {
      var ruleId = $(this).data('id');
      self.rulesService.backToSearchBtn = true;
      self.ViewRulePage(ruleId)
    })
    $(document).on('click', '#rules-list tr td:not(:last-child)', function () {
      $(this).parent('tr').find('.view-ico').trigger('click')
    });
    if(!this.backRuleTrue){
     this.filterRules.reset();
    }
  }

  ngAfterViewInit(){
    this.filterRules.patchValue({'rulesRadio':''})
  }

  ruleDataTableRender() {
    var tableId = "rules-list"
    var URL = RulesApi.rulesSearchUrl;
    var reqParam = [{ 'key': 'startPos', 'value': '0' }, { 'key': 'pageSize', 'value': '5' }]
    //Role Check To Be Applied Here      
    if (this.rulesAuthCheck[0].viewDentalRule && this.disciplineKey == 1) {
      var tableActions = [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.rulesAuthCheck[0].viewDentalRule },
      ]
    } else if (this.rulesAuthCheck[0].viewVisionRule && this.disciplineKey == 2) {
      var tableActions = [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.rulesAuthCheck[0].viewVisionRule },
      ]
    } else if (this.rulesAuthCheck[0].viewHealthRule && this.disciplineKey == 3) {
      var tableActions = [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.rulesAuthCheck[0].viewHealthRule },
      ]
    } else if (this.rulesAuthCheck[0].viewDrugRule && this.disciplineKey == 4) {
      var tableActions = [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.rulesAuthCheck[0].viewDrugRule },
      ]
    }
    this.ObservableObj = Observable.interval(.1000).subscribe(x => {
      if (this.checkvalue = true) {
        if ('rules.rules-search-filter.mask' == this.translate.instant('rules.rules-search-filter.mask')) {
        }
        else {
          this.columns = [
            { title: this.translate.instant('rules.rules-search-filter.mask'), data: 'ruleMask' },
            { title: this.translate.instant('rules.rules-search-filter.description'), data: 'ruleDescCom' },
            { title: this.translate.instant('rules.rules-search-filter.script'), data: 'ruleTxt' },
            { title: this.translate.instant('rules.rules-search-filter.action'), data: 'ruleKey' }
          ];
          this.dataTableService.ruleSearchDataTable(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 3,'','','',[1,2,3])
          this.checkvalue = false;
          this.ObservableObj.unsubscribe();
          if(this.rulesService.ruleSearchedData){
            if(!this.backRuleTrue){
              this.filterRules.patchValue(this.rulesService.ruleSearchedData)
              this.onSubmit()
              this.rulesService.backToSearchBtn = false
            }
          }
        }
      }
    });
  }

  getAuthCheck(ruleChecks) {
    let promise = new Promise((resolve, reject) => {
      let authCheck = []
      if(this.currentUser.isAdmin == 'T'){
        this.rulesAuthCheck = [{
          "addDentalRule": 'T',
          "addVisionRule": 'T',
          "addHealthRule": 'T',
          "addDrugRule": 'T',
          "searchDentalRule": 'T',
          "searchVisionRule": 'T',
          "searchHealthRule":'T',
          "searchDrugRule": 'T',
          "viewDentalRule": 'T',
          "viewVisionRule": 'T',
          "viewHealthRule": 'T',
          "viewDrugRule": 'T'          
        }]
        resolve()
      }else{
        if (ruleChecks && ruleChecks.length > 0) {
          for (var i = 0; i < ruleChecks.length; i++) {
            authCheck[ruleChecks[i].actionObjectDataTag] = ruleChecks[i].actionAccess
          }
        }
        this.rulesAuthCheck = [{
          "addDentalRule": authCheck['DTL138'],
          "addVisionRule": authCheck['VIS145'],
          "addHealthRule": authCheck['HLT152'],
          "addDrugRule": authCheck['DRG159'],
          "searchDentalRule": authCheck['DTL134'],
          "searchVisionRule": authCheck['VIS135'],
          "searchHealthRule": authCheck['HLT136'],
          "searchDrugRule": authCheck['DRG137'],
          "viewDentalRule": authCheck['SDR143'],
          "viewVisionRule": authCheck['SVR150'],
          "viewHealthRule": authCheck['SHR157'],
          "viewDrugRule": authCheck['SDG164']
        }]
        resolve()
      }
      return this.rulesAuthCheck
    })
    return promise
  }

  /**
  * Serach Rules On Press Enter
  * @param event 
  */
  onKeyPress(event) {
    if (event.keyCode == 13) {
      this.onSubmit();
    }
  }

  /**
  * Reset Saerch filter cols
  */
  resetSearchForm() {
    this.showRulesList = false;
    this.filterRules.reset();
  }

  /**
  * Filter rules search form
  * @param filterRules 
  */
  onSubmit() {
    var start
    var length
    var disciplineKey
    var ruleKey
    var rulePlanInd
    var ruleDescCom
    var ruleMask
    var ruleTxt
    this.showRulesList = true;
    var reqParam = [
      { 'key': 'disciplineKey', 'value': this.disciplineKey },
      { 'key': 'ruleMask', 'value': this.filterRules.value.rulesMask },
      { 'key': 'ruleTxt', 'value': this.filterRules.value.rulesScript },
      { 'key': 'ruleDescCom', 'value': this.filterRules.value.rulesRuleDescription },
      { 'key': 'ruleKey', 'value': this.filterRules.value.rulesRule },
      { 'key': 'rulePlanInd', 'value': this.filterRules.value.rulesRadio },
    ]
    var URL = RulesApi.rulesSearchUrl;
    this.dataTableService.jqueryDataTableReload("rules-list", URL, reqParam)
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    this.rulesService.getRuleSearchData(this.filterRules.value)
    return false;
  }

  /**
  * Filter Rules search
  * @param tableId 
  */
  filterRulesSearch(tableId: string) {
    var params = this.dataTableService.getFooterParams("rules-list")
    var URL = RulesApi.rulesSearchUrl;
    this.dataTableService.jqueryDataTableReload("rules-list", URL, params)
  }

  /**
  * Reset Filter Listing cols
  */
  resetListingFilter() {
    this.dataTableService.resetTableSearch();
    this.filterRulesSearch("rules-list")
    $('#rules-list .icon-mydpremove').trigger('click');
  }

  /**
  * View rules details page
  * @param ruleId 
  */
  ViewRulePage(ruleId) {
    this.router.navigate(['/rules/view/' + ruleId + '/diciplineKey/' + this.disciplineKey]);
  }

}