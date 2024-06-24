import { Constants } from '../common-module/Constants'

export class CommonApi {
    static getAllCompanyByPagination = Constants.baseUrl + 'company-service/getAllCompanyByPagination'
    static getCompanyByPredictiveSearch = Constants.baseUrl + 'company-service/getCompanyPredictiveSearch'
    static getLanguageList = Constants.baseUrl + 'company-service/getAllLanguage'
    static getCompanyDetailByCompanyCoKey = Constants.baseUrl + 'company-service/getCompanyDetailByCompanyCoKey'
    static getCommentList = Constants.baseUrl
    static updateComment = Constants.baseUrl
    static getCardHolderRoleListUrl = Constants.baseUrl + 'cardholder-service/getCardHolderRoleList'
    static getCompanyCommentList = Constants.baseUrl + '';
    static getAllCompanyByPaginationUrl = Constants.baseUrl + 'company-service/getAllCompanyByPagination';
    static loginUrl = Constants.loginbaseUrl + 'auth/oauth/token'
    static generateOtp = Constants.baseUrl + 'userrole-setup-service/generateOtp'
    static verifyOtpUrl = Constants.baseUrl + 'userrole-setup-service/verifyOtp'
    static verifyMobileNumberUrl = Constants.baseUrl + 'userrole-setup-service/verifyMobileNumber'
    static forgotUrl = Constants.baseUrl + 'user-service/forgotPassword'
    static companySearchUrl = Constants.baseUrl + 'company-service/companySearch';
    static logoutUrl = Constants.baseUrl + 'auth/oauth/revoke-token';
    static isCompanyPostalcodeValidUrl = Constants.baseUrl + 'company-service/getPostalDetail';
    static isCompanyCityProvinceCountryValidUrl = Constants.baseUrl + 'company-service/verifyPostalDetail';
    static getCompanyWithPlansByCoIdOrCoName = Constants.baseUrl + 'company-service/getCompanyWithPlansByCoIdOrCoName'
    static getBusinessTypeUrl = Constants.baseUrl + 'company-service/getBusinessType';
    static getMenuActionsByRoleKey = Constants.baseUrl + 'userrole-setup-service/getMenuActionsByRoleKey';
    static getAllHmsApplicationMenu = Constants.baseUrl + 'userrole-setup-service/getAllHmsApplicationMenu';
    static getUserWithRole = Constants.baseUrl + 'userrole-setup-service/getUserWithRoles';
    static disableFirstAttemptLoginUrl = Constants.baseUrl + 'userrole-setup-service/disableFirstAttemptLogin';

    //Bank Account Api 
    static getBankDetailsUrl = Constants.baseUrl + 'fee-guide-service/getBankDetails';
    static excelNotificationSchedulerList = Constants.baseUrl + 'financial-payable-service/excelNotificationSchedulerList';
    static changePasswordUrl = Constants.baseUrl + 'userrole-setup-service/changePassword';
    static otpEmailStatusUrl = Constants.baseUrl + 'userrole-setup-service/otpEmailStatus';
    static getOtpEmailStatusUrl = Constants.baseUrl + 'userrole-setup-service/getOtpEmailStatus';
    static trackApiUrl = Constants.baseUrl + 'userrole-setup-service/track';
    static setUserAuditDetailUrl = Constants.baseUrl + 'userrole-setup-service/setUserAuditDetail';
}