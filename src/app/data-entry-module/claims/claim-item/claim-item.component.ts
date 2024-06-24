import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, NgForm, Validators } from '@angular/forms';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { CommonApi } from '../../../common-module/common-api';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DataEntryApi } from './../../data-entry-api';
import { DataEntryService } from '../../data-entry.service';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CardApi } from '../../../card-module/card-api';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../../common-module/shared-services/datatable.service'
import { Subject } from 'rxjs/Rx';
import { FindValueSubscriber } from '../../../../../node_modules/rxjs/operators/find';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';
import { FormControlName } from '@angular/forms/src/directives/reactive_directives/form_control_name';
import { Constants } from '../../../common-module/Constants';
import { ValueTransformer } from '@angular/compiler/src/util';
import { ClaimsComponent } from '../claims.component';
import { concatAll } from 'rxjs/operator/concatAll';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { any } from 'underscore';
import { DataTableRowWrapperComponent } from '@swimlane/ngx-datatable';
import { id } from '@swimlane/ngx-datatable/release/utils';


@Component({
  selector: 'app-claim-item',
  templateUrl: './claim-item.component.html',
  styleUrls: ['./claim-item.component.css'],
})
export class ClaimItemComponent {
  showLoader = false;
  feeClaimedAmount
  editStatusPatchValue: any;
  selectedServiceCode: any;
  selectedProcDesc: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;//datepicker Options
  @Input() ClaimItemBelowFormGroup: FormGroup;
  @Input() EditClaimantAddressForm: FormGroup;
  @Input() ClaimInformationFormGroup: FormGroup;  //#1264 
  @Input() addMode: boolean;
  @Input() editMode: boolean;
  @Input() viewMode: boolean;
  @Input() disableSaveButton: any
  @Input() copyMode: boolean;
  @Input() claimItemCheck: any
  addModeSet:boolean
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  error: any;
  claimNo;
  TNECount: string = "";
  TCount;
  ECount;
  feeModifier1 = [];
  feeModifier2 = [];
  feeModifierOptional1 = [];
  savedMandatoryClaimNumber;
  arrAction = []
  arrServiceCode = []
  skillCode = []
  toothCodeDetails = []
  toothSurfacesDetails = []
  payToDetails = []
  referringULIDetails = []
  feeModifier1Details = []
  feeModifier2Details = []
  SkillCodeDetails = []
  GoodFaithDetails = []
  FunctionCentreDetails = []
  arrFeeModifier1 = []
  arrOptionalFeeModifier1 = []
  arrEncounterNumber = []
  arrIntercept = []
  arrPaperInfo = []
  arrReferral = []
  arrConfidential = []
  arrEmsaf = []
  arrDiagnosticSecondary = []
  arrDignosticTeritary = []
  arrStatus = []
  itemDetails = []
  goodFaithDto:any ={};
  userId;
  newClaimItems = [];
  FunctionCentreDetails1: CompleterData
  public isOpen: boolean = false;
  isFromPHc: boolean = false;
  idsDate;
  claimItemDate: any = '';
  notClaimItemSaveMode: boolean = true;
  digitCodeArray = [];
  forHideBelowForm: boolean = false;
  arrStatusVal: boolean = false;
  claimItemStatusVal: any;
  onReassessClick: boolean = false;
  encounterNumValue: string;
  editDisable: boolean = false;
  cancelDisable : boolean = false;
  isReaccessDisable: boolean = false;
  ViewEditInfo: boolean = false;
  row_index: any;
  reaccessBtnStatus: any;
  actionValue: any;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  arrClaimItems = []
  /* declare array and variables for #1264 (start) */ 
  arrNewClaimItems = []; 
  rowVisible: boolean = false;     
  forAddNewClaimDisable : boolean =false
  forValidation : boolean = false
  forEmptyDate : boolean =false
  forPayTo = any;
  forClaimSave : boolean = false
  showErrorMsg : boolean = false
  /* for #1264(end) */ 
  newClaimItemopened : boolean = false
  btnText = "Save";
  claimKey
  dignosticPrimaryVal = "";
  /* data array for grid  */



  arrFeeModifier2 = [];

  showClaimItemBelowForm = true;//show-hide all forms below Claim-Items
  /* New Empty Record array */
  newRecordValidate: boolean = false;

  feeMode1
  feeMode2
  idx
  disableAdd = false
  payToSectionHide = false   //#1264
  disableReasses = false
  disableSave = false
  // create new array for Log #1264
  arrMandatorySection= {
    "claim": "",
    "serviceDate": "",
    "serviceCode": "",
    "refUlI": "",
    "dignosticPrimary": "",
    "feeClaimedAmount": "",
    "timeUnits" : "",
    "functCentre": "",
    "skillCode": "",
    "feeModifier1": "",
    "feeModifier2": "",
    "feeModifierOptional1": "",
    "encounterNumber": "",
    "paidAmount" : ""
  }
  arrNewClaimItem = {
    "id": "", "claim": "", "status": "", "statusText": "", "serviceDate": "", "serviceCode": "", "refUlI": "", "feeModel1": "",
    "feeModel1text": "", "feeModel2": "", "feeModel2text": "", "skillCode": "", "functCentre": "", "dignosticPrimary": "", "claimAmount": "", "paidAmount": "",
    "feeClaimedAmount": "","timeUnits" : "","feeModifier1": "","feeModifier2": "","feeModifierOptional1":"","encounterNumber":"","action":""
  };
  selectedRowId = '';
  oldServiceCode = ''
  hideBelowForm: boolean = true
  claimViewMode: boolean = false
  claimEditMode: boolean = false
  claimAddMode: boolean = true
  claimItemKey
  disableClaimantAddress: boolean = true
  public feeModifierRemoteLower: RemoteData;
  public dentistULIRemote: RemoteData;
  public serviceCodeRemote: RemoteData;
  patientHcVal = ""
  disciplineKey;

  claimantKey = "" /* old static code commented for Log #1092) */
  disableRefrULI: Boolean = true

  arrItems: CompleterData

  dropdownSettings = {}
  selectedSkillCodeVal = "";
  selectedFuncCentreVal = ""

  loaderHeight = 200
  itemStart = 0
  SkillCodeDetails1: CompleterData;
  functCentre
  getExplanatoryCodeListObject = [];
  showMessage: string;
  isSave: boolean = false;
  isEdit:boolean = false;     //#1264
  claimItemPaymentKey;
  public dignosticCodeRemote: RemoteData;
  selectedDiagnosticCode;
  feeModifierList: CompleterData
  feeModifier2List: CompleterData
  feeModifier3List: CompleterData
  batchStatusCheck;
  batchStatusSubmitted: boolean = false;
  digitCode: number
  rowData: any
  claimItemSubmitted: boolean = false;
  isClaimSubmitted: boolean = false
  isReassessFormDisabled: boolean = false
  claimItemStatus: any
  isReassessed: boolean = false
  /*start for #1264*/
  forSave: boolean = false
  isEnable: boolean = false
  addClaimtoBatch : boolean = false
  timeUnitsVal
  encounterNumberVal
  doTrigger: number; 
  forTimeUnitsVal: boolean = false;
  cancelClaimItem: boolean = false;
  viewModes : boolean = true
  hideOptionalForms: boolean = true
  /*end for #1264*/

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private dataEntryService: DataEntryService,
    private completerService: CompleterService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private claimsComponent: ClaimsComponent,
    private _hotkeysService: HotkeysService,
    private currentUserService: CurrentUserService
  ) {
    this.doTrigger = 1
    this.error = { isError: false, errorMessage: '' };

    this._hotkeysService.add(new Hotkey('shift+d', (event: KeyboardEvent): boolean => {
      if (this.notClaimItemSaveMode && claimsComponent.DataEntryClaimFormGroup.valid) {
        this.AddNew(0)
      }
      return false; // Prevent bubbling
    }));

    this._hotkeysService.add(new Hotkey('shift+ctrl+g', (event: KeyboardEvent): boolean => {
      this.router.navigate(['dataEntry/claims']);
      return false; // Prevent bubbling
    }));

    dataEntryService.emitPatientHC.subscribe(value => {
      this.patientHcVal = value
    })

    dataEntryService.emitDisciplineKey.subscribe(value => {
      this.disciplineKey = value
      this.getSkillCode(this.disciplineKey);
      this.getFeeModifiers(this.disciplineKey)
    })

    dataEntryService.emitEditStatusValue.subscribe(data => {
      this.editStatusPatchValue = data;
      this.editStatusValue();
    })

    dataEntryService.emitClaimantAddressBtnStatus.subscribe(value => {
      this.disableClaimantAddress = value
    })

    dataEntryService.emitActionField.subscribe(value => {
     this.actionValue = value
    })

    // Log #1111
    this.dataEntryService.batchStatus.subscribe(val => {
      this.batchStatusCheck = val
      this.getMandatoryOptionalFields()
    })

    this.dentistULIRemote = completerService.remote(
      null,
      "providerUli",
      "providerUli"
    );
    this.dentistULIRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dentistULIRemote.urlFormater((term: any) => {
      return DataEntryApi.predictiveDentistULISearch + `/${term}`;
    });
    this.dentistULIRemote.dataField('result');

    this.serviceCodeRemote = completerService.remote(
      null,
      "serviceCode",
      "serviceCode"
    );
    this.serviceCodeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.serviceCodeRemote.urlFormater((term: any) => {
      return DataEntryApi.getServiceCode + `/${term}`;
    });
    this.serviceCodeRemote.dataField('result');

    this.dataEntryService.isFromPHc.subscribe(data => {
      this.isFromPHc = data;
    })

    this.dataEntryService.emitDate.subscribe(data => {   // general servicedate validations toaster popup fixed 
      this.idsDate = data;
    })
    this.getDignosticRemoteData();

    this.dataEntryService.reaccessBtnStatus.subscribe(data => {
      this.reaccessBtnStatus = data;
      this.editDisable = this.reaccessBtnStatus 
      if(this.editDisable == false){	
        this.reaccessClaim();	
      }	
    })

  }

  ngOnInit() {
    this.ClaimItemBelowFormGroup = new FormGroup({
      claimNumber: new FormControl('', [Validators.required]),
      claimStatus: new FormControl('', [Validators.required]),
      action: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      serviceCode: new FormControl('', [Validators.required]),
      toothCode: new FormControl(''),
      toothSurfaces: new FormControl(''),
      timeUnits: new FormControl('', [Validators.maxLength(3)]),
      payTo: new FormControl('', [Validators.required]),
      referring: new FormControl(''),
      feeModifier1: new FormControl(''),
      feeModifier2: new FormControl(''),
      skillCode: new FormControl(''),
      functCentre: new FormControl(''),
      goodFaith: new FormControl(''),
      dignosticPrimary: new FormControl(''),
      feeClaimedAmount: new FormControl('', [CustomValidators.twoPlacesAfterDecimal,Validators.maxLength(5)]),
      feeModifierOptional1: new FormControl(''),
      encounterNumber: new FormControl(''),
      locumBusNumber: new FormControl('', [Validators.maxLength(7)]),//QA requirement(Issue while saving Batch)
      location: new FormControl('', [Validators.maxLength(4)]),
      recovery: new FormControl('', [Validators.maxLength(2)]),
      intercept: new FormControl(''),
      paperInfo: new FormControl(''),
      referral: new FormControl(''),
      confidential: new FormControl(''),
      emsaf: new FormControl(''),
      dignosticSecondary: new FormControl(''),
      dignosticTeritary: new FormControl(''),
      text: new FormControl(''),
      claimNumberPayment: new FormControl(''),
      reassessment: new FormControl(''),
      assessment: new FormControl(''),
      refNumber: new FormControl(''),
      expPaymentDate: new FormControl(''),
      assessmentDate: new FormControl(''),
      explanationCodes: new FormControl(''),
      status: new FormControl(''),
      feeModifiers: new FormControl(''),
      frReferenceNumber: new FormControl(''),
      paidAmount: new FormControl('',[Validators.maxLength(5)]),
      editStatus: new FormControl(''),
      explanationCode: new FormControl('', [Validators.maxLength(4)]),
      comment: new FormControl(''),
      serviceRecpRegNo: new FormControl('', [Validators.maxLength(12), CustomValidators.onlyNumbers]) // #1128: minlength check and maxlength(html) check removed as per client new feedback
    });

    this.EditClaimantAddressForm = new FormGroup({
      phn: new FormControl('', [Validators.minLength(4), Validators.maxLength(12)]),
      firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      middleName: new FormControl('', [, Validators.maxLength(50)]),
      lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      dob: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      addressLine1: new FormControl('', [Validators.maxLength(50)]),
      addressLine2: new FormControl('', [Validators.maxLength(50)]),
      postalCode: new FormControl('', [Validators.maxLength(7)]),
      city: new FormControl(''),
      province: new FormControl(''),
      country: new FormControl('')
    });

    this.ClaimItemBelowFormGroup.patchValue({ 'action': 'A' });
    this.getActionList();
    this.getToothCode()
    this.getPayTo();
    this.getFunctionCentre();
    this.getStatus();
    this.getIntercept();
    this.getDiagnosticSecondary();
    this.getDignosticTeritary();
    this.getFeeModifier()
    this.route.params.subscribe((params: Params) => {
      if (this.route.snapshot.url[1]) {
        if (this.route.snapshot.url[1].path == "view") {
          this.claimKey = params['id']
          this.getClaimItems(true);
          this.claimViewMode = true
          this.disableAdd = true
          this.payToSectionHide = true
          this.claimAddMode = false
          this.editDisable = true
          this.cancelDisable = true
          this.viewModes = false 
          this.ViewEditInfo = true
        }
        if (this.route.snapshot.url[1].path == "copy") {
          this.route.params.subscribe((params: Params) => {
            this.claimKey = params['copyKey']
            this.copyMode = true
            this.getClaimItems(true);
          })
        }
      } else {
        this.ClaimItemBelowFormGroup.patchValue({ 'claimStatus': 'U' })
        this.ClaimItemBelowFormGroup.patchValue({ 'payTo': 'BAPY' })  // Log #1126: Client feedback
        this.payToSectionHide = false
      }

    }
    )
    this.hideBelowForm = true
    if(!this.addMode) {
    this.hideBelowForm = false
    this.ClaimItemBelowFormGroup.disable();
    }
    this.dropdownSettings = {
      singleSelection: true,
      text: "SELECT",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      badgeShowLimit: true,
      enableSearchFilter: true,
      classes: "myclass custom-class",
      noDataLabel: "No Record Found",
      searchBy: ['itemName'],
    }
    this.ClaimItemBelowFormGroup.patchValue({ 'payToDetailsKey': 'BAPY' }) // Log #1126: Client feedback
    this.getFeeModifierList();
    this.hideOptionalForms = false
  }

  ngAfterViewInit() {

    var self = this
    $("#loadOnScroll ul").on('scroll', function () {
    })
    $(document).on('click', 'table#claim-items > tbody > tr > td:not(:last-child)', function () { 
      if(self.viewMode){
      var tr = $(this).closest("tr");
      self.row_index = tr.index();
      if(self.arrClaimItems.length > 0){
        
        if (self.arrClaimItems[self.row_index].paymentInfoDto.assessmentAction && self.arrClaimItems[self.row_index].paymentInfoDto.assessmentAction != "undefined") {
          if(self.arrClaimItems[self.row_index].paymentInfoDto.assessmentAction == "R" &&  self.arrClaimItems[self.row_index].mandatoryClaimItemsDto.claimItemStatus == "S"){
          // clicking any row to showdata in optional section and payment section.
          self.ViewItemInfo(self.row_index , self.arrClaimItems[self.row_index])
 
          }
        }
       }
      }
      })
    
  }

  reloadTable() { }

  changeDateFormat(event, frmControlName, formName, currentDate) {
    $(".btnpicker , .btnclear").attr("tabindex", '-1');
    if (event.keyCode != 9 && event.value == '' && frmControlName == "date") {
      return
    }
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.ClaimItemBelowFormGroup.patchValue(datePickerValue);
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
      this.ClaimItemBelowFormGroup.patchValue(datePickerValue);
    }
    this.editStatusValue();
  }
