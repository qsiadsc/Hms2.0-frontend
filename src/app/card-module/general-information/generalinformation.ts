export class GeneralInformation {
    company_name: string;
    employee_pin: string;     
    card_id: string;
    employment_date: string;
    companyCoKey: string;
    constructor(values: Object = {}) {
      Object.assign(this, values);  //Constructor initialization
  }
}
