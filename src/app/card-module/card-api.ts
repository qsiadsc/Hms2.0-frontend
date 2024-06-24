import { Constants } from '../common-module/Constants'
import { NgControlStatus } from '@angular/forms';
import { stat } from 'fs';

export class CardApi {
  static getAllGenderDetailsUrl = Constants.baseUrl + 'card-service/getAllGenderDetails';

  static getCardHolderRoleListUrl = Constants.baseUrl + 'cardholder-service/getCardHolderRoleList';
  static getCarrierListUrl = Constants.baseUrl + 'cardholder-service/getCarrierList';

  static getCompanyDetailByCompanyCoKey = Constants.baseUrl + 'company-service/getCompanyDetailByCompanyCoKey';
  static saveCardUrl = Constants.baseUrl + 'card-service/saveCardDetails';
  static getCompanyPlanUrl = Constants.baseUrl + 'company-service/getCompanyPlansByCombineId';
  static getAutogeneratedCardNumbersUrl = Constants.baseUrl + 'card-service/getAutoCardNumbers';
  static checkCardDetailExistByCardIdUrl = Constants.baseUrl + 'card-service/checkCardDetailByCardId';
  static updateCardDetailsUrl = Constants.baseUrl + 'card-service/updateCardDetails';
  static addUpdateStudentHistoryUrl = Constants.baseUrl + 'card-service/addUpdateCardHolderPersonStudentHistory';
  static isCompanyPostalcodeValidUrl = Constants.baseUrl + 'company-service/getPostalDetail';
  static isCompanyCityProvinceCountryValidUrl = Constants.baseUrl + 'company-service/verifyPostalDetail';
  static terminateCardUrl = Constants.baseUrl + 'card-service/terminateCard';
  static activateCardUrl = Constants.baseUrl + 'card-service/activateCard';
  static getCardDisciplineListByCardId = Constants.baseUrl + 'card-service/getCardDisciplineListByCardId';
  static checkEffectiveDateForPlan = Constants.baseUrl + 'card-service/checkEffectiveDateForPlan';
  static terminateCard = Constants.baseUrl + 'card-service/cardTerminate';
  static getCardStatus = Constants.baseUrl + 'card-service/getCardStatus';
  static reActivateCardUrl = Constants.baseUrl + 'card-service/reActivateCard';
  static undoCardholdersUrl = Constants.baseUrl + 'cardholder-service/undoCardholders';

  /*card comment API*/
  static getCardCommentsByCardIdUrl = Constants.baseUrl + 'card-service/getCardCommentsByCardId';
  static updateCardCommentsUrl = Constants.baseUrl + 'card-service/updateCardComments';
  static saveCardCommentsUrl = Constants.baseUrl + 'card-service/saveCardComments';
  static checkBankAccountNumber = Constants.baseUrl + 'card-service/checkBankAccountNumber';
  static getAllCardCommentsUrl = Constants.baseUrl + 'card-service/getCardComment'
  static deleteCardUrl = Constants.baseUrl + 'card-service/deleteCard';
  static deleteCardCommentsUrl = Constants.baseUrl + 'card-service/deleteCardComments';
  
  //Card Holder Api Start
  static saveCardholderUrl = Constants.baseUrl + 'cardholder-service/addCardholder';
  static updateCardholderUrl = Constants.baseUrl + 'cardholder-service/updateCardholder';
  static getCardHolderdetailById = Constants.baseUrl + 'cardholder-service/findCardHolder';
  static deleteCardHolderById = Constants.baseUrl + 'cardholder-service/deleteCardHolder';
  static getClaimsByCardholderKey = Constants.baseUrl + 'claim-service/getClaimsByCardholderKey';
  static getCardHolderList = Constants.baseUrl + 'cardholder-service/getCardHolderList';
  static getCardHolderListByCardId = Constants.baseUrl + 'cardholder-service/getCardHolderListByCardId';
  static terminateCardHolder = Constants.baseUrl + 'cardholder-service/terminateCardHolder';
  static getCardHolderComments = Constants.baseUrl + 'cardholder-service/getCardHolderComments';
  static addUpdateCardHolderSingleComments = Constants.baseUrl + 'cardholder-service/addUpdateCardHolderSingleComments';
  static deleteCardHolderComment = Constants.baseUrl + 'cardholder-service/deleteCardHolderComment';
  static addOrUpdateTrusteeUrl = Constants.baseUrl + 'card-service/addOrUpdateTrustee';
  static addUpdateCardHolderPersonStudentHistoryUrl = Constants.baseUrl + 'cardholder-service/addUpdateCardHolderPersonStudentHistory';
  static activateCardHolderUrl = Constants.baseUrl + 'cardholder-service/activateCardHolder';
  static getOverrideDataUrl = Constants.baseUrl + 'claim-service/getOverrideDataUrl';
  static getClaimItemsByCardHolderKey = Constants.baseUrl + 'claim-service/getClaimItemsByCardHolderKey';
  static getAllTrusteesByCardKeyUrl = Constants.baseUrl + '/getAllTrusteesByCardKey';
  //Card Holder Api End

