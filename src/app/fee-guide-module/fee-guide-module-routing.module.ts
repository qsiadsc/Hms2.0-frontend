import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { FeeGuideModuleComponent } from './fee-guide-module.component';
import { DentalFeeGuideComponent } from './dental-fee-guide/dental-fee-guide.component'
import { ViewDentalFeeGuideComponent } from '../fee-guide-module/dental-fee-guide/view-dental-fee-guide/view-dental-fee-guide.component'
import { AddDentalServiceComponent} from '../fee-guide-module/add-dental-service/add-dental-service.component';
import { UsclsFeeGuideComponent } from './uscls-fee-guide/uscls-fee-guide.component';
import { DentalScheduleListComponent } from './dental-schedule-list/dental-schedule-list.component';
import { DentalScheduleComponent } from './dental-schedule/dental-schedule.component';
import { ProcedureCodeComponent } from './../fee-guide-module/procedure-code/procedure-code.component';
import { VissionProcCodeComponent } from './../fee-guide-module/vission-proc-code/vission-proc-code.component';
import { HealthProcCodeComponent } from './../fee-guide-module/health-proc-code/health-proc-code.component';
import { HsaProcCodeComponent } from './../fee-guide-module/hsa-proc-code/hsa-proc-code.component';
import { HealthServiceComponent } from './../fee-guide-module/health-service/health-service.component';
import { HsaServiceComponent } from './../fee-guide-module/hsa-service/hsa-service.component';
import { VissionServiceComponent } from './../fee-guide-module/vission-service/vission-service.component';
import { WellnessProcCodeComponent } from './wellness-proc-code/wellness-proc-code.component';
import { WellnessServiceComponent } from './wellness-service/wellness-service.component';
import { UsclsComponent } from './uscls/uscls.component';

const routes: Routes = [
  { path: 'usclsFeeGuide', component: UsclsFeeGuideComponent},
  { path: '', component: DentalFeeGuideComponent, pathMatch: 'full'},
  { path: 'view/:id', component: ViewDentalFeeGuideComponent },
  { path: 'dentalService', component: AddDentalServiceComponent},
  { path: 'dentalSchedule', component: DentalScheduleListComponent},
  { path: 'dentalSchedule/add', component:DentalScheduleComponent},
  { path: 'dentalSchedule/view/:id', component:DentalScheduleComponent},
  { path: 'procedureCode', component: ProcedureCodeComponent},
  { path: 'healthProcedureCode', component: HealthProcCodeComponent},
  { path: 'hsaProcedureCode', component: HsaProcCodeComponent},
  { path: 'visionProcedureCode', component: VissionProcCodeComponent},
  { path: 'wellnessProcedureCode', component: WellnessProcCodeComponent},
  { path: 'healthService', component: HealthServiceComponent},
  { path: 'hsaService', component: HsaServiceComponent},
  { path: 'visionService', component: VissionServiceComponent},
  { path: 'wellnessService', component: WellnessServiceComponent},
  { path: 'uscls', component: UsclsComponent}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeGuideModuleRoutingModule { }