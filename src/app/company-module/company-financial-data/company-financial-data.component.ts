import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { Subject } from 'rxjs/Subject';
import { IMyInputFocusBlur } from 'mydatepicker';
import { CompanyService } from '../company.service';
// Package used for phone number/date pattern
// Use command `npm i angular2-text-mask --save` to install package
import { TextMaskModule } from 'angular2-text-mask';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CompanyApi } from '../company-api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Constants } from '../../common-module/Constants';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
@Component({
  selector: 'app-company-financial-data',
  templateUrl: './company-financial-data.component.html',
  styleUrls: ['./company-financial-data.component.css'],
  providers: [ChangeDateFormatService, DatatableService, ToastrService, TranslateService]
})
export class CompanyFinancialDataComponent implements OnInit {
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  datatableElements: DataTableDirective;
  compareAdjustedPapEndDate: any;
  ObservableStandardPAPAmountObj;
  checkStandardPAPAmount = true
  checkPapComment = true
  showPapComments: boolean = false
  showPapComments1: boolean = false
  commentText
  isImportantFlag
  userGroupData: any;
  standard_pap_columns = [];
  papSuspendComments = [];
  buttonText
  ObservableAdjustedPAPAmountObj;
  ObservablePAPAmountObj;
  showCommentBussnsType: boolean = false;
  checkAdjustedPAPAmount = true
  currentUser
  selcetdGroupkey: any;
  adjusted_pap_columns = [];
  ObservableAdminRateObj;
  checkAdminRate = true
  PapSuspendColumnsTable = [];
  admin_rate_history_columns = [];
  //Date Picker Options
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public PapCommentPopUpForm: FormGroup;
  // To be used in template file as a mask
  @Input() financialDataForm: FormGroup;
  @Input() financialFormEditMode: any;
  @Input() financialFormAddMode: any;
  @Input() companyId: any;
  @Input() hideButton: any;
  @Input() mainCompanyArray: any;
  addMode; //Enable true when user add a new company
  viewMode; //Enable true after a new company added
  editMode; //Enable true after viewMode when user clicks edit button
  dateMask = CustomValidators.dateMask;
  alberta: boolean = false
  hideAdjButton
  hidePapButton
  tableActions
  hideAdminRateButton
  hideSuspendedButton
  dataToggle: string;
  admitRateDataTarget: string;
  admitRateId: string;
  admitRateClass: string;
  admitRateTitle: string;
  standardPapDataTarget: string;
  standardPapId: string;
  standardPapClass: string;
  standardPapTitle: string;
  adjustedPapDataTarget: string;
  adjustedPapId: string;
  adjustedPapClass: string;
  showDepartment: boolean = false;
  adjustedPapTitle: string;
  @Output() compareEffectiveOnDate = new EventEmitter(); // to compare the adjustedpapenddate with company efective date

  constructor(
    private companyService: CompanyService,
    private changeDateFormatService: ChangeDateFormatService,
    private _router: Router,
    private dataTableService: DatatableService,
    private hmsDataServiceService: HmsDataServiceService,
    private ToastrService: ToastrService,
    private currentUserService: CurrentUserService,
    private translate: TranslateService,
    private completerService: CompleterService
  ) {
    companyService.getbussinessType.subscribe((value) => {
      if (value) {
        if (value == +Constants.albertaBusnsTypeKey) {
          this.alberta = true
        } else {
          this.alberta = false
        }
      }
    });

    companyService.hideButtons.subscribe((value) => {
      this.hideAdjButton = value.hideAdjButton;
      this.hidePapButton = value.hidePapButton;
      this.hideAdminRateButton = value.hideAdminRateButton;
      this.hideSuspendedButton = value.hideSuspendedButton;
    });
  }

  financialDataVal = {
    'adminrate': new FormControl('', [Validators.required, Validators.maxLength(13), CustomValidators.number, CustomValidators.digitWithDecimal]),
    'standardpapamount': new FormControl('', []),
    'adjustedpapamount': new FormControl(null, []),
    'adjustedpapenddate': new FormControl(null, []),
    'papSuspended': new FormControl('', []),
    'exemptGst': new FormControl('', []),
  }

