import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { UsersApi } from '../users-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CardApi } from '../../card-module/card-api';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompanyService } from '../../company-module/company.service';
import { Constants } from '../../common-module/Constants';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css'],
  providers: [DatatableService, ChangeDateFormatService, ToastrService]
})

export class UserRolesComponent implements OnInit {
  currentUser;
  roleKey;
  ObservableObjUsers;
  [x: string]: any;
  tableActions: any;
  actionAcces: any;
  public roleData: CompleterData;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  userRoleList;
  columns;
  columnsUsers;
  observableObj;
  checkRole = true;
  checkUsers = true;
  tableId = "userRolesList";
  getRoleListDataTableApiUrl = UsersApi.getRoleListDataTableApiUrl;
  public userRolesData: CompleterData;
  selectedUserRole: any;
  arrUsersRolesList: any;
  selectedUserRoleKey: any;
  selectedUserRoleName: any;
  showLoader: boolean = true;
  role: string;
  checkvalue: boolean = true;
  public isOpen: boolean = false;
  userRolesAuthCheck = [{
    "addRole": 'F',
    "viewRole": 'F',
    "deleteRole": 'F'
  }]
  rolAssignedTypeList = [];
  rolAssignedData: any;
  selctedDropDownUsrType = []
  selectedRolAssignedValue: any;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  @Output() selectedRolAssignedKey = new EventEmitter();

