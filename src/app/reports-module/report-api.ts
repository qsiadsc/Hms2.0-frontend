import { Constants } from '../common-module/Constants';
import { constants, stat } from 'fs';

export class ReportApi {   
    /**Report Section Api */
    static reportList = Constants.baseUrl + 'financial-payable-service/getHmsReportList';
    static divisionUtilizationReportUrl = Constants.baseUrl + 'financial-payable-service/divisionUtilizationReport';
    static divisionUtilizationReportExcelUrl = Constants.baseUrl + 'financial-payable-service/divisionUtilizationReportExcel';
    static getAdscCobSavingReportUrl = Constants.baseUrl + 'financial-payable-service/getAdscCobSavingReport';
    static getAdscCobSavingReportExcelUrl = Constants.baseUrl + 'financial-payable-service/getAdscCobSavingReportExcel';
    static getAdscClaimsAndCountReportUrl = Constants.baseUrl + 'financial-payable-service/getAdscClaimsAndCountReport';
    static getAdscClaimsAndCountReporExcelUrl = Constants.baseUrl + 'financial-payable-service/getAdscClaimsAndCountReportExcel';
    static getClaimByMonthAndCategoryReportUrl = Constants.baseUrl + 'financial-payable-service/getClaimByMonthAndCategoryReport';
    static getClaimByMonthAndCategoryReportExcelUrl = Constants.baseUrl + 'financial-payable-service/getClaimByMonthAndCategoryReportExcel';
    static preauthByReviewReportUrl = Constants.baseUrl + 'financial-payable-service/preauthByReviewReport';
    static preauthByReviewReportExcelUrl = Constants.baseUrl + 'financial-payable-service/preauthByReviewReport';
    static preauthByReviewAndDaspExceptionReportUrl = Constants.baseUrl + 'financial-payable-service/preauthByReviewAndDaspExceptionReport';
    static preauthByReviewAndDaspExceptionReportExcelUrl = Constants.baseUrl + 'financial-payable-service/preauthByReviewAndDaspExceptionReport';
    static getDemographicStatisticsReportUrl = Constants.baseUrl + 'financial-payable-service/getDemographicStatisticsReport';
    static getDemographicStatisticsReportExcelUrl = Constants.baseUrl + 'financial-payable-service/getDemographicStatisticsReportExcel';
    static getProcedureRankReportUrl = Constants.baseUrl + 'financial-payable-service/getProcedureRankReport';
    static getProcedureRankReportExcelUrl = Constants.baseUrl + 'financial-payable-service/getProcedureRankReportExcel';
    static getClientAgeGroupByProviderPostCodeReportUrl = Constants.baseUrl + 'financial-payable-service/getClientAgeGroupByProviderPostCodeReport'; 
    static getClientAgeGroupByProviderPostCodeReportExcelUrl = Constants.baseUrl + 'financial-payable-service/getClientAgeGroupByProviderPostCodeReportExcel'; 
    static daspDentureReplacementReportUrl = Constants.baseUrl + 'financial-payable-service/daspDentureReplacement';
    static daspDentureReplacementExcelUrl = Constants.baseUrl + 'financial-payable-service/daspDentureReplacement';
    static daspExceptionReportUrl = Constants.baseUrl + 'financial-payable-service/daspException';
    static daspExceptionExcelUrl = Constants.baseUrl + 'financial-payable-service/daspException';
}

// hms-financial-report-service
//  is chnaged to 
// financial-payable-service
//  as we are getting 403 error