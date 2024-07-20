export interface Currency {
   id: number;
   name: string;
   code: string;
}

export interface NewCurrency {
   id?: number | undefined;
   name: string;
   code: string;
}

export interface CurrencyConverted {
   base_currency_code: string;
   base_currency_name: string;
   amount: string;
   updated_date: string;
   rates: Rates;
   status: string;
}

export interface Rates {
   USD: Usd;
}

export interface Usd {
   currency_name: string;
   rate: string;
   rate_for_amount: string;
}
