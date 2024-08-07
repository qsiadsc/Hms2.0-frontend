import { NgModule } from '@angular/core';
import { CommonModuleModule } from './../common-module/common-module.module'
import { CardModuleRoutingModule } from './card-module-routing.module';
import { CardModuleComponent } from './card-module.component';
import { GeneralInformationComponent } from './general-information/general-information.component'
import { CardEligibilityComponent } from './card-eligibility/card-eligibility.component'
import { CardAddressComponent } from './card-address/card-address.component';
import { CardHolderComponent } from './card-holder/card-holder.component';
import { SearchCardHolderComponent } from './search-card-holder/search-card-holder.component'
import { SharedModule } from '../shared/shared.module';

import { CardHolderGeneralInformationComponent } from '../card-module/card-holder/card-holder-general-information/card-holder-general-information.component'
import { CardHolderRoleAssignedComponent } from '../card-module/card-holder/card-holder-role-assigned/card-holder-role-assigned.component';
import { CardBankAccComponent } from './card-bank-acc/card-bank-acc.component';
import { CardHolderCobComponent } from './card-holder/card-holder-cob/card-holder-cob.component';
import { CardHolderEligibilityComponent } from './card-holder/card-holder-eligibility/card-holder-eligibility.component';

import { CardServiceService } from './card-service.service'
import { CompanyService } from '../company-module/company.service'
import { CardHolderPopupComponent } from './card-holder-popup/card-holder-popup.component';
import { CardHolderPopupGeneralInformationComponent } from './card-holder-popup/card-holder-popup-general-information/card-holder-popup-general-information.component';
import { CardHolderHistoryPopupComponent } from './card-holder-history-popup/card-holder-history-popup.component';

import { CardHolderExpenseHistoryPopupComponent } from './card-holder-expense-history-popup/card-holder-expense-history-popup.component';
import { CardHolderVoucherHistoryPopupComponent } from './card-holder-voucher-history-popup/card-holder-voucher-history-popup.component';
import { TrusteeInformationComponent } from './trustee-information/trustee-information.component';
import { BenfiitCoverageCategoryMaximumComponent } from './card-eligibility/benfiit-coverage-category-maximum/benfiit-coverage-category-maximum.component';
import { CoverageCategoryMaximumComponent } from './card-eligibility/coverage-category-maximum/coverage-category-maximum.component';
import { CardMaximumsComponent } from './card-eligibility/card-maximums/card-maximums.component';
import { TopUpMaximumsComponent } from './card-eligibility/top-up-maximums/top-up-maximums.component';
import { EligibilityHistoryPopupComponent } from './card-holder/eligibility-history-popup/eligibility-history-popup.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { Ng2CompleterModule } from "ng2-completer";
import { ClaimsDialogueComponent } from './card-holder/claims-dialogue/claims-dialogue.component';
import { CardWellnessComponent } from './card-wellness/card-wellness.component';
@NgModule({
  imports: [
    CommonModuleModule,
    CardModuleRoutingModule,
    SharedModule,
    Ng2CompleterModule
  ],
  exports: [
    CardBankAccComponent
  ],
  declarations: [CardModuleComponent, GeneralInformationComponent, CardEligibilityComponent,
    CardAddressComponent, CardHolderComponent, SearchCardHolderComponent,
    CardHolderGeneralInformationComponent, CardHolderRoleAssignedComponent, SearchCardHolderComponent,
    CardBankAccComponent, CardHolderCobComponent, CardHolderEligibilityComponent,
    CardHolderPopupComponent, CardHolderPopupGeneralInformationComponent, CardHolderHistoryPopupComponent, CardHolderExpenseHistoryPopupComponent, CardHolderVoucherHistoryPopupComponent, TrusteeInformationComponent, BenfiitCoverageCategoryMaximumComponent, CardMaximumsComponent, TopUpMaximumsComponent,
    CoverageCategoryMaximumComponent,
    EligibilityHistoryPopupComponent,
    ClaimsDialogueComponent,
    CardWellnessComponent],
  providers: [CardServiceService, CanDeactivateGuard, CompanyService]

})

export class CardModuleModule { }