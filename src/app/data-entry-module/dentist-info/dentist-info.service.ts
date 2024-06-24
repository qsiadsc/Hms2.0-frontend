import { Injectable,EventEmitter } from '@angular/core';

@Injectable()
export class DentistInfoService {
  public getTestKey = new EventEmitter();
  public getProvBillingAddressKey = new EventEmitter();
  constructor() { }

}
