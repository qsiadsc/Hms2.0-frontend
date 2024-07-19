import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { CompanyApi } from '../company-api';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';

@Component({
  selector: 'app-company-akira-benefit',
  templateUrl: './company-akira-benefit.component.html',
  styleUrls: ['./company-akira-benefit.component.css']
})
export class CompanyAkiraBenefitComponent implements OnInit {
  addAkiraBenefitForm: any;
  coKey: any;
  observableAkiraBenefitObj: any;
  checkAkiraBenefit: boolean;
  buttonTextBenefit: any;
  akiraColumns = [];

  constructor(
    private dataTableService: DatatableService,
    private router: ActivatedRoute,
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
  ) { }

  ngOnInit() {
  
    this.router.params.subscribe(params => {
      this.coKey= +params['id']; // (+) converts string 'id' to a number
    })

    
   /* Log #1061: Akira Benefit Functionality */
   this.observableAkiraBenefitObj = Observable.interval(1000).subscribe(x => {
    if (this.checkAkiraBenefit = true) {
      if ('company.company-credit-limit.credit-limit-multiplier' == this.translate.instant('company.company-credit-limit.credit-limit-multiplier')) {
      }
      else {
        this.akiraColumns = [
          { title: this.translate.instant('Admin Rate'), data: 'akiraRate' },
          { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
          { title: this.translate.instant('common.expirydate'), data: 'expiredOn' },
         // { title: this.translate.instant('common.action'), data: 'coAkiraEnrolmentKey' }
        ]
        this.getAkiraBenefitList()
        this.checkAkiraBenefit = false;
        this.observableAkiraBenefitObj.unsubscribe();
      }
    }

  });

    this.addAkiraBenefitForm = new FormGroup({
      adminRate: new FormControl('', [Validators.required, Validators.maxLength(13), CustomValidators.number]),
      effectiveDate: new FormControl('', Validators.required),
      expiryDate: new FormControl('')
    })

  }

  getAkiraBenefitList() {
    var akiraBenefitTableId = "akiraLists"
    var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
    if (!$.fn.dataTable.isDataTable('#akiraLists')) {
      this.dataTableService.jqueryDataTable('akiraLists', CompanyApi.getCoAkiraEnrolmentListUrl, 'full_numbers', this.akiraColumns, 5, true, false, 't', 'irp', undefined, [1, 'asc'], '', reqParam, '', [], [1, 2])
    } else {
      this.dataTableService.jqueryDataTableReload(akiraBenefitTableId, CompanyApi.getCoAkiraEnrolmentListUrl, reqParam);
    }
    setTimeout(() => {
        this.editAkiraBenefit();      
     }, 2000);
  }


  editAkiraBenefit() {
    let dataRow = this.dataTableService.akiraList  
    // var adminRate = dataRow[0].replace("$", "");
    let benefit = {
      adminRate: dataRow.akiraRate,
      effectiveDate: this.changeDateFormatService.changeDateByMonthName(dataRow.effectiveOn),
      expiryDate: this.changeDateFormatService.changeDateByMonthName(dataRow.expiredOn)
    }
    this.addAkiraBenefitForm.patchValue(benefit);
  }
}
