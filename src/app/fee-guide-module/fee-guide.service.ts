import { HmsDataServiceService } from './../common-module/shared-services/hms-data-api/hms-data-service.service';
import { Injectable, EventEmitter } from '@angular/core';
import { FeeGuideApi } from './fee-guide-api';
import {Observable} from 'rxjs';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';

@Injectable()
export class FeeGuideService {
  yearList:any;
  yearList1:any;
  selectedYear;
  effectiveDate=[];
  feeGuideKey=[];
  
  constructor(
    private hmsDataService:HmsDataServiceService,
    private completerService: CompleterService,
  ) { }

  getYearList() {
    let promise = new Promise((resolve, reject) => {
      this.hmsDataService.getApi(FeeGuideApi.yearListUrl).subscribe(async data => {
        if (data.code == 200 && data.status === "OK") {
          this.yearList = data.result
          this.yearList1 = data.result
          this.yearList = this.completerService.local(
            this.yearList,
            "year",
            "year"
          );
          resolve();
          return this.yearList
        } else {
          resolve();
          return this.yearList
        }
      })
    })
    return promise;
  }

  yearListValue(year){
    let promise = new Promise((resolve, reject) => {
      let submitData={
        'effectiveOn':year
      }
      this.hmsDataService.postApi(FeeGuideApi.getUsclsFeeGuideList,submitData).subscribe(async data => {
        if (data.code == 200 && data.status === "OK") {
          this.effectiveDate = data.result
          resolve();
          return this.effectiveDate
        } else {
          resolve();
          return this.effectiveDate = []
        }
      })
    })
    return promise;
  }

  getDateList(year){
    let promise = new Promise((resolve, reject) => {
      let submitData={
        'effectiveOn':year
      }
      this.hmsDataService.postApi(FeeGuideApi.getUsclsFeeGuideList,submitData).subscribe(async data => {
        if (data.code == 200 && data.status === "OK") {
          this.effectiveDate = data.result
          resolve();
          return this.effectiveDate
        } else {
          resolve();
          return this.effectiveDate = []
        }
      })
    })
    return promise;
  }

}