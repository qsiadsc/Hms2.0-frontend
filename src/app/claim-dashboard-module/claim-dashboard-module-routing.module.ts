import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClaimDashboardModuleComponent } from './claim-dashboard-module.component';
import { FilesComponent } from './files/files.component';

const routes: Routes = [
  { path: '', component: ClaimDashboardModuleComponent, pathMatch: 'full' },
  { path: 'alberta', component: ClaimDashboardModuleComponent, pathMatch: 'full' },
  { path: 'file/view/:id', component: FilesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimDashboardModuleRoutingModule { }
