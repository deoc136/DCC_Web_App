import { Currency, CurrencyConverted } from '@/types/currency';
import axios from 'axios';

export async function getAllCurrencies() {
   return await axios.get<Currency[]>('/currency/getAll');
}

export async function convertCurrencyToUSD(currency: string, amount: number) {
   return await axios.get<CurrencyConverted>('/api/convertCurrency', {
      baseURL: '',
      params: {
         currency,
         amount,
      },
   });
}
