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
var dialog_config_1 = require("./dialog-config");
var DialogMainComponent = (function () {
    function DialogMainComponent(resolver, renderer) {
        this.resolver = resolver;
        this.renderer = renderer;
        this.shown = false;
        this.dialogPaddingTop = 0;
    }
    /**
    * Creates and add to DOM main dialog (overlay) parent component
    * @return {DialogHostComponent}
    */
    DialogMainComponent.prototype.addComponent = function (component) {
        var factory = this.resolver.resolveComponentFactory(component);
        var injector = core_1.ReflectiveInjector.fromResolvedProviders([], this.element.injector);
        var componentRef = factory.create(injector);
        this.element.insert(componentRef.hostView);
        this.content = componentRef.instance;
        this.content.dialogMain = this;
        return this.content;
    };
    DialogMainComponent.prototype.show = function () {
        //Check and overwrite default settings by dialog-level custom configs.
        this.dialogWidth = this.content.width == undefined ? dialog_config_1.DialogConfig.width : this.content.width;
        if (this.content.width == undefined)
            this.content.width = this.dialogWidth;
        this.isGrayBackground = this.content.grayBackground == undefined ? dialog_config_1.DialogConfig.grayBackground : this.content.grayBackground;
        if (this.content.grayBackground == undefined)
            this.content.grayBackground = this.isGrayBackground;
        this.isAnimation = this.content.animation == undefined ? dialog_config_1.DialogConfig.animation : this.content.animation;
        if (this.content.animation == undefined)
            this.content.animation = this.isAnimation;
        this.isDraggable = this.content.draggable == undefined ? dialog_config_1.DialogConfig.draggable : this.content.draggable;
        if (this.content.draggable == undefined)
            this.content.draggable = this.isDraggable;
        if (this.content.closeByEnter == undefined)
            this.content.closeByEnter = dialog_config_1.DialogConfig.closeByEnter;
        if (this.content.closeByEscape == undefined)
            this.content.closeByEscape = dialog_config_1.DialogConfig.closeByEscape;
        if (this.content.closeByClickOutside == undefined)
            this.content.closeByClickOutside = dialog_config_1.DialogConfig.closeByClickOutside;
        if (this.content.closeAllDialogs == undefined)
            this.content.closeAllDialogs = dialog_config_1.DialogConfig.closeAllDialogs;
        if (this.content.closeImmediateParent == undefined)
            this.content.closeImmediateParent = dialog_config_1.DialogConfig.closeImmediateParent;
        if (this.content.keepOpenForAction == undefined)
            this.content.keepOpenForAction = dialog_config_1.DialogConfig.keepOpenForAction;
        if (this.content.keepOpenForClose == undefined)
            this.content.keepOpenForClose = dialog_config_1.DialogConfig.keepOpenForClose;
        if (this.content.closeDelay == undefined)
            this.content.closeDelay = dialog_config_1.DialogConfig.closeDelay;
        if (this.content.closeDelayParent == undefined)
            this.content.closeDelayParent = dialog_config_1.DialogConfig.closeDelayParent;
        //For basic type dialogs only.
        if (this.content.showIcon == undefined && !this.content.showIcon)
            this.content.showIcon = dialog_config_1.DialogConfig.showIcon;
        if (this.content.basicType == "message") {
            if (this.content.title == undefined)
                this.content.title = dialog_config_1.DialogConfig.messageTitle;
            if (this.content.showIcon)
                if (this.content.icon == undefined || this.content.icon == "")
                    this.content.icon = dialog_config_1.DialogConfig.messageIcon;
            if (this.content.closeButtonLabel == undefined || this.content.closeButtonLabel == "") {
                this.content.closeButtonLabel = dialog_config_1.DialogConfig.messageCloseButtonLabel;
                //Use action button pattern if no value for closeButtonLabel.
                if ((this.content.closeButtonLabel == undefined || this.content.closeButtonLabel == "") &&
                    this.content.actionButtonLabel == undefined) {
                    this.content.actionButtonLabel = dialog_config_1.DialogConfig.messageActionButtonLabel;
                }
            }
        }
        else if (this.content.basicType == "confirm") {
            if (this.content.title == undefined)
                this.content.title = dialog_config_1.DialogConfig.confirmTitle;
            if (this.content.showIcon)
                if (this.content.icon == undefined || this.content.icon == "")
                    this.content.icon = dialog_config_1.DialogConfig.confirmIcon;
            if (this.content.actionButtonLabel == undefined)
                this.content.actionButtonLabel = dialog_config_1.DialogConfig.confirmActionButtonLabel;
            if (this.content.closeButtonLabel == undefined)
                this.content.closeButtonLabel = dialog_config_1.DialogConfig.confirmCloseButtonLabel;
        }
        this.shown = true;
    };
    DialogMainComponent.prototype.hide = function () {
        this.shown = false;
    };
    DialogMainComponent.prototype.clickOutside = function (event) {
        if (this.content.closeByClickOutside && event.target.classList.contains('dialog-frame')) {
            this.content.dialogResult();
        }
    };
    //Press Esc or Enter key to close dialog.
    DialogMainComponent.prototype.keyboardInput = function (event) {
        event.stopPropagation();
        if ((this.content.closeByEnter && event.keyCode == 13) ||
            (this.content.closeByEscape && event.keyCode == 27)) {
            this.content.dialogResult();
        }
    };
    return DialogMainComponent;
}());
__decorate([
    core_1.ViewChild("element", { read: core_1.ViewContainerRef }),
    __metadata("design:type", core_1.ViewContainerRef)
], DialogMainComponent.prototype, "element", void 0);
__decorate([
    core_1.HostListener('window:keydown', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DialogMainComponent.prototype, "keyboardInput", null);
DialogMainComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: "dialog-main",
        templateUrl: "./dialog-main.component.html"
    }),
    __metadata("design:paramtypes", [core_1.ComponentFactoryResolver, core_1.Renderer])
], DialogMainComponent);
exports.DialogMainComponent = DialogMainComponent;
