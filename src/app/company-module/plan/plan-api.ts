
import { Constants } from '../../common-module/Constants';
import { stat } from 'fs';

export class PlanApi {
    static planAmendment = Constants.baseUrl + 'plan-service/doPlanAmendment';
    static getProratingTypeListUrl = Constants.baseUrl + 'plan-service/getProratingType';
    static getDeductibleTypeListUrl = Constants.baseUrl + 'plan-service/getDeductibleType';
    static getYearTypeListUrl = Constants.baseUrl + 'plan-service/getYearType';
    static saveCompanyPlansUrl = Constants.baseUrl + 'plan-service/saveCompanyPlans';
    static updateCompanyPlansUrl = Constants.baseUrl + 'plan-service/updateCompanyPlans';
    static getCompanyPlanUrl = Constants.baseUrl + 'plan-service/getCompanyPlan';
    static getPlanViewUrl = Constants.baseUrl + 'plan-service/getPlanView';
    static getCompanyDetailByCompanyCoKeyUrl = Constants.baseUrl + 'company-service/getCompanyDetailByCompanyCoKey';
    static divisionCommentUrl = Constants.baseUrl + 'plan-service/divisionCommentHist';
    static isPlanValidUrl = Constants.baseUrl + 'plan-service/checkPlanIdExist';
    static getDisciplineUrl = Constants.baseUrl + 'plan-service/getDiscipline';
    static getDentalCategoryList = Constants.baseUrl + 'company-service/companySuspendList';

    static getMaximumTypeList = Constants.baseUrl + 'plan-service/getMaximumType';
    static getHsaMaxTypeList = Constants.baseUrl + 'plan-service/getHsaMaxType';
    static getMaxPeriodTypeList = Constants.baseUrl + 'plan-service/getMaxPeriodType';
    static getHsaMaxPeriodTypeList = Constants.baseUrl + 'plan-service/getHsaMaxPeriodType';
    static getBenefitDentCovCatList = Constants.baseUrl + 'plan-service/getBenefitDentCovCat';
    static getBenefitWellnessCovCatList = Constants.baseUrl + 'plan-service/getBenefitWellCovCat';
   
    static getDentalRules = Constants.baseUrl + 'plan-service/getDentalRules';
    static getVisionRules = Constants.baseUrl + 'plan-service/getVisionRules';
    static getHealthCareRules = Constants.baseUrl + 'plan-service/getHealthCareRules';
    static getDrugRules = Constants.baseUrl + 'plan-service/getDrugRules';

    static getDentalCoverageCategoryList = Constants.baseUrl + 'plan-service/getDentalCoverageAndServices';
    static getVisionCoverageAndServicesList = Constants.baseUrl + 'plan-service/getVisionCoverageAndServices';
    static getHealthCoverageAndServicesList = Constants.baseUrl + 'plan-service/getHealthCoverageAndServices';
    static getDrugCoverageAndServicesList = Constants.baseUrl + 'plan-service/getDrugCoverageAndServices';
    static getHSACoverageAndServicesList = Constants.baseUrl + 'plan-service/getHSACoverageAndServices';
    static getWellnessCoverageAndServicesList = Constants.baseUrl + 'plan-service/getWellnessCoverageAndServices';
    static editCoverageAndServicesList = Constants.baseUrl + 'plan-service/getServices';
    static getPlanServicesListUrl = Constants.baseUrl + 'plan-service/getPlanServices';
    static getFeeGuideScheduleListUrl = Constants.baseUrl + 'plan-service/getFeeGuideSchedule';
    static getProvinceListUrl = Constants.baseUrl + 'company-service/getAllProvince';
    static getServicesByCovKeyDentalUrl = Constants.baseUrl + 'plan-service/getServicesByCovKeyDental';
    static getServicesByCovKeyVisionUrl = Constants.baseUrl + 'plan-service/getServicesByCovKeyVision';
    static getServicesByCovKeyHealthUrl = Constants.baseUrl + 'plan-service/getServicesByCovKeyHealth';
    static getServicesByCovKeyDrugUrl = Constants.baseUrl + 'plan-service/getServicesByCovKeyDrug';
    static getServicesByCovKeyHsaUrl = Constants.baseUrl + 'plan-service/getServicesByCovKeyHsa';
    static getServicesByCovKeyWellnessUrl = Constants.baseUrl + 'plan-service/getServicesByCovKeyWellness';
    static getVisionServicesByCovKeyUrl = Constants.baseUrl + 'plan-service/getVisionServicesByCovKey';
    static getHealthServicesByCovKeyUrl = Constants.baseUrl + 'plan-service/getHealthServicesByCovKey';
    static getDrugServicesByCovKeyUrl = Constants.baseUrl + 'plan-service/getDrugServicesByCovKey';
    static getHSAServicesByCovKeyUrl = Constants.baseUrl + 'plan-service/getHSAServicesByCovKey';
    static getCoverageTimeFrameListUrl = Constants.baseUrl + 'plan-service/getCoverageTimeFrame';

