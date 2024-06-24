

import { Component, OnInit,ViewChild, Output, EventEmitter,Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CardHolderPopupGeneralInformationComponent } from '../../card-holder-popup/card-holder-popup-general-information/card-holder-popup-general-information.component'
import { DatatableService } from '../../../common-module/shared-services/datatable.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CardApi } from '../../card-api'
import { CardServiceService } from '../../../card-module/card-service.service'; 
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { ToastrService } from 'ngx-toastr'; 
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import {TranslateService} from '@ngx-translate/core';
import { QueryList, ViewChildren } from '@angular/core';
import { Subject, Subscription } from 'rxjs/Rx';
import { Constants } from '../../../common-module/Constants';
import { DataTableDirective } from 'angular-datatables';
@Component({
  selector: 'app-eligibility-history-popup',
  templateUrl: './eligibility-history-popup.component.html',
  styleUrls: ['./eligibility-history-popup.component.css'],
  providers:[HmsDataServiceService,ChangeDateFormatService,TranslateService]
})
export class EligibilityHistoryPopupComponent implements OnInit {
  expired=false;
  @Input() CardHolderGeneralInfo:any;
  @Input() cardHolderKey:string;
  @Input() companyKey:string;
  @Input() cardHolderData
  @Output() emitOnSave: EventEmitter<any> = new EventEmitter<any>();
  @Input() addMode:boolean = true; //Enable true when user add a new card
  @Input() viewMode:boolean = false; //Enable true after a new card added
  @Input() editMode:boolean = false; //Enable true after viewMode when user clicks edit button
  cardEffDate;
  arrayObject;
  arrayObjectKey;
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any>[] = [];
  public plans = [];
  arrRoleList;
  hiddenParamName:string;
  rolehiddenParamName:string;
  apiRequestType:string;
  eligibilityDeleteIcon:boolean=false;
  eligibilityAllColumnAction:boolean=false;
  eligibilityHistoryTableID
  eligibilityHistorytableActions
  eligibilityHistoryColumns
  eligibilityHistorytableData
  eligibilityHistorytableKeys
  eligibilityHistoryTableHeading
  eligibilityHistorySaveUrl
  dateNameArray = []
  eligibilityArray = []
  expenseArray = []
  effDateSubs: Subscription;

  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;
  @ViewChild(CardHolderPopupGeneralInformationComponent) cardHolderPopupGeneralInformationComponent; //To acces variable of card holder general information form
 
  constructor(private fb: FormBuilder,
    private dataTableService: DatatableService,
    private hmsDataService:HmsDataServiceService,
    public cardService:CardServiceService,
    private toastrService: ToastrService,
    private changeDateFormatService:ChangeDateFormatService,
    private exDialog: ExDialog,
    private translate:TranslateService) { 
      this.hiddenParamName="cardholderKey";
      this.initiateEligibilityHistory();

      this.effDateSubs = cardService.cardEffectiveDate.subscribe((value) =>{
        this.cardEffDate=value 
      })

    }
    
    ngOnInit() {
      var self = this
      this.EligibilityHistoryGrid();
      this.dtOptions['cardholder-eligibility-history-table']= Constants.dtOptionsConfig
      this.dtTrigger['cardholder-eligibility-history-table'] = new Subject();
    }
    
    reloadTable(tableID){
      this.dataTableService.reloadTableElem(this.dtElements,tableID,this.dtTrigger[tableID], false)
    }
    
    ngAfterViewInit(): void {
      this.dtTrigger['cardholder-eligibility-history-table'].next() 
    }
    
    initiateEligibilityHistory() {
      this.eligibilityHistoryTableHeading = "Eligibility History"
      this.eligibilityHistorySaveUrl=CardApi.addUpdateHolderEligibilityHistoryUrl
      this.eligibilityHistoryColumns = [
        { title: "Ignore Plan Age", data: 'chIgnorePlanAge' },
        { title: "Effective Date", data: 'eligibilityEffectiveOn' },
        { title: "Expiry Date", data: 'eligibilityExpiryOn' },
        { title: "Action", data: 'action' }
      ]
      
      this.eligibilityHistorytableData = []
      
      this.eligibilityHistoryTableID = "cardholder-eligibility-history-table"
      
      this.eligibilityHistorytableKeys = [
        { 'column': 'chIgnorePlanAge', 'type': 'checkbox', 'name': 'chIgnorePlanAge', 'required': false },
        { 'column': 'eligibilityEffectiveOn', 'type': 'datepicker', 'name': 'eligibilityEffectiveOn', 'required': true },
        { 'column': 'eligibilityExpiryOn', 'type': 'datepicker', 'name': 'eligibilityExpiryOn','greater_than':'eligibilityEffectiveOn', 'required': false },
        { 'column': 'action', 'type': 'action' }
      ]
      this.eligibilityHistorytableActions = [
        { 'name': 'edit', 'serverSide': false, 'val': '', 'class': 'edit_row table-action-btn edit-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-pencil' },
        { 'name': 'save', 'serverSide': false, 'val': '', 'class': 'save_row table-action-btn save-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-save' },
        { 'name': 'delete', 'serverSide': true, 'val': '', 'class': 'delete_row table-action-btn del-ico', 'type': 'anchor', 'url': 'abc.com', 'hasIcon': true, 'icon_class': 'fa fa-trash' },
        { 'name': 'chEligibilityKey', 'val': '', 'class': '', 'type': 'hidden', 'unique': true },
        { 'name': 'cardHolderKey', 'val': '', 'class': '', 'type': 'hidden'}
      ]
    }
    
