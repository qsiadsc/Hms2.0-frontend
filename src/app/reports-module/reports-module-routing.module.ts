import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsModuleComponent } from './reports-module.component';

const routes: Routes = [
  { path: '', component: ReportsModuleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsModuleRoutingModule { }
