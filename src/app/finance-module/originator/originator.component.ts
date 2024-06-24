import { Observable } from 'rxjs/Rx';
import { FinanceApi } from '../finance-api';
import { Component, OnInit, HostListener} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module'; 
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'
import { RequestOptions, Http, Headers } from '@angular/http';
import { CommonApi } from '../../common-module/common-api'; 

@Component({
  selector: 'app-originator',
  templateUrl: './originator.component.html',
  styleUrls: ['./originator.component.css'],
  providers:[DatatableService,ChangeDateFormatService]
})
export class OriginatorComponent implements OnInit {
  expired=false;
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    localStorage.setItem('isReload','T')
  }
  myDatePickerOptions=CommonDatePickerOptions.myDatePickerOptions
  columns = [];
  ObservableObj;
  showOriginatorList:boolean = false;
  public originatorSearchForm: FormGroup;
  addOriginatorForm:FormGroup;
  addMode:boolean=true;
  viewMode:boolean=false;
  editMode:boolean=false;
  buttonText:string;
  bussTypeKey;
  businessTypeList;
  error:any;
  isOpen:boolean=false
  originatorKey;
  originatorDelKey
  selectedFile: any="";
  fileUpload:boolean=false
  selectedFileName;
  fileSizeExceeds: boolean = false
  allowedValue: boolean = false
  error1:any
  file;
  imageSrcTop;
  imageSrcBottom;
  showLoader:boolean=false
  isTopVal:boolean=false
  isBottomVal:boolean=false
  public businessTypeData:CompleterData;
  public onOpened(isOpen: boolean) {
    this.isOpen = isOpen;
  }
  fileTop:File
  fileBottom:File
  allowedExtensions = ["image/jpg", "image/jpeg", "image/png"]
  originatorArray =  [{
    "addOriginator": 'F',
    "saveOriginator": 'F',
    "editOriginator": 'F',
    "deleteOriginator": 'F',
    "searchOriginator": 'F',
  }]
  currentUser:any;
  constructor(
    private fb: FormBuilder,
    public dataTableService: DatatableService,
    private translate: TranslateService,
    private completerService:CompleterService,
    private hmsDataService:HmsDataServiceService,
    private changeDateFormatService:ChangeDateFormatService,
    private toastrService:ToastrService,
    private exDialog:ExDialog,
    private currentUserService:CurrentUserService
  ) {
    this.error={isError:false, errorMessgage:''}
    this.error1={isError:false,errorMessage:''}
   }

  ngOnInit() {
    if (localStorage.getItem('isReload') == 'T') {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['ORG']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
        localStorage.setItem('isReload', '')
      })
    } else {
      this.currentUserService.getUserAuthorization().then(res => {
        this.currentUser = this.currentUserService.currentUser
        let checkArray = this.currentUserService.authChecks['ORG']
        this.getAuthCheck(checkArray)
        this.dataTableInitialize();
      })
    }
    this.originatorSearchForm = this.fb.group({
      originatorName:['', CustomValidators.alphaNumeric],
      originatorNumber:['']
    })
    this.addOriginatorForm=new FormGroup({
      'originatorNo':new FormControl('',[CustomValidators.onlyNumbers,Validators.required,Validators.maxLength(12)]),
      'originatorName':new FormControl('',[CustomValidators.notEmpty,Validators.maxLength(60),CustomValidators.alphaNumeric]),
      'businessType':new FormControl('',[Validators.required]),
      'defaultDirectory':new FormControl('',[CustomValidators.notEmpty,]),
      'description':new FormControl('',[Validators.maxLength(80),CustomValidators.alphaNumeric,CustomValidators.notEmpty]),
      'effectiveOn':new FormControl('',[Validators.required]),
      'expiredOn':new FormControl('',[]),
      'bankNo':new FormControl('',[Validators.required,Validators.minLength(3),Validators.maxLength(10),CustomValidators.alphaNumeric]),
      'branchNo':new FormControl('',[Validators.required,Validators.minLength(5),Validators.maxLength(10),CustomValidators.alphaNumeric]),
      'accountNo':new FormControl('',[Validators.required,Validators.minLength(7),Validators.maxLength(20)]),
      'recCentreNo':new FormControl('',[Validators.required,Validators.maxLength(15)]),
      'bankName':new FormControl('',[CustomValidators.notEmpty,Validators.maxLength(60),CustomValidators.alphaNumeric]),
      'bankPostalAddress':new FormControl('',[CustomValidators.notEmpty,Validators.maxLength(2000)]),
      'bankMailAddress':new FormControl('',[CustomValidators.notEmpty,Validators.maxLength(2000)]),
      'chqSignTop':new FormControl(''),
      'chqSignBottom':new FormControl(''),
      'chqSignTopFile':new FormControl(''),
      'chqSignBottomFile':new FormControl(''),
    })
    this.getBusinessType()
  }

  ngAfterViewInit(){
    var self= this
    $(document).on('click', '#originatorList .edit-ico', function () {
      var id = $(this).data('id')
      self.originatorKey = id
      self.editOriginator(self.originatorKey)
    })
    $(document).on('click', '#originatorList .del-ico', function () {
      var id = $(this).data('id');
     self.originatorDelKey = id
      self.deleteOriginator(self.originatorDelKey)
    })
    $(document).on('mouseover', '.edit-ico', function(){
      $(this).attr('title', 'Edit');
    })
  }
  
  dataTableInitialize(){
    this.ObservableObj = Observable.interval(1000).subscribe(x => {
      if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
      } else {
        this.columns = [
          { title: this.translate.instant('finance.originator.originatorNo'), data: 'originatorNum' },
          { title: this.translate.instant('finance.originator.originatorBankNo'), data: 'originatorBankNum' }, 
          { title: this.translate.instant('finance.originator.originatorBranchNo'), data: 'originatorBranchNum' },
          { title: this.translate.instant('finance.originator.originatorAccountNo'), data:'originatorAcctNum' },
          { title: this.translate.instant('finance.originator.originatorName'),data: 'originatorName' },
          { title: this.translate.instant('Originator Rec Centre'),data:'originatorRecCentre'},
          { title: this.translate.instant('Business Type'), data: 'businessTypeDesc'},//bussProgramType
          { title: this.translate.instant('finance.originator.originatorDesc'), data: 'originatorDesc' },
          { title: this.translate.instant('finance.originator.defaultDictory'), data: 'origDefDictory' },
          { title: this.translate.instant('finance.originator.effDate'), data: 'effectiveOn' },
          { title: this.translate.instant('finance.originator.expiryDate'), data: 'expiredOn' },
          { title: this.translate.instant('finance.originator.action'), data: 'originatorKey' }]
          this.ObservableObj.unsubscribe();
          this.searchOriginator();
        }
      });
  }

  searchOriginator(){
    this.showOriginatorList = true;
    var reqParam = [
      {'key':'originatorName', 'value':this.originatorSearchForm.value.originatorName},
      {'key':'originatorNum', 'value':this.originatorSearchForm.value.originatorNumber}
    ]
    var Url = FinanceApi.searchOriginatorUrl;
    var tableId = "originatorList"
    if (!$.fn.dataTable.isDataTable('#originatorList')) {
      var tableActions = [
        { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit' ,'showAction':this.originatorArray[0].editOriginator},
        { 'name': 'delete', 'class': 'table-action-btn del-ico', 'icon_class': 'fa fa-trash', 'title': 'Delete' ,'showAction':this.originatorArray[0].deleteOriginator},
      ]
      this.dataTableService.jqueryDataTableForModal(tableId, Url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 11,[9,10],"addOriginator",'','','','','',[1,2,3,4,5,6,7,8,9,10,11])
    } else {
      this.dataTableService.jqueryDataTableReload(tableId, Url, reqParam)
    }
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 'slow');
    return false;
  }

  enableAddMode(){
    this.addOriginatorForm.enable();
    this.addMode=true;
    this.viewMode=false;
    this.editMode=false;
    this.buttonText=this.translate.instant('button.save')
    this.addOriginatorForm.patchValue({
      'defaultDirectory':"/home/hms/deployment/assets/originator_cheque_dir"
    })
    this.addOriginatorForm.controls.defaultDirectory.disable()
    $(document).on('mouseover','#originatorDefDictory',function(){
      var value=$(this).val().toString()
      if(value !=""){
        $(this).attr('title',value)
      }
    })
  }

  enableViewMode(){
    this.viewMode=true;
    this.addMode=false;
    this.editMode=false
  }

  enableEditMode(){
    this.addOriginatorForm.enable();
    this.addMode = false;
    this.viewMode = false;
    this.editMode = true;
    this.buttonText = this.translate.instant('button.update');
    this.addOriginatorForm.patchValue({
      'defaultDirectory':"/home/hms/deployment/assets/originator_cheque_dir"
    })
    this.addOriginatorForm.controls.defaultDirectory.disable();
  }

  submitOriginatorForm(){
    var formData=new FormData();
    let header = new Headers({ 'Authorization': this.currentUserService.token });
    let options = new RequestOptions({ headers: header });
    if(this.imageSrcTop){
      this.fileTop=null//this.imageSrcTop
    }else{
      if(this.addOriginatorForm.value.chqSignTopFile){
        this.fileTop = this.addOriginatorForm.value.chqSignTopFile
      }else{
        this.fileTop=null
      }
    }
    if(this.imageSrcBottom){
      this.fileBottom=null//this.imageSrcBottom
    }else{
      if(this.addOriginatorForm.value.chqSignBottomFile){
        this.fileBottom = this.addOriginatorForm.value.chqSignBottomFile
      }else{
        this.fileBottom=null
      }
    }
    formData.append('businessTypeKey',this.bussTypeKey)
    formData.append('effectiveOn',this.changeDateFormatService.convertDateObjectToString(this.addOriginatorForm.value.effectiveOn))
    formData.append('expiredOn',this.addOriginatorForm.value.expiredOn != null ? this.changeDateFormatService.convertDateObjectToString(this.addOriginatorForm.value.expiredOn) : "")
    formData.append('origDefDictory',this.addOriginatorForm.value.defaultDirectory)
    formData.append('originatorAcctNum',this.addOriginatorForm.value.accountNo)
    formData.append('originatorBankAdd',this.addOriginatorForm.value.bankPostalAddress !=null ? this.addOriginatorForm.value.bankPostalAddress:"")
    formData.append('originatorBankName',this.addOriginatorForm.value.bankName !=null ? this.addOriginatorForm.value.bankName:"")
    formData.append('originatorBankNum',this.addOriginatorForm.value.bankNo)
    formData.append('originatorBranchNum',this.addOriginatorForm.value.branchNo)
    formData.append('originatorDesc',this.addOriginatorForm.value.description != null ? this.addOriginatorForm.value.description:"")
    formData.append('originatorMailAdd',this.addOriginatorForm.value.bankMailAddress !=null ? this.addOriginatorForm.value.bankMailAddress:"")
    formData.append('originatorName',this.addOriginatorForm.value.originatorName != null ? this.addOriginatorForm.value.originatorName : "")
    formData.append('originatorNum',this.addOriginatorForm.value.originatorNo)
    formData.append('originatorRecCentre',this.addOriginatorForm.value.recCentreNo)
    formData.append('originatorRoleKey','2')
    formData.append('chequeSignTop',this.fileTop)
    formData.append('chequeSignBottom',this.fileBottom)
    
    if(this.addOriginatorForm.value.expiredOn == "" || this.addOriginatorForm.value.expiredOn== null ){
      formData.delete('expiredOn')
    }
      if(this.addOriginatorForm.valid){
        var url=FinanceApi.saveUpdateOriginatorUrl
        if(this.addMode){
          if(this.fileTop == null){
            formData.delete('chequeSignTop')
          }
          if(this.fileBottom == null){
            formData.delete('chequeSignBottom')
          }
          this.hmsDataService.sendFormData(url,formData).subscribe(data=>{
            if(data.code == 200 && data.status == "OK"){
              this.toastrService.success(this.translate.instant('finance.toaster.saveOriginatorSuccess'))
              $("#originatorCloseForm").trigger('click');
              this.searchOriginator();
            }else if(data.code == 400 && data.hmsMessage.messageShort =="ORIGINATOR_NUMBER_ALREADY_EXIST"){
              this.toastrService.error(this.translate.instant(this.translate.instant('finance.toaster.originNumAlreadyExist')))
            } 
          })
        }
        if(this.editMode){
          if(this.fileTop == null){
            formData.delete('chequeSignTop')
          }
          if(this.fileBottom == null){
            formData.delete('chequeSignBottom')
          }
          formData.append('originatorKey',this.originatorKey)
          this.hmsDataService.sendFormData(url,formData).subscribe(data=>{
            if(data.code == 200 && data.status == "OK"){
              this.toastrService.success(this.translate.instant('finance.toaster.updateOriginatorSuccess'))
              $("#originatorCloseForm").trigger('click');
              this.searchOriginator();
            }
          })
        }        
      }else{
        this.validateAllFormFields(this.addOriginatorForm)
      }
  }

  editOriginator(id){
    this.showLoader=true;
    this.enableEditMode();
    var url=FinanceApi.getOriginatorDetailsUrl
    var originatorId={"originatorKey":id}
    this.hmsDataService.postApi(url,originatorId).subscribe(data=>{
      if(data.code == 200 && data.status =="OK"){
        this.showLoader=false
        this.bussTypeKey=data.result.businessTypeKey
        this.imageSrcTop=data.result.chequeSignatureTopURL
        if(this.imageSrcTop){
          this.isTopVal=true;
        }
        this.imageSrcBottom=data.result.chequeSignatureBottomURL
        if(this.imageSrcBottom){
          this.isBottomVal=true
        }
        if(data.result.origDefDictory!="" && data.result.origDefDictory!=undefined){
          $(document).on('mouseover','#originatorDefDictory',function(){
            var value=$(this).val().toString()
            if(value !=""){
              $(this).attr('title',value)
            }
          })
        }else{
          $(document).on('mouseover','#originatorDefDictory', function(){
            $(this).removeAttr('title')
          })
        }
        this.addOriginatorForm.patchValue({
          'originatorNo':data.result.originatorNum,
          'originatorName':data.result.originatorName,     
          'businessType':data.result.businessTypeDesc,
          'defaultDirectory':data.result.origDefDictory,     
          'description':data.result.originatorDesc,     
          'effectiveOn':this.changeDateFormatService.convertStringDateToObject(data.result.effectiveOn),
          'expiredOn':this.changeDateFormatService.convertStringDateToObject(data.result.expiredOn),      
          'bankNo':data.result.originatorBankNum,
          'branchNo':data.result.originatorBranchNum,
          'accountNo':data.result.originatorAcctNum,
          'recCentreNo':data.result.originatorRecCentre,
          'bankName':data.result.originatorBankName,   
          'bankPostalAddress':data.result.originatorBankAdd, 
          'bankMailAddress':data.result.originatorMailAdd,  
          'chqSignTop':data.result.chequeSignatureTopURL,   
          'chqSignBottom':data.result.chequeSignatureBottomURL
         }) 
      }
    })
  }

  deleteOriginator(id){
    this.exDialog.openConfirm(this.translate.instant(this.translate.instant('finance.toaster.deleteConfirmation'))).subscribe((value) => {
      if(value){
        let RequestData={
          "originatorKey":id
        }
        this.hmsDataService.postApi(FinanceApi.deleteOriginatorUrl,RequestData).subscribe(data=>{
          if(data.code == 200 && data.status == "OK"){
            this.toastrService.success(this.translate.instant(this.translate.instant('finance.toaster.deleteOriginatorSuccess')))
            this.searchOriginator();
          }
        })
      }
    });
  }
  
  getBusinessType(){
    var url = FinanceApi.getBusinessTypeUrl
    this.hmsDataService.getApi(url).subscribe(data =>{
      if(data.code == 200 && data.status =="OK"){
        this.businessTypeList = data.result;
        this.businessTypeData = this.completerService.local(
          this.businessTypeList,
          "businessTypeDesc",
          "businessTypeDesc"
        );
      }
    })
  }

  onSelectedBusinessType(selected:CompleterItem){
    if(selected){
      this.bussTypeKey=selected.originalObject.businessTypeKey.toString();
    }
  }

  onFileChanged(event,frmControlName){
    this.selectedFile = event.target.files[0]
    if(this.selectedFile){
      this.selectedFileName = this.selectedFile.name
      if(frmControlName == "chqSignTop") {
        this.isTopVal=true
        this.addOriginatorForm.controls['chqSignTop'].setValue(this.selectedFileName)
        if(this.editMode){
          this.imageSrcTop =""
        } 
      }
      if(frmControlName == "chqSignBottom") {
        this.isBottomVal=true
        this.addOriginatorForm.controls['chqSignBottom'].setValue(this.selectedFileName)
        if(this.editMode){
          this.imageSrcBottom =""
        } 
      }
      var fileSize = this.selectedFile.size;
      if (fileSize > 1048576) {
        this.addOriginatorForm.controls[frmControlName].setErrors({
          "fileSizeExceeds": true
        });
        return;
      }
      this.allowedValue = this.allowedExtensions.includes(this.selectedFile.type)
      if (!this.allowedValue) {
        this.addOriginatorForm.controls[frmControlName].setErrors({
          "fileTypeNotAllowed": true
        });
      }
      if(frmControlName == "chqSignTop"){
        this.addOriginatorForm.controls['chqSignTopFile'].setValue(this.selectedFile)
      }
      if(frmControlName == "chqSignBottom"){
        this.addOriginatorForm.controls['chqSignBottomFile'].setValue(this.selectedFile)
      }
    }else{
      return
    }
  }

  changeDateFormat(event, frmControlName, formName, currentDate = false) {
    if (event.reason == 2 && currentDate == true && (event.value == null || event.value == '')) {
      var validDate = this.changeDateFormatService.getToday();
      var ControlName = frmControlName;
      var datePickerValue = new Array();
      datePickerValue[ControlName] = validDate;
      this.addOriginatorForm.patchValue(datePickerValue);
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
      this.addOriginatorForm.patchValue(datePickerValue);
      this.expired =this.changeDateFormatService.isFutureNonFormatDate(obj.date.day+"/"+ obj.date.month+"/"+obj.date.year);
    }
    else if (event.reason == 1 && currentDate == false && (event.value != null && event.value != '')){
      this.expired=this.changeDateFormatService.isFutureFormatedDate(event.value);
    }
    else if (event.reason == 2 && currentDate == false && (event.value == null || event.value == '')) {
      var obj = this.changeDateFormatService.changeDateFormat(event);
      var self = this
      if (obj == null) {
        var ControlName = frmControlName;
        var datePickerValue = new Array();
        datePickerValue[ControlName] = obj;
        this.addOriginatorForm.patchValue(datePickerValue);
      }
    }
    if (this.addOriginatorForm.value.effectiveOn && this.addOriginatorForm.value.expiredOn) {
      this.error = this.changeDateFormatService.compareTwoDates(this.addOriginatorForm.value.effectiveOn.date, this.addOriginatorForm.value.expiredOn.date);
      if (this.error.isError == true) {
        this.addOriginatorForm.controls['expiredOn'].setErrors({
          "ExpiryDateNotValid": true
        });
      }
    }
  }

  clearOriginatorSearch(){
    this.originatorSearchForm.reset();
    this.searchOriginator(); 
  }

   /* Method for validate the Form fields */
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

  resetOriginatorForm(){
    this.addOriginatorForm.reset();
    this.isTopVal=false
    this.isBottomVal=false
  }

  uploadFile(){
     if (this.allowedValue && !this.fileSizeExceeds) {
    } else {
      return false
    }
  }

  removeExtension(type) {
    if(type == "top") {
      this.isTopVal=false
      this.addOriginatorForm.controls['chqSignTop'].setValue("")
      this.addOriginatorForm.controls['chqSignTopFile'].setValue("")
      if(this.editMode){
        this.imageSrcTop =""
      } 
    }
    if(type == "bottom") {
      this.isBottomVal=false
      this.addOriginatorForm.controls['chqSignBottom'].setValue("")
      this.addOriginatorForm.controls['chqSignBottomFile'].setValue("")
      if(this.editMode){
        this.imageSrcBottom =""
      } 
    }
  }

  getBankName(event,event1){
    var url=CommonApi.getBankDetailsUrl
    var bankNo=event.value
    var branchNo=event1.value
    let ReqData={
      "bankNum" : bankNo,
      "branchNum" : branchNo
    }
    if(bankNo && branchNo !=""){
      this.hmsDataService.postApi(url,ReqData).subscribe( data =>{
        if(data.code== 200 && data.status == "OK"){
          this.addOriginatorForm.patchValue({
            'bankName': (data.result[0].bankName).trim()
          })
        }else{
          this.addOriginatorForm.patchValue({
            'bankName': ''
          })
        }
      })
    }
  }

  getAuthCheck(claimChecks) {
    let authCheck = []
    if (this.currentUser.isAdmin == 'T') {
      this.originatorArray = [{
        "addOriginator": 'T',
        "saveOriginator": 'T',
        "editOriginator": 'T',
        "deleteOriginator": 'T',
        "searchOriginator": 'T'
      }]
    } else {
      for (var i = 0; i < claimChecks.length; i++) {
        authCheck[claimChecks[i].actionObjectDataTag] = claimChecks[i].actionAccess
      }
      this.originatorArray = [{
        "addOriginator": authCheck['ORG310'],
        "saveOriginator": authCheck['ORG312'],
        "editOriginator": authCheck['ORG313'],
        "deleteOriginator": authCheck['ORG314'],
        "searchOriginator": authCheck['ORG311']
      }]
    }
    return this.originatorArray
  }
  focusNextEle(event,id){
    $('#'+id).focus(); 
  }
}