import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class DataEntryService {
  showClaimBckBtn: boolean;
  isBackProviderSearch: boolean;
  batchUrl: boolean=false;
  claimSearchedDataEntry:any;
  batchSearchData: any;
  showBatchBackBtn: boolean = false;
  isBackToBatchSearch: boolean = false;
  isBackToClaimSearch:boolean = false;
  selectedBatchStatus: any;

  constructor(private router:Router) { }
  public ClaimItemInsert = new EventEmitter();
  public emitProviderKey = new EventEmitter();//for Provider Key in Edit mode
  public emitProviderName= new EventEmitter();//for Provider Name in claim-info
  public emitPatientHC = new EventEmitter();
  public isFromPHc = new EventEmitter();
  public emitProviderFlag = new EventEmitter(); // for providerFlag 
  public emitDate = new EventEmitter()
  public emitClaimNumber= new EventEmitter();
  public disableSave = new EventEmitter();
  public addnewClicked = new EventEmitter();
  public emitDisciplineKey = new EventEmitter();//for Discipline key
  public emitClaimType = new EventEmitter();//for Discipline key
  /*start for #1264 event emitter to send value in other component*/
  public emitPayToSection = new EventEmitter();
  public emitDisableAddValue = new EventEmitter();
  public emitPayToSectionHide = new EventEmitter();
  /*End*/
  public emitEditStatusValue = new EventEmitter();
  public batchStatus = new EventEmitter();
  public reaccessBtnStatus = new EventEmitter();
  public claimItemMode = new EventEmitter();
  public editReassesBtnStatus = new EventEmitter();
  public emitClaimantAddressBtnStatus = new EventEmitter();
  public emitActionField = new EventEmitter();

  getBatchSearchData(value: any,selectedStatus): any {
   if(this.router.url=="/dataEntry/search/batch")
   {
   this.batchUrl=true;
   }
   else
   {
    this.batchUrl=false;
   }
    this.batchSearchData = value
    this.selectedBatchStatus = selectedStatus
  }

  getClaimSearchDataEntry(data): any {
    if(this.router.url=="/dataEntry/provider-search")
    {
      this.showClaimBckBtn=true;
    }
    else{
      this.showClaimBckBtn=false;
    }
    this.claimSearchedDataEntry = data
    this.isBackProviderSearch=false;
  }
}

