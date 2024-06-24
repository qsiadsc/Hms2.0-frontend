import { Constants } from '../common-module/Constants'
export class ClaimApi {
    /** Claim API */
    static getDisciplineList = Constants.baseUrl + 'claim-service/getDisciplineList';
    static getClaimCategoryList = Constants.baseUrl + 'claim-service/getClaimCategoryList';
    static getClaimTypeList = Constants.baseUrl + 'claim-service/getClaimTypeList';
    static getGenralInformationForClaim = Constants.baseUrl + 'claim-service/getGenralInformationForClaim';
    static getServiceProviderDetailUrl = Constants.baseUrl + 'claim-service/getAIServiceProviderDetail';
    static findCardHolderUrl = Constants.baseUrl + 'cardholder-service/findCardHolder';
    static getCardHolderListByCardIdForClaimUrl = Constants.baseUrl + 'cardholder-service/getCardHolderListByCardIdForClaim';
    static saveCustomComment = Constants.baseUrl + 'claim-service/addUpdateClaimItemMessage'
    static saveClaimComment = Constants.baseUrl + 'claim-service/addClaimComment'
    static saveClaimUrl = Constants.baseUrl + 'claim-service/saveClaimAllDetails';
    static getClaimDetailsUrl = Constants.baseUrl + 'claim-service/getClaim';
    static updateClaimUrl = Constants.baseUrl + 'claim-service/updateClaim';
    static getPayeeTypesUrl = Constants.baseUrl + 'claim-service/getPayeeTypes';
    static getServiceProviderDetailByIdUrl = Constants.baseUrl + 'claim-service/getServiceProviderDetailById';
    static getBusinessTypeUrl = Constants.baseUrl + 'company-service/getBusinessType';
    static getClaimStatusList = Constants.baseUrl + 'claim-service/getClaimStatusList';
    static getClaimSearchByFilter = Constants.baseUrl + 'claim-service/getClaimSearchByFilter';
    static getClaimSearchByGridFilter = Constants.baseUrl + 'claim-service/getClaimSearchByGridFilter';
    static getOverrideTypeListUrl = Constants.baseUrl + 'claim-service/getOverrideTypeList';
    static saveClaimItemsUrl = Constants.baseUrl + 'claim-service/saveClaimitems';
    static updateClaimItemsUrl = Constants.baseUrl + 'claim-service/updateClaimitems';
    static getClaimItemUrl = Constants.baseUrl + 'claim-service/getClaimitem';
    static getClaimItemByClaimKeyUrl = Constants.baseUrl + 'claim-service/getClaimitemByClaimKey';
    static DetailsForPrintUrl = Constants.baseUrl + 'claim-service/getClaimDetailForPrint';
    static DetailsForPrintalberta = Constants.baseUrl + 'claim-service/printClaim';
    static getClaimListByClaimKeyAndServiceDateUrl = Constants.baseUrl + 'claim-service/getClaimListByClaimKeyAndServiceDate';
    static getClaimItemMessageUrl = Constants.baseUrl + 'claim-service/getClaimItemMessage';
    static getClaimCommentsByClaimId = Constants.baseUrl + 'claim-service/getClaimCommentsByClaimId';
    static getClaimItemMessage = Constants.baseUrl + 'claim-service/getClaimItemMessage';
    static deleteClaimUrl = Constants.baseUrl + 'claim-service/deleteClaim';
    static checkProcIdAndCountUrl = Constants.baseUrl + 'claim-service/checkProcIdAndCount';
    static deleteClaimItemUrl = Constants.baseUrl + 'claim-service/deleteClaimItem';
    static validateSurfaceTextUrl = Constants.baseUrl + 'claim-service/checkToothSurfaceCombo';
    static getTotalForClaim = Constants.baseUrl + 'claim-service/getTotalForClaim';
    static adjudicateClaim = Constants.baseUrl + 'claim-service/adjudicateClaim';
    static getSystemMessages = Constants.baseUrl + 'claim-service/getSystemMessages';
    static releaseClaim = Constants.baseUrl + 'claim-service/releaseClaim';
    static getServiceProviderDetails = Constants.baseUrl + 'claim-service/getAIServiceProviderDetail';
    static claimImportantComments = Constants.baseUrl + 'claim-service/getClaimImportantCommentsByClaimId';
    static setCustomCommet = Constants.baseUrl + 'claim-service/saveClaimItemMessageMarkAsRead';
    static getCustomClaimComment = Constants.baseUrl + 'claim-service/getClaimRejectionReasonList';
    static getClaimListByBsnsType = Constants.baseUrl + 'claim-service/getClaimTypeListByBusinessType';
    static getFileRefUrl = Constants.baseUrl + 'claim-service/getFile'
    static getQCWebClaimUrl = Constants.baseUrl + 'claim-service/getQCWebClaim'
    static getReverseClaim = Constants.baseUrl + 'claim-service/getReverseClaim'
    static getClaimKeyByClaimReferenceNumber = Constants.baseUrl + 'claim-service/getClaimKeyByClaimReferenceNumber'
    static getClaimAdjStatus = Constants.baseUrl + 'claim-service/getClaimAdjStatus'
    static getPreAuthClaimItem = Constants.baseUrl + 'claim-service/getPreAuthClaimItem'
    static getReversalClaimItem = Constants.baseUrl + 'claim-service/getReversalClaimItem'
    static validateClaimItem = Constants.baseUrl + 'claim-service/validateClaimItem'
    static saveReversalClaimItemByDiscipline = Constants.baseUrl + 'claim-service/saveReversalClaimItemByDiscipline'
    static getCardHolderLatestEligibility = Constants.baseUrl + 'cardholder-service/getCardHolderLatestEligibility'
    static getCardLatestEligibilty = Constants.baseUrl + 'card-service/getCardLatestEligibilty'
    static linkReverseItem = Constants.baseUrl + 'claim-service/linkReverseItem'
    static getDesignType = Constants.baseUrl + 'claim-service/getDesignType'
    static getUnitDescForDasp = Constants.baseUrl + 'claim-service/getUnitDescForDasp'
    static showClaimModalDetailsUrl = Constants.baseUrl + 'claim-service/showPreAuthClaim'
    static showPreAuthPaperClaimUrl = Constants.baseUrl + 'claim-service/showPreAuthPaperClaim'
    static checkADSCSchBDialyCard = Constants.baseUrl + 'claim-service/checkADSCSchBDialyCard'
    /** Refer Claim Api */
    static getUserList = Constants.baseUrl + 'claim-service/referClaimUsersList'
    static referClaim = Constants.baseUrl + 'claim-service/referClaim'
    static getReferClaimList = Constants.baseUrl + 'claim-service/getReferClaimListBasedOnUserKey'
    static getCountUnreadReferClaim = Constants.baseUrl + 'claim-service/getCountUnreadReferClaim'
    static markReferClaimAsRead = Constants.baseUrl + 'claim-service/markReferClaimAsRead'
    static searchReferClaim = Constants.baseUrl + 'claim-service/searchReferClaim'
    static exportReferClaimExcelForUser = Constants.baseUrl + 'claim-service/exportReferClaimExcelForUser'
    static getReferClaimComment = Constants.baseUrl + 'claim-service/getReferClaimCommentTxt'
    /** Review App Api */
    static uploadDocuments = Constants.baseUrl + 'reviewapp-service/uploadDoc';
    static getDocumentList = Constants.baseUrl + 'reviewapp-service/getClaimReviewDocumentListByClaimKey';
    static sendPreAuth = Constants.baseUrl + 'reviewapp-service/sendPreAuthReview';
    static deleteClaimReviewDocument = Constants.baseUrl + 'reviewapp-service/deleteClaimReviewDocumentByScanDocKey';
    static getClaimReviewDocument = Constants.baseUrl + 'reviewapp-service/getClaimReviewDocumentByScanDocKey';
    static getReviewClaimList = Constants.baseUrl + 'reviewapp-service/getSenderReviewList';
    static deleteClaimReview = Constants.baseUrl + 'reviewapp-service/deleteReview';
    static viewClaimReview = Constants.baseUrl + 'reviewapp-service/getReviewDetail';
    static getDoctorStatus = Constants.baseUrl + 'reviewapp-service/getReviewStatusList';
    static getPartialApprovedType = Constants.baseUrl + 'reviewapp-service/getPartialApprovedType';
    static getDeniedType = Constants.baseUrl + 'reviewapp-service/getDeniedType';
    static getAdditionalInfoAndSubType = Constants.baseUrl + 'reviewapp-service/getAdditionalInfoAndSubType';
    static saveReview = Constants.baseUrl + 'reviewapp-service/saveReview';
    static updateReferToReviewStatus = Constants.baseUrl + 'reviewapp-service/updateReferToReviewStatus';

