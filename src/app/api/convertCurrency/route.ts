import { convertErrorIntoString } from '@/lib/utils';
import axios from 'axios';
import { NextApiRequest } from 'next';
import { z } from 'zod';

const schema = z.object({
   amount: z.number().nonnegative(),
   currency: z.string().nonempty(),
});

export type ConvertCurrencyInput = z.TypeOf<typeof schema>;

export async function GET(req: NextApiRequest) {
   const { searchParams } = new URL(req.url ?? '');

   const params = {
      amount: searchParams.get('amount')
         ? Number(searchParams.get('amount'))
         : undefined,
      currency: searchParams.get('currency'),
   };

   try {
      const parsing = schema.safeParse(params);

      if (parsing.success) {
         const { amount, currency } = parsing.data;

         const response = await axios.get('/currency/convert', {
            baseURL: 'https://currency-converter5.p.rapidapi.com',
            params: {
               format: 'json',
               from: currency,
               to: 'USD',
               amount,
            },
            headers: {
               'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
               'X-RapidAPI-Host': 'currency-converter5.p.rapidapi.com',
            },
         });

         return (Response as any).json(response.data);
      } else {
         throw JSON.parse(convertErrorIntoString(parsing));
      }
   } catch (error) {
      return (Response as any).json(
         {
            error,
         },
         { status: 400 },
      );
   }
}
