import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Constants } from '../../common-module/Constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-duplicate-claim-item',
  templateUrl: './duplicate-claim-item.component.html',
  styleUrls: ['./duplicate-claim-item.component.css']
})
export class DuplicateClaimItemComponent implements OnInit {


  claimItems: any[];
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {}
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;

  discipline : any;
  alberta:boolean = false;


  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {

    this.dtOptions['claimItemsTable'] = Constants.dtOptionsSortingConfig
    this.dtTrigger['claimItemsTable'] = new Subject();

  }

  ngAfterViewInit(): void {
    this.dtTrigger['claimItemsTable'].next();
  }

  continue(){
    this.activeModal.close();
  }
  
}
