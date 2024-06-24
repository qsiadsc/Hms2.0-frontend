import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { PlanApi } from '../plan-api';
import { Router, ActivatedRoute, Params, RouteReuseStrategy } from '@angular/router';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { ToastrService } from 'ngx-toastr';
import { QueryList, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DropdownSettings } from 'angular2-multiselect-dropdown/multiselect.interface';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { FeeGuideApi } from "../../../fee-guide-module/fee-guide-api";
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';

@Component({
  selector: 'app-plan-frequencies',
  templateUrl: './plan-frequencies.component.html',
  styleUrls: ['./plan-frequencies.component.css'],
  providers: [DatatableService, ChangeDateFormatService, HmsDataServiceService, ExDialog, ToastrService]
})
export class PlanFrequenciesComponent implements OnInit {
  covKey: any;
  disciplineKey: any;
  plansKey: any;
  FormGroup: FormGroup;
  selectedItem;
  selectedItems: any;
  PlanFrequenciesFormGroup: FormGroup; //Intitialize form 
  addDentalServiceForm: FormGroup;
  addProcedureServiceForm: FormGroup;
  addRuleServiceForm: FormGroup;
  serviceCoveredJson = [];
  coverageProcedureJson = [];
  coverageRulesJson = [];
  dentalRule = [];
  rulesList = false;
  dropdownSettings: any = {};
  benefits = [];
  rulesDropDown = []
  rulesObjArray: any = [];
  rulesObj: any = {};
  showLoader: boolean = false;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  addMode: boolean;
  addModePro: boolean;
  error: { isError: boolean; errorMessage: string; };
  public dentalParentServiceDataRemote: RemoteData;
  public ProcedureParentServiceDataRemote: RemoteData;
  public RulesParentServiceDataRemote: RemoteData;
  public planInfo = [];
  ServiceId: any;
  editRowruleKey: any;
  serviceKey: any;
  shortDesc: any;
  selectedCovCatValue: any;
  editMode: boolean;
  editModePro: boolean;
  covcatDesc: any;
  covServAssgnKey: string;
  coverageCategory:any;
  parentKey:any;
  public coverageCategoryDataRemote: RemoteData;
  parentServiceId: any;
  feedGuideDetailSection:any;
  procedureKey: any;
  procCovKey: string;
  cd: any;
  checkBenefitCat: boolean = false
  editRowruleDesc: any;
  deletedItemsExist: boolean = false
  addModeRule: boolean;
  coverageCatName: any;
  editModeRule: boolean;
  // #1277 Below 3 booleans Added to use in condition for default collapse in frequencies
  dentalPlanCoverageSection: boolean = false
  servicesCoveredSection:boolean = false
  coverageProceduresSection:boolean = false
  rows = []
  dentRuleKey: any;
  arr = new Array();
  keys: string[];
  covRuleAssgnKey: any;
  coverageRulesSection: boolean =false;
  @Output() rulesData = new EventEmitter();
  @ViewChild('dismissModel') private closeModal: ElementRef;
  @ViewChild('dismissModelProcedure') private closeModalPro: ElementRef;
  @ViewChild('dismissModelRule') private closeModalRule: ElementRef;
  procAddCovAsignkey: any = '';
  expired: boolean;
  ProcCovServAssgnKey: any;
  coKeyUrlId: any;
  divisionKeyId :any;
  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private ToastrService: ToastrService,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    private completerService: CompleterService,
  ) {
    this.route.queryParams.subscribe((params: Params) => {
      this.covKey = params.covKey;
      this.disciplineKey = params.disciplineKey;
      this.plansKey = params.plansKey;
      this.coKeyUrlId =params.coKey;  // Plan in breadrum is not clickable on “VIEW - Plan Frequencies” page (point no -110)
      this.divisionKeyId = params.divisionKeyId;
    });

    this.ProcedureParentServiceDataRemote = completerService.remote(
      null,
      "key,cd",
      "cd"
    );
    this.RulesParentServiceDataRemote = completerService.remote(
      null,
      "ruleKey,ruleDesc",
      "ruleDesc"

    );
    this.dentalParentServiceDataRemote = completerService.remote(
      null,
      "dentalServiceDesc,dentalServiceId",
      "mergedDescription"
    );
    this.dentalParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.ProcedureParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.RulesParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dentalParentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getDentalPredectiveParentService + `/${term}`;
    });
    this.ProcedureParentServiceDataRemote.urlFormater((term: any) => {
      return PlanApi.getPredictiveProcIdUrl + `/D` + `/${term}`
    });
    this.RulesParentServiceDataRemote.urlFormater((term: any) => {
      return PlanApi.getPredictiveRulesUrl + `/D` + `/${term}`
    });
    this.RulesParentServiceDataRemote.dataField('result');
    this.ProcedureParentServiceDataRemote.dataField('result');
    this.dentalParentServiceDataRemote.dataField('result');
  }

  ngOnInit() {
    this.PlanFrequenciesFormGroup = new FormGroup({
      'plan_num': new FormControl(''),
      'division_num': new FormControl(''),
      'division_description': new FormControl(''),
      'category': new FormControl(''),
    });
    this.getFrequencies();
    this.getRulesByBenefit();
    this.addDentalServiceForm = new FormGroup({
      'coverageCategory': new FormControl({ value: '', disabled: true }, Validators.required),
      'parentServiceId': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl(''),
      'excludedInd': new FormControl(''),
    })
    this.addProcedureServiceForm = new FormGroup({
      'parentKey': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'approvalInd': new FormControl(''),
      'reviewInd': new FormControl(''),
      'facilityInd': new FormControl(''),
      'assistPermitInd': new FormControl(''),
      'referalInd': new FormControl(''),
      "excludeInd": new FormControl(''),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl(''),

    })
    this.addRuleServiceForm = new FormGroup({
      'rulesService': new FormControl(''),
      'effectiveOn': new FormControl('', [Validators.required]),
      'effectiveBy': new FormControl(''),
      'expiredOn': new FormControl(''),
      'expiredBy': new FormControl(''),
    })
  }

  getFrequencies() {
    // #1277 Below code added for default collapse in frequencies
    this.dentalPlanCoverageSection = false;
    this.servicesCoveredSection = false;
    this.coverageProceduresSection = false;
    this.showLoader = true;
    var URL = PlanApi.getPlanFrequenciesUrl;
    let submitData = {
      "covKey": this.covKey,
      "disciplineKey": this.disciplineKey,
      "plansKey": this.plansKey
    }
    this.hmsDataServiceService.postApi(URL, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showLoader = false;
        this.PlanFrequenciesFormGroup.patchValue({
          'plan_num': data.result.planCoverageJson.plansId,
          'division_num': data.result.planCoverageJson.divisionId,
          'division_description': data.result.planCoverageJson.plansName,
          'category': data.result.planCoverageJson.covCatDesc
        });
        this.covcatDesc = data.result.planCoverageJson.covCatDesc;

        this.addDentalServiceForm.patchValue({
          'coverageCategory': data.result.planCoverageJson.covCatDesc
        });

      


        /**Service Covered*/

        if (data.result.serviceCoveredJson.length > 0) {
          this.serviceCoveredJson = data.result.serviceCoveredJson;
        } else {
          this.serviceCoveredJson = [];
        }
        /**Coverage Procedure*/
        if (data.result.coverageProcedureJson.length > 0) {
          this.coverageProcedureJson = data.result.coverageProcedureJson;
        } else {
          this.coverageProcedureJson = [];
        }
        /**Coverage Rules*/
        if (data.result.coverageRulesJson.dentalRule.length > 0) {
          this.dentalRule = data.result.coverageRulesJson.dentalRule;
        } else {
          this.dentalRule = [];
        }
         // Collapsing Coverage Rule   Section for issue no. #510
         if(data.result.coverageRulesJson){
          if(data.result.coverageRulesJson.hasOwnProperty("ruleDesc")){
            if(data.result.coverageRulesJson.ruleDesc != "" && data.result.coverageRulesJson.ruleDesc != null){
              this.coverageRulesSection = true;
            }
          }else{
            this.coverageRulesSection = false;
          }
          if(data.result.coverageRulesJson.hasOwnProperty("effectiveOn")){
            if(data.result.coverageRulesJson.effectiveOn != "" && data.result.coverageRulesJson.effectiveOn != null){
              this.coverageRulesSection = true;
            }
          }else{
            this.coverageRulesSection = false;
          }
          if(data.result.coverageRulesJson.hasOwnProperty("expiredOn")){
            if(data.result.coverageRulesJson.expiredOn != "" && data.result.coverageRulesJson.expiredOn != null){
              this.coverageRulesSection = true;
            }
          }else{
            this.coverageRulesSection = false;
          }
         
        }
        
        /** End Collapse Checks */

      }
    })
  }
  deleteindividual(covServAssgnKey) {
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete')).subscribe((value) => {
      if (value) {
        this.showLoader = true;
        let url = PlanApi.deleteServiceCovered;
        let submitData = {
          "covServAssgnKey": covServAssgnKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.ToastrService.success(this.translate.instant('serviceCovered.deleted'));
            this.getFrequencies();
            this.showLoader = false;
          }
         else if (data.code == 400 && data.status === "BAD_REQUEST") {
          this.ToastrService.error(this.translate.instant('serviceCovered.ServiceAssignerror'))
   
            this.showLoader = false;
          }
          else {
            this.showLoader = false;
            this.ToastrService.error(this.translate.instant('serviceCovered.error'))
          }
        }, (e) => {
          this.showLoader = false;
          this.ToastrService.error(this.translate.instant('serviceCovered.error'))
        }
        )
      }
    })
  }
  deleteindividualProcedure(procCovKey) {

    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete')).subscribe((value) => {
      if (value) {

        this.showLoader = true;
        let url = PlanApi.deleteProcedureService;
        let submitData = {
          "procCovKey": procCovKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.ToastrService.success(this.translate.instant('ProcedureServiceCovered.deleted'));
            this.getFrequencies();
            this.showLoader = false;
          }
          else {
            this.showLoader = false;
            this.ToastrService.error(this.translate.instant('ProcedureServiceCovered.error'))
          }
        }, (e) => {
          this.showLoader = false;
          this.ToastrService.error(this.translate.instant('ProcedureServiceCovered.error'))
        }
        )
      }
    })
  }
  deleteindividualRule(covRuleAssgnKey) {

    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete')).subscribe((value) => {
      if (value) {

        this.showLoader = true;
        let url = PlanApi.deleteRuleService;
        let submitData = {
          "covRuleAssgnKey": covRuleAssgnKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.ToastrService.success(this.translate.instant('RuleserviceCovered.deleted'));
            this.getFrequencies();
            this.showLoader = false;
          }
          else {
            this.showLoader = false;
            this.ToastrService.error(this.translate.instant('RuleServiceCovered.error'))
          }
        }, (e) => {
          this.showLoader = false;
          this.ToastrService.error(this.translate.instant('RuleServiceCovered.error'))
        }
        )
      }
    })
  }

  // Method for validate the Form fields
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

  submitDentalServiceForm(addDentalServiceForm, type) {
    if (!this.addDentalServiceForm.valid) {
      this.validateAllFormFields(this.addDentalServiceForm)
      return
    }
    let excludeInd = 'F';
    let covServAssgnKey = '';

    if (this.addDentalServiceForm.value.excludedInd) {
      excludeInd = "T"
    }
    if (type == 'update') {
      covServAssgnKey = this.covServAssgnKey
    }
    let serviceData = {
      "covServAssgnKey": covServAssgnKey,// Should be NULL in case of ADD
      "covKey": this.covKey,
      "serviceId": this.ServiceId,
      "serviceKey": this.serviceKey,
      "excludeInd": excludeInd,
      "serviceDesc": this.shortDesc,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalServiceForm.value.effectiveOn)||'',
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addDentalServiceForm.value.expiredOn)||''
    }
    let URL = PlanApi.addServiceCov;
    this.showLoader = true;
    this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (this.addMode) {
          this.ToastrService.success(this.translate.instant('serviceCovered.added'));
          this.closeModal.nativeElement.click();
          this.showLoader = false;
          this.getFrequencies();
        } else {
          this.ToastrService.success(this.translate.instant('serviceCovered.updated'));
          this.closeModal.nativeElement.click();
          this.showLoader = false;
          this.getFrequencies();
        }

      }
      else {
        this.ToastrService.error(this.translate.instant('serviceCovered.error'));
        this.showLoader = false;
      }

    }, (e) => {
      this.showLoader = false;
      console.log(e)
    })
  }

  submitRuleServiceForm(addRuleServiceForm, type) {
    if (!this.addRuleServiceForm.valid) {
      this.validateAllFormFields(this.addRuleServiceForm)
      return
    }
    let serviceData = {
      "covRuleAssgnKey": this.covRuleAssgnKey,
      "covKey": this.covKey,
      "dentRuleKey": this.dentRuleKey,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addRuleServiceForm.value.effectiveOn),
      "effectiveBy": null,
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addRuleServiceForm.value.expiredOn)||'',
      "expiredBy": null
    }
    let URL = PlanApi.addRule;
    this.showLoader = true;
    this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (this.addModeRule) {
          this.ToastrService.success(this.translate.instant('RuleserviceCovered.added'));
          this.closeModalRule.nativeElement.click();
          this.showLoader = false;
          this.getFrequencies();
        } else {
          this.ToastrService.success(this.translate.instant('RuleserviceCovered.updated'));
          this.closeModalRule.nativeElement.click();
          this.showLoader = false;
          this.getFrequencies();
        }
      }
      else {
        this.ToastrService.error(this.translate.instant('RuleserviceCovered.error'));
        this.showLoader = false;
     
      }

    }, (e) => {
      this.showLoader = false;
    })
  }
