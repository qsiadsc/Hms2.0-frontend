import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItransViewerModuleRoutingModule } from './itrans-viewer-module-routing.module';
import { ItransViewerModuleComponent } from './itrans-viewer-module.component';
import { MyDatePickerModule } from 'mydatepicker';
import { Ng2CompleterModule } from "ng2-completer";
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ItransViewerModuleRoutingModule,
    MyDatePickerModule,
    Ng2CompleterModule,
  ],
  declarations: [ItransViewerModuleComponent],
})
export class ItransViewerModuleModule { }