    /** History Pop Ups */
    static getSuspendCompanyList = Constants.baseUrl + 'company-service/companySuspendList';
    static getDivisionCommentHistory = Constants.baseUrl + 'plan-service/divisionCommentHist';
    static getProratingTypeHistory = Constants.baseUrl + 'plan-service/planProratingAssgnmentList';
    static getCarryForwardHistory = Constants.baseUrl + 'plan-service/planProratingAssgnmentList';
    static getCoverageRuleHistory = Constants.baseUrl + 'plan-service/dentalCoverageRuleHist';
    static getProvinceHistory = Constants.baseUrl + 'plan-service/getFeeGuideProvinceHistory';
    static getScheduleHistory = Constants.baseUrl + 'plan-service/getFeeGuideScheduleHistory';
    static getDivisionMaximumHistory = Constants.baseUrl + 'plan-service/getDivisionMaxHist';
    static getDivisionDetailsHistory = Constants.baseUrl + 'plan-service/planProratingAssgnmentList';
    static getUnitCommentsHistory = Constants.baseUrl + 'plan-service/unitCommentList';
    static getDeductibleTypeHistory = Constants.baseUrl + 'plan-service/getDeductibleTypeHistory';

    /**Division Suspend */
    static savePlanDivisionSuspendUrl = Constants.baseUrl + 'plan-service/planDivisionSuspend';
    static planDivisionSuspendList = Constants.baseUrl + 'plan-service/planDivisionSuspendList';
    static planDivisionSuspendDetail = Constants.baseUrl + 'plan-service/planDivisionSuspendDetail';
    static resumeSuspendPlanDivision = Constants.baseUrl + 'plan-service/resumeSuspendPlanDivision';
    static terminateCoverage = Constants.baseUrl + 'plan-service/terminateCoverage';

