import { Component, OnInit,EventEmitter } from '@angular/core';
import { drawDOM, exportPDF, DrawOptions, Group } from '@progress/kendo-drawing';
import { ChangeDateFormatService } from '../../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { saveAs } from '@progress/kendo-file-saver';
import { ReviewAppService } from '../../reviewApp.service'
import { HmsDataServiceService } from '../../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ReviewAppApi } from '../../reviewApp-api'

@Component({
  selector: 'app-export-claim-letter',
  templateUrl: './export-claim-letter.component.html',
  styleUrls: ['./export-claim-letter.component.css'],
  providers: [ChangeDateFormatService]
})
export class ExportClaimLetterComponent implements OnInit {
  isFileContent:boolean = false;
  isApproved:boolean=false;
  reviewStatus:String;
  letterContent:any={};
  todayDate:string;
  printPreAuth = new EventEmitter()
  constructor(private reviewAppService: ReviewAppService,
    private hmsDataService:HmsDataServiceService,
    private changeDateFormatService:ChangeDateFormatService,) {
    this.todayDate = this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday());
    this.todayDate = this.changeDateFormatService.formatDateLetter(this.todayDate)
    this.reviewAppService.openLetter.subscribe(data=>{
      if(data.claimKey)
      {
        this.isApproved = data.isApproved;
        this.reviewStatus = data.reviewStatus;
        this.GenerateLetter(data.claimKey);
      }
    })
    this.printPreAuth.subscribe(data=>{
      if(data.claimKey)
      {
        this.isApproved = data.isApproved;
        this.reviewStatus = data.reviewStatus;
        this.GenerateLetter(data.claimKey);
      }
    })
  }

ngOnInit() {
}

GenerateLetter(claimKey)
  {
    let requestedData={
      "claimKey":claimKey
    }
    this.hmsDataService.postApi(ReviewAppApi.generateLetterUrl,requestedData).subscribe(
      res =>
      {
        if(res.hmsMessage.messageShort == 'RECORD_GET_SUCCESSFULLY')
          this.letterContent = res.result;
          this.letterContent.reviewDate = this.changeDateFormatService.formatDateLetter(this.letterContent.reviewDate);
          this.letterContent.patientDOB = this.changeDateFormatService.formatDateLetter(this.letterContent.patientDOB);
          this.hmsDataService.OpenCloseModal('btnOpenModalLetter');
      });
    }
exportLetter(element: HTMLElement, options?: DrawOptions) {
  this.isFileContent=true;
  drawDOM(element, options).then((group: Group) => {
    this.isFileContent=false;;
    return exportPDF(group);
  }).then((dataUri) => {
    saveAs(dataUri, 'ExportLetter.pdf');
  });
}

}
