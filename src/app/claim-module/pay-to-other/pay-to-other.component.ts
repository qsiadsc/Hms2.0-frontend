import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder,ReactiveFormsModule } from '@angular/forms';
import { ClaimService } from '../claim.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardApi } from './../../card-module/card-api';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Constants } from '../../common-module/Constants';

@Component({
  selector: 'pay-to-other',
  templateUrl: './pay-to-other.component.html',
  styleUrls: ['./pay-to-other.component.css']
})
export class PayToOtherComponent implements OnInit {

  @Input() ClaimPayToOtherFormGroup: FormGroup;

  ClaimPayToOtherFormGroupVal = {
    payeeName: [''],
    postalCode: ['',Validators.maxLength(7)],
    city: [''],
    province: [''],
    country: [''],
    addressLine1: [''],
    addressLine2: ['']
  }
  showOtherForm
  constructor(private claimService: ClaimService,
    private hmsDataServiceService: HmsDataServiceService,
    private route: ActivatedRoute,
  ) { 
    claimService.payToOther.subscribe(value => {
      if(value == Constants.otherPayeeTypeKey){
        this.showOtherForm = true
        this.setValidations(value) 
      }else{
        this.showOtherForm = false
        this.setValidations(value) 
      }
    }) 
  }

  setValidations(value){
    if(value == 30){ // Log #0181683 
      this.ClaimPayToOtherFormGroup.reset();
      this.ClaimPayToOtherFormGroup.get('payeeName').setValidators(Validators.required);
      this.ClaimPayToOtherFormGroup.get('postalCode').setValidators(Validators.required);
      this.ClaimPayToOtherFormGroup.get('addressLine1').setValidators(Validators.required);
      this.ClaimPayToOtherFormGroup.get('addressLine2').setValidators(Validators.required);
      this.ClaimPayToOtherFormGroup.get('city').setValidators(Validators.required);
      this.ClaimPayToOtherFormGroup.get('province').setValidators(Validators.required)
      this.ClaimPayToOtherFormGroup.get('country').setValidators(Validators.required)
      this.ClaimPayToOtherFormGroup.get('payeeName').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('postalCode').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('addressLine1').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('addressLine2').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('city').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('province').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('country').updateValueAndValidity();

    }
    else{
      this.ClaimPayToOtherFormGroup.reset();
      this.ClaimPayToOtherFormGroup.get('payeeName').clearValidators();
      this.ClaimPayToOtherFormGroup.get('postalCode').clearValidators();
      this.ClaimPayToOtherFormGroup.get('addressLine1').clearValidators();
      this.ClaimPayToOtherFormGroup.get('addressLine2').clearValidators();
      this.ClaimPayToOtherFormGroup.get('city').clearValidators();
      this.ClaimPayToOtherFormGroup.get('province').clearValidators();
      this.ClaimPayToOtherFormGroup.get('country').clearValidators();
      this.ClaimPayToOtherFormGroup.get('payeeName').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('postalCode').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('addressLine1').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('addressLine2').updateValueAndValidity();      
      this.ClaimPayToOtherFormGroup.get('city').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('province').updateValueAndValidity();
      this.ClaimPayToOtherFormGroup.get('country').updateValueAndValidity();
    }
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      if (!(params['cardHolderKey'])) {
        this.ClaimPayToOtherFormGroup.reset()
      }
    });
  }

  isCompanyPostalcodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = CardApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL =CardApi.isCompanyCityProvinceCountryValidUrl;
      
      this.hmsDataServiceService.postApi(URL, postalNumber).subscribe(data => {
        
        switch (data.code) {
          case 404:
          this.ClaimPayToOtherFormGroup.controls['postalCode'].setErrors(
            {
              "postalcodeNotFound": true
            });
            break;
            case 302:
            this.ClaimPayToOtherFormGroup.patchValue({
              'city': data.result.cityName,
              'province': data.result.provinceName,
              'country': data.result.countryName
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
            countryName: this.ClaimPayToOtherFormGroup.get('country').value,
            provinceName: this.ClaimPayToOtherFormGroup.get('province').value,
            postalCd: this.ClaimPayToOtherFormGroup.get('postalCode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
          case 'country':
          fieldParameter = {
            cityName: this.ClaimPayToOtherFormGroup.get('city').value,
            countryName: event.target.value,
            provinceName: this.ClaimPayToOtherFormGroup.get('province').value,
            postalCd: this.ClaimPayToOtherFormGroup.get('postalCode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
          case 'province':
          fieldParameter = {
            cityName: this.ClaimPayToOtherFormGroup.get('city').value,
            countryName: this.ClaimPayToOtherFormGroup.get('country').value,
            provinceName: event.target.value,
            postalCd: this.ClaimPayToOtherFormGroup.get('postalCode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
        }
        var ProvinceVerifyURL =CardApi.isCompanyCityProvinceCountryValidUrl;
        
        this.hmsDataServiceService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
          switch (data.code) {
            case 404:
            this.ClaimPayToOtherFormGroup.controls[fieldName].setErrors(errorMessage);
            break;
            case 302:
            this.ClaimPayToOtherFormGroup.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            
            break;
          }
          
        });
      }
      
    }

}
