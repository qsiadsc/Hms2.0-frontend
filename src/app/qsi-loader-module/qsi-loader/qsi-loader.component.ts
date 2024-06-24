import { Component, OnInit } from '@angular/core';
import { HmsDataServiceService } from '../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { ExDialog } from '../../common-module/shared-component/ngx-dialog/dialog.module';
import { QsiLoaderApi } from '../qsi-loader-api';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { ToastrService } from 'ngx-toastr';
import { RequestOptions, Http, Headers } from '@angular/http';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service'

@Component({
  selector: 'app-qsi-loader',
  templateUrl: './qsi-loader.component.html',
  styleUrls: ['./qsi-loader.component.css'],
  providers: [ChangeDateFormatService, ToastrService,CurrentUserService]
})
export class QsiLoaderComponent implements OnInit {
  selectedName: any;
  selectedFile: any;
  allowedType: string;
  showLoader: boolean = false;
  imagePath: any;
  msg = [];

  constructor(
    private exDialog: ExDialog,
    private changeDateFormatService: ChangeDateFormatService,
    private ToastrService: ToastrService,
    private hmsDataService: HmsDataServiceService,
    private currentUserService: CurrentUserService
  ) { }

  ngOnInit() {
  }

  exportElig() {
    this.exDialog.openConfirm('Do you want to continue Export Eligible?').subscribe((value) => {
      if (value) {
        this.msg.push('Please wait while system generates Eligible export data...')
        var url = QsiLoaderApi.exportQSIEligFileInsLogfile
        this.hmsDataService.getApi(url).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.msg.push(data.hmsMessage.messageShort)
          }else if(data.code == 400){
            this.ToastrService.error(data.hmsMessage.messageShort);
          }else if(data.code == 404){
            this.msg.push(data.hmsMessage.messageShort)
          }
        })
      }
    });
  }

  loadDailyFile() {
    this.exDialog.openConfirm('Do you want to continue Loading Payments File?').subscribe((value) => {
      if (value) {
        this.showLoader = true
        var url = QsiLoaderApi.getQsiLoadDailyFile
        this.hmsDataService.getApi(url).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.showLoader = false
            this.imagePath = data.result
          }
        })
      }
    });
  }

  loadPaymentFile(myModal) {
    this.exDialog.openConfirm('Do you want to continue Loading Payments File?').subscribe((value) => {
      if (value) {
        this.showLoader = true
        var url = QsiLoaderApi.getCsQsiLoadPaymentFile
        this.hmsDataService.getApi(url).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.showLoader = false
            this.imagePath = data.result
            myModal.open()
          }
        }, (error) => {
          this.showLoader = false
        })
      }
    });
  }

  exportExpense() {
    let expenseData = {
      "currentDate": this.changeDateFormatService.convertDateObjectToString(this.changeDateFormatService.getToday())
    }
    this.exDialog.openConfirm('Do you want to export expense file?').subscribe((value) => {
      if (value) {
        this.msg.push('Please wait while system generates expense export data...')
        var URL = QsiLoaderApi.exportQSIExpense;
        this.hmsDataService.post(URL, expenseData).subscribe(data => {
          if (data.code == 200 && data.status == "OK") {
            this.msg.push(data.hmsMessage.messageShort)
          }else if(data.code == 400){
            this.ToastrService.error(data.hmsMessage.messageShort);
          }
        }, (error) => {
          this.showLoader = false
        });
      }
    });
  }

  Close() {
    this.msg.push('Closed')
  }
  openModal() {
  }

  closeModal(myModal) {
    myModal.close();
  }

  onFileChanged(event)
  {
    this.allowedType="text/plain"
    this.selectedFile = event.target.files[0]
    var formData = new FormData()
    let header = new Headers({ 'Authorization': this.currentUserService.token });
    let options = new RequestOptions({ headers: header });
     this.showLoader = true
    formData.append('files', this.selectedFile);
    if(this.allowedType==this.selectedFile.type)
    {
      this.hmsDataService.sendFormData(QsiLoaderApi.getQsiLoadDailyFile, formData).subscribe(data => {
      if (data.hmsMessage.messageShort=="RECORD_UPDATED_SUCCESSFULLY")
      {
        this.ToastrService.success("Document Uploaded successfully")
        this.showLoader=false
      }
      else if(data.hmsMessage.messageShort=="INVALID_DATA"){
        this.showLoader=false
        const url = data.result;
        this.showLoader = false
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fghfh_'+this.changeDateFormatService.getCurrentTimestamp(new Date());
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 0)
        this.ToastrService.error("INVALID DATA")
      }
      else{
        this.showLoader=false
        this.ToastrService.error("Document can't be Uploaded")  
      }
    })
  }
  else{
    this.showLoader=false
    this.ToastrService.error("Only Text Files Are Allowed")  
  }
  }

}
