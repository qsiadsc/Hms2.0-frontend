import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceProviderModuleComponent } from './service-provider-module.component'
import { SearchServiceProviderComponent } from './search-service-provider/search-service-provider.component';
import { ServiceProviderModuleRoutingModule } from './service-provider-module-routing.module';
import { GeneralInformationComponent } from './general-information/general-information.component'
import { SharedModule }     from '../shared/shared.module';
import { CommonModuleModule} from './../common-module/common-module.module';
import { BillingAddressComponent } from './billing-address/billing-address.component'
import { ServiceProviderService} from './serviceProvider.service';
import { SearchBanComponent } from './search-ban/search-ban.component'
import { EligibilityHistoryComponent } from './eligibility-history/eligibility-history.component';
import { SpecialityComponent } from './speciality/speciality.component'
import { BanBankAccountComponent } from './billing-address/ban-bank-account/ban-bank-account.component';
import { GlobalApprovalComponent } from './global-approval/global-approval.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { Ng2CompleterModule } from "ng2-completer";

@NgModule({
  imports: [ CommonModule,CommonModuleModule,ServiceProviderModuleRoutingModule,SharedModule,Ng2CompleterModule],
  declarations: [SearchServiceProviderComponent,ServiceProviderModuleComponent, GeneralInformationComponent, BillingAddressComponent, EligibilityHistoryComponent, SpecialityComponent,
  EligibilityHistoryComponent,SearchBanComponent, BanBankAccountComponent, GlobalApprovalComponent],
  providers: [ServiceProviderService,CanDeactivateGuard]
})

export class ServiceProviderModule { }
