import { Component, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { DataEntryService } from '../data-entry.service';
import { FormGroup, FormControl, NgForm, FormArray, Validators, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonModuleModule } from './../../common-module/common-module.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from './../../common-module/shared-services/datatable.service'
import { TranslateService } from '@ngx-translate/core';
import { ClaimInformationComponent } from './../claims/claim-information/claim-information.component';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { HmsDataServiceService } from './../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { DataEntryApi } from '../data-entry-api';
import { CommonDatePickerOptions } from '../../common-module/Constants'; // import common date format
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { setTimeout } from 'timers';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css'],
  providers: [ChangeDateFormatService, TranslateService]
})

export class ClaimsComponent implements OnInit {
  addNewClicked: boolean = false;
  isSaved: any;
  addObservableObj: any;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  getClaimInfo: any;

  @ViewChild(ClaimInformationComponent) claimInformationComponent;
  DataEntryClaimFormGroup: FormGroup;
  arrClaimItems = [];
  disableAddBtn;
  dataEntryData;
  buttonText = "Save";
  breadCrumbText: string;
  providerKey;
  userId;
  disableSaveButton = false;
  /*Changes Text based on Modes on Save Button*/
  addMode: boolean = true; //Enable true when user add a new card
  viewMode: boolean = false; //Enable true after a new card added
  editMode: boolean = false;
  copyMode: boolean = false;


  claimKey;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;//datepicker Options

  itemEditMode: boolean = false
  authCheck = [{
    'addClaimItem': 'F',
    'deleteClaimItem': 'F',
    'editClaimItem': 'F',
    'editClaims': 'F',
    'editClaimantAddress': 'F',
    'Reassess': 'F',
    'saveClaimItem': 'F',
    'saveClaim': 'F',
    'searchAHCClaim': 'F'
  }]
  constructor(private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private hmsDataServiceService: HmsDataServiceService,
    private dataEntryService: DataEntryService,
    private changeDateFormatService: ChangeDateFormatService,
    private translate: TranslateService,
    private currentUserService: CurrentUserService,
    private exDialog: ExDialog,
  ) {
    
    this.dataEntryService.ClaimItemInsert.subscribe(data => {
      this.addObservableObj = Observable.interval(100).subscribe(value => {
      this.arrClaimItems = data;
      
     
      // default expand on optional section to show data.
      var option1 = this.arrClaimItems[0].mandatoryClaimItemsDto;
      var option2 = this.arrClaimItems[0].optionalClaimItemsDto;
      if (option2.text != "" || option2.feeMode3 != "" || option2.confidentialInd != "" || option2.diagnostic2 != "" || option2.diagnostic3 != "" || option2.encounterNum != 1 || option2.goodFaith != ""
      || option2.interceptReason != "" || option2.emsafInd != "" || option2.locumBusinessArrNo != 0 || option2.oopReferral != "" || option2.recoveryCode != "" || option2.paperDocInd != "" 
      || option2.serviceRecipientRegNo != "" || option1.toothCode != "" || option1.toothSurfaces != "" || option1.timeUnits != "") {
      $(".accordion-toggle").attr("aria-expanded", "true"); 
      $("#optional").addClass("accordion-body collapse in");
    } else {
      $(".accordion-toggle collapsed").attr("aria-expanded", "false"); 
      $("#optional").addClass("accordion-body collapse"); 
    }

    //default expand on Payment Info section to show data.
    var option3 = this.arrClaimItems[0].paymentInfoDto;
        if (option3.claimNum != ""|| option3.reassessmentReason != "" || option3.assessmentAction != "" || option3.frReferenceNum != "" 
      || option3.expectedPaymentDate != "" || option3.assessmentDate != "" || option3.explanationCodes != ""|| option3.emsafStatus != "" 
      || option3.feeModifier != "" || option3.referenceNum != "" || option3.paidAmount != 0) {             
        $(".accordion-toggle").attr("aria-expanded", "true"); 
        $("#paymentInformationHeadingDiv").addClass("accordion-body collapse in");
      } else {
        $(".accordion-toggle collapsed").attr("aria-expanded", "false"); 
        $("#paymentInformationHeadingDiv").addClass("accordion-body collapse");
    
      }
      this.addObservableObj.unsubscribe();
    });
      this.route.params.subscribe((params: Params) => {
        if (this.route.snapshot.url[1]) {
          if (this.route.snapshot.url[1].path == "copy") {
            this.autoGenClaim();
            this.getAutoGeneratedClaimNumber();
          }
        }
      })
    })
    this.dataEntryService.emitProviderKey.subscribe(data => {
      this.providerKey = data;
    })
    this.dataEntryService.disableSave.subscribe(value => {
      if (value) {
        this.itemEditMode = true
      } else {
        this.itemEditMode = false
      }
    })

    this.dataEntryService.addnewClicked.subscribe(value => {

      if (value) {
        this.addNewClicked = true
      } else {
        this.addNewClicked = false
      }
    })
  }

