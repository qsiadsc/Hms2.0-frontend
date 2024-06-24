import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router'
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommonApi } from '../../common-module/common-api'
import { CardServiceService } from '../../card-module/card-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { CommonDatePickerOptions } from '../../common-module/Constants'; // import common date format
import { DataEntryApi} from '../data-entry-api'
import { ToastrService } from 'ngx-toastr'; //add toster service
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';


@Component({
  selector: 'app-data-entry-header',
  templateUrl: './data-entry-header.component.html',
  styleUrls: ['./data-entry-header.component.css'],
  providers: [ChangeDateFormatService,DatatableService,TranslateService]
})
export class DataEntryHeaderComponent implements OnInit {
  user
  list: any;
  selected: any;
  idleState = '';
  timedOut = false;
  lastPing?: Date = null;
  currentRoute;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;//datepicker Options
  submitBatchForm: FormGroup;
  showLoader:boolean = false;
  batchKey = ''
  columns
  ObservableClaimObj
  checkServiceProvider
  oldBtachKey
  showViewBatch:boolean = false
  constructor(
    private router: Router,
    private exDialog: ExDialog,
    private hmsDataService: HmsDataServiceService,
    private cardServiceService: CardServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    public  dataTableService: DatatableService,
    private translate: TranslateService,
  ) { }
  
  ngOnInit() {
    this.user = (localStorage.getItem('user'));
    
  }
  
  LogOut() {
    var userData = localStorage.getItem('userCredential');
    this.cardServiceService.emptyAccessToken.emit(true)
    localStorage.setItem('id', '0')
    localStorage.setItem('currentUser', '');
    localStorage.setItem('userCredential', '');
    localStorage.setItem('user', '');
    localStorage.setItem('role', "");
    window.location.href = 'quikcardlogin'
    this.hmsDataService.postApi(CommonApi.logoutUrl, {}).subscribe(data => {
    })
  }
  liClick(formId) {
    var newUrl = document.getElementById(formId);
    newUrl.className = "active";
  }
}
