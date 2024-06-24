import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CommonModuleModule } from './../common-module/common-module.module';
import { ClaimDashboardModuleRoutingModule } from './claim-dashboard-module-routing.module';
import { ClaimDashboardModuleComponent, ActionModuleComponent,ActionModuleComponentMpc, ActionModule2Component, DisciplineModuleComponent, StatusModuleComponent, ClaimDashboradService } from './claim-dashboard-module.component';
import { FilesComponent } from './files/files.component';
import { GenericTableModule } from '@angular-generic-table/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ChartsModule } from 'ng4-charts/ng4-charts';
import { Ng2CompleterModule } from 'ng2-completer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModuleModule,
    ClaimDashboardModuleRoutingModule,
    GenericTableModule,
    PdfViewerModule,
    ChartsModule,
    Ng2CompleterModule
  ],
  declarations: [ClaimDashboardModuleComponent, ActionModuleComponent,ActionModuleComponentMpc, ActionModule2Component, DisciplineModuleComponent, StatusModuleComponent, FilesComponent],
  providers: [ClaimDashboradService]
})

export class ClaimDashboardModuleModule { }