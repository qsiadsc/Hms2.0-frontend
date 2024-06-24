import { Constants } from '../common-module/Constants'
export class ReviewAppApi {
    static getDashboardReviewList = Constants.baseUrl + 'reviewapp-service/getDoctorDashboardReviewList';
    static getGovDashboardReviewList = Constants.baseUrl + 'reviewapp-service/getGovDashboardReviewList';
    static getClaimList = Constants.baseUrl + 'reviewapp-service/reviewSearch';
    static getClaimListByGridFilter = Constants.baseUrl + 'reviewapp-service/reviewSearch';
    static getClaimCount = Constants.baseUrl + 'reviewapp-service/getClaimReviewCount';
    static getDoctorStatus = Constants.baseUrl + 'reviewapp-service/getReviewStatusList';
    static generateLetterUrl = Constants.baseUrl + 'reviewapp-service/generateLetter';
    static printReviewUrl = Constants.baseUrl + 'reviewapp-service/printReview';
}