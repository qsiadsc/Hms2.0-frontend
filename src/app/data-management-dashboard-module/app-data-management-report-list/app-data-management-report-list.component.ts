import { Component, OnInit, ViewChild, Output, EventEmitter, } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DataManagementDashboardApi } from '../data-management-dashboard-api'
import { TranslateService } from '@ngx-translate/core';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Constants } from '../../common-module/Constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
declare var jsPDF: any;
import { MyDatePicker, IMyDpOptions } from 'mydatepicker';
import { UftApi } from '../../unit-financial-transaction-module/uft-api';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { debug } from 'util';
import { CompanyApi } from '../../company-module/company-api';
import { ServiceProviderApi } from '../../service-provider-module/service-provider-api';
import { CommonApi } from '../../common-module/common-api';
import { DomainApi } from '../../domain-module/domain-api';
import { ClaimService } from '../../claim-module/claim.service';
import { count } from 'rxjs/operator/count';
import { DataManagementService } from '../data-management.service';
@Component({
  selector: 'app-app-data-management-report-list',
  templateUrl: './app-data-management-report-list.component.html',
  styleUrls: ['./app-data-management-report-list.component.css'],
  providers: [ChangeDateFormatService, DatatableService, TranslateService, ClaimService]
})
export class AppDataManagementReportListComponent implements OnInit {

  /**Start Column Filters For fundingSummary */
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

  GridFilter26_confirmationNum
  GridFilter26_cardNum;
  GridFilter26_cardholderName;
  GridFilter26_studentName
  GridFilter26_studentDob;
  GridFilter26_planId;
  GridFilter26_age1;
  GridFilter26_age2;
  GridFilter26_studentEffDt;
  GridFilter26_studentExpDt;
  GridFilter26_age2Exp: any;
  GridFilter26_age1Exp: any;

   getForApi : boolean =  false 
   getReports : boolean = false

  GridFilter27_coId;
  GridFilter27_coName;
  GridFilter27_planId;
  GridFilter27_cardNumber;
  GridFilter27_cardholderName;
  GridFilter27_primaryCardholderName;
  GridFilter27_providerName;
  GridFilter27_paySumRunDt;
  GridFilter27_dentalAmountClaimed;
  GridFilter27_dentalAmountPaid;
  GridFilter27_visionAmountClaimed;
  GridFilter27_visionAmountPaid;
  GridFilter27_healthAmountClaimed;
  GridFilter27_healthAmountPaid;
  GridFilter27_drugAmountClaimed;
  GridFilter27_drugAmountPaid;
  GridFilter27_hsaAmountClaimed;
  GridFilter27_hsaAmountPaid;

  planNumberEnd: any;
  planNumberStart: any;
  GridFilter22_expiryDate: any;
  GridFilter22_cityAddress: any;
  GridFilter22_cardHolderName: any;
  GridFilter22_cardNumber: any;
  GridFilter22_address: any;
  GridFilter22_planName: any;
  GridFilter22_personGender: any;
  GridFilter22_effectiveDate: any;
  selectedBroker: any;
  selectedBrokerName: any;
  selecteBrokerId: any;


  brokerCoId: any;
  brokerCoName: any;
  brokerPhoneNo: any;
  brokerEffectiveDate: any;
  brokerComission: any;
  brokerTerminationDate: any;
  brokerPreAuthPayment: any;
  brokerBalance: any;
  GridFilter26_cardNumber: any;
  GridFilter26_confirmationNumber: any;
  GridFilter26_serviceDate: any;
  GridFilter26_procCd: any;
  GridFilter26_amountSubmitted: any;
  GridFilter26_amountPaid: any;
  GridFilter26_amountNotPaid: any;
  GridFilter26_procDesc: any;

  /* Report case : 36 */
  brokerId: any
  brokerName: any
  brokerIdAndName: any
  city: any
  province: any
  active: any
  addLine1: any
  addLine2: any

  /* Report case 63 */
  cardNumber: any
  cardHolderName: any
  cardHolderCity: any
  cardHolderProvince: any;
  cardHolderActive: any;
  cardHolderAddLine1: any;
  cardHolderAddLine2: any

  /* Report case 32 */
  companyNum: any;
  companyName: any;
  companyCity: any;
  companyProvince: any;
  companyAddLine1: any;
  companyAddLine2: any;

  /* Report case 31 */
  providerDiscipline: any
  providerName: any
  providerLicenseNum: any
  providerCity: any
  providerProvince: any
  providerAddLine1: any
  providerAddLine2: any
  reportDataArray: any = [];
  reportDate: string;
  part: number;
  primaryArray: any[];

  /* Report case 33(Summary by Company, Plan, Card and Coverage) */
  companyId: any
  compName: any
  cardNum: any
  planId: any
  itemServiceDate: any
  paymentSumRunDate: any
  bussType: any
  covCatDesc: any
  amountClaimed: any
  email: any
  searchProvince: any
  searchCity: any
  addressLineOne: any
  lastName: any
  firstName: any
  searchCardNumber: any

  /* Report case 55(Student Status) */
  gridFilter55_cardNum
  gridFilter55_studentName
  gridFilter55_studentDob
  gridFilter55_schoolName
  gridFilter55_schoolStartDate
  gridFilter55_schoolEndDate
  gridFilter55_age1
  gridFilter55_age2
  gridFilter55_age1Exp
  gridFilter55_age2Exp

  /* Report case 62(Card Count by Company) */
  gridFilter62_companyId
  gridFilter62_compName
  gridFilter62_division
  gridFilter62_singles
  gridFilter62_families
  gridFilter62_total
  gridFilter62_divisionDate

  /* Report Case 112 List of Modified DASP Preauth Claims */
  GridFilter112_cardNumber
  GridFilter112_problem
  /* Report Case 112 List of Modified DASP Preauth Claims */

  /* Report case 66(Educational Status Letters) */
  // new param will be added here

  /* Report case -101(FINANCIAL: Statement - Company Level/Annual Statement) */
  // new param will be added here

  /* Report case 18(Service Provider List)*/
  dentProvLicenseNum;
  cityName;
  provinceName;
  specialityType;
  specialityGroup;
  providerType
  bussinessType;
  coverageCatDesc;
  claimedAmount
  providersName
  provUli
  provDiscipline
  providerAddress
  postalCode
  provTelephone
  language

  /* Report Case -15(Amount Paid by Company, Plan, and Coverage Category QSI.010) */ 
  GridFilter15_coId;
  GridFilter15_coName;
  GridFilter15_planId;
  GridFilter15_dentalAmountClaimed
  GridFilter15_dentalAmountPaid
  GridFilter15_visionAmountClaimed;
  GridFilter15_visionAmountPaid
  GridFilter15_healthAmountClaimed
  GridFilter15_healthAmountPaid
  GridFilter15_drugAmountClaimed
  GridFilter15_drugAmountPaid
  GridFilter15_hsaAmountClaimed
  GridFilter15_hsaAmountPaid
  GridFilter15_planNo
  GridFilter15_noOfProc
  GridFilter15_amountClaimed
  GridFilter15_professionalAmtPaid
  GridFilter15_labPaid
  GridFilter15_amountPaid

  /** Start Claim Payments by Cardholder Report */
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
  public planNumberStartData: RemoteData;
  public planNumberEndData: RemoteData;
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
  public searchBrokerRemote: RemoteData;
  public companyData: CompleterData;
  currentUser: any;
  showReportList: boolean = false; //Enable true when we need to show report list in the popup
  showHideFilter: boolean = true;
  showHideNoDataFound: boolean = false;
  reportsListColumns = [];
  ObservableReportsListObj;

  public filterReport: FormGroup; // change private to public for production-errors
  public createLetterForm: FormGroup; // change private to public for production-errors
  reportID: Number;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  showFilterFields = [];
  error: { isError: boolean; errorMessage: string; };
  filterColoumn = [];
  selectedCoID: any;
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
  tableId: string = 'fundingSummary';
  loaderPlaceHolder;
  hasImage;
  imagePath;
  docName;
  docType;
  selectedBrokerId: any;
  disciplineType: any;
  compId;
  bussTypeCd = ''
  monthLabels = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  public compAkiraDataRemote: RemoteData;
  @Output() openReportWithReportIdDM = new EventEmitter();
  @ViewChild('filterReportStartDate') filterReportStartDate: MyDatePicker;
  public cityDataRemote: RemoteData;
  public provinceDataRemote: RemoteData;
  public brokerNameNoRemoteData: RemoteData;
  checkDate;
  languages;
  public dentalSpecialtyGroupRemote: RemoteData
  specialtyGroupKey;
  public dentalProviderTypeRemote: RemoteData;
  providerTypeKey
  specialityList = []
  companyList = []
  pastDate;
  isFutureDate;
  constructor(
    private translate: TranslateService,
    public dataTableService: DatatableService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private router: Router,
    private currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private completerService: CompleterService,
    private exDialog: ExDialog,
    private claimService: ClaimService,
    private dataManageService :DataManagementService
  ) {

    // Predictive City Search
    this.cityDataRemote = completerService.remote(
      null,
      "cityName",
      "cityName"
    );
    this.cityDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.cityDataRemote.urlFormater((term: any) => {
      return CompanyApi.getCities + `/${term}`;
    });
    this.cityDataRemote.dataField('result');

    //Predictive Province Search 
    this.provinceDataRemote = completerService.remote(
      null,
      "provinceName",
      "provinceName"
    );
    this.provinceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.provinceDataRemote.urlFormater((term: any) => {
      return CompanyApi.getProvince + `/${term}`;
    });
    this.provinceDataRemote.dataField('result');

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

    /* Company List */
    this.companyList = [
      { 'coId': '01', 'coName': "ALBERTA EMPLOYMENT AND IMMIGRATION", "coNameAndId": "ALBERTA EMPLOYMENT AND IMMIGRATION / 01" },
      { 'coId': '02', 'coName': "CHILDREN AND YOUTH SERVICES", "coNameAndId": "CHILDREN AND YOUTH SERVICES / 02" },
      { 'coId': '08', 'coName': "CHILD HEALTH BENEFIT PROGRAM", "coNameAndId": "CHILD HEALTH BENEFIT PROGRAM / 08" },
      { 'coId': '09', 'coName': "HEALTH BENEFITS FOR LEARNERS", "coNameAndId": "HEALTH BENEFITS FOR LEARNERS / 09" },
      { 'coId': '101', 'coName': "DENTAL ASSISTANCE FOR SENIORS PROGRAM", "coNameAndId": "DENTAL ASSISTANCE FOR SENIORS PROGRAM / 101" }
    ];

    this.companyData = this.completerService.local(
      this.companyList,
      "coName,coId",
      "coNameAndId"
    );

  }

  ngOnInit() {

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
      { "cardNumber": true },
      { "planNumberStart": false },
      { "planNumberEnd": false },
      { "sortingDirection": true },
      { "sortingOption": true },
      { "checkboxOption": true },
      { "asOfDate": false },
      { "brokerSearch": false },
      { "status": false },
      { "cardNum": true },
      { "brokerCity": true },
      { "brokerProvince": true },
      { "providerName": true },
      { "providerLicenseNum": true }
    ];

