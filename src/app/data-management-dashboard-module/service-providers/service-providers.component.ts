import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { CommonApi } from '../../common-module/common-api';
import { FinanceApi } from '../../finance-module/finance-api';
import { DataManagementDashboardApi } from '../data-management-dashboard-api';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import { Observable } from 'rxjs/Observable';
declare var jsPDF: any;

@Component({
  selector: 'app-service-providers',
  templateUrl: './service-providers.component.html',
  styleUrls: ['./service-providers.component.css'],
  providers: [DatatableService, ChangeDateFormatService]
})
export class ServiceProvidersComponent implements OnInit {
  columns = [];
  firstDay: Date
  currentMonth: string
  startDate: string;
  endDate: string;
  public composeEmailForm: FormGroup;
  key: any;
  letterTodayDate: string;
  letterAddress: string;
  letterProviderName: any;
  letterAmount: string;
  billingAdd1: any;
  postalCd: any;
  letterAddress2: string;
  letterProviderName1: any;
  today: Date;
  observableObj;
  check:boolean = true
  constructor(private dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private translate: TranslateService) { }

  ngOnInit() {
    var date = new Date();
    var monthLabels = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    var monthIndex = date.getMonth()
    this.currentMonth = monthLabels[monthIndex];
    this.changeDateFormatService.getToday().date.day <= 4 ? this.firstDay = this.firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1) : this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.startDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.formatDateObject(this.firstDay))
    this.endDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
    /* Localization of Service Provider List's columns */
    this.observableObj = Observable.interval(1000).subscribe(x => {
      if (this.check) {
        if (this.translate.instant('dataManagementDashboard.serviceProvider.licenseNo') == 'dataManagementDashboard.serviceProvider.licenseNo') {
        } else {
          this.columns = [
            /* #872 Start */
            { title: this.translate.instant('dataManagementDashboard.serviceProvider.licenseNo'), data: 'licenseNum' },
            { title: this.translate.instant('dataManagementDashboard.serviceProvider.name'), data: 'providerName' },
            { title: this.translate.instant('dataManagementDashboard.serviceProvider.address'), data: 'billingAdd1' },
            { title: this.translate.instant('dataManagementDashboard.serviceProvider.postalCode'), data: 'postalCd'},
            { title: this.translate.instant('dataManagementDashboard.serviceProvider.amount'), data: 'sumamount'},  
            { title: this.translate.instant('dataManagementDashboard.serviceProvider.actions'), data: 'provKey' }
          ]
          this.getServiceProviderList();
          this.observableObj.unsubscribe();
          this.check = false;
        }
      }
    })

    //Compose Email Pop Up Form
    this.composeEmailForm = new FormGroup({
      'toEmail': new FormControl('', [Validators.required]),
      'subjectEmail': new FormControl('', [Validators.required, Validators.maxLength(256)]),
      'bodyEmail': new FormControl('', [Validators.required])
    });
  }

  ngAfterViewInit() {
    var self = this;
    $(document).on('click', '#serviceProviderList .message-ico', function () {
      event.preventDefault();
      self.mailCompose();
    });
    //Mail Compose
    $(document).on('click', '#serviceProviderList .send-ico', function () {
      var id = $(this).data('id')
      self.key = id
      //Print dynamic variables int letter
      self.printLetterContent(self.key)
      //Download HTML after 1 sec
      var delay = 1000;
      setTimeout(function () {
       
        self.downloadFile('exportContent', 'ADSC_provider_without_EFT');
      }, delay)
    })
  }
  /**
   * Print letter content
   * @param id 
   */
  printLetterContent(id) {
    //Today Date
    this.today = new Date();
    //Address Field    
    this.letterProviderName1 = this.dataTableService.serviceProviderListData.providerName;
    this.billingAdd1 = this.dataTableService.serviceProviderListData.billingAdd1;
    this.letterAddress2 = this.dataTableService.serviceProviderListData.cityName + ', ' + this.dataTableService.serviceProviderListData.provinceName;
    this.postalCd = this.dataTableService.serviceProviderListData.postalCd;
    //Provider Name
    this.letterProviderName = this.dataTableService.serviceProviderListData.provBillAddPayeeName
    //Amount Name
    this.letterAmount = this.dataTableService.serviceProviderListData.sumamount != '' ? this.currentUserService.convertAmountToDecimalWithDoller(this.dataTableService.serviceProviderListData.sumamount) : this.currentUserService.convertAmountToDecimalWithDoller(0)
  }

  /**
   * Open outlook email compose
   */
  mailCompose() {
    //if a is negative,undefined,null,empty value then
    var email = (!this.dataTableService.serviceProviderListData.provBillAddEmail) ? this.dataTableService.serviceProviderListData.provBillAddEmail : '';
    var subject = 'Service Provider';
    var emailBody = '';
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + emailBody;
  }

  /**
   * Function to export HTML to Word document
   * @param element(Table Id) 
   * @param filename 
   */
  downloadFile(element, filename = '') {
    var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    var postHtml = "</body></html>";
    var html = preHtml + document.getElementById(element).innerHTML + postHtml;
    var blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    // Specify link url
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    // Specify file name
    filename = filename ? filename + '.doc' : 'document.doc';
    // Create download link element
    var downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // Create a link to the file
      downloadLink.href = url;
      // Setting the file name
      downloadLink.download = filename;
      //triggering the function
      downloadLink.click();
    }
    document.body.removeChild(downloadLink);
  }

  resetEmailSendForm() {
    this.composeEmailForm.reset();
  }

  /**
   * Function to send email
   */
  sendEmail() {
    if (this.composeEmailForm.valid) {
      alert(this.translate.instant('dataManagementDashboard.serviceProvider.emailIsReadyToSend'));
    } else {
      this.validateAllFormFields(this.composeEmailForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  getServiceProviderList() {
    var reqParam = [
      { 'key': 'startDate', 'value': this.startDate },
    ]
    var Url = DataManagementDashboardApi.getServiceProviderWithoutBanUrl;
    var tableId = "serviceProviderList"
    if (!$.fn.dataTable.isDataTable('#serviceProviderList')) {
      var tableActions = [
        { 'name': 'message', 'class': 'table-action-btn message-ico', 'icon_class': 'fa fa-envelope', 'title': this.translate.instant('dataManagementDashboard.serviceProvider.message'), 'showAction': '' },
        { 'name': 'send', 'class': 'table-action-btn send-ico', 'icon_class': 'fa fa-paper-plane-o', 'title': this.translate.instant('dataManagementDashboard.serviceProvider.sendTo'), 'showAction': '' },
      ]
      this.dataTableService.jqueryDataTable(tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 5, '', '', [4], [1, 2, 3, 4, 5])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    return false;
  }

  searchServiceProvider(tableId: string) {
    var params = this.dataTableService.getFooterParams("serviceProviderList")
    var URL = DataManagementDashboardApi.getServiceProviderWithoutBanUrl;
    this.dataTableService.jqueryDataTableReload("serviceProviderList", URL, params, '')
  }

  resetServiceProviderSearch() {
    this.dataTableService.resetTableSearch();
    this.searchServiceProvider("serviceProviderList")
    $('#serviceProviderList .icon-mydpremove').trigger('click');
  }

}
