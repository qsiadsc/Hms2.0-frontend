import {Constants } from '../common-module/Constants';
import { stat } from 'fs';

export class FeeGuideApi {
  static getProvinceListUrl = Constants.baseUrl + 'fee-guide-service/getProvinceList';
  static getDentalFeeGuideScheduleListUrl = Constants.baseUrl + 'fee-guide-service/getDentalFeeGuideScheduleList';
  static saveFeeGuideFromUsclsUrl = Constants.baseUrl + 'fee-guide-service/saveFeeGuideFromUscls';
  static getMouthSiteListUrl = Constants.baseUrl + 'fee-guide-service/getMouthSiteList';
  static saveDentalProcedureCodeUrl = Constants.baseUrl + 'fee-guide-service/saveDentalProcedure';
  static updateDentalProcedureCodeUrl = Constants.baseUrl + 'fee-guide-service/updateDentalProcedure';
  static getDentalProcedureCodeUrl = Constants.baseUrl + 'fee-guide-service/getDentalProcedure';
  static searchDentalProcedureCodeUrl = Constants.baseUrl + 'fee-guide-service/searchDentalProcedure';
  static getDentalProcedureListUrl = Constants.baseUrl + 'fee-guide-service/getDentalProcedureList';
  static getFeeGuideViewDetailsUrl = Constants.baseUrl + 'fee-guide-service/getDentalFeeGuideDetails';
  static getDentalProviderSpecialtyListUrl = Constants.baseUrl + 'fee-guide-service/getDentalProviderSpecialtyList';
  static getFeeGuideProcedureCodeListUrl = Constants.baseUrl + 'fee-guide-service/getFeeGuideProcedureCodeList';
  static getScheduleAndFeeGuideUrl=  Constants.baseUrl + 'fee-guide-service/getScheduleAndFeeGuide'
  static searchDentalProcedureByFilterUrl =Constants.baseUrl + 'fee-guide-service/searchDentalProcedureByFilter'
  static searchDentalProcedureOnColumnUrl = Constants.baseUrl + 'fee-guide-service/searchDentalProcedureOnColumn'
  static getPredectiveDentalProcCode = Constants.baseUrl + 'fee-guide-service/getPredictiveDentalServiceList'
  static getPredectiveProvinceCode = Constants.baseUrl + 'fee-guide-service/getProvinceList'
  static getPredictiveDentalFeeGuideScheduleList = Constants.baseUrl + 'fee-guide-service/getPredictiveDentalFeeGuideScheduleList'
  static predictiveDentalProcedureDescSearch = Constants.baseUrl + 'fee-guide-service/predictiveDentalProcedureSearch';
    /*Dental Service Api's */
  static getDentalServiceListUrl =Constants.baseUrl + 'fee-guide-service/getDentalServiceList';
  static getDentalCovCategoryListUrl=Constants.baseUrl + 'fee-guide-service/getDentalCovCategoryList';
  static saveDentalServiceUrl=Constants.baseUrl + 'fee-guide-service/saveDentalService'
  static getDentalServiceUrl=Constants.baseUrl + 'fee-guide-service/getDentalService';
  static updateDentalServiceUrl=Constants.baseUrl + 'fee-guide-service/updateDentalService'
  static saveOrUpdateProcedureCodeFeeUrl     = Constants.baseUrl + 'fee-guide-service/saveOrUpdateProcedureCodeFee'
  static updateDentalFeeGuideUrl = Constants.baseUrl + 'fee-guide-service/updateDentalFeeGuide';
  static getAttachedProcedureCodeListUrl = Constants.baseUrl + 'fee-guide-service/getAttachedProcedureCodeList'
  static getDentalServiceSearch = Constants.baseUrl + 'fee-guide-service/dentalServiceSearch'
  static getDentalPredectiveParentService = Constants.baseUrl + 'fee-guide-service/getDentalParentService'

  static getDentalPredectiveCovCat = Constants.baseUrl + 'fee-guide-service/searchDentalCovCategory'
  static importFeeguideDataUrl = Constants.baseUrl + 'fee-guide-service/importFeeguideData'
  static getDentalServicesUrl = Constants.baseUrl + 'fee-guide-service/getDentalServices'
  // behalf of add service 
  static saveDentalService = Constants.baseUrl + 'company-service/addNewCompany';
  static getFeeGuideProcedureCodeDetailsUrl = Constants.baseUrl + 'fee-guide-service/getFeeGuideProcedureCodeDetails';

  /*Dental Shedule Api's */
  static getDentalScheduleListUrl =Constants.baseUrl + 'fee-guide-service/getDentalScheduleList';
  static saveOrUpdateDentalScheduleUrl=Constants.baseUrl + 'fee-guide-service/saveOrUpdateDentalSchedule';
  static getDentalScheduleUrl=Constants.baseUrl + 'fee-guide-service/getDentalSchedule'
  static searchProcedureFeeByColumnFilterUrl=Constants.baseUrl + 'fee-guide-service/searchProcedureFeeByColumnFilterWithoutDatatable'