//Issue_NO 510 Abhishek
  submitProcedureServiceForm(addProcedureServiceForm, type) {
    if (!this.addProcedureServiceForm.valid) {
      this.validateAllFormFields(this.addProcedureServiceForm)
      return
    }
    let procCovKey = '';
    let approvalInd = 'F';
    let reviewInd = 'F';
    let facilityInd = 'F';
    let assistPermitInd = 'F';
    let referalInd = 'F';
    let excludeInd = 'F';
    if (this.addProcedureServiceForm.value.approvalInd) {
      approvalInd = "T"
    }
    if (this.addProcedureServiceForm.value.reviewInd) {
      reviewInd = "T"
    }
    if (this.addProcedureServiceForm.value.facilityInd) {
      facilityInd ="T"
    }
    if (this.addProcedureServiceForm.value.assistPermitInd) {
      assistPermitInd = "T"
    }
    if (this.addProcedureServiceForm.value.referalInd) {
      referalInd = "T"
    }
    if (this.addProcedureServiceForm.value.excludeInd) {
      excludeInd = "T"
    }
    if (type == 'update') {
      procCovKey = this.procCovKey
    }
    let serviceData = {
      "procCovKey": procCovKey, // Should be NULL in case of ADD
      "procedureKey": this.procedureKey,
      "covServAssgnKey": this.procAddCovAsignkey,
      "approvalInd": approvalInd,
      "reviewInd": reviewInd,
      "facilityInd": facilityInd,
      "assistPermitInd": assistPermitInd,
      "referalInd": referalInd,
      "excludeInd": excludeInd,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addProcedureServiceForm.value.effectiveOn)||"",
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addProcedureServiceForm.value.expiredOn)||"",
    }
    let URL = PlanApi.addProcedure;
    this.showLoader = true;
    this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (this.addModePro) {
          this.ToastrService.success(this.translate.instant('ProcedureServiceCovered.added'));
          this.closeModalPro.nativeElement.click();
          this.showLoader = false;
          this.procAddCovAsignkey = ''
          this.getFrequencies();
        } else {
          this.ToastrService.success(this.translate.instant('ProcedureServiceCovered.updated'));
          this.closeModalPro.nativeElement.click();
          this.showLoader = false;
          this.procAddCovAsignkey = ''
          this.getFrequencies();
        }
      }
      else {
        this.ToastrService.error(this.translate.instant('ProcedureServiceCovered.error'));
        this.showLoader = false;
      
      }

    }, (e) => {
      this.showLoader = false;
    })
  }

  enableAddMode() {
    this.addMode = true;
    this.editMode = false;
    this.addDentalServiceForm.reset();
    this.addDentalServiceForm.patchValue({
      'coverageCategory': this.covcatDesc
    });
  }
  enableAddModeProcedure(assingKey) {
    this.procAddCovAsignkey = assingKey
    this.addModePro = true;
    this.editModePro = false;
    this.addProcedureServiceForm.reset();

  }
  enableAddModeRule() {
    this.addModeRule = true;
    this.editModeRule = false;
    this.addRuleServiceForm.reset();
  
  }
  enableEditModeProcedure(y) {
    this.addModePro = false;
    this.editModePro = true;
    let excludeInd = false;
    let approvalInd = false;
    let reviewInd = false;
    let facilityInd = false;
    let assistPermitInd = false;
    let referalInd = false;
    this.procCovKey = y.procCovKey;
    this.procAddCovAsignkey = y.covServAssgnKey;
    this.procedureKey = y.procedureKey
    if (y.excludeInd == "T") {
      excludeInd = true;
    }
    if (y.approvalInd == "T") {
      approvalInd = true;
    }
    if (y.reviewInd == "T") {
      reviewInd = true;
    }
    if (y.facilityInd == "T") {
      facilityInd = true;
    }
    if (y.assistPermitInd == "T") {
      assistPermitInd = true;
    }
    if (y.referalInd == "T") {
      referalInd = true;
    }
    this.addProcedureServiceForm.patchValue({
      parentKey: y.procId,// Earlier used procedureKey but as per client comment now changed to procId
      effectiveOn: this.changeDateFormatService.convertStringDateToObject(y.effectiveOn),
      expiredOn: this.changeDateFormatService.convertStringDateToObject(y.expiredOn),
      excludeInd: excludeInd,
      approvalInd: approvalInd,
      reviewInd: reviewInd,
      facilityInd: facilityInd,
      assistPermitInd: assistPermitInd,
      referalInd: referalInd
    });
  }

  focusNextElePro(event, id) {
    $('#' + id).focus();
  }

  enableEditModeRule(x) {
    this.addModeRule = false;
    this.editRowruleKey = x.ruleKey
    this.editRowruleDesc = x.ruleDesc
    this.editModeRule = true;
    this.covRuleAssgnKey = x.covRuleAssgnKey;
    this.dentRuleKey=x.dentRuleKey;
    this.addRuleServiceForm.patchValue({
      rulesService: x.ruleDesc,
      effectiveOn: this.changeDateFormatService.convertStringDateToObject(x.effectiveOn),
      expiredOn: this.changeDateFormatService.convertStringDateToObject(x.expiredOn),
    });
    this.addRuleServiceForm.controls['rulesService'].disable();
  }

  focusNextEleRule(event, id) {
    $('#' + id).focus();
  }

  enableEditMode(e) {
    this.addMode = false;
    this.editMode = true;
    let excludeInd = false;
    this.serviceKey = e.serviceKey;
    this.covServAssgnKey = e.covServAssgnKey;
    if (e.excludeInd == "T") {
      excludeInd = true;
    }
    this.addDentalServiceForm.patchValue({
      parentServiceId: e.serviceId,
      effectiveOn: this.changeDateFormatService.convertStringDateToObject(e.effectiveOn),
      expiredOn: this.changeDateFormatService.convertStringDateToObject(e.expiredOn),
      excludedInd: excludeInd
    });
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }


  // Methos for Upper Form Datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;

      if (formName == 'addDentalServiceForm') {
        this.addDentalServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addProcedureServiceForm') {
        this.addProcedureServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addRuleServiceForm') {
        this.addProcedureServiceForm.patchValue(datePickerValue);
      }
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

      if (formName == 'addDentalServiceForm') {
        this.addDentalServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addProcedureServiceForm') {
        this.addProcedureServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addRuleServiceForm') {
        this.addRuleServiceForm.patchValue(datePickerValue);
      }

      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);

    }
    if (this.addDentalServiceForm.value.effectiveOn && this.addDentalServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addDentalServiceForm.value.effectiveOn.date, this.addDentalServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {

        this.addDentalServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    if (this.addProcedureServiceForm.value.effectiveOn && this.addProcedureServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addProcedureServiceForm.value.effectiveOn.date, this.addProcedureServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addProcedureServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }

    if (this.addRuleServiceForm.value.effectiveOn && this.addRuleServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addRuleServiceForm.value.effectiveOn.date, this.addRuleServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addRuleServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }

    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }


  getRulesByBenefit() {
    this.rulesDropDown = []
    var getDentalRule = PlanApi.getDentalRules;
    this.hmsDataServiceService.getApi(getDentalRule).subscribe(data => {
      if (data) {
        if (data.code == 200) {
          this.rulesDropDown = []
          for (var i = 0; i < data.result.length; i++) {
            this.rulesDropDown.push({ 'itemName': data.result[i].ruleDesc });
            this.rulesList = true;
            this.arr[data.result[i].ruleKey] = data.result[i].ruleDesc;
          }
          this.showLoader = false;
        } else {
          this.rulesDropDown = [];
          this.rulesList = false;
          this.showLoader = false;
        }
      } else {
        this.rulesDropDown = [];
        this.rulesList = false;
        this.showLoader = false;
      }

    });
  }

  // Method of angular2-multiselect Dropdown for Select the values  
  onSelect(selected: CompleterItem, type) {
    if (selected && type == 'parentServiceId') {
      this.ServiceId = selected.originalObject.dentalServiceId;
      this.serviceKey = selected.originalObject.dentalServiceKey;
      this.shortDesc = selected.originalObject.dentalServiceDesc;
    }

  }
  // Method of angular2-multiselect Dropdown for Select the values  
  onSelectPro(selected: CompleterItem, type) {
    if (selected && type == 'parentKey') {
      this.procedureKey = selected.originalObject.key;
    
    }

  }
  // Method of angular2-multiselect Dropdown for Select the values  
  onSelectRule(selected: CompleterItem, type) {
    if (selected && type == 'rulesService') {
      this.dentRuleKey = selected.originalObject.ruleKey;
    }

  }
  /** Function For Jump to Previous Page */
  goBack() {
    this.location.back();
    // Plan in breadrum is not clickable on “VIEW - Plan Frequencies” page (point no -110)
    this.router.navigate(['/company/plan/view/'], { queryParams: { 'companyId': this.coKeyUrlId, 'planId': this.plansKey, 'divisonId': this.divisionKeyId } });  
  }

}
