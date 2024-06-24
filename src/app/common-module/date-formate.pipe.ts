import { Pipe } from '@angular/core';
import { DatePipe } from "@angular/common";

@Pipe({
  name: 'dateFormate'
})

export class DateFormatePipe extends DatePipe {
  transform(value: any, pattern: string = "dd/MMM/yyyy"): string|null { 
    if(value != null){
      return this.changeDateByMonthName(value);
    }else{
      return
    }    
  }

  changeDateByMonthName(DateString) {
    var monthLabels = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"}
    let dateArr = DateString.split('/');
    var day = '' + dateArr[0],
    month = '' + monthLabels[parseInt(dateArr[1])],
    year = dateArr[2];
    if (day.length < 2) day = '0' + day;
    if(month=="undefined"){
      return DateString;
    }
    if (day == 'NaN' || month == 'NaN' || year.toString() == 'NaN') {
      return;
    } else {
      return [day, month, year].join('/');
    }
  }
} 