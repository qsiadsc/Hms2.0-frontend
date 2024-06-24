import { Component, OnInit, ViewChild, Input, ViewChildren } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CommonDatePickerOptions } from './../common-module/Constants';
import { CommonModuleModule} from './../common-module/common-module.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from './../common-module/shared-services/datatable.service'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-data-entry-module',
  templateUrl: './data-entry-module.component.html',
  styleUrls: ['./data-entry-module.component.css'],
  providers: [ChangeDateFormatService, TranslateService, DatatableService]
})
export class DataEntryModuleComponent implements OnInit {

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {  
  }

}