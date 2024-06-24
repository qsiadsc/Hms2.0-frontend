import { Constants } from '../common-module/Constants'
export class ItransViewerApi {
    static searchItransFilterUrl = Constants.baseUrl + 'itrans-service/searchItransFilter';
    static printItransSearchDataUrl = Constants.baseUrl + 'itrans-service/printItransSearchData';
    static getClaimKeyByClaimReferenceNumber = Constants.baseUrl + 'claim-service/getClaimKeyByClaimReferenceNumber'
}