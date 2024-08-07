import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { DatatableService } from './../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { PlanApi } from './plan-api';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ToastrService } from 'ngx-toastr';
//Start Importing Plan Module Child Components
import { PlanInfoComponent } from '../plan/plan-info/plan-info.component';
import { BenefitsComponent } from '../plan/benefits/benefits.component';
import { DivisionMaxComponent } from '../plan/division-max/division-max.component';
import { FeeGuideComponent } from '../plan/fee-guide/fee-guide.component';
import { PreviewComponent } from '../plan/preview/preview.component';
import { RulesComponent } from '../plan/rules/rules.component';
import { PlanService } from './plan.service';
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';

//End Importing Plan Module Child Components
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css'],
  providers: [ChangeDateFormatService, DatatableService, ToastrService, PlanService, CurrentUserService, TranslateService]
})
export class PlanComponent extends FormCanDeactivate implements OnInit {
  expired = false;
  planProratingKey: any;
  planType: string;
  divisionKeyUrlId: any;
  val: number;
  submitted = false;
  companyNumber;
  companyName;
  planNumber;

  divisionCommentsArr: any;
  feeGuideJson: any;
  divisionMaxJson: any;
  companyUniqueId: any;
  planUniqueId: any;
  company_eff_date: any;
  divisionUnique: any;
  coKey;
  rulesJson: any;
  planJson;
  planInfoData;
  benefitsJson;
  coKeyUrlId;
  plansKeyUrlId;
  planYearTypeKey;
  divComKey;
  divComtxt;
  saveCopydivision: boolean = false;
  addMode: boolean = true;
  viewMode: boolean = false;
  editMode: boolean = false;
  isSaved = true;
  showLoader = false;
  FormGroup: FormGroup;
  PlanInfoFormGroup: FormGroup;
  BenefitFormGroup: FormGroup;
  @ViewChild('FormGroup')
  @ViewChild(PlanInfoComponent) planInfoFormData; // to acces Plan Info Tab Data 
  @ViewChild(BenefitsComponent) benefitsFormData; // to acces Plan Benefits Tab Data 
  @ViewChild(DivisionMaxComponent) divisionMaxFormData; // to acces Plan Divison Max Tab Data 
  @ViewChild(RulesComponent) rulesFormData; // to acces Plan Rules Tab Data 
  @ViewChild(FeeGuideComponent) feeGuideFormData; // to acces Plan Fee Guide Tab Data 
  @ViewChild(PreviewComponent) previewComponent: PreviewComponent;

