import { Component, OnInit } from '@angular/core';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css'],
  providers:[DatatableService,TranslateService]
})
export class CompanyListComponent implements OnInit {
  columns= [
    { title:"#", data: 'id' },
    {title:this.translate.instant('company.businessType.name'), data: 'firstName' },
    { title:this.translate.instant('company.businessType.city-name'),data: 'lastName' },
    { title:this.translate.instant('company.businessType.province-name'), data: 'lastName' },
    { title:this.translate.instant('company.businessType.effective-on'), data: 'lastName' },
    { title:this.translate.instant('company.businessType.terminated-on'), data: 'lastName' },
    { title:this.translate.instant('company.company-search.businessType'), data: 'lastName' },
    {title:this.translate.instant('common.action'), data: 'id'}
  ];

  constructor(private dataTableService: DatatableService,private translate:TranslateService) {}

  ngOnInit(): void {
  }

  search(){
  }

}
