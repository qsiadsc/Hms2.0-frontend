import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanComponent } from './plan.component';

import { PlanInfoComponent } from './plan-info/plan-info.component';
import { PlanViewComponent } from './plan-view/plan-view.component';
import { FindProcComponent } from './find-proc/find-proc.component';
import { CanDeactivateGuard } from './../../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';


const routes: Routes = [   
  { path: '', component: PlanComponent,canDeactivate: [CanDeactivateGuard]},
  { path: ':/add', component: PlanComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanRoutingModule { }
