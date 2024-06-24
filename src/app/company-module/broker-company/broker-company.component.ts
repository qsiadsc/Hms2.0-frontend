import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CompanyService } from '../company.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IMyDpOptions, IMyInputFocusBlur } from 'mydatepicker';
import { Constants, CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { BrokerApi } from './../broker-api';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { TranslateService } from '@ngx-translate/core';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { empty } from 'rxjs/observable/empty';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { Observable } from 'rxjs/Observable';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'; //  contain all metaData 

@Component({
  selector: 'app-broker-company',
  templateUrl: './broker-company.component.html',
  styleUrls: ['./broker-company.component.css'],
  providers: [CompanyService, ChangeDateFormatService,
    HmsDataServiceService,
    DatatableService,
    ToastrService,
    TranslateService,
    CurrentUserService
  ]
})
export class BrokerCompanyComponent implements OnInit {
  currentUser: any;
  expired: boolean=false;
  saveButtonClicked: boolean = false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload', 'T')
  }

  brokerCompanyAuthCheck = [{
    "updateBroker": "F",
    "saveUpdateBroker": "F",
    "addCompanyAssociated": "F",
    "addContact": "F",
    "saveContact": "F"
  }]

  selectedCompanyId: any;
  selectedCompanyKey: any;
  ObservableCompanyAssociatedObj;
  checkCompanyAssociated = true;
  ObservableContactObj;
  checkContact = true
  compAssc: boolean = true;
  contactTab: boolean;
  public companyData: RemoteData;

  @Input() parentBrokerKey: string;
  @Input() parentBroker;

  @ViewChild("focusUpdateCompanyBrokerEl") trgFocusUpdateCompanyBrokerEl: ElementRef;

  titleName;
  phoneMask = CustomValidators.phoneMaskV1; // add phone format to phone field
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  public dateFormatPlaceholder: string = 'dd/mmm/yyyy'; // change private to public for production-build

  brokerCompanyAssociatedTableId = "brokerCompanyAssociated";
  brokerCompanyAssociationListUrl;
  companyAssociatedDataTableReqParam;
  companyID

  public addCompanyAssociatedForm: FormGroup;
  public addContactForm: FormGroup;  // change private to public for production-build
  public updateBrokerForm: FormGroup; //Broker form is used for company broker
  private companyCommissionModel = {} // the model, ready to hold the emails

  /* Used to Display Error With Element */
  loaderPlaceHolder;
  docType;
  hasImage: boolean;
  imagePath;
  blobUrl;
  docName;
  brokerFormEffectiveDateError = false;
  error: any;
  error1: any;
  error2: any;
  errorCommission = {};
  errorCommissionMessage = "This field is required.";
  checkvalue: boolean = true;
  associatedCompanyObj = new Array();
  editRowId: any;
  brokerList = [];
  brokerCompanyKey;
  brokerCoAssgnKey;
  brokerId;
  brokerCompanyAssociatedColumns = [];
  brokerContactColumns = [];
  mainCompanyArray = []
  tableId = "brokerCompanyAssociated";
  isChecked:boolean=true;
  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private changeDateFormatService: ChangeDateFormatService,
    private hmsDataServiceService: HmsDataServiceService,
    private route: ActivatedRoute,
    private dataTableService: DatatableService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private exDialog: ExDialog,
    private completerService: CompleterService,
    private currentUserService: CurrentUserService,
  ) {
    /* Used to Display Error With Element */
    this.error = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error2 = { isError: false, errorMessage: '' };
  }

  toggle(val) {
    this.editRowId = val;
  }

  dataId;
  staticBrokerId;
  brokerCompanyIDs: any
  tableSelection = {};

  isAll = false;
  recordLength;
  input = '<input id="selectAll" type="checkbox">';

  ngOnInit() {
    // Add Broker Form Validations
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['ABR'].concat(this.currentUserService.authChecks['BRC'], this.currentUserService.authChecks['VBR'], this.currentUserService.authChecks['UBR'], this.currentUserService.authChecks['CON'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        let checkArray = this.currentUserService.authChecks['ABR'].concat(this.currentUserService.authChecks['BRC'], this.currentUserService.authChecks['VBR'], this.currentUserService.authChecks['UBR'], this.currentUserService.authChecks['CON'])
        this.currentUser = this.currentUserService.currentUser
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    }

    $(document).on('click', '#selectAll', function () {
     
      $(".individual").prop("checked", $(this).prop("checked"));
      $('.individual').click(function(){
      if ($(this).prop('checked')==false){ //issue_id 0179413
        $('#selectAll').prop("checked", false)
       }

      else{
        var checkStatus =true ;
      $('.individual').each(function(i, obj) {
       if ($(this).prop('checked')==false){
             checkStatus = false;
          }
     })
        if(checkStatus){
       $('#selectAll').prop("checked", true)
         }
    }
  });

    });

    $("input[type='text']").attr("autocomplete", "off");
    //Title Name in Add Contact
    this.titleName = Constants.titleName;
    // Get broker ID from URL
    this.dataId = this.route.snapshot.paramMap.get('id')

    this.getBrokers();
    this.getBrokerByKey();
    this.getPersonNamePrefix()

    var self = this

    // To be called on click of edit icon in company associated listing table
    $(document).on('click', '#brokerCompanyAssociated .edit-ico', function () {
      var id = $(this).data('id')
      self.editBrokerCompanyAssociated(id)
    })

    // To be called on click of delete icon in company associated listing table
    $(document).on('click', '#brokerCompanyAssociated .del-ico', function () {
      var id = $(this).data('id')
      self.deleteBrokerCompanyAssociated(id)
    })

    $(document).on('click', '#brokerContact .edit-ico', function () {
      var id = $(this).data('id')
      self.editBrokerCompanyContact(id)
    })

    $(document).on('click', '#brokerContact .del-ico', function () {
      var id = $(this).data('id')
      self.deleteBrokerCompanyContact(id)
    })

    // Add Company Associated Form Validations
    this.addCompanyAssociatedForm = new FormGroup({
      'company': new FormControl('', Validators.required),
      'effective_date': new FormControl('', Validators.required),
      'expired_date': new FormControl(''),
      'commision': new FormControl('', [Validators.required, CustomValidators.onlyDigitWithDecimal, CustomValidators.onlyThreeDigisAfterDecimal]),
      'company_effected': new FormControl('', Validators.required),
      'company_terminated': new FormControl(''),
    });

    // Add Contact Form Validations
    // prefix validation removed to make it non mendatory field.
    this.addContactForm = new FormGroup({
      'name_pre_fix': new FormControl(null),
      'first_name': new FormControl('', [Validators.required, CustomValidators.combinationAlphabets]),
      'last_name': new FormControl('', [CustomValidators.combinationAlphabets]),
      'fax_no': new FormControl(''),
      'phone_no': new FormControl(''),
      'extension': new FormControl('', [Validators.minLength(3), Validators.maxLength(5), CustomValidators.onlyNumbers]),
      'email': new FormControl('', [Validators.maxLength(50), CustomValidators.vaildEmail]),
      'main_contact': new FormControl(''),
      'effective_date': new FormControl('', Validators.required),
      'expiry_date': new FormControl(''),
      'optoutCompanyEmailInd': new FormControl(''),
    });

    // Update Broker Form Validations
    this.updateBrokerForm = new FormGroup({
      'broker_name': new FormControl(null, Validators.required),
      'effective_date': new FormControl('', Validators.required),
      'expired_date': new FormControl(''),
    });

    this.companyData = this.completerService.remote(
      null,
      "coName",
      "coName"
    );
    this.companyData.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
    this.companyData.urlFormater((term: any) => {
      return BrokerApi.brokerCompanyListUrl + '/' + this.parentBrokerKey + `/${term}`;
    });
    this.companyData.dataField('result');

    $(document).on('keydown', '#brokerCompanyAssociated .btnpickerenabled, #brokerContact .btnpickerenabled', function (event) {
      var tableId = $(this).closest('table').attr('id');
      self.filterSearchOnEnter(event, tableId);
    })

  }

  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.brokerCompanyAuthCheck = [{
        "updateBroker": 'T',
        "saveUpdateBroker": 'T',
        "addCompanyAssociated": 'T',
        "addContact": 'T',
        "saveContact": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.brokerCompanyAuthCheck = [{
        "updateBroker": authCheck['VBR129'],
        "saveUpdateBroker": authCheck['UBR131'],
        "addCompanyAssociated": authCheck['VBR130'],
        "addContact": authCheck['CON133'],
        "saveContact": authCheck['CON133'],
      }]
    }
    return this.brokerCompanyAuthCheck
  }

  personNamePrefix: any;
  personNamePrefixKey: any;
  personNamePrefixDesc: any;
  getPersonNamePrefix() {
    var getPersonNamePrefixUrl = BrokerApi.getPersonNamePrefixUrl
    this.hmsDataServiceService.getApi(getPersonNamePrefixUrl).subscribe(data => {
      this.personNamePrefix = data.result;
      this.personNamePrefixKey = data.result.personNamePrefixKey;
      this.personNamePrefixDesc = data.result.personNamePrefixDesc;
    });
  }

  dataTableInitialize() {
    // Company Associated List Datatable
    this.brokerCompanyAssociatedTableId = "brokerCompanyAssociated"
    this.brokerCompanyAssociationListUrl = BrokerApi.brokerCompanyAssociationListUrl
    var caAssocReqParam = [{ "key": "brokerKey", "value": this.dataId }]

    var brokerCompanyAssociatedTableActions = [
      { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil' },
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash' }
    ]

    // Company Associated Listing Table Columns and data
    this.ObservableCompanyAssociatedObj = Observable.interval(1000).subscribe(x => {

      if (this.checkCompanyAssociated = true) {
        if ('company.add-company-associated.company-#' == this.translate.instant('company.add-company-associated.company-#')) {
        } else {
          this.brokerCompanyAssociatedColumns = [
            { title: this.input, data: 'coKey' },
            { title: this.translate.instant('company.add-company-associated.company-#'), data: 'coId' },
            { title: this.translate.instant('company.add-company-associated.company-name'), data: 'coName' },
            { title: this.translate.instant('company.add-company-associated.commission'), data: 'brokerCoCommisionRate' },
            { title: this.translate.instant('company.add-company-associated.effective-date'), data: 'effectiveOn' },
            { title: this.translate.instant('company.add-company-associated.expiry-date'), data: 'expiredOn' },
            { title: this.translate.instant('company.add-company-associated.company-effected-on'), data: 'coEffectiveOn' },
            { title: this.translate.instant('company.add-company-associated.company-terminated-on'), data: 'coTerminatedOn' },
            { title: this.translate.instant('common.action'), data: 'brokerCoAssgnKey' }
          ]
          var dateCols = ['effectiveOn', 'expiredOn', 'coEffectiveOn', 'coTerminatedOn'];
          this.dataTableService.jqueryDataTable(this.brokerCompanyAssociatedTableId, this.brokerCompanyAssociationListUrl, 'full_numbers', this.brokerCompanyAssociatedColumns, 5,
            true, false, 'lt', 'irp', 0, [1, 'asc'], '',caAssocReqParam, brokerCompanyAssociatedTableActions, 8 , [4, 5, 6, 7], '', '', [2, 3, 4, 5, 6, 7,8])
          this.checkCompanyAssociated = false
          this.ObservableCompanyAssociatedObj.unsubscribe();
        }
      }
    });


    // Contact List Datatable
    var brokerContactTableId = "brokerContact"
    var brokerContactUrl = BrokerApi.brokerContactListUrl
    var companyReqParam = [{ "key": "brokerKey", "value": this.dataId }]

    var brokerContactTableActions = [
      { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil' },
      { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash' }
    ]

    this.ObservableContactObj = Observable.interval(.1000).subscribe(x => {
      if (this.checkContact = true) {
        if ('common.last-name' == this.translate.instant('common.last-name')) {
        }
        else {
          this.brokerContactColumns = [
            { title: this.translate.instant('common.last-name'), data: 'brokerContactLastName' },
            { title: this.translate.instant('common.first-name'), data: 'brokerContactFirstLastName' },
            { title: this.translate.instant('common.phone'), data: 'brokerContactPhone' },
            { title: this.translate.instant('common.email'), data: 'brokerContactEmail' },
            { title: this.translate.instant('common.effectivedate'), data: 'brokerContactEffectiveOn' },
            { title: this.translate.instant('common.expirydate'), data: 'brokerContactExpiredOn' },
            { title: this.translate.instant('common.webUserId'), data: 'webUserId' },
            { title: this.translate.instant('common.isPrimary'), data: 'brokerCompanyMainInd' },
            { title: this.translate.instant('common.action'), data: 'brokerContactKey' }
          ]
          var dateCols = ['brokerContactEffectiveOn', 'brokerContactExpiredOn']
          this.dataTableService.jqueryDataTable(brokerContactTableId, brokerContactUrl, 'full_numbers', this.brokerContactColumns, 5, true, false, 'lt', 'irp',
            undefined, [1, 'asc'], '', companyReqParam, brokerContactTableActions, 8, [4, 5], '', '', [1, 2, 3, 4, 5, 6, 7, 8])
          this.checkContact = false
          this.ObservableContactObj.unsubscribe();
        }
      }
    });
  }

  /**
   * Get Brokers List
   */
  getBrokers() {
    var api = BrokerApi.getAllBrokerUrl;
    var submitData = { 'brokerKey': this.parentBrokerKey }
    this.hmsDataServiceService.postApi(api, submitData).subscribe(data => {
      this.brokerList = data.result;
    });
  }

  /**
   * Get Broker details by broker id
   */
  getBrokerByKey() {
    var api = BrokerApi.getBrokerByKeyUrl + '/' + this.dataId;
    this.hmsDataServiceService.getApi(api).subscribe(data => {
      this.brokerId = data.result.brokerId;
    });
  }

  // On submission of Add Company Associated Form
  addCompanyAssociated(addCompanyAssociatedForm: NgForm) {
 
    if (this.addCompanyAssociatedForm.valid) {
      // Used to map data to add broker company associated
      let brokerData = {
        "coKey": this.selectedCompanyKey,
        "createdBy": "test",
        "effectiveBy": "test",
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(addCompanyAssociatedForm.value.effective_date),
        "expiredBy": "test",
        "expiredOn": this.changeDateFormatService.convertDateObjectToString(addCompanyAssociatedForm.value.expired_date),
        "brokerKey": this.dataId,
        "brokerCoCommisionRate": addCompanyAssociatedForm.value.commision
      }
      let brokerJson = Object.assign(brokerData);
      // Used to Add broker company associated
      var brokerCompanyAssociationURL = BrokerApi.brokerCompanyAssociationUrl;
      var brokerCompanyAssociationListUrl = BrokerApi.brokerCompanyAssociationListUrl;
      // Service call to Add company associated 
      this.hmsDataServiceService.postApi(brokerCompanyAssociationURL, brokerJson).subscribe(data => {
        let brokerCompanyAssociatedTableId = "brokerCompanyAssociated"
        let companyAssociatedDataTableReqParam = [{ "key": "brokerKey", "value": this.dataId }]
        this.dataTableService.jqueryDataTableReload(brokerCompanyAssociatedTableId, brokerCompanyAssociationListUrl, companyAssociatedDataTableReqParam)
        if (data.code == 200) {
          this.toastrService.success(this.translate.instant('company.toaster.company_associate_added'));
          $("#BrokerAddCompanyAssociates .close").trigger('click');
        }
        else { // mantis issue 0179404
          if (data.hmsShortMessage == "EFFECTIVE DATE_SHOULD_BE_GREATER_BROKER EFFECTIVE_DATE") {
            this.toastrService.error(this.translate.instant('company.toaster.effectiveDateGreaterThanBroker'));
          }
          else {
            this.toastrService.error(this.translate.instant("common.preErrorMsgText"));
          }
        }

      });
    }
    else {
      this.validateAllFormFields(this.addCompanyAssociatedForm);
    }
    // Any API call logic via services goes here
    $('#selectAll').prop("checked", false)  //Header stay checkbox issue
  }

  // On submit of Update Company Associated Form
  updateCompanyAssociated(addCompanyAssociatedForm: NgForm) {
    if (this.addCompanyAssociatedForm.valid) {
      // Used to map data to update broker company associated
      let brokerData = {
        "coKey": this.brokerCompanyKey,
        "effectiveBy": "test",
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(addCompanyAssociatedForm.value.effective_date),
        "expiredBy": "test",
        "expiredOn": this.changeDateFormatService.convertDateObjectToString(addCompanyAssociatedForm.value.expired_date),
        "brokerKey": this.dataId,
        "brokerCoAssgnKey": this.brokerCoAssgnKey,
        "brokerCoCommisionRate": addCompanyAssociatedForm.value.commision
      }
      let brokerJson = Object.assign(brokerData);
      // Used to Update broker company associated
      var brokerCompanyAssociationURL = BrokerApi.brokerCompanyAssociationUrl;
      let brokerCompanyAssociationListUrl = BrokerApi.brokerCompanyAssociationListUrl
      // Service call to Update company associated 
      this.hmsDataServiceService.postApi(brokerCompanyAssociationURL, brokerJson).subscribe(data => {
        let brokerCompanyAssociatedTableId = "brokerCompanyAssociated"
        let companyAssociatedDataTableReqParam = [{ "key": "brokerKey", "value": this.dataId }]
        this.dataTableService.jqueryDataTableReload(brokerCompanyAssociatedTableId, brokerCompanyAssociationListUrl, companyAssociatedDataTableReqParam)
        if (data.code == 200) {
          this.toastrService.success(this.translate.instant('company.toaster.company_associate_updated'));
          $("#BrokerAddCompanyAssociates .close").trigger('click');
        }
        else {
          var errMessage = data.hmsShortMessage.split('_').join(' '); // mantis issue 0179404
          this.toastrService.error(this.translate.instant("common.preErrorMsgText") );
        }
      });
    }
    else {
      this.validateAllFormFields(this.addCompanyAssociatedForm);
    }
  }

  addCoAssocMode = true;
  viewCoAssocMode = false;
  editCoAssocMode = false;

  // Used to switch between Add, Edit and View broker company associated screens
  addMode = true;
  viewMode = false;
  editMode = false;

  editCompanyAssData: any
  // This function is called on click of edit icon in company associated listing table
  editBrokerCompanyAssociated(id) {
    this.error2 = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error = { isError: false, errorMessage: '' };
    $("#companyAssociatedPopup").trigger('click');
    // Change the screen to view mode and disable form
    this.addCoAssocMode = false
    this.viewCoAssocMode = true
    this.editCoAssocMode = false
    this.addCompanyAssociatedForm.disable();

    // API URL to get company to be updated
    let editCompanyAssociatedUrl = BrokerApi.brokerCompanyEditUrl + '/' + id;
    // Service call to Get broker company associated by ID
    this.hmsDataServiceService.getApi(editCompanyAssociatedUrl).subscribe(data => {
      this.editCompanyAssData = data.result
      this.companyTerminated = this.editCompanyAssData.coTerminatedOn != "" ? this.editCompanyAssData.coTerminatedOn : ""
      this.companyEffective = this.editCompanyAssData.coEffectiveOn != "" ? this.editCompanyAssData.coEffectiveOn : ""
      this.brokerCompanyKey = this.editCompanyAssData.coKey;
      this.brokerCoAssgnKey = id
      // Map data to set in edit company associated form
      this.addCompanyAssociatedForm.setValue({
        'company': this.editCompanyAssData.coName,
        'effective_date': this.changeDateFormatService.convertStringDateToObject(this.editCompanyAssData.effectiveOn),
        'expired_date': this.editCompanyAssData.expiredOn != null ? this.changeDateFormatService.convertStringDateToObject(this.editCompanyAssData.expiredOn) : '',
        'commision': this.editCompanyAssData.brokerCoCommisionRate,
        // Added check and formatted date
        'company_effected': (this.editCompanyAssData.coEffectiveOn.length != 0) ? this.changeDateFormatService.changeDateByMonthName(this.editCompanyAssData.coEffectiveOn) : '',
        'company_terminated': (this.editCompanyAssData.coTerminatedOn.length != 0) ? this.changeDateFormatService.changeDateByMonthName(this.editCompanyAssData.coTerminatedOn) : '',
      });
    });
  }

  // called on click of delete icon in company associated listing table
  deleteBrokerCompanyAssociated(id) {
    let companyAssocData = {
      "brokerCoAssgnKey": id
    }
    let companyAssocJson = Object.assign(companyAssocData);
    // URL to delete company associated
    let deleteCompanyAssociatedUrl = BrokerApi.brokerCompanyDeleteUrl;
    // Service call to delete company associated
    this.exDialog.openConfirm(this.translate.instant('company.exDialog.deleteBrokerCompanyAssociation')).subscribe((value) => {
      if (value) {
        this.hmsDataServiceService.postApi(deleteCompanyAssociatedUrl, companyAssocJson).subscribe(data => {
          let brokerCompanyAssociatedTableId = "brokerCompanyAssociated"
          let brokerCompanyAssociationListUrl = BrokerApi.brokerCompanyAssociationListUrl
          let companyAssociatedDataTableReqParam = [{ "key": "brokerKey", "value": this.dataId }]
          this.dataTableService.jqueryDataTableReload(brokerCompanyAssociatedTableId, brokerCompanyAssociationListUrl, companyAssociatedDataTableReqParam)
          if (data.code == 200) {
            this.toastrService.success(this.translate.instant('company.toaster.company_associate_deleted'));
          }
        });
      }
    });
  }

  autoFillValues = []
  // This function is called when user selects a company ID from list of companies in select options in add/edit forms. Used to set values in other feilds corresponding to the selected company ID
  onSelectBrokerCompany(id) {
    this.addCompanyAssociatedForm.controls['company_effected'].disable();
    this.addCompanyAssociatedForm.controls['company_terminated'].disable();
    // Parameters passed to get company detail by company key
    let companyData = {
      "coKey": id
    }
    let companyJson = Object.assign(companyData);
    // URL to get company detail by company key
    let getCompanyDetailUrl = BrokerApi.getCompanyUrl;
    // Service call to get company detail by company key
    this.hmsDataServiceService.postApi(getCompanyDetailUrl, companyJson).subscribe(data => {
      // Map data to set in add/edit form
      const autoFillValues = {
        companyName: data.result.coName,
        company_effected: data.result.effectiveOn,
        company_terminated: data.result.terminatedOn
      };

      this.companyTerminated = data.result.terminatedOn != "" ? data.result.terminatedOn : "";
      this.companyEffective = data.result.effectiveOn != "" ? data.result.effectiveOn : "";
      // Set values to add/edit company associated form corresponding to company ID

      // to format the dates of autofill of Add Company Associated form
      // to avoid showing undefined when dates not available
      autoFillValues.company_effected = (autoFillValues.company_effected != undefined || null) ? this.changeDateFormatService.changeDateByMonthName(autoFillValues.company_effected) :''
      autoFillValues.company_terminated = (autoFillValues.company_terminated != undefined || null) ? this.changeDateFormatService.changeDateByMonthName(autoFillValues.company_terminated) :''
      this.addCompanyAssociatedForm.patchValue({
        company_effected: autoFillValues.company_effected,
        company_terminated: autoFillValues.company_terminated
      })
    });
  }

  // This function is called on click of Edit button when the form is in view mode. Used to switch form to Edit mode.
  enableCoAssEditMode($event) {
    this.addCoAssocMode = false
    this.viewCoAssocMode = false
    this.editCoAssocMode = true
    this.addCompanyAssociatedForm.controls['commision'].enable();
    this.addCompanyAssociatedForm.controls['effective_date'].enable();
    this.addCompanyAssociatedForm.controls['expired_date'].enable();
  }

  //FocusVariable
  checkFocus;
  ObservableObj;
  checkBrokerFocus;
  ObservableBrokerObj;
  // to Add Associated Company button. Used to switch form to Add mode.
  enableCoAssAddMode() {
    if (this.parentBroker) {
      if (this.parentBroker.brokerExpiredOn) {
        var currentDate = this.changeDateFormatService.getToday();
        var brokerTerminateDt = this.changeDateFormatService.convertStringDateToObject(this.parentBroker.brokerExpiredOn);
        var terminateError = this.changeDateFormatService.compareTwoDates(currentDate.date, brokerTerminateDt.date);

        if (terminateError.isError == true) {
          this.exDialog.openMessage(this.translate.instant('company.exDialog.reactiveBrokerFirst'));
          return;
        }
      }
    }
    //-------  Focus ------   
    this.checkFocus = true;
    if (jQuery("#BrokerAddCompanyAssociates").hasClass("fade")) {
      this.ObservableObj = Observable.interval(50).subscribe(x => {
        if (this.checkFocus) {
          let vm = this;
          jQuery("#autofocusCoAssocForm").focus(function () {
            vm.checkFocus = false;
            vm.ObservableObj.unsubscribe();
          });
          document.getElementById('autofocusCoAssocForm').focus();

        } else {
        }
      });
    }
    //---------- Focus-----------

    this.error2 = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error = { isError: false, errorMessage: '' };
    this.addCoAssocMode = true
    this.viewCoAssocMode = false
    this.editCoAssocMode = false
    this.addCompanyAssociatedForm.enable();

    // Parameters to be passed to get the list of all companies
    let getCompanyListParams = {
      "brokerKey": this.dataId
    }
    let getCompanyListJson = Object.assign(getCompanyListParams);
    $("#companyAssociatedPopup").trigger('click');
    var validDate = this.changeDateFormatService.getToday();
    this.addCompanyAssociatedForm.patchValue({
      'effective_date': validDate
    });
  }

  // On submission of Add Contact Form
  AddContactForm(addContactForm: NgForm) {
    // Task 576 boolean set to true so that button disables once save button clicked
    this.saveButtonClicked = true
    if (this.addContactForm.valid) {
      let brokerContactData = {
        "brokerPostalCode": addContactForm.value.postal_code,
        "languageKey": 1,
        "brokerContactCountry": addContactForm.value.country,
        "brokerContactCity": addContactForm.value.city,
        "brokerContactProvince": addContactForm.value.province,
        "brokerContactPhone": addContactForm.value.phone_no,
        "brokerContactFax": addContactForm.value.fax_no,
        "brokerContactPhoneExtn": addContactForm.value.extension,
        "brokerContactEmail": addContactForm.value.email,
        "brokerContactFirstLastName": addContactForm.value.first_name,
        "brokerContactLastName": addContactForm.value.last_name,
        "brokerId": this.brokerId,
        "brokerContactAddress1": addContactForm.value.address_1,
        "brokerContactAddress2": addContactForm.value.address_2,
        "brokerContactExpiredOn": this.changeDateFormatService.convertDateObjectToString(addContactForm.value.expiry_date),
        "brokerContactEffectiveOn": this.changeDateFormatService.convertDateObjectToString(addContactForm.value.effective_date),
        "brokerContactEffectiveBY": "twst",
        "personNamePrefixKey": addContactForm.value.name_pre_fix,
        "brokerKey": this.dataId,
        "brokerCompanyMainInd": addContactForm.value.main_contact != "" ? "T" : "F",
        "optoutCompanyEmailInd": addContactForm.value.optoutCompanyEmailInd != "" ? "T" : "F"
      }

      let brokerJson = Object.assign(brokerContactData);
      var brokerContactCompanyURL = BrokerApi.brokerContactCompanyUrl;

      this.hmsDataServiceService.postApi(brokerContactCompanyURL, brokerJson).subscribe(data => {
        let brokerContactTableId = "brokerContact"
        let brokerContactUrl = BrokerApi.brokerContactListUrl
        let brokerContactDataTableReqParam = [{ "key": "brokerKey", "value": this.dataId }]
        this.dataTableService.jqueryDataTableReload(brokerContactTableId, brokerContactUrl, brokerContactDataTableReqParam)
        if (data.code == 200) {
          this.toastrService.success(this.translate.instant('company.toaster.contact_added'));
          $("#BrokerAddContact .close").trigger('click');
        }
        else {
          // Task 528, to show correct error msg
          this.toastrService.error("Expiry Date Should Be Greater Than Effective Date!");
        }
      });
    }
    else {
      // Task 576, add code if there is some validation, save button stay enabled
      this.saveButtonClicked = false
      this.validateAllFormFields(this.addContactForm);
    }
    // Any API call logic via services goes here
  }

  /**
   * Update broker Contact Details
   * @param addContactForm 
   */
  UpdateContactForm(addContactForm: NgForm) {
    if (this.addContactForm.valid) {
      let brokerContactData = {
        "brokerContactKey": this.brokerContactKey,
        "brokerPostalCode": addContactForm.value.postal_code,
        "languageKey": 1,
        "brokerContactCity": addContactForm.value.city,
        "brokerContactProvince": addContactForm.value.province,
        "brokerContactCountry": addContactForm.value.country,
        "brokerContactPhone": addContactForm.value.phone_no,
        "brokerContactFax": addContactForm.value.fax_no,
        "brokerContactPhoneExtn": addContactForm.value.extension,
        "brokerContactEmail": addContactForm.value.email,
        "brokerContactFirstLastName": addContactForm.value.first_name,
        "brokerContactLastName": addContactForm.value.last_name,
        "brokerId": this.brokerId,
        "brokerContactAddress1": addContactForm.value.address_1,
        "brokerContactAddress2": addContactForm.value.address_2,
        "brokerContactExpiredOn": addContactForm.value.expiry_date != "" ? this.changeDateFormatService.convertDateObjectToString(addContactForm.value.expiry_date) : "",
        "brokerContactEffectiveOn": this.changeDateFormatService.convertDateObjectToString(addContactForm.value.effective_date),
        "brokerContactEffectiveBY": "twst",
        "personNamePrefixKey": addContactForm.value.name_pre_fix,
        "brokerKey": this.dataId,
        "brokerCompanyMainInd": addContactForm.value.main_contact != "" ? "T" : "F",
        "optoutCompanyEmailInd": addContactForm.value.optoutCompanyEmailInd != "" ? "T" : "F"
      }
      let brokerJson = Object.assign(brokerContactData);

      var brokerContactCompanyURL = BrokerApi.brokerContactCompanyUrl;

      this.hmsDataServiceService.postApi(brokerContactCompanyURL, brokerJson).subscribe(data => {
        let brokerContactTableId = "brokerContact"
        let brokerContactUrl = BrokerApi.brokerContactListUrl
        let brokerContactDataTableReqParam = [{ "key": "brokerKey", "value": this.dataId }]
        this.dataTableService.jqueryDataTableReload(brokerContactTableId, brokerContactUrl, brokerContactDataTableReqParam)
        if (data.code == 200) {
          this.toastrService.success(this.translate.instant('company.toaster.contact_updated'));
          $("#BrokerAddContact .close").trigger('click');
        }
        else {
          // Task 528, to show correct error msg 
          this.toastrService.error("Expiry Date Should Be Greater Than Effective Date!");
        }
      });
    }
    else {
      this.validateAllFormFields(this.addContactForm);
    }
    // Any API call logic via services goes here
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

  companyTerminated;
  companyEffective;
  changeDateFormat(event, frmControlName, formName, currentDate = false) {
   
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
      if (formName == 'addCompanyAssociatedForm') {
        this.addCompanyAssociatedForm.patchValue(datePickerValue);
        if (this.addCompanyAssociatedForm.value.effective_date && this.addCompanyAssociatedForm.value.expired_date) {
          this.error = this.changeDateFormatService.compareTwoDates(this.addCompanyAssociatedForm.value.effective_date.date, this.addCompanyAssociatedForm.value.expired_date.date);
        }
        var companyTerminatedDate = this.changeDateFormatService.convertStringDateToObject(this.companyTerminated);
        var companyEffectiveDate = this.changeDateFormatService.convertStringDateToObject(this.companyEffective);
        var associationEffectiveDate = this.addCompanyAssociatedForm.value.effective_date;
        if (companyTerminatedDate && associationEffectiveDate) {
          this.error1 = this.changeDateFormatService.compareEffectiveAndCoTerminatedDate(associationEffectiveDate.date, companyTerminatedDate.date);
          this.addCompanyAssociatedForm.patchValue(datePickerValue);
        }
        if (companyEffectiveDate && associationEffectiveDate) {
          this.error2 = this.changeDateFormatService.compareEffectiveAndCoEffectiveDate(companyEffectiveDate.date, associationEffectiveDate.date);
          this.addCompanyAssociatedForm.patchValue(datePickerValue);
        }
      } else if (formName == 'addContactForm') {
        this.addContactForm.patchValue(datePickerValue);

        //Compare Broker Effective Date With Contact Effective Date
        if (this.parentBroker.brokerEffectiveOn && this.addContactForm.value.effective_date) {
          var brokerEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.parentBroker.brokerEffectiveOn);
          var effectiveError = this.changeDateFormatService.compareTwoDates(brokerEffectiveDt.date, this.addContactForm.value.effective_date.date);

          if (effectiveError.isError == true) {
            // Condition added to avoid console error of undefined check of form name when ading contact in broker. (17-01-2024) Prabhat
            if (formName == "addContactForm") {
              this.addContactForm.controls[frmControlName].setErrors({
                  "brokerEffectiveDateLessNotValid": true
                });
            }
            else{
              self[formName].controls[frmControlName].setErrors({
                "brokerEffectiveDateLessNotValid": true
              });
            }
          }
        }
        /* This function is used to compare two dates */
        if (this.addContactForm.value.effective_date && this.addContactForm.value.expiry_date) {
          this.error = this.changeDateFormatService.compareTwoDates(this.addContactForm.value.effective_date.date, this.addContactForm.value.expiry_date.date);
        }
      } else if (formName == 'updateBrokerForm') {
        this.updateBrokerForm.patchValue(datePickerValue);

        // Compare Effective Date With Broker Effective Date 
        if (this.parentBroker.brokerEffectiveOn && this.updateBrokerForm.value.effective_date) {
          var brokerEffectiveDt = this.changeDateFormatService.convertStringDateToObject(this.parentBroker.brokerEffectiveOn);
          var effectiveError = this.changeDateFormatService.compareTwoDates(brokerEffectiveDt.date, this.updateBrokerForm.value.effective_date.date);

          if (effectiveError.isError == true) {
            self[formName].controls['effective_date'].setErrors({
              "brokerEffectiveDateLessNotValid": true
            });
          }
        }

        // Compare Effective Date With Expiry Date 
        if (this.updateBrokerForm.value.effective_date && this.updateBrokerForm.value.expired_date) {
          var expiryError = this.changeDateFormatService.compareTwoDates(this.updateBrokerForm.value.effective_date.date, this.updateBrokerForm.value.expired_date.date);
          if (expiryError.isError == true) {
            self[formName].controls['expired_date'].setErrors({
              "ExpiryDateNotValid": true
            });
          } else {
            // Error set to blank so that if date is valid, no error set on field
            self[formName].controls['expired_date'].setErrors();
          }
        }
      }
    }
  }

  changeDateFormat2(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      // Set Date Picker Value
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = obj;
      frmControlName.patchValue(datePickerValue);
    }
  }

  brokerContactKey;
  editBrokerCompanyContact(id) {
    this.error2 = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error = { isError: false, errorMessage: '' };
    $("#contactPopup").trigger('click');
    this.viewMode = true;
    this.addMode = false;
    this.editMode = false;
    this.addContactForm.disable();

    let editbrokerContactListURL = BrokerApi.editbrokerContactListUrl + '/' + id;

    this.hmsDataServiceService.getApi(editbrokerContactListURL).subscribe(data => {
      this.addContactForm.disable();
      this.brokerId = data.result.brokerId
      this.brokerContactKey = id
      this.addContactForm.patchValue({
        'name_pre_fix': data.result.personNamePrefixKey,
        'first_name': data.result.brokerContactFirstLastName,
        'last_name': data.result.brokerContactLastName,
        'fax_no': data.result.brokerContactFax != null ? data.result.brokerContactFax.trim() : data.result.brokerContactFax,
        'phone_no': data.result.brokerContactPhone != null ? data.result.brokerContactPhone.trim() : data.result.brokerContactPhone,
        'email': data.result.brokerContactEmail,
        'extension': data.result.brokerContactPhoneExtn != '' ? data.result.brokerContactPhoneExtn.trim() : '',
        'address_1': data.result.brokerContactAddress1,
        'address_2': data.result.brokerContactAddress2,
        'postal_code': data.result.brokerPostalCode,
        'city': data.result.brokerContactCity,
        'province': data.result.brokerContactProvince,
        'country': data.result.brokerContactCountry,
        'effective_date': data.result.brokerContactEffectiveOn != "" ? this.changeDateFormatService.convertStringDateToObject(data.result.brokerContactEffectiveOn) : "",
        "expiry_date": data.result.brokerContactExpiredOn != "" ? this.changeDateFormatService.convertStringDateToObject(data.result.brokerContactExpiredOn) : "",
        "main_contact": data.result.brokerCompanyMainInd != "F" ? true : false,
        "optoutCompanyEmailInd": data.result.optoutCompanyEmailInd != "F" ? true : false
      });
    });

  }

  deleteBrokerCompanyContact(id) {
    let deletebrokerContactListURL = BrokerApi.deletebrokerContactListUrl;
    let submitData = [{
      "brokerContactKey": id
    }]
    this.exDialog.openConfirm(this.translate.instant('company.exDialog.deleteBrokerContact')).subscribe((value) => {
      if (value) {
        this.hmsDataServiceService.postApi(BrokerApi.deletebrokerContactListUrl, submitData).subscribe(data => {
          let brokerContactTableId = "brokerContact"
          let brokerContactUrl = BrokerApi.brokerContactListUrl
          let brokerContactDataTableReqParam = [{ "key": "brokerKey", "value": this.dataId }]
          this.dataTableService.jqueryDataTableReload(brokerContactTableId, brokerContactUrl, brokerContactDataTableReqParam)
          if (data.code == 200) {
            this.toastrService.success(this.translate.instant('company.toaster.contact_deleted'));
          } else if(data.code == 401 && data.status == "UNAUTHORIZED"){
            this.toastrService.error("Broker contact is linked with Web Account")
          }
        });
      }
    });

  }
  //this function is called on click of edit button
  enableCompanyEditMode($event) {
    this.addMode = false
    this.viewMode = false
    this.editMode = true
    this.addContactForm.enable();
  }

  enableCompanyAddMode() {
    // Task 576 to enable save button when pop up opens
    this.saveButtonClicked = false
    if (this.parentBroker) {
      if (this.parentBroker.brokerExpiredOn) {
        var currentDate = this.changeDateFormatService.getToday();
        var brokerTerminateDt = this.changeDateFormatService.convertStringDateToObject(this.parentBroker.brokerExpiredOn);
        var terminateError = this.changeDateFormatService.compareTwoDates(currentDate.date, brokerTerminateDt.date);

        if (terminateError.isError == true) {
          this.exDialog.openMessage(this.translate.instant('company.exDialog.reactiveBrokerFirst'));
          return;
        }
      }
    }

    this.addMode = true
    this.viewMode = false
    this.editMode = false
    this.error2 = { isError: false, errorMessage: '' };
    this.error1 = { isError: false, errorMessage: '' };
    this.error = { isError: false, errorMessage: '' };
    this.addContactForm.enable();

    //-------  Focus ------   
    this.checkFocus = true;
    if (jQuery("#BrokerAddContact").hasClass("fade")) {
      this.ObservableObj = Observable.interval(50).subscribe(x => {
        if (this.checkFocus) {
          let vm = this;
          $("#autofocusContactForm").focus(function () {
            vm.checkFocus = false;
            vm.ObservableObj.unsubscribe();
          });
          document.getElementById('autofocusContactForm').focus();

        } else {
        }
      });
    }
    //---------- Focus-----------
    $("#BrokerAddContactBtn").trigger('click');
  }

  // On submission of Terminate Broker Form
  onSubmitUpdateCompanyBrokerForm(updateBrokerForm) {
    /** Expiry Date Check */
    if (this.brokerFormEffectiveDateError == true) {
      return;
    }

    /** Commission field check */
    this.errorCommission = {};
    if ((this.updateBrokerForm.valid)) {
      var foundFlag = false;
      for (var i = 0; i < this.associatedCompanyObj.length; i++) {
        if (this.associatedCompanyObj[i].commission == "") {
          this.errorCommission[this.associatedCompanyObj[i].id] = true;
          foundFlag = true;
        }
      }
      if (foundFlag == true) {
        return;
      }
      var expired_Date = this.changeDateFormatService.convertDateObjectToString(this.updateBrokerForm.value.expired_date)
      var effective_date = this.changeDateFormatService.convertDateObjectToString(this.updateBrokerForm.value.effective_date)
      var companyData = new Array();
      for (var i = 0; i < this.associatedCompanyObj.length; i++) {
        companyData.push(
          {
            "coKey": this.associatedCompanyObj[i].id,
            "brokerCoCommisionRate": this.associatedCompanyObj[i].commission
          }
        );
      }
      let companyBrokerData = {
        "brokerKey": this.dataId, // we are saving broker key hare Broker_name is a form field 
        "updatedbrokerKey": this.updateBrokerForm.value.broker_name,
        "brokerEffectiveOn": effective_date,
        "brokerExpiredOn": expired_Date,
        "brokerCompanyAssignmentDtoList": companyData
      }

      this.hmsDataServiceService.postApi(BrokerApi.updateCompanyBrokerUrl, companyBrokerData).subscribe(data => {
        $("#UpdateBroker .close").trigger('click');
        this.companyAssociatedDataTableReqParam = [{ "key": "brokerKey", "value": this.dataId }]
        this.dataTableService.jqueryDataTableReload(this.brokerCompanyAssociatedTableId, this.brokerCompanyAssociationListUrl, this.companyAssociatedDataTableReqParam)
        this.toastrService.success(this.translate.instant('company.toaster.broker_updated'));
      })

    } else {
      this.validateAllFormFields(this.updateBrokerForm);

      for (var i = 0; i < this.associatedCompanyObj.length; i++) {
        if (this.associatedCompanyObj[i].commission == "") {
          this.errorCommission[this.associatedCompanyObj[i].id] = true;
        }
      }
    }
    // Any API call logic via services goes here
    $('#selectAll').prop("checked", false)  //Header stay checkbox issue fixed (point no - 60)
  }

  editRow(companyId, companyids) {
  };

  selectAllRows() {
    //check if all selected or not
    if (this.isAll === false) {
      //set all row selected
      for (let index in this.associatedCompanyObj) {
        this.tableSelection[index] = true;
      }

      this.isAll = true;
    } else {
      //set all row unselected
      for (let index in this.associatedCompanyObj) {
        this.tableSelection[index] = false;
      }
      this.isAll = false;
    }
  }

  getSelectedCompanyList() {
    if (this.parentBroker) {
      if (this.parentBroker.brokerExpiredOn) {
        var currentDate = this.changeDateFormatService.getToday();
        var brokerTerminateDt = this.changeDateFormatService.convertStringDateToObject(this.parentBroker.brokerExpiredOn);
        var terminateError = this.changeDateFormatService.compareTwoDates(currentDate.date, brokerTerminateDt.date);

        if (terminateError.isError == true) {
          this.exDialog.openMessage(this.translate.instant('company.exDialog.reactiveBrokerFirst'));
          return;
        }
      }
    }

    // Destroy Associated Company Object
    this.emptyAssociatedCompanyObj();

    var self = this

    $("#brokerCompanyAssociated").find('tr').find('td').find('input[type=checkbox]').each(function () {
      if ($(this).is(':checked')) {
        self.createAssociatedCompanyObj($(this).val(), $(this).parent('td').next('td').next('td').text());
        
      }
    });

    if (this.associatedCompanyObj.length > 0) {
      $('#UpdateBrokerBtn').trigger('click');
      this.setElementFocus('trgFocusUpdateCompanyBrokerEl');

    } else {
      this.toastrService.warning(this.translate.instant('company.exDialog.selectOneCompany', 'Alert!'));
    }
  }

  createAssociatedCompanyObj(companyId, companyName) {
    this.associatedCompanyObj.push(
      {
        "id": companyId,
        "company_name": companyName,
        "commission": ''
      }
    );
  }

  emptyAssociatedCompanyObj() {
    var datalength = this.associatedCompanyObj.length;
    for (var i = 0; i < datalength; i++) {
      this.associatedCompanyObj.pop();
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
            this.addContactForm.controls['postal_code'].setErrors({
              "postalcodeNotFound": true
            });
            break;
          case 302:
            this.addContactForm.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            $('#effective_date .selection').focus();
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
            countryName: this.addContactForm.get('country').value,
            provinceName: this.addContactForm.get('province').value,
          };
          errorMessage = { "cityValidate": true };
          break;
        case 'country':
          fieldParameter = {
            cityName: this.addContactForm.get('city').value,
            countryName: event.target.value,
            provinceName: this.addContactForm.get('province').value,

          };
          errorMessage = { "countryValidate": true };
          break;
        case 'province':
          fieldParameter = {
            cityName: this.addContactForm.get('city').value,
            countryName: this.addContactForm.get('country').value,
            provinceName: event.target.value,

          };
          errorMessage = { "provinceValidate": true };
          break;
      }
      var ProvinceVerifyURL = BrokerApi.isCompanyCityProvinceCountryValidUrl;

      this.hmsDataServiceService.postApi(ProvinceVerifyURL, fieldParameter).subscribe(data => {
        switch (data.code) {
          case 404:
            this.addContactForm.controls[fieldName].setErrors(errorMessage);
            break;
          case 302:
            this.addContactForm.patchValue({
              'city': data.result.cityName,
              'country': data.result.countryName,
              'province': data.result.provinceName
            });
            break;
        }
      });
    }
  }

  // This function is used to filter records from Broker Company Associated Datatable
  filterCompanyAssociatedSearch() {
    
    var params = this.dataTableService.getFooterParams("brokerCompanyAssociated")
    var companyID = { "key": "brokerKey", "value": this.dataId }
    params[7] = companyID
    var brokerCompanyAssociationListUrl = BrokerApi.brokerCompanyAssociationFilter
    var dateParams = [4, 5];
    this.dataTableService.jqueryDataTableReload("brokerCompanyAssociated", brokerCompanyAssociationListUrl, params, dateParams)
    $('#selectAll').prop("checked", false)  //Header stay checkbox issue are fixed
  }

  // This function is used to filter records from Broker Contact Datatable
  filterContactSearch() {
    var params = this.dataTableService.getFooterParams("brokerContact")
    var companyID = { "key": "brokerKey", "value": this.dataId }
    params[6] = companyID
    var brokerContactUrl = BrokerApi.brokerContactFilter
    var dateParams = [4, 5];
    this.dataTableService.jqueryDataTableReload("brokerContact", brokerContactUrl, params, dateParams)
  }

  // This function is used to reset filter
  resetTableSearch(val) {
    this.dataTableService.resetTableSearch();
    if (val == "brokerCompanyAssociated") {
      this.filterCompanyAssociatedSearch();
      $('#brokerCompanyAssociated .icon-mydpremove').trigger('click');
    }
    if (val == "brokerContact") {
      this.filterContactSearch();
      $('#brokerContact .icon-mydpremove').trigger('click');
    }
  }

  // used to check entered value is alphbate or numeric. If entered value is numeric then it will accept otherwise ignore.
  validateOnlyNumbers(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
    }

    var val = theEvent.target.value + key
    if (val > 0 && val < 100) {
    } else {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
    }
  }

  dateNameArray = {};
  changeFilterDateFormat(event, frmControlName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (obj) {
        this.dateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
      }
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    
    else if (event.reason == 1 && event.value != null && event.value != ''){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
     }
   
   
  }

  resetForm(formName) {
    // Tsk 576 to enable save button whenever form reset
    this.saveButtonClicked = false
    if (formName == "addCompanyAssociatedForm") {
      this.addCompanyAssociatedForm.reset()
    }
    else if (formName == "addContactForm") {
      this.addContactForm.reset();
    }
    else if (formName == "updateBrokerForm") {

      this.errorCommission = {};
      this.updateBrokerForm.reset()
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

  onSubmitUpdateBrokerForm(updateBrokerForm) { }

  public isOpen: boolean = false;

  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  onCompanySelected(selected: CompleterItem) {
    if (selected) {
      this.selectedCompanyKey = (selected.originalObject.coKey).toString();
      this.selectedCompanyId = selected.originalObject.coId;
      if (this.selectedCompanyKey) {
        this.onSelectBrokerCompany(this.selectedCompanyKey);
      }
    }
  }

  abc() {
    if (this.selectedCompanyKey) {
    } else {
    }
  }

  /**
   * filter the search on press enter
   * @param event 
   * @param tableId 
   */
  filterSearchOnEnter(event, tableId: string) {
    if (event.keyCode == 13) {
      event.preventDefault();
      if (tableId == "brokerCompanyAssociated") {
        this.filterCompanyAssociatedSearch();
      }
      if (tableId == "brokerContact") {
        this.filterContactSearch();
      }
    }
  }

  exportBrokerCompanyAssociationlist() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    var params = this.dataTableService.getFooterParams("brokerCompanyAssociated")
    var fileName = "Broker-CompanyAssociated-List"
    this.recordLength = this.dataTableService.totalRecords
    let reqParamPlan =
    {
      "start": 0,
      "length": this.recordLength,
      "brokerKey": +this.dataId,
      "companyId": params[0].value,
      "companyName": params[1].value,
      "brokerCoComissionRate": params[2].value,
      "effectiveOn": params[3].value,
      "expiredOn": params[4].value,
      "coEffectiveOn": params[5].value,
      "coTerminateOn": params[6].value,
      'paramApplication': paramApp
    }
    var URL = BrokerApi.exportBrokerCompanyAssociationlistUrl;
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFile(URL, reqParamPlan, fileName)
          } else {
            this.exportFile(URL, reqParamPlan, fileName)
          }
        }
      });
    } else {
      this.exportFile(URL, reqParamPlan, fileName)
    }
  }
  exportBrokerContactListing() {
    var paramApp = this.currentUserService.getApplicationNameByRoleKey(+this.currentUserService.applicationRoleKey);
    var params = this.dataTableService.getFooterParams("brokerContact")
    var fileName = "Broker-Contact-Listing"
    this.recordLength = this.dataTableService.totalRecords
    let reqParamPlan =
    {
      "start": 0,
      "length": this.recordLength,    
      "lastName": params[0].value,   
      "firstName": params[1].value,  //  index are set on all search field and then commented some search field (cityname, countryName, provinceName)
      // "cityName": params[0].value,
      // "provinceName": params[0].value,
      // "countryName": params[0].value,
      "phone": params[2].value,
      "email": params[3].value,
      "effectiveOn": params[4].value,
      "expiredOn": params[5].value,
      "coKey": this.brokerCompanyKey,
      "brokerKey": this.dataId,
      'paramApplication': paramApp
    }
    var URL = BrokerApi.exportBrokerContactListingUrl;
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    var dialogMsg;
    if (this.recordLength > this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMaxMsg');
    }
    else if (this.recordLength > this.currentUserService.minLengthForExcel && this.recordLength <= this.currentUserService.maxLengthForExcel) {
      dialogMsg = this.translate.instant('common.greaterThanMinAndLessThanMaxMsg')
    }
    if (this.recordLength > this.currentUserService.minLengthForExcel) {
      this.exDialog.openConfirm(dialogMsg).subscribe((value) => {
        if (value) {
          if (this.recordLength > this.currentUserService.maxLengthForExcel) {
            this.recordLength = this.currentUserService.maxLengthForExcel
            this.exportFile(URL, reqParamPlan, fileName)
          } else {
            this.exportFile(URL, reqParamPlan, fileName)
          }
        }
      });
    } else {
      this.exportFile(URL, reqParamPlan, fileName)
    }
  }
  CompanyAssc() {
    // to correct Export button enable/disable functionality
    this.filterCompanyAssociatedSearch()
    this.compAssc = true;
    this.contactTab = false
  }
  Contact() {
    // to correct Export button enable/disable functionality
    this.filterContactSearch();
    this.compAssc = false;
    this.contactTab = true
  }

  exportFile(URL, reqParamPlan, fileName) {
    this.loaderPlaceHolder = "Loading File....."
    this.hasImage = true
    this.imagePath = []
    this.docName = ""
    this.docType = ""
    this.hmsDataServiceService.postApi(URL, reqParamPlan).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.loaderPlaceHolder = ""
        let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        let imagePath = data.result
        if (data.hmsMessage.messageShort != 'EXCEL_REPORT_INPROGRESS') {
          this.loaderPlaceHolder = ""
          let docType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          let imagePath = data.result
          var blob = this.hmsDataServiceService.b64toBlob(imagePath, docType);
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          let todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
          a.download = fileName + todayDate;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
        }
      } else {
      }
    })
  }
  focusNextEle(event,id){
    $('#'+id).focus(); 
  }
}
