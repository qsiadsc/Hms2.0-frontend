import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { IMyInputFocusBlur } from 'mydatepicker';
import { Constants } from '../../../common-module/Constants';
import { CardApi } from '../../card-api';
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { CommonApi } from '../../../common-module/common-api';
import { CardServiceService } from '../../card-service.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'card-holder-general-information',
  templateUrl: './card-holder-general-information.component.html',
  styleUrls: ['./card-holder-general-information.component.css'],
  providers: [ChangeDateFormatService]
})
export class CardHolderGeneralInformationComponent implements OnInit {
  @Input() CardHolderGeneralInformationFormGroup: FormGroup;
  @Input() cardData: any;
  @Input() alberta: boolean = false;
  @Input() addMode: boolean = false;
  @Input() viewMode: boolean = false;
  @Input() editMode: boolean = false;
  cardHolderAge: string

  @Input() ageObject: {
    "age1": 0,
    "age2": 0
  };

  myGroup: any;
  arrGenderList;
  arrRoleList;
  error: any;
  phoneMask = CustomValidators.phoneMask;
  sinMask = CustomValidators.sinMask;
  arrCardHolderGeneralInfo: any;
  private selectUndefinedOptionValue: any;
  bussinessType: number;
  bussinessCd: String;
  gernalInfoEditValue;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;
  cardholderGeneralInformationVal: any;
  PrimaryCodeValue;
  DependantCodeValue;
  addModeCard: boolean = false;
  getprefLang: Subscription;

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    public cardService: CardServiceService) {
    this.error = { isError: false, errorMessage: '' };

    this.getprefLang = cardService.getPrefferedLanguage.subscribe((value) => {
      this.gernalInfoEditValue = value
      this.bussinessCd = this.gernalInfoEditValue.businessTypeCd;
      if (this.bussinessCd == Constants.albertaBusinessTypeCd) {
        this.alberta = true
      }
    })

    if (this.bussinessCd == Constants.albertaBusinessTypeCd) {
      this.cardholderGeneralInformationVal = {
        card_id: ['', Validators.required],
        first_name: ['', Validators.compose([Validators.required, Validators.maxLength(60)])],
        last_name: ['', Validators.compose([Validators.required, Validators.maxLength(60)])],
        gender: [null, Validators.required],
        date_of_birth: ['', Validators.required],
        sin: [''],
        company_employee: ['']
      }
    }
    else {
      this.cardholderGeneralInformationVal = {
        card_id: ['', Validators.required],
        first_name: ['', Validators.compose([Validators.required, Validators.maxLength(60), CustomValidators.combinationAlphabets])],
        last_name: ['', Validators.compose([Validators.required, Validators.maxLength(60), CustomValidators.combinationAlphabets])],
        gender: [null, Validators.required],
        date_of_birth: ['', Validators.required],
        sin: [''],
        company_employee: ['']
      }
    }
    this.GetGenderList();
    this.GetCardHolderRoleList();
  }

  ngOnInit() {
    if (this.bussinessCd == Constants.albertaBusinessTypeCd) {
      this.alberta = true;
    }
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {
        this.addModeCard = false;
      }
    }
    else {
      this.addModeCard = true;
    }
  }

  GetGenderList() {
    this.hmsDataServiceService.getApi(CardApi.getAllGenderDetailsUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrGenderList = data.result;
      }
    })
  }

  GetCardHolderRoleList() {
    this.hmsDataServiceService.getApi(CardApi.getCardHolderRoleListUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrRoleList = data.result;
        for (var i = 0; i < this.arrRoleList.length; i++) {
          if (this.arrRoleList[i].chRoleCD == "P") {
            this.PrimaryCodeValue = this.arrRoleList[i].chRoleKey
          }
          else if (this.arrRoleList[i].chRoleCD == "D") {
            this.DependantCodeValue = this.arrRoleList[i].chRoleKey
          }
        }
      }
    })
  }

  EditFormInfo() {
    this.CardHolderGeneralInformationFormGroup.patchValue({ last_name: 'English' });
  }

  /**
  * @description : This Function is used to convert entered value to valid date format.
  * @params : "event" is datepicker value
  * @params : "frmControlName" is datepicker name/Form Control Name
  * For Reference : https://www.npmjs.com/package/angular4-datepicker
  * @return : None
  */
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

      if (frmControlName == 'date_of_birth') {
        var dateInstring = this.changeDateFormatService.convertDateObjectToString(obj);
        var isFutureDate = this.changeDateFormatService.isFutureDate(dateInstring)
        if (isFutureDate) {
          this.error.isError = true;
          this.CardHolderGeneralInformationFormGroup.controls['date_of_birth'].setErrors({
            "cardHolderDob": true
          });
          return
        }
        else {
          this.error.isError = false;
          this.error.errorMessage = "";
        }
      }
      this.CardHolderGeneralInformationFormGroup.patchValue({ 'date_of_birth': obj });
      var age = this.changeDateFormatService.getAge(obj.date.year + '/' + obj.date.month + '/' + obj.date.day);
      $('#lblCardHolderAge').html(age.toString());
      return false;
    }
    else {
      this.error.isError = false;
      this.error.errorMessage = "";
      var datePickerValue = new Array();
      var obj = this.changeDateFormatService.changeDateFormat(event);
      datePickerValue[frmControlName] = obj;
      this.CardHolderGeneralInformationFormGroup.patchValue({ 'date_of_birth': obj });
      $('#lblCardHolderAge').html('0');
      return false;
    }
  }

  ValidateAgeWithRole() {
    if (!this.alberta) {
      var isAgeValid = false
      var cardHolderAge = $('#lblCardHolderAge').html();
      if (this.ageObject.age1 < parseInt(cardHolderAge) && this.ageObject.age2 > parseInt(cardHolderAge)) {
        isAgeValid = true
      }
      if ($('#ddlRoleDescription').val() == this.DependantCodeValue && cardHolderAge != '' && !isAgeValid) {
        this.toastrService.warning("For Dependant CardHolder Age should be greater than " + this.ageObject.age2 + " year and less then " + this.ageObject.age1 + " year !!");
        this.CardHolderGeneralInformationFormGroup.patchValue({ 'date_of_birth': null });
      }
    }
  }

  ValidateRole(evt) {
    if (evt.target.checked) {
      var value = $('#ddlRoleDescription').val();
      if (value == this.DependantCodeValue) {
        this.toastrService.warning("Company Employee can not be selected for Dependent Role");
        this.CardHolderGeneralInformationFormGroup.patchValue({ 'company_employee': '' });
      }
    }
  }

  ngOnDestroy() {
    if (this.getprefLang) {
      this.getprefLang.unsubscribe()
    }
  }

}