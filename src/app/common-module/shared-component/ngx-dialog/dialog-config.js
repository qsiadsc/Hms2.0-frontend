"use strict";
var DialogConfig = (function () {
    function DialogConfig() {
    }
    return DialogConfig;
}());
//Please see properties of calling parameter object in dialog.component.ts.
//App level settings ----------------
DialogConfig.topOffset = 60;
DialogConfig.draggable = true;
//Animation fade-in time is set in bootstrap.css by default (0.3s).
//You can overwrite the value in dialog-main.component.css.
DialogConfig.animation = true;
//Dialog level settings --------------------
//Background color can also be set in dialog-main.component.css.
DialogConfig.grayBackground = true;
DialogConfig.width = "40%";
//Animation fade-out time in milliseconds.
DialogConfig.closeDelay = 500;
//Fade-out time delay in milliseconds for multiple parent dialogs when closing all together.
DialogConfig.closeDelayParent = 10;
DialogConfig.closeByEnter = false;
DialogConfig.closeByEscape = true;
DialogConfig.closeByClickOutside = true;
//Usually dialog-level only:
DialogConfig.closeAllDialogs = false;
DialogConfig.closeImmediateParent = false;
DialogConfig.keepOpenForAction = false;
DialogConfig.keepOpenForClose = false;
//Dialog-level exclusive, no default set but listed here for reference.
//Default values for predefined base type dialogs (message or confirm) only:
DialogConfig.messageTitle = "Information";
DialogConfig.confirmTitle = "Confirmation";
//Two kinds of button labels in Parameter object for Opening dialog are:
//These are for setting defaults only. If passed from parameter object, use these:

//--------------------------------------------------------------------
//Only singel button should be used for basic message dialog, which uses close button pattern by default.
//Switch to use action button pattern will change button CSS style and set Observable.result = true.
DialogConfig.messageActionButtonLabel = "";
DialogConfig.messageCloseButtonLabel = "OK";
DialogConfig.confirmActionButtonLabel = "Yes";
DialogConfig.confirmCloseButtonLabel = "No";
//End for setting defaults only----------------------------------------
DialogConfig.showIcon = true;
DialogConfig.messageIcon = "info";
DialogConfig.confirmIcon = "question";
exports.DialogConfig = DialogConfig;
