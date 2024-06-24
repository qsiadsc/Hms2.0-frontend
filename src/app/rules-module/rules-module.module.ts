import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonModuleModule} from './../common-module/common-module.module'
import { SharedModule }     from '../shared/shared.module';
import { RulesModuleRoutingModule } from './rules-module-routing.module';
import { RulesModuleComponent } from './rules-module.component';
import { RulesSearchFilterComponent } from './rules-search-filter/rules-search-filter.component';
import { RuleAddEditComponent } from './rule-add-edit/rule-add-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { Ng2CompleterModule } from "ng2-completer";
import { RulesService } from './rules.service';
@NgModule({
  imports: [
    CommonModule,
    CommonModuleModule,
    SharedModule,
    RulesModuleRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2CompleterModule
  ],
  providers: [CanDeactivateGuard,RulesService ],
  declarations: [RulesModuleComponent, RuleAddEditComponent, RulesSearchFilterComponent]
})
export class RulesModuleModule { }