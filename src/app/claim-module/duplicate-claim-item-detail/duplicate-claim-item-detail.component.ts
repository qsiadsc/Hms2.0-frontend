import { Component, OnInit, Input, QueryList, ViewChildren } from '@angular/core';
import { ClaimService } from '../claim.service';
import { CurrencyPipe } from '@angular/common';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { ToastrService } from 'ngx-toastr'; //add toster service
import { Subject } from 'rxjs/Subject';
import { Constants } from '../../common-module/Constants'
import { ClaimApi } from '../claim-api'
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-duplicate-claim-item-detail',
  templateUrl: './duplicate-claim-item-detail.component.html',
  styleUrls: ['./duplicate-claim-item-detail.component.css'],
  providers: [CurrencyPipe]
})
export class DuplicateClaimItemDetailComponent implements OnInit {

  claimMsgAddMode
  @Input() claimItems: any[];
  @Input() claimData: any;
  @Input() discipline: any;
  @Input() customComments: any = [];
  dtOptions: DataTables.Settings[] = [];

  dtTrigger: Subject<any>[] = [];
  disciplineKey: any;
  claimId: any;
  systemMessage: any = [];
  dtElements: QueryList<any>;
  claimComment: any;
  

  constructor(
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private claimService: ClaimService,
    private cp: CurrencyPipe,
    private currentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private dataTableService: DatatableService,

  ) { }

  ngOnInit() {

  }

  convertToUsd(amount): string {
    return this.cp.transform(amount, 'USD');

  }

  convertDate(value): string {
    return this.changeDateFormatService.changeDateByMonthName(value);
  }

  continue() {
    this.claimService.openDuplicateDialog.emit(true);
  }

  cancel() {
    this.claimService.openDuplicateDialog.emit(false);
  }
  mouseEnter(pid) {
  }
  openClaim(claimKey, disciplineKey, dcpKey, pid,amt) {
    this.claimService.filterComments.emit({"pid":pid,"amt":amt})
  }
  onCheckCheque() {

    let dcpKey = this.claimItems[0].dcpKey

    let disciplineCD = this.claimService.disciplineConversion(this.claimData.disciplineName)
    let claimId = this.claimData.claimKey;
    let payeeTypeDesc = this.claimData.payeeTypeDesc
    if (this.claimData.claimStatusCd == 'P' && dcpKey != 0) {
      let params = {
        'businessType': this.claimData.bussinessType,
        'discipline': disciplineCD || '',
        'claimKey': claimId,
        'payee': this.claimData.payeeTypeName,
        'fromClaim': false,
        'claimAttachedCheck': 'T',
        'cardNumber': this.claimData.cardNumber
      }
      this.currentUserService.transactionQueryParams = params

      window.open('/finance/transaction-search/transactionDetails?disc=' + disciplineCD + '&dcp=' + dcpKey)
    } else {
      this.toastrService.warning('No Cheque Available for This Claim')
    }

  }

  ngAfterViewInit(): void {
   
  }

}
