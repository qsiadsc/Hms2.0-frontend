import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { CommonModuleModule } from './../common-module/common-module.module';
import { UsersModuleComponent } from './users-module.component';
import { UsersModuleRoutingModule } from './users-module-routing.module';
import { SearchUserComponent } from './search-user/search-user.component';
import { AddUserComponent } from './add-user/add-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserRolesComponent } from './user-roles/user-roles.component';
import { UserRolesAddEditComponent } from './user-roles-add-edit/user-roles-add-edit.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { Ng2CompleterModule } from "ng2-completer";
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { CompanyService } from '../company-module/company.service';
import { ExpandableListModule } from 'angular2-expandable-list';

@NgModule({
  imports: [
    CommonModule,
    UsersModuleRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModuleModule,
    SharedModule,
    MultiselectDropdownModule,
    Ng2CompleterModule,
    ExpandableListModule // Import Angular's ExpandableListModule modules
  ],
  declarations: [UsersModuleComponent, SearchUserComponent, AddUserComponent, UserRolesComponent, UserRolesAddEditComponent],
  providers: [CompanyService,CanDeactivateGuard]
})
export class UsersModuleModule { }