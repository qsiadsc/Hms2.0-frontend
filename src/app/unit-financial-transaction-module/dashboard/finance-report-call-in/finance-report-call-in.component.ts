import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UftApi } from '../../uft-api';
import { TranslateService } from '@ngx-translate/core';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { ClaimService } from '../../../claim-module/claim.service';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Constants } from '../../../common-module/Constants';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { debug } from 'util';
import { align } from '@progress/kendo-drawing';
import { Subscription } from 'rxjs/Subscription';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import jsPDF from 'jspdf';
import { CardApi } from '../../../card-module/card-api';
import 'jspdf-autotable';
import { id } from '@swimlane/ngx-datatable/release/utils';
import { MyDatePicker, IMyDpOptions } from 'mydatepicker';
declare var jsPDF: any;
import { RequestOptions, Http, Headers } from '@angular/http';
import { DomSanitizer } from "@angular/platform-browser";
import { element } from 'protractor';

@Component({
  selector: 'app-finance-report-call-in',
  templateUrl: './finance-report-call-in.component.html',
  styleUrls: ['./finance-report-call-in.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService]
})

export class FinanceReportCallInComponent implements OnInit {
  /**Start Column Filters For fundingSummary */
  btypeEmitted: any
  filterCompanyName: any;
  filterTransDate: any;
  filterCompanyNumber: any;
  filterTransCode: any;
  filterAmount: any;
  filterTransactionType = [];
  filterOverrideReason = [];
  /**End Column Filters */
  dateNameArray = {};
  claimStatusArray = [];
  bankDetailsKey;
  fundingPdfName: any;
  financePdfUrl;
  fundingSummaryWithActionReqParam = [];
  fundingSummaryAction = [];
  dataSetArray = [];
  searchCompanyMandatoryFlag: boolean = false;
  ObservableFinReportsObj: Subscription;
  transIsPositiveNegative: boolean;
  colsRight = [];
  showCardHolderAddress: boolean = true;
  paymentRunDataTableOne: any;
  paymentRunDataTableTwo: any;
  showLastUpdated: boolean = false;
  sumOnAmount;
  paymentRunArray: any;
  PaymentRunTableOneSum: any;
  transactionIsElectronicChequeList: any;
  selectedTransactionIsElectronicCheque: any;
  public transactionIsPositiveNegativeData: CompleterData;
  transactionIsPositiveNegativeList: any;
  selectedTransactionIsPositiveNegative: any;
  selectedCompanyName: string = '';
  selectedCompanyNumber: string = '';
  public isOpen: boolean = false;
  uftReqDataArray: any;
  ObservableObjComp: Subscription;
  totalCompaniesColumns: { title: string; data: string; }[];
  ObservableObjBroker: Subscription;
  BrokerColumns: { title: string; data: string; }[];
  ObservableObjProvider: any;
  providerColumns: { title: string; data: string; }[];
  ObservableObjCardholder: any;
  CardholderColumns: { title: string; data: string; }[];
  filteredTableData = []
  GridHeading: string;
  transCodeArrayF: any[];
  reportData;
  columnFilterSearch: boolean = false;
  filterStatus: any;
  filterProcessDate: any;
  filterTotalAmount: any;
  filterIssueDate: any;
  filterCancelDate: any;
  filterClearDate: any;
  filtercoRefundTransDt: any;
  filtercoRefundIssueDt: any;
  filterCardNumber: any;
  filterProcedureCode: any;
  filterCobAmount: any;
  filterPaidAmount: any;
  filterCoveredAmount: any;
  filterEligibleAmount: any;
  filterClaimedAmount: any;
  filterServiceProvider: any;
  filterPatientName: any;
  filterCardHolderName: any;
  filterPatientRole: string;
  filterClientName: string;
  filterServiceDate: string;
  filterOverrideAmount: string;
  verificationNumber: string;
  filterVerificationNumber: any;
  serviceProvider: any;
  serviceDate: any;
  GridFilter59_ReferenceNumber: any;
  issueDate: any;
  chqPayee: any;
  chqNumber: any;
  chqAmt: any;
  chequePayee: string;
  issuedDate: string;
  chequeNumber: string;
  chequeAmount: string;
  clrDate: any;
  bankRecon: boolean;
  coId: any;
  amount: any;
  coTerminatedOn: string;
  showReport: boolean;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  selectedCompanyStatus: any;
  companyStatusList: any;
  public companyStatusData: CompleterData;
  selectedUFT: any;
  uftList: any;
  public uftData: CompleterData;
  public transactionIsElectronicChequeData: CompleterData;
  selectedCardholderAddress: any;
  cardholderAddressList: any;
  public cardholderAddressData: CompleterData;
  selectedDependant: any;
  dependantList: any;
  public dependantData: CompleterData;
  selectedBusinessTypeCd: any;
  businessTypeList: any;
  public businessTypeData: CompleterData;
  selectedDiscipline: any;
  disciplineList: any;
  public disciplineData: CompleterData;
  selectedClaimType: any;
  claimTypeList: any;
  public claimTypeData: CompleterData;
  selectedProcId: any;
  procIdList: any;
  public procIdData: RemoteData;
  selectedProvinceKey: any;
  provinceList: any;
  public provinceData: CompleterData;
  selectedClaimStatusType = [];
  claimStatusList = [];
  claimStatus = []
  overrideReasonList = [];
  selectedOverrideReason = [];
  overrideReason = []
  showPageLoader: boolean = false;
  public companyDataRemote: RemoteData;
  currentUser: any;
  showReportList: boolean = false; //Enable true when we need to show report list in the popup
  showHideFilter: boolean = true;
  showHideNoDataFound: boolean = false;
  reportsListColumns = [];
  ObservableReportsListObj;
  public filterReport: FormGroup; // change private to public for production-errors
  public createLetterForm: FormGroup; // change private to public for production-errors
  public financeReportsForm: FormGroup;
  reportID: Number;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;
  showFilterFields = [];
  error: { isError: boolean; errorMessage: string; };
  filterColoumn = [];
  selecteCoID: any;
  companyNameText = '';
  transactionTypeList = [];
  reportPopUpTitle: string = 'Reports';
  reportListShowHide: boolean;
  dropdownSettings: {};
  selectedTransactionType = [];
  transactionType = []
  selectedReportRowData: any;
  selecteCoName: any;
  selecteCoKey: any;
  selectedCompany: any;
  tableId: string = 'fundingSummary-callIn';
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  selectedBrokerId: any;
  showfinanceReportsGrid: boolean = false
  public brokerNameNoRemoteData: RemoteData;
  columns = []
  checkBan: boolean = true
  showMailLabelTable: boolean = false;
  financeGenManualForm: FormGroup;
  componentType: { 'componentKey': string; 'componentName': string; }[];
  showManual: boolean = false;
  @ViewChild('filterReportStartDate') filterReportStartDate: MyDatePicker;
  error1: any;
  error3: any;
  selectedFileName
  selectedFile: any;
  fileSizeExceeds: boolean = false
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false
  showLoader: boolean = false
  scannedDocumentList = []
  blobUrl
  filePath
  fileName
  company_upload_document_columns = [];
  ObservableComUploadDocObj
  checkCcomUploadDoc = true
  hidebtn: boolean = true;
  selectedCompnayUploadDocArray
  fundingSummarySelectedData
  uftOpeningBalance;
  uftClosingBalance;
  /*
  Program Utilization Report Ng Model Variables  
  */
  GridFilterpPaymentDate;
  GridFilterpProgramType;
  GridFilterpPaidAmount;
  GridFilterpClaimedAmount;
  GridFilterpEligibleClientCount;
  /*
  Program Utilization Report Ng Model Variables  
  */
  /*
    Summary of Provider Debits  
  */
  GridFilterp51PaymentDate
  GridFilterp51dentProvlicenseNum
  GridFilterp51ProviderName
  GridFilterp51Amount
  /*
    Summary of Provider Debits  
  */
  /**
   * QBCI Travel Eligibility Reconciliation
   */
  GridFilterp81_companyId;
  GridFilterp81_companyName;
  GridFilterp81_totalFamilyCount;
  GridFilterp81_familyAlberta;
  GridFilterp81_familyBritishColumbia;
  GridFilterp81_familyManitoba;
  GridFilterp81_familyNovascotia;
  GridFilterp81_familyOntario;
  GridFilterp81_familyQuebec;
  GridFilterp81_familySaskatchewan;
  GridFilterp81_familyNewbrunswick;
  GridFilterp81_familyPrinceEdwardIsland;
  GridFilterp81_familyYukonTerritory;
  GridFilterp81_familyNorthWestTerritories;
  GridFilterp81_familyNewFoundLand;
  GridFilterp81_familyNunavut;
  GridFilterp81_totalSingleCount;
  GridFilterp81_singleAlberta;
  GridFilterp81_singleBritishColumbia;
  GridFilterp81_singleManitoba;
  GridFilterp81_singleNovascotia;
  GridFilterp81_singleOntario;
  GridFilterp81_singleQuebec;
  GridFilterp81_singleSaskatchewan;
  GridFilterp81_singleNewbrunswick;
  GridFilterp81_singlePrinceEdwardIsland;
  GridFilterp81_singleYukonTerritory;
  GridFilterp81_singleNorthWestTerritories;
  GridFilterp81_singleNewFoundLand;
  GridFilterp81_singleNunavut;
  GridFilterp81_broker1;
  GridFilterp81_broker2;
  GridFilterp81_broker3;
  GridFilterp81_broker4;
  /**
   * QBCI Eligibility RBC
   */
  GridFilterp80_carrier
  GridFilterp80_employerName
  GridFilterp80_cardId
  GridFilterp80_effectiveDate
  GridFilterp80_clientType
  GridFilterp80_firstName
  GridFilterp80_lastName
  GridFilterp80_dob
  GridFilterp80_age
  GridFilterp80_relationship
  GridFilterp80_address1
  GridFilterp80_city
  GridFilterp80_province
  GridFilterp80_postalCode
  GridFilterp80_isBankAccountActive
  /**
   * QBCI Eligibility RBC
   */
  /**
   * QBCI Eligibility Age65 Report
   */
  GridFilterp79_carrier
  GridFilterp79_employerName
  GridFilterp79_cardId
  GridFilterp79_effectiveDate
  GridFilterp79_clientType
  GridFilterp79_firstName
  GridFilterp79_lastName
  GridFilterp79_dob
  GridFilterp79_age
  GridFilterp79_relationship
  GridFilterp79_address1
  GridFilterp79_city
  GridFilterp79_province
  GridFilterp79_postalCode
  GridFilterp79_isBankAccountActive
  /**
   * QBCI Eligibility Age65 Report
   */
  /**
  * QBCI Travel Eligibility Reconciliation
  */
  /** Start Broker Company Summary Report(Case 30) */
  GridFilter30_BrokerName;
  GridFilter30_BrokerNumber;
  GridFilter30_BrokerPrimaryContact;
  GridFilter30_BrokerTelephone;
  GridFilter30_CompanyName;
  GridFilterp30_CompanyEffectiveDate;
  GridFilter30_CompanyBrokerRate;
  GridFilter30_CompanyBalance;
  GridFilter30_CompanyPAPAmount
  /** End Broker Company Summary Report */
  /** Start Broker0371 Commission Report(Case 77) */
  GridFilter77_BrokerId;
  GridFilter77_CompanyNumber;
  GridFilter77_CompanyName;
  GridFilter77_CompanyEffectiveDate;
  GridFilter77_BrokerEffectiveDate;
  GridFilter77_BrokerCompanyEffectiveDate;
  GridFilter77_BrokerCompanyExiryDate = '';
  GridFilter77_BrokerCompanyTerminationDate;
  GridFilter77_QBCICommisionRate;
  GridFilter77_WbciCommisionRate;
  GridFilter77_ClientUtilization;
  GridFilter77_CommisionPayable;
  GridFilter77_IsPaid;
  /** End Broker0371 Commission Report(Case 77) */
  /** Start Cardholder Listing Report(Case 75) */
  GridFilter75_CardNumber;
  GridFilter75_CardHolderName;
  GridFilter75_Gender;
  GridFilter75_CardHolderDOB;
  GridFilter75_CardType;
  GridFilter75_CardEffectiveDate;
  GridFilter75_CardTerminationDate;
  GridFilter75_Address;
  GridFilter75_Status;
  /** End Cardholder Listing Report(Case 75) */
  /** Start Division Utilization Report Report(Case 76) */
  GridFilter76_DivName;
  GridFilter76_TotalClaims;
  GridFilter76_TotalEmployee;
  GridFilter76_average;
  GridFilter76_AverageSingle;
  GridFilter76_AverageFamily;
  /** End Division Utilization Report Report(Case 76) */
  /** Start Broker Commission Summary Report(Case 28) */
  GridFilter74_BrokerName;
  GridFilter74_BrokerNumber;
  GridFilter74_CompanyName;
  GridFilter74_CompanyNum;
  GridFilter74_Date;
  GridFilter74_DentalAmount;
  GridFilter74_HealthAmount;
  GridFilter74_VisionAmount;
  GridFilter74_DrugAmount;
  GridFilter74_HSAAmount;
  GridFilter74_TotalAmount;
  GridFilter74_BcdCommissionAmt;
  GridFilter74_BrokerRate;
  GridFilter74_BcdGstAmt;
  /**  End Broker Commission Summary Report(Case 28) */
  /** Start Company Balance Report(Case 8) */
  GridFilter8_CompanyName;
  GridFilter8_CompanyNumber;
  GridFilter8_EffectiveOn;
  GridFilter8_TerminatedOn;
  GridFilter8_Balance;
  GridFilter8_CoPapAmt;
  /** End Company Balance Report(Case 8) */
  /** Start Refund Cheque Summary Report(Case -107) */
  GridFilter107_CompanyName;
  GridFilter107_CompanyNum;
  GridFilter107_Amount;
  GridFilter107_ChequeNum;
  GridFilter107_Date;
  /** End Refund Cheque Summary Report(Case -107) */
  /** Start Provincial Tax Payable Summary Report(Case -105) */
  GridFilter105_CompanyName;
  GridFilter105_CompanyNum;
  GridFilter105_ProvinceName;
  GridFilter105_TaxBaseAmount;
  /** End Provincial Tax Payable Summary Report(Case -105) */
  /** Start Unit Financial Transactions List Report(Case 56) */
  GridFilter56_CompanyName;
  GridFilter56_CompanyNum;
  GridFilter56_CompanyTermDate;
  GridFilter56_CompanyAdminFeeRate;
  GridFilter56_CardholderCount;
  GridFilter56_OtherBroker1;
  GridFilter56_OtherBroker2;
  GridFilter56_OtherBroker3;
  GridFilter56_OtherBroker4;
  GridFilter56_UftCode20;
  GridFilter56_UftCode10;
  GridFilter56_UftCode21;
  GridFilter56_UftCode25;
  GridFilter56_UftCode30;
  GridFilter56_UftCode31;
  GridFilter56_UftCode35;
  GridFilter56_UftCode39;
  GridFilter56_UftCode40;
  GridFilter56_UftCode41;
  GridFilter56_UftCode42;
  GridFilter56_UftCode43;
  GridFilter56_UftCode44;
  GridFilter56_UftCode45;
  GridFilter56_UftCode46;
  GridFilter56_UftCode47;
  GridFilter56_UftCode50;
  GridFilter56_UftCode70;
  GridFilter56_UftCode80;
  GridFilter56_UftCode82;
  GridFilter56_UftCode90;
  GridFilter56_UftCode91;
  GridFilter56_UftCode92;
  GridFilter56_UftCode99;
  /** End Unit Financial Transactions List Report(Case 56) */
  /** Start Unit Financial Transactions Summary Report(Case 44) */
  GridFilter44_CompanyName;
  GridFilter44_CompanyNum;
  GridFilter44_TransCd;
  GridFilter44_TransDesc;
  GridFilter44_TransAmount;
  GridFilter44_TransDate;
  /** End Unit Financial Transactions Summary Report(Case 44) */
  /** Start Unit Financial Transactions Summary Report(Case 59) */
  GridFilter59_CompanyName;
  GridFilter59_CompanyNum;
  GridFilter59_CompanyStatus;
  GridFilter59_CardNumber;
  GridFilter59_PatientName;
  GridFilter59_RefNumber;
  GridFilter59_ClaimSubmission;
  GridFilter59_TotalCostAmount;
  GridFilter59_AdjudDate;
  GridFilter59_Payee;
  /** End Unit Financial Transactions Summary Report(Case 5) */
  /** Start Generate Mail Label Report */
  GridFilterGML_ComponentId;
  GridFilterGML_Name;
  GridFilterGML_Address;
  GridFilterGML_CityName;
  GridFilterGML_ProvinceName;
  GridFilterGML_PostalCode;
  GridFilterGML_CountryName;
  /** End Generate Mail Label Report */
  /** Start Claim Payments by Cardholder Report */
  GridFilter26_CardNum;
  GridFilter26_ConfirmationNum;
  GridFilter26_ProcCode;
  GridFilter26_AmountSubmitted;
  GridFilter26_AmountPaid;
  GridFilter26_CardholderName;
  GridFilter26_ServiceDate;
  GridFilter26_ProcDesc;
  GridFilter26_AmountNotPaid;
  /** Start Claim Payments by Cardholder Report */

  constructor(
    private translate: TranslateService,
    public dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private router: Router,
    private claimService: ClaimService,
    private currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private completerService: CompleterService,
    private exDialog: ExDialog,
    private domSanitizer: DomSanitizer
  ) {
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }

  public cHURPieChartLabels: string[];
  public cHURPieChartData: number[];
  public cHURPieChartType: string = 'pie';
  public cHURPieChartColors = [{ backgroundColor: ['#3B3B3B', '#D36726', '#00BAB5', '#476491', '#389352'], }];
  public cHURPieChartOptions: any = {
    responsive: true,
    pieceLabel: {
      render: 'label',
      fontColor: 'red',
      position: 'outside',
      segment: true
    },
    legend: { position: 'right' }
  };

  ngOnInit() {
    this.dropdownSettings = Constants.multiSelectDropdown
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.getPredictiveCompanySearchData(this.completerService);
        this.getPredictiveBrokerSearchData(this.completerService);
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.getPredictiveBrokerSearchData(this.completerService);
        this.getPredictiveCompanySearchData(this.completerService);
      })
    }
    var self = this
    $(document).on('click', '#providerWithoutEFT > tbody > tr', function () {
      self.selectedReportRowData = self.dataTableService.providerWithoutEFTSelectedRowData
      self.openModalProviderWithoutEFTCreateLetter(self.selectedReportRowData);
    })
    $(document).on('click', '#mail_search_report > tbody > tr', function () {
      self.filteredTableData.push(self.dataTableService.mailLabelFilteredData);
    })
    this.filterReport = new FormGroup({
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      'searchCompany': new FormControl('', []),
      'transactionType': new FormControl('', []),
      'transactionIsPositiveNegative': new FormControl('', []),
      'transactionIsElectronicCheque': new FormControl('', []),
      'brokerNameOrNumber': new FormControl('', []),
      'divisionName': new FormControl('', []),
      'cardHolderNameOrNumber': new FormControl('', []),
      'benefitCategory': new FormControl('', []),
      'claimStatus': new FormControl('', []),
      'licenceNumber': new FormControl('', []),
      'provinceName': new FormControl('', []),
      'businessType': new FormControl('', []),
      'companyStatus': new FormControl('', []),
      'coFlag': new FormControl('', []),
      'overrideReason': new FormControl('', []),
      'displayAddress': new FormControl('', []),
      'displayDependent': new FormControl('', []),
      'transAmtType': new FormControl('', []),
      'claimType': new FormControl('', []),
      'discipline': new FormControl('', []),
      'processorId': new FormControl('', []),
      'cardNumber': new FormControl('', [])
    });
    this.createLetterForm = new FormGroup({
      'createLetter': new FormControl('', [])
    });
    this.financeReportsForm = new FormGroup({
      'id': new FormControl(''),
      'name': new FormControl(''),
      'componentType': new FormControl('', [Validators.required]),
    })
    this.financeGenManualForm = new FormGroup({
      'manualId': new FormControl('', Validators.required),
      'manualName': new FormControl('', Validators.compose([Validators.required, Validators.maxLength(60), CustomValidators.combinationAlphabets])),
      'postalCode': new FormControl('', [Validators.required, Validators.maxLength(7)]),
      'cityName': new FormControl('', [Validators.required, CustomValidators.alphabetsWithApostrophe]),
      'provinceName': new FormControl('', [Validators.required, CustomValidators.alphabetsWithApostrophe]),
      'countryName': new FormControl('', Validators.required),
      'address1': new FormControl('', Validators.required),
      'address2': new FormControl(''),
    })
    this.showFilterFields = [
      { "startDate": true },
      { "endDate": true },
      { "searchCompany": true },
      { "transactionType": true },
      { "transactionIsPositiveNegative": true },
      { "transactionIsElectronicCheque": true },
      { "brokerNameOrNumber": true },
      { "divisionName": true },
      { "cardHolderNameOrNumber": true },
      { "benefitCategory": true },
      { "claimStatus": true },
      { "licenceNumber": true },
      { "provinceName": true },
      { "businessType": true },
      { "companyStatus": true },
      { "coFlag": true },
      { "overrideReason": true },
      { "displayAddress": true },
      { "displayDependent": true },
      { "transactionIsPositiveNegative": true },
      { "claimType": true },
      { "discipline": true },
      { "processorId": true },
      { "cardNumber": true }
    ]
    this.getTransactionType();
    this.getProvinceList();
    this.getBusinessType(); // get list of all Business Type
    /** Start Static Company Status List */
    this.companyStatusList = [
      { companyStatusKey: 'A', companyStatusValue: "Active" },
      { companyStatusKey: 'T', companyStatusValue: "Terminated" },
      { companyStatusKey: 'All', companyStatusValue: "All" }
    ]
    this.companyStatusData = this.completerService.local(
      this.companyStatusList,
      "companyStatusValue",
      "companyStatusValue"
    );
    /** End Static Company Status List */
    /** Start UFT List */
    this.uftList = [
      { uftKey: 'S', uftValue: "Positive" },
      { uftKey: 'D', uftValue: "Negative" },
      { uftKey: 'All', uftValue: "All" }
    ]
    this.uftData = this.completerService.local(
      this.uftList,
      "uftValue",
      "uftValue"
    );
    /** End UFT List */
    /** Start transactionIsElectronicCheque List */
    this.transactionIsElectronicChequeList = [
      { transactionIsElectronicChequeKey: 'E', transactionIsElectronicChequeValue: "Electronic" },
      { transactionIsElectronicChequeKey: 'C', transactionIsElectronicChequeValue: "Cheque" },
      { transactionIsElectronicChequeKey: 'All', transactionIsElectronicChequeValue: "All" }
    ]
    this.transactionIsElectronicChequeData = this.completerService.local(
      this.transactionIsElectronicChequeList,
      "transactionIsElectronicChequeValue",
      "transactionIsElectronicChequeValue"
    );
    /** End transactionIsElectronicCheque List */
    /** Start cardholder Address List */
    this.cardholderAddressList = [
      { cardholderAddressKey: 'F', cardholderAddressValue: "Yes" },
      { cardholderAddressKey: 'T', cardholderAddressValue: "No" }
    ]
    this.cardholderAddressData = this.completerService.local(
      this.cardholderAddressList,
      "cardholderAddressValue",
      "cardholderAddressValue"
    );
    /** End cardholder Address List */
    /** Start dependant List */
    this.dependantList = [
      { dependantKey: 'F', dependantValue: "Yes" },
      { dependantKey: 'T', dependantValue: "No" }
    ]
    this.dependantData = this.completerService.local(
      this.dependantList,
      "dependantValue",
      "dependantValue"
    );
    /** End dependant List */
    /** Start transactionIsPositiveNegative List */
    this.transactionIsPositiveNegativeList = [
      { transactionIsPositiveNegativeKey: 'P', transactionIsPositiveNegativeValue: "Positive" },
      { transactionIsPositiveNegativeKey: 'N', transactionIsPositiveNegativeValue: "Negative" },
      { transactionIsPositiveNegativeKey: 'All', transactionIsPositiveNegativeValue: "All" }
    ]
    this.transactionIsPositiveNegativeData = this.completerService.local(
      this.transactionIsPositiveNegativeList,
      "transactionIsPositiveNegativeValue",
      "transactionIsPositiveNegativeValue"
    );
    /** End transactionIsPositiveNegative List */
    this.componentType = [
      { 'componentKey': 'CARDHOLDER_CMPNT', 'componentName': 'Cardholder Report' },
      { 'componentKey': 'BROKER_CMPNT', 'componentName': 'Broker Report' },
      { 'componentKey': 'COMPANY_CMPNT', 'componentName': 'Company Report' },
      { 'componentKey': 'PROVIDER_CMPNT', 'componentName': 'Provider Report' },
    ];
    this.getPredictiveProcIdSearch(this.completerService);
    $(document).on('click', '#fundingSummaryWithAction .view-ico', function () {
      self.fundingSummarySelectedData = self.dataTableService.fundingSummarySelectedRowData;
      self.bankDetailsKey = self.dataTableService.fundingSummarySelectedRowData.bankDetailsKey;
      self.viewFundingPdf();
    });
    $(document).on('click', '#fundingSummaryWithAction .upload-ico', function () {
      self.fundingSummarySelectedData = self.dataTableService.fundingSummarySelectedRowData;
      self.uploadFundingPdf();
    });
  }

  ngAfterViewInit(): void { }

  /**
   * open report popup
   * @param selectedReportRow 
   */
  openSelectedReportPopup(selectedReportRow) {
    let formData: any;
    if (selectedReportRow != undefined) {
      this.reportID = selectedReportRow.reportid;
      this.transIsPositiveNegative = true;
      if (this.reportID == 8) {
        formData.isDashboard = 'F'
      }
      this.openReportModal(formData, this.reportID, '', false, this.transIsPositiveNegative);
    }
  }

  /**
   * Open Report Modal
   * @param reportID 
   */
  openReportModal(formData, reportID, tableHeading, isDisableTransactionType, isShowHideTransIsPositiveNegative) {
    this.reportID = reportID
    if (reportID == 84) {
      this.reportID = reportID;
      this.openModalWithReportIDNew();
    } else {
      this.checkReportRow(reportID, formData, tableHeading, isDisableTransactionType, isShowHideTransIsPositiveNegative).then(row => {
        if (isDisableTransactionType) {
          setTimeout(() => {
            $('.c-remove').addClass('removeCRemove');
          }, 200);
          $('.c-angle-down').addClass('removeCAngleDown');
        } else {
          $('.c-remove').removeClass('removeCRemove');
          $('.c-angle-down').removeClass('removeCAngleDown');
        }
        this.openModalWithReportID();
      });
    }
  }

  checkReportRow(reportID, uftReqData, tableHeading, isDisableTransactionType, isShowHideTransIsPositiveNegative) {
    if (isDisableTransactionType) {
      this.dropdownSettings = Constants.disabledMultiSelectDropdown;
    } else {
      this.dropdownSettings = Constants.multiSelectDropdown;
    }
    this.showHideNoDataFound = false;
    if (reportID != 83) {
      this.filterReport.controls.searchCompany.setErrors(null);
      this.searchCompanyMandatoryFlag = false;
    } else {
      this.searchCompanyMandatoryFlag = true;
    }
    let promise = new Promise((resolve, reject) => {
      switch (reportID) {
        case 26: //Claim Payments by Cardholder
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.claimPaymentsbyCardholder');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'claimPaymentsByCardholder';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": true }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' }
          ];
          break;
        case -114: //Funding Summary
          this.transIsPositiveNegative = isShowHideTransIsPositiveNegative
          this.selecteCoKey = uftReqData.coKey;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = tableHeading != '' ? tableHeading : this.translate.instant('uft.dashboard.financeReports.fundingSummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          let x =   $("#call").hasClass("active");
          if(x){
            this.bankRecon = true
          }
          if (uftReqData != '' && uftReqData.transCode.length == 1 && (uftReqData.transCode[0].itemName == 90 || uftReqData.transCode[0].itemName == 91 || uftReqData.transCode[0].itemName == 93 || uftReqData.transCode[0].itemName == 94)) {
            this.tableId = 'fundingSummaryWithAction';
          } else if (uftReqData != '' && uftReqData.transCode.length == 1 && (uftReqData.transCode[0].itemName == 80)) {
            this.tableId = 'fundingSummaryWithRCAction';
          } else {
            this.tableId = 'fundingSummary-callIn';
          }
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": true },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": this.transIsPositiveNegative },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionDate'), data: 'unitFinancialTransDt' },
            { title: this.translate.instant('uft.dashboard.financeReports.uftCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' }
          ];
          if (uftReqData) {
            this.filterReport.patchValue({
              "startDate": this.changeDateFormatService.convertStringDateToObject(uftReqData.startDate),
              'endDate': this.changeDateFormatService.convertStringDateToObject(uftReqData.endDate),
              'searchCompany': uftReqData.companyNameAndNo,
            })
            this.selectedCompanyName = ''
            this.selectedCompanyNumber = ''
            /** Start Patch Column Filters */
            if (uftReqData.companyNameAndNo) {
              if (uftReqData.companyNameAndNo.includes(' / ')) {
                var splitCompanyName = uftReqData.companyNameAndNo.toString().split(' / ')
                if (splitCompanyName.length > 0) {
                  this.selectedCompanyName = splitCompanyName[0]
                  this.selectedCompanyNumber = splitCompanyName[1]
                }
              } else {
                this.selectedCompanyName = ''
                this.selectedCompanyNumber = ''
              }
            } else {
              this.selectedCompany = ''
              this.selectedCompanyName = ''
              this.selecteCoKey = ''
              this.selecteCoID = ''
            }
            this.filterCompanyName = this.selectedCompanyName
            this.filterCompanyNumber = this.selectedCompanyNumber
            this.filterTransactionType = []
            if (uftReqData.transCode.length > 0) {
              uftReqData.transCode.forEach(element => {
                this.filterTransactionType.push({ 'id': element.id, 'itemName': element.itemName });
              });
            }
            /** End Patch Column Filters */

            this.transactionType = []
            if (uftReqData.transCode.length > 0) {
              uftReqData.transCode.forEach(element => {
                this.transactionType.push({ 'id': element.id, 'itemName': element.itemName });
              });
            }
          }
          break;
        case -124://Funding Summary
          this.transIsPositiveNegative = isShowHideTransIsPositiveNegative
          this.selecteCoKey = uftReqData.coKey;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = tableHeading != '' ? tableHeading : this.translate.instant('uft.dashboard.financeReports.fundingSummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.bankRecon = true;
          this.tableId = 'bankReportSummary';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
          ];
          this.issuedDate = '';
          this.chequePayee = '';
          this.chequeNumber = '';
          this.chequeAmount = '';
          this.clrDate = '';
          if (uftReqData) {
            this.filterReport.patchValue({
              "startDate": '',
              'endDate': this.changeDateFormatService.convertStringDateToObject(uftReqData.endDate),
            })
          }
          break;
        case -125://Funding Summary
          this.transIsPositiveNegative = isShowHideTransIsPositiveNegative
          this.selecteCoKey = uftReqData.coKey;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = tableHeading != '' ? tableHeading : this.translate.instant('uft.dashboard.financeReports.fundingSummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.bankRecon = true;
          this.tableId = 'bankReportSummary';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.issuedDate = '';
          this.chequePayee = '';
          this.chequeNumber = '';
          this.chequeAmount = '';
          this.clrDate = '';
          if (uftReqData) {
            this.filterReport.patchValue({
              "startDate": "",
              'endDate': this.changeDateFormatService.convertStringDateToObject(uftReqData.endDate),
              'searchCompany': uftReqData.companyNameAndNo,
            })
            this.selectedCompanyName = ''
            this.selectedCompanyNumber = ''
            /** Start Patch Column Filters */
            if (uftReqData.companyNameAndNo) {
              if (uftReqData.companyNameAndNo.includes(' / ')) {
                var splitCompanyName = uftReqData.companyNameAndNo.toString().split(' / ')
                if (splitCompanyName.length > 0) {
                  this.selectedCompanyName = splitCompanyName[0]
                  this.selectedCompanyNumber = splitCompanyName[1]
                }
              } else {
                this.selectedCompanyName = ''
                this.selectedCompanyNumber = ''
              }
            } else {
              this.selectedCompany = ''
              this.selectedCompanyName = ''
              this.selecteCoKey = ''
              this.selecteCoID = ''
            }
            this.filterCompanyName = this.selectedCompanyName
            this.filterCompanyNumber = this.selectedCompanyNumber
            this.filterTransactionType = []
            this.transactionType = []
          }
          break;
        case -126://Funding Summary
          this.transIsPositiveNegative = isShowHideTransIsPositiveNegative
          this.selecteCoKey = uftReqData.coKey;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = tableHeading != '' ? tableHeading : this.translate.instant('uft.dashboard.financeReports.fundingSummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.bankRecon = true
          this.tableId = 'bankReportSummary';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.issuedDate = '';
          this.chequePayee = '';
          this.chequeNumber = '';
          this.chequeAmount = '';
          this.clrDate = '';
          if (uftReqData) {
            this.filterReport.patchValue({
              "startDate": "",
              'endDate': this.changeDateFormatService.convertStringDateToObject(uftReqData.endDate),
              'searchCompany': uftReqData.companyNameAndNo,
            })
            this.selectedCompanyName = ''
            this.selectedCompanyNumber = ''
            /** Start Patch Column Filters */
            if (uftReqData.companyNameAndNo) {
              if (uftReqData.companyNameAndNo.includes(' / ')) {
                var splitCompanyName = uftReqData.companyNameAndNo.toString().split(' / ')
                if (splitCompanyName.length > 0) {
                  this.selectedCompanyName = splitCompanyName[0]
                  this.selectedCompanyNumber = splitCompanyName[1]
                }
              } else {
                this.selectedCompanyName = ''
                this.selectedCompanyNumber = ''
              }
            } else {
              this.selectedCompany = ''
              this.selectedCompanyName = ''
              this.selecteCoKey = ''
              this.selecteCoID = ''
            }
            this.filterCompanyName = this.selectedCompanyName
            this.filterCompanyNumber = this.selectedCompanyNumber
            this.filterTransactionType = []
            this.transactionType = []
          }
          break;
        case -127://Funding Summary
          this.transIsPositiveNegative = isShowHideTransIsPositiveNegative
          this.selecteCoKey = uftReqData.coKey;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = tableHeading != '' ? tableHeading : this.translate.instant('uft.dashboard.financeReports.fundingSummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.bankRecon = true
          this.tableId = 'bankReportSummary';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.issuedDate = '';
          this.chequePayee = '';
          this.chequeNumber = '';
          this.chequeAmount = '';
          this.clrDate = '';
          if (uftReqData) {
            this.filterReport.patchValue({
              "startDate": this.changeDateFormatService.convertStringDateToObject(uftReqData.startDate),
              'endDate': this.changeDateFormatService.convertStringDateToObject(uftReqData.endDate),
              'searchCompany': uftReqData.companyNameAndNo,
            })
            this.selectedCompanyName = ''
            this.selectedCompanyNumber = ''
            /** Start Patch Column Filters */
            if (uftReqData.companyNameAndNo) {
              if (uftReqData.companyNameAndNo.includes(' / ')) {
                var splitCompanyName = uftReqData.companyNameAndNo.toString().split(' / ')
                if (splitCompanyName.length > 0) {
                  this.selectedCompanyName = splitCompanyName[0]
                  this.selectedCompanyNumber = splitCompanyName[1]
                }
              } else {
                this.selectedCompanyName = ''
                this.selectedCompanyNumber = ''
              }
            } else {
              this.selectedCompany = ''
              this.selectedCompanyName = ''
              this.selecteCoKey = ''
              this.selecteCoID = ''
            }
            this.filterCompanyName = this.selectedCompanyName
            this.filterCompanyNumber = this.selectedCompanyNumber
            this.filterTransactionType = []
            this.transactionType = []
          }
          break;
        case -128://Funding Summary
          this.transIsPositiveNegative = isShowHideTransIsPositiveNegative
          this.selecteCoKey = uftReqData.coKey;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = tableHeading != '' ? tableHeading : this.translate.instant('uft.dashboard.financeReports.fundingSummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.bankRecon = true;
          this.tableId = 'bankReportSummary';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.issuedDate = '';
          this.chequePayee = '';
          this.chequeNumber = '';
          this.chequeAmount = '';
          this.clrDate = '';
          if (uftReqData) {
            this.filterReport.patchValue({
              "startDate": "",
              'endDate': this.changeDateFormatService.convertStringDateToObject(uftReqData.endDate),
              'searchCompany': uftReqData.companyNameAndNo,
            })
            this.selectedCompanyName = ''
            this.selectedCompanyNumber = ''
            /** Start Patch Column Filters */
            if (uftReqData.companyNameAndNo) {
              if (uftReqData.companyNameAndNo.includes(' / ')) {
                var splitCompanyName = uftReqData.companyNameAndNo.toString().split(' / ')
                if (splitCompanyName.length > 0) {
                  this.selectedCompanyName = splitCompanyName[0]
                  this.selectedCompanyNumber = splitCompanyName[1]
                }
              } else {
                this.selectedCompanyName = ''
                this.selectedCompanyNumber = ''
              }
            } else {
              this.selectedCompany = ''
              this.selectedCompanyName = ''
              this.selecteCoKey = ''
              this.selecteCoID = ''
            }
            this.filterCompanyName = this.selectedCompanyName
            this.filterCompanyNumber = this.selectedCompanyNumber
            this.filterTransactionType = []
            this.transactionType = []
          }
          break;
        case 49: //Refund Payment Summary 
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.refundPaymentSummary');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'refundPaymentSummary';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": true },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' }
          ];
          break;
        case 28: //Broker Commission Summary  
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.brokerCommissionSummary');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'brokerCommissionSummary';
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' }
          ];
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": true },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 8: //Company Balances 
          this.reportID = reportID;
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.companyBalancesReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'companyBalance';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": true },
            { "coFlag": true },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), data: 'coTerminatedOn' },
            { title: this.translate.instant('uft.dashboard.financeReports.closingBalance'), data: 'coClosingBalance' }
          ];
          break;
        case -8: //Company Balances 
          this.reportID = reportID;
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          if (uftReqData.isDashboard) {
            this.tableId = 'companyOpeningBalances';
            this.uftReqDataArray = uftReqData;
            this.showHideFilter = true;
            this.showReportList = true;
            this.bankRecon = true;
            if (uftReqData.type == 'open') {
              this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.openingBalancesReport');
              this.filterColoumn = [
                { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
                { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
                { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), data: 'coTerminatedOn' },
                { title: this.translate.instant('uft.dashboard.financeReports.openingBalance'), data: 'coOpeningBalance' }
              ];
              var requestData = [
                { 'key': 'startDate', 'value': uftReqData.startDate },
                { 'key': 'endDate', 'value': uftReqData.endDate },
                { 'key': 'compNameAndNo', 'value': this.selectedCompanyName }
              ];
              var apiUrl = UftApi.getCompanyOpeningBalanceReportUrl;
            } else {
              this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.closingBalancesReport');
              this.tableId = 'companyClosingBalances';
              this.filterColoumn = [
                { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
                { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
                { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), data: 'coTerminatedOn' },
                { title: this.translate.instant('uft.dashboard.financeReports.closingBalance'), data: 'amount' }
              ];
              var requestData = [
                { 'key': 'startDate', 'value': uftReqData.startDate },
                { 'key': 'endDate', 'value': uftReqData.endDate },
                { 'key': 'compNameAndNo', 'value': this.selectedCompanyName },
                { 'key': 'status', 'value': uftReqData.companyStatus },
                { 'key': 'coFlag', 'value': uftReqData.coFlag },
                { 'key': 'isDashboard', 'value': uftReqData.isDashboard },
              ];
              var apiUrl = UftApi.getCompanyBalanceReportUrl;
            }
            setTimeout(() => {
              this.createGridWithoutFilter(requestData, apiUrl)
            }, 500);
            if (uftReqData) {
              this.filterReport.patchValue({
                "startDate": this.changeDateFormatService.convertStringDateToObject(uftReqData.startDate),
                'endDate': this.changeDateFormatService.convertStringDateToObject(uftReqData.endDate),
                'searchCompany': uftReqData.companyNameAndNo,
              });
            }
          }
          break;
        case 18: //Company Balances 
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": this.transIsPositiveNegative },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.reportID = reportID;
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          if (uftReqData.isDashboard) {
            this.tableId = 'bankOpeningBalances';
            this.uftReqDataArray = uftReqData;
            this.showHideFilter = false;
            this.showReportList = true;
            this.filterColoumn = [
              { title: this.translate.instant('uft.dashboard.financeReports.issuedDate'), data: 'issueDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.chequePayee'), data: 'chqPayee' },
              { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), data: 'chqNumber' },
              { title: this.translate.instant('uft.dashboard.financeReports.chequeAmount'), data: 'chqAmt' },
              { title: this.translate.instant('uft.dashboard.financeReports.clearedDate'), data: 'clrDate' }
            ];
            var apiUrl = UftApi.getBankReconciliationUrl;
            if (uftReqData.type == 'bank') {
              this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.openingUnclearedCheques');
              requestData = [
                { 'key': 'issueDate', 'value': "" },
                { 'key': 'chqPayee', 'value': "" },
                { 'key': 'chqNumber', 'value': "" },
                { 'key': 'startDate', 'value': "" },
                { 'key': 'endDate', 'value': "" },
                { 'key': 'rptCategory', 'value': "OP" }
              ];
            }
            if (uftReqData.type == 'bankClose') {
              this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.closingUnclearedCheques');
              requestData = [
                { 'key': 'issueDate', 'value': "" },
                { 'key': 'chqPayee', 'value': "" },
                { 'key': 'chqNumber', 'value': "" },
                { 'key': 'startDate', 'value': "" },
                { 'key': 'endDate', 'value': "" },
                { 'key': 'rptCategory', 'value': "CL" }
              ];
            }
            if ($.fn.dataTable.isDataTable('#' + this.tableId)) {
              var table = $('#' + this.tableId).DataTable();
              table.clear();
              table.destroy();
            }
            setTimeout(() => {
              this.createGridWithoutFilter(requestData, apiUrl)
            }, 500);
          }
          break;
        case 41: //Provider Without EFT
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'providerWithoutEFT';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.providerLicenseNumber'), data: 'dentProvLicenseNum' },
            { title: this.translate.instant('uft.dashboard.financeReports.providerName'), data: 'providername' },
            { title: this.translate.instant('uft.dashboard.financeReports.providerAddress'), data: 'dentProvBillAddL1MailAdd' },
            { title: this.translate.instant('uft.dashboard.financeReports.amountHeldPerTRXN'), data: 'sumamount' }
          ];
          if (this.selectedReportRowData.plantype == 'Q') {
            this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.providerReportWithoutEftForQuikcard');
            var apiUrl = UftApi.providerReportWithoutEftQuikcardUrl;
            requestData = [{ 'key': 'businessTypeCd', 'value': this.selectedReportRowData.plantype }]
          } else if (this.selectedReportRowData.plantype == 'S') {
            this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.providerReportWithoutEftForAlberta');
            var apiUrl = UftApi.providerReportWithoutEftAlbertaUrl;
            requestData = []
          }
          setTimeout(() => {
            this.createGridWithoutFilter(requestData, apiUrl)
          }, 500);
          break;
        case 3: //Provider Without EFT
          this.getBusinessType();
          this.showHideFilter = true;
          this.showReportList = false;
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.providerWithoutEftReport');
          this.tableId = 'providerWithoutEFT';
          if (reportID == 3) {
            this.filterReport.controls.startDate.setErrors(null);
            this.filterReport.controls.endDate.setErrors(null);
          }
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": true },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case -105: //Provincial Tax Payable Summary Report 
          this.dropdownSettings = Constants.singleSelectDropdown;
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.provincialTaxPayableSummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'getTaxPayableSummaryReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": true },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' }
          ];
          break;
        case 59: //Unpaid Claims report 
          this.getClaimStatus();
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.unpaidClaimsReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'unpaidClaimsReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": true },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": true },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case -59: //Unpaid Claims report For Company Balance Tab 
          this.getClaimStatus();
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.unpaidClaimsReport');
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.showHideFilter = false;
          this.showReportList = true;
          this.tableId = 'unpaidClaimsReport';
          this.uftReqDataArray = uftReqData;
          this.reportID = reportID;
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'companyNo' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyStatus'), data: 'status' },
            { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), data: 'cardNum' },
            { title: this.translate.instant('uft.dashboard.financeReports.patientName'), data: 'patient' },
            { title: this.translate.instant('uft.dashboard.financeReports.referenceNumber'), data: 'confirmId' },
            { title: this.translate.instant('uft.dashboard.financeReports.claimSubmission'), data: 'claimType' },
            { title: this.translate.instant('uft.dashboard.financeReports.totalCostAmount'), data: 'paidcost' },
            { title: this.translate.instant('uft.dashboard.financeReports.adjudicationDate'), data: 'adjudicateDt' },
            { title: this.translate.instant('uft.dashboard.financeReports.payee'), data: 'payee' }
          ];
          var reportDataArrayComp = [
            { 'key': 'startDate', 'value': uftReqData.startDate },
            { 'key': 'endDate', 'value': uftReqData.endDate },
            { 'key': 'compNameAndNo', 'value': uftReqData.compNameAndNo != undefined ? uftReqData.compNameAndNo : '' },
            { 'key': 'claimStatusList', 'value': [] },
            { 'key': 'status', 'value': '' }
          ];

          var apiUrl = UftApi.getUnpaidClaimsReportUrl;
          setTimeout(() => {
            this.createGridWithoutFilter(reportDataArrayComp, apiUrl)
          }, 500);
          break;
        case 30: //Broker Company Summary Report 
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.brokerCompanySummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'brokerCompanySummaryReport';
          if (reportID == 30) {
            this.filterReport.controls.startDate.setErrors(null);
            this.filterReport.controls.endDate.setErrors(null);
          }
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": true },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 44: //Unit Financial Transactions Summary Report 
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.unitFinancialTransactionsSummaryReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'uFTReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": true },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 51: //Summary of Provider Debits
          this.getBusinessType();
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.providerDebitReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'summaryOfProviderDebits';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": true },
            { "provinceName": false },
            { "businessType": true },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 56: //UFT Report List
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = tableHeading != '' ? tableHeading : this.translate.instant('uft.dashboard.financeReports.unitFinancialTransactionsListReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'uFTReportList';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.postalCode'), data: 'unitFinancialTransDt' },
            { title: this.translate.instant('uft.dashboard.financeReports.effectiveDate'), data: 'coEffectiveDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), data: 'coTerminatedOn' },
            { title: this.translate.instant('uft.dashboard.financeReports.adminFeeRate'), data: 'coAdminFeeRate' },
            { title: this.translate.instant('uft.dashboard.financeReports.cardholderCount'), data: 'coCardHolderCount' },
            { title: this.translate.instant('uft.dashboard.financeReports.primaryBroker'), data: 'primaryBroker' },
            { title: this.translate.instant('uft.dashboard.financeReports.primaryBrokerRate'), data: 'primaryBrokerRate' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker1'), data: 'otherBroker1' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker1Rate'), data: 'otherBroker1Rate' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker2'), data: 'otherBroker2' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker2Rate'), data: 'otherBroker2Rate' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker3'), data: 'otherBroker3' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker3Rate'), data: 'otherBroker3Rate' },
            { title: '10', data: 'uftCode10' },
            { title: '20', data: 'uftCode20' },
            { title: '21', data: 'uftCode21' },
            { title: '25', data: 'uftCode25' },
            { title: '30', data: 'uftCode30' },
            { title: '31', data: 'uftCode31' },
            { title: '35', data: 'uftCode35' },
            { title: '39', data: 'uftCode39' },
            { title: '40', data: 'uftCode40' },
            { title: '41', data: 'uftCode41' },
            { title: '42', data: 'uftCode42' },
            { title: '43', data: 'uftCode43' },
            { title: '44', data: 'uftCode44' },
            { title: '45', data: 'uftCode45' },
            { title: '46', data: 'uftCode46' },
            { title: '47', data: 'uftCode47' },
            { title: '50', data: 'uftCode50' },
            { title: '70', data: 'uftCode70' },
            { title: '80', data: 'uftCode80' },
            { title: '82', data: 'uftCode82' },
            { title: '90', data: 'uftCode90' },
            { title: '91', data: 'uftCode91' },
            { title: '92', data: 'uftCode92' },
            { title: '99', data: 'uftCode99' },
          ];
          break;
        case -104: //Claims Payment Run Summary
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.claimsPaymentRunSummary');
          this.showHideFilter = true;1
          this.showReportList = false;
          this.tableId = 'claimsPaymentRunSummary';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          //New Added
          if (uftReqData) {
            this.filterReport.patchValue({
              "startDate": this.changeDateFormatService.convertStringDateToObject(uftReqData.startDate),
              'endDate': this.changeDateFormatService.convertStringDateToObject(uftReqData.endDate),
              'searchCompany': uftReqData.companyNameAndNo,
            });
          }
          break;
        case -107: //Refund Payment Summary Report 
          this.dropdownSettings = Constants.singleSelectDropdown;
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.refundChequeSummary');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'refundPaymentSummaryReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": true },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'sumTransAmt' },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), data: 'chequeRefNo' },
            { title: this.translate.instant('uft.dashboard.financeReports.date'), data: 'unitFinancialTransDt' }
          ];
          break;
        case 73: //Card Holder Utilization Report
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.cardHolderUtilizationReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'cardHolderUtilizationReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 71: //Card Holder Utilization Report
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.programUtilizationReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'programUtilizationReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case -23: //Override Report   
          this.getOverrideReason();
          this.getBusinessType();
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.overrideReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'overrideReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": true },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": true },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 75: //Cardholder Listing Report    
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.cardholderListingReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'cardholderReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": true },
            { "displayDependent": true },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 74: //Broker Commission Summary
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.brokerCommissionSummary');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'brokerCommissionSummary';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": true },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 76: //Division Utilization Report 
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.divisionUtilizationReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'divisionUtilizationReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 77: //Broker0371 Commission 
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.broker0371CommissionReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'broker0371Commission';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": true },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 79: //QBCI Eligibility Age65 
          if (reportID == 79) {
            this.filterReport.controls.endDate.setErrors(null);
          }
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.qbciEligibilityAge65Report');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'qBCIEligibilityAge65';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 80: //QBCI Eligibility RBC
          if (reportID == 80) {
            this.filterReport.controls.endDate.setErrors(null);
          }
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.qbciEligibilityRbcReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'qBCIEligibilityRBC';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 82: //QBCI Eligibility Travel Insurance
          if (reportID == 82) {
            this.filterReport.controls.startDate.setErrors(null);
            this.filterReport.controls.endDate.setErrors(null);
          }
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.qbciEligibilityTravelInsuranceReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'qBCIEligibilityTravelInsurance';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 81: //QBCI Travel Eligibility Reconciliation
          if (reportID == 81) {
            this.filterReport.controls.endDate.setErrors(null);
          }
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.qbciTravelEligibilityReconciliationReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'qBCITravelEligibility';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 78: //Bank File
          if (reportID == 78) {
            this.filterReport.controls.startDate.setErrors(null);
            this.filterReport.controls.endDate.setErrors(null);
          }
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.bankFile');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'bankFile';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": false },
            { "benefitCategory": false },
            { "claimStatus": false },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false }
          ];
          break;
        case 83: //Amount Paid report 
          this.getClaimStatus();
          this.getBenefits();
          this.getClaimType();
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.amountPaidReport');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'amountPaidReport';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": true },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": true },
            { "cardHolderNameOrNumber": true },
            { "benefitCategory": false },
            { "claimStatus": true },
            { "licenceNumber": false },
            { "provinceName": false },
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "displayDependent": false },
            { "transactionIsPositiveNegative": false },
            { "claimType": true },
            { "discipline": true },
            { "processorId": true },
            { "cardNumber": false }
          ];
          break;
        default:
          this.reportPopUpTitle = '';
          this.showHideNoDataFound = true;
          this.showHideFilter = false;
          this.showReportList = false;
          break;
      }
      resolve();
    });
    return promise;
  }

  /**
   * Submit Reports form
   */
  onSubmitReport(reportData) {
    this.reportData = reportData;
    let reportDataArray;
    let val = $('.bType').val()
    if (val == 'Quikcard') {
      this.btypeEmitted = 'Q'
    }
    if (val == 'AB Gov.') {
      this.btypeEmitted = 'S'
    }
    if (this.bankRecon) {
      this.filterReport.controls.startDate.setErrors(null);
    }
    if (this.reportID == -8) {
      this.filterReport.controls.endDate.setErrors(null);
    }
    if (this.filterReport.valid) {
      this.showReportList = true;
      if (this.selectedCompanyName == '' && this.filterReport.value.searchCompany) {
        this.selectedCompanyName = this.filterReport.value.searchCompany
      }
      switch (this.reportID) {
        case 26: //Claim Payments by Cardholder    
          this.tableId = 'claimPaymentsByCardholder';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'cardNum': reportData.value.cardNumber
          }
          /** Start Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter26_CardNum = '';
            this.GridFilter26_ConfirmationNum = '';
            this.GridFilter26_CardholderName = '';
            this.GridFilter26_ServiceDate = '';
            this.GridFilter26_ProcCode = '';
            this.GridFilter26_ProcDesc = '';
            this.GridFilter26_AmountSubmitted = '';
            this.GridFilter26_AmountPaid = '';
            this.GridFilter26_AmountNotPaid = '';
          }
          /** Patch Column Filters */
          /** Eng Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -114: //Funding Summary        
          let transAmtValue;
          if (this.selectedTransactionType.length == 1 && (this.selectedTransactionType[0].itemName == 90 || this.selectedTransactionType[0].itemName == 93) && this.reportPopUpTitle != 'Funding Summary') {
            this.tableId = 'fundingSummaryWithAction';
          } else if (this.selectedTransactionType.length == 1 && (this.selectedTransactionType[0].itemName == 80) && this.reportPopUpTitle != 'Refund Cheques Report') {
            this.tableId = 'fundingSummaryWithRCAction';
          } else {
            this.tableId = 'fundingSummary-callIn';
          }
          if (this.transIsPositiveNegative) {
            transAmtValue = this.selectedTransactionIsPositiveNegative != undefined ? this.selectedTransactionIsPositiveNegative : '';
          } else {
            transAmtValue = 'All';
          }
          let coName = this.filterCompanyName;
          let coNumb = this.filterCompanyNumber;
          let transCode = this.filterTransactionType
          if (!this.columnFilterSearch) {
            coName = this.selectedCompanyName;
            coNumb = this.selecteCoID;
            transCode = this.selectedTransactionType;
          } else {
            this.filterReport.patchValue({ "searchCompany": '' })
          }
          reportDataArray = {
            'compNameAndNo': coName,
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'transCode': transCode,
            'transAmtType': transAmtValue,
            "coId": coNumb
          }
          /** Patch Column Filters */
          if (!this.columnFilterSearch) {
            this.filterCompanyName = ''
            this.filterCompanyNumber = ''
            this.filterTransDate = ''
            this.filterAmount = ''
            this.filterTransactionType = [];
          }
          if (reportData.value.searchCompany) {
            if (reportData.value.searchCompany.includes(' / ')) {
              var splitCompanyName = reportData.value.searchCompany.toString().split(' / ')
              if (splitCompanyName.length > 0) {
                this.selectedCompanyName = splitCompanyName[0]
                this.selectedCompanyNumber = splitCompanyName[1]
              }
            } else {
              this.selectedCompanyName = ''
              this.selectedCompanyNumber = ''
            }
          } else {
            this.selectedCompany = ''
            this.selectedCompanyName = ''
            this.selecteCoKey = ''
            this.selecteCoID = ''
          }
          this.filterCompanyName = coName;
          this.filterCompanyNumber = coNumb;
          this.filterTransactionType = transCode;
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -124:
          if (!this.columnFilterSearch) {
            this.issuedDate = ''
            this.chequePayee = ''
            this.chequeNumber = ''
            this.chequeAmount = ''
            this.clrDate = '';
          }
          reportDataArray = {
            'issueDate': this.issuedDate != null ? this.changeDateFormatService.convertDateObjectToString(this.issuedDate) : '',
            'startDate': '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'chqNumber': this.chequeNumber,
            'chqPayee': transAmtValue,
            'rptCategory': 'CC',
            'chqAmt': this.chequeAmount,
            'clrDate': this.clrDate != null ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '',
            'businessTypeCd': this.btypeEmitted || '',
            'tranStatusList': ['H']
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -125:
          if (!this.columnFilterSearch) {
            this.issuedDate = ''
            this.chequePayee = ''
            this.chequeNumber = ''
            this.chequeAmount = ''
            this.clrDate = '';
          }
          reportDataArray = {
            'issueDate': this.issuedDate != null ? this.changeDateFormatService.convertDateObjectToString(this.issuedDate) : '',
            'startDate': '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'chqNumber': this.chequeNumber,
            'chqPayee': transAmtValue,
            'rptCategory': 'CI',
            'chqAmt': this.chequeAmount,
            'clrDate': this.clrDate != null ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '',
            'businessTypeCd': this.btypeEmitted || '',
            'tranStatusList': ['A'],
          }
          this.callReportGridApi(reportDataArray, this.reportID);

          break;
        case -126:
          if (!this.columnFilterSearch) {
            this.issuedDate = ''
            this.chequePayee = ''
            this.chequeNumber = ''
            this.chequeAmount = ''
            this.clrDate = '';
          }
          reportDataArray = {
            'issueDate': this.issuedDate != null ? this.changeDateFormatService.convertDateObjectToString(this.issuedDate) : '',
            'startDate': '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'chqNumber': this.chequeNumber,
            'chqPayee': transAmtValue,
            'rptCategory': 'CA',
            'chqAmt': this.chequeAmount,
            'clrDate': this.clrDate != null ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '',
            'businessTypeCd': this.btypeEmitted || '',
            'tranStatusList': ["S", "C", "A"],
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -127:
          if (!this.columnFilterSearch) {
            this.issuedDate = ''
            this.chequePayee = ''
            this.chequeNumber = ''
            this.chequeAmount = ''
            this.clrDate = '';
          }
          reportDataArray = {
            'issueDate': this.issuedDate != null ? this.changeDateFormatService.convertDateObjectToString(this.issuedDate) : '',
            'startDate': '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'chqNumber': this.chequeNumber,
            'chqPayee': transAmtValue,
            'rptCategory': 'OP',
            'chqAmt': this.chequeAmount,
            'clrDate': this.clrDate != null ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '',
            'businessTypeCd': this.btypeEmitted || '',
            'tranStatusList': ["A"]
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -128:
          if (!this.columnFilterSearch) {
            this.issuedDate = ''
            this.chequePayee = ''
            this.chequeNumber = ''
            this.chequeAmount = ''
            this.clrDate = '';
          }
          reportDataArray = {
            'issueDate': this.issuedDate != null ? this.changeDateFormatService.convertDateObjectToString(this.issuedDate) : '',
            'startDate': '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'chqNumber': this.chequeNumber,
            'chqPayee': transAmtValue,
            'rptCategory': 'CL',
            'chqAmt': this.chequeAmount,
            'clrDate': this.clrDate != null ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '',
            'businessTypeCd': this.btypeEmitted || '',
            'tranStatusList': ['A']
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 49: //Refund Payment Summary 
          this.tableId = 'refundPaymentSummary';
          reportDataArray = {
            'compNameAndNo': this.selectedCompanyName,
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'transactionIsElectronicCheque': reportData.value.transactionIsElectronicCheque
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 28: //Broker Commission Summary
          this.tableId = 'brokerCommissionSummary';
          reportDataArray = {
            'compNameAndNo': this.selectedCompanyName,
            'brokerNameOrNumber': reportData.value.brokerNameOrNumber,
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'transactionIsElectronicCheque': reportData.value.transactionIsElectronicCheque
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 8: //Company Balances
          this.tableId = 'companyBalance';
          reportDataArray = {
            'compNameAndNo': this.selectedCompanyName,
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'status': this.selectedCompanyStatus != undefined ? this.selectedCompanyStatus : '',
            'coFlag': this.selectedUFT != undefined ? this.selectedUFT : '',
            'isDashboard': 'F',
          }
          /** Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter8_CompanyName = '';
            this.GridFilter8_CompanyNumber = '';
            this.GridFilter8_EffectiveOn = '';
            this.GridFilter8_TerminatedOn = '';
            this.GridFilter8_Balance = '';
            this.GridFilter8_CoPapAmt = '';
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -8: //Company Balances
          reportDataArray = {
            'compNameAndNo': this.selectedCompanyName,
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'status': this.selectedCompanyStatus != undefined ? this.selectedCompanyStatus : '',
            'coFlag': this.selectedUFT != undefined ? this.selectedUFT : '',
            'isDashboard': 'T',
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 41: //Provider Without EFT
          this.tableId = 'providerWithoutEFT';
          reportDataArray = {
            'brokerNameOrNumber': reportData.value.brokerNameOrNumber,
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'transactionIsElectronicCheque': reportData.value.transactionIsElectronicCheque
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 3: //Provider Without EFT
          if (this.selectedBusinessTypeCd) {
            this.tableId = 'providerWithoutEFT';
            if (this.selectedBusinessTypeCd == 'Q') {
              reportDataArray = { 'businessTypeCd': this.selectedBusinessTypeCd }
            } else if (this.selectedBusinessTypeCd == 'S') {
              reportDataArray = []
            } else if (this.selectedBusinessTypeCd == 'I') {
              this.toastrService.error(this.translate.instant('uft.toaster.noDataFound'));
              return false;
            }
            this.callReportGridApi(reportDataArray, this.reportID);
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.selectBussType'));
          }
          break;
        case -105: //Provincial Tax Payable Summary Report
          this.tableId = 'getTaxPayableSummaryReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            'provinceName': reportData.value.provinceName
          }
          /** Start Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter105_CompanyName = '';
            this.GridFilter105_CompanyNum = '';
            this.GridFilter105_ProvinceName = '';
            this.GridFilter105_TaxBaseAmount = '';
          }
          /** End Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 59: //Unpaid Claims report
          this.tableId = 'unpaidClaimsReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            'claimStatus': reportData.value.claimStatus,
            'status': reportData.value.companyStatus,
          }
          /** Start Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter59_CompanyName = '';
            this.GridFilter59_CompanyNum = '';
            this.GridFilter59_CompanyStatus = '';
            this.GridFilter59_CardNumber = '';
            this.GridFilter59_PatientName = '';
            this.GridFilter59_RefNumber = '';
            this.GridFilter59_ClaimSubmission = '';
            this.GridFilter59_TotalCostAmount = '';
            this.GridFilter59_AdjudDate = '';
            this.GridFilter59_Payee = '';
          }
          /** Patch Column Filters */
          if (reportData.value.searchCompany) {
            if (reportData.value.searchCompany.includes(' / ')) {
              var splitCompanyName = reportData.value.searchCompany.toString().split(' / ')
              if (splitCompanyName.length > 0) {
                this.selectedCompanyName = splitCompanyName[0]
                this.selectedCompanyNumber = splitCompanyName[1]
              }
            } else {
              this.selectedCompanyName = ''
              this.selectedCompanyNumber = ''
            }
          } else {
            this.selectedCompany = ''
            this.selectedCompanyName = ''
            this.selecteCoKey = ''
            this.selecteCoID = ''
          }
          this.GridFilter59_CompanyName = this.selectedCompanyName
          this.GridFilter59_CompanyNum = this.selectedCompanyNumber
          /** End Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -59: //Unpaid Claims report for Company Balance Report
          this.tableId = 'unpaidClaimsReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            'claimStatus': reportData.value.claimStatus,
            'status': reportData.value.companyStatus,
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 30: //Broker Company Summary Report
          this.tableId = 'brokerCompanySummaryReport';
          reportDataArray = {
            'compNameAndNo': this.selectedCompanyName,
            'brokerNameOrNumber': this.selectedBrokerId != undefined ? this.selectedBrokerId : ''
          }
          /** Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter30_BrokerName = '';
            this.GridFilter30_BrokerNumber = '';
            this.GridFilter30_BrokerPrimaryContact = '';
            this.GridFilter30_BrokerTelephone = '';
            this.GridFilter30_CompanyName = '';
            this.GridFilterp30_CompanyEffectiveDate = '';
            this.GridFilter30_CompanyBrokerRate = '';
            this.GridFilter30_CompanyBalance = '';
            this.GridFilter30_CompanyPAPAmount = ''
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 44: //Unit Financial Transactions Summary Report
          this.tableId = 'uFTReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            'transCode': this.selectedTransactionType
          }
          /** Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter44_CompanyName = '';
            this.GridFilter44_CompanyNum = '';
            this.GridFilter44_TransCd = '';
            this.GridFilter44_TransDesc = '';
            this.GridFilter44_TransAmount = '';
            this.GridFilter44_TransDate = '';
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 51: //Summary of Provider Debits 
          if (this.selectedBusinessTypeCd) {
            this.tableId = 'summaryOfProviderDebits';
            reportDataArray = {
              'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
              'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
              'licenceNumber': reportData.value.licenceNumber,
              'businessTypeCd': this.selectedBusinessTypeCd,
            }
            /* 
            Narrow Search Add value
            */
            if (!this.columnFilterSearch) {
              this.GridFilterp51PaymentDate = '';
              this.GridFilterp51dentProvlicenseNum = '';
              this.GridFilterp51ProviderName = '';
              this.GridFilterp51Amount = '';
            }
            this.GridFilterp51dentProvlicenseNum = reportData.value.licenceNumber;
            /* 
            Narrow Search Add value
            */
            this.callReportGridApi(reportDataArray, this.reportID);
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.selectBussType'));
          }
          break;
        case 56: //UFT Report List
          this.tableId = 'uFTReportList';
          reportDataArray = {
            'compNameAndNo': this.selectedCompanyName,
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
          }
          /** Start Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter56_CompanyName = '';
            this.GridFilter56_CompanyNum = '';
            this.GridFilter56_CompanyTermDate = '';
            this.GridFilter56_CompanyAdminFeeRate = '';
            this.GridFilter56_CardholderCount = '';
            this.GridFilter56_OtherBroker1 = '';
            this.GridFilter56_OtherBroker2 = '';
            this.GridFilter56_OtherBroker3 = '';
            this.GridFilter56_OtherBroker4 = '';
            this.GridFilter56_UftCode10 = '';
            this.GridFilter56_UftCode20 = '';
            this.GridFilter56_UftCode21 = '';
            this.GridFilter56_UftCode25 = '';
            this.GridFilter56_UftCode30 = '';
            this.GridFilter56_UftCode31 = '';
            this.GridFilter56_UftCode35 = '';
            this.GridFilter56_UftCode39 = '';
            this.GridFilter56_UftCode40 = '';
            this.GridFilter56_UftCode41 = '';
            this.GridFilter56_UftCode42 = '';
            this.GridFilter56_UftCode43 = '';
            this.GridFilter56_UftCode44 = '';
            this.GridFilter56_UftCode45 = '';
            this.GridFilter56_UftCode46 = '';
            this.GridFilter56_UftCode47 = '';
            this.GridFilter56_UftCode50 = '';
            this.GridFilter56_UftCode70 = '';
            this.GridFilter56_UftCode80 = '';
            this.GridFilter56_UftCode82 = '';
            this.GridFilter56_UftCode90 = '';
            this.GridFilter56_UftCode91 = '';
            this.GridFilter56_UftCode92 = '';
            this.GridFilter56_UftCode99 = '';
          }
          /** End Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -104: //Claims Payment Run Summary 
          this.tableId = 'claimsPaymentRunSummary';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -107: //Refund Payment Summary Report
          this.tableId = 'refundPaymentSummaryReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'coName': this.selectedCompanyName,
            'coId': this.selecteCoID != undefined ? this.selecteCoID : '',
            'transactionIsElectronicCheque': this.selectedTransactionIsElectronicCheque != undefined ? this.selectedTransactionIsElectronicCheque : ''
          }
          /** Start Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter107_CompanyName = '';
            this.GridFilter107_CompanyNum = '';
            this.GridFilter107_Amount = '';
            this.GridFilter107_ChequeNum = '';
            this.GridFilter107_Date = '';
          }
          /** End Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 73: //Card Holder Utilization Report 
          this.tableId = 'cardHolderUtilizationReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 71: //Card Holder Utilization Report 
          this.tableId = 'programUtilizationReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
          }
          /* 
          Narrow Search Add value
          */
          if (!this.columnFilterSearch) {
            this.GridFilterpPaymentDate = '';
            this.GridFilterpProgramType = '';
            this.GridFilterpPaidAmount = '';
            this.GridFilterpClaimedAmount = '';
            this.GridFilterpEligibleClientCount = '';
          }
          /* 
          Narrow Search Add value
          */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case -23: //Override Report
          this.tableId = 'overrideReport';
          if (this.selectedBusinessTypeCd) {
            reportDataArray = {
              'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
              'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
              'compNameAndNo': this.selectedCompanyName,
              'overrideReason': this.selectedOverrideReason,
              'businessTypeCd': this.selectedBusinessTypeCd,
            }
            /** Start Patch Column Filters */
            if (!this.columnFilterSearch) {
              this.filterCardNumber = ''
              this.filterClientName = ''
              this.filterPatientName = ''
              this.filterPatientRole = ''
              this.filterServiceDate = '';
              this.filterServiceProvider = '';
              this.filterProcedureCode = '';
              this.filterOverrideAmount = '';
              this.filterOverrideReason = [];
              this.verificationNumber = '';
            }
            this.filterOverrideReason = this.selectedOverrideReason;
            /** End Patch Column Filters */
            this.callReportGridApi(reportDataArray, this.reportID);
          } else {
            this.toastrService.error(this.translate.instant('uft.toaster.selectBussType'));
          }
          break;
        case 75: //Cardholder Listing report
          this.tableId = 'cardholderReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            'displayAddress': this.selectedCardholderAddress != undefined ? this.selectedCardholderAddress : 'F',
            'displayDependent': this.selectedDependant != undefined ? this.selectedDependant : 'F',
          }
          if (this.selectedCardholderAddress != undefined && this.selectedCardholderAddress == 'T') {
            this.showCardHolderAddress = false;
          } else {
            this.showCardHolderAddress = true;
          }
          /** Start Patch Column Filters */
          if (!this.columnFilterSearch) {
            this.GridFilter75_CardNumber = '';
            this.GridFilter75_CardHolderName = '';
            this.GridFilter75_Gender = '';
            this.GridFilter75_CardHolderDOB = '';
            this.GridFilter75_CardType = '';
            this.GridFilter75_CardEffectiveDate = '';
            this.GridFilter75_CardTerminationDate = '';
            this.GridFilter75_Address = '';
            this.GridFilter75_Status = '';
          }
          /** End Patch Column Filters */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 74: //Broker Commission Summary
          this.tableId = 'brokerCommissionSummary';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            'brokerNameOrNumber': this.selectedBrokerId != undefined ? this.selectedBrokerId : ''
          }
          /** Start Patch Column Filters */
          /** Narrow Search */
          if (!this.columnFilterSearch) {
            this.GridFilter74_BrokerName = '';
            this.GridFilter74_BrokerNumber = '';
            this.GridFilter74_CompanyName = '';
            this.GridFilter74_CompanyNum = '';
            this.GridFilter74_Date = '';
            this.GridFilter74_DentalAmount = '';
            this.GridFilter74_HealthAmount = '';
            this.GridFilter74_VisionAmount = '';
            this.GridFilter74_DrugAmount = ''
            this.GridFilter74_HSAAmount = ''
            this.GridFilter74_TotalAmount = ''
            this.GridFilter74_BcdCommissionAmt = ''
            this.GridFilter74_BrokerRate = ''
            this.GridFilter74_BcdGstAmt = ''
          }
          /** End Patch Column Filters */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 76: //Division Utilization Report
          this.tableId = 'divisionUtilizationReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
          }
          /** Start Patch Column Filters */
          if (!this.columnFilterSearch) {
            this.GridFilter76_DivName = '';
            this.GridFilter76_TotalClaims = '';
            this.GridFilter76_TotalEmployee = '';
            this.GridFilter76_average = '';
            this.GridFilter76_AverageSingle = '';
            this.GridFilter76_AverageFamily = '';
          }
          /** End Patch Column Filters */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 77: //Broker0371 Commission
          if (this.selectedBrokerId == undefined || this.selectedBrokerId == '') {
            this.toastrService.error(this.translate.instant('uft.toaster.selectBrokerNameNum'));
            return false;
          }
          reportDataArray = {
            'fromDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'toDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'brokerId': this.selectedBrokerId != undefined ? this.selectedBrokerId : ''
          }
          /** Start Patch Column Filters */
          if (!this.columnFilterSearch) {
            this.GridFilter77_BrokerId = '';
            this.GridFilter77_CompanyNumber = '';
            this.GridFilter77_CompanyName = '';
            this.GridFilter77_CompanyEffectiveDate = '';
            this.GridFilter77_BrokerEffectiveDate = '';
            this.GridFilter77_BrokerCompanyEffectiveDate = '';
            this.GridFilter77_BrokerCompanyExiryDate = '';
            this.GridFilter77_BrokerCompanyTerminationDate = '';
            this.GridFilter77_QBCICommisionRate = '';
            this.GridFilter77_WbciCommisionRate = '';
            this.GridFilter77_ClientUtilization = '';
            this.GridFilter77_CommisionPayable = '';
            this.GridFilter77_IsPaid = '';
          }
          //this.filterOverrideReason = this.selectedOverrideReason;
          /** End Patch Column Filters */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 79: //QBCI Eligibility Age65
          reportDataArray = {
            'eligibleDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            "start": 0,
            "length": this.dataTableService.totalRecords
          }
          /* 
          Narrow Search Add value
          */
          if (!this.columnFilterSearch) {
            this.GridFilterp79_carrier = '';
            this.GridFilterp79_employerName = '';
            this.GridFilterp79_cardId = '';
            this.GridFilterp79_effectiveDate = '';
            this.GridFilterp79_clientType = '';
            this.GridFilterp79_firstName = '';
            this.GridFilterp79_lastName = '';
            this.GridFilterp79_dob = '';
            this.GridFilterp79_age = '';
            this.GridFilterp79_relationship = '';
            this.GridFilterp79_address1 = '';
            this.GridFilterp79_city = '';
            this.GridFilterp79_province = '';
            this.GridFilterp79_postalCode = '';
            this.GridFilterp79_isBankAccountActive = '';
          }
          /* 
          Narrow Search Add value
          */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 80: //QBCI Eligibility RBC
          reportDataArray = {
            'eligibleDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
          }
          /* 
          Narrow Search Add value
          */
          if (!this.columnFilterSearch) {
            this.GridFilterp80_carrier = '';
            this.GridFilterp80_employerName = '';
            this.GridFilterp80_cardId = '';
            this.GridFilterp80_effectiveDate = '';
            this.GridFilterp80_clientType = '';
            this.GridFilterp80_firstName = '';
            this.GridFilterp80_lastName = '';
            this.GridFilterp80_dob = '';
            this.GridFilterp80_age = '';
            this.GridFilterp80_relationship = '';
            this.GridFilterp80_address1 = '';
            this.GridFilterp80_city = '';
            this.GridFilterp80_province = '';
            this.GridFilterp80_postalCode = '';
            this.GridFilterp80_isBankAccountActive = '';
          }
          /* 
          Narrow Search Add value
          */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 82: //QBCI Eligibility Travel Insurance
          reportDataArray = {
            'eligibleDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 81: //QBCI Travel Eligibility Reconciliation
          reportDataArray = {
            'eligibleDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
          }
          /* 
          Narrow Search Add value
          */
          if (!this.columnFilterSearch) {
            this.GridFilterp81_companyId = '';
            this.GridFilterp81_companyName = '';
            this.GridFilterp81_totalFamilyCount = '';
            this.GridFilterp81_familyAlberta = '';
            this.GridFilterp81_familyBritishColumbia = '';
            this.GridFilterp81_familyManitoba = '';
            this.GridFilterp81_familyNovascotia = '';
            this.GridFilterp81_familyOntario = '';
            this.GridFilterp81_familyQuebec = '';
            this.GridFilterp81_familySaskatchewan = '';
            this.GridFilterp81_familyNewbrunswick = '';
            this.GridFilterp81_familyPrinceEdwardIsland = '';
            this.GridFilterp81_familyYukonTerritory = '';
            this.GridFilterp81_familyNorthWestTerritories = '';
            this.GridFilterp81_familyNewFoundLand = '';
            this.GridFilterp81_familyNunavut = '';
            this.GridFilterp81_totalSingleCount = '';
            this.GridFilterp81_singleAlberta = '';
            this.GridFilterp81_singleBritishColumbia = '';
            this.GridFilterp81_singleManitoba = '';
            this.GridFilterp81_singleNovascotia = '';
            this.GridFilterp81_singleOntario = '';
            this.GridFilterp81_singleQuebec = '';
            this.GridFilterp81_singleSaskatchewan = '';
            this.GridFilterp81_singleNewbrunswick = '';
            this.GridFilterp81_singlePrinceEdwardIsland = '';
            this.GridFilterp81_singleYukonTerritory = '';
            this.GridFilterp81_singleNorthWestTerritories = '';
            this.GridFilterp81_singleNewFoundLand = '';
            this.GridFilterp81_singleNunavut = '';
            this.GridFilterp81_broker1 = '';
            this.GridFilterp81_broker2 = '';
            this.GridFilterp81_broker3 = '';
            this.GridFilterp81_broker4 = '';
          }
          /* 
          Narrow Search Add value
          */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 78: //Bank File
          reportDataArray = {
            'eligibleDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 83: //Amount Paid report
          if (this.selecteCoID == undefined || this.selecteCoID == '') {
            this.toastrService.error(this.translate.instant('uft.toaster.selectCompany'));
            return false;
          }
          this.selecteCoID
          this.tableId = 'amountPaidReport';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'compNameAndNo': this.selecteCoID,
            'divisionKey': reportData.value.divisionName,
            'processorId': reportData.value.processorId,
            'cardNumber': reportData.value.cardHolderNameOrNumber,
            'claimType': reportData.value.claimType,
            'claimStatus': reportData.value.claimStatus,
            'discipline': (reportData.value.discipline != null && reportData.value.discipline != '') ? reportData.value.discipline.toUpperCase() : '',
          }
          /** Start Patch Column Filters */
          this.filterCardNumber = reportData.value.cardHolderNameOrNumber
          /** End Patch Column Filters */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        default:
          this.callReportGridApi(reportData.value, this.reportID);
          break;
      }
    } else {
      this.validateAllFormFields(this.filterReport)
    }
  }

  pushToArray(arr, obj) {
    const index = arr.findIndex((e) => e.key === obj.key);
    if (index === -1) {
      arr.push(obj);
    } else {
      arr[index] = obj;
    }
    return arr;
  }

  /**
   * Call Reports Api And Create Grid
   * @param reportData 
   * @param reportID 
   */

  callReportGridApi(reportData, reportID) {
    if (reportID != 73) {
      this.showReportList = true;
    }
    var reqParam = [];
    let promise = new Promise((resolve, reject) => {
      switch (reportID) {
        case 26: //Claim Payments by Cardholder    
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), data: 'cardNum' },
            { title: this.translate.instant('uft.dashboard.financeReports.confirmationNumber'), data: 'confirmationNum' },
            { title: this.translate.instant('uft.dashboard.financeReports.clientName'), data: 'cardholderName' },
            { title: this.translate.instant('uft.dashboard.financeReports.serviceDate'), data: 'serviceDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.procedureCode'), data: 'procCode' },
            { title: this.translate.instant('uft.dashboard.financeReports.procedureDescription'), data: 'procDesc' },
            { title: this.translate.instant('uft.dashboard.financeReports.amountSubmitted'), data: 'amountSubmitted' },
            { title: this.translate.instant('uft.dashboard.financeReports.amountPaid'), data: 'amountPaid' },
            { title: this.translate.instant('uft.dashboard.financeReports.amountNotPaid'), data: 'amountNotPaid' }
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'cardNum', 'value': reportData.cardNum }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam[2].value = this.GridFilter26_CardNum;
            reqParam = this.pushToArray(reqParam, { 'key': 'confirmationNum', 'value': this.GridFilter26_ConfirmationNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardholderName', 'value': this.GridFilter26_CardholderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'procCode', 'value': this.GridFilter26_ProcCode });
            reqParam = this.pushToArray(reqParam, { 'key': 'procDesc', 'value': this.GridFilter26_ProcDesc });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountSubmitted', 'value': this.GridFilter26_AmountSubmitted });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountPaid', 'value': this.GridFilter26_AmountPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountNotPaid', 'value': this.GridFilter26_AmountNotPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'serviceDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_ServiceDate) });
          }
          /** End Narrow Search */
          var url = UftApi.paymentForCHUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3], '', [6, 7, 8], [], '', [0], [1, 2, 4, 5], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case -114: //Funding Summary          
          var actionColPosition;
          var rightAling = [];
          var dateCol = [];
          let transCodeArray = []
          if (reportData.transCode.length == 1 && (reportData.transCode[0].itemName == 90 || reportData.transCode[0].itemName == 91 || reportData.transCode[0].itemName == 93 || reportData.transCode[0].itemName == 94) && this.reportPopUpTitle != 'Funding Summary') {
            this.tableId = 'fundingSummaryWithAction';
            this.fundingSummaryAction = [
              { 'name': 'view', 'title': 'View', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye' },
              { 'name': 'view', 'title': 'Upload', 'class': 'table-action-btn upload-ico', 'icon_class': 'fa fa-upload' }
            ]
            this.filterColoumn = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
              { title: this.translate.instant('uft.dashboard.financeReports.transactionDate'), data: 'unitFinancialTransDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.uftCode'), data: 'tranCd' },
              { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' },
              { title: this.translate.instant('uft.dashboard.financeReports.action'), data: 'coId' }
            ];
            rightAling = [];
            actionColPosition = 5
            dateCol = [2]
            if (reportData.transCode.length > 0) {
              reportData.transCode.forEach(element => {
                transCodeArray.push(parseInt(element.itemName));
              });
            }
            reqParam = [
              { 'key': 'fromDate', 'value': reportData.startDate },
              { 'key': 'toDate', 'value': reportData.endDate },
              { 'key': 'transCodeList', 'value': transCodeArray },
              { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
              { 'key': 'transAmtType', 'value': (reportData.transAmtType != undefined && reportData.transAmtType != null && reportData.transAmtType != "") ? reportData.transAmtType : 'All' }
            ];
            /** Start Narrow Search */
            if (this.columnFilterSearch) {
              let transCdArr = [];
              if (this.filterTransactionType.length > 0) {
                this.filterTransactionType.forEach(element => {
                  transCdArr.push(parseInt(element.itemName));
                });
              }
              reqParam = this.pushToArray(reqParam, { 'key': 'compNameAndNo', 'value': this.filterCompanyName });
              reqParam = this.pushToArray(reqParam, { 'key': 'transCodeList', 'value': transCdArr });

              reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.filterCompanyNumber });
              reqParam = this.pushToArray(reqParam, { 'key': 'amount', 'value': this.filterAmount });
              reqParam = this.pushToArray(reqParam, { 'key': 'transDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterTransDate) });
            }
            /** End Narrow Search */
          } else if (reportData.transCode.length == 1 && (reportData.transCode[0].itemName == 80) && this.reportPopUpTitle == "Refund Cheques Report") {
            this.tableId = 'fundingSummaryWithRCAction';
            this.fundingSummaryAction = [
              { 'name': 'view', 'title': 'View', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye' },
              { 'name': 'view', 'title': 'Upload', 'class': 'table-action-btn upload-ico', 'icon_class': 'fa fa-upload' }
            ]
            this.filterColoumn = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyID'), data: 'coId' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.status'), data: 'tranStatDesc' },
              { title: this.translate.instant('uft.dashboard.financeReports.processDate'), data: 'coRefundProcessDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalAmount'), data: 'coRefundTotalAmt' },
              { title: this.translate.instant('uft.dashboard.financeReports.transactionDate'), data: 'coRefundTransDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.issueDate'), data: 'coRefundIssueDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.cancelDate'), data: 'coRefundCancelDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.clearDate'), data: 'coRefundClearDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), data: 'coRefundChequeNum' },
            ];
            rightAling = [1, 2, 3, 7, 9]
            actionColPosition = undefined
            dateCol = [5, 6, 8]
            if (reportData.transCode.length > 0) {
              reportData.transCode.forEach(element => {
                transCodeArray.push(parseInt(element.itemName));
              });
            }
            //New Params 22Aug2019
            reqParam = [
              { 'key': 'coRefundChequeNum', 'value': '' },
              { 'key': 'coId', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
              { 'key': 'coRefundTransDtStart', 'value': reportData.startDate },
              { 'key': 'coRefundTransDtEnd', 'value': reportData.endDate },
              { 'key': 'tranStatDesc', 'value': '' },
              { 'key': 'tranTypeDesc', 'value': '' }
            ];
            /** Start Narrow Search */
            if (this.columnFilterSearch) {
              let transCdArr = [];
              if (this.filterTransactionType.length > 0) {
                this.filterTransactionType.forEach(element => {
                  transCdArr.push(parseInt(element.itemName));
                });
              }
              reqParam[1].value = this.filterCompanyName;
              reqParam.push({ 'key': 'amount', 'value': this.filterAmount });
              reqParam.push({ 'key': 'transDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterTransDate) });
              reqParam.push({ 'key': 'processDate', 'value': this.filterProcessDate });
              reqParam.push({ 'key': 'coRefundTotalAmt', 'value': this.filterTotalAmount });
              reqParam.push({ 'key': 'coRefundTransDt', 'value': this.filtercoRefundTransDt });
              reqParam.push({ 'key': 'coRefundIssueDt', 'value': this.filtercoRefundIssueDt });
              reqParam.push({ 'key': 'coRefundCancelDt', 'value': this.filterCancelDate });
              reqParam.push({ 'key': 'coRefundClearDt', 'value': this.filterClearDate });
              reqParam.push({ 'key': 'coRefundChqRefNum', 'value': this.filterStatus });
            }
            /** End Narrow Search */
          } else {
            this.tableId = 'fundingSummary-callIn';
            this.fundingSummaryAction = []
            this.filterColoumn = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
              { title: this.translate.instant('uft.dashboard.financeReports.transactionDate'), data: 'unitFinancialTransDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.uftCode'), data: 'tranCd' },
              { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' }
            ];
            rightAling = [1, 2, 3];
            actionColPosition = undefined
            dateCol = [2]
            if (reportData.transCode.length > 0) {
              reportData.transCode.forEach(element => {
                transCodeArray.push(parseInt(element.itemName));
              });
            }
            reqParam = [
              { 'key': 'fromDate', 'value': reportData.startDate },
              { 'key': 'toDate', 'value': reportData.endDate },
              { 'key': 'transCodeList', 'value': transCodeArray },
              { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
              { 'key': 'transAmtType', 'value': (reportData.transAmtType != undefined && reportData.transAmtType != null && reportData.transAmtType != "") ? reportData.transAmtType : 'All' }
            ];
            /** Start Narrow Search */
            if (this.columnFilterSearch) {
              let transCdArr = [];
              if (this.filterTransactionType.length > 0) {
                this.filterTransactionType.forEach(element => {
                  transCdArr.push(parseInt(element.itemName));
                });
              }
              reqParam = this.pushToArray(reqParam, { 'key': 'compNameAndNo', 'value': this.filterCompanyName });
              reqParam = this.pushToArray(reqParam, { 'key': 'transCodeList', 'value': transCdArr });
              reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.filterCompanyNumber });
              reqParam = this.pushToArray(reqParam, { 'key': 'amount', 'value': this.filterAmount });
              reqParam = this.pushToArray(reqParam, { 'key': 'transDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterTransDate) });
            }
            /** End Narrow Search */
          }
          this.fundingSummaryWithActionReqParam = reqParam;
          if (reportData.transCode.length == 1 && (reportData.transCode[0].itemName == 80) && this.reportPopUpTitle == "Refund Cheques Report") {
            var url = UftApi.companyRefundPaymentsUrl; // New API-21Aug2019       
          } else {
            var url = UftApi.getFundingSummaryReportUrl;
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, this.fundingSummaryAction, actionColPosition, dateCol, '', [4], rightAling, '', [0], [1, 2, 3, 4], [1, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          this.transCodeArrayF = transCodeArray;
          break;
        case -124:
          var actionColPosition;
          var rightAling = [];
          var dateCol = [];
          transCodeArray = []
          reqParam = [
            { 'key': 'issueDate', 'value': reportData.issueDate || '' },
            { 'key': 'chqPayee', 'value': reportData.chqPayee || "" },
            { 'key': 'chqNumber', 'value': reportData.chqNumber || "" },
            { 'key': 'startDate', 'value': reportData.startDate || "" },
            { 'key': 'endDate', 'value': reportData.endDate || "" },
            { 'key': 'rptCategory', 'value': reportData.rptCategory || '' },
            { 'key': 'businessTypeCd', 'value': reportData.businessTypeCd || '' },
            { 'key': 'tranStatusList', 'value': reportData.tranStatusList || [] },
            { 'key': 'clrDate', 'value': reportData.clrDate || "" },
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            let transCdArr = [];
            if (this.filterTransactionType.length > 0) {
              this.filterTransactionType.forEach(element => {
                transCdArr.push(parseInt(element.itemName));
              });
            }
            if (!this.clrDate) {
              this.clrDate = ''
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'issueDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.issuedDate) || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqPayee', 'value': this.chequePayee || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqNumber', 'value': this.chequeNumber || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqAmt', 'value': this.chequeAmount || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'clrDate', 'value': this.clrDate != '' ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '' });
          }
          /** End Narrow Search */
          this.fundingSummaryWithActionReqParam = reqParam;
          var url = UftApi.bankReconciliationReport;
          let filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.issuedDate'), data: "issueDate" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequePayee'), data: "chqPayee" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), data: "chqNumber" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeAmount'), data: "chqAmt" },
            { title: this.translate.instant('uft.dashboard.financeReports.clearedDate'), data: "clrDate" }]
          if ($.fn.dataTable.isDataTable('#' + this.tableId)) {
            var table = $('#' + this.tableId).DataTable();
            table.clear();
            table.destroy();
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, this.fundingSummaryAction, actionColPosition, dateCol, '', [3], rightAling, '', [0, 1, 2, 3, 4], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          this.transCodeArrayF = transCodeArray;
          break;
        case -125:
          var actionColPosition;
          var rightAling = [];
          var dateCol = [];
          transCodeArray = []
          reqParam = [
            { 'key': 'issueDate', 'value': reportData.issueDate || '' },
            { 'key': 'chqPayee', 'value': reportData.chqPayee || "" },
            { 'key': 'chqNumber', 'value': reportData.chqNumber || "" },
            { 'key': 'startDate', 'value': reportData.startDate || "" },
            { 'key': 'endDate', 'value': reportData.endDate || "" },
            { 'key': 'rptCategory', 'value': reportData.rptCategory || '' },
            { 'key': 'businessTypeCd', 'value': reportData.businessTypeCd || '' },
            { 'key': 'tranStatusList', 'value': reportData.tranStatusList || [] },
            { 'key': 'clrDate', 'value': reportData.clrDate || "" },
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            let transCdArr = [];
            if (this.filterTransactionType.length > 0) {
              this.filterTransactionType.forEach(element => {
                transCdArr.push(parseInt(element.itemName));
              });
            }
            if (!this.clrDate) {
              this.clrDate = ''
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'issueDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.issuedDate) || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqPayee', 'value': this.chequePayee || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqNumber', 'value': this.chequeNumber || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqAmt', 'value': this.chequeAmount || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'clrDate', 'value': this.clrDate != '' ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '' });
          }
          /** End Narrow Search */
          this.fundingSummaryWithActionReqParam = reqParam;
          var url = UftApi.bankReconciliationReport;
          filterColoumn = [
            { title: "Issued Date", data: "issueDate" },
            { title: "Cheque Payee", data: "chqPayee" },
            { title: "Cheque Number", data: "chqNumber" },
            { title: "Cheque Amount", data: "chqAmt" },
            { title: "Cleared Date", data: "clrDate" }]
          if ($.fn.dataTable.isDataTable('#' + this.tableId)) {
            var table = $('#' + this.tableId).DataTable();
            table.clear();
            table.destroy();
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, this.fundingSummaryAction, actionColPosition, dateCol, '', [3], rightAling, '', [0, 1, 2, 3, 4], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          this.transCodeArrayF = transCodeArray;
          break;
        case -126:
          var actionColPosition;
          var rightAling = [];
          var dateCol = [];
          transCodeArray = []
          reqParam = [
            { 'key': 'issueDate', 'value': reportData.issueDate || '' },
            { 'key': 'chqPayee', 'value': reportData.chqPayee || "" },
            { 'key': 'chqNumber', 'value': reportData.chqNumber || "" },
            { 'key': 'startDate', 'value': reportData.startDate || "" },
            { 'key': 'endDate', 'value': reportData.endDate || "" },
            { 'key': 'rptCategory', 'value': reportData.rptCategory || '' },
            { 'key': 'businessTypeCd', 'value': reportData.businessTypeCd || '' },
            { 'key': 'tranStatusList', 'value': reportData.tranStatusList || [] },
            { 'key': 'clrDate', 'value': reportData.clrDate || "" },
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            let transCdArr = [];
            if (this.filterTransactionType.length > 0) {
              this.filterTransactionType.forEach(element => {
                transCdArr.push(parseInt(element.itemName));
              });
            }
            if (!this.clrDate) {
              this.clrDate = ''
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'issueDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.issuedDate) || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqPayee', 'value': this.chequePayee || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqNumber', 'value': this.chequeNumber || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqAmt', 'value': this.chequeAmount || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'clrDate', 'value': this.clrDate != '' ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '' });
          }
          /** End Narrow Search */
          this.fundingSummaryWithActionReqParam = reqParam;
          var url = UftApi.bankReconciliationReport;
          filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.issuedDate'), data: "issueDate" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequePayee'), data: "chqPayee" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), data: "chqNumber" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeAmount'), data: "chqAmt" },
            { title: this.translate.instant('uft.dashboard.financeReports.clearedDate'), data: "clrDate" }]
          if ($.fn.dataTable.isDataTable('#' + this.tableId)) {
            var table = $('#' + this.tableId).DataTable();
            table.clear();
            table.destroy();
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, this.fundingSummaryAction, actionColPosition, dateCol, '', [3], rightAling, '', [0, 1, 2, 3, 4], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          this.transCodeArrayF = transCodeArray;
          break;
        case -127:
          var actionColPosition;
          var rightAling = [];
          var dateCol = [];
          transCodeArray = []
          reqParam = [
            { 'key': 'issueDate', 'value': reportData.issueDate || '' },
            { 'key': 'chqPayee', 'value': reportData.chqPayee || "" },
            { 'key': 'chqNumber', 'value': reportData.chqNumber || "" },
            { 'key': 'startDate', 'value': reportData.startDate || "" },
            { 'key': 'endDate', 'value': reportData.endDate || "" },
            { 'key': 'rptCategory', 'value': reportData.rptCategory || '' },
            { 'key': 'businessTypeCd', 'value': reportData.businessTypeCd || '' },
            { 'key': 'tranStatusList', 'value': reportData.tranStatusList || [] },
            { 'key': 'clrDate', 'value': reportData.clrDate || "" },
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            let transCdArr = [];
            if (this.filterTransactionType.length > 0) {
              this.filterTransactionType.forEach(element => {
                transCdArr.push(parseInt(element.itemName));
              });
            }
            if (!this.clrDate) {
              this.clrDate = ''
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'issueDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.issuedDate) || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqPayee', 'value': this.chequePayee || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqNumber', 'value': this.chequeNumber || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqAmt', 'value': this.chequeAmount || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'clrDate', 'value': this.clrDate != '' ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '' });
          }
          /** End Narrow Search */
          this.fundingSummaryWithActionReqParam = reqParam;
          var url = UftApi.bankReconciliationReport;
          filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.issuedDate'), data: "issueDate" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequePayee'), data: "chqPayee" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), data: "chqNumber" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeAmount'), data: "chqAmt" },
            { title: this.translate.instant('uft.dashboard.financeReports.clearedDate'), data: "clrDate" }]
          if ($.fn.dataTable.isDataTable('#' + this.tableId)) {
            var table = $('#' + this.tableId).DataTable();
            table.clear();
            table.destroy();
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, this.fundingSummaryAction, actionColPosition, dateCol, '', [3], rightAling, '', [0, 1, 2, 3, 4], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          this.transCodeArrayF = transCodeArray;
          break;
        case -128:
          var actionColPosition;
          var rightAling = [];
          var dateCol = [];
          transCodeArray = []
          reqParam = [
            { 'key': 'issueDate', 'value': reportData.issueDate || '' },
            { 'key': 'chqPayee', 'value': reportData.chqPayee || "" },
            { 'key': 'chqNumber', 'value': reportData.chqNumber || "" },
            { 'key': 'startDate', 'value': reportData.startDate || "" },
            { 'key': 'endDate', 'value': reportData.endDate || "" },
            { 'key': 'rptCategory', 'value': reportData.rptCategory || '' },
            { 'key': 'businessTypeCd', 'value': reportData.businessTypeCd || '' },
            { 'key': 'tranStatusList', 'value': reportData.tranStatusList || [] },
            { 'key': 'clrDate', 'value': reportData.clrDate || '' },
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            let transCdArr = [];
            if (this.filterTransactionType.length > 0) {
              this.filterTransactionType.forEach(element => {
                transCdArr.push(parseInt(element.itemName));
              });
            }
            if (!this.clrDate) {
              this.clrDate = ''
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'issueDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.issuedDate) || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqPayee', 'value': this.chequePayee || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqNumber', 'value': this.chequeNumber || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'chqAmt', 'value': this.chequeAmount || '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'clrDate', 'value': this.clrDate != '' ? this.changeDateFormatService.convertDateObjectToString(this.clrDate) : '' });
          }
          /** End Narrow Search */
          this.fundingSummaryWithActionReqParam = reqParam;
          var url = UftApi.bankReconciliationReport;
          filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.issuedDate'), data: "issueDate" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequePayee'), data: "chqPayee" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), data: "chqNumber" },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeAmount'), data: "chqAmt" },
            { title: this.translate.instant('uft.dashboard.financeReports.clearedDate'), data: "clrDate" }]
          if ($.fn.dataTable.isDataTable('#' + this.tableId)) {
            var table = $('#' + this.tableId).DataTable();
            table.clear();
            table.destroy();
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [2, 'asc'], '', reqParam, this.fundingSummaryAction, actionColPosition, dateCol, '', [3], rightAling, '', [0, 1, 2, 3, 4], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          this.transCodeArrayF = transCodeArray;
          break;
        case 49: //Refund Payment Summary
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.providerName'), data: 'provinceName' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' }
          ];
          reqParam = [
            { 'key': 'fromDate', 'value': reportData.startDate },
            { 'key': 'toDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'transIsElectronicCheque', 'value': reportData.transactionIsElectronicCheque }
          ];
          var url = UftApi.getFundingSummaryReportPdfUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [3], [1, 2])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 28: //Broker Commission Summary
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'transAmt' }
          ];
          reqParam = [
            { 'key': 'fromDate', 'value': reportData.startDate },
            { 'key': 'toDate', 'value': reportData.endDate },
            { 'key': 'transIsElectronicCheque', 'value': reportData.transactionIsElectronicCheque },
            { 'key': 'brokerNameOrNumber', 'value': reportData.brokerNameOrNumber },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' }
          ];
          var url = UftApi.getFundingSummaryReportPdfUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [2], [1], '', [0], [1, 2])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 8: //Company Balances
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.effectiveDate'), data: 'coEffectiveDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), data: 'coTerminatedOn' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'amount' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyPapAmount'), data: 'coPapAmt' }
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'coFlag', 'value': reportData.coFlag },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'status', 'value': reportData.status },
            { 'key': 'isDashboard', 'value': reportData.isDashboard },
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.GridFilter8_CompanyName });
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.GridFilter8_CompanyNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'effectiveOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter8_EffectiveOn) });
            reqParam = this.pushToArray(reqParam, { 'key': 'coTerminatedOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter8_TerminatedOn) });
            reqParam = this.pushToArray(reqParam, { 'key': 'balance', 'value': this.GridFilter8_Balance });
            reqParam = this.pushToArray(reqParam, { 'key': 'coPapAmt', 'value': this.GridFilter8_CoPapAmt });
          }
          /** End Narrow Search */
          var url = UftApi.getCompanyBalanceReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2, 3], '', [4, 5], [1, 2, 3], '', [0], [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case -8: //Company Balances
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), data: 'coTerminatedOn' },
            { title: this.translate.instant('uft.dashboard.financeReports.closingBalance'), data: 'amount' }
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'coFlag', 'value': reportData.coFlag },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'status', 'value': reportData.status },
            { 'key': 'isDashboard', 'value': reportData.isDashboard },
            { 'key': 'coId', 'value': this.coId },
            { 'key': 'amount', 'value': this.amount },
          ];
          if(this.coTerminatedOn){
            reqParam = this.pushToArray(reqParam,{ 'key': 'coTerminatedOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.coTerminatedOn) });
          }
          var url = UftApi.getCompanyOpeningBalanceReportUrl;
          if(this.tableId=='companyClosingBalances'){
            url = UftApi.getCompanyBalanceReportUrl;
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2], '', [3], [1, 2], '', [0], [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 3: //Provider Without EFT
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.providerLicenseNumber'), data: 'dentProvLicenseNum' },
            { title: this.translate.instant('uft.dashboard.financeReports.providerName'), data: 'providername' },
            { title: this.translate.instant('uft.dashboard.financeReports.providerAddress'), data: 'dentProvBillAddL1MailAdd' },
            { title: this.translate.instant('uft.dashboard.financeReports.amountHeldPerTRXN'), data: 'sumamount' }
          ];
          if (this.selectedBusinessTypeCd == 'Q') {
            var url = UftApi.providerReportWithoutEftQuikcardUrl;
            reqParam = [{ 'key': 'businessTypeCd', 'value': this.selectedBusinessTypeCd }]
          } else if (this.selectedBusinessTypeCd == 'S') {
            var url = UftApi.providerReportWithoutEftAlbertaUrl;
            reqParam = []
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [3], [1, 2], '', [0], [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case -105: //Provincial Tax Payable Summary Report
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.province'), data: 'provinceName' },
            { title: this.translate.instant('uft.dashboard.financeReports.taxBaseAmount'), data: 'transAmt' }
          ];
          reqParam = [
            { 'key': 'fromDate', 'value': reportData.startDate },
            { 'key': 'toDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'provinceName', 'value': reportData.provinceName }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam[3].value = this.GridFilter105_ProvinceName;
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.GridFilter105_CompanyNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.GridFilter105_CompanyName });
            reqParam = this.pushToArray(reqParam, { 'key': 'amount', 'value': this.GridFilter105_TaxBaseAmount });
          }
          /** End Narrow Search */
          var url = UftApi.getProvincialTaxPayableSummaryReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [3], [1, 2], '', [0], [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 59: //Unpaid Claims report 
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'companyNo' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyStatus'), data: 'status' },
            { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), data: 'cardNum' },
            { title: this.translate.instant('uft.dashboard.financeReports.patientName'), data: 'patient' },
            { title: this.translate.instant('uft.dashboard.financeReports.referenceNumber'), data: 'confirmId' },
            { title: this.translate.instant('uft.dashboard.financeReports.claimSubmission'), data: 'claimType' },
            { title: this.translate.instant('uft.dashboard.financeReports.totalCostAmount'), data: 'paidcost' },
            { title: this.translate.instant('uft.dashboard.financeReports.adjudicationDate'), data: 'adjudicateDt' },
            { title: this.translate.instant('uft.dashboard.financeReports.payee'), data: 'payee' }
          ];
          let claimStatusArray = []
          if (this.selectedClaimStatusType.length > 0) {
            this.selectedClaimStatusType.forEach(element => {
              claimStatusArray.push(element.itemName);
            });
          }
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'claimStatusList', 'value': claimStatusArray },
            { 'key': 'status', 'value': reportData.status }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.GridFilter59_CompanyNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.GridFilter59_CompanyName });
            reqParam = this.pushToArray(reqParam, { 'key': 'status', 'value': this.GridFilter59_CompanyStatus });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': this.GridFilter59_CardNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'patientName', 'value': this.GridFilter59_PatientName });
            reqParam = this.pushToArray(reqParam, { 'key': 'referenceNumber', 'value': this.GridFilter59_RefNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'confirmId', 'value': this.GridFilter59_ClaimSubmission });
            reqParam = this.pushToArray(reqParam, { 'key': 'totalCostAmount', 'value': this.GridFilter59_TotalCostAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'adjudDate', 'value': this.GridFilter59_AdjudDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'payee', 'value': this.GridFilter59_Payee });
          }
          /** End Narrow Search */
          var url = UftApi.getUnpaidClaimsReportUrl;
          if (!$.fn.dataTable.isDataTable('#unpaidClaimsReport')) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [8], '', [7], [1, 2, 3, 4, 5, 6, 8], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case -59: //Unpaid Claims report for Company Balance Tab
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'companyNo' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyStatus'), data: 'status' },
            { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), data: 'cardNum' },
            { title: this.translate.instant('uft.dashboard.financeReports.patientName'), data: 'patient' },
            { title: this.translate.instant('uft.dashboard.financeReports.referenceNumber'), data: 'confirmId' },
            { title: this.translate.instant('uft.dashboard.financeReports.claimSubmission'), data: 'claimType' },
            { title: this.translate.instant('uft.dashboard.financeReports.totalCostAmount'), data: 'paidcost' },
            { title: this.translate.instant('uft.dashboard.financeReports.adjudicationDate'), data: 'adjudicateDt' },
            { title: this.translate.instant('uft.dashboard.financeReports.payee'), data: 'payee' }
          ];
          let claimStatusArray1 = []
          if (this.selectedClaimStatusType.length > 0) {
            this.selectedClaimStatusType.forEach(element => {
              claimStatusArray1.push(element.itemName);
            });
          }
          var reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'claimStatusList', 'value': claimStatusArray1 },
            { 'key': 'status', 'value': reportData.status }
          ];
          var url = UftApi.getUnpaidClaimsReportUrl;
          if (!$.fn.dataTable.isDataTable('#unpaidClaimsReport')) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [8], '', [7], [1, 2, 3, 4, 5, 6, 8], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 30: //Broker Company Summary Report 
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.brokerName'), data: 'brokerName' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerNumber'), data: 'brokerId' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerPrimaryContact'), data: 'brokerEmail' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerTelephone'), data: 'brokerPhone' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyEffectiveDate'), data: 'companyEffectiveOn' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyBrokerRate'), data: 'commisionRate' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyBalance'), data: 'balance' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyPapAmount'), data: 'coStandardPapAmt' },
          ];
          reqParam = [
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'brokerId', 'value': reportData.brokerNameOrNumber }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'compNameAndNo', 'value': this.GridFilter30_CompanyName });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerId', 'value': this.GridFilter30_BrokerNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerName', 'value': this.GridFilter30_BrokerName });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerPhone', 'value': this.GridFilter30_BrokerPrimaryContact });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerContactPhoneNum', 'value': this.GridFilter30_BrokerTelephone });
            reqParam = this.pushToArray(reqParam, { 'key': 'CompanyEffectiveOn', 'value': this.GridFilterp30_CompanyEffectiveDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'commisionRate', 'value': this.GridFilter30_CompanyBrokerRate });
            reqParam = this.pushToArray(reqParam, { 'key': 'balance', 'value': this.GridFilter30_CompanyBalance });
            reqParam = this.pushToArray(reqParam, { 'key': 'coStandardPapAmt', 'value': this.GridFilter30_CompanyPAPAmount });
          }
          /** End Narrow Search */
          var url = UftApi.getBrokerCompanySummaryRepoprtUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [5], '', [7, 8], [1, 2, 3, 4, 5], '', [0], [1, 2, 3, 4, 5, 7, 8], [6])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 44: //Unit Financial Transactions Summary Report
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionCode'), data: 'tranCd' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionDescription'), data: 'tranDesc' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionAmount'), data: 'sumtransamt' },
            { title: this.translate.instant('uft.dashboard.financeReports.transactionDate'), data: 'unitFinancialTransDt' }
          ];
          transCodeArray = []
          if (reportData.transCode.length > 0) {
            reportData.transCode.forEach(element => {
              transCodeArray.push(parseInt(element.itemName));
            });
          }
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' }, //reportData.coKey
            { 'key': 'transCodeList', 'value': transCodeArray },
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.GridFilter44_CompanyName });
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.GridFilter44_CompanyNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'transCd', 'value': this.GridFilter44_TransCd });
            reqParam = this.pushToArray(reqParam, { 'key': 'transDesc', 'value': this.GridFilter44_TransDesc });
            reqParam = this.pushToArray(reqParam, { 'key': 'transDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter44_TransDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'transAmount', 'value': this.GridFilter44_TransAmount });
          }
          /** End Narrow Search */
          var url = UftApi.getUFTReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [5], '', [4], [1, 2, 3, 5], '', [0], [1, 2, 3, 4, 5])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 51: //Summary of Provider Debits
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.licenceNumber'), data: 'dentProvlicenseNum' },
            { title: this.translate.instant('uft.dashboard.financeReports.providerName'), data: 'providerName' },
            { title: this.translate.instant('uft.dashboard.financeReports.paymentDate'), data: 'paymentSumRunDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.debitAmount'), data: 'dentProvDebitAmt' }
          ];
          var url = UftApi.getProviderDebitsUrl;
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'dentProvlicenseNum', 'value': reportData.licenceNumber },
            { 'key': 'businessTypeCd', 'value': this.selectedBusinessTypeCd }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            /*
            Summary of Provider Debits
            GridFilterp51PaymentDate
            GridFilterp51dentProvlicenseNum
            GridFilterp51ProviderName
            GridFilterp51Amount 
            */
            reqParam = this.pushToArray(reqParam, { 'key': 'paymentDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp51PaymentDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'dentProvlicenseNum', 'value': this.GridFilterp51dentProvlicenseNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'providerName', 'value': this.GridFilterp51ProviderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'amount', 'value': this.GridFilterp51Amount });
          }
          /** End Narrow Search */
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2], '', [3], [1, 2], '', [0], [1, 2, 3])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 56: //UFT Report List
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyTerminationDate'), data: 'coTerminatedOn' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyAdminFeeRate'), data: 'coAdminFeeRate' },
            { title: this.translate.instant('uft.dashboard.financeReports.cardholderCount'), data: 'coCardHolderCount' },
            { title: this.translate.instant('uft.dashboard.financeReports.primaryBroker'), data: 'primaryBroker' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker1'), data: 'otherBroker1' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker2'), data: 'otherBroker2' },
            { title: this.translate.instant('uft.dashboard.financeReports.otherBroker3'), data: 'otherBroker3' },
            { title: '10', data: 'uftCode10' },
            { title: '20', data: 'uftCode20' },
            { title: '21', data: 'uftCode21' },
            { title: '25', data: 'uftCode25' },
            { title: '30', data: 'uftCode30' },
            { title: '31', data: 'uftCode31' },
            { title: '35', data: 'uftCode35' },
            { title: '39', data: 'uftCode39' },
            { title: '40', data: 'uftCode40' },
            { title: '41', data: 'uftCode41' },
            { title: '42', data: 'uftCode42' },
            { title: '43', data: 'uftCode43' },
            { title: '44', data: 'uftCode44' },
            { title: '45', data: 'uftCode45' },
            { title: '46', data: 'uftCode46' },
            { title: '47', data: 'uftCode47' },
            { title: '50', data: 'uftCode50' },
            { title: '70', data: 'uftCode70' },
            { title: '80', data: 'uftCode80' },
            { title: '82', data: 'uftCode82' },
            { title: '90', data: 'uftCode90' },
            { title: '91', data: 'uftCode91' },
            { title: '92', data: 'uftCode92' },
            { title: '99', data: 'uftCode99' },
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.GridFilter56_CompanyName });
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.GridFilter56_CompanyNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'coTerminatedOn', 'value': this.GridFilter56_CompanyTermDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'coAdminFeeRate', 'value': this.GridFilter56_CompanyAdminFeeRate });
            reqParam = this.pushToArray(reqParam, { 'key': 'coCardCount', 'value': this.GridFilter56_CardholderCount });
            reqParam = this.pushToArray(reqParam, { 'key': 'otherBroker1', 'value': this.GridFilter56_OtherBroker1 });
            reqParam = this.pushToArray(reqParam, { 'key': 'otherBroker2', 'value': this.GridFilter56_OtherBroker2 });
            reqParam = this.pushToArray(reqParam, { 'key': 'otherBroker3', 'value': this.GridFilter56_OtherBroker3 });
            reqParam = this.pushToArray(reqParam, { 'key': 'otherBroker4', 'value': this.GridFilter56_OtherBroker4 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode10', 'value': this.GridFilter56_UftCode10 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode20', 'value': this.GridFilter56_UftCode20 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode21', 'value': this.GridFilter56_UftCode21 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode25', 'value': this.GridFilter56_UftCode25 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode30', 'value': this.GridFilter56_UftCode30 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode31', 'value': this.GridFilter56_UftCode31 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode35', 'value': this.GridFilter56_UftCode35 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode39', 'value': this.GridFilter56_UftCode39 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode40', 'value': this.GridFilter56_UftCode40 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode41', 'value': this.GridFilter56_UftCode41 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode42', 'value': this.GridFilter56_UftCode42 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode43', 'value': this.GridFilter56_UftCode43 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode44', 'value': this.GridFilter56_UftCode44 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode45', 'value': this.GridFilter56_UftCode45 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode46', 'value': this.GridFilter56_UftCode46 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode47', 'value': this.GridFilter56_UftCode47 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode50', 'value': this.GridFilter56_UftCode50 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode70', 'value': this.GridFilter56_UftCode70 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode80', 'value': this.GridFilter56_UftCode80 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode82', 'value': this.GridFilter56_UftCode82 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode90', 'value': this.GridFilter56_UftCode90 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode91', 'value': this.GridFilter56_UftCode91 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode92', 'value': this.GridFilter56_UftCode92 });
            reqParam = this.pushToArray(reqParam, { 'key': 'uftCode99', 'value': this.GridFilter56_UftCode99 });
          }
          /** End Narrow Search */
          var url = UftApi.getUftReportListUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn,
              this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2], '', [5, 8, 10, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], [1, 2, 3, 4, 6, 7, 9, 11, 13,], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case -104: //Claims Payment Run Summary
          let pRunReqParam = {
            "startDate": reportData.startDate,
            "endDate": reportData.endDate
          }
          this.getClaimsPaymentRunSummary(pRunReqParam);
          break;
        case -107: //Refund Payment Summary Report
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.amount'), data: 'sumTransAmt' },
            { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), data: 'chequeRefNo' },
            { title: this.translate.instant('uft.dashboard.financeReports.date'), data: 'unitFinancialTransDt' }
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'coName', 'value': reportData.coName != undefined ? reportData.coName : '' },
            { 'key': 'coId', 'value': reportData.coId != undefined ? reportData.coId : '' },
            { 'key': 'transTypeParam', 'value': reportData.transactionIsElectronicCheque }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam[2].value = this.GridFilter107_CompanyName;
            reqParam[3].value = this.GridFilter107_CompanyNum;
            reqParam = this.pushToArray(reqParam, { 'key': 'date', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter107_Date) });
            reqParam = this.pushToArray(reqParam, { 'key': 'ChequeRefNo', 'value': this.GridFilter107_ChequeNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'balance', 'value': this.GridFilter107_Amount });
          }
          /** End Narrow Search */
          var url = UftApi.refundPaymentSummaryReportPdfUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [4], '', [2], [1, 3, 4], '', [0], [1, 2, 3, 4])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 71:
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.paymentDate'), data: 'paymentDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.programType'), data: 'programType' },
            { title: this.translate.instant('uft.dashboard.financeReports.paidAmount'), data: 'paidAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.claimantAmount'), data: 'claimantCount' },
            { title: this.translate.instant('uft.dashboard.financeReports.eligibleClientCount'), data: 'eligibleClientCount' }
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate }
          ]
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            /*
            GridFilterpPaymentDate
            GridFilterpProgramType
            GridFilterpPaidAmount
            GridFilterpClaimedAmount
            GridFilterpEligibleClientCount
            */
            reqParam = this.pushToArray(reqParam, { 'key': 'paymentDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterpPaymentDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'programType', 'value': this.GridFilterpProgramType });
            reqParam = this.pushToArray(reqParam, { 'key': 'paidAmount', 'value': this.GridFilterpPaidAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'claimedAmount', 'value': this.GridFilterpClaimedAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'eligibleClientCount', 'value': this.GridFilterpEligibleClientCount });
          }
          /** End Narrow Search */
          var url = UftApi.getUtilizationStatisticsGridDataUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [0], '', [2, 3], [], [], [0], [1, 4])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 73: //Card Holder Utilization Report
          let cardHolderURReqParam = {
            "startDate": reportData.startDate,
            "endDate": reportData.endDate
          }
          this.getCardHolderUtilizationReport(cardHolderURReqParam);
          break;
        case -23: //Override Report
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), data: 'cardno' },
            { title: this.translate.instant('uft.dashboard.financeReports.clientName'), data: 'cardholdername' },
            { title: this.translate.instant('uft.dashboard.financeReports.patientName'), data: 'patientname' },
            { title: this.translate.instant('uft.dashboard.financeReports.patientRole'), data: 'patientRole' },
            { title: this.translate.instant('uft.dashboard.financeReports.serviceDate'), data: 'servicedate' },
            { title: this.translate.instant('uft.dashboard.financeReports.serviceProvider'), data: 'providername' },
            { title: this.translate.instant('uft.dashboard.financeReports.procedureCode'), data: 'proccode' },
            { title: this.translate.instant('uft.dashboard.financeReports.overrideAmount'), data: 'amountpaid' },
            { title: this.translate.instant('uft.dashboard.financeReports.overrideReason'), data: 'overridereason' },
            { title: this.translate.instant('uft.dashboard.financeReports.verificationNumber'), data: 'verficationno' }
          ];
          let overrideReasonArray = []
          if (reportData.overrideReason.length > 0) {
            reportData.overrideReason.forEach(element => {
              overrideReasonArray.push(element.itemName);
            });
          }
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'overrideReasonList', 'value': overrideReasonArray },
            { 'key': 'businessTypeCd', 'value': this.selectedBusinessTypeCd }
          ];
          ;
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'overrideAmount', 'value': this.filterOverrideAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'verificationNumber', 'value': this.filterVerificationNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'procedureCode', 'value': this.filterProcedureCode });
            reqParam = this.pushToArray(reqParam, { 'key': 'serviceProvider', 'value': this.filterServiceProvider });
            reqParam = this.pushToArray(reqParam, { 'key': 'serviceDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.filterServiceDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'patientName', 'value': this.filterPatientName });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardHolderName', 'value': this.filterClientName });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': this.filterCardNumber });
          }
          /** End Narrow Search */
          var url = UftApi.getOverrideReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [4], '', [7], [1, 2, 3, 4, 5, 6, 8, 9], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 75: //Cardholder Listing Report 
          if (this.showCardHolderAddress) {
            this.filterColoumn = [
              { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), data: 'cardNum' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardholderName'), data: 'fullName' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardholderGender'), data: 'personGenderCD' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardholderDateOfBirth'), data: 'personDtOfBirth' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardType'), data: 'cardTypeDesc' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardEffectiveDate'), data: 'cardEffDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardTerminationDate'), data: 'cardTerminationDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.address'), data: 'address' },
              { title: this.translate.instant('uft.dashboard.financeReports.status'), data: 'chRoleDesc' }
            ];
            this.colsRight = [1, 2, 3, 4, 5, 6, 7, 8];
          } else {
            this.filterColoumn = [
              { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), data: 'cardNum' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardholderName'), data: 'fullName' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardholderGender'), data: 'personGenderCD' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardholderDateOfBirth'), data: 'personDtOfBirth' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardType'), data: 'cardTypeDesc' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardEffectiveDate'), data: 'cardEffDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardTerminationDate'), data: 'cardTerminationDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.status'), data: 'chRoleDesc' }
            ];
            this.colsRight = [1, 2, 3, 4, 5, 6, 7];
          }
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'displayAddress', 'value': reportData.displayAddress },
            { 'key': 'displayDependent', 'value': reportData.displayDependent }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNum', 'value': this.GridFilter75_CardNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardHolderName', 'value': this.GridFilter75_CardHolderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'gender', 'value': this.GridFilter75_Gender });
            reqParam = this.pushToArray(reqParam, { 'key': 'dob', 'value': this.GridFilter75_CardHolderDOB });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardType', 'value': this.GridFilter75_CardType });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardEffectiveDate', 'value': this.GridFilter75_CardEffectiveDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardTerminationDate', 'value': this.GridFilter75_CardTerminationDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'address', 'value': this.GridFilter75_Address });
            reqParam = this.pushToArray(reqParam, { 'key': 'status', 'value': this.GridFilter75_Status });
          }
          /** End Narrow Search */
          var url = UftApi.getCardholderListReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3, 5, 6], '', '', this.colsRight, '', [], [])
          } else {
            if ($.fn.dataTable.isDataTable('#' + this.tableId)) {
              $('#cardholderReport').DataTable().destroy();
              $('#cardholderReport thead').empty();
              $('#cardholderReport tbody').empty();
              this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3, 5, 6], '', '', this.colsRight, '', [0], [1, 2, 3, 4, 5, 6, 7])
            }
          }
          break;
        case 74: //Broker Commission Summary 
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.brokerName'), data: 'brokerName' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerNumber'), data: 'brokerId' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'coName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'coId' },
            { title: this.translate.instant('uft.dashboard.financeReports.date'), data: 'paymentSumRunDt' },
            { title: this.translate.instant('uft.dashboard.financeReports.dentalAmount'), data: 'dentalAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.healthAmount'), data: 'healthAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.visionAmount'), data: 'visionAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.drugAmount'), data: 'drugAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.supplementAmount'), data: 'hsaAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.totalAmount'), data: 'totalAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerCommissionRate'), data: 'brokerRate' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerCommissionAmount'), data: 'bcdCommissionAmt' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerGSTAmount'), data: 'bcdGstAmt' }
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'companyNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'brokerId', 'value': reportData.brokerNameOrNumber }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam.push({ 'key': 'brokerId', 'value': this.GridFilter74_BrokerNumber });
            reqParam.push({ 'key': 'brokerName', 'value': this.GridFilter74_BrokerName });
            reqParam.push({ 'key': 'coName', 'value': this.GridFilter74_CompanyName });
            reqParam.push({ 'key': 'coId', 'value': this.GridFilter74_CompanyNum });
            reqParam.push({ 'key': 'bcdGstAmt', 'value': this.GridFilter74_BcdGstAmt });
            reqParam.push({ 'key': 'brokerRate', 'value': this.GridFilter74_BrokerRate });
            reqParam.push({ 'key': 'bcdCommissionAmt', 'value': this.GridFilter74_BcdCommissionAmt });
            reqParam.push({ 'key': 'totalAmount ', 'value': this.GridFilter74_TotalAmount });
            reqParam.push({ 'key': 'hsaAmount', 'value': this.GridFilter74_HSAAmount });
            reqParam.push({ 'key': 'drugAmount', 'value': this.GridFilter74_DrugAmount });
            reqParam.push({ 'key': 'visionAmount', 'value': this.GridFilter74_VisionAmount });
            reqParam.push({ 'key': 'healthAmount', 'value': this.GridFilter74_HealthAmount });
            reqParam.push({ 'key': 'dentalAmount', 'value': this.GridFilter74_DentalAmount });
            reqParam.push({ 'key': 'date', 'value': this.GridFilter74_Date });
          }
          /** End Narrow Search */
          var url = UftApi.brokerCommissionSummaryReportPdfUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [4], '', [5, 6, 7, 8, 9, 10, 12, 13], [1, 2, 3, 4, 11])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 76: //Division Utilization Report
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.divisionName'), data: 'divisionName' },
            { title: this.translate.instant('uft.dashboard.financeReports.totalClaims'), data: 'totalClaims' },
            { title: this.translate.instant('uft.dashboard.financeReports.totalEmployee'), data: 'totalEmployee' },
            { title: this.translate.instant('uft.dashboard.financeReports.average'), data: 'avgClaimCard' },
            { title: this.translate.instant('uft.dashboard.financeReports.averageSingle'), data: 'averageSingle' },
            { title: this.translate.instant('uft.dashboard.financeReports.averageFamily'), data: 'averageFamily' }
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'compNameAndNo', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'divName', 'value': this.GridFilter76_DivName });
            reqParam = this.pushToArray(reqParam, { 'key': 'totalClaims', 'value': this.GridFilter76_TotalClaims });
            reqParam = this.pushToArray(reqParam, { 'key': 'totalEmployee', 'value': this.GridFilter76_TotalEmployee });
            reqParam = this.pushToArray(reqParam, { 'key': 'average', 'value': this.GridFilter76_average });
            reqParam = this.pushToArray(reqParam, { 'key': 'averageSingle', 'value': this.GridFilter76_AverageSingle });
            reqParam = this.pushToArray(reqParam, { 'key': 'averageFamily', 'value': this.GridFilter76_AverageFamily });
          }
          /** End Narrow Search */
          var url = UftApi.divisionUtilizationReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', '', [], '', [0], [1, 2, 3, 4, 5])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 77: //Broker0371 Commission        
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.brokerId'), data: 'brokerId' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), data: 'companyNumber' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'companyName' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyEffectiveDate'), data: 'companyEffDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerEffectiveDate'), data: 'brokerEffDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerCompanyEffectiveDate'), data: 'brokerCompanyEffDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerCompanyExpDate'), data: 'brokerCompanyExpDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.brokerCompanyTermDate'), data: 'companyTermDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.qbciCommissionRate'), data: 'qbciCommissionRate' },
            { title: this.translate.instant('uft.dashboard.financeReports.wbciCommissionRate'), data: 'commissionRate' },
            { title: this.translate.instant('uft.dashboard.financeReports.clientUtilization'), data: 'clientUtilization' },
            { title: this.translate.instant('uft.dashboard.financeReports.commissionPayable'), data: 'commissionPayable' },
            { title: this.translate.instant('uft.dashboard.financeReports.isPaid'), data: 'isPaid' }
          ];
          reqParam = [
            { 'key': 'fromDate', 'value': reportData.fromDate },
            { 'key': 'toDate', 'value': reportData.toDate },
            { 'key': 'brokerId', 'value': reportData.brokerId }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerId', 'value': this.filterOverrideAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.GridFilter77_CompanyNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.GridFilter77_CompanyName });
            reqParam = this.pushToArray(reqParam, { 'key': 'coEffectiveOn', 'value': this.GridFilter77_CompanyEffectiveDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerEffectiveOn', 'value': this.GridFilter77_BrokerEffectiveDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerCompanyEffectiveOn', 'value': this.GridFilter77_BrokerCompanyEffectiveDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerCompanyExpireOn', 'value': this.GridFilter77_BrokerCompanyExiryDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerCompanyTermDate', 'value': this.GridFilter77_BrokerCompanyTerminationDate });
            reqParam = this.pushToArray(reqParam, { 'key': 'qbciCommisionRate', 'value': this.GridFilter77_QBCICommisionRate });
            reqParam = this.pushToArray(reqParam, { 'key': 'wbciCommisionRate', 'value': this.GridFilter77_WbciCommisionRate });
            reqParam = this.pushToArray(reqParam, { 'key': 'clientUtilization', 'value': this.GridFilter77_CommisionPayable });
            reqParam = this.pushToArray(reqParam, { 'key': 'isPaid', 'value': this.GridFilter77_IsPaid });
          }
          /** End Narrow Search */
          var url = UftApi.getBrokerCommissionReport;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3, 4, 5, 6, 7], '', [], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 79: //QBCI Eligibility Age65 
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.carrier'), data: 'carrier' },
            { title: this.translate.instant('uft.dashboard.financeReports.employerName'), data: 'employerName' },
            { title: this.translate.instant('uft.dashboard.financeReports.cardId'), data: 'cardId' },
            { title: this.translate.instant('uft.dashboard.financeReports.effectiveDate'), data: 'effectiveDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.clientType'), data: 'clientType' },
            { title: this.translate.instant('uft.dashboard.financeReports.firstName'), data: 'firstName' },
            { title: this.translate.instant('uft.dashboard.financeReports.lastName'), data: 'lastName' },
            { title: this.translate.instant('uft.dashboard.financeReports.dob'), data: 'dob' },
            { title: this.translate.instant('uft.dashboard.financeReports.age'), data: 'age' },
            { title: this.translate.instant('uft.dashboard.financeReports.relationship'), data: 'relationship' },
            { title: this.translate.instant('uft.dashboard.financeReports.address1'), data: 'address1' },
            { title: this.translate.instant('uft.dashboard.financeReports.city'), data: 'city' },
            { title: this.translate.instant('uft.dashboard.financeReports.province'), data: 'province' },
            { title: this.translate.instant('uft.dashboard.financeReports.postalCode'), data: 'postalCode' },
            { title: this.translate.instant('uft.dashboard.financeReports.isBankAccountActive'), data: 'isBankAccountActive' }
          ];
          reqParam = [
            { 'key': 'eligibleDate', 'value': reportData.eligibleDate },
            { 'key': 'start', 'value': 0 },
            { 'key': 'length', 'value': this.dataTableService.totalRecords },
            { 'key': 'excel', 'value': "F" }
          ];
          var url = UftApi.qbciEligibilityAge65Report;
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            /* 
            QBCI Eligibility RBC 
                        
            GridFilterp79_carrier
            GridFilterp79_employerName
            GridFilterp79_cardId
            GridFilterp79_effectiveDate
            GridFilterp79_clientType
            GridFilterp79_firstName
            GridFilterp79_lastName
            GridFilterp79_dob
            GridFilterp79_age
            GridFilterp79_relationship
            GridFilterp79_address1
            GridFilterp79_city
            GridFilterp79_province
            GridFilterp79_postalCode
            GridFilterp79_isBankAccountActive
            */
            reqParam = this.pushToArray(reqParam, { 'key': 'carrier', 'value': this.GridFilterp79_carrier });
            reqParam = this.pushToArray(reqParam, { 'key': 'employerName', 'value': this.GridFilterp79_employerName });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardId', 'value': this.GridFilterp79_cardId });
            reqParam = this.pushToArray(reqParam, { 'key': 'effectiveDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp79_effectiveDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'clientType', 'value': this.GridFilterp79_clientType });
            reqParam = this.pushToArray(reqParam, { 'key': 'firstName', 'value': this.GridFilterp79_firstName });
            reqParam = this.pushToArray(reqParam, { 'key': 'lastName', 'value': this.GridFilterp79_lastName });
            reqParam = this.pushToArray(reqParam, { 'key': 'dob', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp79_dob) });
            reqParam = this.pushToArray(reqParam, { 'key': 'age', 'value': this.GridFilterp79_age });
            reqParam = this.pushToArray(reqParam, { 'key': 'relationship', 'value': this.GridFilterp79_relationship });
            reqParam = this.pushToArray(reqParam, { 'key': 'address1', 'value': this.GridFilterp79_address1 });
            reqParam = this.pushToArray(reqParam, { 'key': 'city', 'value': this.GridFilterp79_city });
            reqParam = this.pushToArray(reqParam, { 'key': 'province', 'value': this.GridFilterp79_province });
            reqParam = this.pushToArray(reqParam, { 'key': 'postalCode', 'value': this.GridFilterp79_postalCode });
            reqParam = this.pushToArray(reqParam, { 'key': 'isBankAccountActive', 'value': this.GridFilterp79_isBankAccountActive });
          }
          /** End Narrow Search */
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3], '', [], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 80: //QBCI Eligibility RBC
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.carrier'), data: 'carrier' },
            { title: this.translate.instant('uft.dashboard.financeReports.employerName'), data: 'employerName' },
            { title: this.translate.instant('uft.dashboard.financeReports.cardId'), data: 'cardId' },
            { title: this.translate.instant('uft.dashboard.financeReports.effectiveDate'), data: 'effectiveDate' },
            { title: this.translate.instant('uft.dashboard.financeReports.clientType'), data: 'clientType' },
            { title: this.translate.instant('uft.dashboard.financeReports.firstName'), data: 'firstName' },
            { title: this.translate.instant('uft.dashboard.financeReports.lastName'), data: 'lastName' },
            { title: this.translate.instant('uft.dashboard.financeReports.dob'), data: 'dob' },
            { title: this.translate.instant('uft.dashboard.financeReports.age'), data: 'age' },
            { title: this.translate.instant('uft.dashboard.financeReports.relationship'), data: 'relationship' },
            { title: this.translate.instant('uft.dashboard.financeReports.address1'), data: 'address1' },
            { title: this.translate.instant('uft.dashboard.financeReports.city'), data: 'city' },
            { title: this.translate.instant('uft.dashboard.financeReports.province'), data: 'province' },
            { title: this.translate.instant('uft.dashboard.financeReports.postalCode'), data: 'postalCode' },
            { title: this.translate.instant('uft.dashboard.financeReports.isBankAccountActive'), data: 'isBankAccountActive' }
          ];
          reqParam = [
            { 'key': 'eligibleDate', 'value': reportData.eligibleDate },
          ];
          var url = UftApi.qbciTravelEligibilityReport;
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            /* 
            QBCI Eligibility RBC        
            GridFilterp80_carrier
            GridFilterp80_employerName
            GridFilterp80_cardId
            GridFilterp80_effectiveDate
            GridFilterp80_clientType
            GridFilterp80_firstName
            GridFilterp80_lastName
            GridFilterp80_dob
            GridFilterp80_age
            GridFilterp80_relationship
            GridFilterp80_address1
            GridFilterp80_city
            GridFilterp80_province
            GridFilterp80_postalCode
            GridFilterp80_isBankAccountActive
            */
            reqParam = this.pushToArray(reqParam, { 'key': 'carrier', 'value': this.GridFilterp80_carrier });
            reqParam = this.pushToArray(reqParam, { 'key': 'employerName', 'value': this.GridFilterp80_employerName });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardId', 'value': this.GridFilterp80_cardId });
            reqParam = this.pushToArray(reqParam, { 'key': 'effectiveDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp80_effectiveDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'clientType', 'value': this.GridFilterp80_clientType });
            reqParam = this.pushToArray(reqParam, { 'key': 'firstName', 'value': this.GridFilterp80_firstName });
            reqParam = this.pushToArray(reqParam, { 'key': 'lastName', 'value': this.GridFilterp80_lastName });
            reqParam = this.pushToArray(reqParam, { 'key': 'dob', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp80_dob) });
            reqParam = this.pushToArray(reqParam, { 'key': 'age', 'value': this.GridFilterp80_age });
            reqParam = this.pushToArray(reqParam, { 'key': 'relationship', 'value': this.GridFilterp80_relationship });
            reqParam = this.pushToArray(reqParam, { 'key': 'address1', 'value': this.GridFilterp80_address1 });
            reqParam = this.pushToArray(reqParam, { 'key': 'city', 'value': this.GridFilterp80_city });
            reqParam = this.pushToArray(reqParam, { 'key': 'province', 'value': this.GridFilterp80_province });
            reqParam = this.pushToArray(reqParam, { 'key': 'postalCode', 'value': this.GridFilterp80_postalCode });
            reqParam = this.pushToArray(reqParam, { 'key': 'isBankAccountActive', 'value': this.GridFilterp80_isBankAccountActive });
          }
          /** End Narrow Search */
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3], '', [], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 82: //QBCI Eligibility Travel Insurance
          break;
        case 78: //Bank File
          break;
        case 81: //QBCI Travel Eligibility Reconciliation
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.companyID'), data: 'companyId' },
            { title: this.translate.instant('uft.dashboard.financeReports.companyName'), data: 'companyName' },
            { title: this.translate.instant('uft.dashboard.financeReports.totalFamilyCount'), data: 'totalFamilyCount' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyAlberta'), data: 'familyAlberta' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyBritishColumbia'), data: 'familyBritishColumbia' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyManitoba'), data: 'familyManitoba' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyNovascotia'), data: 'familyNovascotia' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyOntario'), data: 'familyOntario' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyQuebec'), data: 'familyQuebec' },
            { title: this.translate.instant('uft.dashboard.financeReports.familySaskatchewan'), data: 'familySaskatchewan' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyNewbrunswick'), data: 'familyNewbrunswick' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyPrinceEdwardIsland'), data: 'familyPrinceEdwardIsland' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyYukonTerritory'), data: 'familyYukonTerritory' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyNorthWestTerritories'), data: 'familyNorthWestTerritories' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyNewFoundLand'), data: 'familyNewFoundLand' },
            { title: this.translate.instant('uft.dashboard.financeReports.familyNunavut'), data: 'familyNunavut' },
            { title: this.translate.instant('uft.dashboard.financeReports.totalSingleCount'), data: 'totalSingleCount' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleAlberta'), data: 'singleAlberta' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleBritishColumbia'), data: 'singleBritishColumbia' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleManitoba'), data: 'singleManitoba' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleNovascotia'), data: 'singleNovascotia' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleOntario'), data: 'singleOntario' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleQuebec'), data: 'singleQuebec' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleSaskatchewan'), data: 'singleSaskatchewan' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleNewbrunswick'), data: 'singleNewbrunswick' },
            { title: this.translate.instant('uft.dashboard.financeReports.singlePrinceEdwardIsland'), data: 'singlePrinceEdwardIsland' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleYukonTerritory'), data: 'singleYukonTerritory' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleNorthWestTerritories'), data: 'singleNorthWestTerritories' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleNewFoundLand'), data: 'singleNewFoundLand' },
            { title: this.translate.instant('uft.dashboard.financeReports.singleNunavut'), data: 'singleNunavut' },
            { title: this.translate.instant('uft.dashboard.financeReports.broker1'), data: 'broker1' },
            { title: this.translate.instant('uft.dashboard.financeReports.broker2'), data: 'broker2' },
            { title: this.translate.instant('uft.dashboard.financeReports.broker3'), data: 'broker3' },
            { title: this.translate.instant('uft.dashboard.financeReports.broker4'), data: 'broker4' }
          ];
          reqParam = [
            { 'key': 'eligibleDate', 'value': reportData.eligibleDate },
          ];
          var url = UftApi.qbciTravelEligibilityReconciliationReport;
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            /* 
            QBCI Travel Eligibility Reconciliation            
            GridFilterp81_companyId
            GridFilterp81_companyName
            GridFilterp81_totalFamilyCount
            GridFilterp81_familyAlberta
            GridFilterp81_familyBritishColumbia
            GridFilterp81_familyManitoba
            GridFilterp81_familyNovascotia
            GridFilterp81_familyOntario
            GridFilterp81_familyQuebec
            GridFilterp81_familySaskatchewan
            GridFilterp81_familyNewbrunswick
            GridFilterp81_familyPrinceEdwardIsland
            GridFilterp81_familyYukonTerritory
            GridFilterp81_familyNorthWestTerritories
            GridFilterp81_familyNewFoundLand
            GridFilterp81_familyNunavut
            GridFilterp81_totalSingleCount
            GridFilterp81_singleAlberta
            GridFilterp81_singleBritishColumbia
            GridFilterp81_singleManitoba
            GridFilterp81_singleNovascotia
            GridFilterp81_singleOntario
            GridFilterp81_singleQuebec
            GridFilterp81_singleSaskatchewan
            GridFilterp81_singleNewbrunswick
            GridFilterp81_singlePrinceEdwardIsland
            GridFilterp81_singleYukonTerritory
            GridFilterp81_singleNorthWestTerritories
            GridFilterp81_singleNewFoundLand
            GridFilterp81_singleNunavut
            GridFilterp81_broker1
            GridFilterp81_broker2
            GridFilterp81_broker3
            GridFilterp81_broker4
            */
            reqParam = this.pushToArray(reqParam, { 'key': 'companyId', 'value': this.GridFilterp81_companyId });
            reqParam = this.pushToArray(reqParam, { 'key': 'companyName', 'value': this.GridFilterp81_companyName });
            reqParam = this.pushToArray(reqParam, { 'key': 'totalFamilyCount', 'value': this.GridFilterp81_totalFamilyCount });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyAlberta', 'value': this.GridFilterp81_familyAlberta });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyBritishColumbia', 'value': this.GridFilterp81_familyBritishColumbia });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyManitoba', 'value': this.GridFilterp81_familyManitoba });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyNovascotia', 'value': this.GridFilterp81_familyNovascotia });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyOntario', 'value': this.GridFilterp81_familyOntario });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyQuebec', 'value': this.GridFilterp81_familyQuebec });
            reqParam = this.pushToArray(reqParam, { 'key': 'familySaskatchewan', 'value': this.GridFilterp81_familySaskatchewan });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyNewbrunswick', 'value': this.GridFilterp81_familyNewbrunswick });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyPrinceEdwardIsland', 'value': this.GridFilterp81_familyPrinceEdwardIsland });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyYukonTerritory', 'value': this.GridFilterp81_familyYukonTerritory });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyNorthWestTerritories', 'value': this.GridFilterp81_familyNorthWestTerritories });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyNewFoundLand', 'value': this.GridFilterp81_familyNewFoundLand });
            reqParam = this.pushToArray(reqParam, { 'key': 'familyNunavut', 'value': this.GridFilterp81_familyNunavut });
            reqParam = this.pushToArray(reqParam, { 'key': 'totalSingleCount', 'value': this.GridFilterp81_totalSingleCount });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleAlberta', 'value': this.GridFilterp81_singleAlberta });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleBritishColumbia', 'value': this.GridFilterp81_singleBritishColumbia });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleManitoba', 'value': this.GridFilterp81_singleManitoba });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleNovascotia', 'value': this.GridFilterp81_singleNovascotia });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleOntario', 'value': this.GridFilterp81_singleOntario });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleQuebec', 'value': this.GridFilterp81_singleQuebec });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleSaskatchewan', 'value': this.GridFilterp81_singleSaskatchewan });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleNewbrunswick', 'value': this.GridFilterp81_singleNewbrunswick });
            reqParam = this.pushToArray(reqParam, { 'key': 'singlePrinceEdwardIsland', 'value': this.GridFilterp81_singlePrinceEdwardIsland });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleYukonTerritory', 'value': this.GridFilterp81_singleYukonTerritory });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleNorthWestTerritories', 'value': this.GridFilterp81_singleNorthWestTerritories });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleNewFoundLand', 'value': this.GridFilterp81_singleNewFoundLand });
            reqParam = this.pushToArray(reqParam, { 'key': 'singleNunavut', 'value': this.GridFilterp81_singleNunavut });
            reqParam = this.pushToArray(reqParam, { 'key': 'broker1', 'value': this.GridFilterp81_broker1 });
            reqParam = this.pushToArray(reqParam, { 'key': 'broker2', 'value': this.GridFilterp81_broker2 });
            reqParam = this.pushToArray(reqParam, { 'key': 'broker3', 'value': this.GridFilterp81_broker3 });
            reqParam = this.pushToArray(reqParam, { 'key': 'broker4', 'value': this.GridFilterp81_broker4 });
          }
          /** End Narrow Search */
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 83: //Amount Paid report
          let claimStatusList = []
          if (this.selectedClaimStatusType.length > 0) {
            this.selectedClaimStatusType.forEach(element => {
              claimStatusList.push(element.itemNameCd);
            });
          } else {
            this.claimStatusArray.forEach(element => {
              claimStatusList.push(element.itemNameCd);
            });
          }
          this.filterColoumn = [
            { title: this.translate.instant('uft.dashboard.financeReports.cardholderNumber'), data: 'cardNo' },
            { title: this.translate.instant('uft.dashboard.financeReports.cardholderName'), data: 'cardholderName' },
            { title: this.translate.instant('uft.dashboard.financeReports.patientName'), data: 'patientFirstName' },
            { title: this.translate.instant('uft.dashboard.financeReports.serviceProvider'), data: 'providerFirstName' },
            { title: this.translate.instant('uft.dashboard.financeReports.procedureCode'), data: 'procedureCd' },
            { title: this.translate.instant('uft.dashboard.financeReports.claimedAmount'), data: 'feeClaimedAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.eligibleAmount'), data: 'feeEligibleAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.coveredAmount'), data: 'feeCoveredAmount' },
            { title: this.translate.instant('uft.dashboard.financeReports.cobAmount'), data: 'cobAmt' },
            { title: this.translate.instant('uft.dashboard.financeReports.paidAmount'), data: 'paidAmt' },
          ];
          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'coId', 'value': reportData.compNameAndNo != undefined ? reportData.compNameAndNo : '' },
            { 'key': 'divisionKey', 'value': reportData.divisionKey },
            { 'key': 'processorId', 'value': reportData.processorId },
            { 'key': 'cardNumber', 'value': reportData.cardNumber },
            { 'key': 'claimType', 'value': reportData.claimType },
            { 'key': 'claimStatusList', 'value': claimStatusList },
            { 'key': 'discipline', 'value': reportData.discipline },
            { 'key': 'excel', 'value': 'F' }
          ];
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': this.filterCardNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'procedureCode', 'value': this.filterProcedureCode });
            reqParam = this.pushToArray(reqParam, { 'key': 'cobAmount', 'value': this.filterCobAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'paidAmount', 'value': this.filterPaidAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'coveredAmount', 'value': this.filterCoveredAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'eligibleAmount', 'value': this.filterEligibleAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'claimedAmount', 'value': this.filterClaimedAmount });
            reqParam = this.pushToArray(reqParam, { 'key': 'serviceProvider', 'value': this.filterServiceProvider });
            reqParam = this.pushToArray(reqParam, { 'key': 'patientName', 'value': this.filterPatientName });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardHolderName', 'value': this.filterCardHolderName });
          }
          /** End Narrow Search */
          var url = UftApi.amountPaidReportUrl;
          if (!$.fn.dataTable.isDataTable('#amountPaidReport')) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [5, 6, 7, 8, 9], [1, 2, 3, 4], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
      }
      resolve();
    });
    return promise;
  }

  openModalWithReportID() {
    this.hmsDataService.OpenCloseModal('reportsListPopUp');
    setTimeout(() => {
      if (this.filterReportStartDate != undefined) {
        this.filterReportStartDate.setFocusToInputBox();
      }
    }, 400);
  }

  openModalWithReportIDNew() {
    this.hmsDataService.OpenCloseModal('reportsListPopUpNew');
  }

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.filterReport.patchValue(datePickerValue);
      if (frmControlName == 'startDate') {
        let span1 = document.getElementById('startDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'endDate') {
        let span1 = document.getElementById('endDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
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
      this.filterReport.patchValue(datePickerValue);
      if (frmControlName == 'startDate') {
        let span1 = document.getElementById('startDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'endDate') {
        let span1 = document.getElementById('endDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
    }
    if (this.filterReport.value.startDate && this.filterReport.value.endDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.filterReport.value.startDate.date, this.filterReport.value.endDate.date);
      if (this.error.isError == true) {
        this.filterReport.controls['endDate'].setErrors({
          "EndDateNotValid": true
        });
      }
      // skip cross & calender on single tab
      if (frmControlName == 'startDate') {
        let span1 = document.getElementById('startDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
      if (frmControlName == 'endDate') {
        let span1 = document.getElementById('endDate');
        let row1 = span1.getElementsByTagName('button')
        let arr1 = Array.prototype.slice.call(row1)
        arr1.forEach(element => {
          element.tabIndex = -1;
        });
      }
    }
  }

  getCompanyName(event) {
    this.companyNameText = event
  }

  /* Get Transaction Type List for Predictive Search */
  getTransactionType() {
    this.hmsDataService.getApi(UftApi.getTransactionTypeUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.transactionTypeList.push({ 'id': data.result[i].tranCd, 'itemName': data.result[i].tranCd })
        }
      }
    })
  }


  /* Get Transaction Type List for Predictive Search */
  getClaimStatus() {
    this.claimStatusList = [];
    var URL = UftApi.getClaimStatusListURL;
    this.hmsDataService.getApi(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        for (var i = 0; i < data.result.length; i++) {
          if (data.result[i].claimStatusCd == 'B') {
            data.result[i].claimStatusDesc = 'EXTRA BENEFIT';
          } else if (data.result[i].claimStatusCd == 'C') {
            data.result[i].claimStatusDesc = 'OVER CREDIT LIMIT';
          }
          this.claimStatusArray.push({ 'id': data.result[i].claimStatusKey, 'itemName': data.result[i].claimStatusDesc, 'itemNameCd': data.result[i].claimStatusCd })
          this.claimStatusList.push({ 'id': data.result[i].claimStatusKey, 'itemName': data.result[i].claimStatusDesc, 'itemNameCd': data.result[i].claimStatusCd })
        }
      }
    });
  }

  /**
   * Get Benefit List
   */
  getBenefits() {
    this.hmsDataService.getApi(UftApi.getDisciplineUrl).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.disciplineList = data.result;
        this.disciplineData = this.completerService.local(
          this.disciplineList,
          "disciplineName",
          "disciplineName"
        );
      }
    })
  }

  /**
   * Get Claim Type
   */
  getClaimType() {
    let submitInfo = {
      "businessTypeCd": ''
    }
    this.hmsDataService.postApi(UftApi.getClaimListUrl, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.claimTypeList = data.result;
        this.claimTypeData = this.completerService.local(
          this.claimTypeList,
          "claimTypeDesc",
          "claimTypeDesc"
        );
      }
    })
  }

  /* Get OverrideReason Type List for Predictive Search */
  getOverrideReason() {
    var URL = UftApi.getOverrideTypeListUrl;
    this.hmsDataService.getApi(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        for (var i = 0; i < data.result.length; i++) {
          this.overrideReasonList.push({ 'id': data.result[i].overrideTypeKey, 'itemName': data.result[i].overrideTypeDesc })
        }
      }
    });
  }

  onSelectedUFTCode(selected: CompleterItem) {
    if (selected) {
    }
  }

  /* Method for validate the Form fields */
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

  /**
   * Create grid in the report popup
   * @param apiURL 
   */
  createGridWithoutFilter(requestData, apiURL) {
    if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
      switch (this.tableId) {
        case 'companyOpeningBalances':
        case 'companyClosingBalances':
          this.dataTableService.jqueryDataTable(this.tableId, apiURL, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', requestData, '', undefined, [2], '', [3], [1, 2], '', [0], [1, 2, 3])
          break;
        case 'unpaidClaimsReport':
          this.dataTableService.jqueryDataTable(this.tableId, apiURL, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', requestData, '', undefined, [8], '', [7], [1, 2, 3, 4, 5, 6, 8], '', [0], [1, 2, 3, 4, 5, 6, 7, 8, 9])
          break;

        default:
          this.dataTableService.jqueryDataTable(this.tableId, apiURL, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', requestData, '', undefined, [2], '', [3], [1, 2])
          break;
      }
    } else {
      this.dataTableService.jqueryDataTableReload(this.tableId, apiURL, requestData)
    }
  }

  getDataSet(reqParam, url) {
    this.showPageLoader = true;
    let promise = new Promise((resolve, reject) => {
      this.hmsDataService.postApi(url, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          this.dataSetArray = data.result.data;
          this.showPageLoader = false;
          resolve();
        }
      });
    });
    return promise;
  }

  /**
   * Get selected multi select list
   * @param item 
   */
  onSelectMultiDropDown(item: any, type) {
    switch (type) {
      case 'transactionType':
      case 'transactionTypeF':
        this.selectedTransactionType = []
        for (var j = 0; j < this.transactionType.length; j++) {
          this.selectedTransactionType.push({ 'id': this.transactionType[j]['id'], 'itemName': this.transactionType[j]['itemName'] })
        }
        if (type == 'transactionType') {
          this.filterReport.controls[type].setValue(this.selectedTransactionType);
        } else {
          this.filterTransactionType = this.selectedTransactionType;
        }
        break;

      case 'claimStatus':
        this.selectedClaimStatusType = []
        for (var j = 0; j < this.claimStatus.length; j++) {
          this.selectedClaimStatusType.push({ 'id': this.claimStatus[j]['id'], 'itemName': this.claimStatus[j]['itemName'], 'itemNameCd': this.claimStatus[j]['itemNameCd'] })
        }
        this.filterReport.controls[type].setValue(this.selectedClaimStatusType);
        break;
      case 'overrideReason':
      case 'filterOverrideReason':
        this.selectedOverrideReason = []
        if (type == 'overrideReason') {
          this.filterReport.controls[type].setValue(this.selectedOverrideReason);
          for (var j = 0; j < this.overrideReason.length; j++) {
            this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
          }
        } else if (type == 'filterOverrideReason') {
          for (var j = 0; j < this.filterOverrideReason.length; j++) {
            this.selectedOverrideReason.push({ 'id': this.filterOverrideReason[j]['id'], 'itemName': this.filterOverrideReason[j]['itemName'] })
          }
        } else {
          this.filterOverrideReason = this.selectedOverrideReason;
        }
        break;
    }
  }

  /**
   * Remove multi select
   * @param item 
   * @param type 
   */
  onDeSelectMultiDropDown(item: any, type) {
    if (type == 'transactionType') {
      this.selectedTransactionType = []
      if (this.transactionType.length > 0) {
        for (var j = 0; j < this.transactionType.length; j++) {
          this.selectedTransactionType.push({ 'id': this.transactionType[j]['id'], 'itemName': this.transactionType[j]['itemName'] })
        }
      } else {
        this.filterReport.controls[type].setValue('')
        this.filterTransactionType = [];
      }
    } else if (type == 'claimStatus') {
      this.selectedClaimStatusType = []
      if (this.claimStatus.length > 0) {
        for (var j = 0; j < this.claimStatus.length; j++) {
          this.selectedClaimStatusType.push({ 'id': this.claimStatus[j]['id'], 'itemName': this.claimStatus[j]['itemName'], 'itemNameCd': this.claimStatus[j]['itemNameCd'] })
        }
      } else {
        this.filterReport.controls[type].setValue('')
      }
    }
    else if (type == 'overrideReason') {
      this.selectedOverrideReason = []
      if (this.overrideReason.length > 0) {
        for (var j = 0; j < this.overrideReason.length; j++) {
          this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
        }
      } else {
        this.filterReport.controls[type].setValue('')
      }
    }
    else if (type == 'filterOverrideReason') {
      this.selectedOverrideReason = []
      if (this.filterOverrideReason.length > 0) {
        for (var j = 0; j < this.filterOverrideReason.length; j++) {
          this.selectedOverrideReason.push({ 'id': this.filterOverrideReason[j]['id'], 'itemName': this.filterOverrideReason[j]['itemName'] })
        }
      } else {
      }
    }
  }

  /**
   * On select all multi select dropdown values
   * @param items 
   * @param type 
   */
  onSelectAllMultiDropDown(items: any, type) {
    if (type == 'transactionType') {
      this.selectedTransactionType = []
      for (var j = 0; j < this.transactionType.length; j++) {
        this.selectedTransactionType.push({ 'id': this.transactionType[j]['id'], 'itemName': this.transactionType[j]['itemName'] })
      }
      this.filterReport.controls[type].setValue(this.selectedTransactionType);
      this.filterTransactionType = this.selectedTransactionType;
    } else if (type == 'claimStatus') {
      this.selectedClaimStatusType = []
      for (var j = 0; j < this.claimStatus.length; j++) {
        this.selectedClaimStatusType.push({ 'id': this.claimStatus[j]['id'], 'itemName': this.claimStatus[j]['itemName'], 'itemNameCd': this.claimStatus[j]['itemNameCd'] })
      }
      this.filterReport.controls[type].setValue(this.selectedClaimStatusType);
    }
    else if (type == 'overrideReason') {
      this.selectedOverrideReason = []
      for (var j = 0; j < this.overrideReason.length; j++) {
        this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
      }
      this.filterReport.controls[type].setValue(this.selectedOverrideReason);
    }
    else if (type == 'filterOverrideReason') {
      this.selectedOverrideReason = []
      for (var j = 0; j < this.filterOverrideReason.length; j++) {
        this.selectedOverrideReason.push({ 'id': this.filterOverrideReason[j]['id'], 'itemName': this.filterOverrideReason[j]['itemName'] })
      }
    }
  }

  /**
   * Empty the dropdown value
   * @param items 
   * @param type 
   */
  onDeSelectAllMultiDropDown(items: any, type) {
    if (type == 'transactionType') {
      this.selectedTransactionType = []
      this.filterTransactionType = [];
    } else if (type == 'claimStatus') {
      this.selectedClaimStatusType = []
    } else if (type == 'overrideReason') {
      this.selectedOverrideReason = []
    } else if (type == 'filterOverrideReason') {
      this.selectedOverrideReason = []
    }
  }

  getPredictiveCompanySearchData(completerService) {
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getAllPredectiveCompany + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getPredectiveCompany + '/' + businessTypeKey + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    }
  }

  /**
   * Call on select the company name in predictive search
   * @param selected 
   */
  onCompanyNameSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedCompany = selected.originalObject;
      this.selectedCompanyName = selected.originalObject.coName
      this.selecteCoKey = selected.originalObject.coKey
      this.selecteCoID = selected.originalObject.coId
    } else {
      this.selectedCompanyName = ""
      this.selecteCoKey = ''
      this.selecteCoID = ''
    }
  }

  /**
   * Call on blur the company name text box
   * @param filterReport 
   */
  onCompanyNameBlur(filterReport) {
    if (filterReport.value.searchCompany) {
      if (filterReport.value.searchCompany.includes(' / ')) {
        var splitCompanyName = filterReport.value.searchCompany.toString().split(' / ')
        if (splitCompanyName.length > 0) {
          this.selectedCompanyName = splitCompanyName[0]
        }
      } else {
        this.selectedCompanyName = ''
      }
    } else {
      this.selectedCompany = ''
      this.selectedCompanyName = ''
      this.selecteCoKey = ''
      this.selecteCoID = ''
    }
  }

  /**
   * Select Broker from list
   * @param selected 
   */
  onBrokerNameNoSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedBrokerId = selected.originalObject.brokerId
    } else {
      this.selectedBrokerId = ''
    }
  }

  /**
   * Search Broker List
   * @param completerService 
   */
  getPredictiveBrokerSearchData(completerService) {
    this.brokerNameNoRemoteData = completerService.remote(
      null,
      "brokerIdAndName",
      "brokerIdAndName"
    );
    this.brokerNameNoRemoteData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.brokerNameNoRemoteData.urlFormater((term: any) => {
      return UftApi.getAllPredectiveBrokerUrl + `/${term}`;
    });
    this.brokerNameNoRemoteData.dataField('result');
  }

  /**
   * Empty broker id on blur broker
   * @param filterReport 
   */
  onBlurBrokerNameNo(filterReport) {
    if (filterReport.value.brokerNameOrNumber == '') {
      this.selectedBrokerId = ''
    }
  }
  pdfCommon() {
    var url = UftApi.getFundingSummaryReportUrl
    this.showPageLoader = true;
    let requestParam = {
      'compNameAndNo': this.selectedCompanyName,
      'fromDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
      'toDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
    }
    this.hmsDataService.postApi(url, requestParam).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.showPageLoader = false;
        var rows = data.result.data;
        let fundingReportPDFArray = [];
        for (var i in rows) {
          let checkMainIndex = fundingReportPDFArray.findIndex(x => x.coId === rows[i].coId);
          if (checkMainIndex == -1) {
            fundingReportPDFArray.push({
              "coId": rows[i].coId,
              "coName": rows[i].coName,
              "companyTotal": rows[i].transAmt,
              "tranArray": [
                {
                  "tranCd": rows[i].tranCd,
                  "transAmt": rows[i].transAmt,
                  "taxBaseAmount": rows[i].taxBaseAmount,
                  "transactionCodeDesc": rows[i].transactionCodeDesc,
                  "unitFinancialTransDt": rows[i].unitFinancialTransDt != null ? this.changeDateFormatService.changeDateByMonthName(rows[i].unitFinancialTransDt) : '',
                }
              ]
            });
          } else {
            fundingReportPDFArray[checkMainIndex].companyTotal = fundingReportPDFArray[checkMainIndex].companyTotal + rows[i].transAmt;
            fundingReportPDFArray[checkMainIndex].tranArray.push({
              "tranCd": rows[i].tranCd,
              "transAmt": rows[i].transAmt,
              "taxBaseAmount": rows[i].taxBaseAmount,
              "transactionCodeDesc": rows[i].transactionCodeDesc,
              "unitFinancialTransDt": rows[i].unitFinancialTransDt != null ? this.changeDateFormatService.changeDateByMonthName(rows[i].unitFinancialTransDt) : '',
            });
          }
        }
        var body = [];
        var head = [];
        for (var i in fundingReportPDFArray) {
          body.push({
            "coId": { 'content': fundingReportPDFArray[i].coId + ' ' + fundingReportPDFArray[i].coName, 'colSpan': 5 },
            "unitFinancialTransDt": '',
            "tranCd": '',
            "transactionCodeDesc": '',
            "transAmt": ""
          });
          if (fundingReportPDFArray[i].tranArray.length > 0) {
            for (var j in fundingReportPDFArray[i].tranArray) {
              body.push({
                "coId": ' ',
                "unitFinancialTransDt": fundingReportPDFArray[i].tranArray[j].unitFinancialTransDt,
                "tranCd": fundingReportPDFArray[i].tranArray[j].tranCd,
                "transactionCodeDesc": fundingReportPDFArray[i].tranArray[j].transactionCodeDesc,
                "transAmt": fundingReportPDFArray[i].tranArray[j].transAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(fundingReportPDFArray[i].tranArray[j].transAmt) : '$ 0.00'
              });
            }
          }
          body.push({
            "coId": '',
            "unitFinancialTransDt": '',
            "tranCd": '',
            "transactionCodeDesc": 'Total for Company',
            "transAmt": fundingReportPDFArray[i].companyTotal != undefined ? this.currentUserService.convertAmountToDecimalWithDoller(fundingReportPDFArray[i].companyTotal) : this.currentUserService.convertAmountToDecimalWithDoller(fundingReportPDFArray[i].companyTotal)
          });
        }
        var columns = [
          {
            "coId": '',
            "unitFinancialTransDt": 'Transaction Date',
            "tranCd": "UFT Code",
            "transactionCodeDesc": "Code Description",
            "transAmt": "Amount",
          }
        ];
        var doc = new jsPDF('p', 'pt', 'a3');
        /** Start Header Content */
        var FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
        var endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
        /** End Header Content */
        //Start Header
        var headerobject = [];
        headerobject.push({
          'gridHeader1': this.reportPopUpTitle,
          'text5Date': FromDate + ' - ' + endDate
        });
        this.pdfHeader(doc, headerobject)
        //End Header 
        doc.autoTable({
          head: columns,
          body: body,
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [215, 214, 213],
            lineWidth: 1,
          },
          columnStyles: {
            "coId": { halign: 'left' },
            "unitFinancialTransDt": { halign: 'right' },
            "tranCd": { halign: 'right' },
            "transactionCodeDesc": { halign: 'right' },
            "transAmt": { halign: 'right' }
          },
          didParseCell: function (data) {
            if (data.section == 'head' && data.column.index != 0) {
              data.cell.styles.halign = 'right';
            }
          },
          startY: 100,
          startX: 40,
          theme: 'grid',
        });
        this.pdfFooter(doc, this.reportID);
        doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
      } else if (data.code == 404 && data.status == 'NOT_FOUND') {
        this.showPageLoader = false;
        this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    });
  }
  dowloadPDFReport() {
    let transCodeArray = [];
    let requestParam = {};
    switch (this.reportID) {
      case 26: //Claim Payments by Cardholder
        this.showPageLoader = true;
        var url = UftApi.paymentForCHUrl;
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'cardNum': this.filterReport.value.cardNumber
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam[2].value = this.GridFilter26_CardNum;
          requestParam = this.pushToArray(requestParam, { 'key': 'confirmationNum', 'value': this.GridFilter26_ConfirmationNum });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardholderName', 'value': this.GridFilter26_CardholderName }); requestParam
          requestParam = this.pushToArray(requestParam, { 'key': 'procCode', 'value': this.GridFilter26_ProcCode });
          requestParam = this.pushToArray(requestParam, { 'key': 'procDesc', 'value': this.GridFilter26_ProcDesc });
          requestParam = this.pushToArray(requestParam, { 'key': 'amountSubmitted', 'value': this.GridFilter26_AmountSubmitted });
          requestParam = this.pushToArray(requestParam, { 'key': 'amountPaid', 'value': this.GridFilter26_AmountPaid });
          requestParam = this.pushToArray(requestParam, { 'key': 'amountNotPaid', 'value': this.GridFilter26_AmountNotPaid });
          requestParam = this.pushToArray(requestParam, { 'key': 'serviceDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_ServiceDate) });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.card'), dataKey: 'cardNum' },
              { title: this.translate.instant('uft.dashboard.financeReports.confNumber'), dataKey: 'confirmationNum' },
              { title: this.translate.instant('uft.dashboard.financeReports.clientName'), dataKey: 'cardholderName' },
              { title: this.translate.instant('uft.dashboard.financeReports.serviceDate'), dataKey: 'serviceDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.procedureCode'), dataKey: 'procCode' },
              { title: this.translate.instant('uft.dashboard.financeReports.procedureDescription'), dataKey: 'procDesc' },
              { title: this.translate.instant('uft.dashboard.financeReports.amountSubmitted'), dataKey: 'amountSubmitted' },
              { title: this.translate.instant('uft.dashboard.financeReports.amountPaid'), dataKey: 'amountPaid' },
              { title: this.translate.instant('uft.dashboard.financeReports.amountNotPaid'), dataKey: 'amountNotPaid' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            let claimPaymentsByCardholderArray = [];
            for (var i in rows) {
              let checkMainIndex = claimPaymentsByCardholderArray.findIndex(x => x.cardNum == rows[i].cardNum)
              if (checkMainIndex == -1) {
                claimPaymentsByCardholderArray.push({
                  "cardNum": rows[i].cardNum,
                  "cardNumArray": [
                    {
                      "confirmationNum": rows[i].confirmationNum,
                      "confNumArray": [
                        {
                          "confirmationNum": rows[i].confirmationNum,
                          "cardholderName": rows[i].cardholderName,
                          "serviceDate": rows[i].serviceDate,
                          "procCode": rows[i].procCode,
                          "procDesc": rows[i].procDesc,
                          "amountSubmitted": rows[i].amountSubmitted,
                          "amountPaid": rows[i].amountPaid,
                          "amountNotPaid": rows[i].amountNotPaid
                        }
                      ]
                    }
                  ]
                })
              } else {
                let checkChildIndex = claimPaymentsByCardholderArray[checkMainIndex].cardNumArray.findIndex(x => x.confirmationNum == rows[i].confirmationNum);
                if (checkChildIndex == -1) {
                  claimPaymentsByCardholderArray[checkMainIndex].cardNumArray.push({
                    "confirmationNum": rows[i].confirmationNum,
                    "confNumArray": [
                      {
                        "confirmationNum": rows[i].confirmationNum,
                        "cardholderName": rows[i].cardholderName,
                        "serviceDate": rows[i].serviceDate,
                        "procCode": rows[i].procCode,
                        "procDesc": rows[i].procDesc,
                        "amountSubmitted": rows[i].amountSubmitted,
                        "amountPaid": rows[i].amountPaid,
                        "amountNotPaid": rows[i].amountNotPaid
                      }
                    ]
                  });
                } else {
                  claimPaymentsByCardholderArray[checkMainIndex].cardNumArray[checkChildIndex].confNumArray.push({
                    "confirmationNum": rows[i].confirmationNum,
                    "cardholderName": rows[i].cardholderName,
                    "serviceDate": rows[i].serviceDate,
                    "procCode": rows[i].procCode,
                    "procDesc": rows[i].procDesc,
                    "amountSubmitted": rows[i].amountSubmitted,
                    "amountPaid": rows[i].amountPaid,
                    "amountNotPaid": rows[i].amountNotPaid
                  });
                }
              }
            }
            var body = [];
            var head = [];
            //Row For Total Amount Show
            var amount_submitted_total = '';
            var amount_paid_total = '';
            var amount_notPaid_total = '';
            var grand_amount_submitted_total = '';
            var grand_amount_paid_total = '';
            var grand_amount_notPaid_total = '';
            for (var i in claimPaymentsByCardholderArray) {
              body.push({
                "cardNum": { 'content': claimPaymentsByCardholderArray[i].cardNum, 'colSpan': 9 },
                "confirmationNum": '',
                "cardholderName": '',
                "serviceDate": '',
                "procCode": '',
                "procDesc": '',
                "amountSubmitted": '',
                "amountPaid": '',
                "amountNotPaid": ''
              });
              if (claimPaymentsByCardholderArray[i].cardNumArray.length > 0) {
                for (var k in claimPaymentsByCardholderArray[i].cardNumArray) {
                  if (claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray.length > 0) {
                    for (var j in claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray) {
                      if (j == '0') {
                        body.push({
                          "coId": ' ',
                          "confirmationNum": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].confirmationNum,
                          "cardholderName": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].cardholderName,
                          "serviceDate": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].serviceDate,
                          "procCode": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procCode,
                          "procDesc": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procDesc,
                          "amountSubmitted": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted) : '$ 0.0',
                          "amountPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid) : '$ 0.0',
                          "amountNotPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid) : '$ 0.0',
                        });
                      } else {
                        body.push({
                          "coId": ' ',
                          "confirmationNum": ' ',
                          "cardholderName": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].cardholderName,
                          "serviceDate": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].serviceDate,
                          "procCode": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procCode,
                          "procDesc": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procDesc,
                          "amountSubmitted": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted) : '$ 0.0',
                          "amountPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid) : '$ 0.0',
                          "amountNotPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid) : '$ 0.0'
                        });
                      }
                      amount_submitted_total = amount_submitted_total + claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted;
                      amount_paid_total = amount_paid_total + claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid;
                      amount_notPaid_total = amount_notPaid_total + claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid;
                    }
                  }
                }
              }
              body.push({
                "coId": '',
                "confirmationNum": { 'content': 'Total For: ' + claimPaymentsByCardholderArray[i].cardNum, 'colSpan': 3 },
                "cardholderName": '',
                "serviceDate": '',
                "procCode": ' ',
                "procDesc": ' ',
                "amountSubmitted": { 'content': amount_submitted_total != '' ? this.currentUserService.convertAmountToDecimalWithDoller(amount_submitted_total) : '$ 0.00', 'colSpan': 1 },
                "amountPaid": { 'content': amount_paid_total != '' ? this.currentUserService.convertAmountToDecimalWithDoller(amount_paid_total) : '$ 0.00', 'colSpan': 1 },
                "amountNotPaid": { 'content': amount_notPaid_total != '' ? this.currentUserService.convertAmountToDecimalWithDoller(amount_notPaid_total) : '$ 0.00', 'colSpan': 1 },
              });
              grand_amount_submitted_total = amount_submitted_total;
              grand_amount_paid_total = amount_paid_total;
              grand_amount_notPaid_total = amount_notPaid_total;
            }
            body.push({
              "coId": '',
              "confirmationNum": { 'content': 'GRAND TOTAL', 'colSpan': 3 },
              "cardholderName": '',
              "serviceDate": '',
              "procCode": '',
              "procDesc": '',
              "amountSubmitted": { 'content': grand_amount_submitted_total != '' ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_submitted_total) : '$ 0.00', 'colSpan': 1 },
              "amountPaid": { 'content': grand_amount_paid_total != '' ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_paid_total) : '$ 0.00', 'colSpan': 1 },
              "amountNotPaid": { 'content': grand_amount_notPaid_total != '' ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_notPaid_total) : '$ 0.00', 'colSpan': 1 }
            });
            startDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '';
            endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday());
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': startDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "cardNum": { halign: 'left' },
                "confirmationNum": { halign: 'right' },
                "cardholderName": { halign: 'right' },
                "serviceDate": { halign: 'right' },
                "coEffectiveDate": { halign: 'right' },
                "procCode": { halign: 'right' },
                "procDesc": { halign: 'right' },
                "amountSubmitted": { halign: 'right' },
                "amountPaid": { halign: 'right' },
                "amountNotPaid": { halign: 'right' },
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case -114: //Funding Summary
        var url = UftApi.getFundingSummaryReportUrl
        this.showPageLoader = true;
        if (this.selectedTransactionType.length > 0) {
          this.selectedTransactionType.forEach(element => {
            transCodeArray.push(parseInt(element.itemName));
          });
        }
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'fromDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'toDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'transCodeList': transCodeArray
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            this.showPageLoader = false;
            var rows = data.result.data;
            let fundingReportPDFArray = [];
            for (var i in rows) {
              let checkMainIndex = fundingReportPDFArray.findIndex(x => x.coId === rows[i].coId);
              if (checkMainIndex == -1) {
                fundingReportPDFArray.push({
                  "coId": rows[i].coId,
                  "coName": rows[i].coName,
                  "companyTotal": rows[i].transAmt,
                  "tranArray": [
                    {
                      "tranCd": rows[i].tranCd,
                      "transAmt": rows[i].transAmt,
                      "taxBaseAmount": rows[i].taxBaseAmount,
                      "transactionCodeDesc": rows[i].transactionCodeDesc,
                      "unitFinancialTransDt": rows[i].unitFinancialTransDt != null ? this.changeDateFormatService.changeDateByMonthName(rows[i].unitFinancialTransDt) : '',
                    }
                  ]
                });
              } else {
                fundingReportPDFArray[checkMainIndex].companyTotal = fundingReportPDFArray[checkMainIndex].companyTotal + rows[i].transAmt;
                fundingReportPDFArray[checkMainIndex].tranArray.push({
                  "tranCd": rows[i].tranCd,
                  "transAmt": rows[i].transAmt,
                  "taxBaseAmount": rows[i].taxBaseAmount,
                  "transactionCodeDesc": rows[i].transactionCodeDesc,
                  "unitFinancialTransDt": rows[i].unitFinancialTransDt != null ? this.changeDateFormatService.changeDateByMonthName(rows[i].unitFinancialTransDt) : '',
                });
              }
            }
            var body = [];
            var head = [];
            for (var i in fundingReportPDFArray) {
              body.push({
                "coId": { 'content': fundingReportPDFArray[i].coId + ' ' + fundingReportPDFArray[i].coName, 'colSpan': 5 },
                "unitFinancialTransDt": '',
                "tranCd": '',
                "transactionCodeDesc": '',
                "transAmt": ""
              });
              if (fundingReportPDFArray[i].tranArray.length > 0) {
                for (var j in fundingReportPDFArray[i].tranArray) {
                  body.push({
                    "coId": ' ',
                    "unitFinancialTransDt": fundingReportPDFArray[i].tranArray[j].unitFinancialTransDt,
                    "tranCd": fundingReportPDFArray[i].tranArray[j].tranCd,
                    "transactionCodeDesc": fundingReportPDFArray[i].tranArray[j].transactionCodeDesc,
                    "transAmt": fundingReportPDFArray[i].tranArray[j].transAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(fundingReportPDFArray[i].tranArray[j].transAmt) : '$ 0.00'
                  });
                }
              }
              body.push({
                "coId": '',
                "unitFinancialTransDt": '',
                "tranCd": '',
                "transactionCodeDesc": 'Total for Company',
                "transAmt": fundingReportPDFArray[i].companyTotal != undefined ? this.currentUserService.convertAmountToDecimalWithDoller(fundingReportPDFArray[i].companyTotal) : this.currentUserService.convertAmountToDecimalWithDoller(fundingReportPDFArray[i].companyTotal)
              });
            }
            var columns = [
              {
                "coId": '',
                "unitFinancialTransDt": 'Transaction Date',
                "tranCd": "UFT Code",
                "transactionCodeDesc": "Code Description",
                "transAmt": "Amount",
              }
            ];
            var doc = new jsPDF('p', 'pt', 'a3');
            /** Start Header Content */
            var FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            var endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            /** End Header Content */
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject)
            //End Header 
            doc.autoTable({
              head: columns,
              body: body,
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "coId": { halign: 'left' },
                "unitFinancialTransDt": { halign: 'right' },
                "tranCd": { halign: 'right' },
                "transactionCodeDesc": { halign: 'right' },
                "transAmt": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case -124:
        break;
      case -125:
        break;
      case -126:
        break;
      case -127:
        break;
      case -128:
        break;
      case -105: //Provincial Tax Payable Summary Report
        var url = UftApi.getProvincialTaxPayableSummaryReportUrl
        this.showPageLoader = true;
        let transCodeSingleValue = '';
        if (this.selectedTransactionType.length > 0) {
          this.selectedTransactionType.forEach(element => {
            transCodeSingleValue = element.itemName;
          });
        }
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'fromDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'toDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'provinceName': this.filterReport.value.provinceName
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam[3].value = this.GridFilter105_ProvinceName;
          requestParam = this.pushToArray(requestParam, { 'key': 'coId', 'value': this.GridFilter105_CompanyNum });
          requestParam = this.pushToArray(requestParam, { 'key': 'coName', 'value': this.GridFilter105_CompanyName });
          requestParam = this.pushToArray(requestParam, { 'key': 'amount', 'value': this.GridFilter105_TaxBaseAmount });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'coId' },
              { title: this.translate.instant('uft.dashboard.financeReports.province'), dataKey: 'provinceName' },
              { title: this.translate.instant('uft.dashboard.financeReports.taxBaseAmount'), dataKey: 'transAmt' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].transAmt = data.result.data[i].transAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].transAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + " - " + endDate
            });
            this.pdfHeader(doc, headerobject)
            //End Header 
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coName": { halign: 'left' },
                "coId": { halign: 'right' },
                "provinceName": { halign: 'right' },
                "transAmt": { halign: 'right' }
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          } else {
            this.showPageLoader = false;
          }
        });
        break;
      case 8: //Company Balances
        this.showPageLoader = true;
        var url = UftApi.getCompanyBalanceReportUrl
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'status': this.selectedCompanyStatus != undefined ? this.selectedCompanyStatus : '',
          'coFlag': this.selectedUFT != undefined ? this.selectedUFT : '',
          'isDashboard': 'F'
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'coName', 'value': this.GridFilter8_CompanyName });
          requestParam = this.pushToArray(requestParam, { 'key': 'coId', 'value': this.GridFilter8_CompanyNumber });
          requestParam = this.pushToArray(requestParam, { 'key': 'effectiveOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter8_EffectiveOn) });
          requestParam = this.pushToArray(requestParam, { 'key': 'coTerminatedOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter8_TerminatedOn) });
          requestParam = this.pushToArray(requestParam, { 'key': 'balance', 'value': this.GridFilter8_Balance });
          requestParam = this.pushToArray(requestParam, { 'key': 'coPapAmt', 'value': this.GridFilter8_CoPapAmt });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'coId' },
              { title: this.translate.instant('uft.dashboard.financeReports.effectiveDate'), dataKey: 'coEffectiveDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), dataKey: 'coTerminatedOn' },
              { title: this.translate.instant('uft.dashboard.financeReports.amount'), dataKey: 'amount' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyPapAmount'), dataKey: 'coPapAmt' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].coEffectiveDate = data.result.data[i].coEffectiveDate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].coEffectiveDate) : ''
              data.result.data[i].coTerminatedOn = data.result.data[i].coTerminatedOn != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].coTerminatedOn) : ''
              data.result.data[i].amount = data.result.data[i].amount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].amount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].coPapAmt = data.result.data[i].coPapAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].coPapAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            startDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '';
            endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday());
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': startDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coName": { halign: 'left' },
                "coId": { halign: 'right' },
                "coOpeningBalance": { halign: 'right' },
                "coTerminatedOn": { halign: 'right' },
                "coEffectiveDate": { halign: 'right' },
                "amount": { halign: 'right' },
                "coPapAmt": { halign: 'right' },
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case -8: //Company Balances
        this.showPageLoader = true;
        if (this.uftReqDataArray != undefined && this.uftReqDataArray.isDashboard) {
          if (this.uftReqDataArray.type == 'open') {
            var url = UftApi.getCompanyOpeningBalanceReportUrl;
            requestParam = {
              'compNameAndNo': this.uftReqDataArray.compNameAndNo,
              'startDate': this.uftReqDataArray.startDate != null ? this.uftReqDataArray.startDate : '',
              'endDate': this.uftReqDataArray.endDate != null ? this.uftReqDataArray.endDate : ''
            }
          } else {
            var url = UftApi.getCompanyBalanceReportUrl
            requestParam = {
              'compNameAndNo': this.uftReqDataArray.compNameAndNo,
              'startDate': this.uftReqDataArray.startDate != null ? this.uftReqDataArray.startDate : '',
              'endDate': this.uftReqDataArray.endDate != null ? this.uftReqDataArray.endDate : '',
              'status': this.uftReqDataArray.companyStatus,
              'coFlag': this.uftReqDataArray.coFlag,
              'isDashboard': this.uftReqDataArray.isDashboard,
            }
          }
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            if (this.uftReqDataArray != undefined) {
              if (this.uftReqDataArray.isDashboard) {
                if (this.uftReqDataArray.type == 'open') {
                  var columns = [
                    { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
                    { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'coId' },
                    { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), dataKey: 'coTerminatedOn' },
                    { title: this.translate.instant('uft.dashboard.financeReports.openingBalance'), dataKey: 'coOpeningBalance' }
                  ];
                } else {
                  var columns = [
                    { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
                    { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'coId' },
                    { title: this.translate.instant('uft.dashboard.financeReports.terminationDate'), dataKey: 'coTerminatedOn' },
                    { title: this.translate.instant('uft.dashboard.financeReports.closingBalance'), dataKey: 'amount' }
                  ];
                }
              }
            }
            this.showPageLoader = false;
            if (this.uftReqDataArray != undefined && this.uftReqDataArray.isDashboard) {
              if (this.uftReqDataArray.type == 'open') {
                for (var i in data.result.data) {
                  data.result.data[i].coTerminatedOn = data.result.data[i].coTerminatedOn != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].coTerminatedOn) : ''
                  data.result.data[i].coOpeningBalance = data.result.data[i].coOpeningBalance != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].coOpeningBalance) : this.currentUserService.convertAmountToDecimalWithDoller(0)
                }
              } else {
                for (var i in data.result.data) {
                  data.result.data[i].coTerminatedOn = data.result.data[i].coTerminatedOn != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].coTerminatedOn) : ''
                  data.result.data[i].amount = data.result.data[i].amount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].amount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
                }
              }
            }
            var rows = data.result.data;
            this.uftReqDataArray.startDate
            startDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '';
            endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday());
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': startDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coName": { halign: 'left' },
                "coId": { halign: 'right' },
                "coOpeningBalance": { halign: 'right' },
                "coTerminatedOn": { halign: 'right' },
                "amount": { halign: 'right' }
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 3: //Provider Without EFT
        let requestData = {};
        if (this.selectedBusinessTypeCd == 'Q') {
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.providerReportWithoutEftForQuikcard');
          var apiUrl = UftApi.providerReportWithoutEftQuikcardUrl;
          requestData = { 'businessTypeCd': this.selectedBusinessTypeCd }
        } else if (this.selectedBusinessTypeCd == 'S') {
          this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.providerReportWithoutEftForAlberta');
          var apiUrl = UftApi.providerReportWithoutEftAlbertaUrl;
        }
        var doc = new jsPDF('p', 'pt', 'a3');
        this.showPageLoader = true;
        var columns = [
          { title: this.translate.instant('uft.dashboard.financeReports.providerLicenseNumber'), dataKey: 'dentProvLicenseNum' },
          { title: this.translate.instant('uft.dashboard.financeReports.providerName'), dataKey: 'providername' },
          { title: this.translate.instant('uft.dashboard.financeReports.providerAddress'), dataKey: 'dentProvBillAddL1MailAdd' },
          { title: this.translate.instant('uft.dashboard.financeReports.amountHeldPerTRXN'), dataKey: 'sumamount' }
        ];
        this.hmsDataService.postApi(apiUrl, requestData).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].sumamount = data.result.data[i].sumamount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].sumamount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle
            });
            if (this.selectedBusinessTypeCd == 'Q') {
              this.pdfHeader(doc, headerobject);
            } else {
              this.pdfHeaderADSC(doc, headerobject);
            }
            //End Header    
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "dentProvLicenseNum": { halign: 'left' },
                "providername": { halign: 'right' },
                "dentProvBillAddL1MailAdd": { halign: 'right' },
                "sumamount": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        })
        break;
      case 51: //Summary of Provider Debits
        var url = UftApi.getProviderDebitsUrl;
        this.showPageLoader = true;
        var startDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '';
        var endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '';
        requestParam = {
          'dentProvlicenseNum': this.filterReport.value.licenceNumber,
          'businessTypeCd': this.selectedBusinessTypeCd,
          'startDate': startDate,
          'endDate': endDate,
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          /*
          Summary of Provider Debits
          GridFilterp51PaymentDate
          GridFilterp51dentProvlicenseNum
          GridFilterp51ProviderName
          GridFilterp51Amount 
          */
          requestParam = this.pushToArray(requestParam, { 'key': 'paymentDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp51PaymentDate) });
          requestParam = this.pushToArray(requestParam, { 'key': 'dentProvlicenseNum', 'value': this.GridFilterp51dentProvlicenseNum });
          requestParam = this.pushToArray(requestParam, { 'key': 'providerName', 'value': this.GridFilterp51ProviderName });
          requestParam = this.pushToArray(requestParam, { 'key': 'amount', 'value': this.GridFilterp51Amount });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var rows = data.result.data;
            let providerDebitReportPDFArray = [];
            for (var i in rows) {
              let checkMainIndex = providerDebitReportPDFArray.findIndex(x => x.dentProvlicenseNum === rows[i].dentProvlicenseNum);
              if (checkMainIndex == -1) {
                providerDebitReportPDFArray.push({
                  "dentProvlicenseNum": rows[i].dentProvlicenseNum,
                  "providerName": rows[i].providerName,
                  "paymentSumRunDate": rows[i].paymentSumRunDate,
                  "dentProvDebitAmt": rows[i].dentProvDebitAmt,
                  "providerArray": [
                    {
                      "dentProvlicenseNum": rows[i].dentProvlicenseNum,
                      "providerName": rows[i].providerName,
                      "paymentSumRunDate": rows[i].paymentSumRunDate,
                      "dentProvDebitAmt": rows[i].dentProvDebitAmt,
                    }
                  ]
                });
              } else {
                providerDebitReportPDFArray[checkMainIndex].dentProvDebitAmt = providerDebitReportPDFArray[checkMainIndex].dentProvDebitAmt + rows[i].dentProvDebitAmt;
                providerDebitReportPDFArray[checkMainIndex].providerArray.push({
                  "dentProvlicenseNum": ' ',
                  "providerName": rows[i].providerName,
                  "paymentSumRunDate": rows[i].paymentSumRunDate,
                  "dentProvDebitAmt": rows[i].dentProvDebitAmt,
                  "dentProvDebitTotalAmt": rows[i].dentProvDebitTotalAmt,
                });
              }
            }
            var body = [];
            var head = [];
            var grandTotal = 0;
            for (var i in providerDebitReportPDFArray) {
              if (providerDebitReportPDFArray[i].providerArray.length > 0) {
                for (var j in providerDebitReportPDFArray[i].providerArray) {
                  body.push({
                    "dentProvlicenseNum": providerDebitReportPDFArray[i].providerArray[j].dentProvlicenseNum,
                    "providerName": providerDebitReportPDFArray[i].providerArray[j].providerName,
                    "paymentSumRunDate": this.changeDateFormatService.changeDateByMonthName(providerDebitReportPDFArray[i].providerArray[j].paymentSumRunDate),
                    "dentProvDebitAmt": providerDebitReportPDFArray[i].providerArray[j].dentProvDebitAmt != undefined ? this.currentUserService.convertAmountToDecimalWithDoller(providerDebitReportPDFArray[i].providerArray[j].dentProvDebitAmt) : '$0.00',
                  });
                }
              }
              body.push({
                "dentProvlicenseNum": '',
                "providerName": '',
                "paymentSumRunDate": 'Total',
                "dentProvDebitAmt": providerDebitReportPDFArray[i].dentProvDebitAmt != undefined ? this.currentUserService.convertAmountToDecimalWithDoller(providerDebitReportPDFArray[i].dentProvDebitAmt) : this.currentUserService.convertAmountToDecimalWithDoller(providerDebitReportPDFArray[i].dentProvDebitAmt)
              });
              grandTotal = grandTotal + providerDebitReportPDFArray[i].dentProvDebitAmt
            }
            if (grandTotal > 0) {
              body.push({
                "dentProvlicenseNum": '',
                "providerName": '',
                "paymentSumRunDate": 'Grand Total',
                "dentProvDebitAmt": grandTotal != undefined ? this.currentUserService.convertAmountToDecimalWithDoller(grandTotal) : this.currentUserService.convertAmountToDecimalWithDoller(grandTotal)
              });
            }
            var doc = new jsPDF('p', 'pt');
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.licenceNumber'), dataKey: 'dentProvlicenseNum' },
              { title: this.translate.instant('uft.dashboard.financeReports.providerName'), dataKey: 'providerName' },
              { title: this.translate.instant('uft.dashboard.financeReports.paymentDate'), dataKey: 'paymentSumRunDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.debitAmount'), dataKey: 'dentProvDebitAmt' },
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].paymentSumRunDate = data.result.data[i].paymentSumRunDate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].paymentSumRunDate) : ''
              data.result.data[i].dentProvDebitAmt = data.result.data[i].dentProvDebitAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].dentProvDebitAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = []; var reportSubTitle = '';
            if (this.selectedBusinessTypeCd == 'Q') {
              reportSubTitle = " (Quikcard)"
            } else {
              reportSubTitle = " (Alberta)"
            }
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle + reportSubTitle,
              'text5Date': startDate + ' - ' + endDate
            });
            if (this.selectedBusinessTypeCd == 'Q') {
              this.pdfHeader(doc, headerobject)
            } else {
              this.pdfHeaderADSC(doc, headerobject)
            }
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "dentProvlicenseNum": { halign: 'left' },
                "providerName": { halign: 'right' },
                "paymentSumRunDate": { halign: 'right' },
                "dentProvDebitAmt": { halign: 'right' },
                "dentProvDebitTotalAmt": { halign: 'right' }
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 28: //Broker Commission Summary
        var url = UftApi.getFundingSummaryReportPdfUrl;
        this.showPageLoader = true;
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'fromDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'toDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'brokerNameOrNumber': this.filterReport.value.brokerNameOrNumber,
          'transIsElectronicCheque': this.filterReport.value.transactionIsElectronicCheque,
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var text1 = this.translate.instant('uft.dashboard.financeReports.quikcardSolutionsInc');
            var text2 = this.translate.instant('uft.dashboard.financeReports.quikcard');
            var text3 = this.translate.instant('uft.dashboard.financeReports.brokerCommissionSummaryHyphen');
            if (FromDate != '') {
              var text4 = this.translate.instant('uft.dashboard.financeReports.forThePeriodsOf') + " " + FromDate + this.translate.instant('uft.dashboard.financeReports.to') + " " + endDate;
            } else {
              var text4 = '';
            }
            var xOffset1 = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(text1) * doc.internal.getFontSize(16) / 2);
            var xOffset2 = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(text2) * doc.internal.getFontSize(16) / 2);
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: "coName" },
              { title: this.translate.instant('uft.dashboard.financeReports.transactionCode'), dataKey: 'tranCd' },
              { title: this.translate.instant('uft.dashboard.financeReports.amount'), dataKey: 'transAmt' },

            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].transAmt = data.result.data[i].transAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].transAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'wrap' },
              columnStyles: {
                "coName": { cellWidth: 250 },
                "tranCd": { cellWidth: 100 },
                "transAmt": { cellWidth: 100, halign: 'right' },
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              margin: { top: 120 },
              addPageContent: function (data) {
                doc.setFont('Arial');
                doc.setFontType("bold");
                doc.setFontSize('14');
                doc.text(text1, xOffset1, 40);
                doc.text(text2, xOffset2, 60);
                doc.setFontSize(10);
                var xOffset3 = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(text3) * doc.internal.getFontSize(10) / 2);
                doc.text(text3, xOffset3, 80);
                var xOffset4 = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(text4) * doc.internal.getFontSize(10) / 2);
                doc.text(text4, xOffset4, 100);
              }
            });
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 59: //Unpaid Claims report
        var url = UftApi.getUnpaidClaimsReportUrl;
        this.showPageLoader = true;
        let claimStatusArray = []
        if (this.selectedClaimStatusType.length > 0) {
          this.selectedClaimStatusType.forEach(element => {
            claimStatusArray.push(element.itemName);
          });
        }
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'claimStatusList': claimStatusArray,
          "status": this.filterReport.value.companyStatus
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'coId', 'value': this.GridFilter59_CompanyNum });
          requestParam = this.pushToArray(requestParam, { 'key': 'coName', 'value': this.GridFilter59_CompanyName });
          requestParam = this.pushToArray(requestParam, { 'key': 'status', 'value': this.GridFilter59_CompanyStatus });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardNumber', 'value': this.GridFilter59_CardNumber });
          requestParam = this.pushToArray(requestParam, { 'key': 'patientName', 'value': this.GridFilter59_PatientName });
          requestParam = this.pushToArray(requestParam, { 'key': 'referenceNumber', 'value': this.GridFilter59_RefNumber });
          requestParam = this.pushToArray(requestParam, { 'key': 'confirmId', 'value': this.GridFilter59_ClaimSubmission });
          requestParam = this.pushToArray(requestParam, { 'key': 'totalCostAmount', 'value': this.GridFilter59_TotalCostAmount });
          requestParam = this.pushToArray(requestParam, { 'key': 'adjudDate', 'value': this.GridFilter59_AdjudDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'payee', 'value': this.GridFilter59_Payee });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'companyNo' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyStatus'), dataKey: 'status' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), dataKey: 'cardNum' },
              { title: this.translate.instant('uft.dashboard.financeReports.patientName'), dataKey: 'patient' },
              { title: this.translate.instant('uft.dashboard.financeReports.referenceNumber'), dataKey: 'confirmId' },
              { title: this.translate.instant('uft.dashboard.financeReports.claimSubmission'), dataKey: 'claimType' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalCostAmount'), dataKey: 'paidcost' },
              { title: this.translate.instant('uft.dashboard.financeReports.adjudicationDate'), dataKey: 'adjudicateDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.payee'), dataKey: 'payee' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].adjudicateDt = data.result.data[i].adjudicateDt != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].adjudicateDt) : ''
              data.result.data[i].paidcost = data.result.data[i].paidcost != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].paidcost) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject)
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coName": { halign: 'left' },
                "companyNo": { halign: 'right' },
                "status": { halign: 'right' },
                "cardNum": { halign: 'right' },
                "patient": { halign: 'right' },
                "confirmId": { halign: 'right' },
                "claimType": { halign: 'right' },
                "paidcost": { halign: 'right' },
                "adjudicateDt": { halign: 'right' },
                "payee": { halign: 'right' }
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case -59: //Unpaid Claims report for Company Balance Tab
        var url = UftApi.getUnpaidClaimsReportUrl;
        this.showPageLoader = true;
        let claimStatusArray2 = []
        if (this.selectedClaimStatusType.length > 0) {
          this.selectedClaimStatusType.forEach(element => {
            claimStatusArray2.push(element.itemName);
          });
        }
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'claimStatusList': claimStatusArray2,
          "status": this.filterReport.value.companyStatus
        }

        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'companyNo' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyStatus'), dataKey: 'status' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), dataKey: 'cardNum' },
              { title: this.translate.instant('uft.dashboard.financeReports.patientName'), dataKey: 'patient' },
              { title: this.translate.instant('uft.dashboard.financeReports.referenceNumber'), dataKey: 'confirmId' },
              { title: this.translate.instant('uft.dashboard.financeReports.claimSubmission'), dataKey: 'claimType' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalCostAmount'), dataKey: 'paidcost' },
              { title: this.translate.instant('uft.dashboard.financeReports.adjudicationDate'), dataKey: 'adjudicateDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.payee'), dataKey: 'payee' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].adjudicateDt = data.result.data[i].adjudicateDt != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].adjudicateDt) : ''
              data.result.data[i].paidcost = data.result.data[i].paidcost != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].paidcost) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject)
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coName": { halign: 'left' },
                "companyNo": { halign: 'right' },
                "status": { halign: 'right' },
                "cardNum": { halign: 'right' },
                "patient": { halign: 'right' },
                "confirmId": { halign: 'right' },
                "claimType": { halign: 'right' },
                "paidcost": { halign: 'right' },
                "adjudicateDt": { halign: 'right' },
                "payee": { halign: 'right' }
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 30: //Broker Company Summary Report
        var url = UftApi.getBrokerCompanySummaryRepoprtUrl;
        this.showPageLoader = true;
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'brokerId': this.selectedBrokerId != undefined ? this.selectedBrokerId : '',
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'compNameAndNo', 'value': this.GridFilter30_CompanyName });
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerId', 'value': this.GridFilter30_BrokerNumber });
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerName', 'value': this.GridFilter30_BrokerName });
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerPhone', 'value': this.GridFilter30_BrokerPrimaryContact });
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerContactPhoneNum', 'value': this.GridFilter30_BrokerTelephone });
          requestParam = this.pushToArray(requestParam, { 'key': 'CompanyEffectiveOn', 'value': this.GridFilterp30_CompanyEffectiveDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'commisionRate', 'value': this.GridFilter30_CompanyBrokerRate });
          requestParam = this.pushToArray(requestParam, { 'key': 'balance', 'value': this.GridFilter30_CompanyBalance });
          requestParam = this.pushToArray(requestParam, { 'key': 'coStandardPapAmt', 'value': this.GridFilter30_CompanyPAPAmount });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.brokerName'), dataKey: 'brokerName' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerNumber'), dataKey: 'brokerId' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerPrimaryContact'), dataKey: 'brokerEmail' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerTelephone'), dataKey: 'brokerPhone' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyEffectiveDate'), dataKey: 'companyEffectiveOn' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyBrokerRate'), dataKey: 'commisionRate' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyBalance'), dataKey: 'balance' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyPapAmount'), dataKey: 'coStandardPapAmt' },
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].companyEffectiveOn = data.result.data[i].companyEffectiveOn != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].companyEffectiveOn) : ''
              data.result.data[i].balance = data.result.data[i].balance != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].balance) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].coStandardPapAmt = data.result.data[i].coStandardPapAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].coStandardPapAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle
            });
            this.pdfHeader(doc, headerobject)
            //End Header   
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "brokerName": { halign: 'left' },
                "brokerId": { halign: 'right' },
                "brokerEmail": { halign: 'right' },
                "brokerPhone": { halign: 'right' },
                "coName": { halign: 'right' },
                "companyEffectiveOn": { halign: 'right' },
                "commisionRate": { halign: 'right' },
                "balance": { halign: 'right' },
                "coStandardPapAmt": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 44: //Unit Financial Transactions Summary Report
        var url = UftApi.getUFTReportUrl;
        this.showPageLoader = true;
        if (this.selectedTransactionType.length > 0) {
          this.selectedTransactionType.forEach(element => {
            transCodeArray.push(parseInt(element.itemName));
          });
        }
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'transCodeList': transCodeArray
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'coId' },
              { title: this.translate.instant('uft.dashboard.financeReports.transactionCode'), dataKey: 'tranCd' },
              { title: this.translate.instant('uft.dashboard.financeReports.transactionDescription'), dataKey: 'tranDesc' },
              { title: this.translate.instant('uft.dashboard.financeReports.transactionAmount'), dataKey: 'sumtransamt' },
              { title: this.translate.instant('uft.dashboard.financeReports.transactionDate'), dataKey: 'unitFinancialTransDt' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].unitFinancialTransDt = data.result.data[i].unitFinancialTransDt != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].unitFinancialTransDt) : ''
              data.result.data[i].sumtransamt = data.result.data[i].sumtransamt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].sumtransamt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "coName": { halign: 'left' },
                "coId": { halign: 'right' },
                "tranCd": { halign: 'right' },
                "tranDesc": { halign: 'right' },
                "sumtransamt": { halign: 'right' },
                "unitFinancialTransDt": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            //Start Footer
            this.pdfFooter(doc, this.reportID);
            //End Footer
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 56: //UFT Report List
        var url = UftApi.getUftReportListUrl;
        this.showPageLoader = true;
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'coName', 'value': this.GridFilter56_CompanyName });
          requestParam = this.pushToArray(requestParam, { 'key': 'coId', 'value': this.GridFilter56_CompanyNum });
          requestParam = this.pushToArray(requestParam, { 'key': 'coTerminatedOn', 'value': this.GridFilter56_CompanyTermDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'coAdminFeeRate', 'value': this.GridFilter56_CompanyAdminFeeRate });
          requestParam = this.pushToArray(requestParam, { 'key': 'coCardCount', 'value': this.GridFilter56_CardholderCount });
          requestParam = this.pushToArray(requestParam, { 'key': 'otherBroker1', 'value': this.GridFilter56_OtherBroker1 });
          requestParam = this.pushToArray(requestParam, { 'key': 'otherBroker2', 'value': this.GridFilter56_OtherBroker2 });
          requestParam = this.pushToArray(requestParam, { 'key': 'otherBroker3', 'value': this.GridFilter56_OtherBroker3 });
          requestParam = this.pushToArray(requestParam, { 'key': 'otherBroker4', 'value': this.GridFilter56_OtherBroker4 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode10', 'value': this.GridFilter56_UftCode10 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode20', 'value': this.GridFilter56_UftCode20 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode21', 'value': this.GridFilter56_UftCode21 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode25', 'value': this.GridFilter56_UftCode25 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode30', 'value': this.GridFilter56_UftCode30 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode31', 'value': this.GridFilter56_UftCode31 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode35', 'value': this.GridFilter56_UftCode35 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode39', 'value': this.GridFilter56_UftCode39 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode40', 'value': this.GridFilter56_UftCode40 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode41', 'value': this.GridFilter56_UftCode41 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode42', 'value': this.GridFilter56_UftCode42 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode43', 'value': this.GridFilter56_UftCode43 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode44', 'value': this.GridFilter56_UftCode44 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode45', 'value': this.GridFilter56_UftCode45 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode46', 'value': this.GridFilter56_UftCode46 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode47', 'value': this.GridFilter56_UftCode47 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode50', 'value': this.GridFilter56_UftCode50 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode70', 'value': this.GridFilter56_UftCode70 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode80', 'value': this.GridFilter56_UftCode80 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode82', 'value': this.GridFilter56_UftCode82 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode90', 'value': this.GridFilter56_UftCode90 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode91', 'value': this.GridFilter56_UftCode91 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode92', 'value': this.GridFilter56_UftCode92 });
          requestParam = this.pushToArray(requestParam, { 'key': 'uftCode99', 'value': this.GridFilter56_UftCode99 });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            this.showPageLoader = false;
            var doc = new jsPDF('l', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var rowsArray = data.result.data;
            let UFTArray = [];
            for (var i in rowsArray) {
              UFTArray.push(
                {
                  '10s': { 'content': rowsArray[i].coId + ' ' + rowsArray[i].coName, 'colSpan': 24 },
                  '20s': "",
                  '21s': "",
                  '25s': "",
                  '30s': "0",
                  '31s': "0",
                  '35s': "0",
                  '40s': "0",
                  '41s': "0",
                  '42s': "0",
                  '43s': "0",
                  '50s': "0",
                  '70s': "0",
                  '80s': "0",
                  '82s': "0",
                  '90s': "0",
                  '91s': "0",
                  '92s': "0",
                  '99s': "0",
                  '39s': "0",
                  '44s': "0",
                  '45s': "0",
                  '46s': "0",
                  '47s': "0"
                }
              );
              UFTArray.push(
                {
                  '10s': { 'content': rowsArray[i].coEffectiveDate != '' ? this.changeDateFormatService.changeDateByMonthName(rowsArray[i].coEffectiveDate) : '', 'colSpan': 2 },
                  '20s': "",
                  '21s': { 'content': rowsArray[i].coTerminatedOn != '' ? this.changeDateFormatService.changeDateByMonthName(rowsArray[i].coTerminatedOn) : '', 'colSpan': 2 },
                  '25s': " ",
                  '30s': { 'content': rowsArray[i].coAdminFeeRate != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].coAdminFeeRate) : this.currentUserService.convertAmountToDecimalWithDoller(0), 'colSpan': 2 },
                  '31s': "0",
                  '35s': { 'content': rowsArray[i].coCardHolderCount, 'colSpan': 2 },
                  '40s': "0",
                  '41s': { 'content': rowsArray[i].primaryBroker, 'colSpan': 3 },
                  '42s': "0",
                  '43s': "0",
                  '50s': { 'content': rowsArray[i].otherBroker1, 'colSpan': 3 },
                  '70s': "0",
                  '80s': "0",
                  '82s': { 'content': rowsArray[i].otherBroker2, 'colSpan': 3 },
                  '90s': "0",
                  '91s': "0",
                  '92s': { 'content': rowsArray[i].otherBroker3, 'colSpan': 3 },
                  '99s': "0",
                  '39s': "0",
                  '44s': { 'content': '', 'colSpan': 4 },
                  '45s': "0",
                  '46s': "0",
                  '47s': "0"
                }
              );
              UFTArray.push(
                {
                  '10s': rowsArray[i].uftCode10 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode10) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '20s': rowsArray[i].uftCode20 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode20) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '21s': rowsArray[i].uftCode20 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode20) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '25s': rowsArray[i].uftCode25 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode25) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '30s': rowsArray[i].uftCode30 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode30) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '31s': rowsArray[i].uftCode31 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode31) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '35s': rowsArray[i].uftCode35 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode35) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '40s': rowsArray[i].uftCode40 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode40) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '41s': rowsArray[i].uftCode41 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode41) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '42s': rowsArray[i].uftCode42 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode42) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '43s': rowsArray[i].uftCode43 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode43) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '50s': rowsArray[i].uftCode50 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode50) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '70s': rowsArray[i].uftCode70 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode70) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '80s': rowsArray[i].uftCode80 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode80) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '82s': rowsArray[i].uftCode82 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode82) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '90s': rowsArray[i].uftCode90 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode90) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '91s': rowsArray[i].uftCode91 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode91) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '92s': rowsArray[i].uftCode92 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode92) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '99s': rowsArray[i].uftCode99 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode99) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '39s': rowsArray[i].uftCode39 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode39) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '44s': rowsArray[i].uftCode44 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode44) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '45s': rowsArray[i].uftCode45 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode45) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '46s': rowsArray[i].uftCode46 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode46) : this.currentUserService.convertAmountToDecimalWithDoller(0),
                  '47s': rowsArray[i].uftCode47 != null ? this.currentUserService.convertAmountToDecimalWithDoller(rowsArray[i].uftCode47) : this.currentUserService.convertAmountToDecimalWithDoller(0)
                }
              );
            }
            var columns = [{
              '10s': { 'content': 'Company Name:', 'colSpan': 24 },
            }, {
              '10s': { 'content': 'Effective Date', 'colSpan': 2 },
              '20s': "20",
              '21s': { 'content': 'Term Date', 'colSpan': 2 },
              '25s': "25",
              '30s': { 'content': 'Admin Rate', 'colSpan': 2 },
              '31s': "31",
              '35s': { 'content': 'Card Count', 'colSpan': 2 },
              '40s': "40",
              '41s': { 'content': 'Primary Broker', 'colSpan': 3 },
              '42s': "42",
              '43s': "43",
              '50s': { 'content': 'Broker 1', 'colSpan': 3 },
              '70s': "70",
              '80s': "80",
              '82s': { 'content': 'Broker 2', 'colSpan': 3 },
              '90s': "90",
              '91s': "91",
              '92s': { 'content': 'Broker 3', 'colSpan': 3 },
              '99s': "99",
              '39s': "39",
              '44s': { 'content': '', 'colSpan': 4 },
              '45s': "45",
              '46s': "46",
              '47s': "47",
            },
            {
              '10s': { 'content': 'Code:', 'colSpan': 24 },
            },
            {
              '10s': "10",
              '20s': "20",
              '21s': "21",
              '25s': "25",
              '30s': "30",
              '31s': "31",
              '35s': "35",
              '40s': "40",
              '41s': "41",
              '42s': "42",
              '43s': "43",
              '50s': "50",
              '70s': "70",
              '80s': "80",
              '82s': "82",
              '90s': "90",
              '91s': "91",
              '92s': "92",
              '99s': "99",
              '39s': "39",
              '44s': "44",
              '45s': "45",
              '46s': "46",
              '47s': "47",
            }
            ];
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            // Header
            this.pdfHeader(doc, headerobject)
            //End Header
            doc.autoTable({
              head: columns,
              body: UFTArray,
              startY: 100,
              startX: 40,
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                '10s': { halign: 'right' },
                '20s': { halign: 'right' },
                '21s': { halign: 'right' },
                '25s': { halign: 'right' },
                '30s': { halign: 'right' },
                '31s': { halign: 'right' },
                '35s': { halign: 'right' },
                '40s': { halign: 'right' },
                '41s': { halign: 'right' },
                '42s': { halign: 'right' },
                '43s': { halign: 'right' },
                '50s': { halign: 'right' },
                '70s': { halign: 'right' },
                '80s': { halign: 'right' },
                '82s': { halign: 'right' },
                '90s': { halign: 'right' },
                '91s': { halign: 'right' },
                '92s': { halign: 'right' },
                '99s': { halign: 'right' },
                '39s': { halign: 'right' },
                '44s': { halign: 'right' },
                '45s': { halign: 'right' },
                '46s': { halign: 'right' },
                '47s': { halign: 'right' },
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.cell.colSpan != 24) {
                  data.cell.styles.halign = 'right';
                }
                if (data.section == 'body' && data.cell.colSpan == 24) {
                  data.cell.styles.halign = 'left';
                }
              },
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            //End Footer 
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case -104: //Claims Payment Run Summary
        var url = UftApi.getPaymentRunReportUrl;
        this.showPageLoader = true;
        var startDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '';
        var endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '';
        requestParam = {
          'startDate': startDate,
          'endDate': endDate,
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam[2].value = this.GridFilter107_CompanyName;
          requestParam[3].value = this.GridFilter107_CompanyNum;
          requestParam = this.pushToArray(requestParam, { 'key': 'date', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter107_Date) });
          requestParam = this.pushToArray(requestParam, { 'key': 'ChequeRefNo', 'value': this.GridFilter107_ChequeNum });
          requestParam = this.pushToArray(requestParam, { 'key': 'balance', 'value': this.GridFilter107_Amount });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var doc = new jsPDF('p', 'pt', 'a3');
            var rows = data.result.data;
            var columnsOne = [
              { 'content': 'Total Drug Claims Loaded', 'amount': rows[0].sumTotalClaimSecure != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumTotalClaimSecure) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Cheques Written', 'amount': rows[0].totalChequeWritten != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].totalChequeWritten) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Electronic Payments Generated', 'amount': rows[0].electronicPayment != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].electronicPayment) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Merchant Agreement Charge Revenue', 'amount': rows[0].totalMerchant != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].totalMerchant) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              {'content': '',
                'amount': this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumTotalClaimSecure + rows[0].totalChequeWritten + rows[0].electronicPayment + rows[0].totalMerchant)
              }
            ];
            var columns = [
              { 'content': 'Total Claim Paid', 'amount': rows[0].sumClaimPaidAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumClaimPaidAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Administrator Revenue', 'amount': rows[0].sumAdminAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumAdminAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Broker Commissions', 'amount': rows[0].sumBrokerAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumBrokerAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total GST', 'amount': rows[0].sumGstAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumGstAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Broker GST', 'amount': rows[0].sumBrokerGstAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumBrokerGstAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Ontario Tax', 'amount': rows[0].sumOnAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumOnAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Quebec Tax', 'amount': rows[0].sumPqAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumPqAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Newfoundland Tax', 'amount': rows[0].sumNlAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumNlAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Saskatchewan Tax', 'amount': rows[0].sumSkAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumSkAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Stop Loss Claims Reversed', 'amount': rows[0].sumSlClaims != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumSlClaims) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Stop Loss Administration Reversed', 'amount': rows[0].sumSlAdmin != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumSlAdmin) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Stop Loss Broker Reversed', 'amount': rows[0].sumSlBroker != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumSlBroker) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Stop Loss Broker GST Reversed', 'amount': rows[0].sumSlBrokerGst != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumSlBrokerGst) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Stop Loss ON Tax Reversed', 'amount': rows[0].sumSlOn != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumSlOn) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Stop Loss PQ Tax Reversed', 'amount': rows[0].sumSlPq != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumSlPq) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Stop Loss NL Tax Reversed', 'amount': rows[0].sumSlNl != '' ? this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumSlNl) : this.currentUserService.convertAmountToDecimalWithDoller(0) },
              { 'content': 'Total Charges To Plans',
                'amount': this.currentUserService.convertAmountToDecimalWithDoller(rows[0].sumClaimPaidAmount + rows[0].sumAdminAmt + rows[0].sumBrokerAmt + rows[0].sumGstAmount + rows[0].sumBrokerGstAmount + rows[0].sumOnAmount + rows[0].sumPqAmount + rows[0].sumNlAmount + rows[0].sumSkAmount + rows[0].sumSlClaims + rows[0].sumSlAdmin + rows[0].sumSlBroker + rows[0].sumSlBrokerGst + rows[0].sumSlOn + rows[0].sumSlPq + rows[0].sumSlNl)
              }
            ];
            this.showPageLoader = false;
            //SS
            var body = [];
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            if (this.selectedBusinessTypeCd == 'Q') {
              this.pdfHeader(doc, headerobject)
            } else {
              this.pdfHeaderADSC(doc, headerobject)
            }
            //End Header 
            doc.autoTable({
              head: columnsOne,
              body: body,
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.dataKey == 'amount') {
                  data.cell.styles.halign = 'right';
                  data.cell.styles.cellWidth = 400;
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });

            doc.autoTable({
              head: columns,
              body: body,
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.dataKey == 'amount') {
                  data.cell.styles.halign = 'right';
                  data.cell.styles.cellWidth = 400;
                }
              },
              startY: 210,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case -107: //Refund Payment Summary Report
        var url = UftApi.refundPaymentSummaryReportPdfUrl
        this.showPageLoader = true;
        requestParam = {
          'coName': this.selectedCompanyName,
          'coId': this.selecteCoID != undefined ? this.selecteCoID : '',
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'transTypeParam': this.selectedTransactionIsElectronicCheque != undefined ? this.selectedTransactionIsElectronicCheque : ''
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam[2].value = this.GridFilter107_CompanyName;
          requestParam[3].value = this.GridFilter107_CompanyNum;
          requestParam = this.pushToArray(requestParam, { 'key': 'date', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter107_Date) });
          requestParam = this.pushToArray(requestParam, { 'key': 'ChequeRefNo', 'value': this.GridFilter107_ChequeNum });
          requestParam = this.pushToArray(requestParam, { 'key': 'balance', 'value': this.GridFilter107_Amount });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            this.filterColoumn = [];
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'coId' },
              { title: this.translate.instant('uft.dashboard.financeReports.amount'), dataKey: 'sumTransAmt' },
              { title: this.translate.instant('uft.dashboard.financeReports.chequeNumber'), dataKey: 'chequeRefNo' },
              { title: this.translate.instant('uft.dashboard.financeReports.date'), dataKey: 'unitFinancialTransDt' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].transAmt = data.result.data[i].transAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].transAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + " - " + endDate
            });
            this.pdfHeader(doc, headerobject)
            //End Header 
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coName": { halign: 'left' },
                "coId": { halign: 'right' },
                "sumTransAmt": { halign: 'right' },
                "chequeRefNo": { halign: 'right' },
                "unitFinancialTransDt": { halign: 'right' }
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          } else {
            this.showPageLoader = false;
          }
        });
        break;
      case 73: //Card Holder Utilization Report
        var doc = new jsPDF('l', 'pt', 'a4');
        let StartDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
        let EndDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
        this.filterColoumn = [];
        var column = [];
        var rows = [];
        //Start Header
        var headerobject = [];
        headerobject.push({
          'gridHeader1': this.reportPopUpTitle,
          'text5Date': StartDate + " - " + EndDate
        });
        this.pdfHeader(doc, headerobject)
        var canvas = document.getElementById('cool-canvas') as HTMLCanvasElement;
        //creates image
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        doc.setFillColor(255, 255, 255, 0);
        doc.addImage(canvasImg, 'PNG', -60, 120);
        //End Header 
        doc.autoTable(column, rows, {
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [215, 214, 213],
            lineWidth: 1,
          },
          startY: 100,
          startX: 40,
          theme: 'grid',
        });
        this.pdfFooter(doc, this.reportID);
        doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
        break;
      case -23: //Override Report
        var url = UftApi.getOverrideReportUrl
        this.showPageLoader = true;
        let overrideReasonArray = []
        if (this.selectedOverrideReason.length > 0) {
          this.selectedOverrideReason.forEach(element => {
            overrideReasonArray.push(element.itemName);
          });
        }
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'overrideReasonList': overrideReasonArray,
          'businessTypeCd': this.selectedBusinessTypeCd,
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'overrideAmount', 'value': this.filterOverrideAmount });
          requestParam = this.pushToArray(requestParam, { 'key': 'verificationNumber', 'value': this.filterVerificationNumber });
          requestParam = this.pushToArray(requestParam, { 'key': 'procedureCode', 'value': this.filterProcedureCode });
          requestParam = this.pushToArray(requestParam, { 'key': 'serviceProvider', 'value': this.serviceProvider });
          requestParam = this.pushToArray(requestParam, { 'key': 'serviceDate', 'value': this.serviceDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'patientName', 'value': this.filterPatientName });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardHolderName', 'value': this.filterClientName });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardNumber', 'value': this.filterCardNumber });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), dataKey: 'cardno' },
              { title: this.translate.instant('uft.dashboard.financeReports.clientName'), dataKey: 'cardholdername' },
              { title: this.translate.instant('uft.dashboard.financeReports.patientName'), dataKey: 'patientname' },
              { title: this.translate.instant('uft.dashboard.financeReports.patientRole'), dataKey: 'patientRole' },
              { title: this.translate.instant('uft.dashboard.financeReports.serviceDate'), dataKey: 'servicedate' },
              { title: this.translate.instant('uft.dashboard.financeReports.serviceProvider'), dataKey: 'providername' },
              { title: this.translate.instant('uft.dashboard.financeReports.procedureCode'), dataKey: 'proccode' },
              { title: this.translate.instant('uft.dashboard.financeReports.overrideAmount'), dataKey: 'amountpaid' },
              { title: this.translate.instant('uft.dashboard.financeReports.overrideReason'), dataKey: 'overridereason' },
              { title: this.translate.instant('uft.dashboard.financeReports.verificationNumber'), dataKey: 'verficationno' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].servicedate = data.result.data[i].servicedate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].servicedate) : ''
              data.result.data[i].amountpaid = data.result.data[i].amountpaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].amountpaid) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + " - " + endDate
            });
            this.pdfHeader(doc, headerobject)
            //End Header 
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "cardno": { halign: 'left' },
                "cardholdername": { halign: 'right' },
                "patientname": { halign: 'right' },
                "patientRole": { halign: 'right' },
                "servicedate": { halign: 'right' },
                "providername": { halign: 'right' },
                "proccode": { halign: 'right' },
                "amountpaid": { halign: 'right' },
                "overridereason": { halign: 'right' },
                "verficationno": { halign: 'right' }
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          } else {
            this.showPageLoader = false;
          }
        });
        break;
      case 75: //Cardholder Listing Report 
        var url = UftApi.getCardholderListReportUrl
        this.showPageLoader = true;
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'displayAddress': this.selectedCardholderAddress != undefined ? this.selectedCardholderAddress : 'F',
          'displayDependent': this.selectedDependant != undefined ? this.selectedDependant : 'F',
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'cardNum', 'value': this.GridFilter75_CardNumber });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardHolderName', 'value': this.GridFilter75_CardHolderName });
          requestParam = this.pushToArray(requestParam, { 'key': 'gender', 'value': this.GridFilter75_Gender });
          requestParam = this.pushToArray(requestParam, { 'key': 'dob', 'value': this.GridFilter75_CardHolderDOB });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardType', 'value': this.GridFilter75_CardType });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardEffectiveDate', 'value': this.GridFilter75_CardEffectiveDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardTerminationDate', 'value': this.GridFilter75_CardTerminationDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'address', 'value': this.GridFilter75_Address });
          requestParam = this.pushToArray(requestParam, { 'key': 'status', 'value': this.GridFilter75_Status });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            if (this.showCardHolderAddress) {
              var columns = [
                { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), dataKey: 'cardNum' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardholderName'), dataKey: 'fullName' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardholderGender'), dataKey: 'personGenderCD' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardholderDateOfBirth'), dataKey: 'personDtOfBirth' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardType'), dataKey: 'cardTypeDesc' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardEffectiveDate'), dataKey: 'cardEffDate' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardTerminationDate'), dataKey: 'cardTerminationDate' },
                { title: this.translate.instant('uft.dashboard.financeReports.address'), dataKey: 'address' },
                { title: this.translate.instant('uft.dashboard.financeReports.status'), dataKey: 'chRoleDesc' }
              ];
            } else {
              var columns = [
                { title: this.translate.instant('uft.dashboard.financeReports.cardNumber'), dataKey: 'cardNum' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardholderName'), dataKey: 'fullName' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardholderGender'), dataKey: 'personGenderCD' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardholderDateOfBirth'), dataKey: 'personDtOfBirth' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardType'), dataKey: 'cardTypeDesc' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardEffectiveDate'), dataKey: 'cardEffDate' },
                { title: this.translate.instant('uft.dashboard.financeReports.cardTerminationDate'), dataKey: 'cardTerminationDate' },
                { title: this.translate.instant('uft.dashboard.financeReports.status'), dataKey: 'chRoleDesc' }
              ];
            }
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].personDtOfBirth = data.result.data[i].personDtOfBirth != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].personDtOfBirth) : ''
              data.result.data[i].cardEffDate = data.result.data[i].cardEffDate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].cardEffDate) : ''
              data.result.data[i].cardTerminationDate = data.result.data[i].cardTerminationDate != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].cardTerminationDate) : ''
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + " - " + endDate
            });
            this.pdfHeader(doc, headerobject)
            //End Header 
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "cardNum": { halign: 'left' },
                "fullName": { halign: 'right' },
                "personGenderCD": { halign: 'right' },
                "personDtOfBirth": { halign: 'right' },
                "cardTypeDesc": { halign: 'right' },
                "cardEffDate": { halign: 'right' },
                "cardTerminationDate": { halign: 'right' },
                "address": { halign: 'right' },
                "chRoleDesc": { halign: 'right' }
              },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          } else {
            this.showPageLoader = false;
          }
        });
        break;
      case 74: //Broker Commission Summary
        var url = UftApi.brokerCommissionSummaryReportPdfUrl;
        this.showPageLoader = true;
        requestParam = {
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'companyNameAndNo': this.selectedCompanyName,
          'brokerId': this.selectedBrokerId != undefined ? this.selectedBrokerId : '',
        }
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.brokerName'), dataKey: 'brokerName' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerNumber'), dataKey: 'brokerId' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'coName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'coId' },
              { title: this.translate.instant('uft.dashboard.financeReports.date'), dataKey: 'paymentSumRunDt' },
              { title: this.translate.instant('uft.dashboard.financeReports.dentalAmount'), dataKey: 'dentalAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.healthAmount'), dataKey: 'healthAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.visionAmount'), dataKey: 'visionAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.drugAmount'), dataKey: 'drugAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.supplementAmount'), dataKey: 'hsaAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalAmount'), dataKey: 'totalAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerCommissionRate'), dataKey: 'brokerRate' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerCommissionAmount'), dataKey: 'bcdCommissionAmt' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerGSTAmount'), dataKey: 'bcdGstAmt' }
            ];
            this.showPageLoader = false;
            for (var i in data.result.data) {
              data.result.data[i].paymentSumRunDt = data.result.data[i].paymentSumRunDt != '' ? this.changeDateFormatService.changeDateByMonthName(data.result.data[i].paymentSumRunDt) : ''
              data.result.data[i].dentalAmount = data.result.data[i].dentalAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].dentalAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].healthAmount = data.result.data[i].healthAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].healthAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].visionAmount = data.result.data[i].visionAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].visionAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].drugAmount = data.result.data[i].drugAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].drugAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].hsaAmount = data.result.data[i].hsaAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].hsaAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].totalAmount = data.result.data[i].totalAmount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].totalAmount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].bcdCommissionAmt = data.result.data[i].bcdCommissionAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].bcdCommissionAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
              data.result.data[i].bcdGstAmt = data.result.data[i].bcdGstAmt != '' ? this.currentUserService.convertAmountToDecimalWithDoller(data.result.data[i].bcdGstAmt) : this.currentUserService.convertAmountToDecimalWithDoller(0)
            }
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle
            });
            this.pdfHeader(doc, headerobject)
            //End Header   
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "brokerName": { halign: 'left' },
                "brokerId": { halign: 'right' },
                "coName": { halign: 'right' },
                "coId": { halign: 'right' },
                "paymentSumRunDt": { halign: 'right' },
                "dentalAmount": { halign: 'right' },
                "healthAmount": { halign: 'right' },
                "visionAmount": { halign: 'right' },
                "drugAmount": { halign: 'right' },
                "hsaAmount": { halign: 'right' },
                "totalAmount": { halign: 'right' },
                "brokerRate": { halign: 'right' },
                "bcdCommissionAmt": { halign: 'right' },
                "bcdGstAmt": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            this.pdfFooter(doc, this.reportID);
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 76: //Division Utilization Report
        var url = UftApi.divisionUtilizationReportUrl;
        this.showPageLoader = true;
        requestParam = {
          'compNameAndNo': this.selectedCompanyName,
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'divName', 'value': this.GridFilter76_DivName });
          requestParam = this.pushToArray(requestParam, { 'key': 'totalClaims', 'value': this.GridFilter76_TotalClaims });
          requestParam = this.pushToArray(requestParam, { 'key': 'totalEmployee', 'value': this.GridFilter76_TotalEmployee });
          requestParam = this.pushToArray(requestParam, { 'key': 'average', 'value': this.GridFilter76_average });
          requestParam = this.pushToArray(requestParam, { 'key': 'averageSingle', 'value': this.GridFilter76_AverageSingle });
          requestParam = this.pushToArray(requestParam, { 'key': 'averageFamily', 'value': this.GridFilter76_AverageFamily });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.divisionName'), dataKey: 'divisionName' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalClaims'), dataKey: 'totalClaims' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalEmployee'), dataKey: 'totalEmployee' },
              { title: this.translate.instant('uft.dashboard.financeReports.average'), dataKey: 'avgClaimCard' },
              { title: this.translate.instant('uft.dashboard.financeReports.averageSingle'), dataKey: 'averageSingle' },
              { title: this.translate.instant('uft.dashboard.financeReports.averageFamily'), dataKey: 'averageFamily' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "divisionName": { halign: 'left' },
                "totalClaims": { halign: 'right' },
                "totalEmployee": { halign: 'right' },
                "avgClaimCard": { halign: 'right' },
                "averageSingle": { halign: 'right' },
                "averageFamily": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            //Start Footer
            this.pdfFooter(doc, this.reportID);
            //End Footer
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 77: //Broker0371 Commission
        var url = UftApi.getBrokerCommissionReport;
        this.showPageLoader = true;
        requestParam = {
          'fromDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'toDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'brokerId': this.selectedBrokerId != undefined ? this.selectedBrokerId : '',
          "length": this.dataTableService.totalRecords
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerId', 'value': this.filterOverrideAmount });
          requestParam = this.pushToArray(requestParam, { 'key': 'coId', 'value': this.GridFilter77_CompanyNumber });
          requestParam = this.pushToArray(requestParam, { 'key': 'coName', 'value': this.GridFilter77_CompanyName });
          requestParam = this.pushToArray(requestParam, { 'key': 'coEffectiveOn', 'value': this.GridFilter77_CompanyEffectiveDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerEffectiveOn', 'value': this.GridFilter77_BrokerEffectiveDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerCompanyEffectiveOn', 'value': this.GridFilter77_BrokerCompanyEffectiveDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerCompanyExpireOn', 'value': this.GridFilter77_BrokerCompanyExiryDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'brokerCompanyTermDate', 'value': this.GridFilter77_BrokerCompanyTerminationDate });
          requestParam = this.pushToArray(requestParam, { 'key': 'qbciCommisionRate', 'value': this.GridFilter77_QBCICommisionRate });
          requestParam = this.pushToArray(requestParam, { 'key': 'wbciCommisionRate', 'value': this.GridFilter77_WbciCommisionRate });
          requestParam = this.pushToArray(requestParam, { 'key': 'clientUtilization', 'value': this.GridFilter77_CommisionPayable });
          requestParam = this.pushToArray(requestParam, { 'key': 'isPaid', 'value': this.GridFilter77_IsPaid });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.brokerId'), dataKey: 'brokerId' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyNumber'), dataKey: 'companyNumber' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'companyName' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyEffDate'), dataKey: 'companyEffDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerEffectiveDate'), dataKey: 'brokerEffDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerCompanyEffevtiveDate'), dataKey: 'brokerCompanyEffDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.brokerCompanyExpiryDate'), dataKey: 'brokerCompanyExpDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyTerminationDate'), dataKey: 'companyTermDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.qbciCommissionRate'), dataKey: 'qbciCommissionRate' },
              { title: this.translate.instant('uft.dashboard.financeReports.commissionRate'), dataKey: 'commissionRate' },
              { title: this.translate.instant('uft.dashboard.financeReports.clientUtilization'), dataKey: 'clientUtilization' },
              { title: this.translate.instant('uft.dashboard.financeReports.commissionPayable'), dataKey: 'commissionPayable' },
              { title: this.translate.instant('uft.dashboard.financeReports.isPaid'), dataKey: 'isPaid' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "brokerId": { halign: 'left' },
                "companyNumber": { halign: 'right' },
                "companyName": { halign: 'right' },
                "companyEffDate": { halign: 'right' },
                "brokerEffDate": { halign: 'right' },
                "brokerCompanyEffDate": { halign: 'right' },
                "brokerCompanyExpDate": { halign: 'right' },
                "companyTermDate": { halign: 'right' },
                "qbciCommissionRate": { halign: 'right' },
                "commissionRate": { halign: 'right' },
                "clientUtilization": { halign: 'right' },
                "commissionPayable": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            //Start Footer
            this.pdfFooter(doc, this.reportID);
            //End Footer
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 79: //QBCI Eligibility Age65
        var url = UftApi.qbciEligibilityAge65Report;
        this.showPageLoader = true;
        requestParam = {
          'eligibleDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords,
          "excel": 'F'
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          /* 
          QBCI Eligibility RBC  
          GridFilterp79_carrier
          GridFilterp79_employerName
          GridFilterp79_cardId
          GridFilterp79_effectiveDate
          GridFilterp79_clientType
          GridFilterp79_firstName
          GridFilterp79_lastName
          GridFilterp79_dob
          GridFilterp79_age
          GridFilterp79_relationship
          GridFilterp79_address1
          GridFilterp79_city
          GridFilterp79_province
          GridFilterp79_postalCode
          GridFilterp79_isBankAccountActive
          */
          requestParam = this.pushToArray(requestParam, { 'key': 'carrier', 'value': this.GridFilterp79_carrier });
          requestParam = this.pushToArray(requestParam, { 'key': 'employerName', 'value': this.GridFilterp79_employerName });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardId', 'value': this.GridFilterp79_cardId });
          requestParam = this.pushToArray(requestParam, { 'key': 'effectiveDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp79_effectiveDate) });
          requestParam = this.pushToArray(requestParam, { 'key': 'clientType', 'value': this.GridFilterp79_clientType });
          requestParam = this.pushToArray(requestParam, { 'key': 'firstName', 'value': this.GridFilterp79_firstName });
          requestParam = this.pushToArray(requestParam, { 'key': 'lastName', 'value': this.GridFilterp79_lastName });
          requestParam = this.pushToArray(requestParam, { 'key': 'dob', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp79_dob) });
          requestParam = this.pushToArray(requestParam, { 'key': 'age', 'value': this.GridFilterp79_age });
          requestParam = this.pushToArray(requestParam, { 'key': 'relationship', 'value': this.GridFilterp79_relationship });
          requestParam = this.pushToArray(requestParam, { 'key': 'address1', 'value': this.GridFilterp79_address1 });
          requestParam = this.pushToArray(requestParam, { 'key': 'city', 'value': this.GridFilterp79_city });
          requestParam = this.pushToArray(requestParam, { 'key': 'province', 'value': this.GridFilterp79_province });
          requestParam = this.pushToArray(requestParam, { 'key': 'postalCode', 'value': this.GridFilterp79_postalCode });
          requestParam = this.pushToArray(requestParam, { 'key': 'isBankAccountActive', 'value': this.GridFilterp79_isBankAccountActive });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.carrier'), dataKey: 'carrier' },
              { title: this.translate.instant('uft.dashboard.financeReports.employerName'), dataKey: 'employerName' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardId'), dataKey: 'cardId' },
              { title: this.translate.instant('uft.dashboard.financeReports.effectiveDate'), dataKey: 'effectiveDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.clientType'), dataKey: 'clientType' },
              { title: this.translate.instant('uft.dashboard.financeReports.firstName'), dataKey: 'firstName' },
              { title: this.translate.instant('uft.dashboard.financeReports.lastName'), dataKey: 'lastName' },
              { title: this.translate.instant('uft.dashboard.financeReports.dob'), dataKey: 'dob' },
              { title: this.translate.instant('uft.dashboard.financeReports.age'), dataKey: 'age' },
              { title: this.translate.instant('uft.dashboard.financeReports.relationship'), dataKey: 'relationship' },
              { title: this.translate.instant('uft.dashboard.financeReports.address1'), dataKey: 'address1' },
              { title: this.translate.instant('uft.dashboard.financeReports.city'), dataKey: 'city' },
              { title: this.translate.instant('uft.dashboard.financeReports.province'), dataKey: 'province' },
              { title: this.translate.instant('uft.dashboard.financeReports.postalCode'), dataKey: 'postalCode' },
              { title: this.translate.instant('uft.dashboard.financeReports.isBankAccountActive'), dataKey: 'isBankAccountActive' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "carrier": { halign: 'left' },
                "employerName": { halign: 'right' },
                "cardId": { halign: 'right' },
                "effectiveDate": { halign: 'right' },
                "clientType": { halign: 'right' },
                "firstName": { halign: 'right' },
                "lastName": { halign: 'right' },
                "dob": { halign: 'right' },
                "age": { halign: 'right' },
                "relationship": { halign: 'right' },
                "address1": { halign: 'right' },
                "city": { halign: 'right' },
                "province": { halign: 'right' },
                "postalCode": { halign: 'right' },
                "isBankAccountActive": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            //Start Footer
            this.pdfFooter(doc, this.reportID);
            //End Footer
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 80: //QBCI Eligibility RBC
        var url = UftApi.qbciTravelEligibilityReport;
        this.showPageLoader = true;
        requestParam = {
          'eligibleDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          /* 
          QBCI Eligibility RBC        
          GridFilterp80_carrier
          GridFilterp80_employerName
          GridFilterp80_cardId
          GridFilterp80_effectiveDate
          GridFilterp80_clientType
          GridFilterp80_firstName
          GridFilterp80_lastName
          GridFilterp80_dob
          GridFilterp80_age
          GridFilterp80_relationship
          GridFilterp80_address1
          GridFilterp80_city
          GridFilterp80_province
          GridFilterp80_postalCode
          GridFilterp80_isBankAccountActive
          */
          requestParam = this.pushToArray(requestParam, { 'key': 'carrier', 'value': this.GridFilterp80_carrier });
          requestParam = this.pushToArray(requestParam, { 'key': 'employerName', 'value': this.GridFilterp80_employerName });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardId', 'value': this.GridFilterp80_cardId });
          requestParam = this.pushToArray(requestParam, { 'key': 'effectiveDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp80_effectiveDate) });
          requestParam = this.pushToArray(requestParam, { 'key': 'clientType', 'value': this.GridFilterp80_clientType });
          requestParam = this.pushToArray(requestParam, { 'key': 'firstName', 'value': this.GridFilterp80_firstName });
          requestParam = this.pushToArray(requestParam, { 'key': 'lastName', 'value': this.GridFilterp80_lastName });
          requestParam = this.pushToArray(requestParam, { 'key': 'dob', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp80_dob) });
          requestParam = this.pushToArray(requestParam, { 'key': 'age', 'value': this.GridFilterp80_age });
          requestParam = this.pushToArray(requestParam, { 'key': 'relationship', 'value': this.GridFilterp80_relationship });
          requestParam = this.pushToArray(requestParam, { 'key': 'address1', 'value': this.GridFilterp80_address1 });
          requestParam = this.pushToArray(requestParam, { 'key': 'city', 'value': this.GridFilterp80_city });
          requestParam = this.pushToArray(requestParam, { 'key': 'province', 'value': this.GridFilterp80_province });
          requestParam = this.pushToArray(requestParam, { 'key': 'postalCode', 'value': this.GridFilterp80_postalCode });
          requestParam = this.pushToArray(requestParam, { 'key': 'isBankAccountActive', 'value': this.GridFilterp80_isBankAccountActive });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.carrier'), dataKey: 'carrier' },
              { title: this.translate.instant('uft.dashboard.financeReports.employerName'), dataKey: 'employerName' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalEmployee'), dataKey: 'cardId' },
              { title: this.translate.instant('uft.dashboard.financeReports.effectiveDate'), dataKey: 'effectiveDate' },
              { title: this.translate.instant('uft.dashboard.financeReports.clientType'), dataKey: 'clientType' },
              { title: this.translate.instant('uft.dashboard.financeReports.firstName'), dataKey: 'firstName' },
              { title: this.translate.instant('uft.dashboard.financeReports.lastName'), dataKey: 'lastName' },
              { title: this.translate.instant('uft.dashboard.financeReports.dob'), dataKey: 'dob' },
              { title: this.translate.instant('uft.dashboard.financeReports.age'), dataKey: 'age' },
              { title: this.translate.instant('uft.dashboard.financeReports.relationship'), dataKey: 'relationship' },
              { title: this.translate.instant('uft.dashboard.financeReports.address1'), dataKey: 'address1' },
              { title: this.translate.instant('uft.dashboard.financeReports.city'), dataKey: 'city' },
              { title: this.translate.instant('uft.dashboard.financeReports.province'), dataKey: 'province' },
              { title: this.translate.instant('uft.dashboard.financeReports.postalCode'), dataKey: 'postalCode' },
              { title: this.translate.instant('uft.dashboard.financeReports.isBankAccountActive'), dataKey: 'isBankAccountActive' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "carrier": { halign: 'left' },
                "employerName": { halign: 'right' },
                "cardId": { halign: 'right' },
                "effectiveDate": { halign: 'right' },
                "clientType": { halign: 'right' },
                "firstName": { halign: 'right' },
                "lastName": { halign: 'right' },
                "dob": { halign: 'right' },
                "age": { halign: 'right' },
                "relationship": { halign: 'right' },
                "address1": { halign: 'right' },
                "city": { halign: 'right' },
                "province": { halign: 'right' },
                "postalCode": { halign: 'right' },
                "isBankAccountActive": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            //Start Footer
            this.pdfFooter(doc, this.reportID);
            //End Footer
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 82: //QBCI Eligibility Travel Insurance
        break;
      case 78:
        break;
      case 81: //QBCI Travel Eligibility Reconciliation 
        var url = UftApi.qbciTravelEligibilityReconciliationReport;
        this.showPageLoader = true;
        requestParam = {
          'eligibleDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'start': 0,
          'length': this.dataTableService.totalRecords
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          /* 
          QBCI Travel Eligibility Reconciliation            
          GridFilterp81_companyId
          GridFilterp81_companyName
          GridFilterp81_totalFamilyCount
          GridFilterp81_familyAlberta
          GridFilterp81_familyBritishColumbia
          GridFilterp81_familyManitoba
          GridFilterp81_familyNovascotia
          GridFilterp81_familyOntario
          GridFilterp81_familyQuebec
          GridFilterp81_familySaskatchewan
          GridFilterp81_familyNewbrunswick
          GridFilterp81_familyPrinceEdwardIsland
          GridFilterp81_familyYukonTerritory
          GridFilterp81_familyNorthWestTerritories
          GridFilterp81_familyNewFoundLand
          GridFilterp81_familyNunavut
          GridFilterp81_totalSingleCount
          GridFilterp81_singleAlberta
          GridFilterp81_singleBritishColumbia
          GridFilterp81_singleManitoba
          GridFilterp81_singleNovascotia
          GridFilterp81_singleOntario
          GridFilterp81_singleQuebec
          GridFilterp81_singleSaskatchewan
          GridFilterp81_singleNewbrunswick
          GridFilterp81_singlePrinceEdwardIsland
          GridFilterp81_singleYukonTerritory
          GridFilterp81_singleNorthWestTerritories
          GridFilterp81_singleNewFoundLand
          GridFilterp81_singleNunavut
          GridFilterp81_broker1
          GridFilterp81_broker2
          GridFilterp81_broker3
          GridFilterp81_broker4
          */
          requestParam = this.pushToArray(requestParam, { 'key': 'companyId', 'value': this.GridFilterp81_companyId });
          requestParam = this.pushToArray(requestParam, { 'key': 'companyName', 'value': this.GridFilterp81_companyName });
          requestParam = this.pushToArray(requestParam, { 'key': 'totalFamilyCount', 'value': this.GridFilterp81_totalFamilyCount });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyAlberta', 'value': this.GridFilterp81_familyAlberta });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyBritishColumbia', 'value': this.GridFilterp81_familyBritishColumbia });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyManitoba', 'value': this.GridFilterp81_familyManitoba });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyNovascotia', 'value': this.GridFilterp81_familyNovascotia });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyOntario', 'value': this.GridFilterp81_familyOntario });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyQuebec', 'value': this.GridFilterp81_familyQuebec });
          requestParam = this.pushToArray(requestParam, { 'key': 'familySaskatchewan', 'value': this.GridFilterp81_familySaskatchewan });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyNewbrunswick', 'value': this.GridFilterp81_familyNewbrunswick });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyPrinceEdwardIsland', 'value': this.GridFilterp81_familyPrinceEdwardIsland });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyYukonTerritory', 'value': this.GridFilterp81_familyYukonTerritory });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyNorthWestTerritories', 'value': this.GridFilterp81_familyNorthWestTerritories });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyNewFoundLand', 'value': this.GridFilterp81_familyNewFoundLand });
          requestParam = this.pushToArray(requestParam, { 'key': 'familyNunavut', 'value': this.GridFilterp81_familyNunavut });
          requestParam = this.pushToArray(requestParam, { 'key': 'totalSingleCount', 'value': this.GridFilterp81_totalSingleCount });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleAlberta', 'value': this.GridFilterp81_singleAlberta });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleBritishColumbia', 'value': this.GridFilterp81_singleBritishColumbia });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleManitoba', 'value': this.GridFilterp81_singleManitoba });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleNovascotia', 'value': this.GridFilterp81_singleNovascotia });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleOntario', 'value': this.GridFilterp81_singleOntario });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleQuebec', 'value': this.GridFilterp81_singleQuebec });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleSaskatchewan', 'value': this.GridFilterp81_singleSaskatchewan });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleNewbrunswick', 'value': this.GridFilterp81_singleNewbrunswick });
          requestParam = this.pushToArray(requestParam, { 'key': 'singlePrinceEdwardIsland', 'value': this.GridFilterp81_singlePrinceEdwardIsland });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleYukonTerritory', 'value': this.GridFilterp81_singleYukonTerritory });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleNorthWestTerritories', 'value': this.GridFilterp81_singleNorthWestTerritories });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleNewFoundLand', 'value': this.GridFilterp81_singleNewFoundLand });
          requestParam = this.pushToArray(requestParam, { 'key': 'singleNunavut', 'value': this.GridFilterp81_singleNunavut });
          requestParam = this.pushToArray(requestParam, { 'key': 'broker1', 'value': this.GridFilterp81_broker1 });
          requestParam = this.pushToArray(requestParam, { 'key': 'broker2', 'value': this.GridFilterp81_broker2 });
          requestParam = this.pushToArray(requestParam, { 'key': 'broker3', 'value': this.GridFilterp81_broker3 });
          requestParam = this.pushToArray(requestParam, { 'key': 'broker4', 'value': this.GridFilterp81_broker4 });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.companyID'), dataKey: 'companyId' },
              { title: this.translate.instant('uft.dashboard.financeReports.companyName'), dataKey: 'companyName' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalFamilyCount'), dataKey: 'totalFamilyCount' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyAlberta'), dataKey: 'familyAlberta' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyBritishColumbia'), dataKey: 'familyBritishColumbia' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyManitoba'), dataKey: 'familyManitoba' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyNovascotia'), dataKey: 'familyNovascotia' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyOntario'), dataKey: 'familyOntario' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyQuebec'), dataKey: 'familyQuebec' },
              { title: this.translate.instant('uft.dashboard.financeReports.familySaskatchewan'), dataKey: 'familySaskatchewan' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyNewbrunswick'), dataKey: 'familyNewbrunswick' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyPrinceEdwardIsland'), dataKey: 'familyPrinceEdwardIsland' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyYukonTerritory'), dataKey: 'familyYukonTerritory' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyNorthWestTerritories'), dataKey: 'familyNorthWestTerritories' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyNewFoundLand'), dataKey: 'familyNewFoundLand' },
              { title: this.translate.instant('uft.dashboard.financeReports.familyNunavut'), dataKey: 'familyNunavut' },
              { title: this.translate.instant('uft.dashboard.financeReports.totalSingleCount'), dataKey: 'totalSingleCount' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleAlberta'), dataKey: 'singleAlberta' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleBritishColumbia'), dataKey: 'singleBritishColumbia' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleManitoba'), dataKey: 'singleManitoba' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleNovascotia'), dataKey: 'singleNovascotia' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleOntario'), dataKey: 'singleOntario' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleQuebec'), dataKey: 'singleQuebec' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleSaskatchewan'), dataKey: 'singleSaskatchewan' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleNewbrunswick'), dataKey: 'singleNewbrunswick' },
              { title: this.translate.instant('uft.dashboard.financeReports.singlePrinceEdwardIsland'), dataKey: 'singlePrinceEdwardIsland' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleYukonTerritory'), dataKey: 'singleYukonTerritory' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleNorthWestTerritories'), dataKey: 'singleNorthWestTerritories' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleNewFoundLand'), dataKey: 'singleNewFoundLand' },
              { title: this.translate.instant('uft.dashboard.financeReports.singleNunavut'), dataKey: 'singleNunavut' },
              { title: this.translate.instant('uft.dashboard.financeReports.broker1'), dataKey: 'broker1' },
              { title: this.translate.instant('uft.dashboard.financeReports.broker2'), dataKey: 'broker2' },
              { title: this.translate.instant('uft.dashboard.financeReports.broker3'), dataKey: 'broker3' },
              { title: this.translate.instant('uft.dashboard.financeReports.broker4'), dataKey: 'broker4' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "companyId": { halign: 'left' },
                "companyName": { halign: 'right' },
                "totalFamilyCount": { halign: 'right' },
                "familyAlberta": { halign: 'right' },
                "familyBritishColumbia": { halign: 'right' },
                "familyManitoba": { halign: 'right' },
                "familyNovascotia": { halign: 'right' },
                "familyOntario": { halign: 'right' },
                "familyQuebec": { halign: 'right' },
                "familySaskatchewan": { halign: 'right' },
                "familyNewbrunswick": { halign: 'right' },
                "familyPrinceEdwardIsland": { halign: 'right' },
                "familyYukonTerritory": { halign: 'right' },
                "familyNorthWestTerritories": { halign: 'right' },
                "familyNewFoundLand": { halign: 'right' },
                "familyNunavut": { halign: 'right' },
                "totalSingleCount": { halign: 'right' },
                "singleAlberta": { halign: 'right' },
                "singleBritishColumbia": { halign: 'right' },
                "singleManitoba": { halign: 'right' },
                "singleNovascotia": { halign: 'right' },
                "singleOntario": { halign: 'right' },
                "singleQuebec": { halign: 'right' },
                "singleSaskatchewan": { halign: 'right' },
                "singleNewbrunswick": { halign: 'right' },
                "singlePrinceEdwardIsland": { halign: 'right' },
                "singleYukonTerritory": { halign: 'right' },
                "singleNorthWestTerritories": { halign: 'right' },
                "singleNewFoundLand": { halign: 'right' },
                "singleNunavut": { halign: 'right' },
                "broker1": { halign: 'right' },
                "broker2": { halign: 'right' },
                "broker3": { halign: 'right' },
                "broker4": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            //Start Footer
            this.pdfFooter(doc, this.reportID);
            //End Footer
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
      case 84: //Mailable Report
        this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.mailLabelReport');
        var doc = new jsPDF('p', 'pt', 'a4');
        this.filterColoumn = [];
        var columns1 = [];
        this.showPageLoader = false;
        var rows = this.filteredTableData;
        var body = [];
        var head = [];
        let first_Value: any;
        let second_Value: any;
        let third_Value: any;
        var arayLength = this.chunkArray(this.filteredTableData, 3);
        for (var i in arayLength) {
          switch (arayLength[i].length) {
            case 1:
              first_Value = arayLength[i][0].name + "\n" + arayLength[i][0].componentAddress + ", " + arayLength[i][0].cityName + ", " + arayLength[i][0].provinceName + "\n" + arayLength[i][0].postalCd;
              second_Value = '';
              third_Value = '';
              break;
            case 2:
              first_Value = arayLength[i][0].name + "\n" + arayLength[i][0].componentAddress + ", " + arayLength[i][0].cityName + ", " + arayLength[i][0].provinceName + "\n" + arayLength[i][0].postalCd;
              second_Value = arayLength[i][1].name + "\n" + arayLength[i][1].componentAddress + ", " + arayLength[i][1].cityName + ", " + arayLength[i][1].provinceName + "\n" + arayLength[i][1].postalCd;
              third_Value = '';
              break;
            case 3:
              first_Value = arayLength[i][0].name + "\n" + arayLength[i][0].componentAddress + ", " + arayLength[i][0].cityName + ", " + arayLength[i][0].provinceName + "\n" + arayLength[i][0].postalCd;
              second_Value = arayLength[i][1].name + "\n" + arayLength[i][1].componentAddress + ", " + arayLength[i][1].cityName + ", " + arayLength[i][1].provinceName + "\n" + arayLength[i][1].postalCd;
              third_Value = arayLength[i][2].name + "\n" + arayLength[i][2].componentAddress + ", " + arayLength[i][2].cityName + ", " + arayLength[i][2].provinceName + "\n" + arayLength[i][2].postalCd;
              break;
          }
          body.push({
            "name": { 'content': first_Value },
            "cityName": { 'content': second_Value },
            "provinceName": { 'content': third_Value }
          });
        }
        if (body.length > 0) {
          var finalArayLength = this.chunkArray(body, 7);
        }
        if (finalArayLength.length > 0) {
          for (var k = 0; k <= (finalArayLength.length - 1); k++) {
            if (k == 0) {
              doc.autoTable({
                head: columns1,
                body: finalArayLength[k],
                styles: { overflow: 'linebreak', fontSize: 10, cellPadding: 15, minCellHeight: 20 },
                startY: 50,
                startX: 20,
                theme: 'plain',
              });
            } else {
              doc.autoTable({
                pageBreak: 'always',
                head: columns1,
                body: finalArayLength[k],
                styles: { overflow: 'linebreak', fontSize: 10, cellPadding: 15, minCellHeight: 20 },
                startY: 50,
                startX: 20,
                theme: 'plain',
              });
            }
          }
        }
        doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
        break;

      case 83: //Amount Paid report 
        var url = UftApi.amountPaidReportUrl;
        this.showPageLoader = true;
        let claimStatusList = []
        if (this.selectedClaimStatusType.length > 0) {
          this.selectedClaimStatusType.forEach(element => {
            claimStatusList.push(element.itemNameCd);
          });
        } else {
          this.claimStatusArray.forEach(element => {
            claimStatusList.push(element.itemNameCd);
          });
        }
        requestParam = {
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'coId': this.selecteCoID != undefined ? this.selecteCoID : '',
          'divisionKey': this.filterReport.value.divisionKey != undefined ? this.filterReport.value.divisionKey : '',
          'processorId': this.filterReport.value.processorId != undefined ? this.filterReport.value.processorId : '',
          'cardNumber': this.filterReport.value.cardHolderNameOrNumber != undefined ? this.filterReport.value.cardHolderNameOrNumber : '',
          'claimType': this.filterReport.value.claimType != undefined ? this.filterReport.value.claimType : '',
          'claimStatusList': claimStatusList,
          'discipline': this.filterReport.value.discipline != undefined ? this.filterReport.value.discipline : '',
          'excel': 'F',
          'start': 0,
          'length': this.dataTableService.totalRecords
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = this.pushToArray(requestParam, { 'key': 'cardNumber', 'value': this.filterCardNumber });
          requestParam = this.pushToArray(requestParam, { 'key': 'procedureCode', 'value': this.filterProcedureCode });
          requestParam = this.pushToArray(requestParam, { 'key': 'cobAmount', 'value': this.filterCobAmount });
          requestParam = this.pushToArray(requestParam, { 'key': 'paidAmount', 'value': this.filterPaidAmount });
          requestParam = this.pushToArray(requestParam, { 'key': 'coveredAmount', 'value': this.filterCoveredAmount });
          requestParam = this.pushToArray(requestParam, { 'key': 'eligibleAmount', 'value': this.filterEligibleAmount });
          requestParam = this.pushToArray(requestParam, { 'key': 'claimedAmount', 'value': this.filterClaimedAmount });
          requestParam = this.pushToArray(requestParam, { 'key': 'serviceProvider', 'value': this.filterServiceProvider });
          requestParam = this.pushToArray(requestParam, { 'key': 'patientName', 'value': this.filterPatientName });
          requestParam = this.pushToArray(requestParam, { 'key': 'cardHolderName', 'value': this.filterCardHolderName });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.filterReport.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate)) : '';
            let endDate = this.filterReport.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate)) : '';
            var columns = [
              { title: this.translate.instant('uft.dashboard.financeReports.cardholderNumber'), dataKey: 'cardNo' },
              { title: this.translate.instant('uft.dashboard.financeReports.cardholderName'), dataKey: 'cardholderName' },
              { title: this.translate.instant('uft.dashboard.financeReports.patientName'), dataKey: 'patientFirstName' },
              { title: this.translate.instant('uft.dashboard.financeReports.serviceProvider'), dataKey: 'providerFirstName' },
              { title: this.translate.instant('uft.dashboard.financeReports.procedureCode'), dataKey: 'procedureCd' },
              { title: this.translate.instant('uft.dashboard.financeReports.claimedAmount'), dataKey: 'feeClaimedAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.eligibleAmount'), dataKey: 'feeEligibleAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.coveredAmount'), dataKey: 'feeCoveredAmount' },
              { title: this.translate.instant('uft.dashboard.financeReports.cobAmount'), dataKey: 'cobAmt' },
              { title: this.translate.instant('uft.dashboard.financeReports.paidAmount'), dataKey: 'paidAmt' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': FromDate + ' - ' + endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header  
            doc.autoTable(columns, rows, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [215, 214, 213],
                lineWidth: 1,
              },
              columnStyles: {
                "cardNo": { halign: 'left' },
                "cardholderName": { halign: 'right' },
                "patientFirstName": { halign: 'right' },
                "providerFirstName": { halign: 'right' },
                "procedureCd": { halign: 'right' },
                "feeClaimedAmount": { halign: 'right' },
                "feeEligibleAmount": { halign: 'right' },
                "feeCoveredAmount": { halign: 'right' },
                "cobAmt": { halign: 'right' },
                "paidAmt": { halign: 'right' }
              },
              didParseCell: function (data) {
                if (data.section == 'head' && data.column.index != 0) {
                  data.cell.styles.halign = 'right';
                }
              },
              startY: 100,
              startX: 40,
              theme: 'grid',
            });
            //Start Footer
            this.pdfFooter(doc, this.reportID);
            //End Footer
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;
    }
  }

  chunkArray(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    for (index = 0; index < arrayLength; index += chunk_size) {
      var myChunk = myArray.slice(index, index + chunk_size);
      // Do something if you want with the group
      tempArray.push(myChunk);
    }
    return tempArray;
  }

  resetReportForm() {
    this.filterReport.reset();
    this.selectedCompany = ''
    this.selectedCompanyName = ''
    this.selecteCoKey = ''
    this.selecteCoID = ''
    this.selectedCompanyStatus = '';
    this.selectedUFT = '';
    this.columnFilterSearch = false;
    this.coId = '';
    this.coTerminatedOn = "";
    this.amount = '';
    if ($.fn.dataTable.isDataTable('#' + this.tableId)) {
      var table = $('#' + this.tableId).DataTable();
      table.clear();
      table.destroy();
    }
    $('#hideModal').trigger('click');
  }

  downloadTextFile() {
    switch (this.reportID) {
      case 82: ///QBCI Eligibility Travel Insurance
        var today = new Date();
        var date = today.getDate();
        var month = today.getMonth() + 1;
        var year = today.getFullYear();
        var current_date = "01/06/2018";
        var reqParamPlan = {
          "eligibleDate": current_date
        }
        var URL = UftApi.qbciTravelEligibilityReportForTextFile
        if (this.dataTableService.totalRecords > 500) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFileCSVTEXT(URL, reqParamPlan)
            }
          });
        } else {
          this.exportFileCSVTEXT(URL, reqParamPlan)
        }
        break;
      case 78://BankFile
        var today = new Date();
        var date = today.getDate();
        var month = today.getMonth() + 1;
        var year = today.getFullYear();
        var current_date = "01/06/2018";
        var reqParamPlan = {
          "eligibleDate": current_date
        }
        var URL = UftApi.qbciTravelEligibilityBankFile
        if (this.dataTableService.totalRecords > 500) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFileCSVTEXT(URL, reqParamPlan)
            }
          });
        } else {
          this.exportFileCSVTEXT(URL, reqParamPlan)
        }
        break;
    }
  }

  exportReportList() {
    var transCodeArray = []
    switch (this.reportID) {
      case 26: //Claim Payments by Cardholder
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.getPaymentForCHExcelReportUrl;
          var reqParamPlan26 = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            'cardNum': this.filterReport.value.cardNumber,
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamPlan26[2].value = this.GridFilter26_CardNum;
            reqParamPlan26 = this.pushToArray(reqParamPlan26, { 'key': 'confirmationNum', 'value': this.GridFilter26_ConfirmationNum });
            reqParamPlan26 = this.pushToArray(reqParamPlan26, { 'key': 'cardholderName', 'value': this.GridFilter26_CardholderName });
            reqParamPlan26 = this.pushToArray(reqParamPlan26, { 'key': 'procCode', 'value': this.GridFilter26_ProcCode });
            reqParamPlan26 = this.pushToArray(reqParamPlan26, { 'key': 'procDesc', 'value': this.GridFilter26_ProcDesc });
            reqParamPlan26 = this.pushToArray(reqParamPlan26, { 'key': 'amountSubmitted', 'value': this.GridFilter26_AmountSubmitted });
            reqParamPlan26 = this.pushToArray(reqParamPlan26, { 'key': 'amountPaid', 'value': this.GridFilter26_AmountPaid });
            reqParamPlan26 = this.pushToArray(reqParamPlan26, { 'key': 'amountNotPaid', 'value': this.GridFilter26_AmountNotPaid });
            reqParamPlan26 = this.pushToArray(reqParamPlan26, { 'key': 'serviceDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_ServiceDate) });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan26);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan26);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan26);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case -114: //Funding Summary
        if (this.dataTableService.totalRecords != undefined) {
          this.selectedTransactionType;
          if (this.selectedTransactionType.length > 0) {
            this.selectedTransactionType.forEach(element => {
              transCodeArray.push(parseInt(element.itemName));
            });
          }
          var URL = UftApi.getFundingSummaryReportExcel;
          var reqParamPlan = {
            "fromDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "toDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            "transCodeList": transCodeArray,
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
            "fileName": this.reportPopUpTitle
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;

      case -105: //Get Tax payable summary report
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.getExcelReportForProvincialTaxPayableSummary;
          var reqParamPlan105 = {
            "fromDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "toDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            "provinceName": this.filterReport.value.provinceName,
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamPlan105[3].value = this.GridFilter105_ProvinceName;
            reqParamPlan105 = this.pushToArray(reqParamPlan105, { 'key': 'coId', 'value': this.GridFilter105_CompanyNum });
            reqParamPlan105 = this.pushToArray(reqParamPlan105, { 'key': 'coName', 'value': this.GridFilter105_CompanyName });
            reqParamPlan105 = this.pushToArray(reqParamPlan105, { 'key': 'amount', 'value': this.GridFilter105_TaxBaseAmount });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan105);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan105);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan105);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 8: //Company Balances
        if (this.dataTableService.totalRecords != undefined) {
          if (this.uftReqDataArray != undefined && this.uftReqDataArray.isDashboard) {
            if (this.uftReqDataArray.type == 'open') {
              var URL = UftApi.getOpeningBalanceExcelReportUrl;
              var requestParam = {
                'compNameAndNo': this.uftReqDataArray.compNameAndNo,
                'startDate': this.uftReqDataArray.startDate != null ? this.uftReqDataArray.startDate : '',
                'endDate': this.uftReqDataArray.endDate != null ? this.uftReqDataArray.endDate : '',
                "paramApplication": "HMS",
                "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
              }
              /** Start Narrow Search */
              if (this.columnFilterSearch) {
                requestParam = this.pushToArray(requestParam, { 'key': 'coName', 'value': this.GridFilter8_CompanyName });
                requestParam = this.pushToArray(requestParam, { 'key': 'coId', 'value': this.GridFilter8_CompanyNumber });
                requestParam = this.pushToArray(requestParam, { 'key': 'effectiveOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter8_EffectiveOn) });
                requestParam = this.pushToArray(requestParam, { 'key': 'coTerminatedOn', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter8_TerminatedOn) });
                requestParam = this.pushToArray(requestParam, { 'key': 'balance', 'value': this.GridFilter8_Balance });
                requestParam = this.pushToArray(requestParam, { 'key': 'coPapAmt', 'value': this.GridFilter8_CoPapAmt });
              }
              /** End Narrow Search */
              if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
                this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                  if (value) {
                    this.exportFile(URL, requestParam);
                  }
                });
              } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
                this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                  if (value) {
                    this.exportFile(URL, requestParam);
                  }
                });
              } else {
                this.exportFile(URL, requestParam);
              }
            } else {
              var URL = UftApi.getCompanyBalanceReportExcel
              var requestParam8 = {
                'compNameAndNo': this.uftReqDataArray.compNameAndNo,
                'startDate': this.uftReqDataArray.startDate != null ? this.uftReqDataArray.startDate : '',
                'endDate': this.uftReqDataArray.endDate != null ? this.uftReqDataArray.endDate : '',
                'status': this.uftReqDataArray.companyStatus,
                'coFlag': this.uftReqDataArray.coFlag,
                'isDashboard': this.uftReqDataArray.isDashboard,
                "businessTypeCd": 'Q',
                "paramApplication": "HMS",
                "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
              }
              if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
                this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                  if (value) {
                    this.exportFile(URL, requestParam8);
                  }
                });
              } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
                this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                  if (value) {
                    this.exportFile(URL, requestParam8);
                  }
                });
              } else {
                this.exportFile(URL, requestParam8);
              }
            }
          } else {
            var URL = UftApi.getCompanyBalanceReportExcel
            requestParam8 = {
              'compNameAndNo': this.selectedCompanyName,
              'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
              'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
              'status': this.selectedCompanyStatus != undefined ? this.selectedCompanyStatus : '',
              'coFlag': this.selectedUFT != undefined ? this.selectedUFT : '',
              'isDashboard': 'F',
              "businessTypeCd": 'Q',
              "paramApplication": "HMS",
              "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
            }
            if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam8);
                }
              });
            } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, requestParam8);
                }
              });
            } else {
              this.exportFile(URL, requestParam8);
            }
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case -8: //Company Balances
        if (this.dataTableService.totalRecords != undefined) {
          if (this.uftReqDataArray != undefined && this.uftReqDataArray.isDashboard) {
            if (this.uftReqDataArray.type == 'open') {
              var URL = UftApi.getOpeningBalanceExcelReportUrl;
              var requestParam = {
                'compNameAndNo': this.uftReqDataArray.compNameAndNo,
                'startDate': this.uftReqDataArray.startDate != null ? this.uftReqDataArray.startDate : '',
                'endDate': this.uftReqDataArray.endDate != null ? this.uftReqDataArray.endDate : '',
                "paramApplication": "HMS",
                "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
              }
              if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
                this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                  if (value) {
                    this.exportFile(URL, requestParam);
                  }
                });
              } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
                this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                  if (value) {
                    this.exportFile(URL, requestParam);
                  }
                });
              } else {
                this.exportFile(URL, requestParam);
              }
            } else {
              var URL = UftApi.getCompanyBalanceReportExcel
              var requestParam8 = {
                'compNameAndNo': this.uftReqDataArray.compNameAndNo,
                'startDate': this.uftReqDataArray.startDate != null ? this.uftReqDataArray.startDate : '',
                'endDate': this.uftReqDataArray.endDate != null ? this.uftReqDataArray.endDate : '',
                'status': this.uftReqDataArray.companyStatus,
                'coFlag': this.uftReqDataArray.coFlag,
                'isDashboard': this.uftReqDataArray.isDashboard,
                "businessTypeCd": 'Q',
                "paramApplication": "HMS",
                "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
              }
              if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
                this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                  if (value) {
                    this.exportFile(URL, requestParam8);
                  }
                });
              } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
                this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                  if (value) {
                    this.exportFile(URL, requestParam8);
                  }
                });
              } else {
                this.exportFile(URL, requestParam8);
              }
            }
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 3: //Provider Without EFT
        if (this.dataTableService.totalRecords != undefined) {
          if (this.selectedBusinessTypeCd == 'Q') {
            this.reportPopUpTitle = this.translate.instant('uft.dashboard.financeReports.providerReportWithoutEftForQuikcard');
            var URL = UftApi.providerExcelReportWithoutEftQuikCard;
            var reqParamPlanQ = {
              "businessTypeCd": this.selectedBusinessTypeCd,
              "paramApplication": "HMS",
              "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
            }
            if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, reqParamPlanQ);
                }
              });
            } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, reqParamPlanQ);
                }
              });
            } else {
              this.exportFile(URL, reqParamPlanQ);
            }
          } else if (this.selectedBusinessTypeCd == 'S') {
            var URL = UftApi.providerExcelReportWithoutEftAlberta
            var reqParamPlanA = {
              "paramApplication": "HMS",
              "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
            }
            if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, reqParamPlanA);
                }
              });
            } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
              this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
                if (value) {
                  this.exportFile(URL, reqParamPlanA);
                }
              });
            } else {
              this.exportFile(URL, reqParamPlanA);
            }
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 51: //Summary of Provider Debits  
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.getProviderDebitReportExcel;
          var reqParamPlan51 = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "dentProvlicenseNum": "",
            "businessTypeCd": this.selectedBusinessTypeCd,
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            /*
            Summary of Provider Debits
            GridFilterp51PaymentDate
            GridFilterp51dentProvlicenseNum
            GridFilterp51ProviderName
            GridFilterp51Amount 
            */
            reqParamPlan51 = this.pushToArray(reqParamPlan51, { 'key': 'paymentDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp51PaymentDate) });
            reqParamPlan51 = this.pushToArray(reqParamPlan51, { 'key': 'dentProvlicenseNum', 'value': this.GridFilterp51dentProvlicenseNum });
            reqParamPlan51 = this.pushToArray(reqParamPlan51, { 'key': 'providerName', 'value': this.GridFilterp51ProviderName });
            reqParamPlan51 = this.pushToArray(reqParamPlan51, { 'key': 'amount', 'value': this.GridFilterp51Amount });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan51);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan51);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan51);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 28: //Broker Commission Summary       
        break;
      case 59: //Unpaid Claims report 
        if (this.dataTableService.totalRecords != undefined) {
          let claimStatusArray = []
          if (this.selectedClaimStatusType.length > 0) {
            this.selectedClaimStatusType.forEach(element => {
              claimStatusArray.push(element.itemName);
            });
          }
          var URL = UftApi.getUnpaidClaimsReportExcel;
          var reqParamPlan59 = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "claimStatusList": claimStatusArray,
            'compNameAndNo': this.selectedCompanyName,
            "claimStatus": "",
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
            "status": this.filterReport.value.companyStatus
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'coId', 'value': this.GridFilter59_CompanyNum });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'coName', 'value': this.GridFilter59_CompanyName });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'status', 'value': this.GridFilter59_CompanyStatus });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'cardNumber', 'value': this.GridFilter59_CardNumber });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'patientName', 'value': this.GridFilter59_PatientName });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'referenceNumber', 'value': this.GridFilter59_RefNumber });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'confirmId', 'value': this.GridFilter59_ClaimSubmission });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'totalCostAmount', 'value': this.GridFilter59_TotalCostAmount });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'adjudDate', 'value': this.GridFilter59_AdjudDate });
            reqParamPlan59 = this.pushToArray(reqParamPlan59, { 'key': 'payee', 'value': this.GridFilter59_Payee });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan59);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan59);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan59);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case -59: //Unpaid Claims report for company Balane tab
        if (this.dataTableService.totalRecords != undefined) {
          let claimStatusArray = []
          if (this.selectedClaimStatusType.length > 0) {
            this.selectedClaimStatusType.forEach(element => {
              claimStatusArray.push(element.itemName);
            });
          }
          var URL = UftApi.getUnpaidClaimsReportExcel;
          var reqParamPlan59 = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "claimStatusList": claimStatusArray,
            'compNameAndNo': this.selectedCompanyName,
            "claimStatus": "",
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
            "status": this.filterReport.value.companyStatus
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan59);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan59);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan59);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 30: //Broker Company Summary Report  
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.getExcelBrokerCompanySummaryReport;
          var reqParamPlan30 = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "brokerId": this.selectedBrokerId != undefined ? this.selectedBrokerId : '',
            'compNameAndNo': this.selectedCompanyName,
            "claimStatus": "",
            "businessTypeCd": "Q",
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'compNameAndNo', 'value': this.GridFilter30_CompanyName });
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'brokerId', 'value': this.GridFilter30_BrokerNumber });
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'brokerName', 'value': this.GridFilter30_BrokerName });
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'brokerPhone', 'value': this.GridFilter30_BrokerPrimaryContact });
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'brokerContactPhoneNum', 'value': this.GridFilter30_BrokerTelephone });
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'CompanyEffectiveOn', 'value': this.GridFilterp30_CompanyEffectiveDate });
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'commisionRate', 'value': this.GridFilter30_CompanyBrokerRate });
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'balance', 'value': this.GridFilter30_CompanyBalance });
            reqParamPlan30 = this.pushToArray(reqParamPlan30, { 'key': 'coStandardPapAmt', 'value': this.GridFilter30_CompanyPAPAmount });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan30);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan30);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan30);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 44: //Unit Financial Transactions Summary Report
        if (this.dataTableService.totalRecords != undefined) {
          if (this.selectedTransactionType.length > 0) {
            this.selectedTransactionType.forEach(element => {
              transCodeArray.push(parseInt(element.itemName));
            });
          }
          var URL = UftApi.getExcelUFTReportUrl;
          var reqParamUFTSR = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            "transCodeList": transCodeArray,
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamUFTSR);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamUFTSR);
              }
            });
          } else {
            this.exportFile(URL, reqParamUFTSR);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 56: //UFT Report List Excel
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.getUftReportListExcelUrl;
          var reqParamUFTSR1 = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            "businessTypeCd": 'S',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'coName', 'value': this.GridFilter56_CompanyName });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'coId', 'value': this.GridFilter56_CompanyNum });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'coTerminatedOn', 'value': this.GridFilter56_CompanyTermDate });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'coAdminFeeRate', 'value': this.GridFilter56_CompanyAdminFeeRate });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'coCardCount', 'value': this.GridFilter56_CardholderCount });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'otherBroker1', 'value': this.GridFilter56_OtherBroker1 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'otherBroker2', 'value': this.GridFilter56_OtherBroker2 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'otherBroker3', 'value': this.GridFilter56_OtherBroker3 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'otherBroker4', 'value': this.GridFilter56_OtherBroker4 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode10', 'value': this.GridFilter56_UftCode10 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode20', 'value': this.GridFilter56_UftCode20 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode21', 'value': this.GridFilter56_UftCode21 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode25', 'value': this.GridFilter56_UftCode25 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode30', 'value': this.GridFilter56_UftCode30 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode31', 'value': this.GridFilter56_UftCode31 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode35', 'value': this.GridFilter56_UftCode35 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode39', 'value': this.GridFilter56_UftCode39 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode40', 'value': this.GridFilter56_UftCode40 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode41', 'value': this.GridFilter56_UftCode41 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode42', 'value': this.GridFilter56_UftCode42 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode43', 'value': this.GridFilter56_UftCode43 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode44', 'value': this.GridFilter56_UftCode44 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode45', 'value': this.GridFilter56_UftCode45 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode46', 'value': this.GridFilter56_UftCode46 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode47', 'value': this.GridFilter56_UftCode47 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode50', 'value': this.GridFilter56_UftCode50 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode70', 'value': this.GridFilter56_UftCode70 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode80', 'value': this.GridFilter56_UftCode80 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode82', 'value': this.GridFilter56_UftCode82 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode90', 'value': this.GridFilter56_UftCode90 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode91', 'value': this.GridFilter56_UftCode91 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode92', 'value': this.GridFilter56_UftCode92 });
            reqParamUFTSR1 = this.pushToArray(reqParamUFTSR1, { 'key': 'uftCode99', 'value': this.GridFilter56_UftCode99 });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamUFTSR1);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamUFTSR1);
              }
            });
          } else {
            this.exportFile(URL, reqParamUFTSR1);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 71: //Utilization Statistics By Program
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.getUtilizationStatisticsUrl;
          var reqParamStat = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            /*
            GridFilterpPaymentDate
            GridFilterpProgramType
            GridFilterpPaidAmount
            GridFilterpClaimedAmount
            GridFilterpEligibleClientCount
            */
            reqParamStat = this.pushToArray(reqParamStat, { 'key': 'paymentDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterpPaymentDate) });
            reqParamStat = this.pushToArray(reqParamStat, { 'key': 'programType', 'value': this.GridFilterpProgramType });
            reqParamStat = this.pushToArray(reqParamStat, { 'key': 'paidAmount', 'value': this.GridFilterpPaidAmount });
            reqParamStat = this.pushToArray(reqParamStat, { 'key': 'claimedAmount', 'value': this.GridFilterpClaimedAmount });
            reqParamStat = this.pushToArray(reqParamStat, { 'key': 'eligibleClientCount', 'value': this.GridFilterpEligibleClientCount });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamStat);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamPlan51);
              }
            });
          } else {
            this.exportFile(URL, reqParamPlan51);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case -104: //Claims Payment Run Summary  
        var URL = UftApi.paymentRunExcelUrl;
        var reqParamDPR = {
          "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          "paramApplication": "HMS",
          "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          reqParamDPR[2].value = this.GridFilter107_CompanyName;
          reqParamDPR[3].value = this.GridFilter107_CompanyNum;
          reqParamDPR = this.pushToArray(reqParamDPR, { 'key': 'date', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter107_Date) });
          reqParamDPR = this.pushToArray(reqParamDPR, { 'key': 'ChequeRefNo', 'value': this.GridFilter107_ChequeNum });
          reqParamDPR = this.pushToArray(reqParamDPR, { 'key': 'balance', 'value': this.GridFilter107_Amount });
        }
        /** End Narrow Search */
        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParamDPR);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParamDPR);
            }
          });
        } else {
          this.exportFile(URL, reqParamDPR);
        }
        break;
      case -107: //Refund Payment Summary Report
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.refundPaymentSummaryReportExcelUrl;
          var reqParamRPS = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            'coName': this.selectedCompanyName,
            "coId": this.selecteCoID != undefined ? this.selecteCoID : '',
            "transTypeParam": this.selectedTransactionIsElectronicCheque != undefined ? this.selectedTransactionIsElectronicCheque : '',
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamRPS[2].value = this.GridFilter107_CompanyName;
            reqParamRPS[3].value = this.GridFilter107_CompanyNum;
            reqParamRPS = this.pushToArray(reqParamRPS, { 'key': 'date', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter107_Date) });
            reqParamRPS = this.pushToArray(reqParamRPS, { 'key': 'ChequeRefNo', 'value': this.GridFilter107_ChequeNum });
            reqParamRPS = this.pushToArray(reqParamRPS, { 'key': 'balance', 'value': this.GridFilter107_Amount });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamRPS);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamRPS);
              }
            });
          } else {
            this.exportFile(URL, reqParamRPS);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 73: //Card Holder Utilization Report
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.paymentRunExcelUrl;
          var reqParamCHUR = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamCHUR);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamCHUR);
              }
            });
          } else {
            this.exportFile(URL, reqParamCHUR);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case -23: //Override Report
        if (this.dataTableService.totalRecords != undefined) {
          let overrideReasonArray = []
          if (this.selectedOverrideReason.length > 0) {
            this.selectedOverrideReason.forEach(element => {
              overrideReasonArray.push(element.itemName);
            });
          }
          var URL = UftApi.getOverrideReportExcel;
          var reqParamOR = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "compNameAndNo": this.selectedCompanyName,
            "overrideReasonList": overrideReasonArray,
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
            "paramApplication": "HMS",
            "businessTypeCd": this.selectedBusinessTypeCd
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamOR = this.pushToArray(reqParamOR, { 'key': 'overrideAmount', 'value': this.filterOverrideAmount });
            reqParamOR = this.pushToArray(reqParamOR, { 'key': 'verificationNumber', 'value': this.filterVerificationNumber });
            reqParamOR = this.pushToArray(reqParamOR, { 'key': 'procedureCode', 'value': this.filterProcedureCode });
            reqParamOR = this.pushToArray(reqParamOR, { 'key': 'serviceProvider', 'value': this.serviceProvider });
            reqParamOR = this.pushToArray(reqParamOR, { 'key': 'serviceDate', 'value': this.serviceDate });
            reqParamOR = this.pushToArray(reqParamOR, { 'key': 'patientName', 'value': this.filterPatientName });
            reqParamOR = this.pushToArray(reqParamOR, { 'key': 'cardHolderName', 'value': this.filterClientName });
            reqParamOR = this.pushToArray(reqParamOR, { 'key': 'cardNumber', 'value': this.filterCardNumber });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamOR);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamOR);
              }
            });
          } else {
            this.exportFile(URL, reqParamOR);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 75: //Cardholder Listing Report
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.getExcelCardholderListReport;
          var reqParamCHLR = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "compNameAndNo": this.selectedCompanyName,
            'displayAddress': this.selectedCardholderAddress != undefined ? this.selectedCardholderAddress : 'F',
            'displayDependent': this.selectedDependant != undefined ? this.selectedDependant : 'F',
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'cardNum', 'value': this.GridFilter75_CardNumber });
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'cardHolderName', 'value': this.GridFilter75_CardHolderName });
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'gender', 'value': this.GridFilter75_Gender });
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'dob', 'value': this.GridFilter75_CardHolderDOB });
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'cardType', 'value': this.GridFilter75_CardType });
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'cardEffectiveDate', 'value': this.GridFilter75_CardEffectiveDate });
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'cardTerminationDate', 'value': this.GridFilter75_CardTerminationDate });
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'address', 'value': this.GridFilter75_Address });
            reqParamCHLR = this.pushToArray(reqParamCHLR, { 'key': 'status', 'value': this.GridFilter75_Status });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamCHLR);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamCHLR);
              }
            });
          } else {
            this.exportFile(URL, reqParamCHLR);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 74: //Broker Commission Summary
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.brokerCommissionSummaryReport;
          var reqParamBCS = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "companyNameAndNo": this.selectedCompanyName,
            'brokerId': this.selectedBrokerId != undefined ? this.selectedBrokerId : '',
            "getParamApplication": "",
            "start": "",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamBCS)
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamBCS)
              }
            });
          } else {
            this.exportFile(URL, reqParamBCS);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 76: //Division Utilization Report
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.divisionUtilizationReportExcelUrl;
          var reqParamDur = {
            "startDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "endDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            'compNameAndNo': this.selectedCompanyName,
            "businessTypeCd": 'Q',
            "paramApplication": "HMS",
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamDur = this.pushToArray(reqParamDur, { 'key': 'divName', 'value': this.GridFilter76_DivName });
            reqParamDur = this.pushToArray(reqParamDur, { 'key': 'totalClaims', 'value': this.GridFilter76_TotalClaims });
            reqParamDur = this.pushToArray(reqParamDur, { 'key': 'totalEmployee', 'value': this.GridFilter76_TotalEmployee });
            reqParamDur = this.pushToArray(reqParamDur, { 'key': 'average', 'value': this.GridFilter76_average });
            reqParamDur = this.pushToArray(reqParamDur, { 'key': 'averageSingle', 'value': this.GridFilter76_AverageSingle });
            reqParamDur = this.pushToArray(reqParamDur, { 'key': 'averageFamily', 'value': this.GridFilter76_AverageFamily });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamDur)
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamDur)
              }
            });
          } else {
            this.exportFile(URL, reqParamDur);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 77: //Broker0371 Commission        
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.getBrokerCommissionReportExcel;
          var reqParamBC = {
            "fromDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "toDate": this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
            "start": '0',
            "brokerId": this.selectedBrokerId != undefined ? this.selectedBrokerId : '',
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'brokerId', 'value': this.filterOverrideAmount });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'coId', 'value': this.GridFilter77_CompanyNumber });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'coName', 'value': this.GridFilter77_CompanyName });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'coEffectiveOn', 'value': this.GridFilter77_CompanyEffectiveDate });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'brokerEffectiveOn', 'value': this.GridFilter77_BrokerEffectiveDate });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'brokerCompanyEffectiveOn', 'value': this.GridFilter77_BrokerCompanyEffectiveDate });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'brokerCompanyExpireOn', 'value': this.GridFilter77_BrokerCompanyExiryDate });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'brokerCompanyTermDate', 'value': this.GridFilter77_BrokerCompanyTerminationDate });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'qbciCommisionRate', 'value': this.GridFilter77_QBCICommisionRate });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'wbciCommisionRate', 'value': this.GridFilter77_WbciCommisionRate });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'clientUtilization', 'value': this.GridFilter77_CommisionPayable });
            reqParamBC = this.pushToArray(reqParamBC, { 'key': 'isPaid', 'value': this.GridFilter77_IsPaid });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamBC)
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamBC)
              }
            });
          } else {
            this.exportFile(URL, reqParamBC);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 79: //QBCI Eligibility Age65     
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.qbciEligibilityAge65Report;
          var reqParamQBCI65 = {
            'eligibleDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
            "start": 0,
            "length": this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel ? this.currentUserService.maxLengthForExcel : this.dataTableService.totalRecords,
            "excel": "T"
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            /* 
            QBCI Eligibility RBC           
            GridFilterp79_carrier
            GridFilterp79_employerName
            GridFilterp79_cardId
            GridFilterp79_effectiveDate
            GridFilterp79_clientType
            GridFilterp79_firstName
            GridFilterp79_lastName
            GridFilterp79_dob
            GridFilterp79_age
            GridFilterp79_relationship
            GridFilterp79_address1
            GridFilterp79_city
            GridFilterp79_province
            GridFilterp79_postalCode
            GridFilterp79_isBankAccountActive
            */
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'carrier', 'value': this.GridFilterp79_carrier });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'employerName', 'value': this.GridFilterp79_employerName });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'cardId', 'value': this.GridFilterp79_cardId });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'effectiveDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp79_effectiveDate) });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'clientType', 'value': this.GridFilterp79_clientType });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'firstName', 'value': this.GridFilterp79_firstName });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'lastName', 'value': this.GridFilterp79_lastName });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'dob', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp79_dob) });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'age', 'value': this.GridFilterp79_age });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'relationship', 'value': this.GridFilterp79_relationship });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'address1', 'value': this.GridFilterp79_address1 });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'city', 'value': this.GridFilterp79_city });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'province', 'value': this.GridFilterp79_province });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'postalCode', 'value': this.GridFilterp79_postalCode });
            reqParamQBCI65 = this.pushToArray(reqParamQBCI65, { 'key': 'isBankAccountActive', 'value': this.GridFilterp79_isBankAccountActive });
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamQBCI65)
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParamQBCI65)
              }
            });
          } else {
            this.exportFile(URL, reqParamQBCI65);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;
      case 80: //QBCI Eligibility RBC
        var reqParamQBCIRBC = {
          "eligibleDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : ''
        }
        var URL = UftApi.qbciTravelEligibilityReportExcel
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          /* 
          QBCI Eligibility RBC         
          GridFilterp80_carrier
          GridFilterp80_employerName
          GridFilterp80_cardId
          GridFilterp80_effectiveDate
          GridFilterp80_clientType
          GridFilterp80_firstName
          GridFilterp80_lastName
          GridFilterp80_dob
          GridFilterp80_age
          GridFilterp80_relationship
          GridFilterp80_address1
          GridFilterp80_city
          GridFilterp80_province
          GridFilterp80_postalCode
          GridFilterp80_isBankAccountActive
          */
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'carrier', 'value': this.GridFilterp80_carrier });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'employerName', 'value': this.GridFilterp80_employerName });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'cardId', 'value': this.GridFilterp80_cardId });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'effectiveDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp80_effectiveDate) });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'clientType', 'value': this.GridFilterp80_clientType });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'firstName', 'value': this.GridFilterp80_firstName });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'lastName', 'value': this.GridFilterp80_lastName });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'dob', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilterp80_dob) });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'age', 'value': this.GridFilterp80_age });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'relationship', 'value': this.GridFilterp80_relationship });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'address1', 'value': this.GridFilterp80_address1 });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'city', 'value': this.GridFilterp80_city });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'province', 'value': this.GridFilterp80_province });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'postalCode', 'value': this.GridFilterp80_postalCode });
          reqParamQBCIRBC = this.pushToArray(reqParamQBCIRBC, { 'key': 'isBankAccountActive', 'value': this.GridFilterp80_isBankAccountActive });
        }
        /** End Narrow Search */
        if (this.dataTableService.totalRecords > 500) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParamQBCIRBC)
            }
          });
        } else {
          this.exportFile(URL, reqParamQBCIRBC)
        }
        break;
      case 82: //QBCI Eligibility Travel Insurance
      case 81: //QBCI Travel Eligibility Reconciliation
        var reqParamQBCI_RC = {
          "eligibleDate": this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : ''
        }
        var URL = UftApi.qbciTravelEligibilityReconciliationReportExcel
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          /* 
          QBCI Travel Eligibility Reconciliation            
          GridFilterp81_companyId
          GridFilterp81_companyName
          GridFilterp81_totalFamilyCount
          GridFilterp81_familyAlberta
          GridFilterp81_familyBritishColumbia
          GridFilterp81_familyManitoba
          GridFilterp81_familyNovascotia
          GridFilterp81_familyOntario
          GridFilterp81_familyQuebec
          GridFilterp81_familySaskatchewan
          GridFilterp81_familyNewbrunswick
          GridFilterp81_familyPrinceEdwardIsland
          GridFilterp81_familyYukonTerritory
          GridFilterp81_familyNorthWestTerritories
          GridFilterp81_familyNewFoundLand
          GridFilterp81_familyNunavut
          GridFilterp81_totalSingleCount
          GridFilterp81_singleAlberta
          GridFilterp81_singleBritishColumbia
          GridFilterp81_singleManitoba
          GridFilterp81_singleNovascotia
          GridFilterp81_singleOntario
          GridFilterp81_singleQuebec
          GridFilterp81_singleSaskatchewan
          GridFilterp81_singleNewbrunswick
          GridFilterp81_singlePrinceEdwardIsland
          GridFilterp81_singleYukonTerritory
          GridFilterp81_singleNorthWestTerritories
          GridFilterp81_singleNewFoundLand
          GridFilterp81_singleNunavut
          GridFilterp81_broker1
          GridFilterp81_broker2
          GridFilterp81_broker3
          GridFilterp81_broker4
          */
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'companyId', 'value': this.GridFilterp81_companyId });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'companyName', 'value': this.GridFilterp81_companyName });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'totalFamilyCount', 'value': this.GridFilterp81_totalFamilyCount });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyAlberta', 'value': this.GridFilterp81_familyAlberta });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyBritishColumbia', 'value': this.GridFilterp81_familyBritishColumbia });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyManitoba', 'value': this.GridFilterp81_familyManitoba });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyNovascotia', 'value': this.GridFilterp81_familyNovascotia });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyOntario', 'value': this.GridFilterp81_familyOntario });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyQuebec', 'value': this.GridFilterp81_familyQuebec });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familySaskatchewan', 'value': this.GridFilterp81_familySaskatchewan });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyNewbrunswick', 'value': this.GridFilterp81_familyNewbrunswick });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyPrinceEdwardIsland', 'value': this.GridFilterp81_familyPrinceEdwardIsland });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyYukonTerritory', 'value': this.GridFilterp81_familyYukonTerritory });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyNorthWestTerritories', 'value': this.GridFilterp81_familyNorthWestTerritories });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyNewFoundLand', 'value': this.GridFilterp81_familyNewFoundLand });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'familyNunavut', 'value': this.GridFilterp81_familyNunavut });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'totalSingleCount', 'value': this.GridFilterp81_totalSingleCount });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleAlberta', 'value': this.GridFilterp81_singleAlberta });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleBritishColumbia', 'value': this.GridFilterp81_singleBritishColumbia });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleManitoba', 'value': this.GridFilterp81_singleManitoba });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleNovascotia', 'value': this.GridFilterp81_singleNovascotia });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleOntario', 'value': this.GridFilterp81_singleOntario });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleQuebec', 'value': this.GridFilterp81_singleQuebec });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleSaskatchewan', 'value': this.GridFilterp81_singleSaskatchewan });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleNewbrunswick', 'value': this.GridFilterp81_singleNewbrunswick });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singlePrinceEdwardIsland', 'value': this.GridFilterp81_singlePrinceEdwardIsland });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleYukonTerritory', 'value': this.GridFilterp81_singleYukonTerritory });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleNorthWestTerritories', 'value': this.GridFilterp81_singleNorthWestTerritories });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleNewFoundLand', 'value': this.GridFilterp81_singleNewFoundLand });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'singleNunavut', 'value': this.GridFilterp81_singleNunavut });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'broker1', 'value': this.GridFilterp81_broker1 });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'broker2', 'value': this.GridFilterp81_broker2 });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'broker3', 'value': this.GridFilterp81_broker3 });
          reqParamQBCI_RC = this.pushToArray(reqParamQBCI_RC, { 'key': 'broker4', 'value': this.GridFilterp81_broker4 });
        }
        /** End Narrow Search */
        if (this.dataTableService.totalRecords > 500) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParamQBCI_RC)
            }
          });
        } else {
          this.exportFile(URL, reqParamQBCI_RC)
        }
        break;
      case 83: //Amount Paid report
        let claimStatusList = []
        if (this.selectedClaimStatusType.length > 0) {
          this.selectedClaimStatusType.forEach(element => {
            claimStatusList.push(element.itemNameCd);
          });
        } else {
          this.claimStatusArray.forEach(element => {
            claimStatusList.push(element.itemNameCd);
          });
        }
        var reqParamAmountPaid = {
          'startDate': this.filterReport.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) : '',
          'endDate': this.filterReport.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) : '',
          'coId': this.selecteCoID != undefined ? this.selecteCoID : '',
          'divisionKey': this.filterReport.value.divisionKey != undefined ? this.filterReport.value.divisionKey : '',
          'processorId': this.filterReport.value.processorId != undefined ? this.filterReport.value.processorId : '',
          'cardNumber': this.filterReport.value.cardHolderNameOrNumber != undefined ? this.filterReport.value.cardHolderNameOrNumber : '',
          'claimType': this.filterReport.value.claimType != undefined ? this.filterReport.value.claimType : '',
          'claimStatusList': claimStatusList,
          'discipline': this.filterReport.value.discipline != undefined ? this.filterReport.value.discipline : '',
          'excel': 'T',
          'start': 0,
          'length': this.dataTableService.totalRecords
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'cardNumber', 'value': this.filterCardNumber });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'procedureCode', 'value': this.filterProcedureCode });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'cobAmount', 'value': this.filterCobAmount });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'paidAmount', 'value': this.filterPaidAmount });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'coveredAmount', 'value': this.filterCoveredAmount });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'eligibleAmount', 'value': this.filterEligibleAmount });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'claimedAmount', 'value': this.filterClaimedAmount });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'serviceProvider', 'value': this.filterServiceProvider });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'patientName', 'value': this.filterPatientName });
          reqParamAmountPaid = this.pushToArray(reqParamAmountPaid, { 'key': 'cardHolderName', 'value': this.filterCardHolderName });
        }
        /** End Narrow Search */
        var URL = UftApi.amountPaidReportUrl;
        if (this.dataTableService.totalRecords > 500) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParamAmountPaid)
            }
          });
        } else {
          this.exportFile(URL, reqParamAmountPaid)
        }
        break;
    }
  }

  /**
   * Export CSV/TEXT for reports
   * @param URL 
   * @param reqParamPlan 
   */
  exportFileCSVTEXT(URL, reqParamPlan) {
    this.showPageLoader = true
    this.loaderPlaceHolder = this.translate.instant('uft.dashboard.financeReports.loadingFile')
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showPageLoader = false;
        this.loaderPlaceHolder = ""
        if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.loaderPlaceHolder = ""
          var docType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          let imagePath = data.result
          var blob = this.hmsDataService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          if (this.reportID == 78) {
            a.download = this.reportPopUpTitle.replace(/\s+/g, '_') + '.txt';
          } else {
            a.download = this.reportPopUpTitle.replace(/\s+/g, '_');
          }
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    })
  }

  /**
   * Export excel for reports
   * @param URL 
   * @param reqParamPlan 
   */
  exportFile(URL, reqParamPlan) {
    this.showPageLoader = false
    this.loaderPlaceHolder = this.translate.instant('uft.dashboard.financeReports.loadingFile')
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loaderPlaceHolder = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loaderPlaceHolder = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          a.download = this.reportPopUpTitle.replace(/\s+/g, '_');
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
        this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
      }
    })
  }

  /**
   * Get Province List
   */
  getProvinceList() {
    var URL = UftApi.getPredectiveProvinceCode;
    this.hmsDataService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        this.provinceList = data.result;
        this.provinceData = this.completerService.local(
          this.provinceList,
          "provinceName",
          "provinceName"
        );
      }
    })
  }

  /**
   * Call On select the Province
   * @param selected 
   */
  onProvinceSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedProvinceKey = selected.originalObject.provinceKey;
    }
    else {
      this.selectedProvinceKey = '';
    }
  }

  /* Get List of BusinessType */
  getBusinessType() {
    var URL = UftApi.getBusinessTypeListUrl;
    this.hmsDataService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        this.businessTypeList = data.result;
        this.businessTypeList.forEach(element => {
          if (element.businessTypeCd == 'Q') {
            this.filterReport.patchValue({ 'businessType': element.businessTypeDesc });
            this.selectedBusinessTypeCd = element.businessTypeCd;
          }
        });
        this.businessTypeData = this.completerService.local(
          this.businessTypeList,
          "businessTypeDesc",
          "businessTypeDesc"
        );
      }
    });
  }

  onBusinessTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedBusinessTypeCd = selected.originalObject.businessTypeCd;
      if (selected.originalObject.businessTypeCd == 'I') {
        this.toastrService.error(this.translate.instant('uft.toaster.noDataFound'));
      }
    } else {
      this.selectedBusinessTypeCd = '';
      this.patchBusinessType(this.filterReport.value.businessType)
    }
  }

  onBlurBusinessType(filterReport) {
    if (filterReport.value.businessType == '') {
      this.selectedBusinessTypeCd = '';
    }
  }

  patchBusinessType(businessType) {
    if (businessType == 'Quikcard') {
      this.selectedBusinessTypeCd = 'Q';
    } else if (businessType == 'AB Gov.') {
      this.selectedBusinessTypeCd = 'S';
    } else {
      this.selectedBusinessTypeCd = ''
    }
  }

  /**
   * Call On Select the Company Status from dropdown
   * @param selected 
   */
  onCompanyStatusSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedCompanyStatus = selected.originalObject.companyStatusKey;
    }
    else {
      this.selectedCompanyStatus = '';
    }
  }

  /**
   * Call On Select the UFT from dropdown
   * @param selected 
   */
  onUftSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedUFT = selected.originalObject.uftKey;
    }
    else {
      this.selectedUFT = '';
    }
  }

  /**
   * Call On Select the TransactionIsElectronicCheque from dropdown
   * @param selected 
   */
  onTransactionIsElectronicChequeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedTransactionIsElectronicCheque = selected.originalObject.transactionIsElectronicChequeKey;
    }
    else {
      this.selectedTransactionIsElectronicCheque = '';
    }
  }

  /**
   * Call On Select Cardholder Address From DropDown
   * @param selected 
   */
  onCardholderAddressSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedCardholderAddress = selected.originalObject.cardholderAddressKey;
    }
    else {
      this.selectedCardholderAddress = '';
    }
  }

  /**
   * Call on select the Dependant from dropdown
   *  @param selected
   */
  onDependantSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedDependant = selected.originalObject.dependantKey;
    }
    else {
      this.selectedDependant = '';
    }
  }

  /**
   * Call on select the Discipline from dropdown
   *  @param selected
   */
  onDisciplineSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedDiscipline = selected.originalObject.disciplineName;
    }
    else {
      this.selectedDiscipline = '';
    }
  }

  /**
   * Call on select the Claim Type from dropdown
   *  @param selected
   */
  onClaimTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedClaimType = selected.originalObject.claimTypeDesc;
    }
    else {
      this.selectedClaimType = '';
    }
  }

  /**
   * Call on select the Procedure from dropdown
   *  @param selected
   */
  onSelectedProcId(selected: CompleterItem) {
    if (selected) {
      this.selectedProcId = (selected.originalObject.dentalProcedureId).toString();
    } else {
      this.selectedProcId = '';
    }
  }

  /**
   * Call On Select the TransactionIsPositiveNegative from dropdown
   * @param selected 
   */
  onTransactionIsPositiveNegativeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedTransactionIsPositiveNegative = selected.originalObject.transactionIsPositiveNegativeKey;
    }
    else {
      this.selectedTransactionIsPositiveNegative = '';
    }
  }

  openModalProviderWithoutEFTCreateLetter(selectedRowData) {
  }

  resetCreateLetterForm() {
  }

  /**
   * PDF Header for quikcard reports
   * @param doc 
   * @param headerobject 
   */
  pdfHeader(doc, headerobject) {
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEQ4M0Q4NjE1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEQ4M0Q4NjA1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTU1MzkwMUYzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTU1MzkwMjAzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4x0Cf0AAAW60lEQVR42uxdCXhUVbKu21u6O52d7AmLhIR9FRSVRRjcFUERFxQHR0UddVzQ5xNFcRtcRsdRUcYRxhnBBR3EHRVQQEBE9ggJECAh+96d3tLd91XVud3pTtJJd0h83/P1+b7zJbl9l3NP/eevv6pOgyTLMkRapHmbxvvLnn6jIrPRzU1Sfq5XN8NKtR2OS26VCiBNA1Iu/hyEPQfPycNT+mBPwm5QLmnG7sTuwd4TK5buWYZ9GfblRw8ebQuISOuZWad2sVsH4z0aWKt2evZJrtIayVNaJ8kb7XgGdoMbIB3B0Q/7GATLaPw5EoGS64epnmgEwjOxG7G/6gOx12WEyBCp2G/CPhW76f+BTb0rlH66sKPt0Iai27BbsDdhNyu/W5TfG5Reh72Wjqnx/CiQXC68XRP2RknGE2WokDxwROWGMvxZjo85iT/xM+QUuR9eN0oL0mS8djyCZCj+re2BdzyCDJHTFUCMxf4e9n6RtR9yIwBZFZDUE0BwyZdiL0IDl6hAKkFjn8DfixFxdQ6Qm6sREASOIskNBdgLESwIGpUV5IFoqck6kM7DaybgPRK7aYzVCIjkcAFBF+xQaCbSur8Ri5SjkU+gsfei28jHn/kIkoJGkBvKFGDsUbnggORCgMgZTpCnInvMQsqYKgna72rLR0AMCRcQ92J/IWK3X72VIXsUIEC2otj7ES21oxY8JUcRHDsQHDtUzXBMcuegL7sa3dH1aqE7wm1rEBAzwhWV50Zs87/S0pEl0pENJjnF340mkA6M8Wi/HufRftMA+u0HVK7D36uan9yubn6hEjyz0KXcjawxOoxn7AqIjEJgCALNXuyDukemeYAeKZF+piAs0rrccPYOIQA+xZ8fou7Y+q3aCZ+rnFKx5L4R3cmDWhHSdtZmI0O8Hw4gMrAfxB5zKiDw2OziJUxGkHRalE8u8FiaWMOrDBh+q6SIhU8tobQV3cbyGpBXrVc7LR+pHYYTkvs+PUgPqIPbjkTvaATE3nAAMQX7t13GgtUGKqMeYqdNgviLz4fokcNAFRPNx62790Hdx59Dw5cbQHZ7QKWPAohkTk+pofGLEASv14DntdUaBwFjsA3kl/HY1HZOL8Weh4CwhAOI27C/Fn5WRga3uQlizhkHGY8ugOgxI/lww9cbwJ5/CHR9siHh8ouFY1z/PRQ/+Dg4i08ieIwRUHQPYxxFxnhqv+R66xWtDfZJrseQmxe14uGt2M/yz1SGAojXFFCEBwZ0B73mzoaspxeCKkoPruoaOHbbfWj8TewmZJcLEmddBn2XvQSSWg32w0fhyOx50FxWBVKULmLRbmoGkD63gHzH6xrbsU/UjmsQJP9QtaTIKXV9qz8gQlF1w8POxpgtkHLzHOj9wpMMBtnphGN3LIDGb74HdWwsqONiQZOYAHVryF18w9foc06D7OcXi2RthCG6raG7uAgd8ZYFLuO0G92GVQ6QZ8uiTgJKsNBaqHbYosNKRqExiRniLpwCmU8u9B2ueusdaFi3EdTxcX7n4smSCgHRIk9iz52I105lfRFp3ddcGBjYQV47z6WfcY1b/4kV5HuVjwrCBURf7GkhewqHE3RZ6dD7ucXsBngwNTVQ+cYKUBvbJtMkjQYcRSfwQo/vWNJ1V6IyUkVYopsbzrAe2eEdBMX4cbLmVQTIZ3i4OFxADAw5eUW6oLkZMh+5H7TpLRiqXb0WnMdLONRsAwiVCtnAyiGotxlHjwBtRipqDHfEit3ccEYNOgxN57gM0cjP/4V/V3i6AIgQw0srxE6dCAkzL23BCArHuo8+CyoSZUIRMYlfDkITFwf6AacxuCKt+xsyQ94wj/q2aZ6o/VRQ07aNTjpsoe2a8cjMAKn3zA84bN2zD2wHDqKwjAp6ndoUja4jcFi6tDT0Ip6I9XqgKbX8OXc0G166QtK5pFZbLjpiCPosLyQ82G0QM2k8mMadHnC8ccNmkaGUgmQh0ejqhPi2D46O5CJ62HXE6JGbc2QN9JdVITNEL+xZoaUdZEi65orAY6gBzOs3gaQNvqeDWECb3KvdaCXSerQdRZbAEECGcEQlsUN8p2BAQRjVJxtiJp4dcNx5ohjsBUfQXeg6TGBpM9sGMR5nRD/0cNsV7ANNJ4AIIdR0QPTYkaCODayfNO3aC+4GM6hM0cHTFho1GAb0b0tpdfUcgbTrNvzdT8DnUvCklveacO7X2s3hZ7LbDd5SLYfVHbhCkWeR2l0EwSdE6vq54bX8rgBiaKjuwnTG6W2OW3/aDR1u8cdJI62g69enlRtxg7Ok1JfHoGiDXIskqTBa0YqJUO5Lx4mhJK1auCaPLAxHOxf5GkmEu5ICLv/PEHDiM+V+dC+XCH/9Q2RyfR6bjceqTU4CyRAFniY7uGrrQLY7hN5pDww0/iDCWHbjGFziM4lyLsoYKKMr6Q3KuyvjpffHn7xAqEstIT4VBNVGg3gWgRXvIxO7Kn93UAI41BVAjAhFsqpw8qIwTGyNbNvBAk48Bb0UB6xNTQZdVkZgVq2qGt3NSbyFB9LunQ+msWOEwfAlncXFULLwGfAg8+j6ZkHWUw+jQUzIUnaoeHkZitgtkLn4QVFIo8hHq4Hm6mooXvA4slUD11X0xEj0mYbqJ0eg5JElIKPwVfdKgH5v/IWBZd6yDcqfe40nXZOUACm3zYWEKy4FTXycAJLBAPZDh6H67Xehfs0XLWyA9yXjnfbPV6Bpxy68xys4vmg/8W2HlPlzIe78qTx3PD8aidP7lJ21/LgTKv66DDwWK2iSEyF7yaOgjosX46XFQJggwOAYHOiSG7/eCDWr/oOheizXhageRC7Y/N1WiDtvMlT9YyWeq26tyWi7XmFHkUR7jYofnW6mpdWsijWBLjM90Ki1tZyBJIMEvRaRbBg8AMPOwM3b9oOFvPooVK1evgonJAZMZ42D5rIyKH3iBc6GEvKdpRVQu/oTNHA/KMOJt+7ez5Nf8/b7oI6P5WvcjY1Quvh5XNFWnhi6H+kd+sz2SwGUv7CUx+FBw2c8fC/o83I4q1rzrw/AQ65w3CjI/XQlpD9wFzR8ug6OXn87FM6YCycfeRoMQwdByi03CDfiNTg+J+6CcyF28gQwDMpt840Keqfa9z5GoDnBNH4ssoQTSh9/Hg24BaJPHwWpt/8BEmdews921zVA1Zv/BtOZp+N4x0L9J19C2dMvQeXSt8B+5BjETZsC2c8uZtA4T5ZyRri5vBKiRw+FxNmX8bwEcSvFCijCYgiKLtJDyT9QSlrjX6PARgNz1zcKmuuAIYwjh7U53vjdD2wkWavDVd0o9khgq3lvDTJEKRfG6EVp8gn5lq07wLxpm1i9+LezrMKHc7rGll8ImsR4dhPNlVVIyWLPRc3K1SJtjhdlP/soGvEcKLjkWl75RM3RY4ZD/3eWMfgKZ1wP5u+3sXsgN9S0cw8CYiACt57DatJP7IaMeki961YxsUmJALQgfNvDvIsF9ZFOUHnNu/+Bhi/Xg2XbDjBNHA/GIYNBjYxE1zAoeAORDM3ImtXvrGaQ0EtXr3gPsv68kAGUdM2VUPn6Cn4XYpnGbzbx/e0HDgkGcrdxWwUiFREeIChDGUINWiSkWrsGZ1k5T5TKaAgaXZChY84+o41ANW/YjEZAo7ma0RXlQlTfPlw9dRQeFXsl/Hx19KjhnPji5yv+MwpXRtRpfTBScYIdWUBtMvq0iD63P2gSEphtHMdOML1noxuJPXcCFE6fg5NaDOoYExuy94tPMfhO3PPfCLgfuTrrbXSc9AaN1QtYAmjSdVeAIVeIZE2vRPH+lJZXAMFuMj0FDHm5PAfEhnQvlUGPrlfcx5Z/iDUEaRcS63St/VAh35+SeLwYbGqoQ3ZMuWUuJ/WicvpC/cfrcOzR+F7FQkuRa9Oo2wvhd0MnyacuRxj0NJrU1uKRNrr4U2l7oaqubzYYhgRu0zRv3sZUrkKEe/AcWoX0Yg70jc0VVeIFvdoFDaEfnMur1QtIon66hq63o4ZxUA1FyYPwBI8Rssi67xek2XLIfmYhxEw4Ewovv54nkrb3sWGvnYnubCBnWms/WIs+OjCCIgNW/f1fqJMKeTXSu2pQcCZddTmu1rcUhkhiA/pnXNlNDszhqi/RPI2Pj6H7IW1j3XcAzBu3CJCh4QnwHLH9tItdpRdYNA9ui0Uc82aKFXFKcyEWqTpsQdkRIIaHiAceFKnjAA1RU9dhyORBdR4zYXzgisdWtWKlQLcSPkafLnZZNf28JyDjyQZISQY1agY7Mocv+UWsMWKoYvR8UUb3TqJK8rkoy+atkLloAcROQWaYORcpuRbdgYHplcJkb5KNCnMeq73dzcDNFTVirPRYpHbSE9a9B6Bh3Xe+bCuH4h45oLZjGDZYSevvB8fR46BNS2Yd4Dh+Ao7/8UF8TwePWY3azHfu3nxf1CXicg8yXTyKW70ixGtEhbjzRmHUwXABQTMY0g5r0gjk51w1gRqFwrGgcTKFUDoNxF9yXsBhyw/bwPztZkGzOIm0D9M3Ibv3BdyP6N84NA9c9Q1I/xViNZAbQvVvVLbqWXfubrmGwrOEOF6J1BKuvAzSF9wlQkoKHSnMpFAOga3P6499AIOuafvOoKGboGOJxxLVvy+KySlQ8dpyX+WWBCRrCz8fTiKbxKNI3JVA1pMPQe5nq9j/F1x8NbqGI8w+nOzLzoSofn25aMhuxC/j60Fg0TNJKHujstb1oCCtHPuxcAGBqg2yQ2IIKl8jIGhAoSZgPMgohsF5qOBHBxi4bMnfhJuhScYX1makoa9Fw6CWsO3/BVR+E0LnG5AJyJXISlaTjKtJSeJKKYe9+w6CSnEldA9d7yyc5CwWlryiKJRCtxB33iRwKxtyaKL1GB3wRGOkJMDWcf2PmCv1jnm8+8u2P58jJBKE7DYQhN69HvRupBfomV6Qp9x6I+qdfviccnSzZWIxkKAkvYPukLcWHikS2wr9IzZiQoU9Ldt/Qraq7MhF+LfjIL6LGhYgSBUlh1w9w0kk+gu4aaypw8xm4uzLfSKKXcWbb6N+2O4ToSwA0afSinfgSnJgdOE/IfTy0SOHcqzfksBCoA0awFv0nMUlfB0oIPI4XcgogxQ9UgQlC5/mnAAXbOZcJe6hJKe0KeLV3fUigpA6+HoAsYthSB4kzZnN4eGAD1ewSPWOVZuW0qKlaNX364MhehpHTxQZ0fh5BU6ZyHkH8J4re3xMYt21l1mixV0KtoubOlm4tQ/WhJO13NfpGg8iKEP+Bo2E4SFtj/MXT6S0A3yejx0cHAUkzZ7RktFE4Vb2/KsBeoLuZRorVoADY26Pucnnx5k90lNBh6udcg9eSieG8LkY1A8Uokk+vyq3uBJkG7quccMm/tuEkY5x5BDfqvYCQGXA8SA7dJRtpbGk3TNf7CRHtiL36cTV6jGLXe28UUi5nla9cdggzpra8g8yyCncpKbr0xvZMIfZU0Rg5C4HKYDYF1Dt86CYjL9wKu9aN2/6gcNM/l5LDwMi5EbFK6K/hi++9h0zjhrBYZf/TigyGPnojIf+hNQp8hZE3yykmmwBEQTXOAbnKQK1JkBNu1E3EMNQ2GhHUealdFqVJu+qQoP7fDfnSgzCGIqYI6PUrvpQYRstisiZzEqkiUQeg1Z3KkShm5FtjlYRUrMvnR07+SzWG8duuZezoSfufpg7RQ8i9Exq2fxD38gdPdwHWGKjJk7ve3jxmM4Y47s3AZ5cC7ELAVilU6IoXBi67AzIePg+cNXVQclDT+DikcNhiIKuAGJkWGUSpdBzctESrnDyZKamQK951zI1ksZwN5rZj2c+ugASLr9EAUMlFM27E0O3w63yFSKH76X7aAQXpakpF0H3SLjyUkiZ/3so/+sb+FyNEpeLnIdhiPDPli3bfWGYu6mJQ0L9wAHMAhTCUa7BvGk7h6YsMmdeKoyPk2vZ8iOnuQloaffdjkpexyCkd6AxkJjTZaczSFP/NB8qly7naIbyFCKq8PD1nK8gDaEsBJojoxJGWjZtZWa1/VIIzSWlfCxm0lm+d4nCkJwiKEfRMY5cSOMQ+xhHD4WcD5azYC36/Z1ChOr1oVrK0lmE0V5iipZpTrilM0okURbx8LW3QJ8Xn4TosWMg/f472Yc2rtuABukFiVdNx1UwVoSRO3bCifsXgT2/QKSu21QZJaj/+AuInXQOr8CBG9Zyckab0ovFYTGuDPK/dC2r/Bx0Q9fM8O3ljD5jNFJ4ETOPEbVGMoKT6gXsIlDM1mOYSS6lBv1v5iMPIEBiIPvZx+D43Q+hEY7DyceXQO/nn+CaQ966D6Hhq2/xOW5mGdrveXLRn1F7zIKYs8+E6hWrRDKLikk6HaeuOW1NRj7rDJyLUdCMURjVGgwDxXEDhr9NO/YwQ1r37mf3F4PvGn/JNDCv3wzJN9/gW1jZTy3k++rxHeldLNt28kJiMHAlOeSNRKT8Kzq1Zasv6qQpKIoLu6DK6LZx2EQvn4g6gRMrkipAL9S++xHUvLumJZPpBwZaabG/m8BizbzxB878Jc6azhPmpfuqt/4Nlq07cQUZfbok6eoZrLppBRNFk0+teOkNrpqmzL+RdQsxFTEKUXTFX5aCq9ECOgRsyu3zWAuQUauWvc15Dfo7ZuJ4FIuzwDh8KL+Tq7oaGr/bCtXLVzJLJEy/kMUe+f3Kv73Jz6bIKPWPNzHVE1CpttKEBnQhY8RfNA3PMYtVh0AmZiGGiPvdRP6aIygpcRpz0pXTkRWa2J2x20GjU86CdqCRm2Fq5xR8WBb6CvsF7VYxi3YFBcRE7N+dSqGdjEoUS8amyhspa5pQyjQ6jxcj9VlZQEqtEykUbiFI+i59Fo2+Eidnr1h1qA3IwDTJXL9AP68y6AOASPQtRKHM7CIpoKAKKUUTIjT1fqYSQMSfQgtYffUGEpLenAYnwmQPG5V3hyPYyfhM0QR+u03kVNRifN5kGl0nIgvlnlS3oOspqvGCXxJj4BS1b+wgzsX35YSa96sJ3gVFz0I3yhuOurYX4lnsD3YGiNYuI7fLSKDJwBcxjBgM8Ui1FHpShED+3LKlgCefcu1Mr+2l0BBElO0jF0GpZd+LK3sCvNm/9hNdWlC3s82fFTvVRdrb5CuLdG/raqvXaD7Q0WpnYNIzWpJUba5TwBmsftPu+UHGru5gU9EptF9COak1IAZ39WluXL3Jf7gOheMDAWEQGbNpx89Q+9En/FW+5pPlYq1Szl2trFKHHYXdRZC95DHUB4tFIccLnGA7j36t9tv5NywOdwUQI7oEBvTPCdPPh+xnFrWTp9CCCcUVdUqzNn7/A5ix2zG6IDWu5s0d0xFMN7DAqsFwUB1thEjr1tbQ0aaYYKKSeJX22p0WlqcgQRYfC3lfrQZdRnroF1J4hi6GjY8MQPWQw1fMFWGoQR8xYfe2A8pid3emIfz5MBPEvxYTnohEEZV803UMBqJ+KsRYf97D+fnOqNhb33ccOw5H5twC1gOHuKgVad3ejgYDQ0cug1KDYVuDtABV7irfWA41Kz/k73FyISc2htOv8RdMxVByEuiyMttNZdd/SlvDXuTiDuuGyBd0eqLtCfVEzalGGETvte+v5dCOhaJWw+EUxeXmDVtYSGpTe3FSxTAoj2N1cjOUAKLkkm3/QRG6mSLf1urBdqgrgBjW1aeRcGz9DS0ChaSEYPRPC1ERpuGrjYFgwjDOF5FEsNBTjWa2oCuAGNlTI/IHR6T96o3+SeUjITO+3+99I3P3m2wUbtZ2BRD1kbn7TbaXw3HI/oB4MTJ3v7n2HPZ3wrnAX0PQf6JBOeKbQWyhi3wp//9mo8IP1S2WYl8Ttt6L/J9bkRbMZURapMH/CDAAWoSs47LJ+xgAAAAASUVORK5CYII=';
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report') {
        doc.text(headerobject[0].text5Date, 1100, 90, null, null, 'right');
      } else {
        doc.text(headerobject[0].text5Date, 800, 90, null, null, 'right');
      }
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.setTextColor('#009BDB');
    doc.text(headerobject[0].gridHeader1, 40, 90);
    return true;
  }

  /**
   * PDF Header for alberta reports
   * @param doc 
   * @param headerobject 
   */
  pdfHeaderADSC(doc, headerobject) {
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANsAAAArCAYAAADxEf1ZAAAVWklEQVR4nO2deZhU1ZnGf7V1dXVXN83WDYiAthsgggqoiBshxGjUcYmOu4yjjk4y40SjODETM5pxizGLEcboaNx3jSbucWVRowIqIJsNAsrWtL0vteWP91zvrVtrd5c0OPU+Tz3d59a95557zrd/37nl4bqnKKIAaBnAaQf8iWsnP8aGlgH5XNEPOBZ4EajPemL/dpYtGsbT90yksn97AQZbRF/A29cD+MagtIVHPzmSRVt2o39pCwk8ua4YAvwWGJHrxGjUy8qPhuDzxwsx0iL6CEVmKxT8XSRa+/PAyqlUBtrxkpMxosAXQCTTCYmEh8qqdtasHMyyhbtQWpbx1CJ2AhSZrZAINfJs3UTe21xLVbCt1935/HHicQ8L540iHvfi98cKMMgi+gpFZisk/BHizYN4cOVU+pW0EU/kNCUzIpHwUFHZwaqlNdQtq6aiqp1EL/orou9RZLZCI9TMcyun8GH9SKpDTT3uxtJqixeMIh734PUmCjjIIvoCRWYrNPyddLX2Z87SaYQDHcQS3Z/iRALKw52s/HgIn60aSEW/dhJFXtvpUWS2QiPhgbImXl5xOO9t2Z2aUGM+kckkeL0Qifj48J1dicc9dPPyInZQFJnt60CgnWh7JbOXTCfk78RD99RSebiDuk8GU7e8mrJw19c0yCK2N3YkZiu0/B4OHACMB4YCwQL0WQmMAQ4EdiXTmBNeCNfz6upDeHvjnlSHmvIOlnh9CdrbAyycP4oEaX21KqDEdSwA1AB+0y4BBmYc3/ZFf2AftA4HAoP6YAxhNB99inyYrRb4GPgQ+FUP7jEO+AhYYvrJ9FkCzAPuQ5UVPWGO6cCDwCLT5/uO/5cAzwPnI4LNF5XAD4G3HGN9z9Hn/cCMlKv8XdBRwd3Lj6LM34Hfm19COh734PfHiXT58HoTbl/NB3wC/NR12VjgTWCUaR8EPAKU53XT3KgC9qZnzPsQ8Brwf2htVwG/LMCY+gH75nnuBcC9Bbhnr+DPfQrnosUEMc4w4B+7cY+B5D8pAFOAs4DliKgey+OaocAdwPcyfD/AfGqBo4GfA9cCdwPZ7LQzgOtJX+VRaT6jgTOBv6BF/QKQ7xau56+f7c9bG0czYeAatnZU5KTWUFkXny6rpmFrOSXBlCT2DKTBTieZ4YJmjAHTLgN2AVpy3C5fTAduRdq8uxiLBNJNiN6mI8KvR3PbU0wBniM/AVCF6LZPkUuz+RHhO3EaMLEb9+ip07E38CjwnznOqwHeID2jZXKWdgHmAD/I0u91wAPkUU5lcCwwFydBeqPQ1o8Hlx9GyB/JiyqCpVE2behHY305gUBKEnsW8BTQCHzXcTwGNMFXZSsRYBMy2y5Ams6N04CzEWNa2AOZe0cggToM0cjBQAWyCmrMubXARUgYD87ySG1AHbAFCaL7gNnAha7zvoMsiOGOY3sC+wFTgYuB3c3xABKaceAc7DkfBsw04xzi6KeTwgmeHiOXZjsa2C3N8XOQKdUTbADuRBNl0V8MaYn90KQ78QtgITIB0+EOtChO/N6cvxQIIQI5GEnVPYBW4HXgTxn6PA/4ievYOiSRX0PEvj9wAmIyC7sjZpiMRfilTbxcN4m5e8xnYvVqtnZUZLilkABC5V34/DF3Ens34HDE/FcCl5F5ThqQNfEsMnXnAFcjTRJCxc8Bc7v/Bg4D1gP/bPqehzTSK4gh90d+z4XIXB2GBNx8c/xXZh7ezvBIbpdgPppjC/eaMSxD632Sufe5aB3eRrRyu5mDhcA0JAguNu0AMu3fRfT0G+A4tF47ROIkF7P9U4bj3wd+jCRGd/ERcE2W76chf8PpSM9BhOwW9fsBxzvaHcApyKRzYima9OsRU7eh2sR0GIiY1YlXgROR9rDwHvAHRID/6zh+ICKSuwHwRYl1hGmOhPB7s5dbBUpiNGwpZ/niYYTKUwyC85C2Wge8gBij0jUmCwnzHGcjE+6HyAy8GbgCze0Yc+4bwG3AP6BgRisSeGHk83Ug4TgKOAQJkX2Bo5BPbM3FfyBtmQ+6sAXtyWacPtP3DcjvrkZad5MZT5MZ6++ACUgoPG7GBLJWpiNGBngSFXqPg9yFqtsD2czIoUgypMMQNEk9QSjH968i6eVU+yNIF4SAb7nas0llNDeayMxoIHPUaVqtB44hPVGDNOsNrmOXYxFTwgO+KAFvNGdE0utN0NXhp6khhM+XQh9nYQuBPyOfxzLx3R33Qz7v444xRhGTjTb//xxptcFIwIGE2QLEcJuAT83xBCJYS0N8jEzV3yFNFEBmYr7wY9PeOCS0ZwE3mrZllsaAD7Dn/hFsBRElmYk2AJuBW5BQHULmNesTZGO280jWfLeiSJgFt81dSCxDUSwnjkhznnvj2BsFuPdUV/tecmvwa5GQsDCGVNM2J+IxD6HyLkpDESWzbYxGmv04FDB6DEn+U6xLzV9LdXqQ9nCmAuJovX3AVmzGuQNpFsx37rQCyAz0OPr7KTLD2xHTdZJqdSQ9mqs9iuQ9fI1mPJ3ITD3DHA+RbIJWIk1rPZMTM5GmtZ49hr2jwpNjfNsFmcxIPzJTLLQBP0IPepU5dgQigmVf09jmIufeQj6Bil0KcN9aV3tBHte0IS071YyhHSsq6YlDJEh7tASfJ7s1EwhGWbNyCK3NQXz+JDfjUmAjMvcGoHX4BK1FFfLRys04rPGMRUz/LvK5AojANyGivSbNEDLRQxyZlRbx/giZyVeY9qFkDpJ4SRZWYXO95W/Wm2dwRiZ95m82K8hHcmrjPOAZ0zfITz/U/B8k2VrpE2TSbEdhR35ADjXIfHHi3IKPyMZ6V7smzTlrXO3LkfnbG7gXZWs3rp2LTJ1ngGZIQCREeXkDoyq30BbNnjosKY3y6SfVNDWE8NsbRSuRFXEL0rK/Rj7sTxHBXYfmIYYCPkPNmL1mHDcijf80IvpbEBG+hMzfOPK/QRHHdEnnN5EP+BzSqP9uxnQr0nDTyRztC5qxPoACNl+asV5pvr8D5d42mGdZj3w2EDM5x1OBzdR/Q6bkKygaeR1KwdyEXImLsLXgAmASioTmtY3+60AmSeYOjFgJwQXAamzpfx7wM3oWKMmFRlc7nWR6Hts8AkXsPkIBi6eRdtlElg2aaeD253pRL+WBjgq+v9/zTK5exSdfDsup3dJ4dUHgEuCPaU6fgYIacURMZwKliHC/iwTUCYiwrYKEOlTRcSWwF/CvKOEM0pyVae6zFuW1TkDrcC/SOlYEcjawMsMjXYL8sHIkHF5AgSVrXjtRpc+PUbBjNmJAUPQx7OjrUewo+Oco6nuy6ftl8/ynAisQY1mm6kvI5J6InYvc7vCkeQfJICRdLDH8ObKxLYK9HjmzFk5GkZ9MmIJCyRbeAI7MY2wHkRxKnkeqPwVapJsy9NGConefoedYhBZ7RZb7zsU2PzrRs2/MY7ypiAapKPuSh2fcSk2okeZIklVUiwTC6SjgQFm4k5UfD+UvD04gVBbBU9xW841COjPybJKd0odI1gzuio5M6YHthZtRgCIdwsiv/A5yoH+DfJ3HUdI8FxL0xrFur+TE3d9hdP8NbkZLi462EvYe/zm1YzbT3FiKx1Nktm8S0jHbTFf7QVf7A5IT2seS7N/1Bf4LBWweQhosGzxIG79ObobrHbMlPIT8XQS8KQnqtIjFtBwHHvYpZeEuIpF8qumK2FngZrZJyL628B5iLjfud7XdJV2FgNu5yUWtVsh4XxR9OxFF6/6A7Hk3Ew5B1R7Z+vWR7DN0D6FmnqqbTF3zYMoDHbnPN4OJdPmIxTxFzfYNg5vZ3LmzWzJcdyewzdE+i8Jv5/C52vn234B8s6dRtO1CFEgYg4I5ToxGTn+m+5TQm3RCoJ3NG/fk0dWHMDy8jWiOXduBkiitzUEWvLIX0YjP/YKfqags6UPzmUX3di/kiwdILVXrLWahFNEyZMrvrJiI5n58Ty52rn4YO0lqIY4iVuMdn3GIAJ2h+T1JreboLapd7W1pz8ofjahiYrbr+LddbTeT9yIZmoCSNh5c+i0+rB9JVUn2N275fHFaW4I0bisjGIo4Tc9JKLBUhyJ0L6Io36Sejy0j1qFKjELhAVSt8hCyiM5Bub+dAZdip0VA+dNV2CmFbsHpFJxJqqR8CDGc8zyrdMctpi9GOY9CwZ3E3lSgfp9AY7Xg3nrhzqvtRv7EcRhigABwH3g+p7SZbY01LN02nGNHvk9LpDTjxYmEB58vTkkwSltLUoHEZYgJTnIcu4pUeEk2vz10vwh3Vu5T8sZEZNofiV3dcw8S1KeTWiXkRD5j91G4ypASUtM8x6JUys2mvYTkNcgHX62Jk2H+JcOJbi/dgx7SbdYdT2H3DB3tai8vUL/ucbvzau580ZQ8+7wf+Y23IPNVvl7cB4EOyvydPXr5j0E9MJJkrRvFHrsXabx15txzzPG9UJL9SSREliNf9TaSCxIuQYlyUBrF2nrkR0n0zeb627DpYRZ2RYrbPLcw1oxpvuPYBiTALOYbgEz+ZpSSsbYDlWAXJW9Gls0YlIp5CKVw6oDFJAe6DkCplBZkAVgK5CiUH3zBfPe0OX4yKgr4ENWCnmqOj0drPxnl90BpsTnYdD4IFXo0oWL3/c3x7wEPm/uvRcG4amv1x6NKaidWo/zUugyflSRLFT92TVs25FOB7d66Apm3k3QXp7raq1ztua72TOwd0JlwD7IMLPyV7Lm8tPB4EsSiXjo7Au7XIfwaFfpGUVDnCpI1/43m/scjrX0XIroO7OediQijHRGJ0y/7CSpeBgWWLPP0VlQtMhNV5+yOtM1piMFOQmt1DXaZlBOdKG3kLkhYgx2wehIls2eieZuLGLATJd4PR/vTfosYcjjaa9eB0k6t2LRRCbyDmO08tG5W9dNwlNZ6EwkTy1o5BAXRTkDJ/UeQkFqDgoOLsP3MoYg5rTzOq2jnyUzT37tIIA40c7TAjHFX4ClLSjlrEEHEcwGSLpkCE+2Iue5zHLuA3FveszFbfzSxv3AdfwtVhrixP1qQGmSa3GXOTWdahJE55n7WR1ztPyOJae3jq0CTej7apuNEGfA/2JrEwo1f/eeNQVeI1kgQf47qkUiXn6pBrey57xcsfnsk4cqvXIOVSKpfiKKt5yP/cwYinmORZluDhORq4N8QU7aa8xtQuRSoMOFdM/4K5B9fbb6rx07in4uI0NpJcY/5e5Xp6yPEfM8iQna/NiOB6CcTDQ1CmmwKCv48jkq/TsEu47LcE2vskxHTnYM0ygoUeKlCQmIL9psE3kN5VYvZ16P1cuJy87fG3P9SFDhbYe4fJLkoY7O5/wC0Jgeb+zyBhN0xSCguwq4/vQy4y4+I0CmVQVLEaaZkwv2oJm2kae+F7PPXs1wzAS1aApk/lg9YgybSXZvXierc3BhJalriLEQA75Bc9VGDzFL3tv45aFLc9zsHMa2F3RDDvYQtESsQIY5yXX83SjWY3sLU1qxiv0FraezKXgsbi3npV97FoCHNRCPuOA1bSSaU15BE3hv5GmegXQFeVL70N0RkncjvcGIxIsKzkEZbghjUgqVWQ8gMcqMLBZZeR/5pENVhumEVR7gDCgHzKUUM4PTH12JHgBtI3SZTgsrwLP9qAzb9lJlns9CGmK8KadgNacY4C9FXM3reCnNfSN11YM1LHNHpUpJTSnXITI+Q7P/5gUY/UovOwMhC88kXjyPOtXAB2ZltIPkXMG9BRJRuZ0ED8i+ucB0fR3KuMBOeJDlQ4sRcJKUeQJNvYQbp99VZeAJ3RU1nmLHVdew38DM+3rZr1trIkmCU+s1hPnp3BGXhpHLTQcjPcBLt69jzXopMzVtdXU4nvd9tjdWauxtd31maKI7Mr8Wu7/sjTePW6G6sRYKqFjE0iHi3IfP2BSQAB2MT7UgzNki/5acTaWLLBRqImGCLuZdz7csREzagOXDXRY5DWn4KMvmGIgaypGIZ9k4KsOfFi4TfPq6x74oEQRXJ8RCfdZE7p/Io3YM7onQGydtUevKWrDhyjCeQOcLZhEzIqWjR8sV6c12uza/PInv+pTz6/BLNY3LqJOGF0ma+PXwxm9srcxYhl4U7+WDuKD5fU0VJaZJRcRMiptPRRs8fIBPlTvP988jCmIbqOu9B5mYjWvgUNYk2ftaaj/PNUwOxd1j8EWms45AQeRbRzNXIbDwRmYG3kb6w4Q1kCSxAVsBxSHBGkaUQQ3vQHke7/29Hr614FDHHIFKZ7UvzTHehMryHkVbaZvraBVkXp6AgyErk8lSTajV9iZhmEoqcWrlLqzxxFTLRp5t2AjFXhbnfYiSQTzLjGYx8RPe9SoFqvxngekTgLST7YPngfbRw47G3uzu1wWq09aOczNX3ASR91iLJ8jb575ObhyrcD0Ch94ORhHNq6y1IWy9A20TcOwoyYQla0KlIox2KbeJEzfcvImZPrlDxxKGpmkl7zeOYkQvz+oHEaMTHkOGNlJTGSMQ8zkLkG7AjjhvRol6P/TKky1Bw4D6k/Vah+YwhczLdrowGVOfa6Pr+A2QOgXzEoLmvVbEP8nPHmuPNiGjvyfBYhyOhcDuisUVII1q/6ngMYrbbzdinI7+xEtGWe63CKHA3HO1cTyCmB63zVOzXIS7HDtVvxX6Ng4V1KI/2S+SLRZELYm0X+hkS+L9H5vpWJDwsSTgDWUi3ozmchmi8zXWvLcDb6ar+iygEYn7oKuOOY27iiKHLWN86AG9y+VVK1b/HmyBc2ckz9x7Ikvd3of/gVhLxlNiCO5eWDT3Js3UX2+MeTpyOkuT7UNh3i2Sb14I84470RuRvDjxxaBvAIbXvcOSwJXzR1t/NaGkRj3lJJDxMmLKGkmCMSFc6669bBLY9mGB7F3CWIUGV/TVl3Ue2eS3IMxaZ7etANIjH38ElY14hlvARz7Os0+NJ0NxYyojarewzYQMtTcVtNmmwFJltuSLlOxyKzFZoeBLQ1o+pe8zn4CEr+Lx1QLd+WMNDgnjcy4RD1hIsjRKNptVu/5+xAL2ar7WvB9JdFJmt0IgF8JW2cMHo1+mMBvDmiECmQ0tTKcNGNbDP+A3uGskidmIUma3QaK9g2u7vcnDNCrZ0pHudR254PAniMS/jJq+jrDxCPLYj/BhNEb1FkdkKibgPSps5c6+36Ir7e+VVt7eWMKK2ntoxG2ltzrxToIidB0VmKxQ8CWgZwBEjFnP4sKXU5/7FGi+KrKVdg3hc5VvjDlqHz/yElKeo4HZqFJmtUIgEKa/cwkVjX6EtGiQazzm1cZT8TOvUeTzQ1lLCsBHbmHzUKmJRX9Gc3Mnxd3WQ2G3qIQNuAAAAAElFTkSuQmCC';
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report ') {
        doc.text(headerobject[0].text5Date, 1000, 90, null, null, 'right');
      } else {
        doc.text(headerobject[0].text5Date, 800, 90, null, null, 'right');
      }
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.setTextColor('#009BDB');
    doc.text(headerobject[0].gridHeader1, 40, 90);
    return true;
  }

  /**
   * PDF Footer for reports
   * @param doc 
   * @param headerobject 
   */
  pdfFooter(doc, reportId) {
    if (reportId == 73) {
      doc.autoTable.previous.finalY = 290;
      doc.autoTable.previous.cursor.x = 800;
    }
    //Start Footer      
    doc.setFontSize(8);
    //Left Line1
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('T', 40, doc.autoTable.previous.finalY + 40);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('1-800-232-1997 | 780-426-7526', 50, doc.autoTable.previous.finalY + 40);

    //Left Line2
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('F', 40, doc.autoTable.previous.finalY + 50);

    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('780-426-7581', 50, doc.autoTable.previous.finalY + 50);

    //Left Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('E', 40, doc.autoTable.previous.finalY + 60);

    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('claims@quikcard.com', 50, doc.autoTable.previous.finalY + 60);

    //Right Line1
    doc.text('#200, 17010 - 103 Avenue', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 40, null, null, 'right');
    //Right Line2
    doc.text('Edmonton, AB T5S 1K7', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 50, null, null, 'right');
    //Right Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('quikcard.com', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 60, null, null, 'right');
  }

  /**
   * get Payment Run Report Data
   * @param pRunReqParam 
   */
  getClaimsPaymentRunSummary(pRunReqParam) {
    this.showPageLoader = true;
    this.hmsDataService.postApi(UftApi.getPaymentRunReportUrl, pRunReqParam).subscribe(data => {
      if (data.code == 200 && data.hmsMessage.messageShort === "RECORD_GET_SUCCESSFULLY") {
        this.paymentRunArray = data.result.data[0];
        var tableOneSum = 0;
        this.paymentRunDataTableOne = [
          { 'content': 'Total Drug Claims Loaded', 'amount': this.paymentRunArray.sumTotalClaimSecure != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumTotalClaimSecure) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Cheques Written', 'amount': this.paymentRunArray.totalChequeWritten != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.totalChequeWritten) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Electronic Payments Generated', 'amount': this.paymentRunArray.electronicPayment != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.electronicPayment) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Merchant Agreement Charge Revenue', 'amount': this.paymentRunArray.totalMerchant != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.totalMerchant) : this.convertAmountToDecimalWithDoller(0) },
          {
            'class': 'total-row',
            'content': '',
            'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(
              this.paymentRunArray.sumTotalClaimSecure + this.paymentRunArray.totalChequeWritten + this.paymentRunArray.electronicPayment + this.paymentRunArray.totalMerchant
            )
          }
        ];
        this.paymentRunDataTableTwo = [
          { 'content': 'Total Claim Paid', 'amount': this.paymentRunArray.sumClaimPaidAmount != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumClaimPaidAmount) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Administrator Revenue', 'amount': this.paymentRunArray.sumAdminAmt != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumAdminAmt) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Broker Commissions', 'amount': this.paymentRunArray.sumBrokerAmt != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumBrokerAmt) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total GST', 'amount': this.paymentRunArray.sumGstAmount != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumGstAmount) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Broker GST', 'amount': this.paymentRunArray.sumBrokerGstAmount != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumBrokerGstAmount) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Ontario Tax', 'amount': this.paymentRunArray.sumOnAmount != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumOnAmount) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Quebec Tax', 'amount': this.paymentRunArray.sumPqAmount != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumPqAmount) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Newfoundland Tax', 'amount': this.paymentRunArray.sumNlAmount != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumNlAmount) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Saskatchewan Tax', 'amount': this.paymentRunArray.sumSkAmount != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumSkAmount) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Stop Loss Claims Reversed', 'amount': this.paymentRunArray.sumSlClaims != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumSlClaims) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Stop Loss Administration Reversed', 'amount': this.paymentRunArray.sumSlAdmin != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumSlAdmin) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Stop Loss Broker Reversed', 'amount': this.paymentRunArray.sumSlBroker != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumSlBroker) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Stop Loss Broker GST Reversed', 'amount': this.paymentRunArray.sumSlBrokerGst != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumSlBrokerGst) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Stop Loss ON Tax Reversed', 'amount': this.paymentRunArray.sumSlOn != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumSlOn) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Stop Loss PQ Tax Reversed', 'amount': this.paymentRunArray.sumSlPq != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumSlPq) : this.convertAmountToDecimalWithDoller(0) },
          { 'content': 'Total Stop Loss NL Tax Reversed', 'amount': this.paymentRunArray.sumSlNl != '' ? this.convertAmountToDecimalWithDoller(this.paymentRunArray.sumSlNl) : this.convertAmountToDecimalWithDoller(0) },
          {
            'class': 'total-row',
            'content': 'Total Charges To Plans',
            'amount': this.currentUserService.convertAmountToDecimalWithoutDoller(this.paymentRunArray.sumClaimPaidAmount + this.paymentRunArray.sumAdminAmt + this.paymentRunArray.sumBrokerAmt + this.paymentRunArray.sumGstAmount + this.paymentRunArray.sumBrokerGstAmount + this.paymentRunArray.sumOnAmount + this.paymentRunArray.sumPqAmount + this.paymentRunArray.sumNlAmount + this.paymentRunArray.sumSkAmount + this.paymentRunArray.sumSlClaims + this.paymentRunArray.sumSlAdmin + this.paymentRunArray.sumSlBroker + this.paymentRunArray.sumSlBrokerGst + this.paymentRunArray.sumSlOn + this.paymentRunArray.sumSlPq + this.paymentRunArray.sumSlNl)
          }
        ];
        this.showReportList = true;
        this.showPageLoader = false;
        this.PaymentRunTableOneSum = this.convertAmountToDecimalWithDoller(tableOneSum);
      } else {
        this.showPageLoader = false;
      }
    })
  }

  /**
   * convert Amount To Decimal With Doller
   * @param value 
   */
  convertAmountToDecimalWithDoller(value) {
    if (value) {
      return new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    } else {
      return new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0);
    }
  }

  /**
   * get CardHolder Utilization Report
   * @param pRunReqParam 
   */
  getCardHolderUtilizationReport(cardHolderUtilizationReportParam) {
    this.showPageLoader = true;
    this.showPageLoader = false;
    this.showReportList = true;
    this.cHURPieChartLabels = ['0', '0-25', '25-50', '50-75', '75-100'];
    this.cHURPieChartData = [11, 20, 30, 40, 50];
  }

  //pie chart click  events
  public pieClicked(e: any): void {
  }
  //pie chart Hover  events
  public pieHovered(e: any): void {
  }

  getSearchList() {
    this.tableId = "mail_search_report"
    if (this.financeReportsForm.valid) {
      this.totalCompaniesColumns = [
        { title: this.translate.instant('uft.dashboard.financeReports.id'), data: 'id' },
        { title: this.translate.instant('uft.dashboard.financeReports.name'), data: 'name' },
        { title: this.translate.instant('uft.dashboard.financeReports.address'), data: 'componentAddress' },
        { title: this.translate.instant('uft.dashboard.financeReports.city'), data: 'cityName' },
        { title: this.translate.instant('uft.dashboard.financeReports.province'), data: 'provinceName' },
        { title: this.translate.instant('uft.dashboard.financeReports.postalCode'), data: 'postalCd' },
        { title: this.translate.instant('uft.dashboard.financeReports.country'), data: 'countryName' }
      ]
      var reqParam = [
        { 'key': 'componentId', 'value': this.financeReportsForm.value.id },
        { 'key': 'name', 'value': this.financeReportsForm.value.name },
        { 'key': 'componentType', 'value': this.financeReportsForm.value.componentType },
      ]
      /** Start Narrow Search */
      if (!this.columnFilterSearch) {
        this.GridFilterGML_ComponentId = '';
        this.GridFilterGML_Name = '';
        this.GridFilterGML_Address = '';
        this.GridFilterGML_CityName = '';
        this.GridFilterGML_ProvinceName = '';
        this.GridFilterGML_PostalCode = '';
        this.GridFilterGML_CountryName = '';
      }
      this.GridFilterGML_ComponentId = this.financeReportsForm.value.id;
      this.GridFilterGML_Name = this.financeReportsForm.value.name;
      /** End Narrow Search */
      /** Start Narrow Search */
      if (this.columnFilterSearch) {
        reqParam[0].value = this.financeReportsForm.value.id;
        reqParam[1].value = this.financeReportsForm.value.name;
        reqParam = this.pushToArray(reqParam, { 'key': 'countryName', 'value': this.GridFilterGML_CountryName });
        reqParam = this.pushToArray(reqParam, { 'key': 'postalCd', 'value': this.GridFilterGML_PostalCode });
        reqParam = this.pushToArray(reqParam, { 'key': 'provinceName', 'value': this.GridFilterGML_ProvinceName });
        reqParam = this.pushToArray(reqParam, { 'key': 'cityName', 'value': this.GridFilterGML_CityName });
        reqParam = this.pushToArray(reqParam, { 'key': 'address', 'value': this.GridFilterGML_Address });
      }
      /** End Narrow Search */

      var tableActions = []
      var modalName = "ModalSearchBanSetup"
      this.showMailLabelTable = true
      if (!$.fn.dataTable.isDataTable('#mail_search_report')) {
        this.dataTableService.jqueryDataTableSearchBan(this.tableId, UftApi.mailLabelReport, 'full_numbers', this.totalCompaniesColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, '', modalName, '', '', [0], [1, 2, 3, 4, 5, 6])
      } else {
        this.dataTableService.jqueryDataTableReload(this.tableId, UftApi.mailLabelReport, reqParam)
      }
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');
      return false;
    } else {
      this.validateAllFormFields(this.financeReportsForm);
    }
  }

  saveManualDetails() {
    if (this.financeGenManualForm.valid) {
      var obj = {};
      obj["componentAddress"] = this.financeGenManualForm.value.address1 + ' ' + this.financeGenManualForm.value.address2
      obj["cityName"] = this.financeGenManualForm.value.cityName
      obj["countryName"] = this.financeGenManualForm.value.countryName
      obj["id"] = this.financeGenManualForm.value.manualId
      obj["name"] = this.financeGenManualForm.value.manualName
      obj["postalCd"] = this.financeGenManualForm.value.postalCode
      obj["provinceName"] = this.financeGenManualForm.value.provinceName
      this.filteredTableData.push(obj);
      this.resetManualForm();
    } else {
      this.validateAllFormFields(this.financeGenManualForm);
    }
  }

  onCheckBoxChecked() {
  }

  isPostalCodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CardApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;
      this.hmsDataService.postApi(URL, postalNumber).subscribe(data => {
        switch (data.code) {
          case 404:
            this.financeGenManualForm.controls['postalCode'].setErrors(
              {
                "postalcodeNotFound": true
              });
            break;
          case 302:
            this.financeGenManualForm.patchValue({
              'cityName': data.result.cityName,
              'countryName': data.result.countryName,
              'provinceName': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  isPostalVerified(event, fieldName) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (fieldName) {
        case 'cityName':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.financeGenManualForm.get('countryName').value,
            provinceName: this.financeGenManualForm.get('provinceName').value,
            postalCd: this.financeGenManualForm.get('postalCode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'countryName':
          fieldParameter = {
            cityName: this.financeGenManualForm.get('cityName').value,
            countryName: event.target.value,
            provinceName: this.financeGenManualForm.get('provinceName').value,
            postalCd: this.financeGenManualForm.get('postalCode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'provinceName':
          fieldParameter = {
            cityName: this.financeGenManualForm.get('cityName').value,
            countryName: this.financeGenManualForm.get('countryName').value,
            provinceName: event.target.value,
            postalCd: this.financeGenManualForm.get('postalCode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;
      this.hmsDataService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.financeGenManualForm.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.financeGenManualForm.patchValue({
              'cityName': data.result.cityName,
              'countryName': data.result.countryName,
              'provinceName': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  showManualForm() {
    this.showManual = true;
  }

  resetManualForm() {
    this.showManual = false;
    this.financeGenManualForm.reset();
  }

  resetFormSearch() {
    this.financeReportsForm.reset();
    this.financeReportsForm.patchValue({ 'componentType': '' })
  }

  resetMailLabelForm() {
    this.financeReportsForm.reset();
    this.financeReportsForm.patchValue({ 'componentType': '' })
    this.financeGenManualForm.reset();
    this.filteredTableData = [];
    this.showMailLabelTable = false;
  }

  manualHeaderTitle() {
    let compKey = this.financeReportsForm.value.componentType;
    if (compKey == 'CARDHOLDER_CMPNT') {
      this.GridHeading = 'Cardholder Report';
    }
    else if (compKey == 'BROKER_CMPNT') {
      this.GridHeading = 'Broker Report';
    }
    else if (compKey == 'COMPANY_CMPNT') {
      this.GridHeading = 'Company Report';
    }
    else if (compKey == 'PROVIDER_CMPNT') {
      this.GridHeading = 'Provider Report';
    }
  }

  DeleteInfo(idx) {
    var action = "Delete";
    this.exDialog.openConfirm((this.translate.instant('claims.exDialog.are-you-sure')) + action + (this.translate.instant('claims.exDialog.record'))).subscribe((value) => {
      if (value) {
        this.filteredTableData.splice(idx, 1);
      }
    })
  }

  /**
   * Ger Dental ProcId List using Predictive Search
   */
  getPredictiveProcIdSearch(completerService) {
    this.procIdData = completerService.remote(
      null,
      "dentalProcedureId",
      "dentalProcedureId"
    );
    this.procIdData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.procIdData.urlFormater((term: any) => {
      return UftApi.getDentalProcedureListUrl + `/${term}`;
    });
    this.procIdData.dataField('result');
  }

  /**
   * Upload Monthly PAP, Daily PAP Pdf
   */
  uploadFundingPdf() {
    this.hmsDataService.OpenCloseModal('uploadFundingg');
  }

  /**
   * Trigger of select the upload file
   */
  onFileChanged(event) {
    this.selectedFileName = ""
    this.selectedFile = event.target.files[0]
    var fileSize = this.selectedFile.size;
    if (fileSize > 2097152) {
      this.error3 = { isError: true, errorMessage: 'File size shuold not greater than 2 Mb!' };
      this.fileSizeExceeds = true
    }
    else {
      this.error3 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.selectedFileName = this.selectedFile.name
    this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only pdf file type are allowed.' };
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  /**
  * Remove the extension from documents
  */
  removeExtension() {
    this.selectedFileName = ""
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }

  /**
   * view Monthly PAP, Daily PAP Pdf
   */
  viewFundingPdf() {
    this.financePdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.fundingSummarySelectedData.fileUrl);
    let fundingFileURL = this.financePdfUrl.changingThisBreaksApplicationSecurity
    let fileName = fundingFileURL.substring(fundingFileURL.lastIndexOf('/') + 1, fundingFileURL.length) || fundingFileURL;
    this.fundingPdfName = fileName
    this.hmsDataService.OpenCloseModal('openFundingPdfPopup');
  }
  /**
  * Upload Documents on server
  */
  onSubmitUploadReportPdf() {
    if (this.allowedValue && !this.fileSizeExceeds) {
      this.showPageLoader = true
      this.loaderPlaceHolder = this.translate.instant('common.uploadingFile')
      var formData = new FormData()
      let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
      let header = new Headers({ 'Authorization': this.currentUserService.token });
      let options = new RequestOptions({ headers: header });
      formData.append('file', this.selectedFile);
      formData.append('coKey', this.fundingSummarySelectedData.coKey);
      formData.append('tranCdKey', this.fundingSummarySelectedData.tranCdKey);
      formData.append('uftKey', this.fundingSummarySelectedData.uftKey);
      this.hmsDataService.sendFormData(UftApi.financeAttachFileUrl, formData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.hmsDataService.OpenCloseModal('uploadFunding');
          this.showPageLoader = false
          this.loaderPlaceHolder = this.translate.instant('common.pleaseWait')
          this.toastrService.success(this.translate.instant('uft.toaster.documentUploadSuccess'))
          this.removeExtension()
          this.selectedFileName = ""
          this.reloadFundingSummaryWithActionTable();
        } else if (data.code == 400 && data.hmsMessage.messageShort == "ONLY_PDF_FILE_SUPPORTED") {
          this.showPageLoader = false
          this.toastrService.error(this.translate.instant('uft.toaster.uploadPdfFile'))
        } else {
          this.showPageLoader = false
          this.loaderPlaceHolder = this.translate.instant('common.pleaseWait')
          this.toastrService.error(this.translate.instant('uft.toaster.errorOccurUploadDocument'))
        }
      })
    } else {
      return false
    }
  }

  /**
   * Reload table after upload document
   */
  reloadFundingSummaryWithActionTable() {
    this.dataTableService.jqueryDataTableReload(this.tableId, UftApi.getFundingSummaryReportUrl, this.fundingSummaryWithActionReqParam)
  }

  /**
   * Reset Upload Pdf Form
   */
  resetReportPdfForm() {
    this.removeExtension();
  }

  /**
   * Close fundng pdf popup
   */
  closeFundingPdfPopup() {
    this.hmsDataService.OpenCloseModal('openFundingPdfPopup');
  }

  /**
   * Delete Funding Pdf
   */
  deleteFundingPdf() {
    this.showPageLoader = true;
    var pdfRequestData = { "bankDetailsKey": this.bankDetailsKey }
    this.hmsDataService.sendFormData(UftApi.deleteAttachFileUrl, pdfRequestData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showPageLoader = false
        this.toastrService.success(this.translate.instant('uft.toaster.documentDeleteSuccess'))
        this.hmsDataService.OpenCloseModal('openFundingPdfPopup');
        this.reloadFundingSummaryWithActionTable();
      } else {
        this.showPageLoader = false
        this.toastrService.error(this.translate.instant('uft.toaster.errorOccurDeleteDocument'))
      }
    })
  }

  /**
  * Change Date Picker For Date Picker
  * @param event 
  * @param frmControlName 
  */
  changeFilterDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  /**
   * Common Function For All Reports
   * Grid Column Filter Search
   * @param tableId 
   */
  filterGridColumnSearch(tableId: string) {
    this.columnFilterSearch = true;
    if (tableId == "mail_search_report") {
      var ele: HTMLElement = document.getElementById('fr_search') as HTMLElement;
    } else {
      var ele: HTMLElement = document.getElementById(this.reportID + '-financeReport') as HTMLElement;
    }
    ele.click();
  }

  callSubmitButton() {
    this.columnFilterSearch = false;
    var ele: HTMLElement = document.getElementById(this.reportID + '-financeReport') as HTMLElement;
    ele.click();
  }

  callSubmitButton_MailLabelReport() {
    this.columnFilterSearch = false;
    var ele: HTMLElement = document.getElementById('fr_search') as HTMLElement;
    ele.click();
  }

  /**
  * Common Function For Reset All Reports
  * Grid Column Filter Search
  * @param tableId 
  */
  resetGridColumnSearchFilter(tableId: string) {
    this.columnFilterSearch = false;
    this.selectedOverrideReason = []      //Log #0190688 resolved by
    var ele: HTMLElement = document.getElementById(this.reportID + '-financeReport') as HTMLElement;
    ele.click();
  }

  resetGridColumnSearchFilter_MailLabelReport(tableId: string) {
    this.columnFilterSearch = false;
    var ele: HTMLElement = document.getElementById('fr_search') as HTMLElement;
    ele.click();
  }

  getAmountPaidReportByGridFilteration(tableId) {
    switch (tableId) {
      case 'amountPaidReport':
        let claimStatusList = []
        if (this.selectedClaimStatusType.length > 0) {
          this.selectedClaimStatusType.forEach(element => {
            claimStatusList.push(element.itemNameCd);
          });
        } else {
          this.claimStatusArray.forEach(element => {
            claimStatusList.push(element.itemNameCd);
          });
        }
        var appendExtraParam = {};
        var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
        params.push({ key: 'startDate', value: this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) })
        params.push({ key: 'endDate', value: this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate) })
        params.push({ key: 'coId', value: this.selecteCoID != undefined ? this.selecteCoID : '' })
        params.push({ key: 'divisionKey', value: this.filterReport.value.divisionKey })
        params.push({ key: 'processorId', value: this.filterReport.value.processorId })
        params.push({ key: 'cardNumber', value: this.filterReport.value.cardHolderNameOrNumber })
        params.push({ key: 'claimType', value: this.filterReport.value.claimType })
        params.push({ key: 'claimStatusList', value: claimStatusList })
        params.push({ key: 'discipline', value: this.filterReport.value.discipline })
        params.push({ key: 'excel', value: 'F' })
        var url = UftApi.amountPaidReportUrl;
        this.dataTableService.jqueryDataTableReload(tableId, url, params)
        break;
    }
  }

  resetGridSearch(tableId) {
    switch (tableId) {
      case 'amountPaidReport':
        this.dataTableService.resetTableSearch();
        this.getAmountPaidReportByGridFilteration(tableId);
        break;
    }
  }
}