    EligibilityHistoryGrid()
    {
      var self = this
      $(document).on('click',"#cardholder-eligibility-history-table .edit_row",function(e){
        e.preventDefault()
        var dad = $(this).closest('tr');
        dad.find('label').hide();
        dad.find('.editableInput').show();
        $(this).hide();
        $(this).next('a.save_row').show();
      });
      
      $(document).on('click',"#cardholder-eligibility-history-table .save_row",function(e){
        e.preventDefault()
        var addFilled = true
        var dad = $(this).closest('tr');
        var saveData = {}
        dad.find(".editableInput").each(function(){
          var elem;
          if($(this).data('type') == "date"){
            var id = $(this).attr('id')
            elem = $("#"+id).find("input")
            var val = $("#"+id).find("input").val().toString()
            saveData[$(this).data('updateid')] = val
          }
          else{
            elem = $(this)
            var val = $(this).val().toString()
            saveData[$(this).attr('name')] = val
          }
          if((val == "") && ($(this).hasClass('required'))){
            addFilled = false
            $(elem).addClass("error_field")
          }else{
            $(this).removeClass("error_field")
            if($(this).attr('type') == "checkbox"){
              if($(this).is(":checked")){
                $(this).prev('label').text("Yes")
              }else{
                $(this).prev('label').text("No")
              }
            }else{
              $(this).prev('label').text(val)
            }
          }
        })
        if(addFilled){
          var rowData = {}
          self.updateEligibilityDateObj();
          dad.find(".editableInput").each(function(){
            var key = $(this).data('updateid');
            var val ='';
            if($(this).data('type') == 'hidden')
            {
              val = $(this).val().toString()
            }
            else      
            if($(this).data('type') == "date"){
              var id = $(this).data('updateid')
              val = $(this).find("input").val().toString()
            }
            else{
              val = $(this).val().toString()
            }
            if($(this).attr('type') == "checkbox"){
              if($(this).is(':checked')){
                val = 'T'
              }else{
                val = 'F'
              }
            }
            if(key != 'undefined' && key != undefined)
            {
              rowData[key] = val
            }
          })
          
          let chEligibilityKey=0
          if(rowData['chEligibilityKey'])
          {
            chEligibilityKey = rowData['chEligibilityKey']
          }
          
          var requestedData ={
            "chEligibilityKey":chEligibilityKey,
            "cardHolderKey": self.cardHolderKey,
            "chIgnorePlanAge":rowData['chIgnorePlanAge'],
            "eligibilityExpiryOn":self.changeDateFormatService.formatDate(rowData['eligibilityExpiryOn']),
            "eligibilityEffectiveOn":self.changeDateFormatService.formatDate(rowData['eligibilityEffectiveOn']),
          }
          
          self.hmsDataService.postApi(CardApi.addUpdateHolderEligibilityHistoryUrl,requestedData).subscribe(data=>
            {
              if(data.code == 200 && data.hmsMessage.messageShort == 'RECORD_SAVE_SUCCESSFULLY')
              {
                requestedData = Object.assign(requestedData, {'chEligibilityKey':data.result[0].chEligibilityKey});
                self.emitOnSave.emit(requestedData);
                dad.find('label').show();
                dad.find('.editableInput').hide();
                $(this).hide()
                dad.find('a.save_row').hide();
                dad.find('a.delete_row').remove();
                dad.find('a.edit_row').show()
                self.toastrService.success(self.translate.instant('card.toaster.record-save'))
                setTimeout(function () {
                  self.getEligibilityHistory()
                }, 100);
              }
              else if(data.code == 400 && data.message == 'FIRST_EXPIRED_OLD_ONE_RECORD')
              {
                self.toastrService.error("Please Expire Previous Record First!")  
              }
              else if(data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OR_EQUAL_OLD_EFFECTIVEON')
              {
                self.toastrService.error("Eligibility Effective Date Should Be Greater Than or Equal To Previous Effective Date!")  
              }
              else if(data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON')
              {
                self.toastrService.error("Eligibility Effective Date Should Be Greater Than Previous Expiry Date!")  
              }
              else if(data.code == 400 && data.message == 'ELIGIBILITY_EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON')
              {
                self.toastrService.error("Eligibility Effective Date Should Be Greater Than Previous Effective Date!")  
              }
            }
          )
        }
      })
      
      $(document).on('click', "#cardholder-eligibility-history-table .delete_row", function(e){
        setTimeout(() => {
          if(!$(this).data("hasBeenClicked")) {
            $(this).data("hasBeenClicked", true);
            self.exDialog.openConfirm(self.translate.instant('card.exDialog.delete-history')).subscribe((value) => {
              if(value){
                var rowData = $(this).parents('tr')
                var rowId = []
                rowId = rowData.attr('id').split('_')
                self.eligibilityHistorytableData.splice(rowId[1], 1)
                rowData.remove()
                $("#cardholder-eligibility-history-table").find('tr.tableRow:first-child').find('td:last-child').find('a').removeClass('disabled')
              }
            })
          }
        });
        $(this).data("hasBeenClicked", false);
      });
    }
    
    addEligibilityFieldValue() {
      var hasError = false
      $("#cardholder-eligibility-history-table .editableInput").each(function(){
        var elem;
        
        if($(this).data('type') == "date"){
          var id = $(this).attr('id')
          elem = $("#"+id).find("input")
        }else{
          elem = $(this)
        }
        if(elem.val() == "" && $(this).hasClass('required')){
        
          hasError = true
          $(elem).addClass("error_field")
          $(elem).show()
          $(elem).focus()
        }
      })
      $('#cardholder-eligibility-history-table .save_row').each(function(){
        if($(this).is(':visible')){
          hasError = true
        }
      })
      if(!hasError){
        var tableid = 'cardholder-eligibility-history-table';
        var previousActions = $("#"+tableid).find('tr.tableRow:first-child').find('td:last-child');
        var newRow = {}
        newRow['effectiveDate'] = ""
        newRow['adjustmentAmount'] = ""
        newRow['action'] = ""
        var tableLength = $("#"+tableid).find('tr.tableRow').length
        this.eligibilityHistorytableData.unshift(
          newRow
        )
        this.eligibilityArray[tableid+0+'eligibilityEffectiveOn'] = ''
        this.eligibilityArray[tableid+0+'eligibilityExpiryOn'] = ''
        
        setTimeout(function(){
          var tableActions = $("#cardholder-eligibility-history-table tr.tableRow:first-child td:last-child");
          var str = "<div class=''>"
          str = str + "<a href='javascript:void(0)' class='edit_row table-action-btn edit-ico' >"
          str = str + "<i class='fa fa-pencil'></i>"
          str = str + "</a>"
          str = str + "<a href='javascript:void(0)' class='save_row table-action-btn save-ico' ><i class='fa fa-save'></i></a>"
          str = str + "<a href='javascript:void(0)' class='delete_row table-action-btn del-ico' ><i class='fa fa-trash'><i></a>"
          str = str + "</div>"
          tableActions.html(str)
          previousActions.find('a').addClass('disabled')
          tableActions.find(".edit_row").trigger('click')
          tableActions.find(".save_row").show()
        },100);
      }
    }
    
    updateEligibilityDateObj(){
      var self = this
      $("#cardholder-eligibility-history-table tr.tableRow").each(function(){
        $(this).find(".editableInput").each(function(){
          var key = $(this).data('updateid');
          var val ='';
          if($(this).data('type') == "date"){
            var id = $(this).data('updateid')
            val = $(this).find("input").val().toString()
            self.eligibilityArray[$(this).attr("id")] = $(this).prev('label').text()
          }
        })
      })
    }
    
    changeDateFormatWithoutCompare(event, frmControlName,actionType) {
      let inputDate = event.target;
      if (inputDate.value != null && inputDate.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(inputDate);
        let inPutdateInString = this.changeDateFormatService.convertDateObjectToString(obj);
        var IsEffDateInValid = this.changeDateFormatService.compareTwoDate(this.cardEffDate,inPutdateInString);
        if(IsEffDateInValid)
        {
          $('#'+frmControlName).val('');
          this.toastrService.warning("Card Holder Effective date can't be less then Card Effective date!");
        }
        else
        {
          $('#'+frmControlName).val(obj.date.day + '/'+obj.date.month+'/'+obj.date.year);
        }
      }
    }
    
    validateEmpty(evt,ctrlId)
    {
      if(evt.target.value != '')
      {
        $('#'+ctrlId).removeClass("error_field")
      }
      else{
        $('#'+ctrlId).addClass("error_field")
      }
    }

    changeDateFormat(event, ctrlEffectiveDate,ctrlExpiryDate,actionType) {
      let inputDate = event.target;
      if (inputDate.value != null && inputDate.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(inputDate);
        var day
        if(obj)
        {
          day = (obj.date.day).toString()
          if (day.length < 2) day = '0' + day;
          
          if(actionType == 'effective')
          {
            
            var setDate = this.changeDateFormatService.formatDatetoMonthName(day + '/'+obj.date.month+'/'+obj.date.year)
            $('#'+ctrlEffectiveDate).val(setDate);
            
          }
          else{
            var setDate = this.changeDateFormatService.formatDatetoMonthName(day + '/'+obj.date.month+'/'+obj.date.year)
            $('#'+ctrlExpiryDate).val(setDate);
          }
        }else{
          if(actionType == 'effective')
          {
             $('#'+ctrlEffectiveDate).val('');
            
          }
          else{
            $('#'+ctrlExpiryDate).val('');
          }
        }
        var effectiveDate =  $('#'+ctrlEffectiveDate).val();
        var expiryDate=$('#'+ctrlExpiryDate).val();

        effectiveDate = this.changeDateFormatService.formatDate(effectiveDate)
        expiryDate = this.changeDateFormatService.formatDate(expiryDate)
        if(this.cardEffDate && effectiveDate){
          var IsEffDateInValid = this.changeDateFormatService.compareTwoDate(this.cardEffDate,effectiveDate);
          if(IsEffDateInValid)
          {
            $('#'+effectiveDate).val('');
            this.toastrService.warning("Card Holder Effective date can't be less then Card Effective date!");
          }
          else{
            if(effectiveDate && expiryDate)
            {
              var isEffectiveDateGreaterthanExpiry = this.changeDateFormatService.compareTwoDate(effectiveDate,expiryDate)
              if(isEffectiveDateGreaterthanExpiry)
              {
                let ctrlName;
                if(actionType == 'effective')
                {
                  ctrlName = ctrlEffectiveDate;
                }
                else{
                  ctrlName = ctrlExpiryDate;
                }
                $('#'+ctrlName).val('');
                this.toastrService.warning("Eligibility Effective date can't be greater than Eligibility Expiry date!"); 
              }
            }
          }
        }
        if (event.reason == 2 && event.value != null && event.value != '') {
          var obj = this.changeDateFormatService.changeDateFormat(event);
          this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
        }
        else if (event.reason == 1 && event.value != null && event.value != ''){
          this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
         }
      }
    }
    
    getEligibilityHistory() {
      let requestedData={
        "cardHolderKey":this.cardHolderKey,
        "startPos":"0",
        "pageSize":"2500"
      }
      this.hmsDataService.postApi(CardApi.getCardHolderEligibilityListUrl,requestedData).subscribe(
        res =>
        {
          var tableid = 'cardholder-eligibility-history-table';
          this.eligibilityHistorytableData=[];
          this.eligibilityHistorytableData = res.result;
          var dateCols=['eligibilityEffectiveOn','eligibilityExpiryOn'];
          this.changeDateFormatService.dateFormatListShow(dateCols,res.result);
  
          if(!this.eligibilityHistorytableData){
            this.eligibilityHistorytableData = []
          }
          for(var j = 0; j < this.eligibilityHistorytableData.length; j++){
            this.dateNameArray[tableid+j+'eligibilityEffectiveOn'] = this.eligibilityHistorytableData[j]['eligibilityEffectiveOn']
            this.dateNameArray[tableid+j+'eligibilityExpiryOn'] = this.eligibilityHistorytableData[j]['eligibilityExpiryOn']
          }
          this.reloadTable(tableid)
        }
      )
    }
    
    EligibilityDateExpenseFormat(event, frmControlName, dependId, greaterThan) {
      let inputDate = event.target;
      if ( inputDate.value != null && inputDate.value != '') {
        var obj = this.changeDateFormatService.changeDateFormat(inputDate);
        if (greaterThan) {
         }
        this.eligibilityArray[frmControlName] = {
          year: obj.date.year,
          month: obj.date.month,
          day: obj.date.day
        };
        var dateObj = this.eligibilityArray[frmControlName]
        if (this.eligibilityArray[frmControlName].day > 10) {
          var dte = dateObj.day + '/' + dateObj.month + '/' + dateObj.year;
        } else {
          var dte = '0' + dateObj.day + '/' + dateObj.month + '/' + dateObj.year;
        }
        dte = dte.toString();
        $('#'+dependId).val(dte);
        var dependValue = $('#'+dependId).val();
       
        if (dependValue > dte) {
          
          this.eligibilityArray[frmControlName] = []
          $("#" + frmControlName + " input").val('')
          $("#" + frmControlName).addClass('error_field')
        }
      }
    }

    ngOnDestroy(){
      if (this.effDateSubs) {
        this.effDateSubs.unsubscribe();
      }
    }
    
  }
  
