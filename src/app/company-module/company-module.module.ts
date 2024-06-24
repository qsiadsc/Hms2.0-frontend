import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { CompanyModuleRoutingModule } from './company-module-routing.module'; // 
import { DataTablesModule } from 'angular-datatables';
import { SearchCompanyDatatableComponent } from './search-company-datatable/search-company-datatable.component'; // Added Search Company Datatable Component for showing
import { CompanyFinancialDataComponent } from './company-financial-data/company-financial-data.component';
import { CompanyTabDatatableComponent } from './company-tab-datatable/company-tab-datatable.component'; // Added Company Financial Data Component
import { TextMaskModule } from 'angular2-text-mask';
import { CompanyFormComponent } from './company-form/company-form.component';

import { CompanyListComponent } from './company-list/company-list.component';
import { CompanySearchFilterComponent } from './company-search-filter/company-search-filter.component';

import { CompanyModuleComponent } from './company-module.component';
import { SharedModule } from '../shared/shared.module';

// Import Datepicker module
import { MyDatePickerModule } from 'mydatepicker';
import { CompanyBankAccountComponent } from './company-bank-account/company-bank-account.component';
import { BrokerAddComponent } from './broker-add/broker-add.component';
import { BrokerCompanyComponent } from './broker-company/broker-company.component';
import { BrokerEditComponent } from './broker-edit/broker-edit.component';
import { BrokerListComponent } from './broker-list/broker-list.component';
import { BrokerSearchComponent } from './broker-search/broker-search.component';
import { CompanyGeneralInformationComponent } from './company-general-information/company-general-information.component'
import { CommonModuleModule } from './../common-module/common-module.module';
import { CardServiceService } from '../card-module/card-service.service';
import { CompanyTravelInsuranceComponent } from './company-travel-insurance/company-travel-insurance.component'
import { CompanyService } from './company.service';

import { PlanComponent } from './plan/plan.component';
import { PlanInfoComponent } from './plan/plan-info/plan-info.component';
import { BenefitsComponent, EffectiveDateComponent, ExpiredDateComponent } from './plan/benefits/benefits.component';
import { DivisionMaxComponent } from './plan/division-max/division-max.component';
import { RulesComponent } from './plan/rules/rules.component';
import { FeeGuideComponent } from './plan/fee-guide/fee-guide.component';
import { PreviewComponent } from './plan/preview/preview.component';
// Generic Datatable
import { GenericTableModule } from '@angular-generic-table/core';

import { HistoryIconsComponent } from './plan/history-icons/history-icons.component';
import { PlanViewComponent } from './plan/plan-view/plan-view.component';
import { PlanFrequenciesComponent } from './plan/plan-frequencies/plan-frequencies.component';
import { TreeTableComponent } from './tree-table/tree-table.component';
import { TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PlanModule } from '../company-module/plan/plan.module';
import { Ng2CompleterModule } from "ng2-completer";
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { NgxPaginationModule } from 'ngx-pagination';
import { SalesDataComponent } from './sales-data/sales-data.component';
import { CompanyUploadDocumentComponent } from './company-upload-document/company-upload-document.component'; // importing the sorting package here
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FindProcComponent } from './plan/find-proc/find-proc.component';
import { RuleListComponent } from './plan/rule-list/rule-list.component';
import { VisionPlanCoverageComponent } from './plan/vision-plan-coverage/vision-plan-coverage.component'
import { HealthPlanCoverageComponent } from './plan/health-plan-coverage/health-plan-coverage.component';
import { AmendmentWizardComponent } from './plan/amendment-wizard/amendment-wizard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    CompanyModuleRoutingModule,
    DataTablesModule,
    TextMaskModule,
    SharedModule,
    MyDatePickerModule,
    CommonModuleModule,
    GenericTableModule,
    TreeTableModule,
    AngularMultiSelectModule,
    NgxDatatableModule,
    Ng2CompleterModule,
    NgxPaginationModule, // importing the sorting package here
    PdfViewerModule
  ],
  declarations: [SearchCompanyDatatableComponent, CompanyFinancialDataComponent, TreeTableComponent, CompanyTabDatatableComponent, CompanyFormComponent, CompanyListComponent, CompanySearchFilterComponent, CompanyModuleComponent, CompanyBankAccountComponent, BrokerAddComponent, BrokerCompanyComponent, BrokerEditComponent, BrokerListComponent, BrokerSearchComponent, CompanyGeneralInformationComponent, CompanyTravelInsuranceComponent, PlanComponent, PlanInfoComponent, BenefitsComponent, EffectiveDateComponent, ExpiredDateComponent, DivisionMaxComponent, RulesComponent, FeeGuideComponent, PreviewComponent, PlanViewComponent, PlanFrequenciesComponent, HistoryIconsComponent, SalesDataComponent, CompanyUploadDocumentComponent,FindProcComponent,RuleListComponent,VisionPlanCoverageComponent,HealthPlanCoverageComponent,AmendmentWizardComponent
  ],
  providers: [CardServiceService, CompanyService, CanDeactivateGuard]
})
export class CompanyModuleModule { }