import { FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';

export class CustomValidators {

    static isValid: boolean;

    //Validation of phone Format to be used by all 
    static vaildPhoneFormat(c: FormControl): ValidationErrors {
        const phone = c.value;
        var reg = /^(?:\(\d{3}\)-|\d{3}-)\d{3}-\d{4}$/
        var isValid = true;
        const message = {
            'vaildPhone': {
                'message': 'Phone Must Be A Valid Number'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static vaildFaxFormat(c: FormControl): ValidationErrors {
        const phone = c.value;
        var reg = /^(?:\(\d{3}\)-|\d{3}-)\d{3}-\d{4}$/
        var isValid = true;
        const message = {
            'vaildPhone': {
                'message': 'Fax Must Be A Valid Number'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static vaildEmail(c: FormControl): ValidationErrors {
        const email = c.value;
        if (email) {
            var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
            var isValid = true;
            const message = {
                'vaildEmail': {
                    'message': 'Please Enter Valid Email'
                }
            };
            if (reg.test(email)) {
                isValid = true;
            }
            else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }

    static vaildUsername(c: FormControl): ValidationErrors {
        const email = c.value;
        if (email) {
            var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
            var isValid = true;
            const message = {
                'vaildEmail': {
                    'message': 'Please Enter Valid Username'
                }
            };
            if (reg.test(email)) {
                isValid = true;
            }
            else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }

    static age(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 18 && num <= 85;
        const message = {
            'age': {
                'message': 'The Age Must Be A Valid Number Between 18 And 85'
            }
        };
        return isValid ? null : message;
    }

    static vaildDate(c: FormControl): ValidationErrors {
        const date = c.value;
        var reg = /^[0-9/]*$/
        var isValid = true;
        const message = {
            'vaildDate': {
                'message': 'Should Be A Valid Date.'
            }
        };
        if (reg.test(date)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static vaildNumber(c: FormControl): ValidationErrors {
        const number = c.value;
        var reg = /^[0-9]*$/
        var isValid = true;
        const message = {
            'vaildNumber': {
                'message': 'Should Be In Numeric Form.'
            }
        };
        if (reg.test(number)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static dateMask(dateMask) {
        dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
        return dateMask;
    }

    static validPhone(c: FormControl): ValidationErrors {
        const phone = c.value;
        var reg = /^\d{10}$/
        var isValid = true;
        const message = {
            'validPhone': {
                'message': 'Phone Must Be A Valid Number Of 10 Digits'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static webMail(c: FormControl): ValidationErrors {
        const websiteAddress = c.value;
        var reg = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/
        var isValid = true;
        const message = {
            'webMail': {
                'message': 'Should Be Valid Website Address.'
            }
        };
        if (reg.test(websiteAddress)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static Alphanumric(c: FormControl): ValidationErrors {
        const address1 = c.value;
        var reg = /^[a-zA-Z0-9]+$/
        var isValid = true
        const message = {
            'address1': {
                'message': 'Please Add Valid Value'
            }
        };
        if (reg.test(address1)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static Alphabetic(c: FormControl): ValidationErrors {
        const address2 = c.value;
        var reg = /^[a-zA-Z]+$/
        var isValid = true
        const message = {
            'address2': {
                'message': 'Please Add Valid Alphabets'
            }
        };
        if (reg.test(address2)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static address1(c: FormControl): ValidationErrors {
        const address1 = c.value;
        var reg = /^[a-zA-Z0-9]+$/
        var isValid = true
        const message = {
            'address1': {
                'message': 'Please Enter Valid Address 1'
            }
        };
        if (reg.test(address1)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static address2(c: FormControl): ValidationErrors {
        const address2 = c.value;
        var reg = /^[a-zA-Z0-9]+$/
        var isValid = true
        const message = {
            'address2': {
                'message': 'Please Enter Valid Address 2'
            }
        };
        if (reg.test(address2)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static city(c: FormControl): ValidationErrors {
        const city = c.value;
        var reg = /^[a-zA-Z]+$/
        var isValid = true
        const message = {
            'city': {
                'message': 'Please Enter Valid City Name'
            }
        };
        if (reg.test(city)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }


    static country(c: FormControl): ValidationErrors {
        const country = c.value;
        var reg = /^[a-zA-Z]+$/
        var isValid = true
        const message = {
            'country': {
                'message': 'Please Enter Valid Country Name'
            }
        };
        if (reg.test(country)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static company(c: FormControl): ValidationErrors {
        const company = c.value;
        var reg = /^[a-zA-Z]+$/
        var isValid = true
        const message = {
            'company': {
                'message': 'Please Enter Valid Company Name'
            }
        };
        if (reg.test(company)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static validName(c: FormControl): ValidationErrors {
        const name = c.value;
        var reg = /^[a-zA-Z]+$/
        var isValid = true
        const message = {
            'validName': {
                'message': 'Name Should Be Alphabets'
            }
        };
        if (reg.test(name)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static termCost(c: FormControl): ValidationErrors {
        const cost = c.value;
        var reg = /^[0-9]+$/
        var isValid = true
        const message = {
            'termCost': {
                'message': 'Term Cost Should Be Numerical'
            }
        };
        if (reg.test(cost)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static postalCode(c: FormControl): ValidationErrors {
        const code = c.value;
        var reg = /^[0-9]+$/
        var isValid = true
        const message = {
            'postalCode': {
                'message': 'Postal Code Should Be Numerical'
            }
        };
        if (reg.test(code)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static refCost(c: FormControl): ValidationErrors {
        const cost = c.value;
        var reg = /^[0-9]+$/
        var isValid = true
        const message = {
            'refCost': {
                'message': 'Ref Cost Should Be Numerical'
            }
        };
        if (reg.test(cost)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static gracePeriod(c: FormControl): ValidationErrors {
        const period = c.value;
        var reg = /^[0-9]+$/
        var isValid = true
        const message = {
            'gracePeriod': {
                'message': 'Grace Period Should Be In Numerical Form'
            }
        };
        if (reg.test(period)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static vaildPhone(c: FormControl): ValidationErrors {
        const phone = c.value;
        var reg = /^\d{10}$/
        var isValid = true;
        const message = {
            'vaildPhone': {
                'message': 'Phone Must Be A Valid Number Of 10 Digits'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    //Validation od cca_line Field
    static vaildLine(c: FormControl): ValidationErrors {
        const line = c.value;
        var reg = /^[a-zA-Z0-9]{2,20}$/
        var isValid = true;
        const message = {
            'vaildLine': {
                'message': 'Should Be Only 20 Characters Exist'
            }
        };
        if (reg.test(line)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    //Validation of cca_line2 Field
    static vaildLine2(c: FormControl): ValidationErrors {
        const line2 = c.value;
        var reg = /^[a-zA-Z0-9]{2,20}$/
        var isValid = true;
        const message = {
            'vaildLine2': {
                'message': 'Should Be Only 20 Characters Exist.'
            }
        };
        if (reg.test(line2)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    //Validation of cca_fax Field
    static vaildfax(c: FormControl): ValidationErrors {
        const fax = c.value;
        var reg = /^[0-9-+() ]{10}$/
        var isValid = true;
        const message = {
            'vaildfax': {
                'message': 'Fax Must Be A Valid Number Of 10 Digits'
            }
        };
        if (reg.test(fax)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    //Validation of cca_country Field
    static vaildCountry(c: FormControl): ValidationErrors {
        const country = c.value;
        var reg = /^[a-z]+$/
        var isValid = true;
        const message = {
            'vaildCountry': {
                'message': 'Country Should Be In Characters.'
            }
        };
        if (reg.test(country)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }


    //Validation of cca_city Field
    static vaildCity(c: FormControl): ValidationErrors {
        const city = c.value;
        var reg = /^[a-zA-Z]*$/
        var isValid = true;
        const message = {
            'vaildCity': {
                'message': 'City Should Be In Characters.'
            }
        };
        if (reg.test(city)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    //Validation of cca_postalcode Field
    static vaildPoastalCode(c: FormControl): ValidationErrors {
        const PostalCode = c.value;
        var reg = /^\d{6}$/
        var isValid = true;
        const message = {
            'vaildPoastalCode': {
                'message': 'Postal Code Should Be Numeric Only.'
            }
        };
        if (reg.test(PostalCode)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    //Import Mask Module library first 
    //Use this validation in CCa_email Field
    static phoneMask(phoneMask) {
        phoneMask = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
        return phoneMask;
    }

    //Import Mask Module library first 
    //Use this validation in CCa_email Field
    static phoneMaskV1(phoneMask) {
        phoneMask = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
        return phoneMask;
    }

    //Import Mask Module library first 
    //Use this validation in CCa_email Field
    static sinMask(sinMask) {
        sinMask = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]
        return sinMask;
    }

    /**
    * @description : Validator "numbersOnly" allow user to enter only numbers in form field
    */
    static numbersOnly(c: FormControl): ValidationErrors {
        const inputFieldValue = c.value;
        var reg = /[0-9]|\./
        var isValid = true;
        const message = {
            'numbersOnly': {
                'message': 'Please Enter Numbers Only'
            }
        };
        if (reg.test(inputFieldValue)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static onlyAlphabets(c: FormControl): ValidationErrors {
        const phone = c.value;
        if(phone){
        var reg = /^[a-zA-Z\s]+$/ 
        var isValid = true;
        const message = {
            'onlyAlphabets': {
                'message': 'Should Be Alphabets Only'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
      }
    }

    // Alphanumeric Validation 
    static alphaNumeric(c: FormControl): ValidationErrors {
        const add = c.value;
        var reg = /^[a-zA-Z0-9 ]*$/
        var isValid = true
        const message = {
            'alphaNumeric': {
                'message': 'Please Enter Valid AlphaNumeric'
            }
        };
        if (reg.test(add)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /** For 684 Issue - Validation */
    static alphaNumericUpdated(c: FormControl): ValidationErrors {
        const add = c.value;
        var reg = /^[a-zA-Z0-9.-]*$/
        var isValid = true
        const message = {
            'alphaNumeric': {
                'message': 'Please Enter Valid AlphaNumeric'
            }
        };
        if (reg.test(add)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // Alphanumeric Validation 
    static alphaNumericWithoutSpace(c: FormControl): ValidationErrors {
        const add = c.value;
        var reg = /^[a-zA-Z0-9]*$/
        var isValid = true
        const message = {
            'alphaNumericWithoutSpace': {
                'message': 'Please Enter Valid AlphaNumeric'
            }
        };
        if (reg.test(add)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    //OnlyNumbers for all numeric values 
    static onlyNumbers(c: FormControl): ValidationErrors {
        const num = c.value;
        if (num) {
            var reg = /^[0-9]+$/
            var isValid = true
            const message = {
                'onlyNumbers': {
                    'message': 'Please Enter Only Number'
                }
            };
            if (reg.test(num)) {
                isValid = true;
            }
            else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }

    static range(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 0 && num <= 365;
        const message = {
            'range': {
                'message': 'Grace Period Must Be Between 0 And 365 Days'
            }
        };
        return isValid ? null : message;
    }

    // Decimal validation on Admin Rate 
    static digitWithDecimal(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]\d{0,1}(\.\d{0,2})?%?$/
        var isValid = true
        const message = {
            'digitWithDecimal': {
                'message': 'Admin Rate Should Not Be Greater Than 99.99'
            }
        };
        if (reg.test(num) && num <= 99.99) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // Decimal validation on Admin Rate 
    static digitWithDecimalCommRate(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]\d{0,1}(\.\d{0,3})?%?$/
        var isValid = true
        const message = {
            'digitWithDecimal': {
                'message': 'Commission Rate Should Not Be Greater Than 99.999'
            }
        };
        if (reg.test(num) && num <= 99.999) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // Decimal and max value validation on Commision Rate 
    static onlyDigitWithDecimal(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]\d{1}(\.\d)?%?$/
        var isValid = true
        const message = {
            'digitWithDecimal': {
                'message': 'Commission Rate Should Not Be Greater Than 99.999'
            }
        };
        if (reg.test(num) || num <= 99.999) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // Only Three Digits after decimal validation on Commision Rate 
    static onlyThreeDigisAfterDecimal(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^\d+(\.\d{0,3})?$/
        var isValid = true
        const message = {
            'digitWithDecimal': {
                'message': 'Please Enter Only Three Digits After Decimal'
            }
        };
        if (reg.test(num)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /* Decimal Validation on Standard & Adjusted Pap Amount
     * which allows 3 places after decimal By Balwinder
     * This method used for Standard Pap Amount field in Add Financial Data
     */
    static placesAfterDecimal(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]\d{0,5}(\.\d{0,3})?%?$/
        var isValid = true
        const message = {
            'placesAfterDecimal': {
                'message': ' This Field Should Not Be Greater Than 999999.999'
            }
        };
        if (reg.test(num) && num <= 999999.999) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /* Author : Pawanjeet Kaur
     * Description : Decimal Validation on Single Deductible Amount
     * That Allows 2 Digits After Decimal.
     * Use : This method is used To Validate Single Deductible Amount field in Add Plan > Plan Info Tab
     */
    static deductibleAmountWithTwoDecimals(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^\d{0,6}(\.\d{0,2})?%?$/
        var isValid = true
        const message = {
            'placesAfterDecimal': {
                'message': 'Should Be Less Than 999999.99 With Only Two Digits After Decimal'
            }
        };
        if (num != undefined && num != null && num != "") {
            if (reg.test(num) && num <= 999999.99) {
                isValid = true;
            }
            else {
                isValid = false;
            }
        }
        else {
            isValid = true;
        }
        return isValid ? null : message;
    }

    //CreditLimitMultiplier validation on Credit Limit Multiplier 
    static creditLimitMultiplier(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= -5 && num <= 5;
        const message = {
            'creditLimitMultiplier': {
                'message': 'Credit Limit Multiplier Must Be Between -5 And 5'
            }
        };
        return isValid ? null : message;
    }

    //ValidBankNo validation on Add Bank Account 
    static validBankNo(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[A-Za-z0-9][0-9A-Za-z]*$/
        var isValid = true
        const message = {
            'validBankNo': {
                'message': ' Please Enter Valid Number'
            }
        };
        if (reg.test(num) && num != 0) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    //ValidBankNo validation on Add Bank Account for Restrict the Blank Space
    static notEmpty(c: FormControl): ValidationErrors {
        const num = c.value;
        var regexp = /^\s/     //  instead of (/^\S*$/)             
        var isValid = true
        const message = {
            'notEmpty': {
                'message': 'Blank Space Not Allowed'
            }
        };
        if (regexp.test(num)) {
            isValid = false;
        } else {
            isValid = true;
        }
        return isValid ? null : message;
    }
    static AmendmentPlanEmpty(c: FormControl): ValidationErrors {
        const num = c.value;
        var regexp = /^\s/     //  instead of (/^\S*$/)             
        var isValid = true
        const message = {
            'notEmpty': {
                'message': 'Plan # is missing'
            }
        };
        if (!num || num =='') {
            isValid = false;
        } else {
            isValid = true;
        }
        return isValid ? null : message;
    }
    static ExpiryDateEmpty(c: FormControl): ValidationErrors {
        const num = c.value;
        var regexp = /^\s/     //  instead of (/^\S*$/)             
        var isValid = true
        const message = {
            'notEmpty': {
                'message': 'New Effective Date is missing'
            }
        };
        if (!num || num =='') {
            isValid = false;
        } else {
            isValid = true;
        }
        return isValid ? null : message;
    }

    //number for all numeric values By Balwinder
    static number(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]\d{0,9}(\.\d{0,9})?%?$/
        var isValid = true
        const message = {
            'number': {
                'message': 'Please Enter Only Number'
            }
        };
        if (reg.test(num)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }
 //Issue_ID 0179550 mantis
    /* AlphaNumeric with Special Character validation on all Address lines 
     It used for address field of add/edit company form By Balwinder*/
    static alphaNumericWithSpecialChar(c: FormControl): ValidationErrors {
        const flag = c.value;
        var reg = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]*$/
        var isValid = true
        const message = {
            'alphaNumericWithSpecialChar': {
                'message': 'Please Enter Valid Address'
            }
        };
        return reg ? null : message;
    }

    // Decimal validation on Commission Rate in Link Broker 
    static commissionRateTwoDecimal(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]\d{0,1}(\.\d{0,2})?%?$/
        var isValid = true
        const message = {
            'commissionRateTwoDecimal': {
                'message': 'Commission Rate should be less than 99.99'
            }
        };
        if (reg.test(num) && num <= 99.99) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static age1RangeNonTravelCompany(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 15 && num <= 28;
        const message = {
            'range': {
                'message': 'Min Value will be 15 and Max value will be 28'
            }
        };
        return isValid ? null : message;
    }

    static age1RangeTravelCompany(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 15 && num <= 28;
        const message = {
            'range': {
                'message': 'Min Value will be 15 and Max value will be 28'
            }
        };
        return isValid ? null : message;
    }

    static age2RangeNonTravelCompany(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 17 && num <= 34;
        const message = {
            'range': {
                'message': 'Min Value will be 17 and Max value will be 34'
            }
        };
        return isValid ? null : message;
    }

    static age2RangeTravelCompany(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 18 && num <= 35;
        const message = {
            'range': {
                'message': 'Min Value will be 18 and Max value will be 35'
            }
        };
        return isValid ? null : message;
    }

    //Validation of cca_postalcode Field
    static CarryForwardYears(c: FormControl): ValidationErrors {
        const yearValue = c.value;
        var reg = /^\d{1}$/
        var isValid = true;
        const message = {
            'vaildCarryForwardYear': {
                'message': 'Please Enter year only (1 or 2).'
            }
        };

        if (reg.test(yearValue) && (yearValue == 0 || yearValue == 1 || yearValue == 2)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        if (yearValue == "" || yearValue == undefined) {
            isValid = true;
        }
        return isValid ? null : message;
    }

    static ConvertAmountToDecimal(value) {
        if (value != '' && value != undefined) {
            var reg = /^-?\d+\.?\d*$/
            if (reg.test(value)) {
                value = value.toString();
                if (value.indexOf(".") > -1) {
                    value = value.slice(0, (value.indexOf(".")) + 3);
                }
                return parseFloat(value).toFixed(2);
            } else {
                return parseFloat('0').toFixed(2);
            }
        }
        else {
            return parseFloat('0').toFixed(2);
        }
    }

    /** 
     * @Author : Parveen
     * @description : This function is used to check only two decimal places after number
     */
    static onlyTwoDigisAfterDecimal(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^\d+(\.\d{0,2})?$/
        var isValid = true
        const message = {
            'onlyTwoDigisAfterDecimal': {
                'message': 'Please Enter Only 2 Decimal'
            }
        };
        if (reg.test(num)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /** 
     * @Author : Parveen
     * @description : This function is used to check only two decimal places after number
     */
    static numberWithDot(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]\d{0,50}(\.\d{0,9})?%?$/
        var isValid = true
        const message = {
            'numberWithDot': {
                'message': ' Please Enter Only Number.'
            }
        };
        if (reg.test(num)) {
            var decPart = (num + "").split(".");

            if (decPart[0].length > 8) {
                message.numberWithDot.message = "Maximum 8 Numbers Allowed without Decimal.";
                isValid = false;
            } else {

                if (decPart.length == 2 && decPart[1].length > 2) {
                    message.numberWithDot.message = "Please Enter Only Two Digits After Decimal.";
                    isValid = false;
                } else {
                    isValid = true;
                }
            }
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }


    static percValue(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num>=0 && num <= 100;
        const message = {
            'percValue': {
                'message': 'Must be a number and should not be more than 100'
            }
        };
        return isValid ? null : message;
    }

    static valueLengthBetweenTwoAndFive(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]{2,5}$/
        var isValid = true
        const message = {
            'valueLengthBetweenTwoAndFive': {
                'message': 'The length Must Be Between 2 to 5'
            }
        };
        if (reg.test(num)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static validPassword(c: FormControl): ValidationErrors {
        const password = c.value;
        var reg = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{9,16}$/
        var isValid = true;
        const message = {
            'validPassword': {
                'message': 'Password must have at least 1 uppercase/lowercase letter, number, special character, and be greater than 9 but less than 16 characters in length.'
            }
        };
        if (reg.test(password)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // taxRateRange Method for Tax Rate Of Finance Module 
    static taxRateRange(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 0 && num <= 100;
        const message = {
            'taxRateRange': {
                'message': 'Tax Rate Must Be Between 0 And 100 '
            }
        };
        return isValid ? null : message;
    }

    static rangeCode(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num >= 10 && num <= 99;
        const message = {
            'rangeCode': {
                'message': 'Code Must Be Between 10 And 99'
            }
        };
        return isValid ? null : message;
    }

    // Method used for Transaction Amount in UFT 
    static transAmount(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num != 0 && num > 0
        const message = {
            'transAmount': {
                'message': 'Transaction Amount Should Be Greater Than 0'
            }
        };
        return isValid ? null : message;
    }
    static istransAmountDebit(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num != 0 && num < 0
        const message = {
            'istransAmountDebit': {
                'message': 'Transaction Amount Should Stored as Debit (< 0)'
            }
        };
        return isValid ? null : message;
    }

    static transAmountValid(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num)
        const message = {
            'transAmount': {
                'message': 'Transaction Amount Should Not Be Greater Than Current Balance'
            }
        };
        return isValid ? null : message;
    }

    /* Aplphabets With Apostrophe & Fullstop Validation  */
    static alphabetsWithApostrophe(c: FormControl): ValidationErrors {
        const phone = c.value;
        var reg = /^[a-zA-Z\s](['.\a-zA-Z\s])+$/
        var isValid = true;
        const message = {
            'alphabetsWithApostrophe': {
                'message': 'Should Be Alphabets Only'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /* Aplphabets With Combine Characters For First Name & Last Name */
    static combinationAlphabets(c: FormControl): ValidationErrors {
        const phone = c.value;
        if (phone) {
            var reg = /^[a-zA-Z0-9\s](['\-a-zA-Z0-9\s])+$/
            var isValid = true;
            const message = {
                'combinationAlphabets': {
                    'message': "Only A-Z, - , ' , 0-9 Are Allowed"
                }
            };
            if (reg.test(phone)) {
                isValid = true;
            }
            else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }

    static phoneMaskLength(c: FormControl): ValidationErrors {
        var numb = c.value
        if (numb) {
            const message = {
                'combinationAlphabets': {
                    'message': "Should Be Of 10 Digits"
                }
            };
            var isValid = true;
            if (numb.match(/\d/g)) {
                numb = numb.match(/\d/g)
                numb = numb.join("");
                if (numb.length < 10) {
                    isValid = false;
                }
                else {
                    isValid = true;
                }
                return isValid ? null : message;
            } else {
                return null
            }
        }
    }

    static twoPlacesAfterDecimal(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg = /^[0-9]\d{0,5}(\.\d{0,2})?%?$/
        var isValid = true
        const message = {
            'placesAfterDecimal': {
                'message': ' This Field Should Not Be Greater Than 99999.99'
            }
        };
        if (reg.test(num) && num <= 99999.99) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // Method used for Transaction Amount which allow -Ve values in UFT
    static transAmountNegative(c: FormControl): ValidationErrors {
        const num = Number(c.value);
        const isValid = !isNaN(num) && num != 0 && num > 0 || num < 0
        const message = {
            'transAmount': {
                'message': 'Invalid Value'
            }
        };
        return isValid ? null : message;
    }

    // For #Issue:1227 - Client want this particular message
    static onlyNumberAllowed(c: FormControl): ValidationErrors {
        const num = c.value;
        if (num) {
            var reg = /^[0-9]+$/
            var isValid = true
            const message = {
                'onlyNumbers': {
                    'message': 'Card ID should be numeric characters only'
                }
            };
            if (reg.test(num)) {
                isValid = true;
            }
            else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }
// For #Issue:1227 - Client want this particular message
    static onlyAlphabetsAllowed(c: FormControl): ValidationErrors {
        const phone = c.value;
        if(phone){
        var reg = /^[a-zA-Z\s]+$/ 
        var isValid = true;
        const message = {
            'onlyAlphabets': {
                'message': 'First Name should be alphabetic characters only'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
      }
    }
// For #Issue:1227 - Client want this particular message
    static onlyAlphabetAllowed(c: FormControl): ValidationErrors {
        const phone = c.value;
        if(phone){
        var reg = /^[a-zA-Z\s]+$/ 
        var isValid = true;
        const message = {
            'onlyAlphabets': {
                'message': 'Last Name should be alphabetic characters only'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
      }
    }

    // Below one is to validate numbers only. "Done for Task 556 and 557" 
    static numbersOnlyValidator(c: FormControl): ValidationErrors {
        const num = c.value;
        var reg=/^[0-9]+$/ 
        var isValid = true
        const message = {
            'number': {
                'message': 'Please Enter Only Number'
            }
        };
        if (reg.test(num)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // Alphanumeric With Hyphen(-) Validation 
    static alphaNumericHyphen(c: FormControl): ValidationErrors {
        const controlVal = c.value;
        var reg = /^[a-zA-Z0-9- ]*$/
        var isValid = true
        const message = {
            'alphaNumeric': {
                'message': 'Please Enter Valid AlphaNumeric'
            }
        };
        if (reg.test(controlVal)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // Below validation created for Alphabets and Characters only.
    static numericAndCharacters(c: FormControl): ValidationErrors {
        const value = c.value;
        var reg = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~ ]*$/
        var isValid = true
        const message = {
            'alphaNumeric': {
                'message': 'Please enter numeric and characters only.'
            }
        };
        if (reg.test(value)) {
            isValid = true;
        }
        else {
            isValid = false;
        }
        return isValid ? null : message;
    }
}