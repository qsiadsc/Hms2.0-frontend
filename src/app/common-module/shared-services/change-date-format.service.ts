import { Injectable } from '@angular/core';
import { CommonDatePickerOptions } from '../../common-module/Constants';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr'; //add toster service
import { from } from 'rxjs/observable/from';
import { concatStatic } from 'rxjs/operator/concat';

@Injectable()
export class ChangeDateFormatService {

  // Variables will be used to get Current date
  datePickerValue: string;

  dateDay: string | number;
  dateMonth: string | number;
  dateYear: string | number;

  FullYear: string | number;
  CurrentYear: string | number;

  currentDate = new Date();
  numberValue = new Number()

  myDateFormat = CommonDatePickerOptions.myDateFormat;

  // MonthDay variable is used to check day in month
  monthsDay = {
    0: 31,
    '1': 31,
    '2': 28,
    '3': 31,
    '4': 30,
    '5': 31,
    '6': 30,
    '7': 31,
    '8': 31,
    '9': 30,
    '00': 31,
    '01': 31,
    '02': 28,
    '03': 31,
    '04': 30,
    '05': 31,
    '06': 30,
    '07': 31,
    '08': 31,
    '09': 30,
    '10': 31,
    '11': 30,
    '12': 31
  };
 
  M = "m";
  MM = "mm";
  MMM = "mmm";
  D = "d";
  DD = "dd";
  YYYY = "yyyy";
  expired: any;

  constructor(
    private toastrService: ToastrService,
    private translate: TranslateService
  ) {
  }

  arraySearch(arr, val) {
    for (var i = 0; i < arr.length; i++)
      if (arr[i] === val)
        return i;
    return false;
  }

  /**
  * @description : This Function is used to convert entered value to date in a valid data format.
  * @params : event
  * @return date object
  */
  changeDateFormat(event) {
    let dateValue = "";
    let dateArr = "";
    var dayVal;

    // Verify is date a valid date or not
    var dtValue = this.isDateValid(event.value)
    if (dtValue.day != 0 && dtValue.month != 0 && dtValue.year != 0) {
      this.datePickerValue = dtValue.day.toString() + dtValue.month.toString() + dtValue.year.toString();
    } else {
      this.datePickerValue = event.value;
    }

    // Remove hypen (-) from date picker value
    this.datePickerValue = this.datePickerValue.replace(/-/g, "");

    // Remove / from date picker value
    this.datePickerValue = this.datePickerValue.replace(/\//g, "");

    this.CurrentYear = this.currentDate.getFullYear();
    this.FullYear = this.CurrentYear.toString()

    // getting entered day
    this.dateDay = this.datePickerValue.length >= 1 ? this.datePickerValue.substring(0, 2) : '';

    if (this.datePickerValue.length >= 1) {
      // getting entered Month
      this.dateMonth = this.datePickerValue.length >= 3 ? this.datePickerValue.substring(2, 4) : this.currentDate.getMonth() + 1;

      if (this.dateMonth > 12) {
        return null;
      }

      this.dateMonth = this.dateMonth > 12 ? this.currentDate.getMonth() + 1 : this.dateMonth;

      if (this.datePickerValue.length > 8) {
        return null;
      }
      // getting entered Year
      this.dateYear = this.datePickerValue.length >= 8 ? this.datePickerValue.substring(4, 8) : this.datePickerValue.length >= 6 ? this.retrunYearCheck() : this.FullYear;

      // This if used to check if user trying to enter month greater than the month of current year
      if (parseInt(this.dateDay) > 28 && this.dateMonth == 2 && parseInt(this.dateYear) % 4 == 0) {
        this.dateDay = parseInt(this.dateDay);
        dayVal = this.dateDay;
        if (dayVal > 29) {
          return null
        }
      } else if (parseInt(this.dateDay) > 28 && parseInt(this.dateDay) > this.monthsDay[this.dateMonth]) {
        dayVal = dayVal = this.dateDay;
        if (dayVal > this.monthsDay[this.dateMonth]) {
          return null
        }
      }

      // check if user entered day or month or year value 00
      if (this.dateDay == 0 || this.dateMonth == 0 || parseInt(this.dateYear) == 0) {
        return null;
      }

      // combine day, month and year values in a single string      
      dateValue = this.dateDay + '-' + this.dateMonth + '-' + this.dateYear;

      let dateArr = dateValue.split('-');
      var yearVal = parseInt(dateArr[2]);
      var MonthVal = parseInt(dateArr[1]);
      var DayVal = parseInt(dateArr[0]);

      if (yearVal.toString() == 'NaN' || MonthVal.toString() == 'NaN' || DayVal.toString() == 'NaN') {
        return null
      } else {
        return {
          date: {
            year: yearVal,
            month: MonthVal,
            day: DayVal
          }
        };
      }
    }
  }
  retrunYearCheck() {
    this.CurrentYear = this.currentDate.getFullYear();
    this.FullYear = this.CurrentYear.toString();
    var lastDigitYear = this.datePickerValue.substring(4, 6);
    if (lastDigitYear <= this.FullYear.substring(0, 2)) {
      return this.FullYear.substring(0, 2) + this.datePickerValue.substring(4, 6);
    } else {
      return (+this.FullYear.substring(0, 2) - 1) + this.datePickerValue.substring(4, 6);
    }
  }

  /**
  * @description : This Function is used to convert entered value to date in a valid data format. and year should not greater than current month
  * @params : event
  * @return date object
  */
  changeDateFormatLessThanCurrentMonth(event) {
    let dateValue = "";
    let dateArr = "";
    var dayVal;
    let dateVal
    if (event.value) {
      dateVal = event.value.length == 5 && !event.value.includes("/") ? event.value.substring(0, 2) + 0 + event.value.substring(2, 5) : event.value
    }
    // Verify is date a valid date or not
    var dtValue = this.isDateValid(dateVal)
    if (dtValue.day != 0 && dtValue.month != 0 && dtValue.year != 0) {
      this.datePickerValue = dtValue.day.toString() + dtValue.month.toString() + dtValue.year.toString();
    } else {
      this.datePickerValue = dateVal;
    }
    // Remove hypen (-) from date picker value
    this.datePickerValue = this.datePickerValue.replace(/-/g, "");

    // Remove / from date picker value
    this.datePickerValue = this.datePickerValue.replace(/\//g, "");

    this.CurrentYear = this.currentDate.getFullYear();
    this.FullYear = this.CurrentYear.toString()

    // getting entered day
    this.dateDay = this.datePickerValue.length >= 1 ? this.datePickerValue.substring(0, 2) : '';

    if (this.datePickerValue.length >= 1) {
      // getting entered Month
      this.dateMonth = this.datePickerValue.length >= 3 ? this.datePickerValue.substring(2, 4) : this.currentDate.getMonth() + 1;

      if (this.dateMonth > 12) {
        return null;
      }

      this.dateMonth = this.dateMonth > 12 ? this.currentDate.getMonth() + 1 : this.dateMonth;

      if (this.datePickerValue.length > 8) {
        return null;
      }
      // getting entered Year
      this.dateYear = this.datePickerValue.length >= 8 ? this.datePickerValue.substring(4, 8) : this.datePickerValue.length >= 6 ? this.retrunYearCheck() : this.FullYear;

      // This if used to check if user trying to enter month greater than the month of current year
      if (parseInt(this.dateDay) > 28 && this.dateMonth == 2 && parseInt(this.dateYear) % 4 == 0) {
        this.dateDay = parseInt(this.dateDay);
        dayVal = this.dateDay;
        if (dayVal > 29) {
          return null
        }
      } else if (parseInt(this.dateDay) > 28 && parseInt(this.dateDay) > this.monthsDay[this.dateMonth]) {
        dayVal = dayVal = this.dateDay;
        if (dayVal > this.monthsDay[this.dateMonth]) {
          return null
        }

      }

      // check if user entered day or month or year value 00
      if (this.dateDay == 0 || this.dateMonth == 0 || parseInt(this.dateYear) == 0) {
        return null;
      }

      // combine day, month and year values in a single string      
      dateValue = this.dateDay + '-' + this.dateMonth + '-' + this.dateYear;

      let dateArr = dateValue.split('-');
      var yearVal = parseInt(dateArr[2]);
      var MonthVal = parseInt(dateArr[1]);
      var DayVal = parseInt(dateArr[0]);

      if (yearVal > this.CurrentYear) {
        var yearValToString = yearVal.toString();
        var updatedYearVal = yearValToString.substr(yearValToString.length - 2);
        var updatedCurrentYearVal = this.FullYear.substr(yearValToString.length - 2);
        var updatedYearVal = updatedCurrentYearVal + updatedYearVal
        var yearVal = parseInt(updatedYearVal)
      }
      if (yearVal.toString() == 'NaN' || MonthVal.toString() == 'NaN' || DayVal.toString() == 'NaN') {
        return null
      } else {
        return {
          date: {
            year: yearVal,
            month: MonthVal,
            day: DayVal
          }
        };
      }
    }
  }

  /**
  * @description : This Function is used to validate entered string value is a valid date or not.
  * @params : dateStr
  * @return date object
  */
  isDateValid(dateStr) {
    var dateFormat = this.myDateFormat;
    var monthLabels = { 1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec" }
    var returnDate = { day: 0, month: 0, year: 0 };
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var isMonthStr = dateFormat.indexOf(this.MMM) !== -1;
    var delimeters = this.getDateFormatDelimeters(dateFormat);
    var dateValue = this.getDateValue(dateStr, dateFormat, delimeters);
    var year = this.getNumberByValue(dateValue[0]);
    var month = isMonthStr ? this.getMonthNumberByMonthName(dateValue[1], monthLabels) : this.getNumberByValue(dateValue[1]);
    var day = this.getNumberByValue(dateValue[2]);
    if (month !== -1 && day !== -1 && year !== -1) {
      if (month < 1 || month > 12) {
        return returnDate;
      }
      var dval = day.toString().length == 1 ? '0' + day : day.toString();
      var mval = month.toString().length == 1 ? '0' + month : month.toString();

      var date = { year: year, month: mval, day: dval };
      if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
        daysInMonth[1] = 29;
      }
      if (day < 1 || day > daysInMonth[month - 1]) {
        return returnDate;
      }
      return date;
    }
    return returnDate;
  }

  /**
  * @description : This Function is used date format separator.
  * @params : dateFormat
  * @return date object
  */
  getDateFormatDelimeters(dateFormat) {
    return dateFormat.match(/[^(dmy)]{1,}/g);
  }

  /**
  * @description : This Function is used get date by value.
  * @params : dateStr - Entered Date Value
  * @params : dateFormat - Entered Date Format
  * @params : delimeters
  */
  getDateValue(dateStr, dateFormat, delimeters) {
    var del = delimeters[0];
    if (delimeters[0] !== delimeters[1]) {
      del = delimeters[0] + delimeters[1];
    }
    var re = new RegExp("[" + del + "]");
    var ds = dateStr.split(re);
    var df = dateFormat.split(re);
    var da = [];
    for (var i = 0; i < df.length; i++) {
      if (df[i].indexOf(this.YYYY) !== -1) {
        da[0] = { value: ds[i], format: df[i] };
      }
      if (df[i].indexOf(this.M) !== -1) {
        da[1] = { value: ds[i], format: df[i] };
      }
      if (df[i].indexOf(this.D) !== -1) {
        da[2] = { value: ds[i], format: df[i] };
      }
    }
    return da;
  }

  getNumberByValue(df) {
    if (!/^\d+$/.test(df.value)) {
      return -1;
    }
    var nbr = Number(df.value);
    if (df.format.length === 1 && df.value.length !== 1 && nbr < 10 || df.format.length === 1 && df.value.length !== 2 && nbr >= 10) {
      nbr = -1;
    }
    else if (df.format.length === 2 && df.value.length > 2) {
      nbr = -1;
    }
    return nbr;
  }

  /**
  * @description : This Function is used get month number by name.
  * @params : df - month name
  * @params : monthLabels - month number and name object
  * @return month number
  */
  getMonthNumberByMonthName(df, monthLabels) {
    if (df.value) {
      for (var key = 1; key <= 12; key++) {
        if (df.value.toLowerCase() === monthLabels[key].toLowerCase()) {
          return key;
        }
      }
    }
    return -1;
  }

  getToday() {
    var date = new Date();
    return {
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }
    };
  }
  getWeekToday() {
    var date = new Date();
    return {
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate() + 6
      }
    };
  }

