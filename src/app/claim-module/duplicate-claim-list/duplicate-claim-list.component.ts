import { Component, Input, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ClaimService } from '../claim.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
@Component({
  selector: 'app-duplicate-claim-list',
  templateUrl: './duplicate-claim-list.component.html',
  styleUrls: ['./duplicate-claim-list.component.css'],
  providers: [CurrencyPipe]

})
export class DuplicateClaimListComponent implements OnInit {
  @Input() listclaimItems: any[];
  @Input() listclaimData: any;
  @Input() listdiscipline: any;
  constructor(
    private toastrService: ToastrService,
    private changeDateFormatService: ChangeDateFormatService,
    private claimService: ClaimService,
    private cp: CurrencyPipe,
    private currentUserService: CurrentUserService,
  ) {

  }
  convertToUsd(amount): string {
    return this.cp.transform(amount, 'USD');

  }

  convertDate(value): string {
    return this.changeDateFormatService.changeDateByMonthName(value);
  }
  ngOnInit() {
  }
  continue(){

  }
  cancel(){}
}
