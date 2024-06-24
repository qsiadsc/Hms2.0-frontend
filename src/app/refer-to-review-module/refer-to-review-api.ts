import { Constants } from '../common-module/Constants';

export class ReferToReviewApi {    
    static getCount = Constants.baseUrl + 'reviewapp-service/getReviewerDashboardCounts';    
    static reviewList = Constants.baseUrl + 'reviewapp-service/getDashboardReviewList';
    static catList = Constants.baseUrl + 'reviewapp-service/getDentalCategories';
    static getBulletinUrl = Constants.baseUrl +'claim-service/getBulletin';
    static saveBulletinUrl = Constants.baseUrl +'claim-service/addBulletin';
    static deleteBulletinUrl = Constants.baseUrl +'claim-service/deleteBulletin';
    static getRelatedCoverages = Constants.baseUrl + 'reviewapp-service/getRelatedCoverages/'
    static getTreatmentCategoryUrl = Constants.baseUrl + 'reviewapp-service/getTreatmentCategory';
}