  autoGenClaim() {
    let claimItemsLength = [];
    for (var j = 0; j < this.arrClaimItems.length; j++) {
      claimItemsLength.push(j);
    }
    this.fillClaimItemAutoGenNum(claimItemsLength);
  }

  async fillClaimItemAutoGenNum(claimItemsLength) {
    for (const item of claimItemsLength) {
      await this.hmsDataServiceService.getApi(DataEntryApi.getAutoGeneratedClaimItemNumberUrl).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.arrClaimItems[item]['mandatoryClaimItemsDto']['claimNum'] = data.result
        }
        else {
        }
      });
    }
  }


  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.getAuthArray()
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        setTimeout(() => {
          this.getAuthArray()
        }, 100);
      })

    }
    this.userId = localStorage.getItem('id')
    this.breadCrumbText = "ADD CLAIM";
    this.DataEntryClaimFormGroup = this.fb.group({
      ClaimInformationFormGroup: this.fb.group(this.claimInformationComponent.ClaimInformationFormGroupVal),
    })

    this.route.params.subscribe((params: Params) => {
      if (params.check) {
        this.isSaved = params.check
      }
      if (this.route.snapshot.url[1]) {
        if (this.route.snapshot.url[1].path == "view") {
          this.claimKey = params['id']
          this.enableViewMode();
        }

        if (this.route.snapshot.url[1].path == "copy") {
          this.claimKey = params['copyKey']
          this.fillDataEntryDetails()
          this.copyMode = true
        }
      }
    })

    if (this.addMode) {
      this.hmsDataServiceService.getApi(DataEntryApi.getLatestBatchNumAndKey).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.DataEntryClaimFormGroup.patchValue(
            {
              ClaimInformationFormGroup:
                { 'batchNumber': data.result.batchNumber },
            }
          )
        } else {
          this.DataEntryClaimFormGroup.value.ClaimInformationFormGroup.patchValue({ 'batchNumber': '' })
        }
      })
    }
  }
  getAuthArray() {
    let checkArray = this.currentUserService.authChecks['VCB'].concat(this.currentUserService.authChecks['CLB'])
    let searchClaim = this.currentUserService.authChecks['SBT'].filter(val => val.actionObjectDataTag == 'BTH230').map(data => data)
    checkArray.push(searchClaim[0])
    this.getAuthCheck(checkArray)
  }
  getAuthCheck(claimChecks) {

    let authCheck = []
    if (localStorage.getItem('isAdmin') == 'T') {
      this.authCheck = [{
        'addClaimItem': 'T',
        'deleteClaimItem': 'T',
        'editClaimItem': 'T',
        'editClaims': 'T',
        'editClaimantAddress': 'T',
        'Reassess': 'T',
        'saveClaimItem': 'T',
        'saveClaim': 'T',
        'searchAHCClaim': 'T'
      }]
    }
    else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.authCheck = [{
        'addClaimItem': authCheck['VCB233'],
        'deleteClaimItem': authCheck['VCB234'],
        'editClaimItem': authCheck['VCB235'],
        'editClaims': authCheck['VCB236'],
        'editClaimantAddress': authCheck['CLB237'],
        'Reassess': authCheck['CLB238'],
        'saveClaimItem': authCheck['CLB239'],
        'saveClaim': authCheck['CLB240'],
        'searchAHCClaim': authCheck['BTH230']
      }]
    }
  }
  saveDataEntryClaim(mode) {
    this.addNewClicked = false;
    var claimItems = []
    var Url;
    let x = '';
    claimItems = this.arrClaimItems
    if (this.DataEntryClaimFormGroup.valid) {
      this.disableSaveButton = true;
      if (this.arrClaimItems && this.arrClaimItems.length < 1) {
        this.toastrService.error(this.translate.instant('Please Add Atleast One Claim Item!'))
        this.disableSaveButton = false;
        return false
      }
      let submitData
      var action = "Updated";
      Url = DataEntryApi.updateBatchClaim;
      var postalCodeArr = (this.DataEntryClaimFormGroup.value.ClaimInformationFormGroup.dentistPCode).split("-")
     
      submitData = {
        claimInfoDto: {
          "userId": this.userId,
          "claimKey": this.claimKey,
          "banNo":this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('ban').value,
          "facilityNum": this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('facility').value,
          "employmentDt": this.changeDateFormatService.convertDateObjectToString(this.DataEntryClaimFormGroup.value.ClaimInformationFormGroup.empDate),
          "providerKey": this.providerKey, 
          "author": this.DataEntryClaimFormGroup.value.ClaimInformationFormGroup.author,
          "batchNum": this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('batchNumber').value.toString(),
          "claimNum": this.DataEntryClaimFormGroup.value.ClaimInformationFormGroup.claimNumber.toString(),
          "patientHcNo": this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('patientHC').value,
          "dentist": this.DataEntryClaimFormGroup.value.ClaimInformationFormGroup.dentist,
          "postalCode": postalCodeArr[0].trim(),
          "claimStatus": this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('status').value,
          //#1264 
          "payTo": this.DataEntryClaimFormGroup.value.ClaimInformationFormGroup.payTo,  
          'disciplineKey': null,
        },

      }
      if (mode == 'add') {
        var action = "Saved";
        Url = DataEntryApi.addClaimToBatchUrl;
        submitData['claimInfoDto']["claimItemsInfoDtoList"] = claimItems
      }

      this.hmsDataServiceService.postApi(Url, submitData).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.dataEntryData = data.result;
          this.claimKey = data.result.claimInfoDto.claimKey;
          this.toastrService.success('Data Entry Claim ' + action + '  Successfully!');
          this.router.navigate(['dataEntry/claims/view/' + this.claimKey + "/RedirectNew/t"])
          this.enableViewMode();

        }
        else if (data.code == 400 && data.hmsMessage.messageShort == "CLAIM_NUMBER_ALREADY_EXIST") {
          this.toastrService.error('Claim Number Already Exist')
        }
        else {
          this.toastrService.error('Data Entry Claim Not Saved Successfully')
        }
      });

     
      if (mode == 'add') {   
      window.open('/dataEntry/claims')
      }
      this.disableSaveButton = false;
      error => {
      }

    }
    else {
      this.validateAllFormFields(this.DataEntryClaimFormGroup);//Form Validations
      $('html, body').animate({
        scrollTop: $(".validation-errors:first-child")
      }, 'slow');
    }

  }
  fillDataEntryDetails() {
    let requiredInfo = {
      "claimKey": this.claimKey
    }

    this.hmsDataServiceService.postApi(DataEntryApi.getAhcClaim, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        let dentistPCodeVal;
        let details = data.result.claimInfoDto;
        // Add check for patch value of Dentist Postal Code input field 
        if(details.banNo != "" && details.postalCode != ""){
          dentistPCodeVal = details.postalCode + " - " + details.banNo;
        } else if (details.banNo != "" && details.postalCode == "") {
          dentistPCodeVal = details.banNo;
        } else if (details.banNo == "" && details.postalCode != "") {
          dentistPCodeVal = details.postalCode;
        }
        //end
        this.getClaimInfo = data.result.claimInfoDto;
        let editData = {
          ClaimInformationFormGroup: {
            batchNumber: details.batchNum,
            claimNumber: details.claimNum,
            empDate: this.changeDateFormatService.convertStringDateToObject(details.employmentDt),
            author: details.author,
            ban: details.banNo,
            facility: details.facilityNum,
            dentist: details.uliNumber,
            patientHC: details.patientHcNo,
            status: details.batchStatus,
            dentistPCode: dentistPCodeVal,
            claimType: details.disciplineKey
          }
        }
        var providerName = details.providerName;
        let providerFlag = details.providerAlertMessage; // this param added for Log #1005
        this.DataEntryClaimFormGroup.patchValue(editData);
        this.dataEntryService.emitProviderName.emit(providerName);
        this.dataEntryService.emitClaimNumber.emit(details.claimNum);
        this.dataEntryService.emitPatientHC.emit(details.patientHcNo)
        this.dataEntryService.emitClaimType.emit(details.disciplineKey)
        this.dataEntryService.emitProviderFlag.emit(providerFlag)
        this.providerKey = details.providerKey
        var disciplineCode = details.disciplineKey == "1" ? "D" : "V"
        this.dataEntryService.emitDisciplineKey.emit(disciplineCode)
        this.dataEntryService.batchStatus.emit(details.batchStatus)
        if(details.batchStatus == 'U'){
          $('#accordion3').hide()
        }else{
          $('#accordion3').show()
        }
      }

    });

  }

  enableViewMode() {
    this.fillDataEntryDetails();
    this.buttonText = "Edit";
    this.breadCrumbText = "VIEW CLAIM"// View Card;
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false;
    this.DataEntryClaimFormGroup.disable();

  }


  enableEditMode() {
    this.DataEntryClaimFormGroup.enable();
    this.disableFormFields();
    this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('empDate').disable()
    this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('payTo').disable()
    this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('action').disable()
    $('#decClaimInfo_PayTo').focus()
    this.viewMode = false;
    this.addMode = false;
    this.editMode = true;
    this.buttonText = "Update";
    this.breadCrumbText = "EDIT CLAIM";
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
  }

  disableFormFields() {
    let formFields = []
    if(this.getClaimInfo.batchStatus == 'S'){ // Log #1111
       formFields = ['batchNumber', 'status', 'patientHC', 'author', 'dentist', 'facility']
    }else{
       formFields = ['batchNumber', 'status', 'patientHC', 'author']
    }
    formFields.forEach(value => {
      this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get(value).disable()
    }) 
    this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.get('author').enable()
    this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.patchValue({
      'batchNumber': this.getClaimInfo.batchNum,
      'status': this.getClaimInfo.batchStatus,
      'facility': this.getClaimInfo.facilityNum,
      'patientHC': this.getClaimInfo.patientHcNo,
      'ban': this.getClaimInfo.banNo,
      'dentist': this.getClaimInfo.uliNumber
    })
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

  getAutoGeneratedClaimNumber() {
    this.hmsDataServiceService.getApi(DataEntryApi.getAutoGeneratedClaimNumberUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.DataEntryClaimFormGroup.controls.ClaimInformationFormGroup.patchValue({ 'claimNumber': data.result });
      }
      else {
      }
      error => {
      }
    })
  }

  delete() {
    this.exDialog.openConfirm("Are You Sure You Want To Delete Current Claim ").subscribe((value) => {
      if (value) {
        location.reload()
      }
    })
  }
  deleteClaim() {
    this.exDialog.openConfirm("Are You Sure You Want To Delete Claim " + this.claimKey).subscribe((value) => {
      if (value) {
        let requiredInfo = {
          "claimKey": this.claimKey
        }

        this.hmsDataServiceService.postApi(DataEntryApi.deleteAhcClaim, requiredInfo).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            if (this.isSaved == 't') {
              this.router.navigate(['dataEntry/claims']);

            } else {
              this.claimInformationComponent.backToBatchSearch()
            }
          }
        })
      }
    })

  }
  duplicate() {
    this.router.navigate(['dataEntry/claims']);
  }
}
