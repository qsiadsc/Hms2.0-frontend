import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitFinancialTransactionModuleRoutingModule } from './unit-financial-transaction-module-routing.module';
import { UnitFinancialTransactionComponent } from './unit-financial-transaction/unit-financial-transaction.component';
import { UnitFinancialTransactionModuleComponent } from './unit-financial-transaction-module.component'
import { MyDatePickerModule } from 'mydatepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModuleModule } from './../common-module/common-module.module';
import { SharedModule } from './../shared/shared.module';
import { Ng2CompleterModule } from "ng2-completer";
import { RefundChequeComponent } from './refund-cheque/refund-cheque.component';
import { UpcomingTransactionComponent } from './upcoming-transaction/upcoming-transaction.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { UftContinutyComponent } from './dashboard/uft-continuty/uft-continuty.component';
import { UftContinutyComponentCallin } from './dashboard/uft-continuty-call-in/uft-continuty-call-in.component';
import { BankReconcilationComponent } from './dashboard/bank-reconcilation/bank-reconcilation.component';
import { CompCardHolderContinutyComponent } from './dashboard/comp-card-holder-continuty/comp-card-holder-continuty.component';
import { CompBalanceComponent } from './dashboard/comp-balance/comp-balance.component';
import { PendingFundsComponent } from './dashboard/pending-funds/pending-funds.component';
import { BrokerPaymentsComponent } from './dashboard/broker-payments/broker-payments.component';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatePipe } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from './../common-module/shared-services/datatable.service';
import { ClaimService } from '../claim-module/claim.service';
import { CompanyService } from '../company-module/company.service';
import { FinanceReportsComponent } from './dashboard/finance-reports/finance-reports.component';
import { FinanceReportListComponent } from './dashboard/finance-report-list/finance-report-list.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { GenericTableModule } from '@angular-generic-table/core';
import { UftFinancepaybleComponent } from './dashboard/uft-financepayble/uft-financepayble.component';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { FinanceService } from '../../app/finance-module/finance.service';
import { FinanceCallComponent } from './dashboard/finance-call/finance-call.component';
import { FinanceReportCallInComponent } from './dashboard/finance-report-call-in/finance-report-call-in.component';
import { TerminationRefundsComponent } from './dashboard/termination-refunds/termination-refunds.component';
import { ReceivableAdjustmentsComponent } from './dashboard/receivable-adjustments/receivable-adjustments.component';

@NgModule({
  imports: [
    CommonModule,
    MyDateRangePickerModule ,
    UnitFinancialTransactionModuleRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MyDatePickerModule,
    CommonModuleModule,
    SharedModule,
    Ng2CompleterModule,
    ChartsModule,
    PdfViewerModule,
    GenericTableModule,
    MyDateRangePickerModule
  ],
  declarations: [UnitFinancialTransactionModuleComponent, UnitFinancialTransactionComponent, RefundChequeComponent, UpcomingTransactionComponent, DashboardComponent, UftContinutyComponent,UftContinutyComponentCallin, BankReconcilationComponent,CompCardHolderContinutyComponent, CompBalanceComponent, PendingFundsComponent, BrokerPaymentsComponent,  FinanceReportsComponent, FinanceReportListComponent, UftFinancepaybleComponent, FinanceCallComponent, FinanceReportCallInComponent, TerminationRefundsComponent, ReceivableAdjustmentsComponent],
  providers: [ChangeDateFormatService,DatePipe,DatatableService,ClaimService, CompanyService,FinanceService]
})
export class UnitFinancialTransactionModuleModule { }
