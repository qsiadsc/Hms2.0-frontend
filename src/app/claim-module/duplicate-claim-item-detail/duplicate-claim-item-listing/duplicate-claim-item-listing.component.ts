import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Constants } from '../../../common-module/Constants'
import { ClaimApi } from '../../claim-api'
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ClaimService } from '../../claim.service';

@Component({
  selector: 'app-duplicate-claim-item-listing',
  templateUrl: './duplicate-claim-item-listing.component.html',
  styleUrls: ['./duplicate-claim-item-listing.component.css']
})
export class DuplicateClaimItemListingComponent implements OnInit {
  claimItems 
  @Input() customComments: any = [];
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElement: DataTableDirective;
  systemMessage: any[];
  claimComment: any[];
  disciplineKey: string;
  claimId: string;
  claimMsgAddMode = false
  dtElements: QueryList<any>;



  constructor(
    private hmsDataService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private claimService: ClaimService,

  ) {
    this.claimService.filterComments.subscribe(data => {
      this.filterClaim(data)
    })
    this.claimService.dupClaimItems.subscribe(data => {
    
      if(data.items && data.items.length>0){
this.claimItems= {
    "amt":data.items[0].itemTotalPaidAmt,
    "pid":data.items[0].itemProcedureCd
  }
      
      }
    })

  }

  ngOnInit() {
    this.dtOptions['claim-system-message-view'] = Constants.dtOptionsConfig;
    this.dtTrigger['claim-system-message-view'] = new Subject();
    this.dtOptions['claim-comments-view'] = Constants.dtOptionsConfig;
    this.dtTrigger['claim-comments-view'] = new Subject();
    this.dtOptions['custom-comments-view'] = Constants.dtOptionsConfig
    this.dtTrigger['custom-comments-view'] = new Subject();
  }

  ngAfterViewInit(): void {
    this.dtTrigger['custom-comments-view'].next()
    this.dtTrigger['claim-comments-view'].next()
    this.dtTrigger['claim-system-message-view'].next()
    
  }
  destroyAll() {
    if ($.fn.dataTable.isDataTable('#claim-system-message-view')) {
      $('#claim-system-message-view').DataTable().destroy();
      this.dtTrigger['claim-system-message-view'].next()

    }
    if ($.fn.dataTable.isDataTable('#claim-comments-view')) {
      $('#claim-comments-view').DataTable().destroy();
      this.dtTrigger['claim-comments-view'].next()


    }
    if ($.fn.dataTable.isDataTable('#custom-comments-view')) {
      $('#custom-comments-view').DataTable().destroy();
      this.dtTrigger['custom-comments-view'].next()

    }
  }

  getSystemMessages(disciplineKey = null, claimId = null) {
    this.destroyAll()
    


    this.systemMessage = [];
    this.customComments = [];
    this.claimComment = [];


    this.disciplineKey = localStorage.getItem("disciplineKey");
    this.claimId = localStorage.getItem("claimId");
    if (this.claimId && this.claimId != '') {
      this.GetClaimComments(disciplineKey, this.claimId, "ClaimComment")
      this.getClaimItemMessageList()
      if (this.disciplineKey && this.claimId) {
        var reqParam = {
          "discipline": +this.disciplineKey,
          "claimKey": +this.claimId,
        }
        this.hmsDataService.postApi(ClaimApi.getSystemMessages, reqParam).subscribe(data => {
          this.systemMessage = []
          if (data.code == 200 && data.status == "OK") {        
            let arrays = []
            if (this.claimItems && this.claimItems.amt == 0) {
              let self = this
              arrays = data.result.filter(function (e) {
                return e.procdeureCode == self.claimItems.pid;
              });
            } else {
              arrays = data.result
            }
            this.systemMessage = arrays

            if (this.systemMessage.length <= 0) {
              $('#claim-system-message-view .dataTables_empty').show()
            } else {
              $('#claim-system-message-view .dataTables_empty').hide()
            }
            this.reloadTable("claim-system-message-view")
          } else {
            this.systemMessage = []
          }
        })
      }
    }
  }
  reloadTable(tableId) {

    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  getClaimItemMessageList() {
    let userId = localStorage.getItem('id');
    let cliamLineItem = [];
    let cClaimitem = localStorage.getItem('cclaimItem');
    if (cClaimitem) {
      let tempItem = JSON.parse(cClaimitem).items;
      var lineNo
      for (let i = 0; i < tempItem.length; i++) {
        lineNo = i + 1;
        cliamLineItem.push({ 'id': tempItem[i].itemKey, 'itemName': "Line Item-" + lineNo + ' / ' + tempItem[i].itemProcedureCd });
      }
    }
    var reqParam = {
      "discipline": +this.disciplineKey,
      "claimKey": +this.claimId,
      "userId": +userId,
      "cliamLineItem": cliamLineItem
    }
    this.hmsDataService.postApi(ClaimApi.getClaimItemMessage, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.customComments = data.result;
        this.reloadTable("custom-comments-view")

      } else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.customComments = [];
        this.reloadTable("custom-comments-view")
      }

      if (this.customComments.length <= 0) {
        $('#custom-comments-view .dataTables_empty').show();
      } else {
        $('#custom-comments-view .dataTables_empty').hide()
      }
    })
  }
  GetClaimComments(disciplineKey, claimId, CommentType) {
 
    var userId = localStorage.getItem('id')
    if (CommentType == 'ClaimComment') {
      var reqParam = {
        "cardholderKey": +localStorage.getItem('cardholderKey'),
        "claimKey": +claimId,
        "providerKey": -1
      }
      this.hmsDataService.postApi(ClaimApi.getAllComments, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          if ($.fn.dataTable.isDataTable('#claim-comments-view')) {
            var table = $('#claim-comments-view').DataTable();
            table.destroy();
          }

          this.claimComment = data.result.data;
         
          this.reloadTable("claim-comments-view");
          

          setTimeout(() => {
            $("#claim-comments-view").find(".sorting_asc").removeClass("sorting_asc");
          }, 300);
        }
        else if (data.code == 404 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.claimComment = [];
          this.reloadTable("claim-comments-view")
        }
      })
    }
    else if (CommentType == 'CustomComment') {
      var reqParam1 = {
        "discipline": +disciplineKey,
        "claimKey": +claimId,
        "userId": +userId
      }
      this.hmsDataService.postApi(ClaimApi.getClaimItemMessage, reqParam1).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.customComments = data.result

          if (this.customComments.length <= 0) {
            $('#custom-comments-view .dataTables_empty').show();
          } else {
            $('#custom-comments-view .dataTables_empty').hide()
          }
          this.reloadTable("custom-comments-view")
        }
      })
    }
   

  }
  // log 833 scrool to comments section and filter comments 
  filterClaim(arr) {    
      if (this.disciplineKey && this.claimId) {
        var reqParam = {
          "discipline": +this.disciplineKey,
          "claimKey": +this.claimId,
        }
        this.hmsDataService.postApi(ClaimApi.getSystemMessages, reqParam).subscribe(data => {
          this.systemMessage = []
          if (data.code == 200 && data.status == "OK") {
            let arrays = []
            if (arr.amt == 0) {
              arrays = data.result.filter(function (e) {
                return e.procdeureCode == arr.pid;
              });
            } else {
              arrays = data.result
            }

            this.systemMessage = arrays
            this.reloadTable("claim-system-message-view")
          } else {
            this.systemMessage = []
          }
        })
      }  
  }
}
