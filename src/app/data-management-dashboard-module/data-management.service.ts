import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class DataManagementService {

   public showDataReportsList = new EventEmitter();   // Report tiles api hitting issue fixed
  constructor() { }

}