    /** For Claim Totals */
    static getClaimDetailsUrl = Constants.baseUrl + 'claim-service/getClaim';
    static getTotalForClaim = Constants.baseUrl + 'claim-service/getTotalForClaim';
    static getDentalCoverageMaxHistUrl = Constants.baseUrl + 'plan-service/getDentalCoverageMaxHist';
    static getVisionCoverageMaxHistUrl = Constants.baseUrl + 'plan-service/getVisionCoverageMaxHist';
    static getDrugCovMaxHistUrl = Constants.baseUrl + 'plan-service/getDrugCovMaxHist';
    static getHealthCovMaxMaxHistUrl = Constants.baseUrl + 'plan-service/getHealthCovMaxMaxHist';
    static getSupplementalCovMaxHistUrl = Constants.baseUrl + 'plan-service/getSupplementalCovMaxHist';
    static getDentalCombineMaxHistUrl = Constants.baseUrl + 'plan-service/getDentalCombineMaxHist';
    static getWellnessCovMaxHistUrl = Constants.baseUrl + 'plan-service/getWellnessCovMaxHist';
    static getWellnessCombineMaxHistUrl = Constants.baseUrl + 'plan-service/getWellnessCombineMaxHist';
    static getDivisionStatusUrl = Constants.baseUrl + 'plan-service/getDivisionStatus';
    static getPlanFrequenciesUrl = Constants.baseUrl + 'plan-service/getPlanFrequencies';
    static getDataByProcCodeUrl = Constants.baseUrl + 'plan-service/findProcList'; //issue number 338 
    static getRuleListByProcCode = Constants.baseUrl + 'plan-service/findRuleList'; //issue number 338 
    static deleteServiceCovered = Constants.baseUrl + 'plan-service/deleteFrequencyServiceCoverage';
    static  addServiceCov = Constants.baseUrl + 'plan-service/addUpdateFrequencyServiceCoverage';//issue number 510
    static  addProcedure = Constants.baseUrl + 'plan-service/addUpdateFrequencyCoverageProcedure';//issue number 510
    static  addRule = Constants.baseUrl + 'plan-service/addUpdateFrequencyCoverageRule';//issue number 510
    static getDentalRulesPredictiveUrl = Constants.baseUrl + 'plan-service/getPredictiveDentalRules';//issue number 510
    static getProcedurePredectiveProcId = Constants.baseUrl + 'plan-service/getPredectiveProcId'
    static  deleteProcedureService = Constants.baseUrl + 'plan-service/deleteFrequencyCoverageProcedure';
    static  deleteRuleService = Constants.baseUrl + 'plan-service/deleteFrequencyCoverageRule';
    static addUpdateVisFreqServCovUrl = Constants.baseUrl + 'plan-service/addUpdateVisFreqServCov'
    static deleteVisFreqServCovUrl = Constants.baseUrl + 'plan-service/deleteVisFreqServCov'
    static addUpdateVisFreqCovProcUrl = Constants.baseUrl + 'plan-service/addUpdateVisFreqCovProc'
    static deleteVisFreqCovProcUrl = Constants.baseUrl + 'plan-service/deleteVisFreqCovProc'
    static addUpdateVisFreqCovRuleUrl =Constants.baseUrl + 'plan-service/addUpdateVisFreqCovRule'
    static deleteVisFreqCovRuleUrl = Constants.baseUrl + 'plan-service/deleteVisFreqCovRule'
    static getPredictiveProcIdUrl = Constants.baseUrl + 'plan-service/getPredictiveProcId'
    static getPredictiveLookupProcIdUrl = Constants.baseUrl + 'plan-service/getPredictiveLookupProcId'
    static getPredictiveRulesUrl = Constants.baseUrl + 'plan-service/getPredictiveRules'

    //Health Plan Coverage API
    static addUpdateHlthFreqServCovUrl = Constants.baseUrl + 'plan-service/addUpdateHlthFreqServCov'
    static deleteHlthFreqServCovUrl = Constants.baseUrl + 'plan-service/deleteHlthFreqServCov' 
    static addUpdateHlthFreqCovProcUrl = Constants.baseUrl + 'plan-service/addUpdateHlthFreqCovProc'
    static deleteHlthFreqCovProcUrl = Constants.baseUrl + 'plan-service/deleteHlthFreqCovProc'
    static addUpdateHlthFreqCovRuleUrl = Constants.baseUrl + 'plan-service/addUpdateHlthFreqCovRule'
    static deleteHlthFreqCovRuleUrl = Constants.baseUrl + 'plan-service/deleteHlthFreqCovRule'
    static usclsGuideProcCode = Constants.baseUrl + 'plan-service/usclsGuideProcCode'
    static usclsGuideServiceCode= Constants.baseUrl + 'plan-service/usclsGuideServiceCode'
}