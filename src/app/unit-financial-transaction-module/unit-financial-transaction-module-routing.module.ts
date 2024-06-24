import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnitFinancialTransactionModuleComponent } from './unit-financial-transaction-module.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { UpcomingTransactionComponent } from './upcoming-transaction/upcoming-transaction.component';
import { UnitFinancialTransactionComponent } from './unit-financial-transaction/unit-financial-transaction.component';
import { RefundChequeComponent } from './refund-cheque/refund-cheque.component';
import { DashboardComponent } from './dashboard/dashboard.component'

const routes: Routes = [
  { path :'', component:UnitFinancialTransactionComponent},
  { path :'refund-cheque', component:RefundChequeComponent},
  { path :'upcoming-transaction', component:UpcomingTransactionComponent},
  { path :'uft-dashboard', component:DashboardComponent},
  { path :'dashboard', component:DashboardComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitFinancialTransactionModuleRoutingModule {}
