import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params, RouteReuseStrategy } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlanApi } from '../plan-api';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { RemoteData, CompleterService, CompleterItem } from 'ng2-completer';
import { FeeGuideApi } from "../../../fee-guide-module/fee-guide-api";
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { flatten } from '@angular/compiler';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { Plan } from '../plan.model';
import { Location } from '@angular/common';


@Component({
  selector: 'app-vision-plan-coverage',
  templateUrl: './vision-plan-coverage.component.html',
  styleUrls: ['./vision-plan-coverage.component.css'],
  providers: [ChangeDateFormatService]
})
export class VisionPlanCoverageComponent implements OnInit {
  coverageCategory;
  parentServiceId;
  parentKey
  rulesService
  covKey;
  disciplineKey;
  plansKey;
  visionPlanCoverageFormGroup: FormGroup
  serviceCoveredJson = [];
  showLoader: boolean = false;
  covcatDesc: any;
  coverageProcedureJson = [];
  addVisionServiceForm: FormGroup
  addVisionProcedureServiceForm: FormGroup
  addVisionRuleServiceForm: FormGroup
  public coverageCategoryDataRemote: RemoteData;
  public dentalParentServiceDataRemote: RemoteData;
  public ProcedureParentServiceDataRemote: RemoteData;
  public RulesParentServiceDataRemote: RemoteData;
  addMode: boolean = false
  editMode: boolean = false
  serviceId: any
  serviceKey: any
  shortDesc: any
  covServAssgnKey;
  @ViewChild('dismissModel') private closeModal: ElementRef;
  @ViewChild('dismissModelProcedure') private closeModalProc: ElementRef
  @ViewChild('dismissModelRule') private closeModalRule: ElementRef
  buttonText: string;
  error: any
  expired: boolean = false
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  procAddCovAsignkey: any = '';
  addModeProc = false;
  editModeProc = false
  buttonTextProc: string;
  procCovKey: string;
  procedureKey: any;
  addModeRule: boolean = false
  editModeRule: boolean = false
  // #1277 Below 3 booleans Added to use in condition for default collapse in frequencies
  visionCoverageRulesSection:boolean = false;
  visionServicesCoveredSection:boolean = false;
  visionPlanCoverageSection: boolean = false;
  buttonTextRule: string;
  covRuleAssgnKey: any;
  visRuleKey: any;
  visionRule = [];
  coverageRulesSection: boolean = false;
  ruleSection: boolean = false
  public visionParentServiceDataRemote:RemoteData
  visionDesc:string = 'V'

  constructor(private route: ActivatedRoute,
    private hmsDataServiceService: HmsDataServiceService,
    private completerService: CompleterService,
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastr: ToastrService,
    private exDialog: ExDialog,
    private location: Location) {
    this.route.queryParams.subscribe((params: Params) => {
      this.covKey = params.covKey;
      this.disciplineKey = params.disciplineKey;
      this.plansKey = params.plansKey;
    });

    this.ProcedureParentServiceDataRemote = completerService.remote(
      null,
      "key,cd",
      "cd"
    );
    this.ProcedureParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.ProcedureParentServiceDataRemote.urlFormater((term: any) => {
      return PlanApi.getPredictiveProcIdUrl + `/V`+ `/${term}`;
    });
    this.ProcedureParentServiceDataRemote.dataField('result');

    this.RulesParentServiceDataRemote = completerService.remote(
      null,
      "ruleKey,ruleDesc",
      "ruleDesc"
    );
    this.RulesParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.RulesParentServiceDataRemote.urlFormater((term: any) => {
      return PlanApi.getPredictiveRulesUrl + `/V`+`/${term}`
    });
    this.RulesParentServiceDataRemote.dataField('result');

    this.error = { error: false, errorMessage: '' }

    /* Get the Detail for Vision Parent Service Id */
    this.visionParentServiceDataRemote = completerService.remote(
      null,
      "visionServiceDesc,visionServiceId",
      "mergedDescription"
    );
    this.visionParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.visionParentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getVisionParentServiceUrl + `/${term}`;
    });
    this.visionParentServiceDataRemote.dataField('result');

  }

  ngOnInit() {

    this.visionPlanCoverageFormGroup = new FormGroup({
      'planNumber': new FormControl(''),
      'divisionNumber': new FormControl(''),
      'divisionDescription': new FormControl(''),
      'category': new FormControl(''),
    });

    this.addVisionServiceForm = new FormGroup({
      'coverageCategory': new FormControl({ value: '', disabled: true }, Validators.required),
      'parentServiceId': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'effectiveOn': new FormControl(''),
      'expiredOn': new FormControl(''),
      'excludedInd': new FormControl(''),
    })

    this.addVisionProcedureServiceForm = new FormGroup({
      'parentKey': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'approvalInd': new FormControl(''),
      'reviewInd': new FormControl(''),
      'facilityInd': new FormControl(''),
      'assistPermitInd': new FormControl(''),
      'referalInd': new FormControl(''),
      "excludeInd": new FormControl(''),
      'effectiveOn': new FormControl('',[Validators.required]),
      'expiredOn': new FormControl(''),
    })

    this.addVisionRuleServiceForm = new FormGroup({
      'rulesService': new FormControl('', [Validators.required]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'effectiveBy': new FormControl(''),
      'expiredOn': new FormControl(''),
      'expiredBy': new FormControl(''),
    })

    this.getVisionPlanCoverage();
    this.buttonText = "Save"
    this.buttonTextProc = "Save"
    this.buttonTextRule = "Save"
  }

  getVisionPlanCoverage() {
    // #1277 Below code added for default collapse in frequencies
    this.visionCoverageRulesSection = false;
    this.visionServicesCoveredSection = false;
    this.visionPlanCoverageSection = false;
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
        this.visionPlanCoverageFormGroup.patchValue({
          'planNumber': data.result.planCoverageJson.plansId,
          'divisionNumber': data.result.planCoverageJson.divisionId,
          'divisionDescription': data.result.planCoverageJson.plansName,
          'category': data.result.planCoverageJson.covCatDesc
        });
        this.covcatDesc = data.result.planCoverageJson.covCatDesc;

        this.addVisionServiceForm.patchValue({
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
        if (data.result.coverageRulesJson.visionRule.length > 0) {
          this.visionRule = data.result.coverageRulesJson.visionRule;
        } else {
          this.visionRule = [];
        }

        if (data.result.coverageRulesJson) {
          if (data.result.coverageRulesJson.hasOwnProperty("ruleDesc")) {
            if (data.result.coverageRulesJson.ruleDesc != "" && data.result.coverageRulesJson.ruleDesc != null) {
              this.coverageRulesSection = true;
            }
          } else {
            this.coverageRulesSection = false;
          }
          if (data.result.coverageRulesJson.hasOwnProperty("effectiveOn")) {
            if (data.result.coverageRulesJson.effectiveOn != "" && data.result.coverageRulesJson.effectiveOn != null) {
              this.coverageRulesSection = true;
            }
          } else {
            this.coverageRulesSection = false;
          }
          if (data.result.coverageRulesJson.hasOwnProperty("expiredOn")) {
            if (data.result.coverageRulesJson.expiredOn != "" && data.result.coverageRulesJson.expiredOn != null) {
              this.coverageRulesSection = true;
            }
          } else {
            this.coverageRulesSection = false;
          }

        }
      }else if(data.code == 404 && data.status =="NOT_FOUND"){
        this.showLoader = false
        this.toastr.error("Result Not Found!!")
      }
    })
  }

  enableAddMode() {
    this.addMode = true;
    this.editMode = false;
    this.buttonText = "Save"
    this.addVisionServiceForm.reset()
    this.addVisionServiceForm.patchValue({
      'coverageCategory': this.covcatDesc
    });
  }

  onSelect(selected: CompleterItem, type) {
    if (selected && type == 'parentServiceId') {
      this.serviceId = selected.originalObject.visionServiceId;
      this.serviceKey = selected.originalObject.visionServiceKey;
      this.shortDesc = selected.originalObject.visionServiceDesc;
    }
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  submitVisionServiceForm(addVisionServiceForm, type) {
    if (!this.addVisionServiceForm.valid) {
      this.validateAllFormFields(this.addVisionServiceForm)
      return
    }
    let excludeInd = 'F';
    let covServAssgnKey = '';

    if (this.addVisionServiceForm.value.excludedInd) {
      excludeInd = "T"
    }
    
    if (this.editMode) {
      covServAssgnKey = this.covServAssgnKey
    }
    let serviceData = {
      "covServAssgnKey": covServAssgnKey,// Should be NULL in case of ADD
      "covKey": this.covKey,
      "serviceId": this.serviceId,
      "serviceKey": this.serviceKey,
      "excludeInd": excludeInd,
      "serviceDesc": this.shortDesc,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addVisionServiceForm.value.effectiveOn) || '',
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addVisionServiceForm.value.expiredOn) || ''
    }
    let URL = PlanApi.addUpdateVisFreqServCovUrl;
    this.showLoader = true;
    this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (this.addMode) {
          this.toastr.success(this.translate.instant('serviceCovered.added'));
          this.closeModal.nativeElement.click();
          this.showLoader = false;
          this.getVisionPlanCoverage();
        } else {
          this.toastr.success(this.translate.instant('serviceCovered.updated'));
          this.closeModal.nativeElement.click();
          this.showLoader = false;
          this.getVisionPlanCoverage();
        }
      }
      else {
        this.toastr.error(this.translate.instant('serviceCovered.error'));
        this.showLoader = false;
      }

    }, (e) => {
      this.showLoader = false;
    })
  }

  enableEditMode(e) {
    this.addMode = false;
    this.editMode = true;
    this.buttonText = "Update"
    let excludeInd = false;
    this.serviceKey = e.serviceKey;
    this.covServAssgnKey = e.covServAssgnKey;
    if (e.excludeInd == "T") {
      excludeInd = true;
    }
    this.addVisionServiceForm.patchValue({
      parentServiceId: e.serviceId,
      effectiveOn: this.changeDateFormatService.convertStringDateToObject(e.effectiveOn),
      expiredOn: this.changeDateFormatService.convertStringDateToObject(e.expiredOn),
      excludedInd: excludeInd
    });
  }


  // Methos for Upper Form Datepicker
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;

      if (formName == 'addVisionServiceForm') {
        this.addVisionServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addVisionProcedureServiceForm') {
        this.addVisionProcedureServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addVisionRuleServiceForm') {
        this.addVisionRuleServiceForm.patchValue(datePickerValue);
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

      if (formName == 'addVisionServiceForm') {
        this.addVisionServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addVisionProcedureServiceForm') {
        this.addVisionProcedureServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addVisionRuleServiceForm') {
        this.addVisionRuleServiceForm.patchValue(datePickerValue);
      }

      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);

    }
    if (this.addVisionServiceForm.value.effectiveOn && this.addVisionServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addVisionServiceForm.value.effectiveOn.date, this.addVisionServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {

        this.addVisionServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    if (this.addVisionProcedureServiceForm.value.effectiveOn && this.addVisionProcedureServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addVisionProcedureServiceForm.value.effectiveOn.date, this.addVisionProcedureServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addVisionProcedureServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }

    if (this.addVisionRuleServiceForm.value.effectiveOn && this.addVisionRuleServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addVisionRuleServiceForm.value.effectiveOn.date, this.addVisionRuleServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addVisionRuleServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')) {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  enableAddModeProcedure(assingKey) {
    this.procAddCovAsignkey = assingKey
    this.addModeProc = true;
    this.editModeProc = false;
    this.buttonTextProc = "Save"
    this.addVisionProcedureServiceForm.reset();
  }

  focusNextEleProc(event, id) {
    $('#' + id).focus();
  }

  onSelectPro(selected: CompleterItem, type) {
    if (selected && type == 'parentKey') {
      this.procedureKey = selected.originalObject.key;
    }
  }

  submitProcedureServiceForm(addVisionProcedureServiceForm) {
    let procCovKey = '';
    let approvalInd = 'F';
    let reviewInd = 'F';
    let facilityInd = 'F';
    let assistPermitInd = 'F';
    let referalInd = 'F';
    let excludeInd = 'F';
    if (this.addVisionProcedureServiceForm.value.approvalInd) {
      approvalInd = "T"
    }
    if (this.addVisionProcedureServiceForm.value.reviewInd) {
      reviewInd = "T"
    }
    if (this.addVisionProcedureServiceForm.value.facilityInd) {
      facilityInd = "T"
    }
    if (this.addVisionProcedureServiceForm.value.assistPermitInd) {
      assistPermitInd = "T"
    }
    if (this.addVisionProcedureServiceForm.value.referalInd) {
      referalInd = "T"
    }
    if (this.addVisionProcedureServiceForm.value.excludeInd) {
      excludeInd = "T"
    }
    if (this.editModeProc) {
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
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addVisionProcedureServiceForm.value.effectiveOn) || "",
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addVisionProcedureServiceForm.value.expiredOn) || "",
    }
    if(addVisionProcedureServiceForm.valid){
      let URL = PlanApi.addUpdateVisFreqCovProcUrl;
      this.showLoader = true;
      this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addModeProc) {
            this.toastr.success(this.translate.instant('ProcedureServiceCovered.added'));
            this.closeModalProc.nativeElement.click();
            this.showLoader = false;
            this.procAddCovAsignkey = ''
            this.getVisionPlanCoverage();
          } else {
            this.toastr.success(this.translate.instant('ProcedureServiceCovered.updated'));
            this.closeModalProc.nativeElement.click();
            this.showLoader = false;
            this.procAddCovAsignkey = ''
            this.getVisionPlanCoverage();
          }
        }
        else {
          this.toastr.error(this.translate.instant('ProcedureServiceCovered.error'));
          this.showLoader = false;
        }
      }, (e) => {
        this.showLoader = false;
      })
    }else{
      this.validateAllFormFields(this.addVisionProcedureServiceForm)
    }
  }

  enableEditModeProcedure(data) {
    this.addModeProc = false;
    this.editModeProc = true;
    this.buttonTextProc = "Update"
    let excludeInd = false;
    let approvalInd = false;
    let reviewInd = false;
    let facilityInd = false;
    let assistPermitInd = false;
    let referalInd = false;
    this.procCovKey = data.procCovKey;
    this.procAddCovAsignkey = data.covServAssgnKey;
    this.procedureKey = data.procedureKey
    if (data.excludeInd == "T") {
      excludeInd = true;
    }
    if (data.approvalInd == "T") {
      approvalInd = true;
    }
    if (data.reviewInd == "T") {
      reviewInd = true;
    }
    if (data.facilityInd == "T") {
      facilityInd = true;
    }
    if (data.assistPermitInd == "T") {
      assistPermitInd = true;
    }
    if (data.referalInd == "T") {
      referalInd = true;
    }
    this.addVisionProcedureServiceForm.patchValue({
      parentKey: data.procId,// Earlier used procedureKey,  now used procId as per client comment
      effectiveOn: this.changeDateFormatService.convertStringDateToObject(data.effectiveOn),
      expiredOn: this.changeDateFormatService.convertStringDateToObject(data.expiredOn),
      excludeInd: excludeInd,
      approvalInd: approvalInd,
      reviewInd: reviewInd,
      facilityInd: facilityInd,
      assistPermitInd: assistPermitInd,
      referalInd: referalInd
    });
  }

  enableAddModeRule() {
    this.addModeRule = true;
    this.editModeRule = false;
    this.buttonTextRule = "Save"
    this.addVisionRuleServiceForm.reset();
  }

  focusNextEleRule(event, id) {
    $('#' + id).focus();
  }

  submitRuleServiceForm(addVisionRuleServiceForm) {
    let serviceData = {
      "covRuleAssgnKey": this.covRuleAssgnKey,
      "covKey": this.covKey,
      "visRuleKey": this.visRuleKey,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addVisionRuleServiceForm.value.effectiveOn),
      "effectiveBy": null,
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addVisionRuleServiceForm.value.expiredOn) || '',
      "expiredBy": null
    }
    if (this.addVisionRuleServiceForm.valid) {
      let URL = PlanApi.addUpdateVisFreqCovRuleUrl;
      this.showLoader = true;
      this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addModeRule) {
            this.toastr.success(this.translate.instant('RuleserviceCovered.added'));
            this.closeModalRule.nativeElement.click();
            this.showLoader = false;
            this.getVisionPlanCoverage();
          } else {
            this.toastr.success(this.translate.instant('RuleserviceCovered.updated'));
            this.closeModalRule.nativeElement.click();
            this.showLoader = false;
            this.getVisionPlanCoverage();
          }
        }
        else {
          this.toastr.error(this.translate.instant('RuleserviceCovered.error'));
          this.showLoader = false;
        }
      }, (e) => {
        this.showLoader = false;
      })
    } else {
      this.validateAllFormFields(this.addVisionRuleServiceForm)
    }
  }

  onSelectRule(selected: CompleterItem, type) {
    if (selected && type == 'rulesService') {
      this.visRuleKey = selected.originalObject.ruleKey;
    }
  }

  enableEditModeRule(data) {
    this.addModeRule = false;
    this.editModeRule = true;
    this.buttonTextRule = "Update"
    this.covRuleAssgnKey = data.covRuleAssgnKey;
    this.visRuleKey = data.visRuleKey;
    this.addVisionRuleServiceForm.patchValue({
      rulesService: data.ruleDesc,
      effectiveOn: this.changeDateFormatService.convertStringDateToObject(data.effectiveOn),
      expiredOn: this.changeDateFormatService.convertStringDateToObject(data.expiredOn),
    });
    this.addVisionRuleServiceForm.controls['rulesService'].disable();
  }

  deleteService(covServAssgnKey) {
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete')).subscribe((value) => {
      if (value) {
        this.showLoader = true;
        let url = PlanApi.deleteVisFreqServCovUrl;
        let submitData = {
          "covServAssgnKey": covServAssgnKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastr.success(this.translate.instant('serviceCovered.deleted'));
            this.getVisionPlanCoverage();
            this.showLoader = false;
          }
          else if (data.code == 400 && data.status === "BAD_REQUEST") {
            this.toastr.error(this.translate.instant('serviceCovered.ServiceAssignerror'))

            this.showLoader = false;
          }
          else {
            this.showLoader = false;
            this.toastr.error(this.translate.instant('serviceCovered.error'))
          }
        }, (e) => {
          this.showLoader = false;
          this.toastr.error(this.translate.instant('serviceCovered.error'))
        }
        )
      }
    })
  }

  deleteProcedure(procCovKey) {
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete')).subscribe((value) => {
      if (value) {

        this.showLoader = true;
        let url = PlanApi.deleteVisFreqCovProcUrl;
        let submitData = {
          "procCovKey": procCovKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastr.success(this.translate.instant('ProcedureServiceCovered.deleted'));
            this.getVisionPlanCoverage();
            this.showLoader = false;
          }
          else {
            this.showLoader = false;
            this.toastr.error(this.translate.instant('ProcedureServiceCovered.error'))
          }
        }, (e) => {
          this.showLoader = false;
          this.toastr.error(this.translate.instant('ProcedureServiceCovered.error'))
        }
        )
      }
    })
  }

  deleteRule(covRuleAssgnKey) {
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete')).subscribe((value) => {
      if (value) {

        this.showLoader = true;
        let url = PlanApi.deleteVisFreqCovRuleUrl;
        let submitData = {
          "covRuleAssgnKey": covRuleAssgnKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastr.success(this.translate.instant('RuleServiceCovered.deleted'));
            this.getVisionPlanCoverage();
            this.showLoader = false;
          }
          else {
            this.showLoader = false;
            this.toastr.error(this.translate.instant('RuleServiceCovered.error'))
          }
        }, (e) => {
          this.showLoader = false;
          this.toastr.error(this.translate.instant('RuleServiceCovered.error'))
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

  goBack() {
    this.location.back();
  }

}
