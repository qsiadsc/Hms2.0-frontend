import { Constants } from '../common-module/Constants';
import { stat, constants } from 'fs';
import { StaticSymbolCache } from '@angular/compiler';

export class DomainApi {
    static domainListingUrl = Constants.baseUrl + 'claim-service/domainListing';
    // Drug Benefit API
    static getBenefitDrugCovCatListingUrl = Constants.baseUrl + 'claim-service/getBenefitDrugCovCatListing';
    static addBenefitDrugCovCatUrl = Constants.baseUrl + 'claim-service/addBenefitDrugCovCat';
    static editBenefitDrugCovCatUrl = Constants.baseUrl + 'claim-service/editBenefitDrugCovCat';
    static deleteBenefitDrugCovCatUrl = Constants.baseUrl + 'claim-service/deleteBenefitDrugCovCat';

    // Dental Benefit API
    static getBenefitDentalCovCatListingUrl = Constants.baseUrl + 'claim-service/getBenefitDentalCovCatListing'
    static addBenefitDentalCovCatUrl = Constants.baseUrl + 'claim-service/addBenefitDentalCovCat'
    static editBenefitDentalCovCatUrl = Constants.baseUrl + 'claim-service/editBenefitDentalCovCat'
    static deleteBenefitDentalCovCatUrl = Constants.baseUrl + 'claim-service/deleteBenefitDentalCovCat'

    // Health Benefit API
    static getBenefitHealthCovCatListingUrl = Constants.baseUrl + 'claim-service/getBenefitHealthCovCatListing'
    static addBenefitHealthCovCatUrl = Constants.baseUrl + 'claim-service/addBenefitHealthCovCat'
    static editBenefitHealthCovCatUrl = Constants.baseUrl + 'claim-service/editBenefitHealthCovCat'
    static deleteBenefitHealthCovCatUrl = Constants.baseUrl + 'claim-service/deleteBenefitHealthCovCat'

    // Vision Benefit API
    static getBenefitVisionCovCatListingUrl = Constants.baseUrl + 'claim-service/getBenefitVisionCovCatListing'
    static addBenefitVisionCovCatUrl = Constants.baseUrl + 'claim-service/addBenefitVisionCovCat'
    static editBenefitVisionCovCatUrl = Constants.baseUrl + 'claim-service/editBenefitVisionCovCat'
    static deleteBenefitVisionCovCatUrl = Constants.baseUrl + 'claim-service/deleteBenefitVisionCovCat'

    // COB Type API
    static getCobTypeListUrl = Constants.baseUrl + 'claim-service/getCobTypeList'
    static addCobTypeUrl = Constants.baseUrl + 'claim-service/addCobType'
    static editCobTypeUrl = Constants.baseUrl + 'claim-service/editCobType'
    static deleteCobTypeUrl = Constants.baseUrl + 'claim-service/deleteCobType'

    // Card Type API
    static getCardTypesUrl = Constants.baseUrl + 'claim-service/getCardTypes'
    static addCardTypeUrl = Constants.baseUrl + 'claim-service/addCardType'
    static editCardTypeUrl = Constants.baseUrl + 'claim-service/editCardType'
    static deleteCardTypeUrl = Constants.baseUrl + 'claim-service/deleteCardType'

    // Card Mailout Type API
    static getCardMailoutTypeUrl = Constants.baseUrl + 'claim-service/getCardMailoutType'
    static addCardMailoutTypeUrl = Constants.baseUrl + 'claim-service/addCardMailoutType'
    static editCardMailoutTypeUrl = Constants.baseUrl + 'claim-service/editCardMailoutType'
    static deleteCardMailoutTypeUrl = Constants.baseUrl + 'claim-service/deleteCardMailoutType'

    // Cardholder Role API
    static getCardholderRolesUrl = Constants.baseUrl + 'claim-service/getCardholderRoles'
    static addCardholderRoleUrl = Constants.baseUrl + 'claim-service/addCardholderRole'
    static editCardholderRoleUrl = Constants.baseUrl + 'claim-service/editCardholderRole'
    static deleteCardholderRoleUrl = Constants.baseUrl + 'claim-service/deleteCardholderRole'

    // Message API will be implemented
    static getMessagesUrl = Constants.baseUrl + 'claim-service/getMessages'
    static addMessageUrl = Constants.baseUrl + 'claim-service/addMessage'
    static editMessageUrl = Constants.baseUrl + 'claim-service/editMessage'
    static deleteMessageUrl = Constants.baseUrl + 'claim-service/deleteMessage'

