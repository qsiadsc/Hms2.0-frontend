import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { ReferToReviewModuleComponent } from './refer-to-review-module.component';

const routes: Routes = [
  { path: '', component: ReferToReviewModuleComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReferToReviewModuleRoutingModule { }
