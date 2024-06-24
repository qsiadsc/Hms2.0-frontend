import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, FormControl } from '@angular/forms';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service'
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service';
import { DatatableService } from '../../common-module/shared-services/datatable.service'
import { CustomValidators } from '../../common-module/shared-services/validators/custom-validator.directive';
import { CommonDatePickerOptions, Constants } from '../../common-module/Constants';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';
import { Observable } from 'rxjs/Rx';
import { FeeGuideApi } from '../fee-guide-api';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem, RemoteData } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
@Component({
    selector: 'app-vission-proc-code',
    templateUrl: './vission-proc-code.component.html',
    styleUrls: ['./vission-proc-code.component.css']
})

export class VissionProcCodeComponent implements OnInit {
    visionShortDescL: string;
    visionIdL: string;
    visionProcedureLongDescL: any;
    visionProcedureUnitCountL: any;
    hasSurfaceL: any;
    visionProcIdL: any;
    @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
        localStorage.setItem('isReload', 'T')
    }

    public showLoader: boolean = false
    ObservableClaimObj: any;
    public checkBan: boolean = true;
    public columns: { title: any; data: string; }[];
    public visionProcCode: FormGroup;
    public addVisionProcCodeForm: FormGroup;
    public visionProcDataRemote: RemoteData;
    public procDescRemote: RemoteData;
    showSearchTable: boolean = false;
    viewMode: boolean = false;
    addMode: boolean = true;
    editMode: boolean = false;
    visionServiceKey: any;
    selectedProcDesc: any;
    getDetails: any;
    buttonText: string = "Save";
    rowId: any;
    visionProcCodeCheck = [{
        "searchVisionProcCode": 'F',
        "editVisionProcCode": 'F',
        "viewVisionProcCode": 'F',
        "addVisionProcCode": 'F',
    }]
    currentUser: any;

    constructor(
        private hmsDataService: HmsDataServiceService,
        private changeDateFormatService: ChangeDateFormatService,
        public dataTableService: DatatableService,
        private fb: FormBuilder,
        private translate: TranslateService,
        private route: ActivatedRoute,
        private currentUserService: CurrentUserService,
        private completerService: CompleterService,
        private toastrService: ToastrService,
        private renderer: Renderer2
    ) {
        this.visionProcDataRemote = completerService.remote(
            null,
            "visionServiceId",
            "visionServiceId"
        );
        this.visionProcDataRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
        this.visionProcDataRemote.urlFormater((term: any) => {
            return FeeGuideApi.getPredectiveVisionProcCode + `/${term}`;
        });
        this.visionProcDataRemote.dataField('result');

        this.procDescRemote = completerService.remote(
            null,
            "visionProcedureLongDesc",
            "visionProcedureLongDesc"
        );
        this.procDescRemote.requestOptions({ headers: { 'Content-Type': 'application/json', 'Authorization': 'bearer ' + localStorage.getItem('currentUser') } });
        this.procDescRemote.urlFormater((term: any) => {
            return FeeGuideApi.predictiveVisionProcedureSearch + `/${term}`;
        });
        this.procDescRemote.dataField('result');
    }

    ngOnInit() {
        if (localStorage.getItem('isReload') == 'T') {
            this.currentUserService.getUserAuthorization().then(res => {
                this.currentUser = this.currentUserService.currentUser;
                let visionProcCodeArray = this.currentUserService.authChecks['VPC']
                this.getAuthCheck(visionProcCodeArray)
                this.dataTableInitialize();
                localStorage.setItem('isReload', '')
            })
        } else {
            this.currentUserService.getUserAuthorization().then(res => {
                this.currentUser = this.currentUserService.currentUser;
                let visionProcCodeArray = this.currentUserService.authChecks['VPC']
                this.getAuthCheck(visionProcCodeArray)
                this.dataTableInitialize();
            })
        }

        this.visionProcCode = this.fb.group({
            procId: [''],
            unitCount: ['', CustomValidators.onlyNumbers],
            useSurface: [''],
            visionProcDesc: ['']
        })
        this.addVisionProcCodeForm = this.fb.group({
            visionService: ['', Validators.required],
            procId: ['', [Validators.required, Validators.maxLength(5)]],
            descLong: ['', CustomValidators.notEmpty],
            descShort: ['', [Validators.maxLength(70), CustomValidators.notEmpty]],
            vissionProcedureKey: ['']
        })

        this.renderer.selectRootElement('#vpc_procId').focus();

        var self = this
        $(document).on("click", "table#visionProcedureCode .view-ico", function () {
            self.rowId = $(this).data('id')
            self.enableProcedureViewMode(self.rowId);
        })

        $(document).on("click", "table#visionProcedureCode .edit-ico", function () {
            self.rowId = $(this).data('id')
            self.enableEditView(self.rowId);
        })

        $(document).on('mouseover', '.edit-ico', function () {
            $(this).attr('title', self.translate.instant('common.edit'));
        })

        $(document).on('mouseover', '.view-ico', function () {
            $(this).attr('title', self.translate.instant('common.view'));
        })

        $(document).on('keydown', '#dentalScheduleList .btnpickerenabled', function (event) {
            var tableId = $(this).closest('table').attr('id');
            self.filterSearchOnEnter(event, tableId);
        })
    }

    dataTableInitialize() {
        this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
            if ('serviceProvider.BAN-search.list' == this.translate.instant('serviceProvider.BAN-search.list')) {
            } else {
                this.columns = [
                    { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.serviceId'), data: 'visionServiceId' },
                    { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.proc-id'), data: 'visionProcedureId' },
                    { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-short'), data: 'visionProcedureDesc' },
                    { title: this.translate.instant('feeGuide.procedureCode.proc-code-listing.desc-long'), data: 'visionProcedureLongDesc' },
                    { title: this.translate.instant('common.action'), data: 'visionProcedureKey' }]
                this.checkBan = false;
                this.ObservableClaimObj.unsubscribe();
            }
        });
    }

    getVissionProc() {
        this.showSearchTable = true
        var hasSurfaceId;
        this.visionIdL = ''
        $('#vpc_dentalServiceId').val('')
        this.visionShortDescL = ''
        if (this.visionProcCode.value.useSurface && this.visionProcCode.value.useSurface == true) {
            hasSurfaceId = 'T'
        } else {
            hasSurfaceId = ''
        }
        var reqParam = [
            { 'key': 'visionProcedureId', 'value': this.visionProcCode.value.procId },
            { 'key': 'visionProcedureUnitCount', 'value': '' },
            { 'key': 'visionProcedureUseSurfaceI', 'value': '' },
            { 'key': 'visionProcedureLongDesc', 'value': this.visionProcCode.value.visionProcDesc }
        ]
        this.visionProcIdL = this.visionProcCode.value.procId
        this.hasSurfaceL = hasSurfaceId ? 'T' : 'F'
        this.visionProcedureUnitCountL = this.visionProcCode.value.unitCount
        this.visionProcedureLongDescL = this.visionProcCode.value.visionProcDesc

        var tableActions =
            [
                { 'name': 'view', 'class': 'table-action-btn view-ico', 'icon_class': 'fa fa-eye', 'title': 'View', 'showAction': this.visionProcCodeCheck[0].viewVisionProcCode },
                { 'name': 'edit', 'class': 'table-action-btn edit-ico', 'icon_class': 'fa fa-pencil', 'title': 'Edit', 'showAction': this.visionProcCodeCheck[0].editVisionProcCode }
            ];
        var url = FeeGuideApi.searchVisionProcedureByFilter;
        var tableId = "visionProcedureCode"
        if (!$.fn.dataTable.isDataTable('#visionProcedureCode')) {
            this.dataTableService.jqueryDataTableForModal(tableId, url, 'full_numbers', this.columns, 5, true, true, 'lt', 'irp', undefined, [0, 'asc'], '', reqParam, tableActions, 4, null, "addVisionProcCode", null, null, null, [0, 1], [2, 3, 4], '', [0], [1, 2, 3, 4])
        } else {
            this.dataTableService.jqueryDataTableReload(tableId, url, reqParam)
        }
        return false;
    }

    resetVissionProc() {
        this.visionProcCode.reset();
        this.visionProcIdL = '';
        this.visionProcedureLongDescL = '';
        this.visionProcedureUnitCountL = '';
        this.hasSurfaceL = '';
        this.showSearchTable = false;
    }

    onSelect(selected: CompleterItem) {
        if (selected) {
            this.visionServiceKey = selected.originalObject.visionServiceKey
        } else { }
    }

    saveProcedureCode() {
        if (this.addVisionProcCodeForm.valid) {
            let RequestedData = {
                "visionServiceKey": this.visionServiceKey,
                "visionProcedureId": this.addVisionProcCodeForm.value.procId,
                "visionProcedureDesc": this.addVisionProcCodeForm.value.descShort,
                "visionProcedureLongDesc": this.addVisionProcCodeForm.value.descLong,
            }
            let url = ""
            let message = ""
            if (this.addMode) {
                url = FeeGuideApi.saveVisionProcCode
            }
            if (this.editMode) {
                url = FeeGuideApi.updateVisionProcCode
                RequestedData['visionProcedureKey'] = this.rowId;
            }
            this.hmsDataService.postApi(url, RequestedData).subscribe(data => {
                if (data.code == 200 && data.status === "OK") {
                    if (this.addMode) {
                        this.toastrService.success(this.translate.instant('feeGuide.toaster.visionprocCodeAddSuccess'))
                        this.resetaddProCodeOnClose()
                        this.hmsDataService.OpenCloseModal("vpca_close");
                        if (this.showSearchTable) {
                            this.getProcCodeListByGridFilteration('visionProcedureCode')
                        }
                    }
                    if (this.editMode) {
                        this.toastrService.success(this.translate.instant('feeGuide.toaster.visionProcCodeUpdateSuccess'))
                        this.resetaddProCodeOnClose()
                        this.hmsDataService.OpenCloseModal("vpca_close");
                        this.getProcCodeListByGridFilteration('visionProcedureCode')
                    }
                } else if (data.code == 400 && data.hmsMessage.messageShort == "PROCEDURE_CODE_ALREADY_EXIST") {
                    this.toastrService.warning(this.translate.instant('feeGuide.toaster.procCodeAlreadyExists'))
                }
                else {
                    if (this.addMode) {
                        this.toastrService.error(this.translate.instant('feeGuide.toaster.visionProcCodeNotAdded'))
                    }
                    if (this.editMode) {
                        this.toastrService.error(this.translate.instant('feeGuide.toaster.visionProcCodeNotUpdated'))
                    }
                    this.resetaddProCodeOnClose()
                }
            })
        } else {
            this.validateAllFormFields(this.addVisionProcCodeForm);
        }
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

    resetaddProCodeOnClose() {
        this.addVisionProcCodeForm.reset();
        this.renderer.selectRootElement('#vpc_procId').focus();
    }

    getProcCodeListByGridFilteration(tableId) {
        this.showSearchTable = true
        var appendExtraParam = {}
        var params = this.dataTableService.getFooterParamsSearchTable(tableId, appendExtraParam)
        var url = FeeGuideApi.searchVisionProcedureByFilter;
        this.dataTableService.jqueryDataTableReload(tableId, url, params)
    }

    resetProcListingFilter() {
        this.dataTableService.resetTableSearch();
        this.getProcCodeListByGridFilteration("visionProcedureCode")
    }

    fillProcedureCodeDetails(getDetails) {
        this.addVisionProcCodeForm.patchValue({
            procId: getDetails.visionProcedureId,
            descLong: getDetails.visionProcedureLongDesc,
            descShort: getDetails.visionProcedureDesc,
            visionService: getDetails.visionServiceId
        });
    }

    enableAddMode() {
        this.addVisionProcCodeForm.enable();
        this.addMode = true;
        this.viewMode = false;
        this.editMode = false;
        this.buttonText = "Save"
        var self = this;
        setTimeout(function () {
            self.renderer.selectRootElement('#vpca_vissionService').focus();
        }, 1000);
    }

    enableProcedureViewMode(rowId) {
        this.addMode = false;
        this.viewMode = true;
        this.editMode = false;
        this.editProcedure(rowId).then(res => {
            this.addVisionProcCodeForm.disable();
            this.fillProcedureCodeDetails(this.getDetails);
        })
    }

    enableEditView(rowId) {
        this.addMode = false;
        this.viewMode = false;
        this.editMode = true;
        this.buttonText = "Update";
        this.editProcedure(rowId).then(res => {
            this.addVisionProcCodeForm.enable();
            this.fillProcedureCodeDetails(this.getDetails);
        })
    }

    editProcedure(rowId) {
        let submitData = {
            "visionProcedureKey": rowId
        }
        let promise = new Promise((resolve, reject) => {
            this.hmsDataService.postApi(FeeGuideApi.getVisionProcedure, submitData).subscribe(data => {
                if (data.code == 200 && data.status === "OK") {
                    this.getDetails = data.result;
                    resolve()
                } else {
                    resolve()
                    return false;
                }
            });
        })
        return promise
    }

    onProcDescSelect(selected: CompleterItem) {
        if (selected) {
            this.selectedProcDesc = selected.originalObject.visionProcedureDesc;
        } else { }
    }

    filterSearchOnEnter(event, tableId: string) {
        if (event.keyCode == 13) {
            event.preventDefault();
            this.getProcCodeListByGridFilteration(tableId);
        }
    }

    getAuthCheck(visionProcCodeArray) {
        let userAuthCheck = []
        if (this.currentUser.isAdmin == 'T') {
            this.visionProcCodeCheck = [{
                "searchVisionProcCode": 'T',
                "editVisionProcCode": 'T',
                "viewVisionProcCode": 'T',
                "addVisionProcCode": 'T',
            }]
        } else {
            for (var i = 0; i < visionProcCodeArray.length; i++) {
                userAuthCheck[visionProcCodeArray[i].actionObjectDataTag] = visionProcCodeArray[i].actionAccess
            }

            this.visionProcCodeCheck = [{
                "searchVisionProcCode": userAuthCheck['VPC257'],
                "editVisionProcCode": userAuthCheck['SVP258'],
                "viewVisionProcCode": userAuthCheck['VPC260'],
                "addVisionProcCode": userAuthCheck['SVP259'],
            }]
        }
        return this.visionProcCodeCheck
    }

    focusNextEle(event, id) {
        $('#' + id).focus();
    }

    isNumberKey(event) {
        return (event.ctrlKey || event.altKey
            || (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false)
            || (95 < event.keyCode && event.keyCode < 106)
            || (event.keyCode == 8) || (event.keyCode == 9)
            || (event.keyCode > 34 && event.keyCode < 40)
            || (event.keyCode == 46))
    }

    isEnterKey(event) {
        this.getVissionProc();
    }

}