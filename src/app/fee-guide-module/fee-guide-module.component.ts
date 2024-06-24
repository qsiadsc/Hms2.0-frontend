import { Component, OnInit, Input, ViewChildren, ViewChild, ElementRef,Renderer } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from './../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from './../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CustomValidators } from './../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions } from './../common-module/Constants';
import { Constants } from './../common-module/Constants';
import { ClaimApi } from './../claim-module/claim-api';
import { TranslateService} from '@ngx-translate/core';
import { ServiceProviderService} from '../service-provider-module/serviceProvider.service';
import { DatatableService } from './../common-module/shared-services/datatable.service'
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ClaimService } from './../claim-module/claim.service';

@Component({
  selector: 'app-fee-guide-module',
  templateUrl: './fee-guide-module.component.html',
  styleUrls: ['./fee-guide-module.component.css']
})
export class FeeGuideModuleComponent  implements OnInit {
 
 


 
 
  constructor(
    private fb: FormBuilder,
    private hmsDataService: HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    public dataTableService: DatatableService,
    private translate: TranslateService,
    private serviceProviderService: ServiceProviderService
  ){
    
  }
  ngOnInit() {
    
   
  }

  
  
}
