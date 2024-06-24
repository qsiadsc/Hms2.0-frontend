import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReviewWebAppComponent } from '../review-web-app/review-web-app.component';
import { DashboardComponent } from '../review-web-app/dashboard/dashboard.component';
import { ReviewClaimComponent } from '../review-web-app/review-claim/review-claim.component';
import { ReviewAccountComponent } from '../review-web-app/review-account/review-account.component';
import { ReviewReportComponent } from '../review-web-app/review-report/review-report.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'searchClaim', component: ReviewClaimComponent },
  { path: 'reports', component: ReviewAccountComponent },
  { path: 'accounts', component: ReviewReportComponent },
  { path: 'searchClaim/:type', component: ReviewClaimComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations:[],
  exports: [RouterModule]
})
export class ReviewWebAppRoutingModule { }
