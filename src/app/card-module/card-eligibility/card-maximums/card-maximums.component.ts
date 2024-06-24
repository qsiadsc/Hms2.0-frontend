import { Component, OnInit, Input} from '@angular/core';
import { CurrentUserService} from '../../../common-module/shared-services/hms-data-api/current-user.service'
import { ToastrService } from 'ngx-toastr'; 
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import {TranslateService} from '@ngx-translate/core';
import { HmsDataServiceService} from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi} from '../../card-api'
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; 

@Component({
  selector: 'app-card-maximums',
  templateUrl: './card-maximums.component.html',
  styleUrls: ['./card-maximums.component.css'],
  providers:[ChangeDateFormatService,TranslateService]
})

export class CardMaximumsComponent implements OnInit {
  expired: boolean=false;
  addMode:boolean=false;
  editMode:boolean=false;
  viewMode:boolean = false;
  selectedRowId = '';
  arrMaximumArray=[]; 
  arrMaxPeriodType;
  arrCardMaximum;
  userId;
  newRecordValidate:boolean=false;
  @Input() cardKey: string;
  @Input() disciplineKey: string;
  @Input() cardHolderdetails: any;
  @Input() cardHolderMaximum:boolean=false;
  showLoader = false;
  expiredCheck: boolean
  arrNewMaximumArray = {
    "maxPeriodTypeKey": "",
    "cardMaxAmt": "",
    "dentalInd": "",
    "healthInd":"",
    "visionInd":"",
    "drugInd":"",
    "effectiveOn": "",
    "expiredOn": "",
    "checkDate": false
  }
  
  constructor(
    private hmsDataServiceService:HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private translate:TranslateService,
    private exDialog: ExDialog,
    private currentUserService: CurrentUserService
  ) { 
    this.userId = this.currentUserService.currentUser.userId
  }
  
  ngOnInit() {
    this.disciplineKey = $('#lbldisciplineKey').html();
    this.GetMaxPeriodType();
  }
  
  GetMaxPeriodType()
  {
    this.hmsDataServiceService.getApi(CardApi.getMaxPeriodTypeUrl).subscribe(data=>
      {
        if(data.hmsShortMessage == "RECORD_GET_SUCCESSFULLY")
        {
          this.arrMaxPeriodType=data.result;
        }
      })
    }
    
    validateAllFields(objRow:any)
    {
      if(objRow.maxPeriodTypeKey  && objRow.cardMaxAmt != ''  && objRow.effectiveOn != '' && objRow.expiredOn != ''){
        return true;
      }
      else{
        return false;
      }
    }
    
