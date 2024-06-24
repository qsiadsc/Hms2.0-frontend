import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItransViewerModuleComponent } from './itrans-viewer-module.component';

const routes: Routes = [
  { path: '', component: ItransViewerModuleComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItransViewerModuleRoutingModule { }
