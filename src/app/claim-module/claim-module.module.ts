import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimModuleRoutingModule } from './claim-module-routing.module';
import { GeneralInformationComponent } from './general-information/general-information.component';
import { ClaimTypeComponent } from './claim-type/claim-type.component';
import { ClaimModuleComponent } from './claim-module.component';
import { SharedModule }     from '../shared/shared.module';
import { CardHolderComponent } from './card-holder/card-holder.component';
import { CommonModuleModule} from './../common-module/common-module.module';
import { ServiceProvidersComponent } from './service-providers/service-providers.component';
import { SearchClaimComponent } from './search-claim/search-claim.component';
import { ClaimMessageComponent } from './claim-message/claim-message.component';
import { ClaimItemComponent } from './claim-item/claim-item.component';
import { ClaimTotalComponent } from './claim-total/claim-total.component';
import { ClaimItemDentalComponent } from './claim-item/claim-item-dental/claim-item-dental.component';
import { ClaimItemVisionComponent } from './claim-item/claim-item-vision/claim-item-vision.component'; 
import { ClaimService} from './claim.service'
import { PayToOtherComponent } from './pay-to-other/pay-to-other.component';
import { ReviewClaimComponent } from './review-claim/review-claim.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Ng2CompleterModule } from "ng2-completer";
import { ReviewAppService } from '../review-web-app/reviewApp.service'
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DuplicateClaimItemComponent } from './duplicate-claim-item/duplicate-claim-item.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TrackClaimComponent } from './track-claim/track-claim.component';
import { DuplicateClaimItemDetailComponent } from './duplicate-claim-item-detail/duplicate-claim-item-detail.component';
import { DuplicateClaimListComponent } from './duplicate-claim-list/duplicate-claim-list.component';
import { DuplicateClaimItemListingComponent } from './duplicate-claim-item-detail/duplicate-claim-item-listing/duplicate-claim-item-listing.component';

@NgModule({
  imports:      [CommonModule,SharedModule,ClaimModuleRoutingModule,CommonModuleModule,
                 PdfViewerModule,Ng2CompleterModule,Ng2AutoCompleteModule,NgbModule],

  declarations: [GeneralInformationComponent, ClaimTypeComponent, ClaimModuleComponent,CardHolderComponent,
                 ServiceProvidersComponent, SearchClaimComponent, ClaimMessageComponent, ClaimItemComponent,
                 ClaimItemDentalComponent, ClaimTotalComponent, ClaimItemVisionComponent, PayToOtherComponent,
                 ReviewClaimComponent, DuplicateClaimItemComponent, TrackClaimComponent, DuplicateClaimItemDetailComponent, DuplicateClaimListComponent, DuplicateClaimItemListingComponent
                 ],

  providers:    [ClaimService,ReviewAppService,CanDeactivateGuard,DuplicateClaimItemDetailComponent],
  entryComponents: [DuplicateClaimItemComponent]
  
})
export class ClaimModule { }
