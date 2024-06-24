import { Component, OnInit, ViewChild, ElementRef, ViewChildren, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompanyService } from '../company.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TextMaskModule } from 'angular2-text-mask';
import { Constants } from '../../common-module/Constants';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { BrokerApi } from './../broker-api';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { CommentModelComponent } from '../../common-module/shared-component/CommentsModal/comment-model/comment-model.component'; // Import comments json
import { CommentEditModelComponent } from '../../common-module/shared-component/comment-edit-model/comment-edit-model.component';
import { ToastrService } from 'ngx-toastr'; 
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { DatePipe } from '@angular/common';
import { FormCanDeactivate } from '../../common-module/shared-resources/screen-lock/form-can-deactivate/form-can-deactivate';
import { Observable } from 'rxjs/Observable';
import { deepEqual } from 'assert';
import { IMyDpOptions } from 'mydatepicker';
import { TranslateService } from '@ngx-translate/core';
import { CommonApi } from '../../common-module/common-api';


@Component({
  selector: 'app-broker-edit',
  templateUrl: './broker-edit.component.html',
  styleUrls: ['./broker-edit.component.css'],
  providers: [CompanyService, ChangeDateFormatService, DatatableService, TranslateService, ToastrService, DatePipe]
})
export class BrokerEditComponent extends FormCanDeactivate implements OnInit {
  currentUser: any;
  brokerSearchBtn: boolean;
  item: boolean;
  expired: boolean;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }
  observableTerminationObj;
  banktableActions;
  checkTermination = true;
  columns = [];
  @ViewChild('FormGroup')
  @ViewChild(CommentModelComponent) commentFormData; // to acces variable of Comment from 
  @ViewChild(CommentEditModelComponent) commentEditFormData; // to acces variable of Comment from 
  @ViewChild("autoFocusBankNumber") trgFocusBankNameEl: ElementRef;
  submitted = false;
  buttonText

  addBrokerAuthCheck = [{
    "addComment": "F",
    "saveBrokerComment": "F",
    "saveBroker": "F",
    "editBroker": "F",
    "terminateBroker": "F",
    "reactivateBroker": "F",
    "addBankAccount": "F",
    "saveBankAccount": "F",
    "editBankAccount": "F",
    "searchCompany": 'F',
    "searchBroker": 'F',
  }]
  checkBrokerBtn

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private companyService: CompanyService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private dataTableService: DatatableService,
    private toastrService: ToastrService,
    public currentUserService: CurrentUserService,
    private exDialog: ExDialog,
    private datePipe: DatePipe,
    private translate: TranslateService,
  ) {
    super();
    /* Used to Display Error With Element */
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };
    this.getTerminationReasonList();
  }

  checked;
  //FocusVariable
  checkFocus;
  ObservableObj;
  // companyData;
  selectBoxTitle;

  bankFormEffectiveDateError = false;
  effective_date_for_expiry;
  parentBrokerKey = '';
  parentBrokerId = '';
  brokerBankAccountKey;
  dataToEditArray = [];
  dataId;
  editMode;
  viewMode = false;
  brokerId;
  brokerData;
  Broker;
  BrokerTerminationDate = false;
  terminateDate;
  phoneMask = CustomValidators.phoneMaskV1; // add phone format to phone field
  public TerminationReasonList = [];
  dateNameArray = {};
  /* Used to Display Error With Element */
  error: any;
  error1: any;
  error2: any;
  TerminateDataTableId;
  TerminateDataTableUrl;
  TerminateDataTableReqParam;


  /** Broker Bank Data Table Params */
  bankDataTableId;
  bankDataTableUrl;
  bankDataTableReqParam;
  brokerObj;
  checkBroker = true;
  brokerTableColumns = [];

  /** Broker Bank Data Table Params */
  FormGroup: FormGroup //intailize Form
  private brokerForm: FormGroup; //Broker form is used for both add and edit broker
  public terminateBrokerForm: FormGroup; // change private to public for production errors
  private commentsForm: FormGroup;
  public bankAccountsForm: FormGroup; // change private to public for production errors

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  myDatePickerOptionsViewMode = CommonDatePickerOptions.myDatePickerOptions;
  myDatePlaceholder = CommonDatePickerOptions.myDatePlaceholder;

  currentDate;
  mainCompanyArray = []
  showBackBrokerBtn: boolean = false;

  ngOnInit() {
    // Add Broker Form Validations
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['ABR'].concat(this.currentUserService.authChecks['BRC'], this.currentUserService.authChecks['VBR'], this.currentUserService.authChecks['BBC'], this.currentUserService.authChecks['SCO'], this.currentUserService.authChecks['SBR'])
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['ABR'].concat(this.currentUserService.authChecks['BRC'], this.currentUserService.authChecks['VBR'], this.currentUserService.authChecks['BBC'], this.currentUserService.authChecks['SCO'], this.currentUserService.authChecks['SBR'])
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
      })
    }

    if (this.currentUserService.isBrokerSearch) {
      this.brokerSearchBtn = this.currentUserService.isBrokerSearch
      this.currentUserService.isBrokerSearch = false;
    }

    if (this.Broker) {
      this.terminateDate = this.Broker.terminateDate
    }
    this.currentDate = this.datePipe.transform(new Date(), 'dd/mmm/yyyy');
    var self = this

    this.route.params.subscribe(params => {
      this.brokerId = params['id'];
      this.parentBrokerKey = params['id'];
    });

    // Add/Edit Broker Form Validations
    this.FormGroup = new FormGroup({
      'broker_id': new FormControl('', [Validators.required, CustomValidators.onlyNumbers, Validators.minLength(4), Validators.maxLength(5)]),
      'broker_name': new FormControl('', [Validators.required, Validators.maxLength(60), CustomValidators.notEmpty]),
      'gts_registration': new FormControl('', CustomValidators.notEmpty),
      'address1': new FormControl('', [Validators.required, Validators.maxLength(50), CustomValidators.alphaNumericWithSpecialChar, CustomValidators.notEmpty]),
      'address2': new FormControl('', [Validators.maxLength(50), CustomValidators.alphaNumericWithSpecialChar, CustomValidators.notEmpty]),
      'postalCode': new FormControl('', [Validators.required, Validators.maxLength(7), CustomValidators.alphaNumeric, CustomValidators.notEmpty]),
      'city': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'province': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60), CustomValidators.alphabetsWithApostrophe, CustomValidators.notEmpty]),
      'country': new FormControl('', [Validators.required, Validators.maxLength(60), CustomValidators.onlyAlphabets, CustomValidators.notEmpty]),
      'email': new FormControl('', [CustomValidators.vaildEmail]),
      'phone_no': new FormControl('', []),
      'extension': new FormControl('', [Validators.minLength(3), Validators.maxLength(5), CustomValidators.onlyNumbers]),
      'fax_no': new FormControl(''),
      'effective_date': new FormControl('', Validators.required),
      'brokerSuspensionInd': new FormControl(''),
      'optoutCompanyEmailInd': new FormControl(''),
      'brokerMultiCommAgrInd': new FormControl(''),
      'broker_termination_date': new FormControl(''), // Derfault disable Only for view purpose
      'broker_termination_reason': new FormControl('') // Derfault disable Only for view purpose
    });

    //edit Broker form
    if (this.brokerId) {
      this.findBrokerById(this.brokerId);
      this.editMode = true;
      this.FormGroup.disable();
      this.onShowClearDateButton(false);
    } else {
      this.editMode = false;
      this.getBrokerAutoNumber();
    }

    // Terminate Broker Form Validations
    this.terminateBrokerForm = new FormGroup({
      'termination_reason': new FormControl(null, Validators.required),
      'termination_date': new FormControl('', Validators.required),
      'broker_termination_reason': new FormControl(''),

    });

    // Comments Form Validations
    this.commentsForm = new FormGroup({
      'add_comment': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]),
    });

    // Add Bank Accounts Form Validations
    this.bankAccountsForm = new FormGroup({
      'bank_name': new FormControl('', [Validators.required, Validators.maxLength(60), CustomValidators.alphaNumericHyphen, CustomValidators.notEmpty]),
      'bank_number': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(12), CustomValidators.validBankNo]),
      'branch': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(10), CustomValidators.validBankNo]),
      'account_number': new FormControl('', [Validators.required, Validators.minLength(7), Validators.maxLength(20), CustomValidators.validBankNo]), // log 781
      'effective_date': new FormControl('', Validators.required),
      'expiry_date': new FormControl(''),
    });

    $(document).unbind();
    $(document).on('click', '#broker-bank-table .edit-ico', function () {
      var item = new Array();
      var $row = $(this).closest("tr"),       // Finds the closest row <tr> 
        $tds = $row.find("td");             // Finds all children <td> elements
      var i = 0;

      $.each($tds, function () {
        item[i] = $(this).text();
        i++;
      });

      var bankKey = $(this).data('id')
      self.editBankAccount(bankKey, item);

    })

    $(document).on('mouseover', '.edit-ico', function () {
      $(this).attr('title', 'Edit');
    })
    $(document).on('mouseover', '.del-ico', function () {
      $(this).attr('title', 'Delete');
    })

    /** --------------Teminate Form DataTable --------------- */

    $("input[type='text']").attr("autocomplete", "off");
    window.scrollTo(0, 0)

    var somethingChanged = false;
    $('#bankAccountsForm input').change(function () {
      somethingChanged = true;
    });
    $(window).bind('beforeunload', function (e) {
      if (somethingChanged)
        return "You made some changes and it's not saved?";
      else
        e = null; // i.e; if form state change show warning box, else don't show it.
    });

    //-------  Focus ------   
    let vm = this;
    jQuery("#broker_name").focus(function () {
      vm.checkFocus = false;
    });
    document.getElementById('broker_name').focus();
    //---------- Focus-----------

    /**
    * Initialize the broker terminate table colums
    */
    this.bankAccountsDataTableInitialize();

    if (this.companyService.showBackBrokerSearchBtn) {
      this.showBackBrokerBtn = true
      this.companyService.showBackBrokerSearchBtn = false
    } else {
      this.showBackBrokerBtn = false
    }
  }

  /**
   * Get Broker Privileges checks
   * @param claimChecks 
   */
  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.addBrokerAuthCheck = [{
        "addComment": 'T',
        "saveBrokerComment": 'T',
        "saveBroker": 'T',
        "editBroker": 'T',
        "terminateBroker": 'T',
        "reactivateBroker": 'T',
        "addBankAccount": 'T',
        "saveBankAccount": 'T',
        "editBankAccount": 'T',
        "searchCompany": 'T',
        "searchBroker": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.addBrokerAuthCheck = [{
        "addComment": authCheck['BRC120'],
        "saveBrokerComment": authCheck['BRC119'],
        "saveBroker": authCheck['ABR118'],
        "editBroker": authCheck['VBR123'],
        "terminateBroker": authCheck['VBR124'],
        "reactivateBroker": authCheck['VBR125'],
        "addBankAccount": authCheck['BBC126'],
        "saveBankAccount": authCheck['BBC127'],
        "editBankAccount": authCheck['BBC128'],
        "searchCompany": authCheck['SCO75'],
        "searchBroker": authCheck['SBR121']
      }]
    }
    return this.addBrokerAuthCheck
  }

  /**
   * Initialize the broker terminate table colums
   */
  dataTableInitialize() {
    /** --------------Teminate Form DataTable --------------- */
    this.TerminateDataTableId = "terminate-table"
    this.TerminateDataTableUrl = BrokerApi.brokerTerminateHistory;
    this.TerminateDataTableReqParam = [
      { 'key': 'brokerKey', 'value': this.parentBrokerKey }
    ]
    var terminationtableActions = [];
    /* Set Terminate table Coloumn Data in Json Format for datatable columns */
    this.observableTerminationObj = Observable.interval(1000).subscribe(x => {
      if (this.checkTermination = true) {
        if ('company.company-terminate.termination-reason' == this.translate.instant('company.company-terminate.termination-reason')) {
        }
        else {
          this.columns = [
            { title: this.translate.instant('company.edit-broker.termination-reason'), data: 'terminateReason' },
            { title: this.translate.instant('company.edit-broker.termination-date'), data: 'terminateDate' },
            { title: this.translate.instant('company.edit-broker.resume-date'), data: 'brokerRestartOn' }
          ]
          var dateCols = ['terminateDate', 'brokerRestartOn']
          this.dataTableService.jqueryDataTable(this.TerminateDataTableId, this.TerminateDataTableUrl, 'full_numbers', this.columns, 5, true, false, 't', 'irp', undefined, [0, 'asc'], '', this.TerminateDataTableReqParam, terminationtableActions, undefined, [1, 2], '', '', [1, 2])
          this.checkTermination = false;
          this.observableTerminationObj.unsubscribe();
        }
      }
    });

    /** -------------- End terminate Form DataTable --------------- */
  }

  /**
   * Initialize the broker bank account table colums
   */
  bankAccountsDataTableInitialize() {
    this.bankDataTableId = "broker-bank-table"
    this.bankDataTableUrl = BrokerApi.getBrokerBankAccountUrl;
    this.bankDataTableReqParam = [
      { 'key': 'brokerKey', 'value': this.parentBrokerKey }
    ]
    this.brokerObj = Observable.interval(1000).subscribe(value => {
      if (this.checkBroker = true) {
        if ('company.company-bank-account.bank-name' == this.translate.instant('company.company-bank-account.bank-name')) {
        } else {
          this.buttonText = this.translate.instant('button.save');
          this.brokerTableColumns = [
            { title: this.translate.instant('company.company-bank-account.bank-no'), data: 'brokerBankNum' },
            { title: this.translate.instant('company.company-bank-account.branch-no.'), data: 'brokerBankBranchNum' },
            { title: this.translate.instant('company.company-bank-account.bank-name'), data: 'brokerBankName' },
            { title: this.translate.instant('company.company-bank-account.account-no.'), data: 'brokerBankAccNum' },
            { title: this.translate.instant('company.company-bank-account.effective-date'), data: 'effectiveOn' },
            { title: this.translate.instant('company.company-bank-account.expiry-date'), data: 'brokerBankexpiredOn' },
            { title: this.translate.instant('common.action'), data: 'brokerBankAccountKey' }
          ]
          this.checkBroker = false;
          this.brokerObj.unsubscribe();
        }
      }
    });
  }

  onShowClearDateButton(showDateClearBtn) {
    let copy = this.getCopyOfOptions();
    copy.showClearDateBtn = showDateClearBtn;
    this.myDatePickerOptionsViewMode = copy;
  }

  getCopyOfOptions(): IMyDpOptions {
    return JSON.parse(JSON.stringify(this.myDatePickerOptions));
  }

  getTerminationReasonList() {
    var api = Constants.baseUrl + "/company-service/getTerminationCategory";
    this.hmsDataServiceService.get(api).subscribe(data => {
      this.TerminationReasonList = data.result;
    });
  }

  findBrokerById(id: any) {
    this.hmsDataServiceService.get(BrokerApi.getBrokerByKeyUrl + "/" + id).subscribe(data => {
      if (data.code == 302 && data.hmsShortMessage == 'RECORD_GET_SUCCESSFULLY') {
        this.Broker = data['result'];
        this.parentBrokerKey = this.Broker.brokerKey;
        this.parentBrokerId = this.Broker.brokerId;
        if (this.Broker.brokerExpiredOn) {

          this.BrokerTerminationDate = true;
          this.terminateDate = this.Broker.brokerExpiredOn
        }
        this.FormGroup.patchValue({
          'broker_name': this.Broker.brokerName,
          'broker_id': this.Broker.brokerId,
          'gts_registration': this.Broker.brokerGstRegNum,
          'address1': this.Broker.brokerAddress1,
          'address2': this.Broker.brokerAddress2,
          'postalCode': this.Broker.brokerPostalCode,
          'city': this.Broker.brokerCity,
          'province': this.Broker.brokerProvince,
          'country': this.Broker.brokerCountry,
          'email': this.Broker.brokerEmail,
          'phone_no': this.Broker.brokerPhone,
          'extension': this.Broker.brokerPhoneExtn != "" ? this.Broker.brokerPhoneExtn.trim() : '',
          'fax_no': this.Broker.brokerFax,
          "brokerSuspensionInd": this.Broker.brokerSuspensionInd == 'T' ? true : false,
          "optoutCompanyEmailInd": this.Broker.brokerOptoutComEmailInd == 'T' ? true : false,
          "brokerMultiCommAgrInd": this.Broker.brokerMultiCommAgrInd == 'T' ? true : false,
        });
        var dateArray = this.changeDateFormatService.convertStringDateToObject(this.Broker.brokerEffectiveOn);
        this.FormGroup.patchValue({
          effective_date: {
            date: {
              year: dateArray.date.year,
              month: dateArray.date.month,
              day: dateArray.date.day
            }
          }
        });

        /** Execite If Broker terminate */
        if (this.Broker.brokerExpiredOn) {
          this.FormGroup.patchValue({
            'broker_termination_date': this.changeDateFormatService.formatDatetoMonthName(this.Broker.brokerExpiredOn),
            'broker_termination_reason': this.Broker.terminateReason
          })
        }
      }
      /** Execite If Broker terminate */
    });
  }

  // On submission of Edit Broker Form
  onSubmitbrokerForm(FormGroup) {     // removing ngForm for production build
    this.submitted = true;
    if (this.FormGroup.valid) {
      let brokerData = {
        "brokerId": this.FormGroup.value.broker_id,
        "postalCd": this.FormGroup.value.postalCode,
        "cityName": this.FormGroup.value.city,
        "provinceName": this.FormGroup.value.province,
        "countryName": this.FormGroup.value.country,
        "brokerPhone": this.FormGroup.value.phone_no,
        "extension": this.FormGroup.value.extension,
        "brokerFax": this.FormGroup.value.fax_no,
        "brokerEmail": this.FormGroup.value.email,
        "brokerCreatedOn": "01/02/2018",
        "brokerUPdateOn": "01/02/2018",
        "brokerEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.effective_date),
        "brokerGstInd": 'T',
        "brokerName": this.FormGroup.value.broker_name,
        "brokerGstRegNum": this.FormGroup.value.gts_registration,
        "brokerAddress1": this.FormGroup.value.address1,
        "brokerAddress2": this.FormGroup.value.address2,
        "brokerSuspensionInd": this.FormGroup.value.brokerSuspensionInd == true ? 'T' : 'F',
        "optoutCompanyEmailInd": this.FormGroup.value.optoutCompanyEmailInd == true ? 'T' : 'F',
        "brokerMultiCommAgrInd": this.FormGroup.value.brokerMultiCommAgrInd == true ? 'T' : 'F'
      }

      if (this.editMode == false) { //Add New Broker

        if (this.commentFormData.commentjson != undefined) {
          var commentObject = [];
          for (let i in this.commentFormData.commentjson) {
            commentObject.push({
              'brokerCoTxt': this.commentFormData.commentjson[i].commentTxt,
              'commentImportance': this.commentFormData.commentjson[i].commentImportance,
              'department': this.commentFormData.commentjson[i].department,
              'username': this.commentFormData.commentjson[i].username,
              'userId': this.commentFormData.commentjson[i].userId,
              'createdOn': this.commentFormData.commentjson[i].createdOn,
              'userGroupKey': this.commentFormData.commentjson[i].userGroupKey
            });

          }
        }

        brokerData['comments'] = commentObject;

        this.hmsDataServiceService.post(BrokerApi.addBrokerUrl, brokerData).subscribe(data => {
          this.Broker = data['result'];
          this.editMode = true;
          this.FormGroup.disable();

          this.router.navigate(['/company/broker/edit', this.Broker.brokerKey]);
          this.toastrService.success(this.translate.instant('company.toaster.broker_saved')
          );
        });
      } else { //Update Broker

        let brokerData = {
          "brokerKey": this.Broker.brokerKey,
          "brokerId": this.Broker.brokerId,
          "postalCd": this.FormGroup.value.postalCode,
          "cityName": this.FormGroup.value.city,
          "provinceName": this.FormGroup.value.province,
          "countryName": this.FormGroup.value.country,
          "brokerPhone": this.FormGroup.value.phone_no,
          "extension": this.FormGroup.value.extension,
          "brokerFax": this.FormGroup.value.fax_no,
          "brokerEmail": this.FormGroup.value.email,
          "brokerUPdateOn": "01/02/2018",
          "brokerEffectiveOn": this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.effective_date),
          "brokerGstInd": "T",
          "brokerName": this.FormGroup.value.broker_name,
          "brokerGstRegNum": this.FormGroup.value.gts_registration,
          "brokerAddress1": this.FormGroup.value.address1,
          "brokerAddress2": this.FormGroup.value.address2,
          "brokerSuspensionInd": this.FormGroup.value.brokerSuspensionInd == true ? 'T' : 'F',
          "optoutCompanyEmailInd": this.FormGroup.value.optoutCompanyEmailInd == true ? 'T' : 'F',
          "brokerMultiCommAgrInd": this.FormGroup.value.brokerMultiCommAgrInd == true ? 'T' : 'F'
        }

        this.hmsDataServiceService.put(BrokerApi.addBrokerUrl, brokerData).subscribe(data => {
          this.viewMode = false;
          this.FormGroup.disable();
          this.onShowClearDateButton(false);
          if (data.code == 200) {
            this.toastrService.success(this.translate.instant('company.toaster.broker_updated'));
          }
          else {
            this.toastrService.error(this.translate.instant('company.toaster.somethingWentWrong'));
          }
        })
        this.Broker.brokerEffectiveOn = this.changeDateFormatService.convertDateObjectToString(this.FormGroup.value.effective_date)
      }

    } else {
      this.validateAllFormFields(this.FormGroup);
      //Get focus on Invalid field
      let target;
      target = $('input[type=text].ng-invalid').first();
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow', () => {
          target.focus();
        });
      }
    }
    // Any API call logic via services goes here
  }

  // On submission of Terminate Broker Form
  onSubmitTerminateBrokerForm(terminateBrokerForm) {
    let brokerKey;
    if (this.Broker.brokerExpiredOn) {
      // Reactivate Broker

      /**Old Param Commented As Per Arun Sir 9April2019 */
      /*  let brokerTerminateFormData = {
         "brokerKey": this.Broker.brokerKey
       } */
      /** New Params Same As For Terminate Broker & Same API */
      let currentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
      brokerKey = this.Broker.brokerKey;
      let brokerTerminateFormData = {
        "brokerKey": this.Broker.brokerKey,
        "termCatKey": '',
        "terminateDate": currentDate,
        "brokerTerminationHistoryOn": currentDate,
        "brokerTerminateFlag": 'A'
      }
      this.hmsDataServiceService.post(BrokerApi.brokerTerminateUrl, brokerTerminateFormData).subscribe(data => {
        this.findBrokerById(brokerKey);
      })
      this.toastrService.success(this.translate.instant('company.toaster.brokerReactivated')
      );

      $("#TerminateBroker .close").click();
      this.Broker.terminateDate = null;
      this.Broker.terminateReason = null;
      this.terminateDate = null
      this.BrokerTerminationDate = false;
      // redraw data table
      this.dataTableService.jqueryDataTableReload(this.TerminateDataTableId, this.TerminateDataTableUrl, this.TerminateDataTableReqParam);
      this.terminateBrokerForm.controls['termination_date'].enable();
      
    } else {
      // Terminate Broker
      if (this.terminateBrokerForm.valid) {
        brokerKey = this.Broker.brokerKey;
        let brokerTerminateFormData = {
          "brokerKey": this.Broker.brokerKey,
          "termCatKey": this.terminateBrokerForm.value.termination_reason,
          "terminateDate": this.changeDateFormatService.convertDateObjectToString(this.terminateBrokerForm.value.termination_date),
          "brokerTerminationHistoryOn": this.changeDateFormatService.convertDateObjectToString(this.terminateBrokerForm.value.termination_date),
          "brokerTerminateFlag": 'T'
        }

        if (this.brokerEffectiveDate.date && this.terminateBrokerForm.value.termination_date.date) {
          var errorVal = this.changeDateFormatService.compareBrokerEffectiveAndTerminationDate(this.brokerEffectiveDate.date, this.terminateBrokerForm.value.termination_date.date);
          if (errorVal.isError == true) {
            return;
          }
        }
        this.hmsDataServiceService.post(BrokerApi.brokerTerminateUrl, brokerTerminateFormData).subscribe(data => {          
          if (data.code == 200) {
            this.findBrokerById(brokerKey);
            this.toastrService.success(this.translate.instant('company.toaster.broker_terminated')
            );
            $("#TerminateBroker .close").trigger('click');
          }
          else if (data.code == 400 && data.hmsShortMessage == 'EXPIREDON_SHOULD_BE_GREATER_EFFECTIVEON') {
            this.toastrService.error(this.translate.instant('company.toaster.expiryDateGreaterThanEffective'));
            return false;
          }
          else {
            var errMessage = data.hmsShortMessage.split('_').join(' ');
            this.toastrService.error("ERROR : " + errMessage);
            return false;
          }
        })
        this.Broker.terminateDate = this.changeDateFormatService.convertDateObjectToString(this.terminateBrokerForm.value.termination_date);
        this.Broker.terminateReason = this.terminateBrokerForm.value.termination_reason;

        this.terminateDate = this.Broker.terminateDate;
        this.FormGroup.patchValue({
          'broker_termination_date': this.changeDateFormatService.formatDatetoMonthName(this.Broker.terminateDate),
        })

        var obj = this.TerminationReasonList;
        for (let index in obj) {
          if (obj[index].termCatKey == this.terminateBrokerForm.value.termination_reason) {
            this.FormGroup.patchValue({
              'broker_termination_reason': obj[index].termCatDesc
            });
          }
        }

        this.BrokerTerminationDate = true;


        // redraw data table

        this.dataTableService.jqueryDataTableReload(this.TerminateDataTableId, this.TerminateDataTableUrl, this.TerminateDataTableReqParam);
        this.findBrokerById(brokerKey);
      } else {
        this.validateAllFormFields(this.terminateBrokerForm);
        //Get focus on Invalid field
        let target;
        target = $('input[type=text].ng-invalid').first();
        if (target) {
          $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow', () => {
            target.focus();
          });
        }
      }
      
    }
  }

  brokerEffectiveDate;
  getBrokerTerminateHistory() {
    this.brokerEffectiveDate = this.changeDateFormatService.convertStringDateToObject(this.Broker.brokerEffectiveOn);

    this.TerminateDataTableReqParam = [
      { 'key': 'brokerKey', 'value': this.parentBrokerKey }
    ]
    this.dataTableService.jqueryDataTableReload(this.TerminateDataTableId, this.TerminateDataTableUrl, this.TerminateDataTableReqParam);
    if (this.Broker.terminateDate) {
      var dateArray = this.changeDateFormatService.convertStringDateToObject(this.Broker.terminateDate);
      this.terminateBrokerForm.patchValue({
        termination_date: {
          date: {
            year: dateArray.date.year,
            month: dateArray.date.month,
            day: dateArray.date.day
          }
        }
      });

      this.terminateBrokerForm.patchValue({
        'termination_reason': this.Broker.terminateReason
      });

    }

    if (this.BrokerTerminationDate == true) {
      this.terminateBrokerForm.controls['termination_date'].disable();
    }

    //-------  Focus ------   
    this.checkFocus = true;
    if (jQuery("#TerminateBroker").hasClass("fade")) {
      this.ObservableObj = Observable.interval(50).subscribe(x => {
        if (this.checkFocus) {
          let vm = this;
          $("#focusTerminationDateEl input:text").first().focus(function () {
            vm.checkFocus = false;
            vm.ObservableObj.unsubscribe();
          });

          $("#focusTerminationDateEl input:text").first().focus();

        } else {
        }
      });
    }

    $("#BtnTerminateBroker").trigger('click');
        // Below one is to show "select" in termination reason in termination form when nothing else is selected
        this.terminateBrokerForm.controls.termination_reason.reset()
    //---------- Focus-----------

  }

  /**
   * Call on submit broker bank account form
   * @param bankAccountsForm 
   */
  onSubmitBankAccountsForm(bankAccountsForm) {
    if (this.brokerBankAccountKey) {
      /** Expiry Date Check in Update Case */
      if (this.brokerBankAccountKey) {
        if (this.bankAccountsForm.value.expiry_date == '' || this.bankAccountsForm.value.expiry_date == null) {
          this.bankAccountsForm.controls['expiry_date'].setErrors({
            "required": true
          });
          this.bankFormEffectiveDateError = false;
        }
      }

      /** Expiry Date Check in Add Case */
      if (this.bankFormEffectiveDateError == true) {
        return;
      }

      if (this.bankAccountsForm.valid) {
        if (this.bankAccountsForm.value.expiry_date == '' || this.bankAccountsForm.value.expiry_date == null) {
          return;
        }
        var error = this.saveBankDetails();
        return;
      } else {
        this.validateAllFormFields(this.bankAccountsForm);
        //Get focus on Invalid field
        $('input[name=expiry_date]').focus();
      }
    } else {
      /**--------- Saving Bank Form ----------- */
      /** Expiry Date Check in Add Case */
      if (this.bankFormEffectiveDateError == true) {
        return;
      }

      if (this.bankAccountsForm.value.effective_date) {
        var brokerEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.Broker.brokerEffectiveOn);
        var effectiveError = this.changeDateFormatService.compareTwoDates(brokerEffectiveDt.date, this.bankAccountsForm.value.effective_date.date);

        if (effectiveError.isError == true) {
          this.exDialog.openMessage(this.translate.instant('company.exDialog.effectiveDateGreaterthanBroker'));
          return;
        }
      }

      if (this.bankAccountsForm.valid) {
        let brokerId = { brokerId: this.Broker.brokerId };
        var URL = BrokerApi.validateBrokerBankExpiredOnUrl;
        this.hmsDataServiceService.postApi(URL, brokerId).subscribe(data => {
          if (data.code == 200 && data.hmsShortMessage == "PREVIOUS_ACCOUNT_ACTIVE") {
            this.toastrService.error(this.translate.instant('company.toaster.PREVIOUS_ACCOUNT_ACTIVE'));
          } else if (data.code == 200 && data.hmsShortMessage == "PREVIOUS_ACCOUNT_EXPIRED") {
            this.saveBankDetails();
          } else if (data.code == 200 && data.hmsShortMessage == "NO_BANK_ASSIGNMENT_EXISTS") {
            this.saveBankDetails();
          }
        });

      } else {
        this.validateAllFormFields(this.bankAccountsForm);
        //Get focus on Invalid field
        $('input[name=bank_name]').focus();
      }
    }
  }

  /**
   * Save Broker Bank Details
   */
  saveBankDetails() {
    if (this.brokerBankAccountKey) {
      // Update Broker Bank Account Detail
      let brokerBankFormData = {
        "brokerBankAccKey": this.brokerBankAccountKey,
        "brokerId": this.Broker.brokerId,
        "expiredOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountsForm.value.expiry_date),
      }

      this.hmsDataServiceService.post(BrokerApi.addbrokerBankAccountUrl, brokerBankFormData).subscribe(data => {
        if (data.code == 200) {
          this.brokerBankAccountKey = '';
          this.dataTableService.jqueryDataTableReload(this.bankDataTableId, this.bankDataTableUrl, this.bankDataTableReqParam);
          this.bankAccountsForm.reset();
          this.toastrService.success(this.translate.instant('company.toaster.bankAccDetailsUpdated'));
          this.bankAccountsForm.reset();
          this.bankAccountsForm.enable();
          this.effective_date_for_expiry = null;
          this.buttonText = this.translate.instant('button.save');
        } else if (data.code == 200 && data.hmsShortMessage == "BROKER_BANK_ACCOUNT_ALREADY_EXIST") {
          this.toastrService.error(this.translate.instant('company.toaster.bankAccExist'));
          return false;
        } else if (data.code == 400 && data.hmsShortMessage == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
          this.toastrService.error(this.translate.instant('company.toaster.expiryDateGreaterThanCurrent'));
          return false;
        }

      });
    } else {
      // Add Broker Bank Account
      let brokerBankFormData = {
        "brokerId": this.Broker.brokerId,
        "brokerBankName": this.bankAccountsForm.value.bank_name,
        "brokerBankNum": this.bankAccountsForm.value.bank_number,
        "brokerBankBranchNum": this.bankAccountsForm.value.branch,
        "brokerBankAccNum": this.bankAccountsForm.value.account_number,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.bankAccountsForm.value.effective_date),
        "expiredOn": this.bankAccountsForm.value.expiry_date ? this.changeDateFormatService.convertDateObjectToString(this.bankAccountsForm.value.expiry_date) : '',
      }
      if (this.bankAccountsForm.value.effective_date && this.bankAccountsForm.value.expiry_date) {
        var errorVal = this.changeDateFormatService.compareTwoDates(this.bankAccountsForm.value.effective_date.date, this.bankAccountsForm.value.expiry_date.date);
        if (errorVal.isError == true) {
          return;
        }
      }

      this.hmsDataServiceService.post(BrokerApi.addbrokerBankAccountUrl, brokerBankFormData).subscribe(data => {
        if (data.code == 200) {
          this.dataTableService.jqueryDataTableReload(this.bankDataTableId, this.bankDataTableUrl, this.bankDataTableReqParam);
          this.effective_date_for_expiry = "";
          this.bankAccountsForm.reset();
          this.toastrService.success(this.translate.instant('company.toaster.bankAccDetailsSaved'));
        } else if (data.code == 400 && data.hmsShortMessage == "BROKER_BANK_ACCOUNT_ALREADY_EXIST") {
          this.toastrService.error(this.translate.instant('company.toaster.bankAccExist'));
        } else if (data.code == 400 && data.hmsShortMessage == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON") {
          this.toastrService.error(this.translate.instant('company.toaster.effectiveDateGreaterThanPreviousEffective'));
        } else if (data.code == 400 && data.hmsShortMessage == "EXPIREDON_SHOULD_BE_GREATER_NOW_DATE") {
          this.toastrService.error(this.translate.instant('company.toaster.expiryDateGreaterThanCurrent'));
          return;
        }
      });
    }
    this.dataTableService.jqueryDataTableReload(this.bankDataTableId, this.bankDataTableUrl, this.bankDataTableReqParam);
  }

  /**
   * Edit Broker Bank account form
   * @param bankKey 
   * @param rowData 
   */
  editBankAccount(bankKey, rowData) {
    this.bankFormEffectiveDateError = null;
    this.error2 = { isError: false, errorMessage: '' };
    this.brokerBankAccountKey = bankKey;
    this.bankAccountsForm.patchValue({
      // broker search -> Add Bank Account button -> on click of edit icon, form was showing irrespective values, Corrected
      'bank_name': rowData[2],
      'bank_number': rowData[0],
      'branch': rowData[1],
      'account_number': rowData[3],
    });

    var dateArray = this.changeDateFormatService.convertStringDateToObject(rowData[4]);
    this.bankAccountsForm.patchValue({
      effective_date: {
        date: {
          year: dateArray.date.year,
          month: dateArray.date.month,
          day: dateArray.date.day
        }
      }
    });

    this.effective_date_for_expiry = dateArray;

    if (rowData[5]) {
      var dateArray = this.changeDateFormatService.convertStringDateToObject(rowData[5]);
      this.bankAccountsForm.patchValue({
        expiry_date: {
          date: {
            year: dateArray.date.year,
            month: dateArray.date.month,
            day: dateArray.date.day
          }
        }
      });
    }

    this.bankAccountsForm.controls['bank_name'].disable();
    this.bankAccountsForm.controls['bank_number'].disable();
    this.bankAccountsForm.controls['branch'].disable();
    this.bankAccountsForm.controls['account_number'].disable();
    this.bankAccountsForm.controls['effective_date'].disable();
    this.buttonText = this.translate.instant('button.update');
    $('input[name=effective_date]').focus();
  }

  // Validating Forms on submit
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  // used for datepicker : https://www.npmjs.com/package/angular4-datepicker
  changeDateFormat(event, frmControlName, formName, currentDate) {
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };

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
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    } 
    
    else if (event.reason == 2 && (event.value == "" || event.value == null)) {
      /** Date if field not mandatory */
      obj = null
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
    }

    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
    if (event.reason == 2) {
      if (formName == 'FormGroup') {
        this.FormGroup.patchValue(datePickerValue);
        /* This function is used to compare two dates */
        if (this.FormGroup.value.effective_date && this.FormGroup.value.expiry_date) {
          this.error = this.changeDateFormatService.compareTwoDates(this.FormGroup.value.effective_date.date, this.FormGroup.value.expiry_date.date);
        }
      } else if (formName == 'terminateBrokerForm') {

        this.terminateBrokerForm.patchValue(datePickerValue);
        this.error1 = this.changeDateFormatService.compareBrokerEffectiveAndTerminationDate(this.brokerEffectiveDate.date, this.terminateBrokerForm.value.termination_date.date);

      } else if (formName == 'bankAccountsForm') {
        this.bankAccountsForm.patchValue(datePickerValue);

        if (this.effective_date_for_expiry) {
          /**  update case */
          if (this.bankAccountsForm.value.expiry_date) {
            this.bankFormEffectiveDateError = false;
            this.error2 = this.changeDateFormatService.compareTwoDates(this.effective_date_for_expiry.date, this.bankAccountsForm.value.expiry_date.date);
            if (this.error2.isError == true) {
              this.bankFormEffectiveDateError = true;
            }
          }
        } else {
          /**  Add case */
          if (this.bankAccountsForm.value.effective_date && this.bankAccountsForm.value.expiry_date) {
            this.bankFormEffectiveDateError = false;
            this.error2 = this.changeDateFormatService.compareTwoDates(this.bankAccountsForm.value.effective_date.date, this.bankAccountsForm.value.expiry_date.date);
            if (this.error2.isError == true) {
              this.bankFormEffectiveDateError = true;
            }
          }
        }

      }
    }
  
  }

  redirectNewUserPage() {
    this.router.navigate(['/broker/add']);
  }

  editUserPage(brokerID) {
    if (brokerID) {
      this.router.navigate(['/broker/edit', brokerID]);
    }
  }

  /**
   * Enable update broker
   */
  enableUpdateBroker() {
    this.FormGroup.enable();
    this.viewMode = true;
    this.FormGroup.controls['broker_termination_reason'].disable();
    this.FormGroup.controls['broker_termination_date'].disable();
    this.FormGroup.controls['broker_id'].disable();
    $('input[name=broker_name]').focus();
    this.onShowClearDateButton(true);
  }

  // Set focus on first input field
  showCommentModal() {
    if (this.editMode == true) {
      this.commentEditFormData.setCommentModalFocus();
    } else {
      this.commentFormData.setCommentModalFocus();
    }
  }

  // Validating broker Id
  validateBrokerId(event) {
    var activeBrokerId = '';
    if (this.Broker) {
      activeBrokerId = this.Broker.brokerId;
    }
    if (event.target.value != activeBrokerId) {
      let brokerId = { brokerId: event.target.value };
      var URL = BrokerApi.brokerIdValidationUrl;

      this.hmsDataServiceService.postApi(URL, brokerId).subscribe(data => {
        if (data.result == true) {
          this.FormGroup.controls['broker_id'].setErrors(
            {
              "brokerIdExist": true
            });
        }
      });
    }
  }

  // Finctions to autofill city, province and according to given postal code
  isBrokerContactPostalcodeValid(event) {
    if (event.target.value) {
      let postalNumber = { postalCd: event.target.value };
      var URL = BrokerApi.isCompanyPostalcodeValidUrl;
      var ProvinceVerifyURL = BrokerApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataServiceService.postApi(URL, postalNumber).subscribe(data => {
        switch (data.code) {
          case 404:
            this.FormGroup.controls['postalCode'].setErrors({
              "postalcodeNotFound": true
            });
            break;
          case 302:
            this.FormGroup.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            $('#broker_edit_broker_email').focus();
            break;
        }
      });
    }
  }

  isCompanyPostalVerifyValid(event, fieldName) {
    if (event.target.value) {
      let fieldParameter: object;
      let errorMessage: object;
      switch (fieldName) {
        case 'city':
          fieldParameter = {
            cityName: event.target.value,
            countryName: this.FormGroup.get('country').value,
            provinceName: this.FormGroup.get('province').value,
            postalCd: this.FormGroup.get('postalCode').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'country':
          fieldParameter = {
            cityName: this.FormGroup.get('city').value,
            countryName: event.target.value,
            provinceName: this.FormGroup.get('province').value,
            postalCd: this.FormGroup.get('postalCode').value,
          };
          errorMessage = { "countryValidate": true };
          break;
        case 'province':
          fieldParameter = {
            cityName: this.FormGroup.get('city').value,
            countryName: this.FormGroup.get('country').value,
            provinceName: event.target.value,
            postalCd: this.FormGroup.get('postalCode').value,
          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = BrokerApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataServiceService.post(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.FormGroup.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.FormGroup.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  /**
   * get Bank Accounts List
   */
  getBankAccount() {
    if (this.Broker.terminateDate) {
      var currentDate = this.changeDateFormatService.getToday();
      var brokerTerminateDt = this.changeDateFormatService.convertStringDateToObject(this.Broker.terminateDate);
      var terminateError = this.changeDateFormatService.compareTwoDates(currentDate.date, brokerTerminateDt.date);
      if (terminateError.isError == true) {
        this.exDialog.openMessage(this.translate.instant('company.exDialog.reactiveBrokerFirst'));
        return;
      }
    }

    this.bankDataTableReqParam = [
      { 'key': 'brokerKey', 'value': this.parentBrokerKey }
    ]
    this.banktableActions = [
      { 'name': 'view', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'showAction': this.addBrokerAuthCheck[0].editBankAccount },
    ]
    if (!$.fn.dataTable.isDataTable('#broker-bank-table')) {
      this.dataTableService.jqueryDataTable(this.bankDataTableId, this.bankDataTableUrl, 'full_numbers', this.brokerTableColumns, 5, true, false, 't', 'irp', undefined, [0, 'asc'], '', this.bankDataTableReqParam, this.banktableActions, 6, [4, 5], '', '', [1, 2, 3, 4, 5, 6])
    } else {
      this.dataTableService.jqueryDataTableReload(this.bankDataTableId, this.bankDataTableUrl, this.bankDataTableReqParam);
    }

    this.brokerBankAccountKey = '';
    this.bankAccountsForm.enable();
    this.error2 = { isError: false, errorMessage: '' };
    this.setElementFocus('trgFocusBankNameEl');
    //---------- Focus-----------
  }

  changeDateFormat1(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      this.dateNameArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
   
    else if(event.reason == 1 && event.value != null && event.value != ''){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
  }

  /**
   * Auto Generate the broker number
   */
  getBrokerAutoNumber() {
    var URL = BrokerApi.brokerAutoGenerateNumberUrl;
    this.hmsDataServiceService.get(URL).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.FormGroup.patchValue({ broker_id: data.result });
      }
    });
  }

  /**
   * Reset Broker Form
   */
  clearBrokerForm() {
    this.FormGroup.reset();
    this.getBrokerAutoNumber();
  }

  /**
   * Reset Broker Termination Form
   */
  resetTerminateBrokerForm() {
    this.error1 = "";
    this.terminateBrokerForm.reset();
  }

  /**
   * Reset Broker Comment Form
   */
  resetCommentForm() {
    if (this.editMode) {
      this.commentEditFormData.resetCommentForm();
    } else {
      this.commentFormData.resetSaveCommentForm();
    }
    // Below line added to make file field reset when close button clicked in broker comments. (04-01-2023) by Prabhat
    this.commentEditFormData.removeBrokerCommentsFile()
  }

  setSelectTitle(SelectkeyValue) {
    for (let i in this.TerminationReasonList) {
      if (SelectkeyValue == this.TerminationReasonList[i].termCatKey) {
        this.selectBoxTitle = this.TerminationReasonList[i].termCatDesc;
        return;
      }
    }
  }

  /** 
  * Set Focus on Element
  */
  setElementFocus(el) {
    var self = this
    setTimeout(() => {
      self[el].nativeElement.focus();
    }, 200);
  }

  canDeactivate() {
    if (!this.submitted && this.FormGroup.dirty) {
      if (confirm(this.translate.instant("common.pageChangeConfirmation"))) {
        if (this.currentUserService.newTabRouterLink != undefined && this.currentUserService.newTabRouterLink != '' && this.router.url != this.currentUserService.newTabRouterLink) {
          window.open(this.currentUserService.newTabRouterLink);
          this.currentUserService.setRouterLink('');
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  /*Get the Bank Name form Api added by Balwinder*/
  bankFields(event, event1) {
    var url = CommonApi.getBankDetailsUrl
    var bank = event.value
    var branch = event1.value
    let ReqData = {
      "bankNum": bank,
      "branchNum": branch
    }
    if (bank && branch != "") {
      this.hmsDataServiceService.postApi(url, ReqData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.bankAccountsForm.patchValue({
            'bank_name': (data.result[0].bankName).trim()
          })
        } else {
          this.bankAccountsForm.patchValue({
            'bank_name': ''
          })
        }
      })
    }
  }

  backToSearch() {
    this.currentUserService.isBrokerSearch = true
  }
}