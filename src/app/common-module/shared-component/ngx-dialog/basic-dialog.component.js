"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//SW: added new base component.
var core_1 = require("@angular/core");
var dialog_component_1 = require("./dialog.component");
var dialog_service_1 = require("./dialog.service");
var BasicDialogComponent = (function (_super) {
    __extends(BasicDialogComponent, _super);
    function BasicDialogComponent(dialogService, renderer) {
        var _this = _super.call(this, dialogService) || this;
        _this.renderer = renderer;
        return _this;
    }
    BasicDialogComponent.prototype.ngAfterViewInit = function () {
        if (this.dialogAddClass != undefined && this.dialogAddClass != "")
            this.renderer.setElementClass(this.dialogElem.nativeElement, this.dialogAddClass, true);
        if (this.headerAddClass != undefined && this.headerAddClass != "")
            this.renderer.setElementClass(this.headerElem.nativeElement, this.headerAddClass, true);
        if (this.titleAddClass != undefined && this.titleAddClass != "")
            this.renderer.setElementClass(this.titleElem.nativeElement, this.titleAddClass, true);
        if (this.bodyAddClass != undefined && this.bodyAddClass != "")
            this.renderer.setElementClass(this.bodyElem.nativeElement, this.bodyAddClass, true);
        if (this.messageAddClass != undefined && this.messageAddClass != "")
            this.renderer.setElementClass(this.messageElem.nativeElement, this.messageAddClass, true);
        if (this.footerAddClass != undefined && this.footerAddClass != "")
            this.renderer.setElementClass(this.footerElem.nativeElement, this.footerAddClass, true);
        if (this.actionButtonAddClass != undefined && this.actionButtonAddClass != "")
            this.renderer.setElementClass(this.actionButtonElem.nativeElement, this.actionButtonAddClass, true);
        if (this.closeButtonAddClass != undefined && this.closeButtonAddClass != "")
            this.renderer.setElementClass(this.closeButtonElem.nativeElement, this.closeButtonAddClass, true);
    };
    BasicDialogComponent.prototype.action = function () {
        this.result = true;
        this.dialogResult();
    };
    BasicDialogComponent.prototype.close = function () {
        this.result = false;
        this.dialogResult();
    };
    return BasicDialogComponent;
}(dialog_component_1.DialogComponent));
__decorate([
    core_1.ViewChild("dialogElem"),
    __metadata("design:type", core_1.ElementRef)
], BasicDialogComponent.prototype, "dialogElem", void 0);
__decorate([
    core_1.ViewChild("headerElem"),
    __metadata("design:type", core_1.ElementRef)
], BasicDialogComponent.prototype, "headerElem", void 0);
__decorate([
    core_1.ViewChild("titleElem"),
    __metadata("design:type", core_1.ElementRef)
], BasicDialogComponent.prototype, "titleElem", void 0);
__decorate([
    core_1.ViewChild("bodyElem"),
    __metadata("design:type", core_1.ElementRef)
], BasicDialogComponent.prototype, "bodyElem", void 0);
__decorate([
    core_1.ViewChild("messageElem"),
    __metadata("design:type", core_1.ElementRef)
], BasicDialogComponent.prototype, "messageElem", void 0);
__decorate([
    core_1.ViewChild("footerElem"),
    __metadata("design:type", core_1.ElementRef)
], BasicDialogComponent.prototype, "footerElem", void 0);
__decorate([
    core_1.ViewChild("actionButtonElem"),
    __metadata("design:type", core_1.ElementRef)
], BasicDialogComponent.prototype, "actionButtonElem", void 0);
__decorate([
    core_1.ViewChild("closeButtonElem"),
    __metadata("design:type", core_1.ElementRef)
], BasicDialogComponent.prototype, "closeButtonElem", void 0);
BasicDialogComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'basic-dialog',
        templateUrl: "./basic-dialog.component.html",
        styleUrls: ["./basic-dialog.component.css"]
    }),
    __metadata("design:paramtypes", [dialog_service_1.DialogService, core_1.Renderer])
], BasicDialogComponent);
exports.BasicDialogComponent = BasicDialogComponent;
