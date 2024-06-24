import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DataEntryModuleComponent } from './data-entry-module.component';
import { ClaimsComponent } from './../data-entry-module/claims/claims.component';
import { BatchSearchComponent } from './../data-entry-module/batch-search/batch-search.component'; 
import { ClaimsSearchComponent} from './../data-entry-module/claims-search/claims-search.component';
import { ProviderSearchComponent} from './../data-entry-module/provider-search/provider-search.component';
import { DataEntryDashboardComponent } from './data-entry-dashboard/data-entry-dashboard.component';

import { DentistInfoComponent } from './dentist-info/dentist-info.component';
import { DataEntryHeaderComponent } from './data-entry-header/data-entry-header.component';
import { ReportingComponent } from './reporting/reporting.component';
import { DataEntryAccountComponent } from './data-entry-account/data-entry-account.component';
import { DataEntryReportComponent } from './data-entry-report/data-entry-report.component';
import { BatchBalanceReportComponent } from './batch-balance-report/batch-balance-report.component';

const routes: Routes = [
  { path: '', component: BatchSearchComponent, pathMatch: 'full' },
  { path: 'claims', component: ClaimsComponent },
  { path: 'dashboard', component: DataEntryDashboardComponent },
  { path: 'search/claim', component: BatchSearchComponent},
  { path: 'search/batch', component: BatchSearchComponent},
  
  { path: 'provider-search', component: ProviderSearchComponent},
  { path: 'claims/view/:id', component: ClaimsComponent },
  { path: 'claims/view/:id/RedirectNew/:check', component: ClaimsComponent },

  { path: 'dentist', component: DentistInfoComponent },
  { path: 'dentist/view/:id', component: DentistInfoComponent },
  { path: 'paymentDetails', component: ReportingComponent},
  { path: 'account', component: DataEntryAccountComponent},
  { path: 'claims/copy/:copyKey', component: ClaimsComponent},
  { path: 'reports', component: DataEntryReportComponent},
  { path: 'batchBalanceReport', component: BatchBalanceReportComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataEntryModuleRoutingModule { }