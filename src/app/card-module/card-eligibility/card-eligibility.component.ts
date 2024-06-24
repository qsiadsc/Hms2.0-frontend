import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CardEligibility } from './cardeligibility';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { CardServiceService } from '../card-service.service';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi } from '../card-api'
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { QueryList, ViewChildren } from '@angular/core';
import { Subject, Subscription } from 'rxjs/Rx';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'card-eligibility-form',
  templateUrl: './card-eligibility.component.html',
  styleUrls: ['./card-eligibility.component.css'],
  providers: [ChangeDateFormatService, HmsDataServiceService, DatatableService, TranslateService]
})

export class CardEligibilityComponent implements OnInit {
  showHistoryEditIcon: boolean = false;
  cardEffectiveOnDate: any;
  FormGroup: FormGroup;
  disableBtn: boolean;
  cardStatusValue: any;
  currentUser: any;
  planTooltip: any;
  expired:boolean;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  GridTitle: string = "Card Maximums";
  @Output() emitOnSave: EventEmitter<any> = new EventEmitter<any>();
  maximumType: string = "Benifit";
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  columns
  dateNameArray = {}
  OverrideData = {}
  saveArray = []
  savedCardNumber;
  buttonText: string = this.translate.instant('card.button-save');
  public plans = [];
  public CardEligibilityPopupForm: FormGroup;
  private CardOverridesPopupForm: FormGroup;
  private CardOverridesMaxPopupForm: FormGroup;
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  editEligibilityFormFlag = false; 
  savedUnitKey; 
  benifitsDateNameArray = {}
  router;
  companyCoKey;
  cardMaximumArray;
  divisonKey;
  overridesGI = { cardId: '1234567899', employeePin: '12345', cardHolder: 'Test User' };  
  extraBenefitsGI = { cardId: '1234567899', employeePin: '12345' }; 
  coverageMaximumsGI = { cardId: '1234567899', employeePin: '12345' }; 
  error: any; 
  editUniqueKey = 0;
  PlanKey;
  setEffectiveDate: boolean = false
  @Input() CardEligibilityFormGroup: FormGroup;
  @Input() cardElgbEditMode: boolean;
  @Input() cardElgbViewMode: boolean;
  @Input() userAuthCheck: any
  @Input() expCheck;
  private CardEligibilityInfo: CardEligibility; 
  savedCardKey; 
  savedcompanyCoKey; 
  eligibilityHistoryTableID
  eligibilityHistorytableActions
  eligibilityHistoryColumns
  eligibilityHistorytableData
  eligibilityHistorytableKeys
  eligibilityHistoryTableHeading
  eligibilityPlan;
  effectiveDate;
  expiryDate;

  covrageMaximumTableID
  coverageMaximumtableActions
  coverageMaximumColumns
  coverageMaximumtableData
  coverageMaximumtableKeys
  coverageMaximumTableHeading

  tableColumns
  tableData
  extraBenifitsTableID
  elibigilityTableKeys
  elibigilityTableActions
  eligibilityEditMode: boolean = false

  eligibilityHistorySaveUrl;
  apiRequestType;
  cardEffectiveDate;

  CardEligibilityVal = {
    plan: ['', [Validators.required]],
    max_type: ['',],
    effective_date: ['', [Validators.required]],
    expiry_date: [''],
  }
  editExtraBenfit: boolean = false;
  extraBenifitsButton: boolean = true;
  bussinessType: any;

  cardholderFirstName: any;
  cardholderLastName: any;
  cardholderDetails: any;
  disciplineKey: any;
  cardHolderMaximum:boolean = false;
  cardExpiry: Subscription;
  cardEffDate: Subscription;
  cardStatusSub: Subscription;
  prefLang: Subscription;
  compChange: Subscription;
  compCoKey: Subscription;

  constructor(
    private changeDateFormatService: ChangeDateFormatService,
    public cardService: CardServiceService,
    private hmsDataServiceService: HmsDataServiceService,
    private datatableService: DatatableService,
    private currentUserService: CurrentUserService,
    private route: ActivatedRoute,
    private exDialog: ExDialog,
    private toastrService: ToastrService,
    private translate: TranslateService
  ) {
    
    if (this.route.snapshot.url[0]) {
      if (this.route.snapshot.url[0].path == "view") {

        this.plans=[{"unitKey":"","plansName":"Loading.."}]
      }
    }
    
    this.error = { isError: false, errorMessage: '' };
    this.compCoKey = cardService.getCompanyCoKey.subscribe((value) => {
      this.companyCoKey = value
      this.getPlanByCompanyCokey(value)
    });

    this.prefLang = cardService.getPrefferedLanguage.subscribe((value) => {
      if (this.route.snapshot.url[0]) {
        if (this.route.snapshot.url[0].path == "view") {
          this.editEligibilityFormFlag = true
          this.savedUnitKey = value.unitKey
          this.savedCardNumber = value.cardNumber
          this.savedCardKey = value.cardKery
          this.savedcompanyCoKey = value.companyCoKey
          this.bussinessType = value.businessTypeKey
          this.PlanKey = value.PlanKey
          this.divisonKey = value.divisonKey
          this.getPlanByCompanyCokey(value.companyCoKey)
          if(this.bussinessType ==2){
            this.extraBenifitsButton = false;
            this.showHistoryEditIcon = true;
          }
          else{
            this.showHistoryEditIcon = false;
          }
        }
      }
    })

    this.compChange = cardService.setCompanyChangeEvent.subscribe((value) => {
      if (value == false) {
        this.CardEligibilityFormGroup.controls['plan'].reset();
      }
    });

    this.prefLang = cardService.getPrefferedLanguage.subscribe((value) => {
      this.cardEffectiveDate = value.CardEffectiveDate;
    })

    this.cardStatusSub = cardService.cardStatus.subscribe((value) => {
      this.cardStatusValue = value
      if (this.cardStatusValue == 'Inactive') {
        this.disableBtn = true
      }
      else {
        this.disableBtn = false
      }
    })

    this.cardEffDate = cardService.cardEffectiveOnDate.subscribe((value) => {
      this.cardEffectiveOnDate = value
    })

    this.cardExpiry = this.cardService.cardExpiry.subscribe(expCheck=>{
      this.expired=expCheck
    })
  }

  ngOnInit() {
   this.expired;
    var self = this
    this.getEligibilityHistory()
    this.getMaximumHistory()
    this.extraBenifitsHistory()

    this.dtOptions['eligibility-history-table'] = { dom: 'ltirp', pageLength: 5, "ordering": false, lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]] }
    this.dtTrigger['eligibility-history-table'] = new Subject();

    this.getOverrideForm()
    this.updateTable()

    $(document).on('click', "#eligibility-history .edit_row", function (e) {
      e.preventDefault()
      var dad = $(this).closest('tr');
      dad.find('label').hide();
      dad.find('.editableInput').show();
      $(this).hide();
      $(this).next('a.save_row').show();
      self.eligibilityEditMode = true
      if (dad.find('.editableInput').is(':checked')) {
        self.editExtraBenfit = true
        dad.find('input[type="checkbox"]').prop('disabled', true)
      }
    });

    $(document).on('change', '.changeCheck', function () {
      var elem = $(this).closest('tr').find('.editableInput').last()
      if (!$(this).is(':checked') && self.eligibilityEditMode) {
        elem.addClass('required')
        var elemId = $(elem).attr('id')
        self.benifitsDateNameArray[elemId] = ''
      } else {
        elem.removeClass('required')
      }
    })

    $(document).on('click', "#eligibility-history .save_row", function (e) {
      var labelVal = ""
      e.preventDefault()
      var addFilled = true
      var dad = $(this).closest('tr');
      dad.find(".editableInput").each(function () {
        var elem
        if ($(this).data('type') == "date") {
          var id = $(this).attr('id')
          elem = $("#" + id).find("input")
          var val = $("#" + id).find("input").val().toString()
        } else {
          elem = $(this)
          if ($(this).attr('type') == "checkbox") {
            if (!$(this).is(':checked')) {
              $(this).addClass('required')
              val = ""
            } else {
              $(this).removeClass('required')
              val = "T"
            }
          } else {
            val = $(this).val().toString()
          }
          self.editExtraBenfit = false
        }
        if ((val == "") && ($(this).hasClass('required'))) {
          addFilled = false
          $(elem).addClass("error_field")
        } else {
          $(this).removeClass("error_field")
          if ($(this).attr('type') == "checkbox") {
            $(this).prev('label').text("Yes")
          } else {
            $(this).prev('label').text(val)
          }
        }
      })
      if (addFilled) {
        $('a.save_row').hide(); //To avoid user clicking multiple times when already save is triggered
        setTimeout(function(){
          var rowData = {}
          var apiUrl = ""
          dad.find(".editableInput").each(function () {
            var key = $(this).data('updateid')
            if ($(this).data('type') == "date") {
              var id = $(this).data('updateId')
              var val = $(this).find("input").val().toString()
              val = self.changeDateFormatService.formatDate(val);
            } else {
              if ($(this).attr('type') == "checkbox") {
                if ($(this).is(':checked')) {
                  val = 'T'
                } else {
                  val = 'F'
                }
              } else {
                val = $(this).val().toString()
              }
            }
            rowData[key] = val
          })
          rowData['cdExtraBenefitHistFlag'] = "T"
          rowData['cardKey'] = self.savedCardKey
          var apiUrl = CardApi.saveAndUpdatecardBenefitHistUrl
          $.ajax({
  
            type: "POST",
            url: apiUrl,
            data: JSON.stringify(rowData),
            cache: false,
            async: true,
            headers: { 'content-type': 'application/json', "Authorization": self.currentUserService.token },
            success: function (data) {
              if (data.code == 500) {
                self.toastrService.error("Extra Benifit Not Added!");
              } else if (data.code == 400 && data.message == 'NEW_EFFECTIVE_ON_SHOULD_BE_GREATER_THAN_OLD_EFFECTIVE_ON') {
                self.toastrService.error(self.translate.instant('card.toaster.EffectiveOn-greater'));
              } else if (data.code == 400 && data.message == 'OLD_EXPIRED_ON_SHOULD_BE_LESS_THAN_NEW_EFFECTIVE_ON ') {
                self.toastrService.error("New Effective Date Should Be Greater Than Previous Expired Date")
              }
              else if (data.code == 404 && data.status == 'NOT_FOUND') {
                self.toastrService.error("Extra Benefit Cannot Save!!")
              }
              else {
                dad.find('label').show();
                dad.find('.editableInput').hide();
                (rowData['cardExtraBenefitHisKey']) ? self.toastrService.success(self.translate.instant('card.toaster.benefits-updated')) : self.toastrService.success(self.translate.instant('card.toaster.benefits'));
                $(this).hide()
                dad.find('a.save_row').hide()
                dad.find('a.delete_row').remove()
                dad.find('a.edit_row').show()
                setTimeout(function () {
                  self.getExtraBenifitsDetails()
                }, 100);
              }
  
            }
          });
          var labelflag = false
          self.updateDateObj()
        },2000)
      }
    })

    $(document).on('click', "#" + this.extraBenifitsTableID + " .delete_row", function (e) {
      self.exDialog.openConfirm(self.translate.instant('card.exDialog.delete-cardEligblehistory')).subscribe((value) => {
        if (value) {
          var rowData = $(this).parents('tr')
          var rowId = []
          rowId = rowData.attr('id').split('_')
          self.tableData.splice(rowId[1], 1)
          rowData.remove()
          $("#" + self.extraBenifitsTableID).find('tr.tableRow:first-child').find('td:last-child').find('a').removeClass('disabled')
        }
      })
    })
    this.CardEligibilityPopupForm = new FormGroup({
      eligibilityPlan: new FormControl('', [Validators.required]),
      effectiveDate: new FormControl('', [Validators.required]),
      expiryDate: new FormControl(''),
    });
    this.CardOverridesPopupForm = new FormGroup({
      OverrideEffectiveDate: new FormControl('', [Validators.required]),
      descipline: new FormControl('', [Validators.required]),
      OverrideExpiryDate: new FormControl(''),
      OverrideCardId: new FormControl(''),
      OverrideCardHolder: new FormControl(''),
      desciplineChoice: new FormArray([])
    });
    this.CardOverridesMaxPopupForm = new FormGroup({
      OverrideEffectiveDate: new FormControl('', [Validators.required]),
      descipline: new FormControl('', [Validators.required]),
      OverrideExpiryDate: new FormControl(''),
      OverrideCardId: new FormControl(''),
      OverrideCardHolder: new FormControl(''),
      desciplineChoice: new FormArray([])
    });

  }


  ngAfterViewInit(): void {
    this.dtTrigger['eligibility-history-table'].next()
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.CardEligibilityFormGroup.patchValue(datePickerValue);
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
      this.CardEligibilityFormGroup.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
 
    var cardEffectiveDate = this.changeDateFormatService.convertStringDateToObject(this.cardEffectiveOnDate)
    if (cardEffectiveDate && this.CardEligibilityFormGroup.value.effective_date) {
      this.error = this.changeDateFormatService.compareTwoDates(cardEffectiveDate.date, this.CardEligibilityFormGroup.value.effective_date.date);
      if (this.error.isError == true) {
        this.CardEligibilityFormGroup.controls['effective_date'].setErrors({
          "CardEffEligibilityDates": true
        });
      }
    }

    if (this.CardEligibilityFormGroup.value.effective_date && this.CardEligibilityFormGroup.value.expiry_date) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardEligibilityFormGroup.value.effective_date.date, this.CardEligibilityFormGroup.value.expiry_date.date);
      if (this.error.isError == true) {
        this.CardEligibilityFormGroup.controls['expiry_date'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }

    if (this.CardEligibilityFormGroup.value.effective_date.date) {
      let effectiveDate
      if (this.CardEligibilityFormGroup.value.effective_date) {
        effectiveDate = this.changeDateFormatService.convertDateObjectToString(this.CardEligibilityFormGroup.value.effective_date)
      }
      let submitData = {
        "unitKey": this.CardEligibilityFormGroup.get('plan').value,
        "effectiveOn": effectiveDate
      }

      this.hmsDataServiceService.postApi(CardApi.checkEffectiveDateForPlan, submitData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_PLAN_EFFECTIVEON") {
          this.CardEligibilityFormGroup.controls['effective_date'].setErrors({
            "ExpiryDateGreaterThanPlan": true
          });
        }
      })
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
      
     }
    if(frmControlName =='expiry_date' ){
      this.cardService.cardExpDate.emit(datePickerValue)  
    }
    else{
      this.cardService.cardEffDate.emit(datePickerValue)  
    }
  }

  GetOverideData(key) {
    if(this.cardHolderMaximum){
      this.maximumType = 'cardholderBenifit'
    }else{
      this.maximumType = 'Benifit'
    }
    if (key == '1') {
      this.GridTitle = "Benefit Dental Coverage Category Max";
    }
    else if (key == '3') {
      this.GridTitle = "Benefit Health Coverage Category Max";
    }
    else if (key == '2') {
      this.GridTitle = "Benefit Vision Coverage Category Max";
    }
    else if (key == '4') {
      this.GridTitle = "Benefit Drug Coverage Category Max";
    }
    $('#lbldisciplineKey').html(key);
    this.hmsDataServiceService.OpenCloseModalForOverride('btnRefreshBenifitCoverageMax');
  }

  GetOverideCoverage(key) {
    if(this.cardHolderMaximum){
      this.maximumType = 'cardholderCoverage'
    }else{
      this.maximumType = 'Coverage'
    }

    if (key == '1') {
      this.GridTitle = "Dental Coverage Category Max";
    }
    else if (key == '3') {
      this.GridTitle = "Health Coverage Category Max";
    }
    else if (key == '2') {
      this.GridTitle = "Vision Coverage Category Max";
    }
    else if (key == '4') {
      this.GridTitle = "Drug Coverage Category Max";
    }
    $('#lbldisciplineKey').html(key);
    this.hmsDataServiceService.OpenCloseModalForOverride('btnRefreshCoverageMax');
  }

  GetOverideTopupMaximumData(key) {
    this.currentUser = this.currentUserService.currentUser.userId
    if (key == '5') {
      this.cardHolderMaximum = false;
      this.maximumType = 'Top-Up-Maximums'
      this.GridTitle = "Top-Up-Maximums";
    }else if(key == '10'){
      this.maximumType = 'Cardholder-Top-Up-Maximums'
      this.GridTitle = "Top-Up-Maximums";
    }
    $('#lbldisciplineKey').html('5');
    this.hmsDataServiceService.OpenCloseModalForOverride('btnRefreshTopupMaximums');
  }
  
  GetOverideCardMaximumData(key) {
    this.currentUser = this.currentUserService.currentUser.userId
    if (key == '6') {
      this.cardHolderMaximum = false;
      this.maximumType = 'Card Maximums'
      this.GridTitle = "Card Maximums";
    }else if(key == '12'){
      this.maximumType = 'Cardholder Maximums'
      this.GridTitle = "Cardholder Maximums";
    }
    this.disciplineKey= key;
    $('#lbldisciplineKey').html('6');
    this.hmsDataServiceService.OpenCloseModalForOverride('btnRefreshCardMaximums');
  }

  getPlanByCompanyCokey(value) {
    if(!value){
      return false 
    }
    let requiredInfo = {
      "coKey": value
    }
    this.hmsDataServiceService.postApi(CardApi.getCompanyPlanUrl, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.plans = data.result
        // this.CardEligibilityFormGroup.patchValue({
        //   'plan': this.plans[0].unitKey
        // })
        var planName = data.result.filter(val => val.unitKey == this.CardEligibilityFormGroup.get('plan').value).map(data => data.plansName)
        this.planTooltip = planName[0]
       // this.plans.unshift({ unitKey: null, plansName: 'Select' })
        if (this.editEligibilityFormFlag) {}
      } else {
        this.plans = []
      }
      error => {}
    })
  }

  getEligibilityHistory() {
    this.eligibilityHistoryTableID = "eligibility-history-table";
    this.eligibilityHistorySaveUrl = CardApi.saveCardEligibilityUrl;
    var planData = []
    this.eligibilityHistorytableKeys = [
      { 'column': 'unitKey', 'type': 'select', 'name': 'unitKey', 'required': true, 'disabled': true, 'optionKey': 'unitKey', 'optionText': 'plansName', 'selectOptions': planData, 'selectPlaceHolder': "Plan # / Div #/ Unit #/ Unit", 'setValue': 'unitKey' },
      { 'column': 'effectiveOn', 'type': 'datepicker', 'name': 'effectiveOn', 'required': true },
      { 'column': 'expireOn', 'type': 'datepicker', 'name': 'expireOn', 'greater_than': 'effectiveOn', 'required': false },
      { 'column': 'action', 'type': 'action' }
    ]
    this.eligibilityHistorytableActions = [
      { 'name': 'edit', 'serverSide': false, 'val': '', 'class': 'edit_row table-action-btn edit-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-pencil' },
      { 'name': 'save', 'serverSide': false, 'val': '', 'class': 'save_row table-action-btn save-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-save' },
      { 'name': 'cardKey', 'val': '', 'class': '', 'type': 'hidden' },
      { 'name': 'cdEligibilityKey', 'val': '', 'class': '', 'type': 'hidden', 'uniqueness': true }
    ]
    this.eligibilityHistoryColumns = [
      { title: "Plan#/Division#/Unit#", data: 'unitKey' },
      { title: "Effective Date", data: 'effectiveOn' },
      { title: "Expiry Date", data: 'expireOn' },
      { title: "Action", data: 'action' }
    ]
    this.eligibilityHistorytableData = [];
    this.apiRequestType = "put";
  }

  getEligibilityHistoryDetails() {
    this.CardEligibilityPopupForm.reset();
    this.buttonText = this.translate.instant('card.button-save');
    var cardHolderKey;
    this.route.queryParams.subscribe(queryParam =>{
      cardHolderKey = queryParam['cardHolderKey']
    })
    let requiredInfo = {
      "cardKey": this.savedCardKey,
      "cardHolderKey": cardHolderKey,
    }

    this.hmsDataServiceService.postApi(CardApi.getCardEligibiltyHistory, requiredInfo).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.eligibilityHistorytableData = data.result
        var dateCols = ['effectiveOn', 'expireOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
      } else {
        this.eligibilityHistorytableData = []
      }
      this.datatableService.reloadTableElem(this.dtElements, this.eligibilityHistoryTableID, this.dtTrigger[this.eligibilityHistoryTableID], false)
      error => { }
    })
  }

  getMaximumHistory() {
    this.coverageMaximumTableHeading = "Coverage Maximums"
    this.coverageMaximumColumns = [{ title: "Category", data: 'category' },
      { title: "Max Type", data: 'max_type' },
      { title: "Max Amount", data: 'max_amount' },
      { title: "Prorate Max", data: 'prorate_max' },
      { title: "Paid To Date", data: 'paid_to_date' },
      { title: "Amount Avail", data: 'amount_avail' },
      { title: "Cfwd Amt", data: 'cfwd_amt' },
      { title: "Period Type", data: 'period_type' },
      { title: "Year Type", data: 'year_type' },
      { title: "Period Start", data: 'period_start' },
      { title: "Period End", data: 'period_end' },
      { title: "Action", data: 'action' }]

    this.coverageMaximumtableData = [
      {
        'id': '1',
        'category': 'Sandeep Singh',
        'max_type': 'maximum',
        'max_amount': '1234',
        'prorate_max': '34',
        'paid_to_date': '25/04/2018',
        'amount_avail': '23',
        'cfwd_amt': '343',
        'period_type': 'type1',
        'year_type': '25/04/2018',
        'period_start': '25/04/2018',
        'period_end': '25/04/2018',

        'action': ''
      },
      {
        'id': '2',
        'category': 'Sandeep Singh',
        'max_type': 'maximum',
        'max_amount': '1234',
        'prorate_max': '34',
        'paid_to_date': '25/04/2018',
        'amount_avail': '23',
        'cfwd_amt': '343',
        'period_type': 'type2',
        'year_type': '25/04/2018',
        'period_start': '25/04/2018',
        'period_end': '25/04/2018',
        'action': ''
      },
      {
        'id': '3',
        'category': 'Sandeep Singh',
        'max_type': 'maximum',
        'max_amount': '1234',
        'prorate_max': '34',
        'paid_to_date': '25/04/2018',
        'amount_avail': '23',
        'cfwd_amt': '343',
        'period_type': 'type3',
        'year_type': '25/04/2018',
        'period_start': '25/04/2018',
        'period_end': '25/04/2018',
        'action': ''
      },
    ]
    this.covrageMaximumTableID = "covrage-maximum-table"

    this.coverageMaximumtableKeys = [
      { 'column': 'category', 'type': 'text', 'name': 'category', 'required': false },
      { 'column': 'max_type', 'type': 'text', 'name': 'max_type', 'required': false },
      { 'column': 'max_amount', 'type': 'text', 'name': 'max_amount', 'required': false },
      { 'column': 'prorate_max', 'type': 'text', 'name': 'prorate_max', 'required': false },
      { 'column': 'paid_to_date', 'type': 'datepicker', 'name': 'paid_to_date', 'required': true },
      { 'column': 'amount_avail', 'type': 'text', 'name': 'amount_avail', 'required': false },
      { 'column': 'cfwd_amt', 'type': 'text', 'name': 'cfwd_amt', 'required': false },
      { 'column': 'period_type', 'type': 'text', 'name': 'period_type', 'required': false },
      { 'column': 'year_type', 'type': 'datepicker', 'name': 'year_type', 'required': true },
      { 'column': 'period_start', 'type': 'datepicker', 'name': 'period_start', 'required': true },
      { 'column': 'period_end', 'type': 'datepicker', 'name': 'period_end', 'required': true },
      { 'column': 'action', 'type': 'action' }
    ]
    this.coverageMaximumtableActions = [
      { 'name': 'edit', 'serverSide': false, 'val': '', 'class': 'edit_row table-action-btn edit-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-pencil' },
      { 'name': 'save', 'serverSide': false, 'val': '', 'class': 'save_row table-action-btn save-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-save' },
      { 'name': 'delete', 'serverSide': true, 'val': '', 'class': 'delete_row table-action-btn del-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-trash' },
      { 'name': 'coId', 'val': '', 'class': '', 'type': 'hidden' }
    ]
  }

  extraBenifitsHistory() {
    this.tableColumns = [
      { title: "Has Extra Benefits", data: 'cdExtraBenefitHistFlag' },
      { title: "Effective Date", data: 'effectiveOn' },
      { title: "Expiry Date", data: 'expiredOn' },
      { title: "Action", data: 'action' }
    ]
    this.tableData = [];
    this.extraBenifitsTableID = "eligibility-history"

    this.elibigilityTableKeys = [
      { 'column': 'cdExtraBenefitHistFlag', 'type': 'checkbox', 'name': 'cdExtraBenefitHistFlag', 'required': false },
      { 'column': 'effectiveOn', 'type': 'datepicker', 'name': 'effectiveOn', 'required': true, 'placeHolder': 'Effective Date' },
      { 'column': 'expiredOn', 'type': 'datepicker', 'name': 'expiredOn', 'greater_than': 'effectiveOn', 'required': false, 'placeHolder': 'Expiry Date' },
      { 'column': 'action', 'type': 'action' }
    ]
    this.elibigilityTableActions = [
      { 'name': 'edit', 'val': '', 'class': 'edit_row table-action-btn edit-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-pencil' },
      { 'name': 'save', 'val': '', 'class': 'save_row table-action-btn save-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-save' },
      { 'name': 'coId', 'val': '', 'class': '', 'type': 'hidden' }
    ]
  }

  getExtraBenifitsDetails() {
    let requiredInfo = {
      "cardKey": this.savedCardKey,
      "startPos": 0,
      "pageSize": 0
    }
    this.hmsDataServiceService.postApi(CardApi.getExtraBenefitListByCard, requiredInfo).subscribe(data => {
      if (data.code == 302 && data.status == "FOUND") {
        this.tableData = data.result
        var dateCols = ['effectiveOn', 'expiredOn'];
        this.changeDateFormatService.dateFormatListShow(dateCols, data.result);
        var tableid = 'eligibility-history';
        for (var j = 0; j < this.tableData.length; j++) {
          for (var k = 0; k < this.elibigilityTableKeys.length; k++) {
            var columnText = ''
            if (this.elibigilityTableKeys[k]['type'] == "datepicker") {
              this.benifitsDateNameArray[tableid + j + this.elibigilityTableKeys[k]['name']] = this.tableData[j][this.elibigilityTableKeys[k]['name']]
            }
          }
        }
      } else {
        this.tableData = []
      }
      error => {}
    })
  }

  updateTable() {
    var tableid = 'eligibility-history';
    for (var j = 0; j < this.tableData.length; j++) {
      for (var k = 0; k < this.elibigilityTableKeys.length; k++) {
        var columnText = ''
        if (this.elibigilityTableKeys[k]['type'] == "datepicker") {
          this.benifitsDateNameArray[tableid + j + this.elibigilityTableKeys[k]['name']] = this.tableData[j][this.elibigilityTableKeys[k]['name']]
        }

      }
    }
  }

  changeDateFormat1(event, frmControlName, formName) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        self[formName].controls[frmControlName].setErrors({
          "dateNotValid": true
        });
        return;
      }
      this.dateNameArray[frmControlName] = {
        year: obj.date.year,
        month: obj.date.month,
        day: obj.date.day
      };
    }
  }

  checkString(dateVal) {}

  validateFutureDate(event, frmControlName, dependId, greaterThan, index) {
    if (event.reason == 2 && event.value != null && event.value != '') {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      if (!obj) {
        $("#" + frmControlName).find('input').val('')
        $("#" + frmControlName).addClass('error_field')
      } else {
        if (greaterThan) {

        }
        this.benifitsDateNameArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
        var dateObj = this.benifitsDateNameArray[frmControlName]
        if (this.benifitsDateNameArray[frmControlName].day >= 10) {
          var dte = dateObj.day + '/' + dateObj.month + '/' + dateObj.year;
        } else {
          var dte = '0' + dateObj.day + '/' + dateObj.month + '/' + dateObj.year;
        }
        dte = dte.toString()
        dte = dte.replace('/', '-')
        var dependValue = $("#" + dependId).find('input').val()
        if (dependValue && this.benifitsDateNameArray[index + 'effectiveOn']) {
          var effectiveDate = this.changeDateFormatService.convertStringDateToObject(this.benifitsDateNameArray[index + 'effectiveOn'])
          let error = this.changeDateFormatService.compareTwoDates(effectiveDate.date, this.benifitsDateNameArray[index + 'expiredOn'])
          if (error.isError) {
            this.benifitsDateNameArray[frmControlName] = []
            $("#" + frmControlName).find('input').val('')
            $("#" + frmControlName).addClass('error_field')
            this.toastrService.error("Expired Date Should Be Greater Than Effective Date")
          } else {
            if ($("#" + frmControlName).hasClass("error_field")) {
              $("#" + frmControlName).removeClass('error_field')
            }
          }
        }
      }
    }
  }

  reloadTable(tableID) {
    this.datatableService.reloadTableElem(this.dtElements, tableID, this.dtTrigger[tableID], false)
  }

  addFieldValue() {
    if (this.editExtraBenfit) {
      this.toastrService.warning("Please save edited row first")
    } else {
      var tableid = 'eligibility-history';
      this.getEligibilityHistoryDetails()
      var hasError = false

      var tableLength = $("#" + tableid).find('tr.tableRow').length
      $('#' + tableid + ' .save_row').each(function () {
        if ($(this).is(':visible')) {
          hasError = true
        }
      })

      if (!hasError) {
        var previousActions = $("#" + tableid).find('tr.tableRow').first().find('td:last-child');
        var newRow = {}
        for (var k = 0; k < this.elibigilityTableKeys.length; k++) {
          newRow[this.elibigilityTableKeys[k]['name']] = ''
        }
        if (!this.tableData) {
          this.tableData = []
        }
        this.tableData.unshift(
          newRow
        )
        for (var k = 0; k < this.elibigilityTableKeys.length; k++) {
          if (this.elibigilityTableKeys[k]['type'] == "datepicker") {
            this.benifitsDateNameArray[tableid + 0 + this.elibigilityTableKeys[k]['name']] = ''
          }
        }

        setTimeout(function () {
          var tableFirstCol = $("#" + tableid).find('tr.tableRow').first().find('td:first-child .checkboxActions');
          tableFirstCol.prepend('<label class="editableLabel checkboxLabel setCheckVal" ></label>')
          tableFirstCol.find('.changeCheck').addClass('required')
          var tableActions = $("#" + tableid).find('tr.tableRow').first().find('td:last-child');
          var str = "<div class='tb-actions tb-actions-right'>"
          str = str + "<a href='javascript:void(0)' class='edit_row table-action-btn edit-ico' >"
          str = str + "<i class='fa fa-pencil'></i>"
          str = str + "</a>"
          str = str + "<a href='javascript:void(0)' class=' delete_row table-action-btn del-ico' ><i class='fa fa-trash'></i></a>"
          str = str + "<a href='javascript:void(0)' class='save_row table-action-btn save-ico' ><i class='fa fa-save'><i></a>"
          previousActions.find('a').remove()
          var str = str + "</div>"
          tableActions.html(str)
          tableActions.find(".edit_row").trigger('click')
          tableActions.find(".save_row").show()
        }, 100);
      }
    }
  }

  onCheckChange(event) {
    const formArray: FormArray = this.CardOverridesPopupForm.get('desciplineChoice') as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    }
    else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value == event.target.value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  onCheckChangeMax(event) {
    const formArray: FormArray = this.CardOverridesMaxPopupForm.get('desciplineChoice') as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    }
    else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value == event.target.value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  submitOverrideFieldValue(data) {
    let cardKey = this.savedCardKey;
    this.OverrideData = data;
    this.OverrideData['savedCardKey'] = this.savedCardKey;
    var tableid = 'eligibility-history';
    this.getEligibilityHistoryDetails()
    var hasError = false
    var tableLength = $("#" + tableid).find('tr.tableRow').length
    $('#' + tableid + ' .save_row').each(function () {
      if ($(this).is(':visible')) {
        hasError = true
      }
    })

    if (!hasError) {
      var previousActions = $("#" + tableid).find('tr.tableRow').first().find('td:last-child');
      var newRow = {}
      for (var k = 0; k < this.elibigilityTableKeys.length; k++) {
        newRow[this.elibigilityTableKeys[k]['name']] = ''
      }
      if (!this.tableData) {
        this.tableData = []
      }
      this.tableData.unshift(
        newRow
      )
      for (var k = 0; k < this.elibigilityTableKeys.length; k++) {
        if (this.elibigilityTableKeys[k]['type'] == "datepicker") {
          this.benifitsDateNameArray[tableid + 0 + this.elibigilityTableKeys[k]['name']] = ''
        }
      }

      setTimeout(function () {
        var tableFirstCol = $("#" + tableid).find('tr.tableRow').first().find('td:first-child .checkboxActions');
        tableFirstCol.prepend('<label class="editableLabel checkboxLabel setCheckVal" ></label>')
        tableFirstCol.find('.changeCheck').addClass('required')
        var tableActions = $("#" + tableid).find('tr.tableRow').first().find('td:last-child');
        var str = "<div class='tb-actions tb-actions-right'>"
        str = str + "<a href='javascript:void(0)' class='edit_row table-action-btn edit-ico' >"
        str = str + "<i class='fa fa-pencil'></i>"
        str = str + "</a>"
        str = str + "<a href='javascript:void(0)' class='save_row table-action-btn save-ico' ><i class='fa fa-save'></i></a>"
        str = str + "<a href='javascript:void(0)' class='delete_row table-action-btn del-ico' ><i class='fa fa-trash'><i></a>"

        previousActions.find('a').remove()
        var str = str + "</div>"
        tableActions.html(str)
        tableActions.find(".edit_row").trigger('click')
        tableActions.find(".save_row").show()
      }, 100);
    }
  }

  updateDateObj() {
    var self = this
    $("#eligibility-history tr.tableRow").each(function () {
      $(this).find(".editableInput").each(function () {
        var key = $(this).data('updateid');
        var val = '';
          if ($(this).data('type') == "date") {
          var id = $(this).data('updateid')
          val = $(this).find("input").val().toString()
          self.benifitsDateNameArray[$(this).attr("id")] = $(this).prev('label').text()
        }
      })
    })
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

  updateCardEligibiltyHistory() {
    if (this.CardEligibilityPopupForm.valid) {
      let submitData = {
        "cdEligibilityKey": this.editUniqueKey,
        "cardKey": this.savedCardKey,
        "unitKey": this.CardEligibilityPopupForm.value.eligibilityPlan,
        "effectiveOn": this.changeDateFormatService.convertDateObjectToString(this.CardEligibilityPopupForm.value.effectiveDate),
        "expireOn": this.changeDateFormatService.convertDateObjectToString(this.CardEligibilityPopupForm.value.expiryDate),
      }
      this.hmsDataServiceService.putApi(CardApi.saveCardEligibilityUrl, submitData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          this.getEligibilityHistoryDetails()
          this.toastrService.success(this.translate.instant('card.toaster.eligibility'));
          this.CardEligibilityPopupForm.reset();
          this.editUniqueKey = 0 // set 0 as per Log #1047, #1136 new changes
          this.emitOnSave.emit("saved");
          this.buttonText = this.translate.instant('card.button-save');
        } else {
          if (data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON') {
            this.toastrService.error("Effective date should be greater than previous Effective date.")
          } else if (data.message == 'FIRST_EXPIRED_OLD_ONE_RECORD') {
            this.toastrService.error("Please Expire Previous Record First!")
          } else if (data.message == 'EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON') {
            this.toastrService.error("Effective date should be greater than previous Expiry date.!")
          } else {
            this.toastrService.error("Card Eligibilty Not Updated!!")
          }
        }
      })
    } else {
      this.validateAllFormFields(this.CardEligibilityPopupForm);
    }
  }

  changeDateFormatEligibility(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.CardEligibilityPopupForm.patchValue(datePickerValue);
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
      this.CardEligibilityPopupForm.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    if (this.cardEffectiveOnDate == undefined) {
      this.cardEffectiveOnDate = '';
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
    var cardEffectiveDate = this.changeDateFormatService.convertStringDateToObject(this.cardEffectiveOnDate)
    if (cardEffectiveDate && this.CardEligibilityPopupForm.value.effectiveDate) {
      this.error = this.changeDateFormatService.compareTwoDates(cardEffectiveDate.date, this.CardEligibilityPopupForm.value.effectiveDate.date);
      if (this.error.isError == true) {
        this.CardEligibilityPopupForm.controls['effectiveDate'].setErrors({
          "CardEffEligibilityDates": true
        });
      }
    }

    // No need to check effective and expiry dates. Check is already there while saving form.
    if (this.CardEligibilityPopupForm.value.effectiveDate) {
      let effectiveDate
      if (this.CardEligibilityPopupForm.value.effectiveDate) {
        effectiveDate = this.changeDateFormatService.convertDateObjectToString(this.CardEligibilityPopupForm.value.effectiveDate)
      }
      let submitData = {
        "unitKey": this.CardEligibilityFormGroup.get('plan').value,
        "effectiveOn": effectiveDate
      }

      this.hmsDataServiceService.postApi(CardApi.checkEffectiveDateForPlan, submitData).subscribe(data => {
        if (data.code == 200 && data.status == "OK" && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_PLAN_EFFECTIVEON") {
          this.CardEligibilityPopupForm.controls['effectiveDate'].setErrors({
            "ExpiryDateGreaterThanPlan": true
          });
        }
      })
    }
    if (this.CardEligibilityPopupForm.value.effectiveDate && this.CardEligibilityPopupForm.value.expiryDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardEligibilityPopupForm.value.effectiveDate.date, this.CardEligibilityPopupForm.value.expiryDate.date);
      if (this.error.isError == true) {
        this.CardEligibilityPopupForm.controls['expiryDate'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    this.cardService.cardEffDate.emit(datePickerValue)
  }

  changeDateFormatOverrideEligibility(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.CardOverridesPopupForm.patchValue(datePickerValue);
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
      this.CardOverridesPopupForm.patchValue(datePickerValue);
    }
    let OverideEffectiveDate = this.CardOverridesPopupForm.value.OverrideEffectiveDate ? this.CardOverridesPopupForm.value.OverrideEffectiveDate.date : null;
    let OverideExpiryDate = this.CardOverridesPopupForm.value.OverrideExpiryDate ? this.CardOverridesPopupForm.value.OverrideExpiryDate.date : null;
    if (OverideEffectiveDate && OverideExpiryDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardOverridesPopupForm.value.OverrideEffectiveDate.date, this.CardOverridesPopupForm.value.OverrideExpiryDate.date);
      if (this.error.isError == true) {
        this.CardOverridesPopupForm.controls['OverrideExpiryDate'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    this.getOverrideForm()
  }

  changeDateFormatOverrideMaximumEligibility(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.CardOverridesMaxPopupForm.patchValue(datePickerValue);
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
      this.CardOverridesMaxPopupForm.patchValue(datePickerValue);
    }
    let OverideEffectiveDate = this.CardOverridesMaxPopupForm.value.OverrideEffectiveDate ? this.CardOverridesMaxPopupForm.value.OverrideEffectiveDate.date : null;
    let OverideExpiryDate = this.CardOverridesMaxPopupForm.value.OverrideExpiryDate ? this.CardOverridesMaxPopupForm.value.OverrideExpiryDate.date : null;
    if (OverideEffectiveDate && OverideExpiryDate) {
      this.error = this.changeDateFormatService.compareTwoDates(this.CardOverridesMaxPopupForm.value.OverrideEffectiveDate.date, this.CardOverridesMaxPopupForm.value.OverrideExpiryDate.date);
      if (this.error.isError == true) {
        this.CardOverridesMaxPopupForm.controls['OverrideExpiryDate'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
    this.getOverrideForm()
  }

  changeButtonText() {
    this.buttonText = this.translate.instant('card.button-update');
  }

  onSubmit() {}

  setEligibilityHistoryForm(dataRow) {
    if (dataRow.cdEligibilityKey) {
      this.editUniqueKey = dataRow.cdEligibilityKey
    } else {
      this.editUniqueKey = 0
    }
    let EligibilityHistoryFormValue = {
      eligibilityPlan: dataRow.unitKey,
      effectiveDate: this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn),
      expiryDate: this.changeDateFormatService.convertStringDateToObject(dataRow.expireOn)
    }
    this.CardEligibilityPopupForm.patchValue(EligibilityHistoryFormValue);
    this.buttonText = this.translate.instant('card.button-update');
    this.expired=this.changeDateFormatService.isFutureNonFormatDate(dataRow.expireOn);
  }

  viewPlanDetails() {
    window.open("/company/plan/view?companyId=" + this.savedcompanyCoKey + "&planId=" + this.PlanKey + "&divisonId=" + this.divisonKey+ "&cardholderId=" + this.route.snapshot.url[1].path)
  }

  viewPlanDetailsHistory(dataRow){
    window.open("/company/plan/view?companyId=" + dataRow.coKey + "&planId=" + dataRow.planKey + "&divisonId=" + dataRow.divisonKey)
  }

  getOverrideForm() {
    let requestedData = {
      "cardholderKey": 12
    }
    this.cardMaximumArray = [];
    let fakeData = [{
      'MaxPeriodType': '200 Days',
      'Amount': '5000',
      'ForDental': 'Y',
      'ForHealth': 'N',
      'ForVision': 'Y',
      'ForDrug': 'Y',
      'EffectiveOn': '25/08/2018',
      'ExpireOn': '25/10/2018'
    },
    {
      'MaxPeriodType': '200 Days',
      'Amount': '5000',
      'ForDental': 'Y',
      'ForHealth': 'N',
      'ForVision': 'Y',
      'ForDrug': 'Y',
      'EffectiveOn': '25/08/2018',
      'ExpireOn': '25/10/2018'
    }, {
      'MaxPeriodType': '200 Days',
      'Amount': '5000',
      'ForDental': 'Y',
      'ForHealth': 'N',
      'ForVision': 'Y',
      'ForDrug': 'Y',
      'EffectiveOn': '25/08/2018',
      'ExpireOn': '25/10/2018'
    }
    ];
    this.cardMaximumArray = fakeData;
  }

  getPlanValue(event) {
    if (event.target.value) {
      let selected = this.plans.filter(plan => plan.unitKey == event.target.value);
      localStorage.setItem("coPlanSelected",selected[0].plansName)
      this.setEffectiveDate = true
    }
  }

  resetCardContactHistory() { }

  overrideMaximumCardholder(cardholderDetails){
    this.cardHolderMaximum = true;
    this.cardholderDetails = cardholderDetails;
    this.cardholderFirstName=cardholderDetails.personFirstName;
    this.cardholderLastName=cardholderDetails.personLastName;
    this.GetOverideCardMaximumData(12);
    let element: HTMLElement = document.getElementById('overridesMaximumsButton') as HTMLElement;
    if (element != undefined) {
      element.click();
    }
  }

  redirectPlanview(rowData){
    var link = '/company/plan/view?companyId='+rowData.coKey +'&planId='+rowData.planKey +'&divisonId='+rowData.divisonKey;
    window.open(link, '_blank');
  }

  ngOnDestroy(){
    if (this.cardExpiry) {
      this.cardExpiry.unsubscribe()
    }
    else if (this.cardEffDate) {
      this.cardEffDate.unsubscribe()
    }
    else if (this.cardStatusSub) {
      this.cardStatusSub.unsubscribe()
    }
    else if (this.prefLang) {
      this.prefLang.unsubscribe()
    }
    else if (this.compChange) {
      this.compChange.unsubscribe()
    }
    else if (this.compCoKey) {
      this.compCoKey.unsubscribe()
    }
  }
}