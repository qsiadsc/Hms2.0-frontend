import { Component, OnInit, ViewChild, Inject, ViewChildren, Input, EventEmitter, Output, Renderer2, OnChanges, SimpleChange, ɵConsole } from '@angular/core';
import { CommonDatePickerOptions, Constants } from '../../../common-module/Constants';
import { IMyInputFocusBlur } from 'mydatepicker';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service';
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ExDialog } from "../../../common-module/shared-component/ngx-dialog/dialog.module";
import { ClaimApi } from '../../claim-api'
import { CustomValidators } from '../../../common-module/shared-services/validators/custom-validator.directive';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CardApi } from '../../../card-module/card-api';
import { TranslateService } from '@ngx-translate/core';
import { ClaimService } from '../../claim.service';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CurrentUserService } from '../../../common-module/shared-services/hms-data-api/current-user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { DuplicateClaimItemDetailComponent } from '../../duplicate-claim-item-detail/duplicate-claim-item-detail.component';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-claim-dental-item',
  templateUrl: './claim-item-dental.component.html',
  styleUrls: ['./claim-item-dental.component.css'],
  providers: [ChangeDateFormatService, HmsDataServiceService, ExDialog, TranslateService]
})

export class ClaimItemDentalComponent implements OnInit, OnChanges {
  isValid: any;
  showLoader: boolean;
  unsubOldRequest: any;
  unsub: Promise<void>;
  useServiceIn: any;
  AdjudicateCheck: boolean;
  toothCodeRequired: any;
  itemUnitCount: any;
  disableToothCode: boolean = false;
  @Input() CHRecievedDate: any;
  @Input() ClaimId: string;
  @Input() ClaimAddMode: boolean;
  @Input() ClaimViewMode: boolean;
  @Input() ClaimEditMode: boolean;
  @Output() emitOnSaveClaimItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() ClaimItemInsert = new EventEmitter();
  @Input() claimItemAuth: any;
  @Input() claimStatus: any;
  @Input() claimRefered: boolean;
  @Input() cardBusinessTypeKey: any;
  @Input() resetForm: any;
  @Input() claimTypeKey:any
  newClaimItems = [];
  /* data array for grid  */
  arrClaimItems = [];
  selectedClaim = []
  oldProCode = '';
  dtOptions: DataTables.Settings = {};
  dtTrigger;
  proCode: number;
  contactHistorytableData;
  /* Dropdown data array */
  arrOverrideTypes: any;