    static getConsltantComment = Constants.baseUrl + 'reviewapp-service/getReviewInfo';
    static updateConsltantComment = Constants.baseUrl + 'reviewapp-service/editExternalComments';
    static ReferToReview = Constants.baseUrl + 'reviewapp-service/sendReferToReview';

    /** Get All PDF Files of Claim Dashboard: */
    static getClaimPdfFiles = Constants.baseUrl + 'claim-service/getAllFiles';
    static getFileStatus = Constants.baseUrl + 'claim-service/getFileStatus';
    static unlockFile = Constants.baseUrl + 'claim-service/unlockFile';
    static getDashboardCount = Constants.baseUrl + 'claim-service/getDashboardCount';
    static saveBulletinUrl = Constants.baseUrl + 'claim-service/addBulletin';
    static getBulletinUrl = Constants.baseUrl + 'claim-service/getBulletin';
    static deleteBulletinUrl = Constants.baseUrl + 'claim-service/deleteBulletin';
    static geAhcDashboardCount = Constants.baseUrl + 'ahc-service/geAhcCount';
    static getAllComments = Constants.baseUrl + 'claim-service/getClaimComment';
    static getPredectiveCompany = Constants.baseUrl + 'company-service/getAllPredectiveCompany';
    static deleteClaimCommentByClaimCommentIdUrl = Constants.baseUrl + 'claim-service/deleteClaimCommentByClaimCommentId';

