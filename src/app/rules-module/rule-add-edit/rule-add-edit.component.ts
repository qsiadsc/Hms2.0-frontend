import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { Constants } from '../../common-module/Constants';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { RulesApi } from '../rules-api';
import { RulesService } from '../rules.service';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-rule-add-edit',
  templateUrl: './rule-add-edit.component.html',
  styleUrls: ['./rule-add-edit.component.css'],
  providers: [ChangeDateFormatService, ToastrService, ExDialog, TranslateService]
})
export class RuleAddEditComponent extends FormCanDeactivate implements OnInit {
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  currentUser: any;
  FormGroup: FormGroup;
  ruleKeyUrl: any;
  private sub: any;
  ruleKey: any;
  public disciplineKey: any;
  rulesTypeMaster: any;
  rulesExecOrder: any;
  rulesExecPoint: any;
  addEditRuleForm: FormGroup;
  new_mask_id: FormControl;
  /** For Update Row */
  old_mask_id: FormControl;
  error: { isError: boolean; errorMessage: string; };
  addMode = true;
  viewMode = false;
  editMode = false;
  submitted = false;
  public ruleTypeData: CompleterData;
  public rulesExecPointData: CompleterData;
  public rulesExecOrderData: CompleterData;
  selectedRuleKey: any;
  selectedRuleDesc: any;
  savedRuleTypeKey: any;
  selectedRuleExecPointKey: any;
  selectedRuleExecPointDesc: any;
  savedRuleExecPointKey: any;
  savedRuleExecOrderKey: any;
  selectedRuleExecOrderKey: any;
  selectedRuleExecOrderDesc: any;

