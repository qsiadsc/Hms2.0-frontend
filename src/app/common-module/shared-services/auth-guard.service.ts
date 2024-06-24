
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Constants } from '../Constants';
import { ToastrService } from 'ngx-toastr';
@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(
        private router: Router,
        private toastrService: ToastrService,
    ) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // process request for logged-in user
        if (localStorage.getItem('currentUser')) {
            return true;           
        } else {
            this.router.navigate(['quikcardlogin'], { queryParams: { returnUrl: state.url } });
            return false;
        }
    }
}