import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../common-module/shared-services/change-date-format.service';
import { CommonDatePickerOptions, Constants } from '../common-module/Constants';
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ItransViewerApi } from './itrans-viewer-api';
import { DatatableService } from '../common-module/shared-services/datatable.service'
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute, Params } from '@angular/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
declare var jsPDF: any;
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-itrans-viewer-module',
  templateUrl: './itrans-viewer-module.component.html',
  styleUrls: ['./itrans-viewer-module.component.css'],
  providers: [TranslateService, ChangeDateFormatService, DatatableService, CurrentUserService]
})

export class ItransViewerModuleComponent implements OnInit {
  businessData: any;
  selectedBusinessTypeValue: string;
  showBothBussinesType: any;
  showHideBusinessTypeDropDown: any;
  public filterITransForm: FormGroup;
  showReference: boolean;
  showDate: boolean;
  showDateRange: boolean;
  showNone: boolean;
  error: any;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  transactionType: any;
  tranStatusArr: any = '';
  transTypeArr = [];
  attachedClaimStatusArr: any;
  gridColumns = [];
  showITransSearchList: boolean = false;
  attachedClaimDiv: boolean = true;
  viewTransactionBy = '';
  showPageLoader: boolean = false;
  printData = <any>[];
  dentalClaimItemsListArr = [];
  options = [];
  public isOpen: boolean = false;
  popUpRefNum: any;
  mesasgeListArr = [];
  observableItransObj: any;
  check: boolean;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  @Input() currentUser: any
  public businessTypeData: CompleterData;
  constructor(
    private translate: TranslateService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private datatableService: DatatableService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public currentUserService: CurrentUserService,
    private completerService: CompleterService,
  ) { }

  itransArray = [{
    "viewItransViewer": 'F',
  }]

