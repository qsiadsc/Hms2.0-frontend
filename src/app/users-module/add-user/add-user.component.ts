import { Component, OnInit, HostListener, EventEmitter, Output, ViewChild } from '@angular/core';
import { UsersModuleComponent } from '../users-module.component';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { Location } from '@angular/common';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { UsersApi } from '../users-api'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Constants } from '../../common-module/Constants';
import { TextMaskModule } from 'angular2-text-mask';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompanyService } from '../../company-module/company.service';
import { CompanyApi } from '../../company-module/company-api';
import { ChangePasswordComponent } from '.././../common-module/shared-component/change-password/change-password.component';
import { CommonApi } from '../../common-module/common-api';
import { ClaimApi } from '../../claim-module/claim-api';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  providers: [DatatableService, TranslateService, ChangeDateFormatService, ToastrService, ExDialog]
})

export class AddUserComponent extends FormCanDeactivate implements OnInit {
  showToasterMsg: boolean = false;
  showHideMenu: boolean = false;
  rolesModuledata = [];
  mainMenu = [];
  mainMenuArray = [];
  roleSidebarArray = [];
  checboxArray = [];
  menuData: any;
  subMenuData: any;
  selectedMenuValue: any;
  currentUser: any;
  userEmail: any;
  userStatusSelected: any;
  showHideSubMenu: boolean = false;
  selectedSubMenuValue: any;
  supervisor: any;
  isRoleAssigned: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  FormGroup: FormGroup;
  addEditUserForm: FormGroup;
  addMode = true;
  viewMode = false;
  editMode = false;
  public usersExecPointData: CompleterData;
  public userStatusData: CompleterData;
  usersExecPoint: any;
  selectedUserKey = [];
  selectedUserDesc: any;
  userId: any;
  sub: any;
  dropdownSettings: {};
  lineItemSettings
  applicationAccses = [];
  businessTypeKey = [];
  rolAssigned = [];
  businessType = []
  selectedUserGroup = []
  additonalInfoList = []
  userStatusList = []
  selctedDropDownVal = []
  selctedDropDownUsrType = []
  selctedRoleAssignedKeysArr = [];
  selectedBussType = [];
  deniedLineItem: any;
  showDeniedLineItem: boolean = false
  phoneMask = CustomValidators.phoneMaskV1;
  hideSuspendedButton
  role: string;
  usersAuthCheck = [{
    "editUser": 'F'
  }]
  selectedBusinessTypeValue = [];
  selectedRolAssignedValue: any;
  isCompanyTerminated: string;
  isCompanySuspended: boolean;
  businessTypeList = [];
  bussTypeList = [];
  rolAssignedTypeList = [];
  selectedRoleAssigned = [];
  businessTypeData: any;
  rolAssignedData: any;
  showLoader: boolean = false;
  @Output() selectedBusinessTypeKey = new EventEmitter();
  @Output() selectedRolAssignedKey = new EventEmitter();
  public isOpen: boolean = false;
  @ViewChild("roleAssigned") private roleAssigned: CompleterCmp;
  @ViewChild(ChangePasswordComponent) changePasswordComponent; // to acces variable of ChangePasswordComponent from 
  public changePasswordForm: FormGroup; // change private to public for production-errors

  constructor(private translate: TranslateService,
    private hmsDataServiceService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private exDialog: ExDialog,
    private _router: Router,
    private location: Location,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService,
    private companyService: CompanyService,
  ) {

    super();
    this.companyService.getbussinessType.emit(Constants.quikcardBusnsTypeKey);
    this.companyService.getRolAssignedType.emit(Constants.quikcardBusnsTypeKey);
    companyService.setCompanyData.subscribe((value) => {
      if (value) {
        this.isCompanyTerminated = value.status;
        if (this.isCompanyTerminated == "Suspended") {
          this.isCompanySuspended = true;
        } else {
          this.isCompanySuspended = false;
        }
      }
    });
    companyService.hideButtons.subscribe((value) => {
      this.hideSuspendedButton = value.hideSuspendedButton;
    });
  }

