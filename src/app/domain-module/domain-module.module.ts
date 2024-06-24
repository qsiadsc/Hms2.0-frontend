import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomainModuleRoutingModule } from './domain-module-routing.module';
import { DomainModuleComponent } from './domain-module.component';
import { SharedModule } from './../shared/shared.module';
import { DomainInfoComponent } from './domain-info/domain-info.component';
import { MyDatePickerModule } from 'mydatepicker';
import { Ng2CompleterModule } from 'ng2-completer';

@NgModule({
  imports: [
    CommonModule,
    DomainModuleRoutingModule,
    SharedModule,
    MyDatePickerModule,
    Ng2CompleterModule
  ],
  declarations: [DomainModuleComponent, DomainInfoComponent]
})
export class DomainModuleModule { }
