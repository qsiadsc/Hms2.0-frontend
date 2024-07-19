import { Constants } from '../common-module/Constants';
import { stat } from 'fs';

export class CompanyApi {
    static autoGenerateCompanyNumberUrl = Constants.baseUrl + 'company-service/autoGenerateCompanyNumber';
    static isCompanyPostalcodeValidUrl = Constants.baseUrl + 'company-service/getPostalDetail';
    static isCompanyCityProvinceCountryValidUrl = Constants.baseUrl + 'company-service/verifyPostalDetail';

    static isCompanyValidUrl = Constants.baseUrl + 'company-service/getCompanyValidation';
    static addCompanyUrl = Constants.baseUrl + 'company-service/addNewCompany';
    static updateCompanyUrl = Constants.baseUrl + 'company-service/updateCompany';
    static getCompanyUrl = Constants.baseUrl + 'company-service/getCompanyDetailByCompanyCoKey';
    static addBrokerUrl = '';
    static addCompanyBankAccountUrl = Constants.baseUrl + 'company-service/addOrUpdateCompanyBankAccount';
    static getAllCityUrl = Constants.baseUrl + 'company-service/getAllCities';
    static getAllProvinceUrl = Constants.baseUrl + 'company-service/getAllProvince';
    static getBusinessTypeUrl = Constants.baseUrl + 'company-service/getBusinessType';
    static getTerminationCategoryUrl = Constants.baseUrl + 'company-service/getTerminationCategory';
    static getCompanyDetailByIdUrl = Constants.baseUrl + 'company-service/getCompanyDetailByCompanyCoKey';
    static getAllCompanyByPaginationUrl = Constants.baseUrl + 'company-service/getAllCompanyByPagination';
    static companySearchUrl = Constants.baseUrl + 'company-service/companySearch';
    static getCreditLimitUrl = Constants.baseUrl + 'company-service/creditLimitList';
    static getcompanyPapCommentUrl = Constants.baseUrl + 'company-service/getcompanyPapComment';
    static companyPapCommentUrl = Constants.baseUrl + 'company-service/companyPapComment';
    static saveCreditLimitUrl = Constants.baseUrl + 'company-service/creditLimit';
    static checkCreditLimitExpiredOnUrl = Constants.baseUrl + 'company-service/checkCreditLimitExpiredOn';


    static getTerminateListUrl = Constants.baseUrl + 'company-service/companyTerminateList';
    static saveTerminateUrl = Constants.baseUrl + 'company-service/terminateCompany';
    static saveCompanyBankAccountUrl = Constants.baseUrl + 'company-service/addOrUpdateCompanyBankAccount';
    static companyReactivateUrl = Constants.baseUrl + 'company-service/companyReactivate'

    static getCompanyBankAccountHistory = Constants.baseUrl + 'company-service/addOrUpdateCompanyBankAccount';
    static addCompanyBankAccountHistory = Constants.baseUrl + 'company-service/addOrUpdateCompanyBankAccount';
    static validateCompanyBankExpiredOnUrl = Constants.baseUrl + 'company-service/checkCompanyBankExpiredOn';

    static getCardBankAccountHistory = Constants.baseUrl + 'card-service/getCardBankAccountHistory';
    static saveCardBankAccountUrl = Constants.baseUrl + 'card-service/saveCardBankAccount';
    static getCompanyBankAccountHistoryUrl = Constants.baseUrl + 'company-service/getCompanyBankAccountHistory';

    static companySuspendDetail = Constants.baseUrl + 'company-service/companySuspendDetail';
    static resumeSuspend = Constants.baseUrl + 'company-service/resumeSuspend';

    //Company Contact Urls
    static addCompanyContact = Constants.baseUrl + 'company-service/addOrUpdateCompanyContact';
    static getCompanyContactByContactKey = Constants.baseUrl + 'company-service/getCompanyContactByCoContactKey';
    static deleteCompanyContact = Constants.baseUrl + 'company-service/deleteCompanyContact';
    static companyContactList = Constants.baseUrl + 'company-service/companyContactList';
    static namePrefixURL = Constants.baseUrl + 'company-service/getPersonNamePrefix';

