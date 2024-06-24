import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CompanyService } from '../company.service';
@Component({
  selector: 'app-company-general-information',
  templateUrl: './company-general-information.component.html',
  styleUrls: ['./company-general-information.component.css']
})
export class CompanyGeneralInformationComponent implements OnInit {
  companyGeneralInformation: FormGroup;

  @Input() generalInformationFormData: any;
  constructor( 
    private companyService: CompanyService
    ) { 
      companyService.setCompanyData.subscribe((value) => { 
        if(value){
          this.companyGeneralInformation.setValue({
            coId: value.coId != '' ? value.coId : '',
            coName: value.coName != '' ? value.coName : '',
          });
        }
      });
    }
  
  ngOnInit() {
    this.companyGeneralInformation = new FormGroup({
         'coId' : new FormControl('', []),
         'coName' : new FormControl('', [])
    })
  }

}