/* for #1264 (start) */ 
  changeDateFormatTest(event, frmControlName, formName, currentDate) {
    setTimeout(function () {
      var serviceCode = <HTMLInputElement>document.getElementById('txtServiceCode' + id);
      if (serviceCode != null) {
        serviceCode.focus();
      }
    }, 100);
    
    var forDate = event.target.value.length
    let inputDate = event.target;
    var obj = this.changeDateFormatService.changeDateFormatLessThanCurrentMonth(inputDate);
    var self = this
    let inputEvent = event.eventPhase;
    $(".btnpicker , .btnclear").attr("tabindex", '-1');
    if (event.keyCode != 9 && event.value == '' && frmControlName == "date") {
      return
    }
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.ClaimItemBelowFormGroup.patchValue(datePickerValue);
    } else if (inputEvent == 2 && inputDate != null && inputDate != '') {
      var self = this
      if (obj == null) {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.invalid-date'), '', {
          timeOut: 8000,
        });
        if(this.forEmptyDate){
        this.arrMandatorySection.serviceDate = '';
        }if(!this.forEmptyDate){
          this.arrClaimItems[this.idx].mandatoryClaimItemsDto.serviceDate = '';
        }
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.ClaimItemBelowFormGroup.patchValue(datePickerValue);
    }
  if(this.forClaimSave){
    if(forDate != 10){
     this.arrMandatorySection.serviceDate = this.changeDateFormatService.convertDateObjectToString(obj)      //add for #1264
    } else {
      this.arrMandatorySection.serviceDate = this.arrMandatorySection.serviceDate;
    } 
   }
    else{
      if(forDate != 10){
       this.arrClaimItems[this.idx].mandatoryClaimItemsDto.serviceDate = this.changeDateFormatService.convertDateObjectToString(obj)
     } else {
      this.arrClaimItems[this.idx].mandatoryClaimItemsDto.serviceDate = this.arrClaimItems[this.idx].mandatoryClaimItemsDto.serviceDate;
     }
    }
    this.editStatusValue();
  
    // general servicedate validations toaster popup fixed 
  var date = this.changeDateFormatService.convertStringDateToObject(this.arrMandatorySection.serviceDate)
  if (this.arrMandatorySection.serviceDate && this.idsDate.empDate) {
    this.error = this.changeDateFormatService.compareTwoDates(date.date, this.idsDate.empDate.date);
    if (this.error.isError == true) {
      this.arrMandatorySection.serviceDate = '';
      this.toastrService.warning(this.translate.instant('Service Date cannot be greater than Date'));
    }
  }

   }
  
  /* for #1264 (end) */ 

  



  changeEditClaimantAddressFormDateFormat(event, frmControlName, formName, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '') && frmControlName != "dob") {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.EditClaimantAddressForm.patchValue(datePickerValue);
      this.setdateVal(frmControlName, validDate)
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
      this.EditClaimantAddressForm.patchValue(datePickerValue);
      this.setdateVal(frmControlName, obj)
    } else {
      this.error.isError = false;
      this.error.errorMessage = "";
    }

  }

  setdateVal(frmControlName, obj) {
    var dateInstring = this.changeDateFormatService.convertDateObjectToString(obj);
    var isFutureDate = this.changeDateFormatService.isFutureDate(dateInstring)

    if (isFutureDate) {
      this.error.isError = true;
      this.EditClaimantAddressForm.controls['dob'].setErrors({
        "cardHolderDob": true
      });
      return
    } else {
      this.error.isError = false;
    }
  }

  /* get Action list Api */
  getActionList() {
    this.arrAction = [{ 'actionKey': 'A', 'actionDesc': 'Add' },
    { 'actionKey': 'C', 'actionDesc': 'Change' },
    { 'actionKey': 'R', 'actionDesc': 'Reassess' },
    { 'actionKey': 'D', 'actionDesc': 'Delete' }]
  }

  ConvertAmountToDecimal(evt, frmControlName) {
    if (frmControlName == "paidAmount") {
      var paidAmount = CustomValidators.ConvertAmountToDecimal(evt.target.value);
      this.ClaimItemBelowFormGroup.patchValue({ "paidAmount": paidAmount })
      if (frmControlName == 'paidAmount') {
      this.editStatusValue();
  }
  } else {
    var feeClaimedAmount = CustomValidators.ConvertAmountToDecimal(evt.target.value);
    this.ClaimItemBelowFormGroup.patchValue({ "feeClaimedAmount": feeClaimedAmount })
    if (frmControlName == 'feeClaimedAmount') {
      this.editStatusValue();
    }
  }
}

  ontimeUnitChange(event, fieldName) {
    this.editStatusValue();
    var FinalStr = ""
    var encounterStr = ""
    var timeStr = ""
   
    if(!this.forTimeUnitsVal){
      this.timeUnitsVal = this.arrMandatorySection.timeUnits

      // Time unit(1,2) will not show in text field of optional section.
        if (this.timeUnitsVal == 3 || this.timeUnitsVal > 3) {
        FinalStr = FinalStr + " , " + this.timeUnitsVal.toString() + ' Calls'
      }
    } else {
      this.timeUnitsVal = this.arrClaimItems[this.idx].mandatoryClaimItemsDto.timeUnits
      if (this.timeUnitsVal == 3 || this.timeUnitsVal > 3) {
           FinalStr = FinalStr + " , " + this.timeUnitsVal.toString() + ' Calls'
         }
    }

    var trimmedStr = FinalStr.replace(/(^\s*,)|(,\s*$)/g, '')
    this.TNECount = trimmedStr
    /* text value patched for resloving issue #895 */
    this.ClaimItemBelowFormGroup.patchValue({
      'text': this.TNECount
    })

  }

  /* get Skill Code list Api */
  getSkillCode(disciplineKey) {
    let url = DataEntryApi.getSkillCode + '/' + disciplineKey
    this.hmsDataService.getApi(url).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        let tempArray = [];
        for (var i = 0; i < data.result.length; i++) {
          tempArray.push({ 'id': data.result[i].skillCode, 'itemName': data.result[i].skillCode })
        }
        this.SkillCodeDetails1 = this.completerService.local(
          tempArray,
          "id",
          "itemName"
        );
      } else {
        let tempArray = []
        this.SkillCodeDetails1 = this.completerService.local(
          tempArray,
          "id",
          "itemName"
        );
      }
    });
    if (this.disciplineKey == 'V') {
      this.skillCode = [{ 'id': 'OPTO', 'itemName': 'OPTO' }]
      this.ClaimItemBelowFormGroup.patchValue({ 'skillCode': 'OPTO' })
    } else {
      this.skillCode = []
    }

  }


  getFeeModifiers(disciplineKey) {
    let tempArray = []
    if (disciplineKey == "D") {
      tempArray = [
        { 'id': 'ADD', 'itemName': 'ADD' },
        { 'id': 'ADD2', 'itemName': 'ADD2' },
        { 'id': 'LVP50', 'itemName': 'LVP50' },
        { 'id': 'DNTAM', 'itemName': 'DNTAM' },
        { 'id': 'UGA', 'itemName': 'UGA' },
        { 'id': 'SOSS', 'itemName': 'SOSS' },
        { 'id': 'DNTPM', 'itemName': 'DNTPM' },
        { 'id': 'TELES', 'itemName': 'TELES' },
        { 'id': 'DEV', 'itemName': 'DEV' },
        { 'id': 'OPEN', 'itemName': 'OPEN' },
        { 'id': 'LVP75', 'itemName': 'LVP75' },
        { 'id': 'DWK', 'itemName': 'DWK' },
        { 'id': 'BMISRG', 'itemName': 'BMISRG' }
      ]
    }
    else {
      tempArray = [
        { 'id': 'NEWCON', 'itemName': 'NEWCON' },
        { 'id': 'SPCDRG', 'itemName': 'SPCDRG' },
        { 'id': 'NEWEP', 'itemName': 'NEWEP' },
        { 'id': 'ADD', 'itemName': 'ADD' },
        { 'id': 'ADD2', 'itemName': 'ADD2' },
        { 'id': 'LVP50', 'itemName': 'LVP50' },
        { 'id': 'DNTAM', 'itemName': 'DNTAM' },
        { 'id': 'UGA', 'itemName': 'UGA' },
        { 'id': 'SOSS', 'itemName': 'SOSS' },
        { 'id': 'DNTPM', 'itemName': 'DNTPM' },
        { 'id': 'TELES', 'itemName': 'TELES' },
        { 'id': 'DEV', 'itemName': 'DEV' },
        { 'id': 'OPEN', 'itemName': 'OPEN' }
      ]
    }
    this.arrItems = this.completerService.local(
      tempArray,
      "id",
      "itemName"
    );
  }

  onDignosticPrimaryChange(dignosticPrimary) {
    this.editStatusValue();
    if (dignosticPrimary != "") {
      let url = DataEntryApi.getDignosticPrimary
      var RequestedData = {
        "diagnosticCode": dignosticPrimary
      }
      this.hmsDataService.postApi(url, RequestedData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          if (data.result.exist == true) {
            this.dignosticPrimaryVal = dignosticPrimary
            this.ClaimItemBelowFormGroup.controls['dignosticPrimary'].setErrors(null);
          }
        } if (data.code == 404 && data.status === "NOT_FOUND") {
          if (data.result.exist == false) {
            this.dignosticPrimaryVal = ""
            this.ClaimItemBelowFormGroup.controls['dignosticPrimary'].setErrors({
              "diagnosticPrimaryNotExist": true
            });
          }
        }
      });
    }
  }

  validateSurface(value) {
    this.editStatusValue();
    if (value != '') {
      var RequestedData = {
        "itemToothSurfaceTxt": value
      }
      this.hmsDataService.postApi(DataEntryApi.validateSurfaceTextUrl, RequestedData).subscribe(data => {
        if (data.hmsMessage.messageShort == 'INVALID_SURFACE_TEXT') {
          this.ClaimItemBelowFormGroup.controls['toothSurfaces'].setErrors({
            "toothSurfacesNotExist": true
          });
        }
      })
    }
    error => {
    }
  }


  /* get Pay To list Api */
  getPayTo() {
    // Log #1126:  payTo List as per Client New Feedback
    this.payToDetails = [
      { 'payToDetailsKey': 'CONT', 'payToDetailsDesc': 'Contract Holder' },
      { 'payToDetailsKey': 'RECP', 'payToDetailsDesc': 'Service Recipient' },
      { 'payToDetailsKey': 'BAPY', 'payToDetailsDesc': 'Business Arrangement' },
      { 'payToDetailsKey': 'OTHR', 'payToDetailsDesc': 'Other' },
      { 'payToDetailsKey': 'PRVD', 'payToDetailsDesc': 'Service Provider' }
    ]
  }

  /* get Referring ULI list Api */
  getReferringULI() {
    this.referringULIDetails = [
      { 'referringULIDetailsKey': 1, 'referringULIDetailsDesc': '472179208' },
      { 'referringULIDetailsKey': 2, 'referringULIDetailsDesc': '472204208' },
      { 'referringULIDetailsKey': 3, 'referringULIDetailsDesc': '152141108' },
      { 'referringULIDetailsKey': 4, 'referringULIDetailsDesc': '152856810' },
      { 'referringULIDetailsKey': 5, 'referringULIDetailsDesc': '152868620' },
      { 'referringULIDetailsKey': 6, 'referringULIDetailsDesc': '152937008' },
      { 'referringULIDetailsKey': 8, 'referringULIDetailsDesc': '153211108' },
      { 'referringULIDetailsKey': 9, 'referringULIDetailsDesc': '153621108' },
      { 'referringULIDetailsKey': 10, 'referringULIDetailsDesc': '153789520' },
      { 'referringULIDetailsKey': 11, 'referringULIDetailsDesc': '154485110' },
      { 'referringULIDetailsKey': 12, 'referringULIDetailsDesc': '154933108' },
      { 'referringULIDetailsKey': 13, 'referringULIDetailsDesc': '155282108' },
      { 'referringULIDetailsKey': 14, 'referringULIDetailsDesc': '155433108' },
      { 'referringULIDetailsKey': 15, 'referringULIDetailsDesc': '155765800' },
      { 'referringULIDetailsKey': 16, 'referringULIDetailsDesc': '156060121' },
      { 'referringULIDetailsKey': 17, 'referringULIDetailsDesc': '156352108' },
      { 'referringULIDetailsKey': 18, 'referringULIDetailsDesc': '156755800' },
      { 'referringULIDetailsKey': 19, 'referringULIDetailsDesc': '156777110' },
      { 'referringULIDetailsKey': 20, 'referringULIDetailsDesc': '156860108' },
      { 'referringULIDetailsKey': 21, 'referringULIDetailsDesc': '157155108' },
      { 'referringULIDetailsKey': 22, 'referringULIDetailsDesc': '157341420' },
      { 'referringULIDetailsKey': 23, 'referringULIDetailsDesc': '157574108' },
      { 'referringULIDetailsKey': 24, 'referringULIDetailsDesc': '158229700' },
      { 'referringULIDetailsKey': 26, 'referringULIDetailsDesc': '158822108' },
      { 'referringULIDetailsKey': 27, 'referringULIDetailsDesc': '159186780' },
      { 'referringULIDetailsKey': 28, 'referringULIDetailsDesc': '159366500' },
      { 'referringULIDetailsKey': 29, 'referringULIDetailsDesc': '159453600' },
      { 'referringULIDetailsKey': 200, 'referringULIDetailsDesc': '159623208' },
      { 'referringULIDetailsKey': 31, 'referringULIDetailsDesc': '159739200' },
      { 'referringULIDetailsKey': 32, 'referringULIDetailsDesc': '161042820' },
      { 'referringULIDetailsKey': 33, 'referringULIDetailsDesc': '161379520' },
      { 'referringULIDetailsKey': 35, 'referringULIDetailsDesc': '161719811' },
      { 'referringULIDetailsKey': 36, 'referringULIDetailsDesc': '162588008' },
      { 'referringULIDetailsKey': 37, 'referringULIDetailsDesc': '163398420' },
      { 'referringULIDetailsKey': 38, 'referringULIDetailsDesc': '164512810' },
      { 'referringULIDetailsKey': 39, 'referringULIDetailsDesc': '164680208' },
      { 'referringULIDetailsKey': 40, 'referringULIDetailsDesc': '164759110' },
      { 'referringULIDetailsKey': 41, 'referringULIDetailsDesc': '165014710' },
      { 'referringULIDetailsKey': 42, 'referringULIDetailsDesc': '165350811' },
      { 'referringULIDetailsKey': 43, 'referringULIDetailsDesc': '165501108' },
      { 'referringULIDetailsKey': 44, 'referringULIDetailsDesc': '166058008' },
      { 'referringULIDetailsKey': 45, 'referringULIDetailsDesc': '166695290' },
      { 'referringULIDetailsKey': 46, 'referringULIDetailsDesc': '167609008' },
      { 'referringULIDetailsKey': 47, 'referringULIDetailsDesc': '178094370' },
      { 'referringULIDetailsKey': 48, 'referringULIDetailsDesc': '178498920' },
      { 'referringULIDetailsKey': 49, 'referringULIDetailsDesc': '180181208' },
      { 'referringULIDetailsKey': 50, 'referringULIDetailsDesc': '181064500' },
      { 'referringULIDetailsKey': 51, 'referringULIDetailsDesc': '181413108' },
    ]
  }

  /* get Fee Modifier 2 list Api */
  getFeeModifie2() {
    this.feeModifier2Details = [{ 'key': 1, 'desc': 'FeeMod2' }, { 'key': 2, 'desc': 'FeeMod' },]
  }

  /* get Function Centre list Api */
  getFunctionCentre() {
    this.hmsDataService.getApi(DataEntryApi.getFunctionCentre).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.FunctionCentreDetails = data.result;
        let tempArray = []
        for (var i = 0; i < this.FunctionCentreDetails.length; i++) {
          this.FunctionCentreDetails[i].id = this.FunctionCentreDetails[i].functionalCentreCode
          this.FunctionCentreDetails[i].itemName = this.FunctionCentreDetails[i].functionalCentreCode
          tempArray.push(this.FunctionCentreDetails[i])


        }
        this.FunctionCentreDetails1 = this.completerService.local(
          tempArray,
          "id",     // search the function center dropdown fixed 
          "itemName"
        );
      } else {
        let tempArray = []
        this.FunctionCentreDetails1 = this.completerService.local(
          tempArray,
          "id",
          "itemName"
        );
        this.FunctionCentreDetails = []
      }
      error => {
      }
    });
  }

  /* get Tooth Code list Api */
  getToothCode() {
    this.hmsDataService.getApi(DataEntryApi.getToothCode).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.toothCodeDetails = data.result;
      } else {
        this.toothCodeDetails = []
      }
      error => {
      }
    })
  }

  getIntercept() {
    this.arrIntercept = [{ 'key': 1, 'desc': 'Pickup' }]
  }

  getDiagnosticSecondary() {
    this.arrDiagnosticSecondary =
      [{ 'key': 1, 'desc': '001' },
      { 'key': 2, 'desc': '001.0' },
      { 'key': 3, 'desc': '001.1' },
      { 'key': 4, 'desc': '001.9' },
      { 'key': 5, 'desc': '002' }]
  }

  getDignosticTeritary() {
    this.arrDignosticTeritary =
      [{ 'key': 1, 'desc': '001' },
      { 'key': 2, 'desc': '001.0' },
      { 'key': 3, 'desc': '001.1' },
      { 'key': 4, 'desc': '001.9' },
      { 'key': 5, 'desc': '002' }]
  }

  claimItem(formData) {
    var itemId
    var itemDetails = []
    var obj = {
      "explanatoryCode": formData.explanationCode,
      "comment": formData.comment,
      "userId": this.userId
    };
    /* for #1264 (start) */ 
    if (this.addMode) {
      if (this.batchStatusCheck == "U" || this.addMode) {
       this.claimItemStatusVal = formData.claimStatus
      } else if (this.batchStatusCheck == "S") {
        this.claimItemStatusVal == "S"
      }  
      if (this.arrMandatorySection.feeClaimedAmount == "") {
        this.arrMandatorySection.feeClaimedAmount = formData.feeClaimedAmount
      } else {
        this.arrMandatorySection.feeClaimedAmount
      }                       
      obj["mandatoryClaimItemsDto"] = {
        "claimNum": this.savedMandatoryClaimNumber,
        "action": formData.action,
        "serviceDate": this.arrMandatorySection.serviceDate,
        "serviceCode": this.arrMandatorySection.serviceCode,
        "toothCode": formData.toothCode,
        "toothSurfaces": formData.toothSurfaces,
        "timeUnits":this.arrMandatorySection.timeUnits,
        "payToCode" : this.claimsComponent.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.value.payTo,
        "refUli": this.arrMandatorySection.refUlI,
        "feeMode1": this.arrMandatorySection.feeModifier1,
        "feeMode2": this.arrMandatorySection.feeModifier2,
        "feeMode3": this.arrMandatorySection.feeModifierOptional1 ? this.arrMandatorySection.feeModifierOptional1 : '',
        "skillCode": this.arrMandatorySection.skillCode,
        "functionalCenter":this.arrMandatorySection.functCentre,
        "diagnostic1":this.arrMandatorySection.dignosticPrimary,
        "claimAmount": this.arrMandatorySection.feeClaimedAmount,
        "paidAmount": this.arrMandatorySection.paidAmount,
         "claimItemStatus": this.claimItemStatusVal,
        "text": formData.text ? formData.text.toString() : formData.text,  /* Text field added in mandatoryClaimItemsDto as per client for log #895 */
      }
    } 
    /* for #1264 (start) */ 
    else {
      if (this.batchStatusCheck == "U" || this.addMode || this.claimEditMode) {
        this.claimItemStatusVal = formData.claimStatus
       } else if (this.batchStatusCheck == "S") {
         this.claimItemStatusVal == "S"
       }  
      obj["mandatoryClaimItemsDto"] = {
        "claimNum": this.arrClaimItems[this.idx].mandatoryClaimItemsDto.claimNum,
        "action": this.actionValue,
        "serviceDate": this.arrClaimItems[this.idx].mandatoryClaimItemsDto.serviceDate, // change for #1264 
        "serviceCode": this.arrClaimItems[this.idx].mandatoryClaimItemsDto.serviceCode,
        "toothCode": formData.toothCode,
        "toothSurfaces": formData.toothSurfaces,
        "timeUnits":this.arrClaimItems[this.idx].mandatoryClaimItemsDto.timeUnits, 
        "payToCode" : this.claimsComponent.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.value.payTo,
        "refUli": this.arrClaimItems[this.idx].mandatoryClaimItemsDto.refUli,  
        "feeMode1": formData.feeModifier1,
        "feeMode2": formData.feeModifier2,
        "skillCode": formData.skillCode,
        "functionalCenter": formData.functCentre,
        "diagnostic1":this.arrClaimItems[this.idx].mandatoryClaimItemsDto.diagnostic1,

        "claimAmount": this.arrClaimItems[this.idx].mandatoryClaimItemsDto.claimAmount,
        "paidAmount": this.arrClaimItems[this.idx].mandatoryClaimItemsDto.paidAmount,
        "claimItemStatus": this.claimItemStatusVal,
        "text": formData.text ? formData.text.toString() : formData.text,  /* Text field added in mandatoryClaimItemsDto as per client for log #895 */
      }
    }
    
      if(this.addMode){
        this.encounterNumValue =  this.arrMandatorySection.encounterNumber;
      } else {
        this.encounterNumValue = this.arrClaimItems[this.idx].optionalClaimItemsDto.encounterNum;
      }

      obj["optionalClaimItemsDto"] = {
        "diagnostic2": formData.dignosticSecondary,
        "diagnostic3": formData.dignosticTeritary,
        "feeMode3": formData.feeModifierOptional1 ? formData.feeModifierOptional1 : '',
        "encounterNum": this.encounterNumValue,
        "locumBusinessArrNo": formData.locumBusNumber,
        "location": formData.location ? formData.location.toString() : formData.location,
        "recoveryCode": formData.recovery ? formData.recovery.toString() : formData.recovery,
        "interceptReason": formData.intercept ? formData.intercept.toString() : formData.intercept,
        "paperDocInd": formData.paperInfo ? formData.paperInfo.toString() : formData.paperInfo,
        "oopReferral": formData.referral ? formData.referral.toString() : formData.referral,
        "confidentialInd": formData.confidential ? formData.confidential.toString() : formData.confidential,
        "emsafInd": formData.emsaf ? formData.emsaf.toString() : formData.emsaf,
        "goodFaith": formData.goodFaith,
        "serviceRecipientRegNo": formData.serviceRecpRegNo // Log #1128: Client Feedback
      }
     
      if (this.batchStatusCheck == "U" || this.addMode || this.claimEditMode) {
      obj["mandatoryClaimItemsDto"].claimItemDescStatus = [ "Unsubmitted " ]
      } else if (this.batchStatusCheck == "S") {
        obj["mandatoryClaimItemsDto"].claimItemDescStatus = [ "Submitted " ]
      }
    if (this.ClaimItemBelowFormGroup.value.goodFaith == "Y" || formData.payTo =="OTHR" || (formData.recovery !='' ||formData.recovery !=null )) {
      if(this.isEmpty(this.goodFaithDto)){
        obj['claimantDto'] = null
      }else{
        obj['claimantDto'] = this.goodFaithDto
      }
      
    } else {
      obj['claimantDto'] = null
    }
    return obj
  }
   isEmpty(obj) {
    return Object.keys(obj).length === 0;
}






