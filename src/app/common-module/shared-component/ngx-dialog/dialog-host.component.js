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
var dialog_main_component_1 = require("./dialog-main.component");
var DialogHostComponent = (function () {
    function DialogHostComponent(resolver) {
        this.resolver = resolver;
        //Array to hold multiple dialogs.
        this.dialogs = [];
    }
    /**
    * Adds dialog
    * @return {Observable<any>}
    */
    DialogHostComponent.prototype.addDialog = function (component, data, index) {
        var factory = this.resolver.resolveComponentFactory(dialog_main_component_1.DialogMainComponent);
        var componentRef = this.element.createComponent(factory, index);
        var dialogMain = componentRef.instance;
        var _component = dialogMain.addComponent(component);
        if (typeof (index) !== "undefined") {
            this.dialogs.splice(index, 0, _component);
        }
        else {
            this.dialogs.push(_component);
        }
        setTimeout(function () {
            dialogMain.show();
        });
        return _component.fillData(data);
    };
    //Removes open dialog.    
    DialogHostComponent.prototype.removeDialog = function (component, closeDelay) {
        var _this = this;
        var delayMs = closeDelay == undefined ? component.closeDelay : closeDelay;
        //No visible delay if no animaion fade in.
        if (!component.animation)
            delayMs = 5;
        component.dialogMain.hide();
        setTimeout(function () {
            var index = _this.dialogs.indexOf(component);
            if (index > -1) {
                _this.element.remove(index);
                _this.dialogs.splice(index, 1);
            }
        }, delayMs);
    };
    //Remove open dialog and its immediate parent dialog.
    DialogHostComponent.prototype.removeDialogAndParent = function (component) {
        var _thisRef = this;
        var dialogIndex = this.dialogs.indexOf(component);
        this.dialogs.forEach(function (value, index) {
            if (index == dialogIndex || index == dialogIndex - 1) {
                _thisRef.removeDialog(value, _thisRef.getCloseDelayForParent(value, index));
            }
        });
    };
    //Removes all multiple opened dialogs.    
    DialogHostComponent.prototype.removeAllDialogs = function () {
        var _thisRef = this;
        this.dialogs.forEach(function (value, index) {
            _thisRef.removeDialog(value, _thisRef.getCloseDelayForParent(value, index));
        });
    };
    //Get close delay milliseconds for parent dialog with reduced time.
    DialogHostComponent.prototype.getCloseDelayForParent = function (component, index) {
        var closeDelayParent;
        if (index < this.dialogs.length - 1) {
            closeDelayParent = component.closeDelay == undefined ? component.closeDelayParent : component.closeDelay;
        }
        else {
            closeDelayParent = component.closeDelay;
        }
        return closeDelayParent;
    };
    return DialogHostComponent;
}());
__decorate([
    core_1.ViewChild("element", { read: core_1.ViewContainerRef }),
    __metadata("design:type", core_1.ViewContainerRef)
], DialogHostComponent.prototype, "element", void 0);
DialogHostComponent = __decorate([
    core_1.Component({
        selector: "dialog-host",
        template: "<template #element></template>"
    }),
    __metadata("design:paramtypes", [core_1.ComponentFactoryResolver])
], DialogHostComponent);
exports.DialogHostComponent = DialogHostComponent;
