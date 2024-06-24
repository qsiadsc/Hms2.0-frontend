import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanySearchFilterComponent } from './company-search-filter/company-search-filter.component';
import { CompanyModuleComponent } from './company-module.component';
// Broker Components
import { BrokerAddComponent } from './broker-add/broker-add.component';
import { BrokerSearchComponent } from './broker-search/broker-search.component';
import { BrokerEditComponent } from './broker-edit/broker-edit.component';

import { PlanComponent } from './plan/plan.component';
import { PlanInfoComponent } from './plan/plan-info/plan-info.component';
import { PlanViewComponent } from './plan/plan-view/plan-view.component';
import { PlanFrequenciesComponent } from './plan/plan-frequencies/plan-frequencies.component';
import { FindProcComponent } from './plan/find-proc/find-proc.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { VisionPlanCoverageComponent } from './plan/vision-plan-coverage/vision-plan-coverage.component';
import { HealthPlanCoverageComponent } from './plan/health-plan-coverage/health-plan-coverage.component';
import { AmendmentWizardComponent } from './plan/amendment-wizard/amendment-wizard.component';

const routes: Routes = [
  { path: 'add', component: CompanyModuleComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'view/:id', component: CompanyModuleComponent, canDeactivate: [CanDeactivateGuard] },
  { path: '', component: CompanySearchFilterComponent },
  // Broker Routes
  { path: 'broker-search', component: BrokerSearchComponent },
  { path: 'broker', component: BrokerSearchComponent },
  { path: 'broker/add', component: BrokerEditComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'broker/edit/:id', component: BrokerEditComponent },
  { path: 'plan/add', component: PlanComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'plan/copy-division', component: PlanComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'plan/add-division', component: PlanComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'plan/edit', component: PlanComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'plan/view', component: PlanViewComponent },
  { path: 'plan/frequencies', component: PlanFrequenciesComponent },
  { path: 'plan/findproc', component: FindProcComponent },
  { path: 'plan/vision-coverage', component: VisionPlanCoverageComponent},
  { path: 'plan/health-coverage', component: HealthPlanCoverageComponent },
  { path: 'plan/amendment', component: AmendmentWizardComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyModuleRoutingModule { }