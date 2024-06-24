import { Injectable } from '@angular/core';
import {TranslateService} from '@ngx-translate/core'; // Include translation service

@Injectable()
export class LanguageTranslatorService {

  constructor( public translate: TranslateService) { 
     
    translate.setDefaultLang('en');
  }

}
