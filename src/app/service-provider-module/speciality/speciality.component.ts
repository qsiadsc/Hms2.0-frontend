import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import { TranslateService} from '@ngx-translate/core';
import { HmsDataServiceService} from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ServiceProviderApi } from '../service-provider-api';
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { Subject } from 'rxjs/Rx';
import { Constants} from '../../common-module/Constants'
import { HotkeysService, Hotkey} from 'angular2-hotkeys';
import { ServiceProviderService} from '../serviceProvider.service';
import { CommonDatePickerOptions } from '../../common-module/Constants';

@Component({
  selector: 'app-speciality',
  templateUrl: './speciality.component.html',
  styleUrls: ['./speciality.component.css'],
  providers:[ChangeDateFormatService,TranslateService]
})

export class SpecialityComponent implements OnInit {
  edittedLicenseNum: any;
  edittedExpiryDate: any;
  edittedEffDate: any;
  edittedSpecKey: any;
  edittedData: any;
  arrTopupMax;
  arrSplDiscType;
  addMode:boolean=false;
  editMode:boolean=false;
  viewMode:boolean = false; 
  selectedRowId = '';
  selectedDisciplineKey;
  arrData=[];
  specialityRequestData = [];
  arrNewRow = {
    "provSpecKey": "",
    "provLicenseNum": "",
    "effectiveOn": "",
    "expiredOn": "",
    "idx": "",
    "provSpecialDesc":"",
    "checkDate": false
  }
  
  /* New Empty Record array */
  newRecordValidate:boolean=false;
  
  @Input() cardKey: string;
  @Input() providerKey: string;
  @Input() disciplineKey: string;
  @Input() serviceProviderEditMode : boolean; //set value edit value
  @Input() serviceProviderViewMode : boolean; //set value View value
  @Input() serviceProviderAddMode : boolean; //set value Add value
  @Input() serviceProviderChecks:any;
  
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  @ViewChildren(DataTableDirective)
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerOptions;//datepicker Options
  
  updateEffectiveRow = []
  updateExpiredRow = []
  expired: boolean;
  
  constructor(
    private hmsDataServiceService:HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private translate:TranslateService,
    private exDialog: ExDialog,
    private dataTableService: DatatableService,
    private _hotkeysService: HotkeysService,
    private serviceProviderService:ServiceProviderService
  ) {
    this._hotkeysService.add(new Hotkey('shift+s', (event: KeyboardEvent): boolean => {
      if(!this.serviceProviderViewMode){
        this.AddNew()
      }
      return false; // Prevent bubbling
    }));
    this.serviceProviderService.saveUpdateProvider.subscribe(data=>
      {
        if(data)
        {
          this.resetNewRecord();
        }
      })
      serviceProviderService.selectedDisciplineKey.subscribe((value) =>{
        {
          this.selectedDisciplineKey = value
          this.GetSpecialityBasedOnDiscipline();
        }
      })
    }
    
    ngOnInit() {
      this.dtOptions['SPGridSpeciality'] = Constants.dtOptionsConfig
      this.dtTrigger['SPGridSpeciality'] = new Subject();
      if(!this.serviceProviderAddMode){
      this.GetSpecialityAssgnListByProviderId(false)
      }
    }
    
