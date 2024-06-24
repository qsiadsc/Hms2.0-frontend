import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ExDialog } from '../../../common-module/shared-component/ngx-dialog/dialog.module';
import { ToastrService } from 'ngx-toastr';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { TranslateService } from '@ngx-translate/core';
import { CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlanApi } from '../plan-api';
import { FeeGuideApi } from '../../../fee-guide-module/fee-guide-api';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { Location } from '@angular/common';

@Component({
  selector: 'app-health-plan-coverage',
  templateUrl: './health-plan-coverage.component.html',
  styleUrls: ['./health-plan-coverage.component.css'],
  providers: [ChangeDateFormatService]
})
export class HealthPlanCoverageComponent implements OnInit {

  covKey;
  disciplineKey;
  plansKey;
  showLoader: boolean = false
  healthPlanCoverageFormGroup: FormGroup
  serviceCoveredJson = [];
  coverageProcedureJson = [];
  healthRule = [];
  covcatDesc: any;
  coverageRulesSection: boolean = false;
  addHealthServiceForm: FormGroup
  buttonTextRule: string;
  buttonTextProc: string;
  buttonText: string;
  addHealthProcedureServiceForm: FormGroup
  addHealthRuleServiceForm: FormGroup
  addMode: boolean = false
  editMode: boolean = false
  // #1277 Below 3 booleans Added to use in condition for default collapse in frequencies
  healthPlanCoverageSection:boolean = false;
  healthServicesCoveredSection:boolean = false;
  healthCoverageRulesSection:boolean = false;
  serviceId: any
  serviceKey: any
  shortDesc: any
  covServAssgnKey;
  @ViewChild('dismissModel') private closeModal: ElementRef;
  @ViewChild('dismissModelProcedure') private closeModalProc: ElementRef
  @ViewChild('dismissModelRule') private closeModalRule: ElementRef
  expired: boolean = false
  error: any
  addModeProc: boolean = false
  editModeProc: boolean = false
  procAddCovAsignkey: any = '';
  procedureKey: any;
  procCovKey: any;
  addModeRule: boolean = false
  editModeRule: boolean = false
  covRuleAssgnKey: any;
  hlthRuleKey: any;
  ruleSection: boolean = false
  public healthParentServiceDataRemote: RemoteData
  public ProcedureParentServiceDataRemote: RemoteData;
  public RulesParentServiceDataRemote: RemoteData;
  public coverageCategoryDataRemote: RemoteData;
  coverageCategory;
  parentServiceId;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  parentKey;
  rulesService;

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

    this.error = { error: false, errorMessage: '' }

