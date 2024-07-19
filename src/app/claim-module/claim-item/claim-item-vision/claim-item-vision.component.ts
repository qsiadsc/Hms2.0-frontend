import { Component, OnInit, ViewChild, Inject, ViewChildren, Input, EventEmitter, Output, SimpleChange, OnChanges } from '@angular/core';
import { CommonDatePickerOptions } from '../../../common-module/Constants';
import { IMyInputFocusBlur } from 'mydatepicker';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { ClaimApi } from '../../claim-api'
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { TranslateService } from '@ngx-translate/core';
import { ClaimService } from '../../claim.service';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { debug } from 'util';
import { Constants } from '../../../common-module/Constants';
import { Subject } from 'rxjs/Subject';
import { trigger } from '@angular/core/src/animation/dsl';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-claim-item-vision',
  templateUrl: './claim-item-vision.component.html',
  styleUrls: ['./claim-item-vision.component.css'],
  providers: [ChangeDateFormatService, TranslateService]
})
export class ClaimItemVisionComponent implements OnInit, OnChanges {

  @Input() CHRecievedDate: any;
  @Input() ClaimId: string;
  @Input() DisciplineKey: any;
  @Input() ClaimAddMode: boolean;
  @Input() ClaimViewMode: boolean;
  @Input() ClaimEditMode: boolean;
  @Output() ClaimItemInsert = new EventEmitter();
  @Input() claimItemAuth: any;
  @Input() claimStatus: any;
  @Input() claimRefered: boolean;
  @Input() resetForm: any;
  @Input() cardBusinessTypeKey: any;
  newClaimItems = [];
  /* data array for grid  */
  arrClaimItems = [];
  selectedClaim = []
  oldProCode = '';
  dtOptions: DataTables.Settings = {};
  dtTrigger;
  contactHistorytableData
  addMode: boolean = false;
  editMode: boolean = false;
  viewMode: boolean = false; //Enable true after a new claim added
  showLoader: boolean;
  unsubOldRequest: any;
  editSaveColoumnMode = '';
  claimItemIndex = 0;
  /* Dropdown data array */
  arrOverrideTypes: any;
  /* Selected data array */
  diff;
  /* New Empty Record array */
  newRecordValidate: boolean = false;
  selectedClaimType;
  cobVal
  arrNewClaimItem = {
    "id": "",
    "Rv": "",
    "date": "",
    "pro": "",
    "feeClaim": "",
    "feeAllow": "",
    "feePaid": "",
    "labClaim": "",
    "labPaid": "",
    "carrier": null,
    "Deduct": "",
    "totalPaid": "",
    "diff": "0.00",
    "orverideType": null,
    "orverideText": "",
    "itemDin": "test",
    "cob2": null
  };
  selectedRowId = '';
  isToothRequired: boolean = false;
  isSuffRequired: boolean = false;
  hasCrdHolder: boolean = false
  cardHolderRecieveDate
  currentUser: any;
  isDasp: any;
  preAuthReverseClaim: boolean = false;
  copyMode: boolean = false;
  duplicateClaimItems: any[];
  duplicateClaimData: any;
  @Input()
  cardholderKey: any;
  businessType: any;
  selectedClaimTypeKey: any;
  AdjudicateCheckVission: boolean;
  claimItems: any;
  lockClaimItemVisStr: string
  showZero: boolean = true;
  isMobileCopy: boolean= false;
  isDisableBtn: boolean;
  @Input() claimTypeKey:any
  isVisClaimItem: Subscription
  claimItemData = []
  constructor(private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private _hotkeysService: HotkeysService,
    private claimService: ClaimService,
    private currentUserService: CurrentUserService,
    private route: ActivatedRoute,
    private router: Router) {
    this._hotkeysService.add(new Hotkey('shift+n', (event: KeyboardEvent): boolean => {
      if (!this.ClaimViewMode) {
        this.AddNew()
      }
      return false; // Prevent bubbling
    }));

    this.claimService.checkVisiontable.subscribe(value => {
      setTimeout(() => {
        this.onlySingle()
      }, 300);
    });
    claimService.hasCardHolder.subscribe(value => {
      if (value) {
        this.hasCrdHolder = true
      }
    })
    claimService.getClaimType.subscribe(value => {
      this.selectedClaimType = value;
    })
    claimService.getCOB.subscribe(value => {
      this.cobVal = value
    })
    claimService.getRecieveDate.subscribe(value => {
      if (value) {
        this.cardHolderRecieveDate = this.changeDateFormatService.convertDateObjectToString(value)
      }
    })
    currentUserService.loggedInUserVal.subscribe(val => {
      this.currentUser = val
    })
    claimService.isDasp.subscribe(res => {
      this.isDasp = res
    })
    claimService.getDisciplineType.subscribe(value => {
      this.getOverrideType();
    })
    claimService.getOverideCheck.subscribe(val => {
      if (val) {
        this.getOverrideType();
      }
    })

    this.claimService.claimBussinessKey.subscribe(val => {
      this.cardBusinessTypeKey = val;
    })

    this.claimService.cardHolderKey.subscribe(val => {
      this.cardholderKey = val;
    })

    this.claimService.claimBussinessKey.subscribe(val => {
      this.businessType = val;
    })
    this.claimService.selectedClaimTypeKeyData.subscribe(value => {
      this.selectedClaimTypeKey = value
    })

    /* Lock Processor Functionality*/
    claimService.getLockedMessage.subscribe(val => {
      this.lockClaimItemVisStr = val
    })
    this.isVisClaimItem = claimService.mobilClaimItem.subscribe(data => {
      this.cardHolderRecieveDate = data['receivedDate'];
      this.isMobileCopy = true
    })
  }
  
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "resetForm" && !changedProp.firstChange) {
        this.arrClaimItems = [];
        this.newClaimItems = [];
      }
    }
  }


  /** Get Override Type List and Claim Item List for GRId */
  ngOnInit() {
    this.dtOptions['claimItemsTable'] = Constants.dtOptionsSortingConfigClaimHistory
    setTimeout(() => {
      this.getOverrideType();
    }, 500);
    this.getClaimItems();
    var self = this
    if (this.route.snapshot.url[0]) {
      this.route.params.subscribe((params: Params) => {
        if (this.route.snapshot.url[4]) {
          if (this.route.snapshot.url[4].path == 'preAuth') {
            this.preAuthReverseClaim = true
          } else {
            this.preAuthReverseClaim = false
          }
        }
      })
    }
    if (this.route.snapshot.url.length > 0 && this.route.snapshot.url[0].path == "copy") {
      this.route.params.subscribe((params: Params) => {
        this.copyMode = true
      })
    }
    // General Feedback: Button should be enabled after Intiate claim button as discussed with Arun sir
    if (this.router.url.indexOf("/claim?fileReference") > -1) {
      this.isDisableBtn = false
    } else {
      this.isDisableBtn = true
    }
  }
  AddNewMobile(data) {
    this.resetNewRecord();
    if (!this.editMode) {
      this.addMode = true;
    }
    this.claimItemIndex = 0;
    this.claimService.disableSave.emit(true); // General Feedback-All button should be enabled not disabled in initiate Claim as discussed with Arun Sir
    if (this.arrOverrideTypes) {
      var selectedOverride = this.arrOverrideTypes.find(x => x.overrideTypeDesc == "No Override");
    }
    if (selectedOverride) {
      this.arrNewClaimItem.orverideType = selectedOverride.overrideTypeKey;
      this.arrNewClaimItem.orverideText = selectedOverride.overrideTypeDesc;
    }
    this.arrNewClaimItem.date = this.changeDateFormatService.changeDateByMonthName(data['serviceDate'])
    this.arrNewClaimItem.feeClaim = CustomValidators.ConvertAmountToDecimal(data['claimAmount'])
    this.arrNewClaimItem.carrier = CustomValidators.ConvertAmountToDecimal(data['cobAmount'])
    if (data['procId'] && data['procId'] != null && data['procId'] != undefined && data['procId'] != 'null' && data['procId'] != 'undefined') {
      this.arrNewClaimItem.pro = data['procId'];
    } else {
      this.arrNewClaimItem.pro = ''
    }
  }
  /** Add Empty Row For New Claim Item */
  AddNew() {
    this.cobVal = this.claimService.cobVal;
    var recieve_date = $('#receive_date input').val();
    let claimType = $('#claimType').val().toString().trim()

    this.resetNewRecord();
    if (!this.editMode) {
      this.selectedRowId = '';
      this.addMode = true;
      var selectedOverride = this.arrOverrideTypes.find(x => x.overrideTypeDesc == "No Override");
      if (selectedOverride) {
        this.arrNewClaimItem.orverideType = selectedOverride.overrideTypeKey;
        this.arrNewClaimItem.orverideText = selectedOverride.overrideTypeDesc;
      }
      if (this.arrClaimItems.length > 0) {
        let lastRow = this.arrClaimItems.length - 1
        this.arrNewClaimItem.date = this.changeDateFormatService.changeDateByMonthName(this.arrClaimItems[lastRow]['date'])
        setTimeout(function () {
          var txtPro = <HTMLInputElement>document.getElementById('txtPro');
          txtPro.focus();
        }, 100);
      }
      else if (this.businessType == '1') {

        if (this.businessType == '1' && claimType == "Pre-Authorization - Paper") {
          let date = $('#dateEntryDate input').val() || ''
          this.arrNewClaimItem.date = this.changeDateFormatService.formatDate(date);
          setTimeout(function () {
            var txtClaimDate = <HTMLInputElement>document.getElementById('txtClaimDate');
            txtClaimDate.focus();
          }, 100);
        }

        if (this.ClaimAddMode && (this.arrNewClaimItem.date == '' || this.arrNewClaimItem.date == null || this.arrNewClaimItem.date == undefined)) {
          setTimeout(function () {
            var txtClaimDate = <HTMLInputElement>document.getElementById('txtClaimDate');
            txtClaimDate.focus();
          }, 100);
        } else {
          setTimeout(function () {
            var txtPro = <HTMLInputElement>document.getElementById('txtPro');
            txtPro.focus();
          }, 100);
        }
      } else if (this.cardBusinessTypeKey == 2 && this.selectedClaimTypeKey != 17) { // for  796
        if (this.ClaimAddMode && (this.arrNewClaimItem.date == '' || this.arrNewClaimItem.date == null || this.arrNewClaimItem.date == undefined)) {
          this.arrNewClaimItem.date = this.changeDateFormatService.changeDateByMonthName(recieve_date)
          setTimeout(function () {
            var txtClaimDate = <HTMLInputElement>document.getElementById('txtClaimDate');
            txtClaimDate.focus();
          }, 100);
        } else {
          setTimeout(function () {
            var txtPro = <HTMLInputElement>document.getElementById('txtPro');
            txtPro.focus();
          }, 100);
        }
      }

    }
    this.claimItemIndex = 0;
    this.claimService.disableSave.emit(true)
  }

  /** Autofill Suff / Tooth / CNT based on Procode */
  onProCodeChange(proCode, idx, actionType) {
    let procedureCode = proCode
    let procString = proCode.toString();
    procString.replace(/\s/g, "");
    if (this.addMode) {
      if (procString.length == 4) {
        let procId = "0" + procString
        procedureCode = procId
        this.arrNewClaimItem.pro = '';
        this.arrNewClaimItem.pro = procedureCode;
      }
      else if (procString.length == 3) {
        let procId = "00" + procString
        procedureCode = procId
        this.arrNewClaimItem.pro = '';
        this.arrNewClaimItem.pro = procedureCode;
      }
      else if (procString.length == 2) {
        let procId = "000" + procString
        procedureCode = procId
        this.arrNewClaimItem.pro = '';
        this.arrNewClaimItem.pro = procedureCode;
      }
      else if (procString.length == 1) {
        let procId = "0000" + procString
        procedureCode = procId
        this.arrNewClaimItem.pro = '';
        this.arrNewClaimItem.pro = procedureCode;
      }
    }
    else {    //QA Changes(Need for edit mode also)
      if (procString.length == 4) {
        let procId = "0" + procString
        procedureCode = procId
        this.arrClaimItems[idx].pro = '';
        this.arrClaimItems[idx].pro = procedureCode;
      }
      else if (procString.length == 3) {
        let procId = "00" + procString
        procedureCode = procId
        this.arrClaimItems[idx].pro = '';
        this.arrClaimItems[idx].pro = procedureCode;
      }
      else if (procString.length == 2) {
        let procId = "000" + procString
        procedureCode = procId
        this.arrClaimItems[idx].pro = '';
        this.arrClaimItems[idx].pro = procedureCode;
      }
      else if (procString.length == 1) {
        let procId = "0000" + procString
        procedureCode = procId
        this.arrClaimItems[idx].pro = '';
        this.arrClaimItems[idx].pro = procedureCode;
      }
    }

    if (actionType == '1' && proCode != '') {
      if (this.oldProCode != proCode) {

        let RequestedData = {}
        let submitType = this.getSubmitParam(this.DisciplineKey)
        RequestedData[submitType] = {
          "itemProcedureCd": procedureCode
        }
        this.hmsDataService.postApi(ClaimApi.checkProcIdAndCountUrl, RequestedData).subscribe(data => {
          if (data.hmsMessage.messageShort == "INVALID_PROC_ID") {
            this.oldProCode = '';
            this.toastrService.warning(this.translate.instant('claims.claims-toaster.invalid-procode'))
          }
          else {
            this.oldProCode = proCode;
          }
        }, (error) => {
        });
      }
    }
  }

  /**
  * Get Submit Param for Save Claim Added 
  */
  getSubmitParam(disciplineType) {
    switch (disciplineType.toString()) {
      case '1':
        return "dentalClaim"

      case '2':
        return "visionClaimItems"

      case '3':
        return "healthClaimItems"

      case '4':
        return "drugClaimItems"

      case '5':
        return "hsaClaimItems"

      case '6':
        return "wellnessClaimItems"
    }
  }

  /** Add New Claim Item */
  SaveInfo(id) {
    let promise = new Promise((resolve, reject) => {
      this.newRecordValidate = true;
      var userId = localStorage.getItem('id');
      let submitType = this.getSubmitParam(this.DisciplineKey)
      if (this.selectedClaimType == 33) {
        this.claimService.setClaimType.emit(true)
      }
      if (id == 1 || id == 4) {
        if (this.arrNewClaimItem.pro == "") {
          this.CancelInfo((this.arrClaimItems.length + 1), this.arrNewClaimItem, 1, false);
          this.claimService.disableSave.emit(false)
          setTimeout(() => {
            $('#adjudicatebutton').focus();
          }, 200);
          if (id == 4) {
            this.AdjudicateCheckVission = true;
            $("#adjudicatebutton").click();
          } else {
            this.AdjudicateCheckVission = false;
          }
        }
      }
      var arrLengthClaimCol = 0;
      if (this.arrClaimItems.length > 0) {
        arrLengthClaimCol = this.arrClaimItems.length;
      }
      if (this.validateAllFields(this.arrNewClaimItem, arrLengthClaimCol)) {
        let RequestedData = {}
        var cob1Val;
        var cob2Val;
        if (this.arrNewClaimItem.carrier == "") {
          cob1Val = null
        }
        else {
          cob1Val = this.arrNewClaimItem.carrier
        }
        if (this.arrNewClaimItem.cob2 == "") {
          cob2Val = null
        }
        else {
          cob2Val = this.arrNewClaimItem.cob2
        }
        if (this.DisciplineKey == 5) {
          RequestedData[submitType] = {
            "claimKey": +this.ClaimId,
            "itemProcedureCd": this.arrNewClaimItem.pro,
            "itemServiceDt": this.changeDateFormatService.formatDate(this.arrNewClaimItem.date),
            "overrideTypeKey": +this.arrNewClaimItem.orverideType,
            "itemCarrierAmt": cob1Val,
            "itemFeeClaimAmt": +this.arrNewClaimItem.feeClaim,
            "itemFeePaidAmt": +this.arrNewClaimItem.feePaid,
            "itemTotalPaidAmt": +this.arrNewClaimItem.totalPaid,
            "itemLabClaimAmt": +this.arrNewClaimItem.labClaim,
            "itemLabPaidAmt": +this.arrNewClaimItem.labPaid,
            "itemDin": "test",
            "userId": +userId,
            "itemCarrierAmt2": cob2Val
          }
        }
        else {
          RequestedData[submitType] = {
            "claimKey": +this.ClaimId,
            "itemProcedureCd": this.arrNewClaimItem.pro,
            "itemServiceDt": this.changeDateFormatService.formatDate(this.arrNewClaimItem.date),
            "drugCoverageKey": 1,
            "overrideTypeKey": +this.arrNewClaimItem.orverideType,
            "itemCarrierAmt": cob1Val,
            "itemDeductAmt": +this.arrNewClaimItem.Deduct,
            "itemFeeAllowAmt": +this.arrNewClaimItem.feeAllow,
            "itemFeeClaimAmt": +this.arrNewClaimItem.feeClaim,
            "itemFeePaidAmt": +this.arrNewClaimItem.feePaid,
            "itemTotalPaidAmt": +this.arrNewClaimItem.totalPaid,
            "itemDin": "test",
            "userId": +userId,
            "itemCarrierAmt2": cob2Val
          }
        }

        if (this.ClaimEditMode || this.ClaimViewMode) {
          //for savebutton and tab click
          if (id == 0 || id == 1) {
            var claimItemRequest = [];
            const data = {
              procCode: this.arrNewClaimItem.pro,
              serviceDate: this.changeDateFormatService.formatDate(this.arrNewClaimItem.date)
            }
            claimItemRequest.push(data);

            const submitData = {
              disciplineKey: this.DisciplineKey,
              cardholderkey: this.cardholderKey,
              claimKey: 0,
              claimItem: claimItemRequest
            }
            this.saveClaimItemRequest(RequestedData, id, resolve);      
          } else {
            this.saveClaimItemRequest(RequestedData, id, resolve);
          }
        }
        else {

          if (id == 0 || id == 1) {

            var claimItemRequest = [];
            const data = {
              procCode: this.arrNewClaimItem.pro,
              serviceDate: this.changeDateFormatService.formatDate(this.arrNewClaimItem.date)
            }
            claimItemRequest.push(data);

            const submitData = {
              disciplineKey: this.DisciplineKey,
              cardholderkey: this.cardholderKey,
              claimKey: 0,
              claimItem: claimItemRequest
            }
            this.saveClaimItemLocally(RequestedData, submitType, resolve, id);
          } else {
            this.saveClaimItemLocally(RequestedData, submitType, resolve, id);
          }
        }
      }
    });
    return promise;
  }

  saveClaimItemLocally(RequestedData, submitType, resolve, id) {
    this.claimService.emitOnSaveClaimItem.emit("true");
    this.addMode = false;
    this.arrClaimItems.push(
      {
        "id": this.arrClaimItems.length + 1,
        "Rv": "",
        "claimKey": '',
        "itemKey": '',
        "date": this.arrNewClaimItem.date,
        "pro": this.arrNewClaimItem.pro,
        "tooth": '',
        "toothText": '',
        "feeClaim": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.feeClaim),
        "feeAllow": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.feeAllow),
        "feePaid": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.feePaid),
        "labClaim": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.labClaim),
        "labPaid": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.labPaid),
        "carrier": this.arrNewClaimItem.carrier != "" ? CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.carrier) : '',
        "Deduct": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.Deduct),
        "totalPaid": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.totalPaid),
        "itemRejectedInd": 'F',
        "diff": this.diff,
        "orverideType": this.arrNewClaimItem.orverideType,
        "orverideText": this.arrNewClaimItem.orverideText,
        "cob2": this.arrNewClaimItem.cob2 != "" ? CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.cob2) : '',
      }
    )

    this.claimService.getClaimItemsVission.emit(true)
    var ClaimItems = this.arrNewClaimItem;
    this.newClaimItems.push(RequestedData[submitType]);
    this.resetNewRecord();
    this.ClaimItemInsert.emit(this.newClaimItems);
    this.toastrService.success(this.translate.instant('claims.claims-toaster.claim-item-saved-successfully'));
    if (id == 0) {
      this.AddNew();
    }
    else if (id == 1) {
      this.claimService.disableSave.emit(false)
      setTimeout(() => {
        $('#adjudicatebutton').focus();
      }, 200);
    }
    else if (id == 2) {
      var arrLength = this.arrClaimItems.length - 2;
      this.EditInfo(arrLength, this.arrClaimItems[arrLength], false).then(row => {
        setTimeout(() => {
          var txtPro = <HTMLInputElement>document.getElementById(this.editSaveColoumnMode + arrLength);
          txtPro.focus();
        }, 300);
      });
    }
    else if (id == 4) {
      setTimeout(() => {
        $('#adjudicatebutton').focus();
      }, 200);
    }
    resolve();
  }

  saveClaimItemRequest(RequestedData, id, resolve) {
    this.hmsDataService.postApi(ClaimApi.saveClaimItemsUrl, RequestedData).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.claimService.emitOnSaveClaimItem.emit("true")
        this.toastrService.success(this.translate.instant('claims.claims-toaster.claim-item-saved-successfully'))
        this.resetNewRecord();
        this.claimStatus = 'Pending';
        this.claimService.claimStatus.emit(this.claimStatus)
        this.getClaimItems().then(row => {
          if (id == 0) {
            this.AddNew();
          }
          else if (id == 1) {
            this.claimService.disableSave.emit(false)
            setTimeout(() => {
              $('#adjudicatebutton').focus();
            }, 200);
          }
          else if (id == 2) {
            var arrLength = this.arrClaimItems.length - 2;
            this.EditInfo(arrLength, this.arrClaimItems[arrLength], false).then(row => {
              setTimeout(() => {
                var txtPro = <HTMLInputElement>document.getElementById(this.editSaveColoumnMode + arrLength);
                txtPro.focus();
              }, 300);
            });
          } else if (id == 3) {
            var arrLength = this.arrClaimItems.length - 1;
            this.EditInfo(arrLength, this.arrClaimItems[arrLength], false);
          }
          else if (id == 4) {
            setTimeout(() => {
              $('#adjudicatebutton').focus();
            }, 200);
          }
        });
      }
      else if (data.code == '400' && data.hmsMessage.messageShort == 'RECORD_UPDATE_FAILED') {
        this.toastrService.error("DASP Exception 1 override is only allowed in Preauth By Review claim");
      }
      else if (data.code == '400' && data.hmsMessage.messageShort == 'OVERRIDE_TYPE_IS_NOT_ALLOWED') {
        this.toastrService.error("Override Type Is Not Allowed");
      }
      else if (data.code == '400' && data.hmsMessage.messageShort == 'INTERNAL_SERVER_ERROR') {
        this.toastrService.error("Internal Server Error");
      } else if (data.code == '400' && data.hmsMessage.messageShort == 'SERVICE_DATE_CANNOT_BE_GREATER_THAN_RECEIVE_DATE') {
        $('.dataTables_processing').hide();
        this.toastrService.error("Receive Date Cannot Be Less Than Claim Item Service Date")
      }
      resolve();
    }, (error) => {
    })
  }

  onEnterSaveInfo(id) {
    this.SaveInfo(0);
  }

  OnEnterPress(idx, dataRow, updateOnEnter) {
    this.UpdateInfo(idx, dataRow).then(row => {
      this.AddNew();
    });
  }
  test() {
    this.exDialog.openMessage("Other claim(s) exist for this patient/service date combination displaying them now..."
      , "Warning", "warning").subscribe((checked) => {
      })
  }
  checkDuplicate(i = null, $event = null) {

    var claimItemRequest = [];
    let procId = this.arrNewClaimItem.pro;
    if ($event) {
      procId = $event.target.value
    }
    let dateId = '#txtClaimDate'
    let date: any;
    date = this.arrNewClaimItem.date;
    if (i != null) {
      dateId = '#txtClaimDate' + i
      date = $(dateId).val()
    }
    const data = {
      procCode: procId,
      serviceDate: this.changeDateFormatService.formatDate(date)
    }
    claimItemRequest.push(data);

    const submitData = {
      disciplineKey: this.DisciplineKey,
      cardholderkey: this.cardholderKey,
      claimKey: +this.ClaimId,
      claimItem: claimItemRequest
    }
    //added for log 833
    this.hmsDataService.postApi(ClaimApi.duplicateClaimItemList, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK" && data.result.claimItems && data.result.claimItems.length > 0) {
        this.exDialog.openMessage("Other claim(s) exist for this patient/service date combination displaying them now..."
          , "Warning", "warning").subscribe((checked) => {
            setTimeout(() => {
              $('#openClaimList').trigger('click');
            }, 220);
            if (this.DisciplineKey == 2) {
              this.claimItems = data.result.claimDtoList;

            } else if (this.DisciplineKey == 3) {
              this.claimItems = data.result.healthClaimDtoList;
            } else if (this.DisciplineKey == 5) {
              this.claimItems = data.result.claimDtoList;
            } else if (this.DisciplineKey == 4) {
              this.claimItems = data.result.drugClaimDtoList;
            } else if (this.DisciplineKey == 6) {
              this.claimItems = data.result.claimDtoList;
            }
          })
      } else {
      }
    }, (error) => {
    });
  }

  openClaim(claimItem) {
    this.duplicateClaimItems = claimItem.items;
    if (this.DisciplineKey == 2) {
      this.duplicateClaimData = claimItem;
    } else if (this.DisciplineKey == 3) {
      this.duplicateClaimData = claimItem;
    } else if (this.DisciplineKey == 5) {
      this.duplicateClaimData = claimItem;
    } else if (this.DisciplineKey == 4) {
      this.duplicateClaimData = claimItem;
    } else if (this.DisciplineKey == 6) {
      this.duplicateClaimData = claimItem;
    }
    let val = $('#showClaimItems').attr('style');
    var n = val.indexOf("padding-right");
    if (n != -1) {
      var res = val.slice(n);
      if (res == "padding-right: 17px;") {
        $('#showClaimItems').attr('style', 'display: block; padding-right: 5px;')
      } else {
        $('#showClaimItems').attr('style', 'display: block; padding-right: 14px;')
      }
    }

    localStorage.setItem("claimId", claimItem.claimKey)
    localStorage.setItem("cclaimItem", JSON.stringify(claimItem))
    localStorage.setItem("cardholderKey", claimItem.cardholderKey)
    localStorage.setItem("disciplineKey", claimItem.disciplineKey)
    setTimeout(() => {
      $('#getallComments').trigger("click")
    }, 300);

    document.getElementById('btnshowduplicateitemOther').click();
    let unsubDuplicateRequest = this.claimService.openDuplicateDialog.subscribe(value => {
      if (value) {
      } else {
      }
      unsubDuplicateRequest.unsubscribe();
    })
  }
  /**
  * Update Claim Row Item 
  * @param idx 
  * @param dataRow 
  */
  UpdateInfo(idx, dataRow) {
    let promise = new Promise((resolve, reject) => {
      if (this.selectedClaimType == 33) {
        this.claimService.setClaimType.emit(true)
      }
      if (this.validateAllFields(dataRow, idx)) {
        let submitType = this.getSubmitParam(this.DisciplineKey)
        var userId = localStorage.getItem('id')
        let RequestedData = {}
        var feeClaimValue
        if (dataRow.feeClaim == "") {
          feeClaimValue = '';
        } else {
          feeClaimValue = +dataRow.feeClaim
        }

        var cob1Val;
        var cob2Val;
        if (dataRow.carrier == "" || dataRow.carrier == undefined) {
          cob1Val = null
        }
        else {
          cob1Val = dataRow.carrier
        }
        if (dataRow.cob2 == "" || dataRow.cob2 == undefined) {
          cob2Val = null
        }
        else {
          cob2Val = dataRow.cob2
        }
        if (this.DisciplineKey == 5) {
          RequestedData[submitType] = {
            "itemKey": dataRow.id,
            "claimKey": dataRow.claimKey,
            "itemProcedureCd": dataRow.pro,
            "itemServiceDt": this.changeDateFormatService.formatDate(dataRow.date),
            "overrideTypeKey": +dataRow.orverideType,
            "itemCarrierAmt": cob1Val,
            "itemFeeClaimAmt": feeClaimValue,
            "itemLabClaimAmt": +dataRow.labClaim,
            "itemLabPaidAmt": +dataRow.labPaid,
            "itemFeePaidAmt": +dataRow.feePaid,
            "itemTotalPaidAmt": +dataRow.totalPaid,
            "userId": userId,
            "itemCarrierAmt2": cob2Val,
            "claimTypeKey": this.claimTypeKey
          }

        }
        else {
          RequestedData[submitType] = {
            "itemKey": dataRow.id,
            "claimKey": dataRow.claimKey,
            "itemProcedureCd": dataRow.pro,
            "drugCoverageKey": 1,
            "itemServiceDt": this.changeDateFormatService.formatDate(dataRow.date),
            "overrideTypeKey": +dataRow.orverideType,
            "itemCarrierAmt": cob1Val,
            "itemDeductAmt": +dataRow.Deduct,
            "itemFeeAllowAmt": +dataRow.feeAllow,
            "itemFeeClaimAmt": feeClaimValue,
            "itemFeePaidAmt": +dataRow.feePaid,
            "itemTotalPaidAmt": +dataRow.totalPaid,
            "itemDin": "test",
            "userId": userId,
            "itemCarrierAmt2": cob2Val,
            "claimTypeKey": this.claimTypeKey
          }

        }
        if (this.ClaimEditMode || this.ClaimViewMode) {

          var claimItemRequest = [];
          const data = {
            procCode: dataRow.pro,
            serviceDate: this.changeDateFormatService.formatDate(dataRow.date),
            itemKey: dataRow.id
          }
          claimItemRequest.push(data);

          const submitData = {
            disciplineKey: this.DisciplineKey,
            cardholderkey: this.cardholderKey,
            claimKey: 0,
            claimItem: claimItemRequest
          }
          this.updateRow(RequestedData, resolve);
        }
        else {
          var claimItemRequest = [];
          const data = {
            procCode: dataRow.pro,
            serviceDate: this.changeDateFormatService.formatDate(dataRow.date),
            itemKey: dataRow.id
          }
          claimItemRequest.push(data);

          const submitData = {
            disciplineKey: this.DisciplineKey,
            cardholderkey: this.cardholderKey,
            claimKey: 0,
            claimItem: claimItemRequest
          }
          this.editModeSaveLocally(RequestedData, idx, resolve, submitType);      
        }
        this.claimService.disableSave.emit(false)
      }
    });
    return promise;
  }

  editModeSaveLocally(RequestedData, idx, resolve, submitType) {
    this.editMode = false;
    this.claimService.claimItemMode.emit(this.editMode)
    this.selectedRowId = '';
    this.newClaimItems[idx] = RequestedData[submitType];
    this.ClaimItemInsert.emit(this.newClaimItems);
    this.toastrService.success(this.translate.instant('claims.claims-toaster.claim-item-saved-successfully'));
    resolve();
  }

  /**
 * Cancel Operation
 */
  CancelInfo(idx, dataRow, cancelOnBlur, isCancel) {
    if(isCancel){
      this.arrClaimItems[idx] = this.claimItemData[idx]
    }
    this.editMode = false;
    this.addMode = false;
    this.selectedRowId = ""
    this.claimService.disableSave.emit(false)
    if (cancelOnBlur == 1) {
      var arrClaimItems = this.arrClaimItems;
      this.UpdateInfo(idx, dataRow).then(row => {
        var index = idx + 1
        var dataRowValue = arrClaimItems[index]
        this.EditInfo(index, dataRowValue, true)
        this.editMode = false;
        var totalLength = arrClaimItems.length - 1
        if (totalLength == idx) {
          this.claimService.disableSave.emit(false) //when tabbing out from last claim-item (enable Adjudicate,edit claim button) 
          $('#adjudicatebutton').focus();
        }
      });
    }
    this.claimService.claimItemMode.emit(this.editMode)
  }

  updateRow(RequestedData, resolve) {
    this.showLoader = true
    this.hmsDataService.postApi(ClaimApi.updateClaimItemsUrl, RequestedData).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.toastrService.success(this.translate.instant('claims.claims-toaster.claim-item-updated-successfully'))
        //  general feedaback data.result is returning object 
        this.getClaimItems().then(row => {
          this.editMode = false;
          this.claimStatus = 'Pending';
          this.claimService.claimStatus.emit(this.claimStatus)
          this.claimService.claimItemMode.emit(this.editMode)
          this.selectedRowId = '';
          this.showLoader = false;
          this.resetNewRecord();
          resolve();
        });

      }
      else if ((data.hmsMessage.messageShort == 'SERVICE_DATE_CANNOT_BE_GREATER_THAN_RECEIVE_DATE')) {
        if (this.claimTypeKey != 10) {
          this.toastrService.warning(this.translate.instant('claims.claims-toaster.service-date-cannot-be-greater'), '', {
            timeOut: 8000,
          });
        }
        this.showLoader = false
        resolve();
      }
      else if (data.code == '400' && data.hmsMessage.messageShort == 'RECORD_UPDATE_FAILED') {
        this.toastrService.success(data.result)

        this.showLoader = false
        resolve();
      }

      else if (data.code == '400' && data.hmsMessage.messageShort == 'OVERRIDE_TYPE_IS_NOT_ALLOWED') {
        this.toastrService.error("Override Type Is Not Allowed");

        this.showLoader = false
        resolve();
      }
      else if (data.code == '400' && data.hmsMessage.messageShort == 'INTERNAL_SERVER_ERROR') {
        this.toastrService.error("Internal Server Error");
        this.showLoader = false
        resolve();
      } else if (data.code == '400' && data.status == 'BAD_REQUEST') {
        this.toastrService.error(data.result, '', {
          timeOut: 8000,
        });
        this.showLoader = false
        resolve();
      }
    }, (error) => {
    })
  }

  DeleteInfo(idx, dataRow) {
    if (this.lockClaimItemVisStr != "" && this.lockClaimItemVisStr != undefined) {
      this.toastrService.error(this.lockClaimItemVisStr)
      return
    }
    var action = "cancel";
    if (dataRow && dataRow.itemKey) {
      action = "Delete";
      this.addMode = false;
      this.exDialog.openConfirm((this.translate.instant('claims.exDialog.are-you-sure')) + action + (this.translate.instant('claims.exDialog.record'))).subscribe((value) => {
        if (value) {
          this.editMode = false;
          this.claimService.disableSave.emit(true)
          if (this.addMode) {
            this.resetNewRecord();
          }
          else {
            if (this.ClaimEditMode || this.ClaimViewMode) {
              let RequestedData = {}
              let submitType = this.claimService.getParamClaimItem(this.DisciplineKey);
              RequestedData[submitType] = {
                "itemKey": +dataRow.itemKey
              }
              this.arrClaimItems = [];
              this.hmsDataService.postApi(ClaimApi.deleteClaimItemUrl, RequestedData).subscribe(data => {
                if (data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
                  this.toastrService.success(this.translate.instant('claims.claims-toaster.record-deleted-successfully'))
                  this.getClaimItems();
                }
              }, (error) => {
                this.translate.instant('common.errorOccurred')
              });
            }
            else {
              this.arrClaimItems.splice(idx, 1);
              this.newClaimItems.splice(idx, 1);
              this.ClaimItemInsert.emit(this.newClaimItems);
            }
          }
        }
      })
    } else if (this.ClaimAddMode && idx != undefined) {
      this.exDialog.openConfirm((this.translate.instant('claims.exDialog.are-you-sure')) + action + (this.translate.instant('claims.exDialog.record'))).subscribe((value) => {
        if (value) {
          this.claimService.disableSave.emit(true)
          this.arrClaimItems.splice(idx, 1);
          this.newClaimItems.splice(idx, 1);
          this.ClaimItemInsert.emit(this.newClaimItems);
        }
      });
    } else {
      this.addMode = false;
    }
    this.claimService.disableSave.emit(false)
  }

  /** Get Claim Items for GRID */
  getClaimItems() {
    let promise = new Promise((resolve, reject) => {
      let RequestedData = {}
      let submitType = this.claimService.getSubmitParam(this.DisciplineKey);
      RequestedData[submitType] = {
        "claimKey": +this.ClaimId
      }
      this.arrClaimItems = [];
      this.hmsDataService.postApi(ClaimApi.getClaimItemByClaimKeyUrl, RequestedData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          let retData = data.result[submitType].items;

          for (var i = 0; i < retData.length; i++) {
            var tooth = retData[i].itemToothId;
            if (tooth == 0) {
              tooth = '';
            }
            /* Diff calculation @Anisha */
            var PaidAmt = (retData[i].itemFeePaidAmt) + (retData[i].itemLabPaidAmt)
            var cob = (retData[i].itemCarrierAmt1) + (retData[i].itemCarrierAmt2)
            this.diff = PaidAmt - cob;
            if (this.diff < 0) {
              this.diff = 0
            }
            var feeClaimValue
            if (retData[i].itemFeeClaimAmt == 0) {
              feeClaimValue = '';
            }
            else {
              feeClaimValue = retData[i].itemFeeClaimAmt
            }

            var cob1Value
            if (retData[i].itemCarrierAmt1 == -1) {
              cob1Value = '';
            }
            else {
              cob1Value = retData[i].itemCarrierAmt1
            }

            var cob2Value
            if (retData[i].itemCarrierAmt2 == -1) {
              cob2Value = '';
            }
            else {
              cob2Value = retData[i].itemCarrierAmt2
            }
            let copy
            if (this.copyMode) {
              copy = "T"
            }
            this.arrClaimItems.push(
              {
                "id": retData[i].itemKey,
                "claimKey": retData[i].claimKey,
                "itemKey": retData[i].itemKey,
                "date": this.changeDateFormatService.formatDate(retData[i].itemServiceDt),
                "pro": retData[i].itemProcedureCd,
                "tooth": retData[i].itemToothId,
                "toothText": retData[i].itemToothSurfaceTxt,
                "feeClaim": feeClaimValue,
                "feeAllow": retData[i].itemFeeAllowAmt,
                "feePaid": retData[i].itemFeePaidAmt,
                "labClaim": retData[i].itemLabClaimAmt,
                "labPaid": retData[i].itemLabPaidAmt,
                "carrier": cob1Value,
                "Deduct": retData[i].itemDeductAmt,
                "itemRejectedInd": retData[i].itemRejectedInd,
                "totalPaid": retData[i].itemTotalPaidAmt,
                "diff": retData[i].diff,
                "orverideType": retData[i].overrideTypeKey,
                "orverideText": retData[i].overrideTypeDesc,
                "cob2": cob2Value,
                "Rv": retData[i].isReversed == "T" ? true : false,
                "isCopy": copy
              }
            )

            if (this.copyMode) {
              let RequestedData = {
                "dentalClaimItems": {
                  "claimKey": +this.ClaimId,
                  "itemProcedureCd": retData[i].itemProcedureCd,
                  "itemServiceDt": retData[i].itemServiceDt,
                  "itemToothId": tooth,
                  "itemToothSurfaceTxt": retData[i].itemToothSurfaceTxt,
                  "itemUnitCount": +retData[i].itemUnitCount,
                  "overrideTypeKey": +retData[i].overrideTypeKey,
                  "itemCarrierAmt": cob1Value,
                  "itemCarrierAmt2": cob2Value,
                  "itemDeductAmt": +retData[i].itemDeductAmt,
                  "itemFeeAllowAmt": +retData[i].itemFeeAllowAmt,
                  "itemFeeClaimAmt": +retData[i].itemFeeClaimAmt,
                  "itemFeeEligAmt": +retData[i].itemFeeEligAmt,
                  "itemFeePaidAmt": +retData[i].itemFeePaidAmt,
                  "itemLabAllowAmt": +retData[i].itemLabAllowAmt,
                  "itemLabClaimAmt": +retData[i].itemLabClaimAmt,
                  "itemLabEligAmt": +retData[i].itemLabEligAmt,
                  "itemLabPaidAmt": +retData[i].itemLabPaidAmt,
                  "itemTotalPaidAmt": +retData[i].itemTotalPaidAmt,
                  "userId": +this.currentUser.userId,
                  "itemReviewInd": 'F'
                }
              }
              this.claimService.emitOnSaveClaimItem.emit("true");
              this.newClaimItems.push(RequestedData.dentalClaimItems);
              this.ClaimItemInsert.emit(this.newClaimItems);
              this.claimService.getClaimItems.emit(this.arrClaimItems)
            }
          }
          this.claimService.getClaimItemsVission.emit(true)
        }
        else {
          this.claimService.getClaimItemsVission.emit(false)
        }
        resolve();
      }, (error) => {
      });
    });
       return promise;
  }

  /**
  * Autofill New Claim Item Row based on ClaimKey And Service Date
  * @param serviceDate 
  * @param dataRow 
  * @param idx 
  */
  getClaimListByClaimKeyAndServiceDate(serviceDate: string, dataRow, idx) {
    let RequestedData = {}
    let submitType = this.getSubmitParam(this.DisciplineKey)
    RequestedData[submitType] = {
      "claimKey": +this.ClaimId,
      "itemServiceDt": serviceDate
    }
    this.hmsDataService.postApi(ClaimApi.getClaimListByClaimKeyAndServiceDateUrl, RequestedData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (this.addMode) {
          this.arrNewClaimItem = {
            "id": "",
            "Rv": "",
            "date": "",
            "pro": "",
            "feeClaim": "",
            "feeAllow": "",
            "feePaid": "",
            "labClaim": "",
            "labPaid": "",
            "carrier": "",
            "Deduct": "",
            "totalPaid": "",
            "diff": "0.00",
            "orverideType": null,
            "orverideText": "",
            "itemDin": "test",
            "cob2": ""
          };
          this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-already-exist-for' + serviceDate));
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
          txtDate.focus();
        }
        else {
          var ret = data.result[submitType].itemKey;
          if (dataRow.id != data.result[submitType].itemKey) {
            this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-already-exist-for' + serviceDate));
            dataRow.date = '';
            var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
            txtDate.focus();
          }
        }
      }
    }, (error) => {
    });
  }

  /**
  * On Override dropdown change fill Override Text for print in row item of grid
  */
  OnOverrideChange(idx, evt, dataRow = null) {
    if (this.addMode) {
      var ddlOverideType = <HTMLSelectElement>document.getElementById("ddlOverideType");
      var selectedType = ddlOverideType.options[ddlOverideType.selectedIndex].text;
      this.arrNewClaimItem.orverideText = selectedType;
    }
    else {
      var ddlOverideType = <HTMLSelectElement>document.getElementById("ddlOverideType" + idx);
      var selectedType = ddlOverideType.options[ddlOverideType.selectedIndex].text;
      dataRow.orverideText = selectedType;
    }
  }
  /**
  * On RR Checked Change
  * @param evt 
  * @param dataRow 
  */
  onRRCheckedChange(evt, dataRow) {
    if (evt.target.checked) {
      dataRow.RR = "T";
    }
    else {
      dataRow.RR = "F";
    }
  }

  dialogCancel(id) {
    this.selectedRowId = id;
    this.editMode = true;
    this.claimService.claimItemMode.emit(this.editMode)
    this.claimService.disableSave.emit(true)
  }

  /**
  * Edit Grid Row Item 
  * @param idx 
  * @param dataRow 
  */
  EditInfo(idx, dataRow, focusOnDate: boolean = true) {
    let rowData = Object.assign({}, dataRow)
    this.claimItemData[idx] = rowData
    if (this.lockClaimItemVisStr != "" && this.lockClaimItemVisStr != undefined) {
      this.toastrService.error(this.lockClaimItemVisStr)
      return
    }
    let promise = new Promise((resolve, reject) => {
      ;
      this.claimItemIndex = idx;
      if (!this.editMode) {
        this.editMode = true;
        this.addMode = false;
        if (dataRow) {
          if (dataRow.Rv == 'T') {
            dataRow.Rv = true;
          }
          else {
            dataRow.Rv = false;
          }
          var feeClaimValue
          if (dataRow.feeClaim == "") {
            feeClaimValue = '';
          }
          else {
            feeClaimValue = CustomValidators.ConvertAmountToDecimal(dataRow.feeClaim);
          }

          var carrierValue
          if (dataRow.carrier === undefined || dataRow.carrier === "" || dataRow.carrier === '') {
            carrierValue = '';
          }
          else if (dataRow.cob == 0 || dataRow.cob > 0) {
            carrierValue = CustomValidators.ConvertAmountToDecimal(dataRow.carrier);
          } else {
            carrierValue = dataRow.carrier || dataRow.cob
          }

          var cob2Value
          if (dataRow.cob2 === undefined || dataRow.cob2 === "" || dataRow.cob2 === '') {
            cob2Value = '';
          }
          else if (dataRow.cob2 == 0 || dataRow.cob2 > 0) {
            cob2Value = CustomValidators.ConvertAmountToDecimal(dataRow.cob2);
          }
          this.selectedRowId = dataRow.id;
          this.oldProCode = dataRow.pro;
          dataRow.date = this.changeDateFormatService.changeDateByMonthName(dataRow.date);
          dataRow.Deduct = CustomValidators.ConvertAmountToDecimal(dataRow.Deduct);
          dataRow.feeClaim = feeClaimValue;
          dataRow.feePaid = CustomValidators.ConvertAmountToDecimal(dataRow.feePaid);
          if (this.DisciplineKey == 5) {
            dataRow.labClaim = CustomValidators.ConvertAmountToDecimal(dataRow.labClaim);
            dataRow.labPaid = CustomValidators.ConvertAmountToDecimal(dataRow.labPaid);
            dataRow.diff = CustomValidators.ConvertAmountToDecimal(dataRow.diff);
          }
          else {
            dataRow.feeAllow = CustomValidators.ConvertAmountToDecimal(dataRow.feeAllow);
          }
          dataRow.totalPaid = CustomValidators.ConvertAmountToDecimal(dataRow.totalPaid);
          dataRow.carrier = carrierValue;
          dataRow.cob2 = cob2Value;
        }
        if (focusOnDate == true) {
          setTimeout(function () {
            var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
            if (txtDate != null) {
              txtDate.focus();
            }
          }, 100);
        }
        this.claimService.claimItemMode.emit(this.editMode)
      }
      this.claimService.disableSave.emit(true)
      resolve();
    });
    return promise;
  }

  /**
  * Reset New Record Row
  */
  resetNewRecord() {
    this.addMode = false;
    this.isSuffRequired = false;
    this.isToothRequired = false;
    this.selectedRowId = '';
    this.newRecordValidate = false;
    this.arrNewClaimItem = {
      "id": "",
      "Rv": "",
      "date": "",
      "pro": "",
      "feeClaim": "",
      "feeAllow": "",
      "labClaim": "",
      "labPaid": "",
      "feePaid": "",
      "carrier": "",
      "Deduct": "",
      "totalPaid": "",
      "diff": "0.00",
      "orverideType": null,
      "orverideText": "",
      "itemDin": "test",
      "cob2": ""
    };
  }

  validateAllFields(objRow: any, idx: number) {
    let overideValid: boolean = false;
    if (+objRow.orverideType == 0) {
      overideValid = true
      this.toastrService.error("Cannot Add Claim Item. Doesnot Have Any Access For Override");
    }

    if (this.DisciplineKey == 5) {
      if (objRow.date && !overideValid && objRow.pro && objRow.feeClaim != '' && objRow.feeClaim != null) {
        if (this.cobVal == 'F') {  
          return true;
        }
        else {
          return true;
        }
      }
      else {
        if (this.addMode) {
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
          txtDate.focus();
        } else {
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
          txtDate.focus();
        }
        return false;
      }
    }
    else {
      if (objRow.date && !overideValid && objRow.pro && objRow.feeClaim != '' && objRow.feeClaim != null) {
        if (this.cobVal == 'F') {
          return true; 
        }
        else {
          return true;
        }
      }
      else {
        if (this.addMode) {
          setTimeout(() => {
            let txtDate: any = document.getElementsByClassName('error_field')
            if (txtDate.length > 0) {
              txtDate[0].focus()
            }

          }, 100);

        } else {
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
          if (txtDate != null) {
            txtDate.focus();
          }
        }
        return false;
      }
    }
  }

  /**
  * Add New Item allowed
  * @param objRow 
  */
  addNewAllowed(objRow: any) {
    if (objRow.date || objRow.pro || objRow.feeClaim != '' || objRow.feePaid != ''
      || objRow.Deduct != ''
      || objRow.totalPaid != '') {
      return true;
    }
    else {
      return false;
    }
  }
  /**
  * Gte overide Type Dropdown
  */
  getOverrideType() {
    this.hmsDataService.getApi(ClaimApi.getOverrideTypeListUrl).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.arrOverrideTypes = []
        let quikCardArrayCd = ["N", "J", "5", "D", "E", "R", "I"] // not Include Health check 
        let quikCardHealthArrayCd = ["N", "J", "5", "D", "E", "R", "I"]
        let mastareData = data.result;
        mastareData.forEach(value => {
          if (this.DisciplineKey == 3) {
            if (quikCardHealthArrayCd.includes(value.overrideTypeCd) && this.claimItemAuth.overides[value.overrideTypeCd] == 'T') {
              this.arrOverrideTypes.push(value)
            }
          } else {
            if (quikCardArrayCd.includes(value.overrideTypeCd) && this.claimItemAuth.overides[value.overrideTypeCd] == 'T') {
              this.arrOverrideTypes.push(value)
            }
          }
        })
        if(this.isMobileCopy&& this.arrOverrideTypes.length>0){
          var selectedOverride = this.arrOverrideTypes.find(x => x.overrideTypeDesc == "No Override");
          if (selectedOverride) {
            this.arrNewClaimItem.orverideType = selectedOverride.overrideTypeKey;
            this.arrNewClaimItem.orverideText = selectedOverride.overrideTypeDesc;
          }
        }
      }
    }, (error) => {
    })
  }

  /**
  * Convert Amount to Decimal
  * @param evt 
  * @param type 
  * @param dataRow 
  */
  ConvertAmountToDecimal(evt, type, dataRow = null) {
    if (this.addMode) {
      if (type == 'feeClaim') {
        var feeClaimValue
        if (evt.target.value == "" || evt.target.value == 0) {
          feeClaimValue = '';
          var value = CustomValidators.ConvertAmountToDecimal(feeClaimValue).toString();
          this.arrNewClaimItem.feeClaim = this.validateDeciamlLength(value)
        }
        else {
          feeClaimValue = evt.target.value
          this.arrNewClaimItem.feeClaim = this.validateDeciamlLength(evt.target.value)
        }
      }
      else if (type == 'labClaim') {
        var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
        this.arrNewClaimItem.labClaim = this.validateDeciamlLength(value)
      }
      else if (type == 'carrier') {
        if (this.cobVal == 'F') {
          if (evt.target.value != '' && evt.target.value != 0) {
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.carrier = this.validateDeciamlLength(value)
          }
          else {
          }
        }
        else {
          
          if (evt.target.value != '') {
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.carrier = this.validateDeciamlLength(value)
          }
          else if (evt.target.value == undefined || evt.target.value == "") {
            this.arrNewClaimItem.carrier = ''
          }
          else {
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.carrier = this.validateDeciamlLength(value)
          }
        }
      }
      else if (type == 'cob2') {
        if (this.cobVal == 'F') {
          if (evt.target.value != '') {
            this.toastrService.error("Card Has no Cob mentioned, please Add to Card too");
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.carrier = this.validateDeciamlLength(value)
          }
          else {
          }
        }
        else {
          if (evt.target.value != '' && evt.target.value != 0) {
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.cob2 = this.validateDeciamlLength(value)
          }
          else if (evt.target.value == undefined || evt.target.value == "") {
            this.arrNewClaimItem.cob2 = ''
          }
          else {
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.cob2 = this.validateDeciamlLength(value)
          }
        }
      }
      else if (type == 'diff') {
        this.arrNewClaimItem.diff = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
      }
    }
    else {
      if (dataRow != null) {
        if (type == 'feeClaim') {

          var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
          dataRow.feeClaim = this.validateDeciamlLength(value);
        }
        else if (type == 'labClaim') {
          var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
          dataRow.labClaim = this.validateDeciamlLength(value)
        }
        else if (type == 'carrier') {
          if (this.cobVal == 'F' && this.cardBusinessTypeKey != 1) {
            // // 1 -> Quikcard condition added for log #472 
            if (evt.target.value != '' && evt.target.value != 0) {
              this.toastrService.error("Card Has no Cob mentioned, please Add to Card too");
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.carrier = this.validateDeciamlLength(value)
            }
            else if (evt.target.value == undefined || evt.target.value == "") {
              dataRow.carrier = ''
            }
            else {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.carrier = this.validateDeciamlLength(value)
            }
          }
          else {
            if (evt.target.value != '' && evt.target.value != 0) {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.carrier = this.validateDeciamlLength(value)
            }
            else if (evt.target.value == undefined || evt.target.value == "") {
              dataRow.carrier = ''
            }
            else {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.carrier = this.validateDeciamlLength(value)
            }
          }
        }
        else if (type == 'Deduct') {
          dataRow.Deduct = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
        }
        else if (type == 'cob2') {
          if (this.cobVal == 'F') {
            if (evt.target.value != '' && evt.target.value != 0) {
              this.toastrService.error("Card Has no Cob mentioned, please Add to Card too");
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.cob2 = this.validateDeciamlLength(value)
            }
            else if (evt.target.value == undefined || evt.target.value == "") {
              dataRow.cob2 = ''
            }
            else {
              dataRow.cob2 = this.validateDeciamlLength(value)
            }
          }
          else {
            if (evt.target.value != '' && evt.target.value != 0) {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.cob2 = this.validateDeciamlLength(value)
            }
            else if (evt.target.value == undefined || evt.target.value == "") {
              dataRow.cob2 = ''
            }
            else {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.cob2 = this.validateDeciamlLength(value)
            }
          }
        }
        else if (type == 'diff') {
          dataRow.diff = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
        }
      }
    }
  }

  validateDeciamlLength(value) {
    var val
    var splitedVal = value.split(".")
    if (splitedVal[0].length > 8) {
      val = ""
    } else {
      val = value
    }
    return val
  }

  /**Change Input Date Format and Validate It should not be greater than Claim Recieved date and Future date*/
  ChangeInputDateFormat(event, idx, isEdit = null) {

    let inputDate = event.target;
    if (inputDate.value != '') {
      var obj = this.changeDateFormatService.changeDateFormatLessThanCurrentMonth(inputDate);
      var self = this
      var todaydate = this.changeDateFormatService.getToday();
      if (obj == null) {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.invalid-date'));

        if (this.addMode) {
          this.arrNewClaimItem.date = '';
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
          txtDate.focus();
        }
        else {
          this.arrClaimItems[idx].date = '';
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
          txtDate.focus();
        }
      }
      else {
        
        inputDate = this.changeDateFormatService.convertDateObjectToString(obj);
        var IsInValid = false;
        if (!this.cardHolderRecieveDate && !this.claimService.cardRecieveDate) {
          if (this.addMode) {
            this.arrNewClaimItem.date = '';
            var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
            txtDate.focus();
            this.toastrService.warning("Please Enter Recieve Date First");
          } else {
            this.arrClaimItems[idx].date = '';
            var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
            txtDate.focus();
            this.toastrService.warning("Please Enter Recieve Date First");
          }
          return;
        } else {
          this.cardHolderRecieveDate = !this.cardHolderRecieveDate ? this.changeDateFormatService.convertDateObjectToString(this.claimService.cardRecieveDate) : this.cardHolderRecieveDate

          IsInValid = this.changeDateFormatService.compareTwoDate(inputDate, this.cardHolderRecieveDate);
          //Replace isFutureDate with isFutureDateOrToday for log #797
          // log 1063
          let claimType = $("#claimType").val().toString().trim();
          if (claimType) {
            if (claimType == "Pre-Authorization - Paper") {
              IsInValid = false;
            }
          }
          var isFutureDate = this.changeDateFormatService.isFutureDateOrToday(inputDate);
          if (isFutureDate) {
            this.toastrService.warning(this.translate.instant('claims.claims-toaster.service-date-cannot-be-set'));
            if (this.addMode) {
              this.arrNewClaimItem.date = '';
              var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
              txtDate.focus();
            }
            else {
              this.arrClaimItems[idx].date = '';
              var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
              txtDate.focus();
            }
          }
          else if (IsInValid) {

            this.toastrService.warning(this.translate.instant('claims.claims-toaster.service-date-cannot-be-greater'));
            if (this.addMode) {
              this.arrNewClaimItem.date = '';
              var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
              txtDate.focus();
            }
            else {
              this.arrClaimItems[idx].date = '';
              var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
              txtDate.focus();
            }
          }
          else {
            var returnDateInString = this.changeDateFormatService.convertDateObjectToString(obj);
            if (this.addMode) {
              this.arrNewClaimItem.date = this.changeDateFormatService.changeDateByMonthName(returnDateInString);
            }
            else {
              this.arrClaimItems[idx].date = this.changeDateFormatService.changeDateByMonthName(returnDateInString);
            }
            if (isEdit) {
              this.checkDuplicate(idx)
            } else {
              this.checkDuplicate()
            }
          }
        }
      }
    }
  }

  onDown(idx, dataRow, columnId) {
    this.UpdateInfo(idx, dataRow).then(row => {
      var claimItemTotalLength = this.arrClaimItems.length;
      var lastClaimItem = idx + 1;
      if (claimItemTotalLength == lastClaimItem) {
        this.EditInfo(idx, this.arrClaimItems[idx], false).then(row => {
          setTimeout(() => {
            var txtPro = <HTMLInputElement>document.getElementById(columnId + idx);
            txtPro.focus();
          }, 200);
        });
      } else {
        this.CancelInfo(idx, dataRow, 0, false)
        var index = parseInt(idx) + 1
        var dataRowValue = this.arrClaimItems[index]
        this.EditInfo(index, dataRowValue, false).then(row => {
          setTimeout(() => {
            var txtPro = <HTMLInputElement>document.getElementById(columnId + index);
            txtPro.focus();
          }, 200);
          this.editMode = false;
          this.claimService.claimItemMode.emit(this.editMode)
        });
      }
    });
  }

  onUp(idx, dataRow, columnId) {
    this.UpdateInfo(idx, dataRow).then(row => {
      if (idx == 0) {
        var index = 0;
        this.EditInfo(0, this.arrClaimItems[0], false)
      }
      else {
        var index = idx - 1;
        this.CancelInfo(idx, dataRow, 0, false)
        var dataRowValue = this.arrClaimItems[index]
        this.EditInfo(index, dataRowValue, false)
        setTimeout(() => {
          var txtPro = <HTMLInputElement>document.getElementById(columnId + index);
          txtPro.focus();
        }, 200);
        this.editMode = false;
      }
    });
    this.claimService.claimItemMode.emit(this.editMode)
  }

  onDownAddMode(columnId) {
    var index = this.arrClaimItems.length - 1
    if (index == this.arrClaimItems.length) {
      this.EditInfo(index, this.arrClaimItems[index], false)
      setTimeout(function () {
        var txtPro = <HTMLInputElement>document.getElementById(columnId + index);
        txtPro.focus();
      }, 200);
    } else {
      return false;
    }
  }

  getSumAmount(column) {
    let sum = 0;
    for (let i = 0; i < this.arrClaimItems.length; i++) {
      let val = 0;
      if (this.arrClaimItems[i][column] != '' && this.arrClaimItems[i][column] != null && this.arrClaimItems[i][column] != undefined) {
        val = +this.arrClaimItems[i][column];
      }
      sum += val;
    }
    return sum;
  }

  getTotalAmount(column){
    let sum = 0;
    for (let i = 0; i < this.claimItems.length; i++) {
      let val = 0;
      if (this.claimItems[i][column] != '' && this.claimItems[i][column] != null && this.claimItems[i][column] != undefined) {
        val = +this.claimItems[i][column];
      }
      sum += val;
    }
    return sum;
  }

  onUpAddMode(columnId) {
    if (this.arrClaimItems.length == 0) {
      return false;
    } else {
      this.editSaveColoumnMode = columnId;
      this.SaveInfo(2);
    }
  }

  onlySingle() {
    var matched = $('#claim-item-vision').find('.dataTables_empty').length;
    if (matched > 1) {
      this.showZero = false
    } else if (matched == 1) {
      this.showZero = false
    }
    else if (matched == 0) {
      this.showZero = true
    }
  }

  ngOnDestroy() {
    if (this.isVisClaimItem) {
      this.isVisClaimItem.unsubscribe()
    }
  }

}

