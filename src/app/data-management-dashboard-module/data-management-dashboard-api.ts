import { Constants } from '../common-module/Constants';

export class DataManagementDashboardApi {
    static exportQSIEligFileInsLogfile = Constants.baseUrl + 'financial-payable-service/exportQSIEligFileInsLogfile';
    static getCsQsiLoadPaymentFile = Constants.baseUrl + 'financial-payable-service/getCsQsiLoadPaymentFile';
    static getCsQsiLoadDrugReport  = Constants.baseUrl + 'financial-payable-service/getCsQsiLoadDrugReportFile';
    static getQsiLoadPaymentData  = Constants.baseUrl + 'financial-payable-service/getQsiLoadPaymentData';
    static exportQSIExpense = Constants.baseUrl + 'financial-payable-service/exportQSIExpense';
    static getQsiLoadDailyFile = Constants.baseUrl + 'financial-payable-service/getQsiLoadDailyFile';
    static getServiceProviderWithoutBanUrl = Constants.baseUrl + 'financial-payable-service/getServiceProviderWithoutBan'
    static getCardNotPrintedListUrl = Constants.baseUrl + 'financial-payable-service/getCardNotPrintedList';
    static phyGetCardNotPrintedListUrl = Constants.baseUrl + 'financial-payable-service/getPhysicalCardRequest';

    static getServiceProviderWithoutBanTotalCountUrl = Constants.baseUrl + 'financial-payable-service/getServiceProviderWithoutBanTotalCount';
    static getCardNotPrintedListTotalCountUrl = Constants.baseUrl + 'financial-payable-service/getCardNotPrintedListTotalCount';
    static saveCardDetailForPrintChequeUrl = Constants.baseUrl + 'financial-payable-service/saveCardDetailForPrintCheque';
    //Eligibility Files Tab
    static getFileTypeListUrl = Constants.baseUrl + 'ahc-service/getFileTypeList';
    static getClaimSecureFileTypeListUrl = Constants.baseUrl + 'financial-payable-service/getClaimSecureFileListing';
    static getFileCatListByFileTypeKeyUrl = Constants.baseUrl + 'ahc-service/getFileCatListByFileTypeKey';
    static searchGovEligFilesUrl = Constants.baseUrl + 'ahc-service/searchGovEligFiles';
    static getClaimSecureMasterDataUrl = Constants.baseUrl + 'financial-payable-service/getClaimSecureMasterData';
    static uploadGovEligFilesUrl = Constants.baseUrl + 'ahc-service/uploadGovEligFiles';
    static getGovEligFilesUrl = Constants.baseUrl + 'ahc-service/getGovEligFiles';
    //CDA Net Tab
    static uploadFileUrl = Constants.baseUrl + 'claim-service/uploadCdaFile';
    static getCdaDataListUrl = Constants.baseUrl + 'claim-service/getCdaFileList ';
    static getCdaDataCountUrl = Constants.baseUrl + 'claim-service/getCdaCounts ';
    static getQsiDataCountUrl = Constants.baseUrl + 'financial-payable-service/getClaimSecureFileCount ';
    static getHmsCdaDataListUrl = Constants.baseUrl + 'claim-service/getHmsCdaDataList ';
    static reportList = Constants.baseUrl + 'financial-payable-service/getHmsReportList';
    static getEligFileCountUrl = Constants.baseUrl + 'ahc-service/getEligFileCount';
    static generateDailyTransaction =Constants.baseUrl + 'financial-payable-service/generateDailyTransaction';
    static getCsQsiDailyPaymentFileUrl = Constants.baseUrl + 'financial-payable-service/getCsQsiDailyPaymentFile'
}