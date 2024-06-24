import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DomainModuleComponent } from './domain-module.component';
import { CanDeactivateGuard } from '../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { DomainInfoComponent } from './domain-info/domain-info.component';

const routes: Routes = [
  { path: '', component: DomainModuleComponent, pathMatch: 'full' },
  { path: 'domainInfo', component: DomainInfoComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DomainModuleRoutingModule { }
