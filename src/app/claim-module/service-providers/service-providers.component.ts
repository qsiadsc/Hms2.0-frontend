import { Component, OnInit, Input, Output, EventEmitter, QueryList, ViewChildren, ViewChild, OnChanges, SimpleChange } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ClaimApi } from '../claim-api';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ClaimService } from '../claim.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Constants } from '../../common-module/Constants';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service-providers',
  templateUrl: './service-providers.component.html',
  styleUrls: ['./service-providers.component.css'],
  providers: [ChangeDateFormatService, DatatableService]
})

export class ServiceProvidersComponent implements OnInit, OnChanges {
  dentProvAssgnKey: any;
  addressStatus: any;
  @Output() dentProvSpecAssgnKey = new EventEmitter();
  @Input() ClaimServiceProvidersFormGroup: FormGroup;
  @Input() addMode: boolean;
  @Input() viewMode: boolean;
  @Input() editMode: boolean;
  @Input() reviewer: boolean;
  @Input() resetForm: any;
  @ViewChildren(DataTableDirective)
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;

  datatableElements: DataTableDirective;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];

  public ServiceProviderPopupFormGroup: FormGroup; // change private to public
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  payToAddress = [];
  payeeData = [];
  dentProvKeyForProviderDetails;
  dateNameArray = {}
  billingAddressDetails;
  ProviderSpecialityList;
  ProviderCommentsList;
  payeeType;
  ServiceProviderEligibilityDetails;
  error: any;
  disciplineKey;
  validlicenseNo: boolean = false
  disciplineSelectedKey;
  BusinessTypeDesc;
  selectedDiscipline;
  public payeeListData: CompleterData
  public isOpen: boolean = false;
  billingAddressClass: boolean = false;
  showLoader: boolean;
  disablePayee: boolean = false;
  loggedInUserBusinessType: any;
  claimTypeBussinessType: any = '';
  cardHolderObject: any = [];
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  selectedPayeeKey;
  ClaimServiceProvidersFormGroupVal = {
    licenseNumber: ['', Validators.required],
    providerName: [''],
    payToAddress: ['', Validators.required],
    payee: [null, Validators.required],
    postalCd: ['', Validators.required]
  }
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  invalidLicenseNo = ["AB0000000", "AB0000001", "AB0000002", "AB0000003", "AB0000004", "BC0000000", "MB0000000",
    "NB0000000", "NL0000000", "NS0000000", "NT0000000", "ON0000000", "PE0000000", "QC0000000", "SK0000000"]
  payee_cd
  public postalCodeData: CompleterData
  public color2: string = "Provider";
  default: string = 'Provider';
  @ViewChild("openCloseExample") private openCloseExample: CompleterCmp | undefined;
  showSpFlag: boolean = false
  isCommentTypeExistRed: boolean = false
  isShowSpRedFlag: boolean = false
  serviceProviderCommentText;
  isDiscKeySubscription:  Subscription
  isFromDashboard:  Subscription
  constructor(private fb: FormBuilder,
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastr: ToastrService,
    private claimService: ClaimService,
    private route: ActivatedRoute,
    private router: Router,
    private dataTableService: DatatableService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private _sanitizer: DomSanitizer
  ) {

    /** Get Logged In User Business Type */
    claimService.getLoggedInBussinesType.subscribe(res => {
      this.loggedInUserBusinessType = res;
    })

    claimService.payToOther.subscribe(value => {
      this.payeeType = value;
    });

    this.isDiscKeySubscription = claimService.getDisciplineKey.subscribe(value => {
      
      this.disciplineSelectedKey = value
      
      this.getServiceProviderDetails('onSubscribe')
     
      if (this.disciplineSelectedKey == 5) {
        this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 29 }) // Cardholder Patched
        this.setValidationForHSA()
        this.claimService.payToOther.emit(parseInt('29'))
      }
      if (this.disciplineSelectedKey == 6 || this.disciplineSelectedKey == 2 || this.disciplineSelectedKey == 3) {
          if (this.addMode || this.editMode) {
            this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 29 }) // Cardholder Patched if Discipline key is 6,2 and 3
            this.claimService.payToOther.emit(parseInt('29'))
          }
    }
      //If Discipline key is Vision or Health and Payee is Cardholder(id=29)       
      this.licenceNumRequired();
      // patch provider when we will select Dental Discipline
      if (this.disciplineSelectedKey == 1) {
        if (this.addMode || this.editMode) {
        this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 28 }) // Provider Patched
        this.claimService.payToOther.emit(parseInt('28'))
        }
      }

    })

    claimService.getBusinessTypeValue.subscribe(value => {
      this.BusinessTypeDesc = value;
      if (this.BusinessTypeDesc == "DENTAL ASSISTANCE FOR SENIORS PROGRAM") {

        this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 28 }) // Payee Patched
        this.claimService.payToOther.emit("28")
      }
    })
    claimService.isDasp.subscribe(val => {
      let isLowIncome = val.isLowIncome
      if (isLowIncome == true && val.dasp == 'F') {
        this.disablePayee = true;

        this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 28 }) //Payee Patched
        this.claimService.payToOther.emit("28")
      }
      else if (isLowIncome == true && val.dasp == 'T') {
        this.disablePayee = false
      } else {
        this.disablePayee = false
      }
    })

    claimService.claimCardholderObject.subscribe(res => {
      this.cardHolderObject = res;
    })


    this.claimService.claimTypeBussinessType.subscribe(value => {
      this.claimTypeBussinessType = value;
    })
    this.error = { isError: false, errorMessage: '' };

    this.isFromDashboard = this.claimService.mobilClaimData.subscribe(data=>{      
      this.ClaimServiceProvidersFormGroup.patchValue({"licenseNumber":data.licenseNumber})
      setTimeout(() => {
        // Set Payee Type as Cardholder in case of Web Or Mobile Portal as per Arun sir
        if (this.route.snapshot.queryParams.claimCat == 'QSI Web Portal' || this.route.snapshot.queryParams.claimCat == 'QSI Mobile Portal' || this.route.snapshot.queryParams.claimCat == 'DASP Web Portal') {
          this.ClaimServiceProvidersFormGroup.patchValue({"payee":29})
          this.claimService.payToOther.emit("29")
        } else {
          this.ClaimServiceProvidersFormGroup.patchValue({"payee":28})
          this.claimService.payToOther.emit("28")
        }        
        this.getServiceProviderDetails('fromDashboard')
      }, 500);
      
    })
  }

  

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "resetForm" && !changedProp.firstChange) {
        this.payToAddress = [];
        this.dropdownList = [];
        this.addressStatus = null;
        this.validlicenseNo = false;
        if (this.addMode) {
          if (this.cardHolderObject.hasOwnProperty('plnId') && +this.cardHolderObject.plnId == 101) {
            
            this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 29 }) //Payee Patched
            this.claimService.payToOther.emit("29")
          } else {

            this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 28 }) //Payee Patched
            this.claimService.payToOther.emit("28")
          }

        }
      }
    }

  }

  ngOnInit() {

    this.dtOptions['claim-providerComments'] = Constants.dtOptionsConfig
    this.dtTrigger['claim-providerComments'] = new Subject();

    this.dtOptions['claim-serviceProvider'] = Constants.dtOptionsConfig
    this.dtTrigger['claim-serviceProvider'] = new Subject();

    this.dtOptions['claim-providerSpeciality'] = Constants.dtOptionsConfig
    this.dtTrigger['claim-providerSpeciality'] = new Subject();

    this.dtOptions['claim-providerEligibilityDetail'] = Constants.dtOptionsConfig
    this.dtTrigger['claim-providerEligibilityDetail'] = new Subject();

    this.route.queryParams.subscribe((params: Params) => {
      if (!(params['cardHolderKey'])) {
        this.ClaimServiceProvidersFormGroup.reset()
        this.disablePayee = false
      }
    });
    this.getPayeeList()
    this.ServiceProviderPopupFormGroup = new FormGroup({
      provider: new FormControl(''),
      participationDate: new FormControl(''),
      email: new FormControl(''),
      PreferredLanguage: new FormControl('')
    });
    this.dropdownSettings = Constants.angular2MultiselectForSingleSelection
  }

  public licenceNumRequired() {
   
    if (this.payeeType == 28 || this.payeeType == 29) {
      this.ClaimServiceProvidersFormGroup.controls['licenseNumber'].setErrors(null);
    }
    else {
      this.ClaimServiceProvidersFormGroup.controls['licenseNumber'].setErrors({
        "required": true
      });
    }
  }

  public onToggle() {
    if (!this.openCloseExample) {
      return;
    }
    if (this.isOpen) {
      this.openCloseExample.close();
    } else {
      this.openCloseExample.open();
      this.openCloseExample.focus();
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger['claim-providerComments'].next()
    this.dtTrigger['claim-serviceProvider'].next()
    this.dtTrigger['claim-providerSpeciality'].next()
    this.dtTrigger['claim-providerEligibilityDetail'].next()
  }

  reloadTable(tableID) {
    this.dataTableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  getPayeeList() {
    this.hmsDataService.getApi(ClaimApi.getPayeeTypesUrl).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payeeData = data.result;
        this.payeeListData = this.completerService.local(
          this.payeeData,
          null,
          "payeeTypeDesc"
        )
        if (this.addMode) {
          if (this.cardHolderObject.hasOwnProperty('plnId') && +this.cardHolderObject.plnId == 101 && this.claimTypeBussinessType !="S") {
        this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 29 }) //Payee Patched
            this.claimService.payToOther.emit("29")
          } else {
            // try catch if  copy plan issue                      
            try {
              if(this.route.snapshot.url.length>0){
                if (this.route.snapshot.url[0].path == "copy") {
                }
              }else{        
                if (this.route.snapshot.queryParams.claimCat == 'DASP Web Portal') {
                  this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 29 }) //Payee Patched
                  this.claimService.payToOther.emit("29")
                } else {
                  if(this.route.snapshot.queryParams.isDiscKey != undefined && this.route.snapshot.queryParams.isDiscKey == "6" 
                    || this.route.snapshot.queryParams.isDiscKey != undefined && this.route.snapshot.queryParams.isDiscKey == "2"
                    || this.route.snapshot.queryParams.isDiscKey != undefined && this.route.snapshot.queryParams.isDiscKey == "3"){
                    this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 29 })
                    this.claimService.payToOther.emit("29")
                  } else{
                    this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 28 }) //Payee Patched
                    this.claimService.payToOther.emit("28")
                  }
                }
              }             
            } catch (error) {
              this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 28 }) //Payee Patched
              this.claimService.payToOther.emit("28")
            }

          }

        }
      }
    });
  }
 
  onSelectedPayeeType(selected) {
    this.payeeListData;
    if (selected) {
      this.selectedPayeeKey = selected.target.value;
    } else {
      this.selectedPayeeKey = ""
    }
    this.payeeType = this.selectedPayeeKey;
    this.claimService.payToOther.emit(this.selectedPayeeKey)

    let payee_cd = this.payeeData.filter(val => val.payeeTypeKey == this.selectedPayeeKey).map(data => data.payeeTypeCd)
    if (payee_cd[0] == "D" && this.disciplineKey == 5) {
      this.ClaimServiceProvidersFormGroup.controls['payee'].setErrors({
        "HSAclaim": true
      });
    }
    // Added provider validation 
    if (payee_cd[0] == "D" && this.disciplineKey == 6) {
      this.ClaimServiceProvidersFormGroup.controls['payee'].setErrors({
        "WellnessClaim": true
      });
    }
    this.licenceNumRequired();
  }

  openPostalCode() {
    setTimeout(() => {
      $("#openSelect .c-btn").trigger('click')
    }, 500);

    return false
  }

  getServiceProviderDetails(type) {
    if (this.disciplineSelectedKey) {
      this.disciplineKey = this.disciplineSelectedKey
    } else {
      let type = localStorage.getItem('claimType') || 1 // or if we dont have type saved

      this.disciplineKey = +type;
     
    }
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.route.params.subscribe((params: Params) => {
          this.disciplineKey = params['type']
        })

      }
    }
    if (type == 'onPressTab' || type == 'fromDashboard') {
      this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": '' });
      this.ClaimServiceProvidersFormGroup.patchValue({ "payToAddress": '' });
      this.validlicenseNo = false;
    }
    if (this.ClaimServiceProvidersFormGroup.value.licenseNumber) {
      if (type == 'onPressTab' || type == 'fromDashboard') {
        this.showLoader = true
        $('#setFocus').attr("tabIndex", -1).focus();
      }
      this.dropdownList = []
      let requiredInfo = {
        "licenseNo": this.ClaimServiceProvidersFormGroup.value.licenseNumber,
        "disciplineKey": +this.disciplineKey,
        "postalCd": ""
      }
      let payee_cd = this.payeeData.filter(val => val.payeeTypeKey == this.ClaimServiceProvidersFormGroup.value.payee).map(data => data.payeeTypeCd)

      if (this.disciplineKey == 1 && this.ClaimServiceProvidersFormGroup.value.licenseNumber && payee_cd[0] == "D" && this.invalidLicenseNo.indexOf(this.ClaimServiceProvidersFormGroup.value.licenseNumber.toUpperCase()) != -1) {
        this.ClaimServiceProvidersFormGroup.controls['licenseNumber'].setErrors({
          "FakelicenseNo": true
        });
        this.showLoader = false
        if (this.router.url.indexOf("/claim?fileReference") > -1) {
        } else {
          $('#csp_licenseNo').focus();
        } 
        this.ClaimServiceProvidersFormGroup.patchValue({ "licenseNumber": '' });
        return
      } else {
        this.ClaimServiceProvidersFormGroup.controls['licenseNumber'].setErrors(null);
      }
      this.hmsDataService.postApi(ClaimApi.getServiceProviderDetailUrl, requiredInfo).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
         
          if (this.addMode && (type == 'onPressTab' || type == 'fromDashboard')) {
          let check = $('#cgI_reference').val();
          
            if(check && check!=''){

            }else{
              this.getReferenceNumber();
            }
          }
          this.dropdownList = []
          for (var i = 0; i < data.result.listValue.length; i++) {
            this.dropdownList.push({ 'id': data.result.listValue[i].postalCd, 'itemName': data.result.listValue[i].postalCd })
          }
          this.dropdownList = this.hmsDataService.removeDuplicates(this.dropdownList, 'id')
          this.dentProvKeyForProviderDetails = data.result.listValue[0].provKey
          this.getServiceProvidersComments(data.result.listValue[0].provKey)
          if (data.result.listValue.length == 1) {
            this.selectedItems = [{ 'id': data.result.listValue[0].postalCd, 'itemName': data.result.listValue[0].postalCd }]
            this.onSelectPostalCode(this.selectedItems, "singlePostalCode")
            let postalId = this.selectedItems[0].id
            this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": postalId });
          }
          this.showLoader = false
          if (type == 'onPressTab') {
            setTimeout(() => {
              $('.postalCd').focus()
            }, 200);
          }
          // Set focus on Discipline Type as per Initiate Claim from Quikcard/ADSC Dashboard
          if (type == 'fromDashboard') {
            if (this.router.url.indexOf("/claim?fileReference") > -1) {
              if (data.result.listValue.length > 1) {
                this.selectedItems = [{ 'id': data.result.listValue[0].postalCd, 'itemName': data.result.listValue[0].postalCd }]
                this.onSelectPostalCode(this.selectedItems, "singlePostalCode")
                let postalId = this.selectedItems[0].id
                this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": postalId });
              }
              document.getElementById('cgI_claimType').focus()
            }
          }
          this.ClaimServiceProvidersFormGroup.controls['licenseNumber'].setErrors(null);
          this.validlicenseNo = true
          this.isOpen = true;

          if (data.hmsMessage.messageShort == 'PROVIDER_HAS_EXPIRED') {

            this.ClaimServiceProvidersFormGroup.patchValue({ "payee": 29 })
            this.toastr.error("Provider Has Expired")
            return
          } else if (data.hmsMessage.messageShort == 'PROVIDER_IS_SUSPENDED') {
            this.toastr.error("Provider Is Suspended")
            return
          }

        }
        else if (this.addMode && data.code == 404 && data.status == "NOT_FOUND" && data.hmsMessage.messageShort == "PROVIDER_IS_DELETED") {
          this.showLoader = false
          this.toastr.error("Provider Is Deleted")
          if (this.router.url.indexOf("/claim?fileReference") > -1) {
            document.getElementById('cgI_claimType').focus()
          }
          return
        }
        else if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
          this.showLoader = false
          this.validlicenseNo = false;
          if(!this.claimService.isClaimDeleted){
            // Set focus on Discipline Type as per Initiate Claim from Quikcard/ADSC Dashboard
            if (this.router.url.indexOf("/claim?fileReference") > -1) {
              document.getElementById('cgI_claimType').focus()
            } else {
              $('#csp_licenseNo').focus();
            }           
            $('#csp_licenseNo').focus();
            this.ClaimServiceProvidersFormGroup.controls['licenseNumber'].setErrors({
              "LicnseNumNotExist": true
            });
            this.claimService.isClaimDeleted = false;
            return
          }
        }
        else if (this.disciplineKey == 5 && data.code == 404 && data.hmsMessage.messageShort == "LICENSE_NOT_VALID_FOR_SUPPLEMENTAL!"){
          this.showLoader = false
          this.validlicenseNo = false;
          $('#csp_licenseNo').focus();
            this.ClaimServiceProvidersFormGroup.controls['licenseNumber'].setErrors({
              "HSAInvalidLicenseNumber": true
            });
        }
        this.showLoader = false
      });
    } else {
      this.dropdownList = []
      this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": '' });
      this.ServiceProviderPopupFormGroup.reset();
      this.getServiceProvidersComments(0)
    }

  }

  /**
    * Generate Reference Number
    * @date 17 Oct 2019
    */
  getReferenceNumber() {
    let apiUrl = ClaimApi.getReferenceNumberUrl
    this.hmsDataService.getApi(apiUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.claimService.claimReferenceNumber.emit(data.result)
      } else {
        this.claimService.claimReferenceNumber.emit(data.result)
      }
    });
  }
  validatePayee(e) {
   if (!e.target.value || e.target.value == '0: null') {
      return false
    }
  }
  getServiceProviderDetailById() {
    this.showLoader = true
    var userId = this.currentUserService.currentUser.userId
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.route.params.subscribe((params: Params) => {
          this.disciplineKey = params['type']
        })
      }
    }
    let requiredInfo = {
      "provKey": this.dentProvKeyForProviderDetails,
      "userId": +userId,
      "disciplineKey": +this.disciplineKey
    }
    this.hmsDataService.postApi(ClaimApi.getServiceProviderDetailByIdUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let details = data.result;
        this.billingAddressDetails = details.billingAddressList;
        this.ProviderSpecialityList = details.providerSpecialityDtoList;
        this.ProviderCommentsList = details.providerCommentsDtoList;
        this.ServiceProviderEligibilityDetails = details.provEligibilityDtoList;

        this.reloadTable("claim-providerComments")
        this.reloadTable("claim-serviceProvider")
        this.reloadTable("claim-providerSpeciality")
        this.reloadTable("claim-providerEligibilityDetail")

        this.ServiceProviderPopupFormGroup.patchValue(
          {
            provider: details.provideFullName,
            participationDate: this.changeDateFormatService.convertStringDateToObject(details.provParticipationDt),
            email: details.provEMailAdd,
            PreferredLanguage: details.languageKey
          }
        )
        this.showLoader = false
      }
      else if (data.code == 404 && data.hmsMessage.messageShort && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
        this.toastr.error("Record Not Found")
        this.showLoader = false
      }
      else {
        this.showLoader = false
      }
    });
  }

  changeDateFormatparticipationDate(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }

      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.ServiceProviderPopupFormGroup.patchValue(datePickerValue);
    }
  }

  setValidatorsForPayee(event) {
    let SelectedPayee
    if (event.target) {
      SelectedPayee = event.target.value
    } else {
      SelectedPayee = event
    }
    if (event.target) {
      this.claimService.payToOther.emit(parseInt(event.target.value))
    }
    let payee_cd = this.payeeData.filter(val => val.payeeTypeKey == SelectedPayee).map(data => data.payeeTypeCd)
    if (payee_cd[0] == "D" && this.disciplineKey == 5) {
      this.ClaimServiceProvidersFormGroup.controls['payee'].setErrors({
        "HSAclaim": true
      });
    }
  }
  onSelectPostalCode(item: any, type) {
    this.billingAddressClass = false
    let postalCd
    if (type == "singlePostalCode") {
      postalCd = item[0].id
    } else {
      postalCd = item.id
    }
    let requiredInfo = {
      "licenseNo": this.ClaimServiceProvidersFormGroup.value.licenseNumber,
      "disciplineKey": +this.disciplineKey,
      "postalCd": postalCd
    }
    this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": postalCd });
    this.hmsDataService.postApi(ClaimApi.getServiceProviderDetails, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payToAddress = data.result.listValue
        let details = data.result.listValue
        if (this.payToAddress.length == 1) {
          this.ClaimServiceProvidersFormGroup.patchValue({ "payToAddress": this.payToAddress[0]['provBillAddKey'] });
          this.payToAddress[0]['status'] == 'INACTIVE' ? this.billingAddressClass = true : this.billingAddressClass = false
          if (this.payToAddress[0]['status'] == 'INACTIVE') {
            this.addressStatus = this.payToAddress[0]['status']
          }
          else if (this.payToAddress[0]['status'] == 'ACTIVE') { // Mantis Issue_0179403
            this.addressStatus = this.payToAddress[0]['status']
          }
        }
        if (this.payToAddress.length == 2) {
          let selectedPayee = this.payToAddress.filter(val => val.status == 'INACTIVE').map(data => data.provBillAddKey)
          if (selectedPayee.length == 1) {
            let activePayee = this.payToAddress.filter(val => val.status == 'ACTIVE').map(data => data.provBillAddKey)
            this.ClaimServiceProvidersFormGroup.patchValue({ "payToAddress": activePayee[0] });
            this.addressStatus = this.payToAddress.filter(val => val.status == 'ACTIVE').map(data => data.status)

          } else {
          }
        }
        this.dentProvKeyForProviderDetails = details[0].provKey /* provKey will be same for all postalCd linked with Lic No.*/
        this.dentProvSpecAssgnKey.emit(details[0].provSpecKey);
        this.disciplineKey = details[0].disciplineKey
      } else {
        this.payToAddress = []
      }
    })
  }

  setValueForServiceProvider(item: any) {
    let requiredInfo = {
      "licenseNo": item.licenseNo,
      "disciplineKey": item.disciplineKey,
      "postalCd": item.postalCd
    }
    this.selectedItems = [{ 'id': item.postalCd, 'itemName': item.postalCd }]
    this.hmsDataService.postApi(ClaimApi.getServiceProviderDetails, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.payToAddress = data.result.listValue
        let details = data.result
        this.ClaimServiceProvidersFormGroup.patchValue({ "payToAddress": item.payToAddress });
        let seletctedPayeeObj = this.payToAddress.filter(val => val.provBillAddKey == item.payToAddress).map(value => value.status)
        seletctedPayeeObj[0] == 'INACTIVE' ? this.billingAddressClass = true : this.billingAddressClass = false
        this.dentProvKeyForProviderDetails = this.payToAddress[0].provKey
        if (this.payToAddress[0]) {
          this.dentProvAssgnKey = this.payToAddress[0].provSpecKey
        }
        this.dentProvSpecAssgnKey.emit(this.dentProvAssgnKey);
        this.disciplineKey = details.disciplineKey
      } else {
        this.payToAddress = []
      }
    })
  }
  setValidationForHSA() {
    this.ClaimServiceProvidersFormGroup.get('licenseNumber').clearValidators();
    this.ClaimServiceProvidersFormGroup.get('postalCd').clearValidators();
    this.ClaimServiceProvidersFormGroup.get('payToAddress').clearValidators();
    this.ClaimServiceProvidersFormGroup.get('licenseNumber').updateValueAndValidity();
    this.ClaimServiceProvidersFormGroup.get('postalCd').updateValueAndValidity();
    this.ClaimServiceProvidersFormGroup.get('payToAddress').updateValueAndValidity();
  }
  emptyPayToAddress(item: any) {
    this.ClaimServiceProvidersFormGroup.patchValue({ "payToAddress": '' });
    this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": '' });
    this.billingAddressClass = false
  }

  setClassBillingAdrs(event) {
    const selectEl = event.target;
    const val = selectEl.options[selectEl.selectedIndex].getAttribute('addrs-status');
    val == 'INACTIVE' ? this.billingAddressClass = true : this.billingAddressClass = false
    this.addressStatus = val
  }


  onSelectedPostalCode(selected: CompleterItem, type) {
    if (selected) {
      this.selectedItems = [{ 'id': selected.originalObject.id, 'itemName': selected.originalObject.itemName }]
      this.onSelectPostalCode(this.selectedItems, "singlePostalCode")
      let postalId = this.selectedItems[0].id
      this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": postalId });
    }
  }

  postalCodeIsMandatory() {
    if (this.ClaimServiceProvidersFormGroup.value.postalCd == '') {
      this.ClaimServiceProvidersFormGroup.controls['postalCd'].setErrors({
        "postalCdIsMandatory": true
      });
    }
  }

  addnew() {
    if (this.ClaimServiceProvidersFormGroup.controls.payToAddress.value) {
      this.claimService.addNewClaimItem.emit(true)
    }
  }

  changePostalCode(event) {
    if (event.target.value) {
      this.selectedItems = [{ 'id': event.target.value, 'itemName': event.target.value }]
      this.onSelectPostalCode(this.selectedItems, "singlePostalCode")
      let postalId = this.selectedItems[0].id
      this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": postalId });
    }
  }

  autocompleListFormatter = (data: any): SafeHtml => {
    let html = `<span>${data.itemName}</span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }

  valueChanged(newVal) {
    if (newVal) {
      this.selectedItems = [{ 'id': newVal.id, 'itemName': newVal.itemName }]
      this.onSelectPostalCode(this.selectedItems, "singlePostalCode")
      let postalId = this.selectedItems[0].id
      this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": postalId });
    } else {
      this.ClaimServiceProvidersFormGroup.patchValue({ "postalCd": '' });
    }
  }

  // Log #1008: Get Service Providers Comments
  getServiceProvidersComments(provKey) {
    var reqParam = {
      "cardholderKey": -1,
      "claimKey": -1,
      "providerKey": provKey //66732//340//4
    }
    this.hmsDataService.postApi(ClaimApi.getAllComments, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let dataResult = data.result.data
        if (dataResult.length > 0) {
          if (dataResult[0].commentType == 'Service Provider Message') {
            this.showSpFlag = true
            if (dataResult[0].claimImportance == 'Y') {
              this.isShowSpRedFlag = true
              this.serviceProviderCommentText = dataResult[0].commentText
            } else {
              this.isShowSpRedFlag = false
              this.serviceProviderCommentText = dataResult[0].commentText
            }
          } else {
            this.showSpFlag = false
            this.serviceProviderCommentText = ''
          }
        } else {
          this.showSpFlag = false
          this.serviceProviderCommentText = ''
        }
      } else {
        this.showSpFlag = false
      }
    })
  }

  ngOnDestroy() {
    if (this.isDiscKeySubscription) {
      this.isDiscKeySubscription.unsubscribe()
    }
    if (this.isFromDashboard) {
      this.isFromDashboard.unsubscribe()
    }
  }

}
