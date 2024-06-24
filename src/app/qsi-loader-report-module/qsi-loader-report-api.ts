import { Constants } from "../common-module/Constants";

export class QsiLoaderReportApi {

    static getQsiReportFiles = Constants.baseUrl + 'financial-payable-service/getQsiReportFiles';
    static getQsiUnprocessedData = Constants.baseUrl + 'financial-payable-service/getQsiUnprocessedData';
    static loadRevQSIDailyClaimToHLClaim = Constants.baseUrl + 'financial-payable-service/loadRevQSIDailyClaimToHLClaim';
    static updateQsiDrugDailyClaimUrl = Constants.baseUrl + 'financial-payable-service/updateQsiDrugDailyClaim'
    static loadQSIDailyClaimToHlClaimUrl = Constants.baseUrl + 'financial-payable-service/loadQSIDailyClaimToHlClaim'

}