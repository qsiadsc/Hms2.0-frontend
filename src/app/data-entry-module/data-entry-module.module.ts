import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MyDatePickerModule } from 'mydatepicker';
import { SharedModule }     from '../shared/shared.module';
import { CommonModuleModule} from './../common-module/common-module.module';
import { DataEntryModuleComponent } from './../data-entry-module/data-entry-module.component';
import { ClaimsComponent } from './claims/claims.component';
import { DataEntryService} from './data-entry.service'
import { DataEntryModuleRoutingModule } from './../data-entry-module/data-entry-module-routing.module';
import { ClaimInformationComponent } from './claims/claim-information/claim-information.component';
import { BatchSearchComponent } from './batch-search/batch-search.component';
import { ClaimsSearchComponent } from './claims-search/claims-search.component';
import { ProviderSearchComponent } from './provider-search/provider-search.component';
import { Ng2CompleterModule } from "ng2-completer";
import { DentistInfoComponent } from './dentist-info/dentist-info.component';
import { DataEntryHeaderComponent } from './data-entry-header/data-entry-header.component';
import { ClaimItemComponent } from './claims/claim-item/claim-item.component';
import { ReportingComponent } from './reporting/reporting.component';
import { DataEntryAccountComponent } from './data-entry-account/data-entry-account.component';
import { DataEntryDashboardComponent } from './data-entry-dashboard/data-entry-dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataEntryReportComponent } from './data-entry-report/data-entry-report.component';
import { GenericTableModule } from '@angular-generic-table/core';
import { BatchBalanceReportComponent } from './batch-balance-report/batch-balance-report.component';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete'; 
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CommonModuleModule,
    Ng2CompleterModule,
    FormsModule,
    ReactiveFormsModule,
    DataEntryModuleRoutingModule,
    MyDatePickerModule,
    NgbModule,
    GenericTableModule,
    Ng2AutoCompleteModule
  ],
  declarations: [DataEntryModuleComponent, ClaimInformationComponent, ClaimsComponent,BatchSearchComponent, 
    ClaimsSearchComponent, ProviderSearchComponent, DentistInfoComponent, DataEntryHeaderComponent,
    ClaimItemComponent, ReportingComponent, DataEntryAccountComponent, DataEntryDashboardComponent, DataEntryReportComponent, BatchBalanceReportComponent],
  providers:    [DataEntryService],
})
export class DataEntryModuleModule { }