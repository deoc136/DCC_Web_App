'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import BasicLogin from '@/components/shared/auth/BasicLogin';
import { signIn } from '@/lib/actions/signIn';
import { signOut } from '@/lib/actions/signOut';
import { translateError } from '@/lib/amplify_aux/error_messages';
import { setUser } from '@/lib/features/user/user_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import useDictionary from '@/lib/hooks/useDictionary';
import { GlobalRoute, clinicRoutes } from '@/lib/routes';
import { invalidEmailMessage } from '@/lib/validations';
import { getUserByCognitoId } from '@/services/user';
import { IAmplifyError } from '@/types/amplify';
import { User } from '@/types/user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { z } from 'zod';

interface ILoginModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   redirectRoute?: GlobalRoute;
}

const mailSchema = z.string().email();

export default function LoginModal({
   isOpen,
   setIsOpen,
   redirectRoute,
}: ILoginModal) {
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

         if (user.role === 'PATIENT') {
            redirectRoute && router.push(redirectRoute);
            router.refresh();
            setIsOpen(false);
         } else {
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
                     clinicRoutes(clinic.slug)
                        .receptionist_appointments_actives,
                  );
                  break;
            }
         }
      } catch (error) {
         setLoading?.(false);
         await signOut();
         dispatch(setUser(null));
         setError(translateError(error as IAmplifyError));
      }
   }

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="grid w-screen max-w-screen-sm gap-5 rounded-xl p-5 sm:w-[70vw] sm:p-8 md:p-16 lg:w-[60vw] xl:w-[50vw]">
               <div>
                  <h1 className="mb-4 text-xl font-semibold sm:text-[1.75rem]">
                     {dic.pages.auth.login.title}
                  </h1>
                  <h3 className="text-sm font-normal text-on-background-light sm:text-xl sm:font-semibold">
                     {dic.pages.auth.login.sub_title}
                  </h3>
               </div>
               <BasicLogin
                  resetPasswordUrl={
                     clinicRoutes(clinic.slug).clinic_resetPassword
                  }
                  error={error}
                  password={password}
                  send={send}
                  setPassword={setPassword}
                  setUsername={setEmail}
                  username={email}
                  closerButton
               />
               <Button
                  onPress={() => setIsOpen(false)}
                  variant={Variant.secondary}
               >
                  {dic.texts.flows.cancel}
               </Button>
               <h3 className="text-center text-sm font-medium text-on-background-light sm:mt-0 sm:self-end sm:text-base sm:font-semibold">
                  {dic.pages.auth.login["doesn't_have_account"]}{' '}
                  <Link
                     href={clinicRoutes(clinic.slug).register}
                     className="font-semibold text-secondary"
                  >
                     {dic.texts.flows.sign_up}
                  </Link>
               </h3>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
