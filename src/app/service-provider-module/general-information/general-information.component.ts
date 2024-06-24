import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommonApi } from '../../common-module/common-api';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { DataTableDirective } from 'angular-datatables';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { ActivatedRoute, Params } from '@angular/router';
import { ServiceProviderApi } from '../service-provider-api';
import { ServiceProviderService } from '../serviceProvider.service';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'

@Component({
  selector: 'app-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.css'],
  providers: [ChangeDateFormatService]
})

export class GeneralInformationComponent implements OnInit {

  @Input() ServiceProviderGeneralInformationFormGroup: FormGroup;
  @ViewChild(DataTableDirective)
  @Input() serviceProviderChecks: any;
  @Input() serviceProviderEditMode: boolean; //set value edit value
  @Input() serviceProviderViewMode: boolean; //set value View value
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  claimType = [];//array for claim type List 
  selectedCardKey;
  cardKey;
  userID;
  currentUser;
  languages;
  selectedDisciplineKey;
  quickardCheckboxValue;
  selectedLanguageKeyVal;  //set language view value 
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  ServiceProviderGeneralInformationFormGroupVal = {
    lastName: ['', [Validators.required, Validators.maxLength(100), CustomValidators.combinationAlphabets]],
    firstName: ['', [Validators.required, Validators.maxLength(100), CustomValidators.combinationAlphabets]],
    email: ['', CustomValidators.vaildEmail],
    discipline: ['', Validators.required],
    langauge: [''],
    id: ['']
  }
  hideButton: boolean = false;
  constructor(
    private currentUserService: CurrentUserService,
    private fb: FormBuilder,
    private hmsDataServiceService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private route: ActivatedRoute,
    private serviceProviderService: ServiceProviderService,
  ) {
    serviceProviderService.govtTypeValue.subscribe((value) => {
      this.quickardCheckboxValue = value
    })
    serviceProviderService.selectedLanguageKey.subscribe((value) => {
      this.selectedLanguageKeyVal = value
    })
    // (back to search) button hidden when we save new service provider and view page appears.
    serviceProviderService.hideBtn.subscribe((value) => {
      this.hideButton = true
    })
  }

  ngOnInit() {
    this.currentUserService.getUserAuthorization().then(res => {
      this.currentUser = this.currentUserService.currentUser
      this.userID = this.currentUserService.currentUser.userId;
      this.getAllLanguage();
      this.getDisciplineList();
    })
  }

  /**
   * Get language list Api
   */
  getAllLanguage() {
    this.hmsDataServiceService.getApi(CommonApi.getLanguageList).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.languages = data.result;
         // for general point 159(serviceProviderViewMode value)
        if(this.serviceProviderViewMode){
          this.ServiceProviderGeneralInformationFormGroup.patchValue({ langauge: this.selectedLanguageKeyVal })
        }
        else{
          this.ServiceProviderGeneralInformationFormGroup.patchValue({ langauge: 1 })
        }
      } else {
        this.languages = []
      }
      error => {
      }
    })
  }

  getDisciplineList() {
    var userId = this.currentUser.userId
    let businessTypeKey
    if (this.currentUser.businessType.bothAccess) {
      businessTypeKey = 0
    } else {
      businessTypeKey = this.currentUser.businessType[0].businessTypeKey
    }
    let requiredInfo = {
      "cardKey": 0,
      "userId": +userId,
      "businessTypeKey": businessTypeKey
    }
    this.hmsDataServiceService.postApi(ServiceProviderApi.getDisciplineList, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.claimType = data.result
        this.claimType.splice(0,1)        //to remove disciplineName 'ALL' from the array
        if (this.currentUser.businessType.isAlberta) {
          if (!this.serviceProviderEditMode && !this.serviceProviderViewMode) {
            this.ServiceProviderGeneralInformationFormGroup.patchValue({ 'discipline': 1 });
            this.selectedDisciplineType(1);
          }
        } else {
          if (!this.serviceProviderEditMode && !this.serviceProviderViewMode) {
            this.ServiceProviderGeneralInformationFormGroup.patchValue({ 'discipline': 1 });
            this.selectedDisciplineType(1);
          }
        }
      } else {
      }
    })
  }

  selectedDisciplineType(evt) {
    if (evt.target) {
      this.selectedDisciplineKey = evt.target.value
    }
    else {
      this.selectedDisciplineKey = evt
    }
    this.serviceProviderService.selectedDisciplineKey.emit(this.selectedDisciplineKey)
  }

  changeDateFormat(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
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
      this.ServiceProviderGeneralInformationFormGroup.patchValue(datePickerValue);
    }
  }
  backToSearch() {
    this.serviceProviderService.isBackProviderSearch = true
  }
}
