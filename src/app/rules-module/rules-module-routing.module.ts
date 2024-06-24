import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RulesModuleComponent } from './rules-module.component';
import { RuleAddEditComponent } from './rule-add-edit/rule-add-edit.component';
import{ RulesSearchFilterComponent } from './rules-search-filter/rules-search-filter.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';

const routes: Routes = [ 
  { path: ':id', component: RulesSearchFilterComponent}, 
  { path: 'add/:id', component: RuleAddEditComponent }, 
  { path: 'view/:ruleKey/diciplineKey/:id', component: RuleAddEditComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RulesModuleRoutingModule { }
