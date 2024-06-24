import { Constants } from '../common-module/Constants';

export class FilesApi {    
    static getExportViewList = Constants.baseUrl + 'company-service/getExportViewList';    
    static getExcelReportsList = Constants.baseUrl + 'financial-payable-service/getExcelReportsList';    
    static deleteExcelBasedOnKey = Constants.baseUrl + 'financial-payable-service/deleteExcelBasedOnKey'
    static getExcelReportsHistoryList = Constants.baseUrl + 'financial-payable-service/getExcelReportsHistoryList';
    static deleteExcelHistoryBasedOnKey = Constants.baseUrl + 'financial-payable-service/deleteExcelHistoryBasedOnKey';
}