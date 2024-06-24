import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { RulesSearchFilterComponent } from './rules-search-filter/rules-search-filter.component';
import { FormCanDeactivate } from './../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { RuleAddEditComponent } from './rule-add-edit/rule-add-edit.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from './../common-module/shared-services/validators/custom-validator.directive';
import { Location } from '@angular/common';
import { RulesService } from './rules.service'
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'
@Component({
  selector: 'app-rules-module',
  templateUrl: './rules-module.component.html',
  styleUrls: ['./rules-module.component.css'],
  providers: [RulesService]
})
export class RulesModuleComponent extends FormCanDeactivate implements OnInit {
  FormGroup: FormGroup;
  @ViewChild('FormGroup')
  @ViewChild(RuleAddEditComponent) addEditRuleForm;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
    private currentUserService: CurrentUserService,
  ) {
    super();
  }

  ngOnInit() {
  }

}