  static getCardDetails = Constants.baseUrl + 'card-service/getCardDetails'

  /**
   * Card Holder History Datatable
   */
  static getCardHolderRoleAssignHisorytUrl = Constants.baseUrl + 'cardholder-service/getCardHolderRoleAssignHistList';
  static getCardHolderCobHistoryUrl = Constants.baseUrl + 'cardholder-service/getCardHolderCobHistList';
  static getCardHolderEligibilityListUrl = Constants.baseUrl + 'cardholder-service/getCardHolderEligibilityList';
  static getVoucherByIdUrl = Constants.baseUrl + 'cardholder-service/getVoucher';
  static getVoucherListUrl = Constants.baseUrl + 'cardholder-service/getAllVouchers';
  static getExpenseAdjustmentsByCardHolderKeyUrl = Constants.baseUrl + 'cardholder-service/getExpenseAdjustmentsByCardHolderKey';
  static saveUpdateCardHolderRoleAssignmentUrl = Constants.baseUrl + 'cardholder-service/addUpdateCardHolderRoleAssignment';
  static saveUpdateCardHolderCobHistoryUrl = Constants.baseUrl + 'cardholder-service/addUpdateCardHolderCobHistory';
  static addCardHolderVoucherUrl = Constants.baseUrl + 'cardholder-service/addVoucher';
  static updateCardHolderVoucherUrl = Constants.baseUrl + 'cardholder-service/updateVoucher';
  static addOrUpdateVoucherUrl = Constants.baseUrl + 'cardholder-service/addOrUpdateVoucher';
  static addUpdateHolderEligibilityHistoryUrl = Constants.baseUrl + 'cardholder-service/addUpdateHolderEligibilityHistory';
  static deleteCardHolderVoucherUrl = Constants.baseUrl + 'cardholder-service/deleteVoucher';
  static addExpenseAdjustmentUrl = Constants.baseUrl + 'cardholder-service/addExpenseAdjustment';
  static updateExpenseAdjustmentUrl = Constants.baseUrl + 'cardholder-service/updateExpenseAdjustment';
  static deleteStudentHistoryUrl = Constants.baseUrl + 'cardholder-service/deleteCardHolderPersonStudentHistory';
  static getTrusteeUrl = Constants.baseUrl + 'card-service/getTrustee';
  static getAllTrusteesUrl = Constants.baseUrl + 'card-service/getAllTrustees';

  static deleteCardHolderPersonStudentHistoryUrl = Constants.baseUrl + 'cardholder-service/deleteCardHolderPersonStudentHistory';
  static checkCardHolderRoleUrl = Constants.baseUrl + 'cardholder-service/checkCardHolderRole';

  //Card Popups Api
  static getCardEligibiltyHistory = Constants.baseUrl + 'card-service/getCardEligibiltyHistory';
  static getCardContactHistory = Constants.baseUrl + 'card-service/getCardContactHistory';
  static getCardBankAccountHistory = Constants.baseUrl + 'card-service/getCardBankAccountHistory';
  static getCardTypeHistory = Constants.baseUrl + 'card-service/getCardTypeHistory';
  static getExtraBenefitListByCard = Constants.baseUrl + 'card-service/getExtraBenefitListByCard';
  static saveAndUpdatecardBenefitHistUrl = Constants.baseUrl + 'card-service/saveAndUpdatecardBenefitHist';
  static saveCardEligibilityUrl = Constants.baseUrl + 'card-service/saveCardEligibility';
  static saveCardContactUrl = Constants.baseUrl + 'card-service/saveCardContact';
  static saveCardBankAccountUrl = Constants.baseUrl + 'card-service/saveCardBankAccount';

  /* Search card Api */
  static getCardSearchByFilter = Constants.baseUrl + 'card-service/getCardSearchByFilter';
  static getCardSearchByGridFilter = Constants.baseUrl + 'card-service/getCardSearchByGridFilter';
  static getTotalForCardHolderUrl = Constants.baseUrl + 'claim-service/getTotalForCardHolder';

