import { Component, OnInit, HostListener, EventEmitter, Output } from '@angular/core';
import { UsersModuleComponent } from '../users-module.component';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataEntryApi } from '../../data-entry-module/data-entry-api';
import { UsersApi } from '../users-api';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Constants } from '../../common-module/Constants';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { TextMaskModule } from 'angular2-text-mask';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CompanyApi } from '../../company-module/company-api'
import { CompanyService } from '../../company-module/company.service';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.css'],
  providers: [DatatableService, TranslateService, ChangeDateFormatService, ToastrService]
})

export class SearchUserComponent implements OnInit {
  currentUser: any;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  tableActions;
  actionAcces;
  reqParam;
  getUserSearchList;
  FormGroup: FormGroup;
  columns = [];
  public filterUsers: FormGroup;
  showUsersList: boolean = false;
  checkvalue: boolean = true;
  ObservableObj;
  firstName;
  lastName;
  emailId;
  roleAssigned;
  phoneNumber;
  userId: any;
  userSearch;
  additonalInfoList = [];
  selectedItems = [];
  selctedDropDownVal;
  deniedLineItem: any;
  dropdownSettings: {};
  lineItemSettings
  phoneMask = CustomValidators.phoneMaskV1;
  businessTypeLower;
  public businessTypeData: CompleterData;
  public isOpen: boolean = false;
  hideSuspendedButton
  showLoader: boolean = true;
  role: string
  @Output() selectedBusinessTypeKey = new EventEmitter();
  @Output() selectedRolAssignedKey = new EventEmitter();

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  selectedDepartmentValue: any;
  isCompanyTerminated: string;
  isCompanySuspended: boolean;
  businessTypeList = [];
  usersAuthCheck = [{
    "searchRole": 'F',
    "addRole": 'F',
    "addUser": 'F',
    "viewUser": 'F',
    "deleteUser": 'F',
  }]
  rolAssignedData: any;
  selctedDropDownUsrType = []
  selectedRolAssignedValue: any;
  rolAssignedTypeList = [];
  tableId = "users-list";

  public departmentData: CompleterData

