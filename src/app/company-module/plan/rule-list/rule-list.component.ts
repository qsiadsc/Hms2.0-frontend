import { Component, OnInit, Output } from '@angular/core';
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
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import 
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service'; 
import { PlanService } from './../plan.service';
@Component({
  selector: 'app-rule-list',
  templateUrl: './rule-list.component.html',
  styleUrls: ['./rule-list.component.css'],
  providers:[ChangeDateFormatService,DatatableService,PlanService]
})
export class RuleListComponent implements OnInit {
  rulecolumns: { title: string; data: string; }[];

  constructor(private hmsDataServiceService: HmsDataServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private ToastrService: ToastrService,
    private dataTableService: DatatableService,
    private currentUserService: CurrentUserService,
    private planService: PlanService) { }
    
    @Output()

  ngOnInit() {
    this.getRuleListByProcCode('','',"1");
  }


  getRuleListByProcCode(proc_code,plansKey,disciplineKey) {
    var URL = PlanApi.getRuleListByProcCode;
    let obj = [
      {key: 'disciplineCd', value: 'D'},
      {key: 'ruleMask', value: proc_code},
      {key: 'plansKey', value: plansKey},
      {key: 'divisionKey', value: disciplineKey}
    ]
    var tableId = "plan-rule"
    this.rulecolumns=[
      {title:'Rule CD', data:'ruleCd'},
      {title:'Rule Description', data:'ruleDescription'},
      {title:'Effective Date', data:'effectiveDate'},
      {title:'Expire Date', data:'expireDate'}
    ]
    
  
    if (!$.fn.dataTable.isDataTable('#plan-rule')) {
      this.dataTableService.jqueryDataTable(tableId, URL, 'full_numbers',  this.rulecolumns  , 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', obj, '', undefined, [], '', [], [1,2,3])
    }else{
      this.dataTableService.jqueryDataTableReload(tableId, URL, obj)
    }
   
  }

}