  /**
   * Call On Page Load
   */
  ngOnInit() {
    this.getBusinessType(); // get list of all Business Type
    this.getRolAssignedUserType();
    this.getBusinessTypeList();
    this.getUserStatusList();
    this.getReferUsersList();
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SUR']
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      let checkArray = this.currentUserService.authChecks['SUR']
      this.currentUser = this.currentUserService.currentUser
      this.getAuthCheck(checkArray)
    }
    this.dropdownSettings = Constants.multiSelectDropdown
    this.lineItemSettings = Constants.multiselect
    this.addEditUserForm = new FormGroup({
      'firstName': new FormControl('', [Validators.required, CustomValidators.combinationAlphabets]),
      'lastName': new FormControl('', [Validators.required, CustomValidators.combinationAlphabets]),
      'applicationAccses': new FormControl('', Validators.required),
      'businessTypeKey': new FormControl(null),
      'rolAssigned': new FormControl(null, [Validators.required]),
      'businessType': new FormControl('', Validators.required),
      'email': new FormControl('', Validators.required),
      'phoneNumber': new FormControl('', Validators.required),
      'extension': new FormControl('', [Validators.minLength(3), Validators.maxLength(5), CustomValidators.onlyNumbers]),
      'postalCode': new FormControl('', [Validators.required, Validators.maxLength(7)]),
      'city': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'province': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'country': new FormControl('', [Validators.required, Validators.maxLength(60)]),
      'password': new FormControl('', [Validators.required, CustomValidators.validPassword]),
      'confirmPassword': new FormControl('', Validators.required),
      'userMenuRefKey': new FormControl(null, [Validators.required]),
      'supervisor': new FormControl('0'),
      'userSubMenuRefKey': new FormControl(null),
      'userStatus': new FormControl(null, [Validators.required]), 
      'isOTP': new FormControl(null)
    });

    this.changePasswordForm = new FormGroup({
      'password': new FormControl('', [Validators.required, CustomValidators.validPassword]),
      'confirmPassword': new FormControl('', [Validators.required]),
    });


    this.role = localStorage.getItem('roleLabel')
    this.getUsersRoleList();
    if (this.router.url.indexOf('view') !== -1) {
      this.addMode = false;
      this.viewMode = true;
      this.editMode = false;
      this.addEditUserForm.disable();
      this.sub = this.route.queryParams.subscribe(params => {
        this.userId = params['userId']; // (+) converts string 'id' to a number      
        let ruleJson = {
          "userId": this.userId
        }
        var URL = UsersApi.getUserWithRoles;
        this.hmsDataServiceService.postApi(URL, ruleJson).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.userEmail = data.result.email;
            this.addEditUserForm.patchValue({
              "firstName": data.result.firstName,
              "lastName": data.result.lastName,
              "email": data.result.email,
              "phoneNumber": data.result.phoneNumber,
              "extension": data.result.extension != '' ? data.result.extension.trim() : '',
              "postalCode": data.result.postalCd,
              "city": data.result.city,
              "province": data.result.userProvince,
              "country": data.result.country,
              "userStatus": data.result.userStatusDesc,
              "supervisor": data.result.supervisorKey
            });
            if (data.result.userMenuRefKey != '') {
              this.selectedMenuValue = data.result.userMenuRefKey
              this.addEditUserForm.patchValue({ "userMenuRefKey": data.result.userMenuName });
              this.showHideMenu = true;
            }
            // (Sub Menu)
            if (data.result.subMenuKey != '') {
              this.selectedSubMenuValue = data.result.subMenuKey
              this.addEditUserForm.patchValue({ "userSubMenuRefKey": data.result.subMenuName });
              this.showHideSubMenu = true;
            }
            /** user application access */
            if (data.result.roles && data.result.roles.length > 0) {
              let selecteduserApplicationAccses = []
              data.result.roles.forEach(element => {
                this.applicationAccses.push({ 'id': element.id, 'itemName': element.roleLabel });
                this.selctedDropDownVal.push({ 'id': element.id });
                selecteduserApplicationAccses.push(element.id);
              });
              this.addEditUserForm.patchValue({ "applicationAccses": selecteduserApplicationAccses });
            }
            /** user Role Assigned */
            if (data.result.userType && data.result.userType.length > 0) {
              this.selectedRoleAssigned = [];
              data.result.userType.forEach(element => {
                this.rolAssigned.push({ 'id': element.userTypeKey, 'itemName': element.userTypeName });
                this.selctedDropDownUsrType.push({ "userTypeKey": element.userTypeKey });
                this.selectedRoleAssigned.push(element.userTypeKey);
                if (this.selectedRoleAssigned) {
                  this.getMenuName(this.selectedRoleAssigned);
                  this.getSubMenuByParentMenuKey(data.result.userMenuRefKey);
                }
              });
              this.addEditUserForm.patchValue({ "rolAssigned": this.selctedDropDownUsrType });
            }
            // business type
            if (data.result.businessType && data.result.businessType.length > 0) {
              let selectedBussinesType = []
              data.result.businessType.forEach(element => {
                this.businessType.push({ 'id': element.businessTypeKey, 'itemName': element.businessTypeDesc });
                this.selectedBussType.push({ "businessTypeKey": element.businessTypeKey });
                selectedBussinesType.push(element.businessTypeKey);
              });
              this.addEditUserForm.patchValue({ "businessType": selectedBussinesType });
            }
          }
        },(error)=>{
          this.logout()
        });
      });
      this.getOTPStatus(this.userId);
    } else {
      if (this.addMode) {
        this.addEditUserForm.patchValue({
          "isOTP": "F",
        });
      }
    }
  }
