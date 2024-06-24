import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer, SimpleChange, OnChanges } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ClaimApi } from '../claim-api';
import { CommonApi } from '../../common-module/common-api';
import { ClaimService } from '../claim.service';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompleterData, CompleterService, CompleterItem } from 'ng2-completer';
import { Subscription } from 'rxjs/Subscription';
import { debug } from 'console';
import { settings } from 'cluster';
import { RequestOptions, Http, Headers } from '@angular/http';
@Component({
  selector: 'app-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.css'],
  providers: [ChangeDateFormatService]
})

export class GeneralInformationComponent implements OnInit, OnChanges {
  selectedDiscKey: any;
  loginUserType: boolean;
  arrClaimCategory:any; // declare for Claim Category(#1206)

  @Input() ClaimGeneralInformationFormGroup: FormGroup;
  @Input() claimStatus
  @Input() claimReleased
  @Input() filePath
  @Input() isRfrClaim
  @Input() claimAuthChecks
  @Output() disciplineKey = new EventEmitter();
  @ViewChild('autofocusDisciplineType') private elementRef: ElementRef;//For Autofocus
  @ViewChild('autofocusClaimType') private elementClaimRef: ElementRef;//For Autofocus 
  @Input() reviewer: boolean;
  @Input() isReverseClaim: boolean;
  @Input() resetForm: any;
  /*Claim Status Array */
  arrClaimStatus;
  /*Claim Type Array */
  arrClaimType = [];
  error: any;
  checkFocus;
  ObservableObj;
  checkBrokerFocus;
  ObservableBrokerObj;
  checkFileRef = false;
  fileRefUrl;
  fileId: any;
  isOne: boolean = false
  hideBtn: boolean = false
  /* Date picker option*/
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;
  selectedVal: number = 1;
  claimType = [];//array for claim type List 
  claimTypeAll = [];
  alberta: boolean = false //true if loggedIn user belongs to alberta Gov.
  cardKey
  selectedDiscipline
  selectedCategory
  claimGeneralInformationVal = {
    entry_date: ['', Validators.required],
    type: [null, Validators.required],
    claimType: [null, Validators.required],
    operator: [''],
    
    cat: [null],   //change for (#1206)
    reference: [''],
    modified_date: [''],
    userId: [''],
    fileRefVal: ['']
  }
  changeDiscipline: boolean = false
  editClaimType: boolean = false
  bsnsType: string = ''
  setClaimType;
  selectedCardKey;
 
  userRole = ""
  fileDisciplineType = ''
  @Input() addMode: boolean;
  @Input() viewMode: boolean;
  @Input() editMode: boolean;
  @Input() copyMode: boolean;
  @Input() hasPreAuth: boolean
  @Output() selectedClaimTypeKeyData = new EventEmitter()
 
  user = ""
  claimKey
  selectedDisciplineKey
  changeClaimType: boolean = false;
  showBackBtn: boolean = false;
  languages: any;
  showReviewBackBtn: boolean = false;
  currentUser: any;
  bsnsTypeCd: any;
  selectedClaimTypeCd: any;
  showLoader: boolean = false;
  public arrClaimTypeData: CompleterData
  public isOpen: boolean = false;
  oldRequest: any;
  claimCategoryRequest: any;
  oldClaimTypeRequest: any;
  subsVar: Subscription;
  subClaimType: Subscription;
  setClaimTypeFocus: boolean = false;
  claimReferenceNumber: any;
  itemEditMode: boolean = false
  preAuthReview: boolean = false;
  claimTypeBussinessType: any;
  falseOrTrue: boolean = false;
  isdone: any;
  filterArrClaimType: any = [];
  lastHovered: string = '';
  hoveredValue: string = "";
  claimCategory: any = false;
  loginFrom  // #1206 for login 
  fileName: any;
  companyId: any;
  selectedclaimKey: any;
  filesPath: any;
  initiateClaim: boolean = false;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  selectedClaimTypeKey = '';
  checkClaimType: boolean = false
  lockString: string;
  showCopyClaim: boolean
  ObservableReviewObj
  @Input() isReversedInd: boolean;
  claimDashboardDiscKey: any
  showQuikDashBackBtn: boolean = false
  showADSCDashBackBtn: boolean = false
  selectedFileName
  selectedFile: any;
  fileSizeExceeds: boolean = false
  error1: any;
  error3: any;
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false
  loaderPlaceHolder
  disciplineTypeList = [{'disciplineKey': 0, 'disciplineName':"ALL"},{'disciplineKey': 1, 'disciplineName':"Dental"}, {'disciplineKey': 2, 'disciplineName':"Vision"}, {'disciplineKey': 3, 'disciplineName':"Health"},{'disciplineKey': 4, 'disciplineName':"Drug"},{'disciplineKey': 5, 'disciplineName':"Supplemental"},{'disciplineKey': 6, 'disciplineName':"Wellness"}]
  isDash:boolean = false
  constructor(private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private claimService: ClaimService,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private renderer: Renderer,
    private router: Router,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService

  ) {
    
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };

    this.subClaimType = claimService.getCardKey.subscribe(value => {
      this.cardKey = value.cardKey
      this.changeDiscipline = true
      this.changeClaimType = true
      this.bsnsType = value.bussinessType
      this.bsnsTypeCd = value.bussinessTypeCd
      this.getDisciplineList();
      this.getClaimCategoryList(); // for #1206     
    })

    this.claimService.claimTypeBussinessType.subscribe(value => {
      this.claimTypeBussinessType = value;
    })

