'use client';

import { Auth, Hub } from 'aws-amplify';
import axios from 'axios';
import { useEffect } from 'react';

interface IUserListener {}

export default function UserListener({}: IUserListener) {
   useEffect(() => {
      Hub.listen('auth', async () => {
         let code = '';

         try {
            const session = await Auth.currentSession();

            code = session.getAccessToken().getJwtToken();
         } catch (error) {}

         localStorage.setItem('authorization', code);

         await axios.post(
            '/api/setUpAuthorization',
            {
               code,
            },
            {
               baseURL: '',
            },
         );
      });
   }, []);

   return <>{true}</>;
}
