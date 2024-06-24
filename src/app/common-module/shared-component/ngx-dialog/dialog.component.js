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
var rxjs_1 = require("rxjs");
var dialog_service_1 = require("./dialog.service");
var DialogComponent = (function () {
    function DialogComponent(dialogService) {
        this.dialogService = dialogService;
        //Declared for any component-level custom setting used by TypeScript.
        //Component-level values will be passed from original callers.
        this.width = undefined;
        this.grayBackground = undefined;
        this.animation = undefined;
        this.draggable = undefined;
        this.closeDelay = undefined;
        this.closeDelayParent = undefined;
        this.closeByClickOutside = undefined;
        this.closeByEnter = undefined;
        this.closeByEscape = undefined;
        this.closeAllDialogs = undefined;
        this.closeImmediateParent = undefined;
        this.keepOpenForAction = undefined;
        this.keepOpenForClose = undefined;
        this.beforeActionCallback = undefined;
        this.beforeCloseCallback = undefined;
        //For basic type dialogs only.
        this.title = undefined;
        this.showIcon = undefined;
        this.icon = undefined;
        this.actionButtonLabel = undefined;
        this.closeButtonLabel = undefined;
        this.dialogAddClass = undefined;
        this.headerAddClass = undefined;
        this.titleAddClass = undefined;
        this.bodyAddClass = undefined;
        this.messageAddClass = undefined;
        this.footerAddClass = undefined;
        this.actionButtonAddClass = undefined;
        this.closeButtonAddClass = undefined;
        //Basic dialog type flag (internal use). 
        //Value is set in ExDialog service and used in BasicDialogComponent and DialogMainComponent.
        this.basicType = undefined;
    }
    //Set input parameters to component properties.
    DialogComponent.prototype.fillData = function (data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        var keys = Object.keys(data);
        for (var idx = 0, length_1 = keys.length; idx < length_1; idx++) {
            var key = keys[idx];
            this[key] = data[key];
        }
        return rxjs_1.Observable.create(function (observer) {
            _this.observer = observer;
            return function () {
                _this.dialogResult();
            };
        });
    };
    //Conditionally close or keep opened dialog and return observer result.
    DialogComponent.prototype.dialogResult = function () {
        var _this = this;
        //Callback function that returns an observable and handles before-close callback. Otherwise just close the dialog.
        if (this.result && this.beforeActionCallback)
            this.dialogCallback = this.beforeActionCallback;
        else if (!this.result && this.beforeCloseCallback)
            this.dialogCallback = this.beforeCloseCallback;
        var callBackResult;
        if (!this.result && this.beforeCloseCallback && typeof this.beforeCloseCallback === "function") {
            callBackResult = this.beforeCloseCallback.call(this);
        }
        else if (this.result && this.beforeActionCallback && typeof this.beforeActionCallback === "function") {
            callBackResult = this.beforeActionCallback.call(this);
        }
        else {
            this.closeDialog();
            return;
        }
        if (callBackResult && typeof callBackResult === "object") {
            callBackResult.subscribe(function (result) {
                if (result) {
                    _this.closeDialog();
                }
                else {
                    return;
                }
            });
        }
        else {
            this.closeDialog();
        }
    };
    DialogComponent.prototype.closeDialog = function () {
        if (this.observer) {
            this.observer.next(this.result);
        }
        if ((this.result && !this.keepOpenForAction) || (!this.result && !this.keepOpenForClose))
            this.dialogService.removeDialog(this);
    };
    return DialogComponent;
}());
DialogComponent = __decorate([
    core_1.Component({
        selector: "dialog-component"
    }),
    __metadata("design:paramtypes", [dialog_service_1.DialogService])
], DialogComponent);
exports.DialogComponent = DialogComponent;
