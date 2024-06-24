import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginHeaderComponent } from './shared/login-header/login-header.component';
import { MainHeaderComponent } from './shared/main-header/main-header.component';
import { MainFooterComponent } from './shared/main-footer/main-footer.component';
import { MainSidebarComponent } from './shared/main-sidebar/main-sidebar.component';
import { AuthGuardService } from './common-module/shared-services/auth-guard.service';
import { NotfoundComponent } from './notfound/notfound.component';

const routes: Routes = [
    { path: '', redirectTo: '/quikcardlogin', pathMatch: 'full' },
    {
        path: '', children: [
            { path: '', component: LoginHeaderComponent, outlet: 'header' },
            { path: 'quikcardlogin', loadChildren: './login-module/login-module.module#LoginModuleModule' },
            { path: 'albertalogin', loadChildren: './login-module/login-module.module#LoginModuleModule' },
            { path: 'ahclogin', loadChildren: './login-module/login-module.module#LoginModuleModule' },
            { path: 'doctorlogin', loadChildren: './login-module/login-module.module#LoginModuleModule' },
            { path: 'govlogin', loadChildren: './login-module/login-module.module#LoginModuleModule' },
            { path: 'uftlogin', loadChildren: './login-module/login-module.module#LoginModuleModule' }
        ],
    },
    {
        path: '', children: [
            { path: '', component: MainHeaderComponent, outlet: 'header' },
            { path: '', component: MainFooterComponent, outlet: 'footer' },
            { path: '', component: MainSidebarComponent, outlet: 'sidebar' },
            { path: 'card', loadChildren: './card-module/card-module.module#CardModuleModule', canActivate: [AuthGuardService] },
            { path: 'company', loadChildren: './company-module/company-module.module#CompanyModuleModule', canActivate: [AuthGuardService] },
            { path: 'rules', loadChildren: './rules-module/rules-module.module#RulesModuleModule', canActivate: [AuthGuardService] },
            { path: 'claim', loadChildren: './claim-module/claim-module.module#ClaimModule', canActivate: [AuthGuardService] },
            { path: 'serviceProvider', loadChildren: './service-provider-module/service-provider-module.module#ServiceProviderModule', canActivate: [AuthGuardService] },
            { path: 'users', loadChildren: './users-module/users-module.module#UsersModuleModule', canActivate: [AuthGuardService] },
            { path: 'feeGuide', loadChildren: './fee-guide-module/fee-guide-module.module#FeeGuideModule', canActivate: [AuthGuardService] },
            { path: 'finance', loadChildren: './finance-module/finance-module.module#FinanceModuleModule', canActivate: [AuthGuardService] },
            { path: 'unitFinancialTransaction', loadChildren: './unit-financial-transaction-module/unit-financial-transaction-module.module#UnitFinancialTransactionModuleModule', canActivate: [AuthGuardService] },
            { path: 'admin', loadChildren: './admin-rate-module/admin-rate-module.module#AdminRateModuleModule', canActivate: [AuthGuardService] },
            { path: 'reports', loadChildren: './reports-module/reports-module.module#ReportsModuleModule', canActivate: [AuthGuardService] },
            { path: 'iTransViewer', loadChildren: './itrans-viewer-module/itrans-viewer-module.module#ItransViewerModuleModule', canActivate: [AuthGuardService] },
            { path: 'domain', loadChildren: './domain-module/domain-module.module#DomainModuleModule', canActivate: [AuthGuardService] },
            //Added by Ashwani on 14/07/2020
            { path: 'qsi-loader-report', loadChildren: './qsi-loader-report-module/qsi-loader-report-module.module#QsiLoaderReportModuleModule', canActivate: [AuthGuardService] },
        ]
    },
    {
        path: 'reviewer', children: [
            { path: '', component: MainHeaderComponent, outlet: 'header' },
            { path: '', component: MainFooterComponent, outlet: 'footer' },
            { path: '', loadChildren: './review-web-app/review-web-app.module#ReviewWebAppModule', canActivate: [AuthGuardService] },
        ]
    },
    {
        path: 'dataEntry', children: [
            { path: '', component: MainHeaderComponent, outlet: 'header' },
            { path: '', component: MainFooterComponent, outlet: 'footer' },
            { path: '', loadChildren: './data-entry-module/data-entry-module.module#DataEntryModuleModule', canActivate: [AuthGuardService] },
        ]
    },
    {
        path: 'claimDashboard', children: [
            { path: '', component: MainHeaderComponent, outlet: 'header' },
            { path: '', component: MainFooterComponent, outlet: 'footer' },
            { path: '', loadChildren: './claim-dashboard-module/claim-dashboard-module.module#ClaimDashboardModuleModule', canActivate: [AuthGuardService] },
        ]
    },
    {
        path: 'files', children: [
            { path: '', component: MainHeaderComponent, outlet: 'header' },
            { path: '', component: MainFooterComponent, outlet: 'footer' },
            { path: '', loadChildren: './files-module/files-module.module#FilesModuleModule', canActivate: [AuthGuardService] },
        ]
    },
    {
        path: 'qsi', children: [
            { path: '', component: MainHeaderComponent, outlet: 'header' },
            { path: '', component: MainFooterComponent, outlet: 'footer' },
            { path: '', loadChildren: './qsi-loader-module/qsi-loader-module.module#QsiLoaderModuleModule', canActivate: [AuthGuardService] },
        ]
    },
    {
        path: 'dataManagement', children: [
            { path: '', component: MainHeaderComponent, outlet: 'header' },
            { path: '', component: MainFooterComponent, outlet: 'footer' },
            { path: '', loadChildren: './data-management-dashboard-module/data-management-dashboard-module.module#DataManagementDashboardModuleModule', canActivate: [AuthGuardService] },
        ]
    },
    {
        path: 'referToReview', children: [
            { path: '', component: MainHeaderComponent, outlet: 'header' },
            { path: '', component: MainFooterComponent, outlet: 'footer' },
            { path: '', loadChildren: './refer-to-review-module/refer-to-review-module.module#ReferToReviewModuleModule', canActivate: [AuthGuardService] },
        ]
    },
    { path: '404', component: NotfoundComponent },
    { path: '**', redirectTo: '/404' },
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }