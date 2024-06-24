import { Component, OnInit, ViewChild, Input, ViewChildren, QueryList, HostListener } from '@angular/core';
import { GeneralInformationComponent } from './general-information/general-information.component';
import { BillingAddressComponent } from './billing-address/billing-address.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from './../common-module/shared-services/datatable.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommonModuleModule } from './../common-module/common-module.module';
import { ServiceProviderApi } from './../service-provider-module/service-provider-api';
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { EligibilityHistoryComponent } from './eligibility-history/eligibility-history.component';
import { SpecialityComponent } from './speciality/speciality.component';
import { CustomValidators } from '../common-module/shared-services/validators/custom-validator.directive';
import { Subject } from 'rxjs/Subject';
import { DatePipe } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import { Constants } from '../common-module/Constants';
import { ClaimApi } from './../claim-module/claim-api';
import { TranslateService } from '@ngx-translate/core';
import { ServiceProviderService } from './serviceProvider.service';
import { FormCanDeactivate } from './../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CommonDatePickerOptions } from '../common-module/Constants';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-service-provider-module',
  templateUrl: './service-provider-module.component.html',
  styleUrls: ['./service-provider-module.component.css'],
  providers: [ChangeDateFormatService, DatePipe, DatatableService, TranslateService]
})

export class ServiceProviderModuleComponent extends FormCanDeactivate implements OnInit {
  selectedGroupName: any;
  expired: boolean;
  hideBtn: boolean = false;
  observableObj: any;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  @ViewChild('FormGroup')
  @ViewChild(GeneralInformationComponent) generalInformationComponent;
  @ViewChild(BillingAddressComponent) billingAddressComponent;
  @ViewChild(EligibilityHistoryComponent) EligibilityHistoryComponent;
  @ViewChild(SpecialityComponent) specialityComponent;
  FormGroup: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOldFilterOptions;

  @Input() serviceProviderCommentForm: FormGroup;
  savedServiceProviderData;//obj to store saved Data coming from response
  providerId;//Incase of Update 
  serviceProviderHeading: string;//Heading name change on add/edit
  addMode: boolean = true; //Enable true when user add a new card
  viewMode: boolean = false; //Enable true after a new card added
  editMode: boolean = false;
  buttonText = "Save";
  userGroupData: any;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  breadCrumbText: string;
  showCommentBussnsType: boolean = false
  serviceProviderComments = [];
  claimCommentsWithImp = [];
  claimCommentsWithoutImp = [];
  claimCommentjson: any;
  disciplineKey;
  providerKey;
  spCommentText
  spCommentImportance: boolean = false
  disableAddBtn: boolean = false
  submitted = false;
  currentUser;
  selcetdGroupkey: any
  serviceProviderChecks = [{
    "addNewServiceProvider": 'F',
    "searchServiceProvider": 'F',
    "editServiceProvider": 'F',
    "disciplineType": 'F',
    "id": 'F',
    "addSPBillingAdrs": 'F',
    "viewSPBillingAdrs": 'F',
    "editSPBillingAdrs": 'F',
    "addNewEligibilityHistory": 'F',
    "editEligibilityHistory": 'F',
    "deleteEligibilityHistory": 'F',
    "addNewSpeciality": 'F',
    "setupBan": 'F',
    "globalApproval": 'F',
    "addSPComments": 'F',
    "uplaod": 'F',
    "saveBillingAdrs": 'F',
    "updateBillingAdrs": 'F',
    "useExistingBan": 'F',
    "addNewBankAccount": 'F',
    "saveSetupBan": 'F',
    "searchExistingBan": 'F',
    "select": 'F',
    "addNewProcMask": 'F',
    "editProcMask": 'F',
    "deleteProcMask": 'F',
    "editSpeciality": 'F',
    "deleteSpeciality": 'F',
    "linkSetUpBan": 'F',
  }]
  showLoader: boolean = false

  // for File Select field in comments.
  selectedFile;
  error: any;
  error1: any
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  allowedExtensions = ["application/pdf"]
  allowedValue: boolean = false

  constructor(private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private toastrService: ToastrService,
    private datePipe: DatePipe,
    private dataTableService: DatatableService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private serviceProviderService: ServiceProviderService,
    private currentUserService: CurrentUserService,
    private completerService: CompleterService
  ) {
    super();
    // to set errors false by default in File Select field of Comments.
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.serviceProviderCommentForm.patchValue(datePickerValue);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
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
      this.serviceProviderCommentForm.patchValue(datePickerValue);
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
      if (!this.expired && obj) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }

  }
  ngOnInit() {
    this.showLoader = true
    this.serviceProviderCommentForm = this.fb.group({
      provComTxt: ['', [Validators.required, Validators.maxLength(500), CustomValidators.notEmpty]],
      claimImportance: [''],
      spCommentGroupKey: [''],
      expiry_date: [''],
      //for File Select field in comments.
      serviceProviderCommentsDocumentName: new FormControl('')
    });
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['EDP'].concat(this.currentUserService.authChecks['SPP'])
          .concat(this.currentUserService.authChecks['BBA']).concat(this.currentUserService.authChecks['EBN'])
          .concat(this.currentUserService.authChecks['GLA']).concat(this.currentUserService.authChecks['NSP'])
          .concat(this.currentUserService.authChecks['EHS'])
        checkArray.push(this.currentUserService.authChecks['VSP'][0])
        checkArray.push(this.currentUserService.authChecks['ASR'][0])
        checkArray.push(this.currentUserService.authChecks['SPA'][0])
        checkArray.push(this.currentUserService.authChecks['SBA'][0])
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
        this.showLoader = false
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['EDP'].concat(this.currentUserService.authChecks['SPP'])
          .concat(this.currentUserService.authChecks['BBA']).concat(this.currentUserService.authChecks['EBN'])
          .concat(this.currentUserService.authChecks['GLA']).concat(this.currentUserService.authChecks['NSP'])
          .concat(this.currentUserService.authChecks['EHS'])
        checkArray.push(this.currentUserService.authChecks['VSP'][0])
        checkArray.push(this.currentUserService.authChecks['ASR'][0])
        checkArray.push(this.currentUserService.authChecks['SPA'][0])
        checkArray.push(this.currentUserService.authChecks['SBA'][0])
        this.getAuthCheck(checkArray)
        this.showLoader = false
      })
    }
    this.FormGroup = this.fb.group({
      ServiceProviderGeneralInformationFormGroup: this.fb.group(this.generalInformationComponent.ServiceProviderGeneralInformationFormGroupVal),
    })
    this.serviceProviderHeading = "Add";
    this.breadCrumbText = "ADD SERVICE PROVIDER";
    this.dtOptions['serviceProvider-comments'] = Constants.dtOptionsConfig
    this.dtTrigger['serviceProvider-comments'] = new Subject();

    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.enableViewMode();
      }
    }
  }
  getAuthCheck(serviceProviderArray) {
    this.currentUser = this.currentUserService.currentUser
    let userAuthCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.serviceProviderChecks = [{
        "addNewServiceProvider": 'T',
        "searchServiceProvider": 'T',
        "editServiceProvider": 'T',
        "disciplineType": 'T',
        "id": 'T',
        "addSPBillingAdrs": 'T',
        "viewSPBillingAdrs": 'T',
        "editSPBillingAdrs": 'T',
        "addNewEligibilityHistory": 'T',
        "editEligibilityHistory": 'T',
        "deleteEligibilityHistory": 'T',
        "addNewSpeciality": 'T',
        "setupBan": 'T',
        "globalApproval": 'T',
        "addSPComments": 'T',
        "uplaod": 'T',
        "saveBillingAdrs": 'T',
        "updateBillingAdrs": 'T',
        "useExistingBan": 'T',
        "addNewBankAccount": 'T',
        "saveSetupBan": 'T',
        "searchExistingBan": 'T',
        "select": 'T',
        "addNewProcMask": 'T',
        "editProcMask": 'T',
        "deleteProcMask": 'T',
        "editSpeciality": 'T',
        "deleteSpeciality": 'T',
        "linkSetUpBan": 'T'
      }]
    } else {
      for (var i = 0; i < serviceProviderArray.length; i++) {
        userAuthCheck[serviceProviderArray[i].actionObjectDataTag] = serviceProviderArray[i].actionAccess
      }
      this.serviceProviderChecks = [{
        "addNewServiceProvider": userAuthCheck['SPP166'],
        "searchServiceProvider": userAuthCheck['SPP167'],
        "editServiceProvider": userAuthCheck['VSP169'],
        "disciplineType": userAuthCheck['EDP170'],
        "id": userAuthCheck['EDP171'],
        "addSPBillingAdrs": userAuthCheck['EDP172'],
        "viewSPBillingAdrs": userAuthCheck['EDP177'],
        "editSPBillingAdrs": userAuthCheck['EDP178'],
        "addNewEligibilityHistory": userAuthCheck['EDP173'],
        "editEligibilityHistory": userAuthCheck['EHS193'],
        "deleteEligibilityHistory": userAuthCheck['EHS194'],
        "addNewSpeciality": userAuthCheck['EDP174'],
        "setupBan": userAuthCheck['EDP175'],
        "globalApproval": userAuthCheck['EDP176'],
        "addSPComments": userAuthCheck['ASR179'],
        "uplaod": userAuthCheck['EDP180'],
        "saveBillingAdrs": userAuthCheck['SPA181'],
        "updateBillingAdrs": userAuthCheck['SBA182'],
        "useExistingBan": userAuthCheck['BBA183'],////////
        "addNewBankAccount": userAuthCheck['BBA184'],/////
        "saveSetupBan": userAuthCheck['BBA185'],//////////
        "searchExistingBan": userAuthCheck['EBN186'],/////////
        "select": userAuthCheck['EBN187'],
        "addNewProcMask": userAuthCheck['GLA188'],
        "editProcMask": userAuthCheck['GLA189'],
        "deleteProcMask": userAuthCheck['GLA190'],
        "editSpeciality": userAuthCheck['NSP191'],
        "deleteSpeciality": userAuthCheck['NSP192'],
        "linkSetUpBan": userAuthCheck['EDP175'],
      }]
    }
    this.getUserBussinesType()
    return this.serviceProviderChecks
  }
  ngAfterViewInit(): void {
    this.dtTrigger['serviceProvider-comments'].next()
  }

  saveServiceProviderData() {
    this.submitted = true;
    var userId = this.currentUser.userId
    if (this.FormGroup.valid) {
      let submitData
      var action = "Saved"
      var providerID = '';
      let provKeyValue = "";
      if (this.providerKey) /* update Service Provider*/ {
        var action = "Updated"
        provKeyValue = this.providerKey;
        this.viewMode = true;
        this.editMode = false;
        this.addMode = false;
        this.FormGroup.patchValue({
          ServiceProviderGeneralInformationFormGroup: {
            'discipline': this.disciplineKey
          }
        });
        this.FormGroup.disable();
        this.breadCrumbText = "VIEW SERVICE PROVIDER";
        this.serviceProviderHeading = "View";
        submitData = {
          "providerFirstName": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.firstName,
          "providerLastName": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.lastName,
          "participationDate": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.participationDate),
          "isQuikcard": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.govtType ? 'T' : 'F',
          "providerEmail": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.email,
          "languageKey": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.langauge,
          "userId": +userId,
          "providerCommentsDto": this.serviceProviderComments,
          "provKey": provKeyValue,
          "disciplineKey": this.disciplineKey
        }
        this.hmsDataServiceService.postApi(ServiceProviderApi.updateServiceProviderUrl, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.savedServiceProviderData = data.result;
            this.toastrService.success('Service Provider Details ' + action + '  Successfully!');
          }
        });
      }
      else {
        submitData = {
          "providerFirstName": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.firstName,
          "providerLastName": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.lastName,
          "participationDate": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.participationDate),
          "isQuikcard": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.govtType ? 'T' : 'F',
          "providerEmail": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.email,
          "languageKey": this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.langauge,
          "userId": +userId,
          "providerCommentsDto": this.serviceProviderComments,
          "provKey": provKeyValue
        }
        submitData["disciplineKey"] = this.FormGroup.value.ServiceProviderGeneralInformationFormGroup.discipline
        let billingAddressRequestData
        let specialityRequestData
        let eligibilityRequestData

        if (this.billingAddressComponent != undefined || this.billingAddressComponent != null || this.billingAddressComponent != "") {
          if (this.billingAddressComponent && this.billingAddressComponent.arrBillAddrList) {
            billingAddressRequestData = this.billingAddressComponent.arrBillAddrList;
          }
        }
        if (this.specialityComponent != undefined || this.specialityComponent != null || this.specialityComponent != "") {
          if (this.specialityComponent && this.specialityComponent.arrData) {
            specialityRequestData = this.specialityComponent.arrData;
          }
        }
        if (this.EligibilityHistoryComponent != undefined || this.EligibilityHistoryComponent != null || this.EligibilityHistoryComponent != "") {
          if (this.EligibilityHistoryComponent && this.EligibilityHistoryComponent.arrData) {
            for (var i = 0; i < this.EligibilityHistoryComponent.arrData.length; i++) {
              if (this.EligibilityHistoryComponent.arrData[i].suspendedInd == true) {
                this.EligibilityHistoryComponent.arrData[i].suspendedInd = 'T'
              }
              else if (this.EligibilityHistoryComponent.arrData[i].suspendedInd == false) {
                this.EligibilityHistoryComponent.arrData[i].suspendedInd = 'F'
              }
              else {
                this.EligibilityHistoryComponent.arrData[i].suspendedInd = 'F'
              }
            }
            eligibilityRequestData = this.EligibilityHistoryComponent.arrData;
          }
        }
        if (this.addMode) {
          if (billingAddressRequestData.length == 0) {
            this.toastrService.error(this.translate.instant(this.translate.instant('serviceProvider.toaster.addAtleastBillingAddress')))
            return false
          }
          else if (specialityRequestData.length == 0) {
            this.toastrService.error(this.translate.instant(this.translate.instant('serviceProvider.toaster.plsAddAtleastOneSpecialty')))
            return false
          }
          else if (eligibilityRequestData.length == 0) {
            this.toastrService.error(this.translate.instant(this.translate.instant('serviceProvider.toaster.plsAddAtleastOneEligibilityHistory')))
            return false
          }
          else {
            submitData['provAddressDtoList'] = billingAddressRequestData
            submitData['provEligibilityDtoList'] = eligibilityRequestData
            submitData['providerSpecialityDtoList'] = specialityRequestData
          }
        }
        else {
          submitData['provAddressDtoList'] = billingAddressRequestData
          submitData['provEligibilityDtoList'] = eligibilityRequestData
          submitData['providerSpecialityDtoList'] = specialityRequestData
        }
        this.hmsDataServiceService.postApi(ServiceProviderApi.saveServiceProviderUrl, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK" && data.message != "RECORD_SAVE_FAILED" && data.message != "INVALID_PROVIDER_SPECIALTY") {
            this.disableAddBtn = false
            this.savedServiceProviderData = data.result;
            this.providerKey = this.savedServiceProviderData.provKey;
            // (back to search) button hidden when we save new service provider and view page appears.
            this.observableObj = Observable.interval(50).subscribe(x => {
              this.serviceProviderService.hideBtn.emit(true);
              this.observableObj.unsubscribe();
            })
            this.serviceProviderService.saveUpdateProvider.emit(true);
            this.disciplineKey = this.savedServiceProviderData.disciplineKey
            this.toastrService.success('Service Provider Details ' + action + '  Successfully!');
            if (this.providerKey) {
              this.serviceProviderHeading = "View";
              this.breadCrumbText = "VIEW SERVICE PROVIDER";
            }
            this.router.navigate(['/serviceProvider/view/' + this.providerKey + '/type/' + this.savedServiceProviderData.disciplineKey])
          }
          else if (data.code == 200 && data.message == "INVALID_PROVIDER_SPECIALTY") {
            this.toastrService.error(this.translate.instant('serviceProvider.toaster.givenSpecialityNotExistForDiscipline'));
          }
          else if (data.code == 200 && data.message == "RECORD_SAVE_FAILED") {
            this.toastrService.error(this.translate.instant('serviceProvider.toaster.givenSpecialityNotExistForDiscipline'));
          }
          else if (data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
            this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effDateOfElgHistoryGreaterThanOldEffDate'));
          }
          else if (data.code == 400 && data.hmsMessage.messageShort == "LICENSE_ALREADY_EXIST") {
            this.toastrService.warning(this.translate.instant('serviceProvider.toaster.licenseNumberAlreadyExist'));
          }
          else if (data.code == 208) {
            this.toastrService.warning(data.hmsMessage.messageShort); // New Code Added As Per Backend[24Jan,2019]
          }
          else {
            this.toastrService.error(this.translate.instant('serviceProvider.toaster.service-provider-not-added'))
            this.disableAddBtn = false
          }
          error => {

          }
        });
      }
    }
    else {
      this.validateAllFormFields(this.FormGroup);//Form Validations
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  fillProviderDetails() {
    this.route.params.subscribe((params: Params) => {
      this.providerKey = params['id']
      this.disciplineKey = params['type']
    });
    let requiredInfo = {
      "provKey": this.providerKey,
      "userId": 1586,
      "disciplineKey": this.disciplineKey
    }
    this.providerId = +this.providerKey
    this.hmsDataServiceService.postApi(ServiceProviderApi.getServiceProviderDetailByIdWithoutEligUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let details = data.result;
        if (data.result.commentFlag == 'Y') {
          this.spCommentImportance = true
        } else {
          this.spCommentImportance = false
        }
        if (data.result.impCommentText != "" && data.result.impCommentText != null) {
          this.spCommentText = data.result.impCommentText
        }
        let editData = {
          ServiceProviderGeneralInformationFormGroup: {
            lastName: details.providerLastName,
            firstName: details.providerFirstName,
            participationDate: this.changeDateFormatService.convertStringDateToObject(details.provParticipationDt),
            govtType: (details.provQuikcardInd == 'T') ? true : false,
            email: details.provEMailAdd,
            discipline: details.disciplineKey,
            langauge: details.languageKey,
            id: details.provId
          }
        }
        this.serviceProviderComments = details.providerCommentsDtoList
        this.reloadTable('serviceProvider-comments')
        this.FormGroup.patchValue(editData);
        this.serviceProviderService.selectedDisciplineKey.emit(details.disciplineKey)
        this.serviceProviderService.selectedLanguageKey.emit(details.languageKey)         // for general point 159(serviceProviderViewMode value)
        this.serviceProviderService.govtTypeValue.emit(editData.ServiceProviderGeneralInformationFormGroup.govtType);
        this.FormGroup.patchValue({
          ServiceProviderGeneralInformationFormGroup: {
            'discipline': details.disciplineKey
          }
        });
      }
    });
  }

  enableViewMode() {
    this.fillProviderDetails()
    this.buttonText = "Edit";
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false;
    this.serviceProviderHeading = "View"
    this.FormGroup.disable();
    this.breadCrumbText = "VIEW SERVICE PROVIDER"// View Card;
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false;
    this.FormGroup.disable();
  }

  enableEditMode() {
    this.FormGroup.enable();
    this.disableFormFields();
    this.breadCrumbText = "EDIT SERVICE PROVIDER";
    this.serviceProviderHeading = "Edit";
    this.viewMode = false;
    this.addMode = false;
    this.editMode = true;
    this.buttonText = "Update";
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
  }

  disableFormFields() {
    this.FormGroup.controls.ServiceProviderGeneralInformationFormGroup.get('id').disable()
    this.FormGroup.controls.ServiceProviderGeneralInformationFormGroup.get('discipline').disable()
    this.FormGroup.patchValue({
      ServiceProviderGeneralInformationFormGroup: {
        'discipline': this.disciplineKey
      }
    });
  }

  /* to fire validation of all form fields together */
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

  reloadTable(tableId) {
    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  addServiceProviderComment(serviceProviderCommentForm, tableId, mode) {
    if (this.serviceProviderCommentForm.valid) {
      if (this.serviceProviderCommentForm.value.provComTxt) {
        if (this.serviceProviderComments != null) {
          this.serviceProviderComments = this.serviceProviderComments;
        } else {
          this.serviceProviderComments = [];
        }
        var department = this.selectedGroupName
        var username = this.currentUserService.currentUser.username
        var userId = this.currentUser.userId
        let currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
        var department = this.selectedGroupName
        let userGroup = ""
        if (this.showCommentBussnsType) {
          userGroup = this.selcetdGroupkey
        } else {
          userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
        }
        let expDate = this.changeDateFormatService.convertDateObjectToString(this.serviceProviderCommentForm.value.expiry_date)
        let obj = {
          userId: +userId,
          department: department,
          userGroupKey: userGroup,
          createdOn: currentDate,
          username: username,
          expiredOn: expDate,
          provComTxt: serviceProviderCommentForm.value.provComTxt,
          claimImportance: (serviceProviderCommentForm.value.claimImportance == '' || serviceProviderCommentForm.value.claimImportance == null) ? "N" : "Y"
        };
        if (serviceProviderCommentForm.value.claimImportance) {
          this.claimCommentsWithImp.push(obj);
          this.claimCommentsWithImp.reverse();
        } else {
          this.claimCommentsWithoutImp.push(obj);
          this.claimCommentsWithoutImp.reverse();
        }
        if (mode == 'addMode') {
          this.serviceProviderComments = this.claimCommentsWithImp.concat(this.claimCommentsWithoutImp);
          this.claimCommentjson = this.serviceProviderComments;
          this.reloadTable(tableId)
          let userGroup = ""
        }
        if (mode == 'editMode') {
          obj['provKey'] = +this.providerKey,
          obj['disciplineKey'] = +this.disciplineKey,
            this.hmsDataServiceService.postApi(ServiceProviderApi.addOrUpdateSingleCommentForServiceProviderUrl, obj).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                if ((obj.claimImportance == "Y") && (obj.provComTxt != "" && obj.provComTxt != null)) {
                  this.spCommentText = obj.provComTxt
                }
                this.fillProviderDetails()
                this.toastrService.success(this.translate.instant('claims.claims-toaster.comment'));
                this.getImpCommentList()
              }
            })
        }
        this.serviceProviderCommentForm.get('claimImportance').reset();
        this.serviceProviderCommentForm.reset();
      }
    } else {
      this.validateAllFormFields(this.serviceProviderCommentForm);
    }
    this.showRemoveBtn = false;
  }

  getImpCommentList() {
    let commentColumns = [
      { 'title': this.translate.instant('common.date'), 'data': 'createdOn' },
      { 'title': this.translate.instant('common.username'), 'data': 'username' },
      { 'title': this.translate.instant('common.department'), 'data': 'department' },
      { 'title': this.translate.instant('common.comments'), 'data': 'provComTxt' },
      { 'title': this.translate.instant('common.importance'), 'data': 'claimImportance' }
    ];
    var tableId = "spImpCommentsList"
    var URL = ServiceProviderApi.getImpCommentList;
    var userId = this.currentUserService.currentUser.userId
    var reqParam = [
      { 'key': 'provKey', 'value': this.providerId },
      { 'key': 'userId', 'value': +userId },
      { 'key': 'disciplineKey', 'value': this.disciplineKey }
    ]
    var tableActions = []
    var dateCols = ['createdOn'];
    if (!$.fn.dataTable.isDataTable('#spImpCommentsList')) {
      this.dataTableService.jqueryDataTableComment(tableId, URL, 'full_numbers', commentColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, undefined, 4, dateCols)
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, URL, reqParam)
    }
  }

  canDeactivate() {
    if (!this.submitted && this.FormGroup.dirty) {
      if (confirm(this.translate.instant("common.pageChangeConfirmation"))) {
        if (this.currentUserService.newTabRouterLink != undefined && this.currentUserService.newTabRouterLink != '' && this.router.url != this.currentUserService.newTabRouterLink) {
          window.open(this.currentUserService.newTabRouterLink);
          this.currentUserService.setRouterLink('');
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  getUserBussinesType() {
    if (this.currentUser.businessType.bothAccess || this.currentUser.isAdmin == 'T') {
      this.showCommentBussnsType = true
      this.userGroupData = this.completerService.local(
        this.currentUser.userGroup,
        "userGroupName",
        "userGroupName"
      );
      this.serviceProviderCommentForm.get('spCommentGroupKey').setValidators([Validators.required])
    } else {
      this.showCommentBussnsType = false
      this.serviceProviderCommentForm.get('spCommentGroupKey').clearValidators()
    }
    this.serviceProviderCommentForm.get('spCommentGroupKey').updateValueAndValidity()
  }

  onSelect(selected: CompleterItem, type) {
    if (selected) {
      this.selectedGroupName = selected.originalObject.userGroupName
      this.selcetdGroupkey = selected.originalObject.userGroupKey
    }
  }
  // for File Select field with errors on conditions.
  serviceProviderFileUpload(event) {
    this.serviceProviderCommentForm.value.serviceProviderCommentsDocumentName = ""
    this.selectedFile = event.target.files[0]
    let fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.error1 = { isError: true, errorMessage: this.translate.instant('common.fileSizeError') };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.error1 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.serviceProviderCommentForm.patchValue({ 'serviceProviderCommentsDocumentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.error = { isError: true, errorMessage: this.translate.instant('common.fileTypeError') };
      this.showRemoveBtn = true;
    } else {
      this.error = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }    
  }

  // to clear the File Select field.
  removeServiceProviderCommentsFile() {
    this.serviceProviderCommentForm.patchValue({ 'serviceProviderCommentsDocumentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }
}