    GetSpecialityBasedOnDiscipline()
    {
      var requestedData={
        "disciplineKey":this.selectedDisciplineKey,
      }
      this.hmsDataServiceService.postApi(ServiceProviderApi.getSpecialityBasedOnDisciplineUrl,requestedData).subscribe(data=>
        {
          if(data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY")
          {
            this.arrSplDiscType=data.result;
          }else{
            this.arrSplDiscType =[]
          }
        })
      }
      
      GetSpecialityAssgnListByProviderId(reload)
      {
        var requestedData={
          "provKey":this.providerKey,
          "disciplineKey":this.disciplineKey, 
        }
        this.hmsDataServiceService.postApi(ServiceProviderApi.getSpecialityAssgnListByProviderIdUrl,requestedData).subscribe(data=>
          {
            if(data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY")
            {
              this.arrData=data.result;
              for (var i = 0; i < this.arrData.length; i++) {
                if(this.arrData[i].expiredOn){
                  var check = this.checkExpiryDate(this.arrData[i].expiredOn)
                  this.arrData[i]['checkDate'] = check
                }
              }
              if (!$.fn.dataTable.isDataTable('#SPGridSpeciality')) { 
                this.dtTrigger['SPGridSpeciality'].next()
              }else{
                this.reloadTable('SPGridSpeciality')
              }
            }
          })
        }
        reloadTable(tableID){
          this.dataTableService.reloadTableElem(this.dtElements,tableID,this.dtTrigger[tableID], false)
        }
        
        AddNew()
        {
          if(!this.editMode)
          {
            this.selectedRowId = '';
            this.resetNewRecord();
            this.addMode=true;
          }
          setTimeout(function(){
            var ddlSpProvSpecKey=<HTMLSelectElement>document.getElementById('ddlSpProvSpecKey');
            ddlSpProvSpecKey.focus();
          },200);
        }
        
        SaveInfo()
        {
          this.newRecordValidate=true;
          if(this.validateAllFields(this.arrNewRow))
          {
            var requestedData
            if(!this.serviceProviderAddMode){
              requestedData={
                "provKey":this.providerKey,
                "disciplineKey":this.disciplineKey, 
                "providerSpecialityDto" :{
                  "provSpecAssgnKey":0,    
                  "effectiveOn":this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn),
                  "expiredOn":this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn),
                  "provSpecKey":this.arrNewRow.provSpecKey,
                  "provLicenseNum":this.arrNewRow.provLicenseNum,
                }
              }
            this.hmsDataServiceService.postApi(ServiceProviderApi.saveServiceProviderSpecialtyUrl,requestedData).subscribe(
              data=>{
                if(data.code == 200){
                  if(data.message && data.message == "INVALID_PROVIDER_SPECIALTY")
                  {
                    this.toastrService.error(this.translate.instant('serviceProvider.toaster.specialty-not-valid'));
                  }
                  else if(data.message && data.message == "LICENSE_ALREADY_EXIST")
                  {
                    this.toastrService.error(this.translate.instant('serviceProvider.toaster.license-exist'));
                  }
                  else if(data.hmsMessage.messageShort && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY")
                  {
                    this.toastrService.success(this.translate.instant('serviceProvider.toaster.record-saved'));
                    this.GetSpecialityAssgnListByProviderId(true);
                    this.resetNewRecord();
                  }
                }
                else if(data.code == 400)
                {
                  if(data.message && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
                  }
                  else if(data.message && data.message == "INVALID_PROVIDER_SPECIALTY")
                  {
                    this.toastrService.error(this.translate.instant('serviceProvider.toaster.specialty-not-valid'));
                  }
                  else if(data.message && data.message == "RECORD_ALREADY_EXIST"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.speciality-exist'));
                  }
                  else if(data.message && data.message == "EFFECTIVEON_REQIURED"){
                    this.toastrService.warning('Add Specialty Effective Date');
                  }
                  else if(data.message && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date-greater-previous'));
                  }
                  else if(data.message && data.message == "EXPIRY_DATE_SHOULD_BE_GREATER_THAN_EFFECTIVE_DATE"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.expiryDateGreaterThanEffDate'))
                  }
                  else if(data.hmsMessage && data.hmsMessage.messageShort == "RECORD_ALREADY_EXIST"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.speciality-exist'));
                  }
                  else if(data.hmsMessage && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
                  }
                  else if(data.hmsMessage && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date-greater-previous'));
                  }
                  else if(data.hmsMessage.messageShort && data.hmsMessage.messageShort == "LICENSE_ALREADY_EXIST")
                  {
                    this.toastrService.error(this.translate.instant('serviceProvider.toaster.license-exist'));
                  }
                }
              }
            )
          }
          else{
            requestedData={
                  "provSpecAssgnKey":0,    
                  "effectiveOn":this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn),
                  "expiredOn":this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn),
                  "provSpecKey":this.arrNewRow.provSpecKey,
                  "provLicenseNum":this.arrNewRow.provLicenseNum,
              }
              this.arrNewRow.idx = (this.arrData.length).toString()
              let spectaltDesc = this.arrSplDiscType.filter(val => val.provSpecialKey == this.arrNewRow.provSpecKey ).map(data =>data.provSpecialDesc)
              this.arrNewRow.provSpecialDesc = spectaltDesc[0]
            this.specialityRequestData.push(requestedData)
            if(requestedData.expiredOn){
              var check = this.checkExpiryDate(requestedData.expiredOn)
              this.arrNewRow.checkDate = check
            }
            this.arrData.push(this.arrNewRow)
            this.editMode=false;
            this.addMode=false;
            this.arrNewRow.effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn);
            this.arrNewRow.expiredOn = this.arrNewRow.expiredOn ? this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn): ""
            setTimeout(() => {
              this.toastrService.success(this.translate.instant('serviceProvider.toaster.specialitySaveSuccess'));
            }, 500);
          }
          }
        }
        
        UpdateInfo(dataRow, idx)
        {
          if(this.validateAllFields(dataRow))
          {
            if(dataRow.expiredOn){
              var check = this.checkExpiryDate(dataRow.expiredOn)
              dataRow.checkDate = check
            }
            var requestedData={}
            if(!this.serviceProviderAddMode){
            requestedData={
              "provKey":this.providerKey,
              "disciplineKey":this.disciplineKey, 
              "providerSpecialityDto" :{
                "provSpecAssgnKey": dataRow.provSpecAssgnKey,
                "expiredOn":this.changeDateFormatService.convertDateObjectToString(this.updateExpiredRow[idx]),
                "effectiveOn":this.changeDateFormatService.convertDateObjectToString(this.updateEffectiveRow[idx]),
                "provSpecKey":+dataRow.provSpecKey,
                "provLicenseNum":dataRow.provLicenseNum,
              }
            }
            this.hmsDataServiceService.postApi(ServiceProviderApi.saveServiceProviderSpecialtyUrl,requestedData).subscribe(
              data=>{
                if(data.code == 200)
                {
                  if(data.message && data.message == "INVALID_PROVIDER_SPECIALTY")
                  {
                    this.toastrService.error(this.translate.instant('serviceProvider.toaster.specialty-not-valid'));
                  }else if(data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY"){
                    this.toastrService.success(this.translate.instant('card.toaster.record-update'));
                  this.editMode=false;
                  this.selectedRowId='';
                  this.GetSpecialityAssgnListByProviderId(true);
                  this.resetNewRecord();
                  }
                }
                else if(data.code == 400)
                {
                  if(data.message && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
                  }
                  else if(data.hmsMessage && data.hmsMessage.messageShort == "LICENSE_ALREADY_EXIST")
                  {
                    this.toastrService.error(this.translate.instant('serviceProvider.toaster.license-exist'));
                  }
                  else if(data.message && data.message == "EFFECTIVEON_REQIURED"){
                    this.toastrService.warning('Add Specialty Effective Date');
                  }
                  else if(data.message && data.message == "RECORD_ALREADY_EXIST"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.speciality-exist'));
                  }
                  else if(data.message && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date-greater-previous'));
                  }
                  else if(data.hmsMessage && data.hmsMessage.messageShort == "RECORD_ALREADY_EXIST"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.speciality-exist'));
                  }
                  else if(data.hmsMessage && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
                  }
                  else if(data.hmsMessage && data.hmsMessage.messageShort == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON"){
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date-greater-previous'));
                  }
                }
              }
            )
          }else{
            var  updateData = {
              "provSpecAssgnKey":0,
                "expiredOn":dataRow.expiredOn,
                "effectiveOn":dataRow.effectiveOn,
                "provSpecKey":+dataRow.provSpecKey,
                "provLicenseNum":dataRow.provLicenseNum,
                "idx": idx
            }
            let spectaltDesc = this.arrSplDiscType.filter(val => val.provSpecialKey == this.arrNewRow.provSpecKey ).map(data =>data.provSpecialDesc)
            this.arrNewRow.provSpecialDesc = spectaltDesc[0]
            requestedData[idx] = updateData
            this.editMode = false
            this.selectedRowId='';
          }
          }
        }
        
        /**
        * Edit Grid Row Item 
        * @param idx 
        * @param dataRow 
        */
        EditInfo(dataRow, idx)
        {
          if(!this.editMode)
          {
            this.editMode=true;
            this.addMode=false;
            var effectiveOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.effectiveOn);
            var expiredOnObj = this.changeDateFormatService.convertStringDateToObject(dataRow.expiredOn);
            this.updateEffectiveRow[idx] = effectiveOnObj
            this.updateExpiredRow[idx] = expiredOnObj
            if(this.serviceProviderAddMode){
              this.selectedRowId = idx
            }else{
              this.selectedRowId = dataRow.provSpecAssgnKey;
            }
          }
          this.edittedSpecKey = dataRow.provSpecKey
          this.edittedEffDate = dataRow.effectiveOn
          this.edittedExpiryDate = dataRow.expiredOn
          this.edittedLicenseNum = dataRow.provLicenseNum
        }
        
        CancelInfo(idx, dataRow)
        {
          this.editMode=false;
          this.addMode=false;
          this.selectedRowId = ""
            this.arrData[idx]['provSpecialKey'] = this.edittedSpecKey;
            this.arrData[idx]['effectiveOn'] = this.edittedEffDate;
            this.arrData[idx]['provLicenseNum'] = this.edittedLicenseNum;
            this.arrData[idx]['expiredOn'] = this.edittedExpiryDate;
        }
        
        validateAllFields(objRow:any)
        {
          if(objRow.provSpecKey && objRow.provLicenseNum != '' && objRow.provLicenseNum.length >= '5' && objRow.provLicenseNum.length <= '20' && objRow.effectiveOn != ''){
            return true;
          }
          else{
            return false;
          }
        }
        
        ValidateControls(evt,ctrlName)
        {
          if(evt.target.value != '' && evt.target.value.length <5 )
          {
            this.toastrService.warning(ctrlName +' Should have  5 to 20 character!');
          }
        }
        
        resetNewRecord()
        {
          this.addMode=false;
          this.arrNewRow = {
            "provSpecKey": "",
            "provLicenseNum": "",
            "effectiveOn": "",
            "expiredOn": "",
            "idx": "",
            "provSpecialDesc":"",
            "checkDate": false
          } 
          this.selectedRowId = '';
          this.newRecordValidate=false;
        }
        
        DeleteInfo(dataRow)
        {
          var action="cancel";
          if(dataRow && dataRow.provSpecAssgnKey)
          {
            action="Delete";
          }
          this.exDialog.openConfirm((this.translate.instant('card.exDialog.are-you-sure')) +' '+action+' '+ (this.translate.instant('card.exDialog.record')))
          .subscribe((value) => {
            if(value)
            {
              this.resetNewRecord();
            }
          })
        }
        
        
        /**Change Input Date Format and Validate It should not be greater than Claim Recieved date and Future date*/
        ChangeInputDateFormat(event,idx,type)
        {
          let inputDate = event;
          if(inputDate.value != '')
          {
            var obj = this.changeDateFormatService.changeDateFormat(inputDate);
            if (obj == null) {
              this.toastrService.warning(this.translate.instant('card.toaster.invalid-date'));
            }
            else{
              inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
              if(this.addMode)
              {
                let effectiveOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn);
                let expiredOn = this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn);
                if(type == 'effectiveOn')
                {
                  effectiveOn = inputDate
                }
                else{
                  expiredOn = inputDate
                }
                if ( effectiveOn && expiredOn ) {
                  var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn,expiredOn);
                  if(isTrue)
                  {
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.expiry-date'));
                    if(type == 'effectiveOn')
                    {
                      this.arrNewRow.effectiveOn = '';
                    }
                    else{
                      this.arrNewRow.expiredOn = '';
                    }
                  }
                  else{
                    this.arrNewRow[type]=obj;
                  }
                }
                else{
                  this.arrNewRow[type]=obj;
                }
              }
              
              else{
                this.arrData[idx][type]=inputDate;
                let effectiveOn = this.arrData[idx].effectiveOn;
                let expiredOn = this.arrData[idx].expiredOn;
                if ( effectiveOn && expiredOn ) {
                  var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn,expiredOn);
                  if(isTrue)
                  {
                    this.toastrService.warning(this.translate.instant('serviceProvider.toaster.expiry-date'));
                    if(type == 'effectiveOn')
                    {
                      this.updateEffectiveRow[idx] = '';
                    }
                    else{
                      this.updateExpiredRow[idx] = '';
                    }
                  }
                  else{
                    if(type == 'effectiveOn')
                    {
                      this.updateEffectiveRow[idx] = obj;
                    }
                    else{
                      this.updateExpiredRow[idx] = obj;
                    }
                  } 
                }
                else{
                  if(type == 'effectiveOn')
                  {
                    this.updateEffectiveRow[idx] = obj;
                  }
                  else{
                    this.updateExpiredRow[idx] = obj;
                  }
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

      // For Log #0189351
      checkExpiryDate(date){
        if(date){
          var check = this.changeDateFormatService.isFutureDate(date)
          if (check) {
            return false // black color
          } else {
            return true // red color
          }
        }
      }
        
      }
      