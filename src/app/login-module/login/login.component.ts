import { Component, OnInit, Input, Compiler } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'
import { CookieService } from 'ngx-cookie-service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { LoginService } from '../login.service'
import { CommonApi } from '../../common-module/common-api'
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../../common-module/Constants'
import { DataEntryApi } from '../../data-entry-module/data-entry-api';
import { HttpClient, HttpHeaders, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CommonModuleComponent } from '../../common-module/common-module.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService, HmsDataServiceService, CommonModuleComponent]
})

export class LoginComponent implements OnInit {
  redirectURL: any;
  userTypeArray: any[];
  loginType: string = 'QC';
  authToken: string;
  id: any
  userName: string;
  userId: number;
  email: string;
  loginForm: FormGroup
  FunctionCentreDetails: any;
  showLoader: boolean = false
  apiResponse: any;
  roleId: any;
  roleLabel: any;
  userTypeKey: any;
  bsnsKey: any;
  currentUser: any;
  appMenuPopup: boolean = false
  public appMenus: FormGroup;
  appHeaderMenu
  disabledItem: boolean = false;
  text: string = "Login";
  isPassword = true;
  redirectiontxt;
  istestServer = Constants.testServer;
  constructor(private router: Router, private cookieService: CookieService,
    private loginService: LoginService,
    private hmsDataServiceService: HmsDataServiceService,
    public currentUserService: CurrentUserService,
    private toastrService: ToastrService,
    private http: HttpClient,
    private CommonComponent: CommonModuleComponent,
    private _compiler: Compiler
  ) {
    try {
      if (localStorage.getItem('id')) {
        if (localStorage.getItem('id') != '0') {
          let path = localStorage.getItem('home').toString();
          this.showLoader = true;
          location.href = path 
        }
      }
    } catch (error) {
      this.showLoader=false
    }
  }

