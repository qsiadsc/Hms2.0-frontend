import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Constants } from '../../../common-module/Constants';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { CardServiceService } from '../../../card-module/card-service.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'card-holder-popup-general-information',
  templateUrl: './card-holder-popup-general-information.component.html',
  styleUrls: ['./card-holder-popup-general-information.component.css'],
  providers: [ChangeDateFormatService]
})

export class CardHolderPopupGeneralInformationComponent implements OnInit {
  @Input() CardHolderPopupGeneralInfoFormGroup: FormGroup
  @Input() CardHolderGeneralInfo: {}
  @Input() cardHolderData: any;
  @Input() cardHolderKey: string;
  arrGenderList;
  card_id;
  test;
  alberta: boolean = false;
  bussinessType: number;
  businessCd: string;
  gernalInfoEditValue;
  genInfo: Subscription;
  prefLang: Subscription;

  constructor(private fb: FormBuilder, public cardService: CardServiceService,
    private changeDateFormatService: ChangeDateFormatService
  ) {
    this.genInfo = this.cardService.getCardHolderGeneralInfo.subscribe(data => {
      var gemder = data.gender;
      if (gemder == 'M') {
        gemder = 'Male'
      }
      else if (gemder == 'F') {
        gemder = 'Female'
      }
      else if (gemder == 'O') {
        gemder = 'Other'
      }
      this.CardHolderGeneralInfo = {
        card_id: data.card_id,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: gemder,
        date_of_birth: this.changeDateFormatService.convertDateObjectToString(data.date_of_birth),
        sin: data.sin
      }
    })
    this.prefLang = cardService.getPrefferedLanguage.subscribe((value) => {
      this.gernalInfoEditValue = value;
      this.businessCd = this.gernalInfoEditValue.businessTypeCd;
    })
  }

  ngOnInit() {
    if (this.businessCd == Constants.albertaBusinessTypeCd) {
      this.alberta = true;
    }
  }

  ngOnDestroy() {
    if (this.genInfo) {
      this.genInfo.unsubscribe();
    }
    else if (this.prefLang) {
      this.prefLang.unsubscribe();
    }
  }
}