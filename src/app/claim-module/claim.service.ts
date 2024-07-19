import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
@Injectable()
export class ClaimService {


  claimSearchedData: any;
  cobVal: any;
  cardRecieveDate: { date: { year: number; month: number; day: number; }; };
  isBackClaimSearch: boolean = false;
  isReverseClaimBtnClickedFromSearchClaimScreen: boolean = false;
  public showBackSearcBtn: boolean = false;

  constructor() { }
  public getPayeeType = new EventEmitter();
  public getDisciplineType = new EventEmitter();
  public getCardHolderKey = new EventEmitter();
  public getDisciplineMobile = new EventEmitter();
  public getCardHolderKeyComment = new EventEmitter();
  public getDisciplineKey = new Subject<any>();
  public getBusinessTypeValue = new EventEmitter();
  public getTotalsValues = new EventEmitter();
  public getCardKey = new EventEmitter();
  public getClaimItems = new EventEmitter();
  public getClaimItemsVission = new EventEmitter();
  public setAdjudication = new EventEmitter();
  public emitOnSaveClaimItem = new EventEmitter();
  public getCardBsnsType = new EventEmitter();
  public getClaimImpCmnt = new EventEmitter();
  public getTotalsPendingPaperWorkCheckboxValue = new EventEmitter();
  public getTotalsCheckboxValue = new EventEmitter();
  public updateButtonValueForTotals = new EventEmitter();
  public updateComments = new EventEmitter();
  public payToOther = new EventEmitter();
  public getCOB = new EventEmitter();
  public hasCardHolder = new EventEmitter();
  public getClaimType = new EventEmitter();
  public setClaimType = new EventEmitter();
  public getRecieveDate = new EventEmitter();
  public mobilClaimData = new EventEmitter();
  public mobilClaimItem = new EventEmitter();
  public getclaimTypeCd = new EventEmitter();
  public getClaimItemsReview = new EventEmitter();
  public disableSave = new EventEmitter();
  public dupClaimItems = new EventEmitter();
  public totalClaims = new EventEmitter();
  public getReadjudiacteData = new EventEmitter();
  public selectedClaimTypeKeyData = new EventEmitter();
  public addNewClaimItem = new EventEmitter();
  public focusOutPaytoAddrEditMode = new EventEmitter();
  public addNewButton = new EventEmitter();
  public claimItemMode = new EventEmitter();
  public setValforUnitDesc = new EventEmitter();
  public getOverideCheck = new EventEmitter();
  public isDasp = new EventEmitter();
  public getLoggedInBussinesType = new EventEmitter();
  public cardCommentsData = new EventEmitter();
  public cardHolderCommentsData = new EventEmitter();
  public claimStatus = new EventEmitter();
  public claimReferenceNumber = new EventEmitter();
  public claimTypeBussinessType = new EventEmitter();
  public claimCardholderObject = new EventEmitter();
  public calimSubmitted = new EventEmitter();
  public AIAdded = new EventEmitter();
  public multipleCob = new EventEmitter();
  public reloadClaimData = new EventEmitter();
  public cob2eligible = new EventEmitter();
  public claimBussinessKey = new EventEmitter();
  public claimStastus = new EventEmitter();
  public checkVisiontable = new EventEmitter();
  public openDuplicateDialog = new EventEmitter();
  public filterComments = new EventEmitter();
  public cardHolderKey = new EventEmitter();
  public isClaimDeleted:boolean = false;
  public getLockedMessage = new EventEmitter();
  public getClaimScannedFileKey = 0
  isAdscDashboard:boolean =false;     // Ticket #1210 By Abhay 
  public getAuthorizedEbCheckboxValue = new EventEmitter()
  public getApiEmitter = new EventEmitter();
  public cardHolderValueEmitter = new EventEmitter();
  public isViewEnable: boolean = false
  public binaryFileNameData = new EventEmitter();
  public emitDisciplineKey = new EventEmitter();
  public enteredClaimComment = new EventEmitter();
  claimKeyData:any = []
  getSubmitParam(disciplineType) {
    if (disciplineType) {
      switch (disciplineType.toString()) {
        case '1':
          return "dentalClaim"

        case '2':
          return "visionClaim"

        case '3':
          return "healthClaim"

        case '4':
          return "drugClaim"

        case '5':
          return "hsaClaim"

        case '6':
          return "wellnessClaim"
      }
    }
  }
  getSubmitParamClaimItem(disciplineType) {
    switch (disciplineType.toString()) {
      case '1':
        return "dentalClaimList"

      case '2':
        return "visionClaimList"

      case '3':
        return "healthClaimList"

      case '4':
        return "drugClaimList"

      case '5':
        return "hsaClaimList"

      case '6':
        return "wellnessClaimList"
    }
  }
  getSubmitParamClaimItemList(disciplineType) {
    switch (disciplineType.toString()) {
      case '1':
        return "dentalClaimItemsList"

      case '2':
        return "visionClaimItemsList"

      case '3':
        return "healthClaimItemsList"

      case '4':
        return "drugClaimItemsList"

      case '5':
        return "hsaClaimItemsList"

      case '6':
        return "wellnessClaimItemsList"
    }
  }
  getParamClaimItem(disciplineType) {
    switch (disciplineType.toString()) {
      case '1':
        return "dentalClaimItems"

      case '2':
        return "visionClaimItems"

      case '3':
        return "healthClaimItems"

      case '4':
        return "drugClaimItems"

      case '5':
        return "hsaClaimItems"

      case '6':
        return "wellnessClaimItems"
    }
  }
  getClaimSearchData(data): any {
    this.claimSearchedData = data
  }
  showViewBackBtn(val) {
    if (val && val == 'T') {
      this.showBackSearcBtn = true
    }
  }
  setCobVal(val) {
    this.cobVal = val
  }

  disciplineConversion(value) {
    let disciplineClaimCheque = []
    if (value == 'DENTAL') {
      disciplineClaimCheque = ["D"]
    } else if (value == 'VISION') {
      disciplineClaimCheque = ["V"]
    } else if (value == 'HEALTH') {
      disciplineClaimCheque = ["H"]
    } else if (value == 'DRUG') {
      disciplineClaimCheque = ["DR"]
    } else if (value == 'SUPPLEMANTAL') {
      disciplineClaimCheque = ["HS"]
    }
    return disciplineClaimCheque
  }

  // #1124: New Feedback
  getDisciplineCode(disciplineType) {
    if (disciplineType) {
      switch (disciplineType.toString()) {
        case '1':
          return "D"

        case '2':
          return "V"

        case '3':
          return "H"

        case '4':
          return "DR"

        case '5':
          return "HS"

        case '6':
          return "W"
      }
    }
  }

  getDiscKey(disciplineType) {
    if (disciplineType) {
      switch (disciplineType.toString()) {

        case 'All':
        return 0

        case 'Dental':
          return 1

        case 'Vision':
          return 2

        case 'Health':
          return 3

        case 'Drug':
          return 4

        case 'HSA'://'Supplemental':
          return 5

        case 'Wellness':
          return 6
      }
    }
  }

  getClaimKeyData(data): any {
    this.claimKeyData.push(data)
  }

}
