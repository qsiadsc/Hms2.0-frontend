"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var dialog_host_component_1 = require("./dialog-host.component");
var DialogService = (function () {
    function DialogService(resolver, applicationRef, injector) {
        this.resolver = resolver;
        this.applicationRef = applicationRef;
        this.injector = injector;
    }
    /**
    * Adds dialog.
    * @return {Observable<any>}
    */
    DialogService.prototype.addDialog = function (component, data, index) {
        //Create an instance of dialogMainComponent if not exist.
        if (!this.dialogHostComponent) {
            this.dialogHostComponent = this.createDialogHost();
        }
        //Populate dialogs array for access by service caller.
        this.dialogs = this.dialogHostComponent.dialogs;
        return this.dialogHostComponent.addDialog(component, data, index);
    };
    //Hides and removes dialog from DOM    
    DialogService.prototype.removeDialog = function (component, clearAll) {
        if (clearAll === void 0) { clearAll = false; }
        if (!this.dialogHostComponent) {
            return;
        }
        //Close all dialogs if clearAll flag is passed.
        if (clearAll) {
            this.dialogHostComponent.removeAllDialogs();
        }
        else if (component.closeAllDialogs) {
            this.dialogHostComponent.removeAllDialogs();
        }
        else if (component.closeImmediateParent) {
            this.dialogHostComponent.removeDialogAndParent(component);
        }
        else {
            this.dialogHostComponent.removeDialog(component);
        }
    };
    /**
    * Creates and add to DOM top-level dialog host component
    * @return {DialogHostComponent}
    */
    DialogService.prototype.createDialogHost = function () {
        var _this = this;
        var componentFactory = this.resolver.resolveComponentFactory(dialog_host_component_1.DialogHostComponent);
        var componentRef = componentFactory.create(this.injector);
        var componentRootNode = componentRef.hostView.rootNodes[0];
        var componentRootViewConainer = this.applicationRef["_rootComponents"][0];
        var rootLocation = componentRootViewConainer.hostView.rootNodes[0];
        this.applicationRef.attachView(componentRef.hostView);
        componentRef.onDestroy(function () {
            _this.applicationRef.detachView(componentRef.hostView);
        });
        rootLocation.appendChild(componentRootNode);
        return componentRef.instance;
    };
    return DialogService;
}());
DialogService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [core_1.ComponentFactoryResolver, core_1.ApplicationRef, core_1.Injector])
], DialogService);
exports.DialogService = DialogService;
