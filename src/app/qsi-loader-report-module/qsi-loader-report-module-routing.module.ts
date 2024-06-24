import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QsiLoaderReportComponent } from './qsi-loader-report/qsi-loader-report.component';

const routes: Routes = [
  { path: '', component: QsiLoaderReportComponent, pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QsiLoaderReportModuleRoutingModule { }