  rulesAuthCheck = [{
    "saveDentalRule": 'F',
    "saveVisionRule": 'F',
    "saveHealthRule": 'F',
    "saveDrugRule": 'F',
    "editDentalRule": 'F',
    "editVisionRule": 'F',
    "editHealthRule": 'F',
    "editDrugRule": 'F',
    "addDentalMask": 'F',
    "addVisionMask": 'F',
    "addHealthMask": 'F',
    "addDrugMask": 'F',
    "editDentalMask": 'F',
    "editVisionMask": 'F',
    "editHealthMask": 'F',
    "editDrugMask": 'F',
    "deleteDentalMask": 'F',
    "deleteVisionMask": 'F',
    "deleteHealthMask": 'F',
    "deleteDrugMask": 'F',
  }]
  showLoader:boolean = false;

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastr: ToastrService,
    private exDialog: ExDialog,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private completerService: CompleterService,
    private location: Location,
    private currentUserService: CurrentUserService,
    private rulesService: RulesService
  ) {
    super();
    this.route.params.subscribe((params: Params) => {
      this.disciplineKey = params['id'];
    });
    /** Mask Inline Data table new row  */
    this.new_mask_id = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(5), CustomValidators.alphaNumeric]);
    /** Mask Inline Data table update row  */
    this.old_mask_id = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(5), CustomValidators.alphaNumeric]);
  }
  MaskAddMode;
  selectedMask = {};
  MaskEditMode;
  MaskList = [];
  ruleSearchBtn : boolean = false;

  ngOnInit() {
    //Start Role Checks
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DTL'].concat(
          this.currentUserService.authChecks['VIS'],
          this.currentUserService.authChecks['HLT'],
          this.currentUserService.authChecks['DRG']
        );
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['DTL'].concat(
          this.currentUserService.authChecks['VIS'],
          this.currentUserService.authChecks['HLT'],
          this.currentUserService.authChecks['DRG']
        );
        this.getAuthCheck(checkArray)
      });     
    }
    //End Role Checks
    // Add Rule Form Validations
    this.addEditRuleForm = new FormGroup({
      'plan_rule': new FormControl(''),
      'rule_status': new FormControl(''),
      'rule_id': new FormControl(''),
      'rule_type': new FormControl('', Validators.required),
      'rule_exec_point': new FormControl('', Validators.required),
      'rule_exec_order': new FormControl('', Validators.required),
      'description': new FormControl(''),
      'script': new FormControl(''),
    });
    this.getProviderRuleExecutionPointList();
    this.getProviderRuleExecutionOrderList();
    this.getProviderRuleTypeList();
    if(this.rulesService.backToSearchBtn){
      this.ruleSearchBtn = this.rulesService.backToSearchBtn//needs to be uncommented
    }
    else
    {
      this.ruleSearchBtn =false
    }

    if (this.router.url.indexOf('view') !== -1) {
      this.addMode = false;
      this.viewMode = true;
      this.editMode = false;
      this.addEditRuleForm.disable();
      this.sub = this.route.params.subscribe(params => {
        this.ruleKey = params['id']; // (+) converts string 'id' to a number
        let ruleJson = {
          "disciplineKey": this.disciplineKey,
          "ruleKey": params.ruleKey
        }
        var URL = RulesApi.getRuleByRuleKey;
        this.hmsDataServiceService.postApi(URL, ruleJson).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.savedRuleTypeKey = data.result.ruleTypeKey;
            this.savedRuleExecPointKey = data.result.ruleExecutionPointKey;
            this.savedRuleExecOrderKey = data.result.ruleExecutionOrderKey;
            this.addEditRuleForm.patchValue({
              "rule_id": data.result.ruleKey,
              "rule_type": data.result.ruleTypeDesc,
              "rule_exec_point": data.result.ruleExecutionPointDesc,
              "rule_exec_order": data.result.ruleExecutionOrderDesc,
              "plan_rule": (data.result.rulePlanInd == 'T') ? true : false,
              "rule_status": (data.result.ruleStatusInd == 'T') ? true : false,
              "script": data.result.ruleTxt,
              "description": data.result.ruleDescCom,
            });
            this.MaskList = data.result.ruleProcMaskDto;
          }
        });
      });
    }
  }

  getAuthCheck(ruleChecks) {
    let authCheck = []
    if(this.currentUser.isAdmin == 'T'){
      this.rulesAuthCheck = [{
        "saveDentalRule": 'T',
        "saveVisionRule": 'T',
        "saveHealthRule": 'T',
        "saveDrugRule": 'T',
        "editDentalRule": 'T',
        "editVisionRule": 'T',
        "editHealthRule": 'T',
        "editDrugRule": 'T',
        "addDentalMask": 'T',
        "addVisionMask": 'T',
        "addHealthMask": 'T',
        "addDrugMask": 'T',
        "editDentalMask": 'T',
        "editVisionMask": 'T',
        "editHealthMask":'T',
        "editDrugMask": 'T',
        "deleteDentalMask": 'T',
        "deleteVisionMask": 'T',
        "deleteHealthMask": 'T',
        "deleteDrugMask": 'T'
      }]
    }else{
      if (ruleChecks && ruleChecks.length > 0) {
        for (var i = 0; i < ruleChecks.length; i++) {
          authCheck[ruleChecks[i].actionObjectDataTag] = ruleChecks[i].actionAccess
        }
      }
      this.rulesAuthCheck = [{
        "saveDentalRule": authCheck['ADR139'],
        "saveVisionRule": authCheck['VIR146'],
        "saveHealthRule": authCheck['AHR153'],
        "saveDrugRule": authCheck['DRL160'],
        "editDentalRule": authCheck['VDR144'],
        "editVisionRule": authCheck['VVI151'],
        "editHealthRule": authCheck['VHR158'],
        "editDrugRule": authCheck['DRR165'],
        "addDentalMask": authCheck['ADR140'],
        "addVisionMask": authCheck['VIR147'],
        "addHealthMask": authCheck['AHR154'],
        "addDrugMask": authCheck['DRL161'],
        "editDentalMask": authCheck['NDM141'],
        "editVisionMask": authCheck['VIM148'],
        "editHealthMask": authCheck['AHM155'],
        "editDrugMask": authCheck['DRM162'],
        "deleteDentalMask": authCheck['NDM142'],
        "deleteVisionMask": authCheck['VIM149'],
        "deleteHealthMask": authCheck['AHM156'],
        "deleteDrugMask": authCheck['DRM163'],
      }]
    }
    return this.rulesAuthCheck
  }

  /**
   * initialize new Unit object
   */
  enableAddMask() {
    this.MaskAddMode = true;
    this.selectedMask = {};
    this.MaskEditMode = false;
  }

  addNewRule() {
    this.submitted = true;
    if (this.addEditRuleForm.valid) {
      var rulesObj = {
        "disciplineKey": parseInt(this.disciplineKey),     
        "ruleTypeKey": this.selectedRuleKey,
        "ruleExecutionPointKey": this.selectedRuleExecPointKey,
        "ruleExecutionOrderKey": this.selectedRuleExecOrderKey,
        "rulePlanInd": (this.addEditRuleForm.value.plan_rule == true) ? 'T' : 'F',
        "ruleStatusInd": (this.addEditRuleForm.value.rule_status == true) ? 'T' : 'F',
        "ruleTxt": this.addEditRuleForm.value.script,
        "ruleDescCom": this.addEditRuleForm.value.description,
        "ruleProcMaskDto": this.MaskList
      }
      this.showLoader = true;
      this.hmsDataServiceService.postApi(RulesApi.addRuleUrl,
        rulesObj).subscribe(data => {
          if (data.code == 200) {
            this.showLoader = false;            
            this.toastr.success(this.translate.instant('rules.addEditViewRule.ruleAddedSuccessfully'));
          }
          else {
            this.showLoader = false;
            this.toastr.error(this.translate.instant('rules.addEditViewRule.someErrorOccured'));
          }
          this.addMode = false;
          this.viewMode = true;
          this.editMode = false;
          this.addEditRuleForm.disable();
          this.ruleKey = data.result.ruleKey;
          this.rulesService.backToSearchBtn = false;
          this.router.navigate(['/rules/view/' + data.result.ruleKey + '/diciplineKey/' + this.disciplineKey]);
        });

    } else {
      this.validateAllFormFields(this.addEditRuleForm);
    }
  }

  updateRule() {
    this.route.params.subscribe(params => {
      this.ruleKeyUrl = params.ruleKey;
    });
    if (this.addEditRuleForm.valid) {
      var rulesObj = {
        "ruleKey": this.ruleKeyUrl, //Extra
        "ruleTypeKey": this.selectedRuleKey ? this.selectedRuleKey : this.savedRuleTypeKey,
        "disciplineKey": parseInt(this.disciplineKey),
        "ruleId": this.addEditRuleForm.value.rule_id,
        "ruleExecutionPointKey": this.selectedRuleExecPointKey ? this.selectedRuleExecPointKey : this.savedRuleExecPointKey,
        "ruleExecutionOrderKey": this.selectedRuleExecOrderKey ? this.selectedRuleExecOrderKey : this.savedRuleExecOrderKey,
        "rulePlanInd": (this.addEditRuleForm.value.plan_rule == true) ? 'T' : 'F',
        "ruleStatusInd": (this.addEditRuleForm.value.rule_status == true) ? 'T' : 'F',
        "ruleTxt": this.addEditRuleForm.value.script,
        "ruleDescCom": this.addEditRuleForm.value.description,
        "ruleProcMaskDto": this.MaskList
      }
      this.hmsDataServiceService.postApi(RulesApi.addRuleUrl,
        rulesObj).subscribe(data => {
          if (data.code == 200) {
            this.toastr.success(this.translate.instant('rules.addEditViewRule.ruleUpdatedSuccessfully'));
          }
          else {
            this.toastr.error(this.translate.instant('rules.addEditViewRule.someErrorOccured'));
          }
          this.addMode = false;
          this.viewMode = true;
          this.editMode = false;
          this.addEditRuleForm.disable();
          this.ruleKey = data.result.ruleKey;
          this.rulesService.backToSearchBtn = false;
          this.router.navigate(['/rules/view/' + data.result.ruleKey + '/diciplineKey/' + this.disciplineKey]);
        });

    } else {
      this.validateAllFormFields(this.addEditRuleForm);
    }
  }

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

  /** Add new Mask from Mask list */
  addNewMask(newRecord) {
    this.new_mask_id.markAsTouched();
    if (this.new_mask_id.invalid) {
      return;
    }
    var newMaskData = {
      ruleProcMaskCd: this.new_mask_id.value
    }
    this.MaskList.unshift(newMaskData);
    this.resetNewMaskRow();   
  }

  validateNewMaskId(event) {
    if (this.new_mask_id.valid) {
      for (var i in this.MaskList) {
        if (event.target.value == this.MaskList[i].ruleProcMaskCd) {
          this.new_mask_id.setErrors({
            "alreadyExist": true
          });
          return;
        }
      }
    }
  }

  validateOldMaskId(oldMaskID) {
    if (this.old_mask_id.valid && oldMaskID != this.selectedMask['ruleProcMaskCd']) {
      for (var i in this.MaskList) {
        if (this.selectedMask['ruleProcMaskCd'] == this.MaskList[i].ruleProcMaskCd) {
          this.old_mask_id.setErrors({
            "alreadyExist": true
          });
          return;
        }
      }
    }
  }

  resetNewMaskRow() {
    this.MaskAddMode = false;
    this.new_mask_id.reset();
  }

  /** Edit Unit */
  enableEditMask(rowData, rowIndex): void {
    this.resetNewMaskRow();
    this.MaskEditMode = true;
    let copy = Object.assign({}, rowData);
    this.selectedMask = copy;
    this.selectedMask['rowIndex'] = rowIndex;
    this.selectedMask['ruleProcMaskCd'] = rowData;
  };

  /** Update Unit */
  updateMask(index) {
    if (this.old_mask_id.invalid) {
      return;
    }
    var rowData = {
      ruleProcMaskCd: this.old_mask_id.value
    }
    let copy = Object.assign({}, rowData);
    this.MaskList[index] = copy;
    this.resetMaskInfo();
  }

  /** reset Unit form */
  resetMaskInfo() {
    this.old_mask_id.reset();
    this.selectedMask = {};
    this.MaskEditMode = false;
  }

  /**
   * Delete record from list
   */
  deleteMask(index) {
    this.exDialog.openConfirm(this.translate.instant('rules.addEditViewRule.deleteConfirmation')).subscribe((value) => {
      if (value) {
        this.MaskList.splice(index, 1);
      }
    });
  }

  getProviderRuleExecutionPointList() {
    var namePrefixURL = RulesApi.getProviderRuleExecutionPointList;
    this.hmsDataServiceService.getApi(namePrefixURL).subscribe(data => {
      this.rulesExecPoint = data.result;
      this.rulesExecPointData = this.completerService.local(
        this.rulesExecPoint,
        "ruleExecPointDesc",
        "ruleExecPointDesc"
      );
    });
  }
  getProviderRuleTypeList() {
    var namePrefixURL = RulesApi.getProviderRuleTypeList;
    this.hmsDataServiceService.getApi(namePrefixURL).subscribe(data => {
      this.rulesTypeMaster = data.result;
      this.ruleTypeData = this.completerService.local(
        this.rulesTypeMaster,
        "ruleTypeDesc",
        "ruleTypeDesc"
      );
    });
  }

  getProviderRuleExecutionOrderList() {
    var namePrefixURL = RulesApi.getProviderRuleExecutionOrderList;
    this.hmsDataServiceService.getApi(namePrefixURL).subscribe(data => {
      this.rulesExecOrder = data.result;
      this.rulesExecOrderData = this.completerService.local(
        this.rulesExecOrder,
        "ruleExecOrderDesc",
        "ruleExecOrderDesc"
      );
    });
  }

  onRuleTypeSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedRuleKey = selected.originalObject.ruleTypeKey;
      this.selectedRuleDesc = selected.originalObject.ruleTypeDesc;
    }
  }

  onRuleExecPointSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedRuleExecPointKey = selected.originalObject.ruleExecPointKey;
      this.selectedRuleExecPointDesc = selected.originalObject.ruleExecPointDesc;
    }
  }

  onRuleExecOrderSelected(selected: CompleterItem) {
    if (selected) {
      this.selectedRuleExecOrderKey = selected.originalObject.ruleExecOrderKey;
      this.selectedRuleExecOrderDesc = selected.originalObject.ruleExecOrderDesc;
    }
  }

  editRule() {
    this.addMode = false
    this.viewMode = false
    this.editMode = true
    this.addEditRuleForm.enable();
    this.addEditRuleForm.controls['rule_id'].disable();
  }

  /** Function For Jump to Previous Page */
  goBack() {
    this.location.back();
  }
  
  canDeactivate() {
    if (!this.submitted && this.FormGroup.dirty) {
      if(confirm(this.translate.instant("common.pageChangeConfirmation"))){
        if(this.currentUserService.newTabRouterLink != undefined && this.currentUserService.newTabRouterLink != '' && this.router.url != this.currentUserService.newTabRouterLink){
          window.open(this.currentUserService.newTabRouterLink);
          this.currentUserService.setRouterLink('');
          return false;
        }else{
          return true;
        }
      }else{
        return false;
      }
    }
    return true;
  }

  public isOpen: boolean = false;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  backToSearch(){
    this.rulesService.isBackRuleSearch = false
    this.rulesService.ruleBackToSerchBtn = true
    this.rulesService.backToSearchBtn = false
  }

}