  static getDentalSpecialityUrl=Constants.baseUrl + 'fee-guide-service/getDentalSpeciality'
  static saveOrUpdateDentalSpecialityUrl=Constants.baseUrl + 'fee-guide-service/saveOrUpdateDentalSpeciality'
  static updateMultiProcedureCodeUrl =Constants.baseUrl +'fee-guide-service/updateMultiProcedureCode'
  static deleteSpecialtyUrl=Constants.baseUrl + 'fee-guide-service/deleteSpecialty'
  static findAllProcedurePathUrl=Constants.baseUrl + 'fee-guide-service/findAllProcedurePath'

  /*USCLS feeGuide*/
  static getDentalFeeGuideListUrl=Constants.baseUrl + 'fee-guide-service/getDentalFeeGuideList';
  static saveDentalFeeGuideUrl=Constants.baseUrl + 'fee-guide-service/saveDentalFeeGuide';
  static yearListUrl=Constants.baseUrl + 'fee-guide-service/getUsclsFeeGuidePreviousYearList';
  static getUsclsFeeGuideList=Constants.baseUrl + 'fee-guide-service/getUsclsFeeGuideList';
  static saveUsclsFeeGuideUrl=Constants.baseUrl + 'fee-guide-service/saveUsclsFeeGuide';
  static getPredictiveFeeGuideUrl=Constants.baseUrl + 'fee-guide-service/getPredictiveFeeGuide';
  static searchUsclsFeeGuideProcedureFeeUrl=Constants.baseUrl + 'fee-guide-service/searchUsclsFeeGuideProcedureFee';
  static deleteUsclsProcedureFeeWithLabIndUrl=Constants.baseUrl + 'fee-guide-service/deleteUsclsProcedureFeeWithLabInd';
  static saveOrUpdateUsclsProcedureFeeWithLabIndUrl = Constants.baseUrl + 'fee-guide-service/saveOrUpdateUsclsProcedureFeeWithLabInd';
  static searchUsclsFeeGuideProcedureFeeOnColumnUrl = Constants.baseUrl + 'fee-guide-service/searchUsclsFeeGuideProcedureFeeOnColumn';
  static getPredictiveFeeGuideByNameUrl=Constants.baseUrl + 'fee-guide-service/getPredictiveFeeGuideByName';
  static getDentalProcedureFeeListByFeeGuideKeyUrl=Constants.baseUrl + 'fee-guide-service/getDentalProcedureFeeListByFeeGuideKey'
  static getDentalProcedureFeeListByFeeGuideKeyScrollUrl=Constants.baseUrl + 'fee-guide-service/getDentalProcedureFeeListByFeeGuideKeyScroll' 

  /* Vision FeeGuide Services */
  static saveVisionServiceUrl = Constants.baseUrl + 'fee-guide-service/saveVisionService';
  static updateVisionServiceUrl = Constants.baseUrl + 'fee-guide-service/updateVisionService';
  static getVisionServiceUrl = Constants.baseUrl + 'fee-guide-service/getVisionService';
  static getVisionServiceListUrl = Constants.baseUrl + 'fee-guide-service/getVisionServiceList';
  static getVisionCovCategoryListUrl = Constants.baseUrl + 'fee-guide-service/getVisionCovCategoryList';
  static getVisionParentServiceUrl= Constants.baseUrl + 'fee-guide-service/getVisionParentService'
  static searchVisionCovCategoryUrl=Constants.baseUrl + 'fee-guide-service/searchVisionCovCategory'
  static getAttachedVisionProcedureCodeListUrl=Constants.baseUrl + 'fee-guide-service/getAttachedVisionProcedureCodeList'
  /** Vision Proc Code */
  static saveVisionProcCode = Constants.baseUrl + 'fee-guide-service/saveVisionProcedure';
  static updateVisionProcCode = Constants.baseUrl + 'fee-guide-service/updateVisionProcedure'
  static searchVisionProcedureByFilter = Constants.baseUrl + 'fee-guide-service/searchVisionProcedureByFilter'
  static searchVisionProcedureOnColumn = Constants.baseUrl + 'fee-guide-service/searchVisionProcedureOnColumn'
  static getVisionProcedure = Constants.baseUrl + 'fee-guide-service/getVisionProcedure'
  static getPredectiveVisionProcCode = Constants.baseUrl + 'fee-guide-service/getPredictiveVisionServiceList'
  static predictiveVisionProcedureSearch = Constants.baseUrl + 'fee-guide-service/predictiveVisionProcedureSearch';

    /** hsa Proc Code */
  static saveHsaProcCode = Constants.baseUrl + 'fee-guide-service/saveHsaProcedure';
  static updateHsaProcCode = Constants.baseUrl + 'fee-guide-service/updateHsaProcedure';
  static searchHsaProcedureByFilter = Constants.baseUrl + 'fee-guide-service/searchHsaProcedure'
  static getHsaProcedure = Constants.baseUrl + 'fee-guide-service/getHsaProcedure'
  static getPredectiveHsaProcCode = Constants.baseUrl + 'fee-guide-service/getPredictiveHsaServiceList'
  static predictiveHsaProcedureSearch = Constants.baseUrl + 'fee-guide-service/predictiveHsaProcedureSearch';

