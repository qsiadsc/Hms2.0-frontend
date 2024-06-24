import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { PlanApi } from '../plan-api';
import { Router, ActivatedRoute, Params, RouteReuseStrategy } from '@angular/router';
import { FormGroup, FormControl, NgForm, Validators, FormBuilder } from '@angular/forms';

import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { ToastrService } from 'ngx-toastr';
import { QueryList, ViewChildren } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';
import { Location } from '@angular/common';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'; 
import { PlanService } from './../plan.service';
import { RuleListComponent } from '../../plan/rule-list/rule-list.component';

@Component({
  selector: 'app-find-proc',
  templateUrl: './find-proc.component.html',
  styleUrls: ['./find-proc.component.css'],
  providers:[ChangeDateFormatService,DatatableService,PlanService]
})
export class FindProcComponent implements OnInit {
  covKey: any;
  disciplineKey: any;
  plansKey: any;
  PlanFrequenciesFormGroup: FormGroup; //Intitialize form 
  planCoverageCategoryData = [];
  coverageProcedureJson = [];
  coverageRulesJson = [];
  dentalRule = [];
  showLoader: boolean = false;

  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  planCoverageRulesData: any;
  columns: { title: string; data: string; }[];
  ObservableDashboardObj: any;
  translate: any;
  rulecolumns: { title: string; data: string; }[];
  procCodeError: boolean;
  proc_code:any='';
  @ViewChild(RuleListComponent) RuleListComponentObject;
  divisionKeyId: any;
  coKeyUrlId :any
  constructor(
    private hmsDataServiceService: HmsDataServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private ToastrService: ToastrService,
    private dataTableService: DatatableService,
    private currentUserService: CurrentUserService,
    private planService: PlanService
    
  ) {
    this.route.queryParams.subscribe((params: Params) => {
      this.covKey = params.covKey;
      this.disciplineKey = params.disciplineKey;
      this.plansKey = params.plansKey;
      this.divisionKeyId = params.divisionKeyId;
      this.coKeyUrlId =params.coKey;
    });
  }

  @Input()

  ngOnInit() {
    this.PlanFrequenciesFormGroup = new FormGroup({
      'plan_num': new FormControl(''),
      'division_num': new FormControl(''),
      'division_description': new FormControl(''),
      'proc_code': new FormControl(''),
    });
    this.getFrequencies();
    this.getDataByProcCode('') ;
  }
  

  getFrequencies() {
    this.showLoader = true;
    var URL = PlanApi.getPlanFrequenciesUrl;
    let submitData = {
      "covKey": this.covKey,
      "disciplineKey": this.disciplineKey,
      "plansKey": this.plansKey
    }
    this.hmsDataServiceService.postApi(URL, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK") {
        this.showLoader = false;
        this.PlanFrequenciesFormGroup.patchValue({
          'plan_num': data.result.planCoverageJson.plansId,
          'division_num': data.result.planCoverageJson.divisionId,
          'division_description': data.result.planCoverageJson.plansName,
          'proc_code': ''
        });
      }
    })
  }

  /** Function For Jump to Previous Page */
  goBack() {
     this.location.back();
     // Plan in breadcrumb is not clickable on “VIEW - Search Proc Code” page issue resolved (point no-109)
     this.router.navigate(['/company/plan/view/'], { queryParams: { 'companyId': this.coKeyUrlId, 'planId': this.plansKey, 'divisonId': this.divisionKeyId } });
  }

  //issue number 338 start
  searchProcCode(){
    this.procCodeError =false;
    var proc_code = this.PlanFrequenciesFormGroup.get('proc_code').value;
    if(proc_code.length > 0){
      this.getDataByProcCode(proc_code);
      this.RuleListComponentObject.getRuleListByProcCode(proc_code,this.plansKey,this.divisionKeyId);
    }else{
      this.procCodeError =true;
    }
  }

  getDataByProcCode(proc_code) {
    var URL = PlanApi.getDataByProcCodeUrl;
    let submitData = [
     
      {key: 'disciplineCd', value: 'D'},
      {key: 'procId', value: proc_code},
      {key: 'plansKey', value: this.plansKey},
      {key: 'divisionKey', value: this.divisionKeyId}
    ]
    var URL = PlanApi.getDataByProcCodeUrl; 
    var tableId = "plan-category"
    this.columns=[
      {title:'Coverage Category', data:'covCategory'},
      {title:'Effective Date', data:'effectiveDate'},
      {title:'Expired Date', data:'expireDate'}
    ];
  
   if (!$.fn.dataTable.isDataTable('#plan-category')) {
    var check =  this.dataTableService.jqueryDataTable(tableId, URL, 'full_numbers',  this.columns  , 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', submitData, '', undefined, [1,2], '', [], []);
  }
  else {
    this.dataTableService.jqueryDataTableReload(tableId, URL, submitData)
  }
   
  }

  //issue number 338 end
}

