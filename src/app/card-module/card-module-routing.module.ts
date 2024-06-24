import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardModuleComponent } from './card-module.component';
import { SearchCardHolderComponent } from './search-card-holder/search-card-holder.component'
import { CardHolderRoleAssignedComponent} from '../card-module/card-holder/card-holder-role-assigned/card-holder-role-assigned.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { ClaimsDialogueComponent } from './card-holder/claims-dialogue/claims-dialogue.component';

const routes: Routes = [
  { path: '', component: CardModuleComponent, pathMatch: 'full',canDeactivate: [CanDeactivateGuard] },
  { path: 'searchCard', component: SearchCardHolderComponent },
  { path: 'view/:id', component: CardModuleComponent,canDeactivate: [CanDeactivateGuard] },
  { path: 'edit/:id', component: CardModuleComponent,canDeactivate: [CanDeactivateGuard] },
  { path: 'claim/:cardholderKey/:businessType', component: ClaimsDialogueComponent}
  
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule] 
})

export class CardModuleRoutingModule { }