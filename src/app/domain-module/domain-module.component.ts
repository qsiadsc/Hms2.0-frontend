import { Component, OnInit } from '@angular/core';
import { DatatableService } from '../common-module/shared-services/datatable.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service';
import { DomainApi } from '../domain-module/domain-api';
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service';
import { debug } from 'util';

@Component({
  selector: 'app-domain-module',
  templateUrl: './domain-module.component.html',
  styleUrls: ['./domain-module.component.css'],
  providers: [DatatableService,ChangeDateFormatService]
})
export class DomainModuleComponent implements OnInit {

  constructor(private dataTableService:DatatableService,
              private translate:TranslateService,
              private currentUserService: CurrentUserService) { }

  observableObj;
  check = true;
  columns = [];
  tablecd: any;
  displayName:any;
  currentUser:any;
  domainArray =  [{
      "viewDomain": 'F',
  }]
              
  ngOnInit() {
    /* Security Checks */
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DON']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DON']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
      })
    }
  }

  ngAfterViewInit(){
    var self = this;
    $(document).on('keydown', '#domainList .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })

    $(document).on('click', '#domainList .view-ico', function () {
      var code = $(this).data('id')
      var name = $(this).data('displayname')
      self.tablecd = code
      self.displayName = name
      self.getDomainView(self.tablecd, self.displayName);
    })

    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', 'View');
    })
  }

  dataTableInitialize() {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('domain.displayName') == 'domain.displayName') {
        } else {
          this.columns = [
            { title: this.translate.instant('domain.displayName'), data: 'displayName' },
            { title: this.translate.instant('domain.action'), data: 'tableCd' }
          ]
          this.getDomainList();
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
  }

  getDomainList() {
    var reqParam = []
    var url = DomainApi.domainListingUrl;
    var tableId = "domainList"
    if (!$.fn.dataTable.isDataTable('#domainList')) {
      var tableActions = [
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.domainArray[0].viewDomain },
      ]
      this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 1, [], "", '', '', '', '', '', [])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  searchDomain(tableId: string) {
    var params = this.dataTableService.getFooterParams("domainList")
    var dateParams = []
    var URL = DomainApi.domainListingUrl;
    this.dataTableService.jqueryDataTableReload("domainList", URL, params, dateParams)
  }

  /**
   * Reset Domain List Filter
   */
  resetDomainSearch() {
    this.dataTableService.resetTableSearch();
    this.searchDomain("domainList")
    $('#domainList .icon-mydpremove').trigger('click');
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchDomain(tableId);
    }
  }

  getDomainView(id, name){
    window.open('/domain/domainInfo?tableCd=' + id+ "&name=" + name, '_blank');
  }

  /* Get Auth Checks for Domain */
  getAuthCheck(domainChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.domainArray = [{
        "viewDomain": 'T'
      }]
    } else {
      for (var i = 0; i < domainChecks.length; i++) {
        authCheck[domainChecks[i].actionObjectDataTag] = domainChecks[i].actionAccess
      }
      this.domainArray = [{
        "viewDomain": authCheck['DOM394']
      }]
    }
    return this.domainArray
  }
}
