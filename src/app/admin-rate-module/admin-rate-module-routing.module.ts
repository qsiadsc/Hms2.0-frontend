import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminRateModuleComponent } from './admin-rate-module.component'
import { AdminInfoComponent } from '../admin-rate-module/admin-info/admin-info.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';

const routes: Routes = [
  { path: '', component: AdminRateModuleComponent, pathMatch: 'full', canDeactivate: [CanDeactivateGuard] },
  { path: 'adminRate', component: AdminInfoComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminRateModuleRoutingModule { }