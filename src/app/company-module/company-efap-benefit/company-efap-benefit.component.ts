import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CompanyApi } from '../company-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-company-efap-benefit',
  templateUrl: './company-efap-benefit.component.html',
  styleUrls: ['./company-efap-benefit.component.css']
})
export class CompanyEfapBenefitComponent implements OnInit {
  addEFAPBenefitForm: any;
  coKey: any;
  observableEFAPBenefitObj: any;
  efapBenefitColumns = [];

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

     /*  EFAP Benefit Functionality */
     this.observableEFAPBenefitObj = Observable.interval(1000).subscribe(x => {
      this.efapBenefitColumns = [
        { title: this.translate.instant('EFAP Rate'), data: 'efapRate' },
        { title: this.translate.instant('common.effectivedate'), data: 'effectiveOn' },
        { title: this.translate.instant('common.expirydate'), data: 'expiredOn' },
      //  { title: this.translate.instant('common.action'), data: 'coEfapEnrolmentKey' }
       ]
       this. getEFAPBenefitList();
       this.observableEFAPBenefitObj.unsubscribe();  
});


    this.addEFAPBenefitForm = new FormGroup({
      efapRate: new FormControl('', [Validators.required, Validators.maxLength(13), CustomValidators.number]),
      efapEffectiveDate: new FormControl('', Validators.required),
      efapExpiryDate: new FormControl('')
    })

  }


  getEFAPBenefitList() {
    var efapBenefitTableId = "efapLists"
    var reqParam = [{ 'key': 'coKey', 'value': this.coKey }]
    if (!$.fn.dataTable.isDataTable('#efapLists')) {
      this.dataTableService.jqueryDataTable('efapLists', CompanyApi.getCoEFAPBenefitListUrl, 'full_numbers', this.efapBenefitColumns, 5, true, false, 't', 'irp', undefined, [1, 'asc'], '', reqParam, '', [], [1, 2])
    } else {
      this.dataTableService.jqueryDataTableReload(efapBenefitTableId, CompanyApi.getCoEFAPBenefitListUrl, reqParam);
    }
    setTimeout(() => {
      this.editEFAPBenefit();      
   }, 2000);
  }

  editEFAPBenefit() {
    let dataRows = this.dataTableService.efapList
   // var efapRate = dataRow[0].replace("$", "");
    let benefit = {
      efapRate: dataRows.efapRate,
      efapEffectiveDate: this.changeDateFormatService.changeDateByMonthName(dataRows.effectiveOn),
      efapExpiryDate: this.changeDateFormatService.changeDateByMonthName(dataRows.expiredOn),
    }
    this.addEFAPBenefitForm.patchValue(benefit);
  }
}
