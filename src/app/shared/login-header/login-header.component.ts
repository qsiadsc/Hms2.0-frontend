import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';  

@Component({
  selector: 'app-login-header',
  templateUrl: './login-header.component.html',
  styleUrls: ['./login-header.component.css']
})
export class LoginHeaderComponent implements OnInit {
  arrLanguage:any;
  currentLanguage: string;
  constructor(private cookieService: CookieService) { }

  ngOnInit() {
    this.GetLanguageList();
    this.currentLanguage= this.cookieService.get('currentLanguage');
  }

  GetLanguageList()
  {
    this.arrLanguage = [
      {
        'languageId':1,
        'languageName':'Eng',
        'shortName':'en'
      },
      {
        'languageId':2,
        'languageName':'Spanish',
        'shortName':'sp'
      }
    ] 
  }
  ChangeLanguage()
  {  }
}
