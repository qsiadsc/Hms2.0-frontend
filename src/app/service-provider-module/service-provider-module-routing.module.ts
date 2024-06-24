import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ServiceProviderModuleComponent } from './service-provider-module.component';
import { SearchServiceProviderComponent } from './search-service-provider/search-service-provider.component';
import { SearchBanComponent } from './search-ban/search-ban.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';

const routes: Routes = [
  { path: '', component: ServiceProviderModuleComponent, pathMatch: 'full',canDeactivate: [CanDeactivateGuard] },
  { path: 'search', component: SearchServiceProviderComponent },
  { path: 'searchBan', component: SearchBanComponent },
  { path: 'view/:id/type/:type', component: ServiceProviderModuleComponent,canDeactivate: [CanDeactivateGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceProviderModuleRoutingModule { }