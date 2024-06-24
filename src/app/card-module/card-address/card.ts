export class CardContactAddress{
    cca_line:string;
    cca_line2:string;
    cca_postalcode:number;
    cca_city:string;
    cca_province:string;
    cca_country:string;
    cca_fax:number;
    cca_phone:number;
    cca_email:string;
    cca_effectivedate:string;
    cca_expirydate:string;
    
     constructor(values: Object = {}) {
         //Constructor initialization
         Object.assign(this, values);
     }


    
}