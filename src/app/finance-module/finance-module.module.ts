import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceModuleComponent } from './finance-module.component'
import { FinanceModuleRoutingModule } from './finance-module-routing.module';
import { TransactionCodeComponent } from './transaction-code/transaction-code.component';
import { MyDatePickerModule } from 'mydatepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModuleModule} from './../common-module/common-module.module';
import { TaxRatesComponent } from './tax-rates/tax-rates.component';
import { SharedModule } from './../shared/shared.module';
import { PaymentGenerateComponent } from './payment-generate/payment-generate.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { TransactionSearchComponent } from './transaction-search/transaction-search.component';
import { FinancePayableComponent } from './finance-payable/finance-payable.component';
import { Ng2CompleterModule } from "ng2-completer";
import { OriginatorComponent } from './originator/originator.component';
import { FinanceService } from './finance.service'
// Generic Datatable
import { GenericTableModule } from '@angular-generic-table/core';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { PaymentSearchComponent } from './payment-search/payment-search.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';

@NgModule({
  imports: [
    CommonModule,
    MyDateRangePickerModule ,
    FormsModule,
    ReactiveFormsModule,
    FinanceModuleRoutingModule,
    MyDatePickerModule,
    CommonModuleModule,
    SharedModule,
    Ng2CompleterModule,
    GenericTableModule
  ],
  declarations: [TransactionCodeComponent,FinanceModuleComponent, TaxRatesComponent, PaymentGenerateComponent, TransactionDetailsComponent, TransactionSearchComponent,FinancePayableComponent, OriginatorComponent, PaymentSearchComponent, PaymentDetailsComponent],
  providers: [FinanceService]
})
export class FinanceModuleModule { }
