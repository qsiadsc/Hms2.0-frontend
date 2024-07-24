import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../common-module/Constants';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { QueryList, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs/Rx';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { FeeGuideApi } from '../fee-guide-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
//import { SrvRecord } from 'dns';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompleterData } from 'ng2-completer';
import { CompleterCmp, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
@Component({
  selector: 'app-dental-schedule',
  templateUrl: './dental-schedule.component.html',
  styleUrls: ['./dental-schedule.component.css'],
  providers: [ChangeDateFormatService, TranslateService, DatatableService]
})

export class DentalScheduleComponent implements OnInit {
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  scheduleKey: any;
  dentalScheduleId: any;
  dentalScheduleForm: FormGroup;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  columns;
  currentUser: any;
  gridShow: boolean = false;
  error: any;
  updateEffectiveRow = []
  arrNewRow = {}
  newRecordValidate: boolean = false;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;
  arrData = []
  scheduleAddMode: boolean = true;
  scheduleViewMode: boolean = false;
  scheduleEditMode: boolean = false;
  addMode: boolean = false;
  editMode: boolean = false;
  viewMode: boolean = false;
  selectedRowId = '';
  arrSplDiscType = []
  dentalScheduleData;
  breadCrumbText: string;
  dentSpecialityData: CompleterData;
  dentalSpecialityKeyvalue: any;
  dentl_speciality: FormControl;
  checkSelected: boolean = false;
  dentalScheduleList = [{
    "viewSchedule": 'F',
    "editSchedule": 'F',
    "addSpeciality": 'F',
    "editSpeciality": 'F',
    "deleteSpeciality": 'F',
  }]

  constructor(
    private dataTableService: DatatableService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private routerAct: ActivatedRoute,
    private router: Router,
    private route: ActivatedRoute,
    private exDialog: ExDialog,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService,
    private renderer: Renderer2
  ) {
    this.dentl_speciality = new FormControl(null);
  }

  ngOnInit() {
    this.renderer.selectRootElement('#dentalScheduleDescription').focus();
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let dentalScheduleArray = this.currentUserService.authChecks['DSH']
        this.getAuthCheck(dentalScheduleArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUser = this.currentUserService.currentUser;
      let dentalScheduleArray = this.currentUserService.authChecks['DSH']
      this.getAuthCheck(dentalScheduleArray)
    }

    this.breadCrumbText = "ADD SCHEDULE";
    this.dentalScheduleForm = new FormGroup({
      'description': new FormControl('', [Validators.required, Validators.maxLength(70), CustomValidators.notEmpty]),
      'effectiveOn': new FormControl('', Validators.required),
      'applyAdult': new FormControl(''),
      'applyChild': new FormControl('')
    })

    // Dental Speciality Columns
    this.columns = [
      { title: this.translate.instant('feeGuide.dentalSchedule.dentalSpeciality'), data: 'disciplineName' },
      { title: this.translate.instant('feeGuide.dentalSchedule.effectiveDate'), data: 'effectiveOn' },
      { title: this.translate.instant('feeGuide.dentalSchedule.action'), data: 'banClientName' },
    ];
    this.dtOptions['dentalSpecialityList'] = Constants.dtOptionsConfig
    this.dtTrigger['dentalSpecialityList'] = new Subject();
    this.dentalSpecialityList();

    this.route.params.subscribe((params: Params) => {
      if (this.route.snapshot.url[1]) {
        if (this.route.snapshot.url[1].path == "view") {
          this.scheduleKey = params['id']
          this.getSpecialityList()
          this.enableViewMode();
        }
      }
    })
  }

  ngAfterViewInit() {
    this.dtTrigger['dentalSpecialityList'].next();
  }

  getAuthCheck(dentalScheduleArray) {
    let userAuthCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.dentalScheduleList = [{
        "viewSchedule": 'T',
        "editSchedule": 'T',
        "addSpeciality": 'T',
        "editSpeciality": 'T',
        "deleteSpeciality": 'T',
      }]
    }
    else {
      for (var i = 0; i < dentalScheduleArray.length; i++) {
        userAuthCheck[dentalScheduleArray[i].actionObjectDataTag] = dentalScheduleArray[i].actionAccess
      }
      this.dentalScheduleList = [{
        "viewSchedule": userAuthCheck['DSH214'],
        "editSchedule": userAuthCheck['VSH218'],
        "addSpeciality": userAuthCheck['VSH215'],
        "editSpeciality": userAuthCheck['VSH216'],
        "deleteSpeciality": userAuthCheck['VSH217'],
      }]
    }
    return this.dentalScheduleList
  }

  /** Method for Save & Update the Dental Schedule */
  submitDentalScheduleForm() {
    let scheduleData = {
      "dentFeeGuideSchedDesc": this.dentalScheduleForm.value.description,
      "dentFeeGuideAdultInd": this.dentalScheduleForm.value.applyAdult ? 'T' : 'F',
      "dentFeeGuideChildInd": this.dentalScheduleForm.value.applyChild ? 'T' : 'F',
      "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.dentalScheduleForm.value.effectiveOn),
    }
    if (this.scheduleAddMode) {
      if (this.dentalScheduleForm.valid) {
        var url = FeeGuideApi.saveOrUpdateDentalScheduleUrl;
        this.hmsDataService.postApi(url, scheduleData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.scheduleKey = data.result.dentFeeGuideSchedKey
            this.toastrService.success(this.translate.instant('feeGuide.toaster.saveDentalScheduleSuccess'))
            this.router.navigate(['/feeGuide/dentalSchedule/view/' + this.scheduleKey])
            this.enableViewMode();
          }
          else {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.failDentalSchedule'))
          }
        })
      }
      else {
        this.validateAllFormFields(this.dentalScheduleForm)
      }
    }
    if (this.scheduleEditMode) {
      if (this.dentalScheduleForm.valid) {
        scheduleData["dentFeeGuideSchedKey"] = this.scheduleKey
        var url = FeeGuideApi.saveOrUpdateDentalScheduleUrl;
        this.hmsDataService.postApi(url, scheduleData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.scheduleKey = data.result.dentFeeGuideSchedKey
            this.toastrService.success(this.translate.instant('feeGuide.toaster.updateDentalScheduleSuccess'));
            this.router.navigate(['/feeGuide/dentalSchedule/view/' + this.scheduleKey])
            this.enableViewMode();
          }
          else {
            this.toastrService.error(this.translate.instant('feeGuide.toaster.failUpdateDentalSchedule'));
          }
        });
      }
    }
  }

  /** Method for Enable the View Mode*/
  enableViewMode() {
    this.viewDentalScheduleById();
    this.breadCrumbText = "VIEW SCHEDULE";
    this.scheduleAddMode = false;
    this.scheduleViewMode = true;
    this.scheduleEditMode = false;
    this.dentalScheduleForm.disable();
  }

  /** Method for Enable Edit Mode */
  enableEditMode() {
    this.dentalScheduleForm.enable();
    this.breadCrumbText = "EDIT SCHEDULE";
    this.scheduleAddMode = false;
    this.scheduleViewMode = false;
    this.scheduleEditMode = true;
  }

  /** View the Dental-Schedule */
  viewDentalScheduleById() {
    this.dentalScheduleData = this.routerAct.params.subscribe(params => {
      this.dentalScheduleId = { 'dentFeeGuideSchedKey': this.scheduleKey };
      var URL = FeeGuideApi.getDentalScheduleUrl;
      this.hmsDataService.post(URL, this.dentalScheduleId).subscribe(data => {
        if (data.code == 200 && data.status === "OK") {
          this.dentalScheduleForm.patchValue({
            'description': data.result.dentFeeGuideSchedDesc,
            'applyAdult': (data.result.dentFeeGuideAdultInd == "T") ? true : false,
            'applyChild': (data.result.dentFeeGuideChildInd == "T") ? true : false,
            'effectiveOn': this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          })
        }
      });
    });
  }

  /** Speciality List for Dropdown */
  dentalSpecialityList() {
    this.hmsDataService.getApi(FeeGuideApi.getDentalProviderSpecialtyListUrl).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.arrSplDiscType = data.result;
        this.dentSpecialityData = this.completerService.local(
          this.arrSplDiscType,
          "dentProvSpecialDesc",
          "dentProvSpecialDesc"
        );
      }
      else { }
      error => { }
    })
  }

  /** Add the Record in Dental-Speciality  */
  AddNew() {
    if (!this.editMode) {
      this.selectedRowId = '';
      this.resetNewRecord();
      this.addMode = true;
      this.dataTableService.reloadTableElem(this.dtElements, 'dentalSpecialityList', this.dtTrigger['dentalSpecialityList'], false)
    }
  }

  /** Method for Edit the Dental Speciality */
  EditInfo(dataRow, idx) {
    if (!this.editMode) {
      this.editMode = true;
      this.addMode = false;
      this.dentl_speciality.patchValue(dataRow.dentProvSpecialDesc)
      var effectiveOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn);
      this.updateEffectiveRow[idx] = effectiveOnObj;
      this.selectedRowId = dataRow.dentProvSpecSchedKey;
    }
  }

  /** Method for Save & Update the Dental Speciality */
  SaveInfo(dataRow = null, idx = null) {
    this.newRecordValidate = true;
    let validateVar
    var specialityData = {}
    if (this.addMode) {
      validateVar = this.arrNewRow
      specialityData = {
        "dentProvSpecialKey": this.dentalSpecialityKeyvalue,
        "dentFeeGuideSchedKey": this.scheduleKey,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(validateVar.effectiveOn),
      }
      this.dentalSpecialityKeyvalue = null;
    }
    if (this.editMode) {
      if (this.checkSelected == false) {
        this.dentalSpecialityKeyvalue = null;
      }

      validateVar = dataRow
      specialityData = {
        "dentProvSpecSchedKey": dataRow.dentProvSpecSchedKey,
        "dentFeeGuideSchedKey": this.scheduleKey,
        "dentProvSpecialKey": this.dentalSpecialityKeyvalue != null ? this.dentalSpecialityKeyvalue : dataRow.dentProvSpecialKey,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.updateEffectiveRow[idx]),
      }
    }
    if (this.validateAllFields(specialityData)) {
      this.newRecordValidate = false;
      this.hmsDataService.postApi(FeeGuideApi.saveOrUpdateDentalSpecialityUrl, specialityData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.toastrService.success(this.translate.instant('feeGuide.toaster.saveDentalSpeciality'));
          this.resetNewRecord();
          this.getSpecialityList()
          this.editMode = false;
          this.addMode = false;
          this.selectedRowId = '';
          this.dataTableService.reloadTableElem(this.dtElements, 'dentalSpecialityList', this.dtTrigger['dentalSpecialityList'], false)
        }
        else {
          this.toastrService.error(this.translate.instant('feeGuide.toaster.failDentalSpeciality'))
        }
      })
    }
  }


  ondentalSpecialitySelected(selected: CompleterItem) {
    if (selected) {
      this.checkSelected = true;
      this.dentalSpecialityKeyvalue = (selected.originalObject.dentProvSpecialKey).toString();
    }
    else {
      this.checkSelected = false;
      this.dentalSpecialityKeyvalue = '';
    }
  }

  /** Method for Delete the Dental Speciality by row */
  DeleteInfo(dataRow, idx) {
    var action = "cancel";
    if (dataRow && dataRow.dentProvSpecSchedKey) {
      action = "Delete";
    }
    this.exDialog.openConfirm((this.translate.instant('card.exDialog.are-you-sure')) + ' ' + action + ' ' + (this.translate.instant('card.exDialog.record')))
      .subscribe((value) => {
        if (value) {
          if (this.addMode) {
            this.resetNewRecord();
            this.dataTableService.reloadTableElem(this.dtElements, 'dentalSpecialityList', this.dtTrigger['dentalSpecialityList'], false)
          }
          else {
            let specialityData = {
              "dentProvSpecSchedKey": dataRow.dentProvSpecSchedKey
            }
            this.hmsDataService.postApi(FeeGuideApi.deleteSpecialtyUrl, specialityData).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                this.toastrService.success(this.translate.instant('feeGuide.toaster.deleteDentalSpeciality'));

                this.getSpecialityList()
                this.editMode = false;
                this.addMode = false;
                this.selectedRowId = '';
                this.arrData.splice(idx)
              }
              else {
                this.toastrService.error(this.translate.instant('feeGuide.toaster.failDeleteDentalSpeciality'))
              }
              this.dataTableService.reloadTableElem(this.dtElements, 'dentalSpecialityList', this.dtTrigger['dentalSpecialityList'], false)
            })
          }

        }
      })
  }

  /** Method for Dental-Speciality to validate the fields  */
  validateAllFields(objRow: any) {
    if (objRow.dentProvSpecialKey && objRow.effectiveOn) {
      return true;
    }
    else {
      return false;
    }
  }

  /** Method for Cancleling the row operation in Dental Speciality by row */
  CancelInfo() {
    this.editMode = false;
    this.addMode = false;
    this.selectedRowId = ""
  }

  /** Reset the Record for Speciality */
  resetNewRecord() {
    this.addMode = false;
    this.arrNewRow = {
      "dentProvSpecSchedKey": "",
      "dentProvSpecialKey": '',
      "dentProvSpecialDesc": "",
      "effectiveOn": ""
    }
    this.selectedRowId = '';
    this.newRecordValidate = false;
  }

  /**Change Input Date Format and Validate date for inline Table*/
  ChangeInputDateFormat(event, idx, type) {
    let inputDate = event;
    if (inputDate.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(inputDate);
      if (obj == null) {
        this.toastrService.warning(this.translate.instant('card.toaster.invalid-date'));
      }
      else {
        inputDate = this.changeDateFormatService.convertDateObjectToString(obj);

        if (this.addMode) {
          let effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow['effectiveOn']);
          effectiveOn = inputDate
          this.arrNewRow[type] = obj;
        }
        else {
          this.arrData[idx][type] = inputDate;
          let effectiveOn = this.arrData[idx].effectiveOn;
          this.updateEffectiveRow[idx] = obj;
        }
      }
    }
  }

  /** Methos for Upper Form Datepicker */
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.dentalScheduleForm.patchValue(datePickerValue);
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
      this.dentalScheduleForm.patchValue(datePickerValue);
    }
    if (this.dentalScheduleForm.value.effectiveOn && this.dentalScheduleForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.dentalScheduleForm.value.effectiveOn.date, this.dentalScheduleForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.dentalScheduleForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }

  /** Method for validate the Form fields */
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

  /** Reset the Dental Schedule Form not used yet */
  resetDentalScheduleForm() {
    this.dentalScheduleForm.reset();
  }

  /** Get the Dental-Speciality List */
  getSpecialityList() {
    let scheduleData = {
      'dentFeeGuideSchedKey': this.scheduleKey,
    }
    this.hmsDataService.postApi(FeeGuideApi.getDentalSpecialityUrl, scheduleData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.arrData = data.result;
        this.dataTableService.reloadTableElem(this.dtElements, 'dentalSpecialityList', this.dtTrigger['dentalSpecialityList'], false)
      }
      if (data.code == 404 && data.hmsMessage.messageShort == "RECORD_NOT_FOUND") {
        this.dataTableService.reloadTableElem(this.dtElements, 'dentalSpecialityList', this.dtTrigger['dentalSpecialityList'], false)
      }
    })
  }
}