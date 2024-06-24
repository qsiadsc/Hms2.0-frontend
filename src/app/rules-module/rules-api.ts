import {Constants } from '../common-module/Constants';

export class RulesApi {  
  static rulesSearchUrl = Constants.baseUrl + 'service-prov-service/getRuleSearchResult';
  static addRuleUrl = Constants.baseUrl + 'service-prov-service/saveServiceProviderRule';
  static getProviderRuleExecutionPointList = Constants.baseUrl + 'service-prov-service/getProviderRuleExecutionPointList';
  static getProviderRuleTypeList = Constants.baseUrl + 'service-prov-service/getRuleTypeList';
  static getProviderRuleExecutionOrderList = Constants.baseUrl + 'service-prov-service/getProviderRuleExecutionOrderList';
  static getRuleByRuleKey = Constants.baseUrl + 'service-prov-service/getServiceProviderRule';
}