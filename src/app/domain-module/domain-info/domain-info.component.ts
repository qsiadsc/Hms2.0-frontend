import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { DomainApi } from '../domain-api';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { debug } from 'util';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { ActivatedRoute, Params } from '@angular/router';
import { Domain } from 'domain';
import { CompleterData, CompleterService, RemoteData, CompleterItem } from 'ng2-completer';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';



@Component({
  selector: 'app-domain-info',
  templateUrl: './domain-info.component.html',
  styleUrls: ['./domain-info.component.css'],
  providers: [ChangeDateFormatService, DatatableService]

})
export class DomainInfoComponent implements OnInit {

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions
  observableObj;
  check = true;
  columns = [];
  dateNameArray = {};
  expired = false;
  reload: boolean = false;
  addDomainInfo: FormGroup;
  addMesssageForm: FormGroup;
  addProviderSpecialityForm: FormGroup;
  addMouthToothForm: FormGroup;
  addMouthSiteForm: FormGroup;
  error: any
  buttonText: string;
  addMode: boolean = true;
  viewMode: boolean = false;
  editMode: boolean = false;
  addDomainUrl: string = "";
  key: any;
  editDomainUrl: string = "";
  getDomainListUrl: string = "";
  deleteDomainUrl: string = "";
  showLoader: boolean = false;
  typeCd: any;
  typeDesc: any;
  expiredOn: any;
  domainDelKey: any;
  masterKey: any;
  messageScreen: boolean = false
  addModeMsg = true
  editModeMsg = false
  msgDescEng: any;
  msgDescFre: any
  messageDelKey: any
  cardMailoutType: boolean = false;
  domainHeading: string = ''
  transactionCode: boolean = false
  yearType: boolean = false
  claimType: boolean = false
  claimStatus: boolean = false
  dentalProviderSpecialty: boolean = false
  deductibleType: boolean = false
  maximumType: boolean = false
  maxPeriodType: boolean = false
  HSAMaxType: boolean = false
  HSAMaxPeriodType: boolean = false
  HSACoverageCategory: boolean = false
  ruleExecutionPoint: boolean = false
  ruleExecutionOrder: boolean = false
  drugProvSpecialtyType: boolean = false
  toothCode: boolean = false
  dentalPracticeType: boolean = false
  visionPracticeType: boolean = false
  healthPracticeType: boolean = false
  drugPracticeType: boolean = false
  wellnessPracticeType: boolean = false
  payeeType: boolean = false
  prorateType: boolean = false
  transactionType: boolean = false
  transactionStatus: boolean = false
  terminationCategory: boolean = false
  discipline: boolean = false
  wellnessProviderSpecialty: boolean = false
  mouthTooth: boolean = false
  mouthSite: boolean = false
  visionProviderSpecialty: boolean = false
  healthProviderSpecialty: boolean = false

  specialTypeList;
  public specialTypeData: CompleterData;
  arrayOfSpecilatyType = [];
  itemStart = 0
  suspendedCheck;
  public dentalSpecialtyTypeRemote: RemoteData;
  public dentalSpecialtyGroupRemote: RemoteData
  public dentalProviderTypeRemote: RemoteData;
  public wellnessSpecialtyTypeRemote: RemoteData;
  public wellnessSpecialtyGroupRemote: RemoteData;
  public wellnessProviderTypeRemote: RemoteData;
  public toothCodeRemote: RemoteData;
  public mouthSiteRemote: RemoteData
  public visionSpecialtyTypeRemote: RemoteData
  public healthSpecialtyTypeRemote: RemoteData
  specialtyTypeKey: any
  specialtyGroupKey: any
  providerTypeKey: any
  provSpecialId: any
  provSpecialDesc: any
  specialtyTypeKeys: any
  specialtyTypeDesc: any
  provSpecialGroupKey: any
  provSpecialGroupDesc: any
  provTypeKey: any
  provTypeDesc: any
  comment
  toothCodeKey: any
  mouthSiteKey: any
  toothId: any
  mouthSiteId: any
  toothDesc: any
  mouthDesc: any
  mouthId: any;
  mouthsiteSiteId: any
  effective: any
  allowSurface;


  constructor(private translate: TranslateService,
    private dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private route: ActivatedRoute,
    private completerService: CompleterService) {
    this.error = { error: false, errorMessage: '' }
    this.route.queryParams.subscribe((params: Params) => {
      this.masterKey = params.tableCd;
      this.domainHeading = params.name
    });

    // Dental Specialty Type
    this.dentalSpecialtyTypeRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.dentalSpecialtyTypeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dentalSpecialtyTypeRemote.urlFormater((term: any) => {
      return DomainApi.getPredDentSpecTypeUrl + `/${term}`;
    });
    this.dentalSpecialtyTypeRemote.dataField('result');

    // Dental Specialty Group
    this.dentalSpecialtyGroupRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.dentalSpecialtyGroupRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dentalSpecialtyGroupRemote.urlFormater((term: any) => {
      return DomainApi.getPredSpecGrpUrl + `/${term}`;
    });
    this.dentalSpecialtyGroupRemote.dataField('result');

    // Dental Provider Type
    this.dentalProviderTypeRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.dentalProviderTypeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dentalProviderTypeRemote.urlFormater((term: any) => {
      return DomainApi.getPredProvTypeUrl + `/${term}`;
    });
    this.dentalProviderTypeRemote.dataField('result');

    // Wellness Specialty Type
    this.wellnessSpecialtyTypeRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.wellnessSpecialtyTypeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.wellnessSpecialtyTypeRemote.urlFormater((term: any) => {
      return DomainApi.getPredWellSpecialtyTypeUrl + `/${term}`;
    });
    this.wellnessSpecialtyTypeRemote.dataField('result');

    // Wellness Specialty Group
    this.wellnessSpecialtyGroupRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.wellnessSpecialtyGroupRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.wellnessSpecialtyGroupRemote.urlFormater((term: any) => {
      return DomainApi.getPredWellGrpUrl + `/${term}`;
    });
    this.wellnessSpecialtyGroupRemote.dataField('result');

    // Wellness Provider Type
    this.wellnessProviderTypeRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.wellnessProviderTypeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.wellnessProviderTypeRemote.urlFormater((term: any) => {
      return DomainApi.getPredWellProvTypeUrl + `/${term}`;
    });
    this.wellnessProviderTypeRemote.dataField('result');

    // Tooth Code
    this.toothCodeRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.toothCodeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.toothCodeRemote.urlFormater((term: any) => {
      return DomainApi.getPredToothCodeUrl + `/${term}`;
    });
    this.toothCodeRemote.dataField('result');

    // Mouth Site
    this.mouthSiteRemote = completerService.remote(
      null,
      "key,mouthId",
      "mouthId"
    );
    this.mouthSiteRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.mouthSiteRemote.urlFormater((term: any) => {
      return DomainApi.getPredMouthSiteUrl + `/${term}`;
    });
    this.mouthSiteRemote.dataField('result');

    // Vision Specialty Type
    this.visionSpecialtyTypeRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.visionSpecialtyTypeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.visionSpecialtyTypeRemote.urlFormater((term: any) => {
      return DomainApi.getPredVisSpecialtyTypeUrl + `/${term}`;
    });
    this.visionSpecialtyTypeRemote.dataField('result');

    // Health Specialty Type
    this.healthSpecialtyTypeRemote = completerService.remote(
      null,
      "key,typeDescription",
      "typeDescription"
    );
    this.healthSpecialtyTypeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.healthSpecialtyTypeRemote.urlFormater((term: any) => {
      return DomainApi.getPredHlthSpecialtyTypeUrl + `/${term}`;
    });
    this.healthSpecialtyTypeRemote.dataField('result');

  }


