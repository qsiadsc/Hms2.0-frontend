"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var dialog_host_component_1 = require("./dialog-host.component");
var dialog_main_component_1 = require("./dialog-main.component");
var dialog_service_1 = require("./dialog.service");
var ex_dialog_service_1 = require("./ex-dialog.service");
var draggable_directive_1 = require("./draggable.directive");
var vertical_center_directive_1 = require("./vertical-center.directive");
var focus_blur_directive_1 = require("./focus-blur.directive");
var dialog_icon_directive_1 = require("./dialog-icon.directive");
var basic_dialog_component_1 = require("./basic-dialog.component");
var dialog_component_1 = require("./dialog.component");
exports.DialogComponent = dialog_component_1.DialogComponent;
var dialog_service_2 = require("./dialog.service");
exports.DialogService = dialog_service_2.DialogService;
var ex_dialog_service_2 = require("./ex-dialog.service");
exports.ExDialog = ex_dialog_service_2.ExDialog;
var focus_blur_directive_2 = require("./focus-blur.directive");
exports.FocusBlurDirective = focus_blur_directive_2.FocusBlurDirective;
var dialog_cache_1 = require("./dialog-cache");
exports.DialogCache = dialog_cache_1.DialogCache;
var DialogModule = (function () {
    function DialogModule() {
    }
    return DialogModule;
}());
DialogModule = __decorate([
    core_1.NgModule({
        declarations: [
            dialog_host_component_1.DialogHostComponent,
            dialog_main_component_1.DialogMainComponent,
            draggable_directive_1.DraggableDirective,
            vertical_center_directive_1.VerticalCenterDirective,
            focus_blur_directive_1.FocusBlurDirective,
            dialog_icon_directive_1.DialogIconDirective,
            basic_dialog_component_1.BasicDialogComponent
        ],
        providers: [
            dialog_service_1.DialogService,
            ex_dialog_service_1.ExDialog
        ],
        imports: [
            common_1.CommonModule
        ],
        exports: [
            basic_dialog_component_1.BasicDialogComponent,
            focus_blur_directive_1.FocusBlurDirective
        ],
        entryComponents: [
            dialog_host_component_1.DialogHostComponent,
            dialog_main_component_1.DialogMainComponent,
            //SW: also need to declare these items as entryComponent.
            basic_dialog_component_1.BasicDialogComponent
        ]
    })
], DialogModule);
exports.DialogModule = DialogModule;
