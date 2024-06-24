import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, Type, EventEmitter } from "@angular/core";
import { DialogHostComponent } from "./dialog-host.component";
import { DialogComponent } from "./dialog.component";
import { Observable } from "rxjs";

@Injectable()
export class DialogService  {
    public rulesTabClicked = new EventEmitter();
    public deleteConfirmed = new EventEmitter();
    dialogs: any; 
    private dialogHostComponent : DialogHostComponent;
        
    constructor(private resolver: ComponentFactoryResolver, private applicationRef: ApplicationRef, private injector: Injector) {}

    /**
    * Adds dialog.
    * @return {Observable<any>}
    */
    addDialog(component:Type<DialogComponent>, data?:any, index?:number): Observable<any> {
        //Create an instance of dialogMainComponent if not exist.
        if (!this.dialogHostComponent) {
            this.dialogHostComponent = this.createDialogHost();
        }
        //Populate dialogs array for access by service caller.
        this.dialogs = this.dialogHostComponent.dialogs;

        return this.dialogHostComponent.addDialog(component, data, index);
    }
    
    //Hides and removes dialog from DOM    
    removeDialog(component: DialogComponent, clearAll: boolean = false): void {      
        if (!this.dialogHostComponent) {
            return;
        }

        //Close all dialogs if clearAll flag is passed.
        if (clearAll) {
            this.dialogHostComponent.removeAllDialogs();
        }
        //Closing all dialogs.
        else if (component.closeAllDialogs)
        {
            this.dialogHostComponent.removeAllDialogs();
        }
        else if (component.closeImmediateParent) {
            this.dialogHostComponent.removeDialogAndParent(component);
        }
        else {
            this.dialogHostComponent.removeDialog(component);
        }        
    }    

    /**
    * Creates and add to DOM top-level dialog host component
    * @return {DialogHostComponent}
    */
    private createDialogHost(): DialogHostComponent {
        let componentFactory = this.resolver.resolveComponentFactory(DialogHostComponent);
        let componentRef = componentFactory.create(this.injector);
        let componentRootNode = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        let componentRootViewConainer = this.applicationRef["components"][0];
        
        let rootLocation: Element = (componentRootViewConainer.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        this.applicationRef.attachView(componentRef.hostView);

        componentRef.onDestroy(() => {
            this.applicationRef.detachView(componentRef.hostView);
        });

        rootLocation.appendChild(componentRootNode);

        return componentRef.instance;
    }    
}
