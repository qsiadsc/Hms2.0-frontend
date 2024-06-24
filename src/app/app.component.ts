import { Component } from '@angular/core';
import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  OnInit,
  Renderer2,
  Self,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { CookieService } from 'ngx-cookie-service';
import { NotfoundComponent } from './notfound/notfound.component';
import { Constants } from './common-module/Constants';
import { CurrentUserService } from './common-module/shared-services/hms-data-api/current-user.service'
import { Title } from '@angular/platform-browser';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
declare var $: any;
import {
  // Import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
  // Sets initial value to true to show loading spinner on first load
  showLoader: boolean = false;
  title = 'My First Angular App!';
  id: any;
  currentUser: any;
  showReviewHeader: boolean = false
  role
  getVal: any;
  lastValue: string;
  constructor(
    private cookieService: CookieService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private currentUserService: CurrentUserService,
    private titleService: Title,
    private _hotkeysService: HotkeysService,
    public ref: ElementRef
  ) {
    this._hotkeysService.add(new Hotkey('shift+c', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/company']);
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('shift+b', (event: KeyboardEvent): boolean => {
      this.router.navigate(['/company/broker']);
      return false; // Prevent bubbling
    }));
    const cookieExists: boolean = cookieService.check('currentLanguage');
    if (!cookieExists) {
      this.cookieService.set('currentLanguage', '1');
    }
    this.getVal = this.currentUserService.loggedInUserVal.subscribe(val => {
      if (val) {
        this.currentUser = val
        this.changeTheme()
      }
    })
    // this.showLoader = true
    // Shows and hides the loading spinner during RouterEvent changes
    this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.showLoader = true;
        }
        else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.showLoader = false;
        }
      });
  }

  /* 
    Function to make capitalize all the input fields value while typing
    Mandeep
    issue number 713
  */
  @HostListener('input', ['$event']) onInput($event) {
    let part = this.ref.nativeElement.querySelector('input')
    if ($event.target.type === 'password') {
      return false;
    }


    var classNameToExclude = $event.srcElement.className;
    if (classNameToExclude.indexOf('notInCaps') > -1) {
      return false;
    }
    var allowed = ["text", "textarea", "search "];
    var notAllowed = ["radio", "select-one", "number", "checkbox", 'file'];
// console.log($event.target.type,"$event.target.type")
    var isNotAllowed = notAllowed.includes($event.target.type);
    if (isNotAllowed) {
      return false;
    }
    //notInCaps
    // if( $event.target.type ='text' || $event.srcElement.type =='textarea'){
    var start = $event.target.selectionStart;
    var end = $event.target.selectionEnd;
    $event.target.value = $event.target.value.toUpperCase();
    $event.target.setSelectionRange(start, end);
    $event.preventDefault();

    if (!this.lastValue || (this.lastValue && $event.target.value.length > 0 && this.lastValue !== $event.target.value)) {
      this.lastValue = this.ref.nativeElement.value = $event.target.value;
      // Propagation
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('input', false, true);
      event.target.dispatchEvent(evt);
    }
    // }
    // else {
    //   $event.preventDefault();
    //   return false;
    // }
  }

  /* 
    Function to make capitalize all the input fields value while typing
    Mandeep
    issue number 713
    End
  */

  ngOnInit() {
    //Set title for Alberta and Quikcard start   
    let stringToSplit = window.location.href;
    let stringAfterSplit = stringToSplit.split("/");
    if (stringAfterSplit[3] == 'albertalogin' || stringAfterSplit[3] == 'doctorlogin' || stringAfterSplit[3] == 'govlogin') {
      this.titleService.setTitle('ADSC');
    } else {
      this.titleService.setTitle('Quikcard');
    }

  }

  ngAfterViewInit() {
   // this.currentUserService.getUserRoleId().then(res => {
      this.currentUser = this.currentUserService.currentUser
      var self = this
      setTimeout(() => {
        self.changeTheme()
      }, 100);
   // })
    // Shows and hides the loading spinner during RouterEvent changes
    // this.router.events
    //   .subscribe((event) => {
    //     if (event instanceof NavigationStart) {
    //       this.showLoader = true;
    //     }
    //     else if (
    //       event instanceof NavigationEnd ||
    //       event instanceof NavigationCancel ||
    //       event instanceof NavigationError
    //     ) {
    //       this.showLoader = false;
    //     }
    //   }
    //   );
  }

  changeTheme() {
    // let applicationRoleKey = parseInt(localStorage.getItem('applicationRoleKey'))
    let applicationRoleKey = parseInt(this.currentUserService.applicationRoleKey)
    if ((this.currentUser && this.currentUser.businessType && !this.currentUser.businessType.bothAccess && this.currentUser.businessType[0].businessTypeCd == Constants.albertaBusinessTypeCd) || applicationRoleKey == 2 || applicationRoleKey == 3) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '../../assets/css/common-alberta.css';
      link.media = 'all';
      head.appendChild(link);
    } else {
      $('link[rel=stylesheet][href~="../../assets/css/common-alberta.css"]').remove();
    }
    // Task 451 To avoid disabled screen if go to any screen without closing pop-up. (01-05-2023) Prabhat
    $('body').removeClass("modal-open");
    $('.modal-backdrop').remove();
    $('#closeConfirmationPopup').trigger("click");
    $("body").removeAttr("style")
  }
}