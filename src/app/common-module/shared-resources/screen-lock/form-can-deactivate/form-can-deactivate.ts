import {ComponentCanDeactivate} from '../can-deactivate/component-can-deactivate';
import {NgForm,FormGroup} from "@angular/forms";
import { FormControl } from '@angular/forms/src/model';

export abstract class FormCanDeactivate extends ComponentCanDeactivate{


 // For Reactive forms we have to use FormGroup() : FormGroup
 abstract get FormGroup() : FormGroup;
 canDeactivate():boolean{

  // For Reactive forms

   // For Template driven 
  return /*this.FormGroup.submitted &&*/ !this.FormGroup.dirty
  }
}