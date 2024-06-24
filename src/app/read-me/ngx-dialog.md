#Created By: Tarun Chhabra

#Introduction:

The ngx-dialog module is created for Rendering the Modal Popup on different components
using single Shared Service named 
"ex-dialog.service.ts" placed at path app/common-module/shared-component/ngx-dialog

#Requirment: 
1) This component is required for Common Modal Popup. In this i created HTML/ts/css everything in one folder. In ngx dialog we can use multiple type of component (Success / Warning / Error / Information / Confirm Box) with  one line of code only.

Example -  this.exDialog.openMessage("This is called from a simple line of parameters.");

#How To Use:

1) Import Files on Module.ts 

import { DialogModule } from "./common-module/shared-component/ngx-dialog/dialog.module"; and add refference in 

imports: [
    DialogModule
  ],

1) Import Files on Component

import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";

In Constructor 

private exDialog: ExDialog


Now we can use multiple type of Popup with sigle line of code

this.exDialog.openMessage("This is called from a simple line of parameters.");
this.exDialog.openMessage("This is called from a simple line of parameters.", "Warning","warning");
this.exDialog.openMessage("This is called from a simple line of parameters.", "Error", "error");
this.exDialog.openConfirm("This is Confirm Dialog.");
this.exDialog.openConfirm("This is called from a simple line of parameters.", "Warning","warning");
this.exDialog.openConfirm("This is called from a simple line of parameters.", "Error", "error");

#Used On: 

Components:

demo-component/ngx-modal






