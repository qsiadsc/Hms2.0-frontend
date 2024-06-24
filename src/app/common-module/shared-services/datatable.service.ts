/* This Service File Basically Performs common Functions on Datatable 
which needs to be accessed all over the Application
where Datatable will be Used. */
import { Component, OnInit, Input, Output, EventEmitter, ɵConsole } from '@angular/core';
import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { QueryList, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { RequestOptions } from '@angular/http';
import { HttpClient, HttpResponse } from '@angular/common/http';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { CurrentUserService } from '../shared-services/hms-data-api/current-user.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ToastrService } from 'ngx-toastr'; //add toster service
import { TranslateService } from '@ngx-translate/core';
import { data } from 'jquery';
import { table } from 'console';
import { SHARED_FORM_DIRECTIVES } from '@angular/forms/src/directives';
import { Z_FULL_FLUSH } from 'zlib';
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Injectable()
export class DatatableService {
  mailOutKey: any;
  providerWithoutEFTSelectedRowData;
  selectedPlanRowData: Object | any[];
  selectedCompanyUploadDocRowData: Object | any[];
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<any>;
  reqParam
  reqDateParams;
  token;
  disciplineKey;
  pageLength;
  payablebrokerSelectedRowData: any
  coId: any;
  brokerSelectedRowData
  companySelectedRowData
  cardSelectedRowData
  reportsSelectedRowData
  reportsSelectedRowDataManage
  filesSelectedRowData
  selectedRefundChequeRowData
  selectedReverseChequeRowData
  histFilesSelectedRowData
  notificationListRowData
  fundingSummarySelectedRowData
  cardPrintRequestData;
  claimKey;
  totalPreAuthClaimRecords;
  coIdChange: Subject<string> = new Subject<string>();
  coKeyChange: Subject<string> = new Subject<string>();
  totalRecords
  totalRecords_notificationAction
  totalRecords_claimAboutToExpire
  totalRecords_releaseClaims
  totalRecords_notification
  pdfUrl
  prevReq: boolean = false
  upComingTransactionList: Object | any[];
  uftSelectedRowData: any;
  refundSelectedRowData: any
  uftSelectedRowCokey: any;
  uftSelectedData: any;

  uftSelectedRowClaimType: any;
  selectedRowClaimsattachedToTrans
  uftSelectedRowType: any;
  selectedRowTransSearch
  selectedRowPaymentSearch
  referClaimDisciplinekey: any;
  referClaimKey: any;
  claimReferalKey: any;
  mailLabelFilteredData: Object | any[];
  compBalanceGraph = new EventEmitter();
  showReortsEmitter = new EventEmitter();
  companyContactEmitter = new EventEmitter();
  graphData: any;
  serviceProviderListData;
  totalSumCount = new EventEmitter();
  getFilesStatusCdaNet = new EventEmitter();
  CompanycommentsHasData = new EventEmitter();
  amountTotal = '0.00';
  amountNegTotal = '0.00';
  companyBalanceSelectedRowData: Object | any[];
  emitobj = new EventEmitter();
  emitAmount = new EventEmitter();
  emitAmountBatch = new EventEmitter();
  emitAmountBatchNo = new EventEmitter();
  emitAmountStatus = new EventEmitter();
  emitAmountError = new EventEmitter();
  brokerListTableEmitter = new EventEmitter();
  companyListTableEmitter = new EventEmitter();
  cardCommentImportance = new EventEmitter();
  fileTypeRequestLoaded = new EventEmitter();
  bankRcValues = new EventEmitter();
  emptyDataTable = new EventEmitter();
  public showPendingAdEmitter = new EventEmitter();
  unprocessedDataRow;
  fileTypeDataRow;
  currentTableId;
  showClickedfirstItem = true;
  unprocessedSelectedRowData;
  terminateCompanySelectedRowData;
  errorResponse = new EventEmitter();
  cardCountByCompanyData = new EventEmitter()
  totalRecords_releaseClaimsAtion: number;
  totalRecords_notificationAction_Expire: any;
  isTableReload: boolean = false
  dcpKey
  selectedRowReissuePaymentData
  CALpayeeName: any;
  CALtransAmt: any;
  CALrefCd: any;
  CALpayeeNo: any;
  CALclaimNumber: any;
  CALclaimKey: any;
  CALpayee: any;
  isNegativeTableReload: boolean = false
  isReceiptsTableReload: boolean = false
  claimNumber
  businessType
  showGraph = new EventEmitter()
  totalRecords_FinalNoticeList
  totalRecords_expireClaimList
  companyList: any;
  planExists = new EventEmitter();
  constructor(private currentUserService: CurrentUserService,
    private http: Http,
    private httpClient: HttpClient,
    private toastrService: ToastrService,
    private changeDateFormatService: ChangeDateFormatService,
    private router: Router,
    private translate: TranslateService) {
    this.token = currentUserService.token;
  }
  upperCase(formdata) {
    let form = formdata.value;
    for (var key in form) {
      if (form.hasOwnProperty(key)) {
        if (form[key]) {
          formdata.value[key] = form[key].toUpperCase()
        }
      }
    }
    return form
  }
  getCompanyDetails(info: any): void {
    this.coIdChange.next(info.id);
    this.coKeyChange.next(info.coKey)
  }

  buildDtOptions(url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam: String, rowClick: boolean): DataTables.Settings {
    this.reqParam = reqParam
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    const that = this;
    var opt = {
      pagingType: pagingType,
      pageLength: pageLength,
      serverSide: serverSide,
      processing: processing,
      dom: finalDom,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      }],

      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          self.getCompanyDetails(data);
        });
        return row;
      },
      ajax: (dataTablesParameters: any, callback) => {
        that.httpClient
          .post<DataTablesResponse>(
            url,
            Object.assign(dataTablesParameters, this.reqParam), {}
          ).subscribe(resp => {

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data
            });
          });
      },
      columns: columns
    };
    return opt;
  }

  /* Function for Reloading DataTable with Page Reload.
  Parameters: 
  dtElements: dtElements of DataTable
  tableID: Table Id which we want to Reload
  trr: dtTrigger Object of Table
  enableColumnFilter: Enable Column Filter
  */
  reloadTableElem(dtElements, tableID, trr, enableColumnFilter) {

    if (!dtElements && (tableID == 'claim-comments-view' || tableID == 'claim-system-message-view' || tableID == 'custom-comments-view')) {
      $('#' + tableID).DataTable().destroy();
      trr.next();
      return true
    }
    if (trr.observers) {
      dtElements.forEach((dtElement: DataTableDirective, index: number) => {
        dtElement.dtInstance.then((dtInstance: any) => {
          if (dtInstance.table().node().id == tableID) {
            dtInstance.table().destroy();
            trr.next();
            if (enableColumnFilter) {
              this.columnFilter(dtElements, tableID)
              dtInstance.columns().every(function () {
                $('input select', this.footer()).val("");
              })
            }
          }
        });
      });
    }
  }

  /* Function for Filtering Column Data
  Parameters: 
  dtElements: dtElements of DataTable
  tableID: Table Id which we want to Filter
  */
  jqueryDataTableComment(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, flagColumn, dateCols = null, isRedirect = null, alingRight = null, cardText = null, dateColsAlign = null) {
    flagColumn = flagColumn || undefined;
    cardText = cardText || undefined;
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          // log no 852
          if (tableId == 'CardholderComment') {
            full = {
              cardCoTxt: full.chComTxt,
              commentImportance: full.chComImportance,
              userGroupId: full.userKey,
              userGroupName: full.department,
              chComKey: full.chComKey,
              expiredOn: full.expiredOn,
            };
          }
          var str = ''  //Issue_No 727
          var disableBtn = '';
          var value = full.cardCoTxt || full.commentText;
          for (var i = 0; i < tableActions.length; i++) {
            if (tableId === 'companyComments') {
              if (full.userGroupName == undefined || full.userGroupName === '') {   // Issue_no-868
                disableBtn = 'disabled';
              } else {
                disableBtn = '';
              }
              if (tableActions[i].name == "delete" && tableActions[i]['showAction'] != "F") {
                if (disableBtn != 'disabled') {
                  str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '' + disableBtn + '" href="javascript:void(0)" data-id = "' + data + '"title= Delete><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
              }
              if (tableActions[i].name == "edit" && tableActions[i]['showAction'] != "F") {
                let comText = full.commentText;
                if (disableBtn != 'disabled') {          
                }
              }
            } else {
              if (tableId == 'cardComments') {
                if (full.userGroupName != undefined && full.userGroupName === '') {   // Issue_no-727
                  disableBtn = 'disabled';
                } else {
                  disableBtn = '';
                }
              }

              if (tableId == 'cardCommentsCombined') {
                if (full.userGroupName != undefined && full.userGroupName === '') {
                  disableBtn = 'disabled';
                } else {
                  disableBtn = '';
                }               
              }

              let chComKey = full.cardComKey || 0
              if (tableActions[i].name == "delete" && tableActions[i]['showAction'] != "F") {
                if (disableBtn != 'disabled') {
                  if (tableId == 'CardholderComment') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '' + disableBtn + '" href="javascript:void(0)" data-id = "' + data + '" data-key = "' + full.cardCoTxt
                      + '"data-coKey = "' + full.chComKey + '" data-imp = "' + full.commentImportance + '" data-dept = "' + full.userGroupName + '" data-user = "' + full.userGroupId + '"data-expiredOn="' + full.expiredOn + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  } else if (tableId == 'cardholderPersonComment') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '' + disableBtn + '" href="javascript:void(0)" data-id = "' + data + '" data-personComTxt = "' + full.personComTxt + '" data-personKey = "' + full.personKey
                      + '"data-personComKey = "' + full.personComKey + '" data-impFlag = "' + full.dispCommentInd + '" data-dept = "' + full.userGroupName + '" data-user = "' + full.userGroupId + '"data-expiredOn="' + full.expiredOn + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  } else {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '' + disableBtn + '" href="javascript:void(0)" data-id = "' + data + '"  data-coKey = "' + chComKey + '"title= Delete><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  }
                }
              }
              if (tableActions[i].name == "edit" && tableActions[i]['showAction'] != "F") {
                if (disableBtn != 'disabled') {
                  if (tableId == 'CardholderComment') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '' + disableBtn + '" href="javascript:void(0)" data-id = "' + data + '" data-key = "' + full.cardCoTxt
                      + '"data-coKey = "' + full.chComKey + '" data-imp = "' + full.commentImportance + '" data-dept = "' + full.userGroupName + '" data-user = "' + full.userGroupId + '"data-expiredOn="' + full.expiredOn + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  } else if (tableId == 'cardholderPersonComment') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '' + disableBtn + '" href="javascript:void(0)" data-id = "' + data + '" data-personComTxt = "' + full.personComTxt + '" data-personKey = "' + full.personKey
                      + '"data-personComKey = "' + full.personComKey + '" data-impFlag = "' + full.dispCommentInd + '" data-dept = "' + full.userGroupName + '" data-user = "' + full.userGroupId + '"data-expiredOn="' + full.expiredOn + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  } else {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '' + disableBtn + '" href="javascript:void(0)" data-id = "' + data + '" data-key = "' + full.commentText
                      + '"data-coKey = "' + chComKey + '" data-imp = "' + full.cardImportance + '" data-dept = "' + full.userGroupName + '" data-user = "' + full.userGroupId + '"data-expiredOn="' + full.expiredOn + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  }
                }
              }

              if (tableActions[i].name == "expand" && tableActions[i]['showAction'] != "F") {
                if (value.length >= 30) {
                  str = str + '<a  class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-key = "' + full.commentText +
                    '" title = Expand Comment "' + '"data-imp = "' + full.cardImportance + '" data-dept = "' + full.userGroupName + '" data-user = "' + full.userGroupId + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
              }
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': dateColsAlign,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'PapComment' || tableId == 'comments' || tableId == 'cardComments' || tableId == 'cardCommentsCombined' || tableId == 'CardholderComment' || tableId == 'companyComments' || tableId == 'planComments' || tableId == 'cardholderPersonComment') {
            return data;

          }
          //#1199 Below condition is to show data in popup in all comments history.
          if (tableId == 'allCommentsHistory') {
            return data;
          }
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': flagColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ""

          if (data == "Y") {
            //#1199 Below condition is commented and written further to show data in popup in all comments history. 
            if (tableId == "PapComment" || tableId == 'comments' || tableId == "cardComments" || tableId == "cardCommentsCombined" || tableId == 'companyComments' || tableId == 'CardholderComment' || tableId == 'allCommentsHistory') {
              //#1199 Below line commented and condition added further to show green flag when important when tableId = cardCommentsCombined .       
              //#1199 Below condition is commented and written further to show data in popup in all comments history. 
              if (tableId == "cardCommentsCombined" || tableId == "allCommentsHistory") {
                str = "<span style='float:right' class='rightAlignFlag'><i class='fa fa-flag green-flag' aria-hidden='true'></i></span>"
              }
              else{
              str = "<span style='float:right' class='rightAlignFlag'><i class='fa fa-flag' aria-hidden='true'></i></span>"
              }
            }
            else if(tableId == 'spImpCommentsList'){
              str = "<span style='float:right' class='flag'><i class='fa fa-flag' aria-hidden='true'></i></span>"
            }
            else {
              str = "<span class='flag'><i class='fa fa-flag' aria-hidden='true'></i></span>"
            }
          } else if (data == "T") {
            if (tableId == 'cardholderPersonComment') {
              str = "<span style='float:right' class='rightAlignFlag'><i class='fa fa-flag' aria-hidden='true'></i></span>"
            }
          } else {
            //#1199 Below line added to show grey flag when not important.
            if (tableId == "cardCommentsCombined") {
              str = "<span style='float:right' class='rightAlignFlag'><i class='fa fa-flag grey-flag ' aria-hidden='true'></i></span>"
            }
            //#1199 Below condition is to show data in popup in all comments history.
            if (tableId == "allCommentsHistory") {
              str = "<span style='float:right' class='rightAlignFlag'><i class='fa fa-flag grey-flag ' aria-hidden='true'></i></span>"
            }
          }
          return str
        }
      },
      {
        'targets': cardText,
        'searchable': false,
        'orderable': false,
        'className': "amount_right_grid show-read-more",
        'render': function (data, type, full, meta) {
          var str = full.cardCoTxt || full.commentText;
          var maxLength = 30;
          if (str.length > maxLength) {
            str = str.substring(0, maxLength);
          }
          return str
        }
      },
      ],

      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        "data": function (d) {
          if (tableId == "cardCommentsCombined") {
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value'];
          }
          return JSON.stringify(d);
        },

        "dataSrc": function (json) {

          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            //#1199 Below code is to filter data without expiry date in all comments history popup. 
            if (tableId == 'allCommentsHistory') {
              let allCommentsPopupArray = []
              for (let i = 0; i < (json.result.data).length; i++) {        
                if (json.result.data[i].expiredOn != "") {          
                  allCommentsPopupArray.push(json.result.data[i])
                }        
              }
              json.result.data = allCommentsPopupArray
            }
            // broker search for comments are save empty string but it can save null value in expiry date labels
            if (tableId == 'comments') {
              for (let i = 0; i < (json.result.data).length; i++) {        
                if (json.result.data[i].expiredOn == null) {          
                  json.result.data[i].expiredOn = ""
                }        
              }
            }
            if (tableId == 'companyComments') {
              self.CompanycommentsHasData.emit(json.result.data || 0)
            }
            if (tableId == 'cardCommentsCombined') {
              self.CompanycommentsHasData.emit(json.result.data || 0)
            }
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            // Date-Format changes which comes from Backend
            let is_imp = false;
            if (dateCols) {
              for (var i = 0; i < json.result.data.length; i++) {
                for (var j = 0; j < dateCols.length; j++) {
                  if (json.result.data[i][dateCols[j]] != "") {
                    var dateValue = self.changeDateFormatService.changeDateByMonthName(json.result.data[i][dateCols[j]]);
                    json.result.data[i][dateCols[j]] = dateValue;
                  }
                }
                if (json.result.data[i].commentImportance == 'Y') {
                  is_imp = true;
                }
              }
              if (tableId == 'cardComments' || tableId == 'cardCommentsCombined') {
                self.cardCommentImportance.emit(is_imp)
              }
            }
            return json.result.data;
          }
          else if (json.code == 404) {
            if (tableId == 'companyComments') {
              self.CompanycommentsHasData.emit(0)
            }
            if (tableId == 'cardCommentsCombined') {
              self.CompanycommentsHasData.emit(0)
            }

            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
  }

  columnFilter(dtElements, tableID) {
    dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      dtElement.dtInstance.then((dtInstance: any) => {
        if (dtInstance.table().node().id == tableID) {
          dtInstance.columns().every(function () {
            const that = this;
            $('input.tFootInput, select.tFootSelect', this.footer()).on('keyup change', function () {
              if (that.search() !== this['value']) {
                that
                  .search(this['value'])
                  .draw();
              }
            });
          });
        }
      });
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * Get Data Object of All Inline Rows
   *  
   */
  inlineTableData(tableId) {
    var self = this
    var tableData = []
    $("#" + tableId + " tr.tableRow").each(function () {
      var tableRow = $(this)
      var rowData = {}
      tableRow.find(".editableInput").each(function () {
        var key = $(this).data('updateid')
        if ($(this).data('type') == "date") {
          var id = $(this).data('updateId')
          var val = $(this).find("input").val().toString()
          val = self.changeDateFormatService.formatDate(val)
        } else {
          var val = $(this).val().toString()
        }
        rowData[key] = val
      })
      tableData.push(rowData)
    })
    return tableData
  }

  jqueryDataTableClientSidePagination(tableId, dataSet, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amountRight = null, alingRight = null, dateColsAlign = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": 'simple_numbers',
      "processing": processing,
      "serverSide": false,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == "brokerContact" && data['brokerCompanyMainInd'] == `Y` && isRedirect != "F") {
          $(row).addClass('hl-row');
        } else if (tableId == "company-contact") {
          if (data['mainContactInd'] == `Y`) {
            $(row).addClass('hl-row');
          }
          if (data['expiredOn']) {
            let todayDate = self.changeDateFormatService.getToday();
            let expiredDate = self.changeDateFormatService.convertStringDateToObject(data['expiredOn'])
            this.error = self.changeDateFormatService.compareTwoDates(todayDate.date, expiredDate.date);
            if (this.error.isError == true) {
              $(row).addClass('reversal-row');
            }
          }
        } else if (tableId == "company-broker") {
          if (data['optOutBrokerMailInd'] == `Y`) {
            $(row).addClass('hl-row');
          }
          if (data['expiredOn']) {
            let todayDate = self.changeDateFormatService.getToday();
            let expiredDate = self.changeDateFormatService.convertStringDateToObject(data['expiredOn'])
            this.error = self.changeDateFormatService.compareTwoDates(todayDate.date, expiredDate.date);
            if (this.error.isError == true) {
              $(row).addClass('reversal-row');
            }
          }
        } else if (tableId == "companySearchCardTable") {
          if (data['status'] == 'ACTIVE') {
            $(row).addClass('hactive-row');
          } else if (data['status'] == 'INACTIVE') {
            $(row).addClass('reversal-row');
          }
        } else if (tableId == "unitFinancialTransactionList" && (data['tranCd'] == '92')) {
          $(row).addClass('reversal-row');
        } else if (tableId == "brokerContact" && isRedirect != "F") {
          if (data['brokerCompanyMainInd'] == `Y`) {
            $(row).addClass('hl-row');
          }
          if (data['brokerContactExpiredOn']) {
            let todayDate = self.changeDateFormatService.getToday();
            let expiredDate = self.changeDateFormatService.convertStringDateToObject(data['brokerContactExpiredOn'])
            this.error = self.changeDateFormatService.compareTwoDates(todayDate.date, expiredDate.date);
            if (this.error.isError == true) {
              $(row).addClass('reversal-row');
            }
          }
        } else if (tableId == "brokerListTable" && data['status'] == `T`) {
          $(row).addClass('hactive-row');
        } else if (tableId == "brokerListTable" && data['status'] == `F`) {
          $(row).addClass('hterminated-row');
        } else if (tableId == "search-card-table" && data['status'] == `INACTIVE`) {
          $(row).addClass('hterminated-row');
        } else if (tableId == "search-card-table" && data['status'] == `ACTIVE`) {
          $(row).addClass('hactive-row');
        } else if (tableId == "companySearchCardTable" && data['status'] == `INACTIVE`) {
          $(row).addClass('hterminated-row');
        } else if (tableId == "companySearchCardTable" && data['status'] == `ACTIVE`) {
          $(row).addClass('hactive-row');
        } else if (tableId == "referClaimTable" && data['markAsRead'] == "F") {
          $(row).addClass('hterminated-row');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],

      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)"  data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': (tableId == 'termination-division-history' || tableId == 'suspend_plan' || tableId == 'dobMismatchReport_OFF' || tableId == 'division_comments') ? 'dt-body-center' : 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': dateColsAlign,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (data) {
            return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
          } else {
            return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
          }
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      }],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.cardSelectedRowData = this.currentUserService.cardSelectedRowData = data
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'search-Dental-FeeGuide' && isRedirect != "F") {
            var dentFeeGuideKey = data['dentFeeGuideKey']
            this.router.navigate(["/feeGuide/view/" + dentFeeGuideKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'users-list' && isRedirect != "F") {
            this.router.navigate(['/users/view', data['userId']])
          }
          if (tableID == 'brokerListTable') {
            this.brokerSelectedRowData = this.currentUserService.brokerSelectedRowData = data;
          }
          if (tableId == 'cardPrintRequestList') {
            this.cardPrintRequestData = data;
          }
          if (tableId == 'phyCardPrintRequestList') {
            this.cardPrintRequestData = data;
          }
          if (tableID == 'provider-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/dentist/view', data['providerKey']])
          }
          if (tableID == 'batch-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/claims/view', data['claimKey']])
          }
          if (tableID == 'uftDashboard_bar1' && isRedirect != "F") {
            window.open('/company/view/' + data['coKey'], '_blank');
          }
          if (tableID == 'unitFinancialTransactionList') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.uftSelectedRowData = data;
          }
          if (tableID == 'uftDashboard_notification' && isRedirect != "F") {
            this.uftSelectedRowCokey = data['coKey']
            this.uftSelectedRowType = data['claimStatusCd']
            $('table#uftDashboard_notification td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
          }
          if (tableID == 'uftDashboard_releaseClaims' && isRedirect != "F") {
            this.uftSelectedRowClaimType = data
            $('table#uftDashboard_releaseClaims td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
          }
          if (tableID == 'uftDashboard_claimAboutToExpire' && isRedirect != "F") {
            this.uftSelectedRowClaimType = data
            $('table#uftDashboard_claimAboutToExpire td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
          }
          if ((tableID == 'uftDashboard_notificationAction' || tableID == 'uftDashboard_releaseClaimsAction_Expire' || tableID == 'uftDashboard_releaseClaimsAction') && isRedirect != "F") {
            this.mailOutKey = data['mailOutKey']
            this.uftSelectedData = data
          }
          if (tableID == 'reportsList') {
            this.reportsSelectedRowData = data
          }
          if (tableID == 'reportsList_datamangement') {
            this.reportsSelectedRowDataManage = data
          }
          if (tableID == 'providerWithoutEFT') {
            this.providerWithoutEFTSelectedRowData = data
          }
          if (tableID == 'filesList') {
            this.filesSelectedRowData = data
          }
          if (tableID == 'categoryClameList') {
            this.filesSelectedRowData = data
          }
          if (tableID == 'fileListHistory') {
            this.histFilesSelectedRowData = data
          }
          if (tableID == 'refundList') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.refundSelectedRowData = data;
          }
          if (tableID == 'referClaimTable' && isRedirect != "F") {
            this.referClaimKey = data['claimKey']
            this.referClaimDisciplinekey = data['disciplineKey']
            this.claimReferalKey = data['claimReferralKey']
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'data': dataSet,
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  jqueryDataTableTransSearch(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amountRight = null, alignRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": 'simple_numbers',
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              if ( tableId == 'paymentSearchList') {
                if (tableActions[i]['name'] == 'view') {
                  str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-pDiscipline = "' + full['pdiscipline'] + '" data-transStatus = "' +full['transStatus'] + '" data-payee = "' +full['payee'] + '" data-issueDate = "' +full['issueDate'] + '"><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
                if (tableActions[i]['name'] == 'RP') {
                  str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-discipline = "' + full['discipline'] + '" data-pdiscipline = "' + full['pdiscipline'] + '" data-payee = "' + full['payee'] + '" data-paymentKey = "' + full['paymentKey'] + '" data-chequeRefNo = "' + full['chequeRefNo'] + '" data-transStatus = "' + full['transStatus'] + '" data-sbusType = "' + full['sbusType'] + '"data-eftKey = "' + full['eftKey'] + '" >RP</a>'
                }
                if (tableActions[i]['name'] == 'ADJ') {
                  str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-discipline = "' + full['discipline'] + '" data-pdiscipline = "' + full['pdiscipline'] + '" data-payee = "' + full['payee'] + '" data-paymentKey = "' + full['paymentKey'] + '" data-chequeRefNo = "' + full['chequeRefNo'] + '" data-transStatus = "' + full['transStatus'] + '" data-sbusType = "' + full['sbusType'] + '"data-eftKey = "' + full['eftKey'] + '" >ADJ</a>'
                }
              } else {
                str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-pDiscipline = "' + full['pdiscipline'] + '" data-transStatus = "' +full['transStatus'] + '" data-payee = "' +full['payee'] + '" data-issueDate = "' +full['issueDate'] + '"><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              }
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'unitFinancialTransactionList' || tableId == 'transactionSearchList' || tableId == 'paymentSearchList') {
            if (data == null) {
              return ''
            } else {
              return '<span>$</span>' + data
            }
          }
          else if (tableId == 'refundList') {
            return '$' + data
          }
          else {
            return data
          }
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'transactionSearchList'
            || tableId == 'paymentSearchList'
          ) {
            return data;
          }
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')

          if (tableID == 'transactionSearchList' && isRedirect != "F") {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.selectedRowTransSearch = data
          }
          if (tableID == 'paymentSearchList' && isRedirect != "F") {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.selectedRowPaymentSearch = data
          }
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq && (tableId == "search-card-table")) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]) {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          self.totalRecords = json.recordsTotal
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)

          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')

            if (tableId == 'transactionSearchList') {
              $('.generatepaymentPopup').removeClass('hideGPRunButton')
              $('#transactionExcelBtn').removeClass('hideGPRunButton')
            }
            if (tableId == 'paymentSearchList') {
              $('.generatepaymentPopup').removeClass('hideGPRunButton')
              $('#transactionExcelBtn').removeClass('hideGPRunButton')
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            if (tableId == 'transactionSearchList') {
              $('.generatepaymentPopup').addClass('hideGPRunButton')
              $('#transactionExcelBtn').addClass('hideGPRunButton')
            }
            if (tableId == 'paymentSearchList') {
              $('.generatepaymentPopup').addClass('hideGPRunButton')
              $('#transactionExcelBtn').addClass('hideGPRunButton')
            }
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  companySearchDataTable(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amountRight = null, alignRight = null) {

    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (data['status'] == `Suspended`) {
          $(row).addClass('hsuspended-row');
        }
        else if (data['status'] == `Active`) {
          $(row).addClass('hactive-row');
        }
        else if (data['status'] == `Inactive`) {
          $(row).addClass('hterminated-row');
        } else {
          $(row).addClass('hgraceperiod-row'); // Log #1171: Added for Grace Period Status
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'company-list') {
            if (data) {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
            } else {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
            }
          }
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'company-list') {
            return data;
          }
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'company-list') {
            this.companySelectedRowData = this.currentUserService.companySelectedRowData = data
          }
          if (tableID == 'plan-category') {
            this.companySelectedRowData = this.currentUserService.companySelectedRowData = data
          }
          if (tableID == 'plan-rule') {
            this.companySelectedRowData = this.currentUserService.companySelectedRowData = data
          }
          if (tableID == 'users-list' && isRedirect != "F") {
            this.router.navigate(['/users/view', data['userId']])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          //Date-Format used for Searching 
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          self.totalRecords = json.recordsTotal
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == 'company-list' || tableId == 'plan-category' || tableId == 'plan-rule') {
              $('#companySearchExport').removeClass('hideGPRunButton')
            }
            if (tableId == 'company-list') {
                self.companyListTableEmitter.emit(json.code)
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            if (tableId == 'company-list' || tableId == 'plan-category' || tableId == 'plan-rule') {
              $('#companySearchExport').addClass('hideGPRunButton')
            }
            if (tableId == 'company-list') {
                self.companyListTableEmitter.emit(json.code)
            }
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  ruleSearchDataTable(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amountRight = null, alignRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'rules-list'
          ) {
            return data;
          }
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  getFooterParams(tableId) {
    var self = this
    var postArray = []
    var i = 0
    var elem
    $('#' + tableId + ' .inputSearch').each(function () {
      var pushArray = {}
      pushArray['key'] = $(this).attr('name')
      if ($(this).data('type') == "date" || $(this).data('type') == "predective") {
        var id = $(this).attr('id')
        elem = $("#" + id).find("input")
        var value = $("#" + id).find("input").val().toString();
        var val = self.changeDateFormatService.formatDate(value);
      }
      if (val != undefined) {
        pushArray['value'] = val
      } else {
        pushArray['value'] = $(this).val()
      }
      postArray.push(pushArray)
    })
    return postArray;
  }

  getFooterParamsUFTSearch(tableId) {
    var self = this
    var postArray = []
    var i = 0
    var elem
    $('#' + tableId + ' .inputSearch').each(function () {
      var pushArray = {}
      pushArray['key'] = $(this).attr('name')
      if ($(this).data('type') == "date" || $(this).data('type') == "predective") {

        var id = $(this).attr('id')
        elem = $("#" + id).find("input")
        if (id == 'uftTransactionDate') {
          pushArray['key'] = 'transactionDateStart'
          var value = $("#" + id).find("input").val().toString();
          var endDateVal = ""
          var valueStartDate = ""
          if (value != "") {
            valueStartDate = value.split(' ')[0]
            var valueEndDate = value.split(' ')[2]
            var val = self.changeDateFormatService.formatDate(valueStartDate);
            endDateVal = self.changeDateFormatService.formatDate(valueEndDate)
          }
        }
        if (id == 'uftEntryDateSearch') {
          pushArray['key'] = 'entrydateStart'
          var entryDate = $("#" + id).find("input").val().toString();
          var entryStartDate = ""
          var entryEndDateVal = ''
          if (entryDate != "") {
            entryStartDate = entryDate.split(' ')[0]
            var entryEndDate = entryDate.split(' ')[2]
            var val = self.changeDateFormatService.formatDate(entryStartDate);
            entryEndDateVal = self.changeDateFormatService.formatDate(entryEndDate)
          }
        }
      }
      if (val != undefined) {
        pushArray['value'] = val
      } else {
        pushArray['value'] = $(this).val()
      }
      postArray.push(pushArray)
      if (endDateVal != undefined) {
        postArray.push({ key: "transactionDateEnd", value: endDateVal })
      }
      if (entryEndDateVal != undefined) {
        postArray.push({ key: "entrydateEnd", value: entryEndDateVal })
      }
    })
    return postArray;
  }

  resetTableSearch() {
    $(".inputSearch").each(function () {
      $(this).val('')
      if ($(this).data('type') == "date" || $(this).data('type') == 'predective') {
        $(this).val('')
        var id = $(this).data('updateId')
        var val = $(this).find("input").val('')
      } else if ($(this).data('type') == 'select') {
        $(this).prop('selectedIndex', 0);
      }
      if ($(this).data('type') == "select") {
        var val = $(this).find("select").val('')
      }
    });
  }

  // Reset select functionality for Log #0189348
  resetTableServiceProviderForStatus() {
    $(".inputSearch").each(function () {
      var id = $(this).attr('id')
      if ($(this).data('type') == 'select') {
        if (id == 'spsg_status') {
          $(this).prop('selectedIndex', 0);
        }
      }
    });
  }

  brokerContactDataTable(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, isRedirect = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (data['brokerCompanyMainInd'] == `T`) {
          $(row).addClass('hl-row');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      }],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  jqueryDataTableCompany(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if ((data['optOutBrokerMailInd'] == `T`) || (data['mainContactInd'] == `T`)) {
          $(row).addClass('hl-row');
        } else if (data['optOutBrokerPrimaryInd'] == `T`) {
          $(row).addClass('hl-row-primary');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      }
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          // Date-Format used for searching
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  jqueryDataTableSuspanded(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, suspandedColumn, isRedirect = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': suspandedColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          if (data == 'T') {
            str = 'Suspended'
          }
          if (data == 'F') {
            str = 'Active'
          }
          return str
        }
      },],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * For Plan Case Only
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param suspandedColumn 
   * @param dateCols 
   * @param isRedirect 
   * @param amountRight 
   * @param alignRight 
   */
  jqueryDataTablePlan(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, suspandedColumn, dateCols = null, isRedirect = null, amountRight = null, alignRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == "plan-datatable" && (data['plansSuspendInd'] == `T`)) {
          $(row).addClass('suspendPlanDisable');
        }
        if (tableId == "plan-datatable" && data['planTerminateInd'] == `T`) {
        } else if (tableId == "plan-datatable" && data['divisionStatus'] == `Terminated`) {
        }
        if (tableId == 'plan-datatable') {
          var str;
          if (data['divisionSuspendInd'] == 'T') {
            if (data['divisionStatus'] == 'Terminated') {
              str = 'Terminated'
            } else {
              str = 'Suspended'
            }
          } else {
            if (data['divisionStatus'] == 'Terminated') {
              str = 'Terminated'
            } else {
              str = 'Active'
            }
          }
          if (str == 'Terminated') {
            $(row).addClass('hterminated-row');
          } else if (str == 'Active') {
            $(row).addClass('hactive-row');
          } else if (str == 'Suspended') {
            $(row).addClass('hsuspended-row');
          }
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-divisionKey="' + full.divisionKey + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        },
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': suspandedColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          if (data == 'T') {
            if (full.divisionStatus == 'Terminated') {
              str = 'Terminated'
            } else {
              str = 'Suspended'
            }
          } else {
            if (full.divisionStatus == 'Terminated') {
              str = 'Terminated'
            } else {
              str = 'Active'
            }
          }
          return str
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'plan-datatable') {
            if (data) {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
            } else {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
            }
          }
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'plan-datatable') {
            return data;
          }
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'plan-datatable') {
            this.selectedPlanRowData = data;
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        "data": function (d) {
          //Date-Format used for Searching
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          if (tableId == "plan-datatable" && json.code) {
            self.planExists.emit(true);
          }
          self.totalRecords = json.recordsTotal
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == 'plan-datatable') {
              // Button is common for all so changed to same Id.
              $('#company-con-TabExport').removeClass('hideGPRunButton')
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            if (tableId == 'plan-datatable') {
              $('#company-con-TabExport').addClass('hideGPRunButton')
            }
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  getFooterParamsSearchTable(tableId, extraKeyValue) {
    var self = this
    var postArray = []
    var i = 0
    var elem
    $('#' + tableId + ' .inputSearch').each(function () {

      var pushArray = {}
      var filteredVal
      pushArray['key'] = $(this).attr('name')

      if ($(this).data('type') == "date") {
        var id = $(this).attr('id')
        elem = $("#" + id).find("input")
        var value = $("#" + id).find("input").val().toString()
        filteredVal = self.changeDateFormatService.formatDate(value);
      }
      else if ($(this).data('type') == "phone") {
        filteredVal = $(this).val().toString().replace(/[^0-9 ]/g, "")
      } else {
        filteredVal = $(this).val()
      }
      pushArray['value'] = filteredVal;
      postArray.push(pushArray)
    })
    if (extraKeyValue.value) {
      postArray.push(extraKeyValue)
    }
    return postArray;
  }

  getFooterParamsCompanySearchTable(tableId, extraKeyValue) {
    var self = this
    var postArray = []
    var i = 0
    var elem
    $('#' + tableId + ' .inputSearch').each(function () {
      var pushArray = {}
      var filteredVal
      pushArray['key'] = $(this).attr('name')
      if ($(this).data('type') == "date" || $(this).data('type') == "predective") {
        var id = $(this).attr('id')
        elem = $("#" + id).find("input")
        var value = $("#" + id).find("input").val().toString()
        filteredVal = self.changeDateFormatService.formatDate(value);
      }
      else if ($(this).data('type') == "phone") {
        filteredVal = $(this).val().toString().replace(/[^0-9 ]/g, "")
      } else {
        filteredVal = $(this).val()
      }
      pushArray['value'] = filteredVal
      postArray.push(pushArray)
    })
    if (extraKeyValue.value) {
      postArray.push(extraKeyValue)
    }
    return postArray;
  }

  jqueryDataTableSearchClaim(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols, isRedirect = null, alingRight = null, dateColsAlign = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == "review-claim-table" && data['reviewStatusKey'] == 4) {
          $(row).addClass('hterminated-row');
        }
        else if (tableId == "search-claim-table") {
          if ((data['claimTypeKey'] == 14) && (data['status'] != 'REVERSED')) {
            $(row).addClass('hactive-row');
          }
          else if ((data['claimTypeKey'] == 10) && (data['status'] != 'REVERSED')) {
            $(row).addClass('hPreAuthReview-row');
          }
          else if ((data['claimTypeKey'] == 16) && (data['status'] != 'REVERSED')) {
            $(row).addClass('hsuspended-row');
          }
          else if (data['status'] == 'REVERSED') {
            $(row).addClass('pink');
          }
        }
        else if (tableId == "categoryClameList") {
          if (data['claimTypeKey'] == 14) {
            $(row).addClass('hactive-row');
          }
          else if (data['claimTypeKey'] == 10) {
            $(row).addClass('hPreAuthReview-row');
          }
          else if (data['claimTypeKey'] == 16) {
            $(row).addClass('hsuspended-row');
          }
        }
        else if (tableId == "search-serviceProvider-table" && data['status'] == `INACTIVE`) {
          $(row).addClass('hterminated-row');
        } else if (tableId == "search-serviceProvider-table" && data['status'] == `ACTIVE`) {
          $(row).addClass('hactive-row');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        {
          'targets': actionColumn,
          'searchable': false,
          'orderable': false,
          'className': (tableId == 'search-claimSearchFiles-table' || tableId == 'cda-netList-table' || tableId == 'ListTables') ? 'amount_right_grid' : 'dt-body-center',
          'render': function (data, type, full, meta) {
            var str = ''
            for (var i = 0; i < tableActions.length; i++) {
              if (tableActions[i]['showAction'] != "F") {
                if (tableId == 'search-claim-table') {
                  if (tableActions[i]['name'] == 'RC') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-disciplineKey ="' + full.disciplineKey + '" data-businessTypeCd ="' + full.businessTypeCd + '" data-personDate ="' + full.personDate + '" >RC</a>'
                  }
                  if (tableActions[i]['name'] == 'RI') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-disciplineKey ="' + full.disciplineKey + '" data-businessTypeCd ="' + full.businessTypeCd + '" data-personDate ="' + full.personDate + '" data-claimKey ="' + full.claimKey + '" >RI</a>'
                  }
                } else {
                  str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
              }
            }
            return str
          }
        },
        {
          'targets': dateCols,
          'searchable': false,
          'orderable': false,
          'className': 'dt-body-center',
          'render': function (data, type, full, meta) {
            return self.changeDateFormatService.changeDateByMonthName(data);
          }
        },
        {
          'targets': checkboxCol,
          'searchable': false,
          'orderable': false,
          'className': 'dt-body-center',
          'render': function (data, type, full, meta) {
            var checked = ""
            if (data == "T") {
              checked = "checked"
            }
            return '<input disabled ' + checked + ' class="individual" type="checkbox" name="id[]" value="' + data + '" >';
          }
        },
        {
          'targets': undefined,
          'searchable': false,
          'orderable': false,
          'className': 'dt-body-center',
          'render': function (data, type, full, meta) {
            return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
          }
        }, {
          'targets': alingRight,
          'searchable': false,
          'orderable': false,
          'className': 'amount_right_grid',
          'render': function (data, type, full, meta) {
            if (tableId == 'search-eligibilityFiles-table' || tableId == 'show-claim-table' || tableId == 'referClaimTable' || tableId == 'search-serviceProvider-table' || tableId == 'review-claim-table' || tableId == 'ListTables') {
              return data;
            }
            if (tableId == 'cda-netList-table' || tableId == 'show-claim-table' || tableId == 'referClaimTable' || tableId == 'search-serviceProvider-table' || tableId == 'review-claim-table' || tableId == 'cda-netList-table') {
              return data;
            }
            else if (tableId == 'genrateBatchList') {
              return data;
            }
            else if (tableId == 'search-claim-table') {
              return data;
            }
            else if (tableId == 'categoryClameList') {
              return data;
            }
            else if (tableId == 'search-claimSearchFiles-table') {
              return data;
            }
            else if (tableId == 'gov-elig-file-upload-doc') {
              return data;
            }
            else if (tableId == 'cda-netList-table') {
              return data;
            }
          }
        },
        {
          'targets': dateColsAlign,
          'searchable': false,
          'orderable': false,
          'className': 'amount_right_grid',
          'render': function (data, type, full, meta) {
            return self.changeDateFormatService.changeDateByMonthName(data);
          }
        },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-claim-table' && isRedirect != "F") {
            var claimKey = data['claimKey']
            this.claimKey = data['claimKey']
            this.disciplineKey = data['disciplineKey']
            this.dcpKey = data['dcpKey']
          }
          if (tableID == "categoryClameList" && isRedirect != "F") {
            var claimKey = data['claimKey']
            if (data['dcpKey'] != 0) {
              this.router.navigate(["/claim/view/" + claimKey + "/type/" + data['disciplineKey'] + "/dcp/" + data['dcpKey']]);
            } else {
              this.router.navigate(["/claim/view/" + claimKey + "/type/" + data['disciplineKey']]);
            }
          }
          if (tableID == 'search-serviceProvider-table' && isRedirect != "F") {
            var provKey = data['provKey']
            this.router.navigate(["/serviceProvider/view/" + provKey + "/type/" + data['disciplineKey']]);
          }
          if ((tableID == 'review-claim-table' || tableID == 'searchReviewClaim') && isRedirect != "F") {
            this.router.navigate(["/claim/view/" + data['claimKey'] + "/type/" + data['disciplineKey'] + '/reviewer/' + data['reviewKey']]);
          }
          if (tableID == "genrateBatchList" && isRedirect != "F") {
            this.router.navigate(["/dataEntry/claims/view/" + data['claimKey']]);
            $(document).find(".close").trigger('click')
          }
          if (tableID == "show-claim-table" && isRedirect != "F") {
            window.open("/claim/view/" + data['claimKey'] + "/type/" + data['disciplineKey'] + "/preAuth", '_blank');
            $(document).find(".close").trigger('click')
          }
          if (tableID == 'search-claimSearchFiles-table') {
            this.filesSelectedRowData = data;
          }

          if (tableID == 'cda-netList-table') {
            this.filesSelectedRowData = data
          }
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            // search claim
            if (dateCols) {
              for (var i = 0; i < json.result.data.length; i++) {
                for (var j = 0; j < dateCols.length; j++) {
                  if (json.result.data[i][dateCols[j]] != "") {
                    var dateValue = self.changeDateFormatService.changeDateByMonthName(json.result.data[i][dateCols[j]]);
                    json.result.data[i][dateCols[j]] = dateValue;
                  }
                }
              }
            }
            if (tableId == 'search-claim-table' || tableId == 'categoryClameList') {
              for (let i in json.result.data) {
                if (json.result.data[i].payable) {
                  if (json.result.data[i].payable.includes('.')) {
                    let value = json.result.data[i].payable.split('.')
                    if (value[1] && value[1] == 0) {
                      json.result.data[i].payable = json.result.data[i].payable + '0'
                    }
                  }
                  json.result.data[i].payable = '$' + json.result.data[i].payable
                }
                if (json.result.data[i].deductible) {
                  if (json.result.data[i].deductible.includes('.')) {
                    let value = json.result.data[i].deductible.split('.')
                    if (value[1] && value[1] == 0) {
                      json.result.data[i].deductible = json.result.data[i].deductible + '0'
                    }
                  }
                  json.result.data[i].deductible = '$' + json.result.data[i].deductible
                }
              }
            }
            if (tableId == 'show-claim-table') {

              for (let i in json.result.data) {
                json.result.data[i].released = json.result.data[i].released == "F" ? "N" : "Y";
              }

              self.totalRecords = json.recordsTotal
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            if (tableId == 'show-claim-table') {
              self.totalRecords = json.recordsTotal
            }
            return '';
          } else {
            if (tableId == 'show-claim-table') {
              self.totalRecords = json.recordsTotal
            }
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  jqueryDataTableSearchReviewClaim(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols, isRedirect = null, modalId, alignRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == "review-claim-table" && data['reviewStatusKey'] == 4) {
          $(row).addClass('hterminated-row');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              if (full.reviewStatus != "ADDITIONAL INFORMATION" && full.reviewStatus != "MODIFIED") {
                str = str + '<a data-target = "#' + modalId + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-status = "' + full.reviewStatus + '" data-claimkey = "' + full.claimKey + '" data-discipline = "' + full.disciplineKey + '" data-reviewkey = "' + full.reviewKey + '"  ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              } else {
                str = str + '<a data-target = "#' + modalId + '" data-toggle="modal" class="hideColumn ' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-status = "' + full.reviewStatus + '" data-claimkey = "' + full.claimKey + '" data-discipline = "' + full.disciplineKey + '" data-reviewkey = "' + full.reviewKey + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              }
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var checked = ""
          if (data == "T") {
            checked = "checked"
          }
          return '<input disabled ' + checked + ' class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'searchReviewClaim'
          ) {
            return data;
          }
        }
      },
      ],
      order: defaultOrderBy,
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  jqueryDataTableSearchBan(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, modalTarget, isRedirect = null, alingRight = null, sortFirstCol = null, sortOtherCols = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": (tableId == 'mail_search_report') ? true : false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': (tableId == 'search-BAN-table') ? 'amount_right_grid' : 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a  data-target = "#' + modalTarget + '" data-toggle="modal"  class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-addresskey="' + full.provBillingAddressKey + '"  ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var checked = ""
          if (data == "T") {
            checked = "checked"
          }
          return '<input disabled ' + checked + ' class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'search-BAN-table' || 'CardholderComment') {
            return data;
          }
        },
      },
      {
        'targets': sortFirstCol,
        'searchable': false,
        'orderable': true,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': sortOtherCols,
        'searchable': false,
        'orderable': true,
        'className': 'amount_right_grid-padding',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          $('td', row).eq(2).addClass('highlight' + data['banId'])
          if (tableID == 'search-claim-table' && isRedirect != "F") {
            var claimKey = data['claimKey']
            this.router.navigate(["/claim/view/" + claimKey + "/type/" + data['disciplineKey']]);
          }
          if (tableID == 'search-serviceProvider-table' && isRedirect != "F") {
            var provKey = data['provKey']
            this.router.navigate(["/serviceProvider/view/" + provKey + "/type/" + data['disciplineKey']]);
          }
          if (tableID == 'mail_search_report' && isRedirect != "F") {
            $('td', row).addClass('highlightedRow')
            this.mailLabelFilteredData = data
          }
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  jqueryDataTableBan(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, isRedirect = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          str = str + '<button  class="btn selectedBan" data-banid = "' + data + '" >Select</button>'
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      }],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'users-list' && isRedirect != "F") {
            this.router.navigate(['/users/view'])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  jqueryDataTableForModal1(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, modalTarget, unitCount = null, TFCheck = null, isRedirect = null, alingRight = null, sortGrid = null, sortGrid1 = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()

    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": true,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              if (tableActions[i].name == "delete") {
                str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" title="' + tableActions[i]['title'] + '" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              } else {
                str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-parentService = "' + full['dentalParentServiceId'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              }
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      }, {
        'targets': TFCheck,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var checked = "No"
          if (data == "T") {
            checked = "Yes"
          }
          return checked
        }
      },
      {
        'targets': unitCount,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          if (data == 0) {
            str = ''
          } else {
            str = data
          }
          return str
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'fgpc_search_ProcedureCode') {
            return data;
          }
        }
      },
      {
        'targets': sortGrid,
        'searchable': false,
        'orderable': true,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': sortGrid1,
        'searchable': false,
        'orderable': true,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'search-Dental-FeeGuide' && isRedirect != "F") {
            var dentFeeGuideKey = data['dentFeeGuideKey']
            this.router.navigate(["/feeGuide/view/" + dentFeeGuideKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'rules-list' && isRedirect != "F") {
            this.router.navigate(['/users/view'])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          if (tableID == 'provider-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/dentist/view', data['providerKey']])
          }
          if (tableID == 'batch-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/claims/view', data['claimKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq && (tableId == "search-card-table")) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          // Date-Format used for Searching
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == "division_max_history") {
              for (let i in json.result.data) {
                json.result.data[i].dentalInd = json.result.data[i].dentalInd != "T" ? "No" : "Yes";
                json.result.data[i].visionInd = json.result.data[i].visionInd != "T" ? "No" : "Yes";
                json.result.data[i].healthInd = json.result.data[i].healthInd != "T" ? "No" : "Yes";
                json.result.data[i].drugInd = json.result.data[i].drugInd != "T" ? "No" : "Yes";
                json.result.data[i].wellnessInd = json.result.data[i].wellnessInd != "T" ? "No" : "Yes";
              }
            }
            else if (tableId == "uftDashboard_totalCompany") {
              for (let i in json.result.data) {
                json.result.data[i].brokerName = json.result.data[i].brokerName == "" ? "N/A" : json.result.data[i].brokerName;
              }
            }
            return json.result.data;
          }
          else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  jqueryDataTableForModal(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, modalTarget, TFCheck = null, isRedirect = null, amountRight = null, sortGrid = null, notSort = null, alignRight = null, sortFirstCol = null, sortOtherCols = null, lastAction = null, CoulmnNumber = null, dateColsFirstColumn = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": (tableId == 'file_type_datatable' || tableId == 'visionProcedureCode') || (tableId == 'hsaProcedureCode') || (tableId == 'uftDashboard_totalCompany') || (tableId == 'healthProcedureCode') || (tableId == 'uftDashboard_primaryCardholder') || (tableId == 'uftDashboard_dependentCardholder') || (tableId == 'transaction-code-list') ? true : false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == 'fgpc_search_ProcedureCode') {

          var str;
          if (data['dentalProcedureUnitCount'] == 0) {
            str = ''
          } else {
            str = data['dentalProcedureUnitCount']
          }
        }
        else if (tableId == "uftDashboard_dependentCardholder") {
          if (data['changesToCompanyType'] == 'Lost') {
            $(row).addClass('hterminated-row');
          }
          else if (data['changesToCompanyType'] == 'Added') {
            $(row).addClass('hactive-row');
          }
        }
        else if (tableId == "uftDashboard_primaryCardholder") {
          if (data['changesToCompanyType'] == 'Lost') {
            $(row).addClass('hterminated-row');
          }
          else if (data['changesToCompanyType'] == 'Added') {
            $(row).addClass('hactive-row');
          }
        }
        else if (tableId == "transaction-code-list") {
          if (data['expiredOn']) {

            let color = self.IsDateCheck(data['expiredOn']);
            $('td:nth-child(4)', row).css({ 'color': color, 'font-weight': 'bold' });

          }
        }
        else if (tableId == "adminInfoList") {
          if (data['expiredOn']) {
            let color = self.IsDateCheck(data['expiredOn']);
            $('td:nth-child(6)', row).css({ 'color': color, 'font-weight': 'bold' });
          }
        }
        else if (tableId == "originatorList") {
          if (data['expiredOn']) {
            let color = self.IsDateCheck(data['expiredOn']);
            $('td:nth-child(11)', row).css({ 'color': color, 'font-weight': 'bold' });
          }
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],

      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableId == 'summaryList') {
              str = '<a   href="' + data + '" target="_blank">' + data + '</a>'
            }
            if (tableActions[i]['showAction'] != "F") {
              if (tableActions[i].name == "delete") {
                str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" title="' + tableActions[i]['title'] + '" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              } else {
                if (tableId == 'domainInfoList') {
                  str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-key = "' + full['key'] + '" data-typeCd = "' + full['typeCd'] + '" data-typeDescription = "' + full['typeDescription'] + '" data-expiredOn = "' + full['expiredOn'] + '" data-suspended = "' + full['suspended'] + '" data-comment = "' + full['comment'] + '" data-allowSurface = "' + full['allowSurface'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                } else if (tableId == 'messageList') {
                  str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-key = "' + full['key'] + '" data-messageEng = "' + full['messageEng'] + '" data-messageFre = "' + full['messageFre'] + '" data-expiredOn = "' + full['expiredOn'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                } else if (tableId == 'transactionCodeList') {
                  str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-tranCdKey = "' + full['tranCdKey'] + '" data-tranCd = "' + full['tranCd'] + '" data-tranDescription = "' + full['tranDescription'] + '" data-effectiveOn = "' + full['effectiveOn'] + '" data-expiredOn = "' + full['expiredOn'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                } else if (tableId == 'dentalProviderSpecialtyList') {
                  str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-provSpecialKey = "' + full['provSpecialKey'] + '" data-provSpecialId = "' + full['provSpecialId'] + '" data-provSpecialDesc = "' + full['provSpecialDesc'] + '" data-specialtyTypeKey = "' + full['specialtyTypeKey'] + '" data-specialtyTypeDesc = "' + full['specialtyTypeDesc'] +
                    '" data-provSpecialGroupKey = "' + full['provSpecialGroupKey'] + '" data-provSpecialGroupDesc = "' + full['provSpecialGroupDesc'] + '" data-provTypeKey = "' + full['provTypeKey'] + '" data-provTypeDesc = "' + full['provTypeDesc'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                } else if (tableId == 'mouthToothList') {
                  str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-mouthToothKey = "' + full['mouthToothKey'] + '" data-toothId = "' + full['toothId'] + '" data-toothDesc = "' + full['toothDesc'] + '" data-mouthSiteId = "' + full['mouthSiteId'] + '" data-mouthDesc = "' + full['mouthDesc'] + '" data-expiredOn = "' + full['expiredOn'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                } else if (tableId == 'mouthSiteList') {
                  str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-mouthSiteKey = "' + full['mouthSiteKey'] + '" data-mouthId = "' + full['mouthId'] + '" data-mouthSiteId = "' + full['mouthSiteId'] + '" data-effectiveOn = "' + full['effectiveOn'] + '" data-expiredOn = "' + full['expiredOn'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
                else {
                  str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-displayName = "' + full['displayName'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
              }
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': dateColsFirstColumn,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'summaryList') {
            return '<a   href="' + data + '" target="_blank">' + data + '</a>';
          } else {
            var checked = ""
            if (data == "T") {
              checked = "checked"
            }
            return '<input disabled class="individual" type="checkbox" name="id[]" ' + checked + ' value="' + data + '" >';
          }

        }
      }, {
        'targets': TFCheck,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var checked = "No"
          if (data == "T") {
            checked = "Yes"
          }
          return checked
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'uftDashboard_totalCompany' || tableId == 'uftDashboard_primaryCardholder' || tableId == 'uftDashboard_dependentCardholder') {
            return data
          }
        }
      },
      {
        'targets': sortGrid,
        'searchable': false,
        'orderable': true,
        'className': (tableId == 'uftDashboard_totalCompany') || (tableId == 'uftDashboard_primaryCardholder') || (tableId == 'uftDashboard_dependentCardholder') ? 'amount_right_grid-padding' : 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': notSort,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'transaction-code-list'
            || tableId == 'adminInfoList'
            || tableId == 'originatorList'
            || tableId == 'domainInfoList'
            || tableId == 'summaryList'
            || tableId == 'messageList'
            || tableId == 'transactionCodeList'
            || tableId == 'dentalProviderSpecialtyList'
            || tableId == 'mouthToothList'
            || tableId == 'mouthSiteList'
          ) {
            return data
          }
        }
      },
      {
        'targets': sortFirstCol,
        'searchable': false,
        'orderable': true,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': sortOtherCols,
        'searchable': false,
        'orderable': true,
        'className': 'amount_right_grid-padding',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'search-Dental-FeeGuide' && isRedirect != "F") {
            var dentFeeGuideKey = data['dentFeeGuideKey']
            this.router.navigate(["/feeGuide/view/" + dentFeeGuideKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'rules-list' && isRedirect != "F") {
            this.router.navigate(['/users/view'])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          if (tableID == 'provider-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/dentist/view', data['providerKey']])
          }
          if (tableID == 'batch-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/claims/view', data['claimKey']])
          }
          if (tableID == 'uftDashboard_totalCompany' && isRedirect != "F") {
            window.open('/company/view/' + data['coKey'], '_blank');
          }
          if (tableID == 'uftDashboard_primaryCardholder' && isRedirect != "F") {
            window.open('/card/view/' + data['cardKey'], '_blank');
          }
          if (tableID == 'uftDashboard_dependentCardholder' && isRedirect != "F") {
            window.open('/card/view/' + data['cardKey'], '_blank');
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          // Date-Format used for Searching
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          self.totalRecords = json.recordsTotal // set total Records in Company & Cardholder Contiuity to remove duplicacy of records 
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == "division_max_history") {
              for (let i in json.result.data) {
                json.result.data[i].dentalInd = json.result.data[i].dentalInd != "T" ? "No" : "Yes";
                json.result.data[i].visionInd = json.result.data[i].visionInd != "T" ? "No" : "Yes";
                json.result.data[i].healthInd = json.result.data[i].healthInd != "T" ? "No" : "Yes";
                json.result.data[i].drugInd = json.result.data[i].drugInd != "T" ? "No" : "Yes";
                json.result.data[i].wellnessInd = json.result.data[i].wellnessInd != "T" ? "No" : "Yes";
              }
            }
            else if (tableId == "uftDashboard_totalCompany") {
              for (let i in json.result.data) {
                json.result.data[i].brokerName = json.result.data[i].brokerName == "" ? "N/A" : json.result.data[i].brokerName;
                json.result.data[i].primaryCardholders = json.result.data[i].primaryCardholders == -1 ? "" : json.result.data[i].primaryCardholders;
                json.result.data[i].cardholdersWithDependents = json.result.data[i].cardholdersWithDependents == -1 ? "" : json.result.data[i].cardholdersWithDependents;
              }
            }
            return json.result.data;
          }
          else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * Method for Date-Format
   * @param tableId 
   * @param url 
   * @param postArray 
   * @param dateParams 
   */
  jqueryDataTableReload(tableId, url, postArray, dateParams = null) {
    this.isTableReload = true
    this.reqParam = postArray;
    this.reqDateParams = dateParams;
    if (tableId == 'negativeTransactionList') {
      this.isNegativeTableReload = true
    }
    if (tableId == 'receiptsList') {
      this.isReceiptsTableReload = true
    }
    //CHANGE DATE FORMAT FOR ALL DATATABLE
    if (this.reqDateParams) {
      for (let j in this.reqDateParams) {

        var indexValue = this.reqDateParams[j];
        if (this.reqParam[indexValue]['value']) {
          if (this.reqParam[indexValue]['value'] != "") {
            var myDate = this.checkDateFormat(this.reqParam[indexValue]['value']);
            if (myDate == false) {
              this.toastrService.error("Please Enter Valid Date !");
              return false;
            }
            var dateObj = new Array();
            dateObj['value'] = myDate;
            var obj = this.changeDateFormatService.changeDateFormat(dateObj);
            if (obj == null) {
              this.toastrService.error("Please Enter Valid Date !");
              return false;
            }
          }
        }
      }
    }
    var tableElem = $("#" + tableId).DataTable();
    if (tableId == 'ListTable') {
      $('.selectAll').prop('checked', false);
    }
    tableElem.ajax.url(url).load();
    tableElem.draw();
      if (tableId == 'company-list') {
        var self = this
        this.companyList =  Observable.interval(1000).subscribe(value => {
            self.companyListTableEmitter.emit(tableElem['context'][0].json.code)
          this.companyList.unsubscribe();
        });
      }
  }

  /**
   * Method Used for converting the Date-Format into Date-Format(Month show) 
   * @param DateString 
   */
  checkDateFormat(DateString) {
    var monthLabels = { 1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec" }
    let dateArr = DateString.split('/');
    var day = '' + dateArr[0],
      month = '' + monthLabels[parseInt(dateArr[1])],
      year = dateArr[2];
    if (day.length < 2) day = '0' + day;
    if (month.length < 2) month = '0' + month;
    if (month == "undefined") {
      return false;
    }
    if (day == 'NaN' || month == 'NaN' || year.toString() == 'NaN') {
      return;
    } else {
      return [day, month, year].join('/');
    }
  }

  providerSearchDataTable(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (data['status'] == `Suspended`) {
          $(row).addClass('hsuspended-row');
        }
        else if (data['status'] == `Active`) {
          $(row).addClass('hactive-row');
        }
        else {
          $(row).addClass('hterminated-row');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      }
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          //Date-Format used for Searching 
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * 
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param isRedirect 
   * @param amountRight 
   * @param alignRight 
   */
  jqueryDataTableForDentalSchedule(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amountRight = null, alignRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var checked = ""
          if (data == "T") {
            checked = "checked"
          }
          return '<input disabled class="individual" type="checkbox" name="id[]" ' + checked + ' value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'upcomingTransactionsList') {
            if (data) {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
            } else {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
            }
          }
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'upcomingTransactionsList') {
            return data;
          }
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'search-Dental-FeeGuide' && isRedirect != "F") {
            var dentFeeGuideKey = data['dentFeeGuideKey']
            this.router.navigate(["/feeGuide/view/" + dentFeeGuideKey])
          }
          if (tableID == 'dentalScheduleList' && isRedirect != "F") {
            var scheduleKey = data['dentFeeGuideSchedKey']  //57543791
            this.router.navigate(["/feeGuide/dentalSchedule/view/" + scheduleKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'rules-list' && isRedirect != "F") {
            this.router.navigate(['/users/view'])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          if (tableID == 'provider-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/dentist/view', data['providerKey']])
          }
          if (tableID == 'batch-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/claims/view', data['claimKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq && (tableId == "search-card-table")) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {

            if (tableId == "division_max_history") {
              for (let i in json.result.data) {
                json.result.data[i].dentalInd = json.result.data[i].dentalInd != "T" ? "No" : "Yes";
                json.result.data[i].visionInd = json.result.data[i].visionInd != "T" ? "No" : "Yes";
                json.result.data[i].healthInd = json.result.data[i].healthInd != "T" ? "No" : "Yes";
                json.result.data[i].drugInd = json.result.data[i].drugInd != "T" ? "No" : "Yes";
                json.result.data[i].wellnessInd = json.result.data[i].wellnessInd != "T" ? "No" : "Yes";
              }
            }
            if (tableId == 'upcomingTransactionsList') {
              $('#genEft').removeClass('hideGPRunButton')
              $('#' + tableId + '_paginate').removeClass('disable-paginate')
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            if (tableId == 'upcomingTransactionsList') {
              $('#genEft').addClass('hideGPRunButton')
            }
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  IsDateCheck(date: any) {
    var red = "#eb5757";
    var black = "#0a0808";
    var check = this.changeDateFormatService.isFutureDate(date)
    if (check) {
      return black;
    } else {
      return red;
    }
  }
  /**
   * 
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param flagCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param modalTarget 
   * @param isRedirect 
   * @param alingRight 
   * @param amountRight 
   */
  jqueryDataTableForUSCLS(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, flagCol, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, modalTarget, isRedirect = null, alingRight = null, amountRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              if (tableActions[i].name == "delete") {
                str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              } else {
                str = str + '<a data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              }
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': flagCol,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var result = 'No'
          if (data == "T") {
            result = "Yes"
          }
          return result
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'searchUSclsFeeGuideTable') {
            return data;
          }
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'searchUSclsFeeGuideTable'
          ) {
            if (data) {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
            } else {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
            }
          }
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'search-Dental-FeeGuide' && isRedirect != "F") {
            var dentFeeGuideKey = data['dentFeeGuideKey']
            this.router.navigate(["/feeGuide/view/" + dentFeeGuideKey])
          }
          if (tableID == 'dentalScheduleList' && isRedirect != "F") {
            var scheduleKey = data['dentFeeGuideSchedKey']  //57543791
            this.router.navigate(["/feeGuide/dentalSchedule/view/" + scheduleKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'rules-list' && isRedirect != "F") {
            this.router.navigate(['/users/view'])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          if (tableID == 'provider-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/dentist/view', data['providerKey']])
          }
          if (tableID == 'batch-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/claims/view', data['claimKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq && (tableId == "search-card-table")) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == "division_max_history") {
              for (let i in json.result.data) {
                json.result.data[i].dentalInd = json.result.data[i].dentalInd != "T" ? "No" : "Yes";
                json.result.data[i].visionInd = json.result.data[i].visionInd != "T" ? "No" : "Yes";
                json.result.data[i].healthInd = json.result.data[i].healthInd != "T" ? "No" : "Yes";
                json.result.data[i].drugInd = json.result.data[i].drugInd != "T" ? "No" : "Yes";
                json.result.data[i].wellnessInd = json.result.data[i].wellnessInd != "T" ? "No" : "Yes";
              }
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * 
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param isRedirect 
   * @param dateCols 
   * @param amountRight 
   * @param alignRight 
   */

  userSearchDataTable(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, isRedirect = null, dateCols = null, amountRight = null, alignRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (data['deleted'] == `Y`) {
          $(row).addClass('inactivated-row');
        }
        //Status Check For Row Colour
        if (tableId == "users-list" && data['userStatusCd'] == `A` && data['deleted'] != `Y`) {
          $(row).addClass('hactive-row');
        } else if (tableId == "users-list" && data['userStatusCd'] == `IN`) {
          $(row).addClass('inactivated-row');
        } else if (tableId == "users-list" && data['userStatusCd'] == `AL`) {
          $(row).addClass('hsuspended-row');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              if (tableActions[i]['name'] == "delete" && full.deleted == "Y") {
                str = str + '<a class="table-action-btn reactivate-ico" href="javascript:void(0)" data-id = "' + data + '"  title="Reactivate"><i class="fa fa-retweet"></i></a>'
              } else {
                str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              }
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'users-list') {
            return data;
          }
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            if (tableId == 'users-list') {
              $('#' + tableId + '_paginate').addClass('disable-paginate')
            }
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * 
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param isRedirect 
   * @param amount_rightDollar 
   * @param alignRight 
   */
  jqueryDataTableclaimsAttachedToTransaction(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amount_rightDollar = null, alignRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == "brokerContact" && data['brokerCompanyMainInd'] == `T`) {
          $(row).addClass('hl-row');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              // Log #1137: View Icon
              if (tableId == "claimsAttachedToPaymentList") {
                if (tableActions[i]['name'] == 'view') {
                  str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-discipline = "' + full['discipline'] + '" data-pdiscipline = "' + full['pdiscipline'] + '" data-payee = "' + full['payee'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
                if (tableActions[i]['name'] == 'RP') {
                  str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-discipline = "' + full['discipline'] + '" data-pdiscipline = "' + full['pdiscipline'] + '" data-payee = "' + full['payee'] + '" data-paymentKey = "' + full['paymentKey'] + '" data-chequeRefNo = "' + full['chequeRefNo'] + '" data-transStatus = "' + full['transStatus'] + '" data-sbusType = "' + full['sbusType'] + '"data-eftKey = "' + full['eftKey'] + '" >RP</a>'
                }
                if (tableActions[i]['name'] == 'ADJ') {
                  str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-paymentKey = "' + full['paymentKey'] + '" data-chequeRefNo = "' + full['chequeRefNo'] + '" data-transStatus = "' + full['transStatus'] + '" data-sbusType = "' + full['sbusType'] + '" >ADJ</a>'
                }
              } else if (tableId == "claimsAttachedToTransactionList") {
                  str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-discipline = "' + full['discipline'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              } else {
                str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              }
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var checked = ""
          if (data == "T") {
            checked = "checked"
          }
          return '<input disabled class="individual" type="checkbox" name="id[]" ' + checked + ' value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': amount_rightDollar,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'claimsAttachedToTransactionList' || tableId == 'claimsAttachedToPaymentList'
          ) {
            if (data) {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
            } else {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
            }
          }
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'claimsAttachedToTransactionList' || tableId == 'claimsAttachedToPaymentList'
          ) {
            return data;
          }
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'claimsAttachedToTransactionList' && isRedirect != "F") {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.selectedRowClaimsattachedToTrans = data
          }
          if (tableID == 'claimsAttachedToPaymentList' && isRedirect != "F") {
            this.selectedRowReissuePaymentData = data
          }
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq && (tableId == "search-card-table")) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * Jquery Datatable for Refund
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param isRedirect 
   */
  jqueryDataTableForUft(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var checked = ""
          if (data == "T") {
            checked = "checked"
          }
          return '<input disabled class="individual" type="checkbox" name="id[]" ' + checked + ' value="' + data + '" >';
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      }],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            this.router.navigate(["/card/view/" + cardKey])
          }
          if (tableID == 'search-Dental-FeeGuide' && isRedirect != "F") {
            var dentFeeGuideKey = data['dentFeeGuideKey']
            this.router.navigate(["/feeGuide/view/" + dentFeeGuideKey])
          }
          if (tableID == 'dentalScheduleList' && isRedirect != "F") {
            var scheduleKey = data['dentFeeGuideSchedKey']  //57543791
            this.router.navigate(["/feeGuide/dentalSchedule/view/" + scheduleKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'rules-list' && isRedirect != "F") {
            this.router.navigate(['/users/view'])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.router.navigate(['/company/broker/edit', data['brokerKey']])
          }
          if (tableID == 'provider-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/dentist/view', data['providerKey']])
          }
          if (tableID == 'batch-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/claims/view', data['claimKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq && (tableId == "search-card-table")) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == "division_max_history") {
              for (let i in json.result.data) {
                json.result.data[i].dentalInd = json.result.data[i].dentalInd != "T" ? "No" : "Yes";
                json.result.data[i].visionInd = json.result.data[i].visionInd != "T" ? "No" : "Yes";
                json.result.data[i].healthInd = json.result.data[i].healthInd != "T" ? "No" : "Yes";
                json.result.data[i].drugInd = json.result.data[i].drugInd != "T" ? "No" : "Yes";
                json.result.data[i].wellnessInd = json.result.data[i].wellnessInd != "T" ? "No" : "Yes";
              }
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * 
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param isRedirect 
   * @param amount_rightDollar 
   * @param alignRight 
   */
  jqueryDataTableUFT(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amount_rightDollar = null, alignRight = null, sortFirstCol = null, sortOtherCols = null) {

    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering":
        (tableId == 'unitFinancialTransactionList_PDS') ||
          (tableId == 'unitFinancialTransactionList') ? true : false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == "unitFinancialTransactionList" && (data['tranCd'] == '92')) {
          $(row).addClass('reversal-row');
        }
        if (tableId == 'unitFinancialTransactionList' && data['reverseStatus'] == 'T') {
          $(row).addClass('reverse_status')
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': (tableId == 'unitFinancialTransactionList') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': amount_rightDollar,
        'searchable': false,
        'orderable': (tableId == 'unitFinancialTransactionList') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'brokerPayableList'
            || tableId == 'unitFinancialTransactionList'
            || tableId == 'unitFinancialTransactionListReportGrid'
          ) {
            if (data) {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
            } else {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
            }
          }
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': (tableId == 'unitFinancialTransactionList') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'unitFinancialTransactionList'
            || tableId == 'brokerPayableList'
            || tableId == 'unitFinancialTransactionList1'
            || tableId == 'unitFinancialTransactionListReportGrid') {
            return data;
          }
        }
      },
      {
        'targets': sortFirstCol,
        'searchable': false,
        'orderable': true,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': sortOtherCols,
        'searchable': false,
        'orderable': true,
        'className': 'amount_right_grid-padding',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': (tableId == 'unitFinancialTransactionList') ? true : false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'unitFinancialTransactionList' && data['reverseStatus'] == 'F') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.uftSelectedRowData = data;
          } else {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('reverse_status');
            this.uftSelectedRowData = data;
          }
          if (tableID == 'brokerPayableList') {
            this.payablebrokerSelectedRowData = data;
          }
          if (tableID == 'refundList') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.refundSelectedRowData = data;
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          self.totalRecords = json.recordsTotal
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == 'unitFinancialTransactionList') {
              $('#uftSearchExcelBtn').removeClass('hideGPRunButton')
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            if (tableId == 'unitFinancialTransactionList') {
              $('#uftSearchExcelBtn').addClass('hideGPRunButton')
            }
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * 
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param isRedirect 
   * @param amount_rightDollar 
   * @param alingRight 
   * @param dateColsAlign 
   */
  jqueryDataTablePayables(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amount_rightDollar, alingRight = null, dateColsAlign = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == "unitFinancialTransactionList" && (data['tranCd'] == '92')) {
          $(row).addClass('reversal-row');
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'refundList'
            || tableId == 'claimList'
          ) {
            return data;
          }
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': amount_rightDollar,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'claimList'
            || tableId == 'refundList'
          ) {
            if (data) {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
            } else {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
            }
          }
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': dateColsAlign,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'unitFinancialTransactionList') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.uftSelectedRowData = data;
          }
          if (tableID == 'refundList') {
            this.selectedRefundChequeRowData = data;
          }
          if (tableID == 'unitFinancialTransactionList1') {
            this.selectedReverseChequeRowData = data;
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          if (tableId == 'refundList'
          ) {
            self.pageLength = pageLength
          }
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == 'refundList') { $('.bgp').removeClass('hideGPRunButton') }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            if (tableId == 'refundList') {
              $('.bgp').addClass('hideGPRunButton')
            } return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * 
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param isRedirect 
   * @param alingRight 
   */
  jqueryDataTableCompanyDocument(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, alingRight = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": 'simple_numbers',
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              var docName = full.coDocumentName
              var docType = docName.substring(docName.lastIndexOf('.') + 1, docName.length) || docName;
              if (docType == 'docx' && tableActions[i]['name'] == 'view') {
                str = str + '<a class="table-action-btn download-ico" href="javascript:void(0)" data-id = "' + data + '"  data-coDocumentName = "' + full['coDocumentName'] + '" title="Download"><i class="fa fa-download"></i></a>'
              } else {
                str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-coDocumentName = "' + full['coDocumentName'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              }
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'company-upload-doc') {
            return data;
          }
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      }],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'company-upload-doc') {
            this.selectedCompanyUploadDocRowData = this.currentUserService.selectedCompanyUploadDocRowData = data;
          }
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]) {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == 'company-upload-doc'
            ) {
              self.totalRecords = json.recordsTotal
            }
            return json.result.data;
          } else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }

  /**
   * Convert amount to decimal
   * @param value 
   */
  convertAmountToDecimal(value) {
    if (value != '' && value != undefined) {
      var reg = /^-?\d+\.?\d*$/
      if (reg.test(value)) {
        value = value.toString(); //If it's not already a String
        if (value.indexOf(".") > -1) {
          value = value.slice(0, (value.indexOf(".")) + 3); //With 3 exposing the hundredths place
        }
        return parseFloat(value).toFixed(2);
      } else {
        return parseFloat('0').toFixed(2);
      }
    }
    else {
      return parseFloat('0').toFixed(2);
    }
  }

  /**
   * Function for Create Client Side Data table
   * @param tableId 
   * @param dataSet 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param isRedirect 
   * @param amountRight 
   * @param alingRight 
   * @param dateColsAlign 
   */
  jqueryDataTableClientSide(tableId, dataSet, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null, isRedirect = null, amountRight = null, alingRight = null, dateColsAlign = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": false,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
            }
          }
          return str
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (data) {
            return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
          } else {
            return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
          }
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      }],
      order: defaultOrderBy,
      'data': dataSet,
      "columns": columns
    });
  }

  jqueryDataTableClientSideReload(tableId, dataArray) {
    var tableElem = $("#" + tableId).DataTable();
    tableElem.rows.add(dataArray).draw();
  }

  jqueryDataTableClientSideClearReload(tableId, dataArray) {
    var tableElem = $("#" + tableId).DataTable();
    tableElem.clear();
    tableElem.rows.add(dataArray).draw();
  }

  jqueryDatatableDestroy(tableId) {
    var tableElem = $("#" + tableId).DataTable();
    tableElem.destroy();
  }

  /**
   * 
   * @param tableId 
   * @param url 
   * @param pagingType 
   * @param columns 
   * @param pageLength 
   * @param serverSide 
   * @param processing 
   * @param topDom 
   * @param bottomDom 
   * @param checkboxCol 
   * @param defaultOrderBy 
   * @param actionCol 
   * @param reqParam 
   * @param tableActions 
   * @param actionColumn 
   * @param dateCols 
   * @param isRedirect 
   * @param amountRight 
   * @param alingRight 
   * @param dateColsAlign 
   * @param sortFirstCol 
   * @param sortOtherCols 
   * @param rightWithoutSort 
   */
  jqueryDataTable(tableId, url1: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String,
    checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, actionColumn, dateCols = null,
    isRedirect = null, amountRight = null, alingRight = null, dateColsAlign = null, sortFirstCol = null,
    sortOtherCols = null, rightWithoutSort = null, leftWithoutSort = null, colors: String = "null", checkboxColsDisabled = null, modalTarget = null) {

    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    self.currentTableId = tableId;
    if ($('#hideTableError').length) {
      $('#hideTableError').hide();
    }
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": 'simple_numbers',
      "processing": processing,
      "serverSide": true,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering":
        (tableId == 'claimPaymentsByCardholder') ||
          (tableId == 'cardsbycompany') ||
          (tableId == 'brokerQsi') ||
          (tableId == 'claimpaymentbycardholder') ||
          (tableId == 'amountPaidCompanyplancard') ||
          (tableId == 'plan-category') ||
          (tableId == 'plan-rule') ||
          (tableId == 'ClientAgeGroupByPostcodeAndService') ||
          (tableId == 'unitFinancialTransactionListReportGrid') ||
          (tableId == 'unitFinancialTransactionList1') ||
          (tableId == 'unitFinancialTransactionList_PDS') ||
          (tableId == 'ClaimAndClainantCount') ||
          (tableId == 'programUtilizationReport') ||
          (tableId == 'uftDashboard_notificationAction') ||
          (tableId == 'uftDashboard_releaseClaimsAction_Expire') ||
          (tableId == 'qBCITravelEligibility') ||
          (tableId == 'companyBalance') ||
          (tableId == 'qBCIEligibilityRBC') ||
          (tableId == 'ClaimByMonthCat') ||
          (tableId == 'qBCIEligibilityAge65') ||
          (tableId == 'uftDashboard_releaseClaimsAction') ||
          (tableId == 'uftDashboard_notification') ||
          (tableId == 'overrideReport') ||
          (tableId == 'uftDashboard_releaseClaims') ||
          (tableId == 'cardholderReport') ||
          (tableId == 'brokerCompanySummaryReport') ||
          (tableId == 'uftDashboard_claimAboutToExpire') ||
          (tableId == 'broker0371Commission') ||
          (tableId == 'divisionUtilizationReport') ||
          (tableId == 'brokerCommissionSummary') ||
          (tableId == 'refundPaymentSummaryReport') ||
          (tableId == 'getTaxPayableSummaryReport') ||
          (tableId == 'uFTReportList') ||
          (tableId == 'uFTReport') ||
          (tableId == 'unpaidClaimsReport') ||
          (tableId == 'providerWithoutEFT') ||
          (tableId == 'summaryOfProviderDebits') ||
          (tableId == 'mail_search_report') ||
          (tableId == 'fundingSummary') ||
          (tableId == 'fundingSummary-callIn') ||
          (tableId == 'companySearchCardTable') ||
          (tableId == 'bankReportSummary') ||
          (tableId == 'filesList') ||
          (tableId == 'fileListHistory') ||
          (tableId == 'fundingSummaryWithAction') ||
          (tableId == 'fundingSummaryWithRCAction') ||
          (tableId == 'amountPaidReport') ||
          (tableId == 'COBSavings') ||
          (tableId == 'DemographicStat') ||
          (tableId == 'companyOpeningBalances') ||
          (tableId == 'companyClosingBalances') ||
          (tableId == 'show-preAuthReview-claim-table') ||
          (tableId == 'ListTable') ||
          (tableId == 'bankOpeningBalances') ||
          (tableId == 'terminateCompanyList') ||
          (tableId == 'paymentReportGrid') ||
          (tableId == 'negativeTransactionList') ||
          (tableId == 'receiptsList') ||
          (tableId == 'adjustmentReqTable') ||
          // Below one added to show Adjudicated or approved claims but not released.
          (tableId == 'pendingElectronicAdjustmentList') ||
          ( tableId == 'finalNoticeList') ||
          ( tableId == 'expireClaimList' ) ||
          (tableId == 'uftDashboard_bar1') ? true : false,
      "createdRow": function (row, data, dataIndex) {

        if (tableId == "brokerContact" && data['brokerCompanyMainInd'] == `Y` && isRedirect != "F") {
          $(row).addClass('hl-row');
        } else if (tableId == "company-contact") {
          if (data['mainContactInd'] == `Y`) {
            $(row).addClass('hl-row');
          }
          if (data['expiredOn']) {
            let todayDate = self.changeDateFormatService.getToday();
            let expiredDate = self.changeDateFormatService.convertStringDateToObject(data['expiredOn'])
            this.error = self.changeDateFormatService.compareTwoDates(todayDate.date, expiredDate.date);
            if (this.error.isError == true) {
              $(row).addClass('reversal-row');
            }
          }
        } else if (tableId == "company-broker") {
          if (data['primaryBrokerInd'] == `Y`) { //optOutBrokerMailInd
            $(row).addClass('hl-row');
          }
          if (data['expiredOn']) {
            let color = self.IsDateCheck(data['expiredOn']);
            let todayDate = self.changeDateFormatService.getToday();
            let expiredDate = self.changeDateFormatService.convertStringDateToObject(data['expiredOn'])
            this.error = self.changeDateFormatService.compareTwoDates(todayDate.date, expiredDate.date);
            if (this.error.isError == true) {
              $(row).addClass('reversal-row');
            }
            $('td:nth-child(6)', row).css({ 'color': color, 'font-weight': 'bold' });
          }
        } else if (tableId == "ListTable") {
          if (data['recInd']) {
            if (data['recInd'] != 'F') {
              $('td', row).css({ 'color': '#ff8159' });
            }
          }
        }
        else if (tableId == "companySearchCardTable") {
          if (data['status'] == 'ACTIVE') {
            $(row).addClass('hactive-row');
          } else if (data['status'] == 'INACTIVE') {
            $(row).addClass('reversal-row');
          }
        } else if (tableId == "unitFinancialTransactionList" && (data['tranCd'] == '92')) {
          $(row).addClass('reversal-row');
        } else if (tableId == "brokerContact" && isRedirect != "F") {
          if (data['brokerCompanyMainInd'] == `Y`) {
            $(row).addClass('hl-row');
          }
          if (data['brokerContactExpiredOn']) {
            let color = self.IsDateCheck(data['brokerContactExpiredOn']);
            let todayDate = self.changeDateFormatService.getToday();
            let expiredDate = self.changeDateFormatService.convertStringDateToObject(data['brokerContactExpiredOn'])
            this.error = self.changeDateFormatService.compareTwoDates(todayDate.date, expiredDate.date);
            if (this.error.isError == true) {
              $(row).addClass('reversal-row');
            }
            $('td:nth-child(6)', row).css({ 'color': color, 'font-weight': 'bold' });
          }
        } else if (tableId == "brokerListTable" && data['status'] == `T`) {
          $(row).addClass('hactive-row');
        } else if (tableId == "brokerListTable" && data['status'] == `F`) {
          $(row).addClass('hterminated-row');
          $('td:nth-child(5)', row).css({ 'color': '#eb5757', 'font-weight': 'bold' });
        } else if (tableId == "search-card-table" && data['status'] == `INACTIVE`) {
          $(row).addClass('hterminated-row');
        } else if (tableId == "search-card-table" && data['status'] == `ACTIVE`) {
          $(row).addClass('hactive-row');
        } else if (tableId == "companySearchCardTable" && data['status'] == `INACTIVE`) {
          $(row).addClass('hterminated-row');
        } else if (tableId == "companySearchCardTable" && data['status'] == `ACTIVE`) {
          $(row).addClass('hactive-row');
        } else if (tableId == "referClaimTable" && data['markAsRead'] == "F") {
          $(row).addClass('hterminated-row');
        } else if (tableId == "fundingSummaryWithAction") {
          if (data['fileAttached'] == "T") {
            $('td a.upload-ico', row).addClass('hideUploadIco')
          } else if (data['fileAttached'] == "F") {
            $('td a.view-ico', row).addClass('hideViewIco')
          }
        } else if (tableId == "fundingSummaryWithRCAction") {
          if (data['fileAttached'] == "T") {
            $('td a.upload-ico', row).addClass('hideUploadIco')
          } else if (data['fileAttached'] == "F") {
            $('td a.view-ico', row).addClass('hideViewIco')
          }
        }
        else if(tableId == "fundingSummary"){
          if (data['fileAttached'] == "T") {
            $('td a.upload-ico', row).addClass('hideUploadIco')
          } else if (data['fileAttached'] == "F") {
            $('td a.view-ico', row).addClass('hideViewIco')
          }
        }
         else if (tableId == "brokerCompanyAssociated") {
          if (data['expiredOn']) {
            let color = self.IsDateCheck(data['expiredOn']);
            $('td:nth-child(6)', row).css({ 'color': color, 'font-weight': 'bold' });
          }
          if (data['coTerminateOn']) {
            $('td:nth-child(8)', row).css({ 'color': '#eb5757', 'font-weight': 'bold' });
          }
        }
        else if (tableId == "uftDashboard_bar1") {
          if (data['coCategoryColorCode']) {
            let color = data['coCategoryColorCode'];
            $('td:nth-child(1)', row).css("cssText", "background-color: " + color + " !important;")
            $('td:nth-child(1)', row).text('');
          }
          if (data['coTerminateOn']) {
            $('td:nth-child(8)', row).css({ 'color': '#eb5757', 'font-weight': 'bold' });
          }
        }
        if (tableId == "schedule") {
          if (data['expiredOn']) {
            let color = self.IsDateCheck(data['expiredOn']);
            $('td:nth-child(3)', row).css({ 'color': color, 'font-weight': 'bold' });
          }
        }
        if (tableId == "province") {
          if (data['expiredOn']) {
            let color = self.IsDateCheck(data['expiredOn']);
            $('td:nth-child(3)', row).css({ 'color': color, 'font-weight': 'bold' });
          }
        }
        if (tableId === "search-card-table") {
          if (data['gender'] === "Male") {
            $('td:nth-child(4)', row).empty().html('M');
          }
          if (data['gender'] === "Female") {
            $('td:nth-child(4)', row).empty().html('F');
          }
          if (data['cardHolderRole'] === "Primary") {
            $('td:nth-child(8)', row).empty().html('P');
          }
          if (data['cardHolderRole'] === "Spouse") {
            $('td:nth-child(8)', row).empty().html('S');
          }
          if (data['cardHolderRole'] === "Dependent") {
            $('td:nth-child(8)', row).empty().html('D');
          }
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': (tableId == "ListTable" || tableId == 'negativeTransactionList' || tableId == 'receiptsList') ? true : false,
        'className': (tableId == "fundingSummaryWithAction" || tableId == "fundingSummary" || tableId == 'gov-elig-file-upload-doc' || tableId == "fundingSummaryWithRCAction" || tableId == "company-broker" || tableId == "company-contact" || tableId == "credit-limit" || tableId == "userRolesList" || tableId == "payableReportList" || tableId == "serviceProviderList" || tableId == "cardPrintRequestList" || tableId == "phyCardPrintRequestList" || tableId == "filesList" || tableId == "fileListHistory" || tableId == "bankFilesList" || tableId == "bankFileHistoryList" || tableId == "terminateCompanyList" || tableId == "payableReportList_finance" || tableId == 'company-bank-account-history' || tableId == 'akiraBenefitList' || tableId == 'pendingElectronicAdjustmentList' || tableId == 'suspend_company' || tableId == 'productionReportList') ? 'amount_right_grid' : 'dt-body-center',
        'render': function (data, type, full, meta) {
          var str = '';
          let cardid = '';
          if (tableId == 'cardPrintRequestList' || tableId == 'phyCardPrintRequestList') {
            cardid = full.cardNum || ''
          }
          if (tableId == 'uftDashboard_releaseClaimsAction' || tableId == 'uftDashboard_releaseClaimsAction_Expire') {
            if (full.claimStatusCd == 'B') {
              for (var i = 0; i < tableActions.length; i++) {
                if (tableActions[i]['showAction'] != "F") {
                  if (tableActions[i]['name'] == 'OD') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" >OD</a>'
                  } else {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  }
                }
              }
            } else {
              for (var i = 0; i < tableActions.length; i++) {
              if (tableActions[i]['showAction'] != "F") {
                str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
              }
              }
            }
          } else {
            for (var i = 0; i < tableActions.length; i++) {
              if (tableActions[i]['showAction'] != "F") {
                if (tableId == 'referClaimTable') {
                  if (tableActions[i]['name'] == 'deleteReferedCalim') {
                    //Added condiation for log 982
                    if (full.markAsRead == 'T') {
                      str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                    }
                  } else {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  }
                } else if (tableId == "terminateCompanyList") {
                  if (tableActions[i]['name'] == 'edit') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-key = "' + full['key'] + '" data-coNameAndId = "' + full['coNameAndId'] + '" data-coTerminatedOn = "' + full['coTerminatedOn'] + '" data-coName = "' + full['coName'] + '" data-creditLimitMultiplier = "' + full['creditLimitMultiplier'] + '" data-pendingClaimAmt = "' + full['pendingClaimAmt'] + '" data-coClosingBalance = "' + full['coClosingBalance'] + '" data-coClosingBalance = "' + full['coClosingBalance'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  }
                  if (tableActions[i]['name'] == 'IR') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" >IR</a>'
                  }
                  if (tableActions[i]['name'] == 'IS') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" >IS</a>'
                  }
                  if (tableActions[i]['name'] == 'WO') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" >Writeoff</a>'
                  }
                  if (tableActions[i]['name'] == 'delete') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  }
                  // Log #1149: zero balance button added as per client comment
                  if (tableActions[i]['name'] == 'ZB') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" >ZB</a>'
                  }
                } else if (tableId == "pendingElectronicAdjustmentList") {
                  if (tableActions[i]['name'] == 'view') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" data-target = "#' + modalTarget + '" data-toggle="modal" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" data-key = "' + full['key'] + '" data-coNameAndId = "' + full['coNameAndId'] + '" data-coTerminatedOn = "' + full['coTerminatedOn'] + '" data-coName = "' + full['coName'] + '" data-creditLimitMultiplier = "' + full['creditLimitMultiplier'] + '" data-pendingClaimAmt = "' + full['pendingClaimAmt'] + '" data-coClosingBalance = "' + full['coClosingBalance'] + '" data-coClosingBalance = "' + full['coClosingBalance'] + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  }
                  if (tableActions[i]['name'] == 'BD') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '"data-payee = "' + full['payee'] + '"data-pelpKey = "' + full['pelpKey'] + '"data-filePath = "' + full['filePath'] + '"data-discipline = "' + full['discipline'] + '" >BD</a>'
                  }
                  if (tableActions[i]['name'] == 'PA') {
                    str = str + '<a class="table-action-btn download-ico" href="javascript:void(0)" data-id = "' + data + '"data-filePath = "' + full['filePath'] + '" title="Payment Attachment"><i class="fa fa-download"></i></a>'
                  }
                  if (tableActions[i]['name'] == 'CP') {
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '"data-payee = "' +full['payee'] + '"data-pelpKey = "' + full['pelpKey'] + '"data-filePath = "' + full['filePath'] + '"data-discipline = "' +full['discipline'] + '"data-chequeRefNo = "' +full['chequeRefNo'] + '"data-payTransKey = "' +full['payTransKey'] + '"data-pdiscipline = "' +full['pdiscipline'] + '"data-businesstype = "' +full['businesstype'] + '"data-transNo = "' +full['transNo'] + '"data-eftKey = "' +full['eftKey']+ '" >CP</a>'
                  }
                } else if(tableId == 'adjustmentReqTable') {
                  if (tableActions[i]['name'] == 'commentMsg') {
                    if (full['comText'] != "" && full['comText'] != "null" && full['comText'] != undefined && full['comText'] != null) {
                      str = str + '<a class="table-action-btn commentMsg" href="javascript:void(0)" data-id = "' + data + '"data-comText = "' + full['comText'] + '" title="Comment"><i class="fa fa-comment"></i></a>'
                    }
                  }
                  if (tableActions[i]['name'] == 'adjustmentRequestDeleteAction'){ 
                    str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                  }
                  if (tableActions[i]['name'] == 'attachment') {
                    if (full['fileName'] != "" && full['fileName'] != undefined && full['fileName'] != null) {
                      str = str + '<a class="table-action-btn download-ico" href="javascript:void(0)" data-id = "' + data + '"data-filePath = "' + full['filePath'] + '" title="Attachment"><i class="fa fa-download"></i></a>'
                    }
                  }	
                }
                else {
                  str = str + '<a title="' + tableActions[i]['title'] + '" class="' + tableActions[i]['class'] + '" href="javascript:void(0)"  data-card="' + cardid + '"  data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
              }
            }
          }
          if (tableId == 'ListTable') {
            // if (full.payeeType == "Company") {
            //   full.transactionAmount = Math.abs(full.transactionAmount)
            // }
            let completeData = {
              "payabletransactionKey": full.payabletransactionKey,
              "payeeNumber": full.payeeNumber,
              "payeeType": full.payeeType,
              "transactionAmount": full.transactionAmount,
              "payeeTypeCd": full.payeeTypeCd,
              "planTypeCd": full.planTypeCd,
              "transactionType": full.transactionType,
              "paymentSumKey": full.paymentSumKey,
              "referenceCd": full.referenceCd,
              "recInd": full.recInd,
            };

            str = "<input class='listTableCheck' type='checkbox' data-val='" + JSON.stringify(completeData) + "' )'>";
          }
          if (tableId == 'negativeTransactionList') {
            let negativeListVal = {
              'payableTransactionKey': full.payableTransactionKey,
              'payeeNumber': full.payeeNumber,
              'payeeName': full.payeeName,
              'transactionAmount': full.transactionAmount,
              'referenceCd': full.referenceCd,
              'businessTypeCd': full.businessTypeCd,
              'transNumber': full.transNumber
            };
            str = "<input class='negativeListCheck' type='checkbox' data-val='" + JSON.stringify(negativeListVal) + "' )'>";
          }
          if (tableId == 'receiptsList') {
            let receiptListVal = {
              'discipline': full.discipline,
              'pdiscipline': full.pdiscipline,
              'transAmt': full.transAmt,
              'payeeName': full.payeeName,
              'payNo': full.payNo,
              'claimNumber': full.claimNumber,
              'claimKey': full.claimKey,
              'businessTypeDesc': full.businessTypeDesc,
              'businessTypeCd': full.businessTypeCd,
              'transNumber': full.transNumber
            };
            str = "<input class='receiptsListCheck' type='checkbox' data-val='" + JSON.stringify(receiptListVal) + "' )'>";
          }
          return str
        }
      },
      {
        'targets': colors,
        'searchable': false,
        'orderable': true,
        'className': 'sdfsd',
        'render': function (data, type, full, meta) {
          return '<input class="individual" type="checkbox" name="id[]" value="' + data + '" >';
        }
      },
      {
        'targets': dateCols,
        'searchable': false,
        'orderable': true,
        'className': (tableId == 'programUtilizationReport' || tableId == 'termination-division-history' || tableId == 'suspend_plan' || tableId == 'dobMismatchReport_OFF' || tableId == 'division_comments' || tableId == 'bankReportSummary' || tableId == 'suspended_company' || tableId == 'suspend_company' || tableId == 'filesList' || tableId == 'fileListHistory') ? 'dt-body-center' : 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (data) {
            return self.changeDateFormatService.changeDateByMonthName(data);
          } else {
            return self.changeDateFormatService.changeDateByMonthName('');
          }
        }
      },
      {
        'targets': dateColsAlign,
        'searchable': false,
        'orderable': (tableId == 'bankReportSummary') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'bank-history' && meta.col == 5) {
            let datee = self.changeDateFormatService.changeDateByMonthName(data)
            let html = "<input type='text' id ='date_" + meta.row + "'  class='fm-txt form-control table_date' value='" + datee + "'></input>"
            return html
          } else {
            return self.changeDateFormatService.changeDateByMonthName(data);
          }
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          if (tableId == 'bank-history') {
            return "<select  id='select_" + meta.row + "' data-id='" + JSON.stringify(full) + "' class='fm-txt form-control bankHistory' placeholder='Select' name='' ><option value=''  selected  > Select</option><option value='C'  data-id='" + JSON.stringify(full) + "'> Clear</option><option value='R'  data-id='" + JSON.stringify(full) + "'> Remove</option><option value='S'  data-id='" + JSON.stringify(full) + "'> Skip</option></select>";
          } else {
            return '<input class="individual checkboxes" type="checkbox" name="id[]" value="' + data + '" >';
          }
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': true,
        'className': (tableId == 'akiraBenefitList') ? 'dt-body-center' : 'amount_right_grid amount-custom-style',
        'render': function (data, type, full, meta) {
          if (tableId == 'refundPaymentSummary'
            || tableId == 'claimPaymentsByCardholder'
            || tableId == 'ListTable'
            || tableId == 'cardsbycompany'
            || tableId == 'brokerQsi'
            || tableId == 'claimpaymentbycardholder'
            || tableId == 'amountPaidCompanyplancard'
            || tableId == 'plan-category'
            || tableId == 'plan-rule'
            || tableId == 'programUtilizationReport'
            || tableId == 'fundingSummary'
            || tableId == 'bankReportSummary'
            || tableId == 'fundingSummaryWithAction'
            || tableId == 'fundingSummaryWithRCAction'
            || tableId == 'companyBalance'
            || tableId == 'providerWithoutEFT'
            || tableId == 'getTaxPayableSummaryReport'
            || tableId == 'unpaidClaimsReport'
            || tableId == 'brokerCompanySummaryReport'
            || tableId == 'uFTReport'
            || tableId == 'summaryOfProviderDebits'
            || tableId == 'companyClosingBalances'
            || tableId == 'companyOpeningBalances'
            || tableId == 'bankOpeningBalances'
            || tableId == 'uFTReportList'
            || tableId == 'unattachedClaimsList'
            || tableId == 'unitFinancialTransactionList'
            || tableId == 'unitFinancialTransactionList1'
            || tableId == 'uftDashboard_bar1'
            || tableId == 'uftDashboard_notification'
            || tableId == 'unprocessed_data_datatable'
            || tableId == 'uftDashboard_claimAboutToExpire'
            || tableId == 'uftDashboard_notificationAction'
            || tableId == 'uftDashboard_releaseClaimsAction_Expire'
            || tableId == 'uftDashboard_releaseClaims'
            || tableId == 'uftDashboard_releaseClaimsAction'
            || tableId == 'debitProviderReport'
            || tableId == 'refundPaymentSummaryReport'
            || tableId == 'claimsPaymentRunSummary'
            || tableId == 'overrideReport'
            || tableId == 'cardholderReport'
            || tableId == 'brokerCommissionSummary'
            || tableId == 'divisionUtilizationReport'
            || tableId == 'ClaimAndClainantCount'
            || tableId == 'ClaimByMonthCat'
            || tableId == 'COBSavings'
            || tableId == 'DemographicStat'
            || tableId == 'ProcedureRank'
            || tableId == 'Exception'
            || tableId == 'DentureReplacement'
            || tableId == 'ExceptionReport'
            || tableId == 'PreauthByReviewAndDASPException'
            || tableId == 'PreauthByReviewDASP'
            || tableId == 'PreauthByReviewOther'
            || tableId == 'dailyClaimProcessing'
            || tableId == 'govtClaimsVolumeReport'
            || tableId == 'quikCardClaimsVolumeReport'
            || tableId == 'dobMismatchReport'
            || tableId == 'broker0371Commission'
            || tableId == 'qBCIEligibilityAge65'
            || tableId == 'qBCIEligibilityRBC'
            || tableId == 'qBCIEligibilityTravelInsurance'
            || tableId == 'qBCITravelEligibility'
            || tableId == 'upcomingTransactionsList'
            || tableId == 'amountPaidReport'
            || tableId == 'fundingReport'
            || tableId == 'paymentTypeList'
            || tableId == 'dailyPapList'
            || tableId == 'refundTypeList'
            || tableId == 'refundChequeList'
            || tableId == 'unitFinancialTransactionList_PDS'
            || tableId == 'serviceProviderList'
            || tableId == 'submissionStatsReport'
            || tableId == 'bank-history'
            || tableId == 'studentStatusList'
            || tableId == 'pendingClaimsList'
            || tableId == 'terminateCompanyList'
            || tableId == 'writeoffReportgrid'
            || tableId == 'unitFinancialTransactionListReportGrid'
            || tableId == 'akiraBenefitList'
            || tableId == 'standard-pap-amount'
            || tableId == 'adjusted-pap-amount'
            || tableId == 'amountPaidByCompanyPlanAndCoverageCategoryList'
            || tableId == 'pendingElectronicAdjustmentList'
            || tableId == 'adjustmentReqTable'
            // Below one added to show Adjudicated or approved claims but not released.                     
            || tableId == 'negativeTransactionList'
            || tableId == 'receiptsList'
            || tableId == 'notificationGeneratedClaimsList'
            || tableId == 'aboutToExpireClaimsList'
            || tableId == 'adjudicatedClaimsList'
            || tableId == 'pendingPaperworkClaimList'
            || tableId == 'finalNoticeList'
            || tableId == 'expireClaimList'
          ) {
            if (data) {
              let id = tableId + '_' + meta.row
              if (tableId == 'bank-history') {
              }
              if (tableId == 'ListTable') {
                // Change -ve sign to +ve sign in case of Company PayeeType as per Arun Sir
                if (full.payeeType == "Company") {
                  return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(data))
                }
              }
              if (full.recInd) {
                if (full.recInd != "F") {
                  return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(-data)
                } else {
                  return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
                }
              } else {
                return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data)
              }
            } else {
              return "<span>$</span>" + new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)
            }
          }
          else {
            return data;
          }
        }
      },
      {
        'targets': alingRight,
        'searchable': false,
        'orderable': true,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {

          self.emitAmountBatchNo.emit(full.batch) // 7 may 2020
          self.emitAmountStatus.emit(full.batchStatusDef);
          if (tableId == 'refundPaymentSummary'
            || tableId == 'wellnessProcCodeList'
            || tableId == 'ListTable'
            || tableId == 'plan-category'
            || tableId == 'plan-rule'
            || tableId == 'company-bank-account-history'
            || tableId == 'fundingSummary'
            || tableId == 'fundingSummary-callIn'
            || tableId == 'bankReportSummary'
            || tableId == 'fundingSummaryWithAction'
            || tableId == 'fundingSummaryWithRCAction'
            || tableId == 'broker-payment-list'
            || tableId == 'companyBalance'
            || tableId == 'providerWithoutEFT'
            || tableId == 'filesList'
            || tableId == 'fileListHistory'
            || tableId == 'categoryClameList'
            || tableId == 'getTaxPayableSummaryReport'
            || tableId == 'unpaidClaimsReport'
            || tableId == 'procedureCodeList'
            || tableId == 'visionProcCodeList'
            || tableId == 'healthProcedureCodeList'
            || tableId == 'hsaProcCodeList'
            || tableId == 'brokerCompanySummaryReport'
            || tableId == 'uFTReport'
            || tableId == 'summaryOfProviderDebits'
            || tableId == 'companyClosingBalances'
            || tableId == 'companyOpeningBalances'
            || tableId == 'bankOpeningBalances'
            || tableId == 'uFTReportList'
            || tableId == 'unattachedClaimsList'
            || tableId == 'unitFinancialTransactionList'
            || tableId == 'unitFinancialTransactionList1'
            || tableId == 'uftDashboard_bar1'
            || tableId == 'uftDashboard_notification'
            || tableId == 'unprocessed_data_datatable'
            || tableId == 'uftDashboard_claimAboutToExpire'
            || tableId == 'uftDashboard_notificationAction'
            || tableId == 'uftDashboard_releaseClaimsAction_Expire'
            || tableId == 'uftDashboard_releaseClaimsAction'
            || tableId == 'reportsList'
            || tableId == 'reportsList_datamangement'
            || tableId == 'debitProviderReport'
            || tableId == 'refundPaymentSummaryReport'
            || tableId == 'claimsPaymentRunSummary'
            || tableId == 'company-upload-doc'
            || tableId == 'referClaimTable'
            || tableId == 'serviceProviderList'
            || tableId == 'cardPrintRequestList'
            || tableId == 'phyCardPrintRequestList'
            || tableId == 'claimSecureList'
            || tableId == 'overrideReport'
            || tableId == 'cardholderReport'
            || tableId == 'brokerCommissionSummary'
            || tableId == 'divisionUtilizationReport'
            || tableId == 'batch-list'
            || tableId == 'provider-list'
            || tableId == 'termination-division-history'
            || tableId == 'ClientAgeGroupByPostcodeAndService'
            || tableId == 'ClaimAndClainantCount'
            || tableId == 'ClaimByMonthCat'
            || tableId == 'COBSavings'
            || tableId == 'DemographicStat'
            || tableId == 'ProcedureRank'
            || tableId == 'Exception'
            || tableId == 'DentureReplacement'
            || tableId == 'ExceptionReport'
            || tableId == 'PreauthByReviewAndDASPException'
            || tableId == 'PreauthByReviewDASP'
            || tableId == 'PreauthByReviewOther'
            || tableId == 'dailyClaimProcessing'
            || tableId == 'govtClaimsVolumeReport'
            || tableId == 'quikCardClaimsVolumeReport'
            || tableId == 'dobMismatchReport'
            || tableId == 'broker0371Commission'
            || tableId == 'qBCIEligibilityAge65'
            || tableId == 'qBCIEligibilityRBC'
            || tableId == 'qBCIEligibilityTravelInsurance'
            || tableId == 'qBCITravelEligibility'
            || tableId == 'amountPaidReport'
            || tableId == 'unitFinancialTransactionList'
            || tableId == 'unitFinancialTransactionList1'
            || tableId == 'company-contact'
            || tableId == 'company-broker'
            || tableId == 'companySearchCardTable'
            || tableId == 'credit-limit'
            || tableId == 'termination-history'
            || tableId == 'suspend_plan'
            || tableId == 'brokerListTable'
            || tableId == 'brokerCompanyAssociated'
            || tableId == 'brokerContact'
            || tableId == 'broker-bank-table'
            || tableId == 'terminate-table'
            || tableId == 'search-card-table'
            || tableId == 'division_comments'
            || tableId == 'roles-users-list'
            || tableId == 'userRolesList'
            || tableId == 'fundingReport'
            || tableId == 'paymentTypeList'
            || tableId == 'dailyPapList'
            || tableId == 'refundTypeList'
            || tableId == 'refundChequeList'
            || tableId == 'show-preAuthReview-claim-table'
            || tableId == 'productionReport'
            || tableId == 'submissionStatsReport'
            || tableId == 'cardholderLabels'
            || tableId == 'brokerMailingLabels'
            || tableId == 'cardholderLabels'
            || tableId == 'companyMailingLabels'
            || tableId == 'serviceProviderMailingLabels'
            || tableId == 'summaryByCompanyPlanCardAndCoverage'
            || tableId == 'productionReportList'
            || tableId == 'cardCountByCompanyList'
            || tableId == 'educationalStatusLetters'
            || tableId == 'serviceProvidersList'
            || tableId == 'batchBalanceReportList'
            || tableId == 'primaryContactList'
            || tableId == 'uftDetails'
            || tableId == 'administrationFeesList'
            || tableId == 'bankingInformationList'
            || tableId == 'pendingClaimsList'
            || tableId == 'payableReportList'
            || tableId == 'bankFilesList'
            || tableId == 'itrans-list'
            || tableId == 'payableReportList_finance'
            || tableId == 'upcomingTransactionsList'
            || tableId == 'terminateCompanyList'
            || tableId == 'writeoffReportgrid'
            || tableId == 'file_type_datatable_claim_secure'
            || tableId == 'akiraBenefitList'
            || tableId == 'bank-history'
            || tableId == 'modifiedDASPPreauthClaimsList'
            || tableId == 'company-search'
            || tableId == 'amountPaidByCompanyPlanAndCoverageCategoryList'
            || tableId == 'uftDashboard_releaseClaims'
            || tableId == 'paymentReportGrid'
            || tableId == 'pendingElectronicAdjustmentList'
            || tableId == 'adjustmentReqTable'
            // #1266 Below one added to show Adjudicated or approved claims but not released.           
            || tableId == 'negativeTransactionList'
            || tableId == 'receiptsList'
            || tableId == 'cashAdjList'
            //...ticket 1256.
            || tableId == 'submissionTable'
            || tableId == 'consultantTable'
            //...Log #1230 
            || tableId == 'missingGroupInformationList'
            || tableId == 'notificationGeneratedClaimsList'
            || tableId == 'aboutToExpireClaimsList'
            || tableId == 'adjudicatedClaimsList'
            || tableId == 'pendingPaperworkClaimList'
            || tableId == 'finalNoticeList'
            || tableId == 'expireClaimList'
          ) {
            return data;
          }
        }
      },
      {
        'targets': sortFirstCol,
        'searchable': false,
        'orderable': true,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': sortOtherCols,
        'searchable': false,
        'orderable': true,
        'className': 'amount_right_grid-padding',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': rightWithoutSort,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': leftWithoutSort,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      }, {
        'targets': checkboxColsDisabled,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          if (data == 1) {
            return '<input id ="test" class="checkbox_check" type="checkbox" name="id[]" value="' + data + '" checked disabled> ';
          } else {
            return '<input id ="test" class="checkbox_check" type="checkbox" name="id[]" value="' + data + '" disabled> ';
          }
        }
      }],

      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {

        $('td', row).unbind('click');
        $('td', row).bind('click', () => {

          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'categoryClameList' && isRedirect != "F") {
            this.claimKey = data['claimKey']
            var disciplineKey = 1 // as arun sir said we only have 1 type of dicipline ie dental
            this.router.navigate(["/claim/view/" + data['claimKey'] + "/type/" + disciplineKey + '/reviewer/' + data['reviewKey']])
          }
           //ticket 1256
          if (tableID == 'submissionTable' && isRedirect != "F") {
            this.claimKey = data['claimKey']
            var disciplineKey = 1 // as arun sir said we only have 1 type of dicipline ie dental
            this.router.navigate(["/claim/view/" + data['claimKey'] + "/type/" + disciplineKey + '/reviewer/' + data['reviewKey']], { queryParams :{'isDash': 'RR'}})
          }
          if (tableID == 'consultantTable' && isRedirect != "F") {
            this.claimKey = data['claimKey']
            var disciplineKey = 1 // as arun sir said we only have 1 type of dicipline ie dental
            this.router.navigate(["/claim/view/" + data['claimKey'] + "/type/" + disciplineKey + '/reviewer/' + data['reviewKey']], { queryParams :{'isDash': 'RR'}})
          }
         //ticket 1256
          if (tableID == 'adjustmentReqTable' && isRedirect != "F") {
            var claimNumber = data['claimNumber']
            var businessType = data['businessTypeCd']
            this.claimNumber = data['claimNumber']
            this.businessType = data['businessTypeCd']
          }      
          if (tableID == 'gov-elig-file-upload-doc') {
            this.filesSelectedRowData = data;
          }
          if (tableId == 'unprocessed_data_datatable') {
            this.unprocessedDataRow = data;
          }

          if ((tableID == 'uftDashboard_notificationAction' || tableID == 'uftDashboard_releaseClaimsAction_Expire') && isRedirect != "F") {
            this.claimKey = data['claimKey']
            this.disciplineKey = data['disciplineKey'];
          }
          if (tableID == 'uftDashboard_releaseClaimsAction' && isRedirect != "F") {
            this.claimKey = data['claimKey']
            this.disciplineKey = data['disciplineKey']
          }
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.cardSelectedRowData = this.currentUserService.cardSelectedRowData = data
          }
          if (tableID == 'companySearchCardTable' && isRedirect != "F") {
            var cardKey = data['cardKey']
            var unitKey = data['unitKey'] 
            this.router.navigate(["/card/view/" + cardKey], { queryParams: { coRedirect: 'T', unitKey: unitKey }})
          }
          if (tableID == 'search-Dental-FeeGuide' && isRedirect != "F") {
            var dentFeeGuideKey = data['dentFeeGuideKey']
            this.router.navigate(["/feeGuide/view/" + dentFeeGuideKey])
          }
          if (tableID == 'company-list' && isRedirect != "F") {
            this.router.navigate(['/company/view', data['coKey']])
          }
          if (tableID == 'users-list' && isRedirect != "F") {
            this.router.navigate(['/users/view', data['userId']])
          }
          if (tableID == 'brokerListTable' && isRedirect != "F") {
            this.brokerSelectedRowData = this.currentUserService.brokerSelectedRowData = data;
          }
          if (tableId == 'cardPrintRequestList') {
            this.cardPrintRequestData = data;
          }
          if (tableId == 'phyCardPrintRequestList') {
            this.cardPrintRequestData = data;
          }
          if (tableId == 'plan-category') {
            this.companyBalanceSelectedRowData = data;
          }
          if (tableId == 'plan-rule') {
            this.companyBalanceSelectedRowData = data;
          }

          //Mail Merge 
          if (tableId == 'serviceProviderList') {
            this.serviceProviderListData = data;
          }
          if (tableID == 'provider-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/dentist/view', data['providerKey']])
          }
          if (tableID == 'batch-list' && isRedirect != "F") {
            this.router.navigate(['/dataEntry/claims/view', data['claimKey']])
          }
          if (tableID == "show-preAuthReview-claim-table" && isRedirect != "F") {
            window.open("/claim/view/" + data['claimKey'] + "/type/" + data['disciplineKey'] + "/preAuthReview", '_blank');
            $(document).find(".close").trigger('click')
          }
          if (tableID == 'uftDashboard_bar1' && isRedirect != "F") {
            this.companyBalanceSelectedRowData = this.currentUserService.companyBalanceSelectedRowData = data;
          }
          if (tableID == 'unitFinancialTransactionList' || tableID == 'unitFinancialTransactionList_PDS') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.uftSelectedRowData = data;
          }
          if (tableID == 'uftDashboard_notification' && isRedirect != "F") {
            this.uftSelectedRowCokey = data['coKey']
            this.uftSelectedRowType = data['claimStatusCd']
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
          }
          if (tableID == 'cashAdjList' && isRedirect != "F") {
            this.CALpayeeName = data['payeeName']
            this.CALclaimKey = data['claimKey']
            this.CALclaimNumber = data['claimNumber']
            this.CALtransAmt = data['claimAmt']
            this.CALpayeeNo = data['payNo']
            this.CALpayee = data['payee']
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
          }
          if (tableID == 'file_type_datatable') {
            this.fileTypeDataRow = data;
          }
          if (tableID == 'uftDashboard_releaseClaims' && isRedirect != "F") {
            this.uftSelectedRowClaimType = data
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
          }
          if (tableID == 'uftDashboard_claimAboutToExpire' && isRedirect != "F") {
            this.uftSelectedRowClaimType = data
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
          }
          if ((tableID == 'uftDashboard_notificationAction' || tableID == 'uftDashboard_releaseClaimsAction_Expire' || tableID == 'uftDashboard_releaseClaimsAction') && isRedirect != "F") {
            this.mailOutKey = data['mailOutKey']
            this.uftSelectedData = data
          }
          if (tableID == 'reportsList') {
            this.reportsSelectedRowData = data
          }
          if (tableID == 'reportsList_datamangement') {
            this.reportsSelectedRowDataManage = data
          }
          if (tableID == 'providerWithoutEFT') {
            this.providerWithoutEFTSelectedRowData = data
          }
          if (tableID == 'filesList') {
            this.filesSelectedRowData = data
          }
          if (tableID == 'categoryClameList') {
            this.filesSelectedRowData = data
          }
          if (tableID == 'bankFilesList') {
            this.filesSelectedRowData = data
          }
          if (tableID == 'refundChequeList') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.selectedRefundChequeRowData = data
          }
          if (tableID == 'unitFinancialTransactionList1') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.selectedReverseChequeRowData = data
          }
          if (tableID == 'fileListHistory') {
            this.histFilesSelectedRowData = data
          }
          if (tableID == 'bankFileHistoryList') {
            this.histFilesSelectedRowData = data
          }
          if (tableID == 'mailMergedFile') {
            this.notificationListRowData = data
          }
          if (tableID == 'refundList') {
            $('table td').removeClass('highlightedRow')
            $('td', row).addClass('highlightedRow')
            this.refundSelectedRowData = data;
          }
          if (tableID == 'referClaimTable' && isRedirect != "F") {
            this.referClaimKey = data['claimKey']
            this.referClaimDisciplinekey = data['disciplineKey']
            this.claimReferalKey = data['claimReferralKey']
          }
          if (tableID == 'fundingSummaryWithAction') {
            this.fundingSummarySelectedRowData = data
          }
          if (tableID == 'fundingSummaryWithRCAction') {
            this.fundingSummarySelectedRowData = data
          }
          if (tableID == 'fundingSummary') {
            this.fundingSummarySelectedRowData = data
          }
          if (tableID == 'unprocessed_data_datatable') {
            this.unprocessedSelectedRowData = data
          }
          if (tableID == 'terminateCompanyList') {
            this.terminateCompanySelectedRowData = data
          }
          if (tableID == 'cardCountByCompanyList') {
            this.cardCountByCompanyData.emit(data)
          }
          self.getCompanyDetails(data);
        });
        return row;
      },

      'ajax': {
        'url': url1,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          if (self.prevReq && (tableId == "search-card-table" || tableId == "userRolesList")) {
            tableElem.settings()[0].jqXHR.abort()
          }
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          // Task 473 Changes to correct request parameter for pagination in Daily file section.
          if (tableId == "file_type_datatable" && self.reqParam.length == 6 && self.reqParam[5].value == "D"){
            self.reqParam[3].value = "D"
          }                
          if (self.isTableReload) {
            if (tableId == 'receiptsList') {
              if (self.reqParam.length > 4) {
                self.reqParam = reqParam
              }
              if (self.reqParam.length == 4 && !self.isReceiptsTableReload) {
                self.reqParam = reqParam
              }
            }
            if (tableId == 'negativeTransactionList') {
              if (self.reqParam.length > 4) {
                self.reqParam = reqParam
              }
              if (self.reqParam.length == 4 && !self.isNegativeTableReload) {
                self.reqParam = reqParam
              }
            }
            for (let j in self.reqDateParams) {
              var indexValue = self.reqDateParams[j];
              if (self.reqParam[indexValue]) {
                var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
                self.reqParam[indexValue]['value'] = myDate;
              }
            }
            for (var i = 0; i < self.reqParam.length; i++) {
              d[self.reqParam[i]['key']] = self.reqParam[i]['value']
            }
          } else {
            for (let j in self.reqDateParams) {
              var indexValue = self.reqDateParams[j];
              if (reqParam[indexValue]) {
                var myDate = self.changeDateFormatService.formatDate(reqParam[indexValue]['value']);
                reqParam[indexValue]['value'] = myDate;
              }
            }
            for (var i = 0; i < reqParam.length; i++) {
              d[reqParam[i]['key']] = reqParam[i]['value']
            }
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot);

          if (json.code == 200) {
            let total = 0;
            let negTotal = 0;
            if (json.result.data.length > 0 && tableId == 'bank-doc-upload-list') {
              self.emitobj.emit(json.result.data[0])
            }
            if (tableId == 'cardCountByCompanyList') {
              self.cardCountByCompanyData
            }
            if (tableId == 'ListTable') {
              var sum;
              for (let ii = 0; ii < json.result.data.length; ii++) {
                if (json.result.data[ii].recInd == "F") {
                  if (json.result.data[ii].payeeType == "Company") {
                    sum = Math.abs(json.result.data[ii].transactionAmount);
                  } else {
                    sum = json.result.data[ii].transactionAmount;
                  }
                  total = total + (sum * 1);
                } else {
                  if (json.result.data[ii].payeeType == "Company") {
                    sum = Math.abs(json.result.data[ii].transactionAmount);
                  } else {
                    sum = json.result.data[ii].transactionAmount;
                  }
                  negTotal = negTotal + (sum * 1);
                }
              }
              self.amountNegTotal = negTotal.toFixed(2)
              self.amountTotal = total.toFixed(2);
            }
            let ob = {
              amountTotal: self.amountTotal || '0.00',
              amountNegTotal: self.amountNegTotal || '0.00'
            }
            self.emitAmount.emit(ob)
            self.totalRecords = json.recordsTotal
            self.emitAmountBatch.emit(self.totalRecords || '0.00')

            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == "uftDashboard_notification" || tableId == "uftDashboard_releaseClaims" || tableId == "uftDashboard_claimAboutToExpire" || tableId == "pendingClaimsList" || tableId == "notificationGeneratedClaimsList" || tableId == "aboutToExpireClaimsList" || tableId == "adjudicatedClaimsList" || tableId == "pendingPaperworkClaimList" || tableId == "finalNoticeList" || tableId == 'expireClaimList') {
              for (let i in json.result.data) {
                json.result.data[i].coDesc = json.result.data[i].coId + "-" + json.result.data[i].coName;
                json.result.data[i].pendingClaim = "";
              }
            }

            if (tableId == "file_type_datatable" && isRedirect != "F") { // added security check 
              if (json.result.data && json.result.data.length > 0) {
                self.fileTypeDataRow = json.result.data[0];
                self.fileTypeRequestLoaded.emit(self.fileTypeDataRow);
              }
            }

            if (tableId == "uftDashboard_releaseClaimsAction" || tableId == "uftDashboard_notificationAction" || tableId == 'uftDashboard_releaseClaimsAction_Expire') {
              for (let i in json.result.data) {
                if (json.result.data[i].coId || json.result.data[i].coName) {
                  json.result.data[i].coDesc = json.result.data[i].coId + "-" + json.result.data[i].coName;
                } else {
                  json.result.data[i].coDesc = ""
                }
              }
            }
            if (tableId == "unitFinancialTransactionList") {
              for (let i in json.result.data) {
                json.result.data[i].transactionAmt = '$' + json.result.data[i].transactionAmt
                json.result.data[i].balance = '$' + json.result.data[i].balance
              }
            }
            if (tableId == "division_max_history") {
              for (let i in json.result.data) {
                json.result.data[i].dentalInd = json.result.data[i].dentalInd != "T" ? "No" : "Yes";
                json.result.data[i].visionInd = json.result.data[i].visionInd != "T" ? "No" : "Yes";
                json.result.data[i].healthInd = json.result.data[i].healthInd != "T" ? "No" : "Yes";
                json.result.data[i].drugInd = json.result.data[i].drugInd != "T" ? "No" : "Yes";
                json.result.data[i].wellnessInd = json.result.data[i].wellnessInd != "T" ? "No" : "Yes";
              }
            }
            if (tableId == "brokerContact") {
              for (let i in json.result.data) {
                json.result.data[i].brokerCompanyMainInd = json.result.data[i].brokerCompanyMainInd != "T" ? "" : "Y";
              }
            }
            if (tableId == "company-broker") {
              for (let i in json.result.data) {
                json.result.data[i].primaryBrokerInd = json.result.data[i].primaryBrokerInd != "T" ? "" : "Y";
              }
            }
            if (tableId == "company-contact") {
              for (let i in json.result.data) {
                json.result.data[i].mainContactInd = json.result.data[i].mainContactInd != "T" ? "" : "Y";
              }
            }
           
            if (tableId == "uftDashboard_bar1") {
              self.graphData = json.result.garphCount
              self.compBalanceGraph.emit(json.result.garphCount)

              self.totalSumCount.emit(json.result.totalSumCount)
            }
            if (tableId == 'show-preAuthReview-claim-table') {
              for (let i in json.result.data) {
                json.result.data[i].released = json.result.data[i].released == "F" ? "N" : "Y";
              }
              self.totalRecords = json.recordsTotal
            }

            //...ticket 1256
            if (tableId == 'submissionTable') {
              let arrList = []
              for (let i in json.result.data) {               
                if(json.result.data[i].reviewStatusDesc == "NEW") {
                  arrList.push(json.result.data[i])
                }
              }
              json.result.data = arrList
              self.totalRecords = json.recordsTotal
            }
            if (tableId == 'consultantTable') {
              let arrListMod = []
              for (let i in json.result.data) {               
                if(json.result.data[i].reviewStatusDesc == "MODIFIED") {
                  arrListMod.push(json.result.data[i])
                }
              }
              json.result.data = arrListMod
              self.totalRecords = json.recordsTotal
            }
            //..ticket 1256

            if (tableId == 'refundPaymentSummary'
              || tableId == 'itrans-list'
              || tableId == 'fundingSummary'
              || tableId == 'fundingSummary-callIn'
              || tableId == 'bankReportSummary'
              || tableId == 'filesList'
              || tableId == 'fileListHistory'
              || tableId == 'fundingSummaryWithAction'
              || tableId == 'fundingSummaryWithRCAction'
              || tableId == 'companyBalance'
              || tableId == 'providerWithoutEFT'
              || tableId == 'getTaxPayableSummaryReport'
              || tableId == 'unpaidClaimsReport'
              || tableId == 'brokerCompanySummaryReport'
              || tableId == 'uFTReport'
              || tableId == 'summaryOfProviderDebits'
              || tableId == 'companyClosingBalances'
              || tableId == 'companyOpeningBalances'
              || tableId == 'bankOpeningBalances'
              || tableId == 'uftDashboard_bar1'
              || tableId == 'search-card-table'
              || tableId == 'brokerCompanyAssociated'
              || tableId == 'brokerContact'
              || tableId == 'companySearchCardTable'
              || tableId == 'brokerListTable'
              || tableId == 'company-contact'
              || tableId == 'company-broker'
              || tableId == 'uFTReport'
              || tableId == 'uFTReportList'
              || tableId == 'debitProviderReport'
              || tableId == 'refundPaymentSummaryReport'
              || tableId == 'claimsPaymentRunSummary'
              || tableId == 'overrideReport'
              || tableId == 'cardholderReport'
              || tableId == 'brokerCommissionSummary'
              || tableId == 'divisionUtilizationReport'
              || tableId == 'ClientAgeGroupByPostcodeAndService'
              || tableId == 'ClaimAndClainantCount'
              || tableId == 'ClaimByMonthCat'
              || tableId == 'COBSavings'
              || tableId == 'DemographicStat'
              || tableId == 'ProcedureRank'
              || tableId == 'Exception'
              || tableId == 'DentureReplacement'
              || tableId == 'ExceptionReport'
              || tableId == 'PreauthByReviewAndDASPException'
              || tableId == 'PreauthByReviewDASP'
              || tableId == 'PreauthByReviewOther'
              || tableId == 'dailyClaimProcessing'
              || tableId == 'govtClaimsVolumeReport'
              || tableId == 'quikCardClaimsVolumeReport'
              || tableId == 'dobMismatchReport'
              || tableId == 'broker0371Commission'
              || tableId == 'qBCIEligibilityAge65'
              || tableId == 'qBCIEligibilityRBC'
              || tableId == 'qBCIEligibilityTravelInsurance'
              || tableId == 'qBCITravelEligibility'
              || tableId == 'uftDashboard_dependentCardholder'
              || tableId == 'uftDashboard_primaryCardholder'
              || tableId == 'uftDashboard_totalCompany'
              || tableId == 'amountPaidReport'
              || tableId == 'unitFinancialTransactionList'
              || tableId == 'fundingReport'
              || tableId == 'claimPaymentsByCardholder'
              || tableId == 'plan-category'
              || tableId == 'plan-rule'
              || tableId == 'cardsbycompany'
              || tableId == 'brokerQsi'
              || tableId == 'amountPaidCompanyplancard'
              || tableId == 'claimpaymentbycardholder'
              || tableId == 'productionReport'
              || tableId == 'submissionStatsReport'
              || tableId == 'brokerMailingLabels'
              || tableId == 'cardholderLabels'
              || tableId == 'companyMailingLabels'
              || tableId == 'serviceProviderMailingLabels'
              || tableId == 'summaryByCompanyPlanCardAndCoverage'
              || tableId == 'productionReportList'
              || tableId == 'cardCountByCompanyList'
              || tableId == 'educationalStatusLetters'
              || tableId == 'serviceProvidersList'
              || tableId == 'batchBalanceReportList'
              || tableId == 'studentStatusList'
              || tableId == 'modifiedDASPPreauthClaimsList'
              || tableId == 'uftDashboard_notification'
              || tableId == 'amountPaidByCompanyPlanAndCoverageCategoryList'

            ) {
              self.totalRecords = json.recordsTotal
              if (self.totalRecords > 0) {
                if (tableId == 'refundPaymentSummary') {
                } else if (tableId == 'fundingSummary' || tableId == 'fundingSummary-callIn' || tableId == 'fundingSummaryWithAction') {
                  $('#' + tableId + '_disable-totals .amount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                }
                else if (tableId == 'bankReportSummary') {
                  $('#' + tableId + '_disable-totals .amount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.result.totalChequeAmt));
                } else if (tableId == 'companyBalance') {
                  $('#' + tableId + '_disable-totals .amount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                  $('#' + tableId + '_disable-totals .companyPAPAmount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum1));
                } else if (tableId == 'providerWithoutEFT') {
                  $('#' + tableId + '_disable-totals .amountHeld').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                } else if (tableId == 'getTaxPayableSummaryReport') {
                  $('#' + tableId + '_disable-totals .taxBaseAmount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                } else if (tableId == 'unpaidClaimsReport') {
                } else if (tableId == 'brokerCompanySummaryReport') {
                  $('#' + tableId + '_disable-totals .companyBalance').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                  $('#' + tableId + '_disable-totals .companyPAPAmount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum1));
                } else if (tableId == 'uFTReport') {
                } else if (tableId == 'summaryOfProviderDebits') {
                  $('#' + tableId + '_disable-totals .debitAmount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                } else if (tableId == 'companyClosingBalances') {
                  $('#' + tableId + '_disable-totals .closingBalances').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                } else if (tableId == 'companyOpeningBalances') {
                  $('#' + tableId + '_disable-totals .openingBalance').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                } else if (tableId == 'bankOpeningBalances') {
                  $('#' + tableId + '_disable-totals .openingBalance').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                }
                else if (tableId == 'uftDashboard_bar1') {
                } else if (tableId == 'search-card-table') {
                } else if (tableId == 'brokerCompanyAssociated') {
                } else if (tableId == 'brokerContact') {
                } else if (tableId == 'companySearchCardTable') {
                } else if (tableId == 'brokerListTable') {
                } else if (tableId == 'company-contact') {
                } else if (tableId == 'company-broker') {
                } else if (tableId == 'uFTReport') {
                } else if (tableId == 'uFTReportList') {
                } else if (tableId == 'debitProviderReport') {
                } else if (tableId == 'refundPaymentSummaryReport') {
                  $('#' + tableId + '_disable-totals .amount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                } else if (tableId == 'claimsPaymentRunSummary') {
                } else if (tableId == 'overrideReport') {
                  $('#' + tableId + '_disable-totals .overrideAmount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                } else if (tableId == 'cardholderReport') {
                } else if (tableId == 'brokerCommissionSummary') {
                  $('#' + tableId + '_disable-totals .amount').text(self.currentUserService.convertAmountToDecimalWithDoller(json.totalData.totalSum));
                } else if (tableId == 'divisionUtilizationReport') {
                } else if (tableId == 'ClientAgeGroupByPostcodeAndService') {
                } else if (tableId == 'ClaimAndClainantCount') {
                } else if (tableId == 'ClaimByMonthCat') {
                } else if (tableId == 'COBSavings') {
                } else if (tableId == 'DemographicStat') {
                } else if (tableId == 'ProcedureRank') {
                } else if (tableId == 'Exception') {
                } else if (tableId == 'DentureReplacement') {
                } else if (tableId == 'ExceptionReport') {
                } else if (tableId == 'PreauthByReviewAndDASPException') {
                } else if (tableId == 'PreauthByReviewDASP') {
                } else if (tableId == 'PreauthByReviewOther') {
                } else if (tableId == 'dailyClaimProcessing') {
                } else if (tableId == 'govtClaimsVolumeReport') {
                } else if (tableId == 'quikCardClaimsVolumeReport') {
                } else if (tableId == 'dobMismatchReport') {
                } else if (tableId == 'broker0371Commission') {
                } else if (tableId == 'qBCIEligibilityAge65') {
                } else if (tableId == 'qBCIEligibilityRBC') {
                } else if (tableId == 'qBCIEligibilityTravelInsurance') {
                } else if (tableId == 'qBCITravelEligibility') {
                } else if (tableId == 'uftDashboard_bar1') {
                } else if (tableId == 'uftDashboard_dependentCardholder') {
                } else if (tableId == 'uftDashboard_primaryCardholder') {
                } else if (tableId == 'uftDashboard_totalCompany') {
                } else if (tableId == 'amountPaidReport') {
                } else if (tableId == 'unitFinancialTransactionList') {
                } else if (tableId == 'fundingReport') {
                } else if (tableId == 'productionReport') {
                } else if (tableId == 'submissionStatsReport') {
                } else if (tableId == 'productionReportList') {
                } else if (tableId == 'batchBalanceReportList') {
                } else if (tableId == 'pendingElectronicAdjustmentList') {
                }
                $('#' + tableId + '_disable-totals').removeClass('disable-totals')
                $('#' + tableId + '_reportsPdfButton').removeClass('disable-export-button')
                $('#' + tableId + '_paginate').removeClass('disable-paginate')
              }
            }
            if (tableId == 'uftDashboard_notification') {
              $('#uftDashboard_notification_exportsPdfButton').removeClass('disable-export-button');
              self.totalRecords_notification = self.totalRecords
              self.emptyDataTable.emit(self.totalRecords_notification);
            }
            if (tableId == 'uftDashboard_releaseClaims') {
              $('#uftDashboard_releaseClaims_exportsPdfButton').removeClass('disable-export-button');
              self.totalRecords_releaseClaims = self.totalRecords
            }
            if (tableId == 'uftDashboard_releaseClaimsAction') {
              $('#uftDashboard_releaseClaimsAction_exportsPdfButton').removeClass('disable-export-button');
              self.totalRecords_releaseClaimsAtion = self.totalRecords
            }
            if (tableId == 'uftDashboard_claimAboutToExpire') {
              $('#uftDashboard_claimAboutToExpire_exportsPdfButton').removeClass('disable-export-button');
              self.totalRecords_claimAboutToExpire = self.totalRecords
            }
            if (tableId == 'uftDashboard_notificationAction') {
              $('#uftDashboard_notificationAction_exportsPdfButton').removeClass('disable-export-button');
              self.totalRecords_notificationAction = self.totalRecords
            }
            if (tableId == 'uftDashboard_releaseClaimsAction_Expire') {
              $('#uftDashboard_releaseClaimsAction_Expire_exportsPdfButton').removeClass('disable-export-button');
              self.totalRecords_notificationAction_Expire = self.totalRecords
            }
            if (tableId == 'reportsList') {
              $('#reportsPdfButton').removeClass('showHideReportsPdfButton')
            }
            if (tableId == 'itrans-list') {
              $('#iTransPdfButton').removeClass('showHideReportsPdfButton')
            }
            if (tableId == 'reportsList_datamangement') {
              $('#reportsPdfButton').removeClass('showHideReportsPdfButton')
            }
            if (tableId == 'upcomingTransactionsList') {
              $('#genEft').removeClass('hideGPRunButton')
              $('#' + tableId + '_paginate').removeClass('disable-paginate')
            }
            if (tableId == 'company-contact') {
              $('#company-con-TabExport').removeClass('hideGPRunButton')
            }
            if (tableId == 'company-broker' || tableId == 'companySearchCardTable') {
              // Button is common for all so changed to same Id.
              $('#company-con-TabExport').removeClass('hideGPRunButton')
            }
            if (tableId == 'brokerListTable') {
              $('#brokerSearchExport').removeClass('hideGPRunButton')
            }
            if (tableId == 'brokerCompanyAssociated' || tableId == 'brokerContact') {
              $('#brokerTabExport').removeClass('hideGPRunButton')
            }
            if (tableId == 'ListTable') {        // changes on List table cox userRoleList error
              $('#SearchExport').removeClass('hideGPRunButton');
              $('#ListTable_length').css({ "visibility": "hidden" });
              $('#ListTable_info').css({ "display": "none" });
              $('#ListTable_paginate').css({ "display": "none" });
              setTimeout(() => {
                $("#ListTable thead tr:nth-child(2) th:nth-child(1)").removeClass("sorting");
              }, 800);
            }
            if (tableId == 'negativeTransactionList' || tableId == 'receiptsList') {
              $('#negativeTransactionList_length').css({ "visibility": "hidden" });
              $('#negativeTransactionList_info').css({ "display": "none" });
              $('#negativeTransactionList_paginate').css({ "display": "none" });
              $('#receiptsList_length').css({ "visibility": "hidden" });
              $('#receiptsList_info').css({ "display": "none" });
              $('#receiptsList_paginate').css({ "display": "none" });
            }
            if (tableId == 'receiptsList') {
              $('#receiptsListExport').removeClass('hideGPRunButton')
            }
            if (tableId == 'negativeTransactionList') {
              $('#negativeTransactionListExport').removeClass('hideGPRunButton')
            }
            // Export button for Pending Electronic Payment Adjustment
            if (tableId == 'pendingElectronicAdjustmentList') {
              $('#pendingElectronicAdjPaymentExport').removeClass('hideGPRunButton')
            }
            // Export button for Termination Refund
            if (tableId == 'terminateCompanyList') {
              $('#terminationRefundsExport').removeClass('hideGPRunButton')
            }
            if (tableId == 'finalNoticeList') {
              $('#finalNoticeList_exportsPdfButton').removeClass('disable-export-button');
              self.totalRecords_FinalNoticeList = self.totalRecords
            }
            if (tableId == 'expireClaimList') {
              $('#expireClaimList_exportsPdfButton').removeClass('disable-export-button');
              self.totalRecords_expireClaimList = self.totalRecords
            } 
            // add by Mukul to resolve navigation Issue(HMS point no 536) in brokerListTable
            if (tableId == 'brokerListTable') {
              self.brokerListTableEmitter.emit(json.code)
            }
            return json.result.data;
            } else if (json.code == 404 || json.code == 400) {

            if (tableId == 'uftDashboard_notification') {
              $('#uftDashboard_notification_exportsPdfButton').addClass('disable-export-button');
              self.totalRecords_notification = 0
              self.emptyDataTable.emit(self.totalRecords_notification);
            }
            if (tableId == 'uftDashboard_releaseClaims') {
              $('#uftDashboard_releaseClaims_exportsPdfButton').addClass('disable-export-button');

              self.totalRecords_releaseClaims = 0
            }
            if (tableId == 'uftDashboard_releaseClaimsAction') {
              $('#uftDashboard_releaseClaimsAction_exportsPdfButton').addClass('disable-export-button');

              self.totalRecords_releaseClaimsAtion = 0
            }
            if (tableId == 'uftDashboard_claimAboutToExpire') {
              $('#uftDashboard_claimAboutToExpire_exportsPdfButton').addClass('disable-export-button');

              self.totalRecords_claimAboutToExpire = 0
            }
            if (tableId == 'uftDashboard_notificationAction' || tableId == 'uftDashboard_releaseClaimsAction_Expire') {
              $('#uftDashboard_notificationAction_exportsPdfButton').addClass('disable-export-button');
              // Added by mukul to resolved pdf/excel issue in Release Claims Action List in EB/OCL Claim About To Expire
              $('#uftDashboard_releaseClaimsAction_Expire_exportsPdfButton').addClass('disable-export-button');         
              self.totalRecords_notificationAction = 0
            }
            if (tableId == "studentStatusList") {
              self.errorResponse.emit(json)
            }

            self.emitAmountError.emit(json.code)
            if (tableId == "uftDashboard_bar1") {
              self.graphData = "";
              self.compBalanceGraph.emit("")
              self.totalSumCount.emit("")
              self.showGraph.emit(true) // To hide xport button when table is empty.
            }
            // add by Mukul to resolve navigation Issue(HMS point no 536) in brokerListTable
            if (tableId == 'brokerListTable') {
              self.brokerListTableEmitter.emit(json.code)
            }
            if (tableId == 'ListTable') {
              $('#SearchExport').addClass('hideGPRunButton')
            }
            $('#' + tableId + '_disable-totals').addClass('disable-totals')
            $('#' + tableId + '_reportsPdfButton').addClass('disable-export-button')
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            if (tableId == 'reportsList') {
              $('#reportsPdfButton').addClass('showHideReportsPdfButton')
            }
            if (tableId == 'reportsList_datamangement') {
              $('#reportsPdfButton').addClass('showHideReportsPdfButton')
            }

            if (tableId == 'upcomingTransactionsList') {
              $('#genEft').addClass('hideGPRunButton')
            }

            if (tableId == 'company-contact') {
              $('#company-con-TabExport').addClass('hideGPRunButton')
            }
            if (tableId == 'company-broker' || tableId == 'companySearchCardTable') {
              // Button is common for all so changed to same Id. 
              $('#company-con-TabExport').addClass('hideGPRunButton')
            }
            if (tableId == 'brokerListTable') {
              $('#brokerSearchExport').addClass('hideGPRunButton')
            }
            if (tableId == 'brokerCompanyAssociated' || tableId == 'brokerContact') {
              $('#brokerTabExport').addClass('hideGPRunButton')
            }
            if (tableId == 'show-preAuthReview-claim-table') {
              self.totalPreAuthClaimRecords = json.recordsTotal
            }
            if (tableId == 'bankReportSummary') {
              $('#' + tableId + '_disable-totals .amount').text(self.currentUserService.convertAmountToDecimalWithDoller(0));
            }
            if (tableId == 'pendingElectronicAdjustmentList') {
              $('#pendingElectronicAdjPaymentExport').addClass('hideGPRunButton')
            }
            if (tableId == 'terminateCompanyList') {
              $('#terminationRefundsExport').addClass('hideGPRunButton')
            }
            if (tableId == 'receiptsList') {
              $('#receiptsListExport').addClass('hideGPRunButton')
            }
            if (tableId == 'negativeTransactionList') {
              $('#negativeTransactionListExport').addClass('hideGPRunButton')
            }
            if (tableId == 'finalNoticeList') {
              $('#finalNoticeList_exportsPdfButton').addClass('disable-export-button');
              self.totalRecords_FinalNoticeList = 0
            }
            if (tableId == 'expireClaimList') {
              $('#expireClaimList_exportsPdfButton').addClass('disable-export-button');
              self.totalRecords_expireClaimList = 0
            } 
            return '';
          } else {
            if (tableId == 'show-preAuthReview-claim-table') {
              self.totalPreAuthClaimRecords = json.recordsTotal
            }
            if (tableId == 'negativeTransactionList' || tableId == 'receiptsList') {
              $('#' + tableId + '_paginate').addClass('disable-paginate')
            }
            return '';
          }
        },
        "error": function (jqXHR, textStatus, errorThrown) {
          $('#' + tableId + "_processing").hide();
          $("#tableId").DataTable();
          $('#' + tableId + '_info').css({ "width": "100%" })
          $('#' + tableId + '_info').html('<div style="text-align: center;" id="hideTableError" class="dataTables_empty">No data available in table</div>')
          $(".dataTables_empty").empty();
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'
  }


  // Used for download icon actions instead of url link implemented 
  jqueryDataTableForMultipleActions(tableId, url: string, pagingType, columns, pageLength: number, serverSide: boolean, processing: boolean, topDom: String, bottomDom: String, checkboxCol: number, defaultOrderBy, actionCol: String, reqParam, tableActions, tableActions1, tableActions2, actionColumn, actionColumn1, actionColumn2, dateCols = null, modalTarget, TFCheck = null, isRedirect = null, amountRight = null, sortGrid = null, notSort = null, alignRight = null, sortFirstCol = null, sortOtherCols = null, lastAction = null, CoulmnNumber = null) {
    var self = this
    self.reqParam = reqParam;
    var token = this.token;
    var finalDom = '<"top"' + topDom + '<"clear">>' + bottomDom + '<"bottom"<"clear">>'
    var defaultLang = this.translate.getDefaultLang()
    var defaultLang = this.translate.getDefaultLang()
    if (pageLength == 5) {
      pageLength = 25;
    }
    var tableElem = $('#' + tableId).DataTable({
      "language": {
        "url": "../../assets/i18n/datatable" + defaultLang + ".json",
        "zeroRecords": "No data available in table",
      },
      "pagingType": "simple_numbers",
      "processing": processing,
      "serverSide": serverSide,
      "pageLength": pageLength,
      "dom": finalDom,
      "ordering": (tableId == 'file_type_datatable') ? true : false,
      "createdRow": function (row, data, dataIndex) {
        if (tableId == 'fgpc_search_ProcedureCode') {
          var str;
          if (data['dentalProcedureUnitCount'] == 0) {
            str = ''
          } else {
            str = data['dentalProcedureUnitCount']
          }
        }
      },
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],

      columnDefs: [{
        'targets': actionColumn,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions.length; i++) {
            if (tableActions[i]['showAction'] != "F") {
              if (tableId == 'summaryList') {
                if (tableActions[i].name == "rptSummary") {
                  str = str + '<a class="' + tableActions[i]['class'] + '" href="javascript:void(0)" title="' + tableActions[i]['title'] + '" data-id = "' + data + '" ><i class="' + tableActions[i]['icon_class'] + '"></i></a>'
                }
              }
            }
          }
          return str
        }
      },
      {
        'targets': actionColumn1,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions1.length; i++) {
            if (tableActions1[i]['showAction'] != "F") {
              if (tableId == 'summaryList') {
                if (tableActions1[i].name == "errorRpt") {
                  str = str + '<a class="' + tableActions1[i]['class'] + '" href="javascript:void(0)" title="' + tableActions1[i]['title'] + '" data-id = "' + data + '" ><i class="' + tableActions1[i]['icon_class'] + '"></i></a>'
                }
              }
            }
          }
          return str
        }
      },
      {
        'targets': actionColumn2,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var str = ''
          for (var i = 0; i < tableActions2.length; i++) {
            if (tableActions2[i]['showAction'] != "F") {
              if (tableId == 'summaryList') {
                if (tableActions2[i].name == "ctrlFile") {
                  if (data != "") {
                    str = str + '<a class="' + tableActions2[i]['class'] + '" href="javascript:void(0)" title="' + tableActions2[i]['title'] + '" data-id = "' + data + '" ><i class="' + tableActions2[i]['icon_class'] + '"></i></a>'
                  }
                }
              }
            }
          }
          return str
        }
      },

      {
        'targets': dateCols,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          return self.changeDateFormatService.changeDateByMonthName(data);
        }
      },
      {
        'targets': checkboxCol,
        'searchable': false,
        'orderable': false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          var checked = ""
          if (data == "T") {
            checked = "checked"
          }
          return '<input disabled class="individual" type="checkbox" name="id[]" ' + checked + ' value="' + data + '" >';
        }
      }, {
        'targets': TFCheck,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          var checked = "No"
          if (data == "T") {
            checked = "Yes"
          }
          return checked
        }
      },
      {
        'targets': undefined,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return '<a class="btn-success red-tooltip" data-toggle="tooltip" data-placement="right" title="" data-original-title="Approve">Edit</a>';
        }
      },
      {
        'targets': amountRight,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'uftDashboard_primaryCardholder' || tableId == 'uftDashboard_dependentCardholder') {
            return data
          }
        }
      },
      {
        'targets': sortGrid,
        'searchable': false,
        'orderable': true,
        'className': (tableId == 'uftDashboard_totalCompany') ? 'amount_right_grid-padding' : 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': notSort,
        'searchable': false,
        'orderable': false,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': alignRight,
        'searchable': false,
        'orderable': (tableId == 'transaction-code-list') ? true : false,
        'className': 'amount_right_grid',
        'render': function (data, type, full, meta) {
          if (tableId == 'summaryList') {
            return data
          }
        }
      },
      {
        'targets': sortFirstCol,
        'searchable': false,
        'orderable': true,
        'className': 'dt-body-center',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      {
        'targets': sortOtherCols,
        'searchable': false,
        'orderable': true,
        'className': 'amount_right_grid-padding',
        'render': function (data, type, full, meta) {
          return data;
        }
      },
      ],
      order: defaultOrderBy,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          var tableID = $(row).closest('table').attr('id')
          if (tableID == 'search-card-table' && isRedirect != "F") {
            this.router.navigate(['/card/view', data['cardKey']])
          }
          if (tableID == 'summaryList') {
            this.filesSelectedRowData = data
          }
          self.getCompanyDetails(data);
        });
        return row;
      },
      'ajax': {
        'url': url,
        "contentType": "application/json; charset=utf-8",
        'type': 'POST',
        "dataType": "json",
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          $("#" + tableId + "_processing").show()
          self.prevReq = true
          return xhr;
        },
        "data": function (d) {
          for (let j in self.reqDateParams) {
            var indexValue = self.reqDateParams[j];
            if (self.reqParam[indexValue]['value'] != "") {
              var myDate = self.changeDateFormatService.formatDate(self.reqParam[indexValue]['value']);
              self.reqParam[indexValue]['value'] = myDate;
            }
          }
          // Date-Format used for Searching
          for (var i = 0; i < self.reqParam.length; i++) {
            d[self.reqParam[i]['key']] = self.reqParam[i]['value']
          }
          return JSON.stringify(d);
        },
        "dataSrc": function (json) {
          var tfoot = $("#" + tableId + " tfoot tr")
          $("#" + tableId + " thead").prepend(tfoot)
          if (json.code == 200) {
            $('#' + tableId + '_paginate').removeClass('disable-paginate')
            if (tableId == "division_max_history") {
              for (let i in json.result.data) {
                json.result.data[i].dentalInd = json.result.data[i].dentalInd != "T" ? "No" : "Yes";
                json.result.data[i].visionInd = json.result.data[i].visionInd != "T" ? "No" : "Yes";
                json.result.data[i].healthInd = json.result.data[i].healthInd != "T" ? "No" : "Yes";
                json.result.data[i].drugInd = json.result.data[i].drugInd != "T" ? "No" : "Yes";
                json.result.data[i].wellnessInd = json.result.data[i].wellnessInd != "T" ? "No" : "Yes";
              }
            }
            return json.result.data;
          }
          else if (json.code == 404) {
            $('#' + tableId + '_paginate').addClass('disable-paginate')
            return '';
          } else {
            return '';
          }
        },
        'beforeSend': function (request) {
          request.setRequestHeader("authorization", token);
          request.setRequestHeader("Content-Type", "application/json");
        },
      },
      "columns": columns
    });
    $.fn.dataTable.ext.errMode = 'throw'

  }

  Export2Doc(element, filename = '') {
    var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    var postHtml = "</body></html>";
    var html = preHtml + document.getElementById(element).innerHTML + postHtml;

    var blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });

    // Specify link url
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

    // Specify file name
    filename = filename ? filename + '.doc' : 'document.doc';

    // Create download link element
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // Create a link to the file
      downloadLink.href = url;

      // Setting the file name
      downloadLink.download = filename;

      //triggering the function
      downloadLink.click();
    }

    document.body.removeChild(downloadLink);
  }

  // Get Discipline Key
  getDisciplineKey(discipline) {
    if (discipline) {
      switch (discipline.toString()) {
        case 'All':
          return 0
        case 'Dental':
          return 1
        case 'Vision':
          return 2
        case 'Health':
          return 3
        case 'Drug':
          return 4
        case 'Supplemental':
          return 5
        case 'Wellness':
          return 6
      }
    }
  }

  // Log #1226 Below method added to clear the table body when clear button pressed 
  clearResultsTable(){
    $("tbody").empty();
  }
}
