import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { ToastrService } from 'ngx-toastr';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardApi } from '../../card-module/card-api'
import { CompanyApi } from '../../company-module/company-api';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { UftApi } from '../../unit-financial-transaction-module/uft-api';
import { PlanApi } from '../../company-module/plan/plan-api';
import { FeeGuideApi } from "../../fee-guide-module/fee-guide-api";
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';

@Component({
  selector: 'app-uscls',
  templateUrl: './uscls.component.html',
  styleUrls: ['./uscls.component.css'],
  providers: [
    DatatableService,
    ChangeDateFormatService,
    HmsDataServiceService,
    ExDialog,
    ToastrService,
    TranslateService
  ],
})

export class UsclsComponent implements OnInit {
  usclsFormGroup: FormGroup;
  usclsFormGroupStep2: FormGroup;
  myDatePickerPlaceholder;
  parentKey
  dropdownSettings: any = {}
  planList = []
  plan = [];
  selectedplan: any = [];
  selectedCovCat: any = [];
  plans: any = [];
  businessTypeList: any = [];
  companyDataRemote: any;
  currentUser: any;
  mainPlanArray: any = [];
  selectedCompany: any;
  selectedCompanyName: any;
  selecteCoKey: any;
  selecteCoID: any;
  covcatList = [];
  covCat = "";
  title: any;
  addMode: boolean = true;
  nullAddMode: boolean = false;
  parentServiceId
  dentalParentServiceDataRemote: RemoteData;
  public coverageCategoryDataRemote: RemoteData;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public ProcedureParentServiceDataRemote: RemoteData;
  selectedCombineMax: {};
  DentalCombineMaxEditMode: boolean;
  DentalCombineMaxAddMode: boolean;
  ServiceId: any = '';
  serviceKey: any;
  shortDesc: any;
  dateNameArray: any = {};
  serviceCode: FormControl;
  parentService: FormControl;
  procCode: FormControl
  effective_date: FormControl;
  expiry_date: FormControl;
  CovCatList: any = [];
  expired: boolean;
  procedureKey: any;
  showLoader: boolean;
  covKey: any;
  dropdownSetting: { singleSelection: boolean; text: string; selectAllText: string; unSelectAllText: string; badgeShowLimit: boolean; enableSearchFilter: boolean; classes: string; };
  CovCd: any;

  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    public currentUserService: CurrentUserService,
    private completerService: CompleterService,
    private changeDateFormatService: ChangeDateFormatService,
    private ToastrService: ToastrService,
    private translate: TranslateService,
  ) {
    this.dentalParentServiceDataRemote = completerService.remote(
      null,
      "dentalServiceDesc,dentalServiceId",
      "mergedDescription"
    );
    this.dentalParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });

    this.dentalParentServiceDataRemote.urlFormater((term: any) => {
      return FeeGuideApi.getDentalPredectiveParentService + `/${term}`;
    });
    this.dentalParentServiceDataRemote.dataField('result');

    this.ProcedureParentServiceDataRemote = completerService.remote(
      null,
      "key,cd",
      "cd"
    );
    this.ProcedureParentServiceDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.ProcedureParentServiceDataRemote.urlFormater((term: any) => {
      return PlanApi.getProcedurePredectiveProcId + `/${term}`;
    });
    this.ProcedureParentServiceDataRemote.dataField('result');

    this.coverageCategoryDataRemote = completerService.remote(
      "dentCovCatCd",
      "dentCovCatDescription",
      "dentCovCatDescription",
    );
    this.coverageCategoryDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.coverageCategoryDataRemote.urlFormater((term: any) => {
      if (term) {
        return FeeGuideApi.getDentalPredectiveCovCat + `/${term}`;
      }
    });
    this.coverageCategoryDataRemote.dataField('result');
  }

  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      badgeShowLimit: true,
      enableSearchFilter: true,
      classes: "myclass custom-class usclsplan"
    };

    this.dropdownSetting = {
      singleSelection: false,
      text: "Select",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      badgeShowLimit: true,
      enableSearchFilter: true,
      classes: "myclass custom-class usclscovcat"
    };

    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.getPredictiveCompanySearchData(this.completerService);
        let checkArray = this.currentUserService.authChecks['VPL'].concat(this.currentUserService.authChecks['APC'], this.currentUserService.authChecks['TCV'])
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        this.getPredictiveCompanySearchData(this.completerService);
        let checkArray = this.currentUserService.authChecks['VPL'].concat(this.currentUserService.authChecks['APC'], this.currentUserService.authChecks['TCV'])
        this.getAuthCheck(checkArray)
      })
    }
    this.serviceCode = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.number]);
    this.procCode = new FormControl('', [Validators.required, Validators.maxLength(9), CustomValidators.number]);
    this.effective_date = new FormControl('', [Validators.required]);
    this.expiry_date = new FormControl('', [Validators.required]);

    this.usclsFormGroup = new FormGroup({
      'usclsEffectiveDate': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]),
      'proc_code': new FormControl('', [Validators.required]),
      'lookUpProc_code': new FormControl('', [Validators.required]),
      'reviewInd': new FormControl(''),
      'qcInd': new FormControl(''),
      'hreInd': new FormControl(''),
    });

    this.usclsFormGroupStep2 = new FormGroup({
      'usclsEffectiveDate': new FormControl('', [Validators.required]),
      'lookUpProc_code': new FormControl(''),
      'approvalInd': new FormControl(''),
      'reviewInd': new FormControl(''),
      'qcInd': new FormControl(''),
      'hreInd': new FormControl(''),
      'serviceCode': new FormControl('', [Validators.required]),
      'covCat': new FormControl('', [Validators.required]),
    });
    this.getBusinessType()
    this.getCovCatList();
  }

  getPlanByCompanyCokey(value) {
    let requiredInfo = {
      "coKey": value
    }
    this.hmsDataServiceService.postApi(CardApi.getCompanyPlanUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let arr = []
        this.plans = data.result
        for (var ii = 0; ii < this.plans.length; ii++) {
          arr.push({ 'id': this.plans[ii].unitKey, 'itemName': this.plans[ii].plansName.replace('/null', ''), 'divDetail': this.plans[ii].plansId })

        }
        this.planList = arr
      } else {
        this.plans = [];
        this.planList = []
      }
      error => { }
    })
  }

  /**
   * Get selected multi select list
   * @param item 
   */
  onSelectplanMultiDropDown(item: any, type) {
    this.selectedplan = [];
    for (var j = 0; j < this.plan.length; j++) {
      this.selectedplan.push({ 'id': this.plan[j]['id'], 'itemName': this.plan[j]['itemName'], "divDetail": this.plan[j]['divDetail'] })
    }
    this.usclsFormGroupStep2.controls[type].setValue(this.selectedCovCat);
  }

  onDeSelectplanMultiDropDown(item: any, type) {
    this.selectedplan = []
    if (this.plan.length > 0) {
      for (var j = 0; j < this.plan.length; j++) {
        this.selectedplan.push({ 'id': this.plan[j]['id'], 'itemName': this.plan[j]['itemName'], "divDetail": this.plan[j]['divDetail'] })
      }
    } else {
      this.usclsFormGroupStep2.controls[type].setValue('')
    }
  }

  onSelectAllplanMultiDropDown(items: any, type) {
    this.selectedCovCat = []
    for (var j = 0; j < this.plan.length; j++) {
      this.selectedplan.push({ 'id': this.plan[j]['id'], 'itemName': this.plan[j]['itemName'], "divDetail": this.plan[j]['divDetail'] })
    }
    this.usclsFormGroupStep2.controls[type].setValue(this.selectedCovCat);
  }

  onDeSelectplanAllMultiDropDown(event, type) {
    this.selectedplan = []
  }

  getBusinessType() {
    var URL = CompanyApi.getBusinessTypeUrl;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200) {
        this.businessTypeList.push({ "businessTypeDesc": "" });
        data.result.forEach(element => { this.businessTypeList.push(element); });
      }
    });
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

  getAuthCheck(claimChecks) {
    let authCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.mainPlanArray = [{
        "copyDivision": 'T',
        "planComments": 'T',
        "addPlanComment": 'T',
        "editPlan": 'T',
        "terminateCoverage": 'T',
        "addTerminateCoverage": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.mainPlanArray = [{
        "copyDivision": authCheck['VPL98'],
        "planComments": authCheck['VPL99'],
        "addPlanComment": authCheck['APC100'],
        "editPlan": authCheck['VPL101'],
        "terminateCoverage": authCheck['VPL102'],
        "addTerminateCoverage": authCheck['TCO104']
      }]
    }
    return this.mainPlanArray
  }

  /**
 * Call on select the company name in predictive search
 * @param selected 
 */
  onCompanyNameSelected(selected: CompleterItem) {
    this.planList = [];
    this.plan = []
    if (selected) {
      this.selectedCompany = selected.originalObject;
      this.selectedCompanyName = selected.originalObject.coName
      this.selecteCoKey = selected.originalObject.coKey
      this.selecteCoID = selected.originalObject.coId;
      this.getPlanByCompanyCokey(this.selecteCoKey)
    } else {
      this.selectedCompanyName = ""
      this.selecteCoKey = ''
      this.selecteCoID = ''
    }

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
          this.selectedCompanyName = splitCompanyName[0]
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

  getCovCatList() {
    var URL = PlanApi.getDentalCoverageCategoryList;
    this.hmsDataServiceService.getApi(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let arr = [];
        let covCategoryArray = []
        let removeDentalCovCategory = ["Endodontic", "Endoperio", "Exclusions", "Majorrestorative", "Periodontalscaling", "Periodontic", "Prosthodontic", "Scale", "Temporomandibular Joint"];
        for (var i in data.result) {
          let editIndex = removeDentalCovCategory.findIndex(x => x === data.result[i].covCatDesc);
          if (editIndex == -1) {
            covCategoryArray.push(data.result[i]);
          }
        }
        for (var ii = 0; ii < covCategoryArray.length; ii++) {
          arr.push({ 'id': covCategoryArray[ii].covCatKey, 'itemName': covCategoryArray[ii].covCatDesc })
        }
        this.covcatList = arr
      }
    });
  }

  /**
  * Empty the dropdown value
  * @param items 
  * @param type 
  */
  onDeSelectAllMultiDropDown(items: any, type) {
    this.selectedCovCat = []
  }

  Add(title) {
    this.title = title;
    this.addMode = true;
  }

  enableAddMode() {
    this.nullAddMode = true
    this.selectedCombineMax = {};
    this.DentalCombineMaxEditMode = false;
    this.DentalCombineMaxAddMode = true;
  }

  // Method of angular2-multiselect Dropdown for Select the values  
  onSelect(selected: CompleterItem, type) {
    if (selected && type == 'parentServiceId') {
      this.usclsFormGroupStep2.controls.serviceCode.setErrors(null)
      this.ServiceId = selected.originalObject.dentalServiceId;
      this.serviceKey = selected.originalObject.dentalServiceKey;
      this.shortDesc = selected.originalObject.dentalServiceDesc;
    }
    if (selected && type == 'coverageCategory') {
      this.CovCd = selected.originalObject.dentCovCatCd;
    }
  }

  //Bind date with control 
  setControlDate(frmControlName, obj) {
    this.dateNameArray[frmControlName] = {
      year: obj.date.year,
      month: obj.date.month,
      day: obj.date.day
    };
  }

  changeFilterDateFormat(event, frmControlName, selDate, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      this.setControlDate(selDate, validDate);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      this.setControlDate(selDate, obj);
    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      return;
    }
  }

  addNewDentalCombineMax() {
    this.nullAddMode = true
    this.DentalCombineMaxAddMode = false;
    var rowData = {
      expiry_date: this.expiry_date.value.formatted,
      effective_date: this.effective_date.value.formatted,
      procCode: this.procCode.value,
      serviceCode: this.serviceCode.value,
    }
    this.CovCatList.push(rowData);
    this.resetFeilds();
  }

  resetFeilds() {
    this.expiry_date.reset();
    this.effective_date.reset();
    this.procCode.reset();
    this.serviceCode.reset();
  }

  resetNewCombineMaxRow() {
    this.DentalCombineMaxAddMode = false;
    this.nullAddMode = false;
  }

  changeDateFormat(event, frmControlName, formName, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;

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
    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      obj = null
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
    }

    if (event.reason == 2) {
      this[formName].patchValue(datePickerValue);
    }
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      this.expired = this.changeDateFormatService.isFutureNonFormatDate(obj.date.day + "/" + obj.date.month + "/" + obj.date.year);
    }
    else if (event.reason == 1 && event.value != null && event.value != '') {
      this.expired = this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  onSelectPro(selected: CompleterItem, type) {
    if (selected && type == 'parentKey') {
      this.procedureKey = selected.originalObject.key;
    }
  }

  next() {
    if (this.usclsFormGroup.valid) {
      let excludeInd = 'F';
      let covServAssgnKey = '';

      let CarryFrwdyrsDivisionEffective = this.usclsFormGroup.value.usclsEffectiveDate;
      let startdateCarry = CarryFrwdyrsDivisionEffective ? (this.changeDateFormatService.convertDateObjectToString(CarryFrwdyrsDivisionEffective)) : '';

      let serviceData = {
        "procId": this.usclsFormGroup.value.proc_code,
        "procIdLookup": this.procedureKey,
        "EffectiveDate": startdateCarry,
        "hreInd": this.usclsFormGroup.value.hreInd ? "T" : 'F',
        "qcInd": this.usclsFormGroup.value.qcInd ? "T" : 'F',
        "revInd": this.usclsFormGroup.value.reviewInd ? "T" : 'F',
      }
      let URL = PlanApi.usclsGuideProcCode;
      this.showLoader = true;
      this.hmsDataServiceService.postApi(URL, serviceData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.ToastrService.success(this.translate.instant('serviceCovered.added'));
          this.showLoader = false;
          this.resetPlanCommentForm()
        }
        else {
          this.ToastrService.error(this.translate.instant('serviceCovered.error'));
          this.showLoader = false;
        }
      }, (e) => {
        this.showLoader = false;
        this.resetPlanCommentForm();
      })
    } else {
      this.validateAllFormFields(this.usclsFormGroup);
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
  }

  resetPlanCommentForm() {
    this.usclsFormGroup.reset();
    this.usclsFormGroupStep2.reset()
    this.plan = [];
    this.covCat = ""
    this.CovCatList = []
    this.selectedCovCat = []
  }

  submitUslcs() {
    if (this.parentServiceId) {
      this.usclsFormGroupStep2.controls.serviceCode.setErrors(null)
    } else {
      this.usclsFormGroupStep2.controls.serviceCode.setErrors({ required: true })
    }
    if (this.usclsFormGroupStep2.valid) {
      var URL = PlanApi.usclsGuideServiceCode;
      let CarryFrwdyrsDivisionEffective = this.usclsFormGroupStep2.value.usclsEffectiveDate;
      let startdateCarry = CarryFrwdyrsDivisionEffective ? (this.changeDateFormatService.convertDateObjectToString(CarryFrwdyrsDivisionEffective)) : '';
      let DataJson = {
        "procId": "-1",
        "procIdLookup": "-1",
        "EffectiveDate": startdateCarry,
        "hreInd": this.usclsFormGroupStep2.value.hreInd ? "T" : 'F',
        "qcInd": this.usclsFormGroupStep2.value.qcInd ? "T" : 'F',
        "approvalInd": this.usclsFormGroupStep2.value.approvalInd ? "T" : 'F',
        "revInd": this.usclsFormGroupStep2.value.reviewInd ? "T" : 'F',
        "serviceId": this.ServiceId,
        "covCatCd": this.CovCd
      }
      this.hmsDataServiceService.postApi(URL, DataJson).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.ToastrService.success("Data Added Successfully")
          this.resetuslcForms()
        }
        else {
          this.ToastrService.error("Something Went Wrong Please Try Again");
          this.resetuslcForms()
        }
      })
    } else {
      this.validateAllFormFields(this.usclsFormGroupStep2)
    }
  }

  resetuslcForms() {
    $('#closeUslc').trigger('click');
    this.parentServiceId = ""
    this.usclsFormGroupStep2.reset();
    this.usclsFormGroup.reset();
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
}