  /* Overrides Popup API */
  static getMaxPeriodTypeUrl = Constants.baseUrl + 'plan-service/getMaxPeriodType';
  static getDentalCoverageAndServicesUrl = Constants.baseUrl + 'plan-service/getDentalCoverageAndServices';
  static getHealthCoverageAndServicesUrl = Constants.baseUrl + 'plan-service/getHealthCoverageAndServices';
  static addOrUpdateCardCovMaxUrl = Constants.baseUrl + 'card-service/addOrUpdateCardCovMax';
  static getAllCardCovMaxUrl = Constants.baseUrl + 'card-service/getAllCardCovMax';
  static deleteCardCovMaxUrl = Constants.baseUrl + 'card-service/deleteCardCovMax';
  static addOrUpdateCardMaxUrl = Constants.baseUrl + 'card-service/addOrUpdateCardMax';
  static getMaximumTypeUrl = Constants.baseUrl + 'card-service/getAllCardMax';
  static deleteCardMaxUrl = Constants.baseUrl + 'card-service/deleteCardMax';//128
  static addOrUpdateCardHsaMaxUrl = Constants.baseUrl + 'card-service/addOrUpdateCardHsaMax';
  static getAllCardHsaMaxUrl = Constants.baseUrl + 'card-service/getAllCardHsaMax';
  static getSystemMessagesUrl = Constants.baseUrl + 'claim-service/getSystemMessages';
  static deleteCardHsaMaxUrl = Constants.baseUrl + 'card-service/deleteCardHsaMax';
  static addOrUpdateCardBenefitCovMaxUrl = Constants.baseUrl + 'card-service/addOrUpdateCardBenefitCovMax';
  static getAllCardBenefitCovMaxUrl = Constants.baseUrl + 'card-service/getAllCardBenefitCovMax';
  static deleteCardBenefitCovMaxUrl = Constants.baseUrl + 'card-service/deleteCardBenefitCovMax';
  static getBenefitCovCatListUrl = Constants.baseUrl + 'claim-service/getBenefitCovCatList';
  static getCovCatListUrl = Constants.baseUrl + 'claim-service/getCovCatList';
  static getHsaMaxPeriodTypeUrl = Constants.baseUrl + 'plan-service/getHsaMaxPeriodType';
  static cardImportantComments = Constants.baseUrl + 'card-service/getCardImportantCommentsByCardId';
  static getCardHolderImportantCommentsUrl = Constants.baseUrl + 'cardholder-service/getCardHolderImportantComments';
  static exportCardSearchByTypeFilterUrl = Constants.baseUrl + 'card-service/exportCardSearchByTypeFilter';
  static getBenefitListDentCoverageCategoryUrl = Constants.baseUrl + 'card-service/getBenefitListDentCoverageCategory';
  /* cardholder Maximum */

  static getDentalCardholderMax = Constants.baseUrl + 'cardholder-service/getCardholderDenCovCatMax';
  static saveDentalCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderDentalCovCatMax';

  static getHealthCardholderMax = Constants.baseUrl + 'cardholder-service/getCardholderHlthCovCatMax';
  static saveHealthCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderHlthCovCatMax';

  static getVisionCardholderMax = Constants.baseUrl + 'cardholder-service/getCardholderVisCovCatMax';
  static saveVisionCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderVisCovCatMax';

  static getDrugCardholderMax = Constants.baseUrl + 'cardholder-service/getCardholderDrugCovCatMax';
  static saveDrugCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderDrugCovCatMax';

  static getBenefitDentalCardholderMax = Constants.baseUrl + 'cardholder-service/getCardholderBenDentCatMax';
  static saveBenefitDentalCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderBenDentCatMax';

  static getBenefitHealthCardholderMax = Constants.baseUrl + 'cardholder-service/getCardholderBenHlthCatMax';
  static saveBenefitHealthCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderBenHlthCatMax';

  static getTopupCardholderMax = Constants.baseUrl + 'cardholder-service/getAllCardHolderHsaMax';
  static saveTopupCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderHsaMaximum';

  static getBenefitDrugCardholderMax = Constants.baseUrl + 'cardholder-service/getCardholderBenDrugCatMax';
  static saveBenefitDrugCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderBenDrugCatMax';

  static getBenefitVisionCardholderMax = Constants.baseUrl + 'cardholder-service/getCardholderBenVisCatMax';
  static saveBenefitVisionCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderBenVisCatMax';

  /*  static getTopupCardholderMax = Constants.baseUrl + 'cardholder-service/getAllCardHolderHsaMax';
   static saveTopupCardholderMax = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderMaximum'; */

  static getAllCardHolderMax = Constants.baseUrl + 'cardholder-service/getAllCardHolderMax';
  static saveAndUpdateCardholderMaximum = Constants.baseUrl + 'cardholder-service/saveAndUpdateCardholderMaximum';

  static deleteCardHolderMaximum = Constants.baseUrl + 'cardholder-service/deleteCardHolderMaximum';
  static deleteCardHolderHsaMaximum = Constants.baseUrl + 'cardholder-service/deleteCardHolderHsaMaximum';
  static deleteCardHolderBenefitCovMax = Constants.baseUrl + 'cardholder-service/deleteCardHolderBenefitCovMax';
  static deleteCardHolderCovMax = Constants.baseUrl + 'cardholder-service/deleteCardHolderCovMax';
  static referClaimUsersSupervisor = Constants.baseUrl + 'claim-service/referClaimUsersSupervisor'; // issue number 537

  /* API's for Person Comment (11-Feb-2022) */
  static addUpdateCHPersonCommentUrl = Constants.baseUrl + 'cardholder-service/addUpdateCHPersonComment'; 
  static getCHPersonCommentUrl = Constants.baseUrl + 'cardholder-service/getCHPersonComment' 
  static deleteCHPersonCommentUrl = Constants.baseUrl + 'cardholder-service/deleteCHPersonComment'
  static getCHPersonImportantCommentUrl = Constants.baseUrl + 'cardholder-service/getCHPersonImportantComment'
  
  // API for Update Card Type(11-Mar-2022)
  static addOrUpdateCardTypeUrl = Constants.baseUrl + 'card-service/addOrUpdateCardType'
}