import { Component, OnInit, Input, Output, SimpleChange } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms'; // Importing Reactive Form related classes.
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { CompleterData, CompleterService, RemoteData, CompleterItem } from 'ng2-completer';
import { DataEntryApi } from '../../data-entry-api'
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DataEntryService } from '../../data-entry.service';
import { ClaimItemComponent } from '../claim-item/claim-item.component';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { values } from 'underscore';

import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
@Component({
  selector: 'app-claim-information',
  templateUrl: './claim-information.component.html',
  styleUrls: ['./claim-information.component.css']
})
export class ClaimInformationComponent implements OnInit {
  selectedProcDesc: any;
  dentistPostalCode = [];
  @Input() addMode: boolean;
  @Input() editMode: boolean;
  @Input() viewMode: boolean;
  @Input() ClaimInformationFormGroup: FormGroup
  @Input() ClaimItemBelowFormGroup: FormGroup;
  @Input() claimInfoCheck: any
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  userID;
  user;
  showLoader: boolean;
  disablePostlCode: boolean = true
  /* coloumns for company datatable */
  columns = [
  { title: "Company No.", data: 'coID' },
  { title: "Company Name", data: 'coName' },
  { title: "City", data: 'cityName' },
  { title: "Province", data: 'provinceName' },
  { title: "Business Type", data: 'businessTypeDesc' },
  { title: "Status", data: 'status' }
  ]
  public cityDataRemoteLower: RemoteData;
  public dentistULIRemote: RemoteData;
  cityName;
  cityNameLower
  claimNumber;
  vision;
  savedClaimNumber;
  emitProviderName;
  error: any;
  arrClaimType
  StatusCheck = 'U';
  dentistPstlCde = []
  selectedItems = []
  selectedItemProvKey = []
  payToDetails = []
  dropdownSettings = {}
  dentProvKey
  providerName = ""
  arrStatus = []
  claimKey
  showBackBtn: boolean = false;
  DataEntryClaimFormGroup: any;
  isInvalid: boolean = true;
  providerFlagText = ""
  flag:boolean = false
  firstPostalCode = [];
  /*variables for #1264 (start) */ 
  disableClaimantAddress: boolean = true     
  payToProviderName = ""       
  actionValue;               
  disableAdd : boolean
  changeValue : boolean
  test
  enablePayTo : boolean
  /* for #1264 (end) */
  dropdownList = [];
  dropdownListData: any;
  public isOpen: boolean = true;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  arrAction = []
  disableReasses = false
  disablesave = false
  batchStatusSubmitted: boolean = false;
  claimInfoError: any
  error1: any
  fileSizeExceeds: boolean = false
  showRemoveBtn: boolean = false
  selectedFile
  allowedExtensions = ["application/pdf"]
  allowedValue
  batchStatus : any
  isClaimSubmitted: boolean = false
  claimItemMode;
  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    private translate: TranslateService,
    private completerService: CompleterService,
    private hmsDataService: HmsDataServiceService,
    public dataEntryService: DataEntryService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private exDialog: ExDialog,            //#1264
    private _sanitizer: DomSanitizer
  ) {

    // To get Status of claim
    this.dataEntryService.batchStatus.subscribe(val => {
      this.batchStatus = val
    })

    dataEntryService.emitProviderName.subscribe(value => {
      this.providerName = value
      if (this.route.snapshot.url[1]) {
        if ((this.route.snapshot.url[1].path == "view" || this.route.snapshot.url[1].path == "copy") && this.ClaimInformationFormGroup.value.dentistPCode) {
          this.selectedItems = [{ 'id': this.ClaimInformationFormGroup.value.dentistPCode, 'itemName': this.ClaimInformationFormGroup.value.dentistPCode }]
        }
      }
    });
    /* for #1264 (start) */ 
    dataEntryService.emitPayToSection.subscribe(value => {
      this.payToProviderName = value
      this.ClaimInformationFormGroup.patchValue({ 'payTo': this.payToProviderName })
    });

    dataEntryService.emitActionField.subscribe(value => {
      this.actionValue = value
      this.ClaimInformationFormGroup.patchValue({ 'action': this.actionValue })
    });

    dataEntryService.emitDisableAddValue.subscribe(value => {
      this.test = value
      if(this.test){
        this.changeValue = !this.test
      }
      else{
      this.disableAdd = value
      this.changeValue = this.disableAdd
    }
    });

    dataEntryService.emitPayToSectionHide.subscribe(value => {
      this.enablePayTo = value
    });
    /* for #1264 (end) */ 

    // Log #1005
    dataEntryService.emitProviderFlag.subscribe(value => {
      this.providerFlagText = value
      if(this.providerFlagText != ""){
        this.flag = true
      }else{
        this.flag = false
      }
    })
    this.error = { isError: false, errorMessage: '' };
    this.dataEntryService.emitClaimNumber.subscribe(data => {
      this.savedClaimNumber = data;
    })

    this.dataEntryService.emitClaimType.subscribe(data => {
      if (data == 2) {
        this.vision = true
      } else {
        this.vision = false
      }
    })

    dataEntryService.disableSave.subscribe(data => {
      this.disablesave = data
    })

    dataEntryService.claimItemMode.subscribe(data => {
      this.claimItemMode = data
      if(this.claimItemMode == true && this.ClaimInformationFormGroup.value.action == "A"){
        this.disableReasses = true
      }
      else{
        this.disableReasses = false
      }
    })

    dataEntryService.editReassesBtnStatus.subscribe(data => {
      if (this.route.snapshot.url[1]) {
        if (this.route.snapshot.url[1].path == "view"){
          this.disableReasses = data
        }
      }
      else {
        this.disableReasses = true
      }
      this.ClaimInformationFormGroup.controls['action'].enable();
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
    this.claimInfoError = { isError: false, errorMessage: ''}
    this.error1 = { isError: false, errorMessage: ''}
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "resetForm" && !changedProp.firstChange) {
         this.dropdownList = [];
      }
    }
  
  }

  ClaimInformationFormGroupVal = {
    batchNumber: ['', Validators.required],
    claimNumber: ['', Validators.required],
    empDate: ['', Validators.required],
    author: ['', Validators.required],
    status: ['', Validators.required],
    dentist: ['', [Validators.required, Validators.maxLength(9)]],
    dentistPCode: ['', Validators.required],
    ban: ['', [Validators.maxLength(7)]],
    facility: ['', [Validators.required, Validators.maxLength(6)]],
    patientHC: ['', [Validators.maxLength(9), Validators.minLength(1)]],
    payTo: ['',  Validators.required], //#1264
    providerKey: [''],
    providerFlag: [''],
    action: ['', Validators.required],
    comment: [''],
    documentName: ['']
  }

  ngOnInit() {
    this.getActionList();
    this.getPayTo();
    this.userID = localStorage.getItem('id');
    this.user = (localStorage.getItem('user'));
    this.getStatus();
    this.GetClaimType();
    var todaydate = this.changeDateFormatService.getToday();
    this.ClaimInformationFormGroup.patchValue({ 'empDate': todaydate });
    this.dataEntryService.emitDate.emit({ 'empDate': todaydate });
    this.dropdownSettings = Constants.angular2Multiselect
    this.ClaimInformationFormGroup.patchValue({ 'author': this.user })
    this.dataEntryService.emitDisciplineKey.emit('D')
    this.checkAction(this.ClaimInformationFormGroup.value.action)
    if (this.route.snapshot.url[1]) {
      if (this.route.snapshot.url[1].path == "view") {
        this.route.params.subscribe((params: Params) => {
          this.claimKey = params['id']
        })
        this.ClaimInformationFormGroup.patchValue({ 'payTo': this.payToProviderName })
      }
    }
    else {
      this.ClaimInformationFormGroup.patchValue({ 'payTo': 'BAPY' })     // patch value for #1264
      this.disableReasses = true;
      this.ClaimInformationFormGroup.controls['action'].disable();
      this.getAutoGeneratedClaimNumber();
      this.getBatchNo();
    }

    /* Log #1004 By */
    setTimeout(() => {
      $('#decClaimInfo_PayTo').focus()
    }, 100);
  }

  changeDateFormat(event, frmControlName, formName, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.ClaimInformationFormGroup.patchValue(datePickerValue);
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
      this.ClaimInformationFormGroup.patchValue(datePickerValue);
    }
  }

  getBatchNo() {
    this.hmsDataService.getApi(DataEntryApi.getLatestBatchNumAndKey).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.ClaimInformationFormGroup.patchValue({ 'batchNumber': data.result.batchNumber })
        if (this.dataEntryService.showBatchBackBtn) {
          this.showBackBtn = true
          this.dataEntryService.showBatchBackBtn = false
        } else {
          this.showBackBtn = false
        }
      } else {
        this.ClaimInformationFormGroup.patchValue({ 'batchNumber': '' })
      }

    })
  }


  validateDentist(singlePostalCode) {
    this.showLoader = true
   
    this.dentistPstlCde = []         //to solved AHC issue (old value show in Dentist Postal Code dropdawn)
    let SubmitInfo = {
      "providerUli": this.selectedProcDesc
    }
    this.hmsDataService.postApi(DataEntryApi.validateDentist, SubmitInfo).subscribe(data => {
      if (data.code == 404 && data.status === "NOT_FOUND") {
        this.ClaimInformationFormGroup.controls['dentist'].setErrors({
          "dentistNotValid": true
        });
        this.dentistPostalCode = []
        this.selectedItems = []
        this.ClaimInformationFormGroup.patchValue({ "dentistPCode": '' });
        this.ClaimInformationFormGroup.patchValue({ "ban": '' });
        this.ClaimInformationFormGroup.patchValue({ "facility": '' });
        this.ClaimInformationFormGroup.patchValue({ "providerKey": '' });
        this.ClaimInformationFormGroup.patchValue({ "providerFlag": '' });
        this.showLoader = false
        this.onSelectPostalCode([],'', "singlePostalCode")
        setTimeout(() => {
          $('#decClaimInfo_dentistULI').focus();
          $('#openSelects').focus();
        }, 100);
        return
      } if (data.code == 200 && data.status === "OK") {
        this.ClaimInformationFormGroup.controls['dentist'].setErrors(null);
        this.disablePostlCode = false
        this.providerName = data.result[0].provideFullName
        if(data.result[0].providerAlertMessage){
          this.providerFlagText = data.result[0].providerAlertMessage
          this.flag = true;
        }else{
          this.flag = false
        }
        this.ClaimInformationFormGroup.patchValue({ "providerFlag": data.result[0].providerAlertMessage });
        for (var i = 0; i < data.result.length; i++) { //Issue_no 766
          var itemData = '';
          if (data.result[i].businessArrangementNumber != undefined) {
            itemData = (data.result[i].postalCd) + " - " + data.result[i].businessArrangementNumber;
          } else if ((data.result[i].businessArrangementNumber != undefined || data.result[i].businessArrangementNumber != "") 
                  && (data.result[i].postalCd == undefined || data.result[i].postalCd == "")) {             // Add check (for AHC Undefined PostalCode issue)
            itemData = (data.result[i].businessArrangementNumber);
          } else if ((data.result[i].businessArrangementNumber == undefined || data.result[i].businessArrangementNumber == "") 
                  && (data.result[i].postalCd != undefined || data.result[i].postalCd != "")) {
            itemData = (data.result[i].postalCd);
          }else {
            itemData = (data.result[i].postalCd);
          }

          this.dentistPstlCde.push({ 'id': data.result[i].provAddressKey, 'provAddressKey': data.result[i].provAddressKey, 'itemName': itemData , 'facilityNum': data.result[i].facilityNumber })
          
       
        }
        if (data.result.length > 1){
          this.dropdownList = []

          for (var i = 0; i < data.result.length; i++) {
            
          if (data.result[i].businessArrangementNumber != undefined && data.result[i].postalCd != undefined) {
            itemData = (data.result[i].postalCd) + " - " + data.result[i].businessArrangementNumber;
          } else if ((data.result[i].businessArrangementNumber != undefined || data.result[i].businessArrangementNumber != "") 
                  && (data.result[i].postalCd == undefined || data.result[i].postalCd == "")) {         // Add check (for AHC Undefined PostalCode issue)
            itemData = (data.result[i].businessArrangementNumber);
          } else if ((data.result[i].businessArrangementNumber == undefined || data.result[i].businessArrangementNumber == "") 
                  && (data.result[i].postalCd != undefined || data.result[i].postalCd != "")) {
            itemData = (data.result[i].postalCd);
          } else {
            itemData = (data.result[i].postalCd);
          }
          this.dropdownList.push({ 'id': data.result[i].provKey, 'itemName': itemData})
          }
        
        for (var i = 0; i < data.result.length; i++) {
         this.dentistPstlCde.push({ 'id': data.result[i].provKey, 'provAddressKey': data.result[i].provAddressKey, 'itemName': itemData , 'facilityNum': data.result[i].facilityNumber })
        }
        this.dentistPstlCde = this.hmsDataService.removeDuplicates(this.dentistPstlCde, 'provAddressKey')
       
          this.showLoader = false;
          setTimeout(() => {
           $('#decClaimInfo_dentistULI').focus();
          $('#openSelects').focus();
        });
        }
        
        if (data.result.length == 1) {
          this.dentistPostalCode.push({ 'id': data.result[0].postalCd, 'provAddressKey': data.result[0].provAddressKey, 'itemName': data.result[0].postalCd + " - " + data.result[0].businessArrangementNumber })
          
          var itemData = ''; 
          if (data.result[0].businessArrangementNumber != undefined && data.result[0].postalCd != undefined) {
            itemData = (data.result[0].postalCd) + " - " + data.result[0].businessArrangementNumber;
          } else if ((data.result[0].businessArrangementNumber != undefined || data.result[0].businessArrangementNumber != "") 
                  && (data.result[0].postalCd == undefined || data.result[0].postalCd == "")) {             // Add check by mukul(for AHC Undefined PostalCode issue)
            itemData = (data.result[0].businessArrangementNumber);
          } else if ((data.result[0].businessArrangementNumber == undefined || data.result[0].businessArrangementNumber == "") 
                  && (data.result[0].postalCd != undefined || data.result[0].postalCd != "")) {
            itemData = (data.result[0].postalCd);
          } else {
            itemData = (data.result[0].postalCd);
          }
          this.dropdownList.push({ 'id': data.result[0].provKey, 'itemName': itemData })
          
          this.onSelectPostalCode(this.dentistPostalCode,'', "singlePostalCode")
          this.ClaimInformationFormGroup.patchValue({ "dentistPCode": this.dropdownList[0].itemName });
         
           this.showLoader = false
           setTimeout(() => {
             $('#decClaimInfo_dentistULI').focus();
            $('#openSelects').focus();
          });
        }
          else {
         }
         this.showLoader = false
      }
    })
  }
