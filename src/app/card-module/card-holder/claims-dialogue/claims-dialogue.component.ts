import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { Constants } from '../../../common-module/Constants';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardApi } from '../../card-api';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { DataTableDirective } from 'angular-datatables';
import { QueryList, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-claims-dialogue',
  templateUrl: './claims-dialogue.component.html',
  styleUrls: ['./claims-dialogue.component.css'],
  providers: [HmsDataServiceService, ChangeDateFormatService, DatatableService]
})

export class ClaimsDialogueComponent implements OnInit {
  @ViewChildren(DataTableDirective) dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {}
  dtTrigger: Subject<any>[] = [];
  showLoader = false;
  claimItems = []
  alberta: boolean = false;//for extra parameters in alberta theme
  cardHolderKey
  bussinesType: any;

  constructor(
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.cardHolderKey = '';
  }

  ngOnInit(): void {
    this.dtOptions['claimItemsTableD'] = Constants.dtOptionsSortingConfigClaimHistory
    this.dtTrigger['claimItemsTableD'] = new Subject();
    if (this.route.snapshot.params.cardholderKey) {
      this.cardHolderKey = this.route.snapshot.params.cardholderKey;
      this.bussinesType = this.route.snapshot.params.businessType;
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger['claimItemsTableD'].next();

    this.GetClaimItemsByIdCardHolderKey(this.cardHolderKey)
  }

  GetClaimItemsByIdCardHolderKey(cardHolderKey) {
    this.showLoader = true
    let submitData = {
      "cardholderKey": cardHolderKey
    }
    localStorage.setItem("cardholderKey", cardHolderKey)
    this.hmsDataService.postApi(CardApi.getClaimItemsByCardHolderKey, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showLoader = false
        this.claimItems = data.result;
        this.claimItems.map(r => {
          if (r.itemToothId == undefined || r.itemToothId == null) {
            r.itemToothId = -1
          }// log 854
        });
        var dateCols = ['itemServiceDt'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
      }
      else {
        this.claimItems = []
        this.showLoader = false
      }
      this.reloadTable('claimItemsTableD')
    })
  }

  reloadTable(tableId) {
    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  openClaim(claimKey, disciplineKey, dcpKey, claimItem) {
    this.route.params.subscribe((params: Params) => {
      localStorage.setItem("_cardId", params.id)
    })// issue 663
    this.hmsDataService.OpenCloseModal("btnCloseShowClaimItems");
    if (dcpKey > 0) {
      this.router.navigate(["/claim/view/" + claimKey + "/type/" + disciplineKey + "/dcp/" + dcpKey], { queryParams: { 'redirect': 'cardholder' } });
    } else {
      this.router.navigate(["/claim/view/" + claimKey + "/type/" + disciplineKey], { queryParams: { 'redirect': 'cardholder' } });
    }
  }
}