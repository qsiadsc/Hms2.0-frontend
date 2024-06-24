import { Component, OnInit, Input } from '@angular/core';
import { CurrentUserService} from '../../../common-module/shared-services/hms-data-api/current-user.service'
import { ToastrService } from 'ngx-toastr'; 
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import {TranslateService} from '@ngx-translate/core';
import { HmsDataServiceService} from '../../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { CardApi} from '../../card-api'
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; 

@Component({
  selector: 'app-coverage-category-maximum',
  templateUrl: './coverage-category-maximum.component.html',
  styleUrls: ['./coverage-category-maximum.component.css'],
  providers:[ChangeDateFormatService,TranslateService]
})

export class CoverageCategoryMaximumComponent implements OnInit {
  @Input() cardKey: string;
  @Input() disciplineKey: string;
  @Input() cardHolderdetails: any;
  @Input() cardHolderMaximum: boolean;
  addMode:boolean=false;
  editMode:boolean=false;
  viewMode:boolean = false; 
  selectedRowId = '';
  arrMaximumArray=[];
  userId;
  arrNewMaximumArray = {
    "maxPeriodTypeKey": "",
    "covCatKey": "",
    "cccMaxAmt": "",
    "effectiveOn": "",
    "expiredOn": "",
    "checkDate": false
  }
  newRecordValidate:boolean=false;
  arrCovCat;
  arrMaxPeriodType;
  showLoader = false;
  expiredCheck: boolean;

  constructor( private hmsDataServiceService:HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private translate:TranslateService,
    private exDialog: ExDialog,
    private currentUserService: CurrentUserService) { 
      this.userId = this.currentUserService.currentUser.userId
    }
    
