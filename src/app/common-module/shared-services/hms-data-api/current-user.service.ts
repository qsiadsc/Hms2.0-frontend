import { Injectable, EventEmitter } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CardServiceService } from '../../../card-module/card-service.service'
import { CommonApi } from '../../common-api';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Constants } from '../../../common-module/Constants';
import { ToastrService } from 'ngx-toastr';
import { operators } from 'rxjs';
import { debug } from 'util';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CookieService } from 'ngx-cookie-service/cookie-service/cookie.service';

@Injectable()
export class CurrentUserService {
  loginText = '';
  buttonText = '';
  disabledItem: boolean = false;
  allAppMenu: any = [];
  userTypeArray = [];
  appHeaderRoleMenu = [];
  appMenuHeader: any;
  appMenu: any = [];
  operatorHeader1: { 'menuName': string; 'menuKey': string; 'subMenu': { 'title': string; 'id': string; 'routerLinkActive': boolean; 'routerLink': string; 'menuShortDesc': string; 'menuAccess': boolean; 'isAdmin': boolean; 'children': ({ 'title': string; 'id': string; 'routerLinkActive': boolean; 'actionAccess': boolean; 'routerLink': string; 'menuShortDesc': string; key?: undefined; 'DBkey': number; } | { 'title': string; 'id': string; 'routerLinkActive': boolean; 'actionAccess': boolean; 'routerLink': string; 'key': number; 'DBkey': number; 'menuShortDesc': string; })[]; 'key': number; }[]; }[];
  apiResponse: Observable<any>;
  authResponse: Observable<any>;
  authmenuResponse: any;
  authmenuRoleResponse: any;
  authmenuOTP: any;
  languages
  access_token: string
  getUpdateHeader = new EventEmitter();
  // Below 2 for loader in review claim section.
  showLoading = new EventEmitter();
  claimsClick = new EventEmitter();
  roleKey
  token: string = "bearer " + localStorage.getItem('currentUser'); // LoggedIn User Token
  loginToken: string = 'cXVpa2NhcmQ6dmljdG9yeQ=='; //Login Token
  showLoader: boolean = false
  selectedCompanyUploadDocRowData
  minLengthForExcel = 500;
  maxLengthForExcel = 50000;
  defaultRecordsGrid = 25;
  otpStatus = 'F';
  isAdscDashboard: boolean = false
  dashboardType = new EventEmitter()
  dashboardTypeQuikcard: boolean = false
  dashboardTypeAdsc: boolean = false
  menuByRoles = [
    {
      'menuName': 'HMS',
      'menuKey': '1',
      'subMenu': [
        {
          'title': 'Setup',
          'id': '',
          'routerLinkActive': true,
          'routerLink': '',
          'menuShortDesc': "",
          'deleteChildren': false,
          'menuAccess': false,
          'isAdmin': true,
          'children': [
            {
              'title': 'Search User',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/users/searchUsers',
              'key': 15,
              'menuShortDesc': "SUR",
              'DBkey': 15,
            },
            {
              'title': 'Search Role',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/users/roles',
              'key': 15,
              'menuShortDesc': "SRL",
              'DBkey': 15,
            },
            {
              'title': 'Transaction Code',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/finance/transaction',
              'key': 15,
              'menuShortDesc': "TXC",
              'DBkey': 15,
            },
            {
              'title': 'Tax Rate',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/finance/taxRates',
              'key': 15,
              'menuShortDesc': "TXR",
              'DBkey': 15,
            },
            {
              'title': 'Admin Rate',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/admin/adminRate',
              'key': 15,
              'menuShortDesc': "ART",
              'DBkey': 15,
            },
            {
              'title': 'Originator',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/finance/originator',
              'key': 15,
              'menuShortDesc': "ORG",
              'DBkey': 15,
            }
          ],
          'key': 1
        },
        {
          'title': 'Dashboard',
          'id': '',
          'routerLinkActive': true,
          'menuAccess': false,
          'deleteChildren': true,
          'isAdmin': true,
          'children': [
            {
              'title': 'Claim Dashboard',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '/claimDashboard',
              'key': 169,
              'DBkey': 169,
              'menuShortDesc': "DBC",
              'isDelete': false,

            },
            {
              'title': 'Finance Dashboard',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '/unitFinancialTransaction/dashboard',
              'key': 142,
              'DBkey': 142,
              'menuShortDesc': "UFD",
              'isDelete': false,
            },
            {
              'title': 'Data Management Dashboard',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '/dataManagement',
              'key': 170,
              'DBkey': 170,
              'menuShortDesc': "DDM",
              'isDelete': false,
            }
          ],
          'routerLink': '/claimDashboard',
          'key': 2,
          'menuShortDesc': "DBD"
        },
        {
          'title': 'Claims',
          'id': 'item6',
          'routerLinkActive': true,
          'deleteChildren': false,
          'routerLink': '',
          'menuAccess': false,
          'isAdmin': true,
          'menuShortDesc': "SCL",
          'children': [
            {
              'title': 'Search Claim',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/claim/searchClaim',
              'key': 16,
              'menuShortDesc': "SCL",
              'DBkey': 16,
            },
            {
              'title': 'Add New Claim',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/claim',
              'key': 17,
              'menuShortDesc': "NCL",
              'DBkey': 16,
            }
          ],
          'key': 2
        },
        {
          'title': 'Cardholder',
          'id': 'item4',
          'routerLinkActive': true,
          'deleteChildren': false,
          'routerLink': '',
          'menuShortDesc': "SCH",
          'menuAccess': false,
          'isAdmin': true,
          'children': [
            {
              'title': 'Search Cardholder',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/card/searchCard',
              'key': 14,
              'menuShortDesc': "SCH",
              'DBkey': 14,
            },
            {
              'title': 'Add New Card',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/card',
              'key': 15,
              'menuShortDesc': "ANC",
              'DBkey': 14,
            }
          ],
          'key': 3
        },
        {
          'title': 'Company',
          'id': 'item6',
          'routerLinkActive': true,
          'deleteChildren': false,
          'routerLink': '',
          'menuShortDesc': "CO",
          'menuAccess': false,
          'isAdmin': true,
          'children': [
            {
              'title': 'Search Company',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/company',
              'key': 16,
              'menuShortDesc': "SCO",
              'DBkey': 14,
            },
            {
              'title': 'Add Company',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/company/add',
              'key': 25,
              'menuShortDesc': "ACO",
              'DBkey': 14,
            }
          ],
          'key': 4
        },
        {
          'title': 'Broker',
          'id': '',
          'routerLinkActive': true,
          'routerLink': '',
          'menuShortDesc': "SBR",
          'deleteChildren': false,
          'menuAccess': false,
          'isAdmin': true,
          'children': [
            {
              'title': 'Search Broker',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/company/broker',
              'key': 17,
              'menuShortDesc': "SBR",
              'DBkey': 14,
            },
            {
              'title': 'Add Broker',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/company/broker/add',
              'key': 39,
              'menuShortDesc': "ABR",
              'DBkey': 14,
            }
          ],
          'key': 4
        },
        {
          'title': 'Service Provider',
          'id': 'item6',
          'routerLinkActive': true,
          'deleteChildren': false,
          'routerLink': '',
          'menuAccess': false,
          'menuShortDesc': "SPR",
          'isAdmin': true,
          'children': [
            {
              'title': 'Search Service Provider',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/serviceProvider/search',
              'key': 16,
              'menuShortDesc': "SPP",
              'DBkey': 14,
            },
            {
              'title': 'Add New Service Provider',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/serviceProvider',
              'key': 17,
              'menuShortDesc': "SPP166",
              'DBkey': 14,
            },
            {
              'title': 'Search BAN',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/serviceProvider/searchBan',
              'key': 17,
              'menuShortDesc': "SBN",
              'DBkey': 14,
            }
          ],
          'key': 5
        },
        {
          'title': 'Rules',
          'id': 'item6',
          'routerLinkActive': true,
          'routerLink': '',
          'menuAccess': false,
          'menuShortDesc': "RLS",
          'deleteChildren': false,
          'isAdmin': true,
          'children': [
            {
              'title': 'Dental',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/rules/1',
              'key': 16,
              'menuShortDesc': "DTL",
              'DBkey': 14,
            },
            {
              'title': 'Vision',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/rules/2',
              'key': 17,
              'menuShortDesc': "VIS",
              'DBkey': 14,
            },
            {
              'title': 'Health',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/rules/3',
              'key': 17,
              'menuShortDesc': "HLT",
              'DBkey': 14,
            },
            {
              'title': 'Drug',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/rules/4',
              'key': 17,
              'menuShortDesc': "DRG",
              'DBkey': 14,
            }
          ],
          'key': 6
        },
        {
          'title': 'Fee Guide',
          'id': 'item6',
          'routerLinkActive': true,
          'routerLink': '',
          'menuAccess': false,
          'menuShortDesc': "FGU",
          'deleteChildren': false,
          'isAdmin': true,
          'children': [
            
            {
              'title': 'Dental Procedure Code',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/procedureCode',
              'key': 16,
              'menuShortDesc': "PCL",
              'DBkey': 14,
            },
            {
              'title': 'Dental Fee Guide',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide',
              'key': 17,
              'menuShortDesc': "PSF",
              'DBkey': 14,
            },
            {
              'title': 'Dental Service',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/dentalService',
              'key': 17,
              'menuShortDesc': "SRV",
              'DBkey': 14,
            },
            {
              'title': 'Dental Schedule',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/dentalSchedule',
              'key': 17,
              'menuShortDesc': "DSH",
              'DBkey': 14,
            },
            {
              'title': 'Vision Procedure Code',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/visionProcedureCode',
              'key': 17,
              'menuShortDesc': "VPC",
              'DBkey': 14,
            },
            {
              'title': 'Vision Service',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/visionService',
              'key': 17,
              'menuShortDesc': "VSR",
              'DBkey': 14,
            },
            {
              'title': 'Health Procedure Code',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/healthProcedureCode',
              'key': 17,
              'menuShortDesc': "HPC",
              'DBkey': 14,
            },
            {
              'title': 'Health Service',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/healthService',
              'key': 17,
              'menuShortDesc': "HSR",
              'DBkey': 14,
            },
            {
              'title': 'HSA Procedure Code',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/hsaProcedureCode',
              'key': 17,
              'menuShortDesc': "HSP",
              'DBkey': 14,
            },
            {
              'title': 'HSA Service',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/hsaService',
              'key': 17,
              'menuShortDesc': "HSS",
              'DBkey': 14,
            },
            {
              'title': 'Wellness Procedure Code',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/wellnessProcedureCode',
              'key': 17,
              'menuShortDesc': "WPC",
              'DBkey': 14,
            },
            {
              'title': 'Wellness Service',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/wellnessService',
              'key': 17,
              'menuShortDesc': "WSR",
              'DBkey': 14,
            },
            {
              'title': 'USCLS Fee Guide',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/usclsFeeGuide',
              'key': 14,
              'menuShortDesc': "UFG",
              'DBkey': 14,
            },
            {
              'title': 'Add Service/Proc Code',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/feeGuide/uscls',
              'key': 16,
              'menuShortDesc': "PCL",
              'DBkey': 14,
            }
          ],
          'key': 7
        },
        {
          'title': 'Financial Payable',
          'id': '',
          'routerLinkActive': true,
          'menuAccess': false,
          'menuShortDesc': "SPT",
          'deleteChildren': false,
          'isAdmin': true,
          'children': [
            {
              'title': 'Search Transaction',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/finance/transaction-search',
              'key': 17,
              'menuShortDesc': "SPT",
              'DBkey': 14,
            },
            {
              'title': 'Search UFT',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/unitFinancialTransaction',
              'key': 18,
              'menuShortDesc': "SFT",
              'DBkey': 14,
            },
            {
              'title': 'Search Payment',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/finance/payment-search',
              'key': 19,
              'menuShortDesc': "SPT", // need to use SAP
              'DBkey': 14,
            }
          ],
          'routerLink': '',
          'key': 9,
        },
        {
          'title': 'Reports',
          'id': '',
          'routerLinkActive': true,
          'menuAccess': false,
          'deleteChildren': true,
          'isAdmin': true,
          'children': [],
          'routerLink': '/reports',
          'key': 10,
          'menuShortDesc': "RPL"
        },
        {
          'title': 'iTrans Viewer',
          'id': '',
          'routerLinkActive': true,
          'menuAccess': false,
          'isAdmin': true,
          'deleteChildren': true,
          'children': [],
          'routerLink': '/iTransViewer',
          'key': 11,
          'menuShortDesc': "ITV"
        },
        {
          'title': 'Files',
          'id': '',
          'routerLinkActive': true,
          'menuAccess': false,
          'deleteChildren': true,
          'isAdmin': true,
          'children': [
            {
              'title': 'Files',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "FLL",
              'isDelete': false,
              'DBkey': 14,
            }
          ],
          'routerLink': '/files',
          'key': 13,
          'menuShortDesc': "FLL"
        },
        // Domain Security checks 
        {
          'title': 'Domain',
          'id': '',
          'routerLinkActive': true,
          'menuAccess': false,
          'isAdmin': true,
          'deleteChildren': true,
          'children': [],
          'routerLink': '/domain',
          'key': 14,
          'menuShortDesc': "DON"
        },

        //Added by Ashwani 
        {
          'title': 'Data',
          'id': '',
          'routerLinkActive': true,
          'menuAccess': false,
          'isAdmin': true,
          'deleteChildren': false,
          'children': [
            {
              'title': 'QSI Loader Report',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/qsi-loader-report',
              'key': 17,
              'menuShortDesc': "DTA",
              'isDelete': false,
              'DBkey': 14,
            }
          ],
          'routerLink': '',
          'key': 15,
          'menuShortDesc': "DTA"
        },
        {
          'title': 'Amendment',
          'id': 'item6',
          'routerLinkActive': true,
          'deleteChildren': false,
          'routerLink': '',
          'menuAccess': false,
          'isAdmin': true,
          'menuShortDesc': "AMN",
          'children': [
            {
              'title': 'Amendments',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/company/plan/amendment',
              'key': 16,
              'menuShortDesc': "AMN",
              'DBkey': 16,
            }
          ],
          'key': 82
        }
      ]
    },
    {
      'menuName': 'AHC',
      'menuKey': '4',
      'subMenu': [
        {
          'title': 'Dashboard',
          'id': '',
          'routerLinkActive': true,
          'menuAccess': false,
          'deleteChildren': true,
          'children': [
            {
              'title': 'Claims Entered By',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "ACE",
              'isDelete': false,
              'DBkey': 14,
            },
            {
              'title': 'Claims Reassessed',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "ACR",
              'isDelete': false,
              'DBkey': 14,
            },
          ],
          'isAdmin': false,
          'routerLink': '/dataEntry/dashboard',
          'key': 1,
          'menuShortDesc': "AHD"
        }, {
          'title': 'Claims',
          'id': 'item6',
          'routerLinkActive': true,
          'routerLink': '',
          'menuAccess': false,
          'deleteChildren': false,
          'isAdmin': false,
          'menuShortDesc': "CLM",
          'children': [
            {
              'title': 'Add Claim to Batch',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/dataEntry/claims',
              'key': 16,
              'menuShortDesc': "CLB",
              'DBkey': 14,
            },
            {
              'title': 'Search',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/dataEntry/search/claim',
              'key': 17,
              'menuShortDesc': "SBC",
              'DBkey': 14,
            }
          ],
          'key': 2
        },
        {
          'title': 'Provider',
          'id': 'item6',
          'routerLinkActive': true,
          'routerLink': '',
          'deleteChildren': false,
          'menuAccess': false,
          'isAdmin': false,
          'menuShortDesc': "PRO",
          'children': [
            {
              'title': 'Add Provider',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/dataEntry/dentist',
              'key': 16,
              'menuShortDesc': "APR",
              'DBkey': 14,
            },
            {
              'title': 'Search',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/dataEntry/provider-search',
              'key': 17,
              'menuShortDesc': "DPR",
              'DBkey': 14,
            }
          ],
          'key': 3
        },
        {
          'title': 'Batch',
          'id': 'item6',
          'routerLinkActive': true,
          'routerLink': '',
          'menuAccess': false,
          'deleteChildren': false,
          'isAdmin': false,
          'menuShortDesc': "BTH",
          'children': [
            {
              'title': 'Search',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/dataEntry/search/batch',
              'key': 16,
              'menuShortDesc': "SBT",
              'DBkey': 14,
            },
            {
              'title': 'Submit',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "SUB",
              'DBkey': 14,
            }
          ],
          'key': 4
        },
        {
          'title': 'Import',
          'id': 'item6',
          'routerLinkActive': true,
          'routerLink': '',
          'deleteChildren': false,
          'menuAccess': false,
          'isAdmin': false,
          'menuShortDesc': "IMP",
          'children': [
            {
              'title': 'Payment Details',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/dataEntry/paymentDetails',
              'key': 16,
              'menuShortDesc': "PTD",
              'DBkey': 14,
            },
            {
              'title': 'Batch Balance',
              'id': '',
              'routerLinkActive': true,
              'actionAccess': false,
              'routerLink': '/dataEntry/batchBalanceReport',
              'key': 17,
              'menuShortDesc': "BTB",
              'DBkey': 14,
            }
          ],
          'key': 5
        },
        {
          'title': 'Account',
          'id': 'item6',
          'routerLinkActive': true,
          'menuAccess': false,
          'deleteChildren': true,
          'routerLink': '/dataEntry/account',
          'menuShortDesc': "ACB",
          'isAdmin': false,
          'children': [],
          'key': 6
        },
        {
          'title': 'Reports',
          'id': 'item7',
          'routerLinkActive': true,
          'menuAccess': false,
          'deleteChildren': true,
          'routerLink': '/dataEntry/reports',
          'menuShortDesc': "REP",
          'isAdmin': false,
          'children': [],
          'key': 7
        },
      ]
    },
    {
      'menuName': 'Reviewer',
      'menuKey': '3',
      'subMenu': [
        {
          'title': 'Dashboard',
          'id': 'item6',
          'routerLinkActive': true,
          'menuAccess': false,
          'routerLink': '/reviewer',
          'menuShortDesc': "RAD",
          'isAdmin': false,
          'deleteChildren': true,
          'children': [
            {
              'title': 'Search Transaction',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "RCR",
              'DBkey': 14,
            }
          ],
          'key': 19
        },
        {
          'title': 'Claims',
          'id': 'item6',
          'routerLinkActive': true,
          'menuAccess': false,
          'routerLink': '/reviewer/searchClaim',
          'menuShortDesc': "RCL",
          'isAdmin': false,
          'deleteChildren': true,
          'children': [
            {
              'title': 'Search Transaction',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "CSR",
              'DBkey': 14,
            }
          ],
          'key': 20
        },
        {
          'title': 'Reporting',
          'id': 'item6',
          'routerLinkActive': true,
          'menuAccess': false,
          'routerLink': '',
          'menuShortDesc': "RAP",
          'isAdmin': false,
          'deleteChildren': true,
          'children': [
            {
              'title': 'Search Transaction',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "",
              'DBkey': 14,
            }
          ],
          'key': 21
        },
        {
          'title': 'Account',
          'id': 'item6',
          'routerLinkActive': true,
          'menuAccess': false,
          'routerLink': '',
          'menuShortDesc': "ACT",
          'deleteChildren': true,
          'isAdmin': false,
          'children': [],
          'key': 22
        },
      ]
    },

    {
      'menuName': 'Doctor',
      'menuKey': '2',
      'subMenu': [
        {
          'title': 'Dashboard',
          'id': 'item6',
          'routerLinkActive': true,
          'menuAccess': false,
          'routerLink': '/reviewer',
          'menuShortDesc': "DAD",
          'isAdmin': false,
          'deleteChildren': true,
          'children': [
            {
              'title': 'Search Transaction',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "DCR",
              'DBkey': 14,
            }
          ],
          'key': 19
        },
        {
          'title': 'Claims',
          'id': 'item6',
          'routerLinkActive': true,
          'deleteChildren': true,
          'menuAccess': false,
          'routerLink': '/reviewer/searchClaim',
          'menuShortDesc': "DCL",
          'isAdmin': false,
          'children': [
            {
              'title': 'Claims',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "DSC",
              'DBkey': 14,
            },
            {
              'title': 'Doctor App Claim View',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "DCV",
              'DBkey': 14,
            }
          ],
          'key': 20
        },
      ]
    },
    {
      'menuName': 'ReferReviewer',
      'menuKey': '5',
      'subMenu':[
        {
          'title': 'Dashboard',
          'id': 'item7',
          'routerLinkActive': true,
          'menuAccess': true,
          'routerLink': '/referToReview',
          'menuShortDesc': "RRD",
          'isAdmin': false,
          'deleteChildren': true,
          'children': [
            {
              'title': 'Search Transaction',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
              'menuShortDesc': "NCR",
              'DBkey': 14,
            }
          ],
          'key': 23
        },
        //Added By Er. Arundeep Randev 
        {
          'title': 'Claims',
          'id': 'item7',
          'routerLinkActive': true,
          'deleteChildren': true,
          'menuAccess': false,
          'routerLink': '/reviewer/searchClaim/RR',
          'menuShortDesc': "RRC",
          'isAdmin': false,
          'children': [
            {
              'title': 'Claims',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
             'menuShortDesc': "RSC",
              'DBkey': 14,
            },
            {
              'title': 'Refer Review Claim View',
              'id': '',
              'routerLinkActive': false,
              'actionAccess': false,
              'routerLink': '',
              'key': 17,
             'menuShortDesc': "RCV",
              'DBkey': 14,
            }       
          ],
          'key': 24
        },      
      ]  
    }, 
  ]

