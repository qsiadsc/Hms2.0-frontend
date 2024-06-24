import {Constants} from '../common-module/Constants';

export class ServiceProviderApi {
    /* Service provider Search API */
    static getDisciplineList = Constants.baseUrl + 'claim-service/getDisciplineList';
    static getPostalCodeForSearch = Constants.baseUrl + 'service-prov-service/getPostalCodeList';
    static getServiceProviderSearchByFilter = Constants.baseUrl + 'service-prov-service/getServiceProviderSearchByFilter';
    static getSpeciality = Constants.baseUrl + 'service-prov-service/getSpecialityBasedOnDiscipline';
    static getServiceProviderByColumnFilter = Constants.baseUrl + 'service-prov-service/searchServiceProviderByColumnFilter';
    /* Save/Update Service provider API */
    static saveServiceProviderUrl = Constants.baseUrl + 'service-prov-service/saveServiceProvider';
    static updateServiceProviderUrl = Constants.baseUrl + 'service-prov-service/updateServiceProvider';
    static getServiceProviderDetailByIdWithoutEligUrl = Constants.baseUrl + 'service-prov-service/getServiceProviderDetailByIdWithoutElig';
    static addOrUpdateSingleCommentForServiceProviderUrl = Constants.baseUrl + 'service-prov-service/addOrUpdateSingleCommentForServiceProvider';
    static getImpCommentList = Constants.baseUrl + 'service-prov-service/getServiceProviderImportantCommentsList';
    /* Service provider Billing Address API */
    static saveServiceProviderBillAddUrl = Constants.baseUrl + 'service-prov-service/saveServiceProviderBillAdd';
    static getServiceProviderBillAddListUrl = Constants.baseUrl + 'service-prov-service/getServiceProviderBillAddList';
    static saveProviderApprovalUrl = Constants.baseUrl + 'service-prov-service/saveProviderApproval';
    static saveServiceProviderSpecialtyUrl = Constants.baseUrl + 'service-prov-service/saveServiceProviderSpecialty';
    static getSpecialityBasedOnDisciplineUrl = Constants.baseUrl + 'service-prov-service/getSpecialityBasedOnDiscipline';
    static getSpecialityAssgnListByProviderIdUrl = Constants.baseUrl + 'service-prov-service/getSpecialityAssgnListByProviderId';
    static getServiceProviderEligibilityBasedOnProviderUrl = Constants.baseUrl + 'service-prov-service/getServiceProviderEligibilityBasedOnProvider';
    static saveOrUpdateServiceProviderEligibilityUrl = Constants.baseUrl + 'service-prov-service/saveOrUpdateServiceProviderEligibility';
    static getServiceProviderBanDetailUrl = Constants.baseUrl + 'service-prov-service/getServiceProviderBanDetail';
    static getProviderApprovalListUrl = Constants.baseUrl + 'service-prov-service/getProviderApprovalList';
    static deleteProviderApprovalUrl = Constants.baseUrl + 'service-prov-service/deleteProviderApproval';
    static deleteServiceProviderBillAdd = Constants.baseUrl + 'service-prov-service/deleteServiceProviderBillAdd'; // log 801 11 may 2020
    
    /* BAN search */
    static getBANList = Constants.baseUrl + 'service-prov-service/searchBanListByDiscplineKey';
    static getBANListByColumnFilter = Constants.baseUrl + '';

    /* Save/Update BAN */
    static checkForExistingBanAssociationUrl = Constants.baseUrl + 'service-prov-service/checkForExistingBanAssociation';
    static autoGenerateBanNumberUrl = Constants.baseUrl + 'service-prov-service/autoGenerateBanNumber';
    static saveAndUpdateServiceProviderBanUrl = Constants.baseUrl + 'service-prov-service/saveAndUpdateServiceProviderBan';
    static getBankHistoryForBanUrl = Constants.baseUrl + 'service-prov-service/getBankHistoryForBan';
    static saveServiceProviderBankAccountDetailsUrl = Constants.baseUrl + 'service-prov-service/saveServiceProviderBankAccountDetails';
    static searchBanDetailByDiscplineKeyUrl = Constants.baseUrl + 'service-prov-service/searchBanDetailByDiscplineKey';
}