  ngOnInit() {
    this.dataTableInitialize();
    this.buttonText = this.translate.instant('common.save');
    this.addDomainInfo = new FormGroup({
      'typeCd': new FormControl('', [Validators.required, Validators.maxLength(10)]),
      'typeDescription': new FormControl('', [Validators.required, Validators.maxLength(79)]),
      'effectiveOn': new FormControl(''),
      'expiredOn': new FormControl(''),
      'allowSurface': new FormControl('', Validators.maxLength(5)),
      'comment': new FormControl('', Validators.maxLength(79)),
      'suspended': new FormControl(''),
    })

    this.addMesssageForm = new FormGroup({
      'messageEng': new FormControl('', [Validators.required, Validators.maxLength(79)]),
      'messageFre': new FormControl('', [Validators.required, Validators.maxLength(79)]),
      'expiredOn': new FormControl('')
    })

    this.addProviderSpecialityForm = new FormGroup({
      'specialtyType': new FormControl('', Validators.required),
      'specialtyGroup': new FormControl('', Validators.required),
      'providerType': new FormControl(''),
      'specialtyId': new FormControl('', Validators.required),
      'specialtyDescription': new FormControl('', [Validators.required, Validators.maxLength(79)]),
      'expiredOn': new FormControl('')
    })

    this.addMouthToothForm = new FormGroup({
      'toothCode': new FormControl('', Validators.required),
      'mouthSite': new FormControl('', Validators.required),
      'expiredOn': new FormControl('')
    })

    this.addMouthSiteForm = new FormGroup({
      'mouthId': new FormControl('', [Validators.required, Validators.maxLength(30)]),
      'mouthSiteId': new FormControl('', [Validators.required, Validators.maxLength(3), CustomValidators.onlyNumbers]),
      'effectiveOn': new FormControl(''),
      'expiredOn': new FormControl('')
    })

    if (this.masterKey == 284) {
      this.getDomainListUrl = DomainApi.getBenefitDrugCovCatListingUrl;
      this.addDomainUrl = DomainApi.addBenefitDrugCovCatUrl
      this.editDomainUrl = DomainApi.editBenefitDrugCovCatUrl
      this.deleteDomainUrl = DomainApi.deleteBenefitDrugCovCatUrl
    } else if (this.masterKey == 282) {
      this.getDomainListUrl = DomainApi.getBenefitDentalCovCatListingUrl
      this.addDomainUrl = DomainApi.addBenefitDentalCovCatUrl
      this.editDomainUrl = DomainApi.editBenefitDentalCovCatUrl
      this.deleteDomainUrl = DomainApi.deleteBenefitDentalCovCatUrl
    } else if (this.masterKey == 285) {
      this.getDomainListUrl = DomainApi.getBenefitHealthCovCatListingUrl
      this.addDomainUrl = DomainApi.addBenefitHealthCovCatUrl
      this.editDomainUrl = DomainApi.editBenefitHealthCovCatUrl
      this.deleteDomainUrl = DomainApi.deleteBenefitHealthCovCatUrl
    } else if (this.masterKey == 283) {
      this.getDomainListUrl = DomainApi.getBenefitVisionCovCatListingUrl
      this.addDomainUrl = DomainApi.addBenefitVisionCovCatUrl
      this.editDomainUrl = DomainApi.editBenefitVisionCovCatUrl
      this.deleteDomainUrl = DomainApi.deleteBenefitVisionCovCatUrl
    } else if (this.masterKey == 268) {
      this.getDomainListUrl = DomainApi.getCobTypeListUrl
      this.addDomainUrl = DomainApi.addCobTypeUrl
      this.editDomainUrl = DomainApi.editCobTypeUrl
      this.deleteDomainUrl = DomainApi.deleteCobTypeUrl
    } else if (this.masterKey == 298) {
      this.getDomainListUrl = DomainApi.getCardTypesUrl
      this.addDomainUrl = DomainApi.addCardTypeUrl
      this.editDomainUrl = DomainApi.editCardTypeUrl
      this.deleteDomainUrl = DomainApi.deleteCardTypeUrl
    } else if (this.masterKey == 334) {
      this.cardMailoutType = true
      this.getDomainListUrl = DomainApi.getCardMailoutTypeUrl
      this.addDomainUrl = DomainApi.addCardMailoutTypeUrl
      this.editDomainUrl = DomainApi.editCardMailoutTypeUrl
      this.deleteDomainUrl = DomainApi.deleteCardMailoutTypeUrl
    } else if (this.masterKey == 296) {
      this.getDomainListUrl = DomainApi.getCardholderRolesUrl
      this.addDomainUrl = DomainApi.addCardholderRoleUrl
      this.editDomainUrl = DomainApi.editCardholderRoleUrl
      this.deleteDomainUrl = DomainApi.deleteCardholderRoleUrl
    } else if (this.masterKey == 278) {
      this.getDomainListUrl = DomainApi.getDentalCovCategorysUrl
      this.addDomainUrl = DomainApi.addDentalCovCategoryUrl
      this.editDomainUrl = DomainApi.editDentalCovCategoryUrl
      this.deleteDomainUrl = DomainApi.deleteDentalCovCategoryUrl
    } else if (this.masterKey == 281) {
      this.getDomainListUrl = DomainApi.getHealthCovCategorysUrl
      this.addDomainUrl = DomainApi.addHealthCovCategoryUrl
      this.editDomainUrl = DomainApi.editHealthCovCategoryUrl
      this.deleteDomainUrl = DomainApi.deleteHealthCovCategoryUrl
    } else if (this.masterKey == 279) {
      this.getDomainListUrl = DomainApi.getVisionCovCategorysUrl
      this.addDomainUrl = DomainApi.addVisionCovCategoryUrl
      this.editDomainUrl = DomainApi.editVisionCovCategoryUrl
      this.deleteDomainUrl = DomainApi.deleteVisionCovCategoryUrl
    } else if (this.masterKey == 280) {
      this.getDomainListUrl = DomainApi.getDrugCovCategorysUrl
      this.addDomainUrl = DomainApi.addDrugCovCategoryUrl
      this.editDomainUrl = DomainApi.editDrugCovCategoryUrl
      this.deleteDomainUrl = DomainApi.deleteDrugCovCategoryUrl
    } else if (this.masterKey == 418) { //Wellness Coverage Category
      this.getDomainListUrl = DomainApi.getWellnessCovCategorysUrl
      this.addDomainUrl = DomainApi.addWellnessCovCategoryUrl
      this.editDomainUrl = DomainApi.editWellnessCovCategoryUrl
      this.deleteDomainUrl = DomainApi.deleteWellnessCovCategoryUrl
    } else if (this.masterKey == 417) { //Dental Specialty Type
      this.getDomainListUrl = DomainApi.getDentalSpecialtyTypeUrl
      this.addDomainUrl = DomainApi.addDentalSpecialtyTypeUrl
      this.editDomainUrl = DomainApi.editDentalSpecialtyTypeUrl
      this.deleteDomainUrl = DomainApi.deleteDentalSpecialtyTypeUrl
    } else if (this.masterKey == 333) {
      this.getDomainListUrl = DomainApi.getHealthSpecialtyTypeUrl
      this.addDomainUrl = DomainApi.addHealthSpecialtyTypeUrl
      this.editDomainUrl = DomainApi.editHealthSpecialtyTypeUrl
      this.deleteDomainUrl = DomainApi.deleteHealthSpecialtyTypeUrl
    } else if (this.masterKey == 295) {
      this.getDomainListUrl = DomainApi.getVisionSpecialtyTypeUrl
      this.addDomainUrl = DomainApi.addVisionSpecialtyTypeurl
      this.editDomainUrl = DomainApi.editVisionSpecialtyTypeUrl
      this.deleteDomainUrl = DomainApi.deleteVisionSpecialtyTypeUrl
    } else if (this.masterKey == 419) { //Wellness Specialty Type
      this.getDomainListUrl = DomainApi.getWellnessSpecialtyTypeUrl
      this.addDomainUrl = DomainApi.addWellnessSpecialtyTypeUrl
      this.editDomainUrl = DomainApi.editWellnessSpecialtyTypeUrl
      this.deleteDomainUrl = DomainApi.deleteWellnessSpecialtyTypeUrl
    } else if (this.masterKey == 416) { //Dental Specialty Group
      this.getDomainListUrl = DomainApi.getDentalSpecialtyGroupUrl
      this.addDomainUrl = DomainApi.addDentalSpecialtyGroupUrl
      this.editDomainUrl = DomainApi.editDentalSpecialtyGroupUrl
      this.deleteDomainUrl = DomainApi.deleteDentalSpecialtyGroupUrl
    } else if (this.masterKey == 420) { //Wellness Specialty Group
      this.getDomainListUrl = DomainApi.getWellnessSpecialtyGroupUrl
      this.addDomainUrl = DomainApi.addWellnessSpecialtyGroupUrl
      this.editDomainUrl = DomainApi.editWellnessSpecialtyGroupUrl
      this.deleteDomainUrl = DomainApi.deleteWellnessSpecialtyGroupUrl
    } else if (this.masterKey == 433) {
      this.messageScreen = true
      this.getDomainListUrl = DomainApi.getMessagesUrl
      this.addDomainUrl = DomainApi.addMessageUrl
      this.editDomainUrl = DomainApi.editMessageUrl
      this.deleteDomainUrl = DomainApi.deleteMessageUrl
    } else if (this.masterKey == 271) { //Year Type
      this.yearType = true
      this.getDomainListUrl = DomainApi.getYearTypeListUrl
      this.addDomainUrl = DomainApi.addEditYearTypeUrl
      this.editDomainUrl = DomainApi.addEditYearTypeUrl
      this.deleteDomainUrl = DomainApi.deleteYearTypeUrl
    } else if (this.masterKey == 311) { // Transaction Code
      this.transactionCode = true
      this.getDomainListUrl = DomainApi.getTransactionCodeListUrl
      this.addDomainUrl = DomainApi.saveUpdateTransactionCodeUrl
      this.editDomainUrl = DomainApi.saveUpdateTransactionCodeUrl
      this.deleteDomainUrl = DomainApi.deleteTransactionCodeUrl
    } else if (this.masterKey == 413) { // Claim Type
      this.claimType = true
      this.getDomainListUrl = DomainApi.getListClaimTypeUrl
      this.addDomainUrl = DomainApi.addEditClaimTypeUrl
      this.editDomainUrl = DomainApi.addEditClaimTypeUrl
      this.deleteDomainUrl = DomainApi.deleteClaimTypeUrl
    } else if (this.masterKey == 414) { // Claim Status
      this.claimStatus = true
      this.getDomainListUrl = DomainApi.getListClaimStatusUrl
      this.addDomainUrl = DomainApi.addEditClaimStatusUrl
      this.editDomainUrl = DomainApi.addEditClaimStatusUrl
      this.deleteDomainUrl = DomainApi.deleteClaimStatusUrl
    } else if (this.masterKey == 305) { // Dental Provider Specialty
      this.dentalProviderSpecialty = true
      this.getDomainListUrl = DomainApi.getListDentalProviderSpecialtyUrl
      this.addDomainUrl = DomainApi.addEditDentalProviderSpecialtyUrl
      this.editDomainUrl = DomainApi.addEditDentalProviderSpecialtyUrl
      this.deleteDomainUrl = DomainApi.deleteDentalProviderSpecialtyUrl
    } else if (this.masterKey == 270) { // Deductible Type
      this.deductibleType = true
      this.getDomainListUrl = DomainApi.getListDeductibleTypeUrl
      this.addDomainUrl = DomainApi.addEditDeductibleTypeUrl
      this.editDomainUrl = DomainApi.addEditDeductibleTypeUrl
      this.deleteDomainUrl = DomainApi.deleteDeductibleTypeUrl
    } else if (this.masterKey == 272) { // Maximum Type
      this.maximumType = true
      this.getDomainListUrl = DomainApi.getListMaximumTypeURL
      this.addDomainUrl = DomainApi.addEditMaximumTypeUrl
      this.editDomainUrl = DomainApi.addEditMaximumTypeUrl
      this.deleteDomainUrl = DomainApi.deleteMasteMaximumType
    } else if (this.masterKey == 273) { // Max Period Type
      this.maxPeriodType = true
      this.getDomainListUrl = DomainApi.getListMaxPeriodTypeUrl
      this.addDomainUrl = DomainApi.addEditMaxPeriodTypeUrl
      this.editDomainUrl = DomainApi.addEditMaxPeriodTypeUrl
      this.deleteDomainUrl = DomainApi.deleteMaxPeriodTypeUrl
    } else if (this.masterKey == 395) {
      this.HSAMaxType = true
      this.getDomainListUrl = DomainApi.getListHsaMaxTypeUrl
      this.addDomainUrl = DomainApi.addEditHsaMaxTypeUrl
      this.editDomainUrl = DomainApi.addEditHsaMaxTypeUrl
      this.deleteDomainUrl = DomainApi.deleteHsaMaxTypeUrl
    } else if (this.masterKey == 394) { // HSA Max Period Type
      this.HSAMaxPeriodType = true
      this.getDomainListUrl = DomainApi.getListHsaMaxPeriodTypeUrl
      this.addDomainUrl = DomainApi.addEditHsaMaxPeriodTypeUrl
      this.editDomainUrl = DomainApi.addEditHsaMaxPeriodTypeUrl
      this.deleteDomainUrl = DomainApi.deleteHsaMaxPeriodTypeUrl
    } else if (this.masterKey == 393) { // HSA Coverage Category
      this.HSACoverageCategory = true
      this.getDomainListUrl = DomainApi.getListHsaCoverageCategoryUrl
      this.addDomainUrl = DomainApi.addEditHsaCoverageCategoryUrl
      this.editDomainUrl = DomainApi.addEditHsaCoverageCategoryUrl
      this.deleteDomainUrl = DomainApi.deleteHsaCoverageCategoryUrl
    } else if (this.masterKey == 307) { // Rule Execution Point
      this.ruleExecutionPoint = true
      this.getDomainListUrl = DomainApi.getListRuleExecutionPointUrl
      this.addDomainUrl = DomainApi.addEditRuleExecutionPointUrl
      this.editDomainUrl = DomainApi.addEditRuleExecutionPointUrl
      this.deleteDomainUrl = DomainApi.deleteRuleExecutionPointUrl
    } else if (this.masterKey == 306) { // Rule Execution Order
      this.ruleExecutionOrder = true
      this.getDomainListUrl = DomainApi.getListRuleExecutionOrderUrl
      this.addDomainUrl = DomainApi.addEditRuleExecutionOrderUrl
      this.editDomainUrl = DomainApi.addEditRuleExecutionOrderUrl
      this.deleteDomainUrl = DomainApi.deleteRuleExecutionOrderUrl
    } else if (this.masterKey == 291) { // Drug Prov Specialty Type 
      this.drugProvSpecialtyType = true
      this.getDomainListUrl = DomainApi.getListDrugProvSpecialtyTypeUrl
      this.addDomainUrl = DomainApi.addEditDrugProvSpecialtyTypeUrl
      this.editDomainUrl = DomainApi.addEditDrugProvSpecialtyTypeUrl
      this.deleteDomainUrl = DomainApi.deleteDrugProvSpecialtyTypeUrl
    } else if (this.masterKey == 302) { // Tooth Code
      this.toothCode = true
      this.getDomainListUrl = DomainApi.getListToothCodeUrl
      this.addDomainUrl = DomainApi.addEditToothCodeUrl
      this.editDomainUrl = DomainApi.addEditToothCodeUrl
      this.deleteDomainUrl = DomainApi.deleteToothCodeUrl
    } else if (this.masterKey == 288) { // Dental Practice Type
      this.dentalPracticeType = true
      this.getDomainListUrl = DomainApi.getListDentalPracticeTypeUrl
      this.addDomainUrl = DomainApi.addEditDentalPracticeTypeUrl
      this.editDomainUrl = DomainApi.addEditDentalPracticeTypeUrl
      this.deleteDomainUrl = DomainApi.deleteDentalPracticeTypeUrl
    } else if (this.masterKey == 294) { // Vision Practice Type
      this.visionPracticeType = true
      this.getDomainListUrl = DomainApi.getListVisionPracticeTypeUrl
      this.addDomainUrl = DomainApi.addEditVisionPracticeTypeUrl
      this.editDomainUrl = DomainApi.addEditVisionPracticeTypeUrl
      this.deleteDomainUrl = DomainApi.deleteVisionPracticeTypeUrl
    } else if (this.masterKey == 292) { // Health Practice Type
      this.healthPracticeType = true
      this.getDomainListUrl = DomainApi.getListHealthPracticeTypeUrl
      this.addDomainUrl = DomainApi.addEditHealthPracticeTypeUrl
      this.editDomainUrl = DomainApi.addEditHealthPracticeTypeUrl
      this.deleteDomainUrl = DomainApi.deleteHealthPracticeTypeUrl
    } else if (this.masterKey == 293) { // Drug Practice Type
      this.drugPracticeType = true
      this.getDomainListUrl = DomainApi.getListDrugPracticeTypeUrl
      this.addDomainUrl = DomainApi.addEditDrugPracticeTypeUrl
      this.editDomainUrl = DomainApi.addEditDrugPracticeTypeUrl
      this.deleteDomainUrl = DomainApi.deleteDrugPracticeTypeUrl
    } else if (this.masterKey == 421) { // Wellness Practice Type have to add in code in DB
      this.wellnessPracticeType = true
      this.getDomainListUrl = DomainApi.getListWellPracticeTypeUrl
      this.addDomainUrl = DomainApi.addEditWellPracticeTypeUrl
      this.editDomainUrl = DomainApi.addEditWellPracticeTypeUrl
      this.deleteDomainUrl = DomainApi.deleteWellPracticeTypeUrl
    } else if (this.masterKey == 269) { // Payee Type
      this.payeeType = true
      this.getDomainListUrl = DomainApi.getListPayeeTypeUrl
      this.addDomainUrl = DomainApi.addEditPayeeTypeUrl
      this.editDomainUrl = DomainApi.addEditPayeeTypeUrl
      this.deleteDomainUrl = DomainApi.deletePayeeTypeUrl
    } else if (this.masterKey == 277) { // Prorate Type
      this.prorateType = true
      this.getDomainListUrl = DomainApi.getListProrateTypeUrl
      this.addDomainUrl = DomainApi.addEditProrateTypeUrl
      this.editDomainUrl = DomainApi.addEditProrateTypeUrl
      this.deleteDomainUrl = DomainApi.deleteProrateTypeUrl
    } else if (this.masterKey == 309) { // Transaction Type
      this.transactionType = true
      this.getDomainListUrl = DomainApi.getListTransactionTypeUrl
      this.addDomainUrl = DomainApi.addEditTransactionTypeUrl
      this.editDomainUrl = DomainApi.addEditTransactionTypeUrl
      this.deleteDomainUrl = DomainApi.deleteTransactionTypeUrl
    } else if (this.masterKey == 310) { // Transaction Status 
      this.transactionStatus = true
      this.getDomainListUrl = DomainApi.getListTransactionStatusUrl
      this.addDomainUrl = DomainApi.addEditTransactionStatusrl
      this.editDomainUrl = DomainApi.addEditTransactionStatusrl
      this.deleteDomainUrl = DomainApi.deleteTransactionStatusUrl
    } else if (this.masterKey == 287) { // Termination Category
      this.terminationCategory = true
      this.getDomainListUrl = DomainApi.getListTerminationCategoryUrl
      this.addDomainUrl = DomainApi.addEditTerminationCategoryUrl
      this.editDomainUrl = DomainApi.addEditTerminationCategoryUrl
      this.deleteDomainUrl = DomainApi.deleteTerminationCategoryUrl
    } else if (this.masterKey == 299) { // Discipline
      this.discipline = true
      this.getDomainListUrl = DomainApi.getListDisciplineUrl
      this.addDomainUrl = DomainApi.addEditDisciplineUrl
      this.editDomainUrl = DomainApi.addEditDisciplineUrl
      this.deleteDomainUrl = DomainApi.deleteDisciplineUrl
    } else if (this.masterKey == 422) { // Wellness Provider Specialty
      this.wellnessProviderSpecialty = true
      this.getDomainListUrl = DomainApi.getListWellProviderSpecialtyUrl
      this.addDomainUrl = DomainApi.addEditWellProviderSpecialtyUrl
      this.editDomainUrl = DomainApi.addEditWellProviderSpecialtyUrl
      this.deleteDomainUrl = DomainApi.deleteWellProviderSpecialtyUrl
    } else if (this.masterKey == 301) { // Mouth Tooth
      this.mouthTooth = true
      this.getDomainListUrl = DomainApi.getListMouthToothUrl
      this.addDomainUrl = DomainApi.addEditMouthToothUrl
      this.editDomainUrl = DomainApi.addEditMouthToothUrl
      this.deleteDomainUrl = DomainApi.deleteMouthToothUrl
    } else if (this.masterKey == 300) {
      this.mouthSite = true
      this.getDomainListUrl = DomainApi.getMouthSiteListUrl
      this.addDomainUrl = DomainApi.addEditMouthSiteUrl
      this.editDomainUrl = DomainApi.addEditMouthSiteUrl
      this.deleteDomainUrl = DomainApi.deleteMouthSiteUrl
    } else if (this.masterKey == 424) { // Vision Provider Specialty
      this.visionProviderSpecialty = true
      this.getDomainListUrl = DomainApi.getListVisProviderSpecialtyUrl
      this.addDomainUrl = DomainApi.addEditVisProviderSpecialtyUrl
      this.editDomainUrl = DomainApi.addEditVisProviderSpecialtyUrl
      this.deleteDomainUrl = DomainApi.deleteVisProviderSpecialtyUrl
    } else if (this.masterKey == 423) { // Health Provider Specialty
      this.healthProviderSpecialty = true
      this.getDomainListUrl = DomainApi.getListHlthProviderSpecialtyUrl
      this.addDomainUrl = DomainApi.addEditHlthProviderSpecialtyUrl
      this.editDomainUrl = DomainApi.addEditHlthProviderSpecialtyUrl
      this.deleteDomainUrl = DomainApi.deleteHlthProviderSpecialtyUrl
    }
  }