  operatorHeader
  applicationRoleKey
  authChecks = []
  redirectURL: any;
  roleLabel: string;
  userType: any;
  isBrokerSearch: boolean = false;
  isCompanySearch: boolean = false;
  isReviewBack: boolean = false;
  showReviewBackButton: boolean = false;
  currentUser: any;
  isSuperAdmin;
  brokerSelectedRowData: any;
  companyBalanceSelectedRowData: any;
  companySelectedRowData: any;
  cardSelectedRowData: any;
  userBusinnesType: any;
  userVal: any;
  businessTypeList: any;
  bothAcessdefaultBussinesType: any;
  businesTypeApi: any;
  userRoleApi: Observable<any>;
  updatePage: boolean = false;
  loggedInUserVal = new EventEmitter();
  newTabRouterLink: any;
  public transactionQueryParams
  ObservableClaimObj: any;

  constructor(
    private cardServiceService: CardServiceService,
    private http: HttpClient,
    private router: Router,
    private toastrService: ToastrService

  ) {
    cardServiceService.emptyAccessToken.subscribe((value) => {
      if (value) {
        this.access_token = ''
      }
    })
    if (performance.navigation.type == 1) {
    } else {
    }
  }

  updateToken() {
    this.token = "bearer " + localStorage.getItem('currentUser');
    this.roleLabel = localStorage.getItem('roleLabel');
    // this.applicationRoleKey = localStorage.getItem('applicationRoleKey');
    if (this.applicationRoleKey == '' || this.applicationRoleKey == undefined || this.applicationRoleKey == null) {
      if (this.router.url.includes('referToReview')) {
        this.applicationRoleKey = 5
      } else if (this.router.url.includes('reviewer')) {
        if (this.router.url.includes('RR')) {
          this.applicationRoleKey = 5
        } else {
          this.applicationRoleKey = 2
        }
      } else if (this.router.url.includes('dataEntry')) {
        this.applicationRoleKey = 4
      } else {
        this.applicationRoleKey = 1
      }
    } else {
      this.applicationRoleKey = this.applicationRoleKey
    }
  }