    // Dental Coverage Category API
    static getDentalCovCategorysUrl = Constants.baseUrl + 'claim-service/getDentalCovCategorys'
    static addDentalCovCategoryUrl = Constants.baseUrl + 'claim-service/addDentalCovCategory'
    static editDentalCovCategoryUrl = Constants.baseUrl + 'claim-service/editDentalCovCategory'
    static deleteDentalCovCategoryUrl = Constants.baseUrl + 'claim-service/deleteDentalCovCategory'

    // Health Coverage Category API
    static getHealthCovCategorysUrl = Constants.baseUrl + 'claim-service/getHealthCovCategorys'
    static addHealthCovCategoryUrl = Constants.baseUrl + 'claim-service/addHealthCovCategory'
    static editHealthCovCategoryUrl = Constants.baseUrl + 'claim-service/editHealthCovCategory'
    static deleteHealthCovCategoryUrl = Constants.baseUrl + 'claim-service/deleteHealthCovCategory'

    // Vision Coverage Category API
    static getVisionCovCategorysUrl = Constants.baseUrl + 'claim-service/getVisionCovCategorys'
    static addVisionCovCategoryUrl = Constants.baseUrl + 'claim-service/addVisionCovCategory'
    static editVisionCovCategoryUrl = Constants.baseUrl + 'claim-service/editVisionCovCategory'
    static deleteVisionCovCategoryUrl = Constants.baseUrl + 'claim-service/deleteVisionCovCategory' 

    // Drug Coverage Category API
    static getDrugCovCategorysUrl = Constants.baseUrl + 'claim-service/getDrugCovCategorys'
    static addDrugCovCategoryUrl = Constants.baseUrl + 'claim-service/addDrugCovCategory'
    static editDrugCovCategoryUrl = Constants.baseUrl + 'claim-service/editDrugCovCategory'
    static deleteDrugCovCategoryUrl = Constants.baseUrl + 'claim-service/deleteDrugCovCategory'

    // Wellness Coverage Category API
    static getWellnessCovCategorysUrl = Constants.baseUrl + 'claim-service/getWellnessCovCategorys'
    static addWellnessCovCategoryUrl = Constants.baseUrl + 'claim-service/addWellnessCovCategory'
    static editWellnessCovCategoryUrl = Constants.baseUrl + 'claim-service/editWellnessCovCategory'
    static deleteWellnessCovCategoryUrl = Constants.baseUrl + 'claim-service/deleteWellnessCovCategory'

    // Dental Specialty Type API
    static getDentalSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/getDentalSpecialtyType'
    static addDentalSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/addDentalSpecialtyType'
    static editDentalSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/editDentalSpecialtyType'
    static deleteDentalSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/deleteDentalSpecialtyType'

    // Health Specialty Type API
    static getHealthSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/getHealthSpecialtyType'
    static addHealthSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/addHealthSpecialtyType'
    static editHealthSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/editHealthSpecialtyType'
    static deleteHealthSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/deleteHealthSpecialtyType'

    // Vision Specialty Type API
    static getVisionSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/getVisionSpecialtyType'
    static addVisionSpecialtyTypeurl = Constants.baseUrl + 'claim-service/addVisionSpecialtyType'
    static editVisionSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/editVisionSpecialtyType'
    static deleteVisionSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/deleteVisionSpecialtyType'

    // Wellness Specialty Type API
    static getWellnessSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/getWellnessSpecialtyType'
    static addWellnessSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/addWellnessSpecialtyType'
    static editWellnessSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/editWellnessSpecialtyType'
    static deleteWellnessSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/deleteWellnessSpecialtyType'

    // Dental Specialty Group API
    static getDentalSpecialtyGroupUrl = Constants.baseUrl + 'claim-service/getDentalSpecialtyGroup'
    static addDentalSpecialtyGroupUrl = Constants.baseUrl + 'claim-service/addDentalSpecialtyGroup'
    static editDentalSpecialtyGroupUrl = Constants.baseUrl + 'claim-service/editDentalSpecialtyGroup'
    static deleteDentalSpecialtyGroupUrl = Constants.baseUrl + 'claim-service/deleteDentalSpecialtyGroup'

