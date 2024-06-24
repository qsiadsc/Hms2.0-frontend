import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DataEntryApi } from '../data-entry-api'
import { Constants } from '../../common-module/Constants';
import { TextMaskModule } from 'angular2-text-mask';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-data-entry-account',
  templateUrl: './data-entry-account.component.html',
  styleUrls: ['./data-entry-account.component.css'],
  providers: [HmsDataServiceService, ToastrService, TranslateService]
})
export class DataEntryAccountComponent implements OnInit {
  accountSetUpForm: FormGroup;
  authCheck = [{
    'saveAccount':'F',
    'viewAccount':'F'
  }]
  constructor(
    private translate: TranslateService,
    private hmsDataServiceService: HmsDataServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private _router: Router,
    private currentUserService: CurrentUserService,
  ) { }
  
  ngOnInit() {
    if(localStorage.getItem('isReload')=='T'){
      this.currentUserService.getUserAuthorization().then(res=>{
        let checkArray = this.currentUserService.authChecks['ACB']
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload','')
      })
    }else{
      let checkArray = this.currentUserService.authChecks['ACB']
      this.getAuthCheck(checkArray)
    }
    this.accountSetUpForm = new FormGroup({
      'oldPassword': new FormControl('', Validators.required),
      'newPassword': new FormControl('', [Validators.required, CustomValidators.validPassword]),
      'confirmPassword': new FormControl('', Validators.required),
    });
  }
  getAuthCheck(ahcChecks){
    let authCheck = []
    if(localStorage.getItem('isAdmin') == 'T'){
      this.authCheck = [{
        'saveAccount':'T',
        'viewAccount':'T'
      }]
    }else{
      for(var i= 0; i < ahcChecks.length; i++ ){
        authCheck[ahcChecks[i].actionObjectDataTag] = ahcChecks[i].actionAccess
      }
      this.authCheck = [{
        'viewAccount':authCheck['DAC337'],
        'saveAccount':authCheck['DAC255'],
      }]
    }
  }
  /**
   * Update User Password
   */
  updatePassword(accountSetUpForm) {
    if (accountSetUpForm.valid) {
      let passwordObj = {
        "oldPassword": accountSetUpForm.value.oldPassword,
        "newPassword": accountSetUpForm.value.newPassword,
        "confirmPassword": accountSetUpForm.value.confirmPassword,
      }
      this.hmsDataServiceService.postApi(DataEntryApi.updatePassword,
        passwordObj).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            this.toastr.success(this.translate.instant('dataEntry.account.toaster.passwordUpdatedSuccessfully'));
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == 'INVALID_OLD_PASSWORD') {
            this.toastr.error(this.translate.instant('dataEntry.account.toaster.invalidOldPassword'));
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == 'NEW_PASSWORD_NOT_MATCHED_TO_CONFIRM_PASSWORD') {
            this.toastr.error(this.translate.instant('dataEntry.account.toaster.newPasswordNotMatchToOldPassword'));
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == 'PASSWORD_DONOT_MATCH_AS_REQUIRED') {
            this.toastr.error(this.translate.instant('dataEntry.account.toaster.passwordNotMatchAsRequired'));
          }
          else {
            this.toastr.error(this.translate.instant('dataEntry.account.toaster.someErrorOccured'));
          }
        });
    }
    else {
      this.validateAllFormFields(accountSetUpForm);
    }
  }

  /**
   * Validate Update Password Form
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
   * Validate the Password and confirm password
   * @param accountSetUpForm 
   */
  validateConfirmPassword(accountSetUpForm){
    if(accountSetUpForm.value.newPassword != '' && accountSetUpForm.value.confirmPassword != ''){
      if(accountSetUpForm.value.newPassword != accountSetUpForm.value.confirmPassword){
        accountSetUpForm.controls['confirmPassword'].setErrors({"passwordMismatch": true
      });
      }else{
        accountSetUpForm.controls['confirmPassword'].setErrors(null);
      }
    }
  }
  
}
