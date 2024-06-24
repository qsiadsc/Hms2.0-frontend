import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersModuleComponent } from './users-module.component';
import { SearchUserComponent } from './search-user/search-user.component';
import { AddUserComponent } from './add-user/add-user.component';
import { UserRolesComponent } from './user-roles/user-roles.component';
import { UserRolesAddEditComponent } from './user-roles-add-edit/user-roles-add-edit.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';

const routes: Routes = [
  { path: '', component: UsersModuleComponent, redirectTo: 'searchUsers', pathMatch: 'full' },
  { path: 'searchUsers', component: SearchUserComponent },
  { path: 'addUser', component: AddUserComponent },
  { path: 'view/:id', component: AddUserComponent },
  { path: 'userRoles', component: UserRolesComponent },
  { path: 'view', component: AddUserComponent },
  { path: 'roles', component: UserRolesComponent },
  { path: 'roles/add', component: UserRolesAddEditComponent  },
  { path: 'roles/edit/:id', component: UserRolesAddEditComponent ,canDeactivate :[CanDeactivateGuard]},
  { path: 'roles/copy/:id', component: UserRolesAddEditComponent ,canDeactivate :[CanDeactivateGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class UsersModuleRoutingModule { }