    /* Get the Detail for Health Parent Service Id */
    this.healthParentServiceDataRemote = completerService.remote(
      null,
      "healthParentServiceDesc,healthServiceId",
      "mergedDescription"
    );
    this.healthParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.healthParentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getHealthParentServiceList + `/${term}`;
    });
    this.healthParentServiceDataRemote.dataField('result');

    this.ProcedureParentServiceDataRemote = completerService.remote(
      null,
      "key,cd",
      "cd"
    );
    this.ProcedureParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.ProcedureParentServiceDataRemote.urlFormater((term: any) => {
      return PlanApi.getPredictiveProcIdUrl + `/H` + `/${term}`;
    });
    this.ProcedureParentServiceDataRemote.dataField('result');

    this.RulesParentServiceDataRemote = completerService.remote(
      null,
      "ruleKey,ruleDesc",
      "ruleDesc"
    );
    this.RulesParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.RulesParentServiceDataRemote.urlFormater((term: any) => {
      return PlanApi.getPredictiveRulesUrl + `/H` + `/${term}`
    });
    this.RulesParentServiceDataRemote.dataField('result');

  }

  ngOnInit() {

    this.healthPlanCoverageFormGroup = new FormGroup({
      'planNumber': new FormControl(''),
      'divisionNumber': new FormControl(''),
      'divisionDescription': new FormControl(''),
      'category': new FormControl(''),
    });
    this.addHealthServiceForm = new FormGroup({
      'coverageCategory': new FormControl({ value: '', disabled: true }, Validators.required),
      'parentServiceId': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(80)]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'expiredOn': new FormControl(''),
      'excludedInd': new FormControl(''),
    })

    this.addHealthProcedureServiceForm = new FormGroup({
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

    this.addHealthRuleServiceForm = new FormGroup({
      'rulesService': new FormControl('', [Validators.required]),
      'effectiveOn': new FormControl('', [Validators.required]),
      'effectiveBy': new FormControl(''),
      'expiredOn': new FormControl(''),
      'expiredBy': new FormControl(''),
    })

    this.buttonText = "Save"
    this.buttonTextProc = "Save"
    this.buttonTextRule = "Save"
    this.getHealthPlanCoverage()
  }

  getHealthPlanCoverage() {
    // #1277 Below code added for default collapse in frequencies
    this.healthPlanCoverageSection = false;
    this.healthServicesCoveredSection = false;
    this.healthCoverageRulesSection = false;
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
        this.healthPlanCoverageFormGroup.patchValue({
          'planNumber': data.result.planCoverageJson.plansId,
          'divisionNumber': data.result.planCoverageJson.divisionId,
          'divisionDescription': data.result.planCoverageJson.plansName,
          'category': data.result.planCoverageJson.covCatDesc
        });
        this.covcatDesc = data.result.planCoverageJson.covCatDesc;

        this.addHealthServiceForm.patchValue({
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
        if (data.result.coverageRulesJson.healthRule.length > 0) {
          this.healthRule = data.result.coverageRulesJson.healthRule;
        } else {
          this.healthRule = [];
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
      } else if (data.code == 404 && data.status == "NOT_FOUND") {
        this.showLoader = false
        this.toastr.error("Result Not Found!!")
      }
    })
  }

  enableAddMode() {
    this.addMode = true;
    this.editMode = false;
    this.buttonText = "Save"
    this.addHealthServiceForm.reset()
    this.addHealthServiceForm.patchValue({
      'coverageCategory': this.covcatDesc
    });
  }

  onSelect(selected: CompleterItem, type) {
    if (selected && type == 'parentServiceId') {
      this.serviceId = selected.originalObject.healthServiceId;
      this.serviceKey = selected.originalObject.healthServiceKey;
      this.shortDesc = selected.originalObject.healthParentServiceDesc;
    }
  }

  focusNextEle(event, id) {
    $('#' + id).focus();
  }

  submitHealthServiceForm(addHealthServiceForm, type) {
   
    let excludeInd = 'F';
    let covServAssgnKey = '';

    if (this.addHealthServiceForm.value.excludedInd) {
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
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addHealthServiceForm.value.effectiveOn) || '',
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addHealthServiceForm.value.expiredOn) || ''
    }
    if (this.addHealthServiceForm.valid) {
      let URL = PlanApi.addUpdateHlthFreqServCovUrl;
      this.showLoader = true;
      this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addMode) {
            this.toastr.success(this.translate.instant('serviceCovered.added'));
            this.closeModal.nativeElement.click();
            this.showLoader = false;
            this.getHealthPlanCoverage();
          } else {
            this.toastr.success(this.translate.instant('serviceCovered.updated'));
            this.closeModal.nativeElement.click();
            this.showLoader = false;
            this.getHealthPlanCoverage();
          }
        }
        else {
          this.toastr.error(this.translate.instant('serviceCovered.error'));
          this.showLoader = false;
        }

      }, (e) => {
        this.showLoader = false;
      })
    } else {
      this.validateAllFormFields(this.addHealthServiceForm)
    }
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
    this.addHealthServiceForm.patchValue({
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

      if (formName == 'addHealthServiceForm') {
        this.addHealthServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addHealthProcedureServiceForm') {
        this.addHealthProcedureServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addHealthRuleServiceForm') {
        this.addHealthRuleServiceForm.patchValue(datePickerValue);
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

      if (formName == 'addHealthServiceForm') {
        this.addHealthServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addHealthProcedureServiceForm') {
        this.addHealthProcedureServiceForm.patchValue(datePickerValue);
      }
      if (formName == 'addHealthRuleServiceForm') {
        this.addHealthRuleServiceForm.patchValue(datePickerValue);
      }

      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);

    }
    if (this.addHealthServiceForm.value.effectiveOn && this.addHealthServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addHealthServiceForm.value.effectiveOn.date, this.addHealthServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {

        this.addHealthServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    if (this.addHealthProcedureServiceForm.value.effectiveOn && this.addHealthProcedureServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addHealthProcedureServiceForm.value.effectiveOn.date, this.addHealthProcedureServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addHealthProcedureServiceForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }

    if (this.addHealthRuleServiceForm.value.effectiveOn && this.addHealthRuleServiceForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addHealthRuleServiceForm.value.effectiveOn.date, this.addHealthRuleServiceForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addHealthRuleServiceForm.controls['expiredOn'].setErrors({
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
    this.addHealthProcedureServiceForm.reset();
  }

  focusNextEleProc(event, id) {
    $('#' + id).focus();
  }

  onSelectPro(selected: CompleterItem, type) {
    if (selected && type == 'parentKey') {
      this.procedureKey = selected.originalObject.key;
    }
  }

  submitProcedureServiceForm(addHealthProcedureServiceForm) {
    let procCovKey = '';
    let approvalInd = 'F';
    let reviewInd = 'F';
    let facilityInd = 'F';
    let assistPermitInd = 'F';
    let referalInd = 'F';
    let excludeInd = 'F';
    if (this.addHealthProcedureServiceForm.value.approvalInd) {
      approvalInd = "T"
    }
    if (this.addHealthProcedureServiceForm.value.reviewInd) {
      reviewInd = "T"
    }
    if (this.addHealthProcedureServiceForm.value.facilityInd) {
      facilityInd = "T"
    }
    if (this.addHealthProcedureServiceForm.value.assistPermitInd) {
      assistPermitInd = "T"
    }
    if (this.addHealthProcedureServiceForm.value.referalInd) {
      referalInd = "T"
    }
    if (this.addHealthProcedureServiceForm.value.excludeInd) {
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
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addHealthProcedureServiceForm.value.effectiveOn) || "",
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addHealthProcedureServiceForm.value.expiredOn) || "",
    }
    if (addHealthProcedureServiceForm.valid) {
      let URL = PlanApi.addUpdateHlthFreqCovProcUrl;
      this.showLoader = true;
      this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addModeProc) {
            this.toastr.success(this.translate.instant('ProcedureServiceCovered.added'));
            this.closeModalProc.nativeElement.click();
            this.showLoader = false;
            this.procAddCovAsignkey = ''
            this.getHealthPlanCoverage();
          } else {
            this.toastr.success(this.translate.instant('ProcedureServiceCovered.updated'));
            this.closeModalProc.nativeElement.click();
            this.showLoader = false;
            this.procAddCovAsignkey = ''
            this.getHealthPlanCoverage();
          }
        }
        else {
          this.toastr.error(this.translate.instant('ProcedureServiceCovered.error'));
          this.showLoader = false;
        }
      }, (e) => {
        this.showLoader = false;
      })
    } else {
      this.validateAllFormFields(this.addHealthProcedureServiceForm)
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
    this.addHealthProcedureServiceForm.patchValue({
      parentKey: data.procId, // Earlier used procedureKey but now as per client comment it changed to procId
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
    this.addHealthRuleServiceForm.reset();
  }

  focusNextEleRule(event, id) {
    $('#' + id).focus();
  }

  submitRuleServiceForm(addHealthRuleServiceForm) {
    let serviceData = {
      "covRuleAssgnKey": this.covRuleAssgnKey,
      "covKey": this.covKey,
      "visRuleKey": this.hlthRuleKey,
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.addHealthRuleServiceForm.value.effectiveOn),
      "effectiveBy": null,
      "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.addHealthRuleServiceForm.value.expiredOn) || '',
      "expiredBy": null
    }
    if (this.addHealthRuleServiceForm.valid) {
      let URL = PlanApi.addUpdateHlthFreqCovRuleUrl;
      this.showLoader = true;
      this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (this.addModeRule) {
            this.toastr.success(this.translate.instant('RuleserviceCovered.added'));
            this.closeModalRule.nativeElement.click();
            this.showLoader = false;
            this.getHealthPlanCoverage();
          } else {
            this.toastr.success(this.translate.instant('RuleserviceCovered.updated'));
            this.closeModalRule.nativeElement.click();
            this.showLoader = false;
            this.getHealthPlanCoverage();
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
      this.validateAllFormFields(this.addHealthRuleServiceForm)
    }
  }

  onSelectRule(selected: CompleterItem, type) {
    if (selected && type == 'rulesService') {
      this.hlthRuleKey = selected.originalObject.ruleKey;
    }
  }

  enableEditModeRule(data) {
    this.addModeRule = false;
    this.editModeRule = true;
    this.buttonTextRule = "Update"
    this.covRuleAssgnKey = data.covRuleAssgnKey;
    this.hlthRuleKey = data.hlthRuleKey;
    this.addHealthRuleServiceForm.patchValue({
      rulesService: data.ruleDesc,
      effectiveOn: this.changeDateFormatService.convertStringDateToObject(data.effectiveOn),
      expiredOn: this.changeDateFormatService.convertStringDateToObject(data.expiredOn),
    });
    this.addHealthRuleServiceForm.controls['rulesService'].disable();
  }

  deleteService(covServAssgnKey) {
    this.exDialog.openConfirm(this.translate.instant('card.exDialog.delete')).subscribe((value) => {
      if (value) {
        this.showLoader = true;
        let url = PlanApi.deleteHlthFreqServCovUrl;
        let submitData = {
          "covServAssgnKey": covServAssgnKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.toastr.success(this.translate.instant('serviceCovered.deleted'));
            this.getHealthPlanCoverage();
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
        let url = PlanApi.deleteHlthFreqCovProcUrl;
        let submitData = {
          "procCovKey": procCovKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastr.success(this.translate.instant('ProcedureServiceCovered.deleted'));
            this.getHealthPlanCoverage();
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
        let url = PlanApi.deleteHlthFreqCovRuleUrl;
        let submitData = {
          "covRuleAssgnKey": covRuleAssgnKey
        }
        this.hmsDataServiceService.postApi(url, submitData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.toastr.success(this.translate.instant('RuleServiceCovered.deleted'));
            this.getHealthPlanCoverage();
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