  ngOnInit() {
    /* Security check for iTrans Viewer Module */
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['ITV']
        this.getAuthCheck(checkArray)
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['ITV']
        this.getAuthCheck(checkArray)
      })
    }

    this.filterITransForm = new FormGroup({
      'transTypeChkClaim': new FormControl(),
      'transTypeChkPredetermination': new FormControl(),
      'transTypeChkCOBClaim': new FormControl(),
      'transTypeChkClaimReversal': new FormControl(),
      'transTypeChkEligibility': new FormControl(),
      'transTypeChkAttachment': new FormControl(),
      'tranStatusChkAccepted': new FormControl(),
      'tranStatusChkHeld': new FormControl(),
      'tranStatusChkRejected': new FormControl(),
      'attachedClaimStatus': new FormControl(),
      'viewTransactionBy': new FormControl(),
      'referenceNumber': new FormControl(),
      'viewTransByDate': new FormControl(),
      'viewTransByFromDate': new FormControl(),
      'viewTransByToDate': new FormControl(),
      'none': new FormControl(),
      'providerLicense': new FormControl(),
      'officeNumber': new FormControl(),
      'cardNumber': new FormControl(),
      'planType': new FormControl()
    });

    this.route.queryParams.subscribe((params) => {
      if (params['isGov'] && params['type']) {
        if (params['type'] == 'I') {
          /**Start Default Patch */
          this.filterITransForm.patchValue({
            'transTypeChkClaim': '1',
            'transTypeChkPredetermination': '3',
            'transTypeChkCOBClaim': '7',
            'transTypeChkClaimReversal': '2',
            'transTypeChkEligibility': '8',
            'transTypeChkAttachment': '9'
          });
          this.transTypeArr.push("1", "3", "7", "2", "8", "9");
          this.filterITransForm.patchValue({ 'attachedClaimStatus': 'X' });
          this.attachedClaimStatusArr = "X";
          this.filterITransForm.patchValue({ 'viewTransactionBy': 'viewTransactionByDateRange' });
          this.viewTransactionBy = "viewTransactionByDateRange";
          this.showDateRange = true;
          let currentDate = new Date()
          let currentMonth = currentDate.getMonth() + 1
          var currentlastDay = new Date(currentDate.getFullYear(), currentDate.getMonth()+6);
          let currentFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth()-6,currentDate.getDate()); 
          this.filterITransForm.patchValue({ 'viewTransByToDate': this.changeDateFormatService.formatDateObject(currentDate) })
          this.filterITransForm.patchValue({ 'viewTransByFromDate': this.changeDateFormatService.formatDateObject(currentFirstDay) })
        }
        /**End Patch If Coming From Dashboard */
        this.onSubmit(this.filterITransForm);
        $('html, body').animate({
          scrollTop: $(document).height()
        }, 'slow');
      } else {
        this.ngAfterViewInit_Custom();
      }
    });
    this.currentUserService.getUserRoleId().then(res => {
      this.currentUser = this.currentUserService.currentUser;
      this.showHideBusinessTypeDropDown = this.currentUserService.userBusinnesType.bothAccess;
      this.getBusinessType(); // get list of all Business Type
    })
  }

  getSumAmount(column) {
    let sum = 0;
    for (let i = 0; i < this.dentalClaimItemsListArr.length; i++) {
      let val = 0;
      let val_claim = 0;
      if (this.dentalClaimItemsListArr[i][column] != '' && this.dentalClaimItemsListArr[i][column] != null && this.dentalClaimItemsListArr[i][column] != undefined) {
        val = +this.dentalClaimItemsListArr[i][column];
      }
      sum += val;
      if (val_claim > 0) {
        sum += val_claim
      }
    }
    return sum;
  }
  ngAfterViewInit_Custom() {
    this.filterITransForm.patchValue({
      'transTypeChkClaim': '1',
      'transTypeChkPredetermination': '3',
      'transTypeChkCOBClaim': '7',
      'transTypeChkClaimReversal': '2',
      'transTypeChkEligibility': '8',
      'transTypeChkAttachment': '9'
    });
    this.transTypeArr.push("1", "3", "7", "2", "8", "9");
    this.tranStatusArr = '';
    this.filterITransForm.patchValue({ 'viewTransactionBy': 'viewTransactionByNone' });
    this.viewTransactionBy = "viewTransactionByNone";
    /** Action Icons Click Event */
    var self = this;
    $(document).on('click', '#itrans-list .external-link', function () {
      var claimKey = $(this).data('id');
      self.viewClaimPage(claimKey)
    });
    $(document).on('click', '#itrans-list .view-ico', function () {
      let claimKey = $(this).data('id');
      self.printItrans(claimKey, 'printITrans')
    });
    $(document).on('click', '#itrans-list .download-ico', function () {
      let claimKey = $(this).data('id');
      self.printItrans(claimKey, 'downloadITrans')
    });
  }

  viewClaimPage(claimKey) {
    var reqParam = {
      "claimReferenceNumber": +claimKey,
      "disciplineKey": 1
    }
    this.hmsDataService.postApi(ItransViewerApi.getClaimKeyByClaimReferenceNumber, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        window.open('/claim/view/' + data.result.claimKey + '/type/1', '_blank');
      }
    })
  }

  printItrans(refNum, type) {
    this.getPrintPopUpData(refNum, type);
  }

  /**
   * Get Print iTrans Search Data
   * @param refNum 
   */
  getPrintPopUpData(refNum, type) {
    this.popUpRefNum = refNum;
    this.showPageLoader = true;
    var url = ItransViewerApi.printItransSearchDataUrl;
    let requestParam = {}
    requestParam = {
      'referenceNumber': refNum
    }
    this.hmsDataService.postApi(url, requestParam).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        this.showPageLoader = false;
        this.hmsDataService.OpenCloseModal('printITransPopUpDiv');
        this.printData = data.result;
        this.dentalClaimItemsListArr = data.result.dentalClaimItemsList;
        this.mesasgeListArr = data.result.claimMessages;
        var self = this;
        if (type == 'printITrans') {
        } else {
          setTimeout(function () {
            self.printPDFPlanDetails('preClaimDesc');
          }, 1000);
        }
      }
    });
  }

  /**
   * Transaction Type
   * @param event 
   */

  transTypeChange(event) {
    if (this.filterITransForm.value.transTypeChkClaim || this.filterITransForm.value.transTypeChkPredetermination || this.filterITransForm.value.transTypeChkCOBClaim || this.filterITransForm.value.transTypeChkClaimReversal || this.filterITransForm.value.transTypeChkEligibility || this.filterITransForm.value.transTypeChkAttachment) {
      if (this.transTypeArr.includes(event.target.value)) {
        for (var i = 0; i < this.transTypeArr.length; i++) {
          if (this.transTypeArr[i] == event.target.value) {
            this.transTypeArr.splice(i, 1);
          }
        }
      } else {
        if (event.target.checked) {
          this.transTypeArr.push(event.target.value);
        }
      }
    } else {
      for (var i = 0; i < this.transTypeArr.length; i++) {
        if (this.transTypeArr[i] == event.target.value) {
          this.transTypeArr.splice(i, 1);
        }
      }
    }
  }

  /**
   * Transaction Status
   * @param event 
   */
  tranStatusChange(event) {
    // issue 702 start
    let val = ""
    if (event.target.value != "R") {
      val = event.target.value
    } else {
      val = ''
    }
    this.tranStatusArr = val;
    // issue 702 End
  }

  /**
   * Attached Claim Status
   * @param event 
   */
  attachedClaimStatusChange(event) {
    this.attachedClaimStatusArr = event.target.value;
  }

  setViewTransBy(event) {
    this.viewTransactionBy = event;
    switch (event) {
      case 'viewTransactionByReference':
        this.showReference = true;
        this.showDate = false;
        this.showDateRange = false;
        this.showNone = false;
        break;

      case 'viewTransactionByDate':
        this.showReference = false;
        this.showDate = true;
        this.showDateRange = false;
        this.showNone = false;
        this.setDate();
        break;

      case 'viewTransactionByDateRange':
        this.showReference = false;
        this.showDate = false;
        this.showDateRange = true;
        this.showNone = false;
        break;

      case 'viewTransactionByNone':
        this.showReference = false;
        this.showDate = false;
        this.showDateRange = false;
        this.showNone = true;
        break;
      default:
        break;
    }
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.filterITransForm.patchValue(datePickerValue);
    } else if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      this.filterITransForm.patchValue(datePickerValue);
    }
    if (frmControlName == 'viewTransByFromDate' || frmControlName == 'viewTransByToDate') {
      if (this.filterITransForm.value.viewTransByFromDate && this.filterITransForm.value.viewTransByToDate) {
        this.error = this.changeDateFormatService.compareTwoDates(this.filterITransForm.value.viewTransByFromDate.date, this.filterITransForm.value.viewTransByToDate.date);
        if (this.error.isError == true) {
          this.filterITransForm.controls['viewTransByToDate'].setErrors({
            "ToDateNotValid": true
          });
        }
      }
    }
  }
  /**
    * Serach ITrans List on press enter
    * @param event 
    */
  onKeyPressEvent(event) {
    if (event.keyCode == 13) {
      this.onSubmit(this.filterITransForm);
    }
  }

  /**
   * ITrans Search Submit
   * @param filterITransForm 
   */
  onSubmit(filterITransForm) {
    let relese = '';
    let claimSize = 1;
    let transSize = 1;
    let sta = '';
    let txStatus = ''

    if (this.filterITransForm.value.planType == null) {
      this.filterITransForm.value.planType = ''
    }
    if (this.filterITransForm.valid) {
      if (this.transTypeArr.length == 0) {
        this.showITransSearchList = false;
        this.toastrService.error(this.translate.instant('itransViewer.ts.pleaseSelectAtleastOneTransactionType'))
        return false;
      }
      let attachedClaimStatusArr: any = [];
      let clStatus: any = '';
      let array = false
      if (this.attachedClaimStatusArr == 'AX') {
        array = true;
        attachedClaimStatusArr.push("X");
        attachedClaimStatusArr.push("A");
        claimSize = 2;
      } else {
        if (this.attachedClaimStatusArr == 'T') {
          relese = "T"
          attachedClaimStatusArr = [];
          claimSize = 0
        } else {
          if (!this.attachedClaimStatusArr) {
            attachedClaimStatusArr = [];
          } else {
            attachedClaimStatusArr = this.attachedClaimStatusArr;
            clStatus = this.attachedClaimStatusArr
          }
        }
      }
      if (this.tranStatusArr == '') {
        transSize = 0;
        this.tranStatusArr = [];
        txStatus = '';
      } else {
        txStatus = this.tranStatusArr;
      }
      let claim = []
      if (array) {
        claim = attachedClaimStatusArr
      } else {
        claim = []
      }
      this.showITransSearchList = true;
      /** Show Search Grid */
      // this is used to get the translation of iTrans Table  - START
      this.observableItransObj = Observable.interval(1000).subscribe(value => {
        if (this.check = true) {
          if ('common.date' == this.translate.instant('common.date')) {
          } else {
            this.gridColumns = [
              { title: this.translate.instant('itransViewer.ts.release'), data: 'release' },
              { title: this.translate.instant('itransViewer.ts.reference'), data: 'referenceNumber' },
              { title: this.translate.instant('itransViewer.ts.office'), data: 'officeNumber' },
              { title: this.translate.instant('itransViewer.ts.card'), data: 'cardNumber' },
              { title: this.translate.instant('itransViewer.ts.claimStatus'), data: 'claimStatus' },
              { title: this.translate.instant('itransViewer.ts.fullName'), data: 'fullName' },
              { title: this.translate.instant('itransViewer.ts.transType'), data: 'transType' },
              { title: this.translate.instant('itransViewer.ts.provider'), data: 'providerNumber' },
              { title: this.translate.instant('itransViewer.ts.date'), data: 'soutCreationDate' },
              { title: this.translate.instant('itransViewer.ts.printed'), data: 'printed' },
              { title: this.translate.instant('itransViewer.ts.processed'), data: 'processed' },
              { title: this.translate.instant('itransViewer.ts.inTransCode'), data: 'inTransCode' },
              { title: this.translate.instant('itransViewer.ts.outTransCode'), data: 'outTransCode' },
              { title: this.translate.instant('itransViewer.ts.outTransStatus'), data: 'outTransStatus' },
              { title: this.translate.instant('itransViewer.ts.action'), data: 'referenceNumber' }
            ]
            if (clStatus == 'AL') {
              clStatus = ''
            }
            var reqParam = [
              { 'key': 'tranStatusCd', 'value': [] },
              { 'key': 'release', 'value': relese },
              { 'key': 'claimSize', 'value': claimSize },
              { 'key': 'transSize', 'value': transSize },
              { 'key': 'clStatus', 'value': clStatus },
              { 'key': 'txStatus', 'value': txStatus },
              { 'key': 'claimStatusCd', 'value': claim },
              { 'key': 'transactionType', 'value': this.transTypeArr },
              { 'key': 'providerNumber', 'value': this.filterITransForm.value.companyBusinessType },
              { 'key': 'officeNumber', 'value': this.filterITransForm.value.officeNumber },
              { 'key': 'cardNumber', 'value': this.filterITransForm.value.cardNumber },
              { 'key': 'planType', 'value': this.filterITransForm.value.planType },
              { 'key': 'providerNumber', 'value': this.filterITransForm.value.providerLicense },
              { 'key': 'start', 'value': 0 },
              { 'key': 'length', 'value': 25 }
            ];
            switch (this.viewTransactionBy) {
              case 'viewTransactionByReference':
                if (this.filterITransForm.value.referenceNumber == null) {
                  this.toastrService.error(this.translate.instant('itransViewer.ts.pleaseSpecifyReference'))
                  this.showITransSearchList = false;
                  return false;
                } else {
                  reqParam.push({ 'key': 'referenceNumber', 'value': this.filterITransForm.value.referenceNumber });
                }
                break;
              case 'viewTransactionByDate':
                if (this.filterITransForm.value.viewTransByDate == null) {
                  this.toastrService.error(this.translate.instant('itransViewer.ts.pleaseSpecifyDate'))
                  this.showITransSearchList = false;
                  return false;
                } else {
                  reqParam.push({ 'key': 'outCreationDate', 'value': this.filterITransForm.value.viewTransByDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterITransForm.value.viewTransByDate) : '' });
                }
                break;
              case 'viewTransactionByDateRange':
                if (this.filterITransForm.value.viewTransByFromDate == null) {
                  this.toastrService.error(this.translate.instant('itransViewer.ts.pleaseSpecifyFromDate'))
                  this.showITransSearchList = false;
                  return false
                } else if (this.filterITransForm.value.viewTransByToDate == null) {
                  this.toastrService.error(this.translate.instant('itransViewer.ts.pleaseSpecifyToDate'))
                  this.showITransSearchList = false;
                  return false
                } else if (this.filterITransForm.value.viewTransByFromDate == null && this.filterITransForm.value.viewTransByToDate == null) {
                  this.toastrService.error(this.translate.instant('itransViewer.ts.pleaseSpecifyDateRange'))
                  this.showITransSearchList = false;
                  return false
                } else {
                  reqParam.push({ 'key': 'outStartDate', 'value': this.filterITransForm.value.viewTransByFromDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterITransForm.value.viewTransByFromDate) : '' },
                    { 'key': 'outEndDate', 'value': this.filterITransForm.value.viewTransByToDate != null ? this.changeDateFormatService.convertDateObjectToString(this.filterITransForm.value.viewTransByToDate) : '' });
                }
                break;
              case 'viewTransactionByNone':
                break;
            }

            var URL = ItransViewerApi.searchItransFilterUrl;
            var tableId = "itrans-list";
            var tableActions = [
              { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': '' },
              { 'name': 'edit', 'class': 'table-action-btn download-ico', 'icon_class': 'fa fa-download', 'title': 'Download', 'showAction': '' },
              { 'name': 'redirect', 'class': 'table-action-btn external-link', 'icon_class': 'fa fa-external-link', 'title': 'Redirect', 'showAction': '' }
            ]
            if (!$.fn.dataTable.isDataTable('#itrans-list')) {
              this.datatableService.jqueryDataTable(tableId, URL, 'full_numbers', this.gridColumns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 14, [], '', [], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
            } else {
              this.datatableService.jqueryDataTableReload(tableId, URL, reqParam)
            }
              /** End Search Grid */
              this.check = false;
              this.observableItransObj.unsubscribe();
          }
        }
      });
      // Translation of iTrans Table END
    } else {
      this.validateAllFormFields(this.filterITransForm)
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

  resetSearchForm() {
    this.filterITransForm.reset();
    this.ngAfterViewInit_Custom();
    this.showITransSearchList = false;
  }

  dowloadPDFReport() {
    var url = ItransViewerApi.searchItransFilterUrl;
    this.showPageLoader = true;
    let requestParam = {};
    let attachedClaimStatusArr = [];
    let reportPopUpTitle = "IRANS CLAIM LIST"
    if (this.attachedClaimStatusArr == 'AX') {
      attachedClaimStatusArr.push(["A", "X"]);
    } else {
      attachedClaimStatusArr.push(this.attachedClaimStatusArr);
    }
    requestParam = {
      'tranStatusCd': this.tranStatusArr,
      'claimStatusCd': attachedClaimStatusArr,
      'transactionType': this.transTypeArr,
      'providerNumber': this.filterITransForm.value.providerLicense,
      'officeNumber': this.filterITransForm.value.officeNumber,
      'cardNumber': this.filterITransForm.value.cardNumber,
      "start": 0,
      "length": this.datatableService.totalRecords
    }
    this.hmsDataService.postApi(url, requestParam).subscribe(data => {
      if (data.code == 200 && data.status == 'OK') {
        var doc = new jsPDF('p', 'pt', 'a3');
        let FromDate = this.filterITransForm.value.viewTransByFromDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterITransForm.value.viewTransByFromDate)) : '';
        let endDate = this.filterITransForm.value.viewTransByToDate != null ? this.changeDateFormatService.changeDateByMonthName(this.changeDateFormatService.convertDateObjectToString(this.filterITransForm.value.viewTransByToDate)) : '';
        var columns = [
          { title: this.translate.instant('itransViewer.ts.reference'), dataKey: 'referenceNumber' },
          { title: this.translate.instant('itransViewer.ts.cardID'), dataKey: 'cardNumber' },
          { title: this.translate.instant('itransViewer.ts.fullName'), dataKey: 'fullName' },
          { title: this.translate.instant('itransViewer.ts.provider'), dataKey: 'providerNumber' },
          { title: this.translate.instant('itransViewer.ts.totalPayable'), dataKey: 'officeNumber' }
        ];
        this.showPageLoader = false;
        var rows = data.result.data;
        //Start Header
        var headerobject = [];
        headerobject.push({
          'gridHeader1': this.translate.instant('itransViewer.ts.ITRANSCLAIMLIST'),
          'text5Date': FromDate + ' - ' + endDate
        });
        this.pdfHeader(doc, headerobject);
        //End Header  
        doc.autoTable(columns, rows, {
          styles: { overflow: 'linebreak', cellWidth: 'auto', fontSize: 8 },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [215, 214, 213],
            lineWidth: 1,
          },
          columnStyles: {
            "referenceNumber": { halign: 'left' },
            "cardNumber": { halign: 'right' },
            "fullName": { halign: 'right' },
            "providerNumber": { halign: 'right' },
            "officeNumber": { halign: 'right' }
          },
          didParseCell: function (data) {
            if (data.section == 'head' && data.column.index != 0) {
              data.cell.styles.halign = 'right';
            }
          },
          startY: 100,
          startX: 40,
          theme: 'grid',
        });
        //Start Footer
        this.pdfFooter(doc, 1);
        //End Footer
        doc.save(reportPopUpTitle.replace(/\s+/g, '_') + '.pdf');
      } else if (data.code == 404 && data.status == 'NOT_FOUND') {
        this.showPageLoader = false;
        this.toastrService.error(this.translate.instant('report.recordNotFound'));
      }
    });
  }

  /**
 * Create The Quikcard Header
 * @param doc 
 * @param headerobject 
 */
  pdfHeader(doc, headerobject) {
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report') {
        doc.text(headerobject[0].text5Date, 1100, 90, null, null, 'right');
      } else {
        doc.text(headerobject[0].text5Date, 800, 90, null, null, 'right');
      }
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.setTextColor('#009BDB');
    doc.text(headerobject[0].gridHeader1, 40, 90);
    return true;
  }

  /**
   * Create Alberta Header
   */
  pdfHeaderADSC(doc, headerobject) {
    var imageData = 'data:image/png;base64,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';
    doc.addImage(imageData, 'JPEG', 40, 10);
    doc.setFontSize(10);
    doc.setFontType('normal');
    //Date    
    if (headerobject[0].text5Date != undefined) {
      doc.setFontSize(8);
      doc.setTextColor('#808080');
      if (headerobject[0].gridHeader1 == 'Unit Financial Transactions List Report ') {
        doc.text(headerobject[0].text5Date, 1000, 90, null, null, 'right');
      } else {
        doc.text(headerobject[0].text5Date, 800, 90, null, null, 'right');
      }
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.setTextColor('#009BDB');
    doc.text(headerobject[0].gridHeader1, 40, 90);
    return true;
  }

  /**
   * Create Pdf Footer
   * @param doc 
   * @param reportId 
   */
  pdfFooter(doc, reportId) {
    if (reportId == 73) {
      doc.autoTable.previous.finalY = 290;
      doc.autoTable.previous.cursor.x = 800;
    }
    //Start Footer      
    doc.setFontSize(8);
    //Left Line1
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('T', 40, doc.autoTable.previous.finalY + 40);
    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('1-800-232-1997 | 780-426-7526', 50, doc.autoTable.previous.finalY + 40);

    //Left Line2
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('F', 40, doc.autoTable.previous.finalY + 50);

    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('780-426-7581', 50, doc.autoTable.previous.finalY + 50);

    //Left Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('E', 40, doc.autoTable.previous.finalY + 60);

    doc.setFontType('normal');
    doc.setTextColor('#808080');
    doc.text('claims@quikcard.com', 50, doc.autoTable.previous.finalY + 60);

    //Right Line1
    doc.text('#200, 17010 - 103 Avenue', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 40, null, null, 'right');
    //Right Line2
    doc.text('Edmonton, AB T5S 1K7', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 50, null, null, 'right');
    //Right Line3
    doc.setFontType('bold');
    doc.setTextColor('#36C4B1');
    doc.text('quikcard.com', doc.autoTable.previous.cursor.x, doc.autoTable.previous.finalY + 60, null, null, 'right');
  }

  printPlanDetails(printSectionId: string): void {
    let printContents, popupWin;
    printContents = document.getElementById(printSectionId).innerHTML;
    popupWin = window.open('', '_blank', 'top=30,left=30,height=600,width=1200');
    popupWin.document.open();
    popupWin.document.write(
      `<html>
          <head>
            <title>STANDARD DENTAL CLAIM FORM</title>
            <style>           
            @font-face {
              font-family: 'Montserrat';
              src: url('../../assets/fonts/shav-font/Montserrat-Regular.woff2') format('woff2');
              src: url('../../assets/fonts/shav-font/Montserrat-Regular.woff') format('woff');
              font-weight: normal;
              font-style: normal;
             }
            </style>
          </head>                
          <body onload="window.print();window.close()" style="font-family: 'Montserrat';">            
          ${printContents}</body>
        </html>`
    );
    popupWin.document.close();
  }

  printPDFPlanDetails(printSectionId: string): void {
    const elementToPrint = document.getElementById(printSectionId); //The html element to become a pdf
    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.addHTML(elementToPrint, () => {
      pdf.save('dental_claim_form.pdf');
    });
  }
  // -----------------Issue No. 701 Start----------------------------

  setDate(): void {
    // Set today date using the patchValue function
    let date = new Date();
    this.filterITransForm.patchValue({
      viewTransByDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
  }
  // -----------------------Issue No. 701 End- -------------------------------

  getBusinessType() {
    this.showHideBusinessTypeDropDown = this.currentUserService.userBusinnesType.bothAccess;
    var businessType = this.currentUserService.userBusinnesType.bothAccess
    //Predictive Company Search Upper
    this.businessTypeData = this.completerService.local(
      this.currentUser.businessType,
      "businessTypeCd",
      "businessTypeDesc"
    );
    this.businessData = this.businessTypeData
    Promise.all(this.businessData._data.map(data =>
      this.options.push({
        "value": data.businessTypeCd,
        "name": data.businessTypeDesc
      })
    ))
    if (this.currentUserService.userBusinnesType.isQuikcard) {
      this.filterITransForm.patchValue({
        "planType": "Q",
      });
      this.selectedBusinessTypeValue = this.currentUserService.userBusinnesType[0].businessTypeCd;
    } if (this.currentUserService.userBusinnesType.isAlberta) {
      this.filterITransForm.patchValue({
        "planType": "S",
      });
      this.selectedBusinessTypeValue = this.currentUserService.userBusinnesType[0].businessTypeCd;
    }
  }

  /* Get Auth Checks for Domain(01-Dec-2020) */
  getAuthCheck(iTransChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.itransArray = [{
        "viewItransViewer": 'T'
      }]
    } else {
      for (var i = 0; i < iTransChecks.length; i++) {
        authCheck[iTransChecks[i].actionObjectDataTag] = iTransChecks[i].actionAccess
      }
      this.itransArray = [{
        "viewItransViewer": authCheck['IVR372']
      }]
    }
    return this.itransArray
  }

}