  /** HSA service */
  static saveHsaServiceUrl = Constants.baseUrl + 'fee-guide-service/saveHsaService';
  static updateHsaServiceUrl = Constants.baseUrl + 'fee-guide-service/updateHsaService'
  static getHsaServiceUrl = Constants.baseUrl + 'fee-guide-service/getHsaService'
  static getHSAParentServiceList = Constants.baseUrl + 'fee-guide-service/getHsaParentService'
  static getHSACovCategory = Constants.baseUrl + 'fee-guide-service/searchHsaCovCategory'
  static getPredictiveHsaServiceListUrl=Constants.baseUrl + 'fee-guide-service/getPredictiveHsaServiceList'
  static getPredictiveHsaCovCategoryUrl=Constants.baseUrl + 'fee-guide-service/getPredictiveHsaCovCategory'
  static getHsaAttachedProcedureCodeListUrl=Constants.baseUrl + 'fee-guide-service/getHsaAttachedProcedureCodeList'

  /** health Proc Code */
  static saveHealthProcCode = Constants.baseUrl + 'fee-guide-service/saveHealthProcedure';
  static updateHealthProcCode = Constants.baseUrl + 'fee-guide-service/updateHealthProcedure'
  static searchHealthProcedureByFilter = Constants.baseUrl + 'fee-guide-service/searchHealthProcedureByFilter'
  static searchHealthProcedureOnColumn = Constants.baseUrl + 'fee-guide-service/searchHealthProcedureOnColumn'
  static getHealthProcedure = Constants.baseUrl + 'fee-guide-service/getHealthProcedure'
  static getPredectiveHealthProcCode = Constants.baseUrl + 'fee-guide-service/getPredictiveHealthServiceList'
  static predictiveHealthProcedureSearch = Constants.baseUrl + 'fee-guide-service/predictiveHealthProcedureSearch';
  
  /** health service */
  static saveHealthService = Constants.baseUrl + 'fee-guide-service/saveHealthService';
  static updateHealthService = Constants.baseUrl + 'fee-guide-service/updateHealthService'
  static getHealthService = Constants.baseUrl + 'fee-guide-service/getHealthService'
  static getHealthParentServiceList = Constants.baseUrl + 'fee-guide-service/getHealthParentService'
  static getHealthCovCategory = Constants.baseUrl + 'fee-guide-service/searchHealthCovCategory'
  static getHealthAttachedProcedureCodeList = Constants.baseUrl + 'fee-guide-service/getAttachedHealthProcedureCodeList'

  /* Wellness Proc Code API's */
  static searchWellnessProcedureByFilter = Constants.baseUrl + 'fee-guide-service/searchWellnessProcedureByFilter';
  static getWellnessProcedure = Constants.baseUrl + 'fee-guide-service/getWellnessProcedure';
  static saveWellnessProcCode = Constants.baseUrl + 'fee-guide-service/saveWellnessProcedure';
  static updateWellnessProcCode = Constants.baseUrl + 'fee-guide-service/updateWellnessProcedure';
  static getPredectiveWellnessProcCode = Constants.baseUrl + 'fee-guide-service/getPredictiveWellnessServiceList';
  static predictiveWellnessProcedureSearch = Constants.baseUrl + 'fee-guide-service/predictiveWellnessProcedureSearch';

  /* Wellness Service API's */
  static searchWellnessCovCategoryUrl = Constants.baseUrl + 'fee-guide-service/searchWellnessCovCategory';
  static saveWellnessServiceUrl = Constants.baseUrl + 'fee-guide-service/saveWellnessService';
  static updateWellnessServiceUrl = Constants.baseUrl + 'fee-guide-service/updateWellnessService';
  static getWellnessServiceUrl = Constants.baseUrl + 'fee-guide-service/getWellnessService';
  static getWellnessParentServiceUrl = Constants.baseUrl + 'fee-guide-service/getWellnessParentService';
  static getAttachedWellnessProcedureCodeListUrl = Constants.baseUrl + 'fee-guide-service/getAttachedWellnessProcedureCodeList';
  static exportProcedureFeeListByFeeGuideKeyAndSearchKeywords = Constants.baseUrl + 'fee-guide-service/exportProcedureFeeListByFeeGuideKeyAndSearchKeywords';

  /* Proc Code API's */
  static checkDentalProcCodeUrl = Constants.baseUrl + 'fee-guide-service/checkDentalProcCode'
  static checkVisionProcCodeUrl = Constants.baseUrl + 'fee-guide-service/checkVisionProcCode'
  static checkHealthProcCodeUrl = Constants.baseUrl + 'fee-guide-service/checkHealthProcCode'
  static checkHsaProcCodeUrl = Constants.baseUrl + 'fee-guide-service/checkHsaProcCode'
  static checkWellnessProcCodeUrl = Constants.baseUrl + 'fee-guide-service/checkWellnessProcCode'

}
