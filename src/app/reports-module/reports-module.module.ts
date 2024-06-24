import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MyDatePickerModule } from 'mydatepicker';
import { ReportsModuleRoutingModule } from './reports-module-routing.module';
import { ReportsModuleComponent } from './reports-module.component';
import { SharedModule } from './../shared/shared.module';
import { GenericTableModule } from '@angular-generic-table/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportsModuleRoutingModule,
    HttpModule,
    MyDatePickerModule,
    SharedModule,
    GenericTableModule
  ],
  declarations: [ReportsModuleComponent]
})
export class ReportsModuleModule { }
