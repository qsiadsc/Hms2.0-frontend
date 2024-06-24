export class CardEligibility {
    plan: string;
    max_type: string;
    effective_date: string;     
    expiry_date: string;

    constructor(values: Object = {}) {
        Object.assign(this, values); //Constructor initialization
    }
}