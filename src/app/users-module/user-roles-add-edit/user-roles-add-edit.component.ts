import { Component, OnInit, ViewChild, Inject, ViewChildren, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { UsersApi } from '../users-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { Router, ActivatedRoute } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { PlatformLocation, LocationStrategy } from '@angular/common'
@Component({
  selector: 'app-user-roles-add-edit',
  templateUrl: './user-roles-add-edit.component.html',
  styleUrls: ['./user-roles-add-edit.component.css'],
  providers: [DatatableService, ChangeDateFormatService, ToastrService],
})

export class UserRolesAddEditComponent extends FormCanDeactivate implements OnInit {
  falseCount = 0;
  trueCount = 0;
  overRidesTrue: boolean;
  editCount = 0;
  nameCheck: boolean;
  checkFalse: boolean = false;
  flag1: boolean = false;
  stringAfterSplit2: any;
  stringAfterSplit: any;
  disableViewMode: any;
  flag: boolean = false;
  checkedArray: any
  menuArrayInitial: any;
  currentUser: any;
  activeClass: string;
  rolesModuledataArray = []
  submitted: boolean;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T');
    }
  @ViewChild('FormGroup')
  FormGroup: FormGroup;
  addMode: boolean = true;
  try: boolean = false;
  checkBoxParent: boolean = true;
  showSubMenu: boolean = false;
  viewMode: boolean;
  editMode: boolean;
  copyMode: boolean;
  userTypeKey: any;
  rolesModuledata = [];
  mainMenu = [];
  roleSidebarArray = [];
  appArrayListH = [];
  moduleKey: string;
  sub: any;
  roleId: any;
  selectedItem: any;
  showLoader: boolean = true;
  checboxArray = [];
  userRolesAuthCheck = [{
    "editRole": 'F',
    "searchRole": 'F',
  }]
  roles = [];
  // Declaring the Promise, yes! Promise!
  filtersLoaded: Promise<boolean>;
  a: any;
  disabledItem: boolean = false;
  roleArray = []
  appArrayList = [];
  role: string

  constructor(
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastrService: ToastrService,
    private changeDateFormatService: ChangeDateFormatService,
    private exDialog: ExDialog,
    private _router: Router,
    private router: ActivatedRoute,
    private formBuilder: FormBuilder,
    private currentUserService: CurrentUserService,
    locationn: PlatformLocation,
    private locationStrategy: LocationStrategy
  ) {
    super();   
    }
 
  ngOnInit() {
    this.appArrayList = [
      { appCd: "H", appName: "HMS" },
      { appCd: "DE", appName: "AHC" },
      { appCd: "RR", appName: "REFER REVIEW" },
      { appCd: "DR", appName: "CONSULTANT REVIEW" },
    ]
    this.appArrayListH.push(this.appArrayList[0]);
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SRL'].concat(this.currentUserService.authChecks['SUR'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SRL'].concat(this.currentUserService.authChecks['SUR'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
      })
    }
    let group: any = {};
    let group1: any = {};
    this.role = localStorage.getItem('roleLabel')
    this.getUserRolesModules().then(res => {
      for (let i = 0; i < this.rolesModuledata.length; i++) {
        group1 = {};
        group['menu_' + this.rolesModuledata[i].menuKey] = new FormGroup(group1);
        group1['mainaction_' + this.rolesModuledata[i].menuKey] = new FormControl('');
        if (this.rolesModuledata[i].actions.length > 0) {
          for (let k = 0; k < this.rolesModuledata[i].actions.length; k++) {
            group1['action_' + this.rolesModuledata[i].actions[k].actionKey] = new FormControl('');
            if (this.rolesModuledata[i].menuKey == '15' && this.rolesModuledata[i].actions[k].actionKey == '37' && this.rolesModuledata[i].actions[k].actionStatus == 'T') {
              this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
              this.FormGroup.patchValue({ ["menu_174"]: { ['action_347']: true } });
            }
            $("#view_174_347").addClass('disableView');
          }
        }
        group['menu_' + this.rolesModuledata[i].menuKey] = new FormGroup(group1);
      }
      this.FormGroup = new FormGroup(group);
      if (this._router.url.indexOf('edit') !== -1) {
        this.userTypeKey = this.router.snapshot.paramMap.get('id');
        this.viewRoleDetails(this.userTypeKey, 'edit');
      } else if (this._router.url.indexOf('copy') !== -1) {
        this.userTypeKey = '';
        this.addMode = false;
        this.viewMode = false;
        this.editMode = false;
        this.copyMode = true;
        this.viewRoleDetails(this.router.snapshot.paramMap.get('id'), 'copy');
      } else if (this._router.url.indexOf('add') !== -1) {
        this.addMode = true;
        this.viewMode = false;
        this.editMode = false;
        this.copyMode = false;
      }
    });
    group['userTypeName'] = new FormControl('', Validators.required);
    this.FormGroup = new FormGroup(group);
    this.getUsersRoleList()
  }

 // issue no 720 start
  canDeactivate() {
    history.pushState(null, null, document.URL);
    if ((!this.submitted && this.FormGroup.dirty) || (this.addMode && this.showSubMenu) || (this.editMode && this.showSubMenu) ||(this.copyMode && this.showSubMenu)) {
      if (confirm(this.translate.instant("serviceProvider.toaster.modal-message"))) {
        if (this.currentUserService.newTabRouterLink != undefined && this.currentUserService.newTabRouterLink != '' && this.router.url != this.currentUserService.newTabRouterLink) {
          window.location.replace(this.currentUserService.newTabRouterLink);
          this.currentUserService.setRouterLink('');
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
    return true;
  }
 // issue no 720 End
  ngAfterViewInit() {
    setTimeout(() => {
      if ($("#mainMenu" + this.appArrayList[0].appCd).hasClass("in") == false) {
        $('#mainMenu' + this.appArrayList[0].appCd).addClass('in');
        $("#mainMenu_" + this.appArrayList[0].appCd + " .toggleMainMenuName").attr("aria-expanded", "true");
      }
    }, 4000);
  }

  /**
   * Get User Role List
   */
  getUsersRoleList() {
    let reqData = { 'role': this.role }
    var namePrefixURL = UsersApi.getRoleList;
    this.hmsDataServiceService.postApi(namePrefixURL, reqData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.roles = data.result
      } else {
        this.roles = []
      }
    });
  }

  /**
   * Give permission to users according to there role
   */
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.userRolesAuthCheck = [{
        "editRole": 'T',
        "searchRole": 'T'
      }]
    }
    else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.userRolesAuthCheck = [{
        "editRole": authCheck['VRL10'],
        "searchRole": authCheck['SUR5']
      }]
    }
    return this.userRolesAuthCheck
  }

  /**
   * Get User Role Details
   */
  viewRoleDetails(id, mode) {
    this.showLoader = true;
    if (mode == 'edit') {
      this.FormGroup.disable();
      this.disabledItem = true;
      this.addMode = false;
      this.viewMode = true;
      this.editMode = false;
      this.copyMode = false;
    }
    this.sub = this.router.params.subscribe(params => {
      this.roleId = { "userTypeKeyList": [+id] };
      var URL = UsersApi.viewUserRole;
      this.hmsDataServiceService.post(URL, this.roleId).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          for (let i = 0; i < data.result.length; i++) {
            this.FormGroup.patchValue({ ["menu_" + data.result[i].menuKey]: { ['mainaction_' + data.result[i].menuKey]: (data.result[i].menuAccess == 'T') ? true : false } });
            for (let k = 0; k < data.result[i].actions.length; k++) {
              this.FormGroup.patchValue({ ["menu_" + data.result[i].menuKey]: { ['action_' + data.result[i].actions[k].actionKey]: (data.result[i].actions[k].actionAccess == 'T') ? true : false } });
              if (data.result[i].menuKey == '15' && data.result[i].actions[k].actionKey == '37' && data.result[i].actions[k].actionAccess == 'T') {
                this.FormGroup.patchValue({ ["menu_174"]: { ['action_347']: true } });
                this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
                $("#view_174_347").addClass('disableView')
                $("#checkBoxParent174").addClass('disableView')
              }
            }
            this.showSideBarChecked()
          }
          if (mode == 'edit') {
            this.FormGroup.patchValue({
              'userTypeName': data.userTypeName
            })
          }
          this.showLoader = false;
        }
      });
    });
  }

  /**
   * Patch roles
   */
  selectAllCheckboxes(menuKey, event) {
    if (this.overRidesTrue) {
      this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
      $("#checkBoxParent174").addClass('disableView')
    }
    else {
      this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: false } });
      $("#checkBoxParent174").addClass('disableView')
    }
    let key = this.rolesModuledata.findIndex(x => x.menuKey === menuKey);
    let parentMenuId = this.rolesModuledata[key].parentMenuId
    let v = [];
    if (key >= 0) {
      if (this.rolesModuledata[key].actions.length > 0) {
        for (let k = 0; k < this.rolesModuledata[key].actions.length; k++) {
          if (event.target.checked) {
            this.flag = false
            if (menuKey != '174') {
              this.FormGroup.patchValue({ ["menu_" + menuKey]: { ['action_' + this.rolesModuledata[key].actions[k].actionKey]: true } });
              this.checkParentValue(parentMenuId)
              if (this.rolesModuledata[key].menuKey == '15') {
                this.FormGroup.patchValue({ ["menu_174"]: { ['action_347']: true } });
                this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
                $("#view_174_347").addClass('disableView')
                $("#checkBoxParent174").addClass('disableView')
              }
            }
          }
          else {
            if (menuKey != '174') {
              this.FormGroup.patchValue({ ["menu_" + menuKey]: { ['action_' + this.rolesModuledata[key].actions[k].actionKey]: false } });
              if (menuKey == '15') {
                let checkIndex = this.rolesModuledata.findIndex(x => x.menuKey == '174');
                for (let l = 0; l < this.rolesModuledata[checkIndex].actions.length; l++) {
                  this.FormGroup.patchValue({ ["menu_174"]: { ['action_' + this.rolesModuledata[checkIndex].actions[l].actionKey]: false } });
                }
                this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: false } });
                $("#view_174_347").addClass('disableView')
                $("#checkBoxParent174").addClass('disableView')
              }
              $("#view_" + menuKey + "_" + this.rolesModuledata[key].actions[k].actionKey).removeClass('disableView')
              this.checkParentValue(parentMenuId)
            }
          }
        }
      }
    }
  }

  checkParent(menuKey, event) {
    this.checkedArray = [];
    let key = this.rolesModuledata.findIndex(x => x.menuKey === menuKey);
    let checkIndex = this.rolesModuledata.findIndex(x => x.menuKey == '174');
    let parentMenuId = this.rolesModuledata[key].parentMenuId
    let v = [];
    if (event.target.checked) {
      this.flag = false
      this.checkParentValue(parentMenuId)
    }
    else {
      this.checkFalse = true
      this.checkParentValue(parentMenuId)
    }
    if (this.overRidesTrue) {
      this.FormGroup.patchValue({ ["menu_174"]: { ['action_347']: true } });
      this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
      $("#view_174_347").addClass('disableView')
      $("#checkBoxParent174").addClass('disableView')
    }
    else {
      for (let k = 0; k < this.rolesModuledata[checkIndex].actions.length; k++) {
        this.FormGroup.patchValue({ ["menu_174"]: { ['action_' + this.rolesModuledata[checkIndex].actions[k].actionKey]: false } });
        $("#view_174_347").addClass('disableView')
        $("#checkBoxParent174").addClass('disableView')
      }
    }
    if (key >= 0) {
      if (this.rolesModuledata[key].actions.length > 0) {
        let countMainCheckbox = 0;
        for (let k = 0; k < this.rolesModuledata[key].actions.length; k++) {
          if (this.FormGroup.get("menu_" + menuKey).get('action_' + this.rolesModuledata[key].actions[k].actionKey).value) {
            if (this.rolesModuledata[key].menuKey == '15' && this.rolesModuledata[key].actions[k].actionKey == '37') {
              this.FormGroup.patchValue({ ["menu_174"]: { ['action_347']: true } });
              this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
              $("#view_174_347").addClass('disableView')
              $("#checkBoxParent174").addClass('disableView')
            }
            this.checkedArray = this.rolesModuledata[key].actions[k].actionObjectDataTag
            countMainCheckbox++;
          }
          else {
            if (this.rolesModuledata[key].menuKey == '15' && this.rolesModuledata[key].actions[k].actionKey == '37') {
              for (let k = 0; k < this.rolesModuledata[checkIndex].actions.length; k++) {
                this.FormGroup.patchValue({ ["menu_174"]: { ['action_' + this.rolesModuledata[checkIndex].actions[k].actionKey]: false } });
                $("#view_174_347").addClass('disableView')
                $("#checkBoxParent174").addClass('disableView')
              }
              this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: false } });
            }
            this.FormGroup.patchValue({ ["menu_" + menuKey]: { ['action_' + this.rolesModuledata[key].actions[k].actionKey]: false } });
          }
          this.rolesModuledataArray = this.rolesModuledata[key].actions
          switch (this.checkedArray) {
            case 'LPS205':
              let enableViewMode1 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'LPS204');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode1)
              break;
            case 'VDT212':
              let enableViewMode2 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SRV211');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode2)
              break;
            case 'VCD62':
              let enableViewMode3 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'VCD61');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode3)
              break;
            case 'SHS272':
              let enableViewMode4 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'HSP274');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode4)
              break;
            case 'SVP258':
              let enableViewMode5 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'VPC260');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode5)
              break;
            case 'SHP265':
              let enableViewMode6 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'HPC267');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode6)
              break;
            case 'VVI151':
              let enableViewMode7 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SVR150');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode7)
              break;
            case 'VHR158':
              let enableViewMode8 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SHR157');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode8)
              break;
            case 'EDP178':
              let enableViewMode9 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'EDP177');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode9)
              break;
            case 'SBN197':
              let enableViewMode10 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SBN196');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode10)
              break;
            case 'VRL10':
              let enableViewMode11 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SRL7');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode11)
              break;
            case 'SRH15':
              let enableViewMode12 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SRH14');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode12)
              break;
            case 'VTR282':
              let enableViewMode13 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'TXR280');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode13)
              break;
            case 'VPL101':
              let enableViewMode14 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'VPL97');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode14)
              break;
            case 'SFG200':
              let enableViewMode15 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SFG199');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode15)
              break;
            case 'SUR2':
              let enableViewMode16 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SUR3');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode16)
              break;
            case 'DRR165':
              let enableViewMode17 = this.rolesModuledataArray.findIndex(x => x.actionObjectDataTag === 'SDG164');
              this.disableOrEnableViewMode(k, menuKey, key, enableViewMode17)
              break;
            default:
              this.disableViewMode = this.FormGroup.get("menu_" + menuKey).get('action_' + this.rolesModuledata[key].actions[k].actionKey)
              $("#view_" + menuKey + "_" + this.rolesModuledata[key].actions[k].actionKey).removeClass('disableView')
          }
        }
        if (countMainCheckbox > 0) {
          this.FormGroup.patchValue({ ["menu_" + menuKey]: { ['mainaction_' + menuKey]: true } });
        }
        else {
          this.FormGroup.patchValue({ ["menu_" + menuKey]: { ['mainaction_' + menuKey]: false } });
        }
      }
    }
  }

  /**
   * Get roles assign to user
   */
  getUserRolesModules() {
    let promise = new Promise((resolve, reject) => {
      var getUserRolesModulesURL = UsersApi.getMenuActionsUrl;
      this.hmsDataServiceService.getApi(getUserRolesModulesURL).subscribe(data => {
        if (data.code == 200) {
          this.showLoader = false;
          this.menuArrayInitial = data.result;
          for (let i = 0; i < data.result.length; i++) {
            if (data.result[i].parentMenuId == -1) {
              this.mainMenu.push(data.result[i])
            } else {
              this.rolesModuledata.push(data.result[i]);
            }
          }
          let mainMenuArray = [];
          if (this.rolesModuledata.length > 0) {
            for (let i = 0; i < this.rolesModuledata.length; i++) {
              if (this.rolesModuledata[i].parentMenuId != -1) {
                let index = this.roleSidebarArray.findIndex(x => x.parentMenuId === this.rolesModuledata[i].parentMenuId);
                if (index >= 0) {
                  this.roleSidebarArray[index].child.push(this.rolesModuledata[i]);
                } else {
                  this.roleSidebarArray.push({ "appName": this.rolesModuledata[i].hmsApplicationDesc, "appCd": this.rolesModuledata[i].hmsApplicationCd, "parentMenuId": this.rolesModuledata[i].parentMenuId, "parentMenuName": this.rolesModuledata[i].parentMenuName, "menuKey": this.rolesModuledata[i].menuKey, "child": [this.rolesModuledata[i]] });
                }
                let checkAppCd = this.appArrayList.findIndex(x => x.appCd === this.rolesModuledata[i].hmsApplicationCd);
                if (checkAppCd == -1) {
                  this.appArrayList.push({ 'appCd': this.rolesModuledata[i].hmsApplicationCd, 'appName': this.rolesModuledata[i].hmsApplicationDesc });
                }
              }
            }
            for (let i = 0; i < this.mainMenu.length; i++) {
              let indexZero = this.roleSidebarArray.findIndex(x => x.parentMenuId === this.mainMenu[i].menuKey);
              if (indexZero == -1) {
                this.roleSidebarArray.push({ "appName": this.mainMenu[i].hmsApplicationDesc, "appCd": this.mainMenu[i].hmsApplicationCd, "parentMenuId": this.mainMenu[i].parentMenuId, "parentMenuName": this.mainMenu[i].parentMenuName, "menuKey": this.mainMenu[i].menuKey, "child": [this.mainMenu[i]] });
                let checkAppCd = this.appArrayList.findIndex(x => x.appCd === this.mainMenu[i].hmsApplicationCd);
                if (checkAppCd == -1 && this.mainMenu[i].hmsApplicationCd != '') {
                  this.appArrayList.push({ 'appCd': this.mainMenu[i].hmsApplicationCd, 'appName': this.mainMenu[i].hmsApplicationDesc });
                }
              }
            }
            //For Sort sidebar menu in Alphabetically order
            if (this.roleSidebarArray.length > 0) {
              this.roleSidebarArray.sort(function (a, b) {
                var textA = a.parentMenuName.toUpperCase();
                var textB = b.parentMenuName.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
              });
              for (let i = 0; i < this.roleSidebarArray.length; i++) {
                this.roleSidebarArray[i].child.sort(function (a, b) {
                  var textA = a.menuName;
                  var textB = b.menuName;
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                this.roleSidebarArray[i].menuKey = this.roleSidebarArray[i].child[0].menuKey;
              }
            }
          }
          this.selectedItem = this.rolesModuledata[0].menuKey;
          for (let i = 0; i < this.rolesModuledata.length; i++) {
            this.checboxArray.push({ 'id': "menu_" + this.rolesModuledata[i].menuKey, 'name': this.rolesModuledata[i].menuName });
            if (this.rolesModuledata[i].actions.length > 0) {
              for (let k = 0; k < this.rolesModuledata[i].actions.length; k++) {
                this.checboxArray.push({ 'id': "action_" + this.rolesModuledata[i].actions[k].actionKey, 'name': this.rolesModuledata[i].actions[k].actionName });
              }
            }
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

  /**
   * Add/Update user role
   */

   test(){
     this.FormGroup.reset();
    this._router.navigate(['/users/roles/edit', 1418019]);
   }
  addUpdateUserRole() {
    if (this.FormGroup.valid) {
      this.showLoader = true;
      let roleManagement = this.FormGroup.value;
      let roleArrayChild = [];
      this.prepareData(roleManagement).then(res => {
        let addEditRoleData = {
          "userTypeKey": this.userTypeKey ? this.userTypeKey : '',
          "userTypeName": this.FormGroup.value.userTypeName,
          "menuActionList": this.roleArray
        }
        this.roleArray = []
        var URL = UsersApi.saveUpdateRoleAccessMenuAction;
        this.hmsDataServiceService.postApi(URL, addEditRoleData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.showLoader = false;
            this.toastrService.success(this.translate.instant('user.toaster.roleSaveSuccess'));
            if (data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY") {
              this._router.navigate(['/users/roles/edit', data.result.userTypeKey]);
            }
            else if (data.hmsMessage.messageShort == "RECORD_UPDATED_SUCCESSFULLY") {
              this.showLoader = false
              this.showSideBarChecked();
              this.viewRoleDetails(data.result.userTypeKey, 'edit')
            }
            this.submitted = true;
          } else {
            this.submitted = false;
            this.showLoader = false
            this.toastrService.error(this.translate.instant('user.toaster.roleNotSaved'));
          }
        });
      })
    }
    else {
      this.validateAllFormFields(this.FormGroup);
      //Get focus on Invalid field
      this.submitted= false
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  prepareData(roleManagement) {
    let promise = new Promise((resolve, reject) => {
      let roleArrayChild = [];
      for (let key in roleManagement) {
        if (key != 'userTypeName') {
          let x = key.split("_");
          roleArrayChild = [];
          for (let childKey in roleManagement[key]) {
            if (childKey != 'mainaction_' + x[1]) {
              let child = childKey.split("_");
              if (roleManagement[key][childKey]) {
                roleArrayChild.push({ "actionKey": child[1], "actionAccess": "T" });
              }
              else {
                roleArrayChild.push({ "actionKey": child[1], "actionAccess": "F" });
              }
            }
          }
          if (roleManagement[key]['mainaction_' + x[1]]) {
            this.roleArray.push({ "menuKey": x[1], "menuAccess": "T", "actions": roleArrayChild });
          }
          else {
            this.roleArray.push({ "menuKey": x[1], "menuAccess": "F", "actions": roleArrayChild });
          }
        }
      }
      resolve()
    })
    return promise
  }

  /**
  * Validate the user role form fields
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
   * Enable User Role Form Edit Mode
   */
  enableEditMode() {
    this.disabledItem = false;
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    if (this.FormGroup.get("menu_15").get('action_37').value) {
      this.FormGroup.patchValue({ ["menu_174"]: { ['action_347']: true } });
      this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
      this.overRidesTrue = true
    }
    else {
      this.overRidesTrue = false
    }
    this.FormGroup.enable();
  }

  /**
   * Add active class to selected menu item
   * @param menuKey 
   */
  addActiveClass(menuKey) {
    this.showSubMenu = true;
    this.selectedItem = menuKey
    if (menuKey == '174') {
      if (this.FormGroup.get("menu_15").get('action_37').value) {
        this.FormGroup.patchValue({ ["menu_174"]: { ['action_347']: true } });
        this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
        this.overRidesTrue = true
      }
      else {
        this.overRidesTrue = false
      }
    }
  }

  addActiveClassMenu(menuKey) {
    this.showSubMenu = true;
    this.selectedItem = menuKey
    if (menuKey == '174') {
      if (this.FormGroup.get("menu_15").get('action_37').value) {
        this.FormGroup.patchValue({ ["menu_174"]: { ['action_347']: true } });
        this.FormGroup.patchValue({ ["menu_174"]: { ['mainaction_174']: true } });
        this.overRidesTrue = true
      }
      else {
        this.overRidesTrue = false
      }
    }
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
  }

  addActiveClass1(menuKey, event) {
    this.showSubMenu = true;
    let index1 = this.roleSidebarArray.findIndex(x => x.menuKey == menuKey);
    if (event.target.checked) {
      $("#slider" + this.roleSidebarArray[index1].parentMenuId).removeClass('fewSelected')
      $("#slider" + this.roleSidebarArray[index1].parentMenuId).addClass('allSelected')
      for (let i = 0; i < this.roleSidebarArray[index1].child.length; i++) {
        this.FormGroup.patchValue({ ["menu_" + this.roleSidebarArray[index1].child[i].menuKey]: { ['mainaction_' + this.roleSidebarArray[index1].child[i].menuKey]: true } });
        for (let j = 0; j < this.roleSidebarArray[index1].child[i].actions.length; j++) { this.FormGroup.patchValue({ ["menu_" + this.roleSidebarArray[index1].child[i].menuKey]: { ['action_' + this.roleSidebarArray[index1].child[i].actions[j].actionKey]: true } }); }
      }
    }
    else {
      for (let i = 0; i < this.roleSidebarArray[index1].child.length; i++) {
        this.checkBoxParent = false
        this.FormGroup.patchValue({ ["menu_" + this.roleSidebarArray[index1].child[i].menuKey]: { ['mainaction_' + this.roleSidebarArray[index1].child[i].menuKey]: false } });
        for (let j = 0; j < this.roleSidebarArray[index1].child[i].actions.length; j++) { this.FormGroup.patchValue({ ["menu_" + this.roleSidebarArray[index1].child[i].menuKey]: { ['action_' + this.roleSidebarArray[index1].child[i].actions[j].actionKey]: false } }); }
      }
      this.FormGroup.patchValue({ ["menu_" + menuKey]: { ['mainaction_' + menuKey]: false } });
    }
  }

  /**
   * Filter roles sidebar
   * @param appCd 
   */
  roleSidebarFilter(appCd) {
    return this.roleSidebarArray.filter(x => x.appCd == appCd);
  }

  /**
   * Toggle menu sidebar
   * @param menuState 
   */
  toggleAppMenu(menuState, menuCd) {
    if ($("#mainMenu" + menuCd).hasClass("in") == false) {
      $('.mainMenuItems').removeClass('in');
      $(".toggleMainMenuName").attr("aria-expanded", "false");
    }
    setTimeout(() => {
      this.showSideBarChecked();
    }, 500);
    if (menuState == true) {
      this.showSubMenu = false;
      this.roleSidebarArray = []
      this.rolesModuledata = []
      this.selectedItem = ''
      this.updateUserRolesModules();
    }
  }

  /**
   * Update the user sidebar menu
   */
  updateUserRolesModules() {
    let promise = new Promise((resolve, reject) => {
      if (this.menuArrayInitial.length > 0) {
        for (let i = 0; i < this.menuArrayInitial.length; i++) {
          if (this.menuArrayInitial[i].parentMenuId == -1) {
            this.mainMenu.push(this.menuArrayInitial[i])
          } else {
            this.rolesModuledata.push(this.menuArrayInitial[i]);
          }
        }
        let mainMenuArray = [];
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
          for (let i = 0; i < this.mainMenu.length; i++) {
            let indexZero = this.roleSidebarArray.findIndex(x => x.parentMenuId === this.mainMenu[i].menuKey);
            if (indexZero == -1) {
              this.roleSidebarArray.push({ "appName": this.mainMenu[i].hmsApplicationDesc, "appCd": this.mainMenu[i].hmsApplicationCd, "parentMenuId": this.mainMenu[i].parentMenuId, "parentMenuName": this.mainMenu[i].parentMenuName, "menuKey": this.mainMenu[i].menuKey, "child": [this.mainMenu[i]] });
            }
          }
          //For Sort sidebar menu in Alphabetically order
          if (this.roleSidebarArray.length > 0) {
            this.roleSidebarArray.sort(function (a, b) {
              var textA = a.parentMenuName.toUpperCase();
              var textB = b.parentMenuName.toUpperCase();
              return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
          }
        }
        this.selectedItem = this.rolesModuledata[0].menuKey;
        for (let i = 0; i < this.rolesModuledata.length; i++) {
          this.checboxArray.push({ 'id': "menu_" + this.rolesModuledata[i].menuKey, 'name': this.rolesModuledata[i].menuName });
          if (this.rolesModuledata[i].actions.length > 0) {
            for (let k = 0; k < this.rolesModuledata[i].actions.length; k++) {
              this.checboxArray.push({ 'id': "action_" + this.rolesModuledata[i].actions[k].actionKey, 'name': this.rolesModuledata[i].actions[k].actionName });
            }
          }
        }
        resolve()
        return this.checboxArray
      }
      else {
        resolve()
        return this.checboxArray = []
      }
    });
    return promise
  }

  /**
   * Toggle the submenu on click menu item
   * @param sideBarKey 
   */
  toggleSubMenu(sideBarKey) {
    if ($("#subMenu" + sideBarKey).hasClass("in") == false) {
      $('.subMenuItems').removeClass('in');
      $(".toggleSubMenuName").attr("aria-expanded", "false");
    }
  }

  disableOrEnableViewMode(index, menuKey, key, viewIndex) {
    this.disableViewMode = this.FormGroup.get("menu_" + menuKey).get('action_' + this.rolesModuledata[key].actions[viewIndex].actionKey)
    this.FormGroup.patchValue({ ["menu_" + menuKey]: { ['action_' + this.rolesModuledata[key].actions[viewIndex].actionKey]: true } });
    $("#view_" + menuKey + "_" + this.rolesModuledata[key].actions[viewIndex].actionKey).addClass('disableView')
  }

  checkParentValue(menuKey) {
    let index1 = this.roleSidebarArray.findIndex(x => x.parentMenuId == menuKey);
    this.trueCount = 0; this.falseCount = 0
    for (let i = 0; i < this.roleSidebarArray[index1].child.length; i++) {
      for (let j = 0; j < this.roleSidebarArray[index1].child[i].actions.length; j++) {
        if ((this.FormGroup.get("menu_" + this.roleSidebarArray[index1].child[i].menuKey).get('action_' + this.roleSidebarArray[index1].child[i].actions[j].actionKey).value)) {
          this.trueCount += 1
        } else {
          this.falseCount += 1
        }
      }
    }
    if (this.trueCount > 0 && this.falseCount > 0) {
      $(("#checkBoxParent") + menuKey).prop("checked", true);
      $("#slider" + menuKey).addClass('fewSelected')
      $("#slider" + menuKey).removeClass('allSelected')
    } else if (this.falseCount == 0) {
      $("#slider" + menuKey).removeClass('fewSelected')
      $("#slider" + menuKey).removeClass('allUnselected')
      $(("#checkBoxParent") + menuKey).prop("checked", true);
    } else {
      $("#slider" + menuKey).removeClass('fewSelected')
      $("#slider" + menuKey).addClass('allUnselected')
      $(("#checkBoxParent") + menuKey).prop("checked", false);
    }
  }

  showSideBarChecked() {
    for (let i = 0; i < this.roleSidebarArray.length; i++) {
      let parentMenuId = this.roleSidebarArray[i].parentMenuId
      for (let j = 0; j < this.roleSidebarArray[i].child.length; j++) {
        let index1 = this.roleSidebarArray.findIndex(x => x.parentMenuId == this.roleSidebarArray[i].child[j].menuKey);
        this.flag = false
        for (let k = 0; k < this.roleSidebarArray[i].child[j].actions.length; k++) {
          if (this.FormGroup.get("menu_" + this.roleSidebarArray[i].child[j].menuKey).get('action_' + this.roleSidebarArray[i].child[j].actions[k].actionKey).value == false) {
            this.flag = true
          }
          if (this.flag == true) {
            $(("#checkBoxParent") + parentMenuId).prop("checked", false);
          }
          else {
            $(("#checkBoxParent") + parentMenuId).prop("checked", true);
          }
        }
      }
      this.checkParentValue(parentMenuId)
    }
  }


  patchExistingValues() {
    this.exDialog.openConfirm(this.translate.instant('user.toaster.returnPreviousPageNew')).subscribe((value) => {
      /** Start Add Mode */
      if (this.addMode) {
        if (value) {
          this.addUpdateUserRole();
          this._router.navigate(['/users/roles/add'])
        } else {
          this.FormGroup.reset();
          //For Reset Left Side Menu Items Checked
          for (let i = 0; i < this.roleSidebarArray.length; i++) {
            let parentMenuId = this.roleSidebarArray[i].parentMenuId
            for (let j = 0; j < this.roleSidebarArray[i].child.length; j++) {
              let index1 = this.roleSidebarArray.findIndex(x => x.parentMenuId == this.roleSidebarArray[i].child[j].menuKey);
              this.flag = false
              for (let k = 0; k < this.roleSidebarArray[i].child[j].actions.length; k++) {
                if (this.FormGroup.get("menu_" + this.roleSidebarArray[i].child[j].menuKey).get('action_' + this.roleSidebarArray[i].child[j].actions[k].actionKey).value == false) {
                  this.flag = true
                }
                $(("#checkBoxParent") + parentMenuId).prop("checked", false)
              }
            }
            this.checkParentValue(parentMenuId)
          }
        }
      }
      /** End Add Mode */

      /** Start Edit Mode */
      if (this.editMode) {
        if (value) {
          this.addUpdateUserRole();
        } else {
        }
      }
      /** End Edit Mode */
    });
  }
  /**
   * Sort Sub menu data Alphabeticallly 
   * for issue 380
   */
  sortSubMenuAlphabetically(data) {
    return data.sort(function (a, b) {
      var keyA = a.menuName,
        keyB = b.menuName;
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
  }

}