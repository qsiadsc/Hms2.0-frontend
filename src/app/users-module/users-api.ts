import { Constants } from '../common-module/Constants';

export class UsersApi {
  // These APIs used on behalf of users-module Api's
  static getRoleListDataTableApiUrl = Constants.baseUrl + 'userrole-setup-service/getRoleCount';
  static addUserRoleUrl = Constants.baseUrl + 'userrole-setup-service/addRole';
  static getRoleDetailByIdUrl = Constants.baseUrl + 'userrole-setup-service/getRoleById';
  static getMenuActionsByRoleKeyUrl = Constants.baseUrl + 'userrole-setup-service/getMenuActionsByRoleKey';
  static viewUserRole = Constants.baseUrl + 'userrole-setup-service/viewUserRole ';
  static editUserRoleUrl = Constants.baseUrl + 'userrole-setup-service/editRole';
  static deletetUserRoleUrl = Constants.baseUrl + 'userrole-setup-service/deleteRole';
  static saveUpdateRoleAccessMenuAction = Constants.baseUrl + 'userrole-setup-service/saveUpdateRoleAccessMenuAction';
  static getMenuActionsUrl = Constants.baseUrl + 'userrole-setup-service/getMenuActions';
  static getProviderSearchList = Constants.baseUrl + 'ahc-service/providerSearchResult';
  static userSearchUrl = Constants.baseUrl + 'userrole-setup-service/getUserList';
  static addUserUrl = Constants.baseUrl + 'userrole-setup-service/addUser';
  static getRoleList = Constants.baseUrl + 'userrole-setup-service/getRoleList';
  static userSearch = Constants.baseUrl + 'userrole-setup-service/userSearch';
  static getRoleMembersByUserTypeKeyUrl = Constants.baseUrl + 'userrole-setup-service/getRoleMembersByUserTypeKey';
  static getUserWithRoles = Constants.baseUrl + 'userrole-setup-service/getUserWithRoles';
  static updateUser = Constants.baseUrl + 'userrole-setup-service/updateUser';
  static deleteUser = Constants.baseUrl + 'userrole-setup-service/deleteUser';
  static getDepartment = Constants.baseUrl + 'userrole-setup-service/getDepartment';
  static getUserTypeList = Constants.baseUrl + 'userrole-setup-service/getUserTypeList';
  static reactivateUser = Constants.baseUrl + 'userrole-setup-service/reactivateUser';
  static getBusinessTypeUrl = Constants.baseUrl + 'company-service/getBusinessType';
  static getMenuActionsByRoleKey = Constants.baseUrl + 'userrole-setup-service/getMenuActionsByRoleKey';
  static getParentMenuByRoleKey = Constants.baseUrl + 'userrole-setup-service/getParentMenuByRoleKey';
  static getUserStatusList = Constants.baseUrl + 'userrole-setup-service/getUserStatusList';
  static changePasswordUrl = Constants.baseUrl + 'userrole-setup-service/changePassword';
  static getSubMenuByParentMenuKeyUrl = Constants.baseUrl + 'userrole-setup-service/getSubMenuByParentMenuKey';
}