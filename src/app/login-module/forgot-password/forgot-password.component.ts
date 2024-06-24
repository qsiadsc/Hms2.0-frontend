import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommonApi } from '../../common-module/common-api'
import { Router, ActivatedRoute } from '@angular/router'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  providers: [HmsDataServiceService, ToastrService]
})
export class ForgotPasswordComponent implements OnInit {
  disabledItem: boolean = false;
  loginType: string = 'QC'; // Define Variable for the login type i.e quikcard / alberta
  forgotform: FormGroup
  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private router: Router,
    private toastrService: ToastrService,
    public currentUserService: CurrentUserService
  ) { }

  /**
   * Call On page load
   */
  ngOnInit() {
    this.currentUserService.buttonText = "Submit";
    this.forgotform = new FormGroup({
      mail: new FormControl('', [Validators.required, CustomValidators.vaildUsername]),
    })
    if (this.router.url == '/albertalogin/forgotpassword') {
      this.loginType = 'AB'
    } else if (this.router.url == '/ahclogin/forgotpassword') {
      this.loginType = 'AHC'
    } else if (this.router.url == '/doctorlogin/forgotpassword') {
      this.loginType = 'DOC'
    } else if (this.router.url == '/govlogin/forgotpassword') {
      this.loginType = 'GOV'
    } else if (this.router.url == '/uftlogin/forgotpassword') {
      this.loginType = 'UFT'
    } else {
      this.loginType = 'QC'
    }
  }

  /**
   * Validate forgot password from fields
   * @param formGroup 
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
   * Submit the forgot password form
   */
  forgotpass() {
    if (this.forgotform.valid) {
      this.currentUserService.disabledItem = true;
      this.currentUserService.buttonText = "Processing....";      
      let requiredInfo = { email: this.forgotform.get('mail').value }
      this.hmsDataServiceService.forgot(CommonApi.forgotUrl, requiredInfo).subscribe(data => {
        if (data.code == '404') {
          this.toastrService.error('Invalid Username!')
          this.currentUserService.buttonText = "Submit";
          this.currentUserService.disabledItem = false;
        } else {
          this.toastrService.success('Temporary password has been sent to your email');
          this.currentUserService.buttonText = "Submit";
          this.currentUserService.disabledItem = false;
          setTimeout(() => {
            this.router.navigate(['quikcardlogin']);
          }, 3000);
        }
      });
    } else {
      this.currentUserService.buttonText = "Submit";
      this.currentUserService.disabledItem = false;
      this.validateAllFormFields(this.forgotform);
    }
  }

  /**
   * Call Forgot password function on press enter
   * @param event 
   */
  onKeyPress(event) {
    if (event.keyCode == 13) {
      this.forgotpass();
    }
  }

}
