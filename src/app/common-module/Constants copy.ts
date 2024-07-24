import { IMyDpOptions } from 'mydatepicker';
import { EventEmitter } from '@angular/core';

export class Constants {
   
    //  static loginbaseUrl = 'http://192.168.31.107:8071/'; //(UAT)
    //  static baseUrl = 'http://192.168.31.107:8071/api/';//(UAT)

     static loginbaseUrl = 'http://testhms.quikcard.com:8071/'; //(UAT)
     static baseUrl = 'http://testhms.quikcard.com1/api/';//(UAT)


  
    static titleName = [
    { "id": 2, "title": "Mrs" }, 
    { "id": 3, "title": "Ms" }, 
    { "id": 4, "title": "Miss" }
    ];
    static albertaGov = "AB Gov."; // to check whether which company we are using
    static quikcard = "Quikcard";// to check whether which company we are using

    /** user Id OF dev and local DB*/
    static quikcardUserId = "364"
    static albertaUserId = "365"
    static doctorUserId = "1588"
    static govUserId = "1585" //1585
    static ahcUserId = "1605"
    static quikcardBusnsTypeKey = "1"
    static albertaBusnsTypeKey = "2"
    static albertaBusinessTypeCd = "S"
    static quikcardBusinessTypeCd = "Q"
    static otherPayeeTypeKey = 30

      /**
     * common datatable options to be used in all table configerations
     */
    static dtOptionsConfig = {  
        pagingType: "simple_numbers",
        searching: false, dom: 'ltirp',
        ordering: false,
        pageLength: 5,
        destory: true,
        lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]]
    };

    static viewDentalFeeGuideOptionsConfig = {
        pagingType: "simple_numbers",
        searching: false, dom: 'ltirp',
        ordering: false,
        pageLength: 25,
        lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]]
    };

    static dtOptionsSortingConfig = {
        pagingType: "simple_numbers",
        searching: false,
        dom: 'ltirp',
        ordering: true,
        pageLength: 25,
        lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
        columnDefs: [{ 'type': 'date', 'targets': 3 }]
    };

    static dtOptionsSortingConfigClaimHistory = {
        pagingType: "simple_numbers",
        searching: false,
        dom: 'ltirp',
        ordering: true,
        pageLength: 25,
        lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
        columnDefs: [{ 'type': 'date', 'targets': 3 }],
        order: [ 3, "desc" ]
    };

    static multiSelectOptions = {
        buttonClasses: 'btn btn-default btn-block',  // This used to make button class
        displayAllSelectedText: true,
        showCheckAll: true,                          // provide multiselect option which select all records
        showUncheckAll: true,                        // provide option which unselect all records
        autoUnselect: true,               
    };

    static angular2Multiselect = {
        singleSelection: true,
        text: "Select",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        badgeShowLimit: true,
        enableSearchFilter: true,
        classes: "myclass custom-class",
        noDataLabel: "No Record Found",
        searchBy: ['itemName'],
    };

    static angular2MultiselectForSingleSelection = {
        singleSelection: true,
        showCheckbox: false,
        text: "Select",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        badgeShowLimit: true,
        enableSearchFilter: true,
        classes: "myclass custom-class",
        noDataLabel: "No Record Found",
        searchBy: ['itemName'],
    };

    static multiselect = {
        text: "Select",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        badgeShowLimit: true,
        enableSearchFilter: true,
        classes: "myclass custom-class",
        noDataLabel: "No Record Found",
        searchBy: ['itemName']
    };

    static multiSelectDropdown = {
        text: "Select",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableSearchFilter: true,
        classes: "myclass custom-class",
        noDataLabel: "No Record Found",
        searchBy: ['itemName'],
        badgeShowLimit: true,
        disabled: false
    }

    static disabledMultiSelectDropdown = {
        text: "Select",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableSearchFilter: true,
        classes: "myclass custom-class",
        noDataLabel: "No Record Found",
        searchBy: ['itemName'],
        badgeShowLimit: true,
        disabled: true
    }

    static singleSelectDropdown = {
        singleSelection: true,
        showCheckbox: true,
        text: "Select",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableSearchFilter: true,
        classes: "myclass custom-class",
        noDataLabel: "No Record Found",
        searchBy: ['itemName']
    }

    static multiSelectBatchDropdown = {
        text: "Select",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableSearchFilter: true,
        classes: "myclass custom-class",
        noDataLabel: "No Record Found",
        searchBy: ['itemName'],
        badgeShowLimit: 1
    }

    static operatorRoute = ['/dashboard', '/card', '/company', '/rules', '/claim', '/serviceProvider', '/claimDashboard']
    static doctorRoute = ['/reviewer']
    static encryptDecryptPassword = "encryptDecryptUrl"
}

/**
* @description : This Class (CommonDatePickerOptions) is used for Common options/properties of My Date Picker.
*/
export class CommonDatePickerOptions {
    static myDatePlaceholder: string = 'dd/mmm/yyyy';
    static myDateFormat: string = 'dd/mmm/yyyy';

    static myDatePickerOptions: IMyDpOptions = {
        firstDayOfWeek: 'su',
        dateFormat: 'dd/mmm/yyyy',
        minYear: 1800,
        maxYear: 2200,
        indicateInvalidDate: true,
        markCurrentDay: true,
        showSelectorArrow: false,
        showClearDateBtn: true
    };

    static myDatePickerDisableFutureDateOptions: IMyDpOptions = {
        firstDayOfWeek: 'su',
        dateFormat: 'dd/mmm/yyyy',
        minYear: 1800,
        maxYear: 2200,
        indicateInvalidDate: true,
        markCurrentDay: true,
        disableSince: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() + 1 }
    };

    static myDatePickerFilterOptions: IMyDpOptions = {
        firstDayOfWeek: 'su',
        dateFormat: 'dd/mmm/yyyy',
        minYear: 1800,
        maxYear: 2200,
        indicateInvalidDate: false,
        markCurrentDay: true,
        showSelectorArrow: false
    };
}
