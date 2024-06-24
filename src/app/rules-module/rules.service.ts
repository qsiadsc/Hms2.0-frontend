import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { HttpClient, HttpResponse } from '@angular/common/http';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable()
export class RulesService {
  backToSearchBtn: boolean;
  ruleSearchedData: any;
  isBackRuleSearch: boolean = true;
  ruleBackToSerchBtn: boolean = false;

  constructor(private http: Http,private httpClient: HttpClient,private router: Router) { }

  getRuleSearchData(data): any {
    if(this.router.url == "/rules/add"){
      this.backToSearchBtn = false
    }else{
      this.ruleSearchedData = data;
    }
  }

}
