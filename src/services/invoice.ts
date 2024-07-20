import axios from 'axios';

export async function createInvoice(
   slug: string,
   data: {
      services_name: string;
      services_quantity: number;
      price: number;
   },
) {
   return axios.post('/invoice/create', data, {
      headers: {
         slug,
      },
   });
}

export async function refundInvoice(slug: string, id: string) {
   return axios.post(`/invoice/refund/${id}`, undefined, {
      headers: {
         slug,
      },
   });
}