    this.filterReport = new FormGroup({
      'startDate': new FormControl('', [Validators.required]),
      'endDate': new FormControl('', [Validators.required]),
      'searchCompany': new FormControl('', [Validators.required]),
      'searchBroker': new FormControl('', []),
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
      'cardNumber': new FormControl('', []),
      'planNumberStart': new FormControl('', []),
      'planNumberEnd': new FormControl('', []),
      'sortingDirection': new FormControl('', []),
      'sortingOption': new FormControl('', []),
      'checkboxOption': new FormControl('', []),
      'status': new FormControl('', []),
      'cardNum': new FormControl('', []),
      'cardHolderName': new FormControl('', []),
      'brokerCity': new FormControl('', []),
      'brokerProvince': new FormControl('', []),
      'providerName': new FormControl('', []),
      'providerLicenseNum': new FormControl('', []),
      'language': new FormControl('', []),
      'specialtyGroup': new FormControl('', []),
      'providerType': new FormControl('', []),
      'speciality': new FormControl('', []),
      'disciplineSpec': new FormControl('', []),
      'participant': new FormControl('', []),
      'annual_option': new FormControl('', []),
      'viewing_option': new FormControl('', []),

      'company': new FormControl('', []),
      'asOfDate': new FormControl('', [])


    });
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        localStorage.setItem('isReload', '')
        this.getPredictiveCompanySearchData(this.completerService);
        this.getPredictivePlanNumberdSearch(this.completerService);
        this.getPredictivePlanNumberEndSearch(this.completerService);
        this.getPredictiveBrokerSearchData(this.completerService)
        this.getPredictiveBrokerMailingSearchData(this.completerService);
        this.getPredictiveCoAkiraBenefitSearchData(this.completerService)

      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser;
        this.getPredictiveCompanySearchData(this.completerService);
        this.getPredictivePlanNumberdSearch(this.completerService);
        this.getPredictivePlanNumberEndSearch(this.completerService);
        this.getPredictiveBrokerSearchData(this.completerService);
        this.getPredictiveBrokerMailingSearchData(this.completerService);
        this.getPredictiveCoAkiraBenefitSearchData(this.completerService)
      })
    }
       
       this.dataManageService.showDataReportsList.subscribe(value=>{    // Report tiles api hitting issue fixed
       this.getForApi = value;
       if (this.getForApi) {
        this.getReports = true;
        this.reportsListDataTableInitialize();
    }
    })
    this.getAllLanguage();

    var self = this

    $(document).on('click', '#reportsList_datamangement', function (e) {
      var selectedReportRow = self.dataTableService.reportsSelectedRowDataManage
      self.selectedReportRowData = self.dataTableService.reportsSelectedRowDataManage;
      self.openSelectedReportPopup(selectedReportRow);
    })

    this.filterReport.patchValue({ 'disciplineSpec': 'All' });
    this.getSpeciality(0)

  }

  getAllLanguage() {
    this.hmsDataService.getApi(CommonApi.getLanguageList).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.languages = data.result;
        this.filterReport.patchValue({ language: 'ENG' })
      } else {
        this.languages = []
      }
      error => {
      }
    })
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
  onSelectedPlainNumberStart(selected: CompleterItem) {
    if (selected) {
      this.planNumberStart = (selected.originalObject.plansId).toString();
    } else {
      this.planNumberStart = '';
    }
  }
  onSelectedPlainNumberEnd(selected: CompleterItem) {
    if (selected) {
      this.planNumberEnd = (selected.originalObject.plansId).toString();
    } else {
      this.planNumberEnd = '';
    }
  }
  /**
   *  Predictive Search
   */
  getPredictivePlanNumberdSearch(completerService) {
    this.planNumberStartData = completerService.remote(
      null,
      "plansId",
      "plansId"
    );
    this.planNumberStartData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.planNumberStartData.urlFormater((term: any) => {
      return UftApi.planPredictiveSearch + `/${term}`;
    });
    this.planNumberStartData.dataField('result');
  }
  getPredictivePlanNumberEndSearch(completerService) {
    this.planNumberEndData = completerService.remote(
      null,
      "plansId",
      "plansId"
    );
    this.planNumberEndData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.planNumberEndData.urlFormater((term: any) => {
      return UftApi.planPredictiveSearch + `/${term}`;
    });
    this.planNumberEndData.dataField('result');
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

  resetFilters() {
    this.brokerCoId = '';
    this.brokerCoName = '';
    this.brokerPhoneNo = '';
    this.brokerEffectiveDate = '';
    this.brokerComission = '';
    this.brokerTerminationDate = '';
    this.brokerPreAuthPayment = '';
    this.brokerBalance = '';
    this.GridFilter26_confirmationNum = '';
    this.GridFilter26_cardNum = '';
    this.GridFilter26_cardholderName = '';
    this.GridFilter26_studentName = '';
    this.GridFilter26_studentDob = '';
    this.GridFilter26_planId = '';
    this.GridFilter26_age1 = '';
    this.GridFilter26_age2 = '';
    this.GridFilter26_studentEffDt = '';
    this.GridFilter26_studentExpDt = '';
    this.GridFilter26_age2Exp = '';
    this.GridFilter26_age1Exp = '';
    this.GridFilter26_cardNumber = '';
    this.GridFilter26_confirmationNumber = '';
    this.GridFilter26_serviceDate = '';
    this.GridFilter26_procCd = '';
    this.GridFilter26_amountSubmitted = '';
    this.GridFilter26_amountPaid = '';

    this.GridFilter26_amountNotPaid = '';
    this.GridFilter26_procDesc = '';
    this.GridFilter22_cardHolderName = '';
    this.GridFilter22_cardNumber = '';
    this.GridFilter22_address = ''
    this.GridFilter22_cityAddress = '';
    this.GridFilter22_planName = '';
    this.GridFilter22_personGender = '';
    this.GridFilter22_expiryDate = '';
    this.GridFilter22_effectiveDate = '';

    this.brokerId = ''
    this.brokerName = ''
    this.active = ''
    this.city = ''
    this.province = ''
    this.addLine1 = ''
    this.addLine2 = ''

    this.companyNum = '';
    this.companyName = '';
    this.companyCity = '';
    this.companyProvince = '';
    this.companyAddLine1 = '';
    this.companyAddLine2 = '';

    this.providerDiscipline = ''
    this.providerName = ''
    this.providerLicenseNum = ''
    this.providerCity = ''
    this.providerProvince = ''
    this.providerAddLine1 = ''
    this.providerAddLine2 = ''
    this.reportDataArray = ''
    this.reportDate = '';

    this.companyId = ''
    this.compName = ''
    this.cardNum = ''
    this.planId = ''
    this.itemServiceDate = ''
    this.paymentSumRunDate = ''
    this.bussType = ''
    this.covCatDesc = ''
    this.amountClaimed = ''

    this.GridFilter27_coId = ''
    this.GridFilter27_coName = ''
    this.GridFilter27_planId = ''
    this.GridFilter27_cardNumber = ''
    this.GridFilter27_cardholderName = ''
    this.GridFilter27_primaryCardholderName = ''
    this.GridFilter27_providerName = ''
    this.GridFilter27_paySumRunDt = ''
    this.GridFilter27_dentalAmountClaimed = ''
    this.GridFilter27_dentalAmountPaid = ''
    this.GridFilter27_visionAmountClaimed = ''
    this.GridFilter27_visionAmountPaid = ''
    this.GridFilter27_healthAmountClaimed = ''
    this.GridFilter27_healthAmountPaid = ''
    this.GridFilter27_drugAmountClaimed = ''
    this.GridFilter27_drugAmountPaid = ''
    this.GridFilter27_hsaAmountClaimed = ''
    this.GridFilter27_hsaAmountPaid = ''

    this.planNumberEnd = ''
    this.planNumberStart = ''
    this.GridFilter22_expiryDate = ''
    this.GridFilter22_cityAddress = ''
    this.GridFilter22_cardHolderName = ''
    this.GridFilter22_cardNumber = ''
    this.GridFilter22_address = ''
    this.GridFilter22_planName = ''
    this.GridFilter22_personGender = ''
    this.GridFilter22_effectiveDate = ''
    this.selectedBroker = ''
    this.selectedBrokerName = ''
    this.selecteBrokerId = ''

    this.GridFilter112_cardNumber = ''
    this.GridFilter112_problem = ''

    // Report ID 63 : Reset filters
    this.cardNumber = ''    
    this.cardHolderName = ''    
    this.cardHolderCity = ''    
    this.cardHolderProvince = ''
    this.cardHolderActive = ''
    this.cardHolderAddLine1 = ''
    this.cardHolderAddLine2 = '' 

    this.dentProvLicenseNum = ''
    this.cityName = '';
    this.provinceName = '';
    this.specialityType = '';
    this.specialityGroup = '';
    this.providerType = ''
    this.bussinessType = '';
    this.coverageCatDesc = '';
    this.claimedAmount = ''  
    this.providersName = ''
    this.provUli = ''
    this.provDiscipline = ''
    this.providerAddress = ''
    this.postalCode = ''
    this.provTelephone = ''
    this.language = ''

    this.gridFilter55_cardNum = ''
    this.gridFilter55_studentName = ''
    this.gridFilter55_studentDob = ''
    this.gridFilter55_schoolName = ''
    this.gridFilter55_schoolStartDate = ''
    this.gridFilter55_schoolEndDate = ''
    this.gridFilter55_age1 = ''
    this.gridFilter55_age2 = ''
    this.gridFilter55_age1Exp = ''
    this.gridFilter55_age2Exp = ''

    this.gridFilter62_companyId = ''
    this.gridFilter62_compName = ''
    this.gridFilter62_division = ''
    this.gridFilter62_singles = ''
    this.gridFilter62_families = ''
    this.gridFilter62_total = ''
    this.gridFilter62_divisionDate = ''

    this.GridFilter15_coId = '' 
    this.GridFilter15_coName = '' 
    this.GridFilter15_planId = '' 
    this.GridFilter15_dentalAmountClaimed = '' 
    this.GridFilter15_dentalAmountPaid = '' 
    this.GridFilter15_visionAmountClaimed = '' 
    this.GridFilter15_visionAmountPaid = '' 
    this.GridFilter15_healthAmountClaimed = '' 
    this.GridFilter15_healthAmountPaid = '' 
    this.GridFilter15_drugAmountClaimed = '' 
    this.GridFilter15_drugAmountPaid = '' 
    this.GridFilter15_hsaAmountClaimed = '' 
    this.GridFilter15_hsaAmountPaid = ''

    this.GridFilter15_planNo = ''
    this.GridFilter15_noOfProc = ''
    this.GridFilter15_amountClaimed = ''
    this.GridFilter15_professionalAmtPaid = ''
    this.GridFilter15_labPaid = ''
    this.GridFilter15_amountPaid = ''

    this.companyId = ''
    this.compName = ''
    this.email = ''
    this.searchProvince = ''
    this.searchCity = ''
    this.addressLineOne = ''
    this.lastName = ''
    this.firstName = ''
    this.searchCardNumber = ''
  }
  /**
     * Open Report Modal
     * @param reportID 
     */
  openReportModal(formData, reportID, tableHeading, isDisableTransactionType, isShowHideTransIsPositiveNegative) {
    this.resetFilters()
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
  openModalWithReportIDNew() {

    this.hmsDataService.OpenCloseModal('reportsListPopUpNew');
  }
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


    this.getDateWithinTenDay()
    this.getPastDateWithinTenDays()

    if (this.filterReport.value.asOfDate) {
      let dateInstring = this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.asOfDate);
      if(dateInstring != "" && dateInstring != null) {
        this.isFutureDate = this.changeDateFormatService.isFutureDate(dateInstring)
      }
      if (this.isFutureDate) {
        if (this.checkDate && this.filterReport.value.asOfDate) {
          this.error = this.changeDateFormatService.compareDatesWitinTenDays(this.checkDate.date, this.filterReport.value.asOfDate.date);
          if (this.error.isError == true) {
            this.filterReport.controls['asOfDate'].setErrors({
              "DateWithinTenDays": true
            });
          }
        }
      } else {
        if (this.pastDate && this.filterReport.value.asOfDate) {
          this.error = this.changeDateFormatService.comparePastDatesWitinTenDays(this.pastDate.date, this.filterReport.value.asOfDate.date);
          if (this.error.isError == true) {
            this.filterReport.controls['asOfDate'].setErrors({
              "DateWithinTenDays": true
            });
          }
        }
      }
    }

  }

  getDateWithinTenDay() {
    let todayDate = this.changeDateFormatService.getToday()
    let currDate = this.changeDateFormatService.convertDateObjectToString(todayDate)
    let dattmp = currDate.split('/').reverse().join('/');
    let nwdate = new Date(dattmp);

    let finalDateAfter = nwdate.setDate(nwdate.getDate() + 10);
    let abc = [nwdate.getDate(), nwdate.getMonth() + 1, nwdate.getFullYear()].join('/');
    let splittedDate = abc.split('/')
    let day = splittedDate[0].length == 1 ? "0" + splittedDate[0] : splittedDate[0]
    let month = splittedDate[1].length == 1 ? "0" + splittedDate[1] : splittedDate[1]
    let toDate = day + "/" + month + "/" + splittedDate[2]
    this.checkDate = this.changeDateFormatService.convertStringDateToObject(toDate)

  }

  getPastDateWithinTenDays() {
    let todayDate = this.changeDateFormatService.getToday()
    let currDate = this.changeDateFormatService.convertDateObjectToString(todayDate)
    let dattmp = currDate.split('/').reverse().join('/');
    let newDate = new Date(dattmp);
    let prevDateAfter = newDate.setDate(newDate.getDate() - 10);
    let pastDate = [newDate.getDate(), newDate.getMonth() + 1, newDate.getFullYear()].join('/');
    let splitDate = pastDate.split('/')
    let prevday = splitDate[0].length == 1 ? "0" + splitDate[0] : splitDate[0]
    let prevmonth = splitDate[1].length == 1 ? "0" + splitDate[1] : splitDate[1]
    let prevDate = prevday + "/" + prevmonth + "/" + splitDate[2]
    this.pastDate = this.changeDateFormatService.convertStringDateToObject(prevDate)
  }

  openModalWithReportID() {
    this.hmsDataService.OpenCloseModal('reportsListPopUp');
    setTimeout(() => {
      if (this.filterReportStartDate != undefined) {
        this.filterReportStartDate.setFocusToInputBox();
      }
    }, 400);
  }
  /**
   * Common Function For Reset All Reports
   * Grid Column Filter Search
   * @param tableId 
   */
  resetGridColumnSearchFilter(tableId: string) {
    this.columnFilterSearch = false;
    this.resetFilters()
    this.dataTableService.resetTableSearch();
    var ele: HTMLElement = document.getElementById(this.reportID + '-dataManagementReport') as HTMLElement;
    ele.click();
  }

  resetGridSearch(tableId) {
    switch (tableId) {
      case 'amountPaidReport':
        break;
    }
  }
  checkReportRow(reportID, uftReqData, tableHeading, isDisableTransactionType, isShowHideTransIsPositiveNegative) {
    if (isDisableTransactionType) {
      this.dropdownSettings = Constants.disabledMultiSelectDropdown;
    } else {
      this.dropdownSettings = Constants.multiSelectDropdown;
    }
    this.showHideNoDataFound = false;

    if (reportID == 55) {
      this.filterReport.controls.startDate.setErrors(null);
      this.filterReport.controls.company.setErrors(null)

    }

    if (reportID == 30 || reportID == 32) {
      this.filterReport.controls.startDate.setErrors(null);
      this.filterReport.controls.endDate.setErrors(null);
      this.filterReport.controls.cardNum.setErrors(null);
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == 22 || reportID == 26) {
      this.filterReport.controls.searchCompany.setErrors(null);
      this.filterReport.controls.company.setErrors(null);
    }

    if (reportID == 28) {
      this.filterReport.controls.searchCompany.setErrors(null);
      this.filterReport.controls.company.setErrors(null)
      this.searchCompanyMandatoryFlag = false;
    } else {
      this.searchCompanyMandatoryFlag = true;
    }
    if (reportID == 36) {
      this.filterReport.controls.startDate.setErrors(null);
      this.filterReport.controls.endDate.setErrors(null);
      this.filterReport.controls.searchCompany.setErrors(null);
      this.filterReport.controls.cardNum.setErrors(null)
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == 63) {
      this.filterReport.controls.startDate.setErrors(null);
      this.filterReport.controls.endDate.setErrors(null);
      this.filterReport.controls.searchCompany.setErrors(null);
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == 31) {
      this.filterReport.controls.startDate.setErrors(null);
      this.filterReport.controls.endDate.setErrors(null);
      this.filterReport.controls.searchCompany.setErrors(null);
      this.filterReport.controls.cardNum.setErrors(null)
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == 33) {
      this.filterReport.controls.startDate.setErrors(null);
      this.filterReport.controls.endDate.setErrors(null);
      this.filterReport.controls.cardNum.setErrors(null)
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == 62) {
      this.filterReport.controls.searchCompany.setErrors(null)
      this.filterReport.controls.cardNum.setErrors(null)
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == 66) {
      this.filterReport.controls.startDate.setErrors(null)
      this.filterReport.controls.endDate.setErrors(null)
      this.filterReport.controls.cardNum.setErrors(null)
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == -101) {
      this.filterReport.controls.startDate.setErrors(null)
      this.filterReport.controls.endDate.setErrors(null)
      this.filterReport.controls.cardNum.setErrors(null)
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == 18) {
      this.filterReport.controls.startDate.setErrors(null)
      this.filterReport.controls.endDate.setErrors(null)
      this.filterReport.controls.cardNum.setErrors(null)
      this.filterReport.controls.searchCompany.setErrors(null)
      this.filterReport.controls.company.setErrors(null)
    }
    if (reportID == 112) {
      this.filterReport.controls.startDate.setErrors(null)
      this.filterReport.controls.endDate.setErrors(null)
      this.filterReport.controls.cardNum.setErrors(null)
      this.filterReport.controls.company.setErrors(null)
    }
    if( reportID == 55) {
      this.filterReport.controls.searchCompany.setErrors(null)
    }

    let promise = new Promise((resolve, reject) => {
      switch (reportID) {
        case 55: //student status
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = 'Student Status';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'studentStatusList';
          this.showFilterFields = [
            { "startDate": false },
            { "asOfDate": true },
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": true },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": false }
          ];

          break;
        case 28: // Amount Paid By Company, Plan and Card
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = 'Amount Paid By Company, Plan and Card';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'amountPaidCompanyplancard';
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "planNumberStart": true },
            { "planNumberEnd": true },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false }
          ];
          break;

        case 22: // issue number 487 - Report(Cards by Company QSI.020)
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = 'Cards by Company';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'cardsbycompany';
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "sortingDirection": true },
            { "sortingOption": true },
            { "checkboxOption": true },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": false }
          ];
          this.filterColoumn = [
            { title: 'Company Name', data: 'coName' },
            { title: 'Company Number', data: 'coId' },
            { title: 'Transaction Code', data: 'tranCd' },
            { title: 'Amount', data: 'transAmt' }
          ];
          break;
        case 30:
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = 'Broker Report';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'brokerQsi';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": false }
          ];
          this.filterColoumn = [
            { title: 'Company No.', data: 'coId' },
            { title: 'Company Name', data: 'companyName' },
            { title: 'Effective Date', data: 'bcaeffectiveon' },
            { title: 'Commission Rate %', data: 'brokerCoCommisionRate' },
            { title: 'Termination Date', data: 'coterminatedon' },
            { title: 'Pre-Autherized Payment', data: 'coStandardPapAmt' },
            { title: 'Balance', data: 'balance' }
          ];

          break;
        case 26: // issue number 490 - QSI.063(Filters,Sorting,Excel,Listing)
          this.selecteCoKey = uftReqData.companyCoId;
          this.selectedCompanyName = uftReqData.compNameAndNo;
          this.reportPopUpTitle = this.translate.instant('dashboard.report.claimPaymentsByCardholder');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'claimpaymentbycardholder';
          this.showFilterFields = [
            { "startDate": true },
            { "endDate": true },
            { "searchCompany": false },
            { "transactionType": false },
            { "transactionIsPositiveNegative": false },
            { "transactionIsElectronicCheque": false },
            { "brokerNameOrNumber": false },
            { "divisionName": false },
            { "cardHolderNameOrNumber": true },
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
            { "cardNumber": true },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": false }
          ];
          this.filterColoumn = [
            { title: 'Card#', data: 'cardNumber' },
            { title: 'Conf-Number', data: 'confirmationNumber' },
            { title: 'Client Name', data: 'cardholderName' },
            { title: 'Service Date ', data: 'serviceDate' },
            { title: 'Procedure Code', data: 'procCd' },
            { title: 'Procedure Description ', data: 'procDesc' },
            { title: 'Amount Submitted', data: 'amountSubmitted' },
            { title: 'Amount Paid', data: 'amountPaid' },
            { title: 'Amount Not Paid', data: 'amountNotPaid' }
          ];
          break;

        case 36: /* Log #487 - Broker Mailing Labels */
          this.reportPopUpTitle = 'Broker Mailing Labels';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'brokerMailingLabels';
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
            { "businessType": false },
            { "companyStatus": false },
            { "coFlag": false },
            { "overrideReason": false },
            { "displayAddress": false },
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNumber": false },
            { "brokerCity": true },
            { "brokerProvince": true }
          ];
          this.filterColoumn = [
            { title: 'Broker Id', data: 'brokerId' },
            { title: 'Broker Name', data: 'brokerName' },
            { title: 'Broker Id & Name', data: 'brokerIdAndName' },
            { title: 'Province', data: 'province' },
            { title: 'City', data: 'city' },
            { title: 'Status', data: 'active' },
            { title: 'Address Line 1', data: 'addLine1' },
            { title: 'Address Line 2', data: 'addLine2' }
          ];
          break;

        /* Log #487 CardHolder Labels Report */
        case 63:
          this.reportPopUpTitle = 'Cardholder Labels';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'cardholderLabels';
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": true }
          ];
          this.filterColoumn = [
            { title: 'Card No.', data: 'cardNum' },
            { title: 'Cardholder Name', data: 'cardHolderName' },
            { title: 'City', data: 'city' },
            { title: 'Province', data: 'province' },
            { title: 'Status', data: 'active' },
            { title: 'Address Line 1', data: 'addLine1' },
            { title: 'Address Line 2', data: 'addLine2' }
          ];

          break;

        /* Log #487 Company Mailing Labels */
        case 32:
          this.reportPopUpTitle = 'Company Mailing Labels';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'companyMailingLabels';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false }
          ];
          this.filterColoumn = [
            { title: 'Company No.', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'City', data: 'city' },
            { title: 'Province', data: 'province' },
            { title: 'Address Line 1', data: 'addLine1' },
            { title: 'Address Line 2', data: 'addLine2' }
          ];
          break;

        /* Log #487 Service Provider Mailing Labels */
        case 31:
          this.reportPopUpTitle = 'Service Provider Mailing Labels';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'serviceProviderMailingLabels';
          this.getDiscipline()
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
            { "discipline": true },
            { "processorId": false },
            { "cardNumber": false },
            { "planNumberStart": false },
            { "planNumberEnd": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "providerName": true },
            { "providerLicenseNum": true }
          ];
          this.filterColoumn = [
            { title: 'Discipline', data: 'discipline' },
            { title: 'Provider Name', data: 'providerName' },
            { title: 'Provider License Num', data: 'providerLicenseNum' },
            { title: 'City', data: 'city' },
            { title: 'Province', data: 'province' },
            { title: 'Address Line 1', data: 'addLine1' },
            { title: 'Address Line 2', data: 'addLine2' }
          ];
          break;

        /* Log #487 Summary by Company, Plan, Card and Coverage */
        case 33:
          this.reportPopUpTitle = 'Summary by Company, Plan, Card and Coverage';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'summaryByCompanyPlanCardAndCoverage';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": true }
          ];
          this.filterColoumn = [
            { title: 'Company ID', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Card Num', data: 'cardNum' },
            { title: 'Plan ID', data: 'planId' },
            { title: 'Service Date', data: 'dcItemSeriveDate' },
            { title: 'Payment Sum Run Date', data: 'paymentSumRunDate' },
            { title: 'Business Type', data: 'businessTypeCd' },
            { title: 'Coverage Category Desc', data: 'dentCovCatDesc' },
            { title: 'Claimed Amount', data: 'amountClaimed' }
          ];

          break;

        /* Log #487 Card Count by Company */
        case 62:
          this.reportPopUpTitle = 'Card Count by Company';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'cardCountByCompanyList';
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
            { "cardNumber": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": false }
          ];
          this.filterColoumn = [
            { title: 'Company ID', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Plan ID', data: 'planId' },
            { title: 'Business Type', data: 'businessTypeCd' },
            { title: 'Coverage Category Desc', data: 'dentCovCatDesc' },
            { title: 'Claimed Amount', data: 'amountClaimed' }
          ];

          break;

        /* Log #487 Educational Status Letters */
        case 66:
          this.reportPopUpTitle = 'Educational Status Letters';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'educationalStatusLetters';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": true },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": true }
          ];
          
          this.filterColoumn = [
            { title: 'Company ID', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Plan ID', data: 'planId' },
            { title: 'Business Type', data: 'businessTypeCd' },
            { title: 'Coverage Category Desc', data: 'dentCovCatDesc' },
            { title: 'Claimed Amount', data: 'amountClaimed' }
          ];
          break;

        /* Log #487 FINANCIAL: Statement - Company Level/Annual Statement */
        case -101:
          this.reportPopUpTitle = 'FINANCIAL: Statement - Company Level/Annual Statement';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'financialStatementCompanyLevelAnnualStatement';
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": false }
          ];
          this.filterColoumn = [
            { title: 'Company ID', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Plan ID', data: 'planId' },
            { title: 'Business Type', data: 'businessTypeCd' },
            { title: 'Coverage Category Desc', data: 'dentCovCatDesc' },
            { title: 'Claimed Amount', data: 'amountClaimed' }
          ];
          break;

        /* Log #487 Service Provider List */
        case 18:
          this.reportPopUpTitle = this.translate.instant('dashboard.report.serviceProviderList');
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'serviceProvidersList';
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
            { "licenceNumber": true },
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
            { "cardNumber": false },
            { "planNumberStart": false },
            { "planNumberEnd": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
          ];
          this.filterColoumn = [
            { title: 'Company ID', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Plan ID', data: 'planId' },
            { title: 'Business Type', data: 'businessTypeCd' },
            { title: 'Coverage Category Desc', data: 'dentCovCatDesc' },
            { title: 'Claimed Amount', data: 'amountClaimed' }
          ];
          break;

        /* Log #1061: QSI.112 */
        case 112:
          if (reportID == 112) {
            this.filterReport.controls.endDate.setErrors(null);
            this.filterReport.controls.startDate.setErrors(null)
          }
          this.reportPopUpTitle = 'List of cards with problem for Akira Benefit';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'modifiedDASPPreauthClaimsList';
          this.showFilterFields = [
            { "startDate": false },
            { "endDate": false },
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
            { "transactionIsElectronicCheque": false },
            { "claimType": false },
            { "discipline": false },
            { "processorId": false },
            { "cardNumber": false },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false },
            { "cardNum": false }
          ];
          break;
          
        /* Log #487 Amount Paid by Company, Plan and Coverage Category */
        case -15:
          this.reportPopUpTitle = 'Amount Paid by Company, Plan and Coverage Category';
          this.showHideFilter = true;
          this.showReportList = false;
          this.tableId = 'amountPaidByCompanyPlanAndCoverageCategoryList';
          this.getDiscipline()
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
            { "transactionIsElectronicCheque": false },
            { "cardNumber": false },
            { "claimType": false },
            { "discipline": true },
            { "processorId": false },
            { "planNumberStart": true },
            { "planNumberEnd": true },
            { "sortingDirection": false },
            { "sortingOption": false },
            { "checkboxOption": false },
            { "asOfDate": false },
            { "brokerSearch": false }
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

  callSubmitButton() {
    this.columnFilterSearch = false;
    var ele: HTMLElement = document.getElementById(this.reportID + '-dataManagementReport') as HTMLElement;
    ele.click();
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
      this.selectedCoID = selected.originalObject.coId
      this.bussTypeCd = selected.originalObject.businessTypeCd
    } else {
      this.selectedCompanyName = ""
      this.selecteCoKey = ''
      this.selectedCoID = ''
      this.bussTypeCd = ''
    }
  }
  onBrokerNameSelected(selected: CompleterItem) {
    if (selected) {

      this.selectedBroker = selected.originalObject;
      this.selectedBrokerName = selected.originalObject.brokerName
      this.selecteBrokerId = selected.originalObject.brokerId

    } else {
      this.selectedBroker = "";
      this.selectedBrokerName = ""
      this.selecteBrokerId = ""
    }
  }
  /**
   * Submit Reports form
   */
  onSubmitReport(reportData) {
    this.reportData = reportData;
    let reportDataArray;
    if (this.reportID == 62) {
      this.filterReport.get('company').setValidators(Validators.required)
      this.filterReport.get('company').updateValueAndValidity();
    } else {
      this.filterReport.controls.company.setErrors(null)
    }
    if (this.reportID == 55) {
      this.filterReport.controls.endDate.setErrors(null)
      this.filterReport.get('asOfDate').setValidators(Validators.required)
      this.filterReport.get('asOfDate').updateValueAndValidity()
    } else {
      this.filterReport.controls.asOfDate.setErrors(null)
    }

    if (this.reportID == -101) {
      this.showReportList = true; // temporary for 487 
    }
    if (this.filterReport.valid) {
      this.showReportList = true;
      if (this.selectedCompanyName == '' && this.filterReport.value.searchCompany) {
        this.selectedCompanyName = this.filterReport.value.searchCompany
      }

      switch (this.reportID) {
        case 55: // Student Status   
          this.tableId = 'studentStatusList';
          reportDataArray = {
            'asOfDate': reportData.value.asOfDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.asOfDate) : '',
            'coId': this.selectedCoID
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 28:

          this.tableId = 'amountPaidCompanyplancard';
          reportDataArray = {
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'coId': reportData.value.cardNumber,
            "planStartRange": reportData.value.planNumberStart,
            "planEndRange": reportData.value.planNumberEnd,
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 22: // issue number 487 - Report(Cards by Company QSI.020)  
          this.tableId = 'cardsbycompany';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'companyNo': this.selectedCoID || '',
            "sortingDirection": reportData.value.sortingDirection,
            "sortingOption": reportData.value.sortingOption,
            "checkboxOption": reportData.value.checkboxOption
          }

          /** Eng Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;

        case 30:
          this.tableId = 'brokerQsi';
          reportDataArray = {
            "brokerId": this.selecteBrokerId || '',
            "coId": this.selectedCoID || '',

          }
          /** Eng Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;
        case 26: // issue number 490 - QSI.063(Filters,Sorting,Excel,Listing)  
          this.tableId = 'claimpaymentbycardholder';
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            "cardNumber": reportData.value.cardNumber,
            "cardHolderNameOrNumber": reportData.value.cardHolderNameOrNumber
          }
          /** Eng Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;

        /* Log #487 - Broker Mailing Labels Report */
        case 36:
          this.tableId = 'brokerMailingLabels';
          let brokerStatus = ""
          if (reportData.value.status == "active") {
            brokerStatus = "active"
          } else if (reportData.value.status == "inactive") {
            brokerStatus = "inactive"
          } else {
            brokerStatus = ""
          }
          reportDataArray = {
            "brokerId": this.selectedBrokerId,
            "brokerName": this.selectedBrokerName,
            "brokerIdAndName": "",
            "province": reportData.value.brokerProvince,
            "city": reportData.value.brokerCity,
            "active": brokerStatus
          }
          /** Eng Narrow Search */
          this.callReportGridApi(reportDataArray, this.reportID);
          break;

        /* Log #487 - Cardholder Labels */
        case 63:
          this.tableId = 'cardholderLabels';
          reportDataArray = {
            "cardNum": reportData.value.cardNum,
            "active": reportData.value.status,
            "cardHolderName": reportData.value.cardHolderName
          }
          this.callReportGridApi(reportDataArray, this.reportID)
          break;

        case 32:
          this.tableId = 'companyMailingLabels'
          reportDataArray = {
            "coId": this.selectedCoID,
            "coName": this.selectedCompanyName
          }
          this.callReportGridApi(reportDataArray, this.reportID)
          break;

        case 31:
          this.tableId = 'serviceProviderMailingLabels'
          reportDataArray = {
            "discipline": this.selectedDiscipline,
            "providerName": reportData.value.providerName,
            "providerLicenseNum": reportData.value.providerLicenseNum
          }
          this.callReportGridApi(reportDataArray, this.reportID)
          break;

        case 33:
          this.tableId = 'summaryByCompanyPlanCardAndCoverage'
          reportDataArray = {
            "coKey": this.selecteCoKey,
            "cardNum": reportData.value.cardNum
          }
          this.callReportGridApi(reportDataArray, this.reportID)
          break;

        case 62:
          this.tableId = 'cardCountByCompanyList'
          reportDataArray = {
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            "coId": this.selectedCoID
          }
          this.callReportGridApi(reportDataArray, this.reportID)
          break;

        case 66:
          this.tableId = 'educationalStatusLetters'
          reportDataArray = {
            "coKey": this.selecteCoKey
          }
          this.callReportGridApi(reportDataArray, this.reportID)
          break;

        case -101:
          this.tableId = 'financialStatementCompanyLevelAnnualStatement'
          reportDataArray = {
            "cokey": this.selecteCoKey
          }
          this.callReportGridApi(reportDataArray, this.reportID)
          break;

        case 18:
          this.tableId = 'serviceProvidersList'
          reportDataArray = {
            "city": reportData.value.brokerCity,
            "province": reportData.value.brokerProvince,
            "providerLicenseNum": reportData.value.licenceNumber,
            "specialtyGroup": reportData.value.specialtyGroup,
            "language": reportData.value.language,
            "providerType": reportData.value.providerType,
            "sortingDirection": reportData.value.sortingDirection,
            "discipline": reportData.value.disciplineSpec,
            "speciality": reportData.value.speciality,
            "sortingOption": reportData.value.sortingOption,
            "participant": reportData.value.participant,
            "excludeDrugCardProv": reportData.value.checkboxOption
          }
          this.callReportGridApi(reportDataArray, this.reportID)
          break;

        case 112: //Log #1061 
          reportDataArray = {
            'coId': this.compId 
          }
          if (!this.columnFilterSearch) {
            this.GridFilter112_cardNumber = '';
            this.GridFilter112_problem = '';
          }
          this.callReportGridApi(reportDataArray, this.reportID);
          break;

        case -15: // QSI.010
          this.tableId = 'amountPaidByCompanyPlanAndCoverageCategoryList';
          reportDataArray = {
            'endDate': reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.endDate) : '',
            'startDate': reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(reportData.value.startDate) : '',
            'coId': this.selectedCoID,
            "planStartRange": reportData.value.planNumberStart,
            "planEndRange": reportData.value.planNumberEnd,
            "discipline": reportData.value.discipline,
            "sortingDirection": reportData.value.sortingDirection,
            "sortingOption": reportData.value.sortingOption,
          }
          this.callReportGridApi(reportDataArray, this.reportID);
        break

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
        case 55: //STUDENT STATUS  
          this.filterColoumn = [
            { title: 'Card Number', data: 'cardNum' },
            { title: 'Student Name', data: 'studentName' },
            { title: 'Student DOB', data: 'studentDob' },
            { title: 'School Name', data: 'schoolName' },
            { title: 'School Start Date', data: 'studentEffDt' },
            { title: 'School End Date', data: 'studentExpDt' },
            { title: 'Age 1', data: 'age1' },
            { title: 'Age 2', data: 'age2' },
            { title: 'Age 1 Exp. Date', data: 'age1Exp' },
            { title: 'Age 2 Exp. Date', data: 'age2Exp' }
          ];

          reqParam = [
            { 'key': 'asOfDate', 'value': reportData.asOfDate },
            { 'key': 'coId', 'value': this.selectedCoID }
          ];

          if (this.columnFilterSearch) {
            reqParam[1].value = this.selectedCoID;
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNum', 'value': this.gridFilter55_cardNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'studentName', 'value': this.gridFilter55_studentName });
            reqParam = this.pushToArray(reqParam, { 'key': 'studentDob', 'value': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_studentDob) }),
            reqParam = this.pushToArray(reqParam, { 'key': 'schoolName', 'value': this.gridFilter55_schoolName })
            reqParam = this.pushToArray(reqParam, { 'key': 'studentEffDt', 'value': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_schoolStartDate) })
            reqParam = this.pushToArray(reqParam, { 'key': 'studentExpDt', 'value': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_schoolEndDate) })
            reqParam = this.pushToArray(reqParam, { 'key': 'age1', 'value': this.gridFilter55_age1 })
            reqParam = this.pushToArray(reqParam, { 'key': 'age2', 'value': this.gridFilter55_age2 })
            reqParam = this.pushToArray(reqParam, { 'key': 'age1Exp', 'value': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_age1Exp) })
            reqParam = this.pushToArray(reqParam, { 'key': 'age2Exp', 'value': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_age2Exp) })
          }
          /** End Narrow Search */
          var url = UftApi.studentStatus;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2, 4, 5, 8, 9], '', [], [], '', [0], [1, 2, 3, 4, 5, 6, 7], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          setTimeout(() => {
            this.dataTableService.errorResponse.subscribe(data => {
              if(data.hmsMessage.messageShort == "DATE_ENTERED_MUST_BE_WITHIN_10_DAYS_OF_CURRENT_DATE") {
                this.toastrService.error("As of Date Must Be Within 10 Days of Current Date")
              }
            })
          }, 1000);
          break;

        case 28: //STUDENT STATUS 

          reqParam = [
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'planStartRange', 'value': reportData.planStartRange },
            { 'key': 'planEndRange', 'value': reportData.planEndRange },
            { 'key': 'coId', 'value': this.selectedCoID },
            { 'key': 'businessTypeCd', 'value': this.selectedReportRowData.plantype }
          ];


          this.filterColoumn = [
            { title: 'Company Number', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Plan Number', data: 'planId' },
            { title: 'Dental Amount Claimed', data: 'dentalAmountClaimed' },
            { title: 'Dental Amount Paid', data: 'dentalAmountPaid' },
            { title: 'Vision Amount Claimed', data: 'visionAmountClaimed' },
            { title: 'Vision Amount Paid', data: 'visionAmountPaid' },
            { title: 'Health Amount Claimed', data: 'healthAmountClaimed' },
            { title: 'Health Amount Paid', data: 'healthAmountPaid' },
            { title: 'Drug Amount Claimed', data: 'drugAmountClaimed' },
            { title: 'Drug Amount Paid', data: 'drugAmountPaid' },
            { title: 'Hsa Amount Claimed', data: 'hsaAmountClaimed' },
            { title: 'Hsa Amount Paid', data: 'hsaAmountPaid' }
          ];
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': (this.GridFilter27_coId && this.GridFilter27_coId != "") ? this.GridFilter27_coId : this.selectedCoID });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.GridFilter27_coName });
            reqParam = this.pushToArray(reqParam, { 'key': 'planId', 'value': this.GridFilter27_planId });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': this.GridFilter27_cardNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardholderName', 'value': this.GridFilter27_cardholderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'providerName', 'value': this.GridFilter27_providerName });

            reqParam = this.pushToArray(reqParam, { 'key': 'dentalAmountClaimed', 'value': this.GridFilter27_dentalAmountClaimed });
            reqParam = this.pushToArray(reqParam, { 'key': 'dentalAmountPaid', 'value': this.GridFilter27_dentalAmountPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'visionAmountClaimed', 'value': this.GridFilter27_visionAmountClaimed });
            reqParam = this.pushToArray(reqParam, { 'key': 'visionAmountPaid', 'value': this.GridFilter27_visionAmountPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'healthAmountClaimed', 'value': this.GridFilter27_healthAmountClaimed });
            reqParam = this.pushToArray(reqParam, { 'key': 'healthAmountPaid', 'value': this.GridFilter27_healthAmountPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'drugAmountClaimed', 'value': this.GridFilter27_drugAmountClaimed });
            reqParam = this.pushToArray(reqParam, { 'key': 'drugAmountPaid', 'value': this.GridFilter27_drugAmountPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'hsaAmountClaimed', 'value': this.GridFilter27_hsaAmountClaimed });
            reqParam = this.pushToArray(reqParam, { 'key': 'hsaAmountPaid', 'value': this.GridFilter27_hsaAmountPaid });

          }
          /** End Narrow Search */
          var url = UftApi.amountPaidbyCoPlanQsi009;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [], '', [0], [1, 2, 4, 5], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        case 22: // issue number 487 - Report(Cards by Company QSI.020) 
          this.filterColoumn = [
            { title: 'Card Holder Name', data: 'cardHolderName' },
            { title: 'Card Number', data: 'cardNumber' },
            { title: 'Address', data: 'address' },
            { title: 'City Address', data: 'cityAddress' },
            { title: 'Plan Name', data: 'planName' },
            { title: 'Gender', data: 'personGender' },
            { title: 'Effective Date', data: 'effectiveDate' },
            { title: 'Expiry Date', data: 'expiryDate' }
          ];

          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'companyNo', 'value': this.selectedCoID },
            { 'key': 'sortingDirection', 'value': reportData.sortingDirection },
            { 'key': 'sortingOption', 'value': reportData.sortingOption },
            { 'key': 'checkboxOption', 'value': reportData.checkboxOption }
          ];


          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'cardHolderName', 'value': this.GridFilter22_cardHolderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': this.GridFilter22_cardNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'address', 'value': this.GridFilter22_address });
            reqParam = this.pushToArray(reqParam, { 'key': 'cityAddress', 'value': this.GridFilter22_cityAddress });
            reqParam = this.pushToArray(reqParam, { 'key': 'planName', 'value': this.GridFilter22_planName });
            reqParam = this.pushToArray(reqParam, { 'key': 'gender', 'value': this.GridFilter22_personGender });
            if (this.GridFilter22_effectiveDate && this.GridFilter22_effectiveDate != '') {
              reqParam = this.pushToArray(reqParam, { 'key': 'effectiveDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter22_effectiveDate) });
            } else {
              reqParam = this.pushToArray(reqParam, { 'key': 'effectiveDate', 'value': "" });
            }

            if (this.GridFilter22_expiryDate && this.GridFilter22_expiryDate != '') {
              reqParam = this.pushToArray(reqParam, { 'key': 'expiryDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter22_expiryDate) });
            } else {
              reqParam = this.pushToArray(reqParam, { 'key': 'expiryDate', 'value': "" });
            }

          }
          /** End Narrow Search */
          var url = UftApi.getCardsByCompany;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [6, 7], '', '', [], '', [0], '', []) // [1, 2, 3, 4, 5] these column should be right align as of now unable to do because params are missing in API
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 30:
          this.filterColoumn = [
            { title: 'Company No.', data: 'coId' },
            { title: 'Company Name', data: 'companyName' },
            { title: 'Effective Date', data: 'bcaeffectiveon' },
            { title: 'Commission Rate %', data: 'brokerCoCommisionRate' },
            { title: 'Termination Date', data: 'coterminatedon' },
            { title: 'Pre-Autherized Payment', data: 'coStandardPapAmt' },
            { title: 'Balance', data: 'balance' }
          ];

          reqParam = [
            { 'key': 'coId', 'value': this.selectedCoID || '' },
            { 'key': 'brokerId', 'value': this.selecteBrokerId || '' },
          ];



          if (this.columnFilterSearch) {
            let coId = this.selectedCoID
            if (this.brokerCoId && this.brokerCoId !== '') {
              coId = this.brokerCoId
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': coId }); reqParam = this.pushToArray(reqParam, { 'key': 'companyName', 'value': this.brokerCoName });
            reqParam = this.pushToArray(reqParam, { 'key': 'bcaeffectiveon', 'value': this.changeDateFormatService.convertDateObjectToString(this.brokerEffectiveDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerCoCommisionRate', 'value': this.brokerComission });
            reqParam = this.pushToArray(reqParam, { 'key': 'coterminatedon', 'value': this.changeDateFormatService.convertDateObjectToString(this.brokerTerminationDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'coStandardPapAmt', 'value': this.brokerPreAuthPayment });
            reqParam = this.pushToArray(reqParam, { 'key': 'balance', 'value': this.brokerBalance });
          }
          /** End Narrow Search */
          var url = UftApi.brokerQsi;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2], '', [6], [], '', [0], '', [])


          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;
        case 26:

          this.filterColoumn = [
            { title: this.translate.instant('dashboard.report.cardNumber'), data: 'cardNumber' },
            { title: this.translate.instant('dashboard.report.confirmationNumber'), data: 'confirmationNumber' },
            { title: this.translate.instant('dashboard.report.clientName'), data: 'cardholderName' },
            { title: this.translate.instant('dashboard.report.serviceDate'), data: 'serviceDate' },
            { title: this.translate.instant('dashboard.report.procedureCode'), data: 'procCd' },
            { title: this.translate.instant('dashboard.report.procedureDescription'), data: 'procDesc' },
            { title: this.translate.instant('dashboard.report.amountSubmitted'), data: 'amountSubmitted' },
            { title: this.translate.instant('dashboard.report.amountPaid'), data: 'amountPaid' },
            { title: this.translate.instant('dashboard.report.amountNotPaid'), data: 'amountNotPaid' }
          ];

          var chkey = [];
          if (this.selectedOverrideReason.length > 0) {
            for (var j = 0; j < this.selectedOverrideReason.length; j++) {
              chkey.push(this.selectedOverrideReason[j]['id'])
            }
          }

          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'cardNumber', 'value': reportData.cardNumber },
            { 'key': 'chkeys', 'value': chkey }
          ];

          if (this.columnFilterSearch) {
            let cardNum = reportData.cardNumber
            if (this.GridFilter26_cardNumber && this.GridFilter26_cardNumber != '') {
              cardNum = this.GridFilter26_cardNumber;
            } else {
              this.GridFilter26_cardNumber = reportData.cardNumber;
            }
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': cardNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'confirmationNumber', 'value': this.GridFilter26_confirmationNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardholderName', 'value': this.GridFilter26_cardholderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'serviceDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'procCd', 'value': this.GridFilter26_procCd });
            reqParam = this.pushToArray(reqParam, { 'key': 'procDesc', 'value': this.GridFilter26_procDesc });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountSubmitted', 'value': this.GridFilter26_amountSubmitted });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountPaid', 'value': this.GridFilter26_amountPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountNotPaid', 'value': this.GridFilter26_amountNotPaid });
          }
          /** End Narrow Search */
          var url = UftApi.claimPaymentsByCardholder;

          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [3], '', [6, 7, 8], [], '', [0], '', [])


          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        /* Broker Mailing Label Report(QSI.070) */
        case 36:
          this.filterColoumn = [
            { title: 'Broker Id', data: 'brokerId' },
            { title: 'Broker Name', data: 'brokerName' },
            { title: 'Province', data: 'province' },
            { title: 'City', data: 'city' },
            { title: 'Status', data: 'active' },
            { title: 'Address Line 1', data: 'addLine1' },
            { title: 'Address Line 2', data: 'addLine2' }
          ];

          reqParam = [
            { 'key': 'brokerId', 'value': this.selectedBrokerId },
            { 'key': 'brokerName', 'value': this.selectedBrokerName },
            { 'key': 'brokerIdAndName', 'value': '' },
            { 'key': 'province', 'value': reportData.province },
            { 'key': 'city', 'value': reportData.city },
            { 'key': 'active', 'value': reportData.active }
          ];

          if (this.columnFilterSearch) {
            let brokerId = this.selectedBrokerId
            if (this.brokerId && this.brokerId !== '') {
              brokerId = this.brokerId
            }

            // Change Request where filters works
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerId', 'value': brokerId });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerName', 'value': (this.brokerName != "" && this.brokerName) ? this.brokerName : this.selectedBrokerName });
            reqParam = this.pushToArray(reqParam, { 'key': 'brokerIdAndName', 'value': this.brokerIdAndName });
            reqParam = this.pushToArray(reqParam, { 'key': 'province', 'value': (this.province != "" && this.province) ? this.province : reportData.province });
            reqParam = this.pushToArray(reqParam, { 'key': 'city', 'value': (this.city != "" && this.city) ? this.city : reportData.city });
            reqParam = this.pushToArray(reqParam, { 'key': 'active', 'value': (this.active != "" && this.active) ? this.active : reportData.active })
            reqParam = this.pushToArray(reqParam, { 'key': 'addLine1', 'value': this.addLine1 });
            reqParam = this.pushToArray(reqParam, { 'key': 'addLine2', 'value': this.addLine2 });
          }

          /** End Narrow Search */
          var url = UftApi.getBrokerMailingLabelsUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [], [1, 2, 3, 4, 5, 6], '', [0], '', [1, 2, 3, 4, 5, 6])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        case 63:
          this.filterColoumn = [
            { title: 'Card Number', data: 'cardNum' },
            { title: 'Cardholder Name', data: 'cardHolderName' },
            { title: 'City', data: 'city' },
            { title: 'Province', data: 'province' },
            { title: 'Address Line 1', data: 'addLine1' },
            { title: 'Address Line 2', data: 'addLine2' }
          ];

          reqParam = [
            { 'key': 'cardNum', 'value': reportData.cardNum },
            { 'key': 'active', 'value': reportData.active },
            { 'key': 'cardHolderName', 'value': reportData.cardHolderName }
          ];

          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNum', 'value': (this.cardNumber && this.cardNumber != "") ? this.cardNumber : reportData.cardNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardHolderName', 'value': (this.cardHolderName && this.cardHolderName != "") ? this.cardHolderName : reportData.cardHolderName });
            reqParam = this.pushToArray(reqParam, { 'key': 'province', 'value': this.cardHolderProvince });
            reqParam = this.pushToArray(reqParam, { 'key': 'city', 'value': this.cardHolderCity });
            reqParam = this.pushToArray(reqParam, { 'key': 'active', 'value': (this.cardHolderActive && this.cardHolderActive != "") ? this.cardHolderActive : reportData.active })
            reqParam = this.pushToArray(reqParam, { 'key': 'addLine1', 'value': this.cardHolderAddLine1 });
            reqParam = this.pushToArray(reqParam, { 'key': 'addLine2', 'value': this.cardHolderAddLine2 });
          }
          /** End Narrow Search */
          var url = UftApi.getCardHolderMailingLabelsUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [], [], '', [0], '', [1, 2, 3, 4, 5])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        /* #487 Company Mailing Labels Report */
        case 32:
          this.filterColoumn = [
            { title: 'Company No.', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'City', data: 'city' },
            { title: 'Province', data: 'province' },
            { title: 'Address Line 1', data: 'addLine1' },
            { title: 'Address Line 2', data: 'addLine2' }
          ];

          reqParam = [
            { 'key': 'coId', 'value': reportData.coId },
            { 'key': 'coName', 'value': reportData.coName }
          ];

          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': (this.companyNum && this.companyNum != "") ? this.companyNum : reportData.coId });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': (this.companyName && this.companyName != "") ? this.companyName : reportData.coName });
            reqParam = this.pushToArray(reqParam, { 'key': 'city', 'value': this.companyCity })
            reqParam = this.pushToArray(reqParam, { 'key': 'province', 'value': this.companyProvince });
            reqParam = this.pushToArray(reqParam, { 'key': 'addLine1', 'value': this.companyAddLine1 });
            reqParam = this.pushToArray(reqParam, { 'key': 'addLine2', 'value': this.companyAddLine2 });
          }
          /** End Narrow Search */
          var url = UftApi.getCompanyMailingLabelsUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [], [], '', [0], '', [1, 2, 3, 4, 5])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        /* #487 Service Provider Mailing Labels Report */
        case 31:
          this.filterColoumn = [
            { title: 'Discipline', data: 'discipline' },
            { title: 'Provider Name', data: 'providerName' },
            { title: 'Provider License No.', data: 'providerLicenseNum' },
            { title: 'City', data: 'city' },
            { title: 'Province', data: 'province' },
            { title: 'Address Line 1', data: 'addLine1' },
            { title: 'Address Line 2', data: 'addLine2' }
          ];

          reqParam = [
            { 'key': 'discipline', 'value': reportData.discipline },
            { 'key': 'providerName', 'value': reportData.providerName },
            { 'key': 'providerLicenseNum', 'value': reportData.providerLicenseNum }
          ];

          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'discipline', 'value': (this.providerDiscipline && this.providerDiscipline != "") ? this.providerDiscipline : reportData.discipline });
            reqParam = this.pushToArray(reqParam, { 'key': 'providerName', 'value': (this.providerName && this.providerName != "") ? this.providerName : reportData.providerName });
            reqParam = this.pushToArray(reqParam, { 'key': 'providerLicenseNum', 'value': (this.providerLicenseNum && this.providerLicenseNum != "") ? this.providerLicenseNum : reportData.providerLicenseNum })
            reqParam = this.pushToArray(reqParam, { 'key': 'city', 'value': this.providerCity });
            reqParam = this.pushToArray(reqParam, { 'key': 'province', 'value': this.providerProvince });
            reqParam = this.pushToArray(reqParam, { 'key': 'addLine1', 'value': this.providerAddLine1 });
            reqParam = this.pushToArray(reqParam, { 'key': 'addLine2', 'value': this.providerAddLine2 });
          }

          /** End Narrow Search */
          var url = UftApi.getServiceProviderMailingLabelsUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [], [], '', [0], '', [1, 2, 3, 4, 5, 6])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        /* #487 */
        case 33:

          this.filterColoumn = [
            { title: 'Company ID', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Card Num', data: 'cardNum' },
            { title: 'Plan ID', data: 'planId' },
            { title: 'Service Date', data: 'dcItemSeriveDate' },
            { title: 'Payment Sum Run Date', data: 'paymentSumRunDate' },
            { title: 'Business Type', data: 'businessTypeCd' },
            { title: 'Coverage Category Desc', data: 'dentCovCatDesc' },
            { title: 'Claimed Amount', data: 'amountClaimed' }
          ];

          reqParam = [
            { 'key': 'coKey', 'value': reportData.coKey },
            { 'key': 'cardNum', 'value': reportData.cardNum },
          ];

          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.companyId });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.compName });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNum', 'value': (this.cardNum && this.cardNum != "") ? this.cardNum : reportData.cardNum });
            reqParam = this.pushToArray(reqParam, { 'key': 'planId', 'value': this.planId });
            reqParam = this.pushToArray(reqParam, { 'key': 'dcItemSeriveDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.itemServiceDate) })
            reqParam = this.pushToArray(reqParam, { 'key': 'paymentSumRunDate', 'value': this.changeDateFormatService.convertDateObjectToString(this.paymentSumRunDate) });
            reqParam = this.pushToArray(reqParam, { 'key': 'businessTypeCd', 'value': this.bussType });
            reqParam = this.pushToArray(reqParam, { 'key': 'dentCovCatDesc', 'value': this.covCatDesc });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountClaimed', 'value': this.amountClaimed });
          }
          var url = UftApi.getSummaryByCompanyPlanCardAndCoverageUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [4, 5], '', [], [], '', [0], '', [1, 2, 3, 4, 5, 6, 7, 8])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        /* #487 */
        case 62:

          this.filterColoumn = [
            { title: 'Company Name & No.', data: 'coIdCoName'},
            { title: 'Division', data: 'divIdDivName' },
            { title: 'Singles', data: 'countSingle' },
            { title: 'Families', data: 'countFamily' },
            { title: 'Total', data: 'countTotal' },
          ];

          reqParam = [
            { 'key': 'coId', 'value': reportData.coId }, 
            { 'key': 'businessType', 'value': this.bussTypeCd},
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate }
          ];
          
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': (this.gridFilter62_companyId && this.gridFilter62_companyId != "") ? this.gridFilter62_companyId : reportData.coId });
            reqParam = this.pushToArray(reqParam, { 'key': 'divIdDivName', 'value': this.gridFilter62_division });
            reqParam = this.pushToArray(reqParam, { 'key': 'countSingle', 'value': this.gridFilter62_singles });
            reqParam = this.pushToArray(reqParam, { 'key': 'countFamily', 'value': this.gridFilter62_families });
            reqParam = this.pushToArray(reqParam, { 'key': 'countTotal', 'value': this.gridFilter62_total })
          }
          var url = UftApi.cardCountByCompanyUrl; //uncomment for report filter issue
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [], [], '', [0], '', [1, 2, 3, 4])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        /* #487 Educational Status Letters */
        case 66:
          this.filterColoumn = [
            { title: 'Company ID', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Card Number', data: 'cardNumber' },
            { title: 'First Name', data: 'contactFirstName' },
            { title: 'Last Name', data: 'contactLastName' },
            { title: 'Address Line 1', data: 'mailAddressLine1' },
            { title: 'City', data: 'city' },
            { title: 'Province', data: 'province' },
            { title: 'Email', data: 'contactEmailAdd' }
          ];

          reqParam = [
            { 'key': 'coKey', 'value': reportData.coKey }
          ];


         if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.companyId });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.compName });
            reqParam = this.pushToArray(reqParam, { 'key': 'contactEmailAdd', 'value': this.email });
            reqParam = this.pushToArray(reqParam, { 'key': 'province', 'value': this.searchProvince });
            reqParam = this.pushToArray(reqParam, { 'key': 'city', 'value': this.searchCity });
            reqParam = this.pushToArray(reqParam, { 'key': 'mailAddressLine1', 'value': this.addressLineOne });
            reqParam = this.pushToArray(reqParam, { 'key': 'contactLastName', 'value': this.lastName });
            reqParam = this.pushToArray(reqParam, { 'key': 'contactFirstName', 'value': this.firstName });
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNumber', 'value': this.searchCardNumber });
          }
          var url = UftApi.educationalStatusLetter; // API will be change, now existing API used to show the data 
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [], [], '', [0], '', [1, 2, 3, 4, 5,6,7,8])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;


        /* #487 FINANCIAL: Statement - Company Level/Annual Statement */
        case -101:
          this.filterColoumn = [
            { title: 'Company ID', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Plan ID', data: 'planId' },
            { title: 'Business Type', data: 'businessTypeCd' },
            { title: 'Coverage Category Desc', data: 'dentCovCatDesc' },
            { title: 'Claimed Amount', data: 'amountClaimed' }
          ];

          reqParam = [
            { 'key': 'coKey', 'value': reportData.coKey }
          ];

          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': this.companyId });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.compName });
            reqParam = this.pushToArray(reqParam, { 'key': 'planId', 'value': this.planId });
            reqParam = this.pushToArray(reqParam, { 'key': 'businessTypeCd', 'value': this.bussType });
            reqParam = this.pushToArray(reqParam, { 'key': 'dentCovCatDesc', 'value': this.covCatDesc });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountClaimed', 'value': this.amountClaimed });
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [], [], '', [0], '', [1, 2, 3, 4, 5])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        /* #487 Service Provider List */
        case 18:
          this.filterColoumn = [
            { title: this.translate.instant('dashboard.report.providerNo'), data: 'dentProvLicenseNum' },
            { title: this.translate.instant('dashboard.report.providerName'), data: 'providerName'},
            { title: this.translate.instant('dashboard.report.uli'), data: 'dentProvUli'},
            { title: this.translate.instant('dashboard.report.specialty'), data: 'dentSpecialityTypeDesc' },
            { title: this.translate.instant('dashboard.report.discipline'), data: 'discipline'},
            { title: this.translate.instant('dashboard.report.address'), data: 'address' },
            { title: this.translate.instant('dashboard.report.postalCode'), data: 'postalCd'},
            { title: this.translate.instant('dashboard.report.telephone'), data: 'dentProvBillAddPhoneNum' },
            { title: this.translate.instant('dashboard.report.language'), data: 'languageCd' },
          ];

          let discVal;
          if (reportData.discipline != null) {
            if (reportData.discipline == 'All') {
              discVal = ''
            } else {
              discVal = reportData.discipline
            }
          } else {
            discVal = ''
          }
          reqParam = [
            { 'key': 'dentProvLicenseNum', 'value': (reportData.providerLicenseNum != null ? reportData.providerLicenseNum : '') },
            { 'key': 'cityName', 'value': (reportData.city != null ? reportData.city : '') },
            { 'key': 'provinceName', 'value': (reportData.province != null ? reportData.province : '') },
            { 'key': 'languageCd', 'value': (reportData.language != null ? reportData.language : '') },
            { 'key': 'dentSpecialityGrpDesc', 'value': (reportData.specialtyGroup != null ? reportData.specialtyGroup : '') },
            { 'key': 'dentProvTypeDesc', 'value': (reportData.providerType != null ? reportData.providerType : '') },
            { 'key': 'discipline', 'value': discVal },
            { 'key': 'dentSpecialityTypeDesc', 'value': (reportData.speciality != null ? reportData.speciality : '') },
            { 'key': 'sortingDirection', 'value': (reportData.sortingDirection != null ? reportData.sortingDirection : '') },
            { 'key': 'sortingOption', 'value': (reportData.sortingOption != null ? reportData.sortingOption : '') },
            { 'key': 'participant', 'value': (reportData.participant != null ? reportData.participant : '') },
            { 'key': 'excludeDrugCardProv', 'value': (reportData.excludeDrugCardProv == true ? 'T' : 'F') }
          ];
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'dentProvLicenseNum', 'value': (this.dentProvLicenseNum && this.dentProvLicenseNum != "") ? this.dentProvLicenseNum : reportData.providerLicenseNum});
            reqParam = this.pushToArray(reqParam, { 'key': 'providerName', 'value': (this.providersName && this.providersName != "") ? this.providersName : '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'dentProvUli', 'value': (this.provUli && this.provUli != "") ? this.provUli : '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'dentSpecialityTypeDesc', 'value': (this.specialityType && this.specialityType != "") ? this.specialityType : reportData.speciality });
            reqParam = this.pushToArray(reqParam, { 'key': 'discipline', 'value': (this.provDiscipline && this.provDiscipline != "") ? this.provDiscipline : discVal });
            reqParam = this.pushToArray(reqParam, { 'key': 'dentProvBillAddL1MailAdd', 'value': (this.providerAddress != null && this.providerAddress != "") ? this.providerAddress : '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'postalCd', 'value': (this.postalCode != null && this.postalCode != "") ? this.postalCode : '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'dentProvBillAddPhoneNum', 'value': (this.provTelephone != null && this.provTelephone != "") ? this.provTelephone : '' });
            reqParam = this.pushToArray(reqParam, { 'key': 'languageCd', 'value': this.language != null ? this.language : reportData.language });
          }
          var url = UftApi.serviceProviderReportUrl;
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [], [1, 2, 3, 4, 5, 6, 7, 8], '', [0])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

        case 112: // Log #1061 
          this.filterColoumn = [
            { title: 'Card Number', data: 'cardNum' },
            { title: 'Problem', data: 'problem' }
          ];
          reqParam = [
            { 'key': 'coId', 'value': reportData.coId },
          ];
          var url = UftApi.dirtyCardListForAkiraBenefitUrl;
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'cardNum', 'value': this.GridFilter112_cardNumber });
            reqParam = this.pushToArray(reqParam, { 'key': 'problem', 'value': this.GridFilter112_problem });
          }
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, '', '', [], [1])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

          case -15: // QSI.010

          reqParam = [
            { 'key': 'startDate', 'value': reportData.startDate },
            { 'key': 'endDate', 'value': reportData.endDate },
            { 'key': 'coId', 'value': this.selectedCoID },
            { 'key': 'planNoStart', 'value': reportData.planStartRange },
            { 'key': 'planNoEnd', 'value': reportData.planEndRange },
            { 'key': 'discipline', 'value': reportData.discipline },
            { 'key': 'sort', 'value': reportData.sortingDirection },
            { 'key': 'sortBy', 'value': reportData.sortingOption},
            { 'key': 'forPdf', 'value': ''}
          ];

          this.filterColoumn = [
            { title: 'Company Number', data: 'coId' },
            { title: 'Company Name', data: 'coName' },
            { title: 'Plan Number', data: 'planNo' },
            { title: 'No. of Proc', data: 'noOfProc' },
            { title: 'Amount Claimed', data: 'amountClaimed' },
            { title: 'Professional Fee Paid', data: 'professionalAmtPaid' },
            { title: 'Lab Paid', data: 'labPaid' },
            { title: 'Amount Paid', data: 'amountPaid' }
          ];
          if (this.columnFilterSearch) {
            reqParam = this.pushToArray(reqParam, { 'key': 'coId', 'value': (this.GridFilter15_coId && this.GridFilter15_coId != "") ? this.GridFilter15_coId : this.selectedCoID });
            reqParam = this.pushToArray(reqParam, { 'key': 'coName', 'value': this.GridFilter15_coName });
            reqParam = this.pushToArray(reqParam, { 'key': 'planNo', 'value': this.GridFilter15_planNo });
            reqParam = this.pushToArray(reqParam, { 'key': 'noOfProc', 'value': this.GridFilter15_noOfProc });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountClaimed', 'value': this.GridFilter15_amountClaimed });
            reqParam = this.pushToArray(reqParam, { 'key': 'professionalAmtPaid', 'value': this.GridFilter15_professionalAmtPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'labPaid', 'value': this.GridFilter15_labPaid });
            reqParam = this.pushToArray(reqParam, { 'key': 'amountPaid', 'value': this.GridFilter15_amountPaid });
          }
          /** End Narrow Search */
          var url = UftApi.amountPaidByCompanyPlanCvUrl
          if (!$.fn.dataTable.isDataTable('#' + this.tableId)) {
            this.dataTableService.jqueryDataTable(this.tableId, url, 'full_numbers', this.filterColoumn, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [], '', [4, 5, 6, 7], [1, 2, 3], '', [0], [1, 2, 3, 4, 5, 6, 7], [])
          } else {
            this.dataTableService.jqueryDataTableReload(this.tableId, url, reqParam)
          }
          break;

      }
    })
  }
  GridFilter22_expiryDatee(GridFilter22_expiryDate: any) {
    throw new Error("Method not implemented.");
  }
  GridFilter22_cityAddresss(GridFilter22_cityAddress: any) {
    throw new Error("Method not implemented.");
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


  getPredictiveBrokerSearchData(completerService) {
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      this.searchBrokerRemote = completerService.remote(
        null,
        "brokerId",
        "brokerName"
      );
      this.searchBrokerRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.searchBrokerRemote.urlFormater((term: any) => {
        return UftApi.getAllPredectiveBroker + `/${term}`;
      });
      this.searchBrokerRemote.dataField('result');
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
      this.searchBrokerRemote = completerService.remote(
        null,
        "brokerId",
        "brokerName"
      );
      this.searchBrokerRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.searchBrokerRemote.urlFormater((term: any) => {
        return UftApi.getAllPredectiveBroker + '/' + businessTypeKey + `/${term}`;
      });
      this.searchBrokerRemote.dataField('result');
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
      this.selectedCoID = ''
    }
  }
  /**
   * Call on blur the broker text box
   * @param filterReport 
   */
  onBrokerBlur(filterReport) {
    if (filterReport.value.searchBroker) {
      if (filterReport.value.searchBroker.includes(' / ')) {
        var splitBrokerName = filterReport.value.searchBroker.toString().split(' / ')
        if (splitBrokerName.length > 0) {
          this.selectedBrokerName = splitBrokerName[0];
          this.selecteBrokerId = splitBrokerName[1] || ''
        }
      } else {
        this.selectedBrokerName = ''
      }
    } else {
      this.selectedBroker = ''
      this.selectedBrokerName = ''
      this.selecteBrokerId = ''
    }
  }



  exportReportList() {
    var transCodeArray = []
    switch (this.reportID) {
      case 55: // Student Status
        if (this.dataTableService.totalRecords != undefined) {
          var URL = UftApi.studentStatusExcel;
          var reqParam = {
            "coId": this.selectedCoID,
            "asOfDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.asOfDate),
            'paramApplication': "HMS",
            'start': 0,
            'length': this.dataTableService.totalRecords
          }
          /** Start Narrow Search */
          if (this.columnFilterSearch) {
            reqParam[0].value = this.selectedCoID;
            reqParam = Object.assign(reqParam, { 'cardNum': this.gridFilter55_cardNum });
            reqParam = Object.assign(reqParam, { 'studentName': this.gridFilter55_studentName });
            reqParam = Object.assign(reqParam, { 'studentDob': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_studentDob) }),
            reqParam = Object.assign(reqParam, { 'schoolName': this.gridFilter55_schoolName })
            reqParam = Object.assign(reqParam, { 'studentEffDt': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_schoolStartDate) })
            reqParam = Object.assign(reqParam, { 'studentExpDt': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_schoolEndDate) })
            reqParam = Object.assign(reqParam, { 'age1': this.gridFilter55_age1 })
            reqParam = Object.assign(reqParam, { 'age2': this.gridFilter55_age2 })
            reqParam = Object.assign(reqParam, { 'age1Exp': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_age1Exp) })
            reqParam = Object.assign(reqParam, { 'age2Exp': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_age2Exp) })
          }
          /** End Narrow Search */
          if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParam);
              }
            });
          } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
            this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
              if (value) {
                this.exportFile(URL, reqParam);
              }
            });
          } else {
            this.exportFile(URL, reqParam);
          }
        } else {
          this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
        }
        break;

      case 22: // issue number 487 - Report(Cards by Company QSI.020)
        var URL = UftApi.getCardsByCompanyExport;
        var reqParam22 = {
          "start": 0,
          'length': this.dataTableService.totalRecords,
          "paramApplication": "HMS",
          "companyNo": this.selectedCoID,
          "startDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate),
          "endDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate),
          "sortingDirection": this.reportData.value.sortingDirection,
          "sortingOption": this.reportData.value.sortingOption,
          "checkboxOption": this.reportData.value.checkboxOption
        }

        if (this.columnFilterSearch) {
          reqParam22 = Object.assign(reqParam22, { 'cardHolderName': this.GridFilter22_cardHolderName });
          reqParam22 = Object.assign(reqParam22, { 'cardNumber': this.GridFilter22_cardNumber });
          reqParam22 = Object.assign(reqParam22, { 'address': this.GridFilter22_address });
          reqParam22 = Object.assign(reqParam22, { 'cityAddress': this.GridFilter22_cityAddress });
          reqParam22 = Object.assign(reqParam22, { 'planName': this.GridFilter22_planName });
          reqParam22 = Object.assign(reqParam22, { 'gender': this.GridFilter22_personGender });
          reqParam22 = Object.assign(reqParam22, { 'effectiveDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter22_effectiveDate) });
          reqParam22 = Object.assign(reqParam22, { 'expiryDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter22_expiryDate) });
        }
        /** End Narrow Search */
        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam22);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam22);
            }
          });
        } else {
          this.exportFile(URL, reqParam22);
        }
        break;
      case 30:  // broker Report
        var URL = UftApi.brokerQsiReport;

        this.filterColoumn = [
          { title: 'Company No.', data: 'coId' },
          { title: 'Company Name', data: 'companyName' },
          { title: 'Effective Date', data: 'bcaeffectiveon' },
          { title: 'Commission Rate %', data: 'brokerCoCommisionRate' },
          { title: 'Termination Date', data: 'coterminatedon' },
          { title: 'Pre-Autherized Payment', data: 'coStandardPapAmt' },
          { title: 'Balance', data: 'balance' }
        ];

        let reqParam30 =
          {
            'coId': this.selectedCoID || '',
            'brokerId': this.selecteBrokerId || '',
            'paramApplication': 'HMS',
            'start': 0,
            'length': this.dataTableService.totalRecords
          }
          ;


        if (this.columnFilterSearch) {
          reqParam30 = Object.assign(reqParam30, { 'coId': (this.brokerCoId && this.brokerCoId != "") ? this.brokerCoId : this.selectedCoID }); 
          reqParam30 = Object.assign(reqParam30, { 'companyName': this.brokerCoName });
          reqParam30 = Object.assign(reqParam30, { 'bcaeffectiveon': this.changeDateFormatService.convertDateObjectToString(this.brokerEffectiveDate) });
          reqParam30 = Object.assign(reqParam30, { 'brokerCoCommisionRate': this.brokerComission });
          reqParam30 = Object.assign(reqParam30, { 'coterminatedon': this.changeDateFormatService.convertDateObjectToString(this.brokerTerminationDate) });
          reqParam30 = Object.assign(reqParam30, { 'coStandardPapAmt': this.brokerPreAuthPayment });
          reqParam30 = Object.assign(reqParam30, { 'balance': this.brokerBalance });
        }
        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam30);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam30);
            }
          });
        } else {
          this.exportFile(URL, reqParam30);
        }
        break;
      case 26: // issue number 487 - Report(Cards by Company QSI.020)
        var URL = UftApi.claimPaymentsByCardholderReport;

        var chkey = [];
        if (this.selectedOverrideReason.length > 0) {
          for (var j = 0; j < this.selectedOverrideReason.length; j++) {
            chkey.push(this.selectedOverrideReason[j]['id'])
          }
        }

        var reqParam26 = {
          "start": 0,
          "length": this.dataTableService.totalRecords,
          "startDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate),
          "endDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate),
          "cardNumber": this.reportData.value.cardNumber,
          "chkeys": chkey,
          'paramApplication': 'HMS'
        }

        if (this.columnFilterSearch) {
          reqParam26 = Object.assign(reqParam26, { 'cardNumber': (this.GridFilter26_cardNumber && this.GridFilter26_cardNumber != "") ? this.GridFilter26_cardNumber : this.reportData.value.cardNumber });
          reqParam26 = Object.assign(reqParam26, { 'confirmationNumber': this.GridFilter26_confirmationNumber });
          reqParam26 = Object.assign(reqParam26, { 'cardholderName': this.GridFilter26_cardholderName });
          reqParam26 = Object.assign(reqParam26, { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
          reqParam26 = Object.assign(reqParam26, { 'procCd': this.GridFilter26_procCd });
          reqParam26 = Object.assign(reqParam26, { 'procDesc': this.GridFilter26_procDesc });
          reqParam26 = Object.assign(reqParam26, { 'amountSubmitted': this.GridFilter26_amountSubmitted });
          reqParam26 = Object.assign(reqParam26, { 'amountPaid': this.GridFilter26_amountPaid });
          reqParam26 = Object.assign(reqParam26, { 'amountNotPaid': this.GridFilter26_amountNotPaid });
        }

        /** End Narrow Search */
        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam26);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam26);
            }
          });
        } else {
          this.exportFile(URL, reqParam26);
        }
        break;

      /* Log #487 Broker Mailing Labels */
      case 36:  // broker Report
        var URL = UftApi.getBrokerMailingLabelsReportUrl; // have to change this API 

        let brokerStatus = ""
        if (this.reportData.value.status == "active") {
          brokerStatus = "active"
        } else if (this.reportData.value.status == "inactive") {
          brokerStatus = "inactive"
        } else {
          brokerStatus = ""
        }

        let reqParam36 =
          {
            'paramApplication': 'HMS',
            'brokerId': this.selectedBrokerId || '',
            'brokerName': this.selectedBrokerName,
            'brokerIdAndName': '',
            'province': this.reportData.value.brokerProvince,
            'city': this.reportData.value.brokerCity,
            'active': brokerStatus,
            'start': 0,
            'length': this.dataTableService.totalRecords,
          };

          if (this.columnFilterSearch) {
            reqParam36 = Object.assign(reqParam36, { 'brokerId': (this.brokerId && this.brokerId != "") ? this.brokerId : this.selectedBrokerId });
            reqParam36 = Object.assign(reqParam36, { 'brokerName': (this.brokerName && this.brokerName != "") ? this.brokerName : this.selectedBrokerName });
            reqParam36 = Object.assign(reqParam36, { 'brokerIdAndName': this.brokerIdAndName });
            reqParam36 = Object.assign(reqParam36, { 'province': (this.province && this.province != "") ? this.province : this.reportData.value.brokerProvince });
            reqParam36 = Object.assign(reqParam36, { 'city': (this.city && this.city != "") ? this.city : this.reportData.value.brokerCity });
            reqParam36 = Object.assign(reqParam36, { 'active': (this.active && this.active != "") ? this.active :  brokerStatus })
            reqParam36 = Object.assign(reqParam36, { 'addLine1': this.addLine1 });
            reqParam36 = Object.assign(reqParam36, { 'addLine2': this.addLine2 });
          }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam36);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam36);
            }
          });
        } else {
          this.exportFile(URL, reqParam36);
        }
        break;

      /* Cardholder Labels Excel Report */
      case 63:
        var URL = UftApi.getCardHolderMailingLabelsReportUrl;

        let reqParam63 =
          {
            'paramApplication': 'HMS',
            "cardNum": this.reportData.value.cardNum,
            "cardHolderName": this.reportData.value.cardHolderName,
            "active": this.reportData.value.status,
            'start': 0,
            'length': this.dataTableService.totalRecords
          };

          if (this.columnFilterSearch) {
            reqParam63 = Object.assign(reqParam63, { 'cardNum': (this.cardNumber && this.cardNumber != "") ? this.cardNumber : this.reportData.value.cardNum });
            reqParam63 = Object.assign(reqParam63, { 'cardHolderName': (this.cardHolderName && this.cardHolderName != "") ? this.cardHolderName : this.reportData.value.cardHolderName });
            reqParam63 = Object.assign(reqParam63, { 'province': this.cardHolderProvince });
            reqParam63 = Object.assign(reqParam63, { 'city': this.cardHolderCity });
            reqParam63 = Object.assign(reqParam63, { 'active': (this.cardHolderActive && this.cardHolderActive != "") ? this.cardHolderActive : this.reportData.value.status })
            reqParam63 = Object.assign(reqParam63, { 'addLine1': this.cardHolderAddLine1 });
            reqParam63 = Object.assign(reqParam63, { 'addLine2': this.cardHolderAddLine2 });
          }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam63);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam63);
            }
          });
        } else {
          this.exportFile(URL, reqParam63);
        }
        break;

      /* #487 Company Mailing Labels Excel Report */
      case 32:
        var URL = UftApi.getCompanyMailingLabelsReportUrl;
        let reqParam32 =
          {
            'paramApplication': 'HMS',
            "coId": this.selectedCoID,
            "coName": this.selectedCompanyName,
            'start': 0,
            'length': this.dataTableService.totalRecords
          };

          if (this.columnFilterSearch) {
            reqParam32 = Object.assign(reqParam32, { 'coId': (this.companyNum && this.companyNum != "") ? this.companyNum : this.selectedCoID });
            reqParam32 = Object.assign(reqParam32, { 'coName': (this.companyName && this.companyName != "") ? this.companyName : this.selectedCompanyName });
            reqParam32 = Object.assign(reqParam32, { 'city': this.companyCity })
            reqParam32 = Object.assign(reqParam32, { 'province': this.companyProvince });
            reqParam32 = Object.assign(reqParam32, { 'addLine1': this.companyAddLine1 });
            reqParam32 = Object.assign(reqParam32, { 'addLine2': this.companyAddLine2 });
          }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam32);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam32);
            }
          });
        } else {
          this.exportFile(URL, reqParam32);
        }
        break;

      /* #487 Service Provider Mailing Labels Excel Report */
      case 31:
        var URL = UftApi.getServiceProviderMailingReportUrl;
        let reqParam31 =
          {
            'paramApplication': 'HMS',
            "discipline": this.reportData.value.discipline,
            "providerName": this.reportData.value.providerName,
            "providerLicenseNum": this.reportData.value.providerLicenseNum,
            'start': 0,
            'length': this.dataTableService.totalRecords
          };

          if (this.columnFilterSearch) {
            reqParam31 = Object.assign(reqParam31, { 'discipline': (this.providerDiscipline && this.providerDiscipline != "") ? this.providerDiscipline : this.reportData.value.discipline });
            reqParam31 = Object.assign(reqParam31, { 'providerName': (this.providerName && this.providerName != "") ? this.providerName : this.reportData.value.providerName });
            reqParam31 = Object.assign(reqParam31, { 'providerLicenseNum': (this.providerLicenseNum && this.providerLicenseNum != "") ? this.providerLicenseNum : this.reportData.value.providerLicenseNum })
            reqParam31 = Object.assign(reqParam31, { 'city': this.providerCity });
            reqParam31 = Object.assign(reqParam31, { 'province': this.providerProvince });
            reqParam31 = Object.assign(reqParam31, { 'addLine1': this.providerAddLine1 });
            reqParam31 = Object.assign(reqParam31, { 'addLine2': this.providerAddLine2 });
          }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam31);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam31);
            }
          });
        } else {
          this.exportFile(URL, reqParam31);
        }
        break;

      /* #487 Summary by Company, Plan, Card and Coverage Excel Report */
      case 33:
        var URL = UftApi.getSummaryByCompanyPlanCardAndCoverageReportUrl;
        let reqParam33 =
          {
            'paramApplication': 'HMS',
            "coKey": this.selecteCoKey,
            "cardNum": this.reportData.value.cardNum,
            'start': 0,
            'length': this.dataTableService.totalRecords
          };
          if (this.columnFilterSearch) {
            reqParam33 = Object.assign(reqParam33, { 'coId': this.companyId });
            reqParam33 = Object.assign(reqParam33, { 'coName': this.compName });
            reqParam33 = Object.assign(reqParam33, { 'cardNum': (this.cardNum && this.cardNum != "") ? this.cardNum : this.reportData.value.cardNum });
            reqParam33 = Object.assign(reqParam33, { 'planId': this.planId });
            reqParam33 = Object.assign(reqParam33, { 'dcItemSeriveDate': this.changeDateFormatService.convertDateObjectToString(this.itemServiceDate) })
            reqParam33 = Object.assign(reqParam33, { 'paymentSumRunDate': this.changeDateFormatService.convertDateObjectToString(this.paymentSumRunDate) });
            reqParam33 = Object.assign(reqParam33, { 'businessTypeCd': this.bussType });
            reqParam33 = Object.assign(reqParam33, { 'dentCovCatDesc': this.covCatDesc });
            reqParam33 = Object.assign(reqParam33, { 'amountClaimed': this.amountClaimed });
          }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam33);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam33);
            }
          });
        } else {
          this.exportFile(URL, reqParam33);
        }
        break;

      /* #487 Card Count By Company Excel Report */
      case 62:
        var URL = UftApi.cardCountByCompanyExcelUrl;
        let reqParam62 =
          {
            'paramApplication': 'HMS',
            "startDate": this.reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate) : '',
            "endDate": this.reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate) : '',
            "coId": this.selectedCoID,
            "businessType": this.bussTypeCd,
            'start': 0,
            'length': this.dataTableService.totalRecords,
          };
          
          if (this.columnFilterSearch) {
            reqParam62 = Object.assign(reqParam62, { 'coId' : (this.gridFilter62_companyId && this.gridFilter62_companyId != "") ? this.gridFilter62_companyId : this.selectedCoID });
            reqParam62 = Object.assign(reqParam62, { 'divIdDivName' : this.gridFilter62_division });
            reqParam62 = Object.assign(reqParam62, { 'countSingle' : this.gridFilter62_singles });
            reqParam62 = Object.assign(reqParam62, { 'countFamily' : this.gridFilter62_families });
            reqParam62 = Object.assign(reqParam62, { 'countTotal' : this.gridFilter62_total })
          }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam62);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam62);
            }
          });
        } else {
          this.exportFile(URL, reqParam62);
        }
        break;

      /* #487 Educational Status Letters Excel Report */
      case 66:
        var URL = UftApi.educationalStatusLetterExcel;
        let reqParam66 =
          {
            'paramApplication': 'HMS',
            "coKey": this.selecteCoKey,
            'start': 0,
            'length': this.dataTableService.totalRecords
          };
          if (this.columnFilterSearch) {
            reqParam66 = Object.assign(reqParam66, { 'coId': this.companyId });
            reqParam66 = Object.assign(reqParam66, { 'coName': this.compName });
            reqParam66 = Object.assign(reqParam66, {  'contactEmailAdd': this.email });
            reqParam66 = Object.assign(reqParam66, {  'province': this.searchProvince });
            reqParam66 = Object.assign(reqParam66,{ 'city': this.searchCity });
            reqParam66 = Object.assign(reqParam66, {  'mailAddressLine1': this.addressLineOne });
            reqParam66 = Object.assign(reqParam66, {  'contactLastName': this.lastName });
            reqParam66 = Object.assign(reqParam66, {  'contactFirstName': this.firstName });
            reqParam66 = Object.assign(reqParam66, {  'cardNumber': this.searchCardNumber });
          }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam66);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam66);
            }
          });
        } else {
          this.exportFile(URL, reqParam66);
        }
        break;

      /* #487 FINANCIAL: Statement - Company Level/Annual Statement Excel Report */
      case -101:
        let reqParam101 =
          {
            'paramApplication': 'HMS',
            "coKey": this.selecteCoKey,
            'start': 0,
            'length': this.dataTableService.totalRecords
          };

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam101);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam101);
            }
          });
        } else {
          this.exportFile(URL, reqParam101);
        }
        break;

      /* #487 Service Provider List Excel Report */
      case 18:
        var URL = UftApi.serviceProviderReportExcelUrl;
        let discVal;
        if (this.reportData.value.disciplineSpec != null) {
          if (this.reportData.value.disciplineSpec == 'All') {
            discVal = ''
          } else {
            discVal = this.reportData.value.disciplineSpec
          }
        } else {
          discVal = ''
        }
        let reqParam18 =
          {
            'paramApplication': 'HMS',
            'start': 0,
            'length': this.dataTableService.totalRecords,
            'dentProvLicenseNum': (this.reportData.value.licenceNumber != null ? this.reportData.value.licenceNumber : ''),
            'cityName': this.reportData.value.brokerCity != null ? this.reportData.value.brokerCity : '',
            'provinceName': this.reportData.value.brokerProvince != null ? this.reportData.value.brokerProvince : '',
            'languageCd': (this.reportData.value.language != null ? this.reportData.value.language : ''),
            'dentSpecialityGrpDesc': (this.reportData.value.specialtyGroup != null ? this.reportData.value.specialtyGroup : ''),
            'dentProvTypeDesc':(this.reportData.value.providerType != null ? this.reportData.value.providerType : ''),
            'discipline': discVal,
            'dentSpecialityTypeDesc': this.reportData.value.speciality != null ? this.reportData.value.speciality : '',
            'sortingDirection': this.reportData.value.sortingDirection != null ? this.reportData.value.sortingDirection : '',
            'sortingOption': this.reportData.value.sortingOption != null ? this.reportData.value.sortingOption : '',
            'participant': this.reportData.value.participant != null ? this.reportData.value.participant : '',
            'excludeDrugCardProv': this.reportData.value.checkboxOption == true ? 'T' : 'F'
          };
          
          if (this.columnFilterSearch) {
            reqParam18 = Object.assign(reqParam18, { 'dentProvLicenseNum': (this.dentProvLicenseNum && this.dentProvLicenseNum != "") ? this.dentProvLicenseNum : this.reportData.value.licenceNumber });
            reqParam18 = Object.assign(reqParam18, { 'providerName': (this.providersName && this.providersName != "") ? this.providersName : '' });
            reqParam18 = Object.assign(reqParam18, { 'dentProvUli': (this.provUli && this.provUli != "") ? this.provUli : '' });
            reqParam18 = Object.assign(reqParam18, { 'dentSpecialityTypeDesc': (this.specialityType && this.specialityType != "") ? this.specialityType : this.reportData.value.speciality });
            reqParam18 = Object.assign(reqParam18, { 'discipline': (this.provDiscipline && this.provDiscipline != "") ? this.provDiscipline : discVal });
            reqParam18 = Object.assign(reqParam18, { 'dentProvBillAddL1MailAdd': (this.providerAddress != null && this.providerAddress != "") ? this.providerAddress : '' });
            reqParam18 = Object.assign(reqParam18, { 'postalCd': (this.postalCode != null && this.postalCode != "") ? this.postalCode : '' });
            reqParam18 = Object.assign(reqParam18, { 'dentProvBillAddPhoneNum': (this.provTelephone != null && this.provTelephone != "") ? this.provTelephone : '' });
            reqParam18 = Object.assign(reqParam18, { 'languageCd': this.language != null ? this.language : this.reportData.value.language });
          }
        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam18);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam18);
            }
          });
        } else {
          this.exportFile(URL, reqParam18);
        }
        break;

      /* Log #1061 Excel Report */
      case 112:
        var URL = UftApi.akiraBenefitDirtyDataExcelUrl;
        let reqParam112 =
          {
            'paramApplication': 'HMS',
            "coId": this.compId,
            'start': 0,
            'length': this.dataTableService.totalRecords
          };

        if (this.columnFilterSearch) {
          reqParam112 = Object.assign(reqParam112, { 'cardNum': this.GridFilter112_cardNumber });
          reqParam112 = Object.assign(reqParam112, { 'problem': this.GridFilter112_problem });
        }

        if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam112);
            }
          });
        } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
          this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
            if (value) {
              this.exportFile(URL, reqParam112);
            }
          });
        } else {
          this.exportFile(URL, reqParam112);
        }
        break;

      /* Log #487: 010 Excel file Report */
      case -15:
      var URL = UftApi.amountPaidByCompanyPlanCvExcelUrl;
       let reqParam15 = {
          'paramApplication': 'HMS',
          "start": 0,
          "length": this.dataTableService.totalRecords,
          'startDate' : this.reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate) : '',
          'endDate' : this.reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate) : '',
          'coId' : this.selectedCoID,
          'planNoStart' : this.reportData.value.planStartRange,
          'planNoEnd' : this.reportData.value.planEndRange,
          'discipline' : this.reportData.value.discipline,
          'sort' : this.reportData.value.sortingDirection,
          'sortBy' : this.reportData.value.sortingOption,
          'forPdf': ""         
        }

        if (this.columnFilterSearch) {
          reqParam15 = Object.assign(reqParam15, { 'coId' : (this.GridFilter15_coId && this.GridFilter15_coId != "") ? this.GridFilter15_coId : this.selectedCoID });
          reqParam15 = Object.assign(reqParam15, { 'coName' : this.GridFilter15_coName });
          reqParam15 = Object.assign(reqParam15, { 'planNo' : this.GridFilter15_planNo });
          reqParam15 = Object.assign(reqParam15, { 'noOfProc' : this.GridFilter15_noOfProc });
          reqParam15 = Object.assign(reqParam15, { 'amountClaimed' : this.GridFilter15_amountClaimed });
          reqParam15 = Object.assign(reqParam15, { 'professionalAmtPaid' : this.GridFilter15_professionalAmtPaid });
          reqParam15 = Object.assign(reqParam15, { 'labPaid' : this.GridFilter15_labPaid });
          reqParam15 = Object.assign(reqParam15, { 'amountPaid' : this.GridFilter15_amountPaid });
        }

      if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
        this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
          if (value) {
            this.exportFile(URL, reqParam15);
          }
        });
      } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
        this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
          if (value) {
            this.exportFile(URL, reqParam15);
          }
        });
      } else {
        this.exportFile(URL, reqParam15);
      }
      break;

      /* Log #487: QSI.009 Excel file Report added */
      case 28:
      var URL = UftApi.amountPaidbyCoPlanQsi009Report;
        let reqParam28 = {
          'paramApplication': 'HMS',
          "start": 0,
          "length": this.dataTableService.totalRecords,
          'endDate': this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate),
          'startDate': this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate),
          'coId': this.selectedCoID,
          'businessTypeCd': this.selectedReportRowData.plantype,
          'planStartRange': this.reportData.planStartRange,
          'planEndRange': this.reportData.planEndRange,
        }

        if (this.columnFilterSearch) {
          reqParam28 = Object.assign(reqParam28, { 'coId': (this.GridFilter27_coId && this.GridFilter27_coId != "") ? this.GridFilter27_coId : this.selectedCoID });
          reqParam28 = Object.assign(reqParam28, { 'coName': this.GridFilter27_coName });
          reqParam28 = Object.assign(reqParam28, { 'planId': this.GridFilter27_planId });
          reqParam28 = Object.assign(reqParam28, { 'cardNumber': this.GridFilter27_cardNumber });
          reqParam28 = Object.assign(reqParam28, { 'cardholderName': this.GridFilter27_cardholderName });
          reqParam28 = Object.assign(reqParam28, { 'providerName': this.GridFilter27_providerName });
          reqParam28 = Object.assign(reqParam28, { 'dentalAmountClaimed': this.GridFilter27_dentalAmountClaimed });
          reqParam28 = Object.assign(reqParam28, { 'dentalAmountPaid': this.GridFilter27_dentalAmountPaid });
          reqParam28 = Object.assign(reqParam28, { 'visionAmountClaimed': this.GridFilter27_visionAmountClaimed });
          reqParam28 = Object.assign(reqParam28, { 'visionAmountPaid': this.GridFilter27_visionAmountPaid });
          reqParam28 = Object.assign(reqParam28, { 'healthAmountClaimed': this.GridFilter27_healthAmountClaimed });
          reqParam28 = Object.assign(reqParam28, { 'healthAmountPaid': this.GridFilter27_healthAmountPaid });
          reqParam28 = Object.assign(reqParam28, { 'drugAmountClaimed': this.GridFilter27_drugAmountClaimed });
          reqParam28 = Object.assign(reqParam28, { 'drugAmountPaid': this.GridFilter27_drugAmountPaid });
          reqParam28 = Object.assign(reqParam28, { 'hsaAmountClaimed': this.GridFilter27_hsaAmountClaimed });
          reqParam28 = Object.assign(reqParam28, { 'hsaAmountPaid': this.GridFilter27_hsaAmountPaid });
        }

      if (this.dataTableService.totalRecords > this.currentUserService.maxLengthForExcel) {
        this.exDialog.openConfirm(this.translate.instant('common.greaterThanMaxMsg')).subscribe((value) => {
          if (value) {
            this.exportFile(URL, reqParam28);
          }
        });
      } else if (this.dataTableService.totalRecords > this.currentUserService.minLengthForExcel && this.dataTableService.totalRecords <= this.currentUserService.maxLengthForExcel) {
        this.exDialog.openConfirm(this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')).subscribe((value) => {
          if (value) {
            this.exportFile(URL, reqParam28);
          }
        });
      } else {
        this.exportFile(URL, reqParam28);
      }
      break;

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
      var ele: HTMLElement = document.getElementById(this.reportID + '-dataManagementReport') as HTMLElement;
    }
    ele.click();
  }

  /**
  * Export excel for reports
  * @param URL 
  * @param reqParamPlan 
  */
  exportFile(URL, reqParamPlan) {

    this.showPageLoader = false
    this.loaderPlaceHolder = "Loading File....."
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
* Initialize the reports list columns and get the reports list 
*/
  reportsListDataTableInitialize() {

    this.reportListShowHide = true;
    this.ObservableReportsListObj = Observable.interval(1000).subscribe(x => {

      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.reportsListColumns = [
          { title: this.translate.instant('uft.dashboard.financeReports.reportName'), data: 'reportname' },
          { title: this.translate.instant('uft.dashboard.financeReports.reportNumber'), data: 'reportnumber' },
        ] //reportdesc
        this.ObservableReportsListObj.unsubscribe();
         if(this.getReports){   // Report tiles api hitting issue fixed
        this.getReportsList()
      }
      }
    });
  }

  /**
   * Get Reports List
   */
  getReportsList() {
    var reqParam = [{
      "key": "reportType", value: "DMD"
    }]
    var url = DataManagementDashboardApi.reportList;
    var tableId = "reportsList_datamangement"
    if (!$.fn.dataTable.isDataTable('#reportsList_datamangement')) {
      this.dataTableService.jqueryDataTable(tableId, url, 'full_numbers', this.reportsListColumns, this.currentUserService.defaultRecordsGrid, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, 10, '', "", 7, '', [1])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
       this.getReports = false;   // Report tiles api hitting issue fixed 
    }
    return false;
  }



  resetReportForm() {
    this.filterReport.reset();
    this.selectedCompany = ''
    this.selectedCompanyName = ''
    this.selecteCoKey = ''
    this.selectedCoID = ''
    this.selectedCompanyStatus = '';
    this.selectedUFT = '';
    this.columnFilterSearch = false;
    this.selectedBrokerId = ""
    this.selectedBrokerName = ""
    this.selectedDiscipline = ""
  }

  /**
   * open report popup
   * @param selectedReportRow 
   */
  openSelectedReportPopup(selectedReportRow) {
    let formData = ''
    if (selectedReportRow != undefined) {
      this.reportID = selectedReportRow.reportid;
      if (this.reportID == 23) {
        this.reportID = -23;
      }
      this.callReportWithReportIdDM(this.reportID)
    }
  }

  callReportWithReportIdDM(reportID) {

    this.openReportWithReportIdDM.next(reportID)
  }


  dowloadPDFReport() {

    let transCodeArray = [];
    var requestParam = {};
    switch (this.reportID) {
      case 55: //Student Status
        this.showPageLoader = true;
        requestParam =
          {
            'length': this.dataTableService.totalRecords,
            'coId': this.selectedCoID,
            'asOfDate': this.changeDateFormatService.convertDateObjectToString(this.reportData.value.asOfDate),
          }
        if (this.columnFilterSearch) {
          requestParam[1].value = this.selectedCoID;
          requestParam = Object.assign(requestParam, { 'cardNum': this.gridFilter55_cardNum });
          requestParam = Object.assign(requestParam, { 'studentName': this.gridFilter55_studentName });
          requestParam = Object.assign(requestParam, { 'studentDob': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_studentDob) }),
          requestParam = Object.assign(requestParam, { 'schoolName': this.gridFilter55_schoolName })
          requestParam = Object.assign(requestParam, { 'studentEffDt': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_schoolStartDate) })
          requestParam = Object.assign(requestParam, { 'studentExpDt': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_schoolEndDate) })
          requestParam = Object.assign(requestParam, { 'age1': this.gridFilter55_age1 })
          requestParam = Object.assign(requestParam, { 'age2': this.gridFilter55_age2 })
          requestParam = Object.assign(requestParam, { 'age1Exp': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_age1Exp) })
          requestParam = Object.assign(requestParam, { 'age2Exp': this.changeDateFormatService.convertDateObjectToString(this.gridFilter55_age2Exp) })
        }
        /** End Narrow Search */
        var url = UftApi.studentStatus;

        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: 'Card Number', dataKey: 'cardNum' },
              { title: 'Student Name', dataKey: 'studentName' },
              { title: 'Student DOB', dataKey: 'studentDob' },
              { title: 'School Name', dataKey: 'schoolName' }, // As of now schoolName commented when backend confirm then enable it
              { title: 'School Start Date', dataKey: 'studentEffDt' },
              { title: 'School End Date', dataKey: 'studentExpDt' },
              { title: 'Age 1', dataKey: 'age1' },
              { title: 'Age 2', dataKey: 'age2' },
              { title: 'Age 1 Exp. Date', dataKey: 'age1Exp' },
              { title: 'Age 2 Exp. Date', dataKey: 'age2Exp' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            let claimPaymentsByCardholderArray = [];
            for (var i in rows) {
              body.push({
                "cardNum": rows[i].cardNum,
                "studentName": rows[i].studentName,
                "studentDob": rows[i].studentDob,
                "schoolName": rows[i].schoolName,
                "studentEffDt": rows[i].studentEffDt,
                "studentExpDt": rows[i].studentExpDt,
                "age1": rows[i].age1,
                "age2": rows[i].age2,
                "age1Exp": rows[i].age1Exp,
                "age2Exp": rows[i].age2Exp,
              });
            }

            let endDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '');
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "cardNum": { halign: 'left' },
                "studentName": { halign: 'right' },
                "studentDob": { halign: 'right' },
                "schoolName": { halign: 'right' },
                "studentEffDt": { halign: 'right' },
                "studentExpDt": { halign: 'right' },
                "age1": { halign: 'right' },
                "age2": { halign: 'right' },
                "age1Exp": { halign: 'right' },
                "age2Exp": { halign: 'right' }
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
      case 28:


        this.showPageLoader = true;
        requestParam =
          {
            "start": 0,
            'length': this.dataTableService.totalRecords,
            'endDate': this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate),
            'startDate': this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate),
            'coId': this.selectedCoID,
            'businessTypeCd': this.selectedReportRowData.plantype,
            'planStartRange': this.reportData.planStartRange,
            'planEndRange': this.reportData.planEndRange,
          }

        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'coId': (this.GridFilter27_coId && this.GridFilter27_coId != "") ? this.GridFilter27_coId : this.selectedCoID });
          requestParam = Object.assign(requestParam, { 'coName': this.GridFilter27_coName });
          requestParam = Object.assign(requestParam, { 'planId': this.GridFilter27_planId });
          requestParam = Object.assign(requestParam, { 'cardNumber': this.GridFilter27_cardNumber });
          requestParam = Object.assign(requestParam, { 'cardholderName': this.GridFilter27_cardholderName });
          requestParam = Object.assign(requestParam, { 'providerName': this.GridFilter27_providerName });
          requestParam = Object.assign(requestParam, { 'dentalAmountClaimed': this.GridFilter27_dentalAmountClaimed });
          requestParam = Object.assign(requestParam, { 'dentalAmountPaid': this.GridFilter27_dentalAmountPaid });
          requestParam = Object.assign(requestParam, { 'visionAmountClaimed': this.GridFilter27_visionAmountClaimed });
          requestParam = Object.assign(requestParam, { 'visionAmountPaid': this.GridFilter27_visionAmountPaid });
          requestParam = Object.assign(requestParam, { 'healthAmountClaimed': this.GridFilter27_healthAmountClaimed });
          requestParam = Object.assign(requestParam, { 'healthAmountPaid': this.GridFilter27_healthAmountPaid });
          requestParam = Object.assign(requestParam, { 'drugAmountClaimed': this.GridFilter27_drugAmountClaimed });
          requestParam = Object.assign(requestParam, { 'drugAmountPaid': this.GridFilter27_drugAmountPaid });
          requestParam = Object.assign(requestParam, { 'hsaAmountClaimed': this.GridFilter27_hsaAmountClaimed });
          requestParam = Object.assign(requestParam, { 'hsaAmountPaid': this.GridFilter27_hsaAmountPaid });
        }
        /** End Narrow Search */
        var url = UftApi.amountPaidbyCoPlanQsi009;

        /** End Narrow Search */

        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: 'Company Number', dataKey: 'coId' },
              { title: 'Company Name', dataKey: 'coName' },
              { title: 'Plan Number', dataKey: 'planId' },
              { title: 'Dental Amount Claimed', dataKey: 'dentalAmountClaimed' },
              { title: 'Dental Amount Paid', dataKey: 'dentalAmountPaid' },
              { title: 'Vision Amount Claimed', dataKey: 'visionAmountClaimed' },
              { title: 'Vision Amount Paid', dataKey: 'visionAmountPaid' },
              { title: 'Health Amount Claimed', dataKey: 'healthAmountClaimed' },
              { title: 'Health Amount Paid', dataKey: 'healthAmountPaid' },
              { title: 'Drug Amount Claimed', dataKey: 'drugAmountClaimed' },
              { title: 'Drug Amount Paid', dataKey: 'drugAmountPaid' },
              { title: 'Hsa Amount Claimed', dataKey: 'hsaAmountClaimed' },
              { title: 'Hsa Amount Paid', dataKey: 'hsaAmountPaid' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            let claimPaymentsByCardholderArray = [];
            for (var i in rows) {
              body.push({
                "coId": rows[i].coId,
                "coName": rows[i].coName,
                "planId": rows[i].planId,
                "dentalAmountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].dentalAmountClaimed),
                "dentalAmountPaid": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].dentalAmountPaid),
                "visionAmountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].visionAmountClaimed),
                "visionAmountPaid": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].visionAmountPaid),
                "healthAmountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].healthAmountClaimed),
                "healthAmountPaid": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].healthAmountPaid),
                "drugAmountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].drugAmountClaimed),
                "drugAmountPaid": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].drugAmountPaid),
                "hsaAmountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].hsaAmountClaimed),
                "hsaAmountPaid": this.currentUserService.convertAmountToDecimalWithDoller(rows[i].hsaAmountPaid),
              });
            }

            let endDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '');
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coId": { halign: 'left' },
                "coName": { halign: 'right' },
                "planId": { halign: 'right' },
                "dentalAmountClaimed": { halign: 'right' },
                "dentalAmountPaid": { halign: 'right' },
                "visionAmountClaimed": { halign: 'right' },
                "visionAmountPaid": { halign: 'right' },
                "healthAmountClaimed": { halign: 'right' },
                "healthAmountPaid": { halign: 'right' },
                "drugAmountClaimed": { halign: 'right' },
                "drugAmountPaid": { halign: 'right' },
                "hsaAmountClaimed": { halign: 'right' },
                "hsaAmountPaid": { halign: 'right'}
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

      case 22: // issue number 487 - Report(Cards by Company QSI.020)
        this.showPageLoader = true;
        requestParam = {
          "start": 0,
          "length": this.dataTableService.totalRecords,
          "startDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate),
          "endDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate),
          "companyNo": this.selectedCoID,
          "sortingDirection": this.reportData.value.sortingDirection,
          "sortingOption": this.reportData.value.sortingOption,
          "checkboxOption": this.reportData.value.checkboxOption
        }
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'cardHolderName': this.GridFilter22_cardHolderName });
          requestParam = Object.assign(requestParam, { 'cardNumber': this.GridFilter22_cardNumber });
          requestParam = Object.assign(requestParam, { 'address': this.GridFilter22_address });
          requestParam = Object.assign(requestParam, { 'cityAddress': this.GridFilter22_cityAddress });
          requestParam = Object.assign(requestParam, { 'planName': this.GridFilter22_planName });
          requestParam = Object.assign(requestParam, { 'gender': this.GridFilter22_personGender });
          requestParam = Object.assign(requestParam, { 'effectiveDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter22_effectiveDate) });
          requestParam = Object.assign(requestParam, { 'expiryDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter22_expiryDate) });
        }
        /** End Narrow Search */
        var url = UftApi.getCardsByCompany;
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: 'Card Holder Name', dataKey: 'cardHolderName' },
              { title: 'Card Number', dataKey: 'cardNumber' },
              { title: 'Address', dataKey: 'address' },
              { title: 'City Address', dataKey: 'cityAddress' },
              { title: 'Plan Name', dataKey: 'planName' },
              { title: 'Gender', dataKey: 'personGender' },
              { title: 'Effective Date', dataKey: 'effectiveDate' },
              { title: 'Expiry Date', dataKey: 'expiryDate' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            let claimPaymentsByCardholderArray = [];
            for (var i in rows) {
              body.push({
                "cardHolderName": rows[i].cardHolderName,
                "cardNumber": rows[i].cardNumber,
                "address": rows[i].address,
                "cityAddress": rows[i].cityAddress,
                "planName": rows[i].planName,
                "personGender": rows[i].personGender,
                "effectiveDate": rows[i].effectiveDate != null ? this.changeDateFormatService.changeDateByMonthName(rows[i].effectiveDate) : '',
                "expiryDate": rows[i].expiryDate != null ? this.changeDateFormatService.changeDateByMonthName(rows[i].expiryDate) : '',
              });
            }

            let startDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate))
            let endDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.endDate))
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': startDate +' - '+endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "cardHolderName": { halign: 'left' },
                "cardNumber": { halign: 'right' },
                "address": { halign: 'right' },
                "cityAddress": { halign: 'right' },
                "planName": { halign: 'right' },
                "personGender": { halign: 'right' },
                "effectiveDate": { halign: 'right' },
                "expiryDate": { halign: 'right' }
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

      case 30:
        this.filterColoumn = [
          { title: 'Company No.', data: 'coId' },
          { title: 'Company Name', data: 'companyName' },
          { title: 'Phone No.', data: 'brokerContactPhoneNum' },
          { title: 'Effective Date', data: 'bcaeffectiveon' },
          { title: 'Commission Rate %', data: 'brokerCoCommisionRate' },
          { title: 'Termination Date', data: 'coterminatedon' },
          { title: 'Pre-Autherized Payment', data: 'coStandardPapAmt' },
          { title: 'Balance', data: 'balance' }
        ];
        this.showPageLoader = true;
        requestParam = {
          "length": this.dataTableService.totalRecords,
          "brokerId": this.selecteBrokerId,
          "coId": this.selectedCoID
        }
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'coId': (this.brokerCoId && this.brokerCoId != "") ? this.brokerCoId : this.selectedCoID }); 
          requestParam = Object.assign(requestParam, { 'companyName': this.brokerCoName });
          requestParam = Object.assign(requestParam, { 'bcaeffectiveon': this.changeDateFormatService.convertDateObjectToString(this.brokerEffectiveDate) });
          requestParam = Object.assign(requestParam, { 'brokerCoCommisionRate': this.brokerComission });
          requestParam = Object.assign(requestParam, { 'coterminatedon': this.changeDateFormatService.convertDateObjectToString(this.brokerTerminationDate) });
          requestParam = Object.assign(requestParam, { 'coStandardPapAmt': this.brokerPreAuthPayment });
          requestParam = Object.assign(requestParam, { 'balance': this.brokerBalance });
        }
        /** End Narrow Search */
        var url = UftApi.brokerQsi;
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: 'Company No.', dataKey: 'coId' },
              { title: 'Company Name', dataKey: 'companyName' },
              { title: 'Phone No.', dataKey: 'brokerContactPhoneNum' },
              { title: 'Effective Date', dataKey: 'bcaeffectiveon' },
              { title: 'Commission Rate %', dataKey: 'brokerCoCommisionRate' },
              { title: 'Termination Date', dataKey: 'coterminatedon' },
              { title: 'Pre-Autherized Payment', dataKey: 'coStandardPapAmt' },
              { title: 'Balance', dataKey: 'balance' }
            ];

            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            let claimPaymentsByCardholderArray = [];
            for (var i in rows) {
              body.push({
                "coId": rows[i].coId,
                "companyName": rows[i].companyName,
                "brokerContactPhoneNum": rows[i].brokerContactPhoneNum,
                "bcaeffectiveon": this.changeDateFormatService.changeDateByMonthName(rows[i].bcaeffectiveon),
                "brokerCoCommisionRate": rows[i].brokerCoCommisionRate,
                "coterminatedon": rows[i].coterminatedon,
                "coStandardPapAmt": rows[i].coStandardPapAmt,
                "balance": rows[i].balance,
              });
            }

            let endDate = this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) || '';
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coId": { halign: 'left' },
                "companyName": { halign: 'right' },
                "brokerContactPhoneNum": { halign: 'right' },
                "bcaeffectiveon": { halign: 'right' },
                "brokerCoCommisionRate": { halign: 'right' },
                "coterminatedon": { halign: 'right' },
                "coStandardPapAmt": { halign: 'right' },
                "balance": { halign: 'right' }
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

        break

      case 26:

        var chkey = [];
        if (this.selectedOverrideReason.length > 0) {
          for (var j = 0; j < this.selectedOverrideReason.length; j++) {
            chkey.push(this.selectedOverrideReason[j]['id'])
          }
        }

        this.showPageLoader = true;

        requestParam = {
          "startDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate),
          "endDate": this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate),
          "cardNumber": this.reportData.value.cardNumber,
          "chkeys": chkey

        }
        if (this.columnFilterSearch) {
          let cardNum = this.reportData.value.cardNumber
          if (this.GridFilter26_cardNumber && this.GridFilter26_cardNumber != '') {
            cardNum = this.GridFilter26_cardNumber;
          } else {
            cardNum = this.reportData.value.cardNumber;
          }
          requestParam = Object.assign(requestParam, { 'cardNumber': cardNum });
          requestParam = Object.assign(requestParam, { 'confirmationNumber': this.GridFilter26_confirmationNumber });
          requestParam = Object.assign(requestParam, { 'cardholderName': this.GridFilter26_cardholderName });
          requestParam = Object.assign(requestParam, { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.GridFilter26_serviceDate) });
          requestParam = Object.assign(requestParam, { 'procCd': this.GridFilter26_procCd });
          requestParam = Object.assign(requestParam, { 'procDesc': this.GridFilter26_procDesc });
          requestParam = Object.assign(requestParam, { 'amountSubmitted': this.GridFilter26_amountSubmitted });
          requestParam = Object.assign(requestParam, { 'amountPaid': this.GridFilter26_amountPaid });
          requestParam = Object.assign(requestParam, { 'amountNotPaid': this.GridFilter26_amountNotPaid });
        }


        /** End Narrow Search */
        var url = UftApi.claimPaymentsByCardholder;
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: this.translate.instant('dashboard.report.cardNumber'), dataKey: 'cardNumber' },
              { title: this.translate.instant('dashboard.report.confirmationNumber'), dataKey: 'confirmationNumber' },
              { title: this.translate.instant('dashboard.report.clientName'), dataKey: 'cardholderName' },
              { title: this.translate.instant('dashboard.report.serviceDate'), dataKey: 'serviceDate' },
              { title: this.translate.instant('dashboard.report.procedureCode'), dataKey: 'procCd' },
              { title: this.translate.instant('dashboard.report.procedureDescription'), dataKey: 'procDesc' },
              { title: this.translate.instant('dashboard.report.amountSubmitted'), dataKey: 'amountSubmitted' },
              { title: this.translate.instant('dashboard.report.amountPaid'), dataKey: 'amountPaid' },
              { title: this.translate.instant('dashboard.report.amountNotPaid'), dataKey: 'amountNotPaid' }
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
                  "cardNumber": rows[i].cardNumber,
                  "cardNumArray": [
                    {
                      "confirmationNumber": rows[i].confirmationNumber,
                      "confNumArray": [
                        {
                          "confirmationNumber": rows[i].confirmationNumber,
                          "cardholderName": rows[i].cardholderName,
                          "serviceDate": rows[i].serviceDate,
                          "procCd": rows[i].procCd,
                          "procDesc": rows[i].procDesc,
                          "amountSubmitted": rows[i].amountSubmitted,
                          "amountPaid": rows[i].amountPaid,
                          "amountNotPaid": rows[i].amountNotPaid,
                        }
                      ]
                    }
                  ]
                })
              } else {
                let checkChildIndex = claimPaymentsByCardholderArray[checkMainIndex].cardNumArray.findIndex(x => x.confirmationNumber == rows[i].confirmationNumber);
                if (checkChildIndex == -1) {
                  claimPaymentsByCardholderArray[checkMainIndex].cardNumArray.push({
                    "confirmationNumber": rows[i].confirmationNumber,
                    "confNumArray": [
                      {
                        "confirmationNumber": rows[i].confirmationNumber,
                        "cardholderName": rows[i].cardholderName,
                        "serviceDate": rows[i].serviceDate,
                        "procCd": rows[i].procCd,
                        "procDesc": rows[i].procDesc,
                        "amountSubmitted": rows[i].amountSubmitted,
                        "amountPaid": rows[i].amountPaid,
                        "amountNotPaid": rows[i].amountNotPaid,
                      }
                    ]
                  });
                } else {
                  claimPaymentsByCardholderArray[checkMainIndex].cardNumArray[checkChildIndex].confNumArray.push({
                    "confirmationNumber": rows[i].confirmationNumber,
                    "cardholderName": rows[i].cardholderName,
                    "serviceDate": rows[i].serviceDate,
                    "procCd": rows[i].procCd,
                    "procDesc": rows[i].procDesc,
                    "amountSubmitted": rows[i].amountSubmitted,
                    "amountPaid": rows[i].amountPaid,
                    "amountNotPaid": rows[i].amountNotPaid,
                  });
                }
              }
            }
            var body = [];
            var head = [];
            //Row For Total Amount Show
            var amount_submitted_total = 0;
            var amount_paid_total = 0;
            var amount_notPaid_total = 0;

            var grand_amount_submitted_total = 0;
            var grand_amount_paid_total = 0;
            var grand_amount_notPaid_total = 0;

            for (var i in claimPaymentsByCardholderArray) {
              body.push({
                "cardNumber": { 'content': claimPaymentsByCardholderArray[i].cardNumber, 'colSpan': 9 },
                "confirmationNumber": "",
                "cardholderName": "",
                "serviceDate": "",
                "procCd": "",
                "procDesc": "",
                "amountSubmitted": "",
                "amountPaid": "",
                "amountNotPaid": "",
              });
              if (claimPaymentsByCardholderArray[i].cardNumArray.length > 0) {
                for (var k in claimPaymentsByCardholderArray[i].cardNumArray) {
                  if (claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray.length > 0) {
                    for (var j in claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray) {
                      if (j == '0') {
                        body.push({
                          "coId": ' ',
                          "confirmationNumber": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].confirmationNumber,
                          "cardholderName": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].cardholderName,
                          "serviceDate": this.changeDateFormatService.changeDateByMonthName(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].serviceDate),
                          "procCd": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procCd,
                          "procDesc": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procDesc,
                          "amountSubmitted": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted) : '$ 0.0',
                          "amountPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid) : '$ 0.0',
                          "amountNotPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid) : '$ 0.0',
                        });
                      } else {
                        body.push({
                          "coId": ' ',
                          "confirmationNumber": ' ',
                          "cardholderName": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].cardholderName,
                          "serviceDate": this.changeDateFormatService.changeDateByMonthName(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].serviceDate),
                          "procCd": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procCd,
                          "procDesc": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].procDesc,
                          "amountSubmitted": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted) : '$ 0.0',
                          "amountPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid) : '$ 0.0',
                          "amountNotPaid": claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid != '' ? this.currentUserService.convertAmountToDecimalWithDoller(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid) : '$ 0.0'
                        });
                      }

                      amount_submitted_total = amount_submitted_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountSubmitted);

                      amount_paid_total = amount_paid_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountPaid);

                      amount_notPaid_total = amount_notPaid_total + parseFloat(claimPaymentsByCardholderArray[i].cardNumArray[k].confNumArray[j].amountNotPaid);
                    }
                  }
                }
              }
              body.push({
                "coId": '',
                "confirmationNumber": { 'content': 'Total For: ' + claimPaymentsByCardholderArray[i].cardNumber, halign: 'right', 'colSpan': 5 },
                "cardholderName": '',
                "serviceDate": '',
                "procCd": ' ',
                "procDesc": ' ',
                "amountSubmitted": { 'content': amount_submitted_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_submitted_total) : '$ 0.00', 'colSpan': 1 },
                "amountPaid": { 'content': amount_paid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_paid_total) : '$ 0.00', 'colSpan': 1 },
                "amountNotPaid": { 'content': amount_notPaid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(amount_notPaid_total) : '$ 0.00', 'colSpan': 1 },
              });
              grand_amount_submitted_total = amount_submitted_total;
              grand_amount_paid_total = amount_paid_total;
              grand_amount_notPaid_total = amount_notPaid_total;
            }

            body.push({
              "coId": '',
              "confirmationNumber": { 'content': 'GRAND TOTAL', 'colSpan': 5, halign: 'right', styles: { fontStyle: 'bold', fontSize: 9 } },
              "cardholderName": '',
              "serviceDate": '',
              "procCd": '',
              "procDesc": '',
              "amountSubmitted": { 'content': grand_amount_submitted_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_submitted_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } },

              "amountPaid": { 'content': grand_amount_paid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_paid_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } },

              "amountNotPaid": { 'content': grand_amount_notPaid_total != 0 ? this.currentUserService.convertAmountToDecimalWithDoller(grand_amount_notPaid_total) : '$ 0.00', 'colSpan': 1, styles: { fontStyle: 'bold', fontSize: 9 } }
            });



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
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },

              columnStyles: {
                "cardNumber": { halign: 'left' },
                "confirmationNumber": { halign: 'right' },
                "cardholderName": { halign: 'right' },
                "serviceDate": { halign: 'right' },
                "procCd": { halign: 'right' },
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

      /* Log #487 (Cardholder labeld Report) */

      case 63:
        this.showPageLoader = true;
        requestParam =
          {
            'length': this.dataTableService.totalRecords,
            "cardNum": this.reportData.value.cardNum,
            "active": this.reportData.value.status,
            "cardHolderName": this.reportData.value.cardHolderName
          }
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'cardNum': (this.cardNumber && this.cardNumber != "") ? this.cardNumber : this.reportData.value.cardNum });
          requestParam = Object.assign(requestParam, { 'cardHolderName':  (this.cardHolderName && this.cardHolderName != "") ? this.cardHolderName : this.reportData.value.cardHolderName });
          requestParam = Object.assign(requestParam, { 'province': this.cardHolderProvince });
          requestParam = Object.assign(requestParam, { 'city': this.cardHolderCity });
          requestParam = Object.assign(requestParam, { 'active': (this.cardHolderActive && this.cardHolderActive != "") ? this.cardHolderActive : this.reportData.value.status })
          requestParam = Object.assign(requestParam, { 'addLine1': this.cardHolderAddLine1 });
          requestParam = Object.assign(requestParam, { 'addLine2': this.cardHolderAddLine2 });
        }
        /** End Narrow Search */
        var url = UftApi.getCardHolderMailingLabelsUrl;

        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: 'Card No.', dataKey: 'cardNum' },
              { title: 'Cardholder Name', dataKey: 'cardHolderName' },
              { title: 'City', dataKey: 'city' },
              { title: 'Province', dataKey: 'province' },
              { title: 'Address Line 1', dataKey: 'addLine1' },
              { title: 'Address Line 2', dataKey: 'addLine2' }
            ];
            var rows = data.result.data;
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle
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
                "cardNum": { halign: 'left' },
                "cardHolderName": { halign: 'right' },
                "city": { halign: 'right' },
                "province": { halign: 'right' },
                "addLine1": { halign: 'right' },
                "addLine2": { halign: 'right' }
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
            this.showPageLoader = false;
            // this.showPageLoader = false;
            // var rows = data.result.data;
            // /** Start */
            // var head = [];
            // var body = [];
            // var total = 0;
            // let claimPaymentsByCardholderArray = [];
            // this.reportDataArray = data.result.data
            // let endDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '');
            // this.reportDate = endDate
            // $('#hidenTable').show()
            // setTimeout(() => {
            //   const elementToPrint = document.getElementById('hidenTable'); //The html element to become a pdf
            //   var doc = new jsPDF('p', 'pt', 'a3');;
            //   doc.addHTML(elementToPrint, () => {
            //     $('#hidenTable').hide()
            //     doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
            //   });
            // }, 300);
            // this.showPageLoader = false;
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;

      /* #487 Broker Mailing Labels PDF */
      case 36:
        this.showPageLoader = true;
        let brokerStatus = ""
        if (this.reportData.value.status == "active") {
          brokerStatus = "active"
        } else if (this.reportData.value.status == "inactive") {
          brokerStatus = "inactive"
        } else {
          brokerStatus = ""
        }
        requestParam =
          {
            'length': this.dataTableService.totalRecords,
            "brokerId": this.selectedBrokerId,
            "brokerName": this.selectedBrokerName,
            "brokerIdAndName": "",
            "province": this.reportData.value.brokerProvince,
            "city": this.reportData.value.brokerCity,
            "active": brokerStatus
          }
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'brokerId': (this.brokerId && this.brokerId != "") ? this.brokerId : this.selectedBrokerId });
          requestParam = Object.assign(requestParam, { 'brokerName': (this.brokerName && this.brokerName != "") ? this.brokerName : this.selectedBrokerName });
          requestParam = Object.assign(requestParam, { 'brokerIdAndName': this.brokerIdAndName });
          requestParam = Object.assign(requestParam, { 'province': (this.province && this.province != "") ? this.province : this.reportData.value.brokerProvince });
          requestParam = Object.assign(requestParam, { 'city': (this.city && this.city != "") ? this.city : this.reportData.value.brokerCity });
          requestParam = Object.assign(requestParam, { 'active': (this.active && this.active != "") ? this.active :  brokerStatus })
          requestParam = Object.assign(requestParam, { 'addLine1': this.addLine1 });
          requestParam = Object.assign(requestParam, { 'addLine2': this.addLine2 });
        }
        /** End Narrow Search */
        var url = UftApi.getBrokerMailingLabelsUrl;

        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            let len = data.result.data;

            this.reportDataArray = data.result.data
            let endDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '');
            this.reportDate = endDate
            $('#hidenTable').show()
            setTimeout(() => {
              const elementToPrint = document.getElementById('hidenTable'); //The html element to become a pdf
              var doc = new jsPDF('p', 'pt', 'a3');;

              doc.addHTML(elementToPrint, () => {

                $('#hidenTable').hide()
                doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');

              });
            }, 300);

            this.showPageLoader = false;

          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;

      /* Company Mailing Labels Report API*/
      case 32:

        this.showPageLoader = true;
        requestParam =
          {
            'length': this.dataTableService.totalRecords,
            "coId": this.selectedCoID,
            "coName": this.selectedCompanyName,
          }
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'coId': (this.companyNum && this.companyNum != "") ? this.companyNum : this.selectedCoID });
          requestParam = Object.assign(requestParam, { 'coName': (this.companyName && this.companyName != "") ? this.companyName : this.selectedCompanyName });
          requestParam = Object.assign(requestParam, { 'city': this.companyCity })
          requestParam = Object.assign(requestParam, { 'province': this.companyProvince });
          requestParam = Object.assign(requestParam, { 'addLine1': this.companyAddLine1 });
          requestParam = Object.assign(requestParam, { 'addLine2': this.companyAddLine2 });
        }
        /** End Narrow Search */
        var url = UftApi.getCompanyMailingLabelsUrl;

        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            this.reportDataArray = data.result.data
            let endDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '');
            this.reportDate = endDate
            $('#hidenTable').show()
            setTimeout(() => {
              const elementToPrint = document.getElementById('hidenTable'); //The html element to become a pdf
              var doc = new jsPDF('p', 'pt', 'a3');;
              doc.addHTML(elementToPrint, () => {
                $('#hidenTable').hide()
                doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
              });
            }, 300);
            this.showPageLoader = false;
          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;

      /* #487 Service Provider Mailing Labels Report */
      case 31:
        this.showPageLoader = true;
        requestParam =
          {
            'length': this.dataTableService.totalRecords,
            "discipline": this.reportData.value.discipline,
            "providerName": this.reportData.value.providerName,
            "providerLicenseNum": this.reportData.value.providerLicenseNum
          }
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'discipline': (this.providerDiscipline && this.providerDiscipline != "") ? this.providerDiscipline : this.reportData.value.discipline });
          requestParam = Object.assign(requestParam, { 'providerName': (this.providerName && this.providerName != "") ? this.providerName : this.reportData.value.providerName });
          requestParam = Object.assign(requestParam, { 'providerLicenseNum': (this.providerLicenseNum && this.providerLicenseNum != "") ? this.providerLicenseNum : this.reportData.value.providerLicenseNum })
          requestParam = Object.assign(requestParam, { 'city': this.providerCity });
          requestParam = Object.assign(requestParam, { 'province': this.providerProvince });
          requestParam = Object.assign(requestParam, { 'addLine1': this.providerAddLine1 });
          requestParam = Object.assign(requestParam, { 'addLine2': this.providerAddLine2 });
        }
        var url = UftApi.getServiceProviderMailingLabelsUrl;
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            this.part = 0;
            this.primaryArray = []
            let len = data.result.data.length;
            if (len > 60) {
              this.part = len / 60;
            }
            if (Math.floor(this.part) > 0) {
            }
            for (let i = 0; i < this.part; i++) {
              const element = data.result.data.slice(i, i + 60);
              this.primaryArray.push(element)


            }
            this.reportDataArray = data.result.data
            let endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '';
            this.reportDate = endDate
            $('#hidenTable').show()
            setTimeout(() => {
              var doc = new jsPDF('p', 'pt', 'a3');
              this.showPageLoader = true;

              var columns = [
                { title: 'Discipline', dataKey: 'discipline' },
                { title: 'Provider Name', dataKey: 'providerName' },
                { title: 'Provider License No.', dataKey: 'providerLicenseNum' },
                { title: 'City', dataKey: 'city' },
                { title: 'Province', dataKey: 'province' },
                { title: 'Address Line 1', dataKey: 'addLine1' },
                { title: 'Address Line 2', dataKey: 'addLine2' },
              ];

              var rows = data.result.data;
              //Start Header
              var headerobject = [];
              headerobject.push({
                'gridHeader1': this.reportPopUpTitle
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
                  "discipline": { halign: 'left' },
                  "providerName": { halign: 'right' },
                  "providerLicenseNum": { halign: 'right' },
                  "city": { halign: 'right' },
                  "province": { halign: 'right' },
                  "addLine1": { halign: 'right' },
                  "addLine2": { halign: 'right' }
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
              this.showPageLoader = false;
            }, 200);

          } else if (data.code == 404 && data.status == 'NOT_FOUND') {
            this.showPageLoader = false;
            this.toastrService.error(this.translate.instant('uft.toaster.recordNotFound'));
          }
        });
        break;

      /* #487: Summary by Company, Plan, Card and Coverage */
      case 33:
        this.showPageLoader = true;
        requestParam =
          {
            'start': 0,
            'length': this.dataTableService.totalRecords,
            "coKey": this.selecteCoKey,
            "cardNum": this.reportData.value.cardNum
          }
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'coId': this.companyId });
          requestParam = Object.assign(requestParam, { 'coName': this.compName });
          requestParam = Object.assign(requestParam, { 'cardNum': (this.cardNum && this.cardNum != "") ? this.cardNum : this.reportData.value.cardNum });
          requestParam = Object.assign(requestParam, { 'planId': this.planId });
          requestParam = Object.assign(requestParam, { 'dcItemSeriveDate': this.changeDateFormatService.convertDateObjectToString(this.itemServiceDate) })
          requestParam = Object.assign(requestParam, { 'paymentSumRunDate': this.changeDateFormatService.convertDateObjectToString(this.paymentSumRunDate) });
          requestParam = Object.assign(requestParam, { 'businessTypeCd': this.bussType });
          requestParam = Object.assign(requestParam, { 'dentCovCatDesc': this.covCatDesc });
          requestParam = Object.assign(requestParam, { 'amountClaimed': this.amountClaimed });
        }
        var url = UftApi.getSummaryByCompanyPlanCardAndCoverageUrl;
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              { title: 'Company ID', dataKey: 'coId' },
              { title: 'Company Name', dataKey: 'coName' },
              { title: 'Card Num', dataKey: 'cardNum' },
              { title: 'Plan ID', dataKey: 'planId' },
              { title: 'Service Date', dataKey: 'dcItemSeriveDate' },
              { title: 'Payment Sum Run Date', dataKey: 'paymentSumRunDate' },
              { title: 'Business Type', dataKey: 'businessTypeCd' },
              { title: 'Coverage Category Desc', dataKey: 'dentCovCatDesc' },
              { title: 'Claimed Amount', dataKey: 'amountClaimed' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            for (var i in rows) {
              body.push({
                "coId": rows[i].coId,
                "coName": rows[i].coName,
                "cardNum": rows[i].cardNum,
                "planId": rows[i].planId,
                "dcItemSeriveDate": this.changeDateFormatService.changeDateByMonthName(rows[i].dcItemSeriveDate),
                "paymentSumRunDate": this.changeDateFormatService.changeDateByMonthName(rows[i].paymentSumRunDate),
                "businessTypeCd": rows[i].businessTypeCd,
                "dentCovCatDesc": rows[i].dentCovCatDesc,
                "amountClaimed": rows[i].amountClaimed
              });
            }

            let endDate = this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) || '';
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coId": { halign: 'left' },
                "coName": { halign: 'right' },
                "cardNum": { halign: 'right' },
                "planId": { halign: 'right' },
                "dcItemSeriveDate": { halign: 'right' },
                "paymentSumRunDate": { halign: 'right' },
                "businessTypeCd": { halign: 'right' },
                "dentCovCatDesc": { halign: 'right' },
                "amountClaimed": { halign: 'right' }
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

      /* #487: Card Count By Company */
      case 62:
        this.showPageLoader = true;
        requestParam =
          {
            'length': this.dataTableService.totalRecords,
            'startDate': this.reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate) : '',
            'endDate': this.reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate) : '',
            "coId": this.selectedCoID,
            "businessType": this.bussTypeCd
          }
          
          if (this.columnFilterSearch) {
            requestParam = Object.assign(requestParam, { 'coId' : (this.gridFilter62_companyId && this.gridFilter62_companyId != "") ? this.gridFilter62_companyId : this.selectedCoID });
            requestParam = Object.assign(requestParam, { 'divIdDivName' : this.gridFilter62_division });
            requestParam = Object.assign(requestParam, { 'countSingle' : this.gridFilter62_singles });
            requestParam = Object.assign(requestParam, { 'countFamily' : this.gridFilter62_families });
            requestParam = Object.assign(requestParam, { 'countTotal' : this.gridFilter62_total })
          }

        var url = UftApi.cardCountByCompanyUrl;
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let startDate = this.reportData.value.startDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate)) : '';
            let endDate = this.reportData.value.endDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate)) : '';

            var columns = [
              { title: 'Division', dataKey: 'divIdDivName' },
              { title: 'Singles', dataKey: 'countSingle' },
              { title: 'Families', dataKey: 'countFamily' },
              { title: 'Total', dataKey: 'countTotal' }
            ];
            this.showPageLoader = false;
            let cardCountByCompanyArray = []
            var rows = data.result.data;
            var rowsTotal = data.result.totals
            // New Report Design As Per Division Data
            for (var i in rows) {
              let checkMainIndex = cardCountByCompanyArray.findIndex(x => x.divIdDivName == rows[i].divIdDivName)
              if (checkMainIndex == -1) {
                cardCountByCompanyArray.push({
                  "divIdDivName": rows[i].divIdDivName,
                  "cardNumArray": [
                    {
                      "countSingle": rows[i].countSingle,
                      "confNumArray": [
                        {
                          "countSingle": rows[i].countSingle,
                          "countFamily": rows[i].countFamily,
                          "countTotal": rows[i].countTotal,
                          "monthYearKey": rows[i].monthYearKey
                        }
                      ]
                    }
                  ]
                })
              } else {
                let checkChildIndex = cardCountByCompanyArray[checkMainIndex].cardNumArray.findIndex(x => x.countSingle == rows[i].countSingle);
                if (checkChildIndex == -1) {
                  cardCountByCompanyArray[checkMainIndex].cardNumArray.push({
                    "countSingle": rows[i].countSingle,
                    "confNumArray": [
                      {
                        "countSingle": rows[i].countSingle,
                        "countFamily": rows[i].countFamily,
                        "countTotal": rows[i].countTotal,
                        "monthYearKey": rows[i].monthYearKey
                      }
                    ]
                  });
                } else {
                  cardCountByCompanyArray[checkMainIndex].cardNumArray[checkChildIndex].confNumArray.push({
                    "countSingle": rows[i].countSingle,
                    "countFamily": rows[i].countFamily,
                    "countTotal": rows[i].countTotal,
                    "monthYearKey": rows[i].monthYearKey
                  });
                }
              }
            }
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            var countFamily = 0;
            var countFamilyTotal = 0;
            var countSingle = 0;
            var countSingleTotal = 0;
            var countTotal = 0;
            var countTotals = 0;
            for (var i in cardCountByCompanyArray) {
              body.push({
                "divIdDivName": { 'content': cardCountByCompanyArray[i].divIdDivName, 'colSpan': 4 },
                "countSingle": '',
                "countFamily": '',
                "countTotal": ''
              });
              if (cardCountByCompanyArray[i].cardNumArray.length > 0) {
                for (var k in cardCountByCompanyArray[i].cardNumArray) {
                  if (cardCountByCompanyArray[i].cardNumArray[k].confNumArray.length > 0) {
                    for (var j in cardCountByCompanyArray[i].cardNumArray[k].confNumArray) {
                      if (j == '0') {
                        body.push({
                          "divIdDivName": cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].monthYearKey, // For unique record date issue and commented above divisionDate
                          "countSingle": cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countSingle,
                          "countFamily": cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countFamily,
                          "countTotal": cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countTotal,
                        });
                      } else {
                        body.push({
                          "divIdDivName":  cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].monthYearKey, // For duplicacy record date issue and commented above divisionDate
                          "countSingle": cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countSingle,
                          "countFamily": cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countFamily,
                          "countTotal": cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countTotal,
                        });
                      }
                      countSingle = countSingle + (cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countSingle);
                      countFamily = countFamily + (cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countFamily);
                      countTotal = countTotal + (cardCountByCompanyArray[i].cardNumArray[k].confNumArray[j].countTotal);
                      
                    }
                  }
                }
              }
              countSingleTotal = countSingle;
              countFamilyTotal = countFamily;
              countTotals = countTotal
            }
            
            body.push({
              "divIdDivName": { 'content': 'TOTALS', 'colSpan': 4, styles: { fontStyle: 'bold', fontSize: 9 } },
              "countSingle": '',
              "countFamily": '',
              "countTotal": ''
            });
            body.push({
              "divIdDivName": { 'content': 'Year/Month', styles: { fontStyle: 'bold', fontSize: 9 } },
              "countSingle": { 'content': 'Singles', styles: { fontStyle: 'bold', fontSize: 9 } },
              "countFamily": { 'content': 'Families', styles: { fontStyle: 'bold', fontSize: 9 } },
              "countTotal": { 'content': 'Total', styles: { fontStyle: 'bold', fontSize: 9 } }
            });
            for( var i in rowsTotal) {
              body.push({
                "divIdDivName": rowsTotal[i].divisionDate,
                "countSingle": rowsTotal[i].countSingle,
                "countFamily": rowsTotal[i].countFamily,
                "countTotal": rowsTotal[i].countTotal
              })
            }

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
                "divIdDivName": { halign: 'left' },
                "countSingle": { halign: 'right' },
                "countFamily": { halign: 'right' },
                "countTotal": { halign: 'right' },
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

      /* #487: Educational Status Letters */
      case 66:
        this.showPageLoader = true;
        requestParam =
          {
            'start': 0,
            'length': this.dataTableService.totalRecords,
            "coKey": this.selecteCoKey,
          }
        if (this.columnFilterSearch) {

          requestParam = Object.assign(requestParam, { 'coId': this.companyId });
          requestParam = Object.assign(requestParam, { 'coName': this.compName });
          requestParam = Object.assign(requestParam, {  'contactEmailAdd': this.email });
          requestParam = Object.assign(requestParam, {  'province': this.searchProvince });
          requestParam = Object.assign(requestParam, { 'city': this.searchCity });
          requestParam = Object.assign(requestParam, {  'mailAddressLine1': this.addressLineOne });
          requestParam = Object.assign(requestParam, {  'contactLastName': this.lastName });
          requestParam = Object.assign(requestParam, {  'contactFirstName': this.firstName });
          requestParam = Object.assign(requestParam, {  'cardNumber': this.searchCardNumber });
        }
 
        var url = UftApi.educationalStatusLetter;
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
               { title: 'Company ID', dataKey: 'coId' },
              { title: 'Company Name', dataKey: 'coName' },
              { title: 'Card Number', dataKey: 'cardNumber' },
              { title: 'First Name', dataKey: 'contactFirstName' },
              { title: 'Last Name', dataKey: 'contactLastName' },
              { title: 'Address Line 1', dataKey: 'mailAddressLine1' },
              { title: 'City', dataKey: 'city' },
              { title: 'Province', dataKey: 'province' },
              { title: 'Email', dataKey: 'contactEmailAdd' }
            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            for (var i in rows) {
              body.push({
                "coId": rows[i].coId,
                "coName": rows[i].coName,
                "cardNumber": rows[i].cardNumber,
                "contactFirstName": rows[i].contactFirstName,
                "contactLastName": rows[i].contactLastName,
                "mailAddressLine1": rows[i].mailAddressLine1,
                "city": rows[i].city,
                "province": rows[i].province,
                "contactEmailAdd": rows[i].contactEmailAdd,
              });
            }

            let endDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) || '');
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "coId": { halign: 'left' },
                "coName": { halign: 'right' },
                "cardNumber": { halign: 'right' },
                "contactFirstName": { halign: 'right' },
                "contactLastName": { halign: 'right' },
                "mailAddressLine1": { halign: 'right' },
                "city": { halign: 'right' },
                "province": { halign: 'right' },
                "contactEmailAdd": { halign: 'right'}
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

      /* #487: FINANCIAL: Statement - Company Level/Annual Statement */
      case -101:

        this.showPageLoader = true;

        this.reportDate = "16/2/2021"
        $('#hidenTable').show()
        setTimeout(() => {
          const elementToPrint = document.getElementById('hidenTable'); //The html element to become a pdf

          // replacing balwinder code for pdf (still here is commented)
          var doc = new jsPDF('p', 'pt', 'a3');

          doc.addHTML(elementToPrint, () => {

            $('#hidenTable').hide()
            doc.save(this.reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');

          });
          this.showPageLoader = false;
        }, 300);

        break;

      /* #487: Service Providr List */
      case 18:
        this.showPageLoader = true;
        let discVal;
        if (this.reportData.value.disciplineSpec != null) {
          if (this.reportData.value.disciplineSpec == 'All') {
            discVal = ''
          } else {
            discVal = this.reportData.value.disciplineSpec
          }
        } else {
          discVal = ''
        }
        requestParam =
          {
            'length': this.dataTableService.totalRecords,
            'dentProvLicenseNum': this.reportData.value.licenceNumber != null ? this.reportData.value.licenceNumber : '',
            'cityName': this.reportData.value.brokerCity != null ? this.reportData.value.brokerCity : '',
            'provinceName': this.reportData.value.brokerProvince != null ? this.reportData.value.brokerProvince : '',
            'languageCd': this.reportData.value.language != null ? this.reportData.value.language : '',
            'dentSpecialityGrpDesc': this.reportData.value.specialtyGroup != null ? this.reportData.value.specialtyGroup : '',
            'dentProvTypeDesc':this.reportData.value.providerType != null ? this.reportData.value.providerType : '',
            'discipline': discVal,
            'dentSpecialityTypeDesc': this.reportData.value.speciality != null ? this.reportData.value.speciality : '',
            'sortingDirection': this.reportData.value.sortingDirection != null ?  this.reportData.value.sortingDirection : '',
            'sortingOption': this.reportData.value.sortingOption != null ? this.reportData.value.sortingOption : '',
            'participant': this.reportData.value.participant != null ? this.reportData.value.participant : '',
            'excludeDrugCardProv': this.reportData.value.checkboxOption == true ? 'T' : 'F'
          };
        
          if (this.columnFilterSearch) {
            requestParam = Object.assign(requestParam, { 'dentProvLicenseNum': (this.dentProvLicenseNum && this.dentProvLicenseNum != "") ? this.dentProvLicenseNum : this.reportData.value.licenceNumber });
            requestParam = Object.assign(requestParam, { 'providerName': (this.providersName && this.providersName != "") ? this.providersName : '' });
            requestParam = Object.assign(requestParam, { 'dentProvUli': (this.provUli && this.provUli != "") ? this.provUli : '' });
            requestParam = Object.assign(requestParam, { 'dentSpecialityTypeDesc': (this.specialityType && this.specialityType != "") ? this.specialityType : this.reportData.value.speciality });
            requestParam = Object.assign(requestParam, { 'discipline': (this.provDiscipline && this.provDiscipline != "") ? this.provDiscipline : discVal });
            requestParam = Object.assign(requestParam, { 'dentProvBillAddL1MailAdd': (this.providerAddress != null && this.providerAddress != "") ? this.providerAddress : '' });
            requestParam = Object.assign(requestParam, { 'postalCd': (this.postalCode != null && this.postalCode != "") ? this.postalCode : '' });
            requestParam = Object.assign(requestParam, { 'dentProvBillAddPhoneNum': (this.provTelephone != null && this.provTelephone != "") ? this.provTelephone : '' });
            requestParam = Object.assign(requestParam, { 'languageCd': this.language != null ? this.language : this.reportData.value.language });
          }
        var url = UftApi.serviceProviderReportUrl;
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            var columns = [
              
              { title: this.translate.instant('dashboard.report.providerNo'), dataKey: 'dentProvLicenseNum' },
              { title: this.translate.instant('dashboard.report.providerName'), dataKey: 'providerName'},
              { title: this.translate.instant('dashboard.report.uli'), dataKey: 'dentProvUli'},
              { title: this.translate.instant('dashboard.report.specialty'), dataKey: 'dentSpecialityTypeDesc' },
              { title: this.translate.instant('dashboard.report.discipline'), dataKey: 'discipline'},
              { title: this.translate.instant('dashboard.report.address'), dataKey: 'address' },
              { title: this.translate.instant('dashboard.report.postalCode'), dataKey: 'postalCd'},
              { title: this.translate.instant('dashboard.report.telephone'), dataKey: 'dentProvBillAddPhoneNum' },
              { title: this.translate.instant('dashboard.report.language'), dataKey: 'languageCd' },

            ];
            this.showPageLoader = false;
            var rows = data.result.data;
            /** Start */
            var head = [];
            var body = [];
            var total = 0;
            for (var i in rows) {
              body.push({
                "dentProvLicenseNum": rows[i].dentProvLicenseNum,
                "providerName": rows[i].providerName,
                "dentProvUli": rows[i].dentProvUli,
                "dentSpecialityTypeDesc": rows[i].dentSpecialityTypeDesc,
                "discipline": rows[i].discipline,
                "address": rows[i].address,
                "postalCd": rows[i].postalCd,
                "dentProvBillAddPhoneNum": rows[i].dentProvBillAddPhoneNum,
                "languageCd": rows[i].languageCd
              });
            }

            let endDate = this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.startDate) || '';
            //Start Header
            var headerobject = [];
            headerobject.push({
              'gridHeader1': this.reportPopUpTitle,
              'text5Date': endDate
            });
            this.pdfHeader(doc, headerobject);
            //End Header 
            doc.autoTable(columns, body, {
              styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
              columnStyles: {
                "dentProvLicenseNum": { halign: 'left' },
                "providerName": { halign: 'right' },
                "dentProvUli": { halign: 'right' },
                "dentSpecialityTypeDesc": { halign: 'right' },
                "discipline": { halign: 'right' },
                "address": { halign: 'right' },
                "postalCd": { halign: 'right' },
                "dentProvBillAddPhoneNum": { halign: 'right' },
                "languageCd": { halign: 'right' }
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

      /* Log #1061: PDF */
      case 112:
        var url = UftApi.dirtyCardListForAkiraBenefitUrl;
        this.showPageLoader = true;
        requestParam = {
          'coId': this.compId != "" ? this.compId : '',
          "start": 0,
          "length": this.dataTableService.totalRecords
        }
        /** Start Narrow Search */
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'cardNum': this.GridFilter112_cardNumber });
          requestParam = Object.assign(requestParam, { 'problem': this.GridFilter112_problem });
        }
        /** End Narrow Search */
        this.hmsDataService.postApi(url, requestParam).subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            var doc = new jsPDF('p', 'pt', 'a3');
            let FromDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()))

            var columns = [
              { title: 'Card Number', dataKey: 'cardNum' },
              { title: 'Problem', dataKey: 'problem' },
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
                "cardNum": { halign: 'left' },
                "problem": { halign: 'right' },
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
      /* Log #1061: PDF */

      /* #487: QSI.010 */
      case -15:
        var url = UftApi.amountPaidByCompanyPlanCvUrl
        this.showPageLoader = true;
        requestParam = {
          "start": 0,
          'startDate' : this.reportData.value.startDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportData.value.startDate) : '',
          'endDate' : this.reportData.value.endDate != null ? this.changeDateFormatService.convertDateObjectToString(this.reportData.value.endDate) : '',
          'coId' : this.selectedCoID,
          'planNoStart' : this.reportData.value.planStartRange,
          'planNoEnd' : this.reportData.value.planEndRange,
          'discipline' : this.reportData.value.discipline,
          'sort' : this.reportData.value.sortingDirection,
          'sortBy' : this.reportData.value.sortingOption,
          'forPdf': "T"         
        }

        this.filterColoumn = [
          { title: 'Company Number', dataKey: 'coId' },
          { title: 'Company Name', dataKey: 'coName' },
          { title: 'Plan Number', dataKey: 'planNo' },
          { title: 'No. of Proc', dataKey: 'noOfProc' },
          { title: 'Amount Claimed', dataKey: 'amountClaimed' },
          { title: 'Professional Fee Paid', dataKey: 'professionalAmtPaid' },
          { title: 'Lab Paid', dataKey: 'labPaid' },
          { title: 'Amount Paid', dataKey: 'amountPaid' }
        ];
        if (this.columnFilterSearch) {
          requestParam = Object.assign(requestParam, { 'coId' : (this.GridFilter15_coId && this.GridFilter15_coId != "") ? this.GridFilter15_coId : this.selectedCoID });
          requestParam = Object.assign(requestParam, { 'coName' : this.GridFilter15_coName });
          requestParam = Object.assign(requestParam, { 'planNo' : this.GridFilter15_planNo });
          requestParam = Object.assign(requestParam, { 'noOfProc' : this.GridFilter15_noOfProc });
          requestParam = Object.assign(requestParam, { 'amountClaimed' : this.GridFilter15_amountClaimed });
          requestParam = Object.assign(requestParam, { 'professionalAmtPaid' : this.GridFilter15_professionalAmtPaid });
          requestParam = Object.assign(requestParam, { 'labPaid' : this.GridFilter15_labPaid });
          requestParam = Object.assign(requestParam, { 'amountPaid' : this.GridFilter15_amountPaid });
        }

      this.hmsDataService.postApi(url, requestParam).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          var doc = new jsPDF('p', 'pt', 'a3');
          let FromDate = this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()))

          var columns = [
            { title: 'Coverage', dataKey: 'coverageCat' },
            { title: 'No. Of Proc', dataKey: 'noOfProc' },
            { title: 'Amount Claimed', dataKey: 'amountClaimed' },
            { title: 'Professional Fee Paid', dataKey: 'professionalAmtPaid' },
            { title: 'Lab Paid', dataKey: 'labPaid' },
            { title: 'Amount Paid', dataKey: 'amountPaid' }
          ];
          this.showPageLoader = false;
          var rows = data.result.data;
          let companyPlanCovArray = []
          for (var i in rows) {
            let checkMainIndex = companyPlanCovArray.findIndex(x => x.coId == rows[i].coId)
            if (checkMainIndex == -1) {
              companyPlanCovArray.push({
                "coId": rows[i].coId,
                "coName": rows[i].coName,
                "planArray": [
                  {
                    "planNo": rows[i].planNo,
                    "disciplineArray": [
                      {
                        "discipline": rows[i].discipline,
                        "covCatArray": [
                          {
                            "coverageCat": rows[i].coverageCat,
                            "noOfProc": rows[i].noOfProc,
                            "amountClaimed": rows[i].amountClaimed,
                            "professionalAmtPaid": rows[i].professionalAmtPaid,
                            "labPaid": rows[i].labPaid,
                            "amountPaid": rows[i].amountPaid
                          }
                        ]
                      }
                    ]
                  }
                ]
              })
            } 
            else {
              let checkPlanChildIndex = companyPlanCovArray[checkMainIndex].planArray.findIndex(x => x.planNo == rows[i].planNo);
              if (checkPlanChildIndex == -1) {
                companyPlanCovArray[checkMainIndex].planArray.push({
                  "planNo": rows[i].planNo,
                    "disciplineArray": [
                      {
                        "discipline": rows[i].discipline,
                        "covCatArray": [
                          {
                            "coverageCat": rows[i].coverageCat,
                            "noOfProc": rows[i].noOfProc,
                            "amountClaimed": rows[i].amountClaimed,
                            "professionalAmtPaid": rows[i].professionalAmtPaid,
                            "labPaid": rows[i].labPaid,
                            "amountPaid": rows[i].amountPaid
                          }
                        ]
                      }
                    ]
                });
              } else {
                let checkDiscChildIndex = companyPlanCovArray[checkMainIndex].planArray[checkPlanChildIndex].disciplineArray.findIndex(x => x.discipline == rows[i].discipline);
                  if (checkDiscChildIndex == -1) {
                    companyPlanCovArray[checkMainIndex].planArray[checkPlanChildIndex].disciplineArray.push({
                      "discipline": rows[i].discipline,
                      "covCatArray": [
                        {
                          "coverageCat": rows[i].coverageCat,
                          "noOfProc": rows[i].noOfProc,
                          "amountClaimed": rows[i].amountClaimed,
                          "professionalAmtPaid": rows[i].professionalAmtPaid,
                          "labPaid": rows[i].labPaid,
                          "amountPaid": rows[i].amountPaid
                        }
                      ]
                    });
                  } else {
                    companyPlanCovArray[checkMainIndex].planArray[checkPlanChildIndex].disciplineArray[checkDiscChildIndex].covCatArray.push({
                      "coverageCat": rows[i].coverageCat,
                      "noOfProc": rows[i].noOfProc,
                      "amountClaimed": rows[i].amountClaimed,
                      "professionalAmtPaid": rows[i].professionalAmtPaid,
                      "labPaid": rows[i].labPaid,
                      "amountPaid": rows[i].amountPaid
                    });
                  }
              }
            }
          }
          var body = []
          var totalNoOfProc = 0;
          var totalAmountClaimed = 0;
          var totalProfessionalAmtPaid = 0
          var totalPabPaid = 0
          var totalAmountPaid = 0
          var noOfProc = 0
          var amountClaimed = 0
          var professionalAmtPaid = 0
          var labPaid = 0
          var amountPaid =0
          var totalNoOfProcPlan = 0;
          var totalAmountClaimedPlan = 0;
          var totalProfessionalAmtPaidPLan = 0
          var totalPabPaidPLan = 0
          var totalAmountPaidPlan = 0
          var noOfProcPlan = 0
          var amountClaimedPlan = 0
          var professionalAmtPaidPlan = 0
          var labPaidPLan = 0
          var amountPaidPlan =0
          var totalNoOfProcComp= 0;
          var totalAmountClaimedComp = 0;
          var totalProfessionalAmtPaidComp = 0
          var totalPabPaidComp = 0
          var totalAmountPaidComp = 0
          var noOfProcComp = 0
          var amountClaimedComp = 0
          var professionalAmtPaidComp = 0
          var labPaidComp = 0
          var amountPaidComp = 0
          // PDF Design Started as per client sample
          for (var i in companyPlanCovArray) {
            body.push({
              "coverageCat": { 'content': 'Company Number: '+companyPlanCovArray[i].coId, styles: { fontStyle: 'bold'} },
              "noOfProc": { 'content': 'Company Name: '+companyPlanCovArray[i].coName, 'colSpan': 5, styles: { fontStyle: 'bold'} },
              "amountClaimed": '',
              "professionalAmtPaid": '',
              "labPaid": '',
              "amountPaid": ''
            });
              if (companyPlanCovArray[i].planArray.length > 0) {
                for(var p in companyPlanCovArray[i].planArray) {
                  body.push({
                    "coverageCat": { 'content': 'Plan No: '+companyPlanCovArray[i].planArray[p].planNo, 'colSpan': 6, styles: { fontStyle: 'bold'} },
                    "noOfProc": '',
                    "amountClaimed": '',
                    "professionalAmtPaid": '',
                    "labPaid": '',
                    "amountPaid": ''
                  });
                  if (companyPlanCovArray[i].planArray[p].disciplineArray.length > 0) {
                    for (var k in companyPlanCovArray[i].planArray[p].disciplineArray) {
                      body.push({
                        "coverageCat": { 'content': 'Discipline: '+companyPlanCovArray[i].planArray[p].disciplineArray[k].discipline, 'colSpan': 6, styles: { fontStyle: 'bold'} },
                        "noOfProc": '',
                        "amountClaimed": '',
                        "professionalAmtPaid": '',
                        "labPaid": '',
                        "amountPaid": ''
                      });
                      if (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray.length > 0) {
                        for (var j in companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray) {
                        if (j == '0') {
                          body.push({
                            "coverageCat": companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].coverageCat, // For unique record date issue and commented above divisionDate
                            "noOfProc": companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].noOfProc,
                            "amountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountClaimed),
                            "professionalAmtPaid": this.currentUserService.convertAmountToDecimalWithDoller(companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].professionalAmtPaid),
                            "labPaid": this.currentUserService.convertAmountToDecimalWithDoller(companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].labPaid),
                            "amountPaid": this.currentUserService.convertAmountToDecimalWithDoller(companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountPaid)
                          });
                        } else {
                          body.push({
                            "coverageCat": companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].coverageCat, // For unique record date issue and commented above divisionDate
                            "noOfProc": companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].noOfProc,
                            "amountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountClaimed),
                            "professionalAmtPaid": this.currentUserService.convertAmountToDecimalWithDoller(companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].professionalAmtPaid),
                            "labPaid": this.currentUserService.convertAmountToDecimalWithDoller(companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].labPaid),
                            "amountPaid": this.currentUserService.convertAmountToDecimalWithDoller(companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountPaid)
                          });
                        }
                        let num = +j
                        if (num+1 == companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray.length) {
                          noOfProc = noOfProc + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].noOfProc);
                          amountClaimed = amountClaimed + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountClaimed);
                          professionalAmtPaid = professionalAmtPaid + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].professionalAmtPaid);
                          labPaid = labPaid + companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].labPaid
                          amountPaid = amountPaid + companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountPaid
                          totalNoOfProc = noOfProc;
                          totalAmountClaimed = amountClaimed;
                          totalProfessionalAmtPaid = professionalAmtPaid
                          totalPabPaid = labPaid
                          totalAmountPaid = amountPaid
                          body.push({
                            "coverageCat": { 'content': 'Total For '+companyPlanCovArray[i].planArray[p].disciplineArray[k].discipline, styles: { fontStyle: 'bold'} },
                            "noOfProc": totalNoOfProc,
                            "amountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(totalAmountClaimed),
                            "professionalAmtPaid": this.currentUserService.convertAmountToDecimalWithDoller(totalProfessionalAmtPaid),
                            "labPaid": this.currentUserService.convertAmountToDecimalWithDoller(totalPabPaid),
                            "amountPaid": this.currentUserService.convertAmountToDecimalWithDoller(totalAmountPaid)
                          });
                          noOfProc = 0
                          amountClaimed = 0
                          professionalAmtPaid = 0
                          labPaid = 0
                          amountPaid = 0
                        } else {
                          noOfProc = noOfProc + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].noOfProc);
                          amountClaimed = amountClaimed + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountClaimed);
                          professionalAmtPaid = professionalAmtPaid + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].professionalAmtPaid);
                          labPaid = labPaid + companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].labPaid
                          amountPaid = amountPaid + companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountPaid
                        }
                        // Count Total For PLan
                        if (num+1 == companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray.length) {
                          noOfProcPlan = noOfProcPlan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].noOfProc)
                          amountClaimedPlan = amountClaimedPlan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountClaimed)
                          professionalAmtPaidPlan = professionalAmtPaidPlan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].professionalAmtPaid)
                          labPaidPLan = labPaidPLan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].labPaid)
                          amountPaidPlan = amountPaidPlan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountPaid)
                          totalNoOfProcPlan = noOfProcPlan;
                          totalAmountClaimedPlan = amountClaimedPlan;
                          totalProfessionalAmtPaidPLan = professionalAmtPaidPlan
                          totalPabPaidPLan = labPaidPLan
                          totalAmountPaidPlan = amountPaidPlan
                        } else {
                          noOfProcPlan = noOfProcPlan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].noOfProc)
                          amountClaimedPlan = amountClaimedPlan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountClaimed)
                          professionalAmtPaidPlan = professionalAmtPaidPlan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].professionalAmtPaid)
                          labPaidPLan = labPaidPLan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].labPaid)
                          amountPaidPlan = amountPaidPlan + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountPaid)
                        }

                        // Total Count For Company
                        noOfProcComp = noOfProcComp + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].noOfProc)
                        amountClaimedComp = amountClaimedComp + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountClaimed)
                        professionalAmtPaidComp = professionalAmtPaidComp + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].professionalAmtPaid)
                        labPaidComp = labPaidComp + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].labPaid)
                        amountPaidComp = amountPaidComp + (companyPlanCovArray[i].planArray[p].disciplineArray[k].covCatArray[j].amountPaid)
                        totalNoOfProcComp = noOfProcComp;
                        totalAmountClaimedComp = amountClaimedComp;
                        totalProfessionalAmtPaidComp = professionalAmtPaidComp
                        totalPabPaidComp = labPaidComp
                        totalAmountPaidComp = amountPaidComp
                      }
                  }
                }
              }
              // Total count for Plan
              let pcount = +p
              if (pcount+1 == companyPlanCovArray[i].planArray.length) {
                body.push({
                  "coverageCat": { 'content': 'Total For Plan', styles: { fontStyle : 'bold'} },
                  "noOfProc": totalNoOfProcPlan,
                  "amountClaimed": this.currentUserService.convertAmountToDecimalWithDoller(totalAmountClaimedPlan),
                  "professionalAmtPaid": this.currentUserService.convertAmountToDecimalWithDoller(totalProfessionalAmtPaidPLan),
                  "labPaid": this.currentUserService.convertAmountToDecimalWithDoller(totalPabPaidPLan),
                  "amountPaid": this.currentUserService.convertAmountToDecimalWithDoller(totalAmountPaidPlan)
                });
                noOfProcPlan = 0
                amountClaimedPlan = 0
                professionalAmtPaidPlan = 0
                labPaidPLan = 0
                amountPaidPlan = 0
              } else {
                
              }
            }
          }
          }
          // Total Count For Company
          body.push({
            "coverageCat": { 'content': 'Total For Company', styles: { fontStyle: 'bold', fontSize: 9} },
            "noOfProc": { 'content': totalNoOfProcComp, styles: { fontStyle: 'bold', fontSize: 9} },
            "amountClaimed": { 'content': this.currentUserService.convertAmountToDecimalWithDoller(totalAmountClaimedComp), styles: { fontStyle: 'bold', fontSize: 9} },
            "professionalAmtPaid": { 'content': this.currentUserService.convertAmountToDecimalWithDoller(totalProfessionalAmtPaidComp), styles: { fontStyle: 'bold', fontSize: 9} },
            "labPaid": { 'content': this.currentUserService.convertAmountToDecimalWithDoller(totalPabPaidComp), styles: { fontStyle: 'bold', fontSize: 9} },
            "amountPaid": { 'content': this.currentUserService.convertAmountToDecimalWithDoller(totalAmountPaidComp), styles: { fontStyle: 'bold', fontSize: 9} }
          });

          var headerobject = [];
          headerobject.push({
            'gridHeader1': this.reportPopUpTitle,
            'text5Date': FromDate
          });
          this.pdfHeader(doc, headerobject);
          //End Header  
          doc.autoTable(columns, body, {
            styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
            headStyles: {
              fillColor: [255, 255, 255],
              textColor: [0, 0, 0],
              lineColor: [215, 214, 213],
              lineWidth: 1,
            },
            columnStyles: {
              "coverageCat": { halign: 'left' },
              "noOfProc": { halign: 'right' },
              "amountClaimed": { halign: 'right'},
              "professionalAmtPaid": { halign: 'right'},
              "labPaid": { halign: 'right'},
              "amountPaid": { halign: 'right'}
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


  /**
* PDF Header for quikcard reports
* @param doc 
* @param headerobject 
*/
  pdfHeader(doc, headerobject) {
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAA2CAYAAAAGRjHZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEQ4M0Q4NjE1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEQ4M0Q4NjA1NTBBMTFFOEE3QzVFNjk3RkREMEY4QjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTU1MzkwMUYzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTU1MzkwMjAzRTQxMTFFOEJGREZGNjQwNDg5QzFGMTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4x0Cf0AAAW60lEQVR42uxd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';
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
    var imageData = 'data:image/png;base64,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';
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
   * Remove multi select
   * @param item 
   * @param type 
   */
  onDeSelectMultiDropDown(item: any, type) {
    if (type == 'overrideReason') {
      this.selectedOverrideReason = []
      if (this.overrideReason.length > 0) {
        for (var j = 0; j < this.overrideReason.length; j++) {
          this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
        }
      } else {
        this.filterReport.controls[type].setValue('')
      }
    }
  }

  /**
   * Get selected multi select list
   * @param item 
   */
  onSelectMultiDropDown(item: any, type) {
    this.selectedOverrideReason = []
    for (var j = 0; j < this.overrideReason.length; j++) {
      this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
    }
    if (type == 'overrideReason') {
      this.filterReport.controls[type].setValue(this.selectedOverrideReason);
    } else {
      this.filterOverrideReason = this.selectedOverrideReason;
    }
  }

  /**
   * On select all multi select dropdown values
   * @param items 
   * @param type 
   */
  onSelectAllMultiDropDown(items: any, type) {
    if (type == 'overrideReason') {
      this.selectedOverrideReason = []
      for (var j = 0; j < this.overrideReason.length; j++) {
        this.selectedOverrideReason.push({ 'id': this.overrideReason[j]['id'], 'itemName': this.overrideReason[j]['itemName'] })
      }
      this.filterReport.controls[type].setValue(this.selectedOverrideReason);
    }
  }

  /**
  * Empty the dropdown value
  * @param items 
  * @param type 
  */
  onDeSelectAllMultiDropDown(items: any, type) {
    if (type == 'overrideReason') {
      this.selectedOverrideReason = []
    }
  }

  /* Get OverrideReason Type List for Predictive Search */
  getOverrideReason() {
    var URL = UftApi.getCardholderNameForClaimPayment + this.filterReport.value.cardNumber;
    this.hmsDataService.getApi(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let arr = [];
        for (var i = 0; i < data.result.length; i++) {
          arr.push({ 'id': data.result[i].cardholderKey, 'itemName': data.result[i].cardholderName })

        }
        this.overrideReasonList = arr
      }
    });
  }

  getPredictiveBrokerMailingSearchData(completerService) {
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

  onBrokerNameNoSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedBrokerId = selected.originalObject.brokerId
      this.selectedBrokerName = selected.originalObject.brokerName
    } else {
      this.selectedBrokerId = ''
      this.selectedBrokerName = ''
    }
  }

  onBlurBrokerNameNo(filterReport) {
    if (filterReport.value.brokerNameOrNumber == '') {
      this.selectedBrokerId = ''
      this.selectedBrokerName = ''
    }
  }

  getDisciplineList() {
    var userId = this.currentUser.userId
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      businessTypeKey = 0
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
    }
    let requiredInfo = {
      "cardKey": 0,
      "userId": +userId,
      "businessTypeKey": businessTypeKey
    }
    this.hmsDataService.postApi(ServiceProviderApi.getDisciplineList, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.disciplineType = data.result
        if (this.currentUser.businessType.isAlberta) {
          this.filterReport.patchValue({ 'disciplineType': 1 });
        } else {
          this.filterReport.patchValue({ 'disciplineType': 0 });
        }
      } else {
      }
    })
  }

  getDiscipline() {
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

  onDisciplineSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedDiscipline = selected.originalObject.disciplineName;
    }
    else {
      this.selectedDiscipline = '';
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

  onChangeDiscipline(event) {
    var discKey;
    discKey = this.claimService.getDiscKey(event.target.value)
    this.getSpeciality(discKey)
  }

  getSpeciality(value) {
    let submitInfo = {};
    submitInfo = {
      "disciplineKey": +value
    }
    this.hmsDataService.postApi(ServiceProviderApi.getSpeciality, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.specialityList = data.result
      } else {
        this.specialityList = []
      }
    })
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


  selected(tableType) {
  }

  getPredictiveCoAkiraBenefitSearchData(completerService) {
    this.compAkiraDataRemote = completerService.remote(
      null,
      "name,cd",
      "cd"
    );
    this.compAkiraDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.compAkiraDataRemote.urlFormater((term: any) => {
      return UftApi.getPredictiveCoAkiraBenefitUrl + `/${term}`;
    });
    this.compAkiraDataRemote.dataField('result');
  }

  onCompanyAkiraSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedCompany = selected.originalObject;
      this.selectedCompanyName = selected.originalObject.name
      this.compId = selected.originalObject.cd
    } else {
    }
  }

  onCompanyAkiraBlur(filterReport) {
    this.compId = filterReport.value.searchCompany
  }

}