  rulesHistInd: any;
  selectedYearType: any;
  selectedProratingType: any;
  selectedDeductibleType: any;
  selectedScheduleKey: Event;
  selectedProvinceKey: Event;
  yearTypeToSave: any;
  checkcarryerrorArray: any = [];
  proratingTypeKey: any;
  deductibleTypeKey: any;
  mainPlanArray = [{
    "updatePlan": 'F'
  }]
  businessTypeCd: any;
  coStatus: any = "old";
  isEdit: boolean = false;
  forPlanUpdate: boolean = false;
  forPlanUpdateAge1: boolean = false;
  forPlanUpdateAge2: boolean = false;
  effective_date_divisionDetailsVal;
  forPlanSave: boolean = false;
  forPlanSaveAge1: boolean = false;
  forPlanSaveAge2: boolean = false;
  divisionEmitVal: boolean = false;
  showLoaderOnUpdate: boolean = false;
  isNextClicked: boolean = false;
  covKey: any;
  disciplineKey: any;
  plansKey: any;
  divisionKeyId: any;

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private fb: FormBuilder,
    private changeDateFormatService: ChangeDateFormatService,
    private dataTableService: DatatableService,
    private ToastrService: ToastrService,
    private planService: PlanService,
    private route: ActivatedRoute,
    public cdRef: ChangeDetectorRef,
    private router: Router,
    private location: Location,
    public currentUserService: CurrentUserService,
    private translate: TranslateService
  ) {
    super();

    // add close button in edit section.
    this.route.queryParams.subscribe((params: Params) => {
      this.plansKey = params.planId;   
      this.coKeyUrlId =params.companyId;
      this.divisionKeyId = params.divisionId;
    });

    // issue number 731 end
    this.planService.carryforwarderror.subscribe((value) => {
      this.checkcarryerrorArray = value;
    })

    this.planService.loader.subscribe((value) => {
      this.showLoader = value;
    })

  }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['EPL']
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['EPL']
        this.getAuthCheck(checkArray)
      })
    }

    this.planYearTypeKey = null;
    this.addMode = true;
    this.editMode = false;
    this.viewMode = false;

    this.route.queryParams.subscribe((params: Params) => {
      /** Add Plan Case */
      var companyId = params['companyId'];
      this.GetCompanyDetailByCompanyCoKey(companyId);
      var divisionKeyUrlId = params['divisionId'];
      if (divisionKeyUrlId) {
        this.GetDivisionStatus(divisionKeyUrlId);
      }

      this.coKeyUrlId = companyId;

      /** Edit/Copy Division/Add Division Plan Case */
      this.planService.enableRulesDeleteButton.emit(true)
      if (params['planId']) {
        this.getCompanyPlan(params);
        if (params['planType'] != "copyDivision" && params['planType'] != "addDivision") {
          this.plansKeyUrlId = params['planId'];
          this.divisionKeyUrlId = params['divisionId'];
          this.editMode = true;
          this.addMode = false;
          this.viewMode = false;
          this.planType = 'addNewPlan'
        } else {
          this.planType = 'copyDivision';
        }
      } else {
        this.planType = 'addNewPlan'
      }
      if (params['planType'] != "editPlan") {
        this.isEdit = true;
      } else {
        this.isEdit = false;
      }

      /** Add Division Case */
      if (params['planType'] == "addDivision") {
        this.planYearTypeKey = params['yrTypeKey'];
        this.planType = 'addDivision';
      }
      // To enable delete rule button in copy division in any type of plan.
      if (params['planType'] == "editPlan") {
        this.planService.enableRulesDeleteButton.emit(false)     
      }
    });
    /* Combine all components together in a single form */
    this.FormGroup = this.fb.group({
      PlanInfoFormGroup: this.fb.group(this.planInfoFormData.planInfoFormDataVal),
      FormGroup: this.fb.group(this.feeGuideFormData.feeGuideFormDataVal),
      BenefitFormGroup: this.fb.group(this.benefitsFormData.benefitsFormDataVal),

    })

    window.scrollTo(0, 0);
    // for genral plan service issue
    setTimeout(() => {
      if (this.planType == 'copyDivision' || this.isEdit)
        this.benefitsFormData.getBenefitsData()
    }, 200);
    // To enable delete rule button in copy division in any type of plan.
    if (this.planType == 'copyDivision') {
      this.planService.enableRulesDeleteButton.emit(true)
    }

  }


  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      // Set Date Picker Value to Form Control Element
      this.FormGroup.patchValue(datePickerValue);
    }

  }

  /**
   * Receive the plan info tab data on change tab and save / update plan
   * @param  
   */
  receivePlanInfoData($event) {
    this.planJson = $event;
    this.planJson.isCompanyOld = this.coStatus
  }

  /**
   * Receive the benefit tab data on change tab and save / update plan
   * @param  
   */
  receiveBenefitData($event) {
    this.benefitsJson = $event;
  }

  /**
   * Receive the division tab data on change tab and save / update plan
   * @param  
   */
  receiveDivisionMaxData($event) {
    this.divisionMaxJson = $event;

  }

  /**
   * Receive the rules tab data on change tab and save / update plan
   * @param  
   */
  receiveRuleData($event) {
    this.rulesJson = $event;
  }

  /**
   * Receive the fee guide tab data on change tab and save / update plan
   * @param  
   */
  receiveFeeGuideData($event) {
    this.feeGuideJson = $event;
  }

  /**
 * Get Company Detail By Company Key   
 */
  GetCompanyDetailByCompanyCoKey(coKey) {
    let planDataJson = {
      "coKey": coKey
    }
    var URL = PlanApi.getCompanyDetailByCompanyCoKeyUrl;
    this.hmsDataServiceService.postApi(URL, planDataJson).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.company_eff_date = data.result.effectiveOn //Global value set 
        if (this.editMode) {
          this.FormGroup.controls.PlanInfoFormGroup.patchValue({
            'company_number': data.result.coId,
            'company_name': data.result.coName,
          });
        } else {
          if(data.result.coId.length == 4){
            var planNo = '0' + data.result.coId;
          } else if (data.result.coId.length == 3) {
             planNo = '00' + data.result.coId;
          } else {
             planNo = data.result.coId;
          }
          this.FormGroup.controls.PlanInfoFormGroup.patchValue({
            'company_number': data.result.coId,
            'company_name': data.result.coName,
            'plan_num': planNo
          });
        }

        this.companyNumber = data.result.coId
        this.companyName = data.result.coName
        // this.planNumber = data.result.coId
        this.planNumber = planNo
        this.businessTypeCd = data.result.businessTypeCd //AB Gov./Quikcard
      }
    });
  }

  /**
   * Get company plan data for edit & patch with form fields
   */
  getCompanyPlan(params) {
    this.showLoader = true;
    let getCompanyPlanUrl = PlanApi.getCompanyPlanUrl;
    this.hmsDataServiceService.postApi(getCompanyPlanUrl, {
      "coKey": params['companyId'],
      "plansKey": params['planId'],
      "divisionKey": params['divisionId']
    }).subscribe(data => {
      if(this.divisionEmitVal){
        this.showLoader = false;
      }
      this.planService.selectedDivisionType.subscribe((value) => {
        this.showLoader = value;
      })
      
      if (data.code == 200 && data.status == 'OK') {
        this.coStatus = data.result.planInfoJson.isCompanyOld
        this.planProratingKey = data.result.planInfoJson.planProratingKey; // New Param Added On 10 July
        this.FormGroup.controls.PlanInfoFormGroup.patchValue({
          'plan_num': data.result.planInfoJson.plansId,
        });
        // issue number 731 start
        this.planService.planCarryForwardData.emit(data.result.benefitsJson);

        if (params['planType'] == "copyDivision") {
          this.saveCopydivision = true;
          /**Remove unwanted coverage category code start**/

          for (var k in data.result.benefitsJson) {

            if (k == 'dentalSlug' && data.result.benefitsJson.dentalSlug['coverageCategory'] != undefined) {
              let removeDentalCovCategory = ["Endodontic", "Endoperio", "Majorrestorative", "Periodontalscaling", "Periodontic", "Prosthodontic", "Scale", "Temporomandibular Joint"];

              for (var i in removeDentalCovCategory) {
                let removeBenefitIndex = data.result.benefitsJson.dentalSlug.coverageCategory.findIndex(x => x.covCatDesc === removeDentalCovCategory[i]);
                if (removeBenefitIndex >= 0) {
                  data.result.benefitsJson[k].coverageCategory.splice(removeBenefitIndex, 1);
                }
                if (data.result.rulesJson.dentalRule.length > 0) {
                  let removeRuleIndex = data.result.rulesJson.dentalRule.findIndex(x => x.covDesc === removeDentalCovCategory[i]);
                  if (removeRuleIndex >= 0) {
                    data.result.rulesJson.dentalRule.splice(removeRuleIndex, 1);
                  }
                }
              }
            } else if (k == 'visionSlug' && data.result.benefitsJson.visionSlug['coverageCategory'] != undefined) {
              let removeVisionCovCategory = ["Clinical Need", "Exclusions", "Optical Supplements", "Referrals"];
              for (var i in removeVisionCovCategory) {
                let removeBenefitIndex = data.result.benefitsJson.visionSlug.coverageCategory.findIndex(x => x.covCatDesc === removeVisionCovCategory[i]);
                if (removeBenefitIndex >= 0) {
                  data.result.benefitsJson[k].coverageCategory.splice(removeBenefitIndex, 1);
                }
                if (data.result.rulesJson.visionRule.length > 0) {
                  let removeRuleIndex = data.result.rulesJson.visionRule.findIndex(x => x.covDesc === removeVisionCovCategory[i]);
                  if (removeRuleIndex >= 0) {
                    data.result.rulesJson.visionRule.splice(removeRuleIndex, 1);
                  }
                }
              }
            }
          }

          /**Remove unwanted coverage category code end**/
          this.finalData = {
            "planInfoJson": [data.result.planInfoJson],
            "benefitsJson": [data.result.benefitsJson],
            "divisionMaxJson": [data.result.divisionMaxJson],
            "rulesJson": [data.result.rulesJson],
            "feeGuideJson": [data.result.feeGuideJson]
          }
        } else {
          this.finalData = {
            "planInfoJson": [data.result.planInfoJson],
            "benefitsJson": [data.result.benefitsJson],
            "divisionMaxJson": [data.result.divisionMaxJson],
            "rulesJson": [data.result.rulesJson],
            "feeGuideJson": [data.result.feeGuideJson]
          }
        }

        this.proratingTypeKey = this.finalData.planInfoJson[0].prorateTypeKey;
        this.deductibleTypeKey = this.finalData.planInfoJson[0].deductTypeKey;

        this.planYearTypeKey = data.result.planInfoJson['yrTypeKey'];

        if (params['planType'] != "copyDivision") {
          this.divComKey = data.result.planInfoJson['divComKey'];
          this.divComtxt = data.result.planInfoJson['divComtxt'];
          this.rulesHistInd = {
            "dentalRuleHistInd": data.result.rulesJson['dentalRuleHistInd'],
            "drugRuleHistInd": data.result.rulesJson['drugRuleHistInd'],
            "healthCareRuleHistInd": data.result.rulesJson['healthCareRuleHistInd'],
            "visionRuleHistInd": data.result.rulesJson['visionRuleHistInd'],
          };
        }
        this.planService.planModuleData.emit(this.finalData);
        // issue number 731 start
        for (var jsonData in data.result.benefitsJson) {
          if (jsonData === 'dentalSlug' && data.result.benefitsJson[jsonData] != undefined && data.result.benefitsJson[jsonData].benefitCarryFwd != undefined) {
            if (data.result.benefitsJson[jsonData].benefitCarryFwd.length > 0 && this.editMode == true) {
              if (data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
                this.FormGroup.controls.BenefitFormGroup.patchValue({
                  'dentalcarryForwardYear': data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs,
                  'benefitKey': data.result.benefitsJson[jsonData].benefitCarryFwd[0].benefitKey,
                  'dentaleffectiveOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn) : '',
                  'dentalexpiredOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn) : ''
                });
              }
            }
          }

          if (jsonData === 'visionSlug' && data.result.benefitsJson[jsonData] != undefined && data.result.benefitsJson[jsonData].benefitCarryFwd != undefined) {
            if (data.result.benefitsJson[jsonData].benefitCarryFwd.length > 0 && this.editMode == true) {
              if (data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
                this.FormGroup.controls.BenefitFormGroup.patchValue({
                  'visioncarryForwardYear': data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs,
                  'visionbenefitKey': data.result.benefitsJson[jsonData].benefitCarryFwd[0].benefitKey,
                  'visioneffectiveOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn) : '',
                  'visionexpiredOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn) : ''
                });
              }
            }
          }
          if (jsonData === 'healthSlug' && data.result.benefitsJson[jsonData] != undefined && data.result.benefitsJson[jsonData].benefitCarryFwd != undefined) {
            if (data.result.benefitsJson[jsonData].benefitCarryFwd.length > 0 && this.editMode == true) {
              if (data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
                this.FormGroup.controls.BenefitFormGroup.patchValue({
                  'healthcarryForwardYear': data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs,
                  'healtheffectiveOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn) : '',
                  "healthbenefitKey": data.result.benefitsJson[jsonData].benefitCarryFwd[0].benefitKey,
                  'healthexpiredOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn) : ''
                });
              }
            }
          }

          if (jsonData === 'supplementSlug' && data.result.benefitsJson[jsonData] != undefined && data.result.benefitsJson[jsonData].benefitCarryFwd != undefined) {
            if (data.result.benefitsJson[jsonData].benefitCarryFwd.length > 0) {
              if (data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
                this.FormGroup.controls.BenefitFormGroup.patchValue({
                  'supplementalcarryForwardYear': data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs,
                  'supplementaleffectiveOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn) : '',
                  'supplementalexpiredOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn) : ''
                });
              }
            }
          }

          if (jsonData === 'wellnessSlug' && data.result.benefitsJson[jsonData] != undefined && data.result.benefitsJson[jsonData].benefitCarryFwd != undefined) {
            if (data.result.benefitsJson[jsonData].benefitCarryFwd.length > 0) {
              if (data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs != undefined) {
                this.FormGroup.controls.BenefitFormGroup.patchValue({
                  'wellnesscarryForwardYear': data.result.benefitsJson[jsonData].benefitCarryFwd[0].carryFrwdYrs,
                  'wellnesseffectiveOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].effectiveOn) : '',
                  'wellnessexpiredOn': (data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn != undefined) ? this.changeDateFormatService.convertStringDateToObject(data.result.benefitsJson[jsonData].benefitCarryFwd[0].expiredOn) : ''
                });
              }
            }
          }

        }
        // issue number 731 end
      } else {
        this.showLoader = false;
      }
    });
  }

  /**
   * function to save all plan tabs data
   * @param FormGroup 
   */
  savePlan(FormGroup) {
  
  if(this.addMode){
    this.FormGroup.controls.PlanInfoFormGroup.get('plan_num').setErrors({
        "planAlreadyExist": false
      });
      this.FormGroup.controls.PlanInfoFormGroup.get('plan_num').updateValueAndValidity();
    }
    // add required validation on dependent_age_1 and dependent_age_2 fields(#1189)
    if (this.businessTypeCd != "S") {
    this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_1').setValidators([Validators.required]);
    this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_1').updateValueAndValidity();
    
    this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_2').setValidators([Validators.required]);
    this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_2').updateValueAndValidity();
    this.forPlanSave = true;
    }
    else{
      var age1 = this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_1').value
      var age2 = this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_2').value
      this.planNumber = this.FormGroup.controls.PlanInfoFormGroup.value.plan_num
      this.forPlanSaveAge1 = true;
      this.forPlanSaveAge2 = true;
        if (age1 == "" && age2 == "" || age1 == undefined && age2 == undefined || age1 == undefined && age2 == "" || age1 == "" && age2 == undefined){
        this.forPlanSave = true;
        } else if ( age1 < 14 || age1 > 27) {
        this.ToastrService.error(this.translate.instant('company.plan.toaster.age1ShouldBetween14to27'));
        this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
        this.forPlanSaveAge1 = false;
        } else if (age2 < 17 || age2 > 34){
          this.ToastrService.error(this.translate.instant('company.plan.toaster.age2ShouldBeBetween17to34'));
          this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          this.forPlanSaveAge2 = false;
        } 
    }
    // end
    if(this.forPlanSave || this.forPlanSaveAge1 && this.forPlanSaveAge2){
    let isCopy = 'F'
    let plankey

    if (this.planType == "copyDivision") {
      isCopy = "T";
    } else {
    }
    this.submitted = true;

    //Plan Effective Date Can't Be Greater Than Company Effective Date 
    if (this.company_eff_date && this.FormGroup.value.PlanInfoFormGroup.effective_date) {
      var company_eff_date = this.changeDateFormatService.convertStringDateToObject(this.company_eff_date);
      var errorVal = this.changeDateFormatService.compareTwoDates(company_eff_date.date, this.FormGroup.value.PlanInfoFormGroup.effective_date.date);
      if (errorVal.isError == true) {
        FormGroup.controls.PlanInfoFormGroup.controls.effective_date.setErrors({
          "PlanEffDateNotValid": true
        });
        return;
      }
    }

    var n = this.checkcarryerrorArray.includes(true);
    if (n) {
      this.ToastrService.error("Please Enter valid value 1 or 2 only ");
      return false;
    }
    if (this.FormGroup.valid) {
      this.onChangeTab('savePlan');
      //Check for unit data
      if (this.planJson.unitData.length == 0) {
        this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
        this.ToastrService.error("Please Add At Least One Unit.");
        return;
      }


      //Check for benefits data
      var benefitFlat = this.checkBenefitCategoryExist();
      if (benefitFlat == false) {
        this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
        return;
      }
      
      //Check for benefits Category Services exist
      if (Object.keys(this.benefitsJson).length > 0) {
        let categoryName;
        if (this.benefitsJson.dentalSlug && Object.keys(this.benefitsJson.dentalSlug.coverageCategory).length > 0) {
          this.benefitsJson.dentalSlug.coverageCategory = this.benefitsJson.dentalSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.dentalSlug.coverageCategory) {
            if (this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 41 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 48 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 47 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 39 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 46 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 40 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 37 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 43 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 44) {

              if (this.benefitsJson.dentalSlug.coverageCategory[index].data != null &&
                this.benefitsJson.dentalSlug.coverageCategory[index].data.length == 0) {
                categoryName = this.benefitsJson.dentalSlug.coverageCategory[index].covCatDesc;
                this.ToastrService.error('Please Select At Least One service for ' + categoryName + ' Coverage Category.');
                this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
                this.showLoader = false;
                return false;
              }
            }
          }
        }
        if (this.benefitsJson.visionSlug && Object.keys(this.benefitsJson.visionSlug.coverageCategory).length > 0) {
          this.benefitsJson.visionSlug.coverageCategory = this.benefitsJson.visionSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.visionSlug.coverageCategory) {
            if (this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "CN" ||
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "EXCLUSIONS" ||
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "OS" ||
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "CL" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "EE" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "EG" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "LV" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatKey != 17 || //Referrals
              this.benefitsJson.visionSlug.coverageCategory[index].covCatKey != 38) {
              if (this.benefitsJson.visionSlug.coverageCategory[index].data != null &&
                this.benefitsJson.visionSlug.coverageCategory[index].data.length == 0) {
                categoryName = this.benefitsJson.visionSlug.coverageCategory[index].covCatDesc;
                this.ToastrService.error('Please Select At Least One service for ' + categoryName + ' Coverage Category.');
                this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
                this.showLoader = false;
                return false;
              }
            }
          }
        }
        if (this.benefitsJson.healthSlug && Object.keys(this.benefitsJson.healthSlug.coverageCategory).length > 0) {
          this.benefitsJson.healthSlug.coverageCategory = this.benefitsJson.healthSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.healthSlug.coverageCategory) {
            if (this.benefitsJson.healthSlug.coverageCategory[index].covCatKey != 38) {
              if (this.benefitsJson.healthSlug.coverageCategory[index].data != null &&
                this.benefitsJson.healthSlug.coverageCategory[index].data.length == 0) {
                categoryName = this.benefitsJson.healthSlug.coverageCategory[index].covCatDesc;
                this.ToastrService.error('Please Select At Least One service for ' + categoryName + ' Coverage Category.');
                this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
                this.showLoader = false;
                return false;
              }
            }
          }
        }
        if (this.benefitsJson.drugSlug && Object.keys(this.benefitsJson.drugSlug.coverageCategory).length > 0) {
          this.benefitsJson.drugSlug.coverageCategory = this.benefitsJson.drugSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.drugSlug.coverageCategory) {
            if (this.benefitsJson.drugSlug.coverageCategory[index].data != null &&
              this.benefitsJson.drugSlug.coverageCategory[index].data.length == 0) {
              categoryName = this.benefitsJson.drugSlug.coverageCategory[index].covCatDesc;
              this.ToastrService.error('Please Select At Least One service for ' + categoryName + ' Coverage Category.');
              this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
              this.showLoader = false;
              return false;
            }
          }
        }
        if (this.benefitsJson.supplementSlug && Object.keys(this.benefitsJson.supplementSlug.coverageCategory).length > 0) {

          this.benefitsJson.supplementSlug.coverageCategory = this.benefitsJson.supplementSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.supplementSlug.coverageCategory) {

            if (this.benefitsJson.supplementSlug.coverageCategory[index].covCatKey != '78' && this.benefitsJson.supplementSlug.coverageCategory[index].covCatKey != '38' && this.benefitsJson.supplementSlug.coverageCategory[index].data != null &&
              this.benefitsJson.supplementSlug.coverageCategory[index].data.length == 0) {
              categoryName = this.benefitsJson.supplementSlug.coverageCategory[index].covCatDesc;
              this.ToastrService.error('Please Select At Least One service for ' + categoryName + ' Coverage Category.');
              this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
              this.showLoader = false;
              return false;
            }
          }
        }
        if (this.benefitsJson.wellnessSlug && Object.keys(this.benefitsJson.wellnessSlug.coverageCategory).length > 0) {
          this.benefitsJson.wellnessSlug.coverageCategory = this.benefitsJson.wellnessSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.wellnessSlug.coverageCategory) {
            if (this.benefitsJson.wellnessSlug.coverageCategory[index].data != null &&
              this.benefitsJson.wellnessSlug.coverageCategory[index].data.length == 0) {
              categoryName = this.benefitsJson.wellnessSlug.coverageCategory[index].covCatDesc;
              this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
            }
          }
        }
      }
     
      //  Compare Plan Effective Date With all tabs data effective date
      var effectiveDateVerified = this.verifyPlanTabsEffectiveDate(FormGroup.value.PlanInfoFormGroup.effective_date);
      if (effectiveDateVerified == false) {
        return;
      }

      this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");

      if (Object.keys(this.feeGuideJson).length > 0) {
        if (this.feeGuideJson.feeGuideDt != null) {
          if (this.feeGuideJson.scheduleKey == undefined || this.feeGuideJson.scheduleKey == '' || this.feeGuideJson.provinceKey == undefined && this.feeGuideJson.provinceKey == '') {
            this.onSetPlanInfoTabFocus("plan-guide", "plan-guide");
            this.ToastrService.error('Please Enter Fee Guide General Details.');
            return false;
          }
        }
        var feeGuideFlag = this.validateFeeGuide(this.feeGuideJson);
        if (feeGuideFlag) {
         
        }
        if (this.feeGuideJson.feeGuideDt == null
          && this.feeGuideJson.payOnProviderAddress == "F"
          && this.feeGuideJson.provinceDesc == undefined
          && this.feeGuideJson.provinceKey == undefined
          && this.feeGuideJson.scheduleDesc == undefined
          && this.feeGuideJson.scheduleKey == undefined
        ) {
          this.feeGuideJson = {};
        }
      }
      this.isSaved = false;
      this.showLoader = true;
      //Start API Request
      if (this.benefitsJson.dentalSlug) {
        if (FormGroup.value.BenefitFormGroup.dentalcarryForwardYear != '') {
          var dentalCarryForwardObj = {
            carryFrwdYrs: FormGroup.value.BenefitFormGroup.dentalcarryForwardYear,
          }
          this.benefitsJson.dentalSlug.benefitCarryFwd = [dentalCarryForwardObj];
        }
        else {
          this.benefitsJson.dentalSlug.benefitCarryFwd = [];
        }
        // commented bcoz benefit key empty during copy calim issue 

        if (this.planType == "copyDivision") {
          this.benefitsJson.dentalSlug.benefitKey = ''
        }
      }
      if (this.benefitsJson.visionSlug) {
        if (FormGroup.value.BenefitFormGroup.visioncarryForwardYear != '') {
          var visionCarryForwardObj = {
            carryFrwdYrs: FormGroup.value.BenefitFormGroup.visioncarryForwardYear,
          }
          this.benefitsJson.visionSlug.benefitCarryFwd = [visionCarryForwardObj];

        }
        else {
          this.benefitsJson.visionSlug.benefitCarryFwd = [];
        }
        // commented bcoz benefit key empty during copy calim issue 
        if (this.planType == "copyDivision") {
          this.benefitsJson.visionSlug.benefitKey = ''
        }
      }
      if (this.benefitsJson.healthSlug) {

        if (FormGroup.value.BenefitFormGroup.healthcarryForwardYear != '') {
          var healthCarryForwardObj = {
            carryFrwdYrs: FormGroup.value.BenefitFormGroup.healthcarryForwardYear,

          }
          this.benefitsJson.healthSlug.benefitCarryFwd = [healthCarryForwardObj];

        }
      
        else {
          this.benefitsJson.healthSlug.benefitCarryFwd = [];
        }

        if (this.planType == "copyDivision") {
          isCopy = "T"
          this.benefitsJson.healthSlug.benefitKey = ''
        }

      }

      let divisionKey
      if (this.planType == "copyDivision") {
        isCopy = "T";
        this.route.queryParams.subscribe((params: Params) => {
          if (params['planId']) {
            plankey = params['planId']
          }
          if (params['divisionId']) {
            divisionKey = params['divisionId']
          }
        })
      }

      if (this.planType == "copyDivision") {
        if (this.benefitsJson.wellnessSlug) {
          this.benefitsJson.wellnessSlug.benefitKey = ''
        }
      }
      this.planInfoData = {
        "planInfoJson": {
          "coKey": this.coKeyUrlId, //Cokey unique key from url
          "plansKey": plankey,
          "plansId": this.planNumber,
          "plansName": "Plan1",
          "plansSuspendInd": (FormGroup.value.PlanInfoFormGroup.suspended_plan == true) ? "T" : "F",
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(FormGroup.value.PlanInfoFormGroup.effective_date),
          "terminatedOn": "",
          "divisionId": FormGroup.value.PlanInfoFormGroup.division_num, //Unique key
          "divisionKey": divisionKey,
          "divisionName": FormGroup.value.PlanInfoFormGroup.division_name,
          "divisionSuspendInd": "F",
          "divComtxt": FormGroup.value.PlanInfoFormGroup.division_comment,
          "yrTypeKey": this.planYearTypeKey ? this.planYearTypeKey : this.yearTypeToSave,
          "deductTypeKey": this.selectedDeductibleType,
          "divisionFamilyDeductAmt": FormGroup.value.PlanInfoFormGroup.family_debit_amount,
          "divisionSingleDeductAmt": FormGroup.value.PlanInfoFormGroup.single_debit_amount,
          "divisionDependAge1Num": parseInt(FormGroup.value.PlanInfoFormGroup.dependent_age_1),
          "divisionDependAge2Num": parseInt(FormGroup.value.PlanInfoFormGroup.dependent_age_2),
          "prorateTypeKey": this.selectedProratingType ? this.selectedProratingType : '',
          "noClaimsecureInTotalInd": (FormGroup.value.PlanInfoFormGroup.no_claim == true) ? "T" : "F",
          "plansExtraBenefitInd": (FormGroup.value.PlanInfoFormGroup.extra_benefits == true) ? "T" : "F",
          "unit": this.planJson.unitData,
          "isDivision": isCopy,
          "isFlexAccount": (FormGroup.value.PlanInfoFormGroup.flex_account== true)? "T" : "F",
          "default_wsa": FormGroup.value.PlanInfoFormGroup.default_wsa,
          "lower_wsa": FormGroup.value.PlanInfoFormGroup.lower_wsa,
          "upper_wsa": FormGroup.value.PlanInfoFormGroup.upper_wsa
        },
        "benefitsJson": Object.keys(this.benefitsJson).length > 0 ? this.benefitsJson : null,
        "divisionMaxJson": (this.divisionMaxJson != undefined && this.divisionMaxJson.length > 0) ? this.divisionMaxJson : null,
        "rulesJson": Object.keys(this.rulesJson).length > 0 ? this.rulesJson : null,
        "feeGuideJson": Object.keys(this.feeGuideJson).length > 0 ? this.feeGuideJson : null

      }
      try {
        var URL = PlanApi.saveCompanyPlansUrl;
        this.hmsDataServiceService.postApi(URL, this.planInfoData).subscribe(data => {
          if (data.hmsShortMessage == 'PLAN_ADDED_SUCCESSFULLY') {
            var plansKey = data.result.plansKey;
            this.ToastrService.success("Plan added successfully !");
            setTimeout(() => {
              this.router.navigate(['/company/plan/view/'], { queryParams: { 'companyId': data.result.planInfoJson['coKey'], 'planId': data.result.planInfoJson['plansKey'], 'divisonId': data.result.planInfoJson['divisionKey'] } });
            }, 3000);
          } else if (data.hmsShortMessage === 'DIVISION_ALREADY_EXIST') {
            this.ToastrService.error("Division already exists !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          } else if (data.hmsShortMessage === 'DIVISION_NAME_ALREADY_EXIST') {
            this.ToastrService.error("Division Name already exists !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
          else if (data.hmsShortMessage === 'AGE_SHOULD_BE_15_TO_35') {
            this.ToastrService.error("Age Should be between 15 to 35 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }

          //Company With Travel Detail
          else if (data.hmsShortMessage === 'AGE1_SHOULD_BE_15_TO_28') {
            this.ToastrService.error("Age1 Should be between 15 to 28 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
          else if (data.hmsShortMessage === 'AGE2_SHOULD_BE_18_TO_35') {
            this.ToastrService.error("Age2 Should be between 18 to 35 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
          //Company WithOut Travel Detail
          else if (data.hmsShortMessage === 'AGE1_SHOULD_BE_14_TO_27') {
            this.ToastrService.error("Age1 Should be between 14 to 27 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
          else if (data.hmsShortMessage === 'AGE2_SHOULD_BE_17_TO_34') {
            this.ToastrService.error("Age2 Should be between 17 to 34 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }

          else if (data.hmsShortMessage === 'PLANID_ALREADY_EXIST') {
            this.ToastrService.error("Plan no. already exists !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          } else if (data.hmsShortMessage === 'FEE_GUIDE_DATE_IS_REQUIRED') {
            this.ToastrService.error("Fee Guide Date is Required");
            this.onSetPlanInfoTabFocus("plan-guide", "plan-guide");
          } else if (data.hmsShortMessage == 'SOURCE_DIVISION_DOES_NOT_EXIST') {
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          } else if (data.hmsShortMessage == 'The Source division does not exist or expired.') {
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");                             
          } else if (data.hmsShortMessage == 'The Source division does not exist or expired') {
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
         
          this.isSaved = true;
          this.showLoader = false;
          if (data.code == 400 && data.status == "BAD_REQUEST") { // 19 May changes changes plan error handling
            if (data.hmsShortMessage === 'DIVISION_NOT_SAVED_SOMETHING_WENT_WROMG') {
              this.ToastrService.error("Division Not Saved Something Went Wrong");
              this.isSaved = true;
              this.showLoader = false;
            }
            if (data.hmsShortMessage === 'DIVISON_IS_REQUIRED_FOR_UNIT') {
              this.ToastrService.error("Division Is Required For Unit");
              this.isSaved = true;
              this.showLoader = false;
            }
            if (data.hmsShortMessage === 'BENEFIT_DISCIPLINE_DIVISION_MUST_BE_UNIQUE') {
              this.ToastrService.error("Benefit Discipline Division Must Be Unique");
              this.isSaved = true;
              this.showLoader = false;
            }
            if (data.hmsShortMessage == 'SOURCE_DIVISION_DOES_NOT_EXIST') {
              this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
              this.isSaved = true;
              this.showLoader = false;
            } 
            if (data.hmsShortMessage == 'The Source division does not exist or expired.') {
              this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
              this.isSaved = true;
              this.showLoader = false;
            }
            if (data.hmsShortMessage == 'The Source division does not exist or expired') {
              this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
              this.isSaved = true;
              this.showLoader = false;
            }

          } 
          if (data.code == 404 && data.hmsShortMessage == 'The Source division does not exist or expired.') {
            this.isSaved = true;
            this.showLoader = false;
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
          } else if (data.code == 404 && data.hmsShortMessage == 'The Source division does not exist or expired') {
            this.isSaved = true;
            this.showLoader = false;
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
          }
          if (data.code == 500) {
            this.ToastrService.error("Benefit Discipline Division Cannot Be Duplicate");
            this.isSaved = true;
            this.showLoader = false;
          }

          if (data.code == 503 && data.status == "SERVICE_UNAVAILABLE") {
            this.ToastrService.error("There is Some Problem At Server Side Please Try Again.");
            this.isSaved = true;
            this.showLoader = false;
          }
        },
          (error) => {
            this.showLoader = false;
          });
      } catch (e) {
        this.isSaved = true;
        this.showLoader = false;
      }

      //End API Request 


    } else {
      this.validateAllFormFields(this.FormGroup);
      this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
    }
    this.isSaved = true;
  }
  this.forPlanSave = false;
  }

  /**
   * Validate the save /  update plan to contains atleast one benefit category 
   */
  checkBenefitCategoryExist() {
    if (Object.keys(this.benefitsJson).length > 0) {
      if (this.benefitsJson.dentalSlug && Object.keys(this.benefitsJson.dentalSlug.coverageCategory).length > 0) {
        return true;
      } else if (this.benefitsJson.visionSlug && Object.keys(this.benefitsJson.visionSlug.coverageCategory).length > 0) {
        return true;
      } else if (this.benefitsJson.healthSlug && Object.keys(this.benefitsJson.healthSlug.coverageCategory).length > 0) {
        return true;
      } else if (this.benefitsJson.drugSlug && Object.keys(this.benefitsJson.drugSlug.coverageCategory).length > 0) {
        return true;
      } else if (this.benefitsJson.supplementSlug && Object.keys(this.benefitsJson.supplementSlug.coverageCategory).length > 0) {
        return true;
      } else if (this.benefitsJson.wellnessSlug && Object.keys(this.benefitsJson.wellnessSlug.coverageCategory).length > 0) {
        return true;
      } else {
        this.ToastrService.error("Please Select At Least One Benefits Coverage Category.");
        return false;
      }
    } else {
      this.ToastrService.error("Please Select At Least One Benefits Coverage Category.");
      return false;
    }
  }

  /**
   * Set Plan info tab focus
   * @param liNameId 
   * @param tabName 
   */
  onSetPlanInfoTabFocus(liNameId, tabName) {
    $(".tab-li").removeClass('active');
    $("#li-" + liNameId).addClass("active");

    $(".plan-tab").removeClass('active');
    $("#" + tabName).addClass("in active");
  }

  /**
  *  function to update all plan tabs data
  */
  updatePlan(FormGroup) {

    this.showLoaderOnUpdate = true;
    this.divisionEmitVal = true;
    this.planService.selectedDivisionUpdateType.emit(this.divisionEmitVal);
    // add required validation on dependent_age_1 and dependent_age_2 fields (#1189)
    if (this.businessTypeCd != "S") {
    this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_1').setValidators([Validators.required]);
    this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_1').updateValueAndValidity();
    
    this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_1').setValidators([Validators.required]);
    this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_2').updateValueAndValidity();
    this.planNumber = this.FormGroup.controls.PlanInfoFormGroup.value.plan_num
    this.forPlanUpdate = true;
    } else {
      this.FormGroup.controls.PlanInfoFormGroup.get('plan_num').setValidators([Validators.required, Validators.maxLength(10), CustomValidators.alphaNumericWithoutSpace, CustomValidators.notEmpty]);
      this.FormGroup.controls.PlanInfoFormGroup.get('plan_num').updateValueAndValidity()
      this.planNumber = this.FormGroup.controls.PlanInfoFormGroup.value.plan_num
      var age1 = this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_1').value
      var age2 = this.FormGroup.controls.PlanInfoFormGroup.get('dependent_age_2').value
      this.forPlanUpdateAge1 = true;
      this.forPlanUpdateAge2 = true;
        if (age1 == "" && age2 == "" || age1 == undefined && age2 == undefined || age1 == undefined && age2 == "" || age1 == "" && age2 == undefined){
        this.forPlanUpdate = true;
        } else if ( age1 < 14 || age1 > 27 ) {
        this.ToastrService.error(this.translate.instant('company.plan.toaster.age1ShouldBetween14to27'));
        this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
        this.forPlanUpdateAge1 = false;
        } else if (age2 < 17 || age2 > 34){
          this.ToastrService.error(this.translate.instant('company.plan.toaster.age2ShouldBeBetween17to34'));
          this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          this.forPlanUpdateAge2 = false;
        } 
    }
    // end
    if(this.forPlanUpdate || this.forPlanUpdateAge1 && this.forPlanUpdateAge2){
    //Start If Prorating Type Selected Then Effective Date is Required 
    var prorateTypeVal = FormGroup.value.PlanInfoFormGroup.prorating_type != undefined ? FormGroup.value.PlanInfoFormGroup.prorating_type : '';
    var effective_date_proratingTypeVal = FormGroup.value.PlanInfoFormGroup.effective_date_proratingType;
    if (prorateTypeVal != 0 && effective_date_proratingTypeVal == null) {
        this.FormGroup.controls.PlanInfoFormGroup.get('effective_date_proratingType').statusChanges
        this.FormGroup.controls.PlanInfoFormGroup.get('effective_date_proratingType').setErrors({
        "ProratingEffectiveRequired": true
      });
      $('html, body').animate({
        scrollTop: $(document).height()
      }, 'slow');
    } else {
      this.FormGroup.controls.PlanInfoFormGroup.get('effective_date_proratingType').setErrors(null);
    }
    //end
    //Plan Effective Date Can't Be Greater Than Company Effective Date 
    this.submitted = true;
    if (this.company_eff_date && this.FormGroup.value.PlanInfoFormGroup.effective_date) {
      var company_eff_date = this.changeDateFormatService.convertStringDateToObject(this.company_eff_date);
      var errorVal = this.changeDateFormatService.compareTwoDates(company_eff_date.date, this.FormGroup.value.PlanInfoFormGroup.effective_date.date);
      if (errorVal.isError == true) {
        FormGroup.controls.PlanInfoFormGroup.controls.effective_date.setErrors({
          "PlanEffDateNotValid": true
        });
      }
    }

    //Prorating Expiry Date Can't Be Less Than Prorating Effective Date     
    if (this.FormGroup.value.PlanInfoFormGroup.expiry_date_proratingType && this.FormGroup.value.PlanInfoFormGroup.effective_date_proratingType) {
      var errorVal = this.changeDateFormatService.compareTwoDates(this.FormGroup.value.PlanInfoFormGroup.effective_date_proratingType.date, this.FormGroup.value.PlanInfoFormGroup.expiry_date_proratingType.date);
      if (errorVal.isError == true) {
        // Task 547 To stop showing loader when expiry date is less than effective date and toaster shows error
        this.showLoaderOnUpdate = false
        this.ToastrService.error("Prorating Expiry Date can't be less than Prorating Effective Date !");
        return
      }
    }

    //Deductible Expiry Date Can't Be Less Than Deductible Effective Date     
    if (this.FormGroup.value.PlanInfoFormGroup.expiry_date_deductibleType && this.FormGroup.value.PlanInfoFormGroup.effective_date_deductibleType) {
      var errorVal = this.changeDateFormatService.compareTwoDates(this.FormGroup.value.PlanInfoFormGroup.effective_date_deductibleType.date, this.FormGroup.value.PlanInfoFormGroup.expiry_date_deductibleType.date);
      if (errorVal.isError == true) {
        // Task 547 To stop showing loader when expiry date is less than effective date and toaster shows error
        this.showLoaderOnUpdate = false
        this.ToastrService.error("Deductible Expiry Date can't be less than Deductible Effective Date !");
        return
      }
    }

    if (this.FormGroup.valid) {
      this.onChangeTab('updatePlan');

      //Check for unit data
      if (this.planJson.unitData.length == 0) {
        // Task 562 Below one added to stop page stuck if delete unit from plan and update
        this.showLoaderOnUpdate = false
        this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
        this.ToastrService.error("Please Add At Least One Unit.");
        return;
      }

      //Check for benefits Category Selected Or Not
      var benefitFlat = this.checkBenefitCategoryExist();
      if (benefitFlat == false) {
        this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
        return;
      }

      //Check for benefits Category Services exist
      if (Object.keys(this.benefitsJson).length > 0) {
        let categoryName;
        if (this.benefitsJson.dentalSlug && Object.keys(this.benefitsJson.dentalSlug.coverageCategory).length > 0) {
          this.benefitsJson.dentalSlug.coverageCategory = this.benefitsJson.dentalSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.dentalSlug.coverageCategory) {
            if (this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 41 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 48 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 47 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 39 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 46 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 40 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 37 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 43 &&
              this.benefitsJson.dentalSlug.coverageCategory[index].covCatKey != 44)
              if (this.benefitsJson.dentalSlug.coverageCategory[index].data != null &&
                this.benefitsJson.dentalSlug.coverageCategory[index].data.length == 0) {
                categoryName = this.benefitsJson.dentalSlug.coverageCategory[index].covCatDesc;
                this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
              }
          }
        }

        if (this.benefitsJson.visionSlug && Object.keys(this.benefitsJson.visionSlug.coverageCategory).length > 0) {
          this.benefitsJson.visionSlug.coverageCategory = this.benefitsJson.visionSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.visionSlug.coverageCategory) {
            if (this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "CN" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "EXCLUSIONS" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "OS" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "CL" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "EE" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "EG" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatCd != "LV" &&
              this.benefitsJson.visionSlug.coverageCategory[index].covCatKey != 17 && //Referrals
              this.benefitsJson.visionSlug.coverageCategory[index].covCatKey != 38) {
              if (this.benefitsJson.visionSlug.coverageCategory[index].data != null &&
                this.benefitsJson.visionSlug.coverageCategory[index].data.length == 0) {
                categoryName = this.benefitsJson.visionSlug.coverageCategory[index].covCatDesc;
                this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
              }
            }
          }
        }
        if (this.benefitsJson.healthSlug && Object.keys(this.benefitsJson.healthSlug.coverageCategory).length > 0) {
          this.benefitsJson.healthSlug.coverageCategory = this.benefitsJson.healthSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.healthSlug.coverageCategory) {
            if (this.benefitsJson.healthSlug.coverageCategory[index].covCatKey != 38) {
              if (this.benefitsJson.healthSlug.coverageCategory[index].data != null &&
                this.benefitsJson.healthSlug.coverageCategory[index].data.length == 0) {
                categoryName = this.benefitsJson.healthSlug.coverageCategory[index].covCatDesc;
                this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
              }
            }
          }
        }
        if (this.benefitsJson.drugSlug && Object.keys(this.benefitsJson.drugSlug.coverageCategory).length > 0) {
          this.benefitsJson.drugSlug.coverageCategory = this.benefitsJson.drugSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.drugSlug.coverageCategory) {
            if (this.benefitsJson.drugSlug.coverageCategory[index].covCatDesc != 38) {
              if (this.benefitsJson.drugSlug.coverageCategory[index].data != null &&
                this.benefitsJson.drugSlug.coverageCategory[index].data.length == 0) {
                categoryName = this.benefitsJson.drugSlug.coverageCategory[index].covCatDesc;
                this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
              }
            }
          }
        }
        if (this.benefitsJson.supplementSlug && Object.keys(this.benefitsJson.supplementSlug.coverageCategory).length > 0) {

          this.benefitsJson.supplementSlug.coverageCategory = this.benefitsJson.supplementSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.supplementSlug.coverageCategory) {
            //Condition added for log 908
            if (this.benefitsJson.supplementSlug.coverageCategory[index].covCatKey != '78' && this.benefitsJson.supplementSlug.coverageCategory[index].covCatKey != '38' && this.benefitsJson.supplementSlug.coverageCategory[index].data != null &&
              this.benefitsJson.supplementSlug.coverageCategory[index].data.length == 0) {
              categoryName = this.benefitsJson.supplementSlug.coverageCategory[index].covCatDesc;
              this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
            }
          }
        }
        if (this.benefitsJson.wellnessSlug && Object.keys(this.benefitsJson.wellnessSlug.coverageCategory).length > 0) {
          this.benefitsJson.wellnessSlug.coverageCategory = this.benefitsJson.wellnessSlug.coverageCategory.filter((item) => item.ischecked !== false);
          for (let index in this.benefitsJson.wellnessSlug.coverageCategory) {
            if (this.benefitsJson.wellnessSlug.coverageCategory[index].data != null &&
              this.benefitsJson.wellnessSlug.coverageCategory[index].data.length == 0) {
              categoryName = this.benefitsJson.wellnessSlug.coverageCategory[index].covCatDesc;
              this.onSetPlanInfoTabFocus("plan-benefits", "plan-benefits");
            }
          }
        }
      }

      //  Compare Plan Effective Date With all tabs data effective date
      var effectiveDateVerified = this.verifyPlanTabsEffectiveDate(FormGroup.value.PlanInfoFormGroup.effective_date);
      if (effectiveDateVerified == false) {
        return;
      }
      this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");

      if (Object.keys(this.feeGuideJson).length > 0) {
        if (this.feeGuideJson.feeGuideDt != null) {
          if (this.feeGuideJson.scheduleKey == undefined || this.feeGuideJson.scheduleKey == '' || this.feeGuideJson.provinceKey == undefined && this.feeGuideJson.provinceKey == '') {
            this.onSetPlanInfoTabFocus("plan-guide", "plan-guide");
            this.ToastrService.error('Please Enter Fee Guide General Details.');
            return false;
          }
        }
        var feeGuideFlag = this.validateFeeGuide(this.feeGuideJson);
        if (feeGuideFlag) {
        }
        if (this.feeGuideJson.feeGuideDt == null
          && this.feeGuideJson.payOnProviderAddress == "F"
          && this.feeGuideJson.provinceDesc == undefined
          && this.feeGuideJson.provinceKey == undefined
          && this.feeGuideJson.scheduleDesc == undefined
          && this.feeGuideJson.scheduleKey == undefined
        ) {
          this.feeGuideJson = {};
        }
      }

      this.isSaved = false;
      //Start API Request
      if (this.selectedProratingType != undefined) {
        var proratingType = this.selectedProratingType;
      } else if (FormGroup.value.PlanInfoFormGroup.prorating_type != undefined) {
        proratingType = this.proratingTypeKey;
      } else {
        proratingType = '';
      }
      //issue number 731 start
      //dental Slug
      if (FormGroup.value.BenefitFormGroup.dentalcarryForwardYear != '' && FormGroup.value.BenefitFormGroup.dentaleffectiveOn != '' && FormGroup.value.BenefitFormGroup.dentalexpiredOn != '') {
        var dentalCarryForwardObj = {
          carryFrwdYrs: FormGroup.value.BenefitFormGroup.dentalcarryForwardYear,
          effectiveOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.dentaleffectiveOn),
          expiredOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.dentalexpiredOn),
          benefitKey: FormGroup.value.BenefitFormGroup.benefitKey,
        }
        this.benefitsJson.dentalSlug.benefitCarryFwd = [dentalCarryForwardObj];
      }

      //vision slug

      if (FormGroup.value.BenefitFormGroup.visioncarryForwardYear != '' && FormGroup.value.BenefitFormGroup.visioneffectiveOn != '' && FormGroup.value.BenefitFormGroup.visionexpiredOn != '' && this.benefitsJson.visionSlug != undefined) {
        var visionCarryForwardObj = {
          carryFrwdYrs: FormGroup.value.BenefitFormGroup.visioncarryForwardYear,
          effectiveOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.visioneffectiveOn),
          expiredOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.visionexpiredOn),
          benefitKey: FormGroup.value.BenefitFormGroup.visionbenefitKey,
        }
        this.benefitsJson.visionSlug.benefitCarryFwd = [visionCarryForwardObj];
      }

      //health slug

      if (FormGroup.value.BenefitFormGroup.healthcarryForwardYear != '' && FormGroup.value.BenefitFormGroup.healtheffectiveOn != '' && FormGroup.value.BenefitFormGroup.healthexpiredOn != '' && this.benefitsJson.healthSlug != undefined) {
        var healthCarryForwardObj = {
          carryFrwdYrs: FormGroup.value.BenefitFormGroup.healthcarryForwardYear,
          effectiveOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.healtheffectiveOn),
          expiredOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.healthexpiredOn),
          benefitKey: FormGroup.value.BenefitFormGroup.healthbenefitKey,
        }
        this.benefitsJson.healthSlug.benefitCarryFwd = [healthCarryForwardObj];
      }

      //supplemental slug

      if (FormGroup.value.BenefitFormGroup.supplementalcarryForwardYear != '' && FormGroup.value.BenefitFormGroup.supplementaleffectiveOn != '' && FormGroup.value.BenefitFormGroup.supplementalexpiredOn != '' && this.benefitsJson.supplementSlug != undefined) {
        var supplementalCarryForwardObj = {
          carryFrwdYrs: FormGroup.value.BenefitFormGroup.supplementalcarryForwardYear,
          effectiveOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.supplementaleffectiveOn),
          expiredOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.supplementalexpiredOn)
        }
        if (this.benefitsJson.supplementSlug.benefitCarryFwd != undefined) {
          this.benefitsJson.supplementSlug.benefitCarryFwd.push(supplementalCarryForwardObj);
        }
      }

      //wellness slug

      if (FormGroup.value.BenefitFormGroup.wellnesscarryForwardYear != '' && FormGroup.value.BenefitFormGroup.wellnesseffectiveOn != '' && FormGroup.value.BenefitFormGroup.wellnessexpiredOn != '' && this.benefitsJson.wellnessSlug != undefined) {
        var wellnessCarryForwardObj = {
          carryFrwdYrs: FormGroup.value.BenefitFormGroup.wellnesscarryForwardYear,
          effectiveOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.wellnesseffectiveOn),
          expiredOn: this.changeDateFormatService.convertDateObjectToString(FormGroup.value.BenefitFormGroup.wellnessexpiredOn)
        }
        if (this.benefitsJson.wellnessSlug.benefitCarryFwd != undefined) {
          this.benefitsJson.wellnessSlug.benefitCarryFwd.push(wellnessCarryForwardObj);
        }
      }
      if (age1 == "" && age2 == ""){
        this.effective_date_divisionDetailsVal = "";
       }
        else{
         this.effective_date_divisionDetailsVal = this.changeDateFormatService.convertDateObjectToString(FormGroup.value.PlanInfoFormGroup.effective_date_divisionDetails);
        }
      //issue number 731 end
      let planUpdateDataJson = {
        "planInfoJson": {
          "coKey": this.coKeyUrlId,
          "coName": this.companyName,
          "plansKey": this.plansKeyUrlId,
          "plansId": this.planNumber,
          "plansName": "Plan1",
          "plansSuspendInd": (FormGroup.value.PlanInfoFormGroup.suspended_plan == true) ? "T" : "F",
          "effectiveOn": this.changeDateFormatService.convertDateObjectToString(FormGroup.value.PlanInfoFormGroup.effective_date),
          "effectiveBy": "HMS",
          "prorateTypeKey": this.selectedProratingType ? this.selectedProratingType : null,
          "yrTypeKey": this.planYearTypeKey ? this.planYearTypeKey : FormGroup.value.PlanInfoFormGroup.type_of_year,
          "deductTypeKey": this.selectedDeductibleType ? this.selectedDeductibleType : null,
          "divisionFamilyDeductAmt": FormGroup.value.PlanInfoFormGroup.family_debit_amount,
          "divisionSingleDeductAmt": FormGroup.value.PlanInfoFormGroup.single_debit_amount,
          "divisionDependAge1Num": parseInt(FormGroup.value.PlanInfoFormGroup.dependent_age_1),
          "divisionDependAge2Num": parseInt(FormGroup.value.PlanInfoFormGroup.dependent_age_2),
          "noClaimsecureInTotalInd": (FormGroup.value.PlanInfoFormGroup.no_claim == true) ? "T" : "F",
          "plansExtraBenefitInd": (FormGroup.value.PlanInfoFormGroup.extra_benefits == true) ? "T" : "F",
          "divisionExtraBenefitInd": (FormGroup.value.PlanInfoFormGroup.extra_benefits == true) ? "T" : "F",
          "planProratingKey": this.planProratingKey ? this.planProratingKey : '',
          "divisionKey": this.divisionKeyUrlId,
          "divisionId": FormGroup.value.PlanInfoFormGroup.division_num, //Unique key,
          "divisionName": FormGroup.value.PlanInfoFormGroup.division_name,
          "divisionSuspendInd": (FormGroup.value.PlanInfoFormGroup.suspended_plan == true) ? "T" : "F",
          "divComtxt": FormGroup.value.PlanInfoFormGroup.division_comment,
          "divComKey": FormGroup.value.PlanInfoFormGroup.division_comment == this.divComtxt ? this.divComKey : null,
          "unit": this.planJson.unitData,
          "effective_date_division": this.changeDateFormatService.convertDateObjectToString(FormGroup.value.PlanInfoFormGroup.effective_date_division),
          "terminate_date_division": this.changeDateFormatService.convertDateObjectToString(FormGroup.value.PlanInfoFormGroup.terminate_date_division),
          "effective_date_divisionDetails": this.effective_date_divisionDetailsVal,
          "expiry_date_divisionDetails": this.changeDateFormatService.convertDateObjectToString(FormGroup.value.PlanInfoFormGroup.expiry_date_divisionDetails),
          "proratingEffectiveOn": this.planJson.proratingEffectiveOn,
          "proratingExpiredOn": this.planJson.proratingExpiredOn,
          "deductibleEffectiveOn": this.planJson.deductibleEffectiveOn,
          "deductibleExpiredOn": this.planJson.deductibleExpiredOn,
          "isDivision": 'T', // Set T for isDivision param as per 
          "isFlexAccount": (FormGroup.value.PlanInfoFormGroup.flex_account== true)? "T" : "F",
          "default_wsa": FormGroup.value.PlanInfoFormGroup.default_wsa,
          "lower_wsa": FormGroup.value.PlanInfoFormGroup.lower_wsa,
          "upper_wsa": FormGroup.value.PlanInfoFormGroup.upper_wsa
        },
        "benefitsJson": Object.keys(this.benefitsJson).length > 0 ? this.benefitsJson : null,
        "divisionMaxJson": (this.divisionMaxJson != undefined && this.divisionMaxJson.length > 0) ? this.divisionMaxJson : null,
        "rulesJson": Object.keys(this.rulesJson).length > 0 ? this.rulesJson : null,
        "feeGuideJson": Object.keys(this.feeGuideJson).length > 0 ? this.feeGuideJson : null,
      }

      try {
        var URL = PlanApi.updateCompanyPlansUrl;
        this.benefitsFormData.savebenefitsServ.ices();

        this.hmsDataServiceService.putApi(URL, planUpdateDataJson).subscribe(data => {
          if (data.hmsShortMessage == 'PLAN_UPDATED_SUCCESSFULLY') {
            this.ToastrService.success("Plan updated successfully !");
            setTimeout(() => {
              this.router.navigate(['/company/plan/view/'], { queryParams: { 'companyId': data.result.planInfoJson['coKey'], 'planId': data.result.planInfoJson['plansKey'], 'divisonId': data.result.planInfoJson['divisionKey'] } });
            }, 3000);
            this.viewMode = false;
            this.addMode = false;
            this.editMode = true;
            this.coKey = data.result.coKey;
          } else if (data.hmsShortMessage === 'DIVISION_ALREADY_EXIST') {
            this.ToastrService.error("Division already exists !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          } else if (data.hmsShortMessage === 'DIVISION_NAME_ALREADY_EXIST') {
            this.ToastrService.error("Division Name already exists !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          } else if (data.hmsShortMessage === 'AGE_SHOULD_BE_15_TO_35') {
            this.ToastrService.error("Age Should be between 15 to 35 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
          //Company With Travel Detail
          else if (data.hmsShortMessage === 'AGE1_SHOULD_BE_15_TO_28') {
            this.ToastrService.error("Age1 Should be between 15 to 28 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
          else if (data.hmsShortMessage === 'AGE2_SHOULD_BE_18_TO_35') {
            this.ToastrService.error("Age2 Should be between 18 to 35 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
          //Company WithOut Travel Detail
          else if (data.hmsShortMessage === 'AGE1_SHOULD_BE_14_TO_27') {
            this.ToastrService.error("Age1 Should be between 14 to 27 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }
          else if (data.hmsShortMessage === 'AGE2_SHOULD_BE_17_TO_34') {
            this.ToastrService.error("Age2 Should be between 17 to 34 !");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }

          else if (data.hmsShortMessage === 'FEE_GUIDE_DATE_IS_REQUIRED') {
            this.ToastrService.error("Fee Guide Date is Required");
            this.onSetPlanInfoTabFocus("plan-guide", "plan-guide");
          } else if (data.hmsShortMessage === 'PRORATING_EFFECTIVEON_IS_REQUIRED_OR_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
            this.ToastrService.error("Pro Rating Effective date should be greater than old expired Date");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          } else if (data.hmsShortMessage === 'DEDUCTIBLE_EFFECTIVE_MUST_BE_GREATER_THAN_OLD') {
            this.ToastrService.error("Deductible Type Effective Date Should Be Greater Than Old");
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          } else if (data.hmsShortMessage === 'PRORATING_EFFECTIVE_ON_REQUIRED') {
            this.ToastrService.error("Prorating Effective Date Is Required");
            this.onSetPlanInfoTabFocus("plan-guide", "plan-guide");
          } else if (data.hmsShortMessage == 'SOURCE_DIVISION_DOES_NOT_EXIST') {
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          } else if (data.hmsShortMessage == 'The Source division does not exist or expired.') {
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");                             
          } else if (data.hmsShortMessage == 'The Source division does not exist or expired') {
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
            this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
          }else {
            this.ToastrService.error("Error updating plan !");
          }
          this.isSaved = true;
          this.showLoader = false;
          this.showLoaderOnUpdate = false;
          if (data.code == 400 && data.status == "BAD_REQUEST") { // changes plan error handling
            if (data.hmsShortMessage === 'DIVISION_NOT_SAVED_SOMETHING_WENT_WROMG') {
              this.ToastrService.error("Division Not Saved Something Went Wrong");
              this.isSaved = true;
              this.showLoader = false;
              this.showLoaderOnUpdate = false;
            }
            if (data.hmsShortMessage === ' DIVISON_IS_REQUIRED_FOR_UNIT') {
              this.ToastrService.error("Division Is Required For Unit");
              this.isSaved = true;
              this.showLoader = false;
              this.showLoaderOnUpdate = false;
            }
            if (data.hmsShortMessage === ' BENEFIT_DISCIPLINE_DIVISION_MUST_BE_UNIQUE') {
              this.ToastrService.error("Benefit Discipline Division Must Be Unique");
              this.isSaved = true;
              this.showLoader = false;
              this.showLoaderOnUpdate = false;
            }
            if (data.hmsShortMessage == 'SOURCE_DIVISION_DOES_NOT_EXIST') {
              this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
              this.isSaved = true;
              this.showLoader = false;
              this.showLoaderOnUpdate = false;
            }
            if (data.hmsShortMessage == 'The Source division does not exist or expired.') {
              this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
              this.isSaved = true;
              this.showLoader = false;
              this.showLoaderOnUpdate = false;
            }
            if (data.hmsShortMessage == 'The Source division does not exist or expired') {
              this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
              this.isSaved = true;
              this.showLoader = false;
              this.showLoaderOnUpdate = false;
            }

          }
          if (data.code == 404 && data.hmsShortMessage == 'The Source division does not exist or expired.') {
            this.isSaved = true;
            this.showLoader = false;
            this.showLoaderOnUpdate = false;
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
          } else if (data.code == 404 && data.hmsShortMessage == 'The Source division does not exist or expired') {
            this.isSaved = true;
            this.showLoader = false;
            this.showLoaderOnUpdate = false;
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
          } else if (data.code == 404 && data.hmsShortMessage == 'SOURCE_DIVISION_DOES_NOT_EXIST') {
            this.isSaved = true;
            this.showLoader = false;
            this.showLoaderOnUpdate = false;
            this.ToastrService.error(this.translate.instant('company.plan.toaster.srcDivision-doesNotExistORexpired'));
          }
          if (data.code == 503 && data.status == "SERVICE_UNAVAILABLE") {
            this.ToastrService.error("There is Some Problem At Server Side Please Try Again.");
            this.isSaved = true;
            this.showLoader = false;
            this.showLoaderOnUpdate = false;
          }
        }, (error) => {
          this.showLoader = false;
          this.showLoaderOnUpdate = false;
          this.ToastrService.error("There is Some Problem, Please Try Again.");
          this.isSaved = true; //   change for #1189
        });
      } catch (e) {
        this.isSaved = true;
        this.showLoader = false;
        this.showLoaderOnUpdate = false;
      }

      //End API Request       
    } else {
      this.validateAllFormFields(this.FormGroup);
      this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
    }
   }
   this.forPlanUpdate = false;
  }

  /**
   * Validate Fee Guide tab data while save / update plan i.e if any of the field is filled in the fee guide tab than data is mandatory in the fee guide tab.
   * @param feeGuideJson 
   */
  validateFeeGuide(feeGuideJson) {
    let object = this.feeGuideJson;
    if ((object.scheduleKey != undefined && object.scheduleKey != '') || (object.provinceKey != undefined && object.provinceKey != '') || object.payOnProviderAddress == 'T' || (object.hasOwnProperty("schedule") && object.schedule.length > 0) || (object.hasOwnProperty("province") && object.province.length > 0)) {
      return true;
    } else {
      return false;
    }
  }

  /* Trigger validations of all form fields together */
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
   * @description This funciton is used to compare plan all tabs data effective date with plan effective date. Return true if all tabs effective date is greater than plan effective date otherwise return false.
   * @param PlanEffectiveDt 
   * return true/false.
   */
  verifyPlanTabsEffectiveDate(PlanEffectiveDt) {
    // check for plan info unit effective date
    for (let i in this.planJson.unitData) {
      var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.planJson.unitData[i].effectiveOn);
      var errorVal = this.changeDateFormatService.compareTwoDates(PlanEffectiveDt.date, effectiveDt.date);
      if (errorVal.isError == true) {
        // Task 487-1 Below loader set to false to stop showing loader if toaster shows validation error
        this.showLoaderOnUpdate = false
        this.ToastrService.error("Unit Effective Date Can't be Less Than Plan Effective Date.");
        this.onSetPlanInfoTabFocus("plan-dash", "plan-dash");
        return false;
      }
    }

    // check for benifits tab effective date


    // check for rule tab effective date
    for (let prop in this.rulesJson) {
      for (let i in this.rulesJson[prop]) {
        var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.rulesJson[prop][i].effectiveOn);
        var errorVal = this.changeDateFormatService.compareTwoDates(PlanEffectiveDt.date, effectiveDt.date);
        if (errorVal.isError == true) {
          this.ToastrService.error("Rule Effective Date Can't be Less Than Plan Effective Date.");
          this.onSetPlanInfoTabFocus("plan-rule", "plan-rule");
          return false;
        }
      }
    }
    // check for fee guide effective date
    if (this.feeGuideJson.feeGuideDt) {
      var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.feeGuideJson.feeGuideDt);
      var errorVal = this.changeDateFormatService.compareTwoDates(PlanEffectiveDt.date, effectiveDt.date);
      if (errorVal.isError == true) {
        this.ToastrService.error("Fee Guide Effective Date Can't be Less Than Plan Effective Date.");
        this.onSetPlanInfoTabFocus("plan-guide", "plan-guide");
        return false;
      }
    }
    // check for fee guide schedule effective date
    for (let i in this.feeGuideJson['schedule']) {
      var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.feeGuideJson['schedule'][i].effectiveOn);
      var errorVal = this.changeDateFormatService.compareTwoDates(PlanEffectiveDt.date, effectiveDt.date);
      if (errorVal.isError == true) {
        this.ToastrService.error("Schedule Effective Date Can't be Less Than Plan Effective Date.");
        this.onSetPlanInfoTabFocus("plan-guide", "plan-guide");
        return false;
      }
    }
    // check for fee guide province effective date
    for (let i in this.feeGuideJson['province']) {
      var effectiveDt = this.changeDateFormatService.convertStringDateToObject(this.feeGuideJson['province'][i].effectiveOn);
      var errorVal = this.changeDateFormatService.compareTwoDates(PlanEffectiveDt.date, effectiveDt.date);
      if (errorVal.isError == true) {
        this.ToastrService.error("Province Effective Date Can't be Less Than Plan Effective Date.");
        this.onSetPlanInfoTabFocus("plan-guide", "plan-guide");
        return false;
      }
    }

    return true;
  }

  finalData;
  printPlanMode = false;

  /**
   * get data from all tabs when any on the tab is change in the plan
   * @param activeTab 
   */
  onChangeTab(activeTab) {

    // Task 99 below condition is for pagination in rules section of plan in company, to get if rules tab opened
    if (activeTab == 'planRule') {
      this.planService.rulesTabClicked.emit(true) 
    }
    if (activeTab == 'planPreview') {
      this.printPlanMode = true;
    }
    else {
      this.printPlanMode = false;
    }
    this.previewComponent.planPrintOpen();
    this.route.queryParams.subscribe((params: Params) => {
      if (params['planType'] == "copyDivision") {

        if (activeTab == 'planBenefit') {
          this.benefitsFormData.triggerEditBenefitsData();

        }
      }
    });
    if (this.editMode) {
      if (activeTab == 'planBenefit') {
        this.benefitsFormData.triggerEditBenefitsData();
      }
    }
    if (!this.editMode) {
      if (activeTab == 'planRule') {
        this.rulesFormData.triggerRulesDropdownData();
      }
    }

    this.planInfoFormData.triggerPlanInfo();
    this.benefitsFormData.triggerBenefitsData();
    this.divisionMaxFormData.triggerDivisionMaxData();
    this.rulesFormData.triggerRuleData();
    this.feeGuideFormData.triggerFeeGuideData();
    this.finalData = {

      "planInfoJson": [this.planJson],
      "benefitsJson": [this.benefitsJson],
      "divisionMaxJson": [this.divisionMaxJson],
      "rulesJson": [this.rulesJson],
      "feeGuideJson": [this.feeGuideJson],
      "rulesHistInd": [this.rulesHistInd]
    }

    this.planService.planModuleData.emit(this.finalData)
    // Below condition is to send true to method to check if table drawn first time after click on rules
    // Task 555 one more check added to resolve old issue where not able to navigate to plan by clicking on next button which was not set before also
    if (activeTab == 'planRule' && this.editMode && !this.isNextClicked) {
      this.isNextClicked = false
    }
  }

  /**
   * Trigger the onChangeTab function to get the tabs data on click the next button
   * @param mainTab 
   * @param activeTab 
   */
  clickNextTab(mainTab, activeTab) {
    // Task 555 Below one boolean is to set true so that onChangeTab can have a check if plan tab is clicked or next button is clicked to use in a check
    this.isNextClicked = true
    this.onChangeTab(mainTab);
    this.onSetPlanInfoTabFocus(activeTab, activeTab);
  }

  /* Emit Data On Click Next Button */
  nextButtonClicked() {
    this.planService.planModuleData.emit(this.finalData) // Emit Data On Click Next Button
  }

  /**
   * Print plan daetail page
   * @param printSectionId 
   */
  printPlanDetails(printSectionId: string): void {
    let printContents, popupWin;
    printContents = document.getElementById(printSectionId).innerHTML;
    popupWin = window.open('', '_blank', 'top=30,left=30,height=600,width=1200');
    popupWin.document.open();
    if (this.businessTypeCd == "S") {
      popupWin.document.write(
        `<html>
          <head>
            <title>Plan Preview</title>
            <style>           
            @font-face {
              font-family: 'Montserrat';
              src: url('../../assets/fonts/shav-font/Montserrat-Regular.woff2') format('woff2');
              src: url('../../assets/fonts/shav-font/Montserrat-Regular.woff') format('woff');
              font-weight: normal;
              font-style: normal;
             }
            </style>
          </head>                
          <body onload="window.print();window.close()" style="font-family: 'Montserrat';">
          <img src='../../../assets/images/AlbertaLogo.png'} />
          <p style="float:right;">
          200 Quikcard Centre<br/>
          17010-103 Ave<br/>
          Edmonton, Alberta, T5S 1K7<br/>
          p 780.426.7526 | 1.800.232.1997<br/>
          f 780.426.7581 | Quikcard.com
          </p>   
          ${printContents}</body>
        </html>`
      );
    } else if (this.businessTypeCd == "Q") {
      popupWin.document.write(
        `<html>
          <head>
            <title>Plan Preview</title>
            <style>           
            @font-face {
              font-family: 'Montserrat';
              src: url('../../assets/fonts/shav-font/Montserrat-Regular.woff2') format('woff2');
              src: url('../../assets/fonts/shav-font/Montserrat-Regular.woff') format('woff');
              font-weight: 10;
              font-style: normal;
             }
            </style>
          </head>
          <body onload="window.print();window.close()" style="font-family: 'Montserrat';">         
          <img src='../../../assets/images/logo.png'} />    
          <p style="float:right;">
          200 Quikcard Centre<br/>
          17010-103 Ave<br/>
          Edmonton, Alberta, T5S 1K7<br/>
          p 780.426.7526 | 1.800.232.1997<br/>
          f 780.426.7581 | Quikcard.com
          </p>        
          ${printContents}
          </body>
        </html>`
      );
    }

    popupWin.document.close();
  }

  /** Function For Jump to Previous Page */
  goBack() {
    this.location.back();
  }

  /**
   * Get Division Status 
   * @param divisionKey
   */
  GetDivisionStatus(divisionKeyUrlId) {
    let postDataJson = {
      "divisionKey": divisionKeyUrlId
    }
    var URL = PlanApi.getDivisionStatusUrl;
    this.hmsDataServiceService.postApi(URL, postDataJson).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.FormGroup.controls.PlanInfoFormGroup.patchValue({
          'terminate_date_division': this.changeDateFormatService.convertStringDateToObject(data.result.terminatedOn)
        });
      }
    });
  }

  /**
   * Get SelectedYearType drop down value
   * @param event 
   */
  getSelectedYearType(event) {
    this.selectedYearType = event;
  }

  /**
   * Get SelectedProratingType drop down value
   * @param event 
   */
  getSelectedProratingType(event) {
    this.selectedProratingType = event;
  }

  /**
   * Get SelectedDeductibleType drop down value
   * @param event 
   */
  getSelectedDeductibleType(event) {
    this.selectedDeductibleType = event;
  }

  /**
   * Get SelectedSchedule drop down value
   * @param  
   */
  getSelectedSchedule($event) {
    this.selectedScheduleKey = event;
  }

  /**
   * Get YearType drop down value
   * @param event 
   */
  getYearTypeToSaved(event) {
    this.yearTypeToSave = event;
  }

  /**
   * Get Selected Province drop down value
   * @param  
   */
  getSelectedProvince($event) {
    this.selectedProvinceKey = event;
  }

  /**
   * To Check if, unsaved changes! If you leave, your changes will be lost  
   */
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

  /**
   * check the auth
   * @param claimChecks 
   */
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.mainPlanArray = [{
        "updatePlan": 'T'
      }]
    }
    else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.mainPlanArray = [{
        "updatePlan": authCheck['EPL103']
      }]
    }
    return this.mainPlanArray
  }

// add close button for add and edit section.
  close(FormGroup){
    if (this.addMode == true) {
      this.location.back()
    }else {
       this.router.navigate(['/company/plan/view/'], { queryParams: { 'companyId': this.coKeyUrlId, 'planId': this.plansKey, 'divisonId': this.divisionKeyId } });
    }  
  }
}