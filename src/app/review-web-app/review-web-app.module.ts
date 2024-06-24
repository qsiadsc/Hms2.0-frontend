import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule }     from '../shared/shared.module';
import { CommonModuleModule} from './../common-module/common-module.module';
import { ReviewWebAppRoutingModule } from './review-web-app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReviewClaimComponent } from './review-claim/review-claim.component';
import { ReviewReportComponent } from './review-report/review-report.component';
import { ReviewAccountComponent } from './review-account/review-account.component';
import { ReviewAppService } from './reviewApp.service';
import { ClaimService} from '../claim-module/claim.service'
import { Ng2CompleterModule } from "ng2-completer";
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';

@NgModule({
  imports: [
    CommonModule,
    ReviewWebAppRoutingModule,
    SharedModule,
    CommonModuleModule,
    Ng2CompleterModule,Ng2AutoCompleteModule
  ],
  declarations: [DashboardComponent, ReviewClaimComponent, ReviewReportComponent, ReviewAccountComponent],
  providers: [ReviewAppService,ClaimService] 
})
export class ReviewWebAppModule { }