    this.claimService.binaryFileNameData.subscribe(value => {
      this.selectedclaimKey = value;
    })

    this.claimService.emitDisciplineKey.subscribe(value => {
      this.selectedDisciplineKey = value;
    })

    claimService.setClaimType.subscribe(value => {
      if (value) {
        this.ClaimGeneralInformationFormGroup.patchValue({ 'type': 37 });
      }
    })
    claimService.claimStatus.subscribe(value => {
      this.claimStatus = value;
    })
    this.subsVar = this.currentUserService.loggedInUserVal.subscribe(val => {
      if (val) {
        this.getCurrentUser(val)
        this.getAllLanguage()
        this.loginUserType = this.currentUser.businessType.isAlberta
        if (this.loginUserType == true) {
          document.getElementById('claimType').focus()
        } else {
          $('#cgI_claimType').focus();
        }
      }
    })

    //Claim Ref Num 17Oct 2019
    claimService.claimReferenceNumber.subscribe(value => {
      this.claimReferenceNumber = value
      this.getReferenceNumber();
    })
    claimService.disableSave.subscribe(value => {
      if (value) {
        this.itemEditMode = true
      } else {
        this.itemEditMode = false
      }
    })

    /* Lock Processor Functionality */
    claimService.getLockedMessage.subscribe(val => {
      this.lockString = val
      if (val != "" && val != undefined) {
        this.showCopyClaim = true
      } else {
        this.showCopyClaim = false
      }
    })

  }
  getCatChange(event){    
    let selectedCategory = ""
    this.selectedCategory = ""
    selectedCategory = event.target.value;
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "resetForm" && !changedProp.firstChange) {
        this.ClaimGeneralInformationFormGroup.patchValue({ 'entry_date': this.changeDateFormatService.getToday() });
        var Desc = this.arrClaimType.filter(val => val.claimTypeDesc === "Paper").map(data => data.claimTypeDesc)
        this.ClaimGeneralInformationFormGroup.patchValue({ 'type': Desc[0] });
        this.ClaimGeneralInformationFormGroup.patchValue({ 'operator': localStorage.getItem('user') });
        this.selectedDiscKey = this.claimTypeAll[1].disciplineKey;
        this.claimType = this.claimTypeAll;
        this.selectedDiscipline = 1;
        this.selectedCardKey = undefined;
        this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": +this.selectedDiscKey })
        
      }
    }

  }

  ngAfterViewInit() {
    
  }
  ngOnInit() {
    /* Task 271 custom class removed from div of logo to prevent destortion in logo when login after logging out from ab govt claim view section and go to this section again.  */
    $(".logo").removeClass("quikcardLogoSizing")
    if (this.route.snapshot.queryParams.isDiscKey != undefined) {
      this.claimDashboardDiscKey = +this.route.snapshot.queryParams.isDiscKey
      this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": +this.route.snapshot.queryParams.isDiscKey });
    }
    this.showLoader = false
    
    if (this.router.url.indexOf("/claim?fileReference") > -1) {
      $('#cgI_claimType').focus();
      this.elementRef.nativeElement.focus()
    } 
    if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.cardHolderKey != "") {
      if (this.bsnsTypeCd != undefined && this.bsnsTypeCd != Constants.albertaBusinessTypeCd) {
        $('#cgI_claimType').focus();
      }
      else {
        $('#claimType').focus()
      }
    } else {
      this.bsnsType = ""
      this.selectedClaimTypeCd = ""
      this.selectedCardKey = undefined
      this.cardKey = 0
    }
    
    document.getElementById('claimType').focus()
    this.selectedDiscipline = ""

    this.error = { isError: false, errorMessage: '' };
    this.ClaimGeneralInformationFormGroup.patchValue({ 'entry_date': this.changeDateFormatService.getToday() });
    if (this.route.snapshot.url[0]) {
      if (this.router.url.includes('RR')) {
        this.isDash = true
      } else {
        this.isDash = false
      }
      if (this.route.snapshot.url[0].path == "view") {
        this.viewMode = true
        this.editClaimType = true
        this.route.params.subscribe((params: Params) => {
          this.claimKey = params['id']
          this.selectedDisciplineKey = params['type']
        })
        this.getClaimFileForView()
      } else {

      }
    }

    this.changeDiscipline = false
    this.selectedCardKey = undefined
    this.cardKey = ""
    this.getClaimCategoryList()
    this.ClaimGeneralInformationFormGroup.patchValue({ 'type': 'Paper' });
    let self = this;
    // log 1062
    $("#claimType").on('keydown blur', function (e) {
      if (e.keyCode === 9) {
        
        let i = $('#claimType_search').find('.over').text().trim();
        if (i) {          
          self.hoveredValue = i          
        } else {
          self.hoveredValue = ""
        }        
      }
    });
   
    if (this.route.snapshot.queryParams.claimcategory == 'true') {
      if (this.route.snapshot.queryParams.isAdDash == 'true') {
        this.bsnsTypeCd = 'S'
        this.showADSCDashBackBtn = true;
        this.showQuikDashBackBtn = false
        if (this.route.snapshot.queryParams.claimCat == 'Scanned') {
         //change functionality and add Scanned and Email claim category for #1206 
          this.ClaimGeneralInformationFormGroup.patchValue({ 'cat': 'S' });    //change  for (#1206)
          let serviceData = {}
          if (this.route.snapshot.queryParams.isServiceDate == '') {
            serviceData = { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) }
          } else {
            serviceData = { 'serviceDate': this.route.snapshot.queryParams.isServiceDate}
          }
          serviceData['disciplineKey'] = +this.route.snapshot.queryParams.isDiscKey
          setTimeout(() => {
            this.claimService.mobilClaimData.emit(serviceData)
          }, 500);
        }
        //add Email in claim category for (#1206)
        if (this.route.snapshot.queryParams.claimCat == 'Email') {
          this.ClaimGeneralInformationFormGroup.patchValue({ 'cat': 'E' });
          let serviceData = {}
          if (this.route.snapshot.queryParams.isServiceDate == '') {
            serviceData = { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) }
          } else {
            serviceData = { 'serviceDate': this.route.snapshot.queryParams.isServiceDate}
          }
          serviceData['disciplineKey'] = +this.route.snapshot.queryParams.isDiscKey
          setTimeout(() => {
            this.claimService.mobilClaimData.emit(serviceData)
          }, 500);
        }
        if (this.route.snapshot.queryParams.claimCat == 'DASP Web Claim' || this.route.snapshot.queryParams.claimCat == 'DASP Web Portal' || this.route.snapshot.queryParams.claimCat == 'ADSC Web Claim' || this.route.snapshot.queryParams.claimCat == 'ADSC Web Portal') {
          this.ClaimGeneralInformationFormGroup.patchValue({ 'cat': 'D' });
          this.fileName = this.route.snapshot.queryParams.fileReference;
          this.getDASPWebClaimData();
        }
      } else {
        this.bsnsTypeCd = 'Q'
        this.showADSCDashBackBtn = false;
        this.showQuikDashBackBtn = true
        if (this.route.snapshot.queryParams.claimCat == 'QSI Web Portal') {
          this.ClaimGeneralInformationFormGroup.patchValue({ 'cat': 'W' });
        }
        if (this.route.snapshot.queryParams.claimCat == 'QSI Mobile Portal') {
          this.ClaimGeneralInformationFormGroup.patchValue({ 'cat': 'M' });
        }
        
        if (this.route.snapshot.queryParams.claimCat == 'Scanned') {
          this.ClaimGeneralInformationFormGroup.patchValue({ 'cat': 'S' });
        }
        if (this.route.snapshot.queryParams.claimCat == 'Email') {
          this.ClaimGeneralInformationFormGroup.patchValue({ 'cat': 'E' });
        }
        //end
        this.fileName = this.route.snapshot.queryParams.fileReference;
        this.getTypeMobileClaimData();
      }
     
      } else {
        this.ClaimGeneralInformationFormGroup.patchValue({ "cat": 'S'});
        if (this.route.snapshot.queryParams.isAdDash == 'true') {
          this.showADSCDashBackBtn = true;
          this.showQuikDashBackBtn = false
        } else if (this.route.snapshot.queryParams.isAdDash == 'false') {
          this.showADSCDashBackBtn = false;
          this.showQuikDashBackBtn = true
        }
        this.claimCategory = false
      }
      
  }
  getTypeMobileClaimData() {
    let submitData = {
      "fileName": this.fileName
    }
    this.hmsDataService.postApi(ClaimApi.getQCWebClaimUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {       
        let responseData = data.result
        this.claimDashboardDiscKey = responseData.disciplineKey
        setTimeout(() => {
        this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": +responseData.disciplineKey });
        this.ClaimGeneralInformationFormGroup.patchValue({ "operator": responseData.updatedBy });
        this.claimService.mobilClaimData.emit(responseData)
        this.claimService.getDisciplineKey.next(+responseData.disciplineKey)        
        }, 400);
      }
      else {
        console.log('Data not found!')
      }
    }, (error) => {
      console.log('Data not found!')
    })
  }

  ngOnDestroy() {
    if (this.subsVar) {
      this.subsVar.unsubscribe()
    }
    if (this.subClaimType) {
      this.subClaimType.unsubscribe()
    }
  }

  /**
    * Generate Reference Number
    * @date 17 Oct 2019
    */
  getReferenceNumber() {
    if (this.addMode) {
      this.ClaimGeneralInformationFormGroup.patchValue({ 'reference': this.claimReferenceNumber });
    }
  }
  /**
     * Generate Reference Number
     * @date 17 Oct 2019
     */
  fetchReferenceNumber() {
    let apiUrl = ClaimApi.getReferenceNumberUrl
    this.hmsDataService.getApi(apiUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.ClaimGeneralInformationFormGroup.patchValue({ 'reference': data.result });
      } else {
        this.ClaimGeneralInformationFormGroup.patchValue({ 'reference': data.result });
      }
    });
  }
 

  /**
  @return:this.claimType array of claim type based on userID(change id user belongs to alberta Gov) 
          and cardkey(if cardholder intiate claims) 
  * 
  */
  getCurrentUser(val) {
    this.currentUser = val
    if (this.currentUser) {
      this.userRole = this.currentUser.roles[0].role
      if (this.addMode) {
        this.ClaimGeneralInformationFormGroup.patchValue({ 'operator': this.currentUser.username });        
      }
    }
  }
  getDisciplineList() {
    if (this.currentUser) {
      this.currentUser = this.currentUser
    } else {
      this.currentUser = this.currentUserService.currentUser
    }
    this.getCurrentUser(this.currentUser)
    let businessTypeKey
    if (this.currentUser) {
      var userId = this.currentUser.userId
      if (this.currentUser.businessType.bothAccess) {
        businessTypeKey = 0
      } else {
        businessTypeKey = this.currentUser.businessType[0].businessTypeKey
      }
    }
    let cardKey
    let cardId
    this.route.queryParams.subscribe((params: Params) => {
      /** For FileRef Id Start */
      if (params['fileReference']) {
        this.fileId = params['fileReference'];
        this.initiateClaim = true
        this.checkFileRef = true
        this.getFileRefSave()
      }
      if(params['claimScannedFileKey']){
        this.initiateClaim = true
      }
      /** For FileRef Id End */
      if (params['cardId'] && params['cardId'] != "") {
        cardId = params['cardId']
      }
      if(params['searched'] == 'T'){
        this.initiateClaim = false
      }
      else {
        this.checkFileRef = false
        this.initiateClaim = false
      }
    })
    if (this.cardKey) {
      cardKey = this.cardKey
    } else if (cardId) {
      cardKey = cardId
    } else {
      cardKey = 0
    }
    if (this.selectedCardKey != undefined) {
      if (+this.selectedCardKey == cardKey) {
        return;
      }
    }
    let requiredInfo = {
      "cardKey": +cardKey,
      "userId": +userId,
      "businessTypeKey": businessTypeKey
    }
    this.selectedCardKey = cardKey
    this.oldRequest = this.hmsDataService.postApi(ClaimApi.getDisciplineList, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.claimType = data.result
        this.loginFrom = localStorage.getItem('loginFrom');
        
        //storing all claimtype used in reset form
        if (this.claimTypeAll == null || this.claimTypeAll.length == 0)
          this.claimTypeAll = data.result;

        if (this.route.snapshot.url[0]) {
          if (this.route.snapshot.url[0].path == "view") {
            this.route.params.subscribe((params: Params) => {
              
                let record = this.disciplineTypeList.filter(x => x.disciplineKey == params['type'])
                let index = this.claimType.findIndex(ct=> ct.disciplineKey == record[0].disciplineKey)
                if (index == -1) {
                  this.claimType.push(record[0])
                }
              
              if (params['type']) {
                this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": parseInt(params['type']) })
                this.disciplineKey.emit(parseInt(params['type']));
                this.claimService.getDisciplineKey.next(parseInt(params['type']))
              }
            })
            return;
          }
        }
        else if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.cardHolderKey && this.claimType.length == 1) {
          this.selectedDiscKey = data.result[0].disciplineKey
          if (this.bsnsTypeCd != Constants.albertaBusinessTypeCd) {
            $('#cgI_claimType').focus();
          }
          else {
            $('#claimType').focus()
          }

          this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": +this.selectedDiscKey })
          this.claimService.getDisciplineType.emit(this.selectedDiscKey)
          this.getDisciplineTypeDefault(this.selectedDiscKey);
        }
        else {
          if (this.bsnsTypeCd) {
            if (this.bsnsTypeCd == Constants.albertaBusinessTypeCd || this.loginFrom == "albertalogin" || this.loginFrom == "doctorlogin") {
              
              this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": 1 })
            } else {
              if (this.selectedDiscipline) {
                let disciplineValue = this.claimType.filter(val => val.disciplineKey == this.selectedDiscipline).map(data => data.disciplineName)
                if (disciplineValue.length == 0) {
                  this.toastrService.warning(this.translate.instant('claims.claims-toaster.selected-discipline'), '', {
                    timeOut: 8000,
                  })

                  this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": null })
                  return;
                }
              }
            }
          } else {
            if (this.claimDashboardDiscKey == undefined) {
              this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": 1 })
              this.getDisciplineTypeDefault(1);
            }
          }

          this.route.params.subscribe((params: Params) => {

            if (params['type']) {
              this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": parseInt(params['type']) })
              this.disciplineKey.emit(parseInt(params['type']));
              this.claimService.getDisciplineKey.next(parseInt(params['type']))
            } else if (params['fileReference']) {
              var selectedVal = this.claimType.filter(val => val.disciplineName == this.fileDisciplineType).map(data => data.disciplineKey)
              this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": parseInt(selectedVal[0]) })
              this.disciplineKey.emit(parseInt(params['type']));
              this.claimService.getDisciplineKey.next(parseInt(params['type']))
            } else {              
            }
          });
        }

      } else {

      }

    })
    
    this.getPermission();
  }
  copyClaim() {
    if (this.lockString != "" && this.lockString != undefined) {
      this.toastrService.error(this.lockString)
      return
    }
    localStorage.setItem("claimType", this.ClaimGeneralInformationFormGroup.value.claimType)
  }
  getPermission() {
    let userType = JSON.parse(localStorage.getItem('type'))
    let userTypeArray = []
    userType.forEach(element => {
      userTypeArray.push(element.userTypeKey);
    });
    let submitData = {
      "userTypeKeyList": userTypeArray
    }
    // checking role  issue no 614
    this.hmsDataService.postApi(CommonApi.getMenuActionsByRoleKey, submitData).subscribe(dataa => {
      if (dataa.code == 200 && dataa.status == 'OK') {
        for (var i in dataa.result) {
          if (dataa.result[i].menuName === "Pre-Authorized By Review") {
            let x;
            if (dataa.result[i].actionAccess) {
              this.preAuthReview = true;
              this.GetClaimType();
              return
            } else {
              this.preAuthReview = false;
              this.GetClaimType();
              return
            }
          }
        }
        this.GetClaimType();
      }
    })

  }
  /**
  * Get Claim Status List 
  * Added By Tarun
  * @returns: ClaimType dropdown value  
  */
  GetClaimType() {
    let businessTypeCd = ""
    
    if (this.bsnsType) {
      businessTypeCd = this.bsnsTypeCd
    } else {
      if (this.currentUser.businessType.bothAccess) {
        businessTypeCd = ""
      } else {
        businessTypeCd = this.currentUser.businessType[0].businessTypeCd
      }
    }
    let submitInfo = {
      "businessTypeCd": businessTypeCd
    }
    this.oldClaimTypeRequest = this.hmsDataService.postApi(ClaimApi.getClaimListByBsnsType, submitInfo).subscribe(async data => {
      if (data.code == 200 && data.status == "OK") {
        this.arrClaimType = data.result;
        this.filterArrClaimType = data.result;

        let userType = JSON.parse(localStorage.getItem('type'))
        let userTypeArray = []
        userType.forEach(element => {
          userTypeArray.push(element.userTypeKey);

        });
        let submitData = {
          "userTypeKeyList": userTypeArray
        }
       
        if (!this.preAuthReview) {
          this.arrClaimType = this.arrClaimType.filter(function (obj) {
                                    
          // ----Log #1258 ADSC Claims Refer Review:Claim type changed to Pre-Authorized by Review to allow choose Send to Consultant-------------------------
            if (businessTypeCd =='S'){
              return obj;   
            }
            else{
              return obj.claimTypeCd !== 'V';
            }
          });
          this.filterArrClaimType = this.arrClaimType

        }
        
        this.arrClaimTypeData = this.completerService.local(
          this.arrClaimType,
          "claimTypeDesc",
          "claimTypeDesc"
        );
        if (!this.router.url.includes("view")) {
          if (this.ClaimGeneralInformationFormGroup.value.type) {
            if (this.bsnsType && this.changeClaimType) {
              let self = this;
              let typeVlaue = this.ClaimGeneralInformationFormGroup.value.type;
              let cVlaue = typeVlaue.trim()
              let hasClaimType = []
              if (isNaN(cVlaue)) {
                hasClaimType = this.arrClaimType.filter(val =>
                  
                  val.claimTypeDesc.toLowerCase() == cVlaue.toLowerCase()
                ).map(data =>
                  data.claimTypeKey

                )
              }
              
              if (hasClaimType.length == 0) {
                this.toastrService.warning("Claim Type Changes According To Card. Kindly Recheck!!", '', {
                  timeOut: 8000,
                })
                this.ClaimGeneralInformationFormGroup.patchValue({ 'type': "" });
              } else {
              }
            }
          } else {
            var Desc = data.result.filter(val => val.claimTypeDesc == "Paper").map(data => data.claimTypeDesc)
            var key = data.result.filter(val => val.claimTypeDesc == "Paper").map(data => data.claimTypeKey)
            if (this.checkClaimType) {
              this.claimService.selectedClaimTypeKeyData.emit(this.selectedClaimTypeKey)
            } else {
              this.selectedClaimTypeKey = key[0]
              this.claimService.selectedClaimTypeKeyData.emit(this.selectedClaimTypeKey)
            }
            this.ClaimGeneralInformationFormGroup.patchValue({ 'type': Desc[0] });
          }
          //
          if (this.claimTypeBussinessType == 'S') {
            this.fetchReferenceNumber()
          }
        }
     
        this.changeClaimType = false
      }
      else {
        this.arrClaimType = []
        this.filterArrClaimType = []
        this.changeClaimType = false
      }
    })
  }

  SelectedClaimType(selected: any) {
    var index = this.filterArrClaimType.findIndex(function (p) { 
    })   
    var inde = this.filterArrClaimType.filter(p => p.claimTypeDesc.toLowerCase().trim() == selected.toLowerCase().trim())    
    if (inde) {
      let selected = inde[0]
      this.checkClaimType = true
      this.selectedClaimTypeKey = selected.claimTypeKey.toString()
      this.claimService.selectedClaimTypeKeyData.emit(this.selectedClaimTypeKey)
      let claimTypeCd = selected.claimTypeCd
      this.claimService.getClaimType.emit(this.selectedClaimTypeKey)
      this.claimService.getclaimTypeCd.emit(claimTypeCd)
      this.selectedClaimTypeCd = claimTypeCd
    } else {
      this.selectedClaimTypeKey = ""
    }
  }
  onSelectedClaimType(selected: CompleterItem) {
    if (selected) {
      this.checkClaimType = true
      this.selectedClaimTypeKey = selected.originalObject.claimTypeKey.toString()
      this.claimService.selectedClaimTypeKeyData.emit(this.selectedClaimTypeKey)
      let claimTypeCd = selected.originalObject.claimTypeCd
      this.claimService.getClaimType.emit(this.selectedClaimTypeKey)
      this.claimService.getclaimTypeCd.emit(claimTypeCd)
      this.selectedClaimTypeCd = claimTypeCd
    } else {
      this.selectedClaimTypeKey = ""
    }
  }


  searchBlur(e) {
    setTimeout(() => {

      $('#claimType_search').hide();
      $('#claimTypeError').show()

      if (this.hoveredValue != '') {   // log 1062
        this.ClaimGeneralInformationFormGroup.patchValue({ 'type': this.hoveredValue });
        this.SelectedClaimType(this.hoveredValue);
      } else {


        let e = $('#claimType_search').find('.highlite');

        if (e.length > 0) {
          let patchValue = e.text() || $("#claimType").val();
          this.ClaimGeneralInformationFormGroup.patchValue({ 'type': patchValue });
          this.SelectedClaimType(patchValue);

        } else {

          let str
          str = $('#claimType').val();

          let tepArray = this.arrClaimType;
          let result = tepArray;
          result = tepArray.filter(obj => {
            return obj.claimTypeDesc.trim().toLowerCase().indexOf(str.trim().toLowerCase()) == 0;
          });
          this.filterArrClaimType = result
        }
        if (this.filterArrClaimType.length == 1) {
          this.ClaimGeneralInformationFormGroup.patchValue({ 'type': this.filterArrClaimType[0].claimTypeDesc })
          
        }
        else {
        }
      }
    }, 200);
  }
  focused() {
    let str: any
    str = $('#claimType').val();
    if (!this.isdone) {
      this.isdone = true;
      this.ClaimGeneralInformationFormGroup.patchValue({
        "type": ''
      })
      $('#claimType').focus();
    }
    
  }

  SearcType(event) {

    let a = ['Enter', 'Tab', 'ArrowDown', 'ArrowUp'];
    let b = ['Enter', 'Tab'];
   
    if (!a.includes(event.key)) {
      $('#claimType_search').find('.option').removeClass("highlite");
    }
    if (event.key == 'Tab' || event.key == '') {
      this.isOne = false;
      let txt = $('#claimType').val();
      if (txt) {
        var element = $(".option").filter(function () {
          return $(this).text().trim() === txt;
        })
        if (element) {
          element.addClass('highlite')
        }
      }
      
    }
    
    if (event.key == 'ArrowRight' || event.key == 'ArrowLeft') {
      return true;
    }

    if (event.key == 'Enter') {
      let hilite = $('#claimType_search').find('.highlite').text().trim();
      if (hilite) {
        this.ClaimGeneralInformationFormGroup.patchValue({ 'type': hilite })
        $('#claimType_search').find('.option').removeClass("highlite");
        $('#claimType_search').hide();
        $('#claimTypeError').show()

        return true
      }
      let i = $('#claimType_search').find('.over').text().trim();
      if (i) {
        this.ClaimGeneralInformationFormGroup.patchValue({ 'type': i })
        $('#claimType_search').find('.option').removeClass("over");
        $('#claimType_search').hide();
        $('#claimTypeError').show()

        return true
      }

    }
    if (event.key == 'ArrowDown') {
      let i = $('#claimType_search').find('.highlite').index();
      let length = $('.option').length;
      if (i != length - 1) {
        $('#claimType_search').find('.option').removeClass("highlite");
        $('#claimType_search').find('.option').eq(i + 1).addClass('highlite')
      }
      // log 1062
      let selectedVal = $('#claimType_search').find('.highlite').text().trim();
      this.ClaimGeneralInformationFormGroup.patchValue({ 'type': selectedVal });
      this.SelectedClaimType(selectedVal);
    }
    if (event.key == 'ArrowUp') {
      let i = $('#claimType_search').find('.highlite').index();
      if (i != 0) {
        $('#claimType_search').find('.option').removeClass("highlite");
        $('#claimType_search').find('.option').eq(i - 1).addClass('highlite')
      }
      // log 1062
      let selectedVal = $('#claimType_search').find('.highlite').text().trim();
      this.ClaimGeneralInformationFormGroup.patchValue({ 'type': selectedVal });
      this.SelectedClaimType(selectedVal);
    }

    $('#claimType_search').show();
    $('#claimTypeError').hide()
    let arrowDownUp = false;
    let restrictArray = ['ArrowDown', 'ArrowUp']
    if (restrictArray.includes(event.key)) {
      arrowDownUp = true
    }
    if (!this.isOne) {
      this.isOne = true
      let str
      if (!arrowDownUp) {
        str = $('#claimType').val();
        let tepArray = this.arrClaimType;
        let result = tepArray.filter(obj => {
          return obj.claimTypeDesc.trim().toLowerCase().indexOf(''.toLowerCase()) === 0;
        })
        this.filterArrClaimType = result
      }

    } else if (!arrowDownUp) {
      let str
      str = $('#claimType').val();
      let tepArray = this.arrClaimType;
      let result = tepArray;
      result = tepArray.filter(obj => {
        return obj.claimTypeDesc.trim().toLowerCase().indexOf(str.trim().toLowerCase()) == 0;
      });
      this.filterArrClaimType = result
    }
    if (this.filterArrClaimType.length == 1 && event.key.toLowerCase() != 'backspace') {
      this.ClaimGeneralInformationFormGroup.patchValue({ 'type': this.filterArrClaimType[0].claimTypeDesc })
      $('.option').addClass('highlite');
    }
    if (this.filterArrClaimType.length == 0) {
      $('#claimType_search').hide();
      $('#claimTypeError').show()
    }

    event = event || window.event;
    var charCode = event.which || event.keyCode;
    var charStr = String.fromCharCode(charCode);

    if (/[a-z0-9]/i.test(charStr) || event.key == 'Backspace') {

    } else {
      $('#claimType').select();
    }

   
  }
  clicked() {    
    this.SearcType({ "key": '' })
  }
  focus(e) {
    this.hoveredValue = "";
    let self = this
    $(document).on('mouseover', '.option', function (e) {
      $('#claimType_search').find('.option').removeClass("highlite");
      $('#claimType_search').find('.option').removeClass("over");

      $(e.target).addClass('over');
      let selectedVal = $('#claimType_search').find('.over').text().trim();
      self.ClaimGeneralInformationFormGroup.patchValue({ 'type': selectedVal });
      self.SelectedClaimType(selectedVal);
      
    });
    $(document).on('click', '.option', function (e) {
      self.ClaimGeneralInformationFormGroup.patchValue({ 'type': $(this).text().trim() })

    });
 
  }

  
  getDisciplineType(event) {
    let selectedDiscipline = ""
    this.selectedDiscipline = ""
    selectedDiscipline = event.target.value;
    this.selectedDiscipline = selectedDiscipline
    this.disciplineKey.emit(parseInt(selectedDiscipline));
    this.hmsDataService.OpenCloseModal("btnGetClaimItems");
    this.claimService.getDisciplineType.emit(selectedDiscipline)
    this.claimService.getDisciplineKey.next(selectedDiscipline)

  }

  getDisciplineTypeDefault(value) {    
    let selectedDiscipline = ""
    this.selectedDiscipline = ""
    selectedDiscipline = value;
    this.selectedDiscipline = selectedDiscipline
    this.disciplineKey.emit(parseInt(selectedDiscipline));
    this.hmsDataService.OpenCloseModal("btnGetClaimItems");
    this.claimService.getDisciplineType.emit(selectedDiscipline)
    this.claimService.getDisciplineKey.next(selectedDiscipline)
  }


  getClaimTypeVal(event) {
    let selectedClaimType = ""
    selectedClaimType = event.target.value;
    let claimTypeCd = this.arrClaimType.filter(val => val.claimTypeKey == selectedClaimType).map(data => data.claimTypeCd)
    this.claimService.getClaimType.emit(selectedClaimType)
    this.claimService.getclaimTypeCd.emit(claimTypeCd[0])
    this.selectedClaimTypeCd = claimTypeCd[0]
  }

  changeDateFormat(event, x, y) { }

  getFileRefSave() {
    let submitData = {
      "fileReference": this.fileId
    }
    this.hmsDataService.postApi(ClaimApi.getFileRefUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.filePath = data.result.filePath;
        this.fileDisciplineType = data.result.claimType.toUpperCase()
        this.fileDisciplineType == 'HSA' ? this.fileDisciplineType = 'SUPPLEMENTAL' : this.fileDisciplineType = this.fileDisciplineType
        this.ClaimGeneralInformationFormGroup.patchValue({ 'fileRefVal': data.result.fileReference })
      }
      else {
        this.toastrService.error('File Not Found!', '', {
          timeOut: 8000,
        });
      }
    })
  }

  openNewWindow() {
    var windowObjectReference;
    var params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000'
    windowObjectReference = window.open(this.filePath, "CNN_WindowName", params);
    windowObjectReference.focus();
  }

  getClaimFileForView() {
    let submitData = {
      'disciplineNumber': +this.selectedDisciplineKey,
      'claimNumber': +this.claimKey
    }
    this.hmsDataService.postApi(ClaimApi.getAttachClaimFileForViewUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.filesPath = data.result.claimDocPath;
      }
      else if (data.code == 404 && data.status == "NOT_FOUND"){
        this.filesPath = ''
      }
      else {
        if (data.hmsMessage.messageShort == "FILE_NOT_FOUND"){
          this.hideBtn = true;
         }
      }
    })
  }

  openFileViewWindow() {
    var windowObjectReference;
    var params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000'
    windowObjectReference = window.open(this.filesPath, "CNN_WindowName", params);
    console.log("view claim file button to click open new window:-" ,this.filesPath)  //  add console log to check filepath in new window
    windowObjectReference.focus();
  }

  backToSearch() {
    this.claimService.isBackClaimSearch = true
  }
  backToReviewSearch() {
    this.currentUserService.isReviewBack = true
    this.ObservableReviewObj = Observable.interval(2000).subscribe(x => {
      this.currentUserService.claimsClick.emit(true)         
      this.ObservableReviewObj.unsubscribe();
    });
  }
  /* get language list Api */
  getAllLanguage() {
    this.hmsDataService.getApi(CommonApi.getLanguageList).subscribe(data => {
      this.getDisciplineList();
      if (data.code == 200 && data.status === "OK") {
        this.languages = data.result;
        if (this.claimService.showBackSearcBtn) {
          this.showBackBtn = true
          this.claimService.showBackSearcBtn = false
        } else {
          this.showBackBtn = false
        }
        if (this.currentUserService.showReviewBackButton) {
          this.showReviewBackBtn = true
          this.currentUserService.showReviewBackButton = false
        } else {
          this.showReviewBackBtn = false
        }
        if (this.currentUserService.currentUser.businessType.isAlberta) {
          this.setClaimTypeFocus = true//For Autofocus on disciplione if logged in user is not alberta
        } else {
          this.setClaimTypeFocus = false
          this.elementRef.nativeElement.focus();//For Autofocus on disciplione if logged in user is not alberta
        }
      } else {
        this.languages = []
      }
      error => {
      }
    })
  }
  addFocusToCard() {
    document.getElementById('cardId').focus()
  }
  getBtnPermission() {

    let userType = JSON.parse(localStorage.getItem('type'))
    let userTypeArray = []
    userType.forEach(element => {
      userTypeArray.push(element.userTypeKey);
    });
    let submitData = {
      "userTypeKeyList": userTypeArray
    }
    this.hmsDataService.postApi(CommonApi.getMenuActionsByRoleKey, submitData).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        for (var i in data.result) {
          if (data.result[i].menuName === "Pre-Authorized By Review") {
           
            if (data.result[i].actionAccess) {
              this.preAuthReview = true;
              return true;
            } else {
              this.preAuthReview = false;
              return false;
            }
          }
        }
      }
    });
  }
  //Add getClaimCategoryList() for #1206
  getClaimCategoryList(){
    if (this.route.snapshot.queryParams.claimcategory == 'true') {
      if (this.route.snapshot.queryParams.isAdDash == 'true') {
        this.bsnsTypeCd = 'S'
      } else {
        this.bsnsTypeCd = 'Q'
      }
    }
     this.loginFrom = localStorage.getItem('loginFrom');
          this.claimCategoryRequest = this.hmsDataService.getApi(ClaimApi.getClaimCategoryList).subscribe(data => {
            if (data.code == 200 && data.status == "OK") {
              this.arrClaimCategory = data.result
           
              if(this.loginFrom == "quikcardlogin"){
                  if(this.bsnsTypeCd == Constants.albertaBusinessTypeCd){
                    let filteredList = this.arrClaimCategory.filter(function (e) {
                      return e.claimCategoryCd == 'D' || e.claimCategoryCd == 'E' || e.claimCategoryCd == 'S'  });
                      this.arrClaimCategory = filteredList
                  }
                  else{
                    let filteredList = this.arrClaimCategory.filter(function (e) {
                      return e.claimCategoryCd == 'W' || e.claimCategoryCd == 'M' || e.claimCategoryCd == 'S' || e.claimCategoryCd == 'E' });
                      this.arrClaimCategory = filteredList
                  }  
               }
               else if (this.loginFrom == "albertalogin" || this.loginFrom == "doctorlogin"){
                if(this.bsnsTypeCd == Constants.quikcardBusinessTypeCd){
                  let filteredList = this.arrClaimCategory.filter(function (e) {
                    return e.claimCategoryCd == 'W' || e.claimCategoryCd == 'M' || e.claimCategoryCd == 'S' || e.claimCategoryCd == 'E' });
                    this.arrClaimCategory = filteredList
                  
                }
                else{
                  let filteredList = this.arrClaimCategory.filter(function (e) {
                    return e.claimCategoryCd == 'D' || e.claimCategoryCd == 'E' || e.claimCategoryCd == 'S'  });
                    this.arrClaimCategory = filteredList
                }
               }
               else{
                let filteredList = this.arrClaimCategory.filter(function (e) {
                  return e.claimCategoryCd == 'W' || e.claimCategoryCd == 'M' || e.claimCategoryCd == 'S' || e.claimCategoryCd == 'E' });
                  this.arrClaimCategory = filteredList
               }
        }

    })
  }
  //end

  // getDASPWebClaim API integrated in case of ADSC(DASP claim) after initiated claim from Claim Dashboard
  getDASPWebClaimData() {
    let submitData = {
      "fileName": this.fileName
    }
    this.hmsDataService.postApi(ClaimApi.getDASPWebClaimUrl, submitData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let responseData = data.result
        this.claimDashboardDiscKey = responseData.disciplineKey
       
        if (this.route.snapshot.queryParams.isServiceDate == '') { 
          responseData.serviceDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
        } else {
          responseData.serviceDate = this.route.snapshot.queryParams.isServiceDate
        }
        setTimeout(() => {
        this.ClaimGeneralInformationFormGroup.patchValue({ "claimType": +responseData.disciplineKey });
        this.ClaimGeneralInformationFormGroup.patchValue({ "operator": responseData.updatedBy });
        this.claimService.mobilClaimData.emit(responseData)
        this.claimService.getDisciplineKey.next(+responseData.disciplineKey)
        }, 400);
      }
      else {
        let serviceData = {}
        if (this.route.snapshot.queryParams.isServiceDate == '') {
          serviceData = { 'serviceDate': this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()) }
        } else {
          serviceData = { 'serviceDate': this.route.snapshot.queryParams.isServiceDate}
        }
        serviceData['disciplineKey'] = +this.route.snapshot.queryParams.isDiscKey
        this.claimService.mobilClaimData.emit(serviceData)
      }
    }, (error) => {
      console.log('Data not found!')
    })
  }

  onFileChanged(event) {
    this.selectedFileName = ""
    this.selectedFile = event.target.files[0]
    var fileSize = this.selectedFile.size;
    if (fileSize < 1000) {
      this.error3 = { isError: true, errorMessage: 'Please make the file at least 1kb!' };
      this.fileSizeExceeds = true
    }
    else {
      this.error3 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.selectedFileName = this.selectedFile.name
    this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: 'Only pdf file type are allowed.' };
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  /**
   * Remove the extension from documents
   */
  removeExtension() {
    this.selectedFileName = ""
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error3 = { isError: false, errorMessage: '' };
  }

    /**
   * Send File Name to Claim Module to call attach Doc API after saving Claim 
   */
    fetchFileName() {
      let promise = new Promise((resolve, reject) => {
        if (this.allowedValue && !this.fileSizeExceeds) {
          var formData = new FormData()
          let fileName = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1, this.selectedFileName.length) || this.selectedFileName;
          let header = new Headers({ 'Authorization': this.currentUserService.token });
          let options = new RequestOptions({ headers: header });
          formData.append('attachClaimFile', this.selectedFile);
          formData.append('claimNumber', this.selectedclaimKey);
          formData.append('disciplineNumber', this.selectedDisciplineKey );
           this.hmsDataService.sendFormData(ClaimApi.attachClaimDataLoadUrl, formData).subscribe(data => {
             if (data) {
                  if (data.code == 200 && data.status == "OK") {
                    this.filesPath = data.result.claimDocPath;
                    console.log("check attach file in view claim button:-" ,this.filesPath)   //  add console log to check filepath
                  } else {
                    this.filesPath = ''
                  }
               this.removeExtension()
               this.selectedFileName = ""
             }
           })
        } else {
          return false
        }
      });
      return promise;
    }
// add save button only on view claim screen.
    SaveAttachFile(){
      this.selectedclaimKey = this.claimKey
      this.fetchFileName();
    }
}