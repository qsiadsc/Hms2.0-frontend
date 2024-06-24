import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ServiceProviderService {
  searchedProviderData: any;
  searchedpostalCodeCd: any;
  lastName: any;
  firstName: any;
  disciplineKey: any;
  speciality: any;
  effectiveDate: any;
  licenseNumber: any;
  status: any;
  postalCode: any;
  isBackProviderSearch: boolean = false;
  
  constructor() { }
  public getTestKey = new EventEmitter();
  public getProvBillingAddressKey = new EventEmitter();
  public getDisciplineKey = new EventEmitter();
  public saveUpdateProvider = new EventEmitter();
  public hideBtn = new EventEmitter();
  public getBanId = new EventEmitter();
  public openSBPopup = new EventEmitter();
  public reloadBillingTable = new EventEmitter();
  public selectedDisciplineKey = new EventEmitter();
  public selectedLanguageKey = new EventEmitter();
  public govtTypeValue = new EventEmitter();
  getSearchedData(value: any ,postalCd): any {
    this.searchedProviderData = value
    this.searchedpostalCodeCd = postalCd
  }
  getFooterSearchedData(value: any,extraParam): any {
    this.lastName = value[0].value
    this.firstName = value[1].value
    this.disciplineKey = value[2].value
    this.speciality = value[3].value
    this.licenseNumber = value[4].value
    this.effectiveDate = value[6].value
    this.status = value[7].value
    this.postalCode = value[8].value
  }
}
