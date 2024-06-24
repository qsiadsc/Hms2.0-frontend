import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
@Injectable()
export class CardServiceService {
  invokeCardModuleComponentFunction = new EventEmitter();
  subsVar: Subscription;

  public getCardId = new EventEmitter();
  public updateTableData = new EventEmitter();
  public setCompanyChangeEvent = new EventEmitter();  //emit change event when company name inpiut empty
  public getCompanyCoKey = new EventEmitter();
  public redirectCompany = new EventEmitter();

  public getPlanKey = new EventEmitter(); //emit company cokey after getiing key by selecting company in general information
  public getCardHolderData = new Subject<any>();

  public getPrefferedLanguage = new EventEmitter();
  public setPrefferedLanguage = new Subject<any>();

  public getPlan = new Subject<any>();
  public setPlan = new Subject<any>();
  public setSavedCardKey = new EventEmitter();
  public getUpdatedPlanValue = new EventEmitter();
  public bankAccountHistory = new EventEmitter();
  public getCardHolderGeneralInfo = new EventEmitter();
  public CardHolderViewMode = new EventEmitter();
  public setEditModeForCompany = new EventEmitter();
  public getHideIcons = new EventEmitter();
  public emptyAccessToken = new EventEmitter();
  public setCardHolderFormValue = new EventEmitter();
  public resetCompanyName = new EventEmitter();
  public cardStatus = new EventEmitter();
  public setBankAccDisable = new EventEmitter();
  public cardEffectiveDate = new EventEmitter();//Effective Date of Date
  public cardHolderPrimary = new EventEmitter();
  public getCardHolderNameForPrint = new EventEmitter();
  public getbusinesType = new EventEmitter();
  public getbusinessCd = new EventEmitter();
  public setSearchData = new Subject<any>();
  public getChEligibilityKey = new EventEmitter();
  public familyType = new EventEmitter();
  public cardExpiryDate = new EventEmitter();
  public cardEligKey = new EventEmitter();
  public cardEffDate = new EventEmitter();
  public cardCreatedOn = new EventEmitter();
  public cardBankCreatedOn = new EventEmitter();
  public cardEffectiveOnDate = new EventEmitter();
  public cardEffectiveOn = new EventEmitter();
  public cardholderSaveDetails = new EventEmitter();
  public cardholderAddDetails = new EventEmitter();
  public resetComments = new EventEmitter();
  public updateComments = new EventEmitter();
  public emitBusinessKey = new EventEmitter();
  public cardExpiry = new EventEmitter();

  searchData: any;
  searchedCardCompanyName: any;
  isBackCardSearch: boolean;
  showBackSearchBtn: boolean = false;
  public getChEligibilityEffective = new EventEmitter();
  cardExpDate= new EventEmitter();
  public emitPendingClaimHit = new EventEmitter(); // uft Dashboard Module->emit value from call in dashboard when pending claim API is called with -1 company parameter.
  public employeeNumber = new EventEmitter();

  constructor() { }
  setCardHolderData(data) {
    return this.getCardHolderData.next(data);
  }
  setOptionForLanguage(language) {
    return this.getPrefferedLanguage.next(language);
  }

  setGeneralInfoForLanguage(language) {
    return this.setPrefferedLanguage.next(language);
  }

  setOptionForPlan(plan) {
    return this.getPlan.next(plan);
  }

  setCardEligibilityForPlan(plan) {
    return this.setPlan.next(plan);
  }
  getCardSearchData(data, companyName) {
    this.searchedCardCompanyName = companyName
    this.searchData = data;
  }

  getFooterCardSearchData(data) {
  }
}