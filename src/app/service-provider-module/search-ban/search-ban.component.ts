import { Component, OnInit, Input, ViewChildren, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ServiceProviderApi } from '../service-provider-api';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { ServiceProviderService} from '../serviceProvider.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
@Component({
  selector: 'app-search-ban',
  templateUrl: './search-ban.component.html',
  styleUrls: ['./search-ban.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, DatatableService, TranslateService, ServiceProviderService]
})
export class SearchBanComponent implements OnInit {
  selectedDiscipline;
  //dn: any;
  clientNameL: string;
  provBankAcctNum: any;
  bussArr: any;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload','T')
  }
  FormGroup: FormGroup;
  checkBan: boolean = true
  showBANSearchTable: boolean = false
  columns = []
  ObservableClaimObj;
  disciplineType = []
  serviceProviderAddMode
  serviceProviderViewMode
  serviceProviderEditMode
  disciplineKey
  provBillAddKey
  banId
  currentUser
  provBillingAddressKey
  returnId : boolean = true
  searchBanChecks= [{
    "searchBan":'F',
    "editBan":'F',
    "viewBan":'F',
}]
  constructor(
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private serviceProviderService: ServiceProviderService,
    private currentUserService: CurrentUserService
  ) {
    serviceProviderService.getBanId.subscribe(value => {
      
      $(".highlight"+value['banId']).text(value['banClientName'])
    })
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res=>{
        this.currentUser=this.currentUserService.currentUser
         let checkArray = this.currentUserService.authChecks['SBN']
         checkArray.push()
         this.getAuthCheck(checkArray)
         localStorage.setItem('isReload','')
        })
    } else {
      this.currentUserService.getUserAuthorization().then(res=>{
        this.currentUser=this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['SBN']
        checkArray.push()
        this.getAuthCheck(checkArray)
      })
    }
    this.FormGroup = this.fb.group({
      bussArrNo: ['', CustomValidators.onlyNumbers],
      bankAccNo: ['', CustomValidators.onlyNumbers],
      disciplineType: [null],
    })
    /**
     * @param columns for search table with translations
     * @function intailze empty datatable for search
     * 
     */
    
    this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
      if (this.checkBan = true) {
        if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
        } else {
          this.columns = [
            { title: this.translate.instant('serviceProvider.serviceProvider-search.discipline'), data: 'disciplineName' },
            { title: this.translate.instant('serviceProvider.billing-address.ban-bank-account.buss-arr-number'), data: 'banId' },
            { title: this.translate.instant('serviceProvider.BAN-search.client-name'), data: 'banClientName' },
            { title: this.translate.instant('serviceProvider.BAN-search.bankAccNo'), data: 'provBankAcctNum' },
            { title: this.translate.instant('common.action'), data: 'banId'}
          ]
          this.checkBan = false;
          this.ObservableClaimObj.unsubscribe();
         }
      }
    });
    this.currentUserService.getUserRoleId().then(val =>{
      this.currentUser = this.currentUserService.currentUser
      this.getDisciplineList()
    })
   
    var self = this
    $(document).on("click", ".view-ico", function(){
      self.serviceProviderAddMode = false
      self.serviceProviderViewMode = true
      self.serviceProviderEditMode = false 
      var disciplineKey = self.getDisciplineColumn()
      self.banId = $(this).data('id')
      self.provBillingAddressKey = $(this).data('addresskey')
      self.GetBanDetail(self.banId,self.provBillingAddressKey,disciplineKey)
    })
    $(document).on("click", ".edit-ico", function(){
      self.serviceProviderAddMode = false
      self.serviceProviderViewMode = false
      self.serviceProviderEditMode = true 
      self.banId = $(this).data('id')
      self.provBillingAddressKey = $(this).data('addresskey')
      var disciplineKey = self.getDisciplineColumn()
      self.GetBanDetail(self.banId,self.provBillingAddressKey,disciplineKey)
    })
    $(document).on('click', '#search-BAN-table tr td:not(:last-child)', function () {
      $(this).parent('tr').find('.view-ico').trigger('click')    
    });
    $(document).on('keydown', '#search-BAN-table .btnpickerenabled', function(event){
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })
  }

  getAuthCheck(checkArray) {
    let userAuthCheck = []
    if(this.currentUserService.currentUser.isAdmin == 'T'){
      this.searchBanChecks= [{
        "searchBan":'T',
        "editBan":'T',
        "viewBan":'T'
    }]
    }else{
      for (var i = 0; i < checkArray.length; i++) {
        userAuthCheck[checkArray[i].actionObjectDataTag] = checkArray[i].actionAccess
      }
      this.searchBanChecks= [{
        "searchBan":userAuthCheck['SBN195'],
        "editBan":userAuthCheck['SBN197'],
        "viewBan":userAuthCheck['SBN196']
    }]
    }
    return this.searchBanChecks
  }

  getDisciplineColumn(){
    var appendExtraParam = {}
      var params = this.dataTableService.getFooterParamsSearchTable("search-BAN-table",appendExtraParam)
      for(var i = 0; i < params.length; i++){
        if(params[i]['key'] = 'disciplineKey'){
          return params[i]['value']
        }
      }
    }

  GetBanDetail(banId,provBillingAddressKey, disciplineKey)
  {
    this.disciplineKey = disciplineKey
    this.serviceProviderService.getDisciplineKey.emit(disciplineKey)
    let billingInfo={
      'banId':banId,
      'provBillAddKey': provBillingAddressKey,
      'fromSearchBan': true
    }
    this.serviceProviderService.getTestKey.emit(billingInfo)
  }
  /**
   * relaod search datatable 
   * get search result
   */
  getBANList(val) {
    this.showBANSearchTable = true
    var reqParam = [
      {'key':'provBankAcctNum', 'value': this.FormGroup.value.bankAccNo},
      {'key':'banId', 'value':this.FormGroup.value.bussArrNo},
      {'key':'disciplineKey', 'value':this.FormGroup.value.disciplineType},
    ]
    this.selectedDiscipline = this.FormGroup.value.disciplineType
    // to select all when all selected in main search.
    if (this.FormGroup.value.disciplineType == 0) {
      this.selectedDiscipline = 0
      reqParam[2].value = null      
    }
    this.bussArr=this.FormGroup.value.bussArrNo
    this.provBankAcctNum=this.FormGroup.value.bankAccNo
    this.clientNameL=''
    var tableActions = [
      {'name':'view','class':'table-action-btn view-ico','icon_class':'fa fa-eye','title':'View','showAction': this.searchBanChecks[0].viewBan},
      {'name':'edit','class':'table-action-btn edit-ico','icon_class':'fa fa-pencil','title':'Edit','showAction': this.searchBanChecks[0].editBan}
    ]
    var url = ServiceProviderApi.getBANList
    var tableId = "search-BAN-table"
    var modalName = "ModalSearchBanSetup"
    if (!$.fn.dataTable.isDataTable('#search-BAN-table')) {
      this.dataTableService.jqueryDataTableSearchBan(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4,modalName,'',[1,2,3,4])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    //  add check to resolved point no - 344
    if(val == 1){
     $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');
    }  
      return false;
  }

  getDisciplineList() {
    var userId = this.currentUser.userId
    let businessTypeKey
    if(this.currentUser.businessType.bothAccess){
      businessTypeKey = 0
    }else{
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
    }
    let requiredInfo = {
      "cardKey": 0,
      "userId": +userId,
      "businessTypeKey": businessTypeKey
    }
    this.hmsDataService.postApi(ServiceProviderApi.getDisciplineList, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.disciplineType = data.result
        if(this.currentUser.businessType.isAlberta) {
          this.FormGroup.patchValue({ 'disciplineType':1});
        }else{
          this.FormGroup.patchValue({ 'disciplineType': 1});
        }
      } else {
      }
    })
  }

  resetFormSearch() {
    this.FormGroup.reset()
    // To set Discipline when click on clear button in search BAN.
    this.getDisciplineList()
    this.bussArr=''
    this.provBankAcctNum=''
    this.showBANSearchTable = false
  }

  /**
   * 
   * @param tableId  
   * get service provider grid filteration
   */
  getBANByGridFilteration(tableId) {
    var appendExtraParam = {}
    var params = this.dataTableService.getFooterParamsSearchTable(tableId,appendExtraParam)
    // Discipline set to null when "All" selected in native search as per discussed with Arun sir
    if (params[0].value == 0) {
      params[0].value = null
    }
    var url = ServiceProviderApi.getBANList
    this.dataTableService.jqueryDataTableReload(tableId,url, params) 
  }

  resetTableSearch(){
    this.dataTableService.resetTableSearch()
    this.getBANByGridFilteration("search-BAN-table")
  }

  openModel(myModal)
  {
    myModal.open();
  }


  closeModal(myModal)
  {
    myModal.close();
  }

  /**
   * filter the search on press enter
   * @param event 
   * @param tableId 
   */
  filterSearchOnEnter(event, tableId: string) {
    if(event.keyCode == 13) {
      event.preventDefault();
      this.getBANByGridFilteration(tableId);
    }
  }


}
