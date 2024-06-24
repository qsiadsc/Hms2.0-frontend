import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModuleModule } from '../common-module/common-module.module';
import { QsiLoaderReportModuleRoutingModule } from './qsi-loader-report-module-routing.module';
import { QsiLoaderReportComponent } from './qsi-loader-report/qsi-loader-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { DatatableService } from '../common-module/shared-services/datatable.service';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    QsiLoaderReportModuleRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModuleModule,
    MyDatePickerModule
  ],
  declarations: [
    QsiLoaderReportComponent
  ],
  providers: [DatatableService,ChangeDateFormatService]
})
export class QsiLoaderReportModuleModule { }