    // Wellness Specialty Group API
    static getWellnessSpecialtyGroupUrl = Constants.baseUrl + 'claim-service/getWellnessSpecialtyGroup'
    static addWellnessSpecialtyGroupUrl = Constants.baseUrl + 'claim-service/addWellnessSpecialtyGroup'
    static editWellnessSpecialtyGroupUrl = Constants.baseUrl + 'claim-service/editWellnessSpecialtyGroup'
    static deleteWellnessSpecialtyGroupUrl = Constants.baseUrl + 'claim-service/deleteWellnessSpecialtyGroup'

    // Dental Provider Type
    static getDentalProviderTypeUrl = Constants.baseUrl + 'claim-service/getDentalProviderType'
    static addDentalProviderTypeUrl = Constants.baseUrl + 'claim-service/addDentalProviderType'
    static editDentalProviderTypeUrl = Constants.baseUrl + 'claim-service/editDentalProviderType'
    static deleteDentalProviderTypeUrl = Constants.baseUrl + 'claim-service/deleteDentalProviderType'

    // Year Type
    static getYearTypeListUrl = Constants.baseUrl + 'claim-service/getYearTypeList'
    static addEditYearTypeUrl = Constants.baseUrl + 'claim-service/addEditYearType'
    static deleteYearTypeUrl = Constants.baseUrl + 'claim-service/deleteYearType'

    // Transaction Code
    static getTransactionCodeListUrl = Constants.baseUrl + 'financial-payable-service/searchTransactionCode';
    static saveUpdateTransactionCodeUrl = Constants.baseUrl + 'financial-payable-service/saveUpdateTransactionCode'
    static getTransactionCodeUrl = Constants.baseUrl + 'financial-payable-service/getTransactionCode'
    static deleteTransactionCodeUrl = Constants.baseUrl + 'claim-service/deleteTransactionCode'

    // Claim Type
    static getListClaimTypeUrl = Constants.baseUrl + 'claim-service/getListClaimType'
    static addEditClaimTypeUrl = Constants.baseUrl + 'claim-service/addEditClaimType' 
    static deleteClaimTypeUrl = Constants.baseUrl + 'claim-service/deleteClaimType'

    // Claim Status
    static getListClaimStatusUrl = Constants.baseUrl + 'claim-service/getListClaimStatus'
    static addEditClaimStatusUrl = Constants.baseUrl + 'claim-service/addEditClaimStatus'
    static deleteClaimStatusUrl = Constants.baseUrl + 'claim-service/deleteClaimStatus'
    
    // Dental Provider Specialty
    static getListDentalProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/getListDentalProviderSpecialty'
    static addEditDentalProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/addEditDentalProviderSpecialty'
    static deleteDentalProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/deleteDentalProviderSpecialty'
    
    // Deductible Type 
    static getListDeductibleTypeUrl = Constants.baseUrl + 'claim-service/getListDeductibleType'
    static addEditDeductibleTypeUrl = Constants.baseUrl + 'claim-service/addEditDeductibleType'
    static deleteDeductibleTypeUrl = Constants.baseUrl + 'claim-service/deleteDeductibleType'

    // Maximum Type 
    static getListMaximumTypeURL = Constants.baseUrl + 'claim-service/getListMaximumType'
    static addEditMaximumTypeUrl = Constants.baseUrl + 'claim-service/addEditMaximumType'
    static deleteMasteMaximumType = Constants.baseUrl + 'claim-service/deleteMasteMaximumType'

    // Max Period Type
    static getListMaxPeriodTypeUrl = Constants.baseUrl + 'claim-service/getListMaxPeriodType'
    static addEditMaxPeriodTypeUrl = Constants.baseUrl + 'claim-service/addEditMaxPeriodType'
    static deleteMaxPeriodTypeUrl = Constants.baseUrl + 'claim-service/deleteMaxPeriodType'

    // HSA Max Type
    static getListHsaMaxTypeUrl = Constants.baseUrl + 'claim-service/getListHsaMaxType' 
    static addEditHsaMaxTypeUrl = Constants.baseUrl + 'claim-service/addEditHsaMaxType'
    static deleteHsaMaxTypeUrl = Constants.baseUrl + 'claim-service/deleteHsaMaxType'

    // HSA Max Period Type
    static getListHsaMaxPeriodTypeUrl = Constants.baseUrl + 'claim-service/getListHsaMaxPeriodType'
    static addEditHsaMaxPeriodTypeUrl = Constants.baseUrl + 'claim-service/addEditHsaMaxPeriodType'
    static deleteHsaMaxPeriodTypeUrl = Constants.baseUrl + 'claim-service/deleteHsaMaxPeriodType'

