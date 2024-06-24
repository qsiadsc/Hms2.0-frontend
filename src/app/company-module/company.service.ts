import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { HttpClient, HttpResponse } from '@angular/common/http';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';


@Injectable()
export class CompanyService {

  status: any;
  brokerExpiredOn: any;
  brokerEffectiveOn: any;
  provinceName: any;
  cityName: any;
  brokerIdAndName: any;
  showBackBrokerSearchBtn: boolean = false;
  companySearchedData: any;
  searchedCompanyName: any;
  searchedCompanyId: any;
  isBackCompanySearch: boolean = false;
  brokerSearchedData: any;
  brokerFooterSearchedData: any;
  public setCompanyData = new EventEmitter()
  public bankAccountHistory = new EventEmitter()
  public getbussinessType = new EventEmitter()
  public getRolAssignedType = new EventEmitter()
  public hideButtons = new EventEmitter()
  public showCommentFlag = new EventEmitter()
  public authCheckFilled = new EventEmitter()
  public selectedReferralOtherVal = new EventEmitter();
  public getPolicyNumber = new EventEmitter();
  private headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsX25hbWUiOiJBcnVuZGVlcCBSYW5kZXYiLCJ1c2VyX2lkIjo0LCJ1c2VyX25hbWUiOiJhcnVuQHNlYXNpYWluZm90ZWNoLmNvbSIsInNjb3BlIjpbIkNPTVBBTllfUkVBRCIsIkNBUkRfUkVBRCIsIkNBUkRIT0xERVJfUkVBRCIsIlBMQU5fUkVBRCIsIkNMQUlNX1JFQUQiXSwiZXhwIjoxNTI5OTA5NjE4LCJqdGkiOiIxZjhhODRkZC04YzFiLTQ3MTgtOTBkNC0wNDlhYzMyMzJiMzEiLCJjbGllbnRfaWQiOiJxdWlrY2FyZCJ9.IyJ9dLBTe8KAr_mAphNNNhnAOemmI0Hzfj9oAuy7KVI2v-3wJih1649THAsZF301J_D8YH9IbMHAVtL9X97FUx_hHLjRZl_gkicpwizjDzIZFIq1eyoDbSJ-tQaciAVZY42GTtiuJr3F_Tuq17cvpZ-QlvSTPZ0Qh_I5FXAINhVDoaPDt7uJeNpNpLyPtD0QXViAcibY55IDBLwZbvIDgkUiwg6LpYfoTzXinfgLxonGTdh7QrXIvMOXjdAOit4L50ZYUlv4fTm2z1uBs8kUKx1-K2eGag7HcTCxZZeSgL2wB95MnuVbLLkqtn_aCGMqDxgPwYFMcLnv_A0M-eJu-A' });
  private Url = 'http://52.8.119.208:3000/api/auth/login/';

  /** test */
  private companyValidations = 'http://10.8.21.64:8765/api/company-service/getCompanyValidation';
  /** test */
  private searchData = '../assets/json/search-data.json';
  public companyViewTermin = new EventEmitter();
  constructor(private http: Http, private httpClient: HttpClient, private router: Router) { }
  companyStatusHeader

  addCompany(submitInfo) {
    const res = { 'coId': '1q2w3e' };
    return this.http
      .post('http://10.8.21.64:8765/api/company-service/getCompanyValidation', res, { headers: this.headers }).toPromise()
      .then(res => true)
  }

  addCardLimit(submitInfo) {
    submitInfo = { email: "admin@gmail.com", password: "mind@123" };
    const res = { 'UserName': 'Ashwani' };
    return this.http
      .post(this.Url, submitInfo, { headers: this.headers }).toPromise()
      .then(res => true)
  }

  addContact(submitInfo) {
    submitInfo = { email: "admin@gmail.com", password: "mind@123" };
    const res = { 'UserName': 'Ashwani' };
    return this.http
      .post(this.Url, submitInfo, { headers: this.headers }).toPromise()
      .then(res => true)
  }



  addLinkBroker(submitInfo) {
    submitInfo = { email: "admin@gmail.com", password: "mind@123" };
    const res = { 'UserName': 'Ashwani' };
    return this.http
      .post(this.Url, submitInfo, { headers: this.headers }).toPromise()
      .then(res => true)
  }

  addBankAccount(bankAccountVal) {
    bankAccountVal = { email: "admin@gmail.com", password: "mind@123" };
    const res = { 'UserName': 'qwerty' };
    return this.http
      .post(this.Url, bankAccountVal, { headers: this.headers }).toPromise()
      .then(res => true)
  }

  brokerInfo(coId) {
    return this.http
      .post(this.companyValidations, coId, { headers: this.headers }).toPromise()
      .then(res => res.json())
  }

  getSearchData() {
    return this.http
      .get(this.searchData)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  getDataToEdit(dataId) {
    return this.http
      .get(this.searchData)
      .map((response: Response) => {
        return response.json();
      })
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    return Observable.throw(error.statusText);
  }

  getCompanySearchData(data, companyName, companyId): any {
    if (this.router.url == "/company") {
      this.companySearchedData = data
      this.searchedCompanyName = companyName
      this.searchedCompanyId = companyId
    }
    else {
      this.companySearchedData = ''
      this.searchedCompanyName = ''
      this.searchedCompanyId = ''
    }
  }

  getBrokerSearchData(data): any {
    this.brokerSearchedData = data
  }

  getBrokerFooterData(data) {
    this.brokerFooterSearchedData = data
    this.brokerIdAndName = data[0].value
    this.cityName = data[1].value
    this.provinceName = data[2].value
    this.brokerEffectiveOn = data[3].value
    this.brokerExpiredOn = data[4].value
    this.status = data[5].value
  }

  getCompanyStatus() {
    return this.companyStatusHeader;
  }

  setCompanyStatus(companyStatus) {
    this.companyStatusHeader = companyStatus;
  }

}
