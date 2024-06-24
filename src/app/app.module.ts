import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { CurrentUserService } from './common-module/shared-services/hms-data-api/current-user.service';
import { HmsDataServiceService, HmsInterceptor } from './common-module/shared-services/hms-data-api/hms-data-service.service';
import { MomentModule } from 'angular2-moment';
import { DialogModule } from "./common-module/shared-component/ngx-dialog/dialog.module";
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AuthGuardService } from './common-module/shared-services/auth-guard.service';
import { HotkeyModule } from 'angular2-hotkeys';
import { NotfoundComponent } from './notfound/notfound.component';
import { ModalModule } from "ngx-modal";
import { ReviewWebAppComponent } from './review-web-app/review-web-app.component';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent,
    ReviewWebAppComponent
  ],
  exports: [AppComponent, SharedModule],
  imports: [
    SharedModule,
    BrowserModule,
    NguiAutoCompleteModule,
    HttpModule,
    NgbModule.forRoot(),
    AppRoutingModule,
    MomentModule,
    DialogModule,
    BrowserAnimationsModule,
    ModalModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      closeButton: true,
      tapToDismiss: true,
      maxOpened: 1
    }),
    HotkeyModule.forRoot(),
  ],
  providers: [CookieService, CurrentUserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HmsInterceptor,
      multi: true,
    }, HmsDataServiceService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }