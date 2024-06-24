#Created By: Tarun Chhabra

#Introduction:

Screen Lock implemenentation user to prevent lose of Form Data on accidently browser close.
If we try to close browser or tab then It will confirm 'Changes you made may not be saved.'
and Reload / Leave with Cancel Button. If click on cancel page will not close. Screen Lock 
services places in  app/common-module/shared-resources/screen-lock and Demo using reactive form 
placed in demo-component/screen-lock.

#Requirment: 
Screen Lock implemenentation user to prevent lose of Form Data on accidently browser close.

#How To Use:

1) Add can-deactivate.guard /component-can-deactivate / form-can-deactivate in shared module.


1) Import following refference in component

  import { Component, OnInit ,ViewChild,HostListener} from '@angular/core';
  import {FormCanDeactivate} from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
  import { FormControl, FormGroup,FormBuilder,Validators } from '@angular/forms';

2) extends FormCanDeactivate your component class.

  export class ScreenLockComponent extends FormCanDeactivate implements OnInit {
    @ViewChild('FormGroup')
    FormGroup: FormGroup;

  Limitation of this implementation is we have to give FormGroup is FormGroup example 
  -[formGroup]="FormGroup" Because we give FormGroup as abstract in ComponentCanDeactivate.

   #abstract get FormGroup() : FormGroup;

    
3) call to default constructor added implicitly - super(); 

 constructor(private fb: FormBuilder) {
    super(); // call to default constructor added implicitly     
  }

  #HTML 

  <form [formGroup]="FormGroup">
  <label class="center-block">Name:
    <input class="form-control" formControlName="name" >
  </label>

  <button type="submit" (click)="submit()">Save</button>
  </form>

After Submit add this.FormGroup.markAsPristine(); in submit 

submit(){
  this.FormGroup.reset();

  #OR 

  this.FormGroup.markAsPristine();
}

#Used On: 

Components:

demo-component/screen-lock
card-module/card-module.component.HTML






