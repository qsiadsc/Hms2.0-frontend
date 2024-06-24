import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinanceModuleComponent } from './finance-module.component';
import { CanDeactivateGuard } from './../common-module/shared-resources/screen-lock/can-deactivate/can-deactivate.guard';
import { TransactionCodeComponent } from './transaction-code/transaction-code.component';
import { TaxRatesComponent } from './tax-rates/tax-rates.component';
import { PaymentGenerateComponent } from './payment-generate/payment-generate.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { TransactionSearchComponent } from './transaction-search/transaction-search.component';
import { FinancePayableComponent } from './finance-payable/finance-payable.component';
import { UftFinancepaybleComponent } from '../unit-financial-transaction-module/dashboard/uft-financepayble/uft-financepayble.component';
import { OriginatorComponent } from './originator/originator.component';
import { PaymentSearchComponent } from './payment-search/payment-search.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';

const routes: Routes = [
  { path: '', component: FinanceModuleComponent, pathMatch: 'full',canDeactivate: [CanDeactivateGuard]  },
  { path: 'transaction', component: TransactionCodeComponent },
  { path :'taxRates', component:TaxRatesComponent},
  { path :'transaction-search/payment', component:PaymentGenerateComponent},
  { path :'transaction-search/transactionDetails', component:TransactionDetailsComponent},
  { path :'transaction-search', component: TransactionSearchComponent },
  { path :'finance-payable', component: FinancePayableComponent },
  { path :'originator', component: OriginatorComponent},
  { path :'payment-search', component: PaymentSearchComponent},
  { path :'payment-search/paymentDetails', component: PaymentDetailsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceModuleRoutingModule { }
