import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { PlanApi } from './../plan-api';
import { ToastrService } from 'ngx-toastr';
import { PlanService } from './../plan.service';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { TranslateService } from '@ngx-translate/core';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CardServiceService } from '../../../card-module/card-service.service';

import { UftApi } from '../../../unit-financial-transaction-module/uft-api';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { CardApi } from './../../../card-module/card-api'
import { debug } from 'console';
import { CommonApi } from './../../../common-module/common-api';
import { CustomValidators } from './../../../common-module/shared-services/validators/custom-validator.directive';

@Component({
  selector: 'app-amendment-wizard',
  templateUrl: './amendment-wizard.component.html',
  styleUrls: ['./amendment-wizard.component.css'],
  providers: [
    ChangeDateFormatService,
    ToastrService,
    PlanService,
    CurrentUserService,
    TranslateService
  ]
})
export class AmendmentWizardComponent implements OnInit {
  addMode: boolean;
  editMode: boolean;
  viewMode: boolean;
  showLoader: boolean = false;
  planType: any
  dateNameArray = {};
  mainPlanArray = [];
  printPlanMode: any
  FormGroup: any
  filterReport: FormGroup;
  initialStep: FormGroup;
  public companyDataRemote: RemoteData;
  currentUser: any;
  selectedCompanyName: any;
  selectedCompany: string;
  selecteCoKey: string;
  selecteCoID: string;
  isRequired: boolean = false;
  selectedValue: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions
  doAmendmentType: any;
  public plans = [];
  companyCoKey: any;
  dataArray = [{
    "viewAmendment": 'F',
  }]
  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private ToastrService: ToastrService,
    private planService: PlanService,
    public currentUserService: CurrentUserService,
    private translate: TranslateService,
    private completerService: CompleterService,
    public cardService: CardServiceService,

  ) {
    cardService.getCompanyCoKey.subscribe((value) => {
      this.companyCoKey = value
      this.getPlanByCompanyCokey(value)
    });
  }
  receiveCoId(event) {

    if (event) {
      this.companyCoKey = event
      this.getPlanByCompanyCokey(event)
    }
    let submitData = {
      "coKey": this.companyCoKey
    }
    this.hmsDataServiceService.post(CommonApi.getCompanyDetailByCompanyCoKey, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {

      }
    })
  }
  ngOnInit() {
    this.addMode = true;
    this.editMode = false;
    this.viewMode = false;
    
    // Security check added for Amendment
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let arrayCheck = this.currentUserService.authChecks['DTA']
        this.getAuthCheck(arrayCheck)
        this.getPredictiveCompanySearchData(this.completerService);
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let arrayCheck = this.currentUserService.authChecks['DTA']
        this.getAuthCheck(arrayCheck)
        this.getPredictiveCompanySearchData(this.completerService);
      })
    }
    this.filterReport = new FormGroup({
      'searchCompany': new FormControl(''),
      'plan': new FormControl('', CustomValidators.AmendmentPlanEmpty),
      'division': new FormControl(''),
      'dental': new FormControl(''),
      'drug': new FormControl(''),
      'health': new FormControl(''),
      'topup': new FormControl(''),
      'vision': new FormControl(''),
      'effectiveOn': new FormControl('',  CustomValidators.ExpiryDateEmpty),
      'rbutton': new FormControl(''),
      'rbutton1': new FormControl(''),
      'rbutton2': new FormControl(''),
      'rbutton3': new FormControl(''),
      'rbutton4': new FormControl(''),

    })
    this.initialStep = new FormGroup({
      'status': new FormControl('', [Validators.required]),

    })
    // to resolved calendar Issue(HMS point no - 594)
    $(document).on('click','.btnpicker', function () {
      $('#effectiveOnAmendment .mydp .selector').addClass('bottom-calender')
    })
  }

  getPlanValue(event) {
    if (event.target.value) {
      let selected = this.plans.filter(plan => plan.unitKey == event.target.value);
    }
  }
  getPlanByCompanyCokey(value) {
    
    if (!value) {
      return false
    }
    let requiredInfo = {
      "coKey": value
    }
    this.hmsDataServiceService.postApi(CardApi.getCompanyPlanUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.plans = data.result
        this.plans.unshift({ unitKey: null, plansName: 'Select' })
      } else {
        this.plans = []
      }
      error => {
      }
    })
  }

  /**
   * Method for validate the Form fields
   * @param formGroup 
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  selectedOption(value) {
    this.doAmendmentType = value
  }

  submit() {

    if (this.doAmendmentType) {
      if (this.filterReport.valid) {
        if (this.doAmendmentType == "C" && (this.filterReport.value.searchCompany == '' || !this.filterReport.value.searchCompany)) {
          this.ToastrService.error(this.translate.instant('amendment.toaster.companyNoMissing'));
          
          $('html, body').animate({
            scrollTop: $("#searchCompany").offset().top - 130
          }, 200)
          return
        }

        if ((this.doAmendmentType == "D" || this.doAmendmentType == "B") && (this.filterReport.value.division == '' || !this.filterReport.value.division)) {
          this.ToastrService.error(this.translate.instant('amendment.toaster.divisionMissing'));
          $('html, body').animate({
            scrollTop: $("#division").offset().top - 130
          }, 200)
          return
        }
        if (this.doAmendmentType == "B" && (!this.filterReport.value.dental && !this.filterReport.value.drug && !this.filterReport.value.health && !this.filterReport.value.topup && !this.filterReport.value.vision)) {
          this.ToastrService.error(this.translate.instant('amendment.toaster.benefitMissing'));
          $('html, body').animate({
            scrollTop: $("#vision").offset().top - 130
          }, 200)
          return
        }

        let coId = ''
        
        if (this.filterReport.value.searchCompany) {
          if (this.filterReport.value.searchCompany.includes(' / ')) {
            var splitCompanyName = this.filterReport.value.searchCompany.toString().split(' / ')
            if (splitCompanyName.length > 0) {
              coId = splitCompanyName[2];
    
            }
          } else {
            coId = this.filterReport.value.searchCompany

          }
        }

        let requiredInfo = {
          "aBackDate": this.changeDateFormatService.convertDateObjectToString(this.filterReport.value.effectiveOn),// mandatory
          "aCompanyNo": coId || '',// mandatory if doAmendmentType is "C"
          "aPlanNo": this.filterReport.value.plan || '',// mandatory if doAmendmentType is "C","D","B","P",
          "aDivNo": this.filterReport.value.division,// mandatory if doAmendmentType is "D","B"
          "aDentalInd": this.filterReport.value.dental ? "T" : "",// mandatory if doAmendmentType is "B"
          "aDrugInd": this.filterReport.value.drug ? "T" : "",// mandatory if doAmendmentType is "B"
          "aHealthInd": this.filterReport.value.health ? "T" : "",// mandatory if doAmendmentType is "B"
          "aHsaInd": this.filterReport.value.topup ? "T" : "",// mandatory if doAmendmentType is "B"
          "aVisionInd": this.filterReport.value.vision ? "T" : "",// mandatory if doAmendmentType is "B"
          'doAmendmentType': this.doAmendmentType        }
        this.hmsDataServiceService.postApi(PlanApi.planAmendment, requiredInfo).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            if (data.hmsMessage.messageShort == 'RECORD_PROCESS_SUCCESSFULLY') {
              this.ToastrService.success(this.translate.instant('amendment.toaster.success'));
              this.filterReport.reset();
              this.initialStep.reset();
              this.cardService.resetCompanyName.emit(true)
              this.clickbackTab('step2', 'step1');
            }
          } else if (data.code == 500) {
            this.ToastrService.error(this.translate.instant('amendment.toaster.somethingWentWrong'));
          } else if (data.code == 500) {
            this.ToastrService.error(this.translate.instant('amendment.toaster.somethingWentWrong'));
          } else if (data.code == 400 && data.status == 'BENEFIT_IS_MISSING') {
            this.ToastrService.error(this.translate.instant('amendment.toaster.benefitMissing'));
          } else if (data.code == 400 && data.status == 'DIVISION_NO_IS_MISSING') {
            this.ToastrService.error(this.translate.instant('amendment.toaster.divisionMissing'));
          } else if (data.code == 400 && data.status == 'PLAN_NO_IS_MISSING') {
            this.ToastrService.error(this.translate.instant('amendment.toaster.planMissing'));
          } else if (data.code == 400 && data.status == 'NEW_EFFECTIVE_DATE_IS_MISSING') {
            this.ToastrService.error(this.translate.instant('amendment.toaster.effectiveMissing'));
          }
          else if (data.code == 400 && data.status == 'COMPANY_NO_IS_MISSING') {
            this.ToastrService.error(this.translate.instant('amendment.toaster.companyNoMissing'));
          }else if(data.code == 400){
            this.ToastrService.error(data.hmsMessage.messageShort);

          }
          error => {
          }
        }) 



      }
      else {
        this.validateAllFormFields(this.filterReport)
      }
    } else {
      if (this.filterReport.valid) {
        this.ToastrService.error(this.translate.instant('amendment.toaster.noOptionMissing'))

      }else{
        this.validateAllFormFields(this.filterReport)
      }
    }

  }
  /**
   * Method for Footer Datepicker
   * @param event 
   * @param frmControlName 
   */
  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
    }
  }

  /**
      * Call on select the company name in predictive search
      * @param selected 
      */
  onCompanyNameSelected(selected: CompleterItem) {
    
    if (selected) {
      this.selectedCompany = selected.originalObject;
      this.selectedCompanyName = selected.originalObject.coName
      this.selecteCoKey = selected.originalObject.coKey
      this.selecteCoID = selected.originalObject.coId
    } else {
      this.selectedCompanyName = ""
      this.selecteCoKey = ''
      this.selecteCoID = ''
    }
  }
  getPredictiveCompanySearchData(completerService) {
    
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getAllPredectiveCompany + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
      this.companyDataRemote = completerService.remote(
        null,
        "coName,coId",
        "coNameAndId"
      );
      this.companyDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
      this.companyDataRemote.urlFormater((term: any) => {
        return UftApi.getPredectiveCompany + '/' + businessTypeKey + `/${term}`;
      });
      this.companyDataRemote.dataField('result');
    }
  }
  setValueProgram(value) {
  }
  getCompanySearchName(event) {
    this.filterReport.patchValue({ searchCompany: event })
  }
  /**
  * Call on blur the company name text box
  * @param filterReport 
  */
  onCompanyNameBlur(filterReport) {
    
    if (filterReport.value.searchCompany) {
      if (filterReport.value.searchCompany.includes(' / ')) {
        var splitCompanyName = filterReport.value.searchCompany.toString().split(' / ')
        if (splitCompanyName.length > 0) {
          this.selectedCompanyName = splitCompanyName[0];

        }
      } else {
        this.selectedCompanyName = ''
      }
    } else {
      this.selectedCompany = ''
      this.selectedCompanyName = ''
      this.selecteCoKey = ''
      this.selecteCoID = ''
    }
  }
  /**
    * Trigger the onChangeTab function to get the tabs data on click the next button
    * @param mainTab 
    * @param activeTab 
    */
  clickNextTab(mainTab, activeTab) {
    if (this.initialStep.valid) {
      this.isRequired = false;
      this.selectedValue = this.initialStep.controls.status.value
      this.onSetPlanInfoTabFocus(mainTab, activeTab);
    } else {
      this.isRequired = true
    }
  }


  /**
 * Set Plan info tab focus
 * @param liNameId 
 * @param tabName 
 */
  onSetPlanInfoTabFocus(liNameId, tabName) {
    $("#li-" + liNameId).removeClass('active');
    $("#" + liNameId).removeClass('active');
    $("#li-" + tabName).addClass("active");
    $("#" + tabName).addClass("in active");

  }

  clickbackTab(liNameId, tabName) {
    $("#li-" + liNameId).removeClass('active');
    $("#" + liNameId).removeClass('active');
    $("#li-" + tabName).addClass("active");
    $("#" + tabName).addClass("in active");

  }
  onChangeTab(x) {
  }
  /* Get Auth Checks for Amendment */
  getAuthCheck(dataChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.dataArray = [{
        "viewAmendment": 'T'
      }]
    } else {
      for (var i = 0; i < dataChecks.length; i++) {
        authCheck[dataChecks[i].actionObjectDataTag] = dataChecks[i].actionAccess
      }
      this.dataArray = [{
        "viewAmendment": authCheck['AMD401']
      }]
    }
    return this.dataArray
  }
}
