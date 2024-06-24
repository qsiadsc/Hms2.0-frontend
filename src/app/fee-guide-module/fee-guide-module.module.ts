import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2CompleterModule } from "ng2-completer";
import { FeeGuideModuleComponent } from './fee-guide-module.component';
import { MyDatePickerModule } from 'mydatepicker';
import { SharedModule }     from '../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModuleModule} from './../common-module/common-module.module';
import { FeeGuideModuleRoutingModule } from './fee-guide-module-routing.module';
import { UsclsFeeGuideComponent } from './uscls-fee-guide/uscls-fee-guide.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatePipe } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from './../common-module/shared-services/datatable.service'
import { ServiceProviderService} from '../service-provider-module/serviceProvider.service';
import { ClaimService } from './../claim-module/claim.service';
import { DentalFeeGuideComponent } from './dental-fee-guide/dental-fee-guide.component'
import { ViewDentalFeeGuideComponent } from '../fee-guide-module/dental-fee-guide/view-dental-fee-guide/view-dental-fee-guide.component';
import { AddDentalServiceComponent } from './add-dental-service/add-dental-service.component';
import { DentalScheduleListComponent } from './dental-schedule-list/dental-schedule-list.component';
import { DentalScheduleComponent } from './dental-schedule/dental-schedule.component';
import { ProcedureCodeComponent } from './procedure-code/procedure-code.component';
import { VissionProcCodeComponent } from './vission-proc-code/vission-proc-code.component';
import { VissionServiceComponent } from './vission-service/vission-service.component';
import { HealthProcCodeComponent } from './health-proc-code/health-proc-code.component';
import { HealthServiceComponent } from './health-service/health-service.component';
import { HsaProcCodeComponent } from './hsa-proc-code/hsa-proc-code.component';
import { HsaServiceComponent } from './hsa-service/hsa-service.component'
import {NgxPaginationModule} from 'ngx-pagination';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { WellnessProcCodeComponent } from './wellness-proc-code/wellness-proc-code.component';
import { WellnessServiceComponent } from './wellness-service/wellness-service.component';
import { UsclsComponent } from './uscls/uscls.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MyDatePickerModule,
    CommonModuleModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    FeeGuideModuleRoutingModule,
    NgxPaginationModule,
    NguiAutoCompleteModule
  ],
  declarations: [FeeGuideModuleComponent,DentalFeeGuideComponent,ViewDentalFeeGuideComponent,UsclsFeeGuideComponent,AddDentalServiceComponent, DentalScheduleListComponent, DentalScheduleComponent, ProcedureCodeComponent, VissionProcCodeComponent, VissionServiceComponent, HealthProcCodeComponent, HealthServiceComponent, HsaProcCodeComponent, HsaServiceComponent, WellnessProcCodeComponent, WellnessServiceComponent, UsclsComponent],
  providers: [ClaimService,ServiceProviderService,CanDeactivateGuard,ChangeDateFormatService,DatePipe,DataTableDirective,DatatableService]
})
export class FeeGuideModule { }



    
