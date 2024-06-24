import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, FormControl,FormControlName, Validators } from '@angular/forms';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
/** For Common Date Picker */
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService} from '../../common-module/shared-services/change-date-format.service';
import { DataEntryApi} from '../data-entry-api';
import { DataEntryService} from '../data-entry.service';


import { Observable} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-provider-search',
  templateUrl: './provider-search.component.html',
  styleUrls: ['./provider-search.component.css'],
  providers: [DatatableService,ChangeDateFormatService]
})
export class ProviderSearchComponent implements OnInit {
  
  constructor(
    private dataTableService:DatatableService,
    private dataEntryService:DataEntryService,
    private changeDateFormatService:ChangeDateFormatService,
    private translate:TranslateService,
    private currentUserService: CurrentUserService,
  ) { }
  
  public providerSearchForm:FormGroup;
  showProviderList:boolean=false;
  columns=[];
  observableObj;
  check=true;
  authCheck = [{
    'dataEntryProviderSearch':'F',
    'viewProvider':'F',
    'addDentist':'F',
  }]
  ngOnInit() {
    
    if(localStorage.getItem('isReload')=='T'){
      this.currentUserService.getUserAuthorization().then(res=>{
        let checkArray = this.currentUserService.authChecks['DPR'].concat(this.currentUserService.authChecks['PRS'])
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload','')
      })
    }else{
      let checkArray = this.currentUserService.authChecks['DPR'].concat(this.currentUserService.authChecks['PRS'])
      this.getAuthCheck(checkArray)
    }
    this.providerSearchForm=new FormGroup({
      'uliNo': new FormControl(),
      'licenseNo': new FormControl(),
      'lastName': new FormControl(),
      'firstName': new FormControl()
    });
    
    var self = this
    $(document).on('keydown', '#batch-list .btnpickerenabled', function(event){
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
    
    $(document).on('click', '#provider-list tr', function(event){
      self.dataEntryService.showClaimBckBtn = true;
   })

    /// This is used for Provider-List
    var tableId = "provider-list"
    var URL = DataEntryApi.getProviderSearchList;
    var tableActions = [
      {'name':'view','class':'table-action-btn view-ico','icon_class':'fa fa-eye','title':'View'},
    ]

   
    
    // Get Tranlation of columns by Using Observable Method
    this.observableObj=Observable.interval(1000).subscribe(value=>{
      if(this.check=true){
        if('dataEntry.provider-search.uliNo'==this.translate.instant('dataEntry.provider-search.uliNo')){
        }else{
          this.columns = [
            { title: this.translate.instant('dataEntry.provider-search.uliNo'), data: 'providerUli' },
            { title: this.translate.instant('dataEntry.provider-search.licenseNo'), data: 'providerLicenseNumber' },
            { title: this.translate.instant('dataEntry.provider-search.lastName'), data: 'providerLastName' },
            { title: this.translate.instant('dataEntry.provider-search.firstName'), data: 'providerFirstName' },
          ]
          this.check=false;
          this.observableObj.unsubscribe();
          if(this.dataEntryService.claimSearchedDataEntry && this.dataEntryService.isBackProviderSearch){
            this.providerSearchForm.patchValue(this.dataEntryService.claimSearchedDataEntry)
            this.dataEntryService.isBackProviderSearch = false;
            this.onSubmit();
          }
        }
      }
    })
    
  
  }
  getAuthCheck(claimChecks){
    let authCheck = []
    if(localStorage.getItem('isAdmin') == 'T'){
      this.authCheck = [{
        'dataEntryProviderSearch':'T',
        'viewProvider':'T',
        'addDentist':'T'
      }]
    }else{
      for(var i= 0; i < claimChecks.length; i++ ){
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.authCheck = [{
        'dataEntryProviderSearch':authCheck['DPR249'],
        'viewProvider':authCheck['DPR250'],
        'addDentist':authCheck['PRS251'],
      }]
    }
  }
  // Submit Provider-Search Form
  onSubmit(){
    this.showProviderList=true;
    var reqParam = [
      { 'key': 'providerUliString',  'value': this.providerSearchForm.value.uliNo },
      { 'key': 'licenseNo', 'value': this.providerSearchForm.value.licenseNo },
      { 'key': 'providerLastName', 'value': this.providerSearchForm.value.lastName },
      { 'key': 'providerFirstName', 'value': this.providerSearchForm.value.firstName}
    ]
    var URL = DataEntryApi.getProviderSearchList;
    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
    ]
    var tableId = "provider-list"
    if (!$.fn.dataTable.isDataTable('#provider-list')) {
      this.dataTableService.jqueryDataTable(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined,this.authCheck[0].viewProvider,'','',[1,2,3])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
    }
    
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    this.dataEntryService.getClaimSearchDataEntry(this.providerSearchForm.value)
    return false;
  }
  
  //  Reset Provider-Search Form
  resetProviderSearchForm(){
    this.providerSearchForm.reset();
  }
  
  // Search Listing for Provider
  searchProviderList(tableId:string){
    var params = this.dataTableService.getFooterParams("provider-list")
    var dateParams = [];
    var URL =  DataEntryApi.getProviderSearchList; ;   ///  will be use api  
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }
  
  // Reset Listing for Provider
  resetProviderListFilter(){
    this.dataTableService.resetTableSearch();
    this.searchProviderList("provider-list");
    $('#provider-list .icon-mydpremove').trigger('click');
  }

   /**
   * filter the search on press enter
   * @param event 
   * @param tableId 
   */
  filterSearchOnEnter(event, tableId: string) {
    if(event.keyCode == 13) {
      event.preventDefault();
      this.searchProviderList(tableId);
    }
  }
  
}
