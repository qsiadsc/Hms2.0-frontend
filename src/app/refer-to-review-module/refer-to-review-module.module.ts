import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonModuleModule} from './../common-module/common-module.module';
import { SharedModule } from './../shared/shared.module';
import { ReferToReviewModuleRoutingModule } from './refer-to-review-module-routing.module';
import { ReferToReviewModuleComponent } from './refer-to-review-module.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Ng2CompleterModule } from "ng2-completer";
import { ReviewAppService } from '../review-web-app/reviewApp.service'
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { GenericTableModule } from '@angular-generic-table/core';

@NgModule({
  imports: [
    CommonModule,
    CommonModuleModule,
    SharedModule,
    ReferToReviewModuleRoutingModule,
    PdfViewerModule,
    GenericTableModule,
    Ng2CompleterModule,
    Ng2AutoCompleteModule
  ],
  declarations: [
    ReferToReviewModuleComponent,
    //  GeneralInformationComponent
  ],
  providers:    [ReviewAppService,CanDeactivateGuard],
})
export class ReferToReviewModuleModule { }
