import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'
import { CommonModule } from '@angular/common';
import { CommonModuleModule} from './../common-module/common-module.module'
import { SharedModule }     from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginModuleRoutingModule } from './login-module-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { OtpComponent } from './otp/otp.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    LoginModuleRoutingModule,
    ReactiveFormsModule,
    CommonModuleModule,
    SharedModule
  ],
 
  declarations: [
    LoginComponent,
    ForgotPasswordComponent,
    OtpComponent,
  ]
})
export class LoginModuleModule { }
