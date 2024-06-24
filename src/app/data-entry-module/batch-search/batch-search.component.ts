//Batch Search ts
import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, NgForm, Validators } from '@angular/forms'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
/** For Common Date Picker */
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { DataEntryApi } from '../data-entry-api'
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs'
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { DataEntryService } from '../data-entry.service';
import { setTimeout } from 'timers';

@Component({
  selector: 'app-batch-search',
  templateUrl: './batch-search.component.html',
  styleUrls: ['./batch-search.component.css'],
  providers: [ChangeDateFormatService, DatatableService]
})
export class BatchSearchComponent implements OnInit {
  showLoader = false;
  fieldsArrayNew: any[];
  backToSearchNewData: boolean;
  selectOrDeselectEvent: boolean = true;
  selectOrDeselectEventValue: any;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  batchStatus;
  multiSelectDropdownSettings = {}
  selectedBatchStatus = [];
  arrBatchStatusItem = [];
  arrBatchStatus = [];
  batchSelected = []
  recordsTotal: any = 0;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public batchSearchForm: FormGroup;
  dateNameArray = {};
  columns = [];
  count = [];
  full: any;
  fullStatus: any;
  errorbatch;
  totalRecords: any = 0;
  showBatchList: boolean = false;
  showCount: boolean = false;
  observableObj;
  claimStatus = []
  check = true;
  authCheck = [{
    "addClaims": 'F',
    "viewClaim": 'F',
    "searchClaim": 'F',
  }]
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private currentUserService: CurrentUserService,
    private dataEntryService: DataEntryService
  ) {

    this.dataTableService.emitAmountBatch.subscribe((val) => {
      this.totalRecords = val
    })
    this.dataTableService.emitAmountBatchNo.subscribe((val) => {
      this.full = val;

    })
    this.dataTableService.emitAmountStatus.subscribe((val) => {
      this.fullStatus = val;

    })
    this.dataTableService.emitAmountError.subscribe((val) => {
      this.showCount = false;
      this.errorbatch = val;
    })
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthrray()
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {

        setTimeout(() => {
          this.getAuthrray()
        }, 500);
      })
    }

    var self = this
    $(document).on('keydown', '#batch-list .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);

    })
    $(document).on('click', '#batch-list tbody tr', function (event) {
      self.dataEntryService.showBatchBackBtn = true
    })
    this.batchSearchForm = new FormGroup({
      'batchNo': new FormControl(),
      'batchStatus': new FormControl(),
      'claim': new FormControl(),
      'showHeldClaims': new FormControl(),
      'showClaimsRejectionCode': new FormControl(),
      'claimItemNo': new FormControl(),
      'claimantPhnNo': new FormControl(),
      'uliNo': new FormControl(),
      'serviceDate': new FormControl(),
      'claimDate': new FormControl(),
      'claimEntryDate': new FormControl()
    });

    /// This is used for Batch-List
    var tableId = "batch-list"
    var URL = DataEntryApi.getBatchSearchList;
    var reqParam = ''
    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
    ]
    this.arrBatchStatus = [
      { 'id': 'U', 'name': 'Unsubmitted' },
      { 'id': 'S', 'name': 'Submitted' },
      { 'id': 'R', 'name': 'Rejected' },
      { 'id': 'A', 'name': 'Accepted' },
      { 'id': 'P', 'name': 'Partially Accepted' },
    ]

    for (var i = 0; i < this.arrBatchStatus.length; i++) {

      this.arrBatchStatusItem.push({ 'id': this.arrBatchStatus[i].id, 'itemName': this.arrBatchStatus[i].name })

    }
    this.multiSelectDropdownSettings = Constants.multiSelectBatchDropdown;

    // when we fill into the batch search fields and search then go to view page and Back to search, it doesnt show wrong data in fields now.
    $(document).on('click','#batch-list.table tbody',function(e){
      self.fieldsArrayNew = []
      self.fieldsArrayNew = [
        { 'key': 'batch', 'value': self.batchSearchForm.value.batchNo },
        { 'key': 'status', 'value': self.claimStatus },
        { 'key': 'claim', 'value': self.batchSearchForm.value.claim },
        { 'key': 'batchDate', 'value': '' },
        { 'key': 'claimStatus', 'value': '' },
        { 'key': 'claimItem', 'value': self.batchSearchForm.value.claimItemNo },
        { 'key': 'claimantPhn', 'value': self.batchSearchForm.value.claimantPhnNo },
        { 'key': 'uli', 'value': self.batchSearchForm.value.uliNo },
        { 'key': 'serviceDate', 'value': self.batchSearchForm.value.serviceDate != null ? self.changeDateFormatService.convertDateObjectToString(self.batchSearchForm.value.serviceDate) : '', },
        { 'key': 'claimDate', 'value': self.batchSearchForm.value.claimDate != null ? self.changeDateFormatService.convertDateObjectToString(self.batchSearchForm.value.claimDate) : '' },
        { 'key': 'claimEntryDate', 'value': self.batchSearchForm.value.claimEntryDate != null ? self.changeDateFormatService.convertDateObjectToString(self.batchSearchForm.value.claimEntryDate) : '' }
      ] 
      self.backToSearchNewData = true      
      self.onSubmit()   
    })

  }
  datatTableIntialize() {
    this.showLoader = true;
    // Get Tranlation of columns by Using Observable Method
    this.observableObj = Observable.interval(1000).subscribe(value => {
      if (this.check = true) {
        if ('dataEntry.batch-search.batch' == this.translate.instant('dataEntry.batch-search.batch')) {
        }
        else {
          this.columns = [
            { title: this.translate.instant('dataEntry.batch-search.batch'), data: 'batch' },
            { title: this.translate.instant('dataEntry.batch-search.batchStatus'), data: 'batchStatusDef' }, 
            { title: this.translate.instant('dataEntry.batch-search.batchDate'), data: 'batchDate' },
            { title: this.translate.instant('dataEntry.batch-search.claimNo'), data: 'claimNumber' },// log 793 
            { title: this.translate.instant('dataEntry.batch-search.claimItemNo'), data: 'claimitem' },
            { title: this.translate.instant('dataEntry.batch-search.claimStatus'), data: 'claimStatusDef' },
            { title: this.translate.instant('dataEntry.batch-search.assessAc'), data: 'assess_Ac' },
            { title: this.translate.instant('dataEntry.batch-search.phn'), data: 'claimantPhn' },
            { title: this.translate.instant('dataEntry.batch-search.uli'), data: 'uli' },
            { title: this.translate.instant('dataEntry.batch-search.claimDate'), data: 'claimDate' },
            { title: this.translate.instant('dataEntry.batch-search.serviceDate'), data: 'serviceDate' },
            { title: this.translate.instant('dataEntry.batch-search.createdOn'), data: 'createdOn' }
          ]
          this.check = false;
          this.observableObj.unsubscribe();
          if (this.dataEntryService.batchSearchData && this.dataEntryService.isBackToBatchSearch || this.dataEntryService.isBackToClaimSearch) {
            this.batchSearchForm.patchValue(this.dataEntryService.batchSearchData)
            this.dataEntryService.isBackToBatchSearch = false
            this.dataEntryService.isBackToClaimSearch = false
            if (this.dataEntryService.selectedBatchStatus.length > 0) {
              this.batchStatus = this.dataEntryService.selectedBatchStatus
            }
            if (this.selectedBatchStatus.length != null) {
              this.selectedBatchStatus = this.dataEntryService.batchSearchData.batchStatus
            }
            // Fix batch status issue related to Count bar
            if (this.dataEntryService.batchSearchData.batchStatus == null && this.dataEntryService.batchSearchData.batchNo == null
              && this.dataEntryService.batchSearchData.claim == null && this.dataEntryService.batchSearchData.showHeldClaims == null
              && this.dataEntryService.batchSearchData.showClaimsRejectionCode == null && this.dataEntryService.batchSearchData.claimItemNo == null
              && this.dataEntryService.batchSearchData.claimantPhnNo == null && this.dataEntryService.batchSearchData.uliNo == null
              && this.dataEntryService.batchSearchData.serviceDate == null && this.dataEntryService.batchSearchData.claimDate == null
              && this.dataEntryService.batchSearchData.claimEntryDate == null) {
              this.selectedBatchStatus = ['U']
            }
            this.onSubmit()
          } else {
            this.claimStatus = ['U'];

            this.onSubmit(); // log 795

          }
        }
      }
    })
    this.showLoader = false;
  }

  getAuthrray() {
    let checkArray = this.currentUserService.authChecks['SBT']
    let searchClaim = this.currentUserService.authChecks['SBT'].filter(val => val.actionObjectDataTag == 'BTH230').map(data => data)
    let addClaim = this.currentUserService.authChecks['CLB'].filter(val => val.actionObjectDataTag == 'CLB231').map(data => data)
    checkArray.push(searchClaim[0])
    checkArray.push(addClaim[0])
    this.getAuthCheck(checkArray);
    this.datatTableIntialize()
  }
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.authCheck = [{
        "addClaims": 'T',
        "viewClaim": 'T',
        "searchClaim": 'T',
      }]
    }
    else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.authCheck = [{
        "addClaims": authCheck['SBT231'],
        "viewClaim": authCheck['SBT232'],
        "searchClaim": authCheck['BTH230'],
      }]
    }
  }
  // Submit Batch-Search Form
  onSubmit() {
    this.showBatchList = true
    let arr = []
    if (this.claimStatus.length > 0) {
      arr = this.claimStatus
    } 
    else {
      arr = this.selectedBatchStatus
    }
    if (arr) {
      if (arr.indexOf('U') != -1) {
        this.showCount = true;
      } else {
        this.showCount = false;
      }
    }


    if (this.dataEntryService.batchSearchData && this.dataEntryService.isBackToBatchSearch || this.dataEntryService.isBackToClaimSearch) {
      this.batchSearchForm.patchValue(this.dataEntryService.batchSearchData)
    }

    //on first load issue 
    this.columns = [
      { title: this.translate.instant('dataEntry.batch-search.batch'), data: 'batch' },
      { title: this.translate.instant('dataEntry.batch-search.batchStatus'), data: 'batchStatusDef' }, // batchStatus 
      { title: this.translate.instant('dataEntry.batch-search.batchDate'), data: 'batchDate' },
      { title: this.translate.instant('dataEntry.batch-search.claimNo'), data: 'claimNumber' },// log 793 
      { title: this.translate.instant('dataEntry.batch-search.claimItemNo'), data: 'claimitem' },
      { title: this.translate.instant('dataEntry.batch-search.claimStatus'), data: 'claimStatusDef' },
      { title: this.translate.instant('dataEntry.batch-search.assessAc'), data: 'assess_Ac' },
      { title: this.translate.instant('dataEntry.batch-search.phn'), data: 'claimantPhn' },
      { title: this.translate.instant('dataEntry.batch-search.uli'), data: 'uli' },
      { title: this.translate.instant('dataEntry.batch-search.claimDate'), data: 'claimDate' },
      { title: this.translate.instant('dataEntry.batch-search.serviceDate'), data: 'serviceDate' },
      { title: this.translate.instant('dataEntry.batch-search.createdOn'), data: 'createdOn' }
    ]
    var reqParam = [
      { 'key': 'batch', 'value': this.batchSearchForm.value.batchNo },
      { 'key': 'status', 'value': arr },
      { 'key': 'claim', 'value': this.batchSearchForm.value.claim },
      { 'key': 'batchDate', 'value': '' },
      { 'key': 'claimStatus', 'value': '' },
      { 'key': 'claimItem', 'value': this.batchSearchForm.value.claimItemNo },
      { 'key': 'claimantPhn', 'value': this.batchSearchForm.value.claimantPhnNo },
      { 'key': 'uli', 'value': this.batchSearchForm.value.uliNo },
      { 'key': 'serviceDate', 'value': this.batchSearchForm.value.serviceDate != null ? this.changeDateFormatService.convertDateObjectToString(this.batchSearchForm.value.serviceDate) : '', },
      { 'key': 'claimDate', 'value': this.batchSearchForm.value.claimDate != null ? this.changeDateFormatService.convertDateObjectToString(this.batchSearchForm.value.claimDate) : '' },
      { 'key': 'claimEntryDate', 'value': this.batchSearchForm.value.claimEntryDate != null ? this.changeDateFormatService.convertDateObjectToString(this.batchSearchForm.value.claimEntryDate) : '' }
    ]

    if (this.backToSearchNewData) {
      reqParam = []
      reqParam = this.fieldsArrayNew    
    }    
    if (this.selectOrDeselectEvent) {
      this.selectedBatchStatus = []      
    }

    var URL = DataEntryApi.getBatchSearchList;
    var params = ''
    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
    ]
    var tableId = "batch-list"
    if (!$.fn.dataTable.isDataTable('#batch-list')) {
      this.dataTableService.jqueryDataTable(tableId, URL, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, [2, 9, 10, 11], this.authCheck[0].viewClaim, '', [1, 2, 3, 4, 5, 6, 7, 8, 9])
      this.claimStatus = [];
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam);
      this.claimStatus = [];
    }
    let selectedBatchStatus = []

    if (this.selectedBatchStatus && this.selectedBatchStatus.length > 0) {
      if (this.selectedBatchStatus.length > 1) {

        for (var i = 0; i < this.selectedBatchStatus.length; i++) {
          let singleSelected = this.arrBatchStatusItem.filter(val => val.id == this.selectedBatchStatus[i]).map(data => data)
          selectedBatchStatus.push(singleSelected[0])
        }
      } else {
        selectedBatchStatus = this.arrBatchStatusItem.filter(val => val.id == this.selectedBatchStatus).map(data => data)
      }
      this.dataEntryService.getBatchSearchData(this.batchSearchForm.value, selectedBatchStatus)
    }

    else
      this.dataEntryService.getBatchSearchData(this.batchSearchForm.value, selectedBatchStatus)


  }


  // Date-Format for Upper Search
  changeDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      // Set Date Picker Value
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.batchSearchForm.patchValue(datePickerValue);
    }
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

  // Reset batch-Search Form
  resetSearchBatchForm() {
    this.batchSearchForm.reset();
    this.batchStatus = []
    this.selectedBatchStatus = []
    this.onSubmit(); // To perform reset functionality for Upper Search 
  }

  // Search Listing for Batches
  searchBatchList(tableId: string) {
    var params = this.dataTableService.getFooterParams("batch-list");
    var dateParams = [2, 9, 10, 11];
    if (params[1].value == null) {
      var batchStatus = { 'key': 'status', 'value': [] }
    } else {
      var batchStatus = { 'key': 'status', 'value': [params[1].value] }
    }

    params.push(batchStatus);
    var URL = DataEntryApi.getBatchSearchList;
    this.dataTableService.jqueryDataTableReload("batch-list", URL, params, dateParams)
  }

  // Reset Listing for Batches
  resetBatchListFilter() {
    this.showCount = false
    this.dataTableService.resetTableSearch();
    this.searchBatchList("batch-list");
    $('#batch-list .icon-mydpremove').trigger('click');
  }

  onSelect(item: any, type) {
    if (type == 'batchStatus') {
      this.selectedBatchStatus = []
      for (var j = 0; j < this.batchStatus.length; j++) {
        this.selectedBatchStatus.push(this.batchStatus[j]['id'])
      }
      this.batchSearchForm.controls[type].setValue(this.selectedBatchStatus);
    }
    this.selectOrDeselectEvent = false
  }

  onDeSelect(item: any, type) {
    this.selectedBatchStatus = []
    if (this.batchStatus.length > 0) {
      for (var j = 0; j < this.batchStatus.length; j++) {
        this.selectedBatchStatus.push(this.batchStatus[j]['id'])
      }
    }
    this.selectOrDeselectEvent = true
  }

  onSelectAll(items: any, type) {
    if (type == 'batchStatus') {
      this.selectedBatchStatus = []
      for (var i = 0; i < this.arrBatchStatus.length; i++) {
        this.selectedBatchStatus.push(this.arrBatchStatus[i]['id'])
      }
      this.batchSearchForm.controls[type].setValue(this.selectedBatchStatus);
    }
  }

  onDeSelectAll(items: any, type) {
    this.selectedBatchStatus = []
  }


  /**
 * filter the search on press enter
 * @param event 
 * @param tableId 
 */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchBatchList(tableId);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $("#batchSearch_search").trigger("click");
    }, 500);

  }
}

