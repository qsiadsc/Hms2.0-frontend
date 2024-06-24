import {Constants } from '../common-module/Constants';

export class FinanceApi {
    static companySearchUrl = Constants.baseUrl + 'company-service/companySearch';
    static searchTransactionCodeUrl=Constants.baseUrl + 'financial-payable-service/searchTransactionCode';
    static getPredectiveTransactionCode=Constants.baseUrl + 'financial-payable-service/getPredectiveTransactionCode';
    static getPredectiveProvinceCode=Constants.baseUrl + 'financial-payable-service/getPredectiveProvinceCode';
    static saveUpdateTransactionCodeUrl=Constants.baseUrl + 'financial-payable-service/saveUpdateTransactionCode'
    static getTransactionCodeUrl=Constants.baseUrl + 'financial-payable-service/getTransactionCode'
    static getTransactionSearchFilterDataUrl=Constants.baseUrl + 'financial-payable-service/getTransactionSearchFilterData'
    static getTransactionSearchFilterData=Constants.baseUrl + 'financial-payable-service/getTransactionSearchFilterData'
    static getTransactionDetailBasedOnPaymentKeyUrl=Constants.baseUrl + 'financial-payable-service/getTransactionDetailBasedOnPaymentKey'
    //Tax Rate
    static taxRateSearchUrl = Constants.baseUrl + 'financial-payable-service/taxRateSearch'
    static addUpdateTaxRatesUrl = Constants.baseUrl + 'financial-payable-service/addUpdateTaxRates'
    static getTaxMasterUrl = Constants.baseUrl + 'financial-payable-service/getTaxMaster'
    static getTaxRateUrl = Constants.baseUrl + 'financial-payable-service/getTaxRate'
    static deleteTaxRateUrl=Constants.baseUrl + 'financial-payable-service/deleteTaxRate'

    /* Transaction-Search */
    static getTransactionStatusUrl=Constants.baseUrl +'financial-payable-service/getTransactionStatus'
    static getPayeeTypesUrl=Constants.baseUrl + 'claim-service/getPayeeTypes'
    static getApplicableAddrs = Constants.baseUrl + 'financial-payable-service/getApplicableAddress'
    static getTransactionTypeUrl=Constants.baseUrl + 'financial-payable-service/getTransactionType'
    static getBusinessTypeUrl=Constants.baseUrl + 'company-service/getBusinessType'
    static getAttachedClaimsUrl=Constants.baseUrl+'financial-payable-service/getAttachedClaims'
    static getPaymentDetailBasedOnPaymentKey   =Constants.baseUrl+'financial-payable-service/getPaymentDetailBasedOnPaymentKey   '
    static transactionSearchFilterDataReportUrl= Constants.baseUrl +'financial-payable-service/transactionSearchFilterDataReport'

    //Generate Payment
    static getSystemParameter = Constants.baseUrl + 'financial-payable-service/getSystemParameter'
    static checkingParams = Constants.baseUrl + 'financial-payable-service/checkingParams'
    static totalPayableClaims = Constants.baseUrl + 'financial-payable-service/totalPayableClaims'
    static generatingPayable = Constants.baseUrl + 'financial-payable-service/generatingPayable'
    static errorClaimsList = Constants.baseUrl + 'financial-payable-service/errorClaimsList'
    static generatingEftRecords = Constants.baseUrl + 'financial-payable-service/generatingEftRecords'
    static generatingChequeRecords = Constants.baseUrl + 'financial-payable-service/generatingChequeRecords'
    static exportingEftFile = Constants.baseUrl + 'financial-payable-service/exportingEftFile';
    static exportingPayableEftFile = Constants.baseUrl + 'financial-payable-service/exportingPayableEftFile'
    static finacialAdminInfoSearch = Constants.baseUrl + 'financial-payable-service/printingCheque'
    static generatingReports = Constants.baseUrl + 'financial-payable-service/generatingReports'

     // api to get list 
    static payableTransactions = Constants.baseUrl +'financial-payable-service/payableTransactions'
    static payableTransactionsExcel = Constants.baseUrl +'financial-payable-service/payableTransactionsExcel'
    static commanEft = Constants.baseUrl +'financial-payable-service/generateBkSummary'
    static PayableSummary = Constants.baseUrl +'financial-payable-service/generatePayableSummary'
    static CoRefundSummary = Constants.baseUrl +'financial-payable-service/generateCoRefundSummary'
    static CoRefundChq = Constants.baseUrl +'financial-payable-service/generatingCoRefundCheque'


    /* Originator */ 
    static searchOriginatorUrl = Constants.baseUrl + 'financial-payable-service/searchOriginator';
    static getOriginatorDetailsUrl = Constants.baseUrl + 'financial-payable-service/getOriginatorDetails';
    static saveUpdateOriginatorUrl = Constants.baseUrl + 'financial-payable-service/saveUpdateOriginator';
    static deleteOriginatorUrl = Constants.baseUrl + 'financial-payable-service/deleteOriginator';
    /* Originator */ 
    static getDisciplineUrl = Constants.baseUrl + 'plan-service/getDiscipline';    

    /*Unattached Claims */
    static searchUnattachedClaim = Constants.baseUrl + 'financial-payable-service/searchUnattachedClaim';    
    static detachClaim = Constants.baseUrl + 'financial-payable-service/detachClaim';   
    static attachClaim = Constants.baseUrl + 'financial-payable-service/attachClaim';    
    static getAttachedClaims = Constants.baseUrl + 'financial-payable-service/getAttachedClaims';    
    static generateStaleCheque = Constants.baseUrl + 'financial-payable-service/generateStaleCheque';    
    static cancelChequeApi = Constants.baseUrl + 'financial-payable-service/cancelChequeApi';    
    static cancelAndReissueChequeApi = Constants.baseUrl + 'financial-payable-service/cancelAndReissueChequeApi';    
    static stopAndCancelApi = Constants.baseUrl + 'financial-payable-service/stopAndCancelApi';    
    static cashReceipt = Constants.baseUrl + 'financial-payable-service/cashReceipt';    

    // #1137:   API for payment search screen
    static getAdjPaymentSearchUrl = Constants.baseUrl + 'financial-payable-service/getAdjPaymentSearch'
    static getAdvanceAdjPaymentDetailUrl = Constants.baseUrl + 'financial-payable-service/getAdvanceAdjPaymentDetail'
    static getAdjPaymentClaimsDetailUrl = Constants.baseUrl + 'financial-payable-service/getAdjPaymentClaimsDetail'
    static adjPaymentSearchReportUrl = Constants.baseUrl + 'financial-payable-service/adjPaymentSearchReport'
    static getAdvAdjPaymentSearchDetailUrl = Constants.baseUrl + 'financial-payable-service/getAdvAdjPaymentSearchDetail'

    // API's for Reissue Payment Button
    static reissuePaymentTransUrl = Constants.baseUrl + 'financial-payable-service/reissuePaymentTrans'
    static getReissuePaymentTransUrl = Constants.baseUrl + 'financial-payable-service/getReissuePaymentTrans'
    static getReversePayPaymentUrl = Constants.baseUrl + 'financial-payable-service/getReversePayPayment'
    static brokerReissuePaymentUrl = Constants.baseUrl + 'financial-payable-service/brokerReissuePayment'
    // New API for Pending Electronics Adjustment Tab(31-Jan-2023)
    static pendingELPayTransUrl = Constants.baseUrl + 'financial-payable-service/pendingELPayTrans'
}