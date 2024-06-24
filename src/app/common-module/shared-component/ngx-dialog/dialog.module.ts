import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { DialogHostComponent } from "./dialog-host.component";
import { DialogMainComponent } from "./dialog-main.component";
import { DialogService } from "./dialog.service";
import { ExDialog } from "./ex-dialog.service";
import { BasicDialogComponent } from './basic-dialog.component';
export { DialogComponent } from './dialog.component';
export { DialogService } from './dialog.service';
export { ExDialog } from "./ex-dialog.service";

@NgModule({
    declarations: [
        DialogHostComponent,
        DialogMainComponent,
        BasicDialogComponent,
    ],
    providers: [
        DialogService,
        ExDialog
    ],
    imports: [
        CommonModule
    ],
    exports: [        
        BasicDialogComponent,
        
    ],
    entryComponents: [
        DialogHostComponent,
        DialogMainComponent,
        //SW: also need to declare these items as entryComponent.
        BasicDialogComponent
    ]
})
export class DialogModule {    
}