    //Broker Link Urls
    static addCompanyLinkBroker = Constants.baseUrl + 'company-service/brokerCompanyAssociation';
    static CompanyLinkBrokerList = Constants.baseUrl + 'company-service/brokerCompanyAssociationlistByCoKey';
    static CompanyLinkBrokerEdit = Constants.baseUrl + 'company-service/getBrokerCoAssByKey';
    static BrokerNameList = Constants.baseUrl + 'company-service/brokerListingFilterWithCokey';
    static deleteLinkBroker = Constants.baseUrl + 'company-service/deleteBrokerCompanyAssociated';


    //Company Edit Adjusted Pap Amount Urls
    static getAdjustedPapAmtHistoryUrl = Constants.baseUrl + 'company-service/getAdjustedPapAmtHistory'
    static getStandardPapAmtHistoryUrl = Constants.baseUrl + 'company-service/getStandardPapAmtHistory'
    static getAdminRateHistoryUrl = Constants.baseUrl + 'company-service/getAdminRateAmtHistory'

    static getComopanyPlanListUrl = Constants.baseUrl + 'plan-service/getCompanyPlanList';

    //  Suspended company Urls
    static saveCompanySuspendUrl = Constants.baseUrl + 'company-service/companySuspend';
    static getSuspendCompanyList = Constants.baseUrl + 'company-service/companySuspendList';

    static deleteCompanyPlan = Constants.baseUrl + 'plan-service/deletePlan'

    /* Search card Api */
    static getCardHolderListByCompanyId = Constants.baseUrl + 'cardholder-service/getCardHolderListByCompanyId';
    static getCardSearchByTypeFilter = Constants.baseUrl + 'card-service/getCardSearchByTypeFilter';

    /* File Export URL */
    static exportFileUrl = Constants.baseUrl + "";

    /**Suspend Plan */
    static savePlanSuspendUrl = Constants.baseUrl + 'plan-service/planSuspend';
    static planSuspendList = Constants.baseUrl + 'plan-service/planSuspendList';
    static planSuspendDetail = Constants.baseUrl + 'plan-service/planSuspendDetail';
    static resumeSuspendPlan = Constants.baseUrl + 'plan-service/resumeSuspend';

    /**Terminate Plan */
    static saveTerminatePlanUrl = Constants.baseUrl + 'plan-service/terminatePlan';
    static getTerminatePlanListUrl = Constants.baseUrl + 'plan-service/getPlanTerminationHistory';
    static planReactivateUrl = Constants.baseUrl + 'plan-service/reactivatePlan'
    static getCompanyPlanUrl = Constants.baseUrl + 'plan-service/getCompanyPlan';
    static getPlanStatusUrl = Constants.baseUrl + 'plan-service/getPlanStatus';

    /**Terminate Plan Division*/
    static saveTerminateAndReactivatePlanDivisionUrl = Constants.baseUrl + 'plan-service/divisionTerminate';
    static getTerminatePlanDivisionListUrl = Constants.baseUrl + 'plan-service/getDivisionTerminationHistory';
    static getDivisionStatusUrl = Constants.baseUrl + 'plan-service/getDivisionStatus';


    static getImportantCompanyCommentListUrl = Constants.baseUrl + 'company-service/getCompanyCommentWithImportance'; //getCompanyCommentWithImportance
    static getCompanyCommentListUrl = Constants.baseUrl + 'company-service/companyCommentList';
    static addCompanyComment = Constants.baseUrl + 'company-service/companyComment';

    static getCities = Constants.baseUrl + 'company-service/getCities';
    static getProvince = Constants.baseUrl + 'company-service/getProvince';
    static getPredectiveCompany = Constants.baseUrl + 'company-service/getPredectiveCompany';
    static getAllPredectiveCompany = Constants.baseUrl + 'company-service/getAllPredectiveCompany';