validatePatientHC(event, type) {
  
  if (event.key === "Enter" || event.key === "Tab" || type == 'blur') {
    if (this.EditClaimantAddressForm.value.phn) {
      this.hmsDataService.getApi(DataEntryApi.validatePatientHc + '/' + this.EditClaimantAddressForm.value.phn).subscribe(data => {
        if (data.code == 404 && data.hmsMessage.messageShort == "INVALID_PHN_NUMBER") {
          this.showError()
        }
        else if (data.hmsMessage.messageShort == "VALID_PHN_NUMBER") {

        }else{
          this.showError(data.hmsMessage.messageShort)
        }
      })
    } else {
      if(this.EditClaimantAddressForm.value.phn==''){

      }else{
        this.showError()

      }
    }
  } else {

  }
}

showError(msg=null) {
  $('#decPopup_phn').focus();
  $('html, body').animate({
    scrollTop: $("#decPopup_phn").offset().top
  }, 20);
  if(msg==null){
    msg ="Invalid PHN For This Claimant"
  this.EditClaimantAddressForm.controls.phn.setErrors({ 'patientHCInValid': true })

  }else{
    this.EditClaimantAddressForm.controls.phn.setErrors({ 'shortString': true })

  }
  this.toastrService.error(msg)

}
  // change functionality for (#1264)
   saveDataEntryClaim(i,dataRow, onBlur:boolean) {
    this.forTimeUnitsVal = false;
    this.showErrorMsg = false
    this.newRecordValidate = true
    let promise = new Promise((resolve, reject) => {
    this.isSave = false
    this.editStatusPatchValue = "SAVED";
    let isgoodFaith = this.isEmpty(this.goodFaithDto)
    if (this.addMode==true || this.ClaimItemBelowFormGroup.value) {
      if (this.ClaimItemBelowFormGroup.value.recovery && (this.ClaimItemBelowFormGroup.value.recovery != '' && isgoodFaith)) {
        this.toastrService.error('Please Fill Claimant Address');
        return false
      }
      if (this.ClaimItemBelowFormGroup.value.goodFaith == 'Y' && isgoodFaith) {
        this.toastrService.error('Please Fill Claimant Address');
        return false
      }
      if (this.ClaimItemBelowFormGroup.value.payTo == 'OTHR' && isgoodFaith) {
        this.toastrService.error('Please Fill Claimant Address');
        return false
      }
      this.userId = localStorage.getItem('id')
      this.disableSave = false
      var RequestedData = {};
      this.addMode=false
       if (this.validateAllFields(dataRow,i)){
        if (this.disableAdd) {
        if (!this.addMode && !this.addClaimtoBatch ) {
        RequestedData['claimInfoDto'] = {}
        RequestedData['claimItemKey'] = this.claimItemKey ? this.claimItemKey : null
          
         if(onBlur == true){
          
         RequestedData['claimItemKey'] = dataRow.claimItemKey
         }
        if (this.claimAddMode || this.forSave) {
          RequestedData['claimInfoDto']['userId'] = this.userId
          RequestedData['claimInfoDto']['claimKey'] = this.claimKey
          RequestedData['claimInfoDto']['claimNum'] = this.savedMandatoryClaimNumber
          RequestedData['claimInfoDto']['claimItemsInfoDtoList'] = []
          this.addMode=true
          RequestedData['claimInfoDto']['claimItemsInfoDtoList'].push(this.claimItem(this.ClaimItemBelowFormGroup.value))
          this.hmsDataService.postApi(DataEntryApi.addClaimItemInBatchUrl, RequestedData).subscribe(data => {
            if (data.code == 200 && data.status === "OK") {
              this.claimItem
              this.toastrService.success('Claim Item Added Successfully!');
              this.getClaimItems(false);
              this.showLoader = false

              this.hideBelowForm = true
               this.claimItemKey = null
              this.disableSave = false
              resolve()
            } if (data.code == 400 && data.status === "BAD_REQ") {
              this.toastrService.error('Claim Item Not Added Successfully!');
              this.disableSave = false
              resolve()
            }
          });
          this.rowVisible=false
          this.forSave=false
          this.addMode = false        //last delete
        }
        else {
          this.notClaimItemSaveMode = true
          RequestedData['claimInfoDto']['claimItemsInfoDto'] = this.claimItem(this.ClaimItemBelowFormGroup.value)
          RequestedData['claimInfoDto']['userId'] = this.userId;
          RequestedData['claimKey'] = this.claimKey
          if (this.isReassessed) {
            RequestedData['claimInfoDto']['claimItemsInfoDto']['mandatoryClaimItemsDto']['claimItemStatus'] = this.claimItemStatus
          }
          this.hmsDataService.postApi(DataEntryApi.updateClaimItemInBatchUrl, RequestedData).subscribe(data => {
            if (data.code == 200 && data.status === "OK") {
              this.toastrService.success('Claim Item Updated Successfully!');
              this.isReassessed = false
              this.claimsComponent.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('action').disable()
              this.getClaimItems(false);
              if(onBlur == true){
              setTimeout(function () {
              var index = i+1
                var serviceDate = <HTMLInputElement>document.getElementById('ClaimDate' + index);
                if (serviceDate != null) {
                  serviceDate.focus();
                }
              }, 2000);
             }
             this.selectedRowId = ""
              this.hideBelowForm = false
               this.claimItemKey = null
              this.disableSave = false
              this.forAddNewClaimDisable = false
               this.onReassessClick = false;
              resolve();
            } if (data.code == 400 && data.status === "BAD_REQ") {
              this.toastrService.error('Claim Item Not Updated Successfully!');
              this.disableSave = false
              resolve();
            }
          });
       }
        }
      }
      else {
        if (this.claimEditMode) {
           this.addModeSet = true
          this.arrClaimItems[this.idx] = this.claimItem(this.ClaimItemBelowFormGroup.value)
          this.disableSave = false;
          this.toastrService.success('Claim Item Updated Successfully!');
          this.addMode=true
          resolve();
        } else {
          this.addMode=true
          this.arrClaimItems.push(this.claimItem(this.ClaimItemBelowFormGroup.value))
          this.disableSave = false;
          this.toastrService.success('Claim Item Added Successfully!');
          resolve();
        }
        this.reloadTable()
        this.rowVisible=false
        this.hideBelowForm = true
        this.hideOptionalForms = true
        this.claimEditMode = false;
        this.selectedRowId = '';
        this.disableClaimantAddress = true
        this.notClaimItemSaveMode = true
        this.forAddNewClaimDisable = false
        resolve();
      }
     }
     this.onReassessClick = false;
       this.dataEntryService.ClaimItemInsert.emit(this.arrClaimItems);
       this.dataEntryService.disableSave.emit(false)
    } else {
      this.notClaimItemSaveMode = false
      this.validateAllFormFields(this.ClaimItemBelowFormGroup);//Form Validations
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }
    if(this.disableAdd){
    this.addMode=false
    }
    else{
      this.addMode=true
    }
    });
    return promise;
  }
  
  reaccessClaim() {
     this.editDisable = false
     this.cancelDisable = false
    this.onReassessClick = true;
    this.claimEditMode = true
    if (this.batchStatusSubmitted) {
      this.getMandatoryOptionalEnabledFields()
      if (this.isClaimSubmitted) {
        this.reassessClicked();
      }
    } else {
       this.getMandatoryOptionalEnabledFields()
       this.saveDataEntryClaim('','',false).then(row => {
       this.getMandoatoryOptionalDisabledFields()
      });
    }
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
    /* for #1264 (start) */ 
    validateAllFields(objRow: any, idx: number) {
      this.showErrorMsg = true
      if(this.onReassessClick){
        if (this.ClaimItemBelowFormGroup.value.date == ""|| this.ClaimItemBelowFormGroup.value.serviceCode == ""){
          return false
        }
        else {
          return true
        }
      } else{
        if(this.forValidation){
          if (objRow.serviceDate == "" || objRow.serviceDate == null || objRow.serviceCode == ""){
            return false
          }
          else {
            return true
          }
        }
        else{
          
          if (objRow.mandatoryClaimItemsDto.serviceDate == "" || objRow.mandatoryClaimItemsDto.serviceDate == null || objRow.mandatoryClaimItemsDto.serviceCode == ""){
            return false
          }
          else {
            return true
          }
        }
      }
    
    }
  /* for #1264 (end) */ 

  getClaimItems(initialFlow: Boolean) {
    this.showLoader = true
        let RequestedData = {
          "claimKey": +this.claimKey
        }
        this.hmsDataService.postApi(DataEntryApi.getAhcClaimItemListUrl, RequestedData).subscribe(data => {
          if (data.code === 200 && data.status === "OK") {
            let retData = data.result.claimInfoDto.claimItemsInfoDtoList;
            this.getOptionalView(retData)           
            this.arrClaimItems = [];
            if (!this.copyMode) {
              if (retData) {
                for (var i = 0; i < retData.length; i++) {
                  retData[i].id = retData[i].itemsDto.claimItemKey
                  retData[i].mandatoryClaimItemsDto.claimItemDescStatus = this.arrStatus.filter(val => val.id == retData[i].mandatoryClaimItemsDto.claimItemStatus).map(data => data.name)
                  this.getValuesOfDigitCode(retData[i].mandatoryClaimItemsDto.claimNum).then(res => {
                    if (this.digitCodeArray) {
                      for (let j = 0; j < this.digitCodeArray.length; j++) {
                        retData[j].digitCode = this.digitCodeArray[j]
                      }
                    }
                  })
                  this.arrClaimItems.push(retData[i])
                }
                if (initialFlow) {
                  // open first item as per log #794 on
                  setTimeout(() => {
                    this.showLoader = false
                    if (this.batchStatusSubmitted) {
                      document.getElementById('row_0').click()
                    } else {
                    }
                  }, 5000);
                } else {
                  this.showLoader = false
                }
              }
            } else {
              for (var i = 0; i < retData.length; i++) {
                var currdate = this.changeDateFormatService.convertStringDateToObject(retData[i].mandatoryClaimItemsDto.serviceDate)
                var number
                var pushData = {
                  'locumBusNumber': '',
                  'skillCode': 'OPTO',
                  'id': '',
                  'encounterNumber': '',
                  'explanationCode': '',
                  'comment': '',
                  'claimNumber': number,
                  'action': 'A',
                  'date': currdate,
                  'serviceCode': retData[i].mandatoryClaimItemsDto.serviceCode,
                  'timeUnits': 3,
                  'payTo': 'BAPY', // Log #1126: Client feedback
                  'referring': retData[i].mandatoryClaimItemsDto.refUli,
                  'feeMode1': '',
                  'feeMode2': '',
                  'functionalCenter': '',
                  'goodFaith': 'N',
                  'feeClaimedAmount': '0',
                  'paidAmount': '',
                  'claimStatus': 'U',
                }
                this.skillCode = [{ 'id': 'OPTO', 'itemName': 'OPTO' }]
                var eachItem = {}
    
                eachItem['id'] = ""
                eachItem = this.claimItem(pushData)
                this.arrClaimItems.push(eachItem)
              }
    
              if (initialFlow) {
                // open first item as per log #794
                setTimeout(() => {
                  this.showLoader = false
                  if (this.batchStatusSubmitted) {
                    document.getElementById('row_0').click()
                  } else {
                  }
                }, 5000);
              }
              else {
                this.showLoader = false
              }
            }
            this.dataEntryService.ClaimItemInsert.emit(this.arrClaimItems);
            this.dataEntryService.emitPayToSection.emit(this.arrClaimItems[0].mandatoryClaimItemsDto.payToCode)
            this.dataEntryService.emitActionField.emit(this.arrClaimItems[0].mandatoryClaimItemsDto.action)
            // add check to default enable claimant address to show data in claimant address popup otherwise disable claimant address in submitted and Unsubmitted batches
             var option1 = this.arrClaimItems[0].claimantDto;
            if (option1.addressLine1 != "" || option1.addressLine2 != "" || option1.phn != "" || option1.city != ""
             || option1.country != ""|| option1.dob != "" || option1.firstName != "" || option1.lastName != ""
             || option1.middleName != "" || option1.gender != "" || option1.postalCode != "" || option1.province != "") { 
                this.disableClaimantAddress = false
              }else{
                this.disableClaimantAddress = true
              }
          }
        });
  }


  getStatus() {
    this.arrStatus = [
      { 'id': 'U', 'name': 'Unsubmitted ' },
      { 'id': 'S', 'name': 'Submitted ' },
      { 'id': 'R', 'name': 'Rejected ' },
      { 'id': 'A', 'name': 'Accepted ' },
      { 'id': 'P', 'name': 'Partially Accepted ' }]
  }
  /* change functionality for (#1264) */
  AddNew(addOnBlur) {
    if (this.batchStatusCheck == "U" || this.addMode) {
    this.ClaimItemBelowFormGroup.enable();
    this.arrStatusVal = true;
    } 
    else if (this.batchStatusCheck == "S") {
      this.arrStatusVal = false;
    } 
    if (this.arrMandatorySection.serviceDate != null && this.arrMandatorySection.serviceDate != "") {
      setTimeout(function () {
          var serviceCode = <HTMLInputElement>document.getElementById('decMandatory_ServiceCode');
          serviceCode.focus();
        }, 100);
      } else {
        setTimeout(function () {
          var serviceDate = <HTMLInputElement>document.getElementById('txtClaimDate');
        serviceDate.focus();
        }, 100);
        
      }
    this.forClaimSave = true
    this.hideBelowForm = false  
    this.forValidation = true
    this.showErrorMsg = true
    this.forEmptyDate = true
    this.claimsComponent.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('payTo').enable()      
    if(!this.editMode || !this.claimAddMode){            // Add if block for new row of claim Items (#1264)
        this.selectedRowId = '';
        this.resetNewRecord();
        this.rowVisible=true;
        this.isEnable=true;
        this.addClaimtoBatch = this.claimAddMode;
      }
    this.dataEntryService.emitDisableAddValue.emit(this.disableAdd)
    this.dataEntryService.emitPayToSectionHide.emit(this.addMode)
    this.dataEntryService.editReassesBtnStatus.emit(this.disableReasses)
    this.notClaimItemSaveMode = true               
    if (this.isSave && !this.isFromPHc) {
         this.hideOptionalForms = false
            document.getElementById('decMandatory_PayTo').focus();
            $('#decMandatory_PayTo').scrollTop(0);
            this.claimEditMode = false;
            this.claimAddMode = true;
            this.resetForm();
      return
    }
 
    let payTo = "BAPY"

    if (this.arrClaimItems.length > 0) {
      let index = 0;
      index = this.arrClaimItems.length - 1;
      let lastEntry = this.arrClaimItems[index]
      this.claimItemDate = this.changeDateFormatService.convertStringDateToObject(lastEntry.mandatoryClaimItemsDto.serviceDate)
      let paytype = lastEntry.mandatoryClaimItemsDto.payToCode;
      if (paytype != "BAPY") {
        payTo = paytype
      }
    }
    this.isSave = true;
    this.isFromPHc = false;
    this.dataEntryService.addnewClicked.emit(true)
    this.selectedRowId = '';
    this.claimAddMode = false;        //for#1264
    this.forSave=true;
    this.ClaimItemBelowFormGroup.reset()
    setTimeout(( ) =>  { 
    this.getAutoGeneratedClaimItemNumber()
  },200)
    this.ClaimItemBelowFormGroup.patchValue({ 'claimNumber': this.claimNo });
    this.ClaimItemBelowFormGroup.patchValue({ 'claimNumberPayment': this.claimNo });
    this.ClaimItemBelowFormGroup.patchValue({ "claimStatus": 'U' })
    this.ClaimItemBelowFormGroup.patchValue({ "action": 'A' })
    this.ClaimItemBelowFormGroup.patchValue({ "encounterNumber": 1 })
    this.ClaimItemBelowFormGroup.patchValue({ "feeClaimedAmount": '0.00' })
    this.ClaimItemBelowFormGroup.patchValue({ "timeUnits": 3 })
    this.ClaimInformationFormGroup.patchValue({ 'payTo': payTo })    //add for # 1264
    this.ClaimItemBelowFormGroup.patchValue({ 'goodFaith': 'N' })
    this.ClaimItemBelowFormGroup.patchValue({ 'editStatus': 'CHANGED' })
    this.ClaimItemBelowFormGroup.patchValue({ "dignosticPrimary": this.selectedDiagnosticCode })
    this.ClaimItemBelowFormGroup.patchValue({ "date": this.claimItemDate })
    this.feeModifier1 = []
    this.feeModifier2 = []
    this.feeModifierOptional1 = []
    if (this.selectedSkillCodeVal != "") {
      this.ClaimItemBelowFormGroup.patchValue({ 'skillCode': this.selectedSkillCodeVal })
    }
    if (this.selectedFuncCentreVal != "") {
      this.ClaimItemBelowFormGroup.patchValue({ 'functCentre': this.selectedFuncCentreVal })
    }
    if (this.disciplineKey == 'V') {
      this.skillCode = [{ 'id': 'OPTO', 'itemName': 'OPTO' }]
      this.ClaimItemBelowFormGroup.patchValue({ 'skillCode': 'OPTO' })
    } else {
    }
    this.dataEntryService.disableSave.emit(true)
    this.disableClaimantAddress = true;
    if(payTo=='OTHR'){
      this.disableClaimantAddress =false
    }
    $('#decMandatory_PayTo').val(payTo);
    setTimeout(() => {
      $("#decMandatory_Date input").trigger("select")

    }, 100);
    /* change functionality for (#1264) */
    if(addOnBlur == 1){
      this.AddNew(0);
    }
  }

  resetForm() {
    let payTo = "BAPY"
    if (this.arrClaimItems.length > 0) {
      let index = 0;
      index = this.arrClaimItems.length - 1;
      let lastEntry = this.arrClaimItems[index]
      this.claimItemDate = this.changeDateFormatService.convertStringDateToObject(lastEntry.mandatoryClaimItemsDto.serviceDate)
      let paytype = lastEntry.mandatoryClaimItemsDto.payToCode;
      if (paytype != "BAPY") {
        payTo = paytype
      }
    }

    this.selectedRowId = '';
    this.ClaimItemBelowFormGroup.reset()
    this.getAutoGeneratedClaimItemNumber()
    this.ClaimItemBelowFormGroup.patchValue({ 'claimNumber': this.claimNo });
    this.ClaimItemBelowFormGroup.patchValue({ 'claimNumberPayment': this.claimNo });
    this.ClaimItemBelowFormGroup.patchValue({ "claimStatus": 'U' })
    this.ClaimItemBelowFormGroup.patchValue({ "action": 'A' })
    this.ClaimItemBelowFormGroup.patchValue({ "encounterNumber": 1 })
    this.ClaimItemBelowFormGroup.patchValue({ "timeUnits": 3 })
    this.ClaimItemBelowFormGroup.patchValue({ 'payTo': payTo })
    this.ClaimItemBelowFormGroup.patchValue({ 'goodFaith': 'N' })
    this.ClaimItemBelowFormGroup.patchValue({ 'editStatus': 'CHANGED' });
    this.ClaimItemBelowFormGroup.patchValue({ "date": this.claimItemDate })

    if (this.disciplineKey == 'V') {
      this.skillCode = [{ 'id': 'OPTO', 'itemName': 'OPTO' }]
      this.ClaimItemBelowFormGroup.patchValue({ 'skillCode': 'OPTO' })
    } else {
      this.skillCode = []
    }
    this.ClaimItemBelowFormGroup.patchValue({ 'functCentre': '' })
    this.ClaimItemBelowFormGroup.patchValue({ 'feeModifier2': '' })
    this.ClaimItemBelowFormGroup.patchValue({ 'feeModifier1': '' })
    this.ClaimItemBelowFormGroup.patchValue({ 'feeModifierOptional1': '' })

    $('#decMandatory_PayTo').val(payTo);
    $('#decMandatory_PayTo').scrollTop(0);
    this.getFunctionCentre()
    setTimeout(() => {
      $("#decMandatory_Date input").trigger("select")

    }, 100);
  }

/* view fuctionality in Payment Info section only */
ViewItemInfo(i,dataRow){
  if (dataRow.paymentInfoDto) {
    if (dataRow.paymentInfoDto.claimItemPaymentKey) {
      this.claimItemPaymentKey = dataRow.paymentInfoDto.claimItemPaymentKey
    } else {
      this.claimItemPaymentKey = ""
    }
  }
  if (!dataRow.itemsDto) {
    this.fillBelowFormDetails(dataRow)
  } else {
    let RequestedData = {
      "claimItemKey": dataRow.itemsDto.claimItemKey,
      "claimItemPaymentKey": this.claimItemPaymentKey
    }
    this.claimItemKey = dataRow.itemsDto.claimItemKey
    this.hmsDataService.postApi(DataEntryApi.getAhcClaimItemUrl, RequestedData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
         if (this.batchStatusCheck == "U") {
          this.hideOptionalForms = false
         } else {
          this.hideOptionalForms = false
         }
        this.fillBelowFormDetails(data.result)
      }
    });
  }

  var option3 = dataRow.paymentInfoDto;
  if (option3.claimNum != ""|| option3.reassessmentReason != "" || option3.assessmentAction != "" || option3.frReferenceNum != "" 
  || option3.expectedPaymentDate != "" || option3.assessmentDate != "" || option3.explanationCodes != ""|| option3.emsafStatus != "" 
  || option3.feeModifier != "" || option3.referenceNum != "" || option3.paidAmount != 0) {             
  $(".accordion-toggle").attr("aria-expanded", "true"); 
  $("#paymentInformationHeadingDiv").addClass("accordion-body collapse in");
} else {
  $(".accordion-toggle collapsed").attr("aria-expanded", "false"); 
  $("#paymentInformationHeadingDiv").addClass("accordion-body collapse");
}
}



  /* change functionality for (#1264) */
  EditItemInfo(i, dataRow, onBlur: boolean = true) {
  // click on Edit button to expand the optional section to show data.
  if(this.ViewEditInfo == true){
  var option1 = dataRow.mandatoryClaimItemsDto;
  var option2 = dataRow.optionalClaimItemsDto;
  if (option2.text != "" || option2.confidentialInd != "" || option2.diagnostic2 != "" || option2.diagnostic3 != "" || option2.encounterNum != 1 || option2.goodFaith != ""
      || option2.interceptReason != "" || option2.emsafInd != "" || option2.locumBusinessArrNo != 0 || option2.oopReferral != "" || option2.recoveryCode != "" || option2.paperDocInd != "" 
      || option2.serviceRecipientRegNo != "" || option1.toothCode != "" || option1.toothSurfaces != "" || option1.timeUnits != "") {             
    $(".accordion-toggle").attr("aria-expanded", "true"); 
    $("#optional").addClass("accordion-body collapse in");
  } else {
    $(".accordion-toggle collapsed").attr("aria-expanded", "false"); 
    $("#optional").addClass("accordion-body collapse");
  }

  var option3 = dataRow.paymentInfoDto;
  if (option3.claimNum != ""|| option3.reassessmentReason != "" || option3.assessmentAction != "" || option3.frReferenceNum != "" 
  || option3.expectedPaymentDate != "" || option3.assessmentDate != "" || option3.explanationCodes != ""|| option3.emsafStatus != "" 
  || option3.feeModifier != "" || option3.referenceNum != "" || option3.paidAmount != 0) {             
  $(".accordion-toggle").attr("aria-expanded", "true"); 
  $("#paymentInformationHeadingDiv").addClass("accordion-body collapse in");
} else {
  $(".accordion-toggle collapsed").attr("aria-expanded", "false"); 
  $("#paymentInformationHeadingDiv").addClass("accordion-body collapse");
}
  }
    if (this.batchStatusCheck == "U" || this.addMode) {
      this.ClaimItemBelowFormGroup.enable();
      this.arrStatusVal = true;
     } else if (this.batchStatusCheck == "S") {
      this.arrStatusVal = false;
     }
    this.forTimeUnitsVal = true;
    this.hideOptionalForms = false
    this.forAddNewClaimDisable = true;
    this.forValidation = false;
    this.forEmptyDate = false;
     setTimeout(function () {
      var serviceDate = <HTMLInputElement>document.getElementById('ClaimDate' + i);
      if (serviceDate != null) {
        serviceDate.focus();
      }
     }, 100);
     let promise = new Promise((resolve, reject) => {
     this.claimsComponent.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('payTo').enable()
     this.claimsComponent.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('action').enable()
     this.dataEntryService.editReassesBtnStatus.emit(true)
     this.forClaimSave = false
     this.isSave = true
      this.isEdit = false
      this.notClaimItemSaveMode = false
      this.claimEditMode = true;
      this.forSave = false       
      this.dataEntryService.claimItemMode.emit(this.claimEditMode)
      this.claimAddMode = false;        
      this.rowVisible = false 
      this.isEnable = true
      if(this.disableAdd){
        this.idx = i
        this.selectedRowId = dataRow.id
      }
      else{
        if(this.claimEditMode){
          this.idx = i
        }
        else{
        this.idx = i+1
        }
        dataRow.id = i;
       this.selectedRowId = this.idx;
      }
      
/* Add param claimItemPaymentKey and claimantId */
if (dataRow.paymentInfoDto) {
  if (dataRow.paymentInfoDto.claimItemPaymentKey) {
    this.claimItemPaymentKey = dataRow.paymentInfoDto.claimItemPaymentKey
  } else {
    this.claimItemPaymentKey = ""
  }
}
if (!dataRow.itemsDto) {
  this.hideBelowForm = false
  this.fillBelowFormDetails(dataRow)
} else {
  let RequestedData = {
    "claimItemKey": dataRow.itemsDto.claimItemKey,
    "claimItemPaymentKey": this.claimItemPaymentKey
  }
  this.claimItemKey = dataRow.itemsDto.claimItemKey
  this.hmsDataService.postApi(DataEntryApi.getAhcClaimItemUrl, RequestedData).subscribe(data => {
    if (data.code == 200 && data.status == "OK") {
      this.hideBelowForm = false
      this.fillBelowFormDetails(data.result)
      resolve();
    }
  });
}
   this.ClaimItemBelowFormGroup.patchValue({ 'editStatus': 'SAVED' })
   this.dataEntryService.disableSave.emit(false)
   resolve();
 });

   return promise;
   
  }

  getOptionalView(val){         // default expand on optional section and payment Info section to show data.
    var editData = {
    action: val[0].mandatoryClaimItemsDto.action,
    toothCode: val[0].mandatoryClaimItemsDto.toothCode,
    toothSurfaces: val[0].mandatoryClaimItemsDto.toothSurfaces,
    feeModifierOptional1: val[0].optionalClaimItemsDto.feeMode3,
    encounterNumber: val[0].optionalClaimItemsDto.encounterNum,
    locumBusNumber: val[0].optionalClaimItemsDto.locumBusinessArrNo,
    location: val[0].optionalClaimItemsDto.location,
    recovery: val[0].optionalClaimItemsDto.recoveryCode,
    intercept: val[0].optionalClaimItemsDto.interceptReason,
    paperInfo: val[0].optionalClaimItemsDto.paperDocInd,
    referral: val[0].optionalClaimItemsDto.oopReferral,
    goodFaith: val[0].optionalClaimItemsDto.goodFaith,
    confidential: val[0].optionalClaimItemsDto.confidentialInd,
    emsaf: val[0].optionalClaimItemsDto.emsafInd,
    dignosticSecondary: val[0].optionalClaimItemsDto.diagnostic2,
    dignosticTeritary: val[0].optionalClaimItemsDto.diagnostic3,
    serviceRecpRegNo: val[0].optionalClaimItemsDto.serviceRecipientRegNo,
    claimNumberPayment: val[0].paymentInfoDto.claimNum,
    reassessment: val[0].paymentInfoDto.reassessmentReason,
    assessment: val[0].paymentInfoDto.assessmentAction,
    refNumber: val[0].paymentInfoDto.referenceNum,
    expPaymentDate: this.changeDateFormatService.convertStringDateToObject(val[0].paymentInfoDto.expectedPaymentDate),
    assessmentDate: this.changeDateFormatService.convertStringDateToObject(val[0].paymentInfoDto.assessmentDate),
    explanationCodes: val[0].paymentInfoDto.explanationCodes,
    status: val[0].paymentInfoDto.emsafStatus,
    feeModifiers: val[0].paymentInfoDto.feeModifier,
    frReferenceNumber: val[0].paymentInfoDto.frReferenceNum,
    paidAmount: val[0].mandatoryClaimItemsDto.paidAmount,
    }
      this.ClaimItemBelowFormGroup.patchValue(editData);
      if (val[0].mandatoryClaimItemsDto.timeUnits  >= 3) {
        this.ClaimItemBelowFormGroup.patchValue({
          'text': val[0].mandatoryClaimItemsDto.timeUnits  + ' Calls'
        })
      }
  }

  fillBelowFormDetails(dataRow) {
    this.getRowData(dataRow) // to get individuals row data for #1111: New Feedback
    var userId = localStorage.getItem('id')
    var batchNum
    if (dataRow.mandatoryClaimItemsDto.payToCode == '3') {
      dataRow.mandatoryClaimItemsDto.payToCode = 'PRVD'
    }
    let editData:any ={}
    if(!dataRow.paymentInfoDto){
    /* #1272: to fix fee claim amount decimal issue */ 
    if (Number.isInteger(dataRow.mandatoryClaimItemsDto.claimAmount)) {
      this.feeClaimedAmount = dataRow.mandatoryClaimItemsDto.claimAmount + '.00'
    } else {
      this.feeClaimedAmount = dataRow.mandatoryClaimItemsDto.claimAmount
    }
    editData = {
    claimNumber: dataRow.mandatoryClaimItemsDto.claimNum,
    action: dataRow.mandatoryClaimItemsDto.action,
    date: this.changeDateFormatService.convertStringDateToObject(dataRow.mandatoryClaimItemsDto.serviceDate),
    serviceCode: dataRow.mandatoryClaimItemsDto.serviceCode,
    toothCode: dataRow.mandatoryClaimItemsDto.toothCode,
    toothSurfaces: dataRow.mandatoryClaimItemsDto.toothSurfaces,
    timeUnits: dataRow.mandatoryClaimItemsDto.timeUnits,
    payTo: dataRow.mandatoryClaimItemsDto.payToCode,
    referring: dataRow.mandatoryClaimItemsDto.refUli ? dataRow.mandatoryClaimItemsDto.refUli : null,

    feeModifier1: dataRow.mandatoryClaimItemsDto.feeMode1,
    feeModifier2: dataRow.mandatoryClaimItemsDto.feeMode2,
    skillCode: dataRow.mandatoryClaimItemsDto.skillCode,
    functCentre: dataRow.mandatoryClaimItemsDto.functionalCenter,
    dignosticPrimary: dataRow.mandatoryClaimItemsDto.diagnostic1,
   
    feeClaimedAmount: this.feeClaimedAmount,

    claimStatus: dataRow.mandatoryClaimItemsDto.claimItemStatus,
    text: dataRow.mandatoryClaimItemsDto.text,
    feeModifierOptional1: dataRow.optionalClaimItemsDto.feeMode3,
    encounterNumber: dataRow.optionalClaimItemsDto.encounterNum,
    locumBusNumber: dataRow.optionalClaimItemsDto.locumBusinessArrNo,
    location: dataRow.optionalClaimItemsDto.location,
    recovery: dataRow.optionalClaimItemsDto.recoveryCode,
    intercept: dataRow.optionalClaimItemsDto.interceptReason,
    paperInfo: dataRow.optionalClaimItemsDto.paperDocInd,
    referral: dataRow.optionalClaimItemsDto.oopReferral,
    goodFaith: dataRow.optionalClaimItemsDto.goodFaith,
    confidential: dataRow.optionalClaimItemsDto.confidentialInd,
    emsaf: dataRow.optionalClaimItemsDto.emsafInd,
    dignosticSecondary: dataRow.optionalClaimItemsDto.diagnostic2,
    dignosticTeritary: dataRow.optionalClaimItemsDto.diagnostic3,
    paidAmount: dataRow.mandatoryClaimItemsDto.paidAmount,
    explanationCode: dataRow.explanatoryCode,
    comment: dataRow.comment,
    serviceRecpRegNo: dataRow.optionalClaimItemsDto.serviceRecipientRegNo // Log #1128: Client Feedback
  }
  // #1264
  this.forPayTo = editData.payTo
  this.dataEntryService.emitPayToSection.emit(this.forPayTo)
}else{

  if (Number.isInteger(dataRow.mandatoryClaimItemsDto.claimAmount)) {
    this.feeClaimedAmount = dataRow.mandatoryClaimItemsDto.claimAmount + '.00'
  } else {
    this.feeClaimedAmount = dataRow.mandatoryClaimItemsDto.claimAmount
  }

   if(dataRow.mandatoryClaimItemsDto.timeUnits == 3){    
      textVal = 3;
      textVal = textVal  + ' Calls'
    } else {
      var textVal = dataRow.mandatoryClaimItemsDto.text
    }
   if (!this.viewMode) {
    editData = {
     text : textVal,
     claimNumber: dataRow.mandatoryClaimItemsDto.claimNum,
     action: dataRow.mandatoryClaimItemsDto.action,
     date: this.changeDateFormatService.convertStringDateToObject(dataRow.mandatoryClaimItemsDto.serviceDate),
     serviceCode: dataRow.mandatoryClaimItemsDto.serviceCode,
     toothCode: dataRow.mandatoryClaimItemsDto.toothCode,
     toothSurfaces: dataRow.mandatoryClaimItemsDto.toothSurfaces,
     timeUnits: dataRow.mandatoryClaimItemsDto.timeUnits,
     payTo: dataRow.mandatoryClaimItemsDto.payToCode,
     referring: dataRow.mandatoryClaimItemsDto.refUli ? dataRow.mandatoryClaimItemsDto.refUli : null,
 
     feeModifier1: dataRow.mandatoryClaimItemsDto.feeMode1,
     feeModifier2: dataRow.mandatoryClaimItemsDto.feeMode2,
     skillCode: dataRow.mandatoryClaimItemsDto.skillCode,
     functCentre: dataRow.mandatoryClaimItemsDto.functionalCenter,
     dignosticPrimary: dataRow.mandatoryClaimItemsDto.diagnostic1,
     feeClaimedAmount: this.feeClaimedAmount,
     claimStatus: dataRow.mandatoryClaimItemsDto.claimItemStatus,
     feeModifierOptional1: dataRow.optionalClaimItemsDto.feeMode3,
     encounterNumber: dataRow.optionalClaimItemsDto.encounterNum,
     locumBusNumber: dataRow.optionalClaimItemsDto.locumBusinessArrNo,
     location: dataRow.optionalClaimItemsDto.location,
     recovery: dataRow.optionalClaimItemsDto.recoveryCode,
     intercept: dataRow.optionalClaimItemsDto.interceptReason,
     paperInfo: dataRow.optionalClaimItemsDto.paperDocInd,
     referral: dataRow.optionalClaimItemsDto.oopReferral,
     goodFaith: dataRow.optionalClaimItemsDto.goodFaith,
     confidential: dataRow.optionalClaimItemsDto.confidentialInd,
     emsaf: dataRow.optionalClaimItemsDto.emsafInd,
     dignosticSecondary: dataRow.optionalClaimItemsDto.diagnostic2,
     dignosticTeritary: dataRow.optionalClaimItemsDto.diagnostic3,
     paidAmount: dataRow.mandatoryClaimItemsDto.paidAmount,
     explanationCode: dataRow.explanatoryCode,
     comment: dataRow.comment,
     claimNumberPayment: dataRow.paymentInfoDto.claimNum||'',
     reassessment: dataRow.paymentInfoDto.reassessmentReason,
     assessment: dataRow.paymentInfoDto.assessmentAction,
     refNumber: dataRow.paymentInfoDto.referenceNum,
     expPaymentDate: this.changeDateFormatService.convertStringDateToObject(dataRow.paymentInfoDto.expectedPaymentDate),
     assessmentDate: this.changeDateFormatService.convertStringDateToObject(dataRow.paymentInfoDto.assessmentDate),
     explanationCodes: dataRow.paymentInfoDto.explanationCodes,
     status: dataRow.paymentInfoDto.emsafStatus,
     feeModifiers: dataRow.paymentInfoDto.feeModifier,
     frReferenceNumber: dataRow.paymentInfoDto.frReferenceNum,
     serviceRecpRegNo: dataRow.optionalClaimItemsDto.serviceRecipientRegNo // Log #1128: Client Feedback
   }
   } else {
    editData = {
      text : textVal,
      claimNumber: dataRow.mandatoryClaimItemsDto.claimNum,
      date: this.changeDateFormatService.convertStringDateToObject(dataRow.mandatoryClaimItemsDto.serviceDate),
      serviceCode: dataRow.mandatoryClaimItemsDto.serviceCode,
      toothCode: dataRow.mandatoryClaimItemsDto.toothCode,
      toothSurfaces: dataRow.mandatoryClaimItemsDto.toothSurfaces,
      timeUnits: dataRow.mandatoryClaimItemsDto.timeUnits,
      payTo: dataRow.mandatoryClaimItemsDto.payToCode,
      referring: dataRow.mandatoryClaimItemsDto.refUli ? dataRow.mandatoryClaimItemsDto.refUli : null,
      feeModifier1: dataRow.mandatoryClaimItemsDto.feeMode1,
      feeModifier2: dataRow.mandatoryClaimItemsDto.feeMode2,
      skillCode: dataRow.mandatoryClaimItemsDto.skillCode,
      functCentre: dataRow.mandatoryClaimItemsDto.functionalCenter,
      dignosticPrimary: dataRow.mandatoryClaimItemsDto.diagnostic1,
      feeClaimedAmount: this.feeClaimedAmount,
      claimStatus: dataRow.mandatoryClaimItemsDto.claimItemStatus,
      feeModifierOptional1: dataRow.optionalClaimItemsDto.feeMode3,
      encounterNumber: dataRow.optionalClaimItemsDto.encounterNum,
      locumBusNumber: dataRow.optionalClaimItemsDto.locumBusinessArrNo,
      location: dataRow.optionalClaimItemsDto.location,
      recovery: dataRow.optionalClaimItemsDto.recoveryCode,
      intercept: dataRow.optionalClaimItemsDto.interceptReason,
      paperInfo: dataRow.optionalClaimItemsDto.paperDocInd,
      referral: dataRow.optionalClaimItemsDto.oopReferral,
      goodFaith: dataRow.optionalClaimItemsDto.goodFaith,
      confidential: dataRow.optionalClaimItemsDto.confidentialInd,
      emsaf: dataRow.optionalClaimItemsDto.emsafInd,
      dignosticSecondary: dataRow.optionalClaimItemsDto.diagnostic2,
      dignosticTeritary: dataRow.optionalClaimItemsDto.diagnostic3,
      paidAmount: dataRow.mandatoryClaimItemsDto.paidAmount,
      explanationCode: dataRow.explanatoryCode,
      comment: dataRow.comment,
      claimNumberPayment: dataRow.paymentInfoDto.claimNum||'',
      reassessment: dataRow.paymentInfoDto.reassessmentReason,
      assessment: dataRow.paymentInfoDto.assessmentAction,
      refNumber: dataRow.paymentInfoDto.referenceNum,
      expPaymentDate: this.changeDateFormatService.convertStringDateToObject(dataRow.paymentInfoDto.expectedPaymentDate),
      assessmentDate: this.changeDateFormatService.convertStringDateToObject(dataRow.paymentInfoDto.assessmentDate),
      explanationCodes: dataRow.paymentInfoDto.explanationCodes,
      status: dataRow.paymentInfoDto.emsafStatus,
      feeModifiers: dataRow.paymentInfoDto.feeModifier,
      frReferenceNumber: dataRow.paymentInfoDto.frReferenceNum,
      serviceRecpRegNo: dataRow.optionalClaimItemsDto.serviceRecipientRegNo // Log #1128: Client Feedback
    }
   }
  // #1264
   this.forPayTo = editData.payTo
   this.dataEntryService.emitPayToSection.emit(this.forPayTo)
}
    this.skillCode = dataRow.mandatoryClaimItemsDto.skillCode;
    this.functCentre = dataRow.mandatoryClaimItemsDto.functionalCenter;
    this.ClaimItemBelowFormGroup.patchValue(editData);
    this.checkAction(this.ClaimItemBelowFormGroup.value.action)
    this.savedMandatoryClaimNumber = editData.claimNumber||'';

    // Log #1105: Client Feedback
    this.getDigitCode(editData.claimNumber||'')

    let validRecoveryCodes = ["AB", "BC", "MB", "NB", "NL", "NT", "NS", "ON", "NU", "SK", "YT", "PE"];

      let isValidCode = validRecoveryCodes.includes(dataRow.optionalClaimItemsDto.recoveryCode);
    if (dataRow.optionalClaimItemsDto.goodFaith == "Y") {
      this.disableClaimantAddress = false
    } else if (dataRow.mandatoryClaimItemsDto.payToCode == 'OTHR') {
      this.disableClaimantAddress=false;
    } else if(isValidCode) {
      this.disableClaimantAddress = false
    }
    
    else {
      if(this.isClaimSubmitted){
      this.disableClaimantAddress = false
      }
      else{
      this.disableClaimantAddress = true
      }
    }
    if (dataRow.claimantDto) {
      this.btnText = "Update"
      this.claimantKey = dataRow.claimantDto.claimantKey
      this.goodFaithDto = {
        claimantKey: dataRow.claimantDto.claimantKey,
        phn: dataRow.claimantDto.phn,
        firstName: dataRow.claimantDto.firstName,
        middleName: dataRow.claimantDto.middleName,
        lastName: dataRow.claimantDto.lastName,
        dob: dataRow.claimantDto.dob,
        gender: dataRow.claimantDto.gender,
        addressLine1: dataRow.claimantDto.addressLine1,
        addressLine2: dataRow.claimantDto.addressLine2,
        postalCode: dataRow.claimantDto.postalCode,
        city: dataRow.claimantDto.city,
        province: dataRow.claimantDto.province,
        country: dataRow.claimantDto.country
      }
    } else {
      this.goodFaithDto = {}
      this.claimantKey = ""
    }
    $('#decMandatory_PayTo').val(dataRow.mandatoryClaimItemsDto.payToCode);
  }
    /* change functionality for (#1264) */
  CancelInfo(i,dataRow,cancelOnBlur) {
    this.forTimeUnitsVal = false;
    this.forAddNewClaimDisable = false
    this.showErrorMsg = false
    this.claimsComponent.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('payTo').disable()
    this.claimsComponent.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('action').disable()
    let promise = new Promise((resolve, reject) => {
      if(i == -2){
        this.cancelClaimItem = false;
      } else{
    if(i == 0){
      var value = 0
      this.selectedRowId =  value.toString()
      dataRow.id = -1
      resolve();
    }else{
      this.selectedRowId = ""
      resolve();
    }
    this.rowVisible=false         //for #1264 (close for row after ADD NEW Claim)
    this.notClaimItemSaveMode = true
    this.dataEntryService.addnewClicked.emit(false)
    this.claimEditMode = false;
    this.dataEntryService.claimItemMode.emit(this.claimEditMode)
    this.claimAddMode = false;
     this.hideBelowForm = false;
    this.dataEntryService.disableSave.emit(false)
    if (cancelOnBlur == 1) {
      
      var arrClaimItems = this.arrClaimItems;
      if(cancelOnBlur == 1 && this.disableAdd ==true){
        this.claimEditMode = true
        resolve();
      }
      else{
        this.claimEditMode = true
        resolve();
      }
      this.saveDataEntryClaim(i,dataRow,true).then(row => {
      {
        
        var index = i + 1
        var dataRowValue = arrClaimItems[index]
        
        this.EditItemInfo(index, dataRowValue, true)
        this.editMode = false;
        
        var totalLength = arrClaimItems.length - 1
        if (totalLength == i) {
          this.forAddNewClaimDisable = false
        }
      }
      });
      this.forAddNewClaimDisable = false
      this.showErrorMsg = false;
       this.hideOptionalForms = true
      resolve();
    }
  }
    resolve();
  });
  return promise;

  }

  isvalidRecory(value){
    let val = value;
    let validRecoveryCodes = ["AB", "BC", "MB", "NB", "NL", "NT", "NS", "ON", "NU", "SK", "YT", "PE"];
    if (val != '') {


      let isValidCode = validRecoveryCodes.includes(val);
      return isValidCode;
  }else{
    return false
  }
}

  enableRecoveryAddress(event) {
    let val = event.target.value;
    let validRecoveryCodes = ["AB", "BC", "MB", "NB", "NL", "NT", "NS", "ON", "NU", "SK", "YT", "PE"];
    if (val != '') {
      let isValidCode = validRecoveryCodes.includes(val);
      if (isValidCode) {
        this.exDialog.openMessage((this.translate.instant('Please make sure to add claimant Address.')))
          .subscribe((value) => {
            if (!value) {
              document.getElementById('decMandatory_DignosticPrimary').focus()
            }
            this.disableClaimantAddress = false
            this.btnText = "Save"
          })
        let self = this
        setTimeout(() => {
          document.getElementById('closePopupButton').focus()
          self.editStatusValue()
        }, 2000);
      } else {
        this.ClaimItemBelowFormGroup.controls.recovery.setErrors({ "invalidRCode": true })
        if(this.ClaimItemBelowFormGroup.value.payTo=='OTHR' || this.ClaimItemBelowFormGroup.value.goodFaith =="Y"){
          this.disableClaimantAddress = false
        }else{
          this.disableClaimantAddress = true
        }
      }
    } else {
      this.ClaimItemBelowFormGroup.controls.recovery.setErrors(null)
    }
  }

  enableGoodFaithAddress(event) {
    
   this.showErrorMsg = true;    //#1264
    if (event.target.value == "Y") {
      var action = ""
      this.exDialog.openMessage((this.translate.instant('claims.claims-toaster.sureToAddClaimantAddress')))
        .subscribe((value) => {
          if (!value) {
            document.getElementById('decMandatory_DignosticPrimary').focus()
          }
          this.disableClaimantAddress = false
          this.btnText = "Save"
        })
      setTimeout(() => {
        document.getElementById('closePopupButton').focus()

      }, 2000);
        setTimeout(() => {
        document.getElementById('decMandatory_text').focus()    //#1264

      }, 2000);
    } else {
      
      let validRecov = false

      if(this.ClaimItemBelowFormGroup.controls.recovery.value){
         validRecov = this.isvalidRecory(this.ClaimItemBelowFormGroup.controls.recovery.value);
      }
    
      if(validRecov || this.ClaimItemBelowFormGroup.value.payTo =="OTHR"){
        this.disableClaimantAddress = false
      }else{
        this.disableClaimantAddress = true
      }
    }

  }

  openModal(mymodal) {
    mymodal.open();
    if (this.patientHcVal) {
      this.EditClaimantAddressForm.patchValue({ 'phn': this.patientHcVal })
    }else{
    }
    if (this.goodFaithDto) {
      this.btnText = "Update"
      this.EditClaimantAddressForm.patchValue(
        {
          'phn':  this.goodFaithDto.phn,
          'firstName': this.goodFaithDto.firstName,
          'middleName': this.goodFaithDto.middleName,
          'lastName': this.goodFaithDto.lastName,
          'dob': this.changeDateFormatService.convertStringDateToObject(this.goodFaithDto.dob),
          'gender': this.goodFaithDto.gender,
          'addressLine1': this.goodFaithDto.addressLine1,
          'addressLine2': this.goodFaithDto.addressLine2,
          'postalCode': this.goodFaithDto.postalCode,
          'city': this.goodFaithDto.city,
          'province': this.goodFaithDto.province,
          'country': this.goodFaithDto.country
        }
      )
    }

  }

  getAutoGeneratedClaimItemNumber() {
    this.hmsDataService.getApi(DataEntryApi.getAutoGeneratedClaimItemNumberUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.savedMandatoryClaimNumber = data.result;
      }
      else {
      }
      error => {
      }
    })
  }

  saveClaimantAddress(closeModal) {
    if (this.EditClaimantAddressForm.valid) {
      this.goodFaithDto = {
        "claimantKey": this.claimantKey,
        "phn": this.EditClaimantAddressForm.value.phn,
        "firstName": this.EditClaimantAddressForm.value.firstName,
        "middleName": this.EditClaimantAddressForm.value.middleName,
        "lastName": this.EditClaimantAddressForm.value.lastName,
        "dob": this.changeDateFormatService.convertDateObjectToString(this.EditClaimantAddressForm.value.dob),
        "gender": this.EditClaimantAddressForm.value.gender,
        "addressLine1": this.EditClaimantAddressForm.value.addressLine1,
        "addressLine2": this.EditClaimantAddressForm.value.addressLine2,
        "postalCode": this.EditClaimantAddressForm.value.postalCode,
        "city": this.EditClaimantAddressForm.value.city,
        "province": this.EditClaimantAddressForm.value.province,
        "country": this.EditClaimantAddressForm.value.country
      }
      if (this.claimantKey != "") {
        this.toastrService.success("Claimant Address Updated Successfully")
      } else {
        this.toastrService.success("Claimant Address Added Successfully")
      }
      this.closeModal(closeModal)
    }
    else {
      this.validateAllFormFields(this.EditClaimantAddressForm);
    }
  }

  isCompanyPostalcodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CardApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataService.postApi(URL, postalNumber).subscribe(data => {

        switch (data.code) {
          case 404:
            this.EditClaimantAddressForm.controls['postalCode'].setErrors(
              {
                "postalcodeNotFound": true
              });
            break;
          case 302:
            this.EditClaimantAddressForm.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            break;
        }

      });
    }
  }

  isCompanyPostalVerifyValid(event, fieldName) {

    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (fieldName) {
        case 'city':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.EditClaimantAddressForm.get('country').value,
            provinceName: this.EditClaimantAddressForm.get('province').value,
            postalCd: this.EditClaimantAddressForm.get('postalCode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'country':
          fieldParameter = {
            cityName: this.EditClaimantAddressForm.get('city').value,
            countryName: event.target.value,
            provinceName: this.EditClaimantAddressForm.get('province').value,
            postalCd: this.EditClaimantAddressForm.get('postalCode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'province':
          fieldParameter = {
            cityName: this.EditClaimantAddressForm.get('city').value,
            countryName: this.EditClaimantAddressForm.get('country').value,
            provinceName: event.target.value,
            postalCd: this.EditClaimantAddressForm.get('postalCode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = CardApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.EditClaimantAddressForm.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.EditClaimantAddressForm.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });

            break;
        }

      });
    }

  }

  closeModal(myModal) {
    myModal.close();
    this.EditClaimantAddressForm.reset()
  }

  getFeeModifier() {
    let url = DataEntryApi.getFeeModifier
    this.feeModifierRemoteLower = this.completerService.remote(
      null,
      "feeModifierCode",
      "feeModifierCode"
    );
    this.feeModifierRemoteLower.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.feeModifierRemoteLower.urlFormater((term: any) => {
      return url + `/${term}`;
    });
    this.feeModifierRemoteLower.dataField('result');

    $("#decOptional_FeeModifier1").focus();
  }
  /* change functionality for (#1264) */
  DeleteInfo(idx, dataRow) {
    this.showErrorMsg = false
    var action = "Delete";
    this.claimAddMode = true;
    if (dataRow && dataRow.claimItemKey) {
      this.claimAddMode = false;
    }
    this.exDialog.openConfirm((this.translate.instant('claims.exDialog.are-you-sure')) + action + (this.translate.instant('claims.exDialog.record'))).subscribe((value) => {
      if (value) {
        this.claimEditMode = false;
        if (this.claimAddMode) {
          this.claimAddMode=false
          this.ClaimItemBelowFormGroup.reset()
          this.arrClaimItems.splice(idx, 1);
          this.dataEntryService.ClaimItemInsert.emit(this.arrClaimItems);
          this.claimEditMode = false;
        }
        else {
          if (dataRow.claimItemKey) {
            var URL = DataEntryApi.deleteClaimItemAhcUrl + '/' + dataRow.claimItemKey;
            this.hmsDataService.getApi(URL).subscribe(data => {
              if (data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
                this.toastrService.success(this.translate.instant('claims.claims-toaster.record-deleted-successfully'));
                this.arrClaimItems.splice(idx, 1);
                this.reloadTable()
              }
            });
          }
        }
        this.dataEntryService.disableSave.emit(false)
      }
    })
  }

  onserviceCodeChange(serviceCode) {
    this.arrServiceCode =
      [
        { 'id': '1', 'code': '71101' },
        { 'id': '2', 'code': '90154' },
        { 'id': '3', 'code': '90002' },
        { 'id': '4', 'code': '8003' },
        { 'id': '5', 'code': '9021' }

      ]
    let url = DataEntryApi.getServiceCode
    var RequestedData = {
      "serviceCode": serviceCode
    }
    this.hmsDataService.postApi(url, RequestedData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        if (data.result.exist == true) {
          this.ClaimItemBelowFormGroup.controls['serviceCode'].setErrors(null);

          var filteredCode = this.arrServiceCode.filter(val => val.code == serviceCode).map(data => data.code)
          if (filteredCode[0]) {

            this.ClaimItemBelowFormGroup.get('referring').setValidators(Validators.required);
            this.disableRefrULI = false
            this.ClaimItemBelowFormGroup.get('referring').updateValueAndValidity()
          } else {
            this.ClaimItemBelowFormGroup.get('referring').clearValidators();
            this.disableRefrULI = true
            this.ClaimItemBelowFormGroup.get('referring').updateValueAndValidity()

          }
        }
      } if (data.code == 404 && data.status === "NOT_FOUND") {
        if (data.result.exist == false) {
          this.ClaimItemBelowFormGroup.controls['serviceCode'].setErrors({
            "serviceCodeNotExist": true
          });
          this.ClaimItemBelowFormGroup.get('referring').clearValidators();
          this.disableRefrULI = true
          this.ClaimItemBelowFormGroup.get('referring').updateValueAndValidity()
        }
      }
    });
  }

  onSelectFeeModifier(item: any, value) {
    let val;
    if (item != null) {
      val = item.title || item.id;
    }
    else {
      val = ""
    }
    this.ClaimItemBelowFormGroup.controls[value].setValue(val);
    if (value == 'skillCode') {
      this.selectedSkillCodeVal = val
    } if (value == 'functCentre') {
      this.selectedFuncCentreVal = val
    }
  }

  onDeselectFeeModifier(item: any, value) {
    this.ClaimItemBelowFormGroup.controls[value].setValue('');
  }

  checkAction(value) {
    this.editStatusValue();
    if (this.ClaimItemBelowFormGroup.value.action && this.ClaimItemBelowFormGroup.value.action == 'A') {
      this.disableReasses = true
    }
    else {
      this.disableReasses = false
    }
  }

  onReferringULISelect(selected: CompleterItem) {
    if (selected) {
      this.selectedProcDesc = selected.originalObject.providerUli;
    } else {
    }
  }

  onServiceCodeSelect(selected: CompleterItem) {
    this.editStatusValue();
    if (selected) {
      this.selectedServiceCode = selected.originalObject.serviceCode;
    } else {
    }
  }
  paytoChange(e) {

    if (e.target.value == "OTHR") {
      this.exDialog.openMessage((this.translate.instant('Please make sure to add claimant Address.')))
          .subscribe((value) => {
            if (!value) {
              document.getElementById('decMandatory_DignosticPrimary').focus()
            }
          })
      this.disableClaimantAddress = false
    } else {
      
      let validRecov = false
      if(this.ClaimItemBelowFormGroup.controls.recovery.value){
         validRecov = this.isvalidRecory(this.ClaimItemBelowFormGroup.controls.recovery.value);
      }
    
      if(validRecov || this.ClaimItemBelowFormGroup.value.goodFaith =="Y"){
        this.disableClaimantAddress = false
      }else{
        this.disableClaimantAddress = true
      }
     
    }
  }
  editStatusValue(feild = null) {
    if (feild == 'functCentre' || feild == 'skillCode' || feild == 'feeModifier1' || feild == 'feeModifier2' || feild == 'feeModifierOptional1') {
      let id = "#" + feild
      this.onSelectFeeModifier({ 'title': $(id).val() }, feild)
    }
    if (this.ClaimItemBelowFormGroup.controls.payTo.touched ||
      this.ClaimItemBelowFormGroup.controls.date.touched ||
      this.ClaimItemBelowFormGroup.controls.serviceCode.touched ||
      this.ClaimItemBelowFormGroup.controls.referring.touched ||
      this.ClaimItemBelowFormGroup.controls.dignosticPrimary.touched ||
      this.ClaimItemBelowFormGroup.controls.feeClaimedAmount.touched ||
      this.ClaimItemBelowFormGroup.controls.timeUnits.touched ||
      this.ClaimItemBelowFormGroup.controls.functCentre.touched ||
      this.ClaimItemBelowFormGroup.controls.skillCode.touched ||
      this.ClaimItemBelowFormGroup.controls.feeModifier1.touched ||
      this.ClaimItemBelowFormGroup.controls.feeModifier2.touched ||
      this.ClaimItemBelowFormGroup.controls.action.touched ||
      this.ClaimItemBelowFormGroup.controls.text.touched ||
      this.ClaimItemBelowFormGroup.controls.toothCode.touched ||
      this.ClaimItemBelowFormGroup.controls.toothSurfaces.touched ||
      this.ClaimItemBelowFormGroup.controls.encounterNumber.touched ||
      this.ClaimItemBelowFormGroup.controls.feeModifierOptional1.touched ||
      this.ClaimItemBelowFormGroup.controls.locumBusNumber.touched ||
      this.ClaimItemBelowFormGroup.controls.location.touched ||
      this.ClaimItemBelowFormGroup.controls.recovery.touched ||
      this.ClaimItemBelowFormGroup.controls.intercept.touched ||
      this.ClaimItemBelowFormGroup.controls.paperInfo.touched ||
      this.ClaimItemBelowFormGroup.controls.referral.touched ||
      this.ClaimItemBelowFormGroup.controls.confidential.touched ||
      this.ClaimItemBelowFormGroup.controls.emsaf.touched ||
      this.ClaimItemBelowFormGroup.controls.dignosticSecondary.touched ||
      this.ClaimItemBelowFormGroup.controls.dignosticTeritary.touched ||
      this.ClaimItemBelowFormGroup.controls.goodFaith.touched ||
      this.ClaimItemBelowFormGroup.controls.explanationCode.touched ||
      this.ClaimItemBelowFormGroup.controls.serviceRecpRegNo.touched ||
      this.ClaimItemBelowFormGroup.controls.comment.touched) {
      this.ClaimItemBelowFormGroup.patchValue({ 'editStatus': 'CHANGED' })
    }
    else if (this.editStatusPatchValue == 'CHANGED') {
      this.ClaimItemBelowFormGroup.patchValue({ 'editStatus': 'CHANGED' })
    }
    else {
      this.ClaimItemBelowFormGroup.patchValue({ 'editStatus': 'SAVED' })
    }
  }

  getExplanatoryCodeList() {
    this.getExplanatoryCodeListObject = [];
    if (this.ClaimItemBelowFormGroup.value.explanationCode != '' && this.ClaimItemBelowFormGroup.value.explanationCode != null) {
      var getExplanatoryUrl = DataEntryApi.getExplanatoryCodeListUrl;
      this.hmsDataService.postApi(getExplanatoryUrl, { explanatoryCode: this.ClaimItemBelowFormGroup.value.explanationCode }).subscribe(data => {

        if (data.code == 200) {
          this.getExplanatoryCodeListObject = data.result.data;
        } else {
          this.showMessage = "No Codes to show";
        }

      });
    } else {
      this.showMessage = "No Codes to show";
    }

  }
  getExplanatoryCodeSecondList() {
    this.getExplanatoryCodeListObject = [];
    if (this.ClaimItemBelowFormGroup.value.explanationCodes != '' && this.ClaimItemBelowFormGroup.value.explanationCodes != null) {
      let explanatiosCodes = this.ClaimItemBelowFormGroup.value.explanationCodes.split(" ");
      var getExplanatoryUrl = DataEntryApi.getExplanatoryCodeListUrl;
     
      this.hmsDataService.postApi(getExplanatoryUrl, { explanatoryCode: this.ClaimItemBelowFormGroup.value.explanationCodes }).subscribe(data => {

        if (data.code == 200) {
          this.getExplanatoryCodeListObject = data.result.data;
        } else {
          this.showMessage = "No Codes to Show";
        }

      });
    } else {
      this.showMessage = "No Codes to Show";
    }

  }

  CIableEditMode() {
    $('#btnCancelClaim').trigger('click')
    this.claimsComponent.enableEditMode();
    if (this.batchStatusSubmitted) {
      if ($("#row_0").length > 0) {
        $("#row_0").trigger('click')
      }
    } else {
      if ($("#edit_0").length > 0) {
        $("#edit_0").trigger('click')
      }
    }
  }
  addneew() {
  }
  CIsaveDataEntryClaim(mode) {
    this.claimsComponent.saveDataEntryClaim(mode);
  }

  CIduplicate() {
    this.claimsComponent.duplicate();  
  }
  /* for #1264 by mukul (start) */ 
  resetNewRecord()
  {
    this.rowVisible=false;
    this.arrMandatorySection.claim = ""
    this.arrMandatorySection.serviceCode = ""
    this.arrMandatorySection.refUlI = ""
    this.arrMandatorySection.feeClaimedAmount = ""
    this.arrMandatorySection.paidAmount = ""
    this.arrMandatorySection.timeUnits = ""
    this.arrMandatorySection.feeModifier1 = ""
    this.arrMandatorySection.feeModifier2 = ""
    this.arrMandatorySection.encounterNumber = "1"
    if(this.disciplineKey == 'V' && this.doTrigger == 1){
      if (this.arrClaimItems.length > 0) {
        let index = 0;
        index = this.arrClaimItems.length - 1;
        let lastEntry = this.arrClaimItems[index]
        this.claimItemDate = (lastEntry.mandatoryClaimItemsDto.serviceDate)

      }  
    this.arrMandatorySection.claim = ""
    this.arrMandatorySection.serviceDate = this.claimItemDate
    this.arrMandatorySection.serviceCode = ""
    this.arrMandatorySection.refUlI = ""
    this.arrMandatorySection.dignosticPrimary= ""
    this.arrMandatorySection.feeClaimedAmount = ""
    this.arrMandatorySection.paidAmount = ""
    this.arrMandatorySection.timeUnits = ""
    this.arrMandatorySection.functCentre = ""
    this.arrMandatorySection.skillCode = 'OPTO'
    this.arrMandatorySection.feeModifier1 = ""
    this.arrMandatorySection.feeModifier2 = ""
    this.doTrigger = 0
    }
    
    this.selectedRowId = '';
  }
  ChangeInputDateFormat(idx, event) {
    
    let inputDate = event.target;
    if (inputDate.value != '') {
      var obj = this.changeDateFormatService.changeDateFormatLessThanCurrentMonth(inputDate);
      var self = this
      var todaydate = this.changeDateFormatService.getToday();
      if (obj == null) {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.invalid-date'), '', {
          timeOut: 8000,
        });
        if (this.addMode) {
           this.arrMandatorySection.serviceDate = '';
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
          txtDate.focus();
        }
        else {
          this.arrClaimItems[idx].date = '';
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
          txtDate.focus();
        }
      }
      else {
        
        var IsInValid = false;
          if (IsInValid) {
            this.toastrService.warning(this.translate.instant('claims.claims-toaster.service-date-cannot-be-greater'), '', {
              timeOut: 8000,
            });
            if (this.addMode) {
              this.arrMandatorySection.serviceDate = '';
              var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
              txtDate.focus();
            }
            else {
              this.arrClaimItems[idx].date = '';
              var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
              txtDate.focus();
            }
          }
          else {
            var returnDateInString = this.changeDateFormatService.convertDateObjectToString(obj);
            if (this.forEmptyDate) {
              this.arrMandatorySection.serviceDate = this.changeDateFormatService.changeDateByMonthName(returnDateInString);
            }
            else {
              this.arrClaimItems[idx].date = this.changeDateFormatService.changeDateByMonthName(returnDateInString);
            }
          }
        }
      }
    }
    /* for #1264 (end) */
  CIdelete() {
    this.claimsComponent.delete();
  }
  deleteClaim() {
    this.claimsComponent.deleteClaim();
  }

  /* Log #1093:  Get Diagnostic Code List  */
  getDignosticRemoteData() {
    this.dignosticCodeRemote = this.completerService.remote(
      null,
      "diagnosticCode",
      "diagnosticCode"
    );
    this.dignosticCodeRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.dignosticCodeRemote.urlFormater((term: any) => {
      return DataEntryApi.getDiagnosticCodListUrl + `/${term}`;
    });
    this.dignosticCodeRemote.dataField('result');
  }

  onDiagnosticCodeSelect(selected: CompleterItem) {
    this.editStatusValue();
    if (selected) {
      this.selectedDiagnosticCode = selected.originalObject.diagnosticCode;
    } else {
      this.selectedDiagnosticCode = ''
    }
  }

  getFeeModifierList() {
    var RequestedData = {
      "start": this.itemStart,
      "length": 300
    }
    this.hmsDataService.postApi(DataEntryApi.getFeeModifierListUrl, RequestedData).subscribe(data => {
      let feeModArray = []
      if (data.status != "NOT_FOUND") {

        for (var i = 0; i < data.result.length; i++) {
          feeModArray.push({ 'id': data.result[i].feeModifierCode, 'itemName': data.result[i].feeModifierCode })
        }
        // For Fee Modifier 1
        this.feeModifierList = this.completerService.local(
          feeModArray,
          "id",
          "itemName"
        );
        // For Fee Modifier 2
        this.feeModifier2List = this.completerService.local(
          feeModArray,
          "id",
          "itemName"
        )
        // For Fee Modifier 3
        this.feeModifier3List = this.completerService.local(
          feeModArray,
          "id",
          "itemName"
        )
      } else {
        this.feeModifierList = this.completerService.local(
          feeModArray,
          "id",
          "itemName"
        );
        this.feeModifier2List = this.completerService.local(
          feeModArray,
          "id",
          "itemName"
        );
        this.feeModifier3List = this.completerService.local(
          feeModArray,
          "id",
          "itemName"
        );
      }
    })
  }

  /* Log #1111 */
  getMandatoryOptionalFields() {
    if (this.batchStatusCheck == 'S') {
      this.batchStatusSubmitted = true
    } else {
      this.batchStatusSubmitted = false
    }
  }

  getMandoatoryOptionalDisabledFields() {
    this.ClaimItemBelowFormGroup.controls.payTo.disable()
    this.ClaimItemBelowFormGroup.controls.date.disable();
    this.ClaimItemBelowFormGroup.controls.serviceCode.disable()
    this.ClaimItemBelowFormGroup.controls.referring.disable()
    this.ClaimItemBelowFormGroup.controls.dignosticPrimary.disable()
    this.ClaimItemBelowFormGroup.controls.feeClaimedAmount.disable()
    this.ClaimItemBelowFormGroup.controls.timeUnits.disable()
    this.ClaimItemBelowFormGroup.controls.functCentre.disable()
    this.ClaimItemBelowFormGroup.controls.skillCode.disable()
    this.ClaimItemBelowFormGroup.controls.feeModifier1.disable()
    this.ClaimItemBelowFormGroup.controls.feeModifier2.disable()
    this.ClaimItemBelowFormGroup.controls.action.disable()
    this.ClaimItemBelowFormGroup.controls.text.disable()
    this.ClaimItemBelowFormGroup.controls.toothCode.disable()
    this.ClaimItemBelowFormGroup.controls.toothSurfaces.disable()
    this.ClaimItemBelowFormGroup.controls.encounterNumber.disable()
    this.ClaimItemBelowFormGroup.controls.feeModifierOptional1.disable()
    this.ClaimItemBelowFormGroup.controls.locumBusNumber.disable()
    this.ClaimItemBelowFormGroup.controls.location.disable()
    this.ClaimItemBelowFormGroup.controls.recovery.disable()
    this.ClaimItemBelowFormGroup.controls.intercept.disable()
    this.ClaimItemBelowFormGroup.controls.paperInfo.disable()
    this.ClaimItemBelowFormGroup.controls.referral.disable()
    this.ClaimItemBelowFormGroup.controls.confidential.disable()
    this.ClaimItemBelowFormGroup.controls.emsaf.disable()
    this.ClaimItemBelowFormGroup.controls.dignosticSecondary.disable()
    this.ClaimItemBelowFormGroup.controls.dignosticTeritary.disable()
    this.ClaimItemBelowFormGroup.controls.goodFaith.disable()
    this.ClaimItemBelowFormGroup.controls.serviceRecpRegNo.disable()
  }

  getMandatoryOptionalEnabledFields() {
    this.isReassessFormDisabled = false
    this.ClaimItemBelowFormGroup.controls.payTo.enable()
    this.ClaimItemBelowFormGroup.controls.date.enable();
    this.ClaimItemBelowFormGroup.controls.serviceCode.enable()
    this.ClaimItemBelowFormGroup.controls.referring.enable()
    this.ClaimItemBelowFormGroup.controls.dignosticPrimary.enable()
    this.ClaimItemBelowFormGroup.controls.feeClaimedAmount.enable()
    this.ClaimItemBelowFormGroup.controls.timeUnits.enable()
    this.ClaimItemBelowFormGroup.controls.functCentre.enable()
    this.ClaimItemBelowFormGroup.controls.skillCode.enable()
    this.ClaimItemBelowFormGroup.controls.feeModifier1.enable()
    this.ClaimItemBelowFormGroup.controls.feeModifier2.enable()
    this.ClaimItemBelowFormGroup.controls.action.enable()
    this.ClaimItemBelowFormGroup.controls.text.enable()
    this.ClaimItemBelowFormGroup.controls.toothCode.enable()
    this.ClaimItemBelowFormGroup.controls.toothSurfaces.enable()
    this.ClaimItemBelowFormGroup.controls.encounterNumber.enable()
    this.ClaimItemBelowFormGroup.controls.feeModifierOptional1.enable()
    this.ClaimItemBelowFormGroup.controls.locumBusNumber.enable()
    this.ClaimItemBelowFormGroup.controls.location.enable()
    this.ClaimItemBelowFormGroup.controls.recovery.enable()
    this.ClaimItemBelowFormGroup.controls.intercept.enable()
    this.ClaimItemBelowFormGroup.controls.paperInfo.enable()
    this.ClaimItemBelowFormGroup.controls.referral.enable()
    this.ClaimItemBelowFormGroup.controls.confidential.enable()
    this.ClaimItemBelowFormGroup.controls.emsaf.enable()
    this.ClaimItemBelowFormGroup.controls.dignosticSecondary.enable()
    this.ClaimItemBelowFormGroup.controls.dignosticTeritary.enable()
    this.ClaimItemBelowFormGroup.controls.goodFaith.enable()
    this.ClaimItemBelowFormGroup.controls.serviceRecpRegNo.enable()
  }

  // Log #1112
  getClaimAmount(col) {
    let sum = 0;
    for (let i = 0; i < this.arrClaimItems.length; i++) {
      let val = 0;
      if (this.arrClaimItems[i].mandatoryClaimItemsDto[col] != '' && this.arrClaimItems[i].mandatoryClaimItemsDto[col] != null && this.arrClaimItems[i].mandatoryClaimItemsDto[col] != undefined) {
        val = +this.arrClaimItems[i].mandatoryClaimItemsDto[col];
      }
      sum += val;
    }
    return sum;
  }

  // Log #1105
  getDigitCode(code) {
    let reqData = {
      "claimItemNumber": code
    }
    this.hmsDataService.postApi(DataEntryApi.checkDigitCodeUrl, reqData).subscribe(data => {
      this.digitCode = data
    })
  }

  // #1111 : New Feddback 
  getRowData(dataRow) {
    this.rowData = dataRow
    if (this.rowData.mandatoryClaimItemsDto.claimItemStatus == "S") {
      this.claimItemSubmitted = true
    } else if (this.rowData.mandatoryClaimItemsDto.claimItemStatus == "U") {
      this.claimItemSubmitted = false
    } else {
    }
    if (this.batchStatusSubmitted) {
      if (this.claimItemSubmitted && this.batchStatusSubmitted) {
          this.isClaimSubmitted = true
          this.getMandoatoryOptionalDisabledFields()
      } else {
        this.isClaimSubmitted = false
        this.getMandatoryOptionalEnabledFields();
      }
    }
  }

  reassessClicked() {
    var RequestedData = {};
    this.userId = localStorage.getItem('id')
    if (!this.addMode) {
      RequestedData['claimInfoDto'] = {}
      RequestedData['claimItemKey'] = this.claimItemKey
      if (!this.claimAddMode) {
        this.isReassessed = true
        RequestedData['claimInfoDto']['claimItemsInfoDto'] = this.claimItem(this.ClaimItemBelowFormGroup.value)
        RequestedData['claimInfoDto']['userId'] = this.userId;
        RequestedData['claimKey'] = this.claimKey
        RequestedData['claimInfoDto']['claimItemsInfoDto']['mandatoryClaimItemsDto']['claimItemStatus'] = 'U'
        this.hmsDataService.postApi(DataEntryApi.updateClaimItemInBatchUrl, RequestedData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.getClaimItems(false);
            this.isClaimSubmitted = false
            let request = {
              "claimItemKey": this.claimItemKey,
              "claimItemPaymentKey": this.claimItemPaymentKey
            }
            this.hmsDataService.postApi(DataEntryApi.getAhcClaimItemUrl, request).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                this.claimItemStatus = data.result.mandatoryClaimItemsDto.claimItemStatus
              }
            });
          } if (data.code == 400 && data.status === "BAD_REQ") {
            this.toastrService.error('Claim Item Not Updated Successfully!');
          }
        });
      }
    }
  }
  // To show digit code in view mode.
  getValuesOfDigitCode(claimNum){
      let promise = new Promise((resolve, reject) => {
      let reqData = {
        "claimItemNumber": claimNum
      }
      this.hmsDataService.postApi(DataEntryApi.checkDigitCodeUrl, reqData).subscribe(data => {
        let digitCode = data
        this.digitCodeArray.push(digitCode)
        resolve();
        });
    });
    return promise;
  }

  onEnterSaveInfo() {
    this.saveDataEntryClaim('',this.arrMandatorySection,true);
    this.AddNew(1) 
  }
  
  OnEnterPress(i, dataRow) {
    this.saveDataEntryClaim(i,dataRow,true).then(row => {
     this.AddNew(1)
    });
  }

  onKeyPressEvent(event){
    let EnterPress = event.keyCode
    if (EnterPress == 13) {
      this.onEnterSaveInfo();
    }
}

onKeyEditPressEvent(event,i,dataRow){
    let EnterPress = event.keyCode
    if (EnterPress == 13) {
      this.OnEnterPress(i,dataRow)
    }
}
}