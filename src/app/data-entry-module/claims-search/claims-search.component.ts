import { Component, OnInit, HostListener } from '@angular/core';
import {FormsModule, FormGroup, FormControl,Validators} from '@angular/forms'
import {CommonDatePickerOptions} from '../../common-module/Constants';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import {Observable} from 'rxjs';
import { DataEntryApi} from '../data-entry-api';
import {DatatableService} from '../../common-module/shared-services/datatable.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-claims-search',
  templateUrl: './claims-search.component.html',
  styleUrls: ['./claims-search.component.css'],
  providers:[ChangeDateFormatService,DatatableService]
  
})
export class ClaimsSearchComponent implements OnInit {
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload','T')
  }
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public claimsSearchForm:FormGroup;
  dateNameArray={};
  observableObj;
  check=true;
  columns=[];
  showClaimsList:boolean=false;
  authCheck = [{
    "addClaims":'F',
    "viewClaim":'F',  
    "searchClaim":'F',
  }]
  constructor(private translate: TranslateService,
    private changeDateFormatService:ChangeDateFormatService,
    private dataTableService:DatatableService,
    private currentUserService:CurrentUserService, 
  ){ }
    
    
    ngOnInit() {
      if(localStorage.getItem('isReload')=='T'){
        this.currentUserService.getUserAuthorization().then(res=>{
          this.getAuthArray()
          localStorage.setItem('isReload','')
        })
      }else{
        this.getAuthArray()
      }
      this.claimsSearchForm=new FormGroup({
        'firstName': new FormControl(),
        'lastName':new FormControl(),
        'alertMessage': new FormControl(),
        'uliNo':new FormControl(),
        'licenseNo': new FormControl(),
        'speciality': new FormControl(),
      });
      
      /// This is used for Cliams-List
      var tableId = "claims-list"
      var URL = DataEntryApi.companySearchUrl;
      var reqParam = ''
      var tableActions = [
        {'name':'view','class':'table-action-btn view-ico','icon_class':'fa fa-eye','title':'View'},
      ]
      // Get Tranlation of columns by Using Observable Method
      this.observableObj=Observable.interval(1000).subscribe(value=>{
        if(this.check=true){
          if('dataEntry.claims-search.address'==this.translate.instant('dataEntry.claims-search.address')){
          }else{
            this.columns = [
              { title: this.translate.instant('dataEntry.claims-search.effectiveDate'), data: 'effectiveOn' },
              { title: this.translate.instant('dataEntry.claims-search.expiryDate'), data: 'coTerminatedOn' },
              { title: this.translate.instant('dataEntry.claims-search.postalCode'), data: 'provinceName' },
              { title: this.translate.instant('dataEntry.claims-search.address'), data: 'coName' },
              { title: this.translate.instant('dataEntry.claims-search.city'), data: 'cityName' },
              { title: this.translate.instant('dataEntry.claims-search.province'), data: 'provinceName' },
              { title: this.translate.instant('dataEntry.claims-search.bussArrNo'), data: 'coID' },
              { title: this.translate.instant('dataEntry.claims-search.facilityNo'), data: 'coID' },
            ]
            this.check=false;
            this.observableObj.unsubscribe();
          }
        }
      })
      
    }
    getAuthArray(){
      let checkArray = this.currentUserService.authChecks['SBT']
      let searchClaim  = this.currentUserService.authChecks['SBT'].filter(val => val.actionObjectDataTag == 'BTH230').map(data => data)
      checkArray.push(searchClaim[0])
      this.getAuthCheck(checkArray)
    }
    getAuthCheck(claimChecks){
      let authCheck = []
      if(localStorage.getItem('isAdmin') == 'T'){
        this.authCheck = [{
          "addClaims":'T',
          "viewClaim":'T', 
          "searchClaim":'T'
        }]
      }else{
        for(var i= 0; i < claimChecks.length; i++ ){
          authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
        }
        this.authCheck = [{
          "addClaims":authCheck['SBT231'],
          "viewClaim":authCheck['SBT232'],  
          "searchClaim":authCheck['BTH230'],
        }]
      }
    }
    // Submit Claims-Search Form
    onSubmit(){
      this.showClaimsList=true;
      var reqParam = [
        { 'key': 'coId', 'value': this.claimsSearchForm.value.firstName },
        { 'key': 'coName', 'value': this.claimsSearchForm.value.lastName },
        { 'key': 'provinceName', 'value': this.claimsSearchForm.value.alertMessage },
        { 'key': 'cityName', 'value': this.claimsSearchForm.value.uliNo },
        { 'key': 'status', 'value': this.claimsSearchForm.value.licenseNo },
        { 'key': 'businessTypeDesc', 'value': this.claimsSearchForm.value.speciality },
      ]
      var URL = DataEntryApi.companySearchUrl;
      var params =''
      var tableActions = [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
      ]
      var tableId = "claims-list"
      if (!$.fn.dataTable.isDataTable('#claims-list')) {
        this.dataTableService.jqueryDataTable(tableId, URL, 'full_numbers', this.columns, 4, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined,this.authCheck[0].viewClaim)
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
      }
      
    }
    
    // Reset Claims-Search Form
    resetClaimsSearchForm(){
      this.showClaimsList=false;
      this.claimsSearchForm.reset();
    }
    
    // Search Listing for Cliams
    searchClaimsList(tableId:string){
      var params = this.dataTableService.getFooterParams("claims-list")
      var dateParams = [];
      var URL =  DataEntryApi.companySearchUrl; ;   ///  will be use api  
      this.dataTableService.jqueryDataTableReload("claims-list", URL, params, dateParams)
    }
    
    // Reset Listing for Cliams
    resetClaimsListFilter(){
      this.dataTableService.resetTableSearch();
      this.searchClaimsList("claims-list");
      $('#claims-list .icon-mydpremove').trigger('click');
    }
    // Date-Format for Lower Search
    changeDateFormat1(event, frmControlName) {
      if (event.reason == 2 && event.value != null && event.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(event);
        if (obj) {
          this.dateNameArray[frmControlName] = {
            year: obj.date.year,
            month: obj.date.month,
            day: obj.date.day
          };
        }
      }
    }
  }
  