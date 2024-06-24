import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CustomValidators } from './../../common-module/shared-services/validators/custom-validator.directive';
import { Router, ActivatedRoute } from '@angular/router'
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommonApi } from '../../common-module/common-api'
import { CardServiceService } from '../../card-module/card-service.service'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Constants } from '../../common-module/Constants';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { Subscription } from 'rxjs/Subscription'
import { CommonModuleComponent } from '../../common-module/common-module.component'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { CommonDatePickerOptions } from '../../common-module/Constants'; // import common date format
import { ToastrService } from 'ngx-toastr'; //add toster service
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { DataEntryApi } from '../../data-entry-module/data-entry-api'
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { CompanyService } from '../../company-module/company.service';
import { ChangePasswordComponent } from '.././../common-module/shared-component/change-password/change-password.component';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.css'],
  providers: [CommonModuleComponent, ChangeDateFormatService, DatatableService, CompanyService],
  })

export class MainHeaderComponent implements OnInit {
  public changePasswordForm: FormGroup; // change private to public for production-errors
  applicationRoleKey: void;
  redirectURL: any;
  rolAssignedTypeList = [];
  dropdownSettings: {};
  rolAssigned = [];
  userId: string;
  bussinesTypeKey: any;
  menuUFT: {};
  financeArray: any;
  showSwitchButton: boolean;
  initialBatchNumber;
  oldBatchNum;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  //Used to Close Logout Menu If Click Outside
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.eRef.nativeElement.contains(event.target)) {
    } else {
      this.showMenu = true
          }
  }

  menu: any
  menuByOrder: any
  user: any;
  list: any;
  selected: any;
  idleState = '';
  timedOut = false;
  showMenu: boolean = true;
  lastPing?: Date = null;
  currentRoute;
  bussinesType;
  cardHolderName;
  reviewer: boolean = false
  message: string;
  subscription: Subscription;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;//datepicker Options
  submitBatchForm: FormGroup;
  showLoader: boolean = false;
  batchKey = ''
  columns
  ObservableClaimObj
  checkServiceProvider
  oldBtachKey
  showViewBatch: boolean = false
  private httpSubscription: Subscription;
  public text: String;
  keepAliveDialog: boolean = false;
  keepAliveCounter = 0;

  @ViewChild(ChangePasswordComponent) changePasswordComponent; // to acces variable of ChangePasswordComponent from 

  constructor(private router: Router,
    private idle: Idle,
    private keepalive: Keepalive,
    private exDialog: ExDialog,
    private hmsDataServiceService: HmsDataServiceService,
    private cardServiceService: CardServiceService,
    private currentUserService: CurrentUserService,
    private CommonComponent: CommonModuleComponent,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private _hotkeysService: HotkeysService,
    private cardService: CardServiceService,
    private companyService: CompanyService,
    private eRef: ElementRef
  ) {
    this.text = 'no clicks yet';
  }

  liClick(formId) {
    var newUrl = document.getElementById(formId);
    newUrl.className = "active";
    this.changeTheme('')
  }

  select(item) {
    this.selected = item;
  };

  isActive(item) {
    return this.selected === item;
  };

  ngOnInit() {
    this.activateHotKeys();
    this.dropdownSettings = Constants.singleSelectDropdown;
  //  this.getUserRoleId();
    if (localStorage.getItem('isNgOnInitFirst') == '0') {
      this.currentUserService.getUserAuthorization().then(res => {
        var userLoginAttempt = this.currentUserService.currentUser.userLoginAttempt;
        if (userLoginAttempt == 'F') {
          this.hmsDataServiceService.OpenCloseModal('changePasswordButtonPopUpSelf');
          this.updateUserPaaswordAttempt();
        }
        if (this.currentUserService.appHeaderRoleMenu.length > 1) {
          this.rolAssignedTypeList = this.currentUserService.appHeaderRoleMenu;
        } else {
          this.rolAssignedTypeList = [];
        }
        localStorage.setItem('isNgOnInitFirst', '1')
        this.setMenuHeader();
        if (this.currentUserService.currentUser.isAdmin == 'T') {
          this.showSwitchButton = true;
          setTimeout(() => {
            if (this.currentUserService.otpStatus == 'T') {
              $('#myonoffswitch').prop('checked', true);
            } else {
              $('#myonoffswitch').prop('checked', false);
            }
          }, 1000);
        } else {
          this.showSwitchButton = false;
        }
      })
    } else if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        if (this.currentUserService.appHeaderRoleMenu.length > 1) {
          this.rolAssignedTypeList = this.currentUserService.appHeaderRoleMenu;
        } else {
          this.rolAssignedTypeList = [];
        }
        this.setMenuHeader();
        localStorage.setItem('isReload', 'F')
        localStorage.setItem('keepAliveCounter', '0')
        if (this.currentUserService.currentUser.isAdmin == 'T') {
          this.showSwitchButton = true;
          setTimeout(() => {
            if (this.currentUserService.otpStatus == 'T') {
              $('#myonoffswitch').prop('checked', true);
            } else {
              $('#myonoffswitch').prop('checked', false);
            }
          }, 1000);
        } else {
          this.showSwitchButton = false;
        }
      })
    } else if (this.route.queryParams) {
      this.currentUserService.getUserAuthorization().then(res => {
        if (this.currentUserService.appHeaderRoleMenu.length > 1) {
          this.rolAssignedTypeList = this.currentUserService.appHeaderRoleMenu;
        } else {
          this.rolAssignedTypeList = [];
        }
        this.setMenuHeader();
        localStorage.setItem('isReload', 'F')
        if (this.currentUserService.currentUser.isAdmin == 'T') {
          this.showSwitchButton = true;
          setTimeout(() => {
            if (this.currentUserService.otpStatus == 'T') {
              $('#myonoffswitch').prop('checked', true);
            } else {
              $('#myonoffswitch').prop('checked', false);
            }
          }, 1000);
        } else {
          this.showSwitchButton = false;
        }
      })
    } else {
      if (this.currentUserService.appHeaderRoleMenu.length > 1) {
        this.rolAssignedTypeList = this.currentUserService.appHeaderRoleMenu;
      } else {
        this.rolAssignedTypeList = [];
      }
      this.setMenuHeader();
      if (this.currentUserService.currentUser.isAdmin == 'T') {
        this.showSwitchButton = true;
        setTimeout(() => {
          if (this.currentUserService.otpStatus == 'T') {
            $('#myonoffswitch').prop('checked', true);
          } else {
            $('#myonoffswitch').prop('checked', false);
          }
        }, 1000);
      } else {
        this.showSwitchButton = false;
      }
    }
        this.user = (localStorage.getItem('user'));
    this.applicationRoleKey = this.currentUserService.applicationRoleKey
    this.submitBatchForm = new FormGroup({
      batch: new FormControl('',[Validators.required,Validators.minLength(2)]),
      submitBy: new FormControl(''),
      submitOn: new FormControl(''),
      date: new FormControl('')
    });
    this.hmsDataServiceService.getHeaderActiveLink()
    this.currentRoute = this.router.url;
    var todaydate = this.changeDateFormatService.getToday();
    this.submitBatchForm.patchValue({ 'date': todaydate, 'submitOn': todaydate, 'submitBy': this.user });
    this.userId = localStorage.getItem('id')
    if (this.userId == Constants.quikcardUserId) {
      this.bussinesType = "Quikcard"
    } else {
      this.bussinesType = "AB Gov."
    }
    if (this.bussinesType == Constants.albertaGov) {
      this.cardHolderName = "Client"
    } else {
      this.cardHolderName = "Cardholder"
    }
    this.currentRoute = this.router.url;
    var URL = CommonApi.excelNotificationSchedulerList
    var applicationName = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey)
    var reqParamPlan = {
      "paramApplication": applicationName
    }
    this.httpSubscription = Observable.interval(10000 * 60).subscribe(x => {
      this.hmsDataServiceService.postApi(URL, reqParamPlan).subscribe(data => {
        if (data.code == 200) {
        }
      });
    });

    this.changePasswordForm = new FormGroup({
      'oldPassword': new FormControl('', [Validators.required]),
      'newPassword': new FormControl('', [Validators.required, CustomValidators.validPassword]),
      'confirmPassword': new FormControl('', [Validators.required]),
    });
    if (localStorage.getItem('keepAliveCounter') == '0') {
      this.LogOffScreen();
    }

    /* resolved by designer where if we open select year dropdown in totals of card view and hover on megamenu, it goes behind select year dropdown. */
    $("#grouplist").hover(function () {
      // id given by designer to resolve issue where dropdowns used to be un clickable if we reach dashboard screen and come back to any component. (03-01-2023)
      $('#hideSelect').toggleClass("selecthack");
    });
  }


  trackApi(userKey = null, logOnTime = null, logOffTime = null) {
    var trackApiURL = CommonApi.trackApiUrl;
    let reqParams = {
      "userKey": userKey,
      "logOnTime": logOnTime,
      "logOffTime": logOffTime
    };
    this.hmsDataServiceService.postApi(trackApiURL, reqParams).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
      }
    })
  }

  toggleLogoutMenu(event) {
    if (localStorage.getItem('isNgOnInitFirst') == '1') {
      this.showMenu = !this.showMenu;
      if (this.showMenu) {
        this.showMenu = true
      } else {
        this.showMenu = false
      }
    }
  }

  /**
   * LogOut User Session
   */
  LogOut() {
    this.exDialog.openConfirm(this.translate.instant('admin.toaster.logoutConfirmation')).subscribe((value) => {
      if (value) {
        //Start Getting Current DateTime
        let loginUserId = localStorage.getItem('id');
        let today = new Date();
        let dd = ("0" + today.getDate()).slice(-2)
        let mm = ("0" + (today.getMonth() + 1)).slice(-2)
        let yyyy = today.getFullYear();
        let CurrentDate = yyyy + '-' + mm + '-' + dd
        let CurrentTime = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
        let fullDateTime = CurrentDate + ' ' + CurrentTime;
        //End Getting Current DateTime
        this.trackApi(loginUserId, '', fullDateTime);
        this.cardServiceService.emptyAccessToken.emit(true);
        var loginFrom = localStorage.getItem('loginFrom');
        localStorage.setItem('id', '0')
        localStorage.setItem('currentUser', '');
        localStorage.setItem('userCredential', '');
        localStorage.setItem('user', '');
        localStorage.setItem('role', "");
        localStorage.setItem('type', "");
        localStorage.setItem('roleLabel', "");
        localStorage.setItem('isAdmin', "")
        localStorage.setItem('bsnsKey', "")
        localStorage.setItem('applicationRoleKey', "")
        this.currentUserService.applicationRoleKey = ''
        this.cardService.searchedCardCompanyName = ''
        this.companyService.searchedCompanyName = ''
        this.currentUserService.allAppMenu = []
        for (var j = 0; j < this.currentUserService.operatorHeader.length; j++) {
          if (this.currentUserService.operatorHeader[j].children.length > 0) {
            for (var k = 0; k < this.currentUserService.operatorHeader[j].children.length; k++) {
              this.currentUserService.operatorHeader[j].children[k]['actionAccess'] = false
            }
          }
          this.currentUserService.operatorHeader[j]['menuAccess'] = false
        }
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '../../assets/css/common.css';
        link.media = 'all';
        head.appendChild(link);
        this.removeModalClasses()
        if (loginFrom == 'albertalogin') {
          this.router.navigate(['albertalogin']);
        } else if (loginFrom == 'ahclogin') {
          this.router.navigate(['ahclogin']);
        } else if (loginFrom == 'doctorlogin') {
          this.router.navigate(['doctorlogin']);
        } else if (loginFrom == 'govlogin') {
          this.router.navigate(['govlogin']);
        } else if (loginFrom == 'uftlogin') {
          this.router.navigate(['uftlogin']);
        } else {
          this.router.navigate(['quikcardlogin']);
        }
      }
    });
  }

  ngAfterViewInit() {
  }

  /**
   * Logout user, If no activity for 12 hours 
   */
  LogOffScreen() {
    localStorage.setItem('keepAliveCounter', '1')
    // sets an idle timeout of 5 seconds, for testing purposes.
    this.idle.setIdle(7200); //2 hours intervel
    //2 hours intervel

    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(30);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
      document.getElementById("btnCloseTimeOutWindow").click()
    });
    this.idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      document.getElementById("btnCloseTimeOutWindow").click()
      $('body').removeClass("modal-open");
      $('.modal-backdrop').remove();
      this.LogOutFromKeepAlive();
      this.router.navigate(['quikcardlogin']);
    });
    this.idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
    this.idle.onTimeoutWarning.subscribe((countdown => {
      this.LogOutFromKeepAlive();                            //resolved screen struck conflict
      this.idleState = 'Your session has been Timed Out!'
      if (countdown == 30) {
        this.toastrService.error(this.translate.instant('header.toaster.sessionWillTimeout'))
      } else if (countdown == 1) {
        if (this.timedOut == false) {
          this.exDialog.openMessage(this.idleState);
        }
      }
    })
    );
    // sets the ping interval to 15 seconds
    this.keepalive.interval(5);
    this.keepalive.onPing.subscribe(() => this.lastPing = new Date());
    this.reset();
  }

  reset() {
    this.idle.watch();
    this.timedOut = false;
  }

  /**
   * LogOut User Session
   */
  LogOutFromKeepAlive() {
    this.cardServiceService.emptyAccessToken.emit(true);
    var loginFrom = localStorage.getItem('loginFrom');
    localStorage.setItem('id', '0')
    localStorage.setItem('currentUser', '');
    localStorage.setItem('userCredential', '');
    localStorage.setItem('user', '');
    localStorage.setItem('role', "");
    localStorage.setItem('type', "");
    localStorage.setItem('roleLabel', "");
    localStorage.setItem('isAdmin', "")
    localStorage.setItem('bsnsKey', "")
    localStorage.setItem('applicationRoleKey', "")
    this.currentUserService.applicationRoleKey = ''
    this.cardService.searchedCardCompanyName = ''
    this.companyService.searchedCompanyName = ''
    this.currentUserService.allAppMenu = []
    for (var j = 0; j < this.currentUserService.operatorHeader.length; j++) {
      if (this.currentUserService.operatorHeader[j].children.length > 0) {
        for (var k = 0; k < this.currentUserService.operatorHeader[j].children.length; k++) {
          this.currentUserService.operatorHeader[j].children[k]['actionAccess'] = false
        }
      }
      this.currentUserService.operatorHeader[j]['menuAccess'] = false
    }
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '../../assets/css/common.css';
    link.media = 'all';
    head.appendChild(link);
    this.removeModalClasses()
    if (loginFrom == 'albertalogin') {
      this.router.navigate(['albertalogin']);
    } else if (loginFrom == 'ahclogin') {
      this.router.navigate(['ahclogin']);
    } else if (loginFrom == 'doctorlogin') {
      this.router.navigate(['doctorlogin']);
    } else if (loginFrom == 'govlogin') {
      this.router.navigate(['govlogin']);
    } else if (loginFrom == 'uftlogin') {
      this.router.navigate(['uftlogin']);
    } else {
      this.router.navigate(['quikcardlogin']);
    }
  }

  getUserRoleId() {
    let userDataJson = {
      "userId": localStorage.getItem('id')
    }
    var URL = CommonApi.getUserWithRole;
    this.hmsDataServiceService.postApi(URL, userDataJson).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.bussinesTypeKey = data.result.userGroupKey
      }
    })
  }

  changeTheme(newTabRouterLink=null,event=null) {
    if (event && event.ctrlKey ) {
            return
      //ctrl was held down during the click
  }
    /*Set The Router Link To Open In the New Tab */
    if (newTabRouterLink) {
      this.currentUserService.setRouterLink(newTabRouterLink);
    }
    let role = localStorage.getItem('role');
    this.bussinesTypeKey == Constants.albertaUserId ? this.reviewer = true : this.reviewer = false
    if (this.bussinesType == Constants.albertaGov && this.reviewer) {
      //Dynamically add stylesheet in Head Section
      let node = document.createElement('link');
      node.href = 'assets/css/common-alberta.css';
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    } else {
      // to avoid changing theme when Dashboard or claims clicked twice.
      if (newTabRouterLink != "/referToReview" && newTabRouterLink != "/reviewer/searchClaim") {
        $('link[href="assets/css/common-alberta.css"]').remove();
      }
      // for Loader in review-claim.
      this.ObservableClaimObj = Observable.interval(2000).subscribe(x => {
        this.currentUserService.claimsClick.emit(true)         
        this.ObservableClaimObj.unsubscribe();
      });
    }
    // To correct screen disable issue after going anywhere after opening pop ups
    $('body').removeClass("modal-open");
    $('.modal-backdrop').remove();
    $('#closeConfirmationPopup').trigger("click");
    $("body").removeAttr("style")
  }

  setMenuHeader() {
    let promise = new Promise((resolve, reject) => {
      this.hmsDataServiceService.getHeaderActiveLink() 
      this.menu = this.currentUserService.operatorHeader
      const index = this.menu.findIndex((e) => e.menuShortDesc === "DBD");
      if (index > 0){
        let checkAlberta = this.menu[index].routerLink;
        if(checkAlberta.indexOf('alberta') === -1){
          if (this.currentUserService.currentUser.businessType.bothAccess) {
            this.menu[index].routerLink = this.menu[index].routerLink
          }else if (this.currentUserService.currentUser.businessType.isAlberta) {
            this.menu[index].routerLink = this.menu[index].routerLink  + '/alberta';
          }else{
            this.menu[index].routerLink = this.menu[index].routerLink;
          } 
        }        
      }
            this.menuByOrder = this.menu.sort(function (a, b) { return a.key - b.key; });
      resolve();
    });
    return promise;
  }

  getBatchNo(from) {
    this.hmsDataServiceService.getApi(DataEntryApi.getLatestBatchNumAndKey).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
       //change for log #805
      //  When dialog open on click save initial batch number to use in future
        if(from == "click"){
          this.submitBatchForm.patchValue({ 'batch': data.result.batchNumber })
          this.initialBatchNumber =  data.result.batchNumber;
          this.batchKey = data.result.batchSubmissionKey
          var reqParam = [{ 'key': 'batchSubmissionKey', 'value': this.batchKey }]
        }else{
            if( this.initialBatchNumber == data.result.batchNumber){
               reqParam = [{ 'key': 'batchSubmissionKey', 'value': ''},{ 'key':'batchNumber','value' : this.oldBatchNum}]
            }else{
              this.submitBatchForm.patchValue({ 'batch': data.result.batchNumber })
              this.batchKey = data.result.batchSubmissionKey
              var reqParam = [{ 'key': 'batchSubmissionKey', 'value': this.batchKey }]
            }
        }
        var tableActions = []
        this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
          if (this.checkServiceProvider = true) {
            if ('dataEntry.batch-search.batchNo' == this.translate.instant('dataEntry.batch-search.batchNo')) {
            } else {
              this.columns = [
                { title: this.translate.instant('dataEntry.batch-search.batchNo'), data: 'batchNum' },
                { title: this.translate.instant('dataEntry.batch-search.batchStatus'), data: 'batchStatus' },
                { title: this.translate.instant('dataEntry.batch-search.claim'), data: 'claimNum' },
                { title: this.translate.instant('dataEntry.batch-search.claimDate'), data: 'employmentDt' },
                { title: this.translate.instant('dataEntry.batch-search.phn'), data: 'patientHcNo' },
                { title: this.translate.instant('dataEntry.header.submit-batch.submit-by'), data: 'batchSubmittedBy' },
                { title: this.translate.instant('dataEntry.header.submit-batch.submit-on'), data: 'batchSubmittedOn' },
              ]
              var dateCols = ['employmentDt', 'batchSubmittedOn'];
              if (!$.fn.dataTable.isDataTable('#genrateBatchList')) {
                this.dataTableService.jqueryDataTableSearchClaim("genrateBatchList", DataEntryApi.getClaimListByBatchNumber, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, dateCols, '', [1, 2, 3, 4, 5, 6])
              } else {
                this.dataTableService.jqueryDataTableReload("genrateBatchList", DataEntryApi.getClaimListByBatchNumber, reqParam)
              }
              this.checkServiceProvider = false;
              this.ObservableClaimObj.unsubscribe();
            }
          }
        });
      } else {
        this.submitBatchForm.patchValue({ 'batch': '' })
      }
    })
  }

  generateBatchFile() {
    //Changes for log #805
    if(!this.submitBatchForm.valid){
      return
    }
    this.showLoader = true;
    var batchNum = this.submitBatchForm.get("batch").value;
    let url = DataEntryApi.generateBatchFile + '/' + localStorage.getItem('id')+"/"+batchNum;
    this.hmsDataServiceService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.showLoader = false
        this.toastrService.success(this.translate.instant('header.toaster.batchFileGenerated'))
        const url = data.result;
        window.open(url)
                this.oldBtachKey = this.batchKey
        this.oldBatchNum = batchNum;
        this.showViewBatch = true
        this.getBatchNo("generate");
      } else {
        this.showLoader = false
        this.toastrService.error(this.translate.instant('header.toaster.batchFileNotGenerated'))
      }
    })
  }

  viewBatchFile() {
    let byteData = "ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgDQozQURTMThBRDEyMzQ3OTE1Q0lQMUNJQjEwMDAxRCAgICAgIFJHTFIzMDM5OTkwMDggICAgNDI2NTc4MDgxICAgICAgICAgICAgCQkyMDE4MDcwNTE1MjYuMCAgICAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICA1NzIzMDAgICAgICAgICAgICAgICAgICA3NzM0NzYwQkFQWSAgICAgICAgIDAwMDAwMDAgICAgICAgICBOICAgICAgICAgICAgICAgICAgICAgIDQ1MDU0TiAgICBOTiAgICAgTiAgICAgICAgICAgICAgICAgICAgICAgIA0KM0FEUzE4QUQxMjM0NzkxM0NJUDFDSUIxMDAwMUMgICAgICBSR0xSNDM1Mjc1MTA4ICAgIDIzNzczOTgxMCAgICAgICAgICAgIAkJMjAxODA2MDgxNTI2LjIgICAgICAgICAgICAgMSAgVEVMRVMgICAgICAgICAgICAgMDAwODIyICAgICAgICAgICAgICAgICAgMjM1MzIwMEJBUFkgICAgICAgICAwMDAwMDAwNTg4NDk0MTA4TiAgICAgICAgICAgICAgICAgICAgICAxMTc1Nk4gICAgTk4gICAgIE4gICAgICAgICAgICAgICAgICAgICAgICANCjNBRFMxOEFEMTIzNDc5MTRDSVAxQ0lCMTAwMDFSICAgICAgUkdMUjYxMjMxMDMwOCAgICA5MzcxOTE2MTEgICAgICAgICAgICAzOS40MSAgMjAxODA3MTAxNTI1LjggICAgICAgICAgICAgMSAgREVWICAgICAgICAgICAgICAgMDAwMDQzU1VSRyAgICAgICAgICAgICAgNjk5Mzc4MEJBUFkgICAgICAgICAwMDAwMDAwICAgICAgICAgTiAgICAgICAgICAgICAgICAgICAgICAxMzEwNk4gICAgTk4gICAgIE4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA0K"
    this.toastrService.success(this.translate.instant('header.toaster.batchFileDownloadSuccess'))
    var blob = this.hmsDataServiceService.b64toBlob(byteData, { type: 'text/csv' });
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "August 23, 2018.txt";
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0)
  }

  getRolAssignedUserType() {
    this.rolAssignedTypeList = this.currentUserService.appHeaderRoleMenu
    for (var i = 0; i < this.rolAssignedTypeList.length; i++) {
      this.rolAssignedTypeList.push({ 'id': this.rolAssignedTypeList['hmsAppKey'], 'itemName': this.rolAssignedTypeList['hmsAppDesc'] })
    }
  }

  onClickAppHeaderMenu(item: any) {
    this.currentUserService.applicationRoleKey = item.hmsAppKey
    this.showLoader = true;
    this.currentUserService.getUserAuthorization().then(res => {
      this.setMenuHeader().then(res => {
        switch (item.hmsAppKey) {
          case 1:
            localStorage.setItem('role', "");
            this.changeTheme()
            let redirectHmsVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'DBC').map(data => data)
            if (redirectHmsVal[0] && redirectHmsVal[0].menuAccess == true) {
              this.showLoader = false;
              this.router.navigate(['claimDashboard']);
            } else {
              this.getFirstUrl(this.currentUserService.operatorHeader)
            }
            break;
          case 2:
            localStorage.setItem('role', "reviewer");
            let redirectDoctorVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'DAD').map(data => data)
            if (redirectDoctorVal[0] && redirectDoctorVal[0].menuAccess == true) {
              this.showLoader = false;
              window.open(location.origin + '/reviewer', "_self");
                          } else {
              this.getFirstUrl(this.currentUserService.operatorHeader)
            }
            break;
          case 3:
            localStorage.setItem('role', "govOfficial");
            let redirectReviewerrVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'RAD').map(data => data)
            if (redirectReviewerrVal[0] && redirectReviewerrVal[0].menuAccess == true) {
              this.showLoader = false;
              window.open(location.origin + '/reviewer', "_self");
                          } else {
              this.getFirstUrl(this.currentUserService.operatorHeader)
            }
            break;
          case 4:
            localStorage.setItem('role', "dataEntry");
            let redirectAhcrVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'AHD').map(data => data)
            if (redirectAhcrVal[0] && redirectAhcrVal[0].menuAccess == true) {
              this.showLoader = false;
              window.open(location.origin + '/dataEntry/dashboard', "_self");
                          } else {
              this.getFirstUrl(this.currentUserService.operatorHeader)
            }
            break;
            case 5:
              localStorage.setItem('role', "referReviwer");
              let redirectRefVal = this.currentUserService.operatorHeader.filter(val => val.menuShortDesc == 'RRD').map(data => data)
              if (redirectRefVal[0] && redirectRefVal[0].menuAccess == true) {
                this.showLoader = false;
                this.router.navigate([redirectRefVal[0].routerLink]);
              } else {
                this.getFirstUrl(this.currentUserService.operatorHeader)
              }
              break;
        }
      });
    })
  }

  /**
  * 
  * @param operatorHeader 
  * @returns redirectURL
  */
  getFirstUrl(operatorHeader) {
    let firstElem = operatorHeader.filter(val => val.menuAccess == true).map(data => data)
    let childElem: any
    if (firstElem == '') {
      this.showLoader = false;
      this.toastrService.error(this.translate.instant('header.toaster.dontHaveAccess'))
      return false
    } else {
      if (firstElem[0].children.length > 0) {
        childElem = firstElem[0].children
        let firstChild = childElem.filter(val => val.actionAccess == true).map(data => data)
        this.redirectURL = firstChild[0]['routerLink']
      } else {
        this.redirectURL = firstElem[0]['routerLink']
      }
      this.showLoader = false;
      this.router.navigate([this.redirectURL]);
    }
  }

  onDeSelectDropDown(item: any, type) {
  }

  /**
   * Activate all hot keys
   */
  activateHotKeys() {
    this._hotkeysService.add(new Hotkey('alt+c', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/claim/searchClaim']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('alt+a', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/card/searchCard']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('alt+s', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/serviceProvider/search']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('alt+e', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/procedureCode']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('alt+i', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/finance/transaction-search']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('alt+r', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/rules/1']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('alt+q', (event: KeyboardEvent): boolean => {
      this.LogOut();
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+f1', (event: KeyboardEvent): boolean => {
      window.open(location.origin + '/claim/searchClaim?discipline=DENTAL', "_self");
            return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+f2', (event: KeyboardEvent): boolean => {
      window.open(location.origin + '/claim/searchClaim?discipline=HEALTH', "_self");
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+f3', (event: KeyboardEvent): boolean => {
      window.open(location.origin + '/claim/searchClaim?discipline=VISION', "_self");
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+f4', (event: KeyboardEvent): boolean => {
      window.open(location.origin + '/claim/searchClaim?discipline=DRUG', "_self");
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+f6', (event: KeyboardEvent): boolean => {
      window.open(location.origin + '/claim/searchClaim?discipline=SUPPLEMENTAL', "_self");
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+f7', (event: KeyboardEvent): boolean => {
      window.open(location.origin + '/claim/searchClaim?discipline=WELLNESS', "_self");
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+f5', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/card']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+c', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/company']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+b', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/company/broker']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+f8', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/serviceProvider/search']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+p', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/procedureCode']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+s', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/dentalService']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+f', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+h', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/dentalSchedule']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+f1', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/visionProcedureCode']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+f2', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/visionService']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+f3', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/healthProcedureCode']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+f4', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/healthService']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+f7', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/hsaProcedureCode']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+f8', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/feeGuide/hsaService']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+o', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/finance/payment-search']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+m', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/finance/transaction-search']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+1', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/rules/1']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+2', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/rules/2']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+3', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/rules/3']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+ctrl+4', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/rules/4']);
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+u', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/users/searchUsers']);
      return false; // Prevent bubbling
    }));
  }

  ngOnDestroy() {
    this.httpSubscription.unsubscribe();
  }

  /**
   * Call Change Password Function In the Child Component
   * @param tyep 
   */
  changePassword(type) {
    this.changePasswordComponent.changePassword(type);
  }

  /**
   * Update User Password
   */
  onSubmitChangePassword(formData) {
    if (this.changePasswordForm.valid) {
      var userId = localStorage.getItem('id')
            let changePasswordData = {
        "userId": userId,
        "oldPassword": this.changePasswordForm.value.oldPassword,
        "password": this.changePasswordForm.value.newPassword,
      }
      var URL = CommonApi.changePasswordUrl;
      this.hmsDataServiceService.post(URL, changePasswordData).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          this.toastrService.success(this.translate.instant(this.translate.instant('header.toaster.passwordUpdatedSuccess')));
          $('#changePasswordClsoeHeaderTop').click();
        }
        else if (data.code == 400 && data.status == "BAD_REQUEST" && data.hmsMessage.messageShort == 'OLD_PASSWORD_DOES_NOT_MATCH') {
          this.toastrService.error(this.translate.instant(this.translate.instant('header.toaster.oldPasswordNotMatch')));
        }
      });
    } else {
      this.validateAllFormFields(this.changePasswordForm);
    }
  }

  /**
  * Validate the Password and confirm password
  * @param changePasswordForm 
  */
  validateConfirmPassword(changePasswordForm) {
    if (changePasswordForm.value.newPassword != '' && changePasswordForm.value.confirmPassword != '') {
      if (changePasswordForm.value.newPassword != changePasswordForm.value.confirmPassword) {
        changePasswordForm.controls['confirmPassword'].setErrors({
          "passwordMismatch": true
        });
      } else {
        changePasswordForm.controls['confirmPassword'].setErrors(null);
      }
    }
  }

  /**
  * validate the user form fields
  */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
   * Reset The Change Password Form
   */
  resetChangePasswordForm() {
    this.changePasswordForm.reset();
  }

  /**
   * update the user first login attempt key
   */
  updateUserPaaswordAttempt() {
    let userDataJson = {
      "userId": localStorage.getItem('id')
    }
    var URL = CommonApi.disableFirstAttemptLoginUrl;
    this.hmsDataServiceService.postApi(URL, userDataJson).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
      }
    })
  }

  /**
   * Show/Hide OTP Screen
   * @param event 
   */
  showOTPScreen(event) {
    if (event.target) {
      let otpStatus = event.target.checked == true ? "T" : "F";
      let reqParam = {
        "otpStatusInd": otpStatus,
        "emailStatusInd": otpStatus
      }
      var otpEmailStatusUrl = CommonApi.otpEmailStatusUrl;
      this.hmsDataServiceService.postApi(otpEmailStatusUrl, reqParam).subscribe(data => {
        if (data.code == 200 && data.status == 'OK') {
          if (otpStatus == "T") {
            this.toastrService.success(this.translate.instant('header.toaster.otpOptionApplied'));
          } else {
            this.toastrService.success(this.translate.instant('header.toaster.otpOptionRemoved'));
          }
        } else {
          this.toastrService.error(this.translate.instant('header.toaster.error'));
        }
      })
    }
  }

  removeModalClasses() {
    $('body').removeClass("modal-open");
    $('.modal-backdrop').remove();
    $('#closeConfirmationPopup').trigger("click");
    $("body").removeAttr("style")
  }

}