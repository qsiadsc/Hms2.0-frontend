import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { FilesModuleRoutingModule } from './files-module-routing.module';
import { FilesComponent } from './files/files.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FilesModuleRoutingModule
  ],
  declarations: [FilesComponent]
})
export class FilesModuleModule { }
