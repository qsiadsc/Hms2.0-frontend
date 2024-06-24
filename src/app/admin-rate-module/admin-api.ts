import { Constants } from '../common-module/Constants';
export class AdminApi {
    static adminInfoSearchUrl = Constants.baseUrl + 'financial-payable-service/adminInfoSearch';
    static getFinacialAdminInfoUrl = Constants.baseUrl + 'financial-payable-service/getFinacialAdminInfo';
    static addUpdateFinacialAdminInfoUrl = Constants.baseUrl + 'financial-payable-service/addUpdateFinacialAdminInfo';
    static finacialAdminInfoSearchUrl = Constants.baseUrl + 'financial-payable-service/finacialAdminInfoSearch';
    static getBusinessTypeUrl = Constants.baseUrl + 'company-service/getBusinessType';
    static deleteFinacialAdminInfoUrl = Constants.baseUrl + 'financial-payable-service/deleteFinacialAdminInfo';
}