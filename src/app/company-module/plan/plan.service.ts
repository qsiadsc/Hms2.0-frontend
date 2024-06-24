import { Injectable, EventEmitter } from '@angular/core';
/** Added Later */
import { Headers, Http, RequestOptions, Response } from '@angular/http';

import { HttpClient, HttpResponse } from '@angular/common/http';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs';


@Injectable()
export class PlanService {
  public planModuleData = new EventEmitter()
  public hideButtons = new EventEmitter()
  public emitPlanEffectiveDate = new EventEmitter()
  public planCarryForwardData = new EventEmitter()
  public carryforwarderror = new EventEmitter();
  public loader = new EventEmitter();
  public reCall = new EventEmitter();
  public selectedDeductibleTypeVal = new EventEmitter()
  public proratingTypeVal = new EventEmitter()
  public benefitCovCatInlineEffectiveDate;
  public selectedDivisionType = new EventEmitter()
  public selectedDivisionUpdateType = new EventEmitter()
  public rulesTabClicked = new EventEmitter();
  public enableRulesDeleteButton = new EventEmitter();
 
  constructor(private http: Http,private httpClient: HttpClient) { }

}