  ngOnInit() {
    document.getElementById('email').focus();
    this.currentUserService.loginText = "Login";
    this.loginForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    })
    var userInfo = localStorage.getItem('userCredential');
    let role = localStorage.getItem('role');
    if (this.authToken != '' && (role == "reviewer" || role == "govOfficial")) {
      window.location.href = 'reviewer'
    } else if (this.authToken != '' && role == "dataEntry") {
      window.location.href = 'dataEntry'
    } else if (userInfo) {
      this.router.navigate(['company']);
    } else {
      if (this.router.url == '/albertalogin') {
        this.loginType = 'AB'
        localStorage.setItem('loginFrom', "albertalogin");
        this.router.navigate(['albertalogin']);
      } else if (this.router.url == '/ahclogin') {
        this.loginType = 'AHC'
        localStorage.setItem('loginFrom', "ahclogin");
        this.router.navigate(['ahclogin']);
      } else if (this.router.url == '/doctorlogin') {
        this.loginType = 'DOC'
        localStorage.setItem('loginFrom', "doctorlogin");
        this.router.navigate(['doctorlogin']);
      } else if (this.router.url == '/govlogin') {
        this.loginType = 'GOV'
        localStorage.setItem('loginFrom', "govlogin");
        this.router.navigate(['govlogin']);
      } else if (this.router.url == '/uftlogin') {
        this.loginType = 'UFT'
        localStorage.setItem('loginFrom', "uftlogin");
        this.router.navigate(['uftlogin']);
      } else {
        this.loginType = 'QC'
        localStorage.setItem('loginFrom', "quikcardlogin");
        this.router.navigate(['quikcardlogin']);
      }
    }
    this.currentUserService.token = 'Basic cXVpa2NhcmQ6dmljdG9yeQ=='
  }

  /**
   * Onclick Unmask Password
   */
  viewPassword() {
    this.isPassword = !(this.isPassword);
  }

  onBlur() {
    var email = this.loginForm.get('email').value;
    var password = this.loginForm.get('password').value;
    this.loginForm = new FormGroup({
      email: new FormControl(email, [Validators.required, CustomValidators.vaildUsername]),
      password: new FormControl(password)
    })
    this.validateAllFormFields(this.loginForm);
  }

  onBlur1() {
    var email = this.loginForm.get('email').value;
    var password = this.loginForm.get('password').value;
    this.loginForm = new FormGroup({
      email: new FormControl(email, [Validators.required, CustomValidators.vaildUsername]),
      password: new FormControl(password, [Validators.required])
    })
    this.validateAllFormFields(this.loginForm);
  }

  onKeyPress(event) {
    if (event.keyCode == 13) {
      this.Login();
    }
  }

  Login() {
    if (this.loginForm.valid) {
      this.currentUserService.disabledItem = true;
      this.currentUserService.loginText = "Processing....";
      var email = this.loginForm.get('email').value;
      var password = this.loginForm.get('password').value;
      var grant_type = "password"
      let requiredInfo = {
        "username": email,
        "password": password,
        "grant_type": 'password'
      }
      var formData = new FormData()
      formData.append('username', email);
      formData.append('password', password);
      formData.append('grant_type', 'password');

      this.hmsDataServiceService.login(CommonApi.loginUrl, formData).subscribe(data => {
        this._compiler.clearCache()
        this.authToken = data.access_token;
        localStorage.setItem('user', data.full_name);
        localStorage.setItem('id', data.user_id);
        localStorage.setItem('isNgOnInitFirst', '0')
        localStorage.setItem('keepAliveCounter', '0')
        localStorage.setItem('currentUser', (this.authToken));
        this.getUserRoleId(+localStorage.getItem('id')).then(res => {
          let req = { "id": data.user_id };
          this.currentUserService.updateToken()
          //Start Checking OTP Status From API          
          var getOtpEmailStatusUrl = CommonApi.getOtpEmailStatusUrl;
          let reqParam = {
            "userKey": data.user_id,
          }
          this.hmsDataServiceService.postApi(getOtpEmailStatusUrl, reqParam).subscribe(data => {
            if (data.code == 200 && data.status == 'OK') {
              //Track API
              //Start Getting Current DateTime
              let loginUserId = localStorage.getItem('id');
              let today = new Date();
              let dd = ("0" + today.getDate()).slice(-2)
              let mm = ("0" + (today.getMonth() + 1)).slice(-2)
              let yyyy = today.getFullYear();
              let CurrentDate = yyyy + '-' + mm + '-' + dd
              let CurrentTime = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
              let fullDateTime = CurrentDate + ' ' + CurrentTime;
              //End Getting Current DateTime
              this.trackApi(loginUserId);
              //User Audit API
              this.setUserAuditDetail();
              let otpStatus = data.result.otpStatusInd;
              this.currentUserService.otpStatus = otpStatus;
              if (otpStatus == "F") {
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
                              case 5:
                                localStorage.setItem('role', "referReviwer");
                                break;
                            }
                            if (this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink) {
                              if (this.currentUserService.menuByRoles[j].subMenu[k].menuShortDesc == 'DBD' && this.currentUserService.menuByRoles[j].subMenu[k].children.length > 0) {
                                for (var n = 0; n < this.currentUserService.menuByRoles[j].subMenu[k].children.length; n++) {
                                  let submenuAccess = this.currentUserService.menuByRoles[j].subMenu[k].children[n];
                                  if (submenuAccess.DBkey == this.currentUserService.currentUser.subMenuKey) {
                                    if (submenuAccess.menuShortDesc == "DBC") {
                                      if (this.currentUserService.currentUser.businessType.bothAccess) {
                                        localStorage.setItem("home", submenuAccess.routerLink)
                                        this.router.navigate([submenuAccess.routerLink]);
                                        break;
                                      } else if (this.currentUserService.currentUser.businessType.isAlberta) {
                                        localStorage.setItem("home", submenuAccess.routerLink + '/alberta')
                                        this.router.navigate([submenuAccess.routerLink + '/alberta']);
                                        break;
                                      } else {
                                        localStorage.setItem("home", submenuAccess.routerLink)
                                        this.router.navigate([submenuAccess.routerLink]);
                                        break;
                                      }
                                    } else {
                                      localStorage.setItem("home", submenuAccess.routerLink)
                                      this.router.navigate([submenuAccess.routerLink]);
                                      break;
                                    }
                                  }
                                }
                                if (this.currentUserService.currentUser.subMenuKey == 0) {
                                  if (this.currentUserService.currentUser.businessType.bothAccess) {
                                    localStorage.setItem("home", this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink)
                                    this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink]);
                                  } else if (this.currentUserService.currentUser.businessType.isAlberta) {
                                    localStorage.setItem("home", this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink + '/alberta')
                                    this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink + '/alberta']);
                                  } else {
                                    localStorage.setItem("home", this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink)
                                    this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink]);
                                  }
                                }
                              } else {
                                localStorage.setItem("home", this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink)
                                this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink]);
                              }
                            } else {
                              localStorage.setItem("home", this.currentUserService.menuByRoles[j].subMenu[k].routerLink)
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
                //End Check
              } else {
                var generateOTPURL = CommonApi.generateOtp;
                this.hmsDataServiceService.postApi(generateOTPURL, req).subscribe(data => {
                  if (data.code == 200 && data.status == 'OK' && (data.message == 'OTP_SENT_TO_YOUR_EMAIL_ADDRESS' || data.message == 'OTP_NOT_EXPIRED_YET')) {
                    this.toastrService.success("OTP Sent Successfully To Your Email Address.")
                    this.router.navigate(['quikcardlogin/otp'])
                  }
                })
              }
            }
          })
          //End Checking OTP Status From API          
        })
      })
    }
    else {
      this.currentUserService.loginText = "Login";
      this.currentUserService.disabledItem = false;
    }
  }
  loginRedirection() {
    try {
      this.showLoader = true
      this.authToken = localStorage.getItem("currentUser")
      this.getUserRoleId(+localStorage.getItem('id')).then(res => {
        let req = { "id": +localStorage.getItem('id') };
        this.currentUserService.updateToken()
        //Start Checking OTP Status From API          
        var getOtpEmailStatusUrl = CommonApi.getOtpEmailStatusUrl;
        let reqParam = {
          "userKey": +localStorage.getItem('id'),
        }
        this.hmsDataServiceService.postApi(getOtpEmailStatusUrl, reqParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            //Track API
            //Start Getting Current DateTime
            let loginUserId = localStorage.getItem('id');
            let today = new Date();
            let dd = ("0" + today.getDate()).slice(-2)
            let mm = ("0" + (today.getMonth() + 1)).slice(-2)
            let yyyy = today.getFullYear();
            let CurrentDate = yyyy + '-' + mm + '-' + dd
            let CurrentTime = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
            let fullDateTime = CurrentDate + ' ' + CurrentTime;
            //End Getting Current DateTime
            this.trackApi(loginUserId);
            //User Audit API
            this.setUserAuditDetail();
            let otpStatus = data.result.otpStatusInd;
            this.currentUserService.otpStatus = otpStatus;
            if (otpStatus == "F") {
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
                            case 5:
                              localStorage.setItem('role', "referReviwer");
                              break;
                          }
                          if (this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink) {
                            if (this.currentUserService.menuByRoles[j].subMenu[k].menuShortDesc == 'DBD' && this.currentUserService.menuByRoles[j].subMenu[k].children.length > 0) {
                              for (var n = 0; n < this.currentUserService.menuByRoles[j].subMenu[k].children.length; n++) {
                                let submenuAccess = this.currentUserService.menuByRoles[j].subMenu[k].children[n];
                                if (submenuAccess.DBkey == this.currentUserService.currentUser.subMenuKey) {
                                  if (submenuAccess.menuShortDesc == "DBC") {
                                    if (this.currentUserService.currentUser.businessType.bothAccess) {
                                      this.router.navigate([submenuAccess.routerLink]);
                                      break;
                                    } else if (this.currentUserService.currentUser.businessType.isAlberta) {
                                      this.router.navigate([submenuAccess.routerLink + '/alberta']);
                                      break;
                                    } else {
                                      this.router.navigate([submenuAccess.routerLink]);
                                      break;
                                    }
                                  } else {
                                    this.router.navigate([submenuAccess.routerLink]);
                                    break;
                                  }
                                }
                              }
                              if (this.currentUserService.currentUser.subMenuKey == 0) {
                                if (this.currentUserService.currentUser.businessType.bothAccess) {
                                  this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink]);
                                } else if (this.currentUserService.currentUser.businessType.isAlberta) {
                                  this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink + '/alberta']);
                                } else {
                                  this.router.navigate([this.currentUserService.menuByRoles[j].subMenu[k].children[l].routerLink]);
                                }
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
              //End Check
            } else {
              var generateOTPURL = CommonApi.generateOtp;
              this.hmsDataServiceService.postApi(generateOTPURL, req).subscribe(data => {
                if (data.code == 200 && data.status == 'OK' && (data.message == 'OTP_SENT_TO_YOUR_EMAIL_ADDRESS' || data.message == 'OTP_NOT_EXPIRED_YET')) {
                  this.toastrService.success("OTP Sent Successfully To Your Email Address.")
                  this.router.navigate(['quikcardlogin/otp'])
                }
              })
            }
          }
        })
        //End Checking OTP Status From API          
      })
    } catch (error) {
      this.currentUser.
        this.router.navigate(['/'])
    }
  }
  trackApi(userKey) {
    var trackApiURL = CommonApi.trackApiUrl;
    let reqParams = {
      "userKey": userKey
    };
  }

  setUserAuditDetail() {
    let URL = CommonApi.setUserAuditDetailUrl;
  }

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

  serializeObj(obj) {
    var result = [];
    for (var property in obj)
      result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));
    return result.join("&");
  }

  redirectDashboard() {
    this.currentUserService.getUserAuthorization().then(res => {
      this.showLoader = false
      this.router.navigate([this.currentUserService.redirectURL])
    })
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
          if (data.result.businessType.length > 0) {
            this.changeTheme(data.result.businessType[0].businessTypeCd)
          } else {
            this.changeTheme('Q')
          }
          resolve();
        }
      })
    })
    return promise;
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

}