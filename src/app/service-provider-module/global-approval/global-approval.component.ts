import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";
import {TranslateService} from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HmsDataServiceService} from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ServiceProviderApi } from '../service-provider-api';
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { Subject } from 'rxjs/Rx';
import { Constants} from '../../common-module/Constants'
import { ServiceProviderService} from '../serviceProvider.service';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
@Component({
  selector: 'app-global-approval',
  templateUrl: './global-approval.component.html',
  styleUrls: ['./global-approval.component.css'],
  providers:[ChangeDateFormatService,TranslateService]
})
export class GlobalApprovalComponent implements OnInit {
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload','T')
  }

  arrTopupMax;
  arrSplDiscType;
  addMode:boolean=false;
  editMode:boolean=false;
  viewMode:boolean = false; 
  selectedRowId = '';
  arrData=[];
  user:string;
  arrNewRow = {
    "procMask": "",
    "effectiveOn": "",
    "expiredOn": "",
  }
  arrgeneralInfo:{
    lastName:'',
    firstName:'',
    participationDate:'',
    govtType:string,
    email:'',
    disciplineName:'',
    languageName:'',
    id:'',
  }
  /* New Empty Record array */
  newRecordValidate:boolean=false;
  
  @Input() cardKey: string;
  @Input() provBillingAddressKey: string;
  @Input() disciplineKey: string;
  @Input() providerKey: string;
  @Input() serviceProviderEditMode : boolean; //set value edit value
  @Input() serviceProviderViewMode : boolean; //set value View value
  @Input() serviceProviderAddMode : boolean; //set value Add value
  
  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any>[] = [];
  @ViewChildren(DataTableDirective)
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  
  myDatePickerOptions = CommonDatePickerOptions.myDatePickerDisableFutureDateOptions;//datepicker Options
  selectedDisciplineKey;
  updateEffectiveRow = []
  updateExpiredRow = []
  currentUser
  serviceProviderChecks = [{
    "addNewProc":'F',
    "editProc":'F',
    "deleteProc":'F',
  }]
  
  constructor(
    private hmsDataServiceService:HmsDataServiceService,
    private changeDateFormatService: ChangeDateFormatService,
    private toastrService: ToastrService,
    private translate:TranslateService,
    private exDialog: ExDialog,
    private router: Router,
    private route: ActivatedRoute,
    private dataTableService: DatatableService,
    private serviceProviderService: ServiceProviderService,
    private currentUserService: CurrentUserService
  ) { 
    this.arrgeneralInfo = {
      lastName:'',
      firstName:'',
      participationDate:'',
      govtType:'',
      email:'',
      disciplineName:'',
      languageName:'',
      id:'',
    }
    serviceProviderService.getProvBillingAddressKey.subscribe(provBillingAddressKey => {
      if(provBillingAddressKey != '')
      {
        this.route.params.subscribe((params: Params) => {
          this.providerKey = params['id']
          this.disciplineKey = params['type']
          if(!this.serviceProviderAddMode){
            this.fillProviderDetails(this.providerKey, this.disciplineKey)
          }
        });
        if(!this.serviceProviderAddMode){
        this.getProviderApprovalList(false);
        }
      }
    })
    serviceProviderService.selectedDisciplineKey.subscribe((value) =>{
      {
        this.selectedDisciplineKey = value
      }
    })
  }
  
  ngOnInit() {
    if(localStorage.getItem('isReload')=='T'){
      this.currentUserService.getUserAuthorization().then(res=>{
      let checkArray = this.currentUserService.authChecks['GLA']
      checkArray.push()
      this.getAuthCheck(checkArray)
      localStorage.setItem('isReload','')
      })
    }else{
      this.currentUserService.getUserAuthorization().then(res=>{
      let checkArray = this.currentUserService.authChecks['GLA']
      checkArray.push()
      this.getAuthCheck(checkArray)
      })
    }
    this.dtOptions['SPGridGA'] = Constants.dtOptionsConfig
    this.dtTrigger['SPGridGA'] = new Subject();
    if(!this.serviceProviderAddMode){    // Screen blinking issues are resolved (point no- 106) fixed by Abhay        
      this.getProviderApprovalList(false);
    }
  }

  getAuthCheck(checkArray) {
    this.currentUser = this.currentUserService.currentUser
    this.route.params.subscribe((params: Params) => {
      this.providerKey = params['id']
      this.disciplineKey = params['type']
      if(!this.serviceProviderAddMode){
      this.fillProviderDetails(this.providerKey, this.disciplineKey)
      }
    });
    this.user=this.currentUser.username
    let userAuthCheck = []
    if(this.currentUser.isAdmin == 'T'){
      this.serviceProviderChecks= [{
          "addNewProc":'T',
          "editProc":'T',
          "deleteProc":'T'
      }]
    }else{
      for (var i = 0; i < checkArray.length; i++) {
        userAuthCheck[checkArray[i].actionObjectDataTag] = checkArray[i].actionAccess
      }
      this.serviceProviderChecks= [{
        "addNewProc":userAuthCheck['GLA188'],
        "editProc":userAuthCheck['GLA189'],
        "deleteProc":userAuthCheck['GLA190'],
    }]
    }
    return this.serviceProviderChecks
  }
  
  getProviderApprovalList(reload)
  {
    var requestedData={
      "disciplineKey":this.disciplineKey,
      "provBillingAddressKey":this.provBillingAddressKey
    }
    this.hmsDataServiceService.postApi(ServiceProviderApi.getProviderApprovalListUrl,requestedData).subscribe(data=>
      {
         if(data){  //  null hmsmassage issue are resolved
        this.arrData = []
        if(data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY")
        {
          this.arrData=data.result;
        }
        if (!$.fn.dataTable.isDataTable('#SPGridGA')) {
          this.dtTrigger['SPGridGA'].next()
        } else {
          this.reloadTable('SPGridGA')
        }
      }else{
        this.arrData = []
      }
      })
      this.addMode = false
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
    }
    
    SaveInfo()
    {
      this.newRecordValidate=true;
      if(this.validateAllFields(this.arrNewRow))
      {
       var userId= this.currentUserService.currentUser.userId
        var requestedData={
          "disciplineKey":this.disciplineKey,
          "userId":userId,
          "provApprKey":0,
          "procMask":this.arrNewRow.procMask,
          "provBillingAddressKey":this.provBillingAddressKey,
          "effectiveOn":this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.effectiveOn),
          "expiredOn":this.changeDateFormatService.convertDateObjectToString(this.arrNewRow.expiredOn),
        }
        this.hmsDataServiceService.postApi(ServiceProviderApi.saveProviderApprovalUrl,requestedData).subscribe(
          data=>{
            if(data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY")
            {
              this.toastrService.success(this.translate.instant('serviceProvider.toaster.record-saved'));
              this.getProviderApprovalList(true);
              this.resetNewRecord();
            }
            else if(data.code == 400 && data.message == "RECORD_ALREADY_EXIST")
            {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.speciality-exist'));
            }
            else if(data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON")
            {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
            }
            else if(data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON")
            {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date'));
            }
          }
        )
        this.resetNewRecord() //Saving multiple entry multiple save button click issue fixed
      }
    }
    
    UpdateInfo(dataRow, idx)
    {
      if(this.validateAllFields(dataRow))
      {
        var userId= this.currentUserService.currentUser.userId
        var requestedData={
          "disciplineKey":this.disciplineKey,
          "userId":userId,
          "provApprKey":dataRow.provApprKey,
          "procMask":dataRow.procMask,
          "provBillingAddressKey":this.provBillingAddressKey,
          "expiredOn":this.changeDateFormatService.convertDateObjectToString(this.updateExpiredRow[idx]),
          "effectiveOn":this.changeDateFormatService.convertDateObjectToString(this.updateEffectiveRow[idx]),
        }
        this.hmsDataServiceService.postApi(ServiceProviderApi.saveProviderApprovalUrl,requestedData).subscribe(
          data=>{
            if(data.code == 200 && data.hmsMessage.messageShort == "RECORD_SAVE_SUCCESSFULLY")
            {
              this.toastrService.success(this.translate.instant('card.toaster.record-update'));
              this.editMode=false;
              this.selectedRowId='';
              this.getProviderApprovalList(true);
              this.resetNewRecord();
            }
            else if(data.code == 200 && data.hmsMessage.messageShort == "RECORD_ALREADY_EXIST")
            {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.speciality-exist'));
            }
            else if(data.code == 400 && data.message == "RECORD_ALREADY_EXIST")
            {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.speciality-exist'));
            }
            else if(data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EXPIRED_ON")
            {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.old-effective-greater-than-expiry'));
            }
            else if(data.code == 400 && data.message == "EFFECTIVEON_SHOULD_BE_GREATER_OLD_EFFECTIVEON")
            {
              this.toastrService.warning(this.translate.instant('serviceProvider.toaster.effective-date'));
            }
          }
        )
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
        this.selectedRowId = dataRow.provApprKey;
      }
    }
    
    validateAllFields(objRow:any)
    {
      if(objRow.procMask != '' && objRow.effectiveOn != '' && objRow.procMask.length==5){
        return true;
      }
      else{
        return false;
      }
    }
    
    resetNewRecord()
    {
      this.addMode=false;
      this.arrNewRow = {
        "procMask": "",
        "effectiveOn": "",
        "expiredOn": "",
      } 
      this.selectedRowId = '';
      this.newRecordValidate=false;
      if (!$.fn.dataTable.isDataTable('#SPGridGA')) {
        this.dtTrigger['SPGridGA'].next()
      } else {
        this.reloadTable('SPGridGA')
      }
    }
    
    /**
    * Cancel Operation
    */
    CancelInfo()
    {
      this.editMode=false;
      this.addMode=false;
      this.selectedRowId = ""
    }
    
    DeleteInfo(dataRow)
    {
      var action="cancel";
      if(dataRow && dataRow.provApprKey)
      {
        action="Delete";
      }
      this.exDialog.openConfirm((this.translate.instant('serviceProvider.global.exDialog.are-you-sure')))
      .subscribe((value) => {
        if(value)
        {
          if(this.addMode)
          {
            this.resetNewRecord();
          }
          else{
            var requestedData={
              "disciplineKey":this.disciplineKey,
              "provApprKey": dataRow.provApprKey
            }
            this.hmsDataServiceService.postApi(ServiceProviderApi.deleteProviderApprovalUrl,requestedData).subscribe(data=>
              {
                if(data.hmsMessage.messageShort == "RECORD_DELETED_SUCCESSFULLY")
                {
                  this.getProviderApprovalList(true);
                }
              })
            } 
          }
        })
      }
      validateMask(evt)
      {
        if(evt.target.value != '' && evt.target.value.length < 5)
        {
          this.toastrService.warning(this.translate.instant('serviceProvider.toaster.proc-mask-id'));
        }
      }
      
      /**Change Input Date Format and Validate It should not be greater than Claim Recieved date and Future date*/
      
      fillProviderDetails(providerKey,selectedDisciplineKey){
        var userId= this.currentUser.userId
        let requiredInfo={
          "provKey":+providerKey,
          "userId":+userId,
          "disciplineKey":+selectedDisciplineKey
        }
        this.hmsDataServiceService.postApi(ServiceProviderApi.getServiceProviderDetailByIdWithoutEligUrl,requiredInfo).subscribe(data =>{
          if(data.code == 200 && data.status == "OK"){
            let details=data.result;
            let govtType = false;
            if(details.provQuikcardInd == 'T')
            {
              govtType = true;
            }
            this.arrgeneralInfo = {
              lastName:details.providerLastName,
              firstName:details.providerFirstName,
              participationDate:details.provParticipationDt,
              govtType:details.provQuikcardInd,
              email:details.provEMailAdd,
              disciplineName:details.disciplineName,
              languageName:details.languageName,
              id:details.provId
            }
          }
        });
      }

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
        }

        CloseModal(){
        }
    }
    