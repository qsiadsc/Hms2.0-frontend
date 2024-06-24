import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { OtpComponent } from './otp/otp.component';

const routes: Routes = [
  { path: '', component: LoginComponent,
    children:[
      {
        path:'quikcardlogin',
        component: LoginComponent
      },
      {
        path:'albertalogin',
        component: LoginComponent
      },
      {
        path:'ahclogin',
        component: LoginComponent
      },
      {
        path:'doctorlogin',
        component: LoginComponent
      },
      {
        path:'govlogin',
        component: LoginComponent
      },
      {
        path:'uftlogin',
        component: LoginComponent
      }
    ]
  },  
  { path: 'forgotpassword', component: ForgotPasswordComponent },  
  { path: 'otp', component: OtpComponent },  
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginModuleRoutingModule {
 }
