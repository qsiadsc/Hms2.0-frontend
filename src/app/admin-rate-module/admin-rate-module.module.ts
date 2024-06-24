import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRateModuleRoutingModule } from './admin-rate-module-routing.module';
import { AdminInfoComponent } from './admin-info/admin-info.component';
import { AdminRateModuleComponent } from './admin-rate-module.component';
import { MyDatePickerModule } from 'mydatepicker';
import { CommonModuleModule} from './../common-module/common-module.module';
import { SharedModule } from './../shared/shared.module';
import { Ng2CompleterModule } from "ng2-completer";

@NgModule({
  imports: [
    CommonModule,
    AdminRateModuleRoutingModule,
    MyDatePickerModule,
    SharedModule,
    CommonModuleModule,
    Ng2CompleterModule
  ],

  declarations: [AdminInfoComponent, AdminRateModuleComponent]
})

export class AdminRateModuleModule {}