    BindGridData()
    {     
      this.arrMaximumArray = [];
      this.disciplineKey =$('#lbldisciplineKey').html();
      var requestedData:any;
      if(this.cardHolderMaximum){
        requestedData={
          "cardHolderKey":this.cardHolderdetails.cardHolderKey 
        }
        this.hmsDataServiceService.postApi(CardApi.getAllCardHolderMax, requestedData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") { 
            for(var i=0;i<data.result.length;i++)
            {
              if(data.result[i].dentalInd == "T")
              {
                data.result[i].dentalInd=true;
              }    
              else{
                data.result[i].dentalInd=false;
              }
              
              if(data.result[i].healthInd == "T")
              {
                data.result[i].healthInd=true;
              }   
              else{
                data.result[i].healthInd=false;
              } 
              
              if(data.result[i].visionInd == "T")
              {
                data.result[i].visionInd=true;
              }  
              else{
                data.result[i].visionInd=false;
              }  
              
              if(data.result[i].drugInd == "T")
              {
                data.result[i].drugInd=true;
              } 
              else{
                data.result[i].drugInd=false;
              } 
              data.result[i].cardMaxKey= data.result[i].cardHolderMaxKey;
              data.result[i].cardMaxAmt= data.result[i].chMaxAmount;
              data.result[i].cardMaxDesc= data.result[i].maxDesc;
            } 
            this.arrMaximumArray = data.result;  
            error => {}
          } 
        });
      }else{
        requestedData={
          "cardKey":this.cardKey,
          "userId":this.userId 
        }
        
        this.hmsDataServiceService.postApi(CardApi.getMaximumTypeUrl, requestedData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") { 
            for(var i=0;i<data.result.length;i++)
            {
              if(data.result[i].dentalInd == "T")
              {
                data.result[i].dentalInd=true;
              }    
              else{
                data.result[i].dentalInd=false;
              }
              
              if(data.result[i].healthInd == "T")
              {
                data.result[i].healthInd=true;
              }   
              else{
                data.result[i].healthInd=false;
              } 
              
              if(data.result[i].visionInd == "T")
              {
                data.result[i].visionInd=true;
              }  
              else{
                data.result[i].visionInd=false;
              }  
              
              if(data.result[i].drugInd == "T")
              {
                data.result[i].drugInd=true;
              } 
              else{
                data.result[i].drugInd=false;
              }   
            }
            this.arrMaximumArray = data.result;  
            for (var i = 0; i < this.arrMaximumArray.length; i++) {
              if(this.arrMaximumArray[i].expiredOn){
                var check = this.checkExpiryDate(this.arrMaximumArray[i].expiredOn)
                this.arrMaximumArray[i]['checkDate'] = check
              }
            }
            error => {
                
            }
          } 
        });
      }
    }
    
    AddNew()
    {
      if(!this.editMode)
      {
        this.selectedRowId = '';
        this.resetNewRecord();
        this.addMode=true;
      }
    }
    
    EditInfo(dataRow)
    {
      if(!this.editMode)
      {
        this.editMode=true;
        this.addMode=false;
        this.selectedRowId = dataRow.cardMaxKey;
        dataRow.cardMaxAmt= CustomValidators.ConvertAmountToDecimal(dataRow.cardMaxAmt);
      }
    }
    
    resetNewRecord()
    {
      this.addMode=false;
      this.arrNewMaximumArray = {
        "maxPeriodTypeKey": "",
        "cardMaxAmt": "",
        "dentalInd": "",
        "healthInd":"",
        "visionInd":"",
        "drugInd":"",
        "effectiveOn": "",
        "expiredOn": "",
        "checkDate": false
      }
      this.selectedRowId = '';
      this.newRecordValidate=false;
    }
    
    SaveInfo()
    {
      this.newRecordValidate=true;
      if(this.validateAllFields(this.arrNewMaximumArray))
      {
        this.showLoader = true;
        var dentalInd = "F";
        if(this.arrNewMaximumArray.dentalInd)
        {
          dentalInd = "T";
        }
        
        var drugInd = "F";
        if(this.arrNewMaximumArray.drugInd)
        {
          drugInd = "T";
        }
        
        var healthInd = "F";
        if(this.arrNewMaximumArray.healthInd)
        {
          healthInd = "T";
        }
        
        var visionInd = "F";
        if(this.arrNewMaximumArray.visionInd)
        {
          visionInd = "T";
        }
        
        var requestedData:any;
        if(this.cardHolderMaximum){
          requestedData={
            "maxKey": 0,
            "expiredOn":this.arrNewMaximumArray.expiredOn,
            "effectiveOn":this.arrNewMaximumArray.effectiveOn,
            "maxPeriodTypeKey":+this.arrNewMaximumArray.maxPeriodTypeKey,
            "cardHolderKey":+this.cardHolderdetails.cardHolderKey,
            "maxAmount":+this.arrNewMaximumArray.cardMaxAmt,
            "maxDesc":"",
            "dentalInd":dentalInd,
            "drugInd":drugInd,
            "healthInd":healthInd,
            "visionInd":visionInd,
            "unitKey":''
          }
          this.hmsDataServiceService.postApi(CardApi.saveAndUpdateCardholderMaximum,requestedData).subscribe(
            data=>{
              this.showLoader = false;
              if(data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY")
              {
                this.toastrService.success(this.translate.instant('card.toaster.record-save'));
                this.BindGridData();
                this.resetNewRecord();
              }
            }
          )
        }else{
          requestedData={
            "cardMaxKey": 0,
            "expiredOn":this.arrNewMaximumArray.expiredOn,
            "effectiveOn":this.arrNewMaximumArray.effectiveOn,
            "maxPeriodTypeKey":+this.arrNewMaximumArray.maxPeriodTypeKey,
            "cardKey":+this.cardKey,
            "cardMaxAmt":+this.arrNewMaximumArray.cardMaxAmt,
            "cardMaxDesc":"",
            "dentalInd":dentalInd,
            "drugInd":drugInd,
            "healthInd":healthInd,
            "visionInd":visionInd,
            "disciplineKey": +$('#lbldisciplineKey').html(),
            "userId":this.userId 
          }
          this.hmsDataServiceService.postApi(CardApi.addOrUpdateCardMaxUrl,requestedData).subscribe(
            data=>{
              this.showLoader = false;
              if(data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY")
              {
                this.toastrService.success(this.translate.instant('card.toaster.record-save'));
                this.BindGridData();
                this.resetNewRecord();
              }
            }
          )
        }
      }
    }
    
    UpdateInfo(dataRow)
    {
      if(this.validateAllFields(dataRow))
      {
        this.showLoader = true;
        var dentalInd = "F";
        if(dataRow.dentalInd)
        {
          dentalInd = "T";
        }
        
        var drugInd = "F";
        if(dataRow.drugInd)
        {
          drugInd = "T";
        }
        
        var healthInd = "F";
        if(dataRow.healthInd)
        {
          healthInd = "T";
        }
        
        var visionInd = "F";
        if(dataRow.visionInd)
        {
          visionInd = "T";
        }

        var requestedData;''
        if(this.cardHolderMaximum){
          requestedData={
            "maxKey": dataRow.cardMaxKey,
            "expiredOn":dataRow.expiredOn,
            "effectiveOn":dataRow.effectiveOn,
            "maxPeriodTypeKey":+dataRow.maxPeriodTypeKey,
            "cardHolderKey":+this.cardHolderdetails.cardHolderKey,
            "maxAmount":+dataRow.cardMaxAmt,
            "maxDesc":"",
            "dentalInd":dentalInd,
            "drugInd":drugInd,
            "healthInd":healthInd,
            "visionInd":visionInd,
            "unitKey":'',
          }
          this.hmsDataServiceService.postApi(CardApi.saveAndUpdateCardholderMaximum,requestedData).subscribe(
            data=>{
              this.showLoader = false;
              if(data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY")
              {
                this.toastrService.success(this.translate.instant('card.toaster.record-update'));
                this.editMode=false;
                this.selectedRowId='';
                this.BindGridData();
                this.resetNewRecord();
              }
            }
          )
        }else{
          requestedData={
            "cardMaxKey": dataRow.cardMaxKey,
            "expiredOn":dataRow.expiredOn,
            "effectiveOn":dataRow.effectiveOn,
            "maxPeriodTypeKey":+dataRow.maxPeriodTypeKey,
            "cardKey":+this.cardKey,
            "cardMaxAmt":+dataRow.cardMaxAmt,
            "cardMaxDesc":"",
            "dentalInd":dentalInd,
            "drugInd":drugInd,
            "healthInd":healthInd,
            "visionInd":visionInd,
            "cbccMaxDesc":"",
            "disciplineKey": +$('#lbldisciplineKey').html(),
            "userId":this.userId
          }
          this.hmsDataServiceService.postApi(CardApi.addOrUpdateCardMaxUrl,requestedData).subscribe(
            data=>{
              this.showLoader = false;
              if(data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY")
              {
                this.toastrService.success(this.translate.instant('card.toaster.record-update'));
                this.editMode=false;
                this.selectedRowId='';
                this.BindGridData();
                this.resetNewRecord();
              }
            }
          )
        }
      }
    }
    
    DeleteInfo(dataRow)
    {
      var action="cancel";
      if(dataRow && dataRow.cardMaxKey)
      {
        action="Delete";
      }
      this.exDialog.openConfirm((this.translate.instant('card.exDialog.are-you-sure')) +' '+action +' '+(this.translate.instant('card.exDialog.record')))
      .subscribe((value) => {
        if(value)
        {
          if(this.addMode)
          {
            this.resetNewRecord();
          }
          else{
              var requestedData;
              if(this.cardHolderMaximum){
                requestedData={
                  "maxKey": dataRow.cardMaxKey,     
                }
                this.hmsDataServiceService.postApi(CardApi.deleteCardHolderMaximum,requestedData).subscribe(data=>
                  {
                    if(data.hmsMessage.messageShort == "RECORD_DELETED_SUCCESSFULLY")
                    {
                      this.toastrService.success(this.translate.instant('card.toaster.record-delete'));
                      this.BindGridData();
                    }
                  })
              }else{
                requestedData={
                  "cardMaxKey": dataRow.cardMaxKey,
                  "userId":this.userId       
                }
                this.hmsDataServiceService.postApi(CardApi.deleteCardMaxUrl,requestedData).subscribe(data=>
                {
                  if(data.hmsMessage.messageShort == "RECORD_DELETED_SUCCESSFULLY")
                  {
                    this.toastrService.success(this.translate.instant('card.toaster.record-delete'));
                    this.BindGridData();
                  }
                })
              }
            } 
          }
        })
      }

    
    CancelInfo()
    {
      this.editMode=false;
      this.addMode=false;
      this.selectedRowId = ""
      this.BindGridData();    //To fetch saved values instead of getting blank (edit-> cancelled)
    }
      
      ConvertAmountToDecimal(evt,dataRow)
      {
        if(this.addMode)
        {
          this.arrNewMaximumArray.cardMaxAmt = CustomValidators.ConvertAmountToDecimal(evt.target.value);
        }
        else{
          dataRow.cardMaxAmt  = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
        }
      }
      
      ChangeInputDateFormat(event,idx,type)
      {
        let inputDate = event.target;
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
              let effectiveOn = this.arrNewMaximumArray.effectiveOn;
              let expiredOn = this.arrNewMaximumArray.expiredOn;
              if(type == 'effectiveOn')
              {
                effectiveOn = inputDate
              }
              else{
                expiredOn = inputDate
                var check = this.checkExpiryDate(inputDate)
                this.arrNewMaximumArray.checkDate = check
              }
              if ( effectiveOn && expiredOn ) {
                var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn,expiredOn);
                if(isTrue)
                {
                  this.toastrService.warning(this.translate.instant('card.toaster.effective-on'));
                  if(type == 'effectiveOn')
                  {
                    this.arrNewMaximumArray.effectiveOn = '';
                  }
                  else{
                    this.arrNewMaximumArray.expiredOn = '';
                  }
                }
                else{
                  this.arrNewMaximumArray[type]=inputDate;
                }
              }
              else{
                this.arrNewMaximumArray[type]=inputDate;
              }
            }
            else{
              this.arrMaximumArray[idx][type]=inputDate;
              let effectiveOn = this.arrMaximumArray[idx].effectiveOn;
              let expiredOn = this.arrMaximumArray[idx].expiredOn;
              var check = this.checkExpiryDate(this.arrMaximumArray[idx].expiredOn)
              this.arrMaximumArray[idx]['checkDate'] = check
              if ( effectiveOn && expiredOn ) {
                var isTrue = this.changeDateFormatService.compareTwoDate(effectiveOn,expiredOn);
                if(isTrue)
                {
                  this.toastrService.warning(this.translate.instant('card.toaster.effective-on-date'));
                  if(type == 'effectiveOn')
                  {
                    this.arrMaximumArray[idx].effectiveOn = '';
                  }
                  else{
                    this.arrMaximumArray[idx].expiredOn = '';
                  }
                }
                else{
                  this.arrMaximumArray[idx][type]=inputDate;
                } 
              }
              else{
                this.arrMaximumArray[idx][type]=inputDate;
              } 
            }
          }
        }
        if (obj) {
          this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
        }
      }
  
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