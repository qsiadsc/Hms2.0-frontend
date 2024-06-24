import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import 'rxjs/add/operator/map';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CompanyApi } from '../../../company-module/company-api'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  providers: [TranslateService]
})

export class ChangePasswordComponent implements OnInit {
  popUpId: string;
  public changePasswordForm: FormGroup; // change private to public for production-errors
  @Input() setType: any
  showHideOldPassword: any;
  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.setType
    this.changePasswordForm = new FormGroup({
      'oldPassword': new FormControl('', []),
      'newPassword': new FormControl('', [Validators.required, CustomValidators.validPassword]),
      'confirmPassword': new FormControl('', [Validators.required]),
    });
  }

  /**
   * Update User Password
   */
  onSubmitChangePassword() {
    let bankData = {
      "userId": 1,
      "oldPassword": 123,
      "password": 1234,
    }
    var URL = CompanyApi.changePasswordUrl;
    this.hmsDataServiceService.post(URL, bankData).subscribe(data => {
      if (data.code == 200 && data.status == 'ok') {
        this.toastr.success(this.translate.instant('Password Updated successfully!'));
      }
      else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == 'OLD_PASSWORD_DOES_NOT_MATCH') {
        this.toastr.error(this.translate.instant('Old Password Does Not Match!'));
      }
    });
  }

  /**
  * Validate the Password and confirm password
  * @param changePasswordForm 
  */
  validateConfirmPassword(changePasswordForm) {
    if (changePasswordForm.value.newPassword != '' && changePasswordForm.value.confirmPassword != '') {
      if (changePasswordForm.value.newPassword != changePasswordForm.value.confirmPassword) {
        changePasswordForm.controls['confirmPassword'].setErrors({
          "passwordMismatch": true
        });
      } else {
        changePasswordForm.controls['confirmPassword'].setErrors(null);
      }
    }
  }

  /**
   * Reset The Change Password Form
   */
  resetChangePasswordForm() {
    this.changePasswordForm.reset();
  }

  /**
   * Ptach and unpatch the validation in the Change Password PopUp
   * @param type 
   */
  changePassword(type) {   
    if (type == 'Self') {
      this.hmsDataServiceService.OpenCloseModal('changePasswordButtonPopUpSelf');
      this.changePasswordForm.controls['oldPassword'].setErrors({
        "oldPasswordRequired": true
      });
    } else {
      this.hmsDataServiceService.OpenCloseModal('changePasswordButtonPopUpOther');
      this.changePasswordForm.controls['oldPassword'].setErrors(null);
    }
  }

}