    // HSA Coverage Category
    static getListHsaCoverageCategoryUrl = Constants.baseUrl + 'claim-service/getListHsaCoverageCategory'
    static addEditHsaCoverageCategoryUrl = Constants.baseUrl + 'claim-service/addEditHsaCoverageCategory'
    static deleteHsaCoverageCategoryUrl = Constants.baseUrl + 'claim-service/deleteHsaCoverageCategory'
    
    // Rule Execution Point
    static getListRuleExecutionPointUrl = Constants.baseUrl + 'claim-service/getListRuleExecutionPoint'
    static addEditRuleExecutionPointUrl = Constants.baseUrl + 'claim-service/addEditRuleExecutionPoint'
    static deleteRuleExecutionPointUrl = Constants.baseUrl + 'claim-service/deleteRuleExecutionPoint'

    // Rule Execution Order
    static getListRuleExecutionOrderUrl = Constants.baseUrl + 'claim-service/getListRuleExecutionOrder'
    static addEditRuleExecutionOrderUrl = Constants.baseUrl + 'claim-service/addEditRuleExecutionOrder'
    static deleteRuleExecutionOrderUrl = Constants.baseUrl + 'claim-service/deleteRuleExecutionOrder'

    // Drug Prov Specialty Type 
    static getListDrugProvSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/getListDrugProvSpecialtyType'
    static addEditDrugProvSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/addEditDrugProvSpecialtyType'
    static deleteDrugProvSpecialtyTypeUrl  = Constants.baseUrl + 'claim-service/deleteDrugProvSpecialtyType'

    // Tooth Code 
    static getListToothCodeUrl = Constants.baseUrl + 'claim-service/getListToothCode'
    static addEditToothCodeUrl = Constants.baseUrl + 'claim-service/addEditToothCode'
    static deleteToothCodeUrl = Constants.baseUrl + 'claim-service/deleteToothCode'

    // Dental Practice Type
    static getListDentalPracticeTypeUrl = Constants.baseUrl + 'claim-service/getListDentalPracticeType'
    static addEditDentalPracticeTypeUrl = Constants.baseUrl + 'claim-service/addEditDentalPracticeType'
    static deleteDentalPracticeTypeUrl = Constants.baseUrl + 'claim-service/deleteDentalPracticeType'

    // Vision Practice Type
    static getListVisionPracticeTypeUrl = Constants.baseUrl + 'claim-service/getListVisionPracticeType'
    static addEditVisionPracticeTypeUrl = Constants.baseUrl + 'claim-service/addEditVisisonPracticeType'
    static deleteVisionPracticeTypeUrl = Constants.baseUrl + 'claim-service/deleteVisionPracticeType'

    // Health Practice Type
    static getListHealthPracticeTypeUrl = Constants.baseUrl + 'claim-service/getListHealthPracticeType'
    static addEditHealthPracticeTypeUrl = Constants.baseUrl + 'claim-service/addEditHealthPracticeType'
    static deleteHealthPracticeTypeUrl = Constants.baseUrl + 'claim-service/deleteHealthPracticeType'

    // Drug Practice Type
    static getListDrugPracticeTypeUrl = Constants.baseUrl + 'claim-service/getListDrugPracticeType'
    static addEditDrugPracticeTypeUrl = Constants.baseUrl + 'claim-service/addEditDrugPracticeType'
    static deleteDrugPracticeTypeUrl = Constants.baseUrl + 'claim-service/deleteDrugPracticeType'

    // Wellness Practice Type
    static getListWellPracticeTypeUrl = Constants.baseUrl + 'claim-service/getListWellPracticeType'
    static addEditWellPracticeTypeUrl = Constants.baseUrl + 'claim-service/addEditWellPracticeType'
    static deleteWellPracticeTypeUrl = Constants.baseUrl + 'claim-service/deleteWellPracticeType'

    // Wellness Provider Type
    static getListWellProviderTypeUrl = Constants.baseUrl + 'claim-service/getListWellProviderType'
    static addEditWellProviderTypeUrl = Constants.baseUrl + 'claim-service/addEditWellProviderType'
    static deleteWellProviderTypeUrl = Constants.baseUrl + 'claim-service/deleteWellProviderType'

    // Wellness Provider Specialty
    static getListWellProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/getListWellProviderSpecialty'
    static addEditWellProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/addEditWellProviderSpecialty'
    static deleteWellProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/deleteWellProviderSpecialty'

