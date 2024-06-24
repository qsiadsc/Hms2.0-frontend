import { Injectable } from '@angular/core';
import { Headers, Http,RequestOptions } from '@angular/http';
import {Constants} from '../common-module/shared-resources/constant'
@Injectable()
export class LoginService {
  private headers = new Headers({'Authorization':'Basic cXVpa2NhcmQ6dmljdG9yeQ=='});
  private loginUrl ='http://203.100.79.169:8765/'+'auth/oauth/token';
  constructor(private http: Http) {
   this.headers.append("Authorization",'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsX25hbWUiOiJBcnVuZGVlcCBSYW5kZXYiLCJ1c2VyX2lkIjo0LCJ1c2VyX25hbWUiOiJhcnVuQHNlYXNpYWluZm90ZWNoLmNvbSIsInNjb3BlIjpbIkNPTVBBTllfUkVBRCIsIkNBUkRfUkVBRCIsIkNBUkRIT0xERVJfUkVBRCIsIlBMQU5fUkVBRCIsIkNMQUlNX1JFQUQiXSwiZXhwIjoxNTI5OTA5NjE4LCJqdGkiOiIxZjhhODRkZC04YzFiLTQ3MTgtOTBkNC0wNDlhYzMyMzJiMzEiLCJjbGllbnRfaWQiOiJxdWlrY2FyZCJ9.IyJ9dLBTe8KAr_mAphNNNhnAOemmI0Hzfj9oAuy7KVI2v-3wJih1649THAsZF301J_D8YH9IbMHAVtL9X97FUx_hHLjRZl_gkicpwizjDzIZFIq1eyoDbSJ-tQaciAVZY42GTtiuJr3F_Tuq17cvpZ-QlvSTPZ0Qh_I5FXAINhVDoaPDt7uJeNpNpLyPtD0QXViAcibY55IDBLwZbvIDgkUiwg6LpYfoTzXinfgLxonGTdh7QrXIvMOXjdAOit4L50ZYUlv4fTm2z1uBs8kUKx1-K2eGag7HcTCxZZeSgL2wB95MnuVbLLkqtn_aCGMqDxgPwYFMcLnv_A0M-eJu-A');
  }
 
  Login(requiredInfo) { 
    return this.http
        .post(this.loginUrl, requiredInfo,{ headers: this.headers})
    }
}