  constructor(
    private router: Router,
    private dataTableService: DatatableService,
    private translate: TranslateService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastrService: ToastrService,
    private changeDateFormatService: ChangeDateFormatService,
    private exDialog: ExDialog,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService,
    private companyService: CompanyService,
  ) {
    this.companyService.getRolAssignedType.emit(Constants.quikcardBusnsTypeKey);
    this.getRolAssignedUserType();
  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SRL']
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SRL']
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
      })
    }
    var tableActions = [
      { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
      { 'name': 'copy role', 'class': 'table-action-btn copy-ico', 'icon_class': 'fa fa-copy', 'title': 'Copy Role' }
    ]
    this.observableObj = Observable.interval(1500).subscribe(x => {
      if (this.checkRole = true) {
        if ('user.userRoles.userRole' == this.translate.instant('user.userRoles.userRole')) {
        } else {
          this.columns = [
            { title: this.translate.instant('user.userRoles.userRole'), data: 'userTypeName' },
            { title: this.translate.instant('user.userRoles.membersCount'), data: 'userTypeCount' },
            { title: this.translate.instant('common.action'), data: 'userTypeKey' }
          ]
          this.checkRole = false;
          this.observableObj.unsubscribe();
        }
      }
    })
    this.ObservableObjUsers = Observable.interval(1500).subscribe(x => {
      if (this.checkUsers) {
        if ('company.company-credit-limit.add-credit-limit' == this.translate.instant('company.company-credit-limit.add-credit-limit')) {
        }
        else {
          this.columnsUsers = [
            { title: this.translate.instant('user.user-search-filter.fname'), data: 'firstName' },
            { title: this.translate.instant('user.user-search-filter.lname'), data: 'lastName' },
            { title: this.translate.instant('user.user-search-filter.email'), data: 'email' }
          ]
          this.checkUsers = false;
          this.ObservableObjUsers.unsubscribe();
        }
      }
    });
    this.userRoleList = [
      { 'id': 'A', 'name': 'Admin' },
      { 'id': 'D', 'name': 'Data Operator' },
      { 'id': 'S', 'name': 'Supervisor' },
    ]
    this.role = localStorage.getItem('roleLabel');
  }

  /**
   * Call After View Loaded
   */
  ngAfterViewInit() {
    this.getUserRolesList();
    var self = this;
    $(document).unbind();
    $(document).on('click', '#userRolesList .view-ico', function () {
      var id = $(this).data('id');
      self.editUserRoleById(id);
    });
    //Row click added
    $(document).on('click', '#userRolesList tr td:not(:last-child)', function () {
      $(this).parent('tr').find('.view-ico').trigger('click')
    });
    $(document).on('click', '#userRolesList .copy-ico', function () {
      var id = $(this).data('id');
      self.copyUserRoleById(id);
    });
    $(document).on('click', '#userRolesList .view-members', function () {
      self.roleKey = $(this).data('id');
      self.getMembersList(self.roleKey);
    });
  }

  /**
   * Check the access provided to the user
   * @param claimChecks 
   */
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.userRolesAuthCheck = [{
        "addRole": 'T',
        "viewRole": 'T',
        "deleteRole": 'T'
      }]
    }
    else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.userRolesAuthCheck = [{
        "addRole": authCheck['SRL6'],
        "viewRole": authCheck['SRL7'],
        "deleteRole": authCheck['SRL8']
      }]
    }
    this.getAllUsersList(this.userRolesAuthCheck);
    return this.userRolesAuthCheck
  }

  /**
   * Get All User Role List
   * @param userRolesAuthCheck 
   */
  getAllUsersList(userRolesAuthCheck) {
    this.columns = [
      { title: this.translate.instant('user.userRoles.userRole'), data: 'userTypeName' },
      { title: this.translate.instant('user.userRoles.membersCount'), data: 'userTypeCount' },
      { title: this.translate.instant('common.action'), data: 'userTypeKey' }
    ]
    this.actionAcces = 2;
    if (userRolesAuthCheck[0].viewRole == "T" && userRolesAuthCheck[0].deleteRole == "T") {
      this.tableActions = [
        { 'name': 'view members', 'class': 'table-action-btn view-members', 'icon_class': 'fa fa-users', 'title': 'View Members' },
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
        { 'name': 'copy role', 'class': 'table-action-btn copy-ico', 'icon_class': 'fa fa-copy', 'title': 'Copy Role' }
      ]
    }
    else if (userRolesAuthCheck[0].viewRole == "T" && userRolesAuthCheck[0].deleteRole == "F") {
      this.tableActions = [
        { 'name': 'view members', 'class': 'table-action-btn view-members', 'icon_class': 'fa fa-users', 'title': 'View Members' },
        { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View' },
        { 'name': 'copy role', 'class': 'table-action-btn copy-ico', 'icon_class': 'fa fa-copy', 'title': 'Copy Role' }
      ]
    }
    else if (userRolesAuthCheck[0].viewRole == "F" && userRolesAuthCheck[0].deleteRole == "T") {
      this.tableActions = [
        { 'name': 'view members', 'class': 'table-action-btn view-members', 'icon_class': 'fa fa-users', 'title': 'View Members' }
      ]
    }
    else if (userRolesAuthCheck[0].viewRole == "F" && userRolesAuthCheck[0].deleteRole == "F") {
      this.tableActions = [
        { 'name': 'view members', 'class': 'table-action-btn view-members', 'icon_class': 'fa fa-users', 'title': 'View Members' }
      ]
    }
    var reqParam = []
    if (!$.fn.dataTable.isDataTable('#userRolesList')) {
      this.dataTableService.jqueryDataTable(this.tableId, this.getRoleListDataTableApiUrl, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, this.tableActions, this.actionAcces, undefined, '', '', [1, 2])
    } else {
      this.searchUserRoleList("userRolesList");
    }
  }

  /**
   * Search Listing for User Role
   * @param tableId 
   */
  searchUserRoleList(tableId: string) {
    var params = this.dataTableService.getFooterParams("userRolesList")
    var URL = UsersApi.getRoleListDataTableApiUrl;
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  /**
   * Reset Listing for User Role
   */
  resetUserRoleListFilter() {
    this.dataTableService.resetTableSearch();
    this.searchUserRoleList("userRolesList");
  }

  /**
   * Navigate to role edit route
   */
  editUserRoleById(id) {
    this.router.navigate(['/users/roles/edit', id]);
  }

  /**
   * Navigate to role copy route
   */
  copyUserRoleById(id) {
    this.router.navigate(['/users/roles/copy', id]);
  }

  /**
   * Delete user role
   * @param id 
   */
  deleteUserRoleById(id) {
    let requestedData = {
      "id": id
    }
    this.exDialog.openConfirm(this.translate.instant('company.exDialog.confirmDelete')).subscribe((valueDeletePlan) => {
      if (valueDeletePlan) {
        this.hmsDataServiceService.postApi(UsersApi.deletetUserRoleUrl, requestedData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('user.toaster.roleDeletedSuccess'));
            var params = this.dataTableService.getFooterParams("userRolesList")
            this.dataTableService.jqueryDataTableReload(this.tableId, this.getRoleListDataTableApiUrl, params)
          }
          else {
            this.toastrService.error(this.translate.instant('user.toaster.roleNotDeleted'));
          }
        });
      }
    });
  }

  /**
   * Columns translation methods
   */
  columnTranslated() {
    this.columns = [
      { title: this.translate.instant('user.userRoles.userRole'), data: 'providerFirstName' },
      { title: this.translate.instant('user.userRoles.membersCount'), data: 'providerLicenseNumber' },
      { title: this.translate.instant('user.userRoles.action'), data: 'providerKey' },
    ]
  }

  /**
   * Get User Roles List
   */
  getUserRolesList() {
    let reqData = { 'role': this.role }
    this.hmsDataServiceService.postApi(UsersApi.getRoleList, reqData).subscribe(data => {
      this.showLoader = false;
      if (data.code == 200) {
        this.arrUsersRolesList = data.result;
        //Predictive Company Search Upper
        this.userRolesData = this.completerService.local(
          this.arrUsersRolesList,
          "role",
          "role"
        );
      }
    })
  }

  getRolAssignedUserType_old() {
    var URL = UsersApi.getUserTypeList;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        this.rolAssignedTypeList = data.result;
        //Predictive Company Search Upper
        this.rolAssignedData = this.completerService.local(
          this.rolAssignedTypeList,
          "userTypeName",
          "userTypeName"
        );
      }
    });
  }

  getRolAssignedUserType() {
    var URL = UsersApi.getUserTypeList;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        this.rolAssignedTypeList = data.result;
        this.rolAssignedData = this.completerService.local(
          this.rolAssignedTypeList,
          "userTypeName",
          "userTypeName"
        );
      }
    });
  }

  onRolAssignedSelected(selected: CompleterItem) {
    if (selected) {
      this.selctedDropDownUsrType = []
      this.selctedDropDownUsrType.push({ "userTypeKey": selected.originalObject.userTypeKey })
      this.selectedRolAssignedValue = selected.originalObject.rolAssigned;
      this.getRolAssignedType(this.selectedRolAssignedValue);
    }
    else {
      this.selectedRolAssignedValue = '';
    }
    this.selectedRolAssignedKey.emit(this.selectedRolAssignedValue);
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

  keyDownFunction(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchUserRoleList(tableId);
    }
  }

  /**
   * Get List Of All Members
   * @param  roleId
   */
  getMembersList(roleId) {
    this.hmsDataServiceService.OpenCloseModal('userMembersPopUp');
    this.getRoleUsersList(roleId);
  }

  /**
   * Get Users List By RoleId
   * @param roleId 
   */
  getRoleUsersList(roleId) {
    if (roleId != undefined) {
      var URL = UsersApi.getRoleMembersByUserTypeKeyUrl;
      var reqParam = [
        { 'key': 'userTypeKey', 'value': roleId },
        { 'key': 'firstName', 'value': '' },
        { 'key': 'lastName', 'value': '' },
        { 'key': 'email', 'value': '' }
      ]
      if (!$.fn.dataTable.isDataTable('#roles-users-list')) {
        this.dataTableService.jqueryDataTable('roles-users-list', URL, 'full_numbers', this.columnsUsers, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [1, 2])
      } else {
        this.dataTableService.jqueryDataTableReload('roles-users-list', URL, reqParam)
      }
    }
  }

  /**
   * Filter User By Roles
   * @param tableId 
   */
  filterRoleUsersList(tableId: string) {
    var URL = UsersApi.getRoleMembersByUserTypeKeyUrl;
    var params = this.dataTableService.getFooterParams("roles-users-list")
    params[3] = { 'key': 'userTypeKey', 'value': this.roleKey };
    this.dataTableService.jqueryDataTableReload(tableId, URL, params)
  }

  /**
   * Reset The Filter Member Search
   * @param tableId 
   */
  resetRolesUserListFilter(tableId: string) {
    this.dataTableService.resetTableSearch();
    this.filterRoleUsersList(tableId);
  }
}