import { Constants } from '../common-module/Constants';
import { constants, stat } from 'fs';

export class UftApi {
    static getTransactionTypeUrl = Constants.baseUrl + 'financial-payable-service/getPredectiveTransactionCode';
    static unitFinancialTransactionSearch = Constants.baseUrl + 'financial-payable-service/unitFinancialTransactionSearch';
    static upcomingTransactionsUrl = Constants.baseUrl + 'financial-payable-service/upcomingTransactions';
    static getTransactionStatusUrl = Constants.baseUrl + 'financial-payable-service/getTransactionStatus';
    static getTransactionType = Constants.baseUrl + 'financial-payable-service/getTransactionType'
    static companyRefundPaymentsUrl = Constants.baseUrl + 'hms-financial-report-service/companyRefundPayments'
    static companyRefundPaymentsChqUrl = Constants.baseUrl + 'financial-payable-service/companyRefundPaymentsChq'
    static payablesBroker = Constants.baseUrl + 'financial-payable-service/payablesBroker'
    static getTransactionSearchFilterData = Constants.baseUrl + 'financial-payable-service/getTransactionSearchFilterData'
    static getPredictiveCompanyListUrl = Constants.baseUrl + 'financial-payable-service/getPredictiveCompanyList'
    static getUnitFinacialTransactionsByKeyUrl = Constants.baseUrl + 'financial-payable-service/getUnitFinacialTransactionsByKey'
    static getCompanyBalanceUrl = Constants.baseUrl + 'financial-payable-service/getCompanyBalance'
    static companyStopChequeUrl = Constants.baseUrl + 'financial-payable-service/companyStopCheque'
    static saveAndUpdateUnitFinancialTransactionUrl = Constants.baseUrl + 'financial-payable-service/saveAndUpdateUnitFinancialTransaction'
    static addOrUpdateUftCompanyBankAccountUrl = Constants.baseUrl + 'financial-payable-service/addOrUpdateUftCompanyBankAccount';
    static getCompanyRefundInfoByCoKeyUrl = Constants.baseUrl + 'financial-payable-service/getCompanyRefundInfoByCoKey'
    static adjustTransactionUrl = Constants.baseUrl + 'financial-payable-service/adjustTransaction'
    static reCalcOpenClosBalCompanyUrl = Constants.baseUrl + 'financial-payable-service/reCalcOpenClosBalCompany'
    static getChequeNumUrl = Constants.baseUrl + 'financial-payable-service/getChequeNum'
    static getCompanyDetailByCoKeyUrl = Constants.baseUrl + 'financial-payable-service/getCompanyDetailByCoKey'
    //Behalf of Upcoming
    //for claim filter search
    static getTransactionSearchFilterDataUrl = Constants.baseUrl + 'financial-payable-service/getTransactionSearchFilterData';
    static getUpcomingTransactionListUrl = Constants.baseUrl + 'financial-payable-service/getUpcomingTransactionList';
    /* New Api(getUpcomingTransactionBankAccountList) used in Upcoming Transaction List instead of getUpcomingTransactionList Api  */
    static getUpcomingTransactionBankAccountListUrl = Constants.baseUrl + 'financial-payable-service/getUpcomingTransactionBankAccountList'
    /* Company Balance Tab */
    static getCompanyBalanceFilterUrl = Constants.baseUrl + 'financial-payable-service/getCompanyBalanceFilter';
    static getCompanyBalanceExcelFilterUrl = Constants.baseUrl + 'financial-payable-service/getCompanyBalanceExcelFilter';
    static companyBalanceGraphUrl = Constants.baseUrl + 'financial-payable-service/totalCountForCompanyBalanceGraph';
    static getBrokerPaymentListUrl = Constants.baseUrl + 'company-service/getCompanyBankAccountHistory';
    static getBusinessTypeListUrl = Constants.baseUrl + 'company-service/getBusinessType';
    static getCompanyBalanceFilterUrlNew = Constants.baseUrl + 'financial-payable-service/getCompanyBalancePieChart';
    /* Dashboard Company&Cardholder Continuity tab API's */
    static getPredectiveProvinceCode = Constants.baseUrl + 'financial-payable-service/getPredectiveProvinceCode';
    static getBrokerListForReferralTypeList = Constants.baseUrl + 'company-service/getBrokerListForReferralType';
    static checkCompanyBankAccount = Constants.baseUrl + 'company-service/checkCompanyBankAccount';
    static getPrimaryCardHolderListForCountUrl = Constants.baseUrl + 'financial-payable-service/getPrimaryCardHolderListForCount';
    static getDependendCardHolderListForCountUrl = Constants.baseUrl + 'financial-payable-service/getDependendCardHolderListForCount';
    static getCompanyListForCountUrl = Constants.baseUrl + 'financial-payable-service/getCompanyListForCount';
    static getCompanyAndCardHolderContinuity = Constants.baseUrl + 'financial-payable-service/getCompanyAndCardHolderContinuity';
    static getCompanyBalanceContinuity = Constants.baseUrl + 'financial-payable-service/getCompanyBalanceContinuity';
    static getCardHolderBalanceContinuity = Constants.baseUrl + 'financial-payable-service/getCardHolderBalanceContinuity';
    static getBusinessTypeUrl = Constants.baseUrl + 'company-service/getBusinessType';
    static getCardholderContinuityExcelUrl = Constants.baseUrl + 'financial-payable-service/getCardholderContinuityExcel';
    static getCompanyContinuityExcelUrl = Constants.baseUrl + 'financial-payable-service/getCompanyContinuityExcel';
    /** UFT Dashboerd Main page */
    static getUftTabData = Constants.baseUrl + 'financial-payable-service/getUTFContinuityAmount';
    static getCompanyBalanceCounts = Constants.baseUrl + 'financial-payable-service/getCompanyCount';
    static getPendingClaimCount = Constants.baseUrl + 'financial-payable-service/getPendingClaimCount';
    static getCompanyAndCardHolderCount = Constants.baseUrl + 'financial-payable-service/getCompanyAndCardHolderCount';
    static getBrokerPaymentCount = Constants.baseUrl + 'financial-payable-service/';
    static getPayablesTabCountUrl = Constants.baseUrl + 'financial-payable-service/getPayablesTabCount';
    static getCompanyCountNew = Constants.baseUrl + 'financial-payable-service/getCompanyCountNew';
    /**  Dashboerd UFT Connevtivty  */
    static getOpeningBalanceUrl = Constants.baseUrl + 'financial-payable-service/getOpeningBalance';
    static getTotalOpeningBalanceAmountUrl = Constants.baseUrl + 'financial-payable-service/getTotalOpeningBalanceAmount';
    static getOpeningClosingBalanceAmtUrl = Constants.baseUrl + 'financial-payable-service/getOpeningClosingBalanceAmt';
    static getBankReconciliationUrl = Constants.baseUrl + 'financial-payable-service/getBankReconciliation';
    static payablesBrokerTotalsUrl = Constants.baseUrl + 'financial-payable-service/payablesBrokerTotals';
    static payablesClaimTotalUrl = Constants.baseUrl + 'financial-payable-service/payablesClaimTotal';
    static payablesClaimRefundUrl = Constants.baseUrl + 'financial-payable-service/payablesClaimRefund';
    static getAdjustmentData = Constants.baseUrl + 'financial-payable-service/';
    static getReFundData = Constants.baseUrl + 'financial-payable-service/';
    static getPaymentRunData = Constants.baseUrl + 'financial-payable-service/';
    static getFundingData = Constants.baseUrl + 'financial-payable-service/';
    static reversePapUrl = Constants.baseUrl + 'financial-payable-service/reversePap';
    static getTotalAmountForUtfContinuityUrl = Constants.baseUrl + 'financial-payable-service/getTotalAmountForUtfContinuity'
    static getListOfTransactionsByCokeyUrl = Constants.baseUrl + 'financial-payable-service/getListOfTransactionsByCokey'
    static getListOfTransactionsByTransCodeUrl = Constants.baseUrl + 'financial-payable-service/getListOfTransactionsByTransCode'
    static getFundingTabAmountByTransactionCodeUrl = Constants.baseUrl + 'financial-payable-service/getFundingTabAmountByTransactionCode'
    static getPaymentRunTabAmountByTransactionCodeUrl = Constants.baseUrl + 'financial-payable-service/getPaymentRunTabAmountByTransactionCode'
    static getRefundTabAmountByTransactionCodeUrl = Constants.baseUrl + 'financial-payable-service/getRefundTabAmountByTransactionCode'
    static getAdjustmentTabAmountByTransactionCodeUrl = Constants.baseUrl + 'financial-payable-service/getAdjustmentTabAmountByTransactionCode'
    static getTotalAmountForUtfContinuityUrlNew = Constants.baseUrl + 'financial-payable-service/getTotalAmountForUtfContinuityNew'
    static manualClearCheque = Constants.baseUrl + 'financial-payable-service/manualClearCheque'
    static getCoBalanceDashboardForGraphUrl = Constants.baseUrl + 'financial-payable-service/getCoBalanceDashboardForGraph'
    static getBankDetailsUrl = Constants.baseUrl + 'fee-guide-service/getBankDetails';
    /* Pending Funds */
    // pendingClaimsCoListExcel APi for Pending Claim Company List Section
    //  pendingClaimsListExcel API for  Pending Claims List:: Section
    //   notificationGenExcel API for Notification Generated API Section
    // releasePfClaimsActionExcel API for Release Claims Action List: Section
    // PfAboutToExpExcel API for About To Expire Section
    static pendingClaimsListUrl = Constants.baseUrl + 'financial-payable-service/getOclAndExbData';
    static releaseAteClaimOclExbByCoKeyUrl = Constants.baseUrl + 'financial-payable-service/releaseAteClaimOclExbByCoKey';
    static releasePfClaimsActionAtExpExcelUrl = Constants.baseUrl + 'financial-payable-service/releasePfClaimsActionAtExpExcel';
    static pendingClaimsCoListExcelUrl = Constants.baseUrl + 'financial-payable-service/pendingClaimsCoListExcel';
    static releasePfClaimsActionExcelUrl = Constants.baseUrl + 'financial-payable-service/releasePfClaimsActionExcel';
    static PfAboutToExpExcel = Constants.baseUrl + 'financial-payable-service/PfAboutToExpExcel';
    static pendingClaimsListExcel = Constants.baseUrl + 'financial-payable-service/pendingClaimsListExcel';
    static notificationGenExcel = Constants.baseUrl + 'financial-payable-service/notificationGenExcel';
    static pendingClaimsActionListUrl = Constants.baseUrl + 'financial-payable-service/pendingClaimExbOclMmByCoKey';
    static releaseClaimsListUrl = Constants.baseUrl + 'financial-payable-service/relesePendingClaimOclExbCmpy';
    static releaseClaimsActionListUrl = Constants.baseUrl + 'financial-payable-service/relesePendingClaimOclExbByCoKey';
    static getAboutToExpirePfNotificationUrl = Constants.baseUrl + 'financial-payable-service/getAboutToExpirePfNotification';
    static releaseClaimsOcl = Constants.baseUrl + 'financial-payable-service/getResultFromReleaseOCLClaim';
    static releaseClaimsEb = Constants.baseUrl + 'financial-payable-service/getResultFromReleaseEBClaim';
    static pendingClaimPieChart = Constants.baseUrl + 'financial-payable-service/getPendingClaimPieChartData';
    static getMailMergeOclData = Constants.baseUrl + 'financial-payable-service/getMailMergeOclData';
    static getMailMergeEbData = Constants.baseUrl + 'financial-payable-service/mailMergeExbData';
    static generateOCLMailMerge = Constants.baseUrl + 'financial-payable-service/getGenerateOCLMailMerge';
    static generateEXBMailMerge = Constants.baseUrl + 'financial-payable-service/generateEBMailMerge';
    static getVPfClaimsOclReleased = Constants.baseUrl + 'financial-payable-service/getVPfClaimsOclReleased';
    static getVPfClaimsEBReleased = Constants.baseUrl + 'financial-payable-service/pendingClaimEbReport';
    static getMailMergedFileListing = Constants.baseUrl + 'financial-payable-service/getMailMergedFileListing';
    static getMailMergedFileCreationListing = Constants.baseUrl + 'financial-payable-service/getMailMergedFileCreationListing   ';
    static getMailMergeEbLetterData = Constants.baseUrl + 'financial-payable-service/mailMergeExbLetterData';;
    static getMailMergeOclLetterData = Constants.baseUrl + 'financial-payable-service/getMailMergeOclLetterData';;
    static searchCompanyListForPendingNotificationUrl = Constants.baseUrl + 'financial-payable-service/searchCompanyListForPendingNotification';
    /**Generate EFT Process */
    static companyUpcomingTransactions = Constants.baseUrl + 'financial-payable-service/companyUpcomingTransactions';
    static generateCompanyPap = Constants.baseUrl + 'financial-payable-service/generateCompanyPap';
    static exportPapFileDirectory = Constants.baseUrl + 'financial-payable-service/exportPapFileDirectory';
    static generatePapEftFile = Constants.baseUrl + 'financial-payable-service/generatePapEftFile';
    /**Report Section Api */
    static reportList = Constants.baseUrl + 'financial-payable-service/getHmsReportList';
    static getAllPredectiveCompany = Constants.baseUrl + 'company-service/getAllPredectiveCompany';
    static getAllPredectiveBroker = Constants.baseUrl + 'hms-financial-report-service/getBrokerPredictiveSearch';
    static getPredictiveCompanyList = Constants.baseUrl + 'financial-payable-service/getPredictiveCompanyList';
    static getPredectiveCompany = Constants.baseUrl + 'company-service/getPredectiveCompany';
    static providerReportWithoutEftAlbertaUrl = Constants.baseUrl + 'financial-payable-service/providerReportWithoutEftAlberta';
    static providerReportWithoutEftQuikcardUrl = Constants.baseUrl + 'hms-financial-report-service/providerReportWithoutEftQuikcard';
    static getUFTReportUrl = Constants.baseUrl + 'hms-financial-report-service/getUFTReport';
    static getExcelUFTReportUrl = Constants.baseUrl + 'financial-payable-service/getExcelUFTReport';
    static getUnpaidClaimsReportUrl = Constants.baseUrl + 'hms-financial-report-service/getUnpaidClaimsReport';
    static getProvincialTaxPayableSummaryReportUrl = Constants.baseUrl + 'hms-financial-report-service/getProvincialTaxPayableSummaryReport';
    static getBrokerCompanySummaryRepoprtUrl = Constants.baseUrl + 'hms-financial-report-service/getBrokerCompanySummaryRepoprt';
    static getFundingSummaryReportPdfUrl = Constants.baseUrl + 'financial-payable-service/getFundingSummaryReportPdf';
    static getFundingSummaryReportUrl = Constants.baseUrl + 'financial-payable-service/getFundingSummaryReport';
    static bankReconciliationReport = Constants.baseUrl + 'financial-payable-service/bankReconciliationReport';
    static getCompanyBalanceReportUrl = Constants.baseUrl + 'financial-payable-service/getCompanyBalanceReport';
    static getProviderDebitsUrl = Constants.baseUrl + 'hms-financial-report-service/getProviderDebits';
    static getFundingSummaryReportExcel = Constants.baseUrl + 'financial-payable-service/getFundingSummaryReportExcel';
    static getClaimStatusListURL = Constants.baseUrl + 'claim-service/getClaimStatusList';
    static getUnpaidClaimsReportExcel = Constants.baseUrl + 'financial-payable-service/getUnpaidClaimsReportExcel';
    static getExcelBrokerCompanySummaryReport = Constants.baseUrl + 'financial-payable-service/getExcelBrokerCompanySummaryReport';
    static getCompanyOpeningBalanceReportUrl = Constants.baseUrl + 'financial-payable-service/getCompanyOpeningBalanceReport';
    static debitProviderReportPdfUrl = Constants.baseUrl + 'financial-payable-service/debitProviderReportPdf';
    static debitProviderReportUrl = Constants.baseUrl + 'financial-payable-service/debitProviderReport';
    static refundPaymentSummaryReportPdfUrl = Constants.baseUrl + 'hms-financial-report-service/refundPaymentSummaryReportPdf';
    static refundPaymentSummaryReportExcelUrl = Constants.baseUrl + 'financial-payable-service/refundPaymentSummaryReportExcel';
    static getPaymentRunReportUrl = Constants.baseUrl + 'hms-financial-report-service/getPaymentRunReport';
    static paymentRunExcelUrl = Constants.baseUrl + 'financial-payable-service/paymentRunExcel';
    static cardHolderUtilizationReportUrl = Constants.baseUrl + 'financial-payable-service/cardHolderUtilizationReport';
    static getUtilizationStatisticsUrl = Constants.baseUrl + 'financial-payable-service/getUtilizationStatistics';
    static getUtilizationStatisticsGridDataUrl = Constants.baseUrl + 'hms-financial-report-service/getUtilizationStatisticsGridData';
    static getOverrideReportExcel = Constants.baseUrl + 'financial-payable-service/getOverrideReportExcel';
    static getExcelCardholderListReport = Constants.baseUrl + 'financial-payable-service/getExcelCardholderListReport';
    static brokerCommissionSummaryReport = Constants.baseUrl + 'financial-payable-service/brokerCommissionSummaryReport';
    static financeAttachFileUrl = Constants.baseUrl + 'financial-payable-service/attachFile';
    static deleteAttachFileUrl = Constants.baseUrl + 'financial-payable-service/deleteAttachFile';
    static getOverrideReportUrl = Constants.baseUrl + 'hms-financial-report-service/getOverrideReport';
    static getOverrideReportExcelUrl = Constants.baseUrl + 'financial-payable-service/getOverrideReportExcel';
    static getCardholderListReportUrl = Constants.baseUrl + 'hms-financial-report-service/getCardholderListReport';
    static getExcelCardholderListReportUrl = Constants.baseUrl + 'financial-payable-service/getExcelCardholderListReport';
    static getOverrideTypeListUrl = Constants.baseUrl + 'claim-service/getOverrideTypeList';
    static getCardholderNameForClaimPayment = Constants.baseUrl + 'hms-financial-report-service/getCardholderNameForClaimPayment/';
    static getDisciplineUrl = Constants.baseUrl + 'plan-service/getDiscipline';
    static getClaimListUrl = Constants.baseUrl + 'claim-service/getClaimTypeListByBusinessType';
    static getDentalProcedureListUrl = Constants.baseUrl + 'fee-guide-service/getDentalProcedureList';
    static brokerCommissionSummaryReportPdfUrl = Constants.baseUrl + 'hms-financial-report-service/brokerCommissionSummaryReportPdf';
    static brokerCommissionSummaryReportUrl = Constants.baseUrl + 'financial-payable-service/brokerCommissionSummaryReport';
    static planPredictiveSearch = Constants.baseUrl + 'hms-financial-report-service/getPlanPredictiveSearch';
    static divisionUtilizationReportUrl = Constants.baseUrl + 'hms-financial-report-service/divisionUtilizationReport';
    static divisionUtilizationReportExcelUrl = Constants.baseUrl + 'financial-payable-service/divisionUtilizationReportExcel';
    //  finance record save
    static generateAdjReceipt = Constants.baseUrl + 'financial-payable-service/generateAdjReceipt';
    /**Generate Broker Payment */
    static retrieveAllPending = Constants.baseUrl + 'financial-payable-service/retrieveAllPending';
    static brokerPendingData = Constants.baseUrl + 'financial-payable-service/brokerPendingData';
    static brokerPayable = Constants.baseUrl + 'financial-payable-service/brokerPayable';
    static generateCoRefundPayable = Constants.baseUrl + 'financial-payable-service/generateCoRefundPayable';
    static generatingEft = Constants.baseUrl + 'financial-payable-service/generatingEft';
    static generatingCoRefundEft = Constants.baseUrl + 'financial-payable-service/generatingCoRefundEft';
    static generatingCheque = Constants.baseUrl + 'financial-payable-service/generatingCheque';
    static exportCoRefundEft = Constants.baseUrl + 'financial-payable-service/exportCoRefundEft';
    static exportEft = Constants.baseUrl + 'financial-payable-service/exportEft';
    static brokerEftPaymentSummary = Constants.baseUrl + 'financial-payable-service/brokerEftPaymentSummary';
    static brokerPrintingCheques = Constants.baseUrl + 'financial-payable-service/brokerPrintingCheques';
    static brokerPaymentSummaryReport = Constants.baseUrl + 'financial-payable-service/brokerPaymentSummaryReport';
    static brokerChequeList = Constants.baseUrl + 'financial-payable-service/brokerChequeList';
    // Payable bank account
    static retrieveBankAccount = Constants.baseUrl + 'financial-payable-service/retrieveBankAccount';
    static getExcelReportForProvincialTaxPayableSummary = Constants.baseUrl + 'financial-payable-service/getExcelReportForProvincialTaxPayableSummary';
    static getCompanyBalanceReportExcel = Constants.baseUrl + 'financial-payable-service/getCompanyBalanceReportExcel';
    static providerExcelReportWithoutEftQuikCard = Constants.baseUrl + 'financial-payable-service/providerExcelReportWithoutEftQuikCard';
    static providerExcelReportWithoutEftAlberta = Constants.baseUrl + 'financial-payable-service/providerExcelReportWithoutEftAlberta';
    static getProviderDebitReportExcel = Constants.baseUrl + 'financial-payable-service/getProviderDebitReportExcel';
    static getOpeningBalanceExcelReportUrl = Constants.baseUrl + 'financial-payable-service/getOpeningBalanceExcelReport';
    static getUftReportListUrl = Constants.baseUrl + 'hms-financial-report-service/getUftReportList';
    static getUftReportListExcelUrl = Constants.baseUrl + 'financial-payable-service/getUftReportListExcel';
    static getAllPredectiveBrokerUrl = Constants.baseUrl + 'company-service/getAllPredectiveBroker';
    static exportExcelForUFTSearchUrl = Constants.baseUrl + 'financial-payable-service/exportExcelForUFTSearch';
    /** New APIs for Finance Reports */
    static getBrokerCommissionReport = Constants.baseUrl + 'hms-financial-report-service/getBrokerCommissionReport';
    static getBrokerCommissionReportExcel = Constants.baseUrl + 'financial-payable-service/getBrokerCommissionReportExcel';
    static qbciEligibilityAge65Report = Constants.baseUrl + 'hms-financial-report-service/qbciEligibilityAge65Report';
    static qbciEligibilityAge65ReportExcel = Constants.baseUrl + 'financial-payable-service/qbciEligibilityAge65ReportExcel';
    static qbciTravelEligibilityReport = Constants.baseUrl + 'hms-financial-report-service/qbciTravelEligibilityReport';
    static qbciTravelEligibilityReportExcel = Constants.baseUrl + 'financial-payable-service/qbciTravelEligibilityReportExcel';
    static qbciTravelEligibilityReportForTextFile = Constants.baseUrl + 'hms-financial-report-service/qbciTravelEligibilityReportForTextFile';
    static companyAnnualReportForTextFile = Constants.baseUrl + 'company-service/getAnnualReportOfCompany ';
    static qbciTravelEligibilityReconciliationReport = Constants.baseUrl + 'hms-financial-report-service/qbciTravelEligibilityReconciliationReport';
    static qbciTravelEligibilityReconciliationReportExcel = Constants.baseUrl + 'financial-payable-service/qbciTravelEligibilityReconciliationReportExcel';
    static qbciTravelEligibilityBankFile = Constants.baseUrl + 'hms-financial-report-service/qbciTravelEligibilityBankFile';
    static mailLabelReport = Constants.baseUrl + 'hms-financial-report-service/getAllComponentReport';
    static amountPaidReportUrl = Constants.baseUrl + 'hms-financial-report-service/amountPaidReport';
    static saveCompanyBankAccountUrl = Constants.baseUrl + 'company-service/addOrUpdateCompanyBankAccount';
    /*Get Postal Code Api for Payee in Refund Cheques*/
    static getPostalDetailUrl = Constants.baseUrl + 'company-service/getPostalDetail';
    static verifyPostalDetailUrl = Constants.baseUrl + 'company-service/verifyPostalDetail';
    static reAdjudicateClaimUrl = Constants.baseUrl + 'company-service/reAdjudicateClaimUrl';
    static reAdjudicateDashboardClaimUrl = Constants.baseUrl + 'claim-service/reAdjudicateClaim';
    static addEffectiveDateCompanyBankAccountUrl = Constants.baseUrl + 'company-service/addEffectiveDateCompanyBankAccount';
    static getUnitFinacialTransactionsByKeyFilterUrl = Constants.baseUrl + 'financial-payable-service/getUnitFinacialTransactionsByKeyFilter'
    static getMisMatchedItems     = Constants.baseUrl + 'financial-payable-service/getMisMatchedItems';
    static getQsiBankRecFiles     = Constants.baseUrl + 'financial-payable-service/getQsiBankRecFiles';
    static clearCIBCChequeFromFileRecord= Constants.baseUrl + 'financial-payable-service/clearCIBCChequeFromFileRecord';
    static getBankRecErrorLog = Constants.baseUrl + 'financial-payable-service/getBankRecErrorLog'
    static paymentForCHUrl = Constants.baseUrl + 'hms-financial-report-service/paymentForCH';
    static getPaymentForCHExcelReportUrl = Constants.baseUrl + 'financial-payable-service/getPaymentForCHExcelReport';
    static studentStatus = Constants.baseUrl + 'hms-financial-report-service/studentStatus';
    static amountPaidbyCoPlanQsi009 = Constants.baseUrl + 'hms-financial-report-service/amountPaidbyCoPlanQsi009';
    static amountPaidbyCoPlanQsi009Report = Constants.baseUrl + 'hms-financial-report-service/amountPaidbyCoPlanQsi009Report' // This added for QSI.009 report
    static studentStatusExcel = Constants.baseUrl + 'hms-financial-report-service/studentStatusReport';
    static getCardsByCompany = Constants.baseUrl + 'hms-financial-report-service/getCardsByCompany';
    static getCardsByCompanyExport = Constants.baseUrl + 'hms-financial-report-service/getCardsByCompanyExport';
    static brokerQsi = Constants.baseUrl + 'hms-financial-report-service/brokerQsi';
    static brokerQsiReport = Constants.baseUrl + 'hms-financial-report-service/brokerQsiReport';
    static claimPaymentsByCardholder = Constants.baseUrl + 'hms-financial-report-service/claimPaymentsByCardholder';
    static claimPaymentsByCardholderReport = Constants.baseUrl + 'hms-financial-report-service/claimPaymentsByCardholderReport';
    static getCardHolderMailingLabelsUrl = Constants.baseUrl + 'financial-payable-service/getCardHolderMailingLabels';
    static getCardHolderMailingLabelsReportUrl = Constants.baseUrl + 'financial-payable-service/getCardHolderMailingLabelsReport'
    static getBrokerMailingLabelsUrl = Constants.baseUrl + 'financial-payable-service/getBrokerMailingLabels'
    static getBrokerMailingLabelsReportUrl = Constants.baseUrl + 'financial-payable-service/getBrokerMailingLabelsReport'
    static getCompanyMailingLabelsUrl = Constants.baseUrl + 'financial-payable-service/getCompanyMailingLabels'
    static getCompanyMailingLabelsReportUrl = Constants.baseUrl + 'financial-payable-service/getCompanyMailingLabelsReport'
    static getServiceProviderMailingLabelsUrl = Constants.baseUrl + 'financial-payable-service/getServiceProviderMailingLabels'
    static getServiceProviderMailingReportUrl = Constants.baseUrl + 'financial-payable-service/getServiceProviderMailingReport'
    /* Summary by Company, Plan, Card and Coverage */
    static getSummaryByCompanyPlanCardAndCoverageUrl = Constants.baseUrl + 'financial-payable-service/getSummaryByCompanyPlanCardAndCoverage'
    static getSummaryByCompanyPlanCardAndCoverageReportUrl = Constants.baseUrl + 'financial-payable-service/getSummaryByCompanyPlanCardAndCoverageReport'
    /* Daily Pap generate eft API(22-Dec-2020)*/ 
    static generateDailyPapBatchUrl = Constants.baseUrl + 'financial-payable-service/generateDailyPapBatch'
    /* Plan Comment List API in Call-In Dashboard(25-Ja-2021) */ 
    static planCommentListUrl = Constants.baseUrl + 'plan-service/planCommentList'
    /* Bank Reconcilation : Openong Balance Report */
    static getBankReconChqReportExcelUrl = Constants.baseUrl + 'financial-payable-service/getBankReconChqReportExcel' 
    static getPayableRptUrl = Constants.baseUrl + 'financial-payable-service/getPayableRpt'
    static generatePayableRptZipUrl = Constants.baseUrl + 'financial-payable-service/generatePayableRptZip'
    /* Log #1027 : API's */
    static getTerminationRefundUrl = Constants.baseUrl + 'financial-payable-service/getTerminationRefund'
    static generateTerminRefundExcelUrl = Constants.baseUrl + 'financial-payable-service/generateTerminRefundExcel'
    static updateCoGracePeriodUrl = Constants.baseUrl + 'financial-payable-service/updateCoGracePeriod'
    static deleteCompanyUrl = Constants.baseUrl + 'company-service/deleteCompany'
    /* Log #1061: API's*/ 
    static getPredictiveCoAkiraBenefitUrl = Constants.baseUrl + 'company-service/getPredictiveCoAkiraBenefit'
    static dirtyCardListForAkiraBenefitUrl = Constants.baseUrl + 'hms-financial-report-service/dirtyCardListForAkiraBenefit'
    static akiraBenefitDirtyDataExcelUrl = Constants.baseUrl + 'hms-financial-report-service/akiraBenefitDirtyDataExcel'
    // 29 jul
    static educationalStatusLetter = Constants.baseUrl + 'financial-payable-service/educationalStatusLetter'
    static educationalStatusLetterExcel = Constants.baseUrl + 'financial-payable-service/educationalStatusLetterExcel'
    /* Service Provider List API's Integration(02-Aug-2021) */ 
    static serviceProviderReportUrl = Constants.baseUrl + 'financial-payable-service/serviceProviderReport'
    static serviceProviderReportExcelUrl = Constants.baseUrl + 'financial-payable-service/serviceProviderReportExcel'
    /* Card Count By Company Report API's(14-Aug-2021) */ 
    static cardCountByCompanyUrl = Constants.baseUrl + 'financial-payable-service/cardCountByCompany'
    static cardCountByCompanyExcelUrl = Constants.baseUrl + 'financial-payable-service/cardCountByCompanyExcel'
    /* amountPaidByCompanyPlanCv API(23-Aug-2021) */
    static amountPaidByCompanyPlanCvUrl = Constants.baseUrl + 'financial-payable-service/amountPaidByCompanyPlanCv' 
    static amountPaidByCompanyPlanCvExcelUrl = Constants.baseUrl + 'financial-payable-service/amountPaidByCompanyPlanCvExcel' 
    // Log #1149: New API(03-Dec-2021)
    static coTRStatusUrl = Constants.baseUrl + 'financial-payable-service/coTRStatus'
    static getPendingElectronicPayAdjUrl = Constants.baseUrl + 'financial-payable-service/getPendingElectronicPayAdj'
    static getAdjustmentRequestUrl = Constants.baseUrl + 'financial-payable-service/getAdjustmentRequest'
    static generateAdjReqReportUrl = Constants.baseUrl + 'financial-payable-service/generateAdjReqReport'
    static pendingELPayAdjRptUrl = Constants.baseUrl + 'financial-payable-service/pendingELPayAdjRpt'
    // Negative Transaction List API(13-Jun-2022)
    static negativeTransactionsUrl = Constants.baseUrl + 'financial-payable-service/negativeTransactions'
    static getAdjReceiptUrl = Constants.baseUrl + 'financial-payable-service/getAdjReceipt'
    /* Finance Dashboard -Payables tab- Receivables List -Cash Adj/Adj Req btn API's*/
    static generateAdjRequestUrl = Constants.baseUrl + 'financial-payable-service/genAdjustmentRequest'
    static generateCashAdjRequestUrl = Constants.baseUrl + 'financial-payable-service/genCashAdjustment'
    static getAllAdjClaimData = Constants.baseUrl + 'financial-payable-service/getAllAdjClaimData'
    static compareReceivableListUrl = Constants.baseUrl + 'financial-payable-service/compareReceivableList'
    // Receivable List - Receipt Excel and Negative Transactions Excel(26-Sep-2022)
    static receiptExcelUrl = Constants.baseUrl + 'financial-payable-service/receiptExcel'
    static negativeTransactionExcelUrl = Constants.baseUrl + 'financial-payable-service/negativeTransactionExcel' 
    static printingELStatementUrl = Constants.baseUrl + 'financial-payable-service/printingELStatement'
    static printingChqPaymentStatementUrl = Constants.baseUrl + 'financial-payable-service/printingChqPaymentStatement'
    static generatingBkReportsUrl = Constants.baseUrl + 'financial-payable-service/generatingBkReports'
    static printingELPaymentStatementUrl = Constants.baseUrl + 'financial-payable-service/printingELPaymentStatement'
    static pfOclExbFnCmpyUrl = Constants.baseUrl + 'financial-payable-service/pfOclExbFnCmpy';
    static notificationGenFnExcelUrl = Constants.baseUrl + 'financial-payable-service/notificationGenFnExcel'

    // #1151 API for Letter generation(17-Jun-2024)
    static paTerminLetterUrl = Constants.baseUrl + 'financial-payable-service/paTerminLetter'
}