  getLastYear() {
    var date = new Date();
    return {
      fromDate: {
        date: {
          year: date.getFullYear() - 1,
          month: 1,
          day: 1
        }
      },
      toDate: {
        date: {
          year: date.getFullYear() - 1,
          month: 12,
          day: 31
        }
      }
    };
  }

  getLastMonth() {
    var date = new Date();
    return {
      fromDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: 1
        }
      },
      toDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: new Date(date.getFullYear(), date.getMonth(), 0).getDate()
        }
      }
    };
  }


  getLastWeek() {
    var curr = new Date; // get current date
    var first = curr.getDate() - (curr.getDay() + 7); // First day is the day of the month - the day of the week
    var firstday = new Date(curr.setDate(first));
    var firstDate = (firstday.getMonth() + 1) + '/' + firstday.getDate() + '/' + firstday.getFullYear();
    var firstDateToDate = new Date(firstDate);
    var newLastDate = new Date(firstDateToDate);
    newLastDate.setDate(newLastDate.getDate() + 6);

    return {
      fromDate: {
        date: {
          year: firstday.getFullYear(),
          month: firstday.getMonth() + 1,
          day: firstday.getDate()
        }
      },
      toDate: {
        date: {
          year: newLastDate.getFullYear(),
          month: newLastDate.getMonth() + 1,
          day: newLastDate.getDate()
        }
      }
    };
  }

  getPrevWeek() {
    var curr = new Date; // get current date
    var first = curr.getDate(); // First day is the day of the month - the day of the week
    var firstday = new Date(curr.setDate(first));
    var firstDate = (firstday.getMonth() + 1) + '/' + firstday.getDate() + '/' + firstday.getFullYear();
    var firstDateToDate = new Date(firstDate);
    var newLastDate = new Date(firstDateToDate);
    newLastDate.setDate(newLastDate.getDate() - 6);
    return {
      fromDate: {
        date: {
          year: newLastDate.getFullYear(),
          month: newLastDate.getMonth() + 1,
          day: newLastDate.getDate()
        }
      },
      toDate: {
        date: {
          year: firstday.getFullYear(),
          month: firstday.getMonth() + 1,
          day: firstday.getDate()
        }
      }
    };
  }

  getYesterday() {
    var date = new Date();
    return {
      fromDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate() - 1
        }
      },
      toDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate() - 1
        }
      }
    };
  }

  getContractYear(companyEffectiveDate) {
    var date = new Date();
    var currentDate = this.getToday();
    var year = companyEffectiveDate.date.year;
    var month = companyEffectiveDate.date.month;
    var day = companyEffectiveDate.date.day

    var companyContactYearDate = {
      year: date.getFullYear(),
      month: month,
      day: day
    }


    var theCurrentDate = Math.round(this.getTimeInMilliseconds(currentDate.date) / 1000.0)
    // covert end date to unix time stamp
    var theCompanyContactYearDate = Math.round(this.getTimeInMilliseconds(companyContactYearDate) / 1000.0)
    if (new Date(date.getFullYear()) < new Date(year)) {

      var finalDate = {
        fromDate: {
          date: {
            year: date.getFullYear(),
            month: month,
            day: day
          }
        },
        toDate: {
          date: {
            year: date.getFullYear() + 1,
            month: month,
            day: day
          }
        }
      };
    } else {
      var newDateString = year + "/" + month + "/" + day;
      var d = new Date(newDateString);
      var toDate = new Date((date.getFullYear()) + "/" + month + "/" + day);
      let oneDaysAgo = toDate.setDate(toDate.getDate() - 1);
      var newDate = new Date(oneDaysAgo);
      finalDate = {
        fromDate: {
          date: {
            year: date.getFullYear() - 1,
            month: month,
            day: day
          }
        },
        toDate: {
          date: {
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
            day: newDate.getDate()
          }
        }
      }

      var fromDate = new Date(finalDate.fromDate.date.year + "/" + finalDate.fromDate.date.month + "/" + finalDate.fromDate.date.day);
      var toDate = new Date(finalDate.toDate.date.year + "/" + finalDate.toDate.date.month + "/" + finalDate.toDate.date.day);
      if (toDate > new Date()) {
        var toDate = new Date((date.getFullYear() - 2) + "/" + month + "/" + day);
        let oneDaysAgo = toDate.setDate(toDate.getDate() - 1);
        var newDate = new Date(oneDaysAgo);
        finalDate = {
          fromDate: {
            date: {
              year: date.getFullYear() - 2,
              month: month,
              day: day
            }
          },
          toDate: {
            date: {
              year: newDate.getFullYear() + 1,
              month: newDate.getMonth() + 1,
              day: newDate.getDate()
            }
          }
        }
      }

      if (this.date_diff_indays(fromDate, toDate) > 365) {
        var lastDayOfYear = new Date(new Date().getFullYear(), 11, 31);
        var startDayOfYear = new Date(new Date().getFullYear(), 1, 1);
        var fromDate = new Date(finalDate.fromDate.date.year + "/" + finalDate.fromDate.date.month + "/" + finalDate.fromDate.date.day);
        let oneDaysAgo = toDate.setDate(toDate.getDate() - 1);
        var newDate = new Date(oneDaysAgo);
        finalDate = {
          fromDate: {
            date: {
              year: fromDate.getFullYear() - 1,
              month: fromDate.getMonth() + 1,
              day: fromDate.getDate()
            }
          },
          toDate: {
            date: {
              year: newDate.getFullYear() - 1,
              month: newDate.getMonth() + 1,
              day: newDate.getDate()
            }
          }
        }
      }

      if (new Date(finalDate.toDate.date.year + "/" + finalDate.toDate.date.month + "/" + finalDate.toDate.date.day) > new Date()) {
        finalDate = {
          fromDate: {
            date: {
              year: date.getFullYear() - 1,
              month: month,
              day: day
            }
          },
          toDate: {
            date: {
              year: date.getFullYear(),
              month: newDate.getMonth() + 1,
              day: newDate.getDate()
            }
          }
        }
      }

    }
    return finalDate;
  }
  /* issue number 750 */
  getCurrentContractYear(companyEffectiveDate) {
    var date = new Date();
    var currentDate = this.getToday();
    var year = companyEffectiveDate.date.year;
    var month = companyEffectiveDate.date.month;
    var day = companyEffectiveDate.date.day

    var companyContactYearDate = {
      year: date.getFullYear(),
      month: month,
      day: day
    }

    var toDate = new Date(date.getFullYear() + "/" + month + "/" + day);
    var oldToDate = new Date(date.getFullYear() + "/" + month + "/" + day);
    let oneDaysAgo1 = toDate.setDate(toDate.getDate() - 2);
    var newDate1 = new Date(oneDaysAgo1);
    if ((date.getFullYear() + 1) % 4 != 0 && (newDate1.getMonth() + 1) === 2) {
      let oneDaysAgo = oldToDate.setDate(oldToDate.getDate() - 2);
      var newDate = new Date(oneDaysAgo);
    } else {
      let oneDaysAgo = oldToDate.setDate(oldToDate.getDate() - 1);
      var newDate = new Date(oneDaysAgo);
    }
    var finalDate = {
      fromDate: {
        date: {
          year: date.getFullYear(),
          month: month,
          day: day
        }
      },
      toDate: {
        date: {
          year: date.getFullYear() + 1,
          month: newDate.getMonth() + 1,
          day: newDate.getDate()
        }
      }
    }
    if (new Date(finalDate.fromDate.date.year + "/" + finalDate.fromDate.date.month + "/" + finalDate.fromDate.date.day) > new Date()) {
      finalDate = {
        fromDate: {
          date: {
            year: date.getFullYear() - 1,
            month: month,
            day: day
          }
        },
        toDate: {
          date: {
            year: date.getFullYear(),
            month: newDate.getMonth() + 1,
            day: newDate.getDate()
          }
        }
      }
    }

    var newfromDate = new Date(finalDate.fromDate.date.year + "/" + finalDate.fromDate.date.month + "/" + finalDate.fromDate.date.day);
    var newtoDate = new Date(finalDate.toDate.date.year + "/" + finalDate.toDate.date.month + "/" + finalDate.toDate.date.day);

    if (this.date_diff_indays(newfromDate, newtoDate) > 365) {
      var lastDayOfYear = new Date(new Date().getFullYear(), 11, 31);
      var startDayOfYear = new Date(new Date().getFullYear(), 1, 1);
      finalDate = {
        fromDate: {
          date: {
            year: startDayOfYear.getFullYear(),
            month: startDayOfYear.getMonth(),
            day: startDayOfYear.getDate()
          }
        },
        toDate: {
          date: {
            year: lastDayOfYear.getFullYear(),
            month: lastDayOfYear.getMonth() + 1,
            day: lastDayOfYear.getDate()
          }
        }
      }
    }
    // issue number 750 end
    return finalDate;
  }

  date_diff_indays(date1, date2) {
    var dt1 = new Date(date1);
    var dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
  }

  isValidDate(dt) {
    return dt instanceof Date;
  }

  oldMonthDays(days) {
    var date = new Date();
    date.setMonth(date.getMonth());
    date.setDate(date.getDate() + days);
    return date;
  }

  oneMonthBackDate() {
    let today = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let d = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let d2 = new Date(new Date().setMonth(new Date().getMonth() + 1));
    let prevMon = new Date(this.oldMonthDays(1));
    prevMon = new Date(prevMon.setDate(today.getDate() + 1));

    return {
      toDate: {
        date: {
          year: d.getFullYear(),
          month: d.getMonth(),
          day: d.getDate()
        }
      },
      fromDate: {
        date: {
          year: prevMon.getFullYear(),
          month: prevMon.getMonth(),
          day: prevMon.getDate()
        }
      }
    };
  }

   // Log #1169: To fix Date Range Issue 
  getMonthBackDate() {
    // First method to get required result
    let currentDate = new Date()
    let priorDate = new Date()
    let prevDate = new Date(priorDate.setDate(priorDate.getDate() - 29)) //To fix Default Date Range as discussed with Arun sir
    
	  return {
      fromDate: {
        date: {
          year: prevDate.getFullYear(),
          month: prevDate.getMonth() + 1,
          day: prevDate.getDate()
        }
      },
      toDate: {
        date: {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate()
        }
      }
    };
  }

  compareTwoDates(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    // covert end date to unix time stamp
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)

      // covert end date to unix time stamp
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)

      if (new Date(theEndDate) < new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Expiry Date should be greater than Effective Date" };
      }
    }
    return error;
  }

  /*  */
  compareDatesWitinTenDays(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (new Date(theEndDate) > new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Date must be within 10 days of current date" };
      }
    }
    return error;
  }

  comparePastDatesWitinTenDays(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (new Date(theEndDate) < new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Date must be within 10 days of current date" };
      }
    }
    return error;
  }

  compareTwoCardDates(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    // covert end date to unix time stamp
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)

      // covert end date to unix time stamp
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)

      if (new Date(theEndDate) <= new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Expiry Date should be greater than Effective Date" };
      }
    }
    return error;
  }

  compareBrokerEffectiveAndTerminationDate(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    // covert end date to unix time stamp
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      // covert end date to unix time stamp
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (new Date(theEndDate) < new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Broker Termination Date should be greater than Broker Effective Date" };
      }
    }
    return error;
  }

  compareEffectiveAndCoTerminatedDate(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    // covert end date to unix time stamp
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      // covert end date to unix time stamp
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)

      if (new Date(theEndDate) < new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Effective Date should be less than Company Terminated Date" };
      }
    }
    return error;
  }

  compareEffectiveAndTodayDate(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    // covert end date to unix time stamp
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      // covert end date to unix time stamp
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (new Date(theEndDate) < new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Effective Date should be greater than Today's Date" };
      }
    }
    return error;
  }

  compareEffectiveAndCoEffectiveDate(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    // covert end date to unix time stamp
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      // covert end date to unix time stamp
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (new Date(theEndDate) < new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Effective Date should be greater than Company Effective Date" };
      }
    }
    return error;
  }

  futureDateValidation(startDate) {
    var error = { isError: false, errorMessage: '' };
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var endDate = this.convertStringDateToObject(dd + '/' + mm + '/' + yyyy)
    // covert end date to unix time stamp
    if ((startDate != '' && startDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      // covert end date to unix time stamp
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (!theStartDate || !theEndDate) {
        error = { isError: true, errorMessage: "" };
      }
    }
    return error;
  }

  getTimeInMilliseconds(someDate) {
    return this.getDate(someDate.year, someDate.month, someDate.day).getTime();
  }

  getDate(year, month, day) {
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  /**
  * Following function return date in string format dd-mm yyyy
  * @param dateObj :dateobj accepted as date obj. we are returning the object into string
  */
  convertDateObjectToString(dateObj: any) {
    if (dateObj != null && dateObj != "" && dateObj != undefined) {
      var dayVal
      var monVal
      var dateValue = dateObj.date
      if (dateValue.day >= 10) {
        dayVal = dateValue.day
      } else {
        dayVal = '0' + dateValue.day
      }
      if (dateValue.month >= 10) {
        monVal = dateValue.month
      } else {
        monVal = '0' + dateValue.month
      }
      var finalDate = dayVal + '/' + monVal + '/' + dateValue.year
      return finalDate
    } else {
      return null;
    }
  }

  /**
  * Following function return date string in object format
  * @param strDate : date will accepted as a string format.
  */
  convertStringDateToObject(strDate: string) {
    if (strDate != null && strDate != "" && strDate != undefined) {
      var objDate = strDate.split('/');
      var mnth;
      mnth = parseInt(objDate[1]);
      if (mnth.toString() == 'NaN') {
        var monthLabels = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 }
        mnth = monthLabels[objDate[1]];
      }
      return {
        date: {
          year: parseInt(objDate[2]),
          month: parseInt(mnth),
          day: parseInt(objDate[0])
        }
      };
    } else {
      return null;
    }
  }

  isFutureDate(strDate: any) {
    var today = new Date();
    var dd = ("0" + today.getDate()).slice(-2)
    var mm = ("0" + (today.getMonth() + 1)).slice(-2)
    var yyyy = today.getFullYear();
    var startDateObj = strDate.split('/')
    var startDay = startDateObj[0]
    var startMonth = startDateObj[1]
    var stratDateArray = strDate.split('/')
    strDate = stratDateArray[2] + "-" + stratDateArray[1] + "-" + stratDateArray[0]
    var todayDate = yyyy + '-' + mm + '-' + dd
    if (strDate < todayDate) {
      return false;
    }
    else {
      return true;
    }
  }

  isFutureDateOrToday(strDate: any) {
    var today = new Date();
    var dd = ("0" + today.getDate()).slice(-2)
    var mm = ("0" + (today.getMonth() + 1)).slice(-2)
    var yyyy = today.getFullYear();
    var startDateObj = strDate.split('/')
    var startDay = startDateObj[0]
    var startMonth = startDateObj[1]
    var stratDateArray = strDate.split('/')
    strDate = stratDateArray[2] + "-" + stratDateArray[1] + "-" + stratDateArray[0]
    var todayDate = yyyy + '-' + mm + '-' + dd
    if (strDate <= todayDate) {
      return false;
    }
    else {
      return true;
    }
  }

  isFutureFormatedDate(strDate: any) {
    var today = new Date();
    var newdate = new Date(strDate);
    var dateObj = new Date(today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate());
    if (newdate < dateObj) {
      return false;
    }
    else {
      return true;
    }
  }

  isFutureFormatedDateexpCheck(strDate: any) {
    var red = "#eb5757";
    var black = "#0a0808";
    var check = this.isFutureDate(strDate)
    if (check) {
      return black;
    } else {
      return red;
    }
  }

  isFutureNonFormatDate(strDate: any) {
    var today = new Date();
    var dd = ("0" + today.getDate()).slice(-2)
    var mm = ("0" + (today.getMonth() + 1)).slice(-2)
    var yyyy = today.getFullYear();
    var startDateObj = strDate.split('/')
    var startDay = startDateObj[0]
    var startMonth = startDateObj[1]
    var stratDateArray = strDate.split('/')
    strDate = stratDateArray[2] + "-" + stratDateArray[1] + "-" + stratDateArray[0]
    var todayDate = yyyy + '-' + mm + '-' + dd
    var newDate = new Date(today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate());
    var checkDate = new Date(strDate);
    if (newDate < checkDate) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
  * Final Comman Function for Compare Two Dates
  * @param startDate 
  * @param endDate 
  */
  compareTwoDate(startDate: any, endDate: any) {
    var startDateObj = startDate.split('/')
    var startDay = startDateObj[0]
    var startMonth = startDateObj[1]

    if (parseInt(startDay) < 10) {
      var idx = startDay.indexOf('0')
      if (idx == -1) {
        startDay = '0' + startDay;
      }
    }

    if (parseInt(startMonth) < 10) {
      var idx = startMonth.indexOf('0')
      if (idx == -1) {
        startMonth = '0' + startMonth;
      }
    }

    startDate = startDateObj[2] + '-' + startMonth + '-' + startDay;
    if (endDate) {
      var endDateObj = endDate.split('/')
      var endDay = endDateObj[0]
      var endMonth = endDateObj[1]
    }
    if (parseInt(endDay) < 10) {
      var idx = endDay.indexOf('0')
      if (idx == -1) {
        endDay = '0' + endDay;
      }
    }
    if (parseInt(endMonth) < 10) {
      var idx = endMonth.indexOf('0')
      if (idx == -1) {
        endMonth = '0' + endMonth;
      }
    }
    if (endDateObj) {
      endDate = endDateObj[2] + '-' + endMonth + '-' + endDay;
    }
    if (startDate == endDate) {
      return false;
    }
    else if (startDate > endDate) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
  * Final Comman Function for Compare Two Dates
  * @param startDate 
  * @param endDate 
  */
  isStartDateGreaterThanEndDate(startDate: any, endDate: any) {
    var startDateObj = startDate.split('/')
    var startDay = startDateObj[0]
    var startMonth = startDateObj[1]
    startDate = startDateObj[2] + '-' + startMonth + '-' + startDay;

    var endDateObj = endDate.split('/')
    var endDay = endDateObj[0]
    var endMonth = endDateObj[1]
    endDate = endDateObj[2] + '-' + endMonth + '-' + endDay;
    if (startDate >= endDate) {
      return true;
    }
    else {
      return false;
    }
  }

  ValidateFutureDate(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    // covert end date to unix time stamp
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      // covert end date to unix time stamp
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (new Date(theEndDate) < new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Expiry Date can't before effective Date" };
      }
    }
    return error;
  }

  getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Convert Name Date format i.e (01/Jan/2018) to Number Date Format 
   * @param DateString 
   */
  formatDate(DateString) {
    if (!DateString) {
      return
    }
    var monthByNameLabels = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 }
    let dateArr = DateString.split('/');
    let name = dateArr[1];
    if (DateString && DateString != '') {
      if (name == undefined) {
        return DateString
      } else {
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        var day = '' + dateArr[0],
          month = '' + monthByNameLabels[(capitalized)],
          year = dateArr[2];
        if (day.length < 2) day = '0' + day;
        if (month.length < 2) month = '0' + month;
        if (month == "undefined") {
          return DateString;
        }
        if (day == 'NaN' || month == 'NaN' || year.toString() == 'NaN') {
          return;
        } else {
          return [day, month, year].join('/');
        }
      }
    } else {
      return
    }
  }

  changeDateByMonthName(DateString) {
    DateString = DateString + "";
    if (DateString) {
      var monthLabels = { 1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec" }
      let dateArr = DateString.split('/');
      var day = '' + dateArr[0],
        month = '' + monthLabels[parseInt(dateArr[1])],
        year = dateArr[2];
      if (day.length < 2) day = '0' + day;
      if (month == "undefined") {
        return DateString;
      }
      if (day == 'NaN' || month == 'NaN' || year.toString() == 'NaN') {
        return '';
      } else {
        return [day, month, year].join('/');
      }
    } else {
      return '';
    }
  }

  // Methods for showing Date-Format which comes from backend 
  dateFormatListShow(dateCols, arrayList) {
    if (dateCols) {
      for (var i = 0; i < arrayList.length; i++) {
        for (var j = 0; j < dateCols.length; j++) {
          if (arrayList[i][dateCols[j]] != "") {
            var dateValue = this.changeDateByMonthName(arrayList[i][dateCols[j]]);

            arrayList[i][dateCols[j]] = dateValue;
          }
          this.expired = this.isFutureFormatedDate(arrayList[i][dateCols[j]])
        }
      }
    }
  }

  formatDateLetter(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    date = date.split('/');
    var day = date[0];
    var monthIndex = date[1];
    var year = date[2];
    return monthNames[monthIndex - 1] + ' ' + day + ',' + ' ' + year;
  }

  formatDatetoMonthName(date) {
    var monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    date = date.split('/');
    var day = date[0];
    var monthIndex = date[1];
    var year = date[2];
    return day + '/' + monthLabels[monthIndex - 1] + '/' + year;
  }

  formatDateObject(date) {
    return {
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }
    };
  }

  getCurrentTimestamp(date) {
    var monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    var monthIndex = date.getMonth()
    let currentMonth = monthLabels[monthIndex];
    let today = date.getDate() + '/' + currentMonth + '/' + date.getFullYear()
    let hourVal = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours()
    let minVal = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()
    let secVal = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds()
    let time = hourVal + ":" + minVal + ":" + secVal;
    let dateTime = today + ' ' + time;
    return dateTime
  }

  getCurrentMonth() {
    let date = new Date();
    var monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    var monthIndex = date.getMonth();
    return monthLabels[monthIndex];

  }

  // Log #1162: Date check applied
  compareBeforeAndAfterDate(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      var theStartDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      var theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (new Date(theEndDate) > new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Cannot Be Change Date" };
      } 
      if(new Date(theEndDate) < new Date(theStartDate)) {
        error = { isError: true, errorMessage: "Cannot Be Change Date" };
      }
    }
    return error;
  }

  // Log #1168: Default Date as per client new feedback
  getThisYear() {
    let date = new Date();
    return {
      fromDate: {
        date: {
          year: date.getFullYear(),
          month: 1,
          day: 1
        }
      },
      toDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    };
  }

  getThisMonth() {
    let date = new Date();
    return {
      fromDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: 1
        }
      },
      toDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    }
  }

  getThisWeek() {
    // Log #1168: This Week: First day of this week to today
    let today = new Date();
    let date = new Date()
    let day = date.getDay()
    let diff = date.getDate() - day + (day == 0 ? -6:1) // As discussed with Arun sir,this line gives first day of this week as Monday
    let firstDayWeek = new Date(date.setDate(diff))
    return {
      fromDate: {
        date: {
          year: firstDayWeek.getFullYear(),
          month: firstDayWeek.getMonth() + 1,
          day: firstDayWeek.getDate()
        }
      },
      toDate: {
        date: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate()
        }
      }
    };
  }

  // Log #1168: This Contract Year option added in default date as per client new feedback
  getThisContractYear(compEffDateMainUft) {
    let today = new Date()
    let month = compEffDateMainUft.date.month
    let day = 1  //[Day of effetiveOn is commented as it should be first day of month as discussed with Arun sir]
    return {
      fromDate: {
        date: {
          year: today.getFullYear(),
          month: month,
          day: day
        }
      },
      toDate: {
        date: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate()
        }
      }
    };
  }

  // Log #1168: This Last Contract Year option added in default date as per client new feedback
  getThisLastContractYear(compEffDateMainUft) {
    let today = new Date()
    let month = compEffDateMainUft.date.month
    let day = 1  //[Day should be first day of month as discussed with Arun sir]

    let getDate = new Date(today.getFullYear() + '/' + month + '/' + day)
    let oneDayAgo = getDate.setDate(getDate.getDate() - 1)
    let prevDate = new Date(oneDayAgo)
    return {
      fromDate: {
        date: {
          year: today.getFullYear() - 1,
          month: month,
          day: day
        }
      },
      toDate: {
        date: {
          year: prevDate.getFullYear(),
          month: prevDate.getMonth() + 1,
          day: prevDate.getDate()
        }
      }
    };
  }

  compareBeginEndDate(startDate, endDate) {
    var error = { isError: false, errorMessage: '' };
    if ((startDate != '' && startDate != undefined) && (endDate != '' && endDate != undefined)) {
      let theBeginDate = Math.round(this.getTimeInMilliseconds(startDate) / 1000.0)
      let theEndDate = Math.round(this.getTimeInMilliseconds(endDate) / 1000.0)
      if (theBeginDate == theEndDate) {
        error = { isError: true, errorMessage: "End Date Should Not Be Same As Begin Date!" };
      }
    }
    return error;
  }

}
