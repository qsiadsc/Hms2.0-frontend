import { HttpClient, HttpHeaders, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core'; // to make its methos available in all other methods
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CurrentUserService } from './current-user.service'; //  contain all metaData of loggedIn User
import { Constants } from '../../Constants'
import { CommonApi } from '../../common-api'
@Injectable()
export class HmsDataServiceService {
  public businessTypeList
  public currentUser: any;
  public userBusinnesType: any;
  public userVal: any;
  bothAcessdefaultBussinesType: any;
  constructor(
    private http: HttpClient,
    private currentUserService: CurrentUserService,
    private toastrService: ToastrService) {
    if (window.performance) {
    }
    if (performance.navigation.type == 1) {
    } else {
    }
  }

  /**
   * Generic Get Method
   * Developer - Tarun
   * @param apiUrl - Api URL 
   */
  getApi(apiUrl: string) {
    return this.http.get(apiUrl, { headers: { 'content-type': 'application/json', "Authorization": "bearer " + localStorage.getItem('currentUser') } })
      .map(function(response){
        return response;
      })
      .catch((e: any) => Observable.throw(this.errorHandler(e, apiUrl)));
  }
  /**
   * Generic Post Method
   * Developer - Tarun
   * @param apiUrl - Api URL 
   * @param body - Body of API
   */
  postApi(apiUrl: string, body: any) {
    return this.http.post(apiUrl, JSON.stringify(body), { headers: { 'content-type': 'application/json', "Authorization": this.currentUserService.token } })
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, apiUrl)));
  }

  /**
* Traverses a javascript object, and deletes all circular values
* @param source object to remove circular references from
* @param censoredMessage optional: what to put instead of censored values
* @param censorTheseItems should be kept null, used in recursion
* @returns {undefined}
*/
  preventCircularJson(source, censoredMessage, censorTheseItems) {
    //init recursive value if this is the first call
    censorTheseItems = censorTheseItems || [source];
    //default if none is specified
    censoredMessage = censoredMessage || "CIRCULAR_REFERENCE_REMOVED";
    //values that have allready apeared will be placed here:
    var recursiveItems = {};
    //initaite a censored clone to return back
    var ret = {};
    //traverse the object:
    for (var key in source) {
      var value = source[key]
      if (typeof value == "object") {
        //re-examine all complex children again later:
        recursiveItems[key] = value;
      } else {
        //simple values copied as is
        ret[key] = value;
      }
    }
    //create list of values to censor:
    var censorChildItems = [];
    for (var key in recursiveItems) {
      var value = source[key];
      //all complex child objects should not apear again in children:
      censorChildItems.push(value);
    }
    //censor all circular values
    for (var key in recursiveItems) {
      var value = source[key];
      var censored = false;
      censorTheseItems.forEach(function (item) {
        if (item === value) {
          censored = true;
        }
      });
      if (censored) {
        //change circular values to this
        value = censoredMessage;
      } else {
        //recursion:
        value = this.preventCircularJson(value, censoredMessage, censorChildItems.concat(censorTheseItems));
      }
      ret[key] = value
    }
    return ret;
  }

  /**
  * Generic Post Method
  * Developer - Tarun
  * @param apiUrl - Api URL 
  * @param body - Body of API
  */
  postApi1(apiUrl: string, body: any) {
    return this.http.post(apiUrl, body, { headers: { 'content-type': 'application/json', "Authorization": this.currentUserService.token } })
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, apiUrl)));
  }

  /**
  * Generic Post Method
  * Developer - Tarun
  * @param apiUrl - Api URL 
  * @param body - Body of API
  */
  postApiCircular(apiUrl: string, body: any) {
    return this.http.post(apiUrl, body, { headers: { 'content-type': 'application/json', "Authorization": this.currentUserService.token } })
      .map((data: Response) => data.json())
      .subscribe(
        data => data,
        error => console.log(error)
      );
  }

  /**
   * Generic PUT Method
   * Developer - Tarun
   * @param apiUrl - Api URL 
   * @param body - Body of API
   */
  putApi(apiUrl: string, body: any) {
    return this.http.put(apiUrl, JSON.stringify(body), { headers: { 'content-type': 'application/json', "Authorization": this.currentUserService.token } })
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, apiUrl)));
  }

  //Get method to get data from api of Get type
  get<T>(url: string): Observable<any> {
    return this.http.get<any>(url)
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, url)));
  }

  //Post method to get data from api of Post type
  post<T>(url: string, body: any): Observable<any> {
    return this.http.post<any>(url, body)
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, url)));
  }

  //Post method to get data from api of Post type
  put<T>(url: string, body: any): Observable<any> {
    return this.http.put<any>(url, body)
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, url)));
  }

  //Delete method to Access api of Delete type
  delete<T>(url: string): Observable<any> {
    return this.http.delete<any>(url)
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, url)));
  }

  //Patch method to Access api of Patch type
  patch<T>(url: string, body: string): Observable<any> {
    return this.http.patch<any>(url, body)
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, url)));
  }

  sendFormData(apiUrl: string, body: any) {
    return this.http.post<any>(apiUrl, body, { headers: { "Authorization": this.currentUserService.token } })
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, apiUrl)));
  }

  //catch error if API throws any error
  errorHandler(error: any, apiURl: string): void {
    if (error.status == '401') {
      localStorage.clear();
      location.href = '/'
    }
  }
  loginerrorHandler(error: any, apiURl: string): void {
    this.currentUserService.loginText = "Login";
    this.currentUserService.disabledItem = false;
    this.currentUserService.showLoader = true
    this.toastrService.error('Invalid credentials!')
  }

  login(apiUrl: string, body: any) {
    return this.http.post<any>(apiUrl, body, { headers: { "Authorization": 'Basic cXVpa2NhcmQ6dmljdG9yeQ==' } })
      .map(response => response)
      .catch((e: any) => Observable.throw(this.loginerrorHandler(e, apiUrl)));
  }

  loginApi(apiUrl: string, body: any) {
    return this.http.post(apiUrl, JSON.stringify(body), { headers: { "Authorization": 'Basic cXVpa2NhcmQ6dmljdG9yeQ==' } })
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, apiUrl)));
  }

  forgot(apiUrl: string, body: any) {
    return this.http.post<any>(apiUrl, body, { headers: { 'content-type': 'application/json' } })
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, apiUrl)));
  }

  //toggle all modals
  OpenCloseModal(btnId: string) {
    $('#' + btnId).click();
  }

  OpenCloseModal2(btnId: string) {
    $('#' + btnId).trigger('click');
  }

  OpenCloseModalForOverride(btnId: string) {
    let checkvalue = false;
    let ObservableObj = Observable.interval(.1000).subscribe(x => {
      if (checkvalue == true) {
      } else {
        $(document).on('click', '#' + btnId, function () {
          checkvalue = true;
          ObservableObj.unsubscribe();
        })
        $('#' + btnId).trigger('click');
      }
    })
  }

  showHideNotifications(className: string, innerHTML: string) {
    var x = document.getElementById("snackbar");
    x.className = className;
    x.innerHTML = innerHTML
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
  }

  getUserType() {
    var id = localStorage.getItem('id')
    var username = localStorage.getItem('user')
    if (id == Constants.quikcardUserId) {
      return "quikcard"
    } else {
      return "AB Gov."
    }
  }

  getUserDepartment() {
    let departMentKey = localStorage.getItem('bsnsKey')
    if (departMentKey == Constants.albertaUserId) {
      return "AB Gov."
    } else {
      return "Quikcard"
    }
  }

  getUserTypeForComment() {
    var id = localStorage.getItem('id')
    if (id == Constants.quikcardUserId) {
      return "Quikcard"
    } else {
      return "AB Gov."
    }
  }
  /**
  @returns User Bussiess Type key
  */
  getUserBussnType() {
    var id = localStorage.getItem('id')
    if (id == Constants.albertaUserId || id == Constants.doctorUserId || id == Constants.govUserId || localStorage.getItem('bsnsKey') == Constants.albertaUserId) {
      return Constants.albertaBusnsTypeKey
    } else {
      return Constants.quikcardBusnsTypeKey
    }
  }

  /**
   * 
   * @param value bussiness type key or bussiness type Description
   * @returns bussiness type code
   */
  getBsnstypeCD(value) {
    let bsTypeKey
    value != "" ? bsTypeKey = value : bsTypeKey = this.getUserBussnType()
    if (bsTypeKey == Constants.albertaBusnsTypeKey || bsTypeKey == Constants.albertaGov) {
      return Constants.albertaBusinessTypeCd
    } else if (bsTypeKey == Constants.quikcardBusnsTypeKey || bsTypeKey == Constants.quikcard) {
      return Constants.quikcardBusinessTypeCd
    }
  }

  getBsnstypeCDByDeptKey() {
    let bsTypeKey = localStorage.getItem('bsnsKey')
    if (bsTypeKey == Constants.albertaUserId) {
      return Constants.albertaBusinessTypeCd
    } else {
      return Constants.quikcardBusinessTypeCd
    }
  }

  getHeaderActiveLink() {
    $(document).ready(function () {

      "use strict";

      $('.menu > ul > li:has( > ul)').addClass('menu-dropdown-icon');
      //Checks if li has sub (ul) and adds class for toggle icon - just an UI

      $('.menu > ul > li > ul:not(:has(ul))').addClass('normal-sub');
      //Checks if drodown menu's li elements have anothere level (ul), if not the dropdown is shown as regular dropdown, not a mega menu (thanks Luka Kladaric)

      $(".menu > ul").before("<a href=\"#\" class=\"menu-mobile\"></a>");

      //Adds menu-mobile class (for mobile toggle menu) before the normal menu
      //Mobile menu is hidden if width is more then 959px, but normal menu is displayed
      //Normal menu is hidden if width is below 959px, and jquery adds mobile menu
      //Done this way so it can be used with wordpress without any trouble

      $(".menu > ul > li.menu-dropdown-icon").hover(
        function (e) {
          if ($(window).width() > 943) {
            $(this).toggleClass("menu-active");
          }
        }
      );

      $(".menu > ul > li").hover(
        function (e) {
          if ($(window).width() > 943) {
            $(this).children("ul").stop().slideDown(150);
            e.preventDefault();
          }
        }, function (e) {
          if ($(window).width() > 943) {
            $(this).children("ul").stop().slideUp(150);
            e.preventDefault();
          }
        }
      );
      //If width is more than 943px dropdowns are displayed on hover
      $(".menu > ul > li").click(function () {
        if ($(window).width() < 943) {
          $(this).children("ul").slideToggle(150);
        }
      });
      //If width is less or equal to 943px dropdowns are displayed on click (thanks Aman Jain from stackoverflow)
      $(".menu-mobile").click(function (e) {
        $(".menu > ul").slideToggle().toggleClass('show-on-mobile');
        e.preventDefault();
      });
      //when clicked on mobile-menu, normal menu is shown as a list, classic rwd menu story (thanks mwl from stackoverflow)
    });

  }

  b64toBlob(b64Data, contentType, sliceSize = 512) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  removeDuplicates(originalArray, objKey) {
    var trimmedArray = [];
    var values = [];
    var value;
    for (var i = 0; i < originalArray.length; i++) {
      value = originalArray[i][objKey];
      if (values.indexOf(value) === -1) {
        trimmedArray.push(originalArray[i]);
        values.push(value);
      }
    }
    let finalArray = trimmedArray.filter(function (e) {
      return e.itemName != undefined;
    });
    return finalArray;
  }

  /* This method used remove duplicacy of province in Tax Rate Screen */
  removeDuplicatesKeys(originalArray, objKey) {
    var trimmedArray = [];
    var values = [];
    var value;
    for (var i = 0; i < originalArray.length; i++) {
      value = originalArray[i][objKey];
      if (values.indexOf(value) === -1) {
        trimmedArray.push(originalArray[i]);
        values.push(value);
      }
    }
    return trimmedArray;
  }

  // Log #1162: Delete API with authorization
  deleteApi<T>(url: string): Observable<any> {
    return this.http.delete<any>(url, { headers: { "Authorization": this.currentUserService.token } })
      .map(response => response)
      .catch((e: any) => Observable.throw(this.errorHandler(e, url)));
  }

  downloadPdf(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

}

@Injectable()
export class HmsInterceptor implements HttpInterceptor {
  constructor(
    private currentUserService: CurrentUserService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token: string; // get the token from a service
    if (this.currentUserService.token) //check whether user is loggedIn
    {
      token = this.currentUserService.token
    }
    else {
      token = this.currentUserService.loginToken //else set token to the login request
    }
    token = this.currentUserService.token
    // setting the accept header
    if (token) {
      this.currentUserService.token = token
      req = req.clone({ headers: req.headers.set('Authorization', token) });
    }
    if (!req.headers.has('Content-Type')) {
      req = req.clone({});
    }
    return next.handle(req);
  }

}