    /**Sales Data */
    static getReferralTypeList = Constants.baseUrl + 'company-service/getReferralTypeList';
    static getBrokerListForReferralTypeList = Constants.baseUrl + 'company-service/getBrokerListForReferralType';
    static getUserStaffMemberList = Constants.baseUrl + 'userrole-setup-service/getUserStaffMemberList';
    static getCompanyListForReferralTypeList = Constants.baseUrl + 'company-service/getCompanyListForReferralType';

    static getBrokerByKeyUrl = Constants.baseUrl + "company-service/brokerByKey";

    /** Export File */
    static exportCompanyPlanList = Constants.baseUrl + 'plan-service/exportCompanyPlanList ';
    static exportCardSearchByTypeFilterUrl = Constants.baseUrl + 'card-service/exportCardSearchByTypeFilter'
    static exportCompanySearchUrl = Constants.baseUrl + 'company-service/exportCompanySearch';
    static exportBrokerCompanyAssociationlistByCoKeyUrl = Constants.baseUrl + 'company-service/exportBrokerCompanyAssociationlistByCoKey'
    static exportCompanyContactListUrl = Constants.baseUrl + 'company-service/exportCompanyContactList'
    static exportCompanyPlanListUrl = Constants.baseUrl + 'plan-service/exportCompanyPlanList'
    static getPlanUnitUrl = Constants.baseUrl + 'plan-service/getUnitByDivision'
    static addUpdatePlanUnitUrl = Constants.baseUrl + 'plan-service/addUpdateUnit'
    static deleteUnitPlanUnitUrl = Constants.baseUrl + 'plan-service/deleteUnit'

    /**Upload Company Document */
    static uploadDocuments = Constants.baseUrl + 'company-service/uploadCompanySpecificDoc';
    static getDocumentList = Constants.baseUrl + 'company-service/companyDocumentListing';
    static getCompanyDocument = Constants.baseUrl + 'company-service/viewCompanySpecificDocument';
    static deleteCompanyDocument = Constants.baseUrl + 'company-service/deleteCompanySpecificDocument';
    static changePasswordUrl = Constants.baseUrl + 'userrole-setup-service/changePassword';
    static getCompanyActivebankAccountUrl = Constants.baseUrl + 'company-service/getCompanyActivebankAccount';

    /* Log #1061: API's */
    static getCoAkiraEnrolmentListUrl = Constants.baseUrl + 'company-service/getCoAkiraEnrolmentList'
    static getCoEFAPBenefitListUrl = Constants.baseUrl + 'company-service/getCoEFAPBenefitList'
    static addCoAkiraEnrolmentUrl = Constants.baseUrl + 'company-service/addCoAkiraEnrolment'
    static addCoEFAPBenefitUrl = Constants.baseUrl + 'company-service/addCoEFAPBenefit'
    static deleteCoAkiraEnrolmentUrl = Constants.baseUrl + 'company-service/deleteCoAkiraEnrolment'
    static deleteCoEFAPBenefitUrl = Constants.baseUrl + 'company-service/deleteCoEFAPBenefit'

    /* Log #1162 API's */ 
    static addUpdateDivTravelEligibilityUrl = Constants.baseUrl + 'plan-service/addUpdateDivTravelEligibility'
    static getDivTravelEligibilityUrl = Constants.baseUrl + 'plan-service/getDivTravelEligibility'
    static deleteDivTravelEligibilityUrl = Constants.baseUrl + 'plan-service/deleteDivTravelEligibility'

    // Letter generation for company and broker(19-Jun-2024)
    static paCoTerminLetterUrl = Constants.baseUrl + 'company-service/paCoTerminLetter'
    static coBkTerminLetterUrl = Constants.baseUrl + 'company-service/coBkTerminLetter'

}