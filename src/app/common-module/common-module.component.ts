import { Component, OnInit } from '@angular/core';
import { HmsDataServiceService } from '../common-module/shared-services/hms-data-api/hms-data-service.service';
import { CommonApi } from '../common-module/common-api';
import { CurrentUserService } from '../common-module/shared-services/hms-data-api/current-user.service'
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-common-module',
    templateUrl: './common-module.component.html',
    styleUrls: ['./common-module.component.css'],

})

export class CommonModuleComponent implements OnInit {
    languages: any
    headerMenu = [
        {
            'title': 'Setup',
            'id': 'item1',
            'routerLinkActive': false,
            'routerLink': '',
            'children': [],
            'key': 1
        },
        {
            'title': 'Dashboard',
            'id': '',
            'routerLinkActive': true,
            'children': [],
            'routerLink': '/claimDashboard',
            'key': 2
        },
        {
            'title': 'Claims',
            'id': 'item3',
            'routerLinkActive': true,
            'children': [
                {
                    'title': 'Search Claim',
                    'id': '',
                    'routerLinkActive': true,
                    'routerLink': '/claim/searchClaim',
                    'key': 12
                },
                {
                    'title': 'Add New Claim',
                    'id': '',
                    'routerLinkActive': true,
                    'routerLink': '/claim',
                    'key': 13
                }
            ],
            'key': 3
        },
        {
            'title': 'Cardholder',
            'id': 'item4',
            'routerLinkActive': true,
            'children': [
                {
                    'title': 'Search Cardholder',
                    'id': '',
                    'routerLinkActive': true,
                    'routerLink': '/card/searchCard',
                    'key': 14
                },
                {
                    'title': 'Add New Card',
                    'id': '',
                    'routerLinkActive': true,
                    'routerLink': '/card',
                    'key': 15
                }
            ],
            'key': 4
        },
        {
            'title': 'Company',
            'id': 'item6',
            'routerLinkActive': true,
            'children': [
                {
                    'title': 'Search Compnay',
                    'id': '',
                    'routerLinkActive': true,
                    'routerLink': '/company',
                    'key': 16
                },
                {
                    'title': 'Broker',
                    'id': '',
                    'routerLinkActive': true,
                    'routerLink': '/company/broker',
                    'key': 17
                }
            ],
            'key': 5
        }
    ]

    constructor(private hmsDataService: HmsDataServiceService, private currentUserService: CurrentUserService) { }

    ngOnInit() { }
}
