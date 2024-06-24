import {Constants } from '../common-module/Constants';

export class BrokerApi {  
    static getCompanyUrl = Constants.baseUrl + 'company-service/getCompanyDetailByCompanyCoKey';
    
    /** -----Broker Add,Edit and List Url---- */
    static brokerListUrl = Constants.baseUrl + 'company-service/brokerList';
    static addBrokerUrl = Constants.baseUrl + 'company-service/broker'; //addBrokerUrl is used for add and update broker
    static getBrokerByKeyUrl = Constants.baseUrl + "company-service/brokerByKey";
    static brokerIdValidationUrl = Constants.baseUrl + "company-service/getBrokerIdValidation";
    static brokerAutoGenerateNumberUrl = Constants.baseUrl + "company-service/autoGenerateBrokerNumber";
    
    /** -------------------- */

    static brokerContactCompanyUrl = Constants.baseUrl + 'company-service/brokerContact';
    static brokerContactListUrl = Constants.baseUrl + 'company-service/brokerContactListing';
    static brokerContactFilter = Constants.baseUrl + "company-service/brokerContactFilter";
    static editbrokerContactListUrl = Constants.baseUrl + 'company-service/getBrokerContact';
    static deletebrokerContactListUrl = Constants.baseUrl + 'company-service/deleteBrokerContact';
    
    // Broker Company Associated URLs
    static brokerCompanyAssociationUrl = Constants.baseUrl + 'company-service/companyBrokerAssociation';
    static brokerCompanyAssociationListUrl = Constants.baseUrl + 'company-service/brokerCompanyAssociationlist';
    static brokerCompanyAssociationFilter = Constants.baseUrl + "company-service/brokerCompanyAssociationFilter";
    static brokerCompanyListUrl = Constants.baseUrl + 'company-service/getCompanyList';
    static brokerCompanyDeleteUrl = Constants.baseUrl + 'company-service/deleteBrokerCompanyAssociated';
    static brokerCompanyEditUrl = Constants.baseUrl + 'company-service/getBrokerCoAssByKey';
    static getPersonNamePrefixUrl =  Constants.baseUrl + "company-service/getPersonNamePrefix";

    /** -----Update Company Broker Url---- */
    static getAllBrokerUrl = Constants.baseUrl + 'company-service/getAllBroker';
    static updateCompanyBrokerUrl = Constants.baseUrl + 'company-service/updateBroker';

    /** -----Broker Bank Account Url---- */
    static getBrokerBankAccountUrl = Constants.baseUrl + 'company-service/getBrokerBankAccount'; 
    static addbrokerBankAccountUrl = Constants.baseUrl + 'company-service/brokerBankAccount';
    static deleteBrokerBankAccountUrl = Constants.baseUrl + 'company-service/deleteBrokerBankAccount'; 
    static getBrokerBankAccValidationUrl = Constants.baseUrl + 'company-service/getBrokerBankAccValidation';
    static validateBrokerBankExpiredOnUrl = Constants.baseUrl + 'company-service/checkBrokerBankExpiredOn';
    
    /** -----Broker Add,Edit,Terminate/Reactivate and List Url---- */
    static brokerTerminateUrl = Constants.baseUrl + "company-service/saveBrokerTermination";
    static brokerTerminateHistory = Constants.baseUrl + 'company-service/brokerTerminateList';
    static reactivateBrokerUrl = Constants.baseUrl + 'company-service/brokerReactivate';

    // Postal Code, Province and City
    static exportBrokerCompanyAssociationlistUrl=Constants.baseUrl + 'company-service/exportBrokerCompanyAssociationlist'
    static exportBrokerListUrl =Constants.baseUrl + 'company-service/exportBrokerList';
    static exportBrokerContactListingUrl =Constants.baseUrl + 'company-service/exportBrokerContactListing';

    static isCompanyPostalcodeValidUrl = Constants.baseUrl + 'company-service/getPostalDetail';
    static isCompanyCityProvinceCountryValidUrl = Constants.baseUrl + 'company-service/verifyPostalDetail';

}