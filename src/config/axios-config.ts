import { signOut } from '@/lib/actions/signOut';
import axios, { AxiosError } from 'axios';

export const apiUrl = 'https://dev.api.agendaahora.com/api';
// export const apiUrl = 'http://localhost:8080/api';

export enum Side {
   client,
   server,
}

export function applyAxiosConfig(side: Side) {
   axios.defaults.baseURL = apiUrl;
   axios.interceptors.request.use(async request => {
      let jwt = undefined;

      try {
         if (side === Side.client) {
            jwt = localStorage.getItem('authorization');
            request.headers.set('authorization', jwt);
         } else {
            request.headers.set('security_string', process.env.SECURITY_STRING);
         }
      } catch (error) {}

      return request;
   });
   axios.interceptors.response.use(
      function (response) {
         return response;
      },
      async function (error: AxiosError) {
         console.error(error);
         if (error.response?.status === 401) {
            await signOut();
         } else {
            throw error;
         }
      },
   );
}
