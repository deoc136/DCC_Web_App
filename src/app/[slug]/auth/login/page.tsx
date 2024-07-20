'use client';

import { getUserByCognitoId } from '@/services/user';
import BasicLogin from '@/components/shared/auth/BasicLogin';
import { signIn } from '@/lib/actions/signIn';
import { signOut } from '@/lib/actions/signOut';
import { translateError } from '@/lib/amplify_aux/error_messages';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { SORoutes, clinicRoutes } from '@/lib/routes';
import { IAmplifyError } from '@/types/amplify';
import { User } from '@/types/user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SetStateAction, useState } from 'react';
import { z } from 'zod';
import { invalidEmailMessage } from '@/lib/validations';
import { setUser } from '@/lib/features/user/user_slice';
import Link from 'next/link';
import useDictionary from '@/lib/hooks/useDictionary';

const mailSchema = z.string().email();

export default function Page() {
   const dic = useDictionary();

   const clinic = useAppSelector(store => store.clinic);

   const dispatch = useAppDispatch();

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
         const { attributes } = await signIn({ email, password });

         let user: User | undefined;
         try {
            user = (await getUserByCognitoId(clinic.slug, attributes.sub)).data;
         } catch (error) {
            throw Error('Tu usuario no pertenece a esta clínica.');
         }

         dispatch(setUser(user));

         switch (user.role) {
            case 'ADMINISTRATOR':
               if (clinic.administrator_id !== user.cognito_id) {
                  throw Error(
                     'No eres el administrador asignado a la clínica. Si crees que es un error comunícate con el Software Owner.',
                  );
               }
               router.push(clinicRoutes(clinic.slug).admin_home);
               break;
            case 'THERAPIST':
               router.push(
                  clinicRoutes(clinic.slug).therapist_appointments_actives,
               );
               break;
            case 'RECEPTIONIST':
               router.push(
                  clinicRoutes(clinic.slug).receptionist_appointments_actives,
               );
               break;
            case 'PATIENT':
               router.push(clinicRoutes(clinic.slug).patient_services);
               break;
         }
      } catch (error) {
         setLoading?.(false);
         await signOut();
         setError(translateError(error as IAmplifyError));
      }
   }

   return (
      <>
         <div
            className="relative -left-5 -top-5 right-5 w-[calc(100%+2.5rem)] rounded-bl-3xl bg-primary bg-waves bg-cover bg-right bg-no-repeat p-5 pr-0 pt-10
            sm:hidden"
         >
            <div className="relative aspect-video w-36">
               <Image
                  alt="clinic logo"
                  src={clinic.profile_picture_url}
                  className="object-contain object-bottom"
                  fill
               />
            </div>
         </div>
         <div className="grid pb-10 sm:h-full sm:grid-rows-auth-disposition sm:pb-0">
            <div className="relative hidden aspect-video w-40 sm:block">
               <Image
                  alt="clinic logo"
                  src={clinic.profile_picture_url}
                  className="object-contain object-bottom"
                  fill
               />
            </div>
            <div className="hidden sm:block" />
            <div className="mb-16 sm:mb-20">
               <h1 className="mb-4 text-xl font-semibold sm:text-[1.75rem]">
                  {dic.pages.auth.login.title}
               </h1>
               <h3 className="text-sm font-normal text-on-background-light sm:text-xl sm:font-semibold">
                  {dic.pages.auth.login.sub_title}
               </h3>
            </div>
            <BasicLogin
               resetPasswordUrl={clinicRoutes(clinic.slug).clinic_resetPassword}
               error={error}
               password={password}
               send={send}
               setPassword={setPassword}
               setUsername={setEmail}
               username={email}
            />
            <h3 className="mt-5 text-center text-sm font-medium text-on-background-light sm:mt-0 sm:self-end sm:text-base sm:font-semibold">
               {dic.pages.auth.login["doesn't_have_account"]}{' '}
               <Link
                  href={clinicRoutes(clinic.slug).register}
                  className="font-semibold text-secondary"
               >
                  {dic.texts.flows.sign_up}
               </Link>
            </h3>
         </div>
      </>
   );
}