    ngOnInit() {
      this.disciplineKey = $('#lbldisciplineKey').html()
      this.cardKey
      this.disciplineKey
      this.cardHolderdetails
      this.cardHolderMaximum
      this.GetMaxPeriodType();
      this.GetCovCategory();
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
      
      GetCovCategory()
      {
        this.resetNewRecord();
        var requestedData={
          "disciplineKey": +$('#lbldisciplineKey').html(),
          "userId":this.userId        
        }
        this.hmsDataServiceService.postApi(CardApi.getCovCatListUrl,requestedData).subscribe(data=>
        {
            
          if(data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY")
          {
            this.arrCovCat=data.result;
          }
        })
      }
        
        SaveInfo()
        {
          this.newRecordValidate=true;
          if(this.validateAllFields(this.arrNewMaximumArray))
          {
            this.showLoader = true;
            var requestedData;
            this.disciplineKey = $('#lbldisciplineKey').html();
            if(this.cardHolderMaximum){
              var maxUrl  = '';
              switch(this.disciplineKey){
                case '1':
                    maxUrl = CardApi.saveDentalCardholderMax;
                  break;
                case '3':
                    maxUrl = CardApi.saveHealthCardholderMax;
                  break;
                case '2':
                    maxUrl = CardApi.saveVisionCardholderMax;
                break;
                case '4':
                  maxUrl = CardApi.saveDrugCardholderMax;
                break;
              }
              
              requestedData={
                "maxKey": 0,
                "expiredOn":this.arrNewMaximumArray.expiredOn,
                "effectiveOn":this.arrNewMaximumArray.effectiveOn,
                "maxPeriodTypeKey":+this.arrNewMaximumArray.maxPeriodTypeKey,
                "cardHolderKey":+this.cardHolderdetails.cardHolderKey,
                "covCatKey":+this.arrNewMaximumArray.covCatKey,
                "maxAmount":+this.arrNewMaximumArray.cccMaxAmt,
                "maxDesc":"", 
                "unitKey":""
              }  
              this.hmsDataServiceService.postApi(maxUrl,requestedData).subscribe(data=>{
                  this.showLoader = false;
                  if(data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY")
                  {
                    this.toastrService.success(this.translate.instant('card.toaster.record-save'));
                    this.BindGridData();
                    this.resetNewRecord();
                  }
                })
            }else{
              requestedData={
                "cccMaxKey": 0,
                "expiredOn":this.arrNewMaximumArray.expiredOn,
                "effectiveOn":this.arrNewMaximumArray.effectiveOn,
                "maxPeriodTypeKey":+this.arrNewMaximumArray.maxPeriodTypeKey,
                "cardKey":+this.cardKey,
                "covCatKey":+this.arrNewMaximumArray.covCatKey,
                "cccMaxAmt":+this.arrNewMaximumArray.cccMaxAmt,
                "cccMaxDesc":"",
                "disciplineKey": +$('#lbldisciplineKey').html(),
                "userId":this.userId 
              }
              this.hmsDataServiceService.postApi(CardApi.addOrUpdateCardCovMaxUrl,requestedData).subscribe(
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
            var requestedData;
            this.disciplineKey = $('#lbldisciplineKey').html();
            if(this.cardHolderMaximum){
            var maxUrl  = '';
              switch(this.disciplineKey){
                case '1':
                    maxUrl = CardApi.saveDentalCardholderMax;
                  break;
                case '3':
                    maxUrl = CardApi.saveHealthCardholderMax;
                  break;
                case '2':
                    maxUrl = CardApi.saveVisionCardholderMax;
                break;
                case '4':
                  maxUrl = CardApi.saveDrugCardholderMax;
                break;
              }
              requestedData={
                "maxKey": dataRow.cccMaxKey,
                "expiredOn":dataRow.expiredOn,
                "effectiveOn":dataRow.effectiveOn,
                "maxPeriodTypeKey":+dataRow.maxPeriodTypeKey,
                "cardHolderKey":+this.cardHolderdetails.cardHolderKey,
                "covCatKey":+dataRow.covCatKey,
                "maxAmount":+dataRow.cccMaxAmt,
                "maxDesc":"", 
                "unitKey":""
              }
              this.hmsDataServiceService.postApi(maxUrl,requestedData).subscribe(
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
                  })
            }else{
              requestedData={
                "cccMaxKey": dataRow.cccMaxKey,
                "expiredOn":dataRow.expiredOn,
                "effectiveOn":dataRow.effectiveOn,
                "maxPeriodTypeKey":+dataRow.maxPeriodTypeKey,
                "cardKey":+this.cardKey,
                "covCatKey":+dataRow.covCatKey,
                "cccMaxAmt":+dataRow.cccMaxAmt,
                "cccMaxDesc":"",
                "disciplineKey": +$('#lbldisciplineKey').html(),
                "userId":this.userId 
              }
              this.hmsDataServiceService.postApi(CardApi.addOrUpdateCardCovMaxUrl,requestedData).subscribe(
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
        
        
        EditInfo(dataRow)
        {
          if(!this.editMode)
          {
            this.editMode=true;
            this.addMode=false;
            this.selectedRowId = dataRow.cccMaxKey;
            dataRow.cccMaxAmt= CustomValidators.ConvertAmountToDecimal(dataRow.cccMaxAmt);
          }
        }
        
        BindGridData()
        {
          this.GetCovCategory();
          this.arrMaximumArray = [];
          this.disciplineKey =$('#lbldisciplineKey').html();
          var requestedData:any;
          if(this.cardHolderMaximum){
            
            requestedData={
              "cardHolderKey":this.cardHolderdetails.cardHolderKey, 
            }
            var maxUrl  = '';
            switch(this.disciplineKey){
              case '1':
                  maxUrl = CardApi.getDentalCardholderMax;
                break;
              case '3':
                  maxUrl = CardApi.getHealthCardholderMax;
                break;
              case '2':
                  maxUrl = CardApi.getVisionCardholderMax;
              break;
              case '4':
                 maxUrl = CardApi.getDrugCardholderMax;
              break;
            }
            this.hmsDataServiceService.postApi(maxUrl, requestedData).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                for(var i=0;i<data.result.length;i++)
                {   
                  data.result[i].cccMaxKey = data.result[i].maxKey;
                  data.result[i].cccMaxAmt=data.result[i].maxAmount;
                  data.result[i].cccMaxDesc=data.result[i].maxDesc;
                }
                this.arrMaximumArray = data.result;      
               error => {}
              } 
            });
          }else{
            requestedData={
              "cardKey":this.cardKey,
              "disciplineKey":+$('#lbldisciplineKey').html(),
              "userId":this.userId 
            }
            this.hmsDataServiceService.postApi(CardApi.getAllCardCovMaxUrl, requestedData).subscribe(data => {
              if (data.code == 200 && data.status == "OK") {
                this.arrMaximumArray = data.result;   
                for (var i = 0; i < this.arrMaximumArray.length; i++) {
                  if(this.arrMaximumArray[i].expiredOn){
                    var check = this.checkExpiryDate(this.arrMaximumArray[i].expiredOn)
                    this.arrMaximumArray[i]['checkDate'] = check
                  }
                }   
               error => {}
              } 
            });
          } 
        }
        
        CancelInfo(){
          this.editMode=false;
          this.addMode=false;
          this.selectedRowId = "";
          this.BindGridData(); //to fetch saved values instead of getting (edit-> cancelled)
        }
        
        DeleteInfo(dataRow)
        {
          var action="cancel";
          if(dataRow && dataRow.cccMaxKey)
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
                    "maxKey": dataRow.cccMaxKey,
                    "disciplineKey": +$('#lbldisciplineKey').html(),       
                  }
                  this.hmsDataServiceService.postApi(CardApi.deleteCardHolderCovMax,requestedData).subscribe(data=>
                    {
                      if(data.hmsMessage.messageShort == "RECORD_DELETED_SUCCESSFULLY")
                      {
                        this.BindGridData();
                      }
                    })
                }else{
                  requestedData={
                    "cccMaxKey": dataRow.cccMaxKey,
                    "disciplineKey": +$('#lbldisciplineKey').html(),
                    "userId":this.userId        
                  }
                  this.hmsDataServiceService.postApi(CardApi.deleteCardCovMaxUrl,requestedData).subscribe(data=>
                    {
                      if(data.hmsMessage.messageShort == "RECORD_DELETED_SUCCESSFULLY")
                      {
                        this.BindGridData();
                      }
                    })
                }
              } 
            }})
          }
          
          AddNew(){
            if(!this.editMode)
            {
              this.selectedRowId = '';
              this.resetNewRecord();
              this.addMode=true;
            }
          }
          
          resetNewRecord(){
            this.addMode=false;
            this.arrNewMaximumArray = {
              "maxPeriodTypeKey": "",
              "covCatKey": "",
              "cccMaxAmt": "",
              "effectiveOn": "",
              "expiredOn": "",
              "checkDate": false
            } 
            this.selectedRowId = '';
            this.newRecordValidate=false;
          }
          
          validateAllFields(objRow:any)
          {
            if(objRow.maxPeriodTypeKey && objRow.covCatKey  && objRow.cccMaxAmt != ''  && objRow.effectiveOn != ''  
            && objRow.expiredOn != ''){
              return true;
            }
            else{
              return false;
            }
          }
          
          ConvertAmountToDecimal(evt,dataRow)
          {
            if(this.addMode)
            {
              this.arrNewMaximumArray.cccMaxAmt = CustomValidators.ConvertAmountToDecimal(evt.target.value);
            }
            else{
              dataRow.cccMaxAmt  = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
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
                  if (effectiveOn && expiredOn) {
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