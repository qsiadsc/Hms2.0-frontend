import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanRoutingModule } from './plan-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { CanDeactivateGuard } from './../../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';


@NgModule({
  imports: [
    CommonModule,
    PlanRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MyDatePickerModule
  ],
  providers: [
    
    CanDeactivateGuard
  ],
})
export class PlanModule { }