  addMode: boolean = false;
  editMode: boolean = false;
  viewMode: boolean = false; //Enable true after a new claim added
  /* New Empty Record array */
  newRecordValidate: boolean = false;
  /* General Information Component */
  FormGroup: FormGroup;
  cardHeading: string = "Add" //Heading name change on add/edit
  buttonText = "Save";//button text for Save/Edit/Update
  referClaim: FormGroup;
  editSaveColoumnMode = '';
  @Input()
  cardholderKey: any;
  isUseServiceIn: boolean = false;
  diff;
  claimItemIndex = 0;
  error: any;//error for datepicker 
  arrNewClaimItem = {
    "id": "",
    "Rv": "",
    "date": "",
    "pro": "",
    "tooth": "",
    "suff": "",
    "cnt": "",
    "feeClaim": "",
    "feeEligAmount": "",
    "feeAllow": "",
    "feePaid": "",
    "labClaim": "",
    "labElig": "",
    "labAllow": "",
    "labPaid": "",
    "cob": null,
    "Deduct": "",
    "totalPaid": "",
    "diff": "0.00",
    "RR": "",
    "orverideType": null,
    "orverideText": "",
    "cob2": null,
  };
  showClaimedColumn = false
  selectedRowId = '';
  selectedClaimType: any = '';
  hasCrdHolder: boolean = false;
  cobVal;
  cardHolderRecieveDate;
  itemReview = []
  claimItemList = []
  reviewer
  disableSave: boolean = false
  userRole
  copyMode: boolean = false;
  currentUser: any;
  isDasp;
  preAuthReverseClaim: boolean = false;
  cardBusinesTypeCd: any;
  preAuthReviewClaim: boolean = false;
  isAdsc: any;
  isLowIncome: any;
  cardKey: any;
  cobValDisable: boolean = true;
  isQuikcard: any;
  colorCheck: boolean = true;
  ClaimValue: any;
  selectedClaimTypeKey;
  duplicateClaimItems: any[];
  duplicateClaimData: any;
  businessType: any;
  claimKey: any = 0;
  claimItems: any;
  customComments: any;
  lockClaimItemDentStr: string
  isMobileCopy: boolean;
  isDisableBtn: boolean;
  isDentClaimItem: Subscription
  claimItemData = []
  constructor(private changeDateFormatService: ChangeDateFormatService,
    private hmsDataService: HmsDataServiceService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private exDialog: ExDialog,
    private translate: TranslateService,
    private _hotkeysService: HotkeysService,
    private router: Router,
    private route: ActivatedRoute,
    private claimService: ClaimService,
    private currentUserService: CurrentUserService,
    private renderer: Renderer2,
    private ngbModal: NgbModal) {
    this.error = { isError: false, errorMessage: '' };
    this._hotkeysService.add(new Hotkey('shift+n', (event: KeyboardEvent): boolean => {
      if (!this.ClaimViewMode) {
        this.AddNew()
      }
      return false; // Prevent bubbling
    }));
    claimService.getClaimType.subscribe(value => {
      this.selectedClaimType = value;
    })
    this.claimService.selectedClaimTypeKeyData.subscribe(value => {
      this.selectedClaimTypeKey = value
    })
    claimService.hasCardHolder.subscribe(value => {
      if (value) {
        this.hasCrdHolder = true
      }
    })
    claimService.getCOB.subscribe(value => {
      this.cobVal = value
    })

    claimService.cob2eligible.subscribe(value => {
      this.cobValDisable = value
    })
    claimService.multipleCob.subscribe(value => {
      if (value == "F") {
        this.cobValDisable = true
      } else {
        this.cobValDisable = false
      }
    })
    this.claimService.claimBussinessKey.subscribe(val => {
      this.businessType = val;
    })
    claimService.isDasp.subscribe(val => {
      this.isDasp = val.dasp
      this.isAdsc = val.isAdsc
      this.isLowIncome = val.isLowIncome
    })
    claimService.getRecieveDate.subscribe(value => {
      if (value) {
        this.cardHolderRecieveDate = this.changeDateFormatService.convertDateObjectToString(value)
      }
    })
    this.isDentClaimItem = claimService.mobilClaimItem.subscribe(data => {
      this.cardHolderRecieveDate = data['receivedDate'];
      this.isMobileCopy = true
    })
    claimService.getclaimTypeCd.subscribe(value => {
      if (value == "V" || value == "A" || value == "U") {
        this.arrNewClaimItem["claimed"] = ""
        this.showClaimedColumn = true
      } else {
        this.showClaimedColumn = false
      }
      value == "V" ? this.preAuthReviewClaim = true : this.preAuthReviewClaim = false
      this.getOverrideType();
    })
    claimService.getCardKey.subscribe(val => {
      if (val) {
        this.cardBusinesTypeCd = val.bussinessTypeCd
        this.cardKey = val.cardKey
        this.getOverrideType();
      }
    })

    this.claimService.cardHolderKey.subscribe(val => {
      this.cardholderKey = val;
    })

    claimService.getOverideCheck.subscribe(val => {
      if (val) {
        this.getOverrideType();
      }
    })
    currentUserService.loggedInUserVal.subscribe(val => {
      this.currentUser = val
      this.userRole = this.currentUser.selectedUserRole
    })

    this.claimService.claimBussinessKey.subscribe(val => {
      this.isQuikcard = val
      this.cardBusinessTypeKey = val;
    })

    /* Lock Processor Functionality*/
    claimService.getLockedMessage.subscribe(val => {
      this.lockClaimItemDentStr = val
    })
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName == "resetForm" && !changedProp.firstChange) {
        this.arrClaimItems = [];
        this.addMode = false;
        this.newClaimItems = [];
      }
    }
  }

  /** Get Override Type List and Claim Item List for GRId */
  ngOnInit() {
    this.dtOptions['claimItemsTableD'] = Constants.dtOptionsSortingConfigClaimHistory
    this.route.queryParams.subscribe((params: Params) => {
      this.addMode = false
    });
    this.getOverrideType();
    this.getClaimItems();

    if (this.route.snapshot.url[0]) {
      this.route.params.subscribe((params: Params) => {
        if (params.id) {
          this.claimKey = params.id || 0;
        }
        if (this.route.snapshot.url[4]) {
          if (this.route.snapshot.url[4].path == 'reviewer') {
            this.reviewer = true
          } else {
            this.reviewer = false
          }
          if (this.route.snapshot.url[4].path == 'preAuth') {
            this.preAuthReverseClaim = true
          } else {
            this.preAuthReverseClaim = false
          }
        }
        if (this.route.snapshot.url[0].path == "copy") {
          this.route.params.subscribe((params: Params) => {
            this.copyMode = true
          })
        }
        if (this.route.snapshot.url[0].path == "view") {
          this.route.params.subscribe((params: Params) => {
            this.viewMode = true
          })
        }
      })
    }
    // General Feedback: Button should be enabled after Intiate claim button as discussed with Arun sir
    if (this.router.url.indexOf("/claim?fileReference") > -1) {
      this.isDisableBtn = false
    } else {
      this.isDisableBtn = true
    }
    // Task 636 changes made to resolve issue where No data table did not used to appear if we delete claim items after adjudicate the claim.
    if (this.arrClaimItems.length == 0) {
      this.ClaimAddMode = true
      this.showClaimedColumn = true
    }
  }

  AddNewMobile(data){    
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
      this.arrNewClaimItem.orverideText = selectedOverride.overrideTypeDesc
    }
    if (data['serviceDate']) {
      this.arrNewClaimItem.date = this.changeDateFormatService.changeDateByMonthName(data['serviceDate'])
    }
    if (data['claimAmount']) {
      this.arrNewClaimItem.feeClaim = CustomValidators.ConvertAmountToDecimal(data['claimAmount'])
    }
    if (data['cobAmount']) {
      this.arrNewClaimItem.cob = CustomValidators.ConvertAmountToDecimal(data['cobAmount'])
    }
    if (data['procId'] && data['procId'] != null && data['procId'] != undefined && data['procId'] != 'null' && data['procId'] != 'undefined') {
      this.arrNewClaimItem.pro = data['procId'];
    } else {
      this.arrNewClaimItem.pro = ''
    }
  }
  /** Add Empty Row For New Claim Item */

  AddNew() {
    // for issue number 759. start
    var recieve_date = $('#receive_date input').val();
    if (recieve_date === '') {
      this.toastrService.warning("Please Enter Recieve Date First", '', {
        timeOut: 8000,
      });
      return false;
    }

    let claimType = $('#claimType').val().toString().trim()
    // for issue number 759. end
    this.resetNewRecord();
        if (!this.editMode) {
      this.selectedRowId = '';
      this.addMode = true;
      var selectedOverride = this.arrOverrideTypes.find(x => x.overrideTypeDesc == "No Override");
      if (selectedOverride) {
        this.arrNewClaimItem.orverideType = selectedOverride.overrideTypeKey;
        this.arrNewClaimItem.orverideText = selectedOverride.overrideTypeDesc
      }
      if (!this.selectedClaimTypeKey) {
        let selectedClaimType = $("#claimType").val().toString().trim()
        if (selectedClaimType == 'Paper') {
          this.selectedClaimTypeKey = 17
        }
      }
      if (this.arrClaimItems.length > 0) {
        let lastRow = this.arrClaimItems.length - 1;
        if (this.arrClaimItems[lastRow].date && this.arrClaimItems[lastRow].date != '') {
          recieve_date = this.arrClaimItems[lastRow].date
        }
        if (this.businessType == '1' || this.businessType == undefined) {
          this.arrNewClaimItem.date = this.changeDateFormatService.formatDate(recieve_date);
        } else if (this.cardBusinessTypeKey == 2) { // Log #1193
          this.arrNewClaimItem.date = this.changeDateFormatService.formatDate(recieve_date)
        }
      }
      else if (this.arrClaimItems.length > 0 && (this.cardBusinessTypeKey == 2 && ($('#claimType').val().toString().trim() != 'Paper'))) { // for  796 changed for  958
        this.arrNewClaimItem.date = this.changeDateFormatService.formatDate(recieve_date);
      }
      else if (this.businessType == '1' && claimType == "Pre-Authorization - Paper") {
        let date = $('#dateEntryDate input').val() || ''
        this.arrNewClaimItem.date = this.changeDateFormatService.formatDate(date);
      }

      // for issue number 759. end
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
    }
    this.claimService.disableSave.emit(true);
    this.claimItemIndex = 0;
  }

  /** Get Claim Items for GRID */
  getClaimItems() {
    $('.dataTables_processing').show();
    let promise = new Promise((resolve, reject) => {
      let RequestedData = {
        "dentalClaim": {
          "claimKey": +this.ClaimId
        }
      }
      this.arrClaimItems = [];
      this.hmsDataService.postApi(ClaimApi.getClaimItemByClaimKeyUrl, RequestedData).subscribe(data => {
        if (data.code == 200 && data.status == "OK") {
          let retData = data.result.dentalClaim.items;  
          for (var i = 0; i < retData.length; i++) {
            var tooth = retData[i].itemToothId;
            if (tooth == 0) {
              tooth = '';
            }
            this.claimService.totalClaims.emit(retData)
            /* Diff calculation @Anisha */
            var PaidAmt = (retData[i].itemFeePaidAmt) + (retData[i].itemLabPaidAmt)
            var cob = (retData[i].itemCarrierAmt1) + (retData[i].itemCarrierAmt2)
            this.diff = PaidAmt - cob;
            if (this.diff < 0) {
              this.diff = 0
            }
            var labClaimValue
            if (retData[i].itemLabClaimAmt == 0) {
              labClaimValue = '';
            }
            else {
              labClaimValue = retData[i].itemLabClaimAmt
            }
            var feePaidValue
            if (retData[i].itemFeePaidAmt == 0) {
              feePaidValue = '';
            }
            else {
              feePaidValue = retData[i].itemFeePaidAmt
            }
            var feeClaimValue
            if (retData[i].itemFeeClaimAmt == 0) {
              feeClaimValue = '';
            }
            else {
              feeClaimValue = retData[i].itemFeeClaimAmt
            }
            var labPaidValue
            if (retData[i].itemLabPaidAmt == 0) {
              labPaidValue = '';
            }
            else {
              labPaidValue = retData[i].itemLabPaidAmt
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
                "procDesc": retData[i].itemProcLongDesc,
                "id": retData[i].itemKey,
                "claimKey": retData[i].claimKey,
                "itemKey": retData[i].itemKey,
                "date": retData[i].itemServiceDt,
                "pro": retData[i].itemProcedureCd,
                "tooth": tooth,
                "suff": retData[i].itemToothSurfaceTxt,
                "suffText": retData[i].suffText,
                "cnt": retData[i].itemUnitCount,
                "feeClaim": feeClaimValue,
                "feeEligAmount": retData[i].itemFeeEligAmt,
                "feeAllow": retData[i].itemFeeAllowAmt,
                "feePaid": feePaidValue,
                "labClaim": labClaimValue,
                "labElig": retData[i].itemLabEligAmt,
                "labAllow": retData[i].itemLabAllowAmt,
                "labPaid": labPaidValue,
                "cob": cob1Value,
                "cob2": cob2Value,
                "Deduct": retData[i].itemDeductAmt,
                "totalPaid": retData[i].itemTotalPaidAmt,
                "diff": retData[i].diff,
                "itemRejectedInd": retData[i].itemRejectedInd,
                "orverideType": retData[i].overrideTypeKey,
                "orverideText": retData[i].overrideTypeDesc,
                "itemReviewInd": retData[i].itemReviewInd == "T" ? true : false,
                "isPreAuth": retData[i].isPreAuth == "T" ? true : false,
                "isClaimed": retData[i].isClaimed == "T" ? true : false,
                "Rv": retData[i].isReversed == "T" ? true : false,
                "RR": retData[i].itemApprovedReviewInd == "T" ? true : false,
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
          this.claimService.getClaimItems.emit(true)
        }
        else {
          this.claimService.getClaimItems.emit(false)
        }
        resolve();
        // issue number 670 start
        $('.dataTables_processing').hide();
        this.colorCheck = true;
        // issue number 670 end
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
    let RequestedData = {
      "dentalClaimItems": {
        "claimKey": +this.ClaimId,
        "itemServiceDt": serviceDate
      }
    }
    this.hmsDataService.postApi(ClaimApi.getClaimListByClaimKeyAndServiceDateUrl, RequestedData).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        if (this.addMode) {
          this.arrNewClaimItem = {
            "id": "",
            "Rv": "",
            "date": "",
            "pro": "",
            "tooth": "",
            "suff": "",
            "cnt": "",
            "feeClaim": "",
            "feeEligAmount": "",
            "feeAllow": "",
            "feePaid": "",
            "labClaim": "",
            "labElig": "",
            "labAllow": "",
            "labPaid": "",
            "cob": "",
            "Deduct": "",
            "totalPaid": "",
            "diff": "",
            "RR": "",
            "orverideType": null,
            "orverideText": "",
            "cob2": "",
          };
          this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-already-exist-for' + serviceDate), '', {
            timeOut: 8000,
          });
          var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate');
          txtDate.focus();
        }
        else {
          var ret = data.result["dentalClaimItems"].itemKey;
          if (dataRow.id != data.result["dentalClaimItems"].itemKey) {
            this.toastrService.warning(this.translate.instant('claims.claims-toaster.claim-already-exist-for' + serviceDate), '', {
              timeOut: 8000,
            });
            dataRow.date = '';
            var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
            txtDate.focus();
          }
        }
      }
    }, (error) => {
    });
  }


  /** Autofill Suff / Tooth / CNT based on Procode */
  onProCodeChange(event, proCode, idx, actionType) {
    if (event.key == "Tab") { //wait till api response to set focus on particular tab
      event.preventDefault();
    }
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
    else {  //QA Changes(Need for edit mode also)
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

    if (proCode != '') {
      if (this.addMode) {
        this.renderer.selectRootElement('#txtPro').focus();
      } else {
        this.renderer.selectRootElement('#txtPro' + idx).focus();
      }
      let RequestedData = {
        "dentalClaimItems": {
          "itemProcedureCd": procedureCode
        }
      }
      this.hmsDataService.postApi(ClaimApi.checkProcIdAndCountUrl, RequestedData).subscribe(data => {
        if (data.hmsMessage.messageShort == "RECORD_GET_SUCCESSFULLY") {
          if (this.addMode) {
            this.arrNewClaimItem.cnt = data.result.itemUnitCount;
            this.arrNewClaimItem.suff = '';
            this.arrNewClaimItem.tooth = '';
            this.itemUnitCount = data.result.itemUnitCount;
            this.toothCodeRequired = data.result.toothCodeRequired
            this.useServiceIn = data.result.useServiceIn

            if (procString.substring(0, 3) == '151' && this.isLowIncome) {
              this.arrNewClaimItem.tooth = ''
              this.disableToothCode = false;
              this.toothCodeRequired = 'T'
              this.useServiceIn = 'F'
            } else if (data.result.mouthSiteId) {
              this.arrNewClaimItem.tooth = data.result.mouthSiteId
              this.disableToothCode = true;
            }
            else {
              this.arrNewClaimItem.tooth = ''
              this.disableToothCode = false;
            }

            this.renderer.selectRootElement('#txtTooth').removeAttribute('tabIndex');
            this.renderer.selectRootElement('#txtSuff').removeAttribute('tabIndex');
            if (this.toothCodeRequired == 'T' && this.useServiceIn == 'T') {
              this.renderer.selectRootElement('#txtTooth').focus();
            } else if (this.toothCodeRequired == 'F' && this.useServiceIn == 'T') {
              document.getElementById('txtTooth').tabIndex = -1;
              this.renderer.selectRootElement('#txtSuff').focus();
            } else if (this.toothCodeRequired == 'T' && this.useServiceIn == 'F') {
              document.getElementById('txtSuff').tabIndex = -1;
              this.renderer.selectRootElement('#txtTooth').focus();
            } else {
              document.getElementById('txtTooth').tabIndex = -1;
              document.getElementById('txtSuff').tabIndex = -1;
              this.renderer.selectRootElement('#txtFeeClaim').focus();
            }
          }
          else {
            this.arrClaimItems[idx].cnt = data.result.itemUnitCount;
            if (actionType == 1) {
              this.arrClaimItems[idx].suff = '';
              this.arrClaimItems[idx].tooth = '';
              /*new changes*/
              this.itemUnitCount = data.result.itemUnitCount;
              this.toothCodeRequired = data.result.toothCodeRequired
              this.useServiceIn = data.result.useServiceIn
              if (procString.substring(0, 3) == '151' && this.isLowIncome) {
                this.arrNewClaimItem.tooth = ''
                this.disableToothCode = false;
                this.toothCodeRequired = 'T'
                this.useServiceIn = 'F'
              } else if (data.result.mouthSiteId) {
                this.arrClaimItems[idx].tooth = data.result.mouthSiteId
                this.disableToothCode = true;
              }
              else {
                this.arrClaimItems[idx].tooth = ''
                this.disableToothCode = false;
              }
              this.renderer.selectRootElement('#txtTooth' + idx).removeAttribute('tabIndex');
              this.renderer.selectRootElement('#txtSuff' + idx).removeAttribute('tabIndex');
              if (this.toothCodeRequired == 'T' && this.useServiceIn == 'T') {
                this.renderer.selectRootElement('#txtTooth' + idx).focus();
              } else if (this.toothCodeRequired == 'F' && this.useServiceIn == 'T') {
                document.getElementById('txtTooth' + idx).tabIndex = -1;
                document.getElementById('txtSuff' + idx).focus();
              } else if (this.toothCodeRequired == 'T' && this.useServiceIn == 'F') {
                document.getElementById('txtTooth' + idx).focus();
                document.getElementById('txtSuff' + idx).tabIndex = -1;
              } else {
                document.getElementById('txtTooth' + idx).tabIndex = -1;
                document.getElementById('txtSuff' + idx).tabIndex = -1;
                document.getElementById('txtFeeClaim' + idx).focus();
              }
            }
            else {
              var txtFeeClaim = <HTMLInputElement>document.getElementById('txtFeeClaim' + idx);
              txtFeeClaim.focus();
            }
          }
          if (this.editMode && procString.length == 4) {
            this.arrClaimItems[idx].pro = procedureCode
          }
          else {
            this.oldProCode = proCode;
          }
        }
        else if (data.hmsMessage.messageShort == "INVALID_PROC_ID") {
          this.isUseServiceIn = false;
          this.oldProCode = '';
          // commenting this as per 23-April client feedback sheet
          if (this.addMode) {
            this.arrNewClaimItem.cnt = '';
          }
          else {
            this.arrClaimItems[idx].cnt = '';
          }
          this.toastrService.warning(this.translate.instant('claims.claims-toaster.invalid-procode'), '', {
            timeOut: 8000,
          })
          if (this.addMode) {
            this.renderer.selectRootElement('#txtTooth').focus();
          } else {
            this.renderer.selectRootElement('#txtTooth' + idx).focus();
          }
        }
        else {
          this.oldProCode = proCode;
          if (this.addMode) {
            this.renderer.selectRootElement('#txtTooth').focus();
          } else {
            this.renderer.selectRootElement('#txtTooth' + idx).focus();
          }
        }
      }, (error) => {
      });
    } else {
      if (this.addMode) {
        this.renderer.selectRootElement('#txtTooth').focus();
      } else {
        this.renderer.selectRootElement('#txtTooth' + idx).focus();
      }
    }
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
  * On RV Changed add Selected Claim in array
  * @param dataRow  
  * @param evt 
  */
  /**
  * On RR Checked Change
  * @param evt 
  * @param dataRow 
  */

  /**
  * Edit Grid Row Item 
  * @param idx 
  * @param dataRow 
  */

  EditInfo(idx, dataRow, focusOnDate: boolean = true) {
    let rowData = Object.assign({}, dataRow)
    this.claimItemData[idx] = rowData
    if (this.lockClaimItemDentStr != "" && this.lockClaimItemDentStr != undefined) {
      this.toastrService.error(this.lockClaimItemDentStr)
      return
    }
    let promise = new Promise((resolve, reject) => {
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
          var labClaimValue
          if (dataRow.labClaim == "") {
            labClaimValue = '';
          }
          else {
            labClaimValue = CustomValidators.ConvertAmountToDecimal(dataRow.labClaim)
          }
          var feePaidValue
          if (dataRow.feePaid == "") {
            feePaidValue = '';
          }
          else {
            feePaidValue = CustomValidators.ConvertAmountToDecimal(dataRow.feePaid)
          }
          var feeClaimValue
          if (dataRow.feeClaim == "") {
            feeClaimValue = '';
          }
          else {
            feeClaimValue = CustomValidators.ConvertAmountToDecimal(dataRow.feeClaim);
          }
          var labPaidValue
          if (dataRow.labPaid == "") {
            labPaidValue = '';
          }
          else {
            labPaidValue = CustomValidators.ConvertAmountToDecimal(dataRow.labPaid);
          }
          var cobValue
          if (dataRow.cob === undefined || dataRow.cob === "" || dataRow.cob === '') {
            cobValue = '';
          }
          else if (dataRow.cob == 0 || dataRow.cob >0) {
            cobValue = CustomValidators.ConvertAmountToDecimal(dataRow.cob);
          }
          var cob2Value
          if (dataRow.cob2 === undefined || dataRow.cob2 === "" || dataRow.cob2 === '') {
            cob2Value = '';
          }
          else if (dataRow.cob2 == 0 || dataRow.cob2 >0 ) {
            cob2Value = CustomValidators.ConvertAmountToDecimal(dataRow.cob2);
          }

          this.selectedRowId = dataRow.id;
          this.oldProCode = dataRow.pro;
          dataRow.date = this.changeDateFormatService.changeDateByMonthName(dataRow.date);
          dataRow.cob = cobValue;
          dataRow.Deduct = CustomValidators.ConvertAmountToDecimal(dataRow.Deduct);
          dataRow.feeAllow = CustomValidators.ConvertAmountToDecimal(dataRow.feeAllow);
          dataRow.feeClaim = feeClaimValue;
          dataRow.feeEligAmount = CustomValidators.ConvertAmountToDecimal(dataRow.feeEligAmount);
          dataRow.feePaid = feePaidValue;
          dataRow.labAllow = CustomValidators.ConvertAmountToDecimal(dataRow.labAllow);
          dataRow.labClaim = labClaimValue;
          dataRow.labElig = CustomValidators.ConvertAmountToDecimal(dataRow.labElig);
          dataRow.labPaid = labPaidValue;
          dataRow.totalPaid = CustomValidators.ConvertAmountToDecimal(dataRow.totalPaid);
          dataRow.diff = CustomValidators.ConvertAmountToDecimal(dataRow.diff);
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

  /** Add New Claim Item */
  SaveInfo(id) {
    let promise = new Promise((resolve, reject) => {
      this.newRecordValidate = true;
      var userId = localStorage.getItem('id')
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
            $("#adjudicatebutton").click();
            this.AdjudicateCheck = true; // issue 670
          }
          else {
            this.AdjudicateCheck = false;
          }
        }
      }

      var arrLengthClaimCol = 0;
      if (this.arrClaimItems.length > 0) {
        arrLengthClaimCol = this.arrClaimItems.length;
      }

      if (this.validateAllFields(this.arrNewClaimItem, arrLengthClaimCol)) {
        this.colorCheck = false;
        var cob1Val;
        var cob2Val;
        if (this.arrNewClaimItem.cob == "") {
          cob1Val = null
        }
        else {
          cob1Val = this.arrNewClaimItem.cob
        }
        if (this.arrNewClaimItem.cob2 == "") {
          cob2Val = null
        }
        else {
          cob2Val = this.arrNewClaimItem.cob2
        }
        let RequestedData = {
          "dentalClaimItems": {
            "claimKey": +this.ClaimId,
            "itemProcedureCd": this.arrNewClaimItem.pro,
            "itemServiceDt": this.changeDateFormatService.formatDate(this.arrNewClaimItem.date),
            "itemToothId": this.arrNewClaimItem.tooth,
            "itemToothSurfaceTxt": this.arrNewClaimItem.suff,
            "itemUnitCount": +this.arrNewClaimItem.cnt,
            "overrideTypeKey": +this.arrNewClaimItem.orverideType,
            "itemCarrierAmt": cob1Val,
            "itemCarrierAmt2": cob2Val,
            "itemDeductAmt": +this.arrNewClaimItem.Deduct,
            "itemFeeAllowAmt": +this.arrNewClaimItem.feeAllow,
            "itemFeeClaimAmt": +this.arrNewClaimItem.feeClaim,
            "itemFeeEligAmt": +this.arrNewClaimItem.feeEligAmount,
            "itemFeePaidAmt": +this.arrNewClaimItem.feePaid,
            "itemLabAllowAmt": +this.arrNewClaimItem.labAllow,
            "itemLabClaimAmt": this.arrNewClaimItem.labClaim,
            "itemLabEligAmt": +this.arrNewClaimItem.labElig,
            "itemLabPaidAmt": +this.arrNewClaimItem.labPaid,
            "itemTotalPaidAmt": +this.arrNewClaimItem.totalPaid,
            "userId": +userId
          }
        }
        if (this.ClaimEditMode || this.ClaimViewMode) {
          if (id == 0 || id == 1) {
            var claimItemRequest = [];
            const data = {
              procCode: this.arrNewClaimItem.pro,
              serviceDate: this.changeDateFormatService.formatDate(this.arrNewClaimItem.date)
            }
            claimItemRequest.push(data);
            this.saveItemRequest(RequestedData, id, resolve);
          } else {
            this.saveItemRequest(RequestedData, id, resolve);
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
            this.saveClaimItemLocally(RequestedData, id, resolve);
          } else {
            this.saveClaimItemLocally(RequestedData, id, resolve);
          }
        }
      }
    });
    return promise;
  }


  saveClaimItemLocally(RequestedData, id, resolve) {
    this.claimService.emitOnSaveClaimItem.emit("true");
    var tooth = this.arrNewClaimItem.tooth;
    if (tooth == '0') {
      tooth = '';
    }
    var labClaimValue
    if (this.arrNewClaimItem.labClaim == "") {
      labClaimValue = '';
    }
    else {
      labClaimValue = CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.labClaim)
    }

    var feePaidValue
    if (this.arrNewClaimItem.feePaid == "") {
      feePaidValue = '';
    }
    else {
      feePaidValue = CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.feePaid)
    }

    var feeClaimValue
    if (this.arrNewClaimItem.feeClaim == '0.00' || this.arrNewClaimItem.feeClaim == '') {
      feeClaimValue = '';
    }
    else {
      feeClaimValue = CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.feeClaim)
    }

    var labPaidValue
    if (this.arrNewClaimItem.labPaid == "") {
      labPaidValue = '';
    }
    else {
      labPaidValue = CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.labPaid);
    }
    this.addMode = false;
    this.arrClaimItems.push(
      {
        "id": this.arrClaimItems.length + 1,
        "Rv": "",
        "itemKey": '',
        "date": this.arrNewClaimItem.date,
        "pro": this.arrNewClaimItem.pro,
        "tooth": tooth,
        "suff": this.arrNewClaimItem.suff,
        "suffText": this.arrNewClaimItem.suff,
        "cnt": this.arrNewClaimItem.cnt,
        "feeClaim": feeClaimValue,
        "feeEligAmount": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.feeEligAmount),
        "feeAllow": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.feeAllow),
        "feePaid": feePaidValue,
        "labClaim": labClaimValue,
        "labElig": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.labElig),
        "labAllow": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.labAllow),
        "labPaid": labPaidValue,
        "cob": this.arrNewClaimItem.cob != "" ? CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.cob) : '',
        "Deduct": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.Deduct),
        "totalPaid": CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.totalPaid),
        "diff": "",
        "itemRejectedInd": 'F',
        "RR": "",
        "orverideType": this.arrNewClaimItem.orverideType,
        "orverideText": this.arrNewClaimItem.orverideText,
        "cob2": this.arrNewClaimItem.cob2 != "" ? CustomValidators.ConvertAmountToDecimal(this.arrNewClaimItem.cob2) : ''
      }
    )
    var ClaimItems = this.arrNewClaimItem;
    this.newClaimItems.push(RequestedData.dentalClaimItems);
    this.resetNewRecord();
    this.ClaimItemInsert.emit(this.newClaimItems);
    this.claimService.getClaimItems.emit(this.arrClaimItems)
    this.toastrService.success(this.translate.instant('claims.claims-toaster.claim-item-saved-successfully'), '', {
      timeOut: 8000,
    });
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
    for (var i = 0; i < this.arrClaimItems.length; i++) {
      let key = this.itemReview.filter(val => val == this.arrClaimItems[i].id)
      let obj = {}
      obj["claimItemId"] = this.arrClaimItems[i].id
      obj["status"] = "F"
      this.claimItemList.push(obj);
    }
    this.claimService.getClaimItemsReview.emit(this.claimItemList)
    resolve();
  }

  saveItemRequest(RequestedData, id, resolve) {
    this.hmsDataService.postApi(ClaimApi.saveClaimItemsUrl, RequestedData).subscribe(data => {
      if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
        this.claimService.emitOnSaveClaimItem.emit("true")
        this.toastrService.success(this.translate.instant('claims.claims-toaster.claim-item-saved-successfully'), '', {
          timeOut: 8000,
        })
        this.claimStatus = 'Pending';
        this.claimService.claimStatus.emit(this.claimStatus)
        this.resetNewRecord();
        this.getClaimItems().then(row => {
          if (id == 0) {
            this.AddNew();
          } else if (id == 1) {
            this.claimService.disableSave.emit(false)
            setTimeout(() => {
              $('#adjudicatebutton').focus();
            }, 200);
          } else if (id == 2) {
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
      else if (data.code == '400' && data.hmsMessage.messageShort == 'SERVICE_DATE_CANNOT_BE_GREATER_THAN_RECEIVE_DATE') {
        this.toastrService.error("Service Date Cannot Be Greater Than Received Date", '', {
          timeOut: 8000,
        })
      }
      else if (data.code == '400' && data.hmsMessage.messageShort == 'RECORD_UPDATE_FAILED') {
        this.toastrService.error("DASP Exception 1 override is only allowed in Preauth By Review claim", '', {
          timeOut: 8000,
        });
      }
      else if (data.code == '400' && data.hmsMessage.messageShort == 'OVERRIDE_TYPE_IS_NOT_ALLOWED') {
        this.toastrService.error("Override Type Is Not Allowed", '', {
          timeOut: 8000,
        });
      }
      else if (data.code == '400' && data.hmsMessage.messageShort == 'INTERNAL_SERVER_ERROR') {
        this.toastrService.error("Internal Server Error", '', {
          timeOut: 8000,
        });
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

  /**
  * Update Claim Row Item 
  * @param idx 
  * @param dataRow 
  */
  UpdateInfo(idx, dataRow) {
    if (this.lockClaimItemDentStr != "" && this.lockClaimItemDentStr != undefined) {
      this.toastrService.error(this.lockClaimItemDentStr)
      return
    }
    let promise = new Promise((resolve, reject) => {
      if (this.selectedClaimType == 33) {
        this.claimService.setClaimType.emit(true)
      }
      var labClaimValue
      if (dataRow.labClaim == "") {
        labClaimValue = '';
      } else {
        labClaimValue = +dataRow.labClaim
      }

      var feePaidValue
      if (dataRow.feePaid == "") {
        feePaidValue = '';
      } else {
        feePaidValue = +dataRow.feePaid
      }

      var feeClaimValue
      if (dataRow.feeClaim == "") {
        feeClaimValue = '';
      } else {
        feeClaimValue = +dataRow.feeClaim
      }

      var labPaidValue
      if (dataRow.labPaid == "") {
        labPaidValue = '';
      } else {
        labPaidValue = +dataRow.labPaid
      }

      var cob1Val;
      var cob2Val;
      if (dataRow.cob == "" || dataRow.cob == undefined) {
        cob1Val = null
      }
      else {
        cob1Val = dataRow.cob
      }
      if (dataRow.cob2 == "" || dataRow.cob == undefined) {
        cob2Val = null
      }
      else {
        cob2Val = dataRow.cob2
      }

      if (this.validateAllFields(dataRow, idx)) {
        var claimItemRequest = [];
        const data = {
          procCode: dataRow.pro,
          serviceDate: this.changeDateFormatService.formatDate(dataRow.date),
          itemKey: dataRow.id
        }
        claimItemRequest.push(data);
        this.updateRow(dataRow, resolve, cob1Val, feeClaimValue, feePaidValue, labClaimValue, labPaidValue, cob2Val, idx);
      }
    });
    return promise;
  }


  updateRow(dataRow, resolve, cob1Val, feeClaimValue, feePaidValue, labClaimValue, labPaidValue, cob2Val, idx) {
    var userId = localStorage.getItem('id');
    let RequestedData = {
      "dentalClaimItems": {
        "itemKey": dataRow.id,
        "claimKey": +dataRow.claimKey,
        "itemProcedureCd": dataRow.pro,
        "itemServiceDt": this.changeDateFormatService.formatDate(dataRow.date),
        "itemToothId": dataRow.tooth,
        "itemToothSurfaceTxt": dataRow.suff,
        "itemUnitCount": +dataRow.cnt,
        "overrideTypeKey": +dataRow.orverideType,
        "itemCarrierAmt": cob1Val,
        "itemDeductAmt": +dataRow.Deduct,
        "itemFeeAllowAmt": +dataRow.feeAllow,
        "itemFeeClaimAmt": feeClaimValue,
        "itemFeeEligAmt": +dataRow.feeEligAmount,
        "itemFeePaidAmt": feePaidValue,
        "itemLabAllowAmt": +dataRow.labAllow,
        "itemLabClaimAmt": labClaimValue,
        "itemLabEligAmt": +dataRow.labElig,
        "itemLabPaidAmt": labPaidValue,
        "itemTotalPaidAmt": +dataRow.totalPaid,
        "userId": userId,
        "itemCarrierAmt2": cob2Val,
        "claimTypeKey": this.claimTypeKey
      }
    }
    if (this.ClaimEditMode || this.ClaimViewMode) {
      if (this.unsubOldRequest) {
        this.unsubOldRequest.unsubscribe();
        this.unsubOldRequest = null;
      }
      this.disableSave = true
      this.showLoader = true
      var unsubOldRequest = this.hmsDataService.postApi(ClaimApi.updateClaimItemsUrl, RequestedData).subscribe(data => {
        if (data.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY') {
          this.toastrService.success(this.translate.instant('claims.claims-toaster.claim-item-updated-successfully'), '', {
            timeOut: 8000,
          })
          this.getClaimItems().then(row => {
            this.editMode = false;
            this.claimStatus = 'Pending';
            this.claimService.claimStatus.emit(this.claimStatus)
            this.claimService.claimItemMode.emit(this.editMode)
            this.selectedRowId = '';
            this.resetNewRecord();
            this.showLoader = false
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
          this.toastrService.error(data.result, '', {

            timeOut: 8000,
          });
          this.showLoader = false
          resolve();
        }
        else if (data.code == '400' && data.hmsMessage.messageShort == 'OVERRIDE_TYPE_IS_NOT_ALLOWED') {
          this.toastrService.error("Override Type Is Not Allowed", '', {
            timeOut: 8000,
          });
          this.showLoader = false
          resolve();
        }
        else if (data.code == '400' && data.hmsMessage.messageShort == 'INTERNAL_SERVER_ERROR') {
          this.toastrService.error(data.result, '', {
            timeOut: 8000,
          });
          this.showLoader = false
          resolve();
        }
        else if (data.code == '400' && data.status == 'BAD_REQUEST') {
          this.toastrService.error(data.result, '', {
            timeOut: 8000,
          });
          this.showLoader = false
          resolve();
        }
        this.disableSave = false
      }, (error) => {
      })
    }
    else {
      this.editMode = false;
      this.claimService.claimItemMode.emit(this.editMode)
      this.selectedRowId = '';
      this.newClaimItems[idx] = RequestedData.dentalClaimItems;
      this.ClaimItemInsert.emit(this.newClaimItems);
      this.toastrService.success(this.translate.instant('claims.claims-toaster.claim-item-saved-successfully'), '', {
        timeOut: 8000,
      });
      resolve();
    }
    this.claimService.disableSave.emit(false)
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
        this.EditInfo(index, dataRowValue, true);
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

  /**
  * Delete Claim Item
  * @param idx 
  * @param dataRow 
  */
  DeleteInfo(idx, dataRow) {
    if (this.lockClaimItemDentStr != "" && this.lockClaimItemDentStr != undefined) {
      this.toastrService.error(this.lockClaimItemDentStr)
      return
    }
    var action = "cancel";
    if (dataRow && dataRow.itemKey) {
      action = "Delete";
      this.addMode = false;
      this.exDialog.openConfirm((this.translate.instant('claims.exDialog.are-you-sure')) + action + (this.translate.instant('claims.exDialog.record'))).subscribe((value) => {
        if (value) {
          this.editMode = false;
          this.claimService.claimItemMode.emit(this.editMode)
          if (this.addMode) {
            this.resetNewRecord();
          }
          else {
            if (this.ClaimEditMode || this.ClaimViewMode) {
              let RequestedData = {
                "dentalClaimItems": {
                  "itemKey": +dataRow.itemKey
                }
              }
              this.arrClaimItems = [];
              this.hmsDataService.postApi(ClaimApi.deleteClaimItemUrl, RequestedData).subscribe(data => {
                if (data.hmsMessage.messageShort == 'RECORD_DELETED_SUCCESSFULLY') {
                  this.toastrService.success(this.translate.instant('claims.claims-toaster.record-deleted-successfully'))
                  this.getClaimItems();
                  // Task 636 changes made to resolve issue where No data table did not used to appear if we delete claim items after adjudicate the claim.
                  if (this.arrClaimItems.length == 0) {
                    this.ClaimAddMode = true
                    this.showClaimedColumn = true
                  }
                }
              }, (error) => {
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
  checkDuplicate(i = null, event = null) {
    if (this.addMode) {
      i = null
    }
    let submitData = {};
    let procid = '#txtPro';
    let ServiceDate = "#txtClaimDate"
    if (i != null) {
      procid = procid + i;
      ServiceDate = ServiceDate + i
    }
    var claimItemRequest = [];
    let data = {
      procCode: this.arrNewClaimItem.pro,
      serviceDate: this.changeDateFormatService.formatDate(this.arrNewClaimItem.date)
    }

    let procCodeVal = ""
    if ($(procid).val()) {
      procCodeVal = $(procid).val().toString()
    }

    if (this.copyMode) {
      data = {
        procCode: procCodeVal,
        serviceDate: this.changeDateFormatService.formatDate($(ServiceDate).val().toString())
      }
    }
    if (this.viewMode) { // log 833 client feedback + arun Randev's feedback
      data = {
        procCode: procCodeVal,
        serviceDate: this.changeDateFormatService.formatDate($(ServiceDate).val().toString())
      }
    }
    claimItemRequest.push(data);
    submitData = {
      disciplineKey: 1,
      cardholderkey: this.cardholderKey,
      claimKey: +this.ClaimId || 0,
      claimItem: claimItemRequest
    }
    this.hmsDataService.postApi(ClaimApi.duplicateClaimItemList, submitData).subscribe(data => {
      if (data.code == 200 && data.status === "OK" && data.result.claimItems && data.result.claimItems.length > 0) {
        this.claimItems = data.result.dentalClaimDtoList;
        this.exDialog.openMessage("Other claim(s) exist for this patient/service date combination displaying them now..."
          , "Warning", "warning").subscribe((checked) => {
            setTimeout(() => {
              $('#openClaimList').trigger('click');
            }, 220);
            let unsubDuplicateRequest = this.claimService.openDuplicateDialog.subscribe(value => {
              if (!value) {
              } else {
              }
              unsubDuplicateRequest.unsubscribe();
            })
          })
      }
    }, (error) => {
    });
  }
  validateTooth(idx, evt, dataRow) {
    var reg = /^[0-9]+$/
    if (dataRow.tooth != "" && dataRow.tooth != undefined) {
      dataRow.tooth.toString();
      if (reg.test(dataRow.tooth)) {
        dataRow.tooth = dataRow.tooth
      }
      else {
        dataRow.tooth = ""
        this.toastrService.error('Numeric Digits Allowed', '', {
          timeOut: 8000,
        });
      }
    }
    if (evt.target.value > 99) {
      dataRow.tooth = '';
      if (this.addMode) {
        var txtTooth = <HTMLInputElement>document.getElementById('txtTooth');
        txtTooth.focus();
      }
      else {
        var txtTooth = <HTMLInputElement>document.getElementById('txtTooth' + idx);
        txtTooth.focus();
      }
      this.toastrService.warning(this.translate.instant('claims.claims-toaster.invalid_tooth'), '', {
        timeOut: 8000,
      });
    }
  }

  validateSurface(idx, evt, dataRow) {
    var reg = /^[a-zA-Z\s]+$/
    if (dataRow.suff != "" && dataRow.suff != undefined) {
      dataRow.suff.toString();
      if (reg.test(dataRow.suff)) {
        dataRow.suff = dataRow.suff.toUpperCase();
      }
      else {
        dataRow.suff = ""
        this.toastrService.error('Alphabets Allowed', '', {
          timeOut: 8000,
        });
      }
    }
    let txtSuff
    this.addMode ? txtSuff = <HTMLInputElement>document.getElementById('txtSuff') : txtSuff = <HTMLInputElement>document.getElementById('txtSuff' + idx);
    if (evt.target.value != '' && dataRow.cnt != '' && dataRow.suff.length < dataRow.cnt) {
      txtSuff.classList.add('error_field')
    }
    else if (evt.target.value != '') {
      var RequestedData = {
        "itemToothSurfaceTxt": dataRow.suff
      }
      this.hmsDataService.postApi(ClaimApi.validateSurfaceTextUrl, RequestedData).subscribe(data => {
        if (data.hmsMessage.messageShort == 'INVALID_SURFACE_TEXT') {
          txtSuff.classList.add('error_field')
        } else {
          txtSuff.classList.remove('error_field')
        }
      }, (error) => {
      })
    }
  }

  /* General Information Component*/
  /**
  * Reset New Record Row
  */
  resetNewRecord() {
    document.getElementById('txtSuff').classList.remove('error_field');
    document.getElementById('txtTooth').classList.remove('error_field');
    document.getElementById('txtSuff').removeAttribute('tabindex');
    document.getElementById('txtTooth').removeAttribute('tabindex');
    this.itemUnitCount = ""
    this.toothCodeRequired = ""
    this.useServiceIn = ""
    this.selectedRowId = '';
    this.newRecordValidate = false;
    this.addMode = false;
    this.isUseServiceIn = false;
    this.oldProCode = '';
    this.disableToothCode = false;
    this.arrNewClaimItem = {
      "id": "",
      "Rv": "",
      "date": "",
      "pro": "",
      "tooth": "",
      "suff": "",
      "cnt": "",
      "feeClaim": "",
      "feeEligAmount": "",
      "feeAllow": "",
      "feePaid": "",
      "labClaim": "",
      "labElig": "",
      "labAllow": "",
      "labPaid": "",
      "cob": "",
      "Deduct": "",
      "totalPaid": "",
      "diff": "",
      "RR": "",
      "orverideType": null,
      "orverideText": "",
      "cob2": "",
    };

  }

  /**
  * Validate All Fiellds
  * @param objRow 
  * @param idx 
  */
  validateAllFields(objRow: any, idx: number) {

    let toothIsValid: boolean = false;
    let suffIsValid: boolean = false;
    let overideValid: boolean = false;
    if (objRow.tooth == '' && this.toothCodeRequired == 'T') {
      toothIsValid = true
    }
    if (objRow.suff == '' && this.useServiceIn == 'T') {
      suffIsValid = true
    }
    if (+objRow.orverideType == 0) {
      overideValid = true
      this.toastrService.error("Cannot Add Claim Item. Doesnot Have Any Access For Override", '', {
        timeOut: 8000,
      });
    }

    if (objRow.date && objRow.pro && !overideValid
      && (objRow.feeClaim != '' && objRow.feeClaim != null)) {
      // 1 -> Quikcard condition added for log #472
      if (this.cobVal == 'F' && this.cardBusinessTypeKey != 1) {
        if (objRow.cob > '0' && objRow.cob != '0.00' && objRow.cob != '.0') {
          this.toastrService.error("Card Has no Cob mentioned, please Add to Card too", '', {
            timeOut: 8000,
          });
          this.arrNewClaimItem.cob = parseFloat('0').toFixed(2);
          return false;
        } else {
          return true;
        }
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
        if (txtDate != null) {
          txtDate.focus();
        }
      }
      return false;
    }
  }

  /**
  * Add New Item allowed
  * @param objRow 
  */
  addNewAllowed(objRow: any) {
    if (objRow.date || objRow.pro || (objRow.tooth || !this.isUseServiceIn) || (objRow.suff || !this.isUseServiceIn)
      || objRow.feeClaim != '' || objRow.labClaim != '') {
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
        let daspArrayCd = ["N", "J", "5", "R", "S", "P", "B", "G", "K", "M", "Q", "C", "F", "A", "X"]
        let quikCardArrayCd = ["N", "J", "5", "D", "E", "R"] // not Include Health check 
        let albertaArrayCd = ["N", "J", "5", "R", "V", "2", "H", "0", "S", "P", "B", "G", "K", "M", "Q", "C", "F", "A", "L", "X"]
        let preAuthArrayCd = ["N", "J", "5", "R", "V", "H", "S", "P", "K", "B", "M", "Q", "X"]
        let daspPreAuthArrayCd = ["N", "J", "5", "R", "S", "P", "B", "M", "Q", "X"]
        let albertaArrayCdWithoutDaspAndPreAuth = ["N", "J", "5", "R", "2", "0", "L", "X"]
        let mastareData = data.result;
        let businesTypeOverideArray = []
        this.arrOverrideTypes = []
        mastareData.forEach(value => {
          if (this.cardBusinesTypeCd == Constants.albertaBusinessTypeCd) {
            if (albertaArrayCd.includes(value.overrideTypeCd) && this.claimItemAuth.overides[value.overrideTypeCd] == 'T') {
              businesTypeOverideArray.push(value)
            }
          } else {
            if (quikCardArrayCd.includes(value.overrideTypeCd) && this.claimItemAuth.overides[value.overrideTypeCd] == 'T') {
              businesTypeOverideArray.push(value)
            }
          }
        })
        businesTypeOverideArray.forEach(val => {
          if (this.cardBusinesTypeCd == Constants.albertaBusinessTypeCd) {
            if (this.isDasp == 'T' && this.preAuthReviewClaim) {
              if (daspPreAuthArrayCd.includes(val.overrideTypeCd)) {
                this.arrOverrideTypes.push(val)
              }
            } else if (this.isDasp == 'T') {
              if (daspArrayCd.includes(val.overrideTypeCd)) {
                this.arrOverrideTypes.push(val)
              }
            } else if (this.preAuthReviewClaim) {
              if (preAuthArrayCd.includes(val.overrideTypeCd)) {
                this.arrOverrideTypes.push(val)
              }
            } else {
              if (albertaArrayCdWithoutDaspAndPreAuth.includes(val.overrideTypeCd)) {
                this.arrOverrideTypes.push(val)
              }
            }
          } else {
            if (quikCardArrayCd.includes(val.overrideTypeCd)) {
              this.arrOverrideTypes.push(val)
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
      } else {
        this.arrOverrideTypes = []
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
  ConvertAmountToDecimal(evt, type, dataRow: any = null) {
    if (this.addMode) {
      if (type == 'feeClaim') {
        var feeClaimValue;
        if (evt.target.value == "" || evt.target.value == 0) {
          feeClaimValue = '';
          this.arrNewClaimItem.feeClaim = this.validateDeciamlLength(evt.target.value)
        }
        else {
          feeClaimValue = evt.target.value
          var value = CustomValidators.ConvertAmountToDecimal(feeClaimValue).toString();
          this.arrNewClaimItem.feeClaim = this.validateDeciamlLength(value)
        }
      }
      else if (type == 'labClaim') {
        var labClaimValue
        if (evt.target.value == "" || evt.target.value == 0) {
          labClaimValue = '';
        }
        else {
          labClaimValue = evt.target.value
          var value = CustomValidators.ConvertAmountToDecimal(labClaimValue).toString();
          this.arrNewClaimItem.labClaim = this.validateDeciamlLength(value)
          if (value == '0.00') {
            this.toastrService.error('Numeric Digits Allowed', '', {
              timeOut: 8000,
            });
          }
        }
      }
      else if (type == 'cob') {
        // 1 -> Quikcard condition added for log #472
        if (this.cobVal == 'F' && this.cardBusinessTypeKey != 1) {
          if (evt.target.value != '' && evt.target.value != 0) {
            this.toastrService.error("Card Has no Cob mentioned, please Add to Card too", '', {
              timeOut: 8000,
            });
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.cob = this.validateDeciamlLength(value)
          }
          else {
          }
        }
        else {
          if (evt.target.value != '') {
            // 1 -> Quikcard condition added for log #472
            if (this.cobVal == 'F' && this.cardBusinessTypeKey != 1) {
              this.toastrService.error("Card Has no Cob mentioned, please Add to Card too", '', {
                timeOut: 8000,
              });
            }
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.cob = this.validateDeciamlLength(value)
          }
          else if (evt.target.value == undefined || evt.target.value == "") {
            this.arrNewClaimItem.cob = ''
          }
          else {
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.cob = this.validateDeciamlLength(value)
          }
        }
      }
      else if (type == 'cob2') {
        if (this.cobVal == 'F') {
          if (evt.target.value != '') {
            this.toastrService.error("Card Has no Cob mentioned, please Add to Card too", '', {
              timeOut: 8000,
            });
            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            this.arrNewClaimItem.cob2 = this.validateDeciamlLength(value)
          }
          else {
          }
        }
        else {
          if (evt.target.value != '' && evt.target.value != 0) {
            if (this.cobVal == 'F') {
              this.toastrService.error("Card Has no Cob mentioned, please Add to Card too", '', {
                timeOut: 8000,
              });
            }
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
    }
    else {
      if (dataRow != null) {

        if (type == 'feeClaim') {
          var feeClaimValue
          if (evt.target.value == "" || evt.target.value == 0) {

            var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
            dataRow.feeClaim = this.validateDeciamlLength(value)
            feeClaimValue = '';
          }
          else {
            feeClaimValue = evt.target.value
            var value = CustomValidators.ConvertAmountToDecimal(feeClaimValue).toString();
            dataRow.feeClaim = this.validateDeciamlLength(value)
          }
        }
        else if (type == 'labClaim') {
          var labClaimValue
          if (evt.target.value == "" || evt.target.value == 0) {
            labClaimValue = '';
          }
          else {
            labClaimValue = evt.target.value
            var value = CustomValidators.ConvertAmountToDecimal(labClaimValue).toString();
            this.arrNewClaimItem.labClaim = this.validateDeciamlLength(value)
            if (value == '0.00') {
              this.toastrService.error('Numeric Digits Allowed', '', {
                timeOut: 8000,
              });
            }
          }
        }
        else if (type == 'cob') {
          // 1 -> Quikcard condition added for log #472
          if (this.cobVal == 'F' && this.cardBusinessTypeKey != 1) {
            if (evt.target.value != '' && evt.target.value != 0) {
              this.toastrService.error("Card Has no Cob mentioned, please Add to Card too", '', {
                timeOut: 8000,
              });
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.cob = this.validateDeciamlLength(value)
            }
            else if (evt.target.value == undefined || evt.target.value == '') {
              dataRow.cob = ''
            }
            else {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.cob = this.validateDeciamlLength(value)
            }

          }
          else {
            if (evt.target.value != '' && evt.target.value != 0) {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.cob = this.validateDeciamlLength(value)
            }
            else if (evt.target.value == undefined || evt.target.value == "") {
              dataRow.cob = ''
            }
            else {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.cob = this.validateDeciamlLength(value)
            }
          }
        }
        else if (type == 'Deduct') {
          dataRow.Deduct = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
        }
        else if (type == 'cob2') {
          if (this.cobVal == 'F') {
            if (evt.target.value != '' && evt.target.value != 0) {
              this.toastrService.error("Card Has no Cob mentioned, please Add to Card too", '', {
                timeOut: 8000,
              });
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
              dataRow.cob2 = this.validateDeciamlLength(value)
            }
            else if (evt.target.value == undefined || evt.target.value == '') {
              dataRow.cob2 = ''
            }
            else {
              var value = CustomValidators.ConvertAmountToDecimal(evt.target.value).toString();
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
  ChangeInputDateFormat(idx, event) {
    
    let inputDate = event.target;
    if (inputDate.value != '') {
      var obj = this.changeDateFormatService.changeDateFormatLessThanCurrentMonth(inputDate);
      var self = this
      var todaydate = this.changeDateFormatService.getToday();

      if (obj == null) {
        this.toastrService.warning(this.translate.instant('claims.claims-toaster.invalid-date'), '', {
          timeOut: 8000,
        });
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
            this.toastrService.warning("Please Enter Recieve Date First", '', {
              timeOut: 8000,
            });
          }
          else {
            this.arrClaimItems[idx].date = '';
            var txtDate = <HTMLInputElement>document.getElementById('txtClaimDate' + idx);
            txtDate.focus();
            this.toastrService.warning("Please Enter Recieve Date First", '', {
              timeOut: 8000,
            });
          }
          return;
        } else {

          this.cardHolderRecieveDate = !this.cardHolderRecieveDate ? this.changeDateFormatService.convertDateObjectToString(this.claimService.cardRecieveDate) : this.cardHolderRecieveDate
          IsInValid = this.changeDateFormatService.compareTwoDate(inputDate, this.cardHolderRecieveDate);
          // log 1063
          let claimType = $("#claimType").val().toString().trim();
          if (claimType) {
            if (claimType == "Pre-Authorization - Paper") {
              IsInValid = false;
            }
          }
          //Replace isFutureDate with isFutureDateOrToday for log #797
          var isFutureDate = this.changeDateFormatService.isFutureDateOrToday(inputDate);
          if (isFutureDate && (claimType == "Pre-Authorization - Paper" && this.businessType == '1')) {    // add condition to show toaster in quickard case and not show toaster in adsc case("Pre-Authorization - Paper") 
            this.toastrService.warning(this.translate.instant('claims.claims-toaster.service-date-cannot-be-set'), '', {
              timeOut: 8000,
            });
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
            this.toastrService.warning(this.translate.instant('claims.claims-toaster.service-date-cannot-be-greater'), '', {
              timeOut: 8000,
            });
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
            this.checkDuplicate(idx, event) // log 833 client feedback + arun Randev's feedback
          }
        }
      }
    }
  }
  getClaimItemReviewed(itemKey, event) {
    if (event.target.checked) {
      this.itemReview.push(itemKey);
    } else {
      for (var i = 0; i < this.arrClaimItems.length; i++) {
        if (this.itemReview[i] == itemKey) {
          this.itemReview.splice(i, 1);
        }
      }
    }
    this.claimItemList = [];
    for (var i = 0; i < this.arrClaimItems.length; i++) {
      let key = this.itemReview.filter(val => val == this.arrClaimItems[i].id)
      let obj = {}
      if (key.length != 0 || this.arrClaimItems[i].itemReviewInd) {
        obj["claimItemId"] = this.arrClaimItems[i].id
        obj["status"] = "T"
        this.claimItemList.push(obj);
      } else {
        obj["claimItemId"] = this.arrClaimItems[i].id
        obj["status"] = "F"
        this.claimItemList.push(obj);
      }
    }
    this.claimService.getClaimItemsReview.emit(this.claimItemList)
    return this.claimItemList
  }
  // Function DownArrow Press

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
        var index = parseInt(idx) + 1;
        var dataRowValue = this.arrClaimItems[index];
        this.EditInfo(index, dataRowValue, false);
        setTimeout(() => {
          var txtPro = <HTMLInputElement>document.getElementById(columnId + index);
          txtPro.focus();
        }, 200);
      }
      this.editMode = false;
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
      }
      var dataRowValue = this.arrClaimItems[index]
      this.EditInfo(index, dataRowValue, false)
      setTimeout(() => {
        var txtPro = <HTMLInputElement>document.getElementById(columnId + index);
        txtPro.focus();
      }, 200);
      this.editMode = false;
    });
  }

  onUpAddMode(columnId) {
    if (this.arrClaimItems.length == 0) {
      return false;
    } else {
      this.editSaveColoumnMode = columnId;
      this.SaveInfo(2);
    }
  }

  getSumAmount(column) {
    let sum = 0;
    for (let i = 0; i < this.arrClaimItems.length; i++) {
      let val = 0;
      let val_claim = 0;

      if (this.arrClaimItems[i][column] != '' && this.arrClaimItems[i][column] != null && this.arrClaimItems[i][column] != undefined) {
        val = +this.arrClaimItems[i][column];
      }

      if (column == 'feeClaim') {
        //chnaged aS per latest feed back 
        if (this.arrClaimItems[i]["labClaim"] != '' && this.arrClaimItems[i]["labClaim"] != null && this.arrClaimItems[i]["labClaim"] != undefined) {
          val_claim = +this.arrClaimItems[i]["labClaim"];
        }
      }

      sum += val;
      if (val_claim > 0) {
        sum += val_claim
      }
    }
    return sum;
  }

  getTotalAmount(column){
    let sum = 0;
    for (let i = 0; i < this.claimItems.length; i++) {
      let val = 0;
      let val_claim = 0;

      if (this.claimItems[i][column] != '' && this.claimItems[i][column] != null && this.claimItems[i][column] != undefined) {
        val = +this.claimItems[i][column];
      }

      if (column == 'totalClaimedAmount') {
        if (this.claimItems[i]["totalPayableAmount"] != '' && this.claimItems[i]["totalPayableAmount"] != null && this.claimItems[i]["totalPayableAmount"] != undefined) {
          val_claim = +this.claimItems[i]["totalPayableAmount"];
        }
      }

      sum += val;
      if (val_claim > 0) {
        sum += val_claim
      }
    }
    return sum;
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

  openClaim(claimItem) {
    this.duplicateClaimItems = claimItem.items;
    this.duplicateClaimData = claimItem;
    document.getElementById('btnshowduplicateitemdental').click();
    let unsubDuplicateRequest = this.claimService.openDuplicateDialog.subscribe(value => {
      if (!value) {
      } else {
      }
      unsubDuplicateRequest.unsubscribe();
    })
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
    this.claimService.dupClaimItems.emit(this.duplicateClaimData);
    setTimeout(() => {
      $('#getallComments').trigger("click")
    }, 300);
  }

  loadComments(disciplineKey, claimId, userId, dropdownList) {
    var reqParam = {
      "discipline": disciplineKey,
      "claimKey": claimId,
      "userId": userId,
      "cliamLineItem": [{
        "id": "59341585",
        "itemName": "Line Item-2 / 71201 / 24"
      }],
    }
    this.hmsDataService.postApi(ClaimApi.getClaimItemMessage, reqParam).subscribe(data => {
      if (data.code == 200 && data.status == "OK") {
        this.customComments = data.result
      }
    },(error) => {
    })
  }

  ngOnDestroy() {
    if (this.isDentClaimItem) {
      this.isDentClaimItem.unsubscribe()
    }
  }

}