    /** Claim Dashboard Reports APIs */
    static dailyClaimProcessingReport = Constants.baseUrl + 'financial-payable-service/dailyClaimProcessingReport';
    static allGovernmentClaims = Constants.baseUrl + 'hms-financial-report-service/allGovernmentClaims';
    static allGovernmentClaimsExcel = Constants.baseUrl + 'financial-payable-service/allGovernmentClaimsExcel';
    static allQuikardClaims = Constants.baseUrl + 'financial-payable-service/allQuikardClaims';
    static allQuikardClaimsExcel = Constants.baseUrl + 'financial-payable-service/allQuikardClaimsExcel';
    static getDOBMismatchReport = Constants.baseUrl + 'financial-payable-service/getDOBMismatchReport';
    static getDOBMismatchReportExcel = Constants.baseUrl + 'financial-payable-service/getDOBMismatchReportExcel';
    static predictiveSearchForReferenceIdUrl = Constants.baseUrl + 'claim-service/predictiveSearchForReferenceId';
    static predictiveSearchForOperatorIdUrl = Constants.baseUrl + 'claim-service/predictiveSearchForOperatorId';
    static getReferenceNumberUrl = Constants.baseUrl + 'claim-service/getReferenceNumber';
    static getPreAuthReverseClaimUrl = Constants.baseUrl + 'claim-service/getPreAuthReverseClaim';
    static checkReverseAndPreAuthClaimStatusUrl = Constants.baseUrl + 'claim-service/checkReverseAndPreAuthClaimStatus'; 
    static duplicateClaimItemList = Constants.baseUrl + 'claim-service/duplicateClaimItemList';
    static trackStatus = Constants.baseUrl + 'reviewapp-service/trackClaim';
    static deleteReferedClaim = Constants.baseUrl + "claim-service/deleteReferedClaim"

    
    static updateScannedClaimFile = Constants.baseUrl + "claim-service/updateScannedClaimFile"
    static copyClaim = Constants.baseUrl + "claim-service/copyClaim"
    static deleteClaim = Constants.baseUrl + "claim-service/deleteDashboardFiles";
    static deleteClaimItemMessageUrl = Constants.baseUrl + 'claim-service/deleteClaimItemMessage'
    
    static lockProcessorUrl = Constants.baseUrl + 'claim-service/lockProcessor'
    static getBanUrl = Constants.baseUrl + 'claim-service/getBan'

    // API for Reissue Claim(28-Jun-2022)
    static getReissueClaimUrl = Constants.baseUrl + 'claim-service/getReissueClaim'
    static getReissueReverseClaimUrl = Constants.baseUrl + 'claim-service/getReissueReverseClaim'
    
    // API after Reissue and Reverse Claim Flow(27-Sep-2022)
    static saveAndUpdateAdjClaimRequestUrl = Constants.baseUrl + 'financial-payable-service/saveAndUpdateAdjClaimRequest'

    static getEnteredClaimFileUrl = Constants.baseUrl + 'claim-service/getEnteredClaimFile'
    static ebApprovedClaimsUrl = Constants.baseUrl + 'claim-service/ebApprovedClaims'
    static getDASPWebClaimUrl = Constants.baseUrl + 'claim-service/getDASPWebClaim'
    static addDbCommentUrl = Constants.baseUrl + 'claim-service/addDbComment';
    static getDbFileCommentUrl = Constants.baseUrl + 'claim-service/getDbFileComment';

    static attachClaimDataLoadUrl = Constants.baseUrl + 'claim-service/attachClaimDataLoad';

    static getAttachClaimFileForViewUrl = Constants.baseUrl +'claim-service/getAttachClaim'
}