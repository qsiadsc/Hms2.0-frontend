import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataManagementDashboardModuleComponent } from './data-management-dashboard-module.component';
import { DataManagementDashboardModuleRoutingModule } from './data-management-dashboard-module-routing.module';
import { SharedModule } from './../shared/shared.module';
import { ServiceProvidersComponent } from './service-providers/service-providers.component';
import { CardPrintRequestComponent } from './card-print-request/card-print-request.component';
import { ClaimSecureComponent } from './claim-secure/claim-secure.component';
import { MyDatePickerModule } from 'mydatepicker';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModuleModule} from './../common-module/common-module.module';
import { EligibilityFilesComponent } from './eligibility-files/eligibility-files.component';
import { CdaNetComponent } from './cda-net/cda-net.component';
import { AppDataManagementReportListComponent } from './app-data-management-report-list/app-data-management-report-list.component';
import { Ng2CompleterModule } from "ng2-completer";
import { ChartsModule } from 'ng2-charts';
import { DataQsiLoaderComponent } from './data-qsi-loader/data-qsi-loader.component';
import { GroupsMissingInformationComponent } from './groups-missing-information/groups-missing-information.component';


@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    SharedModule,
    Ng2CompleterModule,
    MyDatePickerModule,
    DataManagementDashboardModuleRoutingModule,
    PdfViewerModule,
    CommonModuleModule
  ],
  declarations: [DataManagementDashboardModuleComponent, ServiceProvidersComponent, CardPrintRequestComponent, ClaimSecureComponent, EligibilityFilesComponent, CdaNetComponent, AppDataManagementReportListComponent, DataQsiLoaderComponent, GroupsMissingInformationComponent]
})
export class DataManagementDashboardModuleModule { }