  ngAfterViewInit() {
    var self = this
    $(document).on('click', '#domainInfoList .edit-ico', function () {
      var id = $(this).data('id')
      var key = $(this).data('key')
      var cd = $(this).data('typecd')
      var typeDesc = $(this).data('typedescription')
      var expired = $(this).data('expiredon')
      var suspendCheck = $(this).data('suspended')
      var comment = $(this).data('comment')
      var allowSurface = $(this).data('allowsurface')
      self.key = id
      self.typeCd = cd
      self.typeDesc = typeDesc
      self.expiredOn = expired
      self.suspendedCheck = suspendCheck
      self.comment = comment
      self.allowSurface = allowSurface
      self.editDomainInfo(self.key, self.typeCd, self.typeDesc, self.expiredOn, self.suspendedCheck, self.comment, self.allowSurface);
    })

    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', 'Edit');
    })

    /* Delete functinality of Domain Info */
    $(document).on('click', '#domainInfoList .del-ico', function () {
      var id = $(this).data('id');
      self.domainDelKey = id
      self.deleteDomainInfo(self.domainDelKey)
    })

    $(document).on('click', '#messageList .edit-ico', function () {
      var id = $(this).data('id')
      var key = $(this).data('key')
      var msgDescEng = $(this).data('messageeng')
      var msgDescFre = $(this).data('messagefre')
      var expired = $(this).data('expiredon')
      self.key = key
      self.msgDescEng = msgDescEng
      self.msgDescFre = msgDescFre
      self.expiredOn = expired
      self.editMessage(self.key, self.msgDescEng, self.msgDescFre, self.expiredOn);
    })

    $(document).on('click', '#messageList .del-ico', function () {
      var id = $(this).data('id');
      self.messageDelKey = id
      self.deleteDomainInfo(self.messageDelKey)
    })

    $(document).on('click', '#transactionCodeList .edit-ico', function () {
      var id = $(this).data('id')
      self.key = id
      self.editTransactionCode(self.key);
    })

    $(document).on('click', '#transactionCodeList .del-ico', function () {
      var id = $(this).data('id')
      self.key = id
      self.deleteDomainInfo(self.key)
    })

    //////////////// Dental Provider Specialty ///////////////

    $(document).on('click', '#dentalProviderSpecialtyList .edit-ico', function () {
      var id = $(this).data('id')
      self.key = id
      var provSpecialId = $(this).data('provspecialid')
      var provSpecialDesc = $(this).data('provspecialdesc')
      var specialtyTypeKey = $(this).data('specialtytypekey')
      var specialtyTypeDesc = $(this).data('specialtytypedesc')
      var provSpecialGroupKey = $(this).data('provspecialgroupkey')
      var provSpecialGroupDesc = $(this).data('provspecialgroupdesc')
      var provTypeKey = $(this).data('provtypekey')
      var provTypeDesc = $(this).data('provtypedesc')
      self.provSpecialId = provSpecialId
      self.provSpecialDesc = provSpecialDesc
      self.specialtyTypeKeys = specialtyTypeKey
      self.specialtyTypeDesc = specialtyTypeDesc
      self.provSpecialGroupKey = provSpecialGroupKey
      self.provSpecialGroupDesc = provSpecialGroupDesc
      self.provTypeKey = provTypeKey
      self.provTypeDesc = provTypeDesc
      self.editProviderSpecialty(self.key, self.provSpecialId, self.provSpecialDesc, self.specialtyTypeKeys,
        self.specialtyTypeDesc, self.provSpecialGroupKey, self.provSpecialGroupDesc, self.provTypeKey, self.provTypeDesc);

    })

    $(document).on('click', '#dentalProviderSpecialtyList .del-ico', function () {
      var id = $(this).data('id');
      self.key = id
      self.deleteDomainInfo(self.key)
    })

    // Mouth Tooth
    $(document).on('click', '#mouthToothList .edit-ico', function () {
      var key = $(this).data('id')
      var toothId = $(this).data('toothid')
      var mouthSiteId = $(this).data('mouthsiteid')
      var toothDesc = $(this).data('toothdesc')
      var mouthDesc = $(this).data('mouthdesc')
      var expired = $(this).data('expiredon')
      self.key = key
      self.toothId = toothId
      self.mouthSiteId = mouthSiteId
      self.toothDesc = toothDesc
      self.mouthDesc = mouthDesc
      self.expiredOn = expired
      self.editMouthToothForm(self.key, self.toothId, self.mouthSiteId, self.toothDesc, self.mouthDesc, self.expiredOn);
    })

    $(document).on('click', '#mouthToothList .del-ico', function () {
      var id = $(this).data('id');
      self.key = id
      self.deleteDomainInfo(self.key)
    })

    // Mouth Site
    $(document).on('click', '#mouthSiteList .edit-ico', function () {
      var key = $(this).data('id')
      var mouthId = $(this).data('mouthid')
      var mouthSiteId = $(this).data('mouthsiteid')
      var effectiveOn = $(this).data('effectiveon')
      var expired = $(this).data('expiredon')
      self.key = key
      self.mouthId = mouthId
      self.mouthsiteSiteId = mouthSiteId
      self.effective = effectiveOn
      self.expiredOn = expired
      self.editMouthSiteForm(self.key, self.mouthId, self.mouthsiteSiteId, self.effective, self.expiredOn);
    })

    $(document).on('click', '#mouthSiteList .del-ico', function () {
      var id = $(this).data('id');
      self.key = id
      self.deleteDomainInfo(self.key)
    })

  }

  dataTableInitialize() {
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('domain.domain') == 'domain.domain') {
        } else {
          if (this.messageScreen) {
            this.columns = [
              { title: this.translate.instant('domain.messageDescriptionEng'), data: 'messageEng' },
              { title: this.translate.instant('domain.messageDescriptionFre'), data: 'messageFre' },
              { title: this.translate.instant('domain.expiryDate'), data: 'expiredOn' },
              { title: this.translate.instant('domain.action'), data: 'key' }
            ]
          } else if (this.transactionCode) {
            this.columns = [
              { title: this.translate.instant('Transaction Code'), data: 'tranCd' },
              { title: this.translate.instant('Transaction Description'), data: 'tranDescription' },
              { title: this.translate.instant('domain.effectiveDate'), data: 'effectiveOn' },
              { title: this.translate.instant('domain.expiryDate'), data: 'expiredOn' },
              { title: this.translate.instant('domain.action'), data: 'tranCdKey' }
            ]
          } else if (this.dentalProviderSpecialty) {
            this.columns = [//dentalProviderSpecialtyList
              { title: this.translate.instant('Specialty Id'), data: 'provSpecialId' },
              { title: this.translate.instant('Specialty Description'), data: 'provSpecialDesc' },
              { title: this.translate.instant('Specialty Type'), data: 'specialtyTypeDesc' },
              { title: this.translate.instant('Specialty Group'), data: 'provSpecialGroupDesc' },//provSpecialGroupDesc
              { title: this.translate.instant('domain.action'), data: 'provSpecialKey' }
            ]
          } else if (this.visionProviderSpecialty || this.healthProviderSpecialty || this.wellnessProviderSpecialty) {
            this.columns = [//visionProviderSpecialtyList, healthProviderSpecialtyList and wellnessProviderSpecialty
              { title: this.translate.instant('Specialty Id'), data: 'provSpecialId' },
              { title: this.translate.instant('Specialty Description'), data: 'provSpecialDesc' },
              { title: this.translate.instant('Specialty Type'), data: 'specialtyTypeDesc' },
              { title: this.translate.instant('domain.action'), data: 'provSpecialKey' }
            ]
          }
          else if (this.mouthTooth) {//mouthToothList
            this.columns = [
              // Task 437 Title of following 2 columns corrected
              { title: this.translate.instant('Mouth Id'), data: 'toothDesc' }, // Mouth Id and Mouth Site Id columns as per existing code
              { title: this.translate.instant('Mouth Site Id'), data: 'mouthDesc' },
              { title: this.translate.instant('domain.expiryDate'), data: 'expiredOn' },
              { title: this.translate.instant('domain.action'), data: 'mouthToothKey' }
            ]
          } else if (this.mouthSite) {//mouthSiteList
            this.columns = [
              { title: this.translate.instant('Mouth Id'), data: 'mouthId' },
              { title: this.translate.instant('Mouth Site Id'), data: 'mouthSiteId' },
              { title: this.translate.instant('Effective Date'), data: 'effectiveOn' },
              { title: this.translate.instant('domain.expiryDate'), data: 'expiredOn' },
              { title: this.translate.instant('domain.action'), data: 'mouthSiteKey' }
            ]
          }
          else {
            if (this.cardMailoutType) {
              this.columns = [
                { title: this.translate.instant('domain.typeCode'), data: 'typeCd' },
                { title: this.translate.instant('domain.typeDescription'), data: 'typeDescription' },
                { title: this.translate.instant('domain.action'), data: 'key' }
              ]
            } else if (this.toothCode) {
              this.columns = [
                { title: this.translate.instant('domain.typeCode'), data: 'typeCd' },
                { title: this.translate.instant('domain.typeDescription'), data: 'typeDescription' },
                { title: this.translate.instant('domain.allowSurface'), data: 'allowSurface' },
                { title: this.translate.instant('domain.expiryDate'), data: 'expiredOn' },
                { title: this.translate.instant('domain.action'), data: 'key' }
              ]
            } else if (this.dentalPracticeType || this.visionPracticeType || this.healthPracticeType || this.drugPracticeType || this.wellnessPracticeType) {
              this.columns = [
                { title: this.translate.instant('domain.typeCode'), data: 'typeCd' },
                { title: this.translate.instant('domain.typeDescription'), data: 'typeDescription' },
                { title: this.translate.instant('Comment'), data: 'comment' },
                { title: this.translate.instant('domain.expiryDate'), data: 'expiredOn' },
                { title: this.translate.instant('domain.action'), data: 'key' }
              ]
            } else if (this.discipline) {
              this.columns = [
                { title: this.translate.instant('domain.typeCode'), data: 'typeCd' },
                { title: this.translate.instant('domain.typeDescription'), data: 'typeDescription' },
                { title: this.translate.instant('Suspended'), data: 'suspended' },
                { title: this.translate.instant('domain.expiryDate'), data: 'expiredOn' },
                { title: this.translate.instant('domain.action'), data: 'key' }
              ]
            }
            else {
              this.columns = [
                { title: this.translate.instant('domain.typeCode'), data: 'typeCd' },
                { title: this.translate.instant('domain.typeDescription'), data: 'typeDescription' },
                { title: this.translate.instant('domain.expiryDate'), data: 'expiredOn' },
                { title: this.translate.instant('domain.action'), data: 'key' }
              ]
            }
          }
          this.getDomainInfoList();
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })
  }

  getDomainInfoList() {
    var reqParam = []
    var tableId = ""
    var url = this.getDomainListUrl;
    var tableActions = [
      { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': '' },
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete', 'showAction': '' },
    ]
    if (this.messageScreen) {
      tableId = "messageList"
      reqParam = [
        { 'key': 'messageCd', 'value': "" },
        { 'key': 'messageEng', 'value': "" },
        { 'key': 'messageFre', 'value': "" },
        { 'key': 'expiredOn', 'value': "" }
      ]
      if (!$.fn.dataTable.isDataTable('#messageList')) {
        this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 3, [2], "AddNewMessage", '', '', '', '', '', [1, 2, 3])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
    } else if (this.transactionCode) {
      tableId = "transactionCodeList"
      reqParam = [
        { 'key': 'tranCd', 'value': "" },
        { 'key': 'tranDescription', 'value': "" },
        { 'key': 'effectiveOn', 'value': "" },
        { 'key': 'expiredOn', 'value': "" }
      ]
      if (!$.fn.dataTable.isDataTable('#transactionCodeList')) {
        this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4, [2, 3], "AddNewDomainInfo", '', '', '', '', '', [1, 2, 3, 4])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
    } else if (this.dentalProviderSpecialty) {
      tableId = "dentalProviderSpecialtyList"
      reqParam = [
        { 'key': 'provSpecialId', 'value': "" },
        { 'key': 'provSpecialDesc', 'value': "" },
        { 'key': 'expiredOn', 'value': "" },
        { 'key': 'specialtyTypeDesc', 'value': "" },
        { 'key': 'provSpecialGroupDesc', 'value': "" },
        { 'key': 'provTypeDesc', 'value': "" }
      ]
      if (!$.fn.dataTable.isDataTable('#dentalProviderSpecialtyList')) {
        this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4, [], "AddNewProvSpecialty", '', '', '', '', '', [1, 2, 3, 4])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
    } else if (this.visionProviderSpecialty || this.healthProviderSpecialty || this.wellnessProviderSpecialty) { // Vision Provider Specialty(22-Oct-2020) and wellnessProviderSpecialty added as per discussed with Arun sir for Log #845 (25-Feb-2021)
      tableId = "dentalProviderSpecialtyList"
      reqParam = [
        { 'key': 'provSpecialId', 'value': "" },
        { 'key': 'provSpecialDesc', 'value': "" },
        { 'key': 'expiredOn', 'value': "" },
        { 'key': 'specialtyTypeDesc', 'value': "" },
        { 'key': 'provSpecialGroupDesc', 'value': "" },
        { 'key': 'provTypeDesc', 'value': "" }
      ]
      if (!$.fn.dataTable.isDataTable('#dentalProviderSpecialtyList')) {
        this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 3, [], "AddNewProvSpecialty", '', '', '', '', '', [1, 2, 3])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
    }
    else if (this.mouthTooth) {
      tableId = "mouthToothList"
      reqParam = [
        { 'key': 'toothDesc', 'value': "" },
        { 'key': 'mouthDesc', 'value': "" },
        { 'key': 'expiredOn', 'value': "" },
      ]
      if (!$.fn.dataTable.isDataTable('#mouthToothList')) {
        this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 3, [2], "AddNewMouthTooth", '', '', '', '', '', [1, 2, 3])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
    } else if (this.mouthSite) {
      tableId = "mouthSiteList"
      reqParam = [
        { 'key': 'mouthId', 'value': "" },
        { 'key': 'mouthSiteId', 'value': "" },
        { 'key': 'effectiveOn', 'value': "" },
        { 'key': 'expiredOn', 'value': "" },
      ]
      if (!$.fn.dataTable.isDataTable('#mouthSiteList')) {
        this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4, [2, 3], "AddNewMouthSite", '', '', '', '', '', [1, 2, 3, 4])
      } else {
        this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
      }
    }
    else {
      tableId = "domainInfoList"
      reqParam = [
        { 'key': 'typeCd', 'value': "" },
        { 'key': 'typeDescription', 'value': "" },
      ]
      if (this.cardMailoutType) {
        if (!$.fn.dataTable.isDataTable('#domainInfoList')) {
          this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 2, [], "AddNewDomainInfo", '', '', '', '', '', [1, 2])
        } else {
          this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
        }
      } else if (this.toothCode) {
        reqParam.push({ 'key': 'expiredOn', 'value': "" }, { 'key': 'allowSurface', 'value': "" });
        if (!$.fn.dataTable.isDataTable('#domainInfoList')) {
          this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4, [3], "AddNewDomainInfo", '', '', '', '', '', [1, 2, 3, 4])
        } else {
          this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
        }
      } else if (this.dentalPracticeType || this.visionPracticeType || this.healthPracticeType || this.drugPracticeType || this.wellnessPracticeType) {
        reqParam.push({ 'key': 'expiredOn', 'value': "" }, { 'key': 'comment', 'value': "" });
        if (!$.fn.dataTable.isDataTable('#domainInfoList')) {
          this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4, [3], "AddNewDomainInfo", '', '', '', '', '', [1, 2, 3, 4])
        } else {
          this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
        }
      } else if (this.discipline) {
        reqParam.push({ 'key': 'suspended', 'value': '' })
        if (!$.fn.dataTable.isDataTable('#domainInfoList')) {
          this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', 2, [0, 'asc'], '', reqParam, tableActions, 4, [3], "AddNewDomainInfo", '', '', '', '', '', [1, 2, 3, 4])
        } else {
          this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
        }
      }
      else {
        if (!$.fn.dataTable.isDataTable('#domainInfoList')) {
          this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 3, [2], "AddNewDomainInfo", '', '', '', '', '', [1, 2, 3])
        } else {
          this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
        }
      }
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  searchDomainInfo(tableId) {
    var params = this.dataTableService.getFooterParams(tableId)
    var dateParams = []
    if (this.toothCode || this.dentalPracticeType || this.visionPracticeType || this.healthPracticeType || this.drugPracticeType || this.wellnessPracticeType
      || this.discipline) {
      dateParams = [3]
    } else if (this.transactionCode) {
      dateParams = [2, 3]
    } 
    // Changes in check to make search working in Card Mailout Type
    else if (this.dentalProviderSpecialty || this.wellnessProviderSpecialty || this.visionProviderSpecialty || this.healthProviderSpecialty || this.cardMailoutType) {
      dateParams = []
    } else {
      dateParams = [2]
    }
    var URL = this.getDomainListUrl;
    this.dataTableService.jqueryDataTableReload(tableId, URL, params, dateParams)
  }

  /**
   * Reset Domain Info List Filter
   */
  resetDomainInfoSearch(tableId) {
    this.dataTableService.resetTableSearch();
    this.searchDomainInfo(tableId);
    // To remove cross icon on reset button
    $(".btnclear").trigger("click")
    // Task 487 To re draw icon if value entered again after clearing
    this.observableObj = Observable.interval(100).subscribe(x => {
      $(".selection").blur()
      this.observableObj.unsubscribe();
    })
    if (tableId == 'messageList') {
      $('#messageList .icon-mydpremove').trigger('click');
    } else {
      $('#domainInfoList .icon-mydpremove').trigger('click');
    }
  }

  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      this.searchDomainInfo(tableId);
    }
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.addDomainInfo.patchValue(datePickerValue);
      this.addMesssageForm.patchValue(datePickerValue);
      this.addMouthToothForm.patchValue(datePickerValue)
      this.addMouthSiteForm.patchValue(datePickerValue)
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.addDomainInfo.patchValue(datePickerValue);
      this.addMesssageForm.patchValue(datePickerValue);
      this.addMouthToothForm.patchValue(datePickerValue)
      this.addMouthSiteForm.patchValue(datePickerValue)
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    if (this.addDomainInfo.value.effectiveOn && this.addDomainInfo.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addDomainInfo.value.effectiveOn.date, this.addDomainInfo.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addDomainInfo.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    if (this.addMouthSiteForm.value.effectiveOn && this.addMouthSiteForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addMouthSiteForm.value.effectiveOn.date, this.addMouthSiteForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addMouthSiteForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }

    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);

    }

  }

  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
      if (obj != null) {
        this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      }
    }
    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  enableAddMode() {
    this.addDomainInfo.enable();
    this.addMesssageForm.enable();
    this.addProviderSpecialityForm.enable()
    this.addMouthToothForm.enable()
    this.addMouthSiteForm.enable();
    this.addMode = true;
    this.viewMode = false;
    this.editMode = false;
    this.buttonText = this.translate.instant('common.save')
    this.addModeMsg = true
    this.editModeMsg = false
  }

  enableEditMode() {
    this.addDomainInfo.enable();
    this.addMesssageForm.enable();
    this.addProviderSpecialityForm.enable();
    this.addMouthToothForm.enable()
    this.addMouthSiteForm.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.addModeMsg = false
    this.editModeMsg = true
    this.buttonText = this.translate.instant('common.update')
  }

  resetDomainInfoForm() {
    this.addDomainInfo.reset();
    if (this.reload) {
      this.getDomainInfoList();
    }
  }

  resetDomainProviderSpecialtyForm() {
    this.addProviderSpecialityForm.reset();
    this.specialtyTypeKey = ""
    this.specialtyGroupKey = ""
    this.providerTypeKey = ""
    if (this.reload) {
      this.getDomainInfoList();
    }
  }

  submitDomainInfo() {
    let domainInfo
    if (this.transactionCode) {
      domainInfo = {
        "tranCd": this.addDomainInfo.value.typeCd,
        "tranDescription": this.addDomainInfo.value.typeDescription,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDomainInfo.value.effectiveOn),
        "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addDomainInfo.value.expiredOn)
      }
    } else {
      domainInfo = {
        // task 443 Type Description used to convert in lowercase if edited, is resolved
        "typeCd": this.addDomainInfo.value.typeCd.toUpperCase(),
        "typeDescription": this.addDomainInfo.value.typeDescription.toUpperCase(),
        "expiredOn": this.addDomainInfo.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addDomainInfo.value.expiredOn) : "",
      }
      if (this.toothCode) {
        domainInfo["allowSurface"] = this.addDomainInfo.value.allowSurface
      } else if (this.dentalPracticeType || this.visionPracticeType || this.healthPracticeType || this.drugPracticeType || this.wellnessPracticeType) {
        domainInfo["comment"] = this.addDomainInfo.value.comment
      } else if (this.discipline) {
        domainInfo["suspended"] = this.addDomainInfo.value.suspended ? 'T' : 'F'
      }
    }
    if (this.addMode) {
      if (this.addDomainInfo.valid) {
        let url = this.addDomainUrl
        this.hmsDataService.postApi(url, domainInfo).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.domainInfoSavedSuccess'))
            this.reload = true;
            $("#closeDomainInfoForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notSaved'))
          }
        })
      } else {
        this.validateAllFormFields(this.addDomainInfo)
      }
    }
    if (this.editMode) {
      let url = this.editDomainUrl
      let mainUrl;
      if (this.transactionCode) {
        domainInfo["tranCdKey"] = this.key
        mainUrl = this.hmsDataService.postApi(url, domainInfo)
      } else if (this.yearType || this.claimType || this.claimStatus || this.deductibleType
        || this.maximumType || this.maxPeriodType || this.HSAMaxType || this.HSAMaxPeriodType
        || this.HSACoverageCategory || this.ruleExecutionPoint || this.ruleExecutionOrder || this.drugProvSpecialtyType
        || this.toothCode || this.dentalPracticeType || this.visionPracticeType || this.healthPracticeType || this.drugPracticeType || this.wellnessPracticeType
        || this.discipline || this.payeeType || this.prorateType || this.transactionType || this.transactionStatus
        || this.terminationCategory) {
        domainInfo["key"] = this.key
        mainUrl = this.hmsDataService.postApi(url, domainInfo)
      } else {
        domainInfo["key"] = this.key
        mainUrl = this.hmsDataService.putApi(url, domainInfo)
      }
      if (this.addDomainInfo.valid) {
        mainUrl.subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.domainInfoUpdatedSuccess'))
            this.reload = true;
            $("#closeDomainInfoForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notUpdated'))
          }
        })
      } else {
        this.validateAllFormFields(this.addDomainInfo)
      }
    }

  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  editDomainInfo(key, typeCd, typeDescription, date, suspendCheck, comment, allowSurface) {
    this.showLoader = true;
    this.enableEditMode();
    this.addDomainInfo.patchValue({
      'typeCd': typeCd,
      'typeDescription': typeDescription,
      'expiredOn': date != "undefined" ? this.changeDateFormatService.convertStringDateToObject(date) : "",
    });
    if (this.discipline) {
      this.addDomainInfo.patchValue({
        'suspended': (suspendCheck == "T") ? true : false,
      })
    }
    if (this.dentalPracticeType || this.visionPracticeType || this.healthPracticeType || this.drugPracticeType || this.wellnessPracticeType) {
      this.addDomainInfo.patchValue({
        'comment': comment != 'undefined' ? comment : ""
      })
    }
    if (this.toothCode) {
      this.addDomainInfo.patchValue({
        'allowSurface': allowSurface != 'undefined' ? allowSurface : ""
      })
    }
    this.showLoader = false
  }

  editMessage(key, msgDescEng, msgDescFre, date) {
    this.showLoader = true;
    this.enableEditMode();
    this.addMesssageForm.patchValue({
      'messageEng': msgDescFre,
      'messageFre': msgDescFre,
      'expiredOn': date != "undefined" ? this.changeDateFormatService.convertStringDateToObject(date) : "",
    });
    this.showLoader = false
  }

  deleteDomainInfo(id) {
    let deleteUrl;
    if (this.claimType || this.yearType || this.claimStatus || this.deductibleType || this.maximumType
      || this.maxPeriodType || this.HSAMaxType || this.HSAMaxPeriodType || this.HSACoverageCategory
      || this.ruleExecutionPoint || this.ruleExecutionOrder || this.drugProvSpecialtyType || this.transactionCode
      || this.toothCode || this.dentalPracticeType || this.visionPracticeType || this.healthPracticeType || this.drugPracticeType
      || this.wellnessPracticeType || this.discipline || this.payeeType || this.prorateType || this.transactionType || this.transactionStatus
      || this.terminationCategory) {
      let RequestData = { "key": id }
      deleteUrl = this.hmsDataService.postApi(this.deleteDomainUrl, RequestData)
    } else if (this.dentalProviderSpecialty || this.wellnessProviderSpecialty || this.visionProviderSpecialty || this.healthProviderSpecialty) {
      let RequestData = { "provSpecialKey": id }
      deleteUrl = this.hmsDataService.postApi(this.deleteDomainUrl, RequestData)
    } else if (this.mouthTooth) {
      let RequestData = { "mouthToothKey": id }
      deleteUrl = this.hmsDataService.postApi(this.deleteDomainUrl, RequestData)
    } else if (this.mouthSite) {
      let RequestData = { "mouthSiteKey": id }
      deleteUrl = this.hmsDataService.postApi(this.deleteDomainUrl, RequestData)
    }
    else {
      deleteUrl = this.hmsDataService.delete(this.deleteDomainUrl + '/' + id)
    }
    this.exDialog.openConfirm(this.translate.instant('domain.toastr.areYouWantToDelete')).subscribe((value) => {
      if (value) {
        deleteUrl.subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.recordDeletedSuccess'));
            this.getDomainInfoList();
          } else if (data.code == 400 && data.hmsMessage.messageShort == "PLEASE_REMOVE_SERVICES_AND_PROC_ASSOCIATED_BEFORE_DELETING") {
            this.toastrService.error("Please remove services and proc associated before deleteing");
          } else {
            this.toastrService.error("Not deleted!")
          }
        })
      }
    });
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  submitMessageForm() {
    let messageRequest = {
      "messageEng": this.addMesssageForm.value.messageEng,
      "messageFre": this.addMesssageForm.value.messageFre,
      "expiredOn": this.addMesssageForm.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addMesssageForm.value.expiredOn) : "",
    }
    if (this.addMode) {
      if (this.addMesssageForm.valid) {
        let url = this.addDomainUrl
        this.hmsDataService.postApi(url, messageRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.messageSavedSuccess'))
            this.reload = true;
            $("#closeMessageForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notSaved'))
          }
        })
      } else {
        this.validateAllFormFields(this.addMesssageForm)
      }
    }
    if (this.editMode) {
      messageRequest["key"] = this.key
      if (this.addMesssageForm.valid) {
        let url = this.editDomainUrl
        this.hmsDataService.putApi(url, messageRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.messageUpdatedSuccess'))
            this.reload = true;
            $("#closeMessageForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notUpdated'))
          }
        })
      } else {
        this.validateAllFormFields(this.addMesssageForm)
      }
    }
  }

  resetMessageForm() {
    this.addMesssageForm.reset();
    if (this.reload) {
      this.getDomainInfoList();
    }
  }

  editTransactionCode(key) {
    this.showLoader = true;
    this.enableEditMode();
    var url = DomainApi.getTransactionCodeUrl
    var transactionId = { "tranCdKey": key }
    this.hmsDataService.postApi(url, transactionId).subscribe(data => {
      if (data.code == 200 && data.status) {
        this.addDomainInfo.patchValue({
          'typeCd': data.result.tranCd,
          'typeDescription': data.result.tranDescription,
          'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'expiredOn': this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn)
        });
        this.showLoader = false
      }
    })
  }

  onSelectSpecialtyType(selected: CompleterItem, type) {
    if (selected && type == 'specialtyType') {
      this.specialtyTypeKey = selected.originalObject.key;
    } else {
      this.specialtyTypeKey = ''
    }
  }

  onSelectSpecialtyGroup(selected: CompleterItem, type) {
    if (selected && type == 'specialtyGroup') {
      this.specialtyGroupKey = selected.originalObject.key
    } else {
      this.specialtyGroupKey = ''
    }
  }

  onSelectProviderType(selected: CompleterItem, type) {
    if (selected && type == 'providerType') {
      this.providerTypeKey = selected.originalObject.key
    } else {
      this.providerTypeKey = ''
    }
  }

  submitProviderSpecialtyForm() {
    let provSpecRequest
    if (this.visionProviderSpecialty || this.healthProviderSpecialty || this.wellnessProviderSpecialty) {
      this.addProviderSpecialityForm.controls['specialtyGroup'].clearValidators()
      this.addProviderSpecialityForm.controls['specialtyGroup'].updateValueAndValidity()      
      provSpecRequest = {
        "provSpecialTypeKey": this.specialtyTypeKey,//44,
        "provSpecialId": this.addProviderSpecialityForm.value.specialtyId,
        "provSpecialDesc": this.addProviderSpecialityForm.value.specialtyDescription,
        "expiredOn": this.addProviderSpecialityForm.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addMesssageForm.value.expiredOn) : "",
      }
    }
    else {
      provSpecRequest = {
        "provTypeKey": 0, 
        "provSpecialGroupKey": this.specialtyGroupKey,
        "provSpecialTypeKey": this.specialtyTypeKey, 
        "provSpecialId": this.addProviderSpecialityForm.value.specialtyId,
        "provSpecialDesc": this.addProviderSpecialityForm.value.specialtyDescription,
        "expiredOn": this.addProviderSpecialityForm.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addMesssageForm.value.expiredOn) : "",
      }
    }
    if (this.addMode) {
      if (this.addProviderSpecialityForm.valid) {
        let url = this.addDomainUrl
        this.hmsDataService.postApi(url, provSpecRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.domainInfoSavedSuccess'))
            this.reload = true;
            $("#closeProviderSpecialtyForm").trigger('click');
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notSaved'))
          }
        })
      } else {
        this.validateAllFormFields(this.addProviderSpecialityForm)
      }
    }
    if (this.editMode) {
      provSpecRequest["provSpecialKey"] = this.key
      if (this.addProviderSpecialityForm.valid) {
        let url = this.editDomainUrl
        this.hmsDataService.postApi(url, provSpecRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.domainInfoUpdatedSuccess'))
            this.reload = true;
            $("#closeProviderSpecialtyForm").trigger('click');
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notUpdated'))
          }
        })
      } else {
        this.validateAllFormFields(this.addProviderSpecialityForm)
      }
    }
  }

  resetProviderSpecialtyForm() {
    this.addProviderSpecialityForm.reset();
    if (this.reload) {
      this.getDomainInfoList();
    }
  }

  editProviderSpecialty(key, provSpecialId, provSpecialDesc, specialtyTypeKeys, specialtyTypeDesc, provSpecialGroupKey,
    provSpecialGroupDesc, provTypeKey, provTypeDesc) {
    this.showLoader = true;
    this.enableEditMode();
    this.providerTypeKey = provTypeKey
    this.specialtyGroupKey = provSpecialGroupKey
    this.specialtyTypeKey = specialtyTypeKeys

    this.addProviderSpecialityForm.patchValue({
      'specialtyType': specialtyTypeDesc,
      'specialtyGroup': provSpecialGroupDesc,
      'providerType': provTypeDesc,
      'specialtyId': provSpecialId,
      'specialtyDescription': provSpecialDesc
    });
    this.showLoader = false
  }

  onSelectToothCode(selected: CompleterItem, type) {
    if (selected && type == 'toothCode') {
      this.toothCodeKey = selected.originalObject.key;
    } else {
      this.toothCodeKey = ''
    }
  }

  onSelectMouthSite(selected: CompleterItem, type) {
    if (selected && type == 'mouthSite') {
      this.mouthSiteKey = selected.originalObject.mouthSiteKey;
    } else {
      this.mouthSiteKey = ''
    }
  }

  submitMouthToothForm() {
    let mouthToothRequest = {
      "toothId": this.toothCodeKey,
      "mouthSiteId": this.mouthSiteKey,
      "expiredOn": this.addMouthToothForm.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addMouthToothForm.value.expiredOn) : "",
    }
    if (this.addMode) {
      if (this.addMouthToothForm.valid) {
        let url = this.addDomainUrl
        this.hmsDataService.postApi(url, mouthToothRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.domainInfoSavedSuccess'))
            this.reload = true;
            $("#closeMouthToothForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notSaved'))
          }
        })
      } else {
        this.validateAllFormFields(this.addMouthToothForm)
      }
    }
    if (this.editMode) {
      mouthToothRequest["mouthToothKey"] = this.key
      if (this.addMouthToothForm.valid) {
        let url = this.editDomainUrl
        this.hmsDataService.postApi(url, mouthToothRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.domainInfoUpdatedSuccess'))
            this.reload = true;
            $("#closeMouthToothForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notUpdated'))
          }
        })
      } else {
        this.validateAllFormFields(this.addMouthToothForm)
      }
    }
  }

  resetDomainMouthToothForm() {
    this.addMouthToothForm.reset();
    if (this.reload) {
      this.getDomainInfoList();
    }
  }

  submitMouthSiteForm() {
    let mouthSiteRequest = {
      "mouthId": this.addMouthSiteForm.value.mouthId,//81,
      "mouthSiteId": this.addMouthSiteForm.value.mouthSiteId,//84,
      "effectiveOn": this.addMouthSiteForm.value.effectiveOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addMouthSiteForm.value.effectiveOn) : "",
      "expiredOn": this.addMouthSiteForm.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addMouthSiteForm.value.expiredOn) : "",
    }
    if (this.addMode) {
      if (this.addMouthSiteForm.valid) {
        let url = this.addDomainUrl
        this.hmsDataService.postApi(url, mouthSiteRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.domainInfoSavedSuccess'))
            this.reload = true;
            $("#closeMouthSiteForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notSaved'))
          }
        })
      } else {
        this.validateAllFormFields(this.addMouthSiteForm)
      }
    }
    if (this.editMode) {
      mouthSiteRequest["mouthSiteKey"] = this.key
      if (this.addMouthSiteForm.valid) {
        let url = this.editDomainUrl
        this.hmsDataService.postApi(url, mouthSiteRequest).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastrService.success(this.translate.instant('domain.toastr.domainInfoUpdatedSuccess'))
            this.reload = true;
            $("#closeMouthSiteForm").trigger('click');
          } else if (data.code == 400 && data.hmsMessage.messageShort == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
            this.toastrService.error(this.translate.instant('finance.toaster.expiryDateGreaterThanPresent'))
          } else {
            this.toastrService.error(this.translate.instant('domain.toastr.notUpdated'))
          }
        })
      } else {
        this.validateAllFormFields(this.addMouthSiteForm)
      }
    }
  }

  resetDomainMouthSiteForm() {
    this.addMouthSiteForm.reset()
    if (this.reload) {
      this.getDomainInfoList();
    }
  }

  editMouthToothForm(key, toothId, mouthSiteId, toothDesc, mouthDesc, expiredOn) {
    this.showLoader = true;
    this.enableEditMode();
    this.toothCodeKey = toothId
    this.mouthSiteKey = mouthSiteId
    this.addMouthToothForm.patchValue({
      'toothCode': toothDesc,
      'mouthSite': mouthDesc,
      'expiredOn': expiredOn != "undefined" ? this.changeDateFormatService.convertStringDateToObject(expiredOn) : "",
    });
    this.showLoader = false
  }

  editMouthSiteForm(key, mouthId, mouthsiteSiteId, effective, expiredOn) {
    this.showLoader = true;
    this.enableEditMode();
    this.addMouthSiteForm.patchValue({
      'mouthId': mouthId,
      'mouthSiteId': mouthsiteSiteId,
      'effectiveOn': effective != "undefined" ? this.changeDateFormatService.convertStringDateToObject(effective) : "",
      'expiredOn': expiredOn != "undefined" ? this.changeDateFormatService.convertStringDateToObject(expiredOn) : "",
    });
    this.showLoader = false
  }

}
