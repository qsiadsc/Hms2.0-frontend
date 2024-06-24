import { Component, OnInit, Input, Compiler } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'
import { ToastrService } from 'ngx-toastr';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommonApi } from '../../common-module/common-api'
import { HttpClient, HttpHeaders, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Constants } from '../../common-module/Constants'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
  providers: [ChangeDateFormatService]
})
export class OtpComponent implements OnInit {
  otpForm: FormGroup
  appHeaderMenu
  authToken: string;
  roleLabel: any;
  timeLeft: number = 60;
  minuteLeft: number = 5;
  interval;
  showLoader: boolean = false;
  phoneMask = CustomValidators.phoneMask;
  apiResponse: any;
  disabledItem: boolean = false;
  redirectURL: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  constructor(private router: Router,
    private _compiler: Compiler,
    private http: HttpClient,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    public currentUserService: CurrentUserService,
    private toastrService: ToastrService,
  ) {

  }

  ngOnInit() {
    this.currentUserService.buttonText = "Submit";
    this.otpForm = new FormGroup({
      otp: new FormControl('', Validators.required)
    })
  }

  onBlur1() {
  }
  onKeyPress() {

  }

  onBlur() {
  }

  submitOTP() {
    if (this.otpForm.valid) {
      this.currentUserService.disabledItem = true;
      this.currentUserService.buttonText = "Processing....";
      this.verifyOTP(+localStorage.getItem('id')).then(res => {
        this.currentUserService.getUserAuthorization().then(res => {
          this.currentUserService.showLoader = false
          this.appHeaderMenu = this.currentUserService.appHeaderRoleMenu
          let userMenuRefKey = this.currentUserService.currentUser.userMenuRefKey
          let userMenu = this.currentUserService.allAppMenu.filter(val => (val.parentMenu == userMenuRefKey));
          let userMenuRoleCheck = 0;
          if (userMenu.length > 0) {
            for (var n = 0; n < userMenu.length; n++) {
              if (userMenu[n].actionAccess == true) {
                userMenuRoleCheck = n;
                break;
              }
            }
            for (var j = 0; j < this.currentUserService.menuByRoles.length; j++) {
              for (var k = 0; k < this.currentUserService.menuByRoles[j].subMenu.length; k++) {
                for (var l = 0; l < this.currentUserService.menuByRoles[j].subMenu[k].children.length; l++) {
                  if (this.currentUserService.menuByRoles[j].subMenu[k].children[l].menuShortDesc == userMenu[userMenuRoleCheck].menuShortDesc) {
                    this.currentUserService.applicationRoleKey = this.currentUserService.menuByRoles[j].menuKey
                    switch (+this.currentUserService.menuByRoles[j].menuKey) {
                      case 1:
                        localStorage.setItem('role', "");
                        break;
                      case 2:
                        localStorage.setItem('role', "reviewer");
                        break;
                      case 3:
                        localStorage.setItem('role', "govOfficial");
                        break;
                      case 4:
                        localStorage.setItem('role', "dataEntry");
                        break;
                    }
                    if (this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink) {
                      if (this.currentUserService.menuByRoles[j].subMenu[k].children[l].menuShortDesc == 'DBC') {
                        if (this.currentUserService.currentUser.businessType.bothAccess) {
                          this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink]);
                        } else if (this.currentUserService.currentUser.businessType.isAlberta) {
                          this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink + '/alberta']);
                        } else {
                          this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink]);
                        }
                      } else {
                        this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink]);
                      }
                    } else {
                      this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].routerLink]);
                    }
                  }
                }
              }
            }
          } else {
            if (this.appHeaderMenu.length > 1) {
              $('#appMenuPopupBtn').click();
            } else if (this.appHeaderMenu.length == 0) {
              this.toastrService.error("You don't have access");
            } else {
              this.appMenuRedirection(this.appHeaderMenu[0].hmsAppKey);
            }
          }
        });
      })
    } else {
      this.currentUserService.disabledItem = false;
      this.currentUserService.buttonText = "Submit";
      this.validateAllFormFields(this.otpForm)
    }
  }

  appMenuRedirection(hmsAppKey) {
    $('#resetappHeaderMenu').click();
    this.currentUserService.applicationRoleKey = hmsAppKey
    switch (hmsAppKey) {
      case 1:
        localStorage.setItem('role', "");
        let redirectHmsVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'DBC').map(data => data)
        if (redirectHmsVal[0] && redirectHmsVal[0].menuAccess == true) {
          this.router.navigate(['claimDashboard']);
        } else {
          this.getFirstUrl(this.currentUserService.operatorHeader)
        }
        break;
      case 2:
        localStorage.setItem('role', "reviewer");
        let redirectDoctorVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'DAD').map(data => data)
        if (redirectDoctorVal[0] && redirectDoctorVal[0].menuAccess == true) {
          this.router.navigate(['reviewer']);
        } else {
          this.getFirstUrl(this.currentUserService.operatorHeader)
        }
        break;
      case 3:
        localStorage.setItem('role', "govOfficial");
        let redirectReviewerrVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'RAD').map(data => data)
        if (redirectReviewerrVal[0] && redirectReviewerrVal[0].menuAccess == true) {
          this.router.navigate(['reviewer']);
        } else {
          this.getFirstUrl(this.currentUserService.operatorHeader)
        }
        break;
      case 4:
        localStorage.setItem('role', "dataEntry");
        let redirectAhcrVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'AHD').map(data => data)
        if (redirectAhcrVal[0] && redirectAhcrVal[0].menuAccess == true) {
          this.router.navigate(['dataEntry/dashboard']);
        } else {
          this.getFirstUrl(this.currentUserService.operatorHeader)
        }
        break;
    }
  }

  getFirstUrl(operatorHeader) {
    let firstElem = operatorHeader.filter(val => val.menuAccess == true).map(data => data)
    let childElem: any
    if (firstElem == '') {
      this.toastrService.error("You don't have access")
      return false
    } else {
      if (firstElem[0].children.length > 0) {
        childElem = firstElem[0].children
        let firstChild = childElem.filter(val => val.actionAccess == true).map(data => data)
        this.redirectURL = firstChild[0]['routerLink']
      } else {
        this.redirectURL = firstElem[0]['routerLink']
      }
      this.router.navigate([this.redirectURL]);
    }
  }


  getUserRoleId(userId) {
    let promise = new Promise((resolve, reject) => {
      let userDataJson = {
        "userId": userId
      }
      var URL = CommonApi.getUserWithRole;
      this.apiResponse = this.http.post(URL, JSON.stringify(userDataJson), { headers: { 'content-type': 'application/json', "Authorization": "bearer " + this.authToken } })
        .map(response => response)
        .catch((e: any) => Observable.throw(console.log("error")));
      this.apiResponse.subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          this.currentUserService.currentUser = data.result
          this.roleLabel = data.result.roles[0].role
          this.roleLabel == 'ROLE_SUPER_ADMIN' ? this.currentUserService.isSuperAdmin = 'T' : this.currentUserService.isSuperAdmin = 'F';
          localStorage.setItem('type', JSON.stringify(data.result.userType));
          localStorage.setItem('roleLabel', this.roleLabel);
          localStorage.setItem('isAdmin', data.result.isAdmin)
          localStorage.setItem('bsnsKey', data.result.userGroupKey)
          this.changeTheme(data.result.businessType[0].businessTypeCd)
          resolve();
        }
      })
    })
    return promise;
  }

  changeTheme(albertaGruopKey) {
    if (albertaGruopKey == Constants.albertaBusinessTypeCd) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '../../assets/css/common-alberta.css';
      link.media = 'all';
      head.appendChild(link);
    } else {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '../../assets/css/common.css';
      link.media = 'all';
      head.appendChild(link);
    }
  }

  verifyOTP(userId) {
    let promise = new Promise((resolve, reject) => {
      let verifyOTPreq = {
        "id": userId,
        "otp": this.otpForm.controls['otp'].value
      }
      var verifyOTPURL = CommonApi.verifyOtpUrl;
      this.hmsDataServiceService.postApi(verifyOTPURL, verifyOTPreq).subscribe(data => {
        if (data.code == 200 && data.status == 'OK' && data.message == 'OTP_MATCHED') {
          this.currentUserService.disabledItem = false;
          this.currentUserService.buttonText = "Submit";
          resolve();
        }
        else if (data.status == 'OK' && data.code == 200 && data.message == 'OTP_EXPIRED') {
          this.currentUserService.disabledItem = false;
          this.currentUserService.buttonText = "Submit";
          this.toastrService.error('OTP Expired. Please Resend OTP.')
        }
        else if (data.status == 'OK' && data.code == 200 && data.message == 'OTP_NOT_MATCHED') {
          this.currentUserService.disabledItem = false;
          this.currentUserService.buttonText = "Submit";
          this.toastrService.error('OTP Mismatch.')
        }
      })
    })
    return promise;
  }

  resendOTP() {
    this.showLoader = true
    let req = { "id": +localStorage.getItem('id') };
    var generateOTPURL = CommonApi.generateOtp;
    this.hmsDataServiceService.postApi(generateOTPURL, req).subscribe(data => {
      if (data.code == 200 && data.status == 'OK' && (data.message == 'OTP_SENT_TO_YOUR_EMAIL_ADDRESS' || data.message == 'OTP_NOT_EXPIRED_YET')) {
        this.showLoader = false
        this.toastrService.success("OTP Sent Successfully on Registered Email Address.")
      }
    })
  }

  /**
   * Method for validate the Form fields
   * @param formGroup 
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}