    // Health Provide Specialty
    static getListHlthProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/getListHlthProviderSpecialty'
    static addEditHlthProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/addEditHlthProviderSpecialty'
    static deleteHlthProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/deleteHlthProviderSpecialty'

    // Vision Provider Specialty
    static getListVisProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/getListVisProviderSpecialty'
    static addEditVisProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/addEditVisProviderSpecialty'
    static deleteVisProviderSpecialtyUrl = Constants.baseUrl + 'claim-service/deleteVisProviderSpecialty'

    // Payee Type
    static getListPayeeTypeUrl = Constants.baseUrl + 'claim-service/getListPayeeType'
    static addEditPayeeTypeUrl = Constants.baseUrl + 'claim-service/addEditPayeeType'
    static deletePayeeTypeUrl = Constants.baseUrl + 'claim-service/deletePayeeType'

    // Prorate Type
    static getListProrateTypeUrl = Constants.baseUrl + 'claim-service/getListProrateType'
    static addEditProrateTypeUrl = Constants.baseUrl + 'claim-service/addEditProrateType'
    static deleteProrateTypeUrl = Constants.baseUrl + 'claim-service/deleteProrateType'

    // Transaction Type
    static getListTransactionTypeUrl = Constants.baseUrl + 'claim-service/getListTransactionType'
    static addEditTransactionTypeUrl = Constants.baseUrl + 'claim-service/addEditTransactionType'
    static deleteTransactionTypeUrl = Constants.baseUrl + 'claim-service/deleteTransactionType'

    // Transaction Status 
    static getListTransactionStatusUrl = Constants.baseUrl + 'claim-service/getListTransactionStatus'
    static addEditTransactionStatusrl = Constants.baseUrl + 'claim-service/addEditTransactionStatus'
    static deleteTransactionStatusUrl = Constants.baseUrl + 'claim-service/deleteTransactionStatus'

    // Termination Category  
    static getListTerminationCategoryUrl = Constants.baseUrl + 'claim-service/getListTerminationCategory'
    static addEditTerminationCategoryUrl = Constants.baseUrl + 'claim-service/addEditTerminationCategory'
    static deleteTerminationCategoryUrl = Constants.baseUrl + 'claim-service/deleteTerminationCategory'

    // Discipline 
    static getListDisciplineUrl = Constants.baseUrl + 'claim-service/getListDiscipline'
    static addEditDisciplineUrl = Constants.baseUrl + 'claim-service/addEditDiscipline'
    static deleteDisciplineUrl = Constants.baseUrl + 'claim-service/deleteDiscipline'

    // Predictive API's for dropdown in Dental Provider Specialty
    static getPredDentSpecTypeUrl = Constants.baseUrl + 'claim-service/getPredDentSpecType'
    static getPredSpecGrpUrl = Constants.baseUrl + 'claim-service/getPredSpecGrp'
    static getPredProvTypeUrl = Constants.baseUrl + 'claim-service/getPredProvType'

    // Predictive API's for dropdown  in Wellness Provider Specialty
    static getPredWellSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/getPredWellSpecialtyType'
    static getPredWellGrpUrl = Constants.baseUrl + 'claim-service/getPredWellGrp'
    static getPredWellProvTypeUrl = Constants.baseUrl + 'claim-service/getPredWellProvType'

    // Mouth Tooth
    static getListMouthToothUrl =Constants.baseUrl + 'claim-service/getListMouthTooth'
    static addEditMouthToothUrl = Constants.baseUrl + 'claim-service/addEditMouthTooth'
    static deleteMouthToothUrl = Constants.baseUrl + 'claim-service/deleteMouthTooth'

    // Predictive API's for dropdown in Mouth Tooth
    static getPredToothCodeUrl = Constants.baseUrl + 'claim-service/getPredToothCode'
    static getPredMouthSiteUrl = Constants.baseUrl + 'claim-service/getPredMouthSite'

    // Mouth Site
    static getMouthSiteListUrl = Constants.baseUrl + 'claim-service/getMouthSiteList'
    static addEditMouthSiteUrl = Constants.baseUrl + 'claim-service/addEditMouthSite'
    static deleteMouthSiteUrl = Constants.baseUrl + 'claim-service/deleteMouthSite'

    // Prective API's for Vision and Health Specialty Type
    static getPredVisSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/getPredVisSpecialtyType'
    static getPredHlthSpecialtyTypeUrl = Constants.baseUrl + 'claim-service/getPredHlthSpecialtyType'

    

}