getData(dropdownList:any){
  this.dropdownListData = this.completerService.local(
    this.dropdownList,
    "id",
    "itemName"
  );
}
 
  onSelectPostalCode(item: any,id:any, type) {
    
    let postalCd;
    let addressKey = item.provAddressKey
    if (type == "singlePostalCode") {
      postalCd = item[0].itemName
      addressKey = item[0].provAddressKey
    
    }
    if(type == "patchedValue"){
      
      postalCd = item[0].id
      addressKey = item[0].provAddressKey
    }
    if(type == "onChange")
     {
      this.dropdownList = []
        for (var i = 0; i < item.length; i++) {
          this.dropdownList.push({ 'id': item[i].id, 'itemName': item[i].itemName, "provAddressKey": item[i].provAddressKey })
          var postalCodeArr = (item[i].itemName).split("-")
        if(id == postalCodeArr[0]){
          let index = i
           this.selectedItemProvKey = []
           this.selectedItemProvKey.push({ "id": item[index].id ,"provAddressKey": item[index].provAddressKey});
           postalCd = this.selectedItemProvKey[0].id
           addressKey = this.selectedItemProvKey[0].provAddressKey
    }
  }
       
     }
    
    let requiredInfo = {
      "providerUli": this.ClaimInformationFormGroup.value.dentist,
      "postalCd": postalCd,
      "provAddressKey": addressKey
    }

    this.hmsDataService.postApi(DataEntryApi.getDentistBan, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.ClaimInformationFormGroup.patchValue({ "ban": data.result.businessArrangementNumber });
        this.ClaimInformationFormGroup.patchValue({ "facility": data.result.facilityNumber });
        this.ClaimInformationFormGroup.patchValue({ "providerKey": data.result.provKey });
        this.dataEntryService.emitProviderKey.emit(data.result.provKey)
      } else {
        this.ClaimInformationFormGroup.patchValue({ "ban": '' });
        this.ClaimInformationFormGroup.patchValue({ "facility": '' });
        this.ClaimInformationFormGroup.patchValue({ "providerKey": '' });
    }
    })
  }

  getStatus() {
    this.arrStatus = [
      { 'id': 'U', 'name': 'Unsubmitted ' },
      { 'id': 'S', 'name': 'Submitted ' },
      { 'id': 'R', 'name': 'Rejected ' },
      { 'id': 'A', 'name': 'Accepted ' },
      { 'id': 'P', 'name': 'Partially Accepted ' }]
  }

  /* get Pay To list Api */
  getPayTo() {
    this.payToDetails = [
      { 'payToDetailsKey': 'CONT', 'payToDetailsDesc': 'Contract Holder' },
      { 'payToDetailsKey': 'RECP', 'payToDetailsDesc': 'Service Recipient' },
      { 'payToDetailsKey': 'BAPY', 'payToDetailsDesc': 'Business Arrangement' },
      { 'payToDetailsKey': 'OTHR', 'payToDetailsDesc': 'Other' },
      { 'payToDetailsKey': 'PRVD', 'payToDetailsDesc': 'Service Provider' }
    ]
  }

  getAutoGeneratedClaimNumber() {
    this.hmsDataService.getApi(DataEntryApi.getAutoGeneratedClaimNumberUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.ClaimInformationFormGroup.patchValue({ claimNumber: data.result });
      }
      else {
      }
      error => {
      }
    })
  }

  emptyBan($event) {
    this.ClaimInformationFormGroup.patchValue({ "dentistPCode": '' });
    this.ClaimInformationFormGroup.patchValue({ "ban": '' });
    this.ClaimInformationFormGroup.patchValue({ "facility": '' });
    this.ClaimInformationFormGroup.patchValue({ "providerKey": '' });
  }
  isvalidatePatientHC() {
    if (this.ClaimInformationFormGroup.value.patientHC) {
      this.hmsDataService.getApi(DataEntryApi.validatePatientHc + '/' + this.ClaimInformationFormGroup.value.patientHC).subscribe(data => {
        if (data.code == 200 && data.hmsMessage.messageShort == "INVALID_PHN_NUMBER") {
          this.isInvalid = true
        }
        else if (data.hmsMessage.messageShort == "VALID_PHN_NUMBER") {

          this.isInvalid = false
        }
      })
    } else {
      this.isInvalid = true
    }
  }
  validatePatientHC(event, type) {
    if (event.key === "Enter" || event.key === "Tab" || type == 'blur') {
      if (this.ClaimInformationFormGroup.value.patientHC) {
        this.hmsDataService.getApi(DataEntryApi.validatePatientHc + '/' + this.ClaimInformationFormGroup.value.patientHC).subscribe(data => {
          if (data.code == 404 && data.hmsMessage.messageShort == "INVALID_PHN_NUMBER") {
            this.showError()
          }
          else if (data.hmsMessage.messageShort == "VALID_PHN_NUMBER") {

            if (type == 'key') {
              if (event.key === "Enter" || event.key === "Tab") {
                this.dataEntryService.isFromPHc.emit(true)
                $('#btnAddNewClaimItem').click();
                $('#decMandatory_PayTo').val('BAPY');  //Log #1126: Client Feedback
                setTimeout(() => {
                  $('#decMandatory_PayTo').focus()
                }, 1000);
              }
            } else if (type == 'blur') {
              this.dataEntryService.emitPatientHC.emit(this.ClaimInformationFormGroup.value.patientHC);
            }
          }else{
            this.showError(data.hmsMessage.messageShort)
          }
        })
      } else {
        if(this.ClaimInformationFormGroup.value.patientHC==''){

        }else{
          this.showError()

        }
      }
    } else {

    }
  }
  showError(msg=null) {
    $('#decClaimInfo_PatientHC').focus();
    $('html, body').animate({
      scrollTop: $("#decClaimInfo_PatientHC").offset().top
    }, 20);
    if(msg==null){
      msg ="Invalid PHN For This Claimant"
    this.ClaimInformationFormGroup.controls.patientHC.setErrors({ 'patientHCInValid': true })

    }else{
      this.ClaimInformationFormGroup.controls.patientHC.setErrors({ 'shortString': true })

    }
    this.toastrService.error(msg)

  }
  //Issue_no 763
  async onKeydown(event) {
    if (event.key === "Enter" || event.key === "Tab") {
      
      if (!this.isInvalid) {

        this.dataEntryService.isFromPHc.emit(true)
        $('#btnAddNewClaimItem').click();
        $('#decMandatory_PayTo').val('BAPY'); // Log #1126: Client Feedback
      } else {
        $('#decClaimInfo_PatientHC').focus();
        $('html, body').animate({
          scrollTop: $("#decClaimInfo_PatientHC").offset().top
        }, 20);
        this.toastrService.error("Invalid PHN For This Claimant")
        this.ClaimInformationFormGroup.controls.patientHC.setErrors({ 'patientHCInValid': true })
      }
    }


  }
  GetClaimType() {

    this.hmsDataService.getApi(DataEntryApi.getAhcDisciplineUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.arrClaimType = data.result
      }
      else {
      }
      error => {
      }
    })
  }

  getDisciplineType(event) {
    let selectedDiscipline = event.target.value == '1' ? 'D' : 'V';
    this.dataEntryService.emitDisciplineKey.emit(selectedDiscipline)
    if (selectedDiscipline == 'V') {
      this.vision = true;
    }
  }

  backToBatchSearch() {
    if (this.dataEntryService.batchUrl) {
      this.router.navigate(['dataEntry/search/batch'])
      this.dataEntryService.isBackToBatchSearch = true;
    }
    else {
      this.router.navigate(['dataEntry/search/claim'])
      this.dataEntryService.isBackToClaimSearch = true;

    }
  }

  onDentistULISelect(selected: CompleterItem) {
    if (selected) {
      this.selectedProcDesc = selected.originalObject.providerUli;
      this.validateDentist('singlePostalCode');
    } else {
      this.providerName = "";
      this.dentistPostalCode = []
      this.dropdownList = []
      this.selectedItems = []
      this.ClaimInformationFormGroup.patchValue({ "dentistPCode": '' });
      this.ClaimInformationFormGroup.patchValue({ "ban": '' });
      this.ClaimInformationFormGroup.patchValue({ "facility": '' });
      this.ClaimInformationFormGroup.patchValue({ "providerKey": '' });
      this.providerFlagText = ""
      this.ClaimInformationFormGroup.patchValue({ "providerFlag": '' })
      this.flag = false
      this.onSelectPostalCode([],'', "singlePostalCode")
    }
  }

  emitEditStatus() {
    this.dataEntryService.emitEditStatusValue.emit('CHANGED')
  }
 /* for #1264 (start) */ 
  paytoChange(e) {        
    if (e.target.value == "OTHR") {
      this.exDialog.openMessage((this.translate.instant('claims.claims-toaster.sureToAddClaimantAddress')))
          .subscribe((value) => {
            if (!value) {
              document.getElementById('decMandatory_DignosticPrimary').focus()
            }
          })
      this.disableClaimantAddress = false
      this.dataEntryService.emitClaimantAddressBtnStatus.emit(this.disableClaimantAddress)
    } else {
      let validRecov = false
     
      if(this.ClaimInformationFormGroup.value.payTo){
        validRecov = this.isvalidRecory(this.ClaimInformationFormGroup.value.payTo);
     }
    
      if(validRecov || this.ClaimInformationFormGroup.value.goodFaith =="Y"){
        this.disableClaimantAddress = false
      }else{
        this.disableClaimantAddress = true       
      }
      this.dataEntryService.emitClaimantAddressBtnStatus.emit(this.disableClaimantAddress)
    }
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
/* for #1264 (end) */

  autocompleListFormatter = (data: any): SafeHtml => {
    // Log #1110
    let self = this
    // Log #1110 ends
    let html = `<span>${data.itemName}</span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }

  valueChanged(newVal) {
    if (newVal) {
      var postalCodeArr = (newVal.itemName).split("-")
      this.selectedItems = [{ 'id': newVal.id, 'itemName': newVal.itemName, 'provAddressKey': newVal.provAddressKey}]
      this.onSelectPostalCode(this.dentistPstlCde,postalCodeArr[0], "onChange")
      let postalId = this.selectedItems[0].itemName
      this.ClaimInformationFormGroup.patchValue({ "dentistPCode": postalId });
    } else {
      this.ClaimInformationFormGroup.patchValue({ "dentistPCode": '' });
    }

  }

  // dentistPostalCode note foumd error are removed
  dentistPostalCodeFocus(){
    this.ClaimInformationFormGroup.controls.dentistPCode.reset()    
  }

  reaccessClaim() {
     this.dataEntryService.reaccessBtnStatus.emit(this.disableReasses)

 }

 checkAction(value) {
  if(this.claimItemMode == true && this.ClaimInformationFormGroup.value.action == "A"){
    this.disableReasses = true
  }
  else{
    this.disableReasses = false
  }
  this.dataEntryService.emitActionField.emit(this.ClaimInformationFormGroup.value.action)
}

/* get Action list Api */
getActionList() {
  this.arrAction = [{ 'actionKey': 'A', 'actionDesc': 'Add' },
  { 'actionKey': 'C', 'actionDesc': 'Change' },
  { 'actionKey': 'R', 'actionDesc': 'Reassess' },
  { 'actionKey': 'D', 'actionDesc': 'Delete' }]
}

  onFileChanged(event) {
    this.ClaimInformationFormGroup.value.documentName = ""
    this.selectedFile = event.target.files[0]
    let fileSize = event.target.files[0].size;
    if (fileSize > 2097152) {
      this.error1 = { isError: true, errorMessage: 'File size shuold not greater than 2 Mb!' };
      this.fileSizeExceeds = true
      this.showRemoveBtn = true;
    }
    else {
      this.error1 = { isError: false, errorMessage: '' };
      this.fileSizeExceeds = false
    }
    this.ClaimInformationFormGroup.patchValue({ 'documentName': event.target.files[0].name });
    this.allowedValue = this.allowedExtensions.includes(event.target.files[0].type)
    if (!this.allowedValue) {
      this.claimInfoError = { isError: true, errorMessage: 'Only pdf file type are allowed.' };
      this.showRemoveBtn = true;
    } else {
      this.claimInfoError = { isError: false, errorMessage: '' };
      this.showRemoveBtn = true;
    }
  }

  removeExtension() {
    this.ClaimInformationFormGroup.patchValue({ 'documentName': '' });
    this.showRemoveBtn = false;
    this.selectedFile = ""
    this.allowedValue = false
    this.fileSizeExceeds = false
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
  }

}
