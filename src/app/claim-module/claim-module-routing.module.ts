import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClaimModuleComponent } from './claim-module.component';
import { SearchClaimComponent } from './search-claim/search-claim.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';

const routes: Routes = [
  { path: '', component: ClaimModuleComponent, pathMatch: 'full',canDeactivate: [CanDeactivateGuard]  },
  { path: 'view/:id/type/:type', component: ClaimModuleComponent,canDeactivate: [CanDeactivateGuard] },
  { path: 'copy/:copyKey', component: ClaimModuleComponent,canDeactivate: [CanDeactivateGuard] },
  { path: 'view/:id/type/:type/reviewer/:reviewerKey', component: ClaimModuleComponent },
  { path: 'view/:id/type/:type/dcp/:dcpKey', component: ClaimModuleComponent },
  { path: 'view/:id/type/:type/readjudicate', component: ClaimModuleComponent },
  { path: 'searchClaim', component: SearchClaimComponent },
  { path: 'searchClaim/:type', component: SearchClaimComponent },
  { path: 'view/:id/type/:type/preAuth', component: ClaimModuleComponent,canDeactivate: [CanDeactivateGuard] },
  { path: 'view/:id/type/:type/preAuthReview', component: ClaimModuleComponent,canDeactivate: [CanDeactivateGuard] },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimModuleRoutingModule { }
