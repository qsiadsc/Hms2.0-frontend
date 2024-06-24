import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModuleModule} from './../common-module/common-module.module';
import { SharedModule }     from '../shared/shared.module';
import { QsiLoaderModuleRoutingModule } from './qsi-loader-module-routing.module';
import { QsiLoaderComponent } from './qsi-loader/qsi-loader.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    QsiLoaderModuleRoutingModule,
    PdfViewerModule,
    CommonModuleModule
  ],
  declarations: [QsiLoaderComponent]
})
export class QsiLoaderModuleModule { }