  /**
   * 
   * @param benifitObject 
   * @param arrayValue 
   */
  searchValueInArrayReturn(benifitObject, arrayValue) {
    return benifitObject.findIndex(x => x.menuShortDesc === arrayValue);
  }

  getUserAuthorization() {

    this.appHeaderRoleMenu = []
    this.updateToken()
    this.getUserRoleId().then(val => {
      let reqParam = {
        "userKey": this.currentUser.userId
      }
      this.authmenuOTP = this.http.post(CommonApi.getOtpEmailStatusUrl, reqParam, { headers: { 'content-type': 'application/json', "Authorization": this.token } })
        .map(response => response)
        .catch((e: any) => Observable.throw(console.log("error")));
      this.authmenuOTP.subscribe(async data => {
        if (data.code == 200 && data.status === "OK") {
          this.otpStatus = data.result.otpStatusInd;
        }
      });
    })
    let promise = new Promise((resolve, reject) => {
      let userType = JSON.parse(localStorage.getItem('type'))
      let userTypeArray = []
      userType.forEach(element => {
        userTypeArray.push(element.userTypeKey);
      });
      let submitData = {
        "userTypeKeyList": userTypeArray
      }

      var getOtpEmailStatusUrl = CommonApi.getOtpEmailStatusUrl;
      if (this.allAppMenu.length == 0) {
        this.authmenuRoleResponse = this.http.post(CommonApi.getMenuActionsByRoleKey, JSON.stringify(submitData), { headers: { 'content-type': 'application/json', "Authorization": this.token } }).map(response => response).catch((e: any) => Observable.throw(console.log("error")));
        this.authmenuRoleResponse.subscribe(async data => {
          if (data.code == 200 && data.status === "OK") {

            let menuData = this.allAppMenu = data.result
            this.getAllHmsAppMenu().then(res => {
              if (this.currentUser.isAdmin == 'T') {
                for (k = 0; k < this.appMenu.length; k++) {
                  this.pushToArray(this.appHeaderRoleMenu, this.appMenu[k]);
                }
              } else {
                for (k = 0; k < this.appMenu.length; k++) {
                  let appMenuHeader = menuData.filter(val => (val.hmsApplicationKey == this.appMenu[k].hmsAppKey && val.menuAccess == 'T'));
                  if (appMenuHeader.length > 0) {
                    this.pushToArray(this.appHeaderRoleMenu, this.appMenu[k])
                  }
                }
              }
              if (+this.applicationRoleKey > 0) {
                this.operatorHeader1 = this.menuByRoles.filter(val => val.menuKey == this.applicationRoleKey);
                this.operatorHeader = this.operatorHeader1[0].subMenu
                for (var i = 0; i < menuData.length; i++) {
                  this.authChecks[menuData[i].menuShortDesc] = menuData[i].actions
                }
                if (this.currentUser.isAdmin == 'T') {
                  for (var j = 0; j < this.operatorHeader.length; j++) {
                    if (this.operatorHeader[j].children.length > 0) {
                      for (var k = 0; k < this.operatorHeader[j].children.length; k++) {
                        this.operatorHeader[j].children[k]['actionAccess'] = true
                        if ((this.operatorHeader[j].children[k]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                          this.operatorHeader[j].children[k]['title'] = 'Search Client'
                        } else if (this.operatorHeader[j].children[k]['menuShortDesc'] == 'SCH') {
                          this.operatorHeader[j].children[k]['title'] = 'Search Cardholder'
                        }
                      }
                    }
                    this.operatorHeader[j]['menuAccess'] = true
                    if ((this.operatorHeader[j]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                      this.operatorHeader[j]['title'] = 'Clients'
                    } else if ((this.operatorHeader[j]['menuShortDesc'] == 'SCH')) {
                      this.operatorHeader[j]['title'] = 'Cardholder'
                    }
                  }
                } else {                  
                  if (this.operatorHeader.length > 0) {
                    for (var j = 0; j < this.operatorHeader.length; j++) {
                      if (this.operatorHeader[j].children.length > 0) {
                        let checkChild = 0;
                        for (var k = 0; k < this.operatorHeader[j].children.length; k++) {
                          if (this.operatorHeader[j].children[k]['menuShortDesc'] != '') {
                            let menuIndexKey = this.searchValueInArrayReturn(menuData, this.operatorHeader[j].children[k]['menuShortDesc']);
                            
                            if (menuIndexKey >= 0) {
                              if (menuData[menuIndexKey].menuAccess === "T") {
                                this.operatorHeader[j].children[k]['actionAccess'] = true;
                                if ((this.operatorHeader[j].children[k]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                                  this.operatorHeader[j].children[k]['title'] = 'Search Client'
                                } else if (this.operatorHeader[j].children[k]['menuShortDesc'] == 'SCH') {
                                  this.operatorHeader[j].children[k]['title'] = 'Search Cardholder'
                                }
                                checkChild++;
                              }
                            }
                          }
                        }
                        if (checkChild > 0) {
                          this.operatorHeader[j]['menuAccess'] = true;
                          if ((this.operatorHeader[j]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                            this.operatorHeader[j]['title'] = 'Clients'
                          } else if (this.operatorHeader[j]['menuShortDesc'] == 'SCH') {
                            this.operatorHeader[j]['title'] = 'Cardholder'
                          }
                        } else {
                          this.operatorHeader[j]['menuAccess'] = false;
                        }
                      } else {
                        //FindIndex 
                        if (this.operatorHeader[j]['menuShortDesc'] != '') {
                          let menuIndexKey = this.searchValueInArrayReturn(menuData, this.operatorHeader[j]['menuShortDesc']);
                          if (menuIndexKey >= 0) {
                            if (menuData[menuIndexKey].menuAccess === "T") {
                              this.operatorHeader[j]['menuAccess'] = true;
                              if ((this.operatorHeader[j]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                                this.operatorHeader[j]['title'] = 'Clients'
                              } else if (this.operatorHeader[j]['menuShortDesc'] == 'SCH') {
                                this.operatorHeader[j]['title'] = 'Cardholder'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              resolve();
              return this.authChecks, this.operatorHeader, this.redirectURL
            })
          } else {
            resolve();
            return this.authChecks = [], this.operatorHeader = [], this.redirectURL = []
          }
        })
      } else {
        let menuData = this.allAppMenu;
        this.getAllHmsAppMenu().then(res => {
          if (this.currentUser.isAdmin == 'T') {
            for (k = 0; k < this.appMenu.length; k++) {
              this.pushToArray(this.appHeaderRoleMenu, this.appMenu[k]);
            }
          } else {
            for (k = 0; k < this.appMenu.length; k++) {
              let appMenuHeader = menuData.filter(val => (val.hmsApplicationKey == this.appMenu[k].hmsAppKey && val.menuAccess == 'T'));
              if (appMenuHeader.length > 0) {
                this.pushToArray(this.appHeaderRoleMenu, this.appMenu[k])
              }
            }
          }
          if (+this.applicationRoleKey > 0) {
            this.operatorHeader1 = this.menuByRoles.filter(val => val.menuKey == this.applicationRoleKey);
            this.operatorHeader = this.operatorHeader1[0].subMenu
            for (var i = 0; i < menuData.length; i++) {
              this.authChecks[menuData[i].menuShortDesc] = menuData[i].actions
            }
            if (this.currentUser.isAdmin == 'T') {
              for (var j = 0; j < this.operatorHeader.length; j++) {
                if (this.operatorHeader[j].children.length > 0) {
                  for (var k = 0; k < this.operatorHeader[j].children.length; k++) {
                    this.operatorHeader[j].children[k]['actionAccess'] = true
                    if ((this.operatorHeader[j].children[k]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                      this.operatorHeader[j].children[k]['title'] = 'Search Client'
                    } else if (this.operatorHeader[j].children[k]['menuShortDesc'] == 'SCH') {
                      this.operatorHeader[j].children[k]['title'] = 'Search Cardholder'
                    }
                  }
                }
                this.operatorHeader[j]['menuAccess'] = true
                if ((this.operatorHeader[j]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                  this.operatorHeader[j]['title'] = 'Clients'
                } else if ((this.operatorHeader[j]['menuShortDesc'] == 'SCH')) {
                  this.operatorHeader[j]['title'] = 'Cardholder'
                }
              }
            } else {
              if (this.operatorHeader.length > 0) {
                for (var j = 0; j < this.operatorHeader.length; j++) {
                  if (this.operatorHeader[j].children.length > 0) {
                    let checkChild = 0;
                    for (var k = 0; k < this.operatorHeader[j].children.length; k++) {
                      if (this.operatorHeader[j].children[k]['menuShortDesc'] != '') {
                        let menuIndexKey = this.searchValueInArrayReturn(menuData, this.operatorHeader[j].children[k]['menuShortDesc']);
                        if (menuIndexKey >= 0) {
                          if (menuData[menuIndexKey].menuAccess === "T") {
                            this.operatorHeader[j].children[k]['actionAccess'] = true;
                            if ((this.operatorHeader[j].children[k]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                              this.operatorHeader[j].children[k]['title'] = 'Search Client'
                            } else if (this.operatorHeader[j].children[k]['menuShortDesc'] == 'SCH') {
                              this.operatorHeader[j].children[k]['title'] = 'Search Cardholder'
                            }
                            checkChild++;
                          }
                        }
                      }
                    }
                    if (checkChild > 0) {
                      this.operatorHeader[j]['menuAccess'] = true;
                      if ((this.operatorHeader[j]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                        this.operatorHeader[j]['title'] = 'Clients'
                      } else if (this.operatorHeader[j]['menuShortDesc'] == 'SCH') {
                        this.operatorHeader[j]['title'] = 'Cardholder'
                      }
                    } else {
                      this.operatorHeader[j]['menuAccess'] = false;
                    }
                  } else {
                    //FindIndex 
                    if (this.operatorHeader[j]['menuShortDesc'] != '') {
                      let menuIndexKey = this.searchValueInArrayReturn(menuData, this.operatorHeader[j]['menuShortDesc']);
                      if (menuIndexKey >= 0) {
                        if (menuData[menuIndexKey].menuAccess === "T") {
                          this.operatorHeader[j]['menuAccess'] = true;
                          if ((this.operatorHeader[j]['menuShortDesc'] == 'SCH') && (this.currentUser.businessType.isAlberta)) {
                            this.operatorHeader[j]['title'] = 'Clients'
                          } else if (this.operatorHeader[j]['menuShortDesc'] == 'SCH') {
                            this.operatorHeader[j]['title'] = 'Cardholder'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          resolve();
          return this.authChecks, this.operatorHeader, this.redirectURL
        })
      }
    })
    return promise;
  }

  getAllHmsAppMenu() {
    let promise = new Promise((resolve, reject) => {
      if (this.appMenu.length == 0) {
        this.authmenuResponse = this.http.get(CommonApi.getAllHmsApplicationMenu, { headers: { 'content-type': 'application/json', "Authorization": this.token } })
          .map(response => response)
          .catch((e: any) => Observable.throw(console.log("error")));
        this.authmenuResponse.subscribe(async data => {
          this.ObservableClaimObj = Observable.interval(1000).subscribe(x => {
            this.showLoading.emit(true)
          })
          let arrData = []
          for (var i = 0; i < data.result.length; i++) {
            if(data.result[i].hmsAppCd != 'DR' && data.result[i].hmsAppCd != 'DE'){
                arrData.push(data.result[i]);
            }
          }
          this.appMenu = arrData; 
          resolve();
        })
      } else {
        resolve();
      }
    });
    return promise
  }

  /**
   * 
   * @param operatorHeader 
   * @returns redirectURL
   */
  getFirstUrl(operatorHeader) {

    let firstElem = operatorHeader.filter(val => val.menuAccess == true).map(data => data)
    let childElem: any
    if (firstElem == '') {
      this.toastrService.error("You don't have access")
      return false
    } else {
      if (firstElem[0].children.length > 0) {
        childElem = firstElem[0].children
        let firstChild = childElem.filter(val => val.actionAccess == true).map(data => data)
        this.redirectURL = firstChild[0]['routerLink']
      } else {
        this.redirectURL = firstElem[0]['routerLink']
      }
      return this.redirectURL
    }
  }

  getBussinessType() {
    let promise = new Promise((resolve, reject) => {
      var URL = CommonApi.getBusinessTypeUrl;
      this.businesTypeApi = this.http.get(URL, { headers: { 'content-type': 'application/json', "Authorization": this.token } })
        .map(response => response)
        .catch((e: any) => Observable.throw(console.log(JSON.stringify(e))));
      this.businesTypeApi.subscribe(data => {
        if (data.code == 200) {
          this.businessTypeList = data.result
          this.getUserRoleId()
        }
      })
      resolve();
    })
    return promise;
  }

  getUserRoleId() {
    let promise = new Promise((resolve, reject) => {
      if (localStorage.getItem('currentUser')) {
        let userDataJson = {
          "userId": localStorage.getItem('id')
        }
        var URL = CommonApi.getUserWithRole;
        this.userRoleApi = this.http.post(URL, JSON.stringify(userDataJson), { headers: { 'content-type': 'application/json', "Authorization": this.token } })
          .map(response => response)
          .catch((e: any) => Observable.throw(console.log("error")));
        this.userRoleApi.subscribe(data => {
          if (data.code == 200 && data.status == 'OK') {
            this.userVal = data.result
            this.currentUser = this.currentUser = data.result
            this.userBusinnesType = this.currentUser.businessType
            this.getLoginUserDeparment().then(val => {
              resolve();
            })
          }
        })
      }
    })
    return promise;
  }

  getLoginUserDeparment() {
    let promise = new Promise((resolve, reject) => {
      if (this.userVal.isAdmin == 'T') {
        let val = this.userBusinnesType.filter(value => value.businessTypeCd == Constants.quikcardBusinessTypeCd).map(data => data)
        this.bothAcessdefaultBussinesType = val[0]
        this.userBusinnesType.bothAccess = true
        this.userBusinnesType.isQuikcard = false
        this.userBusinnesType.isAlberta = false
      } else if (this.userVal.businessType.length && this.userVal.businessType.length > 1) {
        let val = this.userBusinnesType.filter(value => value.businessTypeCd == Constants.quikcardBusinessTypeCd).map(data => data)
        this.bothAcessdefaultBussinesType = val[0]
        this.userBusinnesType.bothAccess = true
        this.userBusinnesType.isQuikcard = false
        this.userBusinnesType.isAlberta = false
      } else {
        if (this.userVal.businessType[0].businessTypeCd == Constants.quikcardBusinessTypeCd) {
          this.userBusinnesType.isQuikcard = true
          this.userBusinnesType.bothAccess = false
          this.userBusinnesType.isAlberta = false
        }
        if (this.userVal.businessType[0].businessTypeCd == Constants.albertaBusinessTypeCd) {
          this.userBusinnesType.isAlberta = true
          this.userBusinnesType.bothAccess = false
          this.userBusinnesType.isQuikcard = false
        }
      }
      this.currentUser.selectedUserRole = this.currentUser.roles[0].role
      this.currentUser.businessType = this.userBusinnesType
      this.userBusinnesType
      this.loggedInUserVal.emit(this.currentUser)
      resolve();
      return this.currentUser
    })
    return promise;
  }

  pushToArray(arr, obj) {
    const index = arr.findIndex((e) => e.hmsAppKey === obj.hmsAppKey);
    if (index === -1) {
      arr.push(obj);
    } else {
      arr[index] = obj;
    }
  }

  getApplicationNameByRoleKey(val) {
    var str
    switch (val) {
      case 1:
        str = 'HMS'
        break;
      case 2:
        str = 'Doctor Review'
        break;
      case 3:
        str = 'Gov Review'
        break;
      case 4:
        str = 'AHC'
        break;
        case 5:
          str = 'Ref Review'
          break;
    }
    return str;
  }

  /**
   * Set Router Link to open in the New Tabs 
   */
  setRouterLink(newTabRouterLink) {
    this.newTabRouterLink = newTabRouterLink;
  }

  /**
   * convert Amount To Decimal With Doller
   * @param value 
   */
  convertAmountToDecimalWithDoller(value) {
    if (value) {
      return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    } else {
      return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0);
    }
  }

  /**
   * convert Amount To Decimal Without Doller
   * @param value 
   */
  convertAmountToDecimalWithoutDoller(value) {
    if (value) {
      return new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    } else {
      return new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0);
    }
  }

}