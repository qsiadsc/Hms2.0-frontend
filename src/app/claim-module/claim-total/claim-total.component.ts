import { Component, OnInit, ViewChild, Inject, ViewChildren, Input, QueryList, OnChanges, SimpleChange } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { Constants } from '../../common-module/Constants';
import { ClaimApi } from '../claim-api';
import { ClaimService } from './../claim.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { Subject } from 'rxjs/Rx';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-claim-total',
  templateUrl: './claim-total.component.html',
  styleUrls: ['./claim-total.component.css'],
  providers: [DatatableService, CurrencyPipe]
})

export class ClaimTotalComponent implements OnInit, OnChanges {
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  @Input() resetForm: any;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  ClaimTotalFormGroup: FormGroup;
  TotalClaimGeneralInformationFormGroup: FormGroup;
  /* General Information Component */
  TotalDetails;
  FormGroup: FormGroup;
  claimId;
  viewMode: boolean = false; //Enable true after a new claim added
  cardHeading: string = "Add" //Heading name change on add/edit
  buttonText = "Save";//button text for Save/Edit/Update
  referClaim: FormGroup;
  contactHistorytableData: any;
  cardaddressHistory: any;
  disciplineKey;
  @Input() claimTotalAddMode: boolean; //set value edit value
  @Input() claimTotalViewMode: boolean; //set value View value
  @Input() claimTotalEditMode: boolean; //set value Add value
  editMode: boolean = true; //Enable true after a new claim added
  CH_RecievedDate: string
  descipline_type;
  selectedPayee: number
  TotalclaimType;
  arrClaimType;
  TotalValue;
  todaydate;
  getCcMax;
  getDivMax;
  getClaimSecureMax;
  getHsaMax;
  getHsaMaxValue;
  getCovMax;
  getCcMaxValue;
  getDivMaxValue;
  getClaimSecureMaxValue;
  getCovMaxxValue;
  claimStatusNew;
  IgnoreExtraBenefits;
  PendingPaperWork;
  currentUser: any;
  businessTypeDesc: any;
  businessTypeCd: any;
  cardholderKey: any;
  subClaimType: Subscription;
  bsnsType: string = '';
  bsnsTypeCd: any;
  hideForADSC: boolean = true;
  claimReferenceNumber: any;
  totalClaims = 0;
  isQuikcard: any;
  i: any=0;
  getWellMax;
  getWellMaxValue: boolean = false
  authorizedEb
  subClaimBussinessKey: Subscription;
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "resetForm" && !changedProp.firstChange) {
        if (this.IgnoreExtraBenefits == 'T')
          document.getElementById('IgnoreExtraBenefits').click();

        if (this.PendingPaperWork == 'T')
          document.getElementById('PendingPaperWork').click();
      }
    }

  }

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private fb: FormBuilder,
    private claimService: ClaimService,
    public datatableService: DatatableService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private cp: CurrencyPipe
  ) {
    currentUserService.loggedInUserVal.subscribe(val => {
      this.currentUser = val
    })
    claimService.getTotalsValues.subscribe(value => {
      this.patchTotalsData(value);
    })

    claimService.getCardHolderKey.subscribe(value => {
      this.cardholderKey = value
    })

    claimService.updateButtonValueForTotals.subscribe(value => {
      this.editMode = value
    })

    //Claim Ref Num(322 Issue)    
    claimService.claimReferenceNumber.subscribe(value => {
      this.claimReferenceNumber = value
      
    })
    //issue no 737 start
    this.claimService.totalClaims.subscribe(value => {
      this.totalClaims = value.length;
      this.ClaimTotalFormGroup.patchValue({
        totalClaime: this.totalClaims,
      })
    })
    // /issue no 737 End`
    this.subClaimBussinessKey = this.claimService.claimBussinessKey.subscribe(val => {
      this.isQuikcard = val
    })
  }

  ngOnInit() {
    this.todaydate = this.changeDateFormatService.getToday();
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        var claimId
        var type
        this.route.params.subscribe((params: Params) => {
          this.claimId = params['id']
          claimId = params['id']
          type = params['type']
          this.disciplineKey = type;
        });
      }
    }
    let RequestedData = {
      "dentalClaim": {
        "claimKey": +this.claimId
      }
    }
   

    this.ClaimTotalFormGroup = new FormGroup({
      totalClaime: new FormControl(''),
      Claimed: new FormControl(''),
      Allowed: new FormControl(''),
      Carrier: new FormControl(''),
      NotCovered: new FormControl(''),
      Deductible: new FormControl(''),
      Payable: new FormControl(''),
      IgnoreExtraBenefits: new FormControl(''),
      PendingPaperWork: new FormControl(''),
      ReferenceNumber: new FormControl(''),
      authorizedEb: new FormControl('')
    });
    this.TotalClaimGeneralInformationFormGroup = new FormGroup({
      TotalclaimType: new FormControl(''),
      Totalentry_date: new FormControl(''),
      Totaltype: new FormControl(''),
      Totaloperator: new FormControl(''),
      Totalreference: new FormControl(''),
      TotaluserId: new FormControl(''),
      Totalmodified_date: new FormControl('')
    });
    this.dtOptions['ClaimTotalCOVMax'] = Constants.dtOptionsConfig
    this.dtTrigger['ClaimTotalCOVMax'] = new Subject();
    this.subClaimType = this.claimService.getCardKey.subscribe(value => {
      this.bsnsType = value.bussinessType
      this.bsnsTypeCd = value.bussinessTypeCd
      if (this.bsnsTypeCd != undefined && this.bsnsTypeCd == Constants.albertaBusinessTypeCd) {
        this.hideForADSC = false;
      } else {
        this.hideForADSC = true;
      }
    });
  }

  ngAfterViewInit(): void {
  }

  /**
   * Generate Reference Number
   * @date 20 Nov 2019
   */
  getReferenceNumber() {
    this.ClaimTotalFormGroup.patchValue({ 'ReferenceNumber': this.claimReferenceNumber });
  }

  patchTotalsData(value) {
    var claimedValue = this.cp.transform(value.ClaimTotalFormGroup.Claimed, 'USD', true);
    var allowedValue = this.cp.transform(value.ClaimTotalFormGroup.Allowed, 'USD', true);
    var carrierValue = this.cp.transform(value.ClaimTotalFormGroup.Carrier, 'USD', true);
    var notCoveredValue = this.cp.transform(value.ClaimTotalFormGroup.NotCovered, 'USD', true);
    var deductibleValue = this.cp.transform(value.ClaimTotalFormGroup.Deductible, 'USD', true);
    var payableValue = this.cp.transform(value.ClaimTotalFormGroup.Payable, 'USD', true);
    this.ClaimTotalFormGroup.patchValue({
      totalClaime: this.totalClaims,
      Claimed: claimedValue,
      Allowed: allowedValue,
      Carrier: carrierValue,
      NotCovered: notCoveredValue,
      Deductible: deductibleValue,
      Payable: payableValue,
      IgnoreExtraBenefits: (value.ClaimTotalFormGroup.IgnoreExtraBenefits == 'F') ? false : true,
      PendingPaperWork: (value.ClaimTotalFormGroup.PendingPaperWork == 'F') ? false : true,
      ReferenceNumber: (value.ClaimTotalFormGroup.ReferenceNumber),
      authorizedEb: (value.ClaimTotalFormGroup.authorizedEb == 'T') ? true : false
    })
  }

  IgnoreExtraBenefitsValue(evt) {
    if (evt.target.checked) {
      this.IgnoreExtraBenefits = "T";
    } else {
      this.IgnoreExtraBenefits = "F";
    }
    this.claimService.getTotalsCheckboxValue.emit(this.IgnoreExtraBenefits)
  }

  PendingPaperWorkValue(evt) {
    if (evt.target.checked) {
      this.PendingPaperWork = "T";
    } else {
      this.PendingPaperWork = "F";
    }
    this.claimService.getTotalsPendingPaperWorkCheckboxValue.emit(this.PendingPaperWork)
  }

  authorizedEbValue(evt) {
    if (evt.target.checked) {
      this.authorizedEb = "T";
    } else {
      this.authorizedEb = "F";
    }
    this.claimService.getAuthorizedEbCheckboxValue.emit(this.authorizedEb)
  }
  
  /* General Information Component*/
  getDisciplineKey($event) {
    this.disciplineKey = $event
  }

  getClaimTotals() {
    this.i++
    let requiredInfo = {
      "cardholderKey": this.cardholderKey,
      "refDate": this.CH_RecievedDate,
      "claimKey": this.claimId,
      "disciplineKey": this.disciplineKey
    }
    this.hmsDataService.postApi(ClaimApi.getTotalForClaim, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
              let cardResult = this.contactHistorytableData = data.result
        this.getCcMax = (cardResult.getCcMax != undefined && cardResult.getCcMax != null) ? cardResult.getCcMax : []
        this.getDivMax = this.contactHistorytableData = cardResult.getDivMax
        this.getClaimSecureMax = (cardResult.getClaimSecureMax != undefined && cardResult.getClaimSecureMax != null) ? cardResult.getClaimSecureMax : []
        this.getHsaMax = (cardResult.getHsaMax != undefined && cardResult.getHsaMax != null) ? cardResult.getHsaMax : []
        this.getHsaMaxValue = (cardResult.getHsaMax.length > 0) ? true : false;
        this.getCcMaxValue = (cardResult.getCcMax.length > 0) ? true : false;
        this.getDivMaxValue = ((cardResult.getHsaMax && cardResult.getHsaMax.length <= 0) && (cardResult.getDivMax && cardResult.getDivMax.length > 0)) ? true : false;
        this.getClaimSecureMaxValue = (cardResult.getClaimSecureMax != undefined && cardResult.getClaimSecureMax != null && cardResult.getClaimSecureMax.length > 0) ? true : false; //(cardResult.getClaimSecureMax && cardResult.getClaimSecureMax.length > 0) ? true : false;
        this.getCovMaxxValue = (cardResult.getCovMax.length > 0) ? true : false;
        this.getCovMax = (cardResult.getCovMax != undefined && cardResult.getCovMax != null) ? cardResult.getCovMax : []
        this.getWellMax = (cardResult.getWellMax != undefined && cardResult.getWellMax != null) ? cardResult.getWellMax : []
        this.getWellMaxValue = (cardResult.getWellMax.length > 0) ? true : false
        if (!$.fn.dataTable.isDataTable('#ClaimTotalCOVMax')) {
          this.dtTrigger['ClaimTotalCOVMax'].next()
        } else {
          this.reloadTable('ClaimTotalCOVMax');
        }

      } else if (data.code == 400 && data.status == "BAD_REQUEST" && data.message == "UNKOWN_TYPE_OF_YEAR_M") {
        this.toastrService.error("Unknown Type Of Year Or Month Selected In Claim")
        this.getHsaMaxValue = false;
        this.getCcMaxValue = false;
        this.getDivMaxValue = false;
        this.getClaimSecureMaxValue = false;
        this.getCovMaxxValue = false;
        this.getCcMax = []
        this.getDivMax = []
        this.getClaimSecureMax = []
        this.getHsaMax = []
        this.getCovMax = []
        this.getWellMax = []
        this.getWellMaxValue = false
      }
      else {
        this.getHsaMaxValue = false;
        this.getCcMaxValue = false;
        this.getDivMaxValue = false;
        this.getClaimSecureMaxValue = false;
        this.getCovMaxxValue = false;
        this.getCcMax = []
        this.getDivMax = []
        this.getClaimSecureMax = []
        this.getHsaMax = []
        this.getCovMax = []
        this.getWellMax = []
        this.getWellMaxValue = false

      }
      error => {
      }
    })
  }

  reloadTable(tableID) {
    this.datatableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  claimDetaislData() {
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        var claimId
        var type
        this.route.params.subscribe((params: Params) => {
          this.GetClaimType();
          this.getDisciplineList();
          this.claimId = params['id']
          claimId = params['id']
          type = params['type']
          this.disciplineKey = type;
          this.TotalFillClaimDetails(claimId, type)
          this.TotalClaimGeneralInformationFormGroup.disable()
          this.hmsDataService.OpenCloseModal('ClaimedTotalData');
        });

      }
    }
  }

  TotalFillClaimDetails(claimId, type) {
    var userId = this.currentUser.userId
    var submitData = {}
    let submitType = this.claimService.getSubmitParam(type)
    submitData[submitType] = {
      "claimKey": claimId,
      "userId": userId
    }
    this.hmsDataService.postApi(ClaimApi.getClaimDetailsUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        let claimData = data.result[submitType]
        this.CH_RecievedDate = claimData.receivedOn;
        this.getClaimTotals()
        let editData = {
          TotalclaimType: type || claimData.disciplineKey,
          Totalentry_date: this.changeDateFormatService.convertStringDateToObject(claimData.entryDate),
          Totaltype: claimData.claimTypeKey,
          Totaloperator: claimData.operator,
          Totalreference: claimData.refId,
          TotaluserId: claimData.modifiedByUser,
          Totalmodified_date: this.changeDateFormatService.changeDateByMonthName(claimData.modifiedDate),
        }
        this.TotalClaimGeneralInformationFormGroup.patchValue(editData);
      }
    })
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
    this.hmsDataService.postApi(ClaimApi.getDisciplineList, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.TotalclaimType = data.result
        this.TotalClaimGeneralInformationFormGroup.patchValue({ "TotalclaimType": 0 })
      } else {

      }
    })

  }

  GetClaimType() {
    let businessTypeCd = ""
    if (this.currentUser.businessType.bothAccess) {
      businessTypeCd = ""
    } else {
      businessTypeCd = this.currentUser.businessType[0].businessTypeCd
    }
    let submitInfo = {
      "businessTypeCd": businessTypeCd
    }
    this.hmsDataService.postApi(ClaimApi.getClaimListByBsnsType, submitInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.arrClaimType = data.result;
        var key = data.result.filter(val => val.claimTypeDesc === "Paper").map(data => data.claimTypeKey)
        this.TotalClaimGeneralInformationFormGroup.patchValue({ "TotalclaimType": 0 })
        this.TotalClaimGeneralInformationFormGroup.patchValue({ 'type': key });
      } else {
        this.arrClaimType = []
      }
    })

  }

  getDisciplineType(evt) { }

  changeDateFormat(evt, x, y) { }

  ngOnDestroy() {
    if (this.subClaimType) {
      this.subClaimType.unsubscribe()
    }
    if (this.subClaimBussinessKey) {
      this.subClaimBussinessKey.unsubscribe()
    }
  }

}
