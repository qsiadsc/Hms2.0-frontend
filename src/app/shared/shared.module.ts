import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginHeaderComponent } from './login-header/login-header.component';
import { MainHeaderComponent } from './main-header/main-header.component';
import { MainSidebarComponent } from './main-sidebar/main-sidebar.component';
import { MainFooterComponent } from './main-footer/main-footer.component';
import { CardServiceService} from './../card-module/card-service.service';
import { Router, ActivatedRoute , RouterLinkActive,RouterModule} from '@angular/router';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { ShowErrorsComponent } from '../errors.component'
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
/* Language translate Start */
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
/* Language translate End */

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

import { LanguageTranslatorService } from '../common-module/shared-services/language-translator.service';
// For custom location
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
import { MyDatePickerModule } from 'mydatepicker';
import { ChangePasswordComponent } from '../common-module/shared-component/change-password/change-password.component';


@NgModule({
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,    
    HttpClientModule,
    RouterModule,
    MyDatePickerModule,
    AngularMultiSelectModule,
    NgIdleKeepaliveModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
      },
      useDefaultLang: true,
    }),
  ],
  exports:[
    LoginHeaderComponent,
    MainHeaderComponent,
    MainSidebarComponent,    
    FormsModule,
    ReactiveFormsModule,    
    HttpClientModule,
    TranslateModule,
    MainFooterComponent,
    ChangePasswordComponent,
    ShowErrorsComponent
  ],
  declarations: [     
    LoginHeaderComponent,
    MainHeaderComponent,
    MainSidebarComponent,
    MainFooterComponent, 
    ChangePasswordComponent,
    ShowErrorsComponent 
   ],
   providers:[{ provide: LanguageTranslatorService, useClass: LanguageTranslatorService,},CardServiceService],
   
})
export class SharedModule {
  constructor(public lan : LanguageTranslatorService){}
 }