  ngOnInit(): void {
    this.dtOptions['PapAddComment'] = Constants.dtOptionsConfig
    this.dtTrigger['PapAddComment'] = new Subject();
    this.dataToggle = "modal";
    this.dtOptions['PapComment'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
    this.dtTrigger['PapComment'] = new Subject();
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['ABR'].concat(this.currentUserService.authChecks['BRC'], this.currentUserService.authChecks['VBR'], this.currentUserService.authChecks['UBR'])
        this.currentUser = this.currentUserService.currentUser
        if (this.currentUser.businessType.bothAccess) {
          this.showDepartment = true
        }
        else {
          this.showDepartment = false
        }
        if (this.currentUser.businessType.bothAccess) {
          this.showDepartment = true
        }
        else {
          this.showDepartment = false
        }
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['ABR'].concat(this.currentUserService.authChecks['BRC'], this.currentUserService.authChecks['VBR'], this.currentUserService.authChecks['UBR'])
        this.currentUser = this.currentUserService.currentUser
        if (this.currentUser.businessType.bothAccess) {
          this.showDepartment = true
        }
        else {
          this.showDepartment = false
        }
        if (this.currentUser.businessType.bothAccess) {
          this.showDepartment = true
        }
        else {
          this.showDepartment = false
        }
        localStorage.setItem('isReload', '')
      })
    }

    this.admitRateDataTarget = "#adminRateHistory";
    this.admitRateId = "admin_rate_history";
    this.admitRateClass = "history-ico";
    this.admitRateTitle = "Admin Rate History";
    this.standardPapDataTarget = "#StandardPapAmount";
    this.standardPapId = "standard_pap_history";
    this.standardPapClass = "history-ico";
    this.standardPapTitle = "Standard PAP Amount History";
    this.adjustedPapDataTarget = "#AdjustedPapAmount";
    this.adjustedPapId = "adjusted_pap_history";
    this.adjustedPapClass = "history-ico";
    this.adjustedPapTitle = "Adjusted PAP Amount History";
    /*  Adjusted Pap Amount */
    var adjusted_pap_amt_url = CompanyApi.getAdjustedPapAmtHistoryUrl;
    var adjustedTableId = "adjusted-pap-amount"
    var reqParam = [{ 'key': 'coKey', 'value': this.companyId }]
    this.ObservableAdjustedPAPAmountObj = Observable.interval(1000).subscribe(x => {
      if (this.checkAdjustedPAPAmount = true) {
        if ('company.company-comments.user-name' == this.translate.instant('company.company-comments.user-name')) {
        }
        else {
          this.adjusted_pap_columns = [
            { title: this.translate.instant('company.company-comments.user-name'), data: 'username' },
            { title: this.translate.instant('company.company-comments.adjustedAmount'), data: 'coAdjustedPapAmt' },
            { title: this.translate.instant('company.company-comments.startdate'), data: 'coAdjustedPapStDate' },
            { title: this.translate.instant('company.company-comments.enddate'), data: 'coAdjustedPapEndDate' }];
          this.checkAdjustedPAPAmount = false;
          this.ObservableAdjustedPAPAmountObj.unsubscribe();
        }
      }
    });

    this.ObservablePAPAmountObj = Observable.interval(1000).subscribe(x => {
      if (this.checkPapComment = true) {
        if ('company.company-credit-limit.credit-limit-multiplier' == this.translate.instant('company.company-credit-limit.credit-limit-multiplier')) {
        }
        else {
          this.buttonText = this.translate.instant('button.save');
          this.PapSuspendColumnsTable = [
            { title: "Date", data: 'createdOn' },
            { title: "User Name", data: 'username' },
            { title: "Department", data: 'department' },
            { title: this.translate.instant('company.company-credit-limit.comments'), data: 'commentTxt' },
          ]
          this.checkPapComment = false;
          this.ObservablePAPAmountObj.unsubscribe();
        }
      }
    });

    var standard_pap_amt_url = CompanyApi.getStandardPapAmtHistoryUrl;
    var standardTableId = "standard-pap-amount"
    var reqParam = [{ 'key': 'coKey', 'value': this.companyId }]
    this.ObservableStandardPAPAmountObj = Observable.interval(1000).subscribe(x => {
      if (this.checkStandardPAPAmount = true) {
        if ('company.company-comments.user-name' == this.translate.instant('company.company-comments.user-name')) {
        }
        else {
          this.standard_pap_columns = [
            { title: this.translate.instant('company.company-comments.user-name'), data: 'username' },
            { title: this.translate.instant('company.company-financial-data.standardAmount'), data: 'coStandardPapAmt' },
            { title: this.translate.instant('company.company-comments.startdate'), data: 'coAdjustedPapStDate' },
          ]
          this.checkStandardPAPAmount = false;
          this.ObservableStandardPAPAmountObj.unsubscribe();
        }
      }
    });

    /**Admin Rate History */
    this.ObservableAdminRateObj = Observable.interval(1000).subscribe(x => {
      if (this.checkAdminRate = true) {
        if ('company.company-comments.user-name' == this.translate.instant('company.company-comments.user-name')) {
        }
        else {
          this.admin_rate_history_columns = [
            { title: this.translate.instant('company.company-comments.user-name'), data: 'username' },
            { title: this.translate.instant('company.company-financial-data.admin-rate'), data: 'coAdminRate' },
            { title: this.translate.instant('company.company-comments.startdate'), data: 'createdOn' },
          ]
          this.checkAdminRate = false;
          this.ObservableAdminRateObj.unsubscribe();
        }
      }
    });

    if (this._router.url.indexOf('view') !== -1) {
      this.viewMode = true;
    }

    //Set Values of Form in view mode and disable all form fields
    if (this.viewMode) {
      this.financialDataForm.disable();
    }
    this.PapCommentPopUpForm = new FormGroup({
      commentTxt: new FormControl('', [Validators.required]),
      isImportant: new FormControl('', []),
      PapCommentGroupKey: new FormControl(''),
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger['PapAddComment'].next()
    this.getPAPComments()

  }

  /**
   * @description : This Function is used to convert entered value to valid date format.
   * @params : "event" is datepicker value
   * @params : "frmControlName" is datepicker name/Form Control Name
   * For Reference : https://www.npmjs.com/package/angular4-datepicker
   * @return : None
   */
  changeDateFormatOld(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      // Set Date Picker Value to Form Control Element
      this.financialDataForm.patchValue(datePickerValue);
    }
  }

  changeDateFormat(event, frmControlName, formName, currentDate) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
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
    } else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
    }
    if (frmControlName == 'adjustedpapenddate') {
      setTimeout(() => {
        this.compareAdjustedPapEndDate
        if(this.financialDataForm.value.adjustedpapamount == "" && this.financialDataForm.value.adjustedpapenddate == null){
          this.financialDataForm.controls['adjustedpapenddate'].setErrors(null);
        } else{
         if (this.financialDataForm.value.adjustedpapamount != null && this.financialDataForm.value.adjustedpapenddate == null) {
          this.financialDataForm.controls['adjustedpapenddate'].setErrors({
            adjustedPAPEndDateRequired: true
          });
        } else if (this.financialDataForm.value.adjustedpapenddate != null && this.compareAdjustedPapEndDate) {
          this.financialDataForm.controls['adjustedpapenddate'].setErrors({
            "adjustedpapenddateNotValid": true
          });
        } else {
          this.financialDataForm.controls['adjustedpapenddate'].setErrors(null);
        }
      }
      }, 300);
    }
    if (event.reason == 2) {
      if (formName == 'financialDataForm') {
        this.financialDataForm.patchValue(datePickerValue);
        if (this.financialDataForm.value.adjustedpapenddate && this.financialDataForm.value.adjustedpapenddate.date) {
          this.compareEffectiveOnDate.next(formName)
        }
      }
    }
  }

  /**
   * Validate the company financial data form fields
   * @param formGroup 
   */
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

  /**
   * Get admitRateHistory list
   */
  adminRateHistory() {
    var admin_rate_history_url = CompanyApi.getAdminRateHistoryUrl;
    var adminRateHistoryTableId = "admit-rate-history"
    var reqParam = [{ 'key': 'coKey', 'value': this.companyId }]
    if (!$.fn.dataTable.isDataTable('#admit-rate-history')) {
      this.dataTableService.jqueryDataTable(adminRateHistoryTableId, admin_rate_history_url, 'full_numbers', this.admin_rate_history_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2])
    } else {
      this.dataTableService.jqueryDataTableReload(adminRateHistoryTableId, admin_rate_history_url, reqParam);
    }
  }

  /**
   * Get Standard Pap amount history list
   */
  standardPapAmount() {
    var standard_pap_amt_url = CompanyApi.getStandardPapAmtHistoryUrl;
    var standardTableId = "standard-pap-amount"
    var reqParam = [{ 'key': 'coKey', 'value': this.companyId }]
    if (!$.fn.dataTable.isDataTable('#standard-pap-amount')) {
      this.dataTableService.jqueryDataTable(standardTableId, standard_pap_amt_url, 'full_numbers', this.standard_pap_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2], '', [1])
    } else {
      this.dataTableService.jqueryDataTableReload(standardTableId, standard_pap_amt_url, reqParam);
    }
  }

  /**
   * Get Adjustered Pap amount history list
   */
  adjustedPapAmount() {
    var adjusted_pap_amt_url = CompanyApi.getAdjustedPapAmtHistoryUrl;
    var adjustedTableId = "adjusted-pap-amount"
    var reqParam = [{ 'key': 'coKey', 'value': this.companyId }]
    if (!$.fn.dataTable.isDataTable('#adjusted-pap-amount')) {
      var data = this.dataTableService.jqueryDataTable(adjustedTableId, adjusted_pap_amt_url, 'full_numbers', this.adjusted_pap_columns, 5, true, true, 't', 'irp', undefined, [0, 'asc'], '', reqParam, '', undefined, [2, 3], '', [1])
    } else {
      this.dataTableService.jqueryDataTableReload(adjustedTableId, adjusted_pap_amt_url, reqParam);
    }
  }

  /**
   * Validate the adjustered Pap amount is filled
   */
  isAdjustedFilled() {  
    if(this.financialDataForm.value.adjustedpapamount == "" && this.financialDataForm.value.adjustedpapenddate == null) {
      this.financialDataForm.controls['adjustedpapenddate'].setErrors(null);
    } else{
       if (this.financialDataForm.value.adjustedpapamount != null) {
         if (this.financialDataForm.value.adjustedpapenddate == null) {
        this.financialDataForm.controls['adjustedpapenddate'].setErrors({
          adjustedPAPEndDateRequired: true
        });
      } else {
        this.financialDataForm.controls['adjustedpapenddate'].setErrors(null);
      }
    } else {
      this.financialDataForm.controls['adjustedpapenddate'].setErrors(null);
      this.financialDataForm.controls['adjustedpapenddate'].patchValue(null);
    }
  }
  }

  /**
   * Validate the adjustered Pap amount is not greter than 999999.999
   */
  isAdjustedPapAmontValid(event) {
    if (event.target.value) {
      if (event.target.value > 999999.999)
        this.financialDataForm.controls['adjustedpapamount'].setErrors({
          "isValidAdjustedPapAmount": true
        });
    }
  }

  /**
   * Add Decimal to Standard PAP and Adjusted PAP amoount
   * @param event 
   * @param controlName 
   */
  addDecimal(event, controlName) {
    if (event.target.value) {
      if (event.target.value.indexOf(".") == -1) {
        this.financialDataForm.controls[controlName].patchValue(event.target.value + '.00');
      }
    }
  }

  // setup validations on Standard Pap Amount and adjusted Pap Amount input fields (task 64).
  numericOnly(event): boolean {    
    let patt = /^([0-9])$/;
    let result = patt.test(event.key);
    return result;
}


  /**
   * patch adjustedPapEnd Date error after compare with company effective date
   * @param isTrue 
   */
  patchCompanyEffectiveDateError(isTrue) {
    this.compareAdjustedPapEndDate = isTrue;
    if (isTrue) {
      this.financialDataForm.controls['adjustedpapenddate'].setErrors({
        "adjustedpapenddateNotValid": true
      });
    } else {
      this.financialDataForm.controls['adjustedpapenddate'].setErrors(null);
    }
  }

  papCommentHistory() {
    this.getUserBussinesType()
    if (!this.financialFormAddMode) {
      var PapCommentUrl = CompanyApi.getcompanyPapCommentUrl;
      var companyCreditlimitTableId = "PapComment"
      var reqParam = [
        { 'key': 'coKey', 'value': this.companyId },
      ]
      if (!$.fn.dataTable.isDataTable('#PapComment')) {
        this.dataTableService.jqueryDataTableComment('PapComment', CompanyApi.getcompanyPapCommentUrl, 'full_numbers', this.PapSuspendColumnsTable, 5, true, true, 'lt', 'irp', undefined, [1, 'asc'], '', reqParam, '', '', '', 0, '', [1, 2, 3])
      }
      else {
        this.dataTableService.jqueryDataTableReload(companyCreditlimitTableId, PapCommentUrl, reqParam);
      }
    }

  }

  updateComment(commentForm) {
    let userGroup = ""
    // Task 688 commented because showing wrong department and correct value assigneed
    var department = this.hmsDataServiceService.getUserDepartment()
    if (this.showCommentBussnsType) {
      userGroup = this.selcetdGroupkey
    } else {
      userGroup = this.currentUserService.currentUser.userGroup[0].userGroupKey
    }
    var userId = this.currentUserService.currentUser.userId
    var updateCommentUrl = CompanyApi.companyPapCommentUrl;
    if (this.financialFormAddMode) {
      if (this.PapCommentPopUpForm.valid) {
        this.papSuspendComments.push({
          "userId": this.currentUserService.currentUser.userId,
          "userGroupKey": userGroup,
          "department": department,
          "createdOn": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday()),
          "username": this.currentUser.username,
          "commentTxt": this.PapCommentPopUpForm.value.commentTxt,
        })
      }
      this.reloadTable("PapAddComment")
      if (this.papSuspendComments.length > 0) {
        this.showPapComments1 = true
      }
      else {
        this.showPapComments1 = false
      }
    }
    else {
      if (this.PapCommentPopUpForm.valid) {
        let commentData = {
          "key": this.companyId ? this.companyId : '',
          "commentTxt": this.PapCommentPopUpForm.value.commentTxt,
          "userId": this.currentUserService.currentUser,
          "userGroupKey": userGroup
        }
        this.hmsDataServiceService.postApi(updateCommentUrl, commentData).subscribe(data => {
          if (data.code == 200 && data.status === "OK") {
            this.commentText = this.PapCommentPopUpForm.value.commentTxt;
            this.showPapComments = true
            this.papCommentHistory()
            var userId = this.currentUserService.currentUser.userId
            this.ToastrService.success(this.translate.instant('card.toaster.comment-add'));
            this.PapCommentPopUpForm.reset();
          }
        });
      } else {
        this.validateAllFormFields(this.PapCommentPopUpForm);
      }
    }
    this.PapCommentPopUpForm.reset();
  }

  getUserBussinesType() {
    if (this.currentUser.businessType.bothAccess || this.currentUser.isAdmin == 'T') {
      this.showCommentBussnsType = true
      this.userGroupData = this.completerService.local(
        this.currentUser.userGroup,
        "userGroupName",
        "userGroupName"
      );
    } else {
      this.showCommentBussnsType = false
    }
  }

  onSelect(selected: CompleterItem) {
    if (selected) {
      this.selcetdGroupkey = selected.originalObject.userGroupKey
    }
  }

  resetPapForm() {
    this.PapCommentPopUpForm.reset();
    this.buttonText = this.translate.instant('button.save');
  }

  reloadTable(tableId) {
    this.dataTableService.reloadTableElem(this.dtElements, tableId, this.dtTrigger[tableId], false);
  }

  getPAPComments() {
    let papComment = {
      "coKey": this.companyId,
    }
    let promise = new Promise((resolve, reject) => {
      var url = CompanyApi.getcompanyPapCommentUrl;
      this.hmsDataServiceService.postApi(url, papComment).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.showPapComments = true
        } else if (data.code == 404) {
          this.showPapComments = false
        } else {
          this.showPapComments = false
        }
      })
    });
    return promise;
  }
}