  constructor(private translate: TranslateService,
    private dataTableService: DatatableService,
    private route: ActivatedRoute,
    private router: Router,
    private exDialog: ExDialog,
    private hmsDataServiceService: HmsDataServiceService,
    private ToastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private companyService: CompanyService,
  ) {
    this.companyService.getbussinessType.emit(Constants.quikcardBusnsTypeKey);
    this.companyService.getRolAssignedType.emit(Constants.quikcardBusnsTypeKey);
    this.getBusinessType();
    this.getRolAssignedUserType();
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

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SUR'].concat(this.currentUserService.authChecks['SRL'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        this.dataTableInitialize()
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['SUR'].concat(this.currentUserService.authChecks['SRL'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        this.dataTableInitialize()
      })
    }
    this.role = localStorage.getItem('roleLabel')
    this.dropdownSettings = Constants.angular2Multiselect
    this.lineItemSettings = Constants.multiselect
    this.filterUsers = new FormGroup({
      'firstName': new FormControl(),
      'lastName': new FormControl(),
      'emailId': new FormControl(),
      'roleAssigned': new FormControl(),
      'phoneNumber': new FormControl()
    });
    var self = this
    $(document).unbind();
    $(document).on('click', '#users-list .view-ico', function () {
      var uId = $(this).data('id');
      self.ViewUserPage(uId)
    })
    //Delect Event of User
    $(document).on('click', '#users-list .del-ico', function () {
      var uId = $(this).data('id');
      self.deleteUser(uId)
    })
    //Reactivate Event of User
    $(document).on('click', '#users-list .reactivate-ico', function () {
      var uId = $(this).data('id');
      self.ReactivateUser(uId)
    })
    $(document).on('mouseover', '.view-ico', function () {
      $(this).attr('title', self.translate.instant('common.view'));
    })
    $(document).on('mouseover', '#users-list .del-ico', function () {
      $(this).attr('title', self.translate.instant('common.inactivate'));
    })
    $(document).on('click', '#users-list tr td:not(:last-child)', function () {
      $(this).parent('tr').find('.view-ico').trigger('click')
    });
    this.getUsersRoleList();
    /* class added in div of QUIKCARD logo to prevent destortion in logo when login after logging out from ab govt claim view section. */
    // for pointNo.668 for ADSC logo size issue when we login through ADSC user
    if(this.role == "ROLE_DOCTOR"){
      $(".logo").removeClass("quikcardLogoSizing")
    }
    else{
      $(".logo").addClass("quikcardLogoSizing")
    }
  }

  dataTableInitialize() {
    var URL = UsersApi.userSearch;
    var reqParam = [
      { 'key': 'firstName', 'value': '' },
      { 'key': 'lastName', 'value': '' },
      { 'key': 'username', 'value': '' },
      { 'key': 'roleLabel', 'value': '' },
      { 'key': 'phoneNumber', 'value': '' },
      { 'key': 'userId', 'value': '' },
      { 'key': 'deleted', 'value': '' }
    ]
    this.ObservableObj = Observable.interval(1000).subscribe(x => {
      if (this.checkvalue) {
        if ('user.user-search-filter.fname' == this.translate.instant('user.user-search-filter.fname')) {
        }
        else {
          this.columns = [
            { title: this.translate.instant('user.user-search-filter.fname'), data: 'firstName' },
            { title: this.translate.instant('user.user-search-filter.lname'), data: 'lastName' },
            { title: this.translate.instant('user.user-search-filter.email'), data: 'username' },
            { title: this.translate.instant('user.user-search-filter.phonenum'), data: 'phoneNumber' },
            { title: this.translate.instant('common.action'), data: 'userId' },
          ]
          this.tableActions = [
            { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.usersAuthCheck[0].viewUser },
            { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': this.usersAuthCheck[0].deleteUser },
          ]
          if (!$.fn.dataTable.isDataTable('#users-list')) {
            this.dataTableService.userSearchDataTable(this.tableId, URL, 'full_numbers', this.columns, 25, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, this.tableActions, 4, '', '', '', [1, 2, 3, 4]);
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, URL, reqParam)
          }
          this.checkvalue = false;
          this.ObservableObj.unsubscribe();
        }
      }
    });
    //For Date Fields Filter Search On Enter
    $(document).on('keydown', '#users-list .selected-list', function (event) {
      var tableId = $(this).closest('table').attr('id');
    })
  }

  getAuthCheck(claimChecks) {
    let authCheck = []
    this.currentUser = this.currentUserService
    if (this.currentUser.currentUser.isAdmin == 'T') {
      this.usersAuthCheck = [{
        "searchRole": 'T',
        "addRole": 'T',
        "addUser": 'T',
        "viewUser": 'T',
        "deleteUser": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.usersAuthCheck = [{
        "searchRole": authCheck['SUR5'],
        "addRole": authCheck['SRL6'],
        "addUser": authCheck['SUR1'],
        "viewUser": authCheck['SUR3'],
        "deleteUser": authCheck['SUR4'],
      }]
    }
    this.showUserList(this.usersAuthCheck);
    return this.usersAuthCheck
  }

  /**
   * Navigate to user detail route
   * @param uId 
   */
  ViewUserPage(uId) {
    this.router.navigate(['/users/view/'], { queryParams: { 'userId': uId } });
  }

  /**
  * Filter rules search form
  * @param filterUsers 
  */
  showUserList(usersAuthCheck) {
    // Conditions To Show button according to permissions
    if (usersAuthCheck[0].viewUser == "T" && usersAuthCheck[0].deleteUser == "T") {
      this.actionAcces = 7;
    }
    else if (usersAuthCheck[0].viewUser == "T" && usersAuthCheck[0].deleteUser == "F") {
      this.actionAcces = 7;
    }
    else if (usersAuthCheck[0].viewUser == "F" && usersAuthCheck[0].deleteUser == "T") {
      this.actionAcces = 7;
    }
    else if (usersAuthCheck[0].viewUser == "F" && usersAuthCheck[0].deleteUser == "F") {
      this.actionAcces = undefined;
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  /**
   * Serach User On Press Enter
   * @param event 
   */
  onKeyPress(event) {
    if (event.keyCode == 13) {
    }
  }

  /**
  * Reset Search filter cols
  */
  resetSearchForm() {
    this.showUsersList = false;
    this.filterUsers.reset();
  }

  /**
   * Search User Roles
   * @param tableId 
   */
  searchUserList(tableId: string) {
    var URL = UsersApi.userSearch;
    var obj = { key: 'searchType', value: 'l' };
    var params = this.dataTableService.getFooterParamsCompanySearchTable("users-list", obj)
    if (this.currentUser.currentUser.userGroup[0].userGroupName != 'SUPER_ADMIN_GROUP' && this.currentUser.currentUser.isAdmin == 'T') {
      params.push({ key: 'isAdmin', value: 'T' })
    }
    for (var departmentKey in params) {
      if (params[departmentKey].key == 'departmentKey') {
        params[departmentKey].value = this.selectedDepartmentValue != undefined ? this.selectedDepartmentValue : '';
      }
      if (params[departmentKey].key == 'userTypeKey') {
        params[departmentKey].value = this.selectedRolAssignedValue != undefined ? this.selectedRolAssignedValue : '';
      }
    }
    params.push({ key: 'roleLabel', value: this.selctedDropDownVal })
    this.dataTableService.jqueryDataTableReload(this.tableId, URL, params)
  }

  /**
   * Reset users form
   */
  resetUserListFilter() {
    this.selectedItems = [];
    this.selctedDropDownVal = "";
    this.selectedDepartmentValue = ''
    this.selectedRolAssignedValue = ''
    this.dataTableService.resetTableSearch();
    this.searchUserList("users-list");
    $('#rules-list .icon-mydpremove').trigger('click');
  }

  /**
  * Delete User
  * @param userId 
  */
  deleteUser(userId) {
    const userDeleteData = {
      "userId": userId
    }
    let deleteUser = UsersApi.deleteUser;
    let userDeleteJson = Object.assign(userDeleteData);
    this.exDialog.openConfirm(this.translate.instant('user.addEditViewUsers.areUSureDelete')).subscribe((valueDeletePlan) => {
      if (valueDeletePlan) {
        this.hmsDataServiceService.post(deleteUser, userDeleteJson).subscribe(data => {
          if (data.code == 200) {
            this.ToastrService.success(this.translate.instant('user.addEditViewUsers.userDeleteSuccessfully'))
            this.resetUserListFilter();
          }
        });
      } else {
        return false
      }
    });
  }

  /**
   * ReactivateUser User
   * @param userId 
  */
  ReactivateUser(userId) {
    const userReactivateData = {
      "userId": userId
    }
    let reactivateUser = UsersApi.reactivateUser;
    let userReactivateJson = Object.assign(userReactivateData);
    this.exDialog.openConfirm(this.translate.instant('user.addEditViewUsers.areUSureReactive')).subscribe((valueDeletePlan) => {
      if (valueDeletePlan) {
        this.hmsDataServiceService.post(reactivateUser, userReactivateJson).subscribe(data => {
          if (data.code == 200) {
            this.ToastrService.success(this.translate.instant('user.addEditViewUsers.userReactivateSuccessfully'))
            this.resetUserListFilter();
          }
        });
      } else {
        return false
      }
    });
  }

  /**
   * Get User Role List
   */
  getUsersRoleList() {
    this.showLoader = true;
    let reqData = { "role": this.role }
    var namePrefixURL = UsersApi.getRoleList;
    this.hmsDataServiceService.postApi(namePrefixURL, reqData).subscribe(data => {
      data.result.forEach(element => {
        this.additonalInfoList.push({
          "id": element.role,
          "itemName": element.roleLabel,
        });
      });
      this.showLoader = false;
    });
    return this.additonalInfoList;
  }

  onSelectDropDown(item: any) {
    this.selctedDropDownVal = item.itemName;
  }

  onDeSelectDropDown(item) {
    this.selctedDropDownVal = "";
  }

  /**
   * Get List of BusinessType
   */
  getBusinessType() {
    var URL = UsersApi.getDepartment;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        this.businessTypeList = data.result;
        //Predictive Company Search Upper
        this.businessTypeData = this.completerService.local(
          this.businessTypeList,
          "departmentName",
          "departmentName"
        );
      }
    });
  }

  /**
   * Select the department option
   * @param selected 
   */
  onSelectedDepartment(selected: CompleterItem) {
    if (selected) {
      this.selectedDepartmentValue = selected.originalObject.departmentKey;
    }
    else {
      this.selectedDepartmentValue = '';
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
   * Select the role option
   * @param selected 
   */
  onRolAssignedSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedRolAssignedValue = selected.originalObject.userTypeKey;
    }
    else {
      this.selectedRolAssignedValue = '';
    }
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

  getRolAssignedUserType() {
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

  /**
   * filter the search on press enter
   * @param event 
   * @param tableId 
   */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchUserList(tableId);
    }
  }

}