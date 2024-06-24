import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QsiLoaderComponent } from "./qsi-loader/qsi-loader.component";

const routes: Routes = [
  { path: '', component: QsiLoaderComponent, pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QsiLoaderModuleRoutingModule { }
