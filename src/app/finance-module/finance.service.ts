import { Injectable ,EventEmitter} from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { HttpClient, HttpResponse } from '@angular/common/http';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class FinanceService {
  transSearchedData: any;
  searchedCompanyName: any;
   searchedCompanyId: any;
  isBackCompanySearch: boolean = false;
  companySearchedData
  paymentData
  public paymentParams = new EventEmitter();
  public showReportsEmitter = new EventEmitter();
  public showTerminationEmitter = new EventEmitter();
  constructor(private http: Http,private httpClient: HttpClient,private router:Router) { }
  
  getCompanySearchData(data, disciplineArray ): any {
    if(this.router.url=="/finance/transaction-search")
    {
      this.companySearchedData = data
      this.searchedCompanyName = disciplineArray
    } else if (this.router.url=="/finance/payment-search") {
      this.companySearchedData = data
      this.searchedCompanyName = disciplineArray
    } else if (window.location.href.indexOf("/finance/transaction-search") > -1) { // Log #1137: applied for Back to search as per client new feedback(24-Nov-2021)
      this.companySearchedData = data
      this.searchedCompanyName = disciplineArray
    }
    else{
      this.companySearchedData = ''
      this.searchedCompanyName = ''      
    }    
  } 

  getParamsFromPaymentScreen(data): any {
    this.paymentData = data
  }
  
}
