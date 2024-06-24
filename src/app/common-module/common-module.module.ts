import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyDatePickerModule, IMyDate, IMyDateModel } from 'mydatepicker';
import { TextMaskModule } from 'angular2-text-mask';
import { DataTablesModule } from 'angular-datatables';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { CommentModelComponent } from './shared-component/CommentsModal/comment-model/comment-model.component'
import { CommentModelComponentCardholder } from './shared-component/CommentsModal/comment-model-cardholder/comment-model.component'
import { SearchCompanyComponent } from './shared-component/search-company/search-company.component';
import { BankAccountComponent } from './shared-component/bank-account/bank-account.component';
import { CommentEditModelComponent } from './shared-component/comment-edit-model/comment-edit-model.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { CommonModuleComponent } from './common-module.component';
import { OnlyAlphaNumeric } from './directive/OnlyAlphanumeric.directive';
import { ModalModule } from "ngx-modal";
import { DateFormatePipe } from './date-formate.pipe';
import { Ng2CompleterModule } from "ng2-completer";
import { ExportClaimLetterComponent } from '../review-web-app/export-report/export-claim-letter/export-claim-letter.component'
import { ProgressBarModule } from "ngx-progress-bar";
import { CommonRoutingModule } from './common-routing.module';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { CardHolderCobhistoryPopupComponent } from '../card-module/card-holder-cobhistory-popup/card-holder-cobhistory-popup.component';
import { SharedModule } from '../shared/shared.module';
import { TwoDigitDecimaNumberDirective } from './directive/two-digit-decima-number.directive';
import { PendingElectronicAdjustmentComponent } from '../unit-financial-transaction-module/dashboard/pending-electronic-adjustment/pending-electronic-adjustment.component';
@NgModule({
  imports: [CommonModule, FormsModule, MyDatePickerModule, ReactiveFormsModule, TextMaskModule,
    DataTablesModule, InfiniteScrollModule, MultiselectDropdownModule, AngularMultiSelectModule,
    ModalModule, Ng2CompleterModule, ProgressBarModule, CommonRoutingModule, SharedModule
  ],
  declarations: [CommentModelComponent,CommentModelComponentCardholder,
    SearchCompanyComponent, OnlyAlphaNumeric, BankAccountComponent, CommentEditModelComponent,
    CommonModuleComponent, DateFormatePipe, ExportClaimLetterComponent, DashboardTabComponent
    , CardHolderCobhistoryPopupComponent, TwoDigitDecimaNumberDirective, PendingElectronicAdjustmentComponent],

  exports: [CommentModelComponent,CommentModelComponentCardholder, SearchCompanyComponent,
    CommonModule, FormsModule, MyDatePickerModule, ReactiveFormsModule, TextMaskModule, DataTablesModule,
    InfiniteScrollModule, MultiselectDropdownModule, BankAccountComponent, CommentEditModelComponent, OnlyAlphaNumeric,
    CardHolderCobhistoryPopupComponent, ModalModule, DateFormatePipe, ExportClaimLetterComponent, AngularMultiSelectModule, ProgressBarModule, DashboardTabComponent, TwoDigitDecimaNumberDirective, PendingElectronicAdjustmentComponent],

  providers: [DateFormatePipe]
})

export class CommonModuleModule { }