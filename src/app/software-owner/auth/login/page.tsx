'use client';

import { findSoftwareOwnerByCognitoId } from '@/services/software-owner';
import BasicLogin from '@/components/shared/auth/BasicLogin';
import { signIn } from '@/lib/actions/signIn';
import { signOut } from '@/lib/actions/signOut';
import { translateError } from '@/lib/amplify_aux/error_messages';
import { SORoutes } from '@/lib/routes';
import { IAmplifyError } from '@/types/amplify';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SetStateAction, useState } from 'react';
import { z } from 'zod';
import { invalidEmailMessage } from '@/lib/validations';

const mailSchema = z.string().email();

export default function Page() {
   const [password, setPassword] = useState('');
   const [email, setEmail] = useState('');

   const [error, setError] = useState<string>();

   const router = useRouter();

   async function send(setLoading?: (value: SetStateAction<boolean>) => void) {
      setError(undefined);

      const parsing = mailSchema.safeParse(email);

      if (!parsing.success) {
         setError(invalidEmailMessage);
         return;
      }

      setLoading?.(true);

      try {
         const user = await signIn({ email: email, password });

         try {
            await findSoftwareOwnerByCognitoId(user.attributes.sub);
         } catch (error) {
            await signOut();
            if ((error as AxiosError).response?.status === 404) {
               throw Error(
                  "Debes ser del tipo 'Software Owner' para acceder a este dashboard.",
               );
            } else {
               throw Error('Sucedió un error inesperado.');
            }
         }

         router.push(SORoutes.management_clinics);
      } catch (error) {
         setLoading?.(false);
         setError(translateError(error as IAmplifyError));
      }
   }

   return (
      <div>
         <div className="relative aspect-video w-40">
            <Image
               alt="clinic logo"
               src="/agenda_ahora_logo.png"
               className="object-contain object-bottom"
               fill
            />
         </div>
         <h1 className="my-[4.5rem] text-[1.75rem] font-semibold">
            ¡Bienvenido de vuelta!
         </h1>
         <BasicLogin
            resetPasswordUrl={SORoutes.resetPassword}
            error={error}
            password={password}
            send={send}
            setPassword={setPassword}
            setUsername={setEmail}
            username={email}
         />
      </div>
   );
}