logout(){
  localStorage.setItem('id', '0')
    localStorage.setItem('currentUser', '');
    localStorage.setItem('userCredential', '');
    localStorage.setItem('user', '');
    localStorage.setItem('role', "");
    localStorage.setItem('type', "");
    localStorage.setItem('roleLabel', "");
    localStorage.setItem('isAdmin', "")
    localStorage.setItem('bsnsKey', "")
    localStorage.setItem('applicationRoleKey', "");
    this.currentUserService.applicationRoleKey = ''
    location.href='/'
}
  /**
   * Get Auth Check and provide menu access according to user role
   * @param claimChecks 
   */
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.usersAuthCheck = [{
        "editUser": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.usersAuthCheck = [{
        "editUser": authCheck['SUR2']
      }]
    }
    return this.usersAuthCheck
  }

  /**
   * Open roles drop down
   */
  openRoleDropdown() {
    setTimeout(() => {
      $("#openSelect .c-btn").trigger('click')
    }, 500);
  }

  /**
   * Get Users role list
   */
  getUsersRoleList() {
    var namePrefixURL = UsersApi.getRoleList;
    let reqData = { "role": this.role }
    this.hmsDataServiceService.postApi(namePrefixURL, reqData).subscribe(data => {
      for (var i = 0; i < data.result.length; i++) {
        this.additonalInfoList.push({ 'id': data.result[i].id, 'itemName': data.result[i].roleLabel.replace(/_/g, " ") })
      }
    });
    return this.additonalInfoList;
  }

  /**
   * Get User status list
   */
  getUserStatusList() {
    let reqData = { "role": this.role }
    var namePrefixURL = UsersApi.getUserStatusList;
    this.hmsDataServiceService.getApi(namePrefixURL).subscribe(data => {
      if (data.code == 200) {
        this.userStatusList = data.result;
        this.userStatusData = this.completerService.local(
          this.userStatusList,
          "userStatusDesc",
          "userStatusDesc"
        );
      }
    });
  }

  /**
   * Get selected role list
   * @param item 
   */
  onSelectDropDown(item: any, type) {
    this.isRoleAssigned = true
    if (type == 'applicationAccses') {
      this.selctedDropDownVal = []
      for (var j = 0; j < this.applicationAccses.length; j++) {
        this.selctedDropDownVal.push({ 'id': this.applicationAccses[j]['id'] })
      }
      this.addEditUserForm.controls[type].setValue(this.selctedDropDownVal);
    }
    if (type == 'rolAssigned') {
      this.selctedDropDownUsrType = [];
      this.selectedRoleAssigned = [];
      for (var j = 0; j < this.rolAssigned.length; j++) {
        this.selctedDropDownUsrType.push({ 'userTypeKey': this.rolAssigned[j]['id'] })
        this.selectedRoleAssigned.push(this.rolAssigned[j]['id'])
        this.selctedRoleAssignedKeysArr.push(this.rolAssigned[j]['id']); //New code 
      }
      this.getMenuName(this.selectedRoleAssigned);
      this.addEditUserForm.controls[type].setValue(this.selctedDropDownUsrType);
    }
    if (type == 'businessType') {
      this.selectedBussType = []
      for (var j = 0; j < this.businessType.length; j++) {
        this.selectedBussType.push({ 'businessTypeKey': this.businessType[j]['id'] })
      }
      this.addEditUserForm.controls[type].setValue(this.selectedBussType);
    }
  }

  /**
   * Remove role on deselect role
   * @param item 
   * @param type 
   */
  onDeSelectDropDown(item: any, type) {
    if (type == 'applicationAccses') {
      this.selctedDropDownVal = []
      if (this.applicationAccses.length > 0) {
        for (var j = 0; j < this.applicationAccses.length; j++) {
          this.selctedDropDownVal.push({ 'id': this.applicationAccses[j]['id'] })
        }
      } else {
        this.addEditUserForm.controls[type].setValue('')
      }
    }
    if (type == 'rolAssigned') {
      this.selctedDropDownUsrType = []; this.selectedRoleAssigned = [];
      if (this.rolAssigned.length > 0) {
        for (var j = 0; j < this.rolAssigned.length; j++) {
          this.selctedDropDownUsrType.push({ 'userTypeKey': this.rolAssigned[j]['id'] })
          this.selectedRoleAssigned.push(this.rolAssigned[j]['id'])
        }
      } else {
        this.addEditUserForm.controls[type].setValue('')
      }
      this.getMenuName(this.selectedRoleAssigned);
    }
    if (type == 'businessType') {
      this.selectedBussType = []
      if (this.businessType.length > 0) {
        for (var j = 0; j < this.businessType.length; j++) {
          this.selectedBussType.push({ 'businessTypeKey': this.businessType[j]['id'] })
        }
      } else {
        this.addEditUserForm.controls[type].setValue('')
      }
    }
  }

  onSelectAll(items: any, type) {
    this.isRoleAssigned = true;
    if (type == 'applicationAccses') {
      this.selctedDropDownVal = []
      for (var i = 0; i < this.applicationAccses.length; i++) {
        this.selctedDropDownVal.push({ 'id': this.applicationAccses[i]['id'] })
      }
      this.addEditUserForm.controls[type].setValue(this.selctedDropDownVal);
    }
    if (type == 'rolAssigned') {
      this.selctedDropDownUsrType = [];
      this.selectedRoleAssigned = [];
      for (var i = 0; i < this.rolAssigned.length; i++) {
        this.selctedDropDownUsrType.push({'userTypeKey':this.rolAssigned[i]['id']})
        this.selectedRoleAssigned.push(this.rolAssigned[i]['id'])
      }
      this.addEditUserForm.controls[type].setValue(this.selctedDropDownUsrType);
      this.getMenuName(this.selectedRoleAssigned);
    }
    if (type == 'businessType') {
      this.selectedBussType = []
      for (var i = 0; i < this.businessType.length; i++) {
        this.selectedBussType.push({ "businessTypeKey": this.businessType[i]['id'] }) // New code
      }
      this.addEditUserForm.controls[type].setValue(this.selectedBussType);
    }
  }

  getMenuName(selectedRoleAssigned) {
    let mainMenuArray = []
    if (selectedRoleAssigned != undefined && selectedRoleAssigned.length > 0) {
      var selectedRoleIds = {
        "userTypeKeyList": selectedRoleAssigned
      }
      this.hmsDataServiceService.postApi(UsersApi.getParentMenuByRoleKey, selectedRoleIds).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (data.result && data.result.length > 0) {
            this.showToasterMsg = false;
            for (let i = 0; i < data.result.length; i++) {
              if(data.result[i].menuKey != '98' && data.result[i].menuKey != '99' && data.result[i].menuKey != '110' &&
              data.result[i].menuKey != '146' && data.result[i].menuKey != '147'){
                mainMenuArray.push({ "menuName": data.result[i].menuName, "menuKey": data.result[i].menuKey });
              }
            }
            //For Sort sidebar menu in Alphabetically order
            if (mainMenuArray.length > 0) {
              mainMenuArray.sort(function (a, b) {
                if (a.menuName != undefined) {
                  var textA = a.menuName.toUpperCase();
                  var textB = b.menuName.toUpperCase();
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                }
              });
            }
            this.showHideMenu = true;
            //Predictive Company Search Upper
            this.menuData = this.completerService.local(
              mainMenuArray,
              "menuName",
              "menuName"
            );
          }
          else if (data.result && data.result.length == 0) {
            this.toastr.error(this.translate.instant('user.toaster.changeRoleAssigned'));
            this.showToasterMsg = true;
          }
        }
      })
    } else {
      this.showHideMenu = false;
      mainMenuArray = []
    }
  }

  /**
   * Add New User
   */
  addNewUser() {
    this.addEditUserForm.controls['userStatus'].clearValidators();
    this.addEditUserForm.controls['userStatus'].updateValueAndValidity();
    if (this.showToasterMsg == true) {
      this.toastr.error(this.translate.instant('user.toaster.changeRoleAssigned'));
    }
    if (this.addEditUserForm.valid) {
      var userObj = {
        "firstName": this.addEditUserForm.value.firstName,
        "lastName": this.addEditUserForm.value.lastName,
        "email": this.addEditUserForm.value.email,
        "phoneNumber": this.addEditUserForm.value.phoneNumber,
        "extension": this.addEditUserForm.value.extension,
        "postalCd": this.addEditUserForm.value.postalCode,
        "city": this.addEditUserForm.value.city,
        "userProvince": this.addEditUserForm.value.province,
        "country": this.addEditUserForm.value.country,
        "password": this.addEditUserForm.value.password,
        "confirmPassword": this.addEditUserForm.value.confirmPassword,
        "userGroupKey": '',
        "businessType": this.selectedBussType, // Business Type Field
        "roles": this.selctedDropDownVal, //Application Access Field       
        "userType": this.selctedDropDownUsrType, //Role Assigned Field
        "userMenuRefKey": this.selectedMenuValue, //Default Menu  Field
        "subMenuKey": this.selectedSubMenuValue, //Sub Menu  Field
        "userStatusCd": "A" ,//Default Active Set,
        "supervisorKey":  (this.addEditUserForm.value.supervisor != null)?this.addEditUserForm.value.supervisor:0 //Default Active Set,
      }
      this.hmsDataServiceService.postApi(UsersApi.addUserUrl, userObj).subscribe(data => {
        if (data.code == 200) {
          this.showOTPScreen(this.addEditUserForm.value.isOTP, data.result.userId, true);
        }
        else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == 'EMAIL_DONOT_MATCH_AS_REQUIRED') {
          this.toastr.error(this.translate.instant('user.addEditViewUsers.emailDoNotMatch'));
        }
        else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == 'PASSWORD_DONOT_MATCH_AS_REQUIRED') {
          this.toastr.error(this.translate.instant('user.addEditViewUsers.passwordDoNotMatchAsRequired'));
        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "WRONG_APPLICATION_AND_DEPARTMENT_ASSOCIATION") {
          this.toastr.error(this.translate.instant('user.toaster.appAccessAndDeptWrong'));
        } else if (data.code == 400 && data.hmsMessage.messageShort == "EMAIL_ALREADY_ASSOCIATED") {
          this.toastr.error(this.translate.instant('user.addEditViewUsers.emailAlreadyExist'))
        }
        else {
          this.toastr.error(this.translate.instant('user.addEditViewUsers.someErrorOccured'));
        }
        this.addMode = true;
        this.viewMode = false;
        this.editMode = false;
        this.userId = data.result.userId;
        this.router.navigate(['/users/view/'], { queryParams: { 'userId': this.userId } });
      });
    }
    else {
      this.validateAllFormFields(this.addEditUserForm);
    }
  }

  /**
  * Update the User
  */
  updateUser() {
    setTimeout(() => {
      if (this.addEditUserForm.valid) {
      this.showLoader = true;
        var userObj = {
          "userId": this.userId,
          "firstName": this.addEditUserForm.value.firstName,
          "lastName": this.addEditUserForm.value.lastName,
          "email": this.addEditUserForm.value.email,
          "phoneNumber": this.addEditUserForm.value.phoneNumber,
          "extension": this.addEditUserForm.value.extension,
          "postalCd": this.addEditUserForm.value.postalCode,
          "city": this.addEditUserForm.value.city,
          "userProvince": this.addEditUserForm.value.province,
          "country": this.addEditUserForm.value.country,
          "password": this.addEditUserForm.value.password,
          "confirmPassword": this.addEditUserForm.value.confirmPassword,
          "userGroupKey": '',
          "businessType": this.selectedBussType, // Business Type Field
          "roles": this.selctedDropDownVal, //Application Access Field          
          "userType": this.selctedDropDownUsrType, //Role Assigned Field
          "userMenuRefKey": this.selectedMenuValue, //Default Menu  Field
          "subMenuKey": this.selectedSubMenuValue, //Sub Menu  Field
          "userStatusCd": "A", //Default Active Set
          "supervisorKey": this.addEditUserForm.value.supervisor 
        }      
        this.hmsDataServiceService.postApi(UsersApi.updateUser,
          userObj).subscribe(data => {
            if (data.code == 200) {
              this.showLoader = false;
              this.showOTPScreen(this.addEditUserForm.value.isOTP, this.userId, false);
            }
            else if (data.code == 400 && data.hmsMessage && data.hmsMessage.messageShort == "WRONG_APPLICATION_AND_DEPARTMENT_ASSOCIATION") {
              this.showLoader = false;
              this.toastr.error(this.translate.instant('user.toaster.appAccessAndDeptWrong'));
            }
            else {
              this.showLoader = false;
              this.toastr.error(this.translate.instant('user.addEditViewUsers.someErrorOccured'));
            }
            this.showLoader = false;
            this.addMode = false;
            this.viewMode = true;
            this.editMode = false;
            this.addEditUserForm.disable();
          });
      } else {
        this.showLoader = false
        this.validateAllFormFields(this.addEditUserForm);
      }
    }, 1000)
  }

  /**
   * validate the user form fields
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
  * Edit the  User
  */
  editUser() {
    this.isRoleAssigned = true;
    this.addMode = false
    this.viewMode = false
    this.editMode = true
    this.addEditUserForm.enable();
    this.addEditUserForm.controls['email'].disable();
    this.addEditUserForm.controls['password'].disable();
    this.addEditUserForm.controls['confirmPassword'].disable();
  }

  goBack() {
    this.location.back();
  }

  onRuleTypeSelected(selected: CompleterItem) {
    this.additonalInfoList = [{
      "id": 100,
      "Role": "Admin",
    }, {
      "id": 101,
      "Role": "Super Admin",
    }]
  }

  onBlurMethod() {
    var userEmailValidation = Constants.baseUrl + 'userrole-setup-service/userEmailValidation/' + this.addEditUserForm.value.email;
    this.hmsDataServiceService.getApi(userEmailValidation).subscribe(data => {
      if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == 'EMAIL_ALREADY_ASSOCIATED') {
        this.toastr.error(this.translate.instant('user.addEditViewUsers.emailAlreadyExist'));
      }
    });
  }

  /**
   * Get city, country, province from postCode 
   * @param event 
   */
  isUserPostalcodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CompanyApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL = CompanyApi.isCompanyCityProvinceCountryValidUrl;
      this.hmsDataServiceService.postApi(URL, postalNumber).subscribe(data => {
        switch (data.code) {
          case 404:
            this.addEditUserForm.controls['postalCode'].setErrors({
              "postalcodeNotFound": true
            });
            break;
          case 302:
            this.addEditUserForm.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            $('#password').focus();
            break;
        }
      });
    }
  }

  /**
   * Verified user city, country, province from postCode
   * @param event 
   * @param fieldName 
   */
  isUserPostalVerifyValid(event, fieldName) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (fieldName) {
        case 'city':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.addEditUserForm.get('country').value,
            provinceName: this.addEditUserForm.get('province').value,
            postalCd: this.addEditUserForm.get('postalCode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'country':
          fieldParameter = {
            cityName: this.addEditUserForm.get('city').value,
            countryName: event.target.value,
            provinceName: this.addEditUserForm.get('province').value,
            postalCd: this.addEditUserForm.get('postalCode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'province':
          fieldParameter = {
            cityName: this.addEditUserForm.get('city').value,
            countryName: this.addEditUserForm.get('country').value,
            provinceName: event.target.value,
            postalCd: this.addEditUserForm.get('postalCode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CompanyApi.isCompanyCityProvinceCountryValidUrl;
      this.hmsDataServiceService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.addEditUserForm.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.addEditUserForm.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  openPostalCode() {
    setTimeout(() => {
      $("#openSelect .c-btn").trigger('click')
    }, 500);
    return false
  }

  /**
    * Get Business Type List
    * @param value 
    */
  getRolAssignedType(value) {
    if (value == 1) {
      this.companyService.getRolAssignedType.emit(value)
    } else {
      this.companyService.getRolAssignedType.emit(value)
    }
  }

  getBussinessType(value) {
    if (value == 1) {
      this.companyService.getbussinessType.emit(value)
    } else {
      this.companyService.getbussinessType.emit(value)
    }
  }

  /**
   * Get List of BusinessType
   */
  getBusinessType() {
    var URL = UsersApi.getDepartment;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        for (var i = 0; i < data.result.length; i++) {
          this.businessTypeList.push({ 'id': data.result[i].departmentKey, 'itemName': data.result[i].departmentName.replace(/_/g, " ") })
        }
      }
    });
  }

  getRolAssignedUserType() {
    var URL = UsersApi.getUserTypeList;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        for (var i = 0; i < data.result.length; i++) {
          this.rolAssignedTypeList.push({ 'id': data.result[i].userTypeKey, 'itemName': data.result[i].userTypeName.replace(/_/g, " ") })
        }
      }
    });
  }

  getReferUsersList() {
    let submitInfo ={
      businessTypeKey:0
    }
    this.hmsDataServiceService.postApi(ClaimApi.getUserList, submitInfo).subscribe(data => {
      if (data.code == 200) {
       this.supervisor = data.result
      }
    });
  }

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  onUserStatusSelected(selected: CompleterItem) {
    if(selected){
      this.userStatusSelected = selected.originalObject.userStatusCd
    } else {
      this.userStatusSelected = ''
    }
  }

  public onToggle() {
    if (this.isOpen) {
      this.roleAssigned.close();
    }
  }

  public onFocus() {
    this.roleAssigned.focus();
  }

  getBusinessTypeList() {
    var url = UsersApi.getBusinessTypeUrl
    this.hmsDataServiceService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.bussTypeList.push({ 'id': data.result[i].businessTypeKey, 'itemName': data.result[i].businessTypeDesc })
        }
      }
    })
  }

  /**
   * Get roles assign to user
   */
  getUserRolesModules() {
    let promise = new Promise((resolve, reject) => {
      var getUserRolesModulesURL = UsersApi.getMenuActionsUrl;
      this.hmsDataServiceService.getApi(getUserRolesModulesURL).subscribe(data => {
        if (data.code == 200) {
          for (let i = 0; i < data.result.length; i++) {
            if (data.result[i].parentMenuId == -1 && data.result[i].actions.length == 0) {
              this.mainMenu.push(data.result[i])
            } else {
              this.rolesModuledata.push(data.result[i]);
            }
          }
          if (this.rolesModuledata.length > 0) {
            for (let i = 0; i < this.rolesModuledata.length; i++) {
              if (this.rolesModuledata[i].parentMenuId != -1) {
                let index = this.roleSidebarArray.findIndex(x => x.parentMenuId === this.rolesModuledata[i].parentMenuId);
                if (index >= 0) {
                  this.roleSidebarArray[index].child.push(this.rolesModuledata[i]);
                } else {
                  this.roleSidebarArray.push({ "appName": this.rolesModuledata[i].hmsApplicationDesc, "appCd": this.rolesModuledata[i].hmsApplicationCd, "parentMenuId": this.rolesModuledata[i].parentMenuId, "parentMenuName": this.rolesModuledata[i].parentMenuName, "menuKey": this.rolesModuledata[i].menuKey, "child": [this.rolesModuledata[i]] });
                }
              }
            }
            //For Sort sidebar menu in Alphabetically order
            if (this.roleSidebarArray.length > 0) {
              this.roleSidebarArray.sort(function (a, b) {
                if (a.parentMenuName != undefined) {
                  var textA = a.parentMenuName.toUpperCase();
                  var textB = b.parentMenuName.toUpperCase();
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                }
              });
            }
            //Predictive Company Search Upper
            this.menuData = this.completerService.local(
              this.roleSidebarArray,
              "parentMenuName",
              "parentMenuName"
            );
          } 
          resolve()
          return this.checboxArray
        }
        else {
          resolve()
          return this.checboxArray = []
        }
      });
    });
    return promise
  }

  onMenuSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedMenuValue = selected.originalObject.menuKey;
      this.getSubMenuByParentMenuKey(selected.originalObject.menuKey);
    }
    else {
      this.selectedMenuValue = '';
    }
  }

  onSubMenuSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedSubMenuValue = selected.originalObject.menuKey;
    }
    else {
      this.selectedSubMenuValue = '';
    }
  }

  /**
   * Function to get sub-menu list
   * based on parent menu key:
   * @param menuKey
   */
  getSubMenuByParentMenuKey(menuKey) {
    let subMenuArray = []
    let reparam = {
      "userTypeKeyList": this.selectedRoleAssigned,
      "menuKey": menuKey
    }
    var URL = UsersApi.getSubMenuByParentMenuKeyUrl;
    this.hmsDataServiceService.post(URL, reparam).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        if (data.result && data.result.length > 0) {
          this.showHideSubMenu = true;
          for (let i = 0; i < data.result.length; i++) {
            subMenuArray.push({ "menuName": data.result[i].menuName, "menuKey": data.result[i].menuKey });
          }
          //For Sort sidebar menu in Alphabetically order
          if (subMenuArray.length > 0) {
            subMenuArray.sort(function (a, b) {
              if (a.menuName != undefined) {
                var textA = a.menuName.toUpperCase();
                var textB = b.menuName.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
              }
            });
          }
          this.showHideMenu = true;
          //Predictive Company Search Upper
          this.subMenuData = this.completerService.local(
            subMenuArray,
            "menuName",
            "menuName"
          );
        } else if (data.result && data.result.length == 0) {
          this.showHideSubMenu = false
          subMenuArray = [];
        }
      }
    });
  }

  /**
   * Open Change User Password PopUp
   * @param type 
   */
  changeUserPassword(type) {
    this.changePasswordComponent.changePassword(type);
  }

  /**
   * Update User Password
   */
  onSubmitChangePassword(formData) {
    if (this.changePasswordForm.valid) {
      this.sub = this.route.queryParams.subscribe(params => {
        this.userId = params['userId']; // (+) converts string 'id' to a number 
      });
      let changePasswordData = {
        "userId": this.userId,
        "oldPassword": '',
        "password": this.changePasswordForm.value.password,
      }
      var URL = UsersApi.changePasswordUrl;
      this.hmsDataServiceService.post(URL, changePasswordData).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          this.toastr.success(this.translate.instant('user.toaster.passwordUpdatedSuccess'));
          $('#changePasswordClsoeBottom').click();
        }
        else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == 'OLD_PASSWORD_DOES_NOT_MATCH') {
          this.toastr.error(this.translate.instant('user.toaster.oldPasswordNotMatch'));
        }
      });
    } else {
      this.validateAllFormFields(this.changePasswordForm);
    }
  }

  /**
   * Reset The Change Password Form
   */
  resetChangePasswordForm() {
    this.changePasswordForm.reset();
  }

  /**
  * Validate the Password and confirm password
  * @param changePasswordForm 
  */
  validateConfirmPassword(changePasswordForm) {
    if (changePasswordForm.value.password != '' && changePasswordForm.value.confirmPassword != '') {
      if (changePasswordForm.value.password != changePasswordForm.value.confirmPassword) {
        changePasswordForm.controls['confirmPassword'].setErrors({
          "passwordMismatch": true
        });
      } else {
        changePasswordForm.controls['confirmPassword'].setErrors(null);
      }
    }
  }

  /**
  * Show/Hide OTP Screen
  * @param isOTP 
  * @param userKey
  */
  showOTPScreen(isOTP, userKey, isAdd) {
    if (isOTP) {
      let otpStatus = (isOTP == "T") ? "T" : "F";
      let reqParam = {
        "otpStatusInd": otpStatus,
        "emailStatusInd": otpStatus,
        "userKey": userKey
      }
      var otpEmailStatusUrl = CommonApi.otpEmailStatusUrl;
      this.hmsDataServiceService.postApi(otpEmailStatusUrl, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          if (isAdd) {
            this.toastr.success(this.translate.instant('user.addEditViewUsers.userAddedSuccessfully'));
          } else {
            this.toastr.success(this.translate.instant('user.addEditViewUsers.userUpdatedSuccessfully'));
          }
        } else {
          this.toastr.error(this.translate.instant('header.toaster.error'));
        }
      })
    }
  }

  /**
   * 
   * @param userKey 
   */
  getOTPStatus(userKey) {
    var getOtpEmailStatusUrl = CommonApi.getOtpEmailStatusUrl;
    let reqParam = {
      "userKey": userKey,
    }
    this.hmsDataServiceService.postApi(getOtpEmailStatusUrl, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.addEditUserForm.patchValue({
          "isOTP": data.result.otpStatusInd,
        });
      } else {
        this.addEditUserForm.patchValue({
          "isOTP": "F",
        });